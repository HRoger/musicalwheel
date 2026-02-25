/**
 * Nested Accordion Block - Style Generation
 *
 * Generates responsive CSS for Content tab and Style tab controls.
 * These CSS rules target Elementor's nested accordion classes.
 *
 * @package VoxelFSE
 */

import type { NestedAccordionAttributes } from './types';

/**
 * Generate responsive CSS for Content tab controls
 *
 * Handles tablet and mobile overrides for:
 * - Item spacing (itemSpacing)
 * - Content distance (contentDistance)
 * - Item position (itemPosition)
 * - Icon position (iconPosition)
 * - Icon size (iconSize)
 * - Icon spacing (iconSpacing)
 */
export function generateContentTabResponsiveCSS(
	attributes: NestedAccordionAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.vxfse-nested-accordion-${blockId}`;

	// ============================================
	// CONTENT TAB - Layout Section
	// Source: Elementor nested-accordion widget
	// ============================================

	// Item Spacing - Distance between accordion items
	// CSS Variable: --n-accordion-item-title-space-between
	if (attributes.itemSpacing_tablet !== undefined) {
		tabletRules.push(
			`${selector} { --n-accordion-item-title-space-between: ${attributes.itemSpacing_tablet}px; }`
		);
	}
	if (attributes.itemSpacing_mobile !== undefined) {
		mobileRules.push(
			`${selector} { --n-accordion-item-title-space-between: ${attributes.itemSpacing_mobile}px; }`
		);
	}

	// Content Distance - Distance from title to content
	// CSS Variable: --n-accordion-item-title-distance-from-content
	if (attributes.contentDistance_tablet !== undefined) {
		tabletRules.push(
			`${selector} { --n-accordion-item-title-distance-from-content: ${attributes.contentDistance_tablet}px; }`
		);
	}
	if (attributes.contentDistance_mobile !== undefined) {
		mobileRules.push(
			`${selector} { --n-accordion-item-title-distance-from-content: ${attributes.contentDistance_mobile}px; }`
		);
	}

	// Item Position - Horizontal alignment of accordion items
	// Maps to: justify-content on .e-n-accordion-item-title
	const positionMap: Record<string, string> = {
		start: 'initial',
		center: 'center',
		end: 'flex-end',
		stretch: 'space-between',
	};

	if (attributes.itemPosition?.tablet) {
		const tabletPos = attributes.itemPosition.tablet;
		tabletRules.push(
			`${selector} .e-n-accordion-item-title { justify-content: ${positionMap[tabletPos]}; }`
		);
		if (tabletPos === 'stretch') {
			tabletRules.push(
				`${selector} .e-n-accordion-item-title .e-n-accordion-item-title-text { flex-grow: 1; }`
			);
		}
	}

	if (attributes.itemPosition?.mobile) {
		const mobilePos = attributes.itemPosition.mobile;
		mobileRules.push(
			`${selector} .e-n-accordion-item-title { justify-content: ${positionMap[mobilePos]}; }`
		);
		if (mobilePos === 'stretch') {
			mobileRules.push(
				`${selector} .e-n-accordion-item-title .e-n-accordion-item-title-text { flex-grow: 1; }`
			);
		}
	}

	// Icon Position - Start or End
	// Maps to: order on .e-n-accordion-item-title-icon
	if (attributes.iconPosition?.tablet) {
		const tabletIconPos = attributes.iconPosition.tablet;
		if (tabletIconPos === 'start') {
			tabletRules.push(
				`${selector} .e-n-accordion-item-title-icon { order: -1; }`
			);
		} else {
			tabletRules.push(
				`${selector} .e-n-accordion-item-title-icon { order: initial; }`
			);
		}
	}

	if (attributes.iconPosition?.mobile) {
		const mobileIconPos = attributes.iconPosition.mobile;
		if (mobileIconPos === 'start') {
			mobileRules.push(
				`${selector} .e-n-accordion-item-title-icon { order: -1; }`
			);
		} else {
			mobileRules.push(
				`${selector} .e-n-accordion-item-title-icon { order: initial; }`
			);
		}
	}

	// ============================================
	// CONTENT TAB - Icon Section (from StyleTab but responsive)
	// ============================================

	// Icon Size - Responsive
	if (attributes.iconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .e-n-accordion-item-title-icon i { font-size: ${attributes.iconSize_tablet}px; }`
		);
	}
	if (attributes.iconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .e-n-accordion-item-title-icon i { font-size: ${attributes.iconSize_mobile}px; }`
		);
	}

	// Icon Spacing - Responsive
	if (attributes.iconSpacing_tablet !== undefined) {
		tabletRules.push(
			`${selector} .e-n-accordion-item-title-icon { margin: 0 ${attributes.iconSpacing_tablet}px; }`
		);
	}
	if (attributes.iconSpacing_mobile !== undefined) {
		mobileRules.push(
			`${selector} .e-n-accordion-item-title-icon { margin: 0 ${attributes.iconSpacing_mobile}px; }`
		);
	}

	// ============================================
	// Combine CSS with media queries
	// ============================================
	let finalCSS = '';

	if (cssRules.length > 0) {
		finalCSS += cssRules.join('\n') + '\n';
	}

	if (tabletRules.length > 0) {
		finalCSS += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}\n`;
	}

	if (mobileRules.length > 0) {
		finalCSS += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}\n`;
	}

	return finalCSS;
}

/**
 * Generate responsive CSS for Style tab controls
 *
 * Handles all Style tab controls including:
 * - Accordion: Spacing, Background, Border, Border Radius, Padding (Normal/Hover/Active states)
 * - Title: Typography, Color, Text Shadow, Text Stroke (Normal/Hover/Active states)
 * - Icon: Size, Spacing, Color (Normal/Hover/Active states)
 * - Content: Background, Border, Border Radius, Padding
 *
 * CSS Variables Pattern (from Elementor nested-accordion):
 * - --n-accordion-item-title-space-between
 * - --n-accordion-item-title-distance-from-content
 * - --n-accordion-padding
 * - --n-accordion-border-radius
 * - --n-accordion-title-normal-color
 * - --n-accordion-title-hover-color
 * - --n-accordion-title-active-color
 * - --n-accordion-icon-size
 * - --n-accordion-icon-gap
 * - --n-accordion-icon-normal-color
 * - --n-accordion-icon-hover-color
 * - --n-accordion-icon-active-color
 */
export function generateStyleTabResponsiveCSS(
	attributes: NestedAccordionAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.vxfse-nested-accordion[data-block-id="${blockId}"]`;

	// ============================================
	// SECTION 1: Accordion Styling (Normal/Hover/Active)
	// Source: Elementor nested-accordion widget Style tab
	// ============================================

	// Normal state - Background
	if (attributes.accordionNormalBg) {
		cssRules.push(`${selector} .e-n-accordion-item-title { background-color: ${attributes.accordionNormalBg}; }`);
	}

	// Normal state - Border
	if (attributes.accordionNormalBorderType && attributes.accordionNormalBorderType !== 'none') {
		const borderWidth = attributes.accordionNormalBorderWidth || {};
		const top = parseFloat(String(borderWidth['top'])) || 0;
		const right = parseFloat(String(borderWidth['right'])) || 0;
		const bottom = parseFloat(String(borderWidth['bottom'])) || 0;
		const left = parseFloat(String(borderWidth['left'])) || 0;
		const color = attributes.accordionNormalBorderColor || '#d5d8dc';

		cssRules.push(
			`${selector} .e-n-accordion-item-title { ` +
			`border-style: ${attributes.accordionNormalBorderType}; ` +
			`border-width: ${top}px ${right}px ${bottom}px ${left}px; ` +
			`border-color: ${color}; ` +
			`}`
		);
	}

	// Hover state - Background
	if (attributes.accordionHoverBg) {
		cssRules.push(`${selector} .e-n-accordion-item:not([open]):hover > .e-n-accordion-item-title { background-color: ${attributes.accordionHoverBg}; }`);
	}

	// Hover state - Border
	if (attributes.accordionHoverBorderType && attributes.accordionHoverBorderType !== 'none') {
		const borderWidth = attributes.accordionHoverBorderWidth || {};
		const top = parseFloat(String(borderWidth['top'])) || 0;
		const right = parseFloat(String(borderWidth['right'])) || 0;
		const bottom = parseFloat(String(borderWidth['bottom'])) || 0;
		const left = parseFloat(String(borderWidth['left'])) || 0;
		const color = attributes.accordionHoverBorderColor || '#d5d8dc';

		cssRules.push(
			`${selector} .e-n-accordion-item:not([open]):hover > .e-n-accordion-item-title { ` +
			`border-style: ${attributes.accordionHoverBorderType}; ` +
			`border-width: ${top}px ${right}px ${bottom}px ${left}px; ` +
			`border-color: ${color}; ` +
			`}`
		);
	}

	// Active state - Background
	if (attributes.accordionActiveBg) {
		cssRules.push(`${selector} .e-n-accordion-item[open] > .e-n-accordion-item-title { background-color: ${attributes.accordionActiveBg}; }`);
	}

	// Active state - Border
	if (attributes.accordionActiveBorderType && attributes.accordionActiveBorderType !== 'none') {
		const borderWidth = attributes.accordionActiveBorderWidth || {};
		const top = parseFloat(String(borderWidth['top'])) || 0;
		const right = parseFloat(String(borderWidth['right'])) || 0;
		const bottom = parseFloat(String(borderWidth['bottom'])) || 0;
		const left = parseFloat(String(borderWidth['left'])) || 0;
		const color = attributes.accordionActiveBorderColor || '#d5d8dc';

		cssRules.push(
			`${selector} .e-n-accordion-item[open] > .e-n-accordion-item-title { ` +
			`border-style: ${attributes.accordionActiveBorderType}; ` +
			`border-width: ${top}px ${right}px ${bottom}px ${left}px; ` +
			`border-color: ${color}; ` +
			`}`
		);
	}

	// Border radius (responsive)
	if (attributes.accordionBorderRadius?.desktop) {
		const br = attributes.accordionBorderRadius.desktop;
		const top = br.top || '0px';
		const right = br.right || '0px';
		const bottom = br.bottom || '0px';
		const left = br.left || '0px';
		cssRules.push(`${selector} .e-n-accordion-item-title { border-radius: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.accordionBorderRadius?.tablet) {
		const br = attributes.accordionBorderRadius.tablet;
		const top = br.top || '0px';
		const right = br.right || '0px';
		const bottom = br.bottom || '0px';
		const left = br.left || '0px';
		tabletRules.push(`${selector} .e-n-accordion-item-title { border-radius: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.accordionBorderRadius?.mobile) {
		const br = attributes.accordionBorderRadius.mobile;
		const top = br.top || '0px';
		const right = br.right || '0px';
		const bottom = br.bottom || '0px';
		const left = br.left || '0px';
		mobileRules.push(`${selector} .e-n-accordion-item-title { border-radius: ${top} ${right} ${bottom} ${left}; }`);
	}

	// Padding (responsive)
	if (attributes.accordionPadding?.desktop) {
		const p = attributes.accordionPadding.desktop;
		const top = p.top || '10px';
		const right = p.right || '10px';
		const bottom = p.bottom || '10px';
		const left = p.left || '10px';
		cssRules.push(`${selector} .e-n-accordion-item-title { padding: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.accordionPadding?.tablet) {
		const p = attributes.accordionPadding.tablet;
		const top = p.top || '10px';
		const right = p.right || '10px';
		const bottom = p.bottom || '10px';
		const left = p.left || '10px';
		tabletRules.push(`${selector} .e-n-accordion-item-title { padding: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.accordionPadding?.mobile) {
		const p = attributes.accordionPadding.mobile;
		const top = p.top || '10px';
		const right = p.right || '10px';
		const bottom = p.bottom || '10px';
		const left = p.left || '10px';
		mobileRules.push(`${selector} .e-n-accordion-item-title { padding: ${top} ${right} ${bottom} ${left}; }`);
	}

	// ============================================
	// SECTION 2: Title Typography & States
	// Source: nested-accordion.php (Elementor selectors)
	// ============================================

	// Typography
	if (attributes.titleTypography) {
		const typo = attributes.titleTypography;
		let typoCss = '';

		if (typo.fontFamily) typoCss += `font-family: ${typo.fontFamily}; `;
		if (typo.fontSize) typoCss += `font-size: ${typo.fontSize}${typo.fontSizeUnit || 'px'}; `;
		if (typo.fontWeight) typoCss += `font-weight: ${typo.fontWeight}; `;
		if (typo.fontStyle) typoCss += `font-style: ${typo.fontStyle}; `;
		if (typo.textTransform) typoCss += `text-transform: ${typo.textTransform}; `;
		if (typo.textDecoration) typoCss += `text-decoration: ${typo.textDecoration}; `;
		if (typo.lineHeight) typoCss += `line-height: ${typo.lineHeight}${typo.lineHeightUnit || ''}; `;
		if (typo.letterSpacing) typoCss += `letter-spacing: ${typo.letterSpacing}${typo.letterSpacingUnit || 'px'}; `;

		if (typoCss) {
			cssRules.push(`${selector} .e-n-accordion-item-title-text { ${typoCss} }`);
		}
	}

	// Title text shadow (Normal/Hover/Active states)
	['Normal', 'Hover', 'Active'].forEach((state) => {
		const attrKey = `title${state}TextShadow` as keyof NestedAccordionAttributes;
		const shadow = attributes[attrKey] as any;

		if (shadow && shadow.horizontal !== undefined) {
			const h = shadow.horizontal || 0;
			const v = shadow.vertical || 0;
			const blur = shadow.blur || 0;
			const color = shadow.color || 'rgba(0,0,0,0.3)';
			const shadowCss = `text-shadow: ${h}px ${v}px ${blur}px ${color};`;

			if (state === 'Normal') {
				cssRules.push(`${selector} .e-n-accordion-item-title-text { ${shadowCss} }`);
			} else if (state === 'Hover') {
				cssRules.push(`${selector} .e-n-accordion-item:not([open]):hover > .e-n-accordion-item-title .e-n-accordion-item-title-text { ${shadowCss} }`);
			} else if (state === 'Active') {
				cssRules.push(`${selector} .e-n-accordion-item[open] > .e-n-accordion-item-title .e-n-accordion-item-title-text { ${shadowCss} }`);
			}
		}
	});

	// Title text stroke (Normal/Hover/Active states)
	['Normal', 'Hover', 'Active'].forEach((state) => {
		const attrKey = `title${state}TextStroke` as keyof NestedAccordionAttributes;
		const stroke = attributes[attrKey] as any;

		if (stroke && stroke.width !== undefined && stroke.color) {
			const width = stroke.width || 0;
			const color = stroke.color || '#000';
			const strokeCss = `-webkit-text-stroke-width: ${width}px; -webkit-text-stroke-color: ${color};`;

			if (state === 'Normal') {
				cssRules.push(`${selector} .e-n-accordion-item-title-text { ${strokeCss} }`);
			} else if (state === 'Hover') {
				cssRules.push(`${selector} .e-n-accordion-item:not([open]):hover > .e-n-accordion-item-title .e-n-accordion-item-title-text { ${strokeCss} }`);
			} else if (state === 'Active') {
				cssRules.push(`${selector} .e-n-accordion-item[open] > .e-n-accordion-item-title .e-n-accordion-item-title-text { ${strokeCss} }`);
			}
		}
	});

	// ============================================
	// SECTION 3: Content Styling
	// Source: Elementor nested-accordion widget
	// ============================================

	// Content background
	if (attributes.contentBg) {
		cssRules.push(`${selector} .e-n-accordion-item-content { background-color: ${attributes.contentBg}; }`);
	}

	// Content border
	if (attributes.contentBorderType && attributes.contentBorderType !== 'none') {
		const borderWidth = attributes.contentBorderWidth || {};
		const top = parseFloat(String(borderWidth['top'])) || 0;
		const right = parseFloat(String(borderWidth['right'])) || 0;
		const bottom = parseFloat(String(borderWidth['bottom'])) || 0;
		const left = parseFloat(String(borderWidth['left'])) || 0;
		const color = attributes.contentBorderColor || '#d5d8dc';

		cssRules.push(
			`${selector} .e-n-accordion-item-content { ` +
			`border-style: ${attributes.contentBorderType}; ` +
			`border-width: ${top}px ${right}px ${bottom}px ${left}px; ` +
			`border-color: ${color}; ` +
			`}`
		);
	}

	// Content border radius (responsive)
	if (attributes.contentBorderRadius?.desktop) {
		const br = attributes.contentBorderRadius.desktop;
		const top = br.top || '0px';
		const right = br.right || '0px';
		const bottom = br.bottom || '0px';
		const left = br.left || '0px';
		cssRules.push(`${selector} .e-n-accordion-item-content { border-radius: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.contentBorderRadius?.tablet) {
		const br = attributes.contentBorderRadius.tablet;
		const top = br.top || '0px';
		const right = br.right || '0px';
		const bottom = br.bottom || '0px';
		const left = br.left || '0px';
		tabletRules.push(`${selector} .e-n-accordion-item-content { border-radius: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.contentBorderRadius?.mobile) {
		const br = attributes.contentBorderRadius.mobile;
		const top = br.top || '0px';
		const right = br.right || '0px';
		const bottom = br.bottom || '0px';
		const left = br.left || '0px';
		mobileRules.push(`${selector} .e-n-accordion-item-content { border-radius: ${top} ${right} ${bottom} ${left}; }`);
	}

	// Content padding (responsive)
	if (attributes.contentPadding?.desktop) {
		const p = attributes.contentPadding.desktop;
		const top = p.top || '0';
		const right = p.right || '0';
		const bottom = p.bottom || '0';
		const left = p.left || '0';
		cssRules.push(`${selector} .e-n-accordion-item-content { padding: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.contentPadding?.tablet) {
		const p = attributes.contentPadding.tablet;
		const top = p.top || '0';
		const right = p.right || '0';
		const bottom = p.bottom || '0';
		const left = p.left || '0';
		tabletRules.push(`${selector} .e-n-accordion-item-content { padding: ${top} ${right} ${bottom} ${left}; }`);
	}

	if (attributes.contentPadding?.mobile) {
		const p = attributes.contentPadding.mobile;
		const top = p.top || '0';
		const right = p.right || '0';
		const bottom = p.bottom || '0';
		const left = p.left || '0';
		mobileRules.push(`${selector} .e-n-accordion-item-content { padding: ${top} ${right} ${bottom} ${left}; }`);
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
