/**
 * Listing Plans Block - CSS Generation
 *
 * Generates block-specific CSS targeting Voxel classes.
 * Works alongside generateAdvancedStyles() which handles AdvancedTab.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-listings/widgets/listing-plans-widget.php
 * - Voxel template: themes/voxel/app/modules/paid-listings/templates/frontend/listing-plans-widget.php
 *
 * @package VoxelFSE
 */

import type { ListingPlansAttributes } from './types';

/**
 * Generate inline styles for block wrapper
 * These are applied directly to the block element via the style attribute
 */
export function generateBlockStyles(
	_attributes: ListingPlansAttributes
): React.CSSProperties {
	// No inline styles needed - all styling is done via CSS generation
	// Keeping function signature for consistency with other blocks
	return {};
}

/**
 * Generate responsive CSS targeting Voxel classes
 * This handles block-specific controls from Style tab
 */
export function generateBlockResponsiveCSS(
	attributes: ListingPlansAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-listing-plans-${blockId}`;

	// ============================================
	// STYLE TAB - General Section
	// Source: listing-plans-widget.php
	// ============================================

	// Plans columns (grid)
	if (attributes.plansColumns !== undefined) {
		cssRules.push(
			`${selector} .ts-plans-list { --ts-plans-columns: ${attributes.plansColumns}; }`
		);
	}
	if (attributes.plansColumns_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plans-list { --ts-plans-columns: ${attributes.plansColumns_tablet}; }`
		);
	}
	if (attributes.plansColumns_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plans-list { --ts-plans-columns: ${attributes.plansColumns_mobile}; }`
		);
	}

	// Plans gap
	if (attributes.plansGap !== undefined) {
		cssRules.push(
			`${selector} .ts-plans-list { --ts-plans-gap: ${attributes.plansGap}px; }`
		);
	}
	if (attributes.plansGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plans-list { --ts-plans-gap: ${attributes.plansGap_tablet}px; }`
		);
	}
	if (attributes.plansGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plans-list { --ts-plans-gap: ${attributes.plansGap_mobile}px; }`
		);
	}

	// Plans border radius
	if (attributes.plansBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-container { border-radius: ${attributes.plansBorderRadius}px; }`
		);
	}
	if (attributes.plansBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-container { border-radius: ${attributes.plansBorderRadius_tablet}px; }`
		);
	}
	if (attributes.plansBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-container { border-radius: ${attributes.plansBorderRadius_mobile}px; }`
		);
	}

	// Plans border
	if (attributes.plansBorderType && attributes.plansBorderType !== 'none') {
		cssRules.push(
			`${selector} .ts-plan-container { border-style: ${attributes.plansBorderType}; }`
		);

		if (attributes.plansBorderWidth) {
			const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.plansBorderWidth as any;
			cssRules.push(
				`${selector} .ts-plan-container { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
			);
		}

		if (attributes.plansBorderColor) {
			cssRules.push(
				`${selector} .ts-plan-container { border-color: ${attributes.plansBorderColor}; }`
			);
		}
	}

	// Plans background
	if (attributes.plansBackground) {
		cssRules.push(
			`${selector} .ts-plan-container { background-color: ${attributes.plansBackground}; }`
		);
	}

	// Plans box shadow
	if (attributes.plansBoxShadow) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.plansBoxShadow as any;
		cssRules.push(
			`${selector} .ts-plan-container { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// Body padding
	if (attributes.bodyPadding !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-body { padding: ${attributes.bodyPadding}px; }`
		);
	}
	if (attributes.bodyPadding_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-body { padding: ${attributes.bodyPadding_tablet}px; }`
		);
	}
	if (attributes.bodyPadding_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-body { padding: ${attributes.bodyPadding_mobile}px; }`
		);
	}

	// Body content gap
	if (attributes.bodyContentGap !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-body { gap: ${attributes.bodyContentGap}px; }`
		);
	}
	if (attributes.bodyContentGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-body { gap: ${attributes.bodyContentGap_tablet}px; }`
		);
	}
	if (attributes.bodyContentGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-body { gap: ${attributes.bodyContentGap_mobile}px; }`
		);
	}

	// ============================================
	// STYLE TAB - Image Section
	// ============================================

	// Image padding
	if (attributes.imagePadding) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.imagePadding as any;
		cssRules.push(
			`${selector} .ts-plan-image { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Image height
	if (attributes.imageHeight !== undefined && attributes.imageHeight > 0) {
		cssRules.push(
			`${selector} .ts-plan-image { height: ${attributes.imageHeight}px; }`
		);
	}
	if (attributes.imageHeight_tablet !== undefined && attributes.imageHeight_tablet > 0) {
		tabletRules.push(
			`${selector} .ts-plan-image { height: ${attributes.imageHeight_tablet}px; }`
		);
	}
	if (attributes.imageHeight_mobile !== undefined && attributes.imageHeight_mobile > 0) {
		mobileRules.push(
			`${selector} .ts-plan-image { height: ${attributes.imageHeight_mobile}px; }`
		);
	}

	// ============================================
	// STYLE TAB - Pricing Section
	// ============================================

	// Pricing alignment
	if (attributes.pricingAlign) {
		cssRules.push(
			`${selector} .ts-plan-pricing { justify-content: ${attributes.pricingAlign}; }`
		);
	}

	// Price typography
	if (attributes.priceTypography && Object.keys(attributes.priceTypography).length > 0) {
		const typo = attributes.priceTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);
		if (typo.fontStyle) typoCss.push(`font-style: ${typo.fontStyle}`);
		if (typo.textDecoration) typoCss.push(`text-decoration: ${typo.textDecoration}`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-plan-price { ${typoCss.join('; ')}; }`);
		}
	}

	// Price color
	if (attributes.priceColor) {
		cssRules.push(
			`${selector} .ts-plan-price { color: ${attributes.priceColor}; }`
		);
	}

	// Period typography
	if (attributes.periodTypography && Object.keys(attributes.periodTypography).length > 0) {
		const typo = attributes.periodTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-price-period { ${typoCss.join('; ')}; }`);
		}
	}

	// Period color
	if (attributes.periodColor) {
		cssRules.push(
			`${selector} .ts-price-period { color: ${attributes.periodColor}; }`
		);
	}

	// ============================================
	// STYLE TAB - Content Section
	// ============================================

	// Content alignment
	if (attributes.contentAlign) {
		cssRules.push(
			`${selector} .ts-plan-details { justify-content: ${attributes.contentAlign}; }`
		);
	}

	// Name typography
	if (attributes.nameTypography && Object.keys(attributes.nameTypography).length > 0) {
		const typo = attributes.nameTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-plan-name { ${typoCss.join('; ')}; }`);
		}
	}

	// Name color
	if (attributes.nameColor) {
		cssRules.push(`${selector} .ts-plan-name { color: ${attributes.nameColor}; }`);
	}

	// Description alignment
	if (attributes.descAlign) {
		cssRules.push(
			`${selector} .ts-plan-desc { text-align: ${attributes.descAlign}; }`
		);
	}

	// Description typography
	if (attributes.descTypography && Object.keys(attributes.descTypography).length > 0) {
		const typo = attributes.descTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-plan-desc p { ${typoCss.join('; ')}; }`);
		}
	}

	// Description color
	if (attributes.descColor) {
		cssRules.push(`${selector} .ts-plan-desc p { color: ${attributes.descColor}; }`);
	}

	// ============================================
	// STYLE TAB - Features List Section
	// ============================================

	// List alignment
	if (attributes.listAlign) {
		cssRules.push(
			`${selector} .ts-plan-features { justify-content: ${attributes.listAlign}; }`
		);
	}

	// List gap
	if (attributes.listGap !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-features ul li { margin-bottom: ${attributes.listGap}px; }`
		);
	}
	if (attributes.listGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-features ul li { margin-bottom: ${attributes.listGap_tablet}px; }`
		);
	}
	if (attributes.listGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-features ul li { margin-bottom: ${attributes.listGap_mobile}px; }`
		);
	}

	// List icon size
	if (attributes.listIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-features ul li svg { width: ${attributes.listIconSize}px; height: ${attributes.listIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-features ul li i { font-size: ${attributes.listIconSize}px; }`
		);
	}
	if (attributes.listIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-features ul li svg { width: ${attributes.listIconSize_tablet}px; height: ${attributes.listIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-features ul li i { font-size: ${attributes.listIconSize_tablet}px; }`
		);
	}
	if (attributes.listIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-features ul li svg { width: ${attributes.listIconSize_mobile}px; height: ${attributes.listIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-features ul li i { font-size: ${attributes.listIconSize_mobile}px; }`
		);
	}

	// List icon right padding
	if (attributes.listIconRightPad !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-features ul li svg { margin-right: ${attributes.listIconRightPad}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-features ul li i { margin-right: ${attributes.listIconRightPad}px; }`
		);
	}
	if (attributes.listIconRightPad_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-features ul li svg { margin-right: ${attributes.listIconRightPad_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-features ul li i { margin-right: ${attributes.listIconRightPad_tablet}px; }`
		);
	}
	if (attributes.listIconRightPad_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-features ul li svg { margin-right: ${attributes.listIconRightPad_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-features ul li i { margin-right: ${attributes.listIconRightPad_mobile}px; }`
		);
	}

	// List typography
	if (attributes.listTypography && Object.keys(attributes.listTypography).length > 0) {
		const typo = attributes.listTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-plan-features ul li span { ${typoCss.join('; ')}; }`);
		}
	}

	// List color
	if (attributes.listColor) {
		cssRules.push(
			`${selector} .ts-plan-features ul li span { color: ${attributes.listColor}; }`
		);
	}

	// List icon color
	if (attributes.listIconColor) {
		cssRules.push(
			`${selector} .ts-plan-features ul li svg { fill: ${attributes.listIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-plan-features ul li i { color: ${attributes.listIconColor}; }`
		);
	}

	// ============================================
	// STYLE TAB - Tabs Section
	// ============================================

	// Tabs justify
	if (attributes.tabsJustify) {
		cssRules.push(
			`${selector} .ts-plan-tabs { justify-content: ${attributes.tabsJustify}; }`
		);
	}

	// Tabs padding
	if (attributes.tabsPadding) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.tabsPadding as any;
		cssRules.push(
			`${selector} .ts-plan-tabs li a { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Tabs margin
	if (attributes.tabsMargin) {
		const { top = 0, right = 15, bottom = 15, left = 0, unit = 'px' } = attributes.tabsMargin as any;
		cssRules.push(
			`${selector} .ts-plan-tabs { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Tabs border radius
	if (attributes.tabsBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-tabs li a { border-radius: ${attributes.tabsBorderRadius}px; }`
		);
	}

	// Tab typography
	if (attributes.tabTypography && Object.keys(attributes.tabTypography).length > 0) {
		const typo = attributes.tabTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-plan-tabs li a { ${typoCss.join('; ')}; }`);
		}
	}

	// Tab active typography
	if (attributes.tabActiveTypography && Object.keys(attributes.tabActiveTypography).length > 0) {
		const typo = attributes.tabActiveTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);

		if (typoCss.length > 0) {
			cssRules.push(
				`${selector} .ts-plan-tabs li.ts-tab-active a { ${typoCss.join('; ')}; }`
			);
		}
	}

	// Tab color
	if (attributes.tabColor) {
		cssRules.push(`${selector} .ts-plan-tabs li a { color: ${attributes.tabColor}; }`);
	}

	// Tab active color
	if (attributes.tabActiveColor) {
		cssRules.push(
			`${selector} .ts-plan-tabs li.ts-tab-active a { color: ${attributes.tabActiveColor}; }`
		);
	}

	// Tab border color
	if (attributes.tabBorderColor) {
		cssRules.push(
			`${selector} .ts-plan-tabs li a { border-color: ${attributes.tabBorderColor}; }`
		);
	}

	// Tab active border color
	if (attributes.tabActiveBorderColor) {
		cssRules.push(
			`${selector} .ts-plan-tabs li.ts-tab-active a { border-color: ${attributes.tabActiveBorderColor}; }`
		);
	}

	// Tab background
	if (attributes.tabBackground) {
		cssRules.push(
			`${selector} .ts-plan-tabs li a { background-color: ${attributes.tabBackground}; }`
		);
	}

	// Tab active background
	if (attributes.tabActiveBackground) {
		cssRules.push(
			`${selector} .ts-plan-tabs li.ts-tab-active a { background-color: ${attributes.tabActiveBackground}; }`
		);
	}

	// ============================================
	// STYLE TAB - Primary Button Section
	// ============================================

	// Primary button radius
	if (attributes.primaryBtnRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { border-radius: ${attributes.primaryBtnRadius}px; }`
		);
	}
	if (attributes.primaryBtnRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { border-radius: ${attributes.primaryBtnRadius_tablet}px; }`
		);
	}
	if (attributes.primaryBtnRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { border-radius: ${attributes.primaryBtnRadius_mobile}px; }`
		);
	}

	// Primary button height
	if (attributes.primaryBtnHeight !== undefined && attributes.primaryBtnHeight > 0) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { height: ${attributes.primaryBtnHeight}px; }`
		);
	}
	if (attributes.primaryBtnHeight_tablet !== undefined && attributes.primaryBtnHeight_tablet > 0) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { height: ${attributes.primaryBtnHeight_tablet}px; }`
		);
	}
	if (attributes.primaryBtnHeight_mobile !== undefined && attributes.primaryBtnHeight_mobile > 0) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { height: ${attributes.primaryBtnHeight_mobile}px; }`
		);
	}

	// Primary button icon size
	if (attributes.primaryBtnIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize}px; height: ${attributes.primaryBtnIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize}px; }`
		);
	}
	if (attributes.primaryBtnIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize_tablet}px; height: ${attributes.primaryBtnIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize_tablet}px; }`
		);
	}
	if (attributes.primaryBtnIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize_mobile}px; height: ${attributes.primaryBtnIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize_mobile}px; }`
		);
	}

	// Primary button icon padding
	if (attributes.primaryBtnIconPad !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { margin-left: ${attributes.primaryBtnIconPad}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { margin-left: ${attributes.primaryBtnIconPad}px; }`
		);
	}
	if (attributes.primaryBtnIconPad_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { margin-left: ${attributes.primaryBtnIconPad_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { margin-left: ${attributes.primaryBtnIconPad_tablet}px; }`
		);
	}
	if (attributes.primaryBtnIconPad_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { margin-left: ${attributes.primaryBtnIconPad_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { margin-left: ${attributes.primaryBtnIconPad_mobile}px; }`
		);
	}

	// Primary button typography
	if (attributes.primaryBtnTypography && Object.keys(attributes.primaryBtnTypography).length > 0) {
		const typo = attributes.primaryBtnTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);

		if (typoCss.length > 0) {
			cssRules.push(
				`${selector} .ts-plan-footer .ts-btn-2 { ${typoCss.join('; ')}; }`
			);
		}
	}

	// Primary button color
	if (attributes.primaryBtnColor) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { color: ${attributes.primaryBtnColor}; }`
		);
	}

	// Primary button background
	if (attributes.primaryBtnBg) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { background-color: ${attributes.primaryBtnBg}; }`
		);
	}

	// Primary button border
	if (attributes.primaryBtnBorderType && attributes.primaryBtnBorderType !== 'none') {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { border-style: ${attributes.primaryBtnBorderType}; }`
		);

		if (attributes.primaryBtnBorderWidth) {
			const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.primaryBtnBorderWidth as any;
			cssRules.push(
				`${selector} .ts-plan-footer .ts-btn-2 { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
			);
		}

		if (attributes.primaryBtnBorderColor) {
			cssRules.push(
				`${selector} .ts-plan-footer .ts-btn-2 { border-color: ${attributes.primaryBtnBorderColor}; }`
			);
		}
	}

	// Primary button box shadow
	if (attributes.primaryBtnBoxShadow) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.primaryBtnBoxShadow as any;
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// Primary button icon color
	if (attributes.primaryBtnIconColor) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 svg { fill: ${attributes.primaryBtnIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 i { color: ${attributes.primaryBtnIconColor}; }`
		);
	}

	// Primary button hover states
	if (attributes.primaryBtnColorHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2:hover { color: ${attributes.primaryBtnColorHover}; }`
		);
	}

	if (attributes.primaryBtnBgHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2:hover { background-color: ${attributes.primaryBtnBgHover}; }`
		);
	}

	if (attributes.primaryBtnBorderColorHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2:hover { border-color: ${attributes.primaryBtnBorderColorHover}; }`
		);
	}

	if (attributes.primaryBtnIconColorHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2:hover svg { fill: ${attributes.primaryBtnIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2:hover i { color: ${attributes.primaryBtnIconColorHover}; }`
		);
	}

	if (attributes.primaryBtnBoxShadowHover) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.primaryBtnBoxShadowHover as any;
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2:hover { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// Primary button padding
	if (attributes.primaryBtnPadding) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.primaryBtnPadding as any;
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.primaryBtnPadding_tablet) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.primaryBtnPadding_tablet as any;
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.primaryBtnPadding_mobile) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.primaryBtnPadding_mobile as any;
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-2 { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// ============================================
	// STYLE TAB - Secondary Button Section (ts-btn-1)
	// ============================================

	// Secondary button radius
	if (attributes.secondaryBtnRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { border-radius: ${attributes.secondaryBtnRadius}px; }`
		);
	}
	if (attributes.secondaryBtnRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { border-radius: ${attributes.secondaryBtnRadius_tablet}px; }`
		);
	}
	if (attributes.secondaryBtnRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { border-radius: ${attributes.secondaryBtnRadius_mobile}px; }`
		);
	}

	// Secondary button height
	if (attributes.secondaryBtnHeight !== undefined && attributes.secondaryBtnHeight > 0) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { height: ${attributes.secondaryBtnHeight}px; }`
		);
	}
	if (attributes.secondaryBtnHeight_tablet !== undefined && attributes.secondaryBtnHeight_tablet > 0) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { height: ${attributes.secondaryBtnHeight_tablet}px; }`
		);
	}
	if (attributes.secondaryBtnHeight_mobile !== undefined && attributes.secondaryBtnHeight_mobile > 0) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { height: ${attributes.secondaryBtnHeight_mobile}px; }`
		);
	}

	// Secondary button icon size
	if (attributes.secondaryBtnIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize}px; height: ${attributes.secondaryBtnIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize}px; }`
		);
	}
	if (attributes.secondaryBtnIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize_tablet}px; height: ${attributes.secondaryBtnIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize_tablet}px; }`
		);
	}
	if (attributes.secondaryBtnIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize_mobile}px; height: ${attributes.secondaryBtnIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize_mobile}px; }`
		);
	}

	// Secondary button icon padding
	if (attributes.secondaryBtnIconPad !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { margin-left: ${attributes.secondaryBtnIconPad}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { margin-left: ${attributes.secondaryBtnIconPad}px; }`
		);
	}
	if (attributes.secondaryBtnIconPad_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { margin-left: ${attributes.secondaryBtnIconPad_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { margin-left: ${attributes.secondaryBtnIconPad_tablet}px; }`
		);
	}
	if (attributes.secondaryBtnIconPad_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { margin-left: ${attributes.secondaryBtnIconPad_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { margin-left: ${attributes.secondaryBtnIconPad_mobile}px; }`
		);
	}

	// Secondary button typography
	if (attributes.secondaryBtnTypography && Object.keys(attributes.secondaryBtnTypography).length > 0) {
		const typo = attributes.secondaryBtnTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);

		if (typoCss.length > 0) {
			cssRules.push(
				`${selector} .ts-plan-footer .ts-btn-1 { ${typoCss.join('; ')}; }`
			);
		}
	}

	// Secondary button color
	if (attributes.secondaryBtnColor) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { color: ${attributes.secondaryBtnColor}; }`
		);
	}

	// Secondary button background
	if (attributes.secondaryBtnBg) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { background-color: ${attributes.secondaryBtnBg}; }`
		);
	}

	// Secondary button border
	if (attributes.secondaryBtnBorderType && attributes.secondaryBtnBorderType !== 'none') {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { border-style: ${attributes.secondaryBtnBorderType}; }`
		);

		if (attributes.secondaryBtnBorderWidth) {
			const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.secondaryBtnBorderWidth as any;
			cssRules.push(
				`${selector} .ts-plan-footer .ts-btn-1 { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
			);
		}

		if (attributes.secondaryBtnBorderColor) {
			cssRules.push(
				`${selector} .ts-plan-footer .ts-btn-1 { border-color: ${attributes.secondaryBtnBorderColor}; }`
			);
		}
	}

	// Secondary button box shadow
	if (attributes.secondaryBtnBoxShadow) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.secondaryBtnBoxShadow as any;
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// Secondary button icon color
	if (attributes.secondaryBtnIconColor) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 svg { fill: ${attributes.secondaryBtnIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 i { color: ${attributes.secondaryBtnIconColor}; }`
		);
	}

	// Secondary button padding
	if (attributes.secondaryBtnPadding) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.secondaryBtnPadding as any;
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.secondaryBtnPadding_tablet) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.secondaryBtnPadding_tablet as any;
		tabletRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.secondaryBtnPadding_mobile) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.secondaryBtnPadding_mobile as any;
		mobileRules.push(
			`${selector} .ts-plan-footer .ts-btn-1 { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Secondary button hover states
	if (attributes.secondaryBtnColorHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1:hover { color: ${attributes.secondaryBtnColorHover}; }`
		);
	}

	if (attributes.secondaryBtnBgHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1:hover { background-color: ${attributes.secondaryBtnBgHover}; }`
		);
	}

	if (attributes.secondaryBtnBorderColorHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1:hover { border-color: ${attributes.secondaryBtnBorderColorHover}; }`
		);
	}

	if (attributes.secondaryBtnIconColorHover) {
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1:hover svg { fill: ${attributes.secondaryBtnIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1:hover i { color: ${attributes.secondaryBtnIconColorHover}; }`
		);
	}

	if (attributes.secondaryBtnBoxShadowHover) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.secondaryBtnBoxShadowHover as any;
		cssRules.push(
			`${selector} .ts-plan-footer .ts-btn-1:hover { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// ============================================
	// STYLE TAB - Featured Plan Section
	// ============================================

	// Featured plan border
	if (attributes.featuredBorderType && attributes.featuredBorderType !== 'none') {
		cssRules.push(
			`${selector} .ts-plan-container.ts-featured-plan { border-style: ${attributes.featuredBorderType}; }`
		);

		if (attributes.featuredBorderWidth) {
			const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.featuredBorderWidth as any;
			cssRules.push(
				`${selector} .ts-plan-container.ts-featured-plan { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
			);
		}

		if (attributes.featuredBorderColor) {
			cssRules.push(
				`${selector} .ts-plan-container.ts-featured-plan { border-color: ${attributes.featuredBorderColor}; }`
			);
		}
	}

	// Featured plan box shadow
	if (attributes.featuredBoxShadow) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.featuredBoxShadow as any;
		cssRules.push(
			`${selector} .ts-plan-container.ts-featured-plan { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// Featured badge background
	if (attributes.featuredBadgeBg) {
		cssRules.push(
			`${selector} .ts-plan-container.ts-featured-plan .ts-featured-badge { background-color: ${attributes.featuredBadgeBg}; }`
		);
	}

	// Featured badge text color
	if (attributes.featuredBadgeColor) {
		cssRules.push(
			`${selector} .ts-plan-container.ts-featured-plan .ts-featured-badge { color: ${attributes.featuredBadgeColor}; }`
		);
	}

	// Featured badge typography
	if (attributes.featuredBadgeTypography && Object.keys(attributes.featuredBadgeTypography).length > 0) {
		const typo = attributes.featuredBadgeTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);
		if (typo.textTransform) typoCss.push(`text-transform: ${typo.textTransform}`);

		if (typoCss.length > 0) {
			cssRules.push(
				`${selector} .ts-plan-container.ts-featured-plan .ts-featured-badge { ${typoCss.join('; ')}; }`
			);
		}
	}

	// ============================================
	// STYLE TAB - Dialog Section
	// ============================================

	// Dialog typography
	if (attributes.dialogTypography && Object.keys(attributes.dialogTypography).length > 0) {
		const typo = attributes.dialogTypography as any;
		const typoCss: string[] = [];

		if (typo.fontSize) typoCss.push(`font-size: ${typo.fontSize}px`);
		if (typo.fontWeight) typoCss.push(`font-weight: ${typo.fontWeight}`);
		if (typo.lineHeight) typoCss.push(`line-height: ${typo.lineHeight}`);
		if (typo.letterSpacing) typoCss.push(`letter-spacing: ${typo.letterSpacing}px`);

		if (typoCss.length > 0) {
			cssRules.push(`${selector} .ts-popup-controller .ts-popup-head { ${typoCss.join('; ')}; }`);
		}
	}

	// Dialog color
	if (attributes.dialogColor) {
		cssRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { color: ${attributes.dialogColor}; }`
		);
	}

	// Dialog background
	if (attributes.dialogBackground) {
		cssRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { background-color: ${attributes.dialogBackground}; }`
		);
	}

	// Dialog border
	if (attributes.dialogBorderType && attributes.dialogBorderType !== 'none') {
		cssRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { border-style: ${attributes.dialogBorderType}; }`
		);

		if (attributes.dialogBorderWidth) {
			const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.dialogBorderWidth as any;
			cssRules.push(
				`${selector} .ts-popup-controller .ts-popup-head { border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
			);
		}

		if (attributes.dialogBorderColor) {
			cssRules.push(
				`${selector} .ts-popup-controller .ts-popup-head { border-color: ${attributes.dialogBorderColor}; }`
			);
		}
	}

	// Dialog box shadow
	if (attributes.dialogBoxShadow) {
		const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)' } = attributes.dialogBoxShadow as any;
		cssRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { box-shadow: ${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`
		);
	}

	// Dialog border radius
	if (attributes.dialogBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { border-radius: ${attributes.dialogBorderRadius}px; }`
		);
	}
	if (attributes.dialogBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { border-radius: ${attributes.dialogBorderRadius_tablet}px; }`
		);
	}
	if (attributes.dialogBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-popup-controller .ts-popup-head { border-radius: ${attributes.dialogBorderRadius_mobile}px; }`
		);
	}

	// ============================================
	// STYLE TAB - Tabs Hover States Section
	// ============================================

	// Tab hover text color
	if (attributes.tabsTextColorHover) {
		cssRules.push(
			`${selector} .ts-plan-tabs li a:hover { color: ${attributes.tabsTextColorHover}; }`
		);
	}

	// Tab active hover text color
	if (attributes.tabsActiveTextColorHover) {
		cssRules.push(
			`${selector} .ts-plan-tabs li.ts-tab-active a:hover { color: ${attributes.tabsActiveTextColorHover}; }`
		);
	}

	// Tab hover border color
	if (attributes.tabsBorderColorHover) {
		cssRules.push(
			`${selector} .ts-plan-tabs li a:hover { border-color: ${attributes.tabsBorderColorHover}; }`
		);
	}

	// Tab active hover border color
	if (attributes.tabsActiveBorderColorHover) {
		cssRules.push(
			`${selector} .ts-plan-tabs li.ts-tab-active a:hover { border-color: ${attributes.tabsActiveBorderColorHover}; }`
		);
	}

	// Tab hover background color
	if (attributes.tabsBgColorHover) {
		cssRules.push(
			`${selector} .ts-plan-tabs li a:hover { background-color: ${attributes.tabsBgColorHover}; }`
		);
	}

	// Tab active hover background color
	if (attributes.tabsActiveBgColorHover) {
		cssRules.push(
			`${selector} .ts-plan-tabs li.ts-tab-active a:hover { background-color: ${attributes.tabsActiveBgColorHover}; }`
		);
	}

	// Tab border type
	if (attributes.tabBorderType && attributes.tabBorderType !== 'default' && attributes.tabBorderType !== 'none') {
		cssRules.push(
			`${selector} .ts-plan-tabs li a { border-style: ${attributes.tabBorderType}; }`
		);
	}

	// ============================================
	// STYLE TAB - Responsive Dimensions
	// ============================================

	// Image padding responsive
	if (attributes.imagePadding_tablet) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.imagePadding_tablet as any;
		tabletRules.push(
			`${selector} .ts-plan-image { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.imagePadding_mobile) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.imagePadding_mobile as any;
		mobileRules.push(
			`${selector} .ts-plan-image { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Tabs padding responsive
	if (attributes.tabsPadding_tablet) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.tabsPadding_tablet as any;
		tabletRules.push(
			`${selector} .ts-plan-tabs li a { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.tabsPadding_mobile) {
		const { top = 0, right = 0, bottom = 0, left = 0, unit = 'px' } = attributes.tabsPadding_mobile as any;
		mobileRules.push(
			`${selector} .ts-plan-tabs li a { padding: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Tabs margin responsive
	if (attributes.tabsMargin_tablet) {
		const { top = 0, right = 15, bottom = 15, left = 0, unit = 'px' } = attributes.tabsMargin_tablet as any;
		tabletRules.push(
			`${selector} .ts-plan-tabs { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}
	if (attributes.tabsMargin_mobile) {
		const { top = 0, right = 15, bottom = 15, left = 0, unit = 'px' } = attributes.tabsMargin_mobile as any;
		mobileRules.push(
			`${selector} .ts-plan-tabs { margin: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; }`
		);
	}

	// Tabs border radius responsive
	if (attributes.tabsBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-tabs li a { border-radius: ${attributes.tabsBorderRadius_tablet}px; }`
		);
	}
	if (attributes.tabsBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-tabs li a { border-radius: ${attributes.tabsBorderRadius_mobile}px; }`
		);
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
