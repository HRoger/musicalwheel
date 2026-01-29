<?php
/**
 * Cart Summary REST API Controller
 *
 * Provides REST API endpoints for the Cart Summary block.
 * Used by the Gutenberg block to fetch cart configuration.
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
	}

	/**
	 * Get cart configuration
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

		// Get authentication link
		$auth_link = '';
		$auth_page_id = \Voxel\get( 'templates.auth' );
		if ( $auth_page_id ) {
			$auth_link = get_permalink( $auth_page_id );
		}
		if ( ! $auth_link ) {
			$auth_link = wp_login_url();
		}

		// Multivendor configuration
		$multivendor_enabled = (bool) \Voxel\get( 'product_settings.multivendor.enabled', false );

		// Shipping configuration
		$shipping_config = $this->get_shipping_config();

		// Guest checkout configuration
		$guest_customers = $this->get_guest_customers_config();

		// GeoIP providers for country detection
		$geoip_providers = [
			[
				'url'  => 'https://ipapi.co/json/',
				'prop' => 'country_code',
			],
			[
				'url'  => 'https://api.country.is/',
				'prop' => 'country',
			],
		];

		// reCAPTCHA configuration
		$recaptcha_enabled = (bool) \Voxel\get( 'recaptcha.enabled', false );
		$recaptcha_key = \Voxel\get( 'recaptcha.key', '' );

		return new \WP_REST_Response( [
			'is_logged_in'    => $is_logged_in,
			'currency'        => $currency,
			'auth_link'       => $auth_link,
			'multivendor'     => [
				'enabled' => $multivendor_enabled,
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
	 * Get shipping configuration
	 *
	 * @return array
	 */
	private function get_shipping_config(): array {
		$shipping_enabled = (bool) \Voxel\get( 'product_settings.shipping.enabled', false );

		if ( ! $shipping_enabled ) {
			return [
				'responsibility'       => 'platform',
				'default_country'      => null,
				'countries'            => [],
				'zones'                => [],
				'shipping_rates_order' => [],
			];
		}

		$responsibility = \Voxel\get( 'product_settings.shipping.responsibility', 'platform' );
		$default_country = \Voxel\get( 'product_settings.shipping.default_country' );

		// Get shipping countries
		$countries = [];
		$enabled_countries = \Voxel\get( 'product_settings.shipping.countries', [] );

		if ( is_array( $enabled_countries ) ) {
			$all_countries = $this->get_countries_list();
			foreach ( $enabled_countries as $country_code ) {
				if ( isset( $all_countries[ $country_code ] ) ) {
					$countries[ $country_code ] = [
						'name'   => $all_countries[ $country_code ],
						'states' => $this->get_country_states( $country_code ),
					];
				}
			}
		}

		// Get shipping zones
		$zones = [];
		$shipping_zones = \Voxel\get( 'product_settings.shipping.zones', [] );

		if ( is_array( $shipping_zones ) ) {
			foreach ( $shipping_zones as $zone_key => $zone ) {
				$zone_countries = [];
				if ( isset( $zone['countries'] ) && is_array( $zone['countries'] ) ) {
					foreach ( $zone['countries'] as $country_code ) {
						$zone_countries[ $country_code ] = true;
					}
				}

				$zone_rates = [];
				if ( isset( $zone['rates'] ) && is_array( $zone['rates'] ) ) {
					foreach ( $zone['rates'] as $rate_key => $rate ) {
						$zone_rates[ $rate_key ] = [
							'key'                  => $rate_key,
							'label'                => $rate['label'] ?? '',
							'type'                 => $rate['type'] ?? 'flat_rate',
							'amount_per_unit'      => (int) ( $rate['amount_per_unit'] ?? 0 ),
							'delivery_estimate'    => $rate['delivery_estimate'] ?? '',
							'requirements'         => $rate['requirements'] ?? '',
							'minimum_order_amount' => (int) ( $rate['minimum_order_amount'] ?? 0 ),
							'calculation_method'   => $rate['calculation_method'] ?? 'per_item',
							'shipping_classes'     => $rate['shipping_classes'] ?? [],
						];
					}
				}

				$zones[ $zone_key ] = [
					'key'       => $zone_key,
					'label'     => $zone['label'] ?? '',
					'countries' => $zone_countries,
					'rates'     => $zone_rates,
				];
			}
		}

		// Get shipping rates order
		$shipping_rates_order = \Voxel\get( 'product_settings.shipping.rates_order', [] );

		// Get saved shipping address for logged-in users
		$saved_address = null;
		if ( is_user_logged_in() ) {
			$user = \Voxel\current_user();
			if ( $user ) {
				$saved_address = [
					'first_name' => get_user_meta( $user->get_id(), 'voxel:shipping_first_name', true ),
					'last_name'  => get_user_meta( $user->get_id(), 'voxel:shipping_last_name', true ),
					'country'    => get_user_meta( $user->get_id(), 'voxel:shipping_country', true ),
					'state'      => get_user_meta( $user->get_id(), 'voxel:shipping_state', true ),
					'address'    => get_user_meta( $user->get_id(), 'voxel:shipping_address', true ),
					'zip'        => get_user_meta( $user->get_id(), 'voxel:shipping_zip', true ),
				];
			}
		}

		return [
			'responsibility'       => $responsibility,
			'default_country'      => $default_country,
			'saved_address'        => $saved_address,
			'countries'            => $countries,
			'zones'                => $zones,
			'shipping_rates_order' => $shipping_rates_order,
		];
	}

	/**
	 * Get guest customers configuration
	 *
	 * @return array
	 */
	private function get_guest_customers_config(): array {
		$guest_enabled = (bool) \Voxel\get( 'product_settings.guest_customers.enabled', false );

		if ( ! $guest_enabled ) {
			return [
				'behavior' => 'redirect_to_login',
			];
		}

		$behavior = \Voxel\get( 'product_settings.guest_customers.behavior', 'redirect_to_login' );

		if ( $behavior !== 'proceed_with_email' ) {
			return [
				'behavior' => 'redirect_to_login',
			];
		}

		$require_verification = (bool) \Voxel\get( 'product_settings.guest_customers.proceed_with_email.require_verification', false );
		$require_tos = (bool) \Voxel\get( 'product_settings.guest_customers.proceed_with_email.require_tos', false );
		$tos_text = \Voxel\get( 'product_settings.guest_customers.proceed_with_email.tos_text', '' );

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
	 * Get list of countries
	 *
	 * @return array
	 */
	private function get_countries_list(): array {
		// Return a basic list of countries
		// In production, this would use Voxel's country list
		return [
			'US' => 'United States',
			'CA' => 'Canada',
			'GB' => 'United Kingdom',
			'AU' => 'Australia',
			'DE' => 'Germany',
			'FR' => 'France',
			'ES' => 'Spain',
			'IT' => 'Italy',
			'NL' => 'Netherlands',
			'BE' => 'Belgium',
			'AT' => 'Austria',
			'CH' => 'Switzerland',
			'SE' => 'Sweden',
			'NO' => 'Norway',
			'DK' => 'Denmark',
			'FI' => 'Finland',
			'IE' => 'Ireland',
			'PT' => 'Portugal',
			'PL' => 'Poland',
			'CZ' => 'Czech Republic',
			// Add more as needed
		];
	}

	/**
	 * Get states/provinces for a country
	 *
	 * @param string $country_code
	 * @return array
	 */
	private function get_country_states( string $country_code ): array {
		// In production, this would use Voxel's state list
		$states = [];

		switch ( $country_code ) {
			case 'US':
				$states = [
					'AL' => [ 'name' => 'Alabama' ],
					'AK' => [ 'name' => 'Alaska' ],
					'AZ' => [ 'name' => 'Arizona' ],
					'AR' => [ 'name' => 'Arkansas' ],
					'CA' => [ 'name' => 'California' ],
					'CO' => [ 'name' => 'Colorado' ],
					'CT' => [ 'name' => 'Connecticut' ],
					'DE' => [ 'name' => 'Delaware' ],
					'FL' => [ 'name' => 'Florida' ],
					'GA' => [ 'name' => 'Georgia' ],
					'HI' => [ 'name' => 'Hawaii' ],
					'ID' => [ 'name' => 'Idaho' ],
					'IL' => [ 'name' => 'Illinois' ],
					'IN' => [ 'name' => 'Indiana' ],
					'IA' => [ 'name' => 'Iowa' ],
					'KS' => [ 'name' => 'Kansas' ],
					'KY' => [ 'name' => 'Kentucky' ],
					'LA' => [ 'name' => 'Louisiana' ],
					'ME' => [ 'name' => 'Maine' ],
					'MD' => [ 'name' => 'Maryland' ],
					'MA' => [ 'name' => 'Massachusetts' ],
					'MI' => [ 'name' => 'Michigan' ],
					'MN' => [ 'name' => 'Minnesota' ],
					'MS' => [ 'name' => 'Mississippi' ],
					'MO' => [ 'name' => 'Missouri' ],
					'MT' => [ 'name' => 'Montana' ],
					'NE' => [ 'name' => 'Nebraska' ],
					'NV' => [ 'name' => 'Nevada' ],
					'NH' => [ 'name' => 'New Hampshire' ],
					'NJ' => [ 'name' => 'New Jersey' ],
					'NM' => [ 'name' => 'New Mexico' ],
					'NY' => [ 'name' => 'New York' ],
					'NC' => [ 'name' => 'North Carolina' ],
					'ND' => [ 'name' => 'North Dakota' ],
					'OH' => [ 'name' => 'Ohio' ],
					'OK' => [ 'name' => 'Oklahoma' ],
					'OR' => [ 'name' => 'Oregon' ],
					'PA' => [ 'name' => 'Pennsylvania' ],
					'RI' => [ 'name' => 'Rhode Island' ],
					'SC' => [ 'name' => 'South Carolina' ],
					'SD' => [ 'name' => 'South Dakota' ],
					'TN' => [ 'name' => 'Tennessee' ],
					'TX' => [ 'name' => 'Texas' ],
					'UT' => [ 'name' => 'Utah' ],
					'VT' => [ 'name' => 'Vermont' ],
					'VA' => [ 'name' => 'Virginia' ],
					'WA' => [ 'name' => 'Washington' ],
					'WV' => [ 'name' => 'West Virginia' ],
					'WI' => [ 'name' => 'Wisconsin' ],
					'WY' => [ 'name' => 'Wyoming' ],
				];
				break;

			case 'CA':
				$states = [
					'AB' => [ 'name' => 'Alberta' ],
					'BC' => [ 'name' => 'British Columbia' ],
					'MB' => [ 'name' => 'Manitoba' ],
					'NB' => [ 'name' => 'New Brunswick' ],
					'NL' => [ 'name' => 'Newfoundland and Labrador' ],
					'NS' => [ 'name' => 'Nova Scotia' ],
					'NT' => [ 'name' => 'Northwest Territories' ],
					'NU' => [ 'name' => 'Nunavut' ],
					'ON' => [ 'name' => 'Ontario' ],
					'PE' => [ 'name' => 'Prince Edward Island' ],
					'QC' => [ 'name' => 'Quebec' ],
					'SK' => [ 'name' => 'Saskatchewan' ],
					'YT' => [ 'name' => 'Yukon' ],
				];
				break;

			case 'AU':
				$states = [
					'ACT' => [ 'name' => 'Australian Capital Territory' ],
					'NSW' => [ 'name' => 'New South Wales' ],
					'NT'  => [ 'name' => 'Northern Territory' ],
					'QLD' => [ 'name' => 'Queensland' ],
					'SA'  => [ 'name' => 'South Australia' ],
					'TAS' => [ 'name' => 'Tasmania' ],
					'VIC' => [ 'name' => 'Victoria' ],
					'WA'  => [ 'name' => 'Western Australia' ],
				];
				break;
		}

		return $states;
	}
}
