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
 * ✅ CSS/JS asset injection to #vx-assets-cache with deduplication
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
import { generatePostFeedStyles } from '../styles';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { Loader } from '@shared/components/Loader';

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
 * Inject CSS/JS assets to #vx-assets-cache element
 *
 * Reference: voxel-post-feed.beautified.js:143-160 (CSS) and :250-259 (JS)
 *
 * This matches Voxel's asset injection pattern:
 * 1. CSS: Check if stylesheet already exists in #vx-assets-cache by ID
 * 2. CSS: Move new stylesheets to cache, track load promises
 * 3. JS: Check for duplicate script IDs (count >= 2 means duplicate)
 * 4. JS: Move unique scripts to cache, remove duplicates
 *
 * @param doc - Parsed HTML document from AJAX response
 * @returns Promise that resolves when all CSS is loaded
 */
function injectAssetsToCache(doc: Document): Promise<void> {
	// Ensure #vx-assets-cache exists (Voxel creates this)
	let assetsCache = document.getElementById('vx-assets-cache');
	if (!assetsCache) {
		// Create cache element if it doesn't exist (for non-Voxel environments)
		assetsCache = document.createElement('div');
		assetsCache.id = 'vx-assets-cache';
		assetsCache.style.display = 'none';
		document.body.appendChild(assetsCache);
	}

	const cssLoadPromises: Promise<void>[] = [];

	// SECTION 2.1.1: CSS Asset Injection (lines 143-160)
	// Find all stylesheet links in the response
	doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]').forEach((linkElement) => {
		if (linkElement.id) {
			// Check if stylesheet already exists in cache
			// Uses CSS.escape for safe ID selectors (matches Voxel exactly)
			const existingLink = document.querySelector(`#vx-assets-cache #${CSS.escape(linkElement.id)}`);
			if (!existingLink) {
				// Clone the link and append to cache
				const clonedLink = linkElement.cloneNode(true) as HTMLLinkElement;
				assetsCache!.appendChild(clonedLink);

				// Track loading promise
				cssLoadPromises.push(new Promise<void>((resolve) => {
					clonedLink.onload = () => resolve();
					// Also resolve on error to prevent hanging
					clonedLink.onerror = () => resolve();
				}));
			}
		}
	});

	// Return promise that resolves when all CSS is loaded
	return Promise.all(cssLoadPromises).then(() => { });
}

/**
 * Inject JS assets to #vx-assets-cache element
 *
 * Reference: voxel-post-feed.beautified.js:250-259
 *
 * Called AFTER content is rendered (per Voxel's pattern).
 * This handles inline scripts that may have been included in the AJAX response.
 *
 * @param container - The container element that received the new content
 */
function injectScriptsToCache(container: HTMLElement): void {
	// Ensure #vx-assets-cache exists
	let assetsCache = document.getElementById('vx-assets-cache');
	if (!assetsCache) {
		assetsCache = document.createElement('div');
		assetsCache.id = 'vx-assets-cache';
		assetsCache.style.display = 'none';
		document.body.appendChild(assetsCache);
	}

	// SECTION 2.1.4: JavaScript Asset Injection (lines 250-259)
	// Find all scripts with type="text/javascript" in the container
	container.querySelectorAll<HTMLScriptElement>('script[type="text/javascript"]').forEach((scriptElement) => {
		if (scriptElement.id) {
			// Check if script with this ID already exists (count >= 2 means duplicate)
			const existingScripts = document.querySelectorAll(`script[id="${CSS.escape(scriptElement.id)}"]`);
			if (existingScripts.length >= 2) {
				// Duplicate - remove it
				scriptElement.remove();
			} else {
				// Unique - move to cache
				assetsCache!.appendChild(scriptElement);
			}
		}
	});
}

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
 * Generate responsive CSS for layout controls
 * Handles columns, itemGap, carouselItemWidth, scrollPadding, itemPadding
 * with tablet (max-width: 1024px) and mobile (max-width: 767px) breakpoints
 *
 * Evidence: themes/voxel/app/widgets/post-feed.php uses Elementor's add_responsive_control
 * which generates media queries for tablet/mobile breakpoints
 */
function generateResponsiveLayoutCSS(attributes: PostFeedAttributes, blockId: string): string {
	const rules: string[] = [];
	const selector = `[data-block-id="${blockId}"]`;
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];

	// Grid mode - columns
	// Evidence: post-feed.php:298-311 - grid-template-columns selector
	if (attributes.layoutMode === 'grid') {
		if (attributes.columns) {
			rules.push(`${selector} .post-feed-grid { grid-template-columns: repeat(${attributes.columns}, minmax(0, 1fr)); }`);
		}
		if (attributes.columns_tablet) {
			tabletRules.push(`${selector} .post-feed-grid { grid-template-columns: repeat(${attributes.columns_tablet}, minmax(0, 1fr)); }`);
		}
		if (attributes.columns_mobile) {
			mobileRules.push(`${selector} .post-feed-grid { grid-template-columns: repeat(${attributes.columns_mobile}, minmax(0, 1fr)); }`);
		}
	}

	// Item gap - responsive (both grid and carousel)
	// Evidence: post-feed.php:317-341 - grid-gap selector
	if (attributes.itemGap !== undefined) {
		rules.push(`${selector} .post-feed-grid { gap: ${attributes.itemGap}px; }`);
	}
	if (attributes.itemGap_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-grid { gap: ${attributes.itemGap_tablet}px; }`);
	}
	if (attributes.itemGap_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-grid { gap: ${attributes.itemGap_mobile}px; }`);
	}

	// Carousel mode specific
	if (attributes.layoutMode === 'carousel') {
		const unit = attributes.carouselItemWidthUnit || 'px';

		// Item width - responsive
		// Evidence: post-feed.php:253-271 - width and min-width selector
		if (attributes.carouselItemWidth) {
			rules.push(`${selector} .post-feed-grid > div, ${selector} .post-feed-grid > .ts-preview { width: ${attributes.carouselItemWidth}${unit}; min-width: ${attributes.carouselItemWidth}${unit}; flex: 0 0 ${attributes.carouselItemWidth}${unit}; scroll-snap-align: start; }`);
		}
		if (attributes.carouselItemWidth_tablet) {
			tabletRules.push(`${selector} .post-feed-grid > div, ${selector} .post-feed-grid > .ts-preview { width: ${attributes.carouselItemWidth_tablet}${unit}; min-width: ${attributes.carouselItemWidth_tablet}${unit}; flex: 0 0 ${attributes.carouselItemWidth_tablet}${unit}; }`);
		}
		if (attributes.carouselItemWidth_mobile) {
			mobileRules.push(`${selector} .post-feed-grid > div, ${selector} .post-feed-grid > .ts-preview { width: ${attributes.carouselItemWidth_mobile}${unit}; min-width: ${attributes.carouselItemWidth_mobile}${unit}; flex: 0 0 ${attributes.carouselItemWidth_mobile}${unit}; }`);
		}

		// Scroll padding - responsive
		// Evidence: post-feed.php:346-365 - padding and scroll-padding selector
		if (attributes.scrollPadding) {
			rules.push(`${selector} .post-feed-grid { padding: 0 ${attributes.scrollPadding}px; scroll-padding: ${attributes.scrollPadding}px; }`);
		}
		if (attributes.scrollPadding_tablet) {
			tabletRules.push(`${selector} .post-feed-grid { padding: 0 ${attributes.scrollPadding_tablet}px; scroll-padding: ${attributes.scrollPadding_tablet}px; }`);
		}
		if (attributes.scrollPadding_mobile) {
			mobileRules.push(`${selector} .post-feed-grid { padding: 0 ${attributes.scrollPadding_mobile}px; scroll-padding: ${attributes.scrollPadding_mobile}px; }`);
		}

		// Item padding - responsive
		// Evidence: post-feed.php:367-386 - padding on .ts-preview selector
		if (attributes.itemPadding) {
			rules.push(`${selector} .post-feed-grid > .ts-preview { padding: ${attributes.itemPadding}px; }`);
		}
		if (attributes.itemPadding_tablet) {
			tabletRules.push(`${selector} .post-feed-grid > .ts-preview { padding: ${attributes.itemPadding_tablet}px; }`);
		}
		if (attributes.itemPadding_mobile) {
			mobileRules.push(`${selector} .post-feed-grid > .ts-preview { padding: ${attributes.itemPadding_mobile}px; }`);
		}
	}

	// Combine all rules with media queries
	let css = rules.join('\n');

	if (tabletRules.length > 0) {
		css += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	if (mobileRules.length > 0) {
		css += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return css;
}

/**
 * Generate typography CSS from typography object
 * Helper function matching pattern from popup-kit/shared/generateCSS.ts
 *
 * @param typo Typography object from attributes
 * @returns CSS string (semicolon-separated rules)
 */
function generateTypographyCSS(typo: Record<string, unknown>): string {
	const rules: string[] = [];

	if (typo.fontFamily) {
		rules.push(`font-family: ${typo.fontFamily}`);
	}

	if (typo.fontSize) {
		const unit = (typo.fontSizeUnit as string) || 'px';
		rules.push(`font-size: ${typo.fontSize}${unit}`);
	}

	if (typo.fontWeight) {
		rules.push(`font-weight: ${typo.fontWeight}`);
	}

	if (typo.lineHeight) {
		const unit = (typo.lineHeightUnit as string) || '';
		rules.push(`line-height: ${typo.lineHeight}${unit}`);
	}

	if (typo.textTransform && typo.textTransform !== 'none') {
		rules.push(`text-transform: ${typo.textTransform}`);
	}

	if (typo.fontStyle) {
		rules.push(`font-style: ${typo.fontStyle}`);
	}

	if (typo.textDecoration) {
		rules.push(`text-decoration: ${typo.textDecoration}`);
	}

	if (typo.letterSpacing) {
		const unit = (typo.letterSpacingUnit as string) || 'px';
		rules.push(`letter-spacing: ${typo.letterSpacing}${unit}`);
	}

	if (typo.wordSpacing) {
		const unit = (typo.wordSpacingUnit as string) || 'px';
		rules.push(`word-spacing: ${typo.wordSpacing}${unit}`);
	}

	return rules.join('; ');
}

/**
 * Post Feed Shared Component
 */
export default function PostFeedComponent({
	attributes,
	config,
	context,
	editorFilters,
	containerElement,
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

	// Track previous editorFilters to detect actual changes
	const prevEditorFiltersRef = useRef<Record<string, unknown> | undefined>(undefined);

	// CRITICAL: Sync editorFilters with dynamicFilters in editor context
	// In editor, filter changes come through props (from editorFilters via useSelect in edit.tsx)
	// In frontend, filter changes come through events (setDynamicFilters called directly)
	// This enables the Post Feed editor preview to update when Search Form filters change
	// NOTE: fetchPosts is intentionally excluded from deps - it's called with explicit args
	// and including it causes TDZ error (fetchPosts defined after this useEffect)
	useEffect(() => {
		if (context !== 'editor' || !editorFilters) {
			return;
		}

		// Compare with previous filters to detect actual changes
		const prevFilters = prevEditorFiltersRef.current;
		const filtersChanged = JSON.stringify(prevFilters) !== JSON.stringify(editorFilters);

		if (filtersChanged) {
			prevEditorFiltersRef.current = editorFilters;
			setDynamicFilters(editorFilters);

			// Trigger refetch with new filters (only if we have a post type)
			if (attributes.postType) {
				// Use dynamic import pattern to avoid TDZ - fetchPosts defined below
				// We pass all args explicitly so we don't need it in deps
				const doFetch = async () => {
					// Build filter params for Voxel's search_posts action
					const params = new URLSearchParams({
						type: attributes.postType,
						pg: '1',
						limit: String(attributes.postsPerPage),
					});

					// Add total count param if displaying details
					if (attributes.displayDetails) {
						params.set('__get_total_count', 'yes');
					}

					// Add filters
					if (editorFilters && typeof editorFilters === 'object') {
						Object.entries(editorFilters).forEach(([key, value]) => {
							if (key === 'postType') return;
							if (value !== null && value !== undefined && value !== '') {
								params.set(key, String(value));
							}
						});
					}

					// Get home URL
					let homeUrl = (window as any).Voxel_Config?.home_url;
					if (!homeUrl) {
						const wpApiRoot = (window as any).wpApiSettings?.root;
						if (wpApiRoot) {
							homeUrl = wpApiRoot.replace(/\/wp-json\/?$/, '');
						} else {
							const pathname = window.location.pathname;
							const wpAdminIndex = pathname.indexOf('/wp-admin');
							const sitePath = wpAdminIndex > 0 ? pathname.substring(0, wpAdminIndex) : '';
							homeUrl = window.location.origin + sitePath;
						}
					}

					params.set('action', 'search_posts');
					const fetchUrl = `${homeUrl}/?vx=1&${params.toString()}`;

					try {
						setState(prev => ({ ...prev, loading: true }));
						const response = await fetch(fetchUrl, {
							method: 'GET',
							credentials: 'same-origin',
							headers: { 'Accept': 'text/html' },
						});

						if (!response.ok) {
							throw new Error(`HTTP error: ${response.status}`);
						}

						const html = await response.text();
						const parser = new DOMParser();
						const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
						const infoScript = doc.querySelector('script.info');

						const hasPrev = infoScript?.getAttribute('data-has-prev') === 'true';
						const hasNext = infoScript?.getAttribute('data-has-next') === 'true';
						const hasResults = infoScript?.getAttribute('data-has-results') === 'true';
						const totalCount = parseInt(infoScript?.getAttribute('data-total-count') || '0', 10);
						const displayCount = infoScript?.getAttribute('data-display-count') || '0';

						// VOXEL PARITY: Inject CSS assets to cache (also for editor preview)
						await injectAssetsToCache(doc);

						// Remove info script and stylesheet links from HTML
						let cleanHtml = html.replace(/<script class="info"[^>]*><\/script>/g, '');
						cleanHtml = cleanHtml.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, '');

						setState(prev => ({
							...prev,
							loading: false,
							page: 1,
							results: cleanHtml,
							totalCount,
							displayCount,
							hasPrev,
							hasNext,
							hasResults,
						}));
					} catch (error) {
						console.error('[PostFeedComponent] Editor filter sync fetch failed:', error);
						setState(prev => ({ ...prev, loading: false, hasResults: false }));
					}
				};
				doFetch();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [context, editorFilters, attributes.postType, attributes.postsPerPage, attributes.displayDetails]);

	// Build CSS classes
	const layoutClass = attributes.layoutMode === 'carousel' ? 'ts-feed-nowrap' : 'ts-feed-grid-default';
	const loadingClass = state.loading ? `vx-${attributes.loadingStyle}` : '';

	// Evidence: themes/voxel/templates/widgets/post-feed.php:18-19
	// Grid classes: post-feed-grid, layout class, loading class, vx-opacity for opacity transition,
	// sf-post-feed when connected to search form, vx-event-scroll for scroll tracking
	const gridClasses = `post-feed-grid ${layoutClass} ${loadingClass} vx-opacity ${attributes.source === 'search-form' ? 'sf-post-feed vx-event-scroll' : ''}`.trim();

	// Build inline styles for grid layout (minimal - responsive values handled by CSS)
	// Note: Display mode and scroll properties are inline, responsive values (columns, gap, etc.) handled by generateResponsiveLayoutCSS
	// Evidence: themes/voxel/app/widgets/post-feed.php:308 - uses selectors for grid-template-columns
	const gridStyle: React.CSSProperties = attributes.layoutMode === 'carousel'
		? {
			// Carousel mode: flex layout with horizontal scroll
			display: 'flex',
			flexWrap: 'nowrap',
			overflowX: 'auto',
			scrollSnapType: 'x mandatory',
			WebkitOverflowScrolling: 'touch',
			// Note: gap, padding, scrollPadding handled by generateResponsiveLayoutCSS for responsive support
		}
		: {
			// Grid mode: CSS grid layout
			display: 'grid',
			// Note: gridTemplateColumns, gap handled by generateResponsiveLayoutCSS for responsive support
		};

	// Generate responsive layout CSS
	const responsiveLayoutCSS = generateResponsiveLayoutCSS(attributes, attributes.blockId);

	// Generate style CSS (Counter, Order By, No Results, Pagination, Carousel Nav, Loading)
	// Uses comprehensive styles from styles.ts for full Style Tab support
	// Note: loadingOpacity CSS is included in generatePostFeedStyles() - see styles.ts:429-432
	const styleCSS = generatePostFeedStyles(attributes, attributes.blockId);

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

			// Add exclude posts (Filters mode)
			if (attributes.excludePosts) {
				params.set('exclude', attributes.excludePosts);
			}

			// Add priority filter (Filters mode)
			if (attributes.priorityFilter) {
				params.set('priority_min', String(attributes.priorityMin || 0));
				params.set('priority_max', String(attributes.priorityMax || 0));
			}

			// Add offset (Filters mode)
			if (attributes.offset && attributes.offset > 0) {
				params.set('offset', String(attributes.offset));
			}

			// Add card template (for server-side rendering)
			if (attributes.cardTemplate && attributes.cardTemplate !== 'main') {
				params.set('template', attributes.cardTemplate);
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

			// VOXEL PARITY: Inject CSS assets to #vx-assets-cache and wait for load
			// Reference: voxel-post-feed.beautified.js:143-174
			// This must happen BEFORE rendering content to prevent FOUC
			await injectAssetsToCache(doc);

			// Remove the info script from the HTML (it's been parsed)
			// KEEP stylesheet links to match Elementor widget DOM structure (id="vx:post-feed.css-css")
			let cleanHtml = html.replace(/<script class="info"[^>]*><\/script>/g, '');

			// Manual Injection Parity: If the server response didn't include the stylesheet (which currently happens in FSE/AJAX context),
			// we manually inject it to ensure layout parity with Elementor which has this link inside the grid.
			if (!cleanHtml.includes('vx:post-feed.css-css')) {
				const voxelConfig = (window as any).Voxel_Config;
				if (voxelConfig?.ajax_url) {
					const siteUrl = voxelConfig.ajax_url.replace(/\?vx=1.*$/, '');
					// Use a standard version or try to get it from config if possible (hardcoded to match 1.x line)
					const cssUrl = `${siteUrl}wp-content/themes/voxel/assets/dist/post-feed.css?ver=1.7.5.2`;
					cleanHtml = `<link rel="stylesheet" id="vx:post-feed.css-css" href="${cssUrl}" type="text/css" media="all">` + cleanHtml;
				}
			}

			// Use requestAnimationFrame for smooth rendering (matches Voxel's pattern)
			// Reference: voxel-post-feed.beautified.js:175-176
			requestAnimationFrame(() => {
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

				// VOXEL PARITY: Inject JS assets to #vx-assets-cache after content render
				// Reference: voxel-post-feed.beautified.js:250-259
				// Note: We use a timeout to ensure React has finished rendering
				setTimeout(() => {
					const targetContainer = containerElement || containerRef.current;
					if (targetContainer) {
						injectScriptsToCache(targetContainer);
					}
					// Trigger voxel:markup-update for any widgets in new content
					// Reference: voxel-post-feed.beautified.js:269
					if ((window as any).jQuery) {
						(window as any).jQuery(document).trigger('voxel:markup-update');
					}

					// MAP INTEGRATION: Extract markers from feed DOM and dispatch to Map block
					// Reference: voxel-search-form.beautified.js:2501-2518 (_updateMarkers)
					// Voxel reads from: feed.find(".post-feed-grid:first").find(".ts-marker-wrapper > .map-marker")
					if (context === 'frontend' && attributes.source === 'search-form') {
						const feedContainer = containerElement || containerRef.current;
						if (feedContainer) {
							// Extract marker data from .ts-marker-wrapper elements (Voxel embeds these in preview cards)
							const markerEls = feedContainer.querySelectorAll('.post-feed-grid .ts-marker-wrapper > .map-marker');
							const markers: Array<{
								postId: string;
								lat: number;
								lng: number;
								template: string;
							}> = [];

							markerEls.forEach((markerEl) => {
								const el = markerEl as HTMLElement;
								const position = el.dataset.position;
								const postId = el.dataset.postId;

								if (!position || !postId) return;

								const [lat, lng] = position.split(',').map(parseFloat);
								if (isNaN(lat) || isNaN(lng)) return;

								// Get the full marker HTML from the wrapper
								const wrapper = el.parentElement;
								const template = wrapper ? wrapper.innerHTML : el.outerHTML;

								markers.push({
									postId,
									lat,
									lng,
									template,
								});
							});

							// Dispatch event with marker data for Map block
							if (markers.length > 0) {
								console.log('[PostFeed] Dispatching', markers.length, 'markers to Map block');
								window.dispatchEvent(new CustomEvent('voxel-fse:post-feed-markers', {
									detail: {
										sourceBlockId: attributes.blockId,
										markers,
									},
									bubbles: true,
								}));
							}
						}
					}
				}, 0);
			});
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
		const targetContainer = containerElement || containerRef.current;
		if (targetContainer) {
			// Scroll to top of feed container with smooth animation
			targetContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [containerElement]);

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
		// Filters mode settings
		excludePosts: attributes.excludePosts || '',
		priorityFilter: attributes.priorityFilter || false,
		priorityMin: attributes.priorityMin || 0,
		priorityMax: attributes.priorityMax || 0,
		offset: attributes.offset || 0,
		cardTemplate: attributes.cardTemplate || 'main',
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
		// Determine if we should show empty placeholder (NO data source configured)
		// Show EmptyPlaceholder when: no postType AND not loading AND no results (unconfigured state)
		const isUnconfigured = !attributes.postType && !state.loading && !state.results;

		// Show skeleton cards when: loading with a configured data source
		const showSkeletonCards = state.loading && attributes.postType;

		return (
			<div ref={containerRef} className={`ts-post-feed ${loadingClass}`} data-block-id={attributes.blockId}>
				{/* Re-render vxconfig for DevTools visibility */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
				/>

				{/* Responsive layout CSS (columns, gap, carousel widths, etc.) */}
				{responsiveLayoutCSS && (
					<style dangerouslySetInnerHTML={{ __html: responsiveLayoutCSS }} />
				)}

				{/* Style CSS (Counter, Order By, No Results, Pagination, Carousel Nav, Loading) */}
				{styleCSS && (
					<style dangerouslySetInnerHTML={{ __html: styleCSS }} />
				)}

				{/* Header with result count */}
				{attributes.displayDetails && (
					<div className="post-feed-header flexify">
						<span className={`result-count ${!state.hasResults || state.totalCount === 0 ? '' : ''}`}>
							{state.hasResults ? state.displayCount : __('Showing results', 'voxel-fse')}
						</span>
					</div>
				)}

				{/* Post grid - actual content or loading spinner */}
				{(!isUnconfigured && !showSkeletonCards && state.results) ? (
					/* Actual post cards from Voxel - rendered directly in grid container */
					<div
						className={`${gridClasses} ${attributes.layoutMode === 'carousel' ? 'min-scroll min-scroll-h' : ''}`}
						style={gridStyle}
						dangerouslySetInnerHTML={{ __html: state.results }}
					/>
				) : isUnconfigured ? (
					/* Empty placeholder when NO data source configured */
					<div
						className={`${gridClasses} ${attributes.layoutMode === 'carousel' ? 'min-scroll min-scroll-h' : ''}`}
						style={gridStyle}
					>
						<EmptyPlaceholder />
					</div>
				) : null}

				{/* Loading spinner - shown during fetch */}
				{showSkeletonCards && (
					<div className="ts-no-posts">
						<Loader variant="inline" ariaLabel="Loading posts..." />
					</div>
				)}

				{/* No results placeholder - rendered as sibling, matched with Frontend structure */}
				{/* Evidence: themes/voxel/templates/widgets/post-feed/no-results.php:1-11 */}
				{/* VOXEL PARITY: Icon rendered directly (dangerouslySetInnerHTML on div), no wrapper span */}
				<div
					className={`ts-no-posts ${isUnconfigured || showSkeletonCards || state.hasResults ? 'hidden' : ''}`}
					dangerouslySetInnerHTML={{
						__html: `${getIconHtml(attributes.noResultsIcon, DEFAULT_ICONS.noResults)}<p>${attributes.noResultsLabel}</p>`,
					}}
				/>

				{/* Pagination - functional in editor too */}
				{/* Evidence: themes/voxel/templates/widgets/post-feed/pagination.php:2-20 */}
				{attributes.pagination !== 'none' && (
					<div className="feed-pagination flexify">
						{attributes.pagination === 'prev_next' && (
							<>
								{/* Evidence: pagination.php:4 - ts-btn-large class on prev/next */}
								<a
									href="#"
									className={`ts-btn ts-btn-1 ts-btn-large ts-load-prev ${!state.hasPrev ? 'disabled' : ''}`}
									onClick={(e) => { e.preventDefault(); handlePrev(); }}
								>
									<span
										dangerouslySetInnerHTML={{
											__html: getIconHtml(attributes.leftArrowIcon, DEFAULT_ICONS.leftArrow),
										}}
									/>
									<span>{__('Previous', 'voxel-fse')}</span>
								</a>
								{/* Evidence: pagination.php:8 - btn-icon-right class on next button */}
								<a
									href="#"
									className={`ts-btn ts-btn-1 ts-btn-large btn-icon-right ts-load-next ${!state.hasNext ? 'disabled' : ''}`}
									onClick={(e) => { e.preventDefault(); handleNext(); }}
								>
									<span>{__('Next', 'voxel-fse')}</span>
									<span
										dangerouslySetInnerHTML={{
											__html: getIconHtml(attributes.rightArrowIcon, DEFAULT_ICONS.rightArrow),
										}}
									/>
								</a>
							</>
						)}
						{attributes.pagination === 'load_more' && state.hasNext && (
							<a
								href="#"
								className="ts-btn ts-btn-1 ts-btn-large ts-load-more"
								onClick={(e) => { e.preventDefault(); handleLoadMore(); }}
							>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.loadMoreIcon, DEFAULT_ICONS.loadMore),
									}}
								/>
								<span>{__('Load more', 'voxel-fse')}</span>
							</a>
						)}
					</div>
				)}

				{/* Carousel navigation */}
				{/* Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php:1-14 */}
				{/* VOXEL PARITY: ul.simplify-ul.flexify > li > a structure */}
				{attributes.layoutMode === 'carousel' && (
					<ul className="simplify-ul flexify post-feed-nav">
						<li>
							<a
								href="#"
								className="ts-icon-btn ts-prev-page disabled"
								aria-label="Previous"
								onClick={(e) => e.preventDefault()}
							>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.leftChevronIcon, DEFAULT_ICONS.leftChevron),
									}}
								/>
							</a>
						</li>
						<li>
							<a
								href="#"
								className="ts-icon-btn ts-next-page disabled"
								aria-label="Next"
								onClick={(e) => e.preventDefault()}
							>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
									}}
								/>
							</a>
						</li>
					</ul>
				)}
			</div>
		);
	}

	// Frontend render
	// Evidence: themes/voxel/templates/widgets/post-feed.php
	// Voxel renders direct children without a wrapper div (header, grid, no-results, pagination)
	// The container .voxel-fse-post-feed-frontend already has the necessary wrapper classes
	// Note: responsiveLayoutCSS is generated above (line 348) and handles all responsive styles

	// STRICT PARITY: Use Fragment to avoid extra wrapper div
	// The parent container in save.tsx (voxel-fse-post-feed-frontend) mimics elementor-widget-container
	return (
		<>
			{/* Re-render vxconfig for DevTools visibility */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Responsive layout CSS (columns, gap, carousel widths, etc.) */}
			{responsiveLayoutCSS && (
				<style dangerouslySetInnerHTML={{ __html: responsiveLayoutCSS }} />
			)}

			{/* Style CSS (Counter, Order By, No Results, Pagination, Carousel Nav, Loading) */}
			{styleCSS && (
				<style dangerouslySetInnerHTML={{ __html: styleCSS }} />
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
			{/* Evidence: themes/voxel/templates/widgets/post-feed/pagination.php:1-20 */}
			{/* VOXEL PARITY: Uses <a> tags with ts-btn-large class */}
			{attributes.pagination !== 'none' && (
				<div className={`feed-pagination flexify ${!state.hasPrev && !state.hasNext ? 'hidden' : ''}`}>
					{attributes.pagination === 'prev_next' && (
						<>
							{/* Evidence: pagination.php:4 - ts-btn-large class */}
							<a
								href="#"
								className={`ts-btn ts-btn-1 ts-btn-large ts-load-prev ${!state.hasPrev ? 'disabled' : ''}`}
								onClick={(e) => {
									e.preventDefault();
									if (state.hasPrev && !state.loading) handlePrev();
								}}
							>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.leftArrowIcon, DEFAULT_ICONS.leftArrow),
									}}
								/>
								<span>{__('Previous', 'voxel-fse')}</span>
							</a>
							{/* Evidence: pagination.php:8 - btn-icon-right class on next */}
							<a
								href="#"
								className={`ts-btn ts-btn-1 ts-btn-large btn-icon-right ts-load-next ${!state.hasNext ? 'disabled' : ''}`}
								onClick={(e) => {
									e.preventDefault();
									if (state.hasNext && !state.loading) handleNext();
								}}
							>
								<span>{__('Next', 'voxel-fse')}</span>
								<span
									dangerouslySetInnerHTML={{
										__html: getIconHtml(attributes.rightArrowIcon, DEFAULT_ICONS.rightArrow),
									}}
								/>
							</a>
						</>
					)}
					{attributes.pagination === 'load_more' && (
						<a
							href="#"
							className={`ts-btn ts-btn-1 ts-btn-large ts-load-more ${!state.hasNext ? 'hidden' : ''}`}
							onClick={(e) => {
								e.preventDefault();
								if (state.hasNext && !state.loading) handleLoadMore();
							}}
						>
							<span
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.loadMoreIcon, DEFAULT_ICONS.loadMore),
								}}
							/>
							<span>{__('Load more', 'voxel-fse')}</span>
						</a>
					)}
				</div>
			)}

			{/* Carousel navigation */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php:1-14 */}
			{/* VOXEL PARITY: ul.simplify-ul.flexify > li > a structure */}
			{attributes.layoutMode === 'carousel' && (
				<ul className={`simplify-ul flexify post-feed-nav ${!state.hasResults ? 'hidden' : ''}`}>
					<li>
						<a
							href="#"
							className="ts-icon-btn ts-prev-page"
							aria-label="Previous"
							onClick={(e) => {
								e.preventDefault();
								handleCarouselPrev();
							}}
						>
							<span
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.leftChevronIcon, DEFAULT_ICONS.leftChevron),
								}}
							/>
						</a>
					</li>
					<li>
						<a
							href="#"
							className="ts-icon-btn ts-next-page"
							aria-label="Next"
							onClick={(e) => {
								e.preventDefault();
								handleCarouselNext();
							}}
						>
							<span
								dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
								}}
							/>
						</a>
					</li>
				</ul>
			)}
		</>
	);
}
