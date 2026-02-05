/**
 * Timeline Block - TypeScript Interfaces
 *
 * Matches Voxel Timeline widget controls and vxconfig structure.
 * Evidence: themes/voxel/app/widgets/timeline.php (lines 23-307, 410-518)
 *
 * @package VoxelFSE
 */

import type { IconValue } from '@shared/types';

// Re-export all types from sub-modules
export * from './status';
export * from './comment';
export * from './config';

/**
 * Ordering option item (from ts_ordering_options repeater)
 * Evidence: timeline.php lines 48-98
 */
export interface OrderingOption {
	_id: string;
	order: 'latest' | 'earliest' | 'most_liked' | 'most_discussed' | 'most_popular' | 'best_rated' | 'worst_rated';
	time: 'today' | 'this_week' | 'this_month' | 'this_year' | 'all_time' | 'custom';
	timeCustom: number | string;
	label: string;
	// Row visibility
	rowVisibility?: 'show' | 'hide';
	visibilityRules?: Array<{
		id: string;
		filterKey: string;
		operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'empty' | 'not_empty';
		value?: string;
	}>;
}

/**
 * Display mode options
 * Evidence: timeline.php lines 33-46
 */
export type TimelineDisplayMode =
	| 'post_reviews'
	| 'post_wall'
	| 'post_timeline'
	| 'author_timeline'
	| 'user_feed'
	| 'global_feed';

/**
 * Block attributes (stored in Gutenberg)
 * Maps all Elementor controls to Gutenberg attributes
 */
export interface TimelineAttributes {
	// Timeline Settings
	mode: TimelineDisplayMode;
	orderingOptions: OrderingOption[];
	noStatusText: string;
	searchEnabled: boolean;
	searchValue: string;

	// Timeline Icons (15 total)
	verifiedIcon: IconValue | null;
	repostIcon: IconValue | null;
	moreIcon: IconValue | null;
	likeIcon: IconValue | null;
	likedIcon: IconValue | null;
	commentIcon: IconValue | null;
	replyIcon: IconValue | null;
	galleryIcon: IconValue | null;
	uploadIcon: IconValue | null;
	emojiIcon: IconValue | null;
	searchIcon: IconValue | null;
	trashIcon: IconValue | null;
	externalIcon: IconValue | null;
	loadMoreIcon: IconValue | null;
	noPostsIcon: IconValue | null;

	// Inspector state persistence
	contentTabOpenPanel?: string;
}

/**
 * Type alias for ContentTab component compatibility
 */
export type BlockAttributes = TimelineAttributes;

/**
 * VxConfig structure for frontend hydration
 * This matches Voxel's $cfg array in timeline.php render() method
 * Evidence: timeline.php lines 410-518
 */
export interface TimelineVxConfig {
	timeline: {
		mode: TimelineDisplayMode;
	};
	current_user: {
		exists: boolean;
		id: number | null;
		username: string | null;
		display_name: string | null;
		avatar_url: string | null;
		link: string | null;
	};
	current_post: {
		exists: boolean;
		id: number | null;
		display_name: string | null;
		avatar_url: string | null;
		link: string | null;
	};
	current_author: {
		exists: boolean;
		id: number | null;
	};
	settings: {
		posts: {
			editable: boolean;
			content_maxlength: number;
			truncate_at: number;
			gallery_enabled: boolean;
			gallery_max_uploads: number;
			gallery_allowed_formats: string[];
		};
		replies: {
			editable: boolean;
			content_maxlength: number;
			truncate_at: number;
			max_nest_level: number;
			gallery_enabled: boolean;
			gallery_max_uploads: number;
			gallery_allowed_formats: string[];
		};
		reposts: {
			enabled: boolean;
		};
		quotes: {
			truncate_at: number;
			placeholder: string;
		};
		emojis: {
			url: string;
		};
		link_preview: {
			default_image: string;
		};
		mentions: {
			url: string;
		};
		hashtags: {
			url: string;
		};
		search: {
			enabled: boolean;
			maxlength: number;
			default_query: string;
		};
		ordering_options: Array<{
			_id: string;
			label: string;
			order: string;
			time: string;
			time_custom: number;
		}>;
		filtering_options: {
			all: string;
			liked?: string;
			pending?: string;
		};
	};
	l10n: {
		emoji_groups: Record<string, string>;
		no_activity: string;
		editedOn: string;
		oneLike: string;
		countLikes: string;
		oneReply: string;
		countReplies: string;
		cancelEdit: string;
		copied?: string;
		copy_link?: string;
		share_via?: string;
		remove_link_preview?: string;
		edit?: string;
		approve?: string;
		mark_pending?: string;
		delete?: string;
		delete_confirm?: string;
		restricted_visibility?: string;
		repost?: string;
		unrepost?: string;
		quote?: string;
		yes?: string;
		no?: string;
	};
	reviews: Record<string, unknown>;
	async: {
		composer: string;
		comments: string;
	};
	nonce: string;
	single_status_id: number | null;
	single_reply_id: number | null;
	composer: {
		feed: string;
		can_post: boolean;
		post_as?: string;
		placeholder?: string;
		reviews_post_type?: string;
	};
}

/**
 * Icons config for vxconfig__icons script tag
 * Evidence: timeline.php lines 536-552
 */
export interface TimelineIconsConfig {
	verified: string;
	repost: string;
	more: string;
	liked: string;
	like: string;
	comment: string;
	reply: string;
	gallery: string;
	upload: string;
	emoji: string;
	search: string;
	trash: string;
	'external-link': string;
	loading: string;
	'no-post': string;
}

/**
 * Edit component props
 */
export interface EditProps {
	attributes: TimelineAttributes;
	setAttributes: (attributes: Partial<TimelineAttributes>) => void;
	clientId: string;
}

/**
 * Save component props
 */
export interface SaveProps {
	attributes: TimelineAttributes;
}

/**
 * Preview component props
 */
export interface TimelinePreviewProps {
	attributes: TimelineAttributes;
	isEditor: boolean;
}

/**
 * Default attribute values
 */
export const DEFAULT_ATTRIBUTES: TimelineAttributes = {
	// Timeline Settings
	mode: 'user_feed',
	orderingOptions: [],
	noStatusText: 'No posts available',
	searchEnabled: true,
	searchValue: '@tags()@site().query_var(q)@endtags()',

	// Timeline Icons (null = use Voxel defaults)
	verifiedIcon: null,
	repostIcon: null,
	moreIcon: null,
	likeIcon: null,
	likedIcon: null,
	commentIcon: null,
	replyIcon: null,
	galleryIcon: null,
	uploadIcon: null,
	emojiIcon: null,
	searchIcon: null,
	trashIcon: null,
	externalIcon: null,
	loadMoreIcon: null,
	noPostsIcon: null,
};

/**
 * Display mode options for SelectControl
 */
export const DISPLAY_MODE_OPTIONS = [
	{ value: 'post_reviews', label: 'Current post reviews' },
	{ value: 'post_wall', label: 'Current post wall' },
	{ value: 'post_timeline', label: 'Current post timeline' },
	{ value: 'author_timeline', label: 'Current author timeline' },
	{ value: 'user_feed', label: 'Logged-in user newsfeed' },
	{ value: 'global_feed', label: 'Sitewide activity' },
];

/**
 * Order options for repeater SelectControl
 */
export const ORDER_OPTIONS = [
	{ value: 'latest', label: 'Latest' },
	{ value: 'earliest', label: 'Earliest' },
	{ value: 'most_liked', label: 'Most liked' },
	{ value: 'most_discussed', label: 'Most discussed' },
	{ value: 'most_popular', label: 'Most popular (likes+comments)' },
	{ value: 'best_rated', label: 'Best rated (reviews only)' },
	{ value: 'worst_rated', label: 'Worst rated (reviews only)' },
];

/**
 * Timeframe options for repeater SelectControl
 */
export const TIME_OPTIONS = [
	{ value: 'today', label: 'Today' },
	{ value: 'this_week', label: 'This week' },
	{ value: 'this_month', label: 'This month' },
	{ value: 'this_year', label: 'This year' },
	{ value: 'all_time', label: 'All time' },
	{ value: 'custom', label: 'Custom' },
];
