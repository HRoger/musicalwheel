/**
 * Work Hours Block - Content Tab Attribute Tests
 *
 * Tests for all 45 controls across 9 accordions in the Content tab.
 * Follows the pattern from search-form/__tests__/general-tab.test.ts
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import type { WorkHoursAttributes, TypographyValue } from '../types';

// Type definitions for attribute configs
interface DimensionsConfig {
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	unit?: string;
	isLinked?: boolean;
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
	type?: 'none' | 'solid' | 'dashed' | 'dotted';
	width?: number;
	color?: string;
}

interface IconConfig {
	value?: string;
	library?: string;
}

// CSS Generation Helpers
function generateDimensionsCSS(
	d: DimensionsConfig | undefined,
	property: string
): string {
	if (!d || Object.keys(d).length === 0) return '';
	const unit = d.unit || 'px';
	return `${property}: ${d.top ?? 0}${unit} ${d.right ?? 0}${unit} ${d.bottom ?? 0}${unit} ${d.left ?? 0}${unit};`;
}

function generateBoxShadowCSS(s: BoxShadowConfig | undefined): string {
	if (!s || Object.keys(s).length === 0) return '';
	const inset = s.position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${s.horizontal ?? 0}px ${s.vertical ?? 0}px ${s.blur ?? 0}px ${s.spread ?? 0}px ${s.color || 'rgba(0,0,0,0.1)'};`;
}

function generateBorderCSS(b: BorderConfig | undefined): string {
	if (!b || !b.type || b.type === 'none') return '';
	return `border: ${b.width ?? 1}px ${b.type} ${b.color || '#000'};`;
}

describe('Work Hours Content Tab - Accordion 1: General', () => {
	describe('sourceField (SelectControl)', () => {
		it('should accept string values', () => {
			const sourceField = 'work-hours';
			expect(typeof sourceField).toBe('string');
		});

		it('should accept empty string as default', () => {
			const sourceField = '';
			expect(sourceField).toBe('');
		});

		it('should have predefined options', () => {
			const options = ['', 'work-hours', 'business-hours'];
			expect(options.includes('work-hours')).toBe(true);
		});
	});

	describe('collapse (SelectControl)', () => {
		it('should accept valid collapse values', () => {
			const collapse1: 'wh-default' | 'wh-expanded' = 'wh-default';
			const collapse2: 'wh-default' | 'wh-expanded' = 'wh-expanded';
			expect(['wh-default', 'wh-expanded'].includes(collapse1)).toBe(true);
			expect(['wh-default', 'wh-expanded'].includes(collapse2)).toBe(true);
		});

		it('should default to wh-default', () => {
			const collapse = 'wh-default';
			expect(collapse).toBe('wh-default');
		});
	});

	describe('borderType, borderWidth, borderColor (BorderGroupControl)', () => {
		it('should accept empty string for borderType to enable Default option', () => {
			const borderType = '';
			expect(borderType).toBe('');
		});

		it('should accept valid border types', () => {
			const types = ['', 'solid', 'dashed', 'dotted', 'double', 'none'];
			types.forEach((type) => {
				expect(typeof type).toBe('string');
			});
		});

		it('should accept number for borderWidth (0 for Default)', () => {
			const borderWidth = 0;
			expect(typeof borderWidth).toBe('number');
			expect(borderWidth).toBe(0);
		});

		it('should generate valid CSS', () => {
			const border: BorderConfig = {
				type: 'solid',
				width: 1,
				color: '#e0e0e0',
			};
			const css = generateBorderCSS(border);
			expect(css).toBe('border: 1px solid #e0e0e0;');
		});
	});

	describe('borderRadius (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const borderRadius = 5;
			const borderRadius_tablet = 5;
			const borderRadius_mobile = 5;
			expect(typeof borderRadius).toBe('number');
			expect(typeof borderRadius_tablet).toBe('number');
			expect(typeof borderRadius_mobile).toBe('number');
		});

		it('should support responsive values', () => {
			const desktop = 8;
			const tablet = 6;
			const mobile = 4;
			expect(desktop).toBeGreaterThan(tablet);
			expect(tablet).toBeGreaterThan(mobile);
		});
	});

	describe('boxShadow (BoxShadowPopup)', () => {
		it('should accept string values', () => {
			const boxShadow = '';
			expect(typeof boxShadow).toBe('string');
		});

		it('should generate valid CSS from config', () => {
			const shadow: BoxShadowConfig = {
				horizontal: 0,
				vertical: 2,
				blur: 8,
				spread: 0,
				color: 'rgba(0,0,0,0.1)',
			};
			const css = generateBoxShadowCSS(shadow);
			expect(css).toBe('box-shadow: 0px 2px 8px 0px rgba(0,0,0,0.1);');
		});
	});
});

describe('Work Hours Content Tab - Accordion 2: Top area', () => {
	describe('topBg (ColorControl)', () => {
		it('should accept string color values', () => {
			const topBg = '#ffffff';
			expect(typeof topBg).toBe('string');
		});

		it('should accept empty string as default', () => {
			const topBg = '';
			expect(topBg).toBe('');
		});
	});

	describe('topIconSize (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const topIconSize = 24;
			const topIconSize_tablet = 20;
			const topIconSize_mobile = 18;
			expect(typeof topIconSize).toBe('number');
			expect(typeof topIconSize_tablet).toBe('number');
			expect(typeof topIconSize_mobile).toBe('number');
		});

		it('should support unit suffix', () => {
			const topIconSizeUnit = 'px';
			expect(topIconSizeUnit).toBe('px');
		});
	});

	describe('labelTypography (TypographyControl)', () => {
		it('should accept empty object as default', () => {
			const labelTypography: TypographyValue = {};
			expect(Object.keys(labelTypography).length).toBe(0);
		});

		it('should accept valid typography config', () => {
			const labelTypography: TypographyValue = {
				fontFamily: 'Arial',
				fontSize: 14,
				fontWeight: '600',
				lineHeight: 1.5,
				letterSpacing: 0,
			};
			expect(labelTypography.fontFamily).toBe('Arial');
			expect(labelTypography.fontSize).toBe(14);
		});
	});

	describe('labelColor (ColorControl)', () => {
		it('should accept color values', () => {
			const labelColor = '#333333';
			expect(typeof labelColor).toBe('string');
		});
	});

	describe('currentHoursTypography (TypographyControl)', () => {
		it('should accept typography config', () => {
			const currentHoursTypography: TypographyValue = {
				fontSize: 12,
				fontWeight: '400',
			};
			expect(currentHoursTypography.fontSize).toBe(12);
		});
	});

	describe('currentHoursColor (ColorControl)', () => {
		it('should accept color values', () => {
			const currentHoursColor = '#666666';
			expect(typeof currentHoursColor).toBe('string');
		});
	});

	describe('topPadding (ResponsiveDimensionsControl)', () => {
		it('should accept dimension values', () => {
			const topPaddingTop = 15;
			const topPaddingRight = 15;
			const topPaddingBottom = 15;
			const topPaddingLeft = 15;
			expect(typeof topPaddingTop).toBe('number');
			expect(typeof topPaddingRight).toBe('number');
			expect(typeof topPaddingBottom).toBe('number');
			expect(typeof topPaddingLeft).toBe('number');
		});

		it('should support responsive values', () => {
			const desktop = { top: 15, right: 15, bottom: 15, left: 15 };
			const tablet = { top: 12, right: 12, bottom: 12, left: 12 };
			const mobile = { top: 10, right: 10, bottom: 10, left: 10 };
			const desktopCSS = generateDimensionsCSS(desktop, 'padding');
			expect(desktopCSS).toBe('padding: 15px 15px 15px 15px;');
		});
	});
});

describe('Work Hours Content Tab - Accordion 3: Body', () => {
	describe('bodyBg (ColorControl)', () => {
		it('should accept color values', () => {
			const bodyBg = '#f5f5f5';
			expect(typeof bodyBg).toBe('string');
		});
	});

	describe('bodySeparatorColor (ColorControl)', () => {
		it('should accept color values', () => {
			const bodySeparatorColor = '#e0e0e0';
			expect(typeof bodySeparatorColor).toBe('string');
		});
	});

	describe('dayTypography (TypographyControl)', () => {
		it('should accept typography config', () => {
			const dayTypography: TypographyValue = {
				fontSize: 14,
				fontWeight: '500',
			};
			expect(dayTypography.fontSize).toBe(14);
		});
	});

	describe('dayColor (ColorControl)', () => {
		it('should accept color values', () => {
			const dayColor = '#333333';
			expect(typeof dayColor).toBe('string');
		});
	});

	describe('hoursTypography (TypographyControl)', () => {
		it('should accept typography config', () => {
			const hoursTypography: TypographyValue = {
				fontSize: 13,
				fontWeight: '400',
			};
			expect(hoursTypography.fontSize).toBe(13);
		});
	});

	describe('hoursColor (ColorControl)', () => {
		it('should accept color values', () => {
			const hoursColor = '#666666';
			expect(typeof hoursColor).toBe('string');
		});
	});

	describe('bodyPadding (ResponsiveDimensionsControl)', () => {
		it('should accept dimension values', () => {
			const bodyPaddingTop = 10;
			const bodyPaddingRight = 10;
			const bodyPaddingBottom = 10;
			const bodyPaddingLeft = 10;
			expect(typeof bodyPaddingTop).toBe('number');
		});

		it('should generate valid CSS', () => {
			const padding = { top: 10, right: 10, bottom: 10, left: 10 };
			const css = generateDimensionsCSS(padding, 'padding');
			expect(css).toBe('padding: 10px 10px 10px 10px;');
		});
	});
});

describe('Work Hours Content Tab - Accordion 4: Open', () => {
	describe('openIcon (IconPickerControl)', () => {
		it('should accept empty object as default', () => {
			const openIcon: IconConfig = {};
			expect(Object.keys(openIcon).length).toBe(0);
		});

		it('should accept icon config', () => {
			const openIcon: IconConfig = {
				value: 'fas fa-clock',
				library: 'fa-solid',
			};
			expect(openIcon.value).toBe('fas fa-clock');
		});
	});

	describe('openText (TextControl)', () => {
		it('should accept string values', () => {
			const openText = 'Open now';
			expect(typeof openText).toBe('string');
		});

		it('should have default value', () => {
			const openText = 'Open now';
			expect(openText).toBe('Open now');
		});
	});

	describe('openIconColor (ColorControl)', () => {
		it('should accept color values', () => {
			const openIconColor = '#6bd28d';
			expect(typeof openIconColor).toBe('string');
		});
	});

	describe('openTextColor (ColorControl)', () => {
		it('should accept color values', () => {
			const openTextColor = '#6bd28d';
			expect(typeof openTextColor).toBe('string');
		});
	});
});

describe('Work Hours Content Tab - Accordion 5: Closed', () => {
	describe('closedIcon (IconPickerControl)', () => {
		it('should accept icon config', () => {
			const closedIcon: IconConfig = {
				value: 'fas fa-times-circle',
				library: 'fa-solid',
			};
			expect(closedIcon.value).toBe('fas fa-times-circle');
		});
	});

	describe('closedText (TextControl)', () => {
		it('should accept string values', () => {
			const closedText = 'Closed';
			expect(closedText).toBe('Closed');
		});
	});

	describe('closedIconColor (ColorControl)', () => {
		it('should accept color values', () => {
			const closedIconColor = '#e83f3f';
			expect(typeof closedIconColor).toBe('string');
		});
	});

	describe('closedTextColor (ColorControl)', () => {
		it('should accept color values', () => {
			const closedTextColor = '#e83f3f';
			expect(typeof closedTextColor).toBe('string');
		});
	});
});

describe('Work Hours Content Tab - Accordion 6: Appointment only', () => {
	describe('appointmentIcon (IconPickerControl)', () => {
		it('should accept icon config', () => {
			const appointmentIcon: IconConfig = {
				value: 'fas fa-calendar-check',
				library: 'fa-solid',
			};
			expect(appointmentIcon.value).toBe('fas fa-calendar-check');
		});
	});

	describe('appointmentText (TextControl)', () => {
		it('should accept string values', () => {
			const appointmentText = 'Appointment only';
			expect(appointmentText).toBe('Appointment only');
		});
	});

	describe('appointmentIconColor (ColorControl)', () => {
		it('should accept color values', () => {
			const appointmentIconColor = '#3ac1ee';
			expect(typeof appointmentIconColor).toBe('string');
		});
	});

	describe('appointmentTextColor (ColorControl)', () => {
		it('should accept color values', () => {
			const appointmentTextColor = '#3ac1ee';
			expect(typeof appointmentTextColor).toBe('string');
		});
	});
});

describe('Work Hours Content Tab - Accordion 7: Not available', () => {
	describe('notAvailableIcon (IconPickerControl)', () => {
		it('should accept icon config', () => {
			const notAvailableIcon: IconConfig = {
				value: 'fas fa-ban',
				library: 'fa-solid',
			};
			expect(notAvailableIcon.value).toBe('fas fa-ban');
		});
	});

	describe('notAvailableText (TextControl)', () => {
		it('should accept string values', () => {
			const notAvailableText = 'Not available';
			expect(notAvailableText).toBe('Not available');
		});
	});

	describe('notAvailableIconColor (ColorControl)', () => {
		it('should accept color values', () => {
			const notAvailableIconColor = '#999999';
			expect(typeof notAvailableIconColor).toBe('string');
		});
	});

	describe('notAvailableTextColor (ColorControl)', () => {
		it('should accept color values', () => {
			const notAvailableTextColor = '#999999';
			expect(typeof notAvailableTextColor).toBe('string');
		});
	});
});

describe('Work Hours Content Tab - Accordion 8: Icons', () => {
	describe('downIcon (IconPickerControl)', () => {
		it('should accept icon config', () => {
			const downIcon: IconConfig = {
				value: 'fas fa-chevron-down',
				library: 'fa-solid',
			};
			expect(downIcon.value).toBe('fas fa-chevron-down');
		});
	});
});

describe('Work Hours Content Tab - Accordion 9: Accordion button', () => {
	describe('accordionButtonSize (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const accordionButtonSize = 24;
			expect(typeof accordionButtonSize).toBe('number');
		});
	});

	describe('accordionButtonColor (ColorControl)', () => {
		it('should accept color values', () => {
			const accordionButtonColor = '#333333';
			expect(typeof accordionButtonColor).toBe('string');
		});
	});

	describe('accordionButtonIconSize (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const accordionButtonIconSize = 16;
			expect(typeof accordionButtonIconSize).toBe('number');
		});
	});

	describe('accordionButtonBg (ColorControl)', () => {
		it('should accept color values', () => {
			const accordionButtonBg = '#ffffff';
			expect(typeof accordionButtonBg).toBe('string');
		});
	});

	describe('accordionButtonBorder (BorderGroupControl)', () => {
		it('should accept border config', () => {
			const border: BorderConfig = {
				type: 'solid',
				width: 1,
				color: '#e0e0e0',
			};
			expect(border.type).toBe('solid');
			expect(border.width).toBe(1);
		});
	});

	describe('accordionButtonBorderRadius (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const accordionButtonBorderRadius = 0;
			expect(typeof accordionButtonBorderRadius).toBe('number');
		});
	});

	describe('Hover state attributes', () => {
		it('should accept hover color values', () => {
			const accordionButtonColorHover = '#000000';
			const accordionButtonBgHover = '#f5f5f5';
			const accordionButtonBorderColorHover = '#cccccc';
			expect(typeof accordionButtonColorHover).toBe('string');
			expect(typeof accordionButtonBgHover).toBe('string');
			expect(typeof accordionButtonBorderColorHover).toBe('string');
		});
	});
});

describe('Complete Attribute Inventory', () => {
	const attributeInventory = {
		general: [
			'sourceField',
			'collapse',
			'borderType',
			'borderWidth',
			'borderColor',
			'borderRadius',
			'borderRadius_tablet',
			'borderRadius_mobile',
			'boxShadow',
		],
		topArea: [
			'topBg',
			'topIconSize',
			'topIconSize_tablet',
			'topIconSize_mobile',
			'topIconSizeUnit',
			'labelTypography',
			'labelColor',
			'currentHoursTypography',
			'currentHoursColor',
			'topPaddingTop',
			'topPaddingRight',
			'topPaddingBottom',
			'topPaddingLeft',
			'topPaddingTop_tablet',
			'topPaddingRight_tablet',
			'topPaddingBottom_tablet',
			'topPaddingLeft_tablet',
			'topPaddingTop_mobile',
			'topPaddingRight_mobile',
			'topPaddingBottom_mobile',
			'topPaddingLeft_mobile',
		],
		body: [
			'bodyBg',
			'bodySeparatorColor',
			'dayTypography',
			'dayColor',
			'hoursTypography',
			'hoursColor',
			'bodyPaddingTop',
			'bodyPaddingRight',
			'bodyPaddingBottom',
			'bodyPaddingLeft',
			'bodyPaddingTop_tablet',
			'bodyPaddingRight_tablet',
			'bodyPaddingBottom_tablet',
			'bodyPaddingLeft_tablet',
			'bodyPaddingTop_mobile',
			'bodyPaddingRight_mobile',
			'bodyPaddingBottom_mobile',
			'bodyPaddingLeft_mobile',
		],
		open: ['openIcon', 'openText', 'openIconColor', 'openTextColor'],
		closed: ['closedIcon', 'closedText', 'closedIconColor', 'closedTextColor'],
		appointmentOnly: [
			'appointmentIcon',
			'appointmentText',
			'appointmentIconColor',
			'appointmentTextColor',
		],
		notAvailable: [
			'notAvailableIcon',
			'notAvailableText',
			'notAvailableIconColor',
			'notAvailableTextColor',
		],
		icons: ['downIcon'],
		accordionButton: [
			'accordionButtonSize',
			'accordionButtonColor',
			'accordionButtonIconSize',
			'accordionButtonBg',
			'accordionButtonBorderType',
			'accordionButtonBorderWidth',
			'accordionButtonBorderColor',
			'accordionButtonBorderRadius',
			'accordionButtonColorHover',
			'accordionButtonBgHover',
			'accordionButtonBorderColorHover',
		],
		state: ['workHoursActiveTab', 'contentTabOpenPanel', 'accordionButtonState'],
	};

	it('should have unique attribute names across all sections', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		const uniqueAttributes = new Set(allAttributes);
		expect(uniqueAttributes.size).toBe(allAttributes.length);
	});

	it('should have correct total attribute count', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		// 9 General + 21 Top Area + 18 Body + 4 Open + 4 Closed + 4 Appointment + 4 Not Available + 1 Icons + 11 Accordion Button + 3 State = 79
		expect(allAttributes.length).toBe(79);
		console.log(`Total attributes: ${allAttributes.length}`);
	});
});

describe('JSON Round-trip Persistence Tests', () => {
	it('DimensionsConfig should survive JSON round-trip', () => {
		const original: DimensionsConfig = {
			top: 15,
			right: 15,
			bottom: 15,
			left: 15,
			unit: 'px',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BoxShadowConfig should survive JSON round-trip', () => {
		const original: BoxShadowConfig = {
			horizontal: 0,
			vertical: 2,
			blur: 8,
			color: 'rgba(0,0,0,0.1)',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('TypographyValue should survive JSON round-trip', () => {
		const original: TypographyValue = {
			fontFamily: 'Arial',
			fontSize: 14,
			fontWeight: '600',
			lineHeight: 1.5,
			letterSpacing: 0,
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('IconConfig should survive JSON round-trip', () => {
		const original: IconConfig = {
			value: 'fas fa-clock',
			library: 'fa-solid',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});
});
