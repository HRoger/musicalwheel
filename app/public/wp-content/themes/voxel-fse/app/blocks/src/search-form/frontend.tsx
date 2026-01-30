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
 * VOXEL PARITY STATUS - 100% Feature Complete
 * ============================================================================
 *
 * Reference: docs/block-conversions/search-form/voxel-search-form.beautified.js (3,136 lines)
 *
 * FILTER COMPONENTS (20 implemented - matches Voxel registry):
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
 * ✅ FilterFollowedBy - Posts followed by user (same component as Following)
 * ✅ FilterFollowingPost - Posts following another post
 * ✅ FilterOpenNow - Open now toggle
 * ✅ FilterPostStatus - Post status filter
 * ✅ FilterSwitcher - Toggle switcher
 * ✅ FilterOrderBy - Sort order dropdown with proximity sorting
 * ✅ FilterUIHeading - Section heading
 *
 * CORE FEATURES:
 * ✅ HTML structure matches (ts-form, ts-search-widget, ts-filter-wrapper)
 * ✅ Post type switching with filter reset
 * ✅ URL state persistence (Voxel format: type, filter keys without prefix)
 * ✅ Custom events (voxel-search-submit for Post Feed/Map)
 * ✅ Loading/error states with proper classes
 * ✅ Portal mode for responsive toggle
 * ✅ Turbo/PJAX support
 * ✅ Adaptive filtering with _last_modified optimization
 * ✅ Filter-dependent conditions (filterConditionHandlers)
 * ✅ Map integration events (useBounds, dragSearch, searchArea)
 *
 * FILTER CONDITIONS SYSTEM (100% Voxel parity):
 * ✅ common:is_empty, common:is_not_empty
 * ✅ text:equals, text:not_equals, text:contains
 * ✅ taxonomy:contains, taxonomy:not_contains
 * ✅ number:equals, number:not_equals, number:gt, number:gte, number:lt, number:lte
 * ✅ conditions_behavior: 'show' | 'hide'
 * ✅ OR between groups, AND within groups
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
import type { SearchFormAttributes, PostTypeConfig, IconConfig, FilterConfig } from './types';
import type { SearchFormDataset, SearchFormRawConfig } from './types/dataset';
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
	// Cast dataset to our custom typed interface
	const dataset = container.dataset as SearchFormDataset;

	// Helper to parse number or undefined
	const parseNumber = (value: string | undefined): number | undefined => {
		if (!value || value === '') return undefined;
		const num = Number(value);
		return isNaN(num) ? undefined : num;
	};

	return {
		blockId: container.id || '',
		postTypes: parseJson(dataset.postTypes, []) as string[],
		selectedPostType: '', // Default for frontend hydration
		showPostTypeFilter: parseBool(dataset.showPostTypeFilter),
		postTypeFilterWidth: parseNumber(dataset.postTypeFilterWidth),
		postTypeFilterWidth_tablet: parseNumber(dataset.postTypeFilterWidthTablet),
		postTypeFilterWidth_mobile: parseNumber(dataset.postTypeFilterWidthMobile),
		filterLists: parseJson(dataset.filterLists, {}) as Record<string, FilterConfig[]>,
		onSubmit: (dataset.onSubmit as 'feed' | 'archive' | 'page') || 'feed',
		postToFeedId: dataset.postToFeedId || '',
		postToMapId: dataset.postToMapId || '',
		searchOn: (dataset.searchOn as 'change' | 'submit') || 'submit',
		showSearchButton: parseBool(dataset.showSearchButton),
		searchButtonText: dataset.searchButtonText ?? '',
		searchButtonIcon: parseJson(dataset.searchButtonIcon, { library: '', value: '' }) as IconConfig,
		searchButtonWidth: parseNumber(dataset.searchButtonWidth),
		searchButtonWidth_tablet: parseNumber(dataset.searchButtonWidthTablet),
		searchButtonWidth_mobile: parseNumber(dataset.searchButtonWidthMobile),
		searchButtonWidthUnit: dataset.searchButtonWidthUnit || '%',
		showResetButton: parseBool(dataset.showResetButton),
		resetButtonText: dataset.resetButtonText ?? '',
		resetButtonIcon: parseJson(dataset.resetButtonIcon, { library: '', value: '' }) as IconConfig,
		resetButtonWidth: parseNumber(dataset.resetButtonWidth),
		resetButtonWidth_tablet: parseNumber(dataset.resetButtonWidthTablet),
		resetButtonWidth_mobile: parseNumber(dataset.resetButtonWidthMobile),
		resetButtonWidthUnit: dataset.resetButtonWidthUnit || '%',
		voxelIntegration: parseBool(dataset.voxelIntegration),
		adaptiveFiltering: parseBool(dataset.adaptiveFiltering),
		portalMode: parseJson(dataset.portalMode, { desktop: false, tablet: true, mobile: true }) as {
			desktop: boolean;
			tablet: boolean;
			mobile: boolean;
		},
		formToggleDesktop: parseBool(dataset.formToggleDesktop),
		formToggleTablet: parseBool(dataset.formToggleTablet),
		formToggleMobile: parseBool(dataset.formToggleMobile),
		toggleText: dataset.toggleText || 'Filter results',
		toggleIcon: parseJson(dataset.toggleIcon, { library: '', value: '' }) as IconConfig,
	};
}

/**
 * Fetch post types configuration from REST API
 *
 * CRITICAL: For proper 1:1 Voxel parity, this function now sends filter configs
 * via POST, allowing the PHP controller to:
 * 1. Call $filter->set_value() before frontend_props()
 * 2. Call $filter->resets_to() based on resetValue config
 * 3. Return proper `value` and `resets_to` in the response
 *
 * Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
 */
async function fetchPostTypes(
	postTypeKeys: string[],
	filterLists?: Record<string, unknown>
): Promise<PostTypeConfig[]> {
	if (!postTypeKeys || postTypeKeys.length === 0) {
		return [];
	}

	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/search-form/frontend-config?post_types=${encodeURIComponent(postTypeKeys.join(','))}`;

	try {
		// Build filter_configs object for the API
		// Transform FilterConfig[] to the format expected by PHP controller
		const apiFilterConfigs: Record<
			string,
			Record<
				string,
				{
					defaultValueEnabled?: boolean;
					defaultValue?: unknown;
					resetValue?: string;
				}
			>
		> = {};

		if (filterLists) {
			Object.entries(filterLists).forEach(([postTypeKey, configs]) => {
				if (Array.isArray(configs)) {
					apiFilterConfigs[postTypeKey] = {};
					configs.forEach(
						(config: {
							filterKey?: string;
							defaultValueEnabled?: boolean;
							defaultValue?: unknown;
							resetValue?: string;
						}) => {
							if (config.filterKey) {
								apiFilterConfigs[postTypeKey][config.filterKey] = {
									defaultValueEnabled: config.defaultValueEnabled,
									defaultValue: config.defaultValue,
									resetValue: config.resetValue,
								};
							}
						}
					);
				}
			});
		}

		// Use POST if we have filter configs for proper value/resets_to handling
		const hasFilterConfigs = Object.keys(apiFilterConfigs).length > 0;

		const response = await fetch(endpoint, {
			method: hasFilterConfigs ? 'POST' : 'GET',
			headers: hasFilterConfigs ? { 'Content-Type': 'application/json' } : undefined,
			body: hasFilterConfigs ? JSON.stringify({ filter_configs: apiFilterConfigs }) : undefined,
		});

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
function normalizeConfig(rawInput: Record<string, unknown>): SearchFormAttributes {
	// Cast to typed interface for proper type checking
	const raw = rawInput as SearchFormRawConfig;
	// Helper for boolean normalization
	const normalizeBool = (val: unknown, fallback: boolean): boolean => {
		if (typeof val === 'boolean') return val;
		if (val === 'true') return true;
		if (val === 'false') return false;
		return fallback;
	};

	// Helper for portal mode normalization
	const normalizePortalMode = (
		val: unknown
	): { desktop: boolean; tablet: boolean; mobile: boolean } => {
		if (val && typeof val === 'object') {
			const v = val as { desktop?: unknown; tablet?: unknown; mobile?: unknown };
			return {
				desktop: normalizeBool(v.desktop, false),
				tablet: normalizeBool(v.tablet, true),
				mobile: normalizeBool(v.mobile, true),
			};
		}
		return { desktop: false, tablet: true, mobile: true };
	};

	// Helper for icon normalization
	const normalizeIcon = (val: unknown): IconConfig => {
		if (val && typeof val === 'object') return val as IconConfig;
		return { library: '', value: '' };
	};

	// Extract post types - handle both array of strings and array of objects
	const rawPostTypes = (raw.postTypes ?? raw.post_types ?? []) as unknown[];
	const postTypes = rawPostTypes
		.map((pt) => {
			if (typeof pt === 'string') return pt;
			if (pt && typeof pt === 'object' && 'key' in pt)
				return (pt as { key?: string }).key || '';
			return '';
		})
		.filter(Boolean);

	return {
		blockId: (raw.blockId ?? raw.block_id ?? '') as string,
		postTypes,
		selectedPostType: postTypes[0] || '', // Default to first post type
		showPostTypeFilter: normalizeBool(raw.showPostTypeFilter ?? raw.show_post_type_filter, true),
		filterLists: (raw.filterLists ?? raw.filter_lists ?? {}) as Record<string, FilterConfig[]>,
		onSubmit: (raw.onSubmit ?? raw.on_submit ?? 'feed') as 'feed' | 'archive' | 'page',
		postToFeedId: (raw.postToFeedId ?? raw.post_to_feed_id ?? '') as string,
		postToMapId: (raw.postToMapId ?? raw.post_to_map_id ?? '') as string,
		searchOn: (raw.searchOn ?? raw.search_on ?? 'submit') as 'change' | 'submit',
		// URL and map integration settings
		updateUrl: normalizeBool(raw.updateUrl ?? raw.update_url, true),
		submitToPageId: (raw.submitToPageId ?? raw.submit_to_page_id) as number | undefined,
		mapAdditionalMarkers: (raw.mapAdditionalMarkers ?? raw.map_additional_markers ?? 0) as number,
		mapEnableClusters: normalizeBool(raw.mapEnableClusters ?? raw.map_enable_clusters, true),
		// Search button settings
		showSearchButton: normalizeBool(raw.showSearchButton ?? raw.show_search_button, true),
		searchButtonText: (raw.searchButtonText ?? raw.search_button_text ?? '') as string,
		searchButtonIcon: normalizeIcon(raw.searchButtonIcon ?? raw.search_button_icon),
		searchButtonWidth: raw.searchButtonWidth as number | undefined,
		searchButtonWidth_tablet: (raw.searchButtonWidth_tablet ?? raw.search_button_width_tablet) as
			| number
			| undefined,
		searchButtonWidth_mobile: (raw.searchButtonWidth_mobile ?? raw.search_button_width_mobile) as
			| number
			| undefined,
		searchButtonWidthUnit: (raw.searchButtonWidthUnit ??
			raw.search_button_width_unit ??
			'%') as string,
		showResetButton: normalizeBool(raw.showResetButton ?? raw.show_reset_button, false),
		resetButtonText: (raw.resetButtonText ?? raw.reset_button_text ?? '') as string,
		resetButtonIcon: normalizeIcon(raw.resetButtonIcon ?? raw.reset_button_icon),
		resetButtonWidth: raw.resetButtonWidth as number | undefined,
		resetButtonWidth_tablet: (raw.resetButtonWidth_tablet ?? raw.reset_button_width_tablet) as
			| number
			| undefined,
		resetButtonWidth_mobile: (raw.resetButtonWidth_mobile ?? raw.reset_button_width_mobile) as
			| number
			| undefined,
		resetButtonWidthUnit: (raw.resetButtonWidthUnit ??
			raw.reset_button_width_unit ??
			'%') as string,
		voxelIntegration: normalizeBool(raw.voxelIntegration ?? raw.voxel_integration, true),
		adaptiveFiltering: normalizeBool(raw.adaptiveFiltering ?? raw.adaptive_filtering, false),
		portalMode: normalizePortalMode(raw.portalMode ?? raw.portal_mode),
		formToggleDesktop: normalizeBool(raw.formToggleDesktop ?? raw.form_toggle_desktop, false),
		formToggleTablet: normalizeBool(raw.formToggleTablet ?? raw.form_toggle_tablet, true),
		formToggleMobile: normalizeBool(raw.formToggleMobile ?? raw.form_toggle_mobile, true),
		toggleText: (raw.toggleText ?? raw.toggle_text ?? 'Filter results') as string,
		toggleIcon: normalizeIcon(raw.toggleIcon ?? raw.toggle_icon),
		// Post type filter width
		postTypeFilterWidth: raw.postTypeFilterWidth as number | undefined,
		postTypeFilterWidth_tablet: (raw.postTypeFilterWidth_tablet ??
			raw.post_type_filter_width_tablet) as number | undefined,
		postTypeFilterWidth_mobile: (raw.postTypeFilterWidth_mobile ??
			raw.post_type_filter_width_mobile) as number | undefined,
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
			const rawConfig = JSON.parse(vxconfigScript.textContent) as SearchFormRawConfig;
			const dataset = container.dataset as SearchFormDataset;

			// Merge with data attributes for submission handling
			// (onSubmit, postToFeedId, postToMapId are set via data attributes)
			const mergedConfig: SearchFormRawConfig = {
				...rawConfig,
				blockId: rawConfig.blockId || container.id || '',
				onSubmit: dataset.onSubmit || rawConfig.onSubmit || 'refresh',
				postToFeedId: dataset.postToFeedId || rawConfig.postToFeedId || '',
				postToMapId: dataset.postToMapId || rawConfig.postToMapId || '',
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
				// Pass filterLists to enable proper value/resets_to from PHP
				// Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
				const data = await fetchPostTypes(attributes.postTypes || [], attributes.filterLists);
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
	}, [attributes.postTypes, attributes.filterLists]);

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
	const selectedPostTypes = postTypes.filter((pt) => attributes.postTypes?.includes(pt.key));

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
	const searchForms = document.querySelectorAll<HTMLElement>('.voxel-fse-search-form');

	searchForms.forEach((container) => {
		const dataset = container.dataset as { hydrated?: string };

		// Skip if already hydrated
		if (dataset.hydrated === 'true') {
			return;
		}

		// Parse attributes from vxconfig (matching Voxel pattern)
		const attributes = parseVxConfig(container);

		// Handle form submission
		const handleSubmit = (values: Record<string, unknown>) => {
			const valuesTyped = values as { postType?: string };
			// Extract postType from values (set by useSearchForm hook)
			const postType = valuesTyped.postType || attributes.postTypes?.[0] || '';

			// Remove postType from filters (it's not a filter, it's a top-level param)
			const { postType: _, ...filters } = values;

			switch (attributes.onSubmit) {
				case 'feed':
					// Dispatch event for Post Feed block
					if (attributes.postToFeedId) {
						const feedEvent = new CustomEvent('voxel-search-submit', {
							detail: {
								targetId: attributes.postToFeedId,
								postType,
								filters,
							},
							bubbles: true,
						});
						window.dispatchEvent(feedEvent);

						// Also dispatch to Map block if connected
						if (attributes.postToMapId) {
							const mapEvent = new CustomEvent('voxel-search-submit', {
								detail: {
									targetId: attributes.postToMapId,
									postType,
									filters,
									// Map integration settings
									mapAdditionalMarkers: attributes.mapAdditionalMarkers ?? 0,
									mapEnableClusters: attributes.mapEnableClusters ?? true,
								},
								bubbles: true,
							});
							window.dispatchEvent(mapEvent);
						}
					} else {
						console.warn('[search-form] No postToFeedId set, cannot dispatch to Post Feed');
					}
					break;

				case 'page':
					// Redirect to a specific page with filter parameters
					if (attributes.submitToPageId) {
						redirectToPage(values, attributes);
					} else {
						// Fallback to archive if no page ID set
						updateUrlAndRefresh(values, attributes);
					}
					break;

				case 'archive':
				default:
					// Update URL and reload page (archive mode)
					updateUrlAndRefresh(values, attributes);
					break;
			}
		};

		// Clear placeholder and create React root
		container.innerHTML = '';
		dataset.hydrated = 'true';

		const root = createRoot(container);
		root.render(<SearchFormWrapper attributes={attributes} onSubmit={handleSubmit} />);
	});
}

/**
 * Update URL with filter values and refresh the page
 */
function updateUrlAndRefresh(values: Record<string, unknown>, attributes: SearchFormAttributes) {
	const valuesTyped = values as { postType?: string };
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
	const postType = valuesTyped.postType || attributes.postTypes?.[0];
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
 * Redirect to a specific page with filter values
 * Used when onSubmit='page' and submitToPageId is set
 */
function redirectToPage(values: Record<string, unknown>, attributes: SearchFormAttributes) {
	const valuesTyped = values as { postType?: string };
	// Get the site URL from WordPress or fallback to origin
	const siteUrl = (window as any).voxelFseSiteUrl || window.location.origin;

	// Build URL using WordPress ?p={id} format
	// WordPress will automatically redirect to the proper permalink
	const url = new URL(siteUrl);
	url.searchParams.set('p', String(attributes.submitToPageId));

	// Add current post type - VOXEL PARITY: Use 'type' not 'post_type'
	const postType = valuesTyped.postType || attributes.postTypes?.[0];
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

	// Navigate to target page
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
