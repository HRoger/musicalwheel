<?php
/**
 * Post Feed REST API Controller
 *
 * Provides REST API endpoints for the Post Feed block.
 * Fetches card templates and configuration data.
 *
 * Endpoints:
 * - GET /voxel-fse/v1/post-feed/post-types - Get available Voxel post types
 * - GET /voxel-fse/v1/post-feed/card-templates - Get card templates for a post type
 * - GET /voxel-fse/v1/post-feed/search-posts - Search posts for manual selection
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/post-feed.php (lines 204-232)
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
}
