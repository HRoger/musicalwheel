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
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import type { BlockConfiguration } from '@wordpress/blocks';
import VoxelGridIcon from '@shared/VoxelGridIcon';

const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

// Register the block
registerBlockType(metadata.name as string, {
	...(metadata as unknown as BlockConfiguration<Record<string, unknown>>),
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
