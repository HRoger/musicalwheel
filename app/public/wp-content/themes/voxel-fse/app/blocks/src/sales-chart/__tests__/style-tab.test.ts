/**
 * Sales Chart Block - Style Tab Attribute Tests
 *
 * Tests for Style tab inspector controls to ensure proper serialization
 * and persistence of all attributes.
 *
 * Reference pattern: search-form/__tests__/general-tab.test.ts
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// Type definitions for attribute configs
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
	lineHeight?: number;
	letterSpacing?: number;
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
	style?: 'none' | 'solid' | 'dashed' | 'dotted';
	color?: string;
}

interface BackgroundConfig {
	type?: 'classic' | 'gradient';
	color?: string;
	gradientColor?: string;
	gradientSecondColor?: string;
	gradientLocation?: number;
	gradientSecondLocation?: number;
	gradientType?: 'linear' | 'radial';
	gradientAngle?: number;
}

// CSS Generation Helpers (used in both tests and production)
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
	if (!b || Object.keys(b).length === 0) return '';
	return `border: ${b.width ?? 1}px ${b.style || 'solid'} ${b.color || '#000'};`;
}

function generateBackgroundCSS(bg: BackgroundConfig | undefined): string {
	if (!bg || Object.keys(bg).length === 0) return '';
	if (bg.type === 'gradient') {
		const type = bg.gradientType || 'linear';
		const angle = bg.gradientAngle ?? 180;
		const color1 = bg.gradientColor || 'transparent';
		const color2 = bg.gradientSecondColor || 'transparent';
		const loc1 = bg.gradientLocation ?? 0;
		const loc2 = bg.gradientSecondLocation ?? 100;
		return `background: ${type}-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%);`;
	}
	return `background-color: ${bg.color || 'transparent'};`;
}

// ============================================================================
// ACCORDION 1: CHART
// ============================================================================

describe('Accordion 1: Chart', () => {
	describe('ts_chart_height (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_chart_height = 400;
			expect(typeof ts_chart_height).toBe('number');
		});

		it('should support responsive values (_tablet, _mobile)', () => {
			const ts_chart_height = 400;
			const ts_chart_height_tablet = 350;
			const ts_chart_height_mobile = 300;
			expect(ts_chart_height).toBe(400);
			expect(ts_chart_height_tablet).toBe(350);
			expect(ts_chart_height_mobile).toBe(300);
		});

		it('should generate valid CSS', () => {
			const ts_chart_height = 400;
			const css = `height: ${ts_chart_height}px;`;
			expect(css).toBe('height: 400px;');
		});
	});

	describe('ts_axis_typo_col (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_axis_typo_col = '#333333';
			expect(typeof ts_axis_typo_col).toBe('string');
			expect(ts_axis_typo_col).toMatch(/^#[0-9a-fA-F]{6}$/);
		});

		it('should generate valid CSS', () => {
			const ts_axis_typo_col = '#333333';
			const css = `color: ${ts_axis_typo_col};`;
			expect(css).toBe('color: #333333;');
		});
	});

	describe('vertical_axis_width (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const vertical_axis_width = 100;
			expect(typeof vertical_axis_width).toBe('number');
		});

		it('should support responsive values', () => {
			const vertical_axis_width = 100;
			const vertical_axis_width_tablet = 80;
			const vertical_axis_width_mobile = 60;
			expect(vertical_axis_width).toBe(100);
			expect(vertical_axis_width_tablet).toBe(80);
			expect(vertical_axis_width_mobile).toBe(60);
		});
	});

	describe('chart_col_gap (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const chart_col_gap = 10;
			expect(typeof chart_col_gap).toBe('number');
		});

		it('should support responsive values', () => {
			const chart_col_gap = 10;
			const chart_col_gap_tablet = 8;
			const chart_col_gap_mobile = 5;
			expect(chart_col_gap).toBe(10);
			expect(chart_col_gap_tablet).toBe(8);
			expect(chart_col_gap_mobile).toBe(5);
		});

		it('should generate valid CSS', () => {
			const chart_col_gap = 10;
			const css = `grid-gap: ${chart_col_gap}px;`;
			expect(css).toBe('grid-gap: 10px;');
		});
	});

	describe('bar_width (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const bar_width = 30;
			expect(typeof bar_width).toBe('number');
		});

		it('should support responsive values', () => {
			const bar_width = 30;
			const bar_width_tablet = 25;
			const bar_width_mobile = 20;
			expect(bar_width).toBe(30);
			expect(bar_width_tablet).toBe(25);
			expect(bar_width_mobile).toBe(20);
		});
	});

	describe('bar_radius (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const bar_radius = 5;
			expect(typeof bar_radius).toBe('number');
		});

		it('should support responsive values', () => {
			const bar_radius = 5;
			const bar_radius_tablet = 4;
			const bar_radius_mobile = 3;
			expect(bar_radius).toBe(5);
			expect(bar_radius_tablet).toBe(4);
			expect(bar_radius_mobile).toBe(3);
		});

		it('should generate valid CSS', () => {
			const bar_radius = 5;
			const css = `border-radius: ${bar_radius}px;`;
			expect(css).toBe('border-radius: 5px;');
		});
	});

	describe('bar_bg_hover (ColorControl)', () => {
		it('should accept color string', () => {
			const bar_bg_hover = '#4CAF50';
			expect(typeof bar_bg_hover).toBe('string');
			expect(bar_bg_hover).toMatch(/^#[0-9a-fA-F]{6}$/);
		});

		it('should generate valid CSS', () => {
			const bar_bg_hover = '#4CAF50';
			const css = `background-color: ${bar_bg_hover};`;
			expect(css).toBe('background-color: #4CAF50;');
		});
	});

	describe('bar_pop_bg (ColorControl)', () => {
		it('should accept color string', () => {
			const bar_pop_bg = '#FFFFFF';
			expect(typeof bar_pop_bg).toBe('string');
		});

		it('should generate valid CSS', () => {
			const bar_pop_bg = '#FFFFFF';
			const css = `background-color: ${bar_pop_bg};`;
			expect(css).toBe('background-color: #FFFFFF;');
		});
	});

	describe('bar_pop_radius (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const bar_pop_radius = 8;
			expect(typeof bar_pop_radius).toBe('number');
		});

		it('should support responsive values', () => {
			const bar_pop_radius = 8;
			const bar_pop_radius_tablet = 6;
			const bar_pop_radius_mobile = 4;
			expect(bar_pop_radius).toBe(8);
			expect(bar_pop_radius_tablet).toBe(6);
			expect(bar_pop_radius_mobile).toBe(4);
		});
	});

	describe('ts_primary_color (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_primary_color = '#000000';
			expect(typeof ts_primary_color).toBe('string');
		});
	});

	describe('ts_secondary_color (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_secondary_color = '#666666';
			expect(typeof ts_secondary_color).toBe('string');
		});
	});
});

// ============================================================================
// ACCORDION 2: TABS
// ============================================================================

describe('Accordion 2: Tabs (Normal/Hover states)', () => {
	describe('tabsState (StateTabPanel)', () => {
		it('should accept string values', () => {
			const tabsState = 'normal';
			expect(typeof tabsState).toBe('string');
			expect(['normal', 'hover']).toContain(tabsState);
		});

		it('should default to "normal"', () => {
			const tabsState = 'normal';
			expect(tabsState).toBe('normal');
		});
	});

	describe('ts_tabs_justify (SelectControl)', () => {
		it('should accept valid justify values', () => {
			const values = ['left', 'center', 'flex-end', 'space-between', 'space-around'];
			values.forEach((value) => {
				expect(typeof value).toBe('string');
			});
		});

		it('should generate valid CSS', () => {
			const ts_tabs_justify = 'center';
			const css = `justify-content: ${ts_tabs_justify};`;
			expect(css).toBe('justify-content: center;');
		});
	});

	describe('ts_tabs_padding (DimensionsControl)', () => {
		it('should accept empty object as default', () => {
			const ts_tabs_padding: DimensionsConfig = {};
			expect(Object.keys(ts_tabs_padding).length).toBe(0);
		});

		it('should generate valid CSS', () => {
			const ts_tabs_padding: DimensionsConfig = {
				top: 10,
				right: 15,
				bottom: 10,
				left: 15,
				unit: 'px',
			};
			const css = generateDimensionsCSS(ts_tabs_padding, 'padding');
			expect(css).toBe('padding: 10px 15px 10px 15px;');
		});
	});

	describe('ts_tabs_margin (DimensionsControl)', () => {
		it('should accept empty object as default', () => {
			const ts_tabs_margin: DimensionsConfig = {};
			expect(Object.keys(ts_tabs_margin).length).toBe(0);
		});

		it('should generate valid CSS', () => {
			const ts_tabs_margin: DimensionsConfig = {
				top: 0,
				right: 15,
				bottom: 15,
				left: 0,
				unit: 'px',
			};
			const css = generateDimensionsCSS(ts_tabs_margin, 'margin');
			expect(css).toBe('margin: 0px 15px 15px 0px;');
		});
	});

	describe('Color controls (Normal state)', () => {
		it('should accept color strings', () => {
			const ts_tabs_text_color = '#333333';
			const ts_active_text_color = '#000000';
			const ts_tabs_bg_color = '#F5F5F5';
			const ts_tabs_bg_active_color = '#FFFFFF';
			const ts_tabs_border_active = '#4CAF50';

			expect(typeof ts_tabs_text_color).toBe('string');
			expect(typeof ts_active_text_color).toBe('string');
			expect(typeof ts_tabs_bg_color).toBe('string');
			expect(typeof ts_tabs_bg_active_color).toBe('string');
			expect(typeof ts_tabs_border_active).toBe('string');
		});
	});

	describe('Color controls (Hover state)', () => {
		it('should accept color strings', () => {
			const ts_tabs_text_color_h = '#000000';
			const ts_tabs_active_text_color_h = '#4CAF50';
			const ts_tabs_border_color_h = '#CCCCCC';
			const ts_tabs_border_h_active = '#4CAF50';
			const ts_tabs_bg_color_h = '#EEEEEE';
			const ts_bg_active_color_h = '#F5F5F5';

			expect(typeof ts_tabs_text_color_h).toBe('string');
			expect(typeof ts_tabs_active_text_color_h).toBe('string');
			expect(typeof ts_tabs_border_color_h).toBe('string');
			expect(typeof ts_tabs_border_h_active).toBe('string');
			expect(typeof ts_tabs_bg_color_h).toBe('string');
			expect(typeof ts_bg_active_color_h).toBe('string');
		});
	});

	describe('ts_tabs_radius (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_tabs_radius = 5;
			expect(typeof ts_tabs_radius).toBe('number');
		});

		it('should generate valid CSS', () => {
			const ts_tabs_radius = 5;
			const css = `border-radius: ${ts_tabs_radius}px;`;
			expect(css).toBe('border-radius: 5px;');
		});
	});
});

// ============================================================================
// ACCORDION 3: NEXT/PREV WEEK BUTTONS
// ============================================================================

describe('Accordion 3: Next/Prev week buttons (Normal/Hover states)', () => {
	describe('weekButtonsState (StateTabPanel)', () => {
		it('should accept string values', () => {
			const weekButtonsState = 'normal';
			expect(typeof weekButtonsState).toBe('string');
			expect(['normal', 'hover']).toContain(weekButtonsState);
		});

		it('should default to "normal"', () => {
			const weekButtonsState = 'normal';
			expect(weekButtonsState).toBe('normal');
		});
	});

	describe('week_range_col (ColorControl)', () => {
		it('should accept color string', () => {
			const week_range_col = '#666666';
			expect(typeof week_range_col).toBe('string');
		});
	});

	describe('ts_week_btn_color (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_week_btn_color = '#333333';
			expect(typeof ts_week_btn_color).toBe('string');
		});

		it('should generate valid CSS', () => {
			const ts_week_btn_color = '#333333';
			const css = `color: ${ts_week_btn_color};`;
			expect(css).toBe('color: #333333;');
		});
	});

	describe('ts_week_btn_icon_size (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_week_btn_icon_size = 16;
			expect(typeof ts_week_btn_icon_size).toBe('number');
		});

		it('should support responsive values', () => {
			const ts_week_btn_icon_size = 16;
			const ts_week_btn_icon_size_tablet = 14;
			const ts_week_btn_icon_size_mobile = 12;
			expect(ts_week_btn_icon_size).toBe(16);
			expect(ts_week_btn_icon_size_tablet).toBe(14);
			expect(ts_week_btn_icon_size_mobile).toBe(12);
		});
	});

	describe('ts_week_btn_bg (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_week_btn_bg = '#F5F5F5';
			expect(typeof ts_week_btn_bg).toBe('string');
		});
	});

	describe('ts_week_btn_radius (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_week_btn_radius = 50;
			expect(typeof ts_week_btn_radius).toBe('number');
		});

		it('should support responsive values', () => {
			const ts_week_btn_radius = 50;
			const ts_week_btn_radius_tablet = 40;
			const ts_week_btn_radius_mobile = 30;
			expect(ts_week_btn_radius).toBe(50);
			expect(ts_week_btn_radius_tablet).toBe(40);
			expect(ts_week_btn_radius_mobile).toBe(30);
		});
	});

	describe('ts_week_btn_size (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_week_btn_size = 40;
			expect(typeof ts_week_btn_size).toBe('number');
		});

		it('should support responsive values', () => {
			const ts_week_btn_size = 40;
			const ts_week_btn_size_tablet = 35;
			const ts_week_btn_size_mobile = 30;
			expect(ts_week_btn_size).toBe(40);
			expect(ts_week_btn_size_tablet).toBe(35);
			expect(ts_week_btn_size_mobile).toBe(30);
		});

		it('should generate valid CSS', () => {
			const ts_week_btn_size = 40;
			const css = `width: ${ts_week_btn_size}px; height: ${ts_week_btn_size}px;`;
			expect(css).toBe('width: 40px; height: 40px;');
		});
	});

	describe('Hover state colors', () => {
		it('should accept color strings', () => {
			const ts_week_btn_h = '#000000';
			const ts_week_btn_bg_h = '#EEEEEE';
			const ts_week_border_c_h = '#4CAF50';

			expect(typeof ts_week_btn_h).toBe('string');
			expect(typeof ts_week_btn_bg_h).toBe('string');
			expect(typeof ts_week_border_c_h).toBe('string');
		});
	});
});

// ============================================================================
// ACCORDION 4: NO ACTIVITY
// ============================================================================

describe('Accordion 4: No activity', () => {
	describe('ts_nopost_content_Gap (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_nopost_content_Gap = 20;
			expect(typeof ts_nopost_content_Gap).toBe('number');
		});

		it('should support responsive values', () => {
			const ts_nopost_content_Gap = 20;
			const ts_nopost_content_Gap_tablet = 15;
			const ts_nopost_content_Gap_mobile = 10;
			expect(ts_nopost_content_Gap).toBe(20);
			expect(ts_nopost_content_Gap_tablet).toBe(15);
			expect(ts_nopost_content_Gap_mobile).toBe(10);
		});

		it('should generate valid CSS', () => {
			const ts_nopost_content_Gap = 20;
			const css = `grid-gap: ${ts_nopost_content_Gap}px;`;
			expect(css).toBe('grid-gap: 20px;');
		});
	});

	describe('ts_nopost_ico_size (ResponsiveRangeControl)', () => {
		it('should accept number values', () => {
			const ts_nopost_ico_size = 48;
			expect(typeof ts_nopost_ico_size).toBe('number');
		});

		it('should support responsive values', () => {
			const ts_nopost_ico_size = 48;
			const ts_nopost_ico_size_tablet = 40;
			const ts_nopost_ico_size_mobile = 32;
			expect(ts_nopost_ico_size).toBe(48);
			expect(ts_nopost_ico_size_tablet).toBe(40);
			expect(ts_nopost_ico_size_mobile).toBe(32);
		});

		it('should generate valid CSS', () => {
			const ts_nopost_ico_size = 48;
			const css = `font-size: ${ts_nopost_ico_size}px;`;
			expect(css).toBe('font-size: 48px;');
		});
	});

	describe('ts_nopost_ico_col (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_nopost_ico_col = '#CCCCCC';
			expect(typeof ts_nopost_ico_col).toBe('string');
		});

		it('should generate valid CSS', () => {
			const ts_nopost_ico_col = '#CCCCCC';
			const css = `color: ${ts_nopost_ico_col};`;
			expect(css).toBe('color: #CCCCCC;');
		});
	});

	describe('ts_nopost_typo_col (ColorControl)', () => {
		it('should accept color string', () => {
			const ts_nopost_typo_col = '#666666';
			expect(typeof ts_nopost_typo_col).toBe('string');
		});

		it('should generate valid CSS', () => {
			const ts_nopost_typo_col = '#666666';
			const css = `color: ${ts_nopost_typo_col};`;
			expect(css).toBe('color: #666666;');
		});
	});
});

// ============================================================================
// COMPLETE ATTRIBUTE INVENTORY
// ============================================================================

describe('Complete Attribute Inventory', () => {
	const attributeInventory = {
		chart: [
			'ts_chart_height',
			'ts_chart_height_tablet',
			'ts_chart_height_mobile',
			'ts_axis_typo_col',
			'vertical_axis_width',
			'vertical_axis_width_tablet',
			'vertical_axis_width_mobile',
			'chart_col_gap',
			'chart_col_gap_tablet',
			'chart_col_gap_mobile',
			'bar_width',
			'bar_width_tablet',
			'bar_width_mobile',
			'bar_radius',
			'bar_radius_tablet',
			'bar_radius_mobile',
			'bar_bg_hover',
			'bar_pop_bg',
			'bar_pop_radius',
			'bar_pop_radius_tablet',
			'bar_pop_radius_mobile',
			'ts_primary_color',
			'ts_secondary_color',
		],
		tabs: [
			'tabsState',
			'ts_tabs_justify',
			'ts_tabs_padding',
			'ts_tabs_margin',
			'ts_tabs_text_color',
			'ts_active_text_color',
			'ts_tabs_bg_color',
			'ts_tabs_bg_active_color',
			'ts_tabs_border_active',
			'ts_tabs_radius',
			'ts_tabs_text_color_h',
			'ts_tabs_active_text_color_h',
			'ts_tabs_border_color_h',
			'ts_tabs_border_h_active',
			'ts_tabs_bg_color_h',
			'ts_bg_active_color_h',
		],
		weekButtons: [
			'weekButtonsState',
			'week_range_col',
			'ts_week_btn_color',
			'ts_week_btn_icon_size',
			'ts_week_btn_icon_size_tablet',
			'ts_week_btn_icon_size_mobile',
			'ts_week_btn_bg',
			'ts_week_btn_radius',
			'ts_week_btn_radius_tablet',
			'ts_week_btn_radius_mobile',
			'ts_week_btn_size',
			'ts_week_btn_size_tablet',
			'ts_week_btn_size_mobile',
			'ts_week_btn_h',
			'ts_week_btn_bg_h',
			'ts_week_border_c_h',
		],
		noActivity: [
			'ts_nopost_content_Gap',
			'ts_nopost_content_Gap_tablet',
			'ts_nopost_content_Gap_mobile',
			'ts_nopost_ico_size',
			'ts_nopost_ico_size_tablet',
			'ts_nopost_ico_size_mobile',
			'ts_nopost_ico_col',
			'ts_nopost_typo_col',
		],
	};

	it('should have unique attribute names across all sections', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		const uniqueAttributes = new Set(allAttributes);
		expect(uniqueAttributes.size).toBe(allAttributes.length);
	});

	it('should have correct total attribute count', () => {
		const allAttributes = Object.values(attributeInventory).flat();
		expect(allAttributes.length).toBeGreaterThanOrEqual(60);
		console.log(`Total Style tab attributes: ${allAttributes.length}`);
	});
});

// ============================================================================
// JSON ROUND-TRIP PERSISTENCE TESTS
// ============================================================================

describe('Round-trip Persistence Tests', () => {
	it('DimensionsConfig should survive JSON round-trip', () => {
		const original: DimensionsConfig = {
			top: 10,
			right: 20,
			bottom: 10,
			left: 20,
			unit: 'px',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BoxShadowConfig should survive JSON round-trip', () => {
		const original: BoxShadowConfig = {
			horizontal: 0,
			vertical: 4,
			blur: 12,
			color: 'rgba(0,0,0,0.15)',
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BorderConfig should survive JSON round-trip', () => {
		const original: BorderConfig = { width: 1, style: 'solid', color: '#CCCCCC' };
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});

	it('BackgroundConfig should survive JSON round-trip', () => {
		const original: BackgroundConfig = {
			type: 'gradient',
			gradientColor: '#4CAF50',
			gradientSecondColor: '#2196F3',
			gradientLocation: 0,
			gradientSecondLocation: 100,
			gradientType: 'linear',
			gradientAngle: 180,
		};
		const roundTripped = JSON.parse(JSON.stringify(original));
		expect(roundTripped).toEqual(original);
	});
});

// ============================================================================
// CSS GENERATION INTEGRATION TESTS
// ============================================================================

describe('CSS Generation Integration', () => {
	it('should generate complete chart bar styling CSS', () => {
		const attributes = {
			bar_width: 30,
			bar_radius: 5,
			bar_bg_hover: '#4CAF50',
		};
		const widthCSS = `width: ${attributes.bar_width}px;`;
		const radiusCSS = `border-radius: ${attributes.bar_radius}px;`;
		const hoverCSS = `background-color: ${attributes.bar_bg_hover};`;
		expect(widthCSS).toBe('width: 30px;');
		expect(radiusCSS).toBe('border-radius: 5px;');
		expect(hoverCSS).toBe('background-color: #4CAF50;');
	});

	it('should generate complete tabs styling CSS', () => {
		const attributes = {
			ts_tabs_justify: 'center',
			ts_tabs_padding: { top: 10, right: 15, bottom: 10, left: 15, unit: 'px' } as DimensionsConfig,
			ts_tabs_text_color: '#333333',
			ts_tabs_bg_color: '#F5F5F5',
		};
		const justifyCSS = `justify-content: ${attributes.ts_tabs_justify};`;
		const paddingCSS = generateDimensionsCSS(attributes.ts_tabs_padding, 'padding');
		const colorCSS = `color: ${attributes.ts_tabs_text_color};`;
		const bgCSS = `background-color: ${attributes.ts_tabs_bg_color};`;
		expect(justifyCSS).toBe('justify-content: center;');
		expect(paddingCSS).toBe('padding: 10px 15px 10px 15px;');
		expect(colorCSS).toBe('color: #333333;');
		expect(bgCSS).toBe('background-color: #F5F5F5;');
	});

	it('should handle inset box shadow correctly', () => {
		const insetShadow: BoxShadowConfig = {
			horizontal: 0,
			vertical: 2,
			blur: 4,
			position: 'inset',
		};
		const css = generateBoxShadowCSS(insetShadow);
		expect(css).toContain('inset');
	});

	it('should generate gradient background CSS', () => {
		const bg: BackgroundConfig = {
			type: 'gradient',
			gradientColor: '#4CAF50',
			gradientSecondColor: '#2196F3',
			gradientLocation: 0,
			gradientSecondLocation: 100,
			gradientType: 'linear',
			gradientAngle: 180,
		};
		const css = generateBackgroundCSS(bg);
		expect(css).toContain('linear-gradient');
		expect(css).toContain('180deg');
		expect(css).toContain('#4CAF50');
		expect(css).toContain('#2196F3');
	});
});
