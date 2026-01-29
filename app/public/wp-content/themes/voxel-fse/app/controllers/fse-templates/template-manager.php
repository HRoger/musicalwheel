<?php
declare(strict_types=1);

/**
 * FSE Template Manager
 *
 * Handles creation, editing, and deletion of FSE templates for Voxel post types.
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Template_Manager {

    /**
     * Create an FSE template for a Voxel post type
     *
     * @param string $post_type_key Voxel post type key (e.g., 'place', 'event')
     * @param string $template_type Template type: 'single', 'archive', or 'card'
     *                              Note: 'form' is NOT a template - it's a PAGE created by Voxel
     * @return int|false Template ID on success, false on failure
     */
    public static function create_fse_template( $post_type_key, $template_type ) {
        // Validate template type
        // ⭐ CRITICAL: Form templates are PAGES, not FSE templates!
        // Evidence: themes/voxel/app/controllers/templates/post-types/post-type-base-templates-controller.php:30-35
        if ( ! in_array( $template_type, array( 'single', 'archive', 'card' ), true ) ) {
            return false;
        }

        // Get post type object
        $post_type = \Voxel\Post_Type::get( $post_type_key );
        if ( ! $post_type ) {
            return false;
        }

        // Generate template slug
        $template_slug = self::generate_template_slug( $post_type_key, $template_type );

        // Check if template already exists
        if ( self::template_exists( $template_slug ) ) {
            return self::get_template_id_by_slug( $template_slug );
        }

        // Create template title
        $template_title = self::generate_template_title( $post_type, $template_type );

        // Determine WordPress template type
        $wp_template_type = self::get_wp_template_type( $template_type );

        // Create wp_template post
        $template_id = wp_insert_post( array(
            'post_type'    => 'wp_template',
            'post_status'  => 'publish',
            'post_title'   => $template_title,
            'post_name'    => $template_slug,
            'post_content' => self::get_default_template_content( $post_type_key, $template_type ),
            'post_author'  => 0, // Set author to 0 (system)
            'meta_input'   => array(
                '_voxel_post_type'    => $post_type_key,
                '_voxel_template_type' => $template_type,
                '_wp_template_author' => 'Voxel FSE (Musicalwheel)', // Custom author display name
            ),
        ) );

        if ( is_wp_error( $template_id ) ) {
            return false;
        }

        // Set template taxonomy (wp_theme)
        wp_set_object_terms( $template_id, 'voxel-fse', 'wp_theme' );

        return $template_id;
    }

    /**
     * Create an FSE template with a custom slug (for unique custom templates)
     *
     * @param string $post_type_key Post type key
     * @param string $template_type Template type (single, archive, card)
     *                              Note: 'form' is NOT a template - it's a PAGE created by Voxel
     * @param string $custom_slug Custom slug to use
     * @return int|false Template ID or false on failure
     */
    public static function create_fse_template_with_slug( $post_type_key, $template_type, $custom_slug ) {
        // Check if template already exists with this slug
        if ( self::template_exists( $custom_slug ) ) {
            return self::get_template_id_by_slug( $custom_slug );
        }

        // Get post type object
        $post_type = \Voxel\Post_Type::get( $post_type_key );
        if ( ! $post_type ) {
            return false;
        }

        // Create template title
        $template_title = self::generate_template_title( $post_type, $template_type );

        // Determine WordPress template type
        $wp_template_type = self::get_wp_template_type( $template_type );

        // Create wp_template post with custom slug
        $template_id = wp_insert_post( array(
            'post_type'    => 'wp_template',
            'post_status'  => 'publish',
            'post_title'   => $template_title,
            'post_name'    => $custom_slug,  // Use custom slug!
            'post_content' => self::get_default_template_content( $post_type_key, $template_type ),
            'post_author'  => 0,
            'meta_input'   => array(
                '_voxel_post_type'    => $post_type_key,
                '_voxel_template_type' => $template_type,
                '_wp_template_author' => 'Voxel FSE (Musicalwheel)',
            ),
        ) );

        if ( is_wp_error( $template_id ) ) {
            return false;
        }

        // Set template taxonomy (wp_theme)
        wp_set_object_terms( $template_id, 'voxel-fse', 'wp_theme' );

        return $template_id;
    }

    /**
     * Check if an FSE template exists by slug
     *
     * @param string $template_slug Template slug
     * @return bool True if exists, false otherwise
     */
    public static function template_exists( $template_slug ) {
        $template = get_page_by_path( $template_slug, OBJECT, 'wp_template' );
        return $template && $template->post_status !== 'trash';
    }

    /**
     * Get template ID by slug
     *
     * @param string $template_slug Template slug
     * @return int|null Template ID or null if not found
     */
    public static function get_template_id_by_slug( $template_slug ) {
        $template = get_page_by_path( $template_slug, OBJECT, 'wp_template' );
        return $template ? $template->ID : null;
    }

    /**
     * Generate template slug
     *
     * @param string $post_type_key Post type key
     * @param string $template_type Template type
     * @return string Template slug
     */
    private static function generate_template_slug( $post_type_key, $template_type ) {
        return sprintf( 'voxel-%s-%s', $post_type_key, $template_type );
    }

    /**
     * Generate template title
     *
     * @param \Voxel\Post_Type $post_type Post type object
     * @param string $template_type Template type
     * @return string Template title
     */
    private static function generate_template_title( $post_type, $template_type ) {
        $labels = array(
            'single'  => 'Single Post',
            'archive' => 'Archive',
            'card'    => 'Preview Card',
            'form'    => 'Submission Form',
        );

        return sprintf(
            '%s: %s',
            $post_type->get_label(),
            $labels[ $template_type ] ?? $template_type
        );
    }

    /**
     * Get WordPress template type based on Voxel template type
     *
     * @param string $template_type Voxel template type
     * @return string WordPress template type
     */
    private static function get_wp_template_type( $template_type ) {
        $mapping = array(
            'single'  => 'single',
            'archive' => 'archive',
            'card'    => 'template-part',
            'form'    => 'page',
        );

        return $mapping[ $template_type ] ?? 'template-part';
    }

    /**
     * Get default template content
     *
     * @param string $post_type_key Post type key
     * @param string $template_type Template type
     * @return string Block-based template content
     */
    private static function get_default_template_content( $post_type_key, $template_type ) {
        // Default WordPress blocks content
        switch ( $template_type ) {
            case 'single':
                return '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:post-content /-->
</div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->';

            case 'archive':
                return '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:query-title {"type":"archive"} /-->
    <!-- wp:query {"query":{"perPage":10,"pages":0,"offset":0,"postType":"' . esc_attr( $post_type_key ) . '","order":"desc","orderBy":"date"}} -->
    <div class="wp-block-query">
        <!-- wp:post-template -->
            <!-- wp:post-title {"isLink":true} /-->
            <!-- wp:post-excerpt /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination /-->
    </div>
    <!-- /wp:query -->
</div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->';

            case 'card':
                return '<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:post-featured-image {"isLink":true} /-->
    <!-- wp:post-title {"level":3,"isLink":true} /-->
    <!-- wp:post-excerpt {"moreText":"Read more"} /-->
</div>
<!-- /wp:group -->';

            case 'form':
                return '<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- wp:heading {"level":1} -->
    <h1>Submit New Post</h1>
    <!-- /wp:heading -->

    <!-- wp:paragraph -->
    <p>Use Voxel submission form block here</p>
    <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->';

            default:
                return '<!-- wp:paragraph --><p>Default template content</p><!-- /wp:paragraph -->';
        }
    }

    /**
     * Get Site Editor URL for a template
     *
     * @param int $template_id Template ID
     * @return string Site Editor URL
     */
    public static function get_site_editor_url( $template_id ) {
        $template = get_post( $template_id );
        if ( ! $template || $template->post_type !== 'wp_template' ) {
            return '';
        }

        // WordPress Site Editor URL format for editing a specific template
        // The postId uses the format: theme-slug//template-slug
        // The canvas parameter forces it to open in the template editor view
        return add_query_arg(
            array(
                'postType' => 'wp_template',
                'postId'   => 'voxel-fse//' . $template->post_name,
                'canvas'   => 'edit', // Forces Site Editor to open in edit mode
            ),
            admin_url( 'site-editor.php' )
        );
    }

    /**
     * Get Site Editor URL by slug
     *
     * @param string $template_slug Template slug
     * @return string Site Editor URL
     */
    public static function get_site_editor_url_by_slug( $template_slug ) {
        $template_id = self::get_template_id_by_slug( $template_slug );
        if ( ! $template_id ) {
            return '';
        }

        return self::get_site_editor_url( $template_id );
    }

    /**
     * Delete an FSE template
     *
     * @param int $template_id Template ID
     * @return bool True on success, false on failure
     */
    public static function delete_template( $template_id ) {
        $result = wp_delete_post( $template_id, true );
        return ! is_wp_error( $result ) && $result !== false;
    }

    /**
     * Get template ID from post type config
     *
     * @param \Voxel\Post_Type $post_type Post type object
     * @param string $template_type Template type
     * @return string|null Template slug or null
     */
    public static function get_template_slug_from_config( $post_type, $template_type ) {
        $templates = $post_type->repository->config['fse_templates'] ?? array();
        return $templates[ $template_type ] ?? null;
    }

    /**
     * Save template slug to post type config
     *
     * @param \Voxel\Post_Type $post_type Post type object
     * @param string $template_type Template type
     * @param string $template_slug Template slug
     * @return void
     */
    public static function save_template_to_config( $post_type, $template_type, $template_slug ) {
        $fse_templates = $post_type->repository->config['fse_templates'] ?? array();
        $fse_templates[ $template_type ] = $template_slug;

        $post_type->repository->set_config( array(
            'fse_templates' => $fse_templates,
        ) );
    }

    /**
     * Remove template from post type config
     *
     * @param \Voxel\Post_Type $post_type Post type object
     * @param string $template_type Template type
     * @return void
     */
    public static function remove_template_from_config( $post_type, $template_type ) {
        $fse_templates = $post_type->repository->config['fse_templates'] ?? array();
        unset( $fse_templates[ $template_type ] );

        $post_type->repository->set_config( array(
            'fse_templates' => $fse_templates,
        ) );
    }

    /**
     * Create an FSE template for Voxel Design menu
     *
     * @param string $template_type Template type (e.g., 'header', 'footer', 'auth', 'timeline', etc.)
     * @param string $template_label Human-readable label for the template
     * @return int|false Template ID on success, false on failure
     */
    public static function create_fse_template_for_design_menu( $template_type, $template_label ) {
        // Generate template slug for Design menu templates
        $template_slug = 'voxel-' . sanitize_title( $template_type );

        // Check if template already exists
        if ( self::template_exists( $template_slug ) ) {
            $template_id = self::get_template_id_by_slug( $template_slug );

            // Set taxonomy even on existing templates (fixes old templates created without taxonomy)
            if ( $template_id ) {
                wp_set_object_terms( $template_id, 'voxel-fse', 'wp_theme' );
            }

            return $template_id;
        }

        // Create template title
        $template_title = sprintf( 'Voxel: %s', $template_label );

        // Create the template
        $template_id = wp_insert_post( array(
            'post_type'    => 'wp_template',
            'post_status'  => 'publish',
            'post_title'   => $template_title,
            'post_name'    => $template_slug,
            'post_content' => self::get_default_design_menu_content( $template_type ),
            'post_author'  => 0,
            'meta_input'   => array(
                '_voxel_design_template_type' => $template_type,
                '_wp_template_author'         => 'Voxel FSE (Musicalwheel)',
            ),
        ) );

        if ( is_wp_error( $template_id ) ) {
            return false;
        }

        // Set template taxonomy (wp_theme) - critical for WordPress FSE to recognize the template
        wp_set_object_terms( $template_id, 'voxel-fse', 'wp_theme' );

        return $template_id;
    }

    /**
     * Get default content for Design menu FSE templates
     *
     * @param string $template_type Template type
     * @return string Template content
     */
    private static function get_default_design_menu_content( $template_type ) {
        // Extract base type (e.g., 'header' from 'header-custom-123')
        $base_type = explode( '-', $template_type )[0];

        // Map template types to appropriate WordPress patterns
        $content_map = array(
            'header'         => '<!-- wp:template-part {"slug":"header","theme":"voxel-fse","tagName":"header"} /-->',
            'footer'         => '<!-- wp:template-part {"slug":"footer","theme":"voxel-fse","tagName":"footer"} /-->',
            'term_single'    => '<!-- wp:paragraph --><p>Taxonomy single page content</p><!-- /wp:paragraph -->',
            'term_card'      => '<!-- wp:paragraph --><p>Taxonomy card content</p><!-- /wp:paragraph -->',
            'auth'           => '<!-- wp:paragraph --><p>Login & Registration page content</p><!-- /wp:paragraph -->',
            'pricing'        => '<!-- wp:paragraph --><p>Pricing plans page content</p><!-- /wp:paragraph -->',
            'current_plan'   => '<!-- wp:paragraph --><p>Current plan page content</p><!-- /wp:paragraph -->',
            'orders'         => '<!-- wp:paragraph --><p>Orders page content</p><!-- /wp:paragraph -->',
            'stripe_account' => '<!-- wp:paragraph --><p>Seller dashboard content</p><!-- /wp:paragraph -->',
            'timeline'       => '<!-- wp:paragraph --><p>Newsfeed page content</p><!-- /wp:paragraph -->',
            'inbox'          => '<!-- wp:paragraph --><p>Inbox page content</p><!-- /wp:paragraph -->',
            'post_stats'     => '<!-- wp:paragraph --><p>Post statistics page content</p><!-- /wp:paragraph -->',
            'privacy_policy' => '<!-- wp:paragraph --><p>Privacy policy page content</p><!-- /wp:paragraph -->',
            'terms'          => '<!-- wp:paragraph --><p>Terms & conditions page content</p><!-- /wp:paragraph -->',
            '404'            => '<!-- wp:paragraph --><p>404 not found page content</p><!-- /wp:paragraph -->',
            'restricted'     => '<!-- wp:paragraph --><p>Restricted content message</p><!-- /wp:paragraph -->',
        );

        return $content_map[ $base_type ] ?? $content_map[ $template_type ] ?? '<!-- wp:paragraph --><p>Template content</p><!-- /wp:paragraph -->';
    }
}
