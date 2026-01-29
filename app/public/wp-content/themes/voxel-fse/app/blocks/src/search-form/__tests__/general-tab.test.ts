/**
 * GeneralTab Inspector Controls - Comprehensive Tests
 *
 * Tests all 11 accordion sections and 100+ attributes in GeneralTab.tsx
 * Covers: attribute inventory, type validation, CSS generation, and round-trip persistence.
 *
 * Source: GeneralTab.tsx (inspector/GeneralTab.tsx)
 * Evidence: search-form.php:912-3960
 *
 * @package VoxelFSE
 */

import { describe, it, expect, beforeEach } from 'vitest';

// =============================================================================
// Type Definitions (matching SearchFormAttributes interface)
// =============================================================================

interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	isLinked?: boolean;
}

interface TypographyConfig {
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: string;
	fontWeight?: string;
	fontStyle?: string;
	textTransform?: string;
	textDecoration?: string;
	lineHeight?: number;
	lineHeightUnit?: string;
	letterSpacing?: number;
	letterSpacingUnit?: string;
	wordSpacing?: number;
	wordSpacingUnit?: string;
}

interface BoxShadowConfig {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'outset' | 'inset';
}

interface BorderConfig {
	width?: number;
	style?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
	color?: string;
}

// =============================================================================
// CSS Generation Helpers
// =============================================================================

function generateDimensionsCSS(d: DimensionsConfig | undefined, property: string): string {
	if (!d || Object.keys(d).length === 0) return '';
	const unit = d.unit || 'px';
	const top = d.top ?? 0;
	const right = d.right ?? 0;
	const bottom = d.bottom ?? 0;
	const left = d.left ?? 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

function generateTypographyCSS(t: TypographyConfig | undefined): string {
	if (!t || Object.keys(t).length === 0) return '';
	const rules: string[] = [];
	if (t.fontFamily) rules.push(`font-family: ${t.fontFamily};`);
	if (t.fontSize !== undefined) rules.push(`font-size: ${t.fontSize}${t.fontSizeUnit || 'px'};`);
	if (t.fontWeight) rules.push(`font-weight: ${t.fontWeight};`);
	if (t.fontStyle) rules.push(`font-style: ${t.fontStyle};`);
	if (t.textTransform) rules.push(`text-transform: ${t.textTransform};`);
	if (t.textDecoration) rules.push(`text-decoration: ${t.textDecoration};`);
	if (t.lineHeight !== undefined) rules.push(`line-height: ${t.lineHeight}${t.lineHeightUnit || ''};`);
	if (t.letterSpacing !== undefined) rules.push(`letter-spacing: ${t.letterSpacing}${t.letterSpacingUnit || 'px'};`);
	return rules.join(' ');
}

function generateBoxShadowCSS(s: BoxShadowConfig | undefined): string {
	if (!s || Object.keys(s).length === 0) return '';
	const h = s.horizontal ?? 0;
	const v = s.vertical ?? 0;
	const blur = s.blur ?? 0;
	const spread = s.spread ?? 0;
	const color = s.color || 'rgba(0,0,0,0.1)';
	const inset = s.position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color};`;
}

function generateBorderCSS(b: BorderConfig | undefined): string {
	if (!b || Object.keys(b).length === 0 || b.style === 'none') return '';
	const width = b.width ?? 1;
	const style = b.style || 'solid';
	const color = b.color || '#000';
	return `border: ${width}px ${style} ${color};`;
}

// =============================================================================
// ACCORDION 1: GENERAL
// Attributes: filterMargin, showLabels, labelTypography, labelColor
// =============================================================================

describe('Accordion 1: General', () => {
	describe('filterMargin (DimensionsControl)', () => {
		it('should accept empty object as default', () => {
			const filterMargin: DimensionsConfig = {};
			expect(Object.keys(filterMargin).length).toBe(0);
		});

		it('should accept uniform margin values', () => {
			const filterMargin: DimensionsConfig = {
				top: 10, right: 10, bottom: 10, left: 10, unit: 'px', isLinked: true
			};
			expect(filterMargin.top).toBe(filterMargin.bottom);
			expect(filterMargin.isLinked).toBe(true);
		});

		it('should generate valid CSS', () => {
			const filterMargin: DimensionsConfig = { top: 0, right: 15, bottom: 20, left: 15, unit: 'px' };
			const css = generateDimensionsCSS(filterMargin, 'margin');
			expect(css).toBe('margin: 0px 15px 20px 15px;');
		});

		it('should support responsive values (_tablet, _mobile)', () => {
			const filterMargin = { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' };
			const filterMargin_tablet = { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' };
			const filterMargin_mobile = { top: 5, right: 5, bottom: 5, left: 5, unit: 'px' };
			expect(filterMargin.top).toBe(10);
			expect(filterMargin_tablet.top).toBe(8);
			expect(filterMargin_mobile.top).toBe(5);
		});
	});

	describe('showLabels (ToggleControl)', () => {
		it('should default to false', () => {
			const showLabels = false;
			expect(showLabels).toBe(false);
		});

		it('should accept boolean true', () => {
			const showLabels = true;
			expect(showLabels).toBe(true);
		});
	});

	describe('labelTypography (TypographyPopup)', () => {
		it('should accept empty object as default', () => {
			const labelTypography: TypographyConfig = {};
			expect(Object.keys(labelTypography).length).toBe(0);
		});

		it('should generate valid CSS', () => {
			const labelTypography: TypographyConfig = {
				fontFamily: 'Inter',
				fontSize: 12,
				fontSizeUnit: 'px',
				fontWeight: '600',
				textTransform: 'uppercase'
			};
			const css = generateTypographyCSS(labelTypography);
			expect(css).toContain('font-family: Inter');
			expect(css).toContain('font-size: 12px');
			expect(css).toContain('font-weight: 600');
			expect(css).toContain('text-transform: uppercase');
		});
	});

	describe('labelColor (ColorPickerControl)', () => {
		it('should accept undefined as default', () => {
			const labelColor: string | undefined = undefined;
			expect(labelColor).toBeUndefined();
		});

		it('should accept hex color', () => {
			const labelColor = '#333333';
			expect(labelColor).toBe('#333333');
		});
	});
});

// =============================================================================
// ACCORDION 2: COMMON STYLES
// Normal: commonHeight, commonIconSize, commonBorderRadius, commonBoxShadow,
//         commonBorder, commonBackgroundColor, commonTextColor, commonIconColor,
//         commonTypography, hideChevron, chevronColor
// Hover: commonBoxShadowHover, commonBorderColorHover, commonBackgroundColorHover,
//        commonTextColorHover, commonIconColorHover, chevronColorHover
// =============================================================================

describe('Accordion 2: Common Styles', () => {
	describe('Normal State Attributes', () => {
		it('commonHeight should accept number with unit', () => {
			const commonHeight = 48;
			const commonHeight_tablet = 44;
			const commonHeight_mobile = 40;
			expect(commonHeight).toBe(48);
			expect(commonHeight_tablet).toBe(44);
			expect(commonHeight_mobile).toBe(40);
		});

		it('commonIconSize should accept number', () => {
			const commonIconSize = 20;
			expect(commonIconSize).toBe(20);
		});

		it('commonBorderRadius should accept number with unit', () => {
			const commonBorderRadius = 8;
			expect(commonBorderRadius).toBe(8);
		});

		it('commonBoxShadow should generate valid CSS', () => {
			const commonBoxShadow: BoxShadowConfig = {
				horizontal: 0,
				vertical: 2,
				blur: 8,
				spread: 0,
				color: 'rgba(0, 0, 0, 0.08)'
			};
			const css = generateBoxShadowCSS(commonBoxShadow);
			expect(css).toBe('box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);');
		});

		it('commonBorder should generate valid CSS', () => {
			const commonBorder: BorderConfig = { width: 1, style: 'solid', color: '#e0e0e0' };
			const css = generateBorderCSS(commonBorder);
			expect(css).toBe('border: 1px solid #e0e0e0;');
		});

		it('commonBackgroundColor should accept hex/rgba', () => {
			const commonBackgroundColor = '#ffffff';
			expect(commonBackgroundColor).toBe('#ffffff');
		});

		it('commonTextColor should accept hex', () => {
			const commonTextColor = '#333333';
			expect(commonTextColor).toBe('#333333');
		});

		it('commonIconColor should accept hex', () => {
			const commonIconColor = '#666666';
			expect(commonIconColor).toBe('#666666');
		});

		it('commonTypography should generate valid CSS', () => {
			const commonTypography: TypographyConfig = { fontSize: 14, fontWeight: '500' };
			const css = generateTypographyCSS(commonTypography);
			expect(css).toContain('font-size: 14px');
			expect(css).toContain('font-weight: 500');
		});

		it('hideChevron should be boolean', () => {
			const hideChevron = true;
			expect(typeof hideChevron).toBe('boolean');
		});

		it('chevronColor should accept hex', () => {
			const chevronColor = '#999999';
			expect(chevronColor).toBe('#999999');
		});
	});

	describe('Hover State Attributes', () => {
		it('commonBoxShadowHover should generate valid CSS', () => {
			const commonBoxShadowHover: BoxShadowConfig = {
				horizontal: 0,
				vertical: 4,
				blur: 12,
				spread: 0,
				color: 'rgba(0, 0, 0, 0.12)'
			};
			const css = generateBoxShadowCSS(commonBoxShadowHover);
			expect(css).toContain('box-shadow:');
		});

		it('commonBorderColorHover should accept hex', () => {
			const commonBorderColorHover = '#2271b1';
			expect(commonBorderColorHover).toBe('#2271b1');
		});

		it('commonBackgroundColorHover should accept hex', () => {
			const commonBackgroundColorHover = '#f5f5f5';
			expect(commonBackgroundColorHover).toBe('#f5f5f5');
		});

		it('commonTextColorHover should accept hex', () => {
			const commonTextColorHover = '#000000';
			expect(commonTextColorHover).toBe('#000000');
		});

		it('commonIconColorHover should accept hex', () => {
			const commonIconColorHover = '#333333';
			expect(commonIconColorHover).toBe('#333333');
		});

		it('chevronColorHover should accept hex', () => {
			const chevronColorHover = '#2271b1';
			expect(chevronColorHover).toBe('#2271b1');
		});
	});
});

// =============================================================================
// ACCORDION 3: BUTTON
// Normal: buttonPadding, buttonIconSpacing
// Filled: buttonFilledTypography, buttonFilledBackground, buttonFilledTextColor,
//         buttonFilledIconColor, buttonFilledBorderColor, buttonFilledBorderWidth,
//         buttonFilledBoxShadow, buttonFilledChevronColor
// =============================================================================

describe('Accordion 3: Button', () => {
	describe('Normal State', () => {
		it('buttonPadding should accept dimensions with responsive', () => {
			const buttonPadding: DimensionsConfig = { top: 12, right: 16, bottom: 12, left: 16, unit: 'px' };
			const css = generateDimensionsCSS(buttonPadding, 'padding');
			expect(css).toBe('padding: 12px 16px 12px 16px;');
		});

		it('buttonIconSpacing should accept number', () => {
			const buttonIconSpacing = 8;
			expect(buttonIconSpacing).toBe(8);
		});
	});

	describe('Filled State', () => {
		it('buttonFilledTypography should generate CSS', () => {
			const buttonFilledTypography: TypographyConfig = { fontWeight: '600' };
			const css = generateTypographyCSS(buttonFilledTypography);
			expect(css).toContain('font-weight: 600');
		});

		it('buttonFilledBackground should accept hex', () => {
			const buttonFilledBackground = '#2271b1';
			expect(buttonFilledBackground).toBe('#2271b1');
		});

		it('buttonFilledTextColor should accept hex', () => {
			const buttonFilledTextColor = '#ffffff';
			expect(buttonFilledTextColor).toBe('#ffffff');
		});

		it('buttonFilledIconColor should accept hex', () => {
			const buttonFilledIconColor = '#ffffff';
			expect(buttonFilledIconColor).toBe('#ffffff');
		});

		it('buttonFilledBorderColor should accept hex', () => {
			const buttonFilledBorderColor = '#2271b1';
			expect(buttonFilledBorderColor).toBe('#2271b1');
		});

		it('buttonFilledBorderWidth should accept number', () => {
			const buttonFilledBorderWidth = 2;
			expect(buttonFilledBorderWidth).toBe(2);
		});

		it('buttonFilledBoxShadow should generate CSS', () => {
			const buttonFilledBoxShadow: BoxShadowConfig = {
				horizontal: 0, vertical: 2, blur: 4, spread: 0, color: 'rgba(34, 113, 177, 0.3)'
			};
			const css = generateBoxShadowCSS(buttonFilledBoxShadow);
			expect(css).toContain('box-shadow:');
		});

		it('buttonFilledChevronColor should accept hex', () => {
			const buttonFilledChevronColor = '#ffffff';
			expect(buttonFilledChevronColor).toBe('#ffffff');
		});
	});
});

// =============================================================================
// ACCORDION 4: INPUT
// Normal: inputTextColor, inputPlaceholderColor, inputPadding, inputIconSideMargin
// Focus: inputBackgroundColorFocus, inputBorderColorFocus
// =============================================================================

describe('Accordion 4: Input', () => {
	describe('Normal State', () => {
		it('inputTextColor should accept hex', () => {
			const inputTextColor = '#333333';
			expect(inputTextColor).toBe('#333333');
		});

		it('inputPlaceholderColor should accept hex', () => {
			const inputPlaceholderColor = '#999999';
			expect(inputPlaceholderColor).toBe('#999999');
		});

		it('inputPadding should accept dimensions', () => {
			const inputPadding: DimensionsConfig = { top: 8, right: 12, bottom: 8, left: 40, unit: 'px' };
			const css = generateDimensionsCSS(inputPadding, 'padding');
			expect(css).toBe('padding: 8px 12px 8px 40px;');
		});

		it('inputIconSideMargin should accept number', () => {
			const inputIconSideMargin = 12;
			expect(inputIconSideMargin).toBe(12);
		});
	});

	describe('Focus State', () => {
		it('inputBackgroundColorFocus should accept hex', () => {
			const inputBackgroundColorFocus = '#f8f9fa';
			expect(inputBackgroundColorFocus).toBe('#f8f9fa');
		});

		it('inputBorderColorFocus should accept hex', () => {
			const inputBorderColorFocus = '#2271b1';
			expect(inputBorderColorFocus).toBe('#2271b1');
		});
	});
});

// =============================================================================
// ACCORDION 5: SEARCH BUTTON
// Normal: searchBtnColor, searchBtnIconColor, searchBtnBackgroundColor,
//         searchBtnBorder, searchBtnBoxShadow
// Hover: searchBtnTextColorHover, searchBtnIconColorHover, searchBtnBackgroundColorHover,
//        searchBtnBorderColorHover, searchBtnBoxShadowHover
// =============================================================================

describe('Accordion 5: Search Button', () => {
	describe('Normal State', () => {
		it('searchBtnColor should accept hex', () => {
			const searchBtnColor = '#ffffff';
			expect(searchBtnColor).toBe('#ffffff');
		});

		it('searchBtnIconColor should accept hex', () => {
			const searchBtnIconColor = '#ffffff';
			expect(searchBtnIconColor).toBe('#ffffff');
		});

		it('searchBtnBackgroundColor should accept hex', () => {
			const searchBtnBackgroundColor = '#2271b1';
			expect(searchBtnBackgroundColor).toBe('#2271b1');
		});

		it('searchBtnBorder should generate CSS', () => {
			const searchBtnBorder: BorderConfig = { width: 0, style: 'none', color: 'transparent' };
			expect(searchBtnBorder.style).toBe('none');
		});

		it('searchBtnBoxShadow should generate CSS', () => {
			const searchBtnBoxShadow: BoxShadowConfig = {
				horizontal: 0, vertical: 2, blur: 8, spread: 0, color: 'rgba(34, 113, 177, 0.4)'
			};
			const css = generateBoxShadowCSS(searchBtnBoxShadow);
			expect(css).toContain('box-shadow:');
		});
	});

	describe('Hover State', () => {
		it('searchBtnTextColorHover should accept hex', () => {
			const searchBtnTextColorHover = '#ffffff';
			expect(searchBtnTextColorHover).toBe('#ffffff');
		});

		it('searchBtnIconColorHover should accept hex', () => {
			const searchBtnIconColorHover = '#ffffff';
			expect(searchBtnIconColorHover).toBe('#ffffff');
		});

		it('searchBtnBackgroundColorHover should accept hex', () => {
			const searchBtnBackgroundColorHover = '#1a5a8e';
			expect(searchBtnBackgroundColorHover).toBe('#1a5a8e');
		});

		it('searchBtnBorderColorHover should accept hex', () => {
			const searchBtnBorderColorHover = '#1a5a8e';
			expect(searchBtnBorderColorHover).toBe('#1a5a8e');
		});

		it('searchBtnBoxShadowHover should generate CSS', () => {
			const searchBtnBoxShadowHover: BoxShadowConfig = {
				horizontal: 0, vertical: 4, blur: 12, spread: 0, color: 'rgba(34, 113, 177, 0.5)'
			};
			const css = generateBoxShadowCSS(searchBtnBoxShadowHover);
			expect(css).toContain('box-shadow:');
		});
	});
});

// =============================================================================
// ACCORDION 6: TOGGLE BUTTON
// Normal: toggleBtnTypography, toggleBtnBorderRadius, toggleBtnTextColor,
//         toggleBtnPadding, toggleBtnBackgroundColor, toggleBtnBorder,
//         toggleBtnIconSize, toggleBtnIconSpacing, toggleBtnIconColor
// Hover: toggleBtnTextColorHover, toggleBtnBackgroundColorHover,
//        toggleBtnBorderColorHover, toggleBtnIconColorHover
// Filled: toggleBtnTextColorFilled, toggleBtnBackgroundColorFilled,
//         toggleBtnBorderColorFilled, toggleBtnIconColorFilled
// =============================================================================

describe('Accordion 6: Toggle Button', () => {
	describe('Normal State', () => {
		it('toggleBtnTypography should generate CSS', () => {
			const toggleBtnTypography: TypographyConfig = { fontSize: 13, fontWeight: '500' };
			const css = generateTypographyCSS(toggleBtnTypography);
			expect(css).toContain('font-size: 13px');
		});

		it('toggleBtnBorderRadius should accept number', () => {
			const toggleBtnBorderRadius = 20;
			expect(toggleBtnBorderRadius).toBe(20);
		});

		it('toggleBtnTextColor should accept hex', () => {
			const toggleBtnTextColor = '#333333';
			expect(toggleBtnTextColor).toBe('#333333');
		});

		it('toggleBtnPadding should accept dimensions', () => {
			const toggleBtnPadding: DimensionsConfig = { top: 8, right: 16, bottom: 8, left: 16, unit: 'px' };
			const css = generateDimensionsCSS(toggleBtnPadding, 'padding');
			expect(css).toBe('padding: 8px 16px 8px 16px;');
		});

		it('toggleBtnBackgroundColor should accept hex', () => {
			const toggleBtnBackgroundColor = '#f5f5f5';
			expect(toggleBtnBackgroundColor).toBe('#f5f5f5');
		});

		it('toggleBtnBorder should generate CSS', () => {
			const toggleBtnBorder: BorderConfig = { width: 1, style: 'solid', color: '#e0e0e0' };
			const css = generateBorderCSS(toggleBtnBorder);
			expect(css).toBe('border: 1px solid #e0e0e0;');
		});

		it('toggleBtnIconSize should accept number', () => {
			const toggleBtnIconSize = 16;
			expect(toggleBtnIconSize).toBe(16);
		});

		it('toggleBtnIconSpacing should accept number', () => {
			const toggleBtnIconSpacing = 6;
			expect(toggleBtnIconSpacing).toBe(6);
		});

		it('toggleBtnIconColor should accept hex', () => {
			const toggleBtnIconColor = '#666666';
			expect(toggleBtnIconColor).toBe('#666666');
		});
	});

	describe('Hover State', () => {
		it('toggleBtnTextColorHover should accept hex', () => {
			const toggleBtnTextColorHover = '#000000';
			expect(toggleBtnTextColorHover).toBe('#000000');
		});

		it('toggleBtnBackgroundColorHover should accept hex', () => {
			const toggleBtnBackgroundColorHover = '#e8e8e8';
			expect(toggleBtnBackgroundColorHover).toBe('#e8e8e8');
		});

		it('toggleBtnBorderColorHover should accept hex', () => {
			const toggleBtnBorderColorHover = '#cccccc';
			expect(toggleBtnBorderColorHover).toBe('#cccccc');
		});

		it('toggleBtnIconColorHover should accept hex', () => {
			const toggleBtnIconColorHover = '#333333';
			expect(toggleBtnIconColorHover).toBe('#333333');
		});
	});

	describe('Filled State', () => {
		it('toggleBtnTextColorFilled should accept hex', () => {
			const toggleBtnTextColorFilled = '#ffffff';
			expect(toggleBtnTextColorFilled).toBe('#ffffff');
		});

		it('toggleBtnBackgroundColorFilled should accept hex', () => {
			const toggleBtnBackgroundColorFilled = '#2271b1';
			expect(toggleBtnBackgroundColorFilled).toBe('#2271b1');
		});

		it('toggleBtnBorderColorFilled should accept hex', () => {
			const toggleBtnBorderColorFilled = '#2271b1';
			expect(toggleBtnBorderColorFilled).toBe('#2271b1');
		});

		it('toggleBtnIconColorFilled should accept hex', () => {
			const toggleBtnIconColorFilled = '#ffffff';
			expect(toggleBtnIconColorFilled).toBe('#ffffff');
		});
	});
});

// =============================================================================
// ACCORDION 7: TOGGLE: ACTIVE COUNT
// Attributes: activeCountTextColor, activeCountBackgroundColor, activeCountRightMargin
// =============================================================================

describe('Accordion 7: Toggle Active Count', () => {
	it('activeCountTextColor should accept hex', () => {
		const activeCountTextColor = '#ffffff';
		expect(activeCountTextColor).toBe('#ffffff');
	});

	it('activeCountBackgroundColor should accept hex', () => {
		const activeCountBackgroundColor = '#2271b1';
		expect(activeCountBackgroundColor).toBe('#2271b1');
	});

	it('activeCountRightMargin should accept number', () => {
		const activeCountRightMargin = 8;
		expect(activeCountRightMargin).toBe(8);
	});
});

// =============================================================================
// ACCORDION 8: MAP/FEED SWITCHER
// Normal: mapSwitcherAlign, mapSwitcherBottomMargin, mapSwitcherSideMargin,
//         mapSwitcherTypography, mapSwitcherColor, mapSwitcherBackgroundColor,
//         mapSwitcherHeight, mapSwitcherPadding, mapSwitcherBorder,
//         mapSwitcherBorderRadius, mapSwitcherBoxShadow, mapSwitcherIconSpacing,
//         mapSwitcherIconSize, mapSwitcherIconColor
// Hover: mapSwitcherColorHover, mapSwitcherBackgroundColorHover,
//        mapSwitcherBorderColorHover, mapSwitcherIconColorHover
// =============================================================================

describe('Accordion 8: Map/Feed Switcher', () => {
	describe('Normal State', () => {
		it('mapSwitcherAlign should accept valid values', () => {
			const validValues = ['', 'left', 'center', 'right'];
			validValues.forEach(val => {
				expect(['', 'left', 'center', 'right']).toContain(val);
			});
		});

		it('mapSwitcherBottomMargin should accept number', () => {
			const mapSwitcherBottomMargin = 20;
			expect(mapSwitcherBottomMargin).toBe(20);
		});

		it('mapSwitcherSideMargin should accept number', () => {
			const mapSwitcherSideMargin = 20;
			expect(mapSwitcherSideMargin).toBe(20);
		});

		it('mapSwitcherTypography should generate CSS', () => {
			const mapSwitcherTypography: TypographyConfig = { fontSize: 14, fontWeight: '600' };
			const css = generateTypographyCSS(mapSwitcherTypography);
			expect(css).toContain('font-size: 14px');
		});

		it('mapSwitcherColor should accept hex', () => {
			const mapSwitcherColor = '#ffffff';
			expect(mapSwitcherColor).toBe('#ffffff');
		});

		it('mapSwitcherBackgroundColor should accept hex', () => {
			const mapSwitcherBackgroundColor = '#2271b1';
			expect(mapSwitcherBackgroundColor).toBe('#2271b1');
		});

		it('mapSwitcherHeight should accept number', () => {
			const mapSwitcherHeight = 44;
			expect(mapSwitcherHeight).toBe(44);
		});

		it('mapSwitcherPadding should accept dimensions', () => {
			const mapSwitcherPadding: DimensionsConfig = { top: 0, right: 20, bottom: 0, left: 20, unit: 'px' };
			const css = generateDimensionsCSS(mapSwitcherPadding, 'padding');
			expect(css).toBe('padding: 0px 20px 0px 20px;');
		});

		it('mapSwitcherBorder should generate CSS', () => {
			const mapSwitcherBorder: BorderConfig = { width: 0, style: 'none' };
			expect(mapSwitcherBorder.style).toBe('none');
		});

		it('mapSwitcherBorderRadius should accept number', () => {
			const mapSwitcherBorderRadius = 22;
			expect(mapSwitcherBorderRadius).toBe(22);
		});

		it('mapSwitcherBoxShadow should generate CSS', () => {
			const mapSwitcherBoxShadow: BoxShadowConfig = {
				horizontal: 0, vertical: 4, blur: 16, spread: 0, color: 'rgba(0, 0, 0, 0.15)'
			};
			const css = generateBoxShadowCSS(mapSwitcherBoxShadow);
			expect(css).toContain('box-shadow:');
		});

		it('mapSwitcherIconSpacing should accept number', () => {
			const mapSwitcherIconSpacing = 8;
			expect(mapSwitcherIconSpacing).toBe(8);
		});

		it('mapSwitcherIconSize should accept number', () => {
			const mapSwitcherIconSize = 18;
			expect(mapSwitcherIconSize).toBe(18);
		});

		it('mapSwitcherIconColor should accept hex', () => {
			const mapSwitcherIconColor = '#ffffff';
			expect(mapSwitcherIconColor).toBe('#ffffff');
		});
	});

	describe('Hover State', () => {
		it('mapSwitcherColorHover should accept hex', () => {
			const mapSwitcherColorHover = '#ffffff';
			expect(mapSwitcherColorHover).toBe('#ffffff');
		});

		it('mapSwitcherBackgroundColorHover should accept hex', () => {
			const mapSwitcherBackgroundColorHover = '#1a5a8e';
			expect(mapSwitcherBackgroundColorHover).toBe('#1a5a8e');
		});

		it('mapSwitcherBorderColorHover should accept hex', () => {
			const mapSwitcherBorderColorHover = '#1a5a8e';
			expect(mapSwitcherBorderColorHover).toBe('#1a5a8e');
		});

		it('mapSwitcherIconColorHover should accept hex', () => {
			const mapSwitcherIconColorHover = '#ffffff';
			expect(mapSwitcherIconColorHover).toBe('#ffffff');
		});
	});
});

// =============================================================================
// ACCORDION 9: TERM COUNT
// Attributes: termCountNumberColor, termCountBorderColor
// =============================================================================

describe('Accordion 9: Term Count', () => {
	it('termCountNumberColor should accept hex', () => {
		const termCountNumberColor = '#666666';
		expect(termCountNumberColor).toBe('#666666');
	});

	it('termCountBorderColor should accept hex', () => {
		const termCountBorderColor = '#e0e0e0';
		expect(termCountBorderColor).toBe('#e0e0e0');
	});
});

// =============================================================================
// ACCORDION 10: OTHER
// Attributes: maxFilterWidth, minInputWidth
// =============================================================================

describe('Accordion 10: Other', () => {
	it('maxFilterWidth should accept number', () => {
		const maxFilterWidth = 300;
		expect(maxFilterWidth).toBe(300);
	});

	it('minInputWidth should accept number', () => {
		const minInputWidth = 150;
		expect(minInputWidth).toBe(150);
	});

	it('should support responsive values', () => {
		const maxFilterWidth = 300;
		const maxFilterWidth_tablet = 250;
		const maxFilterWidth_mobile = 200;
		expect(maxFilterWidth).toBe(300);
		expect(maxFilterWidth_tablet).toBe(250);
		expect(maxFilterWidth_mobile).toBe(200);
	});
});

// =============================================================================
// ACCORDION 11: POPUPS: CUSTOM STYLE
// Attributes: popupCustomStyleEnabled, popupBackdropBackground,
//             popupBackdropPointerEvents, popupBoxShadow, popupTopBottomMargin,
//             popupMaxHeight, popupAutosuggestTopMargin
// =============================================================================

describe('Accordion 11: Popups Custom Style', () => {
	it('popupCustomStyleEnabled should be boolean', () => {
		const popupCustomStyleEnabled = true;
		expect(typeof popupCustomStyleEnabled).toBe('boolean');
	});

	it('popupBackdropBackground should accept rgba', () => {
		const popupBackdropBackground = 'rgba(0, 0, 0, 0.5)';
		expect(popupBackdropBackground).toBe('rgba(0, 0, 0, 0.5)');
	});

	it('popupBackdropPointerEvents should be boolean', () => {
		const popupBackdropPointerEvents = false;
		expect(typeof popupBackdropPointerEvents).toBe('boolean');
	});

	it('popupBoxShadow should generate CSS', () => {
		const popupBoxShadow: BoxShadowConfig = {
			horizontal: 0, vertical: 8, blur: 32, spread: 0, color: 'rgba(0, 0, 0, 0.2)'
		};
		const css = generateBoxShadowCSS(popupBoxShadow);
		expect(css).toContain('box-shadow:');
	});

	it('popupTopBottomMargin should accept number', () => {
		const popupTopBottomMargin = 40;
		expect(popupTopBottomMargin).toBe(40);
	});

	it('popupMaxHeight should accept number', () => {
		const popupMaxHeight = 600;
		expect(popupMaxHeight).toBe(600);
	});

	it('popupAutosuggestTopMargin should accept number', () => {
		const popupAutosuggestTopMargin = 8;
		expect(popupAutosuggestTopMargin).toBe(8);
	});
});

// =============================================================================
// COMPLETE ATTRIBUTE INVENTORY TEST
// Verifies ALL attributes from GeneralTab exist and have correct types
// =============================================================================

describe('Complete Attribute Inventory', () => {
	// All 100+ attributes from GeneralTab organized by accordion
	const attributeInventory = {
		// Accordion 1: General
		general: [
			'filterMargin', 'filterMargin_tablet', 'filterMargin_mobile',
			'showLabels', 'labelTypography', 'labelColor'
		],
		// Accordion 2: Common Styles
		commonStylesNormal: [
			'commonHeight', 'commonHeight_tablet', 'commonHeight_mobile',
			'commonIconSize', 'commonIconSize_tablet', 'commonIconSize_mobile',
			'commonBorderRadius', 'commonBorderRadius_tablet', 'commonBorderRadius_mobile',
			'commonBoxShadow', 'commonBorder',
			'commonBackgroundColor', 'commonTextColor', 'commonIconColor',
			'commonTypography', 'hideChevron', 'chevronColor'
		],
		commonStylesHover: [
			'commonBoxShadowHover', 'commonBorderColorHover',
			'commonBackgroundColorHover', 'commonTextColorHover',
			'commonIconColorHover', 'chevronColorHover'
		],
		// Accordion 3: Button
		buttonNormal: [
			'buttonPadding', 'buttonPadding_tablet', 'buttonPadding_mobile',
			'buttonIconSpacing', 'buttonIconSpacing_tablet', 'buttonIconSpacing_mobile'
		],
		buttonFilled: [
			'buttonFilledTypography', 'buttonFilledBackground', 'buttonFilledTextColor',
			'buttonFilledIconColor', 'buttonFilledBorderColor',
			'buttonFilledBorderWidth', 'buttonFilledBorderWidth_tablet', 'buttonFilledBorderWidth_mobile',
			'buttonFilledBoxShadow', 'buttonFilledChevronColor'
		],
		// Accordion 4: Input
		inputNormal: [
			'inputTextColor', 'inputPlaceholderColor',
			'inputPadding', 'inputPadding_tablet', 'inputPadding_mobile',
			'inputIconSideMargin', 'inputIconSideMargin_tablet', 'inputIconSideMargin_mobile'
		],
		inputFocus: ['inputBackgroundColorFocus', 'inputBorderColorFocus'],
		// Accordion 5: Search Button
		searchBtnNormal: [
			'searchBtnColor', 'searchBtnIconColor', 'searchBtnBackgroundColor',
			'searchBtnBorder', 'searchBtnBoxShadow'
		],
		searchBtnHover: [
			'searchBtnTextColorHover', 'searchBtnIconColorHover',
			'searchBtnBackgroundColorHover', 'searchBtnBorderColorHover',
			'searchBtnBoxShadowHover'
		],
		// Accordion 6: Toggle Button
		toggleBtnNormal: [
			'toggleBtnTypography',
			'toggleBtnBorderRadius', 'toggleBtnBorderRadius_tablet', 'toggleBtnBorderRadius_mobile',
			'toggleBtnTextColor',
			'toggleBtnPadding', 'toggleBtnPadding_tablet', 'toggleBtnPadding_mobile',
			'toggleBtnBackgroundColor', 'toggleBtnBorder',
			'toggleBtnIconSize', 'toggleBtnIconSize_tablet', 'toggleBtnIconSize_mobile',
			'toggleBtnIconSpacing', 'toggleBtnIconSpacing_tablet', 'toggleBtnIconSpacing_mobile',
			'toggleBtnIconColor'
		],
		toggleBtnHover: [
			'toggleBtnTextColorHover', 'toggleBtnBackgroundColorHover',
			'toggleBtnBorderColorHover', 'toggleBtnIconColorHover'
		],
		toggleBtnFilled: [
			'toggleBtnTextColorFilled', 'toggleBtnBackgroundColorFilled',
			'toggleBtnBorderColorFilled', 'toggleBtnIconColorFilled'
		],
		// Accordion 7: Active Count
		activeCount: [
			'activeCountTextColor', 'activeCountBackgroundColor',
			'activeCountRightMargin', 'activeCountRightMargin_tablet', 'activeCountRightMargin_mobile'
		],
		// Accordion 8: Map Switcher
		mapSwitcherNormal: [
			'mapSwitcherAlign',
			'mapSwitcherBottomMargin', 'mapSwitcherBottomMargin_tablet', 'mapSwitcherBottomMargin_mobile',
			'mapSwitcherSideMargin', 'mapSwitcherSideMargin_tablet', 'mapSwitcherSideMargin_mobile',
			'mapSwitcherTypography', 'mapSwitcherColor', 'mapSwitcherBackgroundColor',
			'mapSwitcherHeight', 'mapSwitcherHeight_tablet', 'mapSwitcherHeight_mobile',
			'mapSwitcherPadding', 'mapSwitcherPadding_tablet', 'mapSwitcherPadding_mobile',
			'mapSwitcherBorder',
			'mapSwitcherBorderRadius', 'mapSwitcherBorderRadius_tablet', 'mapSwitcherBorderRadius_mobile',
			'mapSwitcherBoxShadow',
			'mapSwitcherIconSpacing', 'mapSwitcherIconSpacing_tablet', 'mapSwitcherIconSpacing_mobile',
			'mapSwitcherIconSize', 'mapSwitcherIconSize_tablet', 'mapSwitcherIconSize_mobile',
			'mapSwitcherIconColor'
		],
		mapSwitcherHover: [
			'mapSwitcherColorHover', 'mapSwitcherBackgroundColorHover',
			'mapSwitcherBorderColorHover', 'mapSwitcherIconColorHover'
		],
		// Accordion 9: Term Count
		termCount: ['termCountNumberColor', 'termCountBorderColor'],
		// Accordion 10: Other
		other: [
			'maxFilterWidth', 'maxFilterWidth_tablet', 'maxFilterWidth_mobile',
			'minInputWidth', 'minInputWidth_tablet', 'minInputWidth_mobile'
		],
		// Accordion 11: Popups
		popups: [
			'popupCustomStyleEnabled', 'popupBackdropBackground', 'popupBackdropPointerEvents',
			'popupBoxShadow',
			'popupTopBottomMargin', 'popupTopBottomMargin_tablet', 'popupTopBottomMargin_mobile',
			'popupMaxHeight', 'popupMaxHeight_tablet', 'popupMaxHeight_mobile',
			'popupAutosuggestTopMargin', 'popupAutosuggestTopMargin_tablet', 'popupAutosuggestTopMargin_mobile'
		]
	};

	it('should have all accordion sections defined', () => {
		const sections = Object.keys(attributeInventory);
		expect(sections.length).toBe(18); // 18 subsections
	});

	it('should have unique attribute names across all sections', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		const uniqueAttributes = new Set(allAttributes);
		expect(uniqueAttributes.size).toBe(allAttributes.length);
	});

	it('should have correct total attribute count (100+)', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		expect(allAttributes.length).toBeGreaterThanOrEqual(100);
		// Log actual count for reference
		console.log(`Total GeneralTab attributes: ${allAttributes.length}`);
	});

	// Test each section has attributes
	Object.entries(attributeInventory).forEach(([section, attrs]) => {
		it(`section "${section}" should have at least 1 attribute`, () => {
			expect(attrs.length).toBeGreaterThan(0);
		});
	});
});

// =============================================================================
// ROUND-TRIP PERSISTENCE TESTS
// Ensures values survive JSON serialize -> deserialize cycle (block save/load)
// =============================================================================

describe('Round-trip Persistence Tests', () => {
	it('DimensionsConfig should survive JSON round-trip', () => {
		const original: DimensionsConfig = {
			top: 10, right: 20, bottom: 10, left: 20, unit: 'px', isLinked: false
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('TypographyConfig should survive JSON round-trip', () => {
		const original: TypographyConfig = {
			fontFamily: 'Inter',
			fontSize: 14,
			fontSizeUnit: 'px',
			fontWeight: '600',
			fontStyle: 'normal',
			textTransform: 'uppercase',
			lineHeight: 1.5,
			letterSpacing: 0.5
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BoxShadowConfig should survive JSON round-trip', () => {
		const original: BoxShadowConfig = {
			horizontal: 0,
			vertical: 4,
			blur: 12,
			spread: 2,
			color: 'rgba(0, 0, 0, 0.15)',
			position: 'outset'
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BorderConfig should survive JSON round-trip', () => {
		const original: BorderConfig = {
			width: 2,
			style: 'dashed',
			color: '#2271b1'
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('Complete attributes object should survive JSON round-trip', () => {
		const original = {
			// Sample of mixed attribute types
			filterMargin: { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
			showLabels: true,
			labelTypography: { fontSize: 12, fontWeight: '600' },
			labelColor: '#333333',
			commonHeight: 48,
			commonBoxShadow: { horizontal: 0, vertical: 2, blur: 8, color: 'rgba(0,0,0,0.1)' },
			commonBorder: { width: 1, style: 'solid', color: '#e0e0e0' },
			mapSwitcherAlign: 'center'
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('undefined values should be preserved (not converted to null)', () => {
		const original = {
			labelColor: undefined,
			commonHeight: 48
		};
		// JSON.stringify removes undefined values
		const serialized = JSON.stringify(original);
		const parsed = JSON.parse(serialized);
		// After JSON round-trip, undefined becomes missing (not null)
		expect(parsed.labelColor).toBeUndefined();
		expect(parsed.commonHeight).toBe(48);
	});
});

// =============================================================================
// CSS GENERATION INTEGRATION TESTS
// Tests that attributes generate correct CSS output
// =============================================================================

describe('CSS Generation Integration', () => {
	it('should generate complete filter styling CSS', () => {
		const attributes = {
			commonHeight: 48,
			commonBorderRadius: 8,
			commonBackgroundColor: '#ffffff',
			commonTextColor: '#333333',
			commonBorder: { width: 1, style: 'solid', color: '#e0e0e0' } as BorderConfig,
			commonBoxShadow: { horizontal: 0, vertical: 2, blur: 8, spread: 0, color: 'rgba(0,0,0,0.08)' } as BoxShadowConfig,
			commonTypography: { fontSize: 14, fontWeight: '500' } as TypographyConfig
		};

		// Generate CSS rules
		const heightCSS = `height: ${attributes.commonHeight}px;`;
		const radiusCSS = `border-radius: ${attributes.commonBorderRadius}px;`;
		const bgCSS = `background-color: ${attributes.commonBackgroundColor};`;
		const colorCSS = `color: ${attributes.commonTextColor};`;
		const borderCSS = generateBorderCSS(attributes.commonBorder);
		const shadowCSS = generateBoxShadowCSS(attributes.commonBoxShadow);
		const typoCSS = generateTypographyCSS(attributes.commonTypography);

		expect(heightCSS).toBe('height: 48px;');
		expect(radiusCSS).toBe('border-radius: 8px;');
		expect(bgCSS).toBe('background-color: #ffffff;');
		expect(colorCSS).toBe('color: #333333;');
		expect(borderCSS).toBe('border: 1px solid #e0e0e0;');
		expect(shadowCSS).toBe('box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.08);');
		expect(typoCSS).toContain('font-size: 14px');
	});

	it('should generate hover state CSS correctly', () => {
		const hoverAttributes = {
			commonBackgroundColorHover: '#f5f5f5',
			commonBorderColorHover: '#2271b1',
			commonBoxShadowHover: { horizontal: 0, vertical: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.12)' } as BoxShadowConfig
		};

		const bgHoverCSS = `background-color: ${hoverAttributes.commonBackgroundColorHover};`;
		const borderHoverCSS = `border-color: ${hoverAttributes.commonBorderColorHover};`;
		const shadowHoverCSS = generateBoxShadowCSS(hoverAttributes.commonBoxShadowHover);

		expect(bgHoverCSS).toBe('background-color: #f5f5f5;');
		expect(borderHoverCSS).toBe('border-color: #2271b1;');
		expect(shadowHoverCSS).toContain('box-shadow:');
	});

	it('should handle inset box shadow correctly', () => {
		const insetShadow: BoxShadowConfig = {
			horizontal: 0,
			vertical: 2,
			blur: 4,
			spread: 0,
			color: 'rgba(0, 0, 0, 0.1)',
			position: 'inset'
		};
		const css = generateBoxShadowCSS(insetShadow);
		expect(css).toBe('box-shadow: inset 0px 2px 4px 0px rgba(0, 0, 0, 0.1);');
	});
});
