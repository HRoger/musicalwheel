/**
 * Current Role Block - Entry Point
 *
 * Registers the Current Role block with WordPress.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';

/**
 * Block icon - user role icon
 */
const blockIcon = (
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
	</svg>
);

/**
 * Register the block
 */
const deprecated = [
	{
		attributes: metadata.attributes,
		save: saveWithPlaceholder,
	},
];

registerBlockType(metadata.name, {
	icon: blockIcon,
	edit: Edit,
	save,
	deprecated,
});
