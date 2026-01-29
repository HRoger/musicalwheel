/**
 * Shared Utility - generateAdvancedStyles() Tests
 *
 * Tests that verify generateAdvancedStyles() correctly converts
 * AdvancedTab attributes to CSS properties.
 *
 * These tests work with ANY block that uses AdvancedTab.
 *
 * Reference: .claude/commands/wire/controls.md
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import {
	generateAdvancedStyles,
	combineBlockClasses,
	parseCustomAttributes,
	getVisibilityClasses,
	type AdvancedStyleAttributes,
} from '../generateAdvancedStyles';

// ============================================
// Test Helpers
// ============================================

/**
 * Create minimal attributes for testing
 * Works with ANY block that uses AdvancedTab
 */
function createTestAttributes(overrides: Partial<AdvancedStyleAttributes> = {}): AdvancedStyleAttributes {
	return {
		blockId: 'test-block-123',
		...overrides,
	};
}

// ============================================
// Layout Accordion - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Layout Accordion', () => {
	describe('Margin', () => {
		it('should generate margin styles from blockMargin attribute', () => {
			const attrs = createTestAttributes({
				blockMargin: { top: 10, right: 20, bottom: 30, left: 40, unit: 'px' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.marginTop).toBe('10px');
			expect(styles.marginRight).toBe('20px');
			expect(styles.marginBottom).toBe('30px');
			expect(styles.marginLeft).toBe('40px');
		});

		it('should handle margin with em unit', () => {
			const attrs = createTestAttributes({
				blockMargin: { top: 1, right: 2, bottom: 3, left: 4, unit: 'em' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.marginTop).toBe('1em');
			expect(styles.marginRight).toBe('2em');
			expect(styles.marginBottom).toBe('3em');
			expect(styles.marginLeft).toBe('4em');
		});

		it('should handle partial margin values', () => {
			const attrs = createTestAttributes({
				blockMargin: { top: 10, bottom: 20, unit: 'px' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.marginTop).toBe('10px');
			expect(styles.marginBottom).toBe('20px');
			expect(styles.marginRight).toBeUndefined();
			expect(styles.marginLeft).toBeUndefined();
		});

		it('should default to px unit if not specified', () => {
			const attrs = createTestAttributes({
				blockMargin: { top: 10, right: 20 },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.marginTop).toBe('10px');
			expect(styles.marginRight).toBe('20px');
		});
	});

	describe('Padding', () => {
		it('should generate padding styles from blockPadding attribute', () => {
			const attrs = createTestAttributes({
				blockPadding: { top: 15, right: 25, bottom: 35, left: 45, unit: 'px' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.paddingTop).toBe('15px');
			expect(styles.paddingRight).toBe('25px');
			expect(styles.paddingBottom).toBe('35px');
			expect(styles.paddingLeft).toBe('45px');
		});

		it('should handle padding with % unit', () => {
			const attrs = createTestAttributes({
				blockPadding: { top: 5, right: 10, bottom: 5, left: 10, unit: '%' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.paddingTop).toBe('5%');
			expect(styles.paddingRight).toBe('10%');
		});
	});

	describe('Width', () => {
		it('should generate custom width when elementWidth is custom', () => {
			const attrs = createTestAttributes({
				elementWidth: 'custom',
				elementCustomWidth: 500,
				elementCustomWidthUnit: 'px',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.width).toBe('500px');
		});

		it('should generate 100% width when elementWidth is full', () => {
			const attrs = createTestAttributes({
				elementWidth: 'full',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.width).toBe('100%');
		});

		it('should generate inline-block display when elementWidth is inline', () => {
			const attrs = createTestAttributes({
				elementWidth: 'inline',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.display).toBe('inline-block');
			expect(styles.width).toBe('auto');
		});

		it('should handle custom width with % unit', () => {
			const attrs = createTestAttributes({
				elementWidth: 'custom',
				elementCustomWidth: 80,
				elementCustomWidthUnit: '%',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.width).toBe('80%');
		});
	});
});

// ============================================
// Position Accordion - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Position Accordion', () => {
	describe('Position', () => {
		it('should not apply position styles when position is default', () => {
			const attrs = createTestAttributes({
				position: 'default',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.position).toBeUndefined();
		});

		it('should apply relative position', () => {
			const attrs = createTestAttributes({
				position: 'relative',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.position).toBe('relative');
		});

		it('should apply absolute position with left/top offsets', () => {
			const attrs = createTestAttributes({
				position: 'absolute',
				offsetOrientationH: 'start',
				offsetX: 10,
				offsetXUnit: 'px',
				offsetOrientationV: 'start',
				offsetY: 20,
				offsetYUnit: 'px',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.position).toBe('absolute');
			expect(styles.left).toBe('10px');
			expect(styles.top).toBe('20px');
		});

		it('should apply absolute position with right/bottom offsets', () => {
			const attrs = createTestAttributes({
				position: 'absolute',
				offsetOrientationH: 'end',
				offsetXEnd: 30,
				offsetXEndUnit: 'px',
				offsetOrientationV: 'end',
				offsetYEnd: 40,
				offsetYEndUnit: 'px',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.position).toBe('absolute');
			expect(styles.right).toBe('30px');
			expect(styles.bottom).toBe('40px');
		});

		it('should apply fixed position', () => {
			const attrs = createTestAttributes({
				position: 'fixed',
				offsetX: 0,
				offsetXUnit: 'px',
				offsetY: 0,
				offsetYUnit: 'px',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.position).toBe('fixed');
		});
	});

	describe('Z-Index', () => {
		it('should apply z-index', () => {
			const attrs = createTestAttributes({
				zIndex: 100,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.zIndex).toBe(100);
		});

		it('should apply z-index of 0', () => {
			const attrs = createTestAttributes({
				zIndex: 0,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.zIndex).toBe(0);
		});

		it('should apply negative z-index', () => {
			const attrs = createTestAttributes({
				zIndex: -1,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.zIndex).toBe(-1);
		});
	});
});

// ============================================
// Border Accordion - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Border Accordion', () => {
	describe('Border Type and Color', () => {
		it('should apply border style when borderType is set', () => {
			const attrs = createTestAttributes({
				borderType: 'solid',
				borderColor: '#333333',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.borderStyle).toBe('solid');
			expect(styles.borderColor).toBe('#333333');
		});

		it('should not apply border style when borderType is none', () => {
			const attrs = createTestAttributes({
				borderType: 'none',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.borderStyle).toBeUndefined();
		});

		it('should apply different border types', () => {
			const borderTypes = ['solid', 'dashed', 'dotted', 'double', 'groove'];

			borderTypes.forEach((type) => {
				const attrs = createTestAttributes({ borderType: type });
				const styles = generateAdvancedStyles(attrs);
				expect(styles.borderStyle).toBe(type);
			});
		});
	});

	describe('Border Width', () => {
		it('should apply border width from DimensionsConfig', () => {
			const attrs = createTestAttributes({
				borderType: 'solid',
				borderWidth: { top: 1, right: 2, bottom: 3, left: 4, unit: 'px' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.borderTopWidth).toBe('1px');
			expect(styles.borderRightWidth).toBe('2px');
			expect(styles.borderBottomWidth).toBe('3px');
			expect(styles.borderLeftWidth).toBe('4px');
		});
	});

	describe('Border Radius', () => {
		it('should apply border radius from DimensionsConfig', () => {
			const attrs = createTestAttributes({
				borderRadius: { top: 5, right: 10, bottom: 15, left: 20, unit: 'px' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.borderTopLeftRadius).toBe('5px');
			expect(styles.borderTopRightRadius).toBe('10px');
			expect(styles.borderBottomRightRadius).toBe('15px');
			expect(styles.borderBottomLeftRadius).toBe('20px');
		});

		it('should handle uniform border radius', () => {
			const attrs = createTestAttributes({
				borderRadius: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px', linked: true },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.borderTopLeftRadius).toBe('8px');
			expect(styles.borderTopRightRadius).toBe('8px');
			expect(styles.borderBottomRightRadius).toBe('8px');
			expect(styles.borderBottomLeftRadius).toBe('8px');
		});
	});

	describe('Box Shadow', () => {
		it('should apply box shadow with all values', () => {
			const attrs = createTestAttributes({
				boxShadow: {
					horizontal: 5,
					vertical: 10,
					blur: 15,
					spread: 2,
					color: 'rgba(0,0,0,0.3)',
					position: '',
				},
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.boxShadow).toBe('5px 10px 15px 2px rgba(0,0,0,0.3)');
		});

		it('should apply inset box shadow', () => {
			const attrs = createTestAttributes({
				boxShadow: {
					horizontal: 0,
					vertical: 4,
					blur: 8,
					spread: 0,
					color: 'rgba(0,0,0,0.2)',
					position: 'inset',
				},
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.boxShadow).toBe('inset 0px 4px 8px 0px rgba(0,0,0,0.2)');
		});

		it('should use default blur of 10 when not specified (Elementor default)', () => {
			const attrs = createTestAttributes({
				boxShadow: {
					horizontal: 0,
					vertical: 0,
					color: 'rgba(0,0,0,0.5)',
				},
			});

			const styles = generateAdvancedStyles(attrs);

			// Blur defaults to 10 per Elementor default
			expect(styles.boxShadow).toBe('0px 0px 10px 0px rgba(0,0,0,0.5)');
		});
	});
});

// ============================================
// Background Accordion - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Background Accordion', () => {
	describe('Classic Background', () => {
		it('should apply solid background color', () => {
			const attrs = createTestAttributes({
				backgroundType: 'classic',
				backgroundColor: '#ffffff',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundColor).toBe('#ffffff');
		});

		it('should apply background color when backgroundType is empty (default)', () => {
			const attrs = createTestAttributes({
				backgroundColor: '#f0f0f0',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundColor).toBe('#f0f0f0');
		});

		it('should apply background image with position and size', () => {
			const attrs = createTestAttributes({
				backgroundType: 'classic',
				backgroundImage: { id: 123, url: 'https://example.com/image.jpg' },
				bgImagePosition: 'center center',
				bgImageSize: 'cover',
				bgImageRepeat: 'no-repeat',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundImage).toBe('url(https://example.com/image.jpg)');
			expect(styles.backgroundPosition).toBe('center center');
			expect(styles.backgroundSize).toBe('cover');
			expect(styles.backgroundRepeat).toBe('no-repeat');
		});

		it('should apply custom background size', () => {
			const attrs = createTestAttributes({
				backgroundType: 'classic',
				backgroundImage: { url: 'https://example.com/image.jpg' },
				bgImageSize: 'custom',
				bgImageCustomWidth: 200,
				bgImageCustomWidthUnit: 'px',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundSize).toBe('200px');
		});
	});

	describe('Gradient Background', () => {
		it('should apply linear gradient', () => {
			const attrs = createTestAttributes({
				backgroundType: 'gradient',
				gradientColor: '#ff0000',
				gradientLocation: 0,
				gradientSecondColor: '#0000ff',
				gradientSecondLocation: 100,
				gradientType: 'linear',
				gradientAngle: 90,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundImage).toBe('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');
		});

		it('should apply radial gradient', () => {
			const attrs = createTestAttributes({
				backgroundType: 'gradient',
				gradientColor: '#000000',
				gradientLocation: 0,
				gradientSecondColor: '#ffffff',
				gradientSecondLocation: 100,
				gradientType: 'radial',
				gradientPosition: 'center center',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundImage).toBe(
				'radial-gradient(at center center, #000000 0%, #ffffff 100%)'
			);
		});

		it('should apply gradient with custom stop locations', () => {
			const attrs = createTestAttributes({
				backgroundType: 'gradient',
				gradientColor: '#ff0000',
				gradientLocation: 20,
				gradientSecondColor: '#0000ff',
				gradientSecondLocation: 80,
				gradientAngle: 45,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.backgroundImage).toBe('linear-gradient(45deg, #ff0000 20%, #0000ff 80%)');
		});
	});
});

// ============================================
// Transform Accordion - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Transform Accordion', () => {
	describe('Rotation', () => {
		it('should apply rotateZ transform', () => {
			const attrs = createTestAttributes({
				transformRotateZ: 45,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('rotateZ(45deg)');
		});

		it('should apply rotateX and rotateY transforms', () => {
			const attrs = createTestAttributes({
				transformRotateX: 30,
				transformRotateY: 60,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('rotateX(30deg)');
			expect(styles.transform).toContain('rotateY(60deg)');
		});
	});

	describe('Translate', () => {
		it('should apply translate transform', () => {
			const attrs = createTestAttributes({
				transformOffsetX: 50,
				transformOffsetXUnit: 'px',
				transformOffsetY: 100,
				transformOffsetYUnit: 'px',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('translate(50px, 100px)');
		});

		it('should apply translate with % unit', () => {
			const attrs = createTestAttributes({
				transformOffsetX: -50,
				transformOffsetXUnit: '%',
				transformOffsetY: -50,
				transformOffsetYUnit: '%',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('translate(-50%, -50%)');
		});
	});

	describe('Scale', () => {
		it('should apply scale transform', () => {
			const attrs = createTestAttributes({
				transformScaleX: 1.5,
				transformScaleY: 2,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('scale(1.5, 2)');
		});
	});

	describe('Skew', () => {
		it('should apply skew transform', () => {
			const attrs = createTestAttributes({
				transformSkewX: 15,
				transformSkewY: 10,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('skew(15deg, 10deg)');
		});
	});

	describe('Flip', () => {
		it('should apply horizontal flip', () => {
			const attrs = createTestAttributes({
				transformFlipH: true,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('scaleX(-1)');
		});

		it('should apply vertical flip', () => {
			const attrs = createTestAttributes({
				transformFlipV: true,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('scaleY(-1)');
		});
	});

	describe('Combined Transforms', () => {
		it('should combine multiple transforms', () => {
			const attrs = createTestAttributes({
				transformRotateZ: 45,
				transformOffsetX: 10,
				transformOffsetXUnit: 'px',
				transformOffsetY: 20,
				transformOffsetYUnit: 'px',
				transformScaleX: 1.2,
				transformScaleY: 1.2,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.transform).toContain('rotateZ(45deg)');
			expect(styles.transform).toContain('translate(10px, 20px)');
			expect(styles.transform).toContain('scale(1.2, 1.2)');
		});
	});
});

// ============================================
// Mask Accordion - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Mask Accordion', () => {
	describe('Mask with Shape', () => {
		it('should apply mask with predefined shape', () => {
			const attrs = createTestAttributes({
				maskSwitch: true,
				maskShape: 'circle',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskImage).toContain('circle.svg');
			expect(styles.WebkitMaskImage).toContain('circle.svg');
		});

		it('should not apply mask when maskSwitch is false', () => {
			const attrs = createTestAttributes({
				maskSwitch: false,
				maskShape: 'circle',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskImage).toBeUndefined();
		});
	});

	describe('Mask with Custom Image', () => {
		it('should apply mask with custom image URL', () => {
			const attrs = createTestAttributes({
				maskSwitch: true,
				maskImage: { url: 'https://example.com/mask.png' },
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskImage).toBe('url(https://example.com/mask.png)');
			expect(styles.WebkitMaskImage).toBe('url(https://example.com/mask.png)');
		});
	});

	describe('Mask Size', () => {
		it('should apply contain mask size', () => {
			const attrs = createTestAttributes({
				maskSwitch: true,
				maskShape: 'circle',
				maskSize: 'contain',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskSize).toBe('contain');
			expect(styles.WebkitMaskSize).toBe('contain');
		});

		it('should apply custom mask size', () => {
			const attrs = createTestAttributes({
				maskSwitch: true,
				maskShape: 'circle',
				maskSize: 'custom',
				maskSizeScale: 50,
				maskSizeScaleUnit: '%',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskSize).toBe('50%');
			expect(styles.WebkitMaskSize).toBe('50%');
		});
	});

	describe('Mask Position', () => {
		it('should apply preset mask position', () => {
			const attrs = createTestAttributes({
				maskSwitch: true,
				maskShape: 'circle',
				maskPosition: 'center center',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskPosition).toBe('center center');
		});

		it('should apply custom mask position', () => {
			const attrs = createTestAttributes({
				maskSwitch: true,
				maskShape: 'circle',
				maskPosition: 'custom',
				maskPositionX: 25,
				maskPositionXUnit: '%',
				maskPositionY: 75,
				maskPositionYUnit: '%',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.maskPosition).toBe('25% 75%');
		});
	});
});

// ============================================
// Overflow & Opacity - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Overflow & Opacity', () => {
	describe('Overflow', () => {
		it('should apply overflow hidden', () => {
			const attrs = createTestAttributes({
				overflow: 'hidden',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.overflow).toBe('hidden');
		});

		it('should apply overflow scroll', () => {
			const attrs = createTestAttributes({
				overflow: 'scroll',
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.overflow).toBe('scroll');
		});
	});

	describe('Opacity', () => {
		it('should apply opacity', () => {
			const attrs = createTestAttributes({
				opacity: 0.5,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.opacity).toBe(0.5);
		});

		it('should apply opacity of 0', () => {
			const attrs = createTestAttributes({
				opacity: 0,
			});

			const styles = generateAdvancedStyles(attrs);

			expect(styles.opacity).toBe(0);
		});
	});
});

// ============================================
// Transition - Style Generation Tests
// ============================================

describe('generateAdvancedStyles - Transition', () => {
	it('should apply transition duration', () => {
		const attrs = createTestAttributes({
			transitionDuration: 0.3,
		});

		const styles = generateAdvancedStyles(attrs);

		expect(styles.transition).toContain('0.3s');
	});

	it('should apply background transition duration', () => {
		const attrs = createTestAttributes({
			bgTransitionDuration: 0.5,
		});

		const styles = generateAdvancedStyles(attrs);

		expect(styles.transition).toContain('background 0.5s');
	});

	it('should combine transition and background transition', () => {
		const attrs = createTestAttributes({
			transitionDuration: 0.3,
			bgTransitionDuration: 0.6,
		});

		const styles = generateAdvancedStyles(attrs);

		expect(styles.transition).toContain('all 0.3s');
		expect(styles.transition).toContain('background 0.6s');
	});
});

// ============================================
// combineBlockClasses Tests
// ============================================

describe('combineBlockClasses', () => {
	it('should combine base class with custom classes', () => {
		const attrs = createTestAttributes({
			customClasses: 'custom-class-1 custom-class-2',
		});

		const className = combineBlockClasses('voxel-fse-block', attrs);

		expect(className).toContain('voxel-fse-block');
		expect(className).toContain('custom-class-1');
		expect(className).toContain('custom-class-2');
	});

	it('should include visibility classes when hidden', () => {
		const attrs = createTestAttributes({
			hideDesktop: true,
			hideTablet: false,
			hideMobile: true,
		});

		const className = combineBlockClasses('voxel-fse-block', attrs);

		expect(className).toContain('vx-hidden-desktop');
		expect(className).toContain('vx-hidden-mobile');
		expect(className).not.toContain('vx-hidden-tablet');
	});

	it('should handle empty custom classes', () => {
		const attrs = createTestAttributes({
			customClasses: '',
		});

		const className = combineBlockClasses('voxel-fse-block', attrs);

		expect(className).toBe('voxel-fse-block');
	});

	it('should work with any block base class', () => {
		const attrs = createTestAttributes({
			customClasses: 'my-class',
		});

		// Test with different block types
		expect(combineBlockClasses('voxel-fse-post-feed', attrs)).toContain('voxel-fse-post-feed');
		expect(combineBlockClasses('voxel-fse-map', attrs)).toContain('voxel-fse-map');
		expect(combineBlockClasses('voxel-fse-gallery', attrs)).toContain('voxel-fse-gallery');
	});
});

// ============================================
// getVisibilityClasses Tests
// ============================================

describe('getVisibilityClasses', () => {
	it('should return visibility classes for hidden devices', () => {
		const attrs = createTestAttributes({
			hideDesktop: true,
			hideTablet: true,
			hideMobile: true,
		});

		const classes = getVisibilityClasses(attrs);

		expect(classes).toContain('vx-hidden-desktop');
		expect(classes).toContain('vx-hidden-tablet');
		expect(classes).toContain('vx-hidden-mobile');
	});

	it('should return empty array when nothing is hidden', () => {
		const attrs = createTestAttributes({
			hideDesktop: false,
			hideTablet: false,
			hideMobile: false,
		});

		const classes = getVisibilityClasses(attrs);

		expect(classes).toHaveLength(0);
	});
});

// ============================================
// parseCustomAttributes Tests
// ============================================

describe('parseCustomAttributes', () => {
	it('should parse key|value pairs', () => {
		const customAttrs = parseCustomAttributes('data-test|value1\ndata-other|value2');

		expect(customAttrs['data-test']).toBe('value1');
		expect(customAttrs['data-other']).toBe('value2');
	});

	it('should handle boolean attributes (key only)', () => {
		const customAttrs = parseCustomAttributes('data-active\ndata-visible');

		expect(customAttrs['data-active']).toBe('');
		expect(customAttrs['data-visible']).toBe('');
	});

	it('should filter out dangerous attribute names', () => {
		const customAttrs = parseCustomAttributes('onclick|alert(1)\ndata-safe|value');

		expect(customAttrs['onclick']).toBeUndefined();
		expect(customAttrs['data-safe']).toBe('value');
	});

	it('should return empty object for undefined input', () => {
		const customAttrs = parseCustomAttributes(undefined);

		expect(customAttrs).toEqual({});
	});

	it('should handle empty lines', () => {
		const customAttrs = parseCustomAttributes('data-test|value\n\ndata-other|value2\n');

		expect(customAttrs['data-test']).toBe('value');
		expect(customAttrs['data-other']).toBe('value2');
	});
});

// ============================================
// Empty/Undefined Attribute Handling
// ============================================

describe('generateAdvancedStyles - Empty/Undefined Handling', () => {
	it('should handle all undefined attributes', () => {
		const attrs = createTestAttributes();

		const styles = generateAdvancedStyles(attrs);

		// Should return an object without errors
		expect(styles).toBeDefined();
		expect(typeof styles).toBe('object');
	});

	it('should not add properties for undefined values', () => {
		const attrs = createTestAttributes({
			blockMargin: undefined,
			blockPadding: undefined,
			backgroundColor: undefined,
		});

		const styles = generateAdvancedStyles(attrs);

		expect(styles.marginTop).toBeUndefined();
		expect(styles.paddingTop).toBeUndefined();
		expect(styles.backgroundColor).toBeUndefined();
	});
});

// ============================================
// Cross-Block Compatibility Tests
// ============================================

describe('Cross-Block Compatibility', () => {
	it('should work with any block attributes that extend AdvancedStyleAttributes', () => {
		// Simulate attributes from different blocks
		const postFeedAttrs = createTestAttributes({
			blockId: 'pf-123',
			blockMargin: { top: 20, unit: 'px' },
			backgroundColor: '#f5f5f5',
		});

		const mapAttrs = createTestAttributes({
			blockId: 'map-456',
			blockMargin: { top: 10, unit: 'px' },
			borderRadius: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
		});

		const galleryAttrs = createTestAttributes({
			blockId: 'gallery-789',
			blockPadding: { top: 15, right: 15, bottom: 15, left: 15, unit: 'px' },
			boxShadow: { horizontal: 0, vertical: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.1)' },
		});

		// All should generate valid styles
		const postFeedStyles = generateAdvancedStyles(postFeedAttrs);
		const mapStyles = generateAdvancedStyles(mapAttrs);
		const galleryStyles = generateAdvancedStyles(galleryAttrs);

		expect(postFeedStyles.marginTop).toBe('20px');
		expect(postFeedStyles.backgroundColor).toBe('#f5f5f5');

		expect(mapStyles.marginTop).toBe('10px');
		expect(mapStyles.borderTopLeftRadius).toBe('8px');

		expect(galleryStyles.paddingTop).toBe('15px');
		expect(galleryStyles.boxShadow).toBe('0px 4px 12px 0px rgba(0,0,0,0.1)');
	});
});
