/**
 * Image Block - Style Generation
 *
 * Generates CSS from Style Tab inspector controls.
 * Handles responsive attributes that cannot be handled by inline styles.
 *
 * @package VoxelFSE
 */

import type { ImageBlockAttributes } from './types';

/**
 * Generate CSS for Image block
 *
 * @param attributes - Block attributes
 * @param blockId - Block ID for scoped selector
 * @returns CSS string
 */
export function generateImageStyles(
    attributes: ImageBlockAttributes,
    blockId: string
): string {
    // Primary selector targets the wrapper div inside the block
    const selector = `.voxel-fse-image-wrapper-${blockId}`;
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    // ============================================
    // ALIGNMENT (Wrapper)
    // ============================================
    if (attributes.imageAlign) {
        cssRules.push(`${selector} { text-align: ${attributes.imageAlign}; }`);
    }
    if (attributes.imageAlign_tablet) {
        tabletRules.push(`${selector} { text-align: ${attributes.imageAlign_tablet}; }`);
    }
    if (attributes.imageAlign_mobile) {
        mobileRules.push(`${selector} { text-align: ${attributes.imageAlign_mobile}; }`);
    }

    // ============================================
    // DIMENSIONS (Image)
    // ResponsiveRangeControl stores plain numbers: width, width_tablet, width_mobile
    // Unit is stored separately: widthUnit, heightUnit, maxWidthUnit
    // ============================================
    // Width
    if (typeof attributes.width === 'number') {
        const unit = attributes.widthUnit || 'px';
        cssRules.push(`${selector} img { width: ${attributes.width}${unit}; }`);
    }
    if (typeof attributes.width_tablet === 'number') {
        const unit = attributes.widthUnit || 'px';
        tabletRules.push(`${selector} img { width: ${attributes.width_tablet}${unit}; }`);
    }
    if (typeof attributes.width_mobile === 'number') {
        const unit = attributes.widthUnit || 'px';
        mobileRules.push(`${selector} img { width: ${attributes.width_mobile}${unit}; }`);
    }

    // Custom Size (overrides responsive width/height if set)
    if (attributes.imageSize === 'custom') {
        if (attributes.customWidth) {
            cssRules.push(`${selector} img { width: ${attributes.customWidth}px; }`);
        } else {
            cssRules.push(`${selector} img { width: auto; }`);
        }

        if (attributes.customHeight) {
            cssRules.push(`${selector} img { height: ${attributes.customHeight}px; }`);
        } else {
            cssRules.push(`${selector} img { height: auto; }`);
        }
    }

    // Max Width
    if (typeof attributes.maxWidth === 'number') {
        const unit = attributes.maxWidthUnit || 'px';
        cssRules.push(`${selector} img { max-width: ${attributes.maxWidth}${unit}; }`);
    }
    if (typeof attributes.maxWidth_tablet === 'number') {
        const unit = attributes.maxWidthUnit || 'px';
        tabletRules.push(`${selector} img { max-width: ${attributes.maxWidth_tablet}${unit}; }`);
    }
    if (typeof attributes.maxWidth_mobile === 'number') {
        const unit = attributes.maxWidthUnit || 'px';
        mobileRules.push(`${selector} img { max-width: ${attributes.maxWidth_mobile}${unit}; }`);
    }

    // Height
    if (typeof attributes.height === 'number') {
        const unit = attributes.heightUnit || 'px';
        cssRules.push(`${selector} img { height: ${attributes.height}${unit}; }`);
    }
    if (typeof attributes.height_tablet === 'number') {
        const unit = attributes.heightUnit || 'px';
        tabletRules.push(`${selector} img { height: ${attributes.height_tablet}${unit}; }`);
    }
    if (typeof attributes.height_mobile === 'number') {
        const unit = attributes.heightUnit || 'px';
        mobileRules.push(`${selector} img { height: ${attributes.height_mobile}${unit}; }`);
    }

    // Object Fit (Responsive)
    if (attributes.objectFit) {
        cssRules.push(`${selector} img { object-fit: ${attributes.objectFit}; }`);
    }
    if (attributes.objectFit_tablet) {
        tabletRules.push(`${selector} img { object-fit: ${attributes.objectFit_tablet}; }`);
    }
    if (attributes.objectFit_mobile) {
        mobileRules.push(`${selector} img { object-fit: ${attributes.objectFit_mobile}; }`);
    }

    // Object Position (Responsive)
    if (attributes.objectPosition) {
        cssRules.push(`${selector} img { object-position: ${attributes.objectPosition}; }`);
    }
    if (attributes.objectPosition_tablet) {
        tabletRules.push(`${selector} img { object-position: ${attributes.objectPosition_tablet}; }`);
    }
    if (attributes.objectPosition_mobile) {
        mobileRules.push(`${selector} img { object-position: ${attributes.objectPosition_mobile}; }`);
    }

    // ============================================
    // CAPTION ALIGNMENT
    // ============================================
    // Targeting figcaption
    if (attributes.captionAlign) {
        cssRules.push(`${selector} figcaption { text-align: ${attributes.captionAlign}; }`);
    }
    if (attributes.captionAlign_tablet) {
        tabletRules.push(`${selector} figcaption { text-align: ${attributes.captionAlign_tablet}; }`);
    }
    if (attributes.captionAlign_mobile) {
        mobileRules.push(`${selector} figcaption { text-align: ${attributes.captionAlign_mobile}; }`);
    }

    // ============================================
    // BORDER & RADIUS
    // Note: StyleTab saves to 'imageBorder' object
    // ============================================
    const border = attributes.imageBorder;
    if (border) {
        // Helper to format dimension values
        const formatDimension = (val: any) => {
            if (val === undefined || val === null || val === '') return '0px';
            if (typeof val === 'number') return `${val}px`;
            if (typeof val === 'string') {
                if (/^\d+(\.\d+)?(px|%|em|rem|vw|vh)$/.test(val)) return val;
                if (/^\d+(\.\d+)?$/.test(val)) return `${val}px`;
            }
            return val;
        };

        // Border Type
        if (border.borderType && border.borderType !== 'none') {
            cssRules.push(`${selector} img { border-style: ${border.borderType}; }`);

            // Width
            if (border.borderWidth) {
                const w = border.borderWidth;
                const top = formatDimension(w.top);
                const right = formatDimension(w.right);
                const bottom = formatDimension(w.bottom);
                const left = formatDimension(w.left);
                cssRules.push(`${selector} img { border-width: ${top} ${right} ${bottom} ${left}; }`);
            }

            // Color
            if (border.borderColor) {
                cssRules.push(`${selector} img { border-color: ${border.borderColor}; }`);
            }
        }

        // Radius (Standard)
        if (border.borderRadius) {
            const r = border.borderRadius;
            const top = formatDimension(r.top);
            const right = formatDimension(r.right);
            const bottom = formatDimension(r.bottom);
            const left = formatDimension(r.left);
            cssRules.push(`${selector} img { border-radius: ${top} ${right} ${bottom} ${left}; }`);
        }

        // Radius (Responsive)
        if (border.borderRadius_tablet) {
            const r = border.borderRadius_tablet;
            const top = formatDimension(r.top);
            const right = formatDimension(r.right);
            const bottom = formatDimension(r.bottom);
            const left = formatDimension(r.left);
            tabletRules.push(`${selector} img { border-radius: ${top} ${right} ${bottom} ${left}; }`);
        }
        if (border.borderRadius_mobile) {
            const r = border.borderRadius_mobile;
            const top = formatDimension(r.top);
            const right = formatDimension(r.right);
            const bottom = formatDimension(r.bottom);
            const left = formatDimension(r.left);
            mobileRules.push(`${selector} img { border-radius: ${top} ${right} ${bottom} ${left}; }`);
        }
    }

    // ============================================
    // BOX SHADOW
    // ============================================
    const boxShadow = attributes.imageBoxShadow;
    if (boxShadow && (boxShadow.horizontal || boxShadow.vertical || boxShadow.blur || boxShadow.spread)) {
        const position = boxShadow.position === 'inset' ? 'inset ' : '';
        const shadow = `${position}${boxShadow.horizontal || 0}px ${boxShadow.vertical || 0}px ${boxShadow.blur || 0}px ${boxShadow.spread || 0}px ${boxShadow.color || 'rgba(0,0,0,0.5)'}`;
        cssRules.push(`${selector} img { box-shadow: ${shadow}; }`);
    }

    // ============================================
    // FILTERS & OPACITY
    // ============================================

    // Opacity
    if (attributes.imageOpacity !== undefined && attributes.imageOpacity !== 1) {
        cssRules.push(`${selector} img { opacity: ${attributes.imageOpacity}; }`);
    }

    // CSS Filters
    const cssFilters = attributes.imageCssFilters;
    if (cssFilters && Object.keys(cssFilters).length > 0) {
        const filterParts: string[] = [];
        if (cssFilters.blur !== undefined) filterParts.push(`blur(${cssFilters.blur}px)`);
        if (cssFilters.brightness !== undefined) filterParts.push(`brightness(${cssFilters.brightness}%)`);
        if (cssFilters.contrast !== undefined) filterParts.push(`contrast(${cssFilters.contrast}%)`);
        if (cssFilters.saturation !== undefined) filterParts.push(`saturate(${cssFilters.saturation}%)`);
        if (cssFilters.hue !== undefined) filterParts.push(`hue-rotate(${cssFilters.hue}deg)`);
        if (filterParts.length > 0) {
            cssRules.push(`${selector} img { filter: ${filterParts.join(' ')}; }`);
        }
    }

    // Transition
    if (attributes.imageTransitionDuration !== undefined) {
        cssRules.push(`${selector} img { transition-duration: ${attributes.imageTransitionDuration}s; }`);
    }

    // ============================================
    // COMBINE RULES
    // ============================================
    let css = cssRules.join('\n');

    if (tabletRules.length > 0) {
        css += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
    }

    if (mobileRules.length > 0) {
        css += `\n@media (max-width: 767px) {\n${mobileRules.join('\n')}\n}`;
    }

    return css;
}
