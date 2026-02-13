/**
 * Orders Block - Entry Point
 *
 * Registers the Orders block with WordPress using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

import type { BlockConfiguration } from '@wordpress/blocks';
import type { OrdersBlockAttributes } from './types';

// Type assertion for block.json metadata
const blockMetadata = metadata as unknown as BlockConfiguration<OrdersBlockAttributes>;

const deprecated = [
	{
		attributes: blockMetadata.attributes,
		save: saveWithPlaceholder,
	},
];

registerBlockType<OrdersBlockAttributes>(blockMetadata.name, {
	...blockMetadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
