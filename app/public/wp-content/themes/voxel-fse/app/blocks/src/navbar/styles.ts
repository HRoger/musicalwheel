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
	// If all values are empty/unset, return nothing (don't emit 0px defaults)
	const hasTop = dimensions['top'] !== undefined && dimensions['top'] !== '' && dimensions['top'] !== null;
	const hasRight = dimensions['right'] !== undefined && dimensions['right'] !== '' && dimensions['right'] !== null;
	const hasBottom = dimensions['bottom'] !== undefined && dimensions['bottom'] !== '' && dimensions['bottom'] !== null;
	const hasLeft = dimensions['left'] !== undefined && dimensions['left'] !== '' && dimensions['left'] !== null;
	if (!hasTop && !hasRight && !hasBottom && !hasLeft) return '';
	const { unit = 'px' } = dimensions;
	const top = hasTop ? parseFloat(String(dimensions['top'])) : 0;
	const right = hasRight ? parseFloat(String(dimensions['right'])) : 0;
	const bottom = hasBottom ? parseFloat(String(dimensions['bottom'])) : 0;
	const left = hasLeft ? parseFloat(String(dimensions['left'])) : 0;
	return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit};`;
}

/**
 * Helper: Generate border CSS from BorderGroupControl value
 */
function generateBorderCSS(
	borderType: string | undefined,
	borderWidth: Record<string, any> | undefined,
	borderColor: string | undefined
): string {
	if (!borderType || borderType === '' || borderType === 'default') return '';

	if (borderType === 'none') {
		return 'border: none;';
	}

	let css = `border-style: ${borderType}; `;

	// Border width
	if (borderWidth) {
		const { unit = 'px' } = borderWidth;
		const top = parseFloat(String(borderWidth['top'])) || 0;
		const right = parseFloat(String(borderWidth['right'])) || 0;
		const bottom = parseFloat(String(borderWidth['bottom'])) || 0;
		const left = parseFloat(String(borderWidth['left'])) || 0;
		css += `border-width: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}; `;
	}

	// Border color
	if (borderColor) {
		css += `border-color: ${borderColor}; `;
	}

	return css;
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
	// CONTENT TAB - Hamburger Menu Visibility
	// Source: navbar.php show_burger_desktop / show_burger_tablet
	// Voxel: (desktop){{WRAPPER}} .ts-mobile-menu { display: flex; }
	//        (desktop){{WRAPPER}} .ts-wp-menu .menu-item { display: none; }
	// ============================================

	// Show hamburger on desktop (hide regular menu items)
	// Voxel hides with `.ts-nav-menu > ul > li.ts-mobile-menu { display: none }` (specificity 0-4-0)
	// Our selector must exceed that specificity to override.
	if (attributes.showBurgerDesktop) {
		cssRules.push(`${selector} .ts-nav-menu > ul > li.ts-mobile-menu { display: flex; }`);
		cssRules.push(`${selector} .ts-wp-menu .menu-item:not(.ts-mobile-menu) { display: none; }`);
	}

	// Show hamburger on tablet & mobile (hide regular menu items)
	if (attributes.showBurgerTablet) {
		tabletRules.push(`${selector} .ts-nav-menu > ul > li.ts-mobile-menu { display: flex; }`);
		tabletRules.push(`${selector} .ts-wp-menu .menu-item:not(.ts-mobile-menu) { display: none; }`);
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

	// Border (Type, Width, Color)
	// Selector: '{{WRAPPER}} .ts-item-link' (navbar.php)
	const borderCSS = generateBorderCSS(
		attributes.linkBorderStyle,
		attributes.linkBorderWidth,
		attributes.linkBorderColor
	);
	if (borderCSS) {
		cssRules.push(`${selector} .ts-item-link { ${borderCSS} }`);
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

	// Icon on top (flex-direction: column)
	// Source: navbar.php 'action_icon_orient' => '{{WRAPPER}} .ts-item-link' => 'flex-direction: column;'
	if (attributes.iconOnTop) {
		cssRules.push(`${selector} .ts-item-link { flex-direction: column; }`);
		cssRules.push(`${selector} .ts-down-icon { display: none; }`);
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
	// STYLE TAB - Popups: Custom style
	// Source: navbar.php (custom_popup_enable section)
	// Popups are portaled to document.body, so we target via popupScopeClass
	// ============================================

	if (attributes.customPopupEnabled) {
		const popupSelector = `.voxel-popup-navbar-${blockId}`;

		// Backdrop background color
		// Selector: '{{WRAPPER}}-wrap > div:after' => 'background-color'
		if (attributes.popupBackdropBackground) {
			cssRules.push(
				`${popupSelector} .ts-popup-root > div::after { background-color: ${attributes.popupBackdropBackground} !important; }`
			);
		}

		// Backdrop pointer events
		// Selector: '{{WRAPPER}}-wrap > div:after' => 'pointer-events: all'
		if (attributes.popupBackdropPointerEvents) {
			cssRules.push(
				`${popupSelector} .ts-popup-root > div::after { pointer-events: all; }`
			);
		}

		// Box shadow
		// Selector: '{{WRAPPER}} .ts-field-popup'
		if (attributes.popupBoxShadow && Object.keys(attributes.popupBoxShadow).length > 0) {
			const bs = attributes.popupBoxShadow;
			const inset = bs.position === 'inset' ? 'inset ' : '';
			const h = bs.horizontal ?? 0;
			const v = bs.vertical ?? 0;
			const blur = bs.blur ?? 0;
			const spread = bs.spread ?? 0;
			const color = bs.color ?? 'rgba(0,0,0,0.5)';
			cssRules.push(
				`${popupSelector} .ts-field-popup { box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}; }`
			);
		}

		// Top / Bottom margin (Responsive)
		// Selector: '{{WRAPPER}} .ts-field-popup-container' => 'margin: {{SIZE}}{{UNIT}} 0'
		if (attributes.popupTopBottomMargin !== undefined) {
			cssRules.push(
				`${popupSelector} .ts-field-popup-container { margin: ${attributes.popupTopBottomMargin}px 0; }`
			);
		}
		if ((attributes as any).popupTopBottomMargin_tablet !== undefined) {
			tabletRules.push(
				`${popupSelector} .ts-field-popup-container { margin: ${(attributes as any).popupTopBottomMargin_tablet}px 0; }`
			);
		}
		if ((attributes as any).popupTopBottomMargin_mobile !== undefined) {
			mobileRules.push(
				`${popupSelector} .ts-field-popup-container { margin: ${(attributes as any).popupTopBottomMargin_mobile}px 0; }`
			);
		}

		// Min width (Responsive)
		// Selector: '{{WRAPPER}} .ts-field-popup' => 'min-width'
		if (attributes.popupMinWidth !== undefined) {
			cssRules.push(
				`${popupSelector} .ts-field-popup { min-width: ${attributes.popupMinWidth}px; }`
			);
		}
		if ((attributes as any).popupMinWidth_tablet !== undefined) {
			tabletRules.push(
				`${popupSelector} .ts-field-popup { min-width: ${(attributes as any).popupMinWidth_tablet}px; }`
			);
		}
		if ((attributes as any).popupMinWidth_mobile !== undefined) {
			mobileRules.push(
				`${popupSelector} .ts-field-popup { min-width: ${(attributes as any).popupMinWidth_mobile}px; }`
			);
		}

		// Max width (Responsive)
		// Selector: '{{WRAPPER}} .ts-field-popup' => 'max-width'
		if (attributes.popupMaxWidth !== undefined) {
			cssRules.push(
				`${popupSelector} .ts-field-popup { max-width: ${attributes.popupMaxWidth}px; }`
			);
		}
		if ((attributes as any).popupMaxWidth_tablet !== undefined) {
			tabletRules.push(
				`${popupSelector} .ts-field-popup { max-width: ${(attributes as any).popupMaxWidth_tablet}px; }`
			);
		}
		if ((attributes as any).popupMaxWidth_mobile !== undefined) {
			mobileRules.push(
				`${popupSelector} .ts-field-popup { max-width: ${(attributes as any).popupMaxWidth_mobile}px; }`
			);
		}

		// Max height (Responsive)
		// Selector: '{{WRAPPER}} .ts-popup-content-wrapper' => 'max-height'
		if (attributes.popupMaxHeight !== undefined) {
			cssRules.push(
				`${popupSelector} .ts-popup-content-wrapper { max-height: ${attributes.popupMaxHeight}px; }`
			);
		}
		if ((attributes as any).popupMaxHeight_tablet !== undefined) {
			tabletRules.push(
				`${popupSelector} .ts-popup-content-wrapper { max-height: ${(attributes as any).popupMaxHeight_tablet}px; }`
			);
		}
		if ((attributes as any).popupMaxHeight_mobile !== undefined) {
			mobileRules.push(
				`${popupSelector} .ts-popup-content-wrapper { max-height: ${(attributes as any).popupMaxHeight_mobile}px; }`
			);
		}

		// Multi column menu
		// Selector: '{{WRAPPER}} .ts-term-dropdown-list' => 'grid-template-columns: repeat(N, minmax(0, 1fr)); display: grid;'
		if (attributes.multiColumnMenu && attributes.menuColumns > 1) {
			cssRules.push(
				`${popupSelector} .ts-term-dropdown-list { display: grid; grid-template-columns: repeat(${attributes.menuColumns}, minmax(0, 1fr)); }`
			);
		}
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
