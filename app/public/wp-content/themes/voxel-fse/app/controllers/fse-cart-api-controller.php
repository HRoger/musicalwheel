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
		$multivendor_enabled = (bool) \Voxel\get( 'payments.stripe.stripe_connect.enabled', false );

		// Shipping configuration - use actual Voxel shipping zones
		$shipping_config = $this->get_shipping_config();

		// Guest checkout configuration
		$guest_customers = $this->get_guest_customers_config();

		// GeoIP providers for country detection
		$geoip_providers = [];
		if ( \Voxel\get( 'product_settings.cart_summary.geoip.enabled', false ) ) {
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
		}

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
		$saved_address = null;
		if ( is_user_logged_in() ) {
			$user = \Voxel\current_user();
			if ( $user ) {
				$saved_first_name = get_user_meta( $user->get_id(), 'voxel:shipping_first_name', true );
				$saved_last_name = get_user_meta( $user->get_id(), 'voxel:shipping_last_name', true );
				$saved_country = get_user_meta( $user->get_id(), 'voxel:shipping_country', true );

				// Only include if user has saved data
				if ( $saved_country ) {
					$saved_address = [
						'first_name' => $saved_first_name,
						'last_name'  => $saved_last_name,
						'country'    => $saved_country,
						'state'      => get_user_meta( $user->get_id(), 'voxel:shipping_state', true ),
						'address'    => get_user_meta( $user->get_id(), 'voxel:shipping_address', true ),
						'zip'        => get_user_meta( $user->get_id(), 'voxel:shipping_zip', true ),
					];
				}
			}
		}

		// Get shipping zones from Voxel
		$zones = $this->get_voxel_shipping_zones();

		// Get countries from zones
		$countries = $this->get_shipping_countries( $zones );

		// Get shipping rates order
		$rates_order = \Voxel\get( 'product_settings.shipping.rates_order', [] );
		if ( ! is_array( $rates_order ) ) {
			$rates_order = [];
		}

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
	 * Get shipping countries from zones
	 *
	 * Builds a list of all countries enabled for shipping
	 *
	 * @param object|array $zones Shipping zones
	 * @return array
	 */
	private function get_shipping_countries( $zones ): array {
		$countries = [];
		$zones_array = (array) $zones;

		// Get all country data from Voxel
		if ( class_exists( '\Voxel\Utils\Shippable_Countries' ) ) {
			$all_countries_data = \Voxel\Utils\Shippable_Countries::all();
		} else {
			$all_countries_data = $this->get_fallback_countries_list();
		}

		// Extract countries from all zones
		foreach ( $zones_array as $zone ) {
			$zone_countries = isset( $zone['countries'] ) ? $zone['countries'] : [];
			foreach ( array_keys( (array) $zone_countries ) as $country_code ) {
				if ( ! isset( $countries[ $country_code ] ) ) {
					$country_data = isset( $all_countries_data[ $country_code ] )
						? $all_countries_data[ $country_code ]
						: [ 'name' => $country_code ];

					$countries[ $country_code ] = [
						'name'   => is_array( $country_data ) ? ( $country_data['name'] ?? $country_code ) : $country_data,
						'states' => $this->get_country_states( $country_code ),
					];
				}
			}
		}

		return $countries;
	}

	/**
	 * Get default shipping country
	 *
	 * Uses Voxel's method to determine customer's country
	 *
	 * @return string|null
	 */
	private function get_default_shipping_country(): ?string {
		// First check Voxel settings for default country
		$default = \Voxel\get( 'product_settings.shipping.default_country' );
		if ( $default ) {
			return $default;
		}

		// Try to get from visitor IP if Voxel's Visitor class exists
		if ( class_exists( '\Voxel\Visitor' ) ) {
			try {
				$visitor = \Voxel\Visitor::get();
				if ( $visitor && method_exists( $visitor, 'get_country_code' ) ) {
					$country = $visitor->get_country_code();
					if ( $country ) {
						return $country;
					}
				}
			} catch ( \Exception $e ) {
				// Silent fail
			}
		}

		return null;
	}

	/**
	 * Get guest customers configuration
	 *
	 * Evidence: themes/voxel/app/widgets/cart-summary.php (lines 2600-2610)
	 *
	 * @return array
	 */
	private function get_guest_customers_config(): array {
		$behavior = \Voxel\get( 'product_settings.cart_summary.guest_customers.behavior', 'redirect_to_login' );

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
	 * Get states/provinces for a country
	 *
	 * @param string $country_code
	 * @return array
	 */
	private function get_country_states( string $country_code ): array {
		// Try Voxel's country data first
		if ( class_exists( '\Voxel\Utils\Shippable_Countries' ) ) {
			try {
				$country_data = \Voxel\Utils\Shippable_Countries::get( $country_code );
				if ( $country_data && isset( $country_data['states'] ) && is_array( $country_data['states'] ) ) {
					$states = [];
					foreach ( $country_data['states'] as $state_code => $state_name ) {
						$states[ $state_code ] = [
							'name' => is_array( $state_name ) ? ( $state_name['name'] ?? $state_code ) : $state_name,
						];
					}
					return $states;
				}
			} catch ( \Exception $e ) {
				// Fall through to fallback
			}
		}

		// Fallback state lists
		return $this->get_fallback_country_states( $country_code );
	}

	/**
	 * Get fallback countries list when Voxel's class is not available
	 *
	 * @return array
	 */
	private function get_fallback_countries_list(): array {
		return [
			'US' => [ 'name' => 'United States' ],
			'CA' => [ 'name' => 'Canada' ],
			'GB' => [ 'name' => 'United Kingdom' ],
			'AU' => [ 'name' => 'Australia' ],
			'DE' => [ 'name' => 'Germany' ],
			'FR' => [ 'name' => 'France' ],
			'ES' => [ 'name' => 'Spain' ],
			'IT' => [ 'name' => 'Italy' ],
			'NL' => [ 'name' => 'Netherlands' ],
			'BE' => [ 'name' => 'Belgium' ],
			'AT' => [ 'name' => 'Austria' ],
			'CH' => [ 'name' => 'Switzerland' ],
			'SE' => [ 'name' => 'Sweden' ],
			'NO' => [ 'name' => 'Norway' ],
			'DK' => [ 'name' => 'Denmark' ],
			'FI' => [ 'name' => 'Finland' ],
			'IE' => [ 'name' => 'Ireland' ],
			'PT' => [ 'name' => 'Portugal' ],
			'PL' => [ 'name' => 'Poland' ],
			'CZ' => [ 'name' => 'Czech Republic' ],
			'NZ' => [ 'name' => 'New Zealand' ],
			'JP' => [ 'name' => 'Japan' ],
			'KR' => [ 'name' => 'South Korea' ],
			'SG' => [ 'name' => 'Singapore' ],
			'HK' => [ 'name' => 'Hong Kong' ],
			'MX' => [ 'name' => 'Mexico' ],
			'BR' => [ 'name' => 'Brazil' ],
			'AR' => [ 'name' => 'Argentina' ],
		];
	}

	/**
	 * Get fallback states/provinces for a country
	 *
	 * @param string $country_code
	 * @return array
	 */
	private function get_fallback_country_states( string $country_code ): array {
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
					'DC' => [ 'name' => 'District of Columbia' ],
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

			case 'DE':
				$states = [
					'BW' => [ 'name' => 'Baden-Württemberg' ],
					'BY' => [ 'name' => 'Bavaria' ],
					'BE' => [ 'name' => 'Berlin' ],
					'BB' => [ 'name' => 'Brandenburg' ],
					'HB' => [ 'name' => 'Bremen' ],
					'HH' => [ 'name' => 'Hamburg' ],
					'HE' => [ 'name' => 'Hesse' ],
					'MV' => [ 'name' => 'Mecklenburg-Vorpommern' ],
					'NI' => [ 'name' => 'Lower Saxony' ],
					'NW' => [ 'name' => 'North Rhine-Westphalia' ],
					'RP' => [ 'name' => 'Rhineland-Palatinate' ],
					'SL' => [ 'name' => 'Saarland' ],
					'SN' => [ 'name' => 'Saxony' ],
					'ST' => [ 'name' => 'Saxony-Anhalt' ],
					'SH' => [ 'name' => 'Schleswig-Holstein' ],
					'TH' => [ 'name' => 'Thuringia' ],
				];
				break;
		}

		return $states;
	}
}
