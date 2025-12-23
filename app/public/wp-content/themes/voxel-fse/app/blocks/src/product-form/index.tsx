/**
 * Product Form Block - Registration
 *
 * Registers the product-form block with WordPress.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/product-form.php
 * - Template: themes/voxel/templates/widgets/product-form.php
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import type { ProductFormAttributes } from './types';
import VoxelGridIcon from '@shared/VoxelGridIcon';

import './editor.css';

// Register the block
registerBlockType<ProductFormAttributes>(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	title: __('Product Form (VX)', 'voxel-fse'),
	description: __(
		'A product purchase form with dynamic fields, cart integration, and price calculator.',
		'voxel-fse'
	),
	edit: Edit,
	save,
} as Parameters<typeof registerBlockType<ProductFormAttributes>>[1]);
