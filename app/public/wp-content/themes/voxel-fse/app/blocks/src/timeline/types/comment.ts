/**
 * Timeline Comment TypeScript Interfaces
 *
 * Matches Voxel's timeline comment data structure exactly.
 *
 * @package VoxelFSE
 */

import type { Publisher, LikeData, MediaFile, StatusBadge } from './status';

/**
 * Current user permissions for a comment
 */
export interface CommentPermissions {
	can_edit: boolean;
	can_delete: boolean;
	can_moderate: boolean;
	has_liked: boolean;
}

/**
 * Reply count for comment
 */
export interface CommentReplyCount {
	count: number;
}

/**
 * Full comment data structure
 */
export interface Comment {
	id: number;
	status_id: number;
	parent_id: number | null;
	content: string;
	created_at: string;
	edited_at: string | null;
	is_pending: boolean;
	depth: number;
	link?: string; // Permalink to comment

	// Publisher
	publisher: Publisher;

	// Media
	files: MediaFile[];

	// Engagement
	likes: LikeData;
	replies: CommentReplyCount;

	// Permissions
	current_user: CommentPermissions;

	// Badges
	badges: StatusBadge[];
}

/**
 * Comment draft for creating/editing
 */
export interface CommentDraft {
	content: string;
	files: MediaFile[];
}

/**
 * Comment create payload
 */
export interface CommentCreatePayload {
	status_id: number;
	parent_id?: number;
	content: string;
	files?: number[];
}

/**
 * Comment edit payload
 */
export interface CommentEditPayload {
	comment_id: number;
	content: string;
	files?: number[];
}

/**
 * Comment feed fetch parameters
 */
export interface CommentFeedParams {
	status_id: number;
	mode?: 'default' | 'single_comment';
	parent_id?: number;
	reply_id?: number;
	page?: number;
}

/**
 * Comment feed response from API
 */
export interface CommentFeedResponse {
	success: boolean;
	data: Comment[];
	has_more: boolean;
}

/**
 * Comment action response
 */
export interface CommentActionResponse {
	success: boolean;
	message?: string;
	comment?: Comment;
	action?: 'like' | 'unlike';
	badges?: StatusBadge[];
}
