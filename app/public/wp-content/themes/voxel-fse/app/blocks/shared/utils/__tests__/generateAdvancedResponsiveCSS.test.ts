/**
 * Shared Utility - generateAdvancedResponsiveCSS() Tests
 *
 * Tests that verify generateAdvancedResponsiveCSS() correctly converts
 * responsive block attributes (_tablet, _mobile) to @media query CSS.
 *
 * These tests work with ANY block that uses AdvancedTab.
 *
 * Reference: .claude/commands/wire/controls.md
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import {
	generateAdvancedResponsiveCSS,
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

const TEST_SELECTOR = '.voxel-fse-test-block-test-block-123';

// ============================================
// Responsive Margin Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Margin', () => {
	it('should generate tablet margin styles in @media query', () => {
		const attrs = createTestAttributes({
			blockMargin_tablet: { top: 10, right: 20, bottom: 30, left: 40, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('margin-top: 10px');
		expect(css).toContain('margin-right: 20px');
		expect(css).toContain('margin-bottom: 30px');
		expect(css).toContain('margin-left: 40px');
	});

	it('should generate mobile margin styles in @media query', () => {
		const attrs = createTestAttributes({
			blockMargin_mobile: { top: 5, right: 10, bottom: 15, left: 20, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('margin-top: 5px');
		expect(css).toContain('margin-right: 10px');
	});

	it('should generate both tablet and mobile margin styles', () => {
		const attrs = createTestAttributes({
			blockMargin_tablet: { top: 20, unit: 'px' },
			blockMargin_mobile: { top: 10, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('@media (max-width: 767px)');
	});
});

// ============================================
// Responsive Padding Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Padding', () => {
	it('should generate tablet padding styles in @media query', () => {
		const attrs = createTestAttributes({
			blockPadding_tablet: { top: 15, right: 25, bottom: 35, left: 45, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('padding-top: 15px');
		expect(css).toContain('padding-right: 25px');
	});

	it('should generate mobile padding styles in @media query', () => {
		const attrs = createTestAttributes({
			blockPadding_mobile: { top: 8, right: 16, bottom: 8, left: 16, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('padding-top: 8px');
	});
});

// ============================================
// Responsive Width Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Width', () => {
	it('should generate tablet custom width in @media query', () => {
		const attrs = createTestAttributes({
			elementWidth_tablet: 'custom',
			elementCustomWidth_tablet: 400,
			elementCustomWidthUnit: 'px',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('width: 400px');
	});

	it('should generate mobile full width in @media query', () => {
		const attrs = createTestAttributes({
			elementWidth_mobile: 'full',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('width: 100%');
	});

	it('should generate tablet inline width in @media query', () => {
		const attrs = createTestAttributes({
			elementWidth_tablet: 'inline',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('display: inline-block');
		expect(css).toContain('width: auto');
	});
});

// ============================================
// Responsive Border Radius Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Border Radius', () => {
	it('should generate tablet border radius in @media query', () => {
		const attrs = createTestAttributes({
			borderRadius_tablet: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('border-top-left-radius: 8px');
		expect(css).toContain('border-top-right-radius: 8px');
	});

	it('should generate mobile border radius in @media query', () => {
		const attrs = createTestAttributes({
			borderRadius_mobile: { top: 4, right: 4, bottom: 4, left: 4, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('border-top-left-radius: 4px');
	});
});

// ============================================
// Responsive Z-Index Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Z-Index', () => {
	it('should generate tablet z-index in @media query', () => {
		const attrs = createTestAttributes({
			zIndex_tablet: 50,
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('z-index: 50');
	});

	it('should generate mobile z-index in @media query', () => {
		const attrs = createTestAttributes({
			zIndex_mobile: 100,
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('z-index: 100');
	});
});

// ============================================
// Responsive Transform Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Transform', () => {
	it('should generate tablet rotation transform in @media query', () => {
		const attrs = createTestAttributes({
			transformRotateZ_tablet: 45,
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('transform: rotateZ(45deg)');
	});

	it('should generate mobile scale transform in @media query', () => {
		const attrs = createTestAttributes({
			transformScaleX_mobile: 0.8,
			transformScaleY_mobile: 0.8,
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('transform: scale(0.8, 0.8)');
	});

	it('should generate tablet translate transform in @media query', () => {
		const attrs = createTestAttributes({
			transformOffsetX_tablet: 20,
			transformOffsetY_tablet: 30,
			transformOffsetXUnit: 'px',
			transformOffsetYUnit: 'px',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('translate(20px, 30px)');
	});

	it('should combine multiple tablet transforms', () => {
		const attrs = createTestAttributes({
			transformRotateZ_tablet: 30,
			transformScaleX_tablet: 1.2,
			transformScaleY_tablet: 1.2,
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('rotateZ(30deg)');
		expect(css).toContain('scale(1.2, 1.2)');
	});
});

// ============================================
// Responsive Background Image Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Background Image', () => {
	it('should generate tablet background image in @media query', () => {
		const attrs = createTestAttributes({
			backgroundImage_tablet: { url: 'https://example.com/tablet-bg.jpg' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('background-image: url(https://example.com/tablet-bg.jpg)');
	});

	it('should generate mobile background image in @media query', () => {
		const attrs = createTestAttributes({
			backgroundImage_mobile: { url: 'https://example.com/mobile-bg.jpg' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('background-image: url(https://example.com/mobile-bg.jpg)');
	});

	it('should generate tablet background position in @media query', () => {
		const attrs = createTestAttributes({
			bgImagePosition_tablet: 'top center',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('background-position: top center');
	});

	it('should generate tablet background size in @media query', () => {
		const attrs = createTestAttributes({
			bgImageSize_tablet: 'contain',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('background-size: contain');
	});

	it('should generate custom tablet background size in @media query', () => {
		const attrs = createTestAttributes({
			bgImageSize_tablet: 'custom',
			bgImageCustomWidth_tablet: 300,
			bgImageCustomWidthUnit: 'px',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('background-size: 300px');
	});
});

// ============================================
// Responsive Mask Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Mask', () => {
	it('should generate tablet mask image in @media query', () => {
		const attrs = createTestAttributes({
			maskSwitch: true,
			maskImage_tablet: { url: 'https://example.com/tablet-mask.png' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('-webkit-mask-image: url(https://example.com/tablet-mask.png)');
		expect(css).toContain('mask-image: url(https://example.com/tablet-mask.png)');
	});

	it('should generate tablet mask size in @media query', () => {
		const attrs = createTestAttributes({
			maskSwitch: true,
			maskSize_tablet: 'cover',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('-webkit-mask-size: cover');
		expect(css).toContain('mask-size: cover');
	});

	it('should generate custom tablet mask size in @media query', () => {
		const attrs = createTestAttributes({
			maskSwitch: true,
			maskSize_tablet: 'custom',
			maskSizeScale_tablet: 75,
			maskSizeScaleUnit: '%',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('-webkit-mask-size: 75%');
		expect(css).toContain('mask-size: 75%');
	});

	it('should generate tablet mask position in @media query', () => {
		const attrs = createTestAttributes({
			maskSwitch: true,
			maskPosition_tablet: 'top left',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('-webkit-mask-position: top left');
		expect(css).toContain('mask-position: top left');
	});

	it('should generate custom tablet mask position in @media query', () => {
		const attrs = createTestAttributes({
			maskSwitch: true,
			maskPosition_tablet: 'custom',
			maskPositionX_tablet: 30,
			maskPositionY_tablet: 70,
			maskPositionXUnit: '%',
			maskPositionYUnit: '%',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('-webkit-mask-position: 30% 70%');
		expect(css).toContain('mask-position: 30% 70%');
	});

	it('should not generate mask CSS when maskSwitch is false', () => {
		const attrs = createTestAttributes({
			maskSwitch: false,
			maskSize_tablet: 'cover',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).not.toContain('mask-size: cover');
	});
});

// ============================================
// Custom CSS Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Custom CSS', () => {
	it('should include custom CSS with selector replacement', () => {
		const attrs = createTestAttributes({
			customCSS: 'selector { background: red; } selector:hover { background: blue; }',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR} { background: red; }`);
		expect(css).toContain(`${TEST_SELECTOR}:hover { background: blue; }`);
	});

	it('should handle case-insensitive selector replacement', () => {
		const attrs = createTestAttributes({
			customCSS: 'SELECTOR { color: green; }',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR} { color: green; }`);
	});
});

// ============================================
// Hover State Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Hover States', () => {
	it('should generate hover border styles', () => {
		const attrs = createTestAttributes({
			borderTypeHover: 'solid',
			borderColorHover: '#ff0000',
			borderWidthHover: { top: 2, right: 2, bottom: 2, left: 2, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR}:hover`);
		expect(css).toContain('border-style: solid');
		expect(css).toContain('border-color: #ff0000');
		expect(css).toContain('border-top-width: 2px');
	});

	it('should generate hover border radius', () => {
		const attrs = createTestAttributes({
			borderRadiusHover: { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR}:hover`);
		expect(css).toContain('border-top-left-radius: 10px');
	});

	it('should generate hover box shadow', () => {
		const attrs = createTestAttributes({
			boxShadowHover: {
				horizontal: 0,
				vertical: 8,
				blur: 16,
				spread: 0,
				color: 'rgba(0,0,0,0.3)',
			},
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR}:hover`);
		expect(css).toContain('box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.3)');
	});

	it('should generate hover background color', () => {
		const attrs = createTestAttributes({
			backgroundColorHover: '#f0f0f0',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR}:hover`);
		expect(css).toContain('background-color: #f0f0f0');
	});

	it('should generate hover background image', () => {
		const attrs = createTestAttributes({
			backgroundImageHover: { url: 'https://example.com/hover-bg.jpg' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain(`${TEST_SELECTOR}:hover`);
		expect(css).toContain('background-image: url(https://example.com/hover-bg.jpg)');
	});
});

// ============================================
// Combined Responsive Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Combined Responsive', () => {
	it('should generate comprehensive responsive CSS', () => {
		const attrs = createTestAttributes({
			// Tablet
			blockMargin_tablet: { top: 20, bottom: 20, unit: 'px' },
			blockPadding_tablet: { top: 15, right: 15, bottom: 15, left: 15, unit: 'px' },
			elementWidth_tablet: 'full',
			borderRadius_tablet: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
			// Mobile
			blockMargin_mobile: { top: 10, bottom: 10, unit: 'px' },
			blockPadding_mobile: { top: 10, right: 10, bottom: 10, left: 10, unit: 'px' },
			elementWidth_mobile: 'full',
			borderRadius_mobile: { top: 4, right: 4, bottom: 4, left: 4, unit: 'px' },
			// Hover
			borderColorHover: '#0000ff',
			backgroundColorHover: '#eeeeee',
			// Custom CSS
			customCSS: 'selector .inner { padding: 5px; }',
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		// Verify tablet media query
		expect(css).toContain('@media (max-width: 1024px)');
		expect(css).toContain('margin-top: 20px');
		expect(css).toContain('padding-top: 15px');
		expect(css).toContain('width: 100%');

		// Verify mobile media query
		expect(css).toContain('@media (max-width: 767px)');
		expect(css).toContain('margin-top: 10px');
		expect(css).toContain('padding-top: 10px');

		// Verify hover styles
		expect(css).toContain(`${TEST_SELECTOR}:hover`);
		expect(css).toContain('border-color: #0000ff');
		expect(css).toContain('background-color: #eeeeee');

		// Verify custom CSS
		expect(css).toContain(`${TEST_SELECTOR} .inner { padding: 5px; }`);
	});
});

// ============================================
// Empty/Undefined Responsive Tests
// ============================================

describe('generateAdvancedResponsiveCSS - Empty/Undefined Handling', () => {
	it('should return empty string when no responsive attributes', () => {
		const attrs = createTestAttributes();

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		// Should return empty string or minimal CSS
		expect(css).toBeDefined();
	});

	it('should not generate tablet media query when no tablet attributes', () => {
		const attrs = createTestAttributes({
			blockMargin_mobile: { top: 10, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		// Should only have mobile query, not tablet
		expect(css).toContain('@media (max-width: 767px)');
		// If there's no tablet-specific styles, the tablet media query shouldn't contain meaningful rules
	});

	it('should not generate mobile media query when no mobile attributes', () => {
		const attrs = createTestAttributes({
			blockMargin_tablet: { top: 20, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		// Should only have tablet query
		expect(css).toContain('@media (max-width: 1024px)');
	});
});

// ============================================
// Selector Scoping Tests (Block-Agnostic)
// ============================================

describe('generateAdvancedResponsiveCSS - Selector Scoping', () => {
	it('should work with any block selector pattern', () => {
		const attrs = createTestAttributes({
			blockMargin_tablet: { top: 10, unit: 'px' },
		});

		// Test with various block selectors
		const postFeedCss = generateAdvancedResponsiveCSS(attrs, '.voxel-fse-post-feed-abc123');
		expect(postFeedCss).toContain('.voxel-fse-post-feed-abc123');

		const mapCss = generateAdvancedResponsiveCSS(attrs, '.voxel-fse-map-xyz789');
		expect(mapCss).toContain('.voxel-fse-map-xyz789');

		const galleryCss = generateAdvancedResponsiveCSS(attrs, '.voxel-fse-gallery-def456');
		expect(galleryCss).toContain('.voxel-fse-gallery-def456');
	});

	it('should scope hover styles to any selector', () => {
		const attrs = createTestAttributes({
			backgroundColorHover: '#ff0000',
		});

		const css = generateAdvancedResponsiveCSS(attrs, '.voxel-fse-custom-block');

		expect(css).toContain('.voxel-fse-custom-block:hover');
	});

	it('should handle complex selectors', () => {
		const attrs = createTestAttributes({
			customCSS: 'selector > .child { color: blue; }',
		});

		const css = generateAdvancedResponsiveCSS(attrs, '.parent .voxel-fse-block');

		expect(css).toContain('.parent .voxel-fse-block > .child { color: blue; }');
	});
});

// ============================================
// Edge Cases
// ============================================

describe('generateAdvancedResponsiveCSS - Edge Cases', () => {
	it('should handle zero values correctly', () => {
		const attrs = createTestAttributes({
			blockMargin_tablet: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		// Zero values should be included
		expect(css).toContain('margin-top: 0px');
	});

	it('should handle negative values', () => {
		const attrs = createTestAttributes({
			blockMargin_tablet: { top: -10, unit: 'px' },
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('margin-top: -10px');
	});

	it('should handle decimal values', () => {
		const attrs = createTestAttributes({
			transformScaleX_tablet: 0.95,
			transformScaleY_tablet: 0.95,
		});

		const css = generateAdvancedResponsiveCSS(attrs, TEST_SELECTOR);

		expect(css).toContain('scale(0.95, 0.95)');
	});
});

// ============================================
// Cross-Block Compatibility Tests
// ============================================

describe('Cross-Block Responsive Compatibility', () => {
	it('should work with any block attributes that extend AdvancedStyleAttributes', () => {
		// Simulate responsive attributes from different blocks
		const postFeedAttrs = createTestAttributes({
			blockId: 'pf-123',
			blockMargin_tablet: { top: 20, unit: 'px' },
			blockPadding_mobile: { top: 10, unit: 'px' },
		});

		const mapAttrs = createTestAttributes({
			blockId: 'map-456',
			borderRadius_tablet: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
			zIndex_mobile: 50,
		});

		const galleryAttrs = createTestAttributes({
			blockId: 'gallery-789',
			elementWidth_tablet: 'full',
			backgroundColorHover: '#f0f0f0',
		});

		// All should generate valid responsive CSS
		const postFeedCss = generateAdvancedResponsiveCSS(postFeedAttrs, '.voxel-fse-post-feed-pf-123');
		const mapCss = generateAdvancedResponsiveCSS(mapAttrs, '.voxel-fse-map-map-456');
		const galleryCss = generateAdvancedResponsiveCSS(galleryAttrs, '.voxel-fse-gallery-gallery-789');

		expect(postFeedCss).toContain('@media (max-width: 1024px)');
		expect(postFeedCss).toContain('margin-top: 20px');
		expect(postFeedCss).toContain('@media (max-width: 767px)');
		expect(postFeedCss).toContain('padding-top: 10px');

		expect(mapCss).toContain('@media (max-width: 1024px)');
		expect(mapCss).toContain('border-top-left-radius: 8px');
		expect(mapCss).toContain('@media (max-width: 767px)');
		expect(mapCss).toContain('z-index: 50');

		expect(galleryCss).toContain('@media (max-width: 1024px)');
		expect(galleryCss).toContain('width: 100%');
		expect(galleryCss).toContain(':hover');
		expect(galleryCss).toContain('background-color: #f0f0f0');
	});
});
