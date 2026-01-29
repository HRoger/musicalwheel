/**
 * ColorControl Serialization Tests
 *
 * Tests for color value parsing and serialization.
 * Ensures proper handling of hex, rgba, and named colors.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse color value from string
 */
export function parseColorValue(value: any): string | undefined {
	if (!value) return undefined;
	if (typeof value === 'string') return value;

	// If object with color property (some controls return this)
	if (typeof value === 'object' && value.color) {
		return value.color;
	}

	return undefined;
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize color value to string
 */
export function serializeColorValue(value: string | undefined): string | null {
	if (!value || value === '') return null;
	return value;
}

// ============================================================================
// Color Validation Functions
// ============================================================================

/**
 * Check if color is valid hex format
 */
export function isValidHex(color: string): boolean {
	return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Check if color is valid rgba format
 */
export function isValidRgba(color: string): boolean {
	// rgb(r, g, b) - 3 parameters
	const rgbPattern = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
	// rgba(r, g, b, a) - 4 parameters (alpha is required)
	const rgbaPattern = /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/;

	return rgbPattern.test(color) || rgbaPattern.test(color);
}

/**
 * Convert hex to rgba
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
	// Remove # if present
	hex = hex.replace('#', '');

	// Expand shorthand (e.g., "03F" to "0033FF")
	if (hex.length === 3) {
		hex = hex.split('').map(c => c + c).join('');
	}

	const r = parseInt(hex.substring(0, 2), 16);
	const g = parseInt(hex.substring(2, 4), 16);
	const b = parseInt(hex.substring(4, 6), 16);

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Extract alpha value from rgba string
 */
export function extractAlpha(rgba: string): number {
	// Match rgba format with 4th parameter (alpha)
	const rgbaMatch = rgba.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)/);
	if (rgbaMatch) {
		return parseFloat(rgbaMatch[1]);
	}
	// rgb format (no alpha) defaults to 1
	return 1;
}

// ============================================================================
// ColorValue Tests
// ============================================================================

describe('ColorValue Serialization', () => {
	describe('parseColorValue', () => {
		it('should return undefined for null', () => {
			expect(parseColorValue(null)).toBeUndefined();
		});

		it('should return undefined for undefined', () => {
			expect(parseColorValue(undefined)).toBeUndefined();
		});

		it('should return undefined for empty string', () => {
			expect(parseColorValue('')).toBeUndefined();
		});

		it('should parse hex color', () => {
			expect(parseColorValue('#ff0000')).toBe('#ff0000');
		});

		it('should parse shorthand hex color', () => {
			expect(parseColorValue('#f00')).toBe('#f00');
		});

		it('should parse rgba color', () => {
			expect(parseColorValue('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)');
		});

		it('should parse rgb color', () => {
			expect(parseColorValue('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
		});

		it('should parse named color', () => {
			expect(parseColorValue('red')).toBe('red');
		});

		it('should parse transparent', () => {
			expect(parseColorValue('transparent')).toBe('transparent');
		});

		it('should extract color from object', () => {
			expect(parseColorValue({ color: '#0000ff' })).toBe('#0000ff');
		});
	});

	describe('serializeColorValue', () => {
		it('should return null for undefined', () => {
			expect(serializeColorValue(undefined)).toBeNull();
		});

		it('should return null for empty string', () => {
			expect(serializeColorValue('')).toBeNull();
		});

		it('should serialize hex color', () => {
			expect(serializeColorValue('#ff0000')).toBe('#ff0000');
		});

		it('should serialize shorthand hex color', () => {
			expect(serializeColorValue('#f00')).toBe('#f00');
		});

		it('should serialize rgba color', () => {
			expect(serializeColorValue('rgba(255, 0, 0, 0.5)')).toBe('rgba(255, 0, 0, 0.5)');
		});

		it('should serialize rgb color', () => {
			expect(serializeColorValue('rgb(255, 0, 0)')).toBe('rgb(255, 0, 0)');
		});

		it('should serialize named color', () => {
			expect(serializeColorValue('red')).toBe('red');
		});

		it('should serialize transparent', () => {
			expect(serializeColorValue('transparent')).toBe('transparent');
		});
	});

	describe('Round-trip tests', () => {
		it('should maintain hex color through parse→serialize→parse', () => {
			const original = '#0073aa';
			const serialized = serializeColorValue(parseColorValue(original));
			expect(serialized).toBe(original);
		});

		it('should maintain rgba color through parse→serialize→parse', () => {
			const original = 'rgba(0, 115, 170, 0.7)';
			const serialized = serializeColorValue(parseColorValue(original));
			expect(serialized).toBe(original);
		});

		it('should maintain named color through parse→serialize→parse', () => {
			const original = 'transparent';
			const serialized = serializeColorValue(parseColorValue(original));
			expect(serialized).toBe(original);
		});
	});
});

// ============================================================================
// Color Validation Tests
// ============================================================================

describe('Color Validation', () => {
	describe('isValidHex', () => {
		it('should validate 6-digit hex', () => {
			expect(isValidHex('#ff0000')).toBe(true);
			expect(isValidHex('#FF0000')).toBe(true);
			expect(isValidHex('#0073aa')).toBe(true);
		});

		it('should validate 3-digit hex', () => {
			expect(isValidHex('#f00')).toBe(true);
			expect(isValidHex('#F00')).toBe(true);
		});

		it('should reject invalid hex', () => {
			expect(isValidHex('ff0000')).toBe(false); // Missing #
			expect(isValidHex('#gg0000')).toBe(false); // Invalid chars
			expect(isValidHex('#ff00')).toBe(false); // Wrong length
			expect(isValidHex('#ff00000')).toBe(false); // Too long
		});
	});

	describe('isValidRgba', () => {
		it('should validate rgb format', () => {
			expect(isValidRgba('rgb(255, 0, 0)')).toBe(true);
			expect(isValidRgba('rgb(0,0,0)')).toBe(true);
		});

		it('should validate rgba format', () => {
			expect(isValidRgba('rgba(255, 0, 0, 0.5)')).toBe(true);
			expect(isValidRgba('rgba(0, 0, 0, 1)')).toBe(true);
			expect(isValidRgba('rgba(255,255,255,0.3)')).toBe(true);
		});

		it('should reject invalid rgba', () => {
			// Note: Regex validates format only, not numeric ranges (0-255)
			expect(isValidRgba('rgb(255, 0)')).toBe(false); // Missing value
			expect(isValidRgba('rgba(255, 0, 0)')).toBe(false); // Missing alpha in rgba
			expect(isValidRgba('not-a-color')).toBe(false); // Invalid format
		});
	});
});

// ============================================================================
// Color Conversion Tests
// ============================================================================

describe('Color Conversion', () => {
	describe('hexToRgba', () => {
		it('should convert 6-digit hex to rgba', () => {
			expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)');
			expect(hexToRgba('#0073aa')).toBe('rgba(0, 115, 170, 1)');
		});

		it('should convert 6-digit hex without # to rgba', () => {
			expect(hexToRgba('ff0000')).toBe('rgba(255, 0, 0, 1)');
		});

		it('should convert 3-digit hex to rgba', () => {
			expect(hexToRgba('#f00')).toBe('rgba(255, 0, 0, 1)');
			expect(hexToRgba('#0fa')).toBe('rgba(0, 255, 170, 1)');
		});

		it('should apply custom alpha', () => {
			expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
			expect(hexToRgba('#0073aa', 0.7)).toBe('rgba(0, 115, 170, 0.7)');
		});

		it('should handle black and white', () => {
			expect(hexToRgba('#000000')).toBe('rgba(0, 0, 0, 1)');
			expect(hexToRgba('#ffffff')).toBe('rgba(255, 255, 255, 1)');
			expect(hexToRgba('#fff')).toBe('rgba(255, 255, 255, 1)');
		});
	});

	describe('extractAlpha', () => {
		it('should extract alpha from rgba', () => {
			expect(extractAlpha('rgba(255, 0, 0, 0.5)')).toBe(0.5);
			expect(extractAlpha('rgba(0, 0, 0, 0.3)')).toBe(0.3);
			expect(extractAlpha('rgba(255, 255, 255, 1)')).toBe(1);
		});

		it('should return 1 for rgb (no alpha)', () => {
			expect(extractAlpha('rgb(255, 0, 0)')).toBe(1);
		});

		it('should handle decimal alpha', () => {
			expect(extractAlpha('rgba(0, 0, 0, 0.75)')).toBe(0.75);
		});
	});
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Color Edge Cases', () => {
	it('should handle uppercase and lowercase hex', () => {
		const upper = parseColorValue('#FF0000');
		const lower = parseColorValue('#ff0000');
		expect(serializeColorValue(upper)).toBe('#FF0000');
		expect(serializeColorValue(lower)).toBe('#ff0000');
	});

	it('should handle rgba with spaces', () => {
		const withSpaces = 'rgba( 255 , 0 , 0 , 0.5 )';
		expect(isValidRgba(withSpaces)).toBe(true);
	});

	it('should handle current color keyword', () => {
		const current = 'currentColor';
		const parsed = parseColorValue(current);
		expect(serializeColorValue(parsed)).toBe('currentColor');
	});

	it('should preserve exact color format', () => {
		const colors = [
			'#FF0000',
			'#ff0000',
			'rgba(255, 0, 0, 0.5)',
			'rgb(255, 0, 0)',
			'transparent',
			'inherit',
		];

		colors.forEach(color => {
			const parsed = parseColorValue(color);
			const serialized = serializeColorValue(parsed);
			expect(serialized).toBe(color);
		});
	});
});
