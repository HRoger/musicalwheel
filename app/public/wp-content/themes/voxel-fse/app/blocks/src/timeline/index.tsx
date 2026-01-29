/**
 * Timeline Block - Entry Point
 *
 * Registers the Timeline block with WordPress.
 * Converted from Voxel Timeline widget.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { TimelineAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Import editor styles
import './editor.css';

/**
 * Register the Timeline block
 */
registerBlockType<TimelineAttributes>(metadata.name, {
	...(metadata as Omit<typeof metadata, 'name'>),
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
