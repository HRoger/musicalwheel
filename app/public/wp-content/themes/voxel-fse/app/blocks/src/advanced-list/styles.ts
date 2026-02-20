/**
 * Advanced List Block - Style Generation
 *
 * Generates CSS from Style Tab inspector controls.
 * Targets Voxel CSS classes within a scoped block selector.
 *
 * This handles:
 * - Hover states (:hover pseudo-selectors)
 * - Active states (.active class)
 * - Responsive breakpoints (tablet/mobile media queries)
 * - Typography
 * - Box shadows
 *
 * Evidence: themes/voxel/app/widgets/advanced-list.php
 *
 * @package VoxelFSE
 */

import type { AdvancedListAttributes, BoxShadowValue, TypographyValue } from './types';

/**
 * Generate typography CSS properties from config
 */
function generateTypographyCSS(typography: TypographyValue | undefined): string {
	if (!typography) return '';
	const rules: string[] = [];

	if (typography.fontFamily) {
		rules.push(`font-family: ${typography.fontFamily};`);
	}
	if (typography.fontSize !== undefined) {
		const unit = typography.fontSizeUnit || 'px';
		rules.push(`font-size: ${typography.fontSize}${unit};`);
	}
	if (typography.fontWeight) {
		rules.push(`font-weight: ${typography.fontWeight};`);
	}
	if (typography.fontStyle && typography.fontStyle !== 'default') {
		rules.push(`font-style: ${typography.fontStyle};`);
	}
	if (typography.textDecoration && typography.textDecoration !== 'none') {
		rules.push(`text-decoration: ${typography.textDecoration};`);
	}
	if (typography.lineHeight !== undefined) {
		const unit = typography.lineHeightUnit || '';
		rules.push(`line-height: ${typography.lineHeight}${unit};`);
	}
	if (typography.letterSpacing !== undefined) {
		const unit = typography.letterSpacingUnit || 'px';
		rules.push(`letter-spacing: ${typography.letterSpacing}${unit};`);
	}
	if (typography.textTransform && typography.textTransform !== 'none') {
		rules.push(`text-transform: ${typography.textTransform};`);
	}

	return rules.join(' ');
}

/**
 * Check if typography config has any values set
 */
function hasTypography(typography: TypographyValue | undefined): boolean {
	if (!typography) return false;
	return !!(
		typography.fontFamily ||
		typography.fontSize !== undefined ||
		typography.fontWeight ||
		(typography.fontStyle && typography.fontStyle !== 'default') ||
		(typography.textDecoration && typography.textDecoration !== 'none') ||
		typography.lineHeight !== undefined ||
		typography.letterSpacing !== undefined ||
		(typography.textTransform && typography.textTransform !== 'none')
	);
}

/**
 * Generate box shadow CSS from config
 */
function generateBoxShadowCSS(shadow: BoxShadowValue | undefined): string {
	if (!shadow) return '';
	if (!shadow.horizontal && !shadow.vertical && !shadow.blur && !shadow.spread) {
		return '';
	}
	return `${shadow.horizontal || 0}px ${shadow.vertical || 0}px ${shadow.blur || 0}px ${shadow.spread || 0}px ${shadow.color || 'rgba(0,0,0,0.1)'}`;
}

/**
 * Check if box shadow has any values
 */
function hasBoxShadow(shadow: BoxShadowValue | undefined): boolean {
	if (!shadow) return false;
	return !!(shadow.horizontal || shadow.vertical || shadow.blur || shadow.spread);
}

/**
 * Parse dimension value safely (handles empty strings from DimensionsControl)
 */
function parseDimension(val: string | number | undefined): number {
	if (val === undefined || val === '') return 0;
	const parsed = parseFloat(String(val));
	return isNaN(parsed) ? 0 : parsed;
}

/**
 * Generate CSS for Advanced List block Style Tab controls
 *
 * @param attributes - Block attributes
 * @param blockId - Block ID for scoped selector
 * @returns CSS string
 */
export function generateAdvancedListStyles(
	attributes: AdvancedListAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-advanced-list-${blockId}`;

	// ============================================
	// LIST CONTAINER STYLES
	// Source: advanced-list.php - List accordion
	// ============================================

	// CSS Grid columns (responsive)
	if (attributes.enableCssGrid && attributes.gridColumns) {
		cssRules.push(`${selector} .ts-advanced-list { display: grid; grid-template-columns: repeat(${attributes.gridColumns}, minmax(0, 1fr)); }`);
	}
	if (attributes.enableCssGrid_tablet && attributes.gridColumns_tablet) {
		tabletRules.push(`${selector} .ts-advanced-list { grid-template-columns: repeat(${attributes.gridColumns_tablet}, minmax(0, 1fr)); }`);
	} else if (attributes.enableCssGrid_tablet === false) {
		tabletRules.push(`${selector} .ts-advanced-list { display: flex; grid-template-columns: unset; }`);
	}
	if (attributes.enableCssGrid_mobile && attributes.gridColumns_mobile) {
		mobileRules.push(`${selector} .ts-advanced-list { grid-template-columns: repeat(${attributes.gridColumns_mobile}, minmax(0, 1fr)); }`);
	} else if (attributes.enableCssGrid_mobile === false) {
		mobileRules.push(`${selector} .ts-advanced-list { display: flex; grid-template-columns: unset; }`);
	}

	// List justify (responsive) - only when not CSS grid
	// We handle cascade manually here because desktop rule might be skipped if grid is enabled
	if (!attributes.enableCssGrid && attributes.listJustify) {
		cssRules.push(`${selector} .ts-advanced-list { justify-content: ${attributes.listJustify}; }`);
	}

	// Tablet justify: Use tablet override OR fallback to desktop IF grid is disabled on tablet
	const isGridTablet = attributes.enableCssGrid_tablet ?? attributes.enableCssGrid;
	if (!isGridTablet) {
		const justifyTablet = attributes.listJustify_tablet ?? attributes.listJustify;
		if (justifyTablet) {
			tabletRules.push(`${selector} .ts-advanced-list { justify-content: ${justifyTablet}; }`);
		}
	}

	// Mobile justify
	const isGridMobile = attributes.enableCssGrid_mobile ?? attributes.enableCssGrid_tablet ?? attributes.enableCssGrid;
	if (!isGridMobile) {
		const justifyMobile = attributes.listJustify_mobile ?? attributes.listJustify_tablet ?? attributes.listJustify;
		if (justifyMobile) {
			mobileRules.push(`${selector} .ts-advanced-list { justify-content: ${justifyMobile}; }`);
		}
	}

	// Item gap (responsive)
	if (attributes.itemGap !== undefined) {
		const unit = attributes.itemGapUnit || 'px';
		cssRules.push(`${selector} .ts-advanced-list { gap: ${attributes.itemGap}${unit}; }`);
	}
	if (attributes.itemGap_tablet !== undefined) {
		const unit = attributes.itemGapUnit || 'px';
		tabletRules.push(`${selector} .ts-advanced-list { gap: ${attributes.itemGap_tablet}${unit}; }`);
	}
	if (attributes.itemGap_mobile !== undefined) {
		const unit = attributes.itemGapUnit || 'px';
		mobileRules.push(`${selector} .ts-advanced-list { gap: ${attributes.itemGap_mobile}${unit}; }`);
	}

	// Custom item width (responsive) - when not CSS grid and custom width selected
	if (!attributes.enableCssGrid && attributes.itemWidth === 'custom') {
		if (attributes.customItemWidth !== undefined) {
			const unit = attributes.customItemWidthUnit || 'px';
			cssRules.push(`${selector} .ts-action { width: ${attributes.customItemWidth}${unit}; }`);
		}
		if (attributes.customItemWidth_tablet !== undefined) {
			const unit = attributes.customItemWidthUnit || 'px';
			tabletRules.push(`${selector} .ts-action { width: ${attributes.customItemWidth_tablet}${unit}; }`);
		}
		if (attributes.customItemWidth_mobile !== undefined) {
			const unit = attributes.customItemWidthUnit || 'px';
			mobileRules.push(`${selector} .ts-action { width: ${attributes.customItemWidth_mobile}${unit}; }`);
		}
	}

	// ============================================
	// LIST ITEM STYLES - NORMAL STATE
	// Source: advanced-list.php - List item accordion
	// ============================================

	// Justify content (responsive)
	if (attributes.itemJustifyContent) {
		cssRules.push(`${selector} .ts-action-con { justify-content: ${attributes.itemJustifyContent}; }`);
	}
	if (attributes.itemJustifyContent_tablet) {
		tabletRules.push(`${selector} .ts-action-con { justify-content: ${attributes.itemJustifyContent_tablet}; }`);
	}
	if (attributes.itemJustifyContent_mobile) {
		mobileRules.push(`${selector} .ts-action-con { justify-content: ${attributes.itemJustifyContent_mobile}; }`);
	}

	// Item padding (responsive)
	const padding = attributes.itemPadding;
	if (padding && (padding.top || padding.right || padding.bottom || padding.left)) {
		const unit = attributes.itemPaddingUnit || 'px';
		const top = parseDimension(padding.top);
		const right = parseDimension(padding.right);
		const bottom = parseDimension(padding.bottom);
		const left = parseDimension(padding.left);
		cssRules.push(`${selector} .ts-action-con { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemPadding_tablet) {
		const unit = attributes.itemPaddingUnit || 'px';
		const p = attributes.itemPadding_tablet;
		const top = parseDimension(p.top);
		const right = parseDimension(p.right);
		const bottom = parseDimension(p.bottom);
		const left = parseDimension(p.left);
		tabletRules.push(`${selector} .ts-action-con { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemPadding_mobile) {
		const unit = attributes.itemPaddingUnit || 'px';
		const p = attributes.itemPadding_mobile;
		const top = parseDimension(p.top);
		const right = parseDimension(p.right);
		const bottom = parseDimension(p.bottom);
		const left = parseDimension(p.left);
		mobileRules.push(`${selector} .ts-action-con { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}

	// Item height (responsive)
	if (attributes.itemHeight !== undefined) {
		const unit = attributes.itemHeightUnit || 'px';
		cssRules.push(`${selector} .ts-action-con { min-height: ${attributes.itemHeight}${unit}; }`);
	}
	if (attributes.itemHeight_tablet !== undefined) {
		const unit = attributes.itemHeightUnit || 'px';
		tabletRules.push(`${selector} .ts-action-con { min-height: ${attributes.itemHeight_tablet}${unit}; }`);
	}
	if (attributes.itemHeight_mobile !== undefined) {
		const unit = attributes.itemHeightUnit || 'px';
		mobileRules.push(`${selector} .ts-action-con { min-height: ${attributes.itemHeight_mobile}${unit}; }`);
	}

	// Border type
	if (attributes.itemBorderType && attributes.itemBorderType !== 'none') {
		cssRules.push(`${selector} .ts-action-con { border-style: ${attributes.itemBorderType}; }`);

		// Border width
		const borderWidth = attributes.itemBorderWidth;
		if (borderWidth) {
			const unit = attributes.itemBorderWidthUnit || 'px';
			const top = parseDimension(borderWidth.top) || 1;
			const right = parseDimension(borderWidth.right) || 1;
			const bottom = parseDimension(borderWidth.bottom) || 1;
			const left = parseDimension(borderWidth.left) || 1;
			cssRules.push(`${selector} .ts-action-con { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
		}

		// Border color
		if (attributes.itemBorderColor) {
			cssRules.push(`${selector} .ts-action-con { border-color: ${attributes.itemBorderColor}; }`);
		}
	}

	// Border radius (responsive)
	if (attributes.itemBorderRadius !== undefined) {
		const unit = attributes.itemBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-action-con { border-radius: ${attributes.itemBorderRadius}${unit}; }`);
	}
	if (attributes.itemBorderRadius_tablet !== undefined) {
		const unit = attributes.itemBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-action-con { border-radius: ${attributes.itemBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.itemBorderRadius_mobile !== undefined) {
		const unit = attributes.itemBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-action-con { border-radius: ${attributes.itemBorderRadius_mobile}${unit}; }`);
	}

	// Box shadow
	if (hasBoxShadow(attributes.itemBoxShadow)) {
		const shadow = generateBoxShadowCSS(attributes.itemBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-con { box-shadow: ${shadow}; }`);
		}
	}

	// Typography
	if (hasTypography(attributes.itemTypography)) {
		const typo = generateTypographyCSS(attributes.itemTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-action-con { ${typo} }`);
		}
	}

	// Text color
	if (attributes.itemTextColor) {
		cssRules.push(`${selector} .ts-action-con { color: ${attributes.itemTextColor}; }`);
	}

	// Background color
	if (attributes.itemBackgroundColor) {
		cssRules.push(`${selector} .ts-action-con { background-color: ${attributes.itemBackgroundColor}; }`);
	}

	// Icon on top (flex-direction)
	if (attributes.iconOnTop) {
		cssRules.push(`${selector} .ts-action-con { flex-direction: column; }`);
	}

	// ============================================
	// ICON CONTAINER STYLES
	// Source: advanced-list.php - Icon Container section
	// ============================================

	// Icon container background
	if (attributes.iconContainerBackground) {
		cssRules.push(`${selector} .ts-action-icon { background-color: ${attributes.iconContainerBackground}; }`);
	}

	// Icon container size (responsive)
	if (attributes.iconContainerSize !== undefined) {
		const unit = attributes.iconContainerSizeUnit || 'px';
		cssRules.push(`${selector} .ts-action-icon { width: ${attributes.iconContainerSize}${unit}; height: ${attributes.iconContainerSize}${unit}; min-width: ${attributes.iconContainerSize}${unit}; }`);
	}
	if (attributes.iconContainerSize_tablet !== undefined) {
		const unit = attributes.iconContainerSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-action-icon { width: ${attributes.iconContainerSize_tablet}${unit}; height: ${attributes.iconContainerSize_tablet}${unit}; min-width: ${attributes.iconContainerSize_tablet}${unit}; }`);
	}
	if (attributes.iconContainerSize_mobile !== undefined) {
		const unit = attributes.iconContainerSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-action-icon { width: ${attributes.iconContainerSize_mobile}${unit}; height: ${attributes.iconContainerSize_mobile}${unit}; min-width: ${attributes.iconContainerSize_mobile}${unit}; }`);
	}

	// Icon container border type
	if (attributes.iconContainerBorderType && attributes.iconContainerBorderType !== 'none') {
		cssRules.push(`${selector} .ts-action-icon { border-style: ${attributes.iconContainerBorderType}; }`);

		// Border width
		const borderWidth = attributes.iconContainerBorderWidth;
		if (borderWidth) {
			const unit = attributes.iconContainerBorderWidthUnit || 'px';
			const top = parseDimension(borderWidth.top) || 1;
			const right = parseDimension(borderWidth.right) || 1;
			const bottom = parseDimension(borderWidth.bottom) || 1;
			const left = parseDimension(borderWidth.left) || 1;
			cssRules.push(`${selector} .ts-action-icon { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
		}

		// Border color
		if (attributes.iconContainerBorderColor) {
			cssRules.push(`${selector} .ts-action-icon { border-color: ${attributes.iconContainerBorderColor}; }`);
		}
	}

	// Icon container border radius (responsive)
	if (attributes.iconContainerBorderRadius !== undefined) {
		const unit = attributes.iconContainerBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-action-icon { border-radius: ${attributes.iconContainerBorderRadius}${unit}; }`);
	}
	if (attributes.iconContainerBorderRadius_tablet !== undefined) {
		const unit = attributes.iconContainerBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-action-icon { border-radius: ${attributes.iconContainerBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.iconContainerBorderRadius_mobile !== undefined) {
		const unit = attributes.iconContainerBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-action-icon { border-radius: ${attributes.iconContainerBorderRadius_mobile}${unit}; }`);
	}

	// Icon container box shadow
	if (hasBoxShadow(attributes.iconContainerBoxShadow)) {
		const shadow = generateBoxShadowCSS(attributes.iconContainerBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-icon { box-shadow: ${shadow}; }`);
		}
	}

	// Icon/text spacing (responsive)
	if (attributes.iconTextSpacing !== undefined) {
		const unit = attributes.iconTextSpacingUnit || 'px';
		cssRules.push(`${selector} .ts-action-con { gap: ${attributes.iconTextSpacing}${unit}; }`);
	}
	if (attributes.iconTextSpacing_tablet !== undefined) {
		const unit = attributes.iconTextSpacingUnit || 'px';
		tabletRules.push(`${selector} .ts-action-con { gap: ${attributes.iconTextSpacing_tablet}${unit}; }`);
	}
	if (attributes.iconTextSpacing_mobile !== undefined) {
		const unit = attributes.iconTextSpacingUnit || 'px';
		mobileRules.push(`${selector} .ts-action-con { gap: ${attributes.iconTextSpacing_mobile}${unit}; }`);
	}

	// ============================================
	// ICON STYLES
	// Source: advanced-list.php - Icon section
	// ============================================

	// Icon size (responsive)
	if (attributes.iconSize !== undefined) {
		const unit = attributes.iconSizeUnit || 'px';
		cssRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { width: ${attributes.iconSize}${unit}; height: ${attributes.iconSize}${unit}; font-size: ${attributes.iconSize}${unit}; }`);
		cssRules.push(`${selector} .ts-action-icon { --ts-icon-size: ${attributes.iconSize}${unit}; }`);
	}
	if (attributes.iconSize_tablet !== undefined) {
		const unit = attributes.iconSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { width: ${attributes.iconSize_tablet}${unit}; height: ${attributes.iconSize_tablet}${unit}; font-size: ${attributes.iconSize_tablet}${unit}; }`);
		tabletRules.push(`${selector} .ts-action-icon { --ts-icon-size: ${attributes.iconSize_tablet}${unit}; }`);
	}
	if (attributes.iconSize_mobile !== undefined) {
		const unit = attributes.iconSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { width: ${attributes.iconSize_mobile}${unit}; height: ${attributes.iconSize_mobile}${unit}; font-size: ${attributes.iconSize_mobile}${unit}; }`);
		mobileRules.push(`${selector} .ts-action-icon { --ts-icon-size: ${attributes.iconSize_mobile}${unit}; }`);
	}

	// Icon color
	if (attributes.iconColor) {
		cssRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { color: ${attributes.iconColor}; fill: ${attributes.iconColor}; }`);
		cssRules.push(`${selector} .ts-action-icon { --ts-icon-color: ${attributes.iconColor}; }`);
	}

	// ============================================
	// LIST ITEM STYLES - HOVER STATE
	// Source: advanced-list.php - List item Hover tab
	// ============================================

	// Border color hover
	if (attributes.itemBorderColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover { border-color: ${attributes.itemBorderColorHover}; }`);
	}

	// Box shadow hover
	if (hasBoxShadow(attributes.itemBoxShadowHover)) {
		const shadow = generateBoxShadowCSS(attributes.itemBoxShadowHover);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-con:hover { box-shadow: ${shadow}; }`);
		}
	}

	// Background color hover
	if (attributes.itemBackgroundColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover { background-color: ${attributes.itemBackgroundColorHover}; }`);
	}

	// Text color hover
	if (attributes.itemTextColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover { color: ${attributes.itemTextColorHover}; }`);
	}

	// Margin (Deprecated) - but supported
	const margin = attributes.itemMargin;
	if (margin && (margin.top || margin.right || margin.bottom || margin.left)) {
		const unit = attributes.itemMarginUnit || 'px';
		const top = parseDimension(margin.top);
		const right = parseDimension(margin.right);
		const bottom = parseDimension(margin.bottom);
		const left = parseDimension(margin.left);
		cssRules.push(`${selector} .ts-action { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemMargin_tablet) {
		const unit = attributes.itemMarginUnit || 'px';
		const m = attributes.itemMargin_tablet;
		const top = parseDimension(m.top);
		const right = parseDimension(m.right);
		const bottom = parseDimension(m.bottom);
		const left = parseDimension(m.left);
		tabletRules.push(`${selector} .ts-action { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemMargin_mobile) {
		const unit = attributes.itemMarginUnit || 'px';
		const m = attributes.itemMargin_mobile;
		const top = parseDimension(m.top);
		const right = parseDimension(m.right);
		const bottom = parseDimension(m.bottom);
		const left = parseDimension(m.left);
		mobileRules.push(`${selector} .ts-action { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}

	// Icon container background hover
	if (attributes.iconContainerBackgroundHover) {
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon { background-color: ${attributes.iconContainerBackgroundHover}; }`);
	}

	// Icon container border color hover
	if (attributes.iconContainerBorderColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon { border-color: ${attributes.iconContainerBorderColorHover}; }`);
	}

	// Icon color hover
	if (attributes.iconColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon svg, ${selector} .ts-action-con:hover .ts-action-icon i { color: ${attributes.iconColorHover}; fill: ${attributes.iconColorHover}; }`);
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon { --ts-icon-color: ${attributes.iconColorHover}; }`);
	}

	// ============================================
	// LIST ITEM STYLES - ACTIVE STATE
	// Source: advanced-list.php - List item Active tab
	// ============================================

	// Border color active
	if (attributes.itemBorderColorActive) {
		cssRules.push(`${selector} .ts-action-con.active { border-color: ${attributes.itemBorderColorActive}; }`);
	}

	// Box shadow active
	if (hasBoxShadow(attributes.itemBoxShadowActive)) {
		const shadow = generateBoxShadowCSS(attributes.itemBoxShadowActive);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-con.active { box-shadow: ${shadow}; }`);
		}
	}

	// Background color active
	if (attributes.itemBackgroundColorActive) {
		cssRules.push(`${selector} .ts-action-con.active { background-color: ${attributes.itemBackgroundColorActive}; }`);
	}

	// Text color active
	if (attributes.itemTextColorActive) {
		cssRules.push(`${selector} .ts-action-con.active { color: ${attributes.itemTextColorActive}; }`);
	}

	// Icon container background active
	if (attributes.iconContainerBackgroundActive) {
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon { background-color: ${attributes.iconContainerBackgroundActive}; }`);
	}

	// Icon container border color active
	if (attributes.iconContainerBorderColorActive) {
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon { border-color: ${attributes.iconContainerBorderColorActive}; }`);
	}

	// Icon color active
	if (attributes.iconColorActive) {
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon svg, ${selector} .ts-action-con.active .ts-action-icon i { color: ${attributes.iconColorActive}; fill: ${attributes.iconColorActive}; }`);
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon { --ts-icon-color: ${attributes.iconColorActive}; }`);
	}

	// ============================================
	// TOOLTIP STYLES
	// Source: advanced-list.php - Tooltips accordion
	// ============================================

	// Tooltip position (bottom) — Source: advanced-list.php:1103-1104
	if (attributes.tooltipBottom) {
		cssRules.push(`${selector} .ts-action::after { top: calc(100% + 5px); bottom: auto; }`);
	}

	// Tooltip text color — Source: advanced-list.php:1116
	if (attributes.tooltipTextColor) {
		cssRules.push(`${selector} .ts-action::after { color: ${attributes.tooltipTextColor}; }`);
	}

	// Tooltip typography — Source: advanced-list.php:1126
	if (hasTypography(attributes.tooltipTypography)) {
		const typo = generateTypographyCSS(attributes.tooltipTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-action::after { ${typo} }`);
		}
	}

	// Tooltip background color — Source: advanced-list.php:1135
	if (attributes.tooltipBackgroundColor) {
		cssRules.push(`${selector} .ts-action::after { background-color: ${attributes.tooltipBackgroundColor}; }`);
	}

	// Tooltip border radius (responsive) — Source: advanced-list.php:1158
	if (attributes.tooltipBorderRadius !== undefined) {
		const unit = attributes.tooltipBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-action::after { border-radius: ${attributes.tooltipBorderRadius}${unit}; }`);
	}
	if (attributes.tooltipBorderRadius_tablet !== undefined) {
		const unit = attributes.tooltipBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-action::after { border-radius: ${attributes.tooltipBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.tooltipBorderRadius_mobile !== undefined) {
		const unit = attributes.tooltipBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-action::after { border-radius: ${attributes.tooltipBorderRadius_mobile}${unit}; }`);
	}

	// ============================================
	// COMBINE ALL RULES
	// ============================================

	let css = cssRules.join('\n');

	if (tabletRules.length > 0) {
		css += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	if (mobileRules.length > 0) {
		css += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return css;
}

/**
 * Generate inline styles for React components (edit.tsx use)
 * These are basic styles that don't require pseudo-selectors
 */
export function generateBlockStyles(_attributes: AdvancedListAttributes): React.CSSProperties {
	// Most styles are handled via CSS generation above
	// This function returns basic container styles for the editor wrapper
	return {};
}
