<?php
/**
 * Cart Summary REST API Controller
 *
 * Provides REST API endpoints for the Cart Summary block.
 * Used by the Gutenberg block to fetch cart configuration.
 *
 * Evidence:
 * - Widget: themes/voxel/app/widgets/cart-summary.php (lines 2596-2632)
 * - Shipping: themes/voxel/app/product-types/shipping/shipping-zone.php
 *
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Cart_API_Controller extends FSE_Base_Controller {

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
		// Endpoint: /wp-json/voxel-fse/v1/cart/config
		// Provides cart configuration for the editor and frontend
		register_rest_route( 'voxel-fse/v1', '/cart/config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_cart_config' ],
			'permission_callback' => '__return_true', // Public - needed for Plan C+ frontend hydration
		] );

		// Endpoint: /wp-json/voxel-fse/v1/cart/promote-config
		// Provides promotion packages for a post (requires login)
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2562-2591
		register_rest_route( 'voxel-fse/v1', '/cart/promote-config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_promote_config' ],
			'permission_callback' => function() {
				return is_user_logged_in();
			},
			'args'                => [
				'post_id' => [
					'required' => true,
					'type'     => 'integer',
				],
			],
		] );
	}

	/**
	 * Get cart configuration
	 *
	 * Matches Voxel's cart-summary.php render() method config structure
	 *
	 * @return \WP_REST_Response
	 */
	public function get_cart_config(): \WP_REST_Response {
		// Check if Voxel is active
		if ( ! class_exists( '\Voxel\Product_Types\Product_Type' ) ) {
			return new \WP_REST_Response( [
				'is_logged_in' => is_user_logged_in(),
				'currency'     => 'USD',
				'auth_link'    => wp_login_url(),
				'multivendor'  => [
					'enabled' => false,
				],
				'shipping'     => [
					'responsibility'        => 'platform',
					'default_country'       => null,
					'saved_address'         => null,
					'countries'             => [],
					'zones'                 => [],
					'shipping_rates_order'  => [],
				],
				'guest_customers' => [
					'behavior' => 'redirect_to_login',
				],
				'geoip_providers' => [],
				'recaptcha'       => [
					'enabled' => false,
				],
				'nonce'           => [
					'cart'     => wp_create_nonce( 'vx_cart' ),
					'checkout' => wp_create_nonce( 'vx_checkout' ),
				],
				'l10n'            => [
					'free'  => _x( 'Free', 'cart summary', 'voxel-fse' ),
					'login' => _x( 'Sign in', 'cart summary', 'voxel-fse' ),
				],
			], 200 );
		}

		// Get Voxel configuration
		$currency = \Voxel\get( 'settings.stripe.currency', 'USD' );
		$is_logged_in = is_user_logged_in();

		// Get authentication link with redirect_to parameter
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2594
		// Voxel adds redirect_to=current_url so user returns to cart after login
		$auth_link = '';
		$auth_page_id = \Voxel\get( 'templates.auth' );
		if ( $auth_page_id ) {
			$auth_link = get_permalink( $auth_page_id );
		}
		if ( ! $auth_link ) {
			$auth_link = wp_login_url();
		}

		// Add redirect_to parameter - use Referer header as fallback for current URL
		// In REST context we don't have the page URL, so use Referer or home_url
		$redirect_to = '';
		if ( ! empty( $_SERVER['HTTP_REFERER'] ) ) {
			$redirect_to = esc_url_raw( wp_unslash( $_SERVER['HTTP_REFERER'] ) );
		}
		if ( $redirect_to ) {
			$auth_link = add_query_arg( 'redirect_to', $redirect_to, $auth_link );
		}

		// Multivendor configuration
		$multivendor_enabled = (bool) \Voxel\get( 'payments.stripe.stripe_connect.enabled', false );

		// Shipping configuration - use actual Voxel shipping zones
		$shipping_config = $this->get_shipping_config();

		// Guest checkout configuration
		$guest_customers = $this->get_guest_customers_config();

		// GeoIP providers for country detection
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2646-2662
		// Dynamically build from admin-configured providers with API keys
		$geoip_providers = $this->get_geoip_providers();

		// reCAPTCHA configuration
		$recaptcha_enabled = (bool) \Voxel\get( 'settings.recaptcha.enabled', false );
		$recaptcha_key = \Voxel\get( 'settings.recaptcha.key', '' );

		return new \WP_REST_Response( [
			'is_logged_in'    => $is_logged_in,
			'currency'        => $currency,
			'auth_link'       => $auth_link,
			'multivendor'     => [
				'enabled'     => $multivendor_enabled,
				'charge_type' => \Voxel\get( 'payments.stripe.stripe_connect.charge_type', 'destination' ),
			],
			'shipping'        => $shipping_config,
			'guest_customers' => $guest_customers,
			'geoip_providers' => $geoip_providers,
			'recaptcha'       => [
				'enabled' => $recaptcha_enabled,
				'key'     => $recaptcha_enabled ? $recaptcha_key : null,
			],
			'nonce'           => [
				'cart'     => wp_create_nonce( 'vx_cart' ),
				'checkout' => wp_create_nonce( 'vx_checkout' ),
			],
			'l10n'            => [
				'free'  => _x( 'Free', 'cart summary', 'voxel-fse' ),
				'login' => _x( 'Sign in', 'cart summary', 'voxel-fse' ),
			],
		], 200 );
	}

	/**
	 * Get shipping configuration using Voxel's actual shipping zones
	 *
	 * Evidence: themes/voxel/app/widgets/cart-summary.php (lines 2618-2632)
	 *
	 * @return array
	 */
	private function get_shipping_config(): array {
		// Determine shipping responsibility (platform vs vendor)
		$multivendor_enabled = (bool) \Voxel\get( 'payments.stripe.stripe_connect.enabled', false );
		$responsibility = $multivendor_enabled
			? \Voxel\get( 'payments.stripe.stripe_connect.shipping.responsibility', 'platform' )
			: 'platform';

		// Get default country
		$default_country = $this->get_default_shipping_country();

		// Get saved shipping address for logged-in users
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2665-2674
		// Voxel stores address as JSON blob in voxel:shipping_address, NOT individual meta keys
		$saved_address = null;
		if ( is_user_logged_in() ) {
			$user = \Voxel\current_user();
			if ( $user ) {
				// Use Voxel's site-specific meta function for multisite compatibility
				if ( function_exists( '\Voxel\get_site_specific_user_meta' ) ) {
					$saved_address_json = \Voxel\get_site_specific_user_meta( $user->get_id(), 'voxel:shipping_address', true );
				} else {
					$saved_address_json = get_user_meta( $user->get_id(), 'voxel:shipping_address', true );
				}

				if ( ! empty( $saved_address_json ) ) {
					$decoded = json_decode( $saved_address_json, true );
					if ( is_array( $decoded ) && ! empty( $decoded['country'] ) ) {
						$saved_address = $decoded;
					}
				}
			}
		}

		// Get shipping zones from Voxel
		$zones = $this->get_voxel_shipping_zones();

		// Get supported countries using Voxel's method
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2635
		// Voxel uses Shipping_Zone::get_supported_countries_data() - NOT custom extraction
		$countries = [];
		if ( class_exists( '\Voxel\Product_Types\Shipping\Shipping_Zone' ) ) {
			$countries = \Voxel\Product_Types\Shipping\Shipping_Zone::get_supported_countries_data();
		}

		// Get shipping rates order
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2638-2643
		// Voxel reads shipping_rates array and extracts keys, not a separate rates_order setting
		$shipping_rates = (array) \Voxel\get( 'product_settings.shipping.shipping_rates', [] );
		$rates_order = array_values( array_filter( array_map( function( $rate ) {
			return $rate['key'] ?? null;
		}, $shipping_rates ) ) );

		return [
			'responsibility'       => $responsibility,
			'default_country'      => $default_country,
			'saved_address'        => $saved_address,
			'countries'            => $countries,
			'zones'                => $zones,
			'shipping_rates_order' => $rates_order,
		];
	}

	/**
	 * Get Voxel shipping zones with full configuration
	 *
	 * Uses Voxel's Shipping_Zone class to get actual zone data
	 *
	 * @return array
	 */
	private function get_voxel_shipping_zones(): array {
		$zones = [];

		// Check if Voxel Shipping Zone class exists
		if ( ! class_exists( '\Voxel\Product_Types\Shipping\Shipping_Zone' ) ) {
			return $zones;
		}

		// Suppress any output from Voxel methods
		ob_start();

		try {
			$all_zones = \Voxel\Product_Types\Shipping\Shipping_Zone::get_all();

			foreach ( $all_zones as $zone ) {
				// Skip zones without rates
				$rates = $zone->get_rates();
				if ( empty( $rates ) ) {
					continue;
				}

				// Get frontend config which includes all the data we need
				$zone_config = $zone->get_frontend_config();
				if ( $zone_config ) {
					$zones[ $zone->get_key() ] = $zone_config;
				}
			}
		} catch ( \Exception $e ) {
			// Log error but continue
			error_log( 'FSE Cart API: Error getting shipping zones - ' . $e->getMessage() );
		}

		ob_end_clean();

		return (object) $zones;
	}

	/**
	 * Get default shipping country
	 *
	 * Uses Voxel's method to determine customer's country
	 *
	 * @return string|null
	 */
	private function get_default_shipping_country(): ?string {
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2694-2701
		// Voxel ONLY uses Visitor::get()->get_country()['alpha-2']
		// It does NOT check product_settings.shipping.default_country
		if ( class_exists( '\Voxel\Visitor' ) ) {
			try {
				$visitor = \Voxel\Visitor::get();
				if ( $visitor ) {
					// get_country() returns array with 'alpha-2' key or null
					$country = $visitor->get_country();
					if ( $country && isset( $country['alpha-2'] ) ) {
						return $country['alpha-2'];
					}
				}
			} catch ( \Exception $e ) {
				// Silent fail
			}
		}

		return null;
	}

	/**
	 * Get GeoIP providers configuration
	 *
	 * Evidence: themes/voxel/app/widgets/cart-summary.php:2646-2662
	 * Evidence: themes/voxel/app/utils/utils.php:1440-1466
	 *
	 * Dynamically builds provider list from admin settings, including API keys.
	 *
	 * @return array
	 */
	private function get_geoip_providers(): array {
		$geoip_providers = [];

		// Get enabled providers from admin settings
		$enabled_providers = (array) \Voxel\get( 'settings.ipgeo.providers', [] );
		if ( empty( $enabled_providers ) ) {
			return $geoip_providers;
		}

		// Get all available provider definitions
		$all_providers = function_exists( '\Voxel\get_ipgeo_providers' )
			? \Voxel\get_ipgeo_providers()
			: [];

		// Match enabled providers against available providers
		foreach ( $enabled_providers as $enabled_provider ) {
			foreach ( $all_providers as $provider ) {
				if ( $provider['key'] === $enabled_provider['key'] ) {
					$geocode_url = $provider['geocode_url'];

					// Append API key if configured
					if ( ! empty( $enabled_provider['api_key'] ) && ! empty( $provider['api_key_param'] ) ) {
						$geocode_url = add_query_arg( $provider['api_key_param'], $enabled_provider['api_key'], $geocode_url );
					}

					$geoip_providers[] = [
						'url'  => $geocode_url,
						'prop' => $provider['country_code_key'],
					];

					break;
				}
			}
		}

		return $geoip_providers;
	}

	/**
	 * Get guest customers configuration
	 *
	 * Evidence: themes/voxel/app/widgets/cart-summary.php (lines 2600-2610)
	 *
	 * @return array
	 */
	private function get_guest_customers_config(): array {
		// Evidence: themes/voxel/app/widgets/cart-summary.php:2602 - default is 'proceed_with_email'
		$behavior = \Voxel\get( 'product_settings.cart_summary.guest_customers.behavior', 'proceed_with_email' );

		if ( $behavior !== 'proceed_with_email' ) {
			return [
				'behavior' => 'redirect_to_login',
			];
		}

		$require_verification = (bool) \Voxel\get( 'product_settings.cart_summary.guest_customers.proceed_with_email.require_verification', true );
		$require_tos = (bool) \Voxel\get( 'product_settings.cart_summary.guest_customers.proceed_with_email.require_tos', false );
		$tos_text = '';

		if ( $require_tos ) {
			$terms_page_id = \Voxel\get( 'templates.terms' );
			$privacy_page_id = \Voxel\get( 'templates.privacy_policy' );
			$terms_url = $terms_page_id ? get_permalink( $terms_page_id ) : home_url( '/' );
			$privacy_url = $privacy_page_id ? get_permalink( $privacy_page_id ) : home_url( '/' );

			$tos_text = sprintf(
				/* translators: 1: Terms URL, 2: Privacy URL */
				_x( 'I agree to the <a target="_blank" href="%1$s">Terms and Conditions</a> and <a target="_blank" href="%2$s">Privacy Policy</a>', 'cart summary', 'voxel-fse' ),
				esc_url( $terms_url ),
				esc_url( $privacy_url )
			);
		}

		return [
			'behavior'           => 'proceed_with_email',
			'proceed_with_email' => [
				'require_verification' => $require_verification,
				'require_tos'          => $require_tos,
				'tos_text'             => $tos_text,
			],
		];
	}

	/**
	 * Get promote screen configuration for a post
	 *
	 * Evidence: themes/voxel/app/widgets/cart-summary.php:2562-2591
	 * Evidence: themes/voxel/app/posts/post-promotions.php
	 * Evidence: themes/voxel/app/product-types/promotions/promotion-package.php
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_promote_config( \WP_REST_Request $request ): \WP_REST_Response {
		$post_id = absint( $request->get_param( 'post_id' ) );

		if ( ! class_exists( '\\Voxel\\Post' ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Voxel is not active',
			], 400 );
		}

		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post not found',
			], 404 );
		}

		$user = \Voxel\get_current_user();
		if ( ! $user || ! $post->promotions->is_promotable_by_user( $user ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'You cannot promote this post',
			], 403 );
		}

		$packages = array_map( function( $package ) {
			return [
				'key'          => $package->get_key(),
				'label'        => $package->get_label(),
				'description'  => $package->get_description(),
				'icon'         => $package->get_icon_markup(),
				'color'        => $package->get_color(),
				'price_amount' => $package->get_price_amount(),
			];
		}, $post->promotions->get_available_packages() );

		return new \WP_REST_Response( [
			'success'    => true,
			'post_id'    => $post->get_id(),
			'post_title' => $post->get_display_name(),
			'packages'   => (object) $packages,
			'nonce'      => [
				'checkout' => wp_create_nonce( 'vx_checkout' ),
			],
		], 200 );
	}
}
