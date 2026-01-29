/**
 * Wiring Test Factory
 *
 * Provides reusable test infrastructure for verifying that blocks correctly
 * wire AdvancedTab attributes to their output.
 *
 * Usage:
 * ```ts
 * import { createBlockWiringTestSuite, simulateBlockComponent } from '../../../shared/utils/__tests__/wiringTestFactory';
 *
 * // Option 1: Use the full test suite factory
 * createBlockWiringTestSuite({
 *   blockName: 'search-form',
 *   createAttributes: (overrides) => ({ ...defaults, ...overrides }),
 * });
 *
 * // Option 2: Use individual helpers for custom tests
 * const { blockProps, responsiveCSS } = simulateBlockComponent({
 *   blockName: 'post-feed',
 *   attributes: myAttributes,
 *   isEditor: true,
 * });
 * ```
 *
 * Reference: .claude/commands/wire/controls.md
 * @package VoxelFSE
 */

import { describe, it, expect } from 'vitest';
import {
	generateAdvancedStyles,
	generateAdvancedResponsiveCSS,
	combineBlockClasses,
	type AdvancedStyleAttributes,
} from '../generateAdvancedStyles';

// ============================================
// Types
// ============================================

export interface BlockWiringConfig<T extends AdvancedStyleAttributes> {
	/** Block name without 'voxel-fse-' prefix (e.g., 'search-form', 'post-feed') */
	blockName: string;
	/** Factory function to create test attributes with defaults */
	createAttributes: (overrides?: Partial<T>) => T;
	/** Optional: Custom editor class suffix (default: '-editor') */
	editorClassSuffix?: string;
}

export interface SimulateComponentConfig<T extends AdvancedStyleAttributes> {
	/** Block name without 'voxel-fse-' prefix */
	blockName: string;
	/** Block attributes */
	attributes: T;
	/** Whether this is the editor component (adds '-editor' class) */
	isEditor?: boolean;
}

export interface SimulatedComponentResult {
	blockId: string;
	uniqueSelector: string;
	advancedStyles: React.CSSProperties;
	responsiveCSS: string;
	className: string;
	blockProps: {
		id?: string;
		className: string;
		style: React.CSSProperties;
	};
}

// ============================================
// Helper Functions
// ============================================

/**
 * Simulate a block component's style application pattern.
 * This mimics how Edit/Save components use the shared utilities.
 */
export function simulateBlockComponent<T extends AdvancedStyleAttributes>(
	config: SimulateComponentConfig<T>
): SimulatedComponentResult {
	const { blockName, attributes, isEditor = false } = config;
	const blockId = attributes.blockId || blockName;
	const uniqueSelector = `.voxel-fse-${blockName}-${blockId}`;

	const advancedStyles = generateAdvancedStyles(attributes);
	const responsiveCSS = generateAdvancedResponsiveCSS(attributes, uniqueSelector);

	const baseClass = isEditor
		? `voxel-fse-${blockName}-editor voxel-fse-${blockName}-${blockId}`
		: `voxel-fse-${blockName} voxel-fse-${blockName}-${blockId}`;

	const className = combineBlockClasses(baseClass, attributes);

	return {
		blockId,
		uniqueSelector,
		advancedStyles,
		responsiveCSS,
		className,
		blockProps: {
			id: isEditor ? undefined : (attributes as any).elementId || blockId,
			className,
			style: advancedStyles,
		},
	};
}

/**
 * Create minimal AdvancedStyleAttributes for testing.
 * Individual blocks can extend this with their specific required fields.
 */
export function createMinimalAdvancedAttributes(
	overrides: Partial<AdvancedStyleAttributes> = {}
): AdvancedStyleAttributes {
	return {
		blockId: 'test-block-123',
		...overrides,
	};
}

// ============================================
// Test Suite Factory
// ============================================

/**
 * Creates a complete test suite for verifying AdvancedTab wiring for a block.
 *
 * This factory generates tests that verify:
 * - Layout accordion attributes → style properties
 * - Position accordion attributes → style properties
 * - Border accordion attributes → style properties
 * - Background accordion attributes → style properties
 * - Transform accordion attributes → style properties
 * - Visibility attributes → className
 * - Responsive attributes → @media CSS
 * - Hover attributes → :hover CSS
 * - Custom CSS → selector replacement
 * - Edit/Save consistency
 */
export function createBlockWiringTestSuite<T extends AdvancedStyleAttributes>(
	config: BlockWiringConfig<T>
): void {
	const { blockName, createAttributes } = config;

	// Helper to simulate Edit component
	const simulateEdit = (attrs: T) =>
		simulateBlockComponent({ blockName, attributes: attrs, isEditor: true });

	// Helper to simulate Save component
	const simulateSave = (attrs: T) =>
		simulateBlockComponent({ blockName, attributes: attrs, isEditor: false });

	describe(`${blockName} Block - AdvancedTab Wiring`, () => {
		// ============================================
		// Layout Accordion
		// ============================================
		describe('Layout Accordion Wiring', () => {
			it('should wire blockMargin to style.margin*', () => {
				const attrs = createAttributes({
					blockMargin: { top: 10, right: 20, bottom: 30, left: 40, unit: 'px' },
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.marginTop).toBe('10px');
				expect(blockProps.style.marginRight).toBe('20px');
				expect(blockProps.style.marginBottom).toBe('30px');
				expect(blockProps.style.marginLeft).toBe('40px');
			});

			it('should wire blockPadding to style.padding*', () => {
				const attrs = createAttributes({
					blockPadding: { top: 15, right: 25, bottom: 35, left: 45, unit: 'px' },
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.paddingTop).toBe('15px');
				expect(blockProps.style.paddingRight).toBe('25px');
				expect(blockProps.style.paddingBottom).toBe('35px');
				expect(blockProps.style.paddingLeft).toBe('45px');
			});

			it('should wire elementWidth=custom to style.width', () => {
				const attrs = createAttributes({
					elementWidth: 'custom',
					elementCustomWidth: 600,
					elementCustomWidthUnit: 'px',
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.width).toBe('600px');
			});

			it('should wire elementWidth=full to style.width=100%', () => {
				const attrs = createAttributes({
					elementWidth: 'full',
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.width).toBe('100%');
			});
		});

		// ============================================
		// Position Accordion
		// ============================================
		describe('Position Accordion Wiring', () => {
			it('should wire position attribute to style.position', () => {
				const attrs = createAttributes({
					position: 'absolute',
					offsetX: 10,
					offsetXUnit: 'px',
					offsetY: 20,
					offsetYUnit: 'px',
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.position).toBe('absolute');
				expect(blockProps.style.left).toBe('10px');
				expect(blockProps.style.top).toBe('20px');
			});

			it('should wire zIndex attribute to style.zIndex', () => {
				const attrs = createAttributes({
					zIndex: 999,
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.zIndex).toBe(999);
			});
		});

		// ============================================
		// Border Accordion
		// ============================================
		describe('Border Accordion Wiring', () => {
			it('should wire border attributes to style.border*', () => {
				const attrs = createAttributes({
					borderType: 'solid',
					borderColor: '#333333',
					borderWidth: { top: 1, right: 1, bottom: 1, left: 1, unit: 'px' },
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.borderStyle).toBe('solid');
				expect(blockProps.style.borderColor).toBe('#333333');
				expect(blockProps.style.borderTopWidth).toBe('1px');
			});

			it('should wire borderRadius to style.borderRadius', () => {
				const attrs = createAttributes({
					borderRadius: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.borderTopLeftRadius).toBe('8px');
				expect(blockProps.style.borderTopRightRadius).toBe('8px');
				expect(blockProps.style.borderBottomRightRadius).toBe('8px');
				expect(blockProps.style.borderBottomLeftRadius).toBe('8px');
			});

			it('should wire boxShadow to style.boxShadow', () => {
				const attrs = createAttributes({
					boxShadow: {
						horizontal: 0,
						vertical: 4,
						blur: 12,
						spread: 0,
						color: 'rgba(0,0,0,0.15)',
					},
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.boxShadow).toBe('0px 4px 12px 0px rgba(0,0,0,0.15)');
			});
		});

		// ============================================
		// Background Accordion
		// ============================================
		describe('Background Accordion Wiring', () => {
			it('should wire backgroundColor to style.backgroundColor', () => {
				const attrs = createAttributes({
					backgroundType: 'classic',
					backgroundColor: '#ffffff',
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.backgroundColor).toBe('#ffffff');
			});

			it('should wire gradient to style.backgroundImage', () => {
				const attrs = createAttributes({
					backgroundType: 'gradient',
					gradientColor: '#ff0000',
					gradientLocation: 0,
					gradientSecondColor: '#0000ff',
					gradientSecondLocation: 100,
					gradientAngle: 180,
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.backgroundImage).toBe(
					'linear-gradient(180deg, #ff0000 0%, #0000ff 100%)'
				);
			});
		});

		// ============================================
		// Transform Accordion
		// ============================================
		describe('Transform Accordion Wiring', () => {
			it('should wire transform attributes to style.transform', () => {
				const attrs = createAttributes({
					transformRotateZ: 45,
					transformScaleX: 1.2,
					transformScaleY: 1.2,
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.transform).toContain('rotateZ(45deg)');
				expect(blockProps.style.transform).toContain('scale(1.2, 1.2)');
			});
		});

		// ============================================
		// Visibility Wiring
		// ============================================
		describe('Visibility Wiring', () => {
			it('should wire hideDesktop to className vx-hidden-desktop', () => {
				const attrs = createAttributes({
					hideDesktop: true,
				} as Partial<T>);

				const { className } = simulateEdit(attrs);

				expect(className).toContain('vx-hidden-desktop');
			});

			it('should wire hideMobile to className vx-hidden-mobile', () => {
				const attrs = createAttributes({
					hideMobile: true,
				} as Partial<T>);

				const { className } = simulateEdit(attrs);

				expect(className).toContain('vx-hidden-mobile');
			});

			it('should wire customClasses to className', () => {
				const attrs = createAttributes({
					customClasses: 'my-custom-class another-class',
				} as Partial<T>);

				const { className } = simulateEdit(attrs);

				expect(className).toContain('my-custom-class');
				expect(className).toContain('another-class');
			});
		});

		// ============================================
		// Responsive CSS Wiring
		// ============================================
		describe('Responsive CSS Wiring', () => {
			it('should wire tablet attributes to @media (max-width: 1024px)', () => {
				const attrs = createAttributes({
					blockMargin_tablet: { top: 20, unit: 'px' },
				} as Partial<T>);

				const { responsiveCSS, uniqueSelector } = simulateEdit(attrs);

				expect(responsiveCSS).toContain('@media (max-width: 1024px)');
				expect(responsiveCSS).toContain(uniqueSelector);
				expect(responsiveCSS).toContain('margin-top: 20px');
			});

			it('should wire mobile attributes to @media (max-width: 767px)', () => {
				const attrs = createAttributes({
					blockMargin_mobile: { top: 10, unit: 'px' },
				} as Partial<T>);

				const { responsiveCSS, uniqueSelector } = simulateEdit(attrs);

				expect(responsiveCSS).toContain('@media (max-width: 767px)');
				expect(responsiveCSS).toContain(uniqueSelector);
				expect(responsiveCSS).toContain('margin-top: 10px');
			});

			it('should wire hover attributes to :hover CSS', () => {
				const attrs = createAttributes({
					borderColorHover: '#ff0000',
					backgroundColorHover: '#f0f0f0',
				} as Partial<T>);

				const { responsiveCSS, uniqueSelector } = simulateEdit(attrs);

				expect(responsiveCSS).toContain(`${uniqueSelector}:hover`);
				expect(responsiveCSS).toContain('border-color: #ff0000');
				expect(responsiveCSS).toContain('background-color: #f0f0f0');
			});

			it('should wire customCSS with selector replacement', () => {
				const attrs = createAttributes({
					customCSS: 'selector .inner { padding: 10px; }',
				} as Partial<T>);

				const { responsiveCSS, uniqueSelector } = simulateEdit(attrs);

				expect(responsiveCSS).toContain(`${uniqueSelector} .inner { padding: 10px; }`);
			});
		});

		// ============================================
		// Block ID / Selector Wiring
		// ============================================
		describe('Block ID Wiring', () => {
			it('should use blockId for unique selector', () => {
				const attrs = createAttributes({
					blockId: 'test-abc123',
				} as Partial<T>);

				const { uniqueSelector, className } = simulateEdit(attrs);

				expect(uniqueSelector).toBe(`.voxel-fse-${blockName}-test-abc123`);
				expect(className).toContain(`voxel-fse-${blockName}-test-abc123`);
			});
		});

		// ============================================
		// Edit/Save Consistency
		// ============================================
		describe('Edit/Save Consistency', () => {
			it('should maintain style consistency between Edit and Save', () => {
				const attrs = createAttributes({
					blockMargin: { top: 10, unit: 'px' },
					backgroundColor: '#f5f5f5',
					borderRadius: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
				} as Partial<T>);

				const editResult = simulateEdit(attrs);
				const saveResult = simulateSave(attrs);

				// Styles should be identical
				expect(editResult.advancedStyles).toEqual(saveResult.advancedStyles);
			});

			it('should generate same responsive CSS for Edit and Save', () => {
				const attrs = createAttributes({
					blockMargin_tablet: { top: 20, unit: 'px' },
					customCSS: 'selector { opacity: 0.9; }',
				} as Partial<T>);

				const editResult = simulateEdit(attrs);
				const saveResult = simulateSave(attrs);

				// Responsive CSS should be identical (same selector pattern)
				expect(editResult.responsiveCSS).toBe(saveResult.responsiveCSS);
			});
		});

		// ============================================
		// Edge Cases
		// ============================================
		describe('Edge Cases', () => {
			it('should handle empty attributes gracefully', () => {
				const attrs = createAttributes();

				const editResult = simulateEdit(attrs);
				const saveResult = simulateSave(attrs);

				expect(editResult.blockProps).toBeDefined();
				expect(saveResult.blockProps).toBeDefined();
			});

			it('should handle zero values correctly', () => {
				const attrs = createAttributes({
					blockMargin: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
					zIndex: 0,
					opacity: 0,
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.marginTop).toBe('0px');
				expect(blockProps.style.zIndex).toBe(0);
				expect(blockProps.style.opacity).toBe(0);
			});

			it('should handle negative values', () => {
				const attrs = createAttributes({
					blockMargin: { top: -10, unit: 'px' },
					zIndex: -1,
				} as Partial<T>);

				const { blockProps } = simulateEdit(attrs);

				expect(blockProps.style.marginTop).toBe('-10px');
				expect(blockProps.style.zIndex).toBe(-1);
			});
		});
	});
}

// ============================================
// Attribute-to-Style Mapping Reference
// ============================================

/**
 * Complete mapping between AdvancedTab attributes and CSS properties.
 * Use this as reference when implementing new blocks.
 */
export const ATTRIBUTE_STYLE_MAPPING = {
	// Layout
	blockMargin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
	blockPadding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
	elementWidth: ['width', 'display'],

	// Position
	position: ['position'],
	offsetX: ['left'],
	offsetY: ['top'],
	offsetXEnd: ['right'],
	offsetYEnd: ['bottom'],
	zIndex: ['zIndex'],

	// Border
	borderType: ['borderStyle'],
	borderColor: ['borderColor'],
	borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
	borderRadius: [
		'borderTopLeftRadius',
		'borderTopRightRadius',
		'borderBottomRightRadius',
		'borderBottomLeftRadius',
	],
	boxShadow: ['boxShadow'],

	// Background
	backgroundColor: ['backgroundColor'],
	backgroundImage: ['backgroundImage'],
	bgImagePosition: ['backgroundPosition'],
	bgImageSize: ['backgroundSize'],
	bgImageRepeat: ['backgroundRepeat'],
	bgImageAttachment: ['backgroundAttachment'],

	// Transform
	transformRotateZ: ['transform'],
	transformRotateX: ['transform'],
	transformRotateY: ['transform'],
	transformOffsetX: ['transform'],
	transformOffsetY: ['transform'],
	transformScaleX: ['transform'],
	transformScaleY: ['transform'],
	transformSkewX: ['transform'],
	transformSkewY: ['transform'],
	transformFlipH: ['transform'],
	transformFlipV: ['transform'],

	// Mask
	maskShape: ['maskImage', 'WebkitMaskImage'],
	maskImage: ['maskImage', 'WebkitMaskImage'],
	maskSize: ['maskSize', 'WebkitMaskSize'],
	maskPosition: ['maskPosition', 'WebkitMaskPosition'],
	maskRepeat: ['maskRepeat', 'WebkitMaskRepeat'],

	// Other
	overflow: ['overflow'],
	opacity: ['opacity'],
	transitionDuration: ['transition'],

	// Class-based
	hideDesktop: ['className:vx-hidden-desktop'],
	hideTablet: ['className:vx-hidden-tablet'],
	hideMobile: ['className:vx-hidden-mobile'],
	customClasses: ['className'],
} as const;
