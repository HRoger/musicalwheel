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
import { useTimelineConfig, useStrings, useCurrentUser, useCommentActions } from '../hooks';
import { RichTextFormatter } from './RichTextFormatter';
import { MediaGallery } from './MediaGallery';
import { DropdownList } from './DropdownList';
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
}: CommentItemProps): JSX.Element {
	const { config } = useTimelineConfig();
	const strings = useStrings();
	const currentUser = useCurrentUser();

	// Refs for dropdown positioning
	const moreButtonRef = useRef<HTMLAnchorElement>(null);

	// UI state
	const [showActions, setShowActions] = useState(false);
	const [readMore, setReadMore] = useState(false);

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
	const l10n = config?.strings ?? {};

	// Publisher info
	const publisher = comment.publisher;
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

	// Handle delete click - use native confirm() with Voxel_Config.l10n if available
	// Matches voxel-timeline-comments.beautified.js line 521: Voxel.prompt(Voxel_Config.l10n.confirmAction, ...)
	// Using native confirm() for consistency with StatusItem and simpler implementation
	const handleDeleteClick = useCallback(async () => {
		const confirmMsg = (window as any).Voxel_Config?.l10n?.confirmAction ?? strings.delete_comment_confirm ?? 'Are you sure?';
		if (!confirm(confirmMsg)) return;

		setShowActions(false);
		await handleDelete();
	}, [handleDelete, strings.delete_comment_confirm]);

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
						{username && (
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

				{/* More menu */}
				{(displayComment.current_user?.can_edit ||
					displayComment.current_user?.can_delete ||
					displayComment.current_user?.can_moderate) && (
					<>
						<a
							href="#"
							className="vxf-icon vxf-more"
							ref={moreButtonRef}
							onClick={(e) => e.preventDefault()}
							onMouseDown={() => setShowActions((prev) => !prev)}
							dangerouslySetInnerHTML={{ __html: config?.icons?.more ?? '' }}
						/>

						{/* Actions dropdown */}
						{showActions && (
							<DropdownList
								target={moreButtonRef.current}
								onBlur={() => setShowActions(false)}
							>
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
					</>
				)}
			</div>

			{/* Body - matches Voxel's vxf-body structure */}
			<div className="vxf-body">
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
			</div>

			{/* Footer - matches Voxel's vxf-footer flexify structure */}
			<div className="vxf-footer flexify">
				{/* Actions */}
				<div className="vxf-actions flexify">
					{/* Like button */}
					<a
						href="#"
						onClick={handleLikeClick}
						className={`vxf-icon ${hasLiked ? 'vxf-liked' : ''} ${actionState.isLiking ? 'vx-inert' : ''} ${comment.is_pending && !hasLiked ? 'vx-pending' : ''}`}
					>
						<span dangerouslySetInnerHTML={{ __html: hasLiked ? (config?.icons?.liked ?? '') : (config?.icons?.like ?? '') }} />
						<RayHolder />
					</a>

					{/* Reply button */}
					{currentUser && canNest && (
						<a
							href="#"
							onClick={(e) => { e.preventDefault(); onReplyClick?.(); }}
							className={`vxf-icon ${comment.is_pending ? 'vx-pending' : ''}`}
							dangerouslySetInnerHTML={{ __html: config?.icons?.reply ?? '' }}
						/>
					)}

					{/* Comment icon - only if has replies */}
					{hasReplies && showRepliesButton && (
						<a
							href="#"
							onClick={(e) => { e.preventDefault(); onShowReplies?.(); }}
							className="vxf-icon vxf-has-replies"
							dangerouslySetInnerHTML={{ __html: config?.icons?.comment ?? '' }}
						/>
					)}
				</div>

				{/* Details */}
				{(displayComment.likes?.count > 0 || comment.replies?.count > 0) && (
					<div className="vxf-details flexify">
						{/* Recent likes avatars */}
						{displayComment.likes?.last3?.length > 0 && (
							<div className="vxf-recent-likes flexify">
								{displayComment.likes.last3.map((like, index) => (
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
		</div>
	);
}

export default CommentItem;
