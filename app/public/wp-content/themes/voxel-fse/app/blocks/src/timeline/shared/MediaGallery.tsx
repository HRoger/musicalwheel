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
 * Lightbox: On FSE pages Elementor's frontend JS is not loaded, so we use
 * yet-another-react-lightbox (YARL) via the shared VoxelLightbox component.
 * The data-elementor-open-lightbox attributes are kept for HTML parity only.
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, lazy, Suspense } from 'react';
import type { MediaFile, IconValue } from '../types';
import type { LightboxSlide } from '@shared/components';

// Lazy-load YARL lightbox: prevents yet-another-react-lightbox from being
// bundled into the editor's ESM entry, where it crashes during init.
// In the IIFE frontend build Vite inlines the dynamic import automatically.
const LazyVoxelLightbox = lazy(() =>
	import('@shared/components/Lightbox/VoxelLightbox').then((m) => ({
		default: m.VoxelLightbox,
	}))
);

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
	// Hooks must be called unconditionally (before any early returns)
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);

	const slides: LightboxSlide[] = useMemo(
		() => files.map((file) => ({
			src: file.url,
			alt: file.alt || '',
		})),
		[files]
	);

	const handleImageClick = useCallback(
		(e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
			e.preventDefault();
			setLightboxIndex(index);
			setLightboxOpen(true);
		},
		[]
	);

	if (files.length === 0) {
		return null;
	}

	const slideshowId = statusId && files.length > 1 ? `vxtl_${statusId}` : null;

	return (
		<>
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

			{lightboxOpen && (
				<Suspense fallback={null}>
					<LazyVoxelLightbox
						open={lightboxOpen}
						close={() => setLightboxOpen(false)}
						slides={slides}
						index={lightboxIndex}
					/>
				</Suspense>
			)}
		</>
	);
}

export default MediaGallery;
