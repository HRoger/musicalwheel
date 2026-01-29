<?php

namespace Voxel\Product_Types\Cart;

use \Voxel\Utils\Config_Schema\Schema;
use Voxel\Product_Types\Payment_Services\Base_Payment_Service as Payment_Service;

if ( ! defined('ABSPATH') ) {
	exit;
}

abstract class Base_Cart {

	protected $items = [];

	protected
		$shipping_address,
		$shipping_zone,
		$shipping_rate,
		$shipping_rates_by_vendor;

	abstract public function update(): void;

	abstract public function get_type(): string;

	public function get_items(): array {
		return $this->items;
	}

	public function get_item( string $item_key ): ?\Voxel\Product_Types\Cart_Items\Cart_Item {
		return $this->items[ $item_key ] ?? null;
	}

	public function add_item( \Voxel\Product_Types\Cart_Items\Cart_Item $new_item ): void {
		if ( ! $this->supports_cart_item( $new_item ) ) {
			throw new \Exception( __( 'This product cannot be added to cart', 'voxel' ) );
		}

		// validate configuration
		$new_item->validate();

		// validate stock
		$stock_id = $new_item->get_stock_id();
		if ( $stock_id !== null ) {
			$max_stock_quantity = $new_item->get_max_stock_quantity();

			foreach ( $this->items as $key => $item ) {
				if ( $item->get_stock_id() !== $stock_id ) {
					continue;
				}

				$max_stock_quantity -= $item->get_stock_quantity();
				if ( $max_stock_quantity < $new_item->get_stock_quantity() ) {
					throw new \Exception( \Voxel\replace_vars( __( 'Can\'t add more than @max_quantity item(s) to cart.', 'voxel' ), [
						'@max_quantity' => $new_item->get_max_stock_quantity(),
					] ) );
				}
			}
		}

		// handle grouping
		$group_id = $new_item->get_group_id();
		$grouped = false;
		if ( $group_id !== null ) {
			foreach ( $this->items as $key => $item ) {
				if ( $item->get_group_id() !== $group_id ) {
					continue;
				}

				$item->set_stock_quantity( $item->get_stock_quantity() + $new_item->get_stock_quantity() );
				$grouped = true;
				break;
			}
		}

		if ( ! $grouped ) {
			if ( count( $this->items ) >= $this->get_max_cart_quantity() ) {
				throw new \Exception( \Voxel\replace_vars( __( 'You cannot add more than @max_quantity items to cart', 'voxel' ), [
					'@max_quantity' => $this->get_max_cart_quantity(),
				] ), 101 );
			}

			$this->items[ $new_item->get_key() ] = $new_item;
		}
	}

	public function remove_item( $item_key ): void {
		unset( $this->items[ $item_key ] );
	}

	public function supports_cart_item( \Voxel\Product_Types\Cart_Items\Cart_Item $item ): bool {
		return $item->get_product_field()->can_be_added_to_cart();
	}

	public function set_item_quantity( string $item_key, int $quantity ): void {
		$subject = $this->items[ $item_key ] ?? null;
		if ( $subject === null ) {
			throw new \Exception( __( 'Product not found.', 'voxel' ) );
		}

		$subject->set_stock_quantity( $quantity );

		// validate stock
		$stock_id = $subject->get_stock_id();
		if ( $stock_id !== null ) {
			$max_stock_quantity = $subject->get_max_stock_quantity();

			foreach ( $this->items as $key => $item ) {
				if ( $subject === $item ) {
					continue;
				}

				if ( $item->get_stock_id() !== $stock_id ) {
					continue;
				}

				$max_stock_quantity -= $item->get_stock_quantity();
				if ( $max_stock_quantity < $subject->get_stock_quantity() ) {
					throw new \Exception( \Voxel\replace_vars( __( 'Can\'t add more than @max_quantity item(s) to cart.', 'voxel' ), [
						'@max_quantity' => $subject->get_max_stock_quantity(),
					] ) );
				}
			}
		}
	}

	public function empty(): void {
		$this->items = [];
	}

	public function is_empty(): bool {
		return empty( $this->items );
	}

	public function get_max_cart_quantity(): int {
		return 20;
	}

	public function get_customer_id(): ?int {
		return \Voxel\get_current_user()->get_id() ?? null;
	}

	public function get_vendor_id(): ?int {
		if (
			$this->get_payment_method() === 'stripe_payment'
			&& \Voxel\get('payments.stripe.stripe_connect.enabled')
			&& \Voxel\get('payments.stripe.stripe_connect.charge_type') === 'separate_charges_and_transfers'
		) {
			return null;
		}

		if (
			\Voxel\get( 'product_settings.orders.managed_by', 'platform' ) === 'platform'
			&& ! (
				\Voxel\get('payments.stripe.stripe_connect.enabled')
				&& in_array( $this->get_payment_method(), [ 'stripe_payment', 'stripe_subscription' ], true )
			)
		) {
			return null;
		}

		$items = $this->get_items();
		if ( count( $items ) === 1 ) {
			foreach ( $items as $item ) {
				if ( $vendor = $item->get_vendor() ) {
					return $vendor->get_id();
				}
			}
		}

		return null;
	}

	public function get_payment_method(): ?string {
		$payment_service = Payment_Service::get_active();
		return $payment_service ? $payment_service->get_payment_handler() : null;
	}

	public function get_currency() {
		return \Voxel\get_primary_currency();
	}

	public function get_subtotal() {
		$subtotal = 0;
		foreach ( $this->get_items() as $item ) {
			$summary = $item->get_pricing_summary();
			$subtotal += $summary['total_amount'];
		}

		return abs( $subtotal );
	}

	public function validate(): void {
		$stock_data = [];

		foreach ( $this->items as $key => $item ) {
			try {
				$stock_id = $item->get_stock_id();
				if ( $stock_id !== null ) {
					if ( ! isset( $stock_data[ $stock_id ] ) ) {
						$stock_data[ $stock_id ] = $item->get_max_stock_quantity();
					}

					$stock_data[ $stock_id ] -= $item->get_stock_quantity();
					if ( $stock_data[ $stock_id ] < 0 ) {
						throw new \Exception( __( 'No additional items are in stock for this product.', 'voxel' ) );
					}
				}

				$item->validate();
			} catch ( \Exception $e ) {
				unset( $this->items[ $key ] );
			}
		}
	}

	protected $_order_notes = null;
	public function set_order_notes( ?string $order_notes ): void {
		$this->_order_notes = $order_notes;
	}

	public function get_order_notes(): ?string {
		return $this->_order_notes;
	}

	public function has_shippable_products(): bool {
		foreach ( $this->get_items() as $item ) {
			if ( $item->is_shippable() ) {
				return true;
			}
		}

		return false;
	}

	public function get_shipping_method(): ?string {
		if ( \Voxel\get('payments.stripe.stripe_connect.enabled') ) {
			if ( \Voxel\get('payments.stripe.stripe_connect.shipping.responsibility') !== 'vendor' ) {
				return 'platform_rates';
			}

			$vendors = $this->get_vendors();
			if ( count( $vendors ) === 1 && isset( $vendors['platform'] ) ) {
				return 'platform_rates';
			}

			if ( count( $vendors ) >= 1 ) {
				return 'vendor_rates';
			}

			return null;
		} else {
			return 'platform_rates';
		}
	}

	public function get_vendors(): array {
		$vendors = [];
		if ( empty( $this->items ) ) {
			return $vendors;
		}

		foreach ( $this->items as $item ) {
			$vendor = $item->get_vendor();
			$vendor_key = $vendor !== null ? sprintf( 'vendor_%d', $vendor->get_id() ) : 'platform';

			if ( ! isset( $vendors[ $vendor_key ] ) ) {
				$vendors[ $vendor_key ] = [
					'id' => $vendor !== null ? $vendor->get_id() : null,
					'key' => $vendor_key,
					'items' => [],
					'has_shippable_products' => false,
				];
			}

			$vendors[ $vendor_key ]['items'][ $item->get_key() ] = $item;
			if ( $item->is_shippable() ) {
				$vendors[ $vendor_key ]['has_shippable_products'] = true;
			}
		}

		return $vendors;
	}

	public function set_shipping( array $details ) {
		if ( $this->has_shippable_products() ) {
			$this->set_shipping_address( (array) ( $details['address'] ?? [] ) );

			if ( $this->get_shipping_method() === 'vendor_rates' ) {
				// Address must be set first
				if ( $this->shipping_address === null ) {
					throw new \Exception( _x( 'Shipping address must be set before selecting shipping rates', 'shipping', 'voxel' ) );
				}

				$rates_by_vendor = [];

				foreach ( $this->get_vendors() as $vendor ) {
					if ( ! $vendor['has_shippable_products'] ) {
						continue;
					}

					$zone_key = $details['vendors'][ $vendor['key'] ]['zone'] ?? null;
					$rate_key = $details['vendors'][ $vendor['key'] ]['rate'] ?? null;

					if ( $vendor['key'] !== 'platform' ) {
						$vendor_user = \Voxel\User::get( $vendor['id'] );
						$shipping_zone = $vendor_user->get_vendor_shipping_zone( $zone_key );
						if ( ! $shipping_zone ) {
							throw new \Exception( _x( 'No shipping zone selected', 'shipping', 'voxel' ) );
						}

						$shipping_rate = $shipping_zone->get_rate( $rate_key );
						if ( ! $shipping_rate ) {
							throw new \Exception( _x( 'No shipping rate selected', 'shipping', 'voxel' ) );
						}

						// Validate shipping zone supports address country
						$supported_country_codes = $shipping_zone->get_supported_country_codes();
						if ( ! isset( $supported_country_codes[ $this->shipping_address['country'] ] ) ) {
							throw new \Exception( _x( 'Please select a valid shipping zone', 'shipping', 'voxel' ) );
						}

						// Validate shipping zone supports user address (state and ZIP code restrictions)
						$state_code = $this->shipping_address['state'];
						if ( ! $shipping_zone->matches_location( $this->shipping_address['country'], $state_code, $this->shipping_address['zip'] ) ) {
							throw new \Exception( _x( 'The selected shipping zone does not support this address', 'shipping', 'voxel' ) );
						}

						$rates_by_vendor[ $vendor['key'] ] = [
							'zone' => $shipping_zone,
							'rate' => $shipping_rate,
						];
					} else {
						$shipping_zone = \Voxel\Product_Types\Shipping\Shipping_Zone::get( $zone_key );
						if ( ! $shipping_zone ) {
							throw new \Exception( _x( 'No shipping zone selected', 'shipping', 'voxel' ) );
						}

						$shipping_rate = $shipping_zone->get_rate( $rate_key );
						if ( ! $shipping_rate ) {
							throw new \Exception( _x( 'No shipping rate selected', 'shipping', 'voxel' ) );
						}

						// Validate shipping zone supports address country
						$supported_country_codes = $shipping_zone->get_supported_country_codes();
						if ( ! isset( $supported_country_codes[ $this->shipping_address['country'] ] ) ) {
							throw new \Exception( _x( 'Please select a valid shipping zone', 'shipping', 'voxel' ) );
						}

						// Validate shipping zone supports user address (state and ZIP code restrictions)
						$state_code = $this->shipping_address['state'];
						if ( ! $shipping_zone->matches_location( $this->shipping_address['country'], $state_code, $this->shipping_address['zip'] ) ) {
							throw new \Exception( _x( 'The selected shipping zone does not support this address', 'shipping', 'voxel' ) );
						}

						$rates_by_vendor[ $vendor['key'] ] = [
							'zone' => $shipping_zone,
							'rate' => $shipping_rate,
						];
					}
				}

				$this->set_shipping_rates_by_vendor( $rates_by_vendor );
			} else {
				$this->set_shipping_rate( (array) ( $details['method'] ?? [] ) );
			}
		}
	}

	public function set_shipping_address( array $details ): void {
		$schema = Schema::Object( [
			'first_name' => Schema::String()->maxlength(50)->default(''),
			'last_name' => Schema::String()->maxlength(50)->default(''),
			'country' => Schema::String()->maxlength(2),
			'state' => Schema::String()->maxlength(20)->default(''),
			'address' => Schema::String()->maxlength(200)->default(''),
			'zip' => Schema::String()->maxlength(30)->default(''),
		] );

		$schema->set_value( $details );
		$details = $schema->export();

		// Validate required fields
		if ( empty( trim( $details['first_name'] ) ) ) {
			throw new \Exception( _x( 'First name is required', 'shipping', 'voxel' ) );
		}

		if ( empty( trim( $details['last_name'] ) ) ) {
			throw new \Exception( _x( 'Last name is required', 'shipping', 'voxel' ) );
		}

		if ( empty( trim( $details['address'] ) ) ) {
			throw new \Exception( _x( 'Address is required', 'shipping', 'voxel' ) );
		}

		if ( empty( trim( $details['zip'] ) ) ) {
			throw new \Exception( _x( 'ZIP / Postal code is required', 'shipping', 'voxel' ) );
		}

		// Validate country
		if ( empty( trim( $details['country'] ) ) ) {
			throw new \Exception( _x( 'Country is required', 'shipping', 'voxel' ) );
		}

		$countries_data = \Voxel\Utils\Data\Countries_With_Subdivisions::all();
		if ( ! isset( $countries_data[ $details['country'] ] ) ) {
			throw new \Exception( _x( 'Invalid country code', 'shipping', 'voxel' ) );
		}

		$country_data = $countries_data[ $details['country'] ];
		$has_states = ! empty( $country_data['states'] ) && is_array( $country_data['states'] );

		// Validate state if country has states
		if ( $has_states ) {
			if ( empty( trim( $details['state'] ) ) ) {
				throw new \Exception( _x( 'State / County is required', 'shipping', 'voxel' ) );
			}

			if ( ! isset( $country_data['states'][ $details['state'] ] ) ) {
				throw new \Exception( _x( 'Invalid state code', 'shipping', 'voxel' ) );
			}
		}

		$this->shipping_address = [
			'first_name' => $details['first_name'],
			'last_name' => $details['last_name'],
			'country' => $details['country'],
			'state' => $has_states ? $details['state'] : null,
			'address' => $details['address'],
			'zip' => $details['zip'],
		];
	}

	public function set_shipping_rate( array $details ): void {
		// Address must be set first
		if ( $this->shipping_address === null ) {
			throw new \Exception( _x( 'Shipping address must be set before selecting a shipping rate', 'shipping', 'voxel' ) );
		}

		$schema = Schema::Object( [
			'zone' => Schema::String()->default(''),
			'rate' => Schema::String()->default(''),
		] );

		$schema->set_value( $details );
		$details = $schema->export();

		$shipping_zone = \Voxel\Product_Types\Shipping\Shipping_Zone::get( $details['zone'] );
		if ( ! $shipping_zone ) {
			throw new \Exception( _x( 'No shipping zone selected', 'shipping', 'voxel' ) );
		}

		$shipping_rate = $shipping_zone->get_rate( $details['rate'] );
		if ( ! $shipping_rate ) {
			throw new \Exception( _x( 'No shipping rate selected', 'shipping', 'voxel' ) );
		}

		$supported_country_codes = $shipping_zone->get_supported_country_codes();
		if ( ! isset( $supported_country_codes[ $this->shipping_address['country'] ] ) ) {
			throw new \Exception( _x( 'Please select a valid shipping zone', 'shipping', 'voxel' ) );
		}

		// Validate shipping zone supports user address (state and ZIP code restrictions)
		$state_code = $this->shipping_address['state'];
		if ( ! $shipping_zone->matches_location( $this->shipping_address['country'], $state_code, $this->shipping_address['zip'] ) ) {
			throw new \Exception( _x( 'The selected shipping zone does not support this address', 'shipping', 'voxel' ) );
		}

		$this->shipping_zone = $shipping_zone;
		$this->shipping_rate = $shipping_rate;
	}

	public function set_shipping_rates_by_vendor( array $rates_by_vendor ): void {
		$this->shipping_rates_by_vendor = $rates_by_vendor;
	}

	public function get_shipping_rates_by_vendor(): ?array {
		return $this->shipping_rates_by_vendor;
	}

	public function get_shipping_zone(): \Voxel\Product_Types\Shipping\Shipping_Zone {
		return $this->shipping_zone;
	}

	public function get_shipping_rate(): \Voxel\Product_Types\Shipping\Rates\Base_Shipping_Rate {
		return $this->shipping_rate;
	}

	public function get_shipping_address(): ?array {
		return $this->shipping_address;
	}

}
