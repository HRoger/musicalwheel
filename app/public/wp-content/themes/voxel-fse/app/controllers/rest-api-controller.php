<?php
/**
 * REST API Controller for Voxel FSE
 *
 * Provides REST API endpoints for the FSE child theme.
 * Used by Gutenberg blocks to fetch dynamic data in the editor.
 *
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class REST_API_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes() {
		// Endpoint: /wp-json/voxel-fse/v1/post-type-fields
		// Public access: Field configuration (labels, types, required status) is not sensitive
		// and must be accessible for frontend forms to render
		register_rest_route( 'voxel-fse/v1', '/post-type-fields', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_post_type_fields' ],
			'permission_callback' => '__return_true', // Public - needed for Plan C+ frontend hydration
			'args'                => [
				'post_type' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => [ $this, 'validate_post_type' ],
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/product-price
		// Public access: Product prices are displayed on public-facing pages
		// and must be accessible for Plan C+ frontend hydration
		register_rest_route( 'voxel-fse/v1', '/product-price', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_product_price' ],
			'permission_callback' => '__return_true', // Public - product prices are public info
			'args'                => [
				'post_id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => [ $this, 'validate_post_id' ],
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/product-form/config
		// Public access: Product form configuration is needed for public product pages
		// Returns fields, cart settings, and base price for Plan C+ frontend hydration
		register_rest_route( 'voxel-fse/v1', '/product-form/config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_product_form_config' ],
			'permission_callback' => '__return_true', // Public - product forms are public
			'args'                => [
				'post_id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => [ $this, 'validate_post_id' ],
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/review-stats
		// Public access: Review statistics are displayed on public-facing pages
		// and must be accessible for Plan C+ frontend hydration
		register_rest_route( 'voxel-fse/v1', '/review-stats', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_review_stats' ],
			'permission_callback' => '__return_true', // Public - review stats are public info
			'args'                => [
				'post_id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => [ $this, 'validate_post_id' ],
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/visit-chart/context
		// Authenticated access: Provides nonce for visit chart data requests
		// Nonce is required to access tracking data
		register_rest_route( 'voxel-fse/v1', '/visit-chart/context', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_visit_chart_context' ],
			'permission_callback' => [ $this, 'check_visit_chart_permission' ],
			'args'                => [
				'source' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $param ) {
						return in_array( $param, [ 'post', 'user', 'site' ], true );
					},
				],
				'post_id' => [
					'required'          => false,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => [ $this, 'validate_post_id' ],
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/sales-chart
		// Authenticated access: Returns sales chart data for current vendor
		// Requires Stripe Connect module
		register_rest_route( 'voxel-fse/v1', '/sales-chart', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_sales_chart' ],
			'permission_callback' => [ $this, 'check_vendor_permission' ],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/sales-chart/load-more
		// Authenticated access: Returns chart data for prev/next navigation
		register_rest_route( 'voxel-fse/v1', '/sales-chart/load-more', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_sales_chart_load_more' ],
			'permission_callback' => [ $this, 'check_vendor_permission' ],
			'args'                => [
				'chart' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $param ) {
						return in_array( $param, [ 'this-week', 'this-month', 'this-year', 'all-time' ], true );
					},
				],
				'date' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'direction' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $param ) {
						return in_array( $param, [ 'prev', 'next' ], true );
					},
				],
			],
		] );

		// =====================================================
		// STRIPE ACCOUNT BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/stripe-account/config
		// Authenticated access: Returns Stripe Connect account configuration
		// for the current user (or preview user in editor)
		register_rest_route( 'voxel-fse/v1', '/stripe-account/config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_stripe_account_config' ],
			'permission_callback' => 'is_user_logged_in', // Must be logged in
			'args'                => [
				'user_id' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
					'description'       => 'User ID or dynamic tag to preview as (editor only, requires admin)',
				],
			],
		] );

		// =====================================================
		// USERBAR BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/userbar/user-data
		// Public access: Returns current user data for userbar
		register_rest_route( 'voxel-fse/v1', '/userbar/user-data', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_userbar_user_data' ],
			'permission_callback' => '__return_true', // Public - returns null for logged out
		] );

		// Endpoint: /wp-json/voxel-fse/v1/userbar/notifications
		// Authenticated access: Returns notifications for current user
		register_rest_route( 'voxel-fse/v1', '/userbar/notifications', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_userbar_notifications' ],
			'permission_callback' => 'is_user_logged_in',
			'args'                => [
				'page' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 1,
					'sanitize_callback' => 'absint',
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/userbar/messages
		// Authenticated access: Returns messages/chats for current user
		register_rest_route( 'voxel-fse/v1', '/userbar/messages', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_userbar_messages' ],
			'permission_callback' => 'is_user_logged_in',
			'args'                => [
				'page' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 1,
					'sanitize_callback' => 'absint',
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/userbar/cart
		// Public access: Returns cart items (supports guest carts)
		register_rest_route( 'voxel-fse/v1', '/userbar/cart', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_userbar_cart' ],
			'permission_callback' => '__return_true', // Public - supports guest carts
		] );

		// Endpoint: /wp-json/voxel-fse/v1/userbar/nav-menus
		// Public access: Returns registered nav menus
		register_rest_route( 'voxel-fse/v1', '/userbar/nav-menus', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_userbar_nav_menus' ],
			'permission_callback' => '__return_true', // Public - nav menus are public
			'args'                => [
				'menu_slug' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// =====================================================
		// MAP BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/map/post-location
		// Public access: Returns location data for a post (for current-post map mode)
		register_rest_route( 'voxel-fse/v1', '/map/post-location', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_map_post_location' ],
			'permission_callback' => '__return_true', // Public - location data is displayed publicly
			'args'                => [
				'post_id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
					'validate_callback' => [ $this, 'validate_post_id' ],
				],
			],
		] );

		// =====================================================
		// QUICK SEARCH BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/quick-search/post-types
		// Public access: Returns available post types for quick search
		register_rest_route( 'voxel-fse/v1', '/quick-search/post-types', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_quick_search_post_types' ],
			'permission_callback' => '__return_true', // Public - needed for Plan C+ frontend hydration
			'args'                => [
				'post_types' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// =====================================================
		// CURRENT ROLE BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/current-role
		// Public access: Returns current user role data and switchable roles
		// Returns null for logged out users (handled gracefully)
		register_rest_route( 'voxel-fse/v1', '/current-role', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_current_role' ],
			'permission_callback' => '__return_true', // Public - returns null for logged out
		] );

		// =====================================================
		// CURRENT PLAN BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/current-plan
		// Public access: Returns current user membership plan data
		// Returns null for logged out users (handled gracefully)
		register_rest_route( 'voxel-fse/v1', '/current-plan', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_current_plan' ],
			'permission_callback' => '__return_true', // Public - returns null for logged out
		] );

		// =====================================================
		// MEMBERSHIP PLANS BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/membership-plans
		// Public access: Returns membership plans and prices for pricing page
		// Returns user's current plan if logged in
		register_rest_route( 'voxel-fse/v1', '/membership-plans', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_membership_plans' ],
			'permission_callback' => '__return_true', // Public - plans are displayed publicly
		] );

		// =====================================================
		// LISTING PLANS BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/listing-plans
		// Public access: Returns listing plans and prices for paid listings page
		// Returns user's login status for checkout flow
		register_rest_route( 'voxel-fse/v1', '/listing-plans', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_listing_plans' ],
			'permission_callback' => '__return_true', // Public - plans are displayed publicly
		] );

		// =====================================================
		// POST FEED BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/post-feed/config
		// Public access: Returns post feed configuration (post types, search forms)
		// for the Post Feed block editor interface
		register_rest_route( 'voxel-fse/v1', '/post-feed/config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_post_feed_config' ],
			'permission_callback' => '__return_true', // Public - needed for Plan C+ frontend hydration
		] );

		// Endpoint: /wp-json/voxel-fse/v1/post-feed/search
		// Public access: Returns search results for post feed
		register_rest_route( 'voxel-fse/v1', '/post-feed/search', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_post_feed_search' ],
			'permission_callback' => '__return_true', // Public - search results are displayed publicly
			'args'                => [
				'post_type' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'pg' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 1,
					'sanitize_callback' => 'absint',
				],
				'limit' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 10,
					'sanitize_callback' => 'absint',
				],
			],
		] );

		// =====================================================
		// LOGIN/REGISTER BLOCK ENDPOINTS
		// =====================================================

		// Endpoint: /wp-json/voxel-fse/v1/auth-config
		// Public access: Returns auth configuration for Login/Register block
		// Includes roles, fields, Google auth links, recaptcha settings, etc.
		register_rest_route( 'voxel-fse/v1', '/auth-config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_auth_config' ],
			'permission_callback' => '__return_true', // Public - login form is displayed publicly
			'args'                => [
				'role_source' => [
					'required'          => false,
					'type'              => 'string',
					'default'           => 'auto',
					'sanitize_callback' => 'sanitize_text_field',
					'validate_callback' => function( $param ) {
						return in_array( $param, [ 'auto', 'manual' ], true );
					},
				],
				'manual_roles' => [
					'required'          => false,
					'type'              => 'array',
					'default'           => [],
					'sanitize_callback' => function( $param ) {
						if ( ! is_array( $param ) ) {
							return [];
						}
						return array_map( 'sanitize_text_field', $param );
					},
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/post-search
		// Editor-only: Searches posts by title or ID across multiple post types.
		// Matches Voxel's voxel-post-select custom control behavior using WP_Query.
		register_rest_route( 'voxel-fse/v1', '/post-search', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'search_posts_for_select' ],
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                => [
				'search' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'post_types' => [
					'required'          => false,
					'type'              => 'string',
					'default'           => 'page,wp_block,wp_template,wp_template_part',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'per_page' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 20,
					'sanitize_callback' => 'absint',
				],
			],
		] );
	}

	/**
	 * Get post type fields configuration
	 *
	 * Returns field configuration for a Voxel post type,
	 * matching the format returned by Voxel\Field::get_frontend_config()
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_post_type_fields( $request ) {
		$post_type_key = $request->get_param( 'post_type' );

		// Ensure Voxel is loaded
		// In REST context, Voxel might not be auto-loaded yet
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			// Try to load Voxel's autoloader
			$voxel_theme_dir = get_template_directory();
			$voxel_autoload = $voxel_theme_dir . '/app/post-types/post-type.php';

			if ( file_exists( $voxel_autoload ) ) {
				require_once $voxel_autoload;
			}

			// If still not available, return error
			if ( ! class_exists( '\Voxel\Post_Type' ) ) {
				return new \WP_Error(
					'voxel_not_available',
					__( 'Voxel theme is not available. Post_Type class not found.', 'voxel-fse' ),
					[ 'status' => 500 ]
				);
			}
		}

		// Get Voxel post type
		$post_type = \Voxel\Post_Type::get( $post_type_key );

		if ( ! $post_type ) {
			return new \WP_Error(
				'post_type_not_found',
				sprintf(
					/* translators: %s: post type key */
					__( 'Post type "%s" not found', 'voxel-fse' ),
					$post_type_key
				),
				[ 'status' => 404 ]
			);
		}

		// Get fields configuration
		// This matches what render.php does (lines 537-557)
		$fields_config = [];

		foreach ( $post_type->get_fields() as $field ) {
			// Check dependencies (skip field if dependencies fail)
			try {
				$field->check_dependencies();
			} catch ( \Exception $e ) {
				continue;
			}

			// Check visibility rules
			if ( ! $field->passes_visibility_rules() ) {
				continue;
			}

			// Get field configuration for frontend
			// Wrap in try-catch to handle fields that fail in REST context
			try {
				$field_config = $field->get_frontend_config();

				if ( $field_config ) {
					$fields_config[] = $field_config;
				}
			} catch ( \Exception $e ) {
				// Skip fields that error (e.g., taxonomy fields with missing references)
				// Log for debugging but don't fail the entire request
				error_log( sprintf(
					'Voxel FSE REST API: Skipping field %s due to error: %s',
					$field->get_key() ?? 'unknown',
					$e->getMessage()
				) );
				continue;
			}
		}

		// CRITICAL FIX: Reprocess icons for editor context (same as render.php:624-688)
		// Voxel's get_icon_markup() returns empty string when Elementor is not active
		// Use FSE's Elementor-independent icon processor instead
		foreach ( $fields_config as &$config ) {
			$field_type = $config['type'] ?? '';
			$field_key = $config['key'] ?? '';

			// Find the Voxel field object to get original data
			$field = $post_type->get_field( $field_key );
			if ( ! $field ) {
				continue;
			}

			// Process choice icons for select/multiselect fields
			if ( ( $field_type === 'multiselect' || $field_type === 'select' ) && isset( $config['props']['choices'] ) ) {
				// Get raw choices with original icon strings (svg:1705, la-regular:lar la-bell, etc.)
				$raw_choices = $field->get_prop( 'choices' );

				// Reprocess icons using FSE's Icon_Processor (Elementor-independent)
				if ( ! empty( $raw_choices ) && is_array( $config['props']['choices'] ) ) {
					foreach ( $config['props']['choices'] as $index => &$choice ) {
						// Get original icon string from raw choices
						$original_icon = $raw_choices[ $index ]['icon'] ?? '';

						// Process icon using FSE's Elementor-independent processor
						if ( ! empty( $original_icon ) ) {
							$choice['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $original_icon );
						}
					}
					unset( $choice ); // Break reference
				}
			}

			// Process taxonomy field term icons
			if ( $field_type === 'taxonomy' ) {
				// Helper function to recursively reprocess term icons
				$reprocess_term_icons = function( &$terms ) use ( &$reprocess_term_icons ) {
					foreach ( $terms as &$term ) {
						if ( ! empty( $term['id'] ) ) {
							// Fetch raw icon from term meta (stored as 'voxel_icon')
							$raw_icon = get_term_meta( $term['id'], 'voxel_icon', true );
							if ( $raw_icon ) {
								$term['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $raw_icon );
							}
						}

						// Recursively process children terms
						if ( ! empty( $term['children'] ) && is_array( $term['children'] ) ) {
							$reprocess_term_icons( $term['children'] );
						}
					}
					unset( $term ); // Break reference
				};

				// Reprocess all terms in the hierarchical tree
				if ( isset( $config['props']['terms'] ) && is_array( $config['props']['terms'] ) ) {
					$reprocess_term_icons( $config['props']['terms'] );
				}

				// Reprocess selected terms
				if ( isset( $config['props']['selected'] ) && is_array( $config['props']['selected'] ) ) {
					foreach ( $config['props']['selected'] as $slug => &$selected_term ) {
						if ( ! empty( $selected_term['id'] ) ) {
							$raw_icon = get_term_meta( $selected_term['id'], 'voxel_icon', true );
							if ( $raw_icon ) {
								$selected_term['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $raw_icon );
							}
						}
					}
					unset( $selected_term ); // Break reference
				}
			}
		}
		unset( $config ); // Break reference

		// Return response
		return rest_ensure_response( [
			'post_type'     => $post_type_key,
			'post_type_label' => $post_type->get_label(),
			'fields_config' => $fields_config,
			'field_count'   => count( $fields_config ),
		] );
	}

	/**
	 * Check if user has permission to access editor endpoints
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return bool|\WP_Error True if user can edit, error otherwise
	 */
	public function check_editor_permission( $request ) {
		// Must be logged in
		if ( ! is_user_logged_in() ) {
			return new \WP_Error(
				'rest_not_logged_in',
				__( 'You must be logged in to access this endpoint.', 'voxel-fse' ),
				[ 'status' => 401 ]
			);
		}

		// Must have edit_posts capability
		// This matches WordPress block editor permission check
		if ( ! current_user_can( 'edit_posts' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to edit posts.', 'voxel-fse' ),
				[ 'status' => 403 ]
			);
		}

		return true;
	}

	/**
	 * Validate post type parameter
	 *
	 * @param string $param Post type key
	 * @param \WP_REST_Request $request REST request object
	 * @param string $key Parameter key
	 * @return bool True if valid, false otherwise
	 */
	public function validate_post_type( $param, $request, $key ) {
		// Post type must be a non-empty string
		if ( empty( $param ) || ! is_string( $param ) ) {
			return false;
		}

		// Post type key format validation (alphanumeric, dash, underscore)
		if ( ! preg_match( '/^[a-z0-9_-]+$/i', $param ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Validate post ID parameter
	 *
	 * @param mixed $param Post ID
	 * @param \WP_REST_Request $request REST request object
	 * @param string $key Parameter key
	 * @return bool True if valid, false otherwise
	 */
	public function validate_post_id( $param, $request, $key ) {
		// Post ID must be a positive integer
		return is_numeric( $param ) && intval( $param ) > 0;
	}

	/**
	 * Get product price data for a post
	 *
	 * Returns price information for posts with Voxel product fields.
	 * Matches the logic from Voxel's Product_Price widget.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_product_price( $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Check if Voxel is available
		if ( ! class_exists( '\Voxel\Post' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is required for product price data.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		// Get Voxel Post object
		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_Error(
				'post_not_found',
				__( 'Post not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Initialize response data (before product field check for graceful fallback)
		$response_data = [
			'isAvailable'           => false,
			'errorMessage'          => null,
			'regularPrice'          => 0,
			'discountPrice'         => 0,
			'hasDiscount'           => false,
			'currency'              => '',
			'currencySymbol'        => '',
			'currencyPosition'      => 'before',
			'formattedRegularPrice' => '',
			'formattedDiscountPrice' => '',
			'suffix'                => '',
		];

		// Get product field - gracefully return unavailable if no product field
		// (matches Voxel widget behavior which simply doesn't render in this case)
		$field = $post->get_field( 'product' );
		if ( ! ( $field && $field->get_type() === 'product' ) ) {
			$response_data['errorMessage'] = __( 'No product configured', 'voxel-fse' );
			return rest_ensure_response( $response_data );
		}

		// Check product availability
		try {
			$field->check_product_form_validity();
			$is_available = true;
		} catch ( \Exception $e ) {
			$is_available = false;

			if ( $e->getCode() === \Voxel\PRODUCT_ERR_OUT_OF_STOCK ) {
				$response_data['errorMessage'] = _x( 'Out of stock', 'product price widget', 'voxel' );
			} else {
				$response_data['errorMessage'] = _x( 'Unavailable', 'product price widget', 'voxel' );
			}

			return rest_ensure_response( $response_data );
		}

		// Calculate prices if available
		$response_data['isAvailable'] = true;

		$reference_date = $GLOBALS['_availability_start_date'] ?? \Voxel\now();

		$regular_price = $field->get_minimum_price_for_date( $reference_date, [
			'with_discounts' => false,
			'addons'         => $GLOBALS['_addon_filters'] ?? null,
		] );

		$discount_price = $field->get_minimum_price_for_date( $reference_date, [
			'with_discounts' => true,
			'addons'         => $GLOBALS['_addon_filters'] ?? null,
		] );

		$currency = \Voxel\get_primary_currency();

		// Get currency config
		$currency_config = \Voxel\Stripe\Currencies::get( $currency );
		$currency_symbol = $currency_config['symbol'] ?? $currency;
		$currency_position = apply_filters( 'voxel/currency_position', 'before' );

		// Calculate suffix
		$suffix = '';
		$product_type = $field->get_product_type();

		// Add booking suffix (per night/per day)
		if ( $booking = $field->get_product_field( 'booking' ) ) {
			if ( $booking->get_booking_type() === 'days' && ( $field->get_value()['booking']['booking_mode'] ?? null ) === 'date_range' ) {
				if ( $product_type->config( 'modules.booking.date_ranges.count_mode' ) === 'nights' ) {
					$suffix = _x( ' / night', 'product price', 'voxel' );
				} else {
					$suffix = _x( ' / day', 'product price', 'voxel' );
				}
			}
		}

		// Add subscription suffix (per month, per year, etc.)
		if ( $subscription_interval = $field->get_product_field( 'subscription-interval' ) ) {
			$interval = $field->get_value()['subscription'];
			$suffix = '';
			if ( $formatted_interval = \Voxel\interval_format( $interval['unit'], $interval['frequency'] ) ) {
				$suffix = sprintf( ' / %s', $formatted_interval );
			}
		}

		// Build response
		$response_data['regularPrice']          = $regular_price;
		$response_data['discountPrice']         = $discount_price;
		$response_data['hasDiscount']           = $discount_price < $regular_price;
		$response_data['currency']              = $currency;
		$response_data['currencySymbol']        = $currency_symbol;
		$response_data['currencyPosition']      = $currency_position;
		$response_data['formattedRegularPrice'] = \Voxel\currency_format( $regular_price, $currency, false );
		$response_data['formattedDiscountPrice'] = \Voxel\currency_format( $discount_price, $currency, false );
		$response_data['suffix']                = $suffix;

		return rest_ensure_response( $response_data );
	}

	/**
	 * Get product form configuration for a post
	 *
	 * Returns product form configuration including fields, cart settings,
	 * and base price. Used by the Product Form (VX) block for Plan C+ hydration.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/widgets/product-form.php
	 * - Template: themes/voxel/templates/widgets/product-form.php
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_product_form_config( $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Check if Voxel is available
		if ( ! class_exists( '\Voxel\Post' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is required for product form data.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		// Get Voxel Post object
		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_Error(
				'post_not_found',
				__( 'Post not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get product field
		$field = $post->get_field( 'product' );
		if ( ! ( $field && $field->get_type() === 'product' ) ) {
			return new \WP_Error(
				'no_product_field',
				__( 'This post does not have a product field.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Check product availability
		$is_purchasable = true;
		$out_of_stock_message = '';

		try {
			$field->check_product_form_validity();
		} catch ( \Exception $e ) {
			$is_purchasable = false;
			$out_of_stock_message = $e->getMessage() ?: _x( 'Unavailable', 'product form widget', 'voxel' );
		}

		// Get product type configuration
		$product_type = $field->get_product_type();

		// Get cart configuration
		$cart_enabled = (bool) $product_type->config( 'modules.cart.enabled' );
		$checkout_page = \Voxel\get( 'templates.checkout' );
		$checkout_url = $checkout_page ? get_permalink( $checkout_page ) : '';

		// Get currency
		$currency = \Voxel\get_primary_currency();
		$currency_config = \Voxel\Stripe\Currencies::get( $currency );
		$currency_symbol = $currency_config['symbol'] ?? $currency;

		// Get base price
		$base_price = 0;
		if ( $is_purchasable ) {
			$reference_date = \Voxel\now();
			$base_price = $field->get_minimum_price_for_date( $reference_date, [
				'with_discounts' => false,
			] );
		}

		// Build fields configuration
		$fields = [];
		$product_fields = $field->get_value();

		// Get field definitions from product type
		if ( $product_type ) {
			$form_fields = $product_type->get_product_fields();

			foreach ( $form_fields as $form_field ) {
				$field_config = [
					'key'           => $form_field->get_key(),
					'label'         => $form_field->get_label(),
					'component_key' => $form_field->get_component_key(),
					'type'          => $form_field->get_type(),
					'required'      => $form_field->is_required(),
					'description'   => $form_field->get_description() ?? '',
				];

				// Add options for choice-based fields
				if ( method_exists( $form_field, 'get_choices' ) ) {
					$choices = $form_field->get_choices();
					$field_config['options'] = array_map( function( $choice ) {
						return [
							'key'   => $choice['key'] ?? '',
							'label' => $choice['label'] ?? '',
							'price' => $choice['price'] ?? 0,
							'image' => $choice['image'] ?? '',
							'color' => $choice['color'] ?? '',
						];
					}, $choices );
				}

				$fields[] = $field_config;
			}
		}

		// Build response
		$response_data = [
			'fields'               => $fields,
			'cart'                 => [
				'enabled'      => $cart_enabled,
				'checkout_url' => $checkout_url,
				'currency'     => $currency,
				'currency_symbol' => $currency_symbol,
			],
			'base_price'           => $base_price,
			'is_purchasable'       => $is_purchasable,
			'out_of_stock_message' => $out_of_stock_message,
			'nonce'                => wp_create_nonce( 'vx_cart' ),
		];

		return rest_ensure_response( $response_data );
	}

	/**
	 * Get review statistics data for a post
	 *
	 * Returns review statistics information for posts with Voxel reviews.
	 * Matches the logic from Voxel's Review_Stats widget.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_review_stats( $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Check if Voxel is available
		if ( ! class_exists( '\Voxel\Post' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is required for review stats data.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		// Get Voxel Post object
		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_Error(
				'post_not_found',
				__( 'Post not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Check if post type has reviews enabled
		if ( ! $post->post_type || ! $post->post_type->reviews ) {
			return new \WP_Error(
				'no_reviews',
				__( 'This post type does not have reviews enabled.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get rating levels from post type configuration
		$rating_levels = $post->post_type->reviews->get_rating_levels();

		// Get review statistics
		$stats = $post->repository->get_review_stats();

		// If stats are incomplete, recalculate
		if ( ! isset( $stats['by_category'] ) ) {
			$stats = \Voxel\cache_post_review_stats( $post->get_id() );
		}

		// Calculate percentage distribution for overall mode
		$overall_pct = [
			'excellent' => 0,
			'very_good' => 0,
			'good'      => 0,
			'fair'      => 0,
			'poor'      => 0,
		];

		if ( isset( $stats['total'] ) && $stats['total'] > 0 ) {
			$overall_pct['excellent'] = round( ( ( $stats['by_score'][2] ?? 0 ) / $stats['total'] ) * 100 );
			$overall_pct['very_good'] = round( ( ( $stats['by_score'][1] ?? 0 ) / $stats['total'] ) * 100 );
			$overall_pct['good']      = round( ( ( $stats['by_score'][0] ?? 0 ) / $stats['total'] ) * 100 );
			$overall_pct['fair']      = round( ( ( $stats['by_score'][-1] ?? 0 ) / $stats['total'] ) * 100 );
			$overall_pct['poor']      = round( ( ( $stats['by_score'][-2] ?? 0 ) / $stats['total'] ) * 100 );
		}

		// Format rating levels for response
		$formatted_levels = [];
		foreach ( $rating_levels as $level ) {
			$formatted_levels[] = [
				'key'   => $level['key'],
				'label' => $level['label'],
				'score' => $level['score'],
				'color' => $level['color'] ?? '',
			];
		}

		// Build category stats for by_category mode
		$by_category = [];
		$categories = $post->post_type->reviews->get_categories();

		foreach ( $categories as $category ) {
			if ( isset( $stats['by_category'][ $category['key'] ] ) ) {
				$_score = $stats['by_category'][ $category['key'] ];

				// Get the matching rating level color
				$level_color = '';
				foreach ( $rating_levels as $lvl ) {
					if ( $_score >= ( $lvl['score'] - 0.5 ) && $_score < ( $lvl['score'] + 0.5 ) ) {
						$level_color = $lvl['color'] ?? '';
						break;
					}
				}

				// Process icon using FSE's Icon_Processor
				$icon_markup = '';
				if ( ! empty( $category['icon'] ) ) {
					$icon_markup = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $category['icon'] );
				}

				$by_category[] = [
					'key'   => $category['key'],
					'label' => $category['label'],
					'icon'  => $icon_markup,
					'score' => $_score,
					'color' => $level_color,
				];
			}
		}

		// Build response
		return rest_ensure_response( [
			'overall'      => $overall_pct,
			'ratingLevels' => $formatted_levels,
			'byCategory'   => $by_category,
			'totalReviews' => $stats['total'] ?? 0,
		] );
	}

	/**
	 * Check permission for visit chart context endpoint
	 *
	 * This endpoint is public - it only returns a nonce that will be validated
	 * by Voxel's tracking.get_chart_data AJAX endpoint when the chart data is fetched.
	 *
	 * The nonce is user-specific:
	 * - For logged-in users: nonce is tied to their user ID
	 * - For logged-out users: nonce will be invalid when Voxel validates it
	 *
	 * This matches Voxel's approach where the nonce is generated at render time
	 * and Voxel's AJAX endpoint handles the actual permission checking.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return bool Always true - permission is handled by Voxel's AJAX endpoint
	 */
	/**
	 * Check permission for visit chart context endpoint
	 *
	 * Permission logic matches Voxel's visits-chart-controller.php:
	 * - Site: Requires logged-in user (admin-level access implied)
	 * - User: Requires logged-in user (can only view own stats)
	 * - Post: Permission check happens in callback (needs post_id)
	 *
	 * Evidence: themes/voxel/app/controllers/frontend/statistics/visits-chart-controller.php:22-31
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return bool|\WP_Error True if authorized, error otherwise
	 */
	public function check_visit_chart_permission( $request ) {
		$source = $request->get_param( 'source' );

		// Site stats require admin capability
		// Evidence: Voxel only shows site-wide stats to admins in backend
		if ( $source === 'site' ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return new \WP_Error(
					'rest_forbidden',
					__( 'You do not have permission to view site-wide statistics.', 'voxel-fse' ),
					[ 'status' => 403 ]
				);
			}
		}

		// User stats require logged-in user
		// Evidence: visits-chart-controller.php:61-64 - verify_nonce uses get_current_user_id()
		if ( $source === 'user' ) {
			if ( ! is_user_logged_in() ) {
				return new \WP_Error(
					'rest_not_logged_in',
					__( 'You must be logged in to view user statistics.', 'voxel-fse' ),
					[ 'status' => 401 ]
				);
			}
		}

		// Post permission check happens in callback (needs post_id to check ownership)
		return true;
	}

	/**
	 * Get visit chart context (nonce and post ID)
	 *
	 * Returns the nonce and context data needed for the frontend
	 * to make AJAX requests to Voxel's tracking.get_chart_data endpoint.
	 *
	 * Nonce format matches Voxel's visits-chart.php widget:
	 * - Site: 'ts-visits-chart--site'
	 * - User: 'ts-visits-chart--u{user_id}'
	 * - Post: 'ts-visits-chart--p{post_id}'
	 *
	 * PARITY: Full 1:1 match with Voxel's visits-chart-controller.php
	 * - Post source: Checks is_editable_by_current_user() (line 24)
	 * - User source: Uses current user ID for nonce (line 61-62)
	 * - Site source: Uses fixed nonce action (line 95)
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_visit_chart_context( $request ) {
		$source = $request->get_param( 'source' );
		$post_id = $request->get_param( 'post_id' );

		$response = [
			'source' => $source,
			'nonce'  => '',
			'postId' => null,
		];

		// Generate nonce based on source (matching Voxel's widget logic)
		switch ( $source ) {
			case 'site':
				// Evidence: visits-chart-controller.php:95
				$response['nonce'] = wp_create_nonce( 'ts-visits-chart--site' );
				break;

			case 'user':
				// Evidence: visits-chart-controller.php:61-62
				// Nonce is tied to current user ID - only the logged-in user can view their own stats
				$user_id = get_current_user_id();
				if ( ! $user_id ) {
					return new \WP_Error(
						'not_logged_in',
						__( 'You must be logged in to view user statistics.', 'voxel-fse' ),
						[ 'status' => 401 ]
					);
				}
				$response['nonce'] = wp_create_nonce( 'ts-visits-chart--u' . $user_id );
				break;

			case 'post':
				if ( ! $post_id ) {
					return new \WP_Error(
						'missing_post_id',
						__( 'Post ID is required for post source.', 'voxel-fse' ),
						[ 'status' => 400 ]
					);
				}

				// Verify post exists, user can edit it, and tracking is enabled
				// Evidence: visits-chart-controller.php:22-31
				if ( class_exists( '\Voxel\Post' ) ) {
					$post = \Voxel\Post::get( $post_id );

					// PARITY: Line 24 - Check post exists AND user can edit it
					// This is the critical permission check that was missing
					if ( ! ( $post && $post->is_editable_by_current_user() ) ) {
						return new \WP_Error(
							'access_denied',
							__( 'Invalid request.', 'voxel-fse' ), // Match Voxel's error message
							[ 'status' => 403 ]
						);
					}

					// PARITY: Lines 29-31 - Check tracking is enabled for this post type
					if ( ! ( $post->post_type && $post->post_type->is_tracking_enabled() ) ) {
						return new \WP_Error(
							'tracking_not_enabled',
							__( 'Invalid request.', 'voxel-fse' ), // Match Voxel's generic error
							[ 'status' => 400 ]
						);
					}
				} else {
					// Fallback if Voxel\Post class not available - use WordPress capability check
					if ( ! current_user_can( 'edit_post', $post_id ) ) {
						return new \WP_Error(
							'access_denied',
							__( 'Invalid request.', 'voxel-fse' ),
							[ 'status' => 403 ]
						);
					}
				}

				// Evidence: visits-chart-controller.php:28
				$response['nonce'] = wp_create_nonce( 'ts-visits-chart--p' . $post_id );
				$response['postId'] = (int) $post_id;
				break;
		}

		return rest_ensure_response( $response );
	}

	/**
	 * Check if current user is a vendor with Stripe Connect
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return bool|\WP_Error True if authorized, error otherwise
	 */
	public function check_vendor_permission( $request ) {
		// Must be logged in
		if ( ! is_user_logged_in() ) {
			return new \WP_Error(
				'rest_not_logged_in',
				__( 'You must be logged in to access sales data.', 'voxel-fse' ),
				[ 'status' => 401 ]
			);
		}

		// Check if Stripe Connect module is available
		if ( ! class_exists( '\Voxel\Modules\Stripe_Connect\Vendor_Stats' ) ) {
			return new \WP_Error(
				'stripe_connect_not_available',
				__( 'Stripe Connect module is not available.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		return true;
	}

	/**
	 * Get sales chart data for current vendor
	 *
	 * Returns all chart data (week, month, year, all-time) for the current user.
	 * Matches the logic from Voxel's Sales Chart widget.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php:1026-1046
	 * - Vendor_Stats: themes/voxel/app/modules/stripe-connect/vendor-stats.php
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_sales_chart( $request ) {
		// Get current user's Voxel User object
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is not available.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get vendor stats
		$stats = \Voxel\Modules\Stripe_Connect\Vendor_Stats::get( $user );
		if ( ! $stats ) {
			return new \WP_Error(
				'vendor_stats_not_available',
				__( 'Could not retrieve vendor statistics.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		$timestamp = current_time( 'timestamp' );

		// Build charts data matching Voxel widget render() method
		// Reference: themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php:1036-1041
		$charts = [
			'this-week'  => $stats->get_week_chart( date( 'Y-m-d', $timestamp ) ),
			'this-month' => $stats->get_month_chart( date( 'Y-m', $timestamp ) ),
			'this-year'  => $stats->get_year_chart( (int) date( 'Y', $timestamp ) ), // Cast to int for array key lookup
			'all-time'   => $stats->get_all_time_chart(),
		];

		return rest_ensure_response( [
			'charts' => $charts,
		] );
	}

	/**
	 * Load more chart data for prev/next navigation
	 *
	 * Returns chart data for a specific date range based on direction.
	 * Matches the AJAX action: stripe_connect.sales_chart.get_data
	 *
	 * Evidence:
	 * - Voxel Controller: themes/voxel/app/modules/stripe-connect/controllers/frontend/connect-frontend-controller.php:162-196
	 * - Voxel JS: themes/voxel/assets/dist/vendor-stats.js (loadMore method)
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_sales_chart_load_more( $request ) {
		// Get current user's Voxel User object
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is not available.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get vendor stats
		$stats = \Voxel\Modules\Stripe_Connect\Vendor_Stats::get( $user );
		if ( ! $stats ) {
			return new \WP_Error(
				'vendor_stats_not_available',
				__( 'Could not retrieve vendor statistics.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		$chart_type = $request->get_param( 'chart' );
		$date       = $request->get_param( 'date' );
		$direction  = $request->get_param( 'direction' );

		// Calculate new date based on direction
		$chart_data = null;

		// Date timestamp from request
		// Reference: themes/voxel/app/modules/stripe-connect/controllers/frontend/connect-frontend-controller.php:166
		$date_timestamp = strtotime( $date );

		switch ( $chart_type ) {
			case 'this-week':
				// Move by 7 days - matches Voxel: connect-frontend-controller.php:176-177
				$change = $direction === 'next' ? '+7 days' : '-7 days';
				$chart_data = $stats->get_week_chart( date( 'Y-m-d', strtotime( $change, $date_timestamp ) ) );
				break;

			case 'this-month':
				// Move by 1 month - matches Voxel: connect-frontend-controller.php:179-180
				$change = $direction === 'next' ? '+1 month' : '-1 month';
				$chart_data = $stats->get_month_chart( date( 'Y-m-01', strtotime( $change, $date_timestamp ) ) );
				break;

			case 'this-year':
				// Move by 1 year - matches Voxel: connect-frontend-controller.php:182-183
				// IMPORTANT: Cast to (int) for array key lookup in Vendor_Stats::get_year_chart()
				$change = $direction === 'next' ? '+1 year' : '-1 year';
				$chart_data = $stats->get_year_chart( (int) date( 'Y', strtotime( $change, $date_timestamp ) ) );
				break;

			case 'all-time':
				// All-time doesn't have prev/next
				$chart_data = $stats->get_all_time_chart();
				break;
		}

		if ( ! $chart_data ) {
			return new \WP_Error(
				'chart_data_not_available',
				__( 'Could not retrieve chart data.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		return rest_ensure_response( $chart_data );
	}

	// =====================================================
	// STRIPE ACCOUNT BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get Stripe account configuration
	 *
	 * Returns Stripe Connect account status, URLs, and shipping configuration
	 * for the current user (or preview user if specified).
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php
	 * - Frontend template: themes/voxel/app/modules/stripe-connect/templates/frontend/stripe-account-widget.php
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_stripe_account_config( $request ) {
		// Check if Voxel is available
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is not available.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		// Check if Stripe Connect module is available
		if ( ! function_exists( '\Voxel\Modules\Stripe_Connect\is_marketplace_active' ) ) {
			return rest_ensure_response( [
				'success' => false,
				'message' => __( 'Stripe Connect is not available.', 'voxel-fse' ),
			] );
		}

		if ( ! \Voxel\Modules\Stripe_Connect\is_marketplace_active() ) {
			return rest_ensure_response( [
				'success' => false,
				'message' => __( 'Stripe Connect is not enabled.', 'voxel-fse' ),
			] );
		}

		// Get user - handle preview mode for editors
		$preview_user_id = $request->get_param( 'user_id' );
		$user = null;

		if ( $preview_user_id && current_user_can( 'administrator' ) ) {
			// Resolve dynamic tags if present
			if ( is_string( $preview_user_id ) && strpos( $preview_user_id, '@tags()' ) !== false ) {
				$preview_user_id = \Voxel\Dynamic_Data\Renderer::render( $preview_user_id );
			}

			// Preview mode: admin can view other user's account
			$user = \Voxel\User::get( $preview_user_id );
		} else {
			// Normal mode: current user
			$user = \Voxel\current_user();
		}

		if ( ! $user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get Stripe vendor account data
		$vendor_id = $user->get_stripe_vendor_id();
		$account = (object) [
			'exists'            => ! empty( $vendor_id ),
			'charges_enabled'   => false,
			'details_submitted' => false,
		];

		// If vendor account exists, get detailed status
		if ( $account->exists ) {
			try {
				$stripe = \Voxel\Modules\Stripe_Payments\Stripe_Client::getClient();
				$stripe_account = $stripe->accounts->retrieve( $vendor_id );
				$account->charges_enabled = $stripe_account->charges_enabled ?? false;
				$account->details_submitted = $stripe_account->details_submitted ?? false;
			} catch ( \Exception $e ) {
				// Account may have been deleted in Stripe
				$account->exists = false;
			}
		}

		// Build onboard/dashboard URLs
		$onboard_link = add_query_arg( [
			'vx'     => 1,
			'action' => 'stripe.account.onboard',
		], home_url( '/' ) );

		$dashboard_link = add_query_arg( [
			'vx'     => 1,
			'action' => 'stripe.account.login',
		], home_url( '/' ) );

		// Get shipping configuration if vendor shipping is enabled
		$shipping_enabled = \Voxel\get( 'payments.stripe.stripe_connect.shipping.responsibility' ) === 'vendor';

		$shipping_data = [];
		if ( $shipping_enabled ) {
			// Get countries data
			$shipping_countries = [];
			$shipping_countries_by_continent = [];

			if ( class_exists( '\Voxel\Utils\Shipping_Countries' ) ) {
				$countries_class = new \Voxel\Utils\Shipping_Countries();
				$shipping_countries = $countries_class->get_countries();
				$shipping_countries_by_continent = $countries_class->get_countries_by_continent();
			}

			// Get shipping classes
			$shipping_classes = [];
			$product_types = \Voxel\Product_Type::get_all();
			foreach ( $product_types as $product_type ) {
				if ( ! $product_type->config( 'settings.shipping.enabled' ) ) {
					continue;
				}
				foreach ( $product_type->config( 'settings.shipping.classes' ) as $class ) {
					$shipping_classes[ $class['key'] ] = [
						'key'   => $class['key'],
						'label' => $class['label'],
					];
				}
			}

			// Get user's shipping zones and rates
			$vendor_shipping = json_decode( get_user_meta( $user->get_id(), 'voxel:vendor_shipping', true ), true ) ?? [];

			$shipping_data = [
				'shipping_countries'             => $shipping_countries,
				'shipping_countries_by_continent' => $shipping_countries_by_continent,
				'shipping_classes'               => $shipping_classes,
				'shipping_zones'                 => $vendor_shipping['shipping_zones'] ?? [],
				'shipping_rates'                 => $vendor_shipping['shipping_rates'] ?? [],
				'primary_currency'               => \Voxel\get_primary_currency(),
			];
		}

		// Build config
		$config = [
			'nonce'                     => wp_create_nonce( 'vx_vendor_dashboard' ),
			'is_preview'                => ! empty( $preview_user_id ),
			'onboard_link'              => $onboard_link,
			'dashboard_link'            => $dashboard_link,
			'account'                   => $account,
			'is_admin'                  => $user->has_cap( 'administrator' ),
			'admin_onboarding_enabled'  => apply_filters( 'voxel/stripe_connect/enable_onboarding_for_admins', false ),
			'shipping_enabled'          => $shipping_enabled,
			'icons'                     => [], // Icons come from block attributes
		];

		// Merge shipping data if enabled
		if ( $shipping_enabled ) {
			$config = array_merge( $config, $shipping_data );
		}

		return rest_ensure_response( [
			'success' => true,
			'data'    => $config,
		] );
	}

	// =====================================================
	// USERBAR BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get user data for userbar
	 *
	 * Returns current user's avatar, display name, and login status.
	 * Matches data used by Voxel's user-bar widget user_menu component.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_userbar_user_data( $request ) {
		if ( ! is_user_logged_in() ) {
			return rest_ensure_response( [
				'success'    => true,
				'isLoggedIn' => false,
				'user'       => null,
			] );
		}

		$user = null;

		// Try to get Voxel User object for rich avatar/profile data
		if ( function_exists( '\Voxel\current_user' ) ) {
			$voxel_user = \Voxel\current_user();
			if ( $voxel_user ) {
				$user = [
					'id'           => $voxel_user->get_id(),
					'displayName'  => $voxel_user->get_display_name(),
					'avatarUrl'    => $voxel_user->get_avatar_url(),
					'avatarMarkup' => $voxel_user->get_avatar_markup(),
				];
			}
		}

		// Fallback to WordPress user data
		if ( ! $user ) {
			$wp_user = wp_get_current_user();
			$user = [
				'id'           => $wp_user->ID,
				'displayName'  => $wp_user->display_name,
				'avatarUrl'    => get_avatar_url( $wp_user->ID ),
				'avatarMarkup' => get_avatar( $wp_user->ID, 32 ),
			];
		}

		return rest_ensure_response( [
			'success'    => true,
			'isLoggedIn' => true,
			'user'       => $user,
		] );
	}

	/**
	 * Get notifications for userbar
	 *
	 * Returns notifications list for the current user.
	 * Proxies Voxel's notification system.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_userbar_notifications( $request ) {
		$page = $request->get_param( 'page' ) ?? 1;

		// Check if Voxel notification system is available
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return rest_ensure_response( [
				'success'  => true,
				'list'     => [],
				'hasMore'  => false,
				'unread'   => 0,
			] );
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get notification count
		$notification_count = $user->get_notification_count();
		$unread = $notification_count['unread'] ?? 0;

		// For now, return empty list (full implementation requires Voxel's notification controller)
		// Full implementation would call Voxel's internal notification list method
		return rest_ensure_response( [
			'success'  => true,
			'list'     => [],
			'hasMore'  => false,
			'unread'   => $unread,
			'nonce'    => wp_create_nonce( 'vx_notifications' ),
		] );
	}

	/**
	 * Get messages/chats for userbar
	 *
	 * Returns chat list for the current user.
	 * Proxies Voxel's inbox system.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_userbar_messages( $request ) {
		$page = $request->get_param( 'page' ) ?? 1;

		// Check if Voxel inbox system is available
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return rest_ensure_response( [
				'success'  => true,
				'list'     => [],
				'hasMore'  => false,
				'unread'   => 0,
			] );
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return new \WP_Error(
				'user_not_found',
				__( 'User not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Get inbox meta for unread count
		$inbox_meta = $user->get_inbox_meta();
		$unread = $inbox_meta['unread'] ?? 0;

		// For now, return empty list (full implementation requires Voxel's inbox controller)
		return rest_ensure_response( [
			'success'  => true,
			'list'     => [],
			'hasMore'  => false,
			'unread'   => $unread,
			'nonce'    => wp_create_nonce( 'vx_chat' ),
		] );
	}

	/**
	 * Get cart items for userbar
	 *
	 * Returns cart items for logged-in users or guest carts.
	 * Proxies Voxel's cart system.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_userbar_cart( $request ) {
		$has_items = false;

		if ( is_user_logged_in() ) {
			// Check if user has cart items
			$has_items = metadata_exists( 'user', get_current_user_id(), 'voxel:cart' );
		}

		// For now, return basic cart info
		// Full implementation would fetch cart items from Voxel's cart system
		return rest_ensure_response( [
			'success'       => true,
			'hasItems'      => $has_items,
			'items'         => [],
			'checkoutLink'  => home_url( '/checkout' ),
			'nonce'         => wp_create_nonce( 'vx_cart' ),
		] );
	}

	/**
	 * Get registered nav menus for userbar
	 *
	 * Returns WordPress nav menus and their items.
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_userbar_nav_menus( $request ) {
		$menu_slug = $request->get_param( 'menu_slug' );

		// Get all registered nav menus
		$nav_menus = wp_get_nav_menus();
		$menus = [];

		foreach ( $nav_menus as $nav_menu ) {
			// If specific menu requested, skip others
			if ( $menu_slug && $nav_menu->slug !== $menu_slug ) {
				continue;
			}

			// Get menu items
			$menu_items = wp_get_nav_menu_items( $nav_menu->term_id );
			$items = [];

			if ( $menu_items ) {
				// Build hierarchical menu structure
				$items_by_id = [];
				foreach ( $menu_items as $item ) {
					$items_by_id[ $item->ID ] = [
						'id'       => $item->ID,
						'title'    => $item->title,
						'url'      => $item->url,
						'target'   => $item->target,
						'classes'  => $item->classes,
						'children' => [],
					];
				}

				// Build hierarchy
				foreach ( $menu_items as $item ) {
					if ( $item->menu_item_parent && isset( $items_by_id[ $item->menu_item_parent ] ) ) {
						$items_by_id[ $item->menu_item_parent ]['children'][] = &$items_by_id[ $item->ID ];
					} else {
						$items[] = &$items_by_id[ $item->ID ];
					}
				}
			}

			$menus[] = [
				'slug'  => $nav_menu->slug,
				'name'  => $nav_menu->name,
				'items' => $items,
			];
		}

		return rest_ensure_response( [
			'success' => true,
			'menus'   => $menus,
		] );
	}

	// =====================================================
	// QUICK SEARCH BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get post types for quick search
	 *
	 * Returns available Voxel post types with their keywords filter
	 * and taxonomy configuration for the Quick Search block.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/widgets/quick-search.php
	 * - Controller: themes/voxel/app/controllers/frontend/search/quick-search-controller.php
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_quick_search_post_types( $request ) {
		// Check if Voxel is available
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return rest_ensure_response( [
				'postTypes'        => [],
				'keywordsMinlength' => 2,
			] );
		}

		// Get requested post types filter (optional)
		$requested_types = $request->get_param( 'post_types' );
		$requested_keys = [];
		if ( $requested_types ) {
			$requested_keys = array_map( 'trim', explode( ',', $requested_types ) );
		}

		// Get all Voxel-managed post types
		$post_types = [];

		foreach ( \Voxel\Post_Type::get_voxel_types() as $post_type ) {
			$key = $post_type->get_key();

			// If specific types requested, filter to those
			if ( ! empty( $requested_keys ) && ! in_array( $key, $requested_keys, true ) ) {
				continue;
			}

			// Get keywords filter key
			$keywords_filter_key = 'keywords';
			foreach ( $post_type->get_filters() as $filter ) {
				if ( $filter->get_type() === 'keywords' ) {
					$keywords_filter_key = $filter->get_key();
					break;
				}
			}

			// Get taxonomies for this post type
			$taxonomies = [];
			foreach ( $post_type->get_taxonomies() as $taxonomy ) {
				if ( $taxonomy->is_publicly_queryable() ) {
					$taxonomies[] = $taxonomy->get_key();
				}
			}

			// Get archive URL
			$archive_url = '';
			$templates = $post_type->templates;
			if ( $templates && method_exists( $templates, 'get_archive_page' ) ) {
				$archive_page = $templates->get_archive_page();
				if ( $archive_page ) {
					$archive_url = get_permalink( $archive_page );
				}
			}
			// Fallback to post type archive
			if ( ! $archive_url ) {
				$archive_url = get_post_type_archive_link( $key ) ?: '';
			}

			$post_types[] = [
				'key'        => $key,
				'label'      => $post_type->get_label(),
				'filter'     => $keywords_filter_key,
				'taxonomies' => $taxonomies,
				'archive'    => $archive_url,
			];
		}

		// Get keywords minimum length from Voxel config
		$keywords_minlength = 2;
		if ( function_exists( '\Voxel\get' ) ) {
			$keywords_minlength = (int) \Voxel\get( 'settings.search.keywords_minlength', 2 );
		}

		return rest_ensure_response( [
			'postTypes'         => $post_types,
			'keywordsMinlength' => $keywords_minlength,
		] );
	}

	// =====================================================
	// MAP BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get post location data for map block
	 *
	 * Returns location coordinates and marker HTML for a post.
	 * Used by the Map (VX) block in current-post mode.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/widgets/map.php
	 * - Template: themes/voxel/templates/widgets/map.php:10-21
	 * - Marker helper: themes/voxel/app/utils/post-utils.php (_post_get_marker)
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_map_post_location( $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Check if Voxel is available
		if ( ! class_exists( '\Voxel\Post' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is required for map location data.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		// Get Voxel Post object
		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_Error(
				'post_not_found',
				__( 'Post not found.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Find the location/address field
		$address_field = null;
		$address_value = null;

		// Look for address/location field in post type fields
		foreach ( $post->get_fields() as $field ) {
			$field_type = $field->get_type();

			// Check for location or address field types
			if ( in_array( $field_type, [ 'location', 'address' ], true ) ) {
				$value = $field->get_value();

				// Check if value has valid coordinates
				if ( ! empty( $value['latitude'] ) && ! empty( $value['longitude'] ) ) {
					$address_field = $field;
					$address_value = $value;
					break;
				}
			}
		}

		// If no address field found, return error
		if ( ! $address_value ) {
			return new \WP_Error(
				'no_location',
				__( 'This post does not have a location field with valid coordinates.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Generate marker HTML using Voxel's helper function
		$marker_html = '';
		if ( function_exists( '\Voxel\_post_get_marker' ) ) {
			$marker_html = \Voxel\_post_get_marker( $post );
		} else {
			// Fallback: Generate basic marker HTML
			$marker_html = $this->generate_fallback_marker( $post );
		}

		return rest_ensure_response( [
			'latitude'  => (float) $address_value['latitude'],
			'longitude' => (float) $address_value['longitude'],
			'marker'    => $marker_html,
			'address'   => $address_value['address'] ?? '',
		] );
	}

	/**
	 * Generate fallback marker HTML when Voxel helper is not available
	 *
	 * Creates a basic marker matching Voxel's marker-type-icon structure.
	 *
	 * @param \Voxel\Post $post Voxel Post object
	 * @return string Marker HTML
	 */
	private function generate_fallback_marker( $post ): string {
		$title = esc_html( $post->get_title() );
		$permalink = esc_url( $post->get_link() );
		$post_type = $post->post_type ? $post->post_type->get_key() : 'post';

		// Get logo/image if available
		$logo = '';
		$logo_field = $post->get_field( 'logo' );
		if ( $logo_field ) {
			$logo_value = $logo_field->get_value();
			if ( ! empty( $logo_value ) ) {
				$logo = esc_url( $logo_value );
			}
		}

		// Generate marker HTML matching Voxel's structure
		$html = '<div class="ts-marker-wrapper map-marker marker-type-icon ts-marker-static">';
		$html .= '<a href="' . $permalink . '" class="ts-marker">';

		if ( $logo ) {
			$html .= '<div class="marker-image" style="background-image: url(' . $logo . ');"></div>';
		} else {
			// Default icon marker
			$html .= '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">';
			$html .= '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>';
			$html .= '</svg>';
		}

		$html .= '</a>';
		$html .= '</div>';

		return $html;
	}

	// =====================================================
	// CURRENT ROLE BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get current user role data
	 *
	 * Returns current user's roles and switchable roles for the Current Role block.
	 * Matches the logic from Voxel's current-role widget.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/widgets/current-role.php:574-586
	 * - Voxel template: themes/voxel/templates/widgets/current-role.php
	 * - Voxel User class: themes/voxel/app/user.php (get_roles, get_switchable_roles)
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_current_role( $request ) {
		// Default response for logged out users
		$response = [
			'isLoggedIn'      => false,
			'canSwitch'       => false,
			'currentRoles'    => [],
			'switchableRoles' => [],
			'rolesLabel'      => '',
		];

		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return rest_ensure_response( $response );
		}

		// Check if Voxel User class is available
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return rest_ensure_response( $response );
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return rest_ensure_response( $response );
		}

		$response['isLoggedIn'] = true;

		// Get current roles
		$roles = $user->get_roles();
		$current_roles = [];
		$role_labels = [];

		foreach ( $roles as $role ) {
			if ( $role ) {
				$current_roles[] = [
					'key'   => $role->get_key(),
					'label' => $role->get_label(),
				];
				$role_labels[] = $role->get_label();
			}
		}

		$response['currentRoles'] = $current_roles;

		// Build roles label message (matching Voxel template logic)
		if ( ! empty( $role_labels ) ) {
			$response['rolesLabel'] = sprintf(
				/* translators: %s: role label(s) */
				_x( 'Your current role is %s', 'current role', 'voxel' ),
				implode( ', ', $role_labels )
			);
		} else {
			$response['rolesLabel'] = _x( 'You do not have a role assigned currently.', 'current role', 'voxel' );
		}

		// Get switchable roles
		$switchable_roles = $user->get_switchable_roles();

		// Check if user can switch (not admin/editor and has switchable roles)
		$can_switch = ! empty( $switchable_roles ) &&
					  ! $user->has_role( 'administrator' ) &&
					  ! $user->has_role( 'editor' );

		$response['canSwitch'] = $can_switch;

		if ( $can_switch ) {
			$switchable_role_data = [];

			foreach ( $switchable_roles as $role ) {
				if ( $role ) {
					// Build switch URL with nonce (matching Voxel template logic)
					$switch_url = add_query_arg( [
						'role_key' => $role->get_key(),
						'_wpnonce' => wp_create_nonce( 'vx_switch_role' ),
					], home_url( '/?vx=1&action=roles.switch_role' ) );

					$switchable_role_data[] = [
						'key'       => $role->get_key(),
						'label'     => $role->get_label(),
						'switchUrl' => $switch_url,
					];
				}
			}

			$response['switchableRoles'] = $switchable_role_data;
		}

		return rest_ensure_response( $response );
	}

	// =====================================================
	// CURRENT PLAN BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get current user membership plan data
	 *
	 * Returns current user's membership plan information for the Current Plan block.
	 * Matches the logic from Voxel's current-plan widget.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php:777-795
	 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php
	 * - Voxel Membership: themes/voxel/app/modules/paid-memberships/membership/
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_current_plan( $request ) {
		// Default response for logged out users
		$response = [
			'isLoggedIn'             => false,
			'membershipType'         => null,
			'pricing'                => null,
			'planLabel'              => '',
			'statusMessage'          => null,
			'orderLink'              => null,
			'switchPlanUrl'          => null,
			'isSubscriptionCanceled' => false,
		];

		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return rest_ensure_response( $response );
		}

		// Check if Voxel User class is available
		if ( ! function_exists( '\Voxel\current_user' ) ) {
			return rest_ensure_response( $response );
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return rest_ensure_response( $response );
		}

		$response['isLoggedIn'] = true;

		// Get membership data
		$membership = $user->get_membership();
		if ( ! $membership ) {
			// User has no membership - return default free plan
			$response['planLabel'] = _x( 'Free plan', 'current plan', 'voxel' );
			return rest_ensure_response( $response );
		}

		// Get membership type
		$membership_type = $membership->get_type();
		$response['membershipType'] = $membership_type;

		// Get active plan label
		$active_plan = $membership->get_active_plan();
		if ( $active_plan ) {
			$response['planLabel'] = $active_plan->get_label();
		} else {
			$response['planLabel'] = _x( 'Free plan', 'current plan', 'voxel' );
		}

		// Get user's roles for switch plan URL
		$roles = $user->get_roles();
		$role = $roles[0] ?? null;

		if ( $role && method_exists( $role, 'get_pricing_page_id' ) && method_exists( $role, 'has_plans_enabled' ) ) {
			if ( $role->get_pricing_page_id() && $role->has_plans_enabled() ) {
				$response['switchPlanUrl'] = get_permalink( $role->get_pricing_page_id() );
			}
		}

		// Check if this is an order-based membership
		if ( $membership_type === 'order' ) {
			$order = $membership->get_order();
			$payment_method = $membership->get_payment_method();

			// Check if subscription is canceled
			if ( $payment_method && method_exists( $payment_method, 'is_subscription_canceled' ) ) {
				$response['isSubscriptionCanceled'] = $payment_method->is_subscription_canceled();
			}

			// If order exists and subscription not canceled, include pricing and order link
			if ( $order && $payment_method && ! $response['isSubscriptionCanceled'] ) {
				// Get order link
				if ( method_exists( $order, 'get_link' ) ) {
					$response['orderLink'] = $order->get_link();
				}

				// Get pricing data
				$amount = $membership->get_amount();
				$currency = $membership->get_currency();
				$interval = $membership->get_interval();
				$frequency = $membership->get_frequency();

				// Format price
				$formatted_price = '';
				if ( function_exists( '\Voxel\currency_format' ) ) {
					$formatted_price = \Voxel\currency_format( $amount, $currency, false );
				} else {
					$formatted_price = number_format( $amount / 100, 2 ) . ' ' . strtoupper( $currency );
				}

				// Format period
				$formatted_period = '';
				if ( function_exists( '\Voxel\interval_format' ) ) {
					$formatted_period = \Voxel\interval_format( $interval, $frequency );
				} else {
					$formatted_period = $frequency . ' ' . $interval;
				}

				$response['pricing'] = [
					'amount'          => $amount,
					'currency'        => $currency,
					'formattedPrice'  => $formatted_price,
					'interval'        => $interval,
					'frequency'       => $frequency,
					'formattedPeriod' => $formatted_period,
				];

				// Get status message
				if ( method_exists( $membership, 'get_status_message_for_customer' ) ) {
					$response['statusMessage'] = $membership->get_status_message_for_customer();
				}
			}
		}

		return rest_ensure_response( $response );
	}

	// =====================================================
	// MEMBERSHIP PLANS BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get membership plans data for the Membership Plans block
	 *
	 * Returns all membership plans with their prices, formatted for the block.
	 * Includes user's current membership status if logged in.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php
	 * - Voxel template: themes/voxel/app/modules/paid-memberships/templates/frontend/pricing-plans-widget.php
	 * - Voxel Plan class: themes/voxel/app/modules/paid-memberships/plan.php
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_membership_plans( $request ) {
		// Default response
		$response = [
			'isLoggedIn'      => is_user_logged_in(),
			'availablePlans'  => [],
			'userMembership'  => null,
			'priceGroups'     => [],
		];

		// Check if Voxel's Plan class is available
		if ( ! class_exists( '\Voxel\Plan' ) ) {
			return rest_ensure_response( $response );
		}

		// Get user membership if logged in
		if ( is_user_logged_in() && function_exists( '\Voxel\current_user' ) ) {
			try {
				$user = \Voxel\current_user();
				if ( $user && method_exists( $user, 'get_membership' ) ) {
					$membership = $user->get_membership();
					if ( $membership ) {
						$active_plan = method_exists( $membership, 'get_active_plan' ) ? $membership->get_active_plan() : null;
						$response['userMembership'] = [
							'type'                  => method_exists( $membership, 'get_type' ) ? $membership->get_type() : 'default',
							'planKey'               => $active_plan && method_exists( $active_plan, 'get_key' ) ? $active_plan->get_key() : 'default',
							'priceKey'              => method_exists( $membership, 'get_price_key' ) ? $membership->get_price_key() : null,
							'isSubscriptionCanceled' => false,
							'isInitialState'        => method_exists( $membership, 'is_initial_state' ) ? $membership->is_initial_state() : false,
						];

						// Check if subscription is canceled
						if ( $response['userMembership']['type'] === 'order' && method_exists( $membership, 'get_payment_method' ) ) {
							$payment_method = $membership->get_payment_method();
							if ( $payment_method && method_exists( $payment_method, 'is_subscription_canceled' ) ) {
								$response['userMembership']['isSubscriptionCanceled'] = $payment_method->is_subscription_canceled();
							}
						}
					}
				}
			} catch ( \Throwable $e ) {
				// Log error but continue - user membership info is optional
				error_log( 'VoxelFSE Membership Plans: Error getting user membership: ' . $e->getMessage() );
			}
		}

		// Get all active plans
		// Evidence: themes/voxel/app/modules/paid-memberships/widgets/pricing-plans-widget.php:26
		$available_plans = [];

		try {
			$plans = \Voxel\Plan::active();

			foreach ( $plans as $plan ) {
				// Skip invalid plan objects
				if ( ! is_object( $plan ) || ! method_exists( $plan, 'get_key' ) ) {
					continue;
				}

				$plan_key = $plan->get_key();

				// Skip default plan in loop - we add it separately at the end
				// Evidence: pricing-plans-widget.php handles default plan separately (line 1444-1456)
				if ( $plan_key === 'default' ) {
					continue;
				}

				$plan_label = method_exists( $plan, 'get_label' ) ? $plan->get_label() : $plan_key;
				$plan_description = method_exists( $plan, 'get_description' ) ? ( $plan->get_description() ?? '' ) : '';

				$prices = [];

				// Get plan prices from config - Evidence: pricing-plans-widget.php:33
				// Uses $plan->config('prices') to get the prices array
				$plan_prices = method_exists( $plan, 'config' ) ? ( $plan->config( 'prices' ) ?? [] ) : [];

				foreach ( $plan_prices as $price_config ) {
					$price_key = $price_config['key'] ?? '';
					if ( empty( $price_key ) ) {
						continue;
					}

					$full_price_key = $plan_key . '@' . $price_key;

					// Format amount - Evidence: pricing-plans-widget.php:40-41
					$amount = $price_config['amount'] ?? 0;
					$currency = $price_config['currency'] ?? 'usd';

					$formatted_amount = '';
					if ( function_exists( '\Voxel\currency_format' ) ) {
						$formatted_amount = \Voxel\currency_format( $amount, $currency, false );
					} else {
						$formatted_amount = number_format( $amount / 100, 2 ) . ' ' . strtoupper( $currency );
					}

					// Format period - Evidence: pricing-plans-widget.php:41
					$interval = $price_config['interval'] ?? null;
					$frequency = $price_config['frequency'] ?? null;
					$formatted_period = null;

					if ( $interval && function_exists( '\Voxel\interval_format' ) ) {
						$formatted_period = \Voxel\interval_format( $interval, $frequency );
					}

					$prices[] = [
						'key'             => $full_price_key,
						'priceKey'        => $full_price_key,
						'label'           => $price_config['label'] ?? $plan_label,
						'amount'          => $amount,
						'currency'        => $currency,
						'formattedAmount' => $formatted_amount,
						'interval'        => $interval,
						'frequency'       => $frequency,
						'formattedPeriod' => $formatted_period,
					];
				}

				$available_plans[] = [
					'key'         => $plan_key,
					'label'       => $plan_label,
					'description' => $plan_description,
					'prices'      => $prices,
				];
			}
		} catch ( \Throwable $e ) {
			error_log( 'VoxelFSE Membership Plans: Error loading plans: ' . $e->getMessage() );
		}

		// Add default/free plan - Evidence: pricing-plans-widget.php:1444-1456
		try {
			$default_plan = \Voxel\Plan::get_or_create_default_plan();
			$primary_currency = function_exists( '\Voxel\get_primary_currency' ) ? \Voxel\get_primary_currency() : 'usd';

			$available_plans[] = [
				'key'         => 'default',
				'label'       => $default_plan && method_exists( $default_plan, 'get_label' ) ? $default_plan->get_label() : _x( 'Free plan', 'pricing plans', 'voxel' ),
				'description' => $default_plan && method_exists( $default_plan, 'get_description' ) ? ( $default_plan->get_description() ?? '' ) : '',
				'prices'      => [
					[
						'key'             => 'default',
						'priceKey'        => 'default',
						'label'           => $default_plan && method_exists( $default_plan, 'get_label' ) ? $default_plan->get_label() : _x( 'Free plan', 'pricing plans', 'voxel' ),
						'amount'          => 0,
						'currency'        => $primary_currency,
						'formattedAmount' => _x( 'Free', 'pricing plans', 'voxel' ),
						'interval'        => null,
						'frequency'       => null,
						'formattedPeriod' => null,
					],
				],
			];
		} catch ( \Throwable $e ) {
			error_log( 'VoxelFSE Membership Plans: Error loading default plan: ' . $e->getMessage() );
			// Add a fallback free plan
			$available_plans[] = [
				'key'         => 'default',
				'label'       => _x( 'Free plan', 'pricing plans', 'voxel' ),
				'description' => '',
				'prices'      => [
					[
						'key'             => 'default',
						'priceKey'        => 'default',
						'label'           => _x( 'Free plan', 'pricing plans', 'voxel' ),
						'amount'          => 0,
						'currency'        => 'usd',
						'formattedAmount' => _x( 'Free', 'pricing plans', 'voxel' ),
						'interval'        => null,
						'frequency'       => null,
						'formattedPeriod' => null,
					],
				],
			];
		}

		$response['availablePlans'] = $available_plans;

		// Build price groups from all available prices (for initial configuration)
		// The block will merge this with its configured price groups
		$all_prices = [];
		foreach ( $available_plans as $plan ) {
			foreach ( $plan['prices'] as $price ) {
				$price_data = [
					'priceId'        => $price['key'],
					'key'            => $price['key'],
					'group'          => '', // Will be set by block config
					'label'          => $plan['label'],
					'description'    => $plan['description'],
					'image'          => '',
					'features'       => [],
					'link'           => $this->get_price_checkout_link( $price['key'] ),
					'isFree'         => $price['key'] === 'default',
					'amount'         => $price['formattedAmount'],
					'discountAmount' => null,
					'period'         => $price['formattedPeriod'],
					'trialDays'      => null,
				];

				// Get trial days and discount from Price object
				// Evidence: pricing-plans-widget.php:1458, 1488-1497
				if ( $price['key'] !== 'default' && class_exists( '\Voxel\Modules\Paid_Memberships\Price' ) ) {
					try {
						$price_obj = \Voxel\Modules\Paid_Memberships\Price::from_checkout_key( $price['key'] );
						if ( $price_obj ) {
							// Get trial days
							if ( method_exists( $price_obj, 'get_trial_days' ) ) {
								$trial_days = $price_obj->get_trial_days();
								if ( $trial_days !== null ) {
									// Check if user is eligible for free trial
									$user_eligible = true;
									if ( is_user_logged_in() && function_exists( '\Voxel\current_user' ) ) {
										$current_user = \Voxel\current_user();
										if ( $current_user && method_exists( $current_user, 'is_eligible_for_free_trial' ) ) {
											$user_eligible = $current_user->is_eligible_for_free_trial();
										}
									}
									if ( $user_eligible ) {
										$price_data['trialDays'] = $trial_days;
									}
								}
							}

							// Get discount amount - Evidence: pricing-plans-widget.php:1488-1492
							if ( method_exists( $price_obj, 'get_discount_amount' ) ) {
								$discount = $price_obj->get_discount_amount();
								if ( $discount ) {
									$currency = method_exists( $price_obj, 'get_currency' ) ? $price_obj->get_currency() : 'usd';
									$price_data['discountAmount'] = \Voxel\currency_format( $discount, strtoupper( $currency ), false );
								}
							}
						}
					} catch ( \Exception $e ) {
						// Price object not found or error, continue without trial/discount info
					}
				}

				$all_prices[] = $price_data;
			}
		}

		// Create a default price group with all prices
		$response['priceGroups'] = [
			[
				'id'     => 'all',
				'label'  => __( 'All Plans', 'voxel-fse' ),
				'prices' => $all_prices,
			],
		];

		return rest_ensure_response( $response );
	}

	/**
	 * Get checkout link for a price
	 *
	 * Matches Voxel's pricing-plans-widget.php:1436-1442 format:
	 * - action: paid_memberships.choose_plan
	 * - plan: price_key (e.g., "plan_key@price_key" or "default")
	 * - _wpnonce: vx_choose_plan
	 *
	 * @param string $price_key Price key (e.g., "plan_key@price_key" or "default")
	 * @return string Checkout URL
	 */
	private function get_price_checkout_link( string $price_key ): string {
		// Build checkout URL matching Voxel's format
		// Evidence: pricing-plans-widget.php:1436-1442
		$checkout_url = add_query_arg( [
			'action'   => 'paid_memberships.choose_plan',
			'plan'     => $price_key,
			'_wpnonce' => wp_create_nonce( 'vx_choose_plan' ),
		], home_url( '/?vx=1' ) );

		return $checkout_url;
	}

	// =====================================================
	// LISTING PLANS BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get listing plans data
	 *
	 * Returns all available listing plans with pricing information
	 * for the Listing Plans block. Matches Voxel widget render() 1:1.
	 *
	 * Evidence:
	 * - Voxel widget render(): themes/voxel/app/modules/paid-listings/widgets/listing-plans-widget.php:1587-1785
	 * - Voxel template: themes/voxel/app/modules/paid-listings/templates/frontend/listing-plans-widget.php
	 * - Voxel Listing_Plan class: themes/voxel/app/modules/paid-listings/listing-plan.php
	 * - Voxel currency_format(): themes/voxel/app/utils/utils.php:426 (3rd param $amount_is_in_cents)
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_listing_plans( $request ) {
		// Default response
		$response = [
			'isLoggedIn'      => is_user_logged_in(),
			'availablePlans'  => [],
			'priceGroups'     => [],
			'packagesByPlan'  => (object) [],
			'currentPlanKey'  => null,
			'process'         => null,
		];

		// Check if Voxel's Listing_Plan class is available
		if ( ! class_exists( '\Voxel\Modules\Paid_Listings\Listing_Plan' ) ) {
			return rest_ensure_response( $response );
		}

		// Read process context from URL params (matches widget render() line 1589)
		$process = \Voxel\from_list( $_GET['process'] ?? null, [ 'new', 'relist', 'claim', 'switch' ], null );
		$post = null;
		$post_type = null;
		$submit_to = null;
		$redirect_to = $_GET['redirect_to'] ?? null;

		if ( $process === 'new' ) {
			$post_type = \Voxel\Post_Type::get( $_GET['item_type'] ?? null );
			$submit_to = $_GET['submit_to'] ?? null;
			if ( ! ( $post_type && $post_type->is_managed_by_voxel() ) ) {
				$process = null;
				$post_type = null;
			}
		} elseif ( $process === 'relist' ) {
			$post = \Voxel\Post::get( $_GET['post_id'] ?? null );
			if ( $post && $post->post_type && $post->is_editable_by_current_user()
				&& in_array( $post->get_status(), [ 'expired', 'rejected' ], true ) ) {
				$post_type = $post->post_type;
			} else {
				$process = null;
			}
		} elseif ( $process === 'switch' ) {
			$post = \Voxel\Post::get( $_GET['post_id'] ?? null );
			if ( $post && $post->post_type && $post->is_editable_by_current_user()
				&& $post->get_status() === 'publish'
				&& \Voxel\Modules\Paid_Listings\has_plans_for_post_type( $post->post_type ) ) {
				$post_type = $post->post_type;
			} else {
				$process = null;
			}
		} elseif ( $process === 'claim' ) {
			$post = \Voxel\Post::get( $_GET['post_id'] ?? null );
			if ( $post && \Voxel\Modules\Claim_Listings\is_claimable( $post ) ) {
				$post_type = $post->post_type;
			} else {
				$process = null;
			}
		}

		$response['process'] = $process;

		// Get current plan key for switch process (line 66 of template)
		if ( $process === 'switch' && $post ) {
			$assigned = \Voxel\Modules\Paid_Listings\get_assigned_package( $post );
			if ( $assigned && isset( $assigned['details']['plan'] ) ) {
				$response['currentPlanKey'] = $assigned['details']['plan'];
			}
		}

		// Get all listing plans
		$plans = \Voxel\Modules\Paid_Listings\Listing_Plan::all();
		$available_plans = [];
		$all_prices = [];
		$currency = function_exists( '\Voxel\get_primary_currency' )
			? strtoupper( \Voxel\get_primary_currency() )
			: 'USD';

		foreach ( $plans as $plan ) {
			$plan_key = $plan->get_key();

			// Filter by post type if in a process flow (line 1764-1766)
			if ( $post_type !== null && ! $plan->supports_post_type( $post_type ) ) {
				continue;
			}

			$plan_label = $plan->get_label();
			$plan_description = $plan->get_description() ?? '';

			// Get billing info
			$billing_mode = $plan->get_billing_mode();
			$amount = $plan->get_billing_amount();
			$discount_amount = $plan->get_billing_discount_amount();
			$interval = $plan->get_billing_interval();
			$frequency = $plan->get_billing_frequency();

			// Get submission limits
			$limits = $plan->get_limits();
			$total_submissions = null;
			$submissions_mode = 'unlimited';

			if ( ! empty( $limits ) ) {
				$total = 0;
				foreach ( $limits as $limit ) {
					if ( isset( $limit['total'] ) && $limit['total'] > 0 ) {
						$total += $limit['total'];
					}
				}
				if ( $total > 0 ) {
					$total_submissions = $total;
					$submissions_mode = 'limited';
				}
			}

			// Determine if free (matches widget line 1685)
			$is_free = ( floatval( $amount ) === 0.0 );

			// Format amount — Voxel stores billing amount as raw float (e.g. 9.99),
			// NOT in cents. currency_format() 3rd param=false means "not in cents".
			// Evidence: listing-plans-widget.php:1686-1689 passes raw amount with false
			$formatted_amount = '';
			if ( ! $is_free ) {
				if ( function_exists( '\Voxel\currency_format' ) ) {
					$formatted_amount = \Voxel\currency_format( $amount, $currency, false );
				} else {
					$formatted_amount = number_format( $amount, 2 ) . ' ' . $currency;
				}
			}

			// Format discount amount (line 1691-1696)
			$formatted_discount = null;
			if ( $discount_amount !== null && $discount_amount > 0 ) {
				if ( function_exists( '\Voxel\currency_format' ) ) {
					$formatted_discount = \Voxel\currency_format( $discount_amount, $currency, false );
				} else {
					$formatted_discount = number_format( $discount_amount, 2 ) . ' ' . $currency;
				}
			}

			// Format period for subscriptions (line 1697-1702)
			$formatted_period = null;
			if ( $billing_mode === 'subscription' && $interval ) {
				if ( function_exists( '\Voxel\interval_format' ) ) {
					$formatted_period = \Voxel\interval_format( $interval, $frequency );
				} else {
					$formatted_period = $frequency > 1 ? "{$frequency} {$interval}s" : $interval;
				}
			}

			// Build checkout link — matches Voxel's choose_plan action (line 1668-1677)
			$checkout_link = $this->get_listing_plan_checkout_link(
				$plan_key, $process, $post_type, $post, $submit_to, $redirect_to
			);

			$available_plans[] = [
				'key'         => $plan_key,
				'label'       => $plan_label,
				'description' => $plan_description,
				'submissions' => [
					'count' => $total_submissions,
					'mode'  => $submissions_mode,
				],
			];

			// Build price data for this plan (matches line 1705-1718)
			$price_data = [
				'planKey'                => $plan_key,
				'key'                    => $plan_key,
				'label'                  => $plan_label,
				'description'            => $plan_description,
				'image'                  => null,
				'features'               => [],
				'link'                   => $checkout_link,
				'isFree'                 => $is_free,
				'amount'                 => $is_free ? __( 'Free', 'voxel-fse' ) : $formatted_amount,
				'discountAmount'         => $formatted_discount,
				'period'                 => $formatted_period,
				'disableRepeatPurchase'  => (bool) $plan->config( 'billing.disable_repeat_purchase' ),
				'alreadyPurchased'       => false,
			];

			$all_prices[] = $price_data;
		}

		// Check already purchased plans (matches widget lines 1769-1773)
		if ( is_user_logged_in() && ! empty( $all_prices ) ) {
			$current_user = \Voxel\get_current_user();
			$already_purchased_keys = $this->get_already_purchased_listing_plans( $current_user, $all_prices );

			foreach ( $all_prices as &$price ) {
				if ( in_array( $price['planKey'], $already_purchased_keys, true ) ) {
					$price['alreadyPurchased'] = true;
				}
			}
			unset( $price );

			// Get available packages (matches widget lines 1727-1767)
			if ( $post_type !== null ) {
				$packages = \Voxel\Modules\Paid_Listings\get_available_packages( $current_user, $post_type );
				$packages_by_plan = [];

				foreach ( $packages as $package ) {
					$pkg_plan = $package->get_plan();
					if ( ! $pkg_plan ) {
						continue;
					}

					$pkg_plan_key = $pkg_plan->get_key();
					if ( ! isset( $packages_by_plan[ $pkg_plan_key ] ) ) {
						$packages_by_plan[ $pkg_plan_key ] = [
							'total'     => 0,
							'used'      => 0,
							'packageId' => null,
						];
					}

					foreach ( $package->get_limits() as $limit ) {
						if (
							in_array( $post_type->get_key(), $limit['post_types'], true )
							&& $limit['total'] > $limit['usage']['count']
						) {
							$packages_by_plan[ $pkg_plan_key ]['total'] += $limit['total'];
							$packages_by_plan[ $pkg_plan_key ]['used'] += $limit['usage']['count'];

							if ( $packages_by_plan[ $pkg_plan_key ]['packageId'] === null ) {
								$packages_by_plan[ $pkg_plan_key ]['packageId'] = $package->get_id();
							}
						}
					}
				}

				$response['packagesByPlan'] = ! empty( $packages_by_plan ) ? $packages_by_plan : (object) [];
			}
		}

		$response['availablePlans'] = $available_plans;

		// Create a default price group with all prices
		$response['priceGroups'] = [
			[
				'id'     => 'all',
				'label'  => __( 'All Plans', 'voxel-fse' ),
				'prices' => $all_prices,
			],
		];

		return rest_ensure_response( $response );
	}

	/**
	 * Get checkout link for a listing plan
	 *
	 * Matches Voxel widget line 1668-1677: uses paid_listings.choose_plan action
	 * with process-aware parameters.
	 *
	 * @param string $plan_key Plan key
	 * @param string|null $process Process type (new/relist/claim/switch)
	 * @param \Voxel\Post_Type|null $post_type Target post type
	 * @param \Voxel\Post|null $post Target post (for relist/switch/claim)
	 * @param string|null $submit_to Submit destination
	 * @param string|null $redirect_to Redirect URL after purchase
	 * @return string Checkout URL
	 */
	private function get_listing_plan_checkout_link(
		string $plan_key,
		?string $process = null,
		$post_type = null,
		$post = null,
		?string $submit_to = null,
		?string $redirect_to = null
	): string {
		$args = [
			'vx'        => 1,
			'action'    => 'paid_listings.choose_plan',
			'plan'      => $plan_key,
			'_wpnonce'  => wp_create_nonce( 'vx_choose_plan' ),
		];

		// Add process-aware params (matches widget line 1668-1677)
		if ( $redirect_to ) {
			$args['redirect_to'] = $redirect_to;
		}
		if ( $process ) {
			$args['process'] = $process;
		}
		if ( $post_type ) {
			$args['item_type'] = $post_type->get_key();
		}
		if ( $post ) {
			$args['post_id'] = $post->get_id();
		}
		if ( $submit_to ) {
			$args['submit_to'] = $submit_to;
		}

		return add_query_arg( $args, home_url( '/?vx=1' ) );
	}

	/**
	 * Check which listing plans have already been purchased by a user
	 *
	 * Matches Voxel widget _get_already_purchased_plans() line 1816-1853
	 *
	 * @param \Voxel\User $user Current user
	 * @param array $prices Price data array
	 * @return array Plan keys that have been purchased
	 */
	private function get_already_purchased_listing_plans( $user, array $prices ): array {
		global $wpdb;

		$plans_to_check = [];
		foreach ( $prices as $price ) {
			if ( ! empty( $price['disableRepeatPurchase'] ) ) {
				$plans_to_check[] = $price['planKey'];
			}
		}

		if ( empty( $plans_to_check ) ) {
			return [];
		}

		$testmode = \Voxel\is_test_mode() ? 'true' : 'false';
		$plan_placeholders = implode( ',', array_fill( 0, count( $plans_to_check ), '%s' ) );

		$sql = $wpdb->prepare( <<<SQL
			SELECT DISTINCT JSON_UNQUOTE( JSON_EXTRACT(
				items.details,
				'$."voxel:listing_plan".plan'
			) ) as plan_key
			FROM {$wpdb->prefix}vx_order_items AS items
			LEFT JOIN {$wpdb->prefix}vx_orders AS orders ON ( items.order_id = orders.id )
			WHERE orders.customer_id = %d
				AND orders.status IN ('completed','sub_active','sub_trialing')
				AND items.field_key = 'voxel:listing_plan'
				AND JSON_VALID( items.details )
				AND JSON_UNQUOTE( JSON_EXTRACT(
					items.details,
					'$."voxel:listing_plan".plan'
				) ) IN ({$plan_placeholders})
				AND orders.testmode IS {$testmode}
		SQL, array_merge( [ $user->get_id() ], $plans_to_check ) );

		$results = $wpdb->get_col( $sql );
		return is_array( $results ) ? $results : [];
	}

	// =====================================================
	// POST FEED BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get post feed configuration
	 *
	 * Returns configuration data for the Post Feed block editor interface,
	 * including available post types and AJAX URL.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/widgets/post-feed.php
	 * - Voxel Post_Type: themes/voxel/app/post-types/post-type.php
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_post_feed_config( $request ) {
		$response = [
			'searchForms' => [],
			'postTypes'   => [],
			'ajaxUrl'     => admin_url( 'admin-ajax.php?vx=1' ),
			'restUrl'     => rest_url( 'voxel-fse/v1/' ),
		];

		// Check if Voxel is available
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return rest_ensure_response( $response );
		}

		// Get all Voxel-managed post types
		try {
			foreach ( \Voxel\Post_Type::get_voxel_types() as $post_type ) {
				$response['postTypes'][] = [
					'key'      => $post_type->get_key(),
					'label'    => $post_type->get_label(),
					'singular' => $post_type->get_singular_name(),
					'plural'   => $post_type->get_plural_name(),
				];
			}
		} catch ( \Throwable $e ) {
			// Log error but continue with empty post types
			error_log( 'VoxelFSE Post Feed config error: ' . $e->getMessage() );
		}

		return rest_ensure_response( $response );
	}

	/**
	 * Get post feed search results
	 *
	 * Returns search results for the post feed block.
	 * Wraps Voxel's get_search_results() function.
	 *
	 * Evidence:
	 * - Voxel search: themes/voxel/app/controllers/frontend/search/search-controller.php
	 * - Voxel search function: themes/voxel/app/utils/post-utils.php (get_search_results)
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error Response object or error
	 */
	public function get_post_feed_search( $request ) {
		// Check if Voxel search function is available
		if ( ! function_exists( '\Voxel\get_search_results' ) ) {
			return new \WP_Error(
				'voxel_not_available',
				__( 'Voxel theme is required for post feed search.', 'voxel-fse' ),
				[ 'status' => 500 ]
			);
		}

		$post_type = $request->get_param( 'post_type' );
		$page = $request->get_param( 'pg' ) ?? 1;
		$limit = min( $request->get_param( 'limit' ) ?? 10, 50 ); // Cap at 50

		// Build search params
		$search_params = [
			'type'  => $post_type,
			'pg'    => $page,
			'limit' => $limit,
		];

		// Add any additional filter params from the request
		$filter_keys = [ 'keywords', 'location', 'order', 'post__in' ];
		foreach ( $filter_keys as $key ) {
			$value = $request->get_param( $key );
			if ( $value !== null && $value !== '' ) {
				$search_params[ $key ] = $value;
			}
		}

		try {
			// Get search results using Voxel's function
			$results = \Voxel\get_search_results( $search_params, [
				'limit'            => $limit,
				'get_total_count'  => true,
				'apply_conditional_logic' => true,
			] );

			// Build response
			$response = [
				'success'      => true,
				'html'         => $results['render'] ?? '',
				'totalCount'   => $results['total_count'] ?? 0,
				'displayCount' => \Voxel\count_format(
					count( $results['ids'] ?? [] ),
					$results['total_count'] ?? 0
				),
				'hasPrev'      => $results['has_prev'] ?? false,
				'hasNext'      => $results['has_next'] ?? false,
				'hasResults'   => ! empty( $results['ids'] ),
				'styles'       => $results['styles'] ?? '',
				'scripts'      => $results['scripts'] ?? '',
			];

			return rest_ensure_response( $response );

		} catch ( \Exception $e ) {
			return new \WP_Error(
				'search_failed',
				$e->getMessage(),
				[ 'status' => 500 ]
			);
		}
	}

	// =====================================================
	// LOGIN/REGISTER BLOCK ENDPOINT CALLBACKS
	// =====================================================

	/**
	 * Get authentication configuration for Login/Register block
	 *
	 * Returns the auth configuration matching Voxel's login widget config structure.
	 * Includes roles, fields, Google auth links, recaptcha settings, 2FA status, etc.
	 *
	 * Evidence:
	 * - Voxel widget: themes/voxel/app/widgets/login.php:render() method (line 2834-2960)
	 * - Voxel template: themes/voxel/templates/widgets/login.php
	 * - Voxel auth: themes/voxel/app/controllers/frontend/auth/
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response Response object
	 */
	public function get_auth_config( $request ) {
		$role_source = $request->get_param( 'role_source' );
		$manual_roles = $request->get_param( 'manual_roles' );

		// Default response structure matching Voxel's login widget config
		$response = [
			'screen'            => 'login',
			'nonce'             => wp_create_nonce( 'vx_auth' ),
			'redirectUrl'       => $this->get_voxel_redirect_url(),
			'recaptcha'         => [
				'enabled' => false,
				'key'     => '',
			],
			'errors'            => [
				'social_login_requires_account' => [
					'message' => _x( 'You must register first in order to use Google Sign-In', 'auth', 'voxel' ),
				],
			],
			'l10n'              => [
				'twofa_enabled'                     => _x( '2FA has been enabled successfully!', 'auth', 'voxel' ),
				'twofa_disabled'                    => _x( '2FA has been disabled.', 'auth', 'voxel' ),
				'twofa_disable_confirm'             => _x( 'Are you sure you want to disable two-factor authentication?', 'auth', 'voxel' ),
				'twofa_regenerate_backups_confirm'  => _x( 'This will invalidate your existing backup codes. Continue?', 'auth', 'voxel' ),
				'twofa_backups_generated'           => _x( 'New backup codes generated!', 'auth', 'voxel' ),
				'twofa_remove_trusted_devices_confirm' => _x( 'This will log you out on all trusted devices. You will need to enter your 2FA code next time you log in. Continue?', 'auth', 'voxel' ),
				'twofa_trusted_devices_removed'     => _x( 'All trusted devices have been removed!', 'auth', 'voxel' ),
			],
			'twofa'             => [
				'enabled'              => false,
				'backup_codes_count'   => 0,
				'trusted_devices_count' => 0,
			],
			'registration'      => [
				'roles'        => [],
				'default_role' => null,
			],
			'editProfileUrl'    => null,
			'userDisplayName'   => null,
			// New structure for google auth
			'google'            => [
				'enabled'     => false,
				'loginUrl'    => '',
				'registerUrl' => '',
			],
			// URLs grouped together
			'urls'              => [
				'terms'       => home_url( '/' ),
				'privacy'     => home_url( '/' ),
				'logout'      => wp_logout_url(),
				'editProfile' => '',
			],
			'logoutUrl'         => wp_logout_url(),
		];

		// Check if Voxel is available
		if ( ! function_exists( '\Voxel\get' ) ) {
			return rest_ensure_response( $response );
		}

		// Get recaptcha settings
		$response['recaptcha'] = [
			'enabled' => (bool) \Voxel\get( 'settings.recaptcha.enabled' ),
			'key'     => \Voxel\get( 'settings.recaptcha.key' ) ?: '',
		];

		// Get Google auth settings
		$google_enabled = (bool) \Voxel\get( 'settings.auth.google.enabled' );
		$response['google']['enabled'] = $google_enabled;
		if ( $google_enabled && function_exists( '\Voxel\get_google_auth_link' ) ) {
			$response['google']['loginUrl'] = \Voxel\get_google_auth_link();
			$response['google']['registerUrl'] = \Voxel\get_google_auth_link();
		}

		// Get terms and privacy URLs
		if ( $terms_page_id = \Voxel\get( 'templates.terms' ) ) {
			$response['urls']['terms'] = get_permalink( $terms_page_id ) ?: home_url( '/' );
		}
		if ( $privacy_page_id = \Voxel\get( 'templates.privacy_policy' ) ) {
			$response['urls']['privacy'] = get_permalink( $privacy_page_id ) ?: home_url( '/' );
		}

		// Get logout URL
		if ( function_exists( '\Voxel\get_logout_url' ) ) {
			$logout_url = \Voxel\get_logout_url();
			$response['urls']['logout'] = $logout_url;
			$response['logoutUrl'] = $logout_url;
		}

		// Set default screen based on user state
		if ( is_user_logged_in() && function_exists( '\Voxel\current_user' ) ) {
			$user = \Voxel\current_user();
			if ( $user ) {
				$response['screen'] = 'security';
				$response['userDisplayName'] = $user->get_display_name();

				// Get 2FA status
				if ( method_exists( $user, 'is_2fa_enabled' ) ) {
					$response['twofa']['enabled'] = $user->is_2fa_enabled();
				}
				if ( method_exists( $user, 'get_backup_codes_count' ) ) {
					$response['twofa']['backup_codes_count'] = $user->get_backup_codes_count();
				}
				if ( method_exists( $user, 'get_trusted_devices_count' ) ) {
					$response['twofa']['trusted_devices_count'] = $user->get_trusted_devices_count();
				}

				// Get edit profile URL
				if ( method_exists( $user, 'get_or_create_profile' ) ) {
					$profile = $user->get_or_create_profile();
					if ( $profile && method_exists( $profile, 'get_edit_link' ) ) {
						$edit_link = $profile->get_edit_link();
						$response['editProfileUrl'] = $edit_link;
						$response['urls']['editProfile'] = $edit_link;
					}
				}
			}
		}

		// Get registration roles
		if ( ! class_exists( '\Voxel\Role' ) ) {
			return rest_ensure_response( $response );
		}

		// Determine which roles to include
		if ( $role_source === 'manual' && ! empty( $manual_roles ) ) {
			$role_keys = $manual_roles;
		} else {
			$role_keys = array_keys( \Voxel\Role::get_roles_supporting_registration() );
		}

		$roles = [];
		foreach ( $role_keys as $role_key ) {
			$role = \Voxel\Role::get( $role_key );
			if ( ! ( $role && $role->is_registration_enabled() ) ) {
				continue;
			}

			// Get Google auth links for this role
			$social_login = [
				'google'          => '',
				'google_register' => '',
			];
			if ( $response['google']['enabled'] && function_exists( '\Voxel\get_google_auth_link' ) ) {
				$social_login['google'] = \Voxel\get_google_auth_link( $role->get_key() );
				$social_login['google_register'] = \Voxel\get_google_auth_link( $role->get_key() );
			}

			// Get role fields
			$fields = [];
			if ( method_exists( $role, 'get_fields' ) ) {
				foreach ( $role->get_fields() as $field ) {
					if ( method_exists( $field, 'get_frontend_config' ) ) {
						$field_config = $field->get_frontend_config();
						if ( $field_config ) {
							$fields[] = $field_config;
						}
					}
				}
			}

			$roles[ $role->get_key() ] = [
				'key'               => $role->get_key(),
				'label'             => $role->get_label(),
				'allow_social_login' => method_exists( $role, 'is_social_login_allowed' ) ? $role->is_social_login_allowed() : true,
				'social_login'      => $social_login,
				'fields'            => $fields,
			];
		}

		$response['registration']['roles'] = $roles;

		return rest_ensure_response( $response );
	}

	/**
	 * Get Voxel redirect URL
	 *
	 * @return string Redirect URL
	 */
	private function get_voxel_redirect_url() {
		if ( function_exists( '\Voxel\get_redirect_url' ) ) {
			return \Voxel\get_redirect_url();
		}
		return home_url( '/' );
	}

	/**
	 * Search posts for PostSelectControl
	 *
	 * Matches Voxel's voxel-post-select control behavior:
	 * - Searches by title (LIKE query)
	 * - Searches by ID (exact match when input is numeric or starts with #)
	 * - Searches across multiple post types (page, wp_block, wp_template, wp_template_part)
	 * - Returns results in Voxel format: #ID: Title
	 *
	 * Evidence: themes/voxel/app/modules/elementor/custom-controls/post-select-control.php
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function search_posts_for_select( $request ) {
		$search     = $request->get_param( 'search' );
		$post_types = array_filter( array_map( 'trim', explode( ',', $request->get_param( 'post_types' ) ) ) );
		$per_page   = min( (int) $request->get_param( 'per_page' ), 50 );

		if ( empty( $post_types ) ) {
			$post_types = [ 'page', 'wp_block', 'wp_template', 'wp_template_part' ];
		}

		$results = [];

		// Check if searching by ID (e.g., "#175", "175", or just a number)
		$search_id = null;
		$clean_search = ltrim( $search, '#' );
		if ( is_numeric( $clean_search ) ) {
			$search_id = (int) $clean_search;
		}

		// 1. If searching by ID, fetch that post directly (no post_type restriction for explicit ID search)
		if ( $search_id ) {
			$post = get_post( $search_id );
			if ( $post && in_array( $post->post_status, [ 'publish', 'draft', 'private' ], true ) ) {
				$results[] = [
					'id'    => (string) $post->ID,
					'title' => '#' . $post->ID . ': ' . $post->post_title,
					'type'  => $post->post_type,
				];
			}
		}

		// 2. Search by title across all specified post types
		$query_args = [
			'post_type'      => $post_types,
			'post_status'    => [ 'publish', 'draft', 'private' ],
			's'              => $search,
			'posts_per_page' => $per_page,
			'orderby'        => 'ID',
			'order'          => 'DESC',
		];

		$query = new \WP_Query( $query_args );

		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post ) {
				// Skip if already added by ID search
				if ( $search_id && (int) $post->ID === $search_id ) {
					continue;
				}

				$results[] = [
					'id'    => (string) $post->ID,
					'title' => '#' . $post->ID . ': ' . $post->post_title,
					'type'  => $post->post_type,
				];
			}
		}

		wp_reset_postdata();

		return new \WP_REST_Response( $results, 200 );
	}
}