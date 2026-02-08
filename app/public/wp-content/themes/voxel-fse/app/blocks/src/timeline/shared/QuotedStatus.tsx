/**
 * QuotedStatus Component
 *
 * Displays a quoted status within another status.
 * Matches Voxel's _quoted-status.php template EXACTLY.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status/_quoted-status.php):
 * <a :href="quoteOf.link">
 *   <div class="vxf-post vxf__quoted-post">
 *     <div class="vxf-head flexify">
 *       <a class="vxf-avatar flexify"><img></a>
 *       <div class="vxf-user flexify">
 *         <a>display_name <div class="vxf-icon vxf-verified"></div></a>
 *         <span>{{ titleDetails }}</span>
 *       </div>
 *     </div>
 *     <div class="vxf-body">
 *       <div class="vxf-body-text" v-html="truncatedContent.content"></div>
 *       <ul class="vxf-gallery simplify-ul">...</ul>
 *     </div>
 *   </div>
 * </a>
 *
 * titleDetails computed: [@username, post.title, created_at].join(' · ')
 * created_at is PRE-FORMATTED by Voxel API (e.g. "1h", "2d", "now")
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import { SimpleRichText } from './RichTextFormatter';
import { truncateText } from '../utils';
import { useTimelineConfig } from '../hooks';
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
 * Matches Voxel's vxf-post vxf__quoted-post structure exactly
 */
export function QuotedStatus({
	status,
	truncateAt = 140,
	className = '',
}: QuotedStatusProps): JSX.Element | null {
	const { config } = useTimelineConfig();
	const publisher = status.publisher;

	// Build titleDetails: @username · Post Title · timestamp
	// Matches Voxel's computed titleDetails (timeline-main.js)
	const titleDetails = useMemo(() => {
		const parts: string[] = [];
		if (publisher?.username) {
			parts.push(`@${publisher.username}`);
		}
		if (status.post?.title) {
			parts.push(status.post.title);
		}
		// created_at is pre-formatted by Voxel API (e.g. "1h", "2d")
		if (status.created_at) {
			parts.push(status.created_at);
		}
		return parts.join(' · ');
	}, [publisher?.username, status.post?.title, status.created_at]);

	// Truncate content
	const truncatedContent = useMemo(() => {
		if (!status.content) return '';
		return truncateText(status.content, truncateAt);
	}, [status.content, truncateAt]);

	// Unavailable/private state - matches Voxel's v-else template
	if (!publisher || status.private) {
		return (
			<div className={`vxf-post vxf__quoted-post vx-inert ${className}`}>
				<div className="vxf-body-text" style={{ opacity: 0.5 }}>
					{status.private
						? 'This post has restricted visibility.'
						: 'This post is unavailable.'}
				</div>
			</div>
		);
	}

	const avatarUrl = publisher.avatar_url ?? '';
	const displayName = publisher.display_name ?? '';
	const profileUrl = publisher.link ?? '#';
	const statusLink = status.link ?? '#';

	return (
		<a href={statusLink} className={className}>
			<div className="vxf-post vxf__quoted-post">
				{/* Head - matches Voxel's vxf-head flexify */}
				<div className="vxf-head flexify">
					<a href={profileUrl} className="vxf-avatar flexify">
						<img src={avatarUrl} alt={displayName} />
					</a>
					<div className="vxf-user flexify">
						<a href={profileUrl}>
							{displayName}
							{publisher.is_verified && (
								<div
									className="vxf-icon vxf-verified"
									dangerouslySetInnerHTML={{ __html: (config?.icons as any)?.verified ?? '' }}
								/>
							)}
						</a>
						<span>{titleDetails}</span>
					</div>
				</div>

				{/* Body */}
				<div className="vxf-body">
					{/* Review score - matches Voxel's rev-score display */}
					{status.review && status.review.level && (
						<div className="rev-score" style={{ '--ts-accent-1': status.review.level.color } as React.CSSProperties}>
							<div className="rev-num-score flexify">
								{status.review.formatted_score}
							</div>
							<span>{status.review.level.label}</span>
						</div>
					)}

					{/* Text content */}
					{status.content && (
						<div className="vxf-body-text">
							<SimpleRichText content={truncatedContent} />
						</div>
					)}

					{/* Gallery - matches Voxel's vxf-gallery simplify-ul */}
					{status.files && status.files.length > 0 && (
						<ul className="vxf-gallery simplify-ul">
							{status.files.map((file, index) => (
								<li key={file.id || index}>
									<a href={file.url}>
										<img src={file.preview || file.url} alt={file.alt || ''} />
									</a>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</a>
	);
}

export default QuotedStatus;
