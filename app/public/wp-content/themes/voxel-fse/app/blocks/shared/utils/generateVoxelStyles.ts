/**
 * Generate Voxel Styles Utility
 *
 * Shared utility to convert VoxelTab attribute values into
 * CSS styles that can be applied to block output.
 *
 * This handles:
 * - Sticky position (Widget options accordion)
 * - Visibility rules are handled server-side in PHP
 * - Loop element is handled server-side in PHP
 *
 * @package VoxelFSE
 */

import type { CSSProperties } from 'react';

/**
 * Interface for VoxelTab-related style attributes
 */
export interface VoxelStyleAttributes {
    // Sticky position
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

    // Container Options (flex-container specific)
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

    // Allow extension with block-specific attributes
    [key: string]: unknown;
}

/**
 * Generate inline styles from VoxelTab attributes (desktop only)
 *
 * @param attributes - Block attributes containing VoxelTab values
 * @returns CSSProperties object to apply to element's style prop
 */
export function generateVoxelStyles(attributes: VoxelStyleAttributes): CSSProperties {
    const styles: CSSProperties = {};

    // Sticky Position - Desktop
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

    // Container Options - Inline Flex (desktop)
    if (attributes.enableInlineFlex) {
        styles.display = 'inline-flex';
    }

    // Container Options - Calc Min Height (desktop)
    if (attributes.enableCalcMinHeight && attributes.calcMinHeight) {
        styles.minHeight = `calc(${attributes.calcMinHeight})`;
    }

    // Container Options - Calc Max Height (desktop)
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight) {
        styles.maxHeight = `calc(${attributes.calcMaxHeight})`;
    }

    // Container Options - Scrollbar Color
    if (attributes.scrollbarColor) {
        (styles as any).scrollbarColor = `${attributes.scrollbarColor} transparent`;
    }

    // Container Options - Backdrop Blur (desktop)
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength) {
        (styles as any).backdropFilter = `blur(${attributes.backdropBlurStrength}px)`;
        (styles as any).WebkitBackdropFilter = `blur(${attributes.backdropBlurStrength}px)`;
    }

    return styles;
}

/**
 * Generate responsive CSS for VoxelTab controls (tablet/mobile)
 *
 * @param attributes - Block attributes containing VoxelTab values
 * @param selector - CSS selector for the block (e.g., `.voxel-fse-map-abc123`)
 * @returns CSS string with @media queries
 */
export function generateVoxelResponsiveCSS(
    attributes: VoxelStyleAttributes,
    selector: string
): string {
    const cssRules: string[] = [];
    const tabletRules: string[] = [];
    const mobileRules: string[] = [];

    // Desktop sticky (already handled by inline styles, but include in CSS for consistency)
    if (attributes.stickyEnabled && (attributes.stickyDesktop ?? 'sticky') === 'sticky') {
        const desktopStyles: string[] = [
            'position: sticky',
            'align-self: flex-start', // Prevent stretching in flex layouts
        ];

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

        cssRules.push(`${selector} { ${desktopStyles.join('; ')}; }`);
    }

    // Tablet sticky (max-width: 1024px)
    if (attributes.stickyEnabled) {
        if (attributes.stickyTablet === 'sticky') {
            tabletRules.push('position: sticky');
            tabletRules.push('align-self: flex-start'); // Prevent stretching in flex layouts

            if (attributes.stickyTop_tablet !== undefined) {
                tabletRules.push(`top: ${attributes.stickyTop_tablet}${attributes.stickyTopUnit || 'px'}`);
            } else if (attributes.stickyTop !== undefined) {
                // Inherit from desktop if tablet not set
                tabletRules.push(`top: ${attributes.stickyTop}${attributes.stickyTopUnit || 'px'}`);
            }
            if (attributes.stickyLeft_tablet !== undefined) {
                tabletRules.push(`left: ${attributes.stickyLeft_tablet}${attributes.stickyLeftUnit || 'px'}`);
            }
            if (attributes.stickyRight_tablet !== undefined) {
                tabletRules.push(`right: ${attributes.stickyRight_tablet}${attributes.stickyRightUnit || 'px'}`);
            }
            if (attributes.stickyBottom_tablet !== undefined) {
                tabletRules.push(`bottom: ${attributes.stickyBottom_tablet}${attributes.stickyBottomUnit || 'px'}`);
            }
        } else if (attributes.stickyTablet === 'initial') {
            tabletRules.push('position: relative');
            tabletRules.push('align-self: stretch'); // Reset to default when not sticky
        }
    }

    // Container Options - Tablet
    if (attributes.enableInlineFlex_tablet !== undefined) {
        tabletRules.push(attributes.enableInlineFlex_tablet ? 'display: inline-flex' : 'display: flex');
    }
    if (attributes.enableCalcMinHeight && attributes.calcMinHeight_tablet) {
        tabletRules.push(`min-height: calc(${attributes.calcMinHeight_tablet})`);
    }
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight_tablet) {
        tabletRules.push(`max-height: calc(${attributes.calcMaxHeight_tablet})`);
    }
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength_tablet !== undefined) {
        tabletRules.push(`backdrop-filter: blur(${attributes.backdropBlurStrength_tablet}px)`);
        tabletRules.push(`-webkit-backdrop-filter: blur(${attributes.backdropBlurStrength_tablet}px)`);
    }

    if (tabletRules.length > 0) {
        cssRules.push(`@media (max-width: 1024px) { ${selector} { ${tabletRules.join('; ')}; } }`);
    }

    // Mobile sticky (max-width: 767px)
    if (attributes.stickyEnabled) {
        if (attributes.stickyMobile === 'sticky') {
            mobileRules.push('position: sticky');
            mobileRules.push('align-self: flex-start'); // Prevent stretching in flex layouts

            if (attributes.stickyTop_mobile !== undefined) {
                mobileRules.push(`top: ${attributes.stickyTop_mobile}${attributes.stickyTopUnit || 'px'}`);
            } else if (attributes.stickyTop_tablet !== undefined) {
                // Inherit from tablet if mobile not set
                mobileRules.push(`top: ${attributes.stickyTop_tablet}${attributes.stickyTopUnit || 'px'}`);
            } else if (attributes.stickyTop !== undefined) {
                // Fall back to desktop
                mobileRules.push(`top: ${attributes.stickyTop}${attributes.stickyTopUnit || 'px'}`);
            }
            if (attributes.stickyLeft_mobile !== undefined) {
                mobileRules.push(`left: ${attributes.stickyLeft_mobile}${attributes.stickyLeftUnit || 'px'}`);
            }
            if (attributes.stickyRight_mobile !== undefined) {
                mobileRules.push(`right: ${attributes.stickyRight_mobile}${attributes.stickyRightUnit || 'px'}`);
            }
            if (attributes.stickyBottom_mobile !== undefined) {
                mobileRules.push(`bottom: ${attributes.stickyBottom_mobile}${attributes.stickyBottomUnit || 'px'}`);
            }
        } else if (attributes.stickyMobile === 'initial') {
            mobileRules.push('position: relative');
            mobileRules.push('align-self: stretch'); // Reset to default when not sticky
        }
    }

    // Container Options - Mobile
    if (attributes.enableInlineFlex_mobile !== undefined) {
        mobileRules.push(attributes.enableInlineFlex_mobile ? 'display: inline-flex' : 'display: flex');
    }
    if (attributes.enableCalcMinHeight && attributes.calcMinHeight_mobile) {
        mobileRules.push(`min-height: calc(${attributes.calcMinHeight_mobile})`);
    }
    if (attributes.enableCalcMaxHeight && attributes.calcMaxHeight_mobile) {
        mobileRules.push(`max-height: calc(${attributes.calcMaxHeight_mobile})`);
    }
    if (attributes.enableBackdropBlur && attributes.backdropBlurStrength_mobile !== undefined) {
        mobileRules.push(`backdrop-filter: blur(${attributes.backdropBlurStrength_mobile}px)`);
        mobileRules.push(`-webkit-backdrop-filter: blur(${attributes.backdropBlurStrength_mobile}px)`);
    }

    if (mobileRules.length > 0) {
        cssRules.push(`@media (max-width: 767px) { ${selector} { ${mobileRules.join('; ')}; } }`);
    }

    return cssRules.join('\n');
}
