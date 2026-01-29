<?php

namespace Voxel\Product_Types\Shipping\Vendor_Rates;

use Voxel\Utils\Config_Schema\Schema as Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Vendor_Free_Shipping_Rate extends Vendor_Base_Shipping_Rate {

	protected
		$requirements,
		$minimum_order_amount;

	protected function init( array $data ): void {
		$this->requirements = $data['free_shipping']['requirements'];
		$this->minimum_order_amount = $data['free_shipping']['minimum_order_amount'];

		if ( $data['free_shipping']['delivery_estimate']['enabled'] ) {
			$this->has_delivery_estimate = true;
			$this->min_delivery_unit = $data['free_shipping']['delivery_estimate']['minimum']['unit'];
			$this->min_delivery_time = $data['free_shipping']['delivery_estimate']['minimum']['value'];
			$this->max_delivery_unit = $data['free_shipping']['delivery_estimate']['maximum']['unit'];
			$this->max_delivery_time = $data['free_shipping']['delivery_estimate']['maximum']['value'];
		}
	}

	public function get_type(): string {
		return 'free_shipping';
	}

	public function get_requirements(): string {
		return $this->requirements;
	}

	public function get_minimum_order_amount(): ?float {
		if ( $this->requirements === 'minimum_order_amount' ) {
			return $this->minimum_order_amount;
		}

		return null;
	}

	public function get_frontend_config(): array {
		return [
			'type' => $this->get_type(),
			'key' => $this->get_key(),
			'label' => $this->get_label(),
			'requirements' => $this->get_requirements(),
			'minimum_order_amount' => $this->get_minimum_order_amount(),
			'delivery_estimate' => $this->get_delivery_estimate_message(),
		];
	}

	public function calculate_shipping( \Voxel\Product_Types\Orders\Order $order, ?array $items = null ): array {
		if ( $items === null ) {
			$items = $order->get_items();
		}

		$minimum_order_amount = $this->get_minimum_order_amount();
		if ( $minimum_order_amount !== null ) {
			$subtotal = 0;
			foreach ( $items as $item ) {
				if ( $item->get_subtotal() !== null ) {
					$subtotal += $item->get_subtotal();
				}
			}

			if ( $subtotal < $minimum_order_amount ) {
				throw new \Exception( \Voxel\replace_vars( _x( 'Shipping via "@shipping_rate" requires a minimum order amount of @amount', 'cart summary', 'voxel' ), [
					'@shipping_rate' => $this->get_label(),
					'@amount' => \Voxel\currency_format( $minimum_order_amount, $order->get_currency(), false ),
				] ) );
			}
		}

		$details = [
			'label' => $this->get_label(),
			'amount' => 0,
			'amount_in_cents' => 0,
			'tax_code' => null,
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
