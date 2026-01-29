/**
 * ============================================================================
 * VOXEL MESSAGES (INBOX) WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/messages.js
 * Size: 16K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Provides a complete real-time messaging/inbox system with:
 * - Chat list with search and pagination
 * - Real-time message polling
 * - File attachments
 * - Emoji picker
 * - Block/unblock users
 * - Delete messages and clear conversations
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/messages/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.popup / formGroup
 * - Voxel.helpers.debounce
 * - Voxel.alert (notification system)
 * - Voxel_Config.ajax_url
 *
 * CSS CLASSES:
 * - .ts-inbox: Main container element
 *
 * ============================================================================
 */

/**
 * DATA-CONFIG FORMAT:
 * {
 *   "nonce": "abc123",
 *   "user": { "id": 1 },
 *   "files": {
 *     "allowed_file_types": ["image/jpeg", "image/png"],
 *     "max_count": 5
 *   },
 *   "emojis": { "url": "/path/to/emoji-list.json" },
 *   "polling": {
 *     "enabled": true,
 *     "frequency": 5000,
 *     "url": "/check-activity"
 *   },
 *   "blur_on_send": false
 * }
 */

/**
 * API ENDPOINTS:
 *
 * 1. List Chats: GET inbox.list_chats
 * 2. Load Chat Messages: GET inbox.load_chat
 * 3. Send Message: POST inbox.send_message
 * 4. Search Chats: GET inbox.search_chats
 * 5. Block Chat: POST inbox.block_chat
 * 6. Clear Conversation: POST inbox.clear_conversation
 * 7. Delete Message: POST inbox.delete_message
 * 8. List Media: GET list_media
 */

/* ==========================================================================
   SECTION 1: MODULE WRAPPER
   ========================================================================== */

(function(factory) {
  if (typeof define === "function" && define.amd) {
    define("messages", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: MEDIA POPUP COMPONENT
     ========================================================================== */

  /**
   * Media library popup for selecting existing files
   */
  var mediaPopup = {
    template: "#create-post-media-popup",
    props: {
      multiple: { type: Boolean, default: true },
      ignore: { type: Array, default: [] },
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
      getStyle: function(file) {
        if (file.type.startsWith("image/")) {
          return "background-image: url('" + file.preview + "');";
        }
        return "";
      },

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

      loadMore: function() {
        this.loading = true;
        this.loadMedia();
      },

      openLibrary: function() {
        this.$emit("open");
        if (this.firstLoad) {
          this.loadMedia();
        }
        this.firstLoad = false;
        this.active = !this.active;
      },

      isImage: function(file) {
        return file.type.startsWith("image/");
      },

      save: function() {
        this.active = false;
        this.$emit("save", this.selected);
        this.selected = {};
      },

      clear: function() {
        this.selected = {};
      },

      /**
       * Client-side search through already loaded files
       */
      clientSearchFiles: function() {
        var searchTerm = this.search.term.trim().toLowerCase();
        var results = [];
        var found = false;
        var self = this;

        this.files.forEach(function(file) {
          if (found) return;
          if (file.name.toLowerCase().indexOf(searchTerm) !== -1) {
            results.push(file);
            found = results.length >= 10;
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
       */
      sessionFiles: function() {
        if (!Array.isArray(window._vx_file_upload_cache)) {
          window._vx_file_upload_cache = [];
        }
        return window._vx_file_upload_cache.reverse();
      }
    },
    watch: {
      "search.term": function() {
        if (this.search.term.trim() && this.files) {
          this.search.loading = true;
          // Use client search for short terms or when all files loaded
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
     SECTION 3: FILE FIELD COMPONENT
     ========================================================================== */

  /**
   * File upload field component for message attachments
   */
  var fileField = {
    template: "#create-post-file-field",
    props: {
      field: Object,
      mediaTarget: [Object, String],
      index: { type: Number, default: null },
      sortable: { type: Boolean, default: true },
      showLibrary: { type: Boolean, default: true },
      previewImages: { type: Boolean, default: true }
    },
    data: function() {
      return {
        accepts: "",
        dragActive: false,
        reordering: false
      };
    },
    created: function() {
      var self = this;
      if (this.field.value === null) {
        this.field.value = [];
      }

      if (this.field.props.allowedTypes) {
        this.accepts = Object.values(this.field.props.allowedTypes).join(", ");
      }

      this.$watch(function() { return self.field.value; }, function() {
        self.validate(self.field.value);
      }, { deep: true });
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
        Object.values(self.field.value).forEach(function(file) {
          if (file.source === "new_upload") {
            URL.revokeObjectURL(file.preview);
          }
        });
      }, 10);
    },
    methods: {
      getStyle: function(file) {
        if (file.type.startsWith("image/") && this.previewImages) {
          return "background-image: url('" + file.preview + "');";
        }
        return "";
      },

      pushFile: function(file) {
        var self = this;
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
          _id: Voxel.helpers.randomId(8)
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

      onMediaPopupSave: function(selected) {
        var self = this;
        if (this.field.props.maxCount === 1) {
          this.field.value = [];
        }

        var existingIds = {};
        this.field.value.forEach(function(file) {
          if (file.source === "existing") existingIds[file.id] = true;
          if (file.source === "new_upload") existingIds[file._id] = true;
        });

        Object.values(selected).forEach(function(file) {
          if (file.source === "existing" && !existingIds[file.id]) {
            self.field.value.push(file);
          }
          if (file.source === "new_upload" && !existingIds[file._id]) {
            self.field.value.push(file);
          }
        });
        this.$emit("files-added");
      },

      /**
       * Prepare files for form submission
       */
      onSubmit: function(fields, formData, rowIndex) {
        var fieldName;
        rowIndex = rowIndex || null;

        if (Array.isArray(rowIndex) && rowIndex.length) {
          fieldName = "files[" + this.field.id + "::row-" + rowIndex.join(".") + "][]";
        } else {
          fieldName = "files[" + this.field.id + "][]";
        }

        fields[this.field.key] = [];

        this.field.value.forEach(function(file) {
          if (file.source === "new_upload") {
            formData.append(fieldName, file.item);
            fields[this.field.key].push("uploaded_file");
          } else if (file.source === "existing") {
            fields[this.field.key].push(file.id);
          }
        });
      },

      /**
       * Validate file field
       */
      validate: function(value) {
        if (!this.$root.shouldValidate()) return;

        var errors = [];
        var isEmpty = !(Array.isArray(value) && value.length >= 1);
        var maxCount = this.field.props.maxCount;
        var maxSize = this.field.props.maxSize;
        var allowedTypes = this.field.props.allowedTypes;
        var self = this;

        if (this.$root.shouldValidateRequired() && this.field.required && isEmpty) {
          errors.push(this.$root.get_error("required"));
        }

        if (!isEmpty) {
          if (maxCount && value.length > maxCount) {
            errors.push(this.$root.replace_vars(
              this.$root.get_error("file:max"),
              { "@max": maxCount }
            ));
          }

          if (maxSize) {
            value.forEach(function(file) {
              if (file.source === "new_upload" && file.size > maxSize * 1000) {
                errors.push(self.$root.replace_vars(
                  self.$root.get_error("file:size"),
                  {
                    "@filename": file.name,
                    "@limit_kb": maxSize,
                    "@limit_mb": maxSize / 1000
                  }
                ));
              }
            });
          }

          if (Array.isArray(allowedTypes) && allowedTypes.length) {
            value.forEach(function(file) {
              if (!allowedTypes.includes(file.type)) {
                errors.push(self.$root.replace_vars(
                  self.$root.get_error("file:type"),
                  { "@filename": file.name, "@filetype": file.type }
                ));
              }
            });
          }
        }

        this.field.validation.errors = errors;
      }
    }
  };

  /* ==========================================================================
     SECTION 4: MAIN MESSAGES APP
     ========================================================================== */

  window.render_messages = function() {
    Array.from(document.querySelectorAll(".ts-inbox")).forEach(function(element) {
      if (element.__vue_app__) return;

      var config = JSON.parse(element.dataset.config);

      var app = Vue.createApp({
        el: element,
        template: element.innerHTML,
        mixins: [Voxel.mixins.base],

        data: function() {
          return {
            widget: "messages",
            config: config,
            screen: "main",

            // Chat list state
            chats: {
              list: null,
              hasMore: false,
              loading: true,
              loadingMore: false,
              page: 1
            },

            // Search state
            search: {
              term: "",
              list: [],
              loading: false
            },

            // Active conversation
            activeChat: null,

            // File attachment field
            files: {
              label: "Attach images",
              key: "files",
              id: "files",
              value: [],
              props: {
                allowedTypes: config.files.allowed_file_types,
                maxCount: config.files.max_count
              }
            },

            activePopup: null,

            // Emoji picker state
            emojis: {
              loading: true,
              list: null,
              recents: [],
              search: { term: "", list: [] }
            }
          };
        },

        created: function() {
          var self = this;
          window.DMs = this;

          // Load chats on init
          if (this.chats.list === null) {
            this.chats.list = [];
            this.getChats(true);
          }

          // Load emojis
          setTimeout(function() { self.loadEmojis(); });

          // Start polling for new messages
          if (config.polling.enabled) {
            setTimeout(function() {
              self.checkActivity();
            }, config.polling.frequency);
          }
        },

        methods: {
          /**
           * Fetch chat list from server
           */
          getChats: function(autoload) {
            var self = this;
            autoload = autoload || false;

            this.chats.loadingMore = true;

            jQuery.get(Voxel_Config.ajax_url + "&action=inbox.list_chats", {
              pg: this.chats.page,
              load: autoload ? Voxel.getSearchParam("chat") : null,
              _wpnonce: config.nonce
            }).always(function(response) {
              if (response.success) {
                self.chats.list.push(...response.list);
                self.chats.hasMore = response.has_more;
              } else {
                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
              }

              self.chats.loading = false;
              self.chats.loadingMore = false;

              // Auto-open chat if specified
              if (autoload) {
                var chatToLoad = self.chats.list.find(function(chat) {
                  return chat.autoload;
                });

                if (chatToLoad) {
                  self.openChat(chatToLoad);
                } else if (response.default_chat) {
                  self.openChat(response.default_chat);
                }
              }
            });
          },

          loadMoreChats: function() {
            this.chats.page++;
            this.getChats();
          },

          /**
           * Scroll chat body to bottom
           */
          updateScroll: function() {
            this.$refs.body.scrollTop = this.$refs.body.scrollHeight;
          },

          /**
           * Open a chat conversation
           */
          openChat: function(chat) {
            var self = this;
            this.activeChat = chat;

            // Build chat identifier for URL
            Voxel.setSearchParam("chat", [
              chat.author.type === "post" ? chat.author.id : "",
              chat.target.type === "post" ? "p" : "u",
              chat.target.id
            ].join(""));

            // Load messages if not loaded
            if (chat.messages.list === null) {
              chat.messages.list = [];
              this.loadMessages(chat, {
                cb: function() {
                  chat.is_new = false;
                  chat.seen = true;
                  self.$nextTick(function() { self.updateScroll(); });
                }
              });
            } else {
              chat.is_new = false;
              chat.seen = true;
              this.$nextTick(function() { self.updateScroll(); });
            }

            this.$nextTick(function() { self.resizeComposer(); });
            this.$nextTick(function() { self.$refs.composer?.focus(); });

            // Handle pre-filled text from URL
            var text = Voxel.getSearchParam("text");
            if (typeof text === "string" && text.length) {
              this.activeChat.state.content = text;
            }
            Voxel.deleteSearchParam("text");
          },

          closeActiveChat: function() {
            this.activeChat = null;
            Voxel.deleteSearchParam("chat");
          },

          /**
           * Load messages for a chat
           */
          loadMessages: function(chat, options) {
            var self = this;
            options = options || {};

            chat.messages.loadingMore = true;

            jQuery.get(Voxel_Config.ajax_url + "&action=inbox.load_chat", {
              cursor: chat.messages.list[chat.messages.list.length - 1]?.id,
              author_type: chat.author.type,
              author_id: chat.author.id,
              target_type: chat.target.type,
              target_id: chat.target.id,
              _wpnonce: config.nonce
            }).always(function(response) {
              if (response.success) {
                chat.messages.list.push(...response.list);
                chat.messages.hasMore = response.has_more;
                chat.messages.loading = false;
                chat.messages.loadingMore = false;
                chat.follow_status.author = response.follow_status.author;
                chat.follow_status.target = response.follow_status.target;

                if (options.cb) options.cb();
              } else {
                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
              }
            });
          },

          loadMoreMessages: function(chat) {
            var self = this;
            var body = this.$refs.body;
            var scrollOffset = body.scrollHeight - body.scrollTop;

            this.loadMessages(chat, {
              cb: function() {
                self.$nextTick(function() {
                  body.scrollTop = body.scrollHeight - scrollOffset;
                });
              }
            });
          },

          /**
           * Send a message
           */
          sendMessage: function(chat) {
            var self = this;
            var content = chat.state.content.trim();

            // Create temporary message for optimistic UI
            var tempMessage = {
              id: 0,
              sent_by: "author",
              time: "now",
              seen: false,
              has_content: content.length,
              content: "<p>" + content
                .replace(/(?:\r\n|\r|\n){2,}/g, "</p><p>")
                .replace(/(?:\r\n|\r|\n)/g, "<br>") + "</p>",
              sending: true,
              tmp: true
            };

            // Build form data
            var formData = new FormData();
            var fields = { content: content };

            this.$refs.files.onSubmit(fields, formData);
            formData.append("fields", JSON.stringify(fields));

            // Only send if there's content or files
            if (!fields.content.length && !fields.files.length) {
              return;
            }

            var params = jQuery.param({
              sender_type: chat.author.type,
              sender_id: chat.author.id,
              receiver_type: chat.target.type,
              receiver_id: chat.target.id,
              _wpnonce: config.nonce
            });

            jQuery.post({
              url: Voxel_Config.ajax_url + "&action=inbox.send_message&" + params,
              data: formData,
              contentType: false,
              processData: false
            }).always(function(response) {
              var messageIndex = chat.messages.list.indexOf(tempMessage);

              if (response.success) {
                // Replace temp message with real one
                chat.messages.list[messageIndex] = response.message;
                self.$nextTick(function() { self.updateScroll(); });

                // Update chat metadata
                chat.excerpt = response.message.excerpt;
                chat.time = response.message.chat_time;

                // Move chat to top of list
                var chatIndex = self.chats.list.findIndex(function(c) {
                  return c.key === chat.key;
                });
                if (chatIndex !== -1) {
                  self.chats.list.splice(chatIndex, 1);
                }
                self.chats.list.unshift(chat);

                // Clear file cache
                delete window._vx_file_upload_cache;
              } else {
                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                chat.messages.list.splice(messageIndex, 1);

                if (response.error_type === "validation") {
                  chat.state.content = content;
                  self.$nextTick(function() { self.resizeComposer(); });
                }
              }
            });

            // Add temp message and clear input
            chat.messages.list.unshift(tempMessage);
            chat.state.content = "";
            this.files.value = [];

            this.$nextTick(function() {
              self.updateScroll();
              self.resizeComposer();
              if (config.blur_on_send) {
                self.$refs.composer?.blur();
              } else {
                self.$refs.composer?.focus();
              }
            });
          },

          /**
           * Auto-resize composer textarea
           */
          resizeComposer: function() {
            if (!this.$refs.composer) return;

            this.$refs._composer.value = this.$refs.composer.value;
            this.$refs._composer.style.width = this.$refs.composer.scrollWidth + "px";
            this.$refs._composer.style.minWidth = this.$refs.composer.scrollWidth + "px";
            this.$refs._composer.style.maxWidth = this.$refs.composer.scrollWidth + "px";
            this.$refs.composer.style.height = this.$refs._composer.scrollHeight + "px";
          },

          /**
           * Handle Enter key in composer
           */
          enterComposer: function(event, chat) {
            if (event.isComposing || event.keyCode === 229) return;
            if (event.shiftKey) return;

            event.preventDefault();
            this.sendMessage(chat);
          },

          /**
           * Check for new activity (polling)
           */
          checkActivity: function() {
            var self = this;

            if (document.visibilityState !== "visible") {
              setTimeout(function() { self.checkActivity(); }, config.polling.frequency);
              return;
            }

            var timestamp = Math.round(Date.now() / 1000);

            jQuery.get(config.polling.url, {
              u: config.user.id,
              v: timestamp
            }).always(function(response) {
              if (response === "1") {
                self.refreshInbox();
              } else {
                setTimeout(function() { self.checkActivity(); }, config.polling.frequency);
              }
            });
          },

          /**
           * Patch existing chat with new data
           */
          patchChat: function(existingChat, newChat) {
            existingChat.excerpt = newChat.excerpt;
            existingChat.is_new = newChat.is_new;
            existingChat.seen = newChat.seen;
            existingChat.time = newChat.time;

            // Merge messages if both have loaded messages
            if (newChat.messages.list !== null && existingChat.messages.list !== null) {
              // Update existing message states
              newChat.messages.list.forEach(function(newMsg) {
                var existing = existingChat.messages.list.find(function(m) {
                  return m.id === newMsg.id;
                });
                if (existing) {
                  existing.seen = newMsg.seen;
                  existing.is_deleted = newMsg.is_deleted;
                  existing.is_hidden = newMsg.is_hidden;
                }
              });

              // Add new messages
              var lastId = existingChat.messages.list[0]?.id || 0;
              var newMessages = newChat.messages.list.filter(function(m) {
                return m.id > lastId;
              });

              if (newMessages.length < 15) {
                existingChat.messages.list.unshift(...newMessages);
              } else {
                existingChat.messages.list = newChat.messages.list;
              }

              existingChat.messages.hasMore = newChat.messages.hasMore;
              existingChat.messages.loading = newChat.messages.loading;
              existingChat.messages.loadingMore = newChat.messages.loadingMore;
            } else if (existingChat.messages.list !== null && existingChat.last_id === newChat.last_id) {
              // No change
            } else {
              existingChat.messages.list = newChat.messages.list;
              existingChat.messages.hasMore = newChat.messages.hasMore;
              existingChat.messages.loading = newChat.messages.loading;
              existingChat.messages.loadingMore = newChat.messages.loadingMore;
            }

            existingChat.last_id = newChat.last_id;
          },

          /**
           * Refresh inbox (called when polling detects activity)
           */
          refreshInbox: function() {
            var self = this;

            jQuery.get(Voxel_Config.ajax_url + "&action=inbox.list_chats", {
              pg: 1,
              load: Voxel.getSearchParam("chat"),
              _wpnonce: config.nonce
            }).always(function(response) {
              if (response.success) {
                var updatedChats = [];
                var chatToAutoload = null;

                response.list.forEach(function(newChat) {
                  var existingIndex = self.chats.list.findIndex(function(c) {
                    return c.key === newChat.key;
                  });

                  if (existingIndex !== -1) {
                    var existing = self.chats.list[existingIndex];
                    self.patchChat(existing, newChat);
                    updatedChats.push(existing);
                    self.chats.list.splice(existingIndex, 1);
                    if (newChat.autoload) chatToAutoload = existing;
                  } else {
                    updatedChats.push(newChat);
                    if (newChat.autoload) chatToAutoload = newChat;
                  }
                });

                self.chats.list.unshift(...updatedChats);

                if (chatToAutoload) {
                  self.openChat(chatToAutoload);
                } else if (response.default_chat) {
                  // Handle default chat
                }
              }

              if (config.polling.enabled) {
                setTimeout(function() { self.checkActivity(); }, config.polling.frequency);
              }
            });
          },

          /**
           * Block/unblock a chat
           */
          blockChat: function(chat) {
            var self = this;
            if (!confirm(Voxel_Config.l10n.confirmAction)) return;

            var params = jQuery.param({
              sender_type: chat.author.type,
              sender_id: chat.author.id,
              receiver_type: chat.target.type,
              receiver_id: chat.target.id,
              unblock: chat.follow_status.author === -1 ? "yes" : null,
              _wpnonce: config.nonce
            });

            chat.processing = true;
            this.$refs.chatActions.blur();

            jQuery.post(Voxel_Config.ajax_url + "&action=inbox.block_chat&" + params)
              .always(function(response) {
                chat.processing = null;
                if (response.success) {
                  chat.follow_status.author = response.status;
                  self.$nextTick(function() { self.updateScroll(); });
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                }
              });
          },

          isChatBlocked: function(chat) {
            return chat.follow_status.author === -1 || chat.follow_status.target === -1;
          },

          /**
           * Clear entire conversation
           */
          clearChat: function(chat, closeAfter) {
            var self = this;
            closeAfter = closeAfter || false;

            if (!confirm(Voxel_Config.l10n.confirmAction)) return;

            var params = jQuery.param({
              sender_type: chat.author.type,
              sender_id: chat.author.id,
              receiver_type: chat.target.type,
              receiver_id: chat.target.id,
              _wpnonce: config.nonce
            });

            chat.processing = true;
            this.$refs.chatActions.blur();

            jQuery.post(Voxel_Config.ajax_url + "&action=inbox.clear_conversation&" + params)
              .always(function(response) {
                chat.processing = null;
                if (response.success) {
                  chat.messages.list = [];
                  chat.messages.hasMore = false;

                  var chatIndex = self.chats.list.findIndex(function(c) {
                    return c.key === chat.key;
                  });
                  if (chatIndex !== -1) {
                    self.chats.list.splice(chatIndex, 1);
                  }

                  if (closeAfter) {
                    self.closeActiveChat();
                  }
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                }
              });
          },

          showEmojis: function() {
            this.activePopup = "emojiPopup";
          },

          /**
           * Load emoji list from JSON file
           */
          loadEmojis: function() {
            var self = this;

            if (this.emojis.list === null) {
              jQuery.get(config.emojis.url).always(function(response) {
                if (typeof response !== "object") {
                  self.emojis.loading = false;
                } else {
                  self.emojis.loading = false;
                  self.emojis.list = response;
                }
              });
            }

            // Load recent emojis from localStorage
            var recents = localStorage.getItem("voxel:recent_emojis");
            if (typeof recents === "string") {
              this.emojis.recents = [...recents];
            }
          },

          /**
           * Insert emoji at cursor position
           */
          insertEmoji: function(emoji) {
            var composer = this.$refs.composer;
            var content = this.activeChat.state.content;

            if (composer.selectionStart || composer.selectionStart === "0") {
              var startPos = composer.selectionStart;
              var endPos = composer.selectionEnd;
              content = content.substring(0, startPos) + emoji +
                        content.substring(endPos, composer.value.length);

              setTimeout(function() {
                composer.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
              });
            } else {
              content += emoji;
            }

            this.activeChat.state.content = content;

            // Save to recent emojis
            var recents = [];
            var stored = localStorage.getItem("voxel:recent_emojis");
            if (typeof stored === "string") {
              recents = [...stored];
            }
            recents = recents.filter(function(e) { return e !== emoji; });
            recents.unshift(emoji);

            localStorage.setItem("voxel:recent_emojis", recents.slice(0, 16).join(""));
            this.emojis.recents = recents.slice(0, 16);
          },

          /**
           * Search emojis
           */
          searchEmojis: function() {
            var self = this;
            var results = [];
            var found = false;

            Object.values(this.emojis.list).forEach(function(category) {
              if (found) return;
              category.forEach(function(emoji) {
                if (found) return;
                if (emoji.name.toLowerCase().indexOf(
                  self.emojis.search.term.trim().toLowerCase()
                ) !== -1) {
                  results.push(emoji.emoji);
                  found = results.length >= 80;
                }
              });
            });

            this.emojis.search.list = results;
          },

          /**
           * Delete a message
           */
          deleteMessage: function(message) {
            var self = this;
            if (!confirm(Voxel_Config.l10n.confirmAction)) return;

            var params = jQuery.param({
              deleter_type: this.activeChat.author.type,
              deleter_id: this.activeChat.author.id,
              message_id: message.id,
              _wpnonce: config.nonce
            });

            message.processing = true;

            jQuery.post(Voxel_Config.ajax_url + "&action=inbox.delete_message&" + params)
              .always(function(response) {
                message.processing = null;
                if (response.success) {
                  message.is_deleted = response.is_deleted;
                  message.is_hidden = response.is_hidden;
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                }
              });
          },

          /**
           * Client-side chat search
           */
          clientSearchChats: function() {
            var self = this;
            var searchTerm = this.search.term.trim().toLowerCase();
            var results = [];
            var found = false;

            this.chats.list.forEach(function(chat) {
              if (found) return;
              if (chat.target.name.toLowerCase().indexOf(searchTerm) !== -1) {
                results.push(chat);
                found = results.length >= 10;
              }
            });

            this.search.list = results;
            this.search.loading = false;
          },

          /**
           * Server-side chat search
           */
          serverSearchChats: Voxel.helpers.debounce(function(self) {
            jQuery.get(Voxel_Config.ajax_url + "&action=inbox.search_chats", {
              search: self.search.term.trim(),
              _wpnonce: config.nonce
            }).always(function(response) {
              self.search.loading = false;
              if (response.success) {
                self.search.list = response.list;
              } else {
                Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
              }
            });
          }),

          shouldValidate: function() {
            return false;
          }
        },

        watch: {
          "emojis.search.term": function() {
            if (this.emojis.search.term.trim() && this.emojis.list) {
              this.searchEmojis();
            }
          },
          "search.term": function() {
            if (this.search.term.trim() && this.chats.list) {
              this.search.loading = true;
              if (!this.chats.hasMore || this.search.term.trim().length <= 2) {
                this.clientSearchChats();
              } else {
                this.serverSearchChats(this);
              }
            }
          }
        }
      });

      app.component("form-popup", Voxel.components.popup);
      app.component("form-group", Voxel.components.formGroup);
      fileField.template = "#inbox-file-field";
      app.component("media-popup", mediaPopup);
      app.component("field-file", fileField);
      app.mount(element);
    });
  };

  window.render_messages();
  jQuery(document).on("voxel:markup-update", window.render_messages);

});

/* ==========================================================================
   EDGE CASES & KEY FEATURES
   ========================================================================== */

/**
 * KEY FEATURES:
 * - Real-time polling for new messages
 * - Optimistic UI updates (temp messages while sending)
 * - File attachments with drag & drop
 * - Emoji picker with recent emojis
 * - Block/unblock users
 * - Clear conversations
 * - Delete individual messages
 * - Auto-resize composer textarea
 * - Deep linking via URL params (chat=xxx)
 *
 * EDGE CASES:
 * - Handles page visibility for polling
 * - Deduplicates file uploads via cache
 * - Merges new messages without duplicates
 * - Preserves scroll position when loading more
 */
