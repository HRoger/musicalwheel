/**
 * Search Form Block - Frontend Entry Point (Option C+ Hybrid)
 *
 * Hydrates React by reading data attributes from save.tsx output.
 * This enables WordPress frontend rendering while also being
 * compatible with Next.js headless architecture.
 *
 * @package VoxelFSE
 *
 * ============================================================================
 * VOXEL PARITY STATUS
 * ============================================================================
 *
 * Reference: docs/block-conversions/search-form/voxel-search-form.beautified.js (1,476 lines)
 *
 * FILTER COMPONENTS (17 implemented):
 * ✅ FilterPostTypes - Post type switcher with search
 * ✅ FilterKeywords - Text input with debounce
 * ✅ FilterStepper - Increment/decrement number input
 * ✅ FilterRange - noUiSlider (popup/inline/minmax modes)
 * ✅ FilterLocation - Google Places Autocomplete + geolocation
 * ✅ FilterAvailability - Pikaday date picker (range/single modes)
 * ✅ FilterTerms - Taxonomy terms with hierarchy
 * ✅ FilterDate - Date picker filter
 * ✅ FilterRecurringDate - Recurring date filter
 * ✅ FilterRelations - Post relation filter
 * ✅ FilterUser - User filter
 * ✅ FilterFollowing - Following status filter
 * ✅ FilterOpenNow - Open now toggle
 * ✅ FilterPostStatus - Post status filter
 * ✅ FilterSwitcher - Toggle switcher
 * ✅ FilterOrderBy - Sort order dropdown
 * ✅ FilterUIHeading - Section heading
 *
 * CORE FEATURES:
 * ✅ HTML structure matches (ts-form, ts-search-widget, ts-filter-wrapper)
 * ✅ Post type switching with filter reset
 * ✅ URL state persistence (filter_* params)
 * ✅ Custom events (voxel-search-submit for Post Feed/Map)
 * ✅ Loading/error states with proper classes
 * ✅ Portal mode for responsive toggle
 * ✅ Turbo/PJAX support
 * ⚠️ Adaptive filtering (narrowed_values) - config parsed but AJAX not implemented
 * ⚠️ Map Circle/Popup - created by search-form's main app in Voxel, not map block
 *
 * AJAX SYSTEM:
 * - Voxel: `?vx=1&action=search_posts` and `search.narrow_filters`
 * - FSE: REST API `voxel-fse/v1/search-form/frontend-config`
 * - For post loading: Custom events dispatched to Post Feed block
 *
 * NEXT.JS READINESS:
 * ✅ normalizeConfig() handles both vxconfig and REST API formats
 * ✅ SearchFormComponent accepts props (no DOM dependency)
 * ✅ No jQuery in component logic
 * ✅ No WordPress globals in component
 * ✅ TypeScript strict mode
 *
 * ARCHITECTURAL NOTE:
 * In Voxel, the search-form app owns the map integration (creates Circle, Popup,
 * Clusterer). In FSE, the map block handles its own rendering. The search-form
 * dispatches events that the map listens to for filter updates.
 *
 * ============================================================================
 */

import { createRoot } from 'react-dom/client';
import { useState, useEffect, useRef, useCallback } from 'react';
import SearchFormComponent from './shared/SearchFormComponent';
import type { SearchFormAttributes, PostTypeConfig } from './types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Registry of Search Form instances for Post Feed connection
 * Key: Search Form blockId, Value: function to dispatch initial values
 */
const searchFormRegistry: Map<string, () => void> = new Map();

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Parse JSON safely with fallback
 */
function parseJson(value: string | null | undefined, fallback: unknown): unknown {
	if (!value) return fallback;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

/**
 * Parse boolean from string
 */
function parseBool(value: string | null | undefined): boolean {
	return value === 'true';
}

/**
 * Parse data attributes from save.tsx output into SearchFormAttributes
 */
function parseDataAttributes(container: HTMLElement): SearchFormAttributes {
	// Helper to parse number or undefined
	const parseNumber = (value: string | undefined): number | undefined => {
		if (!value || value === '') return undefined;
		const num = Number(value);
		return isNaN(num) ? undefined : num;
	};

	return {
		blockId: container.id || '',
		postTypes: parseJson(container.dataset.postTypes, []) as string[],
		showPostTypeFilter: parseBool(container.dataset.showPostTypeFilter),
		filterLists: parseJson(container.dataset.filterLists, {}) as Record<string, unknown>,
		onSubmit: (container.dataset.onSubmit as 'refresh' | 'feed' | 'map') || 'refresh',
		postToFeedId: container.dataset.postToFeedId || '',
		postToMapId: container.dataset.postToMapId || '',
		searchOn: (container.dataset.searchOn as 'change' | 'submit') || 'submit',
		showSearchButton: parseBool(container.dataset.showSearchButton),
		searchButtonText: container.dataset.searchButtonText || 'Search',
		searchButtonIcon: parseJson(container.dataset.searchButtonIcon, {}) as Record<string, unknown>,
		searchButtonWidth: parseNumber(container.dataset.searchButtonWidth),
		searchButtonWidth_tablet: parseNumber(container.dataset.searchButtonWidthTablet),
		searchButtonWidth_mobile: parseNumber(container.dataset.searchButtonWidthMobile),
		searchButtonWidthUnit: container.dataset.searchButtonWidthUnit || '%',
		showResetButton: parseBool(container.dataset.showResetButton),
		resetButtonText: container.dataset.resetButtonText || 'Reset',
		resetButtonIcon: parseJson(container.dataset.resetButtonIcon, {}) as Record<string, unknown>,
		resetButtonWidth: parseNumber(container.dataset.resetButtonWidth),
		resetButtonWidth_tablet: parseNumber(container.dataset.resetButtonWidthTablet),
		resetButtonWidth_mobile: parseNumber(container.dataset.resetButtonWidthMobile),
		resetButtonWidthUnit: container.dataset.resetButtonWidthUnit || '%',
		voxelIntegration: parseBool(container.dataset.voxelIntegration),
		adaptiveFiltering: parseBool(container.dataset.adaptiveFiltering),
		portalMode: parseJson(container.dataset.portalMode, { desktop: false, tablet: true, mobile: true }) as { desktop: boolean; tablet: boolean; mobile: boolean },
		formToggleDesktop: parseBool(container.dataset.formToggleDesktop),
		formToggleTablet: parseBool(container.dataset.formToggleTablet),
		formToggleMobile: parseBool(container.dataset.formToggleMobile),
		toggleText: container.dataset.toggleText || 'Filter results',
		toggleIcon: parseJson(container.dataset.toggleIcon, {}) as Record<string, unknown>,
	};
}

/**
 * Fetch post types configuration from REST API
 */
async function fetchPostTypes(postTypeKeys: string[]): Promise<PostTypeConfig[]> {
	if (!postTypeKeys || postTypeKeys.length === 0) {
		return [];
	}

	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/search-form/frontend-config?post_types=${encodeURIComponent(postTypeKeys.join(','))}`;

	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();
		return data as PostTypeConfig[];
	} catch (error) {
		console.error('Failed to fetch post types:', error);
		return [];
	}
}

/**
 * Normalize config for both vxconfig and REST API format compatibility
 *
 * This function handles:
 * - camelCase vs snake_case field names
 * - Nested objects (portalMode, icons)
 * - Arrays (postTypes)
 * - Default values
 *
 * @param raw - Raw config from vxconfig script or REST API
 * @returns Normalized SearchFormAttributes
 */
function normalizeConfig(raw: Record<string, unknown>): SearchFormAttributes {
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true') return true;
		if (val === 'false') return false;
		return fallback;
	};

	// Helper for portal mode normalization
	const normalizePortalMode = (val: unknown): { desktop: boolean; tablet: boolean; mobile: boolean } => {
		if (val && typeof val === 'object') {
			const v = val as Record<string, unknown>;
			return {
				desktop: normalizeBool(v.desktop, false),
				tablet: normalizeBool(v.tablet, true),
				mobile: normalizeBool(v.mobile, true),
			};
		}
		return { desktop: false, tablet: true, mobile: true };
	};

	// Helper for icon normalization
	const normalizeIcon = (val: unknown): Record<string, unknown> => {
		if (val && typeof val === 'object') return val as Record<string, unknown>;
		return {};
	};

	// Extract post types - handle both array of strings and array of objects
	const rawPostTypes = (raw.postTypes ?? raw.post_types ?? []) as unknown[];
	const postTypes = rawPostTypes.map((pt) => {
		if (typeof pt === 'string') return pt;
		if (pt && typeof pt === 'object' && 'key' in pt) return (pt as Record<string, unknown>).key as string;
		return '';
	}).filter(Boolean);

	return {
		blockId: (raw.blockId ?? raw.block_id ?? '') as string,
		postTypes,
		showPostTypeFilter: normalizeBool(raw.showPostTypeFilter ?? raw.show_post_type_filter, true),
		filterLists: (raw.filterLists ?? raw.filter_lists ?? {}) as Record<string, unknown>,
		onSubmit: (raw.onSubmit ?? raw.on_submit ?? 'refresh') as 'refresh' | 'feed' | 'map',
		postToFeedId: (raw.postToFeedId ?? raw.post_to_feed_id ?? '') as string,
		postToMapId: (raw.postToMapId ?? raw.post_to_map_id ?? '') as string,
		searchOn: (raw.searchOn ?? raw.search_on ?? 'submit') as 'change' | 'submit',
		showSearchButton: normalizeBool(raw.showSearchButton ?? raw.show_search_button, true),
		searchButtonText: (raw.searchButtonText ?? raw.search_button_text ?? 'Search') as string,
		searchButtonIcon: normalizeIcon(raw.searchButtonIcon ?? raw.search_button_icon),
		searchButtonWidth: raw.searchButtonWidth as number | undefined,
		searchButtonWidth_tablet: (raw.searchButtonWidth_tablet ?? raw.search_button_width_tablet) as number | undefined,
		searchButtonWidth_mobile: (raw.searchButtonWidth_mobile ?? raw.search_button_width_mobile) as number | undefined,
		searchButtonWidthUnit: (raw.searchButtonWidthUnit ?? raw.search_button_width_unit ?? '%') as string,
		showResetButton: normalizeBool(raw.showResetButton ?? raw.show_reset_button, false),
		resetButtonText: (raw.resetButtonText ?? raw.reset_button_text ?? 'Reset') as string,
		resetButtonIcon: normalizeIcon(raw.resetButtonIcon ?? raw.reset_button_icon),
		resetButtonWidth: raw.resetButtonWidth as number | undefined,
		resetButtonWidth_tablet: (raw.resetButtonWidth_tablet ?? raw.reset_button_width_tablet) as number | undefined,
		resetButtonWidth_mobile: (raw.resetButtonWidth_mobile ?? raw.reset_button_width_mobile) as number | undefined,
		resetButtonWidthUnit: (raw.resetButtonWidthUnit ?? raw.reset_button_width_unit ?? '%') as string,
		voxelIntegration: normalizeBool(raw.voxelIntegration ?? raw.voxel_integration, true),
		adaptiveFiltering: normalizeBool(raw.adaptiveFiltering ?? raw.adaptive_filtering, false),
		portalMode: normalizePortalMode(raw.portalMode ?? raw.portal_mode),
		formToggleDesktop: normalizeBool(raw.formToggleDesktop ?? raw.form_toggle_desktop, false),
		formToggleTablet: normalizeBool(raw.formToggleTablet ?? raw.form_toggle_tablet, true),
		formToggleMobile: normalizeBool(raw.formToggleMobile ?? raw.form_toggle_mobile, true),
		toggleText: (raw.toggleText ?? raw.toggle_text ?? 'Filter results') as string,
		toggleIcon: normalizeIcon(raw.toggleIcon ?? raw.toggle_icon),
	};
}

/**
 * Parse vxconfig from script tag (matching Voxel pattern)
 * Uses normalizeConfig() for consistent format handling
 */
function parseVxConfig(container: HTMLElement): SearchFormAttributes {
	// Look for vxconfig script tag
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			const rawConfig = JSON.parse(vxconfigScript.textContent);

			// Merge with data attributes for submission handling
			// (onSubmit, postToFeedId, postToMapId are set via data attributes)
			const mergedConfig = {
				...rawConfig,
				blockId: rawConfig.blockId || container.id || '',
				onSubmit: container.dataset.onSubmit || rawConfig.onSubmit || 'refresh',
				postToFeedId: container.dataset.postToFeedId || rawConfig.postToFeedId || '',
				postToMapId: container.dataset.postToMapId || rawConfig.postToMapId || '',
			};

			// Use normalizeConfig for consistent format handling
			return normalizeConfig(mergedConfig);
		} catch (error) {
			console.error('Failed to parse vxconfig:', error);
		}
	}

	// Fallback to data attributes if vxconfig not found
	return parseDataAttributes(container);
}

/**
 * Wrapper component that handles data fetching and renders SearchFormComponent
 */
interface SearchFormWrapperProps {
	attributes: SearchFormAttributes;
	onSubmit: (values: Record<string, unknown>) => void;
}

function SearchFormWrapper({ attributes, onSubmit }: SearchFormWrapperProps) {
	const [postTypes, setPostTypes] = useState<PostTypeConfig[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const hasDispatchedInitial = useRef(false);

	// Function to dispatch initial values to connected Post Feed
	const dispatchInitialValues = useCallback(() => {
		if (hasDispatchedInitial.current) return;

		const defaultPostType = attributes.postTypes?.[0] || '';
		if (!defaultPostType) return;

		// Call onSubmit with initial values (empty filters, default post type)
		onSubmit({
			postType: defaultPostType,
		});

		hasDispatchedInitial.current = true;
	}, [attributes.postTypes, onSubmit]);

	useEffect(() => {
		let cancelled = false;

		async function loadPostTypes() {
			setIsLoading(true);
			setError(null);

			try {
				const data = await fetchPostTypes(attributes.postTypes || []);
				if (!cancelled) {
					setPostTypes(data);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : 'Failed to load');
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		loadPostTypes();

		return () => {
			cancelled = true;
		};
	}, [attributes.postTypes]);

	// Register this Search Form in the global registry for Post Feed connection
	useEffect(() => {
		const blockId = attributes.blockId;
		if (!blockId) return;

		// Register the dispatch function
		searchFormRegistry.set(blockId, dispatchInitialValues);

		// Check if there are any pending Post Feed ready events
		// This handles the case where Post Feed mounted before Search Form
		const pendingTargetId = (window as any).__voxelFsePendingPostFeedReady?.[blockId];
		if (pendingTargetId) {
			// Dispatch initial values to the waiting Post Feed
			dispatchInitialValues();
			delete (window as any).__voxelFsePendingPostFeedReady[blockId];
		}

		return () => {
			searchFormRegistry.delete(blockId);
		};
	}, [attributes.blockId, dispatchInitialValues]);

	// Loading state
	if (isLoading) {
		return (
			<div className="ts-form ts-search-widget voxel-fse-loading">
				<div className="ts-filter-wrapper flexify">
					<span className="ts-loader"></span>
				</div>
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="ts-form ts-search-widget voxel-fse-error">
				<div className="ts-filter-wrapper flexify">
					<span>Error loading search form</span>
				</div>
			</div>
		);
	}

	// Filter to only selected post types
	const selectedPostTypes = postTypes.filter((pt) =>
		attributes.postTypes?.includes(pt.key)
	);

	return (
		<SearchFormComponent
			attributes={attributes}
			postTypes={selectedPostTypes}
			context="frontend"
			onSubmit={onSubmit}
		/>
	);
}

/**
 * Initialize search form blocks on the page
 */
function initSearchForms() {
	// Find all search form blocks by the voxel-fse class
	// After hydration, React will render the actual .ts-search-widget inside this wrapper
	const searchForms = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-search-form'
	);

	searchForms.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse attributes from vxconfig (matching Voxel pattern)
		const attributes = parseVxConfig(container);

		// Handle form submission
		const handleSubmit = (values: Record<string, unknown>) => {
			// Extract postType from values (set by useSearchForm hook)
			const postType = (values.postType as string) || attributes.postTypes?.[0] || '';

			// Remove postType from filters (it's not a filter, it's a top-level param)
			const { postType: _, ...filters } = values;

			switch (attributes.onSubmit) {
				case 'feed':
					// Dispatch event for Post Feed block
					if (attributes.postToFeedId) {
						const event = new CustomEvent('voxel-search-submit', {
							detail: {
								targetId: attributes.postToFeedId,
								postType,
								filters,
							},
							bubbles: true,
						});
						window.dispatchEvent(event);
					} else {
						console.warn('[search-form] No postToFeedId set, cannot dispatch to Post Feed');
					}
					break;

				case 'map':
					// Dispatch event for Map block
					if (attributes.postToMapId) {
						const event = new CustomEvent('voxel-search-submit', {
							detail: {
								targetId: attributes.postToMapId,
								postType,
								filters,
							},
							bubbles: true,
						});
						window.dispatchEvent(event);
					}
					break;

				case 'refresh':
				default:
					// Update URL and reload page
					updateUrlAndRefresh(values, attributes);
					break;
			}
		};

		// Clear placeholder and create React root
		container.innerHTML = '';
		container.dataset.hydrated = 'true';

		const root = createRoot(container);
		root.render(
			<SearchFormWrapper
				attributes={attributes}
				onSubmit={handleSubmit}
			/>
		);
	});
}

/**
 * Update URL with filter values and refresh the page
 */
function updateUrlAndRefresh(
	values: Record<string, unknown>,
	attributes: SearchFormAttributes
) {
	const url = new URL(window.location.href);

	// Clear existing filter params
	// Support both Voxel format ('type', 'availability') and legacy FSE format ('post_type', 'filter_availability')
	const keysToRemove: string[] = [];
	url.searchParams.forEach((_, key) => {
		// Remove legacy FSE format
		if (key.startsWith('filter_') || key === 'post_type') {
			keysToRemove.push(key);
		}
		// Remove Voxel format (type)
		if (key === 'type') {
			keysToRemove.push(key);
		}
	});
	keysToRemove.forEach((key) => url.searchParams.delete(key));

	// Add current post type - VOXEL PARITY: Use 'type' not 'post_type'
	const postType = values.postType || attributes.postTypes?.[0];
	if (postType && typeof postType === 'string') {
		url.searchParams.set('type', postType);
	}

	// Add filter values - VOXEL PARITY: Use key directly without 'filter_' prefix
	Object.entries(values).forEach(([key, value]) => {
		if (key === 'postType') {
			return;
		}

		if (value === null || value === undefined || value === '') {
			return;
		}

		if (typeof value === 'object') {
			url.searchParams.set(key, JSON.stringify(value));
		} else {
			url.searchParams.set(key, String(value));
		}
	});

	// Navigate to new URL
	window.location.href = url.toString();
}

/**
 * Handle Post Feed ready events
 * When a Post Feed dispatches 'voxel-fse:post-feed-ready', the connected Search Form
 * should respond with its initial values.
 */
function handlePostFeedReady(event: Event) {
	const customEvent = event as CustomEvent<{
		blockId: string;
		searchFormId: string;
	}>;

	if (!customEvent.detail?.searchFormId) return;

	const { searchFormId } = customEvent.detail;

	// Check if the Search Form is already registered
	const dispatchFn = searchFormRegistry.get(searchFormId);
	if (dispatchFn) {
		// Search Form is ready, dispatch initial values
		dispatchFn();
	} else {
		// Search Form hasn't mounted yet, store the pending request
		// The Search Form will check for pending requests when it mounts
		if (!(window as any).__voxelFsePendingPostFeedReady) {
			(window as any).__voxelFsePendingPostFeedReady = {};
		}
		(window as any).__voxelFsePendingPostFeedReady[searchFormId] = customEvent.detail.blockId;
	}
}

// Set up global listener for Post Feed ready events
window.addEventListener('voxel-fse:post-feed-ready', handlePostFeedReady);

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initSearchForms);
} else {
	initSearchForms();
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', initSearchForms);
window.addEventListener('pjax:complete', initSearchForms);
