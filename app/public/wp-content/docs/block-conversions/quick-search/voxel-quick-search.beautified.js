/**
 * ============================================================================
 * VOXEL QUICK SEARCH WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/quick-search.js
 * Size: 3.0K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Provides a global quick search popup (Ctrl+K / Cmd+K) that allows users
 * to search across multiple post types with instant results. Supports
 * tabbed mode (search specific post type) and single mode (search all).
 * Stores recent searches in localStorage for quick access.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/quick-search/frontend.tsx
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp)
 * - jQuery (for AJAX calls)
 * - Voxel.mixins.base (Vue mixin)
 * - Voxel.components.formGroup (Vue component)
 * - Voxel.helpers.debounce (utility function)
 * - Voxel.alert (notification system)
 * - Voxel_Config.ajax_url (AJAX endpoint)
 * - Voxel_Config.l10n.ajaxError (error message)
 *
 * CSS CLASSES:
 * - .quick-search: Main container element
 * - .elementor-element: Parent Elementor widget container
 * - .vxconfig: Script tag containing JSON configuration
 *
 * DATA ATTRIBUTES:
 * - None on main element (config is in .vxconfig script tag)
 *
 * KEYBOARD SHORTCUTS:
 * - Ctrl+K / Cmd+K: Open quick search popup
 * - Escape: Close popup
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (in <script class="vxconfig"> tag):
 *
 * {
 *   "display_mode": "tabbed" | "single",  // UI mode
 *   "keywords": {
 *     "minlength": 2                      // Minimum characters to trigger search
 *   },
 *   "post_types": {                       // Available post types (tabbed mode)
 *     "places": {
 *       "key": "places",
 *       "archive": "https://site.com/places/",
 *       "filter": "keywords",             // URL param for search term
 *       "taxonomies": ["category", "tag"],
 *       "results": {                      // Results container for this type
 *         "query": "",
 *         "items": []
 *       }
 *     },
 *     "events": { ... }
 *   },
 *   "single_mode": {                      // Single mode config
 *     "submit_to": "https://site.com/search/",
 *     "filter_key": "s"
 *   }
 * }
 */

/**
 * API REQUEST FORMAT:
 * GET {ajax_url}&action=quick_search
 *
 * Query Parameters:
 * - search: string - The search term
 * - post_types: JSON string - Object mapping post type keys to their config
 *   {
 *     "places": {
 *       "filter_key": "keywords",
 *       "taxonomies": ["category", "tag"]
 *     }
 *   }
 *
 * API RESPONSE FORMAT:
 * Success:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "key": "post_123",           // Unique identifier
 *       "type": "post" | "keywords", // Result type
 *       "title": "Result Title",
 *       "logo": "https://...",       // Image URL or null
 *       "link": "https://..."        // Destination URL
 *     }
 *   ]
 * }
 *
 * Error:
 * {
 *   "success": false,
 *   "message": "Error description"
 * }
 */

/**
 * LOCALSTORAGE FORMAT:
 * Key: "voxel:recent_searches"
 *
 * Value (JSON array, max 8 items):
 * [
 *   {
 *     "key": "post_123" | "keywords:term",  // Unique identifier
 *     "type": "post" | "keywords",
 *     "title": "Search Term or Post Title",
 *     "logo": "https://..." | null,
 *     "link": "https://..."
 *   }
 * ]
 */

/* ==========================================================================
   SECTION 1: MODULE WRAPPER (UMD Pattern)
   ========================================================================== */

/**
 * UMD (Universal Module Definition) wrapper
 * Supports AMD (define) and direct browser execution
 */
(function(factory) {
  if (typeof define === "function" && define.amd) {
    define("quickSearch", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: MAIN INITIALIZATION FUNCTION
     ========================================================================== */

  /**
   * Initialize all quick search widgets on the page
   *
   * CALLED BY:
   * - Immediately on script load
   * - 'voxel:markup-update' event (after AJAX content loads)
   *
   * SELECTOR: .quick-search
   * Uses __vue_app__ property to prevent re-initialization
   */
  window.render_quick_search = function() {
    Array.from(document.querySelectorAll(".quick-search")).forEach(function(element) {

      // Skip if Vue app already mounted on this element
      if (element.__vue_app__) {
        return;
      }

      /* ----------------------------------------------------------------
         SECTION 2.1: CREATE VUE APPLICATION
         ---------------------------------------------------------------- */

      /**
       * Create and configure the Vue application
       *
       * @param {HTMLElement} element - The .quick-search container
       * @returns {Object} Vue application instance
       */
      var app = (function(element) {

        // Parse configuration from sibling .vxconfig script tag
        var config = JSON.parse(
          element.closest(".elementor-element").querySelector(".vxconfig").innerHTML
        );

        return Vue.createApp({
          el: element,

          // Include Voxel's base mixin (provides common functionality)
          mixins: [Voxel.mixins.base],

          /* ----------------------------------------------------------------
             SECTION 2.2: COMPONENT DATA
             ---------------------------------------------------------------- */

          /**
           * Reactive data properties
           */
          data: function() {
            return {
              config: config,
              postTypes: config.post_types,
              activePopup: null,                           // null | "quick-search"
              activeType: Object.values(config.post_types)[0], // First post type
              search: "",                                  // Current search term
              loading: false,                              // AJAX loading state
              recent: this.getRecent(),                    // Recent searches from localStorage
              results: {                                   // Search results (single mode)
                query: "",
                items: []
              }
            };
          },

          /* ----------------------------------------------------------------
             SECTION 2.3: LIFECYCLE HOOKS
             ---------------------------------------------------------------- */

          /**
           * Setup keyboard shortcuts when component is created
           */
          created: function() {
            var self = this;

            document.onkeydown = function(event) {
              // Ctrl+K or Cmd+K: Toggle quick search popup
              if ((event.ctrlKey || event.metaKey) && event.keyCode === 75) {
                event.preventDefault();
                self.activePopup = (self.activePopup === null) ? "quick-search" : null;
              }

              // Escape: Close popup
              if (event.keyCode === 27) {
                self.activePopup = null;
              }
            };
          },

          /* ----------------------------------------------------------------
             SECTION 2.4: METHODS
             ---------------------------------------------------------------- */

          methods: {

            /**
             * Navigate to archive page with current search term
             *
             * Builds URL based on display mode:
             * - Tabbed: Uses active post type's archive URL
             * - Single: Uses configured submit_to URL
             */
            viewArchive: function() {
              var url;

              if (this.config.display_mode === "tabbed") {
                url = new URL(this.activeType.archive);
                url.searchParams.set(this.activeType.filter, this.search);
                location.href = url.toString();
              } else {
                url = new URL(this.config.single_mode.submit_to);
                url.searchParams.set(this.config.single_mode.filter_key, this.search);
                location.href = url.toString();
              }
            },

            /**
             * Trigger search based on current mode
             *
             * Delegates to queryResults with appropriate parameters
             */
            getResults: function() {
              if (this.config.display_mode === "tabbed") {
                // Tabbed mode: Search only active post type
                this.queryResults(this.activeType.results, [this.activeType]);
              } else {
                // Single mode: Search all post types
                this.queryResults(this.results, Object.values(this.postTypes));
              }
            },

            /**
             * Execute search query via AJAX
             *
             * @param {Object} resultsContainer - Object with query and items properties
             * @param {Array} postTypesToSearch - Array of post type configs
             *
             * EDGE CASES:
             * - Search term too short: Clears results
             * - Same query: Skips duplicate request
             * - Network error: Shows error alert
             */
            queryResults: function(resultsContainer, postTypesToSearch) {
              var self = this;

              // Check minimum length requirement
              if (this.search.trim().length < config.keywords.minlength) {
                resultsContainer.query = "";
                resultsContainer.items = [];
                return;
              }

              // Skip if query hasn't changed
              if (this.search.trim() === resultsContainer.query.trim()) {
                return;
              }

              // Build post_types parameter
              var postTypesParam = {};
              postTypesToSearch.forEach(function(postType) {
                postTypesParam[postType.key] = {
                  filter_key: postType.filter,
                  taxonomies: postType.taxonomies
                };
              });

              // Set loading state and update query
              this.loading = true;
              resultsContainer.query = this.search.trim();

              // Make AJAX request
              jQuery.get(
                Voxel_Config.ajax_url + "&action=quick_search",
                {
                  search: this.search.trim(),
                  post_types: JSON.stringify(postTypesParam)
                }
              ).always(function(response) {
                self.loading = false;

                if (response.success) {
                  resultsContainer.items = response.data;
                } else {
                  Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
                }
              });
            },

            /**
             * Debounced version of getResults
             * Waits 250ms after last keystroke before searching
             */
            debouncedResults: Voxel.helpers.debounce(function(self) {
              self.getResults();
            }, 250),

            /**
             * Save a search result item to recent searches
             *
             * @param {Object} item - The search result item to save
             *
             * Behavior:
             * - Removes duplicate if exists
             * - Adds to front of list
             * - Limits to 8 items
             * - Persists to localStorage
             */
            saveSearchItem: function(item) {
              var recent = this.getRecent();

              // Remove existing entry with same key
              recent = recent.filter(function(existingItem) {
                return existingItem.key !== item.key;
              });

              // Add to front
              recent.unshift(item);

              // Limit to 8 items
              recent = recent.slice(0, 8);

              // Save to localStorage
              localStorage.setItem("voxel:recent_searches", JSON.stringify(recent));
              this.recent = recent;
            },

            /**
             * Save current search term as a recent search
             *
             * Creates a "keywords" type entry linking to search results page
             */
            saveCurrentTerm: function() {
              var recent = this.getRecent();
              var searchTerm = this.search.trim();
              var itemKey = "keywords:" + searchTerm;
              var url;

              // Build destination URL based on mode
              if (this.config.display_mode === "tabbed") {
                url = new URL(this.activeType.archive);
                url.searchParams.set(this.activeType.filter, searchTerm);
              } else {
                url = new URL(this.config.single_mode.submit_to);
                url.searchParams.set(this.config.single_mode.filter_key, searchTerm);
              }

              // Remove existing entry with same key
              recent = recent.filter(function(item) {
                return item.key !== itemKey;
              });

              // Add new entry
              recent.unshift({
                type: "keywords",
                key: itemKey,
                title: searchTerm,
                logo: null,
                link: url.toString()
              });

              // Limit and save
              recent = recent.slice(0, 8);
              localStorage.setItem("voxel:recent_searches", JSON.stringify(recent));
              this.recent = recent;
            },

            /**
             * Clear all recent searches
             */
            clearRecents: function() {
              localStorage.setItem("voxel:recent_searches", JSON.stringify([]));
              this.recent = [];
            },

            /**
             * Handle click on a recent search item
             * Moves the clicked item to the top of the list
             *
             * @param {Object} item - The clicked recent search item
             */
            clickedRecent: function(item) {
              var recent = this.getRecent();

              // Remove and re-add to front
              recent = recent.filter(function(existingItem) {
                return existingItem.key !== item.key;
              });
              recent.unshift(item);

              localStorage.setItem("voxel:recent_searches", JSON.stringify(recent));
            },

            /**
             * Get recent searches from localStorage
             *
             * @returns {Array} Array of recent search items
             *
             * EDGE CASES:
             * - Invalid JSON: Returns empty array
             * - Non-array value: Returns empty array
             */
            getRecent: function() {
              var recent = [];

              try {
                var stored = JSON.parse(localStorage.getItem("voxel:recent_searches"));
                if (Array.isArray(stored)) {
                  recent = stored;
                }
              } catch (error) {
                // Invalid JSON, return empty array
              }

              return recent;
            }
          },

          /* ----------------------------------------------------------------
             SECTION 2.5: WATCHERS
             ---------------------------------------------------------------- */

          watch: {
            /**
             * Watch search input and trigger debounced search
             */
            search: function() {
              this.debouncedResults(this);
            }
          }
        });
      })(element);

      /* ----------------------------------------------------------------
         SECTION 2.6: REGISTER COMPONENTS & MOUNT
         ---------------------------------------------------------------- */

      // Register Voxel's form-group component
      app.component("form-group", Voxel.components.formGroup);

      // Mount the Vue app to the element
      app.mount(element);
    });
  };

  /* ==========================================================================
     SECTION 3: AUTO-INITIALIZATION & EVENT BINDING
     ========================================================================== */

  // Initialize immediately
  window.render_quick_search();

  // Re-initialize when new markup is added via AJAX
  jQuery(document).on("voxel:markup-update", window.render_quick_search);

});

/* ==========================================================================
   SECTION 4: EDGE CASES & ERROR HANDLING SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. Re-initialization prevention:
 *    - Checks element.__vue_app__ before creating new Vue instance
 *    - Prevents duplicate Vue apps on same element
 *
 * 2. Search term too short:
 *    - Checks against config.keywords.minlength
 *    - Clears results without making API call
 *
 * 3. Duplicate queries:
 *    - Compares trimmed search term with last query
 *    - Skips API call if same
 *
 * 4. Invalid localStorage data:
 *    - try/catch around JSON.parse
 *    - Validates result is array
 *    - Returns empty array on error
 *
 * 5. Network errors:
 *    - Uses .always() to handle all responses
 *    - Shows Voxel.alert on failure
 *
 * 6. Dynamic content (AJAX):
 *    - Listens for 'voxel:markup-update' event
 *    - Re-runs initialization for new widgets
 *
 * KEYBOARD HANDLING:
 *
 * - Ctrl+K / Cmd+K (keyCode 75): Toggle popup
 * - Escape (keyCode 27): Close popup
 *
 * NOTE: document.onkeydown is overwritten, not addEventListener.
 * This means only ONE quick search widget can handle keyboard shortcuts.
 */

/* ==========================================================================
   SECTION 5: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── render_quick_search()
 *        └── For each .quick-search without __vue_app__
 *            ├── Parse .vxconfig JSON
 *            ├── Create Vue app with data/methods
 *            ├── Setup keyboard shortcuts (Ctrl+K, Escape)
 *            ├── Register form-group component
 *            └── Mount Vue app
 *
 * 2. User Types in Search Input
 *    └── 'search' watcher fires
 *        └── debouncedResults() (250ms debounce)
 *            └── getResults()
 *                └── queryResults()
 *                    ├── Check minlength
 *                    ├── Check duplicate query
 *                    ├── Build post_types param
 *                    ├── Set loading = true
 *                    ├── jQuery.get() AJAX call
 *                    └── On response:
 *                        ├── loading = false
 *                        └── Update results.items or show error
 *
 * 3. User Clicks Result
 *    └── saveSearchItem()
 *        ├── Remove duplicate from recent
 *        ├── Add to front
 *        ├── Limit to 8
 *        └── Save to localStorage
 *
 * 4. User Presses Enter / Clicks "View All"
 *    └── viewArchive()
 *        ├── saveCurrentTerm()
 *        ├── Build URL with search param
 *        └── Navigate (location.href)
 *
 * 5. Keyboard Shortcut
 *    └── document.onkeydown
 *        ├── Ctrl+K: Toggle activePopup
 *        └── Escape: Close activePopup
 */
