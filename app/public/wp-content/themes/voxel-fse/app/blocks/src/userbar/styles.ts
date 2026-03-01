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
	// Voxel selector: '{{WRAPPER}} .ts-user-area > ul' => 'grid-gap: {{SIZE}}{{UNIT}};'
	// Note: .ts-user-area is on the block wrapper itself, so we use direct child selector
	if (attributes.itemGap !== undefined) {
		cssRules.push(`${selector} > ul { grid-gap: ${attributes.itemGap}px; }`);
	}
	if (attributes['itemGapTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul { grid-gap: ${attributes['itemGapTablet']}px; }`);
	}
	if (attributes['itemGapMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul { grid-gap: ${attributes['itemGapMobile']}px; }`);
	}

	// ============================================
	// SECTION: Content Tab - Vertical Orientation
	// Source: ContentTab.tsx:100-136 (Settings section)
	// ============================================

	// Desktop vertical orientation
	// Reference: user-bar.php:568-573 - Voxel applies flex-direction to `li > a`, not `ul`
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'flex-direction: column'
	if (attributes.verticalOrientation) {
		cssRules.push(`${selector} > ul > li > a { flex-direction: column; }`);
		// Apply item content align when vertical
		if (attributes.itemContentAlign) {
			cssRules.push(`${selector} > ul > li > a { justify-content: ${attributes.itemContentAlign}; }`);
		}
	}

	// Tablet vertical orientation
	if (attributes.verticalOrientationTablet) {
		tabletRules.push(`${selector} > ul > li > a { flex-direction: column; }`);
		// Apply item content align when vertical
		if (attributes.itemContentAlign) {
			tabletRules.push(`${selector} > ul > li > a { justify-content: ${attributes.itemContentAlign}; }`);
		}
	}

	// Mobile vertical orientation
	if (attributes.verticalOrientationMobile) {
		mobileRules.push(`${selector} > ul > li > a { flex-direction: column; }`);
		// Apply item content align when vertical
		if (attributes.itemContentAlign) {
			mobileRules.push(`${selector} > ul > li > a { justify-content: ${attributes.itemContentAlign}; }`);
		}
	}

	// ============================================
	// SECTION: User Area General - Item Background
	// Source: user-bar.php:608-640
	// ============================================

	// Item background - user-bar.php:613
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'background-color: {{VALUE}}'
	if (attributes.itemBackground) {
		cssRules.push(`${selector} > ul > li > a { background-color: ${attributes.itemBackground}; }`);
	}

	// Item background (hover) - user-bar.php:965
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover' => 'background-color: {{VALUE}}'
	if (attributes.itemBackgroundHover) {
		cssRules.push(`${selector} > ul > li > a:hover { background-color: ${attributes.itemBackgroundHover}; }`);
	}

	// ============================================
	// SECTION: Item Margin & Padding
	// Source: user-bar.php:584-606
	// ============================================

	// Item margin - user-bar.php:584-594
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	if (attributes.itemMargin) {
		const m = attributes.itemMargin;
		// DimensionsControl values already include units (e.g. "10px"), so use them directly.
		// Only fall back to "0" if a side is empty/undefined.
		if (m.top || m.right || m.bottom || m.left) {
			cssRules.push(`${selector} > ul > li > a { margin: ${m.top || '0px'} ${m.right || '0px'} ${m.bottom || '0px'} ${m.left || '0px'}; }`);
		}
	}

	// Item padding - user-bar.php:596-606
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};'
	if (attributes.itemPadding) {
		const p = attributes.itemPadding;
		// DimensionsControl values already include units (e.g. "10px"), so use them directly.
		if (p.top || p.right || p.bottom || p.left) {
			cssRules.push(`${selector} > ul > li > a { padding: ${p.top || '0px'} ${p.right || '0px'} ${p.bottom || '0px'} ${p.left || '0px'}; }`);
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
		cssRules.push(`${selector} > ul > li > a { box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}; }`);
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
		cssRules.push(`${selector} > ul > li > a:hover { box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}; }`);
	}

	// Item border radius - user-bar.php:636
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.itemBorderRadius !== undefined) {
		cssRules.push(`${selector} > ul > li > a { border-radius: ${attributes.itemBorderRadius}px; }`);
	}
	if (attributes['itemBorderRadiusTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li > a { border-radius: ${attributes['itemBorderRadiusTablet']}px; }`);
	}
	if (attributes['itemBorderRadiusMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li > a { border-radius: ${attributes['itemBorderRadiusMobile']}px; }`);
	}

	// ============================================
	// SECTION: User Area General - Item Content Gap
	// Source: user-bar.php:651-669
	// ============================================

	// Item content gap - user-bar.php:665
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a' => 'grid-gap: {{SIZE}}{{UNIT}};'
	if (attributes.itemContentGap !== undefined) {
		cssRules.push(`${selector} > ul > li > a { grid-gap: ${attributes.itemContentGap}px; }`);
	}
	if (attributes['itemContentGapTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li > a { grid-gap: ${attributes['itemContentGapTablet']}px; }`);
	}
	if (attributes['itemContentGapMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li > a { grid-gap: ${attributes['itemContentGapMobile']}px; }`);
	}

	// ============================================
	// SECTION: Icon Container
	// Source: user-bar.php:680-740
	// ============================================

	// Icon container size - user-bar.php:697
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};'
	if (attributes.iconContainerSize !== undefined) {
		cssRules.push(`${selector} > ul > li > a .ts-comp-icon { width: ${attributes.iconContainerSize}px; height: ${attributes.iconContainerSize}px; }`);
	}
	if (attributes['iconContainerSizeTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li > a .ts-comp-icon { width: ${attributes['iconContainerSizeTablet']}px; height: ${attributes['iconContainerSizeTablet']}px; }`);
	}
	if (attributes['iconContainerSizeMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li > a .ts-comp-icon { width: ${attributes['iconContainerSizeMobile']}px; height: ${attributes['iconContainerSizeMobile']}px; }`);
	}

	// Icon container border radius - user-bar.php:724
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.iconContainerRadius !== undefined) {
		cssRules.push(`${selector} > ul > li > a .ts-comp-icon { border-radius: ${attributes.iconContainerRadius}px; }`);
	}
	if (attributes['iconContainerRadiusTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li > a .ts-comp-icon { border-radius: ${attributes['iconContainerRadiusTablet']}px; }`);
	}
	if (attributes['iconContainerRadiusMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li > a .ts-comp-icon { border-radius: ${attributes['iconContainerRadiusMobile']}px; }`);
	}

	// Icon container background - user-bar.php:735
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => 'background-color: {{VALUE}}'
	if (attributes.iconContainerBackground) {
		cssRules.push(`${selector} > ul > li > a .ts-comp-icon { background-color: ${attributes.iconContainerBackground}; }`);
	}

	// Icon container background (hover) - user-bar.php:976
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts-comp-icon' => 'background-color: {{VALUE}}'
	if (attributes.iconContainerBackgroundHover) {
		cssRules.push(`${selector} > ul > li > a:hover .ts-comp-icon { background-color: ${attributes.iconContainerBackgroundHover}; }`);
	}

	// ============================================
	// SECTION: Icon Size & Color
	// Source: user-bar.php:741-770
	// ============================================

	// Icon size - user-bar.php:755
	// Selector: '{{WRAPPER}} .ts-user-area .ts-comp-icon' => '--ts-icon-size: {{SIZE}}{{UNIT}};'
	if (attributes.iconSize !== undefined) {
		cssRules.push(`${selector} > ul > li > a .ts-comp-icon { --ts-icon-size: ${attributes.iconSize}px; }`);
	}
	if (attributes['iconSizeTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li > a .ts-comp-icon { --ts-icon-size: ${attributes['iconSizeTablet']}px; }`);
	}
	if (attributes['iconSizeMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li > a .ts-comp-icon { --ts-icon-size: ${attributes['iconSizeMobile']}px; }`);
	}

	// Icon color - user-bar.php:766
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a .ts-comp-icon' => '--ts-icon-color: {{VALUE}}'
	// Must match Voxel's specificity (.ts-user-area > ul > li > a .ts-comp-icon)
	if (attributes.iconColor) {
		cssRules.push(`${selector} > ul > li > a .ts-comp-icon { --ts-icon-color: ${attributes.iconColor}; }`);
	}

	// Icon color (hover) - user-bar.php:988
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts-comp-icon' => '--ts-icon-color: {{VALUE}}'
	if (attributes.iconColorHover) {
		cssRules.push(`${selector} > ul > li > a:hover .ts-comp-icon { --ts-icon-color: ${attributes.iconColorHover}; }`);
	}

	// ============================================
	// SECTION: Unread Indicator
	// Source: user-bar.php:775-820
	// ============================================

	// Unread indicator color - user-bar.php:780
	// Selector: '{{WRAPPER}} .ts-user-area span.unread-indicator' => 'background: {{VALUE}}'
	if (attributes.unreadIndicatorColor) {
		cssRules.push(`${selector} span.unread-indicator { background: ${attributes.unreadIndicatorColor}; }`);
	}

	// Indicator top margin - user-bar.php:800
	// Selector: '{{WRAPPER}} .ts-user-area span.unread-indicator' => 'top: {{SIZE}}{{UNIT}};'
	if (attributes.unreadIndicatorMargin !== undefined) {
		cssRules.push(`${selector} span.unread-indicator { top: ${attributes.unreadIndicatorMargin}px; }`);
	}
	if (attributes['unreadIndicatorMarginTablet'] !== undefined) {
		tabletRules.push(`${selector} span.unread-indicator { top: ${attributes['unreadIndicatorMarginTablet']}px; }`);
	}
	if (attributes['unreadIndicatorMarginMobile'] !== undefined) {
		mobileRules.push(`${selector} span.unread-indicator { top: ${attributes['unreadIndicatorMarginMobile']}px; }`);
	}

	// Indicator size - user-bar.php:819
	// Selector: '{{WRAPPER}} .ts-user-area span.unread-indicator' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};'
	if (attributes.unreadIndicatorSize !== undefined) {
		cssRules.push(`${selector} span.unread-indicator { width: ${attributes.unreadIndicatorSize}px; height: ${attributes.unreadIndicatorSize}px; }`);
	}
	if (attributes['unreadIndicatorSizeTablet'] !== undefined) {
		tabletRules.push(`${selector} span.unread-indicator { width: ${attributes['unreadIndicatorSizeTablet']}px; height: ${attributes['unreadIndicatorSizeTablet']}px; }`);
	}
	if (attributes['unreadIndicatorSizeMobile'] !== undefined) {
		mobileRules.push(`${selector} span.unread-indicator { width: ${attributes['unreadIndicatorSizeMobile']}px; height: ${attributes['unreadIndicatorSizeMobile']}px; }`);
	}

	// ============================================
	// SECTION: Avatar
	// Source: user-bar.php:830-874
	// ============================================

	// Avatar size - user-bar.php:848
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li.ts-user-area-avatar img' => 'width: {{SIZE}}{{UNIT}}; height: {{SIZE}}{{UNIT}};'
	if (attributes.avatarSize !== undefined) {
		cssRules.push(`${selector} > ul > li.ts-user-area-avatar img { width: ${attributes.avatarSize}px; height: ${attributes.avatarSize}px; }`);
	}
	if (attributes['avatarSizeTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li.ts-user-area-avatar img { width: ${attributes['avatarSizeTablet']}px; height: ${attributes['avatarSizeTablet']}px; }`);
	}
	if (attributes['avatarSizeMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li.ts-user-area-avatar img { width: ${attributes['avatarSizeMobile']}px; height: ${attributes['avatarSizeMobile']}px; }`);
	}

	// Avatar radius - user-bar.php:870
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li.ts-user-area-avatar img' => 'border-radius: {{SIZE}}{{UNIT}};'
	if (attributes.avatarRadius !== undefined) {
		cssRules.push(`${selector} > ul > li.ts-user-area-avatar img { border-radius: ${attributes.avatarRadius}%; }`);
	}
	if (attributes['avatarRadiusTablet'] !== undefined) {
		tabletRules.push(`${selector} > ul > li.ts-user-area-avatar img { border-radius: ${attributes['avatarRadiusTablet']}%; }`);
	}
	if (attributes['avatarRadiusMobile'] !== undefined) {
		mobileRules.push(`${selector} > ul > li.ts-user-area-avatar img { border-radius: ${attributes['avatarRadiusMobile']}%; }`);
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
		// Voxel base CSS defaults .ts_comp_label to display:none, so we must
		// always emit the desktop rule when labelVisibility is true.
		if (item.labelVisibility) {
			// Desktop — always emit (base CSS is display:none)
			cssRules.push(`${itemSelector} .ts_comp_label { display: ${item.labelVisibilityDesktop || 'flex'} !important; }`);
			// Tablet
			if (item.labelVisibilityTablet) {
				tabletRules.push(`${itemSelector} .ts_comp_label { display: ${item.labelVisibilityTablet} !important; }`);
			}
			// Mobile
			if (item.labelVisibilityMobile) {
				mobileRules.push(`${itemSelector} .ts_comp_label { display: ${item.labelVisibilityMobile} !important; }`);
			}
		}

		// Component visibility controls (lines 254-295)
		// Same Elementor pattern: generate CSS for each breakpoint when value differs from default
		if (item.componentVisibility) {
			const compDefault = 'flex';
			// Desktop
			if (item.userBarVisibilityDesktop && item.userBarVisibilityDesktop !== compDefault) {
				cssRules.push(`${itemSelector} { display: ${item.userBarVisibilityDesktop} !important; }`);
			}
			// Tablet — always generate if set
			if (item.userBarVisibilityTablet) {
				tabletRules.push(`${itemSelector} { display: ${item.userBarVisibilityTablet} !important; }`);
			}
			// Mobile — always generate if set
			if (item.userBarVisibilityMobile) {
				mobileRules.push(`${itemSelector} { display: ${item.userBarVisibilityMobile} !important; }`);
			}
		}
	});

	// ============================================
	// SECTION: Item Label (Typography)
	// Source: user-bar.php:876-904
	// ============================================

	// Label typography - user-bar.php:891
	// Selector: '{{WRAPPER}} .ts-user-area .ts_comp_label'
	// Voxel base: `.ts-user-area>ul>li>a .ts_comp_label` = specificity 0-5-0
	// Our selector must match or exceed that specificity to override.
	if (attributes.labelTypography) {
		const typographyCSS = generateTypographyCSS(attributes.labelTypography);
		if (typographyCSS) {
			cssRules.push(`${selector} > ul > li > a .ts_comp_label { ${typographyCSS} }`);
		}
	}

	// Label color - user-bar.php:900
	// Selector must exceed Voxel's `.ts-user-area>ul>li>a .ts_comp_label` (0-5-0)
	if (attributes.labelColor) {
		cssRules.push(`${selector} > ul > li > a .ts_comp_label { color: ${attributes.labelColor}; }`);
	}

	// Label color (hover) - user-bar.php:1000
	// Selector: '{{WRAPPER}} .ts-user-area > ul > li > a:hover .ts_comp_label' => 'color: {{VALUE}}'
	if (attributes.labelColorHover) {
		cssRules.push(`${selector} > ul > li > a:hover .ts_comp_label { color: ${attributes.labelColorHover}; }`);
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
		cssRules.push(`${selector} > ul > li > a:hover .ts-down-icon { border-color: ${attributes.chevronColorHover}; }`);
	}

	// Hide chevron - user-bar.php:937
	// Selector: '{{WRAPPER}} .ts-down-icon' => 'display: none !important;'
	if (attributes.hideChevron) {
		cssRules.push(`${selector} .ts-down-icon { display: none !important; }`);
	}

	// ============================================
	// SECTION: Popup Custom Style
	// Source: user-bar.php:1031-1130
	// Popups are portaled to document.body, so we target via popupScopeClass
	// ============================================

	const popupSelector = `.voxel-popup-userbar-${blockId}`;

	// Popup backdrop color - user-bar.php:1036
	// Selector: '{{WRAPPER}}-wrap > div:after' => 'background-color: {{VALUE}}'
	if (attributes.popupBackdropColor) {
		cssRules.push(`${popupSelector} .ts-popup-root > div::after { background-color: ${attributes.popupBackdropColor} !important; }`);
	}

	// Popup backdrop pointer events - user-bar.php:1049
	// Selector: '{{WRAPPER}}-wrap > div:after' => 'pointer-events: all'
	if (attributes.popupPointerEvents) {
		cssRules.push(`${popupSelector} .ts-popup-root > div::after { pointer-events: all; }`);
	}

	// Popup box shadow - user-bar.php:1059-1066
	// Selector: '{{WRAPPER}} .ts-field-popup'
	if (attributes.popupBoxShadow && Object.keys(attributes.popupBoxShadow).length > 0) {
		const bs = attributes.popupBoxShadow;
		const inset = bs.position === 'inset' ? 'inset ' : '';
		const h = bs.horizontal ?? 0;
		const v = bs.vertical ?? 0;
		const blur = bs.blur ?? 0;
		const spread = bs.spread ?? 0;
		const color = bs.color ?? 'rgba(0,0,0,0.5)';
		cssRules.push(`${popupSelector} .ts-field-popup { box-shadow: ${inset}${h}px ${v}px ${blur}px ${spread}px ${color}; }`);
	}

	// Popup top margin - user-bar.php:1077
	// Selector: '{{WRAPPER}} .ts-field-popup-container' => 'margin: {{SIZE}}{{UNIT}} 0;'
	if (attributes.popupTopMargin) {
		cssRules.push(`${popupSelector} .ts-field-popup-container { margin: ${attributes.popupTopMargin}px 0; }`);
	}
	if (attributes.popupTopMargin_tablet !== undefined) {
		tabletRules.push(`${popupSelector} .ts-field-popup-container { margin: ${attributes.popupTopMargin_tablet}px 0; }`);
	}
	if (attributes.popupTopMargin_mobile !== undefined) {
		mobileRules.push(`${popupSelector} .ts-field-popup-container { margin: ${attributes.popupTopMargin_mobile}px 0; }`);
	}

	// Popup max height - user-bar.php:1098
	// Selector: '{{WRAPPER}} .ts-popup-content-wrapper' => 'max-height: {{SIZE}}{{UNIT}};'
	if (attributes.popupMaxHeight) {
		cssRules.push(`${popupSelector} .ts-popup-content-wrapper { max-height: ${attributes.popupMaxHeight}px; }`);
	}
	if (attributes.popupMaxHeight_tablet !== undefined) {
		tabletRules.push(`${popupSelector} .ts-popup-content-wrapper { max-height: ${attributes.popupMaxHeight_tablet}px; }`);
	}
	if (attributes.popupMaxHeight_mobile !== undefined) {
		mobileRules.push(`${popupSelector} .ts-popup-content-wrapper { max-height: ${attributes.popupMaxHeight_mobile}px; }`);
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
