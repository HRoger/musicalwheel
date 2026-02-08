/**
 * Image Block - Frontend Entry Point
 *
 * Lightweight DOM script that intercepts clicks on image block
 * lightbox links and opens VoxelLightbox.
 *
 * The image block uses a static save (save.tsx) — no vxconfig or React hydration.
 * The <a data-elementor-open-lightbox> is already in the saved HTML.
 * This script just binds click handlers to open the shared VoxelLightbox.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/image.php (extends Elementor)
 * - Elementor: elementor/includes/widgets/image.php (Widget_Image)
 * - Lightbox: Voxel uses data-elementor-open-lightbox for Elementor's lightbox
 *
 * @package VoxelFSE
 */

/**
 * Global VoxelLightbox API (provided by assets/dist/yarl-lightbox.js)
 */
interface VoxelLightboxAPI {
	open: (slides: Array<{ src: string; alt?: string }>, index?: number) => void;
	close: () => void;
}

/**
 * Initialize Image block lightbox on the page.
 *
 * Finds all <a data-elementor-open-lightbox> inside .voxel-fse-image blocks
 * and attaches click handlers to open VoxelLightbox.
 */
function initImageLightbox() {
	const lightboxLinks = document.querySelectorAll<HTMLAnchorElement>(
		'.voxel-fse-image a[data-elementor-open-lightbox]:not([data-vx-lightbox])'
	);

	lightboxLinks.forEach((link) => {
		// Mark as initialized to prevent double binding
		link.dataset.vxLightbox = 'true';

		link.addEventListener('click', (e) => {
			e.preventDefault();
			const lightbox = (window as unknown as { VoxelLightbox?: VoxelLightboxAPI }).VoxelLightbox;
			if (lightbox) {
				const img = link.querySelector('img');
				const src = link.href;
				const alt = img?.alt || '';
				lightbox.open([{ src, alt }], 0);
			}
		});
	});
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initImageLightbox);
} else {
	initImageLightbox();
}

// Also initialize on Turbo/PJAX page loads and Voxel AJAX updates
window.addEventListener('turbo:load', initImageLightbox);
window.addEventListener('pjax:complete', initImageLightbox);
document.addEventListener('voxel:markup-update', initImageLightbox);
