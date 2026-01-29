/**
 * Membership Plans Block - Entry Point
 *
 * Registers the Membership Plans block with WordPress.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import { VoxelGridIcon } from '@shared/VoxelGridIcon';

/**
 * Register the block
 */
registerBlockType(metadata.name, {
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
