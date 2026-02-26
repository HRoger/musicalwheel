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
import { useTimelineAttributes, useStatusActions, useStrings, useCurrentUser, useTimelineConfig, usePostContext } from '../hooks';
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
}: StatusItemProps): JSX.Element | null {
	const attributes = useTimelineAttributes();
	const strings = useStrings();
	const currentUser = useCurrentUser();
	const { config } = useTimelineConfig();
	const postContext = usePostContext();

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
		handlePin,
		handleUnpin,
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

	// Handle delete click - use Voxel.dialog() for styled confirmation
	// Matches Voxel's implementation: Voxel.dialog({ message, type, actions, hideClose, timeout })
	const handleDeleteClick = useCallback(async () => {
		const confirmMsg = (window as any).Voxel_Config?.l10n?.confirmAction ?? strings.delete_confirm ?? 'Are you sure you want to proceed with this action?';
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

	// Safety check for malformed status data (e.g. from API errors)
	if (!publisher) {
		return null;
	}

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
				{/* Annotation/Pinned/Repost header - matches Voxel: status.php:30-44 */}
				{status.annotation && (
					<div className="vxf-highlight flexify">
						<div className="vxf-icon" dangerouslySetInnerHTML={{ __html: status.annotation.icon ?? '' }} />
						<span>{status.annotation.text}</span>
					</div>
				)}
				{!status.annotation && displayStatus.is_pinned && (
					<div className="vxf-highlight flexify">
						<div className="vxf-icon" dangerouslySetInnerHTML={{ __html: (config?.icons as Record<string, string>)?.['pin'] ?? '' }} />
						<span>{l10n.pinned ?? 'Pinned'}</span>
					</div>
				)}
				{!status.annotation && !displayStatus.is_pinned && repostedBy && (
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
							{username && postContext?.show_usernames !== false && (
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
							{displayStatus.current_user?.can_pin_to_top && !displayStatus.is_pinned && (
								<li>
									<a href="#" className="flexify" onClick={async (e) => { e.preventDefault(); await handlePin(); setShowActions(false); }}>
										<span>{l10n.pin_to_top ?? 'Pin to top'}</span>
									</a>
								</li>
							)}
							{displayStatus.current_user?.can_pin_to_top && displayStatus.is_pinned && (
								<li>
									<a href="#" className="flexify" onClick={async (e) => { e.preventDefault(); await handleUnpin(); setShowActions(false); }}>
										<span>{l10n.unpin ?? 'Unpin'}</span>
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
					{/* Matches Voxel's status.php lines 109-141 */}
					{screen === 'view' && status.review && (
						<>
							<div className="rev-score" style={{ '--ts-accent-1': status.review.level?.color } as React.CSSProperties}>
								{status.review.config?.input_mode === 'stars' ? (
									<ul className="rev-star-score flexify simplify-ul">
										{[-2, -1, 0, 1, 2].map((levelScore) => (
											<li key={levelScore} className={status.review!.score >= (levelScore - 0.5) ? 'active' : ''}>
												<span dangerouslySetInnerHTML={{
													__html: status.review!.score >= (levelScore - 0.5)
														? (status.review!.config?.active_icon ?? status.review!.config?.default_icon ?? '')
														: (status.review!.config?.inactive_icon ?? status.review!.config?.default_icon ?? '')
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
							{/* Per-category breakdown - shown when 2+ categories (Voxel status.php lines 129-140) */}
							{status.review.categories && status.review.categories.length >= 2 && (
								<div className="rev-cats">
									{status.review.categories.map((category) => (
										<div
											key={category.key ?? category.label}
											className="review-cat"
											style={{ '--ts-accent-1': category.level?.color } as React.CSSProperties}
										>
											<span>{category.label}</span>
											<ul className="rev-chart simplify-ul">
												{[-2, -1, 0, 1, 2].map((levelScore) => (
													<li
														key={levelScore}
														className={category.score >= (levelScore - 0.5) ? 'active' : ''}
													/>
												))}
											</ul>
										</div>
									))}
								</div>
							)}
						</>
					)}

					{/* Text Content - hidden when YouTube embed is shown (matches Voxel behavior) */}
					{/* Voxel clears vxf-body-text content when link_preview.type === 'youtube' */}
					{screen === 'view' && status.content && status.link_preview?.type !== 'youtube' && (
						<div className="vxf-body-text">
							<RichTextFormatter
								content={status.content}
								maxLength={280}
								isExpanded={readMore}
								onToggleExpand={() => setReadMore(!readMore)}
								linkPreviewUrl={status.link_preview?.url}
							/>
						</div>
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
									{/* Voxel's repost icon - matching templates/widgets/timeline-kit.php */}
									<svg viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
										<path d="M18.5324 16.7804C18.2395 16.4875 18.2394 16.0126 18.5323 15.7197C18.8252 15.4268 19.3001 15.4268 19.593 15.7196L22.0931 18.2195C22.2338 18.3601 22.3128 18.5509 22.3128 18.7498C22.3128 18.9487 22.2338 19.1395 22.0932 19.2802L19.593 21.7803C19.3001 22.0732 18.8252 22.0732 18.5323 21.7803C18.2394 21.4874 18.2394 21.0126 18.5323 20.7197L19.752 19.5H5.06267C3.82003 19.5 2.81267 18.4926 2.81267 17.25V12C2.81267 11.5858 3.14846 11.25 3.56267 11.25C3.97688 11.25 4.31267 11.5858 4.31267 12V17.25C4.31267 17.6642 4.64846 18 5.06267 18H19.7522L18.5324 16.7804Z"></path>
										<path d="M21.0627 12.75C20.6485 12.75 20.3127 12.4142 20.3127 12V6.75C20.3127 6.33579 19.9769 6 19.5627 6H4.87316L6.09296 7.21963C6.38588 7.51251 6.38591 7.98738 6.09304 8.28029C5.80016 8.57321 5.32529 8.57324 5.03238 8.28037L2.53221 5.78054C2.39154 5.63989 2.31251 5.44912 2.3125 5.2502C2.31249 5.05127 2.39151 4.8605 2.53217 4.71984L5.03234 2.21967C5.32523 1.92678 5.80011 1.92678 6.093 2.21967C6.38589 2.51256 6.38589 2.98744 6.093 3.28033L4.87333 4.5H19.5627C20.8053 4.5 21.8127 5.50736 21.8127 6.75V12C21.8127 12.4142 21.4769 12.75 21.0627 12.75Z"></path>
									</svg>
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
								>
									{/* Voxel's comment bubble icon - matching templates/widgets/timeline-kit.php */}
									<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
										<path d="M7 10.5957C7 10.1815 7.33579 9.8457 7.75 9.8457H16.25C16.6642 9.8457 17 10.1815 17 10.5957C17 11.0099 16.6642 11.3457 16.25 11.3457H7.75C7.33579 11.3457 7 11.0099 7 10.5957Z"></path>
										<path d="M7.75 12.8457C7.33579 12.8457 7 13.1815 7 13.5957C7 14.0099 7.33579 14.3457 7.75 14.3457H12.75C13.1642 14.3457 13.5 14.0099 13.5 13.5957C13.5 13.1815 13.1642 12.8457 12.75 12.8457H7.75Z"></path>
										<path fillRule="evenodd" clipRule="evenodd" d="M12 4C7.58172 4 4 7.58172 4 12V20H12C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2.5 12C2.5 6.75329 6.75329 2.5 12 2.5C17.2467 2.5 21.5 6.75329 21.5 12C21.5 17.2467 17.2467 21.5 12 21.5H3.25C2.83579 21.5 2.5 21.1642 2.5 20.75V12Z"></path>
									</svg>
								</a>
							)}
						</div>

						{/* Details */}
						{(displayStatus.likes?.count > 0 || displayStatus.replies?.count > 0) && (
							<div className="vxf-details flexify">
								{/* Recent likes avatars */}
								{displayStatus.likes?.last3?.length > 0 && (
									<div className="vxf-recent-likes flexify">
										{displayStatus.likes.last3.filter(like => like && like.avatar_url).map((like, index) => (
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

			{/* Quote composer - matches Voxel's vxf__quote-composer vxf-subgrid wrapper */}
			{showQuoteBox && (
				<div className="vxf__quote-composer vxf-subgrid">
					<QuoteComposer
						quoteOf={status}
						onQuotePublished={(quotedStatus) => {
							setShowQuoteBox(false);
							onQuote?.(quotedStatus);
						}}
						onCancel={() => setShowQuoteBox(false)}
					/>
				</div>
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
