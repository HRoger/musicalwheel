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
} from '../types';
import { generatePostFeedStyles } from '../styles';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';
import { Loader } from '@shared/components/Loader';

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
	// Matches Voxel's chevron-left.svg / chevron-right.svg exactly (fill-based)
	// Voxel CSS: .ts-icon-btn svg { fill: var(--ts-icon-color) } overrides the path fill
	leftChevron: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.746 6.00002C10.746 5.69663 10.5632 5.42312 10.2829 5.30707C10.0026 5.19101 9.67996 5.25526 9.4655 5.46986L3.51254 11.4266C3.35184 11.5642 3.25 11.7685 3.25 11.9966V11.9982C3.24959 12.1906 3.32276 12.3831 3.46949 12.53L9.46548 18.5302C9.67994 18.7448 10.0026 18.809 10.2829 18.693C10.5632 18.5769 10.746 18.3034 10.746 18L10.746 12.7466L20.0014 12.7466C20.4156 12.7466 20.7514 12.4108 20.7514 11.9966C20.7514 11.5824 20.4156 11.2466 20.0014 11.2466L10.746 11.2466V6.00002Z" fill="#343C54"/></svg>`,
	rightChevron: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="#343C54"/></svg>`,
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

	// Item gap — applies to BOTH grid and carousel modes
	// Evidence: post-feed.php:317-341 uses grid-gap on {{WRAPPER}} > .post-feed-grid
	// grid-gap works in both CSS Grid and Flexbox contexts
	if (attributes.itemGap !== undefined) {
		rules.push(`${selector} .post-feed-grid { grid-gap: ${attributes.itemGap}px; }`);
	}
	if (attributes.itemGap_tablet !== undefined) {
		tabletRules.push(`${selector} .post-feed-grid { grid-gap: ${attributes.itemGap_tablet}px; }`);
	}
	if (attributes.itemGap_mobile !== undefined) {
		mobileRules.push(`${selector} .post-feed-grid { grid-gap: ${attributes.itemGap_mobile}px; }`);
	}

	// Carousel mode — Voxel CSS scroll-snap approach
	// Evidence: themes/voxel/app/widgets/post-feed.php - ts_nowrap_item_width control
	// Selector: {{WRAPPER}} > .post-feed-grid > div → width + min-width
	// The parent CSS (.ts-feed-nowrap) provides display:flex, overflow-x:scroll, scroll-snap-type
	// Child CSS (.ts-feed-nowrap > div) provides scroll-snap-align:start
	if (attributes.layoutMode === 'carousel') {
		const unit = attributes.carouselItemWidthUnit || 'px';

		// Item width (matches Voxel: width + min-width on direct child divs)
		if (attributes.carouselItemWidth) {
			rules.push(`${selector} .post-feed-grid > div { width: ${attributes.carouselItemWidth}${unit}; min-width: ${attributes.carouselItemWidth}${unit}; }`);
		}

		// Scroll padding (Voxel: padding + scroll-padding on container)
		if (attributes.scrollPadding) {
			rules.push(`${selector} .post-feed-grid { padding: 0 ${attributes.scrollPadding}px; scroll-padding: ${attributes.scrollPadding}px; }`);
		}

		// Item padding
		if (attributes.itemPadding) {
			rules.push(`${selector} .post-feed-grid > .ts-preview { padding: ${attributes.itemPadding}px; }`);
		}

		// Responsive tablet (only when explicitly set)
		if (attributes.carouselItemWidth_tablet) {
			tabletRules.push(`${selector} .post-feed-grid > div { width: ${attributes.carouselItemWidth_tablet}${unit}; min-width: ${attributes.carouselItemWidth_tablet}${unit}; }`);
		}
		if (attributes.scrollPadding_tablet) {
			tabletRules.push(`${selector} .post-feed-grid { padding: 0 ${attributes.scrollPadding_tablet}px; scroll-padding: ${attributes.scrollPadding_tablet}px; }`);
		}
		if (attributes.itemPadding_tablet) {
			tabletRules.push(`${selector} .post-feed-grid > .ts-preview { padding: ${attributes.itemPadding_tablet}px; }`);
		}

		// Responsive mobile (only when explicitly set)
		if (attributes.carouselItemWidth_mobile) {
			mobileRules.push(`${selector} .post-feed-grid > div { width: ${attributes.carouselItemWidth_mobile}${unit}; min-width: ${attributes.carouselItemWidth_mobile}${unit}; }`);
		}
		if (attributes.scrollPadding_mobile) {
			mobileRules.push(`${selector} .post-feed-grid { padding: 0 ${attributes.scrollPadding_mobile}px; scroll-padding: ${attributes.scrollPadding_mobile}px; }`);
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
 * Post Feed Shared Component
 */
export default function PostFeedComponent({
	attributes,
	context,
	editorFilters,
	containerElement,
	initialHtml,
	initialMeta,
}: PostFeedComponentProps): JSX.Element {
	const gridRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const initialFetchDoneRef = useRef(false);
	// Track whether a Map widget is connected (set by search-form event)
	// Evidence: voxel-search-form.beautified.js:2086-2091 — Voxel adds __load_markers=yes when mapWidget !== null
	const hasMapWidgetRef = useRef(false);
	const mapAdditionalMarkersRef = useRef(0);

	// Server-side hydration: if PHP injected pre-rendered HTML, start with it
	// This eliminates the AJAX round-trip and renders cards immediately (same as term-feed)
	const isHydrated = context === 'frontend' && initialHtml !== null && initialHtml !== undefined;

	// State for post feed
	// If hydrated, start with data already loaded (no spinner)
	// Otherwise, start in loading state (editor or non-hydrated frontend)
	const [state, setState] = useState<PostFeedState>(() => {
		if (isHydrated && initialMeta) {
			return {
				loading: false,
				page: 1,
				results: initialHtml ?? '',
				totalCount: initialMeta.totalCount,
				displayCount: initialMeta.displayCount,
				hasPrev: initialMeta.hasPrev,
				hasNext: initialMeta.hasNext,
				hasResults: initialMeta.hasResults,
			};
		}
		return {
			loading: true,
			page: 1,
			results: '',
			totalCount: 0,
			displayCount: '0',
			hasPrev: false,
			hasNext: false,
			hasResults: false,
		};
	});

	// Dynamic filters from search form (for search-form source mode)
	const [dynamicFilters, setDynamicFilters] = useState<Record<string, unknown>>({});
	const [dynamicPostType, setDynamicPostType] = useState<string>(attributes.postType || '');

	// Prevent link navigation in editor (matches Elementor's onLinkClick behavior)
	// Skip carousel nav buttons (.post-feed-nav) and pagination buttons (.feed-pagination) so they still work
	const handleEditorClick = useCallback((e: React.MouseEvent) => {
		if (context !== 'editor') return;
		const target = (e.target as HTMLElement).closest('a');
		if (target && !target.closest('.post-feed-nav') && !target.closest('.feed-pagination')) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, [context]);

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

	// EXACT Voxel: Loading style class (vx-opacity or vx-skeleton) goes on the GRID (always present)
	// .vx-loading toggles on the OUTER container to activate the loading effect
	// Evidence: post-feed.php:19 - ts_loading_style is always on the grid
	// Evidence: post-feed.php:628 - {{WRAPPER}}.vx-loading .vx-opacity { opacity: X }
	// Evidence: voxel-post-feed.beautified.js:122,132 - feedContainer.addClass/removeClass("vx-loading")
	const loadingStyleClass = `vx-${attributes.loadingStyle}`;

	// Toggle .vx-loading on the outer container element (matches Voxel's feedContainer pattern)
	useEffect(() => {
		const container = containerElement || containerRef.current;
		if (!container) return;
		if (state.loading) {
			container.classList.add('vx-loading');
		} else {
			container.classList.remove('vx-loading');
		}
	}, [state.loading, containerElement]);

	// Evidence: themes/voxel/templates/widgets/post-feed.php:18-19
	// Grid classes: post-feed-grid, layout class, loading style class (always present),
	// sf-post-feed when connected to search form, vx-event-scroll for scroll tracking
	// CRITICAL: vx-event-autoslide and vx-event-scroll prevent Voxel's commons.js from double-binding
	const gridClasses = `post-feed-grid ts-feed-grid-default ${loadingStyleClass} ${attributes.source === 'search-form' ? 'sf-post-feed vx-event-scroll' : ''}`.trim();

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

		// VOXEL PARITY: Notify connected blocks (Search Form, Map) that loading started
		// In Voxel, the Search Form owns getPosts() and sets this.loading = true (line 2064)
		// which triggers the submit button spinner via :class="{'ts-loading-btn': loading}"
		// In FSE, we dispatch events so the Search Form can mirror this behavior
		if (context === 'frontend') {
			window.dispatchEvent(new CustomEvent('voxel-fse:feed-loading', {
				detail: { sourceId: attributes.blockId, searchFormId: attributes.searchFormId },
			}));
			// VOXEL PARITY: Add map-pending class to map widget during loading
			// Reference: voxel-search-form.beautified.js:2079 - mapWidget?.addClass("map-pending")
			document.querySelector('.elementor-widget-ts-map')?.classList.add('map-pending');
		}

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

			// Add card template ID for server-side rendering
			// Evidence: voxel/app/controllers/frontend/search/search-controller.php:34
			// Voxel reads $_GET['__template_id'] and passes as numeric to get_search_results()
			// 'main' means default template (no param needed), numeric = custom template
			if (attributes.cardTemplate && attributes.cardTemplate !== 'main') {
				params.set('__template_id', attributes.cardTemplate);
			}

			// Add __load_markers=yes when a Map widget is connected
			// Evidence: voxel-search-form.beautified.js:2086-2091
			// Evidence: voxel/app/controllers/frontend/search/search-controller.php:28
			// Without this param, Voxel's get_search_results() won't render .ts-marker-wrapper elements
			if (hasMapWidgetRef.current) {
				params.set('__load_markers', 'yes');
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

				// VOXEL PARITY: Notify connected blocks that loading finished
				// In Voxel, getPosts() sets this.loading = false after response (line 2142)
				if (context === 'frontend') {
					window.dispatchEvent(new CustomEvent('voxel-fse:feed-loaded', {
						detail: { sourceId: attributes.blockId, searchFormId: attributes.searchFormId },
					}));
					// Reference: voxel-search-form.beautified.js:2159 - mapWidget?.removeClass("map-pending")
					document.querySelector('.elementor-widget-ts-map')?.classList.remove('map-pending');
				}

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
					// Also dispatch native CustomEvent so blocks using addEventListener receive it
					document.dispatchEvent(new CustomEvent('voxel:markup-update'));

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
								const position = el.dataset['position'];
								const postId = el.dataset['postId'];

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
			// VOXEL PARITY: Notify connected blocks that loading finished (even on error)
			// Reference: voxel-search-form.beautified.js:2283-2285
			if (context === 'frontend') {
				window.dispatchEvent(new CustomEvent('voxel-fse:feed-loaded', {
					detail: { sourceId: attributes.blockId, searchFormId: attributes.searchFormId },
				}));
				document.querySelector('.elementor-widget-ts-map')?.classList.remove('map-pending');
			}
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

		// Skip initial fetch if server-side hydration provided the data
		// The state was already initialized with hydrated HTML in useState above
		if (isHydrated) {
			initialFetchDoneRef.current = true;
			// Trigger voxel:markup-update for any widgets in hydrated content
			requestAnimationFrame(() => {
				if ((window as any).jQuery) {
					(window as any).jQuery(document).trigger('voxel:markup-update');
				}
				document.dispatchEvent(new CustomEvent('voxel:markup-update'));
			});
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
			if (mapElement) {
				hasMapWidgetRef.current = true;
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
								}
							} catch (e) {
								console.error('[PostFeed] Failed to parse Search Form vxconfig:', e);
							}
						}
					}
				} else {
				// Linked Search Form not found — postTypeToUse stays empty
				}
			}

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
				// No post type available — skip initial fetch
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
	 * CSS Scroll-Snap Carousel (Voxel 1:1 Parity)
	 *
	 * Uses native CSS scroll-snap-type: x mandatory on the container
	 * and scroll-snap-align: start on items. Navigation via scrollBy().
	 * Evidence: themes/voxel/assets/dist/commons.js - scroll boundary detection
	 * Evidence: themes/voxel/assets/dist/post-feed.css - .ts-feed-nowrap scroll-snap rules
	 */
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const carouselPrevRef = useRef<HTMLAnchorElement>(null);
	const carouselNextRef = useRef<HTMLAnchorElement>(null);

	// Manage 'disabled' class on nav buttons entirely via refs.
	// Matches Voxel carousel-nav.php: frontend starts with 'disabled' (opacity:0),
	// commons.js removes it if scrollWidth > clientWidth.
	//
	// CRITICAL: We CANNOT put 'disabled' in JSX className because React
	// re-renders would overwrite any ref-based removal. Instead, we
	// add/remove 'disabled' entirely via DOM manipulation.
	useEffect(() => {
		if (context === 'editor') return; // Editor never has disabled class
		const prev = carouselPrevRef.current;
		const next = carouselNextRef.current;
		if (!prev || !next) return;

		// Add disabled initially (matches carousel-nav.php: !is_admin)
		prev.classList.add('disabled');
		next.classList.add('disabled');

		const el = scrollContainerRef.current;
		if (!el || attributes.layoutMode !== 'carousel') return;

		const measureOverflow = () => {
			if (!el || el.clientWidth < 1) return;
			if (el.scrollWidth > el.clientWidth) {
				prev.classList.remove('disabled');
				next.classList.remove('disabled');
			}
		};

		requestAnimationFrame(measureOverflow);

		// ResizeObserver: re-measure when the element goes from 0 → visible width
		let ro: ResizeObserver | null = null;
		if (typeof ResizeObserver !== 'undefined') {
			ro = new ResizeObserver(() => {
				requestAnimationFrame(measureOverflow);
			});
			ro.observe(el);
		}

		window.addEventListener('resize', measureOverflow);

		return () => {
			ro?.disconnect();
			window.removeEventListener('resize', measureOverflow);
		};
	}, [carouselCards.length, context, attributes.layoutMode, attributes.carouselItemWidth, attributes.itemGap, attributes.scrollPadding]);

	/**
	 * Scroll the carousel — 1:1 port of Voxel's commons.js `l()` function
	 *
	 * Evidence: themes/voxel/assets/dist/commons.js
	 * - Next: scroll by one item width. If at end, wrap to start.
	 * - Prev: scroll by negative item width. If at start, wrap to end.
	 */
	const scrollCarousel = useCallback((direction: 'next' | 'prev') => {
		const el = scrollContainerRef.current;
		if (!el) return;
		const firstItem = el.querySelector<HTMLElement>('.ts-preview');
		if (!firstItem) return;

		let scrollAmount: number;

		if (direction === 'next') {
			scrollAmount = firstItem.scrollWidth;
			// If at end, wrap to start
			if (el.clientWidth + Math.abs(el.scrollLeft) + 10 >= el.scrollWidth) {
				scrollAmount = -el.scrollLeft;
			}
		} else {
			scrollAmount = -firstItem.scrollWidth;
			// If at start, wrap to end
			if (Math.abs(el.scrollLeft) <= 10) {
				scrollAmount = el.scrollWidth - el.clientWidth - el.scrollLeft;
			}
		}

		el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
	}, []);

	const handleCarouselPrev = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		scrollCarousel('prev');
	}, [scrollCarousel]);

	const handleCarouselNext = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		scrollCarousel('next');
	}, [scrollCarousel]);

	// Autoplay with hover-pause (matches Voxel's setInterval approach)
	useEffect(() => {
		if (!attributes.carouselAutoSlide || attributes.layoutMode !== 'carousel') return;
		const interval = attributes.carouselAutoSlideInterval || 3000;
		if (interval < 20) return;

		let isHovered = false;
		const container = scrollContainerRef.current?.closest('.voxel-fse-post-feed-frontend') || scrollContainerRef.current?.closest('.ts-post-feed');
		const onEnter = () => { isHovered = true; };
		const onLeave = () => { isHovered = false; };
		container?.addEventListener('mouseenter', onEnter);
		container?.addEventListener('mouseleave', onLeave);

		const timer = setInterval(() => {
			if (!isHovered && scrollContainerRef.current) {
				scrollCarousel('next');
			}
		}, interval);

		return () => {
			clearInterval(timer);
			container?.removeEventListener('mouseenter', onEnter);
			container?.removeEventListener('mouseleave', onLeave);
		};
	}, [attributes.carouselAutoSlide, attributes.carouselAutoSlideInterval, attributes.layoutMode, scrollCarousel]);

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
	// Classes: post-feed-grid, ts-feed-nowrap, min-scroll, min-scroll-h, loading style class, vx-event-autoslide, vx-event-scroll
	// EXACT Voxel: Loading style class is ALWAYS on the grid. .vx-loading toggles on the outer container.
	const carouselGridClasses = `post-feed-grid ts-feed-nowrap min-scroll min-scroll-h ${loadingStyleClass} vx-event-autoslide vx-event-scroll`.trim();

	// Shared carousel nav — used by both editor and frontend (DRY)
	// Evidence: themes/voxel/templates/widgets/post-feed/carousel-nav.php:1-14
	// Renders position:absolute overlay with prev/next buttons
	const carouselNav = attributes.layoutMode === 'carousel' && carouselCards.length > 0 ? (
		<ul className="simplify-ul flexify post-feed-nav">
			<li>
				<a
					ref={carouselPrevRef}
					href="#"
					className="ts-icon-btn ts-prev-page"
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
					ref={carouselNextRef}
					href="#"
					className="ts-icon-btn ts-next-page"
					aria-label={__('Next', 'voxel-fse')}
					onClick={handleCarouselNext}
				>
					<span dangerouslySetInnerHTML={{
						__html: getIconHtml(attributes.rightChevronIcon, DEFAULT_ICONS.rightChevron),
					}} />
				</a>
			</li>
		</ul>
	) : null;

	// Editor preview - shows actual data or placeholder while loading
	if (context === 'editor') {
		// Determine if we should show empty placeholder (NO data source configured)
		// Show EmptyPlaceholder when: no postType AND not loading AND no results (unconfigured state)
		const isUnconfigured = !attributes.postType && !state.loading && !state.results;

		// Show skeleton cards when: loading with a configured data source
		const showSkeletonCards = state.loading && attributes.postType;

		return (
			<div ref={containerRef} className={`ts-post-feed ${state.loading ? 'vx-loading' : ''}`} data-block-id={attributes.blockId} onClickCapture={handleEditorClick}>
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
						/* CSS Scroll-Snap Carousel (1:1 Voxel parity)
						 * Single scroll container — no Embla wrapper needed
						 * Evidence: themes/voxel/templates/widgets/post-feed.php:18-21
						 * Classes: ts-feed-nowrap min-scroll min-scroll-h vx-opacity vx-event-autoslide vx-event-scroll
						 */
						<div
							ref={scrollContainerRef}
							className={carouselGridClasses}
							data-auto-slide={attributes.carouselAutoSlide ? String(attributes.carouselAutoSlideInterval || 3000) : '0'}
						>
							{carouselCards.map((card, i) => (
								<div
									key={i}
									className="ts-preview"
									data-post-id={card.postId || undefined}
									dangerouslySetInnerHTML={{ __html: card.html }}
								/>
							))}
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

				{/* Carousel navigation (shared) */}
				{carouselNav}
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
				/* CSS Scroll-Snap Carousel (1:1 Voxel parity)
				 * Single scroll container — no wrapper needed
				 * Evidence: themes/voxel/templates/widgets/post-feed.php:18-21
				 * Classes: ts-feed-nowrap min-scroll min-scroll-h vx-opacity vx-event-autoslide vx-event-scroll
				 */
				<div
					ref={scrollContainerRef}
					className={carouselGridClasses}
					data-auto-slide={attributes.carouselAutoSlide ? String(attributes.carouselAutoSlideInterval || 3000) : '0'}
				>
					{carouselCards.map((card, i) => (
						<div
							key={i}
							className="ts-preview"
							data-post-id={card.postId || undefined}
							dangerouslySetInnerHTML={{ __html: card.html }}
						/>
					))}
				</div>
			) : (
				<div
					ref={gridRef}
					className={gridClasses}
					dangerouslySetInnerHTML={{ __html: state.results }}
				/>
			)}

			{/* Frontend loading indicator — shows spinner during initial AJAX fetch
			  * Prevents blank space while post cards load via Voxel's ?vx=1 system.
			  * Uses Voxel's .ts-loader pattern for visual consistency.
			  * Hidden once results arrive (state.loading becomes false). */}
			{state.loading && !state.results && context === 'frontend' && (
				<div className="ts-form ts-loading" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
					<div className="ts-loader-wrapper">
						<span className="ts-loader"></span>
					</div>
				</div>
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

			{/* Carousel navigation (shared) */}
			{carouselNav}
		</>
	);
}
