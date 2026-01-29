/**
 * MediaGallery Component
 *
 * Displays media files (images) attached to a status.
 * Matches Voxel's timeline gallery HTML structure EXACTLY.
 *
 * Voxel HTML Structure (from templates/widgets/timeline/status/status.php):
 * <ul class="vxf-gallery simplify-ul">
 *   <li>
 *     <a href="..." data-elementor-open-lightbox="yes" data-elementor-lightbox-slideshow="vxtl_123">
 *       <img src="..." alt="">
 *     </a>
 *   </li>
 * </ul>
 *
 * @package VoxelFSE
 */

import type { MediaFile, IconValue } from '../types';

/**
 * Props
 */
interface MediaGalleryProps {
	files: MediaFile[];
	galleryIcon?: IconValue | null;
	statusId?: number;
	className?: string;
}

/**
 * MediaGallery Component
 * Matches Voxel's vxf-gallery simplify-ul structure exactly
 */
export function MediaGallery({
	files,
	galleryIcon,
	statusId,
	className = '',
}: MediaGalleryProps): JSX.Element | null {
	// Filter to only images
	const images = files.filter((f) => f.type === 'image' || f.mime_type?.startsWith('image/'));

	if (images.length === 0) {
		return null;
	}

	// Generate slideshow ID for lightbox grouping (matches Voxel's vxtl_123 format)
	const slideshowId = statusId && images.length > 1 ? `vxtl_${statusId}` : null;

	return (
		<ul className={`vxf-gallery simplify-ul ${className}`}>
			{images.map((file, index) => (
				<li key={file.id || index}>
					<a
						href={file.url}
						data-elementor-open-lightbox="yes"
						data-elementor-lightbox-slideshow={slideshowId}
					>
						<img
							src={file.preview ?? file.thumbnail_url ?? file.url}
							alt={file.alt || ''}
							loading="lazy"
						/>
					</a>
				</li>
			))}
		</ul>
	);
}

export default MediaGallery;
