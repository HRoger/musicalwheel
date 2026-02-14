/**
 * Gallery Block - Entry Point
 *
 * Registers the Gallery block with WordPress.
 * Converted from Voxel Gallery widget.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/gallery.php
 * - Template: themes/voxel/templates/widgets/gallery.php
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

/**
 * Register the Gallery block
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
} as Parameters<typeof registerBlockType>[1]);
