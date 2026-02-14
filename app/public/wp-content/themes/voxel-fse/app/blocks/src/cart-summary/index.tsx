/**
 * Cart Summary Block - Entry Point
 *
 * Registers the Cart Summary block with WordPress using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';

import type { BlockConfiguration } from '@wordpress/blocks';
import type { CartSummaryBlockAttributes } from './types';

// Type assertion for block.json metadata
const blockMetadata = metadata as unknown as BlockConfiguration<CartSummaryBlockAttributes>;

const deprecated = [
	{
		attributes: {
			...blockMetadata.attributes,
			...advancedTabAttributes,
			...voxelTabAttributes,
		},
		save: saveWithPlaceholder,
	},
];

registerBlockType<CartSummaryBlockAttributes>(blockMetadata.name, {
	...blockMetadata,
	attributes: {
		...blockMetadata.attributes,
		...advancedTabAttributes,
		...voxelTabAttributes,
	},
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
