/**
 * Image Block - Entry Point
 *
 * Registers the Image block with WordPress.
 * Converted from Voxel Image widget (extends Elementor Widget_Image).
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';


/**
 * Register the Image block
 * Merge voxelTabAttributes and advancedTabAttributes for visibility/loop support
 */
registerBlockType(metadata.name, {
	...metadata,
	attributes: {
		...metadata.attributes,
		...advancedTabAttributes,
		...voxelTabAttributes,
	},
	icon: VoxelGridIcon,
	edit: Edit,
	save,
} as any);
