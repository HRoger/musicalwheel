/**
 * Product Price Block - Entry Point
 *
 * Registers the block with WordPress.
 * Converted from Voxel Elementor widget using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { BlockConfiguration } from '@wordpress/blocks';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Register the block
registerBlockType(metadata.name as string, {
	...(metadata as unknown as BlockConfiguration<Record<string, unknown>>),
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
