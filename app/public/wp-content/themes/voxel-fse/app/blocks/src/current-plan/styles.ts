/**
 * Current Plan Block - Style Generation
 *
 * Generates CSS for block-specific Voxel classes.
 * Matches Voxel's current-plan widget styling structure.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php:L105-L774
 *
 * @package VoxelFSE
 */

import type { CurrentPlanAttributes, TypographyValue, BoxShadowValue, BorderValue, BoxValues } from './types';

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
 * Generate responsive CSS for Current Plan block
 * Targets Voxel classes: .ts-panel, .ac-head, .ac-body, .ac-plan-pricing, .ts-btn-1
 */
export function generateCurrentPlanResponsiveCSS(
    attributes: CurrentPlanAttributes,
    blockId: string
): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];
    const selector = `.voxel-fse-current-plan-${blockId}`;

    // ============================================
    // PANEL ACCORDION
    // Source: current-plan-widget.php:L105-L520
    // ============================================

    // Panel gap - L113-L130
    if (attributes.panelsSpacing !== undefined) {
        cssRules.push(`${selector} { display: flex; flex-direction: column; grid-gap: ${attributes.panelsSpacing}px; }`);
    }
    if (attributes.panelsSpacing_tablet !== undefined) {
        tabletRules.push(`${selector} { display: flex; flex-direction: column; grid-gap: ${attributes.panelsSpacing_tablet}px; }`);
    }
    if (attributes.panelsSpacing_mobile !== undefined) {
        mobileRules.push(`${selector} { display: flex; flex-direction: column; grid-gap: ${attributes.panelsSpacing_mobile}px; }`);
    }

    // Border - L132-L139
    if (attributes.panelBorder) {
        const borderCSS = generateBorderCSS(attributes.panelBorder);
        if (borderCSS) {
            cssRules.push(`${selector} .ts-panel { ${borderCSS} }`);
        }
    }

    // Border radius - L142-L163
    if (attributes.panelRadius !== undefined) {
        cssRules.push(`${selector} .ts-panel { border-radius: ${attributes.panelRadius}px; }`);
    }
    if (attributes.panelRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .ts-panel { border-radius: ${attributes.panelRadius_tablet}px; }`);
    }
    if (attributes.panelRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .ts-panel { border-radius: ${attributes.panelRadius_mobile}px; }`);
    }

    // Background - L165-L175
    if (attributes.panelBg) {
        cssRules.push(`${selector} .ts-panel { background-color: ${attributes.panelBg}; }`);
    }

    // Box Shadow - L177-L184
    if (attributes.panelShadow) {
        const shadowCSS = generateBoxShadowCSS(attributes.panelShadow);
        if (shadowCSS) {
            cssRules.push(`${selector} .ts-panel { box-shadow: ${shadowCSS}; }`);
        }
    }

    // ============================================
    // PANEL HEAD
    // Source: current-plan-widget.php:L186-L295
    // ============================================

    // Padding - L195-L205
    if (attributes.headPadding) {
        const paddingCSS = generateDimensionsCSS(attributes.headPadding, 'padding');
        if (paddingCSS) {
            cssRules.push(`${selector} .ac-head { ${paddingCSS} }`);
        }
    }

    // Icon size - L207-L229
    if (attributes.headIcoSize !== undefined) {
        cssRules.push(`${selector} .ac-head > i { font-size: ${attributes.headIcoSize}px; }`);
        cssRules.push(`${selector} .ac-head > svg { width: ${attributes.headIcoSize}px; height: ${attributes.headIcoSize}px; }`);
    }
    if (attributes.headIcoSize_tablet !== undefined) {
        tabletRules.push(`${selector} .ac-head > i { font-size: ${attributes.headIcoSize_tablet}px; }`);
        tabletRules.push(`${selector} .ac-head > svg { width: ${attributes.headIcoSize_tablet}px; height: ${attributes.headIcoSize_tablet}px; }`);
    }
    if (attributes.headIcoSize_mobile !== undefined) {
        mobileRules.push(`${selector} .ac-head > i { font-size: ${attributes.headIcoSize_mobile}px; }`);
        mobileRules.push(`${selector} .ac-head > svg { width: ${attributes.headIcoSize_mobile}px; height: ${attributes.headIcoSize_mobile}px; }`);
    }

    // Icon right margin - L231-L249
    if (attributes.headIcoMargin !== undefined) {
        cssRules.push(`${selector} .ac-head > i { margin-right: ${attributes.headIcoMargin}px; }`);
        cssRules.push(`${selector} .ac-head > svg { margin-right: ${attributes.headIcoMargin}px; }`);
    }
    if (attributes.headIcoMargin_tablet !== undefined) {
        tabletRules.push(`${selector} .ac-head > i { margin-right: ${attributes.headIcoMargin_tablet}px; }`);
        tabletRules.push(`${selector} .ac-head > svg { margin-right: ${attributes.headIcoMargin_tablet}px; }`);
    }
    if (attributes.headIcoMargin_mobile !== undefined) {
        mobileRules.push(`${selector} .ac-head > i { margin-right: ${attributes.headIcoMargin_mobile}px; }`);
        mobileRules.push(`${selector} .ac-head > svg { margin-right: ${attributes.headIcoMargin_mobile}px; }`);
    }

    // Icon color - L251-L262
    if (attributes.headIcoCol) {
        cssRules.push(`${selector} .ac-head > i { color: ${attributes.headIcoCol}; }`);
        cssRules.push(`${selector} .ac-head > svg { fill: ${attributes.headIcoCol}; }`);
    }

    // Typography - L264-L271
    if (attributes.headTypo) {
        const typoCSS = generateTypographyCSS(attributes.headTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ac-head b { ${typoCSS} }`);
        }
    }

    // Text color - L273-L283
    if (attributes.headTypoCol) {
        cssRules.push(`${selector} .ac-head b { color: ${attributes.headTypoCol}; }`);
    }

    // Separator color - L285-L295
    if (attributes.headBorderCol) {
        cssRules.push(`${selector} .ac-head { border-bottom-color: ${attributes.headBorderCol}; }`);
    }

    // ============================================
    // PANEL PRICING
    // Source: current-plan-widget.php:L297-L365
    // ============================================

    // Align content - L306-L322
    if (attributes.priceAlign) {
        cssRules.push(`${selector} .ac-plan-pricing { justify-content: ${attributes.priceAlign}; }`);
    }

    // Price typography - L324-L331
    if (attributes.priceTypo) {
        const typoCSS = generateTypographyCSS(attributes.priceTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ac-plan-price { ${typoCSS} }`);
        }
    }

    // Price text color - L333-L343
    if (attributes.priceCol) {
        cssRules.push(`${selector} .ac-plan-price { color: ${attributes.priceCol}; }`);
    }

    // Period typography - L345-L352
    if (attributes.periodTypo) {
        const typoCSS = generateTypographyCSS(attributes.periodTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ac-price-period { ${typoCSS} }`);
        }
    }

    // Period text color - L354-L364
    if (attributes.periodCol) {
        cssRules.push(`${selector} .ac-price-period { color: ${attributes.periodCol}; }`);
    }

    // ============================================
    // PANEL BODY
    // Source: current-plan-widget.php:L368-L484
    // ============================================

    // Body spacing - L379-L400
    if (attributes.panelSpacing !== undefined) {
        cssRules.push(`${selector} .ac-body { padding: ${attributes.panelSpacing}px; }`);
    }
    if (attributes.panelSpacing_tablet !== undefined) {
        tabletRules.push(`${selector} .ac-body { padding: ${attributes.panelSpacing_tablet}px; }`);
    }
    if (attributes.panelSpacing_mobile !== undefined) {
        mobileRules.push(`${selector} .ac-body { padding: ${attributes.panelSpacing_mobile}px; }`);
    }

    // Body content gap - L402-L423
    if (attributes.panelGap !== undefined) {
        cssRules.push(`${selector} .ac-body { display: flex; flex-direction: column; grid-gap: ${attributes.panelGap}px; }`);
    }
    if (attributes.panelGap_tablet !== undefined) {
        tabletRules.push(`${selector} .ac-body { display: flex; flex-direction: column; grid-gap: ${attributes.panelGap_tablet}px; }`);
    }
    if (attributes.panelGap_mobile !== undefined) {
        mobileRules.push(`${selector} .ac-body { display: flex; flex-direction: column; grid-gap: ${attributes.panelGap_mobile}px; }`);
    }

    // Align text - L426-L442
    if (attributes.textAlign) {
        cssRules.push(`${selector} .ac-body { text-align: ${attributes.textAlign}; }`);
    }

    // Typography - L444-L451
    if (attributes.bodyTypo) {
        const typoCSS = generateTypographyCSS(attributes.bodyTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ac-body p { ${typoCSS} }`);
        }
    }

    // Text color - L453-L463
    if (attributes.bodyTypoCol) {
        cssRules.push(`${selector} .ac-body p { color: ${attributes.bodyTypoCol}; }`);
    }

    // Link typography - L465-L472
    if (attributes.bodyTypoLink) {
        const typoCSS = generateTypographyCSS(attributes.bodyTypoLink);
        if (typoCSS) {
            cssRules.push(`${selector} .ac-body a { ${typoCSS} }`);
        }
    }

    // Link color - L474-L484
    if (attributes.bodyColLink) {
        cssRules.push(`${selector} .ac-body a { color: ${attributes.bodyColLink}; }`);
    }

    // ============================================
    // PANEL BUTTONS
    // Source: current-plan-widget.php:L488-L518
    // ============================================

    // Item gap - L499-L518
    if (attributes.panelButtonsGap !== undefined) {
        cssRules.push(`${selector} .ac-bottom ul { grid-gap: ${attributes.panelButtonsGap}px; }`);
    }
    if (attributes.panelButtonsGap_tablet !== undefined) {
        tabletRules.push(`${selector} .ac-bottom ul { grid-gap: ${attributes.panelButtonsGap_tablet}px; }`);
    }
    if (attributes.panelButtonsGap_mobile !== undefined) {
        mobileRules.push(`${selector} .ac-bottom ul { grid-gap: ${attributes.panelButtonsGap_mobile}px; }`);
    }

    // ============================================
    // SECONDARY BUTTON - NORMAL STATE
    // Source: current-plan-widget.php:L537-L707
    // ============================================

    // Button typography - L546-L553
    if (attributes.scndBtnTypo) {
        const typoCSS = generateTypographyCSS(attributes.scndBtnTypo);
        if (typoCSS) {
            cssRules.push(`${selector} .ts-btn-1 { ${typoCSS} }`);
        }
    }

    // Border radius - L556-L581
    if (attributes.scndBtnRadius !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.scndBtnRadius}px; }`);
    }
    if (attributes.scndBtnRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.scndBtnRadius_tablet}px; }`);
    }
    if (attributes.scndBtnRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 { border-radius: ${attributes.scndBtnRadius_mobile}px; }`);
    }

    // Text color - L583-L593
    if (attributes.scndBtnC) {
        cssRules.push(`${selector} .ts-btn-1 { color: ${attributes.scndBtnC}; }`);
    }

    // Padding - L595-L605
    if (attributes.scndBtnPadding) {
        const paddingCSS = generateDimensionsCSS(attributes.scndBtnPadding, 'padding');
        if (paddingCSS) {
            cssRules.push(`${selector} .ts-btn-1 { ${paddingCSS} }`);
        }
    }

    // Height - L607-L624
    if (attributes.scndBtnHeight !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 { min-height: ${attributes.scndBtnHeight}px; }`);
    }
    if (attributes.scndBtnHeight_tablet !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 { min-height: ${attributes.scndBtnHeight_tablet}px; }`);
    }
    if (attributes.scndBtnHeight_mobile !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 { min-height: ${attributes.scndBtnHeight_mobile}px; }`);
    }

    // Background color - L627-L637
    if (attributes.scndBtnBg) {
        cssRules.push(`${selector} .ts-btn-1 { background-color: ${attributes.scndBtnBg}; }`);
    }

    // Border - L639-L646
    if (attributes.scndBtnBorder) {
        const borderCSS = generateBorderCSS(attributes.scndBtnBorder);
        if (borderCSS) {
            cssRules.push(`${selector} .ts-btn-1 { ${borderCSS} }`);
        }
    }

    // Icon size - L649-L671
    if (attributes.scndBtnIconSize !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.scndBtnIconSize}px; }`);
        cssRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.scndBtnIconSize}px; height: ${attributes.scndBtnIconSize}px; }`);
    }
    if (attributes.scndBtnIconSize_tablet !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.scndBtnIconSize_tablet}px; }`);
        tabletRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.scndBtnIconSize_tablet}px; height: ${attributes.scndBtnIconSize_tablet}px; }`);
    }
    if (attributes.scndBtnIconSize_mobile !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 i { font-size: ${attributes.scndBtnIconSize_mobile}px; }`);
        mobileRules.push(`${selector} .ts-btn-1 svg { width: ${attributes.scndBtnIconSize_mobile}px; height: ${attributes.scndBtnIconSize_mobile}px; }`);
    }

    // Icon/Text spacing - L673-L690
    if (attributes.scndBtnIconPad !== undefined) {
        cssRules.push(`${selector} .ts-btn-1 { grid-gap: ${attributes.scndBtnIconPad}px; }`);
    }
    if (attributes.scndBtnIconPad_tablet !== undefined) {
        tabletRules.push(`${selector} .ts-btn-1 { grid-gap: ${attributes.scndBtnIconPad_tablet}px; }`);
    }
    if (attributes.scndBtnIconPad_mobile !== undefined) {
        mobileRules.push(`${selector} .ts-btn-1 { grid-gap: ${attributes.scndBtnIconPad_mobile}px; }`);
    }

    // Icon color - L692-L703
    if (attributes.scndBtnIconColor) {
        cssRules.push(`${selector} .ts-btn-1 i { color: ${attributes.scndBtnIconColor}; }`);
        cssRules.push(`${selector} .ts-btn-1 svg { fill: ${attributes.scndBtnIconColor}; }`);
    }

    // ============================================
    // SECONDARY BUTTON - HOVER STATE
    // Source: current-plan-widget.php:L712-L770
    // ============================================

    // Text color (Hover) - L719-L729
    if (attributes.scndBtnCH) {
        cssRules.push(`${selector} .ts-btn-1:hover { color: ${attributes.scndBtnCH}; }`);
    }

    // Background color (Hover) - L731-L741
    if (attributes.scndBtnBgH) {
        cssRules.push(`${selector} .ts-btn-1:hover { background-color: ${attributes.scndBtnBgH}; }`);
    }

    // Border color (Hover) - L743-L753
    if (attributes.scndBtnBorderH) {
        cssRules.push(`${selector} .ts-btn-1:hover { border-color: ${attributes.scndBtnBorderH}; }`);
    }

    // Icon color (Hover) - L755-L766
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
