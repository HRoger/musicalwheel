/**
 * DimensionsControl Serialization Tests
 *
 * Tests for dimensions value parsing and serialization.
 * Ensures proper handling of top/right/bottom/left values with units.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// Type definitions matching DimensionsControl.tsx
export interface DimensionsValue {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

type UnitType = 'px' | '%' | 'em' | 'rem' | 'vw' | 'vh';

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse dimensions value from string/object
 */
export function parseDimensionsValue(value: any): DimensionsValue {
	if (!value) return {};
	if (typeof value === 'object') return value;

	// If string, try to parse as JSON
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch (e) {
			// Try to parse as single value (e.g., "10px")
			const parsed = parseValue(value);
			if (parsed) {
				return {
					top: value,
					right: value,
					bottom: value,
					left: value,
					unit: parsed.unit,
					linked: true,
				};
			}
			return {};
		}
	}

	return {};
}

/**
 * Parse value to extract number and unit
 */
export function parseValue(value: string | number | undefined): { num: number; unit: UnitType } | null {
	// Check specifically for null/undefined/empty string (don't use !value as it excludes 0)
	if (value === null || value === undefined || value === '') {
		return null;
	}

	const str = String(value);
	const match = str.match(/^(-?[\d.]+)(px|%|em|rem|vw|vh)?$/);

	if (match) {
		const num = parseFloat(match[1]);
		if (isNaN(num)) return null;
		return {
			num: num,
			unit: (match[2] as UnitType) || 'px'
		};
	}

	// If it's just a number, assume px
	const num = parseFloat(str);
	if (isNaN(num)) return null;
	return { num: num, unit: 'px' };
}

/**
 * Format number and unit to string
 */
export function formatValue(num: number, unit: UnitType): string {
	return `${num}${unit}`;
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize dimensions value to string
 */
export function serializeDimensionsValue(value: DimensionsValue): string | null {
	if (!value || Object.keys(value).length === 0) return null;

	// Check if any side has a value
	const hasValue = value.top || value.right || value.bottom || value.left;
	if (!hasValue) return null;

	return JSON.stringify(value);
}

/**
 * Check if dimensions are linked (all equal)
 */
export function areDimensionsLinked(value: DimensionsValue): boolean {
	const { top, right, bottom, left } = value;

	// Parse all values
	const topParsed = parseValue(top);
	const rightParsed = parseValue(right);
	const bottomParsed = parseValue(bottom);
	const leftParsed = parseValue(left);

	// Get all numeric values
	const allValues = [topParsed, rightParsed, bottomParsed, leftParsed]
		.filter(p => p !== null && p !== undefined)
		.map(p => p!.num);

	if (allValues.length === 0) return false;

	// Check if all equal
	return allValues.every(val => val === allValues[0]);
}

/**
 * Normalize dimensions to ensure all sides have the same unit
 */
export function normalizeDimensions(value: DimensionsValue, targetUnit?: UnitType): DimensionsValue {
	const unit = targetUnit || value.unit || 'px';

	return {
		...value,
		unit,
	};
}

// ============================================================================
// DimensionsValue Tests
// ============================================================================

describe('DimensionsValue Serialization', () => {
	describe('parseDimensionsValue', () => {
		it('should return empty object for null', () => {
			expect(parseDimensionsValue(null)).toEqual({});
		});

		it('should return empty object for undefined', () => {
			expect(parseDimensionsValue(undefined)).toEqual({});
		});

		it('should return empty object for empty string', () => {
			expect(parseDimensionsValue('')).toEqual({});
		});

		it('should parse object value', () => {
			const value: DimensionsValue = {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
			};
			expect(parseDimensionsValue(value)).toEqual(value);
		});

		it('should parse JSON string', () => {
			const value: DimensionsValue = {
				top: '5px',
				right: '10px',
				bottom: '5px',
				left: '10px',
			};
			const json = JSON.stringify(value);
			expect(parseDimensionsValue(json)).toEqual(value);
		});

		it('should parse single value as linked dimensions', () => {
			const result = parseDimensionsValue('10px');
			expect(result).toEqual({
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
				unit: 'px',
				linked: true,
			});
		});

		it('should parse with unit and linked properties', () => {
			const value: DimensionsValue = {
				top: '1em',
				right: '1em',
				bottom: '1em',
				left: '1em',
				unit: 'em',
				linked: true,
			};
			expect(parseDimensionsValue(value)).toEqual(value);
		});

		it('should parse numeric values', () => {
			const value: DimensionsValue = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 10,
			};
			expect(parseDimensionsValue(value)).toEqual(value);
		});

		it('should parse partial dimensions', () => {
			const value: DimensionsValue = {
				top: '5px',
				bottom: '5px',
			};
			expect(parseDimensionsValue(value)).toEqual(value);
		});
	});

	describe('serializeDimensionsValue', () => {
		it('should return null for empty object', () => {
			expect(serializeDimensionsValue({})).toBeNull();
		});

		it('should serialize all four sides', () => {
			const value: DimensionsValue = {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
			};
			const result = serializeDimensionsValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize partial dimensions', () => {
			const value: DimensionsValue = {
				top: '5px',
				bottom: '5px',
			};
			const result = serializeDimensionsValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize numeric values', () => {
			const value: DimensionsValue = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 10,
			};
			const result = serializeDimensionsValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize with unit and linked', () => {
			const value: DimensionsValue = {
				top: '2em',
				right: '2em',
				bottom: '2em',
				left: '2em',
				unit: 'em',
				linked: true,
			};
			const result = serializeDimensionsValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should return null when no sides have values', () => {
			const value: DimensionsValue = {
				unit: 'px',
				linked: true,
			};
			expect(serializeDimensionsValue(value)).toBeNull();
		});
	});

	describe('Round-trip tests', () => {
		it('should maintain values through parse→serialize→parse', () => {
			const original: DimensionsValue = {
				top: '15px',
				right: '20px',
				bottom: '15px',
				left: '20px',
				unit: 'px',
				linked: false,
			};

			const serialized = serializeDimensionsValue(original);
			expect(serialized).toBeTruthy();

			const parsed = parseDimensionsValue(serialized);
			expect(parsed).toEqual(original);
		});

		it('should handle linked dimensions in round-trip', () => {
			const original: DimensionsValue = {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
				unit: 'px',
				linked: true,
			};

			const serialized = serializeDimensionsValue(original);
			const parsed = parseDimensionsValue(serialized);
			expect(parsed).toEqual(original);
		});

		it('should handle different units in round-trip', () => {
			const original: DimensionsValue = {
				top: '1em',
				right: '2em',
				bottom: '1em',
				left: '2em',
				unit: 'em',
				linked: false,
			};

			const serialized = serializeDimensionsValue(original);
			const parsed = parseDimensionsValue(serialized);
			expect(parsed).toEqual(original);
		});
	});
});

// ============================================================================
// Value Parsing Tests
// ============================================================================

describe('Value Parsing', () => {
	describe('parseValue', () => {
		it('should return null for empty values', () => {
			expect(parseValue(null)).toBeNull();
			expect(parseValue(undefined)).toBeNull();
			expect(parseValue('')).toBeNull();
		});

		it('should parse px values', () => {
			expect(parseValue('10px')).toEqual({ num: 10, unit: 'px' });
			expect(parseValue('0px')).toEqual({ num: 0, unit: 'px' });
		});

		it('should parse percentage values', () => {
			expect(parseValue('50%')).toEqual({ num: 50, unit: '%' });
			expect(parseValue('100%')).toEqual({ num: 100, unit: '%' });
		});

		it('should parse em values', () => {
			expect(parseValue('1.5em')).toEqual({ num: 1.5, unit: 'em' });
			expect(parseValue('2em')).toEqual({ num: 2, unit: 'em' });
		});

		it('should parse rem values', () => {
			expect(parseValue('1rem')).toEqual({ num: 1, unit: 'rem' });
			expect(parseValue('0.875rem')).toEqual({ num: 0.875, unit: 'rem' });
		});

		it('should parse vw/vh values', () => {
			expect(parseValue('10vw')).toEqual({ num: 10, unit: 'vw' });
			expect(parseValue('100vh')).toEqual({ num: 100, unit: 'vh' });
		});

		it('should parse numeric values as px', () => {
			expect(parseValue(10)).toEqual({ num: 10, unit: 'px' });
			expect(parseValue('10')).toEqual({ num: 10, unit: 'px' });
		});

		it('should handle decimal values', () => {
			expect(parseValue('10.5px')).toEqual({ num: 10.5, unit: 'px' });
			expect(parseValue('1.5em')).toEqual({ num: 1.5, unit: 'em' });
		});

		it('should handle zero values', () => {
			expect(parseValue('0px')).toEqual({ num: 0, unit: 'px' });
			expect(parseValue(0)).toEqual({ num: 0, unit: 'px' });
		});
	});

	describe('formatValue', () => {
		it('should format px values', () => {
			expect(formatValue(10, 'px')).toBe('10px');
		});

		it('should format percentage values', () => {
			expect(formatValue(50, '%')).toBe('50%');
		});

		it('should format em values', () => {
			expect(formatValue(1.5, 'em')).toBe('1.5em');
		});

		it('should format zero values', () => {
			expect(formatValue(0, 'px')).toBe('0px');
		});
	});
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Dimensions Utilities', () => {
	describe('areDimensionsLinked', () => {
		it('should return true for linked dimensions', () => {
			const value: DimensionsValue = {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
			};
			expect(areDimensionsLinked(value)).toBe(true);
		});

		it('should return false for unlinked dimensions', () => {
			const value: DimensionsValue = {
				top: '10px',
				right: '20px',
				bottom: '10px',
				left: '20px',
			};
			expect(areDimensionsLinked(value)).toBe(false);
		});

		it('should return false for empty dimensions', () => {
			expect(areDimensionsLinked({})).toBe(false);
		});

		it('should return true for partial linked dimensions', () => {
			const value: DimensionsValue = {
				top: '5px',
				bottom: '5px',
			};
			expect(areDimensionsLinked(value)).toBe(true);
		});

		it('should handle numeric values', () => {
			const value: DimensionsValue = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 10,
			};
			expect(areDimensionsLinked(value)).toBe(true);
		});
	});

	describe('normalizeDimensions', () => {
		it('should normalize to px by default', () => {
			const value: DimensionsValue = {
				top: '10px',
				right: '10px',
			};
			const result = normalizeDimensions(value);
			expect(result.unit).toBe('px');
		});

		it('should normalize to specified unit', () => {
			const value: DimensionsValue = {
				top: '10px',
				right: '10px',
			};
			const result = normalizeDimensions(value, 'em');
			expect(result.unit).toBe('em');
		});

		it('should preserve existing unit if no target', () => {
			const value: DimensionsValue = {
				top: '1em',
				right: '1em',
				unit: 'em',
			};
			const result = normalizeDimensions(value);
			expect(result.unit).toBe('em');
		});
	});
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('Dimensions Edge Cases', () => {
	it('should handle mixed units', () => {
		const value: DimensionsValue = {
			top: '10px',
			right: '1em',
			bottom: '5%',
			left: '2rem',
		};
		const serialized = serializeDimensionsValue(value);
		expect(serialized).toBeTruthy();
		const parsed = parseDimensionsValue(serialized);
		expect(parsed).toEqual(value);
	});

	it('should handle zero values correctly', () => {
		const value: DimensionsValue = {
			top: '0px',
			right: '0px',
			bottom: '0px',
			left: '0px',
		};
		const serialized = serializeDimensionsValue(value);
		expect(serialized).toBeTruthy();
	});

	it('should handle negative values', () => {
		// Note: Negative values are valid for margins
		const value: DimensionsValue = {
			top: '-10px',
			right: '-10px',
			bottom: '-10px',
			left: '-10px',
		};
		expect(parseDimensionsValue(value)).toEqual(value);
	});

	it('should preserve string vs numeric format', () => {
		const stringValue: DimensionsValue = {
			top: '10px',
			right: '10px',
		};
		const numericValue: DimensionsValue = {
			top: 10,
			right: 10,
		};

		expect(parseDimensionsValue(stringValue).top).toBe('10px');
		expect(parseDimensionsValue(numericValue).top).toBe(10);
	});
});
