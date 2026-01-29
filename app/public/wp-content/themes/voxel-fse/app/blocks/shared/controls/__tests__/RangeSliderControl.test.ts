/**
 * RangeSliderControl Serialization Tests
 *
 * Tests for dual-handle range slider value parsing and serialization.
 * Used for Viewport ranges in Motion Effects (0%-100%).
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// Type definition matching RangeSliderControl.tsx
export interface RangeSliderValue {
	start: number;
	end: number;
}

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse RangeSliderValue from various input types
 * Handles null, undefined, string JSON, or direct object
 */
export function parseRangeSliderValue(
	value: unknown,
	defaults: RangeSliderValue = { start: 0, end: 100 }
): RangeSliderValue {
	// Handle null/undefined
	if (value === null || value === undefined) {
		return { ...defaults };
	}

	// Handle object directly
	if (typeof value === 'object' && value !== null) {
		const obj = value as Record<string, unknown>;
		return {
			start: typeof obj.start === 'number' ? obj.start : defaults.start,
			end: typeof obj.end === 'number' ? obj.end : defaults.end,
		};
	}

	// Handle JSON string
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value);
			if (typeof parsed === 'object' && parsed !== null) {
				return {
					start: typeof parsed.start === 'number' ? parsed.start : defaults.start,
					end: typeof parsed.end === 'number' ? parsed.end : defaults.end,
				};
			}
		} catch {
			// Invalid JSON, return defaults
		}
	}

	return { ...defaults };
}

/**
 * Validate that a RangeSliderValue has valid start/end values
 * Ensures start < end
 */
export function validateRangeSliderValue(
	value: RangeSliderValue,
	min: number = 0,
	max: number = 100
): RangeSliderValue {
	let start = Math.max(min, Math.min(max, value.start));
	let end = Math.max(min, Math.min(max, value.end));

	// Ensure start < end (at least 1 unit apart)
	if (start >= end) {
		if (end > min) {
			start = end - 1;
		} else {
			end = start + 1;
		}
	}

	return { start, end };
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize RangeSliderValue to JSON string for storage
 * Returns null if value matches defaults (to avoid storing unnecessary data)
 */
export function serializeRangeSliderValue(
	value: RangeSliderValue,
	defaults: RangeSliderValue = { start: 0, end: 100 }
): string | null {
	if (!value) return null;

	// If value matches defaults, return null to not store
	if (value.start === defaults.start && value.end === defaults.end) {
		return null;
	}

	return JSON.stringify(value);
}

/**
 * Check if RangeSliderValue has meaningful (non-default) values
 */
export function hasRangeSliderValue(
	value: RangeSliderValue | undefined,
	defaults: RangeSliderValue = { start: 0, end: 100 }
): boolean {
	if (!value) return false;
	return value.start !== defaults.start || value.end !== defaults.end;
}

// ============================================================================
// Parse Tests
// ============================================================================

describe('RangeSliderValue Serialization', () => {
	describe('parseRangeSliderValue', () => {
		it('should return defaults for null', () => {
			const result = parseRangeSliderValue(null);
			expect(result).toEqual({ start: 0, end: 100 });
		});

		it('should return defaults for undefined', () => {
			const result = parseRangeSliderValue(undefined);
			expect(result).toEqual({ start: 0, end: 100 });
		});

		it('should return custom defaults when provided', () => {
			const result = parseRangeSliderValue(null, { start: 20, end: 80 });
			expect(result).toEqual({ start: 20, end: 80 });
		});

		it('should parse object value directly', () => {
			const value: RangeSliderValue = { start: 25, end: 75 };
			const result = parseRangeSliderValue(value);
			expect(result).toEqual(value);
		});

		it('should parse JSON string', () => {
			const value: RangeSliderValue = { start: 10, end: 90 };
			const json = JSON.stringify(value);
			const result = parseRangeSliderValue(json);
			expect(result).toEqual(value);
		});

		it('should handle invalid JSON gracefully', () => {
			const result = parseRangeSliderValue('invalid-json');
			expect(result).toEqual({ start: 0, end: 100 });
		});

		it('should handle empty string', () => {
			const result = parseRangeSliderValue('');
			expect(result).toEqual({ start: 0, end: 100 });
		});

		it('should handle partial object (missing start)', () => {
			const result = parseRangeSliderValue({ end: 75 });
			expect(result).toEqual({ start: 0, end: 75 });
		});

		it('should handle partial object (missing end)', () => {
			const result = parseRangeSliderValue({ start: 25 });
			expect(result).toEqual({ start: 25, end: 100 });
		});

		it('should handle non-number values in object', () => {
			const result = parseRangeSliderValue({ start: 'invalid', end: null });
			expect(result).toEqual({ start: 0, end: 100 });
		});

		it('should parse viewport values for transparency (20-80)', () => {
			const value: RangeSliderValue = { start: 20, end: 80 };
			const result = parseRangeSliderValue(value);
			expect(result).toEqual(value);
		});

		it('should handle zero values', () => {
			const value: RangeSliderValue = { start: 0, end: 50 };
			const result = parseRangeSliderValue(value);
			expect(result).toEqual(value);
		});
	});

	// ============================================================================
	// Validation Tests
	// ============================================================================

	describe('validateRangeSliderValue', () => {
		it('should keep valid values unchanged', () => {
			const value: RangeSliderValue = { start: 25, end: 75 };
			const result = validateRangeSliderValue(value);
			expect(result).toEqual(value);
		});

		it('should clamp start to min', () => {
			const value: RangeSliderValue = { start: -10, end: 50 };
			const result = validateRangeSliderValue(value, 0, 100);
			expect(result.start).toBe(0);
		});

		it('should clamp end to max', () => {
			const value: RangeSliderValue = { start: 50, end: 150 };
			const result = validateRangeSliderValue(value, 0, 100);
			expect(result.end).toBe(100);
		});

		it('should fix start >= end by adjusting start', () => {
			const value: RangeSliderValue = { start: 75, end: 50 };
			const result = validateRangeSliderValue(value);
			expect(result.start).toBeLessThan(result.end);
		});

		it('should handle equal start and end', () => {
			const value: RangeSliderValue = { start: 50, end: 50 };
			const result = validateRangeSliderValue(value);
			expect(result.start).toBeLessThan(result.end);
		});

		it('should respect custom min/max bounds', () => {
			const value: RangeSliderValue = { start: 5, end: 95 };
			const result = validateRangeSliderValue(value, 10, 90);
			expect(result.start).toBe(10);
			expect(result.end).toBe(90);
		});
	});

	// ============================================================================
	// Serialize Tests
	// ============================================================================

	describe('serializeRangeSliderValue', () => {
		it('should return null for default values (0-100)', () => {
			const value: RangeSliderValue = { start: 0, end: 100 };
			const result = serializeRangeSliderValue(value);
			expect(result).toBeNull();
		});

		it('should serialize non-default values', () => {
			const value: RangeSliderValue = { start: 20, end: 80 };
			const result = serializeRangeSliderValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize when only start differs from default', () => {
			const value: RangeSliderValue = { start: 10, end: 100 };
			const result = serializeRangeSliderValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should serialize when only end differs from default', () => {
			const value: RangeSliderValue = { start: 0, end: 90 };
			const result = serializeRangeSliderValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});

		it('should return null for custom defaults that match', () => {
			const value: RangeSliderValue = { start: 20, end: 80 };
			const defaults: RangeSliderValue = { start: 20, end: 80 };
			const result = serializeRangeSliderValue(value, defaults);
			expect(result).toBeNull();
		});

		it('should handle edge case values', () => {
			const value: RangeSliderValue = { start: 0, end: 1 };
			const result = serializeRangeSliderValue(value);
			expect(result).toBeTruthy();
			expect(JSON.parse(result!)).toEqual(value);
		});
	});

	// ============================================================================
	// hasRangeSliderValue Tests
	// ============================================================================

	describe('hasRangeSliderValue', () => {
		it('should return false for undefined', () => {
			expect(hasRangeSliderValue(undefined)).toBe(false);
		});

		it('should return false for default values', () => {
			const value: RangeSliderValue = { start: 0, end: 100 };
			expect(hasRangeSliderValue(value)).toBe(false);
		});

		it('should return true for non-default values', () => {
			const value: RangeSliderValue = { start: 20, end: 80 };
			expect(hasRangeSliderValue(value)).toBe(true);
		});

		it('should return true when only start differs', () => {
			const value: RangeSliderValue = { start: 10, end: 100 };
			expect(hasRangeSliderValue(value)).toBe(true);
		});

		it('should return true when only end differs', () => {
			const value: RangeSliderValue = { start: 0, end: 90 };
			expect(hasRangeSliderValue(value)).toBe(true);
		});

		it('should use custom defaults correctly', () => {
			const value: RangeSliderValue = { start: 20, end: 80 };
			const defaults: RangeSliderValue = { start: 20, end: 80 };
			expect(hasRangeSliderValue(value, defaults)).toBe(false);
		});
	});

	// ============================================================================
	// Round-trip Tests (Critical)
	// ============================================================================

	describe('Round-trip Tests', () => {
		it('should maintain values through parse → serialize → parse', () => {
			const original: RangeSliderValue = { start: 15, end: 85 };

			// Serialize to JSON
			const serialized = serializeRangeSliderValue(original);
			expect(serialized).toBeTruthy();

			// Parse back from JSON
			const parsed = parseRangeSliderValue(serialized);
			expect(parsed).toEqual(original);
		});

		it('should maintain edge values through round-trip', () => {
			const original: RangeSliderValue = { start: 1, end: 99 };

			const serialized = serializeRangeSliderValue(original);
			const parsed = parseRangeSliderValue(serialized);

			expect(parsed).toEqual(original);
		});

		it('should maintain transparency viewport defaults through parse → validate', () => {
			// Transparency uses 20-80 as defaults
			const original: RangeSliderValue = { start: 20, end: 80 };
			const parsed = parseRangeSliderValue(original);
			const validated = validateRangeSliderValue(parsed);

			expect(validated).toEqual(original);
		});

		it('should handle multiple round-trips', () => {
			const original: RangeSliderValue = { start: 30, end: 70 };

			// Round-trip 1
			const serialized1 = serializeRangeSliderValue(original);
			const parsed1 = parseRangeSliderValue(serialized1);

			// Round-trip 2
			const serialized2 = serializeRangeSliderValue(parsed1);
			const parsed2 = parseRangeSliderValue(serialized2);

			// Round-trip 3
			const serialized3 = serializeRangeSliderValue(parsed2);
			const parsed3 = parseRangeSliderValue(serialized3);

			expect(parsed3).toEqual(original);
		});
	});

	// ============================================================================
	// Motion Effects Specific Tests
	// ============================================================================

	describe('Motion Effects Viewport Values', () => {
		it('should parse vertical scroll viewport (0-100 default)', () => {
			const value = parseRangeSliderValue({ start: 0, end: 100 });
			expect(value).toEqual({ start: 0, end: 100 });
		});

		it('should parse transparency viewport (20-80 default)', () => {
			const value = parseRangeSliderValue(
				{ start: 20, end: 80 },
				{ start: 20, end: 80 }
			);
			expect(value).toEqual({ start: 20, end: 80 });
		});

		it('should parse blur viewport (20-80 default)', () => {
			const defaults: RangeSliderValue = { start: 20, end: 80 };
			const value = parseRangeSliderValue(null, defaults);
			expect(value).toEqual(defaults);
		});

		it('should serialize custom viewport that differs from default', () => {
			const custom: RangeSliderValue = { start: 10, end: 90 };
			const defaults: RangeSliderValue = { start: 20, end: 80 };
			const serialized = serializeRangeSliderValue(custom, defaults);

			expect(serialized).toBeTruthy();
			expect(JSON.parse(serialized!)).toEqual(custom);
		});
	});
});
