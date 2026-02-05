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
        $css_rules = [];
        $tablet_rules = [];
        $mobile_rules = [];

        // High-specificity selector for search-form
        // Doubled class provides (0,2,0) base specificity
        $selector = '.voxel-fse-search-form-' . $block_id . '.voxel-fse-search-form-' . $block_id;

        // ============================================
        // Map/Feed Switcher Styles
        // Source: themes/voxel/templates/widgets/search-form.php:2917-3065
        // Target: .ts-switcher-btn (container), .ts-switcher-btn .ts-btn (button)
        // These styles target portal-rendered elements at document.body level
        // ============================================

        // Switcher Alignment - ts_switcher_position
        if ( ! empty( $attributes['mapSwitcherAlign'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn { justify-content: {$attributes['mapSwitcherAlign']}; }";
        }

        // Bottom Margin - ts_switcher_bottom
        if ( isset( $attributes['mapSwitcherBottomMargin'] ) && $attributes['mapSwitcherBottomMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ts-switcher-btn { bottom: {$attributes['mapSwitcherBottomMargin']}px; }";
        }
        if ( isset( $attributes['mapSwitcherBottomMargin_tablet'] ) && $attributes['mapSwitcherBottomMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-switcher-btn { bottom: {$attributes['mapSwitcherBottomMargin_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherBottomMargin_mobile'] ) && $attributes['mapSwitcherBottomMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-switcher-btn { bottom: {$attributes['mapSwitcherBottomMargin_mobile']}px; }";
        }

        // Side Margin - ts_switcher_side
        if ( isset( $attributes['mapSwitcherSideMargin'] ) && $attributes['mapSwitcherSideMargin'] !== '' ) {
            $css_rules[] = "{$selector} .ts-switcher-btn { padding-left: {$attributes['mapSwitcherSideMargin']}px; padding-right: {$attributes['mapSwitcherSideMargin']}px; }";
        }
        if ( isset( $attributes['mapSwitcherSideMargin_tablet'] ) && $attributes['mapSwitcherSideMargin_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-switcher-btn { padding-left: {$attributes['mapSwitcherSideMargin_tablet']}px; padding-right: {$attributes['mapSwitcherSideMargin_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherSideMargin_mobile'] ) && $attributes['mapSwitcherSideMargin_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-switcher-btn { padding-left: {$attributes['mapSwitcherSideMargin_mobile']}px; padding-right: {$attributes['mapSwitcherSideMargin_mobile']}px; }";
        }

        // Typography - ts_switcher_typo
        if ( ! empty( $attributes['mapSwitcherTypography'] ) ) {
            $typo = self::generate_typography_css( $attributes['mapSwitcherTypography'] );
            if ( $typo ) {
                $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { {$typo} }";
            }
        }

        // Text Color - ts_switcher_text
        if ( ! empty( $attributes['mapSwitcherColor'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { color: {$attributes['mapSwitcherColor']}; }";
        }

        // Background Color - ts_switcher_bg
        if ( ! empty( $attributes['mapSwitcherBackgroundColor'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { background: {$attributes['mapSwitcherBackgroundColor']}; }";
        }

        // Height - ts_switcher_height
        if ( isset( $attributes['mapSwitcherHeight'] ) && $attributes['mapSwitcherHeight'] !== '' ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { height: {$attributes['mapSwitcherHeight']}px; }";
        }
        if ( isset( $attributes['mapSwitcherHeight_tablet'] ) && $attributes['mapSwitcherHeight_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-switcher-btn .ts-btn { height: {$attributes['mapSwitcherHeight_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherHeight_mobile'] ) && $attributes['mapSwitcherHeight_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-switcher-btn .ts-btn { height: {$attributes['mapSwitcherHeight_mobile']}px; }";
        }

        // Padding - ts_switcher_padding
        if ( ! empty( $attributes['mapSwitcherPadding'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['mapSwitcherPadding'], 'padding' );
            if ( $padding ) {
                $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { {$padding} }";
            }
        }
        if ( ! empty( $attributes['mapSwitcherPadding_tablet'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['mapSwitcherPadding_tablet'], 'padding' );
            if ( $padding ) {
                $tablet_rules[] = "{$selector} .ts-switcher-btn .ts-btn { {$padding} }";
            }
        }
        if ( ! empty( $attributes['mapSwitcherPadding_mobile'] ) ) {
            $padding = self::generate_dimensions_css( $attributes['mapSwitcherPadding_mobile'], 'padding' );
            if ( $padding ) {
                $mobile_rules[] = "{$selector} .ts-switcher-btn .ts-btn { {$padding} }";
            }
        }

        // Border - ts_switcher_border
        if ( ! empty( $attributes['mapSwitcherBorder'] ) ) {
            $border = self::generate_border_css( $attributes['mapSwitcherBorder'] );
            if ( $border ) {
                $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { border: {$border}; }";
            }
        }

        // Border Radius - ts_switcher_radius
        if ( isset( $attributes['mapSwitcherBorderRadius'] ) && $attributes['mapSwitcherBorderRadius'] !== '' ) {
            $unit = $attributes['mapSwitcherBorderRadiusUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { border-radius: {$attributes['mapSwitcherBorderRadius']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherBorderRadius_tablet'] ) && $attributes['mapSwitcherBorderRadius_tablet'] !== '' ) {
            $unit = $attributes['mapSwitcherBorderRadiusUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-switcher-btn .ts-btn { border-radius: {$attributes['mapSwitcherBorderRadius_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherBorderRadius_mobile'] ) && $attributes['mapSwitcherBorderRadius_mobile'] !== '' ) {
            $unit = $attributes['mapSwitcherBorderRadiusUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-switcher-btn .ts-btn { border-radius: {$attributes['mapSwitcherBorderRadius_mobile']}{$unit}; }";
        }

        // Box Shadow - ts_switcher_shadow
        if ( ! empty( $attributes['mapSwitcherBoxShadow'] ) ) {
            $shadow = self::generate_box_shadow_css( $attributes['mapSwitcherBoxShadow'] );
            if ( $shadow ) {
                $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { box-shadow: {$shadow}; }";
            }
        }

        // Icon Spacing - ts_switcher_ico_spacing
        if ( isset( $attributes['mapSwitcherIconSpacing'] ) && $attributes['mapSwitcherIconSpacing'] !== '' ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { grid-gap: {$attributes['mapSwitcherIconSpacing']}px; }";
        }
        if ( isset( $attributes['mapSwitcherIconSpacing_tablet'] ) && $attributes['mapSwitcherIconSpacing_tablet'] !== '' ) {
            $tablet_rules[] = "{$selector} .ts-switcher-btn .ts-btn { grid-gap: {$attributes['mapSwitcherIconSpacing_tablet']}px; }";
        }
        if ( isset( $attributes['mapSwitcherIconSpacing_mobile'] ) && $attributes['mapSwitcherIconSpacing_mobile'] !== '' ) {
            $mobile_rules[] = "{$selector} .ts-switcher-btn .ts-btn { grid-gap: {$attributes['mapSwitcherIconSpacing_mobile']}px; }";
        }

        // Icon Size - ts_switcher_ico_size
        if ( isset( $attributes['mapSwitcherIconSize'] ) && $attributes['mapSwitcherIconSize'] !== '' ) {
            $unit = $attributes['mapSwitcherIconSizeUnit'] ?? 'px';
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { --ts-icon-size: {$attributes['mapSwitcherIconSize']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherIconSize_tablet'] ) && $attributes['mapSwitcherIconSize_tablet'] !== '' ) {
            $unit = $attributes['mapSwitcherIconSizeUnit'] ?? 'px';
            $tablet_rules[] = "{$selector} .ts-switcher-btn .ts-btn { --ts-icon-size: {$attributes['mapSwitcherIconSize_tablet']}{$unit}; }";
        }
        if ( isset( $attributes['mapSwitcherIconSize_mobile'] ) && $attributes['mapSwitcherIconSize_mobile'] !== '' ) {
            $unit = $attributes['mapSwitcherIconSizeUnit'] ?? 'px';
            $mobile_rules[] = "{$selector} .ts-switcher-btn .ts-btn { --ts-icon-size: {$attributes['mapSwitcherIconSize_mobile']}{$unit}; }";
        }

        // Icon Color - ts_switcher_ico_color
        if ( ! empty( $attributes['mapSwitcherIconColor'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn { --ts-icon-color: {$attributes['mapSwitcherIconColor']}; }";
        }

        // Hover States
        if ( ! empty( $attributes['mapSwitcherColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn:hover { color: {$attributes['mapSwitcherColorHover']}; }";
        }
        if ( ! empty( $attributes['mapSwitcherBackgroundColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn:hover { background: {$attributes['mapSwitcherBackgroundColorHover']}; }";
        }
        if ( ! empty( $attributes['mapSwitcherBorderColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn:hover { border-color: {$attributes['mapSwitcherBorderColorHover']}; }";
        }
        if ( ! empty( $attributes['mapSwitcherIconColorHover'] ) ) {
            $css_rules[] = "{$selector} .ts-switcher-btn .ts-btn:hover { --ts-icon-color: {$attributes['mapSwitcherIconColorHover']}; }";
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

        $popup_selector = '.voxel-popup-' . $block_id;
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

        $unit = $dimensions['unit'] ?? 'px';
        $props = [];

        if ( isset( $dimensions['top'] ) && $dimensions['top'] !== '' ) {
            $props[] = "{$property}-top: {$dimensions['top']}{$unit}";
        }
        if ( isset( $dimensions['right'] ) && $dimensions['right'] !== '' ) {
            $props[] = "{$property}-right: {$dimensions['right']}{$unit}";
        }
        if ( isset( $dimensions['bottom'] ) && $dimensions['bottom'] !== '' ) {
            $props[] = "{$property}-bottom: {$dimensions['bottom']}{$unit}";
        }
        if ( isset( $dimensions['left'] ) && $dimensions['left'] !== '' ) {
            $props[] = "{$property}-left: {$dimensions['left']}{$unit}";
        }

        return implode( '; ', $props );
    }

    /**
     * Generate border CSS
     *
     * @param array $border Border settings.
     * @return string Border CSS value.
     */
    private static function generate_border_css( $border ) {
        if ( empty( $border ) || ! is_array( $border ) ) {
            return '';
        }

        $width = $border['width'] ?? '1';
        $style = $border['style'] ?? 'solid';
        $color = $border['color'] ?? '#000';

        return "{$width}px {$style} {$color}";
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
}
