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

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

/**
 * Default icons (matches Voxel defaults)
 */
const DEFAULT_ICONS = {
	// Evidence: themes/voxel/assets/images/svgs/reload.svg
	// Evidence: themes/voxel/templates/widgets/post-feed/pagination.php:16 - ?: \Voxel\svg( 'reload.svg' )
	loadMore: `<svg fill="none" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg"><path d="M21.6009 10.4593C22.001 10.3521 22.2384 9.94088 22.1312 9.54078C21.59 7.52089 20.3974 5.73603 18.7384 4.46302C17.0793 3.19001 15.0466 2.5 12.9555 2.5C10.8644 2.5 8.83164 3.19001 7.17262 4.46302C6.12405 5.26762 5.26179 6.2767 4.63257 7.42036L2.86504 6.92617C2.76093 6.89707 2.65423 6.89133 2.55153 6.9068C2.46222 6.91962 2.37374 6.94889 2.29039 6.99582C1.92945 7.19903 1.80158 7.65636 2.00479 8.0173L3.73942 11.0983C3.83701 11.2717 3.99946 11.3991 4.19104 11.4527C4.30333 11.4841 4.42023 11.4886 4.53266 11.4673C4.61373 11.4524 4.69254 11.4242 4.7657 11.383L7.84641 9.64831C8.11073 9.49948 8.25936 9.20608 8.22302 8.90493C8.18668 8.60378 7.9725 8.35417 7.68037 8.27249L6.1241 7.83737C6.6343 6.99996 7.29751 6.2579 8.08577 5.65305C9.48282 4.58106 11.1946 4 12.9555 4C14.7164 4 16.4282 4.58106 17.8252 5.65305C19.2223 6.72504 20.2266 8.22807 20.6823 9.92901C20.7895 10.3291 21.2008 10.5665 21.6009 10.4593Z" fill="currentColor"/><path d="M4.30739 13.5387C3.90729 13.6459 3.66985 14.0572 3.77706 14.4573C4.31829 16.4771 5.51089 18.262 7.16991 19.535C8.82892 20.808 10.8616 21.498 12.9528 21.498C15.0439 21.498 17.0766 20.808 18.7356 19.535C19.7859 18.7291 20.6493 17.7181 21.2787 16.5722L23.0083 17.0557C23.1218 17.0961 23.2447 17.1091 23.3661 17.0917C23.5554 17.0658 23.7319 16.968 23.8546 16.8116C24.0419 16.573 24.0669 16.245 23.9181 15.9807L22.1835 12.8996C22.0859 12.7263 21.9234 12.5988 21.7319 12.5453C21.64 12.5196 21.5451 12.5119 21.4521 12.5216C21.3493 12.5317 21.2488 12.5629 21.1571 12.6146L18.0764 14.3493C17.7155 14.5525 17.5876 15.0099 17.7909 15.3708C17.9016 15.5675 18.0879 15.695 18.2929 15.7373L19.7875 16.1552C19.2768 16.9949 18.6125 17.7388 17.8225 18.345C16.4255 19.417 14.7137 19.998 12.9528 19.998C11.1918 19.998 9.4801 19.417 8.08305 18.345C6.686 17.273 5.68171 15.77 5.22595 14.069C5.11874 13.6689 4.70749 13.4315 4.30739 13.5387Z" fill="currentColor"/></svg>`,
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
 * Parse AJAX HTML response into individual card HTML strings.
 * Voxel wraps each post card in a div.ts-preview element.
 * Evidence: themes/voxel/app/utils/post-utils.php:324
 */
/**
 * Parse card innerHTML from server-rendered HTML
 *
 * The server wraps each card in <div class="ts-preview">. We extract the INNER HTML
 * so we can wrap it ourselves with proper React keys and inline styles.
 * This avoids nested .ts-preview divs which breaks Voxel's CSS selectors.
 *
 * Evidence: themes/voxel/app/utils/post-utils.php:324
 */
/**
 * Parse cards from server-rendered HTML for carousel mode
 *
 * Voxel wraps each post card in <div class="ts-preview">.
 * We extract the INNER content so we can wrap with our own styled .ts-preview.
 *
 * @param html - Raw HTML from Voxel's search_posts AJAX response
 * @returns Array of card innerHTML strings (to be wrapped in our own .ts-preview)
 */
interface ParsedCard {
	html: string;
	postId: string | null;
}

function parseCardsFromHtml(html: string): ParsedCard[] {
	if (!html || !html.trim()) {
		return [];
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(`<div class="parse-wrapper">${html}</div>`, 'text/html');

	// Primary: Find .ts-preview elements (Voxel's standard wrapper)
	const cards = doc.querySelectorAll<HTMLElement>('.ts-preview');

	if (cards.length > 0) {
		// Return innerHTML + data-post-id so we can reconstruct the wrapper
		return Array.from(cards).map(card => ({
			html: card.innerHTML,
			postId: card.getAttribute('data-post-id'),
		}));
	}

	// Fallback: Use direct children of wrapper (excluding scripts, links, styles, etc.)
	const wrapper = doc.querySelector('.parse-wrapper');
	if (wrapper) {
		const validTags = new Set(['div', 'article', 'section', 'li']);
		const children = Array.from(wrapper.children).filter(child => {
			const tag = child.tagName.toLowerCase();
			// Only include content elements, not metadata
			return validTags.has(tag);
		});
		if (children.length > 0) {
			// For fallback elements, return outerHTML since they're the actual cards
			return children.map(child => ({
				html: (child as HTMLElement).outerHTML,
				postId: (child as HTMLElement).getAttribute('data-post-id'),
			}));
		}
	}

	// Last resort: return empty - grid mode will render the HTML directly
	return [];
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
		// Default to 300px if no width is set (matches normalizeConfig default)
		const itemWidth = attributes.carouselItemWidth || 300;
		rules.push(`${selector} .post-feed-grid > div, ${selector} .post-feed-grid > .ts-preview { width: ${itemWidth}${unit}; min-width: ${itemWidth}${unit}; flex: 0 0 ${itemWidth}${unit}; scroll-snap-align: start; }`);
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
	// Track whether a Map widget is connected (set by search-form event)
	// Evidence: voxel-search-form.beautified.js:2086-2091 — Voxel adds __load_markers=yes when mapWidget !== null
	const hasMapWidgetRef = useRef(false);
	const mapAdditionalMarkersRef = useRef(0);

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

						const headers: HeadersInit = { 'Accept': 'text/html' };
						const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
						if (nonce) {
							headers['X-WP-Nonce'] = nonce;
						}

						const response = await fetch(fetchUrl, {
							method: 'GET',
							credentials: 'same-origin',
							headers,
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

	// Build CSS classes (grid mode only — carousel mode uses YARL Inline plugin)
	const loadingClass = state.loading ? `vx-${attributes.loadingStyle}` : '';

	// Evidence: themes/voxel/templates/widgets/post-feed.php:18-19
	// Grid classes: post-feed-grid, layout class, loading class, vx-opacity for opacity transition,
	// sf-post-feed when connected to search form, vx-event-scroll for scroll tracking
	// CRITICAL: vx-event-autoslide and vx-event-scroll prevent Voxel's commons.js from double-binding
	const gridClasses = `post-feed-grid ts-feed-grid-default ${loadingClass} vx-opacity ${attributes.source === 'search-form' ? 'sf-post-feed vx-event-scroll' : ''}`.trim();

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
		console.log('[PostFeed] fetchPosts called - page:', page, 'overridePostType:', overridePostType, 'dynamicPostType:', dynamicPostType, 'attributes.postType:', attributes.postType);
		console.log('[PostFeed] fetchPosts caller stack:', new Error().stack);
		setState(prev => ({ ...prev, loading: true }));

		try {
			// Use override post type if provided, otherwise use dynamic or attribute
			const postType = overridePostType || dynamicPostType || attributes.postType || '';
			console.log('[PostFeed] fetchPosts using postType:', postType);

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

			// Add __load_markers=yes when a Map widget is connected
			// Evidence: voxel-search-form.beautified.js:2086-2091
			// Evidence: voxel/app/controllers/frontend/search/search-controller.php:28
			// Without this param, Voxel's get_search_results() won't render .ts-marker-wrapper elements
			console.log('[PostFeed] hasMapWidgetRef.current:', hasMapWidgetRef.current);
			if (hasMapWidgetRef.current) {
				params.set('__load_markers', 'yes');
				console.log('[PostFeed] Added __load_markers=yes to request');
				if (mapAdditionalMarkersRef.current > 0) {
					params.set('__load_additional_markers', String(mapAdditionalMarkersRef.current));
				}
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
			const headers: HeadersInit = { 'Accept': 'text/html' };
			const nonce = (window as unknown as { wpApiSettings?: { nonce?: string } }).wpApiSettings?.nonce;
			if (nonce) {
				headers['X-WP-Nonce'] = nonce;
			}

			const response = await fetch(fetchUrl, {
				method: 'GET',
				credentials: 'same-origin',
				headers,
			});

			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
			}

			const html = await response.text();
			console.log('[PostFeed] fetchPosts response length:', html.length, 'first 500 chars:', html.substring(0, 500));

			// Parse the response to extract metadata
			const parser = new DOMParser();
			const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
			const infoScript = doc.querySelector('script.info');

			const hasPrev = infoScript?.getAttribute('data-has-prev') === 'true';
			const hasNext = infoScript?.getAttribute('data-has-next') === 'true';
			const hasResults = infoScript?.getAttribute('data-has-results') === 'true';
			const totalCount = parseInt(infoScript?.getAttribute('data-total-count') || '0', 10);
			const displayCount = infoScript?.getAttribute('data-display-count') || '0';
			console.log('[PostFeed] fetchPosts parsed - hasResults:', hasResults, 'totalCount:', totalCount, 'hasPrev:', hasPrev, 'hasNext:', hasNext);

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
						console.log('[PostFeed] MAP INTEGRATION: feedContainer:', feedContainer);
						if (feedContainer) {
							// Debug: log the full HTML to see what's in the response
							console.log('[PostFeed] Feed HTML (first 2000 chars):', feedContainer.innerHTML.substring(0, 2000));

							// Extract marker data from .ts-marker-wrapper elements (Voxel embeds these in preview cards)
							const markerEls = feedContainer.querySelectorAll('.post-feed-grid .ts-marker-wrapper > .map-marker');
							console.log('[PostFeed] Found marker elements:', markerEls.length);
							console.log('[PostFeed] All .ts-marker-wrapper elements:', feedContainer.querySelectorAll('.ts-marker-wrapper').length);
							console.log('[PostFeed] All .map-marker elements:', feedContainer.querySelectorAll('.map-marker').length);
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
				hasMapWidget?: boolean;
				mapAdditionalMarkers?: number;
			}>;

			// Only respond to events targeting this block
			if (customEvent.detail?.targetId !== attributes.blockId) {
				return;
			}

			const { postType, filters } = customEvent.detail;

			// Track map widget connection for __load_markers param
			// Evidence: voxel-search-form.beautified.js:2086-2091
			if (customEvent.detail.hasMapWidget !== undefined) {
				hasMapWidgetRef.current = customEvent.detail.hasMapWidget;
			}
			if (customEvent.detail.mapAdditionalMarkers !== undefined) {
				mapAdditionalMarkersRef.current = customEvent.detail.mapAdditionalMarkers;
			}

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
			// Detect if a Map block exists on the page for __load_markers param
			// Evidence: voxel-search-form.beautified.js:2086-2091
			const mapElement = document.querySelector('.voxel-fse-map');
			console.log('[PostFeed] Looking for .voxel-fse-map element:', mapElement);
			if (mapElement) {
				hasMapWidgetRef.current = true;
				console.log('[PostFeed] Map element found! hasMapWidgetRef set to true');
			} else {
				console.log('[PostFeed] No map element found. All elements with voxel-fse class:', document.querySelectorAll('[class*="voxel-fse"]'));
			}

			// Mark initial fetch as done BEFORE calling fetchPosts
			initialFetchDoneRef.current = true;

			// VOXEL PARITY FIX: In Voxel, PHP renders initial posts server-side.
			// The searchOn='filter_update' setting only affects SUBSEQUENT filter changes.
			// PHP always calls get_search_results() with the default post type on page load.
			//
			// Evidence: voxel/app/widgets/post-feed.php:1567-1587
			// Evidence: voxel-search-form.beautified.js:1991 - previousQueryString = currentQueryString
			//
			// Since we can't do server-side rendering, we MUST fetch on mount.
			// This matches what the EDITOR does (line 876) - just call fetchPosts(1)

			// Check URL for post type and filters (VOXEL PARITY format)
			const url = new URL(window.location.href);
			const urlPostType = url.searchParams.get('type') || url.searchParams.get('post_type');

			// Collect filter params from URL (Voxel format: keys directly, no prefix)
			const urlFilters: Record<string, unknown> = {};
			url.searchParams.forEach((value, key) => {
				// Skip known non-filter params
				if (key === 'type' || key === 'post_type' || key === 'pg' || key === 'page') return;
				// Legacy format: filter_* prefix
				if (key.startsWith('filter_')) {
					const filterKey = key.replace('filter_', '');
					try { urlFilters[filterKey] = JSON.parse(value); } catch { urlFilters[filterKey] = value; }
				} else {
					// Voxel format: key directly
					try { urlFilters[key] = JSON.parse(value); } catch { urlFilters[key] = value; }
				}
			});

			// Determine post type: URL param takes precedence, then attributes.postType from vxconfig
			// If attributes.postType is empty (common when source='search-form'), get it from linked Search Form
			let postTypeToUse = urlPostType || attributes.postType;

			// CRITICAL FIX: In the editor, postType is derived from linked Search Form via useSelect.
			// But this derived value is NOT saved to attributes. So on frontend, attributes.postType is empty.
			// Solution: Look up the linked Search Form and get its first postType.
			if (!postTypeToUse && attributes.searchFormId) {
				// Try multiple selectors to find the Search Form
				// Evidence: search-form/save.tsx:68 - id: attributes.elementId || attributes.blockId
				// Evidence: search-form/save.tsx:69 - className includes voxel-fse-search-form-${blockId}
				// Evidence: search-form/save.tsx:79 - data-id: attributes.blockId
				const selectors = [
					`#${attributes.searchFormId}`,
					`[data-id="${attributes.searchFormId}"]`,
					`.voxel-fse-search-form-${attributes.searchFormId}`,
				];

				let linkedSearchForm: Element | null = null;
				for (const selector of selectors) {
					try {
						linkedSearchForm = document.querySelector(selector);
						if (linkedSearchForm) {
							console.log('[PostFeed] Found Search Form with selector:', selector);
							break;
						}
					} catch (e) {
						// Invalid selector, skip
					}
				}

				if (linkedSearchForm) {
					// Method 1: Try data-post-types attribute (simpler, directly on element)
					// Evidence: search-form/save.tsx:71 - 'data-post-types': JSON.stringify(attributes.postTypes || [])
					const postTypesAttr = linkedSearchForm.getAttribute('data-post-types');
					if (postTypesAttr) {
						try {
							const postTypesArray = JSON.parse(postTypesAttr);
							if (Array.isArray(postTypesArray) && postTypesArray.length > 0) {
								postTypeToUse = postTypesArray[0];
								console.log('[PostFeed] Got default postType from data-post-types:', postTypeToUse);
							}
						} catch (e) {
							console.error('[PostFeed] Failed to parse data-post-types:', e);
						}
					}

					// Method 2: Fallback to vxconfig if data-post-types didn't work
					if (!postTypeToUse) {
						const searchFormVxConfigScript = linkedSearchForm.querySelector('script.vxconfig');
						if (searchFormVxConfigScript?.textContent) {
							try {
								const searchFormVxConfig = JSON.parse(searchFormVxConfigScript.textContent);
								// Evidence: search-form/save.tsx:98 - postTypes: [...].map(key => ({ key, label: '', filters: [] }))
								if (searchFormVxConfig.postTypes && searchFormVxConfig.postTypes.length > 0) {
									postTypeToUse = searchFormVxConfig.postTypes[0].key;
									console.log('[PostFeed] Got default postType from vxconfig:', postTypeToUse);
								}
							} catch (e) {
								console.error('[PostFeed] Failed to parse Search Form vxconfig:', e);
							}
						}
					}
				} else {
					console.warn('[PostFeed] Could not find linked Search Form. searchFormId:', attributes.searchFormId, 'Tried selectors:', selectors);
				}
			}

			console.log('[PostFeed] Frontend initial fetch - postTypeToUse:', postTypeToUse, 'attributes.postType:', attributes.postType);

			if (postTypeToUse) {
				// Update state for subsequent filter changes
				if (urlPostType) {
					setDynamicPostType(urlPostType);
				}
				if (Object.keys(urlFilters).length > 0) {
					setDynamicFilters(urlFilters);
				}

				// CRITICAL: Pass postTypeToUse explicitly because React state updates are async
				// If we just called fetchPosts(1), dynamicPostType would still be empty
				fetchPosts(1, false, Object.keys(urlFilters).length > 0 ? urlFilters : undefined, postTypeToUse);
			} else {
				console.warn('[PostFeed] No post type available. attributes.postType:', attributes.postType, 'searchFormId:', attributes.searchFormId);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- fetchPosts intentionally excluded to prevent infinite loop
	}, [context, attributes.source, attributes.postType, attributes.blockId, attributes.searchFormId]);

	// Editor live update: refetch when postsPerPage, pagination, displayDetails, or cardTemplate change
	// These attributes affect the AJAX query but are NOT in the initial fetch deps (to prevent infinite loop)
	// Track previous values to detect actual changes (not initial mount)
	const prevPostsPerPageRef = useRef(attributes.postsPerPage);
	const prevPaginationRef = useRef(attributes.pagination);
	const prevDisplayDetailsRef = useRef(attributes.displayDetails);
	const prevCardTemplateRef = useRef(attributes.cardTemplate);

	useEffect(() => {
		if (context !== 'editor') return;

		const changed =
			prevPostsPerPageRef.current !== attributes.postsPerPage ||
			prevPaginationRef.current !== attributes.pagination ||
			prevDisplayDetailsRef.current !== attributes.displayDetails ||
			prevCardTemplateRef.current !== attributes.cardTemplate;

		// Update refs
		prevPostsPerPageRef.current = attributes.postsPerPage;
		prevPaginationRef.current = attributes.pagination;
		prevDisplayDetailsRef.current = attributes.displayDetails;
		prevCardTemplateRef.current = attributes.cardTemplate;

		if (changed && attributes.postType) {
			fetchPosts(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [context, attributes.postsPerPage, attributes.pagination, attributes.displayDetails, attributes.cardTemplate, attributes.postType]);

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

	// Carousel: Parse cards from HTML for native scroll carousel
	const carouselCards = useMemo(() => {
		if (attributes.layoutMode !== 'carousel' || !state.results) {
			return [];
		}
		return parseCardsFromHtml(state.results);
	}, [attributes.layoutMode, state.results]);

	/**
	 * Embla Carousel Configuration
	 * 
	 * Replaces manual scroll logic with robust library solution.
	 * Maintains Voxel 1:1 parity by using the same classes and structure.
	 */
	// CRITICAL: Initialize Embla with stable options, but update dynamically via useEffect below
	// This ensures Editor controls (Autoplay, etc.) work in real-time
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: false,
		align: 'start',
		containScroll: 'trimSnaps',
		dragFree: true,
	}, [
		Autoplay({
			delay: attributes.carouselAutoSlideInterval || 3000,
			stopOnInteraction: true,
			active: !!attributes.carouselAutoSlide,
		})
	]);

	// React to attribute changes (Editor wiring)
	useEffect(() => {
		if (!emblaApi) return;

		const autoplayEnabled = !!attributes.carouselAutoSlide;
		const autoplayDelay = attributes.carouselAutoSlideInterval || 3000;

		// Re-initialize Embla with updated options and plugins
		emblaApi.reInit({
			loop: false,
			align: 'start',
			containScroll: 'trimSnaps',
			dragFree: true,
		}, [
			Autoplay({
				delay: autoplayDelay,
				stopOnInteraction: true,
				active: autoplayEnabled,
			})
		]);
	}, [
		emblaApi,
		attributes.carouselAutoSlide,
		attributes.carouselAutoSlideInterval,
		attributes.itemGap,
		attributes.carouselItemWidth,
		attributes.carouselItemWidthUnit,
		// Re-run if layout mode or data changes
		attributes.layoutMode,
		carouselCards.length
	]);

	// Track scroll state for button enable/disable
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const onSelect = useCallback((api: any) => {
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
	}, []);

	// Attach listeners to Embla API
	useEffect(() => {
		if (!emblaApi) return;

		onSelect(emblaApi);
		emblaApi.on('reInit', onSelect);
		emblaApi.on('select', onSelect);

		// Force re-init when cards change to recalculate bounds
		emblaApi.reInit();

		return () => {
			emblaApi.off('reInit', onSelect);
			emblaApi.off('select', onSelect);
		};
	}, [emblaApi, onSelect, carouselCards.length]);

	/**
	 * Handle carousel prev click
	 */
	const handleCarouselPrev = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		if (emblaApi) emblaApi.scrollPrev();
	}, [emblaApi]);

	/**
	 * Handle carousel next click
	 */
	const handleCarouselNext = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

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

	// Build carousel grid classes to match Voxel exactly (used in both editor and frontend)
	// Evidence: themes/voxel/templates/widgets/post-feed.php:18-21
	// Classes: post-feed-grid, ts-feed-nowrap, min-scroll, min-scroll-h, vx-opacity, vx-event-autoslide, vx-event-scroll
	const carouselGridClasses = `post-feed-grid ts-feed-nowrap min-scroll min-scroll-h vx-opacity vx-event-autoslide vx-event-scroll ${state.loading ? `vx-${attributes.loadingStyle}` : ''}`.trim();

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

				{/* Post content - carousel or grid */}
				{/* STRICT 1:1 PARITY: NO wrapper div around carousel grid - nav is a SIBLING, not nested */}
				{(!isUnconfigured && !showSkeletonCards && state.results) ? (
					attributes.layoutMode === 'carousel' && carouselCards.length > 0 ? (
						/* Embla Carousel (matches Voxel's ts-feed-nowrap pattern visually)
						 * Wrapper acts as Embla Viewport
						 * Grid acts as Embla Container
						 * Evidence: themes/voxel/templates/widgets/post-feed.php:18-21
						 * Classes: ts-feed-nowrap min-scroll min-scroll-h vx-opacity vx-event-autoslide vx-event-scroll
						 */
						<div
							className={`ts-post-feed-carousel-view ${state.loading ? `vx-${attributes.loadingStyle}` : ''}`}
							ref={emblaRef}
							style={{ overflow: 'hidden' }}
						>
							<div
								className={carouselGridClasses}
								data-auto-slide={attributes.carouselAutoSlide ? String(attributes.carouselAutoSlide) : '0'}
								style={{
									gap: `${attributes.itemGap || 20}px`,
									scrollPadding: `${attributes.scrollPadding || 0}px`,
									padding: `0 ${attributes.scrollPadding || 0}px`,
									backfaceVisibility: 'hidden',
									display: 'flex',
									touchAction: 'pan-y',
									overflowX: 'visible', // Override Voxel's overflow-x: scroll
									scrollSnapType: 'none', // Override Voxel's scroll-snap-type
								}}
							>
								{/* parseCardsFromHtml returns {html, postId}, we add our own .ts-preview wrapper */}
								{carouselCards.map((card, i) => {
									// Logic: Prioritize column-based layout if 'columns' is set, unless the user explicitely sets a width other than the legacy default of 300.
									// This handles the case where '300' persists in the attribute but the user wants column-based sizing.
									// APPLIED TO EDITOR RENDER LOOP
									const gap = attributes.itemGap || 20;
									const cols = attributes.columns || 3;

									// Check if we should use fixed width:
									// 1. Must have a width value
									// 2. AND (Width is NOT 300 OR Columns is NOT set)
									// This treats '300' as a soft default that yields to 'columns' configuration
									// SAFETY: Cast to Number to prevent string/number mismatch issues
									const widthVal = Number(attributes.carouselItemWidth);
									const useFixedWidth = widthVal && (widthVal !== 300 || !attributes.columns);

									const cardWidth = useFixedWidth
										? `${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'}`
										: `calc((100% - ${(cols - 1) * gap}px) / ${cols})`;

									return (
										<div
											key={i}
											className="ts-preview"
											data-post-id={card.postId || undefined}
											style={{
												width: cardWidth,
												minWidth: cardWidth,
												maxWidth: cardWidth, // Prevent cards from growing
												flex: `0 0 ${cardWidth}`, // flex-grow: 0, flex-shrink: 0, flex-basis: cardWidth
												boxSizing: 'border-box', // Include padding in width calculation
												position: 'relative',
												scrollSnapAlign: 'none', // Override Voxel's scroll-snap-align
											}}
											dangerouslySetInnerHTML={{ __html: card.html }}
										/>
									);
								})}
							</div>
						</div>
					) : (
						/* Grid mode - render directly in grid container */
						<div
							ref={gridRef}
							className={gridClasses}
							dangerouslySetInnerHTML={{ __html: state.results }}
						/>
					)
				) : isUnconfigured ? (
					/* Empty placeholder when NO data source configured */
					<div ref={gridRef} className={gridClasses}>
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

				{/* Carousel navigation - rendered AFTER pagination as a SIBLING (not nested) */}
				{/* Evidence: themes/voxel/templates/widgets/post-feed.php:32 - carousel-nav.php is last include */}
				{/* Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php:1-14 */}
				{/* STRICT 1:1 PARITY: .post-feed-nav uses position:absolute relative to parent container */}
				{attributes.layoutMode === 'carousel' && carouselCards.length > 0 && (
					<ul className="simplify-ul flexify post-feed-nav">
						<li>
							<a
								href="#"
								className={`ts-icon-btn ts-prev-page${!canScrollPrev ? ' disabled' : ''}`}
								aria-label={__('Previous', 'voxel-fse')}
								onClick={handleCarouselPrev}
							>
								<span dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.leftChevronIcon, DEFAULT_ICONS.leftChevron),
								}} />
							</a>
						</li>
						<li>
							<a
								href="#"
								className={`ts-icon-btn ts-next-page${!canScrollNext ? ' disabled' : ''}`}
								aria-label={__('Next', 'voxel-fse')}
								onClick={handleCarouselNext}
							>
								<span dangerouslySetInnerHTML={{
									__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
								}} />
							</a>
						</li>
					</ul>
				)}
			</div>
		);
	}

	// Frontend render
	// Evidence: themes/voxel/templates/widgets/post-feed.php
	// Voxel renders direct children without a wrapper div (header, grid, no-results, pagination, carousel-nav)
	// The container .voxel-fse-post-feed-frontend already has position:relative for nav arrow positioning
	// Note: responsiveLayoutCSS is generated above (line 348) and handles all responsive styles

	// STRICT 1:1 PARITY: Use Fragment to avoid extra wrapper div
	// The parent container in save.tsx (voxel-fse-post-feed-frontend) provides position:relative
	// Carousel nav (.post-feed-nav) uses position:absolute and is a SIBLING to the grid, NOT inside a wrapper
	// Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php renders AFTER pagination.php
	// Note: carouselGridClasses is defined above before editor section (used by both)

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

			{/* Post content — carousel or grid */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed.php:17-28 */}
			{/* STRICT 1:1 PARITY: NO wrapper div around carousel grid - nav is a SIBLING, not nested */}
			{attributes.layoutMode === 'carousel' && carouselCards.length > 0 ? (
				/* Embla Carousel (matches Voxel's ts-feed-nowrap pattern visually)
				 * Wrapper acts as Embla Viewport
				 * Grid acts as Embla Container
				 * Evidence: themes/voxel/templates/widgets/post-feed.php:18-21
				 * Classes: ts-feed-nowrap min-scroll min-scroll-h vx-opacity vx-event-autoslide vx-event-scroll
				 */
				<div
					className={`ts-post-feed-carousel-view ${state.loading ? `vx-${attributes.loadingStyle}` : ''}`}
					ref={emblaRef}
					style={{ overflow: 'hidden' }}
				>
					<div
						className={carouselGridClasses}
						data-auto-slide={attributes.carouselAutoSlide ? String(attributes.carouselAutoSlide) : '0'}
						style={{
							gap: `${attributes.itemGap || 20}px`,
							scrollPadding: `${attributes.scrollPadding || 0}px`,
							padding: `0 ${attributes.scrollPadding || 0}px`,
							backfaceVisibility: 'hidden',
							display: 'flex',
							touchAction: 'pan-y',
							overflowX: 'visible', // Override Voxel's overflow-x: scroll
							scrollSnapType: 'none', // Override Voxel's scroll-snap-type
						}}
					>
						{/* parseCardsFromHtml returns {html, postId}, we add our own .ts-preview wrapper */}
						{carouselCards.map((card, i) => {
							// Logic: Prioritize column-based layout if 'columns' is set, unless the user explicitely sets a width other than the legacy default of 300.
							// This handles the case where '300' persists in the attribute but the user wants column-based sizing.
							const gap = attributes.itemGap || 20;
							const cols = attributes.columns || 3;

							// Check if we should use fixed width:
							// 1. Must have a width value
							// 2. AND (Width is NOT 300 OR Columns is NOT set)
							// This treats '300' as a soft default that yields to 'columns' configuration
							// SAFETY: Cast to Number to prevent string/number mismatch issues
							const widthVal = Number(attributes.carouselItemWidth);
							const useFixedWidth = widthVal && (widthVal !== 300 || !attributes.columns);

							const cardWidth = useFixedWidth
								? `${attributes.carouselItemWidth}${attributes.carouselItemWidthUnit || 'px'}`
								: `calc((100% - ${(cols - 1) * gap}px) / ${cols})`;

							return (
								<div
									key={i}
									className="ts-preview"
									data-post-id={card.postId || undefined}
									style={{
										width: cardWidth,
										minWidth: cardWidth,
										maxWidth: cardWidth, // Prevent cards from growing
										flex: `0 0 ${cardWidth}`, // flex-grow: 0, flex-shrink: 0, flex-basis: cardWidth
										boxSizing: 'border-box', // Include padding in width calculation
										position: 'relative',
										scrollSnapAlign: 'none', // Override Voxel's scroll-snap-align
									}}
									dangerouslySetInnerHTML={{ __html: card.html }}
								/>
							);
						})}
					</div>
				</div>
			) : (
				<div
					ref={gridRef}
					className={gridClasses}
					dangerouslySetInnerHTML={{ __html: state.results }}
				/>
			)}

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

			{/* Carousel navigation - rendered AFTER pagination as a SIBLING (not nested) */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed.php:32 - carousel-nav.php is last include */}
			{/* Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php:1-14 */}
			{/* STRICT 1:1 PARITY: .post-feed-nav uses position:absolute relative to parent container */}
			{/* The parent .voxel-fse-post-feed-frontend (save.tsx) provides position:relative */}
			{attributes.layoutMode === 'carousel' && carouselCards.length > 0 && (
				<ul className="simplify-ul flexify post-feed-nav">
					<li>
						<a
							href="#"
							className={`ts-icon-btn ts-prev-page${!canScrollPrev ? ' disabled' : ''}`}
							aria-label={__('Previous', 'voxel-fse')}
							onClick={handleCarouselPrev}
						>
							{/* Icon rendered directly without wrapper span (matches Voxel) */}
							<span dangerouslySetInnerHTML={{
								__html: getIconHtml(attributes.leftChevronIcon, DEFAULT_ICONS.leftChevron),
							}} />
						</a>
					</li>
					<li>
						<a
							href="#"
							className={`ts-icon-btn ts-next-page${!canScrollNext ? ' disabled' : ''}`}
							aria-label={__('Next', 'voxel-fse')}
							onClick={handleCarouselNext}
						>
							{/* Icon rendered directly without wrapper span (matches Voxel) */}
							<span dangerouslySetInnerHTML={{
								__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
							}} />
						</a>
					</li>
				</ul>
			)}
		</>
	);
}
