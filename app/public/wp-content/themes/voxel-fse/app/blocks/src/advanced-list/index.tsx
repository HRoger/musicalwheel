/**
 * Advanced List Block - Entry Point
 *
 * Registers the Advanced List (Actions VX) block with WordPress.
 * Converted from Voxel Elementor widget using Plan C+ architecture.
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
 * Register the Advanced List block
 * Merge advancedTabAttributes and voxelTabAttributes for AdvancedTab + VoxelTab support
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

