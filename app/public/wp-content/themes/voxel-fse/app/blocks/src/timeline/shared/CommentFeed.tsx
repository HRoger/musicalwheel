/**
 * CommentFeed Component
 *
 * Container for comments list and composer matching Voxel's comment-feed.php EXACTLY.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/comment-feed/comment-feed.php):
 * <div class="vxf-comment-level vxf-subgrid [vxf-second-level if nested]">
 *   <!-- Comment list -->
 *   <template v-for="comment in comments">
 *     <comment :comment="comment" .../>
 *   </template>
 *
 *   <!-- Load more button -->
 *   <a href="#" class="ts-btn ts-btn-4" v-if="hasMore">Load more replies</a>
 *
 *   <!-- Loading state -->
 *   <div class="ts-no-posts" v-if="loading">
 *     <span class="ts-loader"></span>
 *   </div>
 *
 *   <!-- Comment composer -->
 *   <comment-composer :status="status" :parent="parent" v-if="canComment"/>
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useRef } from 'react';
import { useTimelineConfig, useCurrentUser, useCommentFeed } from '../hooks';
import { CommentItem } from './CommentItem';
import { CommentComposer } from './CommentComposer';
import type { Comment, Status } from '../types';

/**
 * Props
 */
interface CommentFeedProps {
	status: Status;
	parentComment?: Comment | null;
	depth?: number;
	maxDepth?: number;
	focusComposer?: boolean; // Whether to auto-focus the composer (from reply button click)
}

/**
 * CommentFeed Component
 * Matches Voxel's vxf-comment-level vxf-subgrid structure
 */
export function CommentFeed({
	status,
	parentComment = null,
	depth = 0,
	maxDepth = 2,
	focusComposer = false,
}: CommentFeedProps): JSX.Element {
	const { config } = useTimelineConfig();
	const currentUser = useCurrentUser();

	// Reply composer state - track which comment is being replied to
	const [replyingToId, setReplyingToId] = useState<number | null>(null);

	// State for expanded nested comments
	const [expandedCommentIds, setExpandedCommentIds] = useState<Set<number>>(new Set());

	// Use the comment feed hook
	const {
		comments,
		isLoading,
		isLoadingMore,
		hasMore,
		error,
		loadMore,
		addComment,
		updateComment,
		removeComment,
	} = useCommentFeed(status.id, parentComment?.id ?? undefined);

	// Get l10n strings
	const l10n = config?.strings ?? {};

	// Is this a nested level?
	const isNested = depth > 0;

	// Can still nest more?
	const canNest = depth < maxDepth;

	// Can user comment?
	const canComment = !!currentUser;

	/**
	 * Handle new comment published
	 */
	const handleCommentPublished = useCallback((comment: Comment) => {
		addComment(comment);
		setReplyingToId(null);
	}, [addComment]);

	/**
	 * Handle comment update
	 */
	const handleCommentUpdate = useCallback((comment: Comment) => {
		updateComment(comment);
	}, [updateComment]);

	/**
	 * Handle comment delete
	 */
	const handleCommentDelete = useCallback((commentId: number) => {
		removeComment(commentId);
	}, [removeComment]);

	/**
	 * Handle load more click
	 */
	const handleLoadMore = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		loadMore();
	}, [loadMore]);

	/**
	 * Toggle reply composer for a specific comment
	 */
	const handleReplyClick = useCallback((commentId: number) => {
		setReplyingToId((prev) => (prev === commentId ? null : commentId));
	}, []);

	/**
	 * Toggle showing nested replies
	 */
	const handleShowReplies = useCallback((commentId: number) => {
		setExpandedCommentIds((prev) => {
			const next = new Set(prev);
			if (next.has(commentId)) {
				next.delete(commentId);
			} else {
				next.add(commentId);
			}
			return next;
		});
	}, []);

	// Build classes - matches Voxel's structure
	const containerClasses = [
		'vxf-comment-level',
		'vxf-subgrid',
		isNested ? 'vxf-second-level' : '',
	].filter(Boolean).join(' ');

	return (
		<div className={containerClasses}>
			{/* Comment composer FIRST - Voxel shows composer before comments (not after empty state) */}
			{/* Only at top level, and NOT if status is pending */}
			{!isNested && canComment && !status.is_pending && (
				<CommentComposer
					statusId={status.id}
					onCommentPublished={handleCommentPublished}
					autoFocus={focusComposer}
				/>
			)}

			{/* Comments list */}
			{comments.map((comment) => (
				<div key={comment.id} className="vxf-comment-wrapper">
					<CommentItem
						comment={comment}
						status={status}
						depth={depth}
						maxDepth={maxDepth}
						onCommentUpdate={handleCommentUpdate}
						onCommentDelete={handleCommentDelete}
						onReplyClick={() => handleReplyClick(comment.id)}
						onShowReplies={() => handleShowReplies(comment.id)}
						showRepliesButton={canNest && comment.replies?.count > 0 && !expandedCommentIds.has(comment.id)}
					/>

					{/* Reply composer for this specific comment */}
					{replyingToId === comment.id && canNest && (
						<CommentComposer
							statusId={status.id}
							parentId={comment.id}
							onCommentPublished={handleCommentPublished}
							onCancel={() => setReplyingToId(null)}
							autoFocus
						/>
					)}

					{/* Nested replies (expanded) */}
					{canNest && expandedCommentIds.has(comment.id) && comment.replies?.count > 0 && (
						<CommentFeed
							status={status}
							parentComment={comment}
							depth={depth + 1}
							maxDepth={maxDepth}
						/>
					)}
				</div>
			))}

			{/* Load more button - matches Voxel's ts-btn structure */}
			{hasMore && !isLoading && comments.length > 0 && (
				<a
					href="#"
					className={`ts-btn ts-btn-4 ${isLoadingMore ? 'vx-pending' : ''}`}
					onClick={handleLoadMore}
				>
					{isLoadingMore ? (
						<span className="ts-loader" />
					) : (
						l10n.load_more_replies ?? 'Load more replies'
					)}
				</a>
			)}

			{/* Loading state - matches Voxel's structure */}
			{isLoading && (
				<div className="ts-no-posts">
					<span className="ts-loader" />
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className="ts-no-posts">
					<p>{error}</p>
				</div>
			)}
		</div>
	);
}

export default CommentFeed;
