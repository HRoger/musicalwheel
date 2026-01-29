/**
 * QuotedStatus Component
 *
 * Displays a quoted status within another status.
 * Simplified view of the original status.
 *
 * CSS Classes:
 * - .vxf-quoted - Main container
 * - .vxf-quoted--head - Publisher info
 * - .vxf-quoted--body - Content
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import { SimpleRichText } from './RichTextFormatter';
import { formatRelativeTime, truncateText } from '../utils';
import type { Status } from '../types';

/**
 * Props
 */
interface QuotedStatusProps {
	status: Status;
	truncateAt?: number;
	className?: string;
}

/**
 * QuotedStatus Component
 */
export function QuotedStatus({
	status,
	truncateAt = 140,
	className = '',
}: QuotedStatusProps): JSX.Element {
	// Get publisher info
	const publisher = status.publisher;
	const avatarUrl = publisher.avatar_url ?? '';
	const displayName = publisher.display_name ?? '';
	const profileUrl = publisher.link ?? '#';

	// Format timestamp
	const timestamp = useMemo(
		() => formatRelativeTime(status.created_at),
		[status.created_at]
	);

	// Truncate content
	const truncatedContent = useMemo(() => {
		if (!status.content) return '';
		return truncateText(status.content, truncateAt);
	}, [status.content, truncateAt]);

	// Check if status is private/unavailable
	if (status.private) {
		return (
			<div className={`vxf-quoted vxf-quoted--unavailable ${className}`}>
				<div className="vxf-quoted--body">
					<p className="vxf-quoted-unavailable">
						This content is no longer available
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={`vxf-quoted ${className}`}>
			{/* Head - Publisher Info */}
			<div className="vxf-quoted--head">
				<a href={profileUrl} className="vxf-quoted-avatar">
					{avatarUrl ? (
						<img src={avatarUrl} alt={displayName} />
					) : (
						<span className="vxf-avatar-initials">
							{displayName.charAt(0).toUpperCase()}
						</span>
					)}
				</a>
				<div className="vxf-quoted-publisher">
					<a href={profileUrl} className="vxf-quoted-name">
						{displayName}
					</a>
					<span className="vxf-quoted-timestamp">
						{timestamp}
					</span>
				</div>
			</div>

			{/* Body - Content */}
			<div className="vxf-quoted--body">
				{status.content && (
					<div className="vxf-quoted-content">
						<SimpleRichText content={truncatedContent} />
					</div>
				)}

				{/* Show single preview image if available */}
				{status.files && status.files.length > 0 && status.files[0].type === 'image' && (
					<div className="vxf-quoted-image">
						<img
							src={status.files[0].thumbnail_url || status.files[0].url}
							alt=""
							loading="lazy"
						/>
						{status.files.length > 1 && (
							<span className="vxf-quoted-image-more">
								+{status.files.length - 1}
							</span>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default QuotedStatus;
