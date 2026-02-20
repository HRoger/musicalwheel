/**
 * Nested Tabs Block - Responsive CSS Generation
 *
 * Generates CSS targeting Elementor nested-tabs classes with block-scoped selector.
 * Handles all Style tab controls: Tabs, Titles, Icon, Content.
 *
 * @package VoxelFSE
 */

import type { NestedTabsAttributes } from './types';

// Helper functions for complex CSS generation
// @ts-ignore -- unused but kept for future use
function _generateDimensionsCSS(dimensions: any, property: string): string {
	if (!dimensions) return '';
	const { unit = 'px' } = dimensions;
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

function generateBorderCSS(borderType: string | undefined, borderWidth: any, borderColor: string | undefined): string {
	if (!borderType || borderType === 'none') return '';
	const width = borderWidth || {};
	const top = parseFloat(String(width.top)) || 0;
	const right = parseFloat(String(width.right)) || 0;
	const bottom = parseFloat(String(width.bottom)) || 0;
	const left = parseFloat(String(width.left)) || 0;
	const color = borderColor || '#000000';
	return `border-style: ${borderType}; border-width: ${top}px ${right}px ${bottom}px ${left}px; border-color: ${color};`;
}

function generateBoxShadowCSS(shadow: any): string {
	if (!shadow || !shadow.enable) return '';
	const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color};`;
}

function generateTextShadowCSS(shadow: any): string {
	if (!shadow || !shadow.enable) return '';
	const { horizontal = 0, vertical = 0, blur = 0, color = 'rgba(0,0,0,0.3)' } = shadow;
	return `text-shadow: ${horizontal}px ${vertical}px ${blur}px ${color};`;
}

function generateTextStrokeCSS(stroke: any): string {
	if (!stroke || !stroke.enable) return '';
	const { width = 1, color = '#000000' } = stroke;
	return `-webkit-text-stroke: ${width}px ${color}; text-stroke: ${width}px ${color};`;
}

function generateTypographyCSS(typography: any): string {
	if (!typography) return '';
	let css = '';
	if (typography.fontFamily) css += `font-family: ${typography.fontFamily}; `;
	if (typography.fontSize) css += `font-size: ${typography.fontSize}${typography.fontSizeUnit || 'px'}; `;
	if (typography.fontWeight) css += `font-weight: ${typography.fontWeight}; `;
	if (typography.fontStyle) css += `font-style: ${typography.fontStyle}; `;
	if (typography.textTransform) css += `text-transform: ${typography.textTransform}; `;
	if (typography.textDecoration) css += `text-decoration: ${typography.textDecoration}; `;
	if (typography.lineHeight) css += `line-height: ${typography.lineHeight}${typography.lineHeightUnit || ''}; `;
	if (typography.letterSpacing) css += `letter-spacing: ${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}; `;
	return css;
}

/**
 * Generate responsive CSS for nested-tabs block
 *
 * Architecture:
 * - Elementor uses CSS variables (custom properties) for most styling
 * - This function generates CSS rules for properties not handled by CSS variables
 * - Focuses on: borders, shadows, typography, text effects
 *
 * @param attributes Block attributes
 * @param blockId Unique block ID for scoped selector
 * @returns CSS string with desktop + tablet + mobile rules
 */
export function generateNestedTabsResponsiveCSS(
	attributes: NestedTabsAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.vxfse-nested-tabs-${blockId}`;

	// ============================================
	// ACCORDION 1: Tabs - Tab button styling
	// Source: nested-tabs.php:448-715
	// ============================================

	// Normal State
	// Selector: ".e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:not(:hover)"
	const tabNormalSelector = `${selector} .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:not(:hover)`;

	// Background - handled by CSS variables in save.tsx

	// Border - Normal
	if (attributes.tabsNormalBorderType) {
		const borderCSS = generateBorderCSS(
			attributes.tabsNormalBorderType,
			attributes.tabsNormalBorderWidth,
			attributes.tabsNormalBorderColor
		);
		if (borderCSS) {
			cssRules.push(`${tabNormalSelector} { ${borderCSS} }`);
		}
	}

	// Box Shadow - Normal
	if (attributes.tabsNormalBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.tabsNormalBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${tabNormalSelector} { ${shadowCSS} }`);
		}
	}

	// Hover State
	// Selector: ".e-n-tabs[data-touch-mode='false'] > .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:hover"
	const tabHoverSelector = `${selector} .e-n-tabs[data-touch-mode='false'] > .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:hover`;

	// Background - handled by CSS variables

	// Border - Hover
	if (attributes.tabsHoverBorderType) {
		const borderCSS = generateBorderCSS(
			attributes.tabsHoverBorderType,
			attributes.tabsHoverBorderWidth,
			attributes.tabsHoverBorderColor
		);
		if (borderCSS) {
			cssRules.push(`${tabHoverSelector} { ${borderCSS} }`);
		}
	}

	// Box Shadow - Hover
	if (attributes.tabsHoverBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.tabsHoverBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${tabHoverSelector} { ${shadowCSS} }`);
		}
	}

	// Active State
	// Selector: ".e-n-tabs-heading > .e-n-tab-title[aria-selected='true']"
	const tabActiveSelector = `${selector} .e-n-tabs-heading > .e-n-tab-title[aria-selected='true']`;
	const tabActiveTouchSelector = `${selector} .e-n-tabs[data-touch-mode='true'] > .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:hover`;

	// Background - handled by CSS variables

	// Border - Active
	if (attributes.tabsActiveBorderType) {
		const borderCSS = generateBorderCSS(
			attributes.tabsActiveBorderType,
			attributes.tabsActiveBorderWidth,
			attributes.tabsActiveBorderColor
		);
		if (borderCSS) {
			cssRules.push(`${tabActiveSelector}, ${tabActiveTouchSelector} { ${borderCSS} }`);
		}
	}

	// Box Shadow - Active
	if (attributes.tabsActiveBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.tabsActiveBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${tabActiveSelector}, ${tabActiveTouchSelector} { ${shadowCSS} }`);
		}
	}

	// ============================================
	// ACCORDION 2: Titles - Typography and text styling
	// Source: nested-tabs.php:717-839
	// ============================================

	const titleSelector = `${selector} .e-n-tabs-heading > .e-n-tab-title > .e-n-tab-title-text`;

	// Typography - applies to all states
	if (attributes.titleTypography) {
		const typographyCSS = generateTypographyCSS(attributes.titleTypography);
		if (typographyCSS) {
			cssRules.push(`${titleSelector} { ${typographyCSS} }`);
		}
	}

	// Title Normal State
	const titleNormalSelector = `${selector} .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:not(:hover)`;

	// Text Shadow - Normal
	if (attributes.titleNormalTextShadow) {
		const textShadowCSS = generateTextShadowCSS(attributes.titleNormalTextShadow);
		if (textShadowCSS) {
			cssRules.push(`${titleNormalSelector} { ${textShadowCSS} }`);
		}
	}

	// Text Stroke - Normal
	if (attributes.titleNormalTextStroke) {
		const textStrokeCSS = generateTextStrokeCSS(attributes.titleNormalTextStroke);
		if (textStrokeCSS) {
			cssRules.push(`${titleNormalSelector} :is(span, a, i) { ${textStrokeCSS} }`);
		}
	}

	// Title Hover State
	const titleHoverSelector = `${selector} .e-n-tabs[data-touch-mode='false'] > .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:hover`;

	// Text Shadow - Hover
	if (attributes.titleHoverTextShadow) {
		const textShadowCSS = generateTextShadowCSS(attributes.titleHoverTextShadow);
		if (textShadowCSS) {
			cssRules.push(`${titleHoverSelector} { ${textShadowCSS} }`);
		}
	}

	// Text Stroke - Hover
	if (attributes.titleHoverTextStroke) {
		const textStrokeCSS = generateTextStrokeCSS(attributes.titleHoverTextStroke);
		if (textStrokeCSS) {
			cssRules.push(`${titleHoverSelector} :is(span, a, i) { ${textStrokeCSS} }`);
		}
	}

	// Title Active State
	const titleActiveSelector = `${selector} .e-n-tabs-heading > .e-n-tab-title[aria-selected='true']`;
	const titleActiveTouchSelector = `${selector} .e-n-tabs[data-touch-mode='true'] > .e-n-tabs-heading > .e-n-tab-title[aria-selected='false']:hover`;

	// Text Shadow - Active
	if (attributes.titleActiveTextShadow) {
		const textShadowCSS = generateTextShadowCSS(attributes.titleActiveTextShadow);
		if (textShadowCSS) {
			cssRules.push(`${titleActiveSelector}, ${titleActiveTouchSelector} { ${textShadowCSS} }`);
		}
	}

	// Text Stroke - Active
	if (attributes.titleActiveTextStroke) {
		const textStrokeCSS = generateTextStrokeCSS(attributes.titleActiveTextStroke);
		if (textStrokeCSS) {
			cssRules.push(`${titleActiveSelector} :is(span, a, i), ${titleActiveTouchSelector} :is(span, a, i) { ${textStrokeCSS} }`);
		}
	}

	// ============================================
	// ACCORDION 3: Icon - Icon colors per state
	// Source: nested-tabs.php:841-935
	// Note: Icon position, size, spacing handled by CSS variables
	// This section only handles colors per state
	// ============================================

	// Icon colors are handled by CSS variables in save.tsx
	// No additional CSS needed here

	// ============================================
	// ACCORDION 4: Content - Content area styling
	// Source: nested-tabs.php:937-1020
	// ============================================

	const contentSelector = `${selector} .e-n-tabs-content > .e-con`;

	// Border - Content
	if (attributes.contentBorderType) {
		const borderCSS = generateBorderCSS(
			attributes.contentBorderType,
			attributes.contentBorderWidth,
			attributes.contentBorderColor
		);
		if (borderCSS) {
			cssRules.push(`${contentSelector} { ${borderCSS} }`);
		}
	}

	// Box Shadow - Content (if attribute exists)
	if (attributes.contentBoxShadow) {
		const shadowCSS = generateBoxShadowCSS(attributes.contentBoxShadow);
		if (shadowCSS) {
			cssRules.push(`${contentSelector} { ${shadowCSS} }`);
		}
	}

	// ============================================
	// RESPONSIVE: Tablet Rules
	// Source: All responsive controls with _tablet suffix
	// ============================================

	// Tabs Gap - Tablet
	if (attributes.tabsGap?.tablet) {
		tabletRules.push(`${selector} { --n-tabs-title-gap: ${attributes.tabsGap.tablet}; }`);
	}

	// Tabs Content Distance - Tablet
	if (attributes.tabsContentDistance?.tablet) {
		tabletRules.push(`${selector} { --n-tabs-gap: ${attributes.tabsContentDistance.tablet}; }`);
	}

	// Padding - Tablet
	if (attributes.tabsPadding?.tablet) {
		const p = attributes.tabsPadding.tablet;
		tabletRules.push(`${selector} {
			--n-tabs-title-padding-top: ${p.top || '15px'};
			--n-tabs-title-padding-right: ${p.right || '20px'};
			--n-tabs-title-padding-bottom: ${p.bottom || '15px'};
			--n-tabs-title-padding-left: ${p.left || '20px'};
		}`);
	}

	// Border Radius - Tablet
	if (attributes.tabsBorderRadius?.tablet) {
		const br = attributes.tabsBorderRadius.tablet;
		tabletRules.push(`${selector} { --n-tabs-title-border-radius: ${br.top || '0'} ${br.right || '0'} ${br.bottom || '0'} ${br.left || '0'}; }`);
	}

	// Icon Size - Tablet
	if (attributes.iconSize?.tablet) {
		tabletRules.push(`${selector} { --n-tabs-icon-size: ${attributes.iconSize.tablet}; }`);
	}

	// Icon Spacing - Tablet
	if (attributes.iconSpacing?.tablet) {
		tabletRules.push(`${selector} { --n-tabs-icon-gap: ${attributes.iconSpacing.tablet}; }`);
	}

	// Content Padding - Tablet
	if (attributes.contentPadding?.tablet) {
		const cp = attributes.contentPadding.tablet;
		tabletRules.push(`${selector} { --n-tabs-content-padding: ${cp.top || '0'} ${cp.right || '0'} ${cp.bottom || '0'} ${cp.left || '0'}; }`);
	}

	// Content Border Radius - Tablet
	if (attributes.contentBorderRadius?.tablet) {
		const cbr = attributes.contentBorderRadius.tablet;
		tabletRules.push(`${selector} { --n-tabs-content-border-radius: ${cbr.top || '0'} ${cbr.right || '0'} ${cbr.bottom || '0'} ${cbr.left || '0'}; }`);
	}

	// ============================================
	// RESPONSIVE: Mobile Rules
	// Source: All responsive controls with _mobile suffix
	// ============================================

	// Tabs Gap - Mobile
	if (attributes.tabsGap?.mobile) {
		mobileRules.push(`${selector} { --n-tabs-title-gap: ${attributes.tabsGap.mobile}; }`);
	}

	// Tabs Content Distance - Mobile
	if (attributes.tabsContentDistance?.mobile) {
		mobileRules.push(`${selector} { --n-tabs-gap: ${attributes.tabsContentDistance.mobile}; }`);
	}

	// Padding - Mobile
	if (attributes.tabsPadding?.mobile) {
		const p = attributes.tabsPadding.mobile;
		mobileRules.push(`${selector} {
			--n-tabs-title-padding-top: ${p.top || '15px'};
			--n-tabs-title-padding-right: ${p.right || '20px'};
			--n-tabs-title-padding-bottom: ${p.bottom || '15px'};
			--n-tabs-title-padding-left: ${p.left || '20px'};
		}`);
	}

	// Border Radius - Mobile
	if (attributes.tabsBorderRadius?.mobile) {
		const br = attributes.tabsBorderRadius.mobile;
		mobileRules.push(`${selector} { --n-tabs-title-border-radius: ${br.top || '0'} ${br.right || '0'} ${br.bottom || '0'} ${br.left || '0'}; }`);
	}

	// Icon Size - Mobile
	if (attributes.iconSize?.mobile) {
		mobileRules.push(`${selector} { --n-tabs-icon-size: ${attributes.iconSize.mobile}; }`);
	}

	// Icon Spacing - Mobile
	if (attributes.iconSpacing?.mobile) {
		mobileRules.push(`${selector} { --n-tabs-icon-gap: ${attributes.iconSpacing.mobile}; }`);
	}

	// Content Padding - Mobile
	if (attributes.contentPadding?.mobile) {
		const cp = attributes.contentPadding.mobile;
		mobileRules.push(`${selector} { --n-tabs-content-padding: ${cp.top || '0'} ${cp.right || '0'} ${cp.bottom || '0'} ${cp.left || '0'}; }`);
	}

	// Content Border Radius - Mobile
	if (attributes.contentBorderRadius?.mobile) {
		const cbr = attributes.contentBorderRadius.mobile;
		mobileRules.push(`${selector} { --n-tabs-content-border-radius: ${cbr.top || '0'} ${cbr.right || '0'} ${cbr.bottom || '0'} ${cbr.left || '0'}; }`);
	}

	// Transition Duration on tab buttons (for hover animation)
	const transitionVal = attributes.tabsTransitionDuration?.desktop;
	if (transitionVal !== undefined && transitionVal !== ('' as any)) {
		cssRules.push(`${selector} .e-n-tab-title { transition-duration: ${transitionVal}s; }`);
	}

	// ============================================
	// Combine CSS with media queries
	// ============================================
	let finalCSS = '';
	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n');
	}
	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
	}
	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
	}
	return finalCSS;
}
