/**
 * StatusFeed Component
 *
 * Timeline feed with filtering and status list.
 * Matches Voxel's timeline feed HTML structure EXACTLY for CSS compatibility.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status-feed/status-feed.php):
 * - NO wrapper div around all posts - posts render directly as siblings
 * - Each <status-single> renders its own <div class="vxf-subgrid"> wrapper
 * - Empty state: <div class="ts-no-posts"><span class="ts-loader"></span></div>
 * - Load more: <a class="ts-load-more ts-btn ts-btn-1">Load more</a>
 *
 * Load More behavior (Voxel parity):
 * - Manual click only — Voxel uses @click.prevent="loadMore", NOT IntersectionObserver
 * - Visible only when server returns has_more=true (v-if="hasMore")
 * - Icon: reload.svg (circular arrow), NOT a partial circle
 *
 * @package VoxelFSE
 */

import { useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
	onLoadingChange?: (isLoading: boolean) => void;
}

/**
 * Loading icon component - matches Voxel's reload.svg exactly
 * Evidence: themes/voxel/assets/images/svgs/reload.svg
 * Evidence: themes/voxel/app/widgets/timeline.php line 551:
 *   'loading' => \Voxel\get_icon_markup(...) ?: \Voxel\get_svg('reload.svg')
 */
const LoadingIcon = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 25 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M21.6009 10.4593C22.001 10.3521 22.2384 9.94088 22.1312 9.54078C21.59 7.52089 20.3974 5.73603 18.7384 4.46302C17.0793 3.19001 15.0466 2.5 12.9555 2.5C10.8644 2.5 8.83164 3.19001 7.17262 4.46302C6.12405 5.26762 5.26179 6.2767 4.63257 7.42036L2.86504 6.92617C2.76093 6.89707 2.65423 6.89133 2.55153 6.9068C2.46222 6.91962 2.37374 6.94889 2.29039 6.99582C1.92945 7.19903 1.80158 7.65636 2.00479 8.0173L3.73942 11.0983C3.83701 11.2717 3.99946 11.3991 4.19104 11.4527C4.30333 11.4841 4.42023 11.4886 4.53266 11.4673C4.61373 11.4524 4.69254 11.4242 4.7657 11.383L7.84641 9.64831C8.11073 9.49948 8.25936 9.20608 8.22302 8.90493C8.18668 8.60378 7.9725 8.35417 7.68037 8.27249L6.1241 7.83737C6.6343 6.99996 7.29751 6.2579 8.08577 5.65305C9.48282 4.58106 11.1946 4 12.9555 4C14.7164 4 16.4282 4.58106 17.8252 5.65305C19.2223 6.72504 20.2266 8.22807 20.6823 9.92901C20.7895 10.3291 21.2008 10.5665 21.6009 10.4593Z" fill="currentColor"/>
		<path d="M4.30739 13.5387C3.90729 13.6459 3.66985 14.0572 3.77706 14.4573C4.31829 16.4771 5.51089 18.262 7.16991 19.535C8.82892 20.808 10.8616 21.498 12.9528 21.498C15.0439 21.498 17.0766 20.808 18.7356 19.535C19.7859 18.7291 20.6493 17.7181 21.2787 16.5722L23.0083 17.0557C23.1218 17.0961 23.2447 17.1091 23.3661 17.0917C23.5554 17.0658 23.7319 16.968 23.8546 16.8116C24.0419 16.573 24.0669 16.245 23.9181 15.9807L22.1835 12.8996C22.0859 12.7263 21.9234 12.5988 21.7319 12.5453C21.64 12.5196 21.5451 12.5119 21.4521 12.5216C21.3493 12.5317 21.2488 12.5629 21.1571 12.6146L18.0764 14.3493C17.7155 14.5525 17.5876 15.0099 17.7909 15.3708C17.9016 15.5675 18.0879 15.695 18.2929 15.7373L19.7875 16.1552C19.2768 16.9949 18.6125 17.7388 17.8225 18.345C16.4255 19.417 14.7137 19.998 12.9528 19.998C11.1918 19.998 9.4801 19.417 8.08305 18.345C6.686 17.273 5.68171 15.77 5.22595 14.069C5.11874 13.6689 4.70749 13.4315 4.30739 13.5387Z" fill="currentColor"/>
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
	className: _className = '',
	onLoadingChange,
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
			initialFilters.postId = Number(resolvedPostId);
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
			initialFilters.authorId = Number(resolvedAuthorId);
			console.log(`[StatusFeed] Mode "author_timeline" requires author_id, using:`, resolvedAuthorId);
		} else {
			console.warn(`[StatusFeed] Mode "author_timeline" requires author_id but none available!`);
		}
	} else if (authorId) {
		// Explicit authorId prop always takes precedence
		initialFilters.authorId = authorId;
	}

	// Get first ordering option as default (use _id for Voxel parity)
	if (attributes.orderingOptions?.length > 0) {
		const firstOption = attributes.orderingOptions[0];
		initialFilters.orderId = firstOption._id;
		initialFilters.order = firstOption.order;
		initialFilters.time = firstOption.time;
		if (firstOption.time === 'custom') {
			initialFilters.timeCustom = Number(firstOption.timeCustom);
		}
	}

	// useStatusFeed now takes mode as first arg (from block attributes)
	// and initialFilters as second arg (user-controllable options)
	const {
		statuses,
		isLoading,
		isLoadingMore,
		hasMore,
		error: _error,
		loadMore,
		refresh,
		setFilters,
		addStatus,
		updateStatus,
		removeStatus,
		filters,
	} = useStatusFeed(feedMode, initialFilters);

	// Sync active filter to first ordering option when ordering options change in inspector.
	// This ensures the dropdown default follows the repeater item order.
	// Uses _id for stable comparison (matches Voxel's Vue implementation).
	const firstOrderingId = attributes.orderingOptions?.[0]?._id ?? null;
	const prevFirstOrderingIdRef = useRef(firstOrderingId);
	useEffect(() => {
		if (firstOrderingId && firstOrderingId !== prevFirstOrderingIdRef.current) {
			prevFirstOrderingIdRef.current = firstOrderingId;
			const first = attributes.orderingOptions[0];
			setFilters({
				orderId: first._id,
				order: first.order,
				time: first.time,
				timeCustom: first.time === 'custom' ? Number(first.timeCustom) : undefined,
			});
		}
	}, [firstOrderingId, attributes.orderingOptions, setFilters]);

	// Notify parent of loading state changes (for preloading opacity)
	useEffect(() => {
		onLoadingChange?.(isLoading);
	}, [isLoading, onLoadingChange]);

	// Expose addStatus and refresh to parent via ref
	useImperativeHandle(ref, () => ({
		addStatus,
		refresh,
	}), [addStatus, refresh]);

	// Note: Voxel uses manual click for Load More, NOT IntersectionObserver auto-scroll.
	// Evidence: templates/widgets/timeline/status-feed/status-feed.php line 66-71:
	//   <a href="#" @click.prevent="loadMore" ...>
	// Previous IntersectionObserver caused infinite vx-pending blink loop when:
	//   1. Button visible in viewport → observer fires loadMore()
	//   2. AJAX completes → isLoadingMore=false → observer re-creates → fires again
	//   3. Repeat indefinitely

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
							onQuote={addStatus}
						/>
					))}

					{/* Load More - matches Voxel's ts-load-more ts-btn ts-btn-1 */}
					{/* Voxel: v-if="hasMore" — only shows when server confirms more pages */}
					{/* Voxel: @click.prevent="loadMore" — manual click only, no auto-scroll */}
					{hasMore && !isLoading && (
						<a
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
