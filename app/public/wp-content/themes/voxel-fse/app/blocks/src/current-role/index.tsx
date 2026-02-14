/**
 * Current Role Block - Entry Point
 *
 * Registers the Current Role block with WordPress.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';

/**
 * Register the block
 */
const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

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
	deprecated,
} as any);
