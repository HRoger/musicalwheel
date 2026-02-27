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
import type { SearchFormAttributes, PostTypeConfig, IconConfig, FilterConfig, FilterData } from './types';
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
		// Map/Feed switcher settings
		// Evidence: themes/voxel/templates/widgets/search-form.php:194-222
		mfSwitcherDesktop: normalizeBool(raw.mfSwitcherDesktop ?? raw.mf_switcher_desktop, false),
		mfSwitcherDesktopDefault: (raw.mfSwitcherDesktopDefault ?? raw.mf_switcher_desktop_default ?? 'feed') as 'feed' | 'map',
		mfSwitcherTablet: normalizeBool(raw.mfSwitcherTablet ?? raw.mf_switcher_tablet, false),
		mfSwitcherTabletDefault: (raw.mfSwitcherTabletDefault ?? raw.mf_switcher_tablet_default ?? 'feed') as 'feed' | 'map',
		mfSwitcherMobile: normalizeBool(raw.mfSwitcherMobile ?? raw.mf_switcher_mobile, false),
		mfSwitcherMobileDefault: (raw.mfSwitcherMobileDefault ?? raw.mf_switcher_mobile_default ?? 'feed') as 'feed' | 'map',
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
	onSubmit: (values: Record<string, unknown>, postTypeConfigs?: PostTypeConfig[]) => void;
	inlinePostTypes?: PostTypeConfig[] | null;
}

function SearchFormWrapper({ attributes, onSubmit, inlinePostTypes }: SearchFormWrapperProps) {
	const [postTypes, setPostTypes] = useState<PostTypeConfig[]>(inlinePostTypes || []);
	const [isLoading, setIsLoading] = useState(!inlinePostTypes || inlinePostTypes.length === 0);
	const [error, setError] = useState<string | null>(null);
	const hasDispatchedInitial = useRef(false);

	// Function to dispatch initial values to connected Post Feed
	// NOTE: This is now mainly used for the "ready" event handshake, not initial page load.
	// The Post Feed now fetches on mount using attributes.postType (matching Voxel's PHP behavior).
	const dispatchInitialValues = useCallback(() => {
		if (hasDispatchedInitial.current) return;

		const defaultPostType = attributes.postTypes?.[0] || '';
		if (!defaultPostType) return;

		// Don't dispatch if still loading - wait for data
		if (isLoading || postTypes.length === 0) {
			return;
		}

		// Build initial filter values from loaded post type config
		// The REST API returns filterData.value for each filter based on defaultValue config
		const initialFilterValues: Record<string, unknown> = {};
		const postTypeConfig = postTypes.find((pt) => pt.key === defaultPostType);
		if (postTypeConfig?.filters) {
			postTypeConfig.filters.forEach((filterData: FilterData) => {
				if (filterData.value !== null && filterData.value !== undefined) {
					initialFilterValues[filterData.key] = filterData.value;
				}
			});
		}

		// Call onSubmit with initial values INCLUDING default filters
		onSubmit({
			postType: defaultPostType,
			...initialFilterValues,
		}, postTypes);

		hasDispatchedInitial.current = true;
	}, [attributes.postTypes, onSubmit, isLoading, postTypes]);

	useEffect(() => {
		// Skip REST fetch if we have inline data from server-side config injection
		// See: docs/headless-architecture/17-server-side-config-injection.md
		if (inlinePostTypes && inlinePostTypes.length > 0) {
			return;
		}

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
	}, [inlinePostTypes, attributes.postTypes, attributes.filterLists]);

	// Register this Search Form in the global registry for Post Feed connection
	// NOTE: The Post Feed now fetches on mount, so this registry is mainly for edge cases
	// where the Post Feed needs to get filter values after the initial load.
	useEffect(() => {
		const blockId = attributes.blockId;
		if (!blockId) return;

		// Register the dispatch function
		searchFormRegistry.set(blockId, dispatchInitialValues);

		return () => {
			searchFormRegistry.delete(blockId);
		};
	}, [attributes.blockId, dispatchInitialValues]);

	// NOTE: Removed the "auto-dispatch on mount" effect.
	// The Post Feed now fetches on mount using attributes.postType, matching Voxel's PHP behavior.
	// The Search Form only needs to dispatch when filters CHANGE (handled by useSearchForm hook).

	// Wrap onSubmit to pass postTypes (with archiveUrl) to parent callback
	// This ensures the parent handleSubmit always has access to archive URLs
	// regardless of whether data came from inline config or REST API
	// IMPORTANT: Must be before early returns to maintain hook order
	const handleSubmitWithPostTypes = useCallback((values: Record<string, unknown>) => {
		onSubmit(values, postTypes);
	}, [onSubmit, postTypes]);

	// Loading state - matches Voxel's v-cloak pattern (display: none until ready)
	// Since React renders when ready, we just show a simple loader without custom classes
	if (isLoading) {
		return (
			<div className="ts-form ts-search-widget">
				<div className="ts-filter-wrapper flexify">
					<div className="ts-no-posts">
						<span className="ts-loader"></span>
					</div>
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
			onSubmit={handleSubmitWithPostTypes}
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

		// Read inline config data injected by PHP render_block filter (eliminates REST API spinner)
		// See: docs/headless-architecture/17-server-side-config-injection.md
		const hydrateScript = container.querySelector<HTMLScriptElement>('script.vxconfig-hydrate');
		let inlinePostTypes: PostTypeConfig[] | null = null;
		if (hydrateScript?.textContent) {
			try {
				inlinePostTypes = JSON.parse(hydrateScript.textContent);
			} catch (e) {
				console.error('[SF-HYDRATE] parse error:', e);
				// Fall back to REST API if inline data is malformed
			}
		}

		// Handle form submission
		// postTypeConfigs is passed from SearchFormWrapper (has archiveUrl from REST API or inline config)
		const handleSubmit = (values: Record<string, unknown>, postTypeConfigs?: PostTypeConfig[]) => {
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
								// Map integration: tell Post Feed to include marker data
								// Evidence: voxel-search-form.beautified.js:2086-2091
								// Voxel adds __load_markers=yes when mapWidget !== null
								hasMapWidget: !!attributes.postToMapId,
								mapAdditionalMarkers: attributes.mapAdditionalMarkers ?? 0,
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
						updateUrlAndRefresh(values, attributes, postTypeConfigs);
					}
					break;

				case 'archive':
				default:
					// Update URL and reload page (archive mode)
					// Use postTypeConfigs from React component (always has archiveUrl)
					updateUrlAndRefresh(values, attributes, postTypeConfigs);
					break;
			}
		};

		// Mount React into the container.
		// When inlinePostTypes is available, React renders the full form on first paint
		// (no loading spinner). We keep the server HTML visible until React replaces it,
		// matching Voxel's v-cloak pattern where content stays visible until Vue mounts.
		// React 18's createRoot().render() replaces container children automatically.
		dataset.hydrated = 'true';

		const root = createRoot(container);
		root.render(
			<SearchFormWrapper
				attributes={attributes}
				onSubmit={handleSubmit}
				inlinePostTypes={inlinePostTypes}
			/>
		);
	});
}

/**
 * Navigate to post type archive with filter values (archive mode)
 *
 * VOXEL PARITY: Replicates voxel-search-form.beautified.js:2025-2030
 * 1. Base URL = post_type.archive (from Post_Type::get_archive_link())
 * 2. Params = currentValues (filter values only, NO 'type' param)
 * 3. Redirect: archiveUrl?filterKey=value&...
 *
 * Evidence: voxel-search-form.beautified.js:2027 - jQuery.param(this.currentValues)
 * Evidence: voxel-search-form.beautified.js:3039-3048 - currentValues has filter values only
 */
function updateUrlAndRefresh(values: Record<string, unknown>, _attributes: SearchFormAttributes, postTypeConfigs?: PostTypeConfig[] | null) {
	const valuesTyped = values as { postType?: string };
	const postType = valuesTyped.postType;

	// Get archive URL from post type config
	// Evidence: search-form.php:4168 - 'archive' => $post_type->get_archive_link()
	let archiveUrl = '';
	if (postType && postTypeConfigs) {
		const ptConfig = postTypeConfigs.find((pt) => pt.key === postType);
		if (ptConfig?.archiveUrl) {
			archiveUrl = ptConfig.archiveUrl;
		}
	}

	// Fallback: if no archive URL, use current page
	if (!archiveUrl) {
		archiveUrl = window.location.origin + window.location.pathname;
	}

	// Build params from filter values only (no 'type' param)
	// Evidence: voxel-search-form.beautified.js:3039-3048 - currentValues only has filter values
	const params = new URLSearchParams();
	Object.entries(values).forEach(([key, value]) => {
		// Skip postType — it's not a filter param in archive mode
		if (key === 'postType') {
			return;
		}
		if (value === null || value === undefined || value === '') {
			return;
		}
		if (typeof value === 'object') {
			params.set(key, JSON.stringify(value));
		} else {
			params.set(key, String(value));
		}
	});

	// Build final URL: archiveUrl + ?params
	// Evidence: voxel-search-form.beautified.js:2028-2029
	let finalUrl = archiveUrl;
	const paramString = params.toString();
	if (paramString.length) {
		finalUrl += '?' + paramString;
	}

	window.location.href = finalUrl;
}

/**
 * Redirect to a specific page with filter values (page mode)
 *
 * VOXEL PARITY: Replicates voxel-search-form.beautified.js:2031-2035
 * Uses pageLink + ?currentQueryString (includes type + filter values)
 * Evidence: voxel-search-form.beautified.js:3054-3065 - currentQueryString includes type param
 */
function redirectToPage(values: Record<string, unknown>, attributes: SearchFormAttributes) {
	const valuesTyped = values as { postType?: string };

	// Build query params matching Voxel's currentQueryString format
	// Evidence: voxel-search-form.beautified.js:3057 - starts with type: this.post_type.key
	const params = new URLSearchParams();

	const postType = valuesTyped.postType || attributes.postTypes?.[0];
	if (postType && typeof postType === 'string') {
		params.set('type', postType);
	}

	Object.entries(values).forEach(([key, value]) => {
		if (key === 'postType') {
			return;
		}
		if (value === null || value === undefined || value === '') {
			return;
		}
		if (typeof value === 'object') {
			params.set(key, JSON.stringify(value));
		} else {
			params.set(key, String(value));
		}
	});

	// Navigate to page: pageLink + ?queryString
	// Evidence: voxel-search-form.beautified.js:2034
	// Fallback to ?p=ID format if no permalink available
	const siteUrl = (window as any).voxelFseSiteUrl || window.location.origin;
	const pageLink = siteUrl + '/?p=' + String(attributes.submitToPageId);
	const paramString = params.toString();
	window.location.href = pageLink + (paramString.length ? '&' + paramString : '');
}

/**
 * Handle Post Feed ready events (LEGACY - kept for backwards compatibility)
 *
 * NOTE: The Post Feed now fetches on mount using attributes.postType, matching Voxel's
 * server-side PHP rendering pattern. This handler is kept for edge cases where a
 * Post Feed might need to get filter values from Search Form after initial load.
 */
function handlePostFeedReady(event: Event) {
	const customEvent = event as CustomEvent<{
		blockId: string;
		searchFormId: string;
	}>;

	if (!customEvent.detail?.searchFormId) return;

	const { searchFormId } = customEvent.detail;

	// Try to dispatch if Search Form is registered
	const dispatchFn = searchFormRegistry.get(searchFormId);
	if (dispatchFn) {
		dispatchFn();
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
