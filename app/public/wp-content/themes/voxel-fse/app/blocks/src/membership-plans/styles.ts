/**
 * Membership Plans Block - Style Generation
 *
 * Generates CSS for Style tab controls to match Voxel's pricing-plans widget.
 * All selectors verified against Voxel source.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
 *
 * @package VoxelFSE
 */

import type { MembershipPlansAttributes } from './types';

// Type definitions for style configs
interface TypographyConfig {
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacingUnit?: string;
	wordSpacing?: number;
	wordSpacingUnit?: string;
	textTransform?: string;
}

interface BorderGroupValue {
	borderType?: string;
	borderWidth?: {
		top?: string | number;
		right?: string | number;
		bottom?: string | number;
		left?: string | number;
		unit?: string;
	};
	borderColor?: string;
}

/**
 * Generate typography CSS properties from config
 */
function applyTypographyStyles(
	typography: TypographyConfig | undefined,
	selector: string
): string | undefined {
	if (!typography) return undefined;
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
	if (typography.wordSpacing !== undefined) {
		const unit = typography.wordSpacingUnit || 'px';
		rules.push(`word-spacing: ${typography.wordSpacing}${unit};`);
	}
	if (typography.textTransform && typography.textTransform !== 'none') {
		rules.push(`text-transform: ${typography.textTransform};`);
	}

	if (rules.length === 0) return undefined;
	return `${selector} { ${rules.join(' ')} }`;
}

/**
 * Generate border CSS from BorderGroupControl config
 */
function generateBorderCSS(
	border: BorderGroupValue | undefined,
	selector: string
): string | undefined {
	if (!border) return undefined;

	const { borderType, borderWidth, borderColor } = border;

	// If no border type or 'none', return empty
	if (!borderType || borderType === 'none' || borderType === '') return undefined;

	// Parse border width - use all 4 sides if different, or just one value if uniform
	let widthValue = '1px';
	if (borderWidth) {
		const unit = borderWidth.unit || 'px';
		const parseVal = (val: string | number | undefined): string => {
			if (val === undefined || val === '' || val === null) return '0';
			if (typeof val === 'string') {
				const match = val.match(/^([\d.]+)/);
				return match ? match[1] : '0';
			}
			return String(val);
		};
		const topW = parseVal(borderWidth.top);
		const rightW = parseVal(borderWidth.right);
		const bottomW = parseVal(borderWidth.bottom);
		const leftW = parseVal(borderWidth.left);

		// If all same, use single value; otherwise use 4-value shorthand
		if (topW === rightW && rightW === bottomW && bottomW === leftW) {
			widthValue = `${topW}${unit}`;
		} else {
			widthValue = `${topW}${unit} ${rightW}${unit} ${bottomW}${unit} ${leftW}${unit}`;
		}
	}

	const colorValue = borderColor || '#000';
	return `${selector} { border: ${widthValue} ${borderType} ${colorValue}; }`;
}

/**
 * Helper: Parse dimensions object to CSS padding/margin
 */
function parseDimensions(
	dimensions: Record<string, any> | undefined,
	_property: 'padding' | 'margin'
): string | undefined {
	if (!dimensions || typeof dimensions !== 'object') return undefined;

	const { top, right, bottom, left, unit = 'px' } = dimensions;

	// Parse values to handle empty strings from DimensionsControl
	const topVal = parseFloat(String(top)) || 0;
	const rightVal = parseFloat(String(right)) || 0;
	const bottomVal = parseFloat(String(bottom)) || 0;
	const leftVal = parseFloat(String(left)) || 0;

	// Only return if at least one value is non-zero
	if (topVal === 0 && rightVal === 0 && bottomVal === 0 && leftVal === 0) {
		return undefined;
	}

	return `${topVal}${unit} ${rightVal}${unit} ${bottomVal}${unit} ${leftVal}${unit}`;
}

/**
 * Generate box-shadow CSS value from BoxShadowPopup config
 */
function generateBoxShadowValue(
	shadow: Record<string, any> | undefined
): string | undefined {
	if (!shadow || Object.keys(shadow).length === 0) return undefined;

	const h = shadow['horizontal'] ?? 0;
	const v = shadow['vertical'] ?? 0;
	const blur = shadow['blur'] ?? 10;
	const spread = shadow['spread'] ?? 0;
	const color = shadow['color'] ?? 'rgba(0,0,0,0.5)';
	const position = shadow['position'] === 'inset' ? 'inset ' : '';

	return `${position}${h}px ${v}px ${blur}px ${spread}px ${color}`;
}

/**
 * Generate inline styles for edit.tsx (desktop only)
 * These styles are applied directly to the wrapper element.
 */
export function generateBlockStyles(_attributes: MembershipPlansAttributes): React.CSSProperties {
	const styles: React.CSSProperties = {};

	// Note: Most styles are CSS class-based (generated in generateBlockResponsiveCSS)
	// Only styles that need to be on the wrapper go here

	return styles;
}

/**
 * Generate responsive CSS for all Style tab controls
 * This generates scoped CSS rules with media queries.
 *
 * Evidence: All selectors verified against pricing-plans-widget.php
 */
export function generateBlockResponsiveCSS(
	attributes: MembershipPlansAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-membership-plans-${blockId}`;

	// ============================================
	// GENERAL TAB - Grid Layout
	// Source: pricing-plans-widget.php:103-128
	// ============================================

	// Base grid display - ensures grid works in both editor and frontend
	// On frontend, Voxel parent's pricing-plan.css provides display: grid,
	// but in the Gutenberg editor that CSS isn't loaded.
	cssRules.push(`${selector} .ts-plans-list { display: grid; }`);

	// Number of columns - pricing-plans-widget.php:103-107
	// Selector: '{{WRAPPER}} .ts-plans-list' => 'grid-template-columns: repeat({{VALUE}}, 1fr);'
	if (attributes.plansColumns !== undefined) {
		cssRules.push(
			`${selector} .ts-plans-list { grid-template-columns: repeat(${attributes.plansColumns}, 1fr); }`
		);
	}
	if (attributes.plansColumns_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plans-list { grid-template-columns: repeat(${attributes.plansColumns_tablet}, 1fr); }`
		);
	}
	if (attributes.plansColumns_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plans-list { grid-template-columns: repeat(${attributes.plansColumns_mobile}, 1fr); }`
		);
	}

	// Item gap - pricing-plans-widget.php:109-128
	// Selector: '{{WRAPPER}} .ts-plans-list' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.plansGap !== undefined) {
		cssRules.push(`${selector} .ts-plans-list { grid-gap: ${attributes.plansGap}px; }`);
	}
	if (attributes.plansGap_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-plans-list { grid-gap: ${attributes.plansGap_tablet}px; }`);
	}
	if (attributes.plansGap_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-plans-list { grid-gap: ${attributes.plansGap_mobile}px; }`);
	}

	// Border radius - pricing-plans-widget.php:140-161
	// Selector: '{{WRAPPER}} .ts-plan-container' => 'border-radius: {{SIZE}}{{UNIT}};'
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

	// Card border - pricing-plans-widget.php:130-137
	// Selector: '{{WRAPPER}} .ts-plan-container'
	if (attributes.plansBorderType) {
		const cardBorderCSS = generateBorderCSS(
			{
				borderType: attributes.plansBorderType,
				borderWidth: attributes.plansBorderWidth,
				borderColor: attributes.plansBorderColor,
			},
			`${selector} .ts-plan-container`
		);
		if (cardBorderCSS) cssRules.push(cardBorderCSS);
	}

	// Card background - pricing-plans-widget.php:163-173
	// Selector: '{{WRAPPER}} .ts-plan-container' => 'background-color: {{VALUE}}'
	if (attributes.plansBg) {
		cssRules.push(
			`${selector} .ts-plan-container { background-color: ${attributes.plansBg}; }`
		);
	}

	// Card box shadow - pricing-plans-widget.php:175-182
	// Selector: '{{WRAPPER}} .ts-plan-container' => 'box-shadow: ...'
	if (attributes.plansShadow && Object.keys(attributes.plansShadow).length > 0) {
		const shadowVal = generateBoxShadowValue(attributes.plansShadow);
		if (shadowVal) {
			cssRules.push(`${selector} .ts-plan-container { box-shadow: ${shadowVal}; }`);
		}
	}

	// ============================================
	// GENERAL TAB - Plan Body
	// Source: pricing-plans-widget.php:193-229
	// ============================================

	// Body padding - pricing-plans-widget.php:193-210
	// Selector: '{{WRAPPER}} .ts-plan-body' => 'padding: {{SIZE}}{{UNIT}};'
	if (attributes.bodyPadding !== undefined) {
		cssRules.push(`${selector} .ts-plan-body { padding: ${attributes.bodyPadding}px; }`);
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

	// Body content gap - pricing-plans-widget.php:212-229
	// Selector: '{{WRAPPER}} .ts-plan-body' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.bodyContentGap !== undefined) {
		cssRules.push(`${selector} .ts-plan-body { grid-gap: ${attributes.bodyContentGap}px; }`);
	}
	if (attributes.bodyContentGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-body { grid-gap: ${attributes.bodyContentGap_tablet}px; }`
		);
	}
	if (attributes.bodyContentGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-body { grid-gap: ${attributes.bodyContentGap_mobile}px; }`
		);
	}

	// ============================================
	// GENERAL TAB - Plan Image
	// Source: pricing-plans-widget.php:240-269
	// ============================================

	// Image padding - pricing-plans-widget.php:240-250
	// Selector: '{{WRAPPER}} .ts-plan-image img' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	const imagePadding = parseDimensions(attributes.imagePadding, 'padding');
	if (imagePadding) {
		cssRules.push(`${selector} .ts-plan-image img { padding: ${imagePadding}; }`);
	}
	const imagePadding_tablet = parseDimensions(attributes.imagePadding_tablet, 'padding');
	if (imagePadding_tablet) {
		tabletRules.push(`${selector} .ts-plan-image img { padding: ${imagePadding_tablet}; }`);
	}
	const imagePadding_mobile = parseDimensions(attributes.imagePadding_mobile, 'padding');
	if (imagePadding_mobile) {
		mobileRules.push(`${selector} .ts-plan-image img { padding: ${imagePadding_mobile}; }`);
	}

	// Image height - pricing-plans-widget.php:252-269
	// Selector: '{{WRAPPER}} .ts-plan-image img' => 'height: {{SIZE}}{{UNIT}};'
	if (attributes.imageHeight !== undefined && attributes.imageHeight > 0) {
		cssRules.push(`${selector} .ts-plan-image img { height: ${attributes.imageHeight}px; }`);
	}
	if (attributes.imageHeight_tablet !== undefined && attributes.imageHeight_tablet > 0) {
		tabletRules.push(
			`${selector} .ts-plan-image img { height: ${attributes.imageHeight_tablet}px; }`
		);
	}
	if (attributes.imageHeight_mobile !== undefined && attributes.imageHeight_mobile > 0) {
		mobileRules.push(
			`${selector} .ts-plan-image img { height: ${attributes.imageHeight_mobile}px; }`
		);
	}

	// ============================================
	// GENERAL TAB - Plan Pricing
	// Source: pricing-plans-widget.php:280-296
	// ============================================

	// Pricing align - pricing-plans-widget.php:280-296
	// Selector: '{{WRAPPER}} .ts-plan-pricing' => 'justify-content: {{VALUE}}'
	// Note: This is applied inline in the component, but we keep CSS generation for consistency
	if (attributes.pricingAlign) {
		cssRules.push(
			`${selector} .ts-plan-pricing { justify-content: ${attributes.pricingAlign}; }`
		);
	}

	// Price typography - pricing-plans-widget.php:297-304
	// Selector: '{{WRAPPER}} .ts-plan-price'
	if (attributes.priceTypography) {
		const priceTypoCSS = applyTypographyStyles(
			attributes.priceTypography,
			`${selector} .ts-plan-pricing .ts-plan-price`
		);
		if (priceTypoCSS) cssRules.push(priceTypoCSS);
	}

	// Price color - pricing-plans-widget.php:306-316
	// Selector: '{{WRAPPER}} .ts-plan-price' => 'color: {{VALUE}}'
	if (attributes.priceColor) {
		cssRules.push(
			`${selector} .ts-plan-pricing .ts-plan-price { color: ${attributes.priceColor}; }`
		);
	}

	// Period typography - pricing-plans-widget.php:318-325
	// Selector: '{{WRAPPER}} .ts-plan-pricing .ts-price-period'
	if (attributes.periodTypography) {
		const periodTypoCSS = applyTypographyStyles(
			attributes.periodTypography,
			`${selector} .ts-plan-pricing .ts-price-period`
		);
		if (periodTypoCSS) cssRules.push(periodTypoCSS);
	}

	// Period color - pricing-plans-widget.php:327-337
	// Selector: '{{WRAPPER}} .ts-plan-pricing .ts-price-period' => 'color: {{VALUE}}'
	if (attributes.periodColor) {
		cssRules.push(
			`${selector} .ts-plan-pricing .ts-price-period { color: ${attributes.periodColor}; }`
		);
	}

	// ============================================
	// GENERAL TAB - Plan Name
	// Source: pricing-plans-widget.php:348-364
	// ============================================

	// Content align - pricing-plans-widget.php:348-364
	// Selector: '{{WRAPPER}} .ts-plan-details' => 'justify-content: {{VALUE}}'
	// Note: This is applied inline in the component, but we keep CSS generation for consistency
	if (attributes.contentAlign) {
		cssRules.push(
			`${selector} .ts-plan-details { justify-content: ${attributes.contentAlign}; }`
		);
	}

	// Name typography - pricing-plans-widget.php:366-373
	// Selector: '{{WRAPPER}} .ts-plan-details .ts-plan-name'
	if (attributes.nameTypography) {
		const nameTypoCSS = applyTypographyStyles(
			attributes.nameTypography,
			`${selector} .ts-plan-details .ts-plan-name`
		);
		if (nameTypoCSS) cssRules.push(nameTypoCSS);
	}

	// Name color - pricing-plans-widget.php:375-385
	// Selector: '{{WRAPPER}} .ts-plan-details .ts-plan-name' => 'color: {{VALUE}}'
	if (attributes.nameColor) {
		cssRules.push(
			`${selector} .ts-plan-details .ts-plan-name { color: ${attributes.nameColor}; }`
		);
	}

	// ============================================
	// GENERAL TAB - Plan Description
	// Source: pricing-plans-widget.php:396-412
	// ============================================

	// Description align - pricing-plans-widget.php:396-412
	// Selector: '{{WRAPPER}} .ts-plan-desc p' => 'text-align: {{VALUE}}'
	// Note: This is applied inline in the component, but we keep CSS generation for consistency
	if (attributes.descAlign) {
		cssRules.push(`${selector} .ts-plan-desc p { text-align: ${attributes.descAlign}; }`);
	}

	// Description typography - pricing-plans-widget.php:414-421
	// Selector: '{{WRAPPER}} .ts-plan-desc p'
	if (attributes.descTypography) {
		const descTypoCSS = applyTypographyStyles(
			attributes.descTypography,
			`${selector} .ts-plan-desc p`
		);
		if (descTypoCSS) cssRules.push(descTypoCSS);
	}

	// Description color - pricing-plans-widget.php:423-433
	// Selector: '{{WRAPPER}} .ts-plan-desc p' => 'color: {{VALUE}}'
	if (attributes.descColor) {
		cssRules.push(`${selector} .ts-plan-desc p { color: ${attributes.descColor}; }`);
	}

	// ============================================
	// GENERAL TAB - Plan Features
	// Source: pricing-plans-widget.php:444-557
	// ============================================

	// List align - pricing-plans-widget.php:444-460
	// Selector: '{{WRAPPER}} .ts-plan-features ul' => 'align-items: {{VALUE}}'
	// Note: This is applied inline in the component, but we keep CSS generation for consistency
	if (attributes.listAlign) {
		cssRules.push(
			`${selector} .ts-plan-features ul { align-items: ${attributes.listAlign}; }`
		);
	}

	// List typography - pricing-plans-widget.php:485-492
	// Selector: '{{WRAPPER}} .ts-plan-features ul li'
	if (attributes.listTypography) {
		const listTypoCSS = applyTypographyStyles(
			attributes.listTypography,
			`${selector} .ts-plan-features ul li`
		);
		if (listTypoCSS) cssRules.push(listTypoCSS);
	}

	// List text color - pricing-plans-widget.php:494-504
	// Selector: '{{WRAPPER}} .ts-plan-features ul li' => 'color: {{VALUE}}'
	if (attributes.listColor) {
		cssRules.push(`${selector} .ts-plan-features ul li { color: ${attributes.listColor}; }`);
	}

	// List icon color - pricing-plans-widget.php:506-517
	// Selector: '{{WRAPPER}} .ts-plan-features ul li i' => 'color: {{VALUE}}'
	// Selector: '{{WRAPPER}} .ts-plan-features ul li svg' => 'fill: {{VALUE}}'
	if (attributes.listIconColor) {
		cssRules.push(
			`${selector} .ts-plan-features ul li i { color: ${attributes.listIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-plan-features ul li svg { fill: ${attributes.listIconColor}; }`
		);
	}

	// List gap - pricing-plans-widget.php:464-483
	// Selector: '{{WRAPPER}} .ts-plan-features ul' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.listGap !== undefined) {
		cssRules.push(`${selector} .ts-plan-features ul { grid-gap: ${attributes.listGap}px; }`);
	}
	if (attributes.listGap_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-features ul { grid-gap: ${attributes.listGap_tablet}px; }`
		);
	}
	if (attributes.listGap_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-features ul { grid-gap: ${attributes.listGap_mobile}px; }`
		);
	}

	// List icon size - pricing-plans-widget.php:519-537
	// Selector: '{{WRAPPER}} .ts-plan-features ul li i' => 'font-size: {{SIZE}}{{UNIT}};'
	// Selector: '{{WRAPPER}} .ts-plan-features ul li svg' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.listIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-features ul li i { font-size: ${attributes.listIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-features ul li svg { width: ${attributes.listIconSize}px; height: ${attributes.listIconSize}px; }`
		);
	}
	if (attributes.listIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-features ul li i { font-size: ${attributes.listIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-features ul li svg { width: ${attributes.listIconSize_tablet}px; height: ${attributes.listIconSize_tablet}px; }`
		);
	}
	if (attributes.listIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-features ul li i { font-size: ${attributes.listIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-features ul li svg { width: ${attributes.listIconSize_mobile}px; height: ${attributes.listIconSize_mobile}px; }`
		);
	}

	// List icon right padding - pricing-plans-widget.php:539-557
	// Selector: '{{WRAPPER}} .ts-plan-features ul li i' => 'padding-right: {{SIZE}}{{UNIT}};'
	// Selector: '{{WRAPPER}} .ts-plan-features ul li svg' => 'margin-right: {{SIZE}}{{UNIT}};'
	if (attributes.listIconRightPad !== undefined) {
		cssRules.push(
			`${selector} .ts-plan-features ul li i { padding-right: ${attributes.listIconRightPad}px; }`
		);
		cssRules.push(
			`${selector} .ts-plan-features ul li svg { margin-right: ${attributes.listIconRightPad}px; }`
		);
	}
	if (attributes.listIconRightPad_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-plan-features ul li i { padding-right: ${attributes.listIconRightPad_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-plan-features ul li svg { margin-right: ${attributes.listIconRightPad_tablet}px; }`
		);
	}
	if (attributes.listIconRightPad_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-plan-features ul li i { padding-right: ${attributes.listIconRightPad_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-plan-features ul li svg { margin-right: ${attributes.listIconRightPad_mobile}px; }`
		);
	}

	// ============================================
	// TABS ACCORDION - Normal State
	// Source: pricing-plans-widget.php:586-766
	// ============================================

	// Tabs disabled - pricing-plans-widget.php:595-607
	// Selector: '{{WRAPPER}} .ts-plan-tabs' => 'display: none;'
	// Note: This is handled via conditional rendering in the component

	// Tabs justify - pricing-plans-widget.php:609-627
	// Selector: '{{WRAPPER}} .ts-generic-tabs' => 'justify-content: {{VALUE}}'
	// Note: This is applied inline in the component, but we keep CSS generation for consistency
	if (attributes.tabsJustify) {
		cssRules.push(
			`${selector} .ts-generic-tabs { justify-content: ${attributes.tabsJustify}; }`
		);
	}

	// Tabs padding - pricing-plans-widget.php:629-639
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	const tabsPadding = parseDimensions(attributes.tabsPadding, 'padding');
	if (tabsPadding) {
		cssRules.push(`${selector} .ts-generic-tabs li a { padding: ${tabsPadding}; }`);
	}
	const tabsPadding_tablet = parseDimensions(attributes.tabsPadding_tablet, 'padding');
	if (tabsPadding_tablet) {
		tabletRules.push(`${selector} .ts-generic-tabs li a { padding: ${tabsPadding_tablet}; }`);
	}
	const tabsPadding_mobile = parseDimensions(attributes.tabsPadding_mobile, 'padding');
	if (tabsPadding_mobile) {
		mobileRules.push(`${selector} .ts-generic-tabs li a { padding: ${tabsPadding_mobile}; }`);
	}

	// Tabs margin - pricing-plans-widget.php:641-658
	// Selector: '{{WRAPPER}} .ts-generic-tabs li' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	const tabsMargin = parseDimensions(attributes.tabsMargin, 'margin');
	if (tabsMargin) {
		cssRules.push(`${selector} .ts-generic-tabs li { margin: ${tabsMargin}; }`);
	}
	const tabsMargin_tablet = parseDimensions(attributes.tabsMargin_tablet, 'margin');
	if (tabsMargin_tablet) {
		tabletRules.push(`${selector} .ts-generic-tabs li { margin: ${tabsMargin_tablet}; }`);
	}
	const tabsMargin_mobile = parseDimensions(attributes.tabsMargin_mobile, 'margin');
	if (tabsMargin_mobile) {
		mobileRules.push(`${selector} .ts-generic-tabs li { margin: ${tabsMargin_mobile}; }`);
	}

	// Tab typography - pricing-plans-widget.php:660-667
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabTypography) {
		const tabTypoCSS = applyTypographyStyles(
			attributes.tabTypography,
			`${selector} .ts-generic-tabs li a`
		);
		if (tabTypoCSS) cssRules.push(tabTypoCSS);
	}

	// Active tab typography - pricing-plans-widget.php:669-676
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabActiveTypography) {
		const tabActiveTypoCSS = applyTypographyStyles(
			attributes.tabActiveTypography,
			`${selector} .ts-generic-tabs li.ts-tab-active a`
		);
		if (tabActiveTypoCSS) cssRules.push(tabActiveTypoCSS);
	}

	// Tab text color - pricing-plans-widget.php:679-689
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a' => 'color: {{VALUE}}'
	if (attributes.tabTextColor) {
		cssRules.push(`${selector} .ts-generic-tabs li a { color: ${attributes.tabTextColor}; }`);
	}

	// Active tab text color - pricing-plans-widget.php:691-701
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a' => 'color: {{VALUE}}'
	if (attributes.tabActiveTextColor) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { color: ${attributes.tabActiveTextColor}; }`
		);
	}

	// Tab background - pricing-plans-widget.php:703-713
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a' => 'background-color: {{VALUE}}'
	if (attributes.tabBackground) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a { background-color: ${attributes.tabBackground}; }`
		);
	}

	// Active tab background - pricing-plans-widget.php:715-725
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a' => 'background-color: {{VALUE}}'
	if (attributes.tabActiveBackground) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { background-color: ${attributes.tabActiveBackground}; }`
		);
	}

	// Tab border - pricing-plans-widget.php:727-734
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabBorderType) {
		const borderCSS = generateBorderCSS(
			{
				borderType: attributes.tabBorderType,
				borderWidth: attributes.tabBorderWidth,
				borderColor: attributes.tabBorderColor,
			},
			`${selector} .ts-generic-tabs li a`
		);
		if (borderCSS) cssRules.push(borderCSS);
	}

	// Active tab border color - pricing-plans-widget.php:736-746
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a' => 'border-color: {{VALUE}}'
	if (attributes.tabActiveBorderColor) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a { border-color: ${attributes.tabActiveBorderColor}; }`
		);
	}

	// Tab border radius - pricing-plans-widget.php:748-766
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.tabsBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius}px; }`
		);
	}
	if (attributes.tabsBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius_tablet}px; }`
		);
	}
	if (attributes.tabsBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius_mobile}px; }`
		);
	}

	// ============================================
	// TABS ACCORDION - Hover State
	// Source: pricing-plans-widget.php:773-864
	// ============================================

	// Tab text color hover - pricing-plans-widget.php:789-799
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a:hover' => 'color: {{VALUE}}'
	if (attributes.tabTextColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a:hover { color: ${attributes.tabTextColorHover}; }`
		);
	}

	// Active tab text color hover - pricing-plans-widget.php:803-813
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a:hover' => 'color: {{VALUE}}'
	if (attributes.tabActiveTextColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a:hover { color: ${attributes.tabActiveTextColorHover}; }`
		);
	}

	// Tab border color hover - pricing-plans-widget.php:815-825
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a:hover' => 'border-color: {{VALUE}}'
	if (attributes.tabBorderColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a:hover { border-color: ${attributes.tabBorderColorHover}; }`
		);
	}

	// Active tab border color hover - pricing-plans-widget.php:827-837
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a:hover' => 'border-color: {{VALUE}}'
	if (attributes.tabActiveBorderColorHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a:hover { border-color: ${attributes.tabActiveBorderColorHover}; }`
		);
	}

	// Tab background hover - pricing-plans-widget.php:839-849
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a:hover' => 'background-color: {{VALUE}}'
	if (attributes.tabBackgroundHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li a:hover { background-color: ${attributes.tabBackgroundHover}; }`
		);
	}

	// Active tab background hover - pricing-plans-widget.php:851-861
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a:hover' => 'background-color: {{VALUE}}'
	if (attributes.tabActiveBackgroundHover) {
		cssRules.push(
			`${selector} .ts-generic-tabs li.ts-tab-active a:hover { background-color: ${attributes.tabActiveBackgroundHover}; }`
		);
	}

	// ============================================
	// PRIMARY BUTTON ACCORDION - Normal State
	// Source: pricing-plans-widget.php:893-1051
	// ============================================

	// Primary button typography - pricing-plans-widget.php:893-900
	// Selector: '{{WRAPPER}} .ts-btn-2'
	if (attributes.primaryBtnTypography) {
		const primaryBtnTypoCSS = applyTypographyStyles(
			attributes.primaryBtnTypography,
			`${selector} .ts-btn-2`
		);
		if (primaryBtnTypoCSS) cssRules.push(primaryBtnTypoCSS);
	}

	// Primary button border radius - pricing-plans-widget.php:903-928
	// Selector: '{{WRAPPER}} .ts-btn-2' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.primaryBtnRadius !== undefined) {
		cssRules.push(`${selector} .ts-btn-2 { border-radius: ${attributes.primaryBtnRadius}px; }`);
	}
	if (attributes.primaryBtnRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-btn-2 { border-radius: ${attributes.primaryBtnRadius_tablet}px; }`
		);
	}
	if (attributes.primaryBtnRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-btn-2 { border-radius: ${attributes.primaryBtnRadius_mobile}px; }`
		);
	}

	// Primary button text color - pricing-plans-widget.php:930-940
	// Selector: '{{WRAPPER}} .ts-btn-2' => 'color: {{VALUE}}'
	if (attributes.primaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn-2 { color: ${attributes.primaryBtnTextColor}; }`);
	}

	// Primary button padding - pricing-plans-widget.php:942-952
	// Selector: '{{WRAPPER}} .ts-btn-2' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	const primaryBtnPadding = parseDimensions(attributes.primaryBtnPadding, 'padding');
	if (primaryBtnPadding) {
		cssRules.push(`${selector} .ts-btn-2 { padding: ${primaryBtnPadding}; }`);
	}
	const primaryBtnPadding_tablet = parseDimensions(attributes.primaryBtnPadding_tablet, 'padding');
	if (primaryBtnPadding_tablet) {
		tabletRules.push(`${selector} .ts-btn-2 { padding: ${primaryBtnPadding_tablet}; }`);
	}
	const primaryBtnPadding_mobile = parseDimensions(attributes.primaryBtnPadding_mobile, 'padding');
	if (primaryBtnPadding_mobile) {
		mobileRules.push(`${selector} .ts-btn-2 { padding: ${primaryBtnPadding_mobile}; }`);
	}

	// Primary button height - pricing-plans-widget.php:954-971
	// Selector: '{{WRAPPER}} .ts-btn-2' => 'height: {{SIZE}}{{UNIT}};'
	if (attributes.primaryBtnHeight !== undefined && attributes.primaryBtnHeight > 0) {
		cssRules.push(`${selector} .ts-btn-2 { height: ${attributes.primaryBtnHeight}px; }`);
	}
	if (attributes.primaryBtnHeight_tablet !== undefined && attributes.primaryBtnHeight_tablet > 0) {
		tabletRules.push(`${selector} .ts-btn-2 { height: ${attributes.primaryBtnHeight_tablet}px; }`);
	}
	if (attributes.primaryBtnHeight_mobile !== undefined && attributes.primaryBtnHeight_mobile > 0) {
		mobileRules.push(`${selector} .ts-btn-2 { height: ${attributes.primaryBtnHeight_mobile}px; }`);
	}

	// Primary button background - pricing-plans-widget.php:974-984
	// Selector: '{{WRAPPER}} .ts-btn-2' => 'background: {{VALUE}}'
	if (attributes.primaryBtnBgColor) {
		cssRules.push(`${selector} .ts-btn-2 { background: ${attributes.primaryBtnBgColor}; }`);
	}

	// Primary button border - pricing-plans-widget.php:986-993
	// Selector: '{{WRAPPER}} .ts-btn-2'
	if (attributes.primaryBtnBorderType) {
		const borderCSS = generateBorderCSS(
			{
				borderType: attributes.primaryBtnBorderType,
				borderWidth: attributes.primaryBtnBorderWidth,
				borderColor: attributes.primaryBtnBorderColor,
			},
			`${selector} .ts-btn-2`
		);
		if (borderCSS) cssRules.push(borderCSS);
	}

	// Primary button icon size - pricing-plans-widget.php:996-1018
	// Selector: '{{WRAPPER}} .ts-btn-2 i' => 'font-size: {{SIZE}}{{UNIT}};'
	// Selector: '{{WRAPPER}} .ts-btn-2 svg' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.primaryBtnIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize}px; height: ${attributes.primaryBtnIconSize}px; }`
		);
	}
	if (attributes.primaryBtnIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize_tablet}px; height: ${attributes.primaryBtnIconSize_tablet}px; }`
		);
	}
	if (attributes.primaryBtnIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-btn-2 i { font-size: ${attributes.primaryBtnIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-btn-2 svg { width: ${attributes.primaryBtnIconSize_mobile}px; height: ${attributes.primaryBtnIconSize_mobile}px; }`
		);
	}

	// Primary button icon padding - pricing-plans-widget.php:1020-1037
	// Selector: '{{WRAPPER}} .ts-btn-2' => 'grid-gap: {{SIZE}}{{UNIT}};padding-right: 0px;'
	if (attributes.primaryBtnIconPad !== undefined) {
		cssRules.push(
			`${selector} .ts-btn-2 { grid-gap: ${attributes.primaryBtnIconPad}px; padding-right: 0px; }`
		);
	}
	if (attributes.primaryBtnIconPad_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-btn-2 { grid-gap: ${attributes.primaryBtnIconPad_tablet}px; padding-right: 0px; }`
		);
	}
	if (attributes.primaryBtnIconPad_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-btn-2 { grid-gap: ${attributes.primaryBtnIconPad_mobile}px; padding-right: 0px; }`
		);
	}

	// Primary button icon color - pricing-plans-widget.php:1039-1050
	// Selector: '{{WRAPPER}} .ts-btn-2 i' => 'color: {{VALUE}}'
	// Selector: '{{WRAPPER}} .ts-btn-2 svg' => 'fill: {{VALUE}}'
	if (attributes.primaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn-2 i { color: ${attributes.primaryBtnIconColor}; }`);
		cssRules.push(`${selector} .ts-btn-2 svg { fill: ${attributes.primaryBtnIconColor}; }`);
	}

	// ============================================
	// PRIMARY BUTTON ACCORDION - Hover State
	// Source: pricing-plans-widget.php:1054-1112
	// ============================================

	// Primary button text color hover - pricing-plans-widget.php:1061-1071
	// Selector: '{{WRAPPER}} .ts-btn-2:hover' => 'color: {{VALUE}}'
	if (attributes.primaryBtnTextColorHover) {
		cssRules.push(
			`${selector} .ts-btn-2:hover { color: ${attributes.primaryBtnTextColorHover}; }`
		);
	}

	// Primary button background hover - pricing-plans-widget.php:1073-1083
	// Selector: '{{WRAPPER}} .ts-btn-2:hover' => 'background: {{VALUE}}'
	if (attributes.primaryBtnBgColorHover) {
		cssRules.push(
			`${selector} .ts-btn-2:hover { background: ${attributes.primaryBtnBgColorHover}; }`
		);
	}

	// Primary button border color hover - pricing-plans-widget.php:1085-1095
	// Selector: '{{WRAPPER}} .ts-btn-2:hover' => 'border-color: {{VALUE}}'
	if (attributes.primaryBtnBorderColorHover) {
		cssRules.push(
			`${selector} .ts-btn-2:hover { border-color: ${attributes.primaryBtnBorderColorHover}; }`
		);
	}

	// Primary button icon color hover - pricing-plans-widget.php:1097-1108
	// Selector: '{{WRAPPER}} .ts-btn-2:hover i' => 'color: {{VALUE}}'
	// Selector: '{{WRAPPER}} .ts-btn-2:hover svg' => 'fill: {{VALUE}}'
	if (attributes.primaryBtnIconColorHover) {
		cssRules.push(
			`${selector} .ts-btn-2:hover i { color: ${attributes.primaryBtnIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-btn-2:hover svg { fill: ${attributes.primaryBtnIconColorHover}; }`
		);
	}

	// ============================================
	// SECONDARY BUTTON ACCORDION - Normal State
	// Source: pricing-plans-widget.php:1141-1300 (same pattern as primary)
	// ============================================

	// Secondary button typography
	// Selector: '{{WRAPPER}} .ts-btn-1'
	if (attributes.secondaryBtnTypography) {
		const secondaryBtnTypoCSS = applyTypographyStyles(
			attributes.secondaryBtnTypography,
			`${selector} .ts-btn-1`
		);
		if (secondaryBtnTypoCSS) cssRules.push(secondaryBtnTypoCSS);
	}

	// Secondary button border radius
	// Selector: '{{WRAPPER}} .ts-btn-1' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.secondaryBtnRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-btn-1 { border-radius: ${attributes.secondaryBtnRadius}px; }`
		);
	}
	if (attributes.secondaryBtnRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-btn-1 { border-radius: ${attributes.secondaryBtnRadius_tablet}px; }`
		);
	}
	if (attributes.secondaryBtnRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-btn-1 { border-radius: ${attributes.secondaryBtnRadius_mobile}px; }`
		);
	}

	// Secondary button text color
	// Selector: '{{WRAPPER}} .ts-btn-1' => 'color: {{VALUE}}'
	if (attributes.secondaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn-1 { color: ${attributes.secondaryBtnTextColor}; }`);
	}

	// Secondary button padding
	// Selector: '{{WRAPPER}} .ts-btn-1' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	const secondaryBtnPadding = parseDimensions(attributes.secondaryBtnPadding, 'padding');
	if (secondaryBtnPadding) {
		cssRules.push(`${selector} .ts-btn-1 { padding: ${secondaryBtnPadding}; }`);
	}
	const secondaryBtnPadding_tablet = parseDimensions(
		attributes.secondaryBtnPadding_tablet,
		'padding'
	);
	if (secondaryBtnPadding_tablet) {
		tabletRules.push(`${selector} .ts-btn-1 { padding: ${secondaryBtnPadding_tablet}; }`);
	}
	const secondaryBtnPadding_mobile = parseDimensions(
		attributes.secondaryBtnPadding_mobile,
		'padding'
	);
	if (secondaryBtnPadding_mobile) {
		mobileRules.push(`${selector} .ts-btn-1 { padding: ${secondaryBtnPadding_mobile}; }`);
	}

	// Secondary button height
	// Selector: '{{WRAPPER}} .ts-btn-1' => 'height: {{SIZE}}{{UNIT}};'
	if (attributes.secondaryBtnHeight !== undefined && attributes.secondaryBtnHeight > 0) {
		cssRules.push(`${selector} .ts-btn-1 { height: ${attributes.secondaryBtnHeight}px; }`);
	}
	if (
		attributes.secondaryBtnHeight_tablet !== undefined &&
		attributes.secondaryBtnHeight_tablet > 0
	) {
		tabletRules.push(
			`${selector} .ts-btn-1 { height: ${attributes.secondaryBtnHeight_tablet}px; }`
		);
	}
	if (
		attributes.secondaryBtnHeight_mobile !== undefined &&
		attributes.secondaryBtnHeight_mobile > 0
	) {
		mobileRules.push(
			`${selector} .ts-btn-1 { height: ${attributes.secondaryBtnHeight_mobile}px; }`
		);
	}

	// Secondary button background
	// Selector: '{{WRAPPER}} .ts-btn-1' => 'background: {{VALUE}}'
	if (attributes.secondaryBtnBgColor) {
		cssRules.push(`${selector} .ts-btn-1 { background: ${attributes.secondaryBtnBgColor}; }`);
	}

	// Secondary button border
	// Selector: '{{WRAPPER}} .ts-btn-1'
	if (attributes.secondaryBtnBorderType) {
		const borderCSS = generateBorderCSS(
			{
				borderType: attributes.secondaryBtnBorderType,
				borderWidth: attributes.secondaryBtnBorderWidth,
				borderColor: attributes.secondaryBtnBorderColor,
			},
			`${selector} .ts-btn-1`
		);
		if (borderCSS) cssRules.push(borderCSS);
	}

	// Secondary button icon size
	// Selector: '{{WRAPPER}} .ts-btn-1 i' => 'font-size: {{SIZE}}{{UNIT}};'
	// Selector: '{{WRAPPER}} .ts-btn-1 svg' => 'width: {{SIZE}}{{UNIT}};height: {{SIZE}}{{UNIT}};'
	if (attributes.secondaryBtnIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize}px; height: ${attributes.secondaryBtnIconSize}px; }`
		);
	}
	if (attributes.secondaryBtnIconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize_tablet}px; height: ${attributes.secondaryBtnIconSize_tablet}px; }`
		);
	}
	if (attributes.secondaryBtnIconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-btn-1 i { font-size: ${attributes.secondaryBtnIconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-btn-1 svg { width: ${attributes.secondaryBtnIconSize_mobile}px; height: ${attributes.secondaryBtnIconSize_mobile}px; }`
		);
	}

	// Secondary button icon padding
	// Selector: '{{WRAPPER}} .ts-btn-1' => 'grid-gap: {{SIZE}}{{UNIT}};padding-right: 0px;'
	if (attributes.secondaryBtnIconPad !== undefined) {
		cssRules.push(
			`${selector} .ts-btn-1 { grid-gap: ${attributes.secondaryBtnIconPad}px; padding-right: 0px; }`
		);
	}
	if (attributes.secondaryBtnIconPad_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-btn-1 { grid-gap: ${attributes.secondaryBtnIconPad_tablet}px; padding-right: 0px; }`
		);
	}
	if (attributes.secondaryBtnIconPad_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-btn-1 { grid-gap: ${attributes.secondaryBtnIconPad_mobile}px; padding-right: 0px; }`
		);
	}

	// Secondary button icon color
	// Selector: '{{WRAPPER}} .ts-btn-1 i' => 'color: {{VALUE}}'
	// Selector: '{{WRAPPER}} .ts-btn-1 svg' => 'fill: {{VALUE}}'
	if (attributes.secondaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn-1 i { color: ${attributes.secondaryBtnIconColor}; }`);
		cssRules.push(`${selector} .ts-btn-1 svg { fill: ${attributes.secondaryBtnIconColor}; }`);
	}

	// ============================================
	// SECONDARY BUTTON ACCORDION - Hover State
	// Source: pricing-plans-widget.php:1304-1362 (same pattern as primary)
	// ============================================

	// Secondary button text color hover
	// Selector: '{{WRAPPER}} .ts-btn-1:hover' => 'color: {{VALUE}}'
	if (attributes.secondaryBtnTextColorHover) {
		cssRules.push(
			`${selector} .ts-btn-1:hover { color: ${attributes.secondaryBtnTextColorHover}; }`
		);
	}

	// Secondary button background hover
	// Selector: '{{WRAPPER}} .ts-btn-1:hover' => 'background: {{VALUE}}'
	if (attributes.secondaryBtnBgColorHover) {
		cssRules.push(
			`${selector} .ts-btn-1:hover { background: ${attributes.secondaryBtnBgColorHover}; }`
		);
	}

	// Secondary button border color hover
	// Selector: '{{WRAPPER}} .ts-btn-1:hover' => 'border-color: {{VALUE}}'
	if (attributes.secondaryBtnBorderColorHover) {
		cssRules.push(
			`${selector} .ts-btn-1:hover { border-color: ${attributes.secondaryBtnBorderColorHover}; }`
		);
	}

	// Secondary button icon color hover
	// Selector: '{{WRAPPER}} .ts-btn-1:hover i' => 'color: {{VALUE}}'
	// Selector: '{{WRAPPER}} .ts-btn-1:hover svg' => 'fill: {{VALUE}}'
	if (attributes.secondaryBtnIconColorHover) {
		cssRules.push(
			`${selector} .ts-btn-1:hover i { color: ${attributes.secondaryBtnIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-btn-1:hover svg { fill: ${attributes.secondaryBtnIconColorHover}; }`
		);
	}

	// ============================================
	// VOXEL TAB - Sticky Positioning
	// ============================================
	if (attributes.stickyEnabled) {
		const applyStickyRules = (
			rules: string[],
			top?: number,
			right?: number,
			bottom?: number,
			left?: number,
			unit = 'px',
			displayMode = 'sticky'
		) => {
			if (displayMode === 'sticky') {
				rules.push(`${selector} { position: sticky; z-index: 100; }`);
				if (top !== undefined) rules.push(`${selector} { top: ${top}${unit}; }`);
				if (right !== undefined) rules.push(`${selector} { right: ${right}${unit}; }`);
				if (bottom !== undefined) rules.push(`${selector} { bottom: ${bottom}${unit}; }`);
				if (left !== undefined) rules.push(`${selector} { left: ${left}${unit}; }`);
			} else {
				rules.push(`${selector} { position: initial; }`);
			}
		};

		// Desktop
		applyStickyRules(
			cssRules,
			attributes.stickyTop,
			attributes.stickyRight,
			attributes.stickyBottom,
			attributes.stickyLeft,
			attributes.stickyTopUnit || 'px',
			attributes.stickyDesktop || 'sticky'
		);

		// Tablet
		applyStickyRules(
			tabletRules,
			attributes.stickyTop_tablet ?? attributes.stickyTop,
			attributes.stickyRight_tablet ?? attributes.stickyRight,
			attributes.stickyBottom_tablet ?? attributes.stickyBottom,
			attributes.stickyLeft_tablet ?? attributes.stickyLeft,
			attributes.stickyTopUnit || 'px',
			attributes.stickyTablet || 'sticky'
		);

		// Mobile
		applyStickyRules(
			mobileRules,
			attributes.stickyTop_mobile ?? attributes.stickyTop,
			attributes.stickyRight_mobile ?? attributes.stickyRight,
			attributes.stickyBottom_mobile ?? attributes.stickyBottom,
			attributes.stickyLeft_mobile ?? attributes.stickyLeft,
			attributes.stickyTopUnit || 'px',
			attributes.stickyMobile || 'sticky'
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
