/**
 * Userbar Block - CSS Generation Functions
 *
 * Generates responsive CSS targeting Voxel classes (.ts-user-area, .ts-comp-icon, etc.)
 * This is Layer 2 CSS (block-specific) that works alongside Layer 1 (AdvancedTab).
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/user-bar.php:550-1050
 * - CSS selectors extracted from Elementor 'selectors' arrays
 *
 * @package VoxelFSE
 */

import type { UserbarAttributes } from './types';

/**
 * Helper: Generate typography CSS from TypographyControl value
 */
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
 * Generate responsive CSS for userbar Style tab controls
 *
 * @param attributes Block attributes
 * @param blockId Unique block ID for scoped selector
 * @returns CSS string with desktop, tablet, and mobile media queries
 */
export function generateUserbarResponsiveCSS(
	attributes: UserbarAttributes,
	blockId: string
): string {
	const cssRules: string[] = [];
	const tabletRules: string[] = [];
	const mobileRules: string[] = [];
	const selector = `.voxel-fse-userbar-${blockId}`;

	// ============================================
	// SECTION: User Area General - Item Gap
	// Source: user-bar.php:564-582
	// ============================================

	// Item gap - user-bar.php:578
	// Selector: '{{WRAPPER}} .ts-user-area > ul' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.itemGap !== undefined) {
		cssRules.push(`${selector} .ts-user-area > ul { grid-gap: ${attributes.itemGap}px; }`);
	}
	if (attributes.itemGapTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area > ul { grid-gap: ${attributes.itemGapTablet}px; }`);
	}
	if (attributes.itemGapMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area > ul { grid-gap: ${attributes.itemGapMobile}px; }`);
	}

	// ============================================
	// SECTION: Content Tab - Vertical Orientation
	// Source: ContentTab.tsx:100-136 (Settings section)
	// ============================================

	// Desktop vertical orientation
	// Reference: user-bar.php:568-573 - Voxel applies flex-direction to `li > a`, not `ul`
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'flex-direction: column'
	if (attributes.verticalOrientation) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a { flex-direction: column; }`);
		// Apply item content align when vertical
		if (attributes.itemContentAlign) {
			cssRules.push(`${selector} .ts-user-area > ul > li > a { justify-content: ${attributes.itemContentAlign}; }`);
		}
	}

	// Tablet vertical orientation
	if (attributes.verticalOrientationTablet) {
		tabletRules.push(`${selector} .ts-user-area > ul > li > a { flex-direction: column; }`);
		// Apply item content align when vertical
		if (attributes.itemContentAlign) {
			tabletRules.push(`${selector} .ts-user-area > ul > li > a { justify-content: ${attributes.itemContentAlign}; }`);
		}
	}

	// Mobile vertical orientation
	if (attributes.verticalOrientationMobile) {
		mobileRules.push(`${selector} .ts-user-area > ul > li > a { flex-direction: column; }`);
		// Apply item content align when vertical
		if (attributes.itemContentAlign) {
			mobileRules.push(`${selector} .ts-user-area > ul > li > a { justify-content: ${attributes.itemContentAlign}; }`);
		}
	}

	// ============================================
	// SECTION: User Area General - Item Background
	// Source: user-bar.php:608-640
	// ============================================

	// Item background - user-bar.php:613
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'background-color: {{VALUE}}'
	if (attributes.itemBackground) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a { background-color: ${attributes.itemBackground}; }`);
	}

	// Item background (hover) - user-bar.php:965
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover' => 'background-color: {{VALUE}}'
	if (attributes.itemBackgroundHover) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a:hover { background-color: ${attributes.itemBackgroundHover}; }`);
	}

	// ============================================
	// SECTION: Item Margin & Padding
	// Source: user-bar.php:584-606
	// ============================================

	// Item margin - user-bar.php:584-594
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	if (attributes.itemMargin) {
		const m = attributes.itemMargin;
		const unit = m.unit || 'px';
		// Only apply if at least one value is set
		if (m.top || m.right || m.bottom || m.left) {
			cssRules.push(`${selector} .ts-user-area > ul > li > a { margin: ${m.top || 0}${unit} ${m.right || 0}${unit} ${m.bottom || 0}${unit} ${m.left || 0}${unit}; }`);
		}
	}

	// Item padding - user-bar.php:596-606
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	if (attributes.itemPadding) {
		const p = attributes.itemPadding;
		const unit = p.unit || 'px';
		// Only apply if at least one value is set
		if (p.top || p.right || p.bottom || p.left) {
			cssRules.push(`${selector} .ts-user-area > ul > li > a { padding: ${p.top || 0}${unit} ${p.right || 0}${unit} ${p.bottom || 0}${unit} ${p.left || 0}${unit}; }`);
		}
	}

	// ============================================
	// SECTION: Item Box Shadow
	// Source: user-bar.php:642-649
	// ============================================

	// Item box shadow - user-bar.php:642-649
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a'
	if (attributes.itemBoxShadow && Object.keys(attributes.itemBoxShadow).length > 0) {
		const bs = attributes.itemBoxShadow;
		const inset = bs.position === 'inset' ? 'inset ' : '';
		const h = bs.horizontal ?? 0;
		const v = bs.vertical ?? 0;
		const blur = bs.blur ?? 0;
		const spread = bs.spread ?? 0;
		const color = bs.color ?? 'rgba(0,0,0,0.5)';
		cssRules.push(`${selector} .ts-user-area > ul > li > a { box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}; }`);
	}

	// Item box shadow (hover) - user-bar.php:1005-1012
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover'
	if (attributes.itemBoxShadowHover && Object.keys(attributes.itemBoxShadowHover).length > 0) {
		const bs = attributes.itemBoxShadowHover;
		const inset = bs.position === 'inset' ? 'inset ' : '';
		const h = bs.horizontal ?? 0;
		const v = bs.vertical ?? 0;
		const blur = bs.blur ?? 0;
		const spread = bs.spread ?? 0;
		const color = bs.color ?? 'rgba(0,0,0,0.5)';
		cssRules.push(`${selector} .ts-user-area > ul > li > a:hover { box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}; }`);
	}

	// Item border radius - user-bar.php:636
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.itemBorderRadius !== undefined) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a { border-radius: ${attributes.itemBorderRadius}px; }`);
	}
	if (attributes.itemBorderRadiusTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area > ul > li > a { border-radius: ${attributes.itemBorderRadiusTablet}px; }`);
	}
	if (attributes.itemBorderRadiusMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area > ul > li > a { border-radius: ${attributes.itemBorderRadiusMobile}px; }`);
	}

	// ============================================
	// SECTION: User Area General - Item Content Gap
	// Source: user-bar.php:651-669
	// ============================================

	// Item content gap - user-bar.php:665
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.itemContentGap !== undefined) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a { grid-gap: ${attributes.itemContentGap}px; }`);
	}
	if (attributes.itemContentGapTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area > ul > li > a { grid-gap: ${attributes.itemContentGapTablet}px; }`);
	}
	if (attributes.itemContentGapMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area > ul > li > a { grid-gap: ${attributes.itemContentGapMobile}px; }`);
	}

	// ============================================
	// SECTION: Icon Container
	// Source: user-bar.php:680-740
	// ============================================

	// Icon container size - user-bar.php:697
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};'
	if (attributes.iconContainerSize !== undefined) {
		cssRules.push(`${selector} .ts-user-area .ts-comp-icon { width: ${attributes.iconContainerSize}px; height: ${attributes.iconContainerSize}px; }`);
	}
	if (attributes.iconContainerSizeTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area .ts-comp-icon { width: ${attributes.iconContainerSizeTablet}px; height: ${attributes.iconContainerSizeTablet}px; }`);
	}
	if (attributes.iconContainerSizeMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area .ts-comp-icon { width: ${attributes.iconContainerSizeMobile}px; height: ${attributes.iconContainerSizeMobile}px; }`);
	}

	// Icon container border radius - user-bar.php:724
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.iconContainerRadius !== undefined) {
		cssRules.push(`${selector} .ts-user-area .ts-comp-icon { border-radius: ${attributes.iconContainerRadius}px; }`);
	}
	if (attributes.iconContainerRadiusTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area .ts-comp-icon { border-radius: ${attributes.iconContainerRadiusTablet}px; }`);
	}
	if (attributes.iconContainerRadiusMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area .ts-comp-icon { border-radius: ${attributes.iconContainerRadiusMobile}px; }`);
	}

	// Icon container background - user-bar.php:735
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => 'background-color: {{VALUE}}'
	if (attributes.iconContainerBackground) {
		cssRules.push(`${selector} .ts-user-area .ts-comp-icon { background-color: ${attributes.iconContainerBackground}; }`);
	}

	// Icon container background (hover) - user-bar.php:976
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts-comp-icon' => 'background-color: {{VALUE}}'
	if (attributes.iconContainerBackgroundHover) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a:hover .ts-comp-icon { background-color: ${attributes.iconContainerBackgroundHover}; }`);
	}

	// ============================================
	// SECTION: Icon Size & Color
	// Source: user-bar.php:741-770
	// ============================================

	// Icon size - user-bar.php:755
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => '--ts-icon-size: {{SIZE}}{{UNIT}};'
	if (attributes.iconSize !== undefined) {
		cssRules.push(`${selector} .ts-user-area .ts-comp-icon { --ts-icon-size: ${attributes.iconSize}px; }`);
	}
	if (attributes.iconSizeTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area .ts-comp-icon { --ts-icon-size: ${attributes.iconSizeTablet}px; }`);
	}
	if (attributes.iconSizeMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area .ts-comp-icon { --ts-icon-size: ${attributes.iconSizeMobile}px; }`);
	}

	// Icon color - user-bar.php:766
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => '--ts-icon-color: {{VALUE}}'
	if (attributes.iconColor) {
		cssRules.push(`${selector} .ts-user-area .ts-comp-icon { --ts-icon-color: ${attributes.iconColor}; }`);
	}

	// Icon color (hover) - user-bar.php:988
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts-comp-icon' => '--ts-icon-color: {{VALUE}}'
	if (attributes.iconColorHover) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a:hover .ts-comp-icon { --ts-icon-color: ${attributes.iconColorHover}; }`);
	}

	// ============================================
	// SECTION: Unread Indicator
	// Source: user-bar.php:775-820
	// ============================================

	// Unread indicator color - user-bar.php:780
	// Selector: '{{WRAPPER}} .ts-user-area span.unread-indicator' => 'background: {{VALUE}}'
	if (attributes.unreadIndicatorColor) {
		cssRules.push(`${selector} .ts-user-area span.unread-indicator { background: ${attributes.unreadIndicatorColor}; }`);
	}

	// Indicator top margin - user-bar.php:800
	// Selector: '{{WRAPPER}} .ts-user-area span.unread-indicator' => 'top: {{SIZE}}{{UNIT}};'
	if (attributes.unreadIndicatorMargin !== undefined) {
		cssRules.push(`${selector} .ts-user-area span.unread-indicator { top: ${attributes.unreadIndicatorMargin}px; }`);
	}
	if (attributes.unreadIndicatorMarginTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area span.unread-indicator { top: ${attributes.unreadIndicatorMarginTablet}px; }`);
	}
	if (attributes.unreadIndicatorMarginMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area span.unread-indicator { top: ${attributes.unreadIndicatorMarginMobile}px; }`);
	}

	// Indicator size - user-bar.php:819
	// Selector: '{{WRAPPER}} .ts-user-area span.unread-indicator' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};'
	if (attributes.unreadIndicatorSize !== undefined) {
		cssRules.push(`${selector} .ts-user-area span.unread-indicator { width: ${attributes.unreadIndicatorSize}px; height: ${attributes.unreadIndicatorSize}px; }`);
	}
	if (attributes.unreadIndicatorSizeTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area span.unread-indicator { width: ${attributes.unreadIndicatorSizeTablet}px; height: ${attributes.unreadIndicatorSizeTablet}px; }`);
	}
	if (attributes.unreadIndicatorSizeMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area span.unread-indicator { width: ${attributes.unreadIndicatorSizeMobile}px; height: ${attributes.unreadIndicatorSizeMobile}px; }`);
	}

	// ============================================
	// SECTION: Avatar
	// Source: user-bar.php:830-874
	// ============================================

	// Avatar size - user-bar.php:848
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li.ts-user-area-avatar img' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};'
	if (attributes.avatarSize !== undefined) {
		cssRules.push(`${selector} .ts-user-area > ul > li.ts-user-area-avatar img { width: ${attributes.avatarSize}px; height: ${attributes.avatarSize}px; }`);
	}
	if (attributes.avatarSizeTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area > ul > li.ts-user-area-avatar img { width: ${attributes.avatarSizeTablet}px; height: ${attributes.avatarSizeTablet}px; }`);
	}
	if (attributes.avatarSizeMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area > ul > li.ts-user-area-avatar img { width: ${attributes.avatarSizeMobile}px; height: ${attributes.avatarSizeMobile}px; }`);
	}

	// Avatar radius - user-bar.php:870
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li.ts-user-area-avatar img' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.avatarRadius !== undefined) {
		cssRules.push(`${selector} .ts-user-area > ul > li.ts-user-area-avatar img { border-radius: ${attributes.avatarRadius}%; }`);
	}
	if (attributes.avatarRadiusTablet !== undefined) {
		tabletRules.push(`${selector} .ts-user-area > ul > li.ts-user-area-avatar img { border-radius: ${attributes.avatarRadiusTablet}%; }`);
	}
	if (attributes.avatarRadiusMobile !== undefined) {
		mobileRules.push(`${selector} .ts-user-area > ul > li.ts-user-area-avatar img { border-radius: ${attributes.avatarRadiusMobile}%; }`);
	}

	// ============================================
	// SECTION: Content Tab - Per-Item Responsive Visibility
	// Source: ContentTab.tsx:220-295 (Label visibility + Component visibility)
	// ============================================

	// Generate responsive visibility CSS for each repeater item
	attributes.items?.forEach((item: any) => {
		if (!item._id) return;
		const itemSelector = `${selector} .elementor-repeater-item-${item._id}`;

		// Label visibility controls (lines 220-250)
		if (item.labelVisibility) {
			// Desktop
			if (item.labelVisibilityDesktop === 'none') {
				cssRules.push(`${itemSelector} .ts_comp_label { display: none; }`);
			}
			// Tablet
			if (item.labelVisibilityTablet === 'none') {
				tabletRules.push(`${itemSelector} .ts_comp_label { display: none; }`);
			} else if (item.labelVisibilityTablet === 'flex' && item.labelVisibilityDesktop === 'none') {
				// Override desktop 'none' on tablet
				tabletRules.push(`${itemSelector} .ts_comp_label { display: flex; }`);
			}
			// Mobile
			if (item.labelVisibilityMobile === 'none') {
				mobileRules.push(`${itemSelector} .ts_comp_label { display: none; }`);
			} else if (item.labelVisibilityMobile === 'flex' && (item.labelVisibilityDesktop === 'none' || item.labelVisibilityTablet === 'none')) {
				// Override desktop/tablet 'none' on mobile
				mobileRules.push(`${itemSelector} .ts_comp_label { display: flex; }`);
			}
		}

		// Component visibility controls (lines 254-295)
		if (item.componentVisibility) {
			// Desktop
			if (item.userBarVisibilityDesktop === 'none') {
				cssRules.push(`${itemSelector} { display: none !important; }`);
			}
			// Tablet
			if (item.userBarVisibilityTablet === 'none') {
				tabletRules.push(`${itemSelector} { display: none !important; }`);
			} else if (item.userBarVisibilityTablet === 'flex' && item.userBarVisibilityDesktop === 'none') {
				// Override desktop 'none' on tablet
				tabletRules.push(`${itemSelector} { display: flex !important; }`);
			}
			// Mobile
			if (item.userBarVisibilityMobile === 'none') {
				mobileRules.push(`${itemSelector} { display: none !important; }`);
			} else if (item.userBarVisibilityMobile === 'flex' && (item.userBarVisibilityDesktop === 'none' || item.userBarVisibilityTablet === 'none')) {
				// Override desktop/tablet 'none' on mobile
				mobileRules.push(`${itemSelector} { display: flex !important; }`);
			}
		}
	});

	// ============================================
	// SECTION: Item Label (Typography)
	// Source: user-bar.php:876-904
	// ============================================

	// Label typography - user-bar.php:891
	// Selector: '{{WRAPPER}} .ts-user-area .ts_comp_label'
	if (attributes.labelTypography) {
		const typographyCSS = generateTypographyCSS(attributes.labelTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} .ts-user-area .ts_comp_label { ${typographyCSS} }`);
		}
	}

	// Label color - user-bar.php:900
	// Selector: '{{WRAPPER}} .ts-user-area .ts_comp_label' => 'color: {{VALUE}}'
	if (attributes.labelColor) {
		cssRules.push(`${selector} .ts-user-area .ts_comp_label { color: ${attributes.labelColor}; }`);
	}

	// Label color (hover) - user-bar.php:1000
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts_comp_label' => 'color: {{VALUE}}'
	if (attributes.labelColorHover) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a:hover .ts_comp_label { color: ${attributes.labelColorHover}; }`);
	}

	// ============================================
	// SECTION: Chevron
	// Source: user-bar.php:907-941
	// ============================================

	// Chevron color - user-bar.php:921
	// Selector: '{{WRAPPER}} .ts-down-icon' => 'border-color: {{VALUE}}'
	if (attributes.chevronColor) {
		cssRules.push(`${selector} .ts-down-icon { border-color: ${attributes.chevronColor}; }`);
	}

	// Chevron color (hover) - user-bar.php:1019
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts-down-icon' => 'border-color: {{VALUE}}'
	if (attributes.chevronColorHover) {
		cssRules.push(`${selector} .ts-user-area > ul > li > a:hover .ts-down-icon { border-color: ${attributes.chevronColorHover}; }`);
	}

	// Hide chevron - user-bar.php:937
	// Selector: '{{WRAPPER}} .ts-down-icon' => 'display: none !important;'
	if (attributes.hideChevron) {
		cssRules.push(`${selector} .ts-down-icon { display: none !important; }`);
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
