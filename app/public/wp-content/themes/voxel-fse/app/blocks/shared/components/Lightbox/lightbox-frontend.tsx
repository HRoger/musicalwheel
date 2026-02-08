/**
 * VoxelLightbox — Standalone Frontend Entry (IIFE)
 *
 * Built as a self-contained IIFE script that mounts a single React-powered
 * lightbox instance into the page and exposes an imperative global API.
 *
 * Pattern: Mirrors how Voxel uses Swiper — registered ONCE as a WordPress
 * script dependency, shared by every block that needs lightbox capability
 * (timeline, gallery, slider, image).
 *
 * WordPress handle: mw-yarl-lightbox
 * Depends on: react, react-dom (WordPress globals)
 * Global API: window.VoxelLightbox.open(slides, index) / .close()
 *
 * @package VoxelFSE
 */

import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';

/**
 * Slide format expected by the global API
 */
interface LightboxSlide {
	src: string;
	alt?: string;
	title?: string;
	description?: string;
}

/**
 * Global API shape exposed on window.VoxelLightbox
 */
interface VoxelLightboxAPI {
	open: (slides: LightboxSlide[], index?: number) => void;
	close: () => void;
}

// Module-scoped state setters — populated by LightboxRoot on mount
let _setOpen: ((v: boolean) => void) | null = null;
let _setSlides: ((v: LightboxSlide[]) => void) | null = null;
let _setIndex: ((v: number) => void) | null = null;

/**
 * LightboxRoot — Single React component that renders the YARL lightbox.
 * Mounted once into a portal container appended to document.body.
 */
function LightboxRoot(): JSX.Element | null {
	const [open, setOpen] = useState(false);
	const [slides, setSlides] = useState<LightboxSlide[]>([]);
	const [index, setIndex] = useState(0);

	// Expose state setters to the imperative API
	_setOpen = setOpen;
	_setSlides = setSlides;
	_setIndex = setIndex;

	if (!open) return null;

	return (
		<Lightbox
			open={open}
			close={() => setOpen(false)}
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

/**
 * Mount the lightbox root into a dedicated container.
 * Safe to call multiple times — skips if already mounted.
 */
function mount(): void {
	if (document.getElementById('voxel-lightbox-root')) return;

	const container = document.createElement('div');
	container.id = 'voxel-lightbox-root';
	document.body.appendChild(container);

	createRoot(container).render(<LightboxRoot />);
}

/**
 * Expose the global imperative API on window.VoxelLightbox
 */
const api: VoxelLightboxAPI = {
	open(slides: LightboxSlide[], index = 0): void {
		// Mount on first use (deferred mounting)
		if (!_setOpen) {
			mount();
			// setters are assigned synchronously during render
			// but createRoot().render() is async in React 18
			// so we queue the open call
			requestAnimationFrame(() => {
				if (_setSlides && _setIndex && _setOpen) {
					_setSlides(slides);
					_setIndex(index);
					_setOpen(true);
				}
			});
			return;
		}
		_setSlides!(slides);
		_setIndex!(index);
		_setOpen!(true);
	},
	close(): void {
		if (_setOpen) {
			_setOpen(false);
		}
	},
};

// Assign to window
(window as unknown as { VoxelLightbox: VoxelLightboxAPI }).VoxelLightbox = api;

// Mount immediately so the component is ready for first open() call
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mount, { once: true });
} else {
	mount();
}
