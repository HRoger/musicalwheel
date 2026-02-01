/**
 * Cart Summary Block - Edit Component
 *
 * Editor interface with InspectorControls and preview using Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { useEffect } from 'react';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';


import { __ } from '@wordpress/i18n';

import {
	InspectorTabs,
	VoxelTab,
	AdvancedTab,
} from '@shared/controls';

import CartSummaryComponent from './shared/CartSummaryComponent';
import { useCartConfig } from './hooks/useCartConfig';
import ContentTab from './inspector/ContentTab';
import StyleTab from './inspector/StyleTab';
import { generateCartSummaryStyles } from './styles';

import type { EditProps } from './types';
import { getAdvancedVoxelTabProps } from '../../shared/utils';





export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId: attributes.blockId || clientId,
		baseClass: 'vx-cart-summary-widget voxel-fse-cart-summary-editor',
		selectorPrefix: 'voxel-fse-cart-summary',
	});

	const blockProps = useBlockProps({
		className: advancedProps.className,
		style: advancedProps.styles,
	});

	// Fetch cart configuration from REST API
	const { config, isLoading, error } = useCartConfig();

	// Set block ID if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-product-summary-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/product-summary.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Generate CSS for Style tab controls
	const blockId = attributes.blockId || clientId;
	const styleCSS = generateCartSummaryStyles(attributes, blockId);



	return (
		<>
			<InspectorControls>
				<InspectorTabs
					tabs={[
						{
							id: 'content',
							label: __('Content', 'voxel-fse'),
							icon: '\ue92c', // eicon-edit
							render: () => (
								<ContentTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'style',
							label: __('Style', 'voxel-fse'),
							icon: '\ue921', // eicon-paint-brush
							render: () => (
								<StyleTab attributes={attributes} setAttributes={setAttributes} />
							),
						},
						{
							id: 'advanced',
							label: __('Advanced', 'voxel-fse'),
							icon: '\ue916', // eicon-editor-code
							render: () => (
								<AdvancedTab
									attributes={attributes as unknown as Parameters<typeof AdvancedTab>[0]['attributes']}
									setAttributes={setAttributes}
								/>
							),
						},
						{
							id: 'voxel',
							label: __('Voxel', 'voxel-fse'),
							icon: '/wp-content/themes/voxel/assets/images/post-types/logo.svg',
							render: () => (
								<VoxelTab
									attributes={attributes as unknown as Parameters<typeof VoxelTab>[0]['attributes']}
									setAttributes={setAttributes as unknown as Parameters<typeof VoxelTab>[0]['setAttributes']}
								/>
							),
						},
					]}
				/>
			</InspectorControls>

			<div {...blockProps}>
				{/* Advanced Tab + VoxelTab CSS */}
				{advancedProps.responsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: advancedProps.responsiveCSS }} />
				)}
				{/* Style Tab CSS */}
				{styleCSS && (
					<style dangerouslySetInnerHTML={{ __html: styleCSS }} />
				)}
				<CartSummaryComponent
					attributes={attributes}
					config={config}
					items={null}
					context="editor"
					isLoading={isLoading}
					error={error}
				/>
			</div>
		</>
	);
}
