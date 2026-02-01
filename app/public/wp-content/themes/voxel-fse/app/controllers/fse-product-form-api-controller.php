<?php
/**
 * FSE Product Form API Controller
 *
 * REST API endpoints for the Product Form block.
 * Provides product configuration and cart operations with proper Voxel parity.
 *
 * Implements 1:1 parity with Voxel PHP:
 * - themes/voxel/app/widgets/product-form.php:2389-2491 (render method)
 * - themes/voxel/app/widgets/product-form.php:2447-2491 (_get_search_context_config)
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Product_Form_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const REST_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	/**
	 * Always authorize REST route registration
	 */
	protected function authorize(): bool {
		return true;
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes() {
		// Product Form Configuration
		register_rest_route( self::REST_NAMESPACE, '/product-form/config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_product_config' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'post_id' => [
					'required'          => true,
					'validate_callback' => function( $param ) {
						return is_numeric( $param );
					},
				],
			],
		] );

		// Post Context for product form (permissions, nonces)
		register_rest_route( self::REST_NAMESPACE, '/product-form/post-context', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_context' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'post_id' => [
					'required'          => true,
					'validate_callback' => function( $param ) {
						return is_numeric( $param );
					},
				],
			],
		] );
	}

	/**
	 * Get product form configuration
	 *
	 * Replicates Voxel Product_Form widget render() method:
	 * Evidence: themes/voxel/app/widgets/product-form.php:2389-2444
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_product_config( $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Get Voxel post
		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response( [
				'success'       => false,
				'is_purchasable' => false,
				'message'       => 'Post not found',
			], 404 );
		}

		// Get product field (product-form.php:2396)
		$field = $post->get_field( 'product' );
		if ( ! ( $field && $field->get_type() === 'product' ) ) {
			return new \WP_REST_Response( [
				'success'       => false,
				'is_purchasable' => false,
				'message'       => 'No product field found',
			], 404 );
		}

		try {
			// CRITICAL: Output buffer to prevent Voxel methods from corrupting JSON
			// Evidence: Voxel methods may echo warnings/debug output
			ob_start();
			$field->check_product_form_validity();
			ob_end_clean();

			// Get schema (product-form.php:2405-2408)
			ob_start();
			$schema = $field->get_product_form_schema();
			$schema->get_prop( 'product' )->get_prop( 'post_id' )->set_value( $post->get_id() );
			$schema->get_prop( 'product' )->get_prop( 'field_key' )->set_value( $field->get_key() );
			ob_end_clean();

			// Build config matching Voxel's structure (product-form.php:2410-2425)
			ob_start();
			$props = $field->get_product_form_props();
			ob_end_clean();

			// Get search context config (product-form.php:2418)
			$search_context_config = $this->get_search_context_config( $field );

			// Get cart configuration
			$cart_config = $this->get_cart_config( $post, $field );

			$config = [
				'success'       => true,
				'is_purchasable' => true,
				'value'         => $schema->export(),
				'props'         => $props,
				'settings'      => [
					'cart_nonce'            => wp_create_nonce( 'vx_cart' ),
					'checkout_link'         => get_permalink( \Voxel\get( 'templates.checkout' ) ) ?: home_url( '/' ),
					'product_mode'          => $field->get_product_type()->get_product_mode(),
					'search_context_config' => $search_context_config,
				],
				'cart'          => $cart_config,
				'l10n'          => [
					'quantity'       => _x( 'Quantity', 'product form', 'voxel' ),
					'added_to_cart'  => _x( 'Your product has been added to cart.', 'product form', 'voxel' ),
					'view_cart'      => _x( 'View cart', 'product form', 'voxel' ),
				],
				'nonce'         => wp_create_nonce( 'vx_cart' ),
			];

			return new \WP_REST_Response( $config );

		} catch ( \Exception $e ) {
			return new \WP_REST_Response( [
				'success'           => false,
				'is_purchasable'    => false,
				'out_of_stock_message' => $e->getMessage(),
			] );
		}
	}

	/**
	 * Get post context for product form
	 *
	 * Returns permissions, nonces, and state needed for React component.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_post_context( $request ) {
		$post_id = $request->get_param( 'post_id' );

		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post not found',
			], 404 );
		}

		$field = $post->get_field( 'product' );
		$is_purchasable = false;
		$product_mode = 'regular';

		if ( $field && $field->get_type() === 'product' ) {
			try {
				ob_start();
				$field->check_product_form_validity();
				ob_end_clean();
				$is_purchasable = true;
				$product_mode = $field->get_product_type()->get_product_mode();
			} catch ( \Exception $e ) {
				// Product not purchasable
			}
		}

		$is_logged_in = is_user_logged_in();
		$current_user = \Voxel\current_user();

		// Calculate edit permissions
		$is_editable = $post->is_editable_by_current_user();
		$edit_link = $is_editable ? $post->get_edit_link() : null;

		// Cart configuration
		$cart_config = $this->get_cart_config( $post, $field );

		$context = [
			'success'       => true,
			'postId'        => $post->get_id(),
			'postTitle'     => $post->get_title(),
			'postLink'      => $post->get_link(),
			'isLoggedIn'    => $is_logged_in,
			'isPurchasable' => $is_purchasable,
			'productMode'   => $product_mode,

			// Permissions
			'permissions'   => [
				'edit'      => $is_editable,
				'purchase'  => $is_purchasable,
			],

			// Links
			'editLink'      => $edit_link,
			'checkoutLink'  => get_permalink( \Voxel\get( 'templates.checkout' ) ) ?: home_url( '/' ),
			'cartPageLink'  => $cart_config['checkout_url'] ?? home_url( '/' ),

			// Cart state
			'cart'          => $cart_config,

			// Security nonces
			'nonces'        => [
				'cart'      => wp_create_nonce( 'vx_cart' ),
				'checkout'  => wp_create_nonce( 'vx_checkout' ),
			],

			// Localization
			'l10n'          => [
				'added_to_cart' => _x( 'Your product has been added to cart.', 'product form', 'voxel' ),
				'view_cart'     => _x( 'View cart', 'product form', 'voxel' ),
				'out_of_stock'  => _x( 'Out of stock', 'product form', 'voxel' ),
				'add_to_cart'   => _x( 'Add to cart', 'product form', 'voxel' ),
				'continue'      => _x( 'Continue', 'product form', 'voxel' ),
			],
		];

		return new \WP_REST_Response( $context );
	}

	/**
	 * Get search context config
	 *
	 * Maps addon keys to URL parameter names for search -> product form data transfer.
	 * Evidence: themes/voxel/app/widgets/product-form.php:2447-2491
	 *
	 * @param \Voxel\Post_Types\Fields\Product_Field $field
	 * @return array
	 */
	private function get_search_context_config( $field ): array {
		$values = [
			'availability'    => null,
			'numeric_addons'  => null,
			'switcher_addons' => null,
		];

		$post_type = $field->get_post()->post_type;

		foreach ( $post_type->get_filters() as $filter ) {
			// Availability filter (product-form.php:2456-2459)
			if ( $filter->get_type() === 'availability' && $filter->get_prop( 'source' ) === $field->get_key() ) {
				$values['availability'] = $filter->get_key();
			}

			// Stepper filter for numeric addons (product-form.php:2461-2473)
			if ( $filter->get_type() === 'stepper' ) {
				$parts = explode( '->', $filter->get_prop( 'source' ) );
				if ( ! ( ( $parts[0] ?? null ) === 'product' && ( $parts[1] ?? null ) === 'addons' && ! empty( $parts[3] ?? null ) ) ) {
					continue;
				}

				if ( $values['numeric_addons'] === null ) {
					$values['numeric_addons'] = [];
				}

				$addon_key = $parts[3];
				$values['numeric_addons'][ $addon_key ] = $filter->get_key();
			}

			// Switcher filter for switcher addons (product-form.php:2475-2487)
			if ( $filter->get_type() === 'switcher' ) {
				$parts = explode( '->', $filter->get_prop( 'source' ) );
				if ( ! ( ( $parts[0] ?? null ) === 'product' && ( $parts[1] ?? null ) === 'addons' && ! empty( $parts[3] ?? null ) ) ) {
					continue;
				}

				if ( $values['switcher_addons'] === null ) {
					$values['switcher_addons'] = [];
				}

				$addon_key = $parts[3];
				$values['switcher_addons'][ $addon_key ] = $filter->get_key();
			}
		}

		return $values;
	}

	/**
	 * Get cart configuration
	 *
	 * @param \Voxel\Post $post
	 * @param mixed $field Product field or null
	 * @return array
	 */
	private function get_cart_config( $post, $field ): array {
		// Default cart config
		$cart_config = [
			'enabled'         => true,
			'checkout_url'    => get_permalink( \Voxel\get( 'templates.checkout' ) ) ?: home_url( '/' ),
			'currency'        => 'USD',
			'currency_symbol' => '$',
		];

		// Try to get currency from Voxel settings
		try {
			$currency = \Voxel\Stripe\Currencies::get( \Voxel\Stripe::get_default_currency() );
			if ( $currency ) {
				$cart_config['currency'] = $currency['code'] ?? 'USD';
				$cart_config['currency_symbol'] = $currency['symbol'] ?? '$';
			}
		} catch ( \Exception $e ) {
			// Use defaults
		}

		// Check if cart is enabled for this product
		if ( $field && $field->get_type() === 'product' ) {
			try {
				$product_type = $field->get_product_type();
				$cart_config['enabled'] = $product_type->cart_is_enabled();
			} catch ( \Exception $e ) {
				// Use default (enabled)
			}
		}

		return $cart_config;
	}
}
