<?php

namespace Nectar\API;
use Nectar\API\{Router, API_Route};
use Nectar\Utilities\Log;

/**
 * Post Data API
 * @version 0.0.9
 * @since 0.0.9
 */
class Post_Data_API implements API_Route {
  const API_BASE = '/post_data';

  public function build_routes() {
    Router::add_route($this::API_BASE . '/taxonomies', [
      'callback' => [$this, 'get_taxonomies'],
      'methods' => 'GET',
      'permission_callback' => function() {
        return Access_Utils::can_edit_posts();
      },
      'args' => [
        'postType' => [
          'type' => 'string',
          'required' => false,
          'description' => 'Post Type for which to get taxonomies.'
        ]
      ]
    ]);

    Router::add_route($this::API_BASE . '/postTypes', [
      'callback' => [$this, 'get_post_types'],
      'methods' => 'GET',
      'permission_callback' => function() {
        return Access_Utils::can_edit_posts();
      }
    ]);

    Router::add_route($this::API_BASE . '/imageSizes', [
      'callback' => [$this, 'get_image_sizes'],
      'methods' => 'GET',
      'permission_callback' => function() {
        return Access_Utils::can_edit_posts();
      }
    ]);
  }

  public function get_taxonomies(\WP_REST_Request $request) {

    $post_type = sanitize_text_field($request->get_param( 'postType' ));

    $taxonomies = get_object_taxonomies( $post_type, 'objects' );
    // Skip visually hidden taxonomies.
    $ui_taxonomies = array_filter($taxonomies, function($taxonomy) {
      return $taxonomy->public && $taxonomy->show_ui;
    });
    $taxonomy_names = array_keys($ui_taxonomies);

    $taxonomy_to_terms = [];
    foreach ( $taxonomy_names as $taxonomy ) {
      $terms = get_terms( $taxonomy );
      $terms_filtered = array_map(fn ($item) => [
        "term_id" => $item->term_id,
        "name" => $item->name,
        "slug" => $item->slug
      ], $terms);
      $taxonomy_to_terms[$taxonomy] = array_values($terms_filtered);
    }
    $response = new \WP_REST_Response($taxonomy_to_terms, 200);
    return $response;
  }

  public function get_post_types() {
    $to_remove = apply_filters('nectar_blocks_get_taxonomies_excluded_post_types', [
      'attachment',
      'nav_menu_item',
      'wp_block',
      'wp_template',
      'wp_template_part',
      'wp_navigation',
      'wp_font_family'
    ]);

    $post_types = get_post_types(
        [ 'public' => true ],
        'objects'
    );
    $post_types_clean = array_filter(
        $post_types,
        fn ($item) => ! in_array($item->name, $to_remove)
    );

    $mapped = array_map(
        fn ($item) => [
        "name" => $item->label,
        "slug" => $item->name
      ],
        $post_types_clean
    );

    $response = new \WP_REST_Response(array_values($mapped), 200);
    return $response;
  }

  public function get_image_sizes() {
    $sizes_to_remove = [
      '1536x1536',
      '2048x2048'
    ];

    $sizes_to_add = [
      'full'
    ];

    $image_sizes = get_intermediate_image_sizes();
    $image_sizes = array_filter($image_sizes, fn ($i) => ! in_array($i, $sizes_to_remove));
    $image_sizes = [
      ...$image_sizes,
      ...$sizes_to_add
    ];

    $response = new \WP_REST_Response($image_sizes, 200);
    return $response;
  }
}