/**
 * Timeline Utils - Exports
 *
 * @package VoxelFSE
 */

// Rich text utilities
export {
	parseContent,
	stripFormatting,
	truncateContent,
	extractUrls,
	extractMentions,
	extractHashtags,
	countCharacters,
	insertMention,
	getMentionTrigger,
} from './rich-text';

export type { SegmentType, ContentSegment } from './rich-text';

// Formatters
export {
	formatRelativeTime,
	formatDate,
	formatDateTime,
	formatNumber,
	formatCompactNumber,
	formatCount,
	formatFileSize,
	getInitials,
	truncateText,
	stringToColor,
	calculateReadingTime,
	isToday,
	isThisWeek,
	formatReviewScore,
} from './formatters';
