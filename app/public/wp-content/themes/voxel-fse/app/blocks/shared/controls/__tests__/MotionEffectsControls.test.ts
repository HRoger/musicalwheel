/**
 * MotionEffectsControls Serialization Tests
 *
 * Tests for Motion Effects attribute parsing, serialization, and round-trip persistence.
 * Covers: Scrolling Effects, Mouse Effects, Sticky, Entrance Animation.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';

// ============================================================================
// Type Definitions (matching MotionEffectsControls.tsx)
// ============================================================================

interface RangeSliderValue {
	start: number;
	end: number;
}

interface MotionEffectsAttributes {
	// Scrolling Effects
	scrollingEffectsEnabled?: boolean;
	verticalScrollEnabled?: boolean;
	verticalScrollDirection?: string;
	verticalScrollSpeed?: number;
	verticalScrollViewport?: RangeSliderValue;
	horizontalScrollEnabled?: boolean;
	horizontalScrollDirection?: string;
	horizontalScrollSpeed?: number;
	horizontalScrollViewport?: RangeSliderValue;
	transparencyEnabled?: boolean;
	transparencyDirection?: string;
	transparencyLevel?: number;
	transparencyViewport?: RangeSliderValue;
	blurEnabled?: boolean;
	blurDirection?: string;
	blurLevel?: number;
	blurViewport?: RangeSliderValue;
	rotateEnabled?: boolean;
	rotateDirection?: string;
	rotateSpeed?: number;
	rotateViewport?: RangeSliderValue;
	scaleEnabled?: boolean;
	scaleDirection?: string;
	scaleSpeed?: number;
	scaleViewport?: RangeSliderValue;
	motionFxXAnchor?: string;
	motionFxYAnchor?: string;
	motionFxDevices?: string[];
	motionFxRange?: string;

	// Mouse Effects
	mouseEffectsEnabled?: boolean;
	mouseTrackEnabled?: boolean;
	mouseTrackDirection?: string;
	mouseTrackSpeed?: number;
	tiltEnabled?: boolean;
	tiltDirection?: string;
	tiltSpeed?: number;

	// Sticky
	sticky?: string;
	stickyOn?: string[];
	stickyOffset?: number;
	stickyOffset_tablet?: number;
	stickyOffset_mobile?: number;
	stickyEffectsOffset?: number;
	stickyEffectsOffset_tablet?: number;
	stickyEffectsOffset_mobile?: number;
	stickyAnchorOffset?: number;
	stickyAnchorOffset_tablet?: number;
	stickyAnchorOffset_mobile?: number;
	stickyParent?: boolean;

	// Entrance Animation
	entranceAnimation?: string;
	entranceAnimation_tablet?: string;
	entranceAnimation_mobile?: string;
	animationDuration?: string;
	animationDelay?: number;
}

// Default values (matching motionEffectsAttributes export)
const DEFAULTS: MotionEffectsAttributes = {
	scrollingEffectsEnabled: false,
	verticalScrollEnabled: false,
	verticalScrollDirection: '',
	verticalScrollSpeed: 4,
	verticalScrollViewport: { start: 0, end: 100 },
	horizontalScrollEnabled: false,
	horizontalScrollDirection: '',
	horizontalScrollSpeed: 4,
	horizontalScrollViewport: { start: 0, end: 100 },
	transparencyEnabled: false,
	transparencyDirection: 'in',
	transparencyLevel: 10,
	transparencyViewport: { start: 20, end: 80 },
	blurEnabled: false,
	blurDirection: 'in',
	blurLevel: 7,
	blurViewport: { start: 20, end: 80 },
	rotateEnabled: false,
	rotateDirection: '',
	rotateSpeed: 1,
	rotateViewport: { start: 0, end: 100 },
	scaleEnabled: false,
	scaleDirection: 'scale-up',
	scaleSpeed: 4,
	scaleViewport: { start: 0, end: 100 },
	motionFxXAnchor: 'center',
	motionFxYAnchor: 'center',
	motionFxDevices: ['desktop', 'tablet', 'mobile'],
	motionFxRange: '',
	mouseEffectsEnabled: false,
	mouseTrackEnabled: false,
	mouseTrackDirection: '',
	mouseTrackSpeed: 1,
	tiltEnabled: false,
	tiltDirection: '',
	tiltSpeed: 4,
	sticky: '',
	stickyOn: ['desktop', 'tablet', 'mobile'],
	stickyOffset: 0,
	stickyEffectsOffset: 0,
	stickyAnchorOffset: 0,
	stickyParent: false,
	entranceAnimation: '',
	animationDuration: '',
	animationDelay: 0,
};

// ============================================================================
// Parse Functions
// ============================================================================

/**
 * Parse motion effects attributes from block save data
 */
export function parseMotionEffectsAttributes(
	attrs: Partial<MotionEffectsAttributes> | null | undefined
): MotionEffectsAttributes {
	if (!attrs) return { ...DEFAULTS };

	return {
		// Scrolling Effects
		scrollingEffectsEnabled: attrs.scrollingEffectsEnabled ?? DEFAULTS.scrollingEffectsEnabled,
		verticalScrollEnabled: attrs.verticalScrollEnabled ?? DEFAULTS.verticalScrollEnabled,
		verticalScrollDirection: attrs.verticalScrollDirection ?? DEFAULTS.verticalScrollDirection,
		verticalScrollSpeed: attrs.verticalScrollSpeed ?? DEFAULTS.verticalScrollSpeed,
		verticalScrollViewport: parseViewport(attrs.verticalScrollViewport, DEFAULTS.verticalScrollViewport!),
		horizontalScrollEnabled: attrs.horizontalScrollEnabled ?? DEFAULTS.horizontalScrollEnabled,
		horizontalScrollDirection: attrs.horizontalScrollDirection ?? DEFAULTS.horizontalScrollDirection,
		horizontalScrollSpeed: attrs.horizontalScrollSpeed ?? DEFAULTS.horizontalScrollSpeed,
		horizontalScrollViewport: parseViewport(attrs.horizontalScrollViewport, DEFAULTS.horizontalScrollViewport!),
		transparencyEnabled: attrs.transparencyEnabled ?? DEFAULTS.transparencyEnabled,
		transparencyDirection: attrs.transparencyDirection ?? DEFAULTS.transparencyDirection,
		transparencyLevel: attrs.transparencyLevel ?? DEFAULTS.transparencyLevel,
		transparencyViewport: parseViewport(attrs.transparencyViewport, DEFAULTS.transparencyViewport!),
		blurEnabled: attrs.blurEnabled ?? DEFAULTS.blurEnabled,
		blurDirection: attrs.blurDirection ?? DEFAULTS.blurDirection,
		blurLevel: attrs.blurLevel ?? DEFAULTS.blurLevel,
		blurViewport: parseViewport(attrs.blurViewport, DEFAULTS.blurViewport!),
		rotateEnabled: attrs.rotateEnabled ?? DEFAULTS.rotateEnabled,
		rotateDirection: attrs.rotateDirection ?? DEFAULTS.rotateDirection,
		rotateSpeed: attrs.rotateSpeed ?? DEFAULTS.rotateSpeed,
		rotateViewport: parseViewport(attrs.rotateViewport, DEFAULTS.rotateViewport!),
		scaleEnabled: attrs.scaleEnabled ?? DEFAULTS.scaleEnabled,
		scaleDirection: attrs.scaleDirection ?? DEFAULTS.scaleDirection,
		scaleSpeed: attrs.scaleSpeed ?? DEFAULTS.scaleSpeed,
		scaleViewport: parseViewport(attrs.scaleViewport, DEFAULTS.scaleViewport!),
		motionFxXAnchor: attrs.motionFxXAnchor ?? DEFAULTS.motionFxXAnchor,
		motionFxYAnchor: attrs.motionFxYAnchor ?? DEFAULTS.motionFxYAnchor,
		motionFxDevices: attrs.motionFxDevices ?? DEFAULTS.motionFxDevices,
		motionFxRange: attrs.motionFxRange ?? DEFAULTS.motionFxRange,

		// Mouse Effects
		mouseEffectsEnabled: attrs.mouseEffectsEnabled ?? DEFAULTS.mouseEffectsEnabled,
		mouseTrackEnabled: attrs.mouseTrackEnabled ?? DEFAULTS.mouseTrackEnabled,
		mouseTrackDirection: attrs.mouseTrackDirection ?? DEFAULTS.mouseTrackDirection,
		mouseTrackSpeed: attrs.mouseTrackSpeed ?? DEFAULTS.mouseTrackSpeed,
		tiltEnabled: attrs.tiltEnabled ?? DEFAULTS.tiltEnabled,
		tiltDirection: attrs.tiltDirection ?? DEFAULTS.tiltDirection,
		tiltSpeed: attrs.tiltSpeed ?? DEFAULTS.tiltSpeed,

		// Sticky
		sticky: attrs.sticky ?? DEFAULTS.sticky,
		stickyOn: attrs.stickyOn ?? DEFAULTS.stickyOn,
		stickyOffset: attrs.stickyOffset ?? DEFAULTS.stickyOffset,
		stickyOffset_tablet: attrs.stickyOffset_tablet,
		stickyOffset_mobile: attrs.stickyOffset_mobile,
		stickyEffectsOffset: attrs.stickyEffectsOffset ?? DEFAULTS.stickyEffectsOffset,
		stickyEffectsOffset_tablet: attrs.stickyEffectsOffset_tablet,
		stickyEffectsOffset_mobile: attrs.stickyEffectsOffset_mobile,
		stickyAnchorOffset: attrs.stickyAnchorOffset ?? DEFAULTS.stickyAnchorOffset,
		stickyAnchorOffset_tablet: attrs.stickyAnchorOffset_tablet,
		stickyAnchorOffset_mobile: attrs.stickyAnchorOffset_mobile,
		stickyParent: attrs.stickyParent ?? DEFAULTS.stickyParent,

		// Entrance Animation
		entranceAnimation: attrs.entranceAnimation ?? DEFAULTS.entranceAnimation,
		entranceAnimation_tablet: attrs.entranceAnimation_tablet,
		entranceAnimation_mobile: attrs.entranceAnimation_mobile,
		animationDuration: attrs.animationDuration ?? DEFAULTS.animationDuration,
		animationDelay: attrs.animationDelay ?? DEFAULTS.animationDelay,
	};
}

/**
 * Parse viewport value with defaults
 */
function parseViewport(
	value: RangeSliderValue | undefined,
	defaults: RangeSliderValue
): RangeSliderValue {
	if (!value) return { ...defaults };
	return {
		start: typeof value.start === 'number' ? value.start : defaults.start,
		end: typeof value.end === 'number' ? value.end : defaults.end,
	};
}

// ============================================================================
// Serialize Functions
// ============================================================================

/**
 * Serialize motion effects attributes for block save
 * Returns only non-default values to minimize stored data
 */
export function serializeMotionEffectsAttributes(
	attrs: MotionEffectsAttributes
): Partial<MotionEffectsAttributes> {
	const result: Partial<MotionEffectsAttributes> = {};

	// Only serialize values that differ from defaults
	if (attrs.scrollingEffectsEnabled !== DEFAULTS.scrollingEffectsEnabled) {
		result.scrollingEffectsEnabled = attrs.scrollingEffectsEnabled;
	}
	if (attrs.verticalScrollEnabled !== DEFAULTS.verticalScrollEnabled) {
		result.verticalScrollEnabled = attrs.verticalScrollEnabled;
	}
	if (attrs.verticalScrollDirection !== DEFAULTS.verticalScrollDirection) {
		result.verticalScrollDirection = attrs.verticalScrollDirection;
	}
	if (attrs.verticalScrollSpeed !== DEFAULTS.verticalScrollSpeed) {
		result.verticalScrollSpeed = attrs.verticalScrollSpeed;
	}
	if (!isViewportEqual(attrs.verticalScrollViewport, DEFAULTS.verticalScrollViewport!)) {
		result.verticalScrollViewport = attrs.verticalScrollViewport;
	}

	// Horizontal Scroll
	if (attrs.horizontalScrollEnabled !== DEFAULTS.horizontalScrollEnabled) {
		result.horizontalScrollEnabled = attrs.horizontalScrollEnabled;
	}
	if (attrs.horizontalScrollDirection !== DEFAULTS.horizontalScrollDirection) {
		result.horizontalScrollDirection = attrs.horizontalScrollDirection;
	}
	if (attrs.horizontalScrollSpeed !== DEFAULTS.horizontalScrollSpeed) {
		result.horizontalScrollSpeed = attrs.horizontalScrollSpeed;
	}
	if (!isViewportEqual(attrs.horizontalScrollViewport, DEFAULTS.horizontalScrollViewport!)) {
		result.horizontalScrollViewport = attrs.horizontalScrollViewport;
	}

	// Transparency
	if (attrs.transparencyEnabled !== DEFAULTS.transparencyEnabled) {
		result.transparencyEnabled = attrs.transparencyEnabled;
	}
	if (attrs.transparencyDirection !== DEFAULTS.transparencyDirection) {
		result.transparencyDirection = attrs.transparencyDirection;
	}
	if (attrs.transparencyLevel !== DEFAULTS.transparencyLevel) {
		result.transparencyLevel = attrs.transparencyLevel;
	}
	if (!isViewportEqual(attrs.transparencyViewport, DEFAULTS.transparencyViewport!)) {
		result.transparencyViewport = attrs.transparencyViewport;
	}

	// Blur
	if (attrs.blurEnabled !== DEFAULTS.blurEnabled) {
		result.blurEnabled = attrs.blurEnabled;
	}
	if (attrs.blurDirection !== DEFAULTS.blurDirection) {
		result.blurDirection = attrs.blurDirection;
	}
	if (attrs.blurLevel !== DEFAULTS.blurLevel) {
		result.blurLevel = attrs.blurLevel;
	}
	if (!isViewportEqual(attrs.blurViewport, DEFAULTS.blurViewport!)) {
		result.blurViewport = attrs.blurViewport;
	}

	// Rotate
	if (attrs.rotateEnabled !== DEFAULTS.rotateEnabled) {
		result.rotateEnabled = attrs.rotateEnabled;
	}
	if (attrs.rotateDirection !== DEFAULTS.rotateDirection) {
		result.rotateDirection = attrs.rotateDirection;
	}
	if (attrs.rotateSpeed !== DEFAULTS.rotateSpeed) {
		result.rotateSpeed = attrs.rotateSpeed;
	}
	if (!isViewportEqual(attrs.rotateViewport, DEFAULTS.rotateViewport!)) {
		result.rotateViewport = attrs.rotateViewport;
	}

	// Scale
	if (attrs.scaleEnabled !== DEFAULTS.scaleEnabled) {
		result.scaleEnabled = attrs.scaleEnabled;
	}
	if (attrs.scaleDirection !== DEFAULTS.scaleDirection) {
		result.scaleDirection = attrs.scaleDirection;
	}
	if (attrs.scaleSpeed !== DEFAULTS.scaleSpeed) {
		result.scaleSpeed = attrs.scaleSpeed;
	}
	if (!isViewportEqual(attrs.scaleViewport, DEFAULTS.scaleViewport!)) {
		result.scaleViewport = attrs.scaleViewport;
	}

	// Anchor Points
	if (attrs.motionFxXAnchor !== DEFAULTS.motionFxXAnchor) {
		result.motionFxXAnchor = attrs.motionFxXAnchor;
	}
	if (attrs.motionFxYAnchor !== DEFAULTS.motionFxYAnchor) {
		result.motionFxYAnchor = attrs.motionFxYAnchor;
	}
	if (JSON.stringify(attrs.motionFxDevices) !== JSON.stringify(DEFAULTS.motionFxDevices)) {
		result.motionFxDevices = attrs.motionFxDevices;
	}
	if (attrs.motionFxRange !== DEFAULTS.motionFxRange) {
		result.motionFxRange = attrs.motionFxRange;
	}

	// Mouse Effects
	if (attrs.mouseEffectsEnabled !== DEFAULTS.mouseEffectsEnabled) {
		result.mouseEffectsEnabled = attrs.mouseEffectsEnabled;
	}
	if (attrs.mouseTrackEnabled !== DEFAULTS.mouseTrackEnabled) {
		result.mouseTrackEnabled = attrs.mouseTrackEnabled;
	}
	if (attrs.mouseTrackDirection !== DEFAULTS.mouseTrackDirection) {
		result.mouseTrackDirection = attrs.mouseTrackDirection;
	}
	if (attrs.mouseTrackSpeed !== DEFAULTS.mouseTrackSpeed) {
		result.mouseTrackSpeed = attrs.mouseTrackSpeed;
	}
	if (attrs.tiltEnabled !== DEFAULTS.tiltEnabled) {
		result.tiltEnabled = attrs.tiltEnabled;
	}
	if (attrs.tiltDirection !== DEFAULTS.tiltDirection) {
		result.tiltDirection = attrs.tiltDirection;
	}
	if (attrs.tiltSpeed !== DEFAULTS.tiltSpeed) {
		result.tiltSpeed = attrs.tiltSpeed;
	}

	// Sticky
	if (attrs.sticky !== DEFAULTS.sticky) {
		result.sticky = attrs.sticky;
	}
	if (JSON.stringify(attrs.stickyOn) !== JSON.stringify(DEFAULTS.stickyOn)) {
		result.stickyOn = attrs.stickyOn;
	}
	if (attrs.stickyOffset !== DEFAULTS.stickyOffset) {
		result.stickyOffset = attrs.stickyOffset;
	}
	if (attrs.stickyOffset_tablet !== undefined) {
		result.stickyOffset_tablet = attrs.stickyOffset_tablet;
	}
	if (attrs.stickyOffset_mobile !== undefined) {
		result.stickyOffset_mobile = attrs.stickyOffset_mobile;
	}
	if (attrs.stickyEffectsOffset !== DEFAULTS.stickyEffectsOffset) {
		result.stickyEffectsOffset = attrs.stickyEffectsOffset;
	}
	if (attrs.stickyEffectsOffset_tablet !== undefined) {
		result.stickyEffectsOffset_tablet = attrs.stickyEffectsOffset_tablet;
	}
	if (attrs.stickyEffectsOffset_mobile !== undefined) {
		result.stickyEffectsOffset_mobile = attrs.stickyEffectsOffset_mobile;
	}
	if (attrs.stickyAnchorOffset !== DEFAULTS.stickyAnchorOffset) {
		result.stickyAnchorOffset = attrs.stickyAnchorOffset;
	}
	if (attrs.stickyAnchorOffset_tablet !== undefined) {
		result.stickyAnchorOffset_tablet = attrs.stickyAnchorOffset_tablet;
	}
	if (attrs.stickyAnchorOffset_mobile !== undefined) {
		result.stickyAnchorOffset_mobile = attrs.stickyAnchorOffset_mobile;
	}
	if (attrs.stickyParent !== DEFAULTS.stickyParent) {
		result.stickyParent = attrs.stickyParent;
	}

	// Entrance Animation
	if (attrs.entranceAnimation !== DEFAULTS.entranceAnimation) {
		result.entranceAnimation = attrs.entranceAnimation;
	}
	if (attrs.entranceAnimation_tablet !== undefined) {
		result.entranceAnimation_tablet = attrs.entranceAnimation_tablet;
	}
	if (attrs.entranceAnimation_mobile !== undefined) {
		result.entranceAnimation_mobile = attrs.entranceAnimation_mobile;
	}
	if (attrs.animationDuration !== DEFAULTS.animationDuration) {
		result.animationDuration = attrs.animationDuration;
	}
	if (attrs.animationDelay !== DEFAULTS.animationDelay) {
		result.animationDelay = attrs.animationDelay;
	}

	return result;
}

/**
 * Compare viewport values for equality
 */
function isViewportEqual(
	a: RangeSliderValue | undefined,
	b: RangeSliderValue
): boolean {
	if (!a) return false;
	return a.start === b.start && a.end === b.end;
}

/**
 * Check if any motion effects are enabled
 */
export function hasMotionEffects(attrs: MotionEffectsAttributes): boolean {
	return (
		attrs.scrollingEffectsEnabled === true ||
		attrs.mouseEffectsEnabled === true ||
		(attrs.sticky !== '' && attrs.sticky !== undefined) ||
		(attrs.entranceAnimation !== '' && attrs.entranceAnimation !== undefined)
	);
}

// ============================================================================
// Tests
// ============================================================================

describe('MotionEffectsAttributes Serialization', () => {
	// ============================================================================
	// Parse Tests
	// ============================================================================

	describe('parseMotionEffectsAttributes', () => {
		it('should return defaults for null', () => {
			const result = parseMotionEffectsAttributes(null);
			expect(result.scrollingEffectsEnabled).toBe(false);
			expect(result.verticalScrollSpeed).toBe(4);
			expect(result.transparencyViewport).toEqual({ start: 20, end: 80 });
		});

		it('should return defaults for undefined', () => {
			const result = parseMotionEffectsAttributes(undefined);
			expect(result.scrollingEffectsEnabled).toBe(false);
			expect(result.sticky).toBe('');
		});

		it('should parse partial attributes', () => {
			const result = parseMotionEffectsAttributes({
				scrollingEffectsEnabled: true,
				verticalScrollEnabled: true,
			});
			expect(result.scrollingEffectsEnabled).toBe(true);
			expect(result.verticalScrollEnabled).toBe(true);
			expect(result.horizontalScrollEnabled).toBe(false); // Default
		});

		it('should parse scrolling effect with custom viewport', () => {
			const result = parseMotionEffectsAttributes({
				verticalScrollViewport: { start: 10, end: 90 },
			});
			expect(result.verticalScrollViewport).toEqual({ start: 10, end: 90 });
		});

		it('should parse sticky attributes', () => {
			const result = parseMotionEffectsAttributes({
				sticky: 'top',
				stickyOffset: 50,
				stickyOn: ['desktop'],
			});
			expect(result.sticky).toBe('top');
			expect(result.stickyOffset).toBe(50);
			expect(result.stickyOn).toEqual(['desktop']);
		});

		it('should parse entrance animation attributes', () => {
			const result = parseMotionEffectsAttributes({
				entranceAnimation: 'fadeIn',
				animationDuration: 'slow',
				animationDelay: 500,
			});
			expect(result.entranceAnimation).toBe('fadeIn');
			expect(result.animationDuration).toBe('slow');
			expect(result.animationDelay).toBe(500);
		});

		it('should parse mouse effects', () => {
			const result = parseMotionEffectsAttributes({
				mouseEffectsEnabled: true,
				mouseTrackEnabled: true,
				mouseTrackSpeed: 5,
			});
			expect(result.mouseEffectsEnabled).toBe(true);
			expect(result.mouseTrackEnabled).toBe(true);
			expect(result.mouseTrackSpeed).toBe(5);
		});
	});

	// ============================================================================
	// Serialize Tests
	// ============================================================================

	describe('serializeMotionEffectsAttributes', () => {
		it('should return empty object for all defaults', () => {
			const result = serializeMotionEffectsAttributes(DEFAULTS);
			expect(Object.keys(result).length).toBe(0);
		});

		it('should serialize only changed scrolling effects', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				scrollingEffectsEnabled: true,
				verticalScrollEnabled: true,
			};
			const result = serializeMotionEffectsAttributes(attrs);

			expect(result.scrollingEffectsEnabled).toBe(true);
			expect(result.verticalScrollEnabled).toBe(true);
			expect(result.horizontalScrollEnabled).toBeUndefined();
		});

		it('should serialize custom viewport values', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				verticalScrollViewport: { start: 10, end: 90 },
			};
			const result = serializeMotionEffectsAttributes(attrs);

			expect(result.verticalScrollViewport).toEqual({ start: 10, end: 90 });
		});

		it('should NOT serialize default viewport values', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				verticalScrollViewport: { start: 0, end: 100 }, // Default
			};
			const result = serializeMotionEffectsAttributes(attrs);

			expect(result.verticalScrollViewport).toBeUndefined();
		});

		it('should serialize sticky with responsive offsets', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				sticky: 'top',
				stickyOffset: 100,
				stickyOffset_tablet: 50,
				stickyOffset_mobile: 25,
			};
			const result = serializeMotionEffectsAttributes(attrs);

			expect(result.sticky).toBe('top');
			expect(result.stickyOffset).toBe(100);
			expect(result.stickyOffset_tablet).toBe(50);
			expect(result.stickyOffset_mobile).toBe(25);
		});

		it('should serialize entrance animation', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				entranceAnimation: 'bounceIn',
				animationDuration: 'fast',
				animationDelay: 200,
			};
			const result = serializeMotionEffectsAttributes(attrs);

			expect(result.entranceAnimation).toBe('bounceIn');
			expect(result.animationDuration).toBe('fast');
			expect(result.animationDelay).toBe(200);
		});

		it('should serialize device restrictions', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				motionFxDevices: ['desktop'], // Only desktop
			};
			const result = serializeMotionEffectsAttributes(attrs);

			expect(result.motionFxDevices).toEqual(['desktop']);
		});
	});

	// ============================================================================
	// hasMotionEffects Tests
	// ============================================================================

	describe('hasMotionEffects', () => {
		it('should return false for all defaults', () => {
			expect(hasMotionEffects(DEFAULTS)).toBe(false);
		});

		it('should return true when scrolling effects enabled', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				scrollingEffectsEnabled: true,
			};
			expect(hasMotionEffects(attrs)).toBe(true);
		});

		it('should return true when mouse effects enabled', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				mouseEffectsEnabled: true,
			};
			expect(hasMotionEffects(attrs)).toBe(true);
		});

		it('should return true when sticky is set', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				sticky: 'top',
			};
			expect(hasMotionEffects(attrs)).toBe(true);
		});

		it('should return true when entrance animation is set', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				entranceAnimation: 'fadeIn',
			};
			expect(hasMotionEffects(attrs)).toBe(true);
		});
	});

	// ============================================================================
	// Round-trip Tests (Critical)
	// ============================================================================

	describe('Round-trip Tests', () => {
		it('should maintain scrolling effects through round-trip', () => {
			const original: MotionEffectsAttributes = {
				...DEFAULTS,
				scrollingEffectsEnabled: true,
				verticalScrollEnabled: true,
				verticalScrollDirection: 'negative',
				verticalScrollSpeed: 7,
				verticalScrollViewport: { start: 10, end: 90 },
			};

			const serialized = serializeMotionEffectsAttributes(original);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.scrollingEffectsEnabled).toBe(original.scrollingEffectsEnabled);
			expect(parsed.verticalScrollEnabled).toBe(original.verticalScrollEnabled);
			expect(parsed.verticalScrollDirection).toBe(original.verticalScrollDirection);
			expect(parsed.verticalScrollSpeed).toBe(original.verticalScrollSpeed);
			expect(parsed.verticalScrollViewport).toEqual(original.verticalScrollViewport);
		});

		it('should maintain mouse effects through round-trip', () => {
			const original: MotionEffectsAttributes = {
				...DEFAULTS,
				mouseEffectsEnabled: true,
				mouseTrackEnabled: true,
				mouseTrackDirection: 'negative',
				mouseTrackSpeed: 8,
				tiltEnabled: true,
				tiltSpeed: 6,
			};

			const serialized = serializeMotionEffectsAttributes(original);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.mouseEffectsEnabled).toBe(original.mouseEffectsEnabled);
			expect(parsed.mouseTrackEnabled).toBe(original.mouseTrackEnabled);
			expect(parsed.mouseTrackDirection).toBe(original.mouseTrackDirection);
			expect(parsed.mouseTrackSpeed).toBe(original.mouseTrackSpeed);
			expect(parsed.tiltEnabled).toBe(original.tiltEnabled);
			expect(parsed.tiltSpeed).toBe(original.tiltSpeed);
		});

		it('should maintain sticky settings through round-trip', () => {
			const original: MotionEffectsAttributes = {
				...DEFAULTS,
				sticky: 'bottom',
				stickyOn: ['desktop', 'tablet'],
				stickyOffset: 75,
				stickyOffset_tablet: 50,
				stickyEffectsOffset: 100,
				stickyParent: true,
			};

			const serialized = serializeMotionEffectsAttributes(original);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.sticky).toBe(original.sticky);
			expect(parsed.stickyOn).toEqual(original.stickyOn);
			expect(parsed.stickyOffset).toBe(original.stickyOffset);
			expect(parsed.stickyOffset_tablet).toBe(original.stickyOffset_tablet);
			expect(parsed.stickyEffectsOffset).toBe(original.stickyEffectsOffset);
			expect(parsed.stickyParent).toBe(original.stickyParent);
		});

		it('should maintain entrance animation through round-trip', () => {
			const original: MotionEffectsAttributes = {
				...DEFAULTS,
				entranceAnimation: 'zoomInDown',
				entranceAnimation_tablet: 'fadeIn',
				entranceAnimation_mobile: 'slideInUp',
				animationDuration: 'slow',
				animationDelay: 750,
			};

			const serialized = serializeMotionEffectsAttributes(original);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.entranceAnimation).toBe(original.entranceAnimation);
			expect(parsed.entranceAnimation_tablet).toBe(original.entranceAnimation_tablet);
			expect(parsed.entranceAnimation_mobile).toBe(original.entranceAnimation_mobile);
			expect(parsed.animationDuration).toBe(original.animationDuration);
			expect(parsed.animationDelay).toBe(original.animationDelay);
		});

		it('should maintain all six scrolling effects through round-trip', () => {
			const original: MotionEffectsAttributes = {
				...DEFAULTS,
				scrollingEffectsEnabled: true,
				verticalScrollEnabled: true,
				verticalScrollViewport: { start: 5, end: 95 },
				horizontalScrollEnabled: true,
				horizontalScrollDirection: 'negative',
				transparencyEnabled: true,
				transparencyDirection: 'out-in',
				transparencyViewport: { start: 30, end: 70 },
				blurEnabled: true,
				blurLevel: 12,
				rotateEnabled: true,
				rotateSpeed: 3,
				scaleEnabled: true,
				scaleDirection: 'scale-down-up',
			};

			const serialized = serializeMotionEffectsAttributes(original);
			const parsed = parseMotionEffectsAttributes(serialized);

			// Verify all effects
			expect(parsed.verticalScrollEnabled).toBe(true);
			expect(parsed.verticalScrollViewport).toEqual({ start: 5, end: 95 });
			expect(parsed.horizontalScrollEnabled).toBe(true);
			expect(parsed.horizontalScrollDirection).toBe('negative');
			expect(parsed.transparencyEnabled).toBe(true);
			expect(parsed.transparencyDirection).toBe('out-in');
			expect(parsed.transparencyViewport).toEqual({ start: 30, end: 70 });
			expect(parsed.blurEnabled).toBe(true);
			expect(parsed.blurLevel).toBe(12);
			expect(parsed.rotateEnabled).toBe(true);
			expect(parsed.rotateSpeed).toBe(3);
			expect(parsed.scaleEnabled).toBe(true);
			expect(parsed.scaleDirection).toBe('scale-down-up');
		});

		it('should maintain complete configuration through multiple round-trips', () => {
			const original: MotionEffectsAttributes = {
				...DEFAULTS,
				scrollingEffectsEnabled: true,
				verticalScrollEnabled: true,
				mouseEffectsEnabled: true,
				tiltEnabled: true,
				sticky: 'top',
				stickyOffset: 100,
				entranceAnimation: 'bounceIn',
				motionFxXAnchor: 'left',
				motionFxYAnchor: 'top',
			};

			// Round-trip 3 times
			let current = original;
			for (let i = 0; i < 3; i++) {
				const serialized = serializeMotionEffectsAttributes(current);
				current = parseMotionEffectsAttributes(serialized);
			}

			expect(current.scrollingEffectsEnabled).toBe(original.scrollingEffectsEnabled);
			expect(current.verticalScrollEnabled).toBe(original.verticalScrollEnabled);
			expect(current.mouseEffectsEnabled).toBe(original.mouseEffectsEnabled);
			expect(current.tiltEnabled).toBe(original.tiltEnabled);
			expect(current.sticky).toBe(original.sticky);
			expect(current.stickyOffset).toBe(original.stickyOffset);
			expect(current.entranceAnimation).toBe(original.entranceAnimation);
			expect(current.motionFxXAnchor).toBe(original.motionFxXAnchor);
			expect(current.motionFxYAnchor).toBe(original.motionFxYAnchor);
		});
	});

	// ============================================================================
	// Edge Cases
	// ============================================================================

	describe('Edge Cases', () => {
		it('should handle zero speed values', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				verticalScrollSpeed: 0,
			};
			const serialized = serializeMotionEffectsAttributes(attrs);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.verticalScrollSpeed).toBe(0);
		});

		it('should handle negative speed values for scale', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				scaleSpeed: -5,
			};
			const serialized = serializeMotionEffectsAttributes(attrs);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.scaleSpeed).toBe(-5);
		});

		it('should handle empty device arrays', () => {
			const attrs: MotionEffectsAttributes = {
				...DEFAULTS,
				motionFxDevices: [],
			};
			const serialized = serializeMotionEffectsAttributes(attrs);
			const parsed = parseMotionEffectsAttributes(serialized);

			expect(parsed.motionFxDevices).toEqual([]);
		});

		it('should handle all transparency directions', () => {
			const directions = ['in', 'out', 'out-in', 'in-out'];
			for (const direction of directions) {
				const attrs: MotionEffectsAttributes = {
					...DEFAULTS,
					transparencyDirection: direction,
				};
				const serialized = serializeMotionEffectsAttributes(attrs);
				const parsed = parseMotionEffectsAttributes(serialized);

				expect(parsed.transparencyDirection).toBe(direction);
			}
		});

		it('should handle all scale directions', () => {
			const directions = ['scale-up', 'scale-down', 'scale-down-up', 'scale-up-down'];
			for (const direction of directions) {
				const attrs: MotionEffectsAttributes = {
					...DEFAULTS,
					scaleDirection: direction,
				};
				const serialized = serializeMotionEffectsAttributes(attrs);
				const parsed = parseMotionEffectsAttributes(serialized);

				expect(parsed.scaleDirection).toBe(direction);
			}
		});
	});
});
