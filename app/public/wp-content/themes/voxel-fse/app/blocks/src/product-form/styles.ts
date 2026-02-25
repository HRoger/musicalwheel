/**
 * Product Form Block - Block-Specific CSS Generation
 *
 * Generates responsive CSS for Style tab controls targeting Voxel classes.
 * This is Layer 2 (block-specific CSS) - combined with Layer 1 (AdvancedTab) in edit/save.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/product-form.php
 * - Voxel template: themes/voxel/templates/widgets/product-form.php
 *
 * @package VoxelFSE
 */

import type { ProductFormAttributes } from './types';

/**
 * Helper: Generate dimensions CSS (padding, margin)
 */
// @ts-ignore -- unused but kept for future use
function _generateDimensionsCSS(
	dimensions: any | undefined,
	property: string
): string {
	if (!dimensions) return '';
	const { unit = 'px' } = dimensions;
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Helper: Generate border CSS from BorderGroupValue
 */
function generateBorderCSS(border: any | undefined): string {
	if (!border?.borderType || border.borderType === 'none') return '';
	const width = border.borderWidth || {};
	const top = parseFloat(String(width.top)) || 0;
	const right = parseFloat(String(width.right)) || 0;
	const bottom = parseFloat(String(width.bottom)) || 0;
	const left = parseFloat(String(width.left)) || 0;
	const color = border.borderColor || '#000000';
	return `border-style: ${border.borderType}; border-width: ${top}px ${right}px ${bottom}px ${left}px; border-color: ${color};`;
}

/**
 * Helper: Generate box-shadow CSS
 */
function generateBoxShadowCSS(shadow: any): string {
	if (!shadow || !shadow.enable) return '';
	const {
		horizontal = 0,
		vertical = 0,
		blur = 0,
		spread = 0,
		color = 'rgba(0,0,0,0.1)',
		position = 'outline',
	} = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
}

/**
 * Helper: Generate typography CSS
 */
function generateTypographyCSS(typography: any): string {
	if (!typography) return '';
	let css = '';
	if (typography.fontFamily) css += `font-family: ${typography.fontFamily}; `;
	if (typography.fontSize)
		css += `font-size: ${typography.fontSize}${typography.fontSizeUnit || 'px'}; `;
	if (typography.fontWeight) css += `font-weight: ${typography.fontWeight}; `;
	if (typography.fontStyle) css += `font-style: ${typography.fontStyle}; `;
	if (typography.textTransform)
		css += `text-transform: ${typography.textTransform}; `;
	if (typography.textDecoration)
		css += `text-decoration: ${typography.textDecoration}; `;
	if (typography.lineHeight)
		css += `line-height: ${typography.lineHeight}${typography.lineHeightUnit || ''}; `;
	if (typography.letterSpacing)
		css += `letter-spacing: ${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}; `;
	return css;
}

/**
 * Generate responsive CSS for product-form block
 * Targets Voxel CSS classes within scoped block selector
 */
export function generateProductFormResponsiveCSS(
	attributes: ProductFormAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-product-form-${blockId}`;

	// ============================================
	// SECTION: General (Field Spacing, Field Label)
	// Source: product-form.php:215-278
	// ============================================

	// Field spacing - ts_field_spacing
	// Verified: product-form.php:215 - '{{WRAPPER}} .ts-form-group'
	if (attributes.fieldSpacing !== undefined) {
		cssRules.push(
			`${selector} .ts-form-group { margin-bottom: ${attributes.fieldSpacing}px; }`
		);
	}
	if (attributes.fieldSpacingTablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-form-group { margin-bottom: ${attributes.fieldSpacingTablet}px; }`
		);
	}
	if (attributes.fieldSpacingMobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-form-group { margin-bottom: ${attributes.fieldSpacingMobile}px; }`
		);
	}

	// Field label typography - ts_lbl_text
	// Verified: product-form.php:256 - '{{WRAPPER}} .ts-form label'
	if (attributes.fieldLabelTypography) {
		const typoCSS = generateTypographyCSS(attributes.fieldLabelTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-form label { ${typoCSS} }`);
		}
	}

	// Field label color - ts_lbl_col
	// Verified: product-form.php:264 - '{{WRAPPER}} .ts-form label'
	if (attributes.fieldLabelColor) {
		cssRules.push(
			`${selector} .ts-form label { color: ${attributes.fieldLabelColor}; }`
		);
	}

	// ============================================
	// SECTION: Primary Button (Normal + Hover States)
	// Source: product-form.php:278-510
	// ============================================

	// Primary button typography - ts_submit_btn_typo
	// Verified: product-form.php:302 - '{{WRAPPER}} .ts-btn.form-btn'
	if (attributes.primaryButtonTypography) {
		const typoCSS = generateTypographyCSS(attributes.primaryButtonTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-btn.form-btn { ${typoCSS} }`);
		}
	}

	// Primary button border - ts_sf_form_btn_border
	// Verified: product-form.php:313 - '{{WRAPPER}} .ts-btn.form-btn'
	if (attributes.primaryButtonBorder) {
		const borderCSS = generateBorderCSS(attributes.primaryButtonBorder);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-btn.form-btn { ${borderCSS} }`);
		}
	}

	// Primary button border radius - ts_sf_form_btn_radius
	// Verified: product-form.php:320 - '{{WRAPPER}} .ts-btn.form-btn'
	if (attributes.primaryButtonBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-btn.form-btn { border-radius: ${attributes.primaryButtonBorderRadius}px; }`
		);
	}

	// Primary button box shadow - ts_sf_form_btn_shadow
	// Verified: product-form.php:345 - '{{WRAPPER}} .ts-btn.form-btn'
	if (attributes.primaryButtonBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.primaryButtonBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-btn.form-btn { ${shadowCSS} }`);
		}
	}

	// Primary button text color - ts_sf_form_btn_c
	// Verified: product-form.php:353 - '{{WRAPPER}} .ts-btn.form-btn'
	if (attributes.primaryButtonTextColor) {
		cssRules.push(
			`${selector} .ts-btn.form-btn { color: ${attributes.primaryButtonTextColor}; }`
		);
		// SVG icon support
		cssRules.push(
			`${selector} .ts-btn.form-btn svg { fill: ${attributes.primaryButtonTextColor}; }`
		);
	}

	// Primary button background - ts_sf_form_btn_bg
	// Verified: product-form.php:366 - '{{WRAPPER}} .ts-btn.form-btn'
	if (attributes.primaryButtonBackground) {
		cssRules.push(
			`${selector} .ts-btn.form-btn { background-color: ${attributes.primaryButtonBackground}; }`
		);
	}

	// Primary button icon size - ts_sf_form_btn_icon_size
	// Verified: product-form.php:380 - '{{WRAPPER}} .ts-btn.form-btn i'
	if (attributes.primaryButtonIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-btn.form-btn i { font-size: ${attributes.primaryButtonIconSize}px; }`
		);
		// SVG icon support
		cssRules.push(
			`${selector} .ts-btn.form-btn svg { width: ${attributes.primaryButtonIconSize}px; height: ${attributes.primaryButtonIconSize}px; }`
		);
	}

	// Primary button icon color - ts_sf_form_btn_icon_color
	// Verified: product-form.php:401 - '{{WRAPPER}} .ts-btn.form-btn i'
	if (attributes.primaryButtonIconColor) {
		cssRules.push(
			`${selector} .ts-btn.form-btn i { color: ${attributes.primaryButtonIconColor}; }`
		);
		// SVG icon support
		cssRules.push(
			`${selector} .ts-btn.form-btn svg { fill: ${attributes.primaryButtonIconColor}; }`
		);
	}

	// Primary button icon/text spacing - ts_sf_form_btn_icon_margin
	// Verified: product-form.php:414 - '{{WRAPPER}} .ts-btn.form-btn i'
	if (attributes.primaryButtonIconTextSpacing !== undefined) {
		cssRules.push(
			`${selector} .ts-btn.form-btn i { margin-right: ${attributes.primaryButtonIconTextSpacing}px; }`
		);
		cssRules.push(
			`${selector} .ts-btn.form-btn svg { margin-right: ${attributes.primaryButtonIconTextSpacing}px; }`
		);
	}

	// Primary button hover states
	// Verified: product-form.php:440-510

	// Text color hover - ts_sf_form_btn_t_hover
	if (attributes.primaryButtonTextColorHover) {
		cssRules.push(
			`${selector} .ts-btn.form-btn:hover { color: ${attributes.primaryButtonTextColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-btn.form-btn:hover svg { fill: ${attributes.primaryButtonTextColorHover}; }`
		);
	}

	// Background hover - ts_sf_form_btn_bg_hover
	if (attributes.primaryButtonBackgroundHover) {
		cssRules.push(
			`${selector} .ts-btn.form-btn:hover { background-color: ${attributes.primaryButtonBackgroundHover}; }`
		);
	}

	// Border color hover - ts_sf_form_btn_bo_hover
	if (attributes.primaryButtonBorderColorHover) {
		cssRules.push(
			`${selector} .ts-btn.form-btn:hover { border-color: ${attributes.primaryButtonBorderColorHover}; }`
		);
	}

	// Box shadow hover - ts_sf_form_btn_shadow_h
	if (attributes.primaryButtonBoxShadowHover) {
		const shadowCSS = generateBoxShadowCSS(
			attributes.primaryButtonBoxShadowHover
		);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-btn.form-btn:hover { ${shadowCSS} }`);
		}
	}

	// Icon color hover - ts_sf_form_btn_icon_color_h
	if (attributes.primaryButtonIconColorHover) {
		cssRules.push(
			`${selector} .ts-btn.form-btn:hover i { color: ${attributes.primaryButtonIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-btn.form-btn:hover svg { fill: ${attributes.primaryButtonIconColorHover}; }`
		);
	}

	// ============================================
	// SECTION: Price Calculator
	// Source: product-form.php (price calculator controls)
	// ============================================

	// List spacing - affects .ts-cost-calculator li
	if (attributes.priceCalculatorListSpacing !== undefined) {
		cssRules.push(
			`${selector} .ts-cost-calculator li { margin-bottom: ${attributes.priceCalculatorListSpacing}px; }`
		);
	}

	// Typography - .ts-cost-calculator
	if (attributes.priceCalculatorTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.priceCalculatorTypography
		);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-cost-calculator { ${typoCSS} }`);
		}
	}

	// Text color - .ts-cost-calculator
	if (attributes.priceCalculatorTextColor) {
		cssRules.push(
			`${selector} .ts-cost-calculator { color: ${attributes.priceCalculatorTextColor}; }`
		);
	}

	// Total typography - .ts-cost-calculator .ts-total
	if (attributes.priceCalculatorTotalTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.priceCalculatorTotalTypography
		);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-cost-calculator .ts-total { ${typoCSS} }`);
		}
	}

	// Total text color - .ts-cost-calculator .ts-total
	if (attributes.priceCalculatorTotalTextColor) {
		cssRules.push(
			`${selector} .ts-cost-calculator .ts-total { color: ${attributes.priceCalculatorTotalTextColor}; }`
		);
	}

	// ============================================
	// SECTION: Loading / Out of Stock
	// Source: product-form.php:585-710
	// ============================================

	// Loading color 1 - ts_tm_loading
	// Verified: product-form.php:594 - '{{WRAPPER}} .ts-loader::before'
	if (attributes.loadingColor1) {
		cssRules.push(
			`${selector} .ts-loader::before { border-top-color: ${attributes.loadingColor1}; }`
		);
	}

	// Loading color 2 - ts_tm_loading
	if (attributes.loadingColor2) {
		cssRules.push(
			`${selector} .ts-loader::before { border-bottom-color: ${attributes.loadingColor2}; }`
		);
	}

	// Out of stock content gap - ts_nopost_content_Gap
	// Verified: product-form.php:633 - '{{WRAPPER}} .ts-no-posts'
	if (attributes.outOfStockContentGap !== undefined) {
		cssRules.push(
			`${selector} .ts-no-posts { gap: ${attributes.outOfStockContentGap}px; }`
		);
	}

	// Out of stock icon size - ts_nopost_ico_size
	// Verified: product-form.php:652 - '{{WRAPPER}} .ts-no-posts i'
	if (attributes.outOfStockIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-no-posts i { font-size: ${attributes.outOfStockIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-no-posts svg { width: ${attributes.outOfStockIconSize}px; height: ${attributes.outOfStockIconSize}px; }`
		);
	}

	// Out of stock icon color - ts_nopost_ico_col
	// Verified: product-form.php:672 - '{{WRAPPER}} .ts-no-posts i'
	if (attributes.outOfStockIconColor) {
		cssRules.push(
			`${selector} .ts-no-posts i { color: ${attributes.outOfStockIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-no-posts svg { fill: ${attributes.outOfStockIconColor}; }`
		);
	}

	// Out of stock typography - ts_nopost_typo
	// Verified: product-form.php:687 - '{{WRAPPER}} .ts-no-posts p'
	if (attributes.outOfStockTypography) {
		const typoCSS = generateTypographyCSS(attributes.outOfStockTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-no-posts p { ${typoCSS} }`);
		}
	}

	// Out of stock text color - ts_nopost_typo_col
	// Verified: product-form.php:694 - '{{WRAPPER}} .ts-no-posts p'
	if (attributes.outOfStockTextColor) {
		cssRules.push(
			`${selector} .ts-no-posts p { color: ${attributes.outOfStockTextColor}; }`
		);
	}

	// ============================================
	// SECTION: Number Stepper (Normal + Hover)
	// Source: product-form.php:709-869
	// ============================================

	// Stepper input value size
	// Targets the input value display in number steppers
	if (attributes.stepperInputSize !== undefined) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-stepper-number { font-size: ${attributes.stepperInputSize}px; }`
		);
	}

	// Stepper input value color - ts_ns_value
	// Verified: product-form.php:741-752 - '{{WRAPPER}} .ts-input-box'
	if (attributes.stepperInputValueColor) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-stepper-number { color: ${attributes.stepperInputValueColor}; }`
		);
	}

	// Stepper button icon color - ts_stepper_btn_color
	// Verified: product-form.php:748 - '{{WRAPPER}} .ts-stepper-input .ts-icon-btn i'
	if (attributes.stepperButtonIconColor) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn i { color: ${attributes.stepperButtonIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn svg { fill: ${attributes.stepperButtonIconColor}; }`
		);
	}

	// Stepper button background - ts_stepper_btn_bg
	// Verified: product-form.php:765 - '{{WRAPPER}} .ts-stepper-input .ts-icon-btn'
	if (attributes.stepperButtonBackground) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn { background-color: ${attributes.stepperButtonBackground}; }`
		);
	}

	// Stepper button border - ts_stepper_btn_border
	// Verified: product-form.php:780 - '{{WRAPPER}} .ts-stepper-input .ts-icon-btn'
	if (attributes.stepperButtonBorder) {
		const borderCSS = generateBorderCSS(attributes.stepperButtonBorder);
		if (borderCSS) {
			cssRules.push(
				`${selector} .ts-stepper-input .ts-icon-btn { ${borderCSS} }`
			);
		}
	}

	// Stepper button border radius - ts_stepper_btn_radius
	// Verified: product-form.php:787 - '{{WRAPPER}} .ts-stepper-input .ts-icon-btn'
	if (attributes.stepperButtonBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn { border-radius: ${attributes.stepperButtonBorderRadius}px; }`
		);
	}

	// Stepper hover states

	// Button icon color hover - ts_stepper_btn_h
	if (attributes.stepperButtonIconColorHover) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn:hover i { color: ${attributes.stepperButtonIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn:hover svg { fill: ${attributes.stepperButtonIconColorHover}; }`
		);
	}

	// Button background hover - ts_stepper_btn_bg_h
	if (attributes.stepperButtonBackgroundHover) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn:hover { background-color: ${attributes.stepperButtonBackgroundHover}; }`
		);
	}

	// Button border color hover - ts_stepper_border_c_h
	if (attributes.stepperButtonBorderColorHover) {
		cssRules.push(
			`${selector} .ts-stepper-input .ts-icon-btn:hover { border-color: ${attributes.stepperButtonBorderColorHover}; }`
		);
	}

	// ============================================
	// SECTION: Cards (Normal + Selected)
	// Source: product-form.php:869-1149
	// ============================================

	// Cards gap - ts_cards_gap
	// Verified: product-form.php:900 - '{{WRAPPER}} .addon-cards'
	if (attributes.cardsGap !== undefined) {
		cssRules.push(
			`${selector} .addon-cards { gap: ${attributes.cardsGap}px; }`
		);
	}

	// Cards background - ts_cards_bg
	// Verified: product-form.php:919 - '{{WRAPPER}} .addon-cards li'
	if (attributes.cardsBackground) {
		cssRules.push(
			`${selector} .addon-cards li { background-color: ${attributes.cardsBackground}; }`
		);
	}

	// Cards border - ts_cards_border
	// Verified: product-form.php:934 - '{{WRAPPER}} .addon-cards li'
	if (attributes.cardsBorder) {
		const borderCSS = generateBorderCSS(attributes.cardsBorder);
		if (borderCSS) {
			cssRules.push(`${selector} .addon-cards li { ${borderCSS} }`);
		}
	}

	// Cards border radius - ts_cards_radius
	// Verified: product-form.php:941 - '{{WRAPPER}} .addon-cards li'
	if (attributes.cardsBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .addon-cards li { border-radius: ${attributes.cardsBorderRadius}px; }`
		);
	}

	// Cards primary typography - ts_cards_primary
	// Verified: product-form.php:973 - '{{WRAPPER}} .addon-cards li .adc-title'
	if (attributes.cardsPrimaryTypography) {
		const typoCSS = generateTypographyCSS(attributes.cardsPrimaryTypography);
		if (typoCSS) {
			cssRules.push(
				`${selector} .addon-cards li .adc-title { ${typoCSS} }`
			);
		}
	}

	// Cards primary color - ts_cards_pr_c
	// Verified: product-form.php:980 - '{{WRAPPER}} .addon-cards li .adc-title'
	if (attributes.cardsPrimaryColor) {
		cssRules.push(
			`${selector} .addon-cards li .adc-title { color: ${attributes.cardsPrimaryColor}; }`
		);
	}

	// Cards secondary typography - ts_cards_secondary
	// Verified: product-form.php:994 - '{{WRAPPER}} .addon-cards li .adc-subtitle'
	if (attributes.cardsSecondaryTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.cardsSecondaryTypography
		);
		if (typoCSS) {
			cssRules.push(
				`${selector} .addon-cards li .adc-subtitle { ${typoCSS} }`
			);
		}
	}

	// Cards secondary color - ts_cards_sc_c
	// Verified: product-form.php:1001 - '{{WRAPPER}} .addon-cards li .adc-subtitle'
	if (attributes.cardsSecondaryColor) {
		cssRules.push(
			`${selector} .addon-cards li .adc-subtitle { color: ${attributes.cardsSecondaryColor}; }`
		);
	}

	// Cards price typography - ts_cards_price
	// Verified: product-form.php:1015 - '{{WRAPPER}} .addon-cards li .adc-price'
	if (attributes.cardsPriceTypography) {
		const typoCSS = generateTypographyCSS(attributes.cardsPriceTypography);
		if (typoCSS) {
			cssRules.push(
				`${selector} .addon-cards li .adc-price { ${typoCSS} }`
			);
		}
	}

	// Cards price color - ts_cards_price_c
	// Verified: product-form.php:1022 - '{{WRAPPER}} .addon-cards li .adc-price'
	if (attributes.cardsPriceColor) {
		cssRules.push(
			`${selector} .addon-cards li .adc-price { color: ${attributes.cardsPriceColor}; }`
		);
	}

	// Cards image border radius - ts_cards_img_radius
	// Verified: product-form.php:1043 - '{{WRAPPER}} .addon-cards li .addon-cards li img'
	if (attributes.cardsImageBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .addon-cards li .addon-cards li img { border-radius: ${attributes.cardsImageBorderRadius}px; }`
		);
	}

	// Cards image size - ts_card_size
	// Verified: product-form.php:1062 - '{{WRAPPER}} .addon-cards li .addon-cards li img'
	if (attributes.cardsImageSize !== undefined) {
		cssRules.push(
			`${selector} .addon-cards li .addon-cards li img { width: ${attributes.cardsImageSize}px; height: ${attributes.cardsImageSize}px; }`
		);
	}

	// Cards selected state - ts_cards_selected

	// Selected background - ts_cards_bg_selected
	// Verified: product-form.php:1096 - '{{WRAPPER}} .addon-cards li.adc-selected'
	if (attributes.cardsSelectedBackground) {
		cssRules.push(
			`${selector} .addon-cards li.adc-selected { background-color: ${attributes.cardsSelectedBackground}; }`
		);
	}

	// Selected border color - ts_cards_border_s
	// Verified: product-form.php:1109 - '{{WRAPPER}} .addon-cards li.adc-selected'
	if (attributes.cardsSelectedBorderColor) {
		cssRules.push(
			`${selector} .addon-cards li.adc-selected { border-color: ${attributes.cardsSelectedBorderColor}; }`
		);
	}

	// Selected box shadow - ts_cards_shadow_s
	// Verified: product-form.php:1123 - '{{WRAPPER}} .addon-cards li.adc-selected'
	if (attributes.cardsSelectedBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.cardsSelectedBoxShadow);
		if (shadowCSS) {
			cssRules.push(
				`${selector} .addon-cards li.adc-selected { ${shadowCSS} }`
			);
		}
	}

	// Selected primary typography - ts_cards_primary_selected
	// Verified: product-form.php:1132 - '{{WRAPPER}} .addon-cards li.adc-selected .adc-title'
	if (attributes.cardsSelectedPrimaryTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.cardsSelectedPrimaryTypography
		);
		if (typoCSS) {
			cssRules.push(
				`${selector} .addon-cards li.adc-selected .adc-title { ${typoCSS} }`
			);
		}
	}

	// ============================================
	// SECTION: Buttons (Normal + Selected)
	// Source: product-form.php:1149-1315
	// ============================================

	// Buttons gap - ts_buttons_gap
	// Verified: product-form.php:1172 - '{{WRAPPER}} .addon-buttons'
	if (attributes.buttonsGap !== undefined) {
		cssRules.push(
			`${selector} .addon-buttons { gap: ${attributes.buttonsGap}px; }`
		);
	}

	// Buttons background - ts_buttons_bg
	// Verified: product-form.php:1191 - '{{WRAPPER}} .addon-buttons li'
	if (attributes.buttonsBackground) {
		cssRules.push(
			`${selector} .addon-buttons li { background-color: ${attributes.buttonsBackground}; }`
		);
	}

	// Buttons border - ts_buttons_border
	// Verified: product-form.php:1206 - '{{WRAPPER}} .addon-buttons li'
	if (attributes.buttonsBorder) {
		const borderCSS = generateBorderCSS(attributes.buttonsBorder);
		if (borderCSS) {
			cssRules.push(`${selector} .addon-buttons li { ${borderCSS} }`);
		}
	}

	// Buttons border radius - ts_buttons_radius
	// Verified: product-form.php:1213 - '{{WRAPPER}} .addon-buttons li'
	if (attributes.buttonsBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .addon-buttons li { border-radius: ${attributes.buttonsBorderRadius}px; }`
		);
	}

	// Buttons text typography - ts_buttons_primary
	// Verified: product-form.php:1236 - '{{WRAPPER}} .addon-buttons li'
	if (attributes.buttonsTextTypography) {
		const typoCSS = generateTypographyCSS(attributes.buttonsTextTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .addon-buttons li { ${typoCSS} }`);
		}
	}

	// Buttons text color - ts_buttons_pr_c
	// Verified: product-form.php:1243 - '{{WRAPPER}} .addon-buttons li'
	if (attributes.buttonsTextColor) {
		cssRules.push(
			`${selector} .addon-buttons li { color: ${attributes.buttonsTextColor}; }`
		);
	}

	// Buttons selected state - ts_buttons_selected

	// Selected background - ts_buttons_bg_selected
	// Verified: product-form.php:1270 - '{{WRAPPER}} .addon-buttons li.adb-selected'
	if (attributes.buttonsSelectedBackground) {
		cssRules.push(
			`${selector} .addon-buttons li.adb-selected { background-color: ${attributes.buttonsSelectedBackground}; }`
		);
	}

	// Selected border color - ts_buttons_border_s
	// Verified: product-form.php:1283 - '{{WRAPPER}} .addon-buttons li.adb-selected'
	if (attributes.buttonsSelectedBorderColor) {
		cssRules.push(
			`${selector} .addon-buttons li.adb-selected { border-color: ${attributes.buttonsSelectedBorderColor}; }`
		);
	}

	// Selected box shadow - ts_buttons_shadow_s
	// Verified: product-form.php:1297 - '{{WRAPPER}} .addon-buttons li.adb-selected'
	if (attributes.buttonsSelectedBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(
			attributes.buttonsSelectedBoxShadow
		);
		if (shadowCSS) {
			cssRules.push(
				`${selector} .addon-buttons li.adb-selected { ${shadowCSS} }`
			);
		}
	}

	// ============================================
	// SECTION: Dropdown (Normal + Hover + Filled)
	// Source: product-form.php:1315-1520
	// ============================================

	// Dropdown typography - normal state
	if (attributes.dropdownTypography) {
		const typoCSS = generateTypographyCSS(attributes.dropdownTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-filter { ${typoCSS} }`);
		}
	}

	// Dropdown box shadow - normal
	if (attributes.dropdownBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.dropdownBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter { ${shadowCSS} }`);
		}
	}

	// Dropdown background - normal
	if (attributes.dropdownBackground) {
		cssRules.push(
			`${selector} .ts-filter { background-color: ${attributes.dropdownBackground}; }`
		);
	}

	// Dropdown text color - normal
	if (attributes.dropdownTextColor) {
		cssRules.push(
			`${selector} .ts-filter { color: ${attributes.dropdownTextColor}; }`
		);
	}

	// Dropdown border - normal
	if (attributes.dropdownBorder) {
		const borderCSS = generateBorderCSS(attributes.dropdownBorder);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-filter { ${borderCSS} }`);
		}
	}

	// Dropdown border radius - normal
	if (attributes.dropdownBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-filter { border-radius: ${attributes.dropdownBorderRadius}px; }`
		);
	}

	// Dropdown icon color - normal
	if (attributes.dropdownIconColor) {
		cssRules.push(
			`${selector} .ts-filter i { color: ${attributes.dropdownIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-filter svg { fill: ${attributes.dropdownIconColor}; }`
		);
	}

	// Dropdown icon size
	if (attributes.dropdownIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-filter i { font-size: ${attributes.dropdownIconSize}px; }`
		);
		cssRules.push(
			`${selector} .ts-filter svg { width: ${attributes.dropdownIconSize}px; height: ${attributes.dropdownIconSize}px; }`
		);
	}

	// Dropdown icon/text spacing
	if (attributes.dropdownIconTextSpacing !== undefined) {
		cssRules.push(
			`${selector} .ts-filter i { margin-right: ${attributes.dropdownIconTextSpacing}px; }`
		);
		cssRules.push(
			`${selector} .ts-filter svg { margin-right: ${attributes.dropdownIconTextSpacing}px; }`
		);
	}

	// Dropdown chevron visibility
	if (attributes.dropdownHideChevron) {
		cssRules.push(`${selector} .ts-filter .ts-down-icon { display: none; }`);
	}

	// Dropdown chevron color
	if (attributes.dropdownChevronColor) {
		cssRules.push(
			`${selector} .ts-filter .ts-down-icon { color: ${attributes.dropdownChevronColor}; }`
		);
		cssRules.push(
			`${selector} .ts-filter .ts-down-icon svg { fill: ${attributes.dropdownChevronColor}; }`
		);
	}

	// Dropdown hover states

	// Background hover
	if (attributes.dropdownBackgroundHover) {
		cssRules.push(
			`${selector} .ts-filter:hover { background-color: ${attributes.dropdownBackgroundHover}; }`
		);
	}

	// Text color hover
	if (attributes.dropdownTextColorHover) {
		cssRules.push(
			`${selector} .ts-filter:hover { color: ${attributes.dropdownTextColorHover}; }`
		);
	}

	// Border color hover
	if (attributes.dropdownBorderColorHover) {
		cssRules.push(
			`${selector} .ts-filter:hover { border-color: ${attributes.dropdownBorderColorHover}; }`
		);
	}

	// Icon color hover
	if (attributes.dropdownIconColorHover) {
		cssRules.push(
			`${selector} .ts-filter:hover i { color: ${attributes.dropdownIconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-filter:hover svg { fill: ${attributes.dropdownIconColorHover}; }`
		);
	}

	// Box shadow hover
	if (attributes.dropdownBoxShadowHover) {
		const shadowCSS = generateBoxShadowCSS(attributes.dropdownBoxShadowHover);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter:hover { ${shadowCSS} }`);
		}
	}

	// Dropdown filled state (when value selected)

	// Filled typography
	if (attributes.dropdownFilledTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.dropdownFilledTypography
		);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-filter.ts-filled { ${typoCSS} }`);
		}
	}

	// Filled background
	if (attributes.dropdownFilledBackground) {
		cssRules.push(
			`${selector} .ts-filter.ts-filled { background-color: ${attributes.dropdownFilledBackground}; }`
		);
	}

	// Filled text color
	if (attributes.dropdownFilledTextColor) {
		cssRules.push(
			`${selector} .ts-filter.ts-filled { color: ${attributes.dropdownFilledTextColor}; }`
		);
	}

	// Filled icon color
	if (attributes.dropdownFilledIconColor) {
		cssRules.push(
			`${selector} .ts-filter.ts-filled i { color: ${attributes.dropdownFilledIconColor}; }`
		);
		cssRules.push(
			`${selector} .ts-filter.ts-filled svg { fill: ${attributes.dropdownFilledIconColor}; }`
		);
	}

	// Filled border color
	if (attributes.dropdownFilledBorderColor) {
		cssRules.push(
			`${selector} .ts-filter.ts-filled { border-color: ${attributes.dropdownFilledBorderColor}; }`
		);
	}

	// Filled border width
	if (attributes.dropdownFilledBorderWidth !== undefined) {
		cssRules.push(
			`${selector} .ts-filter.ts-filled { border-width: ${attributes.dropdownFilledBorderWidth}px; }`
		);
	}

	// Filled box shadow
	if (attributes.dropdownFilledBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(
			attributes.dropdownFilledBoxShadow
		);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter.ts-filled { ${shadowCSS} }`);
		}
	}

	// ============================================
	// SECTION: Radio/Checkboxes (Normal + Selected)
	// Source: product-form.php (radio/checkbox controls)
	// ============================================

	// Radio/checkbox border color - normal
	if (attributes.radioCheckboxBorderColor) {
		cssRules.push(
			`${selector} .ts-addition-list .addition-body { border-color: ${attributes.radioCheckboxBorderColor}; }`
		);
	}

	// Radio/checkbox text typography - normal
	if (attributes.radioCheckboxTextTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.radioCheckboxTextTypography
		);
		if (typoCSS) {
			cssRules.push(
				`${selector} .ts-addition-list .addition-body { ${typoCSS} }`
			);
		}
	}

	// Radio/checkbox text color - normal
	if (attributes.radioCheckboxTextColor) {
		cssRules.push(
			`${selector} .ts-addition-list .addition-body { color: ${attributes.radioCheckboxTextColor}; }`
		);
	}

	// Radio/checkbox selected state

	// Selected background
	if (attributes.radioCheckboxSelectedBackground) {
		cssRules.push(
			`${selector} .ts-addition-list li.ts-checked .addition-body { background-color: ${attributes.radioCheckboxSelectedBackground}; }`
		);
	}

	// Selected text typography
	if (attributes.radioCheckboxSelectedTextTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.radioCheckboxSelectedTextTypography
		);
		if (typoCSS) {
			cssRules.push(
				`${selector} .ts-addition-list li.ts-checked .addition-body { ${typoCSS} }`
			);
		}
	}

	// Selected text color
	if (attributes.radioCheckboxSelectedTextColor) {
		cssRules.push(
			`${selector} .ts-addition-list li.ts-checked .addition-body { color: ${attributes.radioCheckboxSelectedTextColor}; }`
		);
	}

	// Selected box shadow
	if (attributes.radioCheckboxSelectedBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(
			attributes.radioCheckboxSelectedBoxShadow
		);
		if (shadowCSS) {
			cssRules.push(
				`${selector} .ts-addition-list li.ts-checked .addition-body { ${shadowCSS} }`
			);
		}
	}

	// ============================================
	// SECTION: Switcher
	// Source: product-form.php (switcher controls)
	// ============================================

	// Switcher background inactive
	if (attributes.switcherBackgroundInactive) {
		cssRules.push(
			`${selector} .onoffswitch .onoffswitch-label { background-color: ${attributes.switcherBackgroundInactive}; }`
		);
	}

	// Switcher background active
	if (attributes.switcherBackgroundActive) {
		cssRules.push(
			`${selector} .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label { background-color: ${attributes.switcherBackgroundActive}; }`
		);
	}

	// Switcher handle background
	if (attributes.switcherHandleBackground) {
		cssRules.push(
			`${selector} .onoffswitch .onoffswitch-label:before { background-color: ${attributes.switcherHandleBackground}; }`
		);
	}

	// ============================================
	// SECTION: Images (Normal + Selected)
	// Source: product-form.php (image controls)
	// ============================================

	// Images gap - normal
	if (attributes.imagesGap !== undefined) {
		cssRules.push(
			`${selector} .addon-images { gap: ${attributes.imagesGap}px; }`
		);
	}

	// Images border radius - normal
	if (attributes.imagesBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .addon-images li { border-radius: ${attributes.imagesBorderRadius}px; }`
		);
	}

	// Images selected border color
	if (attributes.imagesSelectedBorderColor) {
		cssRules.push(
			`${selector} .addon-images li.adm-selected { border-color: ${attributes.imagesSelectedBorderColor}; }`
		);
	}

	// ============================================
	// SECTION: Colors
	// Source: product-form.php (color controls)
	// ============================================

	// Colors gap
	if (attributes.colorsGap !== undefined) {
		cssRules.push(
			`${selector} .addon-colors { gap: ${attributes.colorsGap}px; }`
		);
	}

	// Colors size
	if (attributes.colorsSize !== undefined) {
		cssRules.push(
			`${selector} .addon-colors li { width: ${attributes.colorsSize}px; height: ${attributes.colorsSize}px; }`
		);
	}

	// Colors border radius
	if (attributes.colorsBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .addon-colors li { border-radius: ${attributes.colorsBorderRadius}px; }`
		);
	}

	// Colors inset color
	if (attributes.colorsInsetColor) {
		cssRules.push(
			`${selector} .addon-colors li { box-shadow: inset 0 0 0 2px ${attributes.colorsInsetColor}; }`
		);
	}

	// ============================================
	// SECTION: Input and Textarea (Normal + Hover + Active)
	// Source: product-form.php (input/textarea controls)
	// ============================================

	// Input placeholder color - normal
	if (attributes.inputPlaceholderColor) {
		cssRules.push(
			`${selector} input.ts-filter::placeholder, ${selector} textarea.ts-filter::placeholder { color: ${attributes.inputPlaceholderColor}; }`
		);
	}

	// Input placeholder typography - normal
	if (attributes.inputPlaceholderTypography) {
		const typoCSS = generateTypographyCSS(
			attributes.inputPlaceholderTypography
		);
		if (typoCSS) {
			cssRules.push(
				`${selector} input.ts-filter::placeholder, ${selector} textarea.ts-filter::placeholder { ${typoCSS} }`
			);
		}
	}

	// Input value color - normal
	if (attributes.inputValueColor) {
		cssRules.push(
			`${selector} input.ts-filter, ${selector} textarea.ts-filter { color: ${attributes.inputValueColor}; }`
		);
	}

	// Input value typography - normal
	if (attributes.inputValueTypography) {
		const typoCSS = generateTypographyCSS(attributes.inputValueTypography);
		if (typoCSS) {
			cssRules.push(
				`${selector} input.ts-filter, ${selector} textarea.ts-filter { ${typoCSS} }`
			);
		}
	}

	// Input background - normal
	if (attributes.inputBackground) {
		cssRules.push(
			`${selector} input.ts-filter, ${selector} textarea.ts-filter { background-color: ${attributes.inputBackground}; }`
		);
	}

	// Input border - normal
	if (attributes.inputBorder) {
		const borderCSS = generateBorderCSS(attributes.inputBorder);
		if (borderCSS) {
			cssRules.push(
				`${selector} input.ts-filter, ${selector} textarea.ts-filter { ${borderCSS} }`
			);
		}
	}

	// Input border radius - normal
	if (attributes.inputBorderRadius !== undefined) {
		cssRules.push(
			`${selector} input.ts-filter, ${selector} textarea.ts-filter { border-radius: ${attributes.inputBorderRadius}px; }`
		);
	}

	// Input hover states

	// Background hover
	if (attributes.inputBackgroundHover) {
		cssRules.push(
			`${selector} input.ts-filter:hover, ${selector} textarea.ts-filter:hover { background-color: ${attributes.inputBackgroundHover}; }`
		);
	}

	// Border color hover
	if (attributes.inputBorderColorHover) {
		cssRules.push(
			`${selector} input.ts-filter:hover, ${selector} textarea.ts-filter:hover { border-color: ${attributes.inputBorderColorHover}; }`
		);
	}

	// Placeholder color hover
	if (attributes.inputPlaceholderColorHover) {
		cssRules.push(
			`${selector} input.ts-filter:hover::placeholder, ${selector} textarea.ts-filter:hover::placeholder { color: ${attributes.inputPlaceholderColorHover}; }`
		);
	}

	// Text color hover
	if (attributes.inputTextColorHover) {
		cssRules.push(
			`${selector} input.ts-filter:hover, ${selector} textarea.ts-filter:hover { color: ${attributes.inputTextColorHover}; }`
		);
	}

	// Input active states (focus)

	// Background active
	if (attributes.inputBackgroundActive) {
		cssRules.push(
			`${selector} input.ts-filter:focus, ${selector} textarea.ts-filter:focus { background-color: ${attributes.inputBackgroundActive}; }`
		);
	}

	// Border color active
	if (attributes.inputBorderColorActive) {
		cssRules.push(
			`${selector} input.ts-filter:focus, ${selector} textarea.ts-filter:focus { border-color: ${attributes.inputBorderColorActive}; }`
		);
	}

	// Text color active
	if (attributes.inputTextColorActive) {
		cssRules.push(
			`${selector} input.ts-filter:focus, ${selector} textarea.ts-filter:focus { color: ${attributes.inputTextColorActive}; }`
		);
	}

	// ============================================
	// Combine all CSS rules with media queries
	// ============================================

	let finalCSS = '';

	// Desktop rules
	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}

	// Tablet rules (@media max-width: 1024px)
	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	// Mobile rules (@media max-width: 767px)
	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return finalCSS;
}
