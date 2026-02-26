/**
 * Product Price Block - Entry Point
 *
 * Registers the block with WordPress.
 * Converted from Voxel Elementor widget using Plan C+ architecture.
 *
 * save() returns null — render.php handles all server-side output.
 * Deprecated entries preserve old save functions for migration.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { deprecatedSaveV1, deprecatedSaveWithPlaceholder } from './save';
import metadata from './block.json';
import type { BlockConfiguration } from '@wordpress/blocks';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Deprecated save functions (newest first) — WordPress tries each in order
// until one matches the saved HTML in the database, then migrates silently.
const deprecated = [
	{
		// v1: save without placeholder (most recent before null-save)
		attributes: metadata.attributes,
		save: deprecatedSaveV1,
	},
	{
		// v0: save with placeholder (earliest version)
		attributes: metadata.attributes,
		save: deprecatedSaveWithPlaceholder,
	},
];

// Register the block
registerBlockType(metadata.name as string, {
	...(metadata as unknown as BlockConfiguration<Record<string, unknown>>),
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
