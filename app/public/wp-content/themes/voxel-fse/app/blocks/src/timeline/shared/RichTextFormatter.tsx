/**
 * RichTextFormatter Component
 *
 * Renders formatted text content with support for:
 * - @mentions (linked to profiles)
 * - #hashtags (linked to search)
 * - URLs (auto-linked)
 * - **bold**, *italic*, ~~strikethrough~~
 * - `inline code` and ```code blocks```
 *
 * Matches Voxel's timeline content rendering.
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
}

/**
 * Render a single content segment
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

		case 'mention':
			const mentionUrl = segment.metadata?.userId
				? `${mentionBaseUrl}?user_id=${segment.metadata.userId}`
				: `${mentionBaseUrl}?username=${encodeURIComponent(segment.content)}`;
			return (
				<a
					key={key}
					href={mentionUrl}
					className="vxf-mention"
					data-user-id={segment.metadata?.userId}
				>
					@{segment.content}
				</a>
			);

		case 'hashtag':
			const hashtagUrl = `${hashtagBaseUrl}?search=${encodeURIComponent('#' + segment.content)}`;
			return (
				<a
					key={key}
					href={hashtagUrl}
					className="vxf-hashtag"
				>
					#{segment.content}
				</a>
			);

		case 'link':
			// Format display URL (remove protocol, truncate if needed)
			const displayUrl = segment.content
				.replace(/^https?:\/\//, '')
				.replace(/\/$/, '');
			const truncatedUrl = displayUrl.length > 40
				? displayUrl.slice(0, 37) + '...'
				: displayUrl;

			return (
				<a
					key={key}
					href={segment.metadata?.url || segment.content}
					className="vxf-link"
					target={linkTarget}
					rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
				>
					{truncatedUrl}
				</a>
			);

		case 'code':
			// Check if multiline (code block)
			if (segment.content.includes('\n')) {
				return (
					<pre key={key} className="vxf-code-block">
						<code>{segment.content}</code>
					</pre>
				);
			}
			return (
				<code key={key} className="vxf-code-inline">
					{segment.content}
				</code>
			);

		case 'bold':
			return (
				<strong key={key} className="vxf-bold">
					{segment.content}
				</strong>
			);

		case 'italic':
			return (
				<em key={key} className="vxf-italic">
					{segment.content}
				</em>
			);

		case 'strikethrough':
			return (
				<del key={key} className="vxf-strikethrough">
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
		() => parseContent(displayContent),
		[displayContent]
	);

	return (
		<div className={`vxf-content ${className}`}>
			{segments.map((segment, index) =>
				renderSegment(segment, index, mentionBaseUrl, hashtagBaseUrl, linkTarget)
			)}

			{/* Read more / Read less toggle */}
			{isTruncated && !isExpanded && onToggleExpand && (
				<button
					type="button"
					className="vxf-content-toggle vxf-content-toggle--more"
					onClick={onToggleExpand}
				>
					Read more
				</button>
			)}

			{isExpanded && maxLength && content.length > maxLength && onToggleExpand && (
				<button
					type="button"
					className="vxf-content-toggle vxf-content-toggle--less"
					onClick={onToggleExpand}
				>
					Show less
				</button>
			)}
		</div>
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
