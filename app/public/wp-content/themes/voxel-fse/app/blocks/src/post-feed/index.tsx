/**
 * Post Feed Block - Entry Point
 *
 * Registers the Post Feed block with WordPress.
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
 * Register the Post Feed block
 * Merge voxelTabAttributes and advancedTabAttributes for Advanced/Voxel tab support
 */
const deprecated = [
	{
		attributes: {
			...metadata.attributes,
			...advancedTabAttributes,
			...voxelTabAttributes,
		},
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
} as Parameters<typeof registerBlockType>[1]);
