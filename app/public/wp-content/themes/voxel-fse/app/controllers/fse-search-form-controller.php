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
		// Supports POST with filter_configs to set values and resets_to (matching Voxel's behavior)
		// Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
		register_rest_route( 'voxel-fse/v1', '/search-form/frontend-config', [
			'methods'             => [ 'GET', 'POST' ],
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

		// Public endpoint for fetching user data by ID
		// Used by FilterUser component when default value is set
		// Evidence: themes/voxel/app/post-types/filters/user-filter.php:51-63
		register_rest_route( 'voxel-fse/v1', '/search-form/user-data', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_user_data' ],
			'permission_callback' => '__return_true', // Public for frontend
			'args'                => [
				'user_id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
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

		// Start output buffering to capture any unwanted output from Voxel's filter methods
		// Some filters (like range-filter) call wp_print_styles() which outputs HTML
		// Evidence: themes/voxel/app/post-types/filters/range-filter.php:218
		ob_start();

		$post_types = \Voxel\Post_Type::get_voxel_types();
		$result     = [];

		foreach ( $post_types as $post_type ) {
			// Get filters for this post type
			$filters      = $post_type->get_filters();
			$filters_data = [];

			foreach ( $filters as $filter ) {
				// Initialize elementor_config to prevent "Undefined array key" warnings
				// Some filters (terms, location) require this to be set before frontend_props()
				// Evidence: themes/voxel/app/post-types/filters/terms-filter.php:151
				if ( method_exists( $filter, 'set_elementor_config' ) ) {
					$filter->set_elementor_config( $this->get_default_elementor_config( $filter ) );
				}

				// Use Voxel's native get_frontend_config for consistency
				// Evidence: themes/voxel/app/post-types/filters/base-filter.php:90-111
				$frontend_config = $filter->get_frontend_config();

				// CRITICAL: Process icon with our Icon_Processor instead of relying on Voxel's get_icon_markup()
				// Voxel's get_icon_markup() requires Elementor's Icons_Manager which may not render properly
				// in REST API context. Our Icon_Processor handles this independently.
				// Evidence: themes/voxel/app/utils/utils.php:256-282 (requires Elementor active)
				$icon_markup = Icon_Processor::get_icon_markup( $filter->get_icon() );

				$filters_data[] = [
					'key'       => $frontend_config['key'],
					'label'     => $frontend_config['label'],
					'type'      => $frontend_config['type'],
					'icon'      => $icon_markup,
					'props'     => $frontend_config['props'],
					'value'     => $frontend_config['value'],
					'resets_to' => $frontend_config['resets_to'],
				];

				// Reset for next request
				$filter->reset_frontend_config();
			}

			// Get card templates for this post type
			// Evidence: themes/voxel/app/widgets/search-form.php:447-472
			$card_templates = [];
			if ( method_exists( $post_type, 'get_templates' ) && isset( $post_type->templates ) ) {
				$custom_templates = $post_type->templates->get_custom_templates();
				if ( isset( $custom_templates['card'] ) && is_array( $custom_templates['card'] ) ) {
					foreach ( $custom_templates['card'] as $tpl ) {
						$card_templates[] = [
							'id'    => $tpl['id'] ?? '',
							'label' => isset( $tpl['label'] ) ? 'Preview card: ' . $tpl['label'] : '',
						];
					}
				}
			}

			$result[] = [
				'key'       => $post_type->get_key(),
				'label'     => $post_type->get_label(),
				'singular'  => $post_type->get_singular_name(),
				'plural'    => $post_type->get_plural_name(),
				// Include icon markup for post type
				'icon'      => Icon_Processor::get_icon_markup( $post_type->get_icon() ),
				'filters'   => $filters_data,
				// Card templates for Preview card template and Map popup template dropdowns
				// Evidence: themes/voxel/app/widgets/search-form.php:453-472
				'templates' => $card_templates,
			];
		}

		// Reverse order to match Voxel admin display order
		// Note: Voxel parent uses ts_choose_post_types widget settings for order
		$result = array_reverse( $result );

		// Discard any captured output (like wp_print_styles from Voxel filters)
		ob_end_clean();

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

		// Start output buffering to capture any unwanted output from Voxel's filter methods
		ob_start();

		$filters = $post_type->get_filters();
		$result  = [];

		foreach ( $filters as $filter ) {
			// Initialize elementor_config to prevent "Undefined array key" warnings
			// Some filters (terms, location) require this to be set before frontend_props()
			if ( method_exists( $filter, 'set_elementor_config' ) ) {
				$filter->set_elementor_config( $this->get_default_elementor_config( $filter ) );
			}

			// Use Voxel's native get_frontend_config for consistency
			// Evidence: themes/voxel/app/post-types/filters/base-filter.php:90-111
			$frontend_config = $filter->get_frontend_config();

			// CRITICAL: Process icon with our Icon_Processor
			// Evidence: themes/voxel/app/utils/utils.php:256-282 (requires Elementor active)
			$icon_markup = Icon_Processor::get_icon_markup( $filter->get_icon() );

			$result[] = [
				'key'       => $frontend_config['key'],
				'label'     => $frontend_config['label'],
				'type'      => $frontend_config['type'],
				'icon'      => $icon_markup,
				'props'     => $frontend_config['props'],
				'value'     => $frontend_config['value'],
				'resets_to' => $frontend_config['resets_to'],
			];

			// Reset for next request
			$filter->reset_frontend_config();
		}

		// Discard any captured output
		ob_end_clean();

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
	 * CRITICAL: This endpoint now matches Voxel's filter value lifecycle exactly.
	 * Evidence: themes/voxel/app/widgets/search-form.php:4192-4203
	 *
	 * Voxel's workflow:
	 * 1. Check if ts_default_value === 'yes' → get fallback_value
	 * 2. Call $filter->set_value() BEFORE getting frontend config
	 * 3. Check if ts_reset_value === 'default_value' → call $filter->resets_to()
	 * 4. Call $filter->get_frontend_config() which includes value and resets_to
	 *
	 * POST body structure (optional):
	 * {
	 *   "filter_configs": {
	 *     "post_type_key": {
	 *       "filter_key": {
	 *         "defaultValueEnabled": true,
	 *         "defaultValue": "123",
	 *         "resetValue": "default_value" | "empty"
	 *       }
	 *     }
	 *   }
	 * }
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

		// Get filter configs from POST body (if provided)
		// This allows setting default values and reset behavior per filter
		// Evidence: themes/voxel/app/widgets/search-form.php:4192-4201
		$filter_configs = [];
		if ( $request->get_method() === 'POST' ) {
			$body = $request->get_json_params();
			$filter_configs = $body['filter_configs'] ?? [];
		}

		// Start output buffering to capture any unwanted output from Voxel's filter methods
		// Some filters (like range-filter) call wp_print_styles() which outputs HTML
		ob_start();

		$all_post_types = \Voxel\Post_Type::get_voxel_types();
		$result         = [];

		foreach ( $all_post_types as $post_type ) {
			$key = $post_type->get_key();

			// If specific post types requested, only include those
			if ( ! empty( $requested_keys ) && ! in_array( $key, $requested_keys, true ) ) {
				continue;
			}

			// Get filter configs for this post type
			$post_type_filter_configs = $filter_configs[ $key ] ?? [];

			// Get filters for this post type
			$filters      = $post_type->get_filters();
			$filters_data = [];

			foreach ( $filters as $filter ) {
				$filter_key = $filter->get_key();
				$config     = $post_type_filter_configs[ $filter_key ] ?? [];

				// Initialize elementor_config to prevent "Undefined array key" warnings
				// Some filters (terms, location) require this to be set before frontend_props()
				if ( method_exists( $filter, 'set_elementor_config' ) ) {
					$filter->set_elementor_config( $this->get_default_elementor_config( $filter ) );
				}

				// CRITICAL: Match Voxel's value lifecycle exactly
				// Evidence: themes/voxel/app/widgets/search-form.php:4192-4201
				$this->setup_filter_value( $filter, $config );

				// Now get the complete frontend config (includes value and resets_to)
				// Evidence: themes/voxel/app/post-types/filters/base-filter.php:90-111
				$frontend_config = $filter->get_frontend_config();

				// CRITICAL: Process icon with our Icon_Processor
				// Evidence: themes/voxel/app/utils/utils.php:256-282 (requires Elementor active)
				$icon_markup = Icon_Processor::get_icon_markup( $filter->get_icon() );

				$filters_data[] = [
					'key'        => $frontend_config['key'],
					'label'      => $frontend_config['label'],
					'type'       => $frontend_config['type'],
					'icon'       => $icon_markup,
					'props'      => $frontend_config['props'],
					// CRITICAL: Include value and resets_to (was missing before!)
					'value'      => $frontend_config['value'],
					'resets_to'  => $frontend_config['resets_to'],
				];

				// Reset the filter's frontend config for next request
				// Evidence: themes/voxel/app/post-types/filters/base-filter.php:113-115
				$filter->reset_frontend_config();
			}

			$result[] = [
				'key'      => $key,
				'label'    => $post_type->get_label(),
				'singular' => $post_type->get_singular_name(),
				'plural'   => $post_type->get_plural_name(),
				'icon'     => Icon_Processor::get_icon_markup( $post_type->get_icon() ),
				'filters'  => $filters_data,
			];
		}

		// Reverse order to match Voxel admin display order
		$result = array_reverse( $result );

		// Discard any captured output (e.g., wp_print_styles from range-filter.php)
		// Evidence: themes/voxel/app/post-types/filters/range-filter.php:217-219
		ob_end_clean();

		return rest_ensure_response( $result );
	}

	/**
	 * Setup filter value and resets_to to match Voxel's behavior exactly
	 *
	 * This replicates the exact logic from themes/voxel/app/widgets/search-form.php:4192-4201
	 *
	 * @param mixed $filter The Voxel filter instance
	 * @param array $config The filter config from the block (defaultValueEnabled, defaultValue, resetValue)
	 */
	private function setup_filter_value( $filter, array $config ): void {
		// Step 1: Determine if default value should be used
		// Evidence: themes/voxel/app/widgets/search-form.php:4192-4195
		// Voxel checks: ( $filter_config['ts_default_value'] ?? null ) === 'yes'
		$default_value_enabled = ! empty( $config['defaultValueEnabled'] );
		$default_value         = $config['defaultValue'] ?? null;

		$fallback_value = null;
		if ( $default_value_enabled && $default_value !== null && $default_value !== '' ) {
			$fallback_value = $default_value;
		}

		// Step 2: Set the filter value
		// Evidence: themes/voxel/app/widgets/search-form.php:4197
		// Voxel: $filter->set_value( $filter_value ?? $fallback_value );
		// We don't have URL filter_value here, so just use fallback_value
		$filter->set_value( $fallback_value );

		// Step 3: Set resets_to if resetValue is 'default_value'
		// Evidence: themes/voxel/app/widgets/search-form.php:4199-4201
		// Voxel checks: ( $filter_config['ts_reset_value'] ?? null ) === 'default_value'
		$reset_value = $config['resetValue'] ?? 'empty';
		if ( $reset_value === 'default_value' && $default_value_enabled && $fallback_value !== null ) {
			$filter->resets_to( $fallback_value );
		}
	}

	/**
	 * Get default Elementor config for a filter
	 *
	 * Different filter types require different default config values to prevent
	 * "Undefined array key" warnings when calling frontend_props().
	 *
	 * @param mixed $filter The Voxel filter instance
	 * @return array Default Elementor config for the filter type
	 */
	private function get_default_elementor_config( $filter ): array {
		$type = $filter->get_type();

		switch ( $type ) {
			case 'terms':
				// Evidence: themes/voxel/app/post-types/filters/terms-filter.php:151,199
				return [
					'hide_empty_terms' => 'no',
					'display_as'       => 'popup',
				];

			case 'location':
				// Evidence: themes/voxel/app/post-types/filters/location-filter.php:408,430-431
				return [
					'default_search_method' => 'radius',
					'display_as'            => 'popup',
					'display_proximity_as'  => 'popup',
				];

			case 'keywords':
				// Evidence: themes/voxel/app/post-types/filters/keywords-filter.php:278
				return [
					'display_as' => 'popup',
				];

			case 'range':
				// Evidence: themes/voxel/app/post-types/filters/range-filter.php:222
				return [
					'display_as' => 'popup',
				];

			case 'stepper':
				// Evidence: themes/voxel/app/post-types/filters/stepper-filter.php:155
				return [
					'display_as' => 'popup',
				];

			case 'order-by':
				// Evidence: themes/voxel/app/post-types/filters/order-by-filter.php:73,101
				return [
					'display_as' => null,
					'choices'    => null,
				];

			case 'post-status':
				// Evidence: themes/voxel/app/post-types/filters/post-status-filter.php:86,94
				return [
					'display_as' => 'popup',
					'choices'    => null,
				];

			case 'open-now':
				// Evidence: themes/voxel/app/post-types/filters/open-now-filter.php:126
				return [
					'open_in_popup' => 'no',
				];

			case 'switcher':
				// Evidence: themes/voxel/app/post-types/filters/switcher-filter.php:191
				return [
					'open_in_popup' => 'no',
				];

			case 'availability':
			case 'date':
			case 'recurring-date':
				// Evidence: themes/voxel/app/post-types/filters/availability-filter.php:289-290
				// Evidence: themes/voxel/app/post-types/filters/traits/date-filter-helpers.php:73-74
				return [
					'presets' => [],
				];

			default:
				return [];
		}
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
				// Range filter props from Voxel's filter configuration
				// Evidence: themes/voxel/app/post-types/filters/range-filter.php:12-26
				$props = [
					'min'       => (float) ( $filter->get_prop( 'range_start' ) ?? 0 ),
					'max'       => (float) ( $filter->get_prop( 'range_end' ) ?? 1000 ),
					'step'      => (float) ( $filter->get_prop( 'step_size' ) ?? 1 ),
					'handles'   => $filter->get_prop( 'handles' ) ?? 'single',
					'compare'   => $filter->get_prop( 'compare' ) ?? 'in_range',
					'prefix'    => $filter->get_prop( 'format_prefix' ) ?? '',
					'suffix'    => $filter->get_prop( 'format_suffix' ) ?? '',
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

	/**
	 * Get user data by ID
	 *
	 * Returns user display name and avatar for FilterUser component.
	 * Evidence: themes/voxel/app/post-types/filters/user-filter.php:51-63
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_user_data( \WP_REST_Request $request ) {
		$user_id = $request->get_param( 'user_id' );

		if ( ! $user_id ) {
			return new \WP_Error(
				'invalid_user_id',
				__( 'Invalid user ID', 'voxel-fse' ),
				[ 'status' => 400 ]
			);
		}

		// Use Voxel's User class if available for consistency
		// Evidence: themes/voxel/app/post-types/filters/user-filter.php:54-58
		if ( class_exists( '\Voxel\User' ) ) {
			$user = \Voxel\User::get( $user_id );
			if ( $user ) {
				return rest_ensure_response( [
					'id'     => $user_id,
					'name'   => $user->get_display_name(),
					'avatar' => $user->get_avatar_markup(),
				] );
			}
		}

		// Fallback to WordPress user if Voxel class not available
		$wp_user = get_user_by( 'id', $user_id );
		if ( ! $wp_user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		return rest_ensure_response( [
			'id'     => $user_id,
			'name'   => $wp_user->display_name,
			'avatar' => get_avatar( $user_id, 32 ),
		] );
	}
}
