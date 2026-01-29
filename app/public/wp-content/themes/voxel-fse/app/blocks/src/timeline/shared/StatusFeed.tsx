/**
 * StatusFeed Component
 *
 * Timeline feed with infinite scroll, filtering, and status list.
 * Matches Voxel's timeline feed HTML structure EXACTLY for CSS compatibility.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status-feed/status-feed.php):
 * - NO wrapper div around all posts - posts render directly as siblings
 * - Each <status-single> renders its own <div class="vxf-subgrid"> wrapper
 * - Empty state: <div class="ts-no-posts"><span class="ts-loader"></span></div>
 * - Load more: <a class="ts-load-more ts-btn ts-btn-1">Load more</a>
 *
 * @package VoxelFSE
 */

import { useCallback, useRef, useEffect, Fragment, forwardRef, useImperativeHandle } from 'react';
import { useStatusFeed, type FeedFilters, useStrings, useTimelineAttributes, useTimelineConfig } from '../hooks';
import { StatusItem } from './StatusItem';
import { FeedFilters as FeedFiltersComponent } from './FeedFilters';
import type { Status } from '../types';

/**
 * Ref handle exposed by StatusFeed
 */
export interface StatusFeedHandle {
	addStatus: (status: Status) => void;
	refresh: () => Promise<void>;
}

/**
 * Props
 */
interface StatusFeedProps {
	mode?: string;
	postId?: number;
	authorId?: number;
	showFilters?: boolean;
	showSearch?: boolean;
	emptyMessage?: string;
	className?: string;
}

/**
 * Loading icon component - matches Voxel's icon-loading
 */
const LoadingIcon = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="vxf-loading-icon"
	>
		<path
			d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</svg>
);

/**
 * No posts icon component - matches Voxel's icon-no-post
 */
const NoPostIcon = () => (
	<svg
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10.5 3.75C6.21979 3.75 2.75 7.21979 2.75 11.5C2.75 15.7802 6.21979 19.25 10.5 19.25C12.4067 19.25 14.1566 18.5645 15.5146 17.4227L19.2197 21.1278C19.5126 21.4207 19.9875 21.4207 20.2804 21.1278C20.5733 20.8349 20.5733 20.36 20.2804 20.0671L16.5753 16.362C17.717 15.0041 18.4025 13.2542 18.4025 11.3475C18.4025 7.06729 14.9327 3.5975 10.6525 3.5975L10.5 3.75ZM4.25 11.5C4.25 8.04822 7.04822 5.25 10.5 5.25C13.9518 5.25 16.75 8.04822 16.75 11.5C16.75 14.9518 13.9518 17.75 10.5 17.75C7.04822 17.75 4.25 14.9518 4.25 11.5Z"
			fill="currentColor"
		/>
	</svg>
);

/**
 * StatusFeed Component
 * Matches Voxel's status-feed structure exactly (no wrapper around posts)
 */
export const StatusFeed = forwardRef<StatusFeedHandle, StatusFeedProps>(function StatusFeed({
	mode,
	postId,
	authorId,
	showFilters = true,
	showSearch = true,
	emptyMessage,
	className = '',
}, ref): JSX.Element {
	const attributes = useTimelineAttributes();
	const strings = useStrings();
	const { config } = useTimelineConfig();

	// Get the display mode from props or attributes
	const feedMode = mode ?? attributes.mode ?? 'user_feed';

	// DEBUG: Log mode selection
	console.log('[StatusFeed] Render with mode:', {
		propMode: mode,
		attributeMode: attributes.mode,
		finalMode: feedMode,
		currentPost: config?.current_post,
		postIdProp: postId,
		authorIdProp: authorId
	});

	// Initialize user-controllable filters (NOT including mode)
	const initialFilters: Partial<Omit<FeedFilters, 'mode'>> = {};

	// Auto-detect post_id for post-related modes
	// These modes require a post context: post_timeline, post_wall, post_reviews
	const postRelatedModes = ['post_timeline', 'post_wall', 'post_reviews'];
	const needsPostId = postRelatedModes.includes(feedMode);

	if (needsPostId) {
		// Use prop first, fallback to current post from config
		const resolvedPostId = postId ?? config?.current_post?.id;
		if (resolvedPostId) {
			initialFilters.postId = resolvedPostId;
			console.log(`[StatusFeed] Mode "${feedMode}" requires post_id, using:`, resolvedPostId);
		} else {
			console.warn(`[StatusFeed] Mode "${feedMode}" requires post_id but none available!`);
		}
	} else if (postId) {
		// Explicit postId prop always takes precedence
		initialFilters.postId = postId;
	}

	// Auto-detect author_id for author_timeline mode
	if (feedMode === 'author_timeline') {
		const resolvedAuthorId = authorId ?? config?.current_post?.author_id;
		if (resolvedAuthorId) {
			initialFilters.authorId = resolvedAuthorId;
			console.log(`[StatusFeed] Mode "author_timeline" requires author_id, using:`, resolvedAuthorId);
		} else {
			console.warn(`[StatusFeed] Mode "author_timeline" requires author_id but none available!`);
		}
	} else if (authorId) {
		// Explicit authorId prop always takes precedence
		initialFilters.authorId = authorId;
	}

	// Get first ordering option as default
	if (attributes.orderingOptions?.length > 0) {
		const firstOption = attributes.orderingOptions[0];
		initialFilters.order = firstOption.order;
		initialFilters.time = firstOption.time;
		if (firstOption.time === 'custom') {
			initialFilters.timeCustom = firstOption.timeCustom;
		}
	}

	// useStatusFeed now takes mode as first arg (from block attributes)
	// and initialFilters as second arg (user-controllable options)
	const {
		statuses,
		isLoading,
		isLoadingMore,
		hasMore,
		error,
		loadMore,
		refresh,
		setFilters,
		addStatus,
		updateStatus,
		removeStatus,
		filters,
	} = useStatusFeed(feedMode, initialFilters);

	// Expose addStatus and refresh to parent via ref
	useImperativeHandle(ref, () => ({
		addStatus,
		refresh,
	}), [addStatus, refresh]);

	// Infinite scroll ref
	const loadMoreRef = useRef<HTMLAnchorElement>(null);

	// Setup intersection observer for infinite scroll
	useEffect(() => {
		if (!loadMoreRef.current || !hasMore || isLoadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
					loadMore();
				}
			},
			{
				rootMargin: '200px',
				threshold: 0,
			}
		);

		observer.observe(loadMoreRef.current);

		return () => {
			observer.disconnect();
		};
	}, [hasMore, isLoadingMore, loadMore]);

	// Handle filter changes
	const handleFiltersChange = useCallback(
		(newFilters: Partial<FeedFilters>) => {
			setFilters(newFilters);
		},
		[setFilters]
	);

	// Handle status update
	const handleStatusUpdate = useCallback(
		(status: Status) => {
			updateStatus(status);
		},
		[updateStatus]
	);

	// Handle status delete
	const handleStatusDelete = useCallback(
		(statusId: number) => {
			removeStatus(statusId);
		},
		[removeStatus]
	);

	// Get empty message - use l10n from config if available
	const displayEmptyMessage = emptyMessage ?? config?.strings?.no_activity ?? attributes.noStatusText ?? strings.no_posts;

	// Render no-posts state (matches Voxel's ts-no-posts exactly)
	const renderNoPostsState = () => {
		if (isLoading) {
			return (
				<div className="ts-no-posts">
					<span className="ts-loader"></span>
				</div>
			);
		}

		return (
			<div className="ts-no-posts">
				<NoPostIcon />
				<p>{displayEmptyMessage}</p>
			</div>
		);
	};

	return (
		<>
			{/* Filters - matches Voxel's vxf-filters structure */}
			{showFilters && (
				<FeedFiltersComponent
					filters={filters}
					onFiltersChange={handleFiltersChange}
					orderingOptions={attributes.orderingOptions}
					showSearch={showSearch && attributes.searchEnabled}
				/>
			)}

			{/* Posts - NO wrapper div, each StatusItem has its own vxf-subgrid */}
			{statuses.length > 0 ? (
				<>
					{/* Status List - each renders as vxf-subgrid > vxf-post */}
					{statuses.map((status) => (
						<StatusItem
							key={status.id}
							status={status}
							onStatusUpdate={handleStatusUpdate}
							onStatusDelete={handleStatusDelete}
						/>
					))}

					{/* Load More - matches Voxel's ts-load-more ts-btn ts-btn-1 */}
					{hasMore && (
						<a
							ref={loadMoreRef}
							href="#"
							onClick={(e) => { e.preventDefault(); loadMore(); }}
							className={`ts-load-more ts-btn ts-btn-1 ${isLoadingMore ? 'vx-pending' : ''}`}
						>
							<LoadingIcon />
							{strings.load_more ?? 'Load more'}
						</a>
					)}
				</>
			) : (
				/* Empty/Loading State - matches Voxel's ts-no-posts */
				renderNoPostsState()
			)}
		</>
	);
});

export default StatusFeed;
