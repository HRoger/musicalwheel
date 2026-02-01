<?php
/**
 * FSE Stripe Account API Controller
 *
 * Provides REST API endpoints for the Stripe Account block.
 * Handles configuration data that the frontend needs for hydration.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php (2731 lines)
 * - Voxel controller: themes/voxel/app/modules/stripe-connect/controllers/frontend/connect-frontend-controller.php
 *
 * Key Logic from Voxel:
 * 1. Check if user is logged in (required)
 * 2. Check if Stripe Connect is enabled in Voxel settings
 * 3. Get user's Stripe vendor account details
 * 4. If shipping is vendor responsibility, include countries/zones/rates data
 * 5. Generate nonces for AJAX operations
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Stripe_Account_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const API_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
		$this->on( 'wp_enqueue_scripts', '@enqueue_config' );
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/stripe-account/config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_config' ],
			'permission_callback' => [ $this, 'check_permission' ],
		] );
	}

	/**
	 * Check permission - must be logged in
	 */
	public function check_permission(): bool {
		return is_user_logged_in();
	}

	/**
	 * Get Stripe account configuration
	 *
	 * Returns the same config structure as Voxel's stripe-account-widget.php render() method
	 *
	 * @return \WP_REST_Response
	 */
	public function get_config(): \WP_REST_Response {
		// Check if Stripe Connect is enabled
		if ( ! $this->is_stripe_connect_enabled() ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Stripe Connect is not enabled.',
			], 403 );
		}

		$config = $this->build_config();

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $config,
		], 200 );
	}

	/**
	 * Check if Stripe Connect is enabled
	 *
	 * @return bool
	 */
	private function is_stripe_connect_enabled(): bool {
		if ( function_exists( '\\Voxel\\get' ) ) {
			return (bool) \Voxel\get( 'payments.stripe.stripe_connect.enabled' );
		}
		return false;
	}

	/**
	 * Build Stripe account configuration
	 *
	 * Matches Voxel's stripe-account-widget.php render() method config
	 *
	 * @return array
	 */
	private function build_config(): array {
		$user = $this->get_current_voxel_user();

		if ( ! $user ) {
			return [
				'error' => 'User not found',
			];
		}

		// Get account details
		// Voxel source: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php:2643
		$account = $this->get_stripe_vendor_details( $user );

		// Build onboard and dashboard links
		// Voxel source: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php:2645-2653
		$onboard_link = add_query_arg( [
			'vx'     => 1,
			'action' => 'stripe_connect.account.onboard',
		], home_url( '/' ) );

		$dashboard_link = add_query_arg( [
			'vx'     => 1,
			'action' => 'stripe_connect.account.login',
		], home_url( '/' ) );

		// Build base config
		// Voxel source: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php:2655-2658
		$config = [
			'nonce'                    => wp_create_nonce( 'vx_vendor_dashboard' ),
			'is_preview'               => false,
			'onboard_link'             => $onboard_link,
			'dashboard_link'           => $dashboard_link,
			'account'                  => $account,
			'is_admin'                 => $user->has_cap( 'administrator' ),
			'admin_onboarding_enabled' => apply_filters( 'voxel/stripe_connect/enable_onboarding_for_admins', false ),
			'shipping_enabled'         => false,
			'icons'                    => [],
		];

		// Add shipping data if vendor shipping is enabled
		// Voxel source: themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php:2660-2702
		if ( $this->is_vendor_shipping_enabled() ) {
			$config['shipping_enabled'] = true;

			// Get countries with subdivisions
			$countries_data       = $this->get_countries_with_subdivisions();
			$countries_by_continent = [];
			$countries_flat         = [];

			foreach ( $countries_data as $code => $country ) {
				$continent = $country['continent'] ?? 'Other';
				if ( ! isset( $countries_by_continent[ $continent ] ) ) {
					$countries_by_continent[ $continent ] = [];
				}
				$countries_by_continent[ $continent ][ $code ] = $country['name'];
				$countries_flat[ $code ] = [
					'name'      => $country['name'],
					'continent' => $continent,
					'states'    => $country['states'] ?? [],
				];
			}

			// Sort continents and countries within each continent
			ksort( $countries_by_continent );
			foreach ( $countries_by_continent as $continent => &$countries ) {
				asort( $countries );
			}

			$config['shipping_countries']              = $countries_flat;
			$config['shipping_countries_by_continent'] = $countries_by_continent;
			$config['shipping_classes']                = $this->get_shipping_classes();

			// Get user's shipping configuration
			$shipping_config         = $this->get_vendor_shipping_config( $user );
			$config['shipping_zones'] = $shipping_config['shipping_zones'] ?? [];
			$config['shipping_rates'] = $shipping_config['shipping_rates'] ?? [];

			// Primary currency for display
			$config['primary_currency'] = $this->get_primary_currency();

			$config['l10n'] = [
				'countries_selected' => _x( '@count countries selected', 'stripe vendor shipping', 'voxel' ),
			];
		}

		return $config;
	}

	/**
	 * Get current Voxel user
	 *
	 * @return \Voxel\User|null
	 */
	private function get_current_voxel_user() {
		if ( function_exists( '\\Voxel\\get_current_user' ) ) {
			return \Voxel\get_current_user();
		}
		return null;
	}

	/**
	 * Get Stripe vendor details for a user
	 *
	 * @param \Voxel\User $user
	 * @return object Account details object
	 */
	private function get_stripe_vendor_details( $user ): object {
		if ( method_exists( $user, 'get_stripe_vendor_details' ) ) {
			$details = $user->get_stripe_vendor_details();
			return (object) [
				'exists'            => $details->exists ?? false,
				'charges_enabled'   => $details->charges_enabled ?? false,
				'details_submitted' => $details->details_submitted ?? false,
			];
		}

		// Fallback
		return (object) [
			'exists'            => false,
			'charges_enabled'   => false,
			'details_submitted' => false,
		];
	}

	/**
	 * Check if vendor shipping is enabled
	 *
	 * @return bool
	 */
	private function is_vendor_shipping_enabled(): bool {
		if ( function_exists( '\\Voxel\\get' ) ) {
			return \Voxel\get( 'payments.stripe.stripe_connect.shipping.responsibility' ) === 'vendor';
		}
		return false;
	}

	/**
	 * Get countries with subdivisions
	 *
	 * @return array
	 */
	private function get_countries_with_subdivisions(): array {
		if ( class_exists( '\\Voxel\\Utils\\Data\\Countries_With_Subdivisions' ) ) {
			return \Voxel\Utils\Data\Countries_With_Subdivisions::all();
		}
		return [];
	}

	/**
	 * Get shipping classes
	 *
	 * @return array
	 */
	private function get_shipping_classes(): array {
		if ( class_exists( '\\Voxel\\Product_Types\\Shipping\\Shipping_Class' ) ) {
			$classes = [];
			foreach ( \Voxel\Product_Types\Shipping\Shipping_Class::get_all() as $shipping_class ) {
				$classes[ $shipping_class->get_key() ] = [
					'key'   => $shipping_class->get_key(),
					'label' => $shipping_class->get_label(),
				];
			}
			return $classes;
		}
		return [];
	}

	/**
	 * Get vendor shipping configuration for a user
	 *
	 * @param \Voxel\User $user
	 * @return array
	 */
	private function get_vendor_shipping_config( $user ): array {
		if ( method_exists( $user, 'get_vendor_shipping_config' ) ) {
			return $user->get_vendor_shipping_config();
		}
		return [
			'shipping_zones' => [],
			'shipping_rates' => [],
		];
	}

	/**
	 * Get primary currency
	 *
	 * @return string
	 */
	private function get_primary_currency(): string {
		if ( function_exists( '\\Voxel\\get_primary_currency' ) ) {
			return strtoupper( \Voxel\get_primary_currency() );
		}
		return 'USD';
	}

	/**
	 * Enqueue Stripe account config as inline script
	 *
	 * This makes the config available to the frontend without an extra API call
	 */
	public function enqueue_config() {
		// Only on frontend, for logged-in users
		if ( is_admin() || ! is_user_logged_in() ) {
			return;
		}

		// Check if Stripe Connect is enabled
		if ( ! $this->is_stripe_connect_enabled() ) {
			return;
		}

		// Enqueue config data for AJAX calls
		$ajax_data = [
			'ajaxUrl' => home_url( '/?vx=1' ),
			'nonce'   => wp_create_nonce( 'vx_vendor_dashboard' ),
		];

		// We'll attach this to a common script that should exist
		wp_add_inline_script(
			'voxel-fse-stripe-account-frontend',
			'window.voxelStripeAccount = ' . wp_json_encode( $ajax_data ) . ';',
			'before'
		);
	}
}
