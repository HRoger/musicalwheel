<?php
declare(strict_types=1);

/**
 * FSE Template Editor Integration
 *
 * Overrides Voxel's template editor to use WordPress Site Editor for FSE themes.
 * This allows users to edit templates in the native WordPress FSE interface
 * instead of Voxel's custom template builder.
 *
 * @package VoxelFSE\Utils
 * @since 1.0.0
 */

namespace VoxelFSE\Utils;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Add admin scripts for template editor override
 */
add_action( 'admin_enqueue_scripts', function( $hook ) {
    // Only load on Voxel post type edit screens
    if ( ! in_array( $hook, array( 'post.php', 'post-new.php', 'edit.php' ) ) ) {
        return;
    }

    // Check if we're on a Voxel custom post type
    $screen = get_current_screen();
    if ( ! $screen || ! is_voxel_post_type( $screen->post_type ) ) {
        return;
    }

    // Enqueue template editor override script
    wp_enqueue_script(
        'voxel-fse-template-editor',
        VOXEL_FSE_URL . '/assets/admin/template-editor-override.js',
        array( 'jquery', 'wp-i18n' ),
        VOXEL_FSE_VERSION,
        true
    );

    // Pass data to JavaScript
    wp_localize_script( 'voxel-fse-template-editor', 'voxelFSE', array(
        'siteEditorUrl' => admin_url( 'site-editor.php' ),
        'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
        'nonce'         => wp_create_nonce( 'voxel_fse_template_editor' ),
    ) );
} );

/**
 * Check if a post type is a Voxel custom post type
 *
 * @param string $post_type Post type to check
 * @return bool True if it's a Voxel post type
 */
function is_voxel_post_type( $post_type ) {
    // Check if Voxel is loaded
    if ( ! function_exists( '\Voxel\get_post_types' ) ) {
        return false;
    }

    // Get Voxel post types
    $voxel_post_types = \Voxel\get_post_types();

    foreach ( $voxel_post_types as $voxel_post_type ) {
        if ( $voxel_post_type->get_key() === $post_type ) {
            return true;
        }
    }

    return false;
}

/**
 * Filter Voxel template edit links to point to Site Editor
 */
add_filter( 'voxel/template_edit_url', function( $url, $template_id, $template_type ) {
    // Only override for FSE theme
    if ( ! \VoxelFSE\is_fse_theme() ) {
        return $url;
    }

    // Build Site Editor URL
    $site_editor_url = add_query_arg(
        array(
            'postId'   => $template_id,
            'postType' => 'wp_template',
        ),
        admin_url( 'site-editor.php' )
    );

    return $site_editor_url;
}, 10, 3 );

/**
 * Add admin notice for template editor mode
 */
add_action( 'admin_notices', function() {
    $screen = get_current_screen();

    // Only show on relevant Voxel screens
    if ( ! $screen || strpos( $screen->id, 'voxel' ) === false ) {
        return;
    }

    ?>
    <div class="notice notice-info is-dismissible">
        <p>
            <strong><?php esc_html_e( 'FSE Mode Active', 'voxel-fse' ); ?></strong>
            <?php esc_html_e( 'Template editing uses WordPress Site Editor. Voxel backend functionality remains unchanged.', 'voxel-fse' ); ?>
        </p>
    </div>
    <?php
} );

/**
 * Create admin assets directory if it doesn't exist
 * and create a placeholder for the JavaScript file
 */
add_action( 'init', function() {
    $assets_dir = VOXEL_FSE_PATH . '/assets/admin';
    $js_file = $assets_dir . '/template-editor-override.js';

    // Create directory if it doesn't exist
    if ( ! file_exists( $assets_dir ) ) {
        wp_mkdir_p( $assets_dir );
    }

    // Create placeholder JS file if it doesn't exist
    if ( ! file_exists( $js_file ) ) {
        $js_content = <<<'JS'
/**
 * Template Editor Override for FSE
 *
 * Redirects Voxel template edit links to WordPress Site Editor.
 */
(function($) {
    'use strict';

    // Override template edit links when page loads
    $(document).ready(function() {
        // Find all Voxel template edit links
        $('a[href*="voxel_template_editor"]').each(function() {
            const $link = $(this);
            const templateId = $link.data('template-id');

            if (templateId) {
                // Redirect to Site Editor
                const siteEditorUrl = voxelFSE.siteEditorUrl + '?postId=' + templateId + '&postType=wp_template';
                $link.attr('href', siteEditorUrl);
            }
        });
    });

    // Helper function for future use
    window.voxelEditWithFSE = function(templateId) {
        const url = voxelFSE.siteEditorUrl + '?postId=' + templateId + '&postType=wp_template';
        window.location.href = url;
    };

})(jQuery);
JS;
        file_put_contents( $js_file, $js_content );
    }
} );
