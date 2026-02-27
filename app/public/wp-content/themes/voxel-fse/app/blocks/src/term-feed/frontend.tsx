/**
 * Term Feed Block - Frontend Entry Point (Plan C+ Hybrid)
 *
 * Hydrates React by reading vxconfig from save.tsx output.
 * Fetches terms data from REST API and renders TermFeedComponent.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/term-feed.php
 * - Voxel template: themes/voxel/templates/widgets/term-feed.php
 * - REST API: /voxel-fse/v1/term-feed/terms
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: themes/voxel/app/widgets/term-feed.php (721 lines)
 *
 * DATA SOURCE (2 modes):
 * ✅ filters - Query by taxonomy with filtering options
 * ✅ manual - Manual term ID selection (repeater)
 *
 * QUERY SETTINGS:
 * ✅ ts_choose_taxonomy - Select Voxel taxonomy
 * ✅ ts_parent_term_id - Filter by parent term (direct children)
 * ✅ ts_order - default or name (alphabetical)
 * ✅ ts_per_page - Number of terms to load (max 500)
 * ✅ ts_hide_empty - Hide terms without posts
 * ✅ ts_hide_empty_pt - Filter empty by specific post type
 * ✅ ts_card_template - Term card template selection
 *
 * LAYOUT MODES:
 * ✅ ts-feed-grid-default - Grid layout with columns
 * ✅ ts-feed-nowrap - Carousel/horizontal scroll
 *
 * CAROUSEL SETTINGS:
 * ✅ ts_nowrap_item_width - Item width (px, %, custom)
 * ✅ carousel_autoplay - Auto slide toggle
 * ✅ carousel_autoplay_interval - Slide interval (ms)
 * ✅ ts_scroll_padding - Scroll padding
 * ✅ ts_item_padding - Item padding
 *
 * GRID SETTINGS:
 * ✅ ts_feed_column_no - Number of columns (1-6)
 * ✅ ts_feed_col_gap - Item gap
 *
 * STYLING:
 * ✅ mod_accent - Replace accent color with term color
 *
 * CAROUSEL NAVIGATION (Normal + Hover):
 * ✅ Horizontal/vertical position
 * ✅ Button icon color, size, icon size
 * ✅ Button background, backdrop blur
 * ✅ Border (type, width, color, radius)
 * ✅ Hover states for all properties
 *
 * ICONS:
 * ✅ ts_chevron_right - Right navigation icon
 * ✅ ts_chevron_left - Left navigation icon
 *
 * HTML STRUCTURE:
 * ✅ .post-feed-grid (shared with post-feed)
 * ✅ .ts-preview / term card rendering
 * ✅ .post-feed-nav / .ts-icon-btn navigation
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ TermFeedComponent accepts props (context-aware)
 * ✅ No jQuery in component logic
 * ✅ REST API endpoint for headless term fetching
 * ✅ TypeScript strict mode
 *
 * VXCONFIG FORMAT (from script.vxconfig tag):
 * {
 *   source: 'filters' | 'manual',
 *   manualTermIds: number[],
 *   taxonomy: string,
 *   parentTermId: number,
 *   order: 'default' | 'name',
 *   perPage: number,
 *   hideEmpty: boolean,
 *   hideEmptyPostType: string,
 *   cardTemplate: string,
 *   layoutMode: 'ts-feed-grid-default' | 'ts-feed-nowrap',
 *   // Carousel/grid settings...
 *   // Navigation styling...
 *   responsive: { ...tablet/mobile overrides }
 * }
 *
 * REST API: GET voxel-fse/v1/term-feed/terms?source=...&taxonomy=...
 * Returns: { terms: TermData[], total: number, taxonomy: string }
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import TermFeedComponent from './shared/TermFeedComponent';
import type {
	TermFeedAttributes,
	TermFeedVxConfig,
	TermData,
	ManualTermItem,
	BorderWidth,
} from './types';
import type { IconValue } from '@shared/types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Default border width structure
 */
const DEFAULT_BORDER_WIDTH: BorderWidth = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0,
};

/**
 * Default icon structure
 */
const DEFAULT_ICON: IconValue = {
	library: '',
	value: '',
};

/**
 * Normalize config from various sources (vxconfig, REST API, data attributes)
 * Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
 *
 * NEXT.JS READINESS: This function enables headless architecture by
 * normalizing config from any source to a consistent format.
 *
 * Reference: themes/voxel/app/widgets/term-feed.php control names
 */
function normalizeConfig(raw: Record<string, unknown>): TermFeedVxConfig {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
		if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
		return fallback;
	};

	// Helper for string normalization
	const normalizeString = (val: unknown, fallback: string): string => {
		if (typeof val === 'string') return val;
		return fallback;
	};

	// Helper for number normalization
	const normalizeNumber = (val: unknown, fallback: number): number => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? fallback : parsed;
		}
		return fallback;
	};

	// Optional number: returns undefined when not set (for nav styling that should inherit Voxel defaults)
	const optionalNumber = (val: unknown): number | undefined => {
		if (typeof val === 'number') return val;
		if (typeof val === 'string') {
			const parsed = parseFloat(val);
			return isNaN(parsed) ? undefined : parsed;
		}
		return undefined;
	};

	// Optional string: returns undefined when not set or empty
	const optionalString = (val: unknown): string | undefined => {
		if (typeof val === 'string' && val !== '') return val;
		return undefined;
	};

	// Helper for icon normalization
	const normalizeIcon = (val: unknown): IconValue => {
		if (val && typeof val === 'object') {
			const iconObj = val as Record<string, unknown>;
			return {
				library: normalizeString(iconObj['library'], '') as IconValue['library'],
				value: normalizeString(iconObj['value'], ''),
			};
		}
		return { ...DEFAULT_ICON };
	};

	// Helper for border width normalization
	const normalizeBorderWidth = (val: unknown): BorderWidth => {
		if (val && typeof val === 'object') {
			const bw = val as Record<string, unknown>;
			return {
				top: normalizeNumber(bw['top'], 0),
				right: normalizeNumber(bw['right'], 0),
				bottom: normalizeNumber(bw['bottom'], 0),
				left: normalizeNumber(bw['left'], 0),
			};
		}
		return { ...DEFAULT_BORDER_WIDTH };
	};

	// Helper for manual term IDs normalization
	const normalizeManualTermIds = (val: unknown): number[] => {
		if (!val) return [];
		if (Array.isArray(val)) {
			return val.map((item) => {
				if (typeof item === 'number') return item;
				if (typeof item === 'object' && item !== null) {
					const termId = (item as Record<string, unknown>)['term_id'];
					return normalizeNumber(termId, 0);
				}
				return normalizeNumber(item, 0);
			}).filter((id) => id > 0);
		}
		return [];
	};

	// Get responsive values object
	const rawResponsive = (raw['responsive'] ?? {}) as Record<string, unknown>;

	return {
		// Data source - support both camelCase and snake_case
		source: normalizeString(
			raw['source'] ?? raw['ts_source'],
			'filters'
		) as TermFeedVxConfig['source'],

		manualTermIds: normalizeManualTermIds(raw['manualTermIds'] ?? raw['manual_term_ids'] ?? raw['ts_manual_terms']),

		taxonomy: normalizeString(raw['taxonomy'] ?? raw['ts_choose_taxonomy'], ''),
		parentTermId: normalizeNumber(raw['parentTermId'] ?? raw['parent_term_id'] ?? raw['ts_parent_term_id'], 0),
		order: normalizeString(
			raw['order'] ?? raw['ts_order'],
			'default'
		) as TermFeedVxConfig['order'],
		perPage: normalizeNumber(raw['perPage'] ?? raw['per_page'] ?? raw['ts_per_page'], 10),
		hideEmpty: normalizeBool(raw['hideEmpty'] ?? raw['hide_empty'] ?? raw['ts_hide_empty'], false),
		hideEmptyPostType: normalizeString(raw['hideEmptyPostType'] ?? raw['hide_empty_post_type'] ?? raw['ts_hide_empty_pt'], ':all'),
		cardTemplate: normalizeString(raw['cardTemplate'] ?? raw['card_template'] ?? raw['ts_card_template'], 'main'),

		// Layout
		layoutMode: normalizeString(
			raw['layoutMode'] ?? raw['layout_mode'] ?? raw['ts_wrap_feed'],
			'ts-feed-grid-default'
		) as TermFeedVxConfig['layoutMode'],

		// Carousel settings
		carouselItemWidth: normalizeNumber(raw['carouselItemWidth'] ?? raw['carousel_item_width'] ?? raw['ts_nowrap_item_width'], 200),
		carouselItemWidthUnit: normalizeString(raw['carouselItemWidthUnit'] ?? raw['carousel_item_width_unit'], 'px'),
		carouselAutoplay: normalizeBool(raw['carouselAutoplay'] ?? raw['carousel_autoplay'], false),
		carouselAutoplayInterval: normalizeNumber(raw['carouselAutoplayInterval'] ?? raw['carousel_autoplay_interval'], 3000),

		// Grid settings
		gridColumns: normalizeNumber(raw['gridColumns'] ?? raw['grid_columns'] ?? raw['ts_feed_column_no'], 3),
		itemGap: normalizeNumber(raw['itemGap'] ?? raw['item_gap'] ?? raw['ts_feed_col_gap'], 20),
		scrollPadding: normalizeNumber(raw['scrollPadding'] ?? raw['scroll_padding'] ?? raw['ts_scroll_padding'], 0),
		itemPadding: normalizeNumber(raw['itemPadding'] ?? raw['item_padding'] ?? raw['ts_item_padding'], 0),
		replaceAccentColor: normalizeBool(raw['replaceAccentColor'] ?? raw['replace_accent_color'] ?? raw['mod_accent'], false),

		// Navigation styling - Normal state (use undefined when not set, so CSS generator skips and Voxel defaults apply)
		navHorizontalPosition: optionalNumber(raw['navHorizontalPosition'] ?? raw['nav_horizontal_position'] ?? raw['ts_fnav_btn_horizontal']),
		navVerticalPosition: optionalNumber(raw['navVerticalPosition'] ?? raw['nav_vertical_position'] ?? raw['ts_fnav_btn_vertical']),
		navButtonIconColor: optionalString(raw['navButtonIconColor'] ?? raw['nav_button_icon_color'] ?? raw['ts_fnav_btn_color']),
		navButtonSize: optionalNumber(raw['navButtonSize'] ?? raw['nav_button_size'] ?? raw['ts_fnav_btn_size']),
		navButtonIconSize: optionalNumber(raw['navButtonIconSize'] ?? raw['nav_button_icon_size'] ?? raw['ts_fnav_btn_icon_size']),
		navButtonBackground: optionalString(raw['navButtonBackground'] ?? raw['nav_button_background'] ?? raw['ts_fnav_btn_nbg']),
		navBackdropBlur: optionalNumber(raw['navBackdropBlur'] ?? raw['nav_backdrop_blur'] ?? raw['ts_fnav_blur']),
		navBorderType: optionalString(raw['navBorderType'] ?? raw['nav_border_type']),
		navBorderWidth: (raw['navBorderWidth'] ?? raw['nav_border_width']) ? normalizeBorderWidth(raw['navBorderWidth'] ?? raw['nav_border_width']) : undefined,
		navBorderColor: optionalString(raw['navBorderColor'] ?? raw['nav_border_color']),
		navBorderRadius: optionalNumber(raw['navBorderRadius'] ?? raw['nav_border_radius'] ?? raw['ts_fnav_btn_radius']),

		// Navigation styling - Hover state
		navButtonSizeHover: optionalNumber(raw['navButtonSizeHover'] ?? raw['nav_button_size_hover'] ?? raw['ts_fnav_btn_size_h']),
		navButtonIconSizeHover: optionalNumber(raw['navButtonIconSizeHover'] ?? raw['nav_button_icon_size_hover'] ?? raw['ts_fnav_btn_icon_size_h']),
		navButtonIconColorHover: optionalString(raw['navButtonIconColorHover'] ?? raw['nav_button_icon_color_hover'] ?? raw['ts_fnav_btn_h']),
		navButtonBackgroundHover: optionalString(raw['navButtonBackgroundHover'] ?? raw['nav_button_background_hover'] ?? raw['ts_fnav_btn_nbg_h']),
		navButtonBorderColorHover: optionalString(raw['navButtonBorderColorHover'] ?? raw['nav_button_border_color_hover'] ?? raw['ts_fnav_border_c_h']),

		// Icons
		rightChevronIcon: normalizeIcon(raw['rightChevronIcon'] ?? raw['right_chevron_icon'] ?? raw['ts_chevron_right']),
		leftChevronIcon: normalizeIcon(raw['leftChevronIcon'] ?? raw['left_chevron_icon'] ?? raw['ts_chevron_left']),

		// Responsive values (pass through or normalize)
		responsive: {
			carouselItemWidth_tablet: rawResponsive['carouselItemWidth_tablet'] as number | undefined,
			carouselItemWidth_mobile: rawResponsive['carouselItemWidth_mobile'] as number | undefined,
			gridColumns_tablet: rawResponsive['gridColumns_tablet'] as number | undefined,
			gridColumns_mobile: rawResponsive['gridColumns_mobile'] as number | undefined,
			itemGap_tablet: rawResponsive['itemGap_tablet'] as number | undefined,
			itemGap_mobile: rawResponsive['itemGap_mobile'] as number | undefined,
			scrollPadding_tablet: rawResponsive['scrollPadding_tablet'] as number | undefined,
			scrollPadding_mobile: rawResponsive['scrollPadding_mobile'] as number | undefined,
			itemPadding_tablet: rawResponsive['itemPadding_tablet'] as number | undefined,
			itemPadding_mobile: rawResponsive['itemPadding_mobile'] as number | undefined,
			navHorizontalPosition_tablet: rawResponsive['navHorizontalPosition_tablet'] as number | undefined,
			navHorizontalPosition_mobile: rawResponsive['navHorizontalPosition_mobile'] as number | undefined,
			navVerticalPosition_tablet: rawResponsive['navVerticalPosition_tablet'] as number | undefined,
			navVerticalPosition_mobile: rawResponsive['navVerticalPosition_mobile'] as number | undefined,
			navButtonSize_tablet: rawResponsive['navButtonSize_tablet'] as number | undefined,
			navButtonSize_mobile: rawResponsive['navButtonSize_mobile'] as number | undefined,
			navButtonIconSize_tablet: rawResponsive['navButtonIconSize_tablet'] as number | undefined,
			navButtonIconSize_mobile: rawResponsive['navButtonIconSize_mobile'] as number | undefined,
			navBackdropBlur_tablet: rawResponsive['navBackdropBlur_tablet'] as number | undefined,
			navBackdropBlur_mobile: rawResponsive['navBackdropBlur_mobile'] as number | undefined,
			navBorderRadius_tablet: rawResponsive['navBorderRadius_tablet'] as number | undefined,
			navBorderRadius_mobile: rawResponsive['navBorderRadius_mobile'] as number | undefined,
			navButtonSizeHover_tablet: rawResponsive['navButtonSizeHover_tablet'] as number | undefined,
			navButtonSizeHover_mobile: rawResponsive['navButtonSizeHover_mobile'] as number | undefined,
			navButtonIconSizeHover_tablet: rawResponsive['navButtonIconSizeHover_tablet'] as number | undefined,
			navButtonIconSizeHover_mobile: rawResponsive['navButtonIconSizeHover_mobile'] as number | undefined,
		},
	};
}

/**
 * Parse vxconfig from script tag
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): TermFeedVxConfig | null {
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
 * Build attributes from vxconfig
 */
function buildAttributes(config: TermFeedVxConfig): TermFeedAttributes {
	return {
		blockId: '',
		source: config.source,
		manualTerms: config.manualTermIds.map((term_id) => ({
			term_id,
		})) as ManualTermItem[],
		taxonomy: config.taxonomy,
		parentTermId: config.parentTermId,
		order: config.order,
		perPage: config.perPage,
		hideEmpty: config.hideEmpty,
		hideEmptyPostType: config.hideEmptyPostType,
		cardTemplate: config.cardTemplate,
		layoutMode: config.layoutMode,
		carouselItemWidth: config.carouselItemWidth,
		carouselItemWidth_tablet: config.responsive?.carouselItemWidth_tablet,
		carouselItemWidth_mobile: config.responsive?.carouselItemWidth_mobile,
		carouselItemWidthUnit: config.carouselItemWidthUnit,
		carouselAutoplay: config.carouselAutoplay,
		carouselAutoplayInterval: config.carouselAutoplayInterval,
		gridColumns: config.gridColumns,
		gridColumns_tablet: config.responsive?.gridColumns_tablet,
		gridColumns_mobile: config.responsive?.gridColumns_mobile,
		itemGap: config.itemGap,
		itemGap_tablet: config.responsive?.itemGap_tablet,
		itemGap_mobile: config.responsive?.itemGap_mobile,
		scrollPadding: config.scrollPadding,
		scrollPadding_tablet: config.responsive?.scrollPadding_tablet,
		scrollPadding_mobile: config.responsive?.scrollPadding_mobile,
		itemPadding: config.itemPadding,
		itemPadding_tablet: config.responsive?.itemPadding_tablet,
		itemPadding_mobile: config.responsive?.itemPadding_mobile,
		replaceAccentColor: config.replaceAccentColor,
		navHorizontalPosition: config.navHorizontalPosition,
		navHorizontalPosition_tablet:
			config.responsive?.navHorizontalPosition_tablet,
		navHorizontalPosition_mobile:
			config.responsive?.navHorizontalPosition_mobile,
		navVerticalPosition: config.navVerticalPosition,
		navVerticalPosition_tablet:
			config.responsive?.navVerticalPosition_tablet,
		navVerticalPosition_mobile:
			config.responsive?.navVerticalPosition_mobile,
		navButtonIconColor: config.navButtonIconColor,
		navButtonSize: config.navButtonSize,
		navButtonSize_tablet: config.responsive?.navButtonSize_tablet,
		navButtonSize_mobile: config.responsive?.navButtonSize_mobile,
		navButtonIconSize: config.navButtonIconSize,
		navButtonIconSize_tablet: config.responsive?.navButtonIconSize_tablet,
		navButtonIconSize_mobile: config.responsive?.navButtonIconSize_mobile,
		navButtonBackground: config.navButtonBackground,
		navBackdropBlur: config.navBackdropBlur,
		navBackdropBlur_tablet: config.responsive?.navBackdropBlur_tablet,
		navBackdropBlur_mobile: config.responsive?.navBackdropBlur_mobile,
		navBorderType: config.navBorderType,
		navBorderWidth: config.navBorderWidth,
		navBorderColor: config.navBorderColor,
		navBorderRadius: config.navBorderRadius,
		navBorderRadius_tablet: config.responsive?.navBorderRadius_tablet,
		navBorderRadius_mobile: config.responsive?.navBorderRadius_mobile,
		navButtonSizeHover: config.navButtonSizeHover,
		navButtonSizeHover_tablet: config.responsive?.navButtonSizeHover_tablet,
		navButtonSizeHover_mobile: config.responsive?.navButtonSizeHover_mobile,
		navButtonIconSizeHover: config.navButtonIconSizeHover,
		navButtonIconSizeHover_tablet:
			config.responsive?.navButtonIconSizeHover_tablet,
		navButtonIconSizeHover_mobile:
			config.responsive?.navButtonIconSizeHover_mobile,
		navButtonIconColorHover: config.navButtonIconColorHover ?? '',
		navButtonBackgroundHover: config.navButtonBackgroundHover ?? '',
		navButtonBorderColorHover: config.navButtonBorderColorHover ?? '',
		rightChevronIcon: config.rightChevronIcon,
		leftChevronIcon: config.leftChevronIcon,
	};
}

/**
 * Fetch terms from REST API
 */
async function fetchTerms(config: TermFeedVxConfig): Promise<TermData[]> {
	const restUrl = getRestUrl();

	const params = new URLSearchParams({
		source: config.source,
		card_template: config.cardTemplate,
	});

	if (config.source === 'manual') {
		if (config.manualTermIds.length === 0) {
			return [];
		}
		params.set('term_ids', config.manualTermIds.join(','));
	} else {
		if (!config.taxonomy) {
			return [];
		}
		params.set('taxonomy', config.taxonomy);
		params.set('order', config.order);
		params.set('per_page', String(config.perPage));

		if (config.parentTermId) {
			params.set('parent_term_id', String(config.parentTermId));
		}
	}

	if (config.hideEmpty) {
		params.set('hide_empty', '1');
		if (config.hideEmptyPostType !== ':all') {
			params.set('hide_empty_pt', config.hideEmptyPostType);
		}
	}

	try {
		const headers: HeadersInit = {};
		const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
		if (nonce) {
			headers['X-WP-Nonce'] = nonce;
		}

		const response = await fetch(
			`${restUrl}voxel-fse/v1/term-feed/terms?${params.toString()}`,
			{
				credentials: 'same-origin',
				headers,
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		// Inject Elementor template styles into the page if returned
		if (data.styles) {
			const styleContainer = document.getElementById('vx-assets-cache')
				|| document.head;
			const temp = document.createElement('div');
			temp.innerHTML = data.styles;
			Array.from(temp.children).forEach((el) => {
				// Avoid duplicate style injections
				if (el instanceof HTMLStyleElement || el instanceof HTMLLinkElement) {
					const id = el.id || (el as HTMLLinkElement).href;
					if (id && !document.getElementById(id)) {
						styleContainer.appendChild(el);
					}
				}
			});
		}

		return data.terms || [];
	} catch (error) {
		console.error('Failed to fetch terms:', error);
		return [];
	}
}

/**
 * Wrapper component that handles data fetching
 */
interface TermFeedWrapperProps {
	config: TermFeedVxConfig;
	cssSelector: string;
	inlineTerms?: TermData[] | null;
}

function TermFeedWrapper({ config, cssSelector, inlineTerms }: TermFeedWrapperProps) {
	// If inline terms were injected server-side, use them immediately (no spinner)
	const [terms, setTerms] = useState<TermData[]>(inlineTerms ?? []);
	const [isLoading, setIsLoading] = useState(inlineTerms == null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Skip REST fetch if data was already injected server-side
		if (inlineTerms != null) {
			return;
		}

		let cancelled = false;

		async function loadTerms() {
			setIsLoading(true);
			setError(null);

			try {
				const fetchedTerms = await fetchTerms(config);

				if (!cancelled) {
					setTerms(fetchedTerms);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : 'Failed to load terms'
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadTerms();

		return () => {
			cancelled = true;
		};
	}, [config, inlineTerms]);

	// Dispatch voxel:markup-update after terms are rendered so child blocks
	// inside term card templates (e.g., product-price, advanced-list) can hydrate
	useEffect(() => {
		if (!isLoading && terms.length > 0) {
			requestAnimationFrame(() => {
				document.dispatchEvent(new CustomEvent('voxel:markup-update'));
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if ((window as any).jQuery) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(window as any).jQuery(document).trigger('voxel:markup-update');
				}
			});
		}
	}, [isLoading, terms]);

	// Build attributes from config
	const attributes = buildAttributes(config);

	return (
		<TermFeedComponent
			attributes={attributes}
			terms={terms}
			isLoading={isLoading}
			error={error}
			context="frontend"
			cssSelector={cssSelector}
		/>
	);
}

/**
 * Initialize term feed blocks on the page
 */
function initTermFeeds() {
	// Find all term feed blocks
	const termFeeds = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-term-feed'
	);

	termFeeds.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset['hydrated'] === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.error('No vxconfig found for term feed block');
			return;
		}

		// Read server-injected hydration data (vxconfig-hydrate) if available.
		// Block_Loader::inject_term_feed_config() injects this at PHP render time
		// so we can skip the REST API round-trip and show content immediately.
		let inlineTerms: TermData[] | null = null;
		const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
		if (hydrateScript?.textContent) {
			try {
				const hydrated = JSON.parse(hydrateScript.textContent);
				if (Array.isArray(hydrated.terms)) {
					inlineTerms = hydrated.terms as TermData[];

					// Inject styles that were captured server-side during card rendering
					if (hydrated.styles) {
						const styleContainer = document.getElementById('vx-assets-cache') || document.head;
						const temp = document.createElement('div');
						temp.innerHTML = hydrated.styles;
						Array.from(temp.children).forEach((el) => {
							if (el instanceof HTMLStyleElement || el instanceof HTMLLinkElement) {
								const id = el.id || (el as HTMLLinkElement).href;
								if (!id || !document.getElementById(id)) {
									styleContainer.appendChild(el);
								}
							}
						});
					}
				}
			} catch (_e) {
				// Fall back to REST fetch
			}
		}

		// Extract unique CSS selector from container classes (e.g., '.voxel-fse-term-feed-{uuid}')
		const uniqueClass = Array.from(container.classList).find(
			(cls) => cls.startsWith('voxel-fse-term-feed-') && cls !== 'voxel-fse-term-feed'
		);
		const cssSelector = uniqueClass ? `.${uniqueClass}` : `.${container.classList[0] || 'voxel-fse-term-feed'}`;

		// Mark as hydrated and clear placeholder
		container.dataset['hydrated'] = 'true';
		container.innerHTML = '';

		// Create React root and render
		const root = createRoot(container);
		root.render(<TermFeedWrapper config={config} cssSelector={cssSelector} inlineTerms={inlineTerms} />);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTermFeeds);
} else {
	initTermFeeds();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initTermFeeds);
window.addEventListener('pjax:complete', initTermFeeds);
