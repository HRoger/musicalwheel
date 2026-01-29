<?php

namespace Voxel\Product_Types\Shipping\Rates;

use Voxel\Utils\Config_Schema\Schema as Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Fixed_Shipping_Rate extends Base_Shipping_Rate {

	protected
		$tax_behavior,
		$tax_code,
		$calculation_method,
		$amount_per_unit,
		$shipping_classes;

	protected function init( array $data ): void {
		$schema = Schema::Object( [
			'tax_behavior' => Schema::Enum( [ 'default', 'inclusive', 'exclusive' ] )->default('default'),
			'tax_code' => Schema::Enum( [ 'shipping', 'nontaxable' ] )->default('shipping'),
			'calculation_method' => Schema::Enum( [ 'per_item', 'per_order', 'per_class' ] )->default('per_item'),
			'delivery_estimate' => Schema::Object( [
				'minimum' => Schema::Object( [
					'unit' => Schema::Enum( [ 'hour', 'day', 'business_day', 'week', 'month' ] )->default('business_day'),
					'value' => Schema::Int()->min(1),
				] ),
				'maximum' => Schema::Object( [
					'unit' => Schema::Enum( [ 'hour', 'day', 'business_day', 'week', 'month' ] )->default('business_day'),
					'value' => Schema::Int()->min(1),
				] ),
			] ),
			'amount_per_unit' => Schema::Float()->min(0)->default(0),
			'shipping_classes' => Schema::Object_List( [
				'shipping_class' => Schema::String(),
				'amount_per_unit' => Schema::Float()->min(0)->default(0),
			] )->default([]),
		] );

		$schema->set_value( $data['fixed_rate'] ?? [] );

		$config = $schema->export();

		$this->tax_behavior = $config['tax_behavior'];
		$this->tax_code = $config['tax_code'];
		$this->calculation_method = $config['calculation_method'];
		if ( $config['delivery_estimate']['minimum']['value'] !== null && $config['delivery_estimate']['maximum']['value'] !== null ) {
			$this->min_delivery_unit = $config['delivery_estimate']['minimum']['unit'];
			$this->min_delivery_time = $config['delivery_estimate']['minimum']['value'];
			$this->max_delivery_unit = $config['delivery_estimate']['maximum']['unit'];
			$this->max_delivery_time = $config['delivery_estimate']['maximum']['value'];
		}

		$this->amount_per_unit = $config['amount_per_unit'];
		$this->shipping_classes = [];
		foreach ( $config['shipping_classes'] as $shipping_class_amount ) {
			$shipping_class = \Voxel\Product_Types\Shipping\Shipping_Class::get( $shipping_class_amount['shipping_class'] );
			if ( ! $shipping_class ) {
				continue;
			}

			$this->shipping_classes[ $shipping_class->get_key() ] = [
				'shipping_class' => $shipping_class,
				'amount_per_unit' => $shipping_class_amount['amount_per_unit'],
			];
		}
	}

	public function get_type(): string {
		return 'fixed_rate';
	}

	public function get_tax_behavior(): ?string {
		return $this->tax_behavior;
	}

	public function get_default_amount_per_unit(): float {
		return $this->amount_per_unit;
	}

	public function get_amount_per_unit_for_shipping_class( string $shipping_class ) {
		return $this->shipping_classes[ $shipping_class ]['amount_per_unit'] ?? $this->amount_per_unit;
	}

	public function get_tax_code(): ?string {
		return $this->tax_code;
	}

	public function get_calculation_method(): string {
		return $this->calculation_method;
	}

	public function get_frontend_config(): array {
		return [
			'type' => $this->get_type(),
			'key' => $this->get_key(),
			'label' => $this->get_label(),
			'delivery_estimate' => $this->get_delivery_estimate_message(),
			'amount_per_unit' => $this->get_default_amount_per_unit(),
			'calculation_method' => $this->get_calculation_method(),
			'shipping_classes' => (object) array_map( function( $shipping_class ) {
				return $shipping_class['amount_per_unit'];
			}, $this->shipping_classes ),
		];
	}

	public function calculate_shipping( \Voxel\Product_Types\Orders\Order $order, ?array $items = null ): array {
		if ( $items === null ) {
			$items = $order->get_items();
		}

		$calculation_method = $this->get_calculation_method();

		if ( $calculation_method === 'per_order' ) {
			// Fixed cost regardless of quantity or number of items
			$amount = $this->get_default_amount_per_unit();
		} elseif ( $calculation_method === 'per_class' ) {
			// Use the highest shipping class cost when multiple classes are in cart
			$max_cost = $this->get_default_amount_per_unit();
			foreach ( $items as $item ) {
				if ( $item->is_shippable() ) {
					$shipping_class = $item->get_shipping_class();
					if ( $shipping_class !== null ) {
						$class_cost = $this->get_amount_per_unit_for_shipping_class( $shipping_class->get_key() );
						$max_cost = max( $max_cost, $class_cost );
					}
				}
			}
			$amount = $max_cost;
		} else {
			// per_item: Current logic (default)
			$amount = 0;
			foreach ( $items as $item ) {
				if ( $item->is_shippable() ) {
					$item_quantity = $item->get_quantity() ?? 1;
					$shipping_class = $item->get_shipping_class();
					if ( $shipping_class !== null ) {
						$amount_per_unit = $this->get_amount_per_unit_for_shipping_class( $shipping_class->get_key() );
					} else {
						$amount_per_unit = $this->get_default_amount_per_unit();
					}

					$amount += $amount_per_unit * $item_quantity;
				}
			}
		}

		$currency = $order->get_currency();
		$amount_in_cents = $amount;
		if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $currency ) ) {
			$amount_in_cents *= 100;
		}
		$amount_in_cents = round( $amount_in_cents );

		$details = [
			'label' => $this->get_label(),
			'amount' => $amount,
			'amount_in_cents' => $amount_in_cents,
			'tax_code' => $this->get_tax_code(),
			'tax_behavior' => null,
			'delivery_estimate' => null,
			'delivery_estimate_message' => null,
		];

		if ( $this->has_delivery_estimate() ) {
			$details['delivery_estimate_message'] = $this->get_delivery_estimate_message();
			$details['delivery_estimate'] = [
				'minimum' => [
					'unit' => $this->get_minimum_delivery_unit(),
					'value' => $this->get_minimum_delivery_time(),
				],
				'maximum' => [
					'unit' => $this->get_maximum_delivery_unit(),
					'value' => $this->get_maximum_delivery_time(),
				],
			];
		}

		if ( in_array( $this->get_tax_behavior(), [ 'inclusive', 'exclusive' ], true ) ) {
			$details['tax_behavior'] = $this->get_tax_behavior();
		}

		return $details;
	}
}
