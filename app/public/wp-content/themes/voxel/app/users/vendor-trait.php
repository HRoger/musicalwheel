<?php

namespace Voxel\Users;

use Voxel\Utils\Config_Schema\Schema as Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

trait Vendor_Trait {

	public static function get_by_stripe_vendor_id( $vendor_id ): ?\Voxel\User {
		$meta_key = \Voxel\Modules\Stripe_Payments\Stripe_Client::is_test_mode() ? 'voxel:test_stripe_account_id' : 'voxel:stripe_account_id';
		$results = get_users( [
			'meta_key' => $meta_key,
			'meta_value' => $vendor_id,
			'number' => 1,
			'fields' => 'ID',
		] );

		return \Voxel\User::get( array_shift( $results ) );
	}

	public function get_stripe_vendor_id() {
		$meta_key = \Voxel\Modules\Stripe_Payments\Stripe_Client::is_test_mode() ? 'voxel:test_stripe_account_id' : 'voxel:stripe_account_id';
		return get_user_meta( $this->get_id(), $meta_key, true );
	}

	public function get_stripe_vendor() {
		$vendor_id = $this->get_stripe_vendor_id();
		if ( empty( $vendor_id ) ) {
			throw new \Exception( _x( 'Stripe account not set up for this user.', 'orders', 'voxel' ) );
		}

		$stripe = \Voxel\Modules\Stripe_Payments\Stripe_Client::getClient();
		return $stripe->accounts->retrieve( $vendor_id );
	}

	public function get_or_create_stripe_vendor() {
		try {
			$account = $this->get_stripe_vendor();
		} catch ( \Exception $e ) {
			$stripe = \Voxel\Modules\Stripe_Payments\Stripe_Client::getClient();
			$account = $stripe->accounts->create( [
				'type' => 'express',
				'email' => $this->get_email(),
			] );

			$meta_key = \Voxel\Modules\Stripe_Payments\Stripe_Client::is_test_mode() ? 'voxel:test_stripe_account_id' : 'voxel:stripe_account_id';
			update_user_meta( $this->get_id(), $meta_key, $account->id );
			$this->stripe_vendor_updated( $account );
		}

		return $account;
	}

	public function stripe_vendor_updated( \Voxel\Vendor\Stripe\Account $account ) {
		$meta_key = \Voxel\Modules\Stripe_Payments\Stripe_Client::is_test_mode() ? 'voxel:test_stripe_account' : 'voxel:stripe_account';
		update_user_meta( $this->get_id(), $meta_key, wp_slash( wp_json_encode( [
			'charges_enabled' => $account->charges_enabled,
			'details_submitted' => $account->details_submitted,
			'payouts_enabled' => $account->payouts_enabled,
		] ) ) );
	}

	public function get_stripe_vendor_details() {
		if ( ! is_null( $this->account_details ) ) {
			return $this->account_details;
		}

		$account_id = $this->get_stripe_vendor_id();
		$meta_key = \Voxel\Modules\Stripe_Payments\Stripe_Client::is_test_mode() ? 'voxel:test_stripe_account' : 'voxel:stripe_account';
		$details = (array) json_decode( get_user_meta( $this->get_id(), $meta_key, true ), true );

		$this->account_details = (object) [
			'exists' => ! empty( $account_id ),
			'id' => $account_id,
			'charges_enabled' => $details['charges_enabled'] ?? false,
			'details_submitted' => $details['details_submitted'] ?? false,
			'payouts_enabled' => $details['payouts_enabled'] ?? false,
		];

		return $this->account_details;
	}

	public function is_active_vendor(): bool {
		if ( \Voxel\get( 'payments.provider' ) !== 'stripe' ) {
			return false;
		}

		if ( ! \Voxel\get( 'payments.stripe.stripe_connect.enabled' ) ) {
			return false;
		}

		if ( $this->has_cap('administrator') && apply_filters( 'voxel/stripe_connect/enable_onboarding_for_admins', false ) !== true ) {
			return false;
		}

		$details = $this->get_stripe_vendor_details();

		return $details->exists && $details->charges_enabled;
	}

	public function is_vendor_of( $order_id ): bool {
		$order = \Voxel\Product_Types\Orders\Order::get( $order_id );
		return $order->get_vendor_id() === $this->get_id();
	}

	public function get_vendor_fees(): array {
		$schema = Schema::Object_List( [
			'key' => Schema::String(),
			'label' => Schema::String(),
			'type' => Schema::Enum( [ 'fixed', 'percentage' ] )->default('fixed'),
			'fixed_amount' => Schema::Float()->min(0),
			'percentage_amount' => Schema::Float()->min(0)->max(100),
			'apply_to' => Schema::Enum( [ 'all', 'custom' ] )->default('all'),
			'conditions' => Schema::Object_List( [
				'source' => Schema::Enum( [ 'vendor_plan', 'vendor_role', 'vendor_id' ] ),
				'comparison' => Schema::Enum( [ 'equals', 'not_equals' ] ),
				'value' => Schema::String(),
			] )->default([]),
		] )->default([]);

		$schema->set_value( \Voxel\get('payments.stripe.stripe_connect.vendor_fees') );
		$items = $schema->export();

		$fees = [];

		$membership = $this->get_membership();
		$plan_key = $membership->is_active() ? $membership->get_active_plan()->get_key() : 'default';

		foreach ( $items as $item ) {
			if ( $item['apply_to'] === 'custom' ) {
				$passes_conditions = false;
				foreach ( $item['conditions'] as $condition ) {
					if ( $condition['source'] === 'vendor_plan' ) {
						if ( $condition['comparison'] === 'equals' && $condition['value'] === $plan_key ) {
							$passes_conditions = true;
							break;
						} elseif ( $condition['comparison'] === 'not_equals' && $condition['value'] !== $plan_key ) {
							$passes_conditions = true;
							break;
						}
					} elseif ( $condition['source'] === 'vendor_role' ) {
						if ( $condition['comparison'] === 'equals' && $this->has_role( $condition['value'] ) ) {
							$passes_conditions = true;
							break;
						} elseif ( $condition['comparison'] === 'not_equals' && ! $this->has_role( $condition['value'] ) ) {
							$passes_conditions = true;
							break;
						}
					} elseif ( $condition['source'] === 'vendor_id' ) {
						if ( $condition['comparison'] === 'equals' && absint( $condition['value'] ) === absint( $this->get_id() ) ) {
							$passes_conditions = true;
							break;
						} elseif ( $condition['comparison'] === 'not_equals' && absint( $condition['value'] ) !== absint( $this->get_id() ) ) {
							$passes_conditions = true;
							break;
						}
					}
				}

				if ( ! $passes_conditions ) {
					continue;
				}
			}

			if ( $item['type'] === 'fixed' ) {
				if ( ! ( is_numeric( $item['fixed_amount'] ) && $item['fixed_amount'] > 0 ) ) {
					continue;
				}

				$fees[] = [
					'key' => $item['key'],
					'label' => $item['label'],
					'type' => $item['type'],
					'fixed_amount' => $item['fixed_amount'],
				];
			} elseif ( $item['type'] === 'percentage' ) {
				if ( ! ( is_numeric( $item['percentage_amount'] ) && $item['percentage_amount'] > 0 && $item['percentage_amount'] <= 100 ) ) {
					continue;
				}

				$fees[] = [
					'key' => $item['key'],
					'label' => $item['label'],
					'type' => $item['type'],
					'percentage_amount' => $item['percentage_amount'],
				];
			}
		}

		return $fees;
	}

	/**
	 * Schema for vendor shipping configuration (zones + rates stored separately)
	 */
	public function get_vendor_shipping_schema(): \Voxel\Utils\Config_Schema\Data_Object {
		return Schema::Object( [
			'shipping_zones' => Schema::Object_List( [
				'key' => Schema::String(),
				'label' => Schema::String(),
				'regions' => Schema::Object_List( [
					'type' => Schema::Enum( [ 'country' ] )->default('country'),
					'country' => Schema::String(),
					'states' => Schema::List()->default([]),
					'zip_codes_enabled' => Schema::Bool()->default(false),
					'zip_codes' => Schema::String()->default(''),
				] )->default([]),
				'rates' => Schema::List()->default([]), // Now stores rate keys only
			] )->default([]),
			'shipping_rates' => Schema::Object_List( [
				'key' => Schema::String(),
				'label' => Schema::String(),
				'type' => Schema::Enum( [ 'free_shipping', 'fixed_rate' ] )->default('free_shipping'),
				'free_shipping' => Schema::Object( [
					'requirements' => Schema::Enum( [ 'none', 'minimum_order_amount' ] )->default('none'),
					'minimum_order_amount' => Schema::Float()->min(0)->default(0),
					'delivery_estimate' => Schema::Object( [
						'enabled' => Schema::Bool()->default(false),
						'minimum' => Schema::Object( [
							'unit' => Schema::Enum( [ 'hour', 'day', 'business_day', 'week', 'month' ] )->default('business_day'),
							'value' => Schema::Int()->min(1),
						] ),
						'maximum' => Schema::Object( [
							'unit' => Schema::Enum( [ 'hour', 'day', 'business_day', 'week', 'month' ] )->default('business_day'),
							'value' => Schema::Int()->min(1),
						] ),
					] ),
				] ),
				'fixed_rate' => Schema::Object( [
					'delivery_estimate' => Schema::Object( [
						'enabled' => Schema::Bool()->default(false),
						'minimum' => Schema::Object( [
							'unit' => Schema::Enum( [ 'hour', 'day', 'business_day', 'week', 'month' ] )->default('business_day'),
							'value' => Schema::Int()->min(1)->default(1),
						] ),
						'maximum' => Schema::Object( [
							'unit' => Schema::Enum( [ 'hour', 'day', 'business_day', 'week', 'month' ] )->default('business_day'),
							'value' => Schema::Int()->min(1)->default(1),
						] ),
					] ),
					'amount_per_unit' => Schema::Float()->min(0)->default(0),
					'calculation_method' => Schema::Enum( [ 'per_item', 'per_order', 'per_class' ] )->default('per_item'),
					'shipping_classes' => Schema::Object_List( [
						'shipping_class' => Schema::String(),
						'amount_per_unit' => Schema::Float()->min(0)->default(0),
					] )->validator( function( $item ) {
						return !! \Voxel\Product_Types\Shipping\Shipping_Class::get( $item['shipping_class'] ?? null );
					} )->default([]),
				] ),
			] )->default([]),
		] );
	}

	/**
	 * @deprecated Use get_vendor_shipping_schema() instead
	 */
	public function get_vendor_shipping_zones_schema(): \Voxel\Utils\Config_Schema\Data_Object_List {
		return $this->get_vendor_shipping_schema()->get_prop('shipping_zones');
	}

	/**
	 * Get vendor shipping configuration (zones + rates)
	 */
	public function get_vendor_shipping_config(): array {
		$schema = $this->get_vendor_shipping_schema();
		$stored_data = (array) json_decode( get_user_meta( $this->get_id(), 'voxel:vendor_shipping', true ), true );

		// Migration: check for old format (zones stored separately with embedded rates)
		if ( empty( $stored_data ) ) {
			$old_zones = (array) json_decode( get_user_meta( $this->get_id(), 'voxel:vendor_shipping_zones', true ), true );
			if ( ! empty( $old_zones ) ) {
				$stored_data = $this->migrate_vendor_shipping_data( $old_zones );
			}
		}

		$schema->set_value( $stored_data );
		return $schema->export();
	}

	/**
	 * Migrate old vendor shipping data (rates embedded in zones) to new format (rates separate)
	 */
	protected function migrate_vendor_shipping_data( array $old_zones ): array {
		$new_zones = [];
		$new_rates = [];
		$rate_keys_map = []; // To avoid duplicate rates

		foreach ( $old_zones as $zone ) {
			$zone_rate_keys = [];

			// Extract rates from zone
			if ( ! empty( $zone['rates'] ) && is_array( $zone['rates'] ) ) {
				foreach ( $zone['rates'] as $rate ) {
					if ( ! empty( $rate['key'] ) ) {
						// Only add rate if not already added
						if ( ! isset( $rate_keys_map[ $rate['key'] ] ) ) {
							$new_rates[] = $rate;
							$rate_keys_map[ $rate['key'] ] = true;
						}
						$zone_rate_keys[] = $rate['key'];
					}
				}
			}

			// Create new zone with rate keys only
			$new_zones[] = [
				'key' => $zone['key'] ?? '',
				'label' => $zone['label'] ?? '',
				'regions' => $zone['regions'] ?? [],
				'rates' => $zone_rate_keys,
			];
		}

		return [
			'shipping_zones' => $new_zones,
			'shipping_rates' => $new_rates,
		];
	}

	/**
	 * @deprecated Use get_vendor_shipping_config() instead
	 */
	public function get_vendor_shipping_zones_config(): array {
		$config = $this->get_vendor_shipping_config();
		return $config['shipping_zones'] ?? [];
	}

	protected $_get_vendor_shipping_zones;
	public function get_vendor_shipping_zones(): array {
		if ( $this->_get_vendor_shipping_zones === null ) {
			$this->_get_vendor_shipping_zones = [];
			$config = $this->get_vendor_shipping_config();

			// Build rates lookup
			$rates_by_key = [];
			foreach ( $config['shipping_rates'] ?? [] as $rate_data ) {
				if ( isset( $rate_data['key'] ) ) {
					$rates_by_key[ $rate_data['key'] ] = $rate_data;
				}
			}

			foreach ( $config['shipping_zones'] ?? [] as $data ) {
				$shipping_zone = new \Voxel\Product_Types\Shipping\Vendor_Shipping_Zone( $data, $rates_by_key );
				$this->_get_vendor_shipping_zones[ $shipping_zone->get_key() ] = $shipping_zone;
			}
		}

		return $this->_get_vendor_shipping_zones;
	}

	public function get_vendor_shipping_zone( ?string $shipping_zone_key ) {
		$shipping_zones = $this->get_vendor_shipping_zones();
		return $shipping_zones[ $shipping_zone_key ] ?? null;
	}

}
