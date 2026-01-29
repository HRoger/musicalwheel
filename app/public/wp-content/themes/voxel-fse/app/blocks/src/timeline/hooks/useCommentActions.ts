/**
 * useCommentActions Hook
 *
 * Handles comment actions (like, delete, approve, etc.) with optimistic updates.
 * Provides local state management with server sync and rollback on error.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef } from 'react';
import {
	toggleCommentLike,
	deleteComment,
	approveComment,
	markCommentPending,
} from '../api';
import { useTimelineConfig, useCurrentUser } from './useTimelineConfig';
import type { Comment, CommentActionResponse } from '../types';

/**
 * Action state for tracking pending operations
 */
interface ActionState {
	isLiking: boolean;
	isDeleting: boolean;
	isApproving: boolean;
}

/**
 * Hook return type
 */
interface UseCommentActionsReturn {
	// State
	actionState: ActionState;
	optimisticComment: Partial<Comment>;

	// Actions
	handleLike: () => Promise<CommentActionResponse>;
	handleDelete: () => Promise<boolean>;
	handleApprove: () => Promise<Comment | null>;
	handleMarkPending: () => Promise<Comment | null>;

	// Optimistic state helpers
	resetOptimisticState: () => void;
}

/**
 * useCommentActions hook
 *
 * @param comment - The comment to perform actions on
 * @param onCommentUpdate - Callback when comment is updated
 * @param onCommentDelete - Callback when comment is deleted
 */
export function useCommentActions(
	comment: Comment,
	onCommentUpdate?: (comment: Comment) => void,
	onCommentDelete?: (commentId: number) => void
): UseCommentActionsReturn {
	// Get config for nonces and current user for optimistic updates
	const { config } = useTimelineConfig();
	const currentUser = useCurrentUser();

	// Track pending operations
	const [actionState, setActionState] = useState<ActionState>({
		isLiking: false,
		isDeleting: false,
		isApproving: false,
	});

	// Optimistic state overrides
	const [optimisticComment, setOptimisticComment] = useState<Partial<Comment>>({});

	// Track original state for rollback
	const originalState = useRef<Partial<Comment>>({});

	/**
	 * Reset optimistic state
	 */
	const resetOptimisticState = useCallback(() => {
		setOptimisticComment({});
		originalState.current = {};
	}, []);

	/**
	 * Handle like/unlike action
	 */
	const handleLike = useCallback(async (): Promise<CommentActionResponse> => {
		if (actionState.isLiking) {
			return { success: false, message: 'Action in progress' };
		}

		// Get nonce from config
		const nonce = config?.nonces?.comment_like;
		if (!nonce) {
			return { success: false, message: 'Configuration not loaded' };
		}

		// Read current state from merged optimistic + original (to handle rapid clicks)
		const currentHasLiked = optimisticComment.current_user?.has_liked ?? comment.current_user.has_liked;
		const currentLikeCount = optimisticComment.likes?.count ?? comment.likes.count;
		const currentLast3 = optimisticComment.likes?.last3 ?? comment.likes.last3 ?? [];

		// Store original state for rollback (use the current merged state)
		originalState.current = {
			likes: optimisticComment.likes ?? { ...comment.likes },
			current_user: optimisticComment.current_user ?? { ...comment.current_user },
		};

		// Calculate optimistic update values from CURRENT state
		const newHasLiked = !currentHasLiked;
		const newLikeCount = Math.max(0, currentLikeCount + (newHasLiked ? 1 : -1));

		// Calculate new last3 array (matches Voxel's behavior)
		let newLast3 = [...currentLast3];
		if (newHasLiked && currentUser) {
			// On LIKE: Add current user to front of last3, keep only 3
			newLast3.unshift({
				id: currentUser.id,
				type: 'user' as const,
				display_name: currentUser.display_name,
				link: currentUser.link ?? '',
				avatar_url: currentUser.avatar_url,
			});
			newLast3 = newLast3.slice(0, 3);
		} else if (!newHasLiked && currentUser) {
			// On UNLIKE: Remove current user from last3
			newLast3 = newLast3.filter(
				(u) => !(u.type === 'user' && u.id === currentUser.id)
			);
		}

		// Create the new state object
		const newLikesState = {
			...comment.likes,
			count: newLikeCount,
			last3: newLast3,
		};
		const newCurrentUserState = {
			...comment.current_user,
			has_liked: newHasLiked,
		};

		// Apply optimistic update
		setOptimisticComment((prev) => ({
			...prev,
			likes: newLikesState,
			current_user: newCurrentUserState,
		}));

		setActionState((prev) => ({ ...prev, isLiking: true }));

		try {
			const response = await toggleCommentLike(comment.id, nonce);

			// Success - optimistic state already applied
			return response;
		} catch (error) {
			// Rollback on error
			setOptimisticComment((prev) => ({
				...prev,
				likes: originalState.current.likes,
				current_user: originalState.current.current_user,
			}));

			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to like comment',
			};
		} finally {
			setActionState((prev) => ({ ...prev, isLiking: false }));
		}
	}, [comment, optimisticComment, actionState.isLiking, config?.nonces?.comment_like, currentUser]);

	/**
	 * Handle delete action
	 */
	const handleDelete = useCallback(async (): Promise<boolean> => {
		if (actionState.isDeleting) {
			return false;
		}

		// Get nonce from config
		const nonce = config?.nonces?.comment_delete;
		if (!nonce) {
			console.error('[useCommentActions] No comment_delete nonce available');
			return false;
		}

		setActionState((prev) => ({ ...prev, isDeleting: true }));

		try {
			const response = await deleteComment(comment.id, nonce);

			if (response.deleted && onCommentDelete) {
				onCommentDelete(comment.id);
			}

			return response.deleted;
		} catch (error) {
			console.error('[useCommentActions] Delete failed:', error);
			return false;
		} finally {
			setActionState((prev) => ({ ...prev, isDeleting: false }));
		}
	}, [comment.id, actionState.isDeleting, config?.nonces?.comment_delete, onCommentDelete]);

	/**
	 * Handle approve action (moderation)
	 */
	const handleApprove = useCallback(async (): Promise<Comment | null> => {
		if (actionState.isApproving) {
			return null;
		}

		// Get nonce from config
		const nonce = config?.nonces?.comment_edit;
		if (!nonce) {
			console.error('[useCommentActions] No comment_edit nonce available');
			return null;
		}

		setActionState((prev) => ({ ...prev, isApproving: true }));

		try {
			const updatedComment = await approveComment(comment.id, nonce);

			if (onCommentUpdate) {
				onCommentUpdate(updatedComment);
			}

			return updatedComment;
		} catch (error) {
			console.error('[useCommentActions] Approve failed:', error);
			return null;
		} finally {
			setActionState((prev) => ({ ...prev, isApproving: false }));
		}
	}, [comment.id, actionState.isApproving, config?.nonces?.comment_edit, onCommentUpdate]);

	/**
	 * Handle mark pending action (moderation)
	 */
	const handleMarkPending = useCallback(async (): Promise<Comment | null> => {
		if (actionState.isApproving) {
			return null;
		}

		// Get nonce from config
		const nonce = config?.nonces?.comment_edit;
		if (!nonce) {
			console.error('[useCommentActions] No comment_edit nonce available');
			return null;
		}

		setActionState((prev) => ({ ...prev, isApproving: true }));

		try {
			const updatedComment = await markCommentPending(comment.id, nonce);

			if (onCommentUpdate) {
				onCommentUpdate(updatedComment);
			}

			return updatedComment;
		} catch (error) {
			console.error('[useCommentActions] Mark pending failed:', error);
			return null;
		} finally {
			setActionState((prev) => ({ ...prev, isApproving: false }));
		}
	}, [comment.id, actionState.isApproving, config?.nonces?.comment_edit, onCommentUpdate]);

	return {
		actionState,
		optimisticComment,
		handleLike,
		handleDelete,
		handleApprove,
		handleMarkPending,
		resetOptimisticState,
	};
}

export default useCommentActions;
