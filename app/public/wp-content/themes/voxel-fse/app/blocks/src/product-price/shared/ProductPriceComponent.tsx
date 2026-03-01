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
	/** SSR price HTML from render.php — rendered on first paint to avoid FOUC */
	ssrPriceHtml?: string;
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

	// Strikethrough text typography (Elementor: price_typo_discount)
	if (attributes.strikethroughTypography) {
		if (attributes.strikethroughTypography.fontSize) {
			styles['--vx-strike-font-size'] = attributes.strikethroughTypography.fontSize;
		}
		if (attributes.strikethroughTypography.fontWeight) {
			styles['--vx-strike-font-weight'] = attributes.strikethroughTypography.fontWeight;
		}
		if (attributes.strikethroughTypography.fontFamily) {
			styles['--vx-strike-font-family'] = attributes.strikethroughTypography.fontFamily;
		}
		if (attributes.strikethroughTypography.lineHeight) {
			styles['--vx-strike-line-height'] = attributes.strikethroughTypography.lineHeight;
		}
		if (attributes.strikethroughTypography.letterSpacing) {
			styles['--vx-strike-letter-spacing'] = attributes.strikethroughTypography.letterSpacing;
		}
		if (attributes.strikethroughTypography.textTransform) {
			styles['--vx-strike-text-transform'] = attributes.strikethroughTypography.textTransform;
		}
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
		strikethroughTypography: attributes.strikethroughTypography,
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
	ssrPriceHtml,
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

	// Frontend context: render content directly (no wrapper div).
	// The outer wrapper already exists from save.tsx / render.php output.
	// Adding another .vxfse-product-price div would create duplicates
	// that get re-hydrated by voxel:markup-update.
	if (context === 'frontend') {
		return <FrontendContent priceData={priceData} isLoading={isLoading} error={error} vxconfig={vxconfig} ssrPriceHtml={ssrPriceHtml} />;
	}

	// Editor context: render with wrapper div for proper styling
	// Loading state — render nothing (invisible) to avoid grey-box FOUC.
	// The block wrapper in edit.tsx already occupies space, so nothing → price
	// is less jarring than EmptyPlaceholder → price.
	if (isLoading) {
		return null;
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
				<EmptyPlaceholder />
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
				<EmptyPlaceholder />
			</div>
		);
	}

	// Product not available (out of stock / unavailable / no product configured)
	if (!priceData.isAvailable) {
		const isNoProductConfigured = priceData.errorMessage === 'No product configured';

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
				{isNoProductConfigured ? (
					<EmptyPlaceholder />
				) : (
					<span className="vx-price no-stock">
						{priceData.errorMessage || 'Unavailable'}
					</span>
				)}
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
				<span className="vx-price">
					{priceData.formattedDiscountPrice}
					{priceData.suffix}
				</span>
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
			<span className="vx-price">
				{priceData.formattedRegularPrice}
				{priceData.suffix}
			</span>
		</div>
	);
}

/**
 * Frontend-only content renderer.
 * Renders content without a wrapper div since the outer container
 * (from save.tsx) already provides the .vxfse-product-price wrapper.
 */
function FrontendContent({
	priceData,
	isLoading,
	error,
	vxconfig,
	ssrPriceHtml,
}: {
	priceData: ProductPriceData | null;
	isLoading: boolean;
	error: string | null;
	vxconfig: ProductPriceVxConfig;
	ssrPriceHtml?: string;
}) {
	const vxconfigScript = (
		<script
			type="text/json"
			className="vxconfig"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(vxconfig) }}
		/>
	);

	// SSR path: render.php already rendered the price spans.
	// Render the captured SSR HTML directly to avoid a blank flash while
	// React initialises. This is the first-paint state — no fetch needed.
	if (ssrPriceHtml) {
		return (
			<>
				{vxconfigScript}
				{/* eslint-disable-next-line react/no-danger */}
				<span
					className="vx-ssr-price"
					style={{ display: 'contents' }}
					dangerouslySetInnerHTML={{ __html: ssrPriceHtml }}
				/>
			</>
		);
	}

	if (isLoading || error || !priceData) {
		return vxconfigScript;
	}

	if (!priceData.isAvailable) {
		if (priceData.errorMessage === 'No product configured') {
			return vxconfigScript;
		}
		return (
			<>
				{vxconfigScript}
				<span className="vx-price no-stock">
					{priceData.errorMessage || 'Unavailable'}
				</span>
			</>
		);
	}

	if (priceData.hasDiscount) {
		return (
			<>
				{vxconfigScript}
				<span className="vx-price">
					{priceData.formattedDiscountPrice}
					{priceData.suffix}
				</span>
				<span className="vx-price">
					<s>
						{priceData.formattedRegularPrice}
						{priceData.suffix}
					</s>
				</span>
			</>
		);
	}

	return (
		<>
			{vxconfigScript}
			<span className="vx-price">
				{priceData.formattedRegularPrice}
				{priceData.suffix}
			</span>
		</>
	);
}
