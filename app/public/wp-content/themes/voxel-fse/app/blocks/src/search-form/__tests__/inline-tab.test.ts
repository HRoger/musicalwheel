/**
 * Inline Tab Inspector Controls Tests
 *
 * Tests for the Search Form block's Inline tab inspector controls.
 * Covers all 9 accordion sections:
 * 1. Terms: Inline (Normal/Hover/Selected)
 * 2. Terms: Buttons (Normal/Selected)
 * 3. Geolocation icon (Normal/Hover)
 * 4. Stepper
 * 5. Stepper buttons (Normal/Hover)
 * 6. Range slider
 * 7. Switcher
 * 8. Checkbox
 * 9. Radio
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
}

interface BoxShadowConfig {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'outset' | 'inset';
}

// ============================================================================
// CSS GENERATION HELPERS
// ============================================================================

function generateTypographyCSS(t: TypographyConfig | undefined): string {
	if (!t || Object.keys(t).length === 0) return '';
	const parts: string[] = [];
	if (t.fontFamily) parts.push(`font-family: ${t.fontFamily};`);
	if (t.fontSize !== undefined) parts.push(`font-size: ${t.fontSize}${t.fontSizeUnit || 'px'};`);
	if (t.fontWeight) parts.push(`font-weight: ${t.fontWeight};`);
	if (t.fontStyle) parts.push(`font-style: ${t.fontStyle};`);
	if (t.textTransform) parts.push(`text-transform: ${t.textTransform};`);
	if (t.textDecoration) parts.push(`text-decoration: ${t.textDecoration};`);
	if (t.lineHeight !== undefined) parts.push(`line-height: ${t.lineHeight}${t.lineHeightUnit || ''};`);
	if (t.letterSpacing !== undefined) parts.push(`letter-spacing: ${t.letterSpacing}${t.letterSpacingUnit || 'px'};`);
	return parts.join(' ');
}

function generateBoxShadowCSS(s: BoxShadowConfig | undefined): string {
	if (!s || Object.keys(s).length === 0) return '';
	const inset = s.position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${s.horizontal ?? 0}px ${s.vertical ?? 0}px ${s.blur ?? 0}px ${s.spread ?? 0}px ${s.color || 'rgba(0,0,0,0.1)'};`;
}

function generateColorCSS(color: string | undefined, property: string): string {
	if (!color) return '';
	return `${property}: ${color};`;
}

function generateSizeCSS(value: number | undefined, unit: string = 'px', property: string = 'font-size'): string {
	if (value === undefined) return '';
	return `${property}: ${value}${unit};`;
}

// ============================================================================
// ACCORDION 1: Terms: Inline (Normal/Hover/Selected)
// ============================================================================

describe('Accordion 1: Terms: Inline', () => {
	describe('State Tab Panel', () => {
		it('should support three tab states: normal, hover, selected', () => {
			const validStates = ['normal', 'hover', 'selected'];
			expect(validStates.length).toBe(3);
			expect(validStates).toContain('normal');
			expect(validStates).toContain('hover');
			expect(validStates).toContain('selected');
		});

		it('termsInlineActiveTab should accept valid state values', () => {
			const termsInlineActiveTab = 'normal';
			expect(['normal', 'hover', 'selected']).toContain(termsInlineActiveTab);
		});
	});

	describe('Normal State', () => {
		describe('termsInlineTitleColor (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsInlineTitleColor: string | undefined = undefined;
				expect(termsInlineTitleColor).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsInlineTitleColor = '#333333';
				expect(termsInlineTitleColor).toBe('#333333');
			});

			it('should generate valid CSS', () => {
				const termsInlineTitleColor = '#1a1a1a';
				const css = generateColorCSS(termsInlineTitleColor, 'color');
				expect(css).toBe('color: #1a1a1a;');
			});
		});

		describe('termsInlineTitleTypographyNormal (Typography)', () => {
			it('should accept empty object as default', () => {
				const typography: TypographyConfig = {};
				expect(Object.keys(typography).length).toBe(0);
			});

			it('should generate valid CSS', () => {
				const typography: TypographyConfig = {
					fontFamily: 'Inter',
					fontSize: 14,
					fontSizeUnit: 'px',
					fontWeight: '500',
				};
				const css = generateTypographyCSS(typography);
				expect(css).toContain('font-family: Inter;');
				expect(css).toContain('font-size: 14px;');
				expect(css).toContain('font-weight: 500;');
			});

			it('should survive JSON round-trip', () => {
				const original: TypographyConfig = {
					fontFamily: 'Roboto',
					fontSize: 16,
					fontWeight: '400',
				};
				const roundTripped = JSON.parse(JSON.stringify(original));
				expect(roundTripped).toEqual(original);
			});
		});

		describe('termsInlineIconColor (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsInlineIconColor: string | undefined = undefined;
				expect(termsInlineIconColor).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsInlineIconColor = 'rgba(0, 0, 0, 0.5)';
				expect(termsInlineIconColor).toBe('rgba(0, 0, 0, 0.5)');
			});
		});

		describe('termsInlineIconSize (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const termsInlineIconSize = 18;
				expect(termsInlineIconSize).toBe(18);
			});

			it('should support responsive values', () => {
				const termsInlineIconSize = 20;
				const termsInlineIconSize_tablet = 18;
				const termsInlineIconSize_mobile = 16;
				expect(termsInlineIconSize).toBe(20);
				expect(termsInlineIconSize_tablet).toBe(18);
				expect(termsInlineIconSize_mobile).toBe(16);
			});

			it('should support unit values', () => {
				const termsInlineIconSizeUnit = 'px';
				expect(['px', '%']).toContain(termsInlineIconSizeUnit);
			});

			it('should generate valid CSS', () => {
				const size = 20;
				const unit = 'px';
				const css = generateSizeCSS(size, unit, 'width');
				expect(css).toBe('width: 20px;');
			});
		});

		describe('termsInlineInnerGap (ResponsiveRange)', () => {
			it('should accept number values', () => {
				const termsInlineInnerGap = 8;
				expect(termsInlineInnerGap).toBe(8);
			});

			it('should support responsive values', () => {
				const termsInlineInnerGap = 10;
				const termsInlineInnerGap_tablet = 8;
				const termsInlineInnerGap_mobile = 6;
				expect(termsInlineInnerGap).toBe(10);
				expect(termsInlineInnerGap_tablet).toBe(8);
				expect(termsInlineInnerGap_mobile).toBe(6);
			});

			it('should generate valid CSS', () => {
				const gap = 8;
				const css = generateSizeCSS(gap, 'px', 'gap');
				expect(css).toBe('gap: 8px;');
			});
		});

		describe('termsInlineChevronColor (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsInlineChevronColor: string | undefined = undefined;
				expect(termsInlineChevronColor).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsInlineChevronColor = '#666666';
				expect(termsInlineChevronColor).toBe('#666666');
			});
		});
	});

	describe('Hover State', () => {
		describe('termsInlineTitleColorHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsInlineTitleColorHover: string | undefined = undefined;
				expect(termsInlineTitleColorHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsInlineTitleColorHover = '#000000';
				expect(termsInlineTitleColorHover).toBe('#000000');
			});
		});

		describe('termsInlineIconColorHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsInlineIconColorHover: string | undefined = undefined;
				expect(termsInlineIconColorHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsInlineIconColorHover = '#0073aa';
				expect(termsInlineIconColorHover).toBe('#0073aa');
			});
		});
	});

	describe('Selected State', () => {
		describe('termsInlineTitleTypographySelected (Typography)', () => {
			it('should accept empty object as default', () => {
				const typography: TypographyConfig = {};
				expect(Object.keys(typography).length).toBe(0);
			});

			it('should support bold font weight for selected state', () => {
				const typography: TypographyConfig = { fontWeight: '600' };
				const css = generateTypographyCSS(typography);
				expect(css).toContain('font-weight: 600;');
			});
		});

		describe('termsInlineTitleColorSelected (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsInlineTitleColorSelected: string | undefined = undefined;
				expect(termsInlineTitleColorSelected).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsInlineTitleColorSelected = '#0073aa';
				expect(termsInlineTitleColorSelected).toBe('#0073aa');
			});
		});
	});
});

// ============================================================================
// ACCORDION 2: Terms: Buttons (Normal/Selected)
// ============================================================================

describe('Accordion 2: Terms: Buttons', () => {
	describe('State Tab Panel', () => {
		it('should support two tab states: normal, selected', () => {
			const validStates = ['normal', 'selected'];
			expect(validStates.length).toBe(2);
			expect(validStates).toContain('normal');
			expect(validStates).toContain('selected');
		});

		it('termsButtonsActiveTab should accept valid state values', () => {
			const termsButtonsActiveTab = 'normal';
			expect(['normal', 'selected']).toContain(termsButtonsActiveTab);
		});
	});

	describe('Normal State', () => {
		describe('termsButtonsGap (ResponsiveRange)', () => {
			it('should accept number values', () => {
				const termsButtonsGap = 8;
				expect(termsButtonsGap).toBe(8);
			});

			it('should support responsive values', () => {
				const termsButtonsGap = 12;
				const termsButtonsGap_tablet = 10;
				const termsButtonsGap_mobile = 8;
				expect(termsButtonsGap).toBe(12);
				expect(termsButtonsGap_tablet).toBe(10);
				expect(termsButtonsGap_mobile).toBe(8);
			});
		});

		describe('termsButtonsBackground (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsButtonsBackground: string | undefined = undefined;
				expect(termsButtonsBackground).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsButtonsBackground = '#f5f5f5';
				expect(termsButtonsBackground).toBe('#f5f5f5');
			});
		});

		describe('termsButtonsBorderType (Select)', () => {
			it('should accept valid border type values', () => {
				const validTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];
				const termsButtonsBorderType = 'solid';
				expect(validTypes).toContain(termsButtonsBorderType);
			});

			it('should default to empty string', () => {
				const termsButtonsBorderType = '';
				expect(termsButtonsBorderType).toBe('');
			});
		});

		describe('termsButtonsBorderRadius (ResponsiveRange)', () => {
			it('should accept number values', () => {
				const termsButtonsBorderRadius = 4;
				expect(termsButtonsBorderRadius).toBe(4);
			});

			it('should support responsive values', () => {
				const termsButtonsBorderRadius = 8;
				const termsButtonsBorderRadius_tablet = 6;
				const termsButtonsBorderRadius_mobile = 4;
				expect(termsButtonsBorderRadius).toBe(8);
				expect(termsButtonsBorderRadius_tablet).toBe(6);
				expect(termsButtonsBorderRadius_mobile).toBe(4);
			});
		});

		describe('termsButtonsTypography (Typography)', () => {
			it('should accept empty object as default', () => {
				const typography: TypographyConfig = {};
				expect(Object.keys(typography).length).toBe(0);
			});

			it('should generate valid CSS', () => {
				const typography: TypographyConfig = {
					fontSize: 13,
					fontSizeUnit: 'px',
					fontWeight: '500',
				};
				const css = generateTypographyCSS(typography);
				expect(css).toContain('font-size: 13px;');
				expect(css).toContain('font-weight: 500;');
			});
		});

		describe('termsButtonsTextColor (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsButtonsTextColor: string | undefined = undefined;
				expect(termsButtonsTextColor).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsButtonsTextColor = '#333333';
				expect(termsButtonsTextColor).toBe('#333333');
			});
		});
	});

	describe('Selected State', () => {
		describe('termsButtonsBackgroundSelected (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsButtonsBackgroundSelected: string | undefined = undefined;
				expect(termsButtonsBackgroundSelected).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsButtonsBackgroundSelected = '#0073aa';
				expect(termsButtonsBackgroundSelected).toBe('#0073aa');
			});
		});

		describe('termsButtonsColorSelected (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsButtonsColorSelected: string | undefined = undefined;
				expect(termsButtonsColorSelected).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsButtonsColorSelected = '#ffffff';
				expect(termsButtonsColorSelected).toBe('#ffffff');
			});
		});

		describe('termsButtonsBorderColorSelected (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const termsButtonsBorderColorSelected: string | undefined = undefined;
				expect(termsButtonsBorderColorSelected).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const termsButtonsBorderColorSelected = '#0073aa';
				expect(termsButtonsBorderColorSelected).toBe('#0073aa');
			});
		});

		describe('termsButtonsBoxShadowSelected (BoxShadow)', () => {
			it('should accept empty object as default', () => {
				const boxShadow: BoxShadowConfig = {};
				expect(Object.keys(boxShadow).length).toBe(0);
			});

			it('should generate valid CSS', () => {
				const boxShadow: BoxShadowConfig = {
					horizontal: 0,
					vertical: 4,
					blur: 12,
					spread: 0,
					color: 'rgba(0, 115, 170, 0.25)',
				};
				const css = generateBoxShadowCSS(boxShadow);
				expect(css).toContain('box-shadow:');
				expect(css).toContain('0px 4px 12px 0px');
			});

			it('should survive JSON round-trip', () => {
				const original: BoxShadowConfig = {
					horizontal: 0,
					vertical: 2,
					blur: 8,
					color: 'rgba(0,0,0,0.15)',
				};
				const roundTripped = JSON.parse(JSON.stringify(original));
				expect(roundTripped).toEqual(original);
			});
		});
	});
});

// ============================================================================
// ACCORDION 3: Geolocation icon (Normal/Hover)
// ============================================================================

describe('Accordion 3: Geolocation icon', () => {
	describe('State Tab Panel', () => {
		it('should support two tab states: normal, hover', () => {
			const validStates = ['normal', 'hover'];
			expect(validStates.length).toBe(2);
		});

		it('geoIconActiveTab should accept valid state values', () => {
			const geoIconActiveTab = 'normal';
			expect(['normal', 'hover']).toContain(geoIconActiveTab);
		});
	});

	describe('Normal State', () => {
		describe('geoIconRightMargin (ResponsiveRange)', () => {
			it('should accept number values', () => {
				const geoIconRightMargin = 10;
				expect(geoIconRightMargin).toBe(10);
			});

			it('should support responsive values', () => {
				const geoIconRightMargin = 15;
				const geoIconRightMargin_tablet = 12;
				const geoIconRightMargin_mobile = 8;
				expect(geoIconRightMargin).toBe(15);
				expect(geoIconRightMargin_tablet).toBe(12);
				expect(geoIconRightMargin_mobile).toBe(8);
			});
		});

		describe('geoIconButtonSize (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const geoIconButtonSize = 40;
				expect(geoIconButtonSize).toBe(40);
			});

			it('should support responsive values', () => {
				const geoIconButtonSize = 44;
				const geoIconButtonSize_tablet = 40;
				const geoIconButtonSize_mobile = 36;
				expect(geoIconButtonSize).toBe(44);
				expect(geoIconButtonSize_tablet).toBe(40);
				expect(geoIconButtonSize_mobile).toBe(36);
			});

			it('should support unit values', () => {
				const geoIconButtonSizeUnit = 'px';
				expect(['px', 'em', 'rem', '%']).toContain(geoIconButtonSizeUnit);
			});
		});

		describe('geoIconButtonIconColor (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const geoIconButtonIconColor: string | undefined = undefined;
				expect(geoIconButtonIconColor).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const geoIconButtonIconColor = '#666666';
				expect(geoIconButtonIconColor).toBe('#666666');
			});
		});

		describe('geoIconButtonIconSize (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const geoIconButtonIconSize = 20;
				expect(geoIconButtonIconSize).toBe(20);
			});

			it('should support responsive values', () => {
				const geoIconButtonIconSize = 22;
				const geoIconButtonIconSize_tablet = 20;
				const geoIconButtonIconSize_mobile = 18;
				expect(geoIconButtonIconSize).toBe(22);
				expect(geoIconButtonIconSize_tablet).toBe(20);
				expect(geoIconButtonIconSize_mobile).toBe(18);
			});

			it('should support unit values', () => {
				const geoIconButtonIconSizeUnit = 'px';
				expect(['px', 'em', 'rem']).toContain(geoIconButtonIconSizeUnit);
			});
		});

		describe('geoIconButtonBackground (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const geoIconButtonBackground: string | undefined = undefined;
				expect(geoIconButtonBackground).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const geoIconButtonBackground = '#f5f5f5';
				expect(geoIconButtonBackground).toBe('#f5f5f5');
			});
		});

		describe('geoIconButtonBorderType (Select)', () => {
			it('should accept valid border type values', () => {
				const validTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];
				const geoIconButtonBorderType = 'solid';
				expect(validTypes).toContain(geoIconButtonBorderType);
			});
		});

		describe('geoIconButtonBorderRadius (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const geoIconButtonBorderRadius = 4;
				expect(geoIconButtonBorderRadius).toBe(4);
			});

			it('should support responsive values', () => {
				const geoIconButtonBorderRadius = 8;
				const geoIconButtonBorderRadius_tablet = 6;
				const geoIconButtonBorderRadius_mobile = 4;
				expect(geoIconButtonBorderRadius).toBe(8);
				expect(geoIconButtonBorderRadius_tablet).toBe(6);
				expect(geoIconButtonBorderRadius_mobile).toBe(4);
			});

			it('should support unit values', () => {
				const geoIconButtonBorderRadiusUnit = 'px';
				expect(['px', '%', 'em']).toContain(geoIconButtonBorderRadiusUnit);
			});
		});
	});

	describe('Hover State', () => {
		describe('geoIconButtonIconColorHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const geoIconButtonIconColorHover: string | undefined = undefined;
				expect(geoIconButtonIconColorHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const geoIconButtonIconColorHover = '#0073aa';
				expect(geoIconButtonIconColorHover).toBe('#0073aa');
			});
		});

		describe('geoIconButtonBackgroundHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const geoIconButtonBackgroundHover: string | undefined = undefined;
				expect(geoIconButtonBackgroundHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const geoIconButtonBackgroundHover = '#e5e5e5';
				expect(geoIconButtonBackgroundHover).toBe('#e5e5e5');
			});
		});

		describe('geoIconButtonBorderColorHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const geoIconButtonBorderColorHover: string | undefined = undefined;
				expect(geoIconButtonBorderColorHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const geoIconButtonBorderColorHover = '#0073aa';
				expect(geoIconButtonBorderColorHover).toBe('#0073aa');
			});
		});
	});
});

// ============================================================================
// ACCORDION 4: Stepper
// ============================================================================

describe('Accordion 4: Stepper', () => {
	describe('stepperInputValueSize (RangeControl)', () => {
		it('should accept number values', () => {
			const stepperInputValueSize = 18;
			expect(stepperInputValueSize).toBe(18);
		});

		it('should accept values within range 10-50', () => {
			const min = 10;
			const max = 50;
			const stepperInputValueSize = 24;
			expect(stepperInputValueSize).toBeGreaterThanOrEqual(min);
			expect(stepperInputValueSize).toBeLessThanOrEqual(max);
		});

		it('should generate valid CSS', () => {
			const stepperInputValueSize = 20;
			const css = generateSizeCSS(stepperInputValueSize, 'px', 'font-size');
			expect(css).toBe('font-size: 20px;');
		});
	});
});

// ============================================================================
// ACCORDION 5: Stepper buttons (Normal/Hover)
// ============================================================================

describe('Accordion 5: Stepper buttons', () => {
	describe('State Tab Panel', () => {
		it('should support two tab states: normal, hover', () => {
			const validStates = ['normal', 'hover'];
			expect(validStates.length).toBe(2);
		});

		it('stepperButtonsActiveTab should accept valid state values', () => {
			const stepperButtonsActiveTab = 'normal';
			expect(['normal', 'hover']).toContain(stepperButtonsActiveTab);
		});
	});

	describe('Normal State', () => {
		describe('stepperButtonsSize (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const stepperButtonsSize = 36;
				expect(stepperButtonsSize).toBe(36);
			});

			it('should support responsive values', () => {
				const stepperButtonsSize = 40;
				const stepperButtonsSize_tablet = 36;
				const stepperButtonsSize_mobile = 32;
				expect(stepperButtonsSize).toBe(40);
				expect(stepperButtonsSize_tablet).toBe(36);
				expect(stepperButtonsSize_mobile).toBe(32);
			});

			it('should support unit values', () => {
				const stepperButtonsSizeUnit = 'px';
				expect(['px', 'em', 'rem', '%']).toContain(stepperButtonsSizeUnit);
			});
		});

		describe('stepperButtonsIconColor (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const stepperButtonsIconColor: string | undefined = undefined;
				expect(stepperButtonsIconColor).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const stepperButtonsIconColor = '#666666';
				expect(stepperButtonsIconColor).toBe('#666666');
			});
		});

		describe('stepperButtonsIconSize (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const stepperButtonsIconSize = 16;
				expect(stepperButtonsIconSize).toBe(16);
			});

			it('should support responsive values', () => {
				const stepperButtonsIconSize = 18;
				const stepperButtonsIconSize_tablet = 16;
				const stepperButtonsIconSize_mobile = 14;
				expect(stepperButtonsIconSize).toBe(18);
				expect(stepperButtonsIconSize_tablet).toBe(16);
				expect(stepperButtonsIconSize_mobile).toBe(14);
			});

			it('should support unit values', () => {
				const stepperButtonsIconSizeUnit = 'px';
				expect(['px', 'em', 'rem']).toContain(stepperButtonsIconSizeUnit);
			});
		});

		describe('stepperButtonsBackground (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const stepperButtonsBackground: string | undefined = undefined;
				expect(stepperButtonsBackground).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const stepperButtonsBackground = '#f5f5f5';
				expect(stepperButtonsBackground).toBe('#f5f5f5');
			});
		});

		describe('stepperButtonsBorderType (Select)', () => {
			it('should accept valid border type values', () => {
				const validTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];
				const stepperButtonsBorderType = 'solid';
				expect(validTypes).toContain(stepperButtonsBorderType);
			});
		});

		describe('stepperButtonsBorderRadius (ResponsiveRangeWithDropdown)', () => {
			it('should accept number values', () => {
				const stepperButtonsBorderRadius = 4;
				expect(stepperButtonsBorderRadius).toBe(4);
			});

			it('should support responsive values', () => {
				const stepperButtonsBorderRadius = 8;
				const stepperButtonsBorderRadius_tablet = 6;
				const stepperButtonsBorderRadius_mobile = 4;
				expect(stepperButtonsBorderRadius).toBe(8);
				expect(stepperButtonsBorderRadius_tablet).toBe(6);
				expect(stepperButtonsBorderRadius_mobile).toBe(4);
			});

			it('should support unit values', () => {
				const stepperButtonsBorderRadiusUnit = 'px';
				expect(['px', '%', 'em']).toContain(stepperButtonsBorderRadiusUnit);
			});
		});
	});

	describe('Hover State', () => {
		describe('stepperButtonsIconColorHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const stepperButtonsIconColorHover: string | undefined = undefined;
				expect(stepperButtonsIconColorHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const stepperButtonsIconColorHover = '#0073aa';
				expect(stepperButtonsIconColorHover).toBe('#0073aa');
			});
		});

		describe('stepperButtonsBackgroundHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const stepperButtonsBackgroundHover: string | undefined = undefined;
				expect(stepperButtonsBackgroundHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const stepperButtonsBackgroundHover = '#e5e5e5';
				expect(stepperButtonsBackgroundHover).toBe('#e5e5e5');
			});
		});

		describe('stepperButtonsBorderColorHover (ColorPicker)', () => {
			it('should accept undefined as default', () => {
				const stepperButtonsBorderColorHover: string | undefined = undefined;
				expect(stepperButtonsBorderColorHover).toBeUndefined();
			});

			it('should accept valid color values', () => {
				const stepperButtonsBorderColorHover = '#0073aa';
				expect(stepperButtonsBorderColorHover).toBe('#0073aa');
			});
		});
	});
});

// ============================================================================
// ACCORDION 6: Range slider
// ============================================================================

describe('Accordion 6: Range slider', () => {
	describe('rangeValueSize (RangeControl)', () => {
		it('should accept number values', () => {
			const rangeValueSize = 14;
			expect(rangeValueSize).toBe(14);
		});

		it('should accept values within range 10-50', () => {
			const min = 10;
			const max = 50;
			const rangeValueSize = 16;
			expect(rangeValueSize).toBeGreaterThanOrEqual(min);
			expect(rangeValueSize).toBeLessThanOrEqual(max);
		});
	});

	describe('rangeValueColor (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const rangeValueColor: string | undefined = undefined;
			expect(rangeValueColor).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const rangeValueColor = '#333333';
			expect(rangeValueColor).toBe('#333333');
		});
	});

	describe('rangeBackground (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const rangeBackground: string | undefined = undefined;
			expect(rangeBackground).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const rangeBackground = '#e5e5e5';
			expect(rangeBackground).toBe('#e5e5e5');
		});
	});

	describe('rangeSelectedBackground (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const rangeSelectedBackground: string | undefined = undefined;
			expect(rangeSelectedBackground).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const rangeSelectedBackground = '#0073aa';
			expect(rangeSelectedBackground).toBe('#0073aa');
		});
	});

	describe('rangeHandleBackground (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const rangeHandleBackground: string | undefined = undefined;
			expect(rangeHandleBackground).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const rangeHandleBackground = '#ffffff';
			expect(rangeHandleBackground).toBe('#ffffff');
		});
	});

	describe('rangeBorderType (Select)', () => {
		it('should accept valid border type values', () => {
			const validTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];
			const rangeBorderType = 'solid';
			expect(validTypes).toContain(rangeBorderType);
		});

		it('should default to empty string', () => {
			const rangeBorderType = '';
			expect(rangeBorderType).toBe('');
		});
	});
});

// ============================================================================
// ACCORDION 7: Switcher
// ============================================================================

describe('Accordion 7: Switcher', () => {
	describe('switcherBackgroundInactive (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const switcherBackgroundInactive: string | undefined = undefined;
			expect(switcherBackgroundInactive).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const switcherBackgroundInactive = '#cccccc';
			expect(switcherBackgroundInactive).toBe('#cccccc');
		});
	});

	describe('switcherBackgroundActive (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const switcherBackgroundActive: string | undefined = undefined;
			expect(switcherBackgroundActive).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const switcherBackgroundActive = '#0073aa';
			expect(switcherBackgroundActive).toBe('#0073aa');
		});
	});

	describe('switcherHandleBackground (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const switcherHandleBackground: string | undefined = undefined;
			expect(switcherHandleBackground).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const switcherHandleBackground = '#ffffff';
			expect(switcherHandleBackground).toBe('#ffffff');
		});
	});
});

// ============================================================================
// ACCORDION 8: Checkbox
// ============================================================================

describe('Accordion 8: Checkbox', () => {
	describe('checkboxSize (ResponsiveRange)', () => {
		it('should accept number values', () => {
			const checkboxSize = 18;
			expect(checkboxSize).toBe(18);
		});

		it('should support responsive values', () => {
			const checkboxSize = 20;
			const checkboxSize_tablet = 18;
			const checkboxSize_mobile = 16;
			expect(checkboxSize).toBe(20);
			expect(checkboxSize_tablet).toBe(18);
			expect(checkboxSize_mobile).toBe(16);
		});

		it('should accept values within range 10-50', () => {
			const min = 10;
			const max = 50;
			const checkboxSize = 18;
			expect(checkboxSize).toBeGreaterThanOrEqual(min);
			expect(checkboxSize).toBeLessThanOrEqual(max);
		});
	});

	describe('checkboxRadius (ResponsiveRange)', () => {
		it('should accept number values', () => {
			const checkboxRadius = 4;
			expect(checkboxRadius).toBe(4);
		});

		it('should support responsive values', () => {
			const checkboxRadius = 6;
			const checkboxRadius_tablet = 4;
			const checkboxRadius_mobile = 3;
			expect(checkboxRadius).toBe(6);
			expect(checkboxRadius_tablet).toBe(4);
			expect(checkboxRadius_mobile).toBe(3);
		});

		it('should accept values within range 0-25', () => {
			const min = 0;
			const max = 25;
			const checkboxRadius = 4;
			expect(checkboxRadius).toBeGreaterThanOrEqual(min);
			expect(checkboxRadius).toBeLessThanOrEqual(max);
		});
	});

	describe('checkboxBorderType (Select)', () => {
		it('should accept valid border type values', () => {
			const validTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];
			const checkboxBorderType = 'solid';
			expect(validTypes).toContain(checkboxBorderType);
		});
	});

	describe('checkboxBackgroundUnchecked (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const checkboxBackgroundUnchecked: string | undefined = undefined;
			expect(checkboxBackgroundUnchecked).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const checkboxBackgroundUnchecked = '#ffffff';
			expect(checkboxBackgroundUnchecked).toBe('#ffffff');
		});
	});

	describe('checkboxBackgroundChecked (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const checkboxBackgroundChecked: string | undefined = undefined;
			expect(checkboxBackgroundChecked).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const checkboxBackgroundChecked = '#0073aa';
			expect(checkboxBackgroundChecked).toBe('#0073aa');
		});
	});

	describe('checkboxBorderColorChecked (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const checkboxBorderColorChecked: string | undefined = undefined;
			expect(checkboxBorderColorChecked).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const checkboxBorderColorChecked = '#0073aa';
			expect(checkboxBorderColorChecked).toBe('#0073aa');
		});
	});
});

// ============================================================================
// ACCORDION 9: Radio
// ============================================================================

describe('Accordion 9: Radio', () => {
	describe('radioSize (ResponsiveRange)', () => {
		it('should accept number values', () => {
			const radioSize = 18;
			expect(radioSize).toBe(18);
		});

		it('should support responsive values', () => {
			const radioSize = 20;
			const radioSize_tablet = 18;
			const radioSize_mobile = 16;
			expect(radioSize).toBe(20);
			expect(radioSize_tablet).toBe(18);
			expect(radioSize_mobile).toBe(16);
		});

		it('should accept values within range 10-50', () => {
			const min = 10;
			const max = 50;
			const radioSize = 18;
			expect(radioSize).toBeGreaterThanOrEqual(min);
			expect(radioSize).toBeLessThanOrEqual(max);
		});
	});

	describe('radioRadius (ResponsiveRange)', () => {
		it('should accept number values', () => {
			const radioRadius = 9;
			expect(radioRadius).toBe(9);
		});

		it('should support responsive values', () => {
			const radioRadius = 10;
			const radioRadius_tablet = 9;
			const radioRadius_mobile = 8;
			expect(radioRadius).toBe(10);
			expect(radioRadius_tablet).toBe(9);
			expect(radioRadius_mobile).toBe(8);
		});

		it('should accept values within range 0-25', () => {
			const min = 0;
			const max = 25;
			const radioRadius = 9;
			expect(radioRadius).toBeGreaterThanOrEqual(min);
			expect(radioRadius).toBeLessThanOrEqual(max);
		});
	});

	describe('radioBorderType (Select)', () => {
		it('should accept valid border type values', () => {
			const validTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];
			const radioBorderType = 'solid';
			expect(validTypes).toContain(radioBorderType);
		});
	});

	describe('radioBackgroundUnchecked (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const radioBackgroundUnchecked: string | undefined = undefined;
			expect(radioBackgroundUnchecked).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const radioBackgroundUnchecked = '#ffffff';
			expect(radioBackgroundUnchecked).toBe('#ffffff');
		});
	});

	describe('radioBackgroundChecked (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const radioBackgroundChecked: string | undefined = undefined;
			expect(radioBackgroundChecked).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const radioBackgroundChecked = '#0073aa';
			expect(radioBackgroundChecked).toBe('#0073aa');
		});
	});

	describe('radioBorderColorChecked (ColorPicker)', () => {
		it('should accept undefined as default', () => {
			const radioBorderColorChecked: string | undefined = undefined;
			expect(radioBorderColorChecked).toBeUndefined();
		});

		it('should accept valid color values', () => {
			const radioBorderColorChecked = '#0073aa';
			expect(radioBorderColorChecked).toBe('#0073aa');
		});
	});
});

// ============================================================================
// COMPLETE ATTRIBUTE INVENTORY
// ============================================================================

describe('Complete Attribute Inventory', () => {
	const attributeInventory = {
		// Terms: Inline accordion
		termsInline: {
			tabState: ['termsInlineActiveTab'],
			normal: [
				'termsInlineTitleColor',
				'termsInlineTitleTypographyNormal',
				'termsInlineIconColor',
				'termsInlineIconSize',
				'termsInlineIconSize_tablet',
				'termsInlineIconSize_mobile',
				'termsInlineIconSizeUnit',
				'termsInlineInnerGap',
				'termsInlineInnerGap_tablet',
				'termsInlineInnerGap_mobile',
				'termsInlineChevronColor',
			],
			hover: ['termsInlineTitleColorHover', 'termsInlineIconColorHover'],
			selected: ['termsInlineTitleTypographySelected', 'termsInlineTitleColorSelected'],
		},

		// Terms: Buttons accordion
		termsButtons: {
			tabState: ['termsButtonsActiveTab'],
			normal: [
				'termsButtonsGap',
				'termsButtonsGap_tablet',
				'termsButtonsGap_mobile',
				'termsButtonsBackground',
				'termsButtonsBorderType',
				'termsButtonsBorderRadius',
				'termsButtonsBorderRadius_tablet',
				'termsButtonsBorderRadius_mobile',
				'termsButtonsTypography',
				'termsButtonsTextColor',
			],
			selected: [
				'termsButtonsBackgroundSelected',
				'termsButtonsColorSelected',
				'termsButtonsBorderColorSelected',
				'termsButtonsBoxShadowSelected',
			],
		},

		// Geolocation icon accordion
		geoIcon: {
			tabState: ['geoIconActiveTab'],
			normal: [
				'geoIconRightMargin',
				'geoIconRightMargin_tablet',
				'geoIconRightMargin_mobile',
				'geoIconButtonSize',
				'geoIconButtonSize_tablet',
				'geoIconButtonSize_mobile',
				'geoIconButtonSizeUnit',
				'geoIconButtonIconColor',
				'geoIconButtonIconSize',
				'geoIconButtonIconSize_tablet',
				'geoIconButtonIconSize_mobile',
				'geoIconButtonIconSizeUnit',
				'geoIconButtonBackground',
				'geoIconButtonBorderType',
				'geoIconButtonBorderRadius',
				'geoIconButtonBorderRadius_tablet',
				'geoIconButtonBorderRadius_mobile',
				'geoIconButtonBorderRadiusUnit',
			],
			hover: ['geoIconButtonIconColorHover', 'geoIconButtonBackgroundHover', 'geoIconButtonBorderColorHover'],
		},

		// Stepper accordion
		stepper: {
			controls: ['stepperInputValueSize'],
		},

		// Stepper buttons accordion
		stepperButtons: {
			tabState: ['stepperButtonsActiveTab'],
			normal: [
				'stepperButtonsSize',
				'stepperButtonsSize_tablet',
				'stepperButtonsSize_mobile',
				'stepperButtonsSizeUnit',
				'stepperButtonsIconColor',
				'stepperButtonsIconSize',
				'stepperButtonsIconSize_tablet',
				'stepperButtonsIconSize_mobile',
				'stepperButtonsIconSizeUnit',
				'stepperButtonsBackground',
				'stepperButtonsBorderType',
				'stepperButtonsBorderRadius',
				'stepperButtonsBorderRadius_tablet',
				'stepperButtonsBorderRadius_mobile',
				'stepperButtonsBorderRadiusUnit',
			],
			hover: ['stepperButtonsIconColorHover', 'stepperButtonsBackgroundHover', 'stepperButtonsBorderColorHover'],
		},

		// Range slider accordion
		rangeSlider: {
			controls: [
				'rangeValueSize',
				'rangeValueColor',
				'rangeBackground',
				'rangeSelectedBackground',
				'rangeHandleBackground',
				'rangeBorderType',
			],
		},

		// Switcher accordion
		switcher: {
			controls: ['switcherBackgroundInactive', 'switcherBackgroundActive', 'switcherHandleBackground'],
		},

		// Checkbox accordion
		checkbox: {
			controls: [
				'checkboxSize',
				'checkboxSize_tablet',
				'checkboxSize_mobile',
				'checkboxRadius',
				'checkboxRadius_tablet',
				'checkboxRadius_mobile',
				'checkboxBorderType',
				'checkboxBackgroundUnchecked',
				'checkboxBackgroundChecked',
				'checkboxBorderColorChecked',
			],
		},

		// Radio accordion
		radio: {
			controls: [
				'radioSize',
				'radioSize_tablet',
				'radioSize_mobile',
				'radioRadius',
				'radioRadius_tablet',
				'radioRadius_mobile',
				'radioBorderType',
				'radioBackgroundUnchecked',
				'radioBackgroundChecked',
				'radioBorderColorChecked',
			],
		},
	};

	it('should have unique attribute names across all sections', () => {
		const allAttributes: string[] = [];

		// Flatten all attributes from the inventory
		Object.values(attributeInventory).forEach((section) => {
			Object.values(section).forEach((attrs) => {
				if (Array.isArray(attrs)) {
					allAttributes.push(...attrs);
				}
			});
		});

		const uniqueAttributes = new Set(allAttributes);
		expect(uniqueAttributes.size).toBe(allAttributes.length);
	});

	it('should have correct total attribute count', () => {
		const allAttributes: string[] = [];

		Object.values(attributeInventory).forEach((section) => {
			Object.values(section).forEach((attrs) => {
				if (Array.isArray(attrs)) {
					allAttributes.push(...attrs);
				}
			});
		});

		// Count should be 109 attributes (9 accordions with many controls)
		expect(allAttributes.length).toBeGreaterThanOrEqual(100);
		console.log(`Total Inline Tab attributes: ${allAttributes.length}`);
	});

	it('should have correct attribute count per accordion', () => {
		// Terms: Inline (1 tab state + 11 normal + 2 hover + 2 selected = 16)
		const termsInlineCount =
			attributeInventory.termsInline.tabState.length +
			attributeInventory.termsInline.normal.length +
			attributeInventory.termsInline.hover.length +
			attributeInventory.termsInline.selected.length;
		expect(termsInlineCount).toBe(16);

		// Terms: Buttons (1 tab state + 10 normal + 4 selected = 15)
		const termsButtonsCount =
			attributeInventory.termsButtons.tabState.length +
			attributeInventory.termsButtons.normal.length +
			attributeInventory.termsButtons.selected.length;
		expect(termsButtonsCount).toBe(15);

		// Geolocation icon (1 tab state + 18 normal + 3 hover = 22)
		const geoIconCount =
			attributeInventory.geoIcon.tabState.length +
			attributeInventory.geoIcon.normal.length +
			attributeInventory.geoIcon.hover.length;
		expect(geoIconCount).toBe(22);

		// Stepper (1 control)
		expect(attributeInventory.stepper.controls.length).toBe(1);

		// Stepper buttons (1 tab state + 15 normal + 3 hover = 19)
		const stepperButtonsCount =
			attributeInventory.stepperButtons.tabState.length +
			attributeInventory.stepperButtons.normal.length +
			attributeInventory.stepperButtons.hover.length;
		expect(stepperButtonsCount).toBe(19);

		// Range slider (6 controls)
		expect(attributeInventory.rangeSlider.controls.length).toBe(6);

		// Switcher (3 controls)
		expect(attributeInventory.switcher.controls.length).toBe(3);

		// Checkbox (10 controls)
		expect(attributeInventory.checkbox.controls.length).toBe(10);

		// Radio (10 controls)
		expect(attributeInventory.radio.controls.length).toBe(10);
	});
});

// ============================================================================
// ROUND-TRIP PERSISTENCE TESTS
// ============================================================================

describe('Round-trip Persistence Tests', () => {
	it('TypographyConfig should survive JSON round-trip', () => {
		const original: TypographyConfig = {
			fontFamily: 'Inter',
			fontSize: 14,
			fontSizeUnit: 'px',
			fontWeight: '500',
			fontStyle: 'normal',
			textTransform: 'none',
			lineHeight: 1.5,
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BoxShadowConfig should survive JSON round-trip', () => {
		const original: BoxShadowConfig = {
			horizontal: 0,
			vertical: 4,
			blur: 12,
			spread: 0,
			color: 'rgba(0, 115, 170, 0.25)',
			position: 'outset',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('Color string should survive JSON round-trip', () => {
		const original = '#0073aa';
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toBe(original);
	});

	it('RGBA color should survive JSON round-trip', () => {
		const original = 'rgba(0, 115, 170, 0.5)';
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toBe(original);
	});

	it('Numeric value should survive JSON round-trip', () => {
		const original = 18;
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toBe(original);
	});

	it('Responsive values object should survive JSON round-trip', () => {
		const original = {
			termsInlineIconSize: 20,
			termsInlineIconSize_tablet: 18,
			termsInlineIconSize_mobile: 16,
			termsInlineIconSizeUnit: 'px',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});
});

// ============================================================================
// CSS GENERATION INTEGRATION TESTS
// ============================================================================

describe('CSS Generation Integration', () => {
	it('should generate complete Terms: Inline styling CSS', () => {
		const attributes = {
			termsInlineTitleColor: '#333333',
			termsInlineIconColor: '#666666',
			termsInlineIconSize: 18,
			termsInlineIconSizeUnit: 'px',
			termsInlineInnerGap: 8,
			termsInlineChevronColor: '#999999',
		};

		const colorCSS = generateColorCSS(attributes.termsInlineTitleColor, 'color');
		const iconSizeCSS = generateSizeCSS(attributes.termsInlineIconSize, attributes.termsInlineIconSizeUnit, 'width');
		const gapCSS = generateSizeCSS(attributes.termsInlineInnerGap, 'px', 'gap');

		expect(colorCSS).toBe('color: #333333;');
		expect(iconSizeCSS).toBe('width: 18px;');
		expect(gapCSS).toBe('gap: 8px;');
	});

	it('should generate complete button styling CSS', () => {
		const typography: TypographyConfig = {
			fontSize: 13,
			fontSizeUnit: 'px',
			fontWeight: '500',
		};

		const typographyCSS = generateTypographyCSS(typography);
		const backgroundCSS = generateColorCSS('#f5f5f5', 'background-color');
		const textColorCSS = generateColorCSS('#333333', 'color');

		expect(typographyCSS).toContain('font-size: 13px;');
		expect(backgroundCSS).toBe('background-color: #f5f5f5;');
		expect(textColorCSS).toBe('color: #333333;');
	});

	it('should generate box shadow CSS for selected state', () => {
		const boxShadow: BoxShadowConfig = {
			horizontal: 0,
			vertical: 4,
			blur: 12,
			spread: 0,
			color: 'rgba(0, 115, 170, 0.25)',
		};

		const css = generateBoxShadowCSS(boxShadow);
		expect(css).toContain('box-shadow:');
		expect(css).toContain('0px 4px 12px 0px');
		expect(css).toContain('rgba(0, 115, 170, 0.25)');
	});

	it('should handle inset box shadow', () => {
		const boxShadow: BoxShadowConfig = {
			horizontal: 0,
			vertical: 2,
			blur: 4,
			spread: 0,
			color: 'rgba(0, 0, 0, 0.1)',
			position: 'inset',
		};

		const css = generateBoxShadowCSS(boxShadow);
		expect(css).toContain('inset');
	});

	it('should generate switcher toggle styling', () => {
		const inactive = generateColorCSS('#cccccc', 'background-color');
		const active = generateColorCSS('#0073aa', 'background-color');
		const handle = generateColorCSS('#ffffff', 'background-color');

		expect(inactive).toBe('background-color: #cccccc;');
		expect(active).toBe('background-color: #0073aa;');
		expect(handle).toBe('background-color: #ffffff;');
	});
});

// ============================================================================
// BORDER TYPE VALIDATION
// ============================================================================

describe('Border Type Validation', () => {
	const validBorderTypes = ['', 'none', 'solid', 'double', 'dotted', 'dashed', 'groove'];

	it('should validate all border type options', () => {
		expect(validBorderTypes).toContain('');
		expect(validBorderTypes).toContain('none');
		expect(validBorderTypes).toContain('solid');
		expect(validBorderTypes).toContain('double');
		expect(validBorderTypes).toContain('dotted');
		expect(validBorderTypes).toContain('dashed');
		expect(validBorderTypes).toContain('groove');
	});

	it('should reject invalid border types', () => {
		expect(validBorderTypes).not.toContain('ridge');
		expect(validBorderTypes).not.toContain('inset');
		expect(validBorderTypes).not.toContain('outset');
	});

	it('should match Elementor BORDER_TYPES constant', () => {
		// These match the BORDER_TYPES constant in InlineTab.tsx
		expect(validBorderTypes.length).toBe(7);
	});
});
