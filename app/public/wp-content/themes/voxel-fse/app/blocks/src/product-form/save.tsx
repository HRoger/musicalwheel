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
import type { ProductFormAttributes, ProductFormVxConfig } from './types';
import { DEFAULT_PRODUCT_FORM_ICONS } from './types';

interface SaveProps {
	attributes: ProductFormAttributes;
}

export default function save({ attributes }: SaveProps) {
	const blockProps = useBlockProps.save({
		className: 'ts-form ts-product-form voxel-fse-product-form',
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
