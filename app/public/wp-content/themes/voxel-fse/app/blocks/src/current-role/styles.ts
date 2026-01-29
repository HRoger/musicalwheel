/**
 * Current Role Block - Style Generation
 *
 * Generates CSS for block-specific Voxel classes.
 * Matches Voxel's current-role widget styling structure.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/current-role.php
 *
 * @package VoxelFSE
 */

import type { CurrentRoleAttributes, TypographyValue, BoxShadowValue, BorderValue, BoxValues } from './types';

/**
 * Generate typography CSS properties from config
 */
function generateTypographyCSS(typography: TypographyValue | undefined): string {
    if (!typography) return '';
    const rules: string[] = [];

    if (typography.fontFamily) {
        rules.push(`font-family: ${typography.fontFamily};`);
    }
    if (typography.fontSize !== undefined) {
        const unit = (typography as any).fontSizeUnit || 'px';
        rules.push(`font-size: ${typography.fontSize}${unit};`);
    }
    if (typography.fontWeight) {
        rules.push(`font-weight: ${typography.fontWeight};`);
    }
    if ((typography as any).fontStyle && (typography as any).fontStyle !== 'default') {
        rules.push(`font-style: ${(typography as any).fontStyle};`);
    }
    if ((typography as any).textDecoration && (typography as any).textDecoration !== 'none') {
        rules.push(`text-decoration: ${(typography as any).textDecoration};`);
    }
    if (typography.lineHeight !== undefined) {
        const unit = (typography as any).lineHeightUnit || '';
        rules.push(`line-height: ${typography.lineHeight}${unit};`);
    }
    if (typography.letterSpacing !== undefined) {
        const unit = (typography as any).letterSpacingUnit || 'px';
        rules.push(`letter-spacing: ${typography.letterSpacing}${unit};`);
    }
    if (typography.textTransform && typography.textTransform !== 'none') {
        rules.push(`text-transform: ${typography.textTransform};`);
    }

    return rules.join(' ');
}

/**
 * Generate box shadow CSS from config
 */
function generateBoxShadowCSS(shadow: BoxShadowValue | undefined): string {
    if (!shadow) return '';
    if (!shadow.horizontal && !shadow.vertical && !shadow.blur && !shadow.spread) {
        return '';
    }
    return `${shadow.horizontal || 0}px ${shadow.vertical || 0}px ${shadow.blur || 0}px ${shadow.spread || 0}px ${shadow.color || 'rgba(0,0,0,0.1)'}`;
}

/**
 * Generate border CSS from BorderValue
 */
function generateBorderCSS(border: BorderValue | undefined): string {
    if (!border) return '';
    const rules: string[] = [];

    if (border.borderType && border.borderType !== 'none') {
        rules.push(`border-style: ${border.borderType}`);
    }
    if (border.borderWidth) {
        const widthCSS = generateDimensionsCSS(border.borderWidth, 'border-width');
        if (widthCSS) {
            rules.push(widthCSS);
        }
    }
    if (border.borderColor) {
        rules.push(`border-color: ${border.borderColor}`);
    }

    return rules.join('; ');
}

/**
 * Parse dimension value safely (handles empty strings from DimensionsControl)
 */
function parseDimension(val: string | number | undefined): number {
    if (val === undefined || val === '') return 0;
    const parsed = parseFloat(String(val));
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Generate dimensions CSS (padding, margin, etc.)
 */
function generateDimensionsCSS(dimensions: BoxValues | undefined, property: string = 'padding'): string {
    if (!dimensions) return '';
    const top = parseDimension(dimensions.top);
    const right = parseDimension(dimensions.right);
    const bottom = parseDimension(dimensions.bottom);
    const left = parseDimension(dimensions.left);
    const unit = (dimensions as any).unit || 'px';
    return `${property}: ${top}${unit} ${right}${unit} ${bottom}${unit} ${left}${unit}`;
}

/**
 * Generate responsive CSS for Current Role block
 * Targets Voxel classes: .ts-panel, .ac-head, .ac-body, .ts-btn-1
 */
export function generateCurrentRoleResponsiveCSS(
    attributes: CurrentRoleAttributes,
    blockId: string
): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];
    const selector = `.voxel-fse-current-role-${blockId}`;

    // ============================================
    // PANEL ACCORDION
    // Source: current-role.php
    // ============================================

    // Border - panel_border
    if (attributes.panelBorder) {
        const borderCSS = generateBorderCSS(attributes.panelBorder);
        if (borderCSS) {
            cssRules.push(`${selector} .ts-panel { ${borderCSS} }`);
        }
    }

    // Border radius - panel_radius
    if (attributes.panelRadius !== undefined) {
        cssRules.push(`${selector} .ts-panel { border-radius: ${attributes.panelRadius}px; }`);
    }
    if (attributes['panelRadius_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-panel { border-radius: ${attributes['panelRadius_tablet']}px; }`);
    }
    if (attributes['panelRadius_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-panel { border-radius: ${attributes['panelRadius_mobile']}px; }`);
    }

    // Background - panel_bg
    if (attributes.panelBg) {
        cssRules.push(`${selector} .ts-panel { background-color: ${attributes.panelBg}; }`);
    }

    // Box Shadow - panel_shadow
    if (attributes.panelShadow) {
        const shadowCSS = generateBoxShadowCSS(attributes.panelShadow);
        if (shadowCSS) {
            cssRules.push(`${selector} .ts-panel { box-shadow: ${shadowCSS}; }`);
        }
    }

    // ============================================
    // PANEL HEAD
    // Source: current-role.php
    // ============================================

    // Padding - head_padding
    if (attributes.headPadding) {
        const paddingCSS = generateDimensionsCSS(attributes.headPadding, 'padding');
        if (paddingCSS) {
            cssRules.push(`${selector} .ac-head { ${paddingCSS} }`);
        }
    }

    // Icon size - head_ico_size
    if (attributes.headIcoSize !== undefined) {
        cssRules.push(`${selector} .ts-panel .ac-head i { font-size: ${attributes.headIcoSize}px; }`);
        cssRules.push(`${selector} .ts-panel .ac-head svg { width: ${attributes.headIcoSize}px; height: ${attributes.headIcoSize}px; }`);
    }
    if (attributes['headIcoSize_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-panel .ac-head i { font-size: ${attributes['headIcoSize_tablet']}px; }`);
        tabletRules.push(`${selector} .ts-panel .ac-head svg { width: ${attributes['headIcoSize_tablet']}px; height: ${attributes['headIcoSize_tablet']}px; }`);
    }
    if (attributes['headIcoSize_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-panel .ac-head i { font-size: ${attributes['headIcoSize_mobile']}px; }`);
        mobileRules.push(`${selector} .ts-panel .ac-head svg { width: ${attributes['headIcoSize_mobile']}px; height: ${attributes['headIcoSize_mobile']}px; }`);
    }

    // Icon right margin - head_ico_margin
    if (attributes.headIcoMargin !== undefined) {
        cssRules.push(`${selector} .ts-panel .ac-head i { margin-right: ${attributes.headIcoMargin}px; }`);
        cssRules.push(`${selector} .ts-panel .ac-head svg { margin-right: ${attributes.headIcoMargin}px; }`);
    }
    if (attributes['headIcoMargin_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-panel .ac-head i { margin-right: ${attributes['headIcoMargin_tablet']}px; }`);
        tabletRules.push(`${selector} .ts-panel .ac-head svg { margin-right: ${attributes['headIcoMargin_tablet']}px; }`);
    }
    if (attributes['headIcoMargin_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-panel .ac-head i { margin-right: ${attributes['headIcoMargin_mobile']}px; }`);
        mobileRules.push(`${selector} .ts-panel .ac-head svg { margin-right: ${attributes['headIcoMargin_mobile']}px; }`);
    }

    // Icon color - head_ico_col
    if (attributes.headIcoCol) {
        cssRules.push(`${selector} .ts-panel .ac-head i { color: ${attributes.headIcoCol}; }`);
        cssRules.push(`${selector} .ts-panel .ac-head svg { fill: ${attributes.headIcoCol}; }`);
    }

    // Typography - head_typo
    if (attributes.headTypo) {
        const typoCSS = generateTypographyCSS(attributes.headTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ts-panel .ac-head b { ${typoCSS} }`);
        }
    }

    // Text color - head_typo_col
    if (attributes.headTypoCol) {
        cssRules.push(`${selector} .ts-panel .ac-head b { color: ${attributes.headTypoCol}; }`);
    }

    // Separator color - head_border_col
    if (attributes.headBorderCol) {
        cssRules.push(`${selector} .ts-panel .ac-head { border-color: ${attributes.headBorderCol}; }`); // Voxel uses border-color for ac-head (usually border-bottom)
    }

    // ============================================
    // PANEL BODY
    // Source: current-role.php
    // ============================================

    // Body spacing - panel_spacing
    if (attributes.panelSpacing !== undefined) {
        cssRules.push(`${selector} .ac-body { padding: ${attributes.panelSpacing}px; }`);
    }
    if (attributes['panelSpacing_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ac-body { padding: ${attributes['panelSpacing_tablet']}px; }`);
    }
    if (attributes['panelSpacing_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ac-body { padding: ${attributes['panelSpacing_mobile']}px; }`);
    }

    // Body content gap - panel_gap
    if (attributes.panelGap !== undefined) {
        cssRules.push(`${selector} .ac-body { display: flex; flex-direction: column; grid-gap: ${attributes.panelGap}px; }`);
    }
    if (attributes['panelGap_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ac-body { display: flex; flex-direction: column; grid-gap: ${attributes['panelGap_tablet']}px; }`);
    }
    if (attributes['panelGap_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ac-body { display: flex; flex-direction: column; grid-gap: ${attributes['panelGap_mobile']}px; }`);
    }

    // Align text - text_align
    if (attributes.textAlign) {
        cssRules.push(`${selector} .ac-body { text-align: ${attributes.textAlign}; }`);
    }

    // Typography - body_typo
    if (attributes.bodyTypo) {
        const typoCSS = generateTypographyCSS(attributes.bodyTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ts-panel .ac-body p { ${typoCSS} }`);
        }
    }

    // Text color - body_typo_col
    if (attributes.bodyTypoCol) {
        cssRules.push(`${selector} .ts-panel .ac-body p { color: ${attributes.bodyTypoCol}; }`);
    }

    // ============================================
    // PANEL BUTTONS
    // Source: current-role.php
    // ============================================

    // Item gap - panel_buttons_gap
    if (attributes.panelButtonsGap !== undefined) {
        cssRules.push(`${selector} .current-plan-btn { grid-gap: ${attributes.panelButtonsGap}px; }`);
    }
    if (attributes['panelButtonsGap_tablet'] !== undefined) {
        tabletRules.push(`${selector} .current-plan-btn { grid-gap: ${attributes['panelButtonsGap_tablet']}px; }`);
    }
    if (attributes['panelButtonsGap_mobile'] !== undefined) {
        mobileRules.push(`${selector} .current-plan-btn { grid-gap: ${attributes['panelButtonsGap_mobile']}px; }`);
    }

    // ============================================
    // SECONDARY BUTTON - NORMAL STATE
    // Source: current-role.php
    // ============================================

    // Button typography - scnd_btn_typo
    if (attributes.scndBtnTypo) {
        const typoCSS = generateTypographyCSS(attributes.scndBtnTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ts-btn-1 { ${typoCSS} }`);
        }
    }

    // Border radius - scnd_btn_radius
    if (attributes.scndBtnRadius !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.scndBtnRadius}px; }`);
    }
    if (attributes['scndBtnRadius_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes['scndBtnRadius_tablet']}px; }`);
    }
    if (attributes['scndBtnRadius_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes['scndBtnRadius_mobile']}px; }`);
    }

    // Text color - scnd_btn_c
    if (attributes.scndBtnC) {
        cssRules.push(`${selector} .ts-btn-1 { color: ${attributes.scndBtnC}; }`);
    }

    // Padding - scnd_btn_padding
    if (attributes.scndBtnPadding) {
        const paddingCSS = generateDimensionsCSS(attributes.scndBtnPadding, 'padding');
        if (paddingCSS) {
            cssRules.push(`${selector} .ts-btn-1 { ${paddingCSS} }`);
        }
    }

    // Height - scnd_btn_height
    if (attributes.scndBtnHeight !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 { height: ${attributes.scndBtnHeight}px; }`);
    }
    if (attributes['scndBtnHeight_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 { height: ${attributes['scndBtnHeight_tablet']}px; }`);
    }
    if (attributes['scndBtnHeight_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 { height: ${attributes['scndBtnHeight_mobile']}px; }`);
    }

    // Background color - scnd_btn_bg
    if (attributes.scndBtnBg) {
        cssRules.push(`${selector} .ts-btn-1 { background: ${attributes.scndBtnBg}; }`);
    }

    // Border - scnd_btn_border
    if (attributes.scndBtnBorder) {
        const borderCSS = generateBorderCSS(attributes.scndBtnBorder);
        if (borderCSS) {
            cssRules.push(`${selector} .ts-btn-1 { ${borderCSS} }`);
        }
    }

    // Icon size - scnd_btn_icon_size
    if (attributes.scndBtnIconSize !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.scndBtnIconSize}px; }`);
        cssRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.scndBtnIconSize}px; height: ${attributes.scndBtnIconSize}px; }`);
    }
    if (attributes['scndBtnIconSize_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes['scndBtnIconSize_tablet']}px; }`);
        tabletRules.push(`${selector} .ts-btn-1 svg { width: ${attributes['scndBtnIconSize_tablet']}px; height: ${attributes['scndBtnIconSize_tablet']}px; }`);
    }
    if (attributes['scndBtnIconSize_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes['scndBtnIconSize_mobile']}px; }`);
        mobileRules.push(`${selector} .ts-btn-1 svg { width: ${attributes['scndBtnIconSize_mobile']}px; height: ${attributes['scndBtnIconSize_mobile']}px; }`);
    }

    // Icon/Text spacing - scnd_btn_icon_pad
    if (attributes.scndBtnIconPad !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 { grid-gap: ${attributes.scndBtnIconPad}px; }`);
    }
    if (attributes['scndBtnIconPad_tablet'] !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 { grid-gap: ${attributes['scndBtnIconPad_tablet']}px; }`);
    }
    if (attributes['scndBtnIconPad_mobile'] !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 { grid-gap: ${attributes['scndBtnIconPad_mobile']}px; }`);
    }

    // Icon color - scnd_btn_icon_color
    if (attributes.scndBtnIconColor) {
        cssRules.push(`${selector} .ts-btn-1 i { color: ${attributes.scndBtnIconColor}; }`);
        cssRules.push(`${selector} .ts-btn-1 svg { fill: ${attributes.scndBtnIconColor}; }`);
    }

    // ============================================
    // SECONDARY BUTTON - HOVER STATE
    // Source: current-role.php
    // ============================================

    // Text color (Hover) - scnd_btn_c_h
    if (attributes.scndBtnCH) {
        cssRules.push(`${selector} .ts-btn-1:hover { color: ${attributes.scndBtnCH}; }`);
    }

    // Background color (Hover) - scnd_btn_bg_h
    if (attributes.scndBtnBgH) {
        cssRules.push(`${selector} .ts-btn-1:hover { background: ${attributes.scndBtnBgH}; }`);
    }

    // Border color (Hover) - scnd_btn_border_h
    if (attributes.scndBtnBorderH) {
        cssRules.push(`${selector} .ts-btn-1:hover { border-color: ${attributes.scndBtnBorderH}; }`);
    }

    // Icon color (Hover) - scnd_btn_icon_color_h
    if (attributes.scndBtnIconColorH) {
        cssRules.push(`${selector} .ts-btn-1:hover i { color: ${attributes.scndBtnIconColorH}; }`);
        cssRules.push(`${selector} .ts-btn-1:hover svg { fill: ${attributes.scndBtnIconColorH}; }`);
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
