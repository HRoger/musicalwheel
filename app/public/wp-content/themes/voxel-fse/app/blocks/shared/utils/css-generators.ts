/**
 * CSS Generators Utility
 *
 * Helper functions to generate CSS rules from block attributes.
 * Used by block style generation files (e.g. styles.ts).
 *
 * @package VoxelFSE
 */

interface DimensionsConfig {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
    unit?: string;
    linked?: boolean;
}

interface TypographyConfig {
    fontFamily?: string;
    fontSize?: number;
    fontSizeUnit?: string;
    fontWeight?: string;
    textTransform?: string;
    fontStyle?: string;
    textDecoration?: string;
    lineHeight?: number;
    lineHeightUnit?: string;
    letterSpacing?: number;
    letterSpacingUnit?: string;

    // Tablet overrides
    fontSize_tablet?: number;
    lineHeight_tablet?: number;
    letterSpacing_tablet?: number;

    // Mobile overrides
    fontSize_mobile?: number;
    lineHeight_mobile?: number;
    letterSpacing_mobile?: number;
}

interface ResponsiveCSS {
    desktop: string;
    tablet: string;
    mobile: string;
}

/**
 * Generate CSS for dimensions (padding, margin)
 * handles _tablet and _mobile suffixes
 */
export function generateDimensionsCSS(
    attributes: Record<string, any>,
    prefix: string,
    property: 'padding' | 'margin' = 'padding'
): ResponsiveCSS {
    const css: ResponsiveCSS = { desktop: '', tablet: '', mobile: '' };

    // Helper to format values
    const format = (val: string | number | undefined, unit: string) =>
        val !== undefined && val !== '' ? `${val}${unit}` : undefined;

    // Desktop
    const desktopVal = attributes[prefix] as DimensionsConfig | undefined;
    if (desktopVal) {
        const unit = desktopVal.unit || 'px';
        const top = format(desktopVal.top, unit);
        const right = format(desktopVal.right, unit);
        const bottom = format(desktopVal.bottom, unit);
        const left = format(desktopVal.left, unit);
        const rules = [];
        if (top) rules.push(`${property}-top: ${top}`);
        if (right) rules.push(`${property}-right: ${right}`);
        if (bottom) rules.push(`${property}-bottom: ${bottom}`);
        if (left) rules.push(`${property}-left: ${left}`);
        css.desktop = rules.join('; ');
    }

    // Tablet
    const tabletVal = attributes[`${prefix}_tablet`] as DimensionsConfig | undefined;
    if (tabletVal) {
        const unit = tabletVal.unit || 'px';
        const top = format(tabletVal.top, unit);
        const right = format(tabletVal.right, unit);
        const bottom = format(tabletVal.bottom, unit);
        const left = format(tabletVal.left, unit);
        const rules = [];
        if (top) rules.push(`${property}-top: ${top}`);
        if (right) rules.push(`${property}-right: ${right}`);
        if (bottom) rules.push(`${property}-bottom: ${bottom}`);
        if (left) rules.push(`${property}-left: ${left}`);
        css.tablet = rules.join('; ');
    }

    // Mobile
    const mobileVal = attributes[`${prefix}_mobile`] as DimensionsConfig | undefined;
    if (mobileVal) {
        const unit = mobileVal.unit || 'px';
        const top = format(mobileVal.top, unit);
        const right = format(mobileVal.right, unit);
        const bottom = format(mobileVal.bottom, unit);
        const left = format(mobileVal.left, unit);
        const rules = [];
        if (top) rules.push(`${property}-top: ${top}`);
        if (right) rules.push(`${property}-right: ${right}`);
        if (bottom) rules.push(`${property}-bottom: ${bottom}`);
        if (left) rules.push(`${property}-left: ${left}`);
        css.mobile = rules.join('; ');
    }

    return css;
}

/**
 * Generate CSS for typography
 */
export function generateTypographyCSS(typography: TypographyConfig | undefined): ResponsiveCSS {
    const css: ResponsiveCSS = { desktop: '', tablet: '', mobile: '' };
    if (!typography) return css;

    // Desktop
    const desktopRules = [];
    if (typography.fontFamily) desktopRules.push(`font-family: "${typography.fontFamily}"`);
    if (typography.fontSize) desktopRules.push(`font-size: ${typography.fontSize}${typography.fontSizeUnit || 'px'}`);
    if (typography.fontWeight) desktopRules.push(`font-weight: ${typography.fontWeight}`);
    if (typography.textTransform) desktopRules.push(`text-transform: ${typography.textTransform}`);
    if (typography.fontStyle) desktopRules.push(`font-style: ${typography.fontStyle}`);
    if (typography.textDecoration) desktopRules.push(`text-decoration: ${typography.textDecoration}`);
    if (typography.lineHeight) desktopRules.push(`line-height: ${typography.lineHeight}${typography.lineHeightUnit || 'px'}`);
    if (typography.letterSpacing) desktopRules.push(`letter-spacing: ${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}`);
    css.desktop = desktopRules.join('; ');

    // Tablet
    const tabletRules = [];
    if (typography.fontSize_tablet) tabletRules.push(`font-size: ${typography.fontSize_tablet}${typography.fontSizeUnit || 'px'}`);
    if (typography.lineHeight_tablet) tabletRules.push(`line-height: ${typography.lineHeight_tablet}${typography.lineHeightUnit || 'px'}`);
    if (typography.letterSpacing_tablet) tabletRules.push(`letter-spacing: ${typography.letterSpacing_tablet}${typography.letterSpacingUnit || 'px'}`);
    css.tablet = tabletRules.join('; ');

    // Mobile
    const mobileRules = [];
    if (typography.fontSize_mobile) mobileRules.push(`font-size: ${typography.fontSize_mobile}${typography.fontSizeUnit || 'px'}`);
    if (typography.lineHeight_mobile) mobileRules.push(`line-height: ${typography.lineHeight_mobile}${typography.lineHeightUnit || 'px'}`);
    if (typography.letterSpacing_mobile) mobileRules.push(`letter-spacing: ${typography.letterSpacing_mobile}${typography.letterSpacingUnit || 'px'}`);
    css.mobile = mobileRules.join('; ');

    return css;
}

/**
 * Generate CSS for Border (Type, Width, Color, Radius)
 */
export function generateBorderCSS(attributes: Record<string, any>, prefix: string): ResponsiveCSS {
    const css: ResponsiveCSS = { desktop: '', tablet: '', mobile: '' };

    // Type and Color (usually not responsive in Voxel, or handled separately)
    const type = attributes[`${prefix}Type`];
    const color = attributes[`${prefix}Color`];

    if (type && type !== 'none') {
        const desktopRules = [`border-style: ${type}`];
        if (color) desktopRules.push(`border-color: ${color}`);

        // Width
        const width = attributes[`${prefix}Width`] as DimensionsConfig | undefined;
        if (width) {
            const unit = width.unit || 'px';
            if (width.top) desktopRules.push(`border-top-width: ${width.top}${unit}`);
            if (width.right) desktopRules.push(`border-right-width: ${width.right}${unit}`);
            if (width.bottom) desktopRules.push(`border-bottom-width: ${width.bottom}${unit}`);
            if (width.left) desktopRules.push(`border-left-width: ${width.left}${unit}`);
        }

        // Radius
        const radius = attributes[`${prefix}Radius`] as DimensionsConfig | undefined;
        if (radius) {
            const unit = radius.unit || 'px';
            if (radius.top) desktopRules.push(`border-top-left-radius: ${radius.top}${unit}`);
            if (radius.right) desktopRules.push(`border-top-right-radius: ${radius.right}${unit}`);
            if (radius.bottom) desktopRules.push(`border-bottom-right-radius: ${radius.bottom}${unit}`);
            if (radius.left) desktopRules.push(`border-bottom-left-radius: ${radius.left}${unit}`);
        }

        css.desktop = desktopRules.join('; ');

        // Tablet Radius
        const radiusTablet = attributes[`${prefix}Radius_tablet`] as DimensionsConfig | undefined;
        if (radiusTablet) {
            const rules = [];
            const unit = radiusTablet.unit || 'px';
            if (radiusTablet.top) rules.push(`border-top-left-radius: ${radiusTablet.top}${unit}`);
            if (radiusTablet.right) rules.push(`border-top-right-radius: ${radiusTablet.right}${unit}`);
            if (radiusTablet.bottom) rules.push(`border-bottom-right-radius: ${radiusTablet.bottom}${unit}`);
            if (radiusTablet.left) rules.push(`border-bottom-left-radius: ${radiusTablet.left}${unit}`);
            css.tablet = rules.join('; ');
        }

        // Mobile Radius
        const radiusMobile = attributes[`${prefix}Radius_mobile`] as DimensionsConfig | undefined;
        if (radiusMobile) {
            const rules = [];
            const unit = radiusMobile.unit || 'px';
            if (radiusMobile.top) rules.push(`border-top-left-radius: ${radiusMobile.top}${unit}`);
            if (radiusMobile.right) rules.push(`border-top-right-radius: ${radiusMobile.right}${unit}`);
            if (radiusMobile.bottom) rules.push(`border-bottom-right-radius: ${radiusMobile.bottom}${unit}`);
            if (radiusMobile.left) rules.push(`border-bottom-left-radius: ${radiusMobile.left}${unit}`);
            css.mobile = rules.join('; ');
        }
    }

    return css;
}

/**
 * Generate CSS for Box Shadow
 */
export function generateBoxShadowCSS(boxShadow: Record<string, any> | undefined): string {
    if (!boxShadow || Object.keys(boxShadow).length === 0) return '';

    const h = boxShadow['horizontal'] ?? 0;
    const v = boxShadow['vertical'] ?? 0;
    const blur = boxShadow['blur'] ?? 10;
    const spread = boxShadow['spread'] ?? 0;
    const color = boxShadow['color'] ?? 'rgba(0,0,0,0.5)';
    const position = boxShadow['position'] === 'inset' ? 'inset ' : '';

    return `${position}${h}px ${v}px ${blur}px ${spread}px ${color}`;
}

/**
 * Generate CSS for Background
 */
export function generateBackgroundCSS(background: Record<string, any> | undefined): string {
    if (!background || Object.keys(background).length === 0) return '';

    const bgType = background['backgroundType'] || 'classic';
    const rules: string[] = [];

    if (bgType === 'classic') {
        if (background['backgroundColor']) {
            rules.push(`background-color: ${background['backgroundColor']}`);
        }
        if (background['backgroundImage']?.url) {
            rules.push(`background-image: url(${background['backgroundImage'].url})`);
            if (background['bgImagePosition']) rules.push(`background-position: ${background['bgImagePosition']}`);
            if (background['bgImageAttachment']) rules.push(`background-attachment: ${background['bgImageAttachment']}`);
            if (background['bgImageRepeat']) rules.push(`background-repeat: ${background['bgImageRepeat']}`);
            if (background['bgImageSize'] === 'custom' && background['bgImageCustomWidth']) {
                const unit = background['bgImageCustomWidthUnit'] || 'px';
                rules.push(`background-size: ${background['bgImageCustomWidth']}${unit}`);
            } else if (background['bgImageSize']) {
                rules.push(`background-size: ${background['bgImageSize']}`);
            }
        }
    } else if (bgType === 'gradient') {
        const color1 = background['gradientColor'] || '#000000';
        const loc1 = background['gradientLocation'] ?? 0;
        const color2 = background['gradientSecondColor'] || '#ffffff';
        const loc2 = background['gradientSecondLocation'] ?? 100;

        if (background['gradientType'] === 'radial') {
            const position = background['gradientPosition'] || 'center center';
            rules.push(`background-image: radial-gradient(at ${position}, ${color1} ${loc1}%, ${color2} ${loc2}%)`);
        } else {
            const angle = background['gradientAngle'] ?? 180;
            rules.push(`background-image: linear-gradient(${angle}deg, ${color1} ${loc1}%, ${color2} ${loc2}%)`);
        }
    }

    return rules.join('; ');
}
