/**
 * Messages Block - Entry Point
 *
 * Registers the Messages block with WordPress.
 * FSE equivalent of Voxel's Messages (VX) widget.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Register the block
registerBlockType(metadata.name as 'voxel-fse/messages', {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
