/**
 * Create Post Block - Style Generation
 *
 * Generates CSS from Style Tab inspector controls.
 * Targets Voxel CSS classes within a scoped block selector.
 *
 * @package VoxelFSE
 */

import type { CreatePostStyleAttributes, CreatePostAttributes } from './types';

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

interface BoxShadowConfig {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: string;
}

interface BorderConfig {
	width?: number;
	style?: string;
	color?: string;
}

interface BorderGroupValue {
	borderType?: string;
	top?: BorderConfig;
	right?: BorderConfig;
	bottom?: BorderConfig;
	left?: BorderConfig;
}

interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
}

/**
 * Safely parse a numeric value from a string that might already contain a unit
 */
function safeValue(value: any): string {
	if (value === undefined || value === null || value === '') return '0';
	const str = String(value);
	const match = str.match(/^([\d.]+)/);
	return match ? match[1] : '0';
}

/**
 * Generate dimensions CSS (padding/margin)
 */
function generateDimensionsCSS(dims: DimensionsConfig | undefined, property: string): string {
	if (!dims) return '';
	const unit = dims.unit || 'px';
	const top = dims.top !== undefined ? `${dims.top}${unit}` : '0';
	const right = dims.right !== undefined ? `${dims.right}${unit}` : '0';
	const bottom = dims.bottom !== undefined ? `${dims.bottom}${unit}` : '0';
	const left = dims.left !== undefined ? `${dims.left}${unit}` : '0';

	if (dims.top === undefined && dims.right === undefined && dims.bottom === undefined && dims.left === undefined) return '';

	return `${property}: ${top} ${right} ${bottom} ${left};`;
}

/**
 * Generate box-shadow CSS value from config
 */
function generateBoxShadowCSS(shadow: BoxShadowConfig | undefined): string {
	if (!shadow) return '';
	const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.5)', position = '' } = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
}

/**
 * Generate typography CSS properties from config
 */
function generateTypographyCSS(typography: TypographyConfig | undefined): string {
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
	if (typography.wordSpacing !== undefined) {
		const unit = typography.wordSpacingUnit || 'px';
		rules.push(`word-spacing: ${typography.wordSpacing}${unit};`);
	}
	if (typography.textTransform && typography.textTransform !== 'none') {
		rules.push(`text-transform: ${typography.textTransform};`);
	}

	return rules.join(' ');
}

/**
 * Generate border CSS from BorderGroupControl value
 */
function generateBorderCSS(border: BorderGroupValue | undefined): string {
	if (!border) return '';

	const { borderType = 'solid', top, right, bottom, left } = border;

	// If all sides have same values, use shorthand
	if (top && right && bottom && left) {
		const topW = top.width || 0;
		const rightW = right.width || 0;
		const bottomW = bottom.width || 0;
		const leftW = left.width || 0;

		if (topW === rightW && rightW === bottomW && bottomW === leftW) {
			const color = top.color || right.color || bottom.color || left.color || 'transparent';
			return `border: ${topW}px ${borderType} ${color};`;
		}
	}

	// Generate individual sides
	const rules: string[] = [];
	if (top && top.width) {
		rules.push(`border-top: ${top.width}px ${borderType} ${top.color || 'transparent'};`);
	}
	if (right && right.width) {
		rules.push(`border-right: ${right.width}px ${borderType} ${right.color || 'transparent'};`);
	}
	if (bottom && bottom.width) {
		rules.push(`border-bottom: ${bottom.width}px ${borderType} ${bottom.color || 'transparent'};`);
	}
	if (left && left.width) {
		rules.push(`border-left: ${left.width}px ${borderType} ${left.color || 'transparent'};`);
	}

	return rules.join(' ');
}

/**
 * Generate responsive CSS targeting Voxel classes within scoped block selector
 */
export function generateStyleTabResponsiveCSS(
	attributes: CreatePostStyleAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-create-post-${blockId}`;

	// ============================================
	// 1. FORM: HEAD
	// Source: create-post.php:387-587
	// ============================================

	// Hide form head (progress bar section)
	if (attributes.headHide) {
		cssRules.push(`${selector} .ts-form-progres { display: none !important; }`);
	}

	// Head spacing (bottom)
	if (attributes.headSpacing !== undefined) {
		cssRules.push(`${selector} .ts-form-progres { margin-bottom: ${safeValue(attributes.headSpacing)}px; }`);
	}
	if (attributes.headSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form-progres { margin-bottom: ${safeValue(attributes.headSpacing_tablet)}px; }`);
	}
	if (attributes.headSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form-progres { margin-bottom: ${safeValue(attributes.headSpacing_mobile)}px; }`);
	}

	// Hide steps bar
	if (attributes.stepsBarHide) {
		cssRules.push(`${selector} .step-percentage { display: none !important; }`);
	}

	// Steps bar height
	if (attributes.stepsBarHeight !== undefined) {
		cssRules.push(`${selector} .step-percentage { height: ${safeValue(attributes.stepsBarHeight)}px; }`);
	}
	if (attributes.stepsBarHeight_tablet !== undefined) {
		tabletRules.push(`${selector} .step-percentage { height: ${safeValue(attributes.stepsBarHeight_tablet)}px; }`);
	}
	if (attributes.stepsBarHeight_mobile !== undefined) {
		mobileRules.push(`${selector} .step-percentage { height: ${safeValue(attributes.stepsBarHeight_mobile)}px; }`);
	}

	// Steps bar border radius
	if (attributes.stepsBarRadius !== undefined) {
		cssRules.push(`${selector} .step-percentage { border-radius: ${safeValue(attributes.stepsBarRadius)}px; }`);
	}
	if (attributes.stepsBarRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .step-percentage { border-radius: ${safeValue(attributes.stepsBarRadius_tablet)}px; }`);
	}
	if (attributes.stepsBarRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .step-percentage { border-radius: ${safeValue(attributes.stepsBarRadius_mobile)}px; }`);
	}

	// Percentage spacing (bottom)
	if (attributes.percentageSpacing !== undefined) {
		cssRules.push(`${selector} .step-percentage { margin-bottom: ${safeValue(attributes.percentageSpacing)}px; }`);
	}
	if (attributes.percentageSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .step-percentage { margin-bottom: ${safeValue(attributes.percentageSpacing_tablet)}px; }`);
	}
	if (attributes.percentageSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .step-percentage { margin-bottom: ${safeValue(attributes.percentageSpacing_mobile)}px; }`);
	}

	// Progress bar background
	if (attributes.stepBarBg) {
		cssRules.push(`${selector} .step-percentage { background-color: ${attributes.stepBarBg}; }`);
	}

	// Progress background (filled)
	if (attributes.stepBarDone) {
		cssRules.push(`${selector} .step-percentage > div { background-color: ${attributes.stepBarDone}; }`);
	}

	// Step heading typography
	// Voxel selector: .active-step-details p (create-post.php:569)
	const currentStepTextTypo = generateTypographyCSS(attributes.currentStepText as TypographyConfig);
	if (currentStepTextTypo) {
		cssRules.push(`${selector} .active-step-details p { ${currentStepTextTypo} }`);
	}

	// Step heading color
	// Voxel selector: .active-step-details p (create-post.php:580)
	if (attributes.currentStepCol) {
		cssRules.push(`${selector} .active-step-details p { color: ${attributes.currentStepCol}; }`);
	}
	if (attributes.currentStepCol_tablet) {
		tabletRules.push(`${selector} .active-step-details p { color: ${attributes.currentStepCol_tablet}; }`);
	}
	if (attributes.currentStepCol_mobile) {
		mobileRules.push(`${selector} .active-step-details p { color: ${attributes.currentStepCol_mobile}; }`);
	}

	// ============================================
	// 2. HEAD: NEXT/PREV BUTTONS
	// Source: create-post.php:589-771
	// Voxel selector: .step-nav .ts-icon-btn (not .ts-btn-1)
	// ============================================

	// Button icon color (normal)
	if (attributes.fnavBtnColor) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn i { color: ${attributes.fnavBtnColor}; }`);
		cssRules.push(`${selector} .step-nav .ts-icon-btn svg { fill: ${attributes.fnavBtnColor}; }`);
	}

	// Button icon size
	if (attributes.fnavBtnIconSize !== undefined) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn i { font-size: ${safeValue(attributes.fnavBtnIconSize)}px; }`);
		cssRules.push(`${selector} .step-nav .ts-icon-btn svg { width: ${safeValue(attributes.fnavBtnIconSize)}px; height: ${safeValue(attributes.fnavBtnIconSize)}px; }`);
	}
	if (attributes.fnavBtnIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .step-nav .ts-icon-btn i { font-size: ${safeValue(attributes.fnavBtnIconSize_tablet)}px; }`);
		tabletRules.push(`${selector} .step-nav .ts-icon-btn svg { width: ${safeValue(attributes.fnavBtnIconSize_tablet)}px; height: ${safeValue(attributes.fnavBtnIconSize_tablet)}px; }`);
	}
	if (attributes.fnavBtnIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .step-nav .ts-icon-btn i { font-size: ${safeValue(attributes.fnavBtnIconSize_mobile)}px; }`);
		mobileRules.push(`${selector} .step-nav .ts-icon-btn svg { width: ${safeValue(attributes.fnavBtnIconSize_mobile)}px; height: ${safeValue(attributes.fnavBtnIconSize_mobile)}px; }`);
	}

	// Button background
	if (attributes.fnavBtnBg) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn { background-color: ${attributes.fnavBtnBg}; }`);
	}

	// Button border
	const fnavBtnBorderCSS = generateBorderCSS(attributes.fnavBtnBorder as BorderGroupValue);
	if (fnavBtnBorderCSS) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn { ${fnavBtnBorderCSS} }`);
	}

	// Button border radius
	if (attributes.fnavBtnRadius !== undefined) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn { border-radius: ${safeValue(attributes.fnavBtnRadius)}px; }`);
	}
	if (attributes.fnavBtnRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .step-nav .ts-icon-btn { border-radius: ${safeValue(attributes.fnavBtnRadius_tablet)}px; }`);
	}
	if (attributes.fnavBtnRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .step-nav .ts-icon-btn { border-radius: ${safeValue(attributes.fnavBtnRadius_mobile)}px; }`);
	}

	// Button size (width & height)
	if (attributes.fnavBtnSize !== undefined) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn { width: ${safeValue(attributes.fnavBtnSize)}px; height: ${safeValue(attributes.fnavBtnSize)}px; }`);
	}
	if (attributes.fnavBtnSize_tablet !== undefined) {
		tabletRules.push(`${selector} .step-nav .ts-icon-btn { width: ${safeValue(attributes.fnavBtnSize_tablet)}px; height: ${safeValue(attributes.fnavBtnSize_tablet)}px; }`);
	}
	if (attributes.fnavBtnSize_mobile !== undefined) {
		mobileRules.push(`${selector} .step-nav .ts-icon-btn { width: ${safeValue(attributes.fnavBtnSize_mobile)}px; height: ${safeValue(attributes.fnavBtnSize_mobile)}px; }`);
	}

	// Hover states
	if (attributes.fnavBtnColorHover) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn:hover i { color: ${attributes.fnavBtnColorHover}; }`);
		cssRules.push(`${selector} .step-nav .ts-icon-btn:hover svg { fill: ${attributes.fnavBtnColorHover}; }`);
	}
	if (attributes.fnavBtnBgHover) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn:hover { background-color: ${attributes.fnavBtnBgHover}; }`);
	}
	if (attributes.fnavBorderColorHover) {
		cssRules.push(`${selector} .step-nav .ts-icon-btn:hover { border-color: ${attributes.fnavBorderColorHover}; }`);
	}

	// ============================================
	// 3. FORM: FOOTER
	// Source: create-post.php:773-802
	// ============================================

	// Footer top spacing
	if (attributes.footerTopSpacing !== undefined) {
		cssRules.push(`${selector} .ts-form-footer { margin-top: ${safeValue(attributes.footerTopSpacing)}px; }`);
	}
	if (attributes.footerTopSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form-footer { margin-top: ${safeValue(attributes.footerTopSpacing_tablet)}px; }`);
	}
	if (attributes.footerTopSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form-footer { margin-top: ${safeValue(attributes.footerTopSpacing_mobile)}px; }`);
	}

	// ============================================
	// 4. FORM: FIELDS GENERAL
	// Source: create-post.php:fields-general
	// ============================================

	// Field label typography
	const sf1InputLabelTypo = generateTypographyCSS(attributes.sf1InputLabelTypo as TypographyConfig);
	if (sf1InputLabelTypo) {
		cssRules.push(`${selector} .ts-form-group label { ${sf1InputLabelTypo} }`);
	}

	// Field label color
	if (attributes.sf1InputLabelCol) {
		cssRules.push(`${selector} .ts-form-group label { color: ${attributes.sf1InputLabelCol}; }`);
	}

	// Field validation typography
	const sf1FieldReqTypo = generateTypographyCSS(attributes.sf1FieldReqTypo as TypographyConfig);
	if (sf1FieldReqTypo) {
		cssRules.push(`${selector} .field-required { ${sf1FieldReqTypo} }`);
	}

	// Field validation default color
	if (attributes.sf1FieldReqCol) {
		cssRules.push(`${selector} .field-required { color: ${attributes.sf1FieldReqCol}; }`);
	}

	// Field validation error color
	if (attributes.sf1FieldReqColErr) {
		cssRules.push(`${selector} .field-required.error { color: ${attributes.sf1FieldReqColErr}; }`);
	}

	// ============================================
	// 5. FORM: INPUT & TEXTAREA
	// Source: create-post.php:input-textarea
	// ============================================

	// Placeholder typography
	// Voxel selector: .ts-form input.ts-filter::placeholder (create-post.php:936-937)
	const intxtPlaceholderTypo = generateTypographyCSS(attributes.intxtPlaceholderTypo as TypographyConfig);
	if (intxtPlaceholderTypo) {
		cssRules.push(`${selector} .ts-form input.ts-filter::placeholder, ${selector} .ts-form textarea.ts-filter::placeholder { ${intxtPlaceholderTypo} }`);
	}

	// Placeholder color (normal)
	if (attributes.intxtPlaceholderCol) {
		cssRules.push(`${selector} .ts-form input.ts-filter::placeholder, ${selector} .ts-form textarea.ts-filter::placeholder { color: ${attributes.intxtPlaceholderCol}; }`);
	}

	// Value typography
	// Voxel selector: .ts-form input.ts-filter (create-post.php:986)
	const intxtValueTypo = generateTypographyCSS(attributes.intxtValueTypo as TypographyConfig);
	if (intxtValueTypo) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { ${intxtValueTypo} }`);
	}

	// Value color (normal)
	if (attributes.intxtValueCol) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { color: ${attributes.intxtValueCol}; }`);
	}

	// Background color (normal)
	if (attributes.intxtBg) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { background-color: ${attributes.intxtBg}; }`);
	}

	// Border (normal)
	const intxtBorderCSS = generateBorderCSS(attributes.intxtBorder as BorderGroupValue);
	if (intxtBorderCSS) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { ${intxtBorderCSS} }`);
	}

	// Input border radius
	// Voxel selector: .ts-form input.ts-filter (create-post.php:1058)
	if (attributes.intxtInputRadius !== undefined) {
		cssRules.push(`${selector} .ts-form input.ts-filter { border-radius: ${safeValue(attributes.intxtInputRadius)}px; }`);
	}
	if (attributes.intxtInputRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form input.ts-filter { border-radius: ${safeValue(attributes.intxtInputRadius_tablet)}px; }`);
	}
	if (attributes.intxtInputRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form input.ts-filter { border-radius: ${safeValue(attributes.intxtInputRadius_mobile)}px; }`);
	}

	// Input height
	// Voxel selector: .ts-form input.ts-filter (create-post.php:1077)
	if (attributes.intxtInputHeight !== undefined) {
		cssRules.push(`${selector} .ts-form input.ts-filter { height: ${safeValue(attributes.intxtInputHeight)}px; }`);
	}
	if (attributes.intxtInputHeight_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form input.ts-filter { height: ${safeValue(attributes.intxtInputHeight_tablet)}px; }`);
	}
	if (attributes.intxtInputHeight_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form input.ts-filter { height: ${safeValue(attributes.intxtInputHeight_mobile)}px; }`);
	}

	// Input padding
	if (attributes.intxtInputPadding !== undefined) {
		cssRules.push(`${selector} .ts-form input.ts-filter { padding: ${safeValue(attributes.intxtInputPadding)}px; }`);
	}
	if (attributes.intxtInputPadding_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form input.ts-filter { padding: ${safeValue(attributes.intxtInputPadding_tablet)}px; }`);
	}
	if (attributes.intxtInputPadding_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form input.ts-filter { padding: ${safeValue(attributes.intxtInputPadding_mobile)}px; }`);
	}

	// Textarea padding
	// Voxel selector: .ts-form textarea.ts-filter (create-post.php:1102)
	if (attributes.intxtTextareaPadding !== undefined) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter { padding: ${safeValue(attributes.intxtTextareaPadding)}px; }`);
	}
	if (attributes.intxtTextareaPadding_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form textarea.ts-filter { padding: ${safeValue(attributes.intxtTextareaPadding_tablet)}px; }`);
	}
	if (attributes.intxtTextareaPadding_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form textarea.ts-filter { padding: ${safeValue(attributes.intxtTextareaPadding_mobile)}px; }`);
	}

	// Textarea height
	// Voxel selector: .ts-form textarea.ts-filter (create-post.php:1125)
	if (attributes.intxtTextareaHeight !== undefined) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter { min-height: ${safeValue(attributes.intxtTextareaHeight)}px; }`);
	}
	if (attributes.intxtTextareaHeight_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form textarea.ts-filter { min-height: ${safeValue(attributes.intxtTextareaHeight_tablet)}px; }`);
	}
	if (attributes.intxtTextareaHeight_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form textarea.ts-filter { min-height: ${safeValue(attributes.intxtTextareaHeight_mobile)}px; }`);
	}

	// Textarea border radius
	// Voxel selector: .ts-form textarea.ts-filter (create-post.php:1148)
	if (attributes.intxtTextareaRadius !== undefined) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter { border-radius: ${safeValue(attributes.intxtTextareaRadius)}px; }`);
	}
	if (attributes.intxtTextareaRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form textarea.ts-filter { border-radius: ${safeValue(attributes.intxtTextareaRadius_tablet)}px; }`);
	}
	if (attributes.intxtTextareaRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form textarea.ts-filter { border-radius: ${safeValue(attributes.intxtTextareaRadius_mobile)}px; }`);
	}

	// Input with icon - icon color
	if (attributes.intxtIconCol) {
		cssRules.push(`${selector} .input-with-icon i { color: ${attributes.intxtIconCol}; }`);
	}

	// Icon size
	if (attributes.intxtIconSize !== undefined) {
		cssRules.push(`${selector} .input-with-icon i { font-size: ${safeValue(attributes.intxtIconSize)}px; }`);
	}
	if (attributes.intxtIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .input-with-icon i { font-size: ${safeValue(attributes.intxtIconSize_tablet)}px; }`);
	}
	if (attributes.intxtIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .input-with-icon i { font-size: ${safeValue(attributes.intxtIconSize_mobile)}px; }`);
	}

	// Icon side padding
	if (attributes.intxtIconMargin !== undefined) {
		cssRules.push(`${selector} .input-with-icon i { padding-left: ${safeValue(attributes.intxtIconMargin)}px; padding-right: ${safeValue(attributes.intxtIconMargin)}px; }`);
	}
	if (attributes.intxtIconMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .input-with-icon i { padding-left: ${safeValue(attributes.intxtIconMargin_tablet)}px; padding-right: ${safeValue(attributes.intxtIconMargin_tablet)}px; }`);
	}
	if (attributes.intxtIconMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .input-with-icon i { padding-left: ${safeValue(attributes.intxtIconMargin_mobile)}px; padding-right: ${safeValue(attributes.intxtIconMargin_mobile)}px; }`);
	}

	// Hover states
	// Voxel selector: .ts-form input.ts-filter:hover (create-post.php:1250-1290)
	if (attributes.intxtBgHover) {
		cssRules.push(`${selector} .ts-form input.ts-filter:hover, ${selector} .ts-form textarea.ts-filter:hover { background-color: ${attributes.intxtBgHover}; }`);
	}
	if (attributes.intxtBorderHover) {
		cssRules.push(`${selector} .ts-form input.ts-filter:hover, ${selector} .ts-form textarea.ts-filter:hover { border-color: ${attributes.intxtBorderHover}; }`);
	}
	if (attributes.intxtPlaceholderColHover) {
		cssRules.push(`${selector} .ts-form input.ts-filter:hover::placeholder, ${selector} .ts-form textarea.ts-filter:hover::placeholder { color: ${attributes.intxtPlaceholderColHover}; }`);
	}
	if (attributes.intxtValueColHover) {
		cssRules.push(`${selector} .ts-form input.ts-filter:hover, ${selector} .ts-form textarea.ts-filter:hover { color: ${attributes.intxtValueColHover}; }`);
	}
	if (attributes.intxtIconColHover) {
		cssRules.push(`${selector} .input-with-icon:hover i { color: ${attributes.intxtIconColHover}; }`);
	}

	// Active (focus) states
	// Voxel selector: .ts-form input.ts-filter:focus (create-post.php:1328-1370)
	if (attributes.intxtBgActive) {
		cssRules.push(`${selector} .ts-form input.ts-filter:focus, ${selector} .ts-form textarea.ts-filter:focus { background-color: ${attributes.intxtBgActive}; }`);
	}
	if (attributes.intxtBorderActive) {
		cssRules.push(`${selector} .ts-form input.ts-filter:focus, ${selector} .ts-form textarea.ts-filter:focus { border-color: ${attributes.intxtBorderActive}; }`);
	}
	if (attributes.intxtPlaceholderColActive) {
		cssRules.push(`${selector} .ts-form input.ts-filter:focus::placeholder, ${selector} .ts-form textarea.ts-filter:focus::placeholder { color: ${attributes.intxtPlaceholderColActive}; }`);
	}
	if (attributes.intxtValueColActive) {
		cssRules.push(`${selector} .ts-form input.ts-filter:focus, ${selector} .ts-form textarea.ts-filter:focus { color: ${attributes.intxtValueColActive}; }`);
	}

	// ============================================
	// 6. FORM: INPUT SUFFIX
	// Source: create-post.php:input-suffix
	// Voxel selector: .input-container .input-suffix (create-post.php:1397)
	// ============================================

	// Suffix typography
	const suffixTypo = generateTypographyCSS(attributes.suffixTypo as TypographyConfig);
	if (suffixTypo) {
		cssRules.push(`${selector} .input-container .input-suffix { ${suffixTypo} }`);
	}

	// Suffix text color
	if (attributes.suffixTextCol) {
		cssRules.push(`${selector} .input-container .input-suffix { color: ${attributes.suffixTextCol}; }`);
	}

	// Suffix background
	if (attributes.suffixBg) {
		cssRules.push(`${selector} .input-container .input-suffix { background-color: ${attributes.suffixBg}; }`);
	}

	// Suffix border radius
	if (attributes.suffixRadius !== undefined) {
		cssRules.push(`${selector} .input-container .input-suffix { border-radius: ${safeValue(attributes.suffixRadius)}px; }`);
	}
	if (attributes.suffixRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .input-container .input-suffix { border-radius: ${safeValue(attributes.suffixRadius_tablet)}px; }`);
	}
	if (attributes.suffixRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .input-container .input-suffix { border-radius: ${safeValue(attributes.suffixRadius_mobile)}px; }`);
	}

	// Suffix box shadow
	const suffixShadow = generateBoxShadowCSS(attributes.suffixShadow as BoxShadowConfig);
	if (suffixShadow) {
		cssRules.push(`${selector} .input-container .input-suffix { box-shadow: ${suffixShadow}; }`);
	}

	// Suffix side margin (Voxel uses right: for positioning, we use margin)
	if (attributes.suffixMargin !== undefined) {
		cssRules.push(`${selector} .input-container .input-suffix { right: ${safeValue(attributes.suffixMargin)}px; }`);
	}
	if (attributes.suffixMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .input-container .input-suffix { right: ${safeValue(attributes.suffixMargin_tablet)}px; }`);
	}
	if (attributes.suffixMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .input-container .input-suffix { right: ${safeValue(attributes.suffixMargin_mobile)}px; }`);
	}

	// Suffix icon color (Voxel: create-post.php:1483 targets svg)
	if (attributes.suffixIconCol) {
		cssRules.push(`${selector} .input-container .input-suffix i { color: ${attributes.suffixIconCol}; }`);
		cssRules.push(`${selector} .input-container .input-suffix svg { fill: ${attributes.suffixIconCol}; }`);
	}

	// ============================================
	// 7. FORM: POPUP BUTTON
	// Source: create-post.php:1530-1929 (styling-filters)
	// Voxel uses div.ts-filter (not .ts-filter) to avoid matching input.ts-filter
	// ============================================

	// Typography (normal) - Voxel: create-post.php:1530
	const popupBtnTypo = generateTypographyCSS(attributes.popupBtnTypo as TypographyConfig);
	if (popupBtnTypo) {
		cssRules.push(`${selector} .ts-form div.ts-filter { ${popupBtnTypo} }`);
	}

	// Box shadow (normal) - Voxel: create-post.php:1543
	const popupBtnShadow = generateBoxShadowCSS(attributes.popupBtnShadow as BoxShadowConfig);
	if (popupBtnShadow) {
		cssRules.push(`${selector} div.ts-filter { box-shadow: ${popupBtnShadow}; }`);
	}

	// Background color (normal) - Voxel: create-post.php:1556
	if (attributes.popupBtnBg) {
		cssRules.push(`${selector} .ts-form div.ts-filter { background: ${attributes.popupBtnBg}; }`);
	}

	// Text color (normal) - targets .ts-filter-text child element (Voxel: create-post.php:1569)
	if (attributes.popupBtnValueCol) {
		cssRules.push(`${selector} .ts-form div.ts-filter-text { color: ${attributes.popupBtnValueCol}; }`);
	}

	// Border (normal) - Voxel: create-post.php:1580
	const popupBtnBorderCSS = generateBorderCSS(attributes.popupBtnBorder as BorderGroupValue);
	if (popupBtnBorderCSS) {
		cssRules.push(`${selector} div.ts-filter { ${popupBtnBorderCSS} }`);
	}

	// Border radius - Voxel: create-post.php:1605
	if (attributes.popupBtnRadius !== undefined) {
		cssRules.push(`${selector} .ts-form div.ts-filter { border-radius: ${safeValue(attributes.popupBtnRadius)}px; }`);
	}
	if (attributes.popupBtnRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form div.ts-filter { border-radius: ${safeValue(attributes.popupBtnRadius_tablet)}px; }`);
	}
	if (attributes.popupBtnRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form div.ts-filter { border-radius: ${safeValue(attributes.popupBtnRadius_mobile)}px; }`);
	}

	// Height - Voxel: create-post.php:1629
	if (attributes.popupBtnHeight !== undefined) {
		cssRules.push(`${selector} div.ts-filter { height: ${safeValue(attributes.popupBtnHeight)}px; }`);
	}
	if (attributes.popupBtnHeight_tablet !== undefined) {
		tabletRules.push(`${selector} div.ts-filter { height: ${safeValue(attributes.popupBtnHeight_tablet)}px; }`);
	}
	if (attributes.popupBtnHeight_mobile !== undefined) {
		mobileRules.push(`${selector} div.ts-filter { height: ${safeValue(attributes.popupBtnHeight_mobile)}px; }`);
	}

	// Icon color - Voxel: create-post.php:1651-1652
	if (attributes.popupBtnIconCol) {
		cssRules.push(`${selector} div.ts-filter i { color: ${attributes.popupBtnIconCol}; }`);
		cssRules.push(`${selector} div.ts-filter svg { fill: ${attributes.popupBtnIconCol}; }`);
	}

	// Icon size - Voxel: create-post.php:1680-1681
	if (attributes.popupBtnIconSize !== undefined) {
		cssRules.push(`${selector} div.ts-filter i { font-size: ${safeValue(attributes.popupBtnIconSize)}px; }`);
		cssRules.push(`${selector} div.ts-filter svg { width: ${safeValue(attributes.popupBtnIconSize)}px; height: ${safeValue(attributes.popupBtnIconSize)}px; min-width: ${safeValue(attributes.popupBtnIconSize)}px; }`);
	}
	if (attributes.popupBtnIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} div.ts-filter i { font-size: ${safeValue(attributes.popupBtnIconSize_tablet)}px; }`);
		tabletRules.push(`${selector} div.ts-filter svg { width: ${safeValue(attributes.popupBtnIconSize_tablet)}px; height: ${safeValue(attributes.popupBtnIconSize_tablet)}px; min-width: ${safeValue(attributes.popupBtnIconSize_tablet)}px; }`);
	}
	if (attributes.popupBtnIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} div.ts-filter i { font-size: ${safeValue(attributes.popupBtnIconSize_mobile)}px; }`);
		mobileRules.push(`${selector} div.ts-filter svg { width: ${safeValue(attributes.popupBtnIconSize_mobile)}px; height: ${safeValue(attributes.popupBtnIconSize_mobile)}px; min-width: ${safeValue(attributes.popupBtnIconSize_mobile)}px; }`);
	}

	// Icon/Text spacing (grid-gap) - Voxel: create-post.php:1704
	if (attributes.popupBtnIconMargin !== undefined) {
		cssRules.push(`${selector} div.ts-filter { grid-gap: ${safeValue(attributes.popupBtnIconMargin)}px; }`);
	}
	if (attributes.popupBtnIconMargin_tablet !== undefined) {
		tabletRules.push(`${selector} div.ts-filter { grid-gap: ${safeValue(attributes.popupBtnIconMargin_tablet)}px; }`);
	}
	if (attributes.popupBtnIconMargin_mobile !== undefined) {
		mobileRules.push(`${selector} div.ts-filter { grid-gap: ${safeValue(attributes.popupBtnIconMargin_mobile)}px; }`);
	}

	// Hide chevron - Voxel: create-post.php:1729
	if (attributes.popupBtnChevronHide) {
		cssRules.push(`${selector} div.ts-filter .ts-down-icon { display: none !important; }`);
	}

	// Chevron color - Voxel: create-post.php:1740
	if (attributes.popupBtnChevronCol) {
		cssRules.push(`${selector} div.ts-filter .ts-down-icon { border-color: ${attributes.popupBtnChevronCol}; }`);
	}

	// Hover states - Voxel: create-post.php:1773
	if (attributes.popupBtnBgHover) {
		cssRules.push(`${selector} .ts-form div.ts-filter:hover { background: ${attributes.popupBtnBgHover}; }`);
	}
	// Hover text color - Voxel: create-post.php:1785
	if (attributes.popupBtnValueColHover) {
		cssRules.push(`${selector} .ts-form div.ts-filter:hover .ts-filter-text { color: ${attributes.popupBtnValueColHover}; }`);
	}
	// Hover border color
	if (attributes.popupBtnBorderHover) {
		cssRules.push(`${selector} div.ts-filter:hover { border-color: ${attributes.popupBtnBorderHover}; }`);
	}
	// Hover icon color - Voxel: create-post.php:1809-1810
	if (attributes.popupBtnIconColHover) {
		cssRules.push(`${selector} div.ts-filter:hover i { color: ${attributes.popupBtnIconColHover}; }`);
		cssRules.push(`${selector} div.ts-filter:hover svg { fill: ${attributes.popupBtnIconColHover}; }`);
	}

	// Hover box shadow - Voxel: create-post.php:1821
	const popupBtnShadowHover = generateBoxShadowCSS(attributes.popupBtnShadowHover as BoxShadowConfig);
	if (popupBtnShadowHover) {
		cssRules.push(`${selector} div.ts-filter:hover { box-shadow: ${popupBtnShadowHover}; }`);
	}

	// Filled state typography - Voxel: create-post.php:1852
	const popupBtnTypoFilled = generateTypographyCSS(attributes.popupBtnTypoFilled as TypographyConfig);
	if (popupBtnTypoFilled) {
		cssRules.push(`${selector} div.ts-filter.ts-filled { ${popupBtnTypoFilled} }`);
	}

	// Filled state styles - Voxel: create-post.php:1862
	if (attributes.popupBtnBgFilled) {
		cssRules.push(`${selector} .ts-form div.ts-filter.ts-filled { background-color: ${attributes.popupBtnBgFilled}; }`);
	}
	// Filled text color - Voxel: create-post.php:1874
	if (attributes.popupBtnValueColFilled) {
		cssRules.push(`${selector} div.ts-filter.ts-filled .ts-filter-text { color: ${attributes.popupBtnValueColFilled}; }`);
	}
	// Filled icon color - Voxel: create-post.php:1886-1887
	if (attributes.popupBtnIconColFilled) {
		cssRules.push(`${selector} div.ts-filter.ts-filled i { color: ${attributes.popupBtnIconColFilled}; }`);
		cssRules.push(`${selector} div.ts-filter.ts-filled svg { fill: ${attributes.popupBtnIconColFilled}; }`);
	}
	// Filled border color - Voxel: create-post.php:1899
	if (attributes.popupBtnBorderFilled) {
		cssRules.push(`${selector} .ts-form div.ts-filter.ts-filled { border-color: ${attributes.popupBtnBorderFilled}; }`);
	}

	// Filled border width - Voxel: create-post.php:1919
	if (attributes.popupBtnBorderWidthFilled !== undefined) {
		cssRules.push(`${selector} .ts-form div.ts-filter.ts-filled { border-width: ${safeValue(attributes.popupBtnBorderWidthFilled)}px; }`);
	}
	if (attributes.popupBtnBorderWidthFilled_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form div.ts-filter.ts-filled { border-width: ${safeValue(attributes.popupBtnBorderWidthFilled_tablet)}px; }`);
	}
	if (attributes.popupBtnBorderWidthFilled_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form div.ts-filter.ts-filled { border-width: ${safeValue(attributes.popupBtnBorderWidthFilled_mobile)}px; }`);
	}

	// Filled box shadow - Voxel: create-post.php:1929
	const popupBtnShadowFilled = generateBoxShadowCSS(attributes.popupBtnShadowFilled as BoxShadowConfig);
	if (popupBtnShadowFilled) {
		cssRules.push(`${selector} div.ts-filter.ts-filled { box-shadow: ${popupBtnShadowFilled}; }`);
	}

	// ============================================
	// 8. FORM: PRIMARY BUTTON
	// Source: create-post.php (submit button)
	// Voxel classes: .ts-btn.ts-btn-1, .ts-btn.ts-btn-1 i, .ts-btn.ts-btn-1 svg
	// ============================================

	// Primary button typography
	const submitBtnTypo = generateTypographyCSS(attributes.submitBtnTypo as TypographyConfig);
	if (submitBtnTypo) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { ${submitBtnTypo} }`);
	}

	// Primary button border
	const formBtnBorder = generateBorderCSS(attributes.formBtnBorder as BorderGroupValue);
	if (formBtnBorder) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { ${formBtnBorder} }`);
	}

	// Primary button border radius
	if (attributes.formBtnRadius !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { border-radius: ${safeValue(attributes.formBtnRadius)}px; }`);
	}
	if (attributes.formBtnRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-1 { border-radius: ${safeValue(attributes.formBtnRadius_tablet)}px; }`);
	}
	if (attributes.formBtnRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-1 { border-radius: ${safeValue(attributes.formBtnRadius_mobile)}px; }`);
	}

	// Primary button box shadow
	const formBtnShadow = generateBoxShadowCSS(attributes.formBtnShadow as BoxShadowConfig);
	if (formBtnShadow) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { box-shadow: ${formBtnShadow}; }`);
	}

	// Primary button text color
	if (attributes.formBtnColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { color: ${attributes.formBtnColor}; }`);
	}

	// Primary button background
	if (attributes.formBtnBg) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 { background-color: ${attributes.formBtnBg}; }`);
	}

	// Primary button icon size
	if (attributes.formBtnIconSize !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { font-size: ${safeValue(attributes.formBtnIconSize)}px; width: ${safeValue(attributes.formBtnIconSize)}px; height: ${safeValue(attributes.formBtnIconSize)}px; }`);
	}
	if (attributes.formBtnIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { font-size: ${safeValue(attributes.formBtnIconSize_tablet)}px; width: ${safeValue(attributes.formBtnIconSize_tablet)}px; height: ${safeValue(attributes.formBtnIconSize_tablet)}px; }`);
	}
	if (attributes.formBtnIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { font-size: ${safeValue(attributes.formBtnIconSize_mobile)}px; width: ${safeValue(attributes.formBtnIconSize_mobile)}px; height: ${safeValue(attributes.formBtnIconSize_mobile)}px; }`);
	}

	// Primary button icon color
	if (attributes.formBtnIconColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { color: ${attributes.formBtnIconColor}; fill: ${attributes.formBtnIconColor}; }`);
	}

	// Primary button icon margin
	if (attributes.formBtnIconMargin !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { margin-right: ${safeValue(attributes.formBtnIconMargin)}px; }`);
	}
	if (attributes.formBtnIconMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { margin-right: ${safeValue(attributes.formBtnIconMargin_tablet)}px; }`);
	}
	if (attributes.formBtnIconMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-1 i, ${selector} .ts-btn.ts-btn-1 svg { margin-right: ${safeValue(attributes.formBtnIconMargin_mobile)}px; }`);
	}

	// Primary button hover states
	if (attributes.formBtnColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { color: ${attributes.formBtnColorHover}; }`);
	}
	if (attributes.formBtnBgHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { background-color: ${attributes.formBtnBgHover}; }`);
	}
	if (attributes.formBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { border-color: ${attributes.formBtnBorderColorHover}; }`);
	}
	const formBtnShadowHover = generateBoxShadowCSS(attributes.formBtnShadowHover as BoxShadowConfig);
	if (formBtnShadowHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover { box-shadow: ${formBtnShadowHover}; }`);
	}
	if (attributes.formBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-1:hover i, ${selector} .ts-btn.ts-btn-1:hover svg { color: ${attributes.formBtnIconColorHover}; fill: ${attributes.formBtnIconColorHover}; }`);
	}

	// ============================================
	// 9. FORM: SECONDARY BUTTON
	// Source: create-post.php
	// Voxel classes: .ts-btn.ts-btn-2, .ts-btn.ts-btn-2 i, .ts-btn.ts-btn-2 svg
	// ============================================

	// Secondary button icon color
	if (attributes.scndryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { color: ${attributes.scndryBtnIconColor}; fill: ${attributes.scndryBtnIconColor}; }`);
	}

	// Secondary button icon size
	if (attributes.scndryBtnIconSize !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { font-size: ${safeValue(attributes.scndryBtnIconSize)}px; width: ${safeValue(attributes.scndryBtnIconSize)}px; height: ${safeValue(attributes.scndryBtnIconSize)}px; }`);
	}
	if (attributes.scndryBtnIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { font-size: ${safeValue(attributes.scndryBtnIconSize_tablet)}px; width: ${safeValue(attributes.scndryBtnIconSize_tablet)}px; height: ${safeValue(attributes.scndryBtnIconSize_tablet)}px; }`);
	}
	if (attributes.scndryBtnIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { font-size: ${safeValue(attributes.scndryBtnIconSize_mobile)}px; width: ${safeValue(attributes.scndryBtnIconSize_mobile)}px; height: ${safeValue(attributes.scndryBtnIconSize_mobile)}px; }`);
	}

	// Secondary button icon margin
	if (attributes.scndryBtnIconMargin !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { margin-right: ${safeValue(attributes.scndryBtnIconMargin)}px; }`);
	}
	if (attributes.scndryBtnIconMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { margin-right: ${safeValue(attributes.scndryBtnIconMargin_tablet)}px; }`);
	}
	if (attributes.scndryBtnIconMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-2 i, ${selector} .ts-btn.ts-btn-2 svg { margin-right: ${safeValue(attributes.scndryBtnIconMargin_mobile)}px; }`);
	}

	// Secondary button background
	if (attributes.scndryBtnBg) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { background-color: ${attributes.scndryBtnBg}; }`);
	}

	// Secondary button border
	const scndryBtnBorder = generateBorderCSS(attributes.scndryBtnBorder as BorderGroupValue);
	if (scndryBtnBorder) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { ${scndryBtnBorder} }`);
	}

	// Secondary button border radius
	if (attributes.scndryBtnRadius !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { border-radius: ${safeValue(attributes.scndryBtnRadius)}px; }`);
	}
	if (attributes.scndryBtnRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-2 { border-radius: ${safeValue(attributes.scndryBtnRadius_tablet)}px; }`);
	}
	if (attributes.scndryBtnRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-2 { border-radius: ${safeValue(attributes.scndryBtnRadius_mobile)}px; }`);
	}

	// Secondary button typography
	const scndryBtnText = generateTypographyCSS(attributes.scndryBtnText as TypographyConfig);
	if (scndryBtnText) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { ${scndryBtnText} }`);
	}

	// Secondary button text color
	if (attributes.scndryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2 { color: ${attributes.scndryBtnTextColor}; }`);
	}

	// Secondary button hover states
	if (attributes.scndryBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover i, ${selector} .ts-btn.ts-btn-2:hover svg { color: ${attributes.scndryBtnIconColorHover}; fill: ${attributes.scndryBtnIconColorHover}; }`);
	}
	if (attributes.scndryBtnBgHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover { background-color: ${attributes.scndryBtnBgHover}; }`);
	}
	if (attributes.scndryBtnBorderHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover { border-color: ${attributes.scndryBtnBorderHover}; }`);
	}
	if (attributes.scndryBtnTextColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-2:hover { color: ${attributes.scndryBtnTextColorHover}; }`);
	}

	// ============================================
	// 10. FORM: TERTIARY BUTTON
	// Source: create-post.php
	// Voxel classes: .ts-btn.ts-btn-4, .ts-btn.ts-btn-4 i, .ts-btn.ts-btn-4 svg
	// ============================================

	// Tertiary button icon color
	if (attributes.tertiaryBtnIconColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 i, ${selector} .ts-btn.ts-btn-4 svg { color: ${attributes.tertiaryBtnIconColor}; fill: ${attributes.tertiaryBtnIconColor}; }`);
	}

	// Tertiary button icon size
	if (attributes.tertiaryBtnIconSize !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 i, ${selector} .ts-btn.ts-btn-4 svg { font-size: ${safeValue(attributes.tertiaryBtnIconSize)}px; width: ${safeValue(attributes.tertiaryBtnIconSize)}px; height: ${safeValue(attributes.tertiaryBtnIconSize)}px; }`);
	}
	if (attributes.tertiaryBtnIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-4 i, ${selector} .ts-btn.ts-btn-4 svg { font-size: ${safeValue(attributes.tertiaryBtnIconSize_tablet)}px; width: ${safeValue(attributes.tertiaryBtnIconSize_tablet)}px; height: ${safeValue(attributes.tertiaryBtnIconSize_tablet)}px; }`);
	}
	if (attributes.tertiaryBtnIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-4 i, ${selector} .ts-btn.ts-btn-4 svg { font-size: ${safeValue(attributes.tertiaryBtnIconSize_mobile)}px; width: ${safeValue(attributes.tertiaryBtnIconSize_mobile)}px; height: ${safeValue(attributes.tertiaryBtnIconSize_mobile)}px; }`);
	}

	// Tertiary button background
	if (attributes.tertiaryBtnBg) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 { background-color: ${attributes.tertiaryBtnBg}; }`);
	}

	// Tertiary button border
	const tertiaryBtnBorder = generateBorderCSS(attributes.tertiaryBtnBorder as BorderGroupValue);
	if (tertiaryBtnBorder) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 { ${tertiaryBtnBorder} }`);
	}

	// Tertiary button border radius
	if (attributes.tertiaryBtnRadius !== undefined) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 { border-radius: ${safeValue(attributes.tertiaryBtnRadius)}px; }`);
	}
	if (attributes.tertiaryBtnRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-btn.ts-btn-4 { border-radius: ${safeValue(attributes.tertiaryBtnRadius_tablet)}px; }`);
	}
	if (attributes.tertiaryBtnRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-btn.ts-btn-4 { border-radius: ${safeValue(attributes.tertiaryBtnRadius_mobile)}px; }`);
	}

	// Tertiary button typography
	const tertiaryBtnText = generateTypographyCSS(attributes.tertiaryBtnText as TypographyConfig);
	if (tertiaryBtnText) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 { ${tertiaryBtnText} }`);
	}

	// Tertiary button text color
	if (attributes.tertiaryBtnTextColor) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4 { color: ${attributes.tertiaryBtnTextColor}; }`);
	}

	// Tertiary button hover states
	if (attributes.tertiaryBtnIconColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4:hover i, ${selector} .ts-btn.ts-btn-4:hover svg { color: ${attributes.tertiaryBtnIconColorHover}; fill: ${attributes.tertiaryBtnIconColorHover}; }`);
	}
	if (attributes.tertiaryBtnBgHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4:hover { background-color: ${attributes.tertiaryBtnBgHover}; }`);
	}
	if (attributes.tertiaryBtnBorderHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4:hover { border-color: ${attributes.tertiaryBtnBorderHover}; }`);
	}
	if (attributes.tertiaryBtnTextColorHover) {
		cssRules.push(`${selector} .ts-btn.ts-btn-4:hover { color: ${attributes.tertiaryBtnTextColorHover}; }`);
	}

	// ============================================
	// 11. FORM: FILE/GALLERY
	// Source: create-post.php
	// Voxel classes: .ts-file-upload, .min-input, .file-info, .remove-file
	// ============================================

	// File item gap
	if (attributes.fileColGap !== undefined) {
		cssRules.push(`${selector} .ts-file-upload { gap: ${safeValue(attributes.fileColGap)}px; }`);
	}
	if (attributes.fileColGap_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-file-upload { gap: ${safeValue(attributes.fileColGap_tablet)}px; }`);
	}
	if (attributes.fileColGap_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-file-upload { gap: ${safeValue(attributes.fileColGap_mobile)}px; }`);
	}

	// Select files - icon color
	if (attributes.fileIconColor) {
		cssRules.push(`${selector} .min-input i, ${selector} .min-input svg { color: ${attributes.fileIconColor}; fill: ${attributes.fileIconColor}; }`);
	}

	// Select files - icon size
	if (attributes.fileIconSize !== undefined) {
		cssRules.push(`${selector} .min-input i, ${selector} .min-input svg { font-size: ${safeValue(attributes.fileIconSize)}px; width: ${safeValue(attributes.fileIconSize)}px; height: ${safeValue(attributes.fileIconSize)}px; }`);
	}
	if (attributes.fileIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .min-input i, ${selector} .min-input svg { font-size: ${safeValue(attributes.fileIconSize_tablet)}px; width: ${safeValue(attributes.fileIconSize_tablet)}px; height: ${safeValue(attributes.fileIconSize_tablet)}px; }`);
	}
	if (attributes.fileIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .min-input i, ${selector} .min-input svg { font-size: ${safeValue(attributes.fileIconSize_mobile)}px; width: ${safeValue(attributes.fileIconSize_mobile)}px; height: ${safeValue(attributes.fileIconSize_mobile)}px; }`);
	}

	// Select files - background
	if (attributes.fileBg) {
		cssRules.push(`${selector} .min-input { background-color: ${attributes.fileBg}; }`);
	}

	// Select files - border
	const fileBorder = generateBorderCSS(attributes.fileBorder as BorderGroupValue);
	if (fileBorder) {
		cssRules.push(`${selector} .min-input { ${fileBorder} }`);
	}

	// Select files - border radius
	if (attributes.fileRadius !== undefined) {
		cssRules.push(`${selector} .min-input { border-radius: ${safeValue(attributes.fileRadius)}px; }`);
	}
	if (attributes.fileRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .min-input { border-radius: ${safeValue(attributes.fileRadius_tablet)}px; }`);
	}
	if (attributes.fileRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .min-input { border-radius: ${safeValue(attributes.fileRadius_mobile)}px; }`);
	}

	// Select files - typography
	const fileText = generateTypographyCSS(attributes.fileText as TypographyConfig);
	if (fileText) {
		cssRules.push(`${selector} .min-input { ${fileText} }`);
	}

	// Select files - text color
	if (attributes.fileTextColor) {
		cssRules.push(`${selector} .min-input { color: ${attributes.fileTextColor}; }`);
	}

	// Added file/image - border radius
	if (attributes.addedRadius !== undefined) {
		cssRules.push(`${selector} .file-info { border-radius: ${safeValue(attributes.addedRadius)}px; }`);
	}
	if (attributes.addedRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .file-info { border-radius: ${safeValue(attributes.addedRadius_tablet)}px; }`);
	}
	if (attributes.addedRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .file-info { border-radius: ${safeValue(attributes.addedRadius_mobile)}px; }`);
	}

	// Added file/image - background
	if (attributes.addedBg) {
		cssRules.push(`${selector} .file-info { background-color: ${attributes.addedBg}; }`);
	}

	// Added file/image - icon color
	if (attributes.addedIconColor) {
		cssRules.push(`${selector} .file-info i, ${selector} .file-info svg { color: ${attributes.addedIconColor}; fill: ${attributes.addedIconColor}; }`);
	}

	// Added file/image - icon size
	if (attributes.addedIconSize !== undefined) {
		cssRules.push(`${selector} .file-info i, ${selector} .file-info svg { font-size: ${safeValue(attributes.addedIconSize)}px; width: ${safeValue(attributes.addedIconSize)}px; height: ${safeValue(attributes.addedIconSize)}px; }`);
	}
	if (attributes.addedIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .file-info i, ${selector} .file-info svg { font-size: ${safeValue(attributes.addedIconSize_tablet)}px; width: ${safeValue(attributes.addedIconSize_tablet)}px; height: ${safeValue(attributes.addedIconSize_tablet)}px; }`);
	}
	if (attributes.addedIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .file-info i, ${selector} .file-info svg { font-size: ${safeValue(attributes.addedIconSize_mobile)}px; width: ${safeValue(attributes.addedIconSize_mobile)}px; height: ${safeValue(attributes.addedIconSize_mobile)}px; }`);
	}

	// Added file/image - typography
	const addedText = generateTypographyCSS(attributes.addedText as TypographyConfig);
	if (addedText) {
		cssRules.push(`${selector} .file-info { ${addedText} }`);
	}

	// Added file/image - text color
	if (attributes.addedTextColor) {
		cssRules.push(`${selector} .file-info { color: ${attributes.addedTextColor}; }`);
	}

	// Remove/Check button - background
	if (attributes.rmfBg) {
		cssRules.push(`${selector} .remove-file { background-color: ${attributes.rmfBg}; }`);
	}
	if (attributes.rmfBgHover) {
		cssRules.push(`${selector} .remove-file:hover { background-color: ${attributes.rmfBgHover}; }`);
	}

	// Remove/Check button - color
	if (attributes.rmfColor) {
		cssRules.push(`${selector} .remove-file { color: ${attributes.rmfColor}; }`);
	}
	if (attributes.rmfColorHover) {
		cssRules.push(`${selector} .remove-file:hover { color: ${attributes.rmfColorHover}; }`);
	}

	// Remove/Check button - border radius
	if (attributes.rmfRadius !== undefined) {
		cssRules.push(`${selector} .remove-file { border-radius: ${safeValue(attributes.rmfRadius)}px; }`);
	}
	if (attributes.rmfRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .remove-file { border-radius: ${safeValue(attributes.rmfRadius_tablet)}px; }`);
	}
	if (attributes.rmfRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .remove-file { border-radius: ${safeValue(attributes.rmfRadius_mobile)}px; }`);
	}

	// Remove/Check button - size
	if (attributes.rmfSize !== undefined) {
		cssRules.push(`${selector} .remove-file { width: ${safeValue(attributes.rmfSize)}px; height: ${safeValue(attributes.rmfSize)}px; }`);
	}
	if (attributes.rmfSize_tablet !== undefined) {
		tabletRules.push(`${selector} .remove-file { width: ${safeValue(attributes.rmfSize_tablet)}px; height: ${safeValue(attributes.rmfSize_tablet)}px; }`);
	}
	if (attributes.rmfSize_mobile !== undefined) {
		mobileRules.push(`${selector} .remove-file { width: ${safeValue(attributes.rmfSize_mobile)}px; height: ${safeValue(attributes.rmfSize_mobile)}px; }`);
	}

	// Remove/Check button - icon size
	if (attributes.rmfIconSize !== undefined) {
		cssRules.push(`${selector} .remove-file i, ${selector} .remove-file svg { font-size: ${safeValue(attributes.rmfIconSize)}px; width: ${safeValue(attributes.rmfIconSize)}px; height: ${safeValue(attributes.rmfIconSize)}px; }`);
	}
	if (attributes.rmfIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .remove-file i, ${selector} .remove-file svg { font-size: ${safeValue(attributes.rmfIconSize_tablet)}px; width: ${safeValue(attributes.rmfIconSize_tablet)}px; height: ${safeValue(attributes.rmfIconSize_tablet)}px; }`);
	}
	if (attributes.rmfIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .remove-file i, ${selector} .remove-file svg { font-size: ${safeValue(attributes.rmfIconSize_mobile)}px; width: ${safeValue(attributes.rmfIconSize_mobile)}px; height: ${safeValue(attributes.rmfIconSize_mobile)}px; }`);
	}

	// Select files - hover states
	if (attributes.fileIconColorHover) {
		cssRules.push(`${selector} .min-input:hover i, ${selector} .min-input:hover svg { color: ${attributes.fileIconColorHover}; fill: ${attributes.fileIconColorHover}; }`);
	}
	if (attributes.fileBgHover) {
		cssRules.push(`${selector} .min-input:hover { background-color: ${attributes.fileBgHover}; }`);
	}
	if (attributes.fileBorderHover) {
		cssRules.push(`${selector} .min-input:hover { border-color: ${attributes.fileBorderHover}; }`);
	}

	// ============================================
	// 12. FORM: POST SUBMITTED/UPDATED
	// Source: create-post.php:4538-4651
	// Voxel classes: .ts-edit-success, .ts-edit-success > i, .ts-edit-success > svg, .ts-edit-success h4
	// ============================================

	// Align icon (flex alignment)
	if (attributes.welcAlign) {
		cssRules.push(`${selector} .ts-edit-success { align-items: ${attributes.welcAlign}; }`);
	}

	// Text align
	if (attributes.welcAlignText) {
		cssRules.push(`${selector} .ts-edit-success { text-align: ${attributes.welcAlignText}; }`);
	}

	// Icon size
	if (attributes.welcIcoSize !== undefined) {
		cssRules.push(`${selector} .ts-edit-success > i, ${selector} .ts-edit-success > svg { font-size: ${safeValue(attributes.welcIcoSize)}px; width: ${safeValue(attributes.welcIcoSize)}px; height: ${safeValue(attributes.welcIcoSize)}px; }`);
	}
	if (attributes.welcIcoSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-edit-success > i, ${selector} .ts-edit-success > svg { font-size: ${safeValue(attributes.welcIcoSize_tablet)}px; width: ${safeValue(attributes.welcIcoSize_tablet)}px; height: ${safeValue(attributes.welcIcoSize_tablet)}px; }`);
	}
	if (attributes.welcIcoSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-edit-success > i, ${selector} .ts-edit-success > svg { font-size: ${safeValue(attributes.welcIcoSize_mobile)}px; width: ${safeValue(attributes.welcIcoSize_mobile)}px; height: ${safeValue(attributes.welcIcoSize_mobile)}px; }`);
	}

	// Icon color
	if (attributes.welcIcoColor) {
		cssRules.push(`${selector} .ts-edit-success > i, ${selector} .ts-edit-success > svg { color: ${attributes.welcIcoColor}; fill: ${attributes.welcIcoColor}; }`);
	}
	if (attributes.welcIcoColor_tablet) {
		tabletRules.push(`${selector} .ts-edit-success > i, ${selector} .ts-edit-success > svg { color: ${attributes.welcIcoColor_tablet}; fill: ${attributes.welcIcoColor_tablet}; }`);
	}
	if (attributes.welcIcoColor_mobile) {
		mobileRules.push(`${selector} .ts-edit-success > i, ${selector} .ts-edit-success > svg { color: ${attributes.welcIcoColor_mobile}; fill: ${attributes.welcIcoColor_mobile}; }`);
	}

	// Heading typography
	const welcHeadingT = generateTypographyCSS(attributes.welcHeadingT as TypographyConfig);
	if (welcHeadingT) {
		cssRules.push(`${selector} .ts-edit-success h4 { ${welcHeadingT} }`);
	}

	// Heading color
	if (attributes.welcHeadingCol) {
		cssRules.push(`${selector} .ts-edit-success h4 { color: ${attributes.welcHeadingCol}; }`);
	}
	if (attributes.welcHeadingCol_tablet) {
		tabletRules.push(`${selector} .ts-edit-success h4 { color: ${attributes.welcHeadingCol_tablet}; }`);
	}
	if (attributes.welcHeadingCol_mobile) {
		mobileRules.push(`${selector} .ts-edit-success h4 { color: ${attributes.welcHeadingCol_mobile}; }`);
	}

	// Heading top margin
	if (attributes.welcTopMargin !== undefined) {
		cssRules.push(`${selector} .ts-edit-success h4 { margin-top: ${safeValue(attributes.welcTopMargin)}px; }`);
	}
	if (attributes.welcTopMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-edit-success h4 { margin-top: ${safeValue(attributes.welcTopMargin_tablet)}px; }`);
	}
	if (attributes.welcTopMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-edit-success h4 { margin-top: ${safeValue(attributes.welcTopMargin_mobile)}px; }`);
	}

	// ============================================
	// 13. FORM: TOOLTIPS
	// Source: create-post.php:4660-4719
	// Voxel class: .has-tooltip::after
	// ============================================

	// Tooltip text color
	if (attributes.tooltipColor) {
		cssRules.push(`${selector} .has-tooltip::after { color: ${attributes.tooltipColor}; }`);
	}

	// Tooltip typography
	const tooltipTypo = generateTypographyCSS(attributes.tooltipTypo as TypographyConfig);
	if (tooltipTypo) {
		cssRules.push(`${selector} .has-tooltip::after { ${tooltipTypo} }`);
	}

	// Tooltip background
	if (attributes.tooltipBg) {
		cssRules.push(`${selector} .has-tooltip::after { background-color: ${attributes.tooltipBg}; }`);
	}

	// Tooltip border radius
	if (attributes.tooltipRadius !== undefined) {
		cssRules.push(`${selector} .has-tooltip::after { border-radius: ${safeValue(attributes.tooltipRadius)}px; }`);
	}
	if (attributes.tooltipRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .has-tooltip::after { border-radius: ${safeValue(attributes.tooltipRadius_tablet)}px; }`);
	}
	if (attributes.tooltipRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .has-tooltip::after { border-radius: ${safeValue(attributes.tooltipRadius_mobile)}px; }`);
	}

	// ============================================
	// 14. FORM: DIALOG
	// Source: create-post.php:4725-4842
	// Voxel classes: .vx-dialog > svg, .vx-dialog-content
	// ============================================

	// Dialog icon color
	if (attributes.dialogIconColor) {
		cssRules.push(`${selector} .vx-dialog > svg { fill: ${attributes.dialogIconColor}; }`);
	}

	// Dialog icon size
	if (attributes.dialogIconSize !== undefined) {
		cssRules.push(`${selector} .vx-dialog > svg { width: ${safeValue(attributes.dialogIconSize)}px; height: ${safeValue(attributes.dialogIconSize)}px; }`);
	}
	if (attributes.dialogIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .vx-dialog > svg { width: ${safeValue(attributes.dialogIconSize_tablet)}px; height: ${safeValue(attributes.dialogIconSize_tablet)}px; }`);
	}
	if (attributes.dialogIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .vx-dialog > svg { width: ${safeValue(attributes.dialogIconSize_mobile)}px; height: ${safeValue(attributes.dialogIconSize_mobile)}px; }`);
	}

	// Dialog text color
	if (attributes.dialogColor) {
		cssRules.push(`${selector} .vx-dialog-content { color: ${attributes.dialogColor}; }`);
	}

	// Dialog typography
	const dialogTypo = generateTypographyCSS(attributes.dialogTypo as TypographyConfig);
	if (dialogTypo) {
		cssRules.push(`${selector} .vx-dialog-content { ${dialogTypo} }`);
	}

	// Dialog background
	if (attributes.dialogBg) {
		cssRules.push(`${selector} .vx-dialog-content { background-color: ${attributes.dialogBg}; }`);
	}

	// Dialog border radius
	if (attributes.dialogRadius !== undefined) {
		cssRules.push(`${selector} .vx-dialog-content { border-radius: ${safeValue(attributes.dialogRadius)}px; }`);
	}
	if (attributes.dialogRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .vx-dialog-content { border-radius: ${safeValue(attributes.dialogRadius_tablet)}px; }`);
	}
	if (attributes.dialogRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .vx-dialog-content { border-radius: ${safeValue(attributes.dialogRadius_mobile)}px; }`);
	}

	// Dialog box shadow
	const dialogShadow = generateBoxShadowCSS(attributes.dialogShadow as BoxShadowConfig);
	if (dialogShadow) {
		cssRules.push(`${selector} .vx-dialog-content { box-shadow: ${dialogShadow}; }`);
	}

	// Dialog border
	const dialogBorderCSS = generateBorderCSS(attributes.dialogBorder as BorderGroupValue);
	if (dialogBorderCSS) {
		cssRules.push(`${selector} .vx-dialog-content { ${dialogBorderCSS} }`);
	}

	// ============================================
	// 15. POPUPS: CUSTOM STYLE
	// Source: create-post.php:4844-4944
	// Voxel classes: {{WRAPPER}}-wrap > div:after, .ts-field-popup, .ts-field-popup-container, .pac-container
	// ============================================

	// Only apply custom popup styles if enabled
	if (attributes.customPopupEnable) {
		// Backdrop background
		// Note: In Gutenberg, we can't use {{WRAPPER}}-wrap pattern
		// Instead, target the block wrapper's pseudo-element
		if (attributes.custmPgBackdrop) {
			cssRules.push(`${selector}::after { content: ''; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: ${attributes.custmPgBackdrop} !important; z-index: 999998; }`);
		}

		// Backdrop pointer events
		if (attributes.popupPointerEvents) {
			cssRules.push(`${selector}::after { pointer-events: all !important; }`);
		} else {
			cssRules.push(`${selector}::after { pointer-events: none !important; }`);
		}

		// Popup box shadow
		const pgShadow = generateBoxShadowCSS(attributes.pgShadow as BoxShadowConfig);
		if (pgShadow) {
			cssRules.push(`${selector} .ts-field-popup { box-shadow: ${pgShadow}; }`);
		}

		// Popup top/bottom margin
		if (attributes.customPgTopMargin !== undefined) {
			cssRules.push(`${selector} .ts-field-popup-container { margin: ${safeValue(attributes.customPgTopMargin)}px 0; }`);
		}
		if (attributes.customPgTopMargin_tablet !== undefined) {
			tabletRules.push(`${selector} .ts-field-popup-container { margin: ${safeValue(attributes.customPgTopMargin_tablet)}px 0; }`);
		}
		// Note: Mobile doesn't affect popup margin per Voxel docs

		// Google autosuggest top margin (global selector)
		if (attributes.googleTopMargin !== undefined) {
			cssRules.push(`.pac-container { margin-top: ${safeValue(attributes.googleTopMargin)}px !important; }`);
		}
		if (attributes.googleTopMargin_tablet !== undefined) {
			tabletRules.push(`.pac-container { margin-top: ${safeValue(attributes.googleTopMargin_tablet)}px !important; }`);
		}
		if (attributes.googleTopMargin_mobile !== undefined) {
			mobileRules.push(`.pac-container { margin-top: ${safeValue(attributes.googleTopMargin_mobile)}px !important; }`);
		}
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

/**
 * Generate responsive CSS for Field Style Tab controls
 * Targets form field elements within scoped block selector
 */
export function generateFieldStyleTabResponsiveCSS(
	attributes: CreatePostAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-create-post-${blockId}`;

	// ============================================
	// FIELD STYLE TAB - All 18 Accordions
	// Source: FieldStyleTab.tsx
	// ============================================

	// NOTE: Field Style tab controls use different attribute names than Style tab,
	// but target the same CSS selectors. Both tabs can control the same elements.
	// Field Style attributes: fieldLabelTypo, inputPlaceholderColor, etc.
	// Style Tab attributes: sf1InputLabelTypo, sf1InputPlaceholderCol, etc.

	// ============================================
	// 1. FORM: FIELDS GENERAL
	// ============================================

	// Field label typography
	const fieldLabelTypo = generateTypographyCSS(attributes['fieldLabelTypo'] as TypographyConfig);
	if (fieldLabelTypo) {
		cssRules.push(`${selector} .ts-form-group:not(.ui-heading-field) label { ${fieldLabelTypo} }`);
	}

	// Field label color
	if (attributes['fieldLabelColor']) {
		cssRules.push(`${selector} .ts-form-group:not(.ui-heading-field) label { color: ${attributes['fieldLabelColor']}; }`);
	}
	if (attributes['fieldLabelColor_tablet']) {
		tabletRules.push(`${selector} .ts-form-group:not(.ui-heading-field) label { color: ${attributes['fieldLabelColor_tablet']}; }`);
	}
	if (attributes['fieldLabelColor_mobile']) {
		mobileRules.push(`${selector} .ts-form-group:not(.ui-heading-field) label { color: ${attributes['fieldLabelColor_mobile']}; }`);
	}

	// Field validation typography
	const fieldValidationTypo = generateTypographyCSS(attributes['fieldValidationTypo'] as TypographyConfig);
	if (fieldValidationTypo) {
		cssRules.push(`${selector} .field-required { ${fieldValidationTypo} }`);
	}

	// Field validation default color
	if (attributes['fieldValidationColor']) {
		cssRules.push(`${selector} .field-required { color: ${attributes['fieldValidationColor']}; }`);
	}
	if (attributes['fieldValidationColor_tablet']) {
		tabletRules.push(`${selector} .field-required { color: ${attributes['fieldValidationColor_tablet']}; }`);
	}
	if (attributes['fieldValidationColor_mobile']) {
		mobileRules.push(`${selector} .field-required { color: ${attributes['fieldValidationColor_mobile']}; }`);
	}

	// Field validation error color
	if (attributes['fieldErrorColor']) {
		cssRules.push(`${selector} .field-required.vx-error { color: ${attributes['fieldErrorColor']}; }`);
	}
	if (attributes['fieldErrorColor_tablet']) {
		tabletRules.push(`${selector} .field-required.vx-error { color: ${attributes['fieldErrorColor_tablet']}; }`);
	}
	if (attributes['fieldErrorColor_mobile']) {
		mobileRules.push(`${selector} .field-required.vx-error { color: ${attributes['fieldErrorColor_mobile']}; }`);
	}

	// ============================================
	// 2. FORM: INPUT & TEXTAREA (Normal/Hover/Active)
	// Source: create-post.php:936-1370
	// Voxel uses input.ts-filter and textarea.ts-filter selectors
	// ============================================

	// Placeholder - Voxel: create-post.php:936-937
	if (attributes['inputPlaceholderColor']) {
		cssRules.push(`${selector} .ts-form input.ts-filter::placeholder, ${selector} .ts-form textarea.ts-filter::placeholder { color: ${attributes['inputPlaceholderColor']}; }`);
	}
	if (attributes['inputPlaceholderColor_tablet']) {
		tabletRules.push(`${selector} .ts-form input.ts-filter::placeholder, ${selector} .ts-form textarea.ts-filter::placeholder { color: ${attributes['inputPlaceholderColor_tablet']}; }`);
	}
	if (attributes['inputPlaceholderColor_mobile']) {
		mobileRules.push(`${selector} .ts-form input.ts-filter::placeholder, ${selector} .ts-form textarea.ts-filter::placeholder { color: ${attributes['inputPlaceholderColor_mobile']}; }`);
	}

	// Placeholder typography - Voxel: create-post.php:950
	const inputPlaceholderTypo = generateTypographyCSS(attributes['inputPlaceholderTypo'] as TypographyConfig);
	if (inputPlaceholderTypo) {
		cssRules.push(`${selector} .ts-form input.ts-filter::placeholder, ${selector} .ts-form textarea.ts-filter::placeholder { ${inputPlaceholderTypo} }`);
	}

	// Value (text color) - Voxel: create-post.php:971-972
	if (attributes['inputTextColor']) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { color: ${attributes['inputTextColor']}; }`);
	}
	if (attributes['inputTextColor_tablet']) {
		tabletRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { color: ${attributes['inputTextColor_tablet']}; }`);
	}
	if (attributes['inputTextColor_mobile']) {
		mobileRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { color: ${attributes['inputTextColor_mobile']}; }`);
	}

	// Value typography - Voxel: create-post.php:986
	const inputTextTypo = generateTypographyCSS(attributes['inputTextTypo'] as TypographyConfig);
	if (inputTextTypo) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { ${inputTextTypo} }`);
	}

	// Background - Voxel: create-post.php:1008-1009
	if (attributes['inputBgColor']) {
		cssRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { background: ${attributes['inputBgColor']}; }`);
	}
	if (attributes['inputBgColor_tablet']) {
		tabletRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { background: ${attributes['inputBgColor_tablet']}; }`);
	}
	if (attributes['inputBgColor_mobile']) {
		mobileRules.push(`${selector} .ts-form input.ts-filter, ${selector} .ts-form textarea.ts-filter { background: ${attributes['inputBgColor_mobile']}; }`);
	}

	// Border - Voxel: create-post.php:1023
	const inputBorder = generateBorderCSS(attributes['inputBorder'] as BorderGroupValue);
	if (inputBorder) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter, ${selector} .ts-form input.ts-filter { ${inputBorder} }`);
	}

	// Input border radius - Voxel: create-post.php:1058
	if (attributes['inputBorderRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-form input.ts-filter { border-radius: ${safeValue(attributes['inputBorderRadius'])}px; }`);
	}
	if (attributes['inputBorderRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form input.ts-filter { border-radius: ${safeValue(attributes['inputBorderRadius_tablet'])}px; }`);
	}
	if (attributes['inputBorderRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form input.ts-filter { border-radius: ${safeValue(attributes['inputBorderRadius_mobile'])}px; }`);
	}

	// Textarea border radius - Voxel: create-post.php:1148
	if (attributes['textareaBorderRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter { border-radius: ${safeValue(attributes['textareaBorderRadius'])}px; }`);
	}
	if (attributes['textareaBorderRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form textarea.ts-filter { border-radius: ${safeValue(attributes['textareaBorderRadius_tablet'])}px; }`);
	}
	if (attributes['textareaBorderRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form textarea.ts-filter { border-radius: ${safeValue(attributes['textareaBorderRadius_mobile'])}px; }`);
	}

	// Input height - Voxel: create-post.php:1077
	if (attributes['inputHeight'] !== undefined) {
		cssRules.push(`${selector} .ts-form input.ts-filter { height: ${safeValue(attributes['inputHeight'])}px; }`);
	}
	if (attributes['inputHeight_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form input.ts-filter { height: ${safeValue(attributes['inputHeight_tablet'])}px; }`);
	}
	if (attributes['inputHeight_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form input.ts-filter { height: ${safeValue(attributes['inputHeight_mobile'])}px; }`);
	}

	// Textarea height (min-height) - Voxel: create-post.php:1125
	if (attributes['textareaHeight'] !== undefined) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter { min-height: ${safeValue(attributes['textareaHeight'])}px; }`);
	}
	if (attributes['textareaHeight_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form textarea.ts-filter { min-height: ${safeValue(attributes['textareaHeight_tablet'])}px; }`);
	}
	// Textarea padding
	if (attributes.textareaPadding) {
		const padding = generateDimensionsCSS(attributes.textareaPadding, 'padding');
		if (padding) {
			cssRules.push(`${selector} .ts-form textarea.ts-filter { ${padding} }`);
		}
	}

	// Input with icon - padding
	if (attributes.inputIconPadding) {
		const padding = generateDimensionsCSS(attributes.inputIconPadding, 'padding');
		if (padding) {
			cssRules.push(`${selector} .ts-input-icon input { ${padding} }`);
		}
	}

	// Input with icon - icon color - Voxel: create-post.php:1182-1183
	if (attributes['inputIconColor']) {
		cssRules.push(`${selector} .ts-input-icon i { color: ${attributes['inputIconColor']}; }`);
		cssRules.push(`${selector} .ts-input-icon svg { fill: ${attributes['inputIconColor']}; }`);
	}
	if (attributes['inputIconColor_tablet']) {
		tabletRules.push(`${selector} .ts-input-icon i { color: ${attributes['inputIconColor_tablet']}; }`);
		tabletRules.push(`${selector} .ts-input-icon svg { fill: ${attributes['inputIconColor_tablet']}; }`);
	}
	if (attributes['inputIconColor_mobile']) {
		mobileRules.push(`${selector} .ts-input-icon i { color: ${attributes['inputIconColor_mobile']}; }`);
		mobileRules.push(`${selector} .ts-input-icon svg { fill: ${attributes['inputIconColor_mobile']}; }`);
	}

	// Input with icon - icon size - Voxel: create-post.php:1203-1204
	if (attributes['inputIconSize'] !== undefined) {
		cssRules.push(`${selector} .ts-input-icon i { font-size: ${safeValue(attributes['inputIconSize'])}px; }`);
		cssRules.push(`${selector} .ts-input-icon svg { width: ${safeValue(attributes['inputIconSize'])}px; height: ${safeValue(attributes['inputIconSize'])}px; }`);
	}
	if (attributes['inputIconSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-input-icon i { font-size: ${safeValue(attributes['inputIconSize_tablet'])}px; }`);
		tabletRules.push(`${selector} .ts-input-icon svg { width: ${safeValue(attributes['inputIconSize_tablet'])}px; height: ${safeValue(attributes['inputIconSize_tablet'])}px; }`);
	}
	if (attributes['inputIconSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-input-icon i { font-size: ${safeValue(attributes['inputIconSize_mobile'])}px; }`);
		mobileRules.push(`${selector} .ts-input-icon svg { width: ${safeValue(attributes['inputIconSize_mobile'])}px; height: ${safeValue(attributes['inputIconSize_mobile'])}px; }`);
	}

	// Input with icon - icon position (left) - Voxel: create-post.php:1227-1228
	if (attributes['inputIconSidePadding'] !== undefined) {
		cssRules.push(`${selector} .ts-input-icon i { left: ${safeValue(attributes['inputIconSidePadding'])}px; }`);
		cssRules.push(`${selector} .ts-input-icon svg { left: ${safeValue(attributes['inputIconSidePadding'])}px; }`);
	}
	if (attributes['inputIconSidePadding_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-input-icon i { left: ${safeValue(attributes['inputIconSidePadding_tablet'])}px; }`);
		tabletRules.push(`${selector} .ts-input-icon svg { left: ${safeValue(attributes['inputIconSidePadding_tablet'])}px; }`);
	}
	if (attributes['inputIconSidePadding_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-input-icon i { left: ${safeValue(attributes['inputIconSidePadding_mobile'])}px; }`);
		mobileRules.push(`${selector} .ts-input-icon svg { left: ${safeValue(attributes['inputIconSidePadding_mobile'])}px; }`);
	}

	// Hover states - Voxel: create-post.php:1250-1290
	if (attributes['inputBgColorHover']) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter:hover, ${selector} .ts-form input.ts-filter:hover { background: ${attributes['inputBgColorHover']}; }`);
	}
	if (attributes['inputBorderColorHover']) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter:hover, ${selector} .ts-form input.ts-filter:hover { border-color: ${attributes['inputBorderColorHover']}; }`);
	}
	if (attributes['inputPlaceholderColorHover']) {
		cssRules.push(`${selector} .ts-form input.ts-filter:hover::placeholder { color: ${attributes['inputPlaceholderColorHover']}; }`);
	}
	if (attributes['inputTextColorHover']) {
		cssRules.push(`${selector} .ts-form input.ts-filter:hover, ${selector} .ts-form textarea.ts-filter:hover { color: ${attributes['inputTextColorHover']}; }`);
	}
	// Hover icon color - Voxel: create-post.php:1302-1303
	if (attributes['inputIconColorHover']) {
		cssRules.push(`${selector} .ts-input-icon:hover i { color: ${attributes['inputIconColorHover']}; }`);
		cssRules.push(`${selector} .ts-input-icon:hover svg { fill: ${attributes['inputIconColorHover']}; }`);
	}

	// Active (focus) states - Voxel: create-post.php:1328-1370
	if (attributes['inputBgColorActive']) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter:focus, ${selector} .ts-form input.ts-filter:focus { background: ${attributes['inputBgColorActive']}; }`);
	}
	if (attributes['inputBorderColorActive']) {
		cssRules.push(`${selector} .ts-form textarea.ts-filter:focus, ${selector} .ts-form input.ts-filter:focus { border-color: ${attributes['inputBorderColorActive']}; }`);
	}
	// Focus placeholder - Voxel uses :active but :focus is more appropriate
	if (attributes['inputPlaceholderColorActive']) {
		cssRules.push(`${selector} .ts-form input.ts-filter:focus::placeholder, ${selector} .ts-form textarea.ts-filter:focus::placeholder { color: ${attributes['inputPlaceholderColorActive']}; }`);
	}
	if (attributes['inputTextColorActive']) {
		cssRules.push(`${selector} .ts-form input.ts-filter:focus, ${selector} .ts-form textarea.ts-filter:focus { color: ${attributes['inputTextColorActive']}; }`);
	}

	// ============================================
	// 3. FORM: INPUT SUFFIX
	// Voxel: create-post.php:1397-1483 uses `.input-container .input-suffix`
	// ============================================

	const inputSuffixTypo = generateTypographyCSS(attributes['inputSuffixTypo'] as TypographyConfig);
	if (inputSuffixTypo) {
		// Voxel: create-post.php:1397
		cssRules.push(`${selector} .input-container .input-suffix { ${inputSuffixTypo} }`);
	}

	if (attributes['inputSuffixTextColor']) {
		// Voxel: create-post.php:1407
		cssRules.push(`${selector} .input-container .input-suffix { color: ${attributes['inputSuffixTextColor']}; }`);
	}
	if (attributes['inputSuffixTextColor_tablet']) {
		tabletRules.push(`${selector} .input-container .input-suffix { color: ${attributes['inputSuffixTextColor_tablet']}; }`);
	}
	if (attributes['inputSuffixTextColor_mobile']) {
		mobileRules.push(`${selector} .input-container .input-suffix { color: ${attributes['inputSuffixTextColor_mobile']}; }`);
	}

	if (attributes['inputSuffixBgColor']) {
		// Voxel: create-post.php:1420
		cssRules.push(`${selector} .input-container .input-suffix { background: ${attributes['inputSuffixBgColor']}; }`);
	}
	if (attributes['inputSuffixBgColor_tablet']) {
		tabletRules.push(`${selector} .input-container .input-suffix { background: ${attributes['inputSuffixBgColor_tablet']}; }`);
	}
	if (attributes['inputSuffixBgColor_mobile']) {
		mobileRules.push(`${selector} .input-container .input-suffix { background: ${attributes['inputSuffixBgColor_mobile']}; }`);
	}

	if (attributes['inputSuffixRadius'] !== undefined) {
		// Voxel: create-post.php:1444
		cssRules.push(`${selector} .input-container .input-suffix { border-radius: ${safeValue(attributes['inputSuffixRadius'])}px; }`);
	}
	if (attributes['inputSuffixRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .input-container .input-suffix { border-radius: ${safeValue(attributes['inputSuffixRadius_tablet'])}px; }`);
	}
	if (attributes['inputSuffixRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .input-container .input-suffix { border-radius: ${safeValue(attributes['inputSuffixRadius_mobile'])}px; }`);
	}

	const inputSuffixShadow = generateBoxShadowCSS(attributes['inputSuffixShadow'] as BoxShadowConfig);
	if (inputSuffixShadow) {
		// Voxel: create-post.php:1454
		cssRules.push(`${selector} .input-container .input-suffix { box-shadow: ${inputSuffixShadow}; }`);
	}

	// Voxel: create-post.php:1472 uses right/left positioning, not margin
	if (attributes['inputSuffixMargin'] !== undefined) {
		cssRules.push(`${selector} .input-container .input-suffix { right: ${safeValue(attributes['inputSuffixMargin'])}px; }`);
	}
	if (attributes['inputSuffixMargin_tablet'] !== undefined) {
		tabletRules.push(`${selector} .input-container .input-suffix { right: ${safeValue(attributes['inputSuffixMargin_tablet'])}px; }`);
	}
	if (attributes['inputSuffixMargin_mobile'] !== undefined) {
		mobileRules.push(`${selector} .input-container .input-suffix { right: ${safeValue(attributes['inputSuffixMargin_mobile'])}px; }`);
	}

	// Voxel: create-post.php:1483 - SVG fill for icon color
	if (attributes['inputSuffixIconColor']) {
		cssRules.push(`${selector} .input-container .input-suffix svg { fill: ${attributes['inputSuffixIconColor']}; }`);
	}
	if (attributes['inputSuffixIconColor_tablet']) {
		tabletRules.push(`${selector} .input-container .input-suffix svg { fill: ${attributes['inputSuffixIconColor_tablet']}; }`);
	}
	if (attributes['inputSuffixIconColor_mobile']) {
		mobileRules.push(`${selector} .input-container .input-suffix svg { fill: ${attributes['inputSuffixIconColor_mobile']}; }`);
	}

	// ============================================
	// 4. FORM: POPUP BUTTON (Normal/Hover/Filled)
	// Voxel: create-post.php:1530-1556+ uses `div.ts-filter` (not bare `.ts-filter`)
	// ============================================

	const popupBtnTypo = generateTypographyCSS(attributes['popupBtnTypo'] as TypographyConfig);
	if (popupBtnTypo) {
		// Voxel: create-post.php:1530
		cssRules.push(`${selector} .ts-form div.ts-filter { ${popupBtnTypo} }`);
	}

	const popupBtnShadow = generateBoxShadowCSS(attributes['popupBtnShadow'] as BoxShadowConfig);
	if (popupBtnShadow) {
		// Voxel: create-post.php:1543
		cssRules.push(`${selector} div.ts-filter { box-shadow: ${popupBtnShadow}; }`);
	}

	if (attributes['popupBtnBgColor']) {
		// Voxel: create-post.php:1556
		cssRules.push(`${selector} .ts-form div.ts-filter { background: ${attributes['popupBtnBgColor']}; }`);
	}
	if (attributes['popupBtnBgColor_tablet']) {
		tabletRules.push(`${selector} .ts-form div.ts-filter { background: ${attributes['popupBtnBgColor_tablet']}; }`);
	}
	if (attributes['popupBtnBgColor_mobile']) {
		mobileRules.push(`${selector} .ts-form div.ts-filter { background: ${attributes['popupBtnBgColor_mobile']}; }`);
	}

	if (attributes['popupBtnTextColor']) {
		cssRules.push(`${selector} .ts-form div.ts-filter { color: ${attributes['popupBtnTextColor']}; }`);
	}
	if (attributes['popupBtnTextColor_tablet']) {
		tabletRules.push(`${selector} .ts-form div.ts-filter { color: ${attributes['popupBtnTextColor_tablet']}; }`);
	}
	if (attributes['popupBtnTextColor_mobile']) {
		mobileRules.push(`${selector} .ts-form div.ts-filter { color: ${attributes['popupBtnTextColor_mobile']}; }`);
	}

	const popupBtnBorder = generateBorderCSS(attributes['popupBtnBorder'] as BorderGroupValue);
	if (popupBtnBorder) {
		cssRules.push(`${selector} .ts-form div.ts-filter { ${popupBtnBorder} }`);
	}

	if (attributes['popupBtnRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-form div.ts-filter { border-radius: ${safeValue(attributes['popupBtnRadius'])}px; }`);
	}
	if (attributes['popupBtnRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form div.ts-filter { border-radius: ${safeValue(attributes['popupBtnRadius_tablet'])}px; }`);
	}
	if (attributes['popupBtnRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form div.ts-filter { border-radius: ${safeValue(attributes['popupBtnRadius_mobile'])}px; }`);
	}

	if (attributes['popupBtnHeight'] !== undefined) {
		cssRules.push(`${selector} .ts-form div.ts-filter { height: ${safeValue(attributes['popupBtnHeight'])}px; }`);
	}
	if (attributes['popupBtnHeight_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form div.ts-filter { height: ${safeValue(attributes['popupBtnHeight_tablet'])}px; }`);
	}
	if (attributes['popupBtnHeight_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form div.ts-filter { height: ${safeValue(attributes['popupBtnHeight_mobile'])}px; }`);
	}

	// Icon color - support both <i> and <svg>
	if (attributes['popupBtnIconColor']) {
		cssRules.push(`${selector} div.ts-filter i { color: ${attributes['popupBtnIconColor']}; }`);
		cssRules.push(`${selector} div.ts-filter svg { fill: ${attributes['popupBtnIconColor']}; }`);
	}
	if (attributes['popupBtnIconColor_tablet']) {
		tabletRules.push(`${selector} div.ts-filter i { color: ${attributes['popupBtnIconColor_tablet']}; }`);
		tabletRules.push(`${selector} div.ts-filter svg { fill: ${attributes['popupBtnIconColor_tablet']}; }`);
	}
	if (attributes['popupBtnIconColor_mobile']) {
		mobileRules.push(`${selector} div.ts-filter i { color: ${attributes['popupBtnIconColor_mobile']}; }`);
		mobileRules.push(`${selector} div.ts-filter svg { fill: ${attributes['popupBtnIconColor_mobile']}; }`);
	}

	// Icon size - support both <i> and <svg>
	if (attributes['popupBtnIconSize'] !== undefined) {
		cssRules.push(`${selector} div.ts-filter i { font-size: ${safeValue(attributes['popupBtnIconSize'])}px; }`);
		cssRules.push(`${selector} div.ts-filter svg { width: ${safeValue(attributes['popupBtnIconSize'])}px; height: ${safeValue(attributes['popupBtnIconSize'])}px; }`);
	}
	if (attributes['popupBtnIconSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} div.ts-filter i { font-size: ${safeValue(attributes['popupBtnIconSize_tablet'])}px; }`);
		tabletRules.push(`${selector} div.ts-filter svg { width: ${safeValue(attributes['popupBtnIconSize_tablet'])}px; height: ${safeValue(attributes['popupBtnIconSize_tablet'])}px; }`);
	}
	if (attributes['popupBtnIconSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} div.ts-filter i { font-size: ${safeValue(attributes['popupBtnIconSize_mobile'])}px; }`);
		mobileRules.push(`${selector} div.ts-filter svg { width: ${safeValue(attributes['popupBtnIconSize_mobile'])}px; height: ${safeValue(attributes['popupBtnIconSize_mobile'])}px; }`);
	}

	if (attributes['popupBtnIconSpacing'] !== undefined) {
		cssRules.push(`${selector} div.ts-filter i { margin-right: ${safeValue(attributes['popupBtnIconSpacing'])}px; }`);
		cssRules.push(`${selector} div.ts-filter svg { margin-right: ${safeValue(attributes['popupBtnIconSpacing'])}px; }`);
	}
	if (attributes['popupBtnIconSpacing_tablet'] !== undefined) {
		tabletRules.push(`${selector} div.ts-filter i { margin-right: ${safeValue(attributes['popupBtnIconSpacing_tablet'])}px; }`);
		tabletRules.push(`${selector} div.ts-filter svg { margin-right: ${safeValue(attributes['popupBtnIconSpacing_tablet'])}px; }`);
	}
	if (attributes['popupBtnIconSpacing_mobile'] !== undefined) {
		mobileRules.push(`${selector} div.ts-filter i { margin-right: ${safeValue(attributes['popupBtnIconSpacing_mobile'])}px; }`);
		mobileRules.push(`${selector} div.ts-filter svg { margin-right: ${safeValue(attributes['popupBtnIconSpacing_mobile'])}px; }`);
	}

	// Chevron
	if (attributes['popupBtnChevronHide']) {
		cssRules.push(`${selector} div.ts-filter .ts-down-icon { display: none; }`);
	}

	if (attributes['popupBtnChevronColor']) {
		cssRules.push(`${selector} div.ts-filter .ts-down-icon { color: ${attributes['popupBtnChevronColor']}; }`);
	}
	if (attributes['popupBtnChevronColor_tablet']) {
		tabletRules.push(`${selector} div.ts-filter .ts-down-icon { color: ${attributes['popupBtnChevronColor_tablet']}; }`);
	}
	if (attributes['popupBtnChevronColor_mobile']) {
		mobileRules.push(`${selector} div.ts-filter .ts-down-icon { color: ${attributes['popupBtnChevronColor_mobile']}; }`);
	}

	// Hover states
	if (attributes['popupBtnBgColorHover']) {
		cssRules.push(`${selector} div.ts-filter:hover { background: ${attributes['popupBtnBgColorHover']}; }`);
	}
	if (attributes['popupBtnTextColorHover']) {
		cssRules.push(`${selector} div.ts-filter:hover { color: ${attributes['popupBtnTextColorHover']}; }`);
	}
	if (attributes['popupBtnBorderColorHover']) {
		cssRules.push(`${selector} div.ts-filter:hover { border-color: ${attributes['popupBtnBorderColorHover']}; }`);
	}
	if (attributes['popupBtnIconColorHover']) {
		cssRules.push(`${selector} div.ts-filter:hover i { color: ${attributes['popupBtnIconColorHover']}; }`);
		cssRules.push(`${selector} div.ts-filter:hover svg { fill: ${attributes['popupBtnIconColorHover']}; }`);
	}
	if (attributes['popupBtnChevronColorHover']) {
		cssRules.push(`${selector} div.ts-filter:hover .ts-down-icon { color: ${attributes['popupBtnChevronColorHover']}; }`);
	}

	// Filled (selected) state
	const popupBtnTypoFilled = generateTypographyCSS(attributes['popupBtnTypoFilled'] as TypographyConfig);
	if (popupBtnTypoFilled) {
		cssRules.push(`${selector} div.ts-filter.ts-filled { ${popupBtnTypoFilled} }`);
	}

	if (attributes['popupBtnBgColorFilled']) {
		cssRules.push(`${selector} div.ts-filter.ts-filled { background: ${attributes['popupBtnBgColorFilled']}; }`);
	}
	if (attributes['popupBtnTextColorFilled']) {
		cssRules.push(`${selector} div.ts-filter.ts-filled { color: ${attributes['popupBtnTextColorFilled']}; }`);
	}
	if (attributes['popupBtnBorderColorFilled']) {
		cssRules.push(`${selector} div.ts-filter.ts-filled { border-color: ${attributes['popupBtnBorderColorFilled']}; }`);
	}
	if (attributes['popupBtnBorderWidthFilled'] !== undefined) {
		const unit = attributes['popupBtnBorderWidthFilledUnit'] || 'px';
		cssRules.push(`${selector} div.ts-filter.ts-filled { border-width: ${safeValue(attributes['popupBtnBorderWidthFilled'])}${unit}; }`);
	}
	if (attributes['popupBtnBorderWidthFilled_tablet'] !== undefined) {
		const unit = attributes['popupBtnBorderWidthFilledUnit'] || 'px';
		tabletRules.push(`${selector} div.ts-filter.ts-filled { border-width: ${safeValue(attributes['popupBtnBorderWidthFilled_tablet'])}${unit}; }`);
	}
	if (attributes['popupBtnBorderWidthFilled_mobile'] !== undefined) {
		const unit = attributes['popupBtnBorderWidthFilledUnit'] || 'px';
		mobileRules.push(`${selector} div.ts-filter.ts-filled { border-width: ${safeValue(attributes['popupBtnBorderWidthFilled_mobile'])}${unit}; }`);
	}
	if (attributes['popupBtnIconColorFilled']) {
		cssRules.push(`${selector} div.ts-filter.ts-filled i { color: ${attributes['popupBtnIconColorFilled']}; }`);
		cssRules.push(`${selector} div.ts-filter.ts-filled svg { fill: ${attributes['popupBtnIconColorFilled']}; }`);
	}
	if (attributes['popupBtnChevronColorFilled']) {
		cssRules.push(`${selector} div.ts-filter.ts-filled .ts-down-icon { color: ${attributes['popupBtnChevronColorFilled']}; }`);
	}

	// ============================================
	// 5. FORM: INLINE TERMS/LIST (Normal/Hover/Selected)
	// ============================================

	if (attributes['inlineTermsTitleColor']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li h4 { color: ${attributes['inlineTermsTitleColor']}; }`);
	}
	if (attributes['inlineTermsIconColor']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li i { color: ${attributes['inlineTermsIconColor']}; }`);
	}
	if (attributes['inlineTermsBorderColor']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li { border-color: ${attributes['inlineTermsBorderColor']}; }`);
	}

	// Icon sizing and spacing
	if (attributes['inlineTermsIconSize'] !== undefined) {
		const unit = attributes['inlineTermsIconSizeUnit'] || 'px';
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon i { font-size: ${safeValue(attributes['inlineTermsIconSize'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconSize_tablet'] !== undefined) {
		const unit = attributes['inlineTermsIconSizeUnit'] || 'px';
		tabletRules.push(`${selector} .inline-multilevel .ts-term-icon i { font-size: ${safeValue(attributes['inlineTermsIconSize_tablet'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconSize_mobile'] !== undefined) {
		const unit = attributes['inlineTermsIconSizeUnit'] || 'px';
		mobileRules.push(`${selector} .inline-multilevel .ts-term-icon i { font-size: ${safeValue(attributes['inlineTermsIconSize_mobile'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconSpacing'] !== undefined) {
		const unit = attributes['inlineTermsIconSpacingUnit'] || 'px';
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon { margin-right: ${safeValue(attributes['inlineTermsIconSpacing'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconSpacing_tablet'] !== undefined) {
		const unit = attributes['inlineTermsIconSpacingUnit'] || 'px';
		tabletRules.push(`${selector} .inline-multilevel .ts-term-icon { margin-right: ${safeValue(attributes['inlineTermsIconSpacing_tablet'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconSpacing_mobile'] !== undefined) {
		const unit = attributes['inlineTermsIconSpacingUnit'] || 'px';
		mobileRules.push(`${selector} .inline-multilevel .ts-term-icon { margin-right: ${safeValue(attributes['inlineTermsIconSpacing_mobile'])}${unit}; }`);
	}

	// Icon container styling
	if (attributes['inlineTermsIconContainerSize'] !== undefined) {
		const unit = attributes['inlineTermsIconContainerSizeUnit'] || 'px';
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon { width: ${safeValue(attributes['inlineTermsIconContainerSize'])}${unit}; height: ${safeValue(attributes['inlineTermsIconContainerSize'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconContainerSize_tablet'] !== undefined) {
		const unit = attributes['inlineTermsIconContainerSizeUnit'] || 'px';
		tabletRules.push(`${selector} .inline-multilevel .ts-term-icon { width: ${safeValue(attributes['inlineTermsIconContainerSize_tablet'])}${unit}; height: ${safeValue(attributes['inlineTermsIconContainerSize_tablet'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconContainerSize_mobile'] !== undefined) {
		const unit = attributes['inlineTermsIconContainerSizeUnit'] || 'px';
		mobileRules.push(`${selector} .inline-multilevel .ts-term-icon { width: ${safeValue(attributes['inlineTermsIconContainerSize_mobile'])}${unit}; height: ${safeValue(attributes['inlineTermsIconContainerSize_mobile'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconContainerRadius'] !== undefined) {
		const unit = attributes['inlineTermsIconContainerRadiusUnit'] || 'px';
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon { border-radius: ${safeValue(attributes['inlineTermsIconContainerRadius'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconContainerRadius_tablet'] !== undefined) {
		const unit = attributes['inlineTermsIconContainerRadiusUnit'] || 'px';
		tabletRules.push(`${selector} .inline-multilevel .ts-term-icon { border-radius: ${safeValue(attributes['inlineTermsIconContainerRadius_tablet'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconContainerRadius_mobile'] !== undefined) {
		const unit = attributes['inlineTermsIconContainerRadiusUnit'] || 'px';
		mobileRules.push(`${selector} .inline-multilevel .ts-term-icon { border-radius: ${safeValue(attributes['inlineTermsIconContainerRadius_mobile'])}${unit}; }`);
	}
	if (attributes['inlineTermsIconContainerBg']) {
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon { background-color: ${attributes['inlineTermsIconContainerBg']}; }`);
	}

	// Chevron color
	if (attributes['inlineTermsChevronColor']) {
		cssRules.push(`${selector} .inline-multilevel li > a .ts-right-icon { color: ${attributes['inlineTermsChevronColor']}; }`);
	}

	// Hover
	if (attributes['inlineTermsTitleColorHover']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li:hover h4 { color: ${attributes['inlineTermsTitleColorHover']}; }`);
	}
	if (attributes['inlineTermsIconColorHover']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li:hover i { color: ${attributes['inlineTermsIconColorHover']}; }`);
	}
	if (attributes['inlineTermsBgColorHover']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li:hover { background-color: ${attributes['inlineTermsBgColorHover']}; }`);
	}
	if (attributes['inlineTermsBgHover']) {
		cssRules.push(`${selector} .inline-multilevel li > a:hover { background-color: ${attributes['inlineTermsBgHover']}; }`);
	}
	if (attributes['inlineTermsBorderColorHover']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li:hover { border-color: ${attributes['inlineTermsBorderColorHover']}; }`);
	}

	// Selected
	if (attributes['inlineTermsTitleColorSelected']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li.ts-selected h4 { color: ${attributes['inlineTermsTitleColorSelected']}; }`);
	}
	if (attributes['inlineTermsIconColorSelected']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li.ts-selected i { color: ${attributes['inlineTermsIconColorSelected']}; }`);
	}
	if (attributes['inlineTermsBgColorSelected']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li.ts-selected { background-color: ${attributes['inlineTermsBgColorSelected']}; }`);
	}
	if (attributes['inlineTermsBorderColorSelected']) {
		cssRules.push(`${selector} .ts-term-dropdown .ts-term-dropdown-list li.ts-selected { border-color: ${attributes['inlineTermsBorderColorSelected']}; }`);
	}

	// ============================================
	// 6. FORM: INLINE CHECKBOX
	// ============================================

	if (attributes['checkboxSize'] !== undefined) {
		cssRules.push(`${selector} .container-checkbox .checkmark { width: ${safeValue(attributes['checkboxSize'])}px; height: ${safeValue(attributes['checkboxSize'])}px; }`);
	}
	if (attributes['checkboxSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .container-checkbox .checkmark { width: ${safeValue(attributes['checkboxSize_tablet'])}px; height: ${safeValue(attributes['checkboxSize_tablet'])}px; }`);
	}
	if (attributes['checkboxSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .container-checkbox .checkmark { width: ${safeValue(attributes['checkboxSize_mobile'])}px; height: ${safeValue(attributes['checkboxSize_mobile'])}px; }`);
	}
	if (attributes['checkboxRadius'] !== undefined) {
		cssRules.push(`${selector} .container-checkbox .checkmark { border-radius: ${safeValue(attributes['checkboxRadius'])}px; }`);
	}
	if (attributes['checkboxRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .container-checkbox .checkmark { border-radius: ${safeValue(attributes['checkboxRadius_tablet'])}px; }`);
	}
	if (attributes['checkboxRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .container-checkbox .checkmark { border-radius: ${safeValue(attributes['checkboxRadius_mobile'])}px; }`);
	}

	const checkboxBorder = generateBorderCSS(attributes['checkboxBorder'] as BorderGroupValue);
	if (checkboxBorder) {
		cssRules.push(`${selector} .container-checkbox .checkmark { ${checkboxBorder} }`);
	}

	// Unchecked state
	if (attributes['checkboxBgColor']) {
		cssRules.push(`${selector} .container-checkbox .checkmark { background-color: ${attributes['checkboxBgColor']}; }`);
	}
	if (attributes['checkboxBgUnchecked']) {
		cssRules.push(`${selector} .container-checkbox input:not(:checked) ~ .checkmark { background-color: ${attributes['checkboxBgUnchecked']}; }`);
	}
	if (attributes['checkboxIconColor']) {
		cssRules.push(`${selector} .container-checkbox .checkmark i { color: ${attributes['checkboxIconColor']}; }`);
	}

	// Checked state
	if (attributes['checkboxBgColorChecked']) {
		cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark { background-color: ${attributes['checkboxBgColorChecked']}; }`);
	}
	if (attributes['checkboxBgChecked']) {
		cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark { background-color: ${attributes['checkboxBgChecked']}; }`);
	}
	if (attributes['checkboxBorderColorChecked']) {
		cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark { border-color: ${attributes['checkboxBorderColorChecked']}; }`);
	}
	if (attributes['checkboxBorderChecked']) {
		cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark { border-color: ${attributes['checkboxBorderChecked']}; }`);
	}
	if (attributes['checkboxIconColorChecked']) {
		cssRules.push(`${selector} .container-checkbox input:checked ~ .checkmark i { color: ${attributes['checkboxIconColorChecked']}; }`);
	}

	// ============================================
	// 7. FORM: INLINE RADIO
	// ============================================

	if (attributes['radioSize'] !== undefined) {
		cssRules.push(`${selector} .container-radio .checkmark { width: ${safeValue(attributes['radioSize'])}px; height: ${safeValue(attributes['radioSize'])}px; }`);
	}
	if (attributes['radioSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .container-radio .checkmark { width: ${safeValue(attributes['radioSize_tablet'])}px; height: ${safeValue(attributes['radioSize_tablet'])}px; }`);
	}
	if (attributes['radioSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .container-radio .checkmark { width: ${safeValue(attributes['radioSize_mobile'])}px; height: ${safeValue(attributes['radioSize_mobile'])}px; }`);
	}
	if (attributes['radioRadius'] !== undefined) {
		cssRules.push(`${selector} .container-radio .checkmark { border-radius: ${safeValue(attributes['radioRadius'])}px; }`);
	}
	if (attributes['radioRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .container-radio .checkmark { border-radius: ${safeValue(attributes['radioRadius_tablet'])}px; }`);
	}
	if (attributes['radioRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .container-radio .checkmark { border-radius: ${safeValue(attributes['radioRadius_mobile'])}px; }`);
	}

	const radioBorder = generateBorderCSS(attributes['radioBorder'] as BorderGroupValue);
	if (radioBorder) {
		cssRules.push(`${selector} .container-radio .checkmark { ${radioBorder} }`);
	}

	// Unchecked state
	if (attributes['radioBgColor']) {
		cssRules.push(`${selector} .container-radio .checkmark { background-color: ${attributes['radioBgColor']}; }`);
	}
	if (attributes['radioBgUnchecked']) {
		cssRules.push(`${selector} .container-radio input:not(:checked) ~ .checkmark { background-color: ${attributes['radioBgUnchecked']}; }`);
	}
	if (attributes['radioDotColor']) {
		cssRules.push(`${selector} .container-radio .checkmark:after { background-color: ${attributes['radioDotColor']}; }`);
	}

	// Checked state
	if (attributes['radioBgColorChecked']) {
		cssRules.push(`${selector} .container-radio input:checked ~ .checkmark { background-color: ${attributes['radioBgColorChecked']}; }`);
	}
	if (attributes['radioBgChecked']) {
		cssRules.push(`${selector} .container-radio input:checked ~ .checkmark { background-color: ${attributes['radioBgChecked']}; }`);
	}
	if (attributes['radioBorderColorChecked']) {
		cssRules.push(`${selector} .container-radio input:checked ~ .checkmark { border-color: ${attributes['radioBorderColorChecked']}; }`);
	}
	if (attributes['radioBorderChecked']) {
		cssRules.push(`${selector} .container-radio input:checked ~ .checkmark { border-color: ${attributes['radioBorderChecked']}; }`);
	}
	if (attributes['radioDotColorChecked']) {
		cssRules.push(`${selector} .container-radio input:checked ~ .checkmark:after { background-color: ${attributes['radioDotColorChecked']}; }`);
	}

	// ============================================
	// 8. FORM: SWITCHER
	// ============================================

	if (attributes['switcherBgInactive']) {
		cssRules.push(`${selector} .onoffswitch-label { background-color: ${attributes['switcherBgInactive']}; }`);
	}
	if (attributes['switcherBgActive']) {
		cssRules.push(`${selector} .onoffswitch-checkbox:checked + .onoffswitch-label { background-color: ${attributes['switcherBgActive']}; }`);
	}
	if (attributes['switcherHandleBg']) {
		cssRules.push(`${selector} .onoffswitch-label:before { background-color: ${attributes['switcherHandleBg']}; }`);
	}

	// ============================================
	// 9. FORM: NUMBER STEPPER (Normal/Hover)
	// ============================================

	if (attributes['stepperInputSize'] !== undefined) {
		cssRules.push(`${selector} .ts-stepper-input button { width: ${safeValue(attributes['stepperInputSize'])}px; height: ${safeValue(attributes['stepperInputSize'])}px; }`);
	}
	if (attributes['stepperInputSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-stepper-input button { width: ${safeValue(attributes['stepperInputSize_tablet'])}px; height: ${safeValue(attributes['stepperInputSize_tablet'])}px; }`);
	}
	if (attributes['stepperInputSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-stepper-input button { width: ${safeValue(attributes['stepperInputSize_mobile'])}px; height: ${safeValue(attributes['stepperInputSize_mobile'])}px; }`);
	}

	if (attributes['stepperBtnIconColor']) {
		cssRules.push(`${selector} .ts-stepper-input button i { color: ${attributes['stepperBtnIconColor']}; }`);
	}
	if (attributes['stepperBtnBg']) {
		cssRules.push(`${selector} .ts-stepper-input button { background-color: ${attributes['stepperBtnBg']}; }`);
	}

	const stepperBtnBorder = generateBorderCSS(attributes['stepperBtnBorder'] as BorderGroupValue);
	if (stepperBtnBorder) {
		cssRules.push(`${selector} .ts-stepper-input button { ${stepperBtnBorder} }`);
	}

	if (attributes['stepperBtnRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-stepper-input button { border-radius: ${safeValue(attributes['stepperBtnRadius'])}px; }`);
	}
	if (attributes['stepperBtnRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-stepper-input button { border-radius: ${safeValue(attributes['stepperBtnRadius_tablet'])}px; }`);
	}
	if (attributes['stepperBtnRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-stepper-input button { border-radius: ${safeValue(attributes['stepperBtnRadius_mobile'])}px; }`);
	}

	// Hover
	if (attributes['stepperBtnIconColorHover']) {
		cssRules.push(`${selector} .ts-stepper-input button:hover i { color: ${attributes['stepperBtnIconColorHover']}; }`);
	}
	if (attributes['stepperBtnBgHover']) {
		cssRules.push(`${selector} .ts-stepper-input button:hover { background-color: ${attributes['stepperBtnBgHover']}; }`);
	}
	if (attributes['stepperBtnBorderColorHover']) {
		cssRules.push(`${selector} .ts-stepper-input button:hover { border-color: ${attributes['stepperBtnBorderColorHover']}; }`);
	}

	// ============================================
	// 10. FORM: REPEATER
	// ============================================

	if (attributes['repeaterBg']) {
		cssRules.push(`${selector} .ts-repeater { background-color: ${attributes['repeaterBg']}; }`);
	}

	const repeaterBorder = generateBorderCSS(attributes['repeaterBorder'] as BorderGroupValue);
	if (repeaterBorder) {
		cssRules.push(`${selector} .ts-repeater { ${repeaterBorder} }`);
	}

	if (attributes['repeaterRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-repeater { border-radius: ${safeValue(attributes['repeaterRadius'])}px; }`);
	}
	if (attributes['repeaterRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-repeater { border-radius: ${safeValue(attributes['repeaterRadius_tablet'])}px; }`);
	}
	if (attributes['repeaterRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-repeater { border-radius: ${safeValue(attributes['repeaterRadius_mobile'])}px; }`);
	}

	const repeaterShadow = generateBoxShadowCSS(attributes['repeaterShadow'] as BoxShadowConfig);
	if (repeaterShadow) {
		cssRules.push(`${selector} .repeater-row { box-shadow: ${repeaterShadow}; }`);
	}

	// ============================================
	// 11. FORM: REPEATER HEAD
	// ============================================

	if (attributes['repeaterHeadSecondaryColor']) {
		cssRules.push(`${selector} .ts-repeater-head .ts-repeater-head-secondary { color: ${attributes['repeaterHeadSecondaryColor']}; }`);
	}
	const repeaterHeadSecondaryTypo = generateTypographyCSS(attributes['repeaterHeadSecondaryTypo'] as TypographyConfig);
	if (repeaterHeadSecondaryTypo) {
		cssRules.push(`${selector} .ts-repeater-head .ts-repeater-head-secondary { ${repeaterHeadSecondaryTypo} }`);
	}
	if (attributes['repeaterHeadIconColor']) {
		cssRules.push(`${selector} .ts-repeater-head i { color: ${attributes['repeaterHeadIconColor']}; }`);
	}
	if (attributes['repeaterHeadIconColorWarning']) {
		cssRules.push(`${selector} .ts-repeater-head.ts-warning i { color: ${attributes['repeaterHeadIconColorWarning']}; }`);
	}
	if (attributes['repeaterHeadIconColorSuccess']) {
		cssRules.push(`${selector} .ts-repeater-head.ts-success i { color: ${attributes['repeaterHeadIconColorSuccess']}; }`);
	}

	const repeaterHeadBorder = generateBorderCSS(attributes['repeaterHeadBorder'] as BorderGroupValue);
	if (repeaterHeadBorder) {
		cssRules.push(`${selector} .ts-repeater-head { ${repeaterHeadBorder} }`);
	}

	if (attributes['repeaterHeadBorderWidth'] !== undefined) {
		const unit = attributes['repeaterHeadBorderWidthUnit'] || 'px';
		cssRules.push(`${selector} .repeater-head { border-width: ${safeValue(attributes['repeaterHeadBorderWidth'])}${unit}; }`);
	}
	if (attributes['repeaterHeadBorderColor']) {
		cssRules.push(`${selector} .repeater-head { border-color: ${attributes['repeaterHeadBorderColor']}; }`);
	}

	if (attributes['repeaterHeadRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-repeater-head { border-radius: ${safeValue(attributes['repeaterHeadRadius'])}px; }`);
	}
	if (attributes['repeaterHeadRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-repeater-head { border-radius: ${safeValue(attributes['repeaterHeadRadius_tablet'])}px; }`);
	}
	if (attributes['repeaterHeadRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-repeater-head { border-radius: ${safeValue(attributes['repeaterHeadRadius_mobile'])}px; }`);
	}

	// ============================================
	// 12. REPEATER: ICON BUTTON (Normal/Hover)
	// ============================================

	if (attributes['repeaterIconBtnSize'] !== undefined) {
		cssRules.push(`${selector} .ts-icon-btn { width: ${safeValue(attributes['repeaterIconBtnSize'])}px; height: ${safeValue(attributes['repeaterIconBtnSize'])}px; }`);
	}
	if (attributes['repeaterIconBtnSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-icon-btn { width: ${safeValue(attributes['repeaterIconBtnSize_tablet'])}px; height: ${safeValue(attributes['repeaterIconBtnSize_tablet'])}px; }`);
	}
	if (attributes['repeaterIconBtnSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-icon-btn { width: ${safeValue(attributes['repeaterIconBtnSize_mobile'])}px; height: ${safeValue(attributes['repeaterIconBtnSize_mobile'])}px; }`);
	}

	if (attributes['repeaterIconBtnColor']) {
		cssRules.push(`${selector} .ts-icon-btn i { color: ${attributes['repeaterIconBtnColor']}; }`);
	}
	if (attributes['repeaterIconBtnBg']) {
		cssRules.push(`${selector} .ts-icon-btn { background-color: ${attributes['repeaterIconBtnBg']}; }`);
	}

	const repeaterIconBtnBorder = generateBorderCSS(attributes['repeaterIconBtnBorder'] as BorderGroupValue);
	if (repeaterIconBtnBorder) {
		cssRules.push(`${selector} .ts-icon-btn { ${repeaterIconBtnBorder} }`);
	}

	if (attributes['repeaterIconBtnRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-icon-btn { border-radius: ${safeValue(attributes['repeaterIconBtnRadius'])}px; }`);
	}
	if (attributes['repeaterIconBtnRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-icon-btn { border-radius: ${safeValue(attributes['repeaterIconBtnRadius_tablet'])}px; }`);
	}
	if (attributes['repeaterIconBtnRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-icon-btn { border-radius: ${safeValue(attributes['repeaterIconBtnRadius_mobile'])}px; }`);
	}

	// Hover
	if (attributes['repeaterIconBtnColorHover']) {
		cssRules.push(`${selector} .ts-icon-btn:hover i { color: ${attributes['repeaterIconBtnColorHover']}; }`);
	}
	if (attributes['repeaterIconBtnBgHover']) {
		cssRules.push(`${selector} .ts-icon-btn:hover { background-color: ${attributes['repeaterIconBtnBgHover']}; }`);
	}
	if (attributes['repeaterIconBtnBorderColorHover']) {
		cssRules.push(`${selector} .ts-icon-btn:hover { border-color: ${attributes['repeaterIconBtnBorderColorHover']}; }`);
	}

	// ============================================
	// 13. FORM: HEADING
	// ============================================

	const formHeadingTypo = generateTypographyCSS(attributes['formHeadingTypo'] as TypographyConfig);
	if (formHeadingTypo) {
		cssRules.push(`${selector} .create-form-step > .ts-form-group.ui-heading-field label { ${formHeadingTypo} }`);
	}

	if (attributes['formHeadingColor']) {
		cssRules.push(`${selector} .create-form-step > .ts-form-group.ui-heading-field label { color: ${attributes['formHeadingColor']}; }`);
	}

	// ============================================
	// 14. FORM: IMAGE
	// ============================================

	if (attributes['formImageWidth'] !== undefined) {
		cssRules.push(`${selector} .ts-form-group .field-image img { width: ${safeValue(attributes['formImageWidth'])}px; }`);
	}
	if (attributes['formImageWidth_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .field-image img { width: ${safeValue(attributes['formImageWidth_tablet'])}px; }`);
	}
	if (attributes['formImageWidth_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .field-image img { width: ${safeValue(attributes['formImageWidth_mobile'])}px; }`);
	}
	if (attributes['formImageRadius'] !== undefined) {
		cssRules.push(`${selector} .ts-form-group .field-image img { border-radius: ${safeValue(attributes['formImageRadius'])}px; }`);
	}
	if (attributes['formImageRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .field-image img { border-radius: ${safeValue(attributes['formImageRadius_tablet'])}px; }`);
	}
	if (attributes['formImageRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .field-image img { border-radius: ${safeValue(attributes['formImageRadius_mobile'])}px; }`);
	}

	// ============================================
	// 15. FORM: AVAILABILITY CALENDAR
	// ============================================

	if (attributes['calContentSpacing'] !== undefined) {
		cssRules.push(`${selector} .pika-lendar { padding: ${safeValue(attributes['calContentSpacing'])}px; }`);
	}
	if (attributes['calContentSpacing_tablet'] !== undefined) {
		tabletRules.push(`${selector} .pika-lendar { padding: ${safeValue(attributes['calContentSpacing_tablet'])}px; }`);
	}
	if (attributes['calContentSpacing_mobile'] !== undefined) {
		mobileRules.push(`${selector} .pika-lendar { padding: ${safeValue(attributes['calContentSpacing_mobile'])}px; }`);
	}
	if (attributes['calBg']) {
		cssRules.push(`${selector} .pika-lendar { background-color: ${attributes['calBg']}; }`);
	}

	const calBorder = generateBorderCSS(attributes['calBorder'] as BorderGroupValue);
	if (calBorder) {
		cssRules.push(`${selector} .pika-lendar { ${calBorder} }`);
	}

	if (attributes['calRadius'] !== undefined) {
		cssRules.push(`${selector} .pika-lendar { border-radius: ${safeValue(attributes['calRadius'])}px; }`);
	}
	if (attributes['calRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .pika-lendar { border-radius: ${safeValue(attributes['calRadius_tablet'])}px; }`);
	}
	if (attributes['calRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .pika-lendar { border-radius: ${safeValue(attributes['calRadius_mobile'])}px; }`);
	}
	if (attributes['calBorderRadius'] !== undefined) {
		const unit = attributes['calBorderRadiusUnit'] || 'px';
		cssRules.push(`${selector} .availability-calendar { border-radius: ${safeValue(attributes['calBorderRadius'])}${unit}; }`);
	}
	if (attributes['calBorderRadius_tablet'] !== undefined) {
		const unit = attributes['calBorderRadiusUnit'] || 'px';
		tabletRules.push(`${selector} .availability-calendar { border-radius: ${safeValue(attributes['calBorderRadius_tablet'])}${unit}; }`);
	}
	if (attributes['calBorderRadius_mobile'] !== undefined) {
		const unit = attributes['calBorderRadiusUnit'] || 'px';
		mobileRules.push(`${selector} .availability-calendar { border-radius: ${safeValue(attributes['calBorderRadius_mobile'])}${unit}; }`);
	}

	const calShadow = generateBoxShadowCSS(attributes['calShadow'] as BoxShadowConfig);
	if (calShadow) {
		cssRules.push(`${selector} .pika-lendar { box-shadow: ${calShadow}; }`);
	}

	// Month styling
	if (attributes['calMonthColor']) {
		cssRules.push(`${selector} .availability-calendar .cal-month { color: ${attributes['calMonthColor']}; }`);
	}
	const calMonthTypo = generateTypographyCSS(attributes['calMonthTypo'] as TypographyConfig);
	if (calMonthTypo) {
		cssRules.push(`${selector} .availability-calendar .cal-month { ${calMonthTypo} }`);
	}

	// Calendar days
	if (attributes['calDayColor']) {
		cssRules.push(`${selector} .pika-button { color: ${attributes['calDayColor']}; }`);
	}
	const calDayTypo = generateTypographyCSS(attributes['calDayTypo'] as TypographyConfig);
	if (calDayTypo) {
		cssRules.push(`${selector} .pika-table th { ${calDayTypo} }`);
	}
	if (attributes['calDayBgHover']) {
		cssRules.push(`${selector} .pika-button:hover { background-color: ${attributes['calDayBgHover']}; }`);
	}
	if (attributes['calDayColorHover']) {
		cssRules.push(`${selector} .pika-button:hover { color: ${attributes['calDayColorHover']}; }`);
	}
	if (attributes['calDayBgActive']) {
		cssRules.push(`${selector} .pika-button.is-selected { background-color: ${attributes['calDayBgActive']}; }`);
	}
	if (attributes['calDayColorActive']) {
		cssRules.push(`${selector} .pika-button.is-selected { color: ${attributes['calDayColorActive']}; }`);
	}

	// Available dates
	if (attributes['calDateAvailColor']) {
		cssRules.push(`${selector} .availability-calendar .cal-date.available { color: ${attributes['calDateAvailColor']}; }`);
	}
	const calDateAvailTypo = generateTypographyCSS(attributes['calDateAvailTypo'] as TypographyConfig);
	if (calDateAvailTypo) {
		cssRules.push(`${selector} .availability-calendar .cal-date.available { ${calDateAvailTypo} }`);
	}
	if (attributes['calDateAvailBg']) {
		cssRules.push(`${selector} .availability-calendar .cal-date.available { background-color: ${attributes['calDateAvailBg']}; }`);
	}
	if (attributes['calDateAvailColorHover']) {
		cssRules.push(`${selector} .availability-calendar .cal-date.available:hover { color: ${attributes['calDateAvailColorHover']}; }`);
	}
	if (attributes['calDateAvailBgHover']) {
		cssRules.push(`${selector} .availability-calendar .cal-date.available:hover { background-color: ${attributes['calDateAvailBgHover']}; }`);
	}

	// Unavailable dates
	if (attributes['calDateUnavailColor']) {
		cssRules.push(`${selector} .availability-calendar .cal-date.unavailable { color: ${attributes['calDateUnavailColor']}; }`);
	}
	const calDateUnavailTypo = generateTypographyCSS(attributes['calDateUnavailTypo'] as TypographyConfig);
	if (calDateUnavailTypo) {
		cssRules.push(`${selector} .availability-calendar .cal-date.unavailable { ${calDateUnavailTypo} }`);
	}

	// Disabled dates
	if (attributes['calDateDisabledLine']) {
		cssRules.push(`${selector} .availability-calendar .cal-date.disabled { text-decoration: ${attributes['calDateDisabledLine']}; }`);
	}

	// Other calendar elements radius
	if (attributes['calOtherRadius'] !== undefined) {
		const unit = attributes['calOtherRadiusUnit'] || 'px';
		cssRules.push(`${selector} .availability-calendar .cal-date { border-radius: ${safeValue(attributes['calOtherRadius'])}${unit}; }`);
	}
	if (attributes['calOtherRadius_tablet'] !== undefined) {
		const unit = attributes['calOtherRadiusUnit'] || 'px';
		tabletRules.push(`${selector} .availability-calendar .cal-date { border-radius: ${safeValue(attributes['calOtherRadius_tablet'])}${unit}; }`);
	}
	if (attributes['calOtherRadius_mobile'] !== undefined) {
		const unit = attributes['calOtherRadiusUnit'] || 'px';
		mobileRules.push(`${selector} .availability-calendar .cal-date { border-radius: ${safeValue(attributes['calOtherRadius_mobile'])}${unit}; }`);
	}

	// ============================================
	// 16. FORM: CALENDAR BUTTONS (Normal/Hover)
	// ============================================

	if (attributes['calBtnSize'] !== undefined) {
		cssRules.push(`${selector} .pika-title button { width: ${safeValue(attributes['calBtnSize'])}px; height: ${safeValue(attributes['calBtnSize'])}px; }`);
	}
	if (attributes['calBtnSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .pika-title button { width: ${safeValue(attributes['calBtnSize_tablet'])}px; height: ${safeValue(attributes['calBtnSize_tablet'])}px; }`);
	}
	if (attributes['calBtnSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .pika-title button { width: ${safeValue(attributes['calBtnSize_mobile'])}px; height: ${safeValue(attributes['calBtnSize_mobile'])}px; }`);
	}

	if (attributes['calBtnIconSize'] !== undefined) {
		const unit = attributes['calBtnIconSizeUnit'] || 'px';
		cssRules.push(`${selector} .cal-btn i { font-size: ${safeValue(attributes['calBtnIconSize'])}${unit}; }`);
	}
	if (attributes['calBtnIconSize_tablet'] !== undefined) {
		const unit = attributes['calBtnIconSizeUnit'] || 'px';
		tabletRules.push(`${selector} .cal-btn i { font-size: ${safeValue(attributes['calBtnIconSize_tablet'])}${unit}; }`);
	}
	if (attributes['calBtnIconSize_mobile'] !== undefined) {
		const unit = attributes['calBtnIconSizeUnit'] || 'px';
		mobileRules.push(`${selector} .cal-btn i { font-size: ${safeValue(attributes['calBtnIconSize_mobile'])}${unit}; }`);
	}

	if (attributes['calBtnIconColor']) {
		cssRules.push(`${selector} .pika-title button i { color: ${attributes['calBtnIconColor']}; }`);
	}
	if (attributes['calBtnBg']) {
		cssRules.push(`${selector} .pika-title button { background-color: ${attributes['calBtnBg']}; }`);
	}

	const calBtnBorder = generateBorderCSS(attributes['calBtnBorder'] as BorderGroupValue);
	if (calBtnBorder) {
		cssRules.push(`${selector} .pika-title button { ${calBtnBorder} }`);
	}

	if (attributes['calBtnRadius'] !== undefined) {
		cssRules.push(`${selector} .pika-title button { border-radius: ${safeValue(attributes['calBtnRadius'])}px; }`);
	}
	if (attributes['calBtnRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .pika-title button { border-radius: ${safeValue(attributes['calBtnRadius_tablet'])}px; }`);
	}
	if (attributes['calBtnRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .pika-title button { border-radius: ${safeValue(attributes['calBtnRadius_mobile'])}px; }`);
	}

	// Hover
	if (attributes['calBtnIconColorHover']) {
		cssRules.push(`${selector} .pika-title button:hover i { color: ${attributes['calBtnIconColorHover']}; }`);
	}
	if (attributes['calBtnBgHover']) {
		cssRules.push(`${selector} .pika-title button:hover { background-color: ${attributes['calBtnBgHover']}; }`);
	}
	if (attributes['calBtnBorderColorHover']) {
		cssRules.push(`${selector} .pika-title button:hover { border-color: ${attributes['calBtnBorderColorHover']}; }`);
	}

	// ============================================
	// 17. FORM: ATTRIBUTES (Normal/Hover)
	// ============================================

	const formAttrTypo = generateTypographyCSS(attributes['formAttrTypo'] as TypographyConfig);
	if (formAttrTypo) {
		cssRules.push(`${selector} .product-attr-chip { ${formAttrTypo} }`);
	}

	if (attributes['formAttrRadius'] !== undefined) {
		cssRules.push(`${selector} .product-attr-chip { border-radius: ${safeValue(attributes['formAttrRadius'])}px; }`);
	}
	if (attributes['formAttrRadius_tablet'] !== undefined) {
		tabletRules.push(`${selector} .product-attr-chip { border-radius: ${safeValue(attributes['formAttrRadius_tablet'])}px; }`);
	}
	if (attributes['formAttrRadius_mobile'] !== undefined) {
		mobileRules.push(`${selector} .product-attr-chip { border-radius: ${safeValue(attributes['formAttrRadius_mobile'])}px; }`);
	}

	if (attributes['formAttrTextColor']) {
		cssRules.push(`${selector} .product-attr-chip { color: ${attributes['formAttrTextColor']}; }`);
	}
	if (attributes['formAttrBgColor']) {
		cssRules.push(`${selector} .product-attr-chip { background-color: ${attributes['formAttrBgColor']}; }`);
	}

	const formAttrBorder = generateBorderCSS(attributes['formAttrBorder'] as BorderGroupValue);
	if (formAttrBorder) {
		cssRules.push(`${selector} .product-attr-chip { ${formAttrBorder} }`);
	}

	// Hover
	if (attributes['formAttrTextColorHover']) {
		cssRules.push(`${selector} .product-attr-chip:hover { color: ${attributes['formAttrTextColorHover']}; }`);
	}
	if (attributes['formAttrBgColorHover']) {
		cssRules.push(`${selector} .product-attr-chip:hover { background-color: ${attributes['formAttrBgColorHover']}; }`);
	}
	if (attributes['formAttrBorderColorHover']) {
		cssRules.push(`${selector} .product-attr-chip:hover { border-color: ${attributes['formAttrBorderColorHover']}; }`);
	}

	// ============================================
	// 18. FORM: COLOR FIELD
	// ============================================

	if (attributes['colorFieldPlaceholder']) {
		cssRules.push(`${selector} .color-field input::placeholder { color: ${attributes['colorFieldPlaceholder']}; }`);
	}

	const colorFieldPlaceholderTypo = generateTypographyCSS(attributes['colorFieldPlaceholderTypo'] as TypographyConfig);
	if (colorFieldPlaceholderTypo) {
		cssRules.push(`${selector} .color-field input::placeholder { ${colorFieldPlaceholderTypo} }`);
	}

	if (attributes['colorFieldTextColor']) {
		cssRules.push(`${selector} .color-field input { color: ${attributes['colorFieldTextColor']}; }`);
	}

	const colorFieldTextTypo = generateTypographyCSS(attributes['colorFieldTextTypo'] as TypographyConfig);
	if (colorFieldTextTypo) {
		cssRules.push(`${selector} .color-field input { ${colorFieldTextTypo} }`);
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
