/**
 * Unit Tests for Flex Container Styles Wiring
 *
 * Tests that Container Options and Sticky Position attributes
 * are properly "wired" to generate correct CSS styles.
 *
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import {
	generateContainerStyles,
	generateInnerStyles,
	generateResponsiveCSS,
	generateInnerResponsiveCSS,
	type FlexContainerAttributes,
} from './styles';

/**
 * Helper function to create base attributes
 */
const createBaseAttributes = (
	overrides: Partial<FlexContainerAttributes> = {}
): FlexContainerAttributes => ({
	containerLayout: 'flex',
	...overrides,
});

describe('generateContainerStyles - Container Options Wiring', () => {
	// Note: Inline Flex is handled by generateInnerStyles(), not generateContainerStyles()
	// generateContainerStyles() handles the OUTER container (position, backdrop blur, min/max height)
	// generateInnerStyles() handles the INNER content wrapper (flex/grid display, gaps, alignment)

	describe('Calculate Min Height', () => {
		it('should NOT set min-height when enableCalcMinHeight is false', () => {
			const attrs = createBaseAttributes({
				enableCalcMinHeight: false,
				calcMinHeight: 'calc(100vh - 200px)',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.minHeight).toBeUndefined();
		});

		it('should NOT set min-height when calcMinHeight is empty', () => {
			const attrs = createBaseAttributes({
				enableCalcMinHeight: true,
				calcMinHeight: '',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.minHeight).toBeUndefined();
		});

		it('should set min-height with CSS calc() value when enabled', () => {
			const attrs = createBaseAttributes({
				enableCalcMinHeight: true,
				calcMinHeight: 'calc(100vh - 200px)',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.minHeight).toBe('calc(100vh - 200px)');
		});

		it('should override numeric minHeight when calcMinHeight is enabled', () => {
			const attrs = createBaseAttributes({
				minHeight: 500,
				minHeightUnit: 'px',
				enableCalcMinHeight: true,
				calcMinHeight: 'calc(100vh - 100px)',
			});

			const styles = generateContainerStyles(attrs);

			// The calc value should override the numeric value
			expect(styles.minHeight).toBe('calc(100vh - 100px)');
		});
	});

	describe('Calculate Max Height with Scrollbar', () => {
		it('should NOT set max-height when enableCalcMaxHeight is false', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: false,
				calcMaxHeight: 'calc(100vh - 215px)',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.maxHeight).toBeUndefined();
			expect(styles.overflowY).toBeUndefined();
			expect(styles.overflowX).toBeUndefined();
		});

		it('should NOT set max-height when calcMaxHeight is empty', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: '',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.maxHeight).toBeUndefined();
		});

		it('should set max-height with overflow styles when enabled', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 215px)',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.maxHeight).toBe('calc(100vh - 215px)');
			expect(styles.overflowY).toBe('overlay');
			expect(styles.overflowX).toBe('hidden');
		});
	});

	describe('Scrollbar Color', () => {
		it('should NOT set scrollbar color when calcMaxHeight is disabled', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: false,
				calcMaxHeight: 'calc(100vh - 215px)',
				scrollbarColor: '#ff0000',
			});

			const styles = generateContainerStyles(attrs);

			expect((styles as any)['--ts-scroll-color']).toBeUndefined();
		});

		it('should NOT set scrollbar color when empty', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 215px)',
				scrollbarColor: '',
			});

			const styles = generateContainerStyles(attrs);

			expect((styles as any)['--ts-scroll-color']).toBeUndefined();
		});

		it('should set --ts-scroll-color CSS variable when calcMaxHeight is enabled', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 215px)',
				scrollbarColor: '#ff5733',
			});

			const styles = generateContainerStyles(attrs);

			expect((styles as any)['--ts-scroll-color']).toBe('#ff5733');
		});

		it('should work with rgba color values', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 100px)',
				scrollbarColor: 'rgba(255, 87, 51, 0.5)',
			});

			const styles = generateContainerStyles(attrs);

			expect((styles as any)['--ts-scroll-color']).toBe(
				'rgba(255, 87, 51, 0.5)'
			);
		});
	});

	describe('Backdrop Blur', () => {
		it('should NOT set backdrop-filter when enableBackdropBlur is false', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: false,
				backdropBlurStrength: 10,
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.backdropFilter).toBeUndefined();
			expect((styles as any)['-webkit-backdrop-filter']).toBeUndefined();
		});

		it('should NOT set backdrop-filter when strength is undefined', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: undefined,
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.backdropFilter).toBeUndefined();
		});

		it('should set backdrop-filter with blur value when enabled', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: 10,
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.backdropFilter).toBe('blur(10px)');
			expect((styles as any)['-webkit-backdrop-filter']).toBe('blur(10px)');
		});

		it('should handle zero blur strength', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: 0,
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.backdropFilter).toBe('blur(0px)');
		});

		it('should handle high blur strength values', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: 50,
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.backdropFilter).toBe('blur(50px)');
		});
	});
});

describe('generateContainerStyles - Sticky Position Wiring', () => {
	describe('Sticky Position Desktop', () => {
		it('should NOT set position sticky when stickyEnabled is false', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: false,
				stickyDesktop: 'sticky',
				stickyTop: 50,
			});

			const styles = generateContainerStyles(attrs);

			// Position is intentionally undefined (not 'relative') to allow nested sticky to work
			// The frontend CSS (generateResponsiveCSS) handles position: relative for non-sticky containers
			expect(styles.position).toBeUndefined();
			expect(styles.top).toBeUndefined();
		});

		it('should NOT set position sticky when stickyDesktop is initial', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'initial',
				stickyTop: 50,
			});

			const styles = generateContainerStyles(attrs);

			// Position is intentionally undefined (not 'relative') to allow nested sticky to work
			// The frontend CSS (generateResponsiveCSS) handles position: relative for non-sticky containers
			expect(styles.position).toBeUndefined();
		});

		it('should set position sticky with top offset', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'sticky',
				stickyTop: 100,
				stickyTopUnit: 'px',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.position).toBe('sticky');
			expect(styles.top).toBe('100px');
		});

		it('should set position sticky with all offset values', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'sticky',
				stickyTop: 10,
				stickyTopUnit: 'px',
				stickyLeft: 20,
				stickyLeftUnit: '%',
				stickyRight: 30,
				stickyRightUnit: 'px',
				stickyBottom: 40,
				stickyBottomUnit: 'vh',
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.position).toBe('sticky');
			expect(styles.top).toBe('10px');
			expect(styles.left).toBe('20%');
			expect(styles.right).toBe('30px');
			expect(styles.bottom).toBe('40vh');
		});

		it('should use default px unit when unit is not specified', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'sticky',
				stickyTop: 50,
			});

			const styles = generateContainerStyles(attrs);

			expect(styles.top).toBe('50px');
		});
	});
});

describe('generateResponsiveCSS - Container Options Wiring', () => {
	const blockId = 'test-block-123';
	// Note: Inline Flex responsive CSS is handled by generateInnerResponsiveCSS(), not generateResponsiveCSS()
	// generateResponsiveCSS() handles the OUTER container responsive styles

	describe('Calculate Min Height in Responsive CSS', () => {
		it('should generate min-height CSS for desktop', () => {
			const attrs = createBaseAttributes({
				enableCalcMinHeight: true,
				calcMinHeight: 'calc(100vh - 200px)',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toContain('min-height: calc(100vh - 200px)');
		});

		it('should generate tablet-specific min-height', () => {
			const attrs = createBaseAttributes({
				enableCalcMinHeight: true,
				calcMinHeight: 'calc(100vh - 200px)',
				calcMinHeight_tablet: 'calc(100vh - 150px)',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toContain('min-height: calc(100vh - 200px)'); // Desktop
			expect(css).toMatch(
				/@media \(max-width: 1024px\).*min-height: calc\(100vh - 150px\)/s
			);
		});

		it('should generate mobile-specific min-height', () => {
			const attrs = createBaseAttributes({
				enableCalcMinHeight: true,
				calcMinHeight: 'calc(100vh - 200px)',
				calcMinHeight_mobile: 'calc(100vh - 100px)',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(
				/@media \(max-width: 767px\).*min-height: calc\(100vh - 100px\)/s
			);
		});
	});

	describe('Calculate Max Height in Responsive CSS', () => {
		it('should generate max-height CSS with overflow styles', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 215px)',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toContain('max-height: calc(100vh - 215px)');
			expect(css).toContain('overflow-y: overlay');
			expect(css).toContain('overflow-x: hidden');
		});

		it('should generate scrollbar color CSS variable', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 215px)',
				scrollbarColor: '#ff5733',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toContain('--ts-scroll-color: #ff5733');
		});

		it('should generate tablet-specific max-height', () => {
			const attrs = createBaseAttributes({
				enableCalcMaxHeight: true,
				calcMaxHeight: 'calc(100vh - 215px)',
				calcMaxHeight_tablet: 'calc(100vh - 180px)',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(
				/@media \(max-width: 1024px\).*max-height: calc\(100vh - 180px\)/s
			);
		});
	});

	describe('Backdrop Blur in Responsive CSS', () => {
		it('should generate backdrop-filter CSS with webkit prefix', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: 10,
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toContain('backdrop-filter: blur(10px)');
			expect(css).toContain('-webkit-backdrop-filter: blur(10px)');
		});

		it('should generate tablet-specific backdrop blur', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: 10,
				backdropBlurStrength_tablet: 5,
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(
				/@media \(max-width: 1024px\).*backdrop-filter: blur\(5px\)/s
			);
		});

		it('should generate mobile-specific backdrop blur', () => {
			const attrs = createBaseAttributes({
				enableBackdropBlur: true,
				backdropBlurStrength: 10,
				backdropBlurStrength_mobile: 3,
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(
				/@media \(max-width: 767px\).*backdrop-filter: blur\(3px\)/s
			);
		});
	});
});

describe('generateResponsiveCSS - Sticky Position Wiring', () => {
	const blockId = 'test-sticky-123';

	describe('Sticky Position Desktop CSS', () => {
		it('should generate position sticky CSS', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'sticky',
				stickyTop: 100,
				stickyTopUnit: 'px',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toContain('position: sticky');
			expect(css).toContain('top: 100px');
		});
	});

	describe('Sticky Position Tablet CSS', () => {
		it('should generate tablet sticky CSS when enabled', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'initial',
				stickyTablet: 'sticky',
				stickyTop_tablet: 50,
				stickyTopUnit: 'px',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(/@media \(max-width: 1024px\).*position: sticky/s);
			expect(css).toMatch(/@media \(max-width: 1024px\).*top: 50px/s);
		});

		it('should reset to relative when tablet sticky is initial', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'sticky',
				stickyTablet: 'initial',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(/@media \(max-width: 1024px\).*position: relative/s);
		});
	});

	describe('Sticky Position Mobile CSS', () => {
		it('should generate mobile sticky CSS when enabled', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyMobile: 'sticky',
				stickyTop_mobile: 0,
				stickyTopUnit: 'px',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(/@media \(max-width: 767px\).*position: sticky/s);
			expect(css).toMatch(/@media \(max-width: 767px\).*top: 0px/s);
		});

		it('should reset to relative when mobile sticky is initial', () => {
			const attrs = createBaseAttributes({
				stickyEnabled: true,
				stickyDesktop: 'sticky',
				stickyMobile: 'initial',
			});

			const css = generateResponsiveCSS(attrs, blockId);

			expect(css).toMatch(/@media \(max-width: 767px\).*position: relative/s);
		});
	});
});

describe('Combined Container Options', () => {
	it('should handle all outer container options enabled simultaneously', () => {
		const attrs = createBaseAttributes({
			enableCalcMinHeight: true,
			calcMinHeight: 'calc(50vh)',
			enableCalcMaxHeight: true,
			calcMaxHeight: 'calc(100vh - 100px)',
			scrollbarColor: '#333',
			enableBackdropBlur: true,
			backdropBlurStrength: 8,
		});

		const styles = generateContainerStyles(attrs);

		// Outer container styles (no display - that's in inner)
		expect(styles.minHeight).toBe('calc(50vh)');
		expect(styles.maxHeight).toBe('calc(100vh - 100px)');
		expect(styles.overflowY).toBe('overlay');
		expect((styles as any)['--ts-scroll-color']).toBe('#333');
		expect(styles.backdropFilter).toBe('blur(8px)');
	});

	it('should handle container options with sticky position', () => {
		const attrs = createBaseAttributes({
			stickyEnabled: true,
			stickyDesktop: 'sticky',
			stickyTop: 20,
			enableBackdropBlur: true,
			backdropBlurStrength: 5,
		});

		const styles = generateContainerStyles(attrs);

		expect(styles.position).toBe('sticky');
		expect(styles.top).toBe('20px');
		expect(styles.backdropFilter).toBe('blur(5px)');
	});
});

// ============================================
// generateInnerStyles - Inner Content Wrapper
// ============================================

describe('generateInnerStyles - Inline Flex Wiring', () => {
	describe('Inline Flex', () => {
		it('should set display to flex when enableInlineFlex is false', () => {
			const attrs = createBaseAttributes({
				enableInlineFlex: false,
			});

			const styles = generateInnerStyles(attrs);

			expect(styles.display).toBe('flex');
			expect(styles.width).toBe('100%'); // Default width for inner container
		});

		it('should set display to inline-flex and width to auto when enabled', () => {
			const attrs = createBaseAttributes({
				enableInlineFlex: true,
			});

			const styles = generateInnerStyles(attrs);

			expect(styles.display).toBe('inline-flex');
			expect(styles.width).toBe('auto');
		});

		it('should override grid display when inline flex is enabled', () => {
			const attrs = createBaseAttributes({
				containerLayout: 'grid',
				enableInlineFlex: true,
			});

			const styles = generateInnerStyles(attrs);

			// Inline flex should override grid display
			expect(styles.display).toBe('inline-flex');
			expect(styles.width).toBe('auto');
		});
	});
});

// ============================================
// generateInnerResponsiveCSS - Inner Content Responsive
// ============================================

describe('generateInnerResponsiveCSS - Inline Flex Wiring', () => {
	const blockId = 'test-inner-123';

	describe('Inline Flex in Responsive CSS', () => {
		it('should generate inline-flex CSS for desktop', () => {
			const attrs = createBaseAttributes({
				enableInlineFlex: true,
			});

			const css = generateInnerResponsiveCSS(attrs, blockId);

			expect(css).toContain('display: inline-flex');
			expect(css).toContain('width: auto');
		});

		it('should generate tablet media query for inline flex', () => {
			const attrs = createBaseAttributes({
				enableInlineFlex: true,
				enableInlineFlex_tablet: false,
			});

			const css = generateInnerResponsiveCSS(attrs, blockId);

			// Desktop should have inline-flex
			expect(css).toContain('display: inline-flex');
			// Tablet should reset to flex
			expect(css).toContain('@media (max-width: 1024px)');
			expect(css).toMatch(/@media.*display: flex.*width: 100%/s);
		});

		it('should generate mobile media query for inline flex', () => {
			const attrs = createBaseAttributes({
				enableInlineFlex: true,
				enableInlineFlex_mobile: false,
			});

			const css = generateInnerResponsiveCSS(attrs, blockId);

			expect(css).toContain('@media (max-width: 767px)');
		});
	});
});
