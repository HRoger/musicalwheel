/**
 * AdvancedTab Attribute Schema Tests
 *
 * Tests for attribute schema completeness and type correctness.
 * Ensures 1:1 parity with Elementor's Advanced Tab Layout section.
 *
 * Evidence: plugins/elementor/includes/widgets/common-base.php (L288-L818)
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import { advancedTabAttributes } from '../AdvancedTab';

// ============================================================================
// Attribute Schema Completeness Tests
// Evidence: Elementor common-base.php Layout section controls
// ============================================================================

describe('AdvancedTab Attribute Schema', () => {
	describe('Schema Existence', () => {
		it('should export advancedTabAttributes object', () => {
			expect(advancedTabAttributes).toBeDefined();
			expect(typeof advancedTabAttributes).toBe('object');
		});
	});

	describe('Margin & Padding (L307-L329)', () => {
		it('should have blockMargin responsive attributes', () => {
			expect(advancedTabAttributes.blockMargin).toBeDefined();
			expect(advancedTabAttributes.blockMargin.type).toBe('object');
			expect(advancedTabAttributes.blockMargin_tablet).toBeDefined();
			expect(advancedTabAttributes.blockMargin_mobile).toBeDefined();
		});

		it('should have blockPadding responsive attributes', () => {
			expect(advancedTabAttributes.blockPadding).toBeDefined();
			expect(advancedTabAttributes.blockPadding.type).toBe('object');
			expect(advancedTabAttributes.blockPadding_tablet).toBeDefined();
			expect(advancedTabAttributes.blockPadding_mobile).toBeDefined();
		});
	});

	describe('Width Controls (L334-L375)', () => {
		it('should have elementWidth responsive attributes', () => {
			expect(advancedTabAttributes.elementWidth).toBeDefined();
			expect(advancedTabAttributes.elementWidth.type).toBe('string');
			expect(advancedTabAttributes.elementWidth.default).toBe('');
			expect(advancedTabAttributes.elementWidth_tablet).toBeDefined();
			expect(advancedTabAttributes.elementWidth_mobile).toBeDefined();
		});

		it('should have elementCustomWidth responsive attributes with unit', () => {
			expect(advancedTabAttributes.elementCustomWidth).toBeDefined();
			expect(advancedTabAttributes.elementCustomWidth.type).toBe('number');
			expect(advancedTabAttributes.elementCustomWidth_tablet).toBeDefined();
			expect(advancedTabAttributes.elementCustomWidth_mobile).toBeDefined();
			expect(advancedTabAttributes.elementCustomWidthUnit).toBeDefined();
			expect(advancedTabAttributes.elementCustomWidthUnit.type).toBe('string');
			expect(advancedTabAttributes.elementCustomWidthUnit.default).toBe('%');
		});
	});

	describe('Grid Item Controls (L377-L473)', () => {
		it('should have gridColumn responsive attributes with custom', () => {
			expect(advancedTabAttributes.gridColumn).toBeDefined();
			expect(advancedTabAttributes.gridColumn.type).toBe('string');
			expect(advancedTabAttributes.gridColumn_tablet).toBeDefined();
			expect(advancedTabAttributes.gridColumn_mobile).toBeDefined();
			expect(advancedTabAttributes.gridColumnCustom).toBeDefined();
			expect(advancedTabAttributes.gridColumnCustom_tablet).toBeDefined();
			expect(advancedTabAttributes.gridColumnCustom_mobile).toBeDefined();
		});

		it('should have gridRow responsive attributes with custom', () => {
			expect(advancedTabAttributes.gridRow).toBeDefined();
			expect(advancedTabAttributes.gridRow.type).toBe('string');
			expect(advancedTabAttributes.gridRow_tablet).toBeDefined();
			expect(advancedTabAttributes.gridRow_mobile).toBeDefined();
			expect(advancedTabAttributes.gridRowCustom).toBeDefined();
			expect(advancedTabAttributes.gridRowCustom_tablet).toBeDefined();
			expect(advancedTabAttributes.gridRowCustom_mobile).toBeDefined();
		});
	});

	describe('Flexbox Item Controls (L475-L499)', () => {
		it('should have flexAlignSelf responsive attributes', () => {
			expect(advancedTabAttributes.flexAlignSelf).toBeDefined();
			expect(advancedTabAttributes.flexAlignSelf.type).toBe('string');
			expect(advancedTabAttributes.flexAlignSelf_tablet).toBeDefined();
			expect(advancedTabAttributes.flexAlignSelf_mobile).toBeDefined();
		});

		it('should have flexOrder responsive attributes with custom', () => {
			expect(advancedTabAttributes.flexOrder).toBeDefined();
			expect(advancedTabAttributes.flexOrder.type).toBe('string');
			expect(advancedTabAttributes.flexOrder.default).toBe('');
			expect(advancedTabAttributes.flexOrder_tablet).toBeDefined();
			expect(advancedTabAttributes.flexOrder_mobile).toBeDefined();
			expect(advancedTabAttributes.flexOrderCustom).toBeDefined();
			expect(advancedTabAttributes.flexOrderCustom.type).toBe('number');
			expect(advancedTabAttributes.flexOrderCustom_tablet).toBeDefined();
			expect(advancedTabAttributes.flexOrderCustom_mobile).toBeDefined();
		});

		it('should have flexSize responsive attributes', () => {
			expect(advancedTabAttributes.flexSize).toBeDefined();
			expect(advancedTabAttributes.flexSize.type).toBe('string');
			expect(advancedTabAttributes.flexSize.default).toBe('');
			expect(advancedTabAttributes.flexSize_tablet).toBeDefined();
			expect(advancedTabAttributes.flexSize_mobile).toBeDefined();
		});

		it('should have flexGrow responsive attributes', () => {
			expect(advancedTabAttributes.flexGrow).toBeDefined();
			expect(advancedTabAttributes.flexGrow.type).toBe('number');
			expect(advancedTabAttributes.flexGrow.default).toBe(1);
			expect(advancedTabAttributes.flexGrow_tablet).toBeDefined();
			expect(advancedTabAttributes.flexGrow_mobile).toBeDefined();
		});

		it('should have flexShrink responsive attributes', () => {
			expect(advancedTabAttributes.flexShrink).toBeDefined();
			expect(advancedTabAttributes.flexShrink.type).toBe('number');
			expect(advancedTabAttributes.flexShrink.default).toBe(1);
			expect(advancedTabAttributes.flexShrink_tablet).toBeDefined();
			expect(advancedTabAttributes.flexShrink_mobile).toBeDefined();
		});
	});

	describe('Vertical Align (L511-L535)', () => {
		it('should have elementVerticalAlign responsive attributes', () => {
			expect(advancedTabAttributes.elementVerticalAlign).toBeDefined();
			expect(advancedTabAttributes.elementVerticalAlign.type).toBe('string');
			expect(advancedTabAttributes.elementVerticalAlign_tablet).toBeDefined();
			expect(advancedTabAttributes.elementVerticalAlign_mobile).toBeDefined();
		});
	});

	describe('Position Controls (L537-L768)', () => {
		it('should have position attribute', () => {
			expect(advancedTabAttributes.position).toBeDefined();
			expect(advancedTabAttributes.position.type).toBe('string');
			expect(advancedTabAttributes.position.default).toBe('');
		});

		it('should have horizontal offset attributes', () => {
			expect(advancedTabAttributes.offsetOrientationH).toBeDefined();
			expect(advancedTabAttributes.offsetOrientationH.default).toBe('start');
			expect(advancedTabAttributes.offsetX).toBeDefined();
			expect(advancedTabAttributes.offsetX_tablet).toBeDefined();
			expect(advancedTabAttributes.offsetX_mobile).toBeDefined();
			expect(advancedTabAttributes.offsetXUnit).toBeDefined();
			expect(advancedTabAttributes.offsetXEnd).toBeDefined();
			expect(advancedTabAttributes.offsetXEnd_tablet).toBeDefined();
			expect(advancedTabAttributes.offsetXEnd_mobile).toBeDefined();
			expect(advancedTabAttributes.offsetXEndUnit).toBeDefined();
		});

		it('should have vertical offset attributes', () => {
			expect(advancedTabAttributes.offsetOrientationV).toBeDefined();
			expect(advancedTabAttributes.offsetOrientationV.default).toBe('start');
			expect(advancedTabAttributes.offsetY).toBeDefined();
			expect(advancedTabAttributes.offsetY_tablet).toBeDefined();
			expect(advancedTabAttributes.offsetY_mobile).toBeDefined();
			expect(advancedTabAttributes.offsetYUnit).toBeDefined();
			expect(advancedTabAttributes.offsetYEnd).toBeDefined();
			expect(advancedTabAttributes.offsetYEnd_tablet).toBeDefined();
			expect(advancedTabAttributes.offsetYEnd_mobile).toBeDefined();
			expect(advancedTabAttributes.offsetYEndUnit).toBeDefined();
		});
	});

	describe('Z-Index (L770-L779)', () => {
		it('should have zIndex responsive attributes', () => {
			expect(advancedTabAttributes.zIndex).toBeDefined();
			// Note: zIndex is 'string' type to support values like "auto", "inherit"
			expect(advancedTabAttributes.zIndex.type).toBe('string');
			expect(advancedTabAttributes.zIndex_tablet).toBeDefined();
			expect(advancedTabAttributes.zIndex_mobile).toBeDefined();
		});
	});

	describe('CSS ID & Classes (L781-L814)', () => {
		it('should have elementId attribute', () => {
			expect(advancedTabAttributes.elementId).toBeDefined();
			expect(advancedTabAttributes.elementId.type).toBe('string');
		});

		it('should have customClasses attribute', () => {
			expect(advancedTabAttributes.customClasses).toBeDefined();
			expect(advancedTabAttributes.customClasses.type).toBe('string');
		});
	});

	describe('Responsive Visibility', () => {
		it('should have hide attributes for each device', () => {
			expect(advancedTabAttributes.hideDesktop).toBeDefined();
			expect(advancedTabAttributes.hideDesktop.type).toBe('boolean');
			expect(advancedTabAttributes.hideDesktop.default).toBe(false);

			expect(advancedTabAttributes.hideTablet).toBeDefined();
			expect(advancedTabAttributes.hideTablet.type).toBe('boolean');
			expect(advancedTabAttributes.hideTablet.default).toBe(false);

			expect(advancedTabAttributes.hideMobile).toBeDefined();
			expect(advancedTabAttributes.hideMobile.type).toBe('boolean');
			expect(advancedTabAttributes.hideMobile.default).toBe(false);
		});
	});

	describe('Custom CSS', () => {
		it('should have customCSS attribute', () => {
			expect(advancedTabAttributes.customCSS).toBeDefined();
			expect(advancedTabAttributes.customCSS.type).toBe('string');
		});
	});
});

// ============================================================================
// Attribute Count Test
// Verifies we have the expected number of attributes for full parity
// ============================================================================

describe('Attribute Count Verification', () => {
	it('should have at least 50 attributes for full Layout section parity', () => {
		const attributeCount = Object.keys(advancedTabAttributes).length;
		// Based on Elementor's Layout section:
		// - Margin: 3 (desktop, tablet, mobile)
		// - Padding: 3
		// - Width: 3 + 3 + 1 = 7
		// - Grid Column: 3 + 3 = 6
		// - Grid Row: 3 + 3 = 6
		// - Flexbox Item: 3 + 3 + 3 + 3 + 3 + 3 = 18
		// - Vertical Align: 3
		// - Position: 1 + 1 + 4*3 + 1 + 4*3 + 1 = 28
		// - Z-Index: 3
		// - CSS ID/Classes: 2
		// - Responsive: 3
		// - Custom CSS: 1
		// Total: ~68+
		expect(attributeCount).toBeGreaterThanOrEqual(68);
	});

	it('should have all responsive suffixes (_tablet, _mobile) for responsive controls', () => {
		const responsiveControls = [
			'blockMargin',
			'blockPadding',
			'elementWidth',
			'elementCustomWidth',
			'gridColumn',
			'gridColumnCustom',
			'gridRow',
			'gridRowCustom',
			'flexAlignSelf',
			'flexOrder',
			'flexOrderCustom',
			'flexSize',
			'flexGrow',
			'flexShrink',
			'elementVerticalAlign',
			'offsetX',
			'offsetXEnd',
			'offsetY',
			'offsetYEnd',
			'zIndex',
		];

		responsiveControls.forEach((control) => {
			expect(
				advancedTabAttributes[control],
				`${control} should exist`
			).toBeDefined();
			expect(
				advancedTabAttributes[`${control}_tablet`],
				`${control}_tablet should exist`
			).toBeDefined();
			expect(
				advancedTabAttributes[`${control}_mobile`],
				`${control}_mobile should exist`
			).toBeDefined();
		});
	});
});

// ============================================================================
// Type Safety Tests
// Verifies attribute types match expected Gutenberg block.json format
// ============================================================================

describe('Attribute Type Safety', () => {
	it('should have valid type values for all attributes', () => {
		const validTypes = ['string', 'number', 'boolean', 'object', 'array'];

		Object.entries(advancedTabAttributes).forEach(([key, attr]) => {
			expect(
				validTypes.includes((attr as { type: string }).type),
				`${key} should have a valid type, got: ${(attr as { type: string }).type}`
			).toBe(true);
		});
	});

	it('should have default values where required', () => {
		// These attributes should have explicit defaults
		const attributesWithDefaults = [
			'blockMargin',
			'blockPadding',
			'elementWidth',
			'elementCustomWidthUnit',
			'gridColumn',
			'gridRow',
			'position',
			'offsetOrientationH',
			'offsetOrientationV',
			'offsetXUnit',
			'offsetXEndUnit',
			'offsetYUnit',
			'offsetYEndUnit',
			'hideDesktop',
			'hideTablet',
			'hideMobile',
		];

		attributesWithDefaults.forEach((attrName) => {
			const attr = advancedTabAttributes[attrName] as { default?: unknown };
			expect(
				attr.default !== undefined,
				`${attrName} should have a default value`
			).toBe(true);
		});
	});
});
