<?php
/**
 * Style Generator - Server-Side CSS Generation
 *
 * PHP equivalent of generateVoxelStyles.ts and generateAdvancedStyles.ts
 * Centralizes CSS generation for Voxel Tab and Advanced Tab attributes.
 *
 * This enables automatic style injection for all voxel-fse blocks via
 * the global render_block filter in Block_Loader.php.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Blocks;

/**
 * Style Generator Class
 *
 * Generates CSS from block attributes for:
 * - Sticky position (VoxelTab)
 * - Layout, spacing, border, background, transform (AdvancedTab)
 * - Responsive breakpoints (tablet/mobile)
 * - Hover states
 */
class Style_Generator {

    /**
     * Tablet breakpoint (max-width)
     */
    const TABLET_BREAKPOINT = 1024;

    /**
     * Mobile breakpoint (max-width)
     */
    const MOBILE_BREAKPOINT = 767;

    /**
     * Generate all styles for a block
     *
     * ARCHITECTURE: Desktop styles are now generated as CSS (not inline attributes)
     * to prevent specificity conflicts with block-specific styles.
     *
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return array {
     *     @type string $desktop_css    Desktop CSS rules for the block wrapper.
     *     @type string $responsive_css CSS with media queries (tablet/mobile).
     *     @type array  $classes        Additional CSS classes.
     *     @type array  $custom_attrs   Custom HTML attributes.
     *     @type string $element_id     Element ID (HTML id attribute).
     * }
     */
    public static function generate_all( $attributes, $block_id ) {
        $selector = '.voxel-fse-block-' . $block_id;

        // Generate desktop styles as CSS (no longer inline)
        $desktop_styles = array_merge(
            self::generate_voxel_inline_styles( $attributes ),
            self::generate_advanced_inline_styles( $attributes )
        );

        // Convert desktop styles array to CSS rules
        $desktop_css = '';
        if ( ! empty( $desktop_styles ) ) {
            $css_props = [];
            foreach ( $desktop_styles as $prop => $value ) {
                $css_props[] = "{$prop}: {$value}";
            }
            if ( ! empty( $css_props ) ) {
                $desktop_css = "{$selector} { " . implode( '; ', $css_props ) . "; }";
            }
        }

        // Generate responsive CSS (tablet/mobile)
        $responsive_css = self::generate_voxel_responsive_css( $attributes, $selector );
        $responsive_css .= self::generate_advanced_responsive_css( $attributes, $selector );

        // Get visibility classes
        $classes = self::get_visibility_classes( $attributes );

        // Get custom classes
        if ( ! empty( $attributes['customClasses'] ) ) {
            $classes[] = trim( $attributes['customClasses'] );
        }

        // Parse custom attributes
        $custom_attrs = self::parse_custom_attributes( $attributes['customAttributes'] ?? '' );

        // Get element ID
        $element_id = ! empty( $attributes['elementId'] ) ? $attributes['elementId'] : null;

        return [
            'desktop_css'    => $desktop_css,
            'responsive_css' => $responsive_css,
            'classes'        => $classes,
            'custom_attrs'   => $custom_attrs,
            'element_id'     => $element_id,
        ];
    }

    /**
     * Generate Voxel Tab inline styles (Sticky - Desktop only)
     *
     * @param array $attributes Block attributes.
     * @return array CSS properties as key => value.
     */
    public static function generate_voxel_inline_styles( $attributes ) {
        $styles = [];

        // Sticky Position - Desktop
        // Note: stickyDesktop defaults to 'sticky' in block.json, but WordPress may not serialize default values
        if ( ! empty( $attributes['stickyEnabled'] ) && ( $attributes['stickyDesktop'] ?? 'sticky' ) === 'sticky' ) {
            $styles['position'] = 'sticky';

            if ( isset( $attributes['stickyTop'] ) ) {
                $unit = $attributes['stickyTopUnit'] ?? 'px';
                $styles['top'] = $attributes['stickyTop'] . $unit;
            }
            if ( isset( $attributes['stickyLeft'] ) ) {
                $unit = $attributes['stickyLeftUnit'] ?? 'px';
                $styles['left'] = $attributes['stickyLeft'] . $unit;
            }
            if ( isset( $attributes['stickyRight'] ) ) {
                $unit = $attributes['stickyRightUnit'] ?? 'px';
                $styles['right'] = $attributes['stickyRight'] . $unit;
            }
            if ( isset( $attributes['stickyBottom'] ) ) {
                $unit = $attributes['stickyBottomUnit'] ?? 'px';
                $styles['bottom'] = $attributes['stickyBottom'] . $unit;
            }
        }

        // Container Options - Inline Flex (desktop)
        if ( ! empty( $attributes['enableInlineFlex'] ) ) {
            $styles['display'] = 'inline-flex';
        }

        // Container Options - Calc Min Height (desktop)
        if ( ! empty( $attributes['enableCalcMinHeight'] ) && ! empty( $attributes['calcMinHeight'] ) ) {
            $styles['min-height'] = 'calc(' . $attributes['calcMinHeight'] . ')';
        }

        // Container Options - Calc Max Height (desktop)
        if ( ! empty( $attributes['enableCalcMaxHeight'] ) && ! empty( $attributes['calcMaxHeight'] ) ) {
            $styles['max-height'] = 'calc(' . $attributes['calcMaxHeight'] . ')';
        }

        // Container Options - Scrollbar Color
        if ( ! empty( $attributes['scrollbarColor'] ) ) {
            $styles['scrollbar-color'] = $attributes['scrollbarColor'] . ' transparent';
        }

        // Container Options - Backdrop Blur (desktop)
        if ( ! empty( $attributes['enableBackdropBlur'] ) && ! empty( $attributes['backdropBlurStrength'] ) ) {
            $styles['backdrop-filter']         = 'blur(' . $attributes['backdropBlurStrength'] . 'px)';
            $styles['-webkit-backdrop-filter'] = 'blur(' . $attributes['backdropBlurStrength'] . 'px)';
        }

        return $styles;
    }

    /**
     * Generate Advanced Tab inline styles (Desktop only)
     *
     * @param array $attributes Block attributes.
     * @return array CSS properties as key => value.
     */
    public static function generate_advanced_inline_styles( $attributes ) {
        $styles = [];

        // Margin
        if ( ! empty( $attributes['blockMargin'] ) ) {
            $m    = $attributes['blockMargin'];
            $unit = $m['unit'] ?? 'px';
            if ( isset( $m['top'] ) && $m['top'] !== '' )    $styles['margin-top']    = $m['top'] . $unit;
            if ( isset( $m['right'] ) && $m['right'] !== '' )  $styles['margin-right']  = $m['right'] . $unit;
            if ( isset( $m['bottom'] ) && $m['bottom'] !== '' ) $styles['margin-bottom'] = $m['bottom'] . $unit;
            if ( isset( $m['left'] ) && $m['left'] !== '' )   $styles['margin-left']   = $m['left'] . $unit;
        }

        // Padding
        if ( ! empty( $attributes['blockPadding'] ) ) {
            $p    = $attributes['blockPadding'];
            $unit = $p['unit'] ?? 'px';
            if ( isset( $p['top'] ) && $p['top'] !== '' )    $styles['padding-top']    = $p['top'] . $unit;
            if ( isset( $p['right'] ) && $p['right'] !== '' )  $styles['padding-right']  = $p['right'] . $unit;
            if ( isset( $p['bottom'] ) && $p['bottom'] !== '' ) $styles['padding-bottom'] = $p['bottom'] . $unit;
            if ( isset( $p['left'] ) && $p['left'] !== '' )   $styles['padding-left']   = $p['left'] . $unit;
        }

        // Position
        if ( ! empty( $attributes['position'] ) && $attributes['position'] !== 'default' ) {
            $styles['position'] = $attributes['position'];

            // Horizontal offset
            $h_orient = $attributes['offsetOrientationH'] ?? 'start';
            if ( $h_orient === 'end' || $h_orient === 'right' ) {
                if ( isset( $attributes['offsetXEnd'] ) ) {
                    $unit = $attributes['offsetXEndUnit'] ?? 'px';
                    $styles['right'] = $attributes['offsetXEnd'] . $unit;
                }
            } else {
                if ( isset( $attributes['offsetX'] ) ) {
                    $unit = $attributes['offsetXUnit'] ?? 'px';
                    $styles['left'] = $attributes['offsetX'] . $unit;
                }
            }

            // Vertical offset
            $v_orient = $attributes['offsetOrientationV'] ?? 'start';
            if ( $v_orient === 'end' || $v_orient === 'bottom' ) {
                if ( isset( $attributes['offsetYEnd'] ) ) {
                    $unit = $attributes['offsetYEndUnit'] ?? 'px';
                    $styles['bottom'] = $attributes['offsetYEnd'] . $unit;
                }
            } else {
                if ( isset( $attributes['offsetY'] ) ) {
                    $unit = $attributes['offsetYUnit'] ?? 'px';
                    $styles['top'] = $attributes['offsetY'] . $unit;
                }
            }
        }

        // Z-Index
        if ( isset( $attributes['zIndex'] ) && $attributes['zIndex'] !== '' ) {
            $styles['z-index'] = $attributes['zIndex'];
        }

        // Layout Width
        $width = $attributes['elementWidth'] ?? '';
        if ( $width === 'custom' && isset( $attributes['elementCustomWidth'] ) ) {
            $unit = $attributes['elementCustomWidthUnit'] ?? 'px';
            $styles['width'] = $attributes['elementCustomWidth'] . $unit;
        } elseif ( $width === 'full' ) {
            $styles['width'] = '100%';
        } elseif ( $width === 'inline' ) {
            $styles['display'] = 'inline-block';
            $styles['width']   = 'auto';
        }

        // Flexbox Item - Align Self
        if ( ! empty( $attributes['flexAlignSelf'] ) ) {
            $styles['align-self'] = $attributes['flexAlignSelf'];
        }

        // Flexbox Item - Order
        $flex_order = $attributes['flexOrder'] ?? '';
        if ( $flex_order === 'custom' && isset( $attributes['flexOrderCustom'] ) ) {
            $styles['order'] = $attributes['flexOrderCustom'];
        } elseif ( $flex_order === 'start' ) {
            $styles['order'] = -9999;
        } elseif ( $flex_order === 'end' ) {
            $styles['order'] = 9999;
        }

        // Flexbox Item - Flex Grow/Shrink
        $flex_size = $attributes['flexSize'] ?? '';
        if ( $flex_size === 'none' ) {
            $styles['flex-grow']   = 0;
            $styles['flex-shrink'] = 0;
        } elseif ( $flex_size === 'grow' ) {
            $styles['flex-grow']   = 1;
            $styles['flex-shrink'] = 0;
        } elseif ( $flex_size === 'shrink' ) {
            $styles['flex-grow']   = 0;
            $styles['flex-shrink'] = 1;
        } elseif ( $flex_size === 'custom' ) {
            if ( isset( $attributes['flexGrow'] ) )   $styles['flex-grow']   = $attributes['flexGrow'];
            if ( isset( $attributes['flexShrink'] ) ) $styles['flex-shrink'] = $attributes['flexShrink'];
        }

        // Overflow
        if ( ! empty( $attributes['overflow'] ) ) {
            $styles['overflow'] = $attributes['overflow'];
        }

        // Opacity
        if ( isset( $attributes['opacity'] ) && $attributes['opacity'] !== '' ) {
            $styles['opacity'] = $attributes['opacity'];
        }

        // Border
        if ( ! empty( $attributes['borderType'] ) && $attributes['borderType'] !== 'none' ) {
            $styles['border-style'] = $attributes['borderType'];
        }
        if ( ! empty( $attributes['borderColor'] ) ) {
            $styles['border-color'] = $attributes['borderColor'];
        }
        if ( ! empty( $attributes['borderWidth'] ) ) {
            $bw   = $attributes['borderWidth'];
            $unit = $bw['unit'] ?? 'px';
            if ( isset( $bw['top'] ) && $bw['top'] !== '' )    $styles['border-top-width']    = $bw['top'] . $unit;
            if ( isset( $bw['right'] ) && $bw['right'] !== '' )  $styles['border-right-width']  = $bw['right'] . $unit;
            if ( isset( $bw['bottom'] ) && $bw['bottom'] !== '' ) $styles['border-bottom-width'] = $bw['bottom'] . $unit;
            if ( isset( $bw['left'] ) && $bw['left'] !== '' )   $styles['border-left-width']   = $bw['left'] . $unit;
        }

        // Border Radius
        $border_radius = $attributes['borderRadius'] ?? $attributes['borderRadiusDimensions'] ?? null;
        if ( ! empty( $border_radius ) ) {
            $br   = $border_radius;
            $unit = $br['unit'] ?? 'px';
            // Helper to add unit only if not already present
            $format_radius = function($val, $u) {
                if (preg_match('/^[\d.]+(?:px|%|em|rem)$/', $val)) return $val;
                return is_numeric($val) ? $val . $u : $val;
            };
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $styles['border-top-left-radius']     = $format_radius($br['top'], $unit);
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $styles['border-top-right-radius']    = $format_radius($br['right'], $unit);
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $styles['border-bottom-right-radius'] = $format_radius($br['bottom'], $unit);
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $styles['border-bottom-left-radius']  = $format_radius($br['left'], $unit);
        }

        // Box Shadow
        if ( ! empty( $attributes['boxShadow'] ) && is_array( $attributes['boxShadow'] ) ) {
            $bs     = $attributes['boxShadow'];
            $h      = $bs['horizontal'] ?? 0;
            $v      = $bs['vertical'] ?? 0;
            $blur   = $bs['blur'] ?? 10;
            $spread = $bs['spread'] ?? 0;
            $color  = $bs['color'] ?? 'rgba(0,0,0,0.5)';
            $inset  = ( $bs['position'] ?? '' ) === 'inset' ? 'inset ' : '';
            $styles['box-shadow'] = "{$inset}{$h}px {$v}px {$blur}px {$spread}px {$color}";
        }

        // Background
        $bg_type = $attributes['backgroundType'] ?? 'classic';
        if ( $bg_type === 'classic' ) {
            if ( ! empty( $attributes['backgroundColor'] ) ) {
                $styles['background-color'] = $attributes['backgroundColor'];
            }
            if ( ! empty( $attributes['backgroundImage']['url'] ) ) {
                $styles['background-image'] = 'url(' . esc_url( $attributes['backgroundImage']['url'] ) . ')';
                if ( ! empty( $attributes['bgImagePosition'] ) )   $styles['background-position']   = $attributes['bgImagePosition'];
                if ( ! empty( $attributes['bgImageAttachment'] ) ) $styles['background-attachment'] = $attributes['bgImageAttachment'];
                if ( ! empty( $attributes['bgImageRepeat'] ) )     $styles['background-repeat']     = $attributes['bgImageRepeat'];

                $size = $attributes['bgImageSize'] ?? '';
                if ( $size === 'custom' && isset( $attributes['bgImageCustomWidth'] ) ) {
                    $unit = $attributes['bgImageCustomWidthUnit'] ?? 'px';
                    $styles['background-size'] = $attributes['bgImageCustomWidth'] . $unit;
                } elseif ( $size ) {
                    $styles['background-size'] = $size;
                }
            }
        } elseif ( $bg_type === 'gradient' ) {
            $color1 = $attributes['gradientColor'] ?? '#000000';
            $loc1   = $attributes['gradientLocation'] ?? 0;
            $color2 = $attributes['gradientSecondColor'] ?? '#ffffff';
            $loc2   = $attributes['gradientSecondLocation'] ?? 100;

            if ( ( $attributes['gradientType'] ?? 'linear' ) === 'radial' ) {
                $position = $attributes['gradientPosition'] ?? 'center center';
                $styles['background-image'] = "radial-gradient(at {$position}, {$color1} {$loc1}%, {$color2} {$loc2}%)";
            } else {
                $angle = $attributes['gradientAngle'] ?? 180;
                $styles['background-image'] = "linear-gradient({$angle}deg, {$color1} {$loc1}%, {$color2} {$loc2}%)";
            }
        }

        // Transform
        $transforms = self::build_transform_array( $attributes, '' );
        if ( ! empty( $transforms ) ) {
            $styles['transform'] = implode( ' ', $transforms );
        }

        // Mask
        if ( ! empty( $attributes['maskSwitch'] ) ) {
            $has_mask_image = ! empty( $attributes['maskImage']['url'] );
            $has_mask_shape = ! empty( $attributes['maskShape'] );

            if ( $has_mask_image || $has_mask_shape ) {
                $mask_url = '';
                if ( $has_mask_image ) {
                    $mask_url = 'url(' . esc_url( $attributes['maskImage']['url'] ) . ')';
                } elseif ( $has_mask_shape ) {
                    $mask_url = 'url(' . self::get_mask_shape_url( $attributes['maskShape'] ) . ')';
                }

                if ( $mask_url ) {
                    $styles['-webkit-mask-image'] = $mask_url;
                    $styles['mask-image']         = $mask_url;

                    // Mask size
                    $mask_size = $attributes['maskSize'] ?? '';
                    if ( $mask_size === 'custom' ) {
                        $scale = $attributes['maskSizeScale'] ?? 100;
                        $unit  = $attributes['maskSizeScaleUnit'] ?? '%';
                        $styles['-webkit-mask-size'] = $scale . $unit;
                        $styles['mask-size']         = $scale . $unit;
                    } elseif ( $mask_size ) {
                        $styles['-webkit-mask-size'] = $mask_size;
                        $styles['mask-size']         = $mask_size;
                    }

                    // Mask position
                    $mask_pos = $attributes['maskPosition'] ?? '';
                    if ( $mask_pos === 'custom' ) {
                        $x     = $attributes['maskPositionX'] ?? 0;
                        $x_u   = $attributes['maskPositionXUnit'] ?? '%';
                        $y     = $attributes['maskPositionY'] ?? 0;
                        $y_u   = $attributes['maskPositionYUnit'] ?? '%';
                        $pos   = "{$x}{$x_u} {$y}{$y_u}";
                        $styles['-webkit-mask-position'] = $pos;
                        $styles['mask-position']         = $pos;
                    } elseif ( $mask_pos ) {
                        $styles['-webkit-mask-position'] = $mask_pos;
                        $styles['mask-position']         = $mask_pos;
                    }

                    // Mask repeat
                    if ( ! empty( $attributes['maskRepeat'] ) ) {
                        $styles['-webkit-mask-repeat'] = $attributes['maskRepeat'];
                        $styles['mask-repeat']         = $attributes['maskRepeat'];
                    }
                }
            }
        }

        // Transition
        $transition_parts = [];
        $transition_dur   = $attributes['transitionDuration'] ?? 0;
        $bg_transition    = $attributes['bgTransitionDuration'] ?? 0;
        if ( $transition_dur > 0 ) {
            $transition_parts[] = "all {$transition_dur}s ease";
        }
        if ( $bg_transition > 0 && $bg_transition !== $transition_dur ) {
            $transition_parts[] = "background {$bg_transition}s ease";
        }
        if ( ! empty( $transition_parts ) ) {
            $styles['transition'] = implode( ', ', $transition_parts );
        }

        return $styles;
    }

    /**
     * Generate Voxel Tab responsive CSS (Sticky - Tablet/Mobile)
     *
     * @param array  $attributes Block attributes.
     * @param string $selector   CSS selector.
     * @return string CSS with media queries.
     */
    public static function generate_voxel_responsive_css( $attributes, $selector ) {
        if ( empty( $attributes['stickyEnabled'] ) ) {
            return '';
        }

        $css_rules = [];

        // Tablet (max-width: 1024px)
        $tablet_rules = [];
        $sticky_tablet = $attributes['stickyTablet'] ?? '';
        if ( $sticky_tablet === 'sticky' ) {
            $tablet_rules[] = 'position: sticky';
            $top = $attributes['stickyTop_tablet'] ?? $attributes['stickyTop'] ?? null;
            if ( $top !== null ) {
                $unit = $attributes['stickyTopUnit'] ?? 'px';
                $tablet_rules[] = "top: {$top}{$unit}";
            }
            if ( isset( $attributes['stickyLeft_tablet'] ) ) {
                $unit = $attributes['stickyLeftUnit'] ?? 'px';
                $tablet_rules[] = "left: {$attributes['stickyLeft_tablet']}{$unit}";
            }
            if ( isset( $attributes['stickyRight_tablet'] ) ) {
                $unit = $attributes['stickyRightUnit'] ?? 'px';
                $tablet_rules[] = "right: {$attributes['stickyRight_tablet']}{$unit}";
            }
            if ( isset( $attributes['stickyBottom_tablet'] ) ) {
                $unit = $attributes['stickyBottomUnit'] ?? 'px';
                $tablet_rules[] = "bottom: {$attributes['stickyBottom_tablet']}{$unit}";
            }
        } elseif ( $sticky_tablet === 'initial' ) {
            $tablet_rules[] = 'position: relative';
        }

        // Container Options - Tablet
        if ( isset( $attributes['enableInlineFlex_tablet'] ) ) {
            $tablet_rules[] = $attributes['enableInlineFlex_tablet'] ? 'display: inline-flex' : 'display: flex';
        }
        if ( ! empty( $attributes['enableCalcMinHeight'] ) && ! empty( $attributes['calcMinHeight_tablet'] ) ) {
            $tablet_rules[] = "min-height: calc({$attributes['calcMinHeight_tablet']})";
        }
        if ( ! empty( $attributes['enableCalcMaxHeight'] ) && ! empty( $attributes['calcMaxHeight_tablet'] ) ) {
            $tablet_rules[] = "max-height: calc({$attributes['calcMaxHeight_tablet']})";
        }
        if ( ! empty( $attributes['enableBackdropBlur'] ) && isset( $attributes['backdropBlurStrength_tablet'] ) ) {
            $tablet_rules[] = "backdrop-filter: blur({$attributes['backdropBlurStrength_tablet']}px)";
            $tablet_rules[] = "-webkit-backdrop-filter: blur({$attributes['backdropBlurStrength_tablet']}px)";
        }

        if ( ! empty( $tablet_rules ) ) {
            $rules = implode( '; ', $tablet_rules );
            $css_rules[] = "@media (max-width: " . self::TABLET_BREAKPOINT . "px) { {$selector} { {$rules}; } }";
        }

        // Mobile (max-width: 767px)
        $mobile_rules = [];
        $sticky_mobile = $attributes['stickyMobile'] ?? '';
        if ( $sticky_mobile === 'sticky' ) {
            $mobile_rules[] = 'position: sticky';
            $top = $attributes['stickyTop_mobile'] ?? $attributes['stickyTop_tablet'] ?? $attributes['stickyTop'] ?? null;
            if ( $top !== null ) {
                $unit = $attributes['stickyTopUnit'] ?? 'px';
                $mobile_rules[] = "top: {$top}{$unit}";
            }
            if ( isset( $attributes['stickyLeft_mobile'] ) ) {
                $unit = $attributes['stickyLeftUnit'] ?? 'px';
                $mobile_rules[] = "left: {$attributes['stickyLeft_mobile']}{$unit}";
            }
            if ( isset( $attributes['stickyRight_mobile'] ) ) {
                $unit = $attributes['stickyRightUnit'] ?? 'px';
                $mobile_rules[] = "right: {$attributes['stickyRight_mobile']}{$unit}";
            }
            if ( isset( $attributes['stickyBottom_mobile'] ) ) {
                $unit = $attributes['stickyBottomUnit'] ?? 'px';
                $mobile_rules[] = "bottom: {$attributes['stickyBottom_mobile']}{$unit}";
            }
        } elseif ( $sticky_mobile === 'initial' ) {
            $mobile_rules[] = 'position: relative';
        }

        // Container Options - Mobile
        if ( isset( $attributes['enableInlineFlex_mobile'] ) ) {
            $mobile_rules[] = $attributes['enableInlineFlex_mobile'] ? 'display: inline-flex' : 'display: flex';
        }
        if ( ! empty( $attributes['enableCalcMinHeight'] ) && ! empty( $attributes['calcMinHeight_mobile'] ) ) {
            $mobile_rules[] = "min-height: calc({$attributes['calcMinHeight_mobile']})";
        }
        if ( ! empty( $attributes['enableCalcMaxHeight'] ) && ! empty( $attributes['calcMaxHeight_mobile'] ) ) {
            $mobile_rules[] = "max-height: calc({$attributes['calcMaxHeight_mobile']})";
        }
        if ( ! empty( $attributes['enableBackdropBlur'] ) && isset( $attributes['backdropBlurStrength_mobile'] ) ) {
            $mobile_rules[] = "backdrop-filter: blur({$attributes['backdropBlurStrength_mobile']}px)";
            $mobile_rules[] = "-webkit-backdrop-filter: blur({$attributes['backdropBlurStrength_mobile']}px)";
        }

        if ( ! empty( $mobile_rules ) ) {
            $rules = implode( '; ', $mobile_rules );
            $css_rules[] = "@media (max-width: " . self::MOBILE_BREAKPOINT . "px) { {$selector} { {$rules}; } }";
        }

        return implode( "\n", $css_rules );
    }

    /**
     * Generate Advanced Tab responsive CSS (Tablet/Mobile/Hover)
     *
     * @param array  $attributes Block attributes.
     * @param string $selector   CSS selector.
     * @return string CSS with media queries.
     */
    public static function generate_advanced_responsive_css( $attributes, $selector ) {
        $css_rules = [];

        // Tablet CSS
        $tablet_styles = [];

        // Margin tablet
        if ( ! empty( $attributes['blockMargin_tablet'] ) ) {
            $m    = $attributes['blockMargin_tablet'];
            $unit = $m['unit'] ?? 'px';
            if ( isset( $m['top'] ) && $m['top'] !== '' )    $tablet_styles[] = "margin-top: {$m['top']}{$unit}";
            if ( isset( $m['right'] ) && $m['right'] !== '' )  $tablet_styles[] = "margin-right: {$m['right']}{$unit}";
            if ( isset( $m['bottom'] ) && $m['bottom'] !== '' ) $tablet_styles[] = "margin-bottom: {$m['bottom']}{$unit}";
            if ( isset( $m['left'] ) && $m['left'] !== '' )   $tablet_styles[] = "margin-left: {$m['left']}{$unit}";
        }

        // Padding tablet
        if ( ! empty( $attributes['blockPadding_tablet'] ) ) {
            $p    = $attributes['blockPadding_tablet'];
            $unit = $p['unit'] ?? 'px';
            if ( isset( $p['top'] ) && $p['top'] !== '' )    $tablet_styles[] = "padding-top: {$p['top']}{$unit}";
            if ( isset( $p['right'] ) && $p['right'] !== '' )  $tablet_styles[] = "padding-right: {$p['right']}{$unit}";
            if ( isset( $p['bottom'] ) && $p['bottom'] !== '' ) $tablet_styles[] = "padding-bottom: {$p['bottom']}{$unit}";
            if ( isset( $p['left'] ) && $p['left'] !== '' )   $tablet_styles[] = "padding-left: {$p['left']}{$unit}";
        }

        // Width tablet
        $width_tablet = $attributes['elementWidth_tablet'] ?? '';
        if ( $width_tablet === 'custom' && isset( $attributes['elementCustomWidth_tablet'] ) ) {
            $unit = $attributes['elementCustomWidthUnit'] ?? 'px';
            $tablet_styles[] = "width: {$attributes['elementCustomWidth_tablet']}{$unit}";
        } elseif ( $width_tablet === 'full' ) {
            $tablet_styles[] = 'width: 100%';
        } elseif ( $width_tablet === 'inline' ) {
            $tablet_styles[] = 'display: inline-block; width: auto';
        }

        // Border radius tablet
        if ( ! empty( $attributes['borderRadius_tablet'] ) ) {
            $br   = $attributes['borderRadius_tablet'];
            $unit = $br['unit'] ?? 'px';
            $format_radius = function($val, $u) {
                if (preg_match('/^[\d.]+(?:px|%|em|rem)$/', $val)) return $val;
                return is_numeric($val) ? $val . $u : $val;
            };
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $tablet_styles[] = "border-top-left-radius: {$format_radius($br['top'], $unit)}";
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $tablet_styles[] = "border-top-right-radius: {$format_radius($br['right'], $unit)}";
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $tablet_styles[] = "border-bottom-right-radius: {$format_radius($br['bottom'], $unit)}";
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $tablet_styles[] = "border-bottom-left-radius: {$format_radius($br['left'], $unit)}";
        }

        // Z-Index tablet
        if ( isset( $attributes['zIndex_tablet'] ) && $attributes['zIndex_tablet'] !== '' ) {
            $tablet_styles[] = "z-index: {$attributes['zIndex_tablet']}";
        }

        // Flexbox Item tablet
        if ( ! empty( $attributes['flexAlignSelf_tablet'] ) ) {
            $tablet_styles[] = "align-self: {$attributes['flexAlignSelf_tablet']}";
        }
        $flex_order_tablet = $attributes['flexOrder_tablet'] ?? '';
        if ( $flex_order_tablet === 'custom' && isset( $attributes['flexOrderCustom_tablet'] ) ) {
            $tablet_styles[] = "order: {$attributes['flexOrderCustom_tablet']}";
        } elseif ( $flex_order_tablet === 'start' ) {
            $tablet_styles[] = 'order: -9999';
        } elseif ( $flex_order_tablet === 'end' ) {
            $tablet_styles[] = 'order: 9999';
        }
        $flex_size_tablet = $attributes['flexSize_tablet'] ?? '';
        if ( $flex_size_tablet === 'none' ) {
            $tablet_styles[] = 'flex-grow: 0; flex-shrink: 0';
        } elseif ( $flex_size_tablet === 'grow' ) {
            $tablet_styles[] = 'flex-grow: 1; flex-shrink: 0';
        } elseif ( $flex_size_tablet === 'shrink' ) {
            $tablet_styles[] = 'flex-grow: 0; flex-shrink: 1';
        } elseif ( $flex_size_tablet === 'custom' ) {
            if ( isset( $attributes['flexGrow_tablet'] ) )   $tablet_styles[] = "flex-grow: {$attributes['flexGrow_tablet']}";
            if ( isset( $attributes['flexShrink_tablet'] ) ) $tablet_styles[] = "flex-shrink: {$attributes['flexShrink_tablet']}";
        }

        // Transform tablet
        $transforms_tablet = self::build_transform_array( $attributes, '_tablet' );
        if ( ! empty( $transforms_tablet ) ) {
            $tablet_styles[] = 'transform: ' . implode( ' ', $transforms_tablet );
        }

        // Background image tablet
        if ( ! empty( $attributes['backgroundImage_tablet']['url'] ) ) {
            $url = esc_url( $attributes['backgroundImage_tablet']['url'] );
            $tablet_styles[] = "background-image: url({$url})";
        }
        if ( ! empty( $attributes['bgImagePosition_tablet'] ) ) {
            $tablet_styles[] = "background-position: {$attributes['bgImagePosition_tablet']}";
        }
        if ( ! empty( $attributes['bgImageRepeat_tablet'] ) ) {
            $tablet_styles[] = "background-repeat: {$attributes['bgImageRepeat_tablet']}";
        }
        $size_tablet = $attributes['bgImageSize_tablet'] ?? '';
        if ( $size_tablet === 'custom' && isset( $attributes['bgImageCustomWidth_tablet'] ) ) {
            $unit = $attributes['bgImageCustomWidthUnit'] ?? 'px';
            $tablet_styles[] = "background-size: {$attributes['bgImageCustomWidth_tablet']}{$unit}";
        } elseif ( $size_tablet ) {
            $tablet_styles[] = "background-size: {$size_tablet}";
        }

        if ( ! empty( $tablet_styles ) ) {
            $rules = implode( '; ', $tablet_styles );
            $css_rules[] = "@media (max-width: " . self::TABLET_BREAKPOINT . "px) { {$selector} { {$rules}; } }";
        }

        // Mobile CSS
        $mobile_styles = [];

        // Margin mobile
        if ( ! empty( $attributes['blockMargin_mobile'] ) ) {
            $m    = $attributes['blockMargin_mobile'];
            $unit = $m['unit'] ?? 'px';
            if ( isset( $m['top'] ) && $m['top'] !== '' )    $mobile_styles[] = "margin-top: {$m['top']}{$unit}";
            if ( isset( $m['right'] ) && $m['right'] !== '' )  $mobile_styles[] = "margin-right: {$m['right']}{$unit}";
            if ( isset( $m['bottom'] ) && $m['bottom'] !== '' ) $mobile_styles[] = "margin-bottom: {$m['bottom']}{$unit}";
            if ( isset( $m['left'] ) && $m['left'] !== '' )   $mobile_styles[] = "margin-left: {$m['left']}{$unit}";
        }

        // Padding mobile
        if ( ! empty( $attributes['blockPadding_mobile'] ) ) {
            $p    = $attributes['blockPadding_mobile'];
            $unit = $p['unit'] ?? 'px';
            if ( isset( $p['top'] ) && $p['top'] !== '' )    $mobile_styles[] = "padding-top: {$p['top']}{$unit}";
            if ( isset( $p['right'] ) && $p['right'] !== '' )  $mobile_styles[] = "padding-right: {$p['right']}{$unit}";
            if ( isset( $p['bottom'] ) && $p['bottom'] !== '' ) $mobile_styles[] = "padding-bottom: {$p['bottom']}{$unit}";
            if ( isset( $p['left'] ) && $p['left'] !== '' )   $mobile_styles[] = "padding-left: {$p['left']}{$unit}";
        }

        // Width mobile
        $width_mobile = $attributes['elementWidth_mobile'] ?? '';
        if ( $width_mobile === 'custom' && isset( $attributes['elementCustomWidth_mobile'] ) ) {
            $unit = $attributes['elementCustomWidthUnit'] ?? 'px';
            $mobile_styles[] = "width: {$attributes['elementCustomWidth_mobile']}{$unit}";
        } elseif ( $width_mobile === 'full' ) {
            $mobile_styles[] = 'width: 100%';
        } elseif ( $width_mobile === 'inline' ) {
            $mobile_styles[] = 'display: inline-block; width: auto';
        }

        // Border radius mobile
        if ( ! empty( $attributes['borderRadius_mobile'] ) ) {
            $br   = $attributes['borderRadius_mobile'];
            $unit = $br['unit'] ?? 'px';
            $format_radius = function($val, $u) {
                if (preg_match('/^[\d.]+(?:px|%|em|rem)$/', $val)) return $val;
                return is_numeric($val) ? $val . $u : $val;
            };
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $mobile_styles[] = "border-top-left-radius: {$format_radius($br['top'], $unit)}";
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $mobile_styles[] = "border-top-right-radius: {$format_radius($br['right'], $unit)}";
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $mobile_styles[] = "border-bottom-right-radius: {$format_radius($br['bottom'], $unit)}";
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $mobile_styles[] = "border-bottom-left-radius: {$format_radius($br['left'], $unit)}";
        }

        // Z-Index mobile
        if ( isset( $attributes['zIndex_mobile'] ) && $attributes['zIndex_mobile'] !== '' ) {
            $mobile_styles[] = "z-index: {$attributes['zIndex_mobile']}";
        }

        // Flexbox Item mobile
        if ( ! empty( $attributes['flexAlignSelf_mobile'] ) ) {
            $mobile_styles[] = "align-self: {$attributes['flexAlignSelf_mobile']}";
        }
        $flex_order_mobile = $attributes['flexOrder_mobile'] ?? '';
        if ( $flex_order_mobile === 'custom' && isset( $attributes['flexOrderCustom_mobile'] ) ) {
            $mobile_styles[] = "order: {$attributes['flexOrderCustom_mobile']}";
        } elseif ( $flex_order_mobile === 'start' ) {
            $mobile_styles[] = 'order: -9999';
        } elseif ( $flex_order_mobile === 'end' ) {
            $mobile_styles[] = 'order: 9999';
        }
        $flex_size_mobile = $attributes['flexSize_mobile'] ?? '';
        if ( $flex_size_mobile === 'none' ) {
            $mobile_styles[] = 'flex-grow: 0; flex-shrink: 0';
        } elseif ( $flex_size_mobile === 'grow' ) {
            $mobile_styles[] = 'flex-grow: 1; flex-shrink: 0';
        } elseif ( $flex_size_mobile === 'shrink' ) {
            $mobile_styles[] = 'flex-grow: 0; flex-shrink: 1';
        } elseif ( $flex_size_mobile === 'custom' ) {
            if ( isset( $attributes['flexGrow_mobile'] ) )   $mobile_styles[] = "flex-grow: {$attributes['flexGrow_mobile']}";
            if ( isset( $attributes['flexShrink_mobile'] ) ) $mobile_styles[] = "flex-shrink: {$attributes['flexShrink_mobile']}";
        }

        // Transform mobile
        $transforms_mobile = self::build_transform_array( $attributes, '_mobile' );
        if ( ! empty( $transforms_mobile ) ) {
            $mobile_styles[] = 'transform: ' . implode( ' ', $transforms_mobile );
        }

        // Background image mobile
        if ( ! empty( $attributes['backgroundImage_mobile']['url'] ) ) {
            $url = esc_url( $attributes['backgroundImage_mobile']['url'] );
            $mobile_styles[] = "background-image: url({$url})";
        }
        if ( ! empty( $attributes['bgImagePosition_mobile'] ) ) {
            $mobile_styles[] = "background-position: {$attributes['bgImagePosition_mobile']}";
        }
        if ( ! empty( $attributes['bgImageRepeat_mobile'] ) ) {
            $mobile_styles[] = "background-repeat: {$attributes['bgImageRepeat_mobile']}";
        }
        $size_mobile = $attributes['bgImageSize_mobile'] ?? '';
        if ( $size_mobile === 'custom' && isset( $attributes['bgImageCustomWidth_mobile'] ) ) {
            $unit = $attributes['bgImageCustomWidthUnit'] ?? 'px';
            $mobile_styles[] = "background-size: {$attributes['bgImageCustomWidth_mobile']}{$unit}";
        } elseif ( $size_mobile ) {
            $mobile_styles[] = "background-size: {$size_mobile}";
        }

        if ( ! empty( $mobile_styles ) ) {
            $rules = implode( '; ', $mobile_styles );
            $css_rules[] = "@media (max-width: " . self::MOBILE_BREAKPOINT . "px) { {$selector} { {$rules}; } }";
        }

        // Hover state CSS
        $hover_styles = [];

        if ( ! empty( $attributes['borderTypeHover'] ) && $attributes['borderTypeHover'] !== 'none' ) {
            $hover_styles[] = "border-style: {$attributes['borderTypeHover']}";
        }
        if ( ! empty( $attributes['borderColorHover'] ) ) {
            $hover_styles[] = "border-color: {$attributes['borderColorHover']}";
        }
        if ( ! empty( $attributes['borderWidthHover'] ) ) {
            $bw   = $attributes['borderWidthHover'];
            $unit = $bw['unit'] ?? 'px';
            if ( isset( $bw['top'] ) && $bw['top'] !== '' )    $hover_styles[] = "border-top-width: {$bw['top']}{$unit}";
            if ( isset( $bw['right'] ) && $bw['right'] !== '' )  $hover_styles[] = "border-right-width: {$bw['right']}{$unit}";
            if ( isset( $bw['bottom'] ) && $bw['bottom'] !== '' ) $hover_styles[] = "border-bottom-width: {$bw['bottom']}{$unit}";
            if ( isset( $bw['left'] ) && $bw['left'] !== '' )   $hover_styles[] = "border-left-width: {$bw['left']}{$unit}";
        }
        if ( ! empty( $attributes['borderRadiusHover'] ) ) {
            $br   = $attributes['borderRadiusHover'];
            $unit = $br['unit'] ?? 'px';
            $format_radius = function($val, $u) {
                if (preg_match('/^[\d.]+(?:px|%|em|rem)$/', $val)) return $val;
                return is_numeric($val) ? $val . $u : $val;
            };
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $hover_styles[] = "border-top-left-radius: {$format_radius($br['top'], $unit)}";
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $hover_styles[] = "border-top-right-radius: {$format_radius($br['right'], $unit)}";
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $hover_styles[] = "border-bottom-right-radius: {$format_radius($br['bottom'], $unit)}";
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $hover_styles[] = "border-bottom-left-radius: {$format_radius($br['left'], $unit)}";
        }
        if ( ! empty( $attributes['boxShadowHover'] ) && is_array( $attributes['boxShadowHover'] ) ) {
            $bs     = $attributes['boxShadowHover'];
            $h      = $bs['horizontal'] ?? 0;
            $v      = $bs['vertical'] ?? 0;
            $blur   = $bs['blur'] ?? 0;
            $spread = $bs['spread'] ?? 0;
            $color  = $bs['color'] ?? 'rgba(0,0,0,0.5)';
            $inset  = ( $bs['position'] ?? '' ) === 'inset' ? 'inset ' : '';
            if ( $h || $v || $blur || $spread ) {
                $hover_styles[] = "box-shadow: {$inset}{$h}px {$v}px {$blur}px {$spread}px {$color}";
            }
        }

        // Background hover
        $bg_type_hover = $attributes['backgroundTypeHover'] ?? 'classic';
        if ( $bg_type_hover === 'classic' ) {
            if ( ! empty( $attributes['backgroundColorHover'] ) ) {
                $hover_styles[] = "background-color: {$attributes['backgroundColorHover']}";
            }
            if ( ! empty( $attributes['backgroundImageHover']['url'] ) ) {
                $url = esc_url( $attributes['backgroundImageHover']['url'] );
                $hover_styles[] = "background-image: url({$url})";
            }
        }

        if ( ! empty( $hover_styles ) ) {
            $rules = implode( '; ', $hover_styles );
            $css_rules[] = "{$selector}:hover { {$rules}; }";
        }

        // Custom CSS
        if ( ! empty( $attributes['customCSS'] ) ) {
            // Replace 'selector' placeholder with actual selector
            $custom_css = str_ireplace( 'selector', $selector, $attributes['customCSS'] );
            $css_rules[] = $custom_css;
        }

        return implode( "\n", $css_rules );
    }

    /**
     * Get visibility classes based on hide attributes
     *
     * @param array $attributes Block attributes.
     * @return array CSS class names.
     */
    public static function get_visibility_classes( $attributes ) {
        $classes = [];
        if ( ! empty( $attributes['hideDesktop'] ) ) $classes[] = 'vx-hidden-desktop';
        if ( ! empty( $attributes['hideTablet'] ) )  $classes[] = 'vx-hidden-tablet';
        if ( ! empty( $attributes['hideMobile'] ) )  $classes[] = 'vx-hidden-mobile';
        return $classes;
    }

    /**
     * Parse custom attributes string
     *
     * Format: "key|value" per line (Elementor Pro format)
     *
     * @param string $custom_attributes String with key|value pairs.
     * @return array Parsed attributes.
     */
    public static function parse_custom_attributes( $custom_attributes ) {
        if ( empty( $custom_attributes ) ) {
            return [];
        }

        $result = [];
        $lines  = explode( "\n", $custom_attributes );

        foreach ( $lines as $line ) {
            $trimmed = trim( $line );
            if ( empty( $trimmed ) ) {
                continue;
            }

            $pipe_pos = strpos( $trimmed, '|' );
            if ( $pipe_pos !== false && $pipe_pos > 0 ) {
                $key   = trim( substr( $trimmed, 0, $pipe_pos ) );
                $value = trim( substr( $trimmed, $pipe_pos + 1 ) );
                if ( $key && self::is_valid_attribute_name( $key ) ) {
                    $result[ $key ] = esc_attr( $value );
                }
            } elseif ( self::is_valid_attribute_name( $trimmed ) ) {
                // Boolean attribute (no value)
                $result[ $trimmed ] = '';
            }
        }

        return $result;
    }

    /**
     * Validate attribute name (prevent XSS/injection)
     *
     * @param string $name Attribute name.
     * @return bool
     */
    private static function is_valid_attribute_name( $name ) {
        // Must start with letter, can contain letters, numbers, hyphens, underscores
        if ( ! preg_match( '/^[a-z][a-z0-9_-]*$/i', $name ) ) {
            return false;
        }

        // Blacklist event handlers and special attributes
        $blacklist = [
            'onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur',
            'onkeydown', 'onkeyup', 'onsubmit', 'onchange', 'style', 'class', 'id', 'href', 'src'
        ];

        return ! in_array( strtolower( $name ), $blacklist, true );
    }

    /**
     * Build transform array for a specific breakpoint
     *
     * @param array  $attributes Block attributes.
     * @param string $suffix     Breakpoint suffix (_tablet, _mobile, or empty).
     * @return array Transform CSS functions.
     */
    private static function build_transform_array( $attributes, $suffix ) {
        $transforms = [];

        // Rotation
        $rotate_z = $attributes[ "transformRotateZ{$suffix}" ] ?? null;
        $rotate_x = $attributes[ "transformRotateX{$suffix}" ] ?? null;
        $rotate_y = $attributes[ "transformRotateY{$suffix}" ] ?? null;
        if ( $rotate_z ) $transforms[] = "rotateZ({$rotate_z}deg)";
        if ( $rotate_x ) $transforms[] = "rotateX({$rotate_x}deg)";
        if ( $rotate_y ) $transforms[] = "rotateY({$rotate_y}deg)";

        // Translate
        $offset_x = $attributes[ "transformOffsetX{$suffix}" ] ?? null;
        $offset_y = $attributes[ "transformOffsetY{$suffix}" ] ?? null;
        if ( $offset_x !== null || $offset_y !== null ) {
            $x      = $offset_x ?? 0;
            $x_unit = $attributes['transformOffsetXUnit'] ?? 'px';
            $y      = $offset_y ?? 0;
            $y_unit = $attributes['transformOffsetYUnit'] ?? 'px';
            $transforms[] = "translate({$x}{$x_unit}, {$y}{$y_unit})";
        }

        // Scale
        $scale_x = $attributes[ "transformScaleX{$suffix}" ] ?? null;
        $scale_y = $attributes[ "transformScaleY{$suffix}" ] ?? null;
        if ( $scale_x !== null || $scale_y !== null ) {
            $sx = $scale_x ?? 1;
            $sy = $scale_y ?? 1;
            $transforms[] = "scale({$sx}, {$sy})";
        }

        // Skew
        $skew_x = $attributes[ "transformSkewX{$suffix}" ] ?? null;
        $skew_y = $attributes[ "transformSkewY{$suffix}" ] ?? null;
        if ( $skew_x || $skew_y ) {
            $sx = $skew_x ?? 0;
            $sy = $skew_y ?? 0;
            $transforms[] = "skew({$sx}deg, {$sy}deg)";
        }

        // Flip (only on desktop - no suffix needed)
        if ( $suffix === '' ) {
            if ( ! empty( $attributes['transformFlipH'] ) ) $transforms[] = 'scaleX(-1)';
            if ( ! empty( $attributes['transformFlipV'] ) ) $transforms[] = 'scaleY(-1)';
        }

        return $transforms;
    }

    /**
     * Get mask shape URL for predefined Elementor shapes
     *
     * @param string $shape Shape name.
     * @return string URL to SVG.
     */
    private static function get_mask_shape_url( $shape ) {
        $valid_shapes = [
            'circle', 'oval-vertical', 'oval-horizontal', 'pill-vertical', 'pill-horizontal',
            'triangle', 'diamond', 'pentagon', 'hexagon-vertical', 'hexagon-horizontal',
            'heptagon', 'octagon', 'parallelogram-right', 'parallelogram-left',
            'trapezoid-up', 'trapezoid-down', 'flower', 'sketch', 'hexagon', 'blob'
        ];

        $shape_name = in_array( $shape, $valid_shapes, true ) ? $shape : 'circle';
        return '/wp-content/plugins/elementor/assets/mask-shapes/' . $shape_name . '.svg';
    }

    /**
     * Convert style array to inline style string
     *
     * @param array $styles CSS properties.
     * @return string Inline style value.
     */
    private static function array_to_style_string( $styles ) {
        if ( empty( $styles ) ) {
            return '';
        }

        $parts = [];
        foreach ( $styles as $property => $value ) {
            $parts[] = $property . ': ' . $value;
        }

        return implode( '; ', $parts );
    }

    /**
     * Generate Search Form specific CSS
     *
     * This generates CSS for search-form inspector controls that need
     * high-specificity selectors to override Voxel's commons.css.
     *
     * Called separately from generate_all() because search-form has
     * special requirements like portal-rendered elements (switcher button).
     *
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return string CSS rules.
     */
    public static function generate_search_form_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // Block selector (frontend uses single class)
        $selector = '.voxel-fse-search-form-' . $block_id;

        // CRITICAL: Popup selector for portal elements rendered at document.body level
        // FieldPopup uses createPortal(..., document.body), so block-scoped selectors cannot reach them.
        // Instead, we target popups via the class added to their wrapper: voxel-popup-{blockId}
        $popup_selector = '.voxel-popup-' . $block_id;

        // SPECIFICITY FIX for Map/Feed Switcher: The switcher is portaled to document.body.
        // commons.css uses `.ts-switcher-btn .ts-btn` (specificity 0,2,0)
        // We need higher specificity to override. Using doubled class selector (0,2,0)
        // Combined with `.ts-switcher-btn .ts-btn` = (0,4,0) which beats commons.css (0,2,0)
        $switcher_selector = '.voxel-fse-search-form-' . $block_id . '.voxel-fse-search-form-' . $block_id;

        // ============================================
        // Map/Feed Switcher Styles
        // Source: themes/voxel/templates/widgets/search-form.php:2917-3065
        // Target: .ts-switcher-btn (container), .ts-switcher-btn .ts-btn (button)
        // These styles target portal-rendered elements at document.body level
        // ============================================

        // Switcher Alignment - ts_switcher_position
        if ( ! empty( $attributes['mapSwitcherAlign'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn { justify-content: {$attributes['mapSwitcherAlign']}; }";
        }

        // Bottom Margin - ts_switcher_bottom
        if ( isset( $attributes['mapSwitcherBottomMargin'] ) && $attributes['mapSwitcherBottomMargin'] !== '' ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn { bottom: {$attributes['mapSwitcherBottomMargin']}px; }";
        }
        if ( isset( $attributes['mapSwitcherBottomMargin_tablet'] ) && $attributes['mapSwitcherBottomMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn { bottom: {$attributes['mapSwitcherBottomMargin_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherBottomMargin_mobile'] ) && $attributes['mapSwitcherBottomMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn { bottom: {$attributes['mapSwitcherBottomMargin_mobile']}px; }";
        }

        // Side Margin - ts_switcher_side
        if ( isset( $attributes['mapSwitcherSideMargin'] ) && $attributes['mapSwitcherSideMargin'] !== '' ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn { padding-left: {$attributes['mapSwitcherSideMargin']}px; padding-right: {$attributes['mapSwitcherSideMargin']}px; }";
        }
        if ( isset( $attributes['mapSwitcherSideMargin_tablet'] ) && $attributes['mapSwitcherSideMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn { padding-left: {$attributes['mapSwitcherSideMargin_tablet']}px; padding-right: {$attributes['mapSwitcherSideMargin_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherSideMargin_mobile'] ) && $attributes['mapSwitcherSideMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn { padding-left: {$attributes['mapSwitcherSideMargin_mobile']}px; padding-right: {$attributes['mapSwitcherSideMargin_mobile']}px; }";
        }

        // Typography - ts_switcher_typo
        if ( ! empty( $attributes['mapSwitcherTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['mapSwitcherTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { {$typo} }";
            }
        }

        // Text Color - ts_switcher_text
        if ( ! empty( $attributes['mapSwitcherColor'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { color: {$attributes['mapSwitcherColor']}; }";
        }

        // Background Color - ts_switcher_bg
        if ( ! empty( $attributes['mapSwitcherBackgroundColor'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { background: {$attributes['mapSwitcherBackgroundColor']}; }";
        }

        // Height - ts_switcher_height
        if ( isset( $attributes['mapSwitcherHeight'] ) && $attributes['mapSwitcherHeight'] !== '' ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { height: {$attributes['mapSwitcherHeight']}px; }";
        }
        if ( isset( $attributes['mapSwitcherHeight_tablet'] ) && $attributes['mapSwitcherHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { height: {$attributes['mapSwitcherHeight_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherHeight_mobile'] ) && $attributes['mapSwitcherHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { height: {$attributes['mapSwitcherHeight_mobile']}px; }";
        }

        // Padding - ts_switcher_padding
        if ( ! empty( $attributes['mapSwitcherPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['mapSwitcherPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { {$padding} }";
            }
        }
        if ( ! empty( $attributes['mapSwitcherPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['mapSwitcherPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { {$padding} }";
            }
        }
        if ( ! empty( $attributes['mapSwitcherPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['mapSwitcherPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { {$padding} }";
            }
        }

        // Border - ts_switcher_border
        if ( ! empty( $attributes['mapSwitcherBorder'] ) ) {
            $border = self::generate_border_css( $attributes['mapSwitcherBorder'] );
            if ( $border ) {
                $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { border: {$border}; }";
            }
        }

        // Border Radius - ts_switcher_radius
        if ( isset( $attributes['mapSwitcherBorderRadius'] ) && $attributes['mapSwitcherBorderRadius'] !== '' ) {
            $unit = $attributes['mapSwitcherBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { border-radius: {$attributes['mapSwitcherBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherBorderRadius_tablet'] ) && $attributes['mapSwitcherBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['mapSwitcherBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { border-radius: {$attributes['mapSwitcherBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherBorderRadius_mobile'] ) && $attributes['mapSwitcherBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['mapSwitcherBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { border-radius: {$attributes['mapSwitcherBorderRadius_mobile']}{$unit}; }";
        }

        // Box Shadow - ts_switcher_shadow
        if ( ! empty( $attributes['mapSwitcherBoxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['mapSwitcherBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { box-shadow: {$shadow}; }";
            }
        }

        // Icon Spacing - ts_switcher_ico_spacing
        if ( isset( $attributes['mapSwitcherIconSpacing'] ) && $attributes['mapSwitcherIconSpacing'] !== '' ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { grid-gap: {$attributes['mapSwitcherIconSpacing']}px; }";
        }
        if ( isset( $attributes['mapSwitcherIconSpacing_tablet'] ) && $attributes['mapSwitcherIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { grid-gap: {$attributes['mapSwitcherIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherIconSpacing_mobile'] ) && $attributes['mapSwitcherIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { grid-gap: {$attributes['mapSwitcherIconSpacing_mobile']}px; }";
        }

        // Icon Size - ts_switcher_ico_size
        if ( isset( $attributes['mapSwitcherIconSize'] ) && $attributes['mapSwitcherIconSize'] !== '' ) {
            $unit = $attributes['mapSwitcherIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { --ts-icon-size: {$attributes['mapSwitcherIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherIconSize_tablet'] ) && $attributes['mapSwitcherIconSize_tablet'] !== '' ) {
            $unit = $attributes['mapSwitcherIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { --ts-icon-size: {$attributes['mapSwitcherIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherIconSize_mobile'] ) && $attributes['mapSwitcherIconSize_mobile'] !== '' ) {
            $unit = $attributes['mapSwitcherIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { --ts-icon-size: {$attributes['mapSwitcherIconSize_mobile']}{$unit}; }";
        }

        // Icon Color - ts_switcher_ico_color
        if ( ! empty( $attributes['mapSwitcherIconColor'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn { --ts-icon-color: {$attributes['mapSwitcherIconColor']}; }";
        }

        // Hover States
        if ( ! empty( $attributes['mapSwitcherColorHover'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn:hover { color: {$attributes['mapSwitcherColorHover']}; }";
        }
        if ( ! empty( $attributes['mapSwitcherBackgroundColorHover'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn:hover { background: {$attributes['mapSwitcherBackgroundColorHover']}; }";
        }
        if ( ! empty( $attributes['mapSwitcherBorderColorHover'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn:hover { border-color: {$attributes['mapSwitcherBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['mapSwitcherIconColorHover'] ) ) {
            $css_rules[] = "{$switcher_selector} .ts-switcher-btn .ts-btn:hover { --ts-icon-color: {$attributes['mapSwitcherIconColorHover']}; }";
        }

        // ============================================
        // CONTENT TAB - Post type filter width
        // Source: search-form.php:63-79
        // ============================================
        if ( isset( $attributes['postTypeFilterWidth'] ) && $attributes['postTypeFilterWidth'] !== '' ) {
            $css_rules[] = "{$selector} .choose-cpt-filter { width: {$attributes['postTypeFilterWidth']}%; }";
        }
        if ( isset( $attributes['postTypeFilterWidth_tablet'] ) && $attributes['postTypeFilterWidth_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .choose-cpt-filter { width: {$attributes['postTypeFilterWidth_tablet']}%; }";
        }
        if ( isset( $attributes['postTypeFilterWidth_mobile'] ) && $attributes['postTypeFilterWidth_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .choose-cpt-filter { width: {$attributes['postTypeFilterWidth_mobile']}%; }";
        }

        // ============================================
        // CONTENT TAB - Search button width
        // Source: search-form.php:509-523
        // ============================================
        if ( isset( $attributes['searchButtonWidth'] ) && $attributes['searchButtonWidth'] !== '' ) {
            $unit = $attributes['searchButtonWidthUnit'] ?? '%';
            $css_rules[] = "{$selector} .ts-form-group.ts-form-submit { width: {$attributes['searchButtonWidth']}{$unit}; }";
        }
        if ( isset( $attributes['searchButtonWidth_tablet'] ) && $attributes['searchButtonWidth_tablet'] !== '' ) {
            $unit = $attributes['searchButtonWidthUnit'] ?? '%';
            $tablet_rules[] = "{$selector} .ts-form-group.ts-form-submit { width: {$attributes['searchButtonWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['searchButtonWidth_mobile'] ) && $attributes['searchButtonWidth_mobile'] !== '' ) {
            $unit = $attributes['searchButtonWidthUnit'] ?? '%';
            $mobile_rules[] = "{$selector} .ts-form-group.ts-form-submit { width: {$attributes['searchButtonWidth_mobile']}{$unit}; }";
        }

        // ============================================
        // CONTENT TAB - Reset button width
        // Source: search-form.php:558-570
        // ============================================
        if ( isset( $attributes['resetButtonWidth'] ) && $attributes['resetButtonWidth'] !== '' ) {
            $unit = $attributes['resetButtonWidthUnit'] ?? '%';
            $css_rules[] = "{$selector} .ts-form-reset { width: {$attributes['resetButtonWidth']}{$unit}; }";
        }
        if ( isset( $attributes['resetButtonWidth_tablet'] ) && $attributes['resetButtonWidth_tablet'] !== '' ) {
            $unit = $attributes['resetButtonWidthUnit'] ?? '%';
            $tablet_rules[] = "{$selector} .ts-form-reset { width: {$attributes['resetButtonWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['resetButtonWidth_mobile'] ) && $attributes['resetButtonWidth_mobile'] !== '' ) {
            $unit = $attributes['resetButtonWidthUnit'] ?? '%';
            $mobile_rules[] = "{$selector} .ts-form-reset { width: {$attributes['resetButtonWidth_mobile']}{$unit}; }";
        }

        // ============================================
        // GENERAL TAB - Section 1: General
        // Source: search-form.php:912-974
        // ============================================

        // Filter Margin (uses padding property)
        if ( ! empty( $attributes['filterMargin'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['filterMargin'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .ts-filter-wrapper > .ts-form-group { {$padding} }";
            }
        }
        if ( ! empty( $attributes['filterMargin_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['filterMargin_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$selector} .ts-filter-wrapper > .ts-form-group { {$padding} }";
            }
        }
        if ( ! empty( $attributes['filterMargin_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['filterMargin_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$selector} .ts-filter-wrapper > .ts-form-group { {$padding} }";
            }
        }

        // Show labels
        if ( isset( $attributes['showLabels'] ) && $attributes['showLabels'] === false ) {
            $css_rules[] = "{$selector} .ts-form-group > label { display: none; }";
        }

        // Label color
        if ( ! empty( $attributes['labelColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group > label { color: {$attributes['labelColor']}; }";
        }

        // Label typography
        if ( ! empty( $attributes['labelTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['labelTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-form-group > label { {$typo} }";
            }
        }

        // ============================================
        // GENERAL TAB - Section 2: Common Styles
        // Source: search-form.php:978-1266
        // ============================================

        // Height
        if ( isset( $attributes['commonHeight'] ) && $attributes['commonHeight'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter { min-height: {$attributes['commonHeight']}px; }";
        }
        if ( isset( $attributes['commonHeight_tablet'] ) && $attributes['commonHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-group .ts-filter { min-height: {$attributes['commonHeight_tablet']}px; }";
        }
        if ( isset( $attributes['commonHeight_mobile'] ) && $attributes['commonHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-group .ts-filter { min-height: {$attributes['commonHeight_mobile']}px; }";
        }

        // Icon size
        if ( isset( $attributes['commonIconSize'] ) && $attributes['commonIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter > span svg { width: {$attributes['commonIconSize']}px; height: {$attributes['commonIconSize']}px; }";
        }
        if ( isset( $attributes['commonIconSize_tablet'] ) && $attributes['commonIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-group .ts-filter > span svg { width: {$attributes['commonIconSize_tablet']}px; height: {$attributes['commonIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['commonIconSize_mobile'] ) && $attributes['commonIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-group .ts-filter > span svg { width: {$attributes['commonIconSize_mobile']}px; height: {$attributes['commonIconSize_mobile']}px; }";
        }

        // Border radius
        if ( isset( $attributes['commonBorderRadius'] ) && $attributes['commonBorderRadius'] !== '' ) {
            $unit = $attributes['commonBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-form-group .ts-filter { border-radius: {$attributes['commonBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['commonBorderRadius_tablet'] ) && $attributes['commonBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['commonBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-form-group .ts-filter { border-radius: {$attributes['commonBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['commonBorderRadius_mobile'] ) && $attributes['commonBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['commonBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-form-group .ts-filter { border-radius: {$attributes['commonBorderRadius_mobile']}{$unit}; }";
        }

        // Box shadow
        if ( ! empty( $attributes['commonBoxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['commonBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter { box-shadow: {$shadow}; }";
            }
        }

        // Border
        if ( ! empty( $attributes['commonBorder'] ) ) {
            $border = self::generate_border_css( $attributes['commonBorder'] );
            if ( $border ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter { border: {$border}; }";
            }
        }

        // Background color
        if ( ! empty( $attributes['commonBackgroundColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter { background-color: {$attributes['commonBackgroundColor']}; }";
        }

        // Icon color
        if ( ! empty( $attributes['commonIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter > span svg { fill: {$attributes['commonIconColor']}; color: {$attributes['commonIconColor']}; }";
        }

        // Text color
        if ( ! empty( $attributes['commonTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter .ts-filter-text { color: {$attributes['commonTextColor']}; }";
        }

        // Hover states
        if ( ! empty( $attributes['commonBoxShadowHover'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['commonBoxShadowHover'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter:hover { box-shadow: {$shadow}; }";
            }
        }
        if ( ! empty( $attributes['commonBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter:hover { border-color: {$attributes['commonBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['commonBackgroundColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter:hover { background-color: {$attributes['commonBackgroundColorHover']}; }";
        }
        if ( ! empty( $attributes['commonIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter:hover > span svg { fill: {$attributes['commonIconColorHover']}; color: {$attributes['commonIconColorHover']}; }";
        }
        if ( ! empty( $attributes['commonTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter:hover .ts-filter-text { color: {$attributes['commonTextColorHover']}; }";
        }

        // Typography
        if ( ! empty( $attributes['commonTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['commonTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter .ts-filter-text { {$typo} }";
            }
        }

        // Hide chevron
        if ( ! empty( $attributes['hideChevron'] ) && $attributes['hideChevron'] === true ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter .ts-down-icon { display: none; }";
        }

        // Chevron color
        if ( ! empty( $attributes['chevronColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter .ts-down-icon { color: {$attributes['chevronColor']}; border-color: {$attributes['chevronColor']}; }";
        }
        if ( ! empty( $attributes['chevronColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter:hover .ts-down-icon { color: {$attributes['chevronColorHover']}; border-color: {$attributes['chevronColorHover']}; }";
        }

        // ============================================
        // GENERAL TAB - Section 3: Button
        // Source: search-form.php:1270-1468
        // ============================================

        // Button Padding
        if ( ! empty( $attributes['buttonPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['buttonPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter { {$padding} }";
            }
        }
        if ( ! empty( $attributes['buttonPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['buttonPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$selector} .ts-form-group .ts-filter { {$padding} }";
            }
        }
        if ( ! empty( $attributes['buttonPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['buttonPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$selector} .ts-form-group .ts-filter { {$padding} }";
            }
        }

        // Button Icon/Text spacing
        if ( isset( $attributes['buttonIconSpacing'] ) && $attributes['buttonIconSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter { grid-gap: {$attributes['buttonIconSpacing']}px; }";
            $css_rules[] = "{$selector} .ts-search-btn { grid-gap: {$attributes['buttonIconSpacing']}px; }";
        }
        if ( isset( $attributes['buttonIconSpacing_tablet'] ) && $attributes['buttonIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-group .ts-filter { grid-gap: {$attributes['buttonIconSpacing_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-search-btn { grid-gap: {$attributes['buttonIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['buttonIconSpacing_mobile'] ) && $attributes['buttonIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-group .ts-filter { grid-gap: {$attributes['buttonIconSpacing_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-search-btn { grid-gap: {$attributes['buttonIconSpacing_mobile']}px; }";
        }

        // Filled state
        if ( ! empty( $attributes['buttonFilledTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['buttonFilledTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled { {$typo} }";
            }
        }
        if ( ! empty( $attributes['buttonFilledBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled { background-color: {$attributes['buttonFilledBackground']}; }";
        }
        if ( ! empty( $attributes['buttonFilledTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled .ts-filter-text { color: {$attributes['buttonFilledTextColor']}; }";
        }
        if ( ! empty( $attributes['buttonFilledIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled { --ts-icon-color: {$attributes['buttonFilledIconColor']}; }";
        }
        if ( ! empty( $attributes['buttonFilledBorderColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled { border-color: {$attributes['buttonFilledBorderColor']}; }";
        }
        if ( isset( $attributes['buttonFilledBorderWidth'] ) && $attributes['buttonFilledBorderWidth'] !== '' ) {
            $unit = $attributes['buttonFilledBorderWidthUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled { border-width: {$attributes['buttonFilledBorderWidth']}{$unit}; }";
        }
        if ( ! empty( $attributes['buttonFilledBoxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['buttonFilledBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled { box-shadow: {$shadow}; }";
            }
        }
        if ( ! empty( $attributes['buttonFilledChevronColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-filter.ts-filled .ts-down-icon { border-color: {$attributes['buttonFilledChevronColor']}; }";
        }

        // ============================================
        // GENERAL TAB - Section 5: Search Button
        // Source: search-form.php:1600-1769
        // ============================================

        // Normal state
        if ( ! empty( $attributes['searchBtnColor'] ) ) {
            $css_rules[] = "{$selector} .ts-search-btn { color: {$attributes['searchBtnColor']}; }";
        }
        if ( ! empty( $attributes['searchBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-search-btn { --ts-icon-color: {$attributes['searchBtnIconColor']}; }";
        }
        if ( ! empty( $attributes['searchBtnBackgroundColor'] ) ) {
            $css_rules[] = "{$selector} .ts-search-btn { background: {$attributes['searchBtnBackgroundColor']}; }";
        }
        if ( ! empty( $attributes['searchBtnBorder'] ) ) {
            $border = self::generate_border_css( $attributes['searchBtnBorder'] );
            if ( $border ) {
                $css_rules[] = "{$selector} .ts-form-submit.ts-form-group button.ts-search-btn { border: {$border}; }";
            }
            // Border radius from BorderGroupControl
            if ( ! empty( $attributes['searchBtnBorder']['borderRadius'] ) ) {
                $radius = $attributes['searchBtnBorder']['borderRadius'];
                $unit = $radius['unit'] ?? 'px';
                $top = isset( $radius['top'] ) ? preg_replace( '/[^0-9.]/', '', $radius['top'] ) : '0';
                $right = isset( $radius['right'] ) ? preg_replace( '/[^0-9.]/', '', $radius['right'] ) : '0';
                $bottom = isset( $radius['bottom'] ) ? preg_replace( '/[^0-9.]/', '', $radius['bottom'] ) : '0';
                $left = isset( $radius['left'] ) ? preg_replace( '/[^0-9.]/', '', $radius['left'] ) : '0';
                if ( $top !== '0' || $right !== '0' || $bottom !== '0' || $left !== '0' ) {
                    $css_rules[] = "{$selector} .ts-form-submit.ts-form-group button.ts-search-btn { border-radius: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
                }
            }
        }
        if ( ! empty( $attributes['searchBtnBoxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['searchBtnBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-search-btn { box-shadow: {$shadow}; }";
            }
        }

        // Hover state
        if ( ! empty( $attributes['searchBtnTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-search-btn:hover { color: {$attributes['searchBtnTextColorHover']}; }";
        }
        if ( ! empty( $attributes['searchBtnIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-search-btn:hover { --ts-icon-color: {$attributes['searchBtnIconColorHover']}; }";
        }
        if ( ! empty( $attributes['searchBtnBackgroundColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-search-btn:hover { background: {$attributes['searchBtnBackgroundColorHover']}; }";
        }
        if ( ! empty( $attributes['searchBtnBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-submit.ts-form-group button.ts-search-btn:hover { border-color: {$attributes['searchBtnBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['searchBtnBoxShadowHover'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['searchBtnBoxShadowHover'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-search-btn:hover { box-shadow: {$shadow}; }";
            }
        }

        // ============================================
        // INLINE TAB - Section 1: Terms: Inline
        // Source: search-form.php:1811, 1823, 1843, 1868, 1889
        // Selectors: .inline-multilevel li > a span
        // ============================================

        // Normal state - Title
        if ( ! empty( $attributes['termsInlineTitleColor'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li > a span { color: {$attributes['termsInlineTitleColor']}; }";
        }
        if ( ! empty( $attributes['termsInlineTitleTypographyNormal'] ) ) {
            $typo = self::generate_typography_css( $attributes['termsInlineTitleTypographyNormal'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .inline-multilevel li > a span { {$typo}; }";
            }
        }

        // Normal state - Icon (Voxel uses CSS custom property --ts-icon-color)
        if ( ! empty( $attributes['termsInlineIconColor'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel .ts-term-icon { --ts-icon-color: {$attributes['termsInlineIconColor']}; }";
        }
        // Icon size
        if ( isset( $attributes['termsInlineIconSize'] ) && $attributes['termsInlineIconSize'] !== '' ) {
            $unit = $attributes['termsInlineIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .inline-multilevel .ts-term-icon { --ts-icon-size: {$attributes['termsInlineIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['termsInlineIconSize_tablet'] ) && $attributes['termsInlineIconSize_tablet'] !== '' ) {
            $unit = $attributes['termsInlineIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .inline-multilevel .ts-term-icon { --ts-icon-size: {$attributes['termsInlineIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['termsInlineIconSize_mobile'] ) && $attributes['termsInlineIconSize_mobile'] !== '' ) {
            $unit = $attributes['termsInlineIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .inline-multilevel .ts-term-icon { --ts-icon-size: {$attributes['termsInlineIconSize_mobile']}{$unit}; }";
        }

        // Inner gap (grid-gap on li > a)
        if ( isset( $attributes['termsInlineInnerGap'] ) && $attributes['termsInlineInnerGap'] !== '' ) {
            $css_rules[] = "{$selector} .inline-multilevel li > a { grid-gap: {$attributes['termsInlineInnerGap']}px; }";
        }
        if ( isset( $attributes['termsInlineInnerGap_tablet'] ) && $attributes['termsInlineInnerGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .inline-multilevel li > a { grid-gap: {$attributes['termsInlineInnerGap_tablet']}px; }";
        }
        if ( isset( $attributes['termsInlineInnerGap_mobile'] ) && $attributes['termsInlineInnerGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .inline-multilevel li > a { grid-gap: {$attributes['termsInlineInnerGap_mobile']}px; }";
        }

        // Chevron color
        if ( ! empty( $attributes['termsInlineChevronColor'] ) ) {
            $css_rules[] = "{$selector} .ts-right-icon, {$selector} .ts-left-icon { border-color: {$attributes['termsInlineChevronColor']}; }";
        }

        // Hover state
        if ( ! empty( $attributes['termsInlineTitleColorHover'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li > a:hover span { color: {$attributes['termsInlineTitleColorHover']}; }";
        }
        if ( ! empty( $attributes['termsInlineIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li > a:hover .ts-term-icon { --ts-icon-color: {$attributes['termsInlineIconColorHover']}; }";
        }
        if ( ! empty( $attributes['termsInlineChevronColorHover'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li > a:hover .ts-right-icon, {$selector} .inline-multilevel li > a:hover .ts-left-icon { border-color: {$attributes['termsInlineChevronColorHover']}; }";
        }

        // Selected state
        if ( ! empty( $attributes['termsInlineTitleColorSelected'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li.ts-selected > a span { color: {$attributes['termsInlineTitleColorSelected']}; }";
        }
        if ( ! empty( $attributes['termsInlineTitleTypographySelected'] ) ) {
            $typo = self::generate_typography_css( $attributes['termsInlineTitleTypographySelected'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .inline-multilevel li.ts-selected > a span { {$typo}; }";
            }
        }
        if ( ! empty( $attributes['termsInlineIconColorSelected'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li.ts-selected > a .ts-term-icon { --ts-icon-color: {$attributes['termsInlineIconColorSelected']}; }";
        }
        if ( ! empty( $attributes['termsInlineChevronColorSelected'] ) ) {
            $css_rules[] = "{$selector} .inline-multilevel li.ts-selected > a .ts-right-icon, {$selector} .inline-multilevel li.ts-selected > a .ts-left-icon { border-color: {$attributes['termsInlineChevronColorSelected']}; }";
        }

        // ============================================
        // INLINE TAB - Section 2: Terms: Buttons
        // Source: search-form.php:2049, 2060, 2072, 2090, 2102, 2112, 2139
        // Selectors: .addon-buttons li
        // ============================================

        if ( isset( $attributes['termsButtonsGap'] ) && $attributes['termsButtonsGap'] !== '' ) {
            $css_rules[] = "{$selector} .addon-buttons { grid-gap: {$attributes['termsButtonsGap']}px; }";
        }
        if ( isset( $attributes['termsButtonsGap_tablet'] ) && $attributes['termsButtonsGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .addon-buttons { grid-gap: {$attributes['termsButtonsGap_tablet']}px; }";
        }
        if ( isset( $attributes['termsButtonsGap_mobile'] ) && $attributes['termsButtonsGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .addon-buttons { grid-gap: {$attributes['termsButtonsGap_mobile']}px; }";
        }

        if ( ! empty( $attributes['termsButtonsBackground'] ) ) {
            $css_rules[] = "{$selector} .addon-buttons li { background: {$attributes['termsButtonsBackground']}; }";
        }
        // Border type
        if ( ! empty( $attributes['termsButtonsBorderType'] ) && $attributes['termsButtonsBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .addon-buttons li { border-style: {$attributes['termsButtonsBorderType']}; }";
        }
        if ( isset( $attributes['termsButtonsBorderType'] ) && $attributes['termsButtonsBorderType'] === 'none' ) {
            $css_rules[] = "{$selector} .addon-buttons li { border: none; }";
        }
        // Border radius
        if ( isset( $attributes['termsButtonsBorderRadius'] ) && $attributes['termsButtonsBorderRadius'] !== '' ) {
            $css_rules[] = "{$selector} .addon-buttons li { border-radius: {$attributes['termsButtonsBorderRadius']}px; }";
        }
        if ( isset( $attributes['termsButtonsBorderRadius_tablet'] ) && $attributes['termsButtonsBorderRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .addon-buttons li { border-radius: {$attributes['termsButtonsBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['termsButtonsBorderRadius_mobile'] ) && $attributes['termsButtonsBorderRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .addon-buttons li { border-radius: {$attributes['termsButtonsBorderRadius_mobile']}px; }";
        }
        if ( ! empty( $attributes['termsButtonsTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['termsButtonsTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .addon-buttons li { {$typo}; }";
            }
        }
        if ( ! empty( $attributes['termsButtonsTextColor'] ) ) {
            $css_rules[] = "{$selector} .addon-buttons li { color: {$attributes['termsButtonsTextColor']}; }";
        }

        // Selected state (Voxel uses .adb-selected class)
        if ( ! empty( $attributes['termsButtonsBackgroundSelected'] ) ) {
            $css_rules[] = "{$selector} .addon-buttons li.adb-selected { background: {$attributes['termsButtonsBackgroundSelected']}; }";
        }
        if ( ! empty( $attributes['termsButtonsColorSelected'] ) ) {
            $css_rules[] = "{$selector} .addon-buttons li.adb-selected { color: {$attributes['termsButtonsColorSelected']}; }";
        }
        if ( ! empty( $attributes['termsButtonsBorderColorSelected'] ) ) {
            $css_rules[] = "{$selector} .addon-buttons li.adb-selected { border-color: {$attributes['termsButtonsBorderColorSelected']}; }";
        }
        if ( ! empty( $attributes['termsButtonsBoxShadowSelected'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['termsButtonsBoxShadowSelected'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .addon-buttons li.adb-selected { box-shadow: {$shadow}; }";
            }
        }

        // ============================================
        // INLINE TAB - Section 3: Geolocation Icon
        // Source: search-form.php:2225, 2257, 2268, 2293, 2304, 2315, 2337, 2364
        // Selectors: .inline-user-location
        // ============================================

        if ( isset( $attributes['geoIconRightMargin'] ) && $attributes['geoIconRightMargin'] !== '' ) {
            $css_rules[] = "{$selector} .inline-user-location { right: {$attributes['geoIconRightMargin']}px; }";
        }
        if ( isset( $attributes['geoIconRightMargin_tablet'] ) && $attributes['geoIconRightMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .inline-user-location { right: {$attributes['geoIconRightMargin_tablet']}px; }";
        }
        if ( isset( $attributes['geoIconRightMargin_mobile'] ) && $attributes['geoIconRightMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .inline-user-location { right: {$attributes['geoIconRightMargin_mobile']}px; }";
        }

        if ( isset( $attributes['geoIconButtonSize'] ) && $attributes['geoIconButtonSize'] !== '' ) {
            $unit = $attributes['geoIconButtonSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .inline-user-location { width: {$attributes['geoIconButtonSize']}{$unit}; height: {$attributes['geoIconButtonSize']}{$unit}; }";
        }
        if ( isset( $attributes['geoIconButtonSize_tablet'] ) && $attributes['geoIconButtonSize_tablet'] !== '' ) {
            $unit = $attributes['geoIconButtonSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .inline-user-location { width: {$attributes['geoIconButtonSize_tablet']}{$unit}; height: {$attributes['geoIconButtonSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['geoIconButtonSize_mobile'] ) && $attributes['geoIconButtonSize_mobile'] !== '' ) {
            $unit = $attributes['geoIconButtonSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .inline-user-location { width: {$attributes['geoIconButtonSize_mobile']}{$unit}; height: {$attributes['geoIconButtonSize_mobile']}{$unit}; }";
        }

        if ( ! empty( $attributes['geoIconButtonBackground'] ) ) {
            $css_rules[] = "{$selector} .inline-user-location { background-color: {$attributes['geoIconButtonBackground']}; }";
        }
        // Border type
        if ( ! empty( $attributes['geoIconButtonBorderType'] ) && $attributes['geoIconButtonBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .inline-user-location { border-style: {$attributes['geoIconButtonBorderType']}; }";
        }
        if ( isset( $attributes['geoIconButtonBorderType'] ) && $attributes['geoIconButtonBorderType'] === 'none' ) {
            $css_rules[] = "{$selector} .inline-user-location { border: none; }";
        }
        // Border radius
        if ( isset( $attributes['geoIconButtonBorderRadius'] ) && $attributes['geoIconButtonBorderRadius'] !== '' ) {
            $unit = $attributes['geoIconButtonBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .inline-user-location { border-radius: {$attributes['geoIconButtonBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['geoIconButtonBorderRadius_tablet'] ) && $attributes['geoIconButtonBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['geoIconButtonBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .inline-user-location { border-radius: {$attributes['geoIconButtonBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['geoIconButtonBorderRadius_mobile'] ) && $attributes['geoIconButtonBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['geoIconButtonBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .inline-user-location { border-radius: {$attributes['geoIconButtonBorderRadius_mobile']}{$unit}; }";
        }
        // Icon color
        if ( ! empty( $attributes['geoIconButtonIconColor'] ) ) {
            $css_rules[] = "{$selector} .inline-user-location { --ts-icon-color: {$attributes['geoIconButtonIconColor']}; }";
        }
        // Icon size
        if ( isset( $attributes['geoIconButtonIconSize'] ) && $attributes['geoIconButtonIconSize'] !== '' ) {
            $unit = $attributes['geoIconButtonIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .inline-user-location { --ts-icon-size: {$attributes['geoIconButtonIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['geoIconButtonIconSize_tablet'] ) && $attributes['geoIconButtonIconSize_tablet'] !== '' ) {
            $unit = $attributes['geoIconButtonIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .inline-user-location { --ts-icon-size: {$attributes['geoIconButtonIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['geoIconButtonIconSize_mobile'] ) && $attributes['geoIconButtonIconSize_mobile'] !== '' ) {
            $unit = $attributes['geoIconButtonIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .inline-user-location { --ts-icon-size: {$attributes['geoIconButtonIconSize_mobile']}{$unit}; }";
        }

        // Hover state
        if ( ! empty( $attributes['geoIconButtonBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} .inline-user-location:hover { background-color: {$attributes['geoIconButtonBackgroundHover']}; }";
        }
        if ( ! empty( $attributes['geoIconButtonBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .inline-user-location:hover { border-color: {$attributes['geoIconButtonBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['geoIconButtonIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .inline-user-location:hover { --ts-icon-color: {$attributes['geoIconButtonIconColorHover']}; }";
        }

        // ============================================
        // INLINE TAB - Section 4: Stepper
        // Source: search-form.php:2439
        // Selectors: .ts-inline-filter .ts-stepper-input input
        // ============================================

        if ( isset( $attributes['stepperInputValueSize'] ) && $attributes['stepperInputValueSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .ts-stepper-input input { font-size: {$attributes['stepperInputValueSize']}px; }";
        }
        if ( isset( $attributes['stepperInputValueSize_tablet'] ) && $attributes['stepperInputValueSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-inline-filter .ts-stepper-input input { font-size: {$attributes['stepperInputValueSize_tablet']}px; }";
        }
        if ( isset( $attributes['stepperInputValueSize_mobile'] ) && $attributes['stepperInputValueSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-inline-filter .ts-stepper-input input { font-size: {$attributes['stepperInputValueSize_mobile']}px; }";
        }

        // ============================================
        // INLINE TAB - Section 5: Stepper Buttons
        // Source: search-form.php:2497, 2508, 2533, 2544
        // Selectors: .ts-icon-btn.inline-btn-ts
        // ============================================

        if ( isset( $attributes['stepperButtonsSize'] ) && $attributes['stepperButtonsSize'] !== '' ) {
            $unit = $attributes['stepperButtonsSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { width: {$attributes['stepperButtonsSize']}{$unit}; height: {$attributes['stepperButtonsSize']}{$unit}; }";
        }
        if ( isset( $attributes['stepperButtonsSize_tablet'] ) && $attributes['stepperButtonsSize_tablet'] !== '' ) {
            $unit = $attributes['stepperButtonsSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { width: {$attributes['stepperButtonsSize_tablet']}{$unit}; height: {$attributes['stepperButtonsSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['stepperButtonsSize_mobile'] ) && $attributes['stepperButtonsSize_mobile'] !== '' ) {
            $unit = $attributes['stepperButtonsSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { width: {$attributes['stepperButtonsSize_mobile']}{$unit}; height: {$attributes['stepperButtonsSize_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['stepperButtonsIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { --ts-icon-color: {$attributes['stepperButtonsIconColor']}; }";
        }
        if ( isset( $attributes['stepperButtonsIconSize'] ) && $attributes['stepperButtonsIconSize'] !== '' ) {
            $unit = $attributes['stepperButtonsIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { --ts-icon-size: {$attributes['stepperButtonsIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['stepperButtonsIconSize_tablet'] ) && $attributes['stepperButtonsIconSize_tablet'] !== '' ) {
            $unit = $attributes['stepperButtonsIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { --ts-icon-size: {$attributes['stepperButtonsIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['stepperButtonsIconSize_mobile'] ) && $attributes['stepperButtonsIconSize_mobile'] !== '' ) {
            $unit = $attributes['stepperButtonsIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { --ts-icon-size: {$attributes['stepperButtonsIconSize_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['stepperButtonsBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { background-color: {$attributes['stepperButtonsBackground']}; }";
        }
        // Border type
        if ( ! empty( $attributes['stepperButtonsBorderType'] ) && $attributes['stepperButtonsBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { border-style: {$attributes['stepperButtonsBorderType']}; }";
        }
        if ( isset( $attributes['stepperButtonsBorderType'] ) && $attributes['stepperButtonsBorderType'] === 'none' ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { border: none; }";
        }
        // Border radius
        if ( isset( $attributes['stepperButtonsBorderRadius'] ) && $attributes['stepperButtonsBorderRadius'] !== '' ) {
            $unit = $attributes['stepperButtonsBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { border-radius: {$attributes['stepperButtonsBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['stepperButtonsBorderRadius_tablet'] ) && $attributes['stepperButtonsBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['stepperButtonsBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { border-radius: {$attributes['stepperButtonsBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['stepperButtonsBorderRadius_mobile'] ) && $attributes['stepperButtonsBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['stepperButtonsBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts { border-radius: {$attributes['stepperButtonsBorderRadius_mobile']}{$unit}; }";
        }

        // Hover state
        if ( ! empty( $attributes['stepperButtonsIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts:hover { --ts-icon-color: {$attributes['stepperButtonsIconColorHover']}; }";
        }
        if ( ! empty( $attributes['stepperButtonsBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts:hover { background-color: {$attributes['stepperButtonsBackgroundHover']}; }";
        }
        if ( ! empty( $attributes['stepperButtonsBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.inline-btn-ts:hover { border-color: {$attributes['stepperButtonsBorderColorHover']}; }";
        }

        // ============================================
        // INLINE TAB - Section 6: Range Slider
        // Source: search-form.php:2678, 2702, 2715, 2728
        // Selectors: .ts-inline-filter .noUi-*
        // ============================================

        if ( isset( $attributes['rangeValueSize'] ) && $attributes['rangeValueSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .range-slider-wrapper .range-value { font-size: {$attributes['rangeValueSize']}px; }";
        }
        if ( isset( $attributes['rangeValueSize_tablet'] ) && $attributes['rangeValueSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-inline-filter .range-slider-wrapper .range-value { font-size: {$attributes['rangeValueSize_tablet']}px; }";
        }
        if ( isset( $attributes['rangeValueSize_mobile'] ) && $attributes['rangeValueSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-inline-filter .range-slider-wrapper .range-value { font-size: {$attributes['rangeValueSize_mobile']}px; }";
        }
        if ( ! empty( $attributes['rangeValueColor'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .range-slider-wrapper .range-value { color: {$attributes['rangeValueColor']}; }";
        }
        // Track background
        if ( ! empty( $attributes['rangeBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .noUi-target { background-color: {$attributes['rangeBackground']}; }";
        }
        // Selected portion background
        if ( ! empty( $attributes['rangeSelectedBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .noUi-connect { background-color: {$attributes['rangeSelectedBackground']}; }";
        }
        // Handle background
        if ( ! empty( $attributes['rangeHandleBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .noUi-handle { background-color: {$attributes['rangeHandleBackground']}; }";
        }
        // Border type
        if ( ! empty( $attributes['rangeBorderType'] ) && $attributes['rangeBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .noUi-handle { border-style: {$attributes['rangeBorderType']}; }";
        }
        if ( isset( $attributes['rangeBorderType'] ) && $attributes['rangeBorderType'] === 'none' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .noUi-handle { border: none; }";
        }

        // ============================================
        // INLINE TAB - Section 7: Switcher on/off
        // Source: search-form.php:2767, 2780, 2793
        // Selectors: .ts-inline-filter .onoffswitch
        // ============================================

        // Inactive background
        if ( ! empty( $attributes['switcherBackgroundInactive'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .onoffswitch .onoffswitch-label { background-color: {$attributes['switcherBackgroundInactive']}; }";
        }
        // Active background
        if ( ! empty( $attributes['switcherBackgroundActive'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .onoffswitch .onoffswitch-checkbox:checked + .onoffswitch-label { background-color: {$attributes['switcherBackgroundActive']}; }";
        }
        // Handle background
        if ( ! empty( $attributes['switcherHandleBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .onoffswitch .onoffswitch-label:before { background-color: {$attributes['switcherHandleBackground']}; }";
        }

        // ============================================
        // INLINE TAB - Section 8: Checkbox
        // Source: search-form.php:2826
        // Selectors: .ts-inline-filter .container-checkbox .checkmark
        // ============================================

        if ( isset( $attributes['checkboxSize'] ) && $attributes['checkboxSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { width: {$attributes['checkboxSize']}px; height: {$attributes['checkboxSize']}px; min-width: {$attributes['checkboxSize']}px; }";
        }
        if ( isset( $attributes['checkboxSize_tablet'] ) && $attributes['checkboxSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { width: {$attributes['checkboxSize_tablet']}px; height: {$attributes['checkboxSize_tablet']}px; min-width: {$attributes['checkboxSize_tablet']}px; }";
        }
        if ( isset( $attributes['checkboxSize_mobile'] ) && $attributes['checkboxSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { width: {$attributes['checkboxSize_mobile']}px; height: {$attributes['checkboxSize_mobile']}px; min-width: {$attributes['checkboxSize_mobile']}px; }";
        }
        // Border radius
        if ( isset( $attributes['checkboxRadius'] ) && $attributes['checkboxRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { border-radius: {$attributes['checkboxRadius']}px; }";
        }
        if ( isset( $attributes['checkboxRadius_tablet'] ) && $attributes['checkboxRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { border-radius: {$attributes['checkboxRadius_tablet']}px; }";
        }
        if ( isset( $attributes['checkboxRadius_mobile'] ) && $attributes['checkboxRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { border-radius: {$attributes['checkboxRadius_mobile']}px; }";
        }
        // Border type
        if ( ! empty( $attributes['checkboxBorderType'] ) && $attributes['checkboxBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { border-style: {$attributes['checkboxBorderType']}; }";
        }
        if ( isset( $attributes['checkboxBorderType'] ) && $attributes['checkboxBorderType'] === 'none' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { border: none; }";
        }
        // Unchecked background
        if ( ! empty( $attributes['checkboxBackgroundUnchecked'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox .checkmark { background-color: {$attributes['checkboxBackgroundUnchecked']}; }";
        }
        // Checked background
        if ( ! empty( $attributes['checkboxBackgroundChecked'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox input:checked ~ .checkmark { background-color: {$attributes['checkboxBackgroundChecked']}; }";
        }
        // Checked border color
        if ( ! empty( $attributes['checkboxBorderColorChecked'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-checkbox input:checked ~ .checkmark { border-color: {$attributes['checkboxBorderColorChecked']}; }";
        }

        // ============================================
        // INLINE TAB - Section 9: Radio
        // Source: search-form.php:2923
        // Selectors: .ts-inline-filter .container-radio .checkmark
        // ============================================

        if ( isset( $attributes['radioSize'] ) && $attributes['radioSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { width: {$attributes['radioSize']}px; height: {$attributes['radioSize']}px; min-width: {$attributes['radioSize']}px; }";
        }
        if ( isset( $attributes['radioSize_tablet'] ) && $attributes['radioSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { width: {$attributes['radioSize_tablet']}px; height: {$attributes['radioSize_tablet']}px; min-width: {$attributes['radioSize_tablet']}px; }";
        }
        if ( isset( $attributes['radioSize_mobile'] ) && $attributes['radioSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { width: {$attributes['radioSize_mobile']}px; height: {$attributes['radioSize_mobile']}px; min-width: {$attributes['radioSize_mobile']}px; }";
        }
        // Border radius
        if ( isset( $attributes['radioRadius'] ) && $attributes['radioRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { border-radius: {$attributes['radioRadius']}px; }";
        }
        if ( isset( $attributes['radioRadius_tablet'] ) && $attributes['radioRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { border-radius: {$attributes['radioRadius_tablet']}px; }";
        }
        if ( isset( $attributes['radioRadius_mobile'] ) && $attributes['radioRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { border-radius: {$attributes['radioRadius_mobile']}px; }";
        }
        // Border type
        if ( ! empty( $attributes['radioBorderType'] ) && $attributes['radioBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { border-style: {$attributes['radioBorderType']}; }";
        }
        if ( isset( $attributes['radioBorderType'] ) && $attributes['radioBorderType'] === 'none' ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { border: none; }";
        }
        // Unchecked background
        if ( ! empty( $attributes['radioBackgroundUnchecked'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio .checkmark { background-color: {$attributes['radioBackgroundUnchecked']}; }";
        }
        // Checked background
        if ( ! empty( $attributes['radioBackgroundChecked'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio input:checked ~ .checkmark { background-color: {$attributes['radioBackgroundChecked']}; }";
        }
        // Checked border color
        if ( ! empty( $attributes['radioBorderColorChecked'] ) ) {
            $css_rules[] = "{$selector} .ts-inline-filter .container-radio input:checked ~ .checkmark { border-color: {$attributes['radioBorderColorChecked']}; }";
        }

        // ============================================
        // INLINE TAB - Section 10: Input
        // Source: search-form.php:1470-1598
        // Selectors: .ts-form-group input, .ts-form-group textarea
        // ============================================

        if ( ! empty( $attributes['inputTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group input, {$selector} .ts-form-group textarea { color: {$attributes['inputTextColor']}; }";
        }
        if ( ! empty( $attributes['inputPlaceholderColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group input::placeholder, {$selector} .ts-form-group textarea::placeholder { color: {$attributes['inputPlaceholderColor']}; opacity: 1; }";
        }
        if ( ! empty( $attributes['inputPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['inputPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .ts-form-group input, {$selector} .ts-form-group textarea { {$padding}; }";
            }
        }
        if ( ! empty( $attributes['inputPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['inputPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$selector} .ts-form-group input, {$selector} .ts-form-group textarea { {$padding}; }";
            }
        }
        if ( ! empty( $attributes['inputPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['inputPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$selector} .ts-form-group input, {$selector} .ts-form-group textarea { {$padding}; }";
            }
        }
        // Icon side margin
        if ( isset( $attributes['inputIconSideMargin'] ) && $attributes['inputIconSideMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-input-icon > span { margin-right: {$attributes['inputIconSideMargin']}px; }";
        }
        if ( isset( $attributes['inputIconSideMargin_tablet'] ) && $attributes['inputIconSideMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-group .ts-input-icon > span { margin-right: {$attributes['inputIconSideMargin_tablet']}px; }";
        }
        if ( isset( $attributes['inputIconSideMargin_mobile'] ) && $attributes['inputIconSideMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-group .ts-input-icon > span { margin-right: {$attributes['inputIconSideMargin_mobile']}px; }";
        }
        // Focus state
        if ( ! empty( $attributes['inputBackgroundColorFocus'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group input:focus, {$selector} .ts-form-group textarea:focus { background-color: {$attributes['inputBackgroundColorFocus']} !important; }";
        }
        if ( ! empty( $attributes['inputBorderColorFocus'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group input:focus, {$selector} .ts-form-group textarea:focus { border-color: {$attributes['inputBorderColorFocus']} !important; }";
        }
        if ( ! empty( $attributes['inputBoxShadowFocus'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['inputBoxShadowFocus'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-form-group input:focus, {$selector} .ts-form-group textarea:focus { box-shadow: {$shadow} !important; }";
            }
        }

        // ============================================
        // INLINE TAB - Section 11: Toggle Button / Switcher
        // Source: search-form.php:2996-3284
        // Selectors: .ts-form-group .ts-switcher li, .ts-filter-toggle
        // ============================================

        // Default styles
        $css_rules[] = "{$selector} a.ts-filter-toggle.ts-btn { text-decoration: none; }";
        $css_rules[] = "{$selector} .ts-form-group .ts-switcher li { text-decoration: none; }";

        $toggle_selector = "{$selector} .ts-form-group .ts-switcher li, {$selector} .ts-filter-toggle";

        if ( ! empty( $attributes['toggleBtnTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['toggleBtnTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$toggle_selector} { {$typo}; }";
            }
        }
        if ( isset( $attributes['toggleBtnSize'] ) && $attributes['toggleBtnSize'] !== '' ) {
            $css_rules[] = "{$toggle_selector} { height: {$attributes['toggleBtnSize']}px; display: flex; align-items: center; justify-content: center; }";
        }
        if ( isset( $attributes['toggleBtnSize_tablet'] ) && $attributes['toggleBtnSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$toggle_selector} { height: {$attributes['toggleBtnSize_tablet']}px; }";
        }
        if ( isset( $attributes['toggleBtnSize_mobile'] ) && $attributes['toggleBtnSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$toggle_selector} { height: {$attributes['toggleBtnSize_mobile']}px; }";
        }
        if ( ! empty( $attributes['toggleBtnPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['toggleBtnPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$toggle_selector} { {$padding}; }";
            }
        }
        if ( ! empty( $attributes['toggleBtnPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['toggleBtnPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$toggle_selector} { {$padding}; }";
            }
        }
        if ( ! empty( $attributes['toggleBtnPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['toggleBtnPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$toggle_selector} { {$padding}; }";
            }
        }
        // Border radius
        if ( isset( $attributes['toggleBtnBorderRadius'] ) && $attributes['toggleBtnBorderRadius'] !== '' ) {
            $unit = $attributes['toggleBtnBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$toggle_selector} { border-radius: {$attributes['toggleBtnBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['toggleBtnBorderRadius_tablet'] ) && $attributes['toggleBtnBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['toggleBtnBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$toggle_selector} { border-radius: {$attributes['toggleBtnBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['toggleBtnBorderRadius_mobile'] ) && $attributes['toggleBtnBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['toggleBtnBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$toggle_selector} { border-radius: {$attributes['toggleBtnBorderRadius_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['toggleBtnTextColor'] ) ) {
            $css_rules[] = "{$toggle_selector} { color: {$attributes['toggleBtnTextColor']}; }";
        }
        // Icon color
        if ( ! empty( $attributes['toggleBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li i, {$selector} .ts-form-group .ts-switcher li svg, {$selector} .ts-filter-toggle svg { color: {$attributes['toggleBtnIconColor']}; fill: {$attributes['toggleBtnIconColor']}; }";
        }
        // Icon size
        if ( isset( $attributes['toggleBtnIconSize'] ) && $attributes['toggleBtnIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li i, {$selector} .ts-form-group .ts-switcher li svg, {$selector} .ts-filter-toggle svg { width: {$attributes['toggleBtnIconSize']}px; height: {$attributes['toggleBtnIconSize']}px; font-size: {$attributes['toggleBtnIconSize']}px; }";
        }
        if ( isset( $attributes['toggleBtnIconSize_tablet'] ) && $attributes['toggleBtnIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-group .ts-switcher li i, {$selector} .ts-form-group .ts-switcher li svg, {$selector} .ts-filter-toggle svg { width: {$attributes['toggleBtnIconSize_tablet']}px; height: {$attributes['toggleBtnIconSize_tablet']}px; font-size: {$attributes['toggleBtnIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['toggleBtnIconSize_mobile'] ) && $attributes['toggleBtnIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-group .ts-switcher li i, {$selector} .ts-form-group .ts-switcher li svg, {$selector} .ts-filter-toggle svg { width: {$attributes['toggleBtnIconSize_mobile']}px; height: {$attributes['toggleBtnIconSize_mobile']}px; font-size: {$attributes['toggleBtnIconSize_mobile']}px; }";
        }
        // Icon spacing
        if ( isset( $attributes['toggleBtnIconSpacing'] ) && $attributes['toggleBtnIconSpacing'] !== '' ) {
            $css_rules[] = "{$toggle_selector} { grid-gap: {$attributes['toggleBtnIconSpacing']}px; gap: {$attributes['toggleBtnIconSpacing']}px; }";
        }
        if ( isset( $attributes['toggleBtnIconSpacing_tablet'] ) && $attributes['toggleBtnIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$toggle_selector} { grid-gap: {$attributes['toggleBtnIconSpacing_tablet']}px; gap: {$attributes['toggleBtnIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['toggleBtnIconSpacing_mobile'] ) && $attributes['toggleBtnIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$toggle_selector} { grid-gap: {$attributes['toggleBtnIconSpacing_mobile']}px; gap: {$attributes['toggleBtnIconSpacing_mobile']}px; }";
        }
        if ( ! empty( $attributes['toggleBtnBackgroundColor'] ) ) {
            $css_rules[] = "{$toggle_selector} { background-color: {$attributes['toggleBtnBackgroundColor']}; }";
        }
        if ( ! empty( $attributes['toggleBtnBorder'] ) ) {
            $border = self::generate_border_css( $attributes['toggleBtnBorder'] );
            if ( $border ) {
                $css_rules[] = "{$toggle_selector} { border: {$border}; }";
            }
        }
        if ( ! empty( $attributes['toggleBtnSeparatorColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li:not(:last-child) { border-right-color: {$attributes['toggleBtnSeparatorColor']}; }";
        }
        if ( ! empty( $attributes['toggleBtnBoxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['toggleBtnBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$toggle_selector} { box-shadow: {$shadow}; }";
            }
        }

        // Hover state
        if ( ! empty( $attributes['toggleBtnTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li:hover, {$selector} .ts-filter-toggle:hover { color: {$attributes['toggleBtnTextColorHover']}; }";
        }
        if ( ! empty( $attributes['toggleBtnIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li:hover i, {$selector} .ts-form-group .ts-switcher li:hover svg, {$selector} .ts-filter-toggle:hover svg { color: {$attributes['toggleBtnIconColorHover']}; fill: {$attributes['toggleBtnIconColorHover']}; }";
        }
        if ( ! empty( $attributes['toggleBtnBackgroundColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li:hover, {$selector} .ts-filter-toggle:hover { background-color: {$attributes['toggleBtnBackgroundColorHover']}; }";
        }
        if ( ! empty( $attributes['toggleBtnBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group .ts-switcher li:hover, {$selector} .ts-filter-toggle:hover { border-color: {$attributes['toggleBtnBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['toggleBtnBoxShadowHover'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['toggleBtnBoxShadowHover'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-form-group .ts-switcher li:hover, {$selector} .ts-filter-toggle:hover { box-shadow: {$shadow}; }";
            }
        }

        // Filled (Active) state
        $active_selector = "{$selector} .ts-form-group .ts-switcher li.ts-active, {$selector} .ts-filter-toggle[aria-expanded=\"true\"]";
        if ( ! empty( $attributes['toggleBtnTextColorFilled'] ) ) {
            $css_rules[] = "{$active_selector} { color: {$attributes['toggleBtnTextColorFilled']}; }";
        }
        if ( ! empty( $attributes['toggleBtnIconColorFilled'] ) ) {
            $css_rules[] = "{$active_selector} i, {$active_selector} svg { color: {$attributes['toggleBtnIconColorFilled']}; fill: {$attributes['toggleBtnIconColorFilled']}; }";
        }
        $bg_filled = $attributes['toggleBtnBackgroundColorFilled'] ?? ( $attributes['toggleBtnBackgroundFilled'] ?? null );
        if ( ! empty( $bg_filled ) ) {
            $css_rules[] = "{$active_selector} { background-color: {$bg_filled}; }";
        }
        if ( ! empty( $attributes['toggleBtnBorderColorFilled'] ) ) {
            $css_rules[] = "{$active_selector} { border-color: {$attributes['toggleBtnBorderColorFilled']}; }";
        }
        if ( ! empty( $attributes['toggleBtnBoxShadowFilled'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['toggleBtnBoxShadowFilled'] );
            if ( $shadow ) {
                $css_rules[] = "{$active_selector} { box-shadow: {$shadow}; }";
            }
        }

        // ============================================
        // INLINE TAB - Section 12: Toggle: Active Count
        // Source: search-form.php:3367-3422
        // Selectors: .ts-filter-count
        // ============================================

        if ( ! empty( $attributes['activeCountTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-filter-count { color: {$attributes['activeCountTextColor']}; }";
        }
        if ( ! empty( $attributes['activeCountBackgroundColor'] ) ) {
            $css_rules[] = "{$selector} .ts-filter-count { background: {$attributes['activeCountBackgroundColor']}; }";
        }
        if ( isset( $attributes['activeCountRightMargin'] ) && $attributes['activeCountRightMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ts-filter-count { right: {$attributes['activeCountRightMargin']}px; }";
        }
        if ( isset( $attributes['activeCountRightMargin_tablet'] ) && $attributes['activeCountRightMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-filter-count { right: {$attributes['activeCountRightMargin_tablet']}px; }";
        }
        if ( isset( $attributes['activeCountRightMargin_mobile'] ) && $attributes['activeCountRightMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-filter-count { right: {$attributes['activeCountRightMargin_mobile']}px; }";
        }

        // ============================================
        // INLINE TAB - Section 13: Term Count
        // Source: search-form.php:3778-3810
        // Selectors: .ts-term-count
        // ============================================

        if ( ! empty( $attributes['termCountNumberColor'] ) ) {
            $css_rules[] = "{$selector} .ts-term-count { color: {$attributes['termCountNumberColor']}; }";
        }
        if ( ! empty( $attributes['termCountBorderColor'] ) ) {
            $css_rules[] = "{$selector} .ts-term-count { border-color: {$attributes['termCountBorderColor']}; }";
        }

        // ============================================
        // INLINE TAB - Section 14: Other (Max Filter Width, Min Input Width)
        // Source: search-form.php:3818-3878
        // ============================================

        // Max filter width
        if ( isset( $attributes['maxFilterWidth'] ) && $attributes['maxFilterWidth'] !== '' ) {
            $unit = $attributes['maxFilterWidthUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-filter { max-width: {$attributes['maxFilterWidth']}{$unit}; }";
        }
        if ( isset( $attributes['maxFilterWidth_tablet'] ) && $attributes['maxFilterWidth_tablet'] !== '' ) {
            $unit = $attributes['maxFilterWidthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-filter { max-width: {$attributes['maxFilterWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['maxFilterWidth_mobile'] ) && $attributes['maxFilterWidth_mobile'] !== '' ) {
            $unit = $attributes['maxFilterWidthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-filter { max-width: {$attributes['maxFilterWidth_mobile']}{$unit}; }";
        }

        // Min input width
        if ( isset( $attributes['minInputWidth'] ) && $attributes['minInputWidth'] !== '' ) {
            $unit = $attributes['minInputWidthUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-inline-filter { min-width: {$attributes['minInputWidth']}{$unit}; }";
        }
        if ( isset( $attributes['minInputWidth_tablet'] ) && $attributes['minInputWidth_tablet'] !== '' ) {
            $unit = $attributes['minInputWidthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-inline-filter { min-width: {$attributes['minInputWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['minInputWidth_mobile'] ) && $attributes['minInputWidth_mobile'] !== '' ) {
            $unit = $attributes['minInputWidthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-inline-filter { min-width: {$attributes['minInputWidth_mobile']}{$unit}; }";
        }

        // ============================================
        // PORTAL/POPUP CSS - Section 1: Popups: Custom Style
        // Source: search-form.php:3880-3960
        // Target: Portal elements (scoped via voxel-popup-{blockId} class)
        // CRITICAL: Popups render at document.body via React Portal, so use
        // popupSelector (.voxel-popup-{blockId}) not block selector
        // ============================================

        // $popup_selector already defined at top of method
        $portal_selector = '.voxel-fse-search-form-' . $block_id . '.ts-search-portal';
        $combined_popup_selector = ":is({$portal_selector}, {$popup_selector})";

        if ( ! empty( $attributes['popupCustomStyleEnabled'] ) ) {
            // Backdrop background
            // Selector: .ts-popup-root > div::after (NOT .ts-popup-root::after)
            if ( ! empty( $attributes['popupBackdropBackground'] ) ) {
                $css_rules[] = "{$combined_popup_selector} .ts-popup-root > div::after { background-color: {$attributes['popupBackdropBackground']} !important; }";
            }

            // Backdrop pointer events
            if ( ! empty( $attributes['popupBackdropPointerEvents'] ) ) {
                $css_rules[] = "{$combined_popup_selector} .ts-popup-root > div::after { pointer-events: all; }";
            }

            // Box shadow
            if ( ! empty( $attributes['popupBoxShadow'] ) ) {
                $shadow = self::generate_box_shadow_css( $attributes['popupBoxShadow'] );
                if ( $shadow ) {
                    $css_rules[] = "{$combined_popup_selector} .ts-field-popup { box-shadow: {$shadow}; }";
                }
            }

            // Top / Bottom margin
            if ( isset( $attributes['popupTopBottomMargin'] ) && $attributes['popupTopBottomMargin'] !== '' ) {
                $css_rules[] = "{$combined_popup_selector} .ts-field-popup-container { margin: {$attributes['popupTopBottomMargin']}px 0; }";
            }
            if ( isset( $attributes['popupTopBottomMargin_tablet'] ) && $attributes['popupTopBottomMargin_tablet'] !== '' ) {
                $tablet_rules[] = "{$combined_popup_selector} .ts-field-popup-container { margin: {$attributes['popupTopBottomMargin_tablet']}px 0; }";
            }
            if ( isset( $attributes['popupTopBottomMargin_mobile'] ) && $attributes['popupTopBottomMargin_mobile'] !== '' ) {
                $mobile_rules[] = "{$combined_popup_selector} .ts-field-popup-container { margin: {$attributes['popupTopBottomMargin_mobile']}px 0; }";
            }

            // Max height
            if ( isset( $attributes['popupMaxHeight'] ) && $attributes['popupMaxHeight'] !== '' ) {
                $css_rules[] = "{$combined_popup_selector} .ts-popup-content-wrapper { max-height: {$attributes['popupMaxHeight']}px; }";
            }
            if ( isset( $attributes['popupMaxHeight_tablet'] ) && $attributes['popupMaxHeight_tablet'] !== '' ) {
                $tablet_rules[] = "{$combined_popup_selector} .ts-popup-content-wrapper { max-height: {$attributes['popupMaxHeight_tablet']}px; }";
            }
            if ( isset( $attributes['popupMaxHeight_mobile'] ) && $attributes['popupMaxHeight_mobile'] !== '' ) {
                $mobile_rules[] = "{$combined_popup_selector} .ts-popup-content-wrapper { max-height: {$attributes['popupMaxHeight_mobile']}px; }";
            }

            // Autosuggest top margin
            if ( isset( $attributes['popupAutosuggestTopMargin'] ) && $attributes['popupAutosuggestTopMargin'] !== '' ) {
                $css_rules[] = "{$combined_popup_selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: {$attributes['popupAutosuggestTopMargin']}px !important; }";
                $css_rules[] = "{$selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: {$attributes['popupAutosuggestTopMargin']}px !important; }";
            }
            if ( isset( $attributes['popupAutosuggestTopMargin_tablet'] ) && $attributes['popupAutosuggestTopMargin_tablet'] !== '' ) {
                $tablet_rules[] = "{$combined_popup_selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: {$attributes['popupAutosuggestTopMargin_tablet']}px !important; }";
                $tablet_rules[] = "{$selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: {$attributes['popupAutosuggestTopMargin_tablet']}px !important; }";
            }
            if ( isset( $attributes['popupAutosuggestTopMargin_mobile'] ) && $attributes['popupAutosuggestTopMargin_mobile'] !== '' ) {
                $mobile_rules[] = "{$combined_popup_selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: {$attributes['popupAutosuggestTopMargin_mobile']}px !important; }";
                $mobile_rules[] = "{$selector} .ts-autocomplete-dropdown .suggestions-list { margin-top: {$attributes['popupAutosuggestTopMargin_mobile']}px !important; }";
            }
        }

        // ============================================
        // PORTAL/POPUP CSS - Section 2: Filter-Level Popup: Center Position
        // Source: search-form.php:421-434
        // ============================================

        $css_rules[] = ".ts-popup-centered .ts-popup-root { position: fixed !important; }";
        $css_rules[] = ".ts-popup-centered .ts-form { position: static !important; max-width: initial; width: auto !important; }";

        // ============================================
        // PORTAL/POPUP CSS - Section 3: Filter-Level Popup: Multi-Column Menu & Custom Popup CSS
        // Source: search-form.php:334-434 (custom popup) & 387-419 (columns)
        // ============================================

        if ( ! empty( $attributes['filterLists'] ) && is_array( $attributes['filterLists'] ) ) {
            foreach ( $attributes['filterLists'] as $post_type_key => $filters ) {
                if ( ! is_array( $filters ) ) {
                    continue;
                }
                foreach ( $filters as $filter ) {
                    // Safety check for ID
                    if ( empty( $filter['id'] ) ) {
                        continue;
                    }

                    // Scoped selector for this filter's popup
                    $filter_popup_scope = "{$popup_selector}.elementor-repeater-item-{$filter['id']}";

                    // Custom Popup Styles
                    if ( ! empty( $filter['customPopupEnabled'] ) ) {
                        // Min Width
                        if ( isset( $filter['popupMinWidth'] ) && $filter['popupMinWidth'] !== '' ) {
                            $css_rules[] = "{$filter_popup_scope} .ts-field-popup { min-width: {$filter['popupMinWidth']}px; }";
                        }
                        // Max Width
                        if ( isset( $filter['popupMaxWidth'] ) && $filter['popupMaxWidth'] !== '' ) {
                            $css_rules[] = "{$filter_popup_scope} .ts-field-popup { max-width: {$filter['popupMaxWidth']}px; }";
                        }
                        // Max Height
                        if ( isset( $filter['popupMaxHeight'] ) && $filter['popupMaxHeight'] !== '' ) {
                            $css_rules[] = "{$filter_popup_scope} .ts-popup-content-wrapper { max-height: {$filter['popupMaxHeight']}px; }";
                        }
                        // Center Position
                        if ( ! empty( $filter['popupCenterPosition'] ) ) {
                            $css_rules[] = "{$filter_popup_scope} .ts-field-popup-container { align-items: center; justify-content: center; display: flex; }";
                            $css_rules[] = "{$filter_popup_scope} .ts-field-popup { margin: 0 !important; transform: none !important; }";
                        }
                    }

                    // Multi-Column Menu Styles
                    if ( ! empty( $filter['popupMenuColumnsEnabled'] ) ) {
                        $menu_selector = "{$filter_popup_scope} .ts-term-dropdown-list";

                        // Desktop columns
                        if ( isset( $filter['popupMenuColumns'] ) && $filter['popupMenuColumns'] > 0 ) {
                            $css_rules[] = "{$menu_selector} { display: grid; grid-template-columns: repeat({$filter['popupMenuColumns']}, 1fr); }";
                        }

                        // Desktop column gap
                        if ( isset( $filter['popupMenuColumnGap'] ) && $filter['popupMenuColumnGap'] !== '' ) {
                            $css_rules[] = "{$menu_selector} { gap: {$filter['popupMenuColumnGap']}px; }";
                        }
                    }
                }
            }
        }

        // Combine all CSS
        $final_css = '';

        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }

        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }

        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Map Block
     *
     * Handles markers (cluster, icon, text, image), popups, search button, and nav buttons.
     * CRITICAL: Includes global CSS variable fallbacks for Elementor compatibility.
     *
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return string Generated CSS.
     */
    public static function generate_map_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-map-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // ============================================
        // CRITICAL: Elementor CSS Variable Fallbacks (GLOBAL)
        // ============================================
        // Voxel's map.css uses Elementor CSS variables. On FSE pages without Elementor,
        // these are undefined, causing broken typography (font-size: 0 on markers).
        // Markers render in Google Maps overlay pane (NOT inside block DOM), so we use
        // global selectors.
        $css_rules[] = ':root { --e-global-typography-text-font-size: 14px; --e-global-typography-secondary-font-weight: 500; --ts-shade-1: #1a1a1a; --ts-shade-2: #4a4a4a; --ts-shade-5: #999; --ts-accent-1: #3b82f6; }';
        $css_rules[] = "{$selector} { --e-global-typography-text-font-size: 14px; --e-global-typography-secondary-font-weight: 500; }";
        // Global marker styling
        $css_rules[] = '.marker-type-text { font-size: 14px !important; color: #4a4a4a !important; }';
        $css_rules[] = '.marker-wrapper { position: absolute; z-index: 10; transform: translate(-50%, -50%); }';
        $css_rules[] = '.map-marker { display: flex; align-items: center; justify-content: center; overflow: hidden; white-space: nowrap; }';

        // ============================================
        // ACCORDION: Clusters
        // ============================================

        // Cluster Size
        if ( isset( $attributes['clusterSize'] ) ) {
            $css_rules[] = "{$selector} .ts-marker-cluster { width: {$attributes['clusterSize']}px; height: {$attributes['clusterSize']}px; }";
        }
        if ( isset( $attributes['clusterSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-marker-cluster { width: {$attributes['clusterSize_tablet']}px; height: {$attributes['clusterSize_tablet']}px; }";
        }
        if ( isset( $attributes['clusterSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-marker-cluster { width: {$attributes['clusterSize_mobile']}px; height: {$attributes['clusterSize_mobile']}px; }";
        }

        // Cluster Background Color
        if ( ! empty( $attributes['clusterBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-marker-cluster { background-color: {$attributes['clusterBgColor']}; }";
        }
        if ( ! empty( $attributes['clusterBgColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-marker-cluster { background-color: {$attributes['clusterBgColor_tablet']}; }";
        }
        if ( ! empty( $attributes['clusterBgColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-marker-cluster { background-color: {$attributes['clusterBgColor_mobile']}; }";
        }

        // Cluster Box Shadow
        if ( ! empty( $attributes['clusterShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['clusterShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-marker-cluster { box-shadow: {$shadow}; }";
            }
        }

        // Cluster Border Radius
        if ( isset( $attributes['clusterRadius'] ) ) {
            $css_rules[] = "{$selector} .ts-marker-cluster { border-radius: {$attributes['clusterRadius']}px; }";
        }
        if ( isset( $attributes['clusterRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-marker-cluster { border-radius: {$attributes['clusterRadius_tablet']}px; }";
        }
        if ( isset( $attributes['clusterRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-marker-cluster { border-radius: {$attributes['clusterRadius_mobile']}px; }";
        }

        // Cluster Typography
        if ( ! empty( $attributes['clusterTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['clusterTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-marker-cluster { {$typo} }";
            }
        }

        // Cluster Text Color
        if ( ! empty( $attributes['clusterTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-marker-cluster { color: {$attributes['clusterTextColor']}; }";
        }
        if ( ! empty( $attributes['clusterTextColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-marker-cluster { color: {$attributes['clusterTextColor_tablet']}; }";
        }
        if ( ! empty( $attributes['clusterTextColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-marker-cluster { color: {$attributes['clusterTextColor_mobile']}; }";
        }

        // ============================================
        // ACCORDION: Icon Marker
        // ============================================

        // Icon Marker Size
        if ( isset( $attributes['iconMarkerSize'] ) ) {
            $css_rules[] = "{$selector} .marker-type-icon { width: {$attributes['iconMarkerSize']}px; height: {$attributes['iconMarkerSize']}px; }";
        }
        if ( isset( $attributes['iconMarkerSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-icon { width: {$attributes['iconMarkerSize_tablet']}px; height: {$attributes['iconMarkerSize_tablet']}px; }";
        }
        if ( isset( $attributes['iconMarkerSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-icon { width: {$attributes['iconMarkerSize_mobile']}px; height: {$attributes['iconMarkerSize_mobile']}px; }";
        }

        // Icon Marker Icon Size (CSS variable)
        if ( isset( $attributes['iconMarkerIconSize'] ) ) {
            $css_rules[] = "{$selector} .marker-type-icon { --ts-icon-size: {$attributes['iconMarkerIconSize']}px; }";
        }
        if ( isset( $attributes['iconMarkerIconSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-icon { --ts-icon-size: {$attributes['iconMarkerIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['iconMarkerIconSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-icon { --ts-icon-size: {$attributes['iconMarkerIconSize_mobile']}px; }";
        }

        // Icon Marker Border Radius
        if ( isset( $attributes['iconMarkerRadius'] ) ) {
            $css_rules[] = "{$selector} .marker-type-icon { border-radius: {$attributes['iconMarkerRadius']}px; }";
        }
        if ( isset( $attributes['iconMarkerRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-icon { border-radius: {$attributes['iconMarkerRadius_tablet']}px; }";
        }
        if ( isset( $attributes['iconMarkerRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-icon { border-radius: {$attributes['iconMarkerRadius_mobile']}px; }";
        }

        // Icon Marker Box Shadow
        if ( ! empty( $attributes['iconMarkerShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['iconMarkerShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .marker-type-icon { box-shadow: {$shadow}; }";
            }
        }

        // Icon Marker Static Background
        if ( ! empty( $attributes['iconMarkerStaticBg'] ) ) {
            $css_rules[] = "{$selector} .mi-static { background-color: {$attributes['iconMarkerStaticBg']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticBg_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .mi-static { background-color: {$attributes['iconMarkerStaticBg_tablet']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticBg_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .mi-static { background-color: {$attributes['iconMarkerStaticBg_mobile']}; }";
        }

        // Icon Marker Static Background Active
        if ( ! empty( $attributes['iconMarkerStaticBgActive'] ) ) {
            $css_rules[] = "{$selector} .marker-active .mi-static { background-color: {$attributes['iconMarkerStaticBgActive']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticBgActive_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-active .mi-static { background-color: {$attributes['iconMarkerStaticBgActive_tablet']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticBgActive_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-active .mi-static { background-color: {$attributes['iconMarkerStaticBgActive_mobile']}; }";
        }

        // Icon Marker Static Icon Color
        if ( ! empty( $attributes['iconMarkerStaticIconColor'] ) ) {
            $css_rules[] = "{$selector} .mi-static { --ts-icon-color: {$attributes['iconMarkerStaticIconColor']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticIconColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .mi-static { --ts-icon-color: {$attributes['iconMarkerStaticIconColor_tablet']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticIconColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .mi-static { --ts-icon-color: {$attributes['iconMarkerStaticIconColor_mobile']}; }";
        }

        // Icon Marker Static Icon Color Active
        if ( ! empty( $attributes['iconMarkerStaticIconColorActive'] ) ) {
            $css_rules[] = "{$selector} .marker-active .mi-static { --ts-icon-color: {$attributes['iconMarkerStaticIconColorActive']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticIconColorActive_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-active .mi-static { --ts-icon-color: {$attributes['iconMarkerStaticIconColorActive_tablet']}; }";
        }
        if ( ! empty( $attributes['iconMarkerStaticIconColorActive_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-active .mi-static { --ts-icon-color: {$attributes['iconMarkerStaticIconColorActive_mobile']}; }";
        }

        // ============================================
        // ACCORDION: Text Marker
        // ============================================

        // Text Marker Background Color
        if ( ! empty( $attributes['textMarkerBgColor'] ) ) {
            $css_rules[] = "{$selector} .marker-type-text { background-color: {$attributes['textMarkerBgColor']}; }";
        }
        if ( ! empty( $attributes['textMarkerBgColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-text { background-color: {$attributes['textMarkerBgColor_tablet']}; }";
        }
        if ( ! empty( $attributes['textMarkerBgColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-text { background-color: {$attributes['textMarkerBgColor_mobile']}; }";
        }

        // Text Marker Background Color Active
        if ( ! empty( $attributes['textMarkerBgColorActive'] ) ) {
            $css_rules[] = "{$selector} .marker-active .marker-type-text { background-color: {$attributes['textMarkerBgColorActive']}; }";
        }
        if ( ! empty( $attributes['textMarkerBgColorActive_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-active .marker-type-text { background-color: {$attributes['textMarkerBgColorActive_tablet']}; }";
        }
        if ( ! empty( $attributes['textMarkerBgColorActive_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-active .marker-type-text { background-color: {$attributes['textMarkerBgColorActive_mobile']}; }";
        }

        // Text Marker Text Color
        if ( ! empty( $attributes['textMarkerTextColor'] ) ) {
            $css_rules[] = "{$selector} .marker-type-text { color: {$attributes['textMarkerTextColor']}; }";
        }
        if ( ! empty( $attributes['textMarkerTextColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-text { color: {$attributes['textMarkerTextColor_tablet']}; }";
        }
        if ( ! empty( $attributes['textMarkerTextColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-text { color: {$attributes['textMarkerTextColor_mobile']}; }";
        }

        // Text Marker Text Color Active
        if ( ! empty( $attributes['textMarkerTextColorActive'] ) ) {
            $css_rules[] = "{$selector} .marker-active .marker-type-text { color: {$attributes['textMarkerTextColorActive']}; }";
        }
        if ( ! empty( $attributes['textMarkerTextColorActive_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-active .marker-type-text { color: {$attributes['textMarkerTextColorActive_tablet']}; }";
        }
        if ( ! empty( $attributes['textMarkerTextColorActive_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-active .marker-type-text { color: {$attributes['textMarkerTextColorActive_mobile']}; }";
        }

        // Text Marker Border Radius
        if ( isset( $attributes['textMarkerRadius'] ) ) {
            $css_rules[] = "{$selector} .marker-type-text { border-radius: {$attributes['textMarkerRadius']}px; }";
        }
        if ( isset( $attributes['textMarkerRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-text { border-radius: {$attributes['textMarkerRadius_tablet']}px; }";
        }
        if ( isset( $attributes['textMarkerRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-text { border-radius: {$attributes['textMarkerRadius_mobile']}px; }";
        }

        // Text Marker Typography
        if ( ! empty( $attributes['textMarkerTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['textMarkerTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .marker-type-text { {$typo} }";
            }
        }

        // Text Marker Padding
        if ( ! empty( $attributes['textMarkerPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['textMarkerPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .marker-type-text { {$padding} }";
            }
        }
        if ( ! empty( $attributes['textMarkerPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['textMarkerPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$selector} .marker-type-text { {$padding} }";
            }
        }
        if ( ! empty( $attributes['textMarkerPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['textMarkerPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$selector} .marker-type-text { {$padding} }";
            }
        }

        // Text Marker Box Shadow
        if ( ! empty( $attributes['textMarkerShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['textMarkerShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .marker-type-text { box-shadow: {$shadow}; }";
            }
        }

        // ============================================
        // ACCORDION: Image Marker
        // ============================================

        // Image Marker Size
        if ( isset( $attributes['imageMarkerSize'] ) ) {
            $css_rules[] = "{$selector} .marker-type-image { width: {$attributes['imageMarkerSize']}px; height: {$attributes['imageMarkerSize']}px; }";
        }
        if ( isset( $attributes['imageMarkerSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-image { width: {$attributes['imageMarkerSize_tablet']}px; height: {$attributes['imageMarkerSize_tablet']}px; }";
        }
        if ( isset( $attributes['imageMarkerSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-image { width: {$attributes['imageMarkerSize_mobile']}px; height: {$attributes['imageMarkerSize_mobile']}px; }";
        }

        // Image Marker Border Radius
        if ( isset( $attributes['imageMarkerRadius'] ) ) {
            $css_rules[] = "{$selector} .marker-type-image { border-radius: {$attributes['imageMarkerRadius']}px; }";
        }
        if ( isset( $attributes['imageMarkerRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .marker-type-image { border-radius: {$attributes['imageMarkerRadius_tablet']}px; }";
        }
        if ( isset( $attributes['imageMarkerRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .marker-type-image { border-radius: {$attributes['imageMarkerRadius_mobile']}px; }";
        }

        // Image Marker Box Shadow
        if ( ! empty( $attributes['imageMarkerShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['imageMarkerShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .marker-type-image { box-shadow: {$shadow}; }";
            }
        }

        // ============================================
        // ACCORDION: Map Popup
        // ============================================

        // Popup Card Width
        if ( isset( $attributes['popupCardWidth'] ) ) {
            $css_rules[] = "{$selector} .ts-preview-popup { width: {$attributes['popupCardWidth']}px; }";
        }
        if ( isset( $attributes['popupCardWidth_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-preview-popup { width: {$attributes['popupCardWidth_tablet']}px; }";
        }
        if ( isset( $attributes['popupCardWidth_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-preview-popup { width: {$attributes['popupCardWidth_mobile']}px; }";
        }

        // Popup Loader Colors
        if ( ! empty( $attributes['popupLoaderColor1'] ) ) {
            $css_rules[] = "{$selector} .ts-loading-popup .ts-loader { border-color: {$attributes['popupLoaderColor1']}; }";
        }
        if ( ! empty( $attributes['popupLoaderColor2'] ) ) {
            $css_rules[] = "{$selector} .ts-loading-popup .ts-loader { border-bottom-color: {$attributes['popupLoaderColor2']}; }";
        }

        // ============================================
        // ACCORDION: Search Button
        // ============================================

        // Search Button Typography
        if ( ! empty( $attributes['searchBtnTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['searchBtnTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-map-btn { {$typo} }";
            }
        }

        // Search Button Text Color
        if ( ! empty( $attributes['searchBtnTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-map-btn { color: {$attributes['searchBtnTextColor']}; }";
        }
        if ( ! empty( $attributes['searchBtnTextColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-btn { color: {$attributes['searchBtnTextColor_tablet']}; }";
        }
        if ( ! empty( $attributes['searchBtnTextColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-btn { color: {$attributes['searchBtnTextColor_mobile']}; }";
        }

        // Search Button Background Color
        if ( ! empty( $attributes['searchBtnBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-map-btn { background-color: {$attributes['searchBtnBgColor']}; }";
        }
        if ( ! empty( $attributes['searchBtnBgColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-btn { background-color: {$attributes['searchBtnBgColor_tablet']}; }";
        }
        if ( ! empty( $attributes['searchBtnBgColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-btn { background-color: {$attributes['searchBtnBgColor_mobile']}; }";
        }

        // Search Button Icon Color
        if ( ! empty( $attributes['searchBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-map-btn svg { fill: {$attributes['searchBtnIconColor']}; }";
        }
        if ( ! empty( $attributes['searchBtnIconColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-btn svg { fill: {$attributes['searchBtnIconColor_tablet']}; }";
        }
        if ( ! empty( $attributes['searchBtnIconColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-btn svg { fill: {$attributes['searchBtnIconColor_mobile']}; }";
        }

        // Search Button Icon Color Active
        if ( ! empty( $attributes['searchBtnIconColorActive'] ) ) {
            $css_rules[] = "{$selector} .ts-map-btn.active svg { fill: {$attributes['searchBtnIconColorActive']}; }";
        }
        if ( ! empty( $attributes['searchBtnIconColorActive_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-btn.active svg { fill: {$attributes['searchBtnIconColorActive_tablet']}; }";
        }
        if ( ! empty( $attributes['searchBtnIconColorActive_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-btn.active svg { fill: {$attributes['searchBtnIconColorActive_mobile']}; }";
        }

        // Search Button Border Radius
        if ( isset( $attributes['searchBtnRadius'] ) ) {
            $css_rules[] = "{$selector} .ts-map-btn { border-radius: {$attributes['searchBtnRadius']}px; }";
        }
        if ( isset( $attributes['searchBtnRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-btn { border-radius: {$attributes['searchBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['searchBtnRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-btn { border-radius: {$attributes['searchBtnRadius_mobile']}px; }";
        }

        // ============================================
        // ACCORDION: Nav Buttons
        // ============================================

        // Nav Button Icon Color
        if ( ! empty( $attributes['navBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn i { color: {$attributes['navBtnIconColor']}; }";
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn svg { fill: {$attributes['navBtnIconColor']}; }";
        }

        // Nav Button Icon Size
        if ( isset( $attributes['navBtnIconSize'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn i { font-size: {$attributes['navBtnIconSize']}px; }";
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn svg { width: {$attributes['navBtnIconSize']}px; height: {$attributes['navBtnIconSize']}px; }";
        }
        if ( isset( $attributes['navBtnIconSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-nav .ts-icon-btn i { font-size: {$attributes['navBtnIconSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-map-nav .ts-icon-btn svg { width: {$attributes['navBtnIconSize_tablet']}px; height: {$attributes['navBtnIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['navBtnIconSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-nav .ts-icon-btn i { font-size: {$attributes['navBtnIconSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-map-nav .ts-icon-btn svg { width: {$attributes['navBtnIconSize_mobile']}px; height: {$attributes['navBtnIconSize_mobile']}px; }";
        }

        // Nav Button Background Color
        if ( ! empty( $attributes['navBtnBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { background-color: {$attributes['navBtnBgColor']}; }";
        }

        // Nav Button Border
        if ( ! empty( $attributes['navBtnBorder'] ) ) {
            $border = $attributes['navBtnBorder'];
            if ( ! empty( $border['borderType'] ) && $border['borderType'] !== 'none' ) {
                $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-style: {$border['borderType']}; }";

                if ( ! empty( $border['borderWidth'] ) ) {
                    $width = $border['borderWidth'];
                    $unit = $width['unit'] ?? 'px';
                    if ( ! empty( $width['linked'] ) && isset( $width['top'] ) ) {
                        $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-width: {$width['top']}{$unit}; }";
                    } else {
                        $t = isset( $width['top'] ) ? "{$width['top']}{$unit}" : '0';
                        $r = isset( $width['right'] ) ? "{$width['right']}{$unit}" : '0';
                        $b = isset( $width['bottom'] ) ? "{$width['bottom']}{$unit}" : '0';
                        $l = isset( $width['left'] ) ? "{$width['left']}{$unit}" : '0';
                        $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-width: {$t} {$r} {$b} {$l}; }";
                    }
                }

                if ( ! empty( $border['borderColor'] ) ) {
                    $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-color: {$border['borderColor']}; }";
                }
            }
        }

        // Nav Button Border Radius
        if ( isset( $attributes['navBtnRadius'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-radius: {$attributes['navBtnRadius']}px; }";
        }
        if ( isset( $attributes['navBtnRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-radius: {$attributes['navBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['navBtnRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { border-radius: {$attributes['navBtnRadius_mobile']}px; }";
        }

        // Nav Button Box Shadow
        if ( ! empty( $attributes['navBtnShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['navBtnShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { box-shadow: {$shadow}; }";
            }
        }

        // Nav Button Size
        if ( isset( $attributes['navBtnSize'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { width: {$attributes['navBtnSize']}px; height: {$attributes['navBtnSize']}px; }";
        }
        if ( isset( $attributes['navBtnSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { width: {$attributes['navBtnSize_tablet']}px; height: {$attributes['navBtnSize_tablet']}px; }";
        }
        if ( isset( $attributes['navBtnSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-map-nav .ts-icon-btn { width: {$attributes['navBtnSize_mobile']}px; height: {$attributes['navBtnSize_mobile']}px; }";
        }

        // Nav Button Hover States
        if ( ! empty( $attributes['navBtnIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn:hover i { color: {$attributes['navBtnIconColorHover']}; }";
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn:hover svg { fill: {$attributes['navBtnIconColorHover']}; }";
        }
        if ( ! empty( $attributes['navBtnBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn:hover { background-color: {$attributes['navBtnBgColorHover']}; }";
        }
        if ( ! empty( $attributes['navBtnBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-map-nav .ts-icon-btn:hover { border-color: {$attributes['navBtnBorderColorHover']}; }";
        }

        // ============================================
        // Combine CSS with media queries
        // ============================================
        $final_css = '';

        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }

        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }

        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Post Feed Block
     *
     * Handles counter, order-by, pagination, carousel navigation, loading states, and no-results.
     * Uses data-block-id selector for scoping.
     *
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return string Generated CSS.
     */
    public static function generate_post_feed_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '[data-block-id="' . $block_id . '"]';
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // ============================================
        // CONTAINER POSITIONING
        // ============================================
        // Fix: Carousel nav is position:absolute and needs relative container
        // Also prevent carousel from expanding parent (max-width: 100%, min-width: 0)
        $css_rules[] = "{$selector} { position: relative; max-width: 100%; min-width: 0; }";
        $css_rules[] = "{$selector} .post-feed-grid { max-width: 100%; }";

        // ============================================
        // COUNTER STYLES
        // ============================================

        // Counter typography
        if ( ! empty( $attributes['counterTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['counterTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .result-count { {$typo} }";
            }
        }

        // Counter text color
        if ( ! empty( $attributes['counterTextColor'] ) ) {
            $css_rules[] = "{$selector} .result-count { color: {$attributes['counterTextColor']}; }";
        }

        // Counter bottom spacing
        if ( isset( $attributes['counterBottomSpacing'] ) ) {
            $css_rules[] = "{$selector} .post-feed-header { margin-bottom: {$attributes['counterBottomSpacing']}px; }";
        }
        if ( isset( $attributes['counterBottomSpacing_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-header { margin-bottom: {$attributes['counterBottomSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['counterBottomSpacing_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-header { margin-bottom: {$attributes['counterBottomSpacing_mobile']}px; }";
        }

        // ============================================
        // ORDER BY STYLES
        // ============================================

        // Order by typography
        if ( ! empty( $attributes['orderByTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['orderByTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .vxf-sort { {$typo} }";
            }
        }

        // Order by text color (uses CSS variable --ts-shade-3)
        if ( ! empty( $attributes['orderByTextColor'] ) ) {
            $css_rules[] = "{$selector} .vxf-sort { --ts-shade-3: {$attributes['orderByTextColor']}; }";
        }

        // Order by text color hover (uses CSS variable --ts-shade-2)
        if ( ! empty( $attributes['orderByTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .vxf-sort { --ts-shade-2: {$attributes['orderByTextColorHover']}; }";
        }

        // ============================================
        // NO RESULTS STYLES
        // ============================================

        // No results content gap
        if ( isset( $attributes['noResultsContentGap'] ) ) {
            $css_rules[] = "{$selector} .ts-no-posts { gap: {$attributes['noResultsContentGap']}px; }";
        }
        if ( isset( $attributes['noResultsContentGap_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-no-posts { gap: {$attributes['noResultsContentGap_tablet']}px; }";
        }
        if ( isset( $attributes['noResultsContentGap_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-no-posts { gap: {$attributes['noResultsContentGap_mobile']}px; }";
        }

        // No results icon size
        if ( isset( $attributes['noResultsIconSize'] ) ) {
            $css_rules[] = "{$selector} .ts-no-posts > svg, {$selector} .ts-no-posts > i { --ts-icon-size: {$attributes['noResultsIconSize']}px; width: {$attributes['noResultsIconSize']}px; height: {$attributes['noResultsIconSize']}px; font-size: {$attributes['noResultsIconSize']}px; }";
        }
        if ( isset( $attributes['noResultsIconSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-no-posts > svg, {$selector} .ts-no-posts > i { --ts-icon-size: {$attributes['noResultsIconSize_tablet']}px; width: {$attributes['noResultsIconSize_tablet']}px; height: {$attributes['noResultsIconSize_tablet']}px; font-size: {$attributes['noResultsIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['noResultsIconSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-no-posts > svg, {$selector} .ts-no-posts > i { --ts-icon-size: {$attributes['noResultsIconSize_mobile']}px; width: {$attributes['noResultsIconSize_mobile']}px; height: {$attributes['noResultsIconSize_mobile']}px; font-size: {$attributes['noResultsIconSize_mobile']}px; }";
        }

        // No results icon color
        if ( ! empty( $attributes['noResultsIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-no-posts > svg, {$selector} .ts-no-posts > i { --ts-icon-color: {$attributes['noResultsIconColor']}; color: {$attributes['noResultsIconColor']}; fill: {$attributes['noResultsIconColor']}; }";
        }

        // No results typography
        if ( ! empty( $attributes['noResultsTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['noResultsTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-no-posts p { {$typo} }";
            }
        }

        // No results text color
        if ( ! empty( $attributes['noResultsTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-no-posts p { color: {$attributes['noResultsTextColor']}; }";
        }

        // No results link color
        if ( ! empty( $attributes['noResultsLinkColor'] ) ) {
            $css_rules[] = "{$selector} .ts-no-posts a { color: {$attributes['noResultsLinkColor']}; }";
        }

        // ============================================
        // PAGINATION STYLES
        // ============================================

        // Pagination top margin
        if ( isset( $attributes['paginationTopMargin'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination { margin-top: {$attributes['paginationTopMargin']}px; }";
        }
        if ( isset( $attributes['paginationTopMargin_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .feed-pagination { margin-top: {$attributes['paginationTopMargin_tablet']}px; }";
        }
        if ( isset( $attributes['paginationTopMargin_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .feed-pagination { margin-top: {$attributes['paginationTopMargin_mobile']}px; }";
        }

        // Pagination typography
        if ( ! empty( $attributes['paginationTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['paginationTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .feed-pagination .ts-btn { {$typo} }";
            }
        }

        // Pagination padding
        if ( ! empty( $attributes['paginationPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['paginationPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .feed-pagination .ts-btn { {$padding} }";
            }
        }

        // Pagination height
        if ( isset( $attributes['paginationHeight'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { height: {$attributes['paginationHeight']}px; }";
        }
        if ( isset( $attributes['paginationHeight_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .feed-pagination .ts-btn { height: {$attributes['paginationHeight_tablet']}px; }";
        }
        if ( isset( $attributes['paginationHeight_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .feed-pagination .ts-btn { height: {$attributes['paginationHeight_mobile']}px; }";
        }

        // Pagination width
        if ( isset( $attributes['paginationWidth'] ) && $attributes['paginationWidth'] > 0 ) {
            $unit = $attributes['paginationWidthUnit'] ?? '%';
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { width: {$attributes['paginationWidth']}{$unit}; }";
        }

        // Pagination icon text spacing
        if ( isset( $attributes['paginationIconTextSpacing'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { gap: {$attributes['paginationIconTextSpacing']}px; }";
        }

        // Pagination border type
        if ( ! empty( $attributes['paginationBorderType'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { border-style: {$attributes['paginationBorderType']}; }";
        }

        // Pagination border width
        if ( isset( $attributes['paginationBorderWidth'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { border-width: {$attributes['paginationBorderWidth']}px; }";
        } elseif ( ! empty( $attributes['paginationBorderType'] ) && $attributes['paginationBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { border-width: 1px; }";
        }

        // Pagination border color
        if ( ! empty( $attributes['paginationBorderColor'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { border-color: {$attributes['paginationBorderColor']}; }";
        }

        // Pagination justify
        if ( ! empty( $attributes['paginationJustify'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination { justify-content: {$attributes['paginationJustify']}; }";
        }

        // Pagination spacing between buttons
        if ( isset( $attributes['paginationSpacing'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination { gap: {$attributes['paginationSpacing']}px; }";
        }
        if ( isset( $attributes['paginationSpacing_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .feed-pagination { gap: {$attributes['paginationSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['paginationSpacing_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .feed-pagination { gap: {$attributes['paginationSpacing_mobile']}px; }";
        }

        // Pagination border radius
        if ( isset( $attributes['paginationBorderRadius'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { border-radius: {$attributes['paginationBorderRadius']}px; }";
        }
        if ( isset( $attributes['paginationBorderRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .feed-pagination .ts-btn { border-radius: {$attributes['paginationBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['paginationBorderRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .feed-pagination .ts-btn { border-radius: {$attributes['paginationBorderRadius_mobile']}px; }";
        }

        // Pagination text color
        if ( ! empty( $attributes['paginationTextColor'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { color: {$attributes['paginationTextColor']}; }";
        }

        // Pagination background
        if ( ! empty( $attributes['paginationBackground'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn { background-color: {$attributes['paginationBackground']}; }";
        }

        // Pagination icon color
        if ( ! empty( $attributes['paginationIconColor'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn svg, {$selector} .feed-pagination .ts-btn i { --ts-icon-color: {$attributes['paginationIconColor']}; color: {$attributes['paginationIconColor']}; fill: {$attributes['paginationIconColor']}; }";
        }

        // Pagination hover states
        if ( ! empty( $attributes['paginationTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn:hover { color: {$attributes['paginationTextColorHover']}; }";
        }
        if ( ! empty( $attributes['paginationBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn:hover { background-color: {$attributes['paginationBackgroundHover']}; }";
        }
        if ( ! empty( $attributes['paginationBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn:hover { border-color: {$attributes['paginationBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['paginationIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .feed-pagination .ts-btn:hover svg, {$selector} .feed-pagination .ts-btn:hover i { --ts-icon-color: {$attributes['paginationIconColorHover']}; color: {$attributes['paginationIconColorHover']}; fill: {$attributes['paginationIconColorHover']}; }";
        }

        // ============================================
        // CAROUSEL NAVIGATION STYLES
        // ============================================

        // Carousel nav horizontal position
        if ( isset( $attributes['carouselNavHorizontalPosition'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-prev-page { left: {$attributes['carouselNavHorizontalPosition']}px; }";
            $css_rules[] = "{$selector} .post-feed-nav .ts-next-page { right: {$attributes['carouselNavHorizontalPosition']}px; }";
        }
        if ( isset( $attributes['carouselNavHorizontalPosition_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-prev-page { left: {$attributes['carouselNavHorizontalPosition_tablet']}px; }";
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-next-page { right: {$attributes['carouselNavHorizontalPosition_tablet']}px; }";
        }
        if ( isset( $attributes['carouselNavHorizontalPosition_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-prev-page { left: {$attributes['carouselNavHorizontalPosition_mobile']}px; }";
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-next-page { right: {$attributes['carouselNavHorizontalPosition_mobile']}px; }";
        }

        // Carousel nav vertical position
        if ( isset( $attributes['carouselNavVerticalPosition'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { top: {$attributes['carouselNavVerticalPosition']}%; transform: translateY(-50%); }";
        }
        if ( isset( $attributes['carouselNavVerticalPosition_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { top: {$attributes['carouselNavVerticalPosition_tablet']}%; transform: translateY(-50%); }";
        }
        if ( isset( $attributes['carouselNavVerticalPosition_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { top: {$attributes['carouselNavVerticalPosition_mobile']}%; transform: translateY(-50%); }";
        }

        // Carousel nav icon color
        if ( ! empty( $attributes['carouselNavIconColor'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg, {$selector} .post-feed-nav .ts-icon-btn i { --ts-icon-color: {$attributes['carouselNavIconColor']}; color: {$attributes['carouselNavIconColor']}; fill: {$attributes['carouselNavIconColor']}; }";
        }

        // Carousel nav button size
        if ( isset( $attributes['carouselNavButtonSize'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { width: {$attributes['carouselNavButtonSize']}px; height: {$attributes['carouselNavButtonSize']}px; }";
        }
        if ( isset( $attributes['carouselNavButtonSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { width: {$attributes['carouselNavButtonSize_tablet']}px; height: {$attributes['carouselNavButtonSize_tablet']}px; }";
        }
        if ( isset( $attributes['carouselNavButtonSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { width: {$attributes['carouselNavButtonSize_mobile']}px; height: {$attributes['carouselNavButtonSize_mobile']}px; }";
        }

        // Carousel nav icon size
        if ( isset( $attributes['carouselNavIconSize'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg, {$selector} .post-feed-nav .ts-icon-btn i { --ts-icon-size: {$attributes['carouselNavIconSize']}px; width: {$attributes['carouselNavIconSize']}px; height: {$attributes['carouselNavIconSize']}px; font-size: {$attributes['carouselNavIconSize']}px; }";
        }
        if ( isset( $attributes['carouselNavIconSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg, {$selector} .post-feed-nav .ts-icon-btn i { --ts-icon-size: {$attributes['carouselNavIconSize_tablet']}px; width: {$attributes['carouselNavIconSize_tablet']}px; height: {$attributes['carouselNavIconSize_tablet']}px; font-size: {$attributes['carouselNavIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['carouselNavIconSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg, {$selector} .post-feed-nav .ts-icon-btn i { --ts-icon-size: {$attributes['carouselNavIconSize_mobile']}px; width: {$attributes['carouselNavIconSize_mobile']}px; height: {$attributes['carouselNavIconSize_mobile']}px; font-size: {$attributes['carouselNavIconSize_mobile']}px; }";
        }

        // Carousel nav background
        if ( ! empty( $attributes['carouselNavBackground'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { background-color: {$attributes['carouselNavBackground']}; }";
        }

        // Carousel nav backdrop blur
        if ( isset( $attributes['carouselNavBackdropBlur'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur({$attributes['carouselNavBackdropBlur']}px); -webkit-backdrop-filter: blur({$attributes['carouselNavBackdropBlur']}px); }";
        }

        // Carousel nav border type
        if ( ! empty( $attributes['carouselNavBorderType'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-style: {$attributes['carouselNavBorderType']}; }";
        }

        // Carousel nav border width
        if ( isset( $attributes['carouselNavBorderWidth'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-width: {$attributes['carouselNavBorderWidth']}px; }";
        } elseif ( ! empty( $attributes['carouselNavBorderType'] ) && $attributes['carouselNavBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-width: 1px; }";
        }

        // Carousel nav border color
        if ( ! empty( $attributes['carouselNavBorderColor'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-color: {$attributes['carouselNavBorderColor']}; }";
        }

        // Carousel nav border radius
        if ( isset( $attributes['carouselNavBorderRadius'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-radius: {$attributes['carouselNavBorderRadius']}px; }";
        }
        if ( isset( $attributes['carouselNavBorderRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-radius: {$attributes['carouselNavBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['carouselNavBorderRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-radius: {$attributes['carouselNavBorderRadius_mobile']}px; }";
        }

        // Carousel nav hover states
        if ( isset( $attributes['carouselNavButtonSizeHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { width: {$attributes['carouselNavButtonSizeHover']}px; height: {$attributes['carouselNavButtonSizeHover']}px; }";
        }
        if ( isset( $attributes['carouselNavButtonSizeHover_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { width: {$attributes['carouselNavButtonSizeHover_tablet']}px; height: {$attributes['carouselNavButtonSizeHover_tablet']}px; }";
        }
        if ( isset( $attributes['carouselNavButtonSizeHover_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { width: {$attributes['carouselNavButtonSizeHover_mobile']}px; height: {$attributes['carouselNavButtonSizeHover_mobile']}px; }";
        }

        if ( isset( $attributes['carouselNavIconSizeHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg, {$selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-size: {$attributes['carouselNavIconSizeHover']}px; width: {$attributes['carouselNavIconSizeHover']}px; height: {$attributes['carouselNavIconSizeHover']}px; font-size: {$attributes['carouselNavIconSizeHover']}px; }";
        }
        if ( isset( $attributes['carouselNavIconSizeHover_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg, {$selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-size: {$attributes['carouselNavIconSizeHover_tablet']}px; width: {$attributes['carouselNavIconSizeHover_tablet']}px; height: {$attributes['carouselNavIconSizeHover_tablet']}px; font-size: {$attributes['carouselNavIconSizeHover_tablet']}px; }";
        }
        if ( isset( $attributes['carouselNavIconSizeHover_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg, {$selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-size: {$attributes['carouselNavIconSizeHover_mobile']}px; width: {$attributes['carouselNavIconSizeHover_mobile']}px; height: {$attributes['carouselNavIconSizeHover_mobile']}px; font-size: {$attributes['carouselNavIconSizeHover_mobile']}px; }";
        }

        if ( ! empty( $attributes['carouselNavIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg, {$selector} .post-feed-nav .ts-icon-btn:hover i { --ts-icon-color: {$attributes['carouselNavIconColorHover']}; color: {$attributes['carouselNavIconColorHover']}; fill: {$attributes['carouselNavIconColorHover']}; }";
        }

        if ( ! empty( $attributes['carouselNavBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { background-color: {$attributes['carouselNavBackgroundHover']}; }";
        }

        if ( ! empty( $attributes['carouselNavBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { border-color: {$attributes['carouselNavBorderColorHover']}; }";
        }

        // ============================================
        // LOADING STYLES
        // ============================================

        // Loading opacity
        if ( ! empty( $attributes['loadingStyle'] ) && $attributes['loadingStyle'] === 'opacity' && isset( $attributes['loadingOpacity'] ) ) {
            $css_rules[] = "{$selector} .post-feed-grid.vx-opacity { opacity: {$attributes['loadingOpacity']}; }";
        }

        // Skeleton background color
        if ( ! empty( $attributes['loadingStyle'] ) && $attributes['loadingStyle'] === 'skeleton' && ! empty( $attributes['skeletonBackgroundColor'] ) ) {
            $css_rules[] = "{$selector}.vx-loading .vx-skeleton .ts-preview { background-color: {$attributes['skeletonBackgroundColor']}; }";
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================
        $final_css = '';

        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }

        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }

        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Navbar Block
     *
     * Handles orientation, menu items (normal/hover/active), icons, scroll, and chevrons.
     *
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return string Generated CSS.
     */
    public static function generate_navbar_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-navbar-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // ============================================
        // CONTENT TAB - Settings (Orientation & Justify)
        // ============================================

        // Horizontal mode justify
        if ( ! empty( $attributes['orientation'] ) && $attributes['orientation'] === 'horizontal' ) {
            $justify_map = [
                'left' => 'flex-start',
                'center' => 'center',
                'right' => 'flex-end',
                'space-between' => 'space-between',
                'space-around' => 'space-around',
            ];

            if ( ! empty( $attributes['justify'] ) && isset( $justify_map[ $attributes['justify'] ] ) ) {
                $css_rules[] = "{$selector} .ts-nav { justify-content: {$justify_map[ $attributes['justify'] ]}; }";
            }
            if ( ! empty( $attributes['justify_tablet'] ) && isset( $justify_map[ $attributes['justify_tablet'] ] ) ) {
                $tablet_rules[] = "{$selector} .ts-nav { justify-content: {$justify_map[ $attributes['justify_tablet'] ]}; }";
            }
            if ( ! empty( $attributes['justify_mobile'] ) && isset( $justify_map[ $attributes['justify_mobile'] ] ) ) {
                $mobile_rules[] = "{$selector} .ts-nav { justify-content: {$justify_map[ $attributes['justify_mobile'] ]}; }";
            }
        }

        // Vertical mode collapsible widths
        if ( ! empty( $attributes['orientation'] ) && $attributes['orientation'] === 'vertical' && ! empty( $attributes['collapsible'] ) ) {
            if ( isset( $attributes['collapsedWidth'] ) ) {
                $css_rules[] = "{$selector} .ts-nav-collapsed { width: {$attributes['collapsedWidth']}px; }";
            }
            if ( isset( $attributes['expandedWidth'] ) ) {
                $css_rules[] = "{$selector} .ts-nav-collapsed:hover { width: {$attributes['expandedWidth']}px; }";
                $css_rules[] = "{$selector} .ts-nav-collapsed.expanded { width: {$attributes['expandedWidth']}px; }";
            }
        }

        // ============================================
        // STYLE TAB - Menu Item (Normal State)
        // ============================================

        // Typography
        if ( ! empty( $attributes['typography'] ) ) {
            $typo = self::generate_typography_css( $attributes['typography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-item-link { {$typo} }";
            }
        }

        // Text color
        if ( ! empty( $attributes['linkColor'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link { color: {$attributes['linkColor']}; }";
        }

        // Background color
        if ( ! empty( $attributes['linkBg'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link { background-color: {$attributes['linkBg']}; }";
        }

        // Margin (responsive)
        if ( ! empty( $attributes['linkMargin'] ) ) {
            $margin = self::generate_dimensions_css( $attributes['linkMargin'], 'margin' );
            if ( $margin ) {
                $css_rules[] = "{$selector} .ts-item-link { {$margin} }";
            }
        }
        if ( ! empty( $attributes['linkMargin_tablet'] ) ) {
            $margin = self::generate_dimensions_css( $attributes['linkMargin_tablet'], 'margin' );
            if ( $margin ) {
                $tablet_rules[] = "{$selector} .ts-item-link { {$margin} }";
            }
        }
        if ( ! empty( $attributes['linkMargin_mobile'] ) ) {
            $margin = self::generate_dimensions_css( $attributes['linkMargin_mobile'], 'margin' );
            if ( $margin ) {
                $mobile_rules[] = "{$selector} .ts-item-link { {$margin} }";
            }
        }

        // Padding (responsive)
        if ( ! empty( $attributes['linkPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['linkPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .ts-item-link { {$padding} }";
            }
        }
        if ( ! empty( $attributes['linkPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['linkPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$selector} .ts-item-link { {$padding} }";
            }
        }
        if ( ! empty( $attributes['linkPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['linkPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$selector} .ts-item-link { {$padding} }";
            }
        }

        // Border style
        if ( ! empty( $attributes['linkBorderStyle'] ) && $attributes['linkBorderStyle'] !== 'default' ) {
            if ( $attributes['linkBorderStyle'] === 'none' ) {
                $css_rules[] = "{$selector} .ts-item-link { border: none; }";
            } else {
                $css_rules[] = "{$selector} .ts-item-link { border-style: {$attributes['linkBorderStyle']}; }";
            }
        }

        // Border radius (responsive)
        if ( isset( $attributes['linkBorderRadius'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link { border-radius: {$attributes['linkBorderRadius']}px; }";
        }
        if ( isset( $attributes['linkBorderRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-item-link { border-radius: {$attributes['linkBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['linkBorderRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-item-link { border-radius: {$attributes['linkBorderRadius_mobile']}px; }";
        }

        // Item content gap (responsive)
        if ( isset( $attributes['linkGap'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link { gap: {$attributes['linkGap']}px; }";
        }
        if ( isset( $attributes['linkGap_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-item-link { gap: {$attributes['linkGap_tablet']}px; }";
        }
        if ( isset( $attributes['linkGap_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-item-link { gap: {$attributes['linkGap_mobile']}px; }";
        }

        // ============================================
        // STYLE TAB - Menu Item (Hover State)
        // ============================================

        if ( ! empty( $attributes['linkColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link:hover { color: {$attributes['linkColorHover']}; }";
        }

        if ( ! empty( $attributes['linkBgHover'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link:hover { background-color: {$attributes['linkBgHover']}; }";
        }

        // ============================================
        // STYLE TAB - Menu Item (Active State)
        // ============================================

        if ( ! empty( $attributes['linkColorActive'] ) ) {
            $css_rules[] = "{$selector} .current-menu-item .ts-item-link { color: {$attributes['linkColorActive']}; }";
        }

        if ( ! empty( $attributes['linkBgActive'] ) ) {
            $css_rules[] = "{$selector} .current-menu-item .ts-item-link { background-color: {$attributes['linkBgActive']}; }";
        }

        // ============================================
        // STYLE TAB - Menu Item Icon
        // ============================================

        // Icon container size (responsive)
        if ( isset( $attributes['iconContainerSize'] ) ) {
            $css_rules[] = "{$selector} .ts-item-icon { width: {$attributes['iconContainerSize']}px; height: {$attributes['iconContainerSize']}px; }";
        }
        if ( isset( $attributes['iconContainerSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-item-icon { width: {$attributes['iconContainerSize_tablet']}px; height: {$attributes['iconContainerSize_tablet']}px; }";
        }
        if ( isset( $attributes['iconContainerSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-item-icon { width: {$attributes['iconContainerSize_mobile']}px; height: {$attributes['iconContainerSize_mobile']}px; }";
        }

        // Icon container border radius (responsive, uses %)
        if ( isset( $attributes['iconContainerRadius'] ) ) {
            $css_rules[] = "{$selector} .ts-item-icon { border-radius: {$attributes['iconContainerRadius']}%; }";
        }
        if ( isset( $attributes['iconContainerRadius_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-item-icon { border-radius: {$attributes['iconContainerRadius_tablet']}%; }";
        }
        if ( isset( $attributes['iconContainerRadius_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-item-icon { border-radius: {$attributes['iconContainerRadius_mobile']}%; }";
        }

        // Icon container background (normal/hover/active)
        if ( ! empty( $attributes['iconContainerBg'] ) ) {
            $css_rules[] = "{$selector} .ts-item-icon { background-color: {$attributes['iconContainerBg']}; }";
        }
        if ( ! empty( $attributes['iconContainerBgHover'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link:hover .ts-item-icon { background-color: {$attributes['iconContainerBgHover']}; }";
        }
        if ( ! empty( $attributes['iconContainerBgActive'] ) ) {
            $css_rules[] = "{$selector} .current-menu-item .ts-item-icon { background-color: {$attributes['iconContainerBgActive']}; }";
        }

        // Icon size (responsive)
        if ( isset( $attributes['iconSize'] ) ) {
            $css_rules[] = "{$selector} .ts-item-icon i { font-size: {$attributes['iconSize']}px; }";
            $css_rules[] = "{$selector} .ts-item-icon svg { width: {$attributes['iconSize']}px; height: {$attributes['iconSize']}px; }";
        }
        if ( isset( $attributes['iconSize_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-item-icon i { font-size: {$attributes['iconSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-item-icon svg { width: {$attributes['iconSize_tablet']}px; height: {$attributes['iconSize_tablet']}px; }";
        }
        if ( isset( $attributes['iconSize_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-item-icon i { font-size: {$attributes['iconSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-item-icon svg { width: {$attributes['iconSize_mobile']}px; height: {$attributes['iconSize_mobile']}px; }";
        }

        // Icon color (normal/hover/active)
        if ( ! empty( $attributes['iconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-item-icon i { color: {$attributes['iconColor']}; }";
            $css_rules[] = "{$selector} .ts-item-icon svg { fill: {$attributes['iconColor']}; }";
        }
        if ( ! empty( $attributes['iconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-item-link:hover .ts-item-icon i { color: {$attributes['iconColorHover']}; }";
            $css_rules[] = "{$selector} .ts-item-link:hover .ts-item-icon svg { fill: {$attributes['iconColorHover']}; }";
        }
        if ( ! empty( $attributes['iconColorActive'] ) ) {
            $css_rules[] = "{$selector} .current-menu-item .ts-item-icon i { color: {$attributes['iconColorActive']}; }";
            $css_rules[] = "{$selector} .current-menu-item .ts-item-icon svg { fill: {$attributes['iconColorActive']}; }";
        }

        // ============================================
        // STYLE TAB - Horizontal Scroll
        // ============================================

        if ( ! empty( $attributes['scrollBg'] ) ) {
            $css_rules[] = "{$selector} .min-scroll { background-color: {$attributes['scrollBg']}; }";
        }

        // ============================================
        // STYLE TAB - Chevron
        // ============================================

        if ( ! empty( $attributes['chevronColor'] ) ) {
            $css_rules[] = "{$selector} .ts-down-icon { border-top-color: {$attributes['chevronColor']}; }";
            $css_rules[] = "{$selector} .ts-right-icon { border-left-color: {$attributes['chevronColor']}; }";
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================
        $final_css = '';

        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }

        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }

        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Userbar Block
     *
     * Handles user area items, icons, labels, avatar, unread indicators, chevron,
     * and per-item responsive visibility controls.
     *
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return string Generated CSS.
     */
    public static function generate_userbar_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-userbar-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // Item gap
        if ( isset( $attributes['itemGap'] ) ) {
            $css_rules[] = "{$selector} > ul { grid-gap: {$attributes['itemGap']}px; }";
        }
        if ( isset( $attributes['itemGapTablet'] ) ) {
            $tablet_rules[] = "{$selector} > ul { grid-gap: {$attributes['itemGapTablet']}px; }";
        }
        if ( isset( $attributes['itemGapMobile'] ) ) {
            $mobile_rules[] = "{$selector} > ul { grid-gap: {$attributes['itemGapMobile']}px; }";
        }

        // Vertical orientation
        if ( ! empty( $attributes['verticalOrientation'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a { flex-direction: column; }";
            if ( ! empty( $attributes['itemContentAlign'] ) ) {
                $css_rules[] = "{$selector} > ul > li > a { justify-content: {$attributes['itemContentAlign']}; }";
            }
        }
        if ( ! empty( $attributes['verticalOrientationTablet'] ) ) {
            $tablet_rules[] = "{$selector} > ul > li > a { flex-direction: column; }";
            if ( ! empty( $attributes['itemContentAlign'] ) ) {
                $tablet_rules[] = "{$selector} > ul > li > a { justify-content: {$attributes['itemContentAlign']}; }";
            }
        }
        if ( ! empty( $attributes['verticalOrientationMobile'] ) ) {
            $mobile_rules[] = "{$selector} > ul > li > a { flex-direction: column; }";
            if ( ! empty( $attributes['itemContentAlign'] ) ) {
                $mobile_rules[] = "{$selector} > ul > li > a { justify-content: {$attributes['itemContentAlign']}; }";
            }
        }

        // Item background
        if ( ! empty( $attributes['itemBackground'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a { background-color: {$attributes['itemBackground']}; }";
        }
        if ( ! empty( $attributes['itemBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a:hover { background-color: {$attributes['itemBackgroundHover']}; }";
        }

        // Item margin & padding
        if ( ! empty( $attributes['itemMargin'] ) ) {
            $margin = self::generate_dimensions_css( $attributes['itemMargin'], 'margin' );
            if ( $margin ) {
                $css_rules[] = "{$selector} > ul > li > a { {$margin} }";
            }
        }
        if ( ! empty( $attributes['itemPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['itemPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} > ul > li > a { {$padding} }";
            }
        }

        // Item box shadow
        if ( ! empty( $attributes['itemBoxShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['itemBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} > ul > li > a { box-shadow: {$shadow}; }";
            }
        }
        if ( ! empty( $attributes['itemBoxShadowHover']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['itemBoxShadowHover'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} > ul > li > a:hover { box-shadow: {$shadow}; }";
            }
        }

        // Item border radius
        if ( isset( $attributes['itemBorderRadius'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a { border-radius: {$attributes['itemBorderRadius']}px; }";
        }
        if ( isset( $attributes['itemBorderRadiusTablet'] ) ) {
            $tablet_rules[] = "{$selector} > ul > li > a { border-radius: {$attributes['itemBorderRadiusTablet']}px; }";
        }
        if ( isset( $attributes['itemBorderRadiusMobile'] ) ) {
            $mobile_rules[] = "{$selector} > ul > li > a { border-radius: {$attributes['itemBorderRadiusMobile']}px; }";
        }

        // Item content gap
        if ( isset( $attributes['itemContentGap'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a { grid-gap: {$attributes['itemContentGap']}px; }";
        }
        if ( isset( $attributes['itemContentGapTablet'] ) ) {
            $tablet_rules[] = "{$selector} > ul > li > a { grid-gap: {$attributes['itemContentGapTablet']}px; }";
        }
        if ( isset( $attributes['itemContentGapMobile'] ) ) {
            $mobile_rules[] = "{$selector} > ul > li > a { grid-gap: {$attributes['itemContentGapMobile']}px; }";
        }

        // Icon container size
        if ( isset( $attributes['iconContainerSize'] ) ) {
            $css_rules[] = "{$selector} .ts-comp-icon { width: {$attributes['iconContainerSize']}px; height: {$attributes['iconContainerSize']}px; }";
        }
        if ( isset( $attributes['iconContainerSizeTablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-comp-icon { width: {$attributes['iconContainerSizeTablet']}px; height: {$attributes['iconContainerSizeTablet']}px; }";
        }
        if ( isset( $attributes['iconContainerSizeMobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-comp-icon { width: {$attributes['iconContainerSizeMobile']}px; height: {$attributes['iconContainerSizeMobile']}px; }";
        }

        // Icon container border radius
        if ( isset( $attributes['iconContainerRadius'] ) ) {
            $css_rules[] = "{$selector} .ts-comp-icon { border-radius: {$attributes['iconContainerRadius']}px; }";
        }
        if ( isset( $attributes['iconContainerRadiusTablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-comp-icon { border-radius: {$attributes['iconContainerRadiusTablet']}px; }";
        }
        if ( isset( $attributes['iconContainerRadiusMobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-comp-icon { border-radius: {$attributes['iconContainerRadiusMobile']}px; }";
        }

        // Icon container background
        if ( ! empty( $attributes['iconContainerBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-comp-icon { background-color: {$attributes['iconContainerBackground']}; }";
        }
        if ( ! empty( $attributes['iconContainerBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a:hover .ts-comp-icon { background-color: {$attributes['iconContainerBackgroundHover']}; }";
        }

        // Icon size & color (CSS variables)
        if ( isset( $attributes['iconSize'] ) ) {
            $css_rules[] = "{$selector} .ts-comp-icon { --ts-icon-size: {$attributes['iconSize']}px; }";
        }
        if ( isset( $attributes['iconSizeTablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-comp-icon { --ts-icon-size: {$attributes['iconSizeTablet']}px; }";
        }
        if ( isset( $attributes['iconSizeMobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-comp-icon { --ts-icon-size: {$attributes['iconSizeMobile']}px; }";
        }

        if ( ! empty( $attributes['iconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-comp-icon { --ts-icon-color: {$attributes['iconColor']}; }";
        }
        if ( ! empty( $attributes['iconColorHover'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a:hover .ts-comp-icon { --ts-icon-color: {$attributes['iconColorHover']}; }";
        }

        // Unread indicator
        if ( ! empty( $attributes['unreadIndicatorColor'] ) ) {
            $css_rules[] = "{$selector} span.unread-indicator { background: {$attributes['unreadIndicatorColor']}; }";
        }
        if ( isset( $attributes['unreadIndicatorMargin'] ) ) {
            $css_rules[] = "{$selector} span.unread-indicator { top: {$attributes['unreadIndicatorMargin']}px; }";
        }
        if ( isset( $attributes['unreadIndicatorMarginTablet'] ) ) {
            $tablet_rules[] = "{$selector} span.unread-indicator { top: {$attributes['unreadIndicatorMarginTablet']}px; }";
        }
        if ( isset( $attributes['unreadIndicatorMarginMobile'] ) ) {
            $mobile_rules[] = "{$selector} span.unread-indicator { top: {$attributes['unreadIndicatorMarginMobile']}px; }";
        }
        if ( isset( $attributes['unreadIndicatorSize'] ) ) {
            $css_rules[] = "{$selector} span.unread-indicator { width: {$attributes['unreadIndicatorSize']}px; height: {$attributes['unreadIndicatorSize']}px; }";
        }
        if ( isset( $attributes['unreadIndicatorSizeTablet'] ) ) {
            $tablet_rules[] = "{$selector} span.unread-indicator { width: {$attributes['unreadIndicatorSizeTablet']}px; height: {$attributes['unreadIndicatorSizeTablet']}px; }";
        }
        if ( isset( $attributes['unreadIndicatorSizeMobile'] ) ) {
            $mobile_rules[] = "{$selector} span.unread-indicator { width: {$attributes['unreadIndicatorSizeMobile']}px; height: {$attributes['unreadIndicatorSizeMobile']}px; }";
        }

        // Avatar
        if ( isset( $attributes['avatarSize'] ) ) {
            $css_rules[] = "{$selector} > ul > li.ts-user-area-avatar img { width: {$attributes['avatarSize']}px; height: {$attributes['avatarSize']}px; }";
        }
        if ( isset( $attributes['avatarSizeTablet'] ) ) {
            $tablet_rules[] = "{$selector} > ul > li.ts-user-area-avatar img { width: {$attributes['avatarSizeTablet']}px; height: {$attributes['avatarSizeTablet']}px; }";
        }
        if ( isset( $attributes['avatarSizeMobile'] ) ) {
            $mobile_rules[] = "{$selector} > ul > li.ts-user-area-avatar img { width: {$attributes['avatarSizeMobile']}px; height: {$attributes['avatarSizeMobile']}px; }";
        }
        if ( isset( $attributes['avatarRadius'] ) ) {
            $css_rules[] = "{$selector} > ul > li.ts-user-area-avatar img { border-radius: {$attributes['avatarRadius']}%; }";
        }
        if ( isset( $attributes['avatarRadiusTablet'] ) ) {
            $tablet_rules[] = "{$selector} > ul > li.ts-user-area-avatar img { border-radius: {$attributes['avatarRadiusTablet']}%; }";
        }
        if ( isset( $attributes['avatarRadiusMobile'] ) ) {
            $mobile_rules[] = "{$selector} > ul > li.ts-user-area-avatar img { border-radius: {$attributes['avatarRadiusMobile']}%; }";
        }

        // Per-item responsive visibility
        if ( ! empty( $attributes['items'] ) && is_array( $attributes['items'] ) ) {
            foreach ( $attributes['items'] as $item ) {
                if ( empty( $item['_id'] ) ) {
                    continue;
                }
                $item_selector = "{$selector} .elementor-repeater-item-{$item['_id']}";

                // Label visibility
                if ( ! empty( $item['labelVisibility'] ) ) {
                    if ( ! empty( $item['labelVisibilityDesktop'] ) && $item['labelVisibilityDesktop'] === 'none' ) {
                        $css_rules[] = "{$item_selector} .ts_comp_label { display: none; }";
                    }
                    if ( ! empty( $item['labelVisibilityTablet'] ) && $item['labelVisibilityTablet'] === 'none' ) {
                        $tablet_rules[] = "{$item_selector} .ts_comp_label { display: none; }";
                    } elseif ( ! empty( $item['labelVisibilityTablet'] ) && $item['labelVisibilityTablet'] === 'flex' ) {
                        $tablet_rules[] = "{$item_selector} .ts_comp_label { display: flex; }";
                    }
                    if ( ! empty( $item['labelVisibilityMobile'] ) && $item['labelVisibilityMobile'] === 'none' ) {
                        $mobile_rules[] = "{$item_selector} .ts_comp_label { display: none; }";
                    } elseif ( ! empty( $item['labelVisibilityMobile'] ) && $item['labelVisibilityMobile'] === 'flex' ) {
                        $mobile_rules[] = "{$item_selector} .ts_comp_label { display: flex; }";
                    }
                }

                // Component visibility
                if ( ! empty( $item['componentVisibility'] ) ) {
                    if ( ! empty( $item['userBarVisibilityDesktop'] ) && $item['userBarVisibilityDesktop'] === 'none' ) {
                        $css_rules[] = "{$item_selector} { display: none !important; }";
                    }
                    if ( ! empty( $item['userBarVisibilityTablet'] ) && $item['userBarVisibilityTablet'] === 'none' ) {
                        $tablet_rules[] = "{$item_selector} { display: none !important; }";
                    } elseif ( ! empty( $item['userBarVisibilityTablet'] ) && $item['userBarVisibilityTablet'] === 'flex' ) {
                        $tablet_rules[] = "{$item_selector} { display: flex !important; }";
                    }
                    if ( ! empty( $item['userBarVisibilityMobile'] ) && $item['userBarVisibilityMobile'] === 'none' ) {
                        $mobile_rules[] = "{$item_selector} { display: none !important; }";
                    } elseif ( ! empty( $item['userBarVisibilityMobile'] ) && $item['userBarVisibilityMobile'] === 'flex' ) {
                        $mobile_rules[] = "{$item_selector} { display: flex !important; }";
                    }
                }
            }
        }

        // Label typography & color
        if ( ! empty( $attributes['labelTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['labelTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts_comp_label { {$typo} }";
            }
        }
        if ( ! empty( $attributes['labelColor'] ) ) {
            $css_rules[] = "{$selector} .ts_comp_label { color: {$attributes['labelColor']}; }";
        }
        if ( ! empty( $attributes['labelColorHover'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a:hover .ts_comp_label { color: {$attributes['labelColorHover']}; }";
        }

        // Chevron
        if ( ! empty( $attributes['chevronColor'] ) ) {
            $css_rules[] = "{$selector} .ts-down-icon { border-color: {$attributes['chevronColor']}; }";
        }
        if ( ! empty( $attributes['chevronColorHover'] ) ) {
            $css_rules[] = "{$selector} > ul > li > a:hover .ts-down-icon { border-color: {$attributes['chevronColorHover']}; }";
        }
        if ( ! empty( $attributes['hideChevron'] ) ) {
            $css_rules[] = "{$selector} .ts-down-icon { display: none !important; }";
        }

        // Popup custom style (portaled to document.body, target via popup scope class)
        if ( ! empty( $attributes['customPopupEnable'] ) ) {
            $popup_selector = '.voxel-popup-userbar-' . $block_id;

            // Popup backdrop color - user-bar.php:1036
            if ( ! empty( $attributes['popupBackdropColor'] ) ) {
                $css_rules[] = "{$popup_selector} .ts-popup-root > div::after { background-color: {$attributes['popupBackdropColor']} !important; }";
            }

            // Popup backdrop pointer events - user-bar.php:1049
            if ( ! empty( $attributes['popupPointerEvents'] ) ) {
                $css_rules[] = "{$popup_selector} .ts-popup-root > div::after { pointer-events: all; }";
            }

            // Popup box shadow - user-bar.php:1059-1066
            if ( ! empty( $attributes['popupBoxShadow']['enable'] ) ) {
                $shadow = self::generate_box_shadow_css( $attributes['popupBoxShadow'] );
                if ( $shadow ) {
                    $css_rules[] = "{$popup_selector} .ts-field-popup { box-shadow: {$shadow}; }";
                }
            }

            // Popup top/bottom margin - user-bar.php:1077
            if ( isset( $attributes['popupTopMargin'] ) && $attributes['popupTopMargin'] !== 0 ) {
                $css_rules[] = "{$popup_selector} .ts-field-popup-container { margin: {$attributes['popupTopMargin']}px 0; }";
            }
            if ( isset( $attributes['popupTopMargin_tablet'] ) ) {
                $tablet_rules[] = "{$popup_selector} .ts-field-popup-container { margin: {$attributes['popupTopMargin_tablet']}px 0; }";
            }
            if ( isset( $attributes['popupTopMargin_mobile'] ) ) {
                $mobile_rules[] = "{$popup_selector} .ts-field-popup-container { margin: {$attributes['popupTopMargin_mobile']}px 0; }";
            }

            // Popup max height - user-bar.php:1098
            if ( isset( $attributes['popupMaxHeight'] ) && $attributes['popupMaxHeight'] !== 0 ) {
                $css_rules[] = "{$popup_selector} .ts-popup-content-wrapper { max-height: {$attributes['popupMaxHeight']}px; }";
            }
            if ( isset( $attributes['popupMaxHeight_tablet'] ) ) {
                $tablet_rules[] = "{$popup_selector} .ts-popup-content-wrapper { max-height: {$attributes['popupMaxHeight_tablet']}px; }";
            }
            if ( isset( $attributes['popupMaxHeight_mobile'] ) ) {
                $mobile_rules[] = "{$popup_selector} .ts-popup-content-wrapper { max-height: {$attributes['popupMaxHeight_mobile']}px; }";
            }
        }

        // Combine all rules
        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate typography CSS string
     *
     * @param array $typography Typography settings.
     * @return string CSS properties.
     */
    private static function generate_typography_css( $typography ) {
        if ( empty( $typography ) || ! is_array( $typography ) ) {
            return '';
        }

        $props = [];

        if ( ! empty( $typography['fontFamily'] ) ) {
            $props[] = "font-family: {$typography['fontFamily']}";
        }
        if ( isset( $typography['fontSize'] ) && $typography['fontSize'] !== '' ) {
            $unit = $typography['fontSizeUnit'] ?? 'px';
            $props[] = "font-size: {$typography['fontSize']}{$unit}";
        }
        if ( ! empty( $typography['fontWeight'] ) ) {
            $props[] = "font-weight: {$typography['fontWeight']}";
        }
        if ( ! empty( $typography['fontStyle'] ) ) {
            $props[] = "font-style: {$typography['fontStyle']}";
        }
        if ( ! empty( $typography['textTransform'] ) ) {
            $props[] = "text-transform: {$typography['textTransform']}";
        }
        if ( ! empty( $typography['textDecoration'] ) ) {
            $props[] = "text-decoration: {$typography['textDecoration']}";
        }
        if ( isset( $typography['lineHeight'] ) && $typography['lineHeight'] !== '' ) {
            $unit = $typography['lineHeightUnit'] ?? '';
            $props[] = "line-height: {$typography['lineHeight']}{$unit}";
        }
        if ( isset( $typography['letterSpacing'] ) && $typography['letterSpacing'] !== '' ) {
            $unit = $typography['letterSpacingUnit'] ?? 'px';
            $props[] = "letter-spacing: {$typography['letterSpacing']}{$unit}";
        }
        if ( isset( $typography['wordSpacing'] ) && $typography['wordSpacing'] !== '' ) {
            $unit = $typography['wordSpacingUnit'] ?? 'px';
            $props[] = "word-spacing: {$typography['wordSpacing']}{$unit}";
        }

        return implode( '; ', $props );
    }

    /**
     * Generate dimensions CSS (padding/margin)
     *
     * @param array  $dimensions Dimensions values.
     * @param string $property   CSS property (padding/margin).
     * @return string CSS declaration.
     */
    private static function generate_dimensions_css( $dimensions, $property ) {
        if ( empty( $dimensions ) || ! is_array( $dimensions ) ) {
            return '';
        }

        // Helper: Format value - add unit only if not already present
        $format_value = function( $value, $default_unit ) {
            if ( $value === '' || $value === null ) {
                return null;
            }

            // If value already contains a unit (e.g., "3px"), return as-is
            if ( preg_match( '/^[\d.]+(?:px|%|em|rem|vw|vh)$/', $value ) ) {
                return $value;
            }

            // If value is just a number, add the default unit
            if ( is_numeric( $value ) ) {
                return $value . $default_unit;
            }

            // Fallback: return as-is
            return $value;
        };

        $unit = $dimensions['unit'] ?? 'px';
        $props = [];

        if ( isset( $dimensions['top'] ) && $dimensions['top'] !== '' ) {
            $formatted = $format_value( $dimensions['top'], $unit );
            if ( $formatted !== null ) {
                $props[] = "{$property}-top: {$formatted}";
            }
        }
        if ( isset( $dimensions['right'] ) && $dimensions['right'] !== '' ) {
            $formatted = $format_value( $dimensions['right'], $unit );
            if ( $formatted !== null ) {
                $props[] = "{$property}-right: {$formatted}";
            }
        }
        if ( isset( $dimensions['bottom'] ) && $dimensions['bottom'] !== '' ) {
            $formatted = $format_value( $dimensions['bottom'], $unit );
            if ( $formatted !== null ) {
                $props[] = "{$property}-bottom: {$formatted}";
            }
        }
        if ( isset( $dimensions['left'] ) && $dimensions['left'] !== '' ) {
            $formatted = $format_value( $dimensions['left'], $unit );
            if ( $formatted !== null ) {
                $props[] = "{$property}-left: {$formatted}";
            }
        }

        return implode( '; ', $props );
    }

    /**
     * Generate border CSS
     *
     * Handles TWO formats:
     * 1. OLD BorderControl format: { width: 1, style: 'solid', color: '#000' }
     * 2. NEW BorderGroupControl format: { borderType: 'solid', borderWidth: {...}, borderColor: '#000' }
     *
     * @param array $border Border settings.
     * @return string Border CSS value (e.g., "1px solid #000").
     */
    private static function generate_border_css( $border ) {
        if ( empty( $border ) || ! is_array( $border ) ) {
            return '';
        }

        // Detect which format we have
        $is_border_group = isset( $border['borderType'] ) || isset( $border['borderWidth'] ) || isset( $border['borderColor'] );

        if ( $is_border_group ) {
            // NEW BorderGroupControl format
            $type = $border['borderType'] ?? '';

            // If borderType is 'none' or empty string (default), return empty
            if ( empty( $type ) || $type === 'none' || $type === '' ) {
                return '';
            }

            // Extract width from borderWidth dimensions (use top value or average)
            $width = '1'; // Default
            if ( ! empty( $border['borderWidth'] ) && is_array( $border['borderWidth'] ) ) {
                $dims = $border['borderWidth'];
                // Use top value, stripping any existing units
                if ( isset( $dims['top'] ) ) {
                    $width = preg_replace( '/[^0-9.]/', '', $dims['top'] );
                } elseif ( isset( $dims['left'] ) ) {
                    $width = preg_replace( '/[^0-9.]/', '', $dims['left'] );
                }
            }

            // Use borderColor if set, otherwise don't generate border CSS at all
            // (this prevents the hardcoded #000 fallback issue)
            if ( empty( $border['borderColor'] ) ) {
                return '';
            }

            $color = $border['borderColor'];

            return "{$width}px {$type} {$color}";
        } else {
            // OLD BorderControl format
            $width = $border['width'] ?? '1';
            $style = $border['style'] ?? 'solid';
            $color = $border['color'] ?? '#000';

            return "{$width}px {$style} {$color}";
        }
    }

    /**
     * Generate box shadow CSS
     *
     * @param array $shadow Box shadow settings.
     * @return string Box shadow CSS value.
     */
    private static function generate_box_shadow_css( $shadow ) {
        if ( empty( $shadow ) || ! is_array( $shadow ) ) {
            return '';
        }

        $horizontal = $shadow['horizontal'] ?? 0;
        $vertical = $shadow['vertical'] ?? 0;
        $blur = $shadow['blur'] ?? 0;
        $spread = $shadow['spread'] ?? 0;
        $color = $shadow['color'] ?? 'rgba(0,0,0,0.5)';
        $position = ! empty( $shadow['position'] ) && $shadow['position'] === 'inset' ? 'inset ' : '';

        return "{$position}{$horizontal}px {$vertical}px {$blur}px {$spread}px {$color}";
    }

    /**
     * Generate background CSS for a named prefix
     *
     * @param array  $attributes Block attributes.
     * @param string $prefix     Attribute prefix (e.g. 'responder1', 'responder2', 'error').
     * @return string|null CSS background declaration or null.
     */
    private static function generate_background_css( $attributes, $prefix ) {
        $bg_color = $attributes[ $prefix . 'BgColor' ] ?? ( $attributes[ $prefix . 'Background' ] ?? null );
        if ( ! empty( $bg_color ) ) {
            return "background-color: {$bg_color};";
        }
        return null;
    }

    /**
     * Generate CSS for Messages Block
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Unique block ID
     * @return string Generated CSS
     */
    public static function generate_messages_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-messages-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // ============================================
        // 1. GENERAL
        // ============================================

        // Height
        if ( isset( $attributes['generalHeight'] ) && $attributes['generalHeight'] !== '' ) {
            $unit = $attributes['generalHeightUnit'] ?? 'px';
            $css_rules[] = "{$selector} { height: {$attributes['generalHeight']}{$unit}; }";
        }
        if ( isset( $attributes['generalHeightTablet'] ) && $attributes['generalHeightTablet'] !== '' ) {
            $unit = $attributes['generalHeightUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} { height: {$attributes['generalHeightTablet']}{$unit}; }";
        }
        if ( isset( $attributes['generalHeightMobile'] ) && $attributes['generalHeightMobile'] !== '' ) {
            $unit = $attributes['generalHeightUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} { height: {$attributes['generalHeightMobile']}{$unit}; }";
        }

        // Calculated height
        if ( ! empty( $attributes['enableCalcHeight'] ) && ! empty( $attributes['calcHeight'] ) ) {
            $css_rules[] = "{$selector} { height: {$attributes['calcHeight']}; }";
        }

        // Background color
        if ( ! empty( $attributes['generalBackground'] ) ) {
            $css_rules[] = "{$selector} { background-color: {$attributes['generalBackground']}; }";
        }

        // Border
        $border_css = self::generate_border_css(
            $attributes['generalBorderType'] ?? null,
            $attributes['generalBorderWidth'] ?? null,
            $attributes['generalBorderColor'] ?? null
        );
        if ( $border_css ) {
            $css_rules[] = "{$selector} { {$border_css} }";
        }

        // Border radius
        if ( isset( $attributes['generalBorderRadius'] ) && $attributes['generalBorderRadius'] !== '' ) {
            $css_rules[] = "{$selector} { border-radius: {$attributes['generalBorderRadius']}px; }";
        }

        // Box shadow
        if ( ! empty( $attributes['generalBoxShadow'] ) && ! empty( $attributes['generalBoxShadow']['enable'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['generalBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} { box-shadow: {$shadow}; }";
            }
        }

        // Sidebar width
        if ( isset( $attributes['sidebarWidth'] ) && $attributes['sidebarWidth'] !== '' ) {
            $css_rules[] = "{$selector} .message-list-container { width: {$attributes['sidebarWidth']}px; }";
        }

        // Separator color
        if ( ! empty( $attributes['separatorColor'] ) ) {
            $css_rules[] = "{$selector} .separator { background-color: {$attributes['separatorColor']}; }";
        }

        // Scrollbar color
        if ( ! empty( $attributes['scrollbarColor'] ) ) {
            $css_rules[] = "{$selector} .message-list::-webkit-scrollbar-thumb { background-color: {$attributes['scrollbarColor']}; }";
            $css_rules[] = "{$selector} .conversation-body::-webkit-scrollbar-thumb { background-color: {$attributes['scrollbarColor']}; }";
        }

        // ============================================
        // 2. INBOX: MESSAGE
        // ============================================

        // Padding
        if ( ! empty( $attributes['inboxMessagePadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['inboxMessagePadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .ts-convo-list > li > a { {$padding} }";
            }
        }

        // Content gap
        if ( isset( $attributes['inboxMessageContentGap'] ) && $attributes['inboxMessageContentGap'] !== '' ) {
            $css_rules[] = "{$selector} .ts-convo-list > li > a { gap: {$attributes['inboxMessageContentGap']}px; }";
        }

        // Title color
        if ( ! empty( $attributes['inboxMessageTitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list .message-details > b { color: {$attributes['inboxMessageTitleColor']}; }";
        }

        // Title typography
        if ( ! empty( $attributes['inboxMessageTitleTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['inboxMessageTitleTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-convo-list .message-details > b { {$typo} }";
            }
        }

        // Subtitle color
        if ( ! empty( $attributes['inboxMessageSubtitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list .message-details > span { color: {$attributes['inboxMessageSubtitleColor']}; }";
        }

        // Subtitle typography
        if ( ! empty( $attributes['inboxMessageSubtitleTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['inboxMessageSubtitleTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-convo-list .message-details > span { {$typo} }";
            }
        }

        // Avatar size
        if ( isset( $attributes['inboxMessageAvatarSize'] ) && $attributes['inboxMessageAvatarSize'] !== '' ) {
            $unit = $attributes['inboxMessageAvatarSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-convo-list .convo-avatar { width: {$attributes['inboxMessageAvatarSize']}{$unit}; height: {$attributes['inboxMessageAvatarSize']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageAvatarSize_tablet'] ) && $attributes['inboxMessageAvatarSize_tablet'] !== '' ) {
            $unit = $attributes['inboxMessageAvatarSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-convo-list .convo-avatar { width: {$attributes['inboxMessageAvatarSize_tablet']}{$unit}; height: {$attributes['inboxMessageAvatarSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageAvatarSize_mobile'] ) && $attributes['inboxMessageAvatarSize_mobile'] !== '' ) {
            $unit = $attributes['inboxMessageAvatarSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-convo-list .convo-avatar { width: {$attributes['inboxMessageAvatarSize_mobile']}{$unit}; height: {$attributes['inboxMessageAvatarSize_mobile']}{$unit}; }";
        }

        // Avatar gap
        if ( isset( $attributes['inboxMessageAvatarGap'] ) && $attributes['inboxMessageAvatarGap'] !== '' ) {
            $unit = $attributes['inboxMessageAvatarGapUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-convo-list > li > a { column-gap: {$attributes['inboxMessageAvatarGap']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageAvatarGap_tablet'] ) && $attributes['inboxMessageAvatarGap_tablet'] !== '' ) {
            $unit = $attributes['inboxMessageAvatarGapUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-convo-list > li > a { column-gap: {$attributes['inboxMessageAvatarGap_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageAvatarGap_mobile'] ) && $attributes['inboxMessageAvatarGap_mobile'] !== '' ) {
            $unit = $attributes['inboxMessageAvatarGapUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-convo-list > li > a { column-gap: {$attributes['inboxMessageAvatarGap_mobile']}{$unit}; }";
        }

        // Secondary logo size
        if ( isset( $attributes['inboxMessageSecondaryLogoSize'] ) && $attributes['inboxMessageSecondaryLogoSize'] !== '' ) {
            $unit = $attributes['inboxMessageSecondaryLogoSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-convo-list .post-avatar { width: {$attributes['inboxMessageSecondaryLogoSize']}{$unit}; height: {$attributes['inboxMessageSecondaryLogoSize']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageSecondaryLogoSize_tablet'] ) && $attributes['inboxMessageSecondaryLogoSize_tablet'] !== '' ) {
            $unit = $attributes['inboxMessageSecondaryLogoSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-convo-list .post-avatar { width: {$attributes['inboxMessageSecondaryLogoSize_tablet']}{$unit}; height: {$attributes['inboxMessageSecondaryLogoSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageSecondaryLogoSize_mobile'] ) && $attributes['inboxMessageSecondaryLogoSize_mobile'] !== '' ) {
            $unit = $attributes['inboxMessageSecondaryLogoSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-convo-list .post-avatar { width: {$attributes['inboxMessageSecondaryLogoSize_mobile']}{$unit}; height: {$attributes['inboxMessageSecondaryLogoSize_mobile']}{$unit}; }";
        }

        // Secondary logo border
        if ( ! empty( $attributes['inboxMessageSecondaryLogoBorder'] ) ) {
            $border = self::generate_border_css(
                $attributes['inboxMessageSecondaryLogoBorder']['borderType'] ?? null,
                $attributes['inboxMessageSecondaryLogoBorder']['borderWidth'] ?? null,
                $attributes['inboxMessageSecondaryLogoBorder']['borderColor'] ?? null
            );
            if ( $border ) {
                $css_rules[] = "{$selector} .ts-convo-list .post-avatar { {$border} }";
            }
        }

        // Hover state
        if ( ! empty( $attributes['inboxMessageHoverBg'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li > a:hover { background-color: {$attributes['inboxMessageHoverBg']}; }";
        }
        if ( ! empty( $attributes['inboxMessageHoverTitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li > a:hover .message-details > b { color: {$attributes['inboxMessageHoverTitleColor']}; }";
        }
        if ( ! empty( $attributes['inboxMessageHoverSubtitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li > a:hover .message-details > span { color: {$attributes['inboxMessageHoverSubtitleColor']}; }";
        }

        // Active state
        if ( ! empty( $attributes['inboxMessageActiveBg'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat > a { background-color: {$attributes['inboxMessageActiveBg']}; }";
        }
        if ( isset( $attributes['inboxMessageActiveBorderWidth'] ) && $attributes['inboxMessageActiveBorderWidth'] !== '' ) {
            $unit = $attributes['inboxMessageActiveBorderWidthUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat > a { border-left-width: {$attributes['inboxMessageActiveBorderWidth']}{$unit}; border-left-style: solid; }";
        }
        if ( isset( $attributes['inboxMessageActiveBorderWidth_tablet'] ) && $attributes['inboxMessageActiveBorderWidth_tablet'] !== '' ) {
            $unit = $attributes['inboxMessageActiveBorderWidthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat > a { border-left-width: {$attributes['inboxMessageActiveBorderWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['inboxMessageActiveBorderWidth_mobile'] ) && $attributes['inboxMessageActiveBorderWidth_mobile'] !== '' ) {
            $unit = $attributes['inboxMessageActiveBorderWidthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat > a { border-left-width: {$attributes['inboxMessageActiveBorderWidth_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['inboxMessageActiveBorderColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat > a { border-left-color: {$attributes['inboxMessageActiveBorderColor']}; }";
        }
        if ( ! empty( $attributes['inboxMessageActiveTitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat .message-details > b { color: {$attributes['inboxMessageActiveTitleColor']}; }";
        }
        if ( ! empty( $attributes['inboxMessageActiveSubtitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-convo-list > li.ts-active-chat .message-details > span { color: {$attributes['inboxMessageActiveSubtitleColor']}; }";
        }

        // Unread state
        if ( ! empty( $attributes['inboxMessageUnreadTitleTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['inboxMessageUnreadTitleTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-convo-list > li.ts-unread-message .message-details > b { {$typo} }";
            }
        }

        // New state - avatar border
        if ( ! empty( $attributes['inboxMessageNewAvatarBorder'] ) ) {
            $border = self::generate_border_css(
                $attributes['inboxMessageNewAvatarBorder']['borderType'] ?? null,
                $attributes['inboxMessageNewAvatarBorder']['borderWidth'] ?? null,
                $attributes['inboxMessageNewAvatarBorder']['borderColor'] ?? null
            );
            if ( $border ) {
                $css_rules[] = "{$selector} .ts-convo-list > li.ts-new-message .convo-avatar { {$border} }";
            }
        }

        // ============================================
        // 3. INBOX: SEARCH
        // ============================================

        if ( ! empty( $attributes['inboxSearchTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['inboxSearchTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .inbox-search input { {$typo} }";
            }
        }
        if ( ! empty( $attributes['inboxSearchValueColor'] ) ) {
            $css_rules[] = "{$selector} .inbox-search input { color: {$attributes['inboxSearchValueColor']}; }";
        }
        if ( ! empty( $attributes['inboxSearchPlaceholderColor'] ) ) {
            $css_rules[] = "{$selector} .inbox-search input::placeholder { color: {$attributes['inboxSearchPlaceholderColor']}; }";
        }
        if ( ! empty( $attributes['inboxSearchIconColor'] ) ) {
            $css_rules[] = "{$selector} .inbox-search .search-icon { color: {$attributes['inboxSearchIconColor']}; }";
        }
        if ( isset( $attributes['inboxSearchIconSize'] ) && $attributes['inboxSearchIconSize'] !== '' ) {
            $unit = $attributes['inboxSearchIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .inbox-search .search-icon { font-size: {$attributes['inboxSearchIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['inboxSearchIconSize_tablet'] ) && $attributes['inboxSearchIconSize_tablet'] !== '' ) {
            $unit = $attributes['inboxSearchIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .inbox-search .search-icon { font-size: {$attributes['inboxSearchIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['inboxSearchIconSize_mobile'] ) && $attributes['inboxSearchIconSize_mobile'] !== '' ) {
            $unit = $attributes['inboxSearchIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .inbox-search .search-icon { font-size: {$attributes['inboxSearchIconSize_mobile']}{$unit}; }";
        }

        // ============================================
        // 4. CONVERSATION: TOP
        // ============================================

        if ( isset( $attributes['conversationTopAvatarRadius'] ) && $attributes['conversationTopAvatarRadius'] !== '' ) {
            $unit = $attributes['conversationTopAvatarRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .conversation-top .avatar { border-radius: {$attributes['conversationTopAvatarRadius']}{$unit}; }";
        }
        if ( isset( $attributes['conversationTopAvatarRadius_tablet'] ) && $attributes['conversationTopAvatarRadius_tablet'] !== '' ) {
            $unit = $attributes['conversationTopAvatarRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .conversation-top .avatar { border-radius: {$attributes['conversationTopAvatarRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationTopAvatarRadius_mobile'] ) && $attributes['conversationTopAvatarRadius_mobile'] !== '' ) {
            $unit = $attributes['conversationTopAvatarRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .conversation-top .avatar { border-radius: {$attributes['conversationTopAvatarRadius_mobile']}{$unit}; }";
        }
        if ( isset( $attributes['conversationTopAvatarGap'] ) && $attributes['conversationTopAvatarGap'] !== '' ) {
            $unit = $attributes['conversationTopAvatarGapUnit'] ?? 'px';
            $css_rules[] = "{$selector} .conversation-top { gap: {$attributes['conversationTopAvatarGap']}{$unit}; }";
        }
        if ( isset( $attributes['conversationTopAvatarGap_tablet'] ) && $attributes['conversationTopAvatarGap_tablet'] !== '' ) {
            $unit = $attributes['conversationTopAvatarGapUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .conversation-top { gap: {$attributes['conversationTopAvatarGap_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationTopAvatarGap_mobile'] ) && $attributes['conversationTopAvatarGap_mobile'] !== '' ) {
            $unit = $attributes['conversationTopAvatarGapUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .conversation-top { gap: {$attributes['conversationTopAvatarGap_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['conversationTopTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['conversationTopTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .conversation-top .name { {$typo} }";
            }
        }
        if ( ! empty( $attributes['conversationTopTextColor'] ) ) {
            $css_rules[] = "{$selector} .conversation-top .name { color: {$attributes['conversationTopTextColor']}; }";
        }

        // ============================================
        // 5. CONVERSATION: INTRO
        // ============================================

        if ( isset( $attributes['conversationIntroContentGap'] ) && $attributes['conversationIntroContentGap'] !== '' ) {
            $unit = $attributes['conversationIntroContentGapUnit'] ?? 'px';
            $css_rules[] = "{$selector} .conversation-intro { gap: {$attributes['conversationIntroContentGap']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroContentGap_tablet'] ) && $attributes['conversationIntroContentGap_tablet'] !== '' ) {
            $unit = $attributes['conversationIntroContentGapUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .conversation-intro { gap: {$attributes['conversationIntroContentGap_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroContentGap_mobile'] ) && $attributes['conversationIntroContentGap_mobile'] !== '' ) {
            $unit = $attributes['conversationIntroContentGapUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .conversation-intro { gap: {$attributes['conversationIntroContentGap_mobile']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroAvatarSize'] ) && $attributes['conversationIntroAvatarSize'] !== '' ) {
            $unit = $attributes['conversationIntroAvatarSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .conversation-intro .avatar { width: {$attributes['conversationIntroAvatarSize']}{$unit}; height: {$attributes['conversationIntroAvatarSize']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroAvatarSize_tablet'] ) && $attributes['conversationIntroAvatarSize_tablet'] !== '' ) {
            $unit = $attributes['conversationIntroAvatarSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .conversation-intro .avatar { width: {$attributes['conversationIntroAvatarSize_tablet']}{$unit}; height: {$attributes['conversationIntroAvatarSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroAvatarSize_mobile'] ) && $attributes['conversationIntroAvatarSize_mobile'] !== '' ) {
            $unit = $attributes['conversationIntroAvatarSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .conversation-intro .avatar { width: {$attributes['conversationIntroAvatarSize_mobile']}{$unit}; height: {$attributes['conversationIntroAvatarSize_mobile']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroAvatarRadius'] ) && $attributes['conversationIntroAvatarRadius'] !== '' ) {
            $unit = $attributes['conversationIntroAvatarRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .conversation-intro .avatar { border-radius: {$attributes['conversationIntroAvatarRadius']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroAvatarRadius_tablet'] ) && $attributes['conversationIntroAvatarRadius_tablet'] !== '' ) {
            $unit = $attributes['conversationIntroAvatarRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .conversation-intro .avatar { border-radius: {$attributes['conversationIntroAvatarRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationIntroAvatarRadius_mobile'] ) && $attributes['conversationIntroAvatarRadius_mobile'] !== '' ) {
            $unit = $attributes['conversationIntroAvatarRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .conversation-intro .avatar { border-radius: {$attributes['conversationIntroAvatarRadius_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['conversationIntroNameTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['conversationIntroNameTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .conversation-intro .name { {$typo} }";
            }
        }
        if ( ! empty( $attributes['conversationIntroNameColor'] ) ) {
            $css_rules[] = "{$selector} .conversation-intro .name { color: {$attributes['conversationIntroNameColor']}; }";
        }
        if ( ! empty( $attributes['conversationIntroSubtitleTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['conversationIntroSubtitleTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .conversation-intro .subtitle { {$typo} }";
            }
        }
        if ( ! empty( $attributes['conversationIntroSubtitleColor'] ) ) {
            $css_rules[] = "{$selector} .conversation-intro .subtitle { color: {$attributes['conversationIntroSubtitleColor']}; }";
        }

        // ============================================
        // 6. CONVERSATION: BODY
        // ============================================

        if ( isset( $attributes['conversationBodyMessageGap'] ) && $attributes['conversationBodyMessageGap'] !== '' ) {
            $unit = $attributes['conversationBodyMessageGapUnit'] ?? 'px';
            $css_rules[] = "{$selector} .conversation-body { gap: {$attributes['conversationBodyMessageGap']}{$unit}; }";
        }
        if ( isset( $attributes['conversationBodyMessageGap_tablet'] ) && $attributes['conversationBodyMessageGap_tablet'] !== '' ) {
            $unit = $attributes['conversationBodyMessageGapUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .conversation-body { gap: {$attributes['conversationBodyMessageGap_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationBodyMessageGap_mobile'] ) && $attributes['conversationBodyMessageGap_mobile'] !== '' ) {
            $unit = $attributes['conversationBodyMessageGapUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .conversation-body { gap: {$attributes['conversationBodyMessageGap_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['conversationBodyMessagePadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['conversationBodyMessagePadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .message-bubble { {$padding} }";
            }
        }
        if ( ! empty( $attributes['conversationBodyMessageTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['conversationBodyMessageTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .message-bubble { {$typo} }";
            }
        }
        if ( isset( $attributes['conversationBodyMessageRadius'] ) && $attributes['conversationBodyMessageRadius'] !== '' ) {
            $unit = $attributes['conversationBodyMessageRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .message-bubble { border-radius: {$attributes['conversationBodyMessageRadius']}{$unit}; }";
        }
        if ( isset( $attributes['conversationBodyMessageRadius_tablet'] ) && $attributes['conversationBodyMessageRadius_tablet'] !== '' ) {
            $unit = $attributes['conversationBodyMessageRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .message-bubble { border-radius: {$attributes['conversationBodyMessageRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['conversationBodyMessageRadius_mobile'] ) && $attributes['conversationBodyMessageRadius_mobile'] !== '' ) {
            $unit = $attributes['conversationBodyMessageRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .message-bubble { border-radius: {$attributes['conversationBodyMessageRadius_mobile']}{$unit}; }";
        }

        // Responder 1
        $responder1_bg = self::generate_background_css( $attributes, 'responder1' );
        if ( $responder1_bg ) {
            $css_rules[] = "{$selector} .message-bubble.responder-1 { {$responder1_bg} }";
        }
        if ( ! empty( $attributes['responder1Color'] ) ) {
            $css_rules[] = "{$selector} .message-bubble.responder-1 { color: {$attributes['responder1Color']}; }";
        }

        // Responder 2
        $responder2_bg = self::generate_background_css( $attributes, 'responder2' );
        if ( $responder2_bg ) {
            $css_rules[] = "{$selector} .message-bubble.responder-2 { {$responder2_bg} }";
        }
        if ( ! empty( $attributes['responder2Color'] ) ) {
            $css_rules[] = "{$selector} .message-bubble.responder-2 { color: {$attributes['responder2Color']}; }";
        }

        // Error
        $error_bg = self::generate_background_css( $attributes, 'error' );
        if ( $error_bg ) {
            $css_rules[] = "{$selector} .message-bubble.error { {$error_bg} }";
        }
        if ( ! empty( $attributes['errorColor'] ) ) {
            $css_rules[] = "{$selector} .message-bubble.error { color: {$attributes['errorColor']}; }";
        }

        // Message info
        if ( ! empty( $attributes['messageInfoTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['messageInfoTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .message-info { {$typo} }";
            }
        }
        if ( ! empty( $attributes['messageInfoDefaultColor'] ) ) {
            $css_rules[] = "{$selector} .message-info { color: {$attributes['messageInfoDefaultColor']}; }";
        }
        if ( ! empty( $attributes['messageInfoDeleteColor'] ) ) {
            $css_rules[] = "{$selector} .message-info .delete { color: {$attributes['messageInfoDeleteColor']}; }";
        }

        // Seen
        if ( ! empty( $attributes['seenTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['seenTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .seen-indicator { {$typo} }";
            }
        }
        if ( ! empty( $attributes['seenColor'] ) ) {
            $css_rules[] = "{$selector} .seen-indicator { color: {$attributes['seenColor']}; }";
        }

        // Images
        if ( isset( $attributes['imagesRadius'] ) && $attributes['imagesRadius'] !== '' ) {
            $unit = $attributes['imagesRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .message-image { border-radius: {$attributes['imagesRadius']}{$unit}; }";
        }
        if ( isset( $attributes['imagesRadius_tablet'] ) && $attributes['imagesRadius_tablet'] !== '' ) {
            $unit = $attributes['imagesRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .message-image { border-radius: {$attributes['imagesRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['imagesRadius_mobile'] ) && $attributes['imagesRadius_mobile'] !== '' ) {
            $unit = $attributes['imagesRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .message-image { border-radius: {$attributes['imagesRadius_mobile']}{$unit}; }";
        }

        // ============================================
        // 7. CONVERSATION: COMPOSE
        // ============================================

        if ( isset( $attributes['composeAvatarRadius'] ) && $attributes['composeAvatarRadius'] !== '' ) {
            $unit = $attributes['composeAvatarRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .compose-area .avatar { border-radius: {$attributes['composeAvatarRadius']}{$unit}; }";
        }
        if ( isset( $attributes['composeAvatarRadius_tablet'] ) && $attributes['composeAvatarRadius_tablet'] !== '' ) {
            $unit = $attributes['composeAvatarRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .compose-area .avatar { border-radius: {$attributes['composeAvatarRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['composeAvatarRadius_mobile'] ) && $attributes['composeAvatarRadius_mobile'] !== '' ) {
            $unit = $attributes['composeAvatarRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .compose-area .avatar { border-radius: {$attributes['composeAvatarRadius_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['composePlaceholderTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['composePlaceholderTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .compose-area textarea::placeholder { {$typo} }";
            }
        }
        if ( ! empty( $attributes['composePlaceholderColor'] ) ) {
            $css_rules[] = "{$selector} .compose-area textarea::placeholder { color: {$attributes['composePlaceholderColor']}; }";
        }
        if ( ! empty( $attributes['composeValueTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['composeValueTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .compose-area textarea { {$typo} }";
            }
        }
        if ( ! empty( $attributes['composeValueColor'] ) ) {
            $css_rules[] = "{$selector} .compose-area textarea { color: {$attributes['composeValueColor']}; }";
        }

        // ============================================
        // 8. ICON BUTTON
        // ============================================

        if ( ! empty( $attributes['iconButtonColor'] ) ) {
            $css_rules[] = "{$selector} .icon-button { color: {$attributes['iconButtonColor']}; }";
        }
        if ( ! empty( $attributes['iconButtonBackground'] ) ) {
            $css_rules[] = "{$selector} .icon-button { background-color: {$attributes['iconButtonBackground']}; }";
        }
        $icon_button_border = self::generate_border_css(
            $attributes['iconButtonBorderType'] ?? null,
            $attributes['iconButtonBorderWidth'] ?? null,
            $attributes['iconButtonBorderColor'] ?? null
        );
        if ( $icon_button_border ) {
            $css_rules[] = "{$selector} .icon-button { {$icon_button_border} }";
        }
        if ( isset( $attributes['iconButtonRadius'] ) && $attributes['iconButtonRadius'] !== '' ) {
            $unit = $attributes['iconButtonRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .icon-button { border-radius: {$attributes['iconButtonRadius']}{$unit}; }";
        }
        if ( isset( $attributes['iconButtonRadius_tablet'] ) && $attributes['iconButtonRadius_tablet'] !== '' ) {
            $unit = $attributes['iconButtonRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .icon-button { border-radius: {$attributes['iconButtonRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['iconButtonRadius_mobile'] ) && $attributes['iconButtonRadius_mobile'] !== '' ) {
            $unit = $attributes['iconButtonRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .icon-button { border-radius: {$attributes['iconButtonRadius_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['iconButtonHoverColor'] ) ) {
            $css_rules[] = "{$selector} .icon-button:hover { color: {$attributes['iconButtonHoverColor']}; }";
        }
        if ( ! empty( $attributes['iconButtonHoverBackground'] ) ) {
            $css_rules[] = "{$selector} .icon-button:hover { background-color: {$attributes['iconButtonHoverBackground']}; }";
        }
        if ( ! empty( $attributes['iconButtonHoverBorderColor'] ) ) {
            $css_rules[] = "{$selector} .icon-button:hover { border-color: {$attributes['iconButtonHoverBorderColor']}; }";
        }

        // ============================================
        // 9. TERTIARY BUTTON
        // ============================================

        if ( ! empty( $attributes['tertiaryButtonIconColor'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button .icon { color: {$attributes['tertiaryButtonIconColor']}; }";
        }
        if ( isset( $attributes['tertiaryButtonIconSize'] ) && $attributes['tertiaryButtonIconSize'] !== '' ) {
            $unit = $attributes['tertiaryButtonIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .tertiary-button .icon { font-size: {$attributes['tertiaryButtonIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['tertiaryButtonIconSize_tablet'] ) && $attributes['tertiaryButtonIconSize_tablet'] !== '' ) {
            $unit = $attributes['tertiaryButtonIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .tertiary-button .icon { font-size: {$attributes['tertiaryButtonIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['tertiaryButtonIconSize_mobile'] ) && $attributes['tertiaryButtonIconSize_mobile'] !== '' ) {
            $unit = $attributes['tertiaryButtonIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .tertiary-button .icon { font-size: {$attributes['tertiaryButtonIconSize_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['tertiaryButtonBackground'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button { background-color: {$attributes['tertiaryButtonBackground']}; }";
        }
        $tertiary_button_border = self::generate_border_css(
            $attributes['tertiaryButtonBorderType'] ?? null,
            $attributes['tertiaryButtonBorderWidth'] ?? null,
            $attributes['tertiaryButtonBorderColor'] ?? null
        );
        if ( $tertiary_button_border ) {
            $css_rules[] = "{$selector} .tertiary-button { {$tertiary_button_border} }";
        }
        if ( isset( $attributes['tertiaryButtonRadius'] ) && $attributes['tertiaryButtonRadius'] !== '' ) {
            $unit = $attributes['tertiaryButtonRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .tertiary-button { border-radius: {$attributes['tertiaryButtonRadius']}{$unit}; }";
        }
        if ( isset( $attributes['tertiaryButtonRadius_tablet'] ) && $attributes['tertiaryButtonRadius_tablet'] !== '' ) {
            $unit = $attributes['tertiaryButtonRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .tertiary-button { border-radius: {$attributes['tertiaryButtonRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['tertiaryButtonRadius_mobile'] ) && $attributes['tertiaryButtonRadius_mobile'] !== '' ) {
            $unit = $attributes['tertiaryButtonRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .tertiary-button { border-radius: {$attributes['tertiaryButtonRadius_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['tertiaryButtonTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['tertiaryButtonTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .tertiary-button { {$typo} }";
            }
        }
        if ( ! empty( $attributes['tertiaryButtonTextColor'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button { color: {$attributes['tertiaryButtonTextColor']}; }";
        }
        if ( ! empty( $attributes['tertiaryButtonHoverIconColor'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button:hover .icon { color: {$attributes['tertiaryButtonHoverIconColor']}; }";
        }
        if ( ! empty( $attributes['tertiaryButtonHoverBackground'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button:hover { background-color: {$attributes['tertiaryButtonHoverBackground']}; }";
        }
        if ( ! empty( $attributes['tertiaryButtonHoverBorderColor'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button:hover { border-color: {$attributes['tertiaryButtonHoverBorderColor']}; }";
        }
        if ( ! empty( $attributes['tertiaryButtonHoverTextColor'] ) ) {
            $css_rules[] = "{$selector} .tertiary-button:hover { color: {$attributes['tertiaryButtonHoverTextColor']}; }";
        }

        // ============================================
        // 10. NO MESSAGES / NO CHAT SELECTED
        // ============================================

        if ( isset( $attributes['emptyIconSize'] ) && $attributes['emptyIconSize'] !== '' ) {
            $unit = $attributes['emptyIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .empty-state .icon { font-size: {$attributes['emptyIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['emptyIconSize_tablet'] ) && $attributes['emptyIconSize_tablet'] !== '' ) {
            $unit = $attributes['emptyIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .empty-state .icon { font-size: {$attributes['emptyIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['emptyIconSize_mobile'] ) && $attributes['emptyIconSize_mobile'] !== '' ) {
            $unit = $attributes['emptyIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .empty-state .icon { font-size: {$attributes['emptyIconSize_mobile']}{$unit}; }";
        }
        if ( ! empty( $attributes['emptyIconColor'] ) ) {
            $css_rules[] = "{$selector} .empty-state .icon { color: {$attributes['emptyIconColor']}; }";
        }
        if ( ! empty( $attributes['emptyTitleColor'] ) ) {
            $css_rules[] = "{$selector} .empty-state .title { color: {$attributes['emptyTitleColor']}; }";
        }
        if ( ! empty( $attributes['emptyTitleTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['emptyTitleTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .empty-state .title { {$typo} }";
            }
        }

        // ============================================
        // 11. LOADING
        // ============================================

        if ( ! empty( $attributes['loadingColor1'] ) ) {
            $css_rules[] = "{$selector} .loader { --color-1: {$attributes['loadingColor1']}; }";
        }
        if ( ! empty( $attributes['loadingColor2'] ) ) {
            $css_rules[] = "{$selector} .loader { --color-2: {$attributes['loadingColor2']}; }";
        }

        // ============================================
        // Combine CSS with media queries
        // ============================================
        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Create Post Block
     *
     * Handles both Style Tab and Field Style Tab CSS generation.
     * NOTE: This block has extensive styling (~2400 lines in JS) covering form elements,
     * buttons, progress indicators, field types, and validation states.
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Unique block ID
     * @return string Generated CSS
     */
    public static function generate_create_post_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        $selector = '.voxel-fse-create-post-' . $block_id;

        // ============================================
        // STYLE TAB - Section 1: FORM HEAD (Progress Bar)
        // Source: create-post.php:387-587
        // ============================================

        // Hide form head
        if ( ! empty( $attributes['headHide'] ) ) {
            $css_rules[] = "{$selector} .ts-form-progres { display: none !important; }";
        }

        // Head spacing (margin-bottom)
        if ( isset( $attributes['headSpacing'] ) && $attributes['headSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-progres { margin-bottom: {$attributes['headSpacing']}px; }";
        }
        if ( isset( $attributes['headSpacing_tablet'] ) && $attributes['headSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-progres { margin-bottom: {$attributes['headSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['headSpacing_mobile'] ) && $attributes['headSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-progres { margin-bottom: {$attributes['headSpacing_mobile']}px; }";
        }

        // TODO: Remaining create-post CSS sections will be added incrementally
        // This is a placeholder for the ~2400 lines of CSS generation logic
        // covering: Form Head, Form Body, Form Footer, Buttons, Field Types, Validation, etc.

        // ============================================
        // Combine CSS with media queries
        // ============================================
        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Product Form Block
     *
     * Handles product form styling including fields, dropdowns, buttons, and validation.
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Unique block ID
     * @return string Generated CSS
     */
    public static function generate_product_form_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        $selector = '.voxel-fse-product-form-' . $block_id;

        // ============================================
        // SECTION: General (Field Spacing, Field Label)
        // Source: product-form.php:215-278
        // ============================================

        // Field spacing
        if ( isset( $attributes['fieldSpacing'] ) && $attributes['fieldSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-form-group { margin-bottom: {$attributes['fieldSpacing']}px; }";
        }
        if ( isset( $attributes['fieldSpacingTablet'] ) && $attributes['fieldSpacingTablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-form-group { margin-bottom: {$attributes['fieldSpacingTablet']}px; }";
        }
        if ( isset( $attributes['fieldSpacingMobile'] ) && $attributes['fieldSpacingMobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-form-group { margin-bottom: {$attributes['fieldSpacingMobile']}px; }";
        }

        // TODO: Remaining product-form CSS sections will be added incrementally
        // This is a placeholder for the ~1200 lines of CSS generation logic
        // covering: Field Labels, Input Fields, Dropdowns, Buttons, Validation, etc.

        // ============================================
        // Combine CSS with media queries
        // ============================================
        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Cart Summary Block
     *
     * Evidence: cart-summary.php:140-158
     * Sections: 15 total (General, Primary/Secondary Buttons, Loading, Radio/Checkboxes,
     *           Cart Styling, Icon Button, Dropdown Button, Ship To, Section Divider,
     *           Subtotal, Field Label, Input & Textarea, Cards, File/Gallery Fields)
     *
     * @param array  $attributes Block attributes from Gutenberg
     * @param string $block_id   Block ID for scoped selector
     * @return string Generated CSS
     */
    public static function generate_cart_summary_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        $selector = '.voxel-fse-cart-summary-' . $block_id;

        // ============================================
        // 1. GENERAL SECTION
        // Evidence: cart-summary.php:140-158
        // ============================================

        // Section spacing (grid-gap on .ts-checkout)
        if ( isset( $attributes['sectionSpacing'] ) && $attributes['sectionSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-checkout { grid-gap: {$attributes['sectionSpacing']}px; }";
        }
        if ( isset( $attributes['sectionSpacing_tablet'] ) && $attributes['sectionSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-checkout { grid-gap: {$attributes['sectionSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['sectionSpacing_mobile'] ) && $attributes['sectionSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-checkout { grid-gap: {$attributes['sectionSpacing_mobile']}px; }";
        }

        // Title typography (.ts-cart-head h1)
        if ( ! empty( $attributes['titleTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['titleTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-cart-head h1 { {$typo_css} }";
            }
        }

        // Title color
        if ( ! empty( $attributes['titleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-cart-head h1 { color: {$attributes['titleColor']}; }";
        }

        // Empty cart gap
        if ( isset( $attributes['emptyCartGap'] ) && $attributes['emptyCartGap'] !== '' ) {
            $css_rules[] = "{$selector} .ts-empty-cart { gap: {$attributes['emptyCartGap']}px; }";
        }
        if ( isset( $attributes['emptyCartGap_tablet'] ) && $attributes['emptyCartGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-empty-cart { gap: {$attributes['emptyCartGap_tablet']}px; }";
        }
        if ( isset( $attributes['emptyCartGap_mobile'] ) && $attributes['emptyCartGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-empty-cart { gap: {$attributes['emptyCartGap_mobile']}px; }";
        }

        // Empty cart icon size
        if ( isset( $attributes['emptyCartIconSize'] ) && $attributes['emptyCartIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-empty-cart i { font-size: {$attributes['emptyCartIconSize']}px; }";
        }
        if ( isset( $attributes['emptyCartIconSize_tablet'] ) && $attributes['emptyCartIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-empty-cart i { font-size: {$attributes['emptyCartIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['emptyCartIconSize_mobile'] ) && $attributes['emptyCartIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-empty-cart i { font-size: {$attributes['emptyCartIconSize_mobile']}px; }";
        }

        // Empty cart icon color
        if ( ! empty( $attributes['emptyCartIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-empty-cart i { color: {$attributes['emptyCartIconColor']}; }";
        }

        // Empty cart typography
        if ( ! empty( $attributes['emptyCartTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['emptyCartTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-empty-cart p { {$typo_css} }";
            }
        }

        // Empty cart text color
        if ( ! empty( $attributes['emptyCartTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-empty-cart p { color: {$attributes['emptyCartTextColor']}; }";
        }

        // ============================================
        // 2. PRIMARY BUTTON (ts-btn ts-btn-1)
        // ============================================

        // Typography
        if ( ! empty( $attributes['primaryBtnTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['primaryBtnTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { {$typo_css} }";
            }
        }

        // Border
        if ( ! empty( $attributes['primaryBtnBorderType'] ) && $attributes['primaryBtnBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { border-style: {$attributes['primaryBtnBorderType']}; }";

            if ( ! empty( $attributes['primaryBtnBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['primaryBtnBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['primaryBtnBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { border-color: {$attributes['primaryBtnBorderColor']}; }";
            }
        }

        // Border radius
        if ( isset( $attributes['primaryBtnRadius'] ) && $attributes['primaryBtnRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { border-radius: {$attributes['primaryBtnRadius']}px; }";
        }
        if ( isset( $attributes['primaryBtnRadius_tablet'] ) && $attributes['primaryBtnRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn.ts-btn-1 { border-radius: {$attributes['primaryBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['primaryBtnRadius_mobile'] ) && $attributes['primaryBtnRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn.ts-btn-1 { border-radius: {$attributes['primaryBtnRadius_mobile']}px; }";
        }

        // Box shadow
        if ( ! empty( $attributes['primaryBtnBoxShadow'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['primaryBtnBoxShadow'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { box-shadow: {$shadow_css}; }";
            }
        }

        // Text color
        if ( ! empty( $attributes['primaryBtnTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { color: {$attributes['primaryBtnTextColor']}; }";
        }

        // Background color
        if ( ! empty( $attributes['primaryBtnBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { background-color: {$attributes['primaryBtnBgColor']}; }";
        }

        // Icon size
        if ( isset( $attributes['primaryBtnIconSize'] ) && $attributes['primaryBtnIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 i { font-size: {$attributes['primaryBtnIconSize']}px; }";
        }
        if ( isset( $attributes['primaryBtnIconSize_tablet'] ) && $attributes['primaryBtnIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn.ts-btn-1 i { font-size: {$attributes['primaryBtnIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['primaryBtnIconSize_mobile'] ) && $attributes['primaryBtnIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn.ts-btn-1 i { font-size: {$attributes['primaryBtnIconSize_mobile']}px; }";
        }

        // Icon color
        if ( ! empty( $attributes['primaryBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 i { color: {$attributes['primaryBtnIconColor']}; }";
        }

        // Icon spacing
        if ( isset( $attributes['primaryBtnIconSpacing'] ) && $attributes['primaryBtnIconSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1 { gap: {$attributes['primaryBtnIconSpacing']}px; }";
        }
        if ( isset( $attributes['primaryBtnIconSpacing_tablet'] ) && $attributes['primaryBtnIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn.ts-btn-1 { gap: {$attributes['primaryBtnIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['primaryBtnIconSpacing_mobile'] ) && $attributes['primaryBtnIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn.ts-btn-1 { gap: {$attributes['primaryBtnIconSpacing_mobile']}px; }";
        }

        // Hover states
        if ( ! empty( $attributes['primaryBtnTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1:hover { color: {$attributes['primaryBtnTextColorHover']}; }";
        }
        if ( ! empty( $attributes['primaryBtnBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1:hover { background-color: {$attributes['primaryBtnBgColorHover']}; }";
        }
        if ( ! empty( $attributes['primaryBtnBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1:hover { border-color: {$attributes['primaryBtnBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['primaryBtnBoxShadowHover'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['primaryBtnBoxShadowHover'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-1:hover { box-shadow: {$shadow_css}; }";
            }
        }
        if ( ! empty( $attributes['primaryBtnIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-1:hover i { color: {$attributes['primaryBtnIconColorHover']}; }";
        }

        // ============================================
        // 3. SECONDARY BUTTON (ts-btn ts-btn-2)
        // ============================================

        // Typography
        if ( ! empty( $attributes['secondaryBtnTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['secondaryBtnTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { {$typo_css} }";
            }
        }

        // Padding
        if ( ! empty( $attributes['secondaryBtnPadding'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['secondaryBtnPadding'] );
            if ( $padding_css ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['secondaryBtnPadding_tablet'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['secondaryBtnPadding_tablet'] );
            if ( $padding_css ) {
                $tablet_rules[] = "{$selector} .ts-btn.ts-btn-2 { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['secondaryBtnPadding_mobile'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['secondaryBtnPadding_mobile'] );
            if ( $padding_css ) {
                $mobile_rules[] = "{$selector} .ts-btn.ts-btn-2 { padding: {$padding_css}; }";
            }
        }

        // Border radius
        if ( isset( $attributes['secondaryBtnRadius'] ) && $attributes['secondaryBtnRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { border-radius: {$attributes['secondaryBtnRadius']}px; }";
        }
        if ( isset( $attributes['secondaryBtnRadius_tablet'] ) && $attributes['secondaryBtnRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn.ts-btn-2 { border-radius: {$attributes['secondaryBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['secondaryBtnRadius_mobile'] ) && $attributes['secondaryBtnRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn.ts-btn-2 { border-radius: {$attributes['secondaryBtnRadius_mobile']}px; }";
        }

        // Text color
        if ( ! empty( $attributes['secondaryBtnTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { color: {$attributes['secondaryBtnTextColor']}; }";
        }

        // Background color
        if ( ! empty( $attributes['secondaryBtnBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { background-color: {$attributes['secondaryBtnBgColor']}; }";
        }

        // Border
        if ( ! empty( $attributes['secondaryBtnBorderType'] ) && $attributes['secondaryBtnBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { border-style: {$attributes['secondaryBtnBorderType']}; }";

            if ( ! empty( $attributes['secondaryBtnBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['secondaryBtnBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['secondaryBtnBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { border-color: {$attributes['secondaryBtnBorderColor']}; }";
            }
        }

        // Icon size
        if ( isset( $attributes['secondaryBtnIconSize'] ) && $attributes['secondaryBtnIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 i { font-size: {$attributes['secondaryBtnIconSize']}px; }";
        }
        if ( isset( $attributes['secondaryBtnIconSize_tablet'] ) && $attributes['secondaryBtnIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn.ts-btn-2 i { font-size: {$attributes['secondaryBtnIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['secondaryBtnIconSize_mobile'] ) && $attributes['secondaryBtnIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn.ts-btn-2 i { font-size: {$attributes['secondaryBtnIconSize_mobile']}px; }";
        }

        // Icon color
        if ( ! empty( $attributes['secondaryBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 i { color: {$attributes['secondaryBtnIconColor']}; }";
        }

        // Icon spacing
        if ( isset( $attributes['secondaryBtnIconSpacing'] ) && $attributes['secondaryBtnIconSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2 { gap: {$attributes['secondaryBtnIconSpacing']}px; }";
        }
        if ( isset( $attributes['secondaryBtnIconSpacing_tablet'] ) && $attributes['secondaryBtnIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn.ts-btn-2 { gap: {$attributes['secondaryBtnIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['secondaryBtnIconSpacing_mobile'] ) && $attributes['secondaryBtnIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn.ts-btn-2 { gap: {$attributes['secondaryBtnIconSpacing_mobile']}px; }";
        }

        // Hover states
        if ( ! empty( $attributes['secondaryBtnTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2:hover { color: {$attributes['secondaryBtnTextColorHover']}; }";
        }
        if ( ! empty( $attributes['secondaryBtnBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2:hover { background-color: {$attributes['secondaryBtnBgColorHover']}; }";
        }
        if ( ! empty( $attributes['secondaryBtnBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2:hover { border-color: {$attributes['secondaryBtnBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['secondaryBtnIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-btn.ts-btn-2:hover i { color: {$attributes['secondaryBtnIconColorHover']}; }";
        }

        // ============================================
        // 4. LOADING
        // ============================================

        if ( ! empty( $attributes['loaderColor1'] ) ) {
            $css_rules[] = "{$selector} .ts-loader { border-top-color: {$attributes['loaderColor1']}; }";
        }
        if ( ! empty( $attributes['loaderColor2'] ) ) {
            $css_rules[] = "{$selector} .ts-loader { border-bottom-color: {$attributes['loaderColor2']}; }";
        }

        // ============================================
        // 5. RADIO/CHECKBOXES
        // ============================================

        if ( ! empty( $attributes['checkboxBorderColor'] ) ) {
            $css_rules[] = "{$selector} .container-checkbox .checkmark { border-color: {$attributes['checkboxBorderColor']}; }";
            $css_rules[] = "{$selector} .container-radio .checkmark { border-color: {$attributes['checkboxBorderColor']}; }";
        }

        if ( ! empty( $attributes['checkboxSelectedBgColor'] ) ) {
            $css_rules[] = "{$selector} .container-checkbox input:checked ~ .checkmark { background-color: {$attributes['checkboxSelectedBgColor']}; }";
            $css_rules[] = "{$selector} .container-radio input:checked ~ .checkmark { background-color: {$attributes['checkboxSelectedBgColor']}; }";
        }

        if ( ! empty( $attributes['checkboxSelectedBoxShadow'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['checkboxSelectedBoxShadow'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .container-checkbox input:checked ~ .checkmark { box-shadow: {$shadow_css}; }";
                $css_rules[] = "{$selector} .container-radio input:checked ~ .checkmark { box-shadow: {$shadow_css}; }";
            }
        }

        // ============================================
        // 6. CART STYLING
        // ============================================

        // Cart item spacing
        if ( isset( $attributes['cartItemSpacing'] ) && $attributes['cartItemSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-cart-items > li { margin-bottom: {$attributes['cartItemSpacing']}px; }";
        }
        if ( isset( $attributes['cartItemSpacing_tablet'] ) && $attributes['cartItemSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-cart-items > li { margin-bottom: {$attributes['cartItemSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['cartItemSpacing_mobile'] ) && $attributes['cartItemSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-cart-items > li { margin-bottom: {$attributes['cartItemSpacing_mobile']}px; }";
        }

        // Cart item content spacing
        if ( isset( $attributes['cartItemContentSpacing'] ) && $attributes['cartItemContentSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-item-details { gap: {$attributes['cartItemContentSpacing']}px; }";
        }
        if ( isset( $attributes['cartItemContentSpacing_tablet'] ) && $attributes['cartItemContentSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-item-details { gap: {$attributes['cartItemContentSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['cartItemContentSpacing_mobile'] ) && $attributes['cartItemContentSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-item-details { gap: {$attributes['cartItemContentSpacing_mobile']}px; }";
        }

        // Cart picture size
        if ( isset( $attributes['cartPictureSize'] ) && $attributes['cartPictureSize'] !== '' ) {
            $size = $attributes['cartPictureSize'];
            $css_rules[] = "{$selector} .ts-item-image { width: {$size}px; height: {$size}px; min-width: {$size}px; }";
        }
        if ( isset( $attributes['cartPictureSize_tablet'] ) && $attributes['cartPictureSize_tablet'] !== '' ) {
            $size = $attributes['cartPictureSize_tablet'];
            $tablet_rules[] = "{$selector} .ts-item-image { width: {$size}px; height: {$size}px; min-width: {$size}px; }";
        }
        if ( isset( $attributes['cartPictureSize_mobile'] ) && $attributes['cartPictureSize_mobile'] !== '' ) {
            $size = $attributes['cartPictureSize_mobile'];
            $mobile_rules[] = "{$selector} .ts-item-image { width: {$size}px; height: {$size}px; min-width: {$size}px; }";
        }

        // Cart picture radius
        if ( isset( $attributes['cartPictureRadius'] ) && $attributes['cartPictureRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-item-image { border-radius: {$attributes['cartPictureRadius']}px; }";
        }
        if ( isset( $attributes['cartPictureRadius_tablet'] ) && $attributes['cartPictureRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-item-image { border-radius: {$attributes['cartPictureRadius_tablet']}px; }";
        }
        if ( isset( $attributes['cartPictureRadius_mobile'] ) && $attributes['cartPictureRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-item-image { border-radius: {$attributes['cartPictureRadius_mobile']}px; }";
        }

        // Cart title typography
        if ( ! empty( $attributes['cartTitleTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['cartTitleTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-item-name { {$typo_css} }";
            }
        }

        // Cart title color
        if ( ! empty( $attributes['cartTitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-item-name { color: {$attributes['cartTitleColor']}; }";
        }

        // Cart subtitle typography
        if ( ! empty( $attributes['cartSubtitleTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['cartSubtitleTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-item-description { {$typo_css} }";
            }
        }

        // Cart subtitle color
        if ( ! empty( $attributes['cartSubtitleColor'] ) ) {
            $css_rules[] = "{$selector} .ts-item-description { color: {$attributes['cartSubtitleColor']}; }";
        }

        // ============================================
        // 7. ICON BUTTON (ts-icon-btn)
        // ============================================

        // Icon color
        if ( ! empty( $attributes['iconBtnColor'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn i { color: {$attributes['iconBtnColor']}; }";
        }

        // Background color
        if ( ! empty( $attributes['iconBtnBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn { background-color: {$attributes['iconBtnBgColor']}; }";
        }

        // Border
        if ( ! empty( $attributes['iconBtnBorderType'] ) && $attributes['iconBtnBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-icon-btn { border-style: {$attributes['iconBtnBorderType']}; }";

            if ( ! empty( $attributes['iconBtnBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['iconBtnBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} .ts-icon-btn { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['iconBtnBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-icon-btn { border-color: {$attributes['iconBtnBorderColor']}; }";
            }
        }

        // Border radius
        if ( isset( $attributes['iconBtnRadius'] ) && $attributes['iconBtnRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-icon-btn { border-radius: {$attributes['iconBtnRadius']}px; }";
        }
        if ( isset( $attributes['iconBtnRadius_tablet'] ) && $attributes['iconBtnRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-icon-btn { border-radius: {$attributes['iconBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['iconBtnRadius_mobile'] ) && $attributes['iconBtnRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-icon-btn { border-radius: {$attributes['iconBtnRadius_mobile']}px; }";
        }

        // Value size
        if ( isset( $attributes['iconBtnValueSize'] ) && $attributes['iconBtnValueSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-icon-btn .ts-number { font-size: {$attributes['iconBtnValueSize']}px; }";
        }

        // Value color
        if ( ! empty( $attributes['iconBtnValueColor'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn .ts-number { color: {$attributes['iconBtnValueColor']}; }";
        }

        // Hover states
        if ( ! empty( $attributes['iconBtnColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn:hover i { color: {$attributes['iconBtnColorHover']}; }";
        }
        if ( ! empty( $attributes['iconBtnBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn:hover { background-color: {$attributes['iconBtnBgColorHover']}; }";
        }
        if ( ! empty( $attributes['iconBtnBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn:hover { border-color: {$attributes['iconBtnBorderColorHover']}; }";
        }

        // ============================================
        // 8. DROPDOWN BUTTON (ts-filter, ts-filter-wrapper)
        // ============================================

        // Typography
        if ( ! empty( $attributes['dropdownTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['dropdownTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-filter { {$typo_css} }";
            }
        }

        // Box shadow
        if ( ! empty( $attributes['dropdownBoxShadow'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['dropdownBoxShadow'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-filter { box-shadow: {$shadow_css}; }";
            }
        }

        // Background color
        if ( ! empty( $attributes['dropdownBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-filter { background-color: {$attributes['dropdownBgColor']}; }";
        }

        // Text color
        if ( ! empty( $attributes['dropdownTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-filter { color: {$attributes['dropdownTextColor']}; }";
        }

        // Border
        if ( ! empty( $attributes['dropdownBorderType'] ) && $attributes['dropdownBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-filter { border-style: {$attributes['dropdownBorderType']}; }";

            if ( ! empty( $attributes['dropdownBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['dropdownBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} .ts-filter { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['dropdownBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-filter { border-color: {$attributes['dropdownBorderColor']}; }";
            }
        }

        // Border radius
        if ( isset( $attributes['dropdownRadius'] ) && $attributes['dropdownRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-filter { border-radius: {$attributes['dropdownRadius']}px; }";
        }
        if ( isset( $attributes['dropdownRadius_tablet'] ) && $attributes['dropdownRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-filter { border-radius: {$attributes['dropdownRadius_tablet']}px; }";
        }
        if ( isset( $attributes['dropdownRadius_mobile'] ) && $attributes['dropdownRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-filter { border-radius: {$attributes['dropdownRadius_mobile']}px; }";
        }

        // Height
        if ( isset( $attributes['dropdownHeight'] ) && $attributes['dropdownHeight'] !== '' ) {
            $css_rules[] = "{$selector} .ts-filter { min-height: {$attributes['dropdownHeight']}px; }";
        }
        if ( isset( $attributes['dropdownHeight_tablet'] ) && $attributes['dropdownHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-filter { min-height: {$attributes['dropdownHeight_tablet']}px; }";
        }
        if ( isset( $attributes['dropdownHeight_mobile'] ) && $attributes['dropdownHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-filter { min-height: {$attributes['dropdownHeight_mobile']}px; }";
        }

        // Icon color
        if ( ! empty( $attributes['dropdownIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-filter i { color: {$attributes['dropdownIconColor']}; }";
        }

        // Icon size
        if ( isset( $attributes['dropdownIconSize'] ) && $attributes['dropdownIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-filter i { font-size: {$attributes['dropdownIconSize']}px; }";
        }
        if ( isset( $attributes['dropdownIconSize_tablet'] ) && $attributes['dropdownIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-filter i { font-size: {$attributes['dropdownIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['dropdownIconSize_mobile'] ) && $attributes['dropdownIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-filter i { font-size: {$attributes['dropdownIconSize_mobile']}px; }";
        }

        // Icon spacing
        if ( isset( $attributes['dropdownIconSpacing'] ) && $attributes['dropdownIconSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-filter { gap: {$attributes['dropdownIconSpacing']}px; }";
        }
        if ( isset( $attributes['dropdownIconSpacing_tablet'] ) && $attributes['dropdownIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-filter { gap: {$attributes['dropdownIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['dropdownIconSpacing_mobile'] ) && $attributes['dropdownIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-filter { gap: {$attributes['dropdownIconSpacing_mobile']}px; }";
        }

        // Hide chevron
        if ( ! empty( $attributes['dropdownHideChevron'] ) ) {
            $css_rules[] = "{$selector} .ts-filter .ts-down-icon { display: none; }";
        }

        // Chevron color
        if ( ! empty( $attributes['dropdownChevronColor'] ) ) {
            $css_rules[] = "{$selector} .ts-filter .ts-down-icon { color: {$attributes['dropdownChevronColor']}; }";
        }

        // Hover states
        if ( ! empty( $attributes['dropdownBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-filter:hover { background-color: {$attributes['dropdownBgColorHover']}; }";
        }
        if ( ! empty( $attributes['dropdownTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-filter:hover { color: {$attributes['dropdownTextColorHover']}; }";
        }
        if ( ! empty( $attributes['dropdownBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-filter:hover { border-color: {$attributes['dropdownBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['dropdownIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-filter:hover i { color: {$attributes['dropdownIconColorHover']}; }";
        }
        if ( ! empty( $attributes['dropdownBoxShadowHover'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['dropdownBoxShadowHover'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-filter:hover { box-shadow: {$shadow_css}; }";
            }
        }

        // Filled states (when dropdown has value)
        if ( ! empty( $attributes['dropdownTypographyFilled'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['dropdownTypographyFilled'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-filter.ts-filled { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['dropdownBgColorFilled'] ) ) {
            $css_rules[] = "{$selector} .ts-filter.ts-filled { background-color: {$attributes['dropdownBgColorFilled']}; }";
        }
        if ( ! empty( $attributes['dropdownTextColorFilled'] ) ) {
            $css_rules[] = "{$selector} .ts-filter.ts-filled { color: {$attributes['dropdownTextColorFilled']}; }";
        }
        if ( ! empty( $attributes['dropdownIconColorFilled'] ) ) {
            $css_rules[] = "{$selector} .ts-filter.ts-filled i { color: {$attributes['dropdownIconColorFilled']}; }";
        }
        if ( ! empty( $attributes['dropdownBorderColorFilled'] ) ) {
            $css_rules[] = "{$selector} .ts-filter.ts-filled { border-color: {$attributes['dropdownBorderColorFilled']}; }";
        }
        if ( isset( $attributes['dropdownBorderWidthFilled'] ) && $attributes['dropdownBorderWidthFilled'] !== '' ) {
            $css_rules[] = "{$selector} .ts-filter.ts-filled { border-width: {$attributes['dropdownBorderWidthFilled']}px; }";
        }
        if ( ! empty( $attributes['dropdownBoxShadowFilled'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['dropdownBoxShadowFilled'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-filter.ts-filled { box-shadow: {$shadow_css}; }";
            }
        }

        // ============================================
        // 9. SHIP TO
        // ============================================

        if ( ! empty( $attributes['shipToTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['shipToTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-ship-to { {$typo_css} }";
            }
        }

        if ( ! empty( $attributes['shipToTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-ship-to { color: {$attributes['shipToTextColor']}; }";
        }

        if ( ! empty( $attributes['shipToLinkColor'] ) ) {
            $css_rules[] = "{$selector} .ts-ship-to a { color: {$attributes['shipToLinkColor']}; }";
        }

        // ============================================
        // 10. SECTION DIVIDER
        // ============================================

        if ( ! empty( $attributes['dividerTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['dividerTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-section-divider { {$typo_css} }";
            }
        }

        if ( ! empty( $attributes['dividerTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-section-divider { color: {$attributes['dividerTextColor']}; }";
        }

        if ( ! empty( $attributes['dividerLineColor'] ) ) {
            $css_rules[] = "{$selector} .ts-section-divider::before { background-color: {$attributes['dividerLineColor']}; }";
        }

        if ( isset( $attributes['dividerLineHeight'] ) && $attributes['dividerLineHeight'] !== '' ) {
            $css_rules[] = "{$selector} .ts-section-divider::before { height: {$attributes['dividerLineHeight']}px; }";
        }

        // ============================================
        // 11. SUBTOTAL
        // ============================================

        if ( ! empty( $attributes['subtotalTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['subtotalTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-subtotal { {$typo_css} }";
            }
        }

        if ( ! empty( $attributes['subtotalTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-subtotal { color: {$attributes['subtotalTextColor']}; }";
        }

        // ============================================
        // 12. FIELD LABEL
        // ============================================

        if ( ! empty( $attributes['fieldLabelTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['fieldLabelTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-form-group label { {$typo_css} }";
            }
        }

        if ( ! empty( $attributes['fieldLabelColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group label { color: {$attributes['fieldLabelColor']}; }";
        }

        if ( ! empty( $attributes['fieldLabelLinkColor'] ) ) {
            $css_rules[] = "{$selector} .ts-form-group label a { color: {$attributes['fieldLabelLinkColor']}; }";
        }

        // ============================================
        // 13. INPUT & TEXTAREA (Normal)
        // ============================================

        // Placeholder typography & color
        if ( ! empty( $attributes['inputPlaceholderTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['inputPlaceholderTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} input::placeholder, {$selector} textarea::placeholder { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['inputPlaceholderColor'] ) ) {
            $css_rules[] = "{$selector} input::placeholder, {$selector} textarea::placeholder { color: {$attributes['inputPlaceholderColor']}; }";
        }

        // Value typography & color
        if ( ! empty( $attributes['inputValueTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['inputValueTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} input, {$selector} textarea { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['inputValueColor'] ) ) {
            $css_rules[] = "{$selector} input, {$selector} textarea { color: {$attributes['inputValueColor']}; }";
        }

        // Background color
        if ( ! empty( $attributes['inputBgColor'] ) ) {
            $css_rules[] = "{$selector} input, {$selector} textarea, {$selector} .ts-filter { background-color: {$attributes['inputBgColor']}; }";
        }

        // Border
        if ( ! empty( $attributes['inputBorderType'] ) && $attributes['inputBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} input, {$selector} textarea, {$selector} .ts-filter { border-style: {$attributes['inputBorderType']}; }";

            if ( ! empty( $attributes['inputBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['inputBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} input, {$selector} textarea, {$selector} .ts-filter { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['inputBorderColor'] ) ) {
                $css_rules[] = "{$selector} input, {$selector} textarea, {$selector} .ts-filter { border-color: {$attributes['inputBorderColor']}; }";
            }
        }

        // Padding
        if ( ! empty( $attributes['inputPadding'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['inputPadding'] );
            if ( $padding_css ) {
                $css_rules[] = "{$selector} input { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['inputPadding_tablet'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['inputPadding_tablet'] );
            if ( $padding_css ) {
                $tablet_rules[] = "{$selector} input { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['inputPadding_mobile'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['inputPadding_mobile'] );
            if ( $padding_css ) {
                $mobile_rules[] = "{$selector} input { padding: {$padding_css}; }";
            }
        }

        // Height
        if ( isset( $attributes['inputHeight'] ) && $attributes['inputHeight'] !== '' ) {
            $css_rules[] = "{$selector} input { min-height: {$attributes['inputHeight']}px; }";
        }
        if ( isset( $attributes['inputHeight_tablet'] ) && $attributes['inputHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} input { min-height: {$attributes['inputHeight_tablet']}px; }";
        }
        if ( isset( $attributes['inputHeight_mobile'] ) && $attributes['inputHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} input { min-height: {$attributes['inputHeight_mobile']}px; }";
        }

        // Radius
        if ( isset( $attributes['inputRadius'] ) && $attributes['inputRadius'] !== '' ) {
            $css_rules[] = "{$selector} input { border-radius: {$attributes['inputRadius']}px; }";
        }
        if ( isset( $attributes['inputRadius_tablet'] ) && $attributes['inputRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} input { border-radius: {$attributes['inputRadius_tablet']}px; }";
        }
        if ( isset( $attributes['inputRadius_mobile'] ) && $attributes['inputRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} input { border-radius: {$attributes['inputRadius_mobile']}px; }";
        }

        // Input with icon padding
        if ( ! empty( $attributes['inputWithIconPadding'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['inputWithIconPadding'] );
            if ( $padding_css ) {
                $css_rules[] = "{$selector} .ts-input-icon input { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['inputWithIconPadding_tablet'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['inputWithIconPadding_tablet'] );
            if ( $padding_css ) {
                $tablet_rules[] = "{$selector} .ts-input-icon input { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['inputWithIconPadding_mobile'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['inputWithIconPadding_mobile'] );
            if ( $padding_css ) {
                $mobile_rules[] = "{$selector} .ts-input-icon input { padding: {$padding_css}; }";
            }
        }

        // Icon color
        if ( ! empty( $attributes['inputIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-input-icon i { color: {$attributes['inputIconColor']}; }";
        }

        // Icon size
        if ( isset( $attributes['inputIconSize'] ) && $attributes['inputIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-input-icon i { font-size: {$attributes['inputIconSize']}px; }";
        }
        if ( isset( $attributes['inputIconSize_tablet'] ) && $attributes['inputIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-input-icon i { font-size: {$attributes['inputIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['inputIconSize_mobile'] ) && $attributes['inputIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-input-icon i { font-size: {$attributes['inputIconSize_mobile']}px; }";
        }

        // Icon margin
        if ( isset( $attributes['inputIconMargin'] ) && $attributes['inputIconMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ts-input-icon i { margin: 0 {$attributes['inputIconMargin']}px; }";
        }
        if ( isset( $attributes['inputIconMargin_tablet'] ) && $attributes['inputIconMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-input-icon i { margin: 0 {$attributes['inputIconMargin_tablet']}px; }";
        }
        if ( isset( $attributes['inputIconMargin_mobile'] ) && $attributes['inputIconMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-input-icon i { margin: 0 {$attributes['inputIconMargin_mobile']}px; }";
        }

        // Textarea padding
        if ( ! empty( $attributes['textareaPadding'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['textareaPadding'] );
            if ( $padding_css ) {
                $css_rules[] = "{$selector} textarea { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['textareaPadding_tablet'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['textareaPadding_tablet'] );
            if ( $padding_css ) {
                $tablet_rules[] = "{$selector} textarea { padding: {$padding_css}; }";
            }
        }
        if ( ! empty( $attributes['textareaPadding_mobile'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['textareaPadding_mobile'] );
            if ( $padding_css ) {
                $mobile_rules[] = "{$selector} textarea { padding: {$padding_css}; }";
            }
        }

        // Textarea radius
        if ( isset( $attributes['textareaRadius'] ) && $attributes['textareaRadius'] !== '' ) {
            $css_rules[] = "{$selector} textarea { border-radius: {$attributes['textareaRadius']}px; }";
        }
        if ( isset( $attributes['textareaRadius_tablet'] ) && $attributes['textareaRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} textarea { border-radius: {$attributes['textareaRadius_tablet']}px; }";
        }
        if ( isset( $attributes['textareaRadius_mobile'] ) && $attributes['textareaRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} textarea { border-radius: {$attributes['textareaRadius_mobile']}px; }";
        }

        // Hover states
        if ( ! empty( $attributes['inputBgColorHover'] ) ) {
            $css_rules[] = "{$selector} input:hover, {$selector} textarea:hover, {$selector} .ts-filter:hover { background-color: {$attributes['inputBgColorHover']}; }";
        }
        if ( ! empty( $attributes['inputBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} input:hover, {$selector} textarea:hover, {$selector} .ts-filter:hover { border-color: {$attributes['inputBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['inputPlaceholderColorHover'] ) ) {
            $css_rules[] = "{$selector} input:hover::placeholder, {$selector} textarea:hover::placeholder { color: {$attributes['inputPlaceholderColorHover']}; }";
        }
        if ( ! empty( $attributes['inputValueColorHover'] ) ) {
            $css_rules[] = "{$selector} input:hover, {$selector} textarea:hover { color: {$attributes['inputValueColorHover']}; }";
        }
        if ( ! empty( $attributes['inputIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-input-icon:hover i { color: {$attributes['inputIconColorHover']}; }";
        }

        // Active (focus) states
        if ( ! empty( $attributes['inputBgColorActive'] ) ) {
            $css_rules[] = "{$selector} input:focus, {$selector} textarea:focus, {$selector} .ts-filter:focus { background-color: {$attributes['inputBgColorActive']}; }";
        }
        if ( ! empty( $attributes['inputBorderColorActive'] ) ) {
            $css_rules[] = "{$selector} input:focus, {$selector} textarea:focus, {$selector} .ts-filter:focus { border-color: {$attributes['inputBorderColorActive']}; }";
        }
        if ( ! empty( $attributes['inputPlaceholderColorActive'] ) ) {
            $css_rules[] = "{$selector} input:focus::placeholder, {$selector} textarea:focus::placeholder { color: {$attributes['inputPlaceholderColorActive']}; }";
        }
        if ( ! empty( $attributes['inputValueColorActive'] ) ) {
            $css_rules[] = "{$selector} input:focus, {$selector} textarea:focus { color: {$attributes['inputValueColorActive']}; }";
        }

        // ============================================
        // 14. CARDS (Payment methods, etc.)
        // ============================================

        // Gap
        if ( isset( $attributes['cardsGap'] ) && $attributes['cardsGap'] !== '' ) {
            $css_rules[] = "{$selector} .ts-payment-methods { gap: {$attributes['cardsGap']}px; }";
        }
        if ( isset( $attributes['cardsGap_tablet'] ) && $attributes['cardsGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-payment-methods { gap: {$attributes['cardsGap_tablet']}px; }";
        }
        if ( isset( $attributes['cardsGap_mobile'] ) && $attributes['cardsGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-payment-methods { gap: {$attributes['cardsGap_mobile']}px; }";
        }

        // Background color
        if ( ! empty( $attributes['cardsBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-payment-card { background-color: {$attributes['cardsBgColor']}; }";
        }

        // Border
        if ( ! empty( $attributes['cardsBorderType'] ) && $attributes['cardsBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-payment-card { border-style: {$attributes['cardsBorderType']}; }";

            if ( ! empty( $attributes['cardsBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['cardsBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} .ts-payment-card { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['cardsBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-payment-card { border-color: {$attributes['cardsBorderColor']}; }";
            }
        }

        // Border radius
        if ( isset( $attributes['cardsRadius'] ) && $attributes['cardsRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-payment-card { border-radius: {$attributes['cardsRadius']}px; }";
        }
        if ( isset( $attributes['cardsRadius_tablet'] ) && $attributes['cardsRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-payment-card { border-radius: {$attributes['cardsRadius_tablet']}px; }";
        }
        if ( isset( $attributes['cardsRadius_mobile'] ) && $attributes['cardsRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-payment-card { border-radius: {$attributes['cardsRadius_mobile']}px; }";
        }

        // Primary text typography & color
        if ( ! empty( $attributes['cardsPrimaryTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['cardsPrimaryTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-payment-card .ts-primary { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['cardsPrimaryColor'] ) ) {
            $css_rules[] = "{$selector} .ts-payment-card .ts-primary { color: {$attributes['cardsPrimaryColor']}; }";
        }

        // Secondary text typography & color
        if ( ! empty( $attributes['cardsSecondaryTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['cardsSecondaryTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-payment-card .ts-secondary { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['cardsSecondaryColor'] ) ) {
            $css_rules[] = "{$selector} .ts-payment-card .ts-secondary { color: {$attributes['cardsSecondaryColor']}; }";
        }

        // Price typography & color
        if ( ! empty( $attributes['cardsPriceTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['cardsPriceTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-payment-card .ts-price { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['cardsPriceColor'] ) ) {
            $css_rules[] = "{$selector} .ts-payment-card .ts-price { color: {$attributes['cardsPriceColor']}; }";
        }

        // Image radius
        if ( isset( $attributes['cardsImageRadius'] ) && $attributes['cardsImageRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-payment-card img { border-radius: {$attributes['cardsImageRadius']}px; }";
        }
        if ( isset( $attributes['cardsImageRadius_tablet'] ) && $attributes['cardsImageRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-payment-card img { border-radius: {$attributes['cardsImageRadius_tablet']}px; }";
        }
        if ( isset( $attributes['cardsImageRadius_mobile'] ) && $attributes['cardsImageRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-payment-card img { border-radius: {$attributes['cardsImageRadius_mobile']}px; }";
        }

        // Image size
        if ( isset( $attributes['cardsImageSize'] ) && $attributes['cardsImageSize'] !== '' ) {
            $size = $attributes['cardsImageSize'];
            $css_rules[] = "{$selector} .ts-payment-card img { width: {$size}px; height: {$size}px; }";
        }
        if ( isset( $attributes['cardsImageSize_tablet'] ) && $attributes['cardsImageSize_tablet'] !== '' ) {
            $size = $attributes['cardsImageSize_tablet'];
            $tablet_rules[] = "{$selector} .ts-payment-card img { width: {$size}px; height: {$size}px; }";
        }
        if ( isset( $attributes['cardsImageSize_mobile'] ) && $attributes['cardsImageSize_mobile'] !== '' ) {
            $size = $attributes['cardsImageSize_mobile'];
            $mobile_rules[] = "{$selector} .ts-payment-card img { width: {$size}px; height: {$size}px; }";
        }

        // Selected states
        if ( ! empty( $attributes['cardsSelectedBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-payment-card.ts-selected { background-color: {$attributes['cardsSelectedBgColor']}; }";
        }
        if ( ! empty( $attributes['cardsSelectedBorderColor'] ) ) {
            $css_rules[] = "{$selector} .ts-payment-card.ts-selected { border-color: {$attributes['cardsSelectedBorderColor']}; }";
        }
        if ( ! empty( $attributes['cardsSelectedBoxShadow'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['cardsSelectedBoxShadow'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-payment-card.ts-selected { box-shadow: {$shadow_css}; }";
            }
        }
        if ( ! empty( $attributes['cardsSelectedPrimaryTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['cardsSelectedPrimaryTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-payment-card.ts-selected .ts-primary { {$typo_css} }";
            }
        }

        // ============================================
        // 15. FILE/GALLERY FIELDS
        // ============================================

        // Field gap
        if ( isset( $attributes['fileFieldGap'] ) && $attributes['fileFieldGap'] !== '' ) {
            $css_rules[] = "{$selector} .ts-file-list { gap: {$attributes['fileFieldGap']}px; }";
        }
        if ( isset( $attributes['fileFieldGap_tablet'] ) && $attributes['fileFieldGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-file-list { gap: {$attributes['fileFieldGap_tablet']}px; }";
        }
        if ( isset( $attributes['fileFieldGap_mobile'] ) && $attributes['fileFieldGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-file-list { gap: {$attributes['fileFieldGap_mobile']}px; }";
        }

        // File select button icon
        if ( ! empty( $attributes['fileSelectIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload i { color: {$attributes['fileSelectIconColor']}; }";
        }
        if ( isset( $attributes['fileSelectIconSize'] ) && $attributes['fileSelectIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-file-upload i { font-size: {$attributes['fileSelectIconSize']}px; }";
        }
        if ( isset( $attributes['fileSelectIconSize_tablet'] ) && $attributes['fileSelectIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-file-upload i { font-size: {$attributes['fileSelectIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['fileSelectIconSize_mobile'] ) && $attributes['fileSelectIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-file-upload i { font-size: {$attributes['fileSelectIconSize_mobile']}px; }";
        }

        // File select button background
        if ( ! empty( $attributes['fileSelectBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload { background-color: {$attributes['fileSelectBgColor']}; }";
        }

        // File select button border
        if ( ! empty( $attributes['fileSelectBorderType'] ) && $attributes['fileSelectBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-file-upload { border-style: {$attributes['fileSelectBorderType']}; }";

            if ( ! empty( $attributes['fileSelectBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['fileSelectBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$selector} .ts-file-upload { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['fileSelectBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-file-upload { border-color: {$attributes['fileSelectBorderColor']}; }";
            }
        }

        // File select button radius
        if ( isset( $attributes['fileSelectRadius'] ) && $attributes['fileSelectRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-file-upload { border-radius: {$attributes['fileSelectRadius']}px; }";
        }
        if ( isset( $attributes['fileSelectRadius_tablet'] ) && $attributes['fileSelectRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-file-upload { border-radius: {$attributes['fileSelectRadius_tablet']}px; }";
        }
        if ( isset( $attributes['fileSelectRadius_mobile'] ) && $attributes['fileSelectRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-file-upload { border-radius: {$attributes['fileSelectRadius_mobile']}px; }";
        }

        // File select button typography & text color
        if ( ! empty( $attributes['fileSelectTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['fileSelectTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-file-upload { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['fileSelectTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload { color: {$attributes['fileSelectTextColor']}; }";
        }

        // Added file radius
        if ( isset( $attributes['addedFileRadius'] ) && $attributes['addedFileRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-uploaded-file { border-radius: {$attributes['addedFileRadius']}px; }";
        }
        if ( isset( $attributes['addedFileRadius_tablet'] ) && $attributes['addedFileRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-uploaded-file { border-radius: {$attributes['addedFileRadius_tablet']}px; }";
        }
        if ( isset( $attributes['addedFileRadius_mobile'] ) && $attributes['addedFileRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-uploaded-file { border-radius: {$attributes['addedFileRadius_mobile']}px; }";
        }

        // Added file background
        if ( ! empty( $attributes['addedFileBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-uploaded-file { background-color: {$attributes['addedFileBgColor']}; }";
        }

        // Added file icon
        if ( ! empty( $attributes['addedFileIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-uploaded-file i { color: {$attributes['addedFileIconColor']}; }";
        }
        if ( isset( $attributes['addedFileIconSize'] ) && $attributes['addedFileIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-uploaded-file i { font-size: {$attributes['addedFileIconSize']}px; }";
        }
        if ( isset( $attributes['addedFileIconSize_tablet'] ) && $attributes['addedFileIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-uploaded-file i { font-size: {$attributes['addedFileIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['addedFileIconSize_mobile'] ) && $attributes['addedFileIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-uploaded-file i { font-size: {$attributes['addedFileIconSize_mobile']}px; }";
        }

        // Added file typography & text color
        if ( ! empty( $attributes['addedFileTypography'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['addedFileTypography'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-uploaded-file { {$typo_css} }";
            }
        }
        if ( ! empty( $attributes['addedFileTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-uploaded-file { color: {$attributes['addedFileTextColor']}; }";
        }

        // Remove file button
        if ( ! empty( $attributes['removeFileBgColor'] ) ) {
            $css_rules[] = "{$selector} .ts-remove-file { background-color: {$attributes['removeFileBgColor']}; }";
        }
        if ( ! empty( $attributes['removeFileBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-remove-file:hover { background-color: {$attributes['removeFileBgColorHover']}; }";
        }
        if ( ! empty( $attributes['removeFileColor'] ) ) {
            $css_rules[] = "{$selector} .ts-remove-file { color: {$attributes['removeFileColor']}; }";
        }
        if ( ! empty( $attributes['removeFileColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-remove-file:hover { color: {$attributes['removeFileColorHover']}; }";
        }

        // Remove file button radius
        if ( isset( $attributes['removeFileRadius'] ) && $attributes['removeFileRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-remove-file { border-radius: {$attributes['removeFileRadius']}px; }";
        }
        if ( isset( $attributes['removeFileRadius_tablet'] ) && $attributes['removeFileRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-remove-file { border-radius: {$attributes['removeFileRadius_tablet']}px; }";
        }
        if ( isset( $attributes['removeFileRadius_mobile'] ) && $attributes['removeFileRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-remove-file { border-radius: {$attributes['removeFileRadius_mobile']}px; }";
        }

        // Remove file button size
        if ( isset( $attributes['removeFileSize'] ) && $attributes['removeFileSize'] !== '' ) {
            $size = $attributes['removeFileSize'];
            $css_rules[] = "{$selector} .ts-remove-file { width: {$size}px; height: {$size}px; }";
        }
        if ( isset( $attributes['removeFileSize_tablet'] ) && $attributes['removeFileSize_tablet'] !== '' ) {
            $size = $attributes['removeFileSize_tablet'];
            $tablet_rules[] = "{$selector} .ts-remove-file { width: {$size}px; height: {$size}px; }";
        }
        if ( isset( $attributes['removeFileSize_mobile'] ) && $attributes['removeFileSize_mobile'] !== '' ) {
            $size = $attributes['removeFileSize_mobile'];
            $mobile_rules[] = "{$selector} .ts-remove-file { width: {$size}px; height: {$size}px; }";
        }

        // Remove file icon size
        if ( isset( $attributes['removeFileIconSize'] ) && $attributes['removeFileIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-remove-file i { font-size: {$attributes['removeFileIconSize']}px; }";
        }
        if ( isset( $attributes['removeFileIconSize_tablet'] ) && $attributes['removeFileIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-remove-file i { font-size: {$attributes['removeFileIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['removeFileIconSize_mobile'] ) && $attributes['removeFileIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-remove-file i { font-size: {$attributes['removeFileIconSize_mobile']}px; }";
        }

        // File select hover states
        if ( ! empty( $attributes['fileSelectIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload:hover i { color: {$attributes['fileSelectIconColorHover']}; }";
        }
        if ( ! empty( $attributes['fileSelectBgColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload:hover { background-color: {$attributes['fileSelectBgColorHover']}; }";
        }
        if ( ! empty( $attributes['fileSelectBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload:hover { border-color: {$attributes['fileSelectBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['fileSelectTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-file-upload:hover { color: {$attributes['fileSelectTextColorHover']}; }";
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================

        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Term Feed Block
     *
     * Evidence: term-feed.php (uses post-feed markup with term taxonomy)
     * Sections: Carousel Navigation Buttons, Layout (Grid/Carousel modes)
     *
     * @param array  $attributes Block attributes from Gutenberg
     * @param string $block_id   Block ID for scoped selector
     * @return string Generated CSS
     */
    public static function generate_term_feed_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        $selector = '[data-block-id="' . $block_id . '"]';

        // ============================================
        // 1. CAROUSEL NAVIGATION BUTTONS
        // ============================================

        $btn_selector = "{$selector} .ts-icon-btn";
        $btn_hover_selector = "{$selector} .ts-icon-btn:hover";
        $nav_li_first_selector = "{$selector} .post-feed-nav li:first-child";
        $nav_li_last_selector = "{$selector} .post-feed-nav li:last-child";
        $nav_li_all_selector = "{$selector} .post-feed-nav li";

        // 1.1 Horizontal Position (Margins on li)
        if ( isset( $attributes['navHorizontalPosition'] ) && $attributes['navHorizontalPosition'] !== '' ) {
            $css_rules[] = "{$nav_li_first_selector} { margin-left: {$attributes['navHorizontalPosition']}px; }";
            $css_rules[] = "{$nav_li_last_selector} { margin-right: {$attributes['navHorizontalPosition']}px; }";
        }
        if ( isset( $attributes['navHorizontalPosition_tablet'] ) && $attributes['navHorizontalPosition_tablet'] !== '' ) {
            $tablet_rules[] = "{$nav_li_first_selector} { margin-left: {$attributes['navHorizontalPosition_tablet']}px; }";
            $tablet_rules[] = "{$nav_li_last_selector} { margin-right: {$attributes['navHorizontalPosition_tablet']}px; }";
        }
        if ( isset( $attributes['navHorizontalPosition_mobile'] ) && $attributes['navHorizontalPosition_mobile'] !== '' ) {
            $mobile_rules[] = "{$nav_li_first_selector} { margin-left: {$attributes['navHorizontalPosition_mobile']}px; }";
            $mobile_rules[] = "{$nav_li_last_selector} { margin-right: {$attributes['navHorizontalPosition_mobile']}px; }";
        }

        // 1.2 Vertical Position (Margin top on li)
        if ( isset( $attributes['navVerticalPosition'] ) && $attributes['navVerticalPosition'] !== '' ) {
            $css_rules[] = "{$nav_li_all_selector} { margin-top: {$attributes['navVerticalPosition']}px; }";
        }
        if ( isset( $attributes['navVerticalPosition_tablet'] ) && $attributes['navVerticalPosition_tablet'] !== '' ) {
            $tablet_rules[] = "{$nav_li_all_selector} { margin-top: {$attributes['navVerticalPosition_tablet']}px; }";
        }
        if ( isset( $attributes['navVerticalPosition_mobile'] ) && $attributes['navVerticalPosition_mobile'] !== '' ) {
            $mobile_rules[] = "{$nav_li_all_selector} { margin-top: {$attributes['navVerticalPosition_mobile']}px; }";
        }

        // 1.3 Button Icon Color
        if ( ! empty( $attributes['navButtonIconColor'] ) ) {
            $css_rules[] = "{$btn_selector} { --ts-icon-color: {$attributes['navButtonIconColor']}; color: {$attributes['navButtonIconColor']}; }";
        }

        // 1.4 Button Size
        if ( isset( $attributes['navButtonSize'] ) && $attributes['navButtonSize'] !== '' ) {
            $css_rules[] = "{$btn_selector} { width: {$attributes['navButtonSize']}px; height: {$attributes['navButtonSize']}px; }";
        }
        if ( isset( $attributes['navButtonSize_tablet'] ) && $attributes['navButtonSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$btn_selector} { width: {$attributes['navButtonSize_tablet']}px; height: {$attributes['navButtonSize_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonSize_mobile'] ) && $attributes['navButtonSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$btn_selector} { width: {$attributes['navButtonSize_mobile']}px; height: {$attributes['navButtonSize_mobile']}px; }";
        }

        // 1.5 Button Icon Size
        if ( isset( $attributes['navButtonIconSize'] ) && $attributes['navButtonIconSize'] !== '' ) {
            $css_rules[] = "{$btn_selector} { --ts-icon-size: {$attributes['navButtonIconSize']}px; }";
        }
        if ( isset( $attributes['navButtonIconSize_tablet'] ) && $attributes['navButtonIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$btn_selector} { --ts-icon-size: {$attributes['navButtonIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonIconSize_mobile'] ) && $attributes['navButtonIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$btn_selector} { --ts-icon-size: {$attributes['navButtonIconSize_mobile']}px; }";
        }

        // 1.6 Button Background
        if ( ! empty( $attributes['navButtonBackground'] ) ) {
            $css_rules[] = "{$btn_selector} { background-color: {$attributes['navButtonBackground']}; }";
        }

        // 1.7 Backdrop Blur
        if ( isset( $attributes['navBackdropBlur'] ) && $attributes['navBackdropBlur'] !== '' ) {
            $css_rules[] = "{$btn_selector} { backdrop-filter: blur({$attributes['navBackdropBlur']}px); }";
        }
        if ( isset( $attributes['navBackdropBlur_tablet'] ) && $attributes['navBackdropBlur_tablet'] !== '' ) {
            $tablet_rules[] = "{$btn_selector} { backdrop-filter: blur({$attributes['navBackdropBlur_tablet']}px); }";
        }
        if ( isset( $attributes['navBackdropBlur_mobile'] ) && $attributes['navBackdropBlur_mobile'] !== '' ) {
            $mobile_rules[] = "{$btn_selector} { backdrop-filter: blur({$attributes['navBackdropBlur_mobile']}px); }";
        }

        // 1.8 Border
        if ( ! empty( $attributes['navBorderType'] ) && $attributes['navBorderType'] !== 'none' ) {
            $css_rules[] = "{$btn_selector} { border-style: {$attributes['navBorderType']}; }";

            if ( ! empty( $attributes['navBorderWidth'] ) ) {
                $border_css = self::generate_border_width_css( $attributes['navBorderWidth'] );
                if ( $border_css ) {
                    $css_rules[] = "{$btn_selector} { border-width: {$border_css}; }";
                }
            }

            if ( ! empty( $attributes['navBorderColor'] ) ) {
                $css_rules[] = "{$btn_selector} { border-color: {$attributes['navBorderColor']}; }";
            }
        }

        // 1.9 Border Radius
        if ( isset( $attributes['navBorderRadius'] ) && $attributes['navBorderRadius'] !== '' ) {
            $css_rules[] = "{$btn_selector} { border-radius: {$attributes['navBorderRadius']}px; }";
        }
        if ( isset( $attributes['navBorderRadius_tablet'] ) && $attributes['navBorderRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$btn_selector} { border-radius: {$attributes['navBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['navBorderRadius_mobile'] ) && $attributes['navBorderRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$btn_selector} { border-radius: {$attributes['navBorderRadius_mobile']}px; }";
        }

        // --- HOVER STATE ---

        // 1.10 Button Size Hover
        if ( isset( $attributes['navButtonSizeHover'] ) && $attributes['navButtonSizeHover'] !== '' ) {
            $css_rules[] = "{$btn_hover_selector} { width: {$attributes['navButtonSizeHover']}px; height: {$attributes['navButtonSizeHover']}px; }";
        }
        if ( isset( $attributes['navButtonSizeHover_tablet'] ) && $attributes['navButtonSizeHover_tablet'] !== '' ) {
            $tablet_rules[] = "{$btn_hover_selector} { width: {$attributes['navButtonSizeHover_tablet']}px; height: {$attributes['navButtonSizeHover_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonSizeHover_mobile'] ) && $attributes['navButtonSizeHover_mobile'] !== '' ) {
            $mobile_rules[] = "{$btn_hover_selector} { width: {$attributes['navButtonSizeHover_mobile']}px; height: {$attributes['navButtonSizeHover_mobile']}px; }";
        }

        // 1.11 Button Icon Size Hover
        if ( isset( $attributes['navButtonIconSizeHover'] ) && $attributes['navButtonIconSizeHover'] !== '' ) {
            $css_rules[] = "{$btn_hover_selector} { --ts-icon-size: {$attributes['navButtonIconSizeHover']}px; }";
        }
        if ( isset( $attributes['navButtonIconSizeHover_tablet'] ) && $attributes['navButtonIconSizeHover_tablet'] !== '' ) {
            $tablet_rules[] = "{$btn_hover_selector} { --ts-icon-size: {$attributes['navButtonIconSizeHover_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonIconSizeHover_mobile'] ) && $attributes['navButtonIconSizeHover_mobile'] !== '' ) {
            $mobile_rules[] = "{$btn_hover_selector} { --ts-icon-size: {$attributes['navButtonIconSizeHover_mobile']}px; }";
        }

        // 1.12 Button Icon Color Hover
        if ( ! empty( $attributes['navButtonIconColorHover'] ) ) {
            $css_rules[] = "{$btn_hover_selector} { --ts-icon-color: {$attributes['navButtonIconColorHover']}; color: {$attributes['navButtonIconColorHover']}; }";
        }

        // 1.13 Button Background Hover
        if ( ! empty( $attributes['navButtonBackgroundHover'] ) ) {
            $css_rules[] = "{$btn_hover_selector} { background-color: {$attributes['navButtonBackgroundHover']}; }";
        }

        // 1.14 Button Border Color Hover
        if ( ! empty( $attributes['navButtonBorderColorHover'] ) ) {
            $css_rules[] = "{$btn_hover_selector} { border-color: {$attributes['navButtonBorderColorHover']}; }";
        }

        // ============================================
        // 2. LAYOUT ATTRIBUTES
        // ============================================

        $grid_selector = "{$selector} .post-feed-grid";

        // 2.1 Item Gap
        if ( isset( $attributes['itemGap'] ) && $attributes['itemGap'] !== '' ) {
            $css_rules[] = "{$grid_selector} { gap: {$attributes['itemGap']}px; }";
        }
        if ( isset( $attributes['itemGap_tablet'] ) && $attributes['itemGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$grid_selector} { gap: {$attributes['itemGap_tablet']}px; }";
        }
        if ( isset( $attributes['itemGap_mobile'] ) && $attributes['itemGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$grid_selector} { gap: {$attributes['itemGap_mobile']}px; }";
        }

        // 2.2 Layout Mode: Grid (ts-feed-grid-default)
        if ( ! empty( $attributes['layoutMode'] ) && $attributes['layoutMode'] === 'ts-feed-grid-default' ) {
            // Grid Columns
            if ( isset( $attributes['gridColumns'] ) && $attributes['gridColumns'] !== '' ) {
                $css_rules[] = "{$grid_selector} { grid-template-columns: repeat({$attributes['gridColumns']}, minmax(0, 1fr)); }";
            }
            if ( isset( $attributes['gridColumns_tablet'] ) && $attributes['gridColumns_tablet'] !== '' ) {
                $tablet_rules[] = "{$grid_selector} { grid-template-columns: repeat({$attributes['gridColumns_tablet']}, minmax(0, 1fr)); }";
            }
            if ( isset( $attributes['gridColumns_mobile'] ) && $attributes['gridColumns_mobile'] !== '' ) {
                $mobile_rules[] = "{$grid_selector} { grid-template-columns: repeat({$attributes['gridColumns_mobile']}, minmax(0, 1fr)); }";
            }
        }

        // 2.3 Layout Mode: Carousel (ts-feed-nowrap)
        elseif ( ! empty( $attributes['layoutMode'] ) && $attributes['layoutMode'] === 'ts-feed-nowrap' ) {
            // Scroll Padding
            if ( isset( $attributes['scrollPadding'] ) && $attributes['scrollPadding'] !== '' ) {
                $css_rules[] = "{$grid_selector} { padding-left: {$attributes['scrollPadding']}px; padding-right: {$attributes['scrollPadding']}px; scroll-padding: {$attributes['scrollPadding']}px; }";
                $css_rules[] = "{$grid_selector} > div:last-of-type { margin-right: {$attributes['scrollPadding']}px; }";
            }
            if ( isset( $attributes['scrollPadding_tablet'] ) && $attributes['scrollPadding_tablet'] !== '' ) {
                $tablet_rules[] = "{$grid_selector} { padding-left: {$attributes['scrollPadding_tablet']}px; padding-right: {$attributes['scrollPadding_tablet']}px; scroll-padding: {$attributes['scrollPadding_tablet']}px; }";
                $tablet_rules[] = "{$grid_selector} > div:last-of-type { margin-right: {$attributes['scrollPadding_tablet']}px; }";
            }
            if ( isset( $attributes['scrollPadding_mobile'] ) && $attributes['scrollPadding_mobile'] !== '' ) {
                $mobile_rules[] = "{$grid_selector} { padding-left: {$attributes['scrollPadding_mobile']}px; padding-right: {$attributes['scrollPadding_mobile']}px; scroll-padding: {$attributes['scrollPadding_mobile']}px; }";
                $mobile_rules[] = "{$grid_selector} > div:last-of-type { margin-right: {$attributes['scrollPadding_mobile']}px; }";
            }

            // Item Width
            $item_selector = "{$selector} .ts-feed-nowrap .ts-preview";
            $unit = $attributes['carouselItemWidthUnit'] ?? '%';
            if ( isset( $attributes['carouselItemWidth'] ) && $attributes['carouselItemWidth'] !== '' ) {
                $width = $attributes['carouselItemWidth'];
                $css_rules[] = "{$item_selector} { width: {$width}{$unit}; min-width: {$width}{$unit}; flex-basis: {$width}{$unit}; }";
            }
            if ( isset( $attributes['carouselItemWidth_tablet'] ) && $attributes['carouselItemWidth_tablet'] !== '' ) {
                $width = $attributes['carouselItemWidth_tablet'];
                $tablet_rules[] = "{$item_selector} { width: {$width}{$unit}; min-width: {$width}{$unit}; flex-basis: {$width}{$unit}; }";
            }
            if ( isset( $attributes['carouselItemWidth_mobile'] ) && $attributes['carouselItemWidth_mobile'] !== '' ) {
                $width = $attributes['carouselItemWidth_mobile'];
                $mobile_rules[] = "{$item_selector} { width: {$width}{$unit}; min-width: {$width}{$unit}; flex-basis: {$width}{$unit}; }";
            }

            // Item Padding
            if ( isset( $attributes['itemPadding'] ) && $attributes['itemPadding'] !== '' ) {
                $css_rules[] = "{$item_selector} { padding: {$attributes['itemPadding']}px; }";
            }
            if ( isset( $attributes['itemPadding_tablet'] ) && $attributes['itemPadding_tablet'] !== '' ) {
                $tablet_rules[] = "{$item_selector} { padding: {$attributes['itemPadding_tablet']}px; }";
            }
            if ( isset( $attributes['itemPadding_mobile'] ) && $attributes['itemPadding_mobile'] !== '' ) {
                $mobile_rules[] = "{$item_selector} { padding: {$attributes['itemPadding_mobile']}px; }";
            }
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================

        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Slider Block
     *
     * Evidence: slider.php:170-686
     * Sections: 3 (General/Images, Thumbnails, Carousel Navigation)
     *
     * @param array  $attributes Block attributes from Gutenberg
     * @param string $block_id   Block ID for scoped selector
     * @return string Generated CSS
     */
    public static function generate_slider_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        $selector = '.voxel-fse-slider-' . $block_id;

        // ============================================
        // SECTION 1: GENERAL (Image Styling)
        // Evidence: slider.php:170-267
        // ============================================

        // Image aspect ratio (Normal)
        if ( ! empty( $attributes['imageAspectRatio'] ) ) {
            $css_rules[] = "{$selector} .ts-preview img { aspect-ratio: {$attributes['imageAspectRatio']}; }";
        }
        if ( ! empty( $attributes['imageAspectRatio_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-preview img { aspect-ratio: {$attributes['imageAspectRatio_tablet']}; }";
        }
        if ( ! empty( $attributes['imageAspectRatio_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-preview img { aspect-ratio: {$attributes['imageAspectRatio_mobile']}; }";
        }

        // Border radius (Normal)
        if ( isset( $attributes['imageBorderRadius'] ) && $attributes['imageBorderRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-slider, {$selector} .ts-single-slide { border-radius: {$attributes['imageBorderRadius']}px; }";
        }
        if ( isset( $attributes['imageBorderRadius_tablet'] ) && $attributes['imageBorderRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-slider, {$selector} .ts-single-slide { border-radius: {$attributes['imageBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['imageBorderRadius_mobile'] ) && $attributes['imageBorderRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-slider, {$selector} .ts-single-slide { border-radius: {$attributes['imageBorderRadius_mobile']}px; }";
        }

        // Opacity (Normal)
        if ( isset( $attributes['imageOpacity'] ) && $attributes['imageOpacity'] !== '' ) {
            $css_rules[] = "{$selector} { opacity: {$attributes['imageOpacity']}; }";
        }
        if ( isset( $attributes['imageOpacity_tablet'] ) && $attributes['imageOpacity_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} { opacity: {$attributes['imageOpacity_tablet']}; }";
        }
        if ( isset( $attributes['imageOpacity_mobile'] ) && $attributes['imageOpacity_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} { opacity: {$attributes['imageOpacity_mobile']}; }";
        }

        // Opacity (Hover)
        if ( isset( $attributes['imageOpacityHover'] ) && $attributes['imageOpacityHover'] !== '' ) {
            $css_rules[] = "{$selector}:hover { opacity: {$attributes['imageOpacityHover']}; }";
        }
        if ( isset( $attributes['imageOpacityHover_tablet'] ) && $attributes['imageOpacityHover_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector}:hover { opacity: {$attributes['imageOpacityHover_tablet']}; }";
        }
        if ( isset( $attributes['imageOpacityHover_mobile'] ) && $attributes['imageOpacityHover_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector}:hover { opacity: {$attributes['imageOpacityHover_mobile']}; }";
        }

        // ============================================
        // SECTION 2: THUMBNAILS
        // Evidence: slider.php:271-385
        // ============================================

        // Thumbnail size (Normal)
        if ( isset( $attributes['thumbnailSize'] ) && $attributes['thumbnailSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-slide-nav a { width: {$attributes['thumbnailSize']}px; height: {$attributes['thumbnailSize']}px; }";
        }
        if ( isset( $attributes['thumbnailSize_tablet'] ) && $attributes['thumbnailSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-slide-nav a { width: {$attributes['thumbnailSize_tablet']}px; height: {$attributes['thumbnailSize_tablet']}px; }";
        }
        if ( isset( $attributes['thumbnailSize_mobile'] ) && $attributes['thumbnailSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-slide-nav a { width: {$attributes['thumbnailSize_mobile']}px; height: {$attributes['thumbnailSize_mobile']}px; }";
        }

        // Thumbnail border radius (Normal)
        if ( isset( $attributes['thumbnailBorderRadius'] ) && $attributes['thumbnailBorderRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-slide-nav a { border-radius: {$attributes['thumbnailBorderRadius']}px; }";
        }
        if ( isset( $attributes['thumbnailBorderRadius_tablet'] ) && $attributes['thumbnailBorderRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-slide-nav a { border-radius: {$attributes['thumbnailBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['thumbnailBorderRadius_mobile'] ) && $attributes['thumbnailBorderRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-slide-nav a { border-radius: {$attributes['thumbnailBorderRadius_mobile']}px; }";
        }

        // Thumbnail opacity (Normal)
        if ( isset( $attributes['thumbnailOpacity'] ) && $attributes['thumbnailOpacity'] !== '' ) {
            $css_rules[] = "{$selector} .ts-slide-nav a { opacity: {$attributes['thumbnailOpacity']}; }";
        }
        if ( isset( $attributes['thumbnailOpacity_tablet'] ) && $attributes['thumbnailOpacity_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-slide-nav a { opacity: {$attributes['thumbnailOpacity_tablet']}; }";
        }
        if ( isset( $attributes['thumbnailOpacity_mobile'] ) && $attributes['thumbnailOpacity_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-slide-nav a { opacity: {$attributes['thumbnailOpacity_mobile']}; }";
        }

        // Thumbnail opacity (Hover)
        if ( isset( $attributes['thumbnailOpacityHover'] ) && $attributes['thumbnailOpacityHover'] !== '' ) {
            $css_rules[] = "{$selector} .ts-slide-nav a:hover { opacity: {$attributes['thumbnailOpacityHover']}; }";
        }
        if ( isset( $attributes['thumbnailOpacityHover_tablet'] ) && $attributes['thumbnailOpacityHover_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-slide-nav a:hover { opacity: {$attributes['thumbnailOpacityHover_tablet']}; }";
        }
        if ( isset( $attributes['thumbnailOpacityHover_mobile'] ) && $attributes['thumbnailOpacityHover_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-slide-nav a:hover { opacity: {$attributes['thumbnailOpacityHover_mobile']}; }";
        }

        // ============================================
        // SECTION 3: CAROUSEL NAVIGATION
        // Evidence: slider.php:386-686
        // ============================================

        // Horizontal position (Normal)
        if ( isset( $attributes['navHorizontalPosition'] ) && $attributes['navHorizontalPosition'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav li:last-child { margin-right: {$attributes['navHorizontalPosition']}px; }";
            $css_rules[] = "{$selector} .post-feed-nav li:first-child { margin-left: {$attributes['navHorizontalPosition']}px; }";
        }
        if ( isset( $attributes['navHorizontalPosition_tablet'] ) && $attributes['navHorizontalPosition_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav li:last-child { margin-right: {$attributes['navHorizontalPosition_tablet']}px; }";
            $tablet_rules[] = "{$selector} .post-feed-nav li:first-child { margin-left: {$attributes['navHorizontalPosition_tablet']}px; }";
        }
        if ( isset( $attributes['navHorizontalPosition_mobile'] ) && $attributes['navHorizontalPosition_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav li:last-child { margin-right: {$attributes['navHorizontalPosition_mobile']}px; }";
            $mobile_rules[] = "{$selector} .post-feed-nav li:first-child { margin-left: {$attributes['navHorizontalPosition_mobile']}px; }";
        }

        // Vertical position (Normal)
        if ( isset( $attributes['navVerticalPosition'] ) && $attributes['navVerticalPosition'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav li { margin-top: {$attributes['navVerticalPosition']}px; }";
        }
        if ( isset( $attributes['navVerticalPosition_tablet'] ) && $attributes['navVerticalPosition_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav li { margin-top: {$attributes['navVerticalPosition_tablet']}px; }";
        }
        if ( isset( $attributes['navVerticalPosition_mobile'] ) && $attributes['navVerticalPosition_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav li { margin-top: {$attributes['navVerticalPosition_mobile']}px; }";
        }

        // Button icon color (Normal)
        if ( ! empty( $attributes['navButtonIconColor'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn i { color: {$attributes['navButtonIconColor']}; }";
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg { fill: {$attributes['navButtonIconColor']}; }";
        }

        // Button size (Normal)
        if ( isset( $attributes['navButtonSize'] ) && $attributes['navButtonSize'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { width: {$attributes['navButtonSize']}px; height: {$attributes['navButtonSize']}px; }";
        }
        if ( isset( $attributes['navButtonSize_tablet'] ) && $attributes['navButtonSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { width: {$attributes['navButtonSize_tablet']}px; height: {$attributes['navButtonSize_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonSize_mobile'] ) && $attributes['navButtonSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { width: {$attributes['navButtonSize_mobile']}px; height: {$attributes['navButtonSize_mobile']}px; }";
        }

        // Button icon size (Normal)
        if ( isset( $attributes['navButtonIconSize'] ) && $attributes['navButtonIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn i { font-size: {$attributes['navButtonIconSize']}px; }";
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg { width: {$attributes['navButtonIconSize']}px; height: {$attributes['navButtonIconSize']}px; }";
        }
        if ( isset( $attributes['navButtonIconSize_tablet'] ) && $attributes['navButtonIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn i { font-size: {$attributes['navButtonIconSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg { width: {$attributes['navButtonIconSize_tablet']}px; height: {$attributes['navButtonIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonIconSize_mobile'] ) && $attributes['navButtonIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn i { font-size: {$attributes['navButtonIconSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn svg { width: {$attributes['navButtonIconSize_mobile']}px; height: {$attributes['navButtonIconSize_mobile']}px; }";
        }

        // Button background (Normal)
        if ( ! empty( $attributes['navButtonBackground'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { background-color: {$attributes['navButtonBackground']}; }";
        }

        // Backdrop blur (Normal)
        if ( isset( $attributes['navBackdropBlur'] ) && $attributes['navBackdropBlur'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur({$attributes['navBackdropBlur']}px); }";
        }
        if ( isset( $attributes['navBackdropBlur_tablet'] ) && $attributes['navBackdropBlur_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur({$attributes['navBackdropBlur_tablet']}px); }";
        }
        if ( isset( $attributes['navBackdropBlur_mobile'] ) && $attributes['navBackdropBlur_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { backdrop-filter: blur({$attributes['navBackdropBlur_mobile']}px); }";
        }

        // Border (Normal)
        if ( ! empty( $attributes['navBorderType'] ) && $attributes['navBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-style: {$attributes['navBorderType']}; }";

            if ( ! empty( $attributes['navBorderColor'] ) ) {
                $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-color: {$attributes['navBorderColor']}; }";
            }

            // Border width (default to 1px if not specified)
            $border_width = isset( $attributes['navBorderWidth'] ) && $attributes['navBorderWidth'] !== '' ? "{$attributes['navBorderWidth']}px" : '1px';
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-width: {$border_width}; }";
        }

        // Button border radius (Normal)
        if ( isset( $attributes['navButtonBorderRadius'] ) && $attributes['navButtonBorderRadius'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-radius: {$attributes['navButtonBorderRadius']}px; }";
        }
        if ( isset( $attributes['navButtonBorderRadius_tablet'] ) && $attributes['navButtonBorderRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-radius: {$attributes['navButtonBorderRadius_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonBorderRadius_mobile'] ) && $attributes['navButtonBorderRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn { border-radius: {$attributes['navButtonBorderRadius_mobile']}px; }";
        }

        // --- HOVER STATE ---

        // Button size (Hover)
        if ( isset( $attributes['navButtonSizeHover'] ) && $attributes['navButtonSizeHover'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { width: {$attributes['navButtonSizeHover']}px; height: {$attributes['navButtonSizeHover']}px; }";
        }
        if ( isset( $attributes['navButtonSizeHover_tablet'] ) && $attributes['navButtonSizeHover_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { width: {$attributes['navButtonSizeHover_tablet']}px; height: {$attributes['navButtonSizeHover_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonSizeHover_mobile'] ) && $attributes['navButtonSizeHover_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { width: {$attributes['navButtonSizeHover_mobile']}px; height: {$attributes['navButtonSizeHover_mobile']}px; }";
        }

        // Button icon size (Hover)
        if ( isset( $attributes['navButtonIconSizeHover'] ) && $attributes['navButtonIconSizeHover'] !== '' ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover i { font-size: {$attributes['navButtonIconSizeHover']}px; }";
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg { width: {$attributes['navButtonIconSizeHover']}px; height: {$attributes['navButtonIconSizeHover']}px; }";
        }
        if ( isset( $attributes['navButtonIconSizeHover_tablet'] ) && $attributes['navButtonIconSizeHover_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover i { font-size: {$attributes['navButtonIconSizeHover_tablet']}px; }";
            $tablet_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg { width: {$attributes['navButtonIconSizeHover_tablet']}px; height: {$attributes['navButtonIconSizeHover_tablet']}px; }";
        }
        if ( isset( $attributes['navButtonIconSizeHover_mobile'] ) && $attributes['navButtonIconSizeHover_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover i { font-size: {$attributes['navButtonIconSizeHover_mobile']}px; }";
            $mobile_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg { width: {$attributes['navButtonIconSizeHover_mobile']}px; height: {$attributes['navButtonIconSizeHover_mobile']}px; }";
        }

        // Button icon color (Hover)
        if ( ! empty( $attributes['navButtonIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover i { color: {$attributes['navButtonIconColorHover']}; }";
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover svg { fill: {$attributes['navButtonIconColorHover']}; }";
        }

        // Button background color (Hover)
        if ( ! empty( $attributes['navButtonBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { background-color: {$attributes['navButtonBackgroundHover']}; }";
        }

        // Button border color (Hover)
        if ( ! empty( $attributes['navBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .post-feed-nav .ts-icon-btn:hover { border-color: {$attributes['navBorderColorHover']}; }";
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================

        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Image Block
     *
     * Sections: Alignment, Dimensions, Caption, Border/Radius, Box Shadow, Filters/Opacity
     *
     * @param array  $attributes Block attributes from Gutenberg
     * @param string $block_id   Block ID for scoped selector
     * @return string Generated CSS
     */
    public static function generate_image_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        $selector = '.voxel-fse-image-wrapper-' . $block_id;

        // ============================================
        // 1. ALIGNMENT (Wrapper)
        // ============================================
        if ( ! empty( $attributes['imageAlign'] ) ) {
            $css_rules[] = "{$selector} { text-align: {$attributes['imageAlign']}; }";
        }
        if ( ! empty( $attributes['imageAlign_tablet'] ) ) {
            $tablet_rules[] = "{$selector} { text-align: {$attributes['imageAlign_tablet']}; }";
        }
        if ( ! empty( $attributes['imageAlign_mobile'] ) ) {
            $mobile_rules[] = "{$selector} { text-align: {$attributes['imageAlign_mobile']}; }";
        }

        // ============================================
        // 2. DIMENSIONS (Image)
        // ============================================

        // Width
        if ( isset( $attributes['width'] ) && $attributes['width'] !== '' ) {
            $unit = $attributes['widthUnit'] ?? 'px';
            $css_rules[] = "{$selector} img { width: {$attributes['width']}{$unit}; }";
        }
        if ( isset( $attributes['width_tablet'] ) && $attributes['width_tablet'] !== '' ) {
            $unit = $attributes['widthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} img { width: {$attributes['width_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['width_mobile'] ) && $attributes['width_mobile'] !== '' ) {
            $unit = $attributes['widthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} img { width: {$attributes['width_mobile']}{$unit}; }";
        }

        // Custom Size (overrides responsive width/height if set)
        if ( ! empty( $attributes['imageSize'] ) && $attributes['imageSize'] === 'custom' ) {
            if ( ! empty( $attributes['customWidth'] ) ) {
                $css_rules[] = "{$selector} img { width: {$attributes['customWidth']}px; }";
            } else {
                $css_rules[] = "{$selector} img { width: auto; }";
            }

            if ( ! empty( $attributes['customHeight'] ) ) {
                $css_rules[] = "{$selector} img { height: {$attributes['customHeight']}px; }";
            } else {
                $css_rules[] = "{$selector} img { height: auto; }";
            }
        }

        // Max Width
        if ( isset( $attributes['maxWidth'] ) && $attributes['maxWidth'] !== '' ) {
            $unit = $attributes['maxWidthUnit'] ?? 'px';
            $css_rules[] = "{$selector} img { max-width: {$attributes['maxWidth']}{$unit}; }";
        }
        if ( isset( $attributes['maxWidth_tablet'] ) && $attributes['maxWidth_tablet'] !== '' ) {
            $unit = $attributes['maxWidthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} img { max-width: {$attributes['maxWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['maxWidth_mobile'] ) && $attributes['maxWidth_mobile'] !== '' ) {
            $unit = $attributes['maxWidthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} img { max-width: {$attributes['maxWidth_mobile']}{$unit}; }";
        }

        // Height
        if ( isset( $attributes['height'] ) && $attributes['height'] !== '' ) {
            $unit = $attributes['heightUnit'] ?? 'px';
            $css_rules[] = "{$selector} img { height: {$attributes['height']}{$unit}; }";
        }
        if ( isset( $attributes['height_tablet'] ) && $attributes['height_tablet'] !== '' ) {
            $unit = $attributes['heightUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} img { height: {$attributes['height_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['height_mobile'] ) && $attributes['height_mobile'] !== '' ) {
            $unit = $attributes['heightUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} img { height: {$attributes['height_mobile']}{$unit}; }";
        }

        // Object Fit (Responsive)
        if ( ! empty( $attributes['objectFit'] ) ) {
            $css_rules[] = "{$selector} img { object-fit: {$attributes['objectFit']}; }";
        }
        if ( ! empty( $attributes['objectFit_tablet'] ) ) {
            $tablet_rules[] = "{$selector} img { object-fit: {$attributes['objectFit_tablet']}; }";
        }
        if ( ! empty( $attributes['objectFit_mobile'] ) ) {
            $mobile_rules[] = "{$selector} img { object-fit: {$attributes['objectFit_mobile']}; }";
        }

        // Object Position (Responsive)
        if ( ! empty( $attributes['objectPosition'] ) ) {
            $css_rules[] = "{$selector} img { object-position: {$attributes['objectPosition']}; }";
        }
        if ( ! empty( $attributes['objectPosition_tablet'] ) ) {
            $tablet_rules[] = "{$selector} img { object-position: {$attributes['objectPosition_tablet']}; }";
        }
        if ( ! empty( $attributes['objectPosition_mobile'] ) ) {
            $mobile_rules[] = "{$selector} img { object-position: {$attributes['objectPosition_mobile']}; }";
        }

        // ============================================
        // 3. CAPTION ALIGNMENT
        // ============================================
        if ( ! empty( $attributes['captionAlign'] ) ) {
            $css_rules[] = "{$selector} figcaption { text-align: {$attributes['captionAlign']}; }";
        }
        if ( ! empty( $attributes['captionAlign_tablet'] ) ) {
            $tablet_rules[] = "{$selector} figcaption { text-align: {$attributes['captionAlign_tablet']}; }";
        }
        if ( ! empty( $attributes['captionAlign_mobile'] ) ) {
            $mobile_rules[] = "{$selector} figcaption { text-align: {$attributes['captionAlign_mobile']}; }";
        }

        // ============================================
        // 4. BORDER & RADIUS
        // ============================================
        if ( ! empty( $attributes['imageBorder'] ) ) {
            $border = $attributes['imageBorder'];

            // Border Type
            if ( ! empty( $border['borderType'] ) && $border['borderType'] !== 'none' ) {
                $css_rules[] = "{$selector} img { border-style: {$border['borderType']}; }";

                // Width
                if ( ! empty( $border['borderWidth'] ) ) {
                    $border_css = self::generate_border_width_css( $border['borderWidth'] );
                    if ( $border_css ) {
                        $css_rules[] = "{$selector} img { border-width: {$border_css}; }";
                    }
                }

                // Color
                if ( ! empty( $border['borderColor'] ) ) {
                    $css_rules[] = "{$selector} img { border-color: {$border['borderColor']}; }";
                }
            }

            // Radius (Standard)
            if ( ! empty( $border['borderRadius'] ) ) {
                $radius_css = self::generate_dimensions_css( $border['borderRadius'] );
                if ( $radius_css ) {
                    $css_rules[] = "{$selector} img { border-radius: {$radius_css}; }";
                }
            }

            // Radius (Responsive)
            if ( ! empty( $border['borderRadius_tablet'] ) ) {
                $radius_css = self::generate_dimensions_css( $border['borderRadius_tablet'] );
                if ( $radius_css ) {
                    $tablet_rules[] = "{$selector} img { border-radius: {$radius_css}; }";
                }
            }
            if ( ! empty( $border['borderRadius_mobile'] ) ) {
                $radius_css = self::generate_dimensions_css( $border['borderRadius_mobile'] );
                if ( $radius_css ) {
                    $mobile_rules[] = "{$selector} img { border-radius: {$radius_css}; }";
                }
            }
        }

        // ============================================
        // 5. BOX SHADOW
        // ============================================
        if ( ! empty( $attributes['imageBoxShadow'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['imageBoxShadow'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} img { box-shadow: {$shadow_css}; }";
            }
        }

        // ============================================
        // 6. FILTERS & OPACITY
        // ============================================

        // Opacity
        if ( isset( $attributes['imageOpacity'] ) && $attributes['imageOpacity'] !== '' ) {
            $css_rules[] = "{$selector} img { opacity: {$attributes['imageOpacity']}; }";
        }

        // CSS Filters
        if ( ! empty( $attributes['imageCssFilters'] ) ) {
            $filters = $attributes['imageCssFilters'];
            $filter_parts = [];

            if ( isset( $filters['blur'] ) && $filters['blur'] !== '' ) {
                $filter_parts[] = "blur({$filters['blur']}px)";
            }
            if ( isset( $filters['brightness'] ) && $filters['brightness'] !== '' ) {
                $filter_parts[] = "brightness({$filters['brightness']}%)";
            }
            if ( isset( $filters['contrast'] ) && $filters['contrast'] !== '' ) {
                $filter_parts[] = "contrast({$filters['contrast']}%)";
            }
            if ( isset( $filters['saturation'] ) && $filters['saturation'] !== '' ) {
                $filter_parts[] = "saturate({$filters['saturation']}%)";
            }
            if ( isset( $filters['hue'] ) && $filters['hue'] !== '' ) {
                $filter_parts[] = "hue-rotate({$filters['hue']}deg)";
            }

            if ( ! empty( $filter_parts ) ) {
                $css_rules[] = "{$selector} img { filter: " . implode( ' ', $filter_parts ) . "; }";
            }
        }

        // Transition
        if ( isset( $attributes['imageTransitionDuration'] ) && $attributes['imageTransitionDuration'] !== '' ) {
            $css_rules[] = "{$selector} img { transition-duration: {$attributes['imageTransitionDuration']}s; }";
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================

        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Advanced List block
     *
     * Comprehensive CSS generation covering:
     * - Layout (CSS Grid with responsive columns)
     * - List items (padding, height, border, radius, box shadow, typography, colors)
     * - Icon containers (background, size, border, radius, box shadow)
     * - Icons (size, color)
     * - Hover states (all of the above)
     * - Active states (all of the above)
     * - Tooltips (position, typography, colors, border radius)
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Block identifier
     * @return string Generated CSS
     */
    public static function generate_advanced_list_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-advanced-list-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // Helper: Parse dimension (convert empty/null to 0)
        $parse_dimension = function( $val ) {
            if ( $val === null || $val === '' ) {
                return 0;
            }
            return is_numeric( $val ) ? (int) $val : $val;
        };

        // Helper: Check if box shadow has values
        $has_box_shadow = function( $shadow ) {
            if ( empty( $shadow ) || ! is_array( $shadow ) ) {
                return false;
            }
            return ! empty( $shadow['horizontal'] ) || ! empty( $shadow['vertical'] ) || ! empty( $shadow['blur'] ) || ! empty( $shadow['spread'] );
        };

        // Helper: Generate box shadow CSS
        $generate_box_shadow = function( $shadow ) {
            if ( empty( $shadow ) || ! is_array( $shadow ) ) {
                return '';
            }
            $position = ! empty( $shadow['position'] ) && $shadow['position'] === 'inset' ? 'inset ' : '';
            $horizontal = $shadow['horizontal'] ?? 0;
            $vertical = $shadow['vertical'] ?? 0;
            $blur = $shadow['blur'] ?? 0;
            $spread = $shadow['spread'] ?? 0;
            $color = $shadow['color'] ?? 'rgba(0,0,0,0.5)';
            return "{$position}{$horizontal}px {$vertical}px {$blur}px {$spread}px {$color}";
        };

        // Helper: Check if typography has values
        $has_typography = function( $typo ) {
            return ! empty( $typo ) && is_array( $typo ) && (
                ! empty( $typo['fontFamily'] ) ||
                ! empty( $typo['fontSize'] ) ||
                ! empty( $typo['fontWeight'] ) ||
                ! empty( $typo['lineHeight'] ) ||
                ! empty( $typo['letterSpacing'] ) ||
                ! empty( $typo['textTransform'] )
            );
        };

        // Helper: Generate typography CSS
        $generate_typography = function( $typo ) {
            if ( empty( $typo ) || ! is_array( $typo ) ) {
                return '';
            }
            $parts = [];
            if ( ! empty( $typo['fontFamily'] ) ) {
                $parts[] = "font-family: {$typo['fontFamily']}";
            }
            if ( isset( $typo['fontSize'] ) && $typo['fontSize'] !== '' ) {
                $unit = $typo['fontSizeUnit'] ?? 'px';
                $parts[] = "font-size: {$typo['fontSize']}{$unit}";
            }
            if ( ! empty( $typo['fontWeight'] ) ) {
                $parts[] = "font-weight: {$typo['fontWeight']}";
            }
            if ( isset( $typo['lineHeight'] ) && $typo['lineHeight'] !== '' ) {
                $unit = $typo['lineHeightUnit'] ?? '';
                $parts[] = "line-height: {$typo['lineHeight']}{$unit}";
            }
            if ( isset( $typo['letterSpacing'] ) && $typo['letterSpacing'] !== '' ) {
                $unit = $typo['letterSpacingUnit'] ?? 'px';
                $parts[] = "letter-spacing: {$typo['letterSpacing']}{$unit}";
            }
            if ( ! empty( $typo['textTransform'] ) ) {
                $parts[] = "text-transform: {$typo['textTransform']}";
            }
            return implode( '; ', $parts );
        };

        // ============================================
        // LAYOUT - CSS GRID
        // ============================================

        // List Layout Mode
        if ( ! empty( $attributes['listLayout'] ) && $attributes['listLayout'] === 'css-grid' ) {
            $css_rules[] = "{$selector} { display: grid; }";

            // Grid columns (responsive)
            if ( isset( $attributes['gridColumns'] ) && $attributes['gridColumns'] !== '' ) {
                $cols = (int) $attributes['gridColumns'];
                $css_rules[] = "{$selector} { grid-template-columns: repeat({$cols}, minmax(0, 1fr)); }";
            }
            if ( isset( $attributes['gridColumns_tablet'] ) && $attributes['gridColumns_tablet'] !== '' ) {
                $cols = (int) $attributes['gridColumns_tablet'];
                $tablet_rules[] = "{$selector} { grid-template-columns: repeat({$cols}, minmax(0, 1fr)); }";
            }
            if ( isset( $attributes['gridColumns_mobile'] ) && $attributes['gridColumns_mobile'] !== '' ) {
                $cols = (int) $attributes['gridColumns_mobile'];
                $mobile_rules[] = "{$selector} { grid-template-columns: repeat({$cols}, minmax(0, 1fr)); }";
            }

            // Item gap (responsive)
            if ( isset( $attributes['itemGap'] ) && $attributes['itemGap'] !== '' ) {
                $unit = $attributes['itemGapUnit'] ?? 'px';
                $css_rules[] = "{$selector} { gap: {$attributes['itemGap']}{$unit}; }";
            }
            if ( isset( $attributes['itemGap_tablet'] ) && $attributes['itemGap_tablet'] !== '' ) {
                $unit = $attributes['itemGapUnit'] ?? 'px';
                $tablet_rules[] = "{$selector} { gap: {$attributes['itemGap_tablet']}{$unit}; }";
            }
            if ( isset( $attributes['itemGap_mobile'] ) && $attributes['itemGap_mobile'] !== '' ) {
                $unit = $attributes['itemGapUnit'] ?? 'px';
                $mobile_rules[] = "{$selector} { gap: {$attributes['itemGap_mobile']}{$unit}; }";
            }
        }

        // Custom item width (responsive)
        if ( isset( $attributes['customItemWidth'] ) && $attributes['customItemWidth'] !== '' ) {
            $unit = $attributes['customItemWidthUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action { width: {$attributes['customItemWidth']}{$unit}; flex-basis: {$attributes['customItemWidth']}{$unit}; }";
        }
        if ( isset( $attributes['customItemWidth_tablet'] ) && $attributes['customItemWidth_tablet'] !== '' ) {
            $unit = $attributes['customItemWidthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action { width: {$attributes['customItemWidth_tablet']}{$unit}; flex-basis: {$attributes['customItemWidth_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['customItemWidth_mobile'] ) && $attributes['customItemWidth_mobile'] !== '' ) {
            $unit = $attributes['customItemWidthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action { width: {$attributes['customItemWidth_mobile']}{$unit}; flex-basis: {$attributes['customItemWidth_mobile']}{$unit}; }";
        }

        // Justify content (responsive)
        if ( ! empty( $attributes['itemJustifyContent'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con { justify-content: {$attributes['itemJustifyContent']}; }";
        }
        if ( ! empty( $attributes['itemJustifyContent_tablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-action-con { justify-content: {$attributes['itemJustifyContent_tablet']}; }";
        }
        if ( ! empty( $attributes['itemJustifyContent_mobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-action-con { justify-content: {$attributes['itemJustifyContent_mobile']}; }";
        }

        // ============================================
        // LIST ITEM STYLES
        // ============================================

        // Item padding (responsive)
        if ( ! empty( $attributes['itemPadding'] ) ) {
            $padding = $attributes['itemPadding'];
            if ( is_array( $padding ) && ( ! empty( $padding['top'] ) || ! empty( $padding['right'] ) || ! empty( $padding['bottom'] ) || ! empty( $padding['left'] ) ) ) {
                $unit = $attributes['itemPaddingUnit'] ?? 'px';
                $top = $parse_dimension( $padding['top'] ?? 0 );
                $right = $parse_dimension( $padding['right'] ?? 0 );
                $bottom = $parse_dimension( $padding['bottom'] ?? 0 );
                $left = $parse_dimension( $padding['left'] ?? 0 );
                $css_rules[] = "{$selector} .ts-action-con { padding: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }
        }
        if ( ! empty( $attributes['itemPadding_tablet'] ) ) {
            $padding = $attributes['itemPadding_tablet'];
            if ( is_array( $padding ) ) {
                $unit = $attributes['itemPaddingUnit'] ?? 'px';
                $top = $parse_dimension( $padding['top'] ?? 0 );
                $right = $parse_dimension( $padding['right'] ?? 0 );
                $bottom = $parse_dimension( $padding['bottom'] ?? 0 );
                $left = $parse_dimension( $padding['left'] ?? 0 );
                $tablet_rules[] = "{$selector} .ts-action-con { padding: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }
        }
        if ( ! empty( $attributes['itemPadding_mobile'] ) ) {
            $padding = $attributes['itemPadding_mobile'];
            if ( is_array( $padding ) ) {
                $unit = $attributes['itemPaddingUnit'] ?? 'px';
                $top = $parse_dimension( $padding['top'] ?? 0 );
                $right = $parse_dimension( $padding['right'] ?? 0 );
                $bottom = $parse_dimension( $padding['bottom'] ?? 0 );
                $left = $parse_dimension( $padding['left'] ?? 0 );
                $mobile_rules[] = "{$selector} .ts-action-con { padding: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }
        }

        // Item height (responsive)
        if ( isset( $attributes['itemHeight'] ) && $attributes['itemHeight'] !== '' ) {
            $unit = $attributes['itemHeightUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action-con { min-height: {$attributes['itemHeight']}{$unit}; }";
        }
        if ( isset( $attributes['itemHeight_tablet'] ) && $attributes['itemHeight_tablet'] !== '' ) {
            $unit = $attributes['itemHeightUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action-con { min-height: {$attributes['itemHeight_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['itemHeight_mobile'] ) && $attributes['itemHeight_mobile'] !== '' ) {
            $unit = $attributes['itemHeightUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action-con { min-height: {$attributes['itemHeight_mobile']}{$unit}; }";
        }

        // Border type
        if ( ! empty( $attributes['itemBorderType'] ) && $attributes['itemBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-action-con { border-style: {$attributes['itemBorderType']}; }";

            // Border width
            if ( ! empty( $attributes['itemBorderWidth'] ) && is_array( $attributes['itemBorderWidth'] ) ) {
                $unit = $attributes['itemBorderWidthUnit'] ?? 'px';
                $border_width = $attributes['itemBorderWidth'];
                $top = $parse_dimension( $border_width['top'] ?? 1 );
                $right = $parse_dimension( $border_width['right'] ?? 1 );
                $bottom = $parse_dimension( $border_width['bottom'] ?? 1 );
                $left = $parse_dimension( $border_width['left'] ?? 1 );
                $css_rules[] = "{$selector} .ts-action-con { border-width: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }

            // Border color
            if ( ! empty( $attributes['itemBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-action-con { border-color: {$attributes['itemBorderColor']}; }";
            }
        }

        // Border radius (responsive)
        if ( isset( $attributes['itemBorderRadius'] ) && $attributes['itemBorderRadius'] !== '' ) {
            $unit = $attributes['itemBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action-con { border-radius: {$attributes['itemBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['itemBorderRadius_tablet'] ) && $attributes['itemBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['itemBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action-con { border-radius: {$attributes['itemBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['itemBorderRadius_mobile'] ) && $attributes['itemBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['itemBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action-con { border-radius: {$attributes['itemBorderRadius_mobile']}{$unit}; }";
        }

        // Box shadow
        if ( $has_box_shadow( $attributes['itemBoxShadow'] ?? null ) ) {
            $shadow = $generate_box_shadow( $attributes['itemBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-action-con { box-shadow: {$shadow}; }";
            }
        }

        // Typography
        if ( $has_typography( $attributes['itemTypography'] ?? null ) ) {
            $typo = $generate_typography( $attributes['itemTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-action-con { {$typo}; }";
            }
        }

        // Text color
        if ( ! empty( $attributes['itemTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con { color: {$attributes['itemTextColor']}; }";
        }

        // Background color
        if ( ! empty( $attributes['itemBackgroundColor'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con { background-color: {$attributes['itemBackgroundColor']}; }";
        }

        // Icon on top (flex-direction)
        if ( ! empty( $attributes['iconOnTop'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con { flex-direction: column; }";
        }

        // ============================================
        // ICON CONTAINER STYLES
        // ============================================

        // Icon container background
        if ( ! empty( $attributes['iconContainerBackground'] ) ) {
            $css_rules[] = "{$selector} .ts-action-icon { background-color: {$attributes['iconContainerBackground']}; }";
        }

        // Icon container size (responsive)
        if ( isset( $attributes['iconContainerSize'] ) && $attributes['iconContainerSize'] !== '' ) {
            $unit = $attributes['iconContainerSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action-icon { width: {$attributes['iconContainerSize']}{$unit}; height: {$attributes['iconContainerSize']}{$unit}; min-width: {$attributes['iconContainerSize']}{$unit}; }";
        }
        if ( isset( $attributes['iconContainerSize_tablet'] ) && $attributes['iconContainerSize_tablet'] !== '' ) {
            $unit = $attributes['iconContainerSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action-icon { width: {$attributes['iconContainerSize_tablet']}{$unit}; height: {$attributes['iconContainerSize_tablet']}{$unit}; min-width: {$attributes['iconContainerSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['iconContainerSize_mobile'] ) && $attributes['iconContainerSize_mobile'] !== '' ) {
            $unit = $attributes['iconContainerSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action-icon { width: {$attributes['iconContainerSize_mobile']}{$unit}; height: {$attributes['iconContainerSize_mobile']}{$unit}; min-width: {$attributes['iconContainerSize_mobile']}{$unit}; }";
        }

        // Icon container border type
        if ( ! empty( $attributes['iconContainerBorderType'] ) && $attributes['iconContainerBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-action-icon { border-style: {$attributes['iconContainerBorderType']}; }";

            // Border width
            if ( ! empty( $attributes['iconContainerBorderWidth'] ) && is_array( $attributes['iconContainerBorderWidth'] ) ) {
                $unit = $attributes['iconContainerBorderWidthUnit'] ?? 'px';
                $border_width = $attributes['iconContainerBorderWidth'];
                $top = $parse_dimension( $border_width['top'] ?? 1 );
                $right = $parse_dimension( $border_width['right'] ?? 1 );
                $bottom = $parse_dimension( $border_width['bottom'] ?? 1 );
                $left = $parse_dimension( $border_width['left'] ?? 1 );
                $css_rules[] = "{$selector} .ts-action-icon { border-width: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }

            // Border color
            if ( ! empty( $attributes['iconContainerBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-action-icon { border-color: {$attributes['iconContainerBorderColor']}; }";
            }
        }

        // Icon container border radius (responsive)
        if ( isset( $attributes['iconContainerBorderRadius'] ) && $attributes['iconContainerBorderRadius'] !== '' ) {
            $unit = $attributes['iconContainerBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action-icon { border-radius: {$attributes['iconContainerBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['iconContainerBorderRadius_tablet'] ) && $attributes['iconContainerBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['iconContainerBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action-icon { border-radius: {$attributes['iconContainerBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['iconContainerBorderRadius_mobile'] ) && $attributes['iconContainerBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['iconContainerBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action-icon { border-radius: {$attributes['iconContainerBorderRadius_mobile']}{$unit}; }";
        }

        // Icon container box shadow
        if ( $has_box_shadow( $attributes['iconContainerBoxShadow'] ?? null ) ) {
            $shadow = $generate_box_shadow( $attributes['iconContainerBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-action-icon { box-shadow: {$shadow}; }";
            }
        }

        // Icon/text spacing (responsive)
        if ( isset( $attributes['iconTextSpacing'] ) && $attributes['iconTextSpacing'] !== '' ) {
            $unit = $attributes['iconTextSpacingUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action-con { gap: {$attributes['iconTextSpacing']}{$unit}; }";
        }
        if ( isset( $attributes['iconTextSpacing_tablet'] ) && $attributes['iconTextSpacing_tablet'] !== '' ) {
            $unit = $attributes['iconTextSpacingUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action-con { gap: {$attributes['iconTextSpacing_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['iconTextSpacing_mobile'] ) && $attributes['iconTextSpacing_mobile'] !== '' ) {
            $unit = $attributes['iconTextSpacingUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action-con { gap: {$attributes['iconTextSpacing_mobile']}{$unit}; }";
        }

        // ============================================
        // ICON STYLES
        // ============================================

        // Icon size (responsive)
        if ( isset( $attributes['iconSize'] ) && $attributes['iconSize'] !== '' ) {
            $unit = $attributes['iconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action-icon svg, {$selector} .ts-action-icon i { width: {$attributes['iconSize']}{$unit}; height: {$attributes['iconSize']}{$unit}; font-size: {$attributes['iconSize']}{$unit}; }";
            $css_rules[] = "{$selector} .ts-action-icon { --ts-icon-size: {$attributes['iconSize']}{$unit}; }";
        }
        if ( isset( $attributes['iconSize_tablet'] ) && $attributes['iconSize_tablet'] !== '' ) {
            $unit = $attributes['iconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action-icon svg, {$selector} .ts-action-icon i { width: {$attributes['iconSize_tablet']}{$unit}; height: {$attributes['iconSize_tablet']}{$unit}; font-size: {$attributes['iconSize_tablet']}{$unit}; }";
            $tablet_rules[] = "{$selector} .ts-action-icon { --ts-icon-size: {$attributes['iconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['iconSize_mobile'] ) && $attributes['iconSize_mobile'] !== '' ) {
            $unit = $attributes['iconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action-icon svg, {$selector} .ts-action-icon i { width: {$attributes['iconSize_mobile']}{$unit}; height: {$attributes['iconSize_mobile']}{$unit}; font-size: {$attributes['iconSize_mobile']}{$unit}; }";
            $mobile_rules[] = "{$selector} .ts-action-icon { --ts-icon-size: {$attributes['iconSize_mobile']}{$unit}; }";
        }

        // Icon color
        if ( ! empty( $attributes['iconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-action-icon svg, {$selector} .ts-action-icon i { color: {$attributes['iconColor']}; fill: {$attributes['iconColor']}; }";
            $css_rules[] = "{$selector} .ts-action-icon { --ts-icon-color: {$attributes['iconColor']}; }";
        }

        // ============================================
        // HOVER STATE
        // ============================================

        if ( ! empty( $attributes['itemBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con:hover { border-color: {$attributes['itemBorderColorHover']}; }";
        }

        if ( $has_box_shadow( $attributes['itemBoxShadowHover'] ?? null ) ) {
            $shadow = $generate_box_shadow( $attributes['itemBoxShadowHover'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-action-con:hover { box-shadow: {$shadow}; }";
            }
        }

        if ( ! empty( $attributes['itemBackgroundColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con:hover { background-color: {$attributes['itemBackgroundColorHover']}; }";
        }

        if ( ! empty( $attributes['itemTextColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con:hover { color: {$attributes['itemTextColorHover']}; }";
        }

        if ( ! empty( $attributes['iconContainerBackgroundHover'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con:hover .ts-action-icon { background-color: {$attributes['iconContainerBackgroundHover']}; }";
        }

        if ( ! empty( $attributes['iconContainerBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con:hover .ts-action-icon { border-color: {$attributes['iconContainerBorderColorHover']}; }";
        }

        if ( ! empty( $attributes['iconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con:hover .ts-action-icon svg, {$selector} .ts-action-con:hover .ts-action-icon i { color: {$attributes['iconColorHover']}; fill: {$attributes['iconColorHover']}; }";
            $css_rules[] = "{$selector} .ts-action-con:hover .ts-action-icon { --ts-icon-color: {$attributes['iconColorHover']}; }";
        }

        // ============================================
        // ACTIVE STATE
        // ============================================

        if ( ! empty( $attributes['itemBorderColorActive'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con.active { border-color: {$attributes['itemBorderColorActive']}; }";
        }

        if ( $has_box_shadow( $attributes['itemBoxShadowActive'] ?? null ) ) {
            $shadow = $generate_box_shadow( $attributes['itemBoxShadowActive'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-action-con.active { box-shadow: {$shadow}; }";
            }
        }

        if ( ! empty( $attributes['itemBackgroundColorActive'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con.active { background-color: {$attributes['itemBackgroundColorActive']}; }";
        }

        if ( ! empty( $attributes['itemTextColorActive'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con.active { color: {$attributes['itemTextColorActive']}; }";
        }

        if ( ! empty( $attributes['iconContainerBackgroundActive'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con.active .ts-action-icon { background-color: {$attributes['iconContainerBackgroundActive']}; }";
        }

        if ( ! empty( $attributes['iconContainerBorderColorActive'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con.active .ts-action-icon { border-color: {$attributes['iconContainerBorderColorActive']}; }";
        }

        if ( ! empty( $attributes['iconColorActive'] ) ) {
            $css_rules[] = "{$selector} .ts-action-con.active .ts-action-icon svg, {$selector} .ts-action-con.active .ts-action-icon i { color: {$attributes['iconColorActive']}; fill: {$attributes['iconColorActive']}; }";
            $css_rules[] = "{$selector} .ts-action-con.active .ts-action-icon { --ts-icon-color: {$attributes['iconColorActive']}; }";
        }

        // ============================================
        // TOOLTIP STYLES
        // ============================================

        if ( ! empty( $attributes['tooltipBottom'] ) ) {
            $css_rules[] = "{$selector} .ts-action[data-tooltip]::after { top: auto; bottom: 100%; transform: translateX(-50%); }";
        }

        if ( ! empty( $attributes['tooltipTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-action[data-tooltip]::after { color: {$attributes['tooltipTextColor']}; }";
        }

        if ( $has_typography( $attributes['tooltipTypography'] ?? null ) ) {
            $typo = $generate_typography( $attributes['tooltipTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-action[data-tooltip]::after { {$typo}; }";
            }
        }

        if ( ! empty( $attributes['tooltipBackgroundColor'] ) ) {
            $css_rules[] = "{$selector} .ts-action[data-tooltip]::after { background-color: {$attributes['tooltipBackgroundColor']}; }";
        }

        if ( isset( $attributes['tooltipBorderRadius'] ) && $attributes['tooltipBorderRadius'] !== '' ) {
            $unit = $attributes['tooltipBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-action[data-tooltip]::after { border-radius: {$attributes['tooltipBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['tooltipBorderRadius_tablet'] ) && $attributes['tooltipBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['tooltipBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-action[data-tooltip]::after { border-radius: {$attributes['tooltipBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['tooltipBorderRadius_mobile'] ) && $attributes['tooltipBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['tooltipBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-action[data-tooltip]::after { border-radius: {$attributes['tooltipBorderRadius_mobile']}{$unit}; }";
        }

        // Margin (Deprecated but supported)
        if ( ! empty( $attributes['itemMargin'] ) ) {
            $margin = $attributes['itemMargin'];
            if ( is_array( $margin ) && ( ! empty( $margin['top'] ) || ! empty( $margin['right'] ) || ! empty( $margin['bottom'] ) || ! empty( $margin['left'] ) ) ) {
                $unit = $attributes['itemMarginUnit'] ?? 'px';
                $top = $parse_dimension( $margin['top'] ?? 0 );
                $right = $parse_dimension( $margin['right'] ?? 0 );
                $bottom = $parse_dimension( $margin['bottom'] ?? 0 );
                $left = $parse_dimension( $margin['left'] ?? 0 );
                $css_rules[] = "{$selector} .ts-action { margin: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }
        }
        if ( ! empty( $attributes['itemMargin_tablet'] ) ) {
            $margin = $attributes['itemMargin_tablet'];
            if ( is_array( $margin ) ) {
                $unit = $attributes['itemMarginUnit'] ?? 'px';
                $top = $parse_dimension( $margin['top'] ?? 0 );
                $right = $parse_dimension( $margin['right'] ?? 0 );
                $bottom = $parse_dimension( $margin['bottom'] ?? 0 );
                $left = $parse_dimension( $margin['left'] ?? 0 );
                $tablet_rules[] = "{$selector} .ts-action { margin: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }
        }
        if ( ! empty( $attributes['itemMargin_mobile'] ) ) {
            $margin = $attributes['itemMargin_mobile'];
            if ( is_array( $margin ) ) {
                $unit = $attributes['itemMarginUnit'] ?? 'px';
                $top = $parse_dimension( $margin['top'] ?? 0 );
                $right = $parse_dimension( $margin['right'] ?? 0 );
                $bottom = $parse_dimension( $margin['bottom'] ?? 0 );
                $left = $parse_dimension( $margin['left'] ?? 0 );
                $mobile_rules[] = "{$selector} .ts-action { margin: {$top}{$unit} {$right}{$unit} {$bottom}{$unit} {$left}{$unit}; }";
            }
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================

        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Current Plan block
     *
     * Comprehensive styling for membership plan panels including:
     * - Panel accordion (spacing, border, radius, background, shadow)
     * - Panel head (padding, icon, typography, separator)
     * - Panel pricing (alignment, price/period typography & colors)
     * - Panel body (spacing, gap, typography, links)
     * - Panel buttons (gap)
     * - Secondary button (typography, radius, colors, icons, padding, hover states)
     *
     * Source: current-plan/styles.ts (478 lines)
     * Evidence: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php:L105-L774
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Block identifier
     * @return string Generated CSS
     */
    public static function generate_current_plan_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-current-plan-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // ============================================
        // PANEL ACCORDION
        // ============================================

        // Panel gap (panelsSpacing)
        if ( isset( $attributes['panelsSpacing'] ) && $attributes['panelsSpacing'] !== '' ) {
            $css_rules[] = "{$selector} { display: flex; flex-direction: column; grid-gap: {$attributes['panelsSpacing']}px; }";
        }
        if ( isset( $attributes['panelsSpacing_tablet'] ) && $attributes['panelsSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} { display: flex; flex-direction: column; grid-gap: {$attributes['panelsSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['panelsSpacing_mobile'] ) && $attributes['panelsSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} { display: flex; flex-direction: column; grid-gap: {$attributes['panelsSpacing_mobile']}px; }";
        }

        // Panel border
        if ( ! empty( $attributes['panelBorder'] ) ) {
            $border = $attributes['panelBorder'];
            if ( ! empty( $border['borderType'] ) && $border['borderType'] !== 'none' && $border['borderType'] !== '' ) {
                $css_rules[] = "{$selector} .ts-panel { border-style: {$border['borderType']}; }";

                // Border width
                if ( ! empty( $border['borderWidth'] ) ) {
                    $dims_css = self::generate_dimensions_css( $border['borderWidth'], 'border-width' );
                    if ( $dims_css ) {
                        $css_rules[] = "{$selector} .ts-panel { {$dims_css} }";
                    }
                }

                // Border color
                if ( ! empty( $border['borderColor'] ) ) {
                    $css_rules[] = "{$selector} .ts-panel { border-color: {$border['borderColor']}; }";
                }
            }
        }

        // Panel border radius
        if ( isset( $attributes['panelRadius'] ) && $attributes['panelRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-panel { border-radius: {$attributes['panelRadius']}px; }";
        }
        if ( isset( $attributes['panelRadius_tablet'] ) && $attributes['panelRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-panel { border-radius: {$attributes['panelRadius_tablet']}px; }";
        }
        if ( isset( $attributes['panelRadius_mobile'] ) && $attributes['panelRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-panel { border-radius: {$attributes['panelRadius_mobile']}px; }";
        }

        // Panel background
        if ( ! empty( $attributes['panelBg'] ) ) {
            $css_rules[] = "{$selector} .ts-panel { background-color: {$attributes['panelBg']}; }";
        }

        // Panel box shadow
        if ( ! empty( $attributes['panelShadow'] ) ) {
            $shadow_css = self::generate_box_shadow_css( $attributes['panelShadow'] );
            if ( $shadow_css ) {
                $css_rules[] = "{$selector} .ts-panel { box-shadow: {$shadow_css}; }";
            }
        }

        // ============================================
        // PANEL HEAD
        // ============================================

        // Head padding
        if ( ! empty( $attributes['headPadding'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['headPadding'], 'padding' );
            if ( $padding_css ) {
                $css_rules[] = "{$selector} .ac-head { {$padding_css} }";
            }
        }

        // Head icon size
        if ( isset( $attributes['headIcoSize'] ) && $attributes['headIcoSize'] !== '' ) {
            $css_rules[] = "{$selector} .ac-head > i { font-size: {$attributes['headIcoSize']}px; }";
            $css_rules[] = "{$selector} .ac-head > svg { width: {$attributes['headIcoSize']}px; height: {$attributes['headIcoSize']}px; }";
        }
        if ( isset( $attributes['headIcoSize_tablet'] ) && $attributes['headIcoSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-head > i { font-size: {$attributes['headIcoSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ac-head > svg { width: {$attributes['headIcoSize_tablet']}px; height: {$attributes['headIcoSize_tablet']}px; }";
        }
        if ( isset( $attributes['headIcoSize_mobile'] ) && $attributes['headIcoSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-head > i { font-size: {$attributes['headIcoSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ac-head > svg { width: {$attributes['headIcoSize_mobile']}px; height: {$attributes['headIcoSize_mobile']}px; }";
        }

        // Head icon margin
        if ( isset( $attributes['headIcoMargin'] ) && $attributes['headIcoMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ac-head > i { margin-right: {$attributes['headIcoMargin']}px; }";
            $css_rules[] = "{$selector} .ac-head > svg { margin-right: {$attributes['headIcoMargin']}px; }";
        }
        if ( isset( $attributes['headIcoMargin_tablet'] ) && $attributes['headIcoMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-head > i { margin-right: {$attributes['headIcoMargin_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ac-head > svg { margin-right: {$attributes['headIcoMargin_tablet']}px; }";
        }
        if ( isset( $attributes['headIcoMargin_mobile'] ) && $attributes['headIcoMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-head > i { margin-right: {$attributes['headIcoMargin_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ac-head > svg { margin-right: {$attributes['headIcoMargin_mobile']}px; }";
        }

        // Head icon color
        if ( ! empty( $attributes['headIcoCol'] ) ) {
            $css_rules[] = "{$selector} .ac-head > i { color: {$attributes['headIcoCol']}; }";
            $css_rules[] = "{$selector} .ac-head > svg { fill: {$attributes['headIcoCol']}; }";
        }

        // Head typography
        if ( ! empty( $attributes['headTypo'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['headTypo'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ac-head b { {$typo_css} }";
            }
        }

        // Head text color
        if ( ! empty( $attributes['headTypoCol'] ) ) {
            $css_rules[] = "{$selector} .ac-head b { color: {$attributes['headTypoCol']}; }";
        }

        // Head separator color
        if ( ! empty( $attributes['headBorderCol'] ) ) {
            $css_rules[] = "{$selector} .ac-head { border-bottom-color: {$attributes['headBorderCol']}; }";
        }

        // ============================================
        // PANEL PRICING
        // ============================================

        // Price alignment
        if ( ! empty( $attributes['priceAlign'] ) ) {
            $css_rules[] = "{$selector} .ac-plan-pricing { justify-content: {$attributes['priceAlign']}; }";
        }

        // Price typography
        if ( ! empty( $attributes['priceTypo'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['priceTypo'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ac-plan-price { {$typo_css} }";
            }
        }

        // Price color
        if ( ! empty( $attributes['priceCol'] ) ) {
            $css_rules[] = "{$selector} .ac-plan-price { color: {$attributes['priceCol']}; }";
        }

        // Period typography
        if ( ! empty( $attributes['periodTypo'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['periodTypo'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ac-price-period { {$typo_css} }";
            }
        }

        // Period color
        if ( ! empty( $attributes['periodCol'] ) ) {
            $css_rules[] = "{$selector} .ac-price-period { color: {$attributes['periodCol']}; }";
        }

        // ============================================
        // PANEL BODY
        // ============================================

        // Body spacing (padding)
        if ( isset( $attributes['panelSpacing'] ) && $attributes['panelSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ac-body { padding: {$attributes['panelSpacing']}px; }";
        }
        if ( isset( $attributes['panelSpacing_tablet'] ) && $attributes['panelSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-body { padding: {$attributes['panelSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['panelSpacing_mobile'] ) && $attributes['panelSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-body { padding: {$attributes['panelSpacing_mobile']}px; }";
        }

        // Body content gap
        if ( isset( $attributes['panelGap'] ) && $attributes['panelGap'] !== '' ) {
            $css_rules[] = "{$selector} .ac-body { display: flex; flex-direction: column; grid-gap: {$attributes['panelGap']}px; }";
        }
        if ( isset( $attributes['panelGap_tablet'] ) && $attributes['panelGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-body { display: flex; flex-direction: column; grid-gap: {$attributes['panelGap_tablet']}px; }";
        }
        if ( isset( $attributes['panelGap_mobile'] ) && $attributes['panelGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-body { display: flex; flex-direction: column; grid-gap: {$attributes['panelGap_mobile']}px; }";
        }

        // Body text alignment
        if ( ! empty( $attributes['textAlign'] ) ) {
            $css_rules[] = "{$selector} .ac-body { text-align: {$attributes['textAlign']}; }";
        }

        // Body typography
        if ( ! empty( $attributes['bodyTypo'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['bodyTypo'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ac-body p { {$typo_css} }";
            }
        }

        // Body text color
        if ( ! empty( $attributes['bodyTypoCol'] ) ) {
            $css_rules[] = "{$selector} .ac-body p { color: {$attributes['bodyTypoCol']}; }";
        }

        // Body link typography
        if ( ! empty( $attributes['bodyTypoLink'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['bodyTypoLink'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ac-body a { {$typo_css} }";
            }
        }

        // Body link color
        if ( ! empty( $attributes['bodyColLink'] ) ) {
            $css_rules[] = "{$selector} .ac-body a { color: {$attributes['bodyColLink']}; }";
        }

        // ============================================
        // PANEL BUTTONS
        // ============================================

        // Panel buttons gap
        if ( isset( $attributes['panelButtonsGap'] ) && $attributes['panelButtonsGap'] !== '' ) {
            $css_rules[] = "{$selector} .ac-bottom ul { grid-gap: {$attributes['panelButtonsGap']}px; }";
        }
        if ( isset( $attributes['panelButtonsGap_tablet'] ) && $attributes['panelButtonsGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-bottom ul { grid-gap: {$attributes['panelButtonsGap_tablet']}px; }";
        }
        if ( isset( $attributes['panelButtonsGap_mobile'] ) && $attributes['panelButtonsGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-bottom ul { grid-gap: {$attributes['panelButtonsGap_mobile']}px; }";
        }

        // ============================================
        // SECONDARY BUTTON - NORMAL STATE
        // ============================================

        // Button typography
        if ( ! empty( $attributes['scndBtnTypo'] ) ) {
            $typo_css = self::generate_typography_css( $attributes['scndBtnTypo'] );
            if ( $typo_css ) {
                $css_rules[] = "{$selector} .ts-btn-1 { {$typo_css} }";
            }
        }

        // Button border radius
        if ( isset( $attributes['scndBtnRadius'] ) && $attributes['scndBtnRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 { border-radius: {$attributes['scndBtnRadius']}px; }";
        }
        if ( isset( $attributes['scndBtnRadius_tablet'] ) && $attributes['scndBtnRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 { border-radius: {$attributes['scndBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnRadius_mobile'] ) && $attributes['scndBtnRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 { border-radius: {$attributes['scndBtnRadius_mobile']}px; }";
        }

        // Button text color
        if ( ! empty( $attributes['scndBtnC'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1 { color: {$attributes['scndBtnC']}; }";
        }

        // Button padding
        if ( ! empty( $attributes['scndBtnPadding'] ) ) {
            $padding_css = self::generate_dimensions_css( $attributes['scndBtnPadding'], 'padding' );
            if ( $padding_css ) {
                $css_rules[] = "{$selector} .ts-btn-1 { {$padding_css} }";
            }
        }

        // Button height
        if ( isset( $attributes['scndBtnHeight'] ) && $attributes['scndBtnHeight'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 { min-height: {$attributes['scndBtnHeight']}px; }";
        }
        if ( isset( $attributes['scndBtnHeight_tablet'] ) && $attributes['scndBtnHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 { min-height: {$attributes['scndBtnHeight_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnHeight_mobile'] ) && $attributes['scndBtnHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 { min-height: {$attributes['scndBtnHeight_mobile']}px; }";
        }

        // Button background
        if ( ! empty( $attributes['scndBtnBg'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1 { background-color: {$attributes['scndBtnBg']}; }";
        }

        // Button border
        if ( ! empty( $attributes['scndBtnBorder'] ) ) {
            $border = $attributes['scndBtnBorder'];
            if ( ! empty( $border['borderType'] ) && $border['borderType'] !== 'none' && $border['borderType'] !== '' ) {
                $css_rules[] = "{$selector} .ts-btn-1 { border-style: {$border['borderType']}; }";

                if ( ! empty( $border['borderWidth'] ) ) {
                    $dims_css = self::generate_dimensions_css( $border['borderWidth'], 'border-width' );
                    if ( $dims_css ) {
                        $css_rules[] = "{$selector} .ts-btn-1 { {$dims_css} }";
                    }
                }

                if ( ! empty( $border['borderColor'] ) ) {
                    $css_rules[] = "{$selector} .ts-btn-1 { border-color: {$border['borderColor']}; }";
                }
            }
        }

        // Button icon size
        if ( isset( $attributes['scndBtnIconSize'] ) && $attributes['scndBtnIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 i { font-size: {$attributes['scndBtnIconSize']}px; }";
            $css_rules[] = "{$selector} .ts-btn-1 svg { width: {$attributes['scndBtnIconSize']}px; height: {$attributes['scndBtnIconSize']}px; }";
        }
        if ( isset( $attributes['scndBtnIconSize_tablet'] ) && $attributes['scndBtnIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 i { font-size: {$attributes['scndBtnIconSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-btn-1 svg { width: {$attributes['scndBtnIconSize_tablet']}px; height: {$attributes['scndBtnIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnIconSize_mobile'] ) && $attributes['scndBtnIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 i { font-size: {$attributes['scndBtnIconSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-btn-1 svg { width: {$attributes['scndBtnIconSize_mobile']}px; height: {$attributes['scndBtnIconSize_mobile']}px; }";
        }

        // Button icon spacing
        if ( isset( $attributes['scndBtnIconPad'] ) && $attributes['scndBtnIconPad'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 { grid-gap: {$attributes['scndBtnIconPad']}px; }";
        }
        if ( isset( $attributes['scndBtnIconPad_tablet'] ) && $attributes['scndBtnIconPad_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 { grid-gap: {$attributes['scndBtnIconPad_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnIconPad_mobile'] ) && $attributes['scndBtnIconPad_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 { grid-gap: {$attributes['scndBtnIconPad_mobile']}px; }";
        }

        // Button icon color
        if ( ! empty( $attributes['scndBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1 i { color: {$attributes['scndBtnIconColor']}; }";
            $css_rules[] = "{$selector} .ts-btn-1 svg { fill: {$attributes['scndBtnIconColor']}; }";
        }

        // ============================================
        // SECONDARY BUTTON - HOVER STATE
        // ============================================

        // Button text color (hover)
        if ( ! empty( $attributes['scndBtnCH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover { color: {$attributes['scndBtnCH']}; }";
        }

        // Button background (hover)
        if ( ! empty( $attributes['scndBtnBgH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover { background-color: {$attributes['scndBtnBgH']}; }";
        }

        // Button border color (hover)
        if ( ! empty( $attributes['scndBtnBorderH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover { border-color: {$attributes['scndBtnBorderH']}; }";
        }

        // Button icon color (hover)
        if ( ! empty( $attributes['scndBtnIconColorH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover i { color: {$attributes['scndBtnIconColorH']}; }";
            $css_rules[] = "{$selector} .ts-btn-1:hover svg { fill: {$attributes['scndBtnIconColorH']}; }";
        }

        // ============================================
        // COMBINE ALL RULES
        // ============================================

        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Product Price block
     *
     * Simple responsive CSS variables for price colors and strikethrough styling.
     * Desktop styles are applied via inline CSS variables in the block's edit.tsx.
     * This method only handles tablet and mobile responsive overrides.
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Block identifier
     * @return string Generated CSS
     */
    public static function generate_product_price_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.vxfse-product-price-' . $block_id;
        $tablet_rules = [];
        $mobile_rules = [];

        // ============================================
        // TABLET BREAKPOINT (@media max-width: 1024px)
        // ============================================

        // Price color (tablet)
        if ( ! empty( $attributes['priceColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} { --vx-price-color: {$attributes['priceColor_tablet']}; }";
        }

        // Strikethrough text color (tablet)
        if ( ! empty( $attributes['strikethroughTextColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} { --vx-strike-text-color: {$attributes['strikethroughTextColor_tablet']}; }";
        }

        // Strikethrough line color (tablet)
        if ( ! empty( $attributes['strikethroughLineColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} { --vx-strike-line-color: {$attributes['strikethroughLineColor_tablet']}; }";
        }

        // Strikethrough width (tablet)
        if ( isset( $attributes['strikethroughWidth_tablet'] ) && $attributes['strikethroughWidth_tablet'] !== '' ) {
            $unit = $attributes['strikethroughWidthUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} { --vx-strike-width: {$attributes['strikethroughWidth_tablet']}{$unit}; }";
        }

        // Out of stock color (tablet)
        if ( ! empty( $attributes['outOfStockColor_tablet'] ) ) {
            $tablet_rules[] = "{$selector} { --vx-nostock-color: {$attributes['outOfStockColor_tablet']}; }";
        }

        // ============================================
        // MOBILE BREAKPOINT (@media max-width: 767px)
        // ============================================

        // Price color (mobile)
        if ( ! empty( $attributes['priceColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} { --vx-price-color: {$attributes['priceColor_mobile']}; }";
        }

        // Strikethrough text color (mobile)
        if ( ! empty( $attributes['strikethroughTextColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} { --vx-strike-text-color: {$attributes['strikethroughTextColor_mobile']}; }";
        }

        // Strikethrough line color (mobile)
        if ( ! empty( $attributes['strikethroughLineColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} { --vx-strike-line-color: {$attributes['strikethroughLineColor_mobile']}; }";
        }

        // Strikethrough width (mobile)
        if ( isset( $attributes['strikethroughWidth_mobile'] ) && $attributes['strikethroughWidth_mobile'] !== '' ) {
            $unit = $attributes['strikethroughWidthUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} { --vx-strike-width: {$attributes['strikethroughWidth_mobile']}{$unit}; }";
        }

        // Out of stock color (mobile)
        if ( ! empty( $attributes['outOfStockColor_mobile'] ) ) {
            $mobile_rules[] = "{$selector} { --vx-nostock-color: {$attributes['outOfStockColor_mobile']}; }";
        }

        // ============================================
        // COMBINE CSS WITH MEDIA QUERIES
        // ============================================

        $final_css = '';
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Current Role block
     *
     * Similar to Current Plan but simpler - for role/membership display.
     * Includes: panel accordion, panel head, panel body, panel buttons, secondary button.
     *
     * Source: current-role/styles.ts (417 lines)
     * Evidence: themes/voxel/app/widgets/current-role.php
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Block identifier
     * @return string Generated CSS
     */
    public static function generate_current_role_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-current-role-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // Panel border (using BorderGroupControl format)
        if ( ! empty( $attributes['panelBorder'] ) ) {
            $border = $attributes['panelBorder'];
            if ( ! empty( $border['borderType'] ) && $border['borderType'] !== 'none' && $border['borderType'] !== '' ) {
                $css_rules[] = "{$selector} .ts-panel { border-style: {$border['borderType']}; }";
                if ( ! empty( $border['borderWidth'] ) ) {
                    $dims_css = self::generate_dimensions_css( $border['borderWidth'], 'border-width' );
                    if ( $dims_css ) $css_rules[] = "{$selector} .ts-panel { {$dims_css} }";
                }
                if ( ! empty( $border['borderColor'] ) ) {
                    $css_rules[] = "{$selector} .ts-panel { border-color: {$border['borderColor']}; }";
                }
            }
        }

        // Panel radius
        if ( isset( $attributes['panelRadius'] ) && $attributes['panelRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-panel { border-radius: {$attributes['panelRadius']}px; }";
        }
        if ( isset( $attributes['panelRadius_tablet'] ) && $attributes['panelRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-panel { border-radius: {$attributes['panelRadius_tablet']}px; }";
        }
        if ( isset( $attributes['panelRadius_mobile'] ) && $attributes['panelRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-panel { border-radius: {$attributes['panelRadius_mobile']}px; }";
        }

        // Panel background & shadow
        if ( ! empty( $attributes['panelBg'] ) ) {
            $css_rules[] = "{$selector} .ts-panel { background-color: {$attributes['panelBg']}; }";
        }
        if ( ! empty( $attributes['panelShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['panelShadow'] );
            if ( $shadow ) $css_rules[] = "{$selector} .ts-panel { box-shadow: {$shadow}; }";
        }

        // Head padding
        if ( ! empty( $attributes['headPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['headPadding'], 'padding' );
            if ( $padding ) $css_rules[] = "{$selector} .ac-head { {$padding} }";
        }

        // Head icon size & margin
        if ( isset( $attributes['headIcoSize'] ) && $attributes['headIcoSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-panel .ac-head i { font-size: {$attributes['headIcoSize']}px; }";
            $css_rules[] = "{$selector} .ts-panel .ac-head svg { width: {$attributes['headIcoSize']}px; height: {$attributes['headIcoSize']}px; }";
        }
        if ( isset( $attributes['headIcoSize_tablet'] ) && $attributes['headIcoSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-panel .ac-head i { font-size: {$attributes['headIcoSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-panel .ac-head svg { width: {$attributes['headIcoSize_tablet']}px; height: {$attributes['headIcoSize_tablet']}px; }";
        }
        if ( isset( $attributes['headIcoSize_mobile'] ) && $attributes['headIcoSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-panel .ac-head i { font-size: {$attributes['headIcoSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-panel .ac-head svg { width: {$attributes['headIcoSize_mobile']}px; height: {$attributes['headIcoSize_mobile']}px; }";
        }
        if ( isset( $attributes['headIcoMargin'] ) && $attributes['headIcoMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ts-panel .ac-head i { margin-right: {$attributes['headIcoMargin']}px; }";
            $css_rules[] = "{$selector} .ts-panel .ac-head svg { margin-right: {$attributes['headIcoMargin']}px; }";
        }
        if ( isset( $attributes['headIcoMargin_tablet'] ) && $attributes['headIcoMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-panel .ac-head i { margin-right: {$attributes['headIcoMargin_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-panel .ac-head svg { margin-right: {$attributes['headIcoMargin_tablet']}px; }";
        }
        if ( isset( $attributes['headIcoMargin_mobile'] ) && $attributes['headIcoMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-panel .ac-head i { margin-right: {$attributes['headIcoMargin_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-panel .ac-head svg { margin-right: {$attributes['headIcoMargin_mobile']}px; }";
        }

        // Head icon color & typography
        if ( ! empty( $attributes['headIcoCol'] ) ) {
            $css_rules[] = "{$selector} .ts-panel .ac-head i { color: {$attributes['headIcoCol']}; }";
            $css_rules[] = "{$selector} .ts-panel .ac-head svg { fill: {$attributes['headIcoCol']}; }";
        }
        if ( ! empty( $attributes['headTypo'] ) ) {
            $typo = self::generate_typography_css( $attributes['headTypo'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-panel .ac-head b { {$typo} }";
        }
        if ( ! empty( $attributes['headTypoCol'] ) ) {
            $css_rules[] = "{$selector} .ts-panel .ac-head b { color: {$attributes['headTypoCol']}; }";
        }
        if ( ! empty( $attributes['headBorderCol'] ) ) {
            $css_rules[] = "{$selector} .ts-panel .ac-head { border-color: {$attributes['headBorderCol']}; }";
        }

        // Body spacing & gap
        if ( isset( $attributes['panelSpacing'] ) && $attributes['panelSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ac-body { padding: {$attributes['panelSpacing']}px; }";
        }
        if ( isset( $attributes['panelSpacing_tablet'] ) && $attributes['panelSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-body { padding: {$attributes['panelSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['panelSpacing_mobile'] ) && $attributes['panelSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-body { padding: {$attributes['panelSpacing_mobile']}px; }";
        }
        if ( isset( $attributes['panelGap'] ) && $attributes['panelGap'] !== '' ) {
            $css_rules[] = "{$selector} .ac-body { display: flex; flex-direction: column; grid-gap: {$attributes['panelGap']}px; }";
        }
        if ( isset( $attributes['panelGap_tablet'] ) && $attributes['panelGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ac-body { display: flex; flex-direction: column; grid-gap: {$attributes['panelGap_tablet']}px; }";
        }
        if ( isset( $attributes['panelGap_mobile'] ) && $attributes['panelGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ac-body { display: flex; flex-direction: column; grid-gap: {$attributes['panelGap_mobile']}px; }";
        }

        // Body typography
        if ( ! empty( $attributes['textAlign'] ) ) {
            $css_rules[] = "{$selector} .ac-body { text-align: {$attributes['textAlign']}; }";
        }
        if ( ! empty( $attributes['bodyTypo'] ) ) {
            $typo = self::generate_typography_css( $attributes['bodyTypo'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-panel .ac-body p { {$typo} }";
        }
        if ( ! empty( $attributes['bodyTypoCol'] ) ) {
            $css_rules[] = "{$selector} .ts-panel .ac-body p { color: {$attributes['bodyTypoCol']}; }";
        }

        // Panel buttons gap
        if ( isset( $attributes['panelButtonsGap'] ) && $attributes['panelButtonsGap'] !== '' ) {
            $css_rules[] = "{$selector} .current-plan-btn { grid-gap: {$attributes['panelButtonsGap']}px; }";
        }
        if ( isset( $attributes['panelButtonsGap_tablet'] ) && $attributes['panelButtonsGap_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .current-plan-btn { grid-gap: {$attributes['panelButtonsGap_tablet']}px; }";
        }
        if ( isset( $attributes['panelButtonsGap_mobile'] ) && $attributes['panelButtonsGap_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .current-plan-btn { grid-gap: {$attributes['panelButtonsGap_mobile']}px; }";
        }

        // Secondary button - normal
        if ( ! empty( $attributes['scndBtnTypo'] ) ) {
            $typo = self::generate_typography_css( $attributes['scndBtnTypo'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-btn-1 { {$typo} }";
        }
        if ( isset( $attributes['scndBtnRadius'] ) && $attributes['scndBtnRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 { border-radius: {$attributes['scndBtnRadius']}px; }";
        }
        if ( isset( $attributes['scndBtnRadius_tablet'] ) && $attributes['scndBtnRadius_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 { border-radius: {$attributes['scndBtnRadius_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnRadius_mobile'] ) && $attributes['scndBtnRadius_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 { border-radius: {$attributes['scndBtnRadius_mobile']}px; }";
        }
        if ( ! empty( $attributes['scndBtnC'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1 { color: {$attributes['scndBtnC']}; }";
        }
        if ( ! empty( $attributes['scndBtnPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['scndBtnPadding'], 'padding' );
            if ( $padding ) $css_rules[] = "{$selector} .ts-btn-1 { {$padding} }";
        }
        if ( isset( $attributes['scndBtnHeight'] ) && $attributes['scndBtnHeight'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 { height: {$attributes['scndBtnHeight']}px; }";
        }
        if ( isset( $attributes['scndBtnHeight_tablet'] ) && $attributes['scndBtnHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 { height: {$attributes['scndBtnHeight_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnHeight_mobile'] ) && $attributes['scndBtnHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 { height: {$attributes['scndBtnHeight_mobile']}px; }";
        }
        if ( ! empty( $attributes['scndBtnBg'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1 { background: {$attributes['scndBtnBg']}; }";
        }

        // Secondary button border
        if ( ! empty( $attributes['scndBtnBorder'] ) ) {
            $border = $attributes['scndBtnBorder'];
            if ( ! empty( $border['borderType'] ) && $border['borderType'] !== 'none' && $border['borderType'] !== '' ) {
                $css_rules[] = "{$selector} .ts-btn-1 { border-style: {$border['borderType']}; }";
                if ( ! empty( $border['borderWidth'] ) ) {
                    $dims_css = self::generate_dimensions_css( $border['borderWidth'], 'border-width' );
                    if ( $dims_css ) $css_rules[] = "{$selector} .ts-btn-1 { {$dims_css} }";
                }
                if ( ! empty( $border['borderColor'] ) ) {
                    $css_rules[] = "{$selector} .ts-btn-1 { border-color: {$border['borderColor']}; }";
                }
            }
        }

        // Secondary button icon
        if ( isset( $attributes['scndBtnIconSize'] ) && $attributes['scndBtnIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 i { font-size: {$attributes['scndBtnIconSize']}px; }";
            $css_rules[] = "{$selector} .ts-btn-1 svg { width: {$attributes['scndBtnIconSize']}px; height: {$attributes['scndBtnIconSize']}px; }";
        }
        if ( isset( $attributes['scndBtnIconSize_tablet'] ) && $attributes['scndBtnIconSize_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 i { font-size: {$attributes['scndBtnIconSize_tablet']}px; }";
            $tablet_rules[] = "{$selector} .ts-btn-1 svg { width: {$attributes['scndBtnIconSize_tablet']}px; height: {$attributes['scndBtnIconSize_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnIconSize_mobile'] ) && $attributes['scndBtnIconSize_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 i { font-size: {$attributes['scndBtnIconSize_mobile']}px; }";
            $mobile_rules[] = "{$selector} .ts-btn-1 svg { width: {$attributes['scndBtnIconSize_mobile']}px; height: {$attributes['scndBtnIconSize_mobile']}px; }";
        }
        if ( isset( $attributes['scndBtnIconPad'] ) && $attributes['scndBtnIconPad'] !== '' ) {
            $css_rules[] = "{$selector} .ts-btn-1 { grid-gap: {$attributes['scndBtnIconPad']}px; }";
        }
        if ( isset( $attributes['scndBtnIconPad_tablet'] ) && $attributes['scndBtnIconPad_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-btn-1 { grid-gap: {$attributes['scndBtnIconPad_tablet']}px; }";
        }
        if ( isset( $attributes['scndBtnIconPad_mobile'] ) && $attributes['scndBtnIconPad_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-btn-1 { grid-gap: {$attributes['scndBtnIconPad_mobile']}px; }";
        }
        if ( ! empty( $attributes['scndBtnIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1 i { color: {$attributes['scndBtnIconColor']}; }";
            $css_rules[] = "{$selector} .ts-btn-1 svg { fill: {$attributes['scndBtnIconColor']}; }";
        }

        // Secondary button - hover states
        if ( ! empty( $attributes['scndBtnCH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover { color: {$attributes['scndBtnCH']}; }";
        }
        if ( ! empty( $attributes['scndBtnBgH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover { background: {$attributes['scndBtnBgH']}; }";
        }
        if ( ! empty( $attributes['scndBtnBorderH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover { border-color: {$attributes['scndBtnBorderH']}; }";
        }
        if ( ! empty( $attributes['scndBtnIconColorH'] ) ) {
            $css_rules[] = "{$selector} .ts-btn-1:hover i { color: {$attributes['scndBtnIconColorH']}; }";
            $css_rules[] = "{$selector} .ts-btn-1:hover svg { fill: {$attributes['scndBtnIconColorH']}; }";
        }

        // Combine CSS
        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }

    /**
     * Generate CSS for Work Hours block
     *
     * Source: work-hours/styles.ts (493 lines)
     *
     * @param array  $attributes Block attributes
     * @param string $block_id   Block identifier
     * @return string Generated CSS
     */
    public static function generate_work_hours_css( $attributes, $block_id ) {
        if ( empty( $block_id ) ) {
            return '';
        }

        $selector = '.voxel-fse-work-hours-' . $block_id;
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // Border
        if ( ! empty( $attributes['borderType'] ) && $attributes['borderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-work-hours { border-style: {$attributes['borderType']}; }";
            if ( ! empty( $attributes['borderWidth'] ) ) {
                $dims_css = self::generate_dimensions_css( $attributes['borderWidth'], 'border-width' );
                if ( $dims_css ) $css_rules[] = "{$selector} .ts-work-hours { {$dims_css} }";
            }
            if ( ! empty( $attributes['borderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-work-hours { border-color: {$attributes['borderColor']}; }";
            }
        }

        // Border radius (responsive)
        if ( isset( $attributes['borderRadius'] ) && $attributes['borderRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-work-hours { border-radius: {$attributes['borderRadius']}px; }";
        }
        if ( isset( $attributes['borderRadiusTablet'] ) && $attributes['borderRadiusTablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-work-hours { border-radius: {$attributes['borderRadiusTablet']}px; }";
        }
        if ( isset( $attributes['borderRadiusMobile'] ) && $attributes['borderRadiusMobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-work-hours { border-radius: {$attributes['borderRadiusMobile']}px; }";
        }

        // Box shadow
        if ( ! empty( $attributes['boxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['boxShadow'] );
            if ( $shadow ) $css_rules[] = "{$selector} .ts-work-hours { box-shadow: {$shadow}; }";
        }

        // Top area - background (responsive)
        if ( ! empty( $attributes['topBg'] ) ) {
            $css_rules[] = "{$selector} .ts-hours-today { background-color: {$attributes['topBg']}; }";
        }
        if ( ! empty( $attributes['topBgTablet'] ) ) {
            $tablet_rules[] = "{$selector} .ts-hours-today { background-color: {$attributes['topBgTablet']}; }";
        }
        if ( ! empty( $attributes['topBgMobile'] ) ) {
            $mobile_rules[] = "{$selector} .ts-hours-today { background-color: {$attributes['topBgMobile']}; }";
        }

        // Top area - icon size (responsive)
        $unit = $attributes['topIconSizeUnit'] ?? 'px';
        if ( isset( $attributes['topIconSize'] ) && $attributes['topIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-open-status i { font-size: {$attributes['topIconSize']}{$unit}; }";
            $css_rules[] = "{$selector} .ts-open-status svg { width: {$attributes['topIconSize']}{$unit}; height: {$attributes['topIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['topIconSizeTablet'] ) && $attributes['topIconSizeTablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-open-status i { font-size: {$attributes['topIconSizeTablet']}{$unit}; }";
            $tablet_rules[] = "{$selector} .ts-open-status svg { width: {$attributes['topIconSizeTablet']}{$unit}; height: {$attributes['topIconSizeTablet']}{$unit}; }";
        }
        if ( isset( $attributes['topIconSizeMobile'] ) && $attributes['topIconSizeMobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-open-status i { font-size: {$attributes['topIconSizeMobile']}{$unit}; }";
            $mobile_rules[] = "{$selector} .ts-open-status svg { width: {$attributes['topIconSizeMobile']}{$unit}; height: {$attributes['topIconSizeMobile']}{$unit}; }";
        }

        // Typography & colors
        if ( ! empty( $attributes['labelTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['labelTypography'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-open-status p { {$typo} }";
        }
        if ( ! empty( $attributes['labelColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status p { color: {$attributes['labelColor']}; }";
        }
        if ( ! empty( $attributes['currentHoursTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['currentHoursTypography'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-hours-today .ts-current-period { {$typo} }";
        }
        if ( ! empty( $attributes['currentHoursColor'] ) ) {
            $css_rules[] = "{$selector} .ts-hours-today .ts-current-period { color: {$attributes['currentHoursColor']}; }";
        }

        // Body
        if ( ! empty( $attributes['bodyBg'] ) ) {
            $css_rules[] = "{$selector} .ts-work-hours-list ul { background-color: {$attributes['bodyBg']}; }";
        }
        if ( ! empty( $attributes['bodySeparatorColor'] ) ) {
            $css_rules[] = "{$selector} .ts-work-hours-list li { border-color: {$attributes['bodySeparatorColor']}; }";
        }
        if ( ! empty( $attributes['dayTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['dayTypography'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-work-hours-list li p { {$typo} }";
        }
        if ( ! empty( $attributes['dayColor'] ) ) {
            $css_rules[] = "{$selector} .ts-work-hours-list li p { color: {$attributes['dayColor']}; }";
        }
        if ( ! empty( $attributes['hoursTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['hoursTypography'] );
            if ( $typo ) $css_rules[] = "{$selector} .ts-work-hours-list li small { {$typo} }";
        }
        if ( ! empty( $attributes['hoursColor'] ) ) {
            $css_rules[] = "{$selector} .ts-work-hours-list li small { color: {$attributes['hoursColor']}; }";
        }

        // State-specific colors
        if ( ! empty( $attributes['openIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.open i { color: {$attributes['openIconColor']}; }";
            $css_rules[] = "{$selector} .ts-open-status.open svg { fill: {$attributes['openIconColor']}; }";
        }
        if ( ! empty( $attributes['openTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.open p { color: {$attributes['openTextColor']}; }";
        }
        if ( ! empty( $attributes['closedIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.closed i { color: {$attributes['closedIconColor']}; }";
            $css_rules[] = "{$selector} .ts-open-status.closed svg { fill: {$attributes['closedIconColor']}; }";
        }
        if ( ! empty( $attributes['closedTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.closed p { color: {$attributes['closedTextColor']}; }";
        }
        if ( ! empty( $attributes['appointmentIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.appt-only i { color: {$attributes['appointmentIconColor']}; }";
            $css_rules[] = "{$selector} .ts-open-status.appt-only svg { fill: {$attributes['appointmentIconColor']}; }";
        }
        if ( ! empty( $attributes['appointmentTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.appt-only p { color: {$attributes['appointmentTextColor']}; }";
        }
        if ( ! empty( $attributes['notAvailableIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.not-available i { color: {$attributes['notAvailableIconColor']}; }";
            $css_rules[] = "{$selector} .ts-open-status.not-available svg { fill: {$attributes['notAvailableIconColor']}; }";
        }
        if ( ! empty( $attributes['notAvailableTextColor'] ) ) {
            $css_rules[] = "{$selector} .ts-open-status.not-available p { color: {$attributes['notAvailableTextColor']}; }";
        }

        // Accordion button
        if ( isset( $attributes['accordionButtonSize'] ) && $attributes['accordionButtonSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller { width: {$attributes['accordionButtonSize']}px; height: {$attributes['accordionButtonSize']}px; }";
        }
        if ( ! empty( $attributes['accordionButtonColor'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller i { color: {$attributes['accordionButtonColor']}; }";
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller svg { fill: {$attributes['accordionButtonColor']}; }";
        }
        if ( isset( $attributes['accordionButtonIconSize'] ) && $attributes['accordionButtonIconSize'] !== '' ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller i { font-size: {$attributes['accordionButtonIconSize']}px; }";
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller svg { width: {$attributes['accordionButtonIconSize']}px; height: {$attributes['accordionButtonIconSize']}px; }";
        }
        if ( ! empty( $attributes['accordionButtonBg'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller { background-color: {$attributes['accordionButtonBg']}; }";
        }
        if ( ! empty( $attributes['accordionButtonBorderType'] ) && $attributes['accordionButtonBorderType'] !== 'none' ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller { border-style: {$attributes['accordionButtonBorderType']}; }";
            if ( ! empty( $attributes['accordionButtonBorderWidth'] ) ) {
                $dims_css = self::generate_dimensions_css( $attributes['accordionButtonBorderWidth'], 'border-width' );
                if ( $dims_css ) $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller { {$dims_css} }";
            }
            if ( ! empty( $attributes['accordionButtonBorderColor'] ) ) {
                $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller { border-color: {$attributes['accordionButtonBorderColor']}; }";
            }
        }
        if ( isset( $attributes['accordionButtonBorderRadius'] ) && $attributes['accordionButtonBorderRadius'] !== '' ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller { border-radius: {$attributes['accordionButtonBorderRadius']}px; }";
        }

        // Accordion button - hover
        if ( ! empty( $attributes['accordionButtonColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller:hover i { color: {$attributes['accordionButtonColorHover']}; }";
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller:hover svg { fill: {$attributes['accordionButtonColorHover']}; }";
        }
        if ( ! empty( $attributes['accordionButtonBgHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller:hover { background-color: {$attributes['accordionButtonBgHover']}; }";
        }
        if ( ! empty( $attributes['accordionButtonBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-icon-btn.ts-smaller:hover { border-color: {$attributes['accordionButtonBorderColorHover']}; }";
        }

        // Combine CSS
        $final_css = '';
        if ( ! empty( $css_rules ) ) {
            $final_css .= implode( "\n", $css_rules );
        }
        if ( ! empty( $tablet_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::TABLET_BREAKPOINT . "px) {\n" . implode( "\n", $tablet_rules ) . "\n}";
        }
        if ( ! empty( $mobile_rules ) ) {
            $final_css .= "\n@media (max-width: " . self::MOBILE_BREAKPOINT . "px) {\n" . implode( "\n", $mobile_rules ) . "\n}";
        }

        return $final_css;
    }
}
