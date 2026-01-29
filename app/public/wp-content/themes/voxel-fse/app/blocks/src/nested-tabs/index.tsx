/**
 * Nested Tabs Block - Registration
 *
 * FSE equivalent of Voxel's nested-tabs widget
 * (extends Elementor's NestedTabs with Voxel enhancements)
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
			tabs: [
				{ id: 'example-1', title: __('Overview', 'voxel-fse'), cssId: '', icon: null, iconActive: null },
				{ id: 'example-2', title: __('Features', 'voxel-fse'), cssId: '', icon: null, iconActive: null },
				{ id: 'example-3', title: __('Details', 'voxel-fse'), cssId: '', icon: null, iconActive: null },
			],
			tabsDirection: { desktop: 'block-start' },
			tabsJustifyHorizontal: { desktop: 'start' },
		},
	},
});
