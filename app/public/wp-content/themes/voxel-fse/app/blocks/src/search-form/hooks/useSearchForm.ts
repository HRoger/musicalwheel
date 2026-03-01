/**
 * useSearchForm Hook
 *
 * Manages the state and logic for the search form.
 *
 * ADAPTIVE FILTERING (Voxel Parity):
 * When adaptiveFiltering is enabled, the hook fetches narrowed values
 * from the server when filter values change. This updates:
 * - Range filters: min/max bounds based on current results
 * - Terms filters: available terms based on current results
 *
 * Reference: voxel-search-form.beautified.js lines 1216-1238
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { SearchFormState, SearchFormAttributes, PostTypeConfig, NarrowedValues, FilterData } from '../types';
import { getRestBaseUrl } from '@shared/utils/siteUrl';

interface UseSearchFormProps {
	attributes: SearchFormAttributes;
	postTypes: PostTypeConfig[];
	context: 'editor' | 'frontend';
	onSubmit?: (values: Record<string, unknown>) => void;
	/**
	 * Callback when post type changes in editor context
	 * Used to sync selectedPostType attribute for Post Feed preview
	 */
	onPostTypeChange?: (postTypeKey: string) => void;
	/**
	 * Callback when filter values change in editor context
	 * Used to sync editorFilterValues attribute for Post Feed preview
	 */
	onFilterChange?: (filterValues: Record<string, unknown>) => void;
}

interface UseSearchFormReturn {
	state: SearchFormState;
	setCurrentPostType: (postTypeKey: string) => void;
	setFilterValue: (filterKey: string, value: unknown) => void;
	clearAll: (closePortal?: boolean) => void;
	togglePortal: () => void;
	submit: () => void;
	currentPostTypeConfig: PostTypeConfig | undefined;
	filterConfigs: Array<{
		id: string;
		filterKey: string;
		[key: string]: unknown;
	}>;
	/** Narrowed values from adaptive filtering */
	narrowedValues: NarrowedValues | null;
	/** Whether adaptive filtering is in progress */
	narrowingFilters: boolean;
}

export function useSearchForm({
	attributes,
	postTypes,
	context,
	onSubmit,
	onPostTypeChange,
	onFilterChange,
}: UseSearchFormProps): UseSearchFormReturn {
	// Initialize state
	const [state, setState] = useState<SearchFormState>(() => ({
		currentPostType: attributes.postTypes[0] || '',
		filterValues: {},
		activeFilterCount: 0,
		portalActive: false,
		loading: false,
		resetting: false,
		narrowedValues: null,
		narrowingFilters: false,
		lastModifiedFilter: null, // Voxel optimization for adaptive filtering
	}));

	// Ref to track if we should skip the next adaptive filtering call
	// (to prevent loops when we update values based on narrowed results)
	const suspendedUpdateRef = useRef(false);

	// VOXEL PARITY: Track whether user has interacted with the form
	// Voxel sets previousQueryString = currentQueryString on mount, so the first
	// getPosts() call detects no change and skips URL update.
	// We replicate this by skipping URL updates until user actually interacts.
	// Evidence: voxel-search-form.beautified.js line 1991 (mounted), 2058 (getPosts early exit)
	const hasUserInteractedRef = useRef(false);

	// Debounce timer for adaptive filtering
	const adaptiveFilterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Get current post type config
	const currentPostTypeConfig = useMemo(
		() => postTypes.find((pt) => pt.key === state.currentPostType),
		[postTypes, state.currentPostType]
	);

	// Get filter configs for current post type
	const filterConfigs = useMemo(
		() => attributes.filterLists[state.currentPostType] || [],
		[attributes.filterLists, state.currentPostType]
	);

	// Update current post type when attributes change
	useEffect(() => {
		if (attributes.postTypes.length > 0 && !attributes.postTypes.includes(state.currentPostType)) {
			setState((prev) => ({
				...prev,
				currentPostType: attributes.postTypes[0],
				filterValues: {},
			}));
		}
	}, [attributes.postTypes, state.currentPostType]);

	// Initialize filter values from filterData.value (REST API response)
	// CRITICAL: The PHP controller now properly sets filter values via set_value()
	// before returning frontend_config, so filterData.value is the source of truth
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:101
	// 'value' => $is_valid_value ? $this->get_value() : null
	useEffect(() => {
		if (!currentPostTypeConfig?.filters) return;

		const defaultValues: Record<string, unknown> = {};
		let hasDefaults = false;

		currentPostTypeConfig.filters.forEach((filterData: FilterData) => {
			// Skip if we already have a value (or explicitly null) for this filter
			// null means "explicitly set to empty" (e.g., after clearAll with resetValue: 'empty')
			// undefined means "not yet initialized"
			if (filterData.key in state.filterValues) {
				return;
			}

			// Use filterData.value from REST API (1:1 Voxel parity)
			// The PHP controller sets this based on defaultValueEnabled + defaultValue config
			if (filterData.value !== null && filterData.value !== undefined) {
				defaultValues[filterData.key] = filterData.value;
				hasDefaults = true;
			}
		});

		if (hasDefaults) {
			setState((prev) => ({
				...prev,
				filterValues: { ...prev.filterValues, ...defaultValues },
			}));
		}
	}, [currentPostTypeConfig?.filters, state.currentPostType]);

	// EDITOR CONTEXT: Sync state with config.defaultValue changes
	// When the user changes the Default Value in the inspector, we need to update the state
	// This ensures the preview reflects the new value immediately
	// Note: This should NOT run after clearAll (when resetting is true)
	useEffect(() => {
		if (context !== 'editor' || state.resetting) return;
		if (!currentPostTypeConfig?.filters) return;

		const currentFilterConfigs = attributes.filterLists?.[state.currentPostType] || [];

		currentFilterConfigs.forEach((filterConfig: { filterKey: string; defaultValue?: unknown; defaultValueEnabled?: boolean }) => {
			const currentStateValue = state.filterValues[filterConfig.filterKey];

			// If defaultValueEnabled is ON and has a valid value
			if (filterConfig.defaultValueEnabled && filterConfig.defaultValue !== undefined && filterConfig.defaultValue !== '' && filterConfig.defaultValue !== null) {
				// Only update if the state value differs from config default
				// AND the state value wasn't explicitly set to null (from clearAll)
				if (currentStateValue !== filterConfig.defaultValue && currentStateValue !== null) {
					setState((prev) => ({
						...prev,
						filterValues: {
							...prev.filterValues,
							[filterConfig.filterKey]: filterConfig.defaultValue,
						},
					}));
				}
			} else {
				// defaultValueEnabled is OFF or defaultValue is empty
				// If we have a non-null state value, clear it (but not if it's already null from clearAll)
				if (currentStateValue !== undefined && currentStateValue !== null) {
					setState((prev) => ({
						...prev,
						filterValues: {
							...prev.filterValues,
							[filterConfig.filterKey]: undefined,
						},
					}));
				}
			}
		});
	}, [context, state.currentPostType, attributes.filterLists, state.resetting, currentPostTypeConfig?.filters]);

	// Calculate active filter count
	useEffect(() => {
		const count = Object.values(state.filterValues).filter(
			(value) => value !== null && value !== undefined && value !== '' && value !== false
		).length;
		setState((prev) => ({
			...prev,
			activeFilterCount: count,
		}));
	}, [state.filterValues]);

	// Set current post type
	const setCurrentPostType = useCallback((postTypeKey: string) => {
		setState((prev) => {
			// Skip if already the current post type (prevent loops)
			if (prev.currentPostType === postTypeKey) {
				return prev;
			}
			return {
				...prev,
				currentPostType: postTypeKey,
				filterValues: {}, // Clear filter values when switching post type
			};
		});

		// In editor context: notify parent to update selectedPostType attribute
		// This syncs the Post Feed preview to show posts of the selected type
		if (context === 'editor' && onPostTypeChange) {
			onPostTypeChange(postTypeKey);
		}

		// In editor context: also clear filter values attribute
		if (context === 'editor' && onFilterChange) {
			onFilterChange({});
		}

		// Notify linked navbar blocks of post type change (bidirectional sync)
		// Evidence: voxel-search-form.beautified.js:2367-2373 $watch('post_type')
		if (context === 'frontend') {
			window.dispatchEvent(new CustomEvent('voxel-search-form-post-type-changed', {
				detail: { searchFormId: attributes.blockId, postType: postTypeKey },
			}));
		}

		// Auto-submit on post type change in frontend context
		// VOXEL PARITY: Only auto-submit in 'feed' mode (post-to-feed).
		// In 'archive' and 'page' modes, post type change just updates internal state.
		// The actual navigation only happens when the Search button is clicked.
		// Evidence: voxel-search-form.beautified.js:2016-2017 setPostType() just sets this.post_type
		// Evidence: search-form.php:158 ts_search_on only applies to post-to-feed mode
		if (context === 'frontend' && onSubmit && attributes.onSubmit === 'feed') {
			// VOXEL PARITY: Only update URL after user has interacted with the form
			// On initial load, Voxel skips URL update because previousQueryString === currentQueryString
			// Evidence: voxel-search-form.beautified.js line 2058
			if (hasUserInteractedRef.current && attributes.updateUrl !== false) {
				updateUrlParams({}, postTypeKey);
			}
			// Mark as interacted for next time (post type switch IS a user interaction)
			hasUserInteractedRef.current = true;
			setTimeout(() => {
				onSubmit({
					postType: postTypeKey,
				});
			}, 50);
		} else if (context === 'frontend') {
			// In archive/page modes, still mark as interacted for the submit button
			hasUserInteractedRef.current = true;
		}
	}, [context, onSubmit, onPostTypeChange, onFilterChange, attributes.updateUrl, attributes.onSubmit]);

	// Set individual filter value
	const setFilterValue = useCallback(
		(filterKey: string, value: unknown) => {
			// Mark that user has interacted with the form (for URL update logic)
			hasUserInteractedRef.current = true;
			setState((prev) => {
				const newFilterValues = {
					...prev.filterValues,
					[filterKey]: value,
				};

				// In editor context: notify parent to sync filter values to attributes
				// This enables Post Feed preview to update when filters change
				if (context === 'editor' && onFilterChange) {
					// Use setTimeout to ensure state is updated before callback
					setTimeout(() => onFilterChange(newFilterValues), 0);
				}

				return {
					...prev,
					filterValues: newFilterValues,
					// Track which filter was modified (Voxel optimization)
					// This allows backend to only recalculate affected adaptive filters
					// Reference: voxel-search-form.beautified.js lines 1510-1522
					lastModifiedFilter: filterKey,
				};
			});
			// Note: Auto-submit on change is handled by useEffect watching filterValues
		},
		[context, onFilterChange]
	);

	// Clear all filters
	// CRITICAL: Uses filterData.resets_to from API response (1:1 Voxel parity)
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:103
	// The PHP controller now sets resets_to based on resetValue config
	const clearAll = useCallback((closePortal = false) => {
		// Calculate reset values using filterData.resets_to from the API
		// IMPORTANT: We must set ALL filters to a value (either resets_to or null)
		// so the initialization useEffect doesn't re-add defaults after reset
		const resetValues: Record<string, unknown> = {};

		// Use filterData.resets_to from the API response (set by PHP controller)
		// This is the 1:1 Voxel parity approach - PHP decides what filters reset to
		currentPostTypeConfig?.filters?.forEach((filterData: FilterData) => {
			// If resets_to is set (not null/undefined), use it
			// This means the PHP controller determined this filter resets to a default value
			if (filterData.resets_to !== null && filterData.resets_to !== undefined) {
				resetValues[filterData.key] = filterData.resets_to;
			} else {
				// Set to null explicitly to prevent re-initialization from adding defaults back
				// This ensures the filter is considered "set" (to empty) rather than "unset"
				resetValues[filterData.key] = null;
			}
		});

		// Count only non-null values for active filter count
		const activeCount = Object.values(resetValues).filter(
			(v) => v !== null && v !== undefined && v !== ''
		).length;

		setState((prev) => ({
			...prev,
			filterValues: resetValues,
			activeFilterCount: activeCount,
			resetting: true,
			portalActive: closePortal ? false : prev.portalActive,
			narrowedValues: null, // Clear adaptive filtering state
			lastModifiedFilter: null, // Reset tracking
		}));

		// Reset the resetting flag after a short delay
		setTimeout(() => {
			setState((prev) => ({ ...prev, resetting: false }));
		}, 100);

		// In editor context: notify parent to sync filter values (may not be empty if resetValue='default_value')
		if (context === 'editor' && onFilterChange) {
			onFilterChange(resetValues);
		}

		// Clear URL parameters and emit clear event (frontend context only)
		if (context === 'frontend') {
			// Clear all filter params from URL, keeping only the post type
			// VOXEL PARITY: Only update URL in 'feed' mode. Archive/page modes don't touch the URL.
			// Evidence: search-form.php:4070 - updateUrl only set in post-to-feed mode
			if (attributes.onSubmit === 'feed' && attributes.updateUrl !== false) {
				clearUrlParams(state.currentPostType);
			}

			// Emit clear event for Post Feed/Map integration
			const event = new CustomEvent('voxel-search-clear', {
				detail: {
					postType: state.currentPostType,
				},
			});
			window.dispatchEvent(event);
		}
	}, [context, state.currentPostType, onFilterChange, attributes.updateUrl, attributes.onSubmit, currentPostTypeConfig?.filters]);

	// Toggle portal
	const togglePortal = useCallback(() => {
		setState((prev) => ({
			...prev,
			portalActive: !prev.portalActive,
		}));
	}, []);

	/**
	 * Fetch narrowed values from server for adaptive filtering
	 * Reference: voxel-search-form.beautified.js lines 1216-1238
	 *
	 * Voxel Pattern:
	 * jQuery.post(ajax_url + "&action=search.narrow_filters&" + query, {
	 *   term_taxonomy_ids: JSON.stringify(taxIds)
	 * })
	 */
	const fetchNarrowedValues = useCallback(async () => {
		// Skip if adaptive filtering is disabled or not in frontend
		if (!attributes.adaptiveFiltering || context !== 'frontend') {
			return;
		}

		// Skip if suspended (to prevent loops)
		if (suspendedUpdateRef.current) {
			suspendedUpdateRef.current = false;
			return;
		}

		// Get filters that support adaptive filtering (range and terms types)
		const adaptiveFilters = filterConfigs.filter(
			(f) => f.type === 'range' || f.type === 'terms'
		);

		if (adaptiveFilters.length === 0) {
			return;
		}

		// Build query string from current filter values
		// VOXEL PARITY: Use 'type' instead of 'post_type' (line 1202 of beautified.js)
		const queryParams = new URLSearchParams();
		queryParams.set('type', state.currentPostType);

		// Include _last_modified for backend optimization (Voxel pattern)
		// Backend uses this to skip recalculating unaffected adaptive filters
		// Reference: voxel-search-form.beautified.js lines 1220-1225
		if (state.lastModifiedFilter) {
			queryParams.set('_last_modified', state.lastModifiedFilter);
		}

		Object.entries(state.filterValues).forEach(([key, value]) => {
			if (value !== null && value !== undefined && value !== '') {
				if (Array.isArray(value)) {
					queryParams.set(key, value.join(','));
				} else if (typeof value === 'object') {
					queryParams.set(key, JSON.stringify(value));
				} else {
					queryParams.set(key, String(value));
				}
			}
		});

		// Collect term_taxonomy_ids for terms filters
		// Reference: voxel-search-form.beautified.js lines 1220-1225
		const termTaxIds: number[] = [];
		adaptiveFilters.forEach((filter) => {
			if (filter.type === 'terms') {
				const filterData = currentPostTypeConfig?.filters?.find(
					(f: FilterData) => f.key === filter.filterKey
				);
				if (filterData?.props?.['terms']) {
					// Collect all term_taxonomy_ids from the taxonomy
					const collectIds = (terms: Array<{ term_taxonomy_id?: number; children?: unknown[] }>) => {
						terms.forEach((term) => {
							if (term.term_taxonomy_id) {
								termTaxIds.push(term.term_taxonomy_id);
							}
							if (term.children && Array.isArray(term.children)) {
								collectIds(term.children as Array<{ term_taxonomy_id?: number; children?: unknown[] }>);
							}
						});
					};
					collectIds(filterData.props['terms'] as Array<{ term_taxonomy_id?: number; children?: unknown[] }>);
				}
			}
		});

		// Set narrowing state
		setState((prev) => ({ ...prev, narrowingFilters: true }));

		try {
			const restUrl = getRestBaseUrl();
			const response = await fetch(
				`${restUrl}voxel-fse/v1/search-form/narrow-filters?${queryParams.toString()}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						term_taxonomy_ids: termTaxIds,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			if (data.success && data.data) {
				// Update narrowed values
				// Reference: voxel-search-form.beautified.js lines 1229-1232
				setState((prev) => ({
					...prev,
					narrowedValues: {
						ranges: data.data.ranges || {},
						terms: data.data.terms || {},
					},
					narrowingFilters: false,
				}));

				// Suspend next update to prevent loops when filters update based on narrowed values
				suspendedUpdateRef.current = true;
			} else {
				setState((prev) => ({ ...prev, narrowingFilters: false }));
			}
		} catch (error) {
			console.error('[useSearchForm] Adaptive filtering error:', error);
			setState((prev) => ({ ...prev, narrowingFilters: false }));
		}
	}, [
		attributes.adaptiveFiltering,
		context,
		filterConfigs,
		state.currentPostType,
		state.filterValues,
		currentPostTypeConfig,
	]);

	// Trigger adaptive filtering when filter values change
	// Reference: voxel-search-form.beautified.js lines 1208-1238
	useEffect(() => {
		if (!attributes.adaptiveFiltering || context !== 'frontend') {
			return;
		}

		// Clear previous timer
		if (adaptiveFilterTimerRef.current) {
			clearTimeout(adaptiveFilterTimerRef.current);
		}

		// Debounce the adaptive filtering call (300ms)
		adaptiveFilterTimerRef.current = setTimeout(() => {
			fetchNarrowedValues();
		}, 300);

		return () => {
			if (adaptiveFilterTimerRef.current) {
				clearTimeout(adaptiveFilterTimerRef.current);
			}
		};
	}, [state.filterValues, attributes.adaptiveFiltering, context, fetchNarrowedValues]);

	/**
	 * Handle form submission
	 * CRITICAL: Takes explicit parameters to avoid stale closure/ref issues
	 * The caller passes in current values, so we don't need state in deps
	 * This prevents infinite loops: useEffect depends on state → calls this → no state dep → stable function
	 */
	const handleSubmitInternal = useCallback(
		(filterValues: Record<string, unknown>, postType: string) => {
			setState((prev) => ({ ...prev, loading: true }));

			// Call the onSubmit callback if provided
			// CRITICAL: Include postType in the callback data so frontend.tsx can use it
			if (onSubmit) {
				onSubmit({
					postType: postType,
					...filterValues,
				});
			}

			// Update URL with filter parameters (only in 'feed' mode, and only if updateUrl is enabled)
			// VOXEL PARITY: In archive/page mode, URL is never updated via replaceState.
			// The archive redirect handles navigation via window.location.href in frontend.tsx.
			// Evidence: search-form.php:4070 - updateUrl only set in post-to-feed mode
			// Evidence: voxel-search-form.beautified.js:2291 - updateUrl check only in getPosts() (AJAX path)
			const shouldUpdateUrl = attributes.onSubmit === 'feed' && attributes.updateUrl !== false;
			if (context === 'frontend' && shouldUpdateUrl && hasUserInteractedRef.current) {
				updateUrlParams(filterValues, postType);
			}

			setState((prev) => ({ ...prev, loading: false }));
		},
		[context, onSubmit, attributes.updateUrl, attributes.onSubmit]
	);

	// VOXEL PARITY: Track previous query string to skip duplicate searches
	// Evidence: voxel-search-form.beautified.js line 2058 - previousQueryString === currentQueryString check
	// Voxel's watcher compares query strings to skip identical searches (including on initial mount)
	const previousQueryStringRef = useRef<string | null>(null);

	// Auto-submit when filter values change (Voxel's $watch pattern)
	// Reference: voxel-search-form.beautified.js lines 1185-1192
	// VOXEL PARITY: Auto-submit only applies in 'feed' mode (post-to-feed).
	// In archive/page mode, filters update internal state only. Navigation happens on button click.
	// Evidence: search-form.php:158 - ts_search_on condition: ts_on_submit === 'post-to-feed'
	// Evidence: voxel-search-form.beautified.js:1975-1988 - $watch only calls getPosts() in filter_update mode
	useEffect(() => {
		if (attributes.searchOn === 'change' && attributes.onSubmit === 'feed' && context === 'frontend') {
			// Build current query string (same format as Voxel)
			// Evidence: voxel-search-form.beautified.js line 1991 - builds query from type + filters
			const currentQueryString = JSON.stringify({
				type: state.currentPostType,
				filters: state.filterValues,
			});

			// VOXEL PARITY: Skip if query string hasn't changed
			// This prevents auto-submit on mount AND prevents duplicate searches
			if (previousQueryStringRef.current === currentQueryString) {
				return;
			}

			// Skip the FIRST query (initial mount) - don't dispatch, just record it
			// The Post Feed fetches on mount independently, so Search Form doesn't need to dispatch
			if (previousQueryStringRef.current === null) {
				previousQueryStringRef.current = currentQueryString;
				return;
			}

			// Update previous query string
			previousQueryStringRef.current = currentQueryString;

			// Debounce the submit to avoid excessive requests
			const timer = setTimeout(() => {
				// Pass current values explicitly - useEffect has them in deps so they're fresh
				handleSubmitInternal(state.filterValues, state.currentPostType);
			}, 300);

			return () => {
				clearTimeout(timer);
			};
		}
		return undefined;
	}, [state.filterValues, state.currentPostType, attributes.searchOn, attributes.onSubmit, context, handleSubmitInternal]);

	// VOXEL PARITY: Listen for PostFeed loading events to show spinner on submit button
	// In Voxel, the Search Form owns getPosts() so this.loading drives the spinner.
	// In FSE, PostFeed owns fetchPosts(), so it dispatches events back to SearchForm.
	// Reference: voxel-search-form.beautified.js:2064 (this.loading = true) and line 131 (ts-loading-btn)
	useEffect(() => {
		if (context !== 'frontend') return;

		const handleFeedLoading = (event: Event) => {
			const detail = (event as CustomEvent).detail;
			// Only show button spinner after user has interacted with the form.
			// The Post Feed fires feed-loading on initial mount — we must not show the spinner then.
			if (detail?.searchFormId === attributes.blockId && hasUserInteractedRef.current) {
				setState(prev => ({ ...prev, loading: true }));
			}
		};

		const handleFeedLoaded = (event: Event) => {
			const detail = (event as CustomEvent).detail;
			if (detail?.searchFormId === attributes.blockId) {
				setState(prev => ({ ...prev, loading: false }));
			}
		};

		window.addEventListener('voxel-fse:feed-loading', handleFeedLoading);
		window.addEventListener('voxel-fse:feed-loaded', handleFeedLoaded);

		return () => {
			window.removeEventListener('voxel-fse:feed-loading', handleFeedLoading);
			window.removeEventListener('voxel-fse:feed-loaded', handleFeedLoaded);
		};
	}, [context, attributes.blockId]);

	// Wrapper for manual submit that reads current state
	const handleSubmit = useCallback(() => {
		// Manual submit is always a user interaction
		hasUserInteractedRef.current = true;
		handleSubmitInternal(state.filterValues, state.currentPostType);
	}, [handleSubmitInternal, state.filterValues, state.currentPostType]);

	return {
		state,
		setCurrentPostType,
		setFilterValue,
		clearAll,
		togglePortal,
		submit: handleSubmit,
		currentPostTypeConfig,
		filterConfigs,
		narrowedValues: state.narrowedValues,
		narrowingFilters: state.narrowingFilters,
	};
}

/**
 * Clear all filter-related URL parameters, optionally keeping post type
 * VOXEL PARITY: Clears all params except 'type' when resetting
 */
function clearUrlParams(postType?: string) {
	const url = new URL(window.location.href);

	// Collect all keys to remove (everything except 'type' if we're keeping it)
	const keysToRemove: string[] = [];
	url.searchParams.forEach((_value, key) => {
		// Remove legacy FSE format
		if (key.startsWith('filter_') || key === 'post_type') {
			keysToRemove.push(key);
		}
		// Remove 'type' only if we're not keeping it
		if (key === 'type' && !postType) {
			keysToRemove.push(key);
		}
		// Remove any other filter params (anything that's not a known system param)
		// Common filter keys: availability, categories, location, price, keywords, etc.
		if (key !== 'type' && key !== 'page' && key !== 'pg') {
			keysToRemove.push(key);
		}
	});
	keysToRemove.forEach((key) => url.searchParams.delete(key));

	// Re-add post type if provided
	if (postType) {
		url.searchParams.set('type', postType);
	}

	// Update URL without page reload
	window.history.replaceState({}, '', url.toString());
}

/**
 * Check if a URL parameter key matches a filter key
 */
function isFilterKey(key: string, filterValues: Record<string, unknown>): boolean {
	return Object.prototype.hasOwnProperty.call(filterValues, key);
}

/**
 * Update URL parameters with filter values and post type
 *
 * VOXEL PARITY: Matches Voxel's currentQueryString() computed property exactly.
 * Evidence: voxel-search-form.beautified.js lines 3054-3065
 *
 * Voxel's logic:
 * ```javascript
 * let params = { type: this.post_type.key };
 * Object.keys(this.post_type.filters).forEach((key) => {
 *     let value = this.post_type.filters[key].value;
 *     if (value !== null) params[key] = value;  // ONLY non-null values
 * });
 * ```
 *
 * CRITICAL: Only includes filter params when the filter has a NON-NULL value.
 * This means:
 * - Untouched filters do NOT appear in the URL
 * - Empty strings, undefined, and null are all excluded
 * - Range filters with default values (e.g., "..") are excluded
 */
function updateUrlParams(filterValues: Record<string, unknown>, postType?: string) {
	const url = new URL(window.location.href);

	// Clear existing filter params and type
	// Support both Voxel format ('type', 'availability') and legacy FSE format ('post_type', 'filter_availability')
	const keysToRemove: string[] = [];
	url.searchParams.forEach((_value, key) => {
		// Remove legacy FSE format
		if (key.startsWith('filter_') || key === 'post_type') {
			keysToRemove.push(key);
		}
		// Remove Voxel format (type and filter keys)
		if (key === 'type' || isFilterKey(key, filterValues)) {
			keysToRemove.push(key);
		}
	});
	keysToRemove.forEach((key) => url.searchParams.delete(key));

	// Add post type if provided - VOXEL PARITY: Use 'type' not 'post_type'
	if (postType) {
		url.searchParams.set('type', postType);
	}

	// Add new filter params - VOXEL PARITY: ONLY non-null values
	// Evidence: voxel-search-form.beautified.js line 3060: if (value !== null) params[key] = value
	// CRITICAL: This matches Voxel exactly - untouched filters do NOT appear in URL
	Object.entries(filterValues).forEach(([key, value]) => {
		// Skip null, undefined, empty string (Voxel: "if (value !== null)")
		if (value === null || value === undefined || value === '') {
			return;
		}

		// Skip range values that are at defaults (e.g., ".." means no selection)
		// Evidence: Voxel's range filter sets value to null when at default min..max
		if (typeof value === 'string' && value === '..') {
			return;
		}

		// Skip objects where all values are empty (e.g., { from: '', to: '' })
		if (typeof value === 'object' && !Array.isArray(value)) {
			const objValues = Object.values(value as Record<string, unknown>);
			const hasNonEmpty = objValues.some((v) => v !== null && v !== undefined && v !== '');
			if (!hasNonEmpty) {
				return;
			}
		}

		// Serialize the value
		if (Array.isArray(value)) {
			const joined = value.join(',');
			if (joined) {
				url.searchParams.set(key, joined);
			}
		} else if (typeof value === 'object') {
			url.searchParams.set(key, JSON.stringify(value));
		} else {
			url.searchParams.set(key, String(value));
		}
	});

	// Update URL without page reload
	window.history.replaceState({}, '', url.toString());
}

export default useSearchForm;
