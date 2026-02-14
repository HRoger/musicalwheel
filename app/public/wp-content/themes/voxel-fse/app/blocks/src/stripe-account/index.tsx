/**
 * Stripe Account Block - Entry Point
 *
 * Plan C+ architecture - headless-ready, no PHP rendering
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import metadata from './block.json';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import VoxelGridIcon from '@shared/VoxelGridIcon';

/**
 * Register block type
 */
const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
});
