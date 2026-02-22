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

// Type assertion for block.json metadata
const blockMetadata = metadata as any;

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

registerBlockType(blockMetadata.name, {
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
