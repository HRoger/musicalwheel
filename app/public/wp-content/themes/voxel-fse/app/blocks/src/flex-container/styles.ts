/**
 * Style Generation Utilities for Flex Container Block
 *
 * Generates CSS styles from block attributes for both editor and frontend.
 */

import type { CSSProperties } from 'react';

export interface FlexContainerAttributes {
    containerLayout?: string;
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
    contentWidthCustom?: string;
    minHeight?: number;
    minHeight_tablet?: number;
    minHeight_mobile?: number;
    minHeightUnit?: string;
    minHeightCustom?: string;
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
    alignContent?: string;
    alignContent_tablet?: string;
    alignContent_mobile?: string;
    columnGap?: number;
    columnGap_tablet?: number;
    columnGap_mobile?: number;
    columnGapUnit?: string;
    rowGap?: number;
    rowGap_tablet?: number;
    rowGap_mobile?: number;
    rowGapUnit?: string;
    gapUnit?: string;
    gapsLinked?: boolean;
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
        horizontal?: number;
        vertical?: number;
        blur?: number;
        spread?: number;
        color?: string;
        position?: 'outline' | 'inset';
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
    // Grid attributes
    gridColumns?: number;
    gridColumns_tablet?: number;
    gridColumns_mobile?: number;
    gridColumnsUnit?: string;
    gridRows?: number;
    gridRows_tablet?: number;
    gridRows_mobile?: number;
    gridRowsUnit?: string;
    gridAutoFlow?: string;
    gridOutline?: boolean;
    // Grid alignment
    gridJustifyItems?: string;
    gridJustifyItems_tablet?: string;
    gridJustifyItems_mobile?: string;
    gridAlignItems?: string;
    gridAlignItems_tablet?: string;
    gridAlignItems_mobile?: string;
    gridJustifyContent?: string;
    gridJustifyContent_tablet?: string;
    gridJustifyContent_mobile?: string;
    gridAlignContent?: string;
    gridAlignContent_tablet?: string;
    gridAlignContent_mobile?: string;
    // Sticky position attributes (VoxelTab)
    stickyEnabled?: boolean;
    stickyDesktop?: 'sticky' | 'initial';
    stickyTablet?: 'sticky' | 'initial';
    stickyMobile?: 'sticky' | 'initial';
    stickyTop?: number;
    stickyTop_tablet?: number;
    stickyTop_mobile?: number;
    stickyTopUnit?: string;
    stickyLeft?: number;
    stickyLeft_tablet?: number;
    stickyLeft_mobile?: number;
    stickyLeftUnit?: string;
    stickyRight?: number;
    stickyRight_tablet?: number;
    stickyRight_mobile?: number;
    stickyRightUnit?: string;
    stickyBottom?: number;
    stickyBottom_tablet?: number;
    stickyBottom_mobile?: number;
    stickyBottomUnit?: string;
    // Container Options attributes (VoxelTab)
    enableInlineFlex?: boolean;
    enableInlineFlex_tablet?: boolean;
    enableInlineFlex_mobile?: boolean;
    enableCalcMinHeight?: boolean;
    calcMinHeight?: string;
    calcMinHeight_tablet?: string;
    calcMinHeight_mobile?: string;
    enableCalcMaxHeight?: boolean;
    calcMaxHeight?: string;
    calcMaxHeight_tablet?: string;
    calcMaxHeight_mobile?: string;
    scrollbarColor?: string;
    enableBackdropBlur?: boolean;
    backdropBlurStrength?: number;
    backdropBlurStrength_tablet?: number;
    backdropBlurStrength_mobile?: number;
    // Transform attributes
    transformRotate?: number;
    transformRotate_tablet?: number;
    transformRotate_mobile?: number;
    transformRotate3D?: boolean;
    transformRotateX?: number;
    transformRotateX_tablet?: number;
    transformRotateX_mobile?: number;
    transformRotateY?: number;
    transformRotateY_tablet?: number;
    transformRotateY_mobile?: number;
    transformPerspective?: number;
    transformPerspective_tablet?: number;
    transformPerspective_mobile?: number;
    transformTranslateX?: number;
    transformTranslateX_tablet?: number;
    transformTranslateX_mobile?: number;
    transformTranslateXUnit?: string;
    transformTranslateY?: number;
    transformTranslateY_tablet?: number;
    transformTranslateY_mobile?: number;
    transformTranslateYUnit?: string;
    transformScaleProportions?: boolean;
    transformScale?: number;
    transformScale_tablet?: number;
    transformScale_mobile?: number;
    transformScaleX?: number;
    transformScaleX_tablet?: number;
    transformScaleX_mobile?: number;
    transformScaleY?: number;
    transformScaleY_tablet?: number;
    transformScaleY_mobile?: number;
    transformSkewX?: number;
    transformSkewX_tablet?: number;
    transformSkewX_mobile?: number;
    transformSkewY?: number;
    transformSkewY_tablet?: number;
    transformSkewY_mobile?: number;
    transformFlipX?: boolean;
    transformFlipY?: boolean;
    transformOriginX?: string;
    transformOriginX_tablet?: string;
    transformOriginX_mobile?: string;
    transformOriginY?: string;
    transformOriginY_tablet?: string;
    transformOriginY_mobile?: string;
    // Transform Hover
    transformRotateHover?: number;
    transformRotate3DHover?: boolean;
    transformRotateXHover?: number;
    transformRotateYHover?: number;
    transformPerspectiveHover?: number;
    transformTranslateXHover?: number;
    transformTranslateXHoverUnit?: string;
    transformTranslateYHover?: number;
    transformTranslateYHoverUnit?: string;
    transformScaleProportionsHover?: boolean;
    transformScaleHover?: number;
    transformScaleXHover?: number;
    transformScaleYHover?: number;
    transformSkewXHover?: number;
    transformSkewYHover?: number;
    transformFlipXHover?: boolean;
    transformFlipYHover?: boolean;
    transformOriginXHover?: string;
    transformOriginYHover?: string;
    transformTransitionDuration?: number;
    [key: string]: any;
}

/**
 * Helper to generate box-shadow CSS from attributes
 * Default values match Elementor: 0 horizontal, 0 vertical, 10 blur, 0 spread
 */
export function generateBoxShadowCSS(shadow: FlexContainerAttributes['boxShadow']): string {
    if (!shadow || Object.keys(shadow).length === 0) {
        return '';
    }

    // Use defaults matching Elementor when values are not explicitly set
    const horizontal = shadow.horizontal ?? 0;
    const vertical = shadow.vertical ?? 0;
    const blur = shadow.blur ?? 10;
    const spread = shadow.spread ?? 0;
    const color = shadow.color || 'rgba(0, 0, 0, 0.5)';
    const isInset = shadow.position === 'inset';

    return `${isInset ? 'inset ' : ''}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
}

/**
 * Helper to convert anchor point value to CSS percentage
 */
function anchorToPercent(anchor: string | undefined): string {
    switch (anchor) {
        case 'left':
        case 'top':
            return '0%';
        case 'right':
        case 'bottom':
            return '100%';
        case 'center':
        default:
            return '50%';
    }
}

/**
 * Generate transform CSS string from attributes
 * @param attributes - Block attributes
 * @param suffix - Device suffix ('', '_tablet', '_mobile') or hover suffix ('Hover')
 * @param isHover - Whether this is for hover state
 */
export function generateTransformCSS(
    attributes: FlexContainerAttributes,
    suffix: string = '',
    isHover: boolean = false
): { transform: string; transformOrigin: string; perspective: string } {
    const transforms: string[] = [];
    const hoverSuffix = isHover ? 'Hover' : '';

    // Helper to get value with device suffix
    const getValue = (baseName: string): number | undefined => {
        const attrName = `${baseName}${hoverSuffix}${suffix}`;
        return attributes[attrName] as number | undefined;
    };

    const getStringValue = (baseName: string): string | undefined => {
        const attrName = `${baseName}${hoverSuffix}${suffix}`;
        return attributes[attrName] as string | undefined;
    };

    // Rotate
    const rotate = getValue('transformRotate');
    if (rotate !== undefined) {
        transforms.push(`rotate(${rotate}deg)`);
    }

    // 3D Rotate
    const is3D = isHover ? attributes.transformRotate3DHover : attributes.transformRotate3D;
    if (is3D) {
        const rotateX = getValue('transformRotateX');
        const rotateY = getValue('transformRotateY');
        if (rotateX !== undefined) {
            transforms.push(`rotateX(${rotateX}deg)`);
        }
        if (rotateY !== undefined) {
            transforms.push(`rotateY(${rotateY}deg)`);
        }
    }

    // Translate (Offset)
    const translateX = getValue('transformTranslateX');
    const translateXUnit = (isHover ? attributes.transformTranslateXHoverUnit : attributes.transformTranslateXUnit) || 'px';
    if (translateX !== undefined) {
        transforms.push(`translateX(${translateX}${translateXUnit})`);
    }

    const translateY = getValue('transformTranslateY');
    const translateYUnit = (isHover ? attributes.transformTranslateYHoverUnit : attributes.transformTranslateYUnit) || 'px';
    if (translateY !== undefined) {
        transforms.push(`translateY(${translateY}${translateYUnit})`);
    }

    // Scale
    const keepProportions = isHover
        ? (attributes.transformScaleProportionsHover ?? true)
        : (attributes.transformScaleProportions ?? true);

    if (keepProportions) {
        const scale = getValue('transformScale');
        if (scale !== undefined) {
            transforms.push(`scale(${scale})`);
        }
    } else {
        const scaleX = getValue('transformScaleX');
        const scaleY = getValue('transformScaleY');
        if (scaleX !== undefined) {
            transforms.push(`scaleX(${scaleX})`);
        }
        if (scaleY !== undefined) {
            transforms.push(`scaleY(${scaleY})`);
        }
    }

    // Skew
    const skewX = getValue('transformSkewX');
    if (skewX !== undefined) {
        transforms.push(`skewX(${skewX}deg)`);
    }
    const skewY = getValue('transformSkewY');
    if (skewY !== undefined) {
        transforms.push(`skewY(${skewY}deg)`);
    }

    // Flip (uses scaleX/Y with -1)
    const flipX = isHover ? attributes.transformFlipXHover : attributes.transformFlipX;
    const flipY = isHover ? attributes.transformFlipYHover : attributes.transformFlipY;
    if (flipX) {
        transforms.push('scaleX(-1)');
    }
    if (flipY) {
        transforms.push('scaleY(-1)');
    }

    // Transform Origin
    const originX = getStringValue('transformOriginX') || 'center';
    const originY = getStringValue('transformOriginY') || 'center';
    const transformOrigin = `${anchorToPercent(originX)} ${anchorToPercent(originY)}`;

    // Perspective (for 3D transforms)
    const perspective = getValue('transformPerspective');
    const perspectiveCSS = perspective !== undefined ? `${perspective}px` : '';

    return {
        transform: transforms.join(' '),
        transformOrigin,
        perspective: perspectiveCSS,
    };
}

/**
 * Generate inline styles for the OUTER flex container (desktop)
 * This is for the wrapper element that holds backgrounds, overlays, etc.
 * It should always fill its parent and NOT have max-width constraints.
 */
export function generateContainerStyles(attributes: FlexContainerAttributes): CSSProperties {
    const styles: CSSProperties = {
        // Outer container fills parent AND grows in flex contexts
        // width: 100% for block-level contexts, flex: 1 for flex child contexts
        width: '100%',
        flex: '1 1 0%', // flex-grow: 1, flex-shrink: 1, flex-basis: 0% - allows growing/shrinking in flex parent
        minWidth: 0, // Prevents flex items from overflowing (allows shrinking below content size)
        // NOTE: position is NOT set here by default to allow nested sticky to work in the editor.
        // The frontend CSS (generateResponsiveCSS) handles position: relative for non-sticky containers.
        // Setting position: relative here would create a containing block that breaks sticky children.
    };

    // Min Height - applies to outer container
    // When unit is 'custom', use the custom CSS value (e.g., calc(100vh - 80px))
    if (attributes.minHeightUnit === 'custom' && attributes.minHeightCustom) {
        styles.minHeight = attributes.minHeightCustom;
    } else if (attributes.minHeight) {
        styles.minHeight = `${attributes.minHeight}${attributes.minHeightUnit || 'px'}`;
    }

    // Overflow - applies to outer container
    if (attributes.overflow && attributes.overflow !== 'visible') {
        styles.overflow = attributes.overflow;
    }

    // Z-Index
    if (attributes.zIndex !== undefined) {
        styles.zIndex = attributes.zIndex;
    }

    // Sticky Position (VoxelTab) - applies to outer container
    // Note: stickyDesktop defaults to 'sticky' in block.json, but WordPress may not serialize default values
    if (attributes.stickyEnabled && (attributes.stickyDesktop ?? 'sticky') === 'sticky') {
        styles.position = 'sticky';
        // CRITICAL: align-self: flex-start prevents the sticky element from stretching
        // to fill its parent in a flex layout. Without this, the sticky element would be
        // the same height as its parent, leaving no room to "stick" during scrolling.
        styles.alignSelf = 'flex-start';
        if (attributes.stickyTop !== undefined) {
            styles.top = `${attributes.stickyTop}${attributes.stickyTopUnit || 'px'}`;
        }
        if (attributes.stickyLeft !== undefined) {
            styles.left = `${attributes.stickyLeft}${attributes.stickyLeftUnit || 'px'}`;
        }
        if (attributes.stickyRight !== undefined) {
            styles.right = `${attributes.stickyRight}${attributes.stickyRightUnit || 'px'}`;
        }
        if (attributes.stickyBottom !== undefined) {
            styles.bottom = `${attributes.stickyBottom}${attributes.stickyBottomUnit || 'px'}`;
        }
    }

    // Calculate min height - allows CSS calc() values
    if (attributes.enableCalcMinHeight && attributes.calcMinHeight) {
        styles.minHeight = attributes.calcMinHeight;
    }

    // Calculate max height - allows CSS calc() values with scrollbar
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight) {
        styles.maxHeight = attributes.calcMaxHeight;
        styles.overflowY = 'overlay' as any;
        styles.overflowX = 'hidden';
        // Scrollbar color via CSS variable
        if (attributes.scrollbarColor) {
            (styles as any)['--ts-scroll-color'] = attributes.scrollbarColor;
        }
    }

    // Backdrop blur - applies to outer container
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength !== undefined) {
        const blurValue = `blur(${attributes.backdropBlurStrength}px)`;
        styles.backdropFilter = blurValue;
        (styles as any)['-webkit-backdrop-filter'] = blurValue;
    }

    // Transform - applies to outer container
    const transformCSS = generateTransformCSS(attributes, '', false);
    if (transformCSS.transform) {
        styles.transform = transformCSS.transform;
    }
    if (transformCSS.transformOrigin && transformCSS.transformOrigin !== '50% 50%') {
        styles.transformOrigin = transformCSS.transformOrigin;
    }
    if (transformCSS.perspective) {
        (styles as any).perspective = transformCSS.perspective;
    }

    // Transform transition duration (for hover effects)
    if (attributes.transformTransitionDuration !== undefined) {
        styles.transition = `transform ${attributes.transformTransitionDuration}ms ease`;
    }

    // Box Shadow
    const boxShadowCSS = generateBoxShadowCSS(attributes.boxShadow);
    if (boxShadowCSS) {
        styles.boxShadow = boxShadowCSS;
    }

    return styles;
}

/**
 * Generate inline styles for the INNER content wrapper (desktop)
 * This is for the .e-con-inner element that contains flex/grid layout and content width constraints.
 * Matches Elementor's two-element container structure.
 */
export function generateInnerStyles(attributes: FlexContainerAttributes): CSSProperties {
    const isGrid = attributes.containerLayout === 'grid';

    const styles: CSSProperties = {
        display: isGrid ? 'grid' : 'flex',
        width: '100%', // Fill parent by default
    };

    // Content Width - the key boxed/full width logic
    // When unit is 'custom', use the custom CSS value (e.g., calc(100% - 40px))
    if (attributes.contentWidthUnit === 'custom' && attributes.contentWidthCustom) {
        styles.width = attributes.contentWidthCustom;
        styles.maxWidth = 'none';
        styles.marginLeft = 'auto';
        styles.marginRight = 'auto';
    } else if (attributes.contentWidthType === 'full') {
        // Full width mode - no max-width constraint
        if (attributes.contentWidth && attributes.contentWidth < 100) {
            // Custom width percentage (e.g., 55%)
            styles.width = `${attributes.contentWidth}${attributes.contentWidthUnit || '%'}`;
            styles.marginLeft = 'auto';
            styles.marginRight = 'auto';
        } else {
            styles.width = '100%';
        }
        styles.maxWidth = 'none';
    } else if (attributes.contentWidth) {
        // Boxed - constrain inner content with max-width, centered
        styles.width = '100%';
        styles.maxWidth = `${attributes.contentWidth}${attributes.contentWidthUnit || 'px'}`;
        styles.marginLeft = 'auto';
        styles.marginRight = 'auto';
    }

    // Grid-specific properties
    if (isGrid) {
        // Grid Template Columns
        if (attributes.gridColumns) {
            const unit = attributes.gridColumnsUnit || 'fr';
            // Handle different unit types:
            // - 'fr': repeat(N, 1fr) - equal flexible columns
            // - 'auto': repeat(N, auto) - auto-sized columns
            // - 'px', '%': repeat(N, Xunit) - fixed size columns
            const columnValue = unit === 'auto' ? 'auto' : `1${unit}`;
            styles.gridTemplateColumns = `repeat(${attributes.gridColumns}, ${columnValue})`;
        }

        // Grid Template Rows
        if (attributes.gridRows) {
            const unit = attributes.gridRowsUnit || 'fr';
            const rowValue = unit === 'auto' ? 'auto' : `1${unit}`;
            styles.gridTemplateRows = `repeat(${attributes.gridRows}, ${rowValue})`;
        }

        // Grid Auto Flow
        if (attributes.gridAutoFlow) {
            styles.gridAutoFlow = attributes.gridAutoFlow as CSSProperties['gridAutoFlow'];
        }

        // Grid Alignment
        if (attributes.gridJustifyItems) {
            styles.justifyItems = attributes.gridJustifyItems;
        }
        if (attributes.gridAlignItems) {
            styles.alignItems = attributes.gridAlignItems;
        }
        if (attributes.gridJustifyContent) {
            styles.justifyContent = attributes.gridJustifyContent;
        }
        if (attributes.gridAlignContent) {
            styles.alignContent = attributes.gridAlignContent;
        }
    } else {
        // Flex-specific properties
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

        // Align Content (only applies when wrap is enabled)
        if (attributes.alignContent) {
            styles.alignContent = attributes.alignContent;
        }
    }

    // Column Gap (use gapUnit as fallback for columnGapUnit) - applies to both flex and grid
    if (attributes.columnGap !== undefined) {
        const unit = attributes.columnGapUnit || attributes.gapUnit || 'px';
        styles.columnGap = `${attributes.columnGap}${unit}`;
    }

    // Row Gap (use gapUnit as fallback for rowGapUnit) - applies to both flex and grid
    if (attributes.rowGap !== undefined) {
        const unit = attributes.rowGapUnit || attributes.gapUnit || 'px';
        styles.rowGap = `${attributes.rowGap}${unit}`;
    }

    // Inline Flex - changes container to inline-flex with auto width
    if (attributes.enableInlineFlex) {
        styles.display = 'inline-flex';
        styles.width = 'auto';
    }

    return styles;
}

/**
 * Generate responsive CSS string for frontend - OUTER container
 * This generates CSS for the outer wrapper (position, min-height, backdrop, etc.)
 */
export function generateResponsiveCSS(attributes: FlexContainerAttributes, blockId: string): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    const selector = `.voxel-fse-flex-container-${blockId}`;

    // Check if sticky is enabled for desktop
    const isStickyDesktop = attributes.stickyEnabled && (attributes.stickyDesktop ?? 'sticky') === 'sticky';

    // Desktop styles - outer container fills parent AND grows in flex contexts
    const desktopStyles: string[] = [
        'width: 100%',
        'flex: 1 1 0%', // Allows growing/shrinking in flex parent
        'min-width: 0', // Prevents overflow in flex contexts
    ];

    // Position: sticky overrides relative, so only output one
    if (isStickyDesktop) {
        desktopStyles.push('position: sticky');
        // CRITICAL: Prevent sticky element from stretching to fill parent in flex layout
        desktopStyles.push('align-self: flex-start');
        if (attributes.stickyTop !== undefined) {
            desktopStyles.push(`top: ${attributes.stickyTop}${attributes.stickyTopUnit || 'px'}`);
        }
        if (attributes.stickyLeft !== undefined) {
            desktopStyles.push(`left: ${attributes.stickyLeft}${attributes.stickyLeftUnit || 'px'}`);
        }
        if (attributes.stickyRight !== undefined) {
            desktopStyles.push(`right: ${attributes.stickyRight}${attributes.stickyRightUnit || 'px'}`);
        }
        if (attributes.stickyBottom !== undefined) {
            desktopStyles.push(`bottom: ${attributes.stickyBottom}${attributes.stickyBottomUnit || 'px'}`);
        }
    } else {
        // Default position for background elements (overlay, video, shape dividers)
        desktopStyles.push('position: relative');
    }

    // Min Height
    // When unit is 'custom', use the custom CSS value (e.g., calc(100vh - 80px))
    if (attributes.minHeightUnit === 'custom' && attributes.minHeightCustom) {
        desktopStyles.push(`min-height: ${attributes.minHeightCustom}`);
    } else if (attributes.minHeight) {
        desktopStyles.push(`min-height: ${attributes.minHeight}${attributes.minHeightUnit || 'px'}`);
    }

    // Overflow
    if (attributes.overflow && attributes.overflow !== 'visible') {
        desktopStyles.push(`overflow: ${attributes.overflow}`);
    }

    // Z-Index
    if (attributes.zIndex !== undefined) {
        desktopStyles.push(`z-index: ${attributes.zIndex}`);
    }

    // Calculate min height
    if (attributes.enableCalcMinHeight && attributes.calcMinHeight) {
        desktopStyles.push(`min-height: ${attributes.calcMinHeight}`);
    }

    // Calculate max height with scrollbar
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight) {
        desktopStyles.push(`max-height: ${attributes.calcMaxHeight}`);
        desktopStyles.push('overflow-y: overlay');
        desktopStyles.push('overflow-x: hidden');
        if (attributes.scrollbarColor) {
            desktopStyles.push(`--ts-scroll-color: ${attributes.scrollbarColor}`);
        }
    }

    // Backdrop blur
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength !== undefined) {
        desktopStyles.push(`backdrop-filter: blur(${attributes.backdropBlurStrength}px)`);
        desktopStyles.push(`-webkit-backdrop-filter: blur(${attributes.backdropBlurStrength}px)`);
    }

    // Transform CSS - Desktop Normal
    const transformDesktop = generateTransformCSS(attributes, '', false);
    if (transformDesktop.transform) {
        desktopStyles.push(`transform: ${transformDesktop.transform}`);
    }
    if (transformDesktop.transformOrigin && transformDesktop.transformOrigin !== '50% 50%') {
        desktopStyles.push(`transform-origin: ${transformDesktop.transformOrigin}`);
    }
    if (transformDesktop.perspective) {
        desktopStyles.push(`perspective: ${transformDesktop.perspective}`);
    }

    // Transform transition duration
    if (attributes.transformTransitionDuration !== undefined) {
        desktopStyles.push(`transition: transform ${attributes.transformTransitionDuration}ms ease`);
    }

    // Box Shadow
    const boxShadowCSS = generateBoxShadowCSS(attributes.boxShadow);
    if (boxShadowCSS) {
        desktopStyles.push(`box-shadow: ${boxShadowCSS}`);
    }

    cssRules.push(`${selector} { ${desktopStyles.join('; ')}; }`);

    // Desktop Hover state
    const transformDesktopHover = generateTransformCSS(attributes, '', true);
    if (transformDesktopHover.transform) {
        const hoverStyles: string[] = [`transform: ${transformDesktopHover.transform}`];
        if (transformDesktopHover.transformOrigin && transformDesktopHover.transformOrigin !== '50% 50%') {
            hoverStyles.push(`transform-origin: ${transformDesktopHover.transformOrigin}`);
        }
        if (transformDesktopHover.perspective) {
            hoverStyles.push(`perspective: ${transformDesktopHover.perspective}`);
        }
        cssRules.push(`${selector}:hover { ${hoverStyles.join('; ')}; }`);
    }

    // Tablet styles (max-width: 1024px)
    if (attributes.minHeight_tablet) {
        tabletRules.push(`min-height: ${attributes.minHeight_tablet}${attributes.minHeightUnit || 'px'}`);
    }

    // Sticky Position - Tablet
    if (attributes.stickyEnabled) {
        if (attributes.stickyTablet === 'sticky') {
            tabletRules.push('position: sticky');
            tabletRules.push('align-self: flex-start');
            if (attributes.stickyTop_tablet !== undefined) {
                tabletRules.push(`top: ${attributes.stickyTop_tablet}${attributes.stickyTopUnit || 'px'}`);
            }
        } else if (attributes.stickyTablet === 'initial') {
            tabletRules.push('position: relative');
            tabletRules.push('align-self: stretch'); // Reset to default when not sticky
        }
    }

    if (attributes.enableCalcMinHeight && attributes.calcMinHeight_tablet) {
        tabletRules.push(`min-height: ${attributes.calcMinHeight_tablet}`);
    }
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight_tablet) {
        tabletRules.push(`max-height: ${attributes.calcMaxHeight_tablet}`);
    }
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength_tablet !== undefined) {
        tabletRules.push(`backdrop-filter: blur(${attributes.backdropBlurStrength_tablet}px)`);
    }

    // Transform CSS - Tablet Normal
    const transformTablet = generateTransformCSS(attributes, '_tablet', false);
    if (transformTablet.transform) {
        tabletRules.push(`transform: ${transformTablet.transform}`);
    }
    if (transformTablet.transformOrigin && transformTablet.transformOrigin !== '50% 50%') {
        tabletRules.push(`transform-origin: ${transformTablet.transformOrigin}`);
    }
    if (transformTablet.perspective) {
        tabletRules.push(`perspective: ${transformTablet.perspective}`);
    }

    if (tabletRules.length > 0) {
        cssRules.push(`@media (max-width: 1024px) { ${selector} { ${tabletRules.join('; ')}; } }`);
    }

    // Tablet Hover state
    const transformTabletHover = generateTransformCSS(attributes, '_tablet', true);
    if (transformTabletHover.transform) {
        const hoverStyles: string[] = [`transform: ${transformTabletHover.transform}`];
        if (transformTabletHover.transformOrigin && transformTabletHover.transformOrigin !== '50% 50%') {
            hoverStyles.push(`transform-origin: ${transformTabletHover.transformOrigin}`);
        }
        if (transformTabletHover.perspective) {
            hoverStyles.push(`perspective: ${transformTabletHover.perspective}`);
        }
        cssRules.push(`@media (max-width: 1024px) { ${selector}:hover { ${hoverStyles.join('; ')}; } }`);
    }

    // Mobile styles (max-width: 767px)
    if (attributes.minHeight_mobile) {
        mobileRules.push(`min-height: ${attributes.minHeight_mobile}${attributes.minHeightUnit || 'px'}`);
    }

    // Sticky Position - Mobile
    if (attributes.stickyEnabled) {
        if (attributes.stickyMobile === 'sticky') {
            mobileRules.push('position: sticky');
            mobileRules.push('align-self: flex-start');
            if (attributes.stickyTop_mobile !== undefined) {
                mobileRules.push(`top: ${attributes.stickyTop_mobile}${attributes.stickyTopUnit || 'px'}`);
            }
        } else if (attributes.stickyMobile === 'initial') {
            mobileRules.push('position: relative');
            mobileRules.push('align-self: stretch'); // Reset to default when not sticky
        }
    }

    if (attributes.enableCalcMinHeight && attributes.calcMinHeight_mobile) {
        mobileRules.push(`min-height: ${attributes.calcMinHeight_mobile}`);
    }
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight_mobile) {
        mobileRules.push(`max-height: ${attributes.calcMaxHeight_mobile}`);
    }
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength_mobile !== undefined) {
        mobileRules.push(`backdrop-filter: blur(${attributes.backdropBlurStrength_mobile}px)`);
    }

    // Transform CSS - Mobile Normal
    const transformMobile = generateTransformCSS(attributes, '_mobile', false);
    if (transformMobile.transform) {
        mobileRules.push(`transform: ${transformMobile.transform}`);
    }
    if (transformMobile.transformOrigin && transformMobile.transformOrigin !== '50% 50%') {
        mobileRules.push(`transform-origin: ${transformMobile.transformOrigin}`);
    }
    if (transformMobile.perspective) {
        mobileRules.push(`perspective: ${transformMobile.perspective}`);
    }

    if (mobileRules.length > 0) {
        cssRules.push(`@media (max-width: 767px) { ${selector} { ${mobileRules.join('; ')}; } }`);
    }

    // Mobile Hover state
    const transformMobileHover = generateTransformCSS(attributes, '_mobile', true);
    if (transformMobileHover.transform) {
        const hoverStyles: string[] = [`transform: ${transformMobileHover.transform}`];
        if (transformMobileHover.transformOrigin && transformMobileHover.transformOrigin !== '50% 50%') {
            hoverStyles.push(`transform-origin: ${transformMobileHover.transformOrigin}`);
        }
        if (transformMobileHover.perspective) {
            hoverStyles.push(`perspective: ${transformMobileHover.perspective}`);
        }
        cssRules.push(`@media (max-width: 767px) { ${selector}:hover { ${hoverStyles.join('; ')}; } }`);
    }

    return cssRules.join('\n');
}

/**
 * Generate responsive CSS string for frontend - INNER content wrapper
 * This generates CSS for the .e-con-inner element (flex/grid, max-width, gaps)
 */
export function generateInnerResponsiveCSS(attributes: FlexContainerAttributes, blockId: string): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    const selector = `.voxel-fse-flex-container-${blockId} > .e-con-inner`;
    const isGrid = attributes.containerLayout === 'grid';

    // Desktop styles
    const desktopStyles: string[] = [
        isGrid ? 'display: grid' : 'display: flex',
        'width: 100%',
    ];

    // Content Width - boxed vs full
    // When unit is 'custom', use the custom CSS value (e.g., calc(100% - 40px))
    if (attributes.contentWidthUnit === 'custom' && attributes.contentWidthCustom) {
        desktopStyles.push(`width: ${attributes.contentWidthCustom}`);
        desktopStyles.push('max-width: none');
        desktopStyles.push('margin-left: auto');
        desktopStyles.push('margin-right: auto');
    } else if (attributes.contentWidthType === 'full') {
        if (attributes.contentWidth && attributes.contentWidth < 100) {
            desktopStyles.push(`width: ${attributes.contentWidth}${attributes.contentWidthUnit || '%'}`);
            desktopStyles.push('margin-left: auto');
            desktopStyles.push('margin-right: auto');
        }
        desktopStyles.push('max-width: none');
    } else if (attributes.contentWidth) {
        desktopStyles.push(`max-width: ${attributes.contentWidth}${attributes.contentWidthUnit || 'px'}`);
        desktopStyles.push('margin-left: auto');
        desktopStyles.push('margin-right: auto');
    }

    // Grid-specific properties
    if (isGrid) {
        if (attributes.gridColumns) {
            const unit = attributes.gridColumnsUnit || 'fr';
            const columnValue = unit === 'auto' ? 'auto' : `1${unit}`;
            desktopStyles.push(`grid-template-columns: repeat(${attributes.gridColumns}, ${columnValue})`);
        }
        if (attributes.gridRows) {
            const unit = attributes.gridRowsUnit || 'fr';
            const rowValue = unit === 'auto' ? 'auto' : `1${unit}`;
            desktopStyles.push(`grid-template-rows: repeat(${attributes.gridRows}, ${rowValue})`);
        }
        if (attributes.gridAutoFlow) {
            desktopStyles.push(`grid-auto-flow: ${attributes.gridAutoFlow}`);
        }
        // Grid alignment
        if (attributes.gridJustifyItems) {
            desktopStyles.push(`justify-items: ${attributes.gridJustifyItems}`);
        }
        if (attributes.gridAlignItems) {
            desktopStyles.push(`align-items: ${attributes.gridAlignItems}`);
        }
        if (attributes.gridJustifyContent) {
            desktopStyles.push(`justify-content: ${attributes.gridJustifyContent}`);
        }
        if (attributes.gridAlignContent) {
            desktopStyles.push(`align-content: ${attributes.gridAlignContent}`);
        }
    } else {
        // Flex-specific properties
        if (attributes.flexDirection) {
            desktopStyles.push(`flex-direction: ${attributes.flexDirection}`);
        }
        if (attributes.justifyContent) {
            desktopStyles.push(`justify-content: ${attributes.justifyContent}`);
        }
        if (attributes.alignItems) {
            desktopStyles.push(`align-items: ${attributes.alignItems}`);
        }
        if (attributes.flexWrap) {
            desktopStyles.push(`flex-wrap: ${attributes.flexWrap}`);
        }
        if (attributes.alignContent) {
            desktopStyles.push(`align-content: ${attributes.alignContent}`);
        }
    }

    // Gaps
    if (attributes.columnGap !== undefined) {
        const unit = attributes.columnGapUnit || attributes.gapUnit || 'px';
        desktopStyles.push(`column-gap: ${attributes.columnGap}${unit}`);
    }
    if (attributes.rowGap !== undefined) {
        const unit = attributes.rowGapUnit || attributes.gapUnit || 'px';
        desktopStyles.push(`row-gap: ${attributes.rowGap}${unit}`);
    }

    // Inline Flex
    if (attributes.enableInlineFlex) {
        desktopStyles.push('display: inline-flex');
        desktopStyles.push('width: auto');
    }

    cssRules.push(`${selector} { ${desktopStyles.join('; ')}; }`);

    // Tablet styles
    if (attributes.contentWidth_tablet) {
        tabletRules.push(`max-width: ${attributes.contentWidth_tablet}${attributes.contentWidthUnit || 'px'}`);
    }

    if (isGrid) {
        if (attributes.gridColumns_tablet) {
            const unit = attributes.gridColumnsUnit || 'fr';
            const columnValue = unit === 'auto' ? 'auto' : `1${unit}`;
            tabletRules.push(`grid-template-columns: repeat(${attributes.gridColumns_tablet}, ${columnValue})`);
        }
        if (attributes.gridRows_tablet) {
            const unit = attributes.gridRowsUnit || 'fr';
            const rowValue = unit === 'auto' ? 'auto' : `1${unit}`;
            tabletRules.push(`grid-template-rows: repeat(${attributes.gridRows_tablet}, ${rowValue})`);
        }
        // Grid alignment - tablet
        if (attributes.gridJustifyItems_tablet) {
            tabletRules.push(`justify-items: ${attributes.gridJustifyItems_tablet}`);
        }
        if (attributes.gridAlignItems_tablet) {
            tabletRules.push(`align-items: ${attributes.gridAlignItems_tablet}`);
        }
        if (attributes.gridJustifyContent_tablet) {
            tabletRules.push(`justify-content: ${attributes.gridJustifyContent_tablet}`);
        }
        if (attributes.gridAlignContent_tablet) {
            tabletRules.push(`align-content: ${attributes.gridAlignContent_tablet}`);
        }
    } else {
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
        if (attributes.alignContent_tablet) {
            tabletRules.push(`align-content: ${attributes.alignContent_tablet}`);
        }
    }

    if (attributes.columnGap_tablet !== undefined) {
        const unit = attributes.columnGapUnit || attributes.gapUnit || 'px';
        tabletRules.push(`column-gap: ${attributes.columnGap_tablet}${unit}`);
    }
    if (attributes.rowGap_tablet !== undefined) {
        const unit = attributes.rowGapUnit || attributes.gapUnit || 'px';
        tabletRules.push(`row-gap: ${attributes.rowGap_tablet}${unit}`);
    }

    if (attributes.enableInlineFlex_tablet !== undefined) {
        if (attributes.enableInlineFlex_tablet) {
            tabletRules.push('display: inline-flex');
            tabletRules.push('width: auto');
        } else {
            tabletRules.push(isGrid ? 'display: grid' : 'display: flex');
            tabletRules.push('width: 100%');
        }
    }

    if (tabletRules.length > 0) {
        cssRules.push(`@media (max-width: 1024px) { ${selector} { ${tabletRules.join('; ')}; } }`);
    }

    // Mobile styles
    if (attributes.contentWidth_mobile) {
        mobileRules.push(`max-width: ${attributes.contentWidth_mobile}${attributes.contentWidthUnit || 'px'}`);
    }

    if (isGrid) {
        if (attributes.gridColumns_mobile) {
            const unit = attributes.gridColumnsUnit || 'fr';
            const columnValue = unit === 'auto' ? 'auto' : `1${unit}`;
            mobileRules.push(`grid-template-columns: repeat(${attributes.gridColumns_mobile}, ${columnValue})`);
        }
        if (attributes.gridRows_mobile) {
            const unit = attributes.gridRowsUnit || 'fr';
            const rowValue = unit === 'auto' ? 'auto' : `1${unit}`;
            mobileRules.push(`grid-template-rows: repeat(${attributes.gridRows_mobile}, ${rowValue})`);
        }
        // Grid alignment - mobile
        if (attributes.gridJustifyItems_mobile) {
            mobileRules.push(`justify-items: ${attributes.gridJustifyItems_mobile}`);
        }
        if (attributes.gridAlignItems_mobile) {
            mobileRules.push(`align-items: ${attributes.gridAlignItems_mobile}`);
        }
        if (attributes.gridJustifyContent_mobile) {
            mobileRules.push(`justify-content: ${attributes.gridJustifyContent_mobile}`);
        }
        if (attributes.gridAlignContent_mobile) {
            mobileRules.push(`align-content: ${attributes.gridAlignContent_mobile}`);
        }
    } else {
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
        if (attributes.alignContent_mobile) {
            mobileRules.push(`align-content: ${attributes.alignContent_mobile}`);
        }
    }

    if (attributes.columnGap_mobile !== undefined) {
        const unit = attributes.columnGapUnit || attributes.gapUnit || 'px';
        mobileRules.push(`column-gap: ${attributes.columnGap_mobile}${unit}`);
    }
    if (attributes.rowGap_mobile !== undefined) {
        const unit = attributes.rowGapUnit || attributes.gapUnit || 'px';
        mobileRules.push(`row-gap: ${attributes.rowGap_mobile}${unit}`);
    }

    if (attributes.enableInlineFlex_mobile !== undefined) {
        if (attributes.enableInlineFlex_mobile) {
            mobileRules.push('display: inline-flex');
            mobileRules.push('width: auto');
        } else {
            mobileRules.push(isGrid ? 'display: grid' : 'display: flex');
            mobileRules.push('width: 100%');
        }
    }

    if (mobileRules.length > 0) {
        cssRules.push(`@media (max-width: 767px) { ${selector} { ${mobileRules.join('; ')}; } }`);
    }

    return cssRules.join('\n');
}
