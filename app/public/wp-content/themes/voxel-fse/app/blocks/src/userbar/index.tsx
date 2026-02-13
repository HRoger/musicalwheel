/**
 * Userbar Block - Entry Point
 *
 * Registers the Userbar block with WordPress.
 * FSE equivalent of Voxel's User bar widget.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

// Register the block
registerBlockType(metadata.name as 'voxel-fse/userbar', {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
