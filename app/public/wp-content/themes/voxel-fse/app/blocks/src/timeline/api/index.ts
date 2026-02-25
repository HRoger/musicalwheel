/**
 * Timeline API - Exports
 *
 * @package VoxelFSE
 */

// Base fetch utilities
export {
	voxelFetch,
	voxelGet,
	voxelPost,
	voxelPut,
	voxelDelete,
	createAbortController,
	VoxelApiError,
} from './voxel-fetch';

export type { VoxelResponse, FetchOptions } from './voxel-fetch';

// Timeline API methods
export {
	// Config
	getTimelineConfig,
	getPostContext,

	// Status operations
	publishStatus,
	editStatus,
	deleteStatus,
	toggleStatusLike,
	toggleRepost,
	quoteStatus,
	quoteStatusApi,
	removeStatusLinkPreview,
	approveStatus,
	markStatusPending,
	pinToProfile,
	unpinFromProfile,

	// Feed
	getStatusFeed,

	// Comment operations
	publishComment,
	editComment,
	deleteComment,
	toggleCommentLike,
	approveComment,
	markCommentPending,

	// Comments feed
	getCommentFeed,

	// Mentions
	searchMentions,

	// File upload
	uploadFile,

	// Link preview
	getLinkPreview,

	// Utilities
	prefetchTimelineData,
	createBatch,
} from './timeline-api';

export type {
	MentionResult,
	MentionsSearchResponse,
	FileUploadResponse,
	UploadProgressCallback,
	ModerationResponse,
	LinkPreviewResponse,
	PostContextResponse,
} from './timeline-api';
