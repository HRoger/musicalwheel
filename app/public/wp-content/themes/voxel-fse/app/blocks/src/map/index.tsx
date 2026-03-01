/**
 * Map (VX) Block - Entry Point
 *
 * Registers the Map block following Plan C+ architecture.
 * NO PHP rendering - uses vxconfig JSON + React hydration.
 */

import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';
import VoxelGridIcon from '@shared/VoxelGridIcon';

/**
 * Register the Map block
 * Merge voxelTabAttributes and advancedTabAttributes for visibility/loop support
 */
const deprecated = [
	{
		attributes: {
			...metadata.attributes,
			...advancedTabAttributes,
			...voxelTabAttributes,
		},
		save: saveWithPlaceholder,
	},
];

(registerBlockType as any)(metadata.name, {
	...metadata,
	attributes: {
		...metadata.attributes,
		...advancedTabAttributes,
		...voxelTabAttributes,
	},
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
} as any);
