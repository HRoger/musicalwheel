/**
 * Orders Block - Style Generation
 *
 * Generates CSS from Style tab controls targeting Voxel CSS classes.
 * This file handles Layer 2 CSS (block-specific styles).
 * Layer 1 (AdvancedTab + VoxelTab) is handled by generateAdvancedStyles().
 *
 * Voxel Reference:
 * - Widget: themes/voxel/app/widgets/orders.php
 * - Template: themes/voxel/templates/widgets/orders.php
 * - Single: themes/voxel/templates/widgets/orders/single-order.php
 * - CSS: themes/voxel/assets/dist/orders.css
 *
 * @package VoxelFSE
 */

import type { OrdersBlockAttributes } from './types';

// ============================================================================
// HELPER FUNCTIONS FOR CSS GENERATION
// ============================================================================

/**
 * Check if a numeric attribute has been explicitly set by the user.
 * Attributes defaulting to 0 in block.json should NOT generate CSS
 * (0px height, 0px font-size, etc. would break Voxel's default styles).
 * Only generate CSS when the user has explicitly set a value > 0.
 */
function isSet(value: number | undefined): boolean {
	return value !== undefined && value > 0;
}

/**
 * Generate dimensions CSS (padding, margin)
 */
function generateDimensionsCSS(
	dimensions: { top?: number; right?: number; bottom?: number; left?: number; unit?: string } | undefined,
	property: string
): string {
	if (!dimensions) return '';
	const { unit = 'px' } = dimensions;
	// Parse to handle empty strings from DimensionsControl
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;
	// Only generate if at least one value is non-zero
	if (top === 0 && right === 0 && bottom === 0 && left === 0) return '';
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Generate border CSS from select control (borderType)
 * Note: Width and color should be separate attributes
 */
function generateBorderTypeCSS(borderType: string | undefined): string {
	if (!borderType || borderType === 'Default') return '';
	return `border-style: ${borderType.toLowerCase()};`;
}

/**
 * Generate box-shadow CSS
 */
function generateBoxShadowCSS(shadow: any): string {
	if (!shadow || !shadow.enable) return '';
	const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outset' } = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
}

/**
 * Generate typography CSS
 */
function generateTypographyCSS(typography: any): string {
	if (!typography) return '';
	let css = '';
	if (typography.fontFamily) css += `font-family: ${typography.fontFamily}; `;
	if (typography.fontSize) css += `font-size: ${typography.fontSize}${typography.fontSizeUnit || 'px'}; `;
	if (typography.fontWeight) css += `font-weight: ${typography.fontWeight}; `;
	if (typography.fontStyle) css += `font-style: ${typography.fontStyle}; `;
	if (typography.textTransform) css += `text-transform: ${typography.textTransform}; `;
	if (typography.textDecoration) css += `text-decoration: ${typography.textDecoration}; `;
	if (typography.lineHeight) css += `line-height: ${typography.lineHeight}${typography.lineHeightUnit || ''}; `;
	if (typography.letterSpacing) css += `letter-spacing: ${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}; `;
	return css;
}

// ============================================================================
// MAIN CSS GENERATION FUNCTION
// ============================================================================

/**
 * Generate responsive CSS for Orders block
 * Targets Voxel CSS classes (.vx-orders-widget, .vx-order-filters, .vx-order-card, etc.)
 */
export function generateOrdersResponsiveCSS(attributes: OrdersBlockAttributes, blockId: string): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-orders-${blockId}`;

	// ============================================
	// SECTION 1: General
	// ============================================

	// Title typography (widget-head h2)
	if (attributes.generalTitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.generalTitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .widget-head h2 { ${typographyCSS} }`);
		}
	}

	// Title color
	if (attributes.generalTitleColor) {
		cssRules.push(`${selector} .widget-head h2 { color: ${attributes.generalTitleColor}; }`);
	}

	// Subtitle typography (widget-head p)
	if (attributes.generalSubtitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.generalSubtitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .widget-head p { ${typographyCSS} }`);
		}
	}

	// Subtitle color
	if (attributes.generalSubtitleColor) {
		cssRules.push(`${selector} .widget-head p { color: ${attributes.generalSubtitleColor}; }`);
	}

	// Spacing (desktop)
	if (isSet(attributes.generalSpacing)) {
		cssRules.push(`${selector} .widget-head { margin-bottom: ${attributes.generalSpacing}px; }`);
	}
	// Spacing (tablet)
	if (isSet(attributes.generalSpacing_tablet)) {
		tabletRules.push(`${selector} .widget-head { margin-bottom: ${attributes.generalSpacing_tablet}px; }`);
	}
	// Spacing (mobile)
	if (isSet(attributes.generalSpacing_mobile)) {
		mobileRules.push(`${selector} .widget-head { margin-bottom: ${attributes.generalSpacing_mobile}px; }`);
	}

	// ============================================
	// SECTION 2: Primary Button (.ts-btn-2)
	// ============================================

	// Primary button typography (normal)
	if (attributes.primaryBtnTypography) {
		const typographyCSS = generateTypographyCSS(attributes.primaryBtnTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-btn-2 { ${typographyCSS} }`);
		}
	}

	// Primary button border type
	if (attributes.primaryBtnBorderType) {
		const borderCSS = generateBorderTypeCSS(attributes.primaryBtnBorderType);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-btn-2 { ${borderCSS} }`);
		}
	}

	// Primary button border radius (desktop)
	if (isSet(attributes.primaryBtnBorderRadius)) {
		cssRules.push(`${selector} .ts-btn-2 { border-radius: ${attributes.primaryBtnBorderRadius}px; }`);
	}
	// Border radius (tablet)
	if (isSet(attributes.primaryBtnBorderRadius_tablet)) {
		tabletRules.push(`${selector} .ts-btn-2 { border-radius: ${attributes.primaryBtnBorderRadius_tablet}px; }`);
	}
	// Border radius (mobile)
	if (isSet(attributes.primaryBtnBorderRadius_mobile)) {
		mobileRules.push(`${selector} .ts-btn-2 { border-radius: ${attributes.primaryBtnBorderRadius_mobile}px; }`);
	}

	// Primary button box shadow (normal)
	if (attributes.primaryBtnBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.primaryBtnBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-btn-2 { ${shadowCSS} }`);
		}
	}

	// Primary button text color (normal)
	if (attributes.primaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn-2 { color: ${attributes.primaryBtnTextColor}; }`);
	}

	// Primary button background (normal)
	if (attributes.primaryBtnBackground) {
		cssRules.push(`${selector} .ts-btn-2 { background-color: ${attributes.primaryBtnBackground}; }`);
	}

	// Primary button icon size (desktop)
	if (isSet(attributes.primaryBtnIconSize)) {
		cssRules.push(`${selector} .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize}px; }`);
		cssRules.push(`${selector} .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize}px; height: ${attributes.primaryBtnIconSize}px; }`);
	}
	// Icon size (tablet)
	if (isSet(attributes.primaryBtnIconSize_tablet)) {
		tabletRules.push(`${selector} .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize_tablet}px; }`);
		tabletRules.push(`${selector} .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize_tablet}px; height: ${attributes.primaryBtnIconSize_tablet}px; }`);
	}
	// Icon size (mobile)
	if (isSet(attributes.primaryBtnIconSize_mobile)) {
		mobileRules.push(`${selector} .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize_mobile}px; }`);
		mobileRules.push(`${selector} .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize_mobile}px; height: ${attributes.primaryBtnIconSize_mobile}px; }`);
	}

	// Primary button icon color (normal)
	if (attributes.primaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn-2 i { color: ${attributes.primaryBtnIconColor}; }`);
		cssRules.push(`${selector} .ts-btn-2 svg { fill: ${attributes.primaryBtnIconColor}; }`);
	}

	// Primary button icon spacing (desktop)
	if (isSet(attributes.primaryBtnIconSpacing)) {
		cssRules.push(`${selector} .ts-btn-2 i { margin-right: ${attributes.primaryBtnIconSpacing}px; }`);
		cssRules.push(`${selector} .ts-btn-2 svg { margin-right: ${attributes.primaryBtnIconSpacing}px; }`);
	}
	// Icon spacing (tablet)
	if (isSet(attributes.primaryBtnIconSpacing_tablet)) {
		tabletRules.push(`${selector} .ts-btn-2 i { margin-right: ${attributes.primaryBtnIconSpacing_tablet}px; }`);
		tabletRules.push(`${selector} .ts-btn-2 svg { margin-right: ${attributes.primaryBtnIconSpacing_tablet}px; }`);
	}
	// Icon spacing (mobile)
	if (isSet(attributes.primaryBtnIconSpacing_mobile)) {
		mobileRules.push(`${selector} .ts-btn-2 i { margin-right: ${attributes.primaryBtnIconSpacing_mobile}px; }`);
		mobileRules.push(`${selector} .ts-btn-2 svg { margin-right: ${attributes.primaryBtnIconSpacing_mobile}px; }`);
	}

	// Primary button hover states
	if (attributes.primaryBtnTextColorHover) {
		cssRules.push(`${selector} .ts-btn-2:hover { color: ${attributes.primaryBtnTextColorHover}; }`);
	}
	if (attributes.primaryBtnBackgroundHover) {
		cssRules.push(`${selector} .ts-btn-2:hover { background-color: ${attributes.primaryBtnBackgroundHover}; }`);
	}
	if (attributes.primaryBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-btn-2:hover { border-color: ${attributes.primaryBtnBorderColorHover}; }`);
	}
	if (attributes.primaryBtnBoxShadowHover) {
		const shadowCSS = generateBoxShadowCSS(attributes.primaryBtnBoxShadowHover);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-btn-2:hover { ${shadowCSS} }`);
		}
	}
	if (attributes.primaryBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn-2:hover i { color: ${attributes.primaryBtnIconColorHover}; }`);
		cssRules.push(`${selector} .ts-btn-2:hover svg { fill: ${attributes.primaryBtnIconColorHover}; }`);
	}

	// ============================================
	// SECTION 3: Secondary Button (.ts-btn-1)
	// ============================================

	// Secondary button icon color (normal)
	if (attributes.secondaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn-1 i { color: ${attributes.secondaryBtnIconColor}; }`);
		cssRules.push(`${selector} .ts-btn-1 svg { fill: ${attributes.secondaryBtnIconColor}; }`);
	}

	// Secondary button icon size (desktop)
	if (isSet(attributes.secondaryBtnIconSize)) {
		cssRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize}px; }`);
		cssRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize}px; height: ${attributes.secondaryBtnIconSize}px; }`);
	}
	// Icon size (tablet)
	if (isSet(attributes.secondaryBtnIconSize_tablet)) {
		tabletRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize_tablet}px; }`);
		tabletRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize_tablet}px; height: ${attributes.secondaryBtnIconSize_tablet}px; }`);
	}
	// Icon size (mobile)
	if (isSet(attributes.secondaryBtnIconSize_mobile)) {
		mobileRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize_mobile}px; }`);
		mobileRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize_mobile}px; height: ${attributes.secondaryBtnIconSize_mobile}px; }`);
	}

	// Secondary button icon spacing (desktop)
	if (isSet(attributes.secondaryBtnIconSpacing)) {
		cssRules.push(`${selector} .ts-btn-1 i { margin-right: ${attributes.secondaryBtnIconSpacing}px; }`);
		cssRules.push(`${selector} .ts-btn-1 svg { margin-right: ${attributes.secondaryBtnIconSpacing}px; }`);
	}
	// Icon spacing (tablet)
	if (isSet(attributes.secondaryBtnIconSpacing_tablet)) {
		tabletRules.push(`${selector} .ts-btn-1 i { margin-right: ${attributes.secondaryBtnIconSpacing_tablet}px; }`);
		tabletRules.push(`${selector} .ts-btn-1 svg { margin-right: ${attributes.secondaryBtnIconSpacing_tablet}px; }`);
	}
	// Icon spacing (mobile)
	if (isSet(attributes.secondaryBtnIconSpacing_mobile)) {
		mobileRules.push(`${selector} .ts-btn-1 i { margin-right: ${attributes.secondaryBtnIconSpacing_mobile}px; }`);
		mobileRules.push(`${selector} .ts-btn-1 svg { margin-right: ${attributes.secondaryBtnIconSpacing_mobile}px; }`);
	}

	// Secondary button background (normal)
	if (attributes.secondaryBtnBackground) {
		cssRules.push(`${selector} .ts-btn-1 { background-color: ${attributes.secondaryBtnBackground}; }`);
	}

	// Secondary button border type
	if (attributes.secondaryBtnBorderType) {
		const borderCSS = generateBorderTypeCSS(attributes.secondaryBtnBorderType);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-btn-1 { ${borderCSS} }`);
		}
	}

	// Secondary button border radius (desktop)
	if (isSet(attributes.secondaryBtnBorderRadius)) {
		cssRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.secondaryBtnBorderRadius}px; }`);
	}
	// Border radius (tablet)
	if (isSet(attributes.secondaryBtnBorderRadius_tablet)) {
		tabletRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.secondaryBtnBorderRadius_tablet}px; }`);
	}
	// Border radius (mobile)
	if (isSet(attributes.secondaryBtnBorderRadius_mobile)) {
		mobileRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.secondaryBtnBorderRadius_mobile}px; }`);
	}

	// Secondary button typography (normal)
	if (attributes.secondaryBtnTypography) {
		const typographyCSS = generateTypographyCSS(attributes.secondaryBtnTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-btn-1 { ${typographyCSS} }`);
		}
	}

	// Secondary button text color (normal)
	if (attributes.secondaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn-1 { color: ${attributes.secondaryBtnTextColor}; }`);
	}

	// Secondary button hover states
	if (attributes.secondaryBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn-1:hover i { color: ${attributes.secondaryBtnIconColorHover}; }`);
		cssRules.push(`${selector} .ts-btn-1:hover svg { fill: ${attributes.secondaryBtnIconColorHover}; }`);
	}
	if (attributes.secondaryBtnBackgroundHover) {
		cssRules.push(`${selector} .ts-btn-1:hover { background-color: ${attributes.secondaryBtnBackgroundHover}; }`);
	}
	if (attributes.secondaryBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-btn-1:hover { border-color: ${attributes.secondaryBtnBorderColorHover}; }`);
	}
	if (attributes.secondaryBtnTextColorHover) {
		cssRules.push(`${selector} .ts-btn-1:hover { color: ${attributes.secondaryBtnTextColorHover}; }`);
	}

	// ============================================
	// SECTION 4: Cards (.vx-order-card)
	// ============================================

	// Card background (normal)
	if (attributes.cardBackground) {
		cssRules.push(`${selector} .vx-order-card { background-color: ${attributes.cardBackground}; }`);
	}

	// Card border type
	if (attributes.cardBorderType) {
		const borderCSS = generateBorderTypeCSS(attributes.cardBorderType);
		if (borderCSS) {
			cssRules.push(`${selector} .vx-order-card { ${borderCSS} }`);
		}
	}

	// Card border radius (desktop)
	if (isSet(attributes.cardBorderRadius)) {
		cssRules.push(`${selector} .vx-order-card { border-radius: ${attributes.cardBorderRadius}px; }`);
	}
	// Border radius (tablet)
	if (isSet(attributes.cardBorderRadius_tablet)) {
		tabletRules.push(`${selector} .vx-order-card { border-radius: ${attributes.cardBorderRadius_tablet}px; }`);
	}
	// Border radius (mobile)
	if (isSet(attributes.cardBorderRadius_mobile)) {
		mobileRules.push(`${selector} .vx-order-card { border-radius: ${attributes.cardBorderRadius_mobile}px; }`);
	}

	// Card hover states
	if (attributes.cardBackgroundHover) {
		cssRules.push(`${selector} .vx-order-card:hover { background-color: ${attributes.cardBackgroundHover}; }`);
	}
	if (attributes.cardBorderColorHover) {
		cssRules.push(`${selector} .vx-order-card:hover { border-color: ${attributes.cardBorderColorHover}; }`);
	}

	// Avatar size (desktop)
	if (isSet(attributes.cardAvatarSize)) {
		cssRules.push(`${selector} .vx-order-card .vx-avatar { width: ${attributes.cardAvatarSize}px; height: ${attributes.cardAvatarSize}px; }`);
	}
	// Avatar size (tablet)
	if (isSet(attributes.cardAvatarSize_tablet)) {
		tabletRules.push(`${selector} .vx-order-card .vx-avatar { width: ${attributes.cardAvatarSize_tablet}px; height: ${attributes.cardAvatarSize_tablet}px; }`);
	}
	// Avatar size (mobile)
	if (isSet(attributes.cardAvatarSize_mobile)) {
		mobileRules.push(`${selector} .vx-order-card .vx-avatar { width: ${attributes.cardAvatarSize_mobile}px; height: ${attributes.cardAvatarSize_mobile}px; }`);
	}

	// Avatar border radius (desktop)
	if (isSet(attributes.cardAvatarBorderRadius)) {
		cssRules.push(`${selector} .vx-order-card .vx-avatar { border-radius: ${attributes.cardAvatarBorderRadius}px; }`);
	}
	// Avatar border radius (tablet)
	if (isSet(attributes.cardAvatarBorderRadius_tablet)) {
		tabletRules.push(`${selector} .vx-order-card .vx-avatar { border-radius: ${attributes.cardAvatarBorderRadius_tablet}px; }`);
	}
	// Avatar border radius (mobile)
	if (isSet(attributes.cardAvatarBorderRadius_mobile)) {
		mobileRules.push(`${selector} .vx-order-card .vx-avatar { border-radius: ${attributes.cardAvatarBorderRadius_mobile}px; }`);
	}

	// Order ID typography
	if (attributes.cardOrderIdTypography) {
		const typographyCSS = generateTypographyCSS(attributes.cardOrderIdTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .vx-order-card .order-badge { ${typographyCSS} }`);
		}
	}

	// Order ID color
	if (attributes.cardOrderIdColor) {
		cssRules.push(`${selector} .vx-order-card .order-badge { color: ${attributes.cardOrderIdColor}; }`);
	}

	// Order ID background
	if (attributes.cardOrderIdBackground) {
		cssRules.push(`${selector} .vx-order-card .order-badge { background-color: ${attributes.cardOrderIdBackground}; }`);
	}

	// Order ID border radius (desktop)
	if (isSet(attributes.cardOrderIdBorderRadius)) {
		cssRules.push(`${selector} .vx-order-card .order-badge { border-radius: ${attributes.cardOrderIdBorderRadius}px; }`);
	}
	// Order ID border radius (tablet)
	if (isSet(attributes.cardOrderIdBorderRadius_tablet)) {
		tabletRules.push(`${selector} .vx-order-card .order-badge { border-radius: ${attributes.cardOrderIdBorderRadius_tablet}px; }`);
	}
	// Order ID border radius (mobile)
	if (isSet(attributes.cardOrderIdBorderRadius_mobile)) {
		mobileRules.push(`${selector} .vx-order-card .order-badge { border-radius: ${attributes.cardOrderIdBorderRadius_mobile}px; }`);
	}

	// Order title typography
	if (attributes.cardOrderTitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.cardOrderTitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .vx-order-card .vx-order-title b { ${typographyCSS} }`);
		}
	}

	// Order title typography (pending)
	if (attributes.cardOrderTitleTypographyPending) {
		const typographyCSS = generateTypographyCSS(attributes.cardOrderTitleTypographyPending);
		if (typographyCSS) {
			cssRules.push(`${selector} .vx-order-card.vx-status-pending_payment .vx-order-title b { ${typographyCSS} }`);
		}
	}

	// Order title color
	if (attributes.cardOrderTitleColor) {
		cssRules.push(`${selector} .vx-order-card .vx-order-title b { color: ${attributes.cardOrderTitleColor}; }`);
	}

	// Order details typography
	if (attributes.cardOrderDetailsTypography) {
		const typographyCSS = generateTypographyCSS(attributes.cardOrderDetailsTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .vx-order-card .vx-order-meta span { ${typographyCSS} }`);
		}
	}

	// Order details color
	if (attributes.cardOrderDetailsColor) {
		cssRules.push(`${selector} .vx-order-card .vx-order-meta span { color: ${attributes.cardOrderDetailsColor}; }`);
	}

	// ============================================
	// SECTION 5: Order Statuses (.order-status)
	// ============================================

	// Status padding
	if (attributes.statusPadding) {
		const paddingCSS = generateDimensionsCSS(attributes.statusPadding as any, 'padding');
		if (paddingCSS) {
			cssRules.push(`${selector} .order-status { ${paddingCSS} }`);
		}
	}

	// Status border radius (desktop)
	if (isSet(attributes.statusBorderRadius)) {
		cssRules.push(`${selector} .order-status { border-radius: ${attributes.statusBorderRadius}px; }`);
	}
	// Border radius (tablet)
	if (isSet(attributes.statusBorderRadius_tablet)) {
		tabletRules.push(`${selector} .order-status { border-radius: ${attributes.statusBorderRadius_tablet}px; }`);
	}
	// Border radius (mobile)
	if (isSet(attributes.statusBorderRadius_mobile)) {
		mobileRules.push(`${selector} .order-status { border-radius: ${attributes.statusBorderRadius_mobile}px; }`);
	}

	// Status typography
	if (attributes.statusTypography) {
		const typographyCSS = generateTypographyCSS(attributes.statusTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-status { ${typographyCSS} }`);
		}
	}

	// Status colors (Voxel uses CSS variables --s-color)
	if (attributes.statusOrangeColor) {
		cssRules.push(`${selector} .vx-orange { --s-color: ${attributes.statusOrangeColor}; }`);
	}
	if (attributes.statusGreenColor) {
		cssRules.push(`${selector} .vx-green { --s-color: ${attributes.statusGreenColor}; }`);
	}
	if (attributes.statusNeutralColor) {
		cssRules.push(`${selector} .vx-neutral { --s-color: ${attributes.statusNeutralColor}; }`);
	}
	if (attributes.statusRedColor) {
		cssRules.push(`${selector} .vx-red { --s-color: ${attributes.statusRedColor}; }`);
	}
	if (attributes.statusGreyColor) {
		cssRules.push(`${selector} .vx-grey { --s-color: ${attributes.statusGreyColor}; }`);
	}
	if (attributes.statusBlueColor) {
		cssRules.push(`${selector} .vx-blue { --s-color: ${attributes.statusBlueColor}; }`);
	}

	// ============================================
	// SECTION 6: Filters Common Styles (.ts-filter)
	// ============================================

	// Filter height (desktop)
	if (isSet(attributes.filterHeight)) {
		cssRules.push(`${selector} .ts-filter { height: ${attributes.filterHeight}px; }`);
	}
	// Filter height (tablet)
	if (isSet(attributes.filterHeight_tablet)) {
		tabletRules.push(`${selector} .ts-filter { height: ${attributes.filterHeight_tablet}px; }`);
	}
	// Filter height (mobile)
	if (isSet(attributes.filterHeight_mobile)) {
		mobileRules.push(`${selector} .ts-filter { height: ${attributes.filterHeight_mobile}px; }`);
	}

	// Filter border radius (desktop)
	if (isSet(attributes.filterBorderRadius)) {
		cssRules.push(`${selector} .ts-filter { border-radius: ${attributes.filterBorderRadius}px; }`);
	}
	// Border radius (tablet)
	if (isSet(attributes.filterBorderRadius_tablet)) {
		tabletRules.push(`${selector} .ts-filter { border-radius: ${attributes.filterBorderRadius_tablet}px; }`);
	}
	// Border radius (mobile)
	if (isSet(attributes.filterBorderRadius_mobile)) {
		mobileRules.push(`${selector} .ts-filter { border-radius: ${attributes.filterBorderRadius_mobile}px; }`);
	}

	// Filter box shadow (normal)
	if (attributes.filterBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.filterBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter { ${shadowCSS} }`);
		}
	}

	// Filter border type
	if (attributes.filterBorderType) {
		const borderCSS = generateBorderTypeCSS(attributes.filterBorderType);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-filter { ${borderCSS} }`);
		}
	}

	// Filter background (normal)
	if (attributes.filterBackground) {
		cssRules.push(`${selector} .ts-filter { background-color: ${attributes.filterBackground}; }`);
	}

	// Filter text color (normal)
	if (attributes.filterTextColor) {
		cssRules.push(`${selector} .ts-filter { color: ${attributes.filterTextColor}; }`);
	}

	// Filter typography
	if (attributes.filterTypography) {
		const typographyCSS = generateTypographyCSS(attributes.filterTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-filter { ${typographyCSS} }`);
		}
	}

	// Filter chevron color (normal)
	if (attributes.filterChevronColor) {
		cssRules.push(`${selector} .ts-filter .ts-down-icon i { color: ${attributes.filterChevronColor}; }`);
		cssRules.push(`${selector} .ts-filter .ts-down-icon svg { fill: ${attributes.filterChevronColor}; }`);
	}

	// Filter hover states
	if (attributes.filterBoxShadowHover) {
		const shadowCSS = generateBoxShadowCSS(attributes.filterBoxShadowHover);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter:hover { ${shadowCSS} }`);
		}
	}
	if (attributes.filterBorderColorHover) {
		cssRules.push(`${selector} .ts-filter:hover { border-color: ${attributes.filterBorderColorHover}; }`);
	}
	if (attributes.filterBackgroundHover) {
		cssRules.push(`${selector} .ts-filter:hover { background-color: ${attributes.filterBackgroundHover}; }`);
	}
	if (attributes.filterTextColorHover) {
		cssRules.push(`${selector} .ts-filter:hover { color: ${attributes.filterTextColorHover}; }`);
	}
	if (attributes.filterChevronColorHover) {
		cssRules.push(`${selector} .ts-filter:hover .ts-down-icon i { color: ${attributes.filterChevronColorHover}; }`);
		cssRules.push(`${selector} .ts-filter:hover .ts-down-icon svg { fill: ${attributes.filterChevronColorHover}; }`);
	}

	// ============================================
	// SECTION 7: Filter Dropdown (.ts-filled)
	// ============================================

	// Filter dropdown typography (filled)
	if (attributes.filterDropdownTypography) {
		const typographyCSS = generateTypographyCSS(attributes.filterDropdownTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-filter.ts-filled { ${typographyCSS} }`);
		}
	}

	// Filter dropdown background (filled)
	if (attributes.filterDropdownBackground) {
		cssRules.push(`${selector} .ts-filter.ts-filled { background-color: ${attributes.filterDropdownBackground}; }`);
	}

	// Filter dropdown text color (filled)
	if (attributes.filterDropdownTextColor) {
		cssRules.push(`${selector} .ts-filter.ts-filled { color: ${attributes.filterDropdownTextColor}; }`);
	}

	// Filter dropdown border color (filled)
	if (attributes.filterDropdownBorderColor) {
		cssRules.push(`${selector} .ts-filter.ts-filled { border-color: ${attributes.filterDropdownBorderColor}; }`);
	}

	// Filter dropdown border width (desktop)
	if (isSet(attributes.filterDropdownBorderWidth)) {
		cssRules.push(`${selector} .ts-filter.ts-filled { border-width: ${attributes.filterDropdownBorderWidth}px; }`);
	}
	// Border width (tablet)
	if (isSet(attributes.filterDropdownBorderWidth_tablet)) {
		tabletRules.push(`${selector} .ts-filter.ts-filled { border-width: ${attributes.filterDropdownBorderWidth_tablet}px; }`);
	}
	// Border width (mobile)
	if (isSet(attributes.filterDropdownBorderWidth_mobile)) {
		mobileRules.push(`${selector} .ts-filter.ts-filled { border-width: ${attributes.filterDropdownBorderWidth_mobile}px; }`);
	}

	// Filter dropdown box shadow (filled)
	if (attributes.filterDropdownBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.filterDropdownBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter.ts-filled { ${shadowCSS} }`);
		}
	}

	// Filter dropdown chevron color (filled)
	if (attributes.filterDropdownChevronColor) {
		cssRules.push(`${selector} .ts-filter.ts-filled .ts-down-icon i { color: ${attributes.filterDropdownChevronColor}; }`);
		cssRules.push(`${selector} .ts-filter.ts-filled .ts-down-icon svg { fill: ${attributes.filterDropdownChevronColor}; }`);
	}

	// ============================================
	// SECTION 8: Filter Input (.inline-input)
	// ============================================

	// Filter input placeholder color (normal)
	if (attributes.filterInputPlaceholderColor) {
		cssRules.push(`${selector} .inline-input::placeholder { color: ${attributes.filterInputPlaceholderColor}; }`);
	}

	// Filter input icon size (desktop)
	if (isSet(attributes.filterInputIconSize)) {
		cssRules.push(`${selector} .ts-input-icon i { font-size: ${attributes.filterInputIconSize}px; }`);
		cssRules.push(`${selector} .ts-input-icon svg { width: ${attributes.filterInputIconSize}px; height: ${attributes.filterInputIconSize}px; }`);
	}
	// Icon size (tablet)
	if (isSet(attributes.filterInputIconSize_tablet)) {
		tabletRules.push(`${selector} .ts-input-icon i { font-size: ${attributes.filterInputIconSize_tablet}px; }`);
		tabletRules.push(`${selector} .ts-input-icon svg { width: ${attributes.filterInputIconSize_tablet}px; height: ${attributes.filterInputIconSize_tablet}px; }`);
	}
	// Icon size (mobile)
	if (isSet(attributes.filterInputIconSize_mobile)) {
		mobileRules.push(`${selector} .ts-input-icon i { font-size: ${attributes.filterInputIconSize_mobile}px; }`);
		mobileRules.push(`${selector} .ts-input-icon svg { width: ${attributes.filterInputIconSize_mobile}px; height: ${attributes.filterInputIconSize_mobile}px; }`);
	}

	// Filter input icon color (normal)
	if (attributes.filterInputIconColor) {
		cssRules.push(`${selector} .ts-input-icon i { color: ${attributes.filterInputIconColor}; }`);
		cssRules.push(`${selector} .ts-input-icon svg { fill: ${attributes.filterInputIconColor}; }`);
	}

	// Filter input icon margin (desktop)
	if (isSet(attributes.filterInputIconMargin)) {
		cssRules.push(`${selector} .ts-input-icon i { margin-right: ${attributes.filterInputIconMargin}px; }`);
		cssRules.push(`${selector} .ts-input-icon svg { margin-right: ${attributes.filterInputIconMargin}px; }`);
	}
	// Icon margin (tablet)
	if (isSet(attributes.filterInputIconMargin_tablet)) {
		tabletRules.push(`${selector} .ts-input-icon i { margin-right: ${attributes.filterInputIconMargin_tablet}px; }`);
		tabletRules.push(`${selector} .ts-input-icon svg { margin-right: ${attributes.filterInputIconMargin_tablet}px; }`);
	}
	// Icon margin (mobile)
	if (isSet(attributes.filterInputIconMargin_mobile)) {
		mobileRules.push(`${selector} .ts-input-icon i { margin-right: ${attributes.filterInputIconMargin_mobile}px; }`);
		mobileRules.push(`${selector} .ts-input-icon svg { margin-right: ${attributes.filterInputIconMargin_mobile}px; }`);
	}

	// Filter input focus states
	if (attributes.filterInputBackgroundFocus) {
		cssRules.push(`${selector} .inline-input:focus { background-color: ${attributes.filterInputBackgroundFocus}; }`);
	}
	if (attributes.filterInputBorderColorFocus) {
		cssRules.push(`${selector} .inline-input:focus { border-color: ${attributes.filterInputBorderColorFocus}; }`);
	}

	// ============================================
	// SECTION 9: Single Order Event (.order-event)
	// ============================================

	// Single event avatar size (desktop)
	if (isSet(attributes.singleEventAvatarSize)) {
		cssRules.push(`${selector} .order-event .vx-avatar { width: ${attributes.singleEventAvatarSize}px; height: ${attributes.singleEventAvatarSize}px; }`);
	}
	// Avatar size (tablet)
	if (isSet(attributes.singleEventAvatarSize_tablet)) {
		tabletRules.push(`${selector} .order-event .vx-avatar { width: ${attributes.singleEventAvatarSize_tablet}px; height: ${attributes.singleEventAvatarSize_tablet}px; }`);
	}
	// Avatar size (mobile)
	if (isSet(attributes.singleEventAvatarSize_mobile)) {
		mobileRules.push(`${selector} .order-event .vx-avatar { width: ${attributes.singleEventAvatarSize_mobile}px; height: ${attributes.singleEventAvatarSize_mobile}px; }`);
	}

	// Single event avatar border radius (desktop)
	if (isSet(attributes.singleEventAvatarBorderRadius)) {
		cssRules.push(`${selector} .order-event .vx-avatar { border-radius: ${attributes.singleEventAvatarBorderRadius}px; }`);
	}
	// Avatar border radius (tablet)
	if (isSet(attributes.singleEventAvatarBorderRadius_tablet)) {
		tabletRules.push(`${selector} .order-event .vx-avatar { border-radius: ${attributes.singleEventAvatarBorderRadius_tablet}px; }`);
	}
	// Avatar border radius (mobile)
	if (isSet(attributes.singleEventAvatarBorderRadius_mobile)) {
		mobileRules.push(`${selector} .order-event .vx-avatar { border-radius: ${attributes.singleEventAvatarBorderRadius_mobile}px; }`);
	}

	// Single event order title typography
	if (attributes.singleEventOrderTitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleEventOrderTitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-event h3 { ${typographyCSS} }`);
		}
	}

	// Single event order title color
	if (attributes.singleEventOrderTitleColor) {
		cssRules.push(`${selector} .order-event h3 { color: ${attributes.singleEventOrderTitleColor}; }`);
	}

	// Single event title typography
	if (attributes.singleEventTitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleEventTitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-event > span { ${typographyCSS} }`);
		}
	}

	// Single event title color
	if (attributes.singleEventTitleColor) {
		cssRules.push(`${selector} .order-event > span { color: ${attributes.singleEventTitleColor}; }`);
	}

	// Single event details typography
	if (attributes.singleEventDetailsTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleEventDetailsTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-event p { ${typographyCSS} }`);
		}
	}

	// Single event details color
	if (attributes.singleEventDetailsColor) {
		cssRules.push(`${selector} .order-event p { color: ${attributes.singleEventDetailsColor}; }`);
	}

	// Single event divider color
	if (attributes.singleEventDividerColor) {
		cssRules.push(`${selector} .order-event:after { background-color: ${attributes.singleEventDividerColor}; }`);
	}

	// Single event files typography
	if (attributes.singleEventFilesTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleEventFilesTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-event .order-files a { ${typographyCSS} }`);
		}
	}

	// Single event files color
	if (attributes.singleEventFilesColor) {
		cssRules.push(`${selector} .order-event .order-files a { color: ${attributes.singleEventFilesColor}; }`);
	}

	// ============================================
	// SECTION 10: Single Event Box (.order-event-box)
	// ============================================

	// Single event box padding
	if (attributes.singleEventBoxPadding) {
		const paddingCSS = generateDimensionsCSS(attributes.singleEventBoxPadding as any, 'padding');
		if (paddingCSS) {
			cssRules.push(`${selector} .order-event-box { ${paddingCSS} }`);
		}
	}

	// Single event box border type
	if (attributes.singleEventBoxBorderType) {
		const borderCSS = generateBorderTypeCSS(attributes.singleEventBoxBorderType);
		if (borderCSS) {
			cssRules.push(`${selector} .order-event-box { ${borderCSS} }`);
		}
	}

	// Single event box border radius (desktop)
	if (isSet(attributes.singleEventBoxBorderRadius)) {
		cssRules.push(`${selector} .order-event-box { border-radius: ${attributes.singleEventBoxBorderRadius}px; }`);
	}
	// Border radius (tablet)
	if (isSet(attributes.singleEventBoxBorderRadius_tablet)) {
		tabletRules.push(`${selector} .order-event-box { border-radius: ${attributes.singleEventBoxBorderRadius_tablet}px; }`);
	}
	// Border radius (mobile)
	if (isSet(attributes.singleEventBoxBorderRadius_mobile)) {
		mobileRules.push(`${selector} .order-event-box { border-radius: ${attributes.singleEventBoxBorderRadius_mobile}px; }`);
	}

	// Single event box background
	if (attributes.singleEventBoxBackground) {
		cssRules.push(`${selector} .order-event-box { background-color: ${attributes.singleEventBoxBackground}; }`);
	}

	// ============================================
	// SECTION 11: Single Order Items (.ts-cart-list)
	// ============================================

	// Single item spacing (desktop)
	if (isSet(attributes.singleItemSpacing)) {
		cssRules.push(`${selector} .ts-cart-list li { margin-bottom: ${attributes.singleItemSpacing}px; }`);
	}
	// Item spacing (tablet)
	if (isSet(attributes.singleItemSpacing_tablet)) {
		tabletRules.push(`${selector} .ts-cart-list li { margin-bottom: ${attributes.singleItemSpacing_tablet}px; }`);
	}
	// Item spacing (mobile)
	if (isSet(attributes.singleItemSpacing_mobile)) {
		mobileRules.push(`${selector} .ts-cart-list li { margin-bottom: ${attributes.singleItemSpacing_mobile}px; }`);
	}

	// Single item content spacing (desktop)
	if (isSet(attributes.singleItemContentSpacing)) {
		cssRules.push(`${selector} .cart-item-details { gap: ${attributes.singleItemContentSpacing}px; }`);
	}
	// Content spacing (tablet)
	if (isSet(attributes.singleItemContentSpacing_tablet)) {
		tabletRules.push(`${selector} .cart-item-details { gap: ${attributes.singleItemContentSpacing_tablet}px; }`);
	}
	// Content spacing (mobile)
	if (isSet(attributes.singleItemContentSpacing_mobile)) {
		mobileRules.push(`${selector} .cart-item-details { gap: ${attributes.singleItemContentSpacing_mobile}px; }`);
	}

	// Single item picture size (desktop)
	if (isSet(attributes.singleItemPictureSize)) {
		cssRules.push(`${selector} .cart-image { width: ${attributes.singleItemPictureSize}px; height: ${attributes.singleItemPictureSize}px; }`);
	}
	// Picture size (tablet)
	if (isSet(attributes.singleItemPictureSize_tablet)) {
		tabletRules.push(`${selector} .cart-image { width: ${attributes.singleItemPictureSize_tablet}px; height: ${attributes.singleItemPictureSize_tablet}px; }`);
	}
	// Picture size (mobile)
	if (isSet(attributes.singleItemPictureSize_mobile)) {
		mobileRules.push(`${selector} .cart-image { width: ${attributes.singleItemPictureSize_mobile}px; height: ${attributes.singleItemPictureSize_mobile}px; }`);
	}

	// Single item picture radius (desktop)
	if (isSet(attributes.singleItemPictureRadius)) {
		cssRules.push(`${selector} .cart-image { border-radius: ${attributes.singleItemPictureRadius}px; }`);
	}
	// Picture radius (tablet)
	if (isSet(attributes.singleItemPictureRadius_tablet)) {
		tabletRules.push(`${selector} .cart-image { border-radius: ${attributes.singleItemPictureRadius_tablet}px; }`);
	}
	// Picture radius (mobile)
	if (isSet(attributes.singleItemPictureRadius_mobile)) {
		mobileRules.push(`${selector} .cart-image { border-radius: ${attributes.singleItemPictureRadius_mobile}px; }`);
	}

	// Single item title typography
	if (attributes.singleItemTitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleItemTitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-item-title a { ${typographyCSS} }`);
		}
	}

	// Single item title color
	if (attributes.singleItemTitleColor) {
		cssRules.push(`${selector} .order-item-title a { color: ${attributes.singleItemTitleColor}; }`);
	}

	// Single item subtitle typography
	if (attributes.singleItemSubtitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleItemSubtitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .cart-item-details > span { ${typographyCSS} }`);
		}
	}

	// Single item subtitle color
	if (attributes.singleItemSubtitleColor) {
		cssRules.push(`${selector} .cart-item-details > span { color: ${attributes.singleItemSubtitleColor}; }`);
	}

	// ============================================
	// SECTION 12: Single Table (.ts-cost-calculator)
	// ============================================

	// Single table list spacing (desktop)
	if (isSet(attributes.singleTableListSpacing)) {
		cssRules.push(`${selector} .ts-cost-calculator li { margin-bottom: ${attributes.singleTableListSpacing}px; }`);
	}
	// List spacing (tablet)
	if (isSet(attributes.singleTableListSpacing_tablet)) {
		tabletRules.push(`${selector} .ts-cost-calculator li { margin-bottom: ${attributes.singleTableListSpacing_tablet}px; }`);
	}
	// List spacing (mobile)
	if (isSet(attributes.singleTableListSpacing_mobile)) {
		mobileRules.push(`${selector} .ts-cost-calculator li { margin-bottom: ${attributes.singleTableListSpacing_mobile}px; }`);
	}

	// Single table typography
	if (attributes.singleTableTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleTableTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-cost-calculator li p { ${typographyCSS} }`);
		}
	}

	// Single table text color
	if (attributes.singleTableTextColor) {
		cssRules.push(`${selector} .ts-cost-calculator li p { color: ${attributes.singleTableTextColor}; }`);
	}

	// Single table typography (total)
	if (attributes.singleTableTypographyTotal) {
		const typographyCSS = generateTypographyCSS(attributes.singleTableTypographyTotal);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-cost-calculator .ts-total p { ${typographyCSS} }`);
		}
	}

	// Single table text color (total)
	if (attributes.singleTableTextColorTotal) {
		cssRules.push(`${selector} .ts-cost-calculator .ts-total p { color: ${attributes.singleTableTextColorTotal}; }`);
	}

	// ============================================
	// SECTION 13: Single Accordion Title (.order-accordion)
	// ============================================

	// Single accordion title typography
	if (attributes.singleAccordionTitleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleAccordionTitleTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-accordion summary { ${typographyCSS} }`);
		}
	}

	// Single accordion title color
	if (attributes.singleAccordionTitleColor) {
		cssRules.push(`${selector} .order-accordion summary { color: ${attributes.singleAccordionTitleColor}; }`);
	}

	// Single accordion icon color
	if (attributes.singleAccordionIconColor) {
		cssRules.push(`${selector} .order-accordion summary i { color: ${attributes.singleAccordionIconColor}; }`);
		cssRules.push(`${selector} .order-accordion summary svg { fill: ${attributes.singleAccordionIconColor}; }`);
	}

	// Single accordion divider color
	if (attributes.singleAccordionDividerColor) {
		cssRules.push(`${selector} .order-accordion { border-color: ${attributes.singleAccordionDividerColor}; }`);
	}

	// ============================================
	// SECTION 14: Single Notes
	// ============================================

	// Single notes typography
	if (attributes.singleNotesTypography) {
		const typographyCSS = generateTypographyCSS(attributes.singleNotesTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .order-notes p { ${typographyCSS} }`);
		}
	}

	// Single notes text color
	if (attributes.singleNotesTextColor) {
		cssRules.push(`${selector} .order-notes p { color: ${attributes.singleNotesTextColor}; }`);
	}

	// Single notes link color
	if (attributes.singleNotesLinkColor) {
		cssRules.push(`${selector} .order-notes a { color: ${attributes.singleNotesLinkColor}; }`);
	}

	// ============================================
	// SECTION 15: No Results (.ts-no-posts)
	// ============================================

	// No results content gap (desktop)
	if (isSet(attributes.noResultsContentGap)) {
		cssRules.push(`${selector} .ts-no-posts { gap: ${attributes.noResultsContentGap}px; }`);
	}
	// Content gap (tablet)
	if (isSet(attributes.noResultsContentGap_tablet)) {
		tabletRules.push(`${selector} .ts-no-posts { gap: ${attributes.noResultsContentGap_tablet}px; }`);
	}
	// Content gap (mobile)
	if (isSet(attributes.noResultsContentGap_mobile)) {
		mobileRules.push(`${selector} .ts-no-posts { gap: ${attributes.noResultsContentGap_mobile}px; }`);
	}

	// No results icon size (desktop)
	if (isSet(attributes.noResultsIconSize)) {
		cssRules.push(`${selector} .ts-no-posts i { font-size: ${attributes.noResultsIconSize}px; }`);
		cssRules.push(`${selector} .ts-no-posts svg { width: ${attributes.noResultsIconSize}px; height: ${attributes.noResultsIconSize}px; }`);
	}
	// Icon size (tablet)
	if (isSet(attributes.noResultsIconSize_tablet)) {
		tabletRules.push(`${selector} .ts-no-posts i { font-size: ${attributes.noResultsIconSize_tablet}px; }`);
		tabletRules.push(`${selector} .ts-no-posts svg { width: ${attributes.noResultsIconSize_tablet}px; height: ${attributes.noResultsIconSize_tablet}px; }`);
	}
	// Icon size (mobile)
	if (isSet(attributes.noResultsIconSize_mobile)) {
		mobileRules.push(`${selector} .ts-no-posts i { font-size: ${attributes.noResultsIconSize_mobile}px; }`);
		mobileRules.push(`${selector} .ts-no-posts svg { width: ${attributes.noResultsIconSize_mobile}px; height: ${attributes.noResultsIconSize_mobile}px; }`);
	}

	// No results icon color
	if (attributes.noResultsIconColor) {
		cssRules.push(`${selector} .ts-no-posts i { color: ${attributes.noResultsIconColor}; }`);
		cssRules.push(`${selector} .ts-no-posts svg { fill: ${attributes.noResultsIconColor}; }`);
	}

	// No results typography
	if (attributes.noResultsTypography) {
		const typographyCSS = generateTypographyCSS(attributes.noResultsTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-no-posts p { ${typographyCSS} }`);
		}
	}

	// No results text color
	if (attributes.noResultsTextColor) {
		cssRules.push(`${selector} .ts-no-posts p { color: ${attributes.noResultsTextColor}; }`);
	}

	// No results link color
	if (attributes.noResultsLinkColor) {
		cssRules.push(`${selector} .ts-no-posts a { color: ${attributes.noResultsLinkColor}; }`);
	}

	// ============================================
	// SECTION 16: Loading Spinner (.ts-loader)
	// ============================================

	// Loading spinner colors
	if (attributes.loadingSpinnerColor1) {
		cssRules.push(`${selector} .ts-loader:before { border-color: ${attributes.loadingSpinnerColor1}; }`);
	}
	if (attributes.loadingSpinnerColor2) {
		cssRules.push(`${selector} .ts-loader:after { border-top-color: ${attributes.loadingSpinnerColor2}; }`);
	}

	// ============================================
	// Combine CSS with media queries
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
