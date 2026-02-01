/**
 * Timeline API Client
 *
 * Complete API client for all Voxel timeline operations.
 * Implements all 23 AJAX actions through REST API proxy.
 *
 * @package VoxelFSE
 */

import { voxelGet, voxelPost, voxelDelete, voxelAjax, voxelAjaxPost } from './voxel-fetch';
import { getRestBaseUrl } from '@shared/utils/siteUrl';
import type {
	Status,
	StatusFeedParams,
	StatusFeedResponse,
	StatusCreatePayload,
	StatusEditPayload,
	StatusActionResponse,
	RepostResponse,
	QuoteStatusPayload,
} from '../types/status';
import type {
	Comment,
	CommentFeedParams,
	CommentFeedResponse,
	CommentCreatePayload,
	CommentEditPayload,
	CommentActionResponse,
} from '../types/comment';
import type { TimelineConfig } from '../types/config';

// REST API namespace
const API_NAMESPACE = 'voxel-fse/v1/timeline';

/**
 * ============================================================================
 * CONFIGURATION
 * ============================================================================
 */

/**
 * Fetch timeline configuration
 * Returns config needed for React components initialization
 */
export async function getTimelineConfig(): Promise<TimelineConfig> {
	return voxelGet<TimelineConfig>(`${API_NAMESPACE}/config`);
}

/**
 * Post context response type
 * CRITICAL FOR 1:1 VOXEL PARITY
 * Contains visibility checks, composer config, and review config
 */
export interface PostContextResponse {
	visible: boolean;
	reason: 'no_post_context' | 'no_author_context' | 'login_required' | 'followers_only' | 'customers_only' | 'private' | null;
	composer: {
		feed: string;
		can_post: boolean;
		post_as?: 'current_user' | 'current_post';
		placeholder?: string;
		reviews_post_type?: string;
	} | null;
	reviews: Record<string, unknown> | null;
	current_post: {
		exists: boolean;
		id: number;
		display_name: string;
		avatar_url: string;
		link: string;
		author_id: number;
		post_type: string | null;
	} | null;
	current_author: {
		exists: boolean;
		id: number;
		display_name: string;
		avatar_url: string;
		link: string;
	} | null;
	filtering_options: Record<string, string>;
	show_usernames: boolean;
}

/**
 * Get post context for timeline
 *
 * CRITICAL FOR 1:1 VOXEL PARITY
 * This function fetches visibility checks, composer config, and review config
 * based on the timeline mode and post context.
 *
 * Evidence: themes/voxel/app/widgets/timeline.php lines 316-384, 555-626
 *
 * @param mode - Timeline display mode (user_feed, post_wall, post_reviews, etc.)
 * @param postId - Optional post ID for post-related modes
 */
export async function getPostContext(
	mode: string,
	postId?: number
): Promise<PostContextResponse> {
	const params: Record<string, string | number> = { mode };
	if (postId) {
		params.post_id = postId;
	}
	return voxelGet<PostContextResponse>(`${API_NAMESPACE}/post-context`, params);
}

/**
 * ============================================================================
 * STATUS OPERATIONS (9 endpoints)
 * ============================================================================
 */

/**
 * Publish a new status
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/status.publish
 *
 * NOTE: We use voxelAjaxPost() instead of voxelPost() because the REST API proxy
 * cannot capture Voxel's AJAX response (wp_send_json calls wp_die internally).
 *
 * @param payload - Status data (feed, content, files, post_id, rating)
 * @param nonce - The timeline nonce (from config.nonces.status_publish)
 */
export async function publishStatus(
	payload: StatusCreatePayload,
	nonce: string
): Promise<Status> {
	// Voxel expects: data=JSON.stringify({feed, post_id, content, files, rating, link_preview})
	const dataPayload: Record<string, unknown> = {
		feed: payload.feed,
		post_id: payload.post_id ?? null,
		content: payload.content,
		files: payload.files ?? [],
		rating: payload.rating ?? {},
	};

	// Add link preview URL if detected (matches Voxel's timeline-main.beautified.js submit method)
	if (payload.link_preview) {
		dataPayload.link_preview = payload.link_preview;
	}

	const response = await voxelAjaxPost<{ status: Status; message?: string }>('timeline/v2/status.publish', {
		data: JSON.stringify(dataPayload),
		_wpnonce: nonce,
	});
	return response.status;
}

/**
 * Edit an existing status
 * Voxel action: timeline/v2/status.edit
 *
 * NOTE: Voxel expects data as JSON-encoded string, same as publish.
 * See status-controller.php line 323: json_decode( wp_unslash( $_REQUEST['data'] ?? '' ), true )
 */
export async function editStatus(
	payload: StatusEditPayload,
	nonce: string
): Promise<Status> {
	// Voxel expects: data=JSON.stringify({status_id, content, files, rating})
	const dataPayload = {
		status_id: payload.status_id,
		content: payload.content,
		files: payload.files ?? [],
		rating: payload.rating ?? {},
	};

	const response = await voxelAjaxPost<{ status: Status; message: string }>('timeline/v2/status.edit', {
		data: JSON.stringify(dataPayload),
		_wpnonce: nonce,
	});
	return response.status;
}

/**
 * Delete a status
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/status.delete
 *
 * NOTE: We use voxelAjaxPost() instead of voxelDelete() because the REST API proxy
 * cannot capture Voxel's AJAX response (wp_send_json calls wp_die internally).
 *
 * @param statusId - The status ID to delete
 * @param nonce - The timeline nonce (from config.nonces.status_delete or status_edit)
 */
export async function deleteStatus(
	statusId: number,
	nonce: string
): Promise<{ deleted: boolean }> {
	const response = await voxelAjaxPost<{ success: boolean }>('timeline/v2/status.delete', {
		status_id: statusId,
		_wpnonce: nonce,
	});
	return { deleted: response.success !== false };
}

/**
 * Like/unlike a status
 * Uses Voxel's native AJAX endpoint directly: /?vx=1&action=timeline/v2/status.like
 *
 * NOTE: We use voxelAjaxPost() instead of voxelPost() because the REST API proxy
 * cannot capture Voxel's AJAX response (wp_send_json calls wp_die internally).
 *
 * @param statusId - The status ID to like/unlike
 * @param nonce - The timeline nonce (from config.nonces.status_like)
 */
export async function toggleStatusLike(statusId: number, nonce: string): Promise<StatusActionResponse> {
	return voxelAjaxPost<StatusActionResponse>('timeline/v2/status.like', {
		status_id: statusId,
		_wpnonce: nonce,
	});
}

/**
 * Repost/unrepost a status
 * Uses Voxel's native AJAX endpoint directly: /?vx=1&action=timeline/v2/status.repost
 *
 * NOTE: We use voxelAjaxPost() instead of voxelPost() because the REST API proxy
 * cannot capture Voxel's AJAX response (wp_send_json calls wp_die internally).
 *
 * @param statusId - The status ID to repost/unrepost
 * @param nonce - The timeline nonce (from config.nonces.status_repost)
 */
export async function toggleRepost(statusId: number, nonce: string): Promise<RepostResponse> {
	return voxelAjaxPost<RepostResponse>('timeline/v2/status.repost', {
		status_id: statusId,
		_wpnonce: nonce,
	});
}

/**
 * Quote a status (create new status that quotes another)
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/status.quote
 *
 * NOTE: Voxel expects complex data as a JSON-encoded string in the 'data' parameter.
 * See: timeline-composer.beautified.js lines 371-396
 *
 * @param payload - Quote payload (quote_of, content, files)
 * @param nonce - The timeline nonce (from config.nonces.status_quote or status_publish)
 */
export async function quoteStatus(payload: QuoteStatusPayload): Promise<Status> {
	return voxelPost<Status>(`${API_NAMESPACE}/status/${payload.quote_of}/quote`, {
		content: payload.content,
		files: payload.files,
	});
}

/**
 * Quote a status via Voxel's native AJAX (recommended)
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/status.quote
 *
 * NOTE: Voxel expects complex data as a JSON-encoded string in the 'data' parameter.
 * See: timeline-composer.beautified.js lines 371-396
 *
 * @param payload - Quote payload (quote_of, content, files)
 * @param nonce - The timeline nonce (from config.nonces.status_quote or status_publish)
 */
export async function quoteStatusApi(
	payload: QuoteStatusPayload,
	nonce: string
): Promise<Status> {
	// Voxel expects: data=JSON.stringify({status_id, content, files})
	const dataPayload = {
		status_id: payload.quote_of,
		content: payload.content,
		files: payload.files ?? [],
	};

	const response = await voxelAjaxPost<{ status: Status; message?: string }>('timeline/v2/status.quote', {
		data: JSON.stringify(dataPayload),
		_wpnonce: nonce,
	});
	return response.status;
}

/**
 * Remove link preview from a status
 * Voxel action: timeline/v2/status.remove_link_preview
 */
export async function removeStatusLinkPreview(statusId: number): Promise<{ removed: boolean }> {
	return voxelPost<{ removed: boolean }>(`${API_NAMESPACE}/status/${statusId}/remove-link-preview`);
}

/**
 * Response type for moderation actions
 * Voxel only returns success and badges, not full status
 */
export interface ModerationResponse {
	success: boolean;
	badges: Array<{ key: string; label: string }>;
}

/**
 * Mark status as approved (moderation)
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/status.mark_approved
 *
 * NOTE: Voxel requires nonce verification for moderation actions.
 * See status-controller.php line 700: \Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_timeline' )
 *
 * @param statusId - The status ID to approve
 * @param nonce - The timeline nonce (from config.nonces.status_edit or status_moderate)
 */
export async function approveStatus(statusId: number, nonce: string): Promise<ModerationResponse> {
	return voxelAjaxPost<ModerationResponse>('timeline/v2/status.mark_approved', {
		status_id: statusId,
		_wpnonce: nonce,
	});
}

/**
 * Mark status as pending (moderation)
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/status.mark_pending
 *
 * NOTE: Voxel requires nonce verification for moderation actions.
 * See status-controller.php line 728: \Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_timeline' )
 *
 * @param statusId - The status ID to mark as pending
 * @param nonce - The timeline nonce (from config.nonces.status_edit or status_moderate)
 */
export async function markStatusPending(statusId: number, nonce: string): Promise<ModerationResponse> {
	return voxelAjaxPost<ModerationResponse>('timeline/v2/status.mark_pending', {
		status_id: statusId,
		_wpnonce: nonce,
	});
}

/**
 * ============================================================================
 * FEED OPERATIONS (1 endpoint)
 * ============================================================================
 */

/**
 * Get status feed with pagination and filtering
 * Uses Voxel's native AJAX endpoint directly: /?vx=1&action=timeline/v2/get_feed
 *
 * NOTE: We use voxelAjax() instead of voxelGet() because the REST API proxy
 * cannot capture Voxel's AJAX response (wp_send_json calls wp_die internally).
 *
 * Parameter mapping (our names -> Voxel's expected names):
 * - order -> order_type
 * - time -> order_time
 * - time_custom -> order_time_custom
 * - filter -> filter_by
 * - author_id -> user_id (for author_timeline mode)
 */
export async function getStatusFeed(params: StatusFeedParams): Promise<StatusFeedResponse> {
	// Call Voxel's native AJAX endpoint directly
	// Map our parameter names to Voxel's expected parameter names
	return voxelAjax<StatusFeedResponse>('timeline/v2/get_feed', {
		mode: params.mode,
		order_type: params.order,           // Voxel expects 'order_type'
		order_time: params.time,            // Voxel expects 'order_time'
		order_time_custom: params.time_custom, // Voxel expects 'order_time_custom'
		search: params.search,
		filter_by: params.filter,           // Voxel expects 'filter_by'
		page: params.page,
		post_id: params.post_id,
		user_id: params.author_id,          // Voxel expects 'user_id' for author_timeline
		status_id: params.status_id,
	});
}

/**
 * ============================================================================
 * COMMENT OPERATIONS (6 endpoints)
 * Uses Voxel's native AJAX endpoints directly for same reason as status actions.
 * ============================================================================
 */

/**
 * Publish a comment or reply
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comment.publish
 *
 * NOTE: Voxel expects complex data as a JSON-encoded string in the 'data' parameter.
 * This is different from simple actions like 'like' which use individual form fields.
 * See: comment-controller.php line 41: json_decode( wp_unslash( $_REQUEST['data'] ?? '' ), true )
 *
 * @param payload - Comment data (status_id, content, parent_id, files)
 * @param nonce - The timeline nonce (from config.nonces.comment_publish)
 */
export async function publishComment(
	payload: CommentCreatePayload,
	nonce: string
): Promise<Comment> {
	// Voxel expects: data=JSON.stringify({status_id, parent_id, content, files})
	const dataPayload = {
		status_id: payload.status_id,
		parent_id: payload.parent_id ?? null,
		content: payload.content,
		files: payload.files ?? [],
	};

	const response = await voxelAjaxPost<{ comment: Comment }>('timeline/v2/comment.publish', {
		data: JSON.stringify(dataPayload),
		_wpnonce: nonce,
	});
	return response.comment;
}

/**
 * Edit an existing comment
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comment.edit
 *
 * NOTE: Voxel expects complex data as a JSON-encoded string in the 'data' parameter.
 * See: comment-controller.php line 193: json_decode( wp_unslash( $_REQUEST['data'] ?? '' ), true )
 *
 * @param payload - Edit payload (comment_id, content, files)
 * @param nonce - The timeline nonce (from config.nonces.comment_edit)
 */
export async function editComment(
	payload: CommentEditPayload,
	nonce: string
): Promise<Comment> {
	// Voxel expects: data=JSON.stringify({comment_id, content, files})
	const dataPayload = {
		comment_id: payload.comment_id,
		content: payload.content,
		files: payload.files ?? [],
	};

	const response = await voxelAjaxPost<{ comment: Comment }>('timeline/v2/comment.edit', {
		data: JSON.stringify(dataPayload),
		_wpnonce: nonce,
	});
	return response.comment;
}

/**
 * Delete a comment
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comment.delete
 *
 * @param commentId - The comment ID to delete
 * @param nonce - The timeline nonce (from config.nonces.comment_delete)
 */
export async function deleteComment(
	commentId: number,
	nonce: string
): Promise<{ deleted: boolean }> {
	const response = await voxelAjaxPost<{ success: boolean }>('timeline/v2/comment.delete', {
		comment_id: commentId,
		_wpnonce: nonce,
	});
	return { deleted: response.success !== false };
}

/**
 * Like/unlike a comment
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comment.like
 *
 * @param commentId - The comment ID to like/unlike
 * @param nonce - The timeline nonce (from config.nonces.comment_like)
 */
export async function toggleCommentLike(
	commentId: number,
	nonce: string
): Promise<CommentActionResponse> {
	return voxelAjaxPost<CommentActionResponse>('timeline/v2/comment.like', {
		comment_id: commentId,
		_wpnonce: nonce,
	});
}

/**
 * Mark comment as approved (moderation)
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comment.mark_approved
 *
 * @param commentId - The comment ID to approve
 * @param nonce - The timeline nonce (from config.nonces.comment_edit)
 */
export async function approveComment(
	commentId: number,
	nonce: string
): Promise<Comment> {
	const response = await voxelAjaxPost<{ comment: Comment }>('timeline/v2/comment.mark_approved', {
		comment_id: commentId,
		_wpnonce: nonce,
	});
	return response.comment;
}

/**
 * Mark comment as pending (moderation)
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comment.mark_pending
 *
 * @param commentId - The comment ID to mark pending
 * @param nonce - The timeline nonce (from config.nonces.comment_edit)
 */
export async function markCommentPending(
	commentId: number,
	nonce: string
): Promise<Comment> {
	const response = await voxelAjaxPost<{ comment: Comment }>('timeline/v2/comment.mark_pending', {
		comment_id: commentId,
		_wpnonce: nonce,
	});
	return response.comment;
}

/**
 * ============================================================================
 * COMMENTS FEED (1 endpoint)
 * Uses Voxel's native AJAX endpoint for same reason as status feed.
 * ============================================================================
 */

/**
 * Get comments for a status
 * Uses Voxel's native AJAX endpoint: /?vx=1&action=timeline/v2/comments/get_feed
 *
 * @param params - Feed parameters (status_id, parent_id, page, etc.)
 */
export async function getCommentFeed(params: CommentFeedParams): Promise<CommentFeedResponse> {
	return voxelAjax<CommentFeedResponse>('timeline/v2/comments/get_feed', {
		status_id: params.status_id,
		parent_id: params.parent_id,
		reply_id: params.reply_id,
		page: params.page,
		mode: params.mode,
	});
}

/**
 * ============================================================================
 * MENTIONS (1 endpoint)
 * ============================================================================
 */

/**
 * Search result for mentions
 */
export interface MentionResult {
	id: number;
	type: 'user' | 'post';
	name: string;
	avatar_url: string;
	link: string;
}

/**
 * Mentions search response
 */
export interface MentionsSearchResponse {
	results: MentionResult[];
}

/**
 * Search for mentions (users/posts)
 * Voxel action: timeline/v2/mentions.search
 */
export async function searchMentions(
	query: string,
	signal?: AbortSignal
): Promise<MentionsSearchResponse> {
	return voxelGet<MentionsSearchResponse>(
		`${API_NAMESPACE}/mentions`,
		{ query },
		{ signal }
	);
}

/**
 * ============================================================================
 * FILE UPLOAD (1 endpoint)
 * ============================================================================
 */

/**
 * Upload response
 */
export interface FileUploadResponse {
	id: number;
	url: string;
	name: string;
	mime_type: string;
	size: number;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload a file for timeline
 * Uses WordPress media upload with progress tracking
 */
export async function uploadFile(
	file: File,
	onProgress?: UploadProgressCallback
): Promise<FileUploadResponse> {
	return new Promise((resolve, reject) => {
		const formData = new FormData();
		formData.append('file', file);

		const xhr = new XMLHttpRequest();

		// Track upload progress
		if (onProgress) {
			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					const progress = Math.round((event.loaded / event.total) * 100);
					onProgress(progress);
				}
			});
		}

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const response = JSON.parse(xhr.responseText);
					if (response.success) {
						resolve(response.data);
					} else {
						reject(new Error(response.message || 'Upload failed'));
					}
				} catch (e) {
					reject(new Error('Invalid response from server'));
				}
			} else {
				reject(new Error(`Upload failed with status ${xhr.status}`));
			}
		});

		xhr.addEventListener('error', () => {
			reject(new Error('Network error during upload'));
		});

		xhr.addEventListener('abort', () => {
			reject(new Error('Upload cancelled'));
		});

		// Get nonce from global config
		const nonce = window.wpApiSettings?.nonce || window.voxelFseConfig?.nonce || '';
		// MULTISITE FIX: Use getRestBaseUrl() for multisite subdirectory support
		const restUrl = getRestBaseUrl();

		xhr.open('POST', `${restUrl}${API_NAMESPACE}/upload`);
		xhr.setRequestHeader('X-WP-Nonce', nonce);
		xhr.send(formData);
	});
}

/**
 * ============================================================================
 * LINK PREVIEW (1 endpoint)
 * ============================================================================
 */

/**
 * Link preview response
 * Matches Voxel's link preview structure
 */
export interface LinkPreviewResponse {
	url: string;
	title: string;
	description: string;
	image: string;
	type: 'default' | 'youtube' | 'vimeo' | 'twitter';
	embed_url?: string; // For video embeds
}

/**
 * Get link preview for a URL
 * Voxel action: timeline.get_link_preview
 *
 * Used for client-side link preview detection while typing.
 * See voxel-timeline-main.beautified.js lines 696-720
 *
 * @param url - The URL to get preview for
 * @param nonce - The timeline nonce
 * @param signal - AbortSignal for cancellation
 */
export async function getLinkPreview(
	url: string,
	nonce: string,
	signal?: AbortSignal
): Promise<LinkPreviewResponse | null> {
	try {
		const response = await voxelAjax<{ success: boolean; preview?: LinkPreviewResponse }>(
			'timeline.get_link_preview',
			{
				url,
				_wpnonce: nonce,
			},
			{ signal }
		);
		return response.preview ?? null;
	} catch {
		return null;
	}
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Pre-fetch data for SSR/hydration
 * Called during server-side rendering to fetch initial data
 */
export async function prefetchTimelineData(params: StatusFeedParams): Promise<{
	config: TimelineConfig;
	feed: StatusFeedResponse;
}> {
	// Fetch config and initial feed in parallel
	const [config, feed] = await Promise.all([
		getTimelineConfig(),
		getStatusFeed(params),
	]);

	return { config, feed };
}

/**
 * Create a batch of API calls
 * Useful for optimistic updates with rollback
 */
export function createBatch<T>(
	calls: Array<() => Promise<T>>
): {
	execute: () => Promise<T[]>;
	abort: () => void;
} {
	const controller = new AbortController();

	return {
		execute: () => Promise.all(calls.map((call) => call())),
		abort: () => controller.abort(),
	};
}
