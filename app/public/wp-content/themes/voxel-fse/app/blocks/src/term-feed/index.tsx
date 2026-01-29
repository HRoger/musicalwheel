/**
 * Term Feed Block - Entry Point
 *
 * Registers the Term Feed block for the Gutenberg editor.
 * FSE equivalent of Voxel's Term Feed widget.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/term-feed.php
 * - Template: themes/voxel/templates/widgets/term-feed.php
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save from './save';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Register the block
registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
});
