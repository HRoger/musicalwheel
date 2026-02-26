/**
 * StatusActions Component
 *
 * Action buttons for timeline status (like, comment, repost).
 * Matches Voxel's timeline actions HTML structure.
 *
 * CSS Classes:
 * - .vxf-actions - Container
 * - .vxf-action - Individual action button
 * - .vxf-action--like, --comment, --repost
 * - .vxf-action--active - Active state (liked, reposted)
 *
 * @package VoxelFSE
 */

import { useCallback, useState } from 'react';
import { useStrings, usePermissions } from '../hooks';
import { formatCompactNumber } from '../utils';
import type { Status, IconValue, StatusActionResponse, RepostResponse } from '../types';

/**
 * Action state from useStatusActions hook
 */
interface ActionState {
	isLiking: boolean;
	isReposting: boolean;
	isDeleting: boolean;
	isApproving: boolean;
	isRemovingPreview: boolean;
}

/**
 * Icons configuration
 */
interface ActionIcons {
	like: IconValue | null;
	liked: IconValue | null;
	comment: IconValue | null;
	repost: IconValue | null;
}

/**
 * Props
 */
interface StatusActionsProps {
	status: Status;
	onLike: () => Promise<StatusActionResponse>;
	onRepost: () => Promise<RepostResponse>;
	actionState: ActionState;
	icons: ActionIcons;
	onCommentClick?: () => void;
	onShareClick?: () => void;
	className?: string;
}

/**
 * StatusActions Component
 */
export function StatusActions({
	status,
	onLike,
	onRepost,
	actionState,
	icons,
	onCommentClick,
	onShareClick,
	className = '',
}: StatusActionsProps): JSX.Element {
	const strings = useStrings();
	const permissions = usePermissions();

	// Like animation state
	const [isLikeAnimating, setIsLikeAnimating] = useState(false);

	// Handle like click
	const handleLikeClick = useCallback(async () => {
		if (actionState.isLiking || !permissions.is_logged_in) return;

		// Trigger animation
		setIsLikeAnimating(true);
		setTimeout(() => setIsLikeAnimating(false), 300);

		await onLike();
	}, [actionState.isLiking, permissions.is_logged_in, onLike]);

	// Handle repost click
	const handleRepostClick = useCallback(async () => {
		if (actionState.isReposting || !permissions.is_logged_in) return;
		await onRepost();
	}, [actionState.isReposting, permissions.is_logged_in, onRepost]);

	// Get current like/repost state
	const hasLiked = status.current_user.has_liked;
	const hasReposted = status.current_user.has_reposted;

	// Format counts
	const likesCount = status.likes.count;
	const repliesCount = status.replies.count;

	// Like button classes
	const likeClasses = [
		'vxf-action',
		'vxf-action--like',
		hasLiked && 'vxf-action--active',
		actionState.isLiking && 'vxf-action--loading',
		isLikeAnimating && 'vxf-action--animating',
	]
		.filter(Boolean)
		.join(' ');

	// Repost button classes
	const repostClasses = [
		'vxf-action',
		'vxf-action--repost',
		hasReposted && 'vxf-action--active',
		actionState.isReposting && 'vxf-action--loading',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={`vxf-actions ${className}`}>
			{/* Like Button */}
			<button
				type="button"
				className={likeClasses}
				onClick={handleLikeClick}
				disabled={actionState.isLiking || !permissions.is_logged_in}
				aria-label={hasLiked ? strings.unlike : strings.like}
				aria-pressed={hasLiked}
			>
				<span className="vxf-action-icon">
					{hasLiked && (icons.liked as any)?.svg ? (
						<span dangerouslySetInnerHTML={{ __html: (icons.liked as any).svg }} />
					) : (icons.like as any)?.svg ? (
						<span dangerouslySetInnerHTML={{ __html: (icons.like as any).svg }} />
					) : (
						<DefaultLikeIcon filled={hasLiked} />
					)}
				</span>
				{likesCount > 0 && (
					<span className="vxf-action-count">
						{formatCompactNumber(likesCount)}
					</span>
				)}
			</button>

			{/* Comment Button */}
			<button
				type="button"
				className="vxf-action vxf-action--comment"
				onClick={onCommentClick}
				aria-label={strings.comment}
			>
				<span className="vxf-action-icon">
					{(icons.comment as any)?.svg ? (
						<span dangerouslySetInnerHTML={{ __html: (icons.comment as any).svg }} />
					) : (
						<DefaultCommentIcon />
					)}
				</span>
				{repliesCount > 0 && (
					<span className="vxf-action-count">
						{formatCompactNumber(repliesCount)}
					</span>
				)}
			</button>

			{/* Repost Button */}
			{permissions.is_logged_in && (
				<button
					type="button"
					className={repostClasses}
					onClick={handleRepostClick}
					disabled={actionState.isReposting}
					aria-label={hasReposted ? strings.unrepost : strings.repost}
					aria-pressed={hasReposted}
				>
					<span className="vxf-action-icon">
						{(icons.repost as any)?.svg ? (
							<span dangerouslySetInnerHTML={{ __html: (icons.repost as any).svg }} />
						) : (
							<DefaultRepostIcon />
						)}
					</span>
				</button>
			)}

			{/* Share Button */}
			<button
				type="button"
				className="vxf-action vxf-action--share"
				onClick={onShareClick}
				aria-label={strings.share}
			>
				<span className="vxf-action-icon">
					<DefaultShareIcon />
				</span>
			</button>
		</div>
	);
}

/**
 * Default Like Icon
 */
function DefaultLikeIcon({ filled }: { filled: boolean }): JSX.Element {
	if (filled) {
		return (
			<svg viewBox="0 0 24 24" width="20" height="20">
				<path
					fill="currentColor"
					d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
				/>
			</svg>
		);
	}

	return (
		<svg viewBox="0 0 24 24" width="20" height="20">
			<path
				fill="currentColor"
				d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
			/>
		</svg>
	);
}

/**
 * Default Comment Icon
 */
function DefaultCommentIcon(): JSX.Element {
	return (
		<svg viewBox="0 0 24 24" width="20" height="20">
			<path
				fill="currentColor"
				d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"
			/>
		</svg>
	);
}

/**
 * Default Repost Icon
 */
function DefaultRepostIcon(): JSX.Element {
	return (
		<svg viewBox="0 0 24 24" width="20" height="20">
			<path
				fill="currentColor"
				d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"
			/>
		</svg>
	);
}

/**
 * Default Share Icon
 */
function DefaultShareIcon(): JSX.Element {
	return (
		<svg viewBox="0 0 24 24" width="20" height="20">
			<path
				fill="currentColor"
				d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
			/>
		</svg>
	);
}

export default StatusActions;
