/**
 * AdvancedTab Border Attributes Serialization Tests
 *
 * Tests for Border section attribute serialization in AdvancedTab component.
 * Ensures proper handling of Normal/Hover states, responsive border radius,
 * and block attribute round-trip integrity.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import type { DimensionsConfig } from '../DimensionsControl';

// ============================================================================
// Type Definitions
// ============================================================================

interface BorderAttributes {
	// Border (Normal state)
	borderType?: string;
	borderWidth?: DimensionsConfig;
	borderColor?: string;
	borderRadius?: DimensionsConfig;
	borderRadius_tablet?: DimensionsConfig;
	borderRadius_mobile?: DimensionsConfig;
	boxShadow?: any;

	// Border (Hover state)
	borderTypeHover?: string;
	borderWidthHover?: DimensionsConfig;
	borderColorHover?: string;
	borderRadiusHover?: DimensionsConfig;
	borderRadiusHover_tablet?: DimensionsConfig;
	borderRadiusHover_mobile?: DimensionsConfig;
	boxShadowHover?: any;
}

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse Border attributes from saved block data
 */
export function parseBorderAttributes(saved: any): BorderAttributes {
	if (!saved) return {};

	const attrs: BorderAttributes = {};

	// Normal state
	if (saved.borderType !== undefined) attrs.borderType = saved.borderType;
	if (saved.borderWidth) attrs.borderWidth = saved.borderWidth;
	if (saved.borderColor) attrs.borderColor = saved.borderColor;
	if (saved.borderRadius) attrs.borderRadius = saved.borderRadius;
	if (saved.borderRadius_tablet) attrs.borderRadius_tablet = saved.borderRadius_tablet;
	if (saved.borderRadius_mobile) attrs.borderRadius_mobile = saved.borderRadius_mobile;
	if (saved.boxShadow) attrs.boxShadow = saved.boxShadow;

	// Hover state
	if (saved.borderTypeHover !== undefined) attrs.borderTypeHover = saved.borderTypeHover;
	if (saved.borderWidthHover) attrs.borderWidthHover = saved.borderWidthHover;
	if (saved.borderColorHover) attrs.borderColorHover = saved.borderColorHover;
	if (saved.borderRadiusHover) attrs.borderRadiusHover = saved.borderRadiusHover;
	if (saved.borderRadiusHover_tablet) attrs.borderRadiusHover_tablet = saved.borderRadiusHover_tablet;
	if (saved.borderRadiusHover_mobile) attrs.borderRadiusHover_mobile = saved.borderRadiusHover_mobile;
	if (saved.boxShadowHover) attrs.boxShadowHover = saved.boxShadowHover;

	return attrs;
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize Border attributes for block saving
 */
export function serializeBorderAttributes(attrs: BorderAttributes): any {
	const serialized: any = {};

	// Normal state
	if (attrs.borderType !== undefined) serialized.borderType = attrs.borderType;
	if (attrs.borderWidth && Object.keys(attrs.borderWidth).length > 0) {
		serialized.borderWidth = attrs.borderWidth;
	}
	if (attrs.borderColor) serialized.borderColor = attrs.borderColor;
	if (attrs.borderRadius && Object.keys(attrs.borderRadius).length > 0) {
		serialized.borderRadius = attrs.borderRadius;
	}
	if (attrs.borderRadius_tablet && Object.keys(attrs.borderRadius_tablet).length > 0) {
		serialized.borderRadius_tablet = attrs.borderRadius_tablet;
	}
	if (attrs.borderRadius_mobile && Object.keys(attrs.borderRadius_mobile).length > 0) {
		serialized.borderRadius_mobile = attrs.borderRadius_mobile;
	}
	if (attrs.boxShadow && attrs.boxShadow.enable) {
		serialized.boxShadow = attrs.boxShadow;
	}

	// Hover state
	if (attrs.borderTypeHover !== undefined) serialized.borderTypeHover = attrs.borderTypeHover;
	if (attrs.borderWidthHover && Object.keys(attrs.borderWidthHover).length > 0) {
		serialized.borderWidthHover = attrs.borderWidthHover;
	}
	if (attrs.borderColorHover) serialized.borderColorHover = attrs.borderColorHover;
	if (attrs.borderRadiusHover && Object.keys(attrs.borderRadiusHover).length > 0) {
		serialized.borderRadiusHover = attrs.borderRadiusHover;
	}
	if (attrs.borderRadiusHover_tablet && Object.keys(attrs.borderRadiusHover_tablet).length > 0) {
		serialized.borderRadiusHover_tablet = attrs.borderRadiusHover_tablet;
	}
	if (attrs.borderRadiusHover_mobile && Object.keys(attrs.borderRadiusHover_mobile).length > 0) {
		serialized.borderRadiusHover_mobile = attrs.borderRadiusHover_mobile;
	}
	if (attrs.boxShadowHover && attrs.boxShadowHover.enable) {
		serialized.boxShadowHover = attrs.boxShadowHover;
	}

	return Object.keys(serialized).length > 0 ? serialized : null;
}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Get default Border attributes matching block.json defaults
 */
export function getDefaultBorderAttributes(): BorderAttributes {
	return {
		borderType: '',
		borderWidth: {},
		borderRadius: {},
		boxShadow: { enable: false },
		borderTypeHover: '',
		borderWidthHover: {},
		borderRadiusHover: {},
		boxShadowHover: { enable: false },
	};
}

// ============================================================================
// Border Attributes Tests
// ============================================================================

describe('Border Attributes Serialization', () => {
	describe('parseBorderAttributes', () => {
		it('should return empty object for null', () => {
			expect(parseBorderAttributes(null)).toEqual({});
		});

		it('should return empty object for undefined', () => {
			expect(parseBorderAttributes(undefined)).toEqual({});
		});

		it('should parse Normal state attributes', () => {
			const saved = {
				borderType: 'solid',
				borderWidth: { top: '2px', right: '2px', bottom: '2px', left: '2px' },
				borderColor: '#000000',
				borderRadius: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
			};

			const result = parseBorderAttributes(saved);

			expect(result.borderType).toBe('solid');
			expect(result.borderWidth).toEqual(saved.borderWidth);
			expect(result.borderColor).toBe('#000000');
			expect(result.borderRadius).toEqual(saved.borderRadius);
		});

		it('should parse Hover state attributes', () => {
			const saved = {
				borderTypeHover: 'double',
				borderWidthHover: { top: '3px', right: '3px', bottom: '3px', left: '3px' },
				borderColorHover: '#ff0000',
				borderRadiusHover: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
			};

			const result = parseBorderAttributes(saved);

			expect(result.borderTypeHover).toBe('double');
			expect(result.borderWidthHover).toEqual(saved.borderWidthHover);
			expect(result.borderColorHover).toBe('#ff0000');
			expect(result.borderRadiusHover).toEqual(saved.borderRadiusHover);
		});

		it('should parse responsive border radius', () => {
			const saved = {
				borderRadius: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
				borderRadius_tablet: { top: '3px', right: '3px', bottom: '3px', left: '3px' },
				borderRadius_mobile: { top: '2px', right: '2px', bottom: '2px', left: '2px' },
			};

			const result = parseBorderAttributes(saved);

			expect(result.borderRadius).toEqual(saved.borderRadius);
			expect(result.borderRadius_tablet).toEqual(saved.borderRadius_tablet);
			expect(result.borderRadius_mobile).toEqual(saved.borderRadius_mobile);
		});

		it('should parse box shadow', () => {
			const saved = {
				boxShadow: {
					enable: true,
					horizontal: 5,
					vertical: 5,
					blur: 10,
					spread: 0,
					color: 'rgba(0, 0, 0, 0.3)',
				},
			};

			const result = parseBorderAttributes(saved);

			expect(result.boxShadow).toEqual(saved.boxShadow);
		});

		it('should parse mixed Normal and Hover attributes', () => {
			const saved = {
				borderType: 'solid',
				borderColor: '#000000',
				borderTypeHover: 'dashed',
				borderColorHover: '#ff0000',
			};

			const result = parseBorderAttributes(saved);

			expect(result.borderType).toBe('solid');
			expect(result.borderColor).toBe('#000000');
			expect(result.borderTypeHover).toBe('dashed');
			expect(result.borderColorHover).toBe('#ff0000');
		});
	});

	describe('serializeBorderAttributes', () => {
		it('should return null for empty attributes', () => {
			expect(serializeBorderAttributes({})).toBeNull();
		});

		it('should serialize Normal state attributes', () => {
			const attrs: BorderAttributes = {
				borderType: 'solid',
				borderWidth: { top: '2px', right: '2px', bottom: '2px', left: '2px' },
				borderColor: '#000000',
				borderRadius: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
			};

			const result = serializeBorderAttributes(attrs);

			expect(result).toBeTruthy();
			expect(result.borderType).toBe('solid');
			expect(result.borderWidth).toEqual(attrs.borderWidth);
			expect(result.borderColor).toBe('#000000');
			expect(result.borderRadius).toEqual(attrs.borderRadius);
		});

		it('should serialize Hover state attributes', () => {
			const attrs: BorderAttributes = {
				borderTypeHover: 'double',
				borderWidthHover: { top: '3px', right: '3px', bottom: '3px', left: '3px' },
				borderColorHover: '#ff0000',
				borderRadiusHover: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
			};

			const result = serializeBorderAttributes(attrs);

			expect(result).toBeTruthy();
			expect(result.borderTypeHover).toBe('double');
			expect(result.borderWidthHover).toEqual(attrs.borderWidthHover);
			expect(result.borderColorHover).toBe('#ff0000');
			expect(result.borderRadiusHover).toEqual(attrs.borderRadiusHover);
		});

		it('should serialize responsive border radius', () => {
			const attrs: BorderAttributes = {
				borderRadius: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
				borderRadius_tablet: { top: '3px', right: '3px', bottom: '3px', left: '3px' },
				borderRadius_mobile: { top: '2px', right: '2px', bottom: '2px', left: '2px' },
			};

			const result = serializeBorderAttributes(attrs);

			expect(result).toBeTruthy();
			expect(result.borderRadius).toEqual(attrs.borderRadius);
			expect(result.borderRadius_tablet).toEqual(attrs.borderRadius_tablet);
			expect(result.borderRadius_mobile).toEqual(attrs.borderRadius_mobile);
		});

		it('should serialize enabled box shadow', () => {
			const attrs: BorderAttributes = {
				boxShadow: {
					enable: true,
					horizontal: 5,
					vertical: 5,
					blur: 10,
					spread: 0,
					color: 'rgba(0, 0, 0, 0.3)',
				},
			};

			const result = serializeBorderAttributes(attrs);

			expect(result).toBeTruthy();
			expect(result.boxShadow).toEqual(attrs.boxShadow);
		});

		it('should not serialize disabled box shadow', () => {
			const attrs: BorderAttributes = {
				borderType: 'solid',
				boxShadow: { enable: false },
			};

			const result = serializeBorderAttributes(attrs);

			expect(result.borderType).toBe('solid');
			expect(result.boxShadow).toBeUndefined();
		});

		it('should not serialize empty dimensions', () => {
			const attrs: BorderAttributes = {
				borderType: 'solid',
				borderWidth: {},
				borderRadius: {},
			};

			const result = serializeBorderAttributes(attrs);

			expect(result.borderType).toBe('solid');
			expect(result.borderWidth).toBeUndefined();
			expect(result.borderRadius).toBeUndefined();
		});
	});

	describe('Round-trip tests', () => {
		it('should maintain Normal state through parse→serialize→parse', () => {
			const original: BorderAttributes = {
				borderType: 'solid',
				borderWidth: { top: '2px', right: '2px', bottom: '2px', left: '2px' },
				borderColor: '#000000',
				borderRadius: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
				boxShadow: {
					enable: true,
					horizontal: 3,
					vertical: 3,
					blur: 6,
					spread: 0,
					color: 'rgba(0, 0, 0, 0.2)',
				},
			};

			const serialized = serializeBorderAttributes(original);
			expect(serialized).toBeTruthy();

			const parsed = parseBorderAttributes(serialized);
			expect(parsed).toEqual(original);
		});

		it('should maintain Hover state through parse→serialize→parse', () => {
			const original: BorderAttributes = {
				borderTypeHover: 'dashed',
				borderWidthHover: { top: '1px', right: '1px', bottom: '1px', left: '1px' },
				borderColorHover: '#ff0000',
				borderRadiusHover: { top: '8px', right: '8px', bottom: '8px', left: '8px' },
				boxShadowHover: {
					enable: true,
					horizontal: 0,
					vertical: 4,
					blur: 8,
					spread: 2,
					color: 'rgba(255, 0, 0, 0.3)',
				},
			};

			const serialized = serializeBorderAttributes(original);
			expect(serialized).toBeTruthy();

			const parsed = parseBorderAttributes(serialized);
			expect(parsed).toEqual(original);
		});

		it('should maintain responsive border radius through round-trip', () => {
			const original: BorderAttributes = {
				borderType: 'solid',
				borderRadius: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
				borderRadius_tablet: { top: '8px', right: '8px', bottom: '8px', left: '8px' },
				borderRadius_mobile: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
			};

			const serialized = serializeBorderAttributes(original);
			const parsed = parseBorderAttributes(serialized);
			expect(parsed).toEqual(original);
		});

		it('should maintain mixed Normal and Hover through round-trip', () => {
			const original: BorderAttributes = {
				borderType: 'solid',
				borderWidth: { top: '2px', right: '2px', bottom: '2px', left: '2px' },
				borderColor: '#000000',
				borderRadius: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
				borderTypeHover: 'double',
				borderColorHover: '#0073aa',
				borderRadiusHover: { top: '8px', right: '8px', bottom: '8px', left: '8px' },
			};

			const serialized = serializeBorderAttributes(original);
			const parsed = parseBorderAttributes(serialized);
			expect(parsed).toEqual(original);
		});
	});

	describe('Default values', () => {
		it('should return correct default attributes', () => {
			const defaults = getDefaultBorderAttributes();

			expect(defaults.borderType).toBe('');
			expect(defaults.borderWidth).toEqual({});
			expect(defaults.borderRadius).toEqual({});
			expect(defaults.boxShadow).toEqual({ enable: false });
			expect(defaults.borderTypeHover).toBe('');
			expect(defaults.borderWidthHover).toEqual({});
			expect(defaults.borderRadiusHover).toEqual({});
			expect(defaults.boxShadowHover).toEqual({ enable: false });
		});

		it('should override defaults with saved values', () => {
			const saved = {
				borderType: 'solid',
				borderColor: '#ff0000',
			};

			const result = parseBorderAttributes(saved);
			const defaults = getDefaultBorderAttributes();

			const merged = { ...defaults, ...result };

			expect(merged.borderType).toBe('solid');
			expect(merged.borderColor).toBe('#ff0000');
			expect(merged.borderWidth).toEqual({});
			expect(merged.boxShadow).toEqual({ enable: false });
		});
	});

	describe('Edge cases', () => {
		it('should handle borderType set to empty string', () => {
			const attrs: BorderAttributes = {
				borderType: '',
			};

			const result = serializeBorderAttributes(attrs);

			expect(result).toBeTruthy();
			expect(result.borderType).toBe('');
		});

		it('should handle borderType set to "none"', () => {
			const attrs: BorderAttributes = {
				borderType: 'none',
			};

			const result = serializeBorderAttributes(attrs);

			expect(result.borderType).toBe('none');
		});

		it('should handle partial dimensions', () => {
			const attrs: BorderAttributes = {
				borderWidth: { top: '2px', bottom: '2px' },
				borderRadius: { top: '5px' },
			};

			const result = serializeBorderAttributes(attrs);

			expect(result.borderWidth).toEqual({ top: '2px', bottom: '2px' });
			expect(result.borderRadius).toEqual({ top: '5px' });
		});

		it('should handle mixed units in dimensions', () => {
			const attrs: BorderAttributes = {
				borderWidth: { top: '2px', right: '1em', bottom: '2px', left: '1em' },
				borderRadius: { top: '5px', right: '10%', bottom: '5px', left: '10%' },
			};

			const serialized = serializeBorderAttributes(attrs);
			const parsed = parseBorderAttributes(serialized);

			expect(parsed.borderWidth).toEqual(attrs.borderWidth);
			expect(parsed.borderRadius).toEqual(attrs.borderRadius);
		});

		it('should preserve box shadow with zero values', () => {
			const attrs: BorderAttributes = {
				boxShadow: {
					enable: true,
					horizontal: 0,
					vertical: 0,
					blur: 0,
					spread: 0,
					color: 'rgba(0, 0, 0, 0.5)',
				},
			};

			const serialized = serializeBorderAttributes(attrs);
			const parsed = parseBorderAttributes(serialized);

			expect(parsed.boxShadow).toEqual(attrs.boxShadow);
		});

		it('should handle responsive radius with only tablet breakpoint', () => {
			const attrs: BorderAttributes = {
				borderRadius: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
				borderRadius_tablet: { top: '5px', right: '5px', bottom: '5px', left: '5px' },
			};

			const serialized = serializeBorderAttributes(attrs);
			const parsed = parseBorderAttributes(serialized);

			expect(parsed.borderRadius).toEqual(attrs.borderRadius);
			expect(parsed.borderRadius_tablet).toEqual(attrs.borderRadius_tablet);
			expect(parsed.borderRadius_mobile).toBeUndefined();
		});
	});
});
