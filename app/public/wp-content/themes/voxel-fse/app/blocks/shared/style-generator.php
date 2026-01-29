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
     * @param array  $attributes Block attributes.
     * @param string $block_id   Block unique ID.
     * @return array {
     *     @type string $inline_styles  Inline style attribute value.
     *     @type string $responsive_css CSS with media queries.
     *     @type array  $classes        Additional CSS classes.
     *     @type array  $custom_attrs   Custom HTML attributes.
     *     @type string $element_id     Element ID (HTML id attribute).
     * }
     */
    public static function generate_all( $attributes, $block_id ) {
        $selector = '.voxel-fse-block-' . $block_id;

        // Generate inline styles (desktop)
        $inline_styles = array_merge(
            self::generate_voxel_inline_styles( $attributes ),
            self::generate_advanced_inline_styles( $attributes )
        );

        // Generate responsive CSS
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
            'inline_styles'  => self::array_to_style_string( $inline_styles ),
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
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $styles['border-top-left-radius']     = $br['top'] . $unit;
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $styles['border-top-right-radius']    = $br['right'] . $unit;
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $styles['border-bottom-right-radius'] = $br['bottom'] . $unit;
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $styles['border-bottom-left-radius']  = $br['left'] . $unit;
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
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $tablet_styles[] = "border-top-left-radius: {$br['top']}{$unit}";
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $tablet_styles[] = "border-top-right-radius: {$br['right']}{$unit}";
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $tablet_styles[] = "border-bottom-right-radius: {$br['bottom']}{$unit}";
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $tablet_styles[] = "border-bottom-left-radius: {$br['left']}{$unit}";
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
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $mobile_styles[] = "border-top-left-radius: {$br['top']}{$unit}";
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $mobile_styles[] = "border-top-right-radius: {$br['right']}{$unit}";
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $mobile_styles[] = "border-bottom-right-radius: {$br['bottom']}{$unit}";
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $mobile_styles[] = "border-bottom-left-radius: {$br['left']}{$unit}";
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
            if ( isset( $br['top'] ) && $br['top'] !== '' )    $hover_styles[] = "border-top-left-radius: {$br['top']}{$unit}";
            if ( isset( $br['right'] ) && $br['right'] !== '' )  $hover_styles[] = "border-top-right-radius: {$br['right']}{$unit}";
            if ( isset( $br['bottom'] ) && $br['bottom'] !== '' ) $hover_styles[] = "border-bottom-right-radius: {$br['bottom']}{$unit}";
            if ( isset( $br['left'] ) && $br['left'] !== '' )   $hover_styles[] = "border-bottom-left-radius: {$br['left']}{$unit}";
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
}
