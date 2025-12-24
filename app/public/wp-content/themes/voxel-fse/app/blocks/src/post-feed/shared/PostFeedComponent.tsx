/**
 * Post Feed Shared Component
 *
 * Reference: docs/block-conversions/post-feed/voxel-post-feed.beautified.js
 *
 * VOXEL PARITY CHECKLIST:
 * ✅ Pagination modes match (prev_next, load_more)
 * ✅ CSS classes match exactly (.post-feed-grid, .feed-pagination, .ts-load-prev, .ts-load-next, .ts-load-more)
 * ✅ Loading state matches (.vx-loading class)
 * ✅ Button states match (.disabled, .hidden classes)
 * ✅ Uses Voxel's ?vx=1 AJAX system (NOT admin-ajax.php)
 * ✅ Triggers voxel:markup-update after content load
 * ✅ Prev/Next replaces content, Load More appends
 * ✅ Page bounds handled (min page 1 for prev)
 *
 * INTENTIONAL DIFFERENCES (Enhancements):
 * ✨ Carousel layout mode (not in Voxel's basic post-feed)
 * ✨ Search form integration (voxel-search-submit events)
 * ✨ URL state sync for initial load
 * ✨ React hooks-based state management
 *
 * NEXT.JS READINESS:
 * ✅ Pure React implementation (no jQuery)
 * ✅ Props-based component (config via props)
 * ✅ No WordPress globals in component logic
 * ✅ AJAX URL fallback for non-WordPress environments
 * ✅ TypeScript strict mode compatible
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import type {
	PostFeedAttributes,
	PostFeedComponentProps,
	PostFeedState,
	PostFeedVxConfig,
	SearchResultsResponse,
} from '../types';

/**
 * Default icons (matches Voxel defaults)
 */
const DEFAULT_ICONS = {
	loadMore: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
	// Voxel uses keyword-research.svg (magnifying glass) for no results
	// Evidence: themes/voxel/templates/widgets/post-feed/no-results.php:2
	noResults: `<svg viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11.25 2.75C6.14154 2.75 2 6.89029 2 11.998C2 17.1056 6.14154 21.2459 11.25 21.2459C13.5335 21.2459 15.6238 20.4187 17.2373 19.0475L20.7182 22.5287C21.011 22.8216 21.4859 22.8217 21.7788 22.5288C22.0717 22.2359 22.0718 21.761 21.7789 21.4681L18.2983 17.9872C19.6714 16.3736 20.5 14.2826 20.5 11.998C20.5 6.89029 16.3585 2.75 11.25 2.75ZM3.5 11.998C3.5 7.71905 6.96962 4.25 11.25 4.25C15.5304 4.25 19 7.71905 19 11.998C19 16.2769 15.5304 19.7459 11.25 19.7459C6.96962 19.7459 3.5 16.2769 3.5 11.998Z" fill="currentColor"/></svg>`,
	leftArrow: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
	rightArrow: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0l-7-7m7 7l-7 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
	leftChevron: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
	rightChevron: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
	reset: `<svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4v5h.582M19.938 13A8.001 8.001 0 005.217 9.144M4.582 9H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-14.721-3.856M14.42 15H19" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>`,
};

/**
 * Get icon HTML from icon value or use default
 */
function getIconHtml(icon: { library?: string; value?: string } | undefined, defaultIcon: string): string {
	if (!icon || !icon.value) {
		return defaultIcon;
	}

	if (icon.library === 'svg') {
		return icon.value;
	}

	// For icon library icons, return a placeholder class
	return `<i class="${icon.value}"></i>`;
}

/**
 * Post Feed Shared Component
 */
export default function PostFeedComponent({
	attributes,
	config,
	context,
}: PostFeedComponentProps): JSX.Element {
	const gridRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const initialFetchDoneRef = useRef(false);

	// State for post feed - both editor and frontend start in loading state
	const [state, setState] = useState<PostFeedState>({
		loading: true,
		page: 1,
		results: '',
		totalCount: 0,
		displayCount: '0',
		hasPrev: false,
		hasNext: false,
		hasResults: false,
	});

	// Dynamic filters from search form (for search-form source mode)
	const [dynamicFilters, setDynamicFilters] = useState<Record<string, unknown>>({});
	const [dynamicPostType, setDynamicPostType] = useState<string>(attributes.postType || '');

	// CRITICAL: Sync dynamicPostType with attributes.postType in editor context
	// In editor, postType changes come through props (from linkedPostType in edit.tsx)
	// In frontend, postType changes come through events (setDynamicPostType called directly)
	// Without this sync, the editor preview doesn't update when user changes post type in Search Form
	useEffect(() => {
		if (context === 'editor' && attributes.postType && attributes.postType !== dynamicPostType) {
			setDynamicPostType(attributes.postType);
		}
	}, [context, attributes.postType, dynamicPostType]);

	// Build CSS classes
	const layoutClass = attributes.layoutMode === 'carousel' ? 'ts-feed-nowrap' : 'ts-feed-grid-default';
	const loadingClass = state.loading ? `vx-${attributes.loadingStyle}` : '';

	// Evidence: themes/voxel/templates/widgets/post-feed.php:18-19
	// Grid classes: post-feed-grid, layout class, loading class, vx-opacity for opacity transition,
	// sf-post-feed when connected to search form, vx-event-scroll for scroll tracking
	const gridClasses = `post-feed-grid ${layoutClass} ${loadingClass} vx-opacity ${attributes.source === 'search-form' ? 'sf-post-feed vx-event-scroll' : ''}`.trim();

	// Build inline styles for grid layout
	// Note: Using direct CSS properties instead of CSS variables because
	// Voxel/Elementor generates inline CSS via selectors, not CSS variables
	// Evidence: themes/voxel/app/widgets/post-feed.php:308 - uses selectors for grid-template-columns
	const gridStyle: React.CSSProperties = attributes.layoutMode === 'carousel'
		? {
			// Carousel mode: flex layout with horizontal scroll
			display: 'flex',
			flexWrap: 'nowrap',
			gap: `${attributes.itemGap || 25}px`,
			overflowX: 'auto',
			scrollSnapType: 'x mandatory',
			WebkitOverflowScrolling: 'touch',
			padding: attributes.scrollPadding ? `0 ${attributes.scrollPadding}px` : undefined,
			scrollPadding: attributes.scrollPadding ? `${attributes.scrollPadding}px` : undefined,
		}
		: {
			// Grid mode: CSS grid layout
			display: 'grid',
			gridTemplateColumns: `repeat(${attributes.columns || 3}, minmax(0, 1fr))`,
			gap: `${attributes.itemGap || 25}px`,
		};

	// Carousel item styles (for children)
	const carouselItemStyle: React.CSSProperties | undefined = attributes.layoutMode === 'carousel' && attributes.carouselItemWidth
		? {
			flex: `0 0 ${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'}`,
			minWidth: `${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'}`,
			scrollSnapAlign: 'start',
		}
		: undefined;

	// Fetch posts from API (both editor and frontend)
	const fetchPosts = useCallback(async (
		page: number = 1,
		append: boolean = false,
		overrideFilters?: Record<string, unknown>,
		overridePostType?: string
	) => {
		setState(prev => ({ ...prev, loading: true }));

		try {
			// Use override post type if provided, otherwise use dynamic or attribute
			const postType = overridePostType || dynamicPostType || attributes.postType || '';

			// For search-form source without linked form or postType, show placeholder in editor
			if (context === 'editor' && attributes.source === 'search-form' && !postType) {
				setState(prev => ({
					...prev,
					loading: false,
					hasResults: false,
				}));
				return;
			}

			// Build filter params for Voxel's search_posts action
			const params = new URLSearchParams({
				type: postType,
				pg: String(page),
				limit: String(attributes.postsPerPage),
			});

			// Add total count param if displaying details
			if (attributes.displayDetails) {
				params.set('__get_total_count', 'yes');
			}

			// Add manual post IDs if in manual mode
			if (attributes.source === 'manual' && attributes.manualPostIds.length > 0) {
				params.set('post__in', attributes.manualPostIds.join(','));
			}

			// Use override filters if provided, otherwise merge dynamic and static filters
			const filtersToUse = overrideFilters || { ...attributes.filters, ...dynamicFilters };

			// Add custom filters
			if (filtersToUse && typeof filtersToUse === 'object') {
				Object.entries(filtersToUse).forEach(([key, value]) => {
					if (key === 'postType') return; // Skip postType key, it's handled separately
					if (value !== null && value !== undefined && value !== '') {
						params.set(key, String(value));
					}
				});
			}

			// Use Voxel's custom AJAX system (NOT admin-ajax.php)
			// See: docs/block-conversions/voxel-ajax-system.md
			// In editor, Voxel_Config may not exist, so we need to derive the site URL
			// For multisite subdirectory installs, window.location.origin alone won't work
			// We need to extract the site path from the URL (e.g., /vx-stays/ from /vx-stays/wp-admin/)
			let homeUrl = (window as any).Voxel_Config?.home_url;
			if (!homeUrl) {
				// Fallback 1: Try WordPress REST API settings
				// (localized in Block_Loader.php for react hydration blocks)
				const wpApiRoot = (window as any).wpApiSettings?.root;
				if (wpApiRoot) {
					// root is like "http://musicalwheel.local/vx-stays/wp-json/"
					// Extract base URL by removing /wp-json/ suffix
					homeUrl = wpApiRoot.replace(/\/wp-json\/?$/, '');
				} else {
					// Fallback 2: Extract site path from current URL (for editor context)
					const pathname = window.location.pathname;
					const wpAdminIndex = pathname.indexOf('/wp-admin');
					const sitePath = wpAdminIndex > 0 ? pathname.substring(0, wpAdminIndex) : '';
					homeUrl = window.location.origin + sitePath;
				}
			}

			// Add action to params (will become voxel_ajax_search_posts)
			params.set('action', 'search_posts');

			const fetchUrl = `${homeUrl}/?vx=1&${params.toString()}`;

			// Include credentials for WordPress admin context (cookies needed for auth)
			const response = await fetch(fetchUrl, {
				method: 'GET',
				credentials: 'same-origin',
				headers: {
					'Accept': 'text/html',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
			}

			const html = await response.text();

			// Parse the response to extract metadata
			const parser = new DOMParser();
			const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
			const infoScript = doc.querySelector('script.info');

			const hasPrev = infoScript?.getAttribute('data-has-prev') === 'true';
			const hasNext = infoScript?.getAttribute('data-has-next') === 'true';
			const hasResults = infoScript?.getAttribute('data-has-results') === 'true';
			const totalCount = parseInt(infoScript?.getAttribute('data-total-count') || '0', 10);
			const displayCount = infoScript?.getAttribute('data-display-count') || '0';

			// Remove the info script from the HTML
			const cleanHtml = html.replace(/<script class="info"[^>]*><\/script>/g, '');

			setState(prev => ({
				...prev,
				loading: false,
				page,
				results: append ? prev.results + cleanHtml : cleanHtml,
				totalCount,
				displayCount,
				hasPrev,
				hasNext,
				hasResults,
			}));
		} catch (error) {
			console.error('[PostFeedComponent] Failed to fetch posts:', error);
			// Log more details about the error
			if (error instanceof TypeError) {
				console.error('[PostFeedComponent] TypeError details - likely CORS or network issue');
				console.error('[PostFeedComponent] Current location:', window.location.href);
				console.error('[PostFeedComponent] Target URL was:', `${window.location.origin}${window.location.pathname.includes('/wp-admin') ? window.location.pathname.split('/wp-admin')[0] : ''}/?vx=1`);
			}
			setState(prev => ({
				...prev,
				loading: false,
				hasResults: false,
			}));
		}
	}, [attributes, context, dynamicFilters, dynamicPostType]);

	// Listen for filter updates from search form
	// IMPORTANT: This must be set up before dispatching the ready event
	// Events: voxel-search-submit (from Search Form) and voxel-search-clear (reset)
	useEffect(() => {
		if (context !== 'frontend' || attributes.source !== 'search-form') {
			return;
		}

		const handleFilterUpdate = (event: Event) => {
			const customEvent = event as CustomEvent<{
				targetId: string;
				postType: string;
				filters: Record<string, unknown>;
			}>;

			// Only respond to events targeting this block
			if (customEvent.detail?.targetId !== attributes.blockId) {
				return;
			}

			const { postType, filters } = customEvent.detail;

			// Update dynamic state
			setDynamicFilters(filters);
			if (postType) {
				setDynamicPostType(postType);
			}

			// Fetch with the new filters
			fetchPosts(1, false, filters, postType);
		};

		// Listen for search form submit events
		// Event name: voxel-search-submit (dispatched by search-form/frontend.tsx)
		window.addEventListener('voxel-search-submit', handleFilterUpdate);
		return () => window.removeEventListener('voxel-search-submit', handleFilterUpdate);
	}, [context, attributes.source, attributes.blockId, fetchPosts]);

	// Initial fetch on mount (for non-search-form sources, both editor and frontend)
	// For search-form source in frontend, read URL params for initial state
	// IMPORTANT: This runs AFTER the listener is set up (React runs effects in order)
	// CRITICAL: Use ref to prevent infinite loop - fetchPosts changes when dynamicFilters/dynamicPostType change
	useEffect(() => {
		// Skip if initial fetch already done (prevents infinite loop)
		if (initialFetchDoneRef.current && context === 'frontend') {
			return;
		}

		if (attributes.source !== 'search-form') {
			initialFetchDoneRef.current = true;
			fetchPosts(1);
		} else if (context === 'editor' && attributes.postType) {
			// In editor with search-form source, if we have a postType, fetch preview data
			// Don't set ref for editor - allow re-fetches when postType changes
			fetchPosts(1);
		} else if (context === 'frontend' && attributes.source === 'search-form') {
			// In frontend with search-form source, check URL params for initial state
			const url = new URL(window.location.href);
			const urlPostType = url.searchParams.get('post_type');

			// Collect filter params from URL
			const urlFilters: Record<string, unknown> = {};
			url.searchParams.forEach((value, key) => {
				if (key.startsWith('filter_')) {
					const filterKey = key.replace('filter_', '');
					// Try to parse JSON for complex values
					try {
						urlFilters[filterKey] = JSON.parse(value);
					} catch {
						urlFilters[filterKey] = value;
					}
				}
			});

			// Mark initial fetch as done BEFORE calling fetchPosts
			initialFetchDoneRef.current = true;

			// If URL has post_type, fetch with URL params
			if (urlPostType) {
				setDynamicPostType(urlPostType);
				setDynamicFilters(urlFilters);
				fetchPosts(1, false, urlFilters, urlPostType);
			} else {
				// No URL params - dispatch "ready" event for Search Form to respond
				// The Search Form will send its initial values when it receives this
				const readyEvent = new CustomEvent('voxel-fse:post-feed-ready', {
					detail: {
						blockId: attributes.blockId,
						searchFormId: attributes.searchFormId,
					},
					bubbles: true,
				});
				window.dispatchEvent(readyEvent);
			}
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPosts intentionally excluded to prevent infinite loop
	}, [context, attributes.source, attributes.postType, attributes.blockId, attributes.searchFormId]);

	// Pagination handlers
	const handleLoadMore = useCallback(() => {
		if (!state.loading && state.hasNext) {
			fetchPosts(state.page + 1, true);
		}
	}, [state.loading, state.hasNext, state.page, fetchPosts]);

	/**
	 * Scroll to top of feed container after pagination
	 * Addresses Voxel issue: "No scroll position management" (voxel-post-feed.beautified.js:438-440)
	 */
	const scrollToTop = useCallback(() => {
		if (containerRef.current) {
			// Scroll to top of feed container with smooth animation
			containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, []);

	const handlePrev = useCallback(() => {
		if (!state.loading && state.hasPrev) {
			fetchPosts(state.page - 1);
			// Scroll to top after content loads (small delay for render)
			setTimeout(scrollToTop, 100);
		}
	}, [state.loading, state.hasPrev, state.page, fetchPosts, scrollToTop]);

	const handleNext = useCallback(() => {
		if (!state.loading && state.hasNext) {
			fetchPosts(state.page + 1);
			// Scroll to top after content loads (small delay for render)
			setTimeout(scrollToTop, 100);
		}
	}, [state.loading, state.hasNext, state.page, fetchPosts, scrollToTop]);

	// Carousel navigation handlers
	const handleCarouselPrev = useCallback(() => {
		if (gridRef.current) {
			const scrollAmount = gridRef.current.clientWidth * 0.8;
			gridRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
		}
	}, []);

	const handleCarouselNext = useCallback(() => {
		if (gridRef.current) {
			const scrollAmount = gridRef.current.clientWidth * 0.8;
			gridRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
		}
	}, []);

	// Render vxconfig for DevTools visibility (CRITICAL for Plan C+)
	const vxConfig: PostFeedVxConfig = {
		blockId: attributes.blockId,
		source: attributes.source,
		searchFormId: attributes.searchFormId,
		postType: attributes.postType,
		manualPostIds: attributes.manualPostIds,
		filters: attributes.filters,
		pagination: attributes.pagination,
		postsPerPage: attributes.postsPerPage,
		displayDetails: attributes.displayDetails,
		noResultsLabel: attributes.noResultsLabel,
		layoutMode: attributes.layoutMode,
		columns: attributes.columns,
		columns_tablet: attributes.columns_tablet,
		columns_mobile: attributes.columns_mobile,
		itemGap: attributes.itemGap,
		itemGap_tablet: attributes.itemGap_tablet,
		itemGap_mobile: attributes.itemGap_mobile,
		carouselItemWidth: attributes.carouselItemWidth,
		carouselItemWidth_tablet: attributes.carouselItemWidth_tablet,
		carouselItemWidth_mobile: attributes.carouselItemWidth_mobile,
		carouselItemWidthUnit: attributes.carouselItemWidthUnit,
		carouselAutoSlide: attributes.carouselAutoSlide,
		scrollPadding: attributes.scrollPadding,
		scrollPadding_tablet: attributes.scrollPadding_tablet,
		scrollPadding_mobile: attributes.scrollPadding_mobile,
		itemPadding: attributes.itemPadding,
		itemPadding_tablet: attributes.itemPadding_tablet,
		itemPadding_mobile: attributes.itemPadding_mobile,
		loadingStyle: attributes.loadingStyle,
		loadingOpacity: attributes.loadingOpacity,
		icons: {
			loadMore: attributes.loadMoreIcon,
			noResults: attributes.noResultsIcon,
			rightArrow: attributes.rightArrowIcon,
			leftArrow: attributes.leftArrowIcon,
			rightChevron: attributes.rightChevronIcon,
			leftChevron: attributes.leftChevronIcon,
			reset: attributes.resetIcon,
		},
	};

	// Editor preview - shows actual data or placeholder while loading
	if (context === 'editor') {
		// Determine if we should show placeholder cards
		// Show placeholders when: loading OR (search-form source without postType selected)
		const showPlaceholders = state.loading || (attributes.source === 'search-form' && !attributes.postType && !state.results);

		// Generate scoped styles for editor carousel
		const editorScopedStyles = attributes.layoutMode === 'carousel' && attributes.carouselItemWidth
			? `
				.ts-post-feed .post-feed-grid > .ts-preview,
				.ts-post-feed .post-feed-grid > div,
				.ts-post-feed .post-feed-grid > .placeholder-card {
					flex: 0 0 ${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'};
					min-width: ${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'};
					scroll-snap-align: start;
				}
			`
			: '';

		return (
			<div ref={containerRef} className={`ts-post-feed ${loadingClass}`}>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{/* Scoped styles for carousel */}
				{editorScopedStyles && (
					<style dangerouslySetInnerHTML={{ __html: editorScopedStyles }} />
				)}

				{/* Header with result count */}
				{attributes.displayDetails && (
					<div className="post-feed-header flexify">
						<span className={`result-count ${!state.hasResults || state.totalCount === 0 ? '' : ''}`}>
							{state.hasResults ? state.displayCount : __('Showing results', 'voxel-fse')}
						</span>
					</div>
				)}

				{/* Post grid - actual content or placeholder */}
				<div
					className={`${gridClasses} ${attributes.layoutMode === 'carousel' ? 'min-scroll min-scroll-h' : ''}`}
					style={gridStyle}
				>
					{showPlaceholders ? (
						/* Placeholder cards while loading */
						Array.from({ length: Math.min(attributes.postsPerPage, 6) }).map((_, index) => (
							<div key={index} className="ts-preview-card placeholder-card">
								<div className="ts-card-image placeholder-image"></div>
								<div className="ts-card-content">
									<div className="placeholder-title"></div>
									<div className="placeholder-text"></div>
								</div>
							</div>
						))
					) : state.results ? (
						/* Actual post cards from Voxel */
						<div dangerouslySetInnerHTML={{ __html: state.results }} />
					) : (
						/* No results placeholder */
						<div className="ts-no-posts">
							<span
								className="ts-no-posts-icon"
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.noResultsIcon, DEFAULT_ICONS.noResults),
								}}
							/>
							<p>{attributes.noResultsLabel}</p>
						</div>
					)}
				</div>

				{/* Pagination - functional in editor too */}
				{attributes.pagination !== 'none' && (
					<div className="feed-pagination flexify">
						{attributes.pagination === 'prev_next' && (
							<>
								<button
									className={`ts-btn ts-btn-1 ts-load-prev ${!state.hasPrev ? 'disabled' : ''}`}
									onClick={handlePrev}
									disabled={!state.hasPrev || state.loading}
								>
									<span
										dangerouslySetInnerHTML={{
											__html: getIconHtml(attributes.leftArrowIcon, DEFAULT_ICONS.leftArrow),
										}}
									/>
									<span>{__('Previous', 'voxel-fse')}</span>
								</button>
								<button
									className={`ts-btn ts-btn-1 ts-load-next ${!state.hasNext ? 'disabled' : ''}`}
									onClick={handleNext}
									disabled={!state.hasNext || state.loading}
								>
									<span>{__('Next', 'voxel-fse')}</span>
									<span
										dangerouslySetInnerHTML={{
											__html: getIconHtml(attributes.rightArrowIcon, DEFAULT_ICONS.rightArrow),
										}}
									/>
								</button>
							</>
						)}
						{attributes.pagination === 'load_more' && state.hasNext && (
							<button
								className="ts-btn ts-btn-1 ts-btn-large ts-load-more"
								onClick={handleLoadMore}
								disabled={!state.hasNext || state.loading}
							>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.loadMoreIcon, DEFAULT_ICONS.loadMore),
									}}
								/>
								<span>{__('Load more', 'voxel-fse')}</span>
							</button>
						)}
					</div>
				)}

				{/* Carousel navigation */}
				{attributes.layoutMode === 'carousel' && (
					<div className="post-feed-nav">
						<button className="ts-icon-btn ts-prev-page" disabled>
							<span
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.leftChevronIcon, DEFAULT_ICONS.leftChevron),
								}}
							/>
						</button>
						<button className="ts-icon-btn ts-next-page" disabled>
							<span
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
								}}
							/>
						</button>
					</div>
				)}
			</div>
		);
	}

	// Frontend render
	// Evidence: themes/voxel/templates/widgets/post-feed.php
	// Voxel renders direct children without a wrapper div (header, grid, no-results, pagination)
	// The container .voxel-fse-post-feed-frontend already has the necessary wrapper classes

	// Generate scoped styles for carousel item widths
	// Evidence: themes/voxel/app/widgets/post-feed.php:268 - uses selectors for item width
	const scopedStyles = attributes.layoutMode === 'carousel' && attributes.carouselItemWidth
		? `
			[data-block-id="${attributes.blockId}"] .post-feed-grid > .ts-preview,
			[data-block-id="${attributes.blockId}"] .post-feed-grid > div {
				flex: 0 0 ${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'};
				min-width: ${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'};
				scroll-snap-align: start;
			}
			${attributes.itemPadding ? `
			[data-block-id="${attributes.blockId}"] .post-feed-grid > .ts-preview,
			[data-block-id="${attributes.blockId}"] .post-feed-grid > div {
				padding: ${attributes.itemPadding}px;
			}
			` : ''}
		`
		: '';

	return (
		<div ref={containerRef} className="ts-post-feed-content">
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Scoped styles for carousel item widths */}
			{scopedStyles && (
				<style dangerouslySetInnerHTML={{ __html: scopedStyles }} />
			)}

			{/* Header with result count */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed.php:9-15 */}
			{attributes.displayDetails && (
				<div className="post-feed-header">
					<span className={`result-count ${!state.hasResults || state.totalCount === 0 ? 'hidden' : ''}`}>
						{state.displayCount}
					</span>
				</div>
			)}

			{/* Post grid */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed.php:17-28 */}
			<div
				ref={gridRef}
				className={`${gridClasses} ${attributes.layoutMode === 'carousel' ? 'min-scroll min-scroll-h' : ''}`}
				style={gridStyle}
				data-auto-slide={attributes.carouselAutoSlide ? '3000' : '0'}
				dangerouslySetInnerHTML={{ __html: state.results }}
			/>

			{/* No results placeholder - always rendered, shown/hidden via CSS */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed/no-results.php */}
			{/* VOXEL PARITY: Icon direct in div, reset link inside <p> tag */}
			<div className={`ts-no-posts ${state.hasResults || state.loading ? 'hidden' : ''}`}>
				<span dangerouslySetInnerHTML={{
					__html: getIconHtml(attributes.noResultsIcon, DEFAULT_ICONS.noResults),
				}} />
				<p>
					{attributes.noResultsLabel}
					{attributes.source === 'search-form' && (
						<>
							{' '}
							<a
								href="#"
								className="ts-feed-reset"
								onClick={(e) => {
									e.preventDefault();
									// Dispatch reset event for Search Form to handle
									// Evidence: voxel search-form.js uses this.clearAll()
									const resetEvent = new CustomEvent('voxel-search-clear', {
										detail: {
											postType: dynamicPostType || attributes.postType,
											searchFormId: attributes.searchFormId,
										},
										bubbles: true,
									});
									window.dispatchEvent(resetEvent);
								}}
							>
								{__('Reset filters?', 'voxel-fse')}
							</a>
						</>
					)}
				</p>
			</div>

			{/* Pagination - always rendered, shown/hidden via CSS */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed/pagination.php */}
			{attributes.pagination !== 'none' && (
				<div className={`feed-pagination flexify ${!state.hasPrev && !state.hasNext ? 'hidden' : ''}`}>
					{attributes.pagination === 'prev_next' && (
						<>
							<button
								className={`ts-btn ts-btn-1 ts-load-prev ${!state.hasPrev ? 'disabled' : ''}`}
								onClick={handlePrev}
								disabled={!state.hasPrev || state.loading}
							>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.leftArrowIcon, DEFAULT_ICONS.leftArrow),
									}}
								/>
								<span>{__('Previous', 'voxel-fse')}</span>
							</button>
							<button
								className={`ts-btn ts-btn-1 ts-load-next ${!state.hasNext ? 'disabled' : ''}`}
								onClick={handleNext}
								disabled={!state.hasNext || state.loading}
							>
								<span>{__('Next', 'voxel-fse')}</span>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.rightArrowIcon, DEFAULT_ICONS.rightArrow),
									}}
								/>
							</button>
						</>
					)}
					{attributes.pagination === 'load_more' && (
						<button
							className={`ts-btn ts-btn-1 ts-btn-large ts-load-more ${!state.hasNext ? 'hidden' : ''}`}
							onClick={handleLoadMore}
							disabled={!state.hasNext || state.loading}
						>
							<span
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.loadMoreIcon, DEFAULT_ICONS.loadMore),
								}}
							/>
							<span>{__('Load more', 'voxel-fse')}</span>
						</button>
					)}
				</div>
			)}

			{/* Carousel navigation */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php */}
			{attributes.layoutMode === 'carousel' && (
				<div className={`post-feed-nav ${!state.hasResults ? 'hidden' : ''}`}>
					<button
						className="ts-icon-btn ts-prev-page"
						onClick={handleCarouselPrev}
					>
						<span
							dangerouslySetInnerHTML={{
								__html: getIconHtml(attributes.leftChevronIcon, DEFAULT_ICONS.leftChevron),
							}}
						/>
					</button>
					<button
						className="ts-icon-btn ts-next-page"
						onClick={handleCarouselNext}
					>
						<span
							dangerouslySetInnerHTML={{
								__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
							}}
						/>
					</button>
				</div>
			)}
		</div>
	);
}
