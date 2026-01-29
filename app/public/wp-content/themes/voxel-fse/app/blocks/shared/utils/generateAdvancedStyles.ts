/**
 * Generate Advanced Styles Utility
 *
 * Shared utility to convert AdvancedTab attribute values into
 * CSS styles that can be applied to block output.
 *
 * This solves the problem where AdvancedTab controls store values
 * but blocks don't apply them to output.
 *
 * @package VoxelFSE
 */

import type { CSSProperties } from 'react';

/**
 * Extended CSSProperties to include mask properties
 * React's CSSProperties doesn't include these newer CSS properties
 */
interface ExtendedCSSProperties extends CSSProperties {
	// Mask properties (standard)
	maskImage?: string;
	maskSize?: string;
	maskPosition?: string;
	maskRepeat?: string;
	// Webkit-prefixed mask properties (for Safari/older browsers)
	WebkitMaskImage?: string;
	WebkitMaskSize?: string;
	WebkitMaskPosition?: string;
	WebkitMaskRepeat?: string;
}

/**
 * DimensionsConfig - matches AdvancedTab format (top/right/bottom/left with unit)
 */
interface DimensionsConfig {
	top?: string | number;
	right?: string | number;
	bottom?: string | number;
	left?: string | number;
	unit?: string;
	linked?: boolean;
}

/**
 * Box shadow value object
 */
interface BoxShadowValue {
	horizontal?: number;
	vertical?: number;
	blur?: number;
	spread?: number;
	color?: string;
	position?: 'inset' | '';
}

/**
 * Background image value
 */
interface BackgroundImageValue {
	id?: number;
	url?: string;
}

/**
 * Interface for AdvancedTab attributes
 * These are the standard attribute names used across blocks
 */
export interface AdvancedStyleAttributes {
	// Block ID (for unique selector)
	blockId?: string;

	// Margin (desktop/tablet/mobile)
	blockMargin?: DimensionsConfig;
	blockMargin_tablet?: DimensionsConfig;
	blockMargin_mobile?: DimensionsConfig;

	// Padding (desktop/tablet/mobile)
	blockPadding?: DimensionsConfig;
	blockPadding_tablet?: DimensionsConfig;
	blockPadding_mobile?: DimensionsConfig;

	// Position
	position?: string;
	offsetOrientationH?: string;
	offsetX?: number;
	offsetX_tablet?: number;
	offsetX_mobile?: number;
	offsetXUnit?: string;
	offsetXEnd?: number;
	offsetXEnd_tablet?: number;
	offsetXEnd_mobile?: number;
	offsetXEndUnit?: string;
	offsetOrientationV?: string;
	offsetY?: number;
	offsetY_tablet?: number;
	offsetY_mobile?: number;
	offsetYUnit?: string;
	offsetYEnd?: number;
	offsetYEnd_tablet?: number;
	offsetYEnd_mobile?: number;
	offsetYEndUnit?: string;

	// Z-Index (responsive)
	zIndex?: number | string;
	zIndex_tablet?: number | string;
	zIndex_mobile?: number | string;

	// Layout Width controls
	elementWidth?: string;
	elementWidth_tablet?: string;
	elementWidth_mobile?: string;
	elementCustomWidth?: number;
	elementCustomWidth_tablet?: number;
	elementCustomWidth_mobile?: number;
	elementCustomWidthUnit?: string;

	// Flexbox Item controls (responsive)
	flexAlignSelf?: string;
	flexAlignSelf_tablet?: string;
	flexAlignSelf_mobile?: string;
	flexOrder?: string;
	flexOrder_tablet?: string;
	flexOrder_mobile?: string;
	flexOrderCustom?: number;
	flexOrderCustom_tablet?: number;
	flexOrderCustom_mobile?: number;
	flexSize?: string;
	flexSize_tablet?: string;
	flexSize_mobile?: string;
	flexGrow?: number;
	flexGrow_tablet?: number;
	flexGrow_mobile?: number;
	flexShrink?: number;
	flexShrink_tablet?: number;
	flexShrink_mobile?: number;

	// Overflow
	overflow?: 'visible' | 'hidden' | 'scroll' | 'auto' | '';

	// Opacity
	opacity?: number;

	// Visibility (responsive hide)
	hideDesktop?: boolean;
	hideTablet?: boolean;
	hideMobile?: boolean;

	// Custom classes and CSS
	customClasses?: string;
	customCSS?: string;

	// Custom Attributes
	customAttributes?: string;

	// Element ID (HTML id attribute)
	elementId?: string;

	// Border (normal state)
	borderType?: string;
	borderWidth?: DimensionsConfig;
	borderColor?: string;
	borderRadius?: DimensionsConfig;
	borderRadiusDimensions?: DimensionsConfig;
	borderRadius_tablet?: DimensionsConfig;
	borderRadius_mobile?: DimensionsConfig;

	// Box Shadow
	boxShadow?: BoxShadowValue;

	// Border (hover state)
	borderTypeHover?: string;
	borderWidthHover?: DimensionsConfig;
	borderColorHover?: string;
	borderRadiusHover?: DimensionsConfig;
	borderRadiusHover_tablet?: DimensionsConfig;
	borderRadiusHover_mobile?: DimensionsConfig;
	boxShadowHover?: BoxShadowValue;

	// Transition
	transitionDuration?: number;

	// Background (Normal state)
	backgroundType?: string;
	backgroundColor?: string;
	backgroundImage?: BackgroundImageValue;
	backgroundImage_tablet?: BackgroundImageValue;
	backgroundImage_mobile?: BackgroundImageValue;
	bgImagePosition?: string;
	bgImagePosition_tablet?: string;
	bgImagePosition_mobile?: string;
	bgImageAttachment?: string;
	bgImageRepeat?: string;
	bgImageRepeat_tablet?: string;
	bgImageRepeat_mobile?: string;
	bgImageSize?: string;
	bgImageSize_tablet?: string;
	bgImageSize_mobile?: string;
	bgImageCustomWidth?: number;
	bgImageCustomWidth_tablet?: number;
	bgImageCustomWidth_mobile?: number;
	bgImageCustomWidthUnit?: string;

	// Gradient settings
	gradientColor?: string;
	gradientLocation?: number;
	gradientSecondColor?: string;
	gradientSecondLocation?: number;
	gradientType?: string;
	gradientAngle?: number;
	gradientPosition?: string;

	// Background (Hover state)
	backgroundTypeHover?: string;
	backgroundColorHover?: string;
	backgroundImageHover?: BackgroundImageValue;
	bgTransitionDuration?: number;

	// Transform controls
	transformRotateZ?: number;
	transformRotateZ_tablet?: number;
	transformRotateZ_mobile?: number;
	transformRotateX?: number;
	transformRotateX_tablet?: number;
	transformRotateX_mobile?: number;
	transformRotateY?: number;
	transformRotateY_tablet?: number;
	transformRotateY_mobile?: number;
	transformOffsetX?: number;
	transformOffsetX_tablet?: number;
	transformOffsetX_mobile?: number;
	transformOffsetXUnit?: string;
	transformOffsetY?: number;
	transformOffsetY_tablet?: number;
	transformOffsetY_mobile?: number;
	transformOffsetYUnit?: string;
	transformScaleX?: number;
	transformScaleX_tablet?: number;
	transformScaleX_mobile?: number;
	transformScaleY?: number;
	transformScaleY_tablet?: number;
	transformScaleY_mobile?: number;
	transformSkewX?: number;
	transformSkewX_tablet?: number;
	transformSkewX_mobile?: number;
	transformSkewY?: number;
	transformSkewY_tablet?: number;
	transformSkewY_mobile?: number;
	transformFlipH?: boolean;
	transformFlipV?: boolean;

	// Mask controls
	maskSwitch?: boolean;
	maskShape?: string;
	maskImage?: BackgroundImageValue;
	maskImage_tablet?: BackgroundImageValue;
	maskImage_mobile?: BackgroundImageValue;
	maskSize?: string;
	maskSize_tablet?: string;
	maskSize_mobile?: string;
	maskSizeScale?: number;
	maskSizeScale_tablet?: number;
	maskSizeScale_mobile?: number;
	maskSizeScaleUnit?: string;
	maskPosition?: string;
	maskPosition_tablet?: string;
	maskPosition_mobile?: string;
	maskPositionX?: number;
	maskPositionX_tablet?: number;
	maskPositionX_mobile?: number;
	maskPositionXUnit?: string;
	maskPositionY?: number;
	maskPositionY_tablet?: number;
	maskPositionY_mobile?: number;
	maskPositionYUnit?: string;
	maskRepeat?: string;
	maskRepeat_tablet?: string;
	maskRepeat_mobile?: string;

	// Motion Effects
	motionFxScrollingEnabled?: boolean;
	motionFxScrollingEffect?: string;
	motionFxScrollingSpeed?: number;
	motionFxMouseEnabled?: boolean;
	motionFxMouseEffect?: string;
	motionFxMouseSpeed?: number;

	// Allow any additional properties
	[key: string]: unknown;
}

/**
 * Helper to format a dimension value with unit
 * Handles DimensionsConfig format: values can be strings with units or numbers
 */
function formatDimensionValue(value: string | number | undefined, defaultUnit = 'px'): string | undefined {
	if (value === undefined || value === null || value === '') return undefined;
	if (typeof value === 'string') return value;
	return `${value}${defaultUnit}`;
}

/**
 * Generate inline styles from AdvancedTab attributes (desktop only)
 *
 * @param attributes - Block attributes containing AdvancedTab values
 * @returns CSSProperties object to apply to element's style prop
 */
export function generateAdvancedStyles(attributes: AdvancedStyleAttributes): ExtendedCSSProperties {
	const styles: ExtendedCSSProperties = {};

	// Margin
	if (attributes.blockMargin) {
		const m = attributes.blockMargin;
		const unit = m.unit || 'px';
		const topVal = formatDimensionValue(m.top, unit);
		const rightVal = formatDimensionValue(m.right, unit);
		const bottomVal = formatDimensionValue(m.bottom, unit);
		const leftVal = formatDimensionValue(m.left, unit);
		if (topVal) styles.marginTop = topVal;
		if (rightVal) styles.marginRight = rightVal;
		if (bottomVal) styles.marginBottom = bottomVal;
		if (leftVal) styles.marginLeft = leftVal;
	}

	// Padding
	if (attributes.blockPadding) {
		const p = attributes.blockPadding;
		const unit = p.unit || 'px';
		const topVal = formatDimensionValue(p.top, unit);
		const rightVal = formatDimensionValue(p.right, unit);
		const bottomVal = formatDimensionValue(p.bottom, unit);
		const leftVal = formatDimensionValue(p.left, unit);
		if (topVal) styles.paddingTop = topVal;
		if (rightVal) styles.paddingRight = rightVal;
		if (bottomVal) styles.paddingBottom = bottomVal;
		if (leftVal) styles.paddingLeft = leftVal;
	}

	// Position
	if (attributes.position && attributes.position !== 'default') {
		styles.position = attributes.position as CSSProperties['position'];

		// Horizontal offset
		if (attributes.offsetOrientationH === 'end' || attributes.offsetOrientationH === 'right') {
			const val = attributes.offsetXEnd;
			const unit = attributes.offsetXEndUnit || 'px';
			if (val !== undefined) styles.right = `${val}${unit}`;
		} else {
			const val = attributes.offsetX;
			const unit = attributes.offsetXUnit || 'px';
			if (val !== undefined) styles.left = `${val}${unit}`;
		}

		// Vertical offset
		if (attributes.offsetOrientationV === 'end' || attributes.offsetOrientationV === 'bottom') {
			const val = attributes.offsetYEnd;
			const unit = attributes.offsetYEndUnit || 'px';
			if (val !== undefined) styles.bottom = `${val}${unit}`;
		} else {
			const val = attributes.offsetY;
			const unit = attributes.offsetYUnit || 'px';
			if (val !== undefined) styles.top = `${val}${unit}`;
		}
	}

	// Z-Index
	if (attributes.zIndex !== undefined && attributes.zIndex !== null) {
		styles.zIndex = attributes.zIndex;
	}

	// Layout Width
	if (attributes.elementWidth === 'custom' && attributes.elementCustomWidth !== undefined) {
		const unit = attributes.elementCustomWidthUnit || 'px';
		styles.width = `${attributes.elementCustomWidth}${unit}`;
	} else if (attributes.elementWidth === 'full') {
		styles.width = '100%';
	} else if (attributes.elementWidth === 'inline') {
		styles.display = 'inline-block';
		styles.width = 'auto';
	}

	// Flexbox Item - Align Self
	if (attributes.flexAlignSelf) {
		styles.alignSelf = attributes.flexAlignSelf;
	}

	// Flexbox Item - Order
	if (attributes.flexOrder === 'custom' && attributes.flexOrderCustom !== undefined) {
		styles.order = attributes.flexOrderCustom;
	} else if (attributes.flexOrder === 'start') {
		styles.order = -9999;
	} else if (attributes.flexOrder === 'end') {
		styles.order = 9999;
	}

	// Flexbox Item - Flex Grow/Shrink
	if (attributes.flexSize === 'none') {
		styles.flexGrow = 0;
		styles.flexShrink = 0;
	} else if (attributes.flexSize === 'grow') {
		styles.flexGrow = 1;
		styles.flexShrink = 0;
	} else if (attributes.flexSize === 'shrink') {
		styles.flexGrow = 0;
		styles.flexShrink = 1;
	} else if (attributes.flexSize === 'custom') {
		if (attributes.flexGrow !== undefined) styles.flexGrow = attributes.flexGrow;
		if (attributes.flexShrink !== undefined) styles.flexShrink = attributes.flexShrink;
	}

	// Overflow
	if (attributes.overflow) {
		styles.overflow = attributes.overflow;
	}

	// Opacity
	if (attributes.opacity !== undefined && attributes.opacity !== null) {
		styles.opacity = attributes.opacity;
	}

	// Border (normal state)
	if (attributes.borderType && attributes.borderType !== 'none') {
		styles.borderStyle = attributes.borderType;
	}
	if (attributes.borderColor) {
		styles.borderColor = attributes.borderColor;
	}
	if (attributes.borderWidth) {
		const bw = attributes.borderWidth;
		const unit = bw.unit || 'px';
		const topVal = formatDimensionValue(bw.top, unit);
		const rightVal = formatDimensionValue(bw.right, unit);
		const bottomVal = formatDimensionValue(bw.bottom, unit);
		const leftVal = formatDimensionValue(bw.left, unit);
		if (topVal) styles.borderTopWidth = topVal;
		if (rightVal) styles.borderRightWidth = rightVal;
		if (bottomVal) styles.borderBottomWidth = bottomVal;
		if (leftVal) styles.borderLeftWidth = leftVal;
	}
	// Border Radius - DimensionsConfig uses top/right/bottom/left for corners
	// Maps to: top = top-left, right = top-right, bottom = bottom-right, left = bottom-left
	// Note: flex-container uses borderRadiusDimensions, AdvancedTab uses borderRadius
	const borderRadiusValue = attributes.borderRadius || attributes.borderRadiusDimensions;
	if (borderRadiusValue) {
		const br = borderRadiusValue;
		const unit = br.unit || 'px';
		const topLeft = formatDimensionValue(br.top, unit);
		const topRight = formatDimensionValue(br.right, unit);
		const bottomRight = formatDimensionValue(br.bottom, unit);
		const bottomLeft = formatDimensionValue(br.left, unit);
		if (topLeft) styles.borderTopLeftRadius = topLeft;
		if (topRight) styles.borderTopRightRadius = topRight;
		if (bottomRight) styles.borderBottomRightRadius = bottomRight;
		if (bottomLeft) styles.borderBottomLeftRadius = bottomLeft;
	}

	// Box Shadow - defaults match Elementor (blur default is 10, not 0)
	if (attributes.boxShadow && Object.keys(attributes.boxShadow).length > 0) {
		const bs = attributes.boxShadow;
		const h = bs.horizontal ?? 0;
		const v = bs.vertical ?? 0;
		const blur = bs.blur ?? 10;  // Elementor default is 10
		const spread = bs.spread ?? 0;
		const color = bs.color ?? 'rgba(0,0,0,0.5)';
		const inset = bs.position === 'inset' ? 'inset ' : '';
		// Always apply box shadow if attribute exists (user has interacted with it)
		styles.boxShadow = `${inset}${h}px ${v}px ${blur}px ${spread}px ${color}`;
	}

	// Background
	// NOTE: Empty string or undefined backgroundType defaults to 'classic'
	const bgType = attributes.backgroundType || 'classic';

	if (bgType === 'classic') {
		if (attributes.backgroundColor) {
			styles.backgroundColor = attributes.backgroundColor;
		}
		if (attributes.backgroundImage?.url) {
			styles.backgroundImage = `url(${attributes.backgroundImage.url})`;
			if (attributes.bgImagePosition) styles.backgroundPosition = attributes.bgImagePosition;
			if (attributes.bgImageAttachment) styles.backgroundAttachment = attributes.bgImageAttachment;
			if (attributes.bgImageRepeat) styles.backgroundRepeat = attributes.bgImageRepeat;
			if (attributes.bgImageSize === 'custom' && attributes.bgImageCustomWidth) {
				const unit = attributes.bgImageCustomWidthUnit || 'px';
				styles.backgroundSize = `${attributes.bgImageCustomWidth}${unit}`;
			} else if (attributes.bgImageSize) {
				styles.backgroundSize = attributes.bgImageSize;
			}
		}
	} else if (bgType === 'gradient') {
		const color1 = attributes.gradientColor || '#000000';
		const loc1 = attributes.gradientLocation ?? 0;
		const color2 = attributes.gradientSecondColor || '#ffffff';
		const loc2 = attributes.gradientSecondLocation ?? 100;

		if (attributes.gradientType === 'radial') {
			const position = attributes.gradientPosition || 'center center';
			styles.backgroundImage = `radial-gradient(at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`;
		} else {
			const angle = attributes.gradientAngle ?? 180;
			styles.backgroundImage = `linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`;
		}
	}

	// Transform
	const transforms: string[] = [];

	// Rotation
	if (attributes.transformRotateZ) {
		transforms.push(`rotateZ(${attributes.transformRotateZ}deg)`);
	}
	if (attributes.transformRotateX) {
		transforms.push(`rotateX(${attributes.transformRotateX}deg)`);
	}
	if (attributes.transformRotateY) {
		transforms.push(`rotateY(${attributes.transformRotateY}deg)`);
	}

	// Translate
	if (attributes.transformOffsetX !== undefined || attributes.transformOffsetY !== undefined) {
		const x = attributes.transformOffsetX ?? 0;
		const xUnit = attributes.transformOffsetXUnit || 'px';
		const y = attributes.transformOffsetY ?? 0;
		const yUnit = attributes.transformOffsetYUnit || 'px';
		transforms.push(`translate(${x}${xUnit}, ${y}${yUnit})`);
	}

	// Scale
	if (attributes.transformScaleX !== undefined || attributes.transformScaleY !== undefined) {
		const scaleX = attributes.transformScaleX ?? 1;
		const scaleY = attributes.transformScaleY ?? 1;
		transforms.push(`scale(${scaleX}, ${scaleY})`);
	}

	// Skew
	if (attributes.transformSkewX || attributes.transformSkewY) {
		const skewX = attributes.transformSkewX ?? 0;
		const skewY = attributes.transformSkewY ?? 0;
		transforms.push(`skew(${skewX}deg, ${skewY}deg)`);
	}

	// Flip (using scaleX/Y = -1)
	if (attributes.transformFlipH) {
		transforms.push('scaleX(-1)');
	}
	if (attributes.transformFlipV) {
		transforms.push('scaleY(-1)');
	}

	if (transforms.length > 0) {
		styles.transform = transforms.join(' ');
	}

	// Mask
	// NOTE: Apply mask when maskSwitch is true AND either maskShape or maskImage is set
	// Check maskImage.url properly - empty object {} has no url property
	const hasMaskImage = attributes.maskImage && typeof attributes.maskImage === 'object' && attributes.maskImage.url;
	const hasMaskShape = attributes.maskShape && attributes.maskShape !== '';

	if (attributes.maskSwitch && (hasMaskShape || hasMaskImage)) {
		let maskImageValue = '';
		if (hasMaskImage) {
			maskImageValue = `url(${attributes.maskImage!.url})`;
		} else if (hasMaskShape) {
			// Predefined mask shapes - use Elementor's SVG files
			maskImageValue = `url(${getMaskShapeUrl(attributes.maskShape!)})`;
		}

		if (maskImageValue) {
			// Use React-compatible camelCase property names
			// React automatically handles vendor prefixes for WebkitMaskImage
			styles.WebkitMaskImage = maskImageValue;
			styles.maskImage = maskImageValue;

			// Mask size
			// NOTE: 'custom' is NOT a valid CSS mask-size value
			// Valid values: contain, cover, auto, <length>, <percentage>
			// When maskSize is 'custom', use maskSizeScale value, default to 100%
			if (attributes.maskSize === 'custom') {
				// Custom size mode - use scale value or default to 100%
				const scale = attributes.maskSizeScale ?? 100;
				const unit = attributes.maskSizeScaleUnit || '%';
				const sizeVal = `${scale}${unit}`;
				styles.WebkitMaskSize = sizeVal;
				styles.maskSize = sizeVal;
			} else if (attributes.maskSize && attributes.maskSize !== '') {
				// Standard size modes: contain, cover
				styles.WebkitMaskSize = attributes.maskSize;
				styles.maskSize = attributes.maskSize;
			}

			// Mask position
			if (attributes.maskPosition === 'custom') {
				const x = attributes.maskPositionX ?? 0;
				const xUnit = attributes.maskPositionXUnit || '%';
				const y = attributes.maskPositionY ?? 0;
				const yUnit = attributes.maskPositionYUnit || '%';
				const posVal = `${x}${xUnit} ${y}${yUnit}`;
				styles.WebkitMaskPosition = posVal;
				styles.maskPosition = posVal;
			} else if (attributes.maskPosition) {
				styles.WebkitMaskPosition = attributes.maskPosition;
				styles.maskPosition = attributes.maskPosition;
			}

			// Mask repeat
			if (attributes.maskRepeat) {
				styles.WebkitMaskRepeat = attributes.maskRepeat;
				styles.maskRepeat = attributes.maskRepeat;
			}
		}
	}

	// Transition (combine background and general transitions)
	const transitionDuration = attributes.transitionDuration ?? 0;
	const bgTransitionDuration = attributes.bgTransitionDuration ?? 0;
	if (transitionDuration > 0 || bgTransitionDuration > 0) {
		const transitions: string[] = [];
		if (transitionDuration > 0) {
			transitions.push(`all ${transitionDuration}s ease`);
		}
		if (bgTransitionDuration > 0 && bgTransitionDuration !== transitionDuration) {
			transitions.push(`background ${bgTransitionDuration}s ease`);
		}
		styles.transition = transitions.join(', ');
	}

	return styles;
}

/**
 * Get mask shape URL for predefined Elementor shapes
 * Uses Elementor's actual mask-shapes SVG files from their assets folder
 * Reference: AdvancedTab.tsx lines 706-730
 */
function getMaskShapeUrl(shape: string): string {
	// Use Elementor's built-in mask shape SVGs
	// These are located in: /wp-content/plugins/elementor/assets/mask-shapes/
	const ELEMENTOR_MASK_PATH = '/wp-content/plugins/elementor/assets/mask-shapes/';

	// All valid mask shape names from AdvancedTab.tsx MASK_SHAPES array
	const validShapes = [
		'circle',
		'oval-vertical',
		'oval-horizontal',
		'pill-vertical',
		'pill-horizontal',
		'triangle',
		'diamond',
		'pentagon',
		'hexagon-vertical',
		'hexagon-horizontal',
		'heptagon',
		'octagon',
		'parallelogram-right',
		'parallelogram-left',
		'trapezoid-up',
		'trapezoid-down',
		'flower',
		'sketch',
		'hexagon', // Hexagon Donut
		'blob',
	];

	// Use the shape if valid, otherwise default to circle
	const shapeName = validShapes.includes(shape) ? shape : 'circle';
	return `${ELEMENTOR_MASK_PATH}${shapeName}.svg`;
}

/**
 * Helper to generate CSS rule for spacing (DimensionsConfig format)
 */
function generateSpacingCSS(property: 'margin' | 'padding', value: DimensionsConfig | undefined): string {
	if (!value) return '';
	const rules: string[] = [];
	const unit = value.unit || 'px';
	const top = formatDimensionValue(value.top, unit);
	const right = formatDimensionValue(value.right, unit);
	const bottom = formatDimensionValue(value.bottom, unit);
	const left = formatDimensionValue(value.left, unit);
	if (top) rules.push(`${property}-top: ${top}`);
	if (right) rules.push(`${property}-right: ${right}`);
	if (bottom) rules.push(`${property}-bottom: ${bottom}`);
	if (left) rules.push(`${property}-left: ${left}`);
	return rules.join('; ');
}

/**
 * Helper to generate CSS rule for border radius (DimensionsConfig format)
 * Maps: top = top-left, right = top-right, bottom = bottom-right, left = bottom-left
 */
function generateBorderRadiusCSS(value: DimensionsConfig | undefined): string {
	if (!value) return '';
	const rules: string[] = [];
	const unit = value.unit || 'px';
	const topLeft = formatDimensionValue(value.top, unit);
	const topRight = formatDimensionValue(value.right, unit);
	const bottomRight = formatDimensionValue(value.bottom, unit);
	const bottomLeft = formatDimensionValue(value.left, unit);
	if (topLeft) rules.push(`border-top-left-radius: ${topLeft}`);
	if (topRight) rules.push(`border-top-right-radius: ${topRight}`);
	if (bottomRight) rules.push(`border-bottom-right-radius: ${bottomRight}`);
	if (bottomLeft) rules.push(`border-bottom-left-radius: ${bottomLeft}`);
	return rules.join('; ');
}

/**
 * Helper to generate CSS rule for border width (DimensionsConfig format)
 */
function generateBorderWidthCSS(value: DimensionsConfig | undefined): string {
	if (!value) return '';
	const rules: string[] = [];
	const unit = value.unit || 'px';
	const top = formatDimensionValue(value.top, unit);
	const right = formatDimensionValue(value.right, unit);
	const bottom = formatDimensionValue(value.bottom, unit);
	const left = formatDimensionValue(value.left, unit);
	if (top) rules.push(`border-top-width: ${top}`);
	if (right) rules.push(`border-right-width: ${right}`);
	if (bottom) rules.push(`border-bottom-width: ${bottom}`);
	if (left) rules.push(`border-left-width: ${left}`);
	return rules.join('; ');
}

/**
 * Generate responsive CSS for tablet/mobile overrides
 *
 * @param attributes - Block attributes containing AdvancedTab values
 * @param selector - CSS selector for the block (e.g., `.voxel-fse-search-form-abc123`)
 * @returns CSS string with @media queries
 */
export function generateAdvancedResponsiveCSS(
	attributes: AdvancedStyleAttributes,
	selector: string
): string {
	const cssRules: string[] = [];

	// Tablet CSS (max-width: 1024px)
	const tabletStyles: string[] = [];
	if (attributes.blockMargin_tablet) {
		const css = generateSpacingCSS('margin', attributes.blockMargin_tablet);
		if (css) tabletStyles.push(css);
	}
	if (attributes.blockPadding_tablet) {
		const css = generateSpacingCSS('padding', attributes.blockPadding_tablet);
		if (css) tabletStyles.push(css);
	}
	// Layout width tablet
	if (attributes.elementWidth_tablet === 'custom' && attributes.elementCustomWidth_tablet !== undefined) {
		const unit = attributes.elementCustomWidthUnit || 'px';
		tabletStyles.push(`width: ${attributes.elementCustomWidth_tablet}${unit}`);
	} else if (attributes.elementWidth_tablet === 'full') {
		tabletStyles.push('width: 100%');
	} else if (attributes.elementWidth_tablet === 'inline') {
		tabletStyles.push('display: inline-block; width: auto');
	}
	if (attributes.borderRadius_tablet) {
		const css = generateBorderRadiusCSS(attributes.borderRadius_tablet);
		if (css) tabletStyles.push(css);
	}
	// Z-Index tablet
	if (attributes.zIndex_tablet !== undefined) {
		tabletStyles.push(`z-index: ${attributes.zIndex_tablet}`);
	}
	// Flexbox Item tablet
	if (attributes.flexAlignSelf_tablet) {
		tabletStyles.push(`align-self: ${attributes.flexAlignSelf_tablet}`);
	}
	if (attributes.flexOrder_tablet === 'custom' && attributes.flexOrderCustom_tablet !== undefined) {
		tabletStyles.push(`order: ${attributes.flexOrderCustom_tablet}`);
	} else if (attributes.flexOrder_tablet === 'start') {
		tabletStyles.push('order: -9999');
	} else if (attributes.flexOrder_tablet === 'end') {
		tabletStyles.push('order: 9999');
	}
	if (attributes.flexSize_tablet === 'none') {
		tabletStyles.push('flex-grow: 0; flex-shrink: 0');
	} else if (attributes.flexSize_tablet === 'grow') {
		tabletStyles.push('flex-grow: 1; flex-shrink: 0');
	} else if (attributes.flexSize_tablet === 'shrink') {
		tabletStyles.push('flex-grow: 0; flex-shrink: 1');
	} else if (attributes.flexSize_tablet === 'custom') {
		if (attributes.flexGrow_tablet !== undefined) tabletStyles.push(`flex-grow: ${attributes.flexGrow_tablet}`);
		if (attributes.flexShrink_tablet !== undefined) tabletStyles.push(`flex-shrink: ${attributes.flexShrink_tablet}`);
	}
	// Transform tablet
	const tabletTransforms = generateTransformCSS(attributes, '_tablet');
	if (tabletTransforms) {
		tabletStyles.push(`transform: ${tabletTransforms}`);
	}
	// Background image tablet
	if (attributes.backgroundImage_tablet?.url) {
		tabletStyles.push(`background-image: url(${attributes.backgroundImage_tablet.url})`);
	}
	if (attributes.bgImagePosition_tablet) {
		tabletStyles.push(`background-position: ${attributes.bgImagePosition_tablet}`);
	}
	if (attributes.bgImageRepeat_tablet) {
		tabletStyles.push(`background-repeat: ${attributes.bgImageRepeat_tablet}`);
	}
	if (attributes.bgImageSize_tablet === 'custom' && attributes.bgImageCustomWidth_tablet) {
		const unit = attributes.bgImageCustomWidthUnit || 'px';
		tabletStyles.push(`background-size: ${attributes.bgImageCustomWidth_tablet}${unit}`);
	} else if (attributes.bgImageSize_tablet) {
		tabletStyles.push(`background-size: ${attributes.bgImageSize_tablet}`);
	}
	// Mask tablet
	if (attributes.maskSwitch) {
		if (attributes.maskImage_tablet?.url) {
			tabletStyles.push(`-webkit-mask-image: url(${attributes.maskImage_tablet.url}); mask-image: url(${attributes.maskImage_tablet.url})`);
		}
		// NOTE: 'custom' is NOT a valid CSS mask-size value
		if (attributes.maskSize_tablet === 'custom') {
			const scale = attributes.maskSizeScale_tablet ?? 100;
			const unit = attributes.maskSizeScaleUnit || '%';
			tabletStyles.push(`-webkit-mask-size: ${scale}${unit}; mask-size: ${scale}${unit}`);
		} else if (attributes.maskSize_tablet && attributes.maskSize_tablet !== 'custom') {
			tabletStyles.push(`-webkit-mask-size: ${attributes.maskSize_tablet}; mask-size: ${attributes.maskSize_tablet}`);
		}
		if (attributes.maskPosition_tablet === 'custom' && (attributes.maskPositionX_tablet !== undefined || attributes.maskPositionY_tablet !== undefined)) {
			const x = attributes.maskPositionX_tablet ?? 0;
			const xUnit = attributes.maskPositionXUnit || '%';
			const y = attributes.maskPositionY_tablet ?? 0;
			const yUnit = attributes.maskPositionYUnit || '%';
			tabletStyles.push(`-webkit-mask-position: ${x}${xUnit} ${y}${yUnit}; mask-position: ${x}${xUnit} ${y}${yUnit}`);
		} else if (attributes.maskPosition_tablet) {
			tabletStyles.push(`-webkit-mask-position: ${attributes.maskPosition_tablet}; mask-position: ${attributes.maskPosition_tablet}`);
		}
		if (attributes.maskRepeat_tablet) {
			tabletStyles.push(`-webkit-mask-repeat: ${attributes.maskRepeat_tablet}; mask-repeat: ${attributes.maskRepeat_tablet}`);
		}
	}

	if (tabletStyles.length > 0) {
		cssRules.push(`@media (max-width: 1024px) { ${selector} { ${tabletStyles.join('; ')}; } }`);
	}

	// Mobile CSS (max-width: 767px)
	const mobileStyles: string[] = [];
	if (attributes.blockMargin_mobile) {
		const css = generateSpacingCSS('margin', attributes.blockMargin_mobile);
		if (css) mobileStyles.push(css);
	}
	if (attributes.blockPadding_mobile) {
		const css = generateSpacingCSS('padding', attributes.blockPadding_mobile);
		if (css) mobileStyles.push(css);
	}
	// Layout width mobile
	if (attributes.elementWidth_mobile === 'custom' && attributes.elementCustomWidth_mobile !== undefined) {
		const unit = attributes.elementCustomWidthUnit || 'px';
		mobileStyles.push(`width: ${attributes.elementCustomWidth_mobile}${unit}`);
	} else if (attributes.elementWidth_mobile === 'full') {
		mobileStyles.push('width: 100%');
	} else if (attributes.elementWidth_mobile === 'inline') {
		mobileStyles.push('display: inline-block; width: auto');
	}
	if (attributes.borderRadius_mobile) {
		const css = generateBorderRadiusCSS(attributes.borderRadius_mobile);
		if (css) mobileStyles.push(css);
	}
	// Z-Index mobile
	if (attributes.zIndex_mobile !== undefined) {
		mobileStyles.push(`z-index: ${attributes.zIndex_mobile}`);
	}
	// Flexbox Item mobile
	if (attributes.flexAlignSelf_mobile) {
		mobileStyles.push(`align-self: ${attributes.flexAlignSelf_mobile}`);
	}
	if (attributes.flexOrder_mobile === 'custom' && attributes.flexOrderCustom_mobile !== undefined) {
		mobileStyles.push(`order: ${attributes.flexOrderCustom_mobile}`);
	} else if (attributes.flexOrder_mobile === 'start') {
		mobileStyles.push('order: -9999');
	} else if (attributes.flexOrder_mobile === 'end') {
		mobileStyles.push('order: 9999');
	}
	if (attributes.flexSize_mobile === 'none') {
		mobileStyles.push('flex-grow: 0; flex-shrink: 0');
	} else if (attributes.flexSize_mobile === 'grow') {
		mobileStyles.push('flex-grow: 1; flex-shrink: 0');
	} else if (attributes.flexSize_mobile === 'shrink') {
		mobileStyles.push('flex-grow: 0; flex-shrink: 1');
	} else if (attributes.flexSize_mobile === 'custom') {
		if (attributes.flexGrow_mobile !== undefined) mobileStyles.push(`flex-grow: ${attributes.flexGrow_mobile}`);
		if (attributes.flexShrink_mobile !== undefined) mobileStyles.push(`flex-shrink: ${attributes.flexShrink_mobile}`);
	}
	// Transform mobile
	const mobileTransforms = generateTransformCSS(attributes, '_mobile');
	if (mobileTransforms) {
		mobileStyles.push(`transform: ${mobileTransforms}`);
	}
	// Background image mobile
	if (attributes.backgroundImage_mobile?.url) {
		mobileStyles.push(`background-image: url(${attributes.backgroundImage_mobile.url})`);
	}
	if (attributes.bgImagePosition_mobile) {
		mobileStyles.push(`background-position: ${attributes.bgImagePosition_mobile}`);
	}
	if (attributes.bgImageRepeat_mobile) {
		mobileStyles.push(`background-repeat: ${attributes.bgImageRepeat_mobile}`);
	}
	if (attributes.bgImageSize_mobile === 'custom' && attributes.bgImageCustomWidth_mobile) {
		const unit = attributes.bgImageCustomWidthUnit || 'px';
		mobileStyles.push(`background-size: ${attributes.bgImageCustomWidth_mobile}${unit}`);
	} else if (attributes.bgImageSize_mobile) {
		mobileStyles.push(`background-size: ${attributes.bgImageSize_mobile}`);
	}
	// Mask mobile
	if (attributes.maskSwitch) {
		if (attributes.maskImage_mobile?.url) {
			mobileStyles.push(`-webkit-mask-image: url(${attributes.maskImage_mobile.url}); mask-image: url(${attributes.maskImage_mobile.url})`);
		}
		// NOTE: 'custom' is NOT a valid CSS mask-size value
		if (attributes.maskSize_mobile === 'custom') {
			const scale = attributes.maskSizeScale_mobile ?? 100;
			const unit = attributes.maskSizeScaleUnit || '%';
			mobileStyles.push(`-webkit-mask-size: ${scale}${unit}; mask-size: ${scale}${unit}`);
		} else if (attributes.maskSize_mobile && attributes.maskSize_mobile !== 'custom') {
			mobileStyles.push(`-webkit-mask-size: ${attributes.maskSize_mobile}; mask-size: ${attributes.maskSize_mobile}`);
		}
		if (attributes.maskPosition_mobile === 'custom' && (attributes.maskPositionX_mobile !== undefined || attributes.maskPositionY_mobile !== undefined)) {
			const x = attributes.maskPositionX_mobile ?? 0;
			const xUnit = attributes.maskPositionXUnit || '%';
			const y = attributes.maskPositionY_mobile ?? 0;
			const yUnit = attributes.maskPositionYUnit || '%';
			mobileStyles.push(`-webkit-mask-position: ${x}${xUnit} ${y}${yUnit}; mask-position: ${x}${xUnit} ${y}${yUnit}`);
		} else if (attributes.maskPosition_mobile) {
			mobileStyles.push(`-webkit-mask-position: ${attributes.maskPosition_mobile}; mask-position: ${attributes.maskPosition_mobile}`);
		}
		if (attributes.maskRepeat_mobile) {
			mobileStyles.push(`-webkit-mask-repeat: ${attributes.maskRepeat_mobile}; mask-repeat: ${attributes.maskRepeat_mobile}`);
		}
	}

	if (mobileStyles.length > 0) {
		cssRules.push(`@media (max-width: 767px) { ${selector} { ${mobileStyles.join('; ')}; } }`);
	}

	// Custom CSS with selector replacement
	if (attributes.customCSS) {
		// Replace 'selector' placeholder with actual selector
		const customCSS = attributes.customCSS.replace(/selector/gi, selector);
		cssRules.push(customCSS);
	}

	// Hover state CSS
	const hoverStyles: string[] = [];
	if (attributes.borderTypeHover && attributes.borderTypeHover !== 'none') {
		hoverStyles.push(`border-style: ${attributes.borderTypeHover}`);
	}
	if (attributes.borderColorHover) {
		hoverStyles.push(`border-color: ${attributes.borderColorHover}`);
	}
	if (attributes.borderWidthHover) {
		const css = generateBorderWidthCSS(attributes.borderWidthHover);
		if (css) hoverStyles.push(css);
	}
	if (attributes.borderRadiusHover) {
		const css = generateBorderRadiusCSS(attributes.borderRadiusHover);
		if (css) hoverStyles.push(css);
	}
	if (attributes.boxShadowHover && Object.keys(attributes.boxShadowHover).length > 0) {
		const bs = attributes.boxShadowHover;
		const h = bs.horizontal ?? 0;
		const v = bs.vertical ?? 0;
		const blur = bs.blur ?? 0;
		const spread = bs.spread ?? 0;
		const color = bs.color ?? 'rgba(0,0,0,0.5)';
		const inset = bs.position === 'inset' ? 'inset ' : '';
		if (h || v || blur || spread) {
			hoverStyles.push(`box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}`);
		}
	}
	// Background hover
	// NOTE: Empty string or undefined defaults to 'classic'
	const bgTypeHover = attributes.backgroundTypeHover || 'classic';
	if (bgTypeHover === 'classic') {
		if (attributes.backgroundColorHover) {
			hoverStyles.push(`background-color: ${attributes.backgroundColorHover}`);
		}
		if (attributes.backgroundImageHover?.url) {
			hoverStyles.push(`background-image: url(${attributes.backgroundImageHover.url})`);
		}
	}

	if (hoverStyles.length > 0) {
		cssRules.push(`${selector}:hover { ${hoverStyles.join('; ')}; }`);
	}

	return cssRules.join('\n');
}

/**
 * Generate transform CSS string for responsive breakpoints
 */
function generateTransformCSS(attributes: AdvancedStyleAttributes, suffix: '_tablet' | '_mobile' | ''): string {
	const transforms: string[] = [];

	// Get attribute with suffix
	const rotateZ = (attributes as Record<string, unknown>)[`transformRotateZ${suffix}`] as number | undefined;
	const rotateX = (attributes as Record<string, unknown>)[`transformRotateX${suffix}`] as number | undefined;
	const rotateY = (attributes as Record<string, unknown>)[`transformRotateY${suffix}`] as number | undefined;
	const offsetX = (attributes as Record<string, unknown>)[`transformOffsetX${suffix}`] as number | undefined;
	const offsetY = (attributes as Record<string, unknown>)[`transformOffsetY${suffix}`] as number | undefined;
	const scaleX = (attributes as Record<string, unknown>)[`transformScaleX${suffix}`] as number | undefined;
	const scaleY = (attributes as Record<string, unknown>)[`transformScaleY${suffix}`] as number | undefined;
	const skewX = (attributes as Record<string, unknown>)[`transformSkewX${suffix}`] as number | undefined;
	const skewY = (attributes as Record<string, unknown>)[`transformSkewY${suffix}`] as number | undefined;

	if (rotateZ) transforms.push(`rotateZ(${rotateZ}deg)`);
	if (rotateX) transforms.push(`rotateX(${rotateX}deg)`);
	if (rotateY) transforms.push(`rotateY(${rotateY}deg)`);

	if (offsetX !== undefined || offsetY !== undefined) {
		const x = offsetX ?? 0;
		const xUnit = attributes.transformOffsetXUnit || 'px';
		const y = offsetY ?? 0;
		const yUnit = attributes.transformOffsetYUnit || 'px';
		transforms.push(`translate(${x}${xUnit}, ${y}${yUnit})`);
	}

	if (scaleX !== undefined || scaleY !== undefined) {
		const sx = scaleX ?? 1;
		const sy = scaleY ?? 1;
		transforms.push(`scale(${sx}, ${sy})`);
	}

	if (skewX || skewY) {
		const sx = skewX ?? 0;
		const sy = skewY ?? 0;
		transforms.push(`skew(${sx}deg, ${sy}deg)`);
	}

	return transforms.join(' ');
}

/**
 * Get visibility classes based on hide attributes
 *
 * @param attributes - Block attributes containing visibility settings
 * @returns Array of CSS class names for responsive hiding
 */
export function getVisibilityClasses(attributes: AdvancedStyleAttributes): string[] {
	const classes: string[] = [];
	if (attributes.hideDesktop) classes.push('vx-hidden-desktop');
	if (attributes.hideTablet) classes.push('vx-hidden-tablet');
	if (attributes.hideMobile) classes.push('vx-hidden-mobile');
	return classes;
}

/**
 * Parse custom attributes string into object
 * Format: "key|value" per line (Elementor Pro format)
 *
 * @param customAttributes - String with key|value pairs, one per line
 * @returns Object with parsed attributes
 */
export function parseCustomAttributes(customAttributes: string | undefined): Record<string, string> {
	if (!customAttributes) return {};

	const result: Record<string, string> = {};
	const lines = customAttributes.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Format: key|value or just key (for boolean-like attributes)
		const pipeIndex = trimmed.indexOf('|');
		if (pipeIndex > 0) {
			const key = trimmed.substring(0, pipeIndex).trim();
			const value = trimmed.substring(pipeIndex + 1).trim();
			if (key && isValidAttributeName(key)) {
				result[key] = value;
			}
		} else if (isValidAttributeName(trimmed)) {
			// Boolean attribute (key only, no value)
			result[trimmed] = '';
		}
	}

	return result;
}

/**
 * Validate attribute name (prevent XSS/injection)
 */
function isValidAttributeName(name: string): boolean {
	// Must start with letter, can contain letters, numbers, hyphens, underscores
	// Cannot be event handlers (onclick, etc.) or special attrs
	const validPattern = /^[a-z][a-z0-9_-]*$/i;
	const blacklist = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
		'onkeydown', 'onkeyup', 'onsubmit', 'onchange', 'style', 'class', 'id', 'href', 'src'];
	return validPattern.test(name) && !blacklist.includes(name.toLowerCase());
}

/**
 * Get custom classes string
 *
 * @param attributes - Block attributes containing customClasses
 * @returns Trimmed custom classes string or empty string
 */
export function getCustomClasses(attributes: AdvancedStyleAttributes): string {
	return attributes.customClasses?.trim() || '';
}

/**
 * Combine all class names into a single string
 *
 * @param baseClass - Base block class name
 * @param attributes - Block attributes
 * @param additionalClasses - Any additional classes to include
 * @returns Combined class string
 */
export function combineBlockClasses(
	baseClass: string,
	attributes: AdvancedStyleAttributes,
	additionalClasses: string[] = []
): string {
	const classes = [
		baseClass,
		...getVisibilityClasses(attributes),
		getCustomClasses(attributes),
		...additionalClasses,
	].filter(Boolean);

	return classes.join(' ').trim();
}
