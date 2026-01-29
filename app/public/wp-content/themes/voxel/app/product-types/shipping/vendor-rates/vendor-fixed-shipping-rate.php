<?php

namespace Voxel\Product_Types\Shipping\Vendor_Rates;

use Voxel\Utils\Config_Schema\Schema as Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Vendor_Fixed_Shipping_Rate extends Vendor_Base_Shipping_Rate {

	protected
		$amount_per_unit,
		$calculation_method,
		$shipping_classes;

	protected function init( array $data ): void {
		if ( $data['fixed_rate']['delivery_estimate']['enabled'] ) {
			$this->has_delivery_estimate = true;
			$this->min_delivery_unit = $data['fixed_rate']['delivery_estimate']['minimum']['unit'];
			$this->min_delivery_time = $data['fixed_rate']['delivery_estimate']['minimum']['value'];
			$this->max_delivery_unit = $data['fixed_rate']['delivery_estimate']['maximum']['unit'];
			$this->max_delivery_time = $data['fixed_rate']['delivery_estimate']['maximum']['value'];
		}

		$this->amount_per_unit = $data['fixed_rate']['amount_per_unit'];
		$this->calculation_method = $data['fixed_rate']['calculation_method'] ?? 'per_item';
		$this->shipping_classes = [];
		foreach ( $data['fixed_rate']['shipping_classes'] as $shipping_class_amount ) {
			$shipping_class = \Voxel\Product_Types\Shipping\Shipping_Class::get( $shipping_class_amount['shipping_class'] );
			if ( $shipping_class ) {
				$this->shipping_classes[ $shipping_class->get_key() ] = [
					'shipping_class' => $shipping_class,
					'amount_per_unit' => $shipping_class_amount['amount_per_unit'],
				];
			}
		}
	}

	public function get_type(): string {
		return 'fixed_rate';
	}

	public function get_default_amount_per_unit(): float {
		return $this->amount_per_unit;
	}

	public function get_amount_per_unit_for_shipping_class( string $shipping_class ) {
		return $this->shipping_classes[ $shipping_class ]['amount_per_unit'] ?? $this->amount_per_unit;
	}

	public function get_calculation_method(): string {
		return $this->calculation_method;
	}

	public function get_tax_code(): ?string {
		return null;
	}

	public function get_tax_behavior(): ?string {
		return null;
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
			'tax_code' => null, // Vendor rates don't have tax codes
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

		return $details;
	}
}
