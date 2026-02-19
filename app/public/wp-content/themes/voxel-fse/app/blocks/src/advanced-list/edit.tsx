/**
 * Advanced List Block - Editor Component
 *
 * Provides InspectorControls for configuring the Advanced List (Actions VX) block.
 * Converted from Voxel Elementor widget using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { useEffect } from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { InspectorTabs } from '@shared/controls';
import { getAdvancedVoxelTabProps } from '../../shared/utils';
import { useExpandedLoopItems } from '../../shared/utils/useExpandedLoopItems';
import { AdvancedListComponent } from './shared/AdvancedListComponent';
import ContentTab from './inspector/ContentTab';
import StyleTab from './inspector/StyleTab';
import { generateAdvancedListStyles } from './styles';
import type { ExtendedAttributes } from './types';

interface EditProps {
	attributes: ExtendedAttributes;
	setAttributes: (attrs: Partial<ExtendedAttributes>) => void;
}

/**
 * Generate unique block ID
 */
function generateBlockId(): string {
	return `advanced-list-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Edit Component
 */
export default function Edit({ attributes, setAttributes }: EditProps) {
	const blockId = attributes.blockId || 'advanced-list';

	// Expand items with loop configuration for editor preview
	const { items: expandedItems } = useExpandedLoopItems({
		items: attributes.items,
	});

	// Generate block ID on mount if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: generateBlockId() });
		}
	}, [attributes.blockId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-action-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/action.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'voxel-fse-advanced-list-editor',
		selectorPrefix: 'voxel-fse-advanced-list',
	});

	// Generate block-specific CSS for Style Tab controls (hover, active, tooltip, etc.)
	const blockSpecificCSS = generateAdvancedListStyles(attributes, blockId);

	// Combine responsive CSS from AdvancedTab + block-specific styles
	const combinedCSS = [advancedProps.responsiveCSS, blockSpecificCSS]
		.filter(Boolean)
		.join('\n');

	const blockProps = useBlockProps({
		className: advancedProps.className,
		style: advancedProps.styles,
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
								<ContentTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921',
							render: () => (
								<StyleTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
					]}
					includeAdvancedTab={true}
					includeVoxelTab={true}
					attributes={attributes}
					setAttributes={setAttributes}
				/>
			</InspectorControls>

			<div {...blockProps}>
				{/* Combined CSS: AdvancedTab + VoxelTab + Block-specific styles */}
				{combinedCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedCSS }} />
				)}
				<AdvancedListComponent attributes={{ ...attributes, items: expandedItems }} context="editor" />
			</div>
		</>
	);
}
