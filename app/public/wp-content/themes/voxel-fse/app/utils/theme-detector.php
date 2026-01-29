<?php
declare(strict_types=1);

/**
 * Theme Detector Utility
 *
 * Detects whether the active theme is Voxel FSE (child theme) or standard Voxel.
 * This allows the plugin to load different components based on the active theme.
 *
 * @package MusicalWheel\Core
 * @since 1.0.0
 */

namespace VoxelFSE;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Check if the current theme is FSE (Voxel FSE child theme)
 *
 * @return bool True if Voxel FSE is active, false otherwise
 */
function is_fse_theme() {
    $theme = wp_get_theme();
    return $theme->get( 'TextDomain' ) === 'voxel-fse';
}

/**
 * Check if the current theme is standard Voxel
 *
 * @return bool True if standard Voxel is active, false otherwise
 */
function is_voxel_theme() {
    $theme = wp_get_theme();
    $parent_theme = $theme->parent();

    return (
        $theme->get( 'TextDomain' ) === 'voxel' ||
        ( $parent_theme && $parent_theme->get( 'TextDomain' ) === 'voxel' )
    );
}

/**
 * Get the active theme type
 *
 * @return string 'fse', 'voxel', or 'unknown'
 */
function get_theme_type() {
    if ( is_fse_theme() ) {
        return 'fse';
    } elseif ( is_voxel_theme() ) {
        return 'voxel';
    }

    return 'unknown';
}

/**
 * Check if module should load FSE-specific features
 *
 * Modules can use this to determine whether to register FSE blocks
 * or Elementor widgets.
 *
 * @return bool True if FSE features should be loaded
 */
function should_load_fse_features() {
    return is_fse_theme() && function_exists( 'wp_is_block_theme' ) && wp_is_block_theme();
}

/**
 * Check if module should load Elementor features
 *
 * @return bool True if Elementor features should be loaded
 */
function should_load_elementor_features() {
    return ! is_fse_theme() && did_action( 'elementor/loaded' );
}
