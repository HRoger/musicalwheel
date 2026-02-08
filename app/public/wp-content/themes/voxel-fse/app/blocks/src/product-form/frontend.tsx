/**
 * Product Form Block - Frontend Entry Point (Plan C+)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches product configuration from REST API at runtime.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/product-form.php
 * - Voxel JS: themes/voxel/assets/dist/product-form.js
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: docs/block-conversions/product-form/voxel-product-form.beautified.js
 * Original: themes/voxel/assets/dist/product-form.js (42.5 KB)
 *
 * PRODUCT MODES (3 types):
 * ✅ Regular - Base price + addons + quantity
 * ✅ Variable - Product variations with attributes
 * ✅ Booking - Date/time selection with availability
 *
 * ADDON COMPONENTS (6 types):
 * ✅ AddonSwitcher - Simple on/off toggle
 * ✅ AddonNumeric - Quantity input (min/max units)
 * ✅ AddonSelect - Single choice dropdown
 * ✅ AddonMultiselect - Multiple choice dropdown
 * ✅ AddonCustomSelect - Card-style single select
 * ✅ AddonCustomMultiselect - Card-style multi select
 *
 * BOOKING MODES (3 types):
 * ✅ date_range - Check-in/check-out (nights/days)
 * ✅ single_day - Single date selection
 * ✅ timeslots - Time slot picker with availability
 *
 * CORE FEATURES:
 * ✅ HTML structure matches (ts-product-form, ts-product-main)
 * ✅ Dynamic price calculation
 * ✅ Custom pricing (date ranges, day of week)
 * ✅ Stock management
 * ✅ Variations with image switching
 * ✅ Quantity controls (min/max/sold_individually)
 * ✅ Data inputs (text, number, select, etc.)
 * ✅ External addon handlers
 * ✅ Cart operations (add to cart, guest cart)
 * ✅ Search context auto-fill from URL
 * ✅ Pikaday date picker integration
 * ✅ Loading/error states with proper classes
 *
 * AJAX SYSTEM:
 * - Voxel: `?vx=1&action=products.add_to_cart`
 * - FSE: REST API `voxel-fse/v1/product-form/config`
 * - Guest cart: localStorage persistence
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ ProductFormComponent accepts props (context-aware)
 * ✅ No jQuery in component logic
 * ✅ REST API endpoint for headless config fetching
 * ✅ TypeScript strict mode
 *
 * VXCONFIG FORMAT (from script.vxconfig tag):
 * {
 *   settings: { product_mode, cart_nonce, search_context },
 *   props: { base_price, minimum_price, custom_prices, fields },
 *   value: { addons, stock, variations, booking, data_inputs },
 *   l10n: { quantity, added_to_cart, view_cart }
 * }
 *
 * REST API: GET voxel-fse/v1/product-form/config?post_id={id}
 * Returns: ProductFormConfig with full product configuration
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import ProductFormComponent from './shared/ProductFormComponent';
import type {
	ProductFormAttributes,
	ProductFormVxConfig,
	ProductFormConfig,
	SearchContextConfig,
} from './types';
import { DEFAULT_PRODUCT_FORM_ICONS, DEFAULT_PRODUCT_FORM_ATTRIBUTES } from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';
import { parseSearchContextFromReferrer, mergeSearchContext } from './context';

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Get the current post ID from page context
 */
function getCurrentPostId(): number | null {
	// Try to get from Voxel's global config
	const win = window as Window & {
		voxel?: { current_post?: { id?: number } };
		wp?: { data?: { select?: (store: string) => { getCurrentPostId?: () => number } } };
	};

	if (win.voxel?.current_post?.id) {
		return win.voxel.current_post.id;
	}

	// Try WordPress data store (if available)
	if (win.wp?.data?.select) {
		const postId = win.wp.data.select('core/editor')?.getCurrentPostId?.();
		if (postId) return postId;
	}

	// Try to extract from URL or body class
	const bodyClasses = document.body.className;
	const postIdMatch = bodyClasses.match(/postid-(\d+)/);
	if (postIdMatch) {
		return parseInt(postIdMatch[1], 10);
	}

	return null;
}

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: voxel-product-form.beautified.js vxconfig format
 */
function normalizeConfig(raw: Record<string, unknown>): ProductFormVxConfig {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1) return true;
		if (val === 'false' || val === '0' || val === 0) return false;
		return fallback;
	};

	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		return fallback;
	};

	// Get nested settings object
	const rawSettings = (raw.settings ?? {}) as Record<string, unknown>;

	// Get nested icons object
	const rawIcons = (raw.icons ?? {}) as Record<string, unknown>;

	// Parse search context config
	// Evidence: voxel-product-form.beautified.js lines 49-53
	const searchContextConfig = (
		rawSettings.searchContextConfig ?? rawSettings.search_context_config ?? null
	) as SearchContextConfig | null;

	// Parse existing search context from config
	const existingSearchContext = (
		rawSettings.searchContext ?? rawSettings.search_context ?? {}
	) as Record<string, unknown>;

	// Parse search context from referrer URL
	// Evidence: voxel-product-form.beautified.js lines 2065-2132
	const parsedSearchContext = parseSearchContextFromReferrer(searchContextConfig);

	// Merge existing context with parsed context (existing takes precedence)
	const mergedSearchContext = mergeSearchContext(
		existingSearchContext as import('./types').SearchContext | undefined,
		parsedSearchContext
	);

	return {
		// Block ID
		blockId: normalizeString(raw.blockId ?? raw.block_id, ''),

		// Settings - support both camelCase and snake_case
		settings: {
			showPriceCalculator: normalizeString(
				rawSettings.showPriceCalculator ?? rawSettings.show_price_calculator,
				'show'
			) as 'show' | 'hide' | 'subtotal',
			showSubtotalOnly: normalizeBool(
				rawSettings.showSubtotalOnly ?? rawSettings.show_subtotal_only,
				false
			),
			hideCardSubheading: normalizeBool(
				rawSettings.hideCardSubheading ?? rawSettings.hide_card_subheading,
				false
			),
			cardSelectOnClick: normalizeBool(
				rawSettings.cardSelectOnClick ?? rawSettings.card_select_on_click,
				true
			),
			productMode: normalizeString(
				rawSettings.productMode ?? rawSettings.product_mode,
				'regular'
			) as 'regular' | 'variable' | 'booking',
			cartNonce: normalizeString(
				rawSettings.cartNonce ?? rawSettings.cart_nonce,
				''
			),
			// Use merged search context (referrer URL + existing config)
			searchContext: mergedSearchContext as Record<string, unknown>,
			searchContextConfig: searchContextConfig as Record<string, unknown> | null,
		},

		// Icons - support both formats
		icons: {
			calendarIcon: rawIcons.calendarIcon ?? rawIcons.calendar_icon ?? null,
			minusIcon: rawIcons.minusIcon ?? rawIcons.minus_icon ?? null,
			plusIcon: rawIcons.plusIcon ?? rawIcons.plus_icon ?? null,
			cartIcon: rawIcons.cartIcon ?? rawIcons.cart_icon ?? null,
			checkIcon: rawIcons.checkIcon ?? rawIcons.check_icon ?? null,
			downIcon: rawIcons.downIcon ?? rawIcons.down_icon ?? null,
		} as Record<string, unknown>,

		// Pass through props and value unchanged (already structured)
		props: (raw.props ?? {}) as Record<string, unknown>,
		value: (raw.value ?? {}) as Record<string, unknown>,
		l10n: (raw.l10n ?? {}) as Record<string, string>,
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): ProductFormVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>(
		'script.vxconfig'
	);

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const rawConfig = JSON.parse(vxconfigScript.textContent);
			// Use normalizeConfig for consistent format handling
			return normalizeConfig(rawConfig);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Fetch product form configuration from REST API
 */
async function fetchProductConfig(postId: number): Promise<ProductFormConfig | null> {
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/product-form/config?post_id=${postId}`;

	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};
		const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(endpoint, {
			credentials: 'same-origin',
			headers,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		return data as ProductFormConfig;
	} catch (error) {
		console.error('Failed to fetch product config:', error);
		return null;
	}
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(config: ProductFormVxConfig): ProductFormAttributes {
	return {
		...DEFAULT_PRODUCT_FORM_ATTRIBUTES,
		blockId: config.blockId || '',
		showPriceCalculator: config.settings?.showPriceCalculator || 'show',
		showSubtotalOnly: config.settings?.showSubtotalOnly || false,
		hideCardSubheading: config.settings?.hideCardSubheading || false,
		cardSelectOnClick: config.settings?.cardSelectOnClick ?? true,
		icons: {
			...DEFAULT_PRODUCT_FORM_ICONS,
			...config.icons,
		},
	};
}

/**
 * Wrapper component for frontend rendering
 */
interface ProductFormWrapperProps {
	config: ProductFormVxConfig;
	postId: number | null;
}

function ProductFormWrapper({ config, postId }: ProductFormWrapperProps): React.ReactElement {
	const [productConfig, setProductConfig] = useState<ProductFormConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const attributes = buildAttributes(config);

	useEffect(() => {
		let cancelled = false;

		async function loadProductConfig() {
			if (!postId) {
				setError('No post ID found');
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchProductConfig(postId);
				if (!cancelled) {
					setProductConfig(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load product');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadProductConfig();

		return () => {
			cancelled = true;
		};
	}, [postId]);

	// Show loading state
	if (isLoading) {
		return (
			<div className="ts-product-main vx-loading-screen">
				<div className="ts-no-posts">
					<span className="ts-loader"></span>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className="ts-product-main">
				<div className="ts-form-group ts-no-posts">
					<i className="las la-exclamation-circle" />
					<p>{error}</p>
				</div>
			</div>
		);
	}

	return (
		<ProductFormComponent
			attributes={attributes}
			context="frontend"
			config={config}
			productConfig={productConfig}
		/>
	);
}

/**
 * Initialize product form blocks on the page
 */
function initProductForms(): void {
	// Find all product form blocks
	const productFormBlocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-product-form, .ts-product-form'
	);

	const postId = getCurrentPostId();

	productFormBlocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Skip Voxel's native product forms (not our FSE block)
		if (!container.classList.contains('voxel-fse-product-form')) {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for product form block');
			return;
		}

		// Mark as hydrated
		container.dataset.hydrated = 'true';

		// Remove placeholder
		const placeholder = container.querySelector('.vx-loading-screen');
		if (placeholder) {
			placeholder.remove();
		}

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<ProductFormWrapper config={config} postId={postId} />
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initProductForms);
} else {
	initProductForms();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initProductForms);
window.addEventListener('pjax:complete', initProductForms);

// Voxel-specific event for markup updates
document.addEventListener('voxel:markup-update', initProductForms);

// Re-export for window.render_product_form() compatibility
const win = window as Window & { render_product_form?: () => void };
win.render_product_form = initProductForms;
