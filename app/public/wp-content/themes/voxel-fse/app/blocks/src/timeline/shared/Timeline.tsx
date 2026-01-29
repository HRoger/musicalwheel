/**
 * Timeline Component - Main Shared React Component
 *
 * Reference Files (3 total, 1,971 lines combined):
 *   - docs/block-conversions/timeline/voxel-timeline-main.beautified.js (885 lines)
 *   - docs/block-conversions/timeline/voxel-timeline-composer.beautified.js (476 lines)
 *   - docs/block-conversions/timeline/voxel-timeline-comments.beautified.js (610 lines)
 *
 * VOXEL PARITY CHECKLIST: ~95% complete
 *
 * ✅ COMPLETE:
 * - HTML structure matches exactly (vxfeed, vxf-create-post, vxf-subgrid, vxf-post)
 * - CSS classes match Voxel's Vue.js template output
 * - Status CRUD with optimistic UI updates
 * - Nested comments with max depth (max_nest_level)
 * - @mentions with autocomplete and caching
 * - Emoji picker with recent emojis (localStorage)
 * - File uploads with drag & drop
 * - Link preview detection
 * - Repost/quote functionality
 * - Rich text formatting (links, mentions, hashtags, code blocks)
 * - Multiple feed modes (user_feed, post_wall, post_reviews, etc.)
 * - Ordering options with timeframe filtering
 * - Search filtering
 * - Review scores for post_reviews mode
 * - Comment moderation (pending/approved)
 *
 * ⚠️ MINOR GAPS:
 * - Real-time polling not implemented (Voxel uses interval-based refresh)
 * - Some edge case l10n strings may differ
 *
 * ARCHITECTURE:
 * - Used in BOTH Gutenberg editor AND frontend
 * - TimelineProvider context for global state
 * - 17 child components for full feature coverage
 * - Pure React, headless-ready for Next.js
 *
 * Voxel HTML Structure (matched exactly):
 * <div class="vxfeed">
 *   <div class="vxf-create-post flexify">...</div>
 *   <div class="vxf-filters">...</div>
 *   <div class="vxf-subgrid">
 *     <div class="vxf-post">...</div>
 *     <div class="vxf-post">...</div>
 *   </div>
 * </div>
 *
 * @package VoxelFSE
 */

import { useRef, useMemo } from 'react';
import { TimelineProvider, useTimelineConfig } from '../hooks';
import { StatusComposer } from './StatusComposer';
import { StatusFeed, type StatusFeedHandle } from './StatusFeed';
import type { TimelineAttributes, OrderingOption, Status } from '../types';

/**
 * Props
 */
interface TimelineProps {
	attributes: TimelineAttributes;
	context: 'editor' | 'frontend';
	className?: string;
}

/**
 * Timeline Inner Component (needs TimelineProvider context)
 *
 * IMPORTANT: No full-page loading state!
 * Renders immediately with defaults, StatusFeed handles its own loading.
 */
function TimelineInner({
	attributes,
	context,
	className = '',
}: TimelineProps): JSX.Element {
	// Config is optional - we render with defaults while it loads
	const { config } = useTimelineConfig();

	// Ref to StatusFeed for adding new statuses without remounting
	const feedRef = useRef<StatusFeedHandle>(null);

	// Ensure orderingOptions is always an array - extract first to prevent issues in useMemo dependency
	const rawOrderingOptions = attributes?.orderingOptions;

	// Convert attributes ordering options to OrderingOption type
	const orderingOptions: OrderingOption[] = useMemo(() => {
		const options = Array.isArray(rawOrderingOptions) ? rawOrderingOptions : [];
		return options.map((opt) => ({
			_id: opt._id ?? 'default',
			order: opt.order ?? 'latest',
			time: opt.time ?? 'all_time',
			timeCustom: opt.timeCustom ?? 7,
			label: opt.label ?? 'Latest',
		}));
	}, [rawOrderingOptions]);

	// Handle new status created - add to feed directly (no remount)
	const handleStatusCreated = (newStatus: Status) => {
		feedRef.current?.addStatus(newStatus);
	};

	// Can user post?
	// - In editor: always show composer for preview (admins can always post)
	// - In frontend: check permissions from config
	const canPost = context === 'editor'
		? true  // Always show in editor for preview purposes
		: (config?.permissions?.can_post ?? false);

	// Show composer based on mode (only for modes that support posting)
	const showComposer = canPost && ['user_feed', 'global_feed', 'post_wall'].includes(attributes.mode);

	return (
		<>
			{/* Configuration Scripts - OUTSIDE vxfeed to match Voxel's structure */}
			{config && (
				<>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify({
								timeline: { mode: attributes.mode },
								current_user: config.current_user,
								current_post: config.current_post ?? null,
								settings: {
									character_limits: config.character_limits,
									upload_config: config.upload_config,
									features: config.features,
									statuses_per_page: config.statuses_per_page,
									comments_per_page: config.comments_per_page,
								},
								l10n: config.strings,
								reviews: config.review_config,
								nonce: config.nonces.status_publish,
								composer: {
									post_types: config.post_types,
									default_order: config.default_order,
								},
							}),
						}}
					/>
					<script
						type="text/json"
						className="vxconfig__icons"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(config.icons || {}),
						}}
					/>
				</>
			)}

			<div className={`vxfeed ${className}`}>
				{/* Status Composer */}
				{showComposer && (
					<StatusComposer
						onStatusCreated={handleStatusCreated}
					/>
				)}

				{/* Status Feed (includes filters and posts grid) */}
				<StatusFeed
					ref={feedRef}
					mode={attributes.mode}
					showFilters={orderingOptions.length > 1 || attributes.searchEnabled}
					showSearch={attributes.searchEnabled}
					emptyMessage={attributes.noStatusText}
				/>
			</div>
		</>
	);
}

/**
 * Timeline Component with Provider
 * Matches Voxel's vxfeed structure exactly
 */
export function Timeline({
	attributes,
	context,
	className = '',
}: TimelineProps): JSX.Element {
	return (
		<TimelineProvider attributes={attributes} context={context}>
			<TimelineInner
				attributes={attributes}
				context={context}
				className={className}
			/>
		</TimelineProvider>
	);
}

export default Timeline;
