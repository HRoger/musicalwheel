/**
 * Work Hours Block - CSS Generation for Content Tab Controls
 *
 * Generates responsive CSS targeting Voxel classes within scoped block selector.
 * This file handles ALL Content tab controls that affect block styling.
 *
 * @package VoxelFSE
 */

import type { WorkHoursAttributes } from './types';

/**
 * Helper: Generate typography CSS from TypographyControl value
 */
function generateTypographyCSS(typography: any): string {
	if (!typography) return '';
	let css = '';
	if (typography.fontFamily) css += `font-family: ${typography.fontFamily}; `;
	if (typography.fontSize)
		css += `font-size: ${typography.fontSize}${typography.fontSizeUnit || 'px'}; `;
	if (typography.fontWeight) css += `font-weight: ${typography.fontWeight}; `;
	if (typography.fontStyle) css += `font-style: ${typography.fontStyle}; `;
	if (typography.textTransform) css += `text-transform: ${typography.textTransform}; `;
	if (typography.textDecoration) css += `text-decoration: ${typography.textDecoration}; `;
	if (typography.lineHeight)
		css += `line-height: ${typography.lineHeight}${typography.lineHeightUnit || ''}; `;
	if (typography.letterSpacing)
		css += `letter-spacing: ${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}; `;
	return css;
}

/**
 * Helper: Generate border CSS from BorderGroupControl value
 */
function generateBorderCSS(
	borderType: string | undefined,
	borderWidth: any,
	borderColor: string | undefined
): string {
	if (!borderType || borderType === 'none') return '';

	// Parse border widths (handle empty strings from BorderGroupControl)
	const top = parseFloat(String(borderWidth?.top)) || 0;
	const right = parseFloat(String(borderWidth?.right)) || 0;
	const bottom = parseFloat(String(borderWidth?.bottom)) || 0;
	const left = parseFloat(String(borderWidth?.left)) || 0;

	let css = `border-style: ${borderType}; `;
	css += `border-width: ${top}px ${right}px ${bottom}px ${left}px; `;
	if (borderColor) {
		css += `border-color: ${borderColor}; `;
	}
	return css;
}

/**
 * Helper: Generate padding CSS from ResponsiveDimensionsControl
 * Handles desktop, tablet, and mobile responsive values
 */
function generatePaddingCSS(
	attributes: WorkHoursAttributes,
	prefix: string,
	device: 'desktop' | 'tablet' | 'mobile' = 'desktop'
): string {
	const suffix = device === 'desktop' ? '' : device === 'tablet' ? 'Tablet' : 'Mobile';

	const top = attributes[`${prefix}Top${suffix}` as keyof WorkHoursAttributes] as number;
	const right = attributes[`${prefix}Right${suffix}` as keyof WorkHoursAttributes] as number;
	const bottom = attributes[`${prefix}Bottom${suffix}` as keyof WorkHoursAttributes] as number;
	const left = attributes[`${prefix}Left${suffix}` as keyof WorkHoursAttributes] as number;

	// Only generate CSS if at least one value exists
	if (
		top === undefined &&
		right === undefined &&
		bottom === undefined &&
		left === undefined
	) {
		return '';
	}

	const topVal = top ?? 0;
	const rightVal = right ?? 0;
	const bottomVal = bottom ?? 0;
	const leftVal = left ?? 0;

	return `padding: ${topVal}px ${rightVal}px ${bottomVal}px ${leftVal}px; `;
}

/**
 * Generate responsive CSS for work-hours block
 * Handles all Content tab controls
 */
export function generateWorkHoursResponsiveCSS(
	attributes: WorkHoursAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-work-hours-${blockId}`;

	// ============================================
	// SECTION: General
	// Source: work-hours.php:80-140
	// ============================================

	// Border
	// Verified: work-hours.php:84-95 (uses Group_Control_Border)
	if (attributes.borderType) {
		const borderCSS = generateBorderCSS(
			attributes.borderType,
			attributes.borderWidth,
			attributes.borderColor
		);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-work-hours { ${borderCSS} }`);
		}
	}

	// Border radius (responsive)
	// Verified: work-hours.php:98-111
	if (attributes.borderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-work-hours { border-radius: ${attributes.borderRadius}px; }`
		);
	}
	if (attributes.borderRadiusTablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-work-hours { border-radius: ${attributes.borderRadiusTablet}px; }`
		);
	}
	if (attributes.borderRadiusMobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-work-hours { border-radius: ${attributes.borderRadiusMobile}px; }`
		);
	}

	// Box shadow
	// Verified: work-hours.php:113-122 (uses Group_Control_Box_Shadow)
	if (attributes.boxShadow) {
		cssRules.push(`${selector} .ts-work-hours { box-shadow: ${attributes.boxShadow}; }`);
	}

	// ============================================
	// SECTION: Top Area
	// Source: work-hours.php:125-208
	// ============================================

	// Top background color
	// Verified: work-hours.php:128-134
	if (attributes.topBg) {
		cssRules.push(`${selector} .ts-hours-today { background-color: ${attributes.topBg}; }`);
	}

	// Top background color (tablet)
	if (attributes.topBgTablet) {
		tabletRules.push(
			`${selector} .ts-hours-today { background-color: ${attributes.topBgTablet}; }`
		);
	}

	// Top background color (mobile)
	if (attributes.topBgMobile) {
		mobileRules.push(
			`${selector} .ts-hours-today { background-color: ${attributes.topBgMobile}; }`
		);
	}

	// Top icon size (responsive)
	// Verified: work-hours.php:137-151
	if (attributes.topIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-open-status i { font-size: ${attributes.topIconSize}${attributes.topIconSizeUnit || 'px'}; }`,
			`${selector} .ts-open-status svg { width: ${attributes.topIconSize}${attributes.topIconSizeUnit || 'px'}; height: ${attributes.topIconSize}${attributes.topIconSizeUnit || 'px'}; }`
		);
	}
	if (attributes.topIconSizeTablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-open-status i { font-size: ${attributes.topIconSizeTablet}${attributes.topIconSizeUnit || 'px'}; }`,
			`${selector} .ts-open-status svg { width: ${attributes.topIconSizeTablet}${attributes.topIconSizeUnit || 'px'}; height: ${attributes.topIconSizeTablet}${attributes.topIconSizeUnit || 'px'}; }`
		);
	}
	if (attributes.topIconSizeMobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-open-status i { font-size: ${attributes.topIconSizeMobile}${attributes.topIconSizeUnit || 'px'}; }`,
			`${selector} .ts-open-status svg { width: ${attributes.topIconSizeMobile}${attributes.topIconSizeUnit || 'px'}; height: ${attributes.topIconSizeMobile}${attributes.topIconSizeUnit || 'px'}; }`
		);
	}

	// Label typography
	// Verified: work-hours.php:153-161
	if (attributes.labelTypography) {
		const typographyCSS = generateTypographyCSS(attributes.labelTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-open-status p { ${typographyCSS} }`);
		}
	}

	// Label color
	// Verified: work-hours.php:163-170
	if (attributes.labelColor) {
		cssRules.push(`${selector} .ts-open-status p { color: ${attributes.labelColor}; }`);
	}

	// Current hours typography
	// Verified: work-hours.php:172-182
	if (attributes.currentHoursTypography) {
		const typographyCSS = generateTypographyCSS(attributes.currentHoursTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-hours-today .ts-current-period { ${typographyCSS} }`);
		}
	}

	// Current hours color
	// Verified: work-hours.php:184-192
	if (attributes.currentHoursColor) {
		cssRules.push(
			`${selector} .ts-hours-today .ts-current-period { color: ${attributes.currentHoursColor}; }`
		);
	}

	// Top padding (responsive)
	// Verified: work-hours.php:197-206
	const topPadding = generatePaddingCSS(attributes, 'topPadding', 'desktop');
	if (topPadding) {
		cssRules.push(`${selector} .ts-hours-today { ${topPadding} }`);
	}
	const topPaddingTablet = generatePaddingCSS(attributes, 'topPadding', 'tablet');
	if (topPaddingTablet) {
		tabletRules.push(`${selector} .ts-hours-today { ${topPaddingTablet} }`);
	}
	const topPaddingMobile = generatePaddingCSS(attributes, 'topPadding', 'mobile');
	if (topPaddingMobile) {
		mobileRules.push(`${selector} .ts-hours-today { ${topPaddingMobile} }`);
	}

	// ============================================
	// SECTION: Body
	// Source: work-hours.php:212-293
	// ============================================

	// Body background
	// Verified: work-hours.php:220-228
	if (attributes.bodyBg) {
		cssRules.push(
			`${selector} .ts-work-hours-list ul { background-color: ${attributes.bodyBg}; }`
		);
	}

	// Body separator color
	// Verified: work-hours.php:232-239
	if (attributes.bodySeparatorColor) {
		cssRules.push(
			`${selector} .ts-work-hours-list li { border-color: ${attributes.bodySeparatorColor}; }`
		);
	}

	// Day typography
	// Verified: work-hours.php:243-250
	if (attributes.dayTypography) {
		const typographyCSS = generateTypographyCSS(attributes.dayTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-work-hours-list li p { ${typographyCSS} }`);
		}
	}

	// Day color
	// Verified: work-hours.php:252-259
	if (attributes.dayColor) {
		cssRules.push(`${selector} .ts-work-hours-list li p { color: ${attributes.dayColor}; }`);
	}

	// Hours typography
	// Verified: work-hours.php:263-270
	if (attributes.hoursTypography) {
		const typographyCSS = generateTypographyCSS(attributes.hoursTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-work-hours-list li small { ${typographyCSS} }`);
		}
	}

	// Hours color
	// Verified: work-hours.php:272-279
	if (attributes.hoursColor) {
		cssRules.push(
			`${selector} .ts-work-hours-list li small { color: ${attributes.hoursColor}; }`
		);
	}

	// Body padding (responsive)
	// Verified: work-hours.php:283-292
	const bodyPadding = generatePaddingCSS(attributes, 'bodyPadding', 'desktop');
	if (bodyPadding) {
		cssRules.push(`${selector} .ts-work-hours-list li { ${bodyPadding} }`);
	}
	const bodyPaddingTablet = generatePaddingCSS(attributes, 'bodyPadding', 'tablet');
	if (bodyPaddingTablet) {
		tabletRules.push(`${selector} .ts-work-hours-list li { ${bodyPaddingTablet} }`);
	}
	const bodyPaddingMobile = generatePaddingCSS(attributes, 'bodyPadding', 'mobile');
	if (bodyPaddingMobile) {
		mobileRules.push(`${selector} .ts-work-hours-list li { ${bodyPaddingMobile} }`);
	}

	// ============================================
	// SECTION: Open State
	// Source: work-hours.php:297-346
	// ============================================

	// Open icon color
	// Verified: work-hours.php:323-332 (includes SVG support)
	if (attributes.openIconColor) {
		cssRules.push(
			`${selector} .ts-open-status.open i { color: ${attributes.openIconColor}; }`,
			`${selector} .ts-open-status.open svg { fill: ${attributes.openIconColor}; }`
		);
	}

	// Open text color
	// Verified: work-hours.php:336-343
	if (attributes.openTextColor) {
		cssRules.push(
			`${selector} .ts-open-status.open p { color: ${attributes.openTextColor}; }`
		);
	}

	// ============================================
	// SECTION: Closed State
	// Source: work-hours.php:401-451
	// ============================================

	// Closed icon color
	// Verified: work-hours.php:427-436 (includes SVG support)
	if (attributes.closedIconColor) {
		cssRules.push(
			`${selector} .ts-open-status.closed i { color: ${attributes.closedIconColor}; }`,
			`${selector} .ts-open-status.closed svg { fill: ${attributes.closedIconColor}; }`
		);
	}

	// Closed text color
	// Verified: work-hours.php:440-447
	if (attributes.closedTextColor) {
		cssRules.push(
			`${selector} .ts-open-status.closed p { color: ${attributes.closedTextColor}; }`
		);
	}

	// ============================================
	// SECTION: Appointment Only State
	// Source: work-hours.php:453-503
	// ============================================

	// Appointment icon color
	// Verified: work-hours.php:479-488 (includes SVG support)
	if (attributes.appointmentIconColor) {
		cssRules.push(
			`${selector} .ts-open-status.appt-only i { color: ${attributes.appointmentIconColor}; }`,
			`${selector} .ts-open-status.appt-only svg { fill: ${attributes.appointmentIconColor}; }`
		);
	}

	// Appointment text color
	// Verified: work-hours.php:492-499
	if (attributes.appointmentTextColor) {
		cssRules.push(
			`${selector} .ts-open-status.appt-only p { color: ${attributes.appointmentTextColor}; }`
		);
	}

	// ============================================
	// SECTION: Not Available State
	// Source: work-hours.php:505-555
	// ============================================

	// Not available icon color
	// Verified: work-hours.php:531-540 (includes SVG support)
	if (attributes.notAvailableIconColor) {
		cssRules.push(
			`${selector} .ts-open-status.not-available i { color: ${attributes.notAvailableIconColor}; }`,
			`${selector} .ts-open-status.not-available svg { fill: ${attributes.notAvailableIconColor}; }`
		);
	}

	// Not available text color
	// Verified: work-hours.php:544-551
	if (attributes.notAvailableTextColor) {
		cssRules.push(
			`${selector} .ts-open-status.not-available p { color: ${attributes.notAvailableTextColor}; }`
		);
	}

	// ============================================
	// SECTION: Accordion Button
	// Source: work-hours.php:577-750
	// ============================================

	// Accordion button size (responsive)
	// Verified: work-hours.php:599-620
	if (attributes.accordionButtonSize !== undefined) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller { width: ${attributes.accordionButtonSize}px; height: ${attributes.accordionButtonSize}px; }`
		);
	}

	// Accordion button icon color (normal state)
	// Verified: work-hours.php:622-633 (includes SVG support)
	if (attributes.accordionButtonColor) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller i { color: ${attributes.accordionButtonColor}; }`,
			`${selector} .ts-icon-btn.ts-smaller svg { fill: ${attributes.accordionButtonColor}; }`
		);
	}

	// Accordion button icon size (responsive)
	// Verified: work-hours.php:635-657
	if (attributes.accordionButtonIconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller i { font-size: ${attributes.accordionButtonIconSize}px; }`,
			`${selector} .ts-icon-btn.ts-smaller svg { width: ${attributes.accordionButtonIconSize}px; height: ${attributes.accordionButtonIconSize}px; }`
		);
	}

	// Accordion button background (normal state)
	// Verified: work-hours.php:659-668
	if (attributes.accordionButtonBg) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller { background-color: ${attributes.accordionButtonBg}; }`
		);
	}

	// Accordion button border (normal state)
	// Verified: work-hours.php:670-678
	if (attributes.accordionButtonBorderType) {
		const borderCSS = generateBorderCSS(
			attributes.accordionButtonBorderType,
			attributes.accordionButtonBorderWidth,
			attributes.accordionButtonBorderColor
		);
		if (borderCSS) {
			cssRules.push(`${selector} .ts-icon-btn.ts-smaller { ${borderCSS} }`);
		}
	}

	// Accordion button border radius (responsive)
	// Verified: work-hours.php:680-701
	if (attributes.accordionButtonBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller { border-radius: ${attributes.accordionButtonBorderRadius}px; }`
		);
	}

	// Accordion button icon color (hover state)
	// Verified: work-hours.php:718-729 (includes SVG support)
	if (attributes.accordionButtonColorHover) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller:hover i { color: ${attributes.accordionButtonColorHover}; }`,
			`${selector} .ts-icon-btn.ts-smaller:hover svg { fill: ${attributes.accordionButtonColorHover}; }`
		);
	}

	// Accordion button background (hover state)
	// Verified: work-hours.php:731-740
	if (attributes.accordionButtonBgHover) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller:hover { background-color: ${attributes.accordionButtonBgHover}; }`
		);
	}

	// Accordion button border color (hover state)
	// Verified: work-hours.php:742-749
	if (attributes.accordionButtonBorderColorHover) {
		cssRules.push(
			`${selector} .ts-icon-btn.ts-smaller:hover { border-color: ${attributes.accordionButtonBorderColorHover}; }`
		);
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
