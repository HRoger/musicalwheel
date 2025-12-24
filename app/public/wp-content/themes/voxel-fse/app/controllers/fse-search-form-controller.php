<?php
/**
 * Search Form Block Controller
 *
 * Handles REST API endpoints for the Search Form block.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

use VoxelFSE\Utils\Icon_Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Search_Form_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_endpoints' );
	}

	/**
	 * Register REST API endpoints
	 */
	protected function register_endpoints() {
		// Endpoint: /wp-json/voxel-fse/v1/search-form/post-types
		register_rest_route( 'voxel-fse/v1', '/search-form/post-types', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_types' ],
			'permission_callback' => [ $this, 'check_editor_permission' ],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/search-form/filters
		register_rest_route( 'voxel-fse/v1', '/search-form/filters', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_type_filters' ],
			'permission_callback' => [ $this, 'check_editor_permission' ],
			'args'                => [
				'post_type' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/search-form/filter-options
		register_rest_route( 'voxel-fse/v1', '/search-form/filter-options', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_filter_options' ],
			'permission_callback' => '__return_true', // Public for frontend
			'args'                => [
				'post_type' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'filter'    => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// Public endpoint for frontend: /wp-json/voxel-fse/v1/search-form/frontend-config
		// Returns post types and their filters for specified post type keys
		register_rest_route( 'voxel-fse/v1', '/search-form/frontend-config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_frontend_config' ],
			'permission_callback' => '__return_true', // Public for frontend hydration
			'args'                => [
				'post_types' => [
					'required'          => false,
					'type'              => 'string', // Comma-separated list of post type keys
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );
	}

	/**
	 * Check if user has editor permissions
	 *
	 * @return bool
	 */
	public function check_editor_permission() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get all Voxel post types
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_post_types( \WP_REST_Request $request ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return new \WP_Error(
				'voxel_not_active',
				__( 'Voxel theme is not active', 'voxel-fse' ),
				[ 'status' => 400 ]
			);
		}

		$post_types = \Voxel\Post_Type::get_voxel_types();
		$result     = [];

		foreach ( $post_types as $post_type ) {
			// Get filters for this post type
			$filters      = $post_type->get_filters();
			$filters_data = [];

			foreach ( $filters as $filter ) {
				$filters_data[] = [
					'key'   => $filter->get_key(),
					'label' => $filter->get_label(),
					'type'  => $filter->get_type(),
					// Include icon markup - matches Voxel's get_frontend_config()
					// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
					'icon'  => Icon_Processor::get_icon_markup( $filter->get_icon() ),
					'props' => $this->get_filter_props( $filter ),
				];
			}

			$result[] = [
				'key'      => $post_type->get_key(),
				'label'    => $post_type->get_label(),
				'singular' => $post_type->get_singular_name(),
				'plural'   => $post_type->get_plural_name(),
				// Include icon markup for post type
				'icon'     => Icon_Processor::get_icon_markup( $post_type->get_icon() ),
				'filters'  => $filters_data,
			];
		}

		// Reverse order to match Voxel admin display order
		// Note: Voxel parent uses ts_choose_post_types widget settings for order
		$result = array_reverse( $result );

		return rest_ensure_response( $result );
	}

	/**
	 * Get filters for a specific post type
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_post_type_filters( \WP_REST_Request $request ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return new \WP_Error(
				'voxel_not_active',
				__( 'Voxel theme is not active', 'voxel-fse' ),
				[ 'status' => 400 ]
			);
		}

		$post_type_key = $request->get_param( 'post_type' );
		$post_type     = \Voxel\Post_Type::get( $post_type_key );

		if ( ! $post_type ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'Invalid post type', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		$filters = $post_type->get_filters();
		$result  = [];

		foreach ( $filters as $filter ) {
			$filter_data = [
				'key'   => $filter->get_key(),
				'label' => $filter->get_label(),
				'type'  => $filter->get_type(),
				'props' => $this->get_filter_props( $filter ),
			];

			$result[] = $filter_data;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Get filter options (for terms, relations, etc.)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_filter_options( \WP_REST_Request $request ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return new \WP_Error(
				'voxel_not_active',
				__( 'Voxel theme is not active', 'voxel-fse' ),
				[ 'status' => 400 ]
			);
		}

		$post_type_key = $request->get_param( 'post_type' );
		$filter_key    = $request->get_param( 'filter' );
		$post_type     = \Voxel\Post_Type::get( $post_type_key );

		if ( ! $post_type ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'Invalid post type', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		$filter = $post_type->get_filter( $filter_key );

		if ( ! $filter ) {
			return new \WP_Error(
				'invalid_filter',
				__( 'Invalid filter', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		$options = [];

		// Get options based on filter type
		switch ( $filter->get_type() ) {
			case 'terms':
				$options = $this->get_terms_options( $filter );
				break;
			case 'order-by':
				$options = $this->get_order_by_options( $filter );
				break;
			case 'relations':
				$options = $this->get_relations_options( $filter );
				break;
			default:
				$options = [];
		}

		return rest_ensure_response( $options );
	}

	/**
	 * Get frontend configuration (public endpoint)
	 *
	 * Returns post types and their filters for frontend hydration.
	 * Only returns data for specified post type keys (for security).
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_frontend_config( \WP_REST_Request $request ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return new \WP_Error(
				'voxel_not_active',
				__( 'Voxel theme is not active', 'voxel-fse' ),
				[ 'status' => 400 ]
			);
		}

		// Get requested post type keys (comma-separated)
		$post_types_param = $request->get_param( 'post_types' );
		$requested_keys   = $post_types_param ? array_map( 'trim', explode( ',', $post_types_param ) ) : [];

		$all_post_types = \Voxel\Post_Type::get_voxel_types();
		$result         = [];

		foreach ( $all_post_types as $post_type ) {
			$key = $post_type->get_key();

			// If specific post types requested, only include those
			if ( ! empty( $requested_keys ) && ! in_array( $key, $requested_keys, true ) ) {
				continue;
			}

			// Get filters for this post type
			$filters      = $post_type->get_filters();
			$filters_data = [];

			foreach ( $filters as $filter ) {
				$filters_data[] = [
					'key'   => $filter->get_key(),
					'label' => $filter->get_label(),
					'type'  => $filter->get_type(),
					// Include icon markup - matches Voxel's get_frontend_config()
					// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
					'icon'  => Icon_Processor::get_icon_markup( $filter->get_icon() ),
					'props' => $this->get_filter_props( $filter ),
				];
			}

			$result[] = [
				'key'      => $key,
				'label'    => $post_type->get_label(),
				'singular' => $post_type->get_singular_name(),
				'plural'   => $post_type->get_plural_name(),
				// Include icon markup for post type
				'icon'     => Icon_Processor::get_icon_markup( $post_type->get_icon() ),
				'filters'  => $filters_data,
			];
		}

		// Reverse order to match Voxel admin display order
		// Note: Voxel parent uses ts_choose_post_types widget settings for order
		$result = array_reverse( $result );

		return rest_ensure_response( $result );
	}

	/**
	 * Get filter props based on filter type
	 *
	 * @param mixed $filter
	 * @return array
	 */
	private function get_filter_props( $filter ) {
		$props = [];

		switch ( $filter->get_type() ) {
			case 'keywords':
				$props = [
					'placeholder' => $filter->get_prop( 'placeholder' ) ?? '',
				];
				break;

			case 'range':
				$props = [
					'min'       => $filter->get_prop( 'min' ) ?? 0,
					'max'       => $filter->get_prop( 'max' ) ?? 100,
					'step'      => $filter->get_prop( 'step' ) ?? 1,
					'format'    => $filter->get_prop( 'format' ) ?? 'number',
					'compare'   => $filter->get_prop( 'compare' ) ?? 'equals',
				];
				break;

			case 'stepper':
				$props = [
					'min'       => $filter->get_prop( 'min' ) ?? 0,
					'max'       => $filter->get_prop( 'max' ) ?? 10,
					'step'      => $filter->get_prop( 'step' ) ?? 1,
					'default'   => $filter->get_prop( 'default' ) ?? 0,
				];
				break;

			case 'terms':
				// Terms filter uses frontend_props() to get taxonomy through source field
				// Evidence: themes/voxel/app/post-types/filters/terms-filter.php:138-201
				if ( method_exists( $filter, 'frontend_props' ) ) {
					// Initialize elementor_config to prevent "Undefined array key" warnings
					// Evidence: themes/voxel/app/post-types/filters/terms-filter.php:151
					// The parent theme expects this property to be set when calling frontend_props()
					// Use the public setter method from base-filter.php:335
					if ( method_exists( $filter, 'set_elementor_config' ) ) {
						$filter->set_elementor_config( [
							'hide_empty_terms' => 'no',  // Default: show all terms
							'display_as'       => 'popup', // Default display mode
						] );
					}
					
					$frontend = $filter->frontend_props();
					$props = [
						'taxonomy'      => $frontend['taxonomy']['key'] ?? '',
						'taxonomy_label' => $frontend['taxonomy']['label'] ?? '',
						'display_as'    => $frontend['display_as'] ?? 'popup',
						'multiple'      => $frontend['multiple'] ?? true,
						'placeholder'   => $frontend['placeholder'] ?? '',
						'terms'         => $frontend['terms'] ?? [],
						'per_page'      => $frontend['per_page'] ?? 20,
					];
				} else {
					$props = [
						'taxonomy'      => $filter->get_prop( 'taxonomy' ) ?? '',
						'display_as'    => $filter->get_prop( 'display_as' ) ?? 'popup',
						'multiple'      => $filter->get_prop( 'multiple' ) ?? true,
					];
				}
				break;

			case 'location':
				$props = [
					'radius'        => $filter->get_prop( 'radius' ) ?? 25,
					'radius_unit'   => $filter->get_prop( 'radius_unit' ) ?? 'km',
					'show_radius'   => $filter->get_prop( 'show_radius' ) ?? true,
				];
				break;

			case 'date':
				$props = [
					'format'      => $filter->get_prop( 'format' ) ?? 'date',
					'compare'     => $filter->get_prop( 'compare' ) ?? 'equals',
					'enable_range' => $filter->get_prop( 'enable_range' ) ?? false,
				];
				break;

			case 'order-by':
				// Order-by filter uses frontend_props() to get choices from Voxel
				// Evidence: themes/voxel/app/post-types/filters/order-by-filter.php:62-75
				if ( method_exists( $filter, 'frontend_props' ) ) {
					$props = $filter->frontend_props();
				} else {
					$props = [
						'orderby_options' => $filter->get_prop( 'orderby_options' ) ?? [],
					];
				}
				break;

			case 'post-status':
				// Post status filter uses frontend_props() to get choices from Voxel
				// Evidence: themes/voxel/app/post-types/filters/post-status-filter.php:83-89
				if ( method_exists( $filter, 'frontend_props' ) ) {
					$props = $filter->frontend_props();
				} else {
					$props = [];
				}
				break;

			case 'availability':
				// Availability filter uses frontend_props() to get inputMode and l10n
				// Evidence: themes/voxel/app/post-types/filters/availability-filter.php:260-285
				// inputMode: 'single-date' or 'date-range'
				if ( method_exists( $filter, 'frontend_props' ) ) {
					$props = $filter->frontend_props();
				} else {
					$props = [
						'inputMode' => $filter->get_prop( 'input_mode' ) ?? 'date-range',
						'l10n' => [
							'checkIn' => $filter->get_prop( 'l10n_checkin' ) ?? 'Check-in',
							'checkOut' => $filter->get_prop( 'l10n_checkout' ) ?? 'Check-out',
							'pickDate' => $filter->get_prop( 'l10n_pickdate' ) ?? 'Select dates',
						],
					];
				}
				break;

			default:
				$props = [];
		}

		return $props;
	}

	/**
	 * Get terms options for a terms filter
	 *
	 * @param mixed $filter
	 * @return array
	 */
	private function get_terms_options( $filter ) {
		$taxonomy = $filter->get_prop( 'taxonomy' );
		if ( ! $taxonomy ) {
			return [];
		}

		$terms = get_terms( [
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
		] );

		if ( is_wp_error( $terms ) ) {
			return [];
		}

		$options = [];
		foreach ( $terms as $term ) {
			$options[] = [
				'value' => $term->term_id,
				'label' => $term->name,
				'slug'  => $term->slug,
				'count' => $term->count,
			];
		}

		return $options;
	}

	/**
	 * Get order by options
	 *
	 * @param mixed $filter
	 * @return array
	 */
	private function get_order_by_options( $filter ) {
		$orderby_options = $filter->get_prop( 'orderby_options' ) ?? [];
		$options         = [];

		foreach ( $orderby_options as $key => $label ) {
			$options[] = [
				'value' => $key,
				'label' => $label,
			];
		}

		return $options;
	}

	/**
	 * Get relations options
	 *
	 * @param mixed $filter
	 * @return array
	 */
	private function get_relations_options( $filter ) {
		// This would fetch related posts based on filter configuration
		// Implementation depends on Voxel's relation field structure
		return [];
	}
}
