/**
 * Navbar Block - CSS Generation
 *
 * Generates CSS for both Content tab and Style tab controls.
 * Two-layer architecture:
 * - Layer 1: AdvancedTab styles (handled by getAdvancedVoxelTabProps)
 * - Layer 2: Block-specific styles (this file)
 *
 * Evidence-based CSS selectors from Voxel's navbar widget:
 * - Source: themes/voxel/app/widgets/navbar.php
 * - Template: themes/voxel/templates/widgets/navbar.php
 *
 * @package VoxelFSE
 */

import type { NavbarAttributes } from './types';

/**
 * Helper: Generate dimensions CSS (margin, padding)
 */
function generateDimensionsCSS(
	dimensions: Record<string, any> | undefined,
	property: string
): string {
	if (!dimensions) return '';
	const { unit = 'px' } = dimensions;
	// Parse to handle empty strings from DimensionsControl
	const top = parseFloat(String(dimensions.top)) || 0;
	const right = parseFloat(String(dimensions.right)) || 0;
	const bottom = parseFloat(String(dimensions.bottom)) || 0;
	const left = parseFloat(String(dimensions.left)) || 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Helper: Generate typography CSS
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
 * Generate responsive CSS for navbar Content tab controls
 *
 * @param attributes Block attributes
 * @param blockId Unique block ID for scoped selector
 * @returns CSS string with media queries
 */
export function generateNavbarResponsiveCSS(
	attributes: NavbarAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-navbar-${blockId}`;

	// ============================================
	// CONTENT TAB - Settings Accordion
	// Source: navbar.php (Voxel widget)
	// ============================================

	// Orientation & Justify (horizontal mode)
	if (attributes.orientation === 'horizontal') {
		// Desktop justify
		if (attributes.justify) {
			const justifyMap: Record<string, string> = {
				left: 'flex-start',
				center: 'center',
				right: 'flex-end',
				'space-between': 'space-between',
				'space-around': 'space-around',
			};
			const justifyValue = justifyMap[attributes.justify] || 'flex-start';
			cssRules.push(`${selector} .ts-nav { justify-content: ${justifyValue}; }`);
		}

		// Tablet justify
		if (attributes.justify_tablet) {
			const justifyMap: Record<string, string> = {
				left: 'flex-start',
				center: 'center',
				right: 'flex-end',
				'space-between': 'space-between',
				'space-around': 'space-around',
			};
			const justifyValue = justifyMap[attributes.justify_tablet] || 'flex-start';
			tabletRules.push(`${selector} .ts-nav { justify-content: ${justifyValue}; }`);
		}

		// Mobile justify
		if (attributes.justify_mobile) {
			const justifyMap: Record<string, string> = {
				left: 'flex-start',
				center: 'center',
				right: 'flex-end',
				'space-between': 'space-between',
				'space-around': 'space-around',
			};
			const justifyValue = justifyMap[attributes.justify_mobile] || 'flex-start';
			mobileRules.push(`${selector} .ts-nav { justify-content: ${justifyValue}; }`);
		}
	}

	// Collapsible widths (vertical mode only)
	if (attributes.orientation === 'vertical' && attributes.collapsible) {
		// Collapsed width (default state)
		if (attributes.collapsedWidth !== undefined) {
			cssRules.push(`${selector} .ts-nav-collapsed { width: ${attributes.collapsedWidth}px; }`);
		}

		// Expanded width (on hover/interaction)
		if (attributes.expandedWidth !== undefined) {
			cssRules.push(
				`${selector} .ts-nav-collapsed:hover { width: ${attributes.expandedWidth}px; }`,
				`${selector} .ts-nav-collapsed.expanded { width: ${attributes.expandedWidth}px; }`
			);
		}
	}

	// ============================================
	// STYLE TAB - Menu Item (Normal State)
	// Source: navbar.php (ts_menu_item section)
	// ============================================

	// Typography
	if (attributes.typography) {
		const typographyCSS = generateTypographyCSS(attributes.typography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-item-link { ${typographyCSS} }`);
		}
	}

	// Text Color (Normal)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkColor) {
		cssRules.push(`${selector} .ts-item-link { color: ${attributes.linkColor}; }`);
	}

	// Background Color (Normal)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkBg) {
		cssRules.push(
			`${selector} .ts-item-link { background-color: ${attributes.linkBg}; }`
		);
	}

	// Margin (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkMargin) {
		const marginCSS = generateDimensionsCSS(attributes.linkMargin, 'margin');
		if (marginCSS) {
			cssRules.push(`${selector} .ts-item-link { ${marginCSS} }`);
		}
	}
	if (attributes.linkMargin_tablet) {
		const marginCSS = generateDimensionsCSS(attributes.linkMargin_tablet, 'margin');
		if (marginCSS) {
			tabletRules.push(`${selector} .ts-item-link { ${marginCSS} }`);
		}
	}
	if (attributes.linkMargin_mobile) {
		const marginCSS = generateDimensionsCSS(attributes.linkMargin_mobile, 'margin');
		if (marginCSS) {
			mobileRules.push(`${selector} .ts-item-link { ${marginCSS} }`);
		}
	}

	// Padding (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkPadding) {
		const paddingCSS = generateDimensionsCSS(attributes.linkPadding, 'padding');
		if (paddingCSS) {
			cssRules.push(`${selector} .ts-item-link { ${paddingCSS} }`);
		}
	}
	if (attributes.linkPadding_tablet) {
		const paddingCSS = generateDimensionsCSS(attributes.linkPadding_tablet, 'padding');
		if (paddingCSS) {
			tabletRules.push(`${selector} .ts-item-link { ${paddingCSS} }`);
		}
	}
	if (attributes.linkPadding_mobile) {
		const paddingCSS = generateDimensionsCSS(attributes.linkPadding_mobile, 'padding');
		if (paddingCSS) {
			mobileRules.push(`${selector} .ts-item-link { ${paddingCSS} }`);
		}
	}

	// Border Style
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkBorderStyle && attributes.linkBorderStyle !== 'default') {
		if (attributes.linkBorderStyle === 'none') {
			cssRules.push(`${selector} .ts-item-link { border: none; }`);
		} else {
			cssRules.push(
				`${selector} .ts-item-link { border-style: ${attributes.linkBorderStyle}; }`
			);
		}
	}

	// Border Radius (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkBorderRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-item-link { border-radius: ${attributes.linkBorderRadius}px; }`
		);
	}
	if (attributes.linkBorderRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-item-link { border-radius: ${attributes.linkBorderRadius_tablet}px; }`
		);
	}
	if (attributes.linkBorderRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-item-link { border-radius: ${attributes.linkBorderRadius_mobile}px; }`
		);
	}

	// Item Content Gap (gap between icon and text) (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	if (attributes.linkGap !== undefined) {
		cssRules.push(`${selector} .ts-item-link { gap: ${attributes.linkGap}px; }`);
	}
	if (attributes.linkGap_tablet !== undefined) {
		tabletRules.push(`${selector} .ts-item-link { gap: ${attributes.linkGap_tablet}px; }`);
	}
	if (attributes.linkGap_mobile !== undefined) {
		mobileRules.push(`${selector} .ts-item-link { gap: ${attributes.linkGap_mobile}px; }`);
	}

	// ============================================
	// STYLE TAB - Menu Item (Hover State)
	// Source: navbar.php (ts_menu_item hover selectors)
	// ============================================

	// Text Color (Hover)
	// Selector: '{{WRAPPER}} .ts-item-link:hover' (navbar.php)
	if (attributes.linkColorHover) {
		cssRules.push(
			`${selector} .ts-item-link:hover { color: ${attributes.linkColorHover}; }`
		);
	}

	// Background Color (Hover)
	// Selector: '{{WRAPPER}} .ts-item-link:hover' (navbar.php)
	if (attributes.linkBgHover) {
		cssRules.push(
			`${selector} .ts-item-link:hover { background-color: ${attributes.linkBgHover}; }`
		);
	}

	// ============================================
	// STYLE TAB - Menu Item (Active/Current State)
	// Source: navbar.php (ts_menu_item active selectors)
	// ============================================

	// Text Color (Active)
	// Selector: '{{WRAPPER}} .current-menu-item .ts-item-link' (navbar.php)
	if (attributes.linkColorActive) {
		cssRules.push(
			`${selector} .current-menu-item .ts-item-link { color: ${attributes.linkColorActive}; }`
		);
	}

	// Background Color (Active)
	// Selector: '{{WRAPPER}} .current-menu-item .ts-item-link' (navbar.php)
	if (attributes.linkBgActive) {
		cssRules.push(
			`${selector} .current-menu-item .ts-item-link { background-color: ${attributes.linkBgActive}; }`
		);
	}

	// ============================================
	// STYLE TAB - Menu Item Icon
	// Source: navbar.php (ts_menu_icon section)
	// ============================================

	// Icon Container Size (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-icon' (navbar.php)
	if (attributes.iconContainerSize !== undefined) {
		cssRules.push(
			`${selector} .ts-item-icon { width: ${attributes.iconContainerSize}px; height: ${attributes.iconContainerSize}px; }`
		);
	}
	if (attributes.iconContainerSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-item-icon { width: ${attributes.iconContainerSize_tablet}px; height: ${attributes.iconContainerSize_tablet}px; }`
		);
	}
	if (attributes.iconContainerSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-item-icon { width: ${attributes.iconContainerSize_mobile}px; height: ${attributes.iconContainerSize_mobile}px; }`
		);
	}

	// Icon Container Border Radius (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-icon' (navbar.php)
	if (attributes.iconContainerRadius !== undefined) {
		cssRules.push(
			`${selector} .ts-item-icon { border-radius: ${attributes.iconContainerRadius}%; }`
		);
	}
	if (attributes.iconContainerRadius_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-item-icon { border-radius: ${attributes.iconContainerRadius_tablet}%; }`
		);
	}
	if (attributes.iconContainerRadius_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-item-icon { border-radius: ${attributes.iconContainerRadius_mobile}%; }`
		);
	}

	// Icon Container Background (Normal)
	// Selector: '{{WRAPPER}} .ts-item-icon' (navbar.php)
	if (attributes.iconContainerBg) {
		cssRules.push(
			`${selector} .ts-item-icon { background-color: ${attributes.iconContainerBg}; }`
		);
	}

	// Icon Container Background (Hover)
	// Selector: '{{WRAPPER}} .ts-item-link:hover .ts-item-icon' (navbar.php)
	if (attributes.iconContainerBgHover) {
		cssRules.push(
			`${selector} .ts-item-link:hover .ts-item-icon { background-color: ${attributes.iconContainerBgHover}; }`
		);
	}

	// Icon Container Background (Active)
	// Selector: '{{WRAPPER}} .current-menu-item .ts-item-icon' (navbar.php)
	if (attributes.iconContainerBgActive) {
		cssRules.push(
			`${selector} .current-menu-item .ts-item-icon { background-color: ${attributes.iconContainerBgActive}; }`
		);
	}

	// Icon Size (Responsive)
	// Selector: '{{WRAPPER}} .ts-item-icon i, {{WRAPPER}} .ts-item-icon svg' (navbar.php)
	if (attributes.iconSize !== undefined) {
		cssRules.push(
			`${selector} .ts-item-icon i { font-size: ${attributes.iconSize}px; }`
		);
		cssRules.push(`${selector} .ts-item-icon svg { width: ${attributes.iconSize}px; height: ${attributes.iconSize}px; }`);
	}
	if (attributes.iconSize_tablet !== undefined) {
		tabletRules.push(
			`${selector} .ts-item-icon i { font-size: ${attributes.iconSize_tablet}px; }`
		);
		tabletRules.push(
			`${selector} .ts-item-icon svg { width: ${attributes.iconSize_tablet}px; height: ${attributes.iconSize_tablet}px; }`
		);
	}
	if (attributes.iconSize_mobile !== undefined) {
		mobileRules.push(
			`${selector} .ts-item-icon i { font-size: ${attributes.iconSize_mobile}px; }`
		);
		mobileRules.push(
			`${selector} .ts-item-icon svg { width: ${attributes.iconSize_mobile}px; height: ${attributes.iconSize_mobile}px; }`
		);
	}

	// Icon Color (Normal)
	// Selector: '{{WRAPPER}} .ts-item-icon i, {{WRAPPER}} .ts-item-icon svg' (navbar.php)
	if (attributes.iconColor) {
		cssRules.push(`${selector} .ts-item-icon i { color: ${attributes.iconColor}; }`);
		cssRules.push(`${selector} .ts-item-icon svg { fill: ${attributes.iconColor}; }`);
	}

	// Icon Color (Hover)
	// Selector: '{{WRAPPER}} .ts-item-link:hover .ts-item-icon i' (navbar.php)
	if (attributes.iconColorHover) {
		cssRules.push(
			`${selector} .ts-item-link:hover .ts-item-icon i { color: ${attributes.iconColorHover}; }`
		);
		cssRules.push(
			`${selector} .ts-item-link:hover .ts-item-icon svg { fill: ${attributes.iconColorHover}; }`
		);
	}

	// Icon Color (Active)
	// Selector: '{{WRAPPER}} .current-menu-item .ts-item-icon i' (navbar.php)
	if (attributes.iconColorActive) {
		cssRules.push(
			`${selector} .current-menu-item .ts-item-icon i { color: ${attributes.iconColorActive}; }`
		);
		cssRules.push(
			`${selector} .current-menu-item .ts-item-icon svg { fill: ${attributes.iconColorActive}; }`
		);
	}

	// ============================================
	// STYLE TAB - Horizontal Scroll
	// Source: navbar.php (ts_scroll section)
	// ============================================

	// Scroll Background Color
	// Selector: '{{WRAPPER}} .min-scroll' (navbar.php)
	if (attributes.scrollBg) {
		cssRules.push(
			`${selector} .min-scroll { background-color: ${attributes.scrollBg}; }`
		);
	}

	// ============================================
	// STYLE TAB - Chevron
	// Source: navbar.php (ts_chevron section)
	// ============================================

	// Chevron Color
	// Selector: '{{WRAPPER}} .ts-down-icon, {{WRAPPER}} .ts-right-icon' (navbar.php)
	if (attributes.chevronColor) {
		cssRules.push(
			`${selector} .ts-down-icon { border-top-color: ${attributes.chevronColor}; }`
		);
		cssRules.push(
			`${selector} .ts-right-icon { border-left-color: ${attributes.chevronColor}; }`
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
