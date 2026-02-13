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
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import { VoxelGridIcon } from '@shared/VoxelGridIcon';

/**
 * Register the block
 *
 * Deprecated entries handle save output changes (e.g., CSS additions).
 * When styles.ts changes the generated CSS, old saved blocks won't match
 * the current save() output. These entries ensure smooth migration.
 */
const deprecated = [
	// v2: Current save format (without placeholder) — handles CSS changes
	// isValid forces Gutenberg to accept old save HTML without degrading to core/html
	{
		attributes: metadata.attributes,
		save,
		isValid: () => true,
	},
	// v1: Old save with placeholder
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
		isValid: () => true,
	},
];

registerBlockType(metadata.name, {
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
