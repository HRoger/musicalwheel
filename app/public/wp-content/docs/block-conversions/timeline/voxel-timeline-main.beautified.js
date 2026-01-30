/**
 * ============================================================================
 * VOXEL TIMELINE V2 (SOCIAL FEED) WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/timeline-main.js
 * Beautified: January 2026
 *
 * PURPOSE:
 * Provides the main social timeline/feed functionality (v2 API) including:
 * - Status updates with text, media, links, reviews
 * - Like/reply/repost/quote interactions
 * - Comment threads loaded asynchronously
 * - Media uploads and library popup
 * - Link previews with lazy loading
 * - Rich text formatting (code blocks, mentions, hashtags, bold/italic/strike)
 * - Multiple feed modes: user_feed, post_timeline, author_timeline, global_feed, single_status
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/timeline/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3
 * - jQuery
 * - Voxel.mixins.base
 * - Voxel.components.popup, formGroup
 * - Voxel.helpers.debounce, randomId, sequentialId
 * - Voxel_Config.ajax_url, l10n, is_logged_in
 * - Voxel.alert(), Voxel.prompt(), Voxel.authRequired(), Voxel.copy(), Voxel.share()
 *
 * CSS CLASSES:
 * - .vxfeed: Main feed container
 * - .vxconfig: JSON config element (hidden)
 * - .vxconfig__icons: JSON icons element (hidden)
 *
 * TEMPLATES (inline script templates):
 * - #vxfeed__feed: Main feed template
 * - #vxfeed__status: Individual status/post template
 * - #vxfeed__quoted-status: Quoted status embed template
 * - #vxfeed__file-upload: File upload field template
 * - #vxfeed__dd-list: Dropdown list template
 * - #create-post-media-popup: Media library popup template
 *
 * ============================================================================
 */

/**
 * API ENDPOINTS (via Voxel_Config.ajax_url):
 *
 * GET:
 * - timeline/v2/get_feed: Fetch feed statuses
 *   Params: page, mode, post_id, user_id, order_type, order_time, order_time_custom,
 *           filter_by, search, _loaded_review_config
 *
 * POST:
 * - timeline/v2/status.delete: Delete a status
 *   Params: status_id, _wpnonce
 *
 * - timeline/v2/status.like: Like/unlike a status
 *   Params: status_id, _wpnonce
 *
 * - timeline/v2/status.repost: Repost/unrepost a status
 *   Params: status_id, _wpnonce
 *
 * - timeline/v2/status.remove_link_preview: Remove link preview from status
 *   Params: status_id, _wpnonce
 *
 * - timeline/v2/status.mark_approved: Mark status as approved (moderation)
 *   Params: status_id, _wpnonce
 *
 * - timeline/v2/status.mark_pending: Mark status as pending (moderation)
 *   Params: status_id, _wpnonce
 *
 * - list_media: List media library items
 *   Params: offset, search (optional)
 */

/* ==========================================================================
   SECTION 1: MODULE WRAPPER (UMD Pattern)
   ========================================================================== */

(function(factory) {
  // AMD module support
  if (typeof define === "function" && define.amd) {
    define("timelineMain", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: STATUS FEED COMPONENT (Main Feed)
     Template: #vxfeed__feed
     ========================================================================== */

  /**
   * Main feed component that handles:
   * - Fetching and displaying statuses
   * - Pagination (infinite scroll)
   * - Search functionality
   * - Ordering options
   * - Filter by (all, posts, reviews, etc.)
   * - Single status mode
   */
  var statusFeedComponent = {
    template: "#vxfeed__feed",

    data: function() {
      return {
        page: 1,
        loading: true,
        hasMore: false,
        list: [],                    // Array of status objects
        search: {
          query: this.$root.config.settings.search.default_query
        },
        orderBy: {
          showList: false,           // Dropdown visibility
          active: null               // Currently selected ordering option
        },
        filterBy: {
          showList: false,           // Dropdown visibility
          active: "all"              // Currently selected filter
        },
        isSingle: false,             // Single status display mode
        showFilters: false           // Whether to show filter controls
      };
    },

    created: function() {
      this.config = this.$root.config;

      // Set default ordering option if available
      if (this.config.settings.ordering_options.length) {
        this.orderBy.active = this.config.settings.ordering_options[0];
      }

      // Check if displaying single status or reply
      if (this.config.single_status_id !== null || this.config.single_reply_id !== null) {
        this.isSingle = true;
        this.getActiveStatus();
      } else {
        this.getFeed();
      }

      // Show filters if search query exists
      if (this.search.query) {
        this.showFilters = true;
      }
    },

    methods: {
      /**
       * Fetch feed statuses from server
       * @param {Object} options - Optional settings (autoloadNext)
       */
      getFeed: function(options) {
        options = options || {};
        var self = this;
        this.loading = true;

        jQuery.get(Voxel_Config.ajax_url + "&action=timeline/v2/get_feed", {
          page: this.page,
          mode: this.config.timeline.mode,
          post_id: this.config.current_post.id,
          user_id: this.config.current_author.id,
          order_type: this.orderBy.active?.order || "latest",
          order_time: this.orderBy.active?.time || "all_time",
          order_time_custom: this.orderBy.active?.time_custom || null,
          filter_by: this.filterBy.active,
          search: this.search.query,
          _loaded_review_config: JSON.stringify(Object.keys(this.config.reviews))
        }).always(function(response) {
          if (response.success) {
            // Append new statuses to list
            self.list.push(...response.data);
            self.hasMore = response.has_more;

            // Auto-load more for user_feed if initial load is small
            if (self.config.timeline.mode === "user_feed" &&
                self.hasMore &&
                response.data.length < 6 &&
                options.autoloadNext !== false) {
              self.page++;
              self.getFeed({ autoloadNext: false });
            }

            // Show filters if we have content
            if (self.list.length) {
              self.showFilters = true;
            }

            // Merge any new review config from response
            if (response.meta && response.meta.review_config) {
              Object.keys(response.meta.review_config).forEach(function(key) {
                self.config.reviews[key] = response.meta.review_config[key];
              });
            }
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
          self.loading = false;
        });
      },

      /**
       * Fetch single status (for permalink pages)
       */
      getActiveStatus: function() {
        var self = this;
        this.loading = true;

        jQuery.get(Voxel_Config.ajax_url + "&action=timeline/v2/get_feed", {
          mode: "single_status",
          status_id: this.config.single_status_id,
          reply_id: this.config.single_reply_id,
          order_type: "latest",
          order_time: "all_time",
          _loaded_review_config: JSON.stringify(Object.keys(this.config.reviews))
        }).always(function(response) {
          self.loading = false;

          if (response.success) {
            self.list = [...response.data];
            self.hasMore = false;

            // Merge review config
            if (response.meta && response.meta.review_config) {
              Object.keys(response.meta.review_config).forEach(function(key) {
                self.config.reviews[key] = response.meta.review_config[key];
              });
            }
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Load more statuses (pagination)
       */
      loadMore: function() {
        this.page++;
        this.getFeed();
      },

      /**
       * Handle search input with debounced reload
       * @param {Event} event - Input event
       */
      runSearch: function(event) {
        var value = event.target.value;
        if (value.trim() !== this.search.query) {
          this.search.query = value.trim();
          this.page = 1;
          this.list = [];
          this.getFeed();
        }
      },

      /**
       * Change ordering option
       * @param {Object} option - Selected ordering option
       */
      setActiveOrder: function(option) {
        this.orderBy.showList = false;
        if (option._id !== this.orderBy.active._id) {
          this.page = 1;
          this.list = [];
          this.orderBy.active = option;
          this.getFeed();
        }
      },

      /**
       * Change filter option
       * @param {string} filter - Selected filter value
       */
      setActiveFilter: function(filter) {
        this.filterBy.showList = false;
        if (filter !== this.filterBy.active) {
          this.page = 1;
          this.list = [];
          this.filterBy.active = filter;
          this.getFeed();
        }
      },

      /**
       * Handle new status published from composer
       * @param {Object} status - Newly created status object
       */
      onPublish: function(status) {
        this.list.unshift(status);
        this.$refs.composer.isFocused = false;
      },

      /**
       * Handle quote post creation
       * @param {Object} status - The quote post status
       */
      onQuote: function(status) {
        if (this.isSingle) return;

        var config = this.$root.config;
        var mode = config.timeline.mode;

        if (mode === "post_timeline") {
          // Only add if publisher is the current post
          if (status.publisher.type === "post" && status.publisher.id === config.current_post.id) {
            this.list.unshift(status);
          }
        } else if (mode === "author_timeline") {
          // Only add if publisher is the current author
          if (status.publisher.type === "user" && status.publisher.id === config.current_author.id) {
            this.list.unshift(status);
          }
        } else if (mode === "user_feed" || mode === "global_feed") {
          // Add if current user is the publisher
          if (status.publisher.type === "user" && status.publisher.id === config.current_user.id) {
            this.list.unshift(status);
          }
        }
      },

      /**
       * Handle repost action (placeholder for future use)
       * @param {Object} status - The reposted status
       */
      onRepost: function(status) {
        // Currently empty - may be used for real-time updates
      }
    }
  };

  /* ==========================================================================
     SECTION 3: STATUS SINGLE COMPONENT (Individual Status/Post)
     Template: #vxfeed__status
     ========================================================================== */

  /**
   * Individual status component that handles:
   * - Status display with content, media, link preview
   * - Like/repost/quote/share actions
   * - Comments (lazy loaded)
   * - Edit/delete functionality
   * - Review display (for review-type statuses)
   * - Quoted status embeds
   */
  var statusSingleComponent = {
    template: "#vxfeed__status",
    emits: ["update", "delete", "quote", "repost"],

    /* --------------------------------------------------------------------
       QUOTED STATUS SUB-COMPONENT
       Template: #vxfeed__quoted-status
       -------------------------------------------------------------------- */
    components: {
      "quoted-status": {
        template: "#vxfeed__quoted-status",
        props: {
          quoteOf: Object
        },
        computed: {
          /**
           * Get highlighted content with formatting
           */
          highlightedContent: function() {
            return this.$root.highlightContent(this.quoteOf.content);
          },

          /**
           * Get truncated content for display
           */
          truncatedContent: function() {
            return this.$root.truncate(
              this.highlightedContent,
              this.$root.config.settings.quotes.truncate_at
            );
          },

          /**
           * Build title details string (username, post, timestamp)
           */
          titleDetails: function() {
            var parts = [];

            if (this.quoteOf.publisher.username) {
              parts.push("@" + this.quoteOf.publisher.username);
            }
            if (this.quoteOf.post) {
              parts.push(this.quoteOf.post.title);
            }
            parts.push(this.quoteOf.created_at);

            return parts.join(" · ");
          },

          /**
           * Get review data with rating level
           */
          review: function() {
            var reviewData = this.quoteOf.review;
            if (!reviewData) return null;

            var result = {
              config: this.$root.config.reviews[reviewData.post_type]
            };

            // Find matching rating level
            result.level = result.config.rating_levels.find(function(level) {
              return reviewData.score >= level.score - 0.5 &&
                     reviewData.score < level.score + 0.5;
            });

            return result;
          }
        }
      }
    },

    props: {
      status: Object,
      repostedBy: {
        type: Object,
        default: null
      },
      feedRef: {
        type: Object,
        default: null
      }
    },

    data: function() {
      return {
        screen: null,                    // Current screen state (null, 'deleted', 'edit', etc.)
        showActions: false,              // Actions dropdown visibility
        showRepost: false,               // Repost options visibility
        showQuoteBox: false,             // Quote composer visibility
        showComments: false,             // Comments section visibility
        readMore: false,                 // Read more expanded state
        linkPreview: {
          image: this.$root.config.settings.link_preview.default_image
        },
        commentFeed: {
          ready: false                   // Whether comment feed is loaded
        },
        showActiveComment: this.feedRef?.isSingle && this.$root.config.single_reply_id !== null,
        state: {
          liking: false,                 // Like action in progress
          reposting: false,              // Repost action in progress
          deleting: false                // Delete action in progress
        }
      };
    },

    created: function() {
      var self = this;
      var currentUser = this.$root.config.current_user;

      // Listen for like events from other instances of this status
      document.addEventListener(
        "voxel/tl/status/" + this.status.id + "/like",
        function(event) {
          if (event.detail.action === "unlike") {
            self.status.likes.count--;
            self.status.current_user.has_liked = false;
            // Remove current user from last3 likes
            self.status.likes.last3 = self.status.likes.last3.filter(function(like) {
              return !(like.type === "user" && like.id === currentUser.id);
            });
          } else {
            self.status.likes.count += 1;
            self.status.current_user.has_liked = true;
            // Add current user to last3 likes
            self.status.likes.last3.unshift({
              id: currentUser.id,
              type: "user",
              display_name: currentUser.display_name,
              link: currentUser.link,
              avatar_url: currentUser.avatar_url
            });
            self.status.likes.last3 = self.status.likes.last3.slice(0, 3);
          }
        }
      );

      // Listen for repost events
      document.addEventListener(
        "voxel/tl/status/" + this.status.id + "/repost",
        function(event) {
          self.status.current_user.has_reposted = (event.detail.action === "repost");
        }
      );

      // Auto-show comments in single status mode
      if (this.feedRef?.isSingle) {
        this.showComments = true;
      }
    },

    mounted: function() {
      var self = this;

      // Lazy load link preview image when status enters viewport
      this.$nextTick(function() {
        var observer = new IntersectionObserver(
          function(entries, obs) {
            entries.forEach(function(entry) {
              if (entry.isIntersecting) {
                self.onFirstViewportEnter();
                obs.disconnect();
              }
            });
          },
          { root: null, threshold: 0 }
        );

        observer.observe(self.$refs.wrapper);
      });
    },

    methods: {
      /**
       * Called when status first enters viewport
       * Loads link preview image lazily
       */
      onFirstViewportEnter: function() {
        var self = this;

        if (this.status.link_preview?.image) {
          var img = new Image();
          img.src = this.status.link_preview.image;
          img.onload = function() {
            self.linkPreview.image = self.status.link_preview.image;
          };
        }
      },

      /**
       * Handle status update (from edit screen)
       * @param {Object} updatedStatus - Updated status data
       */
      onUpdate: function(updatedStatus) {
        this.screen = null;
        this.$emit("update", updatedStatus);
      },

      /**
       * Delete the status with confirmation
       */
      deleteStatus: function() {
        var self = this;

        var doDelete = function() {
          self.state.deleting = true;

          jQuery.post(
            Voxel_Config.ajax_url + "&action=timeline/v2/status.delete",
            {
              status_id: self.status.id,
              _wpnonce: self.$root.config.nonce
            }
          ).always(function(response) {
            self.state.deleting = false;

            if (response.success) {
              Voxel.alert(response.message, "success", null, 3000);
              self.$emit("delete");
              self.screen = "deleted";
            } else {
              Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
            }
          });
        };

        // Show confirmation prompt
        Voxel.prompt(
          Voxel_Config.l10n.confirmAction,
          "warning",
          [
            {
              label: Voxel_Config.l10n.yes,
              onClick: function() { doDelete(); }
            },
            {
              label: Voxel_Config.l10n.no,
              onClick: function() {}
            }
          ],
          7500
        );
      },

      /**
       * Toggle like on status (with optimistic UI)
       */
      likeStatus: function() {
        var self = this;

        // Require login
        if (!Voxel_Config.is_logged_in) {
          return Voxel.authRequired();
        }

        // Determine action
        var action = this.status.current_user.has_liked ? "unlike" : "like";

        // Dispatch event for optimistic UI update across all instances
        document.dispatchEvent(new CustomEvent(
          "voxel/tl/status/" + this.status.id + "/like",
          { detail: { action: action } }
        ));

        this.state.liking = true;

        jQuery.post(
          Voxel_Config.ajax_url + "&action=timeline/v2/status.like",
          {
            status_id: this.status.id,
            _wpnonce: this.$root.config.nonce
          }
        ).always(function(response) {
          self.state.liking = false;

          if (!response.success) {
            // Revert optimistic update on failure
            var revertAction = (action === "unlike") ? "like" : "unlike";
            document.dispatchEvent(new CustomEvent(
              "voxel/tl/status/" + self.status.id + "/like",
              { detail: { action: revertAction } }
            ));
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Repost/unrepost status with optimistic UI
       */
      repostStatus: function() {
        var self = this;

        // Require login
        if (!Voxel_Config.is_logged_in) {
          return Voxel.authRequired();
        }

        // Determine action
        var action = this.status.current_user.has_reposted ? "unrepost" : "repost";

        // Dispatch event for optimistic UI
        document.dispatchEvent(new CustomEvent(
          "voxel/tl/status/" + this.status.id + "/repost",
          { detail: { action: action } }
        ));

        this.state.reposting = true;

        jQuery.post(
          Voxel_Config.ajax_url + "&action=timeline/v2/status.repost",
          {
            status_id: this.status.id,
            _wpnonce: this.$root.config.nonce
          }
        ).always(function(response) {
          self.state.reposting = false;

          if (response.success) {
            // Emit repost event if action was repost
            if (response.action === "repost") {
              self.$emit("repost", response.status);
            }
            Voxel.alert(response.message, "success", null, 3000);
          } else {
            // Revert optimistic update
            var revertAction = (action === "unrepost") ? "repost" : "unrepost";
            document.dispatchEvent(new CustomEvent(
              "voxel/tl/status/" + self.status.id + "/repost",
              { detail: { action: revertAction } }
            ));
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Open quote composer
       */
      quoteStatus: function() {
        if (!Voxel_Config.is_logged_in) {
          return Voxel.authRequired();
        }
        this.showQuoteBox = true;
      },

      /**
       * Handle quote published
       * @param {Object} status - The newly created quote status
       */
      onQuotePublish: function(status) {
        this.$refs.quoter.reset();
        this.showQuoteBox = false;
        this.$emit("quote", status);
      },

      /**
       * Toggle reply/comment composer
       */
      writeReply: function() {
        var self = this;

        if (!Voxel_Config.is_logged_in) {
          return Voxel.authRequired();
        }

        if (this.showComments) {
          this.showComments = false;
        } else {
          this.showComments = true;

          var focusComposer = function() {
            self.$nextTick(function() {
              self.$refs.commentFeed.$refs.composer.focus();
            });
          };

          if (this.commentFeed.ready) {
            focusComposer();
          } else {
            // Wait for comment feed to be ready
            var unwatch = this.$watch("commentFeed.ready", function() {
              focusComposer();
              unwatch();
            });
          }
        }
      },

      /**
       * Copy status link to clipboard
       */
      copyLink: function() {
        Voxel.copy(this.status.link);
        this.showActions = false;
      },

      /**
       * Open native share dialog
       */
      share: function() {
        Voxel.share({ url: this.status.link });
        this.showActions = false;
      },

      /**
       * Remove link preview from status
       */
      removeLinkPreview: function() {
        this.status.link_preview = null;
        this.showActions = false;

        jQuery.post(
          Voxel_Config.ajax_url + "&action=timeline/v2/status.remove_link_preview",
          {
            status_id: this.status.id,
            _wpnonce: this.$root.config.nonce
          }
        );
      },

      /**
       * Mark status as approved (moderation)
       */
      markApproved: function() {
        var self = this;
        this.showActions = false;

        jQuery.post(
          Voxel_Config.ajax_url + "&action=timeline/v2/status.mark_approved",
          {
            status_id: this.status.id,
            _wpnonce: this.$root.config.nonce
          }
        ).always(function(response) {
          if (response.success) {
            self.status.is_pending = false;
            self.status.badges = response.badges;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Mark status as pending (moderation)
       */
      markPending: function() {
        var self = this;
        this.showActions = false;

        jQuery.post(
          Voxel_Config.ajax_url + "&action=timeline/v2/status.mark_pending",
          {
            status_id: this.status.id,
            _wpnonce: this.$root.config.nonce
          }
        ).always(function(response) {
          if (response.success) {
            self.status.is_pending = true;
            self.status.badges = response.badges;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      }
    },

    computed: {
      /**
       * Get highlighted content with formatting applied
       */
      highlightedContent: function() {
        return this.$root.highlightContent(this.status.content, {
          linkPreview: this.status.link_preview
        });
      },

      /**
       * Get truncated content for display
       */
      truncatedContent: function() {
        return this.$root.truncate(
          this.highlightedContent,
          this.$root.config.settings.posts.truncate_at
        );
      },

      /**
       * Get review data with rating level and categories
       */
      review: function() {
        var reviewData = this.status.review;
        if (!reviewData) return null;

        var self = this;
        var result = {
          config: this.$root.config.reviews[reviewData.post_type]
        };

        // Helper to find rating level for a score
        var findLevel = function(score) {
          return result.config.rating_levels.find(function(level) {
            return score >= level.score - 0.5 && score < level.score + 0.5;
          });
        };

        result.level = findLevel(reviewData.score);
        result.categories = [];

        // Process rating categories
        Object.keys(reviewData.rating).forEach(function(key) {
          var score = reviewData.rating[key];
          var categoryConfig = result.config.categories.find(function(cat) {
            return cat.key === key;
          });

          if (typeof score === "number" && categoryConfig) {
            result.categories.push({
              key: categoryConfig.key,
              label: categoryConfig.label,
              score: score,
              level: findLevel(score)
            });
          }
        });

        return result;
      },

      /**
       * Whether to show post link (for cross-post context)
       */
      showPostLink: function() {
        if (!this.status.post) return false;

        var validFeeds = ["post_wall", "post_reviews"];
        var validModes = ["user_feed", "global_feed", "author_timeline", "single_status"];

        return validFeeds.includes(this.status.feed) &&
               validModes.includes(this.$root.config.timeline.mode);
      }
    }
  };

  /* ==========================================================================
     SECTION 4: FILE UPLOAD COMPONENT
     Template: #vx-file-upload (note: different from #vxfeed__file-upload)
     ========================================================================== */

  /**
   * File upload component for status composer
   * Handles drag & drop, file selection, and media library integration
   */
  var fileUploadComponent = {
    template: "#vx-file-upload",

    props: {
      field: Object,
      sortable: {
        type: Boolean,
        default: true
      },
      allowedFileTypes: String,
      maxFileCount: {
        type: Number,
        default: 1
      },
      modelValue: Array,
      context: Object
    },

    emits: ["update:modelValue"],

    data: function() {
      return {
        dragActive: false,
        reordering: false,
        value: this.modelValue,
        id: "file-upload-" + Voxel.helpers.sequentialId()
      };
    },

    mounted: function() {
      var self = this;

      // Handle file input change
      jQuery(this.$refs.input).on("change", function(event) {
        for (var i = 0; i < event.target.files.length; i++) {
          self.pushFile(event.target.files[i]);
        }
        self.$refs.input.value = "";
        self.update();
      });
    },

    unmounted: function() {
      var self = this;

      // Cleanup object URLs after unmount
      setTimeout(function() {
        if (Array.isArray(self.value)) {
          self.value.forEach(function(file) {
            if (file.source === "new_upload") {
              URL.revokeObjectURL(file.preview);
            }
          });
        }
      }, 10);
    },

    methods: {
      /**
       * Get background style for file preview
       * @param {Object} file - File object
       * @returns {string} CSS style string
       */
      getStyle: function(file) {
        if (file.type.startsWith("image/")) {
          return "background-image: url('" + file.preview + "');";
        }
        return "";
      },

      /**
       * Add file to the upload queue
       * @param {File} file - File to add
       */
      pushFile: function(file) {
        // Clear existing if single file mode
        if (this.maxFileCount === 1) {
          this.value = [];
        }

        var fileData = {
          source: "new_upload",
          name: file.name,
          type: file.type,
          size: file.size,
          preview: URL.createObjectURL(file),
          item: file,
          _id: Voxel.helpers.randomId(8)
        };

        // Initialize global file cache if needed
        if (typeof window._vx_file_upload_cache === "undefined") {
          window._vx_file_upload_cache = [];
        }

        // Check for existing cached file (deduplication)
        var existingFile = window._vx_file_upload_cache.find(function(cached) {
          return cached.item.name === file.name &&
                 cached.item.type === file.type &&
                 cached.item.size === file.size &&
                 cached.item.lastModified === file.lastModified;
        });

        if (existingFile) {
          this.value.push(existingFile);
        } else {
          this.value.push(fileData);
          window._vx_file_upload_cache.unshift(fileData);
        }
      },

      /**
       * Handle file drop event
       * @param {DragEvent} event - Drop event
       */
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

        this.update();
      },

      /**
       * Handle save from media popup
       * @param {Object} selectedFiles - Selected files from media popup
       */
      onMediaPopupSave: function(selectedFiles) {
        // Clear if single file mode
        if (this.maxFileCount === 1) {
          this.value = [];
        }

        // Track already added files
        var existingIds = {};
        this.value.forEach(function(file) {
          if (file.source === "existing") {
            existingIds[file.id] = true;
          }
          if (file.source === "new_upload") {
            existingIds[file._id] = true;
          }
        });

        // Add new files from popup
        Object.values(selectedFiles).forEach(function(file) {
          if (file.source === "existing" && !existingIds[file.id]) {
            this.value.push(file);
          }
          if (file.source === "new_upload" && !existingIds[file._id]) {
            this.value.push(file);
          }
        }.bind(this));

        this.update();
      },

      /**
       * Emit updated value
       */
      update: function() {
        this.$emit("update:modelValue", this.value);
      }
    },

    watch: {
      modelValue: function(newValue) {
        this.value = newValue;
      }
    }
  };

  /* ==========================================================================
     SECTION 5: MEDIA POPUP COMPONENT
     Template: #create-post-media-popup
     ========================================================================== */

  /**
   * Media library popup for selecting existing media files
   * Features:
   * - Browse uploaded media
   * - Search functionality
   * - Session files (files uploaded in current session)
   * - Pagination (load more)
   */
  var mediaPopupComponent = {
    template: "#create-post-media-popup",

    props: {
      multiple: {
        type: Boolean,
        default: true
      },
      ignore: {
        type: Array,
        default: function() { return []; }
      },
      customTarget: [Object, String],
      saveLabel: String
    },

    emits: ["save", "blur", "open"],

    data: function() {
      return {
        files: [],
        selected: {},
        active: false,
        loading: true,
        has_more: false,
        firstLoad: true,
        search: {
          term: "",
          offset: 0,
          loading: false,
          loading_more: false,
          has_more: false,
          list: null
        }
      };
    },

    methods: {
      /**
       * Get background style for file preview
       * @param {Object} file - File object
       * @returns {string} CSS style string
       */
      getStyle: function(file) {
        if (file.type.startsWith("image/")) {
          return "background-image: url('" + file.preview + "');";
        }
        return "";
      },

      /**
       * Toggle file selection
       * @param {Object} file - Media file object
       */
      selectFile: function(file) {
        if (this.selected[file.id]) {
          delete this.selected[file.id];
        } else {
          if (!this.multiple) {
            this.selected = {};
          }
          this.selected[file.id] = file;
        }
      },

      /**
       * Toggle session file selection
       * @param {Object} file - Session file object (has _id)
       */
      selectSessionFile: function(file) {
        if (this.selected[file._id]) {
          delete this.selected[file._id];
        } else {
          if (!this.multiple) {
            this.selected = {};
          }
          this.selected[file._id] = file;
        }
      },

      /**
       * Load media files from server
       */
      loadMedia: function() {
        var self = this;

        jQuery.get(Voxel_Config.ajax_url + "&action=list_media", {
          offset: this.files.length
        }).always(function(response) {
          self.loading = false;

          if (response.success) {
            self.files.push(...response.data);
            self.has_more = response.has_more;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      },

      /**
       * Load more media files
       */
      loadMore: function() {
        this.loading = true;
        this.loadMedia();
      },

      /**
       * Open the media library popup
       */
      openLibrary: function() {
        this.$emit("open");

        // Load media on first open
        if (this.firstLoad) {
          this.loadMedia();
        }
        this.firstLoad = false;

        this.active = !this.active;
      },

      /**
       * Check if file is an image
       * @param {Object} file - File object
       * @returns {boolean}
       */
      isImage: function(file) {
        return file.type.startsWith("image/");
      },

      /**
       * Save selection and close popup
       */
      save: function() {
        this.active = false;
        this.$emit("save", this.selected);
        this.selected = {};
      },

      /**
       * Clear selection
       */
      clear: function() {
        this.selected = {};
      },

      /**
       * Client-side search through loaded files
       */
      clientSearchFiles: function() {
        var term = this.search.term.trim().toLowerCase();
        var results = [];
        var foundEnough = false;

        this.files.forEach(function(file) {
          if (foundEnough) return;

          if (file.name.toLowerCase().indexOf(term) !== -1) {
            results.push(file);
            if (results.length >= 10) {
              foundEnough = true;
            }
          }
        });

        this.search.list = results;
        this.search.loading = false;
        this.search.has_more = false;
        this.search.loading_more = false;
      },

      /**
       * Server-side search for files (debounced)
       */
      serverSearchFiles: Voxel.helpers.debounce(function(self, loadMore) {
        loadMore = loadMore || false;

        jQuery.get(Voxel_Config.ajax_url + "&action=list_media", {
          offset: loadMore ? self.search.list.length : 0,
          search: self.search.term.trim()
        }).always(function(response) {
          self.search.loading = false;
          self.search.loading_more = false;

          if (response.success) {
            if (loadMore) {
              self.search.list.push(...response.data);
            } else {
              self.search.list = response.data;
            }
            self.search.has_more = response.has_more;
          } else {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }
        });
      }),

      /**
       * Get session files from global cache
       * @returns {Array} Session file objects
       */
      sessionFiles: function() {
        if (!Array.isArray(window._vx_file_upload_cache)) {
          window._vx_file_upload_cache = [];
        }
        return window._vx_file_upload_cache.reverse();
      }
    },

    watch: {
      /**
       * Watch search term and trigger search
       */
      "search.term": function() {
        if (this.search.term.trim() && this.files) {
          this.search.loading = true;

          // Use client-side search if all files loaded or short search term
          if (!this.has_more || this.search.term.trim().length <= 2) {
            this.clientSearchFiles();
          } else {
            this.serverSearchFiles(this);
          }
        }
      }
    }
  };

  /* ==========================================================================
     SECTION 6: MAIN APPLICATION INITIALIZATION
     Mounts Vue app to .vxfeed elements
     ========================================================================== */

  /**
   * Initialize and render timeline v2 apps
   * Called on page load and after markup updates
   */
  window.render_timeline_v2 = function() {
    Array.from(document.querySelectorAll(".vxfeed")).forEach(function(element) {
      // Skip if already mounted or has no-render class
      if (element.__vue_app__ || element.classList.contains("no-render")) {
        return;
      }

      var config, icons;

      try {
        // Parse config from sibling elements
        config = JSON.parse(
          element.closest(".elementor-element").querySelector(".vxconfig").innerHTML
        );
        icons = JSON.parse(
          element.closest(".elementor-element").querySelector(".vxconfig__icons").innerHTML
        );
      } catch (error) {
        console.log(error.message);
        return;
      }

      // Initialize global caches
      if (typeof window._vx_feed_cache !== "object") {
        window._vx_feed_cache = {};
      }
      if (typeof window._vx_mentions_cache !== "object") {
        window._vx_mentions_cache = {};
      }

      /* ------------------------------------------------------------------
         CREATE VUE APP INSTANCE
         ------------------------------------------------------------------ */

      var app = (function(element, config) {
        // Create textarea element for HTML escaping
        var escapeTextarea = document.createElement("textarea");

        return Vue.createApp({
          el: element,
          mixins: [Voxel.mixins.base],

          data: function() {
            return {
              commentFeeds: {}    // Cache for loaded comment feeds
            };
          },

          created: function() {
            // Regular expressions for content highlighting
            this.RG_CODE_BLOCK = /^```([A-Za-z0-9._-]{0,24})\r?\n([\s\S]*?)\r?\n```$/gm;
            this.RG_INLINE_CODE = /(^|\s)`(\S(?:.*?\S)?)`/g;
            this.RG_USERNAME = /(^|\s)(@[A-Za-z0-9._·@-]{1,63})/g;
            this.RG_HASHTAG = /(^|\s)(#[\p{L}\p{N}\p{M}\p{S}_\.]{1,63})/gu;
            this.RG_REGULAR_LINK = /\bhttps?:\/\/\S+/gi;
            this.RG_TEXT_BOLD = /(^|\s)\*(\S(?:.*?\S)?)\*/g;
            this.RG_TEXT_ITALIC = /(^|\s)\_(\S(?:.*?\S)?)\_/g;
            this.RG_TEXT_STRIKETHROUGH = /(^|\s)\~(\S(?:.*?\S)?)\~/g;

            this.config = config;
            this.l10n = config.l10n;
          },

          methods: {
            /**
             * Escape HTML entities in string
             * @param {string} str - String to escape
             * @returns {string} Escaped string
             */
            escapeHTML: function(str) {
              escapeTextarea.textContent = str;
              return escapeTextarea.innerHTML;
            },

            /**
             * Truncate HTML content to character limit
             * @param {string} content - HTML content
             * @param {number} limit - Character limit (default 256)
             * @returns {Object} { content: string, exists: boolean }
             */
            truncate: function(content, limit) {
              limit = limit || 256;

              var container = document.createElement("div");
              container.innerHTML = content;

              var charCount = limit;
              var truncated = false;
              var currentCount = 0;

              var processNode = function(node) {
                if (truncated) {
                  node.remove();
                  return;
                }

                var children = Array.from(node.childNodes);

                if (children.length) {
                  children.forEach(function(child) {
                    processNode(child);
                  });
                } else {
                  currentCount += node.textContent.length;

                  if (currentCount >= charCount) {
                    truncated = true;

                    if (currentCount > charCount) {
                      // Trim text to fit limit
                      node.textContent = node.textContent.slice(0, -(currentCount - charCount));
                    }
                    node.textContent += "…";
                  }
                }
              };

              processNode(container);

              return {
                content: container.innerHTML,
                exists: truncated
              };
            },

            /**
             * Apply rich text formatting to content
             * @param {string} content - Raw content string
             * @param {Object} options - Options (linkPreview)
             * @returns {string} Formatted HTML content
             */
            highlightContent: function(content, options) {
              options = options || {};
              var self = this;

              var escaped = this.escapeHTML(content);
              var placeholders = [];

              /**
               * Replace content with placeholder to prevent double-processing
               * @param {string} replacement - HTML to replace with
               * @returns {string} Placeholder string
               */
              var createPlaceholder = function(replacement) {
                var id = " {" + Voxel.helpers.randomId(32) + "} ";
                placeholders.push({ id: id, content: replacement });
                return id;
              };

              // Process code blocks (```lang\ncode\n```)
              escaped = escaped.replace(this.RG_CODE_BLOCK, function(match, lang, code) {
                var langAttr = lang.length ? 'data-lang="' + lang + '"' : "";
                return createPlaceholder('<pre class="min-scroll" ' + langAttr + '>' + code + '</pre>');
              });

              // Process inline code (`code`)
              escaped = escaped.replace(this.RG_INLINE_CODE, function(match, prefix, code) {
                return createPlaceholder(prefix + '<code>' + code + '</code>');
              });

              // Process @mentions
              escaped = escaped.replace(this.RG_USERNAME, function(match, prefix, username) {
                // Add visual dot styling
                var displayName = username.replaceAll("·", '<span style="opacity:.3;">·</span>');

                // Build profile URL
                var profileUrl = new URL(config.settings.mentions.url);
                profileUrl.searchParams.set("username", username.substr(1));

                return createPlaceholder(
                  prefix + '<a href="' + profileUrl.toString() + '">' + displayName + '</a>'
                );
              });

              // Process #hashtags
              escaped = escaped.replace(this.RG_HASHTAG, function(match, prefix, hashtag) {
                var searchUrl = new URL(config.settings.hashtags.url);
                searchUrl.searchParams.set("q", hashtag);

                return createPlaceholder(
                  prefix + '<a href="' + searchUrl.toString() + '">' + hashtag + '</a>'
                );
              });

              // Remove link preview URL from end of content if present
              if (options.linkPreview && options.linkPreview.url?.length) {
                if (escaped.endsWith(options.linkPreview.url)) {
                  escaped = escaped.slice(0, -options.linkPreview.url.length).trimEnd();
                }
              }

              // Process regular URLs
              escaped = escaped.replace(this.RG_REGULAR_LINK, function(url) {
                try {
                  var parsed = new URL(url);
                  return '<a href="' + parsed.toString() + '" rel="noopener noreferrer nofollow" target="_blank">' + url + '</a>';
                } catch (e) {
                  return url;
                }
              });

              // Process **bold** text
              escaped = escaped.replace(this.RG_TEXT_BOLD, function(match, prefix, text) {
                return prefix + '<strong>' + text + '</strong>';
              });

              // Process _italic_ text
              escaped = escaped.replace(this.RG_TEXT_ITALIC, function(match, prefix, text) {
                return prefix + '<em>' + text + '</em>';
              });

              // Process ~strikethrough~ text
              escaped = escaped.replace(this.RG_TEXT_STRIKETHROUGH, function(match, prefix, text) {
                return prefix + '<del>' + text + '</del>';
              });

              // Restore placeholders with actual content
              placeholders.forEach(function(placeholder) {
                escaped = escaped.replace(placeholder.id, placeholder.content);
              });

              return escaped;
            }
          }
        });
      })(element, config);

      /* ------------------------------------------------------------------
         REGISTER COMPONENTS
         ------------------------------------------------------------------ */

      // Main feed component
      app.component("status-feed", statusFeedComponent);

      // Individual status component
      app.component("status-single", statusSingleComponent);

      // Status composer (async loaded)
      app.component(
        "status-composer",
        Vue.defineAsyncComponent(function() {
          return import(config.async.composer);
        })
      );

      // Comment feed and related components (async loaded)
      app.component(
        "comment-feed",
        Vue.defineAsyncComponent(function() {
          return import(config.async.comments).then(function(module) {
            // Register sub-components from the module
            app.component("comment-composer", module.default.Comment_Composer);
            app.component("comment-single", module.default.Comment_Single);
            return module.default.Comment_Feed;
          });
        })
      );

      // File upload component
      fileUploadComponent.template = "#vxfeed__file-upload";
      app.component("file-upload", fileUploadComponent);

      // Media popup component
      app.component("media-popup", mediaPopupComponent);

      // Form popup (from Voxel core)
      app.component("form-popup", Voxel.components.popup);

      // Form group (from Voxel core)
      app.component("form-group", Voxel.components.formGroup);

      // Height transition component
      app.component("transition-height", {
        template: '<transition name="ts-expand" @after-enter="afterEnter" @enter="enter" @leave="leave"><slot></slot></transition>',
        methods: {
          afterEnter: function(el) {
            el.style.height = "auto";
          },
          enter: function(el) {
            var height = getComputedStyle(el).height;
            el.style.height = 0;
            requestAnimationFrame(function() {
              el.style.height = height;
            });
          },
          leave: function(el) {
            el.style.height = getComputedStyle(el).height;
            requestAnimationFrame(function() {
              el.style.height = 0;
            });
          }
        }
      });

      // Dropdown list component
      app.component("dropdown-list", {
        props: ["target"],
        emits: ["blur"],
        template: "#vxfeed__dd-list"
      });

      // Register icon components dynamically
      Object.keys(icons).forEach(function(iconName) {
        app.component("icon-" + iconName, {
          template: icons[iconName] || "<!-- icon -->"
        });
      });

      // Dispatch init event for extensions
      document.dispatchEvent(new CustomEvent("voxel/timeline/init", {
        detail: {
          app: app,
          config: config,
          el: element
        }
      }));

      // Mount the app
      app.mount(element);
    });
  };

  // Initialize on load
  window.render_timeline_v2();

  // Re-initialize after markup updates (AJAX, etc.)
  jQuery(document).on("voxel:markup-update", window.render_timeline_v2);

});

/* ==========================================================================
   REFERENCE: DATA STRUCTURES
   ========================================================================== */

/**
 * CONFIG OBJECT (from .vxconfig):
 * {
 *   timeline: {
 *     mode: "user_feed" | "post_timeline" | "author_timeline" | "global_feed" | "single_status"
 *   },
 *   current_post: { id: number },
 *   current_author: { id: number },
 *   current_user: {
 *     id: number,
 *     display_name: string,
 *     link: string,
 *     avatar_url: string
 *   },
 *   single_status_id: number | null,
 *   single_reply_id: number | null,
 *   nonce: string,
 *   settings: {
 *     search: { default_query: string },
 *     ordering_options: Array<{ _id: string, order: string, time: string, time_custom?: string }>,
 *     posts: { truncate_at: number },
 *     quotes: { truncate_at: number },
 *     link_preview: { default_image: string },
 *     mentions: { url: string },
 *     hashtags: { url: string }
 *   },
 *   reviews: {
 *     [post_type: string]: {
 *       rating_levels: Array<{ score: number, ... }>,
 *       categories: Array<{ key: string, label: string }>
 *     }
 *   },
 *   l10n: { ... },
 *   async: {
 *     composer: string,  // URL to composer module
 *     comments: string   // URL to comments module
 *   }
 * }
 */

/**
 * STATUS OBJECT:
 * {
 *   id: number,
 *   content: string,
 *   created_at: string,
 *   link: string,
 *   feed: "post_wall" | "post_reviews" | "user_wall",
 *   publisher: {
 *     type: "user" | "post",
 *     id: number,
 *     username: string,
 *     display_name: string,
 *     link: string,
 *     avatar_url: string
 *   },
 *   post: { id: number, title: string } | null,
 *   files: Array<{ source: string, id?: number, _id?: string, preview: string, ... }>,
 *   link_preview: { url: string, image: string, ... } | null,
 *   likes: {
 *     count: number,
 *     last3: Array<{ type: string, id: number, display_name: string, link: string, avatar_url: string }>
 *   },
 *   current_user: {
 *     has_liked: boolean,
 *     has_reposted: boolean
 *   },
 *   review: {
 *     post_type: string,
 *     score: number,
 *     rating: { [category: string]: number }
 *   } | null,
 *   quote_of: Object | null,  // Quoted status (same structure)
 *   is_pending: boolean,
 *   badges: Array<string>
 * }
 */

/* ==========================================================================
   KEY FEATURES & PATTERNS
   ========================================================================== */

/**
 * KEY FEATURES:
 * - Multiple feed modes (user, post, author, global, single)
 * - Status CRUD with rich content (text, media, links)
 * - Like/unlike with optimistic UI and cross-instance sync via CustomEvent
 * - Repost/unrepost with optimistic UI
 * - Quote posts (status referencing another status)
 * - Comments loaded asynchronously for performance
 * - Media popup for selecting from library
 * - File upload with drag & drop and deduplication cache
 * - Link preview detection and lazy image loading
 * - Rich text formatting: code blocks, inline code, mentions, hashtags, bold, italic, strikethrough
 * - Search and filtering
 * - Ordering options (latest, top, etc.)
 * - Review display with rating levels and categories
 * - Moderation (mark approved/pending)
 *
 * PATTERNS:
 * - Optimistic UI: Update UI immediately, revert on API error
 * - Cross-instance sync: CustomEvent for like/repost state across multiple status instances
 * - Lazy loading: IntersectionObserver for link preview images
 * - Async components: Vue.defineAsyncComponent for code splitting
 * - Placeholder pattern: Replace formatted content with placeholders to prevent double-processing
 * - Global caches: window._vx_file_upload_cache, window._vx_feed_cache, window._vx_mentions_cache
 *
 * EVENT FLOW:
 * 1. Page load -> render_timeline_v2() -> mount Vue app
 * 2. App created -> getFeed() or getActiveStatus()
 * 3. Like click -> dispatch CustomEvent -> optimistic update -> POST to server -> revert on error
 * 4. Publish status -> prepend to list -> clear composer
 * 5. Quote/repost -> emit to parent -> add to feed based on mode
 */
