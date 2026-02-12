/**
 * Product Price Block - Frontend Entry Point (Plan C+)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * This enables WordPress frontend rendering while also being
 * compatible with Next.js headless architecture.
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY REFERENCE
 * ============================================================================
 * Source: themes/voxel/app/widgets/product-price.php (173 lines)
 * Template: themes/voxel/templates/widgets/product-price.php
 * Widget Name: "Product price (VX)"
 * Widget ID: ts-product-price
 *
 * CHART SECTION (Content Tab):
 * ✅ price_typo - Typography (group control)
 *    - Selector: {{WRAPPER}} .vx-price
 *
 * ✅ ts_price_col - Color (responsive)
 *    - Selector: {{WRAPPER}} .vx-price
 *    - CSS: color
 *
 * ✅ ts_strike_col_text - Linethrough text color (responsive)
 *    - Selector: {{WRAPPER}} .vx-price s
 *    - CSS: color
 *
 * ✅ ts_strike_col - Linethrough line color (responsive)
 *    - Selector: {{WRAPPER}} .vx-price s
 *    - CSS: text-decoration-color
 *
 * ✅ ts_strike_width - Linethrough line width (responsive slider)
 *    - Selector: {{WRAPPER}} .vx-price s
 *    - CSS: text-decoration-thickness
 *    - Units: px
 *    - Range: 1-200
 *
 * ✅ ts_price_nostock - Out of stock color (responsive)
 *    - Selector: {{WRAPPER}} .vx-price.no-stock
 *    - CSS: color
 *
 * HTML STRUCTURE (from template):
 * - Available with discount:
 *   <span class="vx-price">{discount_price}{suffix}</span>
 *   <span class="vx-price"><s>{regular_price}{suffix}</s></span>
 *
 * - Available without discount:
 *   <span class="vx-price">{regular_price}{suffix}</span>
 *
 * - Not available:
 *   <span class="vx-price no-stock">{error_message}</span>
 *
 * PRICE CALCULATION:
 * - Uses $field->get_minimum_price_for_date() with/without discounts
 * - Supports booking suffixes: " / night", " / day"
 * - Supports subscription intervals: " / {interval}"
 * - Error codes: PRODUCT_ERR_OUT_OF_STOCK -> "Out of stock"
 * - Default error: "Unavailable"
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import ProductPriceComponent from './shared/ProductPriceComponent';
import type {
	ProductPriceAttributes,
	ProductPriceVxConfig,
	ProductPriceData,
	TypographyConfig,
} from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Normalize vxconfig from various sources (WordPress, API, etc.)
 * Handles dual format support: camelCase, snake_case, ts_* prefixed
 */
function normalizeConfig(raw: Record<string, unknown>): ProductPriceVxConfig {
	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number') return String(val);
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number' && !isNaN(val)) return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			if (!isNaN(parsed)) return parsed;
		}
		return fallback;
	};

	// Helper for typography normalization
	const normalizeTypography = (val: unknown): TypographyConfig | undefined => {
		if (!val || typeof val !== 'object') return undefined;
		const t = val as Record<string, unknown>;
		return {
			fontFamily: typeof t.fontFamily === 'string' ? t.fontFamily : undefined,
			fontSize: typeof t.fontSize === 'string' ? t.fontSize : undefined,
			fontSize_tablet: typeof t.fontSize_tablet === 'string' ? t.fontSize_tablet : undefined,
			fontSize_mobile: typeof t.fontSize_mobile === 'string' ? t.fontSize_mobile : undefined,
			fontWeight: typeof t.fontWeight === 'string' ? t.fontWeight : undefined,
			lineHeight: typeof t.lineHeight === 'string' ? t.lineHeight : undefined,
			letterSpacing: typeof t.letterSpacing === 'string' ? t.letterSpacing : undefined,
			textTransform: ['none', 'uppercase', 'lowercase', 'capitalize'].includes(
				t.textTransform as string
			)
				? (t.textTransform as TypographyConfig['textTransform'])
				: undefined,
		};
	};

	// Extract values with fallbacks (supports camelCase, snake_case, ts_* prefixed)
	const priceColor = normalizeString(
		raw.priceColor ?? raw.price_color ?? raw.ts_price_col,
		''
	);

	const strikethroughTextColor = normalizeString(
		raw.strikethroughTextColor ?? raw.strikethrough_text_color ?? raw.ts_strike_col_text,
		''
	);

	const strikethroughLineColor = normalizeString(
		raw.strikethroughLineColor ?? raw.strikethrough_line_color ?? raw.ts_strike_col,
		''
	);

	const strikethroughWidth = normalizeNumber(
		raw.strikethroughWidth ?? raw.strikethrough_width ?? raw.ts_strike_width,
		0
	);

	const strikethroughWidthUnit = normalizeString(
		raw.strikethroughWidthUnit ?? raw.strikethrough_width_unit,
		'px'
	);

	const outOfStockColor = normalizeString(
		raw.outOfStockColor ?? raw.out_of_stock_color ?? raw.ts_price_nostock,
		''
	);

	const typography = normalizeTypography(
		raw.typography ?? raw.price_typo
	);

	const postId = normalizeNumber(
		raw.postId ?? raw.post_id,
		0
	) || undefined;

	const postType = normalizeString(
		raw.postType ?? raw.post_type,
		''
	) || undefined;

	return {
		priceColor: priceColor || undefined,
		strikethroughTextColor: strikethroughTextColor || undefined,
		strikethroughLineColor: strikethroughLineColor || undefined,
		strikethroughWidth: strikethroughWidth || undefined,
		strikethroughWidthUnit: strikethroughWidthUnit || undefined,
		outOfStockColor: outOfStockColor || undefined,
		typography,
		postId,
		postType,
	};
}

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Get the current post ID from page context
 * This is needed because save.tsx doesn't have access to post context
 */
function getPostIdFromContext(): number | null {
	// Try to get from Voxel's global context
	const voxelPost = (window as unknown as { voxelCurrentPost?: { id: number } }).voxelCurrentPost;
	if (voxelPost?.id) {
		return voxelPost.id;
	}

	// Try to get from body class (WordPress convention)
	const bodyClasses = document.body.className.split(' ');
	for (const cls of bodyClasses) {
		if (cls.startsWith('postid-')) {
			const id = parseInt(cls.replace('postid-', ''), 10);
			if (!isNaN(id)) {
				return id;
			}
		}
	}

	// Try to get from wp.data (if available)
	const wpData = (window as unknown as { wp?: { data?: { select: (store: string) => { getCurrentPostId?: () => number } } } }).wp;
	if (wpData?.data?.select) {
		const postId = wpData.data.select('core/editor')?.getCurrentPostId?.();
		if (postId) {
			return postId;
		}
	}

	// Try to get from closest article element
	const article = document.querySelector('article[id^="post-"]');
	if (article) {
		const id = parseInt(article.id.replace('post-', ''), 10);
		if (!isNaN(id)) {
			return id;
		}
	}

	return null;
}

/**
 * Parse vxconfig from container's script tag
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): ProductPriceVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript?.textContent) {
		try {
			const raw = JSON.parse(vxconfigScript.textContent) as Record<string, unknown>;
			return normalizeConfig(raw);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Build attributes from vxconfig
 */
function buildAttributesFromVxConfig(
	vxconfig: ProductPriceVxConfig,
	blockId: string
): ProductPriceAttributes {
	return {
		blockId,
		priceColor: vxconfig.priceColor,
		strikethroughTextColor: vxconfig.strikethroughTextColor,
		strikethroughLineColor: vxconfig.strikethroughLineColor,
		strikethroughWidth: vxconfig.strikethroughWidth,
		strikethroughWidthUnit: vxconfig.strikethroughWidthUnit,
		outOfStockColor: vxconfig.outOfStockColor,
		typography: vxconfig.typography as TypographyConfig,
	};
}

/**
 * Fetch product price data from REST API
 */
async function fetchProductPrice(postId: number): Promise<ProductPriceData> {
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/product-price?post_id=${postId}`;

	const headers: HeadersInit = {};
	const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
	if (nonce) {
		headers['X-WP-Nonce'] = nonce;
	}

	const response = await fetch(endpoint, {
		credentials: 'same-origin',
		headers,
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error((error as { message?: string }).message || `HTTP error ${response.status}`);
	}

	return response.json() as Promise<ProductPriceData>;
}

/**
 * Wrapper component that handles data fetching
 */
interface ProductPriceWrapperProps {
	attributes: ProductPriceAttributes;
	postId: number;
}

function ProductPriceWrapper({ attributes, postId }: ProductPriceWrapperProps) {
	const [priceData, setPriceData] = useState<ProductPriceData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadPriceData() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchProductPrice(postId);
				if (!cancelled) {
					setPriceData(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load price');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPriceData();

		return () => {
			cancelled = true;
		};
	}, [postId]);

	return (
		<ProductPriceComponent
			attributes={attributes}
			priceData={priceData}
			isLoading={isLoading}
			error={error}
			context="frontend"
			postId={postId}
		/>
	);
}

/**
 * Initialize product price blocks on the page
 */
function initProductPriceBlocks() {
	// Find all product price blocks
	const containers = document.querySelectorAll<HTMLElement>('.vxfse-product-price');

	containers.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const vxconfig = parseVxConfig(container);
		if (!vxconfig) {
			console.warn('Product price block missing vxconfig:', container);
			return;
		}

		// Get post ID from vxconfig or page context
		const postId = vxconfig.postId || getPostIdFromContext();
		if (!postId) {
			console.warn('Could not determine post ID for product price block');
			return;
		}

		// Build attributes from vxconfig
		const blockId = container.dataset.blockId || '';
		const attributes = buildAttributesFromVxConfig(vxconfig, blockId);

		// Mark as hydrated to prevent double-initialization
		container.dataset.hydrated = 'true';

		// Clear placeholder content
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(
			<ProductPriceWrapper
				attributes={attributes}
				postId={postId}
			/>
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initProductPriceBlocks);
} else {
	initProductPriceBlocks();
}

// Support Turbo/PJAX navigation (for single-page app experience)
window.addEventListener('turbo:load', initProductPriceBlocks);
window.addEventListener('pjax:complete', initProductPriceBlocks);
