<?php
/**
 * Post Feed REST API Controller
 *
 * Provides REST API endpoints for the Post Feed block.
 * Replicates 1:1 Voxel's post-feed.php PHP lifecycle for data preparation.
 *
 * Endpoints:
 * - GET /voxel-fse/v1/post-feed/config - Get general configuration
 * - GET /voxel-fse/v1/post-feed/post-types - Get available Voxel post types
 * - GET /voxel-fse/v1/post-feed/card-templates - Get card templates for a post type
 * - GET /voxel-fse/v1/post-feed/filters - Get available filters for a post type
 * - GET /voxel-fse/v1/post-feed/search-posts - Search posts for manual selection
 * - POST /voxel-fse/v1/post-feed/search-with-filters - Execute search with pre-configured filters
 *
 * 1:1 PARITY Evidence:
 * - Voxel widget: themes/voxel/app/widgets/post-feed.php (render method, lines 1441-1630)
 * - Filter lifecycle: set_elementor_config() then get_default_value_from_elementor()
 * - Search results: \Voxel\get_search_results() with proper filter args
 * - Card templates: $post_type->templates->get_custom_templates()['card']
 *
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Post_Feed_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes(): void {
		$namespace = 'voxel-fse/v1';

		// GET /post-feed/debug - Debug endpoint for post types
		register_rest_route( $namespace, '/post-feed/debug', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_debug' ],
			'permission_callback' => '__return_true',
		] );

		// GET /post-feed/config - Get general configuration
		register_rest_route( $namespace, '/post-feed/config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_config' ],
			'permission_callback' => '__return_true', // Public - needed for editor
		] );

		// GET /post-feed/post-types - Get available Voxel post types
		register_rest_route( $namespace, '/post-feed/post-types', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_post_types' ],
			'permission_callback' => '__return_true', // Public - needed for editor
		] );

		// GET /post-feed/card-templates - Get card templates for a post type
		register_rest_route( $namespace, '/post-feed/card-templates', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_card_templates' ],
			'permission_callback' => '__return_true', // Public - needed for editor
			'args'                => [
				'post_type' => [
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// GET /post-feed/search-posts - Search posts for manual selection
		register_rest_route( $namespace, '/post-feed/search-posts', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'search_posts' ],
			'permission_callback' => function() {
				return current_user_can( 'edit_posts' );
			},
			'args'                => [
				'post_type' => [
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
				'search' => [
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'per_page' => [
					'type'              => 'integer',
					'default'           => 20,
					'sanitize_callback' => 'absint',
				],
			],
		] );

		// GET /post-feed/filters - Get available filters for a post type
		// Evidence: Voxel post-feed.php:1374-1438 builds filter repeater per post type
		register_rest_route( $namespace, '/post-feed/filters', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_filters' ],
			'permission_callback' => '__return_true', // Public - needed for editor
			'args'                => [
				'post_type' => [
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// POST /post-feed/search-with-filters - Execute search with pre-configured filter values
		// 1:1 PARITY: Replicates post-feed.php:1443-1506 (search-filters source mode)
		// This properly calls set_elementor_config() and get_default_value_from_elementor()
		register_rest_route( $namespace, '/post-feed/search-with-filters', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'search_with_filters' ],
			'permission_callback' => '__return_true', // Public - needed for frontend
			'args'                => [
				'post_type' => [
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
				'filters' => [
					'type'              => 'array',
					'default'           => [],
				],
				'limit' => [
					'type'              => 'integer',
					'default'           => 10,
					'sanitize_callback' => 'absint',
				],
				'offset' => [
					'type'              => 'integer',
					'default'           => 0,
					'sanitize_callback' => 'absint',
				],
				'page' => [
					'type'              => 'integer',
					'default'           => 1,
					'sanitize_callback' => 'absint',
				],
				'exclude' => [
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'priority_filter' => [
					'type'              => 'boolean',
					'default'           => false,
				],
				'priority_min' => [
					'type'              => 'integer',
					'default'           => 0,
					'sanitize_callback' => 'absint',
				],
				'priority_max' => [
					'type'              => 'integer',
					'default'           => 0,
					'sanitize_callback' => 'absint',
				],
				'card_template' => [
					'type'              => 'string',
					'default'           => 'main',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'get_total_count' => [
					'type'              => 'boolean',
					'default'           => false,
				],
			],
		] );
	}

	/**
	 * Debug endpoint to diagnose post types loading
	 *
	 * @return \WP_REST_Response
	 */
	public function get_debug(): \WP_REST_Response {
		$debug = [
			'voxel_class_exists'    => class_exists( '\Voxel\Post_Type' ),
			'voxel_get_function'    => function_exists( '\Voxel\get' ),
			'wp_post_types'         => [],
			'voxel_config'          => null,
			'voxel_all_types'       => [],
			'voxel_managed_types'   => [],
		];

		// Get all WordPress post types
		$wp_types = get_post_types( [ 'public' => true ], 'objects' );
		foreach ( $wp_types as $pt ) {
			$debug['wp_post_types'][] = [
				'name'  => $pt->name,
				'label' => $pt->label,
			];
		}

		// Check Voxel config
		if ( function_exists( '\Voxel\get' ) ) {
			$voxel_config = \Voxel\get( 'post_types', [] );
			$debug['voxel_config'] = array_keys( $voxel_config );
		}

		// Get all Voxel types
		if ( class_exists( '\Voxel\Post_Type' ) ) {
			$all_types = \Voxel\Post_Type::get_all();
			foreach ( $all_types as $pt ) {
				$debug['voxel_all_types'][] = [
					'key'           => $pt->get_key(),
					'label'         => $pt->get_label(),
					'is_managed'    => $pt->is_managed_by_voxel(),
				];
			}

			$managed_types = \Voxel\Post_Type::get_voxel_types();
			foreach ( $managed_types as $pt ) {
				$debug['voxel_managed_types'][] = [
					'key'   => $pt->get_key(),
					'label' => $pt->get_label(),
				];
			}
		}

		return rest_ensure_response( $debug );
	}

	/**
	 * Get general configuration for the Post Feed block
	 *
	 * Returns post types and other configuration needed by the editor.
	 * Prioritizes Voxel-managed types, but includes all public post types as fallback.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_config(): \WP_REST_Response {
		$post_types = [];
		$added_keys = [];

		// First, add Voxel-managed post types (priority)
		if ( class_exists( '\Voxel\Post_Type' ) ) {
			foreach ( \Voxel\Post_Type::get_voxel_types() as $post_type ) {
				$key = $post_type->get_key();
				$post_types[] = [
					'key'      => $key,
					'label'    => $post_type->get_label(),
					'singular' => $post_type->get_singular_name(),
					'plural'   => $post_type->get_plural_name(),
					'managed'  => true,
				];
				$added_keys[ $key ] = true;
			}
		}

		// Then, add all public post types not already added (for sites without Voxel config)
		// Exclude WordPress system post types
		$excluded = [ 'attachment', 'revision', 'nav_menu_item', 'custom_css', 'customize_changeset',
			'oembed_cache', 'user_request', 'wp_block', 'wp_template', 'wp_template_part',
			'wp_global_styles', 'wp_navigation', 'wp_font_family', 'wp_font_face', 'templately_library',
			'_vx_catalog' ];

		$wp_post_types = get_post_types( [ 'public' => true ], 'objects' );
		foreach ( $wp_post_types as $pt ) {
			if ( isset( $added_keys[ $pt->name ] ) || in_array( $pt->name, $excluded, true ) ) {
				continue;
			}

			// Try to get Voxel wrapper for additional info
			$voxel_pt = class_exists( '\Voxel\Post_Type' ) ? \Voxel\Post_Type::get( $pt->name ) : null;

			$post_types[] = [
				'key'      => $pt->name,
				'label'    => $voxel_pt ? $voxel_pt->get_label() : $pt->label,
				'singular' => $voxel_pt ? $voxel_pt->get_singular_name() : $pt->labels->singular_name,
				'plural'   => $voxel_pt ? $voxel_pt->get_plural_name() : $pt->labels->name,
				'managed'  => false,
			];
		}

		return rest_ensure_response( [
			'postTypes'   => $post_types,
			'searchForms' => [], // Placeholder for future search form integration
			'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
			'restUrl'     => rest_url( 'voxel-fse/v1/' ),
		] );
	}

	/**
	 * Get available Voxel post types
	 *
	 * @return \WP_REST_Response
	 */
	public function get_post_types(): \WP_REST_Response {
		$post_types = [];

		// Check if Voxel Post_Type class exists
		if ( class_exists( '\Voxel\Post_Type' ) ) {
			foreach ( \Voxel\Post_Type::get_voxel_types() as $post_type ) {
				$post_types[] = [
					'key'      => $post_type->get_key(),
					'label'    => $post_type->get_label(),
					'singular' => $post_type->get_singular_name(),
					'plural'   => $post_type->get_plural_name(),
				];
			}
		}

		return rest_ensure_response( [
			'postTypes' => $post_types,
		] );
	}

	/**
	 * Get card templates for a specific post type
	 *
	 * Evidence from Voxel post-feed.php:204-212:
	 * $card_templates = $post_type->templates->get_custom_templates()['card'];
	 * Options: 'main' => 'Main template' + array_column( $card_templates, 'label', 'id' )
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_card_templates( \WP_REST_Request $request ): \WP_REST_Response {
		$post_type_key = $request->get_param( 'post_type' );
		$templates     = [];

		// Always include 'main' as the default
		$templates[] = [
			'id'    => 'main',
			'label' => __( 'Main template', 'voxel-fse' ),
		];

		// Check if Voxel Post_Type class exists
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return rest_ensure_response( [
				'templates' => $templates,
				'postType'  => $post_type_key,
			] );
		}

		// Get the post type
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return rest_ensure_response( [
				'templates' => $templates,
				'postType'  => $post_type_key,
				'error'     => 'Post type not found',
			] );
		}

		// Get custom card templates
		// Evidence: themes/voxel/app/widgets/post-feed.php:204
		if ( method_exists( $post_type->templates, 'get_custom_templates' ) ) {
			$custom_templates = $post_type->templates->get_custom_templates();

			if ( isset( $custom_templates['card'] ) && is_array( $custom_templates['card'] ) ) {
				foreach ( $custom_templates['card'] as $template ) {
					$templates[] = [
						'id'    => (string) ( $template['id'] ?? '' ),
						'label' => $template['label'] ?? '',
					];
				}
			}
		}

		return rest_ensure_response( [
			'templates' => $templates,
			'postType'  => $post_type_key,
		] );
	}

	/**
	 * Search posts for manual selection
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function search_posts( \WP_REST_Request $request ): \WP_REST_Response {
		$post_type_key = $request->get_param( 'post_type' );
		$search        = $request->get_param( 'search' );
		$per_page      = $request->get_param( 'per_page' );

		$args = [
			'post_type'      => $post_type_key,
			'posts_per_page' => min( $per_page, 50 ), // Cap at 50
			'post_status'    => 'publish',
			'orderby'        => 'title',
			'order'          => 'ASC',
		];

		// Add search if provided
		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$query = new \WP_Query( $args );
		$posts = [];

		foreach ( $query->posts as $post ) {
			$thumbnail_url = get_the_post_thumbnail_url( $post->ID, 'thumbnail' );

			$posts[] = [
				'id'        => $post->ID,
				'title'     => $post->post_title,
				'status'    => $post->post_status,
				'thumbnail' => $thumbnail_url ?: '',
				'editLink'  => get_edit_post_link( $post->ID, 'raw' ),
			];
		}

		return rest_ensure_response( [
			'posts'    => $posts,
			'total'    => $query->found_posts,
			'postType' => $post_type_key,
		] );
	}

	/**
	 * Get available filters for a post type
	 *
	 * 1:1 PARITY Evidence: Voxel post-feed.php:1374-1438
	 * - Iterates $post_type->get_filters()
	 * - Gets filter key, label, type
	 * - Gets elementor controls for each filter
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_filters( \WP_REST_Request $request ): \WP_REST_Response {
		$post_type_key = $request->get_param( 'post_type' );

		// Check if Voxel Post_Type class exists
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return rest_ensure_response( [
				'filters'  => [],
				'postType' => $post_type_key,
				'error'    => 'Voxel not active',
			] );
		}

		// Get the post type
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return rest_ensure_response( [
				'filters'  => [],
				'postType' => $post_type_key,
				'error'    => 'Post type not found',
			] );
		}

		$filters_data = [];

		// Evidence: post-feed.php:1386-1389 iterates post_type->get_filters()
		foreach ( $post_type->get_filters() as $filter ) {
			$filter_info = [
				'key'         => $filter->get_key(),
				'label'       => $filter->get_label(),
				'type'        => $filter->get_type(),
				'description' => $filter->get_description(),
				'icon'        => $filter->get_icon(),
			];

			// Get Elementor controls for this filter
			// Evidence: post-feed.php:1402-1425
			$elementor_controls = $filter->get_elementor_controls();
			$controls_config    = [];

			foreach ( $elementor_controls as $control_key => $control_args ) {
				$full_key = $control_args['full_key'] ?? sprintf( '%s:%s', $filter->get_key(), $control_key );

				$controls_config[] = [
					'key'      => $control_key,
					'fullKey'  => $full_key,
					'label'    => $control_args['label'] ?? $control_key,
					'type'     => $control_args['type'] ?? 'text',
					'default'  => $control_args['default'] ?? null,
					'options'  => $control_args['options'] ?? null,
				];
			}

			$filter_info['controls'] = $controls_config;
			$filters_data[]          = $filter_info;
		}

		return rest_ensure_response( [
			'filters'  => $filters_data,
			'postType' => $post_type_key,
		] );
	}

	/**
	 * Execute search with pre-configured filter values
	 *
	 * 1:1 PARITY: Replicates Voxel post-feed.php:1443-1506 (search-filters source mode)
	 *
	 * Critical lifecycle steps replicated:
	 * 1. Get post type and validate
	 * 2. Iterate through filter_list from request
	 * 3. For each filter: call set_elementor_config($controls)
	 * 4. For each filter: call get_default_value_from_elementor($controls) to get value
	 * 5. Build $args array with filter values
	 * 6. Call \Voxel\get_search_results() with proper options
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function search_with_filters( \WP_REST_Request $request ): \WP_REST_Response {
		$post_type_key  = $request->get_param( 'post_type' );
		$filter_list    = $request->get_param( 'filters' );
		$limit          = $request->get_param( 'limit' );
		$offset         = $request->get_param( 'offset' );
		$page           = $request->get_param( 'page' );
		$exclude_str    = $request->get_param( 'exclude' );
		$priority_filter = $request->get_param( 'priority_filter' );
		$priority_min   = $request->get_param( 'priority_min' );
		$priority_max   = $request->get_param( 'priority_max' );
		$card_template  = $request->get_param( 'card_template' );
		$get_total_count = $request->get_param( 'get_total_count' );

		// Check if Voxel functions exist
		if ( ! class_exists( '\Voxel\Post_Type' ) || ! function_exists( '\Voxel\get_search_results' ) ) {
			return rest_ensure_response( [
				'success' => false,
				'error'   => 'Voxel not active',
			] );
		}

		// Get the post type
		// Evidence: post-feed.php:1444
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return rest_ensure_response( [
				'success' => false,
				'error'   => 'Post type not found',
			] );
		}

		// Build args array
		// Evidence: post-feed.php:1449-1450
		$args         = [];
		$args['type'] = $post_type->get_key();

		// Process filter list - THIS IS THE CRITICAL PARITY SECTION
		// Evidence: post-feed.php:1456-1466
		if ( is_array( $filter_list ) ) {
			foreach ( $filter_list as $filter_config ) {
				$filter_key = $filter_config['filter'] ?? $filter_config['ts_choose_filter'] ?? null;

				if ( ! $filter_key ) {
					continue;
				}

				$filter = $post_type->get_filter( $filter_key );
				if ( ! $filter ) {
					continue;
				}

				// Build controls array from filter config
				// Evidence: post-feed.php:1459-1461
				$controls = [];
				$elementor_controls = $filter->get_elementor_controls();

				foreach ( $elementor_controls as $control_key => $control_def ) {
					$full_key = $control_def['full_key'] ?? sprintf( '%s:%s', $filter->get_key(), $control_key );

					// Look for value in filter_config using full_key or control_key
					$value = $filter_config[ $full_key ] ?? $filter_config[ $control_key ] ?? null;
					$controls[ $control_key ] = $value;
				}

				// CRITICAL: Call set_elementor_config() before getting default value
				// Evidence: post-feed.php:1463
				$filter->set_elementor_config( $controls );

				// Get the filter value using Voxel's method
				// Evidence: post-feed.php:1464
				$filter_value = $filter->get_default_value_from_elementor( $controls );

				if ( $filter_value !== null ) {
					$args[ $filter->get_key() ] = $filter_value;
				}
			}
		}

		// Parse exclude IDs
		// Evidence: post-feed.php:1472
		$exclude = array_filter( array_map( 'absint', explode( ',', $exclude_str ) ) );

		// Handle priority filter
		// Evidence: post-feed.php:1474-1479
		$priority_min_val = null;
		$priority_max_val = null;
		if ( $priority_filter ) {
			$priority_min_val = $priority_min;
			$priority_max_val = $priority_max;
		}

		// Get card template ID
		// Evidence: post-feed.php:1468-1471
		$template_id = null;
		if ( $card_template && $card_template !== 'main' && is_numeric( $card_template ) ) {
			$template_id = (int) $card_template;
		}

		// Capture any output buffered by Voxel (some methods echo styles/scripts)
		// Evidence: Search form controller uses ob_start for similar reasons
		ob_start();

		// Execute the search
		// Evidence: post-feed.php:1481-1488
		$results = \Voxel\get_search_results( $args, [
			'limit'          => $limit,
			'offset'         => $offset,
			'template_id'    => $template_id,
			'exclude'        => $exclude,
			'priority_min'   => $priority_min_val,
			'priority_max'   => $priority_max_val,
			'get_total_count' => $get_total_count,
		] );

		// Clean up any buffered output
		$buffered = ob_get_clean();

		// Calculate pagination info
		$has_prev = $page > 1;
		$has_next = $results['has_next'] ?? false;

		// Build display count
		// Evidence: Voxel search-controller.php:77-78
		$total_count   = $results['total_count'] ?? 0;
		$result_count  = count( $results['ids'] ?? [] );
		$display_count = '';

		if ( function_exists( '\Voxel\count_format' ) ) {
			$display_count = \Voxel\count_format( $result_count, $total_count );
		} else {
			$display_count = $result_count . ( $total_count > $result_count ? ' of ' . $total_count : '' );
		}

		return rest_ensure_response( [
			'success'      => true,
			'html'         => ( $results['styles'] ?? '' ) . ( $results['render'] ?? '' ) . ( $results['scripts'] ?? '' ),
			'ids'          => $results['ids'] ?? [],
			'hasResults'   => ! empty( $results['ids'] ),
			'hasPrev'      => $has_prev,
			'hasNext'      => $has_next,
			'totalCount'   => $total_count,
			'displayCount' => $display_count,
			'templateId'   => $results['template_id'] ?? null,
			'page'         => $page,
		] );
	}
}
