/**
 * Navbar Block - Entry Point
 *
 * Registers the Navbar block with WordPress.
 * FSE equivalent of Voxel's Navbar (VX) widget.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/navbar.php
 * - Widget name: ts-navbar
 * - Title: Navbar (VX)
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';

// Voxel Grid Icon component (standard for all VX blocks)
const VoxelGridIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="currentColor"
	>
		<rect x="4" y="4" width="4" height="4" rx="0.5" />
		<rect x="10" y="4" width="4" height="4" rx="0.5" />
		<rect x="16" y="4" width="4" height="4" rx="0.5" />
		<rect x="4" y="10" width="4" height="4" rx="0.5" />
		<rect x="10" y="10" width="4" height="4" rx="0.5" />
		<rect x="16" y="10" width="4" height="4" rx="0.5" />
		<rect x="4" y="16" width="4" height="4" rx="0.5" />
		<rect x="10" y="16" width="4" height="4" rx="0.5" />
		<rect x="16" y="16" width="4" height="4" rx="0.5" />
	</svg>
);

const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

// Register the block
(registerBlockType as any)(metadata.name, {
	...metadata,
	icon: VoxelGridIcon,
	edit: Edit,
	save,
	deprecated,
} as any);
