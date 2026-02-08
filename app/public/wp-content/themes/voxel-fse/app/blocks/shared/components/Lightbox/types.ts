/**
 * Shared Lightbox Types
 *
 * Used by VoxelLightbox and any block that needs lightbox functionality.
 *
 * @package VoxelFSE
 */

export interface LightboxSlide {
	src: string;
	alt?: string;
	title?: string;
	description?: string;
}

export interface VoxelLightboxProps {
	open: boolean;
	close: () => void;
	slides: LightboxSlide[];
	index?: number;
}
