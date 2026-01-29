/**
 * ============================================================================
 * VOXEL POST FEED WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/post-feed.js
 * Size: 2.9K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Handles pagination for standalone post feed widgets. Supports two modes:
 * - "prev_next": Previous/Next navigation (replaces content)
 * - "load_more": Load More button (appends content)
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/post-feed/frontend.tsx
 *
 * DEPENDENCIES:
 * - jQuery (for AJAX and DOM manipulation)
 * - Voxel.alert (notification system)
 * - Voxel_Config.ajax_url (AJAX endpoint)
 * - Voxel_Config.l10n.ajaxError (error message)
 *
 * CSS CLASSES:
 * - .ts-post-feed--standalone: Main container element
 * - .vx-event-pagination: Added after initialization (prevents re-init)
 * - .vx-loading: Added during AJAX request
 * - .post-feed-grid: Container for post cards
 * - .feed-pagination: Pagination controls container
 * - .ts-load-prev: Previous page button
 * - .ts-load-next: Next page button
 * - .ts-load-more: Load more button
 * - .disabled: Added to prev/next when no more pages
 * - .hidden: Added to pagination when no pages available
 *
 * DATA ATTRIBUTES:
 * - data-ts-config: JSON configuration on .ts-post-feed--standalone
 *
 * ============================================================================
 */

/**
 * DATA-TS-CONFIG FORMAT:
 *
 * {
 *   "pagination": "prev_next" | "load_more",  // Pagination mode
 *   "filters": {
 *     "pg": 1,                                // Current page number
 *     "post_type": "places",                  // Post type to query
 *     "per_page": 12,                         // Posts per page
 *     // ... other filter parameters
 *   }
 * }
 */

/**
 * API REQUEST FORMAT:
 * GET {ajax_url}&action=search_posts&{serialized filters}
 *
 * The filters object is serialized using jQuery.param() and appended
 * to the URL as query parameters.
 *
 * API RESPONSE FORMAT:
 * Returns HTML markup containing:
 * - Post cards to display
 * - <link> tags for any required stylesheets
 * - <script class="info"> with data attributes:
 *   - data-has-prev: boolean - Whether previous page exists
 *   - data-has-next: boolean - Whether next page exists
 * - <script type="text/javascript"> for any required JS
 */

/* ==========================================================================
   SECTION 1: MODULE WRAPPER (UMD Pattern)
   ========================================================================== */

/**
 * UMD (Universal Module Definition) wrapper
 * Supports AMD (define) and direct browser execution
 */
(function (factory) {
  if (typeof define === "function" && define.amd) {
    define("postFeed", factory);
  } else {
    factory();
  }
})(function () {

  /* ==========================================================================
     SECTION 2: MAIN INITIALIZATION FUNCTION
     ========================================================================== */

  /**
   * Initialize all post feed widgets on the page
   *
   * CALLED BY:
   * - Immediately on script load
   * - 'voxel:markup-update' event (after AJAX content loads)
   */
  window.render_post_feeds = function () {

    /* ----------------------------------------------------------------
       SECTION 2.1: FETCH POSTS FUNCTION
       ---------------------------------------------------------------- */

    /**
     * Fetch posts via AJAX and update the feed
     *
     * @param {jQuery} feedContainer - The jQuery-wrapped feed container
     * @param {Object} config - The feed configuration object
     *
     * This function handles:
     * 1. Building the AJAX URL with filter parameters
     * 2. Loading state management
     * 3. Asset (CSS/JS) injection and deduplication
     * 4. DOM updates based on pagination mode
     * 5. Pagination button state updates
     */
    var fetchPosts = function (feedContainer, config) {

      // Add loading state
      feedContainer.addClass("vx-loading");

      // Build URL with serialized filters
      var queryString = jQuery.param(config.filters);
      var url = Voxel_Config.ajax_url + "&action=search_posts&" + queryString;

      // Make AJAX request
      jQuery.get(url, function (responseHtml) {

        // Remove loading state
        feedContainer.removeClass("vx-loading");

        // Track CSS assets that need to load
        var cssLoadPromises = [];

        // Wrap response in a container for parsing
        var responseWrapper = jQuery('<div class="response-wrapper">' + responseHtml + '</div>');

        /* ----------------------------------------------------------------
           SECTION 2.1.1: CSS ASSET INJECTION
           ---------------------------------------------------------------- */

        /**
         * Inject any new stylesheets from the response
         *
         * - Checks if stylesheet already exists in #vx-assets-cache
         * - Moves new stylesheets to #vx-assets-cache
         * - Creates promises that resolve when CSS loads
         */
        responseWrapper.find('link[rel="stylesheet"]').each(function (index, linkElement) {
          if (linkElement.id && !document.querySelector("#vx-assets-cache #" + CSS.escape(linkElement.id))) {
            jQuery(linkElement).appendTo("#vx-assets-cache");

            // Track loading promise
            cssLoadPromises.push(new Promise(function (resolve) {
              linkElement.onload = resolve;
            }));
          }
        });

        // Get actual content (excluding the wrapper)
        var content = responseWrapper.children();

        /* ----------------------------------------------------------------
           SECTION 2.1.2: RENDER CONTENT AFTER CSS LOADS
           ---------------------------------------------------------------- */

        /**
         * Wait for all CSS to load, then update DOM
         *
         * Uses requestAnimationFrame to ensure smooth rendering
         */
        Promise.all(cssLoadPromises).then(function () {
          requestAnimationFrame(function () {

            var infoScript;

            /* ----------------------------------------------------------------
               SECTION 2.1.3: PAGINATION MODE HANDLING
               ---------------------------------------------------------------- */

            if (config.pagination === "prev_next") {
              /**
               * Prev/Next Mode: Replace grid content
               *
               * - Replaces all content in .post-feed-grid
               * - Updates prev/next button disabled states
               * - Hides pagination if no prev AND no next
               */

              // Replace grid content
              feedContainer.find(".post-feed-grid:first").html(content);

              // Get info script with pagination data
              infoScript = feedContainer.find("script.info");

              // Update Previous button state
              feedContainer.find(".feed-pagination .ts-load-prev")[
                infoScript.data("has-prev") ? "removeClass" : "addClass"
              ]("disabled");

              // Update Next button state
              feedContainer.find(".feed-pagination .ts-load-next")[
                infoScript.data("has-next") ? "removeClass" : "addClass"
              ]("disabled");

              // Hide pagination if no pages available
              feedContainer.find(".feed-pagination")[
                (infoScript.data("has-prev") || infoScript.data("has-next")) ? "removeClass" : "addClass"
              ]("hidden");

              // Remove info script from DOM
              infoScript.remove();

            } else if (config.pagination === "load_more") {
              /**
               * Load More Mode: Append to grid content
               *
               * - Appends new content to .post-feed-grid
               * - Hides load more button if no next page
               */

              // Append to grid
              feedContainer.find(".post-feed-grid:first").append(content);

              // Get info script
              infoScript = feedContainer.find("script.info");

              // Update Load More button visibility
              feedContainer.find(".feed-pagination .ts-load-more")[
                infoScript.data("has-next") ? "removeClass" : "addClass"
              ]("hidden");

              // Remove info script
              infoScript.remove();
            }

            /* ----------------------------------------------------------------
               SECTION 2.1.4: JAVASCRIPT ASSET INJECTION
               ---------------------------------------------------------------- */

            /**
             * Handle inline scripts from response
             *
             * - Checks for duplicate script IDs
             * - Moves unique scripts to #vx-assets-cache
             * - Removes duplicates
             */
            feedContainer.find('script[type="text/javascript"]').each(function (index, scriptElement) {
              if (scriptElement.id) {
                // Check if script with this ID already exists (2 or more = duplicate)
                if (jQuery('script[id="' + CSS.escape(scriptElement.id) + '"]').length >= 2) {
                  scriptElement.remove();
                } else {
                  jQuery(scriptElement).appendTo("#vx-assets-cache");
                }
              }
            });

            /* ----------------------------------------------------------------
               SECTION 2.1.5: TRIGGER MARKUP UPDATE EVENT
               ---------------------------------------------------------------- */

            /**
             * Trigger voxel:markup-update to initialize any widgets
             * in the newly loaded content
             */
            jQuery(document).trigger("voxel:markup-update");
          });
        });

      }).fail(function () {
        /**
         * Handle AJAX failure
         * Shows error alert using Voxel notification system
         */
        Voxel.alert(Voxel_Config.l10n.ajaxError, "error");
      });
    };

    /* ----------------------------------------------------------------
       SECTION 2.2: INITIALIZE FEED WIDGETS
       ---------------------------------------------------------------- */

    /**
     * Find and initialize all uninitialized post feeds
     *
     * SELECTOR: .ts-post-feed--standalone:not(.vx-event-pagination)
     * The :not(.vx-event-pagination) prevents re-initialization
     */
    Array.from(document.querySelectorAll(".ts-post-feed--standalone:not(.vx-event-pagination)"))
      .forEach(function (element) {

        // Mark as initialized
        element.classList.add("vx-event-pagination");

        // Parse configuration
        var config = JSON.parse(element.dataset.tsConfig);
        var feedContainer = jQuery(element);

        /* ----------------------------------------------------------------
           SECTION 2.2.1: PREVIOUS BUTTON HANDLER
           ---------------------------------------------------------------- */

        /**
         * Handle Previous button click
         *
         * - Prevents default link behavior
         * - Ignores if button is disabled
         * - Decrements page (minimum 1)
         * - Fetches new content
         */
        feedContainer.find(".feed-pagination .ts-load-prev").on("click", function (event) {
          event.preventDefault();

          // Ignore if disabled
          if (event.target.classList.contains("disabled")) {
            return;
          }

          // Decrement page (min 1)
          config.filters.pg = config.filters.pg > 1 ? config.filters.pg - 1 : 1;

          // Fetch posts
          fetchPosts(feedContainer, config);
        });

        /* ----------------------------------------------------------------
           SECTION 2.2.2: NEXT BUTTON HANDLER
           ---------------------------------------------------------------- */

        /**
         * Handle Next button click
         *
         * - Prevents default link behavior
         * - Ignores if button is disabled
         * - Increments page
         * - Fetches new content
         */
        feedContainer.find(".feed-pagination .ts-load-next").on("click", function (event) {
          event.preventDefault();

          // Ignore if disabled
          if (event.target.classList.contains("disabled")) {
            return;
          }

          // Increment page
          config.filters.pg += 1;

          // Fetch posts
          fetchPosts(feedContainer, config);
        });

        /* ----------------------------------------------------------------
           SECTION 2.2.3: LOAD MORE BUTTON HANDLER
           ---------------------------------------------------------------- */

        /**
         * Handle Load More button click
         *
         * - Prevents default link behavior
         * - Increments page
         * - Fetches and appends new content
         *
         * Note: No disabled check here - button is hidden when unavailable
         */
        feedContainer.find(".feed-pagination .ts-load-more").on("click", function (event) {
          event.preventDefault();

          // Increment page
          config.filters.pg += 1;

          // Fetch posts
          fetchPosts(feedContainer, config);
        });
      });
  };

  /* ==========================================================================
     SECTION 3: AUTO-INITIALIZATION & EVENT BINDING
     ========================================================================== */

  // Initialize immediately
  window.render_post_feeds();

  // Re-initialize when new markup is added via AJAX
  jQuery(document).on("voxel:markup-update", window.render_post_feeds);

});

/* ==========================================================================
   SECTION 4: EDGE CASES & ERROR HANDLING SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. Re-initialization prevention:
 *    - .vx-event-pagination class added after init
 *    - Selector excludes already-initialized widgets
 *
 * 2. Disabled pagination buttons:
 *    - Click handlers check for .disabled class
 *    - Prev/Next buttons disabled based on data-has-prev/next
 *
 * 3. Page bounds:
 *    - Previous button: Math.max ensures pg >= 1
 *    - Next/Load More: No upper bound (server returns empty)
 *
 * 4. CSS asset deduplication:
 *    - Checks #vx-assets-cache for existing stylesheets
 *    - Uses CSS.escape() for safe ID selectors
 *
 * 5. JS asset deduplication:
 *    - Counts scripts with same ID
 *    - Removes duplicates (keeps first)
 *
 * 6. CSS loading race condition:
 *    - Uses Promise.all to wait for CSS before rendering
 *    - Uses requestAnimationFrame for smooth render
 *
 * 7. Network errors:
 *    - .fail() handler shows Voxel alert
 *    - Loading state is NOT removed on error (potential issue)
 *
 * 8. Dynamic content:
 *    - Triggers 'voxel:markup-update' after content load
 *    - Allows nested widgets to initialize
 *
 * POTENTIAL ISSUES:
 *
 * 1. Loading state on error:
 *    - .vx-loading class not removed on AJAX failure
 *    - User sees perpetual loading state
 *
 * 2. No scroll position management:
 *    - Prev/Next doesn't scroll to top of feed
 *    - User may not see new content
 *
 * 3. No loading indicator for Load More:
 *    - Button doesn't show loading state
 *    - Multiple clicks could queue requests
 */

/* ==========================================================================
   SECTION 5: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── render_post_feeds()
 *        └── For each .ts-post-feed--standalone:not(.vx-event-pagination)
 *            ├── Add .vx-event-pagination class
 *            ├── Parse data-ts-config JSON
 *            └── Bind click handlers for pagination buttons
 *
 * 2. User Clicks Prev/Next/Load More
 *    └── Click handler
 *        ├── event.preventDefault()
 *        ├── Check disabled state (prev/next only)
 *        ├── Update config.filters.pg
 *        └── fetchPosts()
 *
 * 3. fetchPosts() Execution
 *    └── Add .vx-loading class
 *    └── Build URL with jQuery.param(filters)
 *    └── jQuery.get() AJAX call
 *        │
 *        ├── Success:
 *        │   ├── Remove .vx-loading
 *        │   ├── Parse response HTML
 *        │   ├── Inject new CSS to #vx-assets-cache
 *        │   ├── Wait for CSS to load (Promise.all)
 *        │   ├── requestAnimationFrame
 *        │   │   ├── prev_next: Replace .post-feed-grid content
 *        │   │   │   └── Update prev/next button states
 *        │   │   └── load_more: Append to .post-feed-grid
 *        │   │       └── Update load more button visibility
 *        │   ├── Dedupe and inject JS scripts
 *        │   └── Trigger 'voxel:markup-update'
 *        │
 *        └── Failure:
 *            └── Voxel.alert(error)
 *
 * 4. After Content Load
 *    └── 'voxel:markup-update' triggered
 *        └── Other widgets initialize in new content
 *        └── render_post_feeds() runs again (no-op for initialized feeds)
 */

/* ==========================================================================
   SECTION 6: DOM STRUCTURE REFERENCE
   ========================================================================== */

/**
 * EXPECTED DOM STRUCTURE:
 *
 * <div class="ts-post-feed--standalone" data-ts-config="{...}">
 *   <div class="post-feed-grid">
 *     <!-- Post cards rendered here -->
 *   </div>
 *   <div class="feed-pagination">
 *     <!-- Prev/Next Mode: -->
 *     <a class="ts-load-prev">Previous</a>
 *     <a class="ts-load-next">Next</a>
 *
 *     <!-- OR Load More Mode: -->
 *     <a class="ts-load-more">Load More</a>
 *   </div>
 * </div>
 *
 * RESPONSE STRUCTURE (from AJAX):
 *
 * <link rel="stylesheet" id="widget-css" href="...">
 * <div class="post-card">...</div>
 * <div class="post-card">...</div>
 * <script class="info" data-has-prev="true" data-has-next="true"></script>
 * <script type="text/javascript" id="widget-js">...</script>
 */
