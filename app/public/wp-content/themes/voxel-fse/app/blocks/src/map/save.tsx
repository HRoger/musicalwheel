/**
 * Map (VX) Block - Save Function
 *
 * Outputs vxconfig JSON + placeholder HTML for frontend hydration.
 * NO PHP rendering - Plan C+ architecture.
 */

import { useBlockProps } from '@wordpress/block-editor';
import {
	getAdvancedVoxelTabProps,
	renderBackgroundElements,
} from '../../shared/utils';

import type { MapSaveProps } from './types';
import { buildVxConfig } from './utils';
import { generateMapResponsiveCSS } from './styles';



/**
 * Save function - outputs static HTML with vxconfig
 */
export default function save({ attributes }: MapSaveProps) {
	const blockId = attributes.blockId || 'map';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	// This handles: styles, className, responsiveCSS, customAttrs, elementId
	// IMPORTANT: Include 'elementor-widget-ts-map' class for Voxel CSS selector compatibility
	// The Voxel parent theme uses `.elementor-widget-ts-map:has(.gm-control-active) .vx-geolocate-me { display: flex; }`
	// to show the geolocate button when the map is loaded
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-map ts-map-widget elementor-widget-ts-map',
		selectorPrefix: 'voxel-fse-map',
	});

	// Generate map-specific responsive CSS
	const mapResponsiveCSS = generateMapResponsiveCSS(attributes, blockId);

	// Combine all responsive CSS
	const combinedResponsiveCSS = [advancedProps.responsiveCSS, mapResponsiveCSS]
		.filter(Boolean)
		.join('\n');

	const blockProps = useBlockProps.save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		'data-source': attributes.source,
		'data-search-form-id': attributes.searchFormId || undefined,
		// Headless-ready: Visibility rules configuration
		'data-visibility-behavior': attributes['visibilityBehavior'] || undefined,
		'data-visibility-rules': (attributes['visibilityRules'] as any[])?.length
			? JSON.stringify(attributes['visibilityRules'])
			: undefined,
		// Headless-ready: Loop element configuration
		'data-loop-source': attributes['loopSource'] || undefined,
		'data-loop-property': attributes['loopProperty'] || undefined,
		'data-loop-limit': attributes['loopLimit'] || undefined,
		'data-loop-offset': attributes['loopOffset'] || undefined,
		...advancedProps.customAttrs,
	});

	// Build vxconfig JSON
	const vxConfig = buildVxConfig(attributes);

	return (
		<div {...blockProps}>
			{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}
			{/* vxconfig JSON for frontend hydration */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}

			{/* Placeholder replaced during hydration */}
			<div
				className="voxel-fse-block-placeholder"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: '#e8e8e8',
					minHeight: '200px',
					borderRadius: '4px',
				}}
			>
				{/* Map placeholder icon */}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					width="48"
					height="48"
					fill="#999"
				>
					<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
				</svg>
			</div>
		</div>
	);
}
