/**
 * ============================================================================
 * VOXEL COMMONS - BEAUTIFIED REFERENCE (LEVEL 2)
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/commons.js
 * Size: 17KB
 * Beautified: December 2025
 * Beautification Level: 2 (Deep - Full variable renaming + JSDoc)
 *
 * PURPOSE:
 * Core utility library for ALL Voxel widgets. Provides:
 * - Global Voxel object with helpers and utilities
 * - Vue.js mixins (base, blurable, popup)
 * - Reusable Vue components (popup, formGroup)
 * - Alert/dialog/notification system
 * - Event handlers for common UI patterns
 * - Cart operations and authentication helpers
 *
 * CRITICAL IMPORTANCE:
 * This file is the FOUNDATION for understanding ALL Voxel widgets.
 * Every widget depends on these utilities, mixins, and components.
 *
 * DEPENDENCIES:
 * - Vue.js 3 (Vue.createApp, Vue component system)
 * - jQuery (for DOM manipulation and AJAX)
 * - Voxel_Config (global configuration object from WordPress)
 *
 * PROVIDES GLOBAL OBJECTS:
 * - window.Voxel (main namespace)
 * - window.Voxel.mixins (Vue mixins)
 * - window.Voxel.components (Vue components)
 * - window.Voxel.helpers (utility functions)
 * - window.Voxel.Maps (map utilities)
 * - window.render_static_popups (initializer function)
 *
 * ============================================================================
 */

/**
 * VOXEL GLOBAL OBJECT STRUCTURE:
 *
 * window.Voxel = {
 *   // Vue Mixins
 *   mixins: {
 *     base: {},           // Base mixin for all widgets (provides widget_id, post_id)
 *     blurable: {},       // Click-outside-to-close behavior
 *     popup: {}           // Popup positioning logic (calculates position relative to trigger)
 *   },
 *
 *   // Vue Components
 *   components: {
 *     popup: {},          // Popup wrapper component
 *     formGroup: {}       // Form group with popup toggle
 *   },
 *
 *   // Map Utilities
 *   Maps: {
 *     await(callback),    // Wait for maps library to load, then call callback
 *     Loaded: boolean     // Flag set to true when maps library loads
 *   },
 *
 *   // Helper Functions
 *   helpers: {
 *     getParent(vm, name),           // Find parent Vue component by name
 *     dateFormatYmd(date),           // Format date as YYYY-MM-DD
 *     dateTimeFormat(date),          // Localized date+time string
 *     dateFormat(date),              // Localized date only
 *     timeFormat(date),              // Localized time only
 *     currencyFormat(amount, code),  // Localized currency string
 *     debounce(fn, delay, transform),// Debounce function calls
 *     viewportPercentage(element),   // Calculate % of element visible in viewport
 *     sequentialId(),                // Auto-increment ID generator
 *     randomId(length)               // Random alphanumeric ID generator
 *   },
 *
 *   // UI Functions
 *   dialog(options),                 // Show dialog/notification with custom actions
 *   alert(message, type, actions, timeout), // Show auto-dismissing notification
 *   prompt(message, type, actions),  // Show prompt that requires user action
 *   authRequired(message),           // Show login/register prompt
 *   requireAuth(event),              // Prevent action if user not logged in
 *
 *   // URL Helpers
 *   getSearchParam(key),             // Get URL query parameter
 *   setSearchParam(key, value),      // Set URL query parameter (updates URL)
 *   deleteSearchParam(key),          // Remove URL query parameter
 *
 *   // Sharing & Clipboard
 *   share(data),                     // Native Web Share API
 *   copy(text),                      // Copy text to clipboard
 *
 *   // Navigation
 *   loadTab(event, tabsId, tabKey),  // Load tab content via AJAX
 *   scrollTo(element),               // Smooth scroll to element
 *
 *   // Cart & Cookies
 *   getCookie(name),                 // Get cookie value by name
 *   openCart(),                      // Open cart popup
 *   addToCartAction(event, button)   // Quick add to cart (single-click)
 * }
 *
 * VOXEL_CONFIG GLOBAL (provided by WordPress/Voxel):
 * {
 *   "ajax_url": "/?vx=1",               // Voxel AJAX endpoint
 *   "is_logged_in": true,               // User login status
 *   "login_url": "/login",              // Login page URL
 *   "register_url": "/register",        // Registration page URL
 *   "currency": "USD",                  // Default currency code
 *   "locale": "en_US",                  // WordPress locale
 *   "is_rtl": false,                    // Right-to-left layout flag
 *   "l10n": {                           // Localized strings
 *     "ajaxError": "Something went wrong",
 *     "accountRequired": "Please log in to continue",
 *     "login": "Log In",
 *     "register": "Sign Up",
 *     "copied": "Copied!",
 *     "added_to_cart": "Added to cart",
 *     "view_cart": "View Cart"
 *   },
 *   "maps": {
 *     "provider": "google_maps"         // Active map provider
 *   },
 *   "google_maps": {
 *     "handle": "google-maps-api"       // Script handle for Google Maps
 *   }
 * }
 */

/* ==========================================================================
   SECTION 1: AMD/UMD WRAPPER & INITIALIZATION
   ========================================================================== */

/**
 * Universal Module Definition (UMD) wrapper
 * Allows the commons module to be loaded via AMD or as a global
 *
 * @param {Function} factory - Factory function that initializes Voxel
 */
((factory) => {
	"function" == typeof define && define.amd ? define("commons", factory) : factory();
})(function () {
	/* ==========================================================================
	   SECTION 2: VOXEL GLOBAL OBJECT
	   ========================================================================== */

	/**
	 * Initialize the global Voxel object
	 * This object serves as the main namespace for all Voxel utilities
	 */
	window.Voxel = {
		mixins: {},
		components: {},

		/* ======================================================================
		   SUBSECTION 2.1: MAPS UTILITIES
		   ====================================================================== */

		Maps: {
			/**
			 * Wait for Google Maps (or other provider) to load, then execute callback
			 *
			 * @param {Function} callback - Function to call when maps library is loaded
			 *
			 * BEHAVIOR:
			 * 1. If maps already loaded (Voxel.Maps.Loaded === true), call callback immediately
			 * 2. Otherwise, listen for "maps:loaded" event and lazy-load the script
			 * 3. Triggers script load by setting src from data-src attribute
			 *
			 * USAGE:
			 * Voxel.Maps.await(() => {
			 *   // Maps API is now available
			 *   new google.maps.Map(...)
			 * });
			 */
			await(callback) {
				if (Voxel.Maps.Loaded) {
					// Maps already loaded, execute callback immediately
					callback();
				} else {
					// Wait for maps to load
					document.addEventListener("maps:loaded", () => callback());

					// Trigger lazy loading of maps script if not yet loaded
					var mapProvider = Voxel_Config[Voxel_Config.maps.provider]?.handle;
					if (mapProvider) {
						var scriptElement = document.getElementById(mapProvider);
						if (scriptElement) {
							// Trigger load by copying data-src to src
							scriptElement.src = scriptElement.dataset.src;
						}
					}
				}
			},
		},

		/* ======================================================================
		   SUBSECTION 2.2: HELPER FUNCTIONS
		   ====================================================================== */

		helpers: {
			/**
			 * Find a parent Vue component by name
			 *
			 * @param {Object} vueInstance - Starting Vue component instance
			 * @param {string} componentName - Name of parent component to find
			 * @returns {Object|null} Parent component instance or null if not found
			 *
			 * USAGE:
			 * const parent = Voxel.helpers.getParent(this, 'search-form');
			 */
			getParent(vueInstance, componentName) {
				var foundParent = null;
				var currentParent = vueInstance.$parent;

				// Walk up the component tree
				while (currentParent && !foundParent) {
					if (currentParent.$options.name === componentName) {
						foundParent = currentParent;
					}
					currentParent = currentParent.$parent;
				}

				return foundParent;
			},

			/**
			 * Format a Date object as YYYY-MM-DD
			 *
			 * @param {Date} date - JavaScript Date object
			 * @returns {string} Date formatted as "YYYY-MM-DD"
			 *
			 * EXAMPLE: dateFormatYmd(new Date('2025-12-31')) => "2025-12-31"
			 */
			dateFormatYmd(date) {
				return [
					date.getFullYear(),
					("0" + (date.getMonth() + 1)).slice(-2), // Pad month with leading zero
					("0" + date.getDate()).slice(-2),        // Pad day with leading zero
				].join("-");
			},

			/**
			 * Format date and time using browser locale
			 *
			 * @param {Date} date - JavaScript Date object
			 * @returns {string} Localized date+time string (e.g., "Dec 22, 2025, 3:45 PM")
			 *
			 * USES: Intl.DateTimeFormat with medium date and short time
			 */
			dateTimeFormat(date) {
				return date.toLocaleString(void 0, {
					dateStyle: "medium",
					timeStyle: "short",
				});
			},

			/**
			 * Format date only (no time) using browser locale
			 *
			 * @param {Date} date - JavaScript Date object
			 * @returns {string} Localized date string (e.g., "Dec 22, 2025")
			 */
			dateFormat(date) {
				return date.toLocaleString(void 0, { dateStyle: "medium" });
			},

			/**
			 * Format time only (no date) using browser locale
			 *
			 * @param {Date} date - JavaScript Date object
			 * @returns {string} Localized time string (e.g., "3:45 PM")
			 */
			timeFormat(date) {
				return date.toLocaleString(void 0, { timeStyle: "short" });
			},

			/**
			 * Format currency amount using Intl.NumberFormat
			 *
			 * @param {number} amount - Numeric amount to format
			 * @param {string} [currencyCode=Voxel_Config.currency] - ISO currency code (USD, EUR, etc.)
			 * @returns {string} Formatted currency string (e.g., "$12.50" or "€10")
			 *
			 * BEHAVIOR:
			 * - Shows decimals only if amount has fractional part
			 * - Falls back to "CODE amount" if formatting fails
			 *
			 * EXAMPLES:
			 * currencyFormat(12.5, 'USD')  => "$12.50"
			 * currencyFormat(10, 'EUR')    => "€10"
			 */
			currencyFormat(amount, currencyCode = Voxel_Config.currency) {
				try {
					var hasFractionalPart = amount % 1 != 0;

					return new Intl.NumberFormat(Voxel_Config.locale.replace("_", "-"), {
						style: "currency",
						currency: currencyCode,
						minimumFractionDigits: hasFractionalPart ? 2 : 0,
						maximumFractionDigits: hasFractionalPart ? 2 : 0,
					}).format(amount);
				} catch (error) {
					// Fallback if Intl.NumberFormat fails
					return currencyCode + " " + amount;
				}
			},

			/**
			 * Debounce a function call
			 *
			 * @param {Function} func - Function to debounce
			 * @param {number} [delay=200] - Delay in milliseconds
			 * @param {Function|null} [transformArgs=null] - Optional function to transform arguments
			 * @returns {Function} Debounced function
			 *
			 * BEHAVIOR:
			 * - Delays function execution until `delay` ms have passed since last call
			 * - If transformArgs provided, applies it to arguments before passing to func
			 *
			 * USAGE:
			 * const debouncedSearch = Voxel.helpers.debounce(searchFunction, 300);
			 * input.addEventListener('keyup', debouncedSearch);
			 */
			debounce(func, delay = 200, transformArgs = null) {
				let timeoutId;

				return (...args) => {
					clearTimeout(timeoutId);

					// Transform arguments if transformer provided
					if ("function" == typeof transformArgs) {
						args = transformArgs(args);
					}

					timeoutId = setTimeout(() => {
						func.apply(this, args);
					}, delay);
				};
			},

			/**
			 * Calculate what percentage of an element is visible in the viewport
			 *
			 * @param {HTMLElement} element - DOM element to measure
			 * @returns {number} Percentage visible (0.0 to 1.0)
			 *
			 * RETURN VALUES:
			 * - 0: Element completely outside viewport
			 * - 1: Element completely fills viewport (or element fully visible + viewport smaller than element)
			 * - 0.0-1.0: Partial visibility
			 *
			 * USAGE: Track scroll progress, lazy loading, animations
			 */
			viewportPercentage(element) {
				var rect = element.getBoundingClientRect();
				var viewportHeight = window.innerHeight;

				// Element completely outside viewport (above or below)
				if (rect.top >= viewportHeight || rect.bottom <= 0) {
					return 0;
				}

				// Element larger than viewport and fills it
				if (rect.top < 0 && rect.bottom > viewportHeight) {
					return 1;
				}

				// Calculate visible portion
				var hiddenAbove = rect.top < 0 ? Math.abs(rect.top) : 0;
				var hiddenBelow = viewportHeight < rect.bottom ? rect.bottom - viewportHeight : 0;
				var visibleHeight = rect.height - hiddenAbove - hiddenBelow;

				return visibleHeight / viewportHeight;
			},

			/**
			 * Generate sequential numeric IDs
			 *
			 * @returns {number} Auto-incrementing ID (1, 2, 3, ...)
			 *
			 * USAGE: Generate unique IDs for DOM elements
			 * NOTE: Counter persists across calls (maintains state)
			 */
			sequentialId() {
				if (!this.count) {
					this.count = 1;
				}
				return this.count++;
			},

			/**
			 * Generate random alphanumeric ID
			 *
			 * @param {number} [length=8] - Length of ID to generate
			 * @returns {string} Random ID (e.g., "a3k9m2x1")
			 *
			 * CHARACTER SET: 0-9, a-z (36 characters)
			 *
			 * USAGE: Generate unique file IDs, session tokens, etc.
			 */
			randomId(length = 8) {
				var chars = "0123456789abcdefghijklmnopqrstuvwxyz";
				var maxIndex = chars.length - 1;
				let result = "";

				for (let i = 0; i < length; i++) {
					var randomIndex = Math.floor(0 + Math.random() * (maxIndex - 0 + 1));
					result += chars[randomIndex];
				}

				return result;
			},
		},

		/* ======================================================================
		   SUBSECTION 2.3: DIALOG & NOTIFICATION SYSTEM
		   ====================================================================== */

		/**
		 * Show a dialog/notification with optional action buttons
		 *
		 * @param {Object} options - Dialog options
		 * @param {string} options.message - Message text to display
		 * @param {string} [options.type='info'] - Dialog type: 'info', 'success', 'error', 'warning'
		 * @param {Array} [options.actions=[]] - Array of action objects: {label, link, onClick}
		 * @param {number} [options.timeout=7500] - Auto-dismiss timeout in ms (-1 to disable)
		 * @param {boolean} [options.hideClose=false] - Hide the close button
		 * @param {string} [options.closeLabel] - Custom text for close button
		 *
		 * DOM REQUIREMENTS:
		 * - Template element: #vx-alert-tpl with placeholders {type}, {message}
		 * - Container element: #vx-alert
		 *
		 * CSS CLASSES:
		 * - .ts-notice: Main notification container
		 * - .alert-actions: Container for action buttons
		 * - .close-alert: Close button
		 *
		 * USAGE:
		 * Voxel.dialog({
		 *   message: 'Item deleted',
		 *   type: 'success',
		 *   actions: [{label: 'Undo', link: '#', onClick: undoFn}],
		 *   timeout: 5000
		 * });
		 */
		dialog(options = {}) {
			var message = "string" == typeof options.message ? options.message : "";

			if (!message.length) {
				return; // No message, don't show dialog
			}

			var type = "string" == typeof options.type && options.type.length ? options.type : "info";
			var actions = Array.isArray(options.actions) ? options.actions : [];
			var timeout = "number" == typeof options.timeout ? options.timeout : 7500;
			var hideClose = !!options.hideClose;

			// Get template and replace placeholders
			var template = document
				.getElementById("vx-alert-tpl")
				.textContent.replace("{type}", type || "info")
				.replace("{message}", message);

			let $alert = jQuery(template).hide();

			// Add action buttons (reverse order for prepend)
			if (actions.length) {
				actions.reverse().forEach((action) => {
					var $button = jQuery('<a href="javascript:void(0);" class="ts-btn ts-btn-4">')
						.attr({ href: action.link })
						.html(action.label);

					if ("function" == typeof action.onClick) {
						$button.on("click", action.onClick);
					}

					// Close dialog when action clicked
					$button.on("click", () => $alert.find(".close-alert").click());

					$alert.find(".alert-actions").prepend($button);
				});
			}

			// Hide close button if requested
			if (hideClose) {
				$alert.find(".close-alert").hide();
			}

			// Setup close button handler
			$alert.find(".close-alert").on("click", (event) => {
				event.preventDefault();
				$alert.fadeOut(100, () => $alert.remove());
			});

			// Custom close label
			if ("string" == typeof options.closeLabel && options.closeLabel.length) {
				$alert.find(".close-alert").html(options.closeLabel);
			}

			// Auto-dismiss timeout
			if ("number" == typeof timeout && 0 < timeout) {
				setTimeout(() => $alert.fadeOut(100, () => $alert.remove()), timeout);
			}

			// Show the dialog
			jQuery("#vx-alert").html($alert);
			$alert.fadeIn(100);
		},

		/**
		 * Show an auto-dismissing alert notification
		 *
		 * @param {string} message - Message to display
		 * @param {string} [type='info'] - Alert type: 'info', 'success', 'error', 'warning'
		 * @param {Array} [actions=[]] - Optional action buttons
		 * @param {number} [timeout=7500] - Auto-dismiss timeout in ms
		 *
		 * USAGE:
		 * Voxel.alert('Changes saved!', 'success');
		 * Voxel.alert('An error occurred', 'error', [], 5000);
		 */
		alert(message, type = "info", actions = [], timeout = 7500) {
			Voxel.dialog({ message, type, actions, timeout });
		},

		/**
		 * Show a prompt that requires user action (no auto-dismiss)
		 *
		 * @param {string} message - Message to display
		 * @param {string} [type='info'] - Prompt type
		 * @param {Array} [actions=[]] - Action buttons (user must click one or close)
		 * @param {number} [timeout=-1] - Timeout in ms (-1 = no auto-dismiss)
		 *
		 * DIFFERENCE FROM alert():
		 * - Close button hidden by default (hideClose: true)
		 * - No auto-dismiss (timeout: -1)
		 * - Forces user to interact with action buttons
		 *
		 * USAGE:
		 * Voxel.prompt('Delete this item?', 'warning', [
		 *   {label: 'Delete', link: '#', onClick: deleteFn},
		 *   {label: 'Cancel', link: '#', onClick: cancelFn}
		 * ]);
		 */
		prompt(message, type = "info", actions = [], timeout = -1) {
			Voxel.dialog({ message, type, actions, timeout, hideClose: true });
		},

		/* ======================================================================
		   SUBSECTION 2.4: AUTHENTICATION HELPERS
		   ====================================================================== */

		/**
		 * Show "Please log in" prompt with login/register buttons
		 *
		 * @param {string|null} [message=null] - Custom message (defaults to l10n.accountRequired)
		 *
		 * BEHAVIOR:
		 * - Shows alert with login and register links
		 * - Links point to Voxel_Config.login_url and register_url
		 * - Auto-dismisses after 7.5 seconds
		 *
		 * USAGE:
		 * if (!Voxel_Config.is_logged_in) {
		 *   Voxel.authRequired();
		 * }
		 */
		authRequired(message = null) {
			if (null === message) {
				message = Voxel_Config.l10n.accountRequired;
			}

			Voxel.alert(
				message,
				"info",
				[
					{ link: Voxel_Config.login_url, label: Voxel_Config.l10n.login },
					{ link: Voxel_Config.register_url, label: Voxel_Config.l10n.register },
				],
				7500
			);
		},

		/**
		 * Event handler: prevent action and show login prompt if user not logged in
		 *
		 * @param {Event} event - DOM event to prevent
		 *
		 * USAGE:
		 * <a href="#" @click="Voxel.requireAuth">Follow</a>
		 *
		 * BEHAVIOR:
		 * - If user logged in: does nothing (event proceeds)
		 * - If user not logged in: prevents event, shows authRequired prompt
		 */
		requireAuth(event) {
			if (!Voxel_Config.is_logged_in) {
				event.preventDefault();
				Voxel.authRequired();
			}
		},

		/* ======================================================================
		   SUBSECTION 2.5: URL PARAMETER HELPERS
		   ====================================================================== */

		/**
		 * Get URL query parameter value
		 *
		 * @param {string} paramName - Parameter name
		 * @returns {string|null} Parameter value or null if not found
		 *
		 * EXAMPLE: For URL "/?search=test&sort=date"
		 * Voxel.getSearchParam('search') => "test"
		 * Voxel.getSearchParam('sort') => "date"
		 * Voxel.getSearchParam('missing') => null
		 */
		getSearchParam(paramName) {
			return new URL(window.location).searchParams.get(paramName);
		},

		/**
		 * Set URL query parameter (updates browser URL without reload)
		 *
		 * @param {string} paramName - Parameter name
		 * @param {string} value - Parameter value
		 *
		 * BEHAVIOR:
		 * - Updates URL in browser address bar
		 * - Does NOT reload page
		 * - Uses History API (replaceState)
		 *
		 * EXAMPLE:
		 * Voxel.setSearchParam('tab', 'reviews');
		 * // URL changes from /?tab=info to /?tab=reviews
		 */
		setSearchParam(paramName, value) {
			var url = new URL(window.location);
			url.searchParams.set(paramName, value);
			window.history.replaceState(null, null, url);
		},

		/**
		 * Remove URL query parameter (updates browser URL without reload)
		 *
		 * @param {string} paramName - Parameter name to remove
		 *
		 * EXAMPLE:
		 * Voxel.deleteSearchParam('tab');
		 * // URL changes from /?tab=reviews to /
		 */
		deleteSearchParam(paramName) {
			var url = new URL(window.location);
			url.searchParams.delete(paramName);
			window.history.replaceState(null, null, url);
		},

		/* ======================================================================
		   SUBSECTION 2.6: SHARING & CLIPBOARD
		   ====================================================================== */

		/**
		 * Share content using Web Share API
		 *
		 * @param {Object} shareData - Share data object
		 * @param {string} [shareData.title] - Content title
		 * @param {string} [shareData.text] - Content text
		 * @param {string} [shareData.url] - Content URL
		 *
		 * BROWSER SUPPORT:
		 * - Mobile browsers: widely supported
		 * - Desktop: limited support
		 * - Gracefully fails (catch block swallows error)
		 *
		 * USAGE:
		 * Voxel.share({
		 *   title: 'Check this out',
		 *   url: 'https://example.com'
		 * });
		 */
		async share(shareData) {
			try {
				await navigator.share(shareData);
			} catch (error) {
				// User cancelled share or API not supported
				// Fail silently
			}
		},

		/**
		 * Copy text to clipboard and show confirmation
		 *
		 * @param {string} text - Text to copy
		 *
		 * BEHAVIOR:
		 * - Copies text to clipboard using Clipboard API
		 * - Shows "Copied!" success message (2.25s)
		 *
		 * USAGE:
		 * Voxel.copy('https://example.com/post/123');
		 */
		copy(text) {
			navigator.clipboard.writeText(text).then(() =>
				Voxel.alert(Voxel_Config.l10n.copied, "info", null, 2250)
			);
		},

		/* ======================================================================
		   SUBSECTION 2.7: TAB NAVIGATION
		   ====================================================================== */

		/**
		 * Load tab content via AJAX
		 *
		 * @param {Event} event - Click event (will be prevented)
		 * @param {string} tabsId - ID of the tabs container
		 * @param {string} tabKey - Key/slug of tab to load
		 *
		 * DOM STRUCTURE:
		 * - Container: .ts-template-tabs-{tabsId}
		 * - Triggers: .ts-tab-triggers-{tabsId} .menu-item[data-tab="..."]
		 * - Panels: .ts-template-tab[data-tab="..."]
		 *
		 * BEHAVIOR:
		 * 1. Find tab panel by tabKey
		 * 2. If already rendered (.rendered class), just activate it
		 * 3. If not rendered, load via AJAX from Voxel_Config.ajax_url
		 * 4. Update URL parameter to reflect active tab
		 * 5. Wait for stylesheets to load before displaying content
		 *
		 * AJAX ENDPOINT: /?vx=1&action=tabs.load
		 * AJAX PARAMS: {action, post_id, widget_id, template_id, tab}
		 *
		 * USAGE:
		 * Voxel.loadTab(event, 'profile-tabs', 'reviews');
		 */
		loadTab(event, tabsId, tabKey) {
			event.preventDefault();

			// Find the tab panel
			let $tabPanel = document.querySelector(
				`.ts-template-tabs-${CSS.escape(tabsId)} .ts-template-tab[data-tab="${CSS.escape(tabKey)}"]`
			);

			if (!$tabPanel) {
				return; // Tab doesn't exist
			}

			let $tabsContainer = $tabPanel.closest(".ts-template-tabs");
			let config = JSON.parse($tabsContainer.dataset.config);

			// Update active menu item
			jQuery(`.ts-tab-triggers-${CSS.escape(tabsId)} .menu-item`).removeClass("current-menu-item");
			let $menuItem = jQuery(`.ts-tab-triggers-${CSS.escape(tabsId)} .menu-item[data-tab="${CSS.escape(tabKey)}"]`);
			$menuItem.addClass("current-menu-item");

			/**
			 * Activate a tab panel and update URL
			 *
			 * @param {HTMLElement} tabPanel - Tab panel to activate
			 */
			const activateTab = (tabPanel) => {
				jQuery(tabPanel).siblings().removeClass("active-tab");
				tabPanel.classList.add("active-tab");

				// Update URL parameter (or remove if default tab)
				if (config.default_tab === tabPanel.dataset.tab) {
					Voxel.deleteSearchParam(config.url_key);
				} else {
					Voxel.setSearchParam(config.url_key, tabPanel.dataset.tab);
				}
			};

			// If tab already rendered, just activate it
			if ($tabPanel.classList.contains("rendered")) {
				activateTab($tabPanel);
				return;
			}

			// Tab not rendered yet - load via AJAX
			$tabsContainer.classList.add("vx-pending");
			$menuItem.addClass("vx-inert");

			jQuery
				.get(Voxel_Config.ajax_url, {
					action: "tabs.load",
					post_id: config.post_id,
					widget_id: config.widget_id,
					template_id: config.template_id,
					tab: tabKey,
				})
				.always((response) => {
					$tabsContainer.classList.remove("vx-pending");
					$menuItem.removeClass("vx-inert");

					if (false === response.success) {
						// AJAX failed
						Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
						return;
					}

					// Parse response HTML
					let $responseWrapper = jQuery('<div class="response-wrapper">' + response + "</div>");
					let stylesheetPromises = [];

					// Handle stylesheets - avoid duplicates
					$responseWrapper.find('link[rel="stylesheet"]').each((index, linkElement) => {
						if (linkElement.id && document.querySelector("#" + CSS.escape(linkElement.id))) {
							// Stylesheet already loaded, remove from response
							linkElement.remove();
						} else {
							// Wait for stylesheet to load
							stylesheetPromises.push(
								new Promise((resolve) => {
									linkElement.onload = resolve;
								})
							);
						}
					});

					// Handle scripts - avoid duplicates
					$responseWrapper.find('script[type="text/javascript"]').each((index, scriptElement) => {
						if (scriptElement.id && document.querySelector("#" + CSS.escape(scriptElement.id))) {
							scriptElement.remove();
						}
					});

					// Move content to cache first (allows stylesheets to load)
					var $content = $responseWrapper.children();
					$content.appendTo("#vx-markup-cache");

					// Wait for all stylesheets to load
					Promise.all(stylesheetPromises).then(() => {
						requestAnimationFrame(() => {
							// Move content to tab panel
							$content.appendTo(jQuery($tabPanel));
							$tabPanel.classList.add("rendered");
							activateTab($tabPanel);

							// Trigger global event for Vue/other widgets to reinitialize
							jQuery(document).trigger("voxel:markup-update");
						});
					});
				});
		},

		/* ======================================================================
		   SUBSECTION 2.8: SCROLL & NAVIGATION
		   ====================================================================== */

		/**
		 * Smooth scroll to element
		 *
		 * @param {HTMLElement} element - Element to scroll to
		 *
		 * BEHAVIOR:
		 * - Scrolls window to element position
		 * - Uses smooth scroll behavior
		 * - Respects current scroll position (calculates absolute position)
		 *
		 * USAGE:
		 * Voxel.scrollTo(document.querySelector('#reviews'));
		 */
		scrollTo(element) {
			if (!element) {
				return;
			}

			window.scrollTo({
				top: element.getBoundingClientRect().top + window.pageYOffset,
				behavior: "smooth",
			});
		},

		/* ======================================================================
		   SUBSECTION 2.9: COOKIES
		   ====================================================================== */

		/**
		 * Get cookie value by name
		 *
		 * @param {string} cookieName - Name of cookie to retrieve
		 * @returns {string|undefined} Cookie value or undefined if not found
		 *
		 * EXAMPLE:
		 * Voxel.getCookie('voxel_session') => "abc123xyz"
		 *
		 * NOTE: Uses optional chaining (?.) for browsers without cookie or matching cookie
		 */
		getCookie(cookieName) {
			return document.cookie
				.split("; ")
				.find((cookie) => cookie.startsWith(cookieName + "="))
				?.split("=")[1];
		},

		/* ======================================================================
		   SUBSECTION 2.10: CART OPERATIONS
		   ====================================================================== */

		/**
		 * Open the cart popup
		 *
		 * DOM REQUIREMENTS:
		 * - Cart trigger: .ts-popup-cart > a
		 * - Cart must have vx:open event listener
		 *
		 * BEHAVIOR:
		 * 1. Scrolls to cart trigger element
		 * 2. Dispatches 'vx:open' event to open popup
		 *
		 * USAGE:
		 * Voxel.openCart();
		 */
		openCart() {
			var $cartTrigger = document.querySelector(".ts-popup-cart > a");
			if ($cartTrigger) {
				Voxel.scrollTo($cartTrigger);
				$cartTrigger.dispatchEvent(new Event("vx:open"));
			}
		},

		/**
		 * Quick add product to cart (single-click action)
		 *
		 * @param {Event} event - Click event (will be prevented)
		 * @param {HTMLElement} buttonElement - Button element with data-product-id
		 *
		 * BUTTON REQUIREMENTS:
		 * - data-product-id: Product ID to add
		 *
		 * AJAX ENDPOINT: /?vx=1&action=products.add_to_cart_quick_action
		 * AJAX PARAMS:
		 * - product_id: From button.dataset.productId
		 * - guest_cart: Guest cart JSON from localStorage (if not logged in)
		 *
		 * BEHAVIOR:
		 * 1. Prevent default click
		 * 2. Add .vx-pending class to button
		 * 3. Send AJAX request to add product
		 * 4. On success:
		 *    - Update guest cart in localStorage (if not logged in)
		 *    - Trigger 'voxel:added_cart_item' event
		 *    - Show success alert with "View Cart" action
		 * 5. On error: Show error alert
		 * 6. Remove .vx-pending class
		 *
		 * USAGE:
		 * <button data-product-id="123" onclick="Voxel.addToCartAction(event, this)">
		 *   Add to Cart
		 * </button>
		 */
		addToCartAction(event, buttonElement) {
			event.preventDefault();
			buttonElement.classList.add("vx-pending");

			jQuery
				.post(Voxel_Config.ajax_url + "&action=products.add_to_cart_quick_action", {
					product_id: buttonElement.dataset.productId,
					guest_cart: Voxel_Config.is_logged_in ? null : localStorage.getItem("voxel:guest_cart"),
				})
				.always((response) => {
					buttonElement.classList.remove("vx-pending");

					if (!response.success) {
						// Add to cart failed
						Voxel.alert(response.message || Voxel_Config.l10n.ajaxError, "error");
						return;
					}

					// Success! Update guest cart if needed
					if (!Voxel_Config.is_logged_in) {
						localStorage.setItem("voxel:guest_cart", JSON.stringify(response.guest_cart));
					}

					// Trigger event for cart widget to update
					jQuery(document).trigger("voxel:added_cart_item", response.item);

					// Build actions for success alert
					var actions = [];
					if (document.querySelector(".ts-popup-cart > a")) {
						actions.push({
							label: Voxel_Config.l10n.view_cart,
							link: "#",
							onClick: (clickEvent) => {
								clickEvent.preventDefault();
								Voxel.openCart();
								// Close the alert
								clickEvent.target.closest(".ts-notice").querySelector(".close-alert").click();
							},
						});
					}

					// Show success alert
					Voxel.alert(Voxel_Config.l10n.added_to_cart, "success", actions, 4000);
				});
		},
	};

	/* ==========================================================================
	   SECTION 3: CUSTOM EVENT - COMMONS INITIALIZED
	   ========================================================================== */

	/**
	 * Dispatch 'voxel/commons/init' event
	 *
	 * OTHER SCRIPTS CAN LISTEN FOR THIS:
	 * document.addEventListener('voxel/commons/init', () => {
	 *   // Voxel object is now available
	 * });
	 */
	document.dispatchEvent(new CustomEvent("voxel/commons/init"));

	/* ==========================================================================
	   SECTION 4: VUE MIXINS
	   ========================================================================== */

	/* ======================================================================
	   SUBSECTION 4.1: BASE MIXIN
	   ====================================================================== */

	/**
	 * Base mixin for all Voxel Vue widgets
	 *
	 * PROVIDES:
	 * - widget_id: Elementor widget ID
	 * - post_id: Elementor post/template ID
	 * - $w: Computed property returning window object
	 *
	 * USAGE:
	 * mixins: [Voxel.mixins.base]
	 *
	 * DOM REQUIREMENTS:
	 * - Widget must be inside .elementor-element (provides widget_id)
	 * - Widget must be inside .elementor (provides post_id)
	 */
	window.Voxel.mixins.base = {
		data() {
			return {
				widget_id: null,
				post_id: null,
			};
		},

		mounted() {
			// Extract widget ID from Elementor element
			this.widget_id = this.$root.$options.el.closest(".elementor-element").dataset.id;

			// Extract post/template ID from Elementor container
			this.post_id = this.$root.$options.el.closest(".elementor").dataset.elementorId;
		},

		computed: {
			/**
			 * Provide window object as computed property
			 * Useful for accessing window in templates
			 *
			 * @returns {Window} window object
			 */
			$w() {
				return window;
			},
		},
	};

	/* ======================================================================
	   SUBSECTION 4.2: BLURABLE MIXIN
	   ====================================================================== */

	/**
	 * Mixin to detect clicks outside component and emit 'blur' event
	 *
	 * PROPS:
	 * - preventBlur: CSS selector(s) for elements that should NOT trigger blur
	 *
	 * EMITS:
	 * - 'blur': When user clicks outside component (unless clicking preventBlur element)
	 *
	 * USAGE:
	 * mixins: [Voxel.mixins.blurable]
	 *
	 * CSS CLASSES:
	 * - .triggers-blur: Elements with this class trigger blur when clicked
	 *
	 * EXAMPLE:
	 * <div v-if="active" @blur="active = false" prevent-blur=".some-button">
	 *   Popup content
	 * </div>
	 */
	window.Voxel.mixins.blurable = {
		props: {
			preventBlur: {
				type: String,
				default: "",
			},
		},

		mounted() {
			// Delay adding listener to avoid immediate trigger
			requestAnimationFrame(() => {
				document.addEventListener("mousedown", this._click_outside_handler);
			});
		},

		unmounted() {
			document.removeEventListener("mousedown", this._click_outside_handler);
		},

		methods: {
			/**
			 * Handle mousedown events to detect clicks outside component
			 *
			 * @param {MouseEvent} event - Mouse event
			 *
			 * BEHAVIOR:
			 * - If click target is .triggers-blur: emit blur
			 * - If click target is OUTSIDE component AND NOT in preventBlur selector: emit blur
			 * - Otherwise: do nothing (click is inside or on preventBlur element)
			 */
			_click_outside_handler(event) {
				var blurSelectors = ".triggers-blur";

				// Add custom preventBlur selectors
				if (this.preventBlur.length) {
					blurSelectors += "," + this.preventBlur;
				}

				// Check if click is on a blur trigger element
				if (event.target.closest(blurSelectors)) {
					this.$emit("blur");
					return;
				}

				// Check if click is outside component
				if (
					!this.$el?.contains?.(event.target) &&
					!(this.preventBlur.length && event.target.closest(this.preventBlur))
				) {
					this.$emit("blur");
				}
			},
		},
	};

	/* ======================================================================
	   SUBSECTION 4.3: POPUP MIXIN
	   ====================================================================== */

	/**
	 * Mixin for popup positioning logic
	 *
	 * PROVIDES:
	 * - styles: CSS string for positioning popup
	 * - reposition(): Method to recalculate popup position
	 *
	 * REQUIRES:
	 * - this.target: Target element (trigger) for popup positioning
	 * - this.$refs['popup-box']: Popup content element
	 * - this.$refs.popup: Root popup element
	 *
	 * BEHAVIOR:
	 * - Positions popup relative to trigger element
	 * - Auto-repositions on scroll, resize, or content size change
	 * - Flips popup above trigger if it would overflow bottom of viewport
	 * - Aligns popup left/right based on trigger position
	 *
	 * USAGE:
	 * mixins: [Voxel.mixins.popup]
	 */
	window.Voxel.mixins.popup = {
		data() {
			return {
				styles: "", // CSS string for popup position
			};
		},

		mounted() {
			// Initial positioning
			this.reposition();

			// Reposition on scroll and resize
			window.addEventListener("scroll", this.reposition, true);
			window.addEventListener("resize", this.reposition, true);

			// Reposition when popup content size changes
			this.resizeObserver = new ResizeObserver(() => this.reposition(true));
			this.resizeObserver.observe(this.$refs["popup-box"]);

			// Auto-focus first .autofocus element
			requestAnimationFrame(() => {
				var autofocusElement = this.$el.querySelector(".autofocus");
				if (autofocusElement) {
					autofocusElement.focus();
				}
			});
		},

		methods: {
			/**
			 * Recalculate and update popup position
			 *
			 * @param {boolean} [immediate=false] - If true, update styles immediately (not via requestAnimationFrame)
			 *
			 * POSITIONING LOGIC:
			 * 1. Get trigger element dimensions and position
			 * 2. Calculate popup width (max of trigger width and minWidth)
			 * 3. Align left/right based on trigger position in viewport
			 * 4. Position below trigger by default
			 * 5. If popup would overflow bottom, flip to above trigger
			 * 6. Update this.styles with CSS string
			 *
			 * CLEANUP:
			 * If popup-box ref no longer exists (component destroyed),
			 * removes event listeners and disconnects ResizeObserver
			 */
			reposition(immediate = false) {
				if (!this.$refs["popup-box"]) {
					// Popup destroyed, cleanup
					window.removeEventListener("scroll", this.reposition, true);
					window.removeEventListener("resize", this.reposition, true);
					this.resizeObserver?.disconnect();
					return;
				}

				// Get target element (trigger)
				let targetElement = this.target;

				// If target is a string selector, find element
				if ("string" == typeof targetElement) {
					targetElement = document.querySelector(targetElement);
				}

				if (!targetElement) {
					return; // No target, can't position
				}

				// Get dimensions
				var bodyWidth = jQuery("body").innerWidth();
				var targetRect = targetElement.getBoundingClientRect();
				var targetOuterWidth = jQuery(targetElement).outerWidth();
				var targetOffset = jQuery(targetElement).offset();
				var popupBox = this.$refs["popup-box"];
				var popupRect = this.$refs.popup.getBoundingClientRect();
				var popupMinWidth = parseFloat(window.getComputedStyle(popupBox).minWidth);
				var popupWidth = Math.max(targetRect.width, popupMinWidth);

				// Determine left/right alignment
				// If trigger is in right half of viewport, align popup to right edge of trigger
				var popupLeft =
					targetOffset.left + targetOuterWidth / 2 > bodyWidth / 2 + 1
						? targetOffset.left - popupWidth + targetOuterWidth
						: targetOffset.left;

				// Default: position below trigger
				let topPosition = `top: ${targetOffset.top + targetRect.height}px;`;

				var viewportHeight = window.innerHeight;

				// Check if popup would overflow bottom of viewport
				// If so, position above trigger instead
				if (
					targetRect.bottom + popupRect.height > viewportHeight &&
					0 <= targetRect.top - popupRect.height
				) {
					topPosition = `top: ${targetOffset.top - popupRect.height}px;`;
				}

				// Build CSS string
				let cssString = `
				${topPosition}
				left: ${popupLeft}px;
				width: ${popupWidth}px;
				position: absolute;
			`;

				// Update styles
				if (true === immediate) {
					this.styles = cssString;
				} else {
					requestAnimationFrame(() => (this.styles = cssString));
				}
			},
		},
	};

	/* ==========================================================================
	   SECTION 5: VUE COMPONENTS
	   ========================================================================== */

	/* ======================================================================
	   SUBSECTION 5.1: POPUP COMPONENT
	   ====================================================================== */

	/**
	 * Reusable popup component
	 *
	 * TEMPLATE: #voxel-popup-template (defined in PHP/HTML)
	 *
	 * PROPS:
	 * - onBlur: Function to call when popup blurs
	 * - target: Target element for positioning (element or selector)
	 * - saveLabel: Label for save button
	 * - clearLabel: Label for clear button
	 * - controllerClass: CSS class for controller
	 * - showSave: Whether to show save button (default: true)
	 * - showClear: Whether to show clear button (default: true)
	 * - showClearMobile: Whether to show clear on mobile (default: true)
	 * - showClose: Whether to show close button (default: false)
	 *
	 * MIXINS:
	 * - blurable: Click-outside-to-close
	 * - popup: Positioning logic
	 *
	 * USAGE:
	 * <form-popup :target="$refs.trigger" @blur="onBlur">
	 *   Popup content here
	 * </form-popup>
	 */
	window.Voxel.components.popup = {
		template: "#voxel-popup-template",
		mixins: [Voxel.mixins.blurable, Voxel.mixins.popup],
		props: {
			onBlur: Function,
			target: [Object, String],
			saveLabel: String,
			clearLabel: String,
			controllerClass: String,
			showSave: { type: Boolean, default: true },
			showClear: { type: Boolean, default: true },
			showClearMobile: { type: Boolean, default: true },
			showClose: { type: Boolean, default: false },
		},
	};

	/* ======================================================================
	   SUBSECTION 5.2: FORM GROUP COMPONENT
	   ====================================================================== */

	/**
	 * Form group component with integrated popup
	 *
	 * TEMPLATE: #voxel-form-group-template (defined in PHP/HTML)
	 *
	 * PROPS:
	 * - popupKey: Unique key for popup
	 * - saveLabel: Label for save button
	 * - clearLabel: Label for clear button
	 * - wrapperClass: CSS class for wrapper
	 * - controllerClass: CSS class for controller
	 * - showSave: Whether to show save button (default: true)
	 * - showClear: Whether to show clear button (default: true)
	 * - showClearMobile: Whether to show clear on mobile (default: true)
	 * - showClose: Whether to show close button (default: false)
	 * - defaultClass: Whether to apply default classes (default: true)
	 * - preventBlur: Selector for elements that prevent blur
	 * - tag: HTML tag for root element (default: 'div')
	 *
	 * COMPONENTS:
	 * - form-popup: Uses Voxel.components.popup
	 *
	 * DATA:
	 * - popupTarget: Target element for popup positioning
	 *
	 * METHODS:
	 * - blur(): Programmatically blur popup
	 * - onPopupBlur(): Handle popup blur event
	 *
	 * USAGE:
	 * <form-group popup-key="date-filter">
	 *   <template #default>
	 *     <input type="text" />
	 *   </template>
	 * </form-group>
	 */
	window.Voxel.components.formGroup = {
		template: "#voxel-form-group-template",
		props: {
			popupKey: String,
			saveLabel: String,
			clearLabel: String,
			wrapperClass: String,
			controllerClass: String,
			showSave: { type: Boolean, default: true },
			showClear: { type: Boolean, default: true },
			showClearMobile: { type: Boolean, default: true },
			showClose: { type: Boolean, default: false },
			defaultClass: { type: Boolean, default: true },
			preventBlur: { type: String, default: "" },
			tag: { type: String, default: "div" },
		},

		components: {
			"form-popup": window.Voxel.components.popup,
		},

		data() {
			return {
				popupTarget: null,
			};
		},

		mounted() {
			// Set popup target to .ts-popup-target child or root element
			this.popupTarget = this.$el.querySelector(".ts-popup-target") || this.$el;
		},

		methods: {
			/**
			 * Programmatically blur the popup
			 */
			blur() {
				this.$refs.popup?.$emit("blur");
			},

			/**
			 * Handle popup blur event
			 * Clears active popup and emits blur to parent
			 */
			onPopupBlur() {
				this.$root.activePopup = null;
				this.$emit("blur", this);
			},
		},
	};

	/* ==========================================================================
	   SECTION 6: STATIC POPUP INITIALIZATION
	   ========================================================================== */

	/**
	 * Initialize static popups (non-Vue components with .ts-popup-component)
	 *
	 * BEHAVIOR:
	 * 1. Find all .ts-popup-component elements
	 * 2. For each element without a Vue app:
	 *    - Create Vue app with inline template
	 *    - Register form-popup and popup components
	 *    - Mount app to element
	 * 3. Handle hover triggers if .ts-trigger-on-hover
	 *
	 * HOVER BEHAVIOR:
	 * - mouseover: Show popup
	 * - mouseleave: Hide popup after 40ms delay (unless cursor moved to popup)
	 *
	 * CALLED:
	 * - On page load
	 * - On 'voxel:markup-update' event (for dynamically loaded content)
	 *
	 * USAGE:
	 * <div class="ts-popup-component">
	 *   <a ref="target">Trigger</a>
	 *   <popup ref="popup" wrapper="...">
	 *     Popup content
	 *   </popup>
	 * </div>
	 */
	window.render_static_popups = () => {
		Array.from(document.querySelectorAll(".ts-popup-component")).forEach((popupComponent) => {
			// Skip if already initialized
			if (popupComponent.__vue_app__) {
				return;
			}

			let isHoverTrigger = popupComponent.classList.contains("ts-trigger-on-hover");

			let app = Vue.createApp({
				template: popupComponent.innerHTML,

				data() {
					return {
						active: false,
						screen: "main",
						widget_id: null,
						post_id: null,
						slide_from: "left",
						window: window,
						navigator: window.navigator,
						Voxel: window.Voxel,
					};
				},

				mounted() {
					// Extract widget and post IDs
					this.widget_id = this.$el.parentElement.closest(".elementor-element").dataset.id;
					this.post_id = this.$el.parentElement.closest(".elementor").dataset.elementorId;

					// Setup hover trigger if needed
					if (this.$refs.target && isHoverTrigger) {
						// Show popup on mouseover
						this.$refs.target.addEventListener("mouseover", (event) => {
							clearTimeout(this._timeout);
							this.active = true;
						});

						// Hide popup on mouseleave (with delay to allow moving to popup)
						this.$refs.target.addEventListener("mouseleave", (event) => {
							this._timeout = setTimeout(() => {
								// Check if cursor is now over popup
								var hoveredElement = document.querySelector("body :hover");
								var popupElement = this.$refs.popup?.$refs.popup?.$el;

								if (hoveredElement && popupElement) {
									if (hoveredElement === popupElement) {
										return; // Cursor on popup itself
									}

									// Check if hoveredElement is inside popup
									let parentElement = hoveredElement;
									while ((parentElement = parentElement.parentElement)) {
										if (parentElement === popupElement) {
											return; // Cursor inside popup
										}
									}
								}

								// Cursor not on popup or inside it - close
								this.onBlur();
							}, 40);
						});
					}
				},

				methods: {
					/**
					 * Restore scroll position before entering screen
					 *
					 * @param {HTMLElement} element - Element entering
					 */
					beforeEnter(element) {
						setTimeout(() => {
							element.closest(".min-scroll").scrollTop = element.dataset.scrollTop || 0;
						}, 100);
					},

					/**
					 * Save scroll position before leaving screen
					 *
					 * @param {HTMLElement} element - Element leaving
					 */
					beforeLeave(element) {
						element.dataset.scrollTop = element.closest(".min-scroll").scrollTop;
					},

					/**
					 * Handle blur (close popup)
					 */
					onBlur() {
						this.active = false;
						this.screen = "main";
					},
				},
			});

			/**
			 * Register form-popup component (popup with Elementor wrapper)
			 *
			 * TEMPLATE: Inline string with slots
			 * MIXINS: blurable, popup
			 * PROPS: onBlur, target
			 */
			app.component("form-popup", {
				template: `
				<div class="elementor vx-popup" :class="'elementor-'+$root.post_id">
					<div class="ts-popup-root elementor-element" :class="'elementor-element-'+$root.widget_id+'-wrap'" v-cloak>
						<div class="ts-form elementor-element" :style="styles" ref="popup" :class="'elementor-element-'+$root.widget_id">
							<div class="ts-field-popup-container">
								<div class="ts-field-popup triggers-blur" ref="popup-box">
									<div class="ts-popup-content-wrapper min-scroll">
										<slot></slot>
									</div>
									<slot name="footer"></slot>
								</div>
							</div>
						</div>
					</div>
				</div>
			`,
				mixins: [Voxel.mixins.blurable, Voxel.mixins.popup],
				props: ["onBlur", "target"],

				mounted() {
					// Handle mouseleave on popup for hover triggers
					this.$el.addEventListener("mouseleave", (event) => {
						if (!isHoverTrigger) {
							return;
						}

						setTimeout(() => {
							// Check if cursor moved to trigger
							var hoveredElement = Array.from(document.querySelectorAll("body :hover")).pop();
							var triggerElement = this.$root.$refs.target;

							if (hoveredElement && triggerElement) {
								if (hoveredElement === triggerElement) {
									return; // Cursor on trigger
								}

								// Check if hoveredElement is inside trigger
								let parentElement = hoveredElement;
								while ((parentElement = parentElement.parentElement)) {
									if (parentElement === triggerElement) {
										return; // Cursor inside trigger
									}
								}
							}

							// Cursor not on trigger - close
							this.$root.onBlur();
						}, 40);
					});
				},
			});

			/**
			 * Register popup component (teleported popup wrapper)
			 *
			 * TEMPLATE: Inline string with teleport and transition
			 * PROPS: wrapper
			 * METHODS: blur()
			 */
			app.component("popup", {
				props: ["wrapper"],
				template: `
				<teleport to="body">
				 	<transition name="form-popup">
				 		<form-popup v-if="$root.active" ref="popup" @blur="$root.onBlur()" :target="$root.$refs.target" :class="wrapper">
				 			<template #default>
								<slot></slot>
				 			</template>
				 			<template #footer>
								<slot name="footer"></slot>
				 			</template>
				 		</form-popup>
				 	</transition>
				</teleport>
			`,
				methods: {
					/**
					 * Programmatically blur popup
					 */
					blur() {
						this.$refs.popup.$emit("blur");
					},
				},
			});

			// Mount Vue app to popup component
			app.mount(popupComponent);
		});
	};

	// Initialize static popups on load
	window.render_static_popups();

	// Re-initialize when new markup is added
	jQuery(document).on("voxel:markup-update", window.render_static_popups);

	/* ==========================================================================
	   SECTION 7: EVENT HANDLERS INITIALIZATION
	   ========================================================================== */

	/**
	 * Initialize event handlers for common UI patterns
	 *
	 * @param {jQuery} $ - jQuery instance
	 *
	 * PATTERNS INITIALIZED:
	 * - .ts-expand-hours: Expand/collapse work hours
	 * - .ts-action-follow: Follow button with AJAX
	 * - .post-feed-nav: Post feed navigation (prev/next)
	 * - .post-feed-grid.ts-feed-nowrap: Auto-slide carousel
	 * - .e-n-tabs-heading: Elementor nested tabs trigger
	 * - .ts-plan-tabs: Pricing plan tabs
	 * - a[vx-action]: Generic AJAX action links
	 * - .ts-nav-menu.ts-custom-links: Scroll spy navigation
	 *
	 * DUPLICATE PREVENTION:
	 * Uses .vx-event-{type} classes to prevent double-initialization
	 *
	 * CALLED:
	 * - On document ready
	 * - On 'voxel:markup-update' event
	 */
	let initializeEventHandlers = ($) => {
		/* ==================================================================
		   SUBSECTION 7.1: WORK HOURS EXPAND/COLLAPSE
		   ================================================================== */

		/**
		 * Initialize expand/collapse for work hours widget
		 *
		 * SELECTOR: .ts-expand-hours:not(.vx-event-expand)
		 *
		 * BEHAVIOR:
		 * - Click toggles .active class on .ts-work-hours parent
		 *
		 * USAGE:
		 * <div class="ts-work-hours">
		 *   <a class="ts-expand-hours">View hours</a>
		 *   <div class="hours-content">...</div>
		 * </div>
		 */
		$(".ts-expand-hours:not(.vx-event-expand)").each((index, element) => {
			element.classList.add("vx-event-expand");

			$(element).on("click", (event) => {
				event.preventDefault();
				$(element).parents(".ts-work-hours").toggleClass("active");
			});
		});

		/* ==================================================================
		   SUBSECTION 7.2: FOLLOW BUTTON
		   ================================================================== */

		/**
		 * Initialize follow/unfollow action buttons
		 *
		 * SELECTOR: .ts-action-follow:not(.vx-event-follow)
		 *
		 * BEHAVIOR:
		 * - Requires login (calls Voxel.authRequired if not logged in)
		 * - Sends AJAX GET request to button href
		 * - Toggles .active class on success
		 *
		 * AJAX RESPONSE:
		 * {success: true} or {success: false, message: "..."}
		 *
		 * USAGE:
		 * <a href="/?vx=1&action=follow&user_id=123" class="ts-action-follow">
		 *   Follow
		 * </a>
		 */
		$(".ts-action-follow:not(.vx-event-follow)").each((index, element) => {
			element.classList.add("vx-event-follow");

			$(element).on("click", (event) => {
				event.preventDefault();

				// Check if user is logged in
				if (!Voxel_Config.is_logged_in) {
					return Voxel.authRequired();
				}

				event.currentTarget.classList.add("vx-pending");

				jQuery.get(event.currentTarget.href).always((response) => {
					if (response.success) {
						// Toggle active state
						event.currentTarget.classList.toggle("active");
					} else {
						// Show error
						var errorMessage = response.message || Voxel_Config.l10n.ajaxError;
						Voxel.alert(errorMessage, "error");
					}

					event.currentTarget.classList.remove("vx-pending");
				});
			});
		});

		/* ==================================================================
		   SUBSECTION 7.3: POST FEED NAVIGATION
		   ================================================================== */

		/**
		 * Scroll post feed grid horizontally
		 *
		 * @param {HTMLElement} widgetContainer - .elementor-element container
		 * @param {string} direction - 'next' or 'prev'
		 *
		 * BEHAVIOR:
		 * - Finds .post-feed-grid inside container
		 * - Calculates scroll distance based on .ts-preview width
		 * - Loops to start/end if at boundary
		 * - Respects RTL layout
		 */
		const scrollPostFeed = (widgetContainer, direction) => {
			var feedGrid = widgetContainer.querySelector(".post-feed-grid");

			if (!feedGrid) {
				return;
			}

			var previewCard = feedGrid.querySelector(".ts-preview");

			if (!previewCard) {
				return;
			}

			let scrollDistance = previewCard.scrollWidth;

			// At end of feed - loop to start
			if (feedGrid.clientWidth + Math.abs(feedGrid.scrollLeft) + 10 >= feedGrid.scrollWidth) {
				scrollDistance = -feedGrid.scrollLeft;
			}

			// Going prev
			if ("prev" === direction) {
				scrollDistance = -previewCard.scrollWidth;

				// At start of feed - loop to end
				if (Math.abs(feedGrid.scrollLeft) <= 10) {
					scrollDistance = feedGrid.scrollWidth - feedGrid.clientWidth - feedGrid.scrollLeft;
				}
			}

			// Reverse scroll direction for RTL
			feedGrid.scrollBy({
				left: Voxel_Config.is_rtl ? -scrollDistance : scrollDistance,
				behavior: "smooth",
			});
		};

		/**
		 * Initialize post feed navigation buttons
		 *
		 * SELECTOR: .post-feed-nav a:not(.vx-event-nav)
		 *
		 * BEHAVIOR:
		 * - Detects .ts-prev-page vs .ts-next-page
		 * - Calls scrollPostFeed with appropriate direction
		 */
		$(".post-feed-nav a:not(.vx-event-nav)").each((index, element) => {
			element.classList.add("vx-event-nav");

			let widgetContainer = element.closest(".elementor-element");

			if (!widgetContainer) {
				return;
			}

			$(element).on("click", (event) => {
				event.preventDefault();

				let direction = event.currentTarget.classList.contains("ts-prev-page") ? "prev" : "next";

				// Reverse for RTL
				if (Voxel_Config.is_rtl) {
					direction = "next" === direction ? "prev" : "next";
				}

				scrollPostFeed(widgetContainer, direction);
			});
		});

		/* ==================================================================
		   SUBSECTION 7.4: POST FEED AUTO-SLIDE
		   ================================================================== */

		/**
		 * Initialize auto-slide for post feed carousels
		 *
		 * SELECTOR: .post-feed-grid.ts-feed-nowrap:not(.vx-event-autoslide)
		 *
		 * DATA ATTRIBUTE:
		 * - data-auto-slide: Interval in milliseconds (min: 20ms)
		 *
		 * BEHAVIOR:
		 * - Automatically scrolls to next slide at specified interval
		 * - Pauses when user hovers over widget
		 * - Loops infinitely
		 */
		$(".post-feed-grid.ts-feed-nowrap:not(.vx-event-autoslide)")
			.addClass("vx-event-autoslide")
			.each((index, element) => {
				let widgetContainer = element.closest(".elementor-element");

				if (!widgetContainer) {
					return;
				}

				var intervalMs = parseInt(element.dataset.autoSlide, 10);

				// Validate interval
				if (isNaN(intervalMs) || intervalMs <= 20) {
					return;
				}

				// Setup auto-slide interval
				setInterval(() => {
					// Pause if user hovering over widget
					if (Array.from(document.querySelectorAll(":hover")).includes(widgetContainer)) {
						return;
					}

					scrollPostFeed(widgetContainer, "next");
				}, intervalMs);
			});

		/* ==================================================================
		   SUBSECTION 7.5: POST FEED SCROLL DETECTION
		   ================================================================== */

		/**
		 * Detect if post feed is scrollable and enable nav buttons
		 *
		 * SELECTOR: .post-feed-grid:not(.vx-event-scroll)
		 *
		 * BEHAVIOR:
		 * - Checks if scrollWidth > clientWidth
		 * - Removes .disabled class from nav buttons if scrollable
		 */
		$(".post-feed-grid:not(.vx-event-scroll)").each((index, element) => {
			// Skip if element not visible yet
			if (element.clientWidth < 1) {
				return;
			}

			element.classList.add("vx-event-scroll");

			let widgetContainer = element.closest(".elementor-element");

			if (!widgetContainer) {
				return;
			}

			// Enable nav buttons if scrollable
			if (element.scrollWidth > element.clientWidth) {
				widgetContainer.querySelector(".post-feed-nav .ts-prev-page")?.classList.remove("disabled");
				widgetContainer.querySelector(".post-feed-nav .ts-next-page")?.classList.remove("disabled");
			}
		});

		/* ==================================================================
		   SUBSECTION 7.6: ELEMENTOR NESTED TABS
		   ================================================================== */

		/**
		 * Trigger voxel:markup-update when Elementor nested tab clicked
		 *
		 * SELECTOR: .e-n-tabs-heading:not(.vx-event-ntabs)
		 *
		 * BEHAVIOR:
		 * - Listens for click on tab buttons
		 * - Triggers 'voxel:markup-update' event to reinitialize widgets in new tab
		 */
		$(".e-n-tabs-heading:not(.vx-event-ntabs)")
			.addClass("vx-event-ntabs")
			.each((index, element) => {
				$(element)
					.find("> button")
					.one("click", () => {
						requestAnimationFrame(() =>
							jQuery(document).trigger("voxel:markup-update")
						);
					});
			});

		/* ==================================================================
		   SUBSECTION 7.7: PRICING PLAN TABS
		   ================================================================== */

		/**
		 * Initialize pricing plan tabs (e.g., Monthly vs Annual)
		 *
		 * SELECTOR: .ts-plan-tabs a:not(.vx-event-plans)
		 *
		 * DATA ATTRIBUTE:
		 * - data-id: Plan group ID
		 *
		 * BEHAVIOR:
		 * - Toggles .ts-tab-active on clicked tab
		 * - Shows .ts-plan-container[data-group="{id}"]
		 * - Hides other plan containers
		 */
		$(".ts-plan-tabs a:not(.vx-event-plans)").each((index, element) => {
			element.classList.add("vx-event-plans");

			$(element).on("click", (event) => {
				event.preventDefault();

				var groupId = event.target.dataset.id;
				var $clickedTab = $(event.target.parentElement);

				// Update active tab
				$clickedTab.addClass("ts-tab-active").siblings().removeClass("ts-tab-active");

				// Find plan containers
				var $planContainers = $clickedTab.parent().next();

				// Hide non-matching groups
				$planContainers.find(`.ts-plan-container:not([data-group="${groupId}"])`).addClass("hidden");

				// Show matching group
				$planContainers.find(`.ts-plan-container[data-group="${groupId}"]`).removeClass("hidden");
			});
		});

		/* ==================================================================
		   SUBSECTION 7.8: GENERIC AJAX ACTIONS
		   ================================================================== */

		/**
		 * Initialize generic AJAX action links
		 *
		 * SELECTOR: a[vx-action]:not(.vx-event-action)
		 *
		 * DATA ATTRIBUTES:
		 * - data-confirm: Confirmation message (optional)
		 *
		 * AJAX ENDPOINT: Link href
		 * AJAX PARAMS: __vxasync: 1
		 *
		 * AJAX RESPONSE:
		 * {
		 *   success: true/false,
		 *   message: "...",
		 *   message_type: "success|error",
		 *   redirect_to: "/some-url" or "(reload)"
		 * }
		 *
		 * BEHAVIOR:
		 * 1. Prevent default link action
		 * 2. Show confirmation dialog if data-confirm present
		 * 3. Send AJAX GET request with __vxasync=1
		 * 4. Show message if present
		 * 5. Redirect or reload if redirect_to present
		 * 6. Show error if success=false
		 */
		$("a[vx-action]:not(.vx-event-action)").each((index, element) => {
			element.classList.add("vx-event-action");

			$(element).on("click", (event) => {
				event.preventDefault();

				// Check for confirmation
				if (event.currentTarget.dataset.confirm && !confirm(event.currentTarget.dataset.confirm)) {
					return;
				}

				event.currentTarget.classList.add("vx-pending");

				var actionUrl = event.currentTarget.href;

				jQuery
					.get(actionUrl, { __vxasync: 1 }, (response) => {
						if (response.success) {
							// Show success message if present
							if (response.message) {
								Voxel.alert(response.message, response.message_type || "success");
							}

							// Handle redirect
							if (response.redirect_to) {
								if ("(reload)" === response.redirect_to) {
									location.reload();
								} else {
									window.location.href = response.redirect_to;
								}

								event.currentTarget.classList.remove("vx-pending");
								return;
							}
						} else {
							// Show error
							var errorMessage = response.message || Voxel_Config.l10n.ajaxError;
							Voxel.alert(errorMessage, "error");
						}

						event.currentTarget.classList.remove("vx-pending");
					})
					.fail(() => {
						// AJAX request failed
						var errorMessage = Voxel_Config.l10n.ajaxError;
						Voxel.alert(errorMessage, "error");
						event.currentTarget.classList.remove("vx-pending");
					});
			});
		});

		/* ==================================================================
		   SUBSECTION 7.9: SCROLL SPY NAVIGATION
		   ================================================================== */

		/**
		 * Initialize scroll spy for custom navigation menus
		 *
		 * SELECTOR: .ts-nav-menu.ts-custom-links:not(.vx-event-links)
		 *
		 * BEHAVIOR:
		 * - Finds menu items with href starting with #
		 * - Tracks which sections are visible in viewport
		 * - Highlights menu item for most visible section
		 * - Updates on scroll (debounced 100ms)
		 *
		 * USAGE:
		 * <nav class="ts-nav-menu ts-custom-links">
		 *   <a href="#about">About</a>
		 *   <a href="#services">Services</a>
		 * </nav>
		 */
		$(".ts-nav-menu.ts-custom-links:not(.vx-event-links)").each((index, element) => {
			element.classList.add("vx-event-links");

			$(element).each((index, navElement) => {
				let sectionMap = {};

				// Find all hash links and their target sections
				$(navElement)
					.find('.ts-item-link[href^="#"]')
					.each((index, linkElement) => {
						try {
							var hash = linkElement.attributes.href.value;
							var targetSection = document.querySelector(hash);

							if (targetSection) {
								sectionMap[hash] = {
									section: targetSection,
									toggle: linkElement,
								};
							}
						} catch (error) {
							// Invalid selector, skip
						}
					});

				if (!Object.values(sectionMap).length) {
					return; // No valid sections
				}

				/**
				 * Update active menu item based on scroll position
				 */
				const updateActiveSection = () => {
					let visibilityData = [];

					// Calculate visibility percentage for each section
					Object.values(sectionMap).forEach((item) => {
						visibilityData.push({
							target: item,
							pct: Voxel.helpers.viewportPercentage(item.section),
						});
					});

					// Sort by visibility (most visible first)
					visibilityData.sort((a, b) => b.pct - a.pct);

					var mostVisible = visibilityData[0];

					// Highlight most visible section's menu item
					if (mostVisible && mostVisible.pct) {
						$(mostVisible.target.toggle)
							.parent()
							.addClass("current-menu-item")
							.siblings()
							.removeClass("current-menu-item");
					}
				};

				// Update on scroll (debounced)
				$(window).on("scroll", Voxel.helpers.debounce(updateActiveSection, 100));

				// Initial update
				updateActiveSection();
			});
		});
	};

	/* ==========================================================================
	   SECTION 8: DOCUMENT READY & EVENT BINDINGS
	   ========================================================================== */

	/**
	 * Initialize event handlers on document ready
	 */
	jQuery(($ ) => initializeEventHandlers($));

	/**
	 * Re-initialize event handlers when new markup is added
	 */
	jQuery(document).on("voxel:markup-update", () => initializeEventHandlers(jQuery));

	/**
	 * Initialize additional widgets on document ready
	 */
	jQuery(($) => {
		/**
		 * Re-trigger Elementor handlers for image carousels and videos
		 * when new markup is added via AJAX
		 */
		jQuery(document).on("voxel:markup-update", () => {
			jQuery(".elementor-widget-image-carousel, .elementor-widget-video").each((index, element) => {
				elementorFrontend.elementsHandler.runReadyTrigger(element);
			});
		});

		/**
		 * Initialize Google Maps if .ts-map exists on page
		 */
		if (document.querySelector(".ts-map")) {
			Voxel.Maps.await(() => {
				// Maps loaded, initialization handled by map widget
			});
		}
	});
});

/* ==========================================================================
   END OF FILE
   ========================================================================== */
