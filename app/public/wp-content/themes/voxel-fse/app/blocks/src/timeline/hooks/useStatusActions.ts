/**
 * useStatusActions Hook
 *
 * Handles status actions (like, repost, delete, etc.) with optimistic updates.
 * Provides local state management with server sync and rollback on error.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef } from 'react';
import {
	toggleStatusLike,
	toggleRepost,
	deleteStatus,
	approveStatus,
	markStatusPending,
	removeStatusLinkPreview,
} from '../api';
import { useTimelineConfig, useCurrentUser } from './useTimelineConfig';
import type { Status, StatusActionResponse, RepostResponse } from '../types';

/**
 * Action state for tracking pending operations
 */
interface ActionState {
	isLiking: boolean;
	isReposting: boolean;
	isDeleting: boolean;
	isApproving: boolean;
	isMarkingPending: boolean;
	isRemovingPreview: boolean;
}

/**
 * Hook return type
 */
interface UseStatusActionsReturn {
	// State
	actionState: ActionState;
	optimisticStatus: Partial<Status>;

	// Actions
	handleLike: () => Promise<StatusActionResponse>;
	handleRepost: () => Promise<RepostResponse>;
	handleDelete: () => Promise<boolean>;
	handleApprove: () => Promise<Status | null>;
	handleMarkPending: () => Promise<Status | null>;
	handleRemoveLinkPreview: () => Promise<boolean>;

	// Optimistic state helpers
	resetOptimisticState: () => void;
}

/**
 * useStatusActions hook
 *
 * @param status - The status to perform actions on
 * @param onStatusUpdate - Callback when status is updated
 * @param onStatusDelete - Callback when status is deleted
 */
export function useStatusActions(
	status: Status,
	onStatusUpdate?: (status: Status) => void,
	onStatusDelete?: (statusId: number) => void
): UseStatusActionsReturn {
	// Get config for nonces and current user for optimistic updates
	const { config } = useTimelineConfig();
	const currentUser = useCurrentUser();

	// Track pending operations
	const [actionState, setActionState] = useState<ActionState>({
		isLiking: false,
		isReposting: false,
		isDeleting: false,
		isApproving: false,
		isMarkingPending: false,
		isRemovingPreview: false,
	});

	// Optimistic state overrides
	const [optimisticStatus, setOptimisticStatus] = useState<Partial<Status>>({});

	// Track original state for rollback
	const originalState = useRef<Partial<Status>>({});

	/**
	 * Reset optimistic state
	 */
	const resetOptimisticState = useCallback(() => {
		setOptimisticStatus({});
		originalState.current = {};
	}, []);

	/**
	 * Handle like/unlike action
	 */
	const handleLike = useCallback(async (): Promise<StatusActionResponse> => {
		if (actionState.isLiking) {
			return { success: false, message: 'Action in progress' };
		}

		// Get nonce from config
		const nonce = config?.nonces?.status_like;
		if (!nonce) {
			return { success: false, message: 'Configuration not loaded' };
		}

		// Read current state from merged optimistic + original (to handle rapid clicks)
		const currentHasLiked = optimisticStatus.current_user?.has_liked ?? status.current_user.has_liked;
		const currentLikeCount = optimisticStatus.likes?.count ?? status.likes.count;
		const currentLast3 = optimisticStatus.likes?.last3 ?? status.likes.last3 ?? [];

		// Store original state for rollback (use the current merged state)
		originalState.current = {
			likes: optimisticStatus.likes ?? { ...status.likes },
			current_user: optimisticStatus.current_user ?? { ...status.current_user },
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

		// Create the new state object for both optimistic update and callback
		const newLikesState = {
			...status.likes,
			count: newLikeCount,
			last3: newLast3,
		};
		const newCurrentUserState = {
			...status.current_user,
			has_liked: newHasLiked,
		};

		// Apply optimistic update
		setOptimisticStatus((prev) => ({
			...prev,
			likes: newLikesState,
			current_user: newCurrentUserState,
		}));

		setActionState((prev) => ({ ...prev, isLiking: true }));

		try {
			const response = await toggleStatusLike(status.id, nonce);

			// Success - optimistic state already applied, nothing more to do
			// The optimistic state will persist until the component re-fetches
			return response;
		} catch (error) {
			// Rollback on error
			setOptimisticStatus((prev) => ({
				...prev,
				likes: originalState.current.likes,
				current_user: originalState.current.current_user,
			}));

			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to like status',
			};
		} finally {
			setActionState((prev) => ({ ...prev, isLiking: false }));
		}
	}, [status, optimisticStatus, actionState.isLiking, config?.nonces?.status_like, currentUser]);

	/**
	 * Handle repost/unrepost action
	 */
	const handleRepost = useCallback(async (): Promise<RepostResponse> => {
		if (actionState.isReposting) {
			return { success: false, message: 'Action in progress', action: 'repost' };
		}

		// Get nonce from config
		const nonce = config?.nonces?.status_repost;
		if (!nonce) {
			return { success: false, message: 'Configuration not loaded', action: 'repost' };
		}

		// Read current state from merged optimistic + original (to handle rapid clicks)
		const currentHasReposted = optimisticStatus.current_user?.has_reposted ?? status.current_user.has_reposted;

		// Store original state for rollback
		originalState.current = {
			current_user: optimisticStatus.current_user ?? { ...status.current_user },
		};

		// Optimistic update from CURRENT state
		const newHasReposted = !currentHasReposted;
		setOptimisticStatus((prev) => ({
			...prev,
			current_user: {
				...(prev.current_user ?? status.current_user),
				has_reposted: newHasReposted,
			},
		}));

		setActionState((prev) => ({ ...prev, isReposting: true }));

		try {
			const response = await toggleRepost(status.id, nonce);
			return response;
		} catch (error) {
			// Rollback
			setOptimisticStatus((prev) => ({
				...prev,
				current_user: originalState.current.current_user,
			}));

			return {
				success: false,
				message: error instanceof Error ? error.message : 'Failed to repost',
				action: 'repost',
			};
		} finally {
			setActionState((prev) => ({ ...prev, isReposting: false }));
		}
	}, [status, optimisticStatus, actionState.isReposting, config?.nonces?.status_repost]);

	/**
	 * Handle delete action
	 */
	const handleDelete = useCallback(async (): Promise<boolean> => {
		if (actionState.isDeleting) {
			return false;
		}

		// Get nonce from config (status_delete or fallback to status_edit)
		const nonce = config?.nonces?.status_delete ?? config?.nonces?.status_edit ?? '';
		if (!nonce) {
			console.error('[handleDelete] No nonce available for delete');
			return false;
		}

		setActionState((prev) => ({ ...prev, isDeleting: true }));

		try {
			const response = await deleteStatus(status.id, nonce);

			if (response.deleted && onStatusDelete) {
				onStatusDelete(status.id);
			}

			return response.deleted;
		} catch (error) {
			console.error('[handleDelete] Error:', error);
			return false;
		} finally {
			setActionState((prev) => ({ ...prev, isDeleting: false }));
		}
	}, [status.id, actionState.isDeleting, onStatusDelete, config?.nonces?.status_delete, config?.nonces?.status_edit]);

	/**
	 * Handle approve action (moderation)
	 * Note: Voxel returns { success, badges } not full status, so we merge into existing
	 */
	const handleApprove = useCallback(async (): Promise<Status | null> => {
		if (actionState.isApproving) {
			return null;
		}

		// Get nonce from config (same nonce as edit/moderation)
		const nonce = config?.nonces?.status_edit ?? config?.nonces?.status_moderate ?? '';
		if (!nonce) {
			console.error('[handleApprove] No nonce available for moderation');
			return null;
		}

		setActionState((prev) => ({ ...prev, isApproving: true }));

		try {
			const response = await approveStatus(status.id, nonce);

			if (response.success && onStatusUpdate) {
				// Merge response into existing status - set is_pending to false
				const updatedStatus: Status = {
					...status,
					is_pending: false,
					badges: response.badges || [],
				};
				onStatusUpdate(updatedStatus);
				return updatedStatus;
			}

			return null;
		} catch (error) {
			console.error('[handleApprove] Error:', error);
			return null;
		} finally {
			setActionState((prev) => ({ ...prev, isApproving: false }));
		}
	}, [status, actionState.isApproving, config?.nonces?.status_edit, config?.nonces?.status_moderate, onStatusUpdate]);

	/**
	 * Handle mark pending action (moderation)
	 * Note: Voxel returns { success, badges } not full status, so we merge into existing
	 */
	const handleMarkPending = useCallback(async (): Promise<Status | null> => {
		if (actionState.isMarkingPending) {
			return null;
		}

		// Get nonce from config (same nonce as edit/moderation)
		const nonce = config?.nonces?.status_edit ?? config?.nonces?.status_moderate ?? '';
		if (!nonce) {
			console.error('[handleMarkPending] No nonce available for moderation');
			return null;
		}

		setActionState((prev) => ({ ...prev, isMarkingPending: true }));

		try {
			const response = await markStatusPending(status.id, nonce);

			if (response.success && onStatusUpdate) {
				// Merge response into existing status - set is_pending to true
				const updatedStatus: Status = {
					...status,
					is_pending: true,
					badges: response.badges || [],
				};
				onStatusUpdate(updatedStatus);
				return updatedStatus;
			}

			return null;
		} catch (error) {
			console.error('[handleMarkPending] Error:', error);
			return null;
		} finally {
			setActionState((prev) => ({ ...prev, isMarkingPending: false }));
		}
	}, [status, actionState.isMarkingPending, config?.nonces?.status_edit, config?.nonces?.status_moderate, onStatusUpdate]);

	/**
	 * Handle remove link preview action
	 */
	const handleRemoveLinkPreview = useCallback(async (): Promise<boolean> => {
		if (actionState.isRemovingPreview) {
			return false;
		}

		// Optimistic update
		originalState.current = {
			link_preview: status.link_preview,
		};
		setOptimisticStatus((prev) => ({
			...prev,
			link_preview: null,
		}));

		setActionState((prev) => ({ ...prev, isRemovingPreview: true }));

		try {
			const response = await removeStatusLinkPreview(status.id);
			return response.removed;
		} catch (error) {
			// Rollback
			setOptimisticStatus((prev) => ({
				...prev,
				link_preview: originalState.current.link_preview,
			}));
			return false;
		} finally {
			setActionState((prev) => ({ ...prev, isRemovingPreview: false }));
		}
	}, [status.id, status.link_preview, actionState.isRemovingPreview]);

	return {
		actionState,
		optimisticStatus,
		handleLike,
		handleRepost,
		handleDelete,
		handleApprove,
		handleMarkPending,
		handleRemoveLinkPreview,
		resetOptimisticState,
	};
}

export default useStatusActions;
