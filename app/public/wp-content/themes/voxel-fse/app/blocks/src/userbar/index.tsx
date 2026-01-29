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
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Register the block
registerBlockType(metadata.name as 'voxel-fse/userbar', {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
