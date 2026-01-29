/**
 * Review Stats Block - Style Generation
 *
 * Generates CSS targeting Voxel classes (.ts-review-bars, .ts-bar-data, etc.).
 * This is LAYER 2 CSS - works alongside AdvancedTab styles (LAYER 1).
 *
 * Source: themes/voxel/app/widgets/review-stats.php
 *
 * @package VoxelFSE
 */

import type { ReviewStatsAttributes } from './types';

/**
 * Helper: Generate typography CSS from TypographyControl value
 */
function generateTypographyCSS(typography: any): string {
	if (!typography) return '';

	let css = '';

	// Font family
	if (typography.fontFamily) {
		css += `font-family: ${typography.fontFamily}; `;
	}

	// Font size
	if (typography.fontSize) {
		const unit = typography.fontSizeUnit || 'px';
		css += `font-size: ${typography.fontSize}${unit}; `;
	}

	// Font weight
	if (typography.fontWeight) {
		css += `font-weight: ${typography.fontWeight}; `;
	}

	// Font style
	if (typography.fontStyle) {
		css += `font-style: ${typography.fontStyle}; `;
	}

	// Text transform
	if (typography.textTransform) {
		css += `text-transform: ${typography.textTransform}; `;
	}

	// Text decoration
	if (typography.textDecoration) {
		css += `text-decoration: ${typography.textDecoration}; `;
	}

	// Line height
	if (typography.lineHeight) {
		const unit = typography.lineHeightUnit || '';
		css += `line-height: ${typography.lineHeight}${unit}; `;
	}

	// Letter spacing
	if (typography.letterSpacing) {
		const unit = typography.letterSpacingUnit || 'px';
		css += `letter-spacing: ${typography.letterSpacing}${unit}; `;
	}

	return css;
}

/**
 * Generate responsive CSS for review-stats block
 *
 * This function creates CSS rules targeting Voxel classes within the block scope.
 * CSS is scoped to prevent conflicts with other blocks.
 *
 * @param attributes Block attributes
 * @param blockId Unique block ID for scoping
 * @returns CSS string with desktop, tablet, and mobile media queries
 */
export function generateReviewStatsResponsiveCSS(
	attributes: ReviewStatsAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.vxfse-review-stats-${blockId}`;

	// ============================================
	// SECTION 1: Reviews Grid
	// Source: review-stats.php:59-95
	// ============================================

	// Grid columns (desktop) - review-stats.php:68-70
	// Selector: '{{WRAPPER}} .ts-review-bars' => 'grid-template-columns: repeat({{VALUE}}, 1fr);'
	if (attributes.columns) {
		cssRules.push(`${selector} .ts-review-bars { grid-template-columns: repeat(${attributes.columns}, 1fr); }`);
	}

	// Grid columns (tablet)
	if (attributes.columns_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-review-bars { grid-template-columns: repeat(${attributes.columns_tablet}, 1fr); }`);
	}

	// Grid columns (mobile)
	if (attributes.columns_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-review-bars { grid-template-columns: repeat(${attributes.columns_mobile}, 1fr); }`);
	}

	// Item gap (desktop) - review-stats.php:90-92
	// Selector: '{{WRAPPER}} .ts-review-bars' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.itemGap !== undefined) {
		cssRules.push(`${selector} .ts-review-bars { grid-gap: ${attributes.itemGap}px; }`);
	}

	// Item gap (tablet)
	if (attributes.itemGap_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-review-bars { grid-gap: ${attributes.itemGap_tablet}px; }`);
	}

	// Item gap (mobile)
	if (attributes.itemGap_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-review-bars { grid-gap: ${attributes.itemGap_mobile}px; }`);
	}

	// ============================================
	// SECTION 2: Review Stats
	// Source: review-stats.php:106-236
	// ============================================

	// Icon size (desktop) - review-stats.php:119-122
	// Selectors:
	//   '{{WRAPPER}} .ts-bar-data i' => 'font-size: {{SIZE}}{{UNIT}};'
	//   '{{WRAPPER}} .ts-bar-data svg' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.iconSize) {
		cssRules.push(`${selector} .ts-bar-data i { font-size: ${attributes.iconSize}px; }`);
		cssRules.push(`${selector} .ts-bar-data svg { width: ${attributes.iconSize}px; height: ${attributes.iconSize}px; }`);
	}

	// Icon size (tablet)
	if (attributes.iconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-bar-data i { font-size: ${attributes.iconSize_tablet}px; }`);
		tabletRules.push(`${selector} .ts-bar-data svg { width: ${attributes.iconSize_tablet}px; height: ${attributes.iconSize_tablet}px; }`);
	}

	// Icon size (mobile)
	if (attributes.iconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-bar-data i { font-size: ${attributes.iconSize_mobile}px; }`);
		mobileRules.push(`${selector} .ts-bar-data svg { width: ${attributes.iconSize_mobile}px; height: ${attributes.iconSize_mobile}px; }`);
	}

	// Icon spacing - review-stats.php:139-142
	// Selectors:
	//   '{{WRAPPER}} .ts-bar-data i' => 'margin-right: {{SIZE}}{{UNIT}};'
	//   '{{WRAPPER}} .ts-bar-data svg' => 'margin-right: {{SIZE}}{{UNIT}};'
	if (attributes.iconSpacing !== undefined) {
		cssRules.push(`${selector} .ts-bar-data i { margin-right: ${attributes.iconSpacing}px; }`);
		cssRules.push(`${selector} .ts-bar-data svg { margin-right: ${attributes.iconSpacing}px; }`);
	}

	// Label typography - review-stats.php:148-155
	// Selector: '{{WRAPPER}} .ts-bar-data p'
	if (attributes.labelTypography) {
		const typographyCSS = generateTypographyCSS(attributes.labelTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-bar-data p { ${typographyCSS} }`);
		}
	}

	// Label color - review-stats.php:157-165
	// Selector: '{{WRAPPER}} .ts-bar-data p' => 'color: {{VALUE}}'
	if (attributes.labelColor) {
		cssRules.push(`${selector} .ts-bar-data p { color: ${attributes.labelColor}; }`);
	}

	// Score typography - review-stats.php:168-175
	// Selector: '{{WRAPPER}} .ts-bar-data p span'
	if (attributes.scoreTypography) {
		const typographyCSS = generateTypographyCSS(attributes.scoreTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-bar-data p span { ${typographyCSS} }`);
		}
	}

	// Score color - review-stats.php:177-185
	// Selector: '{{WRAPPER}} .ts-bar-data p span' => 'color: {{VALUE}}'
	if (attributes.scoreColor) {
		cssRules.push(`${selector} .ts-bar-data p span { color: ${attributes.scoreColor}; }`);
	}

	// Chart background color - review-stats.php:190-198
	// Selector: '{{WRAPPER}} .ts-bar-chart' => 'background-color: {{VALUE}}'
	if (attributes.chartBgColor) {
		cssRules.push(`${selector} .ts-bar-chart { background-color: ${attributes.chartBgColor}; }`);
	}

	// Chart height (desktop) - review-stats.php:201-217
	// Selector: '{{WRAPPER}} .ts-bar-chart' => 'height: {{SIZE}}{{UNIT}};'
	if (attributes.chartHeight !== undefined) {
		cssRules.push(`${selector} .ts-bar-chart { height: ${attributes.chartHeight}px; }`);
	}

	// Chart height (tablet)
	if (attributes.chartHeight_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-bar-chart { height: ${attributes.chartHeight_tablet}px; }`);
	}

	// Chart height (mobile)
	if (attributes.chartHeight_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-bar-chart { height: ${attributes.chartHeight_mobile}px; }`);
	}

	// Chart radius (desktop) - review-stats.php:219-235
	// Selector: '{{WRAPPER}} .ts-bar-chart' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.chartRadius !== undefined) {
		cssRules.push(`${selector} .ts-bar-chart { border-radius: ${attributes.chartRadius}px; }`);
	}

	// Chart radius (tablet)
	if (attributes.chartRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-bar-chart { border-radius: ${attributes.chartRadius_tablet}px; }`);
	}

	// Chart radius (mobile)
	if (attributes.chartRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-bar-chart { border-radius: ${attributes.chartRadius_mobile}px; }`);
	}

	// ============================================
	// Combine CSS with media queries
	// ============================================

	let finalCSS = '';

	// Desktop styles
	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}

	// Tablet styles
	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	// Mobile styles
	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return finalCSS;
}
