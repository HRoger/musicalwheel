/**
 * CommentItem Component
 *
 * Renders a single comment matching Voxel's comment.php structure EXACTLY.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/comment/comment.php):
 * <div class="vxf-post vxf-comment">
 *   <div class="vxf-head flexify">
 *     <a href="..." class="vxf-avatar flexify"><img></a>
 *     <div class="vxf-user flexify">
 *       <a href="...">Name<div class="vxf-icon vxf-verified">...</div></a>
 *       <span>
 *         <a href="...">@username</a>
 *         <a href="...">2h ago</a>
 *         <span class="vxf-badge">...</span>
 *       </span>
 *     </div>
 *     <a href="#" class="vxf-icon vxf-more">...</a>
 *   </div>
 *   <div class="vxf-body">
 *     <div class="vxf-body-text">...</div>
 *     <ul class="vxf-gallery">...</ul>
 *   </div>
 *   <div class="vxf-footer flexify">
 *     <div class="vxf-actions flexify">
 *       <a href="#" class="vxf-icon [vxf-liked]">...<div class="ray-holder">8 rays</div></a>
 *       <a href="#" class="vxf-icon">reply icon</a>
 *       <a href="#" class="vxf-icon vxf-has-replies">comment icon</a>
 *     </div>
 *     <div class="vxf-details flexify">...</div>
 *   </div>
 *   <!-- Nested comments -->
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, useRef, type MouseEvent } from 'react';
import { useTimelineConfig, useStrings, useCurrentUser, useCommentActions, usePostContext } from '../hooks';
import { RichTextFormatter } from './RichTextFormatter';
import { MediaGallery } from './MediaGallery';
import { DropdownList } from './DropdownList';
import { CommentComposer } from './CommentComposer';
import type { Comment, Status } from '../types';

/**
 * Props
 */
interface CommentItemProps {
	comment: Comment;
	status: Status;
	depth: number;
	maxDepth?: number;
	onCommentUpdate?: (comment: Comment) => void;
	onCommentDelete?: (commentId: number) => void;
	onShowReplies?: () => void;
	onReplyClick?: () => void;
	showRepliesButton?: boolean;
}

/**
 * Ray holder for like animation (matches Voxel's 8 rays exactly)
 */
const RayHolder = () => (
	<div className="ray-holder">
		{[...Array(8)].map((_, i) => (
			<div key={i} className="ray" />
		))}
	</div>
);

/**
 * CommentItem Component
 * Matches Voxel's vxf-post vxf-comment structure
 */
export function CommentItem({
	comment,
	status,
	depth,
	maxDepth = 2,
	onCommentUpdate,
	onCommentDelete,
	onShowReplies,
	onReplyClick,
	showRepliesButton = true,
}: CommentItemProps): JSX.Element | null {
	const { config } = useTimelineConfig();
	const strings = useStrings();
	const l10n = (config?.strings ?? {}) as any;
	const currentUser = useCurrentUser();
	const postContext = usePostContext();

	// Refs for dropdown positioning
	const moreButtonRef = useRef<HTMLAnchorElement>(null);

	// UI state
	const [showActions, setShowActions] = useState(false);
	const [readMore, setReadMore] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	// Use comment actions hook
	const {
		actionState,
		optimisticComment,
		handleLike,
		handleDelete,
		handleApprove,
		handleMarkPending,
	} = useCommentActions(comment, onCommentUpdate, onCommentDelete);

	// Merge optimistic updates
	const displayComment = useMemo(
		() => ({
			...comment,
			...optimisticComment,
			likes: {
				...comment.likes,
				...optimisticComment.likes,
			},
			current_user: {
				...comment.current_user,
				...optimisticComment.current_user,
			},
		}),
		[comment, optimisticComment]
	);

	// Get l10n strings


	// Publisher info
	const publisher = comment.publisher;

	if (!publisher) {
		return null; // Handle malformed comment data
	}

	const avatarUrl = publisher.avatar_url ?? '';
	const displayName = publisher.display_name ?? '';
	const username = publisher.username ?? '';
	const profileUrl = publisher.link ?? '#';

	// Timestamp - Voxel already formats this
	const timestamp = comment.created_at;

	// Check if liked
	const hasLiked = displayComment.current_user?.has_liked ?? false;

	// Has replies?
	const hasReplies = comment.replies?.count > 0;

	// Can nest more?
	const canNest = depth < maxDepth;

	// Handle like click
	const handleLikeClick = useCallback(
		(e: MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			handleLike();
		},
		[handleLike]
	);

	// Handle delete click - use Voxel.dialog() for styled confirmation
	// Matches Voxel's implementation: Voxel.dialog({ message, type, actions, hideClose, timeout })
	const handleDeleteClick = useCallback(async () => {
		const confirmMsg = (window as any).Voxel_Config?.l10n?.confirmAction ?? strings.delete_comment_confirm ?? 'Are you sure you want to proceed with this action?';
		const yesLabel = (window as any).Voxel_Config?.l10n?.yes ?? 'Yes';
		const noLabel = (window as any).Voxel_Config?.l10n?.no ?? 'No';

		if (typeof window !== 'undefined' && (window as any).Voxel?.dialog) {
			// Use Voxel's styled dialog
			(window as any).Voxel.dialog({
				message: confirmMsg,
				type: 'warning',
				actions: [
					{
						label: yesLabel,
						onClick: async () => {
							setShowActions(false);
							await handleDelete();
							// Show success toast
							if ((window as any).Voxel?.alert) {
								(window as any).Voxel.alert('Deleted');
							}
						}
					},
					{
						label: noLabel,
						onClick: () => {
							setShowActions(false);
						}
					}
				],
				hideClose: true,
				timeout: 7500
			});
		} else {
			// Fallback to native confirm
			if (!confirm(confirmMsg)) return;
			setShowActions(false);
			await handleDelete();
		}
	}, [handleDelete, strings.delete_comment_confirm]);

	// Handle edit click
	const handleEditClick = useCallback(() => {
		setIsEditing(true);
		setShowActions(false);
	}, []);

	// Build classes
	const commentClasses = [
		'vxf-post',
		'vxf-comment',
		actionState.isDeleting ? 'vx-pending' : '',
	].filter(Boolean).join(' ');

	return (
		<div className={commentClasses}>
			{/* Head - matches Voxel's vxf-head flexify structure */}
			<div className="vxf-head flexify">
				{/* Avatar */}
				<a href={profileUrl} className="vxf-avatar flexify">
					<img src={avatarUrl} alt={displayName} />
				</a>

				{/* User info */}
				<div className="vxf-user flexify">
					<a href={profileUrl}>
						{displayName}
						{publisher.is_verified && (
							<div className="vxf-icon vxf-verified" dangerouslySetInnerHTML={{ __html: config?.icons?.verified ?? '' }} />
						)}
					</a>
					<span>
						{username && postContext?.show_usernames !== false && (
							<a href={profileUrl}>@{username}</a>
						)}
						<a
							href={comment.link ?? '#'}
							title={comment.edited_at ? l10n.editedOn?.replace('@date', comment.edited_at) : undefined}
						>
							{timestamp}
						</a>
						{comment.badges?.map((badge) => (
							<span key={badge.key} data-badge={badge.key} className="vxf-badge">
								{badge.label}
							</span>
						))}
					</span>
				</div>

				{/* More menu - always shown (matches Voxel comment.php line 37) */}
				<a
					href="#"
					className="vxf-icon vxf-more"
					ref={moreButtonRef}
					onClick={(e) => e.preventDefault()}
					onMouseDown={() => setShowActions((prev) => !prev)}
					dangerouslySetInnerHTML={{ __html: config?.icons?.more ?? '' }}
				/>

				{/* Actions dropdown - matches Voxel comment.php lines 40-72 */}
				{showActions && (
					<DropdownList
						target={moreButtonRef.current}
						onBlur={() => setShowActions(false)}
					>
						{/* Copy link - always visible (Voxel line 41-45) */}
						<li>
							<a href="#" className="flexify" onClick={async (e) => {
								e.preventDefault();
								try {
									const url = comment.link ?? window.location.href;
									await navigator.clipboard.writeText(url);
									if ((window as any).Voxel?.alert) {
										(window as any).Voxel.alert(l10n.copied ?? 'Copied to clipboard');
									}
								} catch (err) {
									console.error('Failed to copy link:', err);
								}
								setShowActions(false);
							}}>
								<span>{l10n.copy_link ?? 'Copy link'}</span>
							</a>
						</li>
						{/* Share - if Web Share API available (Voxel line 46-50) */}
						{(navigator as any).share && (
							<li>
								<a href="#" className="flexify" onClick={(e) => {
									e.preventDefault();
									(navigator as any).share({ url: comment.link ?? window.location.href });
									setShowActions(false);
								}}>
									<span>{l10n.share ?? 'Share'}</span>
								</a>
							</li>
						)}
						{displayComment.current_user?.can_edit && (
							<li>
								<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); handleEditClick(); }}>
									<span>{l10n.edit ?? 'Edit'}</span>
								</a>
							</li>
						)}
						{displayComment.current_user?.can_moderate && comment.is_pending && (
							<li>
								<a href="#" className="flexify" onClick={async (e) => { e.preventDefault(); await handleApprove(); setShowActions(false); }}>
									<span>{l10n.approve ?? 'Approve'}</span>
								</a>
							</li>
						)}
						{displayComment.current_user?.can_moderate && !comment.is_pending && (
							<li>
								<a href="#" className="flexify" onClick={async (e) => { e.preventDefault(); await handleMarkPending(); setShowActions(false); }}>
									<span>{l10n.mark_pending ?? 'Mark as pending'}</span>
								</a>
							</li>
						)}
						{displayComment.current_user?.can_delete && (
							<li>
								<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); handleDeleteClick(); }}>
									<span>{l10n.delete ?? 'Delete'}</span>
								</a>
							</li>
						)}
					</DropdownList>
				)}
			</div>

			{/* Body - matches Voxel's vxf-body structure */}
			<div className="vxf-body">
				{isEditing ? (
					<CommentComposer
						statusId={status.id}
						parentId={comment.parent_id ?? undefined}
						comment={comment}
						onCommentUpdated={(updatedComment) => {
							setIsEditing(false);
							onCommentUpdate?.(updatedComment);
						}}
						onCancel={() => setIsEditing(false)}
						autoFocus
					/>
				) : (
					<>
						{/* Text content */}
						{comment.content && (
							<div className="vxf-body-text">
								<RichTextFormatter
									content={comment.content}
									maxLength={280}
									isExpanded={readMore}
									onToggleExpand={() => setReadMore(!readMore)}
								/>
							</div>
						)}

						{/* Media Gallery */}
						{comment.files && comment.files.length > 0 && (
							<MediaGallery
								files={comment.files}
								statusId={comment.id}
							/>
						)}
					</>
				)}
			</div>

			{/* Footer - matches Voxel's vxf-footer flexify structure */}
			<div className="vxf-footer flexify">
				{/* Actions */}
				<div className="vxf-actions flexify">
					{/* Like button */}
					<a
						href="#"
						onClick={handleLikeClick}
						className={`vxf-icon ${hasLiked ? 'vxf-liked' : ''} ${actionState.isLiking ? 'vx-inert' : ''} ${(status.is_pending || comment.is_pending) && !hasLiked ? 'vx-pending' : ''}`}
					>
						<span dangerouslySetInnerHTML={{ __html: hasLiked ? (config?.icons?.liked ?? '') : (config?.icons?.like ?? '') }} />
						<RayHolder />
					</a>

					{/* Reply button */}
					{currentUser && canNest && (
						<a
							href="#"
							onClick={(e) => { e.preventDefault(); onReplyClick?.(); }}
							className={`vxf-icon ${status.is_pending || comment.is_pending ? 'vx-pending' : ''}`}
							dangerouslySetInnerHTML={{ __html: config?.icons?.reply ?? '' }}
						/>
					)}

					{/* Comment icon - only if has replies */}
					{hasReplies && showRepliesButton && (
						<a
							href="#"
							onClick={(e) => { e.preventDefault(); onShowReplies?.(); }}
							className="vxf-icon vxf-has-replies"
						>
							{/* Voxel's comment bubble icon - matching templates/widgets/timeline/comment/comment.php */}
							<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
								<path d="M7 10.5957C7 10.1815 7.33579 9.8457 7.75 9.8457H16.25C16.6642 9.8457 17 10.1815 17 10.5957C17 11.0099 16.6642 11.3457 16.25 11.3457H7.75C7.33579 11.3457 7 11.0099 7 10.5957Z"></path>
								<path d="M7.75 12.8457C7.33579 12.8457 7 13.1815 7 13.5957C7 14.0099 7.33579 14.3457 7.75 14.3457H12.75C13.1642 14.3457 13.5 14.0099 13.5 13.5957C13.5 13.1815 13.1642 12.8457 12.75 12.8457H7.75Z"></path>
								<path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12V20H12C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5H3.25C2.83579 21.5 2.5 21.1642 2.5 20.75V12Z"></path>
							</svg>
						</a>
					)}
				</div>

				{/* Details */}
				{(displayComment.likes?.count > 0 || comment.replies?.count > 0) && (
					<div className="vxf-details flexify">
						{/* Recent likes avatars */}
						{displayComment.likes?.last3?.length > 0 && (
							<div className="vxf-recent-likes flexify">
								{displayComment.likes.last3.filter(like => like && like.avatar_url).map((like, index) => (
									<img key={index} src={like.avatar_url} alt={like.display_name} title={like.display_name} />
								))}
							</div>
						)}
						<span>
							{displayComment.likes?.count > 0 && (
								<span>
									{displayComment.likes.count === 1
										? (l10n.oneLike ?? '1 like')
										: (l10n.countLikes?.replace('@count', String(displayComment.likes.count)) ?? `${displayComment.likes.count} likes`)}
								</span>
							)}
							{comment.replies?.count > 0 && (
								<a href="#" onClick={(e) => { e.preventDefault(); onShowReplies?.(); }}>
									{comment.replies.count === 1
										? (l10n.oneReply ?? '1 reply')
										: (l10n.countReplies?.replace('@count', String(comment.replies.count)) ?? `${comment.replies.count} replies`)}
								</a>
							)}
						</span>
					</div>
				)}
			</div>
		</div >
	);
}

export default CommentItem;
