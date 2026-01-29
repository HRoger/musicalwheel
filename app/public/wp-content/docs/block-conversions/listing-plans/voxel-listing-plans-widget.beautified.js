/**
 * ============================================================================
 * VOXEL LISTING PLANS WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/listing-plans-widget.js
 * Size: 710B
 * Beautified: December 2025
 *
 * PURPOSE:
 * Handles the "Pick Plan" button clicks for listing plans (paid listings).
 * When a user selects a listing plan, this widget:
 * 1. Makes an AJAX request to validate/prepare the plan
 * 2. Handles different response types (checkout, redirect)
 * 3. Stores cart data in localStorage for checkout flow
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/listing-plans/frontend.tsx
 *
 * DEPENDENCIES:
 * - jQuery (for AJAX calls)
 * - Voxel.alert (notification system)
 * - Voxel_Config.l10n.ajaxError (error message)
 * - localStorage (for cart persistence)
 *
 * CSS CLASSES:
 * - .ts-paid-listings-plans: Main container element
 * - .vx-pick-plan: Plan selection button/link
 * - .ts-plan-container: Individual plan card container
 * - .vx-pending: Added during AJAX request (loading state)
 *
 * DATA ATTRIBUTES:
 * - href: On .vx-pick-plan - The AJAX endpoint URL
 *
 * ============================================================================
 */

/**
 * API REQUEST FORMAT:
 * GET {href from button}
 *
 * The href attribute contains the full URL with all necessary parameters
 * for plan selection (plan ID, post ID, etc.)
 *
 * API RESPONSE FORMAT:
 *
 * Success - Checkout Type:
 * {
 *   "success": true,
 *   "type": "checkout",
 *   "item": {
 *     "key": "listing_plan_123",    // Cart item key
 *     "value": { ... }              // Cart item data
 *   },
 *   "checkout_link": "https://site.com/checkout/"
 * }
 *
 * Success - Redirect Type:
 * {
 *   "success": true,
 *   "type": "redirect",
 *   "redirect_to": "https://site.com/success/"
 * }
 *
 * Success - Legacy Redirect:
 * {
 *   "success": true,
 *   "redirect_url": "https://site.com/success/"
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
 * Key: "voxel:direct_cart"
 *
 * Value (JSON object):
 * {
 *   "listing_plan_123": { ... plan data ... }
 * }
 *
 * This is used by the checkout page to know what item to process.
 * The "direct cart" pattern bypasses the normal cart flow.
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
    define("listingPlansWidget", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: INITIALIZE PLAN BUTTONS
     ========================================================================== */

  /**
   * Initialize all listing plan selection buttons
   *
   * SELECTOR: .ts-paid-listings-plans .vx-pick-plan
   *
   * NOTE: Unlike other Voxel widgets, this one:
   * - Does NOT use a render function pattern
   * - Does NOT listen for voxel:markup-update
   * - Initializes once on page load only
   *
   * This means dynamically loaded listing plans won't work without
   * manual re-initialization.
   */
  Array.from(document.querySelectorAll(".ts-paid-listings-plans .vx-pick-plan"))
    .forEach(function(buttonElement) {

      // Get the parent plan container for loading state
      var planContainer = buttonElement.closest(".ts-plan-container");

      /* ----------------------------------------------------------------
         SECTION 2.1: CLICK HANDLER
         ---------------------------------------------------------------- */

      /**
       * Handle plan selection button click
       *
       * Flow:
       * 1. Prevent default link behavior
       * 2. Add loading state to plan container
       * 3. Make AJAX request to button's href
       * 4. Handle response based on type
       * 5. Remove loading state
       */
      buttonElement.addEventListener("click", function(event) {
        event.preventDefault();

        // Add loading state
        planContainer.classList.add("vx-pending");

        // Make AJAX request
        jQuery.get(event.currentTarget.href).always(function(response) {

          if (response.success) {

            /* ----------------------------------------------------------------
               SECTION 2.1.1: CHECKOUT TYPE RESPONSE
               ---------------------------------------------------------------- */

            /**
             * Handle checkout type response
             *
             * - Stores item in localStorage as "direct cart"
             * - Redirects to checkout page
             *
             * The checkout page reads from voxel:direct_cart to know
             * what item to process.
             */
            if (response.type === "checkout") {
              // Store cart item in localStorage
              localStorage.setItem("voxel:direct_cart", JSON.stringify({
                [response.item.key]: response.item.value
              }));

              // Redirect to checkout
              window.location.href = response.checkout_link;
            }

            /* ----------------------------------------------------------------
               SECTION 2.1.2: REDIRECT TYPE RESPONSE
               ---------------------------------------------------------------- */

            /**
             * Handle redirect type response
             *
             * Used when no checkout is needed (e.g., free plan)
             */
            else if (response.type === "redirect") {
              window.location.href = response.redirect_to;
            }

            /* ----------------------------------------------------------------
               SECTION 2.1.3: LEGACY REDIRECT RESPONSE
               ---------------------------------------------------------------- */

            /**
             * Handle legacy redirect_url response
             *
             * Fallback for older response format
             */
            else if (response.redirect_url) {
              window.location.href = response.redirect_url;
            }

          } else {

            /* ----------------------------------------------------------------
               SECTION 2.1.4: ERROR RESPONSE
               ---------------------------------------------------------------- */

            /**
             * Handle error response
             *
             * Shows error message using Voxel alert system
             */
            Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
          }

          // Remove loading state
          planContainer.classList.remove("vx-pending");
        });
      });
    });

});

/* ==========================================================================
   SECTION 3: EDGE CASES & ERROR HANDLING SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. Multiple response types:
 *    - "checkout": Store cart + redirect
 *    - "redirect": Direct redirect
 *    - Legacy redirect_url fallback
 *
 * 2. Error responses:
 *    - Shows message via Voxel.alert
 *    - Falls back to generic error message
 *
 * 3. Loading state:
 *    - .vx-pending class added during request
 *    - Removed on both success and error (.always())
 *
 * POTENTIAL ISSUES:
 *
 * 1. No re-initialization support:
 *    - Doesn't listen for voxel:markup-update
 *    - Dynamically loaded plans won't work
 *
 * 2. No duplicate click prevention:
 *    - User can click multiple times
 *    - Could result in multiple redirects
 *
 * 3. No confirmation dialog:
 *    - Plan is selected immediately on click
 *    - Unlike pricing-plans.js which supports dialogs
 *
 * 4. localStorage dependency:
 *    - Will fail in private browsing if localStorage blocked
 *    - No error handling for localStorage.setItem
 */

/* ==========================================================================
   SECTION 4: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── For each .ts-paid-listings-plans .vx-pick-plan
 *        └── Bind click event handler
 *
 * 2. User Clicks "Pick Plan" Button
 *    └── Click handler
 *        ├── event.preventDefault()
 *        ├── Add .vx-pending to .ts-plan-container
 *        └── jQuery.get(button.href)
 *
 * 3. AJAX Response
 *    └── .always() callback
 *        │
 *        ├── Success + type="checkout":
 *        │   ├── localStorage.setItem("voxel:direct_cart", ...)
 *        │   └── window.location.href = checkout_link
 *        │
 *        ├── Success + type="redirect":
 *        │   └── window.location.href = redirect_to
 *        │
 *        ├── Success + redirect_url (legacy):
 *        │   └── window.location.href = redirect_url
 *        │
 *        └── Error:
 *            └── Voxel.alert(message, "error")
 *        │
 *        └── Always:
 *            └── Remove .vx-pending from .ts-plan-container
 */

/* ==========================================================================
   SECTION 5: DOM STRUCTURE REFERENCE
   ========================================================================== */

/**
 * EXPECTED DOM STRUCTURE:
 *
 * <div class="ts-paid-listings-plans">
 *   <div class="ts-plan-container">
 *     <div class="plan-details">
 *       <h3>Basic Plan</h3>
 *       <p>$10/month</p>
 *     </div>
 *     <a href="/api/select-plan?plan=basic&post=123" class="vx-pick-plan">
 *       Pick Plan
 *     </a>
 *   </div>
 *   <div class="ts-plan-container">
 *     <div class="plan-details">
 *       <h3>Premium Plan</h3>
 *       <p>$25/month</p>
 *     </div>
 *     <a href="/api/select-plan?plan=premium&post=123" class="vx-pick-plan">
 *       Pick Plan
 *     </a>
 *   </div>
 * </div>
 *
 * LOADING STATE:
 * When .vx-pending is added to .ts-plan-container, CSS should:
 * - Show a loading spinner
 * - Disable pointer events
 * - Reduce opacity
 */

/* ==========================================================================
   SECTION 6: COMPARISON WITH PRICING-PLANS.JS
   ========================================================================== */

/**
 * DIFFERENCES FROM pricing-plans.js:
 *
 * This widget (listing-plans-widget.js):
 * - For selecting plans when CREATING a listing
 * - No dialog support
 * - No confirm_switch/confirm_cancel actions
 * - Simpler flow: click -> checkout/redirect
 *
 * pricing-plans.js:
 * - For selecting MEMBERSHIP plans (user subscription)
 * - Supports dialog responses with multiple actions
 * - Handles subscription switching with confirmations
 * - More complex flow with nested AJAX calls
 *
 * Both share:
 * - Same response type handling (checkout, redirect)
 * - Same localStorage cart pattern
 * - Same loading state class (.vx-pending)
 * - Same error handling pattern
 */
