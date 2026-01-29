<?php

namespace Nectar\Global_Sections;

use Nectar\Global_Sections\Display_Options;
use Nectar\Global_Sections\Render;
use Nectar\Global_Sections\Visual_Hook_Locations;

class Global_Sections_Register {
  private static $instance;

  function __construct() {

    // Frontend.
    add_action( 'wp_enqueue_scripts', [$this, 'enqueue_assets'] );
    add_action( 'init', [$this, 'init'] );

  }

  public function init() {

    // Skip if Salient Core is active.
    if( defined('SALIENT_CORE_VERSION') ) {
      return;
    }

    // Init classes.
    Visual_Hook_Locations::get_instance();
    Display_Options::get_instance();
    Render::get_instance();

    // Shortcode.
    add_shortcode('nectar_global_section', [$this, 'global_section_shortcode_callback'] );

    // Register post type.
    $this->register_post_type();
  }

  /**
  * Registers the global section post type/tax.
  */
  public function register_post_type() {

    $post_type_labels = [
      'name' => esc_html__( 'Global Sections', 'nectar-blocks' ),
      'singular_name' => esc_html__( 'Global Section', 'nectar-blocks' ),
      'search_items' => esc_html__( 'Search Global Sections', 'nectar-blocks' ),
      'all_items' => esc_html__( 'Global Sections', 'nectar-blocks' ),
      'parent_item' => esc_html__( 'Parent Global Section', 'nectar-blocks' ),
      'edit_item' => esc_html__( 'Edit Global Section', 'nectar-blocks' ),
      'update_item' => esc_html__( 'Update Global Section', 'nectar-blocks' ),
      'add_new_item' => esc_html__( 'Add New Global Section', 'nectar-blocks' ),
      'add_new' => esc_html__( 'Add New Global Section', 'nectar-blocks' ),
    ];

    $public_bool = (is_user_logged_in()) ? true : false;

    $args = [
      'labels' => $post_type_labels,
      'singular_label' => esc_html__( 'Section', 'nectar-blocks' ),
      'public' => $public_bool,
      'publicly_queryable' => $public_bool,
      'rewrite' => false,
      'show_in_rest' => true,
      'exclude_from_search' => true,
      'show_ui' => true,
      'hierarchical' => true,
      'menu_position' => 55,
      'menu_icon' => 'dashicons-layout',
      'supports' => [ 'title', 'editor', 'revisions' ],
    ];

  register_post_type( 'nectar_sections', $args );

  $tax_labels = [
    'name' => esc_html__( 'Global Section Categories', 'nectar-blocks' ),
    'singular_name' => esc_html__( 'Global Section Category', 'nectar-blocks' ),
    'search_items' => esc_html__( 'Search Global Section Categories', 'nectar-blocks' ),
    'all_items' => esc_html__( 'Global Section Categories', 'nectar-blocks' ),
    'parent_item' => esc_html__( 'Parent Global Section Category', 'nectar-blocks' ),
    'edit_item' => esc_html__( 'Edit Global Section Category', 'nectar-blocks' ),
    'update_item' => esc_html__( 'Update Global Section Category', 'nectar-blocks' ),
    'add_new_item' => esc_html__( 'Add New Global Section Category', 'nectar-blocks' ),
    'menu_name' => esc_html__( 'Global Section Categories', 'nectar-blocks' ),
  ];

  register_taxonomy(
      'nectar_sections_category',
      [ 'nectar_sections' ],
      [
      'hierarchical' => true,
      'labels' => $tax_labels,
      'show_ui' => true,
      'query_var' => true,
      'public' => false,
      'rewrite' => false,
    ]
  );

  }

  public function enqueue_assets() {

    if( ! defined( 'NECTAR_THEME_NAME' ) || ! class_exists('NectarThemeManager')) {
      return;
    }

    // $nectar_options = NectarThemeManager::$options;

    // if( isset($nectar_options['global-section-after-header-navigation']) &&
    //     !empty($nectar_options['global-section-after-header-navigation']) ) {
    //       wp_enqueue_style( 'js_composer_front' );
    // }

  }

  /**
  * Determines the current post type.
  */
  public function get_post_type() {

    global $post, $typenow;

    $current_post_type = '';

    if ( $post && $post->post_type ) {
      $current_post_type = $post->post_type;
    }
    elseif( $typenow ) {
      $current_post_type = $typenow;
    }
    else if (! empty($_GET['post'])) {
      $fetched_post = get_post( intval($_GET['post']) );
      if($fetched_post) {
        $current_post_type = (property_exists( $fetched_post, 'post_type') ) ? $fetched_post->post_type : '';
      }
    }
    elseif ( isset( $_REQUEST['post_type'] ) ) {
      return sanitize_text_field($_REQUEST['post_type']);
    }

    return $current_post_type;
  }

  public function global_section_shortcode_callback($atts) {

    extract(shortcode_atts([
      "id" => "",
      'enable_display_conditions' => ''
    ], $atts));

    if (! empty($id)) {

      $section_id = intval($id);
      $section_id = apply_filters('wpml_object_id', $section_id, 'post', true);

      if( $section_id === 0 ) {
        return;
      }

      $section_status = get_post_status($section_id);

      $allow_output = true;

      if ( $enable_display_conditions === 'yes' ) {
        $allow_output = Render::get_instance()->verify_conditional_display( $section_id );
      }

      if ( 'publish' === $section_status && $allow_output ) {

        $section_content = get_post_field('post_content', $section_id);

        if ($section_content) {

          $unneeded_tags = [
            '<p>[' => '[',
            ']</p>' => ']',
            ']<br />' => ']',
            ']<br>' => ']',
          ];

          if( function_exists('do_blocks')) {
            $rendered_section_content = do_blocks($section_content);
          }
          $rendered_section_content = wptexturize( $rendered_section_content);
          $rendered_section_content = convert_smilies( $rendered_section_content );
          $rendered_section_content = shortcode_unautop( $rendered_section_content );
          $rendered_section_content = wp_filter_content_tags( $rendered_section_content );
          $rendered_section_content = strtr($rendered_section_content, $unneeded_tags);

          $rendered_section_content = apply_filters('nectar_global_section_content_output', $rendered_section_content);

          $global_section_markup = '';

          ob_start();
          // Look for dynamic CSS from blocks.
          $dynamic_css = get_post_meta( $section_id, '_nectar_blocks_css', true );
          if ( ! empty( $dynamic_css ) ) {
            echo '<style data-type="nectar-global-section-dynamic-css">' . $dynamic_css . '</style>';
          }
          // Output section.
          echo do_shortcode($rendered_section_content);

          $global_section_markup .= ob_get_contents();
          ob_end_clean();

          return $global_section_markup;

        }
      }
    }
  }

  /**
  * Initiator.
  */
  public static function get_instance() {
    if ( ! self::$instance ) {
      self::$instance = new self;
    }
    return self::$instance;
  }
}

// Init class.
Global_Sections_Register::get_instance();

