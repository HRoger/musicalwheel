/**
 * Nested Accordion Block - Registration
 *
 * FSE equivalent of Voxel's nested-accordion widget
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';

// Register the block
registerBlockType(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	// Example patterns for quick insertion
	example: {
		attributes: {
			items: [
				{ id: 'example-1', title: __('What is this?', 'voxel-fse'), cssId: '' },
				{ id: 'example-2', title: __('How does it work?', 'voxel-fse'), cssId: '' },
				{ id: 'example-3', title: __('Learn more', 'voxel-fse'), cssId: '' },
			],
			defaultState: 'expanded',
			faqSchema: true,
		},
	},
});
