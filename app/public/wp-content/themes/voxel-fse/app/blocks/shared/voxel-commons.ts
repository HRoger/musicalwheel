/**
 * Voxel FSE Commons
 *
 * React-compatible implementation of Voxel's commons.js APIs.
 * Replaces the Vue-based commons.js to avoid conflicts in Gutenberg editor.
 *
 * Reference: docs/block-conversions/commons/voxel-commons.beautified.js
 *
 * @package VoxelFSE
 */

// Note: Window interface extended elsewhere in voxelShim.ts
// We don't redeclare it here to avoid conflicts

interface VoxelConfig {
	ajax_url: string;
	is_logged_in: boolean;
	login_url: string;
	register_url: string;
	currency: string;
	locale: string;
	is_rtl: boolean;
	l10n: {
		ajaxError: string;
		accountRequired: string;
		login: string;
		register: string;
		copied: string;
		added_to_cart: string;
		view_cart: string;
		[key: string]: string;
	};
	maps: {
		provider: string;
	};
	google_maps?: {
		handle: string;
	};
}

interface DialogOptions {
	message: string;
	type?: 'info' | 'success' | 'error' | 'warning';
	actions?: DialogAction[];
	timeout?: number;
	hideClose?: boolean;
	closeLabel?: string;
}

interface DialogAction {
	label: string;
	link?: string;
	onClick?: (event: Event) => void;
}

interface FilterCallback {
	callback: (...args: unknown[]) => unknown;
	priority: number;
}

interface VoxelHelpers {
	getParent: (vm: unknown, name: string) => unknown;
	dateFormatYmd: (date: Date) => string;
	dateTimeFormat: (date: Date) => string;
	dateFormat: (date: Date) => string;
	timeFormat: (date: Date) => string;
	currencyFormat: (amount: number, currencyCode?: string) => string;
	debounce: <T extends (...args: unknown[]) => unknown>(
		func: T,
		delay?: number,
		transformArgs?: ((args: unknown[]) => unknown[]) | null
	) => (...args: Parameters<T>) => void;
	viewportPercentage: (element: HTMLElement) => number;
	sequentialId: () => number;
	randomId: (length?: number) => string;
}

interface VoxelMaps {
	await: (callback: () => void) => void;
	Loaded: boolean;
	GoogleMaps?: () => void;
	[key: string]: any; // Allow additional properties from vx:google-maps.js
}

interface VoxelNamespace {
	_fseInitialized?: boolean;
	mixins?: Record<string, unknown>;
	components?: Record<string, unknown>;
	Maps: VoxelMaps;
	helpers: VoxelHelpers;
	_filters: Record<string, FilterCallback[]>;
	addFilter: (name: string, callback: (...args: unknown[]) => unknown, priority?: number) => void;
	applyFilters: (name: string, value: unknown, ...args: unknown[]) => unknown;
	dialog: (options: DialogOptions) => void;
	alert: (message: string, type?: string, actions?: DialogAction[], timeout?: number) => void;
	prompt: (message: string, type?: string, actions?: DialogAction[], timeout?: number) => void;
	authRequired: (message?: string | null) => void;
	requireAuth: (event: Event) => void;
	getSearchParam: (paramName: string) => string | null;
	setSearchParam: (paramName: string, value: string) => void;
	deleteSearchParam: (paramName: string) => void;
	share: (shareData: ShareData) => Promise<void>;
	copy: (text: string) => void;
	scrollTo: (element: HTMLElement | null) => void;
	getCookie: (name: string) => string | undefined;
	openCart: () => void;
}

/**
 * Initialize the Voxel namespace
 * Matches: voxel-commons.beautified.js lines 151-475
 *
 * CRITICAL: This function MERGES with existing Voxel object rather than replacing it.
 * This preserves Voxel.Maps.GoogleMaps, Voxel.Maps.Map, etc. defined by vx:google-maps.js
 */
function initVoxelCommons(): void {
	// Don't reinitialize if already exists
	if (window.Voxel && (window.Voxel as any)._fseInitialized) {
		return;
	}

	const Voxel_Config = window.Voxel_Config || {
		ajax_url: '/?vx=1',
		is_logged_in: false,
		login_url: '/login',
		register_url: '/register',
		currency: 'USD',
		locale: 'en_US',
		is_rtl: false,
		l10n: {
			ajaxError: 'Something went wrong',
			accountRequired: 'Please log in to continue',
			login: 'Log In',
			register: 'Sign Up',
			copied: 'Copied!',
			added_to_cart: 'Added to cart',
			view_cart: 'View Cart',
		},
		maps: { provider: 'google_maps' },
	};

	// Sequential ID counter (persists across calls)
	let sequentialIdCount = 0;

	// CRITICAL: Preserve existing Voxel.Maps properties (GoogleMaps, Map, Marker, etc.)
	// vx:google-maps.js adds these to Voxel.Maps, and we must not lose them
	const existingVoxel = (window.Voxel || {}) as Partial<VoxelNamespace>;
	const existingMaps = (existingVoxel.Maps || {}) as Partial<VoxelMaps>;

	// Create safe Maps.await that preserves existing Loaded state and classes
	const safeAwait = function(callback: () => void): void {
		if (existingMaps.Loaded) {
			callback();
			return;
		}

		// Listen for maps:loaded event
		document.addEventListener('maps:loaded', () => callback());

		// Try to load the map script if not already loading
		const mapsConfig = (Voxel_Config as any)['maps'];
		const provider = mapsConfig?.provider || 'google_maps';
		const providerConfig = Voxel_Config[provider as keyof VoxelConfig] as { handle?: string } | undefined;
		const handleName = providerConfig?.handle;
		if (handleName && typeof handleName === 'string') {
			const scriptEl = document.getElementById(handleName) as HTMLScriptElement | null;
			const dataset = (scriptEl as any)?.dataset;
			const srcValue = dataset?.src;
			if (scriptEl && srcValue) {
				(scriptEl as any)['src'] = srcValue;
			}
		}
	};

	// MERGE Maps namespace - preserve all existing properties
	const mergedMaps = {
		...existingMaps,  // Preserve GoogleMaps, Map, Marker, Clusterer, etc.
		Loaded: existingMaps.Loaded || false,
		await: safeAwait,
	};

	window.Voxel = {
		// Preserve any existing properties
		...existingVoxel,

		// Marker to prevent re-initialization
		_fseInitialized: true,

		// Vue mixins - merge with existing
		mixins: existingVoxel.mixins || {},

		// Vue components - merge with existing
		components: existingVoxel.components || {},

		/* ======================================================================
		   MAPS NAMESPACE - MERGED, NOT REPLACED
		   Matches: voxel-commons.beautified.js lines 232-250
		   ====================================================================== */
		Maps: mergedMaps,

		/* ======================================================================
		   HELPER FUNCTIONS
		   Matches: voxel-commons.beautified.js lines 256-475
		   ====================================================================== */
		helpers: {
			/**
			 * Find parent Vue component by name (stub for React compatibility)
			 */
			getParent(_vm: unknown, _name: string): unknown {
				return null; // Not applicable in React
			},

			/**
			 * Format date as YYYY-MM-DD
			 * Matches: lines 290-303
			 */
			dateFormatYmd(date: Date): string {
				return [
					date.getFullYear(),
					('0' + (date.getMonth() + 1)).slice(-2),
					('0' + date.getDate()).slice(-2),
				].join('-');
			},

			/**
			 * Format date and time using browser locale
			 * Matches: lines 312-317
			 */
			dateTimeFormat(date: Date): string {
				return date.toLocaleString(undefined, {
					dateStyle: 'medium',
					timeStyle: 'short',
				});
			},

			/**
			 * Format date only using browser locale
			 * Matches: lines 325-327
			 */
			dateFormat(date: Date): string {
				return date.toLocaleString(undefined, { dateStyle: 'medium' });
			},

			/**
			 * Format time only using browser locale
			 * Matches: lines 335-337
			 */
			timeFormat(date: Date): string {
				return date.toLocaleString(undefined, { timeStyle: 'short' });
			},

			/**
			 * Format currency amount using Intl.NumberFormat
			 * Matches: lines 354-368
			 */
			currencyFormat(amount: number, currencyCode?: string): string {
				const code = currencyCode || String(Voxel_Config['currency'] || 'USD');
				try {
					const hasFractionalPart = amount % 1 !== 0;
					const locale = String(Voxel_Config['locale'] || 'en_US');
					return new Intl.NumberFormat(locale.replace('_', '-'), {
						style: 'currency',
						currency: code,
						minimumFractionDigits: hasFractionalPart ? 2 : 0,
						maximumFractionDigits: hasFractionalPart ? 2 : 0,
					}).format(amount);
				} catch (error) {
					return code + ' ' + amount;
				}
			},

			/**
			 * Debounce a function call
			 * Matches: lines 386-401
			 */
			debounce<T extends (...args: unknown[]) => unknown>(
				func: T,
				delay: number = 200,
				transformArgs: ((args: unknown[]) => unknown[]) | null = null
			): (...args: Parameters<T>) => void {
				let timeoutId: ReturnType<typeof setTimeout>;

				return (...args: Parameters<T>): void => {
					clearTimeout(timeoutId);

					let processedArgs: unknown[] = args;
					if (typeof transformArgs === 'function') {
						processedArgs = transformArgs(args);
					}

					timeoutId = setTimeout(() => {
						func.apply(null, processedArgs as Parameters<T>);
					}, delay);
				};
			},

			/**
			 * Calculate what percentage of an element is visible in the viewport
			 * Matches: lines 416-436
			 */
			viewportPercentage(element: HTMLElement): number {
				const rect = element.getBoundingClientRect();
				const viewportHeight = window.innerHeight;

				// Element completely outside viewport
				if (rect.top >= viewportHeight || rect.bottom <= 0) {
					return 0;
				}

				// Element larger than viewport and fills it
				if (rect.top < 0 && rect.bottom > viewportHeight) {
					return 1;
				}

				// Calculate visible portion
				const hiddenAbove = rect.top < 0 ? Math.abs(rect.top) : 0;
				const hiddenBelow = viewportHeight < rect.bottom ? rect.bottom - viewportHeight : 0;
				const visibleHeight = rect.height - hiddenAbove - hiddenBelow;

				return visibleHeight / viewportHeight;
			},

			/**
			 * Generate sequential numeric IDs
			 * Matches: lines 446-451
			 */
			sequentialId(): number {
				if (!sequentialIdCount) {
					sequentialIdCount = 1;
				}
				return sequentialIdCount++;
			},

			/**
			 * Generate random alphanumeric ID
			 * Matches: lines 463-474
			 */
			randomId(length: number = 8): string {
				const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
				const maxIndex = chars.length - 1;
				let result = '';

				for (let i = 0; i < length; i++) {
					const randomIndex = Math.floor(0 + Math.random() * (maxIndex - 0 + 1));
					result += chars[randomIndex];
				}

				return result;
			},
		},

		/* ======================================================================
		   FILTER SYSTEM (WordPress-style hooks)
		   Matches: voxel-commons.beautified.js lines 163-213
		   ====================================================================== */
		_filters: {},

		/**
		 * Register a filter callback
		 * Matches: lines 183-188
		 */
		addFilter(name: string, callback: (...args: unknown[]) => unknown, priority: number = 10): void {
			const filters = (this as any)._filters;
			if (!filters[name]) {
				filters[name] = [];
			}
			filters[name].push({ callback, priority });
			filters[name].sort((a: FilterCallback, b: FilterCallback) => a.priority - b.priority);
		},

		/**
		 * Apply all registered filter callbacks to a value
		 * Matches: lines 200-213
		 */
		applyFilters(name: string, value: unknown, ...args: unknown[]): unknown {
			const filters = (this as any)._filters;
			if (!filters[name] || !filters[name].length) {
				return value;
			}

			let result = value;
			for (let i = 0; i < filters[name].length; i++) {
				result = filters[name][i].callback.apply(null, [result, ...args]);
			}
			return result;
		},

		/* ======================================================================
		   DIALOG & NOTIFICATION SYSTEM
		   Matches: voxel-commons.beautified.js lines 509-610
		   ====================================================================== */

		/**
		 * Show a dialog/notification with optional action buttons
		 * Matches: lines 509-571
		 */
		dialog(options: DialogOptions = { message: '' }): void {
			const message = typeof options.message === 'string' ? options.message : '';

			if (!message.length) {
				return;
			}

			const type = typeof options.type === 'string' && options.type.length ? options.type : 'info';
			const actions = Array.isArray(options.actions) ? options.actions : [];
			const timeout = typeof options.timeout === 'number' ? options.timeout : 7500;
			const hideClose = !!options.hideClose;

			// Get template and replace placeholders
			const templateEl = document.getElementById('vx-alert-tpl');
			if (!templateEl) {
				// Fallback: create simple alert if template not found
				console.warn('[Voxel FSE] #vx-alert-tpl template not found, using console fallback');
				console.log(`[Voxel ${type}] ${message}`);
				return;
			}

			const templateHtml = templateEl.textContent
				?.replace('{type}', type || 'info')
				.replace('{message}', message);

			if (!templateHtml) return;

			const $ = window.jQuery;
			if (!$) {
				console.warn('[Voxel FSE] jQuery not available for dialog');
				return;
			}

			const $alert = $(templateHtml).hide();

			// Add action buttons (reverse order for prepend)
			if (actions.length) {
				[...actions].reverse().forEach((action) => {
					const $button = $('<a href="javascript:void(0);" class="ts-btn ts-btn-4">')
						.attr({ href: action.link || '#' })
						.html(action.label);

					if (typeof action.onClick === 'function') {
						$button.on('click', action.onClick as any);
					}

					// Close dialog when action clicked
					$button.on('click', () => $alert.find('.close-alert').trigger('click'));

					$alert.find('.alert-actions').prepend($button);
				});
			}

			// Hide close button if requested
			if (hideClose) {
				$alert.find('.close-alert').hide();
			}

			// Setup close button handler
			$alert.find('.close-alert').on('click', (event: any) => {
				event.preventDefault();
				$alert.fadeOut(100, () => $alert.remove());
			});

			// Custom close label
			if (typeof options.closeLabel === 'string' && options.closeLabel.length) {
				$alert.find('.close-alert').html(options.closeLabel);
			}

			// Auto-dismiss timeout
			if (typeof timeout === 'number' && timeout > 0) {
				setTimeout(() => $alert.fadeOut(100, () => $alert.remove()), timeout);
			}

			// Show the dialog
			$('#vx-alert').html($alert as unknown as string);
			$alert.fadeIn(100);
		},

		/**
		 * Show an auto-dismissing alert notification
		 * Matches: lines 585-587
		 */
		alert(message: string, type: string = 'info', actions: DialogAction[] = [], timeout: number = 7500): void {
			(this as any).dialog({ message, type: type as DialogOptions['type'], actions, timeout });
		},

		/**
		 * Show a prompt that requires user action (no auto-dismiss)
		 * Matches: lines 608-610
		 */
		prompt(message: string, type: string = 'info', actions: DialogAction[] = [], timeout: number = -1): void {
			(this as any).dialog({ message, type: type as DialogOptions['type'], actions, timeout, hideClose: true });
		},

		/**
		 * Show "Please log in" prompt with login/register buttons
		 * Matches: lines 631-645
		 */
		authRequired(message: string | null = null): void {
			const l10n = Voxel_Config['l10n'] as any;
			if (message === null) {
				message = String(l10n?.accountRequired || 'Please log in to continue');
			}

			(this as any).alert(
				message,
				'info',
				[
					{ link: String(Voxel_Config['login_url'] || '/login'), label: String(l10n?.login || 'Log In') },
					{ link: String(Voxel_Config['register_url'] || '/register'), label: String(l10n?.register || 'Sign Up') },
				],
				7500
			);
		},

		/**
		 * Event handler: prevent action and show login prompt if user not logged in
		 * Matches: lines 659-664
		 */
		requireAuth(event: Event): void {
			if (!Voxel_Config['is_logged_in']) {
				event.preventDefault();
				(this as any).authRequired();
			}
		},

		/* ======================================================================
		   URL PARAMETER HELPERS
		   Matches: voxel-commons.beautified.js lines 681-719
		   ====================================================================== */

		/**
		 * Get URL query parameter value
		 * Matches: lines 681-683
		 */
		getSearchParam(paramName: string): string | null {
			return new URL(window.location.href).searchParams.get(paramName);
		},

		/**
		 * Set URL query parameter (updates browser URL without reload)
		 * Matches: lines 700-704
		 */
		setSearchParam(paramName: string, value: string): void {
			const url = new URL(window.location.href);
			url.searchParams.set(paramName, value);
			window.history.replaceState(null, '', url.toString());
		},

		/**
		 * Remove URL query parameter
		 * Matches: lines 715-719
		 */
		deleteSearchParam(paramName: string): void {
			const url = new URL(window.location.href);
			url.searchParams.delete(paramName);
			window.history.replaceState(null, '', url.toString());
		},

		/* ======================================================================
		   SHARING & CLIPBOARD
		   Matches: voxel-commons.beautified.js lines 744-769
		   ====================================================================== */

		/**
		 * Share content using Web Share API
		 * Matches: lines 744-751
		 */
		async share(shareData: ShareData): Promise<void> {
			try {
				await navigator.share(shareData);
			} catch (error) {
				// User cancelled share or API not supported - fail silently
			}
		},

		/**
		 * Copy text to clipboard and show confirmation
		 * Matches: lines 765-769
		 */
		copy(text: string): void {
			const l10n = Voxel_Config['l10n'] as any;
			navigator.clipboard.writeText(text).then(() =>
				(this as any).alert(String(l10n?.copied || 'Copied!'), 'info', [], 2250)
			);
		},

		/* ======================================================================
		   NAVIGATION HELPERS
		   Matches: voxel-commons.beautified.js lines 851-856
		   ====================================================================== */

		/**
		 * Smooth scroll to element
		 * Matches: lines 851-856
		 */
		scrollTo(element: HTMLElement | null): void {
			if (element) {
				(window as any).scrollTo({
					top: element.getBoundingClientRect().top + window.pageYOffset,
					behavior: 'smooth',
				});
			}
		},

		/**
		 * Get cookie value by name
		 * Matches: lines 858-860
		 */
		getCookie(name: string): string | undefined {
			return document.cookie
				.split('; ')
				.find((row) => row.startsWith(name + '='))
				?.split('=')[1];
		},

		/**
		 * Open cart popup
		 * Matches: lines 862-866
		 */
		openCart(): void {
			const cartTrigger = document.querySelector('.ts-popup-cart > a') as HTMLElement | null;
			if (cartTrigger) {
				(this as any).scrollTo(cartTrigger);
				cartTrigger.dispatchEvent(new Event('vx:open'));
			}
		},
	} as unknown as VoxelNamespace;

	// Dispatch init event (matches original commons.js behavior)
	document.dispatchEvent(new CustomEvent('voxel/commons/init'));

	console.log('[Voxel FSE Commons] Initialized (React-compatible)');
}

// Initialize immediately
initVoxelCommons();

// Also initialize on DOMContentLoaded in case this script loads early
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initVoxelCommons);
}

export { initVoxelCommons };
