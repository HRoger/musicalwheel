/**
 * StatusItem Component
 *
 * Renders a single timeline status post.
 * Matches Voxel's timeline status HTML structure EXACTLY for CSS compatibility.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status/status.php):
 * <div class="vxf-subgrid">
 *   <div class="vxf-post">
 *     <div class="vxf-head flexify">
 *       <a href="..." class="vxf-avatar flexify"><img></a>
 *       <div class="vxf-user flexify">
 *         <a href="...">Name<div class="vxf-icon vxf-verified">...</div></a>
 *         <span>
 *           <a href="...">@username</a>
 *           <a href="...">2h ago</a>
 *         </span>
 *       </div>
 *       <a href="#" class="vxf-icon vxf-more">...</a>
 *     </div>
 *     <div class="vxf-body">...</div>
 *     <div class="vxf-footer flexify">
 *       <div class="vxf-actions flexify">
 *         <a href="#" class="vxf-icon">...<div class="ray-holder">8 rays</div></a>
 *       </div>
 *       <div class="vxf-details flexify">...</div>
 *     </div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, useRef, type MouseEvent } from 'react';
import { useTimelineAttributes, useStatusActions, useStrings, useCurrentUser, useTimelineConfig } from '../hooks';
import { RichTextFormatter } from './RichTextFormatter';
import { MediaGallery } from './MediaGallery';
import { LinkPreview } from './LinkPreview';
import { QuotedStatus } from './QuotedStatus';
import { DropdownList } from './DropdownList';
import { CommentFeed } from './CommentFeed';
import { StatusComposer } from './StatusComposer';
import { QuoteComposer } from './QuoteComposer';
import type { Status } from '../types';

/**
 * Props
 */
interface StatusItemProps {
	status: Status;
	onStatusUpdate?: (status: Status) => void;
	onStatusDelete?: (statusId: number) => void;
	onQuote?: (quotedStatus: Status) => void;
	repostedBy?: Status;
	isQuoted?: boolean;
	className?: string;
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
 * StatusItem Component
 * Matches Voxel's vxf-subgrid > vxf-post structure exactly
 */
export function StatusItem({
	status,
	onStatusUpdate,
	onStatusDelete,
	onQuote,
	repostedBy,
	isQuoted = false,
	className = '',
}: StatusItemProps): JSX.Element {
	const attributes = useTimelineAttributes();
	const strings = useStrings();
	const currentUser = useCurrentUser();
	const { config } = useTimelineConfig();

	// Refs for dropdown positioning
	const actionsTargetRef = useRef<HTMLAnchorElement>(null);
	const repostBtnRef = useRef<HTMLAnchorElement>(null);

	// Dropdown menu state
	const [showActions, setShowActions] = useState(false);
	const [showRepost, setShowRepost] = useState(false);
	const [showQuoteBox, setShowQuoteBox] = useState(false);
	const [showComments, setShowComments] = useState(false);
	const [focusComposer, setFocusComposer] = useState(false); // Whether to focus composer when opening

	// Screen mode: 'view' or 'edit' (matches Voxel's screen state)
	const [screen, setScreen] = useState<'view' | 'edit'>('view');

	// Content expansion state
	const [readMore, setReadMore] = useState(false);

	// Status actions hook
	const {
		actionState,
		optimisticStatus,
		handleLike,
		handleRepost,
		handleDelete,
		handleApprove,
		handleMarkPending,
	} = useStatusActions(status, onStatusUpdate, onStatusDelete);

	// Merge optimistic updates with status
	const displayStatus = useMemo(
		() => ({
			...status,
			...optimisticStatus,
			likes: {
				...status.likes,
				...optimisticStatus.likes,
			},
			current_user: {
				...status.current_user,
				...optimisticStatus.current_user,
			},
		}),
		[status, optimisticStatus]
	);

	// Handle like click
	const handleLikeClick = useCallback(
		(e: MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			handleLike();
		},
		[handleLike]
	);

	// Handle repost click
	const handleRepostClick = useCallback(
		(e: MouseEvent<HTMLAnchorElement>) => {
			e.preventDefault();
			handleRepost();
			setShowRepost(false);
		},
		[handleRepost]
	);

	// Handle delete click - use native confirm() like Voxel does
	// Matches voxel-timeline-main.beautified.js line 414: if (!confirm(Voxel_Config.l10n.confirmAction)) return;
	const handleDeleteClick = useCallback(async () => {
		// Get l10n confirm message from Voxel_Config if available
		const confirmMsg = (window as any).Voxel_Config?.l10n?.confirmAction ?? strings.delete_confirm ?? 'Are you sure?';
		if (!confirm(confirmMsg)) return;

		setShowActions(false);
		await handleDelete();
	}, [handleDelete, strings.delete_confirm]);

	// Copy link to clipboard
	const copyLink = useCallback(async () => {
		try {
			const url = status.link ?? window.location.href;
			await navigator.clipboard.writeText(url);
			// Show Voxel toast if available, otherwise use console
			if (typeof window !== 'undefined' && (window as any).Voxel?.alert) {
				(window as any).Voxel.alert(strings.copied ?? 'Copied to clipboard');
			}
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
		setShowActions(false);
	}, [status.link, strings.copied]);

	// Share via Web Share API
	const share = useCallback(() => {
		const nav = navigator as any;
		if (nav.share) {
			nav.share({
				url: status.link ?? window.location.href,
			});
		}
		setShowActions(false);
	}, [status.link]);

	// Timestamp - Voxel already formats this via get_time_for_display() / minimal_time_diff()
	// It returns strings like "now", "5m", "2h", "3d" - DO NOT parse as date
	const timestamp = status.created_at;

	// Get publisher info
	const publisher = status.publisher;
	const avatarUrl = publisher.avatar_url ?? '';
	const displayName = publisher.display_name ?? '';
	const username = publisher.username ?? '';
	const profileUrl = publisher.link ?? '#';

	// Check if liked/reposted
	const hasLiked = displayStatus.current_user?.has_liked ?? false;
	const hasReposted = displayStatus.current_user?.has_reposted ?? false;

	// Get l10n strings from config
	const l10n = (config?.strings ?? {}) as Partial<import('../types').TimelineStrings>;

	// Build classes
	const postClasses = ['vxf-post', actionState.isDeleting ? 'vx-pending' : '', className].filter(Boolean).join(' ');

	// Handle repost_of case - render the original status
	if (status.repost_of) {
		return (
			<StatusItem
				status={status.repost_of}
				onStatusUpdate={(updated) => {
					// Update the repost_of in parent
					onStatusUpdate?.({ ...status, repost_of: updated });
				}}
				repostedBy={status}
				onStatusDelete={onStatusDelete}
			/>
		);
	}

	return (
		<div className="vxf-subgrid">
			<div className={postClasses}>
				{/* Annotation/Repost header */}
				{status.annotation && (
					<div className="vxf-highlight flexify">
						<div className="vxf-icon" dangerouslySetInnerHTML={{ __html: status.annotation.icon ?? '' }} />
						<span>{status.annotation.text}</span>
					</div>
				)}
				{!status.annotation && repostedBy && (
					<div className="vxf-highlight flexify">
						{repostedBy.annotation ? (
							<>
								<div className="vxf-icon" dangerouslySetInnerHTML={{ __html: repostedBy.annotation.icon ?? '' }} />
								<span>{repostedBy.annotation.text}</span>
							</>
						) : (
							<>
								<div className="vxf-icon" dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.repost ?? '' }} />
								<span>
									<a href={repostedBy.publisher.link}>{repostedBy.publisher.display_name}</a>
									{' '}{l10n.reposted ?? 'reposted'}
								</span>
							</>
						)}
					</div>
				)}

				{/* Head - matches Voxel's vxf-head flexify structure */}
				<div className="vxf-head flexify">
					{/* Avatar - Voxel uses <a> not <div> */}
					<a href={profileUrl} className="vxf-avatar flexify">
						<img src={avatarUrl} alt={displayName} />
					</a>

					{/* User info - matches Voxel's nested structure */}
					<div className="vxf-user flexify">
						<a href={profileUrl}>
							{displayName}
							{publisher.is_verified && (
								<div className="vxf-icon vxf-verified" dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.verified ?? '' }} />
							)}
						</a>
						<span>
							{username && (
								<a href={profileUrl}>@{username}</a>
							)}
							{status.post?.link && status.post?.title && (
								<a href={status.post.link}>{status.post.title}</a>
							)}
							<a
								href={status.link ?? '#'}
								title={status.edited_at ? l10n.editedOn?.replace('@date', status.edited_at) : undefined}
							>
								{timestamp}
							</a>
							{status.badges?.map((badge) => (
								<span key={badge.key} data-badge={badge.key} className="vxf-badge">
									{badge.label}
								</span>
							))}
						</span>
					</div>

					{/* More menu - Voxel uses <a> with direct SVG (no span wrapper) */}
					<a
						href="#"
						className="vxf-icon vxf-more"
						ref={actionsTargetRef}
						onClick={(e) => e.preventDefault()}
						onMouseDown={() => setShowActions((prev) => !prev)}
						dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.more ?? '' }}
					/>

					{/* Actions dropdown - uses DropdownList with Portal like Voxel */}
					{showActions && (
						<DropdownList
							target={actionsTargetRef.current}
							onBlur={() => setShowActions(false)}
						>
							<li>
								<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); copyLink(); setShowActions(false); }}>
									<span>{l10n.copy_link ?? 'Copy link'}</span>
								</a>
							</li>
							{(navigator as any).share && (
								<li>
									<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); share(); setShowActions(false); }}>
										<span>{l10n.share_via ?? 'Share via'}</span>
									</a>
								</li>
							)}
							{displayStatus.current_user?.can_edit && status.link_preview && (
								<li>
									<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); setShowActions(false); }}>
										<span>{l10n.remove_link_preview ?? 'Remove link preview'}</span>
									</a>
								</li>
							)}
							{displayStatus.current_user?.can_edit && config?.features?.posts_editable && (
								<li>
									<a href="#" className="flexify" onClick={(e) => { e.preventDefault(); setScreen('edit'); setShowActions(false); }}>
										<span>{l10n.edit ?? 'Edit'}</span>
									</a>
								</li>
							)}
							{displayStatus.current_user?.can_moderate && status.is_pending && (
								<li>
									<a href="#" className="flexify" onClick={async (e) => { e.preventDefault(); await handleApprove(); setShowActions(false); }}>
										<span>{l10n.approve ?? 'Approve'}</span>
									</a>
								</li>
							)}
							{displayStatus.current_user?.can_moderate && !status.is_pending && (
								<li>
									<a href="#" className="flexify" onClick={async (e) => { e.preventDefault(); await handleMarkPending(); setShowActions(false); }}>
										<span>{l10n.mark_pending ?? 'Mark as pending'}</span>
									</a>
								</li>
							)}
							{displayStatus.current_user?.can_delete && (
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
					{/* Edit mode - uses StatusComposer (matches Voxel's status-composer reuse) */}
					{screen === 'edit' && (
						<StatusComposer
							status={status}
							onCancel={() => setScreen('view')}
							onUpdate={(updatedStatus) => {
								onStatusUpdate?.(updatedStatus);
								setScreen('view');
							}}
							className="vxf-edit-mode"
						/>
					)}

					{/* Review score - if this is a review (only show in view mode) */}
					{screen === 'view' && status.review && (
						<div className="rev-score" style={{ '--ts-accent-1': status.review.level?.color } as React.CSSProperties}>
							{status.review.config?.input_mode === 'stars' ? (
								<ul className="rev-star-score flexify simplify-ul">
									{[-2, -1, 0, 1, 2].map((levelScore) => (
										<li key={levelScore} className={status.review!.score >= (levelScore - 0.5) ? 'active' : ''}>
											<span dangerouslySetInnerHTML={{
												__html: status.review!.score >= (levelScore - 0.5)
													? (status.review!.config?.active_icon ?? status.review!.config?.default_icon ?? '')
													: (status.review!.config?.default_icon ?? '')
											}} />
										</li>
									))}
								</ul>
							) : (
								<div className="rev-num-score flexify">
									{status.review.formatted_score}
								</div>
							)}
							<span>{status.review.level?.label}</span>
						</div>
					)}

					{/* Text Content - hidden when YouTube embed is shown (matches Voxel behavior) */}
					{/* Voxel clears vxf-body-text content when link_preview.type === 'youtube' */}
					{screen === 'view' && status.content && status.link_preview?.type !== 'youtube' && (
						<>
							<div className="vxf-body-text">
								<RichTextFormatter
									content={status.content}
									maxLength={280}
									isExpanded={readMore}
									onToggleExpand={() => setReadMore(!readMore)}
								/>
							</div>
						</>
					)}
					{/* Empty body-text div when YouTube embed (matches Voxel's empty div) */}
					{screen === 'view' && status.link_preview?.type === 'youtube' && (
						<div className="vxf-body-text"></div>
					)}

					{/* Private post notice */}
					{screen === 'view' && status.private && (
						<div className="vxf-body-text" style={{ opacity: 0.5 }}>
							{l10n.restricted_visibility ?? 'This post has restricted visibility.'}
						</div>
					)}

					{/* Media Gallery */}
					{screen === 'view' && status.files && status.files.length > 0 && (
						<MediaGallery
							files={status.files}
							galleryIcon={attributes.galleryIcon}
							statusId={status.id}
						/>
					)}

					{/* Link Preview */}
					{screen === 'view' && status.link_preview && (
						<LinkPreview
							preview={status.link_preview}
							externalIcon={attributes.externalIcon}
						/>
					)}

					{/* Quoted Status */}
					{screen === 'view' && status.quote_of && (
						<QuotedStatus status={status.quote_of} truncateAt={140} />
					)}
				</div>

				{/* Footer - matches Voxel's vxf-footer flexify structure */}
				{!isQuoted && (
					<div className="vxf-footer flexify">
						{/* Actions */}
						<div className="vxf-actions flexify">
							{/* Like button - matches Voxel: <a> with SVG + ray-holder */}
							<a
								href="#"
								onClick={handleLikeClick}
								className={`vxf-icon ${hasLiked ? 'vxf-liked' : ''} ${actionState.isLiking ? 'vx-inert' : ''} ${status.is_pending && !hasLiked ? 'vx-pending' : ''}`}
							>
								<span dangerouslySetInnerHTML={{ __html: hasLiked ? ((config?.icons as any)?.liked ?? '') : ((config?.icons as any)?.like ?? '') }} />
								<RayHolder />
							</a>

							{/* Repost button - if enabled (config.features.reposts) */}
							{config?.features?.reposts && (
								<a
									href="#"
									className={`vxf-icon ${hasReposted ? 'vxf-reposted' : ''} ${actionState.isReposting ? 'vx-inert' : ''} ${status.is_pending ? 'vx-pending' : ''}`}
									ref={repostBtnRef}
									onClick={(e) => e.preventDefault()}
									onMouseDown={() => setShowRepost((prev) => !prev)}
								>
									<span dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.repost ?? '' }} />
									<RayHolder />
								</a>
							)}

							{/* Reply button - toggles comments AND focuses composer (Voxel's writeReply behavior) */}
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									if (!currentUser) return; // Auth required in real implementation
									if (showComments) {
										setShowComments(false);
										setFocusComposer(false);
									} else {
										setShowComments(true);
										setFocusComposer(true); // Focus composer when opening via reply button
									}
								}}
								className={`vxf-icon ${status.is_pending ? 'vx-pending' : ''}`}
								dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.reply ?? '' }}
							/>

							{/* Comment count button - if has replies - ONLY toggles visibility (no focus) */}
							{status.replies?.count > 0 && (
								<a
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setShowComments(!showComments);
										setFocusComposer(false); // Don't focus when just viewing comments
									}}
									className="vxf-icon vxf-has-replies"
									dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.comment ?? '' }}
								/>
							)}
						</div>

						{/* Details */}
						{(displayStatus.likes?.count > 0 || displayStatus.replies?.count > 0) && (
							<div className="vxf-details flexify">
								{/* Recent likes avatars */}
								{displayStatus.likes?.last3?.length > 0 && (
									<div className="vxf-recent-likes flexify">
										{displayStatus.likes.last3.map((like, index) => (
											<img key={index} src={like.avatar_url} alt={like.display_name} title={like.display_name} />
										))}
									</div>
								)}
								<span>
									{displayStatus.likes?.count > 0 && (
										<span>
											{displayStatus.likes.count === 1
												? (l10n.oneLike ?? '1 like')
												: (l10n.countLikes?.replace('@count', String(displayStatus.likes.count)) ?? `${displayStatus.likes.count} likes`)}
										</span>
									)}
									{displayStatus.replies?.count > 0 && (
										<a href="#" onClick={(e) => { e.preventDefault(); setShowComments(!showComments); }}>
											{displayStatus.replies.count === 1
												? (l10n.oneReply ?? '1 reply')
												: (l10n.countReplies?.replace('@count', String(displayStatus.replies.count)) ?? `${displayStatus.replies.count} replies`)}
										</a>
									)}
								</span>
							</div>
						)}

						{/* Repost dropdown - uses DropdownList with Portal like Voxel */}
						{showRepost && (
							<DropdownList
								target={repostBtnRef.current}
								onBlur={() => setShowRepost(false)}
							>
								<li>
									<a href="#" className="flexify" onClick={handleRepostClick}>
										<span>{hasReposted ? (l10n.unrepost ?? 'Unrepost') : (l10n.repost ?? 'Repost')}</span>
									</a>
								</li>
								<li>
									<a href="#" className="flexify" onClick={(e) => {
										e.preventDefault();
										setShowRepost(false);
										// Open quote composer (matches Voxel's quoteStatus() behavior)
										if (!(window as any).Voxel_Config?.is_logged_in) {
											(window as any).Voxel?.authRequired?.();
											return;
										}
										setShowQuoteBox(true);
									}}>
										<span>{l10n.quote ?? 'Quote'}</span>
									</a>
								</li>
							</DropdownList>
						)}
					</div>
				)}
			</div>

			{/* Quote composer - when quoting (matches Voxel's showQuoteBox behavior) */}
			{showQuoteBox && (
				<QuoteComposer
					quoteOf={status}
					onQuotePublished={(quotedStatus) => {
						setShowQuoteBox(false);
						onQuote?.(quotedStatus);
					}}
					onCancel={() => setShowQuoteBox(false)}
				/>
			)}

			{/* Comment feed - when showing comments */}
			{showComments && (
				<CommentFeed
					status={status}
					depth={0}
					maxDepth={config?.features?.comment_depth ?? 2}
					focusComposer={focusComposer}
				/>
			)}
		</div>
	);
}

export default StatusItem;
