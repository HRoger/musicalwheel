/**
 * Countdown Block
 *
 * Registers the countdown block with WordPress
 */
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Register block
registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
