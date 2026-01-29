/**
 * AdvancedTab Mask Controls Serialization Tests
 *
 * Tests for Mask attribute parsing, serialization, and schema completeness.
 * Ensures 1:1 parity with Elementor's common-base.php Mask section.
 *
 * Evidence: plugins/elementor/includes/widgets/common-base.php (L1077-L1302)
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import { advancedTabAttributes } from '../AdvancedTab';

// ============================================================================
// Type Definitions
// ============================================================================

interface MaskImage {
	id?: number;
	url?: string;
}

// ============================================================================
// Parse Functions (for value normalization)
// ============================================================================

/**
 * Parse mask switch value (boolean normalization)
 */
export function parseMaskSwitch(value: unknown): boolean {
	if (typeof value === 'boolean') return value;
	if (value === 'yes' || value === '1' || value === 1) return true;
	return false;
}

/**
 * Parse mask shape value with validation
 * Returns default 'circle' if invalid
 */
const VALID_MASK_SHAPES = [
	'circle', 'oval-vertical', 'oval-horizontal', 'pill-vertical', 'pill-horizontal',
	'triangle', 'diamond', 'pentagon', 'hexagon-vertical', 'hexagon-horizontal',
	'heptagon', 'octagon', 'parallelogram-right', 'parallelogram-left',
	'trapezoid-up', 'trapezoid-down', 'flower', 'sketch', 'hexagon', 'blob',
];

export function parseMaskShape(value: unknown): string {
	if (typeof value === 'string' && VALID_MASK_SHAPES.includes(value)) {
		return value;
	}
	return 'circle';
}

/**
 * Parse mask image value (media object)
 */
export function parseMaskImage(value: unknown): MaskImage | undefined {
	if (!value || typeof value !== 'object') return undefined;

	const obj = value as Record<string, unknown>;
	const result: MaskImage = {};

	if (typeof obj.id === 'number') result.id = obj.id;
	if (typeof obj.url === 'string') result.url = obj.url;

	// Return undefined if empty object
	if (Object.keys(result).length === 0) return undefined;

	return result;
}

/**
 * Parse mask size value with validation
 */
const VALID_MASK_SIZES = ['contain', 'cover', 'custom'];

export function parseMaskSize(value: unknown): string {
	if (typeof value === 'string' && VALID_MASK_SIZES.includes(value)) {
		return value;
	}
	return 'contain';
}

/**
 * Parse mask position value with validation
 */
const VALID_MASK_POSITIONS = [
	'center center', 'center left', 'center right',
	'top center', 'top left', 'top right',
	'bottom center', 'bottom left', 'bottom right',
	'custom',
];

export function parseMaskPosition(value: unknown): string {
	if (typeof value === 'string' && VALID_MASK_POSITIONS.includes(value)) {
		return value;
	}
	return 'center center';
}

/**
 * Parse mask repeat value with validation
 */
const VALID_MASK_REPEATS = ['no-repeat', 'repeat', 'repeat-x', 'repeat-y', 'round', 'space'];

export function parseMaskRepeat(value: unknown): string {
	if (typeof value === 'string' && VALID_MASK_REPEATS.includes(value)) {
		return value;
	}
	return 'no-repeat';
}

/**
 * Parse numeric value with bounds checking
 */
export function parseMaskNumeric(
	value: unknown,
	min: number = -200,
	max: number = 200,
	defaultValue: number = 0
): number {
	if (typeof value === 'number' && !isNaN(value)) {
		return Math.max(min, Math.min(max, value));
	}
	if (typeof value === 'string') {
		const parsed = parseFloat(value);
		if (!isNaN(parsed)) {
			return Math.max(min, Math.min(max, parsed));
		}
	}
	return defaultValue;
}

/**
 * Parse unit value with validation
 */
const VALID_UNITS = ['%', 'px', 'vw', 'vh', 'em', 'rem'];

export function parseMaskUnit(value: unknown, defaultUnit: string = '%'): string {
	if (typeof value === 'string' && VALID_UNITS.includes(value)) {
		return value;
	}
	return defaultUnit;
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize mask image (return undefined for empty/invalid)
 */
export function serializeMaskImage(value: MaskImage | undefined): MaskImage | undefined {
	if (!value) return undefined;
	if (!value.id && !value.url) return undefined;
	return value;
}

/**
 * Check if mask has any custom values (non-defaults)
 */
export function hasMaskValues(attrs: Record<string, unknown>): boolean {
	// Check if mask is enabled
	if (attrs.maskSwitch !== true) return false;

	// Check if any non-default values exist
	if (attrs.maskShape && attrs.maskShape !== 'circle') return true;
	if (attrs.maskImage || attrs.maskImage_tablet || attrs.maskImage_mobile) return true;
	if (attrs.maskSize && attrs.maskSize !== 'contain') return true;
	if (attrs.maskPosition && attrs.maskPosition !== 'center center') return true;
	if (attrs.maskRepeat && attrs.maskRepeat !== 'no-repeat') return true;

	return true; // Mask is enabled, so it has values
}

// ============================================================================
// Attribute Schema Tests
// ============================================================================

describe('AdvancedTab Mask Attribute Schema', () => {
	describe('Schema Existence', () => {
		it('should have maskSwitch boolean attribute', () => {
			expect(advancedTabAttributes.maskSwitch).toBeDefined();
			expect(advancedTabAttributes.maskSwitch.type).toBe('boolean');
			expect(advancedTabAttributes.maskSwitch.default).toBe(false);
		});

		it('should have maskShape string attribute', () => {
			expect(advancedTabAttributes.maskShape).toBeDefined();
			expect(advancedTabAttributes.maskShape.type).toBe('string');
			expect(advancedTabAttributes.maskShape.default).toBe('circle');
		});
	});

	describe('Mask Image (responsive, L1113-L1131)', () => {
		it('should have maskImage responsive attributes', () => {
			expect(advancedTabAttributes.maskImage).toBeDefined();
			expect(advancedTabAttributes.maskImage.type).toBe('object');
			expect(advancedTabAttributes.maskImage_tablet).toBeDefined();
			expect(advancedTabAttributes.maskImage_mobile).toBeDefined();
		});
	});

	describe('Mask Size (responsive, L1133-L1185)', () => {
		it('should have maskSize responsive attributes', () => {
			expect(advancedTabAttributes.maskSize).toBeDefined();
			expect(advancedTabAttributes.maskSize.type).toBe('string');
			expect(advancedTabAttributes.maskSize.default).toBe('contain');
			expect(advancedTabAttributes.maskSize_tablet).toBeDefined();
			expect(advancedTabAttributes.maskSize_mobile).toBeDefined();
		});

		it('should have maskSizeScale responsive attributes with unit', () => {
			expect(advancedTabAttributes.maskSizeScale).toBeDefined();
			expect(advancedTabAttributes.maskSizeScale.type).toBe('number');
			expect(advancedTabAttributes.maskSizeScale_tablet).toBeDefined();
			expect(advancedTabAttributes.maskSizeScale_mobile).toBeDefined();
			expect(advancedTabAttributes.maskSizeScaleUnit).toBeDefined();
			expect(advancedTabAttributes.maskSizeScaleUnit.default).toBe('%');
		});
	});

	describe('Mask Position (responsive, L1187-L1277)', () => {
		it('should have maskPosition responsive attributes', () => {
			expect(advancedTabAttributes.maskPosition).toBeDefined();
			expect(advancedTabAttributes.maskPosition.type).toBe('string');
			expect(advancedTabAttributes.maskPosition.default).toBe('center center');
			expect(advancedTabAttributes.maskPosition_tablet).toBeDefined();
			expect(advancedTabAttributes.maskPosition_mobile).toBeDefined();
		});

		it('should have maskPositionX responsive attributes with unit', () => {
			expect(advancedTabAttributes.maskPositionX).toBeDefined();
			expect(advancedTabAttributes.maskPositionX.type).toBe('number');
			expect(advancedTabAttributes.maskPositionX_tablet).toBeDefined();
			expect(advancedTabAttributes.maskPositionX_mobile).toBeDefined();
			expect(advancedTabAttributes.maskPositionXUnit).toBeDefined();
			expect(advancedTabAttributes.maskPositionXUnit.default).toBe('%');
		});

		it('should have maskPositionY responsive attributes with unit', () => {
			expect(advancedTabAttributes.maskPositionY).toBeDefined();
			expect(advancedTabAttributes.maskPositionY.type).toBe('number');
			expect(advancedTabAttributes.maskPositionY_tablet).toBeDefined();
			expect(advancedTabAttributes.maskPositionY_mobile).toBeDefined();
			expect(advancedTabAttributes.maskPositionYUnit).toBeDefined();
			expect(advancedTabAttributes.maskPositionYUnit.default).toBe('%');
		});
	});

	describe('Mask Repeat (responsive, L1279-L1300)', () => {
		it('should have maskRepeat responsive attributes', () => {
			expect(advancedTabAttributes.maskRepeat).toBeDefined();
			expect(advancedTabAttributes.maskRepeat.type).toBe('string');
			expect(advancedTabAttributes.maskRepeat.default).toBe('no-repeat');
			expect(advancedTabAttributes.maskRepeat_tablet).toBeDefined();
			expect(advancedTabAttributes.maskRepeat_mobile).toBeDefined();
		});
	});
});

// ============================================================================
// Parse Function Tests
// ============================================================================

describe('Mask Value Parsing', () => {
	describe('parseMaskSwitch', () => {
		it('should return true for boolean true', () => {
			expect(parseMaskSwitch(true)).toBe(true);
		});

		it('should return false for boolean false', () => {
			expect(parseMaskSwitch(false)).toBe(false);
		});

		it('should return true for Elementor "yes" string', () => {
			expect(parseMaskSwitch('yes')).toBe(true);
		});

		it('should return true for "1" string', () => {
			expect(parseMaskSwitch('1')).toBe(true);
		});

		it('should return false for null/undefined', () => {
			expect(parseMaskSwitch(null)).toBe(false);
			expect(parseMaskSwitch(undefined)).toBe(false);
		});

		it('should return false for invalid values', () => {
			expect(parseMaskSwitch('invalid')).toBe(false);
			expect(parseMaskSwitch({})).toBe(false);
		});
	});

	describe('parseMaskShape', () => {
		it('should return valid shape values unchanged', () => {
			expect(parseMaskShape('circle')).toBe('circle');
			expect(parseMaskShape('diamond')).toBe('diamond');
			expect(parseMaskShape('blob')).toBe('blob');
		});

		it('should return "circle" for invalid values', () => {
			expect(parseMaskShape('invalid')).toBe('circle');
			expect(parseMaskShape(null)).toBe('circle');
			expect(parseMaskShape(undefined)).toBe('circle');
			expect(parseMaskShape(123)).toBe('circle');
		});

		it('should validate all 20 Elementor shapes', () => {
			VALID_MASK_SHAPES.forEach((shape) => {
				expect(parseMaskShape(shape)).toBe(shape);
			});
		});
	});

	describe('parseMaskImage', () => {
		it('should parse valid image object', () => {
			const input = { id: 123, url: 'http://example.com/image.png' };
			const result = parseMaskImage(input);
			expect(result).toEqual(input);
		});

		it('should handle partial object (id only)', () => {
			const input = { id: 123 };
			const result = parseMaskImage(input);
			expect(result).toEqual({ id: 123 });
		});

		it('should handle partial object (url only)', () => {
			const input = { url: 'http://example.com/image.png' };
			const result = parseMaskImage(input);
			expect(result).toEqual({ url: 'http://example.com/image.png' });
		});

		it('should return undefined for null/undefined', () => {
			expect(parseMaskImage(null)).toBeUndefined();
			expect(parseMaskImage(undefined)).toBeUndefined();
		});

		it('should return undefined for empty object', () => {
			expect(parseMaskImage({})).toBeUndefined();
		});

		it('should ignore invalid properties', () => {
			const input = { id: 'invalid', url: 123, other: 'value' };
			expect(parseMaskImage(input)).toBeUndefined();
		});
	});

	describe('parseMaskSize', () => {
		it('should return valid size values unchanged', () => {
			expect(parseMaskSize('contain')).toBe('contain');
			expect(parseMaskSize('cover')).toBe('cover');
			expect(parseMaskSize('custom')).toBe('custom');
		});

		it('should return "contain" for invalid values', () => {
			expect(parseMaskSize('invalid')).toBe('contain');
			expect(parseMaskSize(null)).toBe('contain');
			expect(parseMaskSize(undefined)).toBe('contain');
		});
	});

	describe('parseMaskPosition', () => {
		it('should return valid position values unchanged', () => {
			expect(parseMaskPosition('center center')).toBe('center center');
			expect(parseMaskPosition('top left')).toBe('top left');
			expect(parseMaskPosition('custom')).toBe('custom');
		});

		it('should return "center center" for invalid values', () => {
			expect(parseMaskPosition('invalid')).toBe('center center');
			expect(parseMaskPosition(null)).toBe('center center');
		});
	});

	describe('parseMaskRepeat', () => {
		it('should return valid repeat values unchanged', () => {
			expect(parseMaskRepeat('no-repeat')).toBe('no-repeat');
			expect(parseMaskRepeat('repeat')).toBe('repeat');
			expect(parseMaskRepeat('repeat-x')).toBe('repeat-x');
		});

		it('should return "no-repeat" for invalid values', () => {
			expect(parseMaskRepeat('invalid')).toBe('no-repeat');
			expect(parseMaskRepeat(null)).toBe('no-repeat');
		});
	});

	describe('parseMaskNumeric', () => {
		it('should return valid numbers unchanged', () => {
			expect(parseMaskNumeric(50)).toBe(50);
			expect(parseMaskNumeric(-100)).toBe(-100);
		});

		it('should clamp values to bounds', () => {
			expect(parseMaskNumeric(500, -200, 200)).toBe(200);
			expect(parseMaskNumeric(-500, -200, 200)).toBe(-200);
		});

		it('should parse string numbers', () => {
			expect(parseMaskNumeric('50')).toBe(50);
			expect(parseMaskNumeric('-100')).toBe(-100);
		});

		it('should return default for invalid values', () => {
			expect(parseMaskNumeric('invalid')).toBe(0);
			expect(parseMaskNumeric(null)).toBe(0);
			expect(parseMaskNumeric(undefined)).toBe(0);
		});
	});

	describe('parseMaskUnit', () => {
		it('should return valid units unchanged', () => {
			expect(parseMaskUnit('%')).toBe('%');
			expect(parseMaskUnit('px')).toBe('px');
			expect(parseMaskUnit('vw')).toBe('vw');
		});

		it('should return default unit for invalid values', () => {
			expect(parseMaskUnit('invalid')).toBe('%');
			expect(parseMaskUnit(null)).toBe('%');
		});

		it('should use custom default unit', () => {
			expect(parseMaskUnit('invalid', 'px')).toBe('px');
		});
	});
});

// ============================================================================
// Round-trip Tests (Critical)
// ============================================================================

describe('Mask Round-trip Tests', () => {
	it('should maintain mask shape through round-trip', () => {
		const original = 'diamond';
		const parsed = parseMaskShape(original);
		expect(parsed).toBe(original);
	});

	it('should maintain mask image through round-trip', () => {
		const original: MaskImage = { id: 123, url: 'http://example.com/mask.svg' };
		const serialized = serializeMaskImage(original);
		const reparsed = parseMaskImage(serialized);
		expect(reparsed).toEqual(original);
	});

	it('should maintain all mask position values through round-trip', () => {
		VALID_MASK_POSITIONS.forEach((position) => {
			const parsed = parseMaskPosition(position);
			expect(parsed).toBe(position);
		});
	});

	it('should maintain all mask size values through round-trip', () => {
		VALID_MASK_SIZES.forEach((size) => {
			const parsed = parseMaskSize(size);
			expect(parsed).toBe(size);
		});
	});

	it('should maintain all mask repeat values through round-trip', () => {
		VALID_MASK_REPEATS.forEach((repeat) => {
			const parsed = parseMaskRepeat(repeat);
			expect(parsed).toBe(repeat);
		});
	});

	it('should maintain numeric values with units through round-trip', () => {
		const scaleValue = 75;
		const unit = 'px';

		const parsedScale = parseMaskNumeric(scaleValue, 0, 200);
		const parsedUnit = parseMaskUnit(unit);

		expect(parsedScale).toBe(scaleValue);
		expect(parsedUnit).toBe(unit);
	});
});

// ============================================================================
// hasMaskValues Tests
// ============================================================================

describe('hasMaskValues', () => {
	it('should return false when mask is disabled', () => {
		expect(hasMaskValues({ maskSwitch: false })).toBe(false);
		expect(hasMaskValues({})).toBe(false);
	});

	it('should return true when mask is enabled', () => {
		expect(hasMaskValues({ maskSwitch: true })).toBe(true);
	});

	it('should return true when mask has non-default shape', () => {
		expect(hasMaskValues({ maskSwitch: true, maskShape: 'diamond' })).toBe(true);
	});

	it('should return true when mask has custom image', () => {
		expect(hasMaskValues({
			maskSwitch: true,
			maskImage: { id: 123, url: 'http://example.com/mask.svg' },
		})).toBe(true);
	});
});
