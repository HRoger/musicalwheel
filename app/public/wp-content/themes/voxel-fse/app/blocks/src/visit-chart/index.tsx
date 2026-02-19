/**
 * Visit Chart Block - Registration
 *
 * Registers the visit-chart block with WordPress.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import type { VisitChartAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';



const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

// Register the block
registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Visit Chart (VX)', 'voxel-fse'),
	description: __(
		'Displays a bar chart of Views and Unique Views for stats.',
		'voxel-fse'
	),
	edit: Edit,
	save,
	deprecated,
} as any);
