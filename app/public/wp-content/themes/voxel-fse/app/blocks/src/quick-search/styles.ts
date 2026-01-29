/**
 * Quick Search Block - Style Generation
 *
 * Generates CSS from Style tab attributes to match Voxel's quick-search widget styling.
 * Two-layer architecture:
 * - Layer 1 (AdvancedTab): Handled by shared utilities (generateAdvancedStyles, generateAdvancedResponsiveCSS)
 * - Layer 2 (Block-specific): Handled here - targets Voxel CSS classes
 *
 * Voxel Source: themes/voxel/app/widgets/quick-search.php
 *
 * @package VoxelFSE
 */

import type { QuickSearchAttributes } from './types';

/**
 * Helper: Generate typography CSS
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

/**
 * Helper: Generate box-shadow CSS
 */
function generateBoxShadowCSS(shadow: any): string {
	if (!shadow || !shadow.enable) return '';
	const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
}

/**
 * Helper: Generate dimensions CSS (padding, margin)
 */
function generateDimensionsCSS(dimensions: any | undefined, property: string): string {
	if (!dimensions) return '';
	const { unit = 'px' } = dimensions;
	// Parse to handle empty strings from DimensionsControl
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Generate responsive CSS targeting Voxel classes within scoped block selector
 *
 * This function handles block-specific styles that target Voxel CSS classes:
 * - .ts-form .ts-filter (search button)
 * - .ts-filter-text (button text)
 * - .ts-shortcut (suffix)
 * - .ts-generic-tabs (popup tabs)
 */
export function generateQuickSearchResponsiveCSS(
	attributes: QuickSearchAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-quick-search-${blockId}`;

	// ============================================
	// SECTION 1: Search Button - Normal State
	// Source: quick-search.php:202-438
	// ============================================

	// Typography - quick-search.php:234-240
	// Selector: '{{WRAPPER}} .ts-form .ts-filter'
	if (attributes.buttonTypography) {
		const typoCSS = generateTypographyCSS(attributes.buttonTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-form .ts-filter { ${typoCSS} }`);
		}
	}

	// Padding - quick-search.php:244-254
	// Selector: '{{WRAPPER}} .ts-form .ts-filter'
	if (attributes.buttonPadding) {
		const paddingCSS = generateDimensionsCSS(attributes.buttonPadding, 'padding');
		if (paddingCSS) {
			cssRules.push(`${selector} .ts-form .ts-filter { ${paddingCSS} }`);
		}
	}
	if (attributes.buttonPadding_tablet) {
		const paddingCSS = generateDimensionsCSS(attributes.buttonPadding_tablet, 'padding');
		if (paddingCSS) {
			tabletRules.push(`${selector} .ts-form .ts-filter { ${paddingCSS} }`);
		}
	}
	if (attributes.buttonPadding_mobile) {
		const paddingCSS = generateDimensionsCSS(attributes.buttonPadding_mobile, 'padding');
		if (paddingCSS) {
			mobileRules.push(`${selector} .ts-form .ts-filter { ${paddingCSS} }`);
		}
	}

	// Height - quick-search.php:256-279
	// Selector: '{{WRAPPER}} .ts-filter'
	if (attributes.buttonHeight !== undefined) {
		cssRules.push(`${selector} .ts-filter { height: ${attributes.buttonHeight}px; }`);
	}
	if (attributes.buttonHeight_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-filter { height: ${attributes.buttonHeight_tablet}px; }`);
	}
	if (attributes.buttonHeight_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-filter { height: ${attributes.buttonHeight_mobile}px; }`);
	}

	// Box Shadow - quick-search.php:284-291
	// Selector: '{{WRAPPER}} .ts-filter'
	if (attributes.buttonBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.buttonBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter { ${shadowCSS} }`);
		}
	}

	// Background Color - quick-search.php:296-306
	// Selector: '{{WRAPPER}} .ts-form .ts-filter'
	if (attributes.buttonBackground) {
		cssRules.push(`${selector} .ts-form .ts-filter { background: ${attributes.buttonBackground}; }`);
	}

	// Text Color - quick-search.php:309-319
	// Selector: '{{WRAPPER}} .ts-form .ts-filter-text'
	if (attributes.buttonTextColor) {
		cssRules.push(`${selector} .ts-form .ts-filter-text { color: ${attributes.buttonTextColor}; }`);
	}

	// Border - quick-search.php:321-328
	// Using BorderGroupControl pattern (type, width, color)
	if (attributes.buttonBorderType && attributes.buttonBorderType !== 'none') {
		const borderType = attributes.buttonBorderType;
		const borderWidth = attributes.buttonBorderWidth || 1;
		const borderColor = attributes.buttonBorderColor || '#000000';
		cssRules.push(`${selector} .ts-filter { border-style: ${borderType}; border-width: ${borderWidth}px; border-color: ${borderColor}; }`);
	}

	// Border Radius - quick-search.php:333-358
	// Selector: '{{WRAPPER}} .ts-form .ts-filter'
	if (attributes.buttonBorderRadius !== undefined) {
		cssRules.push(`${selector} .ts-form .ts-filter { border-radius: ${attributes.buttonBorderRadius}px; }`);
	}
	if (attributes.buttonBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form .ts-filter { border-radius: ${attributes.buttonBorderRadius_tablet}px; }`);
	}
	if (attributes.buttonBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form .ts-filter { border-radius: ${attributes.buttonBorderRadius_mobile}px; }`);
	}

	// Icon Color - quick-search.php:374-385
	// Selector: '{{WRAPPER}} .ts-filter i' and '{{WRAPPER}} .ts-filter svg'
	if (attributes.buttonIconColor) {
		cssRules.push(`${selector} .ts-filter i { color: ${attributes.buttonIconColor}; }`);
		cssRules.push(`${selector} .ts-filter svg { fill: ${attributes.buttonIconColor}; }`);
	}

	// Icon Size - quick-search.php:387-413
	// Selector: '{{WRAPPER}} .ts-filter i' and '{{WRAPPER}} .ts-filter svg'
	if (attributes.buttonIconSize !== undefined) {
		cssRules.push(`${selector} .ts-filter i { font-size: ${attributes.buttonIconSize}px; }`);
		cssRules.push(`${selector} .ts-filter svg { min-width: ${attributes.buttonIconSize}px; width: ${attributes.buttonIconSize}px; height: ${attributes.buttonIconSize}px; }`);
	}
	if (attributes.buttonIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-filter i { font-size: ${attributes.buttonIconSize_tablet}px; }`);
		tabletRules.push(`${selector} .ts-filter svg { min-width: ${attributes.buttonIconSize_tablet}px; width: ${attributes.buttonIconSize_tablet}px; height: ${attributes.buttonIconSize_tablet}px; }`);
	}
	if (attributes.buttonIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-filter i { font-size: ${attributes.buttonIconSize_mobile}px; }`);
		mobileRules.push(`${selector} .ts-filter svg { min-width: ${attributes.buttonIconSize_mobile}px; width: ${attributes.buttonIconSize_mobile}px; height: ${attributes.buttonIconSize_mobile}px; }`);
	}

	// Icon/Text Spacing - quick-search.php:415-436
	// Selector: '{{WRAPPER}} .ts-filter'
	if (attributes.buttonIconSpacing !== undefined) {
		cssRules.push(`${selector} .ts-filter { grid-gap: ${attributes.buttonIconSpacing}px; }`);
	}
	if (attributes.buttonIconSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-filter { grid-gap: ${attributes.buttonIconSpacing_tablet}px; }`);
	}
	if (attributes.buttonIconSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-filter { grid-gap: ${attributes.buttonIconSpacing_mobile}px; }`);
	}

	// ============================================
	// SECTION 2: Search Button - Hover State
	// Source: quick-search.php:442-518
	// ============================================

	// Background Color (Hover) - quick-search.php:460-470
	// Selector: '{{WRAPPER}} .ts-form .ts-filter:hover'
	if (attributes.buttonBackgroundHover) {
		cssRules.push(`${selector} .ts-form .ts-filter:hover { background: ${attributes.buttonBackgroundHover}; }`);
	}

	// Text Color (Hover) - quick-search.php:472-482
	// Selector: '{{WRAPPER}} .ts-form .ts-filter:hover .ts-filter-text'
	if (attributes.buttonTextColorHover) {
		cssRules.push(`${selector} .ts-form .ts-filter:hover .ts-filter-text { color: ${attributes.buttonTextColorHover}; }`);
	}

	// Border Color (Hover) - quick-search.php:484-494
	// Selector: '{{WRAPPER}} .ts-form .ts-filter:hover'
	if (attributes.buttonBorderColorHover) {
		cssRules.push(`${selector} .ts-form .ts-filter:hover { border-color: ${attributes.buttonBorderColorHover}; }`);
	}

	// Icon Color (Hover) - quick-search.php:496-507
	// Selector: '{{WRAPPER}} .ts-filter:hover i' and '{{WRAPPER}} .ts-filter:hover svg'
	if (attributes.buttonIconColorHover) {
		cssRules.push(`${selector} .ts-filter:hover i { color: ${attributes.buttonIconColorHover}; }`);
		cssRules.push(`${selector} .ts-filter:hover svg { fill: ${attributes.buttonIconColorHover}; }`);
	}

	// Box Shadow (Hover) - quick-search.php:509-516
	// Selector: '{{WRAPPER}} .ts-filter:hover'
	if (attributes.buttonBoxShadowHover) {
		const shadowCSS = generateBoxShadowCSS(attributes.buttonBoxShadowHover);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter:hover { ${shadowCSS} }`);
		}
	}

	// ============================================
	// SECTION 3: Search Button - Filled State
	// Source: quick-search.php:520-629
	// Note: .ts-filled class is applied when input has value
	// ============================================

	// Typography (Filled) - quick-search.php:536-542
	// Selector: '{{WRAPPER}} .ts-form .ts-filter.ts-filled'
	if (attributes.buttonTypographyFilled) {
		const typoCSS = generateTypographyCSS(attributes.buttonTypographyFilled);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-form .ts-filter.ts-filled { ${typoCSS} }`);
		}
	}

	// Background Color (Filled) - quick-search.php:545-555
	// Selector: '{{WRAPPER}} .ts-form .ts-filter.ts-filled'
	if (attributes.buttonBackgroundFilled) {
		cssRules.push(`${selector} .ts-form .ts-filter.ts-filled { background: ${attributes.buttonBackgroundFilled}; }`);
	}

	// Text Color (Filled) - quick-search.php:557-567
	// Selector: '{{WRAPPER}} .ts-form .ts-filter.ts-filled .ts-filter-text'
	if (attributes.buttonTextColorFilled) {
		cssRules.push(`${selector} .ts-form .ts-filter.ts-filled .ts-filter-text { color: ${attributes.buttonTextColorFilled}; }`);
	}

	// Icon Color (Filled) - quick-search.php:569-580
	// Selector: '{{WRAPPER}} .ts-filter.ts-filled i' and '{{WRAPPER}} .ts-filter.ts-filled svg'
	if (attributes.buttonIconColorFilled) {
		cssRules.push(`${selector} .ts-filter.ts-filled i { color: ${attributes.buttonIconColorFilled}; }`);
		cssRules.push(`${selector} .ts-filter.ts-filled svg { fill: ${attributes.buttonIconColorFilled}; }`);
	}

	// Border Color (Filled) - quick-search.php:582-592
	// Selector: '{{WRAPPER}} .ts-form .ts-filter.ts-filled'
	if (attributes.buttonBorderColorFilled) {
		cssRules.push(`${selector} .ts-form .ts-filter.ts-filled { border-color: ${attributes.buttonBorderColorFilled}; }`);
	}

	// Border Width (Filled) - quick-search.php:594-617
	// Selector: '{{WRAPPER}} .ts-form .ts-filter.ts-filled'
	if (attributes.buttonBorderWidthFilled !== undefined) {
		cssRules.push(`${selector} .ts-form .ts-filter.ts-filled { border-width: ${attributes.buttonBorderWidthFilled}px; }`);
	}

	// Box Shadow (Filled) - quick-search.php:619-626
	// Selector: '{{WRAPPER}} .ts-filter.ts-filled'
	if (attributes.buttonBoxShadowFilled) {
		const shadowCSS = generateBoxShadowCSS(attributes.buttonBoxShadowFilled);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-filter.ts-filled { ${shadowCSS} }`);
		}
	}

	// ============================================
	// SECTION 4: Button Suffix
	// Source: quick-search.php:635-749
	// ============================================

	// Hide Suffix - quick-search.php:643-653
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixHide) {
		cssRules.push(`${selector} .ts-shortcut { display: none !important; }`);
	}
	if (attributes.suffixHide_tablet) {
		tabletRules.push(`${selector} .ts-shortcut { display: none !important; }`);
	}
	if (attributes.suffixHide_mobile) {
		mobileRules.push(`${selector} .ts-shortcut { display: none !important; }`);
	}

	// Padding - quick-search.php:654-664
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixPadding) {
		const paddingCSS = generateDimensionsCSS(attributes.suffixPadding, 'padding');
		if (paddingCSS) {
			cssRules.push(`${selector} .ts-shortcut { ${paddingCSS} }`);
		}
	}
	if (attributes.suffixPadding_tablet) {
		const paddingCSS = generateDimensionsCSS(attributes.suffixPadding_tablet, 'padding');
		if (paddingCSS) {
			tabletRules.push(`${selector} .ts-shortcut { ${paddingCSS} }`);
		}
	}
	if (attributes.suffixPadding_mobile) {
		const paddingCSS = generateDimensionsCSS(attributes.suffixPadding_mobile, 'padding');
		if (paddingCSS) {
			mobileRules.push(`${selector} .ts-shortcut { ${paddingCSS} }`);
		}
	}

	// Typography - quick-search.php:666-673
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixTypography) {
		const typoCSS = generateTypographyCSS(attributes.suffixTypography);
		if (typoCSS) {
			cssRules.push(`${selector} .ts-shortcut { ${typoCSS} }`);
		}
	}

	// Text Color - quick-search.php:675-685
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixTextColor) {
		cssRules.push(`${selector} .ts-shortcut { color: ${attributes.suffixTextColor}; }`);
	}
	if (attributes.suffixTextColor_tablet) {
		tabletRules.push(`${selector} .ts-shortcut { color: ${attributes.suffixTextColor_tablet}; }`);
	}
	if (attributes.suffixTextColor_mobile) {
		mobileRules.push(`${selector} .ts-shortcut { color: ${attributes.suffixTextColor_mobile}; }`);
	}

	// Background Color - quick-search.php:688-698
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixBackground) {
		cssRules.push(`${selector} .ts-shortcut { background: ${attributes.suffixBackground}; }`);
	}
	if (attributes.suffixBackground_tablet) {
		tabletRules.push(`${selector} .ts-shortcut { background: ${attributes.suffixBackground_tablet}; }`);
	}
	if (attributes.suffixBackground_mobile) {
		mobileRules.push(`${selector} .ts-shortcut { background: ${attributes.suffixBackground_mobile}; }`);
	}

	// Border Radius - quick-search.php:700-721
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixBorderRadius !== undefined) {
		cssRules.push(`${selector} .ts-shortcut { border-radius: ${attributes.suffixBorderRadius}px; }`);
	}
	if (attributes.suffixBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-shortcut { border-radius: ${attributes.suffixBorderRadius_tablet}px; }`);
	}
	if (attributes.suffixBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-shortcut { border-radius: ${attributes.suffixBorderRadius_mobile}px; }`);
	}

	// Box Shadow - quick-search.php:723-730
	// Selector: '{{WRAPPER}} .ts-shortcut'
	if (attributes.suffixBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.suffixBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${selector} .ts-shortcut { ${shadowCSS} }`);
		}
	}

	// Side Margin - quick-search.php:732-749
	// Selector: '{{WRAPPER}} .ts-shortcut' (uses 'right' for positioning)
	if (attributes.suffixMargin !== undefined) {
		cssRules.push(`${selector} .ts-shortcut { right: ${attributes.suffixMargin}px; }`);
	}
	if (attributes.suffixMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-shortcut { right: ${attributes.suffixMargin_tablet}px; }`);
	}
	if (attributes.suffixMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-shortcut { right: ${attributes.suffixMargin_mobile}px; }`);
	}

	// ============================================
	// SECTION 5: Popup Tabs
	// Source: quick-search.php:754-927
	// ============================================

	// Justify - quick-search.php:776-794
	// Selector: '{{WRAPPER}} .ts-generic-tabs'
	if (attributes.tabsJustify) {
		cssRules.push(`${selector} .ts-generic-tabs { justify-content: ${attributes.tabsJustify}; }`);
	}

	// Padding - quick-search.php:796-806
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsPadding) {
		const paddingCSS = generateDimensionsCSS(attributes.tabsPadding, 'padding');
		if (paddingCSS) {
			cssRules.push(`${selector} .ts-generic-tabs li a { ${paddingCSS} }`);
		}
	}

	// Margin - quick-search.php:808-818
	// Selector: '{{WRAPPER}} .ts-generic-tabs li'
	if (attributes.tabsMargin) {
		const marginCSS = generateDimensionsCSS(attributes.tabsMargin, 'margin');
		if (marginCSS) {
			cssRules.push(`${selector} .ts-generic-tabs li { ${marginCSS} }`);
		}
	}

	// Text Color - quick-search.php:839-849
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsTextColor) {
		cssRules.push(`${selector} .ts-generic-tabs li a { color: ${attributes.tabsTextColor}; }`);
	}

	// Active Text Color - quick-search.php (inferred from pattern)
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabsActiveTextColor) {
		cssRules.push(`${selector} .ts-generic-tabs li.ts-tab-active a { color: ${attributes.tabsActiveTextColor}; }`);
	}

	// Border Color - quick-search.php (inferred from pattern)
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsBorderColor) {
		cssRules.push(`${selector} .ts-generic-tabs li a { border-color: ${attributes.tabsBorderColor}; }`);
	}

	// Active Border Color
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabsActiveBorderColor) {
		cssRules.push(`${selector} .ts-generic-tabs li.ts-tab-active a { border-color: ${attributes.tabsActiveBorderColor}; }`);
	}

	// Background
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsBackground) {
		cssRules.push(`${selector} .ts-generic-tabs li a { background: ${attributes.tabsBackground}; }`);
	}

	// Active Background
	// Selector: '{{WRAPPER}} .ts-generic-tabs li.ts-tab-active a'
	if (attributes.tabsActiveBackground) {
		cssRules.push(`${selector} .ts-generic-tabs li.ts-tab-active a { background: ${attributes.tabsActiveBackground}; }`);
	}

	// Border Radius (inferred from pattern)
	// Selector: '{{WRAPPER}} .ts-generic-tabs li a'
	if (attributes.tabsBorderRadius !== undefined) {
		cssRules.push(`${selector} .ts-generic-tabs li a { border-radius: ${attributes.tabsBorderRadius}px; }`);
	}

	// Hover State
	if (attributes.tabsTextColorHover) {
		cssRules.push(`${selector} .ts-generic-tabs li a:hover { color: ${attributes.tabsTextColorHover}; }`);
	}
	if (attributes.tabsBorderColorHover) {
		cssRules.push(`${selector} .ts-generic-tabs li a:hover { border-color: ${attributes.tabsBorderColorHover}; }`);
	}
	if (attributes.tabsBackgroundHover) {
		cssRules.push(`${selector} .ts-generic-tabs li a:hover { background: ${attributes.tabsBackgroundHover}; }`);
	}

	// ============================================
	// SECTION 6: Popup Custom Style
	// Source: quick-search.php:1050-1195
	// NOTE: Quick-search popup uses .ts-quicksearch-popup (not .ts-field-popup)
	// Structure differs from standard Voxel field popups
	// ============================================

	if (attributes.popupCustomEnable) {
		// 1. Backdrop background - quick-search.php:1056
		// Voxel: {{WRAPPER}}-wrap > div:after
		// FSE: Create ::after pseudo-element on .ts-popup-overlay for backdrop
		if (attributes.popupBackdropBackground) {
			cssRules.push(`${selector} .ts-popup-overlay::after { content: ''; position: absolute; inset: 0; background-color: ${attributes.popupBackdropBackground} !important; z-index: -1; }`);
		}

		// 2. Pointer events for backdrop - quick-search.php:1068
		// Voxel: {{WRAPPER}}-wrap > div:after (pointer-events: all)
		if (attributes.popupPointerEvents) {
			cssRules.push(`${selector} .ts-popup-overlay::after { pointer-events: all; }`);
		}

		// 3. Center position - quick-search.php:1082-1084
		// Voxel: {{WRAPPER}}-wrap position: fixed
		// FSE: Center the entire popup overlay
		if (attributes.popupCenterPosition) {
			cssRules.push(`${selector} .ts-popup-overlay { position: fixed !important; top: 50%; left: 50%; transform: translate(-50%, -50%); }`);
		}

		// 4. Box Shadow - quick-search.php:1096
		// Voxel: {{WRAPPER}} .ts-field-popup
		// FSE: .ts-quicksearch-popup
		if (attributes.popupBoxShadow) {
			const shadow = generateBoxShadowCSS(attributes.popupBoxShadow);
			if (shadow) {
				cssRules.push(`${selector} .ts-quicksearch-popup { ${shadow} }`);
			}
		}

		// 5. Border - quick-search.php:1106
		// Voxel: {{WRAPPER}} .ts-field-popup
		// FSE: .ts-quicksearch-popup
		if (attributes.popupBorder && attributes.popupBorder.borderType && attributes.popupBorder.borderType !== 'none') {
			const border = attributes.popupBorder;
			const borderType = border.borderType;
			const borderWidth = border.borderWidth || { top: 1, right: 1, bottom: 1, left: 1 };
			const borderColor = border.borderColor || '#000000';
			const top = parseFloat(String(borderWidth.top)) || 0;
			const right = parseFloat(String(borderWidth.right)) || 0;
			const bottom = parseFloat(String(borderWidth.bottom)) || 0;
			const left = parseFloat(String(borderWidth.left)) || 0;
			cssRules.push(`${selector} .ts-quicksearch-popup { border-style: ${borderType}; border-width: ${top}px ${right}px ${bottom}px ${left}px; border-color: ${borderColor}; }`);
		}

		// 6. Top/Bottom margin - quick-search.php:1127
		// Voxel: {{WRAPPER}} .ts-field-popup-container (margin: {{SIZE}}{{UNIT}} 0)
		// FSE: .ts-quicksearch-popup (direct, no container)
		if (attributes.popupTopBottomMargin !== undefined) {
			cssRules.push(`${selector} .ts-quicksearch-popup { margin-top: ${attributes.popupTopBottomMargin}px; margin-bottom: ${attributes.popupTopBottomMargin}px; }`);
		}
		if (attributes.popupTopBottomMargin_tablet !== undefined) {
			tabletRules.push(`${selector} .ts-quicksearch-popup { margin-top: ${attributes.popupTopBottomMargin_tablet}px; margin-bottom: ${attributes.popupTopBottomMargin_tablet}px; }`);
		}
		if (attributes.popupTopBottomMargin_mobile !== undefined) {
			mobileRules.push(`${selector} .ts-quicksearch-popup { margin-top: ${attributes.popupTopBottomMargin_mobile}px; margin-bottom: ${attributes.popupTopBottomMargin_mobile}px; }`);
		}

		// 7. Min width - quick-search.php:1148
		// Voxel: {{WRAPPER}} .ts-field-popup
		// FSE: .ts-quicksearch-popup
		if (attributes.popupMinWidth !== undefined) {
			cssRules.push(`${selector} .ts-quicksearch-popup { min-width: ${attributes.popupMinWidth}px; }`);
		}
		if (attributes.popupMinWidth_tablet !== undefined) {
			tabletRules.push(`${selector} .ts-quicksearch-popup { min-width: ${attributes.popupMinWidth_tablet}px; }`);
		}
		if (attributes.popupMinWidth_mobile !== undefined) {
			mobileRules.push(`${selector} .ts-quicksearch-popup { min-width: ${attributes.popupMinWidth_mobile}px; }`);
		}

		// 8. Max width - quick-search.php:1169
		// Voxel: {{WRAPPER}} .ts-field-popup
		// FSE: .ts-quicksearch-popup
		if (attributes.popupMaxWidth !== undefined) {
			cssRules.push(`${selector} .ts-quicksearch-popup { max-width: ${attributes.popupMaxWidth}px; }`);
		}
		if (attributes.popupMaxWidth_tablet !== undefined) {
			tabletRules.push(`${selector} .ts-quicksearch-popup { max-width: ${attributes.popupMaxWidth_tablet}px; }`);
		}
		if (attributes.popupMaxWidth_mobile !== undefined) {
			mobileRules.push(`${selector} .ts-quicksearch-popup { max-width: ${attributes.popupMaxWidth_mobile}px; }`);
		}

		// 9. Max height - quick-search.php:1192
		// Voxel: {{WRAPPER}} .ts-popup-content-wrapper
		// FSE: .ts-quicksearch-popup (no separate wrapper, apply directly)
		if (attributes.popupMaxHeight !== undefined) {
			cssRules.push(`${selector} .ts-quicksearch-popup { max-height: ${attributes.popupMaxHeight}px; overflow-y: auto; }`);
		}
		if (attributes.popupMaxHeight_tablet !== undefined) {
			tabletRules.push(`${selector} .ts-quicksearch-popup { max-height: ${attributes.popupMaxHeight_tablet}px; }`);
		}
		if (attributes.popupMaxHeight_mobile !== undefined) {
			mobileRules.push(`${selector} .ts-quicksearch-popup { max-height: ${attributes.popupMaxHeight_mobile}px; }`);
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
