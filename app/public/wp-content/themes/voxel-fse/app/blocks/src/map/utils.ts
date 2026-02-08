/**
 * Map Block Utilities
 *
 * Shared logic for style generation and configuration.
 */

import type {
    MapVxConfig,
    BoxShadowValue,
    TypographyValue,
    ResponsiveValue,
    MapAttributes,
    MapSource,
    DragSearchMode,
    DragSearchDefault,
    BoxValue,
} from './types';

/**
 * Build vxconfig object from attributes
 * (Moved from save.tsx)
 */
export function buildVxConfig(attributes: MapAttributes): MapVxConfig {
    return {
        blockId: attributes['blockId'] as string, // Map's own ID for event targeting
        source: attributes['source'] as MapSource,
        searchFormId: attributes['searchFormId'] as string, // ID of linked search form (for reference)
        dragSearch: attributes['dragSearch'] as boolean,
        dragSearchMode: attributes['dragSearchMode'] as DragSearchMode,
        dragSearchDefault: attributes['dragSearchDefault'] as DragSearchDefault,
        center: {
            lat: attributes['defaultLat'] as number,
            lng: attributes['defaultLng'] as number,
        },
        zoom: attributes['defaultZoom'] as number,
        minZoom: attributes['minZoom'] as number,
        maxZoom: attributes['maxZoom'] as number,
        styles: {
            height: {
                desktop: attributes['height'] as number,
                tablet: attributes['height_tablet'] as number,
                mobile: attributes['height_mobile'] as number,
            },
            heightUnit: attributes['heightUnit'] as string,
            calcHeight: {
                desktop: attributes['calcHeight'] as string,
                tablet: attributes['calcHeight_tablet'] as string,
                mobile: attributes['calcHeight_mobile'] as string,
            },
            enableCalcHeight: {
                desktop: attributes['enableCalcHeight'] as boolean,
                tablet: attributes['enableCalcHeight_tablet'] as boolean,
                mobile: attributes['enableCalcHeight_mobile'] as boolean,
            },
            borderRadius: {
                desktop: attributes['mapBorderRadius'] as number,
                tablet: attributes['mapBorderRadius_tablet'] as number,
                mobile: attributes['mapBorderRadius_mobile'] as number,
            },
            cluster: {
                size: {
                    desktop: attributes['clusterSize'] as number,
                    tablet: attributes['clusterSize_tablet'] as number,
                    mobile: attributes['clusterSize_mobile'] as number,
                },
                bgColor: {
                    desktop: attributes['clusterBgColor'] as string,
                    tablet: attributes['clusterBgColor_tablet'] as string,
                    mobile: attributes['clusterBgColor_mobile'] as string,
                },
                shadow: attributes['clusterShadow'] as BoxShadowValue,
                radius: {
                    desktop: attributes['clusterRadius'] as number,
                    tablet: attributes['clusterRadius_tablet'] as number,
                    mobile: attributes['clusterRadius_mobile'] as number,
                },
                typography: attributes['clusterTypography'] as TypographyValue,
                textColor: {
                    desktop: attributes['clusterTextColor'] as string,
                    tablet: attributes['clusterTextColor_tablet'] as string,
                    mobile: attributes['clusterTextColor_mobile'] as string,
                },
            },
            iconMarker: {
                size: {
                    desktop: attributes['iconMarkerSize'] as number,
                    tablet: attributes['iconMarkerSize_tablet'] as number,
                    mobile: attributes['iconMarkerSize_mobile'] as number,
                },
                iconSize: {
                    desktop: attributes['iconMarkerIconSize'] as number,
                    tablet: attributes['iconMarkerIconSize_tablet'] as number,
                    mobile: attributes['iconMarkerSize_mobile'] as number,
                },
                radius: {
                    desktop: attributes['iconMarkerRadius'] as number,
                    tablet: attributes['iconMarkerRadius_tablet'] as number,
                    mobile: attributes['iconMarkerRadius_mobile'] as number,
                },
                shadow: attributes['iconMarkerShadow'] as BoxShadowValue,
                staticBg: {
                    desktop: attributes['iconMarkerStaticBg'] as string,
                    tablet: attributes['iconMarkerStaticBg_tablet'] as string,
                    mobile: attributes['iconMarkerStaticBg_mobile'] as string,
                },
                staticBgActive: {
                    desktop: attributes['iconMarkerStaticBgActive'] as string,
                    tablet: attributes['iconMarkerStaticBgActive_tablet'] as string,
                    mobile: attributes['iconMarkerStaticBgActive_mobile'] as string,
                },
                staticIconColor: {
                    desktop: attributes['iconMarkerStaticIconColor'] as string,
                    tablet: attributes['iconMarkerStaticIconColor_tablet'] as string,
                    mobile: attributes['iconMarkerStaticIconColor_mobile'] as string,
                },
                staticIconColorActive: {
                    desktop: attributes['iconMarkerStaticIconColorActive'] as string,
                    tablet: attributes['iconMarkerStaticIconColorActive_tablet'] as string,
                    mobile: attributes['iconMarkerStaticIconColorActive_mobile'] as string,
                },
            },
            textMarker: {
                bgColor: {
                    desktop: attributes['textMarkerBgColor'] as string,
                    tablet: attributes['textMarkerBgColor_tablet'] as string,
                    mobile: attributes['textMarkerBgColor_mobile'] as string,
                },
                bgColorActive: {
                    desktop: attributes['textMarkerBgColorActive'] as string,
                    tablet: attributes['textMarkerBgColorActive_tablet'] as string,
                    mobile: attributes['textMarkerBgColorActive_mobile'] as string,
                },
                textColor: {
                    desktop: attributes['textMarkerTextColor'] as string,
                    tablet: attributes['textMarkerTextColor_tablet'] as string,
                    mobile: attributes['textMarkerTextColor_mobile'] as string,
                },
                textColorActive: {
                    desktop: attributes['textMarkerTextColorActive'] as string,
                    tablet: attributes['textMarkerTextColorActive_tablet'] as string,
                    mobile: attributes['textMarkerTextColorActive_mobile'] as string,
                },
                radius: {
                    desktop: attributes['textMarkerRadius'] as number,
                    tablet: attributes['textMarkerRadius_tablet'] as number,
                    mobile: attributes['textMarkerRadius_mobile'] as number,
                },
                typography: attributes['textMarkerTypography'] as TypographyValue,
                padding: {
                    desktop: attributes['textMarkerPadding'] as BoxValue,
                    tablet: attributes['textMarkerPadding_tablet'] as BoxValue,
                    mobile: attributes['textMarkerPadding_mobile'] as BoxValue,
                },
                shadow: attributes['textMarkerShadow'] as BoxShadowValue,
            },
            imageMarker: {
                size: {
                    desktop: attributes['imageMarkerSize'] as number,
                    tablet: attributes['imageMarkerSize_tablet'] as number,
                    mobile: attributes['imageMarkerSize_mobile'] as number,
                },
                radius: {
                    desktop: attributes['imageMarkerRadius'] as number,
                    tablet: attributes['imageMarkerRadius_tablet'] as number,
                    mobile: attributes['imageMarkerRadius_mobile'] as number,
                },
                shadow: attributes['imageMarkerShadow'] as BoxShadowValue,
            },
            popup: {
                cardWidth: {
                    desktop: attributes['popupCardWidth'] as number,
                    tablet: attributes['popupCardWidth_tablet'] as number,
                    mobile: attributes['popupCardWidth_mobile'] as number,
                },
                loaderColor1: attributes['popupLoaderColor1'] as string,
                loaderColor2: attributes['popupLoaderColor2'] as string,
            },
            searchBtn: {
                typography: attributes['searchBtnTypography'] as TypographyValue,
                textColor: {
                    desktop: attributes['searchBtnTextColor'] as string,
                    tablet: attributes['searchBtnTextColor_tablet'] as string,
                    mobile: attributes['searchBtnTextColor_mobile'] as string,
                },
                bgColor: {
                    desktop: attributes['searchBtnBgColor'] as string,
                    tablet: attributes['searchBtnBgColor_tablet'] as string,
                    mobile: attributes['searchBtnBgColor_mobile'] as string,
                },
                iconColor: {
                    desktop: attributes['searchBtnIconColor'] as string,
                    tablet: attributes['searchBtnIconColor_tablet'] as string,
                    mobile: attributes['searchBtnIconColor_mobile'] as string,
                },
                iconColorActive: {
                    desktop: attributes['searchBtnIconColorActive'] as string,
                    tablet: attributes['searchBtnIconColorActive_tablet'] as string,
                    mobile: attributes['searchBtnIconColorActive_mobile'] as string,
                },
                radius: {
                    desktop: attributes['searchBtnRadius'] as number,
                    tablet: attributes['searchBtnRadius_tablet'] as number,
                    mobile: attributes['searchBtnRadius_mobile'] as number,
                },
                checkmarkIcon: attributes['checkmarkIcon'] as any,
                searchIcon: attributes['searchIcon'] as any,
            },
            navBtn: {
                iconColor: attributes['navBtnIconColor'] as string,
                iconColorHover: attributes['navBtnIconColorHover'] as string,
                iconSize: {
                    desktop: attributes['navBtnIconSize'] as number,
                    tablet: attributes['navBtnIconSize_tablet'] as number,
                    mobile: attributes['navBtnIconSize_mobile'] as number,
                },
                bgColor: attributes['navBtnBgColor'] as string,
                bgColorHover: attributes['navBtnBgColorHover'] as string,
                border: attributes['navBtnBorder'],
                borderColorHover: attributes['navBtnBorderColorHover'] as string,
                radius: {
                    desktop: attributes['navBtnRadius'] as number,
                    tablet: attributes['navBtnRadius_tablet'] as number,
                    mobile: attributes['navBtnRadius_mobile'] as number,
                },
                shadow: attributes['navBtnShadow'] as BoxShadowValue,
                size: {
                    desktop: attributes['navBtnSize'] as number,
                    tablet: attributes['navBtnSize_tablet'] as number,
                    mobile: attributes['navBtnSize_mobile'] as number,
                },
            },
            geolocationIcon: attributes['geolocationIcon'] as any,
        },
    };
}

/**
 * Get current device type based on viewport
 */
export function getCurrentDevice(): 'desktop' | 'tablet' | 'mobile' {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
}

/**
 * Get responsive value for current device
 */
export function getResponsiveValue<T>(
    value: ResponsiveValue<T> | undefined,
    fallback: T
): T {
    if (!value) return fallback;
    const device = getCurrentDevice();

    // Try current device, then fallback to larger devices
    if (device === 'mobile') {
        const val = (value['mobile'] !== undefined ? value['mobile'] : (value['tablet'] !== undefined ? value['tablet'] : (value['desktop'] !== undefined ? value['desktop'] : fallback))) as T;
        return val;
    }
    if (device === 'tablet') {
        const val = (value['tablet'] !== undefined ? value['tablet'] : (value['desktop'] !== undefined ? value['desktop'] : fallback)) as T;
        return val;
    }
    return (value['desktop'] !== undefined ? value['desktop'] : fallback) as T;
}

/**
 * Convert box shadow value to CSS
 */
export function boxShadowToCSS(shadow: BoxShadowValue | undefined): string {
    if (!shadow?.enable) return 'none';
    const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position } = shadow;
    const inset = position === 'inset' ? 'inset ' : '';
    return `${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
}

/**
 * Convert typography value to CSS properties
 */
export function typographyToCSS(typography: TypographyValue | undefined): Record<string, string> {
    if (!typography) return {};
    const css: Record<string, string> = {};

    if (typography.fontFamily) css['font-family'] = typography.fontFamily;
    if (typography.fontSize) {
        css['font-size'] = `${typography.fontSize}${typography.fontSizeUnit || 'px'}`;
    }
    if (typography.fontWeight) css['font-weight'] = typography.fontWeight;
    if (typography.fontStyle) css['font-style'] = typography.fontStyle;
    if (typography.textTransform) css['text-transform'] = typography.textTransform;
    if (typography.textDecoration) css['text-decoration'] = typography.textDecoration;
    if (typography.lineHeight) {
        css['line-height'] = `${typography.lineHeight}${typography.lineHeightUnit || ''}`;
    }
    if (typography.letterSpacing) {
        css['letter-spacing'] = `${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}`;
    }

    return css;
}

/**
 * Apply custom styles via CSS custom properties
 */
export function applyMapStyles(wrapper: HTMLElement, config: MapVxConfig): void {
    // Ensure wrapper has width (required for map to display)
    wrapper.style.width = '100%';

    const styles = config.styles;
    if (!styles) return;

    // Height
    const height = getResponsiveValue(styles.height, 400);
    const heightUnit = styles.heightUnit || 'px';
    const enableCalcHeight = getResponsiveValue(styles.enableCalcHeight, false);
    const calcHeight = getResponsiveValue(styles.calcHeight, '');

    if (enableCalcHeight && calcHeight) {
        wrapper.style.setProperty('--vx-map-height', calcHeight);
    } else {
        wrapper.style.setProperty('--vx-map-height', `${height}${heightUnit}`);
    }

    // Border radius
    const borderRadius = getResponsiveValue(styles.borderRadius, 0);
    wrapper.style.setProperty('--vx-map-radius', `${borderRadius}px`);

    // Cluster styles
    if (styles.cluster) {
        const clusterSize = getResponsiveValue(styles.cluster.size, 40);
        wrapper.style.setProperty('--vx-cluster-size', `${clusterSize}px`);

        const clusterBg = getResponsiveValue(styles.cluster.bgColor, '');
        if (clusterBg) wrapper.style.setProperty('--vx-cluster-bg', clusterBg);

        const clusterRadius = getResponsiveValue(styles.cluster.radius, 50);
        wrapper.style.setProperty('--vx-cluster-radius', `${clusterRadius}%`);

        const clusterTextColor = getResponsiveValue(styles.cluster.textColor, '');
        if (clusterTextColor) wrapper.style.setProperty('--vx-cluster-text-color', clusterTextColor);

        wrapper.style.setProperty('--vx-cluster-shadow', boxShadowToCSS(styles.cluster.shadow));

        // Cluster typography
        if (styles.cluster.typography) {
            const typoCSS = typographyToCSS(styles.cluster.typography);
            if (typoCSS['font-family']) wrapper.style.setProperty('--vx-cluster-font-family', typoCSS['font-family']);
            if (typoCSS['font-size']) wrapper.style.setProperty('--vx-cluster-font-size', typoCSS['font-size']);
            if (typoCSS['font-weight']) wrapper.style.setProperty('--vx-cluster-font-weight', typoCSS['font-weight']);
            if (typoCSS['font-style']) wrapper.style.setProperty('--vx-cluster-font-style', typoCSS['font-style']);
            if (typoCSS['line-height']) wrapper.style.setProperty('--vx-cluster-line-height', typoCSS['line-height']);
            if (typoCSS['letter-spacing']) wrapper.style.setProperty('--vx-cluster-letter-spacing', typoCSS['letter-spacing']);
            if (typoCSS['text-transform']) wrapper.style.setProperty('--vx-cluster-text-transform', typoCSS['text-transform']);
            if (typoCSS['text-decoration']) wrapper.style.setProperty('--vx-cluster-text-decoration', typoCSS['text-decoration']);
        }
    }

    // Icon marker styles
    if (styles.iconMarker) {
        const iconSize = getResponsiveValue(styles.iconMarker.size, 42);
        wrapper.style.setProperty('--vx-icon-marker-size', `${iconSize}px`);

        const iconIconSize = getResponsiveValue(styles.iconMarker.iconSize, 24);
        wrapper.style.setProperty('--vx-icon-marker-icon-size', `${iconIconSize}px`);

        const iconRadius = getResponsiveValue(styles.iconMarker.radius, 50);
        wrapper.style.setProperty('--vx-icon-marker-radius', `${iconRadius}%`);

        wrapper.style.setProperty('--vx-icon-marker-shadow', boxShadowToCSS(styles.iconMarker.shadow));

        const staticBg = getResponsiveValue(styles.iconMarker.staticBg, '');
        if (staticBg) wrapper.style.setProperty('--vx-icon-marker-bg', staticBg);

        const staticBgActive = getResponsiveValue(styles.iconMarker.staticBgActive, '');
        if (staticBgActive) wrapper.style.setProperty('--vx-icon-marker-bg-active', staticBgActive);

        const staticIconColor = getResponsiveValue(styles.iconMarker.staticIconColor, '');
        if (staticIconColor) wrapper.style.setProperty('--vx-icon-marker-icon-color', staticIconColor);

        const staticIconColorActive = getResponsiveValue(styles.iconMarker.staticIconColorActive, '');
        if (staticIconColorActive) wrapper.style.setProperty('--vx-icon-marker-icon-color-active', staticIconColorActive);
    }

    // Text marker styles
    if (styles.textMarker) {
        const textBg = getResponsiveValue(styles.textMarker.bgColor, '');
        if (textBg) wrapper.style.setProperty('--vx-text-marker-bg', textBg);

        const textBgActive = getResponsiveValue(styles.textMarker.bgColorActive, '');
        if (textBgActive) wrapper.style.setProperty('--vx-text-marker-bg-active', textBgActive);

        const textColor = getResponsiveValue(styles.textMarker.textColor, '');
        if (textColor) wrapper.style.setProperty('--vx-text-marker-text-color', textColor);

        const textColorActive = getResponsiveValue(styles.textMarker.textColorActive, '');
        if (textColorActive) wrapper.style.setProperty('--vx-text-marker-text-color-active', textColorActive);

        const textRadius = getResponsiveValue(styles.textMarker.radius, 4);
        wrapper.style.setProperty('--vx-text-marker-radius', `${textRadius}px`);

        wrapper.style.setProperty('--vx-text-marker-shadow', boxShadowToCSS(styles.textMarker.shadow));

        // Text marker typography
        if (styles.textMarker.typography) {
            const typoCSS = typographyToCSS(styles.textMarker.typography);
            if (typoCSS['font-family']) wrapper.style.setProperty('--vx-text-marker-font-family', typoCSS['font-family']);
            if (typoCSS['font-size']) wrapper.style.setProperty('--vx-text-marker-font-size', typoCSS['font-size']);
            if (typoCSS['font-weight']) wrapper.style.setProperty('--vx-text-marker-font-weight', typoCSS['font-weight']);
            if (typoCSS['font-style']) wrapper.style.setProperty('--vx-text-marker-font-style', typoCSS['font-style']);
            if (typoCSS['line-height']) wrapper.style.setProperty('--vx-text-marker-line-height', typoCSS['line-height']);
            if (typoCSS['letter-spacing']) wrapper.style.setProperty('--vx-text-marker-letter-spacing', typoCSS['letter-spacing']);
            if (typoCSS['text-transform']) wrapper.style.setProperty('--vx-text-marker-text-transform', typoCSS['text-transform']);
            if (typoCSS['text-decoration']) wrapper.style.setProperty('--vx-text-marker-text-decoration', typoCSS['text-decoration']);
        }

        // Text marker padding
        const textPadding = getResponsiveValue(styles.textMarker.padding, {});
        if (textPadding) {
            const padVal = textPadding as Record<string, string>;
            if (padVal['top']) wrapper.style.setProperty('--vx-text-marker-padding-top', padVal['top']);
            if (padVal['right']) wrapper.style.setProperty('--vx-text-marker-padding-right', padVal['right']);
            if (padVal['bottom']) wrapper.style.setProperty('--vx-text-marker-padding-bottom', padVal['bottom']);
            if (padVal['left']) wrapper.style.setProperty('--vx-text-marker-padding-left', padVal['left']);
        }
    }

    // Image marker styles
    if (styles.imageMarker) {
        const imgSize = getResponsiveValue(styles.imageMarker.size, 42);
        wrapper.style.setProperty('--vx-image-marker-size', `${imgSize}px`);

        const imgRadius = getResponsiveValue(styles.imageMarker.radius, 50);
        wrapper.style.setProperty('--vx-image-marker-radius', `${imgRadius}%`);

        wrapper.style.setProperty('--vx-image-marker-shadow', boxShadowToCSS(styles.imageMarker.shadow));
    }

    // Popup styles
    if (styles.popup) {
        const cardWidth = getResponsiveValue(styles.popup.cardWidth, 320);
        wrapper.style.setProperty('--vx-popup-card-width', `${cardWidth}px`);

        if (styles.popup.loaderColor1) {
            wrapper.style.setProperty('--vx-popup-loader-color1', styles.popup.loaderColor1);
        }
        if (styles.popup.loaderColor2) {
            wrapper.style.setProperty('--vx-popup-loader-color2', styles.popup.loaderColor2);
        }
    }

    // Search button styles
    if (styles.searchBtn) {
        const btnTextColor = getResponsiveValue(styles.searchBtn.textColor, '');
        if (btnTextColor) wrapper.style.setProperty('--vx-search-btn-text-color', btnTextColor);

        const btnBgColor = getResponsiveValue(styles.searchBtn.bgColor, '');
        if (btnBgColor) wrapper.style.setProperty('--vx-search-btn-bg', btnBgColor);

        const btnIconColor = getResponsiveValue(styles.searchBtn.iconColor, '');
        if (btnIconColor) wrapper.style.setProperty('--vx-search-btn-icon-color', btnIconColor);

        const btnIconColorActive = getResponsiveValue(styles.searchBtn.iconColorActive, '');
        if (btnIconColorActive) wrapper.style.setProperty('--vx-search-btn-icon-color-active', btnIconColorActive);

        const btnRadius = getResponsiveValue(styles.searchBtn.radius, 4);
        wrapper.style.setProperty('--vx-search-btn-radius', `${btnRadius}px`);

        // Search button typography
        if (styles.searchBtn.typography) {
            const typoCSS = typographyToCSS(styles.searchBtn.typography);
            if (typoCSS['font-family']) wrapper.style.setProperty('--vx-search-btn-font-family', typoCSS['font-family']);
            if (typoCSS['font-size']) wrapper.style.setProperty('--vx-search-btn-font-size', typoCSS['font-size']);
            if (typoCSS['font-weight']) wrapper.style.setProperty('--vx-search-btn-font-weight', typoCSS['font-weight']);
            if (typoCSS['font-style']) wrapper.style.setProperty('--vx-search-btn-font-style', typoCSS['font-style']);
            if (typoCSS['line-height']) wrapper.style.setProperty('--vx-search-btn-line-height', typoCSS['line-height']);
            if (typoCSS['letter-spacing']) wrapper.style.setProperty('--vx-search-btn-letter-spacing', typoCSS['letter-spacing']);
            if (typoCSS['text-transform']) wrapper.style.setProperty('--vx-search-btn-text-transform', typoCSS['text-transform']);
            if (typoCSS['text-decoration']) wrapper.style.setProperty('--vx-search-btn-text-decoration', typoCSS['text-decoration']);
        }

        // Checkmark icon is applied via data attribute for DOM replacement
        if (styles.searchBtn.checkmarkIcon) {
            const icon = styles.searchBtn.checkmarkIcon as any;
            wrapper.dataset.checkmarkIcon = JSON.stringify(icon);
        }
    }

    // Nav button styles
    if (styles.navBtn) {
        if (styles.navBtn.iconColor) {
            wrapper.style.setProperty('--vx-nav-btn-icon-color', styles.navBtn.iconColor);
        }
        if (styles.navBtn.iconColorHover) {
            wrapper.style.setProperty('--vx-nav-btn-icon-color-hover', styles.navBtn.iconColorHover);
        }

        const navIconSize = getResponsiveValue(styles.navBtn.iconSize, 20);
        wrapper.style.setProperty('--vx-nav-btn-icon-size', `${navIconSize}px`);

        if (styles.navBtn.bgColor) {
            wrapper.style.setProperty('--vx-nav-btn-bg', styles.navBtn.bgColor);
        }
        if (styles.navBtn.bgColorHover) {
            wrapper.style.setProperty('--vx-nav-btn-bg-hover', styles.navBtn.bgColorHover);
        }

        const navRadius = getResponsiveValue(styles.navBtn.radius, 4);
        wrapper.style.setProperty('--vx-nav-btn-radius', `${navRadius}px`);

        const navSize = getResponsiveValue(styles.navBtn.size, 36);
        wrapper.style.setProperty('--vx-nav-btn-size', `${navSize}px`);

        wrapper.style.setProperty('--vx-nav-btn-shadow', boxShadowToCSS(styles.navBtn.shadow));

        // Nav button border styles
        if (styles.navBtn.borderType && styles.navBtn.borderType !== 'none') {
            wrapper.style.setProperty('--vx-nav-btn-border-style', styles.navBtn.borderType);

            const borderWidth = getResponsiveValue(styles.navBtn.borderWidth, 0);
            wrapper.style.setProperty('--vx-nav-btn-border-width', `${borderWidth}px`);

            if (styles.navBtn.borderColor) {
                wrapper.style.setProperty('--vx-nav-btn-border-color', styles.navBtn.borderColor);
            }
            if (styles.navBtn.borderColorHover) {
                wrapper.style.setProperty('--vx-nav-btn-border-color-hover', styles.navBtn.borderColorHover);
            }
        }
    }
}

/**
 * Normalize config for both vxconfig (snake_case) and REST API (camelCase) compatibility
 */
export function normalizeConfig(raw: Record<string, any>): MapVxConfig {
    // Normalize center (handle both { lat, lng } and { latitude, longitude })
    const rawCenter = raw['center'] || {};
    const center = {
        lat: Number(raw['lat'] || rawCenter['lat'] || rawCenter['latitude'] || 51.492),
        lng: Number(raw['lng'] || rawCenter['lng'] || rawCenter['longitude'] || -0.13),
    };

    // Normalize styles (deeply nested, handle camelCase and snake_case)
    const rawStyles = raw['styles'] || {};

    // Helper to normalize responsive value
    const normalizeResponsive = <T,>(val: any, fallback: T): ResponsiveValue<T> => {
        if (!val) return { desktop: fallback, tablet: fallback, mobile: fallback };
        return {
            desktop: (val['desktop'] !== undefined ? val['desktop'] : fallback) as T,
            tablet: (val['tablet'] !== undefined ? val['tablet'] : (val['desktop'] !== undefined ? val['desktop'] : fallback)) as T,
            mobile: (val['mobile'] !== undefined ? val['mobile'] : (val['tablet'] !== undefined ? val['tablet'] : (val['desktop'] !== undefined ? val['desktop'] : fallback))) as T,
        };
    };

    // Normalize box shadow value
    const normalizeBoxShadow = (val: any): BoxShadowValue => {
        if (!val) return { enable: false };
        return {
            enable: Boolean(val['enable']),
            horizontal: Number(val['horizontal'] || val['h'] || 0),
            vertical: Number(val['vertical'] || val['v'] || 0),
            blur: Number(val['blur'] || 0),
            spread: Number(val['spread'] || 0),
            color: String(val['color'] || 'rgba(0,0,0,0.1)'),
            position: (val['position'] || (val['inset'] ? 'inset' : 'outline')) as 'inset' | 'outline',
        };
    };

    return {
        blockId: String(raw['blockId'] || raw['block_id'] || ''), // Map's own ID for event targeting
        source: (raw['source'] || 'search-form') as MapSource,
        center,
        zoom: Number(raw['zoom'] || raw['initialZoom'] || 11),
        minZoom: Number(raw['minZoom'] || raw['min_zoom'] || 2),
        maxZoom: Number(raw['maxZoom'] || raw['max_zoom'] || 18),
        dragSearch: raw['dragSearch'] !== undefined ? Boolean(raw['dragSearch']) : (raw['drag_search'] !== undefined ? Boolean(raw['drag_search']) : true),
        dragSearchMode: (raw['dragSearchMode'] || raw['drag_search_mode'] || 'manual') as DragSearchMode,
        dragSearchDefault: (raw['dragSearchDefault'] || raw['drag_search_default'] || 'unchecked') as DragSearchDefault,
        searchFormId: String(raw['searchFormId'] || raw['search_form_id'] || ''), // ID of linked search form
        styles: {
            height: normalizeResponsive(rawStyles['height'] || rawStyles['mapHeight'], 400),
            heightUnit: String(rawStyles['heightUnit'] || rawStyles['height_unit'] || 'px'),
            enableCalcHeight: normalizeResponsive(rawStyles['enableCalcHeight'] || rawStyles['enable_calc_height'], false),
            calcHeight: normalizeResponsive(rawStyles['calcHeight'] || rawStyles['calc_height'], ''),
            borderRadius: normalizeResponsive(rawStyles['borderRadius'] || rawStyles['border_radius'], 0),
            cluster: rawStyles['cluster'] ? {
                size: normalizeResponsive(rawStyles['cluster']['size'], 40),
                bgColor: normalizeResponsive(rawStyles['cluster']['bgColor'] || rawStyles['cluster']['bg_color'], ''),
                radius: normalizeResponsive(rawStyles['cluster']['radius'], 50),
                textColor: normalizeResponsive(rawStyles['cluster']['textColor'] || rawStyles['cluster']['text_color'], ''),
                shadow: normalizeBoxShadow(rawStyles['cluster']['shadow']),
                typography: (rawStyles['cluster']['typography'] || {}) as TypographyValue,
            } : {
                size: { desktop: 40 },
                bgColor: { desktop: '' },
                radius: { desktop: 50 },
                textColor: { desktop: '' },
                shadow: { enable: false },
                typography: {},
            },
            iconMarker: (rawStyles['iconMarker'] || rawStyles['icon_marker']) ? {
                size: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['size'], 42),
                iconSize: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['iconSize'] || (rawStyles['iconMarker'] || rawStyles['icon_marker'])['icon_size'], 24),
                radius: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['radius'], 50),
                shadow: normalizeBoxShadow((rawStyles['iconMarker'] || rawStyles['icon_marker'])['shadow']),
                staticBg: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['staticBg'] || (rawStyles['iconMarker'] || rawStyles['icon_marker'])['static_bg'], ''),
                staticBgActive: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['staticBgActive'] || (rawStyles['iconMarker'] || rawStyles['icon_marker'])['static_bg_active'], ''),
                staticIconColor: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['staticIconColor'] || (rawStyles['iconMarker'] || rawStyles['icon_marker'])['static_icon_color'], ''),
                staticIconColorActive: normalizeResponsive((rawStyles['iconMarker'] || rawStyles['icon_marker'])['staticIconColorActive'] || (rawStyles['iconMarker'] || rawStyles['icon_marker'])['static_icon_color_active'], ''),
            } : {
                size: { desktop: 42 },
                iconSize: { desktop: 24 },
                radius: { desktop: 50 },
                shadow: { enable: false },
                staticBg: { desktop: '' },
                staticBgActive: { desktop: '' },
                staticIconColor: { desktop: '' },
                staticIconColorActive: { desktop: '' },
            },
            textMarker: (rawStyles['textMarker'] || rawStyles['text_marker']) ? {
                bgColor: normalizeResponsive((rawStyles['textMarker'] || rawStyles['text_marker'])['bgColor'] || (rawStyles['textMarker'] || rawStyles['text_marker'])['bg_color'], ''),
                bgColorActive: normalizeResponsive((rawStyles['textMarker'] || rawStyles['text_marker'])['bgColorActive'] || (rawStyles['textMarker'] || rawStyles['text_marker'])['bg_color_active'], ''),
                textColor: normalizeResponsive((rawStyles['textMarker'] || rawStyles['text_marker'])['textColor'] || (rawStyles['textMarker'] || rawStyles['text_marker'])['text_color'], ''),
                textColorActive: normalizeResponsive((rawStyles['textMarker'] || rawStyles['text_marker'])['textColorActive'] || (rawStyles['textMarker'] || rawStyles['text_marker'])['text_color_active'], ''),
                radius: normalizeResponsive((rawStyles['textMarker'] || rawStyles['text_marker'])['radius'], 4),
                shadow: normalizeBoxShadow((rawStyles['textMarker'] || rawStyles['text_marker'])['shadow']),
                typography: ((rawStyles['textMarker'] || rawStyles['text_marker'])['typography'] || {}) as TypographyValue,
                padding: normalizeResponsive((rawStyles['textMarker'] || rawStyles['text_marker'])['padding'], {} as BoxValue),
            } : {
                bgColor: { desktop: '' },
                bgColorActive: { desktop: '' },
                textColor: { desktop: '' },
                textColorActive: { desktop: '' },
                radius: { desktop: 4 },
                shadow: { enable: false },
                typography: {},
                padding: { desktop: {} },
            },
            imageMarker: (rawStyles['imageMarker'] || rawStyles['image_marker']) ? {
                size: normalizeResponsive((rawStyles['imageMarker'] || rawStyles['image_marker'])['size'], 42),
                radius: normalizeResponsive((rawStyles['imageMarker'] || rawStyles['image_marker'])['radius'], 50),
                shadow: normalizeBoxShadow((rawStyles['imageMarker'] || rawStyles['image_marker'])['shadow']),
            } : {
                size: { desktop: 42 },
                radius: { desktop: 50 },
                shadow: { enable: false },
            },
            popup: rawStyles['popup'] ? {
                cardWidth: normalizeResponsive(rawStyles['popup']['cardWidth'] || rawStyles['popup']['card_width'], 320),
                loaderColor1: String(rawStyles['popup']['loaderColor1'] || rawStyles['popup']['loader_color_1'] || ''),
                loaderColor2: String(rawStyles['popup']['loaderColor2'] || rawStyles['popup']['loader_color_2'] || ''),
            } : {
                cardWidth: { desktop: 320 },
                loaderColor1: '',
                loaderColor2: '',
            },
            searchBtn: (rawStyles['searchBtn'] || rawStyles['search_btn']) ? {
                textColor: normalizeResponsive((rawStyles['searchBtn'] || rawStyles['search_btn'])['textColor'] || (rawStyles['searchBtn'] || rawStyles['search_btn'])['text_color'], ''),
                bgColor: normalizeResponsive((rawStyles['searchBtn'] || rawStyles['search_btn'])['bgColor'] || (rawStyles['searchBtn'] || rawStyles['search_btn'])['bg_color'], ''),
                iconColor: normalizeResponsive((rawStyles['searchBtn'] || rawStyles['search_btn'])['iconColor'] || (rawStyles['searchBtn'] || rawStyles['search_btn'])['icon_color'], ''),
                iconColorActive: normalizeResponsive((rawStyles['searchBtn'] || rawStyles['search_btn'])['iconColorActive'] || (rawStyles['searchBtn'] || rawStyles['search_btn'])['icon_color_active'], ''),
                radius: normalizeResponsive((rawStyles['searchBtn'] || rawStyles['search_btn'])['radius'] || (rawStyles['searchBtn'] || rawStyles['search_btn'])['radius'], 4),
                typography: ((rawStyles['searchBtn'] || rawStyles['search_btn'])['typography'] || {}) as TypographyValue,
                checkmarkIcon: ((rawStyles['searchBtn'] || rawStyles['search_btn'])['checkmarkIcon'] || {}) as any,
                searchIcon: ((rawStyles['searchBtn'] || rawStyles['search_btn'])['searchIcon'] || {}) as any,
            } : {
                textColor: { desktop: '' },
                bgColor: { desktop: '' },
                iconColor: { desktop: '' },
                iconColorActive: { desktop: '' },
                radius: { desktop: 4 },
                typography: {},
                checkmarkIcon: {},
                searchIcon: {},
            },
            navBtn: (rawStyles['navBtn'] || rawStyles['nav_btn']) ? {
                iconColor: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['iconColor'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['icon_color'] || ''),
                iconColorHover: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['iconColorHover'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['icon_color_hover'] || ''),
                iconSize: normalizeResponsive((rawStyles['navBtn'] || rawStyles['nav_btn'])['iconSize'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['icon_size'], 20),
                bgColor: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['bgColor'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['bg_color'] || ''),
                bgColorHover: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['bgColorHover'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['bg_color_hover'] || ''),
                radius: normalizeResponsive((rawStyles['navBtn'] || rawStyles['nav_btn'])['radius'], 4),
                size: normalizeResponsive((rawStyles['navBtn'] || rawStyles['nav_btn'])['size'], 36),
                shadow: normalizeBoxShadow((rawStyles['navBtn'] || rawStyles['nav_btn'])['shadow']),
                borderType: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['borderType'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['border_type'] || 'none'),
                borderWidth: normalizeResponsive((rawStyles['navBtn'] || rawStyles['nav_btn'])['borderWidth'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['border_width'], 0),
                borderColor: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['borderColor'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['border_color'] || ''),
                borderColorHover: String((rawStyles['navBtn'] || rawStyles['nav_btn'])['borderColorHover'] || (rawStyles['navBtn'] || rawStyles['nav_btn'])['border_color_hover'] || ''),
            } : {
                iconSize: { desktop: 20 },
                radius: { desktop: 4 },
                size: { desktop: 36 },
                shadow: { enable: false },
                borderType: 'none',
                borderWidth: { desktop: 0 },
            } as any,
            geolocationIcon: (rawStyles['geolocationIcon'] || rawStyles['geolocation_icon'] || {}) as any,
        },
    };
}
