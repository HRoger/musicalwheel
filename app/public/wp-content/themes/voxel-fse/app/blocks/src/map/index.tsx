/**
 * Map (VX) Block - Entry Point
 *
 * Registers the Map block following Plan C+ architecture.
 * NO PHP rendering - uses vxconfig JSON + React hydration.
 */

import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import Edit from './edit';
import save from './save';
import type { MapAttributes } from './types';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';

/**
 * Map icon SVG
 */
const MapIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="24"
		height="24"
		fill="currentColor"
	>
		<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
	</svg>
);

/**
 * Register the Map block
 * Merge voxelTabAttributes and advancedTabAttributes for visibility/loop support
 */
registerBlockType<MapAttributes>(metadata.name, {
	...metadata,
	attributes: {
		...metadata.attributes,
		...advancedTabAttributes,
		...voxelTabAttributes,
	},
	icon: MapIcon,
	edit: Edit,
	save,
} as Parameters<typeof registerBlockType<MapAttributes>>[1]);
