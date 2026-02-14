<?php

namespace Nectar\Editor;

use Nectar\API\Access_Utils;

class Post_Meta {
    private static $instance;

    public static function get_instance() {
        if ( ! isset( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct() {
        add_action( 'init', [$this, 'register_meta'] );
    }

    // Note: any CPT that wants to use these will need to have custom fields enabled in the post type.
    public function register_meta() {
        // Hide post title.
        register_post_meta( '', '_nectar_blocks_hide_post_title', [
            'show_in_rest' => true,
            'single' => true,
            'default' => false,
            'type' => 'boolean',
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
            // 'auth_callback' => '__return_true',
        ]);

        // Transparent Header Effect.
        register_post_meta( '', '_nectar_blocks_transparent_header_effect', [
            'show_in_rest' => true,
            'single' => true,
            'default' => false,
            'type' => 'boolean',
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
            // 'auth_callback' => '__return_true',
        ]);

        register_post_meta( '', '_nectar_blocks_transparent_header_effect_color', [
            'show_in_rest' => true,
            'single' => true,
            'default' => 'light',
            'type' => 'string',
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
            // 'auth_callback' => '__return_true',
        ]);

        // Header Animation.
        register_post_meta( '', '_nectar_blocks_header_animation', [
            'show_in_rest' => true,
            'single' => true,
            'default' => false,
            'type' => 'boolean',
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
            // 'auth_callback' => '__return_true',
        ]);

        register_post_meta( '', '_nectar_blocks_header_animation_effect', [
            'show_in_rest' => true,
            'single' => true,
            'default' => 'fade',
            'type' => 'string',
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
            // 'auth_callback' => '__return_true',
        ]);

        register_post_meta( '', '_nectar_blocks_page_css', [
            'show_in_rest' => true,
            'single' => true,
            'default' => '',
            'type' => 'string',
            // 'auth_callback' => function () { return Access_Utils::is_super_admin(); }
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
        ]);

        register_post_meta( '', '_nectar_blocks_page_js', [
            'show_in_rest' => true,
            'single' => true,
            'default' => '',
            'type' => 'string',
            // 'auth_callback' => function () { return Access_Utils::is_super_admin(); }
            'auth_callback' => function () { return Access_Utils::can_manage_options(); }
        ]);

    }
}