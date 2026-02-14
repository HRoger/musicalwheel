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
 * Lightbox: Uses the shared window.VoxelLightbox global API (YARL-based).
 * Loaded once via WordPress dependency system (mw-yarl-lightbox handle),
 * same pattern as Voxel's Swiper.
 * The data-elementor-open-lightbox attributes are kept for HTML parity only.
 *
 * @package VoxelFSE
 */

import React, { useCallback, useMemo } from 'react';
import type { MediaFile, IconValue } from '../types';

/**
 * Global VoxelLightbox API (provided by assets/dist/yarl-lightbox.js)
 */
interface VoxelLightboxAPI {
	open: (slides: Array<{ src: string; alt?: string }>, index?: number) => void;
	close: () => void;
}

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
	const slides = useMemo(
		() => files.map((file) => ({
			src: file.url,
			alt: file.alt || '',
		})),
		[files]
	);

	const handleImageClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
			e.preventDefault();
			const lightbox = (window as unknown as { VoxelLightbox?: VoxelLightboxAPI }).VoxelLightbox;
			if (lightbox) {
				lightbox.open(slides, index);
			}
		},
		[slides]
	);

	if (files.length === 0) {
		return null;
	}

	const slideshowId = statusId && files.length > 1 ? `vxtl_${statusId}` : null;

	return (
		<ul className={`vxf-gallery simplify-ul ${className}`}>
			{files.map((file, index) => (
				<li key={file.id || index}>
					<a
						href={file.url}
						data-elementor-open-lightbox="yes"
						data-elementor-lightbox-slideshow={slideshowId}
						onClick={(e) => handleImageClick(e, index)}
					>
						<img
							src={file.preview || file.url}
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
