/**
 * useStatusFeed Hook
 *
 * Manages timeline feed state with infinite scroll, filtering, and ordering.
 * Handles pagination, optimistic updates, real-time additions, and polling refresh.
 *
 * VOXEL PARITY: Polling refresh
 * When configured, the feed can automatically poll for new statuses at a set interval.
 * This matches Voxel's optional polling behavior for live feeds.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getStatusFeed } from '../api';
import type { Status, StatusFeedParams, StatusFeedResponse, FeedType } from '../types';

/**
 * Feed state
 */
interface FeedState {
	statuses: Status[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	error: string | null;
	page: number;
}

/**
 * Feed filters (user-controllable, NOT including mode)
 */
export interface FeedFilters {
	mode: string; // Kept for backwards compat but controlled by prop
	orderId?: string; // _id of the active ordering option (Voxel uses _id for comparison)
	order: string;
	time: string;
	timeCustom?: number;
	search?: string;
	filter?: string;
	postId?: number;
	authorId?: number;
}

/**
 * Hook return type
 */
interface UseStatusFeedReturn {
	// State
	statuses: Status[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	error: string | null;

	// Actions
	loadMore: () => Promise<void>;
	refresh: () => Promise<void>;
	setFilters: (filters: Partial<FeedFilters>) => void;
	addStatus: (status: Status) => void;
	updateStatus: (status: Status) => void;
	removeStatus: (statusId: number) => void;

	// Polling controls
	startPolling: (intervalMs?: number) => void;
	stopPolling: () => void;
	isPolling: boolean;

	// Current filters
	filters: FeedFilters;
}

/**
 * Polling options
 */
interface PollingOptions {
	enabled?: boolean;
	intervalMs?: number;
}

/**
 * Default filters
 */
const defaultFilters: FeedFilters = {
	mode: 'user_feed',
	order: 'latest',
	time: 'all_time',
};

/**
 * useStatusFeed hook
 *
 * @param mode - Display mode from block attributes (NOT user controllable)
 * @param initialFilters - Initial filter values for user-controllable options
 * @param pollingOptions - Optional polling configuration for real-time updates
 */
export function useStatusFeed(
	mode: FeedType | string = 'user_feed',
	initialFilters: Partial<Omit<FeedFilters, 'mode'>> = {},
	pollingOptions: PollingOptions = {}
): UseStatusFeedReturn {
	const [filters, setFiltersState] = useState<FeedFilters>({
		...defaultFilters,
		...initialFilters,
		mode, // Mode from prop, not from initialFilters
	});

	const [state, setState] = useState<FeedState>({
		statuses: [],
		isLoading: true,
		isLoadingMore: false,
		hasMore: false, // Start false; set to true only after API confirms more pages
		error: null,
		page: 1,
	});

	// Track if component is mounted
	const isMounted = useRef(true);

	// Track current request to avoid race conditions
	const currentRequest = useRef<AbortController | null>(null);

	// Track previous mode to detect changes
	const prevModeRef = useRef(mode);

	// Polling state and refs
	const [isPolling, setIsPolling] = useState(false);
	const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const defaultPollingInterval = 30000; // 30 seconds default

	/**
	 * Build feed params - ALWAYS uses the mode prop, not filters.mode
	 */
	const buildFeedParams = useCallback(
		(page: number): StatusFeedParams => {
			const params = {
				mode: mode as FeedType, // Use prop directly, cast to FeedType
				order: filters.order,
				time: filters.time,
				time_custom: filters.timeCustom,
				search: filters.search,
				filter: filters.filter,
				post_id: filters.postId,
				author_id: filters.authorId,
				page,
			};
			console.log('[useStatusFeed] Building feed params:', params);
			return params;
		},
		[mode, filters.order, filters.time, filters.timeCustom, filters.search, filters.filter, filters.postId, filters.authorId]
	);

	/**
	 * Fetch feed data
	 */
	const fetchFeed = useCallback(
		async (page: number, append: boolean = false): Promise<void> => {
			// Cancel previous request
			if (currentRequest.current) {
				currentRequest.current.abort();
			}

			// Create new abort controller
			currentRequest.current = new AbortController();

			// Set loading state
			if (append) {
				setState((prev) => ({ ...prev, isLoadingMore: true, error: null }));
			} else {
				setState((prev) => ({
					...prev,
					isLoading: true,
					error: null,
					statuses: [],
					page: 1,
				}));
			}

			try {
				const params = buildFeedParams(page);
				const response = await getStatusFeed(params);

				if (!isMounted.current) return;

				// Defensive: handle both wrapped { data, has_more } and direct array responses
				// voxelFetch unwraps { success, data } so we should get { data, has_more, meta }
				// But handle edge cases where response might be array directly or undefined
				const statusData = Array.isArray(response)
					? (response as unknown as Status[])
					: (Array.isArray((response as StatusFeedResponse)?.data) ? (response as StatusFeedResponse).data : []);
				const hasMoreData = Array.isArray(response)
					? false
					: ((response as StatusFeedResponse)?.has_more ?? false);

				setState((prev) => ({
					...prev,
					statuses: append ? [...prev.statuses, ...statusData] : statusData,
					hasMore: hasMoreData,
					page,
					isLoading: false,
					isLoadingMore: false,
				}));
			} catch (error) {
				if (!isMounted.current) return;

				// Ignore abort errors
				if (error instanceof Error && error.name === 'AbortError') {
					return;
				}

				setState((prev) => ({
					...prev,
					isLoading: false,
					isLoadingMore: false,
					error: error instanceof Error ? error.message : 'Failed to load feed',
				}));
			}
		},
		[buildFeedParams]
	);

	/**
	 * Load more statuses (infinite scroll)
	 */
	const loadMore = useCallback(async (): Promise<void> => {
		if (state.isLoadingMore || !state.hasMore) return;
		await fetchFeed(state.page + 1, true);
	}, [state.isLoadingMore, state.hasMore, state.page, fetchFeed]);

	/**
	 * Refresh feed (reset to page 1)
	 */
	const refresh = useCallback(async (): Promise<void> => {
		await fetchFeed(1, false);
	}, [fetchFeed]);

	/**
	 * Update filters (for user-controllable options)
	 */
	const setFilters = useCallback(
		(newFilters: Partial<FeedFilters>) => {
			setFiltersState((prev) => ({
				...prev,
				...newFilters,
				mode, // Always keep mode from prop
			}));
		},
		[mode]
	);

	/**
	 * Add a new status to the top of the feed
	 */
	const addStatus = useCallback((status: Status) => {
		setState((prev) => ({
			...prev,
			statuses: [status, ...prev.statuses],
		}));
	}, []);

	/**
	 * Update a status in the feed
	 */
	const updateStatus = useCallback((updatedStatus: Status) => {
		setState((prev) => ({
			...prev,
			statuses: prev.statuses.map((s) =>
				s.id === updatedStatus.id ? updatedStatus : s
			),
		}));
	}, []);

	/**
	 * Remove a status from the feed
	 */
	const removeStatus = useCallback((statusId: number) => {
		setState((prev) => ({
			...prev,
			statuses: prev.statuses.filter((s) => s.id !== statusId),
		}));
	}, []);

	/**
	 * Refetch when mode changes (from block attributes)
	 */
	useEffect(() => {
		if (prevModeRef.current !== mode) {
			console.log('[useStatusFeed] Mode changed:', {
				from: prevModeRef.current,
				to: mode,
				willRefetch: true
			});
			prevModeRef.current = mode;
			// Update filters.mode for consistency
			setFiltersState((prev) => ({ ...prev, mode }));
			// Refetch with new mode
			fetchFeed(1, false);
		}
	}, [mode, fetchFeed]);

	/**
	 * Initial load
	 */
	useEffect(() => {
		fetchFeed(1, false);
		// Only run on mount, not when dependencies change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	/**
	 * Refetch when user filters change (order, time, search, etc.)
	 */
	useEffect(() => {
		// Skip if this is the initial render (handled by mount effect)
		if (prevModeRef.current === mode) {
			// Only refetch if filters other than mode changed
			fetchFeed(1, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.order, filters.time, filters.timeCustom, filters.search, filters.filter]);

	/**
	 * Start polling for new statuses
	 * This provides real-time updates by refreshing the feed at a set interval
	 *
	 * @param intervalMs - Polling interval in milliseconds (default 30000)
	 */
	const startPolling = useCallback((intervalMs: number = defaultPollingInterval) => {
		// Don't start if already polling
		if (pollingIntervalRef.current) return;

		setIsPolling(true);
		console.log(`[useStatusFeed] Starting polling every ${intervalMs}ms`);

		pollingIntervalRef.current = setInterval(() => {
			// Only poll if not currently loading
			if (!state.isLoading && !state.isLoadingMore) {
				console.log('[useStatusFeed] Polling refresh');
				fetchFeed(1, false);
			}
		}, intervalMs);
	}, [fetchFeed, state.isLoading, state.isLoadingMore]);

	/**
	 * Stop polling
	 */
	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
			setIsPolling(false);
			console.log('[useStatusFeed] Stopped polling');
		}
	}, []);

	/**
	 * Auto-start polling if configured
	 */
	useEffect(() => {
		if (pollingOptions.enabled && pollingOptions.intervalMs) {
			startPolling(pollingOptions.intervalMs);
		}
		return () => stopPolling();
	}, [pollingOptions.enabled, pollingOptions.intervalMs, startPolling, stopPolling]);

	/**
	 * Cleanup on unmount
	 */
	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
			if (currentRequest.current) {
				currentRequest.current.abort();
			}
			// Stop polling on unmount
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current);
			}
		};
	}, []);

	return {
		statuses: state.statuses,
		isLoading: state.isLoading,
		isLoadingMore: state.isLoadingMore,
		hasMore: state.hasMore,
		error: state.error,
		loadMore,
		refresh,
		setFilters,
		addStatus,
		updateStatus,
		removeStatus,
		startPolling,
		stopPolling,
		isPolling,
		filters: { ...filters, mode }, // Always return current mode
	};
}

export default useStatusFeed;
