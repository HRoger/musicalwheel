/**
 * ============================================================================
 * VOXEL TIMELINE (SOCIAL FEED) WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/timeline-main.js
 * Size: 18K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Provides the main social timeline/feed functionality including:
 * - Status updates with text, media, links
 * - Like/reply/repost interactions
 * - Comment threads with pagination
 * - Media uploads and previews
 * - Link previews
 * - Real-time updates via polling
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/timeline/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3
 * - jQuery
 * - Voxel.mixins.base
 * - Voxel.components.popup/formGroup
 * - Voxel.helpers.debounce
 * - Voxel_Config.ajax_url
 *
 * CSS CLASSES:
 * - .vxfeed: Main feed container
 * - .vxf-status: Individual status/post
 * - .vxf-replies: Replies container
 * - .vxf-create-post: Post composer
 *
 * ============================================================================
 */

/**
 * DATA-CONFIG FORMAT:
 * {
 *   "mode": "user_feed" | "post_feed" | "single_status",
 *   "user_id": 123,
 *   "post_id": 456,
 *   "status_id": 789,
 *   "post_types": [...],
 *   "nonce": "abc123",
 *   "files": {
 *     "allowed_types": [...],
 *     "max_count": 10,
 *     "max_size": 5000
 *   },
 *   "reviews": { "enabled": true, "labels": {...} },
 *   "l10n": { ... }
 * }
 */

/**
 * API ENDPOINTS:
 *
 * 1. Get Feed: GET timeline.get_feed
 * 2. Create Status: POST timeline.create_status
 * 3. Update Status: POST timeline.update_status
 * 4. Delete Status: POST timeline.delete_status
 * 5. Like Status: POST timeline.like_status
 * 6. Unlike Status: POST timeline.unlike_status
 * 7. Get Replies: GET timeline.get_replies
 * 8. Reply to Status: POST timeline.reply_to_status
 * 9. Repost Status: POST timeline.repost_status
 * 10. Get Link Preview: GET timeline.get_link_preview
 */

/* ==========================================================================
   SECTION 1: MODULE WRAPPER
   ========================================================================== */

(function(factory) {
  if (typeof define === "function" && define.amd) {
    define("timelineMain", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: HELPER FUNCTIONS
     ========================================================================== */

  /**
   * Generate a sequential unique ID
   */
  var sequentialId = (function() {
    var id = 0;
    return function() {
      return ++id;
    };
  })();

  /**
   * Generate a random alphanumeric ID
   */
  function randomId(length) {
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (var i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /* ==========================================================================
     SECTION 3: FILE FIELD COMPONENT
     ========================================================================== */

  /**
   * File upload component for timeline posts
   */
  var fileField = {
    template: "#vxf-file-field",
    props: {
      field: Object,
      index: { type: Number, default: null },
      sortable: { type: Boolean, default: true }
    },
    data: function() {
      return {
        accepts: "",
        dragActive: false,
        reordering: false,
        id: "vxf-file-" + sequentialId()
      };
    },
    created: function() {
      if (this.field.value === null) {
        this.field.value = [];
      }
      if (this.field.props.allowedTypes) {
        this.accepts = Object.values(this.field.props.allowedTypes).join(", ");
      }
    },
    mounted: function() {
      var self = this;
      jQuery(this.$refs.input).on("change", function(event) {
        for (var i = 0; i < event.target.files.length; i++) {
          self.pushFile(event.target.files[i]);
        }
        self.$refs.input.value = "";
        self.$emit("files-added");
      });
    },
    unmounted: function() {
      var self = this;
      setTimeout(function() {
        if (Array.isArray(self.field.value)) {
          self.field.value.forEach(function(file) {
            if (file.source === "new_upload") {
              URL.revokeObjectURL(file.preview);
            }
          });
        }
      }, 10);
    },
    methods: {
      getStyle: function(file) {
        if (file.type.startsWith("image/")) {
          return "background-image: url('" + file.preview + "');";
        }
        return "";
      },

      pushFile: function(file) {
        if (this.field.props.maxCount === 1) {
          this.field.value = [];
        }

        var fileData = {
          source: "new_upload",
          name: file.name,
          type: file.type,
          size: file.size,
          preview: URL.createObjectURL(file),
          item: file,
          _id: randomId(8)
        };

        if (typeof window._vx_file_upload_cache === "undefined") {
          window._vx_file_upload_cache = [];
        }

        var existingFile = window._vx_file_upload_cache.find(function(cached) {
          return cached.item.name === file.name &&
                 cached.item.type === file.type &&
                 cached.item.size === file.size &&
                 cached.item.lastModified === file.lastModified;
        });

        if (existingFile) {
          this.field.value.push(existingFile);
        } else {
          this.field.value.push(fileData);
          window._vx_file_upload_cache.unshift(fileData);
        }
      },

      onDrop: function(event) {
        var self = this;
        this.dragActive = false;

        if (event.dataTransfer.items) {
          [...event.dataTransfer.items].forEach(function(item) {
            if (item.kind === "file") {
              self.pushFile(item.getAsFile());
            }
          });
        } else {
          [...event.dataTransfer.files].forEach(function(file) {
            self.pushFile(file);
          });
        }
        this.$emit("files-added");
      },

      /**
       * Prepare files for form submission
       */
      onSubmit: function(fields, formData) {
        var fieldName = "files[" + this.field.id + "][]";
        fields[this.field.key] = [];

        this.field.value.forEach(function(file) {
          if (file.source === "new_upload") {
            formData.append(fieldName, file.item);
            fields[this.field.key].push("uploaded_file");
          } else if (file.source === "existing") {
            fields[this.field.key].push(file.id);
          }
        });
      }
    }
  };

  /* ==========================================================================
     SECTION 4: STATUS COMPONENT
     ========================================================================== */

  /**
   * Individual timeline status/post component
   */
  var statusComponent = {
    template: "#vxf-status",
    props: {
      status: Object,
      feed: Object,
      isReply: { type: Boolean, default: false }
    },
    data: function() {
      return {
        activePopup: null,
        replyComposer: {
          content: "",
          files: {
            key: "files",
            id: "files",
            value: [],
            props: {
              allowedTypes: this.feed.config.files?.allowed_types || [],
              maxCount: this.feed.config.files?.max_count || 10,
              maxSize: this.feed.config.files?.max_size || 5000
            }
          }
        },
        editComposer: {
          content: this.status.content?.raw || "",
          files: {
            key: "files",
            id: "files",
            value: this.status.files ? [...this.status.files] : [],
            props: {
              allowedTypes: this.feed.config.files?.allowed_types || [],
              maxCount: this.feed.config.files?.max_count || 10,
              maxSize: this.feed.config.files?.max_size || 5000
            }
          }
        }
      };
    },
    methods: {
      /**
       * Toggle like on status
       */
      toggleLike: function() {
        var self = this;
        var wasLiked = this.status.liked_by_user;

        // Optimistic update
        this.status.liked_by_user = !wasLiked;
        this.status.like_count += wasLiked ? -1 : 1;

        var action = wasLiked ? "timeline.unlike_status" : "timeline.like_status";

        jQuery.post(Voxel_Config.ajax_url + "&action=" + action, {
          status_id: this.status.id,
          _wpnonce: this.feed.config.nonce
        }).always(function(response) {
          if (!response.success) {
            // Revert on failure
            self.status.liked_by_user = wasLiked;
            self.status.like_count += wasLiked ? 1 : -1;
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Load replies for this status
       */
      loadReplies: function() {
        var self = this;

        if (this.status.replies.loading) return;

        this.status.replies.loading = true;

        jQuery.get(Voxel_Config.ajax_url + "&action=timeline.get_replies", {
          status_id: this.status.id,
          offset: this.status.replies.list.length,
          _wpnonce: this.feed.config.nonce
        }).always(function(response) {
          self.status.replies.loading = false;

          if (response.success) {
            self.status.replies.list.push(...response.replies);
            self.status.replies.hasMore = response.has_more;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Toggle replies visibility
       */
      toggleReplies: function() {
        if (this.status.replies.visible) {
          this.status.replies.visible = false;
        } else {
          this.status.replies.visible = true;
          if (this.status.replies.list.length === 0 && this.status.reply_count > 0) {
            this.loadReplies();
          }
        }
      },

      /**
       * Submit a reply to this status
       */
      submitReply: function() {
        var self = this;
        var content = this.replyComposer.content.trim();

        if (!content && this.replyComposer.files.value.length === 0) {
          return;
        }

        var formData = new FormData();
        var fields = { content: content };

        // Add files
        this.replyComposer.files.value.forEach(function(file) {
          if (file.source === "new_upload") {
            formData.append("files[files][]", file.item);
            fields.files = fields.files || [];
            fields.files.push("uploaded_file");
          }
        });

        formData.append("fields", JSON.stringify(fields));
        formData.append("status_id", this.status.id);
        formData.append("_wpnonce", this.feed.config.nonce);

        this.status.replies.submitting = true;

        jQuery.post({
          url: Voxel_Config.ajax_url + "&action=timeline.reply_to_status",
          data: formData,
          contentType: false,
          processData: false
        }).always(function(response) {
          self.status.replies.submitting = false;

          if (response.success) {
            // Add new reply to list
            self.status.replies.list.unshift(response.reply);
            self.status.reply_count++;

            // Clear composer
            self.replyComposer.content = "";
            self.replyComposer.files.value = [];

            // Show replies if hidden
            self.status.replies.visible = true;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Delete this status
       */
      deleteStatus: function() {
        var self = this;

        if (!confirm(Voxel_Config.l10n.confirmAction)) return;

        this.status.deleting = true;
        this.$refs.actions?.blur();

        jQuery.post(Voxel_Config.ajax_url + "&action=timeline.delete_status", {
          status_id: this.status.id,
          _wpnonce: this.feed.config.nonce
        }).always(function(response) {
          self.status.deleting = false;

          if (response.success) {
            // Remove from feed
            if (self.isReply) {
              // Find parent and remove from replies
              self.$parent.status.replies.list = self.$parent.status.replies.list.filter(
                function(r) { return r.id !== self.status.id; }
              );
              self.$parent.status.reply_count--;
            } else {
              self.feed.statuses = self.feed.statuses.filter(
                function(s) { return s.id !== self.status.id; }
              );
            }
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Start editing this status
       */
      startEdit: function() {
        this.editComposer.content = this.status.content?.raw || "";
        this.editComposer.files.value = this.status.files ? [...this.status.files] : [];
        this.status.editing = true;
        this.$refs.actions?.blur();
      },

      /**
       * Cancel editing
       */
      cancelEdit: function() {
        this.status.editing = false;
      },

      /**
       * Submit edit
       */
      submitEdit: function() {
        var self = this;
        var content = this.editComposer.content.trim();

        var formData = new FormData();
        var fields = { content: content };

        // Add files
        fields.files = [];
        this.editComposer.files.value.forEach(function(file) {
          if (file.source === "new_upload") {
            formData.append("files[files][]", file.item);
            fields.files.push("uploaded_file");
          } else if (file.source === "existing") {
            fields.files.push(file.id);
          }
        });

        formData.append("fields", JSON.stringify(fields));
        formData.append("status_id", this.status.id);
        formData.append("_wpnonce", this.feed.config.nonce);

        this.status.saving = true;

        jQuery.post({
          url: Voxel_Config.ajax_url + "&action=timeline.update_status",
          data: formData,
          contentType: false,
          processData: false
        }).always(function(response) {
          self.status.saving = false;

          if (response.success) {
            // Update status with response data
            Object.assign(self.status, response.status);
            self.status.editing = false;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Repost this status
       */
      repost: function() {
        var self = this;

        if (!confirm(this.feed.config.l10n?.confirm_repost || "Repost this?")) return;

        this.status.reposting = true;

        jQuery.post(Voxel_Config.ajax_url + "&action=timeline.repost_status", {
          status_id: this.status.id,
          _wpnonce: this.feed.config.nonce
        }).always(function(response) {
          self.status.reposting = false;

          if (response.success) {
            self.status.repost_count++;
            Voxel.alert(response.message || "Reposted!", "success");
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Format timestamp for display
       */
      formatTime: function(timestamp) {
        // Relative time formatting logic
        var now = Date.now();
        var diff = now - new Date(timestamp).getTime();
        var seconds = Math.floor(diff / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        if (days > 7) {
          return new Date(timestamp).toLocaleDateString();
        } else if (days > 0) {
          return days + "d";
        } else if (hours > 0) {
          return hours + "h";
        } else if (minutes > 0) {
          return minutes + "m";
        } else {
          return "now";
        }
      }
    },
    computed: {
      /**
       * Check if current user can edit this status
       */
      canEdit: function() {
        return this.status.author?.id === this.feed.config.user_id;
      },

      /**
       * Check if current user can delete this status
       */
      canDelete: function() {
        return this.status.author?.id === this.feed.config.user_id ||
               this.feed.config.is_admin;
      }
    }
  };

  /* ==========================================================================
     SECTION 5: CREATE POST COMPONENT
     ========================================================================== */

  /**
   * Post composer component for creating new statuses
   */
  var createPostComponent = {
    template: "#vxf-create-post",
    props: {
      feed: Object
    },
    data: function() {
      return {
        expanded: false,
        content: "",
        files: {
          key: "files",
          id: "files",
          value: [],
          props: {
            allowedTypes: this.feed.config.files?.allowed_types || [],
            maxCount: this.feed.config.files?.max_count || 10,
            maxSize: this.feed.config.files?.max_size || 5000
          }
        },
        linkPreview: {
          url: null,
          loading: false,
          data: null
        },
        submitting: false,
        activePopup: null
      };
    },
    methods: {
      /**
       * Expand the composer
       */
      expand: function() {
        this.expanded = true;
        this.$nextTick(function() {
          this.$refs.textarea?.focus();
        }.bind(this));
      },

      /**
       * Collapse the composer
       */
      collapse: function() {
        if (!this.content && this.files.value.length === 0) {
          this.expanded = false;
        }
      },

      /**
       * Submit new status
       */
      submit: function() {
        var self = this;
        var content = this.content.trim();

        if (!content && this.files.value.length === 0) {
          return;
        }

        var formData = new FormData();
        var fields = { content: content };

        // Add files
        fields.files = [];
        this.files.value.forEach(function(file) {
          if (file.source === "new_upload") {
            formData.append("files[files][]", file.item);
            fields.files.push("uploaded_file");
          }
        });

        // Add link preview if present
        if (this.linkPreview.data) {
          fields.link_preview = this.linkPreview.url;
        }

        // Add post context if applicable
        if (this.feed.config.post_id) {
          fields.post_id = this.feed.config.post_id;
        }

        formData.append("fields", JSON.stringify(fields));
        formData.append("_wpnonce", this.feed.config.nonce);

        this.submitting = true;

        jQuery.post({
          url: Voxel_Config.ajax_url + "&action=timeline.create_status",
          data: formData,
          contentType: false,
          processData: false
        }).always(function(response) {
          self.submitting = false;

          if (response.success) {
            // Add new status to feed
            self.feed.statuses.unshift(response.status);

            // Clear composer
            self.content = "";
            self.files.value = [];
            self.linkPreview = { url: null, loading: false, data: null };
            self.expanded = false;

            // Clear file cache
            delete window._vx_file_upload_cache;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Detect and fetch link preview
       */
      detectLink: Voxel.helpers.debounce(function(self) {
        // URL regex
        var urlRegex = /(https?:\/\/[^\s]+)/g;
        var matches = self.content.match(urlRegex);

        if (matches && matches[0] !== self.linkPreview.url) {
          self.linkPreview.url = matches[0];
          self.linkPreview.loading = true;

          jQuery.get(Voxel_Config.ajax_url + "&action=timeline.get_link_preview", {
            url: matches[0],
            _wpnonce: self.feed.config.nonce
          }).always(function(response) {
            self.linkPreview.loading = false;

            if (response.success) {
              self.linkPreview.data = response.preview;
            } else {
              self.linkPreview.data = null;
            }
          });
        } else if (!matches) {
          self.linkPreview = { url: null, loading: false, data: null };
        }
      }, 500),

      /**
       * Remove link preview
       */
      removeLinkPreview: function() {
        this.linkPreview = { url: null, loading: false, data: null };
      }
    },
    watch: {
      content: function() {
        this.detectLink(this);
      }
    }
  };

  /* ==========================================================================
     SECTION 6: MAIN TIMELINE APP
     ========================================================================== */

  window.render_timeline = function() {
    Array.from(document.querySelectorAll(".vxfeed")).forEach(function(element) {
      if (element.__vue_app__) return;

      var config = JSON.parse(element.dataset.config);

      var app = Vue.createApp({
        el: element,
        mixins: [Voxel.mixins.base],

        data: function() {
          return {
            config: config,
            statuses: [],
            loading: true,
            loadingMore: false,
            hasMore: false,
            page: 1,
            activePopup: null
          };
        },

        created: function() {
          this.loadFeed();
        },

        methods: {
          /**
           * Load feed statuses
           */
          loadFeed: function() {
            var self = this;

            this.loading = this.page === 1;
            this.loadingMore = this.page > 1;

            var params = {
              pg: this.page,
              _wpnonce: config.nonce
            };

            // Add mode-specific params
            if (config.mode === "user_feed") {
              params.user_id = config.user_id;
            } else if (config.mode === "post_feed") {
              params.post_id = config.post_id;
            } else if (config.mode === "single_status") {
              params.status_id = config.status_id;
            }

            jQuery.get(
              Voxel_Config.ajax_url + "&action=timeline.get_feed",
              params
            ).always(function(response) {
              self.loading = false;
              self.loadingMore = false;

              if (response.success) {
                // Initialize replies structure for each status
                response.statuses.forEach(function(status) {
                  status.replies = status.replies || {
                    list: [],
                    hasMore: status.reply_count > 0,
                    loading: false,
                    visible: false,
                    submitting: false
                  };
                  status.editing = false;
                  status.saving = false;
                  status.deleting = false;
                  status.reposting = false;
                });

                self.statuses.push(...response.statuses);
                self.hasMore = response.has_more;
              } else {
                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
              }
            });
          },

          /**
           * Load more statuses
           */
          loadMore: function() {
            if (this.loadingMore || !this.hasMore) return;

            this.page++;
            this.loadFeed();
          },

          /**
           * Refresh feed (reload from page 1)
           */
          refresh: function() {
            this.statuses = [];
            this.page = 1;
            this.loadFeed();
          }
        }
      });

      // Register components
      app.component("form-popup", Voxel.components.popup);
      app.component("form-group", Voxel.components.formGroup);
      app.component("field-file", fileField);
      app.component("vxf-status", statusComponent);
      app.component("vxf-create-post", createPostComponent);

      app.mount(element);
    });
  };

  window.render_timeline();
  jQuery(document).on("voxel:markup-update", window.render_timeline);

});

/* ==========================================================================
   EDGE CASES & KEY FEATURES
   ========================================================================== */

/**
 * KEY FEATURES:
 * - Create/edit/delete statuses
 * - Like/unlike with optimistic UI
 * - Nested replies with pagination
 * - Repost functionality
 * - File attachments with drag & drop
 * - Link preview detection
 * - Multiple feed modes (user, post, single)
 *
 * EDGE CASES:
 * - Optimistic like updates with rollback
 * - File deduplication via cache
 * - Reply count sync on delete
 * - Link preview debouncing
 *
 * EVENT FLOW:
 * 1. Page load → loadFeed()
 * 2. Create status → POST create_status → prepend to list
 * 3. Like → optimistic update → POST like_status → rollback on error
 * 4. Reply → POST reply_to_status → prepend to replies
 * 5. Delete → confirm → POST delete_status → remove from list
 */
