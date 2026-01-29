/**
 * Cart Summary Block - Style Generation
 *
 * Generates CSS from Style Tab inspector controls.
 * Targets Voxel CSS classes within a scoped block selector.
 *
 * Evidence: themes/voxel/app/widgets/cart-summary.php
 *
 * @package VoxelFSE
 */

import type { CartSummaryBlockAttributes, BoxValues, BoxShadowValue, TypographyValue } from './types';

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
		const unit = (typography as any).fontSizeUnit || 'px';
		rules.push(`font-size: ${typography.fontSize}${unit};`);
	}
	if (typography.fontWeight) {
		rules.push(`font-weight: ${typography.fontWeight};`);
	}
	if ((typography as any).fontStyle && (typography as any).fontStyle !== 'default') {
		rules.push(`font-style: ${(typography as any).fontStyle};`);
	}
	if ((typography as any).textDecoration && (typography as any).textDecoration !== 'none') {
		rules.push(`text-decoration: ${(typography as any).textDecoration};`);
	}
	if (typography.lineHeight !== undefined) {
		const unit = (typography as any).lineHeightUnit || '';
		rules.push(`line-height: ${typography.lineHeight}${unit};`);
	}
	if (typography.letterSpacing !== undefined) {
		const unit = (typography as any).letterSpacingUnit || 'px';
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
		((typography as any).fontStyle && (typography as any).fontStyle !== 'default') ||
		((typography as any).textDecoration && (typography as any).textDecoration !== 'none') ||
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
 * Generate border width CSS from BoxValues
 */
function generateBorderWidthCSS(borderWidth: BoxValues | undefined, unit: string = 'px'): string {
	if (!borderWidth) return '';
	const top = parseDimension(borderWidth.top) || 1;
	const right = parseDimension(borderWidth.right) || 1;
	const bottom = parseDimension(borderWidth.bottom) || 1;
	const left = parseDimension(borderWidth.left) || 1;
	return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
}

/**
 * Generate padding CSS from BoxValues
 */
function generatePaddingCSS(padding: BoxValues | undefined, unit: string = 'px'): string {
	if (!padding) return '';
	const top = parseDimension(padding.top);
	const right = parseDimension(padding.right);
	const bottom = parseDimension(padding.bottom);
	const left = parseDimension(padding.left);
	return `${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
}

/**
 * Generate CSS for Cart Summary block Style Tab controls
 *
 * @param attributes - Block attributes
 * @param blockId - Block ID for scoped selector
 * @returns CSS string
 */
export function generateCartSummaryStyles(
	attributes: CartSummaryBlockAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-cart-summary-${blockId}`;

	// ============================================
	// 1. GENERAL SECTION
	// Evidence: cart-summary.php:140-158
	// ============================================

	// Section spacing (grid-gap on .ts-checkout)
	if (attributes.sectionSpacing !== undefined && attributes.sectionSpacing !== null) {
		cssRules.push(`${selector} .ts-checkout { grid-gap: ${attributes.sectionSpacing}px; }`);
	}
	if (attributes.sectionSpacing_tablet !== undefined && attributes.sectionSpacing_tablet !== null) {
		tabletRules.push(`${selector} .ts-checkout { grid-gap: ${attributes.sectionSpacing_tablet}px; }`);
	}
	if (attributes.sectionSpacing_mobile !== undefined && attributes.sectionSpacing_mobile !== null) {
		mobileRules.push(`${selector} .ts-checkout { grid-gap: ${attributes.sectionSpacing_mobile}px; }`);
	}

	// Title typography (.ts-cart-head h1)
	if (hasTypography(attributes.titleTypography)) {
		const typo = generateTypographyCSS(attributes.titleTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-cart-head h1 { ${typo} }`);
		}
	}

	// Title color
	if (attributes.titleColor) {
		cssRules.push(`${selector} .ts-cart-head h1 { color: ${attributes.titleColor}; }`);
	}

	// Empty cart gap
	if (attributes.emptyCartGap !== undefined && attributes.emptyCartGap !== null) {
		cssRules.push(`${selector} .ts-empty-cart { gap: ${attributes.emptyCartGap}px; }`);
	}
	if (attributes.emptyCartGap_tablet !== undefined && attributes.emptyCartGap_tablet !== null) {
		tabletRules.push(`${selector} .ts-empty-cart { gap: ${attributes.emptyCartGap_tablet}px; }`);
	}
	if (attributes.emptyCartGap_mobile !== undefined && attributes.emptyCartGap_mobile !== null) {
		mobileRules.push(`${selector} .ts-empty-cart { gap: ${attributes.emptyCartGap_mobile}px; }`);
	}

	// Empty cart icon size
	if (attributes.emptyCartIconSize !== undefined && attributes.emptyCartIconSize !== null) {
		cssRules.push(`${selector} .ts-empty-cart i { font-size: ${attributes.emptyCartIconSize}px; }`);
	}
	if (attributes.emptyCartIconSize_tablet !== undefined && attributes.emptyCartIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-empty-cart i { font-size: ${attributes.emptyCartIconSize_tablet}px; }`);
	}
	if (attributes.emptyCartIconSize_mobile !== undefined && attributes.emptyCartIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-empty-cart i { font-size: ${attributes.emptyCartIconSize_mobile}px; }`);
	}

	// Empty cart icon color
	if (attributes.emptyCartIconColor) {
		cssRules.push(`${selector} .ts-empty-cart i { color: ${attributes.emptyCartIconColor}; }`);
	}

	// Empty cart typography
	if (hasTypography(attributes.emptyCartTypography)) {
		const typo = generateTypographyCSS(attributes.emptyCartTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-empty-cart p { ${typo} }`);
		}
	}

	// Empty cart text color
	if (attributes.emptyCartTextColor) {
		cssRules.push(`${selector} .ts-empty-cart p { color: ${attributes.emptyCartTextColor}; }`);
	}

	// ============================================
	// 2. PRIMARY BUTTON (ts-btn ts-btn-1)
	// ============================================

	// Typography
	if (hasTypography(attributes.primaryBtnTypography)) {
		const typo = generateTypographyCSS(attributes.primaryBtnTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-btn.ts-btn-1 { ${typo} }`);
		}
	}

	// Border
	if (attributes.primaryBtnBorderType && attributes.primaryBtnBorderType !== 'none') {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { border-style: ${attributes.primaryBtnBorderType}; }`);

		if (attributes.primaryBtnBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.primaryBtnBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} .ts-btn.ts-btn-1 { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.primaryBtnBorderColor) {
			cssRules.push(`${selector} .ts-btn.ts-btn-1 { border-color: ${attributes.primaryBtnBorderColor}; }`);
		}
	}

	// Border radius
	if (attributes.primaryBtnRadius !== undefined && attributes.primaryBtnRadius !== null) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { border-radius: ${attributes.primaryBtnRadius}px; }`);
	}
	if (attributes.primaryBtnRadius_tablet !== undefined && attributes.primaryBtnRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-1 { border-radius: ${attributes.primaryBtnRadius_tablet}px; }`);
	}
	if (attributes.primaryBtnRadius_mobile !== undefined && attributes.primaryBtnRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-1 { border-radius: ${attributes.primaryBtnRadius_mobile}px; }`);
	}

	// Box shadow
	if (hasBoxShadow(attributes.primaryBtnBoxShadow)) {
		const shadow = generateBoxShadowCSS(attributes.primaryBtnBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-btn.ts-btn-1 { box-shadow: ${shadow}; }`);
		}
	}

	// Text color
	if (attributes.primaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { color: ${attributes.primaryBtnTextColor}; }`);
	}

	// Background color
	if (attributes.primaryBtnBgColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { background-color: ${attributes.primaryBtnBgColor}; }`);
	}

	// Icon size
	if (attributes.primaryBtnIconSize !== undefined && attributes.primaryBtnIconSize !== null) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 i { font-size: ${attributes.primaryBtnIconSize}px; }`);
	}
	if (attributes.primaryBtnIconSize_tablet !== undefined && attributes.primaryBtnIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-1 i { font-size: ${attributes.primaryBtnIconSize_tablet}px; }`);
	}
	if (attributes.primaryBtnIconSize_mobile !== undefined && attributes.primaryBtnIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-1 i { font-size: ${attributes.primaryBtnIconSize_mobile}px; }`);
	}

	// Icon color
	if (attributes.primaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 i { color: ${attributes.primaryBtnIconColor}; }`);
	}

	// Icon spacing
	if (attributes.primaryBtnIconSpacing !== undefined && attributes.primaryBtnIconSpacing !== null) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { gap: ${attributes.primaryBtnIconSpacing}px; }`);
	}
	if (attributes.primaryBtnIconSpacing_tablet !== undefined && attributes.primaryBtnIconSpacing_tablet !== null) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-1 { gap: ${attributes.primaryBtnIconSpacing_tablet}px; }`);
	}
	if (attributes.primaryBtnIconSpacing_mobile !== undefined && attributes.primaryBtnIconSpacing_mobile !== null) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-1 { gap: ${attributes.primaryBtnIconSpacing_mobile}px; }`);
	}

	// Hover states
	if (attributes.primaryBtnTextColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { color: ${attributes.primaryBtnTextColorHover}; }`);
	}
	if (attributes.primaryBtnBgColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { background-color: ${attributes.primaryBtnBgColorHover}; }`);
	}
	if (attributes.primaryBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { border-color: ${attributes.primaryBtnBorderColorHover}; }`);
	}
	if (hasBoxShadow(attributes.primaryBtnBoxShadowHover)) {
		const shadow = generateBoxShadowCSS(attributes.primaryBtnBoxShadowHover);
		if (shadow) {
			cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { box-shadow: ${shadow}; }`);
		}
	}
	if (attributes.primaryBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover i { color: ${attributes.primaryBtnIconColorHover}; }`);
	}

	// ============================================
	// 3. SECONDARY BUTTON (ts-btn ts-btn-2)
	// ============================================

	// Typography
	if (hasTypography(attributes.secondaryBtnTypography)) {
		const typo = generateTypographyCSS(attributes.secondaryBtnTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-btn.ts-btn-2 { ${typo} }`);
		}
	}

	// Padding
	if (attributes.secondaryBtnPadding) {
		const padding = generatePaddingCSS(attributes.secondaryBtnPadding);
		if (padding) {
			cssRules.push(`${selector} .ts-btn.ts-btn-2 { padding: ${padding}; }`);
		}
	}
	if (attributes.secondaryBtnPadding_tablet) {
		const padding = generatePaddingCSS(attributes.secondaryBtnPadding_tablet);
		if (padding) {
			tabletRules.push(`${selector} .ts-btn.ts-btn-2 { padding: ${padding}; }`);
		}
	}
	if (attributes.secondaryBtnPadding_mobile) {
		const padding = generatePaddingCSS(attributes.secondaryBtnPadding_mobile);
		if (padding) {
			mobileRules.push(`${selector} .ts-btn.ts-btn-2 { padding: ${padding}; }`);
		}
	}

	// Border radius
	if (attributes.secondaryBtnRadius !== undefined && attributes.secondaryBtnRadius !== null) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { border-radius: ${attributes.secondaryBtnRadius}px; }`);
	}
	if (attributes.secondaryBtnRadius_tablet !== undefined && attributes.secondaryBtnRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-2 { border-radius: ${attributes.secondaryBtnRadius_tablet}px; }`);
	}
	if (attributes.secondaryBtnRadius_mobile !== undefined && attributes.secondaryBtnRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-2 { border-radius: ${attributes.secondaryBtnRadius_mobile}px; }`);
	}

	// Text color
	if (attributes.secondaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { color: ${attributes.secondaryBtnTextColor}; }`);
	}

	// Background color
	if (attributes.secondaryBtnBgColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { background-color: ${attributes.secondaryBtnBgColor}; }`);
	}

	// Border
	if (attributes.secondaryBtnBorderType && attributes.secondaryBtnBorderType !== 'none') {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { border-style: ${attributes.secondaryBtnBorderType}; }`);

		if (attributes.secondaryBtnBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.secondaryBtnBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} .ts-btn.ts-btn-2 { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.secondaryBtnBorderColor) {
			cssRules.push(`${selector} .ts-btn.ts-btn-2 { border-color: ${attributes.secondaryBtnBorderColor}; }`);
		}
	}

	// Icon size
	if (attributes.secondaryBtnIconSize !== undefined && attributes.secondaryBtnIconSize !== null) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 i { font-size: ${attributes.secondaryBtnIconSize}px; }`);
	}
	if (attributes.secondaryBtnIconSize_tablet !== undefined && attributes.secondaryBtnIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-2 i { font-size: ${attributes.secondaryBtnIconSize_tablet}px; }`);
	}
	if (attributes.secondaryBtnIconSize_mobile !== undefined && attributes.secondaryBtnIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-2 i { font-size: ${attributes.secondaryBtnIconSize_mobile}px; }`);
	}

	// Icon color
	if (attributes.secondaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 i { color: ${attributes.secondaryBtnIconColor}; }`);
	}

	// Icon spacing
	if (attributes.secondaryBtnIconSpacing !== undefined && attributes.secondaryBtnIconSpacing !== null) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { gap: ${attributes.secondaryBtnIconSpacing}px; }`);
	}
	if (attributes.secondaryBtnIconSpacing_tablet !== undefined && attributes.secondaryBtnIconSpacing_tablet !== null) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-2 { gap: ${attributes.secondaryBtnIconSpacing_tablet}px; }`);
	}
	if (attributes.secondaryBtnIconSpacing_mobile !== undefined && attributes.secondaryBtnIconSpacing_mobile !== null) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-2 { gap: ${attributes.secondaryBtnIconSpacing_mobile}px; }`);
	}

	// Hover states
	if (attributes.secondaryBtnTextColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover { color: ${attributes.secondaryBtnTextColorHover}; }`);
	}
	if (attributes.secondaryBtnBgColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover { background-color: ${attributes.secondaryBtnBgColorHover}; }`);
	}
	if (attributes.secondaryBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover { border-color: ${attributes.secondaryBtnBorderColorHover}; }`);
	}
	if (attributes.secondaryBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover i { color: ${attributes.secondaryBtnIconColorHover}; }`);
	}

	// ============================================
	// 4. LOADING
	// ============================================

	if (attributes.loaderColor1) {
		cssRules.push(`${selector} .ts-loader { border-top-color: ${attributes.loaderColor1}; }`);
	}
	if (attributes.loaderColor2) {
		cssRules.push(`${selector} .ts-loader { border-bottom-color: ${attributes.loaderColor2}; }`);
	}

	// ============================================
	// 5. RADIO/CHECKBOXES
	// ============================================

	if (attributes.checkboxBorderColor) {
		cssRules.push(`${selector} .container-checkbox .checkmark { border-color: ${attributes.checkboxBorderColor}; }`);
		cssRules.push(`${selector} .container-radio .checkmark { border-color: ${attributes.checkboxBorderColor}; }`);
	}

	if (attributes.checkboxSelectedBgColor) {
		cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark { background-color: ${attributes.checkboxSelectedBgColor}; }`);
		cssRules.push(`${selector} .container-radio input:checked ~ .checkmark { background-color: ${attributes.checkboxSelectedBgColor}; }`);
	}

	if (hasBoxShadow(attributes.checkboxSelectedBoxShadow)) {
		const shadow = generateBoxShadowCSS(attributes.checkboxSelectedBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark { box-shadow: ${shadow}; }`);
			cssRules.push(`${selector} .container-radio input:checked ~ .checkmark { box-shadow: ${shadow}; }`);
		}
	}

	// ============================================
	// 6. CART STYLING
	// ============================================

	// Cart item spacing
	if (attributes.cartItemSpacing !== undefined && attributes.cartItemSpacing !== null) {
		cssRules.push(`${selector} .ts-cart-items > li { margin-bottom: ${attributes.cartItemSpacing}px; }`);
	}
	if (attributes.cartItemSpacing_tablet !== undefined && attributes.cartItemSpacing_tablet !== null) {
		tabletRules.push(`${selector} .ts-cart-items > li { margin-bottom: ${attributes.cartItemSpacing_tablet}px; }`);
	}
	if (attributes.cartItemSpacing_mobile !== undefined && attributes.cartItemSpacing_mobile !== null) {
		mobileRules.push(`${selector} .ts-cart-items > li { margin-bottom: ${attributes.cartItemSpacing_mobile}px; }`);
	}

	// Cart item content spacing
	if (attributes.cartItemContentSpacing !== undefined && attributes.cartItemContentSpacing !== null) {
		cssRules.push(`${selector} .ts-item-details { gap: ${attributes.cartItemContentSpacing}px; }`);
	}
	if (attributes.cartItemContentSpacing_tablet !== undefined && attributes.cartItemContentSpacing_tablet !== null) {
		tabletRules.push(`${selector} .ts-item-details { gap: ${attributes.cartItemContentSpacing_tablet}px; }`);
	}
	if (attributes.cartItemContentSpacing_mobile !== undefined && attributes.cartItemContentSpacing_mobile !== null) {
		mobileRules.push(`${selector} .ts-item-details { gap: ${attributes.cartItemContentSpacing_mobile}px; }`);
	}

	// Cart picture size
	if (attributes.cartPictureSize !== undefined && attributes.cartPictureSize !== null) {
		cssRules.push(`${selector} .ts-item-image { width: ${attributes.cartPictureSize}px; height: ${attributes.cartPictureSize}px; min-width: ${attributes.cartPictureSize}px; }`);
	}
	if (attributes.cartPictureSize_tablet !== undefined && attributes.cartPictureSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-item-image { width: ${attributes.cartPictureSize_tablet}px; height: ${attributes.cartPictureSize_tablet}px; min-width: ${attributes.cartPictureSize_tablet}px; }`);
	}
	if (attributes.cartPictureSize_mobile !== undefined && attributes.cartPictureSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-item-image { width: ${attributes.cartPictureSize_mobile}px; height: ${attributes.cartPictureSize_mobile}px; min-width: ${attributes.cartPictureSize_mobile}px; }`);
	}

	// Cart picture radius
	if (attributes.cartPictureRadius !== undefined && attributes.cartPictureRadius !== null) {
		cssRules.push(`${selector} .ts-item-image { border-radius: ${attributes.cartPictureRadius}px; }`);
	}
	if (attributes.cartPictureRadius_tablet !== undefined && attributes.cartPictureRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-item-image { border-radius: ${attributes.cartPictureRadius_tablet}px; }`);
	}
	if (attributes.cartPictureRadius_mobile !== undefined && attributes.cartPictureRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-item-image { border-radius: ${attributes.cartPictureRadius_mobile}px; }`);
	}

	// Cart title typography
	if (hasTypography(attributes.cartTitleTypography)) {
		const typo = generateTypographyCSS(attributes.cartTitleTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-item-name { ${typo} }`);
		}
	}

	// Cart title color
	if (attributes.cartTitleColor) {
		cssRules.push(`${selector} .ts-item-name { color: ${attributes.cartTitleColor}; }`);
	}

	// Cart subtitle typography
	if (hasTypography(attributes.cartSubtitleTypography)) {
		const typo = generateTypographyCSS(attributes.cartSubtitleTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-item-description { ${typo} }`);
		}
	}

	// Cart subtitle color
	if (attributes.cartSubtitleColor) {
		cssRules.push(`${selector} .ts-item-description { color: ${attributes.cartSubtitleColor}; }`);
	}

	// ============================================
	// 7. ICON BUTTON (ts-icon-btn)
	// ============================================

	// Icon color
	if (attributes.iconBtnColor) {
		cssRules.push(`${selector} .ts-icon-btn i { color: ${attributes.iconBtnColor}; }`);
	}

	// Background color
	if (attributes.iconBtnBgColor) {
		cssRules.push(`${selector} .ts-icon-btn { background-color: ${attributes.iconBtnBgColor}; }`);
	}

	// Border
	if (attributes.iconBtnBorderType && attributes.iconBtnBorderType !== 'none') {
		cssRules.push(`${selector} .ts-icon-btn { border-style: ${attributes.iconBtnBorderType}; }`);

		if (attributes.iconBtnBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.iconBtnBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} .ts-icon-btn { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.iconBtnBorderColor) {
			cssRules.push(`${selector} .ts-icon-btn { border-color: ${attributes.iconBtnBorderColor}; }`);
		}
	}

	// Border radius
	if (attributes.iconBtnRadius !== undefined && attributes.iconBtnRadius !== null) {
		cssRules.push(`${selector} .ts-icon-btn { border-radius: ${attributes.iconBtnRadius}px; }`);
	}
	if (attributes.iconBtnRadius_tablet !== undefined && attributes.iconBtnRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-icon-btn { border-radius: ${attributes.iconBtnRadius_tablet}px; }`);
	}
	if (attributes.iconBtnRadius_mobile !== undefined && attributes.iconBtnRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-icon-btn { border-radius: ${attributes.iconBtnRadius_mobile}px; }`);
	}

	// Value size
	if (attributes.iconBtnValueSize !== undefined && attributes.iconBtnValueSize !== null) {
		cssRules.push(`${selector} .ts-icon-btn .ts-number { font-size: ${attributes.iconBtnValueSize}px; }`);
	}

	// Value color
	if (attributes.iconBtnValueColor) {
		cssRules.push(`${selector} .ts-icon-btn .ts-number { color: ${attributes.iconBtnValueColor}; }`);
	}

	// Hover states
	if (attributes.iconBtnColorHover) {
		cssRules.push(`${selector} .ts-icon-btn:hover i { color: ${attributes.iconBtnColorHover}; }`);
	}
	if (attributes.iconBtnBgColorHover) {
		cssRules.push(`${selector} .ts-icon-btn:hover { background-color: ${attributes.iconBtnBgColorHover}; }`);
	}
	if (attributes.iconBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-icon-btn:hover { border-color: ${attributes.iconBtnBorderColorHover}; }`);
	}

	// ============================================
	// 8. DROPDOWN BUTTON (ts-filter, ts-filter-wrapper)
	// ============================================

	// Typography
	if (hasTypography(attributes.dropdownTypography)) {
		const typo = generateTypographyCSS(attributes.dropdownTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-filter { ${typo} }`);
		}
	}

	// Box shadow
	if (hasBoxShadow(attributes.dropdownBoxShadow)) {
		const shadow = generateBoxShadowCSS(attributes.dropdownBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-filter { box-shadow: ${shadow}; }`);
		}
	}

	// Background color
	if (attributes.dropdownBgColor) {
		cssRules.push(`${selector} .ts-filter { background-color: ${attributes.dropdownBgColor}; }`);
	}

	// Text color
	if (attributes.dropdownTextColor) {
		cssRules.push(`${selector} .ts-filter { color: ${attributes.dropdownTextColor}; }`);
	}

	// Border
	if (attributes.dropdownBorderType && attributes.dropdownBorderType !== 'none') {
		cssRules.push(`${selector} .ts-filter { border-style: ${attributes.dropdownBorderType}; }`);

		if (attributes.dropdownBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.dropdownBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} .ts-filter { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.dropdownBorderColor) {
			cssRules.push(`${selector} .ts-filter { border-color: ${attributes.dropdownBorderColor}; }`);
		}
	}

	// Border radius
	if (attributes.dropdownRadius !== undefined && attributes.dropdownRadius !== null) {
		cssRules.push(`${selector} .ts-filter { border-radius: ${attributes.dropdownRadius}px; }`);
	}
	if (attributes.dropdownRadius_tablet !== undefined && attributes.dropdownRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-filter { border-radius: ${attributes.dropdownRadius_tablet}px; }`);
	}
	if (attributes.dropdownRadius_mobile !== undefined && attributes.dropdownRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-filter { border-radius: ${attributes.dropdownRadius_mobile}px; }`);
	}

	// Height
	if (attributes.dropdownHeight !== undefined && attributes.dropdownHeight !== null) {
		cssRules.push(`${selector} .ts-filter { min-height: ${attributes.dropdownHeight}px; }`);
	}
	if (attributes.dropdownHeight_tablet !== undefined && attributes.dropdownHeight_tablet !== null) {
		tabletRules.push(`${selector} .ts-filter { min-height: ${attributes.dropdownHeight_tablet}px; }`);
	}
	if (attributes.dropdownHeight_mobile !== undefined && attributes.dropdownHeight_mobile !== null) {
		mobileRules.push(`${selector} .ts-filter { min-height: ${attributes.dropdownHeight_mobile}px; }`);
	}

	// Icon color
	if (attributes.dropdownIconColor) {
		cssRules.push(`${selector} .ts-filter i { color: ${attributes.dropdownIconColor}; }`);
	}

	// Icon size
	if (attributes.dropdownIconSize !== undefined && attributes.dropdownIconSize !== null) {
		cssRules.push(`${selector} .ts-filter i { font-size: ${attributes.dropdownIconSize}px; }`);
	}
	if (attributes.dropdownIconSize_tablet !== undefined && attributes.dropdownIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-filter i { font-size: ${attributes.dropdownIconSize_tablet}px; }`);
	}
	if (attributes.dropdownIconSize_mobile !== undefined && attributes.dropdownIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-filter i { font-size: ${attributes.dropdownIconSize_mobile}px; }`);
	}

	// Icon spacing
	if (attributes.dropdownIconSpacing !== undefined && attributes.dropdownIconSpacing !== null) {
		cssRules.push(`${selector} .ts-filter { gap: ${attributes.dropdownIconSpacing}px; }`);
	}
	if (attributes.dropdownIconSpacing_tablet !== undefined && attributes.dropdownIconSpacing_tablet !== null) {
		tabletRules.push(`${selector} .ts-filter { gap: ${attributes.dropdownIconSpacing_tablet}px; }`);
	}
	if (attributes.dropdownIconSpacing_mobile !== undefined && attributes.dropdownIconSpacing_mobile !== null) {
		mobileRules.push(`${selector} .ts-filter { gap: ${attributes.dropdownIconSpacing_mobile}px; }`);
	}

	// Hide chevron
	if (attributes.dropdownHideChevron) {
		cssRules.push(`${selector} .ts-filter .ts-down-icon { display: none; }`);
	}

	// Chevron color
	if (attributes.dropdownChevronColor) {
		cssRules.push(`${selector} .ts-filter .ts-down-icon { color: ${attributes.dropdownChevronColor}; }`);
	}

	// Hover states
	if (attributes.dropdownBgColorHover) {
		cssRules.push(`${selector} .ts-filter:hover { background-color: ${attributes.dropdownBgColorHover}; }`);
	}
	if (attributes.dropdownTextColorHover) {
		cssRules.push(`${selector} .ts-filter:hover { color: ${attributes.dropdownTextColorHover}; }`);
	}
	if (attributes.dropdownBorderColorHover) {
		cssRules.push(`${selector} .ts-filter:hover { border-color: ${attributes.dropdownBorderColorHover}; }`);
	}
	if (attributes.dropdownIconColorHover) {
		cssRules.push(`${selector} .ts-filter:hover i { color: ${attributes.dropdownIconColorHover}; }`);
	}
	if (hasBoxShadow(attributes.dropdownBoxShadowHover)) {
		const shadow = generateBoxShadowCSS(attributes.dropdownBoxShadowHover);
		if (shadow) {
			cssRules.push(`${selector} .ts-filter:hover { box-shadow: ${shadow}; }`);
		}
	}

	// Filled states (when dropdown has value)
	if (hasTypography(attributes.dropdownTypographyFilled)) {
		const typo = generateTypographyCSS(attributes.dropdownTypographyFilled);
		if (typo) {
			cssRules.push(`${selector} .ts-filter.ts-filled { ${typo} }`);
		}
	}
	if (attributes.dropdownBgColorFilled) {
		cssRules.push(`${selector} .ts-filter.ts-filled { background-color: ${attributes.dropdownBgColorFilled}; }`);
	}
	if (attributes.dropdownTextColorFilled) {
		cssRules.push(`${selector} .ts-filter.ts-filled { color: ${attributes.dropdownTextColorFilled}; }`);
	}
	if (attributes.dropdownIconColorFilled) {
		cssRules.push(`${selector} .ts-filter.ts-filled i { color: ${attributes.dropdownIconColorFilled}; }`);
	}
	if (attributes.dropdownBorderColorFilled) {
		cssRules.push(`${selector} .ts-filter.ts-filled { border-color: ${attributes.dropdownBorderColorFilled}; }`);
	}
	if (attributes.dropdownBorderWidthFilled !== undefined && attributes.dropdownBorderWidthFilled !== null) {
		cssRules.push(`${selector} .ts-filter.ts-filled { border-width: ${attributes.dropdownBorderWidthFilled}px; }`);
	}
	if (hasBoxShadow(attributes.dropdownBoxShadowFilled)) {
		const shadow = generateBoxShadowCSS(attributes.dropdownBoxShadowFilled);
		if (shadow) {
			cssRules.push(`${selector} .ts-filter.ts-filled { box-shadow: ${shadow}; }`);
		}
	}

	// ============================================
	// 9. SHIP TO
	// ============================================

	if (hasTypography(attributes.shipToTypography)) {
		const typo = generateTypographyCSS(attributes.shipToTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-ship-to { ${typo} }`);
		}
	}

	if (attributes.shipToTextColor) {
		cssRules.push(`${selector} .ts-ship-to { color: ${attributes.shipToTextColor}; }`);
	}

	if (attributes.shipToLinkColor) {
		cssRules.push(`${selector} .ts-ship-to a { color: ${attributes.shipToLinkColor}; }`);
	}

	// ============================================
	// 10. SECTION DIVIDER
	// ============================================

	if (hasTypography(attributes.dividerTypography)) {
		const typo = generateTypographyCSS(attributes.dividerTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-section-divider { ${typo} }`);
		}
	}

	if (attributes.dividerTextColor) {
		cssRules.push(`${selector} .ts-section-divider { color: ${attributes.dividerTextColor}; }`);
	}

	if (attributes.dividerLineColor) {
		cssRules.push(`${selector} .ts-section-divider::before { background-color: ${attributes.dividerLineColor}; }`);
	}

	if (attributes.dividerLineHeight !== undefined && attributes.dividerLineHeight !== null) {
		cssRules.push(`${selector} .ts-section-divider::before { height: ${attributes.dividerLineHeight}px; }`);
	}

	// ============================================
	// 11. SUBTOTAL
	// ============================================

	if (hasTypography(attributes.subtotalTypography)) {
		const typo = generateTypographyCSS(attributes.subtotalTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-subtotal { ${typo} }`);
		}
	}

	if (attributes.subtotalTextColor) {
		cssRules.push(`${selector} .ts-subtotal { color: ${attributes.subtotalTextColor}; }`);
	}

	// ============================================
	// 12. FIELD LABEL
	// ============================================

	if (hasTypography(attributes.fieldLabelTypography)) {
		const typo = generateTypographyCSS(attributes.fieldLabelTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-form-group label { ${typo} }`);
		}
	}

	if (attributes.fieldLabelColor) {
		cssRules.push(`${selector} .ts-form-group label { color: ${attributes.fieldLabelColor}; }`);
	}

	if (attributes.fieldLabelLinkColor) {
		cssRules.push(`${selector} .ts-form-group label a { color: ${attributes.fieldLabelLinkColor}; }`);
	}

	// ============================================
	// 13. INPUT & TEXTAREA (Normal)
	// ============================================

	// Placeholder typography & color
	if (hasTypography(attributes.inputPlaceholderTypography)) {
		const typo = generateTypographyCSS(attributes.inputPlaceholderTypography);
		if (typo) {
			cssRules.push(`${selector} input::placeholder, ${selector} textarea::placeholder { ${typo} }`);
		}
	}
	if (attributes.inputPlaceholderColor) {
		cssRules.push(`${selector} input::placeholder, ${selector} textarea::placeholder { color: ${attributes.inputPlaceholderColor}; }`);
	}

	// Value typography & color
	if (hasTypography(attributes.inputValueTypography)) {
		const typo = generateTypographyCSS(attributes.inputValueTypography);
		if (typo) {
			cssRules.push(`${selector} input, ${selector} textarea { ${typo} }`);
		}
	}
	if (attributes.inputValueColor) {
		cssRules.push(`${selector} input, ${selector} textarea { color: ${attributes.inputValueColor}; }`);
	}

	// Background color
	if (attributes.inputBgColor) {
		cssRules.push(`${selector} input, ${selector} textarea, ${selector} .ts-filter { background-color: ${attributes.inputBgColor}; }`);
	}

	// Border
	if (attributes.inputBorderType && attributes.inputBorderType !== 'none') {
		cssRules.push(`${selector} input, ${selector} textarea, ${selector} .ts-filter { border-style: ${attributes.inputBorderType}; }`);

		if (attributes.inputBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.inputBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} input, ${selector} textarea, ${selector} .ts-filter { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.inputBorderColor) {
			cssRules.push(`${selector} input, ${selector} textarea, ${selector} .ts-filter { border-color: ${attributes.inputBorderColor}; }`);
		}
	}

	// Padding
	if (attributes.inputPadding) {
		const padding = generatePaddingCSS(attributes.inputPadding);
		if (padding) {
			cssRules.push(`${selector} input { padding: ${padding}; }`);
		}
	}
	if (attributes.inputPadding_tablet) {
		const padding = generatePaddingCSS(attributes.inputPadding_tablet);
		if (padding) {
			tabletRules.push(`${selector} input { padding: ${padding}; }`);
		}
	}
	if (attributes.inputPadding_mobile) {
		const padding = generatePaddingCSS(attributes.inputPadding_mobile);
		if (padding) {
			mobileRules.push(`${selector} input { padding: ${padding}; }`);
		}
	}

	// Height
	if (attributes.inputHeight !== undefined && attributes.inputHeight !== null) {
		cssRules.push(`${selector} input { min-height: ${attributes.inputHeight}px; }`);
	}
	if (attributes.inputHeight_tablet !== undefined && attributes.inputHeight_tablet !== null) {
		tabletRules.push(`${selector} input { min-height: ${attributes.inputHeight_tablet}px; }`);
	}
	if (attributes.inputHeight_mobile !== undefined && attributes.inputHeight_mobile !== null) {
		mobileRules.push(`${selector} input { min-height: ${attributes.inputHeight_mobile}px; }`);
	}

	// Radius
	if (attributes.inputRadius !== undefined && attributes.inputRadius !== null) {
		cssRules.push(`${selector} input { border-radius: ${attributes.inputRadius}px; }`);
	}
	if (attributes.inputRadius_tablet !== undefined && attributes.inputRadius_tablet !== null) {
		tabletRules.push(`${selector} input { border-radius: ${attributes.inputRadius_tablet}px; }`);
	}
	if (attributes.inputRadius_mobile !== undefined && attributes.inputRadius_mobile !== null) {
		mobileRules.push(`${selector} input { border-radius: ${attributes.inputRadius_mobile}px; }`);
	}

	// Input with icon padding
	if (attributes.inputWithIconPadding) {
		const padding = generatePaddingCSS(attributes.inputWithIconPadding);
		if (padding) {
			cssRules.push(`${selector} .ts-input-icon input { padding: ${padding}; }`);
		}
	}
	if (attributes.inputWithIconPadding_tablet) {
		const padding = generatePaddingCSS(attributes.inputWithIconPadding_tablet);
		if (padding) {
			tabletRules.push(`${selector} .ts-input-icon input { padding: ${padding}; }`);
		}
	}
	if (attributes.inputWithIconPadding_mobile) {
		const padding = generatePaddingCSS(attributes.inputWithIconPadding_mobile);
		if (padding) {
			mobileRules.push(`${selector} .ts-input-icon input { padding: ${padding}; }`);
		}
	}

	// Icon color
	if (attributes.inputIconColor) {
		cssRules.push(`${selector} .ts-input-icon i { color: ${attributes.inputIconColor}; }`);
	}

	// Icon size
	if (attributes.inputIconSize !== undefined && attributes.inputIconSize !== null) {
		cssRules.push(`${selector} .ts-input-icon i { font-size: ${attributes.inputIconSize}px; }`);
	}
	if (attributes.inputIconSize_tablet !== undefined && attributes.inputIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-input-icon i { font-size: ${attributes.inputIconSize_tablet}px; }`);
	}
	if (attributes.inputIconSize_mobile !== undefined && attributes.inputIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-input-icon i { font-size: ${attributes.inputIconSize_mobile}px; }`);
	}

	// Icon margin
	if (attributes.inputIconMargin !== undefined && attributes.inputIconMargin !== null) {
		cssRules.push(`${selector} .ts-input-icon i { margin: 0 ${attributes.inputIconMargin}px; }`);
	}
	if (attributes.inputIconMargin_tablet !== undefined && attributes.inputIconMargin_tablet !== null) {
		tabletRules.push(`${selector} .ts-input-icon i { margin: 0 ${attributes.inputIconMargin_tablet}px; }`);
	}
	if (attributes.inputIconMargin_mobile !== undefined && attributes.inputIconMargin_mobile !== null) {
		mobileRules.push(`${selector} .ts-input-icon i { margin: 0 ${attributes.inputIconMargin_mobile}px; }`);
	}

	// Textarea padding
	if (attributes.textareaPadding) {
		const padding = generatePaddingCSS(attributes.textareaPadding);
		if (padding) {
			cssRules.push(`${selector} textarea { padding: ${padding}; }`);
		}
	}
	if (attributes.textareaPadding_tablet) {
		const padding = generatePaddingCSS(attributes.textareaPadding_tablet);
		if (padding) {
			tabletRules.push(`${selector} textarea { padding: ${padding}; }`);
		}
	}
	if (attributes.textareaPadding_mobile) {
		const padding = generatePaddingCSS(attributes.textareaPadding_mobile);
		if (padding) {
			mobileRules.push(`${selector} textarea { padding: ${padding}; }`);
		}
	}

	// Textarea radius
	if (attributes.textareaRadius !== undefined && attributes.textareaRadius !== null) {
		cssRules.push(`${selector} textarea { border-radius: ${attributes.textareaRadius}px; }`);
	}
	if (attributes.textareaRadius_tablet !== undefined && attributes.textareaRadius_tablet !== null) {
		tabletRules.push(`${selector} textarea { border-radius: ${attributes.textareaRadius_tablet}px; }`);
	}
	if (attributes.textareaRadius_mobile !== undefined && attributes.textareaRadius_mobile !== null) {
		mobileRules.push(`${selector} textarea { border-radius: ${attributes.textareaRadius_mobile}px; }`);
	}

	// Hover states
	if (attributes.inputBgColorHover) {
		cssRules.push(`${selector} input:hover, ${selector} textarea:hover, ${selector} .ts-filter:hover { background-color: ${attributes.inputBgColorHover}; }`);
	}
	if (attributes.inputBorderColorHover) {
		cssRules.push(`${selector} input:hover, ${selector} textarea:hover, ${selector} .ts-filter:hover { border-color: ${attributes.inputBorderColorHover}; }`);
	}
	if (attributes.inputPlaceholderColorHover) {
		cssRules.push(`${selector} input:hover::placeholder, ${selector} textarea:hover::placeholder { color: ${attributes.inputPlaceholderColorHover}; }`);
	}
	if (attributes.inputValueColorHover) {
		cssRules.push(`${selector} input:hover, ${selector} textarea:hover { color: ${attributes.inputValueColorHover}; }`);
	}
	if (attributes.inputIconColorHover) {
		cssRules.push(`${selector} .ts-input-icon:hover i { color: ${attributes.inputIconColorHover}; }`);
	}

	// Active (focus) states
	if (attributes.inputBgColorActive) {
		cssRules.push(`${selector} input:focus, ${selector} textarea:focus, ${selector} .ts-filter:focus { background-color: ${attributes.inputBgColorActive}; }`);
	}
	if (attributes.inputBorderColorActive) {
		cssRules.push(`${selector} input:focus, ${selector} textarea:focus, ${selector} .ts-filter:focus { border-color: ${attributes.inputBorderColorActive}; }`);
	}
	if (attributes.inputPlaceholderColorActive) {
		cssRules.push(`${selector} input:focus::placeholder, ${selector} textarea:focus::placeholder { color: ${attributes.inputPlaceholderColorActive}; }`);
	}
	if (attributes.inputValueColorActive) {
		cssRules.push(`${selector} input:focus, ${selector} textarea:focus { color: ${attributes.inputValueColorActive}; }`);
	}

	// ============================================
	// 14. CARDS (Payment methods, etc.)
	// ============================================

	// Gap
	if (attributes.cardsGap !== undefined && attributes.cardsGap !== null) {
		cssRules.push(`${selector} .ts-payment-methods { gap: ${attributes.cardsGap}px; }`);
	}
	if (attributes.cardsGap_tablet !== undefined && attributes.cardsGap_tablet !== null) {
		tabletRules.push(`${selector} .ts-payment-methods { gap: ${attributes.cardsGap_tablet}px; }`);
	}
	if (attributes.cardsGap_mobile !== undefined && attributes.cardsGap_mobile !== null) {
		mobileRules.push(`${selector} .ts-payment-methods { gap: ${attributes.cardsGap_mobile}px; }`);
	}

	// Background color
	if (attributes.cardsBgColor) {
		cssRules.push(`${selector} .ts-payment-card { background-color: ${attributes.cardsBgColor}; }`);
	}

	// Border
	if (attributes.cardsBorderType && attributes.cardsBorderType !== 'none') {
		cssRules.push(`${selector} .ts-payment-card { border-style: ${attributes.cardsBorderType}; }`);

		if (attributes.cardsBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.cardsBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} .ts-payment-card { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.cardsBorderColor) {
			cssRules.push(`${selector} .ts-payment-card { border-color: ${attributes.cardsBorderColor}; }`);
		}
	}

	// Border radius
	if (attributes.cardsRadius !== undefined && attributes.cardsRadius !== null) {
		cssRules.push(`${selector} .ts-payment-card { border-radius: ${attributes.cardsRadius}px; }`);
	}
	if (attributes.cardsRadius_tablet !== undefined && attributes.cardsRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-payment-card { border-radius: ${attributes.cardsRadius_tablet}px; }`);
	}
	if (attributes.cardsRadius_mobile !== undefined && attributes.cardsRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-payment-card { border-radius: ${attributes.cardsRadius_mobile}px; }`);
	}

	// Primary text typography & color
	if (hasTypography(attributes.cardsPrimaryTypography)) {
		const typo = generateTypographyCSS(attributes.cardsPrimaryTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-payment-card .ts-primary { ${typo} }`);
		}
	}
	if (attributes.cardsPrimaryColor) {
		cssRules.push(`${selector} .ts-payment-card .ts-primary { color: ${attributes.cardsPrimaryColor}; }`);
	}

	// Secondary text typography & color
	if (hasTypography(attributes.cardsSecondaryTypography)) {
		const typo = generateTypographyCSS(attributes.cardsSecondaryTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-payment-card .ts-secondary { ${typo} }`);
		}
	}
	if (attributes.cardsSecondaryColor) {
		cssRules.push(`${selector} .ts-payment-card .ts-secondary { color: ${attributes.cardsSecondaryColor}; }`);
	}

	// Price typography & color
	if (hasTypography(attributes.cardsPriceTypography)) {
		const typo = generateTypographyCSS(attributes.cardsPriceTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-payment-card .ts-price { ${typo} }`);
		}
	}
	if (attributes.cardsPriceColor) {
		cssRules.push(`${selector} .ts-payment-card .ts-price { color: ${attributes.cardsPriceColor}; }`);
	}

	// Image radius
	if (attributes.cardsImageRadius !== undefined && attributes.cardsImageRadius !== null) {
		cssRules.push(`${selector} .ts-payment-card img { border-radius: ${attributes.cardsImageRadius}px; }`);
	}
	if (attributes.cardsImageRadius_tablet !== undefined && attributes.cardsImageRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-payment-card img { border-radius: ${attributes.cardsImageRadius_tablet}px; }`);
	}
	if (attributes.cardsImageRadius_mobile !== undefined && attributes.cardsImageRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-payment-card img { border-radius: ${attributes.cardsImageRadius_mobile}px; }`);
	}

	// Image size
	if (attributes.cardsImageSize !== undefined && attributes.cardsImageSize !== null) {
		cssRules.push(`${selector} .ts-payment-card img { width: ${attributes.cardsImageSize}px; height: ${attributes.cardsImageSize}px; }`);
	}
	if (attributes.cardsImageSize_tablet !== undefined && attributes.cardsImageSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-payment-card img { width: ${attributes.cardsImageSize_tablet}px; height: ${attributes.cardsImageSize_tablet}px; }`);
	}
	if (attributes.cardsImageSize_mobile !== undefined && attributes.cardsImageSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-payment-card img { width: ${attributes.cardsImageSize_mobile}px; height: ${attributes.cardsImageSize_mobile}px; }`);
	}

	// Selected states
	if (attributes.cardsSelectedBgColor) {
		cssRules.push(`${selector} .ts-payment-card.ts-selected { background-color: ${attributes.cardsSelectedBgColor}; }`);
	}
	if (attributes.cardsSelectedBorderColor) {
		cssRules.push(`${selector} .ts-payment-card.ts-selected { border-color: ${attributes.cardsSelectedBorderColor}; }`);
	}
	if (hasBoxShadow(attributes.cardsSelectedBoxShadow)) {
		const shadow = generateBoxShadowCSS(attributes.cardsSelectedBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-payment-card.ts-selected { box-shadow: ${shadow}; }`);
		}
	}
	if (hasTypography(attributes.cardsSelectedPrimaryTypography)) {
		const typo = generateTypographyCSS(attributes.cardsSelectedPrimaryTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-payment-card.ts-selected .ts-primary { ${typo} }`);
		}
	}

	// ============================================
	// 15. FILE/GALLERY FIELDS
	// ============================================

	// Field gap
	if (attributes.fileFieldGap !== undefined && attributes.fileFieldGap !== null) {
		cssRules.push(`${selector} .ts-file-list { gap: ${attributes.fileFieldGap}px; }`);
	}
	if (attributes.fileFieldGap_tablet !== undefined && attributes.fileFieldGap_tablet !== null) {
		tabletRules.push(`${selector} .ts-file-list { gap: ${attributes.fileFieldGap_tablet}px; }`);
	}
	if (attributes.fileFieldGap_mobile !== undefined && attributes.fileFieldGap_mobile !== null) {
		mobileRules.push(`${selector} .ts-file-list { gap: ${attributes.fileFieldGap_mobile}px; }`);
	}

	// File select button icon
	if (attributes.fileSelectIconColor) {
		cssRules.push(`${selector} .ts-file-upload i { color: ${attributes.fileSelectIconColor}; }`);
	}
	if (attributes.fileSelectIconSize !== undefined && attributes.fileSelectIconSize !== null) {
		cssRules.push(`${selector} .ts-file-upload i { font-size: ${attributes.fileSelectIconSize}px; }`);
	}
	if (attributes.fileSelectIconSize_tablet !== undefined && attributes.fileSelectIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-file-upload i { font-size: ${attributes.fileSelectIconSize_tablet}px; }`);
	}
	if (attributes.fileSelectIconSize_mobile !== undefined && attributes.fileSelectIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-file-upload i { font-size: ${attributes.fileSelectIconSize_mobile}px; }`);
	}

	// File select button background
	if (attributes.fileSelectBgColor) {
		cssRules.push(`${selector} .ts-file-upload { background-color: ${attributes.fileSelectBgColor}; }`);
	}

	// File select button border
	if (attributes.fileSelectBorderType && attributes.fileSelectBorderType !== 'none') {
		cssRules.push(`${selector} .ts-file-upload { border-style: ${attributes.fileSelectBorderType}; }`);

		if (attributes.fileSelectBorderWidth) {
			const borderWidth = generateBorderWidthCSS(attributes.fileSelectBorderWidth);
			if (borderWidth) {
				cssRules.push(`${selector} .ts-file-upload { border-width: ${borderWidth}; }`);
			}
		}

		if (attributes.fileSelectBorderColor) {
			cssRules.push(`${selector} .ts-file-upload { border-color: ${attributes.fileSelectBorderColor}; }`);
		}
	}

	// File select button radius
	if (attributes.fileSelectRadius !== undefined && attributes.fileSelectRadius !== null) {
		cssRules.push(`${selector} .ts-file-upload { border-radius: ${attributes.fileSelectRadius}px; }`);
	}
	if (attributes.fileSelectRadius_tablet !== undefined && attributes.fileSelectRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-file-upload { border-radius: ${attributes.fileSelectRadius_tablet}px; }`);
	}
	if (attributes.fileSelectRadius_mobile !== undefined && attributes.fileSelectRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-file-upload { border-radius: ${attributes.fileSelectRadius_mobile}px; }`);
	}

	// File select button typography & text color
	if (hasTypography(attributes.fileSelectTypography)) {
		const typo = generateTypographyCSS(attributes.fileSelectTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-file-upload { ${typo} }`);
		}
	}
	if (attributes.fileSelectTextColor) {
		cssRules.push(`${selector} .ts-file-upload { color: ${attributes.fileSelectTextColor}; }`);
	}

	// Added file radius
	if (attributes.addedFileRadius !== undefined && attributes.addedFileRadius !== null) {
		cssRules.push(`${selector} .ts-uploaded-file { border-radius: ${attributes.addedFileRadius}px; }`);
	}
	if (attributes.addedFileRadius_tablet !== undefined && attributes.addedFileRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-uploaded-file { border-radius: ${attributes.addedFileRadius_tablet}px; }`);
	}
	if (attributes.addedFileRadius_mobile !== undefined && attributes.addedFileRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-uploaded-file { border-radius: ${attributes.addedFileRadius_mobile}px; }`);
	}

	// Added file background
	if (attributes.addedFileBgColor) {
		cssRules.push(`${selector} .ts-uploaded-file { background-color: ${attributes.addedFileBgColor}; }`);
	}

	// Added file icon
	if (attributes.addedFileIconColor) {
		cssRules.push(`${selector} .ts-uploaded-file i { color: ${attributes.addedFileIconColor}; }`);
	}
	if (attributes.addedFileIconSize !== undefined && attributes.addedFileIconSize !== null) {
		cssRules.push(`${selector} .ts-uploaded-file i { font-size: ${attributes.addedFileIconSize}px; }`);
	}
	if (attributes.addedFileIconSize_tablet !== undefined && attributes.addedFileIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-uploaded-file i { font-size: ${attributes.addedFileIconSize_tablet}px; }`);
	}
	if (attributes.addedFileIconSize_mobile !== undefined && attributes.addedFileIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-uploaded-file i { font-size: ${attributes.addedFileIconSize_mobile}px; }`);
	}

	// Added file typography & text color
	if (hasTypography(attributes.addedFileTypography)) {
		const typo = generateTypographyCSS(attributes.addedFileTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-uploaded-file { ${typo} }`);
		}
	}
	if (attributes.addedFileTextColor) {
		cssRules.push(`${selector} .ts-uploaded-file { color: ${attributes.addedFileTextColor}; }`);
	}

	// Remove file button
	if (attributes.removeFileBgColor) {
		cssRules.push(`${selector} .ts-remove-file { background-color: ${attributes.removeFileBgColor}; }`);
	}
	if (attributes.removeFileBgColorHover) {
		cssRules.push(`${selector} .ts-remove-file:hover { background-color: ${attributes.removeFileBgColorHover}; }`);
	}
	if (attributes.removeFileColor) {
		cssRules.push(`${selector} .ts-remove-file { color: ${attributes.removeFileColor}; }`);
	}
	if (attributes.removeFileColorHover) {
		cssRules.push(`${selector} .ts-remove-file:hover { color: ${attributes.removeFileColorHover}; }`);
	}

	// Remove file button radius
	if (attributes.removeFileRadius !== undefined && attributes.removeFileRadius !== null) {
		cssRules.push(`${selector} .ts-remove-file { border-radius: ${attributes.removeFileRadius}px; }`);
	}
	if (attributes.removeFileRadius_tablet !== undefined && attributes.removeFileRadius_tablet !== null) {
		tabletRules.push(`${selector} .ts-remove-file { border-radius: ${attributes.removeFileRadius_tablet}px; }`);
	}
	if (attributes.removeFileRadius_mobile !== undefined && attributes.removeFileRadius_mobile !== null) {
		mobileRules.push(`${selector} .ts-remove-file { border-radius: ${attributes.removeFileRadius_mobile}px; }`);
	}

	// Remove file button size
	if (attributes.removeFileSize !== undefined && attributes.removeFileSize !== null) {
		cssRules.push(`${selector} .ts-remove-file { width: ${attributes.removeFileSize}px; height: ${attributes.removeFileSize}px; }`);
	}
	if (attributes.removeFileSize_tablet !== undefined && attributes.removeFileSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-remove-file { width: ${attributes.removeFileSize_tablet}px; height: ${attributes.removeFileSize_tablet}px; }`);
	}
	if (attributes.removeFileSize_mobile !== undefined && attributes.removeFileSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-remove-file { width: ${attributes.removeFileSize_mobile}px; height: ${attributes.removeFileSize_mobile}px; }`);
	}

	// Remove file icon size
	if (attributes.removeFileIconSize !== undefined && attributes.removeFileIconSize !== null) {
		cssRules.push(`${selector} .ts-remove-file i { font-size: ${attributes.removeFileIconSize}px; }`);
	}
	if (attributes.removeFileIconSize_tablet !== undefined && attributes.removeFileIconSize_tablet !== null) {
		tabletRules.push(`${selector} .ts-remove-file i { font-size: ${attributes.removeFileIconSize_tablet}px; }`);
	}
	if (attributes.removeFileIconSize_mobile !== undefined && attributes.removeFileIconSize_mobile !== null) {
		mobileRules.push(`${selector} .ts-remove-file i { font-size: ${attributes.removeFileIconSize_mobile}px; }`);
	}

	// File select hover states
	if (attributes.fileSelectIconColorHover) {
		cssRules.push(`${selector} .ts-file-upload:hover i { color: ${attributes.fileSelectIconColorHover}; }`);
	}
	if (attributes.fileSelectBgColorHover) {
		cssRules.push(`${selector} .ts-file-upload:hover { background-color: ${attributes.fileSelectBgColorHover}; }`);
	}
	if (attributes.fileSelectBorderColorHover) {
		cssRules.push(`${selector} .ts-file-upload:hover { border-color: ${attributes.fileSelectBorderColorHover}; }`);
	}
	if (attributes.fileSelectTextColorHover) {
		cssRules.push(`${selector} .ts-file-upload:hover { color: ${attributes.fileSelectTextColorHover}; }`);
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
