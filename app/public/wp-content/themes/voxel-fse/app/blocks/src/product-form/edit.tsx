/**
 * Product Form Block - Editor Component
 *
 * 1:1 match with Voxel's Product Form (VX) widget:
 * - Dynamic product fields based on product type configuration
 * - Cart integration with add-to-cart / checkout
 * - Price calculator with pricing summary
 * - Extensive style controls for all form components
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/product-form.php
 * - Template: themes/voxel/templates/widgets/product-form.php
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect, useMemo } from 'react';
import type { ProductFormAttributes } from './types';
import { InspectorTabs } from '@shared/controls';
import { ContentTab, StyleTab } from './inspector';
import ProductFormComponent from './shared/ProductFormComponent';
import { getAdvancedVoxelTabProps } from '@shared/utils';
import { generateProductFormResponsiveCSS } from './styles';

interface EditProps {
	attributes: ProductFormAttributes;
	setAttributes: (attrs: Partial<ProductFormAttributes>) => void;
	clientId: string;
}

export default function Edit({
	attributes,
	setAttributes,
	clientId,
}: EditProps) {
	const blockId = attributes.blockId || clientId;

	// Initialize blockId if not set
	useEffect(() => {
		if (!attributes.blockId) {
			setAttributes({ blockId: clientId });
		}
	}, [attributes.blockId, clientId, setAttributes]);

	// Inject Voxel Editor Styles
	useEffect(() => {
		const cssId = 'voxel-product-form-css';
		if (!document.getElementById(cssId)) {
			const link = document.createElement('link');
			link.id = cssId;
			link.rel = 'stylesheet';
			const voxelConfig = (window as any).Voxel_Config;
			const siteUrl = (voxelConfig?.site_url || window.location.origin).replace(/\/$/, '');
			link.href = `${siteUrl}/wp-content/themes/voxel/assets/dist/product-form.css?ver=1.7.5.2`;
			document.head.appendChild(link);
		}
	}, []);

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'ts-form ts-product-form voxel-fse-product-form',
		selectorPrefix: 'voxel-fse-product-form',
	});

	// Generate product-form-specific responsive CSS with useMemo for performance
	const productFormResponsiveCSS = useMemo(
		() => generateProductFormResponsiveCSS(attributes, blockId),
		[attributes, blockId]
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = useMemo(
		() =>
			[advancedProps.responsiveCSS, productFormResponsiveCSS]
				.filter(Boolean)
				.join('\n'),
		[advancedProps.responsiveCSS, productFormResponsiveCSS]
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
				{/* Output combined responsive CSS */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Editor Preview */}
				<ProductFormComponent attributes={attributes} context="editor" />
			</div>
		</>
	);
}
