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
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import type { SliderBlockAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

/**
 * Register the Slider block
 */
const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
} as any);
