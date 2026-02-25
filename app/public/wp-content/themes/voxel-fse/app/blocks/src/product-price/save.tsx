/**
 * Product Price Block - Save Component (Plan C+)
 *
 * Outputs static HTML with vxconfig JSON for frontend hydration.
 * This eliminates the need for render.php (server-side PHP rendering).
 *
 * The save function outputs:
 * 1. A vxconfig script tag with block configuration
 * 2. A placeholder that will be replaced by React hydration
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import { getAdvancedVoxelTabProps, renderBackgroundElements } from '@shared/utils';
import { generateProductPriceResponsiveCSS } from './styles';
import type { ProductPriceAttributes, ProductPriceVxConfig } from './types';

interface SaveProps {
	attributes: ProductPriceAttributes;
}

function createSaveFn(includePlaceholder: boolean) {
	return function save({ attributes }: SaveProps) {
		// Use shared utility for AdvancedTab + VoxelTab wiring
		const advancedProps = getAdvancedVoxelTabProps(attributes as any, {
			blockId: (attributes as any).blockId || 'product-price',
			baseClass: 'vxfse-product-price',
		});

		// Generate product-price responsive CSS (tablet/mobile variants)
		const blockId = (attributes as any).blockId || 'product-price';
		const productPriceResponsiveCSS = generateProductPriceResponsiveCSS(attributes, blockId);

		// Combine all responsive CSS
		// Layer 1 (AdvancedTab + VoxelTab) + Layer 2 (Block-specific)
		const combinedResponsiveCSS = [advancedProps.responsiveCSS, productPriceResponsiveCSS]
			.filter(Boolean)
			.join('\n');

		// Build wrapper props with Voxel-compatible classes
		const blockProps = (useBlockProps as any).save({
			id: advancedProps.elementId,
			className: advancedProps.className,
			// Note: style will be merged with styleVars below
		});

		// Build vxconfig for frontend hydration
		// This contains all styling information needed to render the component
		const vxconfig: ProductPriceVxConfig = {
			priceColor: attributes.priceColor,
			strikethroughTextColor: attributes.strikethroughTextColor,
			strikethroughLineColor: attributes.strikethroughLineColor,
			strikethroughWidth: attributes.strikethroughWidth,
			strikethroughWidthUnit: attributes.strikethroughWidthUnit,
			outOfStockColor: attributes.outOfStockColor,
			typography: attributes.typography,
			strikethroughTypography: attributes.strikethroughTypography,
			// Note: postId is not available in save context
			// It will be determined from page context on frontend
		};

		// Build CSS variables from attributes for initial render
		const styleVars: Record<string, string> = {};

		if (attributes.priceColor) {
			styleVars['--vx-price-color'] = attributes.priceColor;
		}
		if (attributes.strikethroughTextColor) {
			styleVars['--vx-strike-text-color'] = attributes.strikethroughTextColor;
		}
		if (attributes.strikethroughLineColor) {
			styleVars['--vx-strike-line-color'] = attributes.strikethroughLineColor;
		}
		if (attributes.strikethroughWidth) {
			const unit = attributes.strikethroughWidthUnit || 'px';
			styleVars['--vx-strike-width'] = `${attributes.strikethroughWidth}${unit}`;
		}
		if (attributes.outOfStockColor) {
			styleVars['--vx-nostock-color'] = attributes.outOfStockColor;
		}
		if (attributes.typography?.fontSize) {
			styleVars['--vx-price-font-size'] = attributes.typography.fontSize;
		}
		if (attributes.typography?.fontWeight) {
			styleVars['--vx-price-font-weight'] = attributes.typography.fontWeight;
		}
		if (attributes.strikethroughTypography?.fontSize) {
			styleVars['--vx-strike-font-size'] = attributes.strikethroughTypography.fontSize;
		}
		if (attributes.strikethroughTypography?.fontWeight) {
			styleVars['--vx-strike-font-weight'] = attributes.strikethroughTypography.fontWeight;
		}

		// Merge advancedProps.styles with component styleVars
		const mergedStyles = {
			...styleVars,
			...(advancedProps.styles || {}),
		};

		return (
			<div
				{...blockProps}
				data-block-id={(attributes as any).blockId}
				style={mergedStyles as React.CSSProperties}
				// Headless-ready: Visibility rules configuration
				data-visibility-behavior={(attributes as any).visibilityBehavior || undefined}
				data-visibility-rules={(attributes as any).visibilityRules?.length
					? JSON.stringify((attributes as any).visibilityRules)
					: undefined}
				// Headless-ready: Loop element configuration
				data-loop-source={(attributes as any).loopSource || undefined}
				data-loop-limit={(attributes as any).loopLimit || undefined}
				data-loop-offset={(attributes as any).loopOffset || undefined}
				{...advancedProps.customAttrs}
			>
				{/* Responsive CSS from AdvancedTab + VoxelTab + Content Tab */}
				{combinedResponsiveCSS && (
					<style dangerouslySetInnerHTML={{ __html: combinedResponsiveCSS }} />
				)}

				{/* Background elements: video, slideshow, overlay, shape dividers */}
				{renderBackgroundElements(attributes, false, undefined, undefined, advancedProps.uniqueSelector)}
				{/* Vxconfig JSON for frontend hydration (matching Voxel pattern) */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>

				{/* Placeholder for React hydration - will be replaced by ProductPriceComponent */}
				{includePlaceholder && (
					<div
						className="voxel-fse-block-placeholder"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: '#f3f4f6',
							padding: '8px 16px',
							minHeight: '32px',
							borderRadius: '4px',
						}}
					>
						{/* VX grid icon */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							width="20"
							height="20"
							fill="currentColor"
							style={{ opacity: 0.4, marginRight: '8px' }}
						>
							<rect x="4" y="4" width="4" height="4" rx="0.5" />
							<rect x="10" y="4" width="4" height="4" rx="0.5" />
							<rect x="16" y="4" width="4" height="4" rx="0.5" />
							<rect x="4" y="10" width="4" height="4" rx="0.5" />
							<rect x="10" y="10" width="4" height="4" rx="0.5" />
							<rect x="16" y="10" width="4" height="4" rx="0.5" />
							<rect x="4" y="16" width="4" height="4" rx="0.5" />
							<rect x="10" y="16" width="4" height="4" rx="0.5" />
							<rect x="16" y="16" width="4" height="4" rx="0.5" />
						</svg>
						<span style={{ opacity: 0.5, fontSize: '14px' }}>
							Product Price
						</span>
					</div>
				)}
			</div>
		);
	};
}

export default createSaveFn(false);
export const saveWithPlaceholder = createSaveFn(true);
