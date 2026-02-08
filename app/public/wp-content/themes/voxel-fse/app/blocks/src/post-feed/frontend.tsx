/**
 * Post Feed Block - Frontend Entry Point (Plan C+)
 *
 * Reference: docs/block-conversions/post-feed/voxel-post-feed.beautified.js
 *
 * VOXEL PARITY (100%):
 * ✅ Renders HTML structure with matching CSS classes
 * ✅ Uses Voxel's ?vx=1 AJAX system (NOT admin-ajax.php)
 * ✅ Listens for voxel:markup-update event for AJAX content
 * ✅ Prevents double-initialization with data-react-mounted check
 * ✅ Triggers window.render_post_feeds() for Voxel compatibility
 * ✅ Both pagination modes (prev_next, load_more)
 * ✅ Loading states with .vx-loading
 * ✅ Button disabled/hidden states
 * ✅ Page bounds handling
 * ✅ CSS/JS asset injection to #vx-assets-cache with deduplication
 * ✅ Scroll position management (FIXES Voxel gap)
 * ✅ Loading state on error (BETTER than Voxel)
 * ✅ Load More button disabled during loading (BETTER than Voxel)
 * ✨ Extra: Carousel layout mode, search form integration, URL state sync
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ Component receives normalized data as props
 * ✅ Pure React implementation (no jQuery in component)
 * ✅ TypeScript strict mode compatible
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import PostFeedComponent from './shared/PostFeedComponent';
import type { PostFeedVxConfig, PostFeedAttributes } from './types';

/**
 * Parse vxconfig JSON from script tag
 */
function parseVxConfig(container: HTMLElement): PostFeedVxConfig | null {
	const script = container.querySelector<HTMLScriptElement>('script.vxconfig');
	if (!script?.textContent) {
		console.error('[post-feed] No vxconfig found');
		return null;
	}

	try {
		return JSON.parse(script.textContent);
	} catch (e) {
		console.error('[post-feed] Failed to parse vxconfig:', e);
		return null;
	}
}

/**
 * Normalize config from various sources (vxconfig, REST API, etc.)
 *
 * Handles both WordPress vxconfig format and future Next.js REST API format.
 * Supports both camelCase (vxconfig) and snake_case (REST API) field names.
 *
 * @param raw - Raw config from any source
 * @returns Normalized PostFeedVxConfig
 */
function normalizeConfig(raw: any): PostFeedVxConfig {
	// Normalize filters (handle both object and array formats)
	const filters: Record<string, unknown> = {};
	const rawFilters = raw.filters ?? raw.filter ?? {};

	if (typeof rawFilters === 'object' && !Array.isArray(rawFilters)) {
		Object.entries(rawFilters).forEach(([key, value]) => {
			filters[key] = value;
		});
	}

	// Normalize icons (handle both nested and flat formats)
	const icons = {
		loadMore: raw.icons?.loadMore ?? raw.icons?.load_more ?? {},
		noResults: raw.icons?.noResults ?? raw.icons?.no_results ?? {},
		rightArrow: raw.icons?.rightArrow ?? raw.icons?.right_arrow ?? {},
		leftArrow: raw.icons?.leftArrow ?? raw.icons?.left_arrow ?? {},
		rightChevron: raw.icons?.rightChevron ?? raw.icons?.right_chevron ?? {},
		leftChevron: raw.icons?.leftChevron ?? raw.icons?.left_chevron ?? {},
		reset: raw.icons?.reset ?? {},
	};

	return {
		blockId: raw.blockId ?? raw.block_id ?? '',
		source: raw.source ?? 'custom-query',
		searchFormId: raw.searchFormId ?? raw.search_form_id ?? '',
		postType: raw.postType ?? raw.post_type ?? '',
		manualPostIds: Array.isArray(raw.manualPostIds)
			? raw.manualPostIds
			: Array.isArray(raw.manual_post_ids)
				? raw.manual_post_ids
				: [],
		filters,
		// Filters mode settings
		excludePosts: raw.excludePosts ?? raw.exclude_posts ?? '',
		priorityFilter: raw.priorityFilter ?? raw.priority_filter ?? false,
		priorityMin: raw.priorityMin ?? raw.priority_min ?? 0,
		priorityMax: raw.priorityMax ?? raw.priority_max ?? 0,
		offset: raw.offset ?? 0,
		cardTemplate: raw.cardTemplate ?? raw.card_template ?? 'main',
		pagination: raw.pagination ?? 'none',
		postsPerPage: raw.postsPerPage ?? raw.posts_per_page ?? 12,
		displayDetails: raw.displayDetails ?? raw.display_details ?? false,
		noResultsLabel: raw.noResultsLabel ?? raw.no_results_label ?? 'There are no results matching your search',
		layoutMode: raw.layoutMode ?? raw.layout_mode ?? 'grid',
		columns: raw.columns ?? 3,
		columns_tablet: raw.columns_tablet ?? raw.columnsTablet ?? 2,
		columns_mobile: raw.columns_mobile ?? raw.columnsMobile ?? 1,
		itemGap: raw.itemGap ?? raw.item_gap ?? 20,
		itemGap_tablet: raw.itemGap_tablet ?? raw.itemGapTablet ?? 20,
		itemGap_mobile: raw.itemGap_mobile ?? raw.itemGapMobile ?? 15,
		carouselItemWidth: raw.carouselItemWidth ?? raw.carousel_item_width ?? 300,
		carouselItemWidth_tablet: raw.carouselItemWidth_tablet ?? raw.carouselItemWidthTablet ?? 250,
		carouselItemWidth_mobile: raw.carouselItemWidth_mobile ?? raw.carouselItemWidthMobile ?? 200,
		carouselItemWidthUnit: raw.carouselItemWidthUnit ?? raw.carousel_item_width_unit ?? 'px',
		carouselAutoSlide: raw.carouselAutoSlide ?? raw.carousel_auto_slide ?? false,
		carouselAutoSlideInterval: raw.carouselAutoSlideInterval ?? raw.carousel_auto_slide_interval ?? 3000,
		scrollPadding: raw.scrollPadding ?? raw.scroll_padding ?? 0,
		scrollPadding_tablet: raw.scrollPadding_tablet ?? raw.scrollPaddingTablet ?? 0,
		scrollPadding_mobile: raw.scrollPadding_mobile ?? raw.scrollPaddingMobile ?? 0,
		itemPadding: raw.itemPadding ?? raw.item_padding ?? 0,
		itemPadding_tablet: raw.itemPadding_tablet ?? raw.itemPaddingTablet ?? 0,
		itemPadding_mobile: raw.itemPadding_mobile ?? raw.itemPaddingMobile ?? 0,
		loadingStyle: raw.loadingStyle ?? raw.loading_style ?? 'opacity',
		loadingOpacity: raw.loadingOpacity ?? raw.loading_opacity ?? 0.5,
		icons,
	};
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(vxConfig: PostFeedVxConfig): PostFeedAttributes {
	return {
		blockId: vxConfig.blockId,
		source: vxConfig.source,
		searchFormId: vxConfig.searchFormId,
		postType: vxConfig.postType,
		manualPostIds: vxConfig.manualPostIds,
		filters: vxConfig.filters,
		// Filters mode settings
		excludePosts: vxConfig.excludePosts,
		priorityFilter: vxConfig.priorityFilter,
		priorityMin: vxConfig.priorityMin,
		priorityMax: vxConfig.priorityMax,
		offset: vxConfig.offset,
		cardTemplate: vxConfig.cardTemplate,
		pagination: vxConfig.pagination,
		postsPerPage: vxConfig.postsPerPage,
		displayDetails: vxConfig.displayDetails,
		noResultsLabel: vxConfig.noResultsLabel,
		layoutMode: vxConfig.layoutMode,
		columns: vxConfig.columns,
		columns_tablet: vxConfig.columns_tablet,
		columns_mobile: vxConfig.columns_mobile,
		itemGap: vxConfig.itemGap,
		itemGap_tablet: vxConfig.itemGap_tablet,
		itemGap_mobile: vxConfig.itemGap_mobile,
		carouselItemWidth: vxConfig.carouselItemWidth,
		carouselItemWidth_tablet: vxConfig.carouselItemWidth_tablet,
		carouselItemWidth_mobile: vxConfig.carouselItemWidth_mobile,
		carouselItemWidthUnit: vxConfig.carouselItemWidthUnit,
		carouselAutoSlide: vxConfig.carouselAutoSlide,
		carouselAutoSlideInterval: vxConfig.carouselAutoSlideInterval,
		scrollPadding: vxConfig.scrollPadding,
		scrollPadding_tablet: vxConfig.scrollPadding_tablet,
		scrollPadding_mobile: vxConfig.scrollPadding_mobile,
		itemPadding: vxConfig.itemPadding,
		itemPadding_tablet: vxConfig.itemPadding_tablet,
		itemPadding_mobile: vxConfig.itemPadding_mobile,
		loadingStyle: vxConfig.loadingStyle,
		loadingOpacity: vxConfig.loadingOpacity,
		// Icons from vxConfig.icons
		loadMoreIcon: vxConfig.icons?.loadMore || {},
		noResultsIcon: vxConfig.icons?.noResults || {},
		rightArrowIcon: vxConfig.icons?.rightArrow || {},
		leftArrowIcon: vxConfig.icons?.leftArrow || {},
		rightChevronIcon: vxConfig.icons?.rightChevron || {},
		leftChevronIcon: vxConfig.icons?.leftChevron || {},
		resetIcon: vxConfig.icons?.reset || {},
		// Style attributes (not needed for frontend, use defaults)
		counterTypography: {},
		counterTextColor: '',
		orderByTypography: {},
		orderByTextColor: '',
		orderByTextColorHover: '',
		noResultsHideScreen: false,
		noResultsIconColor: '',
		noResultsTypography: {},
		noResultsTextColor: '',
		noResultsLinkColor: '',
		paginationTypography: {},
		paginationPadding: {},
		paginationWidth: 100,
		paginationWidthUnit: '%',
		paginationJustify: 'center',
		paginationBorderType: '',
		paginationTextColor: '',
		paginationBackgroundColor: '',
		paginationIconColor: '',
		paginationTextColorHover: '',
		paginationBackgroundColorHover: '',
		paginationBorderColorHover: '',
		paginationIconColorHover: '',
		carouselNavIconColor: '',
		carouselNavBackground: '',
		carouselNavBorderType: '',
		carouselNavIconColorHover: '',
		carouselNavBackgroundHover: '',
		carouselNavBorderColorHover: '',
		hideDesktop: false,
		hideTablet: false,
		hideMobile: false,
		customClasses: '',
		customCSS: '',
	};
}

/**
 * Initialize all Post Feed block instances on page
 */
async function initBlocks(): Promise<void> {
	const containers = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-post-feed-frontend:not([data-react-mounted])'
	);

	for (const container of containers) {
		// Mark as mounted to prevent double initialization
		container.setAttribute('data-react-mounted', 'true');

		const rawConfig = parseVxConfig(container);
		if (!rawConfig) continue;

		try {
			// Normalize config for both vxconfig and REST API compatibility
			const vxConfig = normalizeConfig(rawConfig);
			const attributes = buildAttributes(vxConfig);

			// Mount React component
			const root = createRoot(container);
			root.render(
				<PostFeedComponent
					attributes={attributes}
					config={null}
					context="frontend"
					containerElement={container}
				/>
			);

			// After React mount, trigger Voxel's native post feed initialization
			// This allows Voxel's JS to hook into our rendered HTML
			requestAnimationFrame(() => {
				// Trigger Voxel's render_post_feeds if available
				if (typeof (window as any).render_post_feeds === 'function') {
					(window as any).render_post_feeds();
				}

				// Trigger jQuery event for Voxel compatibility
				if ((window as any).jQuery) {
					(window as any).jQuery(document).trigger('voxel:markup-update');
				}
			});
		} catch (error) {
			console.error('[post-feed] Initialization failed:', error);
		}
	}
}

/**
 * Connect post feed to search form
 * This function is called when a search form updates
 *
 * Search Form emits 'voxel-search-submit' on window with:
 *   - targetId: the Post Feed's blockId to target
 *   - postType: the selected post type
 *   - filters: the filter values
 */
function connectToSearchForm(): void {
	// Listen for search form submit events on window (where Search Form dispatches)
	window.addEventListener('voxel-search-submit', (event: Event) => {
		const customEvent = event as CustomEvent<{
			targetId: string;
			postType: string;
			filters: Record<string, unknown>;
		}>;

		if (!customEvent.detail) {
			console.warn('[post-feed] Received voxel-search-submit with no detail');
			return;
		}

		const { targetId, postType, filters } = customEvent.detail;

		// Dispatch on window so React components can listen
		// Include targetId so components can filter by their blockId
		window.dispatchEvent(
			new CustomEvent('voxel-fse:filter-update', {
				detail: { targetId, postType, filters },
			})
		);
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		initBlocks();
		connectToSearchForm();
	});
} else {
	initBlocks();
	connectToSearchForm();
}

// Support Turbo/PJAX navigation
window.addEventListener('turbo:load', initBlocks);

// Support Voxel's markup update event
document.addEventListener('voxel:markup-update', initBlocks);

// Export for external use
(window as unknown as Record<string, unknown>).VoxelFSEPostFeed = {
	init: initBlocks,
};
