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
	};
}

/**
 * Regular expressions for content parsing
 */
const PATTERNS = {
	// @username or @[username](id:123)
	mention: /@\[([^\]]+)\]\((?:user|post):(\d+)\)|@(\w+)/g,

	// #hashtag
	hashtag: /#(\w+)/g,

	// URLs
	url: /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi,

	// `inline code`
	inlineCode: /`([^`]+)`/g,

	// ```code block```
	codeBlock: /```([\s\S]*?)```/g,

	// **bold**
	bold: /\*\*([^*]+)\*\*/g,

	// *italic*
	italic: /\*([^*]+)\*/g,

	// ~~strikethrough~~
	strikethrough: /~~([^~]+)~~/g,
};

/**
 * Parse content into segments
 *
 * @param content - Raw content string
 * @returns Array of parsed segments
 */
export function parseContent(content: string): ContentSegment[] {
	if (!content) return [];

	const segments: ContentSegment[] = [];
	let remainingContent = content;

	// Process code blocks first (highest priority, prevents parsing inside)
	const codeBlockMatches = [...content.matchAll(PATTERNS.codeBlock)];
	for (const match of codeBlockMatches) {
		const index = remainingContent.indexOf(match[0]);
		if (index > 0) {
			// Add text before code block
			segments.push(...parseInlineContent(remainingContent.slice(0, index)));
		}
		segments.push({
			type: 'code',
			content: match[1].trim(),
			raw: match[0],
		});
		remainingContent = remainingContent.slice(index + match[0].length);
	}

	// Parse remaining content
	if (remainingContent) {
		segments.push(...parseInlineContent(remainingContent));
	}

	return segments;
}

/**
 * Parse inline content (no code blocks)
 */
function parseInlineContent(content: string): ContentSegment[] {
	const segments: ContentSegment[] = [];
	let currentIndex = 0;

	// Find all matches and their positions
	interface Match {
		type: SegmentType;
		index: number;
		length: number;
		content: string;
		raw: string;
		metadata?: ContentSegment['metadata'];
	}

	const matches: Match[] = [];

	// Find mentions
	for (const match of content.matchAll(PATTERNS.mention)) {
		const isAdvanced = match[1] !== undefined;
		matches.push({
			type: 'mention',
			index: match.index!,
			length: match[0].length,
			content: isAdvanced ? match[1] : match[3],
			raw: match[0],
			metadata: isAdvanced
				? {
						userId: parseInt(match[2]),
					}
				: undefined,
		});
	}

	// Find hashtags
	for (const match of content.matchAll(PATTERNS.hashtag)) {
		matches.push({
			type: 'hashtag',
			index: match.index!,
			length: match[0].length,
			content: match[1],
			raw: match[0],
			metadata: {
				hashtag: match[1],
			},
		});
	}

	// Find URLs
	for (const match of content.matchAll(PATTERNS.url)) {
		matches.push({
			type: 'link',
			index: match.index!,
			length: match[0].length,
			content: match[0],
			raw: match[0],
			metadata: {
				url: match[0],
			},
		});
	}

	// Find inline code
	for (const match of content.matchAll(PATTERNS.inlineCode)) {
		matches.push({
			type: 'code',
			index: match.index!,
			length: match[0].length,
			content: match[1],
			raw: match[0],
		});
	}

	// Find bold
	for (const match of content.matchAll(PATTERNS.bold)) {
		matches.push({
			type: 'bold',
			index: match.index!,
			length: match[0].length,
			content: match[1],
			raw: match[0],
		});
	}

	// Find italic (but not inside bold)
	for (const match of content.matchAll(PATTERNS.italic)) {
		// Skip if this is part of a bold marker
		const before = content[match.index! - 1];
		const after = content[match.index! + match[0].length];
		if (before !== '*' && after !== '*') {
			matches.push({
				type: 'italic',
				index: match.index!,
				length: match[0].length,
				content: match[1],
				raw: match[0],
			});
		}
	}

	// Find strikethrough
	for (const match of content.matchAll(PATTERNS.strikethrough)) {
		matches.push({
			type: 'strikethrough',
			index: match.index!,
			length: match[0].length,
			content: match[1],
			raw: match[0],
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
		// Add text before match
		if (match.index > currentIndex) {
			const textContent = content.slice(currentIndex, match.index);
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
	if (currentIndex < content.length) {
		const textContent = content.slice(currentIndex);
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
		.replace(PATTERNS.codeBlock, '$1')
		.replace(PATTERNS.inlineCode, '$1')
		.replace(PATTERNS.bold, '$1')
		.replace(PATTERNS.italic, '$1')
		.replace(PATTERNS.strikethrough, '$1')
		.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1')
		.replace(/#(\w+)/g, '#$1');
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
export function extractMentions(content: string): Array<{ name: string; id?: number }> {
	const mentions: Array<{ name: string; id?: number }> = [];

	for (const match of content.matchAll(PATTERNS.mention)) {
		if (match[1] !== undefined) {
			mentions.push({ name: match[1], id: parseInt(match[2]) });
		} else {
			mentions.push({ name: match[3] });
		}
	}

	return mentions;
}

/**
 * Extract hashtags from content
 */
export function extractHashtags(content: string): string[] {
	const matches = [...content.matchAll(PATTERNS.hashtag)];
	return matches.map((m) => m[1]);
}

/**
 * Count characters (excluding formatting syntax)
 */
export function countCharacters(content: string): number {
	return stripFormatting(content).length;
}

/**
 * Insert mention at cursor position
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

	if (atIndex === -1) {
		// No @ found, just append
		const mentionText = `@[${mention.name}](${mention.type}:${mention.id}) `;
		return {
			content: content.slice(0, cursorPosition) + mentionText + content.slice(cursorPosition),
			cursorPosition: cursorPosition + mentionText.length,
		};
	}

	// Replace from @ to cursor with mention
	const mentionText = `@[${mention.name}](${mention.type}:${mention.id}) `;
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
