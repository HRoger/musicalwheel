/**
 * Map Block - CSS Generation
 *
 * Generates responsive CSS for map block style controls.
 * Targets Voxel CSS classes within scoped block selector.
 *
 * Architecture:
 * - Layer 1: AdvancedTab styles (generateAdvancedStyles)
 * - Layer 2: Block-specific styles (this file)
 */

import type { MapAttributes } from './types';

/**
 * Generate inline styles for map elements (applied directly to block wrapper)
 */
export function generateMapInlineStyles(attributes: MapAttributes): React.CSSProperties {
    const styles: React.CSSProperties = {};

    // No inline styles needed - all styles are generated via CSS rules
    return styles;
}

/**
 * Generate responsive CSS targeting Voxel classes within scoped block selector
 */
export function generateMapResponsiveCSS(
    attributes: MapAttributes,
    blockId: string
): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];
    const selector = `.voxel-fse-map-${blockId}`;

    // ============================================
    // ACCORDION: Clusters
    // ============================================

    // Cluster Size
    if (attributes.clusterSize !== undefined) {
        cssRules.push(`${selector} .cluster-marker { width: ${attributes.clusterSize}px; height: ${attributes.clusterSize}px; }`);
    }
    if (attributes.clusterSize_tablet !== undefined) {
        tabletRules.push(`${selector} .cluster-marker { width: ${attributes.clusterSize_tablet}px; height: ${attributes.clusterSize_tablet}px; }`);
    }
    if (attributes.clusterSize_mobile !== undefined) {
        mobileRules.push(`${selector} .cluster-marker { width: ${attributes.clusterSize_mobile}px; height: ${attributes.clusterSize_mobile}px; }`);
    }

    // Cluster Background Color
    if (attributes.clusterBgColor) {
        cssRules.push(`${selector} .cluster-marker { background-color: ${attributes.clusterBgColor}; }`);
    }
    if (attributes.clusterBgColor_tablet) {
        tabletRules.push(`${selector} .cluster-marker { background-color: ${attributes.clusterBgColor_tablet}; }`);
    }
    if (attributes.clusterBgColor_mobile) {
        mobileRules.push(`${selector} .cluster-marker { background-color: ${attributes.clusterBgColor_mobile}; }`);
    }

    // Cluster Box Shadow
    if (attributes.clusterShadow?.enable) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = attributes.clusterShadow;
        const inset = position === 'inset' ? 'inset ' : '';
        cssRules.push(`${selector} .cluster-marker { box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`);
    }

    // Cluster Border Radius
    if (attributes.clusterRadius !== undefined) {
        cssRules.push(`${selector} .cluster-marker { border-radius: ${attributes.clusterRadius}px; }`);
    }
    if (attributes.clusterRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .cluster-marker { border-radius: ${attributes.clusterRadius_tablet}px; }`);
    }
    if (attributes.clusterRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .cluster-marker { border-radius: ${attributes.clusterRadius_mobile}px; }`);
    }

    // Cluster Typography
    if (attributes.clusterTypography) {
        const typo = attributes.clusterTypography;
        if (typo.fontFamily) cssRules.push(`${selector} .cluster-marker { font-family: ${typo.fontFamily}; }`);
        if (typo.fontSize) {
            const unit = typo.fontSizeUnit || 'px';
            cssRules.push(`${selector} .cluster-marker { font-size: ${typo.fontSize}${unit}; }`);
        }
        if (typo.fontWeight) cssRules.push(`${selector} .cluster-marker { font-weight: ${typo.fontWeight}; }`);
        if (typo.fontStyle) cssRules.push(`${selector} .cluster-marker { font-style: ${typo.fontStyle}; }`);
        if (typo.textTransform) cssRules.push(`${selector} .cluster-marker { text-transform: ${typo.textTransform}; }`);
        if (typo.textDecoration) cssRules.push(`${selector} .cluster-marker { text-decoration: ${typo.textDecoration}; }`);
        if (typo.lineHeight) {
            const unit = typo.lineHeightUnit || '';
            cssRules.push(`${selector} .cluster-marker { line-height: ${typo.lineHeight}${unit}; }`);
        }
        if (typo.letterSpacing) {
            const unit = typo.letterSpacingUnit || 'px';
            cssRules.push(`${selector} .cluster-marker { letter-spacing: ${typo.letterSpacing}${unit}; }`);
        }
    }

    // Cluster Text Color
    if (attributes.clusterTextColor) {
        cssRules.push(`${selector} .cluster-marker { color: ${attributes.clusterTextColor}; }`);
    }
    if (attributes.clusterTextColor_tablet) {
        tabletRules.push(`${selector} .cluster-marker { color: ${attributes.clusterTextColor_tablet}; }`);
    }
    if (attributes.clusterTextColor_mobile) {
        mobileRules.push(`${selector} .cluster-marker { color: ${attributes.clusterTextColor_mobile}; }`);
    }

    // ============================================
    // ACCORDION: Icon Marker
    // ============================================

    // Icon Marker Size
    if (attributes.iconMarkerSize !== undefined) {
        cssRules.push(`${selector} .icon-marker { width: ${attributes.iconMarkerSize}px; height: ${attributes.iconMarkerSize}px; }`);
    }
    if (attributes.iconMarkerSize_tablet !== undefined) {
        tabletRules.push(`${selector} .icon-marker { width: ${attributes.iconMarkerSize_tablet}px; height: ${attributes.iconMarkerSize_tablet}px; }`);
    }
    if (attributes.iconMarkerSize_mobile !== undefined) {
        mobileRules.push(`${selector} .icon-marker { width: ${attributes.iconMarkerSize_mobile}px; height: ${attributes.iconMarkerSize_mobile}px; }`);
    }

    // Icon Marker Icon Size
    if (attributes.iconMarkerIconSize !== undefined) {
        cssRules.push(`${selector} .icon-marker i { font-size: ${attributes.iconMarkerIconSize}px; }`);
        cssRules.push(`${selector} .icon-marker svg { width: ${attributes.iconMarkerIconSize}px; height: ${attributes.iconMarkerIconSize}px; }`);
    }
    if (attributes.iconMarkerIconSize_tablet !== undefined) {
        tabletRules.push(`${selector} .icon-marker i { font-size: ${attributes.iconMarkerIconSize_tablet}px; }`);
        tabletRules.push(`${selector} .icon-marker svg { width: ${attributes.iconMarkerIconSize_tablet}px; height: ${attributes.iconMarkerIconSize_tablet}px; }`);
    }
    if (attributes.iconMarkerIconSize_mobile !== undefined) {
        mobileRules.push(`${selector} .icon-marker i { font-size: ${attributes.iconMarkerIconSize_mobile}px; }`);
        mobileRules.push(`${selector} .icon-marker svg { width: ${attributes.iconMarkerIconSize_mobile}px; height: ${attributes.iconMarkerIconSize_mobile}px; }`);
    }

    // Icon Marker Border Radius
    if (attributes.iconMarkerRadius !== undefined) {
        cssRules.push(`${selector} .icon-marker { border-radius: ${attributes.iconMarkerRadius}px; }`);
    }
    if (attributes.iconMarkerRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .icon-marker { border-radius: ${attributes.iconMarkerRadius_tablet}px; }`);
    }
    if (attributes.iconMarkerRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .icon-marker { border-radius: ${attributes.iconMarkerRadius_mobile}px; }`);
    }

    // Icon Marker Box Shadow
    if (attributes.iconMarkerShadow?.enable) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = attributes.iconMarkerShadow;
        const inset = position === 'inset' ? 'inset ' : '';
        cssRules.push(`${selector} .icon-marker { box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`);
    }

    // Icon Marker Static Background
    if (attributes.iconMarkerStaticBg) {
        cssRules.push(`${selector} .icon-marker.static { background-color: ${attributes.iconMarkerStaticBg}; }`);
    }
    if (attributes.iconMarkerStaticBg_tablet) {
        tabletRules.push(`${selector} .icon-marker.static { background-color: ${attributes.iconMarkerStaticBg_tablet}; }`);
    }
    if (attributes.iconMarkerStaticBg_mobile) {
        mobileRules.push(`${selector} .icon-marker.static { background-color: ${attributes.iconMarkerStaticBg_mobile}; }`);
    }

    // Icon Marker Static Background Active
    if (attributes.iconMarkerStaticBgActive) {
        cssRules.push(`${selector} .icon-marker.static.active { background-color: ${attributes.iconMarkerStaticBgActive}; }`);
    }
    if (attributes.iconMarkerStaticBgActive_tablet) {
        tabletRules.push(`${selector} .icon-marker.static.active { background-color: ${attributes.iconMarkerStaticBgActive_tablet}; }`);
    }
    if (attributes.iconMarkerStaticBgActive_mobile) {
        mobileRules.push(`${selector} .icon-marker.static.active { background-color: ${attributes.iconMarkerStaticBgActive_mobile}; }`);
    }

    // Icon Marker Static Icon Color
    if (attributes.iconMarkerStaticIconColor) {
        cssRules.push(`${selector} .icon-marker.static i { color: ${attributes.iconMarkerStaticIconColor}; }`);
        cssRules.push(`${selector} .icon-marker.static svg { fill: ${attributes.iconMarkerStaticIconColor}; }`);
    }
    if (attributes.iconMarkerStaticIconColor_tablet) {
        tabletRules.push(`${selector} .icon-marker.static i { color: ${attributes.iconMarkerStaticIconColor_tablet}; }`);
        tabletRules.push(`${selector} .icon-marker.static svg { fill: ${attributes.iconMarkerStaticIconColor_tablet}; }`);
    }
    if (attributes.iconMarkerStaticIconColor_mobile) {
        mobileRules.push(`${selector} .icon-marker.static i { color: ${attributes.iconMarkerStaticIconColor_mobile}; }`);
        mobileRules.push(`${selector} .icon-marker.static svg { fill: ${attributes.iconMarkerStaticIconColor_mobile}; }`);
    }

    // Icon Marker Static Icon Color Active
    if (attributes.iconMarkerStaticIconColorActive) {
        cssRules.push(`${selector} .icon-marker.static.active i { color: ${attributes.iconMarkerStaticIconColorActive}; }`);
        cssRules.push(`${selector} .icon-marker.static.active svg { fill: ${attributes.iconMarkerStaticIconColorActive}; }`);
    }
    if (attributes.iconMarkerStaticIconColorActive_tablet) {
        tabletRules.push(`${selector} .icon-marker.static.active i { color: ${attributes.iconMarkerStaticIconColorActive_tablet}; }`);
        tabletRules.push(`${selector} .icon-marker.static.active svg { fill: ${attributes.iconMarkerStaticIconColorActive_tablet}; }`);
    }
    if (attributes.iconMarkerStaticIconColorActive_mobile) {
        mobileRules.push(`${selector} .icon-marker.static.active i { color: ${attributes.iconMarkerStaticIconColorActive_mobile}; }`);
        mobileRules.push(`${selector} .icon-marker.static.active svg { fill: ${attributes.iconMarkerStaticIconColorActive_mobile}; }`);
    }

    // ============================================
    // ACCORDION: Text Marker
    // ============================================

    // Text Marker Background Color
    if (attributes.textMarkerBgColor) {
        cssRules.push(`${selector} .text-marker { background-color: ${attributes.textMarkerBgColor}; }`);
    }
    if (attributes.textMarkerBgColor_tablet) {
        tabletRules.push(`${selector} .text-marker { background-color: ${attributes.textMarkerBgColor_tablet}; }`);
    }
    if (attributes.textMarkerBgColor_mobile) {
        mobileRules.push(`${selector} .text-marker { background-color: ${attributes.textMarkerBgColor_mobile}; }`);
    }

    // Text Marker Background Color Active
    if (attributes.textMarkerBgColorActive) {
        cssRules.push(`${selector} .text-marker.active { background-color: ${attributes.textMarkerBgColorActive}; }`);
    }
    if (attributes.textMarkerBgColorActive_tablet) {
        tabletRules.push(`${selector} .text-marker.active { background-color: ${attributes.textMarkerBgColorActive_tablet}; }`);
    }
    if (attributes.textMarkerBgColorActive_mobile) {
        mobileRules.push(`${selector} .text-marker.active { background-color: ${attributes.textMarkerBgColorActive_mobile}; }`);
    }

    // Text Marker Text Color
    if (attributes.textMarkerTextColor) {
        cssRules.push(`${selector} .text-marker { color: ${attributes.textMarkerTextColor}; }`);
    }
    if (attributes.textMarkerTextColor_tablet) {
        tabletRules.push(`${selector} .text-marker { color: ${attributes.textMarkerTextColor_tablet}; }`);
    }
    if (attributes.textMarkerTextColor_mobile) {
        mobileRules.push(`${selector} .text-marker { color: ${attributes.textMarkerTextColor_mobile}; }`);
    }

    // Text Marker Text Color Active
    if (attributes.textMarkerTextColorActive) {
        cssRules.push(`${selector} .text-marker.active { color: ${attributes.textMarkerTextColorActive}; }`);
    }
    if (attributes.textMarkerTextColorActive_tablet) {
        tabletRules.push(`${selector} .text-marker.active { color: ${attributes.textMarkerTextColorActive_tablet}; }`);
    }
    if (attributes.textMarkerTextColorActive_mobile) {
        mobileRules.push(`${selector} .text-marker.active { color: ${attributes.textMarkerTextColorActive_mobile}; }`);
    }

    // Text Marker Border Radius
    if (attributes.textMarkerRadius !== undefined) {
        cssRules.push(`${selector} .text-marker { border-radius: ${attributes.textMarkerRadius}px; }`);
    }
    if (attributes.textMarkerRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .text-marker { border-radius: ${attributes.textMarkerRadius_tablet}px; }`);
    }
    if (attributes.textMarkerRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .text-marker { border-radius: ${attributes.textMarkerRadius_mobile}px; }`);
    }

    // Text Marker Typography
    if (attributes.textMarkerTypography) {
        const typo = attributes.textMarkerTypography;
        if (typo.fontFamily) cssRules.push(`${selector} .text-marker { font-family: ${typo.fontFamily}; }`);
        if (typo.fontSize) {
            const unit = typo.fontSizeUnit || 'px';
            cssRules.push(`${selector} .text-marker { font-size: ${typo.fontSize}${unit}; }`);
        }
        if (typo.fontWeight) cssRules.push(`${selector} .text-marker { font-weight: ${typo.fontWeight}; }`);
        if (typo.fontStyle) cssRules.push(`${selector} .text-marker { font-style: ${typo.fontStyle}; }`);
        if (typo.textTransform) cssRules.push(`${selector} .text-marker { text-transform: ${typo.textTransform}; }`);
        if (typo.textDecoration) cssRules.push(`${selector} .text-marker { text-decoration: ${typo.textDecoration}; }`);
        if (typo.lineHeight) {
            const unit = typo.lineHeightUnit || '';
            cssRules.push(`${selector} .text-marker { line-height: ${typo.lineHeight}${unit}; }`);
        }
        if (typo.letterSpacing) {
            const unit = typo.letterSpacingUnit || 'px';
            cssRules.push(`${selector} .text-marker { letter-spacing: ${typo.letterSpacing}${unit}; }`);
        }
    }

    // Text Marker Padding
    if (attributes.textMarkerPadding) {
        const { top, right, bottom, left } = attributes.textMarkerPadding;
        if (top || right || bottom || left) {
            cssRules.push(`${selector} .text-marker { padding: ${top || 0}px ${right || 0}px ${bottom || 0}px ${left || 0}px; }`);
        }
    }
    if (attributes.textMarkerPadding_tablet) {
        const { top, right, bottom, left } = attributes.textMarkerPadding_tablet;
        if (top || right || bottom || left) {
            tabletRules.push(`${selector} .text-marker { padding: ${top || 0}px ${right || 0}px ${bottom || 0}px ${left || 0}px; }`);
        }
    }
    if (attributes.textMarkerPadding_mobile) {
        const { top, right, bottom, left } = attributes.textMarkerPadding_mobile;
        if (top || right || bottom || left) {
            mobileRules.push(`${selector} .text-marker { padding: ${top || 0}px ${right || 0}px ${bottom || 0}px ${left || 0}px; }`);
        }
    }

    // Text Marker Box Shadow
    if (attributes.textMarkerShadow?.enable) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = attributes.textMarkerShadow;
        const inset = position === 'inset' ? 'inset ' : '';
        cssRules.push(`${selector} .text-marker { box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`);
    }

    // ============================================
    // ACCORDION: Image Marker
    // ============================================

    // Image Marker Size
    if (attributes.imageMarkerSize !== undefined) {
        cssRules.push(`${selector} .image-marker { width: ${attributes.imageMarkerSize}px; height: ${attributes.imageMarkerSize}px; }`);
    }
    if (attributes.imageMarkerSize_tablet !== undefined) {
        tabletRules.push(`${selector} .image-marker { width: ${attributes.imageMarkerSize_tablet}px; height: ${attributes.imageMarkerSize_tablet}px; }`);
    }
    if (attributes.imageMarkerSize_mobile !== undefined) {
        mobileRules.push(`${selector} .image-marker { width: ${attributes.imageMarkerSize_mobile}px; height: ${attributes.imageMarkerSize_mobile}px; }`);
    }

    // Image Marker Border Radius
    if (attributes.imageMarkerRadius !== undefined) {
        cssRules.push(`${selector} .image-marker { border-radius: ${attributes.imageMarkerRadius}px; }`);
    }
    if (attributes.imageMarkerRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .image-marker { border-radius: ${attributes.imageMarkerRadius_tablet}px; }`);
    }
    if (attributes.imageMarkerRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .image-marker { border-radius: ${attributes.imageMarkerRadius_mobile}px; }`);
    }

    // Image Marker Box Shadow
    if (attributes.imageMarkerShadow?.enable) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = attributes.imageMarkerShadow;
        const inset = position === 'inset' ? 'inset ' : '';
        cssRules.push(`${selector} .image-marker { box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`);
    }

    // ============================================
    // ACCORDION: Map Popup
    // ============================================

    // Popup Card Width
    if (attributes.popupCardWidth !== undefined) {
        cssRules.push(`${selector} .map-popup { width: ${attributes.popupCardWidth}px; }`);
    }
    if (attributes.popupCardWidth_tablet !== undefined) {
        tabletRules.push(`${selector} .map-popup { width: ${attributes.popupCardWidth_tablet}px; }`);
    }
    if (attributes.popupCardWidth_mobile !== undefined) {
        mobileRules.push(`${selector} .map-popup { width: ${attributes.popupCardWidth_mobile}px; }`);
    }

    // Popup Loader Colors (CSS custom properties for spinner animation)
    if (attributes.popupLoaderColor1) {
        cssRules.push(`${selector} .map-popup-loader { --loader-color-1: ${attributes.popupLoaderColor1}; }`);
    }
    if (attributes.popupLoaderColor2) {
        cssRules.push(`${selector} .map-popup-loader { --loader-color-2: ${attributes.popupLoaderColor2}; }`);
    }

    // ============================================
    // ACCORDION: Search Button
    // ============================================

    // Search Button Typography
    if (attributes.searchBtnTypography) {
        const typo = attributes.searchBtnTypography;
        if (typo.fontFamily) cssRules.push(`${selector} .search-btn { font-family: ${typo.fontFamily}; }`);
        if (typo.fontSize) {
            const unit = typo.fontSizeUnit || 'px';
            cssRules.push(`${selector} .search-btn { font-size: ${typo.fontSize}${unit}; }`);
        }
        if (typo.fontWeight) cssRules.push(`${selector} .search-btn { font-weight: ${typo.fontWeight}; }`);
        if (typo.fontStyle) cssRules.push(`${selector} .search-btn { font-style: ${typo.fontStyle}; }`);
        if (typo.textTransform) cssRules.push(`${selector} .search-btn { text-transform: ${typo.textTransform}; }`);
        if (typo.textDecoration) cssRules.push(`${selector} .search-btn { text-decoration: ${typo.textDecoration}; }`);
        if (typo.lineHeight) {
            const unit = typo.lineHeightUnit || '';
            cssRules.push(`${selector} .search-btn { line-height: ${typo.lineHeight}${unit}; }`);
        }
        if (typo.letterSpacing) {
            const unit = typo.letterSpacingUnit || 'px';
            cssRules.push(`${selector} .search-btn { letter-spacing: ${typo.letterSpacing}${unit}; }`);
        }
    }

    // Search Button Text Color
    if (attributes.searchBtnTextColor) {
        cssRules.push(`${selector} .search-btn { color: ${attributes.searchBtnTextColor}; }`);
    }
    if (attributes.searchBtnTextColor_tablet) {
        tabletRules.push(`${selector} .search-btn { color: ${attributes.searchBtnTextColor_tablet}; }`);
    }
    if (attributes.searchBtnTextColor_mobile) {
        mobileRules.push(`${selector} .search-btn { color: ${attributes.searchBtnTextColor_mobile}; }`);
    }

    // Search Button Background Color
    if (attributes.searchBtnBgColor) {
        cssRules.push(`${selector} .search-btn { background-color: ${attributes.searchBtnBgColor}; }`);
    }
    if (attributes.searchBtnBgColor_tablet) {
        tabletRules.push(`${selector} .search-btn { background-color: ${attributes.searchBtnBgColor_tablet}; }`);
    }
    if (attributes.searchBtnBgColor_mobile) {
        mobileRules.push(`${selector} .search-btn { background-color: ${attributes.searchBtnBgColor_mobile}; }`);
    }

    // Search Button Icon Color
    if (attributes.searchBtnIconColor) {
        cssRules.push(`${selector} .search-btn i { color: ${attributes.searchBtnIconColor}; }`);
        cssRules.push(`${selector} .search-btn svg { fill: ${attributes.searchBtnIconColor}; }`);
    }
    if (attributes.searchBtnIconColor_tablet) {
        tabletRules.push(`${selector} .search-btn i { color: ${attributes.searchBtnIconColor_tablet}; }`);
        tabletRules.push(`${selector} .search-btn svg { fill: ${attributes.searchBtnIconColor_tablet}; }`);
    }
    if (attributes.searchBtnIconColor_mobile) {
        mobileRules.push(`${selector} .search-btn i { color: ${attributes.searchBtnIconColor_mobile}; }`);
        mobileRules.push(`${selector} .search-btn svg { fill: ${attributes.searchBtnIconColor_mobile}; }`);
    }

    // Search Button Icon Color Active
    if (attributes.searchBtnIconColorActive) {
        cssRules.push(`${selector} .search-btn.active i { color: ${attributes.searchBtnIconColorActive}; }`);
        cssRules.push(`${selector} .search-btn.active svg { fill: ${attributes.searchBtnIconColorActive}; }`);
    }
    if (attributes.searchBtnIconColorActive_tablet) {
        tabletRules.push(`${selector} .search-btn.active i { color: ${attributes.searchBtnIconColorActive_tablet}; }`);
        tabletRules.push(`${selector} .search-btn.active svg { fill: ${attributes.searchBtnIconColorActive_tablet}; }`);
    }
    if (attributes.searchBtnIconColorActive_mobile) {
        mobileRules.push(`${selector} .search-btn.active i { color: ${attributes.searchBtnIconColorActive_mobile}; }`);
        mobileRules.push(`${selector} .search-btn.active svg { fill: ${attributes.searchBtnIconColorActive_mobile}; }`);
    }

    // Search Button Border Radius
    if (attributes.searchBtnRadius !== undefined) {
        cssRules.push(`${selector} .search-btn { border-radius: ${attributes.searchBtnRadius}px; }`);
    }
    if (attributes.searchBtnRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .search-btn { border-radius: ${attributes.searchBtnRadius_tablet}px; }`);
    }
    if (attributes.searchBtnRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .search-btn { border-radius: ${attributes.searchBtnRadius_mobile}px; }`);
    }

    // ============================================
    // ACCORDION: Nav Buttons (Next/Prev)
    // ============================================

    // Nav Button Icon Color
    if (attributes.navBtnIconColor) {
        cssRules.push(`${selector} .nav-btn i { color: ${attributes.navBtnIconColor}; }`);
        cssRules.push(`${selector} .nav-btn svg { fill: ${attributes.navBtnIconColor}; }`);
    }

    // Nav Button Icon Size
    if (attributes.navBtnIconSize !== undefined) {
        cssRules.push(`${selector} .nav-btn i { font-size: ${attributes.navBtnIconSize}px; }`);
        cssRules.push(`${selector} .nav-btn svg { width: ${attributes.navBtnIconSize}px; height: ${attributes.navBtnIconSize}px; }`);
    }
    if (attributes.navBtnIconSize_tablet !== undefined) {
        tabletRules.push(`${selector} .nav-btn i { font-size: ${attributes.navBtnIconSize_tablet}px; }`);
        tabletRules.push(`${selector} .nav-btn svg { width: ${attributes.navBtnIconSize_tablet}px; height: ${attributes.navBtnIconSize_tablet}px; }`);
    }
    if (attributes.navBtnIconSize_mobile !== undefined) {
        mobileRules.push(`${selector} .nav-btn i { font-size: ${attributes.navBtnIconSize_mobile}px; }`);
        mobileRules.push(`${selector} .nav-btn svg { width: ${attributes.navBtnIconSize_mobile}px; height: ${attributes.navBtnIconSize_mobile}px; }`);
    }

    // Nav Button Background Color
    if (attributes.navBtnBgColor) {
        cssRules.push(`${selector} .nav-btn { background-color: ${attributes.navBtnBgColor}; }`);
    }

    // Nav Button Border (BorderGroupControl)
    if (attributes.navBtnBorder) {
        const { borderType, borderWidth, borderColor } = attributes.navBtnBorder;

        if (borderType && borderType !== 'none') {
            // Border style
            cssRules.push(`${selector} .nav-btn { border-style: ${borderType}; }`);

            // Border width
            if (borderWidth) {
                const { top, right, bottom, left, unit = 'px', linked } = borderWidth;
                if (linked && top !== undefined) {
                    cssRules.push(`${selector} .nav-btn { border-width: ${top}${unit}; }`);
                } else {
                    const t = top !== undefined ? `${top}${unit}` : '0';
                    const r = right !== undefined ? `${right}${unit}` : '0';
                    const b = bottom !== undefined ? `${bottom}${unit}` : '0';
                    const l = left !== undefined ? `${left}${unit}` : '0';
                    cssRules.push(`${selector} .nav-btn { border-width: ${t} ${r} ${b} ${l}; }`);
                }
            }

            // Border color
            if (borderColor) {
                cssRules.push(`${selector} .nav-btn { border-color: ${borderColor}; }`);
            }
        }
    }

    // Nav Button Border Radius
    if (attributes.navBtnRadius !== undefined) {
        cssRules.push(`${selector} .nav-btn { border-radius: ${attributes.navBtnRadius}px; }`);
    }
    if (attributes.navBtnRadius_tablet !== undefined) {
        tabletRules.push(`${selector} .nav-btn { border-radius: ${attributes.navBtnRadius_tablet}px; }`);
    }
    if (attributes.navBtnRadius_mobile !== undefined) {
        mobileRules.push(`${selector} .nav-btn { border-radius: ${attributes.navBtnRadius_mobile}px; }`);
    }

    // Nav Button Box Shadow
    if (attributes.navBtnShadow?.enable) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position = 'outline' } = attributes.navBtnShadow;
        const inset = position === 'inset' ? 'inset ' : '';
        cssRules.push(`${selector} .nav-btn { box-shadow: ${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}; }`);
    }

    // Nav Button Size
    if (attributes.navBtnSize !== undefined) {
        cssRules.push(`${selector} .nav-btn { width: ${attributes.navBtnSize}px; height: ${attributes.navBtnSize}px; }`);
    }
    if (attributes.navBtnSize_tablet !== undefined) {
        tabletRules.push(`${selector} .nav-btn { width: ${attributes.navBtnSize_tablet}px; height: ${attributes.navBtnSize_tablet}px; }`);
    }
    if (attributes.navBtnSize_mobile !== undefined) {
        mobileRules.push(`${selector} .nav-btn { width: ${attributes.navBtnSize_mobile}px; height: ${attributes.navBtnSize_mobile}px; }`);
    }

    // Nav Button Hover States
    if (attributes.navBtnIconColorHover) {
        cssRules.push(`${selector} .nav-btn:hover i { color: ${attributes.navBtnIconColorHover}; }`);
        cssRules.push(`${selector} .nav-btn:hover svg { fill: ${attributes.navBtnIconColorHover}; }`);
    }

    if (attributes.navBtnBgColorHover) {
        cssRules.push(`${selector} .nav-btn:hover { background-color: ${attributes.navBtnBgColorHover}; }`);
    }

    if (attributes.navBtnBorderColorHover) {
        cssRules.push(`${selector} .nav-btn:hover { border-color: ${attributes.navBtnBorderColorHover}; }`);
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
