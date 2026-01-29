/**
 * Product Price Block - Responsive CSS Generation
 *
 * Generates responsive CSS for tablet and mobile breakpoints.
 * Desktop styles are applied via CSS variables in buildStyles().
 *
 * @package VoxelFSE
 */

import type { ProductPriceAttributes } from './types';

/**
 * Generate responsive CSS for tablet and mobile breakpoints
 *
 * @param attributes Block attributes
 * @param blockId Unique block identifier
 * @returns CSS string with @media queries
 */
export function generateProductPriceResponsiveCSS(
	attributes: ProductPriceAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.vxfse-product-price-${blockId}`;

	// ============================================
	// TABLET BREAKPOINT (@media max-width: 1024px)
	// ============================================

	// Price color (tablet)
	if (attributes.priceColor_tablet) {
		tabletRules.push(
			`${selector} { --vx-price-color: ${attributes.priceColor_tablet}; }`
		);
	}

	// Strikethrough text color (tablet)
	if (attributes.strikethroughTextColor_tablet) {
		tabletRules.push(
			`${selector} { --vx-strike-text-color: ${attributes.strikethroughTextColor_tablet}; }`
		);
	}

	// Strikethrough line color (tablet)
	if (attributes.strikethroughLineColor_tablet) {
		tabletRules.push(
			`${selector} { --vx-strike-line-color: ${attributes.strikethroughLineColor_tablet}; }`
		);
	}

	// Strikethrough width (tablet)
	if (attributes.strikethroughWidth_tablet !== undefined) {
		const unit = attributes.strikethroughWidthUnit || 'px';
		tabletRules.push(
			`${selector} { --vx-strike-width: ${attributes.strikethroughWidth_tablet}${unit}; }`
		);
	}

	// Out of stock color (tablet)
	if (attributes.outOfStockColor_tablet) {
		tabletRules.push(
			`${selector} { --vx-nostock-color: ${attributes.outOfStockColor_tablet}; }`
		);
	}

	// ============================================
	// MOBILE BREAKPOINT (@media max-width: 767px)
	// ============================================

	// Price color (mobile)
	if (attributes.priceColor_mobile) {
		mobileRules.push(
			`${selector} { --vx-price-color: ${attributes.priceColor_mobile}; }`
		);
	}

	// Strikethrough text color (mobile)
	if (attributes.strikethroughTextColor_mobile) {
		mobileRules.push(
			`${selector} { --vx-strike-text-color: ${attributes.strikethroughTextColor_mobile}; }`
		);
	}

	// Strikethrough line color (mobile)
	if (attributes.strikethroughLineColor_mobile) {
		mobileRules.push(
			`${selector} { --vx-strike-line-color: ${attributes.strikethroughLineColor_mobile}; }`
		);
	}

	// Strikethrough width (mobile)
	if (attributes.strikethroughWidth_mobile !== undefined) {
		const unit = attributes.strikethroughWidthUnit || 'px';
		mobileRules.push(
			`${selector} { --vx-strike-width: ${attributes.strikethroughWidth_mobile}${unit}; }`
		);
	}

	// Out of stock color (mobile)
	if (attributes.outOfStockColor_mobile) {
		mobileRules.push(
			`${selector} { --vx-nostock-color: ${attributes.outOfStockColor_mobile}; }`
		);
	}

	// ============================================
	// COMBINE CSS WITH MEDIA QUERIES
	// ============================================

	let finalCSS = '';

	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}

	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return finalCSS;
}
