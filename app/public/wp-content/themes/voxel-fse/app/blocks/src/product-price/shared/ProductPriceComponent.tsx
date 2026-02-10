/**
 * Product Price Block - Shared Component
 *
 * Renders product price matching Voxel's HTML structure 1:1.
 * Used by both edit.tsx (editor preview) and frontend.tsx (hydration).
 *
 * Voxel HTML Structure (from templates/widgets/product-price.php):
 * - Available with discount:
 *   <span class="vx-price">$99.00 / night</span>
 *   <span class="vx-price"><s>$199.00 / night</s></span>
 *
 * - Available without discount:
 *   <span class="vx-price">$99.00 / night</span>
 *
 * - Not available:
 *   <span class="vx-price no-stock">Out of stock</span>
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import type {
	ProductPriceAttributes,
	ProductPriceData,
	ProductPriceVxConfig,
} from '../types';
import { EmptyPlaceholder } from '@shared/controls/EmptyPlaceholder';

interface ProductPriceComponentProps {
	attributes: ProductPriceAttributes;
	priceData: ProductPriceData | null;
	isLoading: boolean;
	error: string | null;
	context: 'editor' | 'frontend';
	postId?: number;
}

/**
 * Build CSS styles object from attributes
 */
function buildStyles(attributes: ProductPriceAttributes): Record<string, string> {
	const styles: Record<string, string> = {};

	// Price color (applied via CSS variable for cascading)
	if (attributes.priceColor) {
		styles['--vx-price-color'] = attributes.priceColor;
	}

	// Strikethrough text color
	if (attributes.strikethroughTextColor) {
		styles['--vx-strike-text-color'] = attributes.strikethroughTextColor;
	}

	// Strikethrough line color
	if (attributes.strikethroughLineColor) {
		styles['--vx-strike-line-color'] = attributes.strikethroughLineColor;
	}

	// Strikethrough width
	if (attributes.strikethroughWidth) {
		const unit = attributes.strikethroughWidthUnit || 'px';
		styles['--vx-strike-width'] = `${attributes.strikethroughWidth}${unit}`;
	}

	// Out of stock color
	if (attributes.outOfStockColor) {
		styles['--vx-nostock-color'] = attributes.outOfStockColor;
	}

	// Typography
	if (attributes.typography) {
		if (attributes.typography.fontSize) {
			styles['--vx-price-font-size'] = attributes.typography.fontSize;
		}
		if (attributes.typography.fontWeight) {
			styles['--vx-price-font-weight'] = attributes.typography.fontWeight;
		}
		if (attributes.typography.fontFamily) {
			styles['--vx-price-font-family'] = attributes.typography.fontFamily;
		}
		if (attributes.typography.lineHeight) {
			styles['--vx-price-line-height'] = attributes.typography.lineHeight;
		}
		if (attributes.typography.letterSpacing) {
			styles['--vx-price-letter-spacing'] = attributes.typography.letterSpacing;
		}
		if (attributes.typography.textTransform) {
			styles['--vx-price-text-transform'] = attributes.typography.textTransform;
		}
	}

	return styles;
}

/**
 * Build vxconfig object for save/frontend
 */
function buildVxConfig(
	attributes: ProductPriceAttributes,
	postId?: number
): ProductPriceVxConfig {
	return {
		priceColor: attributes.priceColor,
		strikethroughTextColor: attributes.strikethroughTextColor,
		strikethroughLineColor: attributes.strikethroughLineColor,
		strikethroughWidth: attributes.strikethroughWidth,
		strikethroughWidthUnit: attributes.strikethroughWidthUnit,
		outOfStockColor: attributes.outOfStockColor,
		typography: attributes.typography,
		postId,
	};
}

export default function ProductPriceComponent({
	attributes,
	priceData,
	isLoading,
	error,
	context,
	postId,
}: ProductPriceComponentProps) {
	// Build CSS variables from attributes
	const containerStyles = useMemo(
		() => buildStyles(attributes),
		[attributes]
	);

	// Build vxconfig for frontend hydration
	const vxconfig = useMemo(
		() => buildVxConfig(attributes, postId),
		[attributes, postId]
	);

	// Get blockId for scoped selector
	const blockId = attributes.blockId || 'product-price';

	// Build visibility classes
	const visibilityClasses = [
		`vxfse-product-price-${blockId}`, // Scoped selector for responsive CSS
		attributes.hideDesktop ? 'vxfse-hide-desktop' : '',
		attributes.hideTablet ? 'vxfse-hide-tablet' : '',
		attributes.hideMobile ? 'vxfse-hide-mobile' : '',
		attributes.customClasses || '',
	]
		.filter(Boolean)
		.join(' ');

	// Loading state
	if (isLoading) {
		return (
			<div
				className={`vxfse-product-price ${visibilityClasses}`.trim()}
				style={containerStyles as React.CSSProperties}
			>
				{/* Vxconfig for frontend re-renders */}
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div
				className={`vxfse-product-price ${visibilityClasses}`.trim()}
				style={containerStyles as React.CSSProperties}
			>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// No data state (editor placeholder)
	if (!priceData) {
		return (
			<div
				className={`vxfse-product-price ${visibilityClasses}`.trim()}
				style={containerStyles as React.CSSProperties}
			>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				{context === 'editor' && <EmptyPlaceholder />}
			</div>
		);
	}

	// Product not available (out of stock / unavailable / no product configured)
	if (!priceData.isAvailable) {
		// "No product configured" - show EmptyPlaceholder in editor, nothing in frontend
		const isNoProductConfigured = priceData.errorMessage === 'No product configured';

		if (isNoProductConfigured) {
			// Frontend: render nothing (empty wrapper for hydration)
			if (context === 'frontend') {
				return (
					<div
						className={`vxfse-product-price ${visibilityClasses}`.trim()}
						style={containerStyles as React.CSSProperties}
					>
						<script
							type="text/json"
							className="vxconfig"
							dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
						/>
					</div>
				);
			}

			// Editor: show EmptyPlaceholder
			return (
				<div
					className={`vxfse-product-price ${visibilityClasses}`.trim()}
					style={containerStyles as React.CSSProperties}
				>
					<script
						type="text/json"
						className="vxconfig"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
					/>
					<EmptyPlaceholder />
				</div>
			);
		}

		// Out of stock / Unavailable - show error message
		return (
			<div
				className={`vxfse-product-price ${visibilityClasses}`.trim()}
				style={containerStyles as React.CSSProperties}
			>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				{/* Voxel HTML: <span class="vx-price no-stock">Out of stock</span> */}
				<span className="vx-price no-stock">
					{priceData.errorMessage || 'Unavailable'}
				</span>
			</div>
		);
	}

	// Product available with discount
	if (priceData.hasDiscount) {
		return (
			<div
				className={`vxfse-product-price ${visibilityClasses}`.trim()}
				style={containerStyles as React.CSSProperties}
			>
				<script
					type="text/json"
					className="vxconfig"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
				/>
				{/* Voxel HTML: <span class="vx-price">$discount_price / suffix</span> */}
				<span className="vx-price">
					{priceData.formattedDiscountPrice}
					{priceData.suffix}
				</span>
				{/* Voxel HTML: <span class="vx-price"><s>$regular_price / suffix</s></span> */}
				<span className="vx-price">
					<s>
						{priceData.formattedRegularPrice}
						{priceData.suffix}
					</s>
				</span>
			</div>
		);
	}

	// Product available without discount
	return (
		<div
			className={`vxfse-product-price ${visibilityClasses}`.trim()}
			style={containerStyles as React.CSSProperties}
		>
			<script
				type="text/json"
				className="vxconfig"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
			/>
			{/* Voxel HTML: <span class="vx-price">$regular_price / suffix</span> */}
			<span className="vx-price">
				{priceData.formattedRegularPrice}
				{priceData.suffix}
			</span>
		</div>
	);
}
