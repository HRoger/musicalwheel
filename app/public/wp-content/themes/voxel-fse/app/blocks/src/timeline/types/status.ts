/**
 * Timeline Status TypeScript Interfaces
 *
 * Matches Voxel's timeline status data structure exactly.
 *
 * @package VoxelFSE
 */

/**
 * Publisher information (user or post)
 */
export interface Publisher {
	type: 'user' | 'post';
	id: number;
	display_name: string;
	username: string | null;
	avatar_url: string;
	link: string;
	is_verified: boolean;
}

/**
 * Post context information
 */
export interface PostContext {
	id: number;
	title: string;
	link: string;
}

/**
 * Like avatar entry (for last3 avatars)
 */
export interface LikeAvatar {
	id: number;
	type: 'user' | 'post';
	display_name: string;
	link: string;
	avatar_url: string;
}

/**
 * Like engagement data
 * Note: has_liked is in current_user, not here (matches Voxel's API)
 */
export interface LikeData {
	count: number;
	last3: LikeAvatar[];
}

/**
 * Reply count data
 * Note: Voxel only returns count, not has_replied
 */
export interface ReplyData {
	count: number;
}

/**
 * Uploaded file/media
 */
export interface MediaFile {
	id: number;
	url: string;
	preview: string;
	alt: string;
}

/**
 * Link preview data
 */
export interface LinkPreview {
	url: string;
	title: string;
	image: string;
	domain: string;
	type: 'youtube' | 'regular';
	embed_url?: string;
	video_id?: string;
}

/**
 * Review level (rating tier)
 */
export interface ReviewLevel {
	label: string;
	color: string;
	score: number;
}

/**
 * Review category rating
 */
export interface ReviewCategoryResult {
	key: string;
	label: string;
	score: number;
	level: ReviewLevel;
}

/**
 * Review data for a status
 */
export interface ReviewData {
	post_type: string;
	score: number;
	formatted_score: string;
	rating: Record<string, number>;
	level: ReviewLevel;
	categories: ReviewCategoryResult[];
	config?: ReviewConfig;
}

/**
 * Review configuration from post type
 */
export interface ReviewConfig {
	input_mode: 'stars' | 'numeric';
	default_icon?: string;
	active_icon?: string;
	rating_levels: ReviewLevel[];
	categories: Array<{
		key: string;
		label: string;
	}>;
}

/**
 * Current user permissions for a status
 */
export interface StatusPermissions {
	can_edit: boolean;
	can_delete: boolean;
	can_moderate: boolean;
	has_liked: boolean;
	has_reposted: boolean;
}

/**
 * Status badge
 */
export interface StatusBadge {
	key: string;
	label: string;
}

/**
 * Status annotation
 */
export interface StatusAnnotation {
	icon: string;
	text: string;
}

/**
 * Feed type options
 */
export type FeedType =
	| 'user_timeline'
	| 'post_timeline'
	| 'post_wall'
	| 'post_reviews'
	| 'author_timeline'
	| 'user_feed'
	| 'global_feed';

/**
 * Full status data structure
 */
export interface Status {
	id: number;
	feed: FeedType;
	content: string;
	created_at: string;
	edited_at: string | null;
	is_pending: boolean;
	private: boolean;
	link?: string;

	// Publishing
	publisher: Publisher;

	// Post context (if posted on a post)
	post: PostContext | null;

	// Engagement
	likes: LikeData;
	replies: ReplyData;

	// Reposts/Quotes (recursive)
	repost_of: Status | null;
	quote_of: Status | null;

	// Media
	files: MediaFile[];

	// Link preview
	link_preview: LinkPreview | null;

	// Review (if applicable)
	review: ReviewData | null;

	// Permissions
	current_user: StatusPermissions;

	// Badges
	badges: StatusBadge[];
	annotation: StatusAnnotation | null;
}

/**
 * Status for creating/editing
 */
export interface StatusDraft {
	content: string;
	files: MediaFile[];
	rating?: Record<string, number>;
}

/**
 * Status create payload
 * Matches Voxel's timeline/v2/status.publish expected parameters
 */
export interface StatusCreatePayload {
	feed: FeedType | string;
	post_id?: number;
	content: string;
	files?: number[];
	rating?: Record<string, number>; // Review rating by category key
	link_preview?: string; // URL for link preview (detected client-side)
}

/**
 * Status edit payload
 */
export interface StatusEditPayload {
	status_id: number;
	content: string;
	files?: number[];
	rating?: Record<string, number>;
}

/**
 * Quote status payload
 */
export interface StatusQuotePayload {
	status_id: number;
	content: string;
	files?: number[];
}

/**
 * Feed fetch parameters
 * Matches Voxel's timeline/v2/get_feed AJAX action parameters
 */
export interface FeedParams {
	page?: number;
	mode: FeedType;
	feed?: string; // feed type alias
	post_id?: number;
	author_id?: number;
	user_id?: number;
	status_id?: number;
	reply_id?: number;
	order?: string; // 'latest', 'earliest', 'most_liked', etc.
	time?: string; // 'today', 'this_week', 'this_month', etc.
	time_custom?: number; // custom days for time filter
	filter?: string; // 'all', 'liked', 'pending'
	search?: string;
}

/**
 * Order type options
 */
export type OrderType =
	| 'latest'
	| 'earliest'
	| 'most_liked'
	| 'most_discussed'
	| 'most_popular'
	| 'best_rated'
	| 'worst_rated';

/**
 * Time filter options
 */
export type TimeFilter =
	| 'today'
	| 'this_week'
	| 'this_month'
	| 'this_year'
	| 'all_time'
	| 'custom';

/**
 * Filter type options
 */
export type FilterType = 'all' | 'liked' | 'pending';

/**
 * Feed response from API
 */
export interface FeedResponse {
	success: boolean;
	data: Status[];
	has_more: boolean;
	meta?: {
		review_config?: Record<string, ReviewConfig>;
	};
}

/**
 * Status action response
 */
export interface StatusActionResponse {
	success: boolean;
	message?: string;
	status?: Status;
	action?: 'like' | 'unlike' | 'repost' | 'unrepost';
	badges?: StatusBadge[];
}

/**
 * Repost response
 */
export interface RepostResponse extends StatusActionResponse {
	repost?: Status;
}

/**
 * Quote status payload
 */
export interface QuoteStatusPayload {
	quote_of: number;
	content: string;
	files?: number[];
}

/**
 * Type aliases for API compatibility
 */
export type StatusFeedParams = FeedParams;
export type StatusFeedResponse = FeedResponse;
