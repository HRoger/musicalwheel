/**
 * BorderGroupControl Serialization Tests
 *
 * Tests for border group value parsing and serialization.
 * Ensures proper handling of border type, width, color, and radius.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// Type definitions matching BorderGroupControl.tsx
export interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

export interface BorderGroupValue {
	borderType?: string;
	borderWidth?: DimensionsConfig;
	borderColor?: string;
	borderRadius?: DimensionsConfig;
}

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse border group value from string/object
 */
export function parseBorderGroupValue(value: any): BorderGroupValue {
	if (!value) return {};
	if (typeof value === 'object') return value;

	// If string, try to parse as JSON
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch (e) {
			return {};
		}
	}

	return {};
}

/**
 * Parse dimensions config from string/object
 */
export function parseDimensionsConfig(value: any): DimensionsConfig {
	if (!value) return {};
	if (typeof value === 'object') return value;

	// If string, try to parse as JSON
	if (typeof value === 'string') {
		try {
			return JSON.parse(value);
		} catch (e) {
			return {};
		}
	}

	return {};
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize border group value to string
 */
export function serializeBorderGroupValue(value: BorderGroupValue): string | null {
	if (!value || Object.keys(value).length === 0) return null;

	// Check if any meaningful value exists
	const hasBorderType = value.borderType && value.borderType !== '';
	const hasBorderWidth = value.borderWidth && Object.keys(value.borderWidth).length > 0;
	const hasBorderColor = value.borderColor && value.borderColor !== '';
	const hasBorderRadius = value.borderRadius && Object.keys(value.borderRadius).length > 0;

	if (!hasBorderType && !hasBorderWidth && !hasBorderColor && !hasBorderRadius) {
		return null;
	}

	return JSON.stringify(value);
}

/**
 * Serialize dimensions config to string
 */
export function serializeDimensionsConfig(value: DimensionsConfig): string | null {
	if (!value || Object.keys(value).length === 0) return null;

	// Check if any side has a value
	const hasValue = value.top || value.right || value.bottom || value.left;
	if (!hasValue) return null;

	return JSON.stringify(value);
}

// ============================================================================
// BorderGroupValue Tests
// ============================================================================

describe('BorderGroupValue Serialization', () => {
	describe('parseBorderGroupValue', () => {
		it('should return empty object for null', () => {
			expect(parseBorderGroupValue(null)).toEqual({});
		});

		it('should return empty object for undefined', () => {
			expect(parseBorderGroupValue(undefined)).toEqual({});
		});

		it('should return empty object for empty string', () => {
			expect(parseBorderGroupValue('')).toEqual({});
		});

		it('should parse object value', () => {
			const value: BorderGroupValue = {
				borderType: 'solid',
				borderWidth: { top: '1px', right: '1px', bottom: '1px', left: '1px' },
				borderColor: '#000000',
			};
			expect(parseBorderGroupValue(value)).toEqual(value);
		});

		it('should parse JSON string', () => {
			const value: BorderGroupValue = {
				borderType: 'solid',
				borderColor: '#ff0000',
			};
			const json = JSON.stringify(value);
			expect(parseBorderGroupValue(json)).toEqual(value);
		});

		it('should handle invalid JSON gracefully', () => {
			expect(parseBorderGroupValue('invalid-json')).toEqual({});
		});

		it('should parse complete border group', () => {
			const value: BorderGroupValue = {
				borderType: 'dashed',
				borderWidth: {
					top: '2px',
					right: '2px',
					bottom: '2px',
					left: '2px',
					unit: 'px',
					linked: true
				},
				borderColor: 'rgba(0, 0, 0, 0.5)',
				borderRadius: {
					top: '4px',
					right: '4px',
					bottom: '4px',
					left: '4px',
					unit: 'px',
					linked: true
				},
			};
			expect(parseBorderGroupValue(value)).toEqual(value);
		});
	});

	describe('serializeBorderGroupValue', () => {
		it('should return null for empty object', () => {
			expect(serializeBorderGroupValue({})).toBeNull();
		});

		it('should serialize border type only', () => {
			const value: BorderGroupValue = { borderType: 'solid' };
			const result = serializeBorderGroupValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize complete border group', () => {
			const value: BorderGroupValue = {
				borderType: 'solid',
				borderWidth: { top: '1px', right: '1px', bottom: '1px', left: '1px' },
				borderColor: '#000000',
				borderRadius: { top: '4px', right: '4px', bottom: '4px', left: '4px' },
			};
			const result = serializeBorderGroupValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should return null for border group with all empty values', () => {
			const value: BorderGroupValue = {
				borderType: '',
				borderWidth: {},
				borderColor: '',
				borderRadius: {},
			};
			expect(serializeBorderGroupValue(value)).toBeNull();
		});

		it('should serialize border with color only', () => {
			const value: BorderGroupValue = {
				borderColor: '#ff0000',
			};
			const result = serializeBorderGroupValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});
	});

	describe('Round-trip tests', () => {
		it('should maintain values through parse→serialize→parse', () => {
			const original: BorderGroupValue = {
				borderType: 'double',
				borderWidth: { top: '3px', right: '3px', bottom: '3px', left: '3px', unit: 'px' },
				borderColor: 'rgba(255, 0, 0, 0.8)',
				borderRadius: { top: '8px', right: '8px', bottom: '8px', left: '8px', unit: 'px' },
			};

			const serialized = serializeBorderGroupValue(original);
			expect(serialized).toBeTruthy();

			const parsed = parseBorderGroupValue(serialized);
			expect(parsed).toEqual(original);
		});

		it('should handle partial border values', () => {
			const original: BorderGroupValue = {
				borderType: 'dotted',
				borderWidth: { top: '1px', left: '1px' }, // Only top and left
			};

			const serialized = serializeBorderGroupValue(original);
			expect(serialized).toBeTruthy();

			const parsed = parseBorderGroupValue(serialized);
			expect(parsed).toEqual(original);
		});
	});
});

// ============================================================================
// DimensionsConfig Tests
// ============================================================================

describe('DimensionsConfig Serialization', () => {
	describe('parseDimensionsConfig', () => {
		it('should return empty object for null', () => {
			expect(parseDimensionsConfig(null)).toEqual({});
		});

		it('should return empty object for undefined', () => {
			expect(parseDimensionsConfig(undefined)).toEqual({});
		});

		it('should parse object value', () => {
			const value: DimensionsConfig = {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
			};
			expect(parseDimensionsConfig(value)).toEqual(value);
		});

		it('should parse JSON string', () => {
			const value: DimensionsConfig = {
				top: '5px',
				right: '10px',
				bottom: '5px',
				left: '10px',
			};
			const json = JSON.stringify(value);
			expect(parseDimensionsConfig(json)).toEqual(value);
		});

		it('should parse with unit and linked properties', () => {
			const value: DimensionsConfig = {
				top: '1em',
				right: '1em',
				bottom: '1em',
				left: '1em',
				unit: 'em',
				linked: true,
			};
			expect(parseDimensionsConfig(value)).toEqual(value);
		});
	});

	describe('serializeDimensionsConfig', () => {
		it('should return null for empty object', () => {
			expect(serializeDimensionsConfig({})).toBeNull();
		});

		it('should serialize all four sides', () => {
			const value: DimensionsConfig = {
				top: '10px',
				right: '10px',
				bottom: '10px',
				left: '10px',
			};
			const result = serializeDimensionsConfig(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize partial dimensions', () => {
			const value: DimensionsConfig = {
				top: '5px',
				bottom: '5px',
			};
			const result = serializeDimensionsConfig(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should handle numeric values', () => {
			const value: DimensionsConfig = {
				top: 10,
				right: 10,
				bottom: 10,
				left: 10,
			};
			const result = serializeDimensionsConfig(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should return null when no sides have values', () => {
			const value: DimensionsConfig = {
				unit: 'px',
				linked: true,
			};
			expect(serializeDimensionsConfig(value)).toBeNull();
		});
	});

	describe('Round-trip tests', () => {
		it('should maintain values through parse→serialize→parse', () => {
			const original: DimensionsConfig = {
				top: '15px',
				right: '20px',
				bottom: '15px',
				left: '20px',
				unit: 'px',
				linked: false,
			};

			const serialized = serializeDimensionsConfig(original);
			expect(serialized).toBeTruthy();

			const parsed = parseDimensionsConfig(serialized);
			expect(parsed).toEqual(original);
		});
	});
});
