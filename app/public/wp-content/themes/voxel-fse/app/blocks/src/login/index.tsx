/**
 * Login/Register Block - Registration
 *
 * Registers the login block with WordPress.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
// import type { LoginAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';



// Register the block
registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Login / Register (VX)', 'voxel-fse'),
	description: __(
		'A login and registration form with multiple screens for user authentication.',
		'voxel-fse'
	),
	edit: Edit,
	save,
} as Parameters<typeof registerBlockType>[1]);
