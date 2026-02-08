/**
 * VoxelLightbox Component
 *
 * Shared lightbox wrapper around yet-another-react-lightbox (YARL).
 * Replaces Elementor's built-in lightbox on FSE/Gutenberg pages where
 * Elementor's frontend JS is not loaded.
 *
 * Features:
 * - Full-screen dark overlay
 * - Image navigation (prev/next arrows, keyboard, swipe)
 * - Zoom (scroll wheel + pinch-to-zoom)
 * - Fullscreen toggle
 * - Close via X button, Esc key, or backdrop click
 *
 * @package VoxelFSE
 */

import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
// CSS is NOT imported here — it's built separately by `npm run build:yarl`
// and enqueued by WordPress via Block_Loader (mw-yarl-lightbox handle).
// This prevents Vite from extracting per-block CSS duplicates.
import type { VoxelLightboxProps } from './types';

export function VoxelLightbox({ open, close, slides, index = 0 }: VoxelLightboxProps): JSX.Element | null {
	if (!open) return null;

	return (
		<Lightbox
			open={open}
			close={close}
			slides={slides}
			index={index}
			plugins={[Zoom, Fullscreen]}
			animation={{ fade: 250 }}
			carousel={{ finite: false }}
			controller={{ closeOnBackdropClick: true }}
			zoom={{
				maxZoomPixelRatio: 3,
				scrollToZoom: true,
			}}
		/>
	);
}
