/**
 * Product Form Block - Save Function (Plan C+)
 *
 * Saves static HTML with vxconfig for frontend/Next.js hydration.
 * NO PHP rendering - all configuration stored in JSON.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/product-form.php
 * - Template: themes/voxel/templates/widgets/product-form.php
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import type { ProductFormAttributes, ProductFormVxConfig } from './types';
import { DEFAULT_PRODUCT_FORM_ICONS } from './types';
import { generateProductFormResponsiveCSS } from './styles';

interface SaveProps {
	attributes: ProductFormAttributes;
}

export default function save({ attributes }: SaveProps) {
	const blockId = attributes.blockId || 'product-form';

	// Use shared utility for AdvancedTab + VoxelTab wiring
	const advancedProps = getAdvancedVoxelTabProps(attributes, {
		blockId,
		baseClass: 'ts-form ts-product-form voxel-fse-product-form',
	});

	// Generate product-form-specific responsive CSS
	const productFormResponsiveCSS = generateProductFormResponsiveCSS(
		attributes,
		blockId
	);

	// Combine all responsive CSS
	// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
	const combinedResponsiveCSS = [
		advancedProps.responsiveCSS,
		productFormResponsiveCSS,
	]
		.filter(Boolean)
		.join('\n');

	const blockProps = useBlockProps.save({
		id: advancedProps.elementId,
		className: advancedProps.className,
		style: advancedProps.styles,
		// Headless-ready: Visibility rules configuration
		'data-visibility-behavior': attributes.visibilityBehavior || undefined,
		'data-visibility-rules': attributes.visibilityRules?.length
			? JSON.stringify(attributes.visibilityRules)
			: undefined,
		// Headless-ready: Loop element configuration
		'data-loop-source': attributes.loopSource || undefined,
		'data-loop-limit': attributes.loopLimit || undefined,
		'data-loop-offset': attributes.loopOffset || undefined,
		...advancedProps.customAttrs,
	});

	// Build vxconfig JSON (matching Voxel pattern)
	// Product configuration is fetched from REST API at runtime
	const vxConfig: ProductFormVxConfig = {
		blockId: attributes.blockId,
		settings: {
			showPriceCalculator: attributes.showPriceCalculator,
			showSubtotalOnly: attributes.showSubtotalOnly,
			hideCardSubheading: attributes.hideCardSubheading,
			cardSelectOnClick: attributes.cardSelectOnClick,
		},
		icons: {
			...DEFAULT_PRODUCT_FORM_ICONS,
			...attributes.icons,
		},
	};

	return (
		<div {...blockProps}>
			{/* Responsive CSS from AdvancedTab + VoxelTab + Style Tab */}
			{combinedResponsiveCSS && (
				<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
			)}

			{/* Background elements: video, slideshow, overlay, shape dividers */}
			{renderBackgroundElements(
				attributes,
				false,
				undefined,
				undefined,
				advancedProps.uniqueSelector
			)}

			{/* Voxel vxconfig pattern - configuration stored in JSON script */}
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
			/>
			{/* Placeholder for React hydration - shows loading state */}
			<div className="ts-product-main vx-loading-screen">
				<div className="ts-no-posts">
					<span className="ts-loader"></span>
				</div>
			</div>
		</div>
	);
}
