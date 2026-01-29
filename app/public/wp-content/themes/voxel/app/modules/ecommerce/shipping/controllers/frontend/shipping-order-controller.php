<?php

namespace Voxel\Modules\Ecommerce\Shipping\Controllers\Frontend;

use \Voxel\Modules\Ecommerce as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Shipping_Order_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->filter( 'voxel/orders/view_order/components', '@register_shipping_component', 10, 2 );
		$this->filter( 'voxel/order/shipping_details', '@add_shipping_address', 10, 2 );
		$this->filter( 'voxel/order/shipping_details', '@add_shipping_method', 10, 2 );
	}

	protected function register_shipping_component( $components, $order ) {
		if ( ! ( $order->get_status() === 'completed' && $order->should_handle_shipping() ) ) {
			return $components;
		}

		$data = [];

		$data['enabled'] = true;
		$data['status'] = [
			'key' => $order->get_shipping_status(),
			'updated_at' => $order->get_shipping_status_last_updated_for_display(),
			'label' => $order->get_shipping_status_label(),
			'long_label' => $order->get_shipping_status_long_label(),
			'class' => $order->get_shipping_status_class(),
		];

		$data['tracking_details'] = [
			'link' => $order->get_details('shipping.tracking_details.link'),
		];

		$data['l10n'] = [
			'mark_shipped' => _x( 'Mark as shipped', 'single order', 'voxel' ),
			'share_cancel' => _x( 'Cancel', 'share tracking details', 'voxel' ),
			'share_confirm' => _x( 'Share', 'share tracking details', 'voxel' ),
			'update_tracking_link' => _x( 'Update tracking link', 'single order', 'voxel' ),
			'share_tracking_link' => _x( 'Share tracking link', 'single order', 'voxel' ),
			'tracking_url' => _x( 'Tracking URL', 'share tracking details', 'voxel' ),
			'track_order' => _x( 'Track order', 'single order', 'voxel' ),
			'mark_delivered' => _x( 'Mark as delivered', 'single order', 'voxel' ),
		];

		$components[] = [
			'type' => 'order-shipping-details',
			'src' => \Voxel\get_esm_src('order-shipping-details.js'),
			'data' => $data,
		];

		return $components;
	}

	protected function add_shipping_address( $details, $order ) {
		if ( ! $order->should_handle_shipping() ) {
			return $details;
		}

		$data = $order->get_shipping_address();
		if ( ! $data ) {
			if ( $parent_order = $order->get_parent_order() ) {
				$data = $parent_order->get_shipping_address();
			}

			if ( ! $data ) {
				return $details;
			}
		}

		if ( ! empty( $data['first_name'] ) ) {
			$details[] = [
				'label' => _x( 'First name', 'order shipping details', 'voxel' ),
				'content' => $data['first_name'],
			];
		}

		if ( ! empty( $data['last_name'] ) ) {
			$details[] = [
				'label' => _x( 'Last name', 'order shipping details', 'voxel' ),
				'content' => $data['last_name'],
			];
		}

		if ( ! empty( $data['country'] ) ) {
			$country_code = $data['country'];
			$country = \Voxel\Utils\Data\Countries_With_Subdivisions::all()[ strtoupper( $country_code ) ] ?? null;

			$details[] = [
				'label' => _x( 'Country', 'order shipping details', 'voxel' ),
				'content' => $country['name'] ?? $country_code,
			];

			if ( ! empty( $data['state'] ) ) {
				$state_code = $data['state'];
				$details[] = [
					'label' => _x( 'State', 'order shipping details', 'voxel' ),
					'content' => $country['states'][ $state_code ]['name'] ?? $state_code,
				];
			}
		}

		if ( ! empty( $data['address'] ) ) {
			$details[] = [
				'label' => _x( 'Address', 'order shipping details', 'voxel' ),
				'content' => $data['address'],
			];
		}

		if ( ! empty( $data['zip'] ) ) {
			$details[] = [
				'label' => _x( 'Postal code', 'order shipping details', 'voxel' ),
				'content' => $data['zip'],
			];
		}

		return $details;
	}

	protected function add_shipping_method( $details, $order ) {
		if ( ! $order->should_handle_shipping() ) {
			return $details;
		}

		$vendor = $order->get_vendor();

		if ( $order->get_details('shipping.method') === 'vendor_rates' ) {
			if ( $order->has_vendor() ) {
				$shipping_rate = $order->get_shipping_rate_for_vendor( $order->get_vendor_id() );
			} else {
				$shipping_rate = $order->get_shipping_rate_for_platform();
			}
		} else {
			$shipping_rate = $order->get_shipping_rate();
		}

		$payment_method = $order->get_payment_method();
		if ( $payment_method ) {
			if ( $payment_method->get_type() === 'stripe_transfer' ) {
				$parent_order = $order->get_parent_order();
				if ( $parent_order && $vendor ) {
					$shipping_rate = $parent_order->get_shipping_rate_for_vendor( $vendor->get_id() );
				}
			} elseif ( $payment_method->get_type() === 'stripe_transfer_platform' ) {
				$parent_order = $order->get_parent_order();
				if ( $parent_order && $vendor ) {
					$shipping_rate = $parent_order->get_shipping_rate_for_platform();
				}
			}
		}

		if ( ! $shipping_rate ) {
			return $details;
		}

		$details[] = [
			'label' => _x( 'Ships via', 'order shipping details', 'voxel' ),
			'content' => $shipping_rate->get_label(),
		];

		$details[] = [
			'label' => _x( 'Delivery estimate', 'order shipping details', 'voxel' ),
			'content' => $shipping_rate->get_delivery_estimate_message(),
		];

		return $details;
	}
}
