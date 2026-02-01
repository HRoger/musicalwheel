/**
 * Visit Chart Block - Editor Component
 *
 * Provides InspectorControls and live preview in the block editor.
 * Uses shared VisitChartComponent for preview rendering.
 *
 * @package VoxelFSE
 */

import { useEffect, useMemo } from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { ContentTab, StyleTab } from './inspector';
import VisitChartComponent from './shared/VisitChartComponent';
import { generateVisitChartResponsiveCSS } from './styles';
import type { EditProps } from './types';

/**
 * Edit component for the Visit Chart block
 */
export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Set blockId if not already set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-bar-chart-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/bar-chart.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	// This handles: styles, className, responsiveCSS, customAttrs, elementId
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'ts-visits-chart voxel-fse-visit-chart',
		selectorPrefix: 'voxel-fse-visit-chart',
	});

	// Generate visit-chart-specific responsive CSS with useMemo for performance
	const visitChartResponsiveCSS = useMemo(
		() => generateVisitChartResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = useMemo(
		() => [advancedProps.responsiveCSS, visitChartResponsiveCSS].filter(Boolean).join('\n'),
		[advancedProps.responsiveCSS, visitChartResponsiveCSS]
	);

	const blockProps = useBlockProps({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		...advancedProps.customAttrs,
	});

	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c',
							render: () => (
								<ContentTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab
									attributes={attributes}
									setAttributes={setAttributes}
								/>
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			{/* Block Preview */}
			<div {...blockProps}>
				{/* Output combined responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				<VisitChartComponent
					attributes={attributes}
					context="editor"
				/>
			</div>
		</>
	);
}
