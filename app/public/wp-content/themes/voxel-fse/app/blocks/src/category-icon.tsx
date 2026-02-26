/**
 * Voxel FSE Block Category Icon
 *
 * Updates all voxel-fse block categories with the Voxel logo SVG icon,
 * styled with a gradient fill. Mirrors the NectarBlocks pattern of using
 * wp.blocks.updateCategory() + CSS :has() for category header styling.
 *
 * @package VoxelFSE
 */

import * as WpBlocks from '@wordpress/blocks';
const updateCategory = (WpBlocks as any).updateCategory as (slug: string, settings: Record<string, unknown>) => void;
import './category-icon.css';

/**
 * Voxel logo SVG with gradient-compatible class.
 * The gradient fill is applied via CSS using fill: url(#voxel-fse-icon-gradient).
 */
const VoxelCategoryIcon = () => (
	<svg
		className="voxel-fse-category-icon"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 206.34 206.34"
		width="24"
		height="24"
	>
		<polygon points="114.63 91.71 114.63 137.56 22.93 45.85 45.85 22.93 22.93 22.93 0 45.85 0 114.63 91.71 206.34 114.63 206.34 114.63 160.49 137.56 160.49 206.34 91.71 206.34 22.93 183.41 22.93 114.63 91.71" />
		<polygon points="160.49 0 68.78 0 45.85 22.93 183.41 22.93 160.49 0" />
	</svg>
);

/**
 * All voxel-fse category slugs that should get the branded icon.
 */
const voxelCategories = [
	'voxel-fse',
	'voxel-fse-forms',
	'voxel-fse-social',
	'voxel-fse-commerce',
	'voxel-fse-users',
	'voxel-fse-content',
	'voxel-fse-layout',
	'voxel-fse-location',
];

voxelCategories.forEach((slug) => {
	updateCategory(slug, { icon: VoxelCategoryIcon });
});
