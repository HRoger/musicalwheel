/**
 * Style Generation Utilities for Flex Container Block
 *
 * Generates CSS styles from block attributes for both editor and frontend.
 */

import type { CSSProperties } from 'react';

export interface FlexContainerAttributes {
    containerWidth?: string;
    customContainerWidth?: number;
    customContainerWidth_tablet?: number;
    customContainerWidth_mobile?: number;
    customContainerWidthUnit?: string;
    contentWidthType?: string;
    contentWidth?: number;
    contentWidth_tablet?: number;
    contentWidth_mobile?: number;
    contentWidthUnit?: string;
    minHeight?: number;
    minHeight_tablet?: number;
    minHeight_mobile?: number;
    minHeightUnit?: string;
    htmlTag?: string;
    overflow?: string;
    flexDirection?: string;
    flexDirection_tablet?: string;
    flexDirection_mobile?: string;
    justifyContent?: string;
    justifyContent_tablet?: string;
    justifyContent_mobile?: string;
    alignItems?: string;
    alignItems_tablet?: string;
    alignItems_mobile?: string;
    flexWrap?: string;
    flexWrap_tablet?: string;
    flexWrap_mobile?: string;
    columnGap?: number;
    columnGap_tablet?: number;
    columnGap_mobile?: number;
    columnGapUnit?: string;
    rowGap?: number;
    rowGap_tablet?: number;
    rowGap_mobile?: number;
    rowGapUnit?: string;
    backgroundColor?: string;
    border?: {
        style?: string;
        width?: number;
        color?: string;
    };
    borderRadius?: number;
    borderRadius_tablet?: number;
    borderRadius_mobile?: number;
    borderRadiusUnit?: string;
    boxShadow?: {
        enabled?: boolean;
        horizontal?: number;
        vertical?: number;
        blur?: number;
        spread?: number;
        color?: string;
        inset?: boolean;
    };
    padding?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };
    zIndex?: number;
    [key: string]: any;
}

/**
 * Generate inline styles for the flex container (desktop)
 */
export function generateContainerStyles(attributes: FlexContainerAttributes): CSSProperties {
    const styles: CSSProperties = {
        display: 'flex',
    };

    // Container Width
    if (attributes.containerWidth === 'full') {
        styles.width = '100vw';
        styles.marginLeft = 'calc(-50vw + 50%)';
        styles.marginRight = 'calc(-50vw + 50%)';
    } else if (attributes.containerWidth === 'wide') {
        styles.width = '100%';
        styles.maxWidth = '1200px';
        styles.marginLeft = 'auto';
        styles.marginRight = 'auto';
    } else if (attributes.containerWidth === 'custom' && attributes.customContainerWidth) {
        styles.width = `${attributes.customContainerWidth}${attributes.customContainerWidthUnit || 'px'}`;
        styles.marginLeft = 'auto';
        styles.marginRight = 'auto';
    }

    // Content Width (only if boxed)
    if (attributes.contentWidthType !== 'full' && attributes.contentWidth) {
        styles.maxWidth = `${attributes.contentWidth}${attributes.contentWidthUnit || 'px'}`;
        styles.marginLeft = 'auto';
        styles.marginRight = 'auto';
    }

    // Min Height
    if (attributes.minHeight) {
        styles.minHeight = `${attributes.minHeight}${attributes.minHeightUnit || 'px'}`;
    }

    // Overflow
    if (attributes.overflow && attributes.overflow !== 'visible') {
        styles.overflow = attributes.overflow;
    }

    // Flex Direction
    if (attributes.flexDirection) {
        styles.flexDirection = attributes.flexDirection as CSSProperties['flexDirection'];
    }

    // Justify Content
    if (attributes.justifyContent) {
        styles.justifyContent = attributes.justifyContent;
    }

    // Align Items
    if (attributes.alignItems) {
        styles.alignItems = attributes.alignItems;
    }

    // Flex Wrap
    if (attributes.flexWrap) {
        styles.flexWrap = attributes.flexWrap as CSSProperties['flexWrap'];
    }

    // Column Gap
    if (attributes.columnGap !== undefined) {
        styles.columnGap = `${attributes.columnGap}${attributes.columnGapUnit || 'px'}`;
    }

    // Row Gap
    if (attributes.rowGap !== undefined) {
        styles.rowGap = `${attributes.rowGap}${attributes.rowGapUnit || 'px'}`;
    }

    // Background Color
    if (attributes.backgroundColor) {
        styles.backgroundColor = attributes.backgroundColor;
    }

    // Border
    if (attributes.border?.style && attributes.border.style !== 'none') {
        styles.borderStyle = attributes.border.style;
        if (attributes.border.width) {
            styles.borderWidth = `${attributes.border.width}px`;
        }
        if (attributes.border.color) {
            styles.borderColor = attributes.border.color;
        }
    }

    // Border Radius
    if (attributes.borderRadius) {
        styles.borderRadius = `${attributes.borderRadius}${attributes.borderRadiusUnit || 'px'}`;
    }

    // Box Shadow
    if (attributes.boxShadow?.enabled) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.5)', inset = false } = attributes.boxShadow;
        styles.boxShadow = `${inset ? 'inset ' : ''}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
    }

    // Padding
    if (attributes.padding) {
        if (attributes.padding.top) styles.paddingTop = attributes.padding.top;
        if (attributes.padding.right) styles.paddingRight = attributes.padding.right;
        if (attributes.padding.bottom) styles.paddingBottom = attributes.padding.bottom;
        if (attributes.padding.left) styles.paddingLeft = attributes.padding.left;
    }

    // Margin
    if (attributes.margin) {
        if (attributes.margin.top) styles.marginTop = attributes.margin.top;
        if (attributes.margin.right) styles.marginRight = attributes.margin.right;
        if (attributes.margin.bottom) styles.marginBottom = attributes.margin.bottom;
        if (attributes.margin.left) styles.marginLeft = attributes.margin.left;
    }

    // Z-Index
    if (attributes.zIndex !== undefined) {
        styles.zIndex = attributes.zIndex;
    }

    return styles;
}

/**
 * Generate responsive CSS string for frontend
 * This generates a <style> tag content with media queries
 */
export function generateResponsiveCSS(attributes: FlexContainerAttributes, blockId: string): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    const selector = `.voxel-fse-flex-container-${blockId}`;

    // Desktop styles
    const desktopStyles: string[] = ['display: flex'];

    // Container Width
    if (attributes.containerWidth === 'full') {
        desktopStyles.push('width: 100vw');
        desktopStyles.push('margin-left: calc(-50vw + 50%)');
        desktopStyles.push('margin-right: calc(-50vw + 50%)');
    } else if (attributes.containerWidth === 'wide') {
        desktopStyles.push('width: 100%');
        desktopStyles.push('max-width: 1200px');
        desktopStyles.push('margin-left: auto');
        desktopStyles.push('margin-right: auto');
    } else if (attributes.containerWidth === 'custom' && attributes.customContainerWidth) {
        desktopStyles.push(`width: ${attributes.customContainerWidth}${attributes.customContainerWidthUnit || 'px'}`);
        desktopStyles.push('margin-left: auto');
        desktopStyles.push('margin-right: auto');
    }

    // Content Width
    if (attributes.contentWidthType !== 'full' && attributes.contentWidth) {
        desktopStyles.push(`max-width: ${attributes.contentWidth}${attributes.contentWidthUnit || 'px'}`);
        desktopStyles.push('margin-left: auto');
        desktopStyles.push('margin-right: auto');
    }

    // Min Height
    if (attributes.minHeight) {
        desktopStyles.push(`min-height: ${attributes.minHeight}${attributes.minHeightUnit || 'px'}`);
    }

    // Overflow
    if (attributes.overflow && attributes.overflow !== 'visible') {
        desktopStyles.push(`overflow: ${attributes.overflow}`);
    }

    // Flex Direction
    if (attributes.flexDirection) {
        desktopStyles.push(`flex-direction: ${attributes.flexDirection}`);
    }

    // Justify Content
    if (attributes.justifyContent) {
        desktopStyles.push(`justify-content: ${attributes.justifyContent}`);
    }

    // Align Items
    if (attributes.alignItems) {
        desktopStyles.push(`align-items: ${attributes.alignItems}`);
    }

    // Flex Wrap
    if (attributes.flexWrap) {
        desktopStyles.push(`flex-wrap: ${attributes.flexWrap}`);
    }

    // Column Gap
    if (attributes.columnGap !== undefined) {
        desktopStyles.push(`column-gap: ${attributes.columnGap}${attributes.columnGapUnit || 'px'}`);
    }

    // Row Gap
    if (attributes.rowGap !== undefined) {
        desktopStyles.push(`row-gap: ${attributes.rowGap}${attributes.rowGapUnit || 'px'}`);
    }

    // Background Color
    if (attributes.backgroundColor) {
        desktopStyles.push(`background-color: ${attributes.backgroundColor}`);
    }

    // Border
    if (attributes.border?.style && attributes.border.style !== 'none') {
        desktopStyles.push(`border-style: ${attributes.border.style}`);
        if (attributes.border.width) {
            desktopStyles.push(`border-width: ${attributes.border.width}px`);
        }
        if (attributes.border.color) {
            desktopStyles.push(`border-color: ${attributes.border.color}`);
        }
    }

    // Border Radius
    if (attributes.borderRadius) {
        desktopStyles.push(`border-radius: ${attributes.borderRadius}${attributes.borderRadiusUnit || 'px'}`);
    }

    // Box Shadow
    if (attributes.boxShadow?.enabled) {
        const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.5)', inset = false } = attributes.boxShadow;
        desktopStyles.push(`box-shadow: ${inset ? 'inset ' : ''}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`);
    }

    // Padding
    if (attributes.padding) {
        if (attributes.padding.top) desktopStyles.push(`padding-top: ${attributes.padding.top}`);
        if (attributes.padding.right) desktopStyles.push(`padding-right: ${attributes.padding.right}`);
        if (attributes.padding.bottom) desktopStyles.push(`padding-bottom: ${attributes.padding.bottom}`);
        if (attributes.padding.left) desktopStyles.push(`padding-left: ${attributes.padding.left}`);
    }

    // Margin
    if (attributes.margin) {
        if (attributes.margin.top) desktopStyles.push(`margin-top: ${attributes.margin.top}`);
        if (attributes.margin.right) desktopStyles.push(`margin-right: ${attributes.margin.right}`);
        if (attributes.margin.bottom) desktopStyles.push(`margin-bottom: ${attributes.margin.bottom}`);
        if (attributes.margin.left) desktopStyles.push(`margin-left: ${attributes.margin.left}`);
    }

    // Z-Index
    if (attributes.zIndex !== undefined) {
        desktopStyles.push(`z-index: ${attributes.zIndex}`);
    }

    cssRules.push(`${selector} { ${desktopStyles.join('; ')}; }`);

    // Tablet styles (max-width: 1024px)
    if (attributes.containerWidth === 'custom' && attributes.customContainerWidth_tablet) {
        tabletRules.push(`width: ${attributes.customContainerWidth_tablet}${attributes.customContainerWidthUnit || 'px'}`);
    }
    if (attributes.contentWidth_tablet) {
        tabletRules.push(`max-width: ${attributes.contentWidth_tablet}${attributes.contentWidthUnit || 'px'}`);
    }
    if (attributes.minHeight_tablet) {
        tabletRules.push(`min-height: ${attributes.minHeight_tablet}${attributes.minHeightUnit || 'px'}`);
    }
    if (attributes.flexDirection_tablet) {
        tabletRules.push(`flex-direction: ${attributes.flexDirection_tablet}`);
    }
    if (attributes.justifyContent_tablet) {
        tabletRules.push(`justify-content: ${attributes.justifyContent_tablet}`);
    }
    if (attributes.alignItems_tablet) {
        tabletRules.push(`align-items: ${attributes.alignItems_tablet}`);
    }
    if (attributes.flexWrap_tablet) {
        tabletRules.push(`flex-wrap: ${attributes.flexWrap_tablet}`);
    }
    if (attributes.columnGap_tablet !== undefined) {
        tabletRules.push(`column-gap: ${attributes.columnGap_tablet}${attributes.columnGapUnit || 'px'}`);
    }
    if (attributes.rowGap_tablet !== undefined) {
        tabletRules.push(`row-gap: ${attributes.rowGap_tablet}${attributes.rowGapUnit || 'px'}`);
    }
    if (attributes.borderRadius_tablet) {
        tabletRules.push(`border-radius: ${attributes.borderRadius_tablet}${attributes.borderRadiusUnit || 'px'}`);
    }

    if (tabletRules.length > 0) {
        cssRules.push(`@media (max-width: 1024px) { ${selector} { ${tabletRules.join('; ')}; } }`);
    }

    // Mobile styles (max-width: 767px)
    if (attributes.containerWidth === 'custom' && attributes.customContainerWidth_mobile) {
        mobileRules.push(`width: ${attributes.customContainerWidth_mobile}${attributes.customContainerWidthUnit || 'px'}`);
    }
    if (attributes.contentWidth_mobile) {
        mobileRules.push(`max-width: ${attributes.contentWidth_mobile}${attributes.contentWidthUnit || 'px'}`);
    }
    if (attributes.minHeight_mobile) {
        mobileRules.push(`min-height: ${attributes.minHeight_mobile}${attributes.minHeightUnit || 'px'}`);
    }
    if (attributes.flexDirection_mobile) {
        mobileRules.push(`flex-direction: ${attributes.flexDirection_mobile}`);
    }
    if (attributes.justifyContent_mobile) {
        mobileRules.push(`justify-content: ${attributes.justifyContent_mobile}`);
    }
    if (attributes.alignItems_mobile) {
        mobileRules.push(`align-items: ${attributes.alignItems_mobile}`);
    }
    if (attributes.flexWrap_mobile) {
        mobileRules.push(`flex-wrap: ${attributes.flexWrap_mobile}`);
    }
    if (attributes.columnGap_mobile !== undefined) {
        mobileRules.push(`column-gap: ${attributes.columnGap_mobile}${attributes.columnGapUnit || 'px'}`);
    }
    if (attributes.rowGap_mobile !== undefined) {
        mobileRules.push(`row-gap: ${attributes.rowGap_mobile}${attributes.rowGapUnit || 'px'}`);
    }
    if (attributes.borderRadius_mobile) {
        mobileRules.push(`border-radius: ${attributes.borderRadius_mobile}${attributes.borderRadiusUnit || 'px'}`);
    }

    if (mobileRules.length > 0) {
        cssRules.push(`@media (max-width: 767px) { ${selector} { ${mobileRules.join('; ')}; } }`);
    }

    return cssRules.join('\n');
}
