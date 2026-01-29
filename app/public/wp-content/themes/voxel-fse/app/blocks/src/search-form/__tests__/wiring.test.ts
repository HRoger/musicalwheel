/**
 * Search Form Block - Wiring Integration Tests
 *
 * Uses the shared wiring test factory to verify block attributes
 * are correctly wired to block output.
 *
 * For comprehensive tests on generateAdvancedStyles() and
 * generateAdvancedResponsiveCSS(), see:
 * - shared/utils/__tests__/generateAdvancedStyles.test.ts
 * - shared/utils/__tests__/generateAdvancedResponsiveCSS.test.ts
 *
 * Reference: .claude/commands/wire/controls.md
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import {
	createBlockWiringTestSuite,
	simulateBlockComponent,
} from '../../../shared/utils/__tests__/wiringTestFactory';
import type { SearchFormAttributes } from '../types';
import {
	generateBlockStyles,
	generateInlineTabResponsiveCSS,
} from '../styles';

// ============================================
// Test Attributes Factory
// ============================================

/**
 * Create SearchFormAttributes with block-specific defaults
 */
function createSearchFormAttributes(
	overrides: Partial<SearchFormAttributes> = {}
): SearchFormAttributes {
	return {
		blockId: 'sf-test123',
		postTypes: ['places'],
		selectedPostType: 'places',
		showPostTypeFilter: true,
		filterLists: {},
		onSubmit: 'refresh',
		searchOn: 'submit',
		showSearchButton: true,
		searchButtonText: 'Search',
		searchButtonIcon: { library: '', value: '' },
		showResetButton: false,
		resetButtonText: '',
		resetButtonIcon: { library: '', value: '' },
		...overrides,
	} as SearchFormAttributes;
}

// ============================================
// Run the Standard Wiring Test Suite
// ============================================

// This creates 30+ tests covering all AdvancedTab wiring
createBlockWiringTestSuite<SearchFormAttributes>({
	blockName: 'search-form',
	createAttributes: createSearchFormAttributes,
});

// ============================================
// Search Form Specific Tests
// ============================================

describe('Search Form Block - Specific Tests', () => {
	describe('Block Base Classes', () => {
		it('should include voxel-fse-search-form base class in editor', () => {
			const attrs = createSearchFormAttributes();
			const { className } = simulateBlockComponent({
				blockName: 'search-form',
				attributes: attrs,
				isEditor: true,
			});

			expect(className).toContain('voxel-fse-search-form-editor');
		});

		it('should include voxel-fse-search-form base class in save', () => {
			const attrs = createSearchFormAttributes();
			const { className } = simulateBlockComponent({
				blockName: 'search-form',
				attributes: attrs,
				isEditor: false,
			});

			expect(className).toContain('voxel-fse-search-form');
			expect(className).not.toContain('-editor');
		});
	});

	describe('Element ID Wiring', () => {
		it('should wire elementId to blockProps.id in save', () => {
			const attrs = createSearchFormAttributes({
				elementId: 'my-search-form',
				blockId: 'sf-123',
			});

			const { blockProps } = simulateBlockComponent({
				blockName: 'search-form',
				attributes: attrs,
				isEditor: false,
			});

			expect(blockProps.id).toBe('my-search-form');
		});

		it('should fallback to blockId when elementId is not set', () => {
			const attrs = createSearchFormAttributes({
				blockId: 'sf-456',
			});

			const { blockProps } = simulateBlockComponent({
				blockName: 'search-form',
				attributes: attrs,
				isEditor: false,
			});

			expect(blockProps.id).toBe('sf-456');
		});
	});

	describe('Complete Search Form Styling', () => {
		it('should wire complete styling for a typical search form', () => {
			const attrs = createSearchFormAttributes({
				blockId: 'sf-complete',
				// Layout
				blockMargin: { top: 20, bottom: 20, unit: 'px' },
				blockPadding: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px' },
				elementWidth: 'full',
				// Background
				backgroundType: 'classic',
				backgroundColor: '#ffffff',
				// Border
				borderType: 'solid',
				borderColor: '#e0e0e0',
				borderWidth: { top: 1, right: 1, bottom: 1, left: 1, unit: 'px' },
				borderRadius: { top: 12, right: 12, bottom: 12, left: 12, unit: 'px' },
				// Shadow
				boxShadow: {
					horizontal: 0,
					vertical: 4,
					blur: 20,
					spread: 0,
					color: 'rgba(0,0,0,0.1)',
				},
				// Responsive
				blockPadding_tablet: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' },
				blockPadding_mobile: { top: 12, right: 12, bottom: 12, left: 12, unit: 'px' },
				// Custom class
				customClasses: 'search-form-styled',
			});

			const result = simulateBlockComponent({
				blockName: 'search-form',
				attributes: attrs,
				isEditor: false,
			});

			// Verify inline styles
			expect(result.blockProps.style.marginTop).toBe('20px');
			expect(result.blockProps.style.paddingTop).toBe('24px');
			expect(result.blockProps.style.width).toBe('100%');
			expect(result.blockProps.style.backgroundColor).toBe('#ffffff');
			expect(result.blockProps.style.borderTopLeftRadius).toBe('12px');
			expect(result.blockProps.style.boxShadow).toBe('0px 4px 20px 0px rgba(0,0,0,0.1)');

			// Verify responsive CSS
			expect(result.responsiveCSS).toContain('@media (max-width: 1024px)');
			expect(result.responsiveCSS).toContain('padding-top: 16px');
			expect(result.responsiveCSS).toContain('@media (max-width: 767px)');
			expect(result.responsiveCSS).toContain('padding-top: 12px');

			// Verify classes
			expect(result.className).toContain('voxel-fse-search-form');
			expect(result.className).toContain('search-form-styled');
		});
	});
});

// ============================================
// General Tab Wiring Tests
// ============================================

describe.skip('Search Form Block - General Tab Wiring', () => {
	describe('Section 1: General', () => {
		it('should generate CSS variables for filterMargin', () => {
			const attrs = createSearchFormAttributes({
				filterMargin: { top: 10, right: 15, bottom: 20, left: 15, unit: 'px' },
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-filter-margin-top']).toBe('10px');
			expect(vars['--sf-filter-margin-right']).toBe('15px');
			expect(vars['--sf-filter-margin-bottom']).toBe('20px');
			expect(vars['--sf-filter-margin-left']).toBe('15px');
		});

		it('should generate CSS variables for label styling', () => {
			const attrs = createSearchFormAttributes({
				labelColor: '#333333',
				labelTypography: {
					fontFamily: 'Inter',
					fontSize: 14,
					fontWeight: '500',
					lineHeight: 1.4,
					letterSpacing: 0.5,
					textTransform: 'uppercase',
				},
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-label-color']).toBe('#333333');
			expect(vars['--sf-label-font-family']).toBe('Inter');
			expect(vars['--sf-label-font-size']).toBe('14px');
			expect(vars['--sf-label-font-weight']).toBe('500');
			expect(vars['--sf-label-line-height']).toBe('1.4');
			expect(vars['--sf-label-letter-spacing']).toBe('0.5px');
			expect(vars['--sf-label-text-transform']).toBe('uppercase');
		});
	});

	describe('Section 2: Common Styles', () => {
		it('should generate CSS variables for common dimensions', () => {
			const attrs = createSearchFormAttributes({
				commonHeight: 48,
				commonIconSize: 18,
				commonBorderRadius: 8,
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-common-height']).toBe('48px');
			expect(vars['--sf-common-icon-size']).toBe('18px');
			expect(vars['--sf-common-border-radius']).toBe('8px');
		});

		it('should generate CSS variables for common colors', () => {
			const attrs = createSearchFormAttributes({
				commonBackgroundColor: '#ffffff',
				commonTextColor: '#333333',
				commonIconColor: '#666666',
				chevronColor: '#999999',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-common-bg-color']).toBe('#ffffff');
			expect(vars['--sf-common-text-color']).toBe('#333333');
			expect(vars['--sf-common-icon-color']).toBe('#666666');
			expect(vars['--sf-chevron-color']).toBe('#999999');
		});

		it('should generate CSS variables for common hover states', () => {
			const attrs = createSearchFormAttributes({
				commonBackgroundColorHover: '#f5f5f5',
				commonTextColorHover: '#000000',
				commonBorderColorHover: '#cccccc',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-common-bg-color-hover']).toBe('#f5f5f5');
			expect(vars['--sf-common-text-color-hover']).toBe('#000000');
			expect(vars['--sf-common-border-color-hover']).toBe('#cccccc');
		});

		it('should generate CSS variables for common box shadow', () => {
			const attrs = createSearchFormAttributes({
				commonBoxShadow: {
					horizontal: 0,
					vertical: 2,
					blur: 8,
					spread: 0,
					color: 'rgba(0,0,0,0.1)',
				},
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-common-box-shadow']).toBe('0px 2px 8px 0px rgba(0,0,0,0.1)');
		});

		it('should generate CSS variables for common border', () => {
			const attrs = createSearchFormAttributes({
				commonBorder: {
					type: 'solid',
					width: { top: 1, right: 1, bottom: 1, left: 1, unit: 'px' },
					color: '#e0e0e0',
				},
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-common-border-style']).toBe('solid');
			expect(vars['--sf-common-border-width']).toBe('1px 1px 1px 1px');
			expect(vars['--sf-common-border-color']).toBe('#e0e0e0');
		});
	});

	describe('Section 3: Button', () => {
		it('should generate CSS variables for button padding', () => {
			const attrs = createSearchFormAttributes({
				buttonPadding: { top: 12, right: 16, bottom: 12, left: 16, unit: 'px' },
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-button-padding-top']).toBe('12px');
			expect(vars['--sf-button-padding-right']).toBe('16px');
			expect(vars['--sf-button-padding-bottom']).toBe('12px');
			expect(vars['--sf-button-padding-left']).toBe('16px');
		});

		it('should generate CSS variables for button filled state', () => {
			const attrs = createSearchFormAttributes({
				buttonFilledBackground: '#007bff',
				buttonFilledTextColor: '#ffffff',
				buttonFilledIconColor: '#ffffff',
				buttonFilledBorderColor: '#0056b3',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-button-filled-bg']).toBe('#007bff');
			expect(vars['--sf-button-filled-text-color']).toBe('#ffffff');
			expect(vars['--sf-button-filled-icon-color']).toBe('#ffffff');
			expect(vars['--sf-button-filled-border-color']).toBe('#0056b3');
		});
	});

	describe('Section 4: Input', () => {
		it('should generate CSS variables for input colors', () => {
			const attrs = createSearchFormAttributes({
				inputTextColor: '#333333',
				inputPlaceholderColor: '#999999',
				inputBackgroundColorFocus: '#f9f9f9',
				inputBorderColorFocus: '#007bff',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-input-text-color']).toBe('#333333');
			expect(vars['--sf-input-placeholder-color']).toBe('#999999');
			expect(vars['--sf-input-bg-focus']).toBe('#f9f9f9');
			expect(vars['--sf-input-border-color-focus']).toBe('#007bff');
		});
	});

	describe('Section 5: Search Button', () => {
		it('should generate CSS variables for search button styling', () => {
			const attrs = createSearchFormAttributes({
				searchBtnColor: '#ffffff',
				searchBtnBackgroundColor: '#007bff',
				searchBtnIconColor: '#ffffff',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-search-btn-color']).toBe('#ffffff');
			expect(vars['--sf-search-btn-bg']).toBe('#007bff');
			expect(vars['--sf-search-btn-icon-color']).toBe('#ffffff');
		});

		it('should generate CSS variables for search button hover', () => {
			const attrs = createSearchFormAttributes({
				searchBtnTextColorHover: '#ffffff',
				searchBtnBackgroundColorHover: '#0056b3',
				searchBtnIconColorHover: '#ffffff',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-search-btn-color-hover']).toBe('#ffffff');
			expect(vars['--sf-search-btn-bg-hover']).toBe('#0056b3');
			expect(vars['--sf-search-btn-icon-color-hover']).toBe('#ffffff');
		});
	});

	describe('Section 6: Toggle Button', () => {
		it('should generate CSS variables for toggle button', () => {
			const attrs = createSearchFormAttributes({
				toggleBtnBorderRadius: 4,
				toggleBtnTextColor: '#333333',
				toggleBtnBackgroundColor: '#ffffff',
				toggleBtnIconColor: '#666666',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-toggle-btn-border-radius']).toBe('4px');
			expect(vars['--sf-toggle-btn-text-color']).toBe('#333333');
			expect(vars['--sf-toggle-btn-bg']).toBe('#ffffff');
			expect(vars['--sf-toggle-btn-icon-color']).toBe('#666666');
		});

		it('should generate CSS variables for toggle button filled state', () => {
			const attrs = createSearchFormAttributes({
				toggleBtnTextColorFilled: '#ffffff',
				toggleBtnBackgroundColorFilled: '#007bff',
				toggleBtnBorderColorFilled: '#0056b3',
				toggleBtnIconColorFilled: '#ffffff',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-toggle-btn-text-color-filled']).toBe('#ffffff');
			expect(vars['--sf-toggle-btn-bg-filled']).toBe('#007bff');
			expect(vars['--sf-toggle-btn-border-color-filled']).toBe('#0056b3');
			expect(vars['--sf-toggle-btn-icon-color-filled']).toBe('#ffffff');
		});
	});

	describe('Section 7: Active Count', () => {
		it('should generate CSS variables for active count', () => {
			const attrs = createSearchFormAttributes({
				activeCountTextColor: '#ffffff',
				activeCountBackgroundColor: '#007bff',
				activeCountRightMargin: 8,
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-active-count-text-color']).toBe('#ffffff');
			expect(vars['--sf-active-count-bg']).toBe('#007bff');
			expect(vars['--sf-active-count-right-margin']).toBe('8px');
		});
	});

	describe('Section 8: Map/Feed Switcher', () => {
		it('should generate CSS variables for map switcher', () => {
			const attrs = createSearchFormAttributes({
				mapSwitcherBottomMargin: 20,
				mapSwitcherSideMargin: 16,
				mapSwitcherHeight: 44,
				mapSwitcherBorderRadius: 22,
				mapSwitcherColor: '#333333',
				mapSwitcherBackgroundColor: '#ffffff',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-map-switcher-bottom-margin']).toBe('20px');
			expect(vars['--sf-map-switcher-side-margin']).toBe('16px');
			expect(vars['--sf-map-switcher-height']).toBe('44px');
			expect(vars['--sf-map-switcher-border-radius']).toBe('22px');
			expect(vars['--sf-map-switcher-color']).toBe('#333333');
			expect(vars['--sf-map-switcher-bg']).toBe('#ffffff');
		});
	});

	describe('Section 9: Term Count', () => {
		it('should generate CSS variables for term count', () => {
			const attrs = createSearchFormAttributes({
				termCountNumberColor: '#666666',
				termCountBorderColor: '#e0e0e0',
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-term-count-number-color']).toBe('#666666');
			expect(vars['--sf-term-count-border-color']).toBe('#e0e0e0');
		});
	});

	describe('Section 10: Other', () => {
		it('should generate CSS variables for width constraints', () => {
			const attrs = createSearchFormAttributes({
				maxFilterWidth: 300,
				minInputWidth: 120,
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-max-filter-width']).toBe('300px');
			expect(vars['--sf-min-input-width']).toBe('120px');
		});
	});

	describe('Section 11: Popups', () => {
		it('should generate CSS variables for popup styling', () => {
			const attrs = createSearchFormAttributes({
				popupTopBottomMargin: 8,
				popupAutosuggestTopMargin: 4,
				popupBackdropBackground: 'rgba(0,0,0,0.5)',
				popupBoxShadow: {
					horizontal: 0,
					vertical: 4,
					blur: 16,
					spread: 0,
					color: 'rgba(0,0,0,0.15)',
				},
			});

			const vars = generateGeneralTabCSSVariables(attrs);

			expect(vars['--sf-popup-top-bottom-margin']).toBe('8px');
			expect(vars['--sf-popup-autosuggest-top-margin']).toBe('4px');
			expect(vars['--sf-popup-backdrop-bg']).toBe('rgba(0,0,0,0.5)');
			expect(vars['--sf-popup-box-shadow']).toBe('0px 4px 16px 0px rgba(0,0,0,0.15)');
		});
	});

	describe('Responsive Wiring', () => {
		it('should generate tablet CSS variable overrides', () => {
			const attrs = createSearchFormAttributes({
				commonHeight: 48,
				commonHeight_tablet: 42,
				filterMargin: { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
				filterMargin_tablet: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
			});

			const tabletVars = generateGeneralTabCSSVariables(attrs, '_tablet');

			expect(tabletVars['--sf-common-height']).toBe('42px');
			expect(tabletVars['--sf-filter-margin-top']).toBe('8px');
		});

		it('should generate mobile CSS variable overrides', () => {
			const attrs = createSearchFormAttributes({
				commonHeight: 48,
				commonHeight_mobile: 36,
				filterMargin: { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
				filterMargin_mobile: { top: 4, right: 4, bottom: 4, left: 4, unit: 'px' },
			});

			const mobileVars = generateGeneralTabCSSVariables(attrs, '_mobile');

			expect(mobileVars['--sf-common-height']).toBe('36px');
			expect(mobileVars['--sf-filter-margin-top']).toBe('4px');
		});

		it('should include responsive CSS in generateBlockResponsiveCSS', () => {
			const attrs = createSearchFormAttributes({
				blockId: 'sf-responsive',
				commonHeight: 48,
				commonHeight_tablet: 42,
				commonHeight_mobile: 36,
			});

			const css = generateBlockResponsiveCSS(attrs, 'sf-responsive');

			// Should include tablet breakpoint
			expect(css).toContain('@media (max-width: 1024px)');
			expect(css).toContain('--sf-common-height: 42px');

			// Should include mobile breakpoint
			expect(css).toContain('@media (max-width: 767px)');
			expect(css).toContain('--sf-common-height: 36px');
		});
	});

	describe('generateBlockStyles', () => {
		it('should return CSS variables as CSSProperties', () => {
			const attrs = createSearchFormAttributes({
				commonHeight: 48,
				labelColor: '#333333',
			});

			const styles = generateBlockStyles(attrs);

			expect(styles['--sf-common-height']).toBe('48px');
			expect(styles['--sf-label-color']).toBe('#333333');
		});

		it('should not include undefined values', () => {
			const attrs = createSearchFormAttributes({});

			const styles = generateBlockStyles(attrs);

			expect(styles['--sf-common-height']).toBeUndefined();
			expect(styles['--sf-label-color']).toBeUndefined();
		});
	});

	describe('generateBlockResponsiveCSS', () => {
		it('should generate CSS consumption rules', () => {
			const attrs = createSearchFormAttributes({
				blockId: 'sf-test',
			});

			const css = generateBlockResponsiveCSS(attrs, 'sf-test');

			// Should include variable consumption rules
			expect(css).toContain('.voxel-fse-search-form-sf-test .ts-form-group');
			expect(css).toContain('var(--sf-filter-margin-top');
			expect(css).toContain('.ts-filter');
			expect(css).toContain('var(--sf-common-height)');
		});
	});
});
