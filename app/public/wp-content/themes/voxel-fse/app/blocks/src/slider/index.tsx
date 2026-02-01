/**
 * Slider Block - Entry Point
 *
 * Registers the Slider (VX) block with WordPress.
 * Converted from Voxel Elementor widget: themes/voxel/app/widgets/slider.php
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { SliderBlockAttributes } from './types';

// Import editor styles


/**
 * Slider block icon - gallery/carousel representation
 */
const icon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="currentColor"
	>
		<path d="M2 6h4v12H2V6zm6-2h8v16H8V4zm10 2h4v12h-4V6z" />
	</svg>
);

/**
 * Register the Slider block
 */
registerBlockType(metadata.name, {
	...metadata,
	icon,
	edit: Edit,
	save,
} as any);
