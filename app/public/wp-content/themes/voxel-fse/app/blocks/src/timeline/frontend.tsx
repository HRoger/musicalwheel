/**
 * Timeline Block - Frontend Entry Point (Plan C+)
 *
 * Reference Files (3 total, 1,971 lines combined):
 *   - docs/block-conversions/timeline/voxel-timeline-main.beautified.js (885 lines)
 *   - docs/block-conversions/timeline/voxel-timeline-composer.beautified.js (476 lines)
 *   - docs/block-conversions/timeline/voxel-timeline-comments.beautified.js (610 lines)
 *
 * VOXEL PARITY (100%):
 * ✅ Status feed with pagination (loadFeed(), loadMore())
 * ✅ Status CRUD (create, edit, delete)
 * ✅ Like/unlike with optimistic UI updates
 * ✅ Cross-instance sync via CustomEvent (voxel/tl/status/{id}/like, /repost)
 * ✅ Nested comments with max depth limit
 * ✅ Comment CRUD (create, edit, delete)
 * ✅ Comment likes
 * ✅ @mentions autocomplete with caching (window._vx_mentions_cache)
 * ✅ Emoji picker with recent emojis (localStorage)
 * ✅ File uploads with drag & drop
 * ✅ Client-side link preview detection (500ms debounce with AbortController)
 * ✅ Repost functionality
 * ✅ Quote composer UI (inline quote status creation)
 * ✅ Rich text formatting (links, mentions, hashtags, code blocks)
 * ✅ Multiple feed modes (user_feed, post_wall, post_reviews, etc.)
 * ✅ Ordering options (latest, earliest, most_liked, etc.)
 * ✅ Search filtering
 * ✅ Pending/approved comment moderation
 * ✅ Review scores for post_reviews mode
 * ✅ Review score editing component (ReviewScore with stars/numeric input)
 * ✅ Delete confirmation using Voxel_Config.l10n.confirmAction
 * ✅ Polling refresh for real-time updates
 * ✅ 21 API endpoints implemented (including getLinkPreview, quoteStatusApi)
 *
 * ⚠️ USES VOXEL'S ?vx=1 AJAX SYSTEM:
 *   - timeline.get_feed, timeline.create_status, timeline.update_status
 *   - timeline.delete_status, timeline.like_status, timeline.unlike_status
 *   - timeline.get_replies, timeline.reply_to_status, timeline.repost_status
 *   - timeline.get_link_preview
 *   - timeline/v2/status.publish, status.edit, status.quote
 *   - timeline/v2/comment.publish, comment.edit, comment.delete, comment.like
 *   - timeline/v2/comments/get_feed
 *   - timeline/v2/mentions.search
 *
 * ARCHITECTURE:
 * - 17 shared React components for full feature coverage
 * - TimelineProvider context for global state
 * - Pure React (no jQuery in components)
 * - Headless-ready for Next.js migration
 *
 * NEXT.JS READY:
 * ✅ Component accepts props (attributes, context)
 * ✅ normalizeConfig() handles both camelCase and snake_case
 * ✅ No WordPress globals in React components
 * ✅ Pure React with fetch API for data
 * ✅ TypeScript strict mode
 *
 * @package VoxelFSE
 */

import { createRoot, type Root } from 'react-dom/client';
import { Timeline } from './shared';
import type { TimelineAttributes, OrderingOption } from './types';
import { DEFAULT_ATTRIBUTES } from './types';

console.log('[Timeline Frontend] Script loaded!', {
	time: new Date().toISOString(),
	readyState: document.readyState,
});

/**
 * Block config structure from save.tsx vxconfig-block script
 */
interface BlockConfig {
	timeline: {
		mode: string;
	};
	block_settings: {
		no_status_text: string;
		search_enabled: boolean;
		search_value: string;
		ordering_options: Array<{
			_id: string;
			label: string;
			order: string;
			time: string;
			time_custom: number;
		}>;
	};
	icons?: {
		verified?: string;
		repost?: string;
		more?: string;
		like?: string;
		liked?: string;
		comment?: string;
		reply?: string;
		gallery?: string;
		upload?: string;
		emoji?: string;
		search?: string;
		trash?: string;
		external?: string;
		loadMore?: string;
		noPosts?: string;
	};
}

/**
 * Global Voxel config structure (from window.Voxel_Config or vxconfig script)
 */
interface VoxelGlobalConfig {
	post?: {
		id?: number;
		post_type?: string;
	};
	author?: {
		id?: number;
	};
}

/**
 * Get current post ID from Voxel's global config
 * Matches how Voxel passes post context to frontend components
 */
function getCurrentPostId(): number | undefined {
	// Try window.Voxel_Config first (standard Voxel approach)
	const voxelConfig = (window as unknown as { Voxel_Config?: VoxelGlobalConfig }).Voxel_Config;
	if (voxelConfig?.post?.id) {
		return voxelConfig.post.id;
	}

	// Try to find vxconfig script on page (alternative method)
	const vxconfigScript = document.querySelector<HTMLScriptElement>('script.vxconfig[type="text/json"]');
	if (vxconfigScript?.textContent) {
		try {
			const pageConfig = JSON.parse(vxconfigScript.textContent) as VoxelGlobalConfig;
			if (pageConfig?.post?.id) {
				return pageConfig.post.id;
			}
		} catch {
			// Ignore parse errors
		}
	}

	return undefined;
}

/**
 * Normalize config for both vxconfig (snake_case) and REST API (camelCase) compatibility
 * This enables seamless Next.js migration where API responses use camelCase
 *
 * @param raw - Raw config from vxconfig-block script or REST API
 * @returns Normalized BlockConfig with consistent field names
 */
function normalizeConfig(raw: Record<string, unknown>): BlockConfig {
	const timeline = (raw.timeline ?? raw.Timeline ?? {}) as Record<string, unknown>;
	const blockSettings = (raw.block_settings ?? raw.blockSettings ?? {}) as Record<string, unknown>;
	const icons = (raw.icons ?? {}) as Record<string, string>;

	// Normalize ordering options array (handle both snake_case and camelCase)
	const rawOrderingOptions = (
		blockSettings.ordering_options ??
		blockSettings.orderingOptions ??
		[]
	) as Array<Record<string, unknown>>;

	const orderingOptions = Array.isArray(rawOrderingOptions)
		? rawOrderingOptions.map((opt) => ({
				_id: (opt._id ?? opt.id ?? 'default') as string,
				label: (opt.label ?? 'Latest') as string,
				order: (opt.order ?? 'latest') as string,
				time: (opt.time ?? 'all_time') as string,
				time_custom: (opt.time_custom ?? opt.timeCustom ?? 7) as number,
			}))
		: [];

	return {
		timeline: {
			mode: (timeline.mode ?? 'user_feed') as string,
		},
		block_settings: {
			no_status_text: (blockSettings.no_status_text ?? blockSettings.noStatusText ?? 'No posts available') as string,
			search_enabled: (blockSettings.search_enabled ?? blockSettings.searchEnabled ?? true) as boolean,
			search_value: (blockSettings.search_value ?? blockSettings.searchValue ?? '') as string,
			ordering_options: orderingOptions,
		},
		icons: {
			verified: icons.verified,
			repost: icons.repost,
			more: icons.more,
			like: icons.like,
			liked: icons.liked,
			comment: icons.comment,
			reply: icons.reply,
			gallery: icons.gallery,
			upload: icons.upload,
			emoji: icons.emoji,
			search: icons.search,
			trash: icons.trash,
			external: icons.external ?? icons.externalLink,
			loadMore: icons.loadMore ?? icons.load_more,
			noPosts: icons.noPosts ?? icons.no_posts,
		},
	};
}

/**
 * Store for React roots (for cleanup)
 */
const timelineRoots = new Map<HTMLElement, Root>();

/**
 * Parse JSON from script tag safely
 */
function parseJson<T>(script: HTMLScriptElement | null, fallback: T): T {
	if (!script?.textContent) return fallback;
	try {
		return JSON.parse(script.textContent) as T;
	} catch (e) {
		console.error('[Timeline] Failed to parse JSON:', e);
		return fallback;
	}
}

/**
 * Convert block config to TimelineAttributes
 */
function configToAttributes(config: BlockConfig): TimelineAttributes {
	// Map ordering options - safely handle undefined/null
	const rawOptions = config?.block_settings?.ordering_options ?? [];
	const orderingOptions: OrderingOption[] = Array.isArray(rawOptions)
		? rawOptions.map((opt) => ({
				_id: opt._id ?? 'default',
				order: (opt.order ?? 'latest') as OrderingOption['order'],
				time: (opt.time ?? 'all_time') as OrderingOption['time'],
				timeCustom: opt.time_custom ?? 7,
				label: opt.label ?? 'Latest',
			}))
		: [];

	// Build icon values if present
	const icons = config?.icons || {};

	// Safely access nested properties with fallbacks
	const mode = config?.timeline?.mode ?? 'user_feed';
	const blockSettings = config?.block_settings ?? {};

	return {
		mode: mode as TimelineAttributes['mode'],
		orderingOptions,
		noStatusText: blockSettings.no_status_text || DEFAULT_ATTRIBUTES.noStatusText,
		searchEnabled: blockSettings.search_enabled ?? DEFAULT_ATTRIBUTES.searchEnabled,
		searchValue: blockSettings.search_value || '',

		// Icons - convert SVG strings to IconValue format if provided
		verifiedIcon: icons.verified ? { svg: icons.verified } : null,
		repostIcon: icons.repost ? { svg: icons.repost } : null,
		moreIcon: icons.more ? { svg: icons.more } : null,
		likeIcon: icons.like ? { svg: icons.like } : null,
		likedIcon: icons.liked ? { svg: icons.liked } : null,
		commentIcon: icons.comment ? { svg: icons.comment } : null,
		replyIcon: icons.reply ? { svg: icons.reply } : null,
		galleryIcon: icons.gallery ? { svg: icons.gallery } : null,
		uploadIcon: icons.upload ? { svg: icons.upload } : null,
		emojiIcon: icons.emoji ? { svg: icons.emoji } : null,
		searchIcon: icons.search ? { svg: icons.search } : null,
		trashIcon: icons.trash ? { svg: icons.trash } : null,
		externalIcon: icons.external ? { svg: icons.external } : null,
		loadMoreIcon: icons.loadMore ? { svg: icons.loadMore } : null,
		noPostsIcon: icons.noPosts ? { svg: icons.noPosts } : null,
	};
}

/**
 * Initialize a single timeline block
 */
function initTimelineBlock(container: HTMLElement): void {
	// Skip if already initialized
	if (container.hasAttribute('data-timeline-initialized')) {
		return;
	}

	// Mark as initialized
	container.setAttribute('data-timeline-initialized', 'true');

	// Parse block config from vxconfig-block script tag
	const configScript = container.querySelector<HTMLScriptElement>('script.vxconfig-block');
	const rawConfig = parseJson<Record<string, unknown>>(configScript, {});

	// Normalize config for both vxconfig and REST API compatibility
	const blockConfig = normalizeConfig(rawConfig);

	// Convert to TimelineAttributes
	const attributes = configToAttributes(blockConfig);

	// Get current post ID for post-context endpoint (1:1 Voxel parity)
	const postId = getCurrentPostId();

	// Remove placeholder and scripts
	const placeholder = container.querySelector('.voxel-fse-timeline-placeholder');
	placeholder?.remove();
	configScript?.remove();

	// Also remove any icons script
	const iconsScript = container.querySelector<HTMLScriptElement>('script.vxconfig-icons');
	iconsScript?.remove();

	// Create React root and render
	const root = createRoot(container);
	timelineRoots.set(container, root);

	root.render(
		<Timeline
			attributes={attributes}
			postId={postId}
			context="frontend"
			className="voxel-fse-timeline-mounted"
		/>
	);

	console.log('[Timeline] React component mounted:', container);
}

/**
 * Initialize all timeline blocks on the page
 */
function initTimelineBlocks(): void {
	const blocks = document.querySelectorAll<HTMLElement>(
		'.voxel-fse-timeline-frontend:not([data-timeline-initialized])'
	);

	if (blocks.length === 0) {
		return;
	}

	console.log(`[Timeline] Found ${blocks.length} timeline block(s) to initialize`);

	blocks.forEach((block) => {
		initTimelineBlock(block);
	});
}

/**
 * Cleanup a timeline block (for SPA navigation)
 */
function cleanupTimelineBlock(container: HTMLElement): void {
	const root = timelineRoots.get(container);
	if (root) {
		root.unmount();
		timelineRoots.delete(container);
		container.removeAttribute('data-timeline-initialized');
	}
}

/**
 * Cleanup all timeline blocks
 */
function cleanupAllTimelineBlocks(): void {
	timelineRoots.forEach((root, container) => {
		root.unmount();
		container.removeAttribute('data-timeline-initialized');
	});
	timelineRoots.clear();
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTimelineBlocks);
} else {
	initTimelineBlocks();
}

// Support Turbo/PJAX navigation (cleanup and reinit)
window.addEventListener('turbo:before-render', cleanupAllTimelineBlocks);
window.addEventListener('turbo:load', initTimelineBlocks);
window.addEventListener('pjax:start', cleanupAllTimelineBlocks);
window.addEventListener('pjax:complete', initTimelineBlocks);

// Export for module bundler and external use
export { initTimelineBlocks, initTimelineBlock, cleanupTimelineBlock, cleanupAllTimelineBlocks };
