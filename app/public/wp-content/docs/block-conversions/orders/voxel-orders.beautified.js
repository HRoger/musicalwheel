/**
 * ============================================================================
 * VOXEL ORDERS WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/orders.js
 * Size: 11K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Comprehensive order management widget for viewing and managing orders.
 * Supports both customer and vendor views with features including:
 * - Order listing with pagination and filtering
 * - Single order view with actions
 * - Status management (approve, cancel, etc.)
 * - Direct messaging integration
 * - File uploads for order items
 * - Dynamic component loading for order item types
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/orders/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp, Vue.defineAsyncComponent)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.popup (form popup)
 * - Voxel.components.formGroup (form group)
 * - Voxel.alert (notification system)
 * - Voxel.prompt (confirmation dialogs)
 * - Voxel.helpers.currencyFormat (currency formatting)
 * - Voxel.setSearchParam / getSearchParam / deleteSearchParam (URL management)
 * - Voxel_Config.ajax_url (AJAX endpoint)
 * - Voxel_Config.l10n (localization strings)
 *
 * CSS CLASSES:
 * - .vx-orders-widget: Main container element
 * - .vx-loading: Loading state indicator
 *
 * DATA ATTRIBUTES:
 * - data-config: JSON configuration on .vx-orders-widget
 *
 * ============================================================================
 */

/**
 * DATA-CONFIG FORMAT:
 *
 * {
 *   "nonce": "wp_nonce_value",
 *   "statuses": {
 *     "pending": { "label": "Pending", ... },
 *     "completed": { "label": "Completed", ... }
 *   },
 *   "shipping_statuses": {
 *     "processing": { "label": "Processing", ... },
 *     "shipped": { "label": "Shipped", ... }
 *   },
 *   "product_types": {
 *     "booking": { "label": "Booking", ... },
 *     "physical": { "label": "Physical", ... }
 *   },
 *   "messages": {
 *     "url": "https://site.com/messages/",
 *     "enquiry_text": {
 *       "vendor": "Order #@order_id inquiry",
 *       "customer": "Question about order #@order_id"
 *     }
 *   },
 *   "data_inputs": {
 *     "content_length": 200   // Truncation length for data inputs
 *   }
 * }
 */

/**
 * API ENDPOINTS USED:
 *
 * GET products.orders.list
 * - pg: Page number
 * - status: Filter by status
 * - shipping_status: Filter by shipping status
 * - product_type: Filter by product type
 * - search: Search query
 *
 * GET products.single_order.get
 * - order_id: Order ID to retrieve
 *
 * POST products.single_order.run_action
 * - order_id: Order ID
 * - order_action: Action to run
 * - _wpnonce: Security nonce
 *
 * POST products.single_order.promotions.cancel_promotion
 * - order_id: Order ID
 * - _wpnonce: Security nonce
 */

/* ==========================================================================
   SECTION 1: MODULE WRAPPER (UMD Pattern)
   ========================================================================== */

(function(factory) {
  if (typeof define === "function" && define.amd) {
    define("orders", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: ORDER ITEM PROMOTION DETAILS COMPONENT
     ========================================================================== */

  /**
   * Vue component for displaying promotion package details within an order item
   *
   * @template #order-item-promotion-details
   */
  var itemPromotionDetails = {
    template: "#order-item-promotion-details",

    props: {
      item: Object,    // The order item containing promotion details
      order: Object,   // The parent order object
      parent: Object   // Reference to single-order component
    },

    data: function() {
      return {};
    },

    methods: {
      /**
       * Cancel a promotion package
       *
       * Shows confirmation dialog, then makes AJAX call to cancel
       * the promotion associated with this order item.
       */
      cancelPromotion: function() {
        var self = this;

        if (!confirm(Voxel_Config.l10n.confirmAction)) {
          return;
        }

        this.parent.running_action = true;

        jQuery.post(
          Voxel_Config.ajax_url + "&action=products.single_order.promotions.cancel_promotion",
          {
            order_id: this.order.id,
            _wpnonce: this.parent.orders.config.nonce
          }
        ).always(function(response) {
          self.parent.running_action = false;

          if (!response.success) {
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }

          // Reload order to reflect changes
          self.parent.reload();
        });
      }
    },

    computed: {
      /**
       * Get promotion package details from item
       */
      details: function() {
        return this.item.details.promotion_package;
      },

      /**
       * Check if promotion has date range
       */
      hasDates: function() {
        return this.details.start_date && this.details.end_date;
      },

      /**
       * Format date range string
       */
      getDates: function() {
        return this.details.start_date + " - " + this.details.end_date;
      }
    }
  };

  /* ==========================================================================
     SECTION 3: SINGLE ORDER VIEW COMPONENT
     ========================================================================== */

  /**
   * Vue component for displaying a single order with all its details
   *
   * @template #orders-single
   */
  var singleOrder = {
    template: "#orders-single",

    props: {
      order: Object,   // The order object to display
      orders: Object   // Reference to parent orders component
    },

    components: {
      itemPromotionDetails: itemPromotionDetails
    },

    data: function() {
      return {
        running_action: false  // Flag for action in progress
      };
    },

    created: function() {
      this.setupComponents(this.order);
    },

    mounted: function() {
      // Scroll to top when viewing single order
      window.scrollTo(0, 0);
    },

    methods: {
      /**
       * Reload the current order data
       *
       * @param {Function} callback - Optional callback after reload
       */
      reload: function() {
        var self = this;
        this.orders.reloadOrder(this.order.id, function(response) {
          self.setupComponents(response.order);
        });
      },

      /**
       * Setup dynamic Vue components for order and order items
       *
       * Dynamically imports and registers components based on order type
       * and item types. Uses Vue.defineAsyncComponent for lazy loading.
       *
       * @param {Object} order - Order object with component definitions
       */
      setupComponents: function(order) {
        var appContext = this.$.appContext;

        // Register order-level components
        Object.values(order.components).forEach(function(component) {
          var componentName = "order:" + component.type;

          if (!appContext.components[componentName]) {
            appContext.app.component(
              componentName,
              Vue.defineAsyncComponent(function() {
                return import(component.src).then(function(module) {
                  return module.default;
                });
              })
            );
          }
        });

        // Register order item-level components
        order.items.forEach(function(item) {
          Object.values(item.components).forEach(function(component) {
            var componentName = "order-item:" + component.type;

            if (!appContext.components[componentName]) {
              appContext.app.component(
                componentName,
                Vue.defineAsyncComponent(function() {
                  return import(component.src).then(function(module) {
                    return module.default;
                  });
                })
              );
            }
          });
        });
      },

      /**
       * Navigate back to orders list
       *
       * Handles navigation including parent order context
       */
      goBack: function() {
        this.orders.order.id = null;
        this.orders.order.item = null;

        Voxel.deleteSearchParam("order_id");

        // Check if we came from a parent order
        if (Voxel.getSearchParam("parent_id")) {
          this.$root.viewOrder(Voxel.getSearchParam("parent_id"));
        } else if (this.orders.query.is_initial_load) {
          this.orders.getInitialOrders();
        }
      },

      /**
       * Replace template variables in a string
       *
       * @param {string} template - String with @variable placeholders
       * @param {Object} vars - Key-value pairs to replace
       * @returns {string} String with replacements made
       */
      replace_vars: function(template, vars) {
        Object.keys(vars).forEach(function(key) {
          template = template.replaceAll(key, vars[key]);
        });
        return template;
      },

      /**
       * Open direct message conversation about this order
       *
       * Builds message URL with pre-filled text based on user role
       */
      openConversation: function() {
        var url;

        if (this.isVendor()) {
          // Vendor contacting customer
          url = new URL(this.orders.config.messages.url);
          url.searchParams.set("chat", "u" + this.order.customer.id);
          url.searchParams.set("text", this.replace_vars(
            this.orders.config.messages.enquiry_text.vendor,
            { "@order_id": this.order.id }
          ));
          window.location.href = url.toString();
        } else {
          // Customer contacting vendor
          url = new URL(this.orders.config.messages.url);
          url.searchParams.set("chat", this.order.actions.dms.vendor_target);
          url.searchParams.set("text", this.replace_vars(
            this.orders.config.messages.enquiry_text.customer,
            { "@order_id": this.order.id }
          ));
          window.location.href = url.toString();
        }
      },

      /**
       * Check if current user is the vendor for this order
       */
      isVendor: function() {
        return this.order.current_user.id === this.order.vendor.id;
      },

      /**
       * Check if current user is the customer for this order
       */
      isCustomer: function() {
        return this.order.current_user.id === this.order.customer.id;
      },

      /**
       * Check if current user is an admin
       */
      isAdmin: function() {
        return this.order.current_user.is_admin;
      },

      /**
       * Get an action by its action key
       *
       * @param {string} actionKey - The action identifier
       * @returns {Object|null} Action object or null
       */
      getAction: function(actionKey) {
        // Check primary actions
        for (var action of this.order.actions.primary) {
          if (action.action === actionKey) {
            return action;
          }
        }

        // Check secondary actions
        for (var action of this.order.actions.secondary) {
          if (action.action === actionKey) {
            return action;
          }
        }

        return null;
      },

      /**
       * Execute an order action
       *
       * Handles confirmation prompts if specified, then makes AJAX call
       *
       * @param {Object} action - Action object with action key and optional confirm
       */
      runAction: function(action) {
        var self = this;

        var executeAction = function() {
          self.running_action = true;

          jQuery.post(
            Voxel_Config.ajax_url + "&action=products.single_order.run_action",
            {
              order_id: self.order.id,
              _wpnonce: self.orders.config.nonce,
              order_action: action.action
            }
          ).always(function(response) {
            self.running_action = false;

            if (response.success) {
              if (response.redirect_to) {
                window.location.href = response.redirect_to;
              } else {
                self.reload();
              }
            } else {
              Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
              self.reload();
            }
          });

          // Blur actions dropdown if exists
          self.$refs.actions?.blur();
        };

        // Check for confirmation requirement
        if (typeof action.confirm === "string") {
          Voxel.prompt(
            action.confirm || Voxel_Config.l10n.confirmAction,
            "warning",
            [
              { label: Voxel_Config.l10n.yes, onClick: function() { executeAction(); } },
              { label: Voxel_Config.l10n.no, onClick: function() {} }
            ],
            7500
          );
        } else {
          executeAction();
        }
      },

      /**
       * Truncate HTML content while preserving structure
       *
       * @param {string} html - HTML content to truncate
       * @returns {Object} Object with truncated content and exists flag
       */
      truncate: function(html) {
        var container = document.createElement("div");
        container.innerHTML = html;

        var maxLength = this.orders.config.data_inputs.content_length;
        var truncated = false;
        var currentLength = 0;

        /**
         * Recursive function to traverse and truncate nodes
         */
        var processNode = function(node) {
          if (truncated) {
            node.remove();
            return;
          }

          var childNodes = Array.from(node.childNodes);

          if (childNodes.length) {
            childNodes.forEach(function(child) {
              processNode(child);
            });
          } else {
            // Text node
            currentLength += node.textContent.length;

            if (currentLength >= maxLength) {
              truncated = true;

              if (currentLength > maxLength) {
                var excess = currentLength - maxLength;
                node.textContent = node.textContent.slice(0, -excess);
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
      }
    },

    computed: {
      /**
       * Computed data inputs with truncation for all order items
       */
      dataInputs: function() {
        var self = this;
        var inputs = {};

        this.order.items.forEach(function(item) {
          var markup = item.data_inputs_markup;
          var truncated = self.truncate(markup);

          inputs[item.id] = {
            content: markup,
            truncated: truncated
          };
        });

        return inputs;
      }
    }
  };

  /* ==========================================================================
     SECTION 4: FILE UPLOAD COMPONENT
     ========================================================================== */

  /**
   * Vue component for file uploads within orders
   *
   * Handles drag & drop, file selection, and media library integration
   *
   * @template #vx-file-upload / #vx-orders-file-upload
   */
  var fileUpload = {
    template: "#vx-file-upload",

    props: {
      field: Object,
      sortable: { type: Boolean, default: true },
      allowedFileTypes: String,
      maxFileCount: { type: Number, default: 1 },
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

      // Handle native file input changes
      jQuery(this.$refs.input).on("change", function(event) {
        for (var i = 0; i < event.target.files.length; i++) {
          var file = event.target.files[i];
          self.pushFile(file);
        }

        // Clear input for re-selection of same file
        self.$refs.input.value = "";
        self.update();
      });
    },

    unmounted: function() {
      var self = this;

      // Cleanup object URLs to prevent memory leaks
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
       */
      getStyle: function(file) {
        if (file.type.startsWith("image/")) {
          return "background-image: url('" + file.preview + "');";
        }
        return "";
      },

      /**
       * Add a file to the upload queue
       *
       * @param {File} file - File object from input or drag/drop
       */
      pushFile: function(file) {
        var self = this;

        // Single file mode: clear existing
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
        if (window._vx_file_upload_cache === undefined) {
          window._vx_file_upload_cache = [];
        }

        // Check for duplicate file in cache
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
       * Handle drag & drop file upload
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
       * Handle media popup selection
       */
      onMediaPopupSave: function(selected) {
        var self = this;

        if (this.maxFileCount === 1) {
          this.value = [];
        }

        // Build map of existing file IDs
        var existingIds = {};
        this.value.forEach(function(file) {
          if (file.source === "existing") {
            existingIds[file.id] = true;
          }
          if (file.source === "new_upload") {
            existingIds[file._id] = true;
          }
        });

        // Add selected files that aren't already in value
        Object.values(selected).forEach(function(file) {
          if (file.source === "existing" && !existingIds[file.id]) {
            self.value.push(file);
          }
          if (file.source === "new_upload" && !existingIds[file._id]) {
            self.value.push(file);
          }
        });

        this.update();
      },

      /**
       * Emit updated value to parent
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
     SECTION 5: MAIN ORDERS WIDGET INITIALIZATION
     ========================================================================== */

  /**
   * Initialize all orders widgets on the page
   *
   * Creates Vue applications for each .vx-orders-widget element
   */
  window.render_orders = function() {
    Array.from(document.querySelectorAll(".vx-orders-widget")).forEach(function(element) {

      // Skip if already initialized
      if (element.__vue_app__) {
        return;
      }

      // Parse configuration
      var config = JSON.parse(element.dataset.config);

      // Parse icons from sibling script tag
      var icons = JSON.parse(
        element.closest(".elementor-element").querySelector(".vxconfig__icons").innerHTML
      );

      /**
       * Create main orders Vue application
       */
      var createOrdersApp = function(config) {
        return Vue.createApp({
          el: element,
          mixins: [Voxel.mixins.base],

          data: function() {
            return {
              config: config,
              activePopup: null,

              // Orders list query state
              query: {
                is_initial_load: true,
                pg: 1,
                status: "all",
                shipping_status: "all",
                product_type: "all",
                search: "",
                loading: true,
                has_more: false,
                items: []
              },

              // Single order view state
              order: {
                id: null,
                loading: false,
                item: null
              }
            };
          },

          created: function() {
            // Expose globally for external access
            window.VX_Orders = this;

            // Check for order_id in URL params
            var orderIdParam = parseInt(Voxel.getSearchParam("order_id"), 10);

            if (!isNaN(orderIdParam) && orderIdParam > 0) {
              this.viewOrder(orderIdParam);
            } else {
              this.getInitialOrders();
            }
          },

          methods: {
            /**
             * Load initial orders based on URL params
             */
            getInitialOrders: function() {
              var pageParam = parseInt(Voxel.getSearchParam("pg"), 10);
              var statusParam = Voxel.getSearchParam("status");
              var shippingParam = Voxel.getSearchParam("shipping_status");
              var productTypeParam = Voxel.getSearchParam("product_type");
              var searchParam = Voxel.getSearchParam("search");

              if (pageParam > 1) {
                this.query.pg = pageParam;
              }

              if (typeof statusParam === "string" && config.statuses[statusParam]) {
                this.query.status = statusParam;
              }

              if (typeof shippingParam === "string" && config.shipping_statuses[shippingParam]) {
                this.query.shipping_status = shippingParam;
              }

              if (typeof productTypeParam === "string" && config.product_types[productTypeParam]) {
                this.query.product_type = productTypeParam;
              }

              if (typeof searchParam === "string" && searchParam.trim().length) {
                this.query.search = searchParam.trim();
              }

              this.getOrders();
            },

            /**
             * Fetch orders list from server
             */
            getOrders: function() {
              var self = this;

              // Update URL params
              if (this.query.pg > 1) {
                Voxel.setSearchParam("pg", this.query.pg);
              } else {
                Voxel.deleteSearchParam("pg");
              }

              if (this.query.status !== "all") {
                Voxel.setSearchParam("status", this.query.status);
              } else {
                Voxel.deleteSearchParam("status");
              }

              if (this.query.shipping_status !== "all") {
                Voxel.setSearchParam("shipping_status", this.query.shipping_status);
              } else {
                Voxel.deleteSearchParam("shipping_status");
              }

              if (this.query.product_type !== "all") {
                Voxel.setSearchParam("product_type", this.query.product_type);
              } else {
                Voxel.deleteSearchParam("product_type");
              }

              if (this.query.search?.length) {
                Voxel.setSearchParam("search", this.query.search);
              } else {
                Voxel.deleteSearchParam("search");
              }

              // Fetch orders
              this.query.loading = true;

              jQuery.get(
                Voxel_Config.ajax_url + "&action=products.orders.list",
                {
                  pg: this.query.pg,
                  status: this.query.status,
                  shipping_status: this.query.shipping_status,
                  product_type: this.query.product_type,
                  search: this.query.search
                }
              ).always(function(response) {
                self.query.loading = false;
                self.query.is_initial_load = false;

                if (response.success) {
                  self.query.items = response.items;
                  self.query.has_more = response.has_more;
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                }
              });
            },

            /**
             * Go to next page
             */
            nextPage: function() {
              this.query.pg += 1;
              this.getOrders();
            },

            /**
             * Go to previous page
             */
            previousPage: function() {
              this.query.pg--;
              if (this.query.pg < 1) {
                this.query.pg = 1;
              }
              this.getOrders();
            },

            /**
             * Set status filter
             */
            setStatus: function(status) {
              if (this.query.status !== status) {
                this.query.status = status;
                this.query.pg = 1;
                this.getOrders();
              }
            },

            /**
             * Set shipping status filter
             */
            setShippingStatus: function(status) {
              if (this.query.shipping_status !== status) {
                this.query.shipping_status = status;
                this.query.pg = 1;
                this.getOrders();
              }
            },

            /**
             * Set product type filter
             */
            setProductType: function(type) {
              if (this.query.product_type !== type) {
                this.query.product_type = type;
                this.query.pg = 1;
                this.getOrders();
              }
            },

            /**
             * Set search query
             */
            setSearch: function(query) {
              if (this.query.search !== query) {
                this.query.search = query;
                this.query.pg = 1;
                this.getOrders();
              }
            },

            /**
             * Reset all filters to defaults
             */
            resetFilters: function() {
              if (
                this.query.search === "" &&
                this.query.status === "all" &&
                this.query.shipping_status === "all" &&
                this.query.product_type === "all" &&
                this.query.pg === 1
              ) {
                return;
              }

              this.query.search = "";
              this.query.status = "all";
              this.query.shipping_status = "all";
              this.query.product_type = "all";
              this.query.pg = 1;
              this.getOrders();
            },

            /**
             * Format currency using Voxel helper
             */
            currencyFormat: function() {
              return Voxel.helpers.currencyFormat.apply(null, arguments);
            },

            /**
             * View a single order
             *
             * @param {number} orderId - Order ID to view
             * @param {number|null} parentId - Optional parent order ID
             */
            viewOrder: function(orderId, parentId) {
              var self = this;
              parentId = parentId || null;

              this.order.id = orderId;
              this.order.loading = true;

              jQuery.get(
                Voxel_Config.ajax_url + "&action=products.single_order.get",
                { order_id: this.order.id }
              ).always(function(response) {
                self.order.loading = false;

                if (response.success) {
                  self.order.item = response.order;
                  Voxel.setSearchParam("order_id", response.order.id);
                  Voxel.deleteSearchParam("parent_id");

                  if (parentId !== null) {
                    Voxel.setSearchParam("parent_id", parentId);
                  }
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                  Voxel.deleteSearchParam("order_id");
                  Voxel.deleteSearchParam("parent_id");
                  self.order.id = null;
                  self.order.item = null;
                  self.order.loading = false;
                  self.getInitialOrders();
                }
              });
            },

            /**
             * Reload current order data
             *
             * @param {number} orderId - Order ID
             * @param {Function} callback - Optional callback
             */
            reloadOrder: function(orderId, callback) {
              var self = this;
              callback = callback || null;

              this.order.id = orderId;
              this.order.loading = true;

              jQuery.get(
                Voxel_Config.ajax_url + "&action=products.single_order.get",
                { order_id: this.order.id }
              ).always(function(response) {
                self.order.loading = false;

                if (response.success) {
                  self.$nextTick(function() {
                    self.order.item = response.order;

                    // Update status in list view
                    var listItem = self.query.items.find(function(item) {
                      return item.id === response.order.id;
                    });

                    if (listItem) {
                      listItem.status = response.order.status.key;
                      listItem.shipping_status = response.order.shipping.status?.key || null;
                    }

                    if (typeof callback === "function") {
                      callback(response);
                    }
                  });
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                }
              });
            },

            /**
             * Load order with component setup
             *
             * @param {number} orderId - Order ID
             * @param {number|null} parentId - Optional parent order ID
             */
            loadOrder: function(orderId, parentId) {
              var self = this;
              parentId = parentId || null;

              this.order.id = orderId;
              this.order.loading = true;

              jQuery.get(
                Voxel_Config.ajax_url + "&action=products.single_order.get",
                { order_id: this.order.id }
              ).always(function(response) {
                self.order.loading = false;

                if (response.success) {
                  self.$nextTick(function() {
                    self.order.item = response.order;

                    // Setup components if single order view is mounted
                    if (self.$refs.singleOrder) {
                      self.$refs.singleOrder.setupComponents(response.order);
                    }

                    Voxel.setSearchParam("order_id", response.order.id);
                    Voxel.deleteSearchParam("parent_id");

                    if (parentId !== null) {
                      Voxel.setSearchParam("parent_id", parentId);
                    }
                  });
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                  Voxel.deleteSearchParam("order_id");
                  Voxel.deleteSearchParam("parent_id");
                  self.order.id = null;
                  self.order.item = null;
                  self.order.loading = false;
                  self.getInitialOrders();
                }
              });
            }
          },

          computed: {
            /**
             * Expose window object to template
             */
            $w: function() {
              return window;
            }
          }
        });
      };

      // Create and configure the Vue app
      var app = createOrdersApp(config);

      // Register components
      app.component("form-popup", Voxel.components.popup);
      app.component("form-group", Voxel.components.formGroup);
      app.component("single-order", singleOrder);

      // Override file upload template for orders
      fileUpload.template = "#vx-orders-file-upload";
      app.component("file-upload", fileUpload);

      // Register icon components
      Object.keys(icons).forEach(function(iconName) {
        app.component("icon-" + iconName, {
          template: icons[iconName] || "<!-- icon -->"
        });
      });

      // Mount the app
      app.mount(element);
    });
  };

  /* ==========================================================================
     SECTION 6: AUTO-INITIALIZATION & EVENT BINDING
     ========================================================================== */

  // Initialize immediately
  window.render_orders();

  // Re-initialize when new markup is added via AJAX
  jQuery(document).on("voxel:markup-update", window.render_orders);

});

/* ==========================================================================
   SECTION 7: EDGE CASES & ERROR HANDLING SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. URL State Persistence:
 *    - Order ID, page, filters persisted to URL params
 *    - Restored on page load
 *    - Parent order context for sub-orders
 *
 * 2. Dynamic Component Loading:
 *    - Order type components loaded async
 *    - Item type components loaded async
 *    - Prevents duplicate registration
 *
 * 3. File Upload:
 *    - Global cache prevents duplicate uploads
 *    - Object URL cleanup on unmount
 *    - Drag & drop support
 *
 * 4. Action Confirmations:
 *    - String confirm shows prompt dialog
 *    - Non-string confirm executes immediately
 *
 * 5. Error Handling:
 *    - All AJAX calls have error alerts
 *    - Failed order loads fall back to list view
 *
 * 6. Content Truncation:
 *    - Preserves HTML structure
 *    - Adds ellipsis at truncation point
 */

/* ==========================================================================
   SECTION 8: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── render_orders()
 *        └── For each .vx-orders-widget
 *            ├── Parse config and icons
 *            ├── Create Vue app
 *            ├── Check URL for order_id
 *            │   ├── Has order_id: viewOrder()
 *            │   └── No order_id: getInitialOrders()
 *            ├── Register components
 *            └── Mount app
 *
 * 2. Orders List Flow
 *    └── getOrders()
 *        ├── Update URL params
 *        ├── Set loading state
 *        ├── jQuery.get() to list endpoint
 *        └── Update query.items and has_more
 *
 * 3. Single Order Flow
 *    └── viewOrder(orderId)
 *        ├── Set loading state
 *        ├── jQuery.get() to single order endpoint
 *        ├── Update URL with order_id
 *        └── Set order.item
 *
 * 4. Order Action Flow
 *    └── runAction(action)
 *        ├── Check action.confirm
 *        │   └── Show Voxel.prompt if string
 *        ├── jQuery.post() to run_action endpoint
 *        └── Redirect or reload()
 */

/* ==========================================================================
   SECTION 9: DEPENDENCIES SUMMARY
   ========================================================================== */

/**
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp, Vue.defineAsyncComponent)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.popup (form popup)
 * - Voxel.components.formGroup (form group)
 * - Voxel.alert (notification system)
 * - Voxel.prompt (confirmation dialogs)
 * - Voxel.helpers.currencyFormat (currency formatting)
 * - Voxel.setSearchParam / getSearchParam / deleteSearchParam (URL management)
 * - Voxel_Config.ajax_url (AJAX endpoint)
 * - Voxel_Config.l10n (localization strings)
 */
