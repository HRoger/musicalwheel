/**
 * useCommentFeed Hook
 *
 * Manages comment feed state with pagination for a status.
 * Handles loading, optimistic updates, and nested replies.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { getCommentFeed } from '../api';
import type { Comment, CommentFeedParams, CommentFeedResponse } from '../types';

/**
 * Comment feed state
 */
interface CommentFeedState {
	comments: Comment[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	error: string | null;
	page: number;
}

/**
 * Hook return type
 */
interface UseCommentFeedReturn {
	// State
	comments: Comment[];
	isLoading: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	error: string | null;

	// Actions
	loadMore: () => Promise<void>;
	refresh: () => Promise<void>;
	addComment: (comment: Comment) => void;
	updateComment: (comment: Comment) => void;
	removeComment: (commentId: number) => void;
}

/**
 * useCommentFeed hook
 *
 * @param statusId - The status ID to fetch comments for
 * @param parentId - Optional parent comment ID for nested replies
 * @param autoLoad - Whether to load comments on mount (default: true)
 */
export function useCommentFeed(
	statusId: number,
	parentId?: number,
	autoLoad: boolean = true
): UseCommentFeedReturn {
	const [state, setState] = useState<CommentFeedState>({
		comments: [],
		isLoading: autoLoad,
		isLoadingMore: false,
		hasMore: true,
		error: null,
		page: 1,
	});

	// Track if component is mounted
	const isMounted = useRef(true);

	// Track current request to avoid race conditions
	const currentRequest = useRef<AbortController | null>(null);

	// Track if initial load has happened
	const initialLoadDone = useRef(false);

	/**
	 * Build feed params
	 */
	const buildFeedParams = useCallback(
		(page: number): CommentFeedParams => {
			return {
				status_id: statusId,
				parent_id: parentId,
				page,
			};
		},
		[statusId, parentId]
	);

	/**
	 * Fetch comments
	 */
	const fetchComments = useCallback(
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
					comments: [],
					page: 1,
				}));
			}

			try {
				const params = buildFeedParams(page);
				console.log('[useCommentFeed] Fetching comments:', params);

				const response = await getCommentFeed(params);

				if (!isMounted.current) return;

				// Handle response - may be { data, has_more } or direct array
				const commentData = Array.isArray(response)
					? (response as unknown as Comment[])
					: Array.isArray((response as CommentFeedResponse)?.data)
						? (response as CommentFeedResponse).data
						: [];
				const hasMoreData = Array.isArray(response)
					? false
					: (response as CommentFeedResponse)?.has_more ?? false;

				console.log('[useCommentFeed] Got comments:', {
					count: commentData.length,
					hasMore: hasMoreData,
				});

				setState((prev) => ({
					...prev,
					comments: append ? [...prev.comments, ...commentData] : commentData,
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

				console.error('[useCommentFeed] Error fetching comments:', error);

				setState((prev) => ({
					...prev,
					isLoading: false,
					isLoadingMore: false,
					error: error instanceof Error ? error.message : 'Failed to load comments',
				}));
			}
		},
		[buildFeedParams]
	);

	/**
	 * Load more comments (pagination)
	 */
	const loadMore = useCallback(async (): Promise<void> => {
		if (state.isLoadingMore || !state.hasMore) return;
		await fetchComments(state.page + 1, true);
	}, [state.isLoadingMore, state.hasMore, state.page, fetchComments]);

	/**
	 * Refresh comments (reset to page 1)
	 */
	const refresh = useCallback(async (): Promise<void> => {
		await fetchComments(1, false);
	}, [fetchComments]);

	/**
	 * Add a new comment to the feed
	 */
	const addComment = useCallback((comment: Comment) => {
		setState((prev) => ({
			...prev,
			comments: [...prev.comments, comment], // Add to end for comments
		}));
	}, []);

	/**
	 * Update a comment in the feed
	 */
	const updateComment = useCallback((updatedComment: Comment) => {
		setState((prev) => ({
			...prev,
			comments: prev.comments.map((c) =>
				c.id === updatedComment.id ? updatedComment : c
			),
		}));
	}, []);

	/**
	 * Remove a comment from the feed
	 */
	const removeComment = useCallback((commentId: number) => {
		setState((prev) => ({
			...prev,
			comments: prev.comments.filter((c) => c.id !== commentId),
		}));
	}, []);

	/**
	 * Initial load
	 */
	useEffect(() => {
		if (autoLoad && !initialLoadDone.current) {
			initialLoadDone.current = true;
			fetchComments(1, false);
		}
	}, [autoLoad, fetchComments]);

	/**
	 * Refetch when statusId or parentId changes
	 */
	useEffect(() => {
		if (initialLoadDone.current) {
			fetchComments(1, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [statusId, parentId]);

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
		};
	}, []);

	return {
		comments: state.comments,
		isLoading: state.isLoading,
		isLoadingMore: state.isLoadingMore,
		hasMore: state.hasMore,
		error: state.error,
		loadMore,
		refresh,
		addComment,
		updateComment,
		removeComment,
	};
}

export default useCommentFeed;
