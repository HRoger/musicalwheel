/**
 * ============================================================================
 * VOXEL PRICING PLANS (MEMBERSHIP) WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/pricing-plans.js
 * Size: 1.1K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Handles the "Pick Plan" button clicks for membership/pricing plans.
 * More complex than listing-plans-widget.js because it supports:
 * 1. Dialog confirmations for subscription changes
 * 2. Nested AJAX calls for switch/cancel confirmations
 * 3. Multiple action buttons in confirmation dialogs
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/membership-plans/frontend.tsx
 * (or pricing-plans/)
 *
 * DEPENDENCIES:
 * - jQuery (for AJAX calls)
 * - Voxel.alert (notification system)
 * - Voxel.dialog (modal dialog system)
 * - Voxel_Config.l10n.ajaxError (error message)
 * - localStorage (for cart persistence)
 *
 * CSS CLASSES:
 * - .ts-paid-members-plans: Main container element
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
 * for plan selection (plan ID, user context, etc.)
 *
 * API RESPONSE FORMAT:
 *
 * Success - Dialog Type (subscription change confirmation):
 * {
 *   "success": true,
 *   "type": "dialog",
 *   "dialog": {
 *     "title": "Change Subscription",
 *     "message": "You are about to switch plans...",
 *     "actions": [
 *       {
 *         "label": "Confirm Switch",
 *         "confirm_switch": true,      // Flag for switch action
 *         "link": "https://site.com/api/confirm-switch?..."
 *       },
 *       {
 *         "label": "Cancel Subscription",
 *         "confirm_cancel": true,      // Flag for cancel action
 *         "link": "https://site.com/api/confirm-cancel?..."
 *       },
 *       {
 *         "label": "Keep Current Plan"  // No special flags = just close
 *       }
 *     ]
 *   }
 * }
 *
 * Success - Checkout Type:
 * {
 *   "success": true,
 *   "type": "checkout",
 *   "item": {
 *     "key": "membership_plan_123",
 *     "value": { ... }
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
 *
 * CONFIRMATION ACTION RESPONSE:
 * {
 *   "success": true,
 *   "redirect_to": "https://site.com/account/"
 * }
 */

/**
 * LOCALSTORAGE FORMAT:
 * Key: "voxel:direct_cart"
 *
 * Value (JSON object):
 * {
 *   "membership_plan_123": { ... plan data ... }
 * }
 */

/**
 * VOXEL.DIALOG FORMAT:
 *
 * Voxel.dialog({
 *   title: "Dialog Title",
 *   message: "Dialog message content",
 *   actions: [
 *     {
 *       label: "Button Text",
 *       onClick: function(event) { ... }  // Added by this widget
 *     }
 *   ]
 * });
 *
 * The dialog system renders a modal with the provided actions as buttons.
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
    define("pricingPlans", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: INITIALIZE PLAN BUTTONS
     ========================================================================== */

  /**
   * Initialize all membership plan selection buttons
   *
   * SELECTOR: .ts-paid-members-plans .vx-pick-plan
   *
   * NOTE: Like listing-plans-widget.js, this one:
   * - Does NOT use a render function pattern
   * - Does NOT listen for voxel:markup-update
   * - Initializes once on page load only
   */
  Array.from(document.querySelectorAll(".ts-paid-members-plans .vx-pick-plan"))
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
       * 4. Handle response based on type (dialog, checkout, redirect)
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
               SECTION 2.1.1: DIALOG TYPE RESPONSE
               ---------------------------------------------------------------- */

            /**
             * Handle dialog type response
             *
             * Used for subscription changes that need user confirmation:
             * - Switching from one plan to another
             * - Canceling a subscription
             *
             * The dialog contains actions, some of which may have
             * confirm_switch or confirm_cancel flags that require
             * a nested AJAX call.
             */
            if (response.type === "dialog") {

              // Process each action in the dialog
              response.dialog.actions.forEach(function(action) {

                // Check if action needs confirmation AJAX call
                if (action.confirm_switch || action.confirm_cancel) {

                  /**
                   * Add onClick handler for confirmation actions
                   *
                   * When clicked:
                   * 1. Prevent default
                   * 2. Add loading state
                   * 3. Make confirmation AJAX call
                   * 4. Redirect on success or show error
                   * 5. Remove loading state
                   */
                  action.onClick = function(clickEvent) {
                    clickEvent.preventDefault();

                    // Add loading state
                    planContainer.classList.add("vx-pending");

                    // Make confirmation AJAX request
                    jQuery.get(action.link).always(function(confirmResponse) {

                      if (confirmResponse.success) {
                        // Redirect to success page
                        window.location.href = confirmResponse.redirect_to;
                      } else {
                        // Show error
                        Voxel.alert(
                          confirmResponse.message || Voxel_Config.l10n.ajaxError,
                          "error"
                        );
                      }

                      // Remove loading state
                      planContainer.classList.remove("vx-pending");
                    });
                  };
                }
              });

              // Show the dialog with modified actions
              Voxel.dialog(response.dialog);
            }

            /* ----------------------------------------------------------------
               SECTION 2.1.2: CHECKOUT TYPE RESPONSE
               ---------------------------------------------------------------- */

            /**
             * Handle checkout type response
             *
             * Same as listing-plans-widget.js:
             * - Stores item in localStorage as "direct cart"
             * - Redirects to checkout page
             */
            else if (response.type === "checkout") {
              // Store cart item in localStorage
              localStorage.setItem("voxel:direct_cart", JSON.stringify({
                [response.item.key]: response.item.value
              }));

              // Redirect to checkout
              window.location.href = response.checkout_link;
            }

            /* ----------------------------------------------------------------
               SECTION 2.1.3: REDIRECT TYPE RESPONSE
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
               SECTION 2.1.4: LEGACY REDIRECT RESPONSE
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
               SECTION 2.1.5: ERROR RESPONSE
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
 *    - "dialog": Show confirmation dialog with actions
 *    - "checkout": Store cart + redirect
 *    - "redirect": Direct redirect
 *    - Legacy redirect_url fallback
 *
 * 2. Dialog action types:
 *    - confirm_switch: Subscription switch confirmation
 *    - confirm_cancel: Subscription cancel confirmation
 *    - No flags: Regular button (likely "Cancel" / close)
 *
 * 3. Nested AJAX for confirmations:
 *    - Dialog actions with confirm_* flags trigger secondary AJAX
 *    - Loading state managed for nested calls
 *
 * 4. Error responses:
 *    - Main request errors
 *    - Confirmation request errors
 *    - Both show message via Voxel.alert
 *
 * 5. Loading state:
 *    - .vx-pending class added during request
 *    - Managed for both main and nested requests
 *
 * POTENTIAL ISSUES:
 *
 * 1. No re-initialization support:
 *    - Doesn't listen for voxel:markup-update
 *    - Dynamically loaded plans won't work
 *
 * 2. No duplicate click prevention:
 *    - User can click multiple times
 *    - Could result in multiple dialogs/redirects
 *
 * 3. Dialog not closed on confirmation:
 *    - After clicking confirm action, dialog may remain open
 *    - Redirect happens, but UI state is inconsistent briefly
 *
 * 4. Loading state on dialog actions:
 *    - Loading state is on plan container, not dialog
 *    - User may not see loading indicator in dialog
 *
 * 5. Non-confirmation dialog actions:
 *    - Actions without confirm_switch/confirm_cancel don't get onClick
 *    - They rely on Voxel.dialog's default behavior (unclear)
 */

/* ==========================================================================
   SECTION 4: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── For each .ts-paid-members-plans .vx-pick-plan
 *        └── Bind click event handler
 *
 * 2. User Clicks "Pick Plan" Button
 *    └── Click handler
 *        ├── event.preventDefault()
 *        ├── Add .vx-pending to .ts-plan-container
 *        └── jQuery.get(button.href)
 *
 * 3. AJAX Response (Main Request)
 *    └── .always() callback
 *        │
 *        ├── Success + type="dialog":
 *        │   ├── For each action with confirm_switch or confirm_cancel:
 *        │   │   └── Add onClick handler (nested AJAX)
 *        │   └── Voxel.dialog(response.dialog)
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
 *
 * 4. User Clicks Dialog Confirmation Action
 *    └── action.onClick (if confirm_switch or confirm_cancel)
 *        ├── event.preventDefault()
 *        ├── Add .vx-pending to .ts-plan-container
 *        └── jQuery.get(action.link)
 *            │
 *            ├── Success:
 *            │   └── window.location.href = redirect_to
 *            │
 *            └── Error:
 *                └── Voxel.alert(message, "error")
 *            │
 *            └── Always:
 *                └── Remove .vx-pending from .ts-plan-container
 */

/* ==========================================================================
   SECTION 5: DOM STRUCTURE REFERENCE
   ========================================================================== */

/**
 * EXPECTED DOM STRUCTURE:
 *
 * <div class="ts-paid-members-plans">
 *   <div class="ts-plan-container">
 *     <div class="plan-details">
 *       <h3>Free</h3>
 *       <p>$0/month</p>
 *       <ul class="features">
 *         <li>Basic features</li>
 *       </ul>
 *     </div>
 *     <a href="/api/select-membership?plan=free" class="vx-pick-plan">
 *       Select Plan
 *     </a>
 *   </div>
 *   <div class="ts-plan-container ts-current-plan">
 *     <div class="plan-details">
 *       <h3>Pro</h3>
 *       <p>$10/month</p>
 *       <span class="current-badge">Current Plan</span>
 *     </div>
 *     <a href="/api/select-membership?plan=pro" class="vx-pick-plan">
 *       Manage Plan
 *     </a>
 *   </div>
 *   <div class="ts-plan-container">
 *     <div class="plan-details">
 *       <h3>Enterprise</h3>
 *       <p>$50/month</p>
 *     </div>
 *     <a href="/api/select-membership?plan=enterprise" class="vx-pick-plan">
 *       Upgrade
 *     </a>
 *   </div>
 * </div>
 */

/* ==========================================================================
   SECTION 6: USE CASES
   ========================================================================== */

/**
 * USE CASE 1: New User Selecting First Plan
 *
 * 1. User clicks "Select Plan" on Free tier
 * 2. Server returns type="redirect" (no payment needed)
 * 3. User redirected to success/dashboard page
 *
 * USE CASE 2: User Upgrading to Paid Plan
 *
 * 1. User clicks "Upgrade" on Pro tier
 * 2. Server returns type="checkout"
 * 3. Cart stored in localStorage
 * 4. User redirected to checkout page
 * 5. After payment, subscription activated
 *
 * USE CASE 3: User Switching Between Paid Plans
 *
 * 1. User (on Pro) clicks "Upgrade" on Enterprise
 * 2. Server returns type="dialog" with proration info
 * 3. Dialog shows: "You'll be charged $40 for the difference"
 * 4. Actions: "Confirm Switch" (confirm_switch), "Cancel"
 * 5. User clicks "Confirm Switch"
 * 6. Nested AJAX processes the switch
 * 7. User redirected to success page
 *
 * USE CASE 4: User Canceling Subscription
 *
 * 1. User clicks "Manage" on current plan
 * 2. Server returns type="dialog"
 * 3. Dialog shows cancellation options
 * 4. Actions: "Cancel Subscription" (confirm_cancel), "Keep Plan"
 * 5. User clicks "Cancel Subscription"
 * 6. Nested AJAX processes cancellation
 * 7. User redirected to confirmation page
 */
