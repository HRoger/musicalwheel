/**
 * Timeline Configuration TypeScript Interfaces
 *
 * Configuration data fetched from REST API for timeline initialization.
 * Matches Voxel's timeline configuration structure.
 *
 * @package VoxelFSE
 */

/**
 * Post type for status publishing
 */
export interface StatusPostType {
	key: string;
	label: string;
	icon?: string;
}

import type { IconValue } from '@shared/types';


/**
 * User permissions for timeline actions
 */
export interface TimelinePermissions {
	can_post: boolean;
	can_upload: boolean;
	can_moderate: boolean;
	is_logged_in: boolean;
}

/**
 * Upload configuration
 */
export interface UploadConfig {
	max_file_size: number;
	max_files: number;
	allowed_types: string[];
	allowed_extensions: string[];
}

/**
 * Reply-specific upload configuration
 * Evidence: timeline.php L447-459 - replies have separate image settings
 */
export interface ReplyUploadConfig {
	max_file_size: number;
	max_files: number;
	enabled: boolean;
	allowed_types: string[];
}

/**
 * Character limits configuration
 */
export interface CharacterLimits {
	status_min: number;
	status_max: number;
	comment_min: number;
	comment_max: number;
}

/**
 * Review configuration (if reviews enabled)
 */
export interface TimelineReviewConfig {
	enabled: boolean;
	categories: ReviewCategory[];
	mode: 'stars' | 'numeric';
	max_rating: number;
}

/**
 * Review category for multi-category reviews
 */
export interface ReviewCategory {
	key: string;
	label: string;
	required: boolean;
}

/**
 * Emoji category for picker
 */
export interface EmojiCategory {
	key: string;
	label: string;
	icon: string;
}

/**
 * Timeline nonce tokens for AJAX
 */
export interface TimelineNonces {
	status_publish: string;
	status_edit: string;
	status_delete: string;
	status_like: string;
	status_repost: string;
	comment_publish: string;
	comment_edit: string;
	comment_delete: string;
	comment_like: string;
	mentions_search: string;
	file_upload: string;
}

/**
 * Current user data
 */
export interface CurrentUser {
	id: number;
	display_name: string;
	avatar_url: string;
	profile_url: string;
	is_verified: boolean;
}

/**
 * Feed mode configuration
 */
export interface FeedModeConfig {
	key: string;
	label: string;
	default_order: string;
}

/**
 * i18n strings for timeline UI
 */
export interface TimelineStrings {
	// Composer
	compose_placeholder: string;
	compose_submit: string;
	compose_submitting: string;

	// Actions
	like: string;
	unlike: string;
	comment: string;
	comments: string;
	reply: string;
	replies: string;
	repost: string;
	unrepost: string;
	quote: string;
	edit: string;
	delete: string;
	share: string;

	// States
	loading: string;
	load_more: string;
	no_posts: string;
	no_comments: string;
	error_generic: string;
	error_network: string;

	// Time
	just_now: string;
	minutes_ago: string;
	hours_ago: string;
	days_ago: string;
	edited: string;

	// Moderation
	pending_approval: string;
	approve: string;
	mark_pending: string;

	// Confirmations
	delete_confirm: string;
	delete_comment_confirm: string;
	is_deleting: string; // Added missing string
	cancel?: string;
	update?: string;

	// Validation
	content_too_short: string;
	content_too_long: string;
	file_too_large: string;
	file_type_not_allowed: string;

	// Search
	search_placeholder: string;
	search_no_results: string;

	// Action strings (from controller)
	copied?: string;
	copy_link?: string;
	share_via?: string;
	remove_link_preview?: string;
	restricted_visibility?: string;
	yes?: string;
	no?: string;
	reposted?: string;

	// Voxel-exact l10n strings - Evidence: timeline.php L491-507
	// These use Voxel's @count/@date template syntax for 1:1 parity
	no_activity?: string;
	editedOn?: string;
	oneLike?: string;
	countLikes?: string;
	oneReply?: string;
	countReplies?: string;
	cancelEdit?: string;

	// Emoji group translations - Evidence: timeline.php L492-500
	emoji_groups?: Record<string, string>;
}

/**
 * Current post data (for post-specific modes)
 */
export interface CurrentPost {
	id: number;
	display_name: string;
	avatar_url: string;
	link: string;
	post_type?: string; // Post type key for review config lookup
}

/**
 * Main timeline configuration from REST API
 */
export interface TimelineConfig {
	// Basic settings
	ajax_url: string;
	rest_url: string;
	nonces: TimelineNonces;

	// User context
	current_user: CurrentUser | null;
	current_post: CurrentPost | null;
	permissions: TimelinePermissions;

	// Content settings
	post_types: StatusPostType[];
	character_limits: CharacterLimits;
	upload_config: UploadConfig;
	// Reply-specific upload config - Evidence: timeline.php L447-459
	reply_upload_config: ReplyUploadConfig;
	// Review config is a map of post_type -> ReviewConfig
	// Matches Voxel's $root.config.reviews structure
	review_config: Record<string, import('./status').ReviewConfig> | null;

	// Feed settings
	feed_modes: FeedModeConfig[];
	default_order: string;
	statuses_per_page: number;
	comments_per_page: number;

	// Feature flags
	features: {
		mentions: boolean;
		hashtags: boolean;
		emojis: boolean;
		file_upload: boolean;
		link_preview: boolean;
		reviews: boolean;
		reposts: boolean;
		quotes: boolean;
		nested_comments: boolean;
		comment_depth: number;
		posts_editable: boolean;
		replies_editable: boolean;
	};

	// Truncation settings - Evidence: timeline.php L437, L450
	truncate_at: {
		posts: number;
		replies: number;
	};

	// Quotes config - Evidence: timeline.php L464-467
	quotes: {
		truncate_at: number;
		placeholder: string;
	};

	// Asset URLs - Evidence: timeline.php L468-479
	asset_urls: {
		emojis: string;
		link_preview_default: string;
		mentions: string;
		hashtags: string;
	};

	// Search config - Evidence: timeline.php L480-484
	search: {
		maxlength: number;
	};

	// Show usernames - Evidence: timeline.php L489
	show_usernames: boolean;

	// UI strings
	strings: TimelineStrings;

	// Icon SVGs (for vxconfig__icons)
	icons: Record<string, string>;

	// Emoji data (lazy loaded)
	emoji_categories?: EmojiCategory[];
}

/**
 * Timeline context for React components
 */
export interface TimelineContextValue {
	config: TimelineConfig;
	attributes: TimelineBlockAttributes;
	context: 'editor' | 'frontend';
	isLoading: boolean;
	error: string | null;
}

/**
 * Block attributes (from block.json)
 */
export interface TimelineBlockAttributes {
	mode: string;
	orderingOptions: OrderingOption[];
	noStatusText: string;
	searchEnabled: boolean;
	searchValue: string;
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
}

/**
 * Ordering option configuration
 */
export interface OrderingOption {
	_id: string;
	order: 'latest' | 'earliest' | 'most_liked' | 'most_discussed' | 'popular' | 'best_rated' | 'worst_rated';
	time: 'all_time' | 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
	timeCustom: number | string;
	label: string;
}

// Local IconValue definition removed to avoid conflict with @shared/types
// Use IconValue from @shared/types instead
// export interface IconValue { ... }

/**
 * vxconfig data structure (stored in block save output)
 */
export interface VxConfig {
	mode: string;
	ordering_options: OrderingOption[];
	no_status_text: string;
	search_enabled: boolean;
	search_value: string;
	icons: {
		verified: IconValue | null;
		repost: IconValue | null;
		more: IconValue | null;
		like: IconValue | null;
		liked: IconValue | null;
		comment: IconValue | null;
		reply: IconValue | null;
		gallery: IconValue | null;
		upload: IconValue | null;
		emoji: IconValue | null;
		search: IconValue | null;
		trash: IconValue | null;
		external: IconValue | null;
		load_more: IconValue | null;
		no_posts: IconValue | null;
	};
}
