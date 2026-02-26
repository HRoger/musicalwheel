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
	// Apply block.json defaults for attributes used in CSS generation.
	// When user resets an attribute, it becomes undefined. On reload,
	// block.json defaults are re-applied. We must produce identical CSS
	// in both cases to prevent WordPress block validation errors.
	const a = {
		...attributes,
		enableCssGrid: attributes.enableCssGrid ?? false,
		gridColumns: attributes.gridColumns ?? 3,
		itemWidth: attributes.itemWidth ?? 'auto',
		customItemWidth: attributes.customItemWidth ?? 100,
		customItemWidthUnit: attributes.customItemWidthUnit ?? 'px',
		listJustify: attributes.listJustify ?? 'left',
		itemGap: attributes.itemGap ?? 10,
		itemGapUnit: attributes.itemGapUnit ?? 'px',
		itemJustifyContent: attributes.itemJustifyContent ?? 'flex-start',
		itemPadding: attributes.itemPadding ?? { top: '', right: '', bottom: '', left: '' },
		itemPaddingUnit: attributes.itemPaddingUnit ?? 'px',
		itemHeight: attributes.itemHeight ?? 48,
		itemHeightUnit: attributes.itemHeightUnit ?? 'px',
		itemBorderType: attributes.itemBorderType ?? 'none',
		itemBorderWidth: attributes.itemBorderWidth ?? { top: '1', right: '1', bottom: '1', left: '1' },
		itemBorderWidthUnit: attributes.itemBorderWidthUnit ?? 'px',
		itemBorderColor: attributes.itemBorderColor ?? '',
		itemBorderRadius: attributes.itemBorderRadius ?? 0,
		itemBorderRadiusUnit: attributes.itemBorderRadiusUnit ?? 'px',
		itemBoxShadow: attributes.itemBoxShadow ?? { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' },
		itemTypography: attributes.itemTypography ?? {},
		itemTextColor: attributes.itemTextColor ?? '',
		itemBackgroundColor: attributes.itemBackgroundColor ?? '',
		itemMargin: attributes.itemMargin ?? {},
		itemMarginUnit: attributes.itemMarginUnit ?? 'px',
		iconContainerBackground: attributes.iconContainerBackground ?? '',
		iconContainerSize: attributes.iconContainerSize ?? 36,
		iconContainerSizeUnit: attributes.iconContainerSizeUnit ?? 'px',
		iconContainerBorderType: attributes.iconContainerBorderType ?? '',
		iconContainerBorderWidth: attributes.iconContainerBorderWidth ?? {},
		iconContainerBorderWidthUnit: attributes.iconContainerBorderWidthUnit ?? 'px',
		iconContainerBorderColor: attributes.iconContainerBorderColor ?? '',
		iconContainerBorderRadius: attributes.iconContainerBorderRadius ?? 50,
		iconContainerBorderRadiusUnit: attributes.iconContainerBorderRadiusUnit ?? 'px',
		iconContainerBoxShadow: attributes.iconContainerBoxShadow ?? { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' },
		iconTextSpacing: attributes.iconTextSpacing ?? 0,
		iconTextSpacingUnit: attributes.iconTextSpacingUnit ?? 'px',
		iconOnTop: attributes.iconOnTop ?? false,
		iconSize: attributes.iconSize ?? 18,
		iconSizeUnit: attributes.iconSizeUnit ?? 'px',
		iconColor: attributes.iconColor ?? '',
		itemBoxShadowHover: attributes.itemBoxShadowHover ?? { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' },
		itemBorderColorHover: attributes.itemBorderColorHover ?? '',
		itemTextColorHover: attributes.itemTextColorHover ?? '',
		itemBackgroundColorHover: attributes.itemBackgroundColorHover ?? '',
		iconContainerBackgroundHover: attributes.iconContainerBackgroundHover ?? '',
		iconContainerBorderColorHover: attributes.iconContainerBorderColorHover ?? '',
		iconColorHover: attributes.iconColorHover ?? '',
		itemBoxShadowActive: attributes.itemBoxShadowActive ?? { horizontal: 0, vertical: 0, blur: 0, spread: 0, color: 'rgba(0,0,0,0.1)' },
		itemTextColorActive: attributes.itemTextColorActive ?? '',
		itemBackgroundColorActive: attributes.itemBackgroundColorActive ?? '',
		itemBorderColorActive: attributes.itemBorderColorActive ?? '',
		iconContainerBackgroundActive: attributes.iconContainerBackgroundActive ?? '',
		iconContainerBorderColorActive: attributes.iconContainerBorderColorActive ?? '',
		iconColorActive: attributes.iconColorActive ?? '',
		tooltipBottom: attributes.tooltipBottom ?? false,
		tooltipTextColor: attributes.tooltipTextColor ?? '',
		tooltipTypography: attributes.tooltipTypography ?? {},
		tooltipBackgroundColor: attributes.tooltipBackgroundColor ?? '',
		tooltipBorderRadius: attributes.tooltipBorderRadius ?? 0,
		tooltipBorderRadiusUnit: attributes.tooltipBorderRadiusUnit ?? 'px',
	};

	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-advanced-list-${blockId}`;

	// ============================================
	// LIST CONTAINER STYLES
	// Source: advanced-list.php - List accordion
	// ============================================

	// CSS Grid columns (responsive)
	if (a.enableCssGrid && a.gridColumns) {
		cssRules.push(`${selector} .ts-advanced-list { display: grid; grid-template-columns: repeat(${a.gridColumns}, minmax(0, 1fr)); }`);
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
	if (!a.enableCssGrid && a.listJustify) {
		cssRules.push(`${selector} .ts-advanced-list { justify-content: ${a.listJustify}; }`);
	}

	// Tablet justify: Use tablet override OR fallback to desktop IF grid is disabled on tablet
	const isGridTablet = attributes.enableCssGrid_tablet ?? a.enableCssGrid;
	if (!isGridTablet) {
		const justifyTablet = attributes.listJustify_tablet ?? a.listJustify;
		if (justifyTablet) {
			tabletRules.push(`${selector} .ts-advanced-list { justify-content: ${justifyTablet}; }`);
		}
	}

	// Mobile justify
	const isGridMobile = attributes.enableCssGrid_mobile ?? attributes.enableCssGrid_tablet ?? a.enableCssGrid;
	if (!isGridMobile) {
		const justifyMobile = attributes.listJustify_mobile ?? attributes.listJustify_tablet ?? a.listJustify;
		if (justifyMobile) {
			mobileRules.push(`${selector} .ts-advanced-list { justify-content: ${justifyMobile}; }`);
		}
	}

	// Item gap (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.itemGapUnit || 'px';
		cssRules.push(`${selector} .ts-advanced-list { gap: ${a.itemGap}${unit}; }`);
	}
	if (attributes.itemGap_tablet !== undefined) {
		const unit = a.itemGapUnit || 'px';
		tabletRules.push(`${selector} .ts-advanced-list { gap: ${attributes.itemGap_tablet}${unit}; }`);
	}
	if (attributes.itemGap_mobile !== undefined) {
		const unit = a.itemGapUnit || 'px';
		mobileRules.push(`${selector} .ts-advanced-list { gap: ${attributes.itemGap_mobile}${unit}; }`);
	}

	// Custom item width (responsive) - when not CSS grid and custom width selected
	if (!a.enableCssGrid && a.itemWidth === 'custom') {
		{
			const unit = a.customItemWidthUnit || 'px';
			cssRules.push(`${selector} .ts-action { width: ${a.customItemWidth}${unit}; }`);
		}
		if (attributes.customItemWidth_tablet !== undefined) {
			const unit = a.customItemWidthUnit || 'px';
			tabletRules.push(`${selector} .ts-action { width: ${attributes.customItemWidth_tablet}${unit}; }`);
		}
		if (attributes.customItemWidth_mobile !== undefined) {
			const unit = a.customItemWidthUnit || 'px';
			mobileRules.push(`${selector} .ts-action { width: ${attributes.customItemWidth_mobile}${unit}; }`);
		}
	}

	// ============================================
	// LIST ITEM STYLES - NORMAL STATE
	// Source: advanced-list.php - List item accordion
	// ============================================

	// Justify content (responsive)
	if (a.itemJustifyContent) {
		cssRules.push(`${selector} .ts-action-con { justify-content: ${a.itemJustifyContent}; }`);
	}
	if (attributes.itemJustifyContent_tablet) {
		tabletRules.push(`${selector} .ts-action-con { justify-content: ${attributes.itemJustifyContent_tablet}; }`);
	}
	if (attributes.itemJustifyContent_mobile) {
		mobileRules.push(`${selector} .ts-action-con { justify-content: ${attributes.itemJustifyContent_mobile}; }`);
	}

	// Item padding (responsive)
	const padding = a.itemPadding;
	if (padding && (padding.top || padding.right || padding.bottom || padding.left)) {
		const unit = a.itemPaddingUnit || 'px';
		const top = parseDimension(padding.top);
		const right = parseDimension(padding.right);
		const bottom = parseDimension(padding.bottom);
		const left = parseDimension(padding.left);
		cssRules.push(`${selector} .ts-action-con { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemPadding_tablet) {
		const unit = a.itemPaddingUnit || 'px';
		const p = attributes.itemPadding_tablet;
		const top = parseDimension(p.top);
		const right = parseDimension(p.right);
		const bottom = parseDimension(p.bottom);
		const left = parseDimension(p.left);
		tabletRules.push(`${selector} .ts-action-con { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemPadding_mobile) {
		const unit = a.itemPaddingUnit || 'px';
		const p = attributes.itemPadding_mobile;
		const top = parseDimension(p.top);
		const right = parseDimension(p.right);
		const bottom = parseDimension(p.bottom);
		const left = parseDimension(p.left);
		mobileRules.push(`${selector} .ts-action-con { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}

	// Item height (responsive) — always emit desktop (defaulted via `a`)
	// Voxel uses `height:` not `min-height:` (advanced-list.php:590)
	{
		const unit = a.itemHeightUnit || 'px';
		cssRules.push(`${selector} .ts-action-con { height: ${a.itemHeight}${unit}; }`);
	}
	if (attributes.itemHeight_tablet !== undefined) {
		const unit = a.itemHeightUnit || 'px';
		tabletRules.push(`${selector} .ts-action-con { height: ${attributes.itemHeight_tablet}${unit}; }`);
	}
	if (attributes.itemHeight_mobile !== undefined) {
		const unit = a.itemHeightUnit || 'px';
		mobileRules.push(`${selector} .ts-action-con { height: ${attributes.itemHeight_mobile}${unit}; }`);
	}

	// Border type
	if (a.itemBorderType && a.itemBorderType !== 'none') {
		cssRules.push(`${selector} .ts-action-con { border-style: ${a.itemBorderType}; }`);

		// Border width
		const borderWidth = a.itemBorderWidth;
		if (borderWidth) {
			const unit = a.itemBorderWidthUnit || 'px';
			const top = parseDimension(borderWidth.top) || 1;
			const right = parseDimension(borderWidth.right) || 1;
			const bottom = parseDimension(borderWidth.bottom) || 1;
			const left = parseDimension(borderWidth.left) || 1;
			cssRules.push(`${selector} .ts-action-con { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
		}

		// Border color
		if (a.itemBorderColor) {
			cssRules.push(`${selector} .ts-action-con { border-color: ${a.itemBorderColor}; }`);
		}
	}

	// Border radius (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.itemBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-action-con { border-radius: ${a.itemBorderRadius}${unit}; }`);
	}
	if (attributes.itemBorderRadius_tablet !== undefined) {
		const unit = a.itemBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-action-con { border-radius: ${attributes.itemBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.itemBorderRadius_mobile !== undefined) {
		const unit = a.itemBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-action-con { border-radius: ${attributes.itemBorderRadius_mobile}${unit}; }`);
	}

	// Box shadow
	if (hasBoxShadow(a.itemBoxShadow)) {
		const shadow = generateBoxShadowCSS(a.itemBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-con { box-shadow: ${shadow}; }`);
		}
	}

	// Typography
	if (hasTypography(a.itemTypography)) {
		const typo = generateTypographyCSS(a.itemTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-action-con { ${typo} }`);
		}
	}

	// Text color
	if (a.itemTextColor) {
		cssRules.push(`${selector} .ts-action-con { color: ${a.itemTextColor}; }`);
	}

	// Background color
	if (a.itemBackgroundColor) {
		cssRules.push(`${selector} .ts-action-con { background-color: ${a.itemBackgroundColor}; }`);
	}

	// Icon on top (flex-direction)
	if (a.iconOnTop) {
		cssRules.push(`${selector} .ts-action-con { flex-direction: column; }`);
	}

	// ============================================
	// ICON CONTAINER STYLES
	// Source: advanced-list.php - Icon Container section
	// ============================================

	// Icon container background
	if (a.iconContainerBackground) {
		cssRules.push(`${selector} .ts-action-icon { background-color: ${a.iconContainerBackground}; }`);
	}

	// Icon container size (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.iconContainerSizeUnit || 'px';
		cssRules.push(`${selector} .ts-action-icon { width: ${a.iconContainerSize}${unit}; height: ${a.iconContainerSize}${unit}; min-width: ${a.iconContainerSize}${unit}; }`);
	}
	if (attributes.iconContainerSize_tablet !== undefined) {
		const unit = a.iconContainerSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-action-icon { width: ${attributes.iconContainerSize_tablet}${unit}; height: ${attributes.iconContainerSize_tablet}${unit}; min-width: ${attributes.iconContainerSize_tablet}${unit}; }`);
	}
	if (attributes.iconContainerSize_mobile !== undefined) {
		const unit = a.iconContainerSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-action-icon { width: ${attributes.iconContainerSize_mobile}${unit}; height: ${attributes.iconContainerSize_mobile}${unit}; min-width: ${attributes.iconContainerSize_mobile}${unit}; }`);
	}

	// Icon container border type
	if (a.iconContainerBorderType && a.iconContainerBorderType !== 'none') {
		cssRules.push(`${selector} .ts-action-icon { border-style: ${a.iconContainerBorderType}; }`);

		// Border width
		const borderWidth = a.iconContainerBorderWidth;
		if (borderWidth) {
			const unit = a.iconContainerBorderWidthUnit || 'px';
			const top = parseDimension(borderWidth.top) || 1;
			const right = parseDimension(borderWidth.right) || 1;
			const bottom = parseDimension(borderWidth.bottom) || 1;
			const left = parseDimension(borderWidth.left) || 1;
			cssRules.push(`${selector} .ts-action-icon { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
		}

		// Border color
		if (a.iconContainerBorderColor) {
			cssRules.push(`${selector} .ts-action-icon { border-color: ${a.iconContainerBorderColor}; }`);
		}
	}

	// Icon container border radius (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.iconContainerBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-action-icon { border-radius: ${a.iconContainerBorderRadius}${unit}; }`);
	}
	if (attributes.iconContainerBorderRadius_tablet !== undefined) {
		const unit = a.iconContainerBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-action-icon { border-radius: ${attributes.iconContainerBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.iconContainerBorderRadius_mobile !== undefined) {
		const unit = a.iconContainerBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-action-icon { border-radius: ${attributes.iconContainerBorderRadius_mobile}${unit}; }`);
	}

	// Icon container box shadow
	if (hasBoxShadow(a.iconContainerBoxShadow)) {
		const shadow = generateBoxShadowCSS(a.iconContainerBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-icon { box-shadow: ${shadow}; }`);
		}
	}

	// Icon/text spacing (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.iconTextSpacingUnit || 'px';
		cssRules.push(`${selector} .ts-action-con { gap: ${a.iconTextSpacing}${unit}; }`);
	}
	if (attributes.iconTextSpacing_tablet !== undefined) {
		const unit = a.iconTextSpacingUnit || 'px';
		tabletRules.push(`${selector} .ts-action-con { gap: ${attributes.iconTextSpacing_tablet}${unit}; }`);
	}
	if (attributes.iconTextSpacing_mobile !== undefined) {
		const unit = a.iconTextSpacingUnit || 'px';
		mobileRules.push(`${selector} .ts-action-con { gap: ${attributes.iconTextSpacing_mobile}${unit}; }`);
	}

	// ============================================
	// ICON STYLES
	// Source: advanced-list.php - Icon section
	// ============================================

	// Icon size (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.iconSizeUnit || 'px';
		cssRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { width: ${a.iconSize}${unit}; height: ${a.iconSize}${unit}; font-size: ${a.iconSize}${unit}; }`);
		cssRules.push(`${selector} .ts-action-icon { --ts-icon-size: ${a.iconSize}${unit}; }`);
	}
	if (attributes.iconSize_tablet !== undefined) {
		const unit = a.iconSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { width: ${attributes.iconSize_tablet}${unit}; height: ${attributes.iconSize_tablet}${unit}; font-size: ${attributes.iconSize_tablet}${unit}; }`);
		tabletRules.push(`${selector} .ts-action-icon { --ts-icon-size: ${attributes.iconSize_tablet}${unit}; }`);
	}
	if (attributes.iconSize_mobile !== undefined) {
		const unit = a.iconSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { width: ${attributes.iconSize_mobile}${unit}; height: ${attributes.iconSize_mobile}${unit}; font-size: ${attributes.iconSize_mobile}${unit}; }`);
		mobileRules.push(`${selector} .ts-action-icon { --ts-icon-size: ${attributes.iconSize_mobile}${unit}; }`);
	}

	// Icon color
	if (a.iconColor) {
		cssRules.push(`${selector} .ts-action-icon svg, ${selector} .ts-action-icon i { color: ${a.iconColor}; fill: ${a.iconColor}; }`);
		cssRules.push(`${selector} .ts-action-icon { --ts-icon-color: ${a.iconColor}; }`);
	}

	// ============================================
	// LIST ITEM STYLES - HOVER STATE
	// Source: advanced-list.php - List item Hover tab
	// ============================================

	// Border color hover
	if (a.itemBorderColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover { border-color: ${a.itemBorderColorHover}; }`);
	}

	// Box shadow hover
	if (hasBoxShadow(a.itemBoxShadowHover)) {
		const shadow = generateBoxShadowCSS(a.itemBoxShadowHover);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-con:hover { box-shadow: ${shadow}; }`);
		}
	}

	// Background color hover
	if (a.itemBackgroundColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover { background-color: ${a.itemBackgroundColorHover}; }`);
	}

	// Text color hover
	if (a.itemTextColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover { color: ${a.itemTextColorHover}; }`);
	}

	// Margin (Deprecated) - but supported
	const margin = a.itemMargin;
	if (margin && (margin.top || margin.right || margin.bottom || margin.left)) {
		const unit = a.itemMarginUnit || 'px';
		const top = parseDimension(margin.top);
		const right = parseDimension(margin.right);
		const bottom = parseDimension(margin.bottom);
		const left = parseDimension(margin.left);
		cssRules.push(`${selector} .ts-action { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemMargin_tablet) {
		const unit = a.itemMarginUnit || 'px';
		const m = attributes.itemMargin_tablet;
		const top = parseDimension(m.top);
		const right = parseDimension(m.right);
		const bottom = parseDimension(m.bottom);
		const left = parseDimension(m.left);
		tabletRules.push(`${selector} .ts-action { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}
	if (attributes.itemMargin_mobile) {
		const unit = a.itemMarginUnit || 'px';
		const m = attributes.itemMargin_mobile;
		const top = parseDimension(m.top);
		const right = parseDimension(m.right);
		const bottom = parseDimension(m.bottom);
		const left = parseDimension(m.left);
		mobileRules.push(`${selector} .ts-action { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`);
	}

	// Icon container background hover
	if (a.iconContainerBackgroundHover) {
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon { background-color: ${a.iconContainerBackgroundHover}; }`);
	}

	// Icon container border color hover
	if (a.iconContainerBorderColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon { border-color: ${a.iconContainerBorderColorHover}; }`);
	}

	// Icon color hover
	if (a.iconColorHover) {
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon svg, ${selector} .ts-action-con:hover .ts-action-icon i { color: ${a.iconColorHover}; fill: ${a.iconColorHover}; }`);
		cssRules.push(`${selector} .ts-action-con:hover .ts-action-icon { --ts-icon-color: ${a.iconColorHover}; }`);
	}

	// ============================================
	// LIST ITEM STYLES - ACTIVE STATE
	// Source: advanced-list.php - List item Active tab
	// ============================================

	// Border color active
	if (a.itemBorderColorActive) {
		cssRules.push(`${selector} .ts-action-con.active { border-color: ${a.itemBorderColorActive}; }`);
	}

	// Box shadow active
	if (hasBoxShadow(a.itemBoxShadowActive)) {
		const shadow = generateBoxShadowCSS(a.itemBoxShadowActive);
		if (shadow) {
			cssRules.push(`${selector} .ts-action-con.active { box-shadow: ${shadow}; }`);
		}
	}

	// Background color active
	if (a.itemBackgroundColorActive) {
		cssRules.push(`${selector} .ts-action-con.active { background-color: ${a.itemBackgroundColorActive}; }`);
	}

	// Text color active
	if (a.itemTextColorActive) {
		cssRules.push(`${selector} .ts-action-con.active { color: ${a.itemTextColorActive}; }`);
	}

	// Icon container background active
	if (a.iconContainerBackgroundActive) {
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon { background-color: ${a.iconContainerBackgroundActive}; }`);
	}

	// Icon container border color active
	if (a.iconContainerBorderColorActive) {
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon { border-color: ${a.iconContainerBorderColorActive}; }`);
	}

	// Icon color active
	if (a.iconColorActive) {
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon svg, ${selector} .ts-action-con.active .ts-action-icon i { color: ${a.iconColorActive}; fill: ${a.iconColorActive}; }`);
		cssRules.push(`${selector} .ts-action-con.active .ts-action-icon { --ts-icon-color: ${a.iconColorActive}; }`);
	}

	// ============================================
	// TOOLTIP STYLES
	// Source: advanced-list.php - Tooltips accordion
	// ============================================

	// Tooltip position (bottom) — Source: advanced-list.php:1103-1104
	if (a.tooltipBottom) {
		cssRules.push(`${selector} .ts-action::after { top: calc(100% + 5px); bottom: auto; }`);
	}

	// Tooltip text color — Source: advanced-list.php:1116
	if (a.tooltipTextColor) {
		cssRules.push(`${selector} .ts-action::after { color: ${a.tooltipTextColor}; }`);
	}

	// Tooltip typography — Source: advanced-list.php:1126
	if (hasTypography(a.tooltipTypography)) {
		const typo = generateTypographyCSS(a.tooltipTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-action::after { ${typo} }`);
		}
	}

	// Tooltip background color — Source: advanced-list.php:1135
	if (a.tooltipBackgroundColor) {
		cssRules.push(`${selector} .ts-action::after { background-color: ${a.tooltipBackgroundColor}; }`);
	}

	// Tooltip border radius (responsive) — always emit desktop (defaulted via `a`)
	{
		const unit = a.tooltipBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-action::after { border-radius: ${a.tooltipBorderRadius}${unit}; }`);
	}
	if (attributes.tooltipBorderRadius_tablet !== undefined) {
		const unit = a.tooltipBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-action::after { border-radius: ${attributes.tooltipBorderRadius_tablet}${unit}; }`);
	}
	if (attributes.tooltipBorderRadius_mobile !== undefined) {
		const unit = a.tooltipBorderRadiusUnit || 'px';
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
