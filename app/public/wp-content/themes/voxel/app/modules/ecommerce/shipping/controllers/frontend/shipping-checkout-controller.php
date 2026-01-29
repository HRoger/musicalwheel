<?php

namespace Voxel\Modules\Ecommerce\Shipping\Controllers\Frontend;

use \Voxel\Modules\Ecommerce as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Shipping_Checkout_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel/product-types/orders/order:updated', '@order_updated' );
		$this->on( 'voxel/checkout/after-create-order', '@save_shipping_address' );
	}

	protected function order_updated( $order ) {
		if ( $order->get_status() && $order->should_handle_shipping() && $order->get_shipping_status() === null ) {
			$order->set_shipping_status('processing');
			$order->save();
		}
	}

	protected function save_shipping_address( \Voxel\Product_Types\Orders\Order $order ) {
		$customer = $order->get_customer();
		if ( ! $customer ) {
			return;
		}

		$shipping_address = $order->get_shipping_address();
		if ( empty( $shipping_address ) || ! is_array( $shipping_address ) ) {
			return;
		}

		// Extract only the address fields we need
		$address_data = [
			'first_name' => $shipping_address['first_name'] ?? '',
			'last_name' => $shipping_address['last_name'] ?? '',
			'country' => $shipping_address['country'] ?? '',
			'state' => $shipping_address['state'] ?? '',
			'address' => $shipping_address['address'] ?? '',
			'zip' => $shipping_address['zip'] ?? '',
		];

		// Only save if country is present
		if ( ! empty( $address_data['country'] ) ) {
			\Voxel\update_site_specific_user_meta(
				$customer->get_id(),
				'voxel:shipping_address',
				wp_slash( wp_json_encode( $address_data ) )
			);
		}
	}
}
