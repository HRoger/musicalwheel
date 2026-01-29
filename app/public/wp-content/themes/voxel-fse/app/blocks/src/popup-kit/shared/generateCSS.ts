/**
 * Popup Kit CSS Generation
 * 
 * Generates global CSS from block attributes that applies to ALL popups sitewide.
 * This matches the functionality of Voxel's popup-kit widget render.php.
 * 
 * Evidence: themes/voxel/app/blocks/src/_popup-kit_old/render.php:1-2000
 * 
 * @package VoxelFSE
 */

import type { PopupKitAttributes } from '../types';

/**
 * Generate complete CSS from popup-kit attributes
 * 
 * @param attributes Block attributes
 * @returns CSS string to be injected globally
 */
export function generatePopupKitCSS(attributes: PopupKitAttributes): string {
    let css = '';

    // Extract common values
    const elementorAccent = attributes.elementorAccent || '#E8315F';
    const elementorPrimary = attributes.elementorPrimary || '#313135';
    const elementorText = attributes.elementorText || '#313135';
    const elementorFontFamily = attributes.elementorFontFamily ||
        'var(--wp--preset--font-family--system, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif)';

    const tsAccent1 = attributes.tsAccent1 || elementorAccent;
    const tsAccent2 = attributes.tsAccent2 || elementorAccent;

    // CSS Variables (global)
    css += ':root, .editor-styles-wrapper {\n';
    css += `  --e-global-color-accent: ${elementorAccent};\n`;
    css += `  --e-global-color-primary: ${elementorPrimary};\n`;
    css += `  --e-global-color-text: ${elementorText};\n`;
    css += `  --e-global-typography-text-font-family: ${elementorFontFamily};\n`;
    css += '}\n';

    css += '.elementor-kit-3, .voxel-fse-kit {\n';
    css += `  --e-global-color-accent: ${elementorAccent};\n`;
    css += `  --e-global-color-primary: ${elementorPrimary};\n`;
    css += `  --e-global-color-text: ${elementorText};\n`;
    css += `  --e-global-typography-text-font-family: ${elementorFontFamily};\n`;
    css += '}\n';

    // Editor preview wrapper
    css += '.voxel-fse-popup-kit-editor, .voxel-fse-popup-kit-editor * {\n';
    css += `  --ts-accent-1: ${tsAccent1};\n`;
    css += `  --ts-accent-2: ${tsAccent2};\n`;
    css += '}\n';

    // Override WordPress Global Styles link underline
    css += '.editor-styles-wrapper a:where(:not(.wp-element-button)) { text-decoration: none; }\n';

    // ========================================================================
    // POPUP: GENERAL STYLES
    // ========================================================================

    if (attributes.pgBackground) {
        css += `.ts-field-popup, .ts-sticky-top { background-color: ${attributes.pgBackground}; }\n`;
    }

    // Top/Bottom margin - responsive
    const topMarginDesktop = attributes.pgTopMargin || 0;
    const topMarginTablet = attributes.pgTopMargin_tablet;
    const topMarginMobile = attributes.pgTopMargin_mobile;

    if (topMarginDesktop > 0) {
        css += `.ts-field-popup-container { margin: ${topMarginDesktop}px 0; }\n`;
    }
    if (topMarginTablet !== undefined && topMarginTablet !== topMarginDesktop) {
        css += `@media (max-width: 1024px) { .ts-field-popup-container { margin: ${topMarginTablet}px 0; } }\n`;
    }
    if (topMarginMobile !== undefined && topMarginMobile !== topMarginTablet && topMarginMobile !== topMarginDesktop) {
        css += `@media (max-width: 768px) { .ts-field-popup-container { margin: ${topMarginMobile}px 0; } }\n`;
    }

    // Box Shadow
    if (attributes.pgShadow) {
        const shadow = attributes.pgShadow;
        const horizontal = shadow.horizontal || 0;
        const vertical = shadow.vertical || 0;
        const blur = shadow.blur || 10;
        const spread = shadow.spread || 0;
        const color = shadow.color || 'rgba(0,0,0,0.5)';
        const position = shadow.position === 'inset' ? 'inset' : '';

        let boxShadow = `${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
        if (position) {
            boxShadow = `${position} ${boxShadow}`;
        }
        css += `.ts-field-popup { box-shadow: ${boxShadow}; }\n`;
    }

    // Border
    if (attributes.pgBorder) {
        const border = attributes.pgBorder;
        const borderType = border.type || 'default';

        if (borderType !== 'default' && borderType !== 'none') {
            const borderWidth = border.width || 1;
            const borderColor = border.color || '#000000';
            css += `.ts-field-popup { border-style: ${borderType}; border-width: ${borderWidth}px; border-color: ${borderColor}; }\n`;
        } else if (borderType === 'none') {
            css += '.ts-field-popup { border: none; }\n';
        }
    }

    // Border radius - responsive
    const radiusDesktop = attributes.pgRadius || 0;
    const radiusTablet = attributes.pgRadius_tablet;
    const radiusMobile = attributes.pgRadius_mobile;

    if (radiusDesktop > 0) {
        css += `.ts-field-popup { border-radius: ${radiusDesktop}px; }\n`;
    }
    if (radiusTablet !== undefined && radiusTablet !== radiusDesktop) {
        css += `@media (max-width: 1024px) { .ts-field-popup { border-radius: ${radiusTablet}px; } }\n`;
    }
    if (radiusMobile !== undefined && radiusMobile !== radiusTablet && radiusMobile !== radiusDesktop) {
        css += `@media (max-width: 768px) { .ts-field-popup { border-radius: ${radiusMobile}px; } }\n`;
    }

    if (attributes.pgScrollColor) {
        css += `.ts-field-popup .min-scroll { --ts-scroll-color: ${attributes.pgScrollColor}; }\n`;
    }

    if (attributes.disableRevealFx) {
        css += '.ts-field-popup { animation: unset !important; opacity: 1 !important; }\n';
    }

    if (attributes.pgTitleSeparator) {
        css += `.ts-popup-head, .ts-field-popup .ts-popup-controller, .ts-field-popup .uib, .ts-cart-controller { border-color: ${attributes.pgTitleSeparator}; }\n`;
    }

    // ========================================================================
    // POPUP: HEAD STYLES
    // ========================================================================

    // Icon size - responsive
    const iconSizeDesktop = attributes.phIconSize;
    const iconSizeTablet = attributes.phIconSize_tablet;
    const iconSizeMobile = attributes.phIconSize_mobile;

    if (iconSizeDesktop) {
        css += `.ts-popup-name { --ts-icon-size: ${iconSizeDesktop}px; }\n`;
    }
    if (iconSizeTablet !== undefined && iconSizeTablet !== iconSizeDesktop) {
        css += `@media (max-width: 1024px) { .ts-popup-name { --ts-icon-size: ${iconSizeTablet}px; } }\n`;
    }
    if (iconSizeMobile !== undefined && iconSizeMobile !== iconSizeTablet && iconSizeMobile !== iconSizeDesktop) {
        css += `@media (max-width: 768px) { .ts-popup-name { --ts-icon-size: ${iconSizeMobile}px; } }\n`;
    }

    // Icon/Text spacing - responsive
    const iconSpacingDesktop = attributes.phIconSpacing;
    const iconSpacingTablet = attributes.phIconSpacing_tablet;
    const iconSpacingMobile = attributes.phIconSpacing_mobile;

    if (iconSpacingDesktop) {
        css += `.ts-popup-head .ts-popup-name { grid-gap: ${iconSpacingDesktop}px; }\n`;
    }
    if (iconSpacingTablet !== undefined && iconSpacingTablet !== iconSpacingDesktop) {
        css += `@media (max-width: 1024px) { .ts-popup-head .ts-popup-name { grid-gap: ${iconSpacingTablet}px; } }\n`;
    }
    if (iconSpacingMobile !== undefined && iconSpacingMobile !== iconSpacingTablet && iconSpacingMobile !== iconSpacingDesktop) {
        css += `@media (max-width: 768px) { .ts-popup-head .ts-popup-name { grid-gap: ${iconSpacingMobile}px; } }\n`;
    }

    // Icon color
    if (attributes.phIconColor) {
        css += `.ts-popup-name { --ts-icon-color: ${attributes.phIconColor}; }\n`;
    }

    // Title color
    if (attributes.phTitleColor) {
        css += `.ts-popup-name > span, .ts-popup-name > span a { color: ${attributes.phTitleColor}; }\n`;
    }

    // Title typography
    const titleTypo: string[] = [];
    if (attributes.phTitleFontFamily) {
        titleTypo.push(`font-family: ${attributes.phTitleFontFamily};`);
    }
    if (attributes.phTitleFontSize) {
        const fontSize = typeof attributes.phTitleFontSize === 'object'
            ? attributes.phTitleFontSize.desktop
            : attributes.phTitleFontSize;
        if (fontSize) {
            titleTypo.push(`font-size: ${fontSize};`);
        }
    }
    if (attributes.phTitleFontWeight) {
        titleTypo.push(`font-weight: ${attributes.phTitleFontWeight};`);
    }
    if (attributes.phTitleLineHeight) {
        const lineHeight = typeof attributes.phTitleLineHeight === 'object'
            ? attributes.phTitleLineHeight.desktop
            : attributes.phTitleLineHeight;
        if (lineHeight) {
            titleTypo.push(`line-height: ${lineHeight};`);
        }
    }
    if (titleTypo.length > 0) {
        css += `.ts-popup-name > span { ${titleTypo.join(' ')} }\n`;
    }

    // Avatar size - responsive
    const avatarSizeDesktop = attributes.phAvatarSize;
    const avatarSizeTablet = attributes.phAvatarSize_tablet;
    const avatarSizeMobile = attributes.phAvatarSize_mobile;

    if (avatarSizeDesktop) {
        css += `.ts-popup-head .ts-popup-name img { min-width: ${avatarSizeDesktop}px; width: ${avatarSizeDesktop}px; height: ${avatarSizeDesktop}px; }\n`;
    }
    if (avatarSizeTablet !== undefined && avatarSizeTablet !== avatarSizeDesktop) {
        css += `@media (max-width: 1024px) { .ts-popup-head .ts-popup-name img { min-width: ${avatarSizeTablet}px; width: ${avatarSizeTablet}px; height: ${avatarSizeTablet}px; } }\n`;
    }
    if (avatarSizeMobile !== undefined && avatarSizeMobile !== avatarSizeTablet && avatarSizeMobile !== avatarSizeDesktop) {
        css += `@media (max-width: 768px) { .ts-popup-head .ts-popup-name img { min-width: ${avatarSizeMobile}px; width: ${avatarSizeMobile}px; height: ${avatarSizeMobile}px; } }\n`;
    }

    // Avatar radius - responsive
    const avatarRadiusDesktop = attributes.phAvatarRadius;
    const avatarRadiusTablet = attributes.phAvatarRadius_tablet;
    const avatarRadiusMobile = attributes.phAvatarRadius_mobile;
    const avatarRadiusUnit = attributes.phAvatarRadiusUnit || 'px';

    if (avatarRadiusDesktop !== undefined) {
        css += `.ts-popup-head .ts-popup-name img { border-radius: ${avatarRadiusDesktop}${avatarRadiusUnit}; }\n`;
    }
    if (avatarRadiusTablet !== undefined && avatarRadiusTablet !== avatarRadiusDesktop) {
        css += `@media (max-width: 1024px) { .ts-popup-head .ts-popup-name img { border-radius: ${avatarRadiusTablet}${avatarRadiusUnit}; } }\n`;
    }
    if (avatarRadiusMobile !== undefined && avatarRadiusMobile !== avatarRadiusTablet && avatarRadiusMobile !== avatarRadiusDesktop) {
        css += `@media (max-width: 768px) { .ts-popup-head .ts-popup-name img { border-radius: ${avatarRadiusMobile}${avatarRadiusUnit}; } }\n`;
    }

    // ========================================================================
    // POPUP: BUTTONS STYLES
    // ========================================================================

    // General button typography
    if (attributes.pbTypo) {
        const typoCSS = generateTypographyCSS(attributes.pbTypo);
        if (typoCSS) {
            css += `.ts-field-popup .ts-btn { ${typoCSS} }\n`;
        }
    }

    // Button border radius - responsive
    const btnRadiusDesktop = attributes.pbRadius;
    const btnRadiusTablet = attributes.pbRadius_tablet;
    const btnRadiusMobile = attributes.pbRadius_mobile;

    if (btnRadiusDesktop) {
        css += `.ts-field-popup .ts-btn { border-radius: ${btnRadiusDesktop}px; }\n`;
    }
    if (btnRadiusTablet !== undefined && btnRadiusTablet !== btnRadiusDesktop) {
        css += `@media (max-width: 1024px) { .ts-field-popup .ts-btn { border-radius: ${btnRadiusTablet}px; } }\n`;
    }
    if (btnRadiusMobile !== undefined && btnRadiusMobile !== btnRadiusTablet && btnRadiusMobile !== btnRadiusDesktop) {
        css += `@media (max-width: 768px) { .ts-field-popup .ts-btn { border-radius: ${btnRadiusMobile}px; } }\n`;
    }

    // Primary button - Normal
    if (attributes.pbButton1Bg) {
        css += `.ts-field-popup .ts-btn-1 { background: ${attributes.pbButton1Bg}; }\n`;
    }
    if (attributes.pbButton1Text) {
        css += `.ts-field-popup .ts-btn-1 { color: ${attributes.pbButton1Text}; }\n`;
    }
    if (attributes.pbButton1Icon) {
        css += `.ts-field-popup .ts-btn-1 { --ts-icon-color: ${attributes.pbButton1Icon}; }\n`;
    }
    if (attributes.pbButton1Border) {
        const border = attributes.pbButton1Border;
        const borderType = border.type || 'default';
        if (borderType !== 'default' && borderType !== 'none') {
            const borderWidth = border.width || 1;
            const borderColor = border.color || '#000000';
            css += `.ts-field-popup .ts-btn-1 { border-style: ${borderType}; border-width: ${borderWidth}px; border-color: ${borderColor}; }\n`;
        } else if (borderType === 'none') {
            css += '.ts-field-popup .ts-btn-1 { border: none; }\n';
        }
    }

    // Secondary button - Normal
    if (attributes.pbButton2Bg) {
        css += `.ts-field-popup .ts-btn-2 { background: ${attributes.pbButton2Bg}; }\n`;
    }
    if (attributes.pbButton2Text) {
        css += `.ts-field-popup .ts-btn-2 { color: ${attributes.pbButton2Text}; }\n`;
    }
    if (attributes.pbButton2Icon) {
        css += `.ts-field-popup .ts-btn-2 { --ts-icon-color: ${attributes.pbButton2Icon}; }\n`;
    }
    if (attributes.pbButton2Border) {
        const border = attributes.pbButton2Border;
        const borderType = border.type || 'default';
        if (borderType !== 'default' && borderType !== 'none') {
            const borderWidth = border.width || 1;
            const borderColor = border.color || '#000000';
            css += `.ts-field-popup .ts-btn-2 { border-style: ${borderType}; border-width: ${borderWidth}px; border-color: ${borderColor}; }\n`;
        } else if (borderType === 'none') {
            css += '.ts-field-popup .ts-btn-2 { border: none; }\n';
        }
    }

    // Tertiary button - Normal
    if (attributes.pbButton3Bg) {
        css += `.ts-field-popup .ts-btn-4 { background: ${attributes.pbButton3Bg}; }\n`;
    }
    if (attributes.pbButton3Text) {
        css += `.ts-field-popup .ts-btn-4 { color: ${attributes.pbButton3Text}; }\n`;
    }
    if (attributes.pbButton3Icon) {
        css += `.ts-field-popup .ts-btn-4 { --ts-icon-color: ${attributes.pbButton3Icon}; }\n`;
    }

    // Button hover states
    if (attributes.pbButton1HoverBg) {
        css += `.ts-field-popup .ts-btn-1:hover { background: ${attributes.pbButton1HoverBg}; }\n`;
    }
    if (attributes.pbButton1HoverText) {
        css += `.ts-field-popup .ts-btn-1:hover { color: ${attributes.pbButton1HoverText}; }\n`;
    }
    if (attributes.pbButton1HoverBorder) {
        css += `.ts-field-popup .ts-btn-1:hover { border-color: ${attributes.pbButton1HoverBorder}; }\n`;
    }

    if (attributes.pbButton2HoverBg) {
        css += `.ts-field-popup .ts-btn-2:hover { background: ${attributes.pbButton2HoverBg}; }\n`;
    }
    if (attributes.pbButton2HoverText) {
        css += `.ts-field-popup .ts-btn-2:hover { color: ${attributes.pbButton2HoverText}; }\n`;
    }
    if (attributes.pbButton2HoverBorder) {
        css += `.ts-field-popup .ts-btn-2:hover { border-color: ${attributes.pbButton2HoverBorder}; }\n`;
    }

    if (attributes.pbButton3HoverBg) {
        css += `.ts-field-popup .ts-btn-4:hover { background: ${attributes.pbButton3HoverBg}; }\n`;
    }
    if (attributes.pbButton3HoverText) {
        css += `.ts-field-popup .ts-btn-4:hover { color: ${attributes.pbButton3HoverText}; }\n`;
    }

    // ========================================================================
    // POPUP: LABEL AND DESCRIPTION STYLES
    // ========================================================================

    // Label typography
    if (attributes.plLabelTypo) {
        const typoCSS = generateTypographyCSS(attributes.plLabelTypo);
        if (typoCSS) {
            css += `.ts-field-popup .ts-form-group label { ${typoCSS} }\n`;
        }
    }

    // Label color
    if (attributes.plLabelColor) {
        css += `.ts-field-popup .ts-form-group label { color: ${attributes.plLabelColor}; }\n`;
    }

    // Description typography
    if (attributes.plDescTypo) {
        const typoCSS = generateTypographyCSS(attributes.plDescTypo);
        if (typoCSS) {
            css += `.ts-field-popup .ts-form-group small { ${typoCSS} }\n`;
        }
    }

    // Description color
    if (attributes.plDescColor) {
        css += `.ts-field-popup .ts-form-group small { color: ${attributes.plDescColor}; }\n`;
    }

    // ========================================================================
    // POPUP: MENU STYLES
    // ========================================================================

    // Item padding
    if (attributes.pmItemPadding) {
        const padding = attributes.pmItemPadding as any;
        const top = parseValue(padding.top);
        const right = parseValue(padding.right);
        const bottom = parseValue(padding.bottom);
        const left = parseValue(padding.left);

        if (top !== null || right !== null || bottom !== null || left !== null) {
            const rules: string[] = [];
            if (top !== null) rules.push(`padding-top: ${top};`);
            if (right !== null) rules.push(`padding-right: ${right};`);
            if (bottom !== null) rules.push(`padding-bottom: ${bottom};`);
            if (left !== null) rules.push(`padding-left: ${left};`);

            if (rules.length > 0) {
                css += `.ts-field-popup .ts-term-dropdown li > a { ${rules.join(' ')} }\n`;
            }
        }
    }

    // Item height - responsive
    const pmItemHeight = attributes.pmItemHeight;
    const pmItemHeight_tablet = attributes.pmItemHeight_tablet;
    const pmItemHeight_mobile = attributes.pmItemHeight_mobile;

    if (pmItemHeight) css += `.ts-field-popup .ts-term-dropdown li > a { height: ${pmItemHeight}px; }\n`;
    if (pmItemHeight_tablet !== undefined && pmItemHeight_tablet !== pmItemHeight) css += `@media (max-width: 1024px) { .ts-field-popup .ts-term-dropdown li > a { height: ${pmItemHeight_tablet}px; } }\n`;
    if (pmItemHeight_mobile !== undefined && pmItemHeight_mobile !== pmItemHeight_tablet && pmItemHeight_mobile !== pmItemHeight) css += `@media (max-width: 768px) { .ts-field-popup .ts-term-dropdown li > a { height: ${pmItemHeight_mobile}px; } }\n`;

    if (attributes.pmSeparatorColor) {
        css += `.ts-field-popup .ts-term-dropdown li { border-color: ${attributes.pmSeparatorColor}; }\n`;
    }

    // Title color
    if (attributes.pmTitleColor) {
        css += `.ts-field-popup .ts-term-dropdown li > a span { color: ${attributes.pmTitleColor}; }\n`;
    }

    // Title typography
    if (attributes.pmTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pmTitleTypo);
        if (typoCSS) css += `.ts-field-popup .ts-term-dropdown li > a span { ${typoCSS} }\n`;
    }

    // Icon color
    if (attributes.pmIconColor) {
        css += `.ts-field-popup .ts-term-icon { --ts-icon-color: ${attributes.pmIconColor}; }\n`;
    }

    // Icon size - responsive
    const pmIconSize = attributes.pmIconSize;
    const pmIconSize_tablet = attributes.pmIconSize_tablet;
    const pmIconSize_mobile = attributes.pmIconSize_mobile;

    if (pmIconSize) css += `.ts-field-popup .ts-term-icon { --ts-icon-size: ${pmIconSize}px; }\n`;
    if (pmIconSize_tablet !== undefined && pmIconSize_tablet !== pmIconSize) css += `@media (max-width: 1024px) { .ts-field-popup .ts-term-icon { --ts-icon-size: ${pmIconSize_tablet}px; } }\n`;
    if (pmIconSize_mobile !== undefined && pmIconSize_mobile !== pmIconSize_tablet && pmIconSize_mobile !== pmIconSize) css += `@media (max-width: 768px) { .ts-field-popup .ts-term-icon { --ts-icon-size: ${pmIconSize_mobile}px; } }\n`;

    // Icon spacing - responsive
    const pmIconSpacing = attributes.pmIconSpacing;
    const pmIconSpacing_tablet = attributes.pmIconSpacing_tablet;
    const pmIconSpacing_mobile = attributes.pmIconSpacing_mobile;

    if (pmIconSpacing) css += `.ts-field-popup .ts-term-dropdown li > a { grid-gap: ${pmIconSpacing}px; }\n`;
    if (pmIconSpacing_tablet !== undefined && pmIconSpacing_tablet !== pmIconSpacing) css += `@media (max-width: 1024px) { .ts-field-popup .ts-term-dropdown li > a { grid-gap: ${pmIconSpacing_tablet}px; } }\n`;
    if (pmIconSpacing_mobile !== undefined && pmIconSpacing_mobile !== pmIconSpacing_tablet && pmIconSpacing_mobile !== pmIconSpacing) css += `@media (max-width: 768px) { .ts-field-popup .ts-term-dropdown li > a { grid-gap: ${pmIconSpacing_mobile}px; } }\n`;

    // Chevron color
    if (attributes.pmChevronColor) {
        css += `.ts-field-popup .ts-right-icon, .ts-field-popup .ts-left-icon { border-color: ${attributes.pmChevronColor}; }\n`;
        css += `.ts-field-popup .pika-label:after { border-color: ${attributes.pmChevronColor}; }\n`;
    }

    // Hover state
    if (attributes.pmHoverBg) css += `.ts-field-popup .ts-term-dropdown li > a:hover, .ts-field-popup .ts-term-dropdown li > a:focus { background: ${attributes.pmHoverBg}; }\n`;
    if (attributes.pmHoverTitleColor) css += `.ts-field-popup .ts-term-dropdown li > a:hover span { color: ${attributes.pmHoverTitleColor}; }\n`;
    if (attributes.pmHoverIconColor) css += `.ts-field-popup .ts-term-dropdown li > a:hover .ts-term-icon { --ts-icon-color: ${attributes.pmHoverIconColor}; }\n`;

    // Selected state
    if (attributes.pmSelectedTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pmSelectedTitleTypo);
        if (typoCSS) css += `.ts-field-popup .ts-term-dropdown li.ts-selected > a span { ${typoCSS} }\n`;
    }
    if (attributes.pmSelectedTitleColor) css += `.ts-field-popup .ts-term-dropdown li.ts-selected > a span { color: ${attributes.pmSelectedTitleColor}; }\n`;
    if (attributes.pmSelectedIconColor) css += `.ts-field-popup .ts-term-dropdown li.ts-selected > a .ts-term-icon { --ts-icon-color: ${attributes.pmSelectedIconColor}; }\n`;

    // Parent state
    if (attributes.pmParentTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pmParentTitleTypo);
        if (typoCSS) css += `.ts-field-popup .ts-term-dropdown li.ts-parent-item span { ${typoCSS} }\n`;
    }

    // ========================================================================
    // POPUP: CART STYLES
    // ========================================================================

    // Item spacing
    const pcItemSpacing = attributes.pcItemSpacing;
    const pcItemSpacing_tablet = attributes.pcItemSpacing_tablet;
    const pcItemSpacing_mobile = attributes.pcItemSpacing_mobile;

    if (pcItemSpacing) css += `.ts-field-popup .ts-cart-list { gap: ${pcItemSpacing}px; }\n`;
    if (pcItemSpacing_tablet !== undefined && pcItemSpacing_tablet !== pcItemSpacing) css += `@media (max-width: 1024px) { .ts-field-popup .ts-cart-list { gap: ${pcItemSpacing_tablet}px; } }\n`;
    if (pcItemSpacing_mobile !== undefined && pcItemSpacing_mobile !== pcItemSpacing_tablet && pcItemSpacing_mobile !== pcItemSpacing) css += `@media (max-width: 768px) { .ts-field-popup .ts-cart-list { gap: ${pcItemSpacing_mobile}px; } }\n`;

    // Content spacing
    const pcItemContentSpacing = attributes.pcItemContentSpacing;
    const pcItemContentSpacing_tablet = attributes.pcItemContentSpacing_tablet;
    const pcItemContentSpacing_mobile = attributes.pcItemContentSpacing_mobile;

    if (pcItemContentSpacing) css += `.ts-field-popup .ts-cart-list li { gap: ${pcItemContentSpacing}px; }\n`;
    if (pcItemContentSpacing_tablet !== undefined && pcItemContentSpacing_tablet !== pcItemContentSpacing) css += `@media (max-width: 1024px) { .ts-field-popup .ts-cart-list li { gap: ${pcItemContentSpacing_tablet}px; } }\n`;
    if (pcItemContentSpacing_mobile !== undefined && pcItemContentSpacing_mobile !== pcItemContentSpacing_tablet && pcItemContentSpacing_mobile !== pcItemContentSpacing) css += `@media (max-width: 768px) { .ts-field-popup .ts-cart-list li { gap: ${pcItemContentSpacing_mobile}px; } }\n`;

    // Picture size
    const pcPictureSize = attributes.pcPictureSize;
    const pcPictureSize_tablet = attributes.pcPictureSize_tablet;
    const pcPictureSize_mobile = attributes.pcPictureSize_mobile;

    if (pcPictureSize) css += `.ts-field-popup .cart-image img { width: ${pcPictureSize}px; height: ${pcPictureSize}px; }\n`;
    if (pcPictureSize_tablet !== undefined && pcPictureSize_tablet !== pcPictureSize) css += `@media (max-width: 1024px) { .ts-field-popup .cart-image img { width: ${pcPictureSize_tablet}px; height: ${pcPictureSize_tablet}px; } }\n`;
    if (pcPictureSize_mobile !== undefined && pcPictureSize_mobile !== pcPictureSize_tablet && pcPictureSize_mobile !== pcPictureSize) css += `@media (max-width: 768px) { .ts-field-popup .cart-image img { width: ${pcPictureSize_mobile}px; height: ${pcPictureSize_mobile}px; } }\n`;

    // Picture radius
    const pcPictureRadius = attributes.pcPictureRadius;
    const pcPictureRadius_tablet = attributes.pcPictureRadius_tablet;
    const pcPictureRadius_mobile = attributes.pcPictureRadius_mobile;

    if (pcPictureRadius !== undefined) css += `.ts-field-popup .cart-image img { border-radius: ${pcPictureRadius}px; }\n`;
    if (pcPictureRadius_tablet !== undefined && pcPictureRadius_tablet !== pcPictureRadius) css += `@media (max-width: 1024px) { .ts-field-popup .cart-image img { border-radius: ${pcPictureRadius_tablet}px; } }\n`;
    if (pcPictureRadius_mobile !== undefined && pcPictureRadius_mobile !== pcPictureRadius_tablet && pcPictureRadius_mobile !== pcPictureRadius) css += `@media (max-width: 768px) { .ts-field-popup .cart-image img { border-radius: ${pcPictureRadius_mobile}px; } }\n`;

    // Title & Subtitle
    if (attributes.pcTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pcTitleTypo);
        if (typoCSS) css += `.ts-field-popup .cart-item-details a { ${typoCSS} }\n`;
    }
    if (attributes.pcTitleColor) css += `.ts-field-popup .cart-item-details a { color: ${attributes.pcTitleColor}; }\n`;

    if (attributes.pcSubtitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pcSubtitleTypo);
        if (typoCSS) css += `.ts-field-popup .cart-item-details span { ${typoCSS} }\n`;
    }
    if (attributes.pcSubtitleColor) css += `.ts-field-popup .cart-item-details span { color: ${attributes.pcSubtitleColor}; }\n`;

    // Subtotal
    if (attributes.psSubtotalTypo) {
        const typoCSS = generateTypographyCSS(attributes.psSubtotalTypo);
        if (typoCSS) css += `.ts-field-popup .cart-subtotal span { ${typoCSS} }\n`;
    }
    if (attributes.psSubtotalColor) css += `.ts-field-popup .cart-subtotal span { color: ${attributes.psSubtotalColor}; }\n`;

    // ========================================================================
    // POPUP: NO RESULTS STYLES
    // ========================================================================
    const pnIconSize = attributes.pnIconSize;
    const pnIconSize_tablet = attributes.pnIconSize_tablet;
    const pnIconSize_mobile = attributes.pnIconSize_mobile;

    if (pnIconSize) css += `.ts-field-popup .ts-empty-user-tab { --ts-icon-size: ${pnIconSize}px; }\n`;
    if (pnIconSize_tablet !== undefined && pnIconSize_tablet !== pnIconSize) css += `@media (max-width: 1024px) { .ts-field-popup .ts-empty-user-tab { --ts-icon-size: ${pnIconSize_tablet}px; } }\n`;
    if (pnIconSize_mobile !== undefined && pnIconSize_mobile !== pnIconSize_tablet && pnIconSize_mobile !== pnIconSize) css += `@media (max-width: 768px) { .ts-field-popup .ts-empty-user-tab { --ts-icon-size: ${pnIconSize_mobile}px; } }\n`;

    if (attributes.pnIconColor) css += `.ts-field-popup .ts-empty-user-tab { --ts-icon-color: ${attributes.pnIconColor}; }\n`;
    if (attributes.pnTitleColor) css += `.ts-field-popup .ts-empty-user-tab p { color: ${attributes.pnTitleColor}; }\n`;
    if (attributes.pnTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pnTitleTypo);
        if (typoCSS) css += `.ts-field-popup .ts-empty-user-tab p { ${typoCSS} }\n`;
    }

    // ========================================================================
    // POPUP: CHECKBOX STYLES
    // ========================================================================

    // Size
    const pcCheckboxSize = attributes.pcCheckboxSize;
    const pcCheckboxSize_tablet = attributes.pcCheckboxSize_tablet;
    const pcCheckboxSize_mobile = attributes.pcCheckboxSize_mobile;

    if (pcCheckboxSize) css += `.ts-field-popup .container-checkbox .checkmark { width: ${pcCheckboxSize}px; height: ${pcCheckboxSize}px; min-width: ${pcCheckboxSize}px; }\n`;
    if (pcCheckboxSize_tablet !== undefined && pcCheckboxSize_tablet !== pcCheckboxSize) css += `@media (max-width: 1024px) { .ts-field-popup .container-checkbox .checkmark { width: ${pcCheckboxSize_tablet}px; height: ${pcCheckboxSize_tablet}px; min-width: ${pcCheckboxSize_tablet}px; } }\n`;
    if (pcCheckboxSize_mobile !== undefined && pcCheckboxSize_mobile !== pcCheckboxSize_tablet && pcCheckboxSize_mobile !== pcCheckboxSize) css += `@media (max-width: 768px) { .ts-field-popup .container-checkbox .checkmark { width: ${pcCheckboxSize_mobile}px; height: ${pcCheckboxSize_mobile}px; min-width: ${pcCheckboxSize_mobile}px; } }\n`;

    // Radius
    const pcCheckboxRadius = attributes.pcCheckboxRadius;
    const pcCheckboxRadius_tablet = attributes.pcCheckboxRadius_tablet;
    const pcCheckboxRadius_mobile = attributes.pcCheckboxRadius_mobile;

    if (pcCheckboxRadius !== undefined) css += `.ts-field-popup .container-checkbox .checkmark { border-radius: ${pcCheckboxRadius}px; }\n`;
    if (pcCheckboxRadius_tablet !== undefined && pcCheckboxRadius_tablet !== pcCheckboxRadius) css += `@media (max-width: 1024px) { .ts-field-popup .container-checkbox .checkmark { border-radius: ${pcCheckboxRadius_tablet}px; } }\n`;
    if (pcCheckboxRadius_mobile !== undefined && pcCheckboxRadius_mobile !== pcCheckboxRadius_tablet && pcCheckboxRadius_mobile !== pcCheckboxRadius) css += `@media (max-width: 768px) { .ts-field-popup .container-checkbox .checkmark { border-radius: ${pcCheckboxRadius_mobile}px; } }\n`;

    // Border
    if (attributes.pcCheckboxBorder && (attributes.pcCheckboxBorder as any).type !== 'none') {
        const border = attributes.pcCheckboxBorder as any;
        const width = attributes.pcCheckboxBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-field-popup .container-checkbox .checkmark { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.pcCheckboxBorderWidth_tablet !== undefined && attributes.pcCheckboxBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-field-popup .container-checkbox .checkmark { border-width: ${attributes.pcCheckboxBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.pcCheckboxBorderWidth_mobile !== undefined && attributes.pcCheckboxBorderWidth_mobile !== attributes.pcCheckboxBorderWidth_tablet && attributes.pcCheckboxBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-field-popup .container-checkbox .checkmark { border-width: ${attributes.pcCheckboxBorderWidth_mobile}px; } }\n`;
        }
    }

    if (attributes.pcCheckboxBgUnchecked) css += `.ts-field-popup .container-checkbox .checkmark { background-color: ${attributes.pcCheckboxBgUnchecked}; }\n`;
    if (attributes.pcCheckboxBgChecked) css += `.ts-field-popup .container-checkbox input:checked ~ .checkmark { background-color: ${attributes.pcCheckboxBgChecked}; }\n`;
    if (attributes.pcCheckboxBorderChecked) css += `.ts-field-popup .container-checkbox input:checked ~ .checkmark { border-color: ${attributes.pcCheckboxBorderChecked}; }\n`;

    // ========================================================================
    // POPUP: RADIO BENEFITS
    // ========================================================================
    // Size
    const prRadioSize = attributes.prRadioSize;
    const prRadioSize_tablet = attributes.prRadioSize_tablet;
    const prRadioSize_mobile = attributes.prRadioSize_mobile;

    if (prRadioSize) css += `.ts-field-popup .container-radio .checkmark { width: ${prRadioSize}px; height: ${prRadioSize}px; min-width: ${prRadioSize}px; }\n`;
    if (prRadioSize_tablet !== undefined && prRadioSize_tablet !== prRadioSize) css += `@media (max-width: 1024px) { .ts-field-popup .container-radio .checkmark { width: ${prRadioSize_tablet}px; height: ${prRadioSize_tablet}px; min-width: ${prRadioSize_tablet}px; } }\n`;
    if (prRadioSize_mobile !== undefined && prRadioSize_mobile !== prRadioSize_tablet && prRadioSize_mobile !== prRadioSize) css += `@media (max-width: 768px) { .ts-field-popup .container-radio .checkmark { width: ${prRadioSize_mobile}px; height: ${prRadioSize_mobile}px; min-width: ${prRadioSize_mobile}px; } }\n`;

    // Radius
    const prRadioRadius = attributes.prRadioRadius;
    const prRadioRadius_tablet = attributes.prRadioRadius_tablet;
    const prRadioRadius_mobile = attributes.prRadioRadius_mobile;

    if (prRadioRadius !== undefined) css += `.ts-field-popup .container-radio .checkmark { border-radius: ${prRadioRadius}px; }\n`;
    if (prRadioRadius_tablet !== undefined && prRadioRadius_tablet !== prRadioRadius) css += `@media (max-width: 1024px) { .ts-field-popup .container-radio .checkmark { border-radius: ${prRadioRadius_tablet}px; } }\n`;
    if (prRadioRadius_mobile !== undefined && prRadioRadius_mobile !== prRadioRadius_tablet && prRadioRadius_mobile !== prRadioRadius) css += `@media (max-width: 768px) { .ts-field-popup .container-radio .checkmark { border-radius: ${prRadioRadius_mobile}px; } }\n`;

    // Border
    if (attributes.prRadioBorder && (attributes.prRadioBorder as any).type !== 'none') {
        const border = attributes.prRadioBorder as any;
        const width = attributes.prRadioBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-field-popup .container-radio .checkmark { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.prRadioBorderWidth_tablet !== undefined && attributes.prRadioBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-field-popup .container-radio .checkmark { border-width: ${attributes.prRadioBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.prRadioBorderWidth_mobile !== undefined && attributes.prRadioBorderWidth_mobile !== attributes.prRadioBorderWidth_tablet && attributes.prRadioBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-field-popup .container-radio .checkmark { border-width: ${attributes.prRadioBorderWidth_mobile}px; } }\n`;
        }
    }

    if (attributes.prRadioBgUnchecked) css += `.ts-field-popup .container-radio .checkmark { background-color: ${attributes.prRadioBgUnchecked}; }\n`;
    if (attributes.prRadioBgChecked) css += `.ts-field-popup .container-radio input:checked ~ .checkmark { background-color: ${attributes.prRadioBgChecked}; }\n`;
    if (attributes.prRadioBorderChecked) css += `.ts-field-popup .container-radio input:checked ~ .checkmark { border-color: ${attributes.prRadioBorderChecked}; }\n`;

    // ========================================================================
    // POPUP: INPUT STYLES
    // ========================================================================

    // Input height
    const piInputHeight = attributes.piInputHeight;
    const piInputHeight_tablet = attributes.piInputHeight_tablet;
    const piInputHeight_mobile = attributes.piInputHeight_mobile;
    const piInputHeightUnit = attributes.piInputHeightUnit || 'px';

    if (piInputHeight) css += `.ts-field-popup input { height: ${piInputHeight}${piInputHeightUnit}; }\n`;
    if (piInputHeight_tablet !== undefined && piInputHeight_tablet !== piInputHeight) css += `@media (max-width: 1024px) { .ts-field-popup input { height: ${piInputHeight_tablet}${piInputHeightUnit}; } }\n`;
    if (piInputHeight_mobile !== undefined && piInputHeight_mobile !== piInputHeight_tablet && piInputHeight_mobile !== piInputHeight) css += `@media (max-width: 768px) { .ts-field-popup input { height: ${piInputHeight_mobile}${piInputHeightUnit}; } }\n`;

    // Typography
    if (attributes.piInputTypo) {
        const typoCSS = generateTypographyCSS(attributes.piInputTypo);
        if (typoCSS) css += `.ts-field-popup input { ${typoCSS} }\n`;
    }

    // Padding
    if (attributes.piInputPadding) {
        const padding = attributes.piInputPadding as any;
        const top = parseValue(padding.top);
        const right = parseValue(padding.right);
        const bottom = parseValue(padding.bottom);
        const left = parseValue(padding.left);

        if (top || right || bottom || left) {
            const rules: string[] = [];
            if (top) rules.push(`padding-top: ${top};`);
            if (right) rules.push(`padding-right: ${right};`);
            if (bottom) rules.push(`padding-bottom: ${bottom};`);
            if (left) rules.push(`padding-left: ${left};`);
            if (rules.length) css += `.ts-field-popup input { ${rules.join(' ')} }\n`;
        }
    }

    // Padding (Icon)
    if (attributes.piInputPaddingIcon) {
        const padding = attributes.piInputPaddingIcon as any;
        const top = parseValue(padding.top);
        const right = parseValue(padding.right);
        const bottom = parseValue(padding.bottom);
        const left = parseValue(padding.left);

        if (top || right || bottom || left) {
            const rules: string[] = [];
            if (top) rules.push(`padding-top: ${top};`);
            if (right) rules.push(`padding-right: ${right};`);
            if (bottom) rules.push(`padding-bottom: ${bottom};`);
            if (left) rules.push(`padding-left: ${left};`);
            if (rules.length) css += `.ts-field-popup .ts-input-icon input { ${rules.join(' ')} }\n`;
        }
    }

    if (attributes.piInputValueColor) css += `.ts-field-popup input { color: ${attributes.piInputValueColor}; }\n`;
    if (attributes.piInputPlaceholderColor) {
        css += `.ts-field-popup input::-webkit-input-placeholder { color: ${attributes.piInputPlaceholderColor}; }\n`;
        css += `.ts-field-popup input:-moz-placeholder { color: ${attributes.piInputPlaceholderColor}; }\n`;
        css += `.ts-field-popup input::-moz-placeholder { color: ${attributes.piInputPlaceholderColor}; }\n`;
        css += `.ts-field-popup input:-ms-input-placeholder { color: ${attributes.piInputPlaceholderColor}; }\n`;
    }

    if (attributes.piIconColor) css += `.ts-field-popup .ts-input-icon { --ts-icon-color: ${attributes.piIconColor}; }\n`;

    // Icon size
    const piIconSize = attributes.piIconSize;
    const piIconSize_tablet = attributes.piIconSize_tablet;
    const piIconSize_mobile = attributes.piIconSize_mobile;
    const piIconSizeUnit = attributes.piIconSizeUnit || 'px';

    if (piIconSize) css += `.ts-field-popup .ts-input-icon { --ts-icon-size: ${piIconSize}${piIconSizeUnit}; }\n`;
    if (piIconSize_tablet !== undefined && piIconSize_tablet !== piIconSize) css += `@media (max-width: 1024px) { .ts-field-popup .ts-input-icon { --ts-icon-size: ${piIconSize_tablet}${piIconSizeUnit}; } }\n`;
    if (piIconSize_mobile !== undefined && piIconSize_mobile !== piIconSize_tablet && piIconSize_mobile !== piIconSize) css += `@media (max-width: 768px) { .ts-field-popup .ts-input-icon { --ts-icon-size: ${piIconSize_mobile}${piIconSizeUnit}; } }\n`;

    // Icon left margin
    const piIconLeftMargin = attributes.piIconLeftMargin;
    const piIconLeftMargin_tablet = attributes.piIconLeftMargin_tablet;
    const piIconLeftMargin_mobile = attributes.piIconLeftMargin_mobile;
    const piIconLeftMarginUnit = attributes.piIconLeftMarginUnit || 'px';

    if (piIconLeftMargin) css += `.ts-field-popup .ts-input-icon > i, .ts-field-popup .ts-input-icon > svg { left: ${piIconLeftMargin}${piIconLeftMarginUnit}; }\n`;
    if (piIconLeftMargin_tablet !== undefined && piIconLeftMargin_tablet !== piIconLeftMargin) css += `@media (max-width: 1024px) { .ts-field-popup .ts-input-icon > i, .ts-field-popup .ts-input-icon > svg { left: ${piIconLeftMargin_tablet}${piIconLeftMarginUnit}; } }\n`;
    if (piIconLeftMargin_mobile !== undefined && piIconLeftMargin_mobile !== piIconLeftMargin_tablet && piIconLeftMargin_mobile !== piIconLeftMargin) css += `@media (max-width: 768px) { .ts-field-popup .ts-input-icon > i, .ts-field-popup .ts-input-icon > svg { left: ${piIconLeftMargin_mobile}${piIconLeftMarginUnit}; } }\n`;

    // ========================================================================
    // POPUP: NOTIFICATIONS
    // ========================================================================

    // Title color
    if (attributes.pnotTitleColor) css += `.ts-notification-list li a .notification-details b { color: ${attributes.pnotTitleColor}; }\n`;

    // Title typography
    if (attributes.pnotTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pnotTitleTypo);
        if (typoCSS) css += `.ts-notification-list li a .notification-details b { ${typoCSS} }\n`;
    }

    // Subtitle color
    if (attributes.pnotSubtitleColor) css += `.ts-notification-list li a .notification-details span { color: ${attributes.pnotSubtitleColor}; }\n`;

    // Subtitle typography
    if (attributes.pnotSubtitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pnotSubtitleTypo);
        if (typoCSS) css += `.ts-notification-list li a .notification-details span { ${typoCSS} }\n`;
    }

    // Icon color
    if (attributes.pnotIconColor) {
        css += `.ts-notification-list li a .notification-image i { color: ${attributes.pnotIconColor}; }\n`;
        css += `.ts-notification-list li a .notification-image svg { fill: ${attributes.pnotIconColor}; }\n`;
    }

    // Icon background
    if (attributes.pnotIconBg) {
        css += `.ts-notification-list li a .notification-image { background-color: ${attributes.pnotIconBg}; }\n`;
    }

    // Icon size
    const pnotIconSize = attributes.pnotIconSize;
    const pnotIconSize_tablet = attributes.pnotIconSize_tablet;
    const pnotIconSize_mobile = attributes.pnotIconSize_mobile;
    const pnotIconSizeUnit = attributes.pnotIconSizeUnit || 'px';

    if (pnotIconSize) {
        css += `.ts-notification-list li a .notification-image i { font-size: ${pnotIconSize}${pnotIconSizeUnit}; }\n`;
        css += `.ts-notification-list li a .notification-image svg { width: ${pnotIconSize}${pnotIconSizeUnit}; height: ${pnotIconSize}${pnotIconSizeUnit}; }\n`;
    }
    if (pnotIconSize_tablet !== undefined && pnotIconSize_tablet !== pnotIconSize) {
        css += `@media (max-width: 1024px) { .ts-notification-list li a .notification-image i { font-size: ${pnotIconSize_tablet}${pnotIconSizeUnit}; } .ts-notification-list li a .notification-image svg { width: ${pnotIconSize_tablet}${pnotIconSizeUnit}; height: ${pnotIconSize_tablet}${pnotIconSizeUnit}; } }\n`;
    }
    if (pnotIconSize_mobile !== undefined && pnotIconSize_mobile !== pnotIconSize_tablet && pnotIconSize_mobile !== pnotIconSize) {
        css += `@media (max-width: 768px) { .ts-notification-list li a .notification-image i { font-size: ${pnotIconSize_mobile}${pnotIconSizeUnit}; } .ts-notification-list li a .notification-image svg { width: ${pnotIconSize_mobile}${pnotIconSizeUnit}; height: ${pnotIconSize_mobile}${pnotIconSizeUnit}; } }\n`;
    }

    // Container size
    const pnotContainerSize = attributes.pnotIconContainerSize;
    const pnotContainerSize_tablet = attributes.pnotIconContainerSize_tablet;
    const pnotContainerSize_mobile = attributes.pnotIconContainerSize_mobile;
    const pnotContainerSizeUnit = attributes.pnotIconContainerSizeUnit || 'px';

    if (pnotContainerSize) css += `.ts-notification-list li a .notification-image { width: ${pnotContainerSize}${pnotContainerSizeUnit}; height: ${pnotContainerSize}${pnotContainerSizeUnit}; min-width: ${pnotContainerSize}${pnotContainerSizeUnit}; }\n`;
    if (pnotContainerSize_tablet !== undefined && pnotContainerSize_tablet !== pnotContainerSize) css += `@media (max-width: 1024px) { .ts-notification-list li a .notification-image { width: ${pnotContainerSize_tablet}${pnotContainerSizeUnit}; height: ${pnotContainerSize_tablet}${pnotContainerSizeUnit}; min-width: ${pnotContainerSize_tablet}${pnotContainerSizeUnit}; } }\n`;
    if (pnotContainerSize_mobile !== undefined && pnotContainerSize_mobile !== pnotContainerSize_tablet && pnotContainerSize_mobile !== pnotContainerSize) css += `@media (max-width: 768px) { .ts-notification-list li a .notification-image { width: ${pnotContainerSize_mobile}${pnotContainerSizeUnit}; height: ${pnotContainerSize_mobile}${pnotContainerSizeUnit}; min-width: ${pnotContainerSize_mobile}${pnotContainerSizeUnit}; } }\n`;

    // Border radius
    const pnotRadius = attributes.pnotBorderRadius;
    const pnotRadius_tablet = attributes.pnotBorderRadius_tablet;
    const pnotRadius_mobile = attributes.pnotBorderRadius_mobile;
    const pnotRadiusUnit = attributes.pnotBorderRadiusUnit || 'px';

    if (pnotRadius !== undefined) css += `.ts-notification-list li a .notification-image { border-radius: ${pnotRadius}${pnotRadiusUnit}; }\n`;
    if (pnotRadius_tablet !== undefined && pnotRadius_tablet !== pnotRadius) css += `@media (max-width: 1024px) { .ts-notification-list li a .notification-image { border-radius: ${pnotRadius_tablet}${pnotRadiusUnit}; } }\n`;
    if (pnotRadius_mobile !== undefined && pnotRadius_mobile !== pnotRadius_tablet && pnotRadius_mobile !== pnotRadius) css += `@media (max-width: 768px) { .ts-notification-list li a .notification-image { border-radius: ${pnotRadius_mobile}${pnotRadiusUnit}; } }\n`;

    // Unvisited title
    if (attributes.pnotUnvisitedTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pnotUnvisitedTitleTypo);
        if (typoCSS) css += `li.ts-unread-notification a .notification-details b { ${typoCSS} }\n`;
    }
    if (attributes.pnotUnvisitedTitleColor) css += `li.ts-unread-notification a .notification-details b { color: ${attributes.pnotUnvisitedTitleColor}; }\n`;

    // Unseen icon
    if (attributes.pnotUnseenIconColor) {
        css += `.ts-notification-list li.ts-new-notification a .notification-image i { color: ${attributes.pnotUnseenIconColor}; }\n`;
        css += `.ts-notification-list li.ts-new-notification a .notification-image svg { fill: ${attributes.pnotUnseenIconColor}; }\n`;
    }
    if (attributes.pnotUnseenIconBg) css += `.ts-notification-list li.ts-new-notification a .notification-image { background: ${attributes.pnotUnseenIconBg}; }\n`;

    // Unseen border
    if (attributes.pnotUnseenBorder && (attributes.pnotUnseenBorder as any).type !== 'none') {
        const border = attributes.pnotUnseenBorder as any;
        const width = attributes.pnotUnseenBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-notification-list li.ts-new-notification a .notification-image { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.pnotUnseenBorderWidth_tablet !== undefined && attributes.pnotUnseenBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-notification-list li.ts-new-notification a .notification-image { border-width: ${attributes.pnotUnseenBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.pnotUnseenBorderWidth_mobile !== undefined && attributes.pnotUnseenBorderWidth_mobile !== attributes.pnotUnseenBorderWidth_tablet && attributes.pnotUnseenBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-notification-list li.ts-new-notification a .notification-image { border-width: ${attributes.pnotUnseenBorderWidth_mobile}px; } }\n`;
        }
    }

    // Hover state
    if (attributes.pnotBgHover) css += `.ts-notification-list li:hover { background-color: ${attributes.pnotBgHover}; }\n`;
    if (attributes.pnotTitleColorHover) css += `.ts-notification-list li a:hover .notification-details b { color: ${attributes.pnotTitleColorHover}; }\n`;
    if (attributes.pnotSubtitleColorHover) css += `.ts-notification-list li a:hover .notification-details span { color: ${attributes.pnotSubtitleColorHover}; }\n`;

    if (attributes.pnotIconColorHover) {
        css += `.ts-notification-list li a:hover .notification-image i { color: ${attributes.pnotIconColorHover}; }\n`;
        css += `.ts-notification-list li a:hover .notification-image svg { fill: ${attributes.pnotIconColorHover}; }\n`;
    }
    if (attributes.pnotIconBgHover) css += `.ts-notification-list li a:hover .notification-image { background-color: ${attributes.pnotIconBgHover}; }\n`;
    if (attributes.pnotIconBorderHover) css += `.ts-notification-list li a:hover .notification-image { border-color: ${attributes.pnotIconBorderHover}; }\n`;

    // ========================================================================
    // POPUP: CALENDAR STYLES
    // ========================================================================

    // Months
    if (attributes.pcalMonthsTypo) {
        const typoCSS = generateTypographyCSS(attributes.pcalMonthsTypo);
        if (typoCSS) css += `.ts-field-popup .pika-label { ${typoCSS} }\n`;
    }
    if (attributes.pcalMonthsColor) css += `.ts-field-popup .pika-label { color: ${attributes.pcalMonthsColor}; }\n`;

    // Days
    if (attributes.pcalDaysTypo) {
        const typoCSS = generateTypographyCSS(attributes.pcalDaysTypo);
        if (typoCSS) css += `.ts-field-popup .pika-table abbr[title] { ${typoCSS} }\n`;
    }
    if (attributes.pcalDaysColor) css += `.ts-field-popup .pika-table abbr[title] { color: ${attributes.pcalDaysColor}; }\n`;

    // Available dates
    if (attributes.pcalAvailableTypo) {
        const typoCSS = generateTypographyCSS(attributes.pcalAvailableTypo);
        if (typoCSS) css += `.ts-field-popup td:not(.is-disabled) .pika-button { ${typoCSS} }\n`;
    }
    if (attributes.pcalAvailableColor) css += `.ts-field-popup td:not(.is-disabled) .pika-button { color: ${attributes.pcalAvailableColor}; }\n`;
    if (attributes.pcalAvailableColorHover) css += `.ts-field-popup td:not(.is-disabled) .pika-button:hover { color: ${attributes.pcalAvailableColorHover}; }\n`;
    if (attributes.pcalAvailableBgHover) css += `.ts-field-popup td:not(.is-disabled) .pika-button:hover { background-color: ${attributes.pcalAvailableBgHover}; }\n`;
    if (attributes.pcalAvailableBorderHover) css += `.ts-field-popup td:not(.is-disabled) .pika-button:hover { border-color: ${attributes.pcalAvailableBorderHover}; }\n`;

    // Range
    if (attributes.pcalRangeColor) css += `.ts-field-popup .is-inrange:not(.is-disabled) .pika-button { color: ${attributes.pcalRangeColor} !important; }\n`;
    if (attributes.pcalRangeBg) css += `.ts-field-popup .is-inrange:not(.is-disabled) .pika-button { background-color: ${attributes.pcalRangeBg} !important; }\n`;
    if (attributes.pcalRangeStartEndColor) css += `.ts-field-popup .ts-booking-date .is-startrange .pika-button, .ts-field-popup .ts-booking-date .is-endrange .pika-button { color: ${attributes.pcalRangeStartEndColor} !important; }\n`;
    if (attributes.pcalRangeStartEndBg) css += `.ts-field-popup .ts-booking-date .is-startrange .pika-button, .ts-field-popup .ts-booking-date .is-endrange .pika-button { background-color: ${attributes.pcalRangeStartEndBg} !important; }\n`;

    // Selected (Single)
    if (attributes.pcalSelectedColor) css += `.ts-field-popup .pika-single:not(.pika-range) .is-selected .pika-button { color: ${attributes.pcalSelectedColor} !important; }\n`;
    if (attributes.pcalSelectedBg) css += `.ts-field-popup .pika-single:not(.pika-range) .is-selected .pika-button { background-color: ${attributes.pcalSelectedBg} !important; }\n`;

    // Disabled
    if (attributes.pcalDisabledTypo) {
        const typoCSS = generateTypographyCSS(attributes.pcalDisabledTypo);
        if (typoCSS) css += `.ts-field-popup td.is-disabled .pika-button { ${typoCSS} }\n`;
    }
    if (attributes.pcalDisabledColor) css += `.ts-field-popup td.is-disabled .pika-button { color: ${attributes.pcalDisabledColor}; }\n`;

    // ========================================================================
    // POPUP: TEXTAREA STYLES
    // ========================================================================

    // Height
    const ptextHeight = attributes.ptextHeight;
    const ptextHeight_tablet = attributes.ptextHeight_tablet;
    const ptextHeight_mobile = attributes.ptextHeight_mobile;
    const ptextHeightUnit = attributes.ptextHeightUnit || 'px';

    if (ptextHeight) css += `.ts-field-popup textarea { height: ${ptextHeight}${ptextHeightUnit}; }\n`;
    if (ptextHeight_tablet !== undefined && ptextHeight_tablet !== ptextHeight) css += `@media (max-width: 1024px) { .ts-field-popup textarea { height: ${ptextHeight_tablet}${ptextHeightUnit}; } }\n`;
    if (ptextHeight_mobile !== undefined && ptextHeight_mobile !== ptextHeight_tablet && ptextHeight_mobile !== ptextHeight) css += `@media (max-width: 768px) { .ts-field-popup textarea { height: ${ptextHeight_mobile}${ptextHeightUnit}; } }\n`;

    // Typo
    if (attributes.ptextTypo) {
        const typoCSS = generateTypographyCSS(attributes.ptextTypo);
        if (typoCSS) css += `.ts-field-popup textarea { ${typoCSS} }\n`;
    }

    // Colors
    if (attributes.ptextBg) css += `.ts-field-popup textarea { background: ${attributes.ptextBg}; }\n`;
    if (attributes.ptextBgFocus) css += `.ts-field-popup textarea:focus { background-color: ${attributes.ptextBgFocus}; }\n`;
    if (attributes.ptextTextColor) css += `.ts-field-popup textarea { color: ${attributes.ptextTextColor}; }\n`;

    if (attributes.ptextPlaceholderColor) {
        css += `.ts-field-popup textarea::-webkit-input-placeholder { color: ${attributes.ptextPlaceholderColor}; }\n`;
        css += `.ts-field-popup textarea:-moz-placeholder { color: ${attributes.ptextPlaceholderColor}; }\n`;
        css += `.ts-field-popup textarea::-moz-placeholder { color: ${attributes.ptextPlaceholderColor}; }\n`;
        css += `.ts-field-popup textarea:-ms-input-placeholder { color: ${attributes.ptextPlaceholderColor}; }\n`;
    }

    // Padding
    if (attributes.ptextPadding) {
        const padding = attributes.ptextPadding as any;
        const top = parseValue(padding.top);
        const right = parseValue(padding.right);
        const bottom = parseValue(padding.bottom);
        const left = parseValue(padding.left);

        if (top || right || bottom || left) {
            const rules: string[] = [];
            if (top) rules.push(`padding-top: ${top};`);
            if (right) rules.push(`padding-right: ${right};`);
            if (bottom) rules.push(`padding-bottom: ${bottom};`);
            if (left) rules.push(`padding-left: ${left};`);
            if (rules.length) css += `.ts-field-popup textarea { ${rules.join(' ')} }\n`;
        }
    }

    // Border
    if (attributes.ptextBorder && (attributes.ptextBorder as any).type !== 'none') {
        const border = attributes.ptextBorder as any;
        const width = attributes.ptextBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-field-popup textarea { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.ptextBorderWidth_tablet !== undefined && attributes.ptextBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-field-popup textarea { border-width: ${attributes.ptextBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.ptextBorderWidth_mobile !== undefined && attributes.ptextBorderWidth_mobile !== attributes.ptextBorderWidth_tablet && attributes.ptextBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-field-popup textarea { border-width: ${attributes.ptextBorderWidth_mobile}px; } }\n`;
        }
    }

    if (attributes.ptextBgHover) css += `.ts-field-popup textarea:hover { background: ${attributes.ptextBgHover}; }\n`;

    // ========================================================================
    // POPUP: ALERT STYLES
    // ========================================================================

    // Shadow
    if (attributes.palertShadow) {
        const shadow = attributes.palertShadow as any;
        const h = shadow.horizontal || 0;
        const v = shadow.vertical || 0;
        const b = shadow.blur || 0;
        const s = shadow.spread || 0;
        const c = shadow.color || 'rgba(0, 0, 0, 0.5)';
        const pos = shadow.position === 'inset' ? 'inset ' : '';
        css += `.ts-notice { box-shadow: ${pos}${h}px ${v}px ${b}px ${s}px ${c}; }\n`;
    }

    // Border
    if (attributes.palertBorder && (attributes.palertBorder as any).type !== 'none') {
        const border = attributes.palertBorder as any;
        const width = attributes.palertBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-notice { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.palertBorderWidth_tablet !== undefined && attributes.palertBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-notice { border-width: ${attributes.palertBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.palertBorderWidth_mobile !== undefined && attributes.palertBorderWidth_mobile !== attributes.palertBorderWidth_tablet && attributes.palertBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-notice { border-width: ${attributes.palertBorderWidth_mobile}px; } }\n`;
        }
    }

    // Radius
    const palertRadius = attributes.palertRadius;
    const palertRadius_tablet = attributes.palertRadius_tablet;
    const palertRadius_mobile = attributes.palertRadius_mobile;
    const palertRadiusUnit = attributes.palertRadiusUnit || 'px';

    if (palertRadius !== undefined) css += `.ts-notice { border-radius: ${palertRadius}${palertRadiusUnit}; }\n`;
    if (palertRadius_tablet !== undefined && palertRadius_tablet !== palertRadius) css += `@media (max-width: 1024px) { .ts-notice { border-radius: ${palertRadius_tablet}${palertRadiusUnit}; } }\n`;
    if (palertRadius_mobile !== undefined && palertRadius_mobile !== palertRadius_tablet && palertRadius_mobile !== palertRadius) css += `@media (max-width: 768px) { .ts-notice { border-radius: ${palertRadius_mobile}${palertRadiusUnit}; } }\n`;

    // Colors
    if (attributes.palertBg) css += `.ts-notice { background-color: ${attributes.palertBg}; }\n`;
    if (attributes.palertDividerColor) css += `.a-btn { --alert-divider: ${attributes.palertDividerColor}; }\n`;

    // Typo & text color
    if (attributes.palertTypo) {
        const typoCSS = generateTypographyCSS(attributes.palertTypo);
        if (typoCSS) css += `.ts-notice .alert-msg { ${typoCSS} }\n`;
    }
    if (attributes.palertTextColor) css += `.ts-notice .alert-msg { color: ${attributes.palertTextColor}; }\n`;

    // Icons
    if (attributes.palertInfoColor) css += `.ts-notice { --al-info: ${attributes.palertInfoColor}; }\n`;
    if (attributes.palertErrorColor) css += `.ts-notice { --al-error: ${attributes.palertErrorColor}; }\n`;
    if (attributes.palertSuccessColor) css += `.ts-notice { --al-success: ${attributes.palertSuccessColor}; }\n`;

    // Link
    if (attributes.palertLinkTypo) {
        const typoCSS = generateTypographyCSS(attributes.palertLinkTypo);
        if (typoCSS) css += `.a-btn a { ${typoCSS} }\n`;
    }
    if (attributes.palertLinkColor) css += `.a-btn a { color: ${attributes.palertLinkColor}; }\n`;
    if (attributes.palertLinkColorHover) css += `.a-btn a:hover { color: ${attributes.palertLinkColorHover}; }\n`;
    if (attributes.palertLinkBgHover) css += `.a-btn a:hover { background-color: ${attributes.palertLinkBgHover}; }\n`;

    // ========================================================================
    // POPUP: DATEPICKER HEAD
    // ========================================================================

    // Icon size
    const pdhIconSize = attributes.pdhIconSize;
    const pdhIconSize_tablet = attributes.pdhIconSize_tablet;
    const pdhIconSize_mobile = attributes.pdhIconSize_mobile;
    const pdhIconSizeUnit = attributes.pdhIconSizeUnit || 'px';

    if (pdhIconSize) css += `.datepicker-head h3 { --ts-icon-size: ${pdhIconSize}${pdhIconSizeUnit}; }\n`;
    if (pdhIconSize_tablet !== undefined && pdhIconSize_tablet !== pdhIconSize) css += `@media (max-width: 1024px) { .datepicker-head h3 { --ts-icon-size: ${pdhIconSize_tablet}${pdhIconSizeUnit}; } }\n`;
    if (pdhIconSize_mobile !== undefined && pdhIconSize_mobile !== pdhIconSize_tablet && pdhIconSize_mobile !== pdhIconSize) css += `@media (max-width: 768px) { .datepicker-head h3 { --ts-icon-size: ${pdhIconSize_mobile}${pdhIconSizeUnit}; } }\n`;

    // Icon color
    if (attributes.pdhIconColor) css += `.datepicker-head h3 { --ts-icon-color: ${attributes.pdhIconColor}; }\n`;

    // Icon spacing
    const pdhIconSpacing = attributes.pdhIconSpacing;
    const pdhIconSpacing_tablet = attributes.pdhIconSpacing_tablet;
    const pdhIconSpacing_mobile = attributes.pdhIconSpacing_mobile;
    const pdhIconSpacingUnit = attributes.pdhIconSpacingUnit || 'px';

    if (pdhIconSpacing) css += `.datepicker-head h3 { gap: ${pdhIconSpacing}${pdhIconSpacingUnit}; }\n`;
    if (pdhIconSpacing_tablet !== undefined && pdhIconSpacing_tablet !== pdhIconSpacing) css += `@media (max-width: 1024px) { .datepicker-head h3 { gap: ${pdhIconSpacing_tablet}${pdhIconSpacingUnit}; } }\n`;
    if (pdhIconSpacing_mobile !== undefined && pdhIconSpacing_mobile !== pdhIconSpacing_tablet && pdhIconSpacing_mobile !== pdhIconSpacing) css += `@media (max-width: 768px) { .datepicker-head h3 { gap: ${pdhIconSpacing_mobile}${pdhIconSpacingUnit}; } }\n`;

    // Title color & typo
    if (attributes.pdhTitleColor) css += `.datepicker-head h3 { color: ${attributes.pdhTitleColor}; }\n`;
    if (attributes.pdhTitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pdhTitleTypo);
        if (typoCSS) css += `.datepicker-head h3 { ${typoCSS} }\n`;
    }

    // Subtitle color & typo
    if (attributes.pdhSubtitleColor) css += `.datepicker-head p { color: ${attributes.pdhSubtitleColor}; }\n`;
    if (attributes.pdhSubtitleTypo) {
        const typoCSS = generateTypographyCSS(attributes.pdhSubtitleTypo);
        if (typoCSS) css += `.datepicker-head p { ${typoCSS} }\n`;
    }

    // ========================================================================
    // POPUP: DATEPICKER TOOLTIPS
    // ========================================================================

    if (attributes.pdtBgColor) css += `.pika-tooltip { background-color: ${attributes.pdtBgColor}; }\n`;
    if (attributes.pdtTextColor) css += `.pika-tooltip { color: ${attributes.pdtTextColor}; }\n`;

    // Radius
    const pdtRadius = attributes.pdtRadius;
    const pdtRadius_tablet = attributes.pdtRadius_tablet;
    const pdtRadius_mobile = attributes.pdtRadius_mobile;
    const pdtRadiusUnit = attributes.pdtRadiusUnit || 'px';

    if (pdtRadius !== undefined) css += `.pika-tooltip { border-radius: ${pdtRadius}${pdtRadiusUnit}; }\n`;
    if (pdtRadius_tablet !== undefined && pdtRadius_tablet !== pdtRadius) css += `@media (max-width: 1024px) { .pika-tooltip { border-radius: ${pdtRadius_tablet}${pdtRadiusUnit}; } }\n`;
    if (pdtRadius_mobile !== undefined && pdtRadius_mobile !== pdtRadius_tablet && pdtRadius_mobile !== pdtRadius) css += `@media (max-width: 768px) { .pika-tooltip { border-radius: ${pdtRadius_mobile}${pdtRadiusUnit}; } }\n`;

    // ========================================================================
    // POPUP: NUMBER INPUT
    // ========================================================================

    // Size (Font size)
    const pnNumberInputSize = attributes.pnNumberInputSize;
    const pnNumberInputSize_tablet = attributes.pnNumberInputSize_tablet;
    const pnNumberInputSize_mobile = attributes.pnNumberInputSize_mobile;
    const pnNumberInputSizeUnit = attributes.pnNumberInputSizeUnit || 'px';

    if (pnNumberInputSize) css += `.ts-field-popup .ts-stepper-input input { font-size: ${pnNumberInputSize}${pnNumberInputSizeUnit}; }\n`;
    if (pnNumberInputSize_tablet !== undefined && pnNumberInputSize_tablet !== pnNumberInputSize) css += `@media (max-width: 1024px) { .ts-field-popup .ts-stepper-input input { font-size: ${pnNumberInputSize_tablet}${pnNumberInputSizeUnit}; } }\n`;
    if (pnNumberInputSize_mobile !== undefined && pnNumberInputSize_mobile !== pnNumberInputSize_tablet && pnNumberInputSize_mobile !== pnNumberInputSize) css += `@media (max-width: 768px) { .ts-field-popup .ts-stepper-input input { font-size: ${pnNumberInputSize_mobile}${pnNumberInputSizeUnit}; } }\n`;

    // ========================================================================
    // POPUP: RANGE SLIDER
    // ========================================================================

    // Value size
    const prRangeValueSize = attributes.prRangeValueSize;
    const prRangeValueSize_tablet = attributes.prRangeValueSize_tablet;
    const prRangeValueSize_mobile = attributes.prRangeValueSize_mobile;
    const prRangeValueSizeUnit = attributes.prRangeValueSizeUnit || 'px';

    if (prRangeValueSize) css += `.ts-field-popup .range-slider-wrapper .range-value { font-size: ${prRangeValueSize}${prRangeValueSizeUnit}; }\n`;
    if (prRangeValueSize_tablet !== undefined && prRangeValueSize_tablet !== prRangeValueSize) css += `@media (max-width: 1024px) { .ts-field-popup .range-slider-wrapper .range-value { font-size: ${prRangeValueSize_tablet}${prRangeValueSizeUnit}; } }\n`;
    if (prRangeValueSize_mobile !== undefined && prRangeValueSize_mobile !== prRangeValueSize_tablet && prRangeValueSize_mobile !== prRangeValueSize) css += `@media (max-width: 768px) { .ts-field-popup .range-slider-wrapper .range-value { font-size: ${prRangeValueSize_mobile}${prRangeValueSizeUnit}; } }\n`;

    if (attributes.prRangeValueColor) css += `.ts-field-popup .range-slider-wrapper .range-value { color: ${attributes.prRangeValueColor}; }\n`;
    if (attributes.prRangeBg) css += `.ts-field-popup .noUi-target { background-color: ${attributes.prRangeBg}; }\n`;
    if (attributes.prRangeBgSelected) css += `.ts-field-popup .noUi-connect { background-color: ${attributes.prRangeBgSelected}; }\n`;
    if (attributes.prRangeHandleBg) css += `.ts-field-popup .noUi-handle { background-color: ${attributes.prRangeHandleBg}; }\n`;

    // Handle border
    if (attributes.prRangeHandleBorder && (attributes.prRangeHandleBorder as any).type !== 'none') {
        const border = attributes.prRangeHandleBorder as any;
        const width = attributes.prRangeHandleBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-field-popup .noUi-handle { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.prRangeHandleBorderWidth_tablet !== undefined && attributes.prRangeHandleBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-field-popup .noUi-handle { border-width: ${attributes.prRangeHandleBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.prRangeHandleBorderWidth_mobile !== undefined && attributes.prRangeHandleBorderWidth_mobile !== attributes.prRangeHandleBorderWidth_tablet && attributes.prRangeHandleBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-field-popup .noUi-handle { border-width: ${attributes.prRangeHandleBorderWidth_mobile}px; } }\n`;
        }
    }

    // ========================================================================
    // POPUP: SWITCH
    // ========================================================================

    if (attributes.psSwitchBgInactive) css += `.ts-field-popup .onoffswitch .onoffswitch-label { background-color: ${attributes.psSwitchBgInactive}; }\n`;
    if (attributes.psSwitchBgActive) css += `.ts-field-popup .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label { background-color: ${attributes.psSwitchBgActive}; }\n`;
    if (attributes.psSwitchHandleBg) css += `.ts-field-popup .onoffswitch .onoffswitch-label:before { background-color: ${attributes.psSwitchHandleBg}; }\n`;

    // ========================================================================
    // POPUP: ICON BUTTON
    // ========================================================================

    // Normal state
    if (attributes.pibIconColor) {
        css += `.ts-field-popup .ts-icon-btn i { color: ${attributes.pibIconColor}; }\n`;
        css += `.ts-field-popup .ts-icon-btn svg { fill: ${attributes.pibIconColor}; }\n`;
    }
    if (attributes.pibBg) css += `.ts-field-popup .ts-icon-btn { background-color: ${attributes.pibBg}; }\n`;

    // Button border
    if (attributes.pibBorder && (attributes.pibBorder as any).type !== 'none') {
        const border = attributes.pibBorder as any;
        const width = attributes.pibBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-field-popup .ts-icon-btn { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.pibBorderWidth_tablet !== undefined && attributes.pibBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-field-popup .ts-icon-btn { border-width: ${attributes.pibBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.pibBorderWidth_mobile !== undefined && attributes.pibBorderWidth_mobile !== attributes.pibBorderWidth_tablet && attributes.pibBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-field-popup .ts-icon-btn { border-width: ${attributes.pibBorderWidth_mobile}px; } }\n`;
        }
    }

    // Border radius
    const pibRadius = attributes.pibRadius;
    const pibRadius_tablet = attributes.pibRadius_tablet;
    const pibRadius_mobile = attributes.pibRadius_mobile;
    const pibRadiusUnit = attributes.pibRadiusUnit || 'px';

    if (pibRadius !== undefined) css += `.ts-field-popup .ts-icon-btn { border-radius: ${pibRadius}${pibRadiusUnit}; }\n`;
    if (pibRadius_tablet !== undefined && pibRadius_tablet !== pibRadius) css += `@media (max-width: 1024px) { .ts-field-popup .ts-icon-btn { border-radius: ${pibRadius_tablet}${pibRadiusUnit}; } }\n`;
    if (pibRadius_mobile !== undefined && pibRadius_mobile !== pibRadius_tablet && pibRadius_mobile !== pibRadius) css += `@media (max-width: 768px) { .ts-field-popup .ts-icon-btn { border-radius: ${pibRadius_mobile}${pibRadiusUnit}; } }\n`;

    // Hover state
    if (attributes.pibIconColorHover) {
        css += `.ts-field-popup .ts-icon-btn:hover i { color: ${attributes.pibIconColorHover}; }\n`;
        css += `.ts-field-popup .ts-icon-btn:hover svg { fill: ${attributes.pibIconColorHover}; }\n`;
    }
    if (attributes.pibBgHover) css += `.ts-field-popup .ts-icon-btn:hover { background-color: ${attributes.pibBgHover}; }\n`;
    if (attributes.pibBorderColorHover) css += `.ts-field-popup .ts-icon-btn:hover { border-color: ${attributes.pibBorderColorHover}; }\n`;

    // ========================================================================
    // POPUP: FILE/GALLERY STYLES
    // ========================================================================

    // List Gap
    const pfItemGap = attributes.pfItemGap;
    const pfItemGap_tablet = attributes.pfItemGap_tablet;
    const pfItemGap_mobile = attributes.pfItemGap_mobile;

    if (pfItemGap) css += `.ts-field-popup .ts-file-list { grid-gap: ${pfItemGap}px; }\n`;
    if (pfItemGap_tablet !== undefined && pfItemGap_tablet !== pfItemGap) css += `@media (max-width: 1024px) { .ts-field-popup .ts-file-list { grid-gap: ${pfItemGap_tablet}px; } }\n`;
    if (pfItemGap_mobile !== undefined && pfItemGap_mobile !== pfItemGap_tablet && pfItemGap_mobile !== pfItemGap) css += `@media (max-width: 768px) { .ts-field-popup .ts-file-list { grid-gap: ${pfItemGap_mobile}px; } }\n`;

    // Uploader: Icon Color
    if (attributes.pfIconColor) {
        css += `.ts-field-popup .ts-file-upload i { color: ${attributes.pfIconColor}; }\n`;
        css += `.ts-field-popup .ts-file-upload svg { fill: ${attributes.pfIconColor}; }\n`;
    }

    // Uploader: Icon Size
    const pfIconSize = attributes.pfIconSize;
    const pfIconSize_tablet = attributes.pfIconSize_tablet;
    const pfIconSize_mobile = attributes.pfIconSize_mobile;

    if (pfIconSize) {
        css += `.ts-field-popup .ts-file-upload i { font-size: ${pfIconSize}px; }\n`;
        css += `.ts-field-popup .ts-file-upload svg { width: ${pfIconSize}px; height: ${pfIconSize}px; }\n`;
    }
    if (pfIconSize_tablet !== undefined && pfIconSize_tablet !== pfIconSize) {
        css += `@media (max-width: 1024px) { .ts-field-popup .ts-file-upload i { font-size: ${pfIconSize_tablet}px; } .ts-field-popup .ts-file-upload svg { width: ${pfIconSize_tablet}px; height: ${pfIconSize_tablet}px; } }\n`;
    }
    if (pfIconSize_mobile !== undefined && pfIconSize_mobile !== pfIconSize_tablet && pfIconSize_mobile !== pfIconSize) {
        css += `@media (max-width: 768px) { .ts-field-popup .ts-file-upload i { font-size: ${pfIconSize_mobile}px; } .ts-field-popup .ts-file-upload svg { width: ${pfIconSize_mobile}px; height: ${pfIconSize_mobile}px; } }\n`;
    }

    // Uploader: Background
    if (attributes.pfBackground) css += `.ts-field-popup .ts-file-upload { background-color: ${attributes.pfBackground}; }\n`;

    // Uploader: Border
    if (attributes.pfBorder && (attributes.pfBorder as any).type !== 'none') {
        const border = attributes.pfBorder as any;
        const width = attributes.pfBorderWidth || 1;
        const color = border.color || '#000';
        css += `.ts-field-popup .ts-file-upload { border: ${width}px ${border.type} ${color}; }\n`;

        if (attributes.pfBorderWidth_tablet !== undefined && attributes.pfBorderWidth_tablet !== width) {
            css += `@media (max-width: 1024px) { .ts-field-popup .ts-file-upload { border-width: ${attributes.pfBorderWidth_tablet}px; } }\n`;
        }
        if (attributes.pfBorderWidth_mobile !== undefined && attributes.pfBorderWidth_mobile !== attributes.pfBorderWidth_tablet && attributes.pfBorderWidth_mobile !== width) {
            css += `@media (max-width: 768px) { .ts-field-popup .ts-file-upload { border-width: ${attributes.pfBorderWidth_mobile}px; } }\n`;
        }
    }

    // Uploader: Border Radius
    const pfBorderRadius = attributes.pfBorderRadius;
    const pfBorderRadius_tablet = attributes.pfBorderRadius_tablet;
    const pfBorderRadius_mobile = attributes.pfBorderRadius_mobile;
    const pfBorderRadiusUnit = attributes.pfBorderRadiusUnit || 'px';

    if (pfBorderRadius !== undefined) css += `.ts-field-popup .ts-file-upload { border-radius: ${pfBorderRadius}${pfBorderRadiusUnit}; }\n`;
    if (pfBorderRadius_tablet !== undefined && pfBorderRadius_tablet !== pfBorderRadius) css += `@media (max-width: 1024px) { .ts-field-popup .ts-file-upload { border-radius: ${pfBorderRadius_tablet}${pfBorderRadiusUnit}; } }\n`;
    if (pfBorderRadius_mobile !== undefined && pfBorderRadius_mobile !== pfBorderRadius_tablet && pfBorderRadius_mobile !== pfBorderRadius) css += `@media (max-width: 768px) { .ts-field-popup .ts-file-upload { border-radius: ${pfBorderRadius_mobile}${pfBorderRadiusUnit}; } }\n`;

    // Uploader: Typography
    if (attributes.pfTypo) {
        const typoCSS = generateTypographyCSS(attributes.pfTypo);
        if (typoCSS) css += `.ts-field-popup .ts-file-upload .ts-upload-text { ${typoCSS} }\n`;
    }
    if (attributes.pfTextColor) css += `.ts-field-popup .ts-file-upload .ts-upload-text { color: ${attributes.pfTextColor}; }\n`;

    // Uploader: Hover
    if (attributes.pfBackgroundHover) css += `.ts-field-popup .ts-file-upload:hover { background-color: ${attributes.pfBackgroundHover}; }\n`;
    if (attributes.pfBorderColorHover) css += `.ts-field-popup .ts-file-upload:hover { border-color: ${attributes.pfBorderColorHover}; }\n`;
    if (attributes.pfTextColorHover) css += `.ts-field-popup .ts-file-upload:hover .ts-upload-text { color: ${attributes.pfTextColorHover}; }\n`;
    if (attributes.pfIconColorHover) {
        css += `.ts-field-popup .ts-file-upload:hover i { color: ${attributes.pfIconColorHover}; }\n`;
        css += `.ts-field-popup .ts-file-upload:hover svg { fill: ${attributes.pfIconColorHover}; }\n`;
    }

    // Added File: Radius
    const pfAddedBorderRadius = attributes.pfAddedBorderRadius;
    const pfAddedBorderRadius_tablet = attributes.pfAddedBorderRadius_tablet;
    const pfAddedBorderRadius_mobile = attributes.pfAddedBorderRadius_mobile;
    const pfAddedBorderRadiusUnit = attributes.pfAddedBorderRadiusUnit || 'px';

    if (pfAddedBorderRadius !== undefined) css += `.ts-field-popup .ts-file-list li { border-radius: ${pfAddedBorderRadius}${pfAddedBorderRadiusUnit}; }\n`;
    if (pfAddedBorderRadius_tablet !== undefined && pfAddedBorderRadius_tablet !== pfAddedBorderRadius) css += `@media (max-width: 1024px) { .ts-field-popup .ts-file-list li { border-radius: ${pfAddedBorderRadius_tablet}${pfAddedBorderRadiusUnit}; } }\n`;
    if (pfAddedBorderRadius_mobile !== undefined && pfAddedBorderRadius_mobile !== pfAddedBorderRadius_tablet && pfAddedBorderRadius_mobile !== pfAddedBorderRadius) css += `@media (max-width: 768px) { .ts-field-popup .ts-file-list li { border-radius: ${pfAddedBorderRadius_mobile}${pfAddedBorderRadiusUnit}; } }\n`;

    // Added File: Background
    if (attributes.pfAddedBackground) css += `.ts-field-popup .ts-file-list li { background-color: ${attributes.pfAddedBackground}; }\n`;

    // Added File: Icon Color
    if (attributes.pfAddedIconColor) {
        css += `.ts-field-popup .ts-file-list li .ts-file-icon i { color: ${attributes.pfAddedIconColor}; }\n`;
        css += `.ts-field-popup .ts-file-list li .ts-file-icon svg { fill: ${attributes.pfAddedIconColor}; }\n`;
    }

    // Added File: Icon Size
    const pfAddedIconSize = attributes.pfAddedIconSize;
    const pfAddedIconSize_tablet = attributes.pfAddedIconSize_tablet;
    const pfAddedIconSize_mobile = attributes.pfAddedIconSize_mobile;
    const pfAddedIconSizeUnit = attributes.pfAddedIconSizeUnit || 'px';

    if (pfAddedIconSize) {
        css += `.ts-field-popup .ts-file-list li .ts-file-icon i { font-size: ${pfAddedIconSize}${pfAddedIconSizeUnit}; }\n`;
        css += `.ts-field-popup .ts-file-list li .ts-file-icon svg { width: ${pfAddedIconSize}${pfAddedIconSizeUnit}; height: ${pfAddedIconSize}${pfAddedIconSizeUnit}; }\n`;
    }
    if (pfAddedIconSize_tablet !== undefined && pfAddedIconSize_tablet !== pfAddedIconSize) {
        css += `@media (max-width: 1024px) { .ts-field-popup .ts-file-list li .ts-file-icon i { font-size: ${pfAddedIconSize_tablet}${pfAddedIconSizeUnit}; } .ts-field-popup .ts-file-list li .ts-file-icon svg { width: ${pfAddedIconSize_tablet}${pfAddedIconSizeUnit}; height: ${pfAddedIconSize_tablet}${pfAddedIconSizeUnit}; } }\n`;
    }
    if (pfAddedIconSize_mobile !== undefined && pfAddedIconSize_mobile !== pfAddedIconSize_tablet && pfAddedIconSize_mobile !== pfAddedIconSize) {
        css += `@media (max-width: 768px) { .ts-field-popup .ts-file-list li .ts-file-icon i { font-size: ${pfAddedIconSize_mobile}${pfAddedIconSizeUnit}; } .ts-field-popup .ts-file-list li .ts-file-icon svg { width: ${pfAddedIconSize_mobile}${pfAddedIconSizeUnit}; height: ${pfAddedIconSize_mobile}${pfAddedIconSizeUnit}; } }\n`;
    }

    // Added File: Typography
    if (attributes.pfAddedTypo) {
        const typoCSS = generateTypographyCSS(attributes.pfAddedTypo);
        if (typoCSS) css += `.ts-field-popup .ts-file-list li .ts-file-info { ${typoCSS} }\n`;
    }
    if (attributes.pfAddedTextColor) css += `.ts-field-popup .ts-file-list li .ts-file-info { color: ${attributes.pfAddedTextColor}; }\n`;

    // Remove Button: Background
    if (attributes.pfRemoveBackground) css += `.ts-field-popup .ts-remove-file { background-color: ${attributes.pfRemoveBackground}; }\n`;
    if (attributes.pfRemoveBackgroundHover) css += `.ts-field-popup .ts-file-list li:hover .ts-remove-file { background-color: ${attributes.pfRemoveBackgroundHover}; }\n`;

    // Remove Button: Color
    if (attributes.pfRemoveColor) {
        css += `.ts-field-popup .ts-remove-file i { color: ${attributes.pfRemoveColor}; }\n`;
        css += `.ts-field-popup .ts-remove-file svg { fill: ${attributes.pfRemoveColor}; }\n`;
    }
    if (attributes.pfRemoveColorHover) {
        css += `.ts-field-popup .ts-file-list li:hover .ts-remove-file i { color: ${attributes.pfRemoveColorHover}; }\n`;
        css += `.ts-field-popup .ts-file-list li:hover .ts-remove-file svg { fill: ${attributes.pfRemoveColorHover}; }\n`;
    }

    // Remove Button: Radius
    const pfRemoveBorderRadius = attributes.pfRemoveBorderRadius;
    const pfRemoveBorderRadius_tablet = attributes.pfRemoveBorderRadius_tablet;
    const pfRemoveBorderRadius_mobile = attributes.pfRemoveBorderRadius_mobile;
    const pfRemoveBorderRadiusUnit = attributes.pfRemoveBorderRadiusUnit || 'px';

    if (pfRemoveBorderRadius !== undefined) css += `.ts-field-popup .ts-remove-file { border-radius: ${pfRemoveBorderRadius}${pfRemoveBorderRadiusUnit}; }\n`;
    if (pfRemoveBorderRadius_tablet !== undefined && pfRemoveBorderRadius_tablet !== pfRemoveBorderRadius) css += `@media (max-width: 1024px) { .ts-field-popup .ts-remove-file { border-radius: ${pfRemoveBorderRadius_tablet}${pfRemoveBorderRadiusUnit}; } }\n`;
    if (pfRemoveBorderRadius_mobile !== undefined && pfRemoveBorderRadius_mobile !== pfRemoveBorderRadius_tablet && pfRemoveBorderRadius_mobile !== pfRemoveBorderRadius) css += `@media (max-width: 768px) { .ts-field-popup .ts-remove-file { border-radius: ${pfRemoveBorderRadius_mobile}${pfRemoveBorderRadiusUnit}; } }\n`;

    // Remove Button: Size
    const pfRemoveSize = attributes.pfRemoveSize;
    const pfRemoveSize_tablet = attributes.pfRemoveSize_tablet;
    const pfRemoveSize_mobile = attributes.pfRemoveSize_mobile;

    if (pfRemoveSize) css += `.ts-field-popup .ts-remove-file { width: ${pfRemoveSize}px; height: ${pfRemoveSize}px; }\n`;
    if (pfRemoveSize_tablet !== undefined && pfRemoveSize_tablet !== pfRemoveSize) css += `@media (max-width: 1024px) { .ts-field-popup .ts-remove-file { width: ${pfRemoveSize_tablet}px; height: ${pfRemoveSize_tablet}px; } }\n`;
    if (pfRemoveSize_mobile !== undefined && pfRemoveSize_mobile !== pfRemoveSize_tablet && pfRemoveSize_mobile !== pfRemoveSize) css += `@media (max-width: 768px) { .ts-field-popup .ts-remove-file { width: ${pfRemoveSize_mobile}px; height: ${pfRemoveSize_mobile}px; } }\n`;

    // Remove Button: Icon Size
    const pfRemoveIconSize = attributes.pfRemoveIconSize;
    const pfRemoveIconSize_tablet = attributes.pfRemoveIconSize_tablet;
    const pfRemoveIconSize_mobile = attributes.pfRemoveIconSize_mobile;

    if (pfRemoveIconSize) {
        css += `.ts-field-popup .ts-remove-file i { font-size: ${pfRemoveIconSize}px; }\n`;
        css += `.ts-field-popup .ts-remove-file svg { width: ${pfRemoveIconSize}px; height: ${pfRemoveIconSize}px; }\n`;
    }
    if (pfRemoveIconSize_tablet !== undefined && pfRemoveIconSize_tablet !== pfRemoveIconSize) {
        css += `@media (max-width: 1024px) { .ts-field-popup .ts-remove-file i { font-size: ${pfRemoveIconSize_tablet}px; } .ts-field-popup .ts-remove-file svg { width: ${pfRemoveIconSize_tablet}px; height: ${pfRemoveIconSize_tablet}px; } }\n`;
    }
    if (pfRemoveIconSize_mobile !== undefined && pfRemoveIconSize_mobile !== pfRemoveIconSize_tablet && pfRemoveIconSize_mobile !== pfRemoveIconSize) {
        css += `@media (max-width: 768px) { .ts-field-popup .ts-remove-file i { font-size: ${pfRemoveIconSize_mobile}px; } .ts-field-popup .ts-remove-file svg { width: ${pfRemoveIconSize_mobile}px; height: ${pfRemoveIconSize_mobile}px; } }\n`;
    }

    return css;
}

/**
 * Helper function to generate typography CSS from typography object
 * 
 * @param typo Typography object from attributes
 * @returns CSS string
 */
function generateTypographyCSS(typo: any): string {
    const rules: string[] = [];

    if (typo.fontFamily) {
        rules.push(`font-family: ${typo.fontFamily};`);
    }

    if (typo.fontSize) {
        const unit = typo.fontSizeUnit || 'px';
        rules.push(`font-size: ${typo.fontSize}${unit};`);
    }

    if (typo.fontWeight) {
        rules.push(`font-weight: ${typo.fontWeight};`);
    }

    if (typo.lineHeight) {
        const unit = typo.lineHeightUnit || 'px';
        rules.push(`line-height: ${typo.lineHeight}${unit};`);
    }

    if (typo.textTransform && typo.textTransform !== 'none') {
        rules.push(`text-transform: ${typo.textTransform};`);
    }

    if (typo.fontStyle) {
        rules.push(`font-style: ${typo.fontStyle};`);
    }

    if (typo.textDecoration) {
        rules.push(`text-decoration: ${typo.textDecoration};`);
    }

    if (typo.letterSpacing) {
        const unit = typo.letterSpacingUnit || 'px';
        rules.push(`letter-spacing: ${typo.letterSpacing}${unit};`);
    }

    if (typo.wordSpacing) {
        const unit = typo.wordSpacingUnit || 'px';
        rules.push(`word-spacing: ${typo.wordSpacing}${unit};`);
    }

    return rules.join(' ');
}

/**
 * Helper function to parse values with units
 * 
 * @param value Value to parse
 * @returns Value with unit or null
 */
function parseValue(value: any): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    // If it's already a string with unit, return as-is
    if (typeof value === 'string' && /^[\d.]+(px|%|em|rem|vw|vh)$/.test(value)) {
        return value;
    }
    // If it's a number, assume px
    const num = parseFloat(value);
    if (isNaN(num)) {
        return null;
    }
    return `${num}px`;
}
