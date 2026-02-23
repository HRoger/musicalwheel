/**
 * Search Form Block - Style Generation
 *
 * Generates CSS from Inline Tab inspector controls.
 * Targets Voxel CSS classes within a scoped block selector.
 *
 * @package VoxelFSE
 */

import type { SearchFormAttributes } from './types';

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

/**
 * Safely parse a numeric value from a string that might already contain a unit
 * e.g. "10px" -> "10", "15" -> "15", undefined -> "0"
 */
function safeValue(value: string | number | undefined): string {
	if (value === undefined || value === null || value === '') return '0';
	const str = String(value);
	const match = str.match(/^([\d.]+)/);
	return match ? match[1] : '0';
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
 * BorderGroupControl value interface
 */
interface BorderGroupValue {
	borderType?: string;
	borderWidth?: { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number; unit?: string };
	borderColor?: string;
	borderRadius?: { top?: string | number; right?: string | number; bottom?: string | number; left?: string | number; unit?: string };
}

/**
 * Generate border CSS from config
 * 
 * Handles two formats:
 * 1. Legacy format: { width: 1, style: 'solid', color: '#000' }
 * 2. BorderGroupControl format: { borderType: 'solid', borderWidth: {...}, borderColor: '...' }
 */
function generateBorderCSS(border: BorderConfig | BorderGroupValue | undefined): string {
	if (!border || Object.keys(border).length === 0) return '';

	// Check if it's BorderGroupControl format
	if ('borderType' in border) {
		const { borderType, borderWidth, borderColor } = border as BorderGroupValue;

		// If no border type or 'none', return empty
		if (!borderType || borderType === 'none' || borderType === '') return '';

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

			// Check if all widths are effectively zero or empty
			// If so, return empty string to avoid overriding default styles with "0px" or "1px" defaults
			const isZero = (v: string | number | undefined) => !v || v === '0' || v === 0 || v === '';
			if (
				isZero(borderWidth.top) &&
				isZero(borderWidth.right) &&
				isZero(borderWidth.bottom) &&
				isZero(borderWidth.left)
			) {
				return '';
			}

			// If all same, use single value; otherwise use 4-value shorthand
			if (topW === rightW && rightW === bottomW && bottomW === leftW) {
				widthValue = `${topW}${unit}`;
			} else {
				widthValue = `${topW}${unit} ${rightW}${unit} ${bottomW}${unit} ${leftW}${unit}`;
			}
		} else {
			// No borderWidth object provided - avoid default 1px override
			return '';
		}

		const colorValue = borderColor || '#000';
		return `${widthValue} ${borderType} ${colorValue}`;
	}

	// Legacy format
	const { width = 1, style = 'solid', color = '#000' } = border as BorderConfig;
	return `${width}px ${style} ${color}`;
}

/**
 * Generate block styles for inline styles (minimal - most styling via CSS)
 */
export function generateBlockStyles(_attributes: SearchFormAttributes): React.CSSProperties {
	// Search Form uses scoped CSS targeting Voxel classes, not inline styles
	return {};
}

/**
 * Generate dimensions CSS from config
 * 
 * Handles two formats:
 * 1. DimensionsControl format: { top: '10px', right: '5%', ... } - strings with embedded units
 * 2. Legacy format: { top: 10, right: 5, unit: 'px', ... } - numbers with separate unit
 */
function generateDimensionsCSS(
	dimensions: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string; unit?: string } | undefined,
	property: string
): string {
	if (!dimensions) return '';

	// Check if there are any actual dimension values set (not just the unit property)
	// Empty objects {} AND objects with empty strings {top: "", right: "", ...} should not generate CSS
	// A value is considered "set" if it's not undefined, null, or empty string
	const isSet = (val: number | string | undefined): boolean =>
		val !== undefined && val !== null && val !== '';
	const hasValues = isSet(dimensions.top) || isSet(dimensions.right) ||
		isSet(dimensions.bottom) || isSet(dimensions.left);
	if (!hasValues) return '';

	// Helper to parse a value that might be "10px" or just 10
	const parseValue = (val: number | string | undefined, defaultUnit: string): string => {
		if (val === undefined || val === null || val === '') return `0${defaultUnit}`;

		// If it's a string, check if it already has a unit
		if (typeof val === 'string') {
			const match = val.match(/^([\d.]+)(px|%|em|rem|vw|vh)?$/);
			if (match) {
				const num = parseFloat(match[1]);
				const unit = match[2] || defaultUnit;
				return `${num}${unit}`;
			}
			// Try parsing as number
			const num = parseFloat(val);
			if (!isNaN(num)) {
				return `${num}${defaultUnit}`;
			}
			return `0${defaultUnit}`;
		}

		// It's a number
		return `${val}${defaultUnit}`;
	};

	// Use the separate unit property if no embedded units, default to px
	const defaultUnit = dimensions.unit || 'px';

	const topVal = parseValue(dimensions.top, defaultUnit);
	const rightVal = parseValue(dimensions.right, defaultUnit);
	const bottomVal = parseValue(dimensions.bottom, defaultUnit);
	const leftVal = parseValue(dimensions.left, defaultUnit);

	return `${property}: ${topVal} ${rightVal} ${bottomVal} ${leftVal};`;
}

/**
 * Generate Inline Tab responsive CSS
 *
 * Creates CSS rules targeting Voxel's CSS classes within a scoped block selector.
 * Supports desktop, tablet, and mobile breakpoints.
 */
export function generateInlineTabResponsiveCSS(
	attributes: SearchFormAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];

	// Use :is() to target either the class (frontend) or data attribute (editor) for robustness
	const selector = `:is(.voxel-fse-search-form-${blockId}, [data-voxel-id="${blockId}"])`;

	// CRITICAL: Popup selector for portal elements rendered at document.body level
	// FieldPopup uses createPortal(..., document.body), so block-scoped selectors cannot reach them.
	// Instead, we target popups via the class added to their wrapper: voxel-popup-{blockId}
	// Evidence: FieldPopup.tsx accepts className prop applied to outer .vx-popup wrapper
	const popupSelector = `.voxel-popup-${blockId}`;

	// ============================================
	// CONTENT TAB - Post type filter width
	// Source: search-form.php:63-79
	// ============================================

	// Post type filter width - ts_post_type_width
	if (attributes.postTypeFilterWidth !== undefined) {
		cssRules.push(`${selector} .choose-cpt-filter { width: ${safeValue(attributes.postTypeFilterWidth)}%; }`);
	}
	if (attributes.postTypeFilterWidth_tablet !== undefined) {
		tabletRules.push(`${selector} .choose-cpt-filter { width: ${safeValue(attributes.postTypeFilterWidth_tablet)}%; }`);
	}
	if (attributes.postTypeFilterWidth_mobile !== undefined) {
		mobileRules.push(`${selector} .choose-cpt-filter { width: ${safeValue(attributes.postTypeFilterWidth_mobile)}%; }`);
	}

	// ============================================
	// CONTENT TAB - Search button width
	// Source: search-form.php:509-523
	// Selector: {{WRAPPER}} .ts-form-group.ts-form-submit
	// ============================================
	if (attributes.searchButtonWidth !== undefined) {
		const unit = attributes.searchButtonWidthUnit || '%';
		cssRules.push(`${selector} .ts-form-group.ts-form-submit { width: ${safeValue(attributes.searchButtonWidth)}${unit}; }`);
	}
	if (attributes.searchButtonWidth_tablet !== undefined) {
		const unit = attributes.searchButtonWidthUnit || '%';
		tabletRules.push(`${selector} .ts-form-group.ts-form-submit { width: ${safeValue(attributes.searchButtonWidth_tablet)}${unit}; }`);
	}
	if (attributes.searchButtonWidth_mobile !== undefined) {
		const unit = attributes.searchButtonWidthUnit || '%';
		mobileRules.push(`${selector} .ts-form-group.ts-form-submit { width: ${safeValue(attributes.searchButtonWidth_mobile)}${unit}; }`);
	}

	// ============================================
	// CONTENT TAB - Reset button width
	// Source: search-form.php:558-570
	// Selector: {{WRAPPER}} .ts-form-reset
	// ============================================
	if (attributes.resetButtonWidth !== undefined) {
		const unit = attributes.resetButtonWidthUnit || '%';
		cssRules.push(`${selector} .ts-form-reset { width: ${safeValue(attributes.resetButtonWidth)}${unit}; }`);
	}
	if (attributes.resetButtonWidth_tablet !== undefined) {
		const unit = attributes.resetButtonWidthUnit || '%';
		tabletRules.push(`${selector} .ts-form-reset { width: ${safeValue(attributes.resetButtonWidth_tablet)}${unit}; }`);
	}
	if (attributes.resetButtonWidth_mobile !== undefined) {
		const unit = attributes.resetButtonWidthUnit || '%';
		mobileRules.push(`${selector} .ts-form-reset { width: ${safeValue(attributes.resetButtonWidth_mobile)}${unit}; }`);
	}

	// ============================================
	// GENERAL TAB - Section 1: General
	// Source: search-form.php:912-974
	// ============================================

	// Filter Margin - ts_sf_form_group_padding
	// Note: Despite name "Filter Margin", Voxel uses padding property
	// Selector: .ts-filter-wrapper > .ts-form-group (direct child for higher specificity)
	// Source: search-form.php:920-930
	if (attributes.filterMargin) {
		const padding = generateDimensionsCSS(attributes.filterMargin, 'padding');
		if (padding) {
			cssRules.push(`${selector} .ts-filter-wrapper > .ts-form-group { ${padding} }`);
		}
	}
	if (attributes.filterMargin_tablet) {
		const padding = generateDimensionsCSS(attributes.filterMargin_tablet, 'padding');
		if (padding) {
			tabletRules.push(`${selector} .ts-filter-wrapper > .ts-form-group { ${padding} }`);
		}
	}
	if (attributes.filterMargin_mobile) {
		const padding = generateDimensionsCSS(attributes.filterMargin_mobile, 'padding');
		if (padding) {
			mobileRules.push(`${selector} .ts-filter-wrapper > .ts-form-group { ${padding} }`);
		}
	}

	// Show labels - ts_sf_input_label
	// When showLabels is false, hide all filter labels
	if (attributes.showLabels === false) {
		cssRules.push(`${selector} .ts-form-group > label:not(.ts-keep-visible) { display: none; }`);
	}

	// Label color - ts_sf_input_label_col
	if (attributes.labelColor) {
		cssRules.push(`${selector} .ts-form-group > label { color: ${attributes.labelColor}; }`);
	}

	// Label typography - ts_sf_input_label_text
	if (attributes.labelTypography) {
		const typo = generateTypographyCSS(attributes.labelTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-form-group > label { ${typo} }`);
		}
	}

	// ============================================
	// GENERAL TAB - Section 2: Common Styles
	// Source: search-form.php:978-1266
	// ============================================

	// Height - ts_sf_input_height
	if (attributes.commonHeight !== undefined) {
		const val = safeValue(attributes.commonHeight);
		cssRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { min-height: ${val}px; }`);
	}
	if (attributes.commonHeight_tablet !== undefined) {
		const val = safeValue(attributes.commonHeight_tablet);
		tabletRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { min-height: ${val}px; }`);
	}
	if (attributes.commonHeight_mobile !== undefined) {
		const val = safeValue(attributes.commonHeight_mobile);
		mobileRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { min-height: ${val}px; }`);
	}

	// Icon size - ts_sf_input_icon_size
	// Filter icons are direct <span> children containing SVGs
	if (attributes.commonIconSize !== undefined) {
		const size = safeValue(attributes.commonIconSize);
		cssRules.push(`${selector} .ts-form-group .ts-filter > span svg { width: ${size}px; height: ${size}px; }`);
	}
	if (attributes.commonIconSize_tablet !== undefined) {
		const size = safeValue(attributes.commonIconSize_tablet);
		tabletRules.push(`${selector} .ts-form-group .ts-filter > span svg { width: ${size}px; height: ${size}px; }`);
	}
	if (attributes.commonIconSize_mobile !== undefined) {
		const size = safeValue(attributes.commonIconSize_mobile);
		mobileRules.push(`${selector} .ts-form-group .ts-filter > span svg { width: ${size}px; height: ${size}px; }`);
	}

	// Border radius - ts_sf_input_radius
	if (attributes.commonBorderRadius !== undefined) {
		const unit = attributes.commonBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { border-radius: ${safeValue(attributes.commonBorderRadius)}${unit}; }`);
	}
	if (attributes.commonBorderRadius_tablet !== undefined) {
		const unit = attributes.commonBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { border-radius: ${safeValue(attributes.commonBorderRadius_tablet)}${unit}; }`);
	}
	if (attributes.commonBorderRadius_mobile !== undefined) {
		const unit = attributes.commonBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { border-radius: ${safeValue(attributes.commonBorderRadius_mobile)}${unit}; }`);
	}

	// Box shadow - ts_sf_input_shadow
	if (attributes.commonBoxShadow) {
		const shadow = generateBoxShadowCSS(attributes.commonBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { box-shadow: ${shadow}; }`);
		}
	}

	// Border - ts_sf_input_border
	if (attributes.commonBorder) {
		const border = generateBorderCSS(attributes.commonBorder as any);
		if (border) {
			cssRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { border: ${border}; }`);
			// Ensure it overrides focus styles if needed
			cssRules.push(`${selector} input.inline-input:focus { border: ${border}; }`);
		}
	}

	// Background color - ts_sf_input_bg
	if (attributes.commonBackgroundColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter, ${selector} input.inline-input { background-color: ${attributes.commonBackgroundColor}; }`);
	}

	// Icon color - ts_sf_input_icon_col
	// Filter icons are direct <span> children containing SVGs
	if (attributes.commonIconColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter > span svg { fill: ${attributes.commonIconColor}; color: ${attributes.commonIconColor}; }`);
	}

	// Text color - ts_sf_input_value_col
	if (attributes.commonTextColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter .ts-filter-text, ${selector} input.inline-input { color: ${attributes.commonTextColor}; }`);
	}

	// Hover states
	if (attributes.commonBoxShadowHover) {
		const shadow = generateBoxShadowCSS(attributes.commonBoxShadowHover);
		if (shadow) {
			cssRules.push(`${selector} .ts-form-group .ts-filter:hover { box-shadow: ${shadow}; }`);
		}
	}
	if (attributes.commonBorderColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-filter:hover, ${selector} input.inline-input:hover, ${selector} input.inline-input:focus { border-color: ${attributes.commonBorderColorHover}; }`);
	}
	if (attributes.commonBackgroundColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-filter:hover { background-color: ${attributes.commonBackgroundColorHover}; }`);
	}
	if (attributes.commonIconColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-filter:hover > span svg { fill: ${attributes.commonIconColorHover}; color: ${attributes.commonIconColorHover}; }`);
	}
	if (attributes.commonTextColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-filter:hover .ts-filter-text { color: ${attributes.commonTextColorHover}; }`);
	}

	// Typography - ts_sf_input_input_typo
	if (attributes.commonTypography) {
		const typo = generateTypographyCSS(attributes.commonTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-form-group .ts-filter .ts-filter-text, ${selector} input.inline-input { ${typo} }`);
		}
	}

	// Hide chevron - ts_hide_chevron
	if (attributes.hideChevron === true) {
		cssRules.push(`${selector} .ts-form-group .ts-filter .ts-down-icon { display: none; }`);
	}

	// Chevron color - ts_chevron_btn_color
	if (attributes.chevronColor) {
		// Voxel uses border-color for the chevron icon
		cssRules.push(`${selector} .ts-form-group .ts-filter .ts-down-icon { color: ${attributes.chevronColor}; border-color: ${attributes.chevronColor}; }`);
		// Keep pseudo-element support just in case, but main element border-color is key
		cssRules.push(`${selector} .ts-form-group .ts-filter .ts-down-icon::before { background-color: ${attributes.chevronColor}; border-color: ${attributes.chevronColor}; }`);
	}

	// Chevron color hover - ts_chevron_btn_color_h
	if (attributes.chevronColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-filter:hover .ts-down-icon { color: ${attributes.chevronColorHover}; border-color: ${attributes.chevronColorHover}; }`);
		cssRules.push(`${selector} .ts-form-group .ts-filter:hover .ts-down-icon::before { background-color: ${attributes.chevronColorHover}; border-color: ${attributes.chevronColorHover}; }`);
	}

	// ============================================
	// GENERAL TAB - Section 3: Button
	// Source: search-form.php:1270-1468
	// ============================================

	// Normal state
	// Button Padding - ts_sf_input_padding
	// Selector: .ts-filter (line 1302)
	if (attributes.buttonPadding) {
		const padding = generateDimensionsCSS(attributes.buttonPadding, 'padding');
		if (padding) {
			cssRules.push(`${selector} .ts-form-group .ts-filter { ${padding} }`);
		}
	}
	if (attributes.buttonPadding_tablet) {
		const padding = generateDimensionsCSS(attributes.buttonPadding_tablet, 'padding');
		if (padding) {
			tabletRules.push(`${selector} .ts-form-group .ts-filter { ${padding} }`);
		}
	}
	if (attributes.buttonPadding_mobile) {
		const padding = generateDimensionsCSS(attributes.buttonPadding_mobile, 'padding');
		if (padding) {
			mobileRules.push(`${selector} .ts-form-group .ts-filter { ${padding} }`);
		}
	}

	// Button Icon/Text spacing - ts_sf_input_icon_margin
	// Selector: .ts-filter, .ts-search-btn (lines 1333-1334)
	if (attributes.buttonIconSpacing !== undefined) {
		cssRules.push(`${selector} .ts-form-group .ts-filter { grid-gap: ${safeValue(attributes.buttonIconSpacing)}px; }`);
		cssRules.push(`${selector} .ts-search-btn { grid-gap: ${safeValue(attributes.buttonIconSpacing)}px; }`);
	}
	if (attributes.buttonIconSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .ts-filter { grid-gap: ${safeValue(attributes.buttonIconSpacing_tablet)}px; }`);
		tabletRules.push(`${selector} .ts-search-btn { grid-gap: ${safeValue(attributes.buttonIconSpacing_tablet)}px; }`);
	}
	if (attributes.buttonIconSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .ts-filter { grid-gap: ${safeValue(attributes.buttonIconSpacing_mobile)}px; }`);
		mobileRules.push(`${selector} .ts-search-btn { grid-gap: ${safeValue(attributes.buttonIconSpacing_mobile)}px; }`);
	}

	// Filled state
	// Typography (Filled) - ts_sf_input_typo_filled
	// Selector: .ts-filter.ts-filled (line 1358)
	if (attributes.buttonFilledTypography) {
		const typo = generateTypographyCSS(attributes.buttonFilledTypography);
		if (typo) {
			cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { ${typo} }`);
		}
	}

	// Background (Filled) - ts_sf_input_background_filled
	// Selector: .ts-filter.ts-filled (line 1369)
	if (attributes.buttonFilledBackground) {
		cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { background-color: ${attributes.buttonFilledBackground}; }`);
	}

	// Text color (Filled) - ts_sf_input_value_col_filled
	// Selector: .ts-filter.ts-filled .ts-filter-text (line 1381)
	if (attributes.buttonFilledTextColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled .ts-filter-text { color: ${attributes.buttonFilledTextColor}; }`);
	}

	// Icon color (Filled) - ts_sf_input_icon_col_filled
	// Selector: .ts-filter.ts-filled with --ts-icon-color (line 1393)
	if (attributes.buttonFilledIconColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { --ts-icon-color: ${attributes.buttonFilledIconColor}; }`);
	}

	// Border color (Filled) - ts_sf_input_border_filled
	// Selector: .ts-filter.ts-filled (line 1407)
	if (attributes.buttonFilledBorderColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { border-color: ${attributes.buttonFilledBorderColor}; }`);
	}

	// Border width (Filled) - ts_sf_border_filled_width
	// Selector: .ts-filter.ts-filled (line 1431)
	if (attributes.buttonFilledBorderWidth !== undefined) {
		const unit = attributes.buttonFilledBorderWidthUnit || 'px';
		cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { border-width: ${safeValue(attributes.buttonFilledBorderWidth)}${unit}; }`);
	}
	if (attributes['buttonFilledBorderWidth_tablet'] !== undefined) {
		const unit = attributes.buttonFilledBorderWidthUnit || 'px';
		tabletRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { border-width: ${safeValue(attributes['buttonFilledBorderWidth_tablet'])}${unit}; }`);
	}
	if (attributes['buttonFilledBorderWidth_mobile'] !== undefined) {
		const unit = attributes.buttonFilledBorderWidthUnit || 'px';
		mobileRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { border-width: ${safeValue(attributes['buttonFilledBorderWidth_mobile'])}${unit}; }`);
	}

	// Box Shadow (Filled) - ts_sf_input_shadow_active
	// Selector: .ts-filter.ts-filled (line 1441)
	if (attributes.buttonFilledBoxShadow) {
		const shadow = generateBoxShadowCSS(attributes.buttonFilledBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled { box-shadow: ${shadow}; }`);
		}
	}

	// Chevron color (Filled) - ts_chevron_filled
	// Selector: .ts-filter.ts-filled .ts-down-icon (line 1451)
	if (attributes.buttonFilledChevronColor) {
		cssRules.push(`${selector} .ts-form-group .ts-filter.ts-filled .ts-down-icon { border-color: ${attributes.buttonFilledChevronColor}; }`);
	}

	// ============================================
	// GENERAL TAB - Section 5: Search Button
	// Source: search-form.php:1600-1769
	// Selector: .ts-search-btn (lines 1630, 1643, 1658, 1673, 1684)
	// ============================================

	// Normal state
	// Color - ts_sf_form_btn_c (line 1630)
	if (attributes.searchBtnColor) {
		cssRules.push(`${selector} .ts-search-btn { color: ${attributes.searchBtnColor}; }`);
	}
	// Icon color - ts_sf_form_btn_c_i (line 1643) - uses CSS custom property
	if (attributes.searchBtnIconColor) {
		cssRules.push(`${selector} .ts-search-btn { --ts-icon-color: ${attributes.searchBtnIconColor}; }`);
	}
	// Background color - ts_sf_form_btn_bg (line 1658)
	if (attributes.searchBtnBackgroundColor) {
		cssRules.push(`${selector} .ts-search-btn { background: ${attributes.searchBtnBackgroundColor}; }`);
	}
	// Border Type - ts_sf_search_border (line 1673)
	// CRITICAL: Must use high-specificity selector to override Voxel's
	// `.ts-form-submit.ts-form-group button { border: none; }` rule
	if (attributes.searchBtnBorder) {
		const border = generateBorderCSS(attributes.searchBtnBorder as any);
		if (border) {
			cssRules.push(`${selector} .ts-form-submit.ts-form-group button.ts-search-btn { border: ${border}; }`);
		}
		// Border radius from BorderGroupControl
		const borderRadius = (attributes.searchBtnBorder as BorderGroupValue)?.borderRadius;
		if (borderRadius) {
			const unit = borderRadius.unit || 'px';
			const parseVal = (val: number | string | undefined): string => {
				if (val === undefined || val === '' || val === null) return '0';
				return typeof val === 'string' ? val.replace(/[^0-9.]/g, '') || '0' : String(val);
			};
			const topR = parseVal(borderRadius.top);
			const rightR = parseVal(borderRadius.right);
			const bottomR = parseVal(borderRadius.bottom);
			const leftR = parseVal(borderRadius.left);
			// Only output if at least one value is set (not all zeros)
			if (topR !== '0' || rightR !== '0' || bottomR !== '0' || leftR !== '0') {
				if (topR === rightR && rightR === bottomR && bottomR === leftR) {
					cssRules.push(`${selector} .ts-form-submit.ts-form-group button.ts-search-btn { border-radius: ${topR}${unit}; }`);
				} else {
					cssRules.push(`${selector} .ts-form-submit.ts-form-group button.ts-search-btn { border-radius: ${topR}${unit} ${rightR}${unit} ${bottomR}${unit} ${leftR}${unit}; }`);
				}
			}
		}
	}
	// Box Shadow - ts_submit_shadow (line 1684)
	if (attributes.searchBtnBoxShadow) {
		const shadow = generateBoxShadowCSS(attributes.searchBtnBoxShadow);
		if (shadow) {
			cssRules.push(`${selector} .ts-search-btn { box-shadow: ${shadow}; }`);
		}
	}

	// Hover state
	// Text color - ts_sf_form_btn_c_h (line 1710)
	if (attributes.searchBtnTextColorHover) {
		cssRules.push(`${selector} .ts-search-btn:hover { color: ${attributes.searchBtnTextColorHover}; }`);
	}
	// Icon color - ts_sf_form_btn_c_h_i (line 1722) - uses CSS custom property
	if (attributes.searchBtnIconColorHover) {
		cssRules.push(`${selector} .ts-search-btn:hover { --ts-icon-color: ${attributes.searchBtnIconColorHover}; }`);
	}
	// Background color - ts_sf_form_btn_bg_h (line 1734)
	if (attributes.searchBtnBackgroundColorHover) {
		cssRules.push(`${selector} .ts-search-btn:hover { background: ${attributes.searchBtnBackgroundColorHover}; }`);
	}
	// Border color - ts_sf_form_btn_border_h (line 1746)
	// CRITICAL: High-specificity selector to override Voxel's button border rules
	if (attributes.searchBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-form-submit.ts-form-group button.ts-search-btn:hover { border-color: ${attributes.searchBtnBorderColorHover}; }`);
	}
	// Box shadow - ts_submit_shadow_hover (line 1757)
	if (attributes.searchBtnBoxShadowHover) {
		const shadow = generateBoxShadowCSS(attributes.searchBtnBoxShadowHover);
		if (shadow) {
			cssRules.push(`${selector} .ts-search-btn:hover { box-shadow: ${shadow}; }`);
		}
	}

	// ============================================
	// INLINE TAB - Section 1: Terms: Inline
	// Selectors match Voxel: .inline-multilevel li > a span
	// Evidence: themes/voxel/app/widgets/search-form.php:1811, 1823, 1843, 1868, 1889
	// ============================================

	// Normal state - Title
	if (attributes.termsInlineTitleColor) {
		cssRules.push(`${selector} .inline-multilevel li > a span { color: ${attributes.termsInlineTitleColor}; }`);
	}
	if (attributes.termsInlineTitleTypographyNormal) {
		const typo = generateTypographyCSS(attributes.termsInlineTitleTypographyNormal);
		if (typo) {
			cssRules.push(`${selector} .inline-multilevel li > a span { ${typo} }`);
		}
	}

	// Normal state - Icon (Voxel uses CSS custom property --ts-icon-color)
	if (attributes.termsInlineIconColor) {
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon { --ts-icon-color: ${attributes.termsInlineIconColor}; }`);
	}
	// Icon size (Voxel uses CSS custom property --ts-icon-size)
	if (attributes.termsInlineIconSize !== undefined) {
		const iconSizeUnit = attributes.termsInlineIconSizeUnit || 'px';
		cssRules.push(`${selector} .inline-multilevel .ts-term-icon { --ts-icon-size: ${safeValue(attributes.termsInlineIconSize)}${iconSizeUnit}; }`);
	}

	// Normal state - Inner gap (Voxel uses grid-gap on li > a)
	if (attributes.termsInlineInnerGap !== undefined) {
		cssRules.push(`${selector} .inline-multilevel li > a { grid-gap: ${safeValue(attributes.termsInlineInnerGap)}px; }`);
	}

	// Normal state - Chevron (Voxel uses border-color on .ts-right-icon, .ts-left-icon)
	if (attributes.termsInlineChevronColor) {
		cssRules.push(`${selector} .ts-right-icon, ${selector} .ts-left-icon { border-color: ${attributes.termsInlineChevronColor}; }`);
	}

	// Hover state
	if (attributes.termsInlineTitleColorHover) {
		cssRules.push(`${selector} .inline-multilevel li > a:hover span { color: ${attributes.termsInlineTitleColorHover}; }`);
	}
	if (attributes.termsInlineIconColorHover) {
		cssRules.push(`${selector} .inline-multilevel li > a:hover .ts-term-icon { --ts-icon-color: ${attributes.termsInlineIconColorHover}; }`);
	}
	if (attributes['termsInlineChevronColorHover']) {
		cssRules.push(`${selector} .inline-multilevel li > a:hover .ts-right-icon, ${selector} .inline-multilevel li > a:hover .ts-left-icon { border-color: ${attributes['termsInlineChevronColorHover']}; }`);
	}

	// Selected state
	if (attributes.termsInlineTitleColorSelected) {
		cssRules.push(`${selector} .inline-multilevel li.ts-selected > a span { color: ${attributes.termsInlineTitleColorSelected}; }`);
	}
	if (attributes.termsInlineTitleTypographySelected) {
		const typo = generateTypographyCSS(attributes.termsInlineTitleTypographySelected);
		if (typo) {
			cssRules.push(`${selector} .inline-multilevel li.ts-selected > a span { ${typo} }`);
		}
	}
	if (attributes.termsInlineIconColorSelected) {
		cssRules.push(`${selector} .inline-multilevel li.ts-selected > a .ts-term-icon { --ts-icon-color: ${attributes.termsInlineIconColorSelected}; }`);
	}
	if (attributes.termsInlineChevronColorSelected) {
		cssRules.push(`${selector} .inline-multilevel li.ts-selected > a .ts-right-icon, ${selector} .inline-multilevel li.ts-selected > a .ts-left-icon { border-color: ${attributes.termsInlineChevronColorSelected}; }`);
	}

	// Tablet overrides
	if (attributes.termsInlineIconSize_tablet !== undefined) {
		const iconSizeUnit = attributes.termsInlineIconSizeUnit || 'px';
		tabletRules.push(`${selector} .inline-multilevel .ts-term-icon { --ts-icon-size: ${safeValue(attributes.termsInlineIconSize_tablet)}${iconSizeUnit}; }`);
	}
	if (attributes.termsInlineInnerGap_tablet !== undefined) {
		tabletRules.push(`${selector} .inline-multilevel li > a { grid-gap: ${safeValue(attributes.termsInlineInnerGap_tablet)}px; }`);
	}

	// Mobile overrides
	if (attributes.termsInlineIconSize_mobile !== undefined) {
		const iconSizeUnit = attributes.termsInlineIconSizeUnit || 'px';
		mobileRules.push(`${selector} .inline-multilevel .ts-term-icon { --ts-icon-size: ${safeValue(attributes.termsInlineIconSize_mobile)}${iconSizeUnit}; }`);
	}
	if (attributes.termsInlineInnerGap_mobile !== undefined) {
		mobileRules.push(`${selector} .inline-multilevel li > a { grid-gap: ${safeValue(attributes.termsInlineInnerGap_mobile)}px; }`);
	}

	// ============================================
	// 2. Terms: Buttons Section
	// Selectors match Voxel: .addon-buttons li
	// Evidence: themes/voxel/app/widgets/search-form.php:2049, 2060, 2072, 2090, 2102, 2112, 2139, 2152, 2165, 2176
	// ============================================

	// Normal state
	if (attributes.termsButtonsGap !== undefined) {
		cssRules.push(`${selector} .addon-buttons { grid-gap: ${safeValue(attributes.termsButtonsGap)}px; }`);
	}
	if (attributes.termsButtonsBackground) {
		cssRules.push(`${selector} .addon-buttons li { background: ${attributes.termsButtonsBackground}; }`);
	}
	// Border type from SelectControl (string: 'solid', 'dashed', 'none', etc.)
	if (attributes.termsButtonsBorderType && attributes.termsButtonsBorderType !== '' && attributes.termsButtonsBorderType !== 'none') {
		cssRules.push(`${selector} .addon-buttons li { border-style: ${attributes.termsButtonsBorderType}; }`);
	}
	if (attributes.termsButtonsBorderType === 'none') {
		cssRules.push(`${selector} .addon-buttons li { border: none; }`);
	}
	// Border radius from ResponsiveRangeControl
	if (attributes.termsButtonsBorderRadius !== undefined) {
		cssRules.push(`${selector} .addon-buttons li { border-radius: ${safeValue(attributes.termsButtonsBorderRadius)}px; }`);
	}
	if (attributes.termsButtonsTypography) {
		const typo = generateTypographyCSS(attributes.termsButtonsTypography);
		if (typo) {
			cssRules.push(`${selector} .addon-buttons li { ${typo} }`);
		}
	}
	if (attributes.termsButtonsTextColor) {
		cssRules.push(`${selector} .addon-buttons li { color: ${attributes.termsButtonsTextColor}; }`);
	}

	// Selected state (Voxel uses .adb-selected class)
	if (attributes.termsButtonsBackgroundSelected) {
		cssRules.push(`${selector} .addon-buttons li.adb-selected { background: ${attributes.termsButtonsBackgroundSelected}; }`);
	}
	// ColorSelected (matches InlineTab control name)
	if (attributes.termsButtonsColorSelected) {
		cssRules.push(`${selector} .addon-buttons li.adb-selected { color: ${attributes.termsButtonsColorSelected}; }`);
	}
	// Border color selected (just the color)
	if (attributes.termsButtonsBorderColorSelected) {
		cssRules.push(`${selector} .addon-buttons li.adb-selected { border-color: ${attributes.termsButtonsBorderColorSelected}; }`);
	}
	// Box shadow selected
	if (attributes.termsButtonsBoxShadowSelected) {
		const shadow = generateBoxShadowCSS(attributes.termsButtonsBoxShadowSelected);
		if (shadow) {
			cssRules.push(`${selector} .addon-buttons li.adb-selected { box-shadow: ${shadow}; }`);
		}
	}

	// Tablet overrides
	if (attributes.termsButtonsGap_tablet !== undefined) {
		tabletRules.push(`${selector} .addon-buttons { grid-gap: ${safeValue(attributes.termsButtonsGap_tablet)}px; }`);
	}
	if (attributes.termsButtonsBorderRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .addon-buttons li { border-radius: ${safeValue(attributes.termsButtonsBorderRadius_tablet)}px; }`);
	}

	// Mobile overrides
	if (attributes.termsButtonsGap_mobile !== undefined) {
		mobileRules.push(`${selector} .addon-buttons { grid-gap: ${safeValue(attributes.termsButtonsGap_mobile)}px; }`);
	}
	if (attributes.termsButtonsBorderRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .addon-buttons li { border-radius: ${safeValue(attributes.termsButtonsBorderRadius_mobile)}px; }`);
	}

	// ============================================
	// 3. Geolocation Icon Section
	// Selectors match Voxel: .inline-user-location
	// Evidence: themes/voxel/app/widgets/search-form.php:2225, 2257, 2268, 2293, 2304, 2315, 2337, 2364, 2377
	// ============================================

	// Normal state
	if (attributes.geoIconRightMargin !== undefined) {
		// Voxel uses position:absolute with right: for margin (line 2225)
		cssRules.push(`${selector} .inline-user-location { right: ${safeValue(attributes.geoIconRightMargin)}px; }`);
	}
	if (attributes.geoIconButtonSize !== undefined) {
		const unit = attributes.geoIconButtonSizeUnit || 'px';
		cssRules.push(`${selector} .inline-user-location { width: ${safeValue(attributes.geoIconButtonSize)}${unit}; height: ${safeValue(attributes.geoIconButtonSize)}${unit}; }`);
	}
	if (attributes.geoIconButtonBackground) {
		cssRules.push(`${selector} .inline-user-location { background-color: ${attributes.geoIconButtonBackground}; }`);
	}
	// Border type from SelectControl
	if (attributes.geoIconButtonBorderType && attributes.geoIconButtonBorderType !== '' && attributes.geoIconButtonBorderType !== 'none') {
		cssRules.push(`${selector} .inline-user-location { border-style: ${attributes.geoIconButtonBorderType}; }`);
	}
	if (attributes.geoIconButtonBorderType === 'none') {
		cssRules.push(`${selector} .inline-user-location { border: none; }`);
	}
	// Border radius from ResponsiveRangeControlWithDropdown
	if (attributes.geoIconButtonBorderRadius !== undefined) {
		const unit = attributes.geoIconButtonBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .inline-user-location { border-radius: ${safeValue(attributes.geoIconButtonBorderRadius)}${unit}; }`);
	}
	// Icon color - Voxel uses CSS custom property (line 2268)
	if (attributes.geoIconButtonIconColor) {
		cssRules.push(`${selector} .inline-user-location { --ts-icon-color: ${attributes.geoIconButtonIconColor}; }`);
	}
	// Icon size - Voxel uses CSS custom property (line 2293)
	if (attributes.geoIconButtonIconSize !== undefined) {
		const unit = attributes.geoIconButtonIconSizeUnit || 'px';
		cssRules.push(`${selector} .inline-user-location { --ts-icon-size: ${safeValue(attributes.geoIconButtonIconSize)}${unit}; }`);
	}

	// Hover state
	if (attributes.geoIconButtonBackgroundHover) {
		cssRules.push(`${selector} .inline-user-location:hover { background-color: ${attributes.geoIconButtonBackgroundHover}; }`);
	}
	if (attributes.geoIconButtonBorderColorHover) {
		cssRules.push(`${selector} .inline-user-location:hover { border-color: ${attributes.geoIconButtonBorderColorHover}; }`);
	}
	// Hover icon color - Voxel uses CSS custom property (line 2364)
	if (attributes.geoIconButtonIconColorHover) {
		cssRules.push(`${selector} .inline-user-location:hover { --ts-icon-color: ${attributes.geoIconButtonIconColorHover}; }`);
	}

	// Tablet overrides
	if (attributes.geoIconRightMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .inline-user-location { right: ${safeValue(attributes.geoIconRightMargin_tablet)}px; }`);
	}
	if (attributes.geoIconButtonSize_tablet !== undefined) {
		const unit = attributes.geoIconButtonSizeUnit || 'px';
		tabletRules.push(`${selector} .inline-user-location { width: ${safeValue(attributes.geoIconButtonSize_tablet)}${unit}; height: ${safeValue(attributes.geoIconButtonSize_tablet)}${unit}; }`);
	}
	if (attributes.geoIconButtonIconSize_tablet !== undefined) {
		const unit = attributes.geoIconButtonIconSizeUnit || 'px';
		tabletRules.push(`${selector} .inline-user-location { --ts-icon-size: ${safeValue(attributes.geoIconButtonIconSize_tablet)}${unit}; }`);
	}
	if (attributes.geoIconButtonBorderRadius_tablet !== undefined) {
		const unit = attributes.geoIconButtonBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .inline-user-location { border-radius: ${safeValue(attributes.geoIconButtonBorderRadius_tablet)}${unit}; }`);
	}

	// Mobile overrides
	if (attributes.geoIconRightMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .inline-user-location { right: ${safeValue(attributes.geoIconRightMargin_mobile)}px; }`);
	}
	if (attributes.geoIconButtonSize_mobile !== undefined) {
		const unit = attributes.geoIconButtonSizeUnit || 'px';
		mobileRules.push(`${selector} .inline-user-location { width: ${safeValue(attributes.geoIconButtonSize_mobile)}${unit}; height: ${safeValue(attributes.geoIconButtonSize_mobile)}${unit}; }`);
	}
	if (attributes.geoIconButtonIconSize_mobile !== undefined) {
		const unit = attributes.geoIconButtonIconSizeUnit || 'px';
		mobileRules.push(`${selector} .inline-user-location { --ts-icon-size: ${safeValue(attributes.geoIconButtonIconSize_mobile)}${unit}; }`);
	}
	if (attributes.geoIconButtonBorderRadius_mobile !== undefined) {
		const unit = attributes.geoIconButtonBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .inline-user-location { border-radius: ${safeValue(attributes.geoIconButtonBorderRadius_mobile)}${unit}; }`);
	}

	// ============================================
	// 4. Stepper Section
	// Selectors match Voxel: .ts-inline-filter .ts-stepper-input input
	// Evidence: themes/voxel/app/widgets/search-form.php:2439
	// ============================================

	if (attributes.stepperInputValueSize !== undefined) {
		cssRules.push(`${selector} .ts-inline-filter .ts-stepper-input input { font-size: ${safeValue(attributes.stepperInputValueSize)}px; }`);
	}

	// Tablet overrides
	if (attributes['stepperInputValueSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-inline-filter .ts-stepper-input input { font-size: ${safeValue(attributes['stepperInputValueSize_tablet'])}px; }`);
	}

	// Mobile overrides
	if (attributes['stepperInputValueSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-inline-filter .ts-stepper-input input { font-size: ${safeValue(attributes['stepperInputValueSize_mobile'])}px; }`);
	}

	// ============================================
	// 5. Stepper Buttons Section
	// Attribute names match InlineTab.tsx: stepperButtons* prefix
	// Selectors match Voxel: .ts-icon-btn.inline-btn-ts
	// Evidence: themes/voxel/app/widgets/search-form.php:2497, 2508, 2533, 2544
	// Note: Voxel uses CSS variables for icon styling: --ts-icon-color, --ts-icon-size
	// ============================================

	// Normal state
	if (attributes.stepperButtonsSize !== undefined) {
		const unit = attributes.stepperButtonsSizeUnit || 'px';
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { width: ${safeValue(attributes.stepperButtonsSize)}${unit}; height: ${safeValue(attributes.stepperButtonsSize)}${unit}; }`);
	}
	// Icon color - Voxel uses CSS custom property (search-form.php:2508)
	if (attributes.stepperButtonsIconColor) {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { --ts-icon-color: ${attributes.stepperButtonsIconColor}; }`);
	}
	// Icon size - Voxel uses CSS custom property (search-form.php:2533)
	if (attributes.stepperButtonsIconSize !== undefined) {
		const unit = attributes.stepperButtonsIconSizeUnit || 'px';
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { --ts-icon-size: ${safeValue(attributes.stepperButtonsIconSize)}${unit}; }`);
	}
	if (attributes.stepperButtonsBackground) {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { background-color: ${attributes.stepperButtonsBackground}; }`);
	}
	// Border type from SelectControl
	if (attributes.stepperButtonsBorderType && attributes.stepperButtonsBorderType !== '' && attributes.stepperButtonsBorderType !== 'none') {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { border-style: ${attributes.stepperButtonsBorderType}; }`);
	}
	if (attributes.stepperButtonsBorderType === 'none') {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { border: none; }`);
	}
	// Border radius from ResponsiveRangeControlWithDropdown
	if (attributes.stepperButtonsBorderRadius !== undefined) {
		const unit = attributes.stepperButtonsBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts { border-radius: ${safeValue(attributes.stepperButtonsBorderRadius)}${unit}; }`);
	}

	// Hover state - Voxel uses CSS variables for icon hover (search-form.php:2604)
	if (attributes.stepperButtonsIconColorHover) {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts:hover { --ts-icon-color: ${attributes.stepperButtonsIconColorHover}; }`);
	}
	if (attributes.stepperButtonsBackgroundHover) {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts:hover { background-color: ${attributes.stepperButtonsBackgroundHover}; }`);
	}
	if (attributes.stepperButtonsBorderColorHover) {
		cssRules.push(`${selector} .ts-icon-btn.inline-btn-ts:hover { border-color: ${attributes.stepperButtonsBorderColorHover}; }`);
	}

	// Tablet overrides
	if (attributes.stepperButtonsSize_tablet !== undefined) {
		const unit = attributes.stepperButtonsSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-icon-btn.inline-btn-ts { width: ${safeValue(attributes.stepperButtonsSize_tablet)}${unit}; height: ${safeValue(attributes.stepperButtonsSize_tablet)}${unit}; }`);
	}
	if (attributes.stepperButtonsIconSize_tablet !== undefined) {
		const unit = attributes.stepperButtonsIconSizeUnit || 'px';
		tabletRules.push(`${selector} .ts-icon-btn.inline-btn-ts { --ts-icon-size: ${safeValue(attributes.stepperButtonsIconSize_tablet)}${unit}; }`);
	}
	if (attributes.stepperButtonsBorderRadius_tablet !== undefined) {
		const unit = attributes.stepperButtonsBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-icon-btn.inline-btn-ts { border-radius: ${safeValue(attributes.stepperButtonsBorderRadius_tablet)}${unit}; }`);
	}

	// Mobile overrides
	if (attributes.stepperButtonsSize_mobile !== undefined) {
		const unit = attributes.stepperButtonsSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-icon-btn.inline-btn-ts { width: ${safeValue(attributes.stepperButtonsSize_mobile)}${unit}; height: ${safeValue(attributes.stepperButtonsSize_mobile)}${unit}; }`);
	}
	if (attributes.stepperButtonsIconSize_mobile !== undefined) {
		const unit = attributes.stepperButtonsIconSizeUnit || 'px';
		mobileRules.push(`${selector} .ts-icon-btn.inline-btn-ts { --ts-icon-size: ${safeValue(attributes.stepperButtonsIconSize_mobile)}${unit}; }`);
	}
	if (attributes.stepperButtonsBorderRadius_mobile !== undefined) {
		const unit = attributes.stepperButtonsBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-icon-btn.inline-btn-ts { border-radius: ${safeValue(attributes.stepperButtonsBorderRadius_mobile)}${unit}; }`);
	}

	// ============================================
	// 6. Range Slider Section
	// Attribute names match InlineTab.tsx: range* prefix
	// Selectors match Voxel: .ts-inline-filter .range-slider-wrapper / .noUi-*
	// Evidence: themes/voxel/app/widgets/search-form.php:2678, 2702, 2715, 2728
	// ============================================

	if (attributes.rangeValueSize !== undefined) {
		cssRules.push(`${selector} .ts-inline-filter .range-slider-wrapper .range-value { font-size: ${safeValue(attributes.rangeValueSize)}px; }`);
	}
	if (attributes.rangeValueColor) {
		cssRules.push(`${selector} .ts-inline-filter .range-slider-wrapper .range-value { color: ${attributes.rangeValueColor}; }`);
	}
	// Track background (unselected portion) - Voxel uses .noUi-target not .noUi-base
	if (attributes.rangeBackground) {
		cssRules.push(`${selector} .ts-inline-filter .noUi-target { background-color: ${attributes.rangeBackground}; }`);
	}
	// Selected portion background (progress)
	if (attributes.rangeSelectedBackground) {
		cssRules.push(`${selector} .ts-inline-filter .noUi-connect { background-color: ${attributes.rangeSelectedBackground}; }`);
	}
	// Handle background
	if (attributes.rangeHandleBackground) {
		cssRules.push(`${selector} .ts-inline-filter .noUi-handle { background-color: ${attributes.rangeHandleBackground}; }`);
	}
	// Border type from SelectControl
	if (attributes.rangeBorderType && attributes.rangeBorderType !== '' && attributes.rangeBorderType !== 'none') {
		cssRules.push(`${selector} .ts-inline-filter .noUi-handle { border-style: ${attributes.rangeBorderType}; }`);
	}
	if (attributes.rangeBorderType === 'none') {
		cssRules.push(`${selector} .ts-inline-filter .noUi-handle { border: none; }`);
	}

	// Tablet overrides
	if (attributes['rangeValueSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-inline-filter .range-slider-wrapper .range-value { font-size: ${safeValue(attributes['rangeValueSize_tablet'])}px; }`);
	}

	// Mobile overrides
	if (attributes['rangeValueSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-inline-filter .range-slider-wrapper .range-value { font-size: ${safeValue(attributes['rangeValueSize_mobile'])}px; }`);
	}

	// ============================================
	// 7. Switcher Section
	// Attribute names match InlineTab.tsx: switcherBackground* pattern
	// Selectors match Voxel: .ts-inline-filter .onoffswitch
	// Evidence: themes/voxel/app/widgets/search-form.php:2767, 2780, 2793
	// ============================================

	// Inactive (unchecked) state background
	if (attributes.switcherBackgroundInactive) {
		cssRules.push(`${selector} .ts-inline-filter .onoffswitch .onoffswitch-label { background-color: ${attributes.switcherBackgroundInactive}; }`);
	}
	// Active (checked) state background - Voxel uses .onoffswitch-checkbox:checked +
	if (attributes.switcherBackgroundActive) {
		cssRules.push(`${selector} .ts-inline-filter .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label { background-color: ${attributes.switcherBackgroundActive}; }`);
	}
	// Handle (toggle knob) background
	if (attributes.switcherHandleBackground) {
		cssRules.push(`${selector} .ts-inline-filter .onoffswitch .onoffswitch-label:before { background-color: ${attributes.switcherHandleBackground}; }`);
	}

	// ============================================
	// 8. Checkbox Section
	// Attribute names match InlineTab.tsx
	// Selectors match Voxel: .ts-inline-filter .container-checkbox .checkmark
	// Evidence: themes/voxel/app/widgets/search-form.php:2826
	// ============================================

	if (attributes.checkboxSize !== undefined) {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { width: ${safeValue(attributes.checkboxSize)}px; height: ${safeValue(attributes.checkboxSize)}px; min-width: ${safeValue(attributes.checkboxSize)}px; }`);
	}
	// Border radius (renamed from checkboxBorderRadius to checkboxRadius)
	if (attributes.checkboxRadius !== undefined) {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { border-radius: ${safeValue(attributes.checkboxRadius)}px; }`);
	}
	// Border type from SelectControl (renamed from checkboxBorder to checkboxBorderType)
	if (attributes.checkboxBorderType && attributes.checkboxBorderType !== '' && attributes.checkboxBorderType !== 'none') {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { border-style: ${attributes.checkboxBorderType}; }`);
	}
	if (attributes.checkboxBorderType === 'none') {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { border: none; }`);
	}
	// Unchecked state
	if (attributes.checkboxBackgroundUnchecked) {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { background-color: ${attributes.checkboxBackgroundUnchecked}; }`);
	}
	// Checked state - uses ~ sibling selector per Voxel (search-form.php:2877)
	if (attributes.checkboxBackgroundChecked) {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox input:checked ~ .checkmark { background-color: ${attributes.checkboxBackgroundChecked}; }`);
	}
	// Border color when checked
	if (attributes.checkboxBorderColorChecked) {
		cssRules.push(`${selector} .ts-inline-filter .container-checkbox input:checked ~ .checkmark { border-color: ${attributes.checkboxBorderColorChecked}; }`);
	}

	// Tablet overrides
	if (attributes.checkboxSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { width: ${safeValue(attributes.checkboxSize_tablet)}px; height: ${safeValue(attributes.checkboxSize_tablet)}px; min-width: ${safeValue(attributes.checkboxSize_tablet)}px; }`);
	}
	if (attributes.checkboxRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { border-radius: ${safeValue(attributes.checkboxRadius_tablet)}px; }`);
	}

	// Mobile overrides
	if (attributes.checkboxSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { width: ${safeValue(attributes.checkboxSize_mobile)}px; height: ${safeValue(attributes.checkboxSize_mobile)}px; min-width: ${safeValue(attributes.checkboxSize_mobile)}px; }`);
	}
	if (attributes.checkboxRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-inline-filter .container-checkbox .checkmark { border-radius: ${safeValue(attributes.checkboxRadius_mobile)}px; }`);
	}

	// ============================================
	// 9. Radio Section
	// Attribute names match InlineTab.tsx
	// Selectors match Voxel: .ts-inline-filter .container-radio .checkmark
	// Evidence: themes/voxel/app/widgets/search-form.php:2923
	// ============================================

	if (attributes.radioSize !== undefined) {
		cssRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { width: ${safeValue(attributes.radioSize)}px; height: ${safeValue(attributes.radioSize)}px; min-width: ${safeValue(attributes.radioSize)}px; }`);
	}
	// Border radius (renamed from radioBorderRadius to radioRadius)
	if (attributes.radioRadius !== undefined) {
		cssRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { border-radius: ${safeValue(attributes.radioRadius)}px; }`);
	}
	// Border type from SelectControl (renamed from radioBorder to radioBorderType)
	if (attributes.radioBorderType && attributes.radioBorderType !== '' && attributes.radioBorderType !== 'none') {
		cssRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { border-style: ${attributes.radioBorderType}; }`);
	}
	if (attributes.radioBorderType === 'none') {
		cssRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { border: none; }`);
	}
	// Unchecked state
	if (attributes.radioBackgroundUnchecked) {
		cssRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { background-color: ${attributes.radioBackgroundUnchecked}; }`);
	}
	// Checked state - uses ~ sibling selector per Voxel (search-form.php:2974)
	if (attributes.radioBackgroundChecked) {
		cssRules.push(`${selector} .ts-inline-filter .container-radio input:checked ~ .checkmark { background-color: ${attributes.radioBackgroundChecked}; }`);
	}
	// Border color when checked
	if (attributes.radioBorderColorChecked) {
		cssRules.push(`${selector} .ts-inline-filter .container-radio input:checked ~ .checkmark { border-color: ${attributes.radioBorderColorChecked}; }`);
	}

	// Tablet overrides
	if (attributes.radioSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { width: ${safeValue(attributes.radioSize_tablet)}px; height: ${safeValue(attributes.radioSize_tablet)}px; min-width: ${safeValue(attributes.radioSize_tablet)}px; }`);
	}
	if (attributes.radioRadius_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { border-radius: ${safeValue(attributes.radioRadius_tablet)}px; }`);
	}

	// Mobile overrides
	if (attributes.radioSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { width: ${safeValue(attributes.radioSize_mobile)}px; height: ${safeValue(attributes.radioSize_mobile)}px; min-width: ${safeValue(attributes.radioSize_mobile)}px; }`);
	}
	if (attributes.radioRadius_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-inline-filter .container-radio .checkmark { border-radius: ${safeValue(attributes.radioRadius_mobile)}px; }`);
	}

	// ============================================
	// 10. Input Section
	// Source: search-form.php:1470-1598
	// Uses .ts-form-group input, .ts-form-group textarea
	// ============================================

	// Text color
	if (attributes.inputTextColor) {
		cssRules.push(`${selector} .ts-form-group input, ${selector} .ts-form-group textarea { color: ${attributes.inputTextColor}; }`);
	}
	// Placeholder color
	if (attributes.inputPlaceholderColor) {
		cssRules.push(`${selector} .ts-form-group input::placeholder, ${selector} .ts-form-group textarea::placeholder { color: ${attributes.inputPlaceholderColor}; opacity: 1; }`);
	}
	// Padding
	if (attributes.inputPadding) {
		const padding = generateDimensionsCSS(attributes.inputPadding, 'padding');
		if (padding) {
			cssRules.push(`${selector} .ts-form-group input, ${selector} .ts-form-group textarea { ${padding} }`);
		}
	}
	if (attributes.inputPadding_tablet) {
		const padding = generateDimensionsCSS(attributes.inputPadding_tablet, 'padding');
		if (padding) {
			tabletRules.push(`${selector} .ts-form-group input, ${selector} .ts-form-group textarea { ${padding} }`);
		}
	}
	if (attributes.inputPadding_mobile) {
		const padding = generateDimensionsCSS(attributes.inputPadding_mobile, 'padding');
		if (padding) {
			mobileRules.push(`${selector} .ts-form-group input, ${selector} .ts-form-group textarea { ${padding} }`);
		}
	}
	// Icon side margin - acts as gap between icon and text in input
	// Target the span inside .ts-input-icon (the icon itself)
	if (attributes.inputIconSideMargin !== undefined) {
		cssRules.push(`${selector} .ts-form-group .ts-input-icon > span { margin-right: ${safeValue(attributes.inputIconSideMargin)}px; }`);
	}
	if (attributes.inputIconSideMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .ts-input-icon > span { margin-right: ${safeValue(attributes.inputIconSideMargin_tablet)}px; }`);
	}
	if (attributes.inputIconSideMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .ts-input-icon > span { margin-right: ${safeValue(attributes.inputIconSideMargin_mobile)}px; }`);
	}

	// Focus State
	// Reverted to direct input targeting as Keywords input doesn't use .ts-filter wrapper
	// Added !important to override high-specificity Voxel Main/Editor CSS (body.block-editor-page ...)
	if (attributes.inputBackgroundColorFocus) {
		cssRules.push(`${selector} .ts-form-group input:focus, ${selector} .ts-form-group textarea:focus { background-color: ${attributes.inputBackgroundColorFocus} !important; }`);
	}
	if (attributes.inputBorderColorFocus) {
		cssRules.push(`${selector} .ts-form-group input:focus, ${selector} .ts-form-group textarea:focus { border-color: ${attributes.inputBorderColorFocus} !important; }`);
	}
	if (attributes.inputBoxShadowFocus) {
		const shadow = generateBoxShadowCSS(attributes.inputBoxShadowFocus);
		if (shadow) {
			cssRules.push(`${selector} .ts-form-group input:focus, ${selector} .ts-form-group textarea:focus { box-shadow: ${shadow} !important; }`);
		}
	}

	// ============================================
	// 11. Toggle Button / Switcher Section
	// Source: search-form.php:2996-3284
	// Uses .ts-form-group .ts-switcher li AND .ts-filter-toggle (Mobile toggle)
	// ============================================

	// Normal State
	// Default styles: Remove underline from WordPress core link styles
	// Specificity hack: Target alias class and use explicit anchor to beat generic WP theme styles
	cssRules.push(`${selector} a.ts-filter-toggle.ts-btn { text-decoration: none; }`);
	// Keep switcher items clean too
	cssRules.push(`${selector} .ts-form-group .ts-switcher li { text-decoration: none; }`);

	// Typography
	if (attributes.toggleBtnTypography) {
		const typo = generateTypographyCSS(attributes.toggleBtnTypography);
		if (typo) {
			// Target both Switcher items and Mobile Toggle button
			cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { ${typo} }`);
		}
	}
	// Size (Height)
	if (attributes['toggleBtnSize'] !== undefined) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { height: ${safeValue(attributes['toggleBtnSize'])}px; display: flex; align-items: center; justify-content: center; }`);
	}
	if (attributes['toggleBtnSize_tablet'] !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { height: ${safeValue(attributes['toggleBtnSize_tablet'])}px; }`);
	}
	if (attributes['toggleBtnSize_mobile'] !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { height: ${safeValue(attributes['toggleBtnSize_mobile'])}px; }`);
	}
	// Padding
	if (attributes.toggleBtnPadding) {
		const padding = generateDimensionsCSS(attributes.toggleBtnPadding, 'padding');
		if (padding) {
			cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { ${padding} }`);
		}
	}
	if (attributes.toggleBtnPadding_tablet) {
		const padding = generateDimensionsCSS(attributes.toggleBtnPadding_tablet, 'padding');
		if (padding) {
			tabletRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { ${padding} }`);
		}
	}
	if (attributes.toggleBtnPadding_mobile) {
		const padding = generateDimensionsCSS(attributes.toggleBtnPadding_mobile, 'padding');
		if (padding) {
			mobileRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { ${padding} }`);
		}
	}
	// Border Radius
	// Supports optional unit (default to px)
	if (attributes.toggleBtnBorderRadius !== undefined) {
		const unit = attributes.toggleBtnBorderRadiusUnit || 'px';
		cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { border-radius: ${safeValue(attributes.toggleBtnBorderRadius)}${unit}; }`);
	}
	if (attributes.toggleBtnBorderRadius_tablet !== undefined) {
		const unit = attributes.toggleBtnBorderRadiusUnit || 'px';
		tabletRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { border-radius: ${safeValue(attributes.toggleBtnBorderRadius_tablet)}${unit}; }`);
	}
	if (attributes.toggleBtnBorderRadius_mobile !== undefined) {
		const unit = attributes.toggleBtnBorderRadiusUnit || 'px';
		mobileRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { border-radius: ${safeValue(attributes.toggleBtnBorderRadius_mobile)}${unit}; }`);
	}
	// Text Color
	if (attributes.toggleBtnTextColor) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { color: ${attributes.toggleBtnTextColor}; }`);
	}
	// Icon Color
	if (attributes.toggleBtnIconColor) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li i, ${selector} .ts-form-group .ts-switcher li svg, ${selector} .ts-filter-toggle svg { color: ${attributes.toggleBtnIconColor}; fill: ${attributes.toggleBtnIconColor}; }`);
	}
	// Icon Size
	if (attributes.toggleBtnIconSize !== undefined) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li i, ${selector} .ts-form-group .ts-switcher li svg, ${selector} .ts-filter-toggle svg { width: ${safeValue(attributes.toggleBtnIconSize)}px; height: ${safeValue(attributes.toggleBtnIconSize)}px; font-size: ${safeValue(attributes.toggleBtnIconSize)}px; }`);
	}
	if (attributes.toggleBtnIconSize_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .ts-switcher li i, ${selector} .ts-form-group .ts-switcher li svg, ${selector} .ts-filter-toggle svg { width: ${safeValue(attributes.toggleBtnIconSize_tablet)}px; height: ${safeValue(attributes.toggleBtnIconSize_tablet)}px; font-size: ${safeValue(attributes.toggleBtnIconSize_tablet)}px; }`);
	}
	if (attributes.toggleBtnIconSize_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .ts-switcher li i, ${selector} .ts-form-group .ts-switcher li svg, ${selector} .ts-filter-toggle svg { width: ${safeValue(attributes.toggleBtnIconSize_mobile)}px; height: ${safeValue(attributes.toggleBtnIconSize_mobile)}px; font-size: ${safeValue(attributes.toggleBtnIconSize_mobile)}px; }`);
	}
	// Icon/Text Spacing (grid-gap)
	if (attributes.toggleBtnIconSpacing !== undefined) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { grid-gap: ${safeValue(attributes.toggleBtnIconSpacing)}px; gap: ${safeValue(attributes.toggleBtnIconSpacing)}px; }`);
	}
	if (attributes.toggleBtnIconSpacing_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { grid-gap: ${safeValue(attributes.toggleBtnIconSpacing_tablet)}px; gap: ${safeValue(attributes.toggleBtnIconSpacing_tablet)}px; }`);
	}
	if (attributes.toggleBtnIconSpacing_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { grid-gap: ${safeValue(attributes.toggleBtnIconSpacing_mobile)}px; gap: ${safeValue(attributes.toggleBtnIconSpacing_mobile)}px; }`);
	}
	// Background (Fixed attribute name: toggleBtnBackgroundColor)
	if (attributes.toggleBtnBackgroundColor) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { background-color: ${attributes.toggleBtnBackgroundColor}; }`);
	}
	// Border (Fixed: uses generateBorderCSS for BorderGroupControl)
	if (attributes.toggleBtnBorder) {
		const border = generateBorderCSS(attributes.toggleBtnBorder as any);
		if (border) {
			cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { border: ${border}; }`);
		}
	}

	// Separator Color
	if (attributes['toggleBtnSeparatorColor']) {
		// Only applies to Switcher list items
		cssRules.push(`${selector} .ts-form-group .ts-switcher li:not(:last-child) { border-right-color: ${attributes['toggleBtnSeparatorColor']}; }`);
	}
	// Box Shadow
	if (attributes['toggleBtnBoxShadow']) {
		const shadow = generateBoxShadowCSS(attributes['toggleBtnBoxShadow']);
		if (shadow) {
			cssRules.push(`${selector} .ts-form-group .ts-switcher li, ${selector} .ts-filter-toggle { box-shadow: ${shadow}; }`);
		}
	}

	// Hover State
	if (attributes.toggleBtnTextColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li:hover, ${selector} .ts-filter-toggle:hover { color: ${attributes.toggleBtnTextColorHover}; }`);
	}
	if (attributes.toggleBtnIconColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li:hover i, ${selector} .ts-form-group .ts-switcher li:hover svg, ${selector} .ts-filter-toggle:hover svg { color: ${attributes.toggleBtnIconColorHover}; fill: ${attributes.toggleBtnIconColorHover}; }`);
	}
	// Background Hover (Fixed attribute name: toggleBtnBackgroundColorHover)
	if (attributes.toggleBtnBackgroundColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li:hover, ${selector} .ts-filter-toggle:hover { background-color: ${attributes.toggleBtnBackgroundColorHover}; }`);
	}
	if (attributes.toggleBtnBorderColorHover) {
		cssRules.push(`${selector} .ts-form-group .ts-switcher li:hover, ${selector} .ts-filter-toggle:hover { border-color: ${attributes.toggleBtnBorderColorHover}; }`);
	}
	if (attributes['toggleBtnBoxShadowHover']) {
		const shadow = generateBoxShadowCSS(attributes['toggleBtnBoxShadowHover']);
		if (shadow) {
			cssRules.push(`${selector} .ts-form-group .ts-switcher li:hover, ${selector} .ts-filter-toggle:hover { box-shadow: ${shadow}; }`);
		}
	}

	// Filled (Active) State
	// Switcher uses .ts-active. Mobile Toggle uses aria-expanded="true"
	const activeSelector = `${selector} .ts-form-group .ts-switcher li.ts-active, ${selector} .ts-filter-toggle[aria-expanded="true"]`;
	if (attributes.toggleBtnTextColorFilled) {
		cssRules.push(`${activeSelector} { color: ${attributes.toggleBtnTextColorFilled}; }`);
	}
	if (attributes.toggleBtnIconColorFilled) {
		cssRules.push(`${activeSelector} i, ${activeSelector} svg { color: ${attributes.toggleBtnIconColorFilled}; fill: ${attributes.toggleBtnIconColorFilled}; }`);
	}
	// Background Filled (Assumed toggleBtnBackgroundColorFilled based on pattern)
	if (attributes.toggleBtnBackgroundColorFilled || attributes['toggleBtnBackgroundFilled']) {
		const bg = attributes.toggleBtnBackgroundColorFilled || attributes['toggleBtnBackgroundFilled'];
		cssRules.push(`${activeSelector} { background-color: ${bg}; }`);
	}
	if (attributes.toggleBtnBorderColorFilled) {
		cssRules.push(`${activeSelector} { border-color: ${attributes.toggleBtnBorderColorFilled}; }`);
	}
	if (attributes.toggleBtnBoxShadowFilled) {
		const shadow = generateBoxShadowCSS(attributes.toggleBtnBoxShadowFilled);
		if (shadow) {
			cssRules.push(`${activeSelector} { box-shadow: ${shadow}; }`);
		}
	}

	// ============================================
	// 12. Toggle: Active Count Section
	// Source: search-form.php:3367-3422
	// CSS Target: .ts-filter-count (badge showing active filter count)
	// ============================================

	// Text color - ts_suffix_text (line 3375)
	if (attributes.activeCountTextColor) {
		cssRules.push(`${selector} .ts-filter-count { color: ${attributes.activeCountTextColor}; }`);
	}
	// Background color - ts_suffix_bg (line 3388)
	if (attributes.activeCountBackgroundColor) {
		cssRules.push(`${selector} .ts-filter-count { background: ${attributes.activeCountBackgroundColor}; }`);
	}
	// Right margin - ts_suffix_mg (line 3400)
	// Note: Voxel uses 'right' for LTR, we support both with responsive
	if (attributes.activeCountRightMargin !== undefined) {
		cssRules.push(`${selector} .ts-filter-count { right: ${safeValue(attributes.activeCountRightMargin)}px; }`);
	}
	if (attributes.activeCountRightMargin_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-filter-count { right: ${safeValue(attributes.activeCountRightMargin_tablet)}px; }`);
	}
	if (attributes.activeCountRightMargin_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-filter-count { right: ${safeValue(attributes.activeCountRightMargin_mobile)}px; }`);
	}

	// ============================================
	// 13. Term Count Section
	// Source: search-form.php:3778-3810
	// CSS Target: .ts-term-count (count badge next to term labels)
	// ============================================

	// Number color - ts_term_count_col (line 3787)
	if (attributes.termCountNumberColor) {
		cssRules.push(`${selector} .ts-term-count { color: ${attributes.termCountNumberColor}; }`);
	}
	// Border color - ts_term_count_border (line 3799)
	if (attributes.termCountBorderColor) {
		cssRules.push(`${selector} .ts-term-count { border-color: ${attributes.termCountBorderColor}; }`);
	}

	// ============================================
	// 14. Map/feed Switcher Section
	// Source: search-form.php:3426-3770
	// CSS Target: .ts-switcher-btn (container), .ts-switcher-btn .ts-btn (button)
	// ============================================
	// SPECIFICITY FIX: The switcher is portaled to document.body wrapped in a scoping div.
	// commons.css uses `.ts-switcher-btn .ts-btn` (specificity 0,2,0)
	// Voxel/Elementor uses `.elementor-{id} .elementor-element.elementor-element-{id} .ts-switcher-btn .ts-btn` (0,5,0)
	// We need higher specificity to override commons.css defaults.
	// Using doubled class selector: `.voxel-fse-search-form-{id}.voxel-fse-search-form-{id}` (0,2,0)
	// Combined with `.ts-switcher-btn .ts-btn` = (0,4,0) which beats commons.css (0,2,0)
	// NOTE: Switcher CSS is now ALSO generated server-side in PHP (style-generator.php)
	// for frontend rendering. This JS version is used in Gutenberg editor preview.
	const switcherSelector = `.voxel-fse-search-form-${blockId}.voxel-fse-search-form-${blockId}`;

	// Alignment (justify-content on container)
	if (attributes.mapSwitcherAlign) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn { justify-content: ${attributes.mapSwitcherAlign}; }`);
	}

	// Bottom margin (distance from bottom)
	if (attributes.mapSwitcherBottomMargin !== undefined) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn { bottom: ${safeValue(attributes.mapSwitcherBottomMargin)}px; }`);
	}
	if (attributes.mapSwitcherBottomMargin_tablet !== undefined) {
		tabletRules.push(`${switcherSelector} .ts-switcher-btn { bottom: ${safeValue(attributes.mapSwitcherBottomMargin_tablet)}px; }`);
	}
	if (attributes.mapSwitcherBottomMargin_mobile !== undefined) {
		mobileRules.push(`${switcherSelector} .ts-switcher-btn { bottom: ${safeValue(attributes.mapSwitcherBottomMargin_mobile)}px; }`);
	}

	// Side margin (padding-left/right on container)
	if (attributes.mapSwitcherSideMargin !== undefined) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn { padding-left: ${safeValue(attributes.mapSwitcherSideMargin)}px; padding-right: ${safeValue(attributes.mapSwitcherSideMargin)}px; }`);
	}
	if (attributes.mapSwitcherSideMargin_tablet !== undefined) {
		tabletRules.push(`${switcherSelector} .ts-switcher-btn { padding-left: ${safeValue(attributes.mapSwitcherSideMargin_tablet)}px; padding-right: ${safeValue(attributes.mapSwitcherSideMargin_tablet)}px; }`);
	}
	if (attributes.mapSwitcherSideMargin_mobile !== undefined) {
		mobileRules.push(`${switcherSelector} .ts-switcher-btn { padding-left: ${safeValue(attributes.mapSwitcherSideMargin_mobile)}px; padding-right: ${safeValue(attributes.mapSwitcherSideMargin_mobile)}px; }`);
	}

	// Typography
	if (attributes.mapSwitcherTypography) {
		const typo = generateTypographyCSS(attributes.mapSwitcherTypography);
		if (typo) {
			cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { ${typo} }`);
		}
	}

	// Text color
	if (attributes.mapSwitcherColor) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { color: ${attributes.mapSwitcherColor}; }`);
	}

	// Background color
	if (attributes.mapSwitcherBackgroundColor) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { background: ${attributes.mapSwitcherBackgroundColor}; }`);
	}

	// Height
	if (attributes.mapSwitcherHeight !== undefined) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { height: ${safeValue(attributes.mapSwitcherHeight)}px; }`);
	}
	if (attributes.mapSwitcherHeight_tablet !== undefined) {
		tabletRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { height: ${safeValue(attributes.mapSwitcherHeight_tablet)}px; }`);
	}
	if (attributes.mapSwitcherHeight_mobile !== undefined) {
		mobileRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { height: ${safeValue(attributes.mapSwitcherHeight_mobile)}px; }`);
	}

	// Padding
	if (attributes.mapSwitcherPadding) {
		const padding = generateDimensionsCSS(attributes.mapSwitcherPadding, 'padding');
		if (padding) {
			cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { ${padding} }`);
		}
	}
	if (attributes.mapSwitcherPadding_tablet) {
		const padding = generateDimensionsCSS(attributes.mapSwitcherPadding_tablet, 'padding');
		if (padding) {
			tabletRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { ${padding} }`);
		}
	}
	if (attributes.mapSwitcherPadding_mobile) {
		const padding = generateDimensionsCSS(attributes.mapSwitcherPadding_mobile, 'padding');
		if (padding) {
			mobileRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { ${padding} }`);
		}
	}

	// Border
	if (attributes.mapSwitcherBorder) {
		const border = generateBorderCSS(attributes.mapSwitcherBorder as any);
		if (border) {
			cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { border: ${border}; }`);
		}
	}

	// Border radius
	if (attributes.mapSwitcherBorderRadius !== undefined) {
		const unit = attributes['mapSwitcherBorderRadiusUnit'] || 'px';
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { border-radius: ${safeValue(attributes.mapSwitcherBorderRadius)}${unit}; }`);
	}
	if (attributes.mapSwitcherBorderRadius_tablet !== undefined) {
		const unit = attributes['mapSwitcherBorderRadiusUnit'] || 'px';
		tabletRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { border-radius: ${safeValue(attributes.mapSwitcherBorderRadius_tablet)}${unit}; }`);
	}
	if (attributes.mapSwitcherBorderRadius_mobile !== undefined) {
		const unit = attributes['mapSwitcherBorderRadiusUnit'] || 'px';
		mobileRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { border-radius: ${safeValue(attributes.mapSwitcherBorderRadius_mobile)}${unit}; }`);
	}

	// Box shadow
	if (attributes.mapSwitcherBoxShadow) {
		const shadow = generateBoxShadowCSS(attributes.mapSwitcherBoxShadow);
		if (shadow) {
			cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { box-shadow: ${shadow}; }`);
		}
	}

	// Icon spacing (grid-gap)
	if (attributes.mapSwitcherIconSpacing !== undefined) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { grid-gap: ${safeValue(attributes.mapSwitcherIconSpacing)}px; }`);
	}
	if (attributes.mapSwitcherIconSpacing_tablet !== undefined) {
		tabletRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { grid-gap: ${safeValue(attributes.mapSwitcherIconSpacing_tablet)}px; }`);
	}
	if (attributes.mapSwitcherIconSpacing_mobile !== undefined) {
		mobileRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { grid-gap: ${safeValue(attributes.mapSwitcherIconSpacing_mobile)}px; }`);
	}

	// Icon size (--ts-icon-size CSS variable)
	if (attributes.mapSwitcherIconSize !== undefined) {
		const unit = attributes['mapSwitcherIconSizeUnit'] || 'px';
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { --ts-icon-size: ${safeValue(attributes.mapSwitcherIconSize)}${unit}; }`);
	}
	if (attributes.mapSwitcherIconSize_tablet !== undefined) {
		const unit = attributes['mapSwitcherIconSizeUnit'] || 'px';
		tabletRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { --ts-icon-size: ${safeValue(attributes.mapSwitcherIconSize_tablet)}${unit}; }`);
	}
	if (attributes.mapSwitcherIconSize_mobile !== undefined) {
		const unit = attributes['mapSwitcherIconSizeUnit'] || 'px';
		mobileRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { --ts-icon-size: ${safeValue(attributes.mapSwitcherIconSize_mobile)}${unit}; }`);
	}

	// Icon color (--ts-icon-color CSS variable)
	if (attributes.mapSwitcherIconColor) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn { --ts-icon-color: ${attributes.mapSwitcherIconColor}; }`);
	}

	// Hover state
	if (attributes.mapSwitcherColorHover) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn:hover { color: ${attributes.mapSwitcherColorHover}; }`);
	}
	if (attributes.mapSwitcherBackgroundColorHover) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn:hover { background: ${attributes.mapSwitcherBackgroundColorHover}; }`);
	}
	if (attributes.mapSwitcherBorderColorHover) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn:hover { border-color: ${attributes.mapSwitcherBorderColorHover}; }`);
	}
	if (attributes.mapSwitcherIconColorHover) {
		cssRules.push(`${switcherSelector} .ts-switcher-btn .ts-btn:hover { --ts-icon-color: ${attributes.mapSwitcherIconColorHover}; }`);
	}

	// ============================================
	// 14. Other Section
	// Source: search-form.php:3818-3878
	// ============================================

	// Max filter width - ks_nowrap_max_width
	// Selector: .ts-filter (line 3849)
	if (attributes.maxFilterWidth !== undefined) {
		const unit = attributes['maxFilterWidthUnit'] || 'px';
		cssRules.push(`${selector} .ts-filter { max-width: ${safeValue(attributes.maxFilterWidth)}${unit}; }`);
	}
	if (attributes.maxFilterWidth_tablet !== undefined) {
		const unit = attributes['maxFilterWidthUnit'] || 'px';
		tabletRules.push(`${selector} .ts-filter { max-width: ${safeValue(attributes.maxFilterWidth_tablet)}${unit}; }`);
	}
	if (attributes.maxFilterWidth_mobile !== undefined) {
		const unit = attributes['maxFilterWidthUnit'] || 'px';
		mobileRules.push(`${selector} .ts-filter { max-width: ${safeValue(attributes.maxFilterWidth_mobile)}${unit}; }`);
	}

	// Min input width - inline_input_min
	// Selector: .ts-inline-filter (line 3870)
	// Description: Increase the minimum width of inputs, useful when filters have auto width
	if (attributes.minInputWidth !== undefined) {
		const unit = attributes['minInputWidthUnit'] || 'px';
		cssRules.push(`${selector} .ts-inline-filter { min-width: ${safeValue(attributes.minInputWidth)}${unit}; }`);
	}
	if (attributes.minInputWidth_tablet !== undefined) {
		const unit = attributes['minInputWidthUnit'] || 'px';
		tabletRules.push(`${selector} .ts-inline-filter { min-width: ${safeValue(attributes.minInputWidth_tablet)}${unit}; }`);
	}
	if (attributes.minInputWidth_mobile !== undefined) {
		const unit = attributes['minInputWidthUnit'] || 'px';
		mobileRules.push(`${selector} .ts-inline-filter { min-width: ${safeValue(attributes.minInputWidth_mobile)}${unit}; }`);
	}

	// ============================================
	// 11. Popups: Custom Style Section
	// Source: search-form.php:3880-3960
	// Controls: GeneralTab.tsx -> "Popups: Custom style" accordion
	// Target: Portal elements (scoped via added class in SearchFormComponent)
	// ============================================

	if (attributes.popupCustomStyleEnabled) {
		// CRITICAL: Popup styles use popupSelector (NOT selector) because popups render
		// at document.body level via React Portal. The popupSelector targets popups by
		// their voxel-popup-{blockId} class, which must be passed to FieldPopup via className prop.
		//
		// Two types of popups to style:
		// 1. Form portal (ts-search-portal) - used when portalMode is active
		// 2. FieldPopup portals (.voxel-popup-{blockId}) - individual filter popups

		// Target both the form portal AND individual field popups
		const portalSelector = `.voxel-fse-search-form-${blockId}.ts-search-portal`;
		const combinedPopupSelector = `:is(${portalSelector}, ${popupSelector})`;

		// Backdrop background - custm_pg_backdrop
		// Selector: {{WRAPPER}}-wrap > div:after
		// The ::after pseudo-element creates the dark backdrop overlay
		// CRITICAL: Voxel's backdrop is on .ts-popup-root > div::after (the ts-form div), NOT .ts-popup-root::after
		// Evidence: themes/voxel/assets/dist/popup-kit.css - ".ts-popup-root>div:after{...}"
		if (attributes.popupBackdropBackground) {
			cssRules.push(`${combinedPopupSelector} .ts-popup-root > div::after { background-color: ${attributes.popupBackdropBackground} !important; }`);
		}

		// Backdrop pointer events - popup_pointer_events
		// When enabled, clicks on backdrop close the popup
		// CRITICAL: Same selector fix as above - targets the div child's ::after pseudo-element
		if (attributes.popupBackdropPointerEvents) {
			cssRules.push(`${combinedPopupSelector} .ts-popup-root > div::after { pointer-events: all; }`);
		}

		// Box Shadow - pg_shadow
		// Selector: {{WRAPPER}} .ts-field-popup
		if (attributes.popupBoxShadow) {
			const shadow = generateBoxShadowCSS(attributes.popupBoxShadow);
			if (shadow) {
				cssRules.push(`${combinedPopupSelector} .ts-field-popup { box-shadow: ${shadow}; }`);
			}
		}

		// Top / Bottom margin - custom_pg_top_margin
		// Selector: {{WRAPPER}} .ts-field-popup-container
		if (attributes.popupTopBottomMargin !== undefined) {
			cssRules.push(`${combinedPopupSelector} .ts-field-popup-container { margin: ${attributes.popupTopBottomMargin}px 0; }`);
		}
		if (attributes.popupTopBottomMargin_tablet !== undefined) {
			tabletRules.push(`${combinedPopupSelector} .ts-field-popup-container { margin: ${attributes.popupTopBottomMargin_tablet}px 0; }`);
		}
		if (attributes.popupTopBottomMargin_mobile !== undefined) {
			mobileRules.push(`${combinedPopupSelector} .ts-field-popup-container { margin: ${attributes.popupTopBottomMargin_mobile}px 0; }`);
		}

		// Max height - custom_max_height
		// Selector: {{WRAPPER}} .ts-popup-content-wrapper
		if (attributes['popupMaxHeight'] !== undefined) {
			cssRules.push(`${combinedPopupSelector} .ts-popup-content-wrapper { max-height: ${attributes['popupMaxHeight']}px; }`);
		}
		if (attributes['popupMaxHeight_tablet'] !== undefined) {
			tabletRules.push(`${combinedPopupSelector} .ts-popup-content-wrapper { max-height: ${attributes['popupMaxHeight_tablet']}px; }`);
		}
		if (attributes['popupMaxHeight_mobile'] !== undefined) {
			mobileRules.push(`${combinedPopupSelector} .ts-popup-content-wrapper { max-height: ${attributes['popupMaxHeight_mobile']}px; }`);
		}

		// Autosuggest top margin - google_top_margin
		// Selector: .pac-container, .ts-autocomplete-dropdown .suggestions-list
		// Note: .pac-container is global (Google Maps), so scoping is tricky.
		// We target the internal dropdown plus the form portal for autocomplete
		if (attributes.popupAutosuggestTopMargin !== undefined) {
			cssRules.push(`${combinedPopupSelector} .ts-autocomplete-dropdown .suggestions-list { margin-top: ${attributes.popupAutosuggestTopMargin}px !important; }`);
			// Also target inline autocomplete in the main block
			cssRules.push(`${selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: ${attributes.popupAutosuggestTopMargin}px !important; }`);
		}
		if (attributes.popupAutosuggestTopMargin_tablet !== undefined) {
			tabletRules.push(`${combinedPopupSelector} .ts-autocomplete-dropdown .suggestions-list { margin-top: ${attributes.popupAutosuggestTopMargin_tablet}px !important; }`);
			tabletRules.push(`${selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: ${attributes.popupAutosuggestTopMargin_tablet}px !important; }`);
		}
		if (attributes.popupAutosuggestTopMargin_mobile !== undefined) {
			mobileRules.push(`${combinedPopupSelector} .ts-autocomplete-dropdown .suggestions-list { margin-top: ${attributes.popupAutosuggestTopMargin_mobile}px !important; }`);
			mobileRules.push(`${selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: ${attributes.popupAutosuggestTopMargin_mobile}px !important; }`);
		}
	}

	// ============================================
	// 12. Filter-Level Popup: Center Position CSS
	// Source: search-form.php:421-434
	// When a filter has popupCenterPosition enabled, the popup should be
	// centered on screen (fixed position) instead of anchored to trigger
	// ============================================
	// Note: The ts-popup-centered class is added to the outer vx-popup wrapper
	// when config.popupCenterPosition is true in filter components.
	// This CSS makes the popup fixed and centered on desktop only.
	cssRules.push(`.ts-popup-centered .ts-popup-root { position: fixed !important; }`);
	cssRules.push(`.ts-popup-centered .ts-form { position: static !important; max-width: initial; width: auto !important; }`);

	// ============================================
	// 13. Filter-Level Popup: Multi-Column Menu & Custom Popup CSS
	// Source: search-form.php:334-434 (custom popup styles) & 387-419 (popup_menu_columns)
	// ============================================
	// Iterate over all filters in all post types to generate scoped CSS
	if (attributes.filterLists) {
		Object.entries(attributes.filterLists).forEach(([_postTypeKey, filters]) => {
			if (!Array.isArray(filters)) return;
			filters.forEach((filter, _index) => {
				// Safety check for ID
				if (!filter.id) return;

				// Use strict chaining: Popup Root Class + Repeater ID Class
				// This ensures we only target the specific popup for this filter in this block
				// Selector: .voxel-popup-{blockId}.elementor-repeater-item-{id}
				const filterPopupScope = `${popupSelector}.elementor-repeater-item-${filter.id}`;

				// Custom Popup Styles
				if (filter.customPopupEnabled) {
					// Min Width
					if (filter.popupMinWidth !== undefined) {
						cssRules.push(`${filterPopupScope} .ts-field-popup { min-width: ${filter.popupMinWidth}px; }`);
					}
					// Max Width
					if (filter.popupMaxWidth !== undefined) {
						cssRules.push(`${filterPopupScope} .ts-field-popup { max-width: ${filter.popupMaxWidth}px; }`);
					}
					// Max Height
					if (filter.popupMaxHeight !== undefined) {
						cssRules.push(`${filterPopupScope} .ts-popup-content-wrapper { max-height: ${filter.popupMaxHeight}px; }`);
					}
					// Center Position
					if (filter.popupCenterPosition) {
						cssRules.push(`${filterPopupScope} .ts-field-popup-container { align-items: center; justify-content: center; display: flex; }`);
						cssRules.push(`${filterPopupScope} .ts-field-popup { margin: 0 !important; transform: none !important; }`);
					}
				}

				// Multi-Column Menu Styles
				if (filter.popupMenuColumnsEnabled) {
					// We target the term dropdown list within that popup scope
					const menuSelector = `${filterPopupScope} .ts-term-dropdown-list`;

					// Desktop columns
					if (filter.popupMenuColumns !== undefined && filter.popupMenuColumns > 0) {
						cssRules.push(`${menuSelector} { display: grid; grid-template-columns: repeat(${filter.popupMenuColumns}, 1fr); }`);
					}

					// Desktop column gap
					if (filter.popupMenuColumnGap !== undefined) {
						cssRules.push(`${menuSelector} { gap: ${filter.popupMenuColumnGap}px; }`);
					}

					// Tablet columns (if supported in future updates, currently not in attributes per inspection)
					// Mobile columns (same)
				}
			});
		});
	}

	// ============================================
	// Combine all CSS
	// ============================================

	let finalCSS = '';

	// Desktop rules (no media query)
	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}

	// Tablet rules
	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}

	// Mobile rules
	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}

	return finalCSS;
}
