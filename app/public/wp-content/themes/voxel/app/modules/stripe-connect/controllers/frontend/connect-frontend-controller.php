<?php

namespace Voxel\Modules\Stripe_Connect\Controllers\Frontend;

use Voxel\Modules\Stripe_Connect as Module;
use Voxel\Utils\Config_Schema\Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Connect_Frontend_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel_ajax_stripe_connect.account.onboard', '@onboard_account' );
		$this->on( 'voxel_ajax_stripe_connect.account.save_shipping', '@save_vendor_shipping' );
		$this->on( 'voxel_ajax_stripe_connect.account.login', '@access_dashboard' );
		$this->on( 'voxel/stripe_connect/event:account.updated', '@account_updated', 10, 2 );

		$this->on( 'voxel_ajax_stripe_connect.sales_chart.get_data', '@get_sales_data' );
	}

	protected function onboard_account() {
		try {
			$stripe = \Voxel\Modules\Stripe_Payments\Stripe_Client::getClient();
			$user = \Voxel\get_current_user();
			$account = $user->get_or_create_stripe_vendor();

			$onboarding_key = \Voxel\random_string(8);
			update_user_meta( $user->get_id(), 'voxel:connect_onboarding_key', $onboarding_key );

			$link = $stripe->accountLinks->create( [
				'account' => $account->id,
				'refresh_url' => add_query_arg( [
					'vx' => 1,
					'action' => 'stripe.account.onboard',
				], home_url('/') ),
				'return_url' => add_query_arg( 'onboarding_key', $onboarding_key, \Voxel\get_template_link('stripe_account') ),
				'type' => 'account_onboarding',
			] );

			wp_redirect( $link->url );
			die;
		} catch ( \Exception $e ) {
			wp_die( $e->getMessage() );
		}
	}

	protected function save_vendor_shipping() {
		try {
			\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_vendor_dashboard' );
			if ( ( $_SERVER['REQUEST_METHOD'] ?? null ) !== 'POST' ) {
				throw new \Exception( __( 'Invalid request.', 'voxel' ) );
			}

			$shipping_zones = (array) json_decode( wp_unslash( $_REQUEST['shipping_zones'] ?? '' ), true );
			$shipping_rates = (array) json_decode( wp_unslash( $_REQUEST['shipping_rates'] ?? '' ), true );

			$vendor = \Voxel\get_current_user();
			$schema = $vendor->get_vendor_shipping_schema();

			$schema->set_value( [
				'shipping_zones' => $shipping_zones,
				'shipping_rates' => $shipping_rates,
			] );
			$value = $schema->export();

			$zones = $value['shipping_zones'] ?? [];
			$rates = $value['shipping_rates'] ?? [];

			if ( count( $zones ) > 10 ) {
				throw new \Exception( _x( 'You cannot add more than 10 shipping zones', 'stripe vendor shipping', 'voxel' ) );
			}

			if ( count( $rates ) > 50 ) {
				throw new \Exception( _x( 'You cannot add more than 50 shipping rates', 'stripe vendor shipping', 'voxel' ) );
			}

			$validate_delivery_estimate = function( $estimate ) {
				// @todo
			};

			// Validate zones
			foreach ( $zones as $zone_index => $zone ) {
				if ( $zone['key'] === null || mb_strlen( $zone['key'] ) !== 8 ) {
					throw new \Exception( _x( 'Could not save shipping details', 'stripe vendor shipping', 'voxel' ), 90 );
				}

				if ( $zone['label'] === null || mb_strlen( $zone['label'] ) > 32 ) {
					throw new \Exception( _x( 'Shipping zone label is required', 'stripe vendor shipping', 'voxel' ), 91 );
				}

				if ( empty( $zone['regions'] ) ) {
					throw new \Exception( _x( 'Shipping zones must have at least one region selected', 'stripe vendor shipping', 'voxel' ), 92 );
				}
			}

			// Validate rates
			foreach ( $rates as $rate_index => $rate ) {
				if ( $rate['key'] === null || mb_strlen( $rate['key'] ) !== 8 ) {
					throw new \Exception( _x( 'Could not save shipping details', 'stripe vendor shipping', 'voxel' ), 94 );
				}

				if ( $rate['label'] === null || mb_strlen( $rate['label'] ) > 32 ) {
					throw new \Exception( _x( 'Shipping rate label is required', 'stripe vendor shipping', 'voxel' ), 95 );
				}

				if ( $rate['type'] === 'free_shipping' ) {
					if ( $rate['free_shipping']['delivery_estimate']['enabled'] ) {
						$validate_delivery_estimate( $rate['free_shipping']['delivery_estimate'] );
					}
				} elseif ( $rate['type'] === 'fixed_rate' ) {
					if ( $rate['fixed_rate']['delivery_estimate']['enabled'] ) {
						$validate_delivery_estimate( $rate['fixed_rate']['delivery_estimate'] );
					}

					if ( count( $rate['fixed_rate']['shipping_classes'] ) > 100 ) {
						throw new \Exception( _x( 'Could not save shipping details', 'stripe vendor shipping', 'voxel' ), 96 );
					}
				}
			}

			// Save using new meta key
			update_user_meta( $vendor->get_id(), 'voxel:vendor_shipping', wp_slash( wp_json_encode( Schema::optimize_for_storage( $value ) ) ) );

			// delete old meta (no longer used)
			delete_user_meta( $vendor->get_id(), 'voxel:vendor_shipping_zones' );

			return wp_send_json( [
				'success' => true,
				'message' => _x( 'Shipping details saved.', 'stripe vendor shipping', 'voxel' ),
			] );
		} catch ( \Exception $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
			] );
		}
	}

	protected function access_dashboard() {
		try {
			$stripe = \Voxel\Modules\Stripe_Payments\Stripe_Client::getClient();
			$user = \Voxel\get_current_user();
			$link = $stripe->accounts->createLoginLink( $user->get_stripe_vendor_id(), [
				'redirect_url' => \Voxel\get_template_link('stripe_account'),
			] );

			wp_redirect( $link->url );
			die;
		} catch ( \Exception $e ) {
			wp_die( $e->getMessage() );
		}
	}

	protected function account_updated( $event, $account ) {
		if ( $user = \Voxel\User::get_by_stripe_vendor_id( $account->id ) ) {
			$user->stripe_vendor_updated( $account );
		}
	}

	protected function get_sales_data() {
		try {
			$chart = $_GET['chart'] ?? null;
			$direction = ( $_GET['direction'] ?? null ) === 'next' ? 'next' : 'prev';
			$date = strtotime( $_GET['date'] ?? null );

			if ( ! in_array( $chart, [ 'this-week', 'this-month', 'this-year' ], true ) || ! $date ) {
				throw new \Exception( __( 'Invalid request.', 'voxel' ) );
			}

			$user = \Voxel\get_current_user();
			$stats = Module\Vendor_Stats::get( $user );

			if ( $chart === 'this-week' ) {
				$change = $direction === 'next' ? '+7 days' : '-7 days';
				$data = $stats->get_week_chart( date( 'Y-m-d', strtotime( $change, $date ) ) );
			} elseif ( $chart === 'this-month' ) {
				$change = $direction === 'next' ? '+1 month' : '-1 month';
				$data = $stats->get_month_chart( date( 'Y-m-01', strtotime( $change, $date ) ) );
			} else {
				$change = $direction === 'next' ? '+1 year' : '-1 year';
				$data = $stats->get_year_chart( (int) date( 'Y', strtotime( $change, $date ) ) );
			}

			return wp_send_json( [
				'success' => true,
				'data' => $data,
			] );
		} catch ( \Exception $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
			] );
		}
	}
}
