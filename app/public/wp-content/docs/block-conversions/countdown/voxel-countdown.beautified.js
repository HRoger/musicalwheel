/**
 * ============================================================================
 * VOXEL COUNTDOWN WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/countdown.js
 * Size: 1.2K
 * Beautified: December 2025
 *
 * PURPOSE:
 * Displays a countdown timer to a target date, showing days, hours,
 * minutes, and seconds remaining. Auto-updates every second with
 * smooth fade animations when values change.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/countdown/frontend.tsx
 *
 * DEPENDENCIES:
 * - jQuery (for DOM selection and event binding)
 *
 * CSS CLASSES:
 * - .ts-countdown-widget: Main container element
 * - .vx-event-timer: Added after initialization (prevents re-init)
 * - .countdown-timer: Container for the time units
 * - .timer-days: Days value element
 * - .timer-hours: Hours value element
 * - .timer-minutes: Minutes value element
 * - .timer-seconds: Seconds value element
 * - .countdown-ended: Message shown when countdown completes
 *
 * CSS ANIMATIONS:
 * - vx-fade-out-up: Applied when value is changing (500ms)
 * - vx-fade-in-up: Applied after value updates
 *
 * DATA ATTRIBUTES:
 * - data-config: JSON configuration object on .ts-countdown-widget
 *
 * ============================================================================
 */

/**
 * VXCONFIG FORMAT (data-config):
 *
 * {
 *   "now": 1703980800,      // Current server timestamp (Unix seconds)
 *   "due": 1735689600       // Target timestamp (Unix seconds)
 * }
 *
 * NOTE: The widget increments 'now' locally each second to maintain
 * synchronization without server calls. This approach handles timezone
 * differences since both timestamps come from the server.
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
    define("countdown", factory);
  } else {
    factory();
  }
})(function() {

  /* ==========================================================================
     SECTION 2: MAIN INITIALIZATION FUNCTION
     ========================================================================== */

  /**
   * Initialize all countdown widgets on the page
   *
   * CALLED BY:
   * - jQuery ready event (initial page load)
   * - 'voxel:markup-update' event (after AJAX content loads)
   *
   * SELECTOR: .ts-countdown-widget:not(.vx-event-timer)
   * The :not(.vx-event-timer) prevents re-initialization of already
   * initialized widgets.
   */
  window.render_countdowns = function() {
    jQuery(".ts-countdown-widget:not(.vx-event-timer)")
      .addClass("vx-event-timer")
      .each(function(index, widgetElement) {

        // Only proceed if the countdown-timer element exists
        if (widgetElement.querySelector(".countdown-timer")) {

          /* ----------------------------------------------------------------
             SECTION 2.1: CONFIGURATION & DOM REFERENCES
             ---------------------------------------------------------------- */

          /**
           * Parse configuration from data attribute
           * @type {Object}
           * @property {number} now - Current timestamp (seconds)
           * @property {number} due - Target timestamp (seconds)
           */
          var config = JSON.parse(widgetElement.dataset.config);

          // Cache DOM element references for performance
          var daysElement = widgetElement.querySelector(".timer-days");
          var hoursElement = widgetElement.querySelector(".timer-hours");
          var minutesElement = widgetElement.querySelector(".timer-minutes");
          var secondsElement = widgetElement.querySelector(".timer-seconds");
          var endedElement = widgetElement.querySelector(".countdown-ended");

          /* ----------------------------------------------------------------
             SECTION 2.2: TICK FUNCTION (Called every second)
             ---------------------------------------------------------------- */

          /**
           * Update the countdown display
           *
           * Called every second by setInterval. Calculates remaining time
           * and updates DOM elements with animated transitions.
           *
           * EDGE CASES:
           * - Widget removed from DOM: Clears interval
           * - Countdown complete (remaining < 0): Shows ended message
           */
          function tick() {
            // Safety check: stop if widget was removed from DOM
            if (!widgetElement) {
              clearInterval(intervalId);
              return;
            }

            // Increment local time (keeps sync with server time)
            config.now++;

            // Calculate remaining seconds
            var remainingSeconds = config.due - config.now;

            // Calculate time units
            var days = Math.floor(remainingSeconds / 86400); // 86400 = 24*60*60
            var hours = Math.floor((remainingSeconds % 86400) / 3600);
            var minutes = Math.floor((remainingSeconds % 3600) / 60);
            var seconds = Math.floor(remainingSeconds % 60);

            /**
             * Update element with fade animation
             *
             * Only triggers animation if value actually changed.
             * Uses CSS animations: vx-fade-out-up -> update -> vx-fade-in-up
             *
             * @param {HTMLElement} element - The DOM element to update
             * @param {number} newValue - The new value to display
             */
            function updateWithAnimation(element, newValue) {
              if (element.innerText != newValue) {
                // Start fade-out animation
                element.style.animationName = "vx-fade-out-up";

                // After 500ms, update value and fade back in
                setTimeout(function() {
                  element.innerText = newValue;
                  element.style.animationName = "vx-fade-in-up";
                }, 500);
              }
            }

            // Update all time unit displays
            updateWithAnimation(daysElement, days);
            updateWithAnimation(hoursElement, hours);
            updateWithAnimation(minutesElement, minutes);
            updateWithAnimation(secondsElement, seconds);

            /* ----------------------------------------------------------------
               SECTION 2.3: COMPLETION HANDLING
               ---------------------------------------------------------------- */

            /**
             * Handle countdown completion
             *
             * When remaining time goes negative:
             * - Clear the interval timer
             * - Hide the countdown timer
             * - Show the "ended" message
             */
            if (remainingSeconds < 0) {
              clearInterval(intervalId);
              widgetElement.querySelector(".countdown-timer").style.display = "none";
              endedElement.style.display = "flex";
            } else {
              // Ensure timer is visible and ended message is hidden
              widgetElement.querySelector(".countdown-timer").style.display = "flex";
              endedElement.style.display = "none";
            }
          }

          /* ----------------------------------------------------------------
             SECTION 2.4: START THE COUNTDOWN
             ---------------------------------------------------------------- */

          // Initial render
          tick();

          // Start interval timer (1000ms = 1 second)
          var intervalId = setInterval(tick, 1000);
        }
      });
  };

  /* ==========================================================================
     SECTION 3: AUTO-INITIALIZATION & EVENT BINDING
     ========================================================================== */

  /**
   * Initialize on DOM ready
   * jQuery(callback) is shorthand for jQuery(document).ready(callback)
   */
  jQuery(window.render_countdowns);

  /**
   * Re-initialize when new markup is added via AJAX
   *
   * The 'voxel:markup-update' event is triggered by Voxel after any
   * AJAX operation that adds new content to the page (e.g., infinite
   * scroll, popup content, etc.)
   */
  jQuery(document).on("voxel:markup-update", window.render_countdowns);

});

/* ==========================================================================
   SECTION 4: EDGE CASES & ERROR HANDLING SUMMARY
   ========================================================================== */

/**
 * EDGE CASES HANDLED:
 *
 * 1. Missing countdown-timer element:
 *    - Widget silently skips initialization
 *    - No error thrown
 *
 * 2. Widget removed from DOM during countdown:
 *    - Interval is cleared on next tick
 *    - Prevents memory leaks
 *
 * 3. Countdown already completed (due < now):
 *    - Immediately shows ended message
 *    - Timer display is hidden
 *
 * 4. Re-initialization prevention:
 *    - .vx-event-timer class added after init
 *    - Selector excludes already-initialized widgets
 *
 * 5. Dynamic content (AJAX):
 *    - Listens for 'voxel:markup-update' event
 *    - New countdown widgets auto-initialize
 *
 * POTENTIAL ISSUES NOT HANDLED:
 *
 * 1. Tab becomes inactive:
 *    - setInterval may throttle in background tabs
 *    - Time drift possible after long inactive periods
 *    - Consider using requestAnimationFrame or web workers for precision
 *
 * 2. Invalid config JSON:
 *    - JSON.parse will throw if malformed
 *    - No try/catch wrapper
 *
 * 3. Missing DOM elements:
 *    - If timer-days etc. don't exist, updateWithAnimation fails silently
 *    - innerText on null throws error
 */

/* ==========================================================================
   SECTION 5: EVENT FLOW DIAGRAM
   ========================================================================== */

/**
 * EVENT FLOW:
 *
 * 1. Page Load
 *    └── jQuery ready
 *        └── render_countdowns()
 *            └── For each .ts-countdown-widget:not(.vx-event-timer)
 *                ├── Add .vx-event-timer class
 *                ├── Parse data-config JSON
 *                ├── Cache DOM references
 *                ├── Call tick() immediately
 *                └── Start setInterval(tick, 1000)
 *
 * 2. Every Second (tick)
 *    └── Increment config.now
 *    └── Calculate remaining time
 *    └── For each time unit:
 *        └── If value changed:
 *            ├── Trigger vx-fade-out-up animation
 *            └── After 500ms: Update value, trigger vx-fade-in-up
 *    └── If remaining < 0:
 *        ├── clearInterval()
 *        ├── Hide .countdown-timer
 *        └── Show .countdown-ended
 *
 * 3. AJAX Content Load
 *    └── Voxel triggers 'voxel:markup-update'
 *        └── render_countdowns() re-runs
 *            └── Initializes any new countdown widgets
 */
