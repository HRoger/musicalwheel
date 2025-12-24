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
	}));

	// Ref to track if we should skip the next adaptive filtering call
	// (to prevent loops when we update values based on narrowed results)
	const suspendedUpdateRef = useRef(false);

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

		// Auto-submit on post type change in frontend context
		// This ensures Post Feed updates when user switches post type
		// Note: URL updates are NOT done here to prevent loops - they happen via handleSubmitInternal
		if (context === 'frontend' && onSubmit) {
			setTimeout(() => {
				onSubmit({
					postType: postTypeKey,
				});
			}, 50);
		}
	}, [context, onSubmit, onPostTypeChange]);

	// Set individual filter value
	const setFilterValue = useCallback(
		(filterKey: string, value: unknown) => {
			setState((prev) => ({
				...prev,
				filterValues: {
					...prev.filterValues,
					[filterKey]: value,
				},
			}));
			// Note: Auto-submit on change is handled by useEffect watching filterValues
		},
		[]
	);

	// Clear all filters
	const clearAll = useCallback((closePortal = false) => {
		setState((prev) => ({
			...prev,
			filterValues: {},
			activeFilterCount: 0,
			resetting: true,
			portalActive: closePortal ? false : prev.portalActive,
		}));

		// Reset the resetting flag after a short delay
		setTimeout(() => {
			setState((prev) => ({ ...prev, resetting: false }));
		}, 100);

		// Clear URL parameters and emit clear event (frontend context only)
		if (context === 'frontend') {
			// Clear all filter params from URL, keeping only the post type
			clearUrlParams(state.currentPostType);

			// Emit clear event for Post Feed/Map integration
			const event = new CustomEvent('voxel-search-clear', {
				detail: {
					postType: state.currentPostType,
				},
			});
			window.dispatchEvent(event);
		}
	}, [context, state.currentPostType]);

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
				if (filterData?.props?.terms) {
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
					collectIds(filterData.props.terms as Array<{ term_taxonomy_id?: number; children?: unknown[] }>);
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

	// Handle form submission
	// CRITICAL: Must be defined BEFORE the auto-submit useEffect that uses it
	const handleSubmitInternal = useCallback(() => {
		setState((prev) => ({ ...prev, loading: true }));

		// Call the onSubmit callback if provided
		// CRITICAL: Include postType in the callback data so frontend.tsx can use it
		if (onSubmit) {
			onSubmit({
				postType: state.currentPostType,
				...state.filterValues,
			});
		}

		// Update URL with filter parameters (only in frontend context)
		// NOTE: Event dispatch is handled by the onSubmit callback in frontend.tsx
		// to ensure targetId is included for Post Feed connection
		if (context === 'frontend') {
			updateUrlParams(state.filterValues, state.currentPostType);
		}

		setState((prev) => ({ ...prev, loading: false }));
	}, [context, onSubmit, state.currentPostType, state.filterValues]);

	// Auto-submit when filter values change (Voxel's $watch pattern)
	// Reference: voxel-search-form.beautified.js lines 1185-1192
	// CRITICAL: This must be separate from setFilterValue to avoid stale closures
	useEffect(() => {
		console.log('[useSearchForm] Auto-submit useEffect triggered', {
			searchOn: attributes.searchOn,
			context,
			filterValues: state.filterValues,
			shouldTrigger: attributes.searchOn === 'change' && context === 'frontend'
		});

		if (attributes.searchOn === 'change' && context === 'frontend') {
			console.log('[useSearchForm] Scheduling auto-submit in 300ms...');
			// Debounce the submit to avoid excessive requests
			const timer = setTimeout(() => {
				console.log('[useSearchForm] Executing handleSubmitInternal');
				handleSubmitInternal();
			}, 300);

			return () => {
				console.log('[useSearchForm] Clearing auto-submit timer');
				clearTimeout(timer);
			};
		}
	}, [state.filterValues, attributes.searchOn, context, handleSubmitInternal]);

	const handleSubmit = useCallback(() => {
		handleSubmitInternal();
	}, [handleSubmitInternal]);

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
	return Object.hasOwn(filterValues, key);
}

/**
 * Update URL parameters with filter values and post type
 * VOXEL PARITY: Uses 'type' instead of 'post_type', and filter keys without 'filter_' prefix
 * Reference: voxel-search-form.beautified.js lines 1202-1203
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

	// Add new filter params - VOXEL PARITY: Use key directly without 'filter_' prefix
	// Reference: voxel-search-form.beautified.js line 1203: params[f.key] = f.value
	Object.entries(filterValues).forEach(([key, value]) => {
		if (value !== null && value !== undefined && value !== '') {
			if (Array.isArray(value)) {
				url.searchParams.set(key, value.join(','));
			} else if (typeof value === 'object') {
				url.searchParams.set(key, JSON.stringify(value));
			} else {
				url.searchParams.set(key, String(value));
			}
		}
	});

	// Update URL without page reload
	window.history.replaceState({}, '', url.toString());
}

export default useSearchForm;
