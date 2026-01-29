/**
 * Timeline Kit Block - Entry Point
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/timeline-kit.php
 * - Styling-only widget for Timeline/Social Feed components
 */

import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// @ts-ignore - block.json metadata types
registerBlockType(metadata.name, {
	// @ts-ignore
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
