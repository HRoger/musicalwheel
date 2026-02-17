/**
 * RichTextFormatter Component
 *
 * Renders formatted text content with support for:
 * - @mentions (linked to profiles)
 * - #hashtags (linked to search)
 * - URLs (auto-linked)
 * - *bold*, _italic_, ~strikethrough~
 * - `inline code` and ```code blocks```
 *
 * Matches Voxel's timeline content rendering exactly.
 * See: voxel-timeline-main.beautified.js lines 1471-1559
 *
 * @package VoxelFSE
 */

import { useMemo, Fragment, type ReactNode } from 'react';
import { parseContent, truncateContent, type ContentSegment } from '../utils';

/**
 * Props
 */
interface RichTextFormatterProps {
	content: string;
	maxLength?: number;
	onToggleExpand?: () => void;
	isExpanded?: boolean;
	mentionBaseUrl?: string;
	hashtagBaseUrl?: string;
	className?: string;
	linkTarget?: '_blank' | '_self';
	linkPreviewUrl?: string;
}

/**
 * Render a single content segment
 * Matches Voxel's highlightContent output HTML
 */
function renderSegment(
	segment: ContentSegment,
	index: number,
	mentionBaseUrl: string,
	hashtagBaseUrl: string,
	linkTarget: string
): ReactNode {
	const key = `${segment.type}-${index}`;

	switch (segment.type) {
		case 'text':
			// Preserve line breaks
			return (
				<Fragment key={key}>
					{segment.content.split('\n').map((line, lineIndex, arr) => (
						<Fragment key={lineIndex}>
							{line}
							{lineIndex < arr.length - 1 && <br />}
						</Fragment>
					))}
				</Fragment>
			);

		case 'mention': {
			// Voxel uses ?username= param with the username (without @)
			// Also adds dot styling: · → <span style="opacity:.3;">·</span>
			const username = segment.content.startsWith('@') ? segment.content.slice(1) : segment.content;
			const profileUrl = new URL(mentionBaseUrl, window.location.origin);
			profileUrl.searchParams.set('username', username);

			// Add dot styling (matches Voxel line 1503)
			const displayParts = segment.content.split('·');
			const displayContent = displayParts.length > 1
				? displayParts.map((part, i) => (
					<Fragment key={i}>
						{part}
						{i < displayParts.length - 1 && <span style={{ opacity: 0.3 }}>·</span>}
					</Fragment>
				))
				: segment.content;

			return (
				<a key={key} href={profileUrl.toString()}>
					{displayContent}
				</a>
			);
		}

		case 'hashtag': {
			// Voxel uses ?q= param (not ?search=)
			const hashtagUrl = new URL(hashtagBaseUrl, window.location.origin);
			hashtagUrl.searchParams.set('q', segment.content);

			return (
				<a key={key} href={hashtagUrl.toString()}>
					{segment.content}
				</a>
			);
		}

		case 'link':
			// Voxel doesn't truncate URLs - displays full URL
			return (
				<a
					key={key}
					href={segment.metadata?.url || segment.content}
					rel="noopener noreferrer nofollow"
					target={linkTarget}
				>
					{segment.content}
				</a>
			);

		case 'code':
			// Multiline = code block with `min-scroll` class (matches Voxel line 1492)
			if (segment.content.includes('\n')) {
				return (
					<pre
						key={key}
						className="min-scroll"
						{...(segment.metadata?.lang ? { 'data-lang': segment.metadata.lang } : {})}
					>
						{segment.content}
					</pre>
				);
			}
			// Inline code (matches Voxel line 1497)
			return (
				<code key={key}>
					{segment.content}
				</code>
			);

		case 'bold':
			return (
				<strong key={key}>
					{segment.content}
				</strong>
			);

		case 'italic':
			return (
				<em key={key}>
					{segment.content}
				</em>
			);

		case 'strikethrough':
			return (
				<del key={key}>
					{segment.content}
				</del>
			);

		default:
			return <Fragment key={key}>{segment.content}</Fragment>;
	}
}

/**
 * RichTextFormatter Component
 */
export function RichTextFormatter({
	content,
	maxLength,
	onToggleExpand,
	isExpanded = true,
	mentionBaseUrl = '/members/',
	hashtagBaseUrl = '/search/',
	className = '',
	linkTarget = '_blank',
	linkPreviewUrl,
}: RichTextFormatterProps): JSX.Element {
	// Process and optionally truncate content
	const { displayContent, isTruncated } = useMemo(() => {
		if (!maxLength || isExpanded || content.length <= maxLength) {
			return { displayContent: content, isTruncated: false };
		}

		const result = truncateContent(content, maxLength, true);
		return { displayContent: result.text, isTruncated: result.isTruncated };
	}, [content, maxLength, isExpanded]);

	// Parse content into segments
	const segments = useMemo(
		() => parseContent(displayContent, { linkPreviewUrl }),
		[displayContent, linkPreviewUrl]
	);

	return (
		<>
			{segments.map((segment, index) =>
				renderSegment(segment, index, mentionBaseUrl, hashtagBaseUrl, linkTarget)
			)}

			{/* Read more / Read less toggle - matches Voxel's status.php line 144 */}
			{/* Voxel uses <a href="#" class="vxfeed__read-more"> with ▾ and ▴ arrows */}
			{isTruncated && !isExpanded && onToggleExpand && (
				<a
					href="#"
					className="vxfeed__read-more"
					onClick={(e) => { e.preventDefault(); onToggleExpand(); }}
				>
					Read more &#9662;
				</a>
			)}

			{isExpanded && maxLength && content.length > maxLength && onToggleExpand && (
				<a
					href="#"
					className="vxfeed__read-more"
					onClick={(e) => { e.preventDefault(); onToggleExpand(); }}
				>
					Read less &#9652;
				</a>
			)}
		</>
	);
}

/**
 * Simple content renderer without truncation
 */
export function SimpleRichText({
	content,
	className = '',
}: {
	content: string;
	className?: string;
}): JSX.Element {
	const segments = useMemo(() => parseContent(content), [content]);

	return (
		<span className={className}>
			{segments.map((segment, index) =>
				renderSegment(segment, index, '/members/', '/search/', '_blank')
			)}
		</span>
	);
}

export default RichTextFormatter;
