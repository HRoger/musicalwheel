/**
 * Rich Text Utilities
 *
 * Functions for parsing and formatting rich text content.
 * Handles mentions, hashtags, URLs, code blocks, and text formatting.
 *
 * @package VoxelFSE
 */

/**
 * Parsed content segment types
 */
export type SegmentType = 'text' | 'mention' | 'hashtag' | 'link' | 'code' | 'bold' | 'italic' | 'strikethrough';

/**
 * Content segment after parsing
 */
export interface ContentSegment {
	type: SegmentType;
	content: string;
	raw: string;
	metadata?: {
		url?: string;
		userId?: number;
		postId?: number;
		hashtag?: string;
		lang?: string;
	};
}

/**
 * Regular expressions for content parsing
 * Matches Voxel's regex patterns from voxel-timeline-main.beautified.js lines 1390-1397
 */
const PATTERNS = {
	// ```lang\ncode\n``` - code blocks (multiline)
	codeBlock: /^```([A-Za-z0-9._-]{0,24})\r?\n([\s\S]*?)\r?\n```$/gm,

	// `inline code` - preceded by whitespace or start
	inlineCode: /(^|\s)`(\S(?:.*?\S)?)`/g,

	// @username - preceded by whitespace or start
	mention: /(^|\s)(@[A-Za-z0-9._·@-]{1,63})/g,

	// #hashtag - Unicode support (matches Voxel's \p{L}\p{N}\p{M}\p{S})
	hashtag: /(^|\s)(#[\p{L}\p{N}\p{M}\p{S}_\.]{1,63})/gu,

	// URLs
	url: /\bhttps?:\/\/\S+/gi,

	// *bold* - single asterisk, preceded by whitespace or start
	bold: /(^|\s)\*(\S(?:.*?\S)?)\*/g,

	// _italic_ - underscore, preceded by whitespace or start
	italic: /(^|\s)\_(\S(?:.*?\S)?)\_/g,

	// ~strikethrough~ - single tilde, preceded by whitespace or start
	strikethrough: /(^|\s)\~(\S(?:.*?\S)?)\~/g,
};

/**
 * Parse content into segments
 * Matches Voxel's highlightContent method (voxel-timeline-main.beautified.js lines 1471-1559)
 *
 * @param content - Raw content string
 * @param options - Options (linkPreviewUrl: strip URL from end of content)
 * @returns Array of parsed segments
 */
export function parseContent(content: string, options?: { linkPreviewUrl?: string }): ContentSegment[] {
	if (!content) return [];

	const segments: ContentSegment[] = [];
	let remainingContent = content;

	// Process code blocks first (highest priority, prevents parsing inside)
	const codeBlockMatches = [...content.matchAll(PATTERNS.codeBlock)];
	for (const match of codeBlockMatches) {
		const index = remainingContent.indexOf(match[0]);
		if (index > 0) {
			// Add text before code block
			segments.push(...parseInlineContent(remainingContent.slice(0, index), options));
		}
		segments.push({
			type: 'code',
			content: match[2].trim(), // match[2] is the code content, match[1] is the lang
			raw: match[0],
			metadata: match[1] ? { lang: match[1] } : undefined,
		});
		remainingContent = remainingContent.slice(index + match[0].length);
	}

	// Parse remaining content
	if (remainingContent) {
		segments.push(...parseInlineContent(remainingContent, options));
	}

	return segments;
}

/**
 * Parse inline content (no code blocks)
 * Matches Voxel's highlightContent processing order (lines 1496-1554):
 * 1. inline code, 2. @mentions, 3. #hashtags, 4. strip link preview URL, 5. URLs, 6. bold, 7. italic, 8. strikethrough
 */
function parseInlineContent(content: string, options?: { linkPreviewUrl?: string }): ContentSegment[] {
	const segments: ContentSegment[] = [];
	let currentIndex = 0;

	// Strip link preview URL from end of content (matches Voxel lines 1524-1529)
	let processedContent = content;
	if (options?.linkPreviewUrl && processedContent.endsWith(options.linkPreviewUrl)) {
		processedContent = processedContent.slice(0, -options.linkPreviewUrl.length).trimEnd();
	}

	// Find all matches and their positions
	interface Match {
		type: SegmentType;
		index: number;
		length: number;
		content: string;
		raw: string;
		prefix: string; // whitespace/start prefix captured by (^|\s) group
		metadata?: ContentSegment['metadata'];
	}

	const matches: Match[] = [];

	// Find inline code - pattern: (^|\s)`code`
	for (const match of processedContent.matchAll(PATTERNS.inlineCode)) {
		const prefix = match[1] || '';
		matches.push({
			type: 'code',
			index: match.index! + prefix.length,
			length: match[0].length - prefix.length,
			content: match[2],
			raw: match[0],
			prefix,
		});
	}

	// Find mentions - pattern: (^|\s)(@username)
	for (const match of processedContent.matchAll(PATTERNS.mention)) {
		const prefix = match[1] || '';
		const username = match[2]; // Full "@username"
		matches.push({
			type: 'mention',
			index: match.index! + prefix.length,
			length: match[0].length - prefix.length,
			content: username,
			raw: match[0],
			prefix,
		});
	}

	// Find hashtags - pattern: (^|\s)(#hashtag)
	for (const match of processedContent.matchAll(PATTERNS.hashtag)) {
		const prefix = match[1] || '';
		const hashtag = match[2]; // Full "#hashtag"
		matches.push({
			type: 'hashtag',
			index: match.index! + prefix.length,
			length: match[0].length - prefix.length,
			content: hashtag,
			raw: match[0],
			prefix,
			metadata: {
				hashtag: hashtag.slice(1), // Remove # for metadata
			},
		});
	}

	// Find URLs
	for (const match of processedContent.matchAll(PATTERNS.url)) {
		matches.push({
			type: 'link',
			index: match.index!,
			length: match[0].length,
			content: match[0],
			raw: match[0],
			prefix: '',
			metadata: {
				url: match[0],
			},
		});
	}

	// Find bold - pattern: (^|\s)*text*
	for (const match of processedContent.matchAll(PATTERNS.bold)) {
		const prefix = match[1] || '';
		matches.push({
			type: 'bold',
			index: match.index! + prefix.length,
			length: match[0].length - prefix.length,
			content: match[2],
			raw: match[0],
			prefix,
		});
	}

	// Find italic - pattern: (^|\s)_text_
	for (const match of processedContent.matchAll(PATTERNS.italic)) {
		const prefix = match[1] || '';
		matches.push({
			type: 'italic',
			index: match.index! + prefix.length,
			length: match[0].length - prefix.length,
			content: match[2],
			raw: match[0],
			prefix,
		});
	}

	// Find strikethrough - pattern: (^|\s)~text~
	for (const match of processedContent.matchAll(PATTERNS.strikethrough)) {
		const prefix = match[1] || '';
		matches.push({
			type: 'strikethrough',
			index: match.index! + prefix.length,
			length: match[0].length - prefix.length,
			content: match[2],
			raw: match[0],
			prefix,
		});
	}

	// Sort matches by index
	matches.sort((a, b) => a.index - b.index);

	// Remove overlapping matches (keep earlier/longer)
	const filteredMatches: Match[] = [];
	for (const match of matches) {
		const overlaps = filteredMatches.some(
			(existing) =>
				match.index < existing.index + existing.length &&
				match.index + match.length > existing.index
		);
		if (!overlaps) {
			filteredMatches.push(match);
		}
	}

	// Build segments
	for (const match of filteredMatches) {
		// Add text before match (including any prefix whitespace that was part of the regex)
		if (match.index > currentIndex) {
			const textContent = processedContent.slice(currentIndex, match.index);
			if (textContent) {
				segments.push({
					type: 'text',
					content: textContent,
					raw: textContent,
				});
			}
		}

		// Add match
		segments.push({
			type: match.type,
			content: match.content,
			raw: match.raw,
			metadata: match.metadata,
		});

		currentIndex = match.index + match.length;
	}

	// Add remaining text
	if (currentIndex < processedContent.length) {
		const textContent = processedContent.slice(currentIndex);
		if (textContent) {
			segments.push({
				type: 'text',
				content: textContent,
				raw: textContent,
			});
		}
	}

	return segments;
}

/**
 * Extract plain text from content (strip formatting)
 */
export function stripFormatting(content: string): string {
	return content
		.replace(PATTERNS.codeBlock, '$2')
		.replace(PATTERNS.inlineCode, '$1$2')
		.replace(PATTERNS.bold, '$1$2')
		.replace(PATTERNS.italic, '$1$2')
		.replace(PATTERNS.strikethrough, '$1$2');
}

/**
 * Truncate content with ellipsis
 *
 * @param content - Content to truncate
 * @param maxLength - Maximum length
 * @param preserveWords - Don't cut words in middle
 */
export function truncateContent(
	content: string,
	maxLength: number,
	preserveWords: boolean = true
): { text: string; isTruncated: boolean } {
	if (content.length <= maxLength) {
		return { text: content, isTruncated: false };
	}

	let truncated = content.slice(0, maxLength);

	if (preserveWords) {
		// Find last space before maxLength
		const lastSpace = truncated.lastIndexOf(' ');
		if (lastSpace > maxLength * 0.5) {
			truncated = truncated.slice(0, lastSpace);
		}
	}

	return {
		text: truncated.trim() + '...',
		isTruncated: true,
	};
}

/**
 * Extract URLs from content
 */
export function extractUrls(content: string): string[] {
	const matches = content.match(PATTERNS.url);
	return matches || [];
}

/**
 * Extract mentions from content
 */
export function extractMentions(content: string): Array<{ name: string }> {
	const mentions: Array<{ name: string }> = [];

	for (const match of content.matchAll(PATTERNS.mention)) {
		// match[2] is the full @username
		mentions.push({ name: match[2].slice(1) }); // Remove @ prefix
	}

	return mentions;
}

/**
 * Extract hashtags from content
 */
export function extractHashtags(content: string): string[] {
	const matches = [...content.matchAll(PATTERNS.hashtag)];
	return matches.map((m) => m[2].slice(1)); // match[2] is full #hashtag, remove # prefix
}

/**
 * Count characters (excluding formatting syntax)
 */
export function countCharacters(content: string): number {
	return stripFormatting(content).length;
}

/**
 * Insert mention at cursor position
 * Matches Voxel's simple @username format (not the advanced @[name](type:id) format)
 *
 * @param content - Current content
 * @param cursorPosition - Cursor position
 * @param mention - Mention to insert
 */
export function insertMention(
	content: string,
	cursorPosition: number,
	mention: { name: string; id: number; type: 'user' | 'post' }
): { content: string; cursorPosition: number } {
	// Find the @ trigger before cursor
	const beforeCursor = content.slice(0, cursorPosition);
	const atIndex = beforeCursor.lastIndexOf('@');

	// Voxel uses simple @username format
	const mentionText = `@${mention.name} `;

	if (atIndex === -1) {
		// No @ found, just append
		return {
			content: content.slice(0, cursorPosition) + mentionText + content.slice(cursorPosition),
			cursorPosition: cursorPosition + mentionText.length,
		};
	}

	// Replace from @ to cursor with mention
	const newContent = content.slice(0, atIndex) + mentionText + content.slice(cursorPosition);

	return {
		content: newContent,
		cursorPosition: atIndex + mentionText.length,
	};
}

/**
 * Check if cursor is in mention trigger position
 *
 * @param content - Content string
 * @param cursorPosition - Cursor position
 */
export function getMentionTrigger(
	content: string,
	cursorPosition: number
): { active: boolean; query: string; startIndex: number } | null {
	const beforeCursor = content.slice(0, cursorPosition);

	// Find last @ that's not part of an existing mention
	const atIndex = beforeCursor.lastIndexOf('@');

	if (atIndex === -1) {
		return null;
	}

	// Check if there's a space or newline between @ and cursor
	const afterAt = beforeCursor.slice(atIndex + 1);
	if (/\s/.test(afterAt)) {
		return null;
	}

	// Check if this @ is already part of a formatted mention
	const mentionPattern = /@\[([^\]]+)\]\([^)]+\)/;
	const beforeAt = content.slice(0, atIndex + afterAt.length + 1);
	if (mentionPattern.test(beforeAt)) {
		return null;
	}

	return {
		active: true,
		query: afterAt,
		startIndex: atIndex,
	};
}
