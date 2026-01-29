<?php

namespace Nectar\Render\Blocks\PostGrid;

use Twig\Environment;
use Twig\Loader\FilesystemLoader;

/**
 * PostGrid Rendering
 * @version 1.2.1
 * @since 0.0.8
 */
class PostGrid {
  private $block_attributes;

  public $offset_compat_mode = false;

  function __construct($block_attributes, $content) {
    $this->block_attributes = $block_attributes;
    $this->pre_render();
  }

  public function pre_render() {
    // Compatibility mode for offset in pagination.
    // certain orderby options, such as menu_order, don't work with offset, 
    // so we need to set posts_per_page to -1 and handle the offset manually.
    if ( $this->block_attributes['orderBy'] === 'menu_order' &&
      $this->block_attributes['pagination']['enabled'] === true ) {
      $this->offset_compat_mode = true;
    }
  }

  public function nectar_excerpt( int $limit ) {
    $data = '';
    if ( has_excerpt() ) {
        $data = get_the_excerpt();
    } else {
        $data = get_the_content();
    }
    // Strip short codes, but keep short code content
    $data_replaced = preg_replace( '/\[[^\]]+\]/', '', $data );
    return wp_trim_words( $data_replaced, $limit );
  }

  public function typography_class_name($typography, $space = false) {

    $leading_space = $space ? ' ' : '';

    if ( ! $typography) {
      return '';
    }

    if (strpos($typography, 'nectar-gt') !== false) {
        return $leading_space . esc_attr($typography);
    }
    return $typography !== '' ? $leading_space . 'nectar-font-' . esc_attr($typography) : '';
  }

  public function build_args() {
    $args = [];

    if ($this->block_attributes['postType'] !== '') {
      $args['post_type'] = $this->block_attributes['postType'];
    }

    if (
        $this->block_attributes['postType'] !== '' &&
        $this->block_attributes['taxonomies']
    ) {

      $taxonomies_types = get_taxonomies( [ 'public' => true ] );
      $terms = get_terms( array_keys( $taxonomies_types ), [
        'hide_empty' => true,
        'include' => $this->block_attributes['taxonomies'],
      ] );
      $tax_queries = [];
      foreach ( $terms as $term ) {
        $tax_queries[] = [
          'taxonomy' => $term->taxonomy,
          'field' => 'id',
          'terms' => [ $term->term_id ],
          'relation' => 'IN',
        ];
      }
      $tax_queries['relation'] = 'OR';
      $args['tax_query'] = $tax_queries;
    }

    $args['posts_per_page'] = $this->block_attributes['postsPerPage'];
    $args['offset'] = $this->block_attributes['postOffset'];
    $args['order'] = $this->block_attributes['postOrder'];
    $args['orderby'] = $this->block_attributes['orderBy'];

    return apply_filters('nectar_blocks_post_grid_query_args', $args);
  }

  public function get_author($post, $settings, $display_meta) {

    $author_typo = $this->typography_class_name($settings['typography'], true);

    // Get typography of excerpt
    $excerpt_typo = '';
    foreach( $display_meta as $meta ) {
      if ( $meta['type'] === 'excerpt' ) {
        $excerpt_typo = $this->typography_class_name($meta['typography'], true);
      }
    }

    // Output based on style
    $author_avatar = get_avatar( get_the_author_meta( 'email' ), 40, null, get_the_author() );
    $author_text = '<span>' . get_the_author() . '</span>';
    $author_with_by_text = '<span class="inherit-typography-size' . esc_attr($excerpt_typo) . '">' . esc_html__('By', 'nectar-blocks') . '</span> <span>' . get_the_author() . '</span>';

    $author_text_render = $author_text;
    if ( $settings['style'] === 'with-by-text' ) {
      $author_text_render = $author_with_by_text;
    }

    $author_avatar_render = $author_avatar . $author_text;
    $typo_class_name = '';
    if ( array_key_exists('typography', $settings) && ! empty($settings['typography']) ) {
      $typo_class_name = ' class="' . $this->typography_class_name($settings['typography']) . '"';
    }

    // No link.
    if ( $settings['link'] === 'none' ) {
      if ( $settings['style'] === 'with-gravatar' ) {
        $author = '<span class="has-gravatar' . esc_attr($author_typo) . '">';
        $author .= $author_avatar_render;
        $author .= '</span>';
        return $author;
      } else {
        $author = '<span' . $typo_class_name . '> ';
        $author .= $author_text_render;
        $author .= '</span>';
        return $author;
      } 
    } else {
      // Link to author page.
      $author_link = get_author_posts_url( get_the_author_meta( 'ID' ) );
      if ( $settings['style'] === 'with-gravatar' ) {
        $author = '<a class="has-gravatar' . esc_attr($author_typo) . '" href="' . $author_link . '">';
        $author .= $author_avatar_render;
        $author .= '</a>';
        return $author;
      } else {
        $author = '<a' . $typo_class_name . ' href="' . $author_link . '"> ';
        $author .= $author_text_render;
        $author .= '</a>';
        return $author;
      }
    }

  }

  public function get_taxonomies($post, $settings) {
    $output = '';
    $assigned_terms = [];

    $tax_style = $settings['style'];
    $parent_only = $settings['display'] === 'parent-only' ? true : false;
    $typo = $this->typography_class_name($settings['typography'], true);

    if ( $this->block_attributes['taxonomies'] ) {
      foreach($this->block_attributes['taxonomies'] as $term_id) {
        $term_data = get_term($term_id);
        if ( ! is_wp_error($term_data) && has_term($term_id, $term_data->taxonomy ) ) {

          $assigned_term = get_term($term_id);

          if ( $parent_only && $assigned_term->parent ) {
            $assigned_terms[] = get_term($assigned_term->parent);
          } else {
            $assigned_terms[] = get_term($term_id);
          }

        }
      }
    } else {
      // No explicit taxonomies set, so let's get the post type's default taxonomy for common post types
      $post_type = get_post_type($post);
      if ( $post_type === 'post' ) {
        $assigned_terms = get_the_category($post);
      } else {
        // Make a guess at the taxonomy name
        $assigned_terms = get_the_terms(
            $post,
            apply_filters('nectar_blocks_post_grid_default_taxonomy', $post_type . '_category', $post_type)
        );
      }
    }

    if ($assigned_terms && ! is_wp_error($assigned_terms)) {
      // Make sure we don't have duplicates
      $assigned_terms = array_unique($assigned_terms, SORT_REGULAR);

      foreach ($assigned_terms as $term) {
        $output .= '<a class="style--' . esc_attr($tax_style) . esc_attr($typo) . '" href="' . get_term_link($term) . '">' . esc_html($term->name) . '</a>';
      }
    }
    return apply_filters('nectar_blocks_post_grid_taxonomies', $output);
  }

  public function get_date($post, $settings) {
    $typo_class_name = '';
    if ( array_key_exists('typography', $settings) && ! empty($settings['typography']) ) {
      $typo_class_name = ' class="' . $this->typography_class_name($settings['typography']) . '"';
    }
    return '<span' . $typo_class_name . '>' . get_the_date() . '</span>';
  }

  public function get_title($post, $settings) {
    $typo_class_name = '';
    if ( array_key_exists('typography', $settings) && ! empty($settings['typography']) ) {
      $typo_class_name = ' class="' . $this->typography_class_name($settings['typography']) . '"';
    }
    $allowed_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
    if (array_key_exists('headingLevel', $settings) &&
        in_array($settings['headingLevel'], $allowed_tags) ) {
        $h_level = esc_attr($settings['headingLevel']);

        $markup = '<a href="' . get_permalink() . '">';
        $markup .= '<' . $h_level . $typo_class_name . '>' . get_the_title() . '</' . $h_level . '>';
        $markup .= '</a>';
        return $markup;
      }
    return false;
  }

  public function get_excerpt($post, $settings) {
    $typo_class_name = '';
    if ( array_key_exists('typography', $settings) && ! empty($settings['typography']) ) {
      $typo_class_name = ' class="' . $this->typography_class_name($settings['typography']) . '"';
    }
    $excerpt_length = intval($settings['length']);
    return '<p' . $typo_class_name . '>' . $this->nectar_excerpt( $excerpt_length ) . '</p>';
  }

  public function get_read_more($post, $settings) {

    $typo_class_name = '';
    if ( array_key_exists('typography', $settings) && ! empty($settings['typography']) ) {
      $typo_class_name = ' class="' . $this->typography_class_name($settings['typography']) . '"';
    }

    $arrow = '<svg width="20" height="20" aria-hidden="true" viewBox="0 0 22 22">
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 12.3H7.8C6 12.3 4.5 10.8 4.5 9V6.5"></path>
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
        <path d="m13.5 17.5 5-5M13.5 7.5l5 5"></path>
      </g>
    </svg>';

    $read_more = '<a href="' . get_permalink() . '">
      <span' . $typo_class_name . '>' . esc_html__('Read More', 'nectar-blocks') . '</span>'
      . $arrow .
    '</a>';

    return $read_more;
  }

  public function get_custom($post, $settings) {
    if ( ! isset($post->ID) || $post->ID === 0 || empty($settings['value'])) {
      return;
    }

    $custom_meta_key = sanitize_text_field($settings['value']);
    $custom_meta = get_post_meta($post->ID, $custom_meta_key, true);

    if ( ! $custom_meta ) {
      return;
    }

    $custom_meta = apply_filters('nectar_blocks_post_grid_custom_field_value', $custom_meta, $custom_meta_key, $post->ID);

    $before_text = '';
    if (array_key_exists('beforeText', $settings) && ! empty($settings['beforeText']) ) {
      $before_text = '<span>' . esc_html($settings['beforeText']) . '</span>';
    }

    $after_text = '';
    if ( array_key_exists('afterText', $settings) && ! empty($settings['afterText']) ) {
      $after_text = '<span>' . esc_html($settings['afterText']) . '</span>';
    }

    $typo_class_name = '';
    if ( array_key_exists('typography', $settings) && ! empty($settings['typography']) ) {
      $typo_class_name = ' class="' . $this->typography_class_name($settings['typography']) . '"';
    }

    return '<span' . $typo_class_name . '>' .
        $before_text .
        '<span>' . do_shortcode(wp_kses_post($custom_meta)) . '</span>' .
        $after_text .
      '</span>';
  }

  public function get_featured_image($post) {
    $featured_image = '';
    if (has_post_thumbnail($post)) {
      $featured_image = get_the_post_thumbnail( $post->ID, $this->block_attributes['imageSize'] );
    }
    return $featured_image;
  }

  function get_pagination_markup($data) {

    $total_pages = $data['totalPages'];
    $markup = '';
    if ( $total_pages > 1 ) {

      $permalink_structure = get_option( 'permalink_structure' );
      $query_type = ( count($_GET) ) ? '&' : '?';
      $format = empty( $permalink_structure ) ? $query_type . 'paged=%#%' : 'page/%#%/';
      $current = isset($this->block_attributes['current_page']) ? $this->block_attributes['current_page'] : 1;

      $markup .= '<nav role="navigation" aria-label="' . esc_attr__("Pagination Navigation", 'nectar-blocks') . '">';

      $left_arrow = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"></path></svg>';
      $right_arrow = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.1714 12.0007L8.22168 7.05093L9.63589 5.63672L15.9999 12.0007L9.63589 18.3646L8.22168 16.9504L13.1714 12.0007Z"></path></svg>';

      $markup .= paginate_links([
        'base' => str_replace( 999999999, '%#%', esc_url( get_pagenum_link( 999999999 ) ) ),
        'format' => $format,
        'type' => 'list',
        'current' => $current,
        'total' => $total_pages,
        'prev_text' => $left_arrow,
        'next_text' => $right_arrow
      ]);

      $markup .= '</nav>';
    }

    return apply_filters('nectar_blocks_post_grid_pagination', $markup);
  }

  function get_bg_animation_attrs() {
    if ( isset($this->block_attributes['postGridStyle']['bgScrollAnimation']['enabled']) &&
         $this->block_attributes['postGridStyle']['bgScrollAnimation']['enabled'] === true
    ) {

      return esc_attr(wp_json_encode($this->block_attributes['postGridStyle']['bgScrollAnimation']));
    }

    return '';
  }

  function get_query_data() {
    $args = $this->build_args();
    $data = [
      'posts' => []
    ];
    $posts_query = new \WP_Query( $args );

    // Pagination.
    $data['pagination'] = [
      'totalPages' => $posts_query->max_num_pages,
      'totalPosts' => $posts_query->found_posts,
      'postsPerPage' => $posts_query->query_vars['posts_per_page'],
      'currentPage' => $posts_query->query_vars['paged'] ? $posts_query->query_vars['paged'] : 1,
      'nextPage' => $posts_query->query_vars['paged'] ? $posts_query->query_vars['paged'] + 1 : 2,
      'prevPage' => $posts_query->query_vars['paged'] ? $posts_query->query_vars['paged'] - 1 : 0,
    ];

    // Compatibility mode for offset in pagination.
    // We have to query all posts and then manually
    // slice the array into pagination chunks to ensure
    // the correct order.
    if ( $this->offset_compat_mode ) {

      $args['posts_per_page'] = '-1';
      $args['offset'] = 0;

      $posts_query = new \WP_Query( $args );

      $offset = $this->block_attributes['postOffset']; 
      $limit = $this->block_attributes['postsPerPage'];

      // Manually slicing the posts array
      $posts_query->posts = array_slice($posts_query->posts, $offset, $limit);

      // Update post count and found posts to reflect the sliced data
      $posts_query->post_count = count($posts_query->posts);
    }

    // Posts.
    if ($posts_query->have_posts()) {
      while ( $posts_query->have_posts() ) {
        $posts_query->the_post();
        global $post;

        $active_meta = [];
        $display_meta = $this->block_attributes['displayMeta'];
        foreach( $display_meta as $settings ) {
          $type = str_replace("-", "_", $settings['type'], );
          $active_meta[] = [
            'type' => $type,
            'settings' => $settings,
            'output' => is_callable( [$this, 'get_' . $type] ) ? call_user_func([$this, 'get_' . $type], $post, $settings, $display_meta) : ''
          ];
        }

        $data['posts'][] = [
          'id' => get_the_id(),
          'has_featured_image' => has_post_thumbnail($post) ? true : false,
          'featured_image' => $this->get_featured_image($post),
          'permalink' => get_permalink(),
          'meta' => $active_meta
        ];
      }

      wp_reset_postdata();
    }

    return $data;
  }

  function render() {
    $loader = new FilesystemLoader(__DIR__);
    $twig = new Environment($loader);

    $query_data = $this->get_query_data();
    $post_data = $query_data['posts'];
    $pagination_data = $query_data['pagination'];

    $pagination_markup = $this->get_pagination_markup($pagination_data);
    $bg_animation_attrs = $this->get_bg_animation_attrs();

    if (count($post_data) > 0) {
      return $twig->render('./templates/template.twig', [
        'blockId' => $this->block_attributes['blockId'],
        'queryData' => $post_data,
        'pagination' => $pagination_markup,
        'paginationData' => $pagination_data,
        'currentPage' => isset($this->block_attributes['current_page']) ? $this->block_attributes['current_page'] : 1,
        'i18n' => [
          'load_more' => __('Load More', 'nectar-blocks'),
          'previous' => __('Previous', 'nectar-blocks'),
          'next' => __('Next', 'nectar-blocks'),
        ],
        'foundPosts' => count($post_data),
        'settings' => $this->block_attributes,
        'bgAnimation' => $bg_animation_attrs,
        'actionsHooks' => [
          'nectar_post_grid_item_content_before' => apply_filters('nectar_post_grid_item_content_before', ''),
          'nectar_post_grid_item_content_after' => apply_filters('nectar_post_grid_item_content_after', ''),
        ]
      ]);
    } else {
      return $twig->render('./templates/empty_posts.twig', [
        'i18n' => [
          'no_posts' => __('No posts found.', 'nectar-blocks'),
          'no_posts_desc' => __('Try adjusting your query parameters.', 'nectar-blocks')
        ],
      ]);
    }
  }
};
