/**
 * LinkPreview Component
 *
 * Displays link preview card for URLs in status content.
 * Matches Voxel's timeline link preview HTML structure EXACTLY.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status/status.php):
 * YouTube:
 * <div class="vxf-youtube-embed">
 *   <iframe ...></iframe>
 * </div>
 *
 * Regular Link:
 * <a href="..." class="vxf-link flexify">
 *   <img src="...">
 *   <div class="vxf-link-details flexify">
 *     <b>Title</b>
 *     <span class="vxf-icon vxf-link-source">
 *       domain.com
 *       <icon-external-link/>
 *     </span>
 *   </div>
 * </a>
 *
 * @package VoxelFSE
 */

import type { LinkPreview as LinkPreviewType, IconValue } from '../types';
import { useTimelineConfig } from '../hooks';

/**
 * Props
 */
interface LinkPreviewProps {
	preview: LinkPreviewType;
	externalIcon?: IconValue | null;
	className?: string;
}

/**
 * LinkPreview Component
 * Matches Voxel's vxf-link flexify structure exactly
 */
export function LinkPreview({
	preview,
	externalIcon,
	className = '',
}: LinkPreviewProps): JSX.Element {
	const { config } = useTimelineConfig();

	// YouTube Embed - matches Voxel's vxf-youtube-embed
	if (preview.type === 'youtube' && preview.embed_url && preview.video_id) {
		return (
			<div className={`vxf-youtube-embed ${className}`}>
				<iframe
					src={`${preview.embed_url}?rel=0&modestbranding=1&showinfo=0&controls=1&disablekb=1&iv_load_policy=3&fs=1&autoplay=0&mute=0&loop=0&playlist=${preview.video_id}`}
					frameBorder={0}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
					loading="lazy"
					className="vxf-youtube-iframe"
				/>
			</div>
		);
	}

	// Regular Link Preview - matches Voxel's vxf-link flexify structure
	return (
		<a
			href={preview.url}
			target="_blank"
			rel="noopener noreferrer nofollow"
			className={`vxf-link flexify ${className}`}
		>
			{/* Preview Image */}
			{preview.image && (
				<img src={preview.image} alt="" loading="lazy" />
			)}

			{/* Link Details */}
			<div className="vxf-link-details flexify">
				{/* Title */}
				<b>{preview.title}</b>

				{/* Domain with external link icon */}
				<span className="vxf-icon vxf-link-source">
					{preview.domain}
					<span dangerouslySetInnerHTML={{ __html: config?.icons?.['external-link'] ?? '' }} />
				</span>
			</div>
		</a>
	);
}

export default LinkPreview;
