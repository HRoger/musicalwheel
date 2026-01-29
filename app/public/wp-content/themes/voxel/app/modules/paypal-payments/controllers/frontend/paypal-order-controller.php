<?php

namespace Voxel\Modules\PayPal_Payments\Controllers\Frontend;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Order_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		// $this->filter( 'voxel/orders/view_order/pricing/sections', '@add_transaction_details', 10, 2 );
	}

	protected function add_transaction_details( $sections, $order ) {
		$current_user = \Voxel\get_current_user();
		if ( ! $current_user ) {
			return $sections;
		}

		$payment_method = $order->get_payment_method();
		if (
			$payment_method === null
			|| ! in_array( $payment_method->get_type(), [ 'paypal_payment', 'paypal_subscription' ], true )
		) {
			return $sections;
		}

		$items = [];

		$paypal_order_id = $order->get_details('checkout.order_id');
		if ( ! empty( $paypal_order_id ) ) {
			$items[] = [
				'label' => _x( 'Order ID', 'paypal details', 'voxel' ),
				'content' => $paypal_order_id,
			];
		}

		$paypal_subscription_id = $order->get_details('checkout.subscription_id');
		if ( ! empty( $paypal_subscription_id ) ) {
			$items[] = [
				'label' => _x( 'Subscription ID', 'paypal details', 'voxel' ),
				'content' => $paypal_subscription_id,
			];
		}

		$payer_given_name = (string) $order->get_details('checkout.payer_details.name.given_name');
		$payer_surname = (string) $order->get_details('checkout.payer_details.name.surname');
		$payer_name = join( ' ', array_filter( [ $payer_given_name, $payer_surname ] ) );
		if ( ! empty( $payer_name ) ) {
			$items[] = [
				'label' => _x( 'Customer', 'paypal details', 'voxel' ),
				'content' => $payer_name,
			];
		}

		$payer_id = $order->get_details('checkout.payer_details.payer_id');
		if ( is_string( $payer_id ) && ! empty( $payer_id ) ) {
			$items[] = [
				'label' => _x( 'Customer ID', 'paypal details', 'voxel' ),
				'content' => $payer_id,
			];
		}

		$payer_email = $order->get_details('checkout.payer_details.email_address');
		if ( is_string( $payer_email ) && ! empty( $payer_email ) ) {
			$items[] = [
				'label' => _x( 'Customer email', 'paypal details', 'voxel' ),
				'content' => $payer_email,
			];
		}

		$merchant_name = $order->get_details('checkout.payee_details.display_data.brand_name');
		if ( is_string( $merchant_name ) && ! empty( $merchant_name ) ) {
			$items[] = [
				'label' => _x( 'Merchant', 'paypal details', 'voxel' ),
				'content' => $merchant_name,
			];
		}

		if ( $current_user->is_vendor_of( $order->get_id() ) || $current_user->has_cap('manage_options') ) {
			$merchant_id = $order->get_details('checkout.payee_details.merchant_id');
			if ( is_string( $merchant_id ) && ! empty( $merchant_id ) ) {
				$items[] = [
					'label' => _x( 'Merchant ID', 'paypal details', 'voxel' ),
					'content' => $merchant_id,
				];
			}

			$merchant_email = $order->get_details('checkout.payee_details.email_address');
			if ( is_string( $merchant_email ) && ! empty( $merchant_email ) ) {
				$items[] = [
					'label' => _x( 'Merchant email', 'paypal details', 'voxel' ),
					'content' => $merchant_email,
				];
			}
		}

		if ( ! empty( $items ) ) {
			$sections[] = [
				'label' => _x( 'PayPal transaction details', 'paypal details', 'voxel' ),
				'type' => 'list',
				'items' => $items,
			];
		}

		return $sections;
	}
}
