<?php

namespace Voxel\Modules\PayPal_Payments\Controllers\Frontend;

use \Voxel\Modules\PayPal_Payments as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Webhooks_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel_ajax_paypal.webhooks', '@handle_webhooks' );
		$this->on( 'voxel_ajax_nopriv_paypal.webhooks', '@handle_webhooks' );
	}

	protected function handle_webhooks() {
		$payload = @file_get_contents('php://input');
		if ( empty( $payload ) ) {
			http_response_code(400);
			exit;
		}

		$headers = [];
		foreach ( $_SERVER as $key => $value ) {
			if ( strpos( $key, 'HTTP_' ) === 0 ) {
				// Normalize to the conventional header format expected by PayPal verification payload,
				// e.g. HTTP_PAYPAL_AUTH_ALGO => PAYPAL-AUTH-ALGO (case-insensitive).
				$header_name = strtoupper( str_replace( '_', '-', substr( $key, 5 ) ) );
				$headers[ $header_name ] = $value;
			}
		}

		// PayPal webhook headers
		$paypal_headers = [
			'PAYPAL-AUTH-ALGO' => $headers['PAYPAL-AUTH-ALGO'] ?? '',
			'PAYPAL-CERT-URL' => $headers['PAYPAL-CERT-URL'] ?? '',
			'PAYPAL-TRANSMISSION-ID' => $headers['PAYPAL-TRANSMISSION-ID'] ?? '',
			'PAYPAL-TRANSMISSION-SIG' => $headers['PAYPAL-TRANSMISSION-SIG'] ?? '',
			'PAYPAL-TRANSMISSION-TIME' => $headers['PAYPAL-TRANSMISSION-TIME'] ?? '',
		];

		$mode = Module\PayPal_Client::is_test_mode() ? 'sandbox' : 'live';
		$webhook_id = \Voxel\get( sprintf( 'payments.paypal.%s.webhook.id', $mode ) );

		if ( empty( $webhook_id ) ) {
			// \Voxel\log( 'PayPal webhook ID not configured' );
			http_response_code(400);
			exit;
		}

		// Verify webhook signature
		$is_valid = Module\PayPal_Client::verify_webhook_signature( $paypal_headers, $payload, $webhook_id );
		if ( ! $is_valid ) {
			\Voxel\log( 'PayPal webhook signature verification failed' );
			http_response_code(400);
			exit;
		}

		$event = json_decode( $payload, true );
		if ( ! $event || empty( $event['event_type'] ) ) {
			http_response_code(400);
			exit;
		}

		$event_type = $event['event_type'];
		try {
			// Determine if this is a subscription event or payment event
			$is_subscription_event = strpos( $event_type, 'BILLING.SUBSCRIPTION.' ) === 0;

			if ( $is_subscription_event ) {
				// Handle subscription events
				$subscription_id = Module\PayPal_Client::extract_subscription_id_from_webhook_event( $event );

				if ( $subscription_id ) {
					$order = \Voxel\Product_Types\Orders\Order::find( [
						'payment_method' => 'paypal_subscription',
						'transaction_id' => $subscription_id,
					] );

					if ( $order ) {
						// Let the payment method's sync() handle all subscription status updates
						$order->sync();
					} else {
						\Voxel\log( sprintf( 'PayPal webhook: order not found for subscription_id %s (event: %s)', $subscription_id, $event_type ) );
					}
				} else {
					\Voxel\log( sprintf( 'PayPal webhook: could not extract subscription_id from event %s', $event_type ) );
				}
			} else {
				// Handle payment events (all PAYMENT.* and CHECKOUT.* events)
				$paypal_order_id = Module\PayPal_Client::extract_order_id_from_webhook_event( $event );
				if ( $paypal_order_id ) {
					$order = \Voxel\Product_Types\Orders\Order::find( [
						'payment_method' => 'paypal_payment',
						'transaction_id' => $paypal_order_id,
					] );

					if ( $order ) {
						// Let the payment method's sync() handle all order status updates
						// This includes refunds, captures, authorizations, etc.
						$order->sync();
					} else {
						\Voxel\log( sprintf( 'PayPal webhook: order not found for order_id %s (event: %s)', $paypal_order_id, $event_type ) );
					}
				} else {
					\Voxel\log( sprintf( 'PayPal webhook: could not extract order_id from event %s', $event_type ) );
				}
			}
		} catch ( \Exception $e ) {
			\Voxel\log( 'PayPal webhook processing error: ' . $e->getMessage() );
			// Don't fail webhook processing - return 200 to PayPal
			// Log the error for debugging but acknowledge receipt
		}

		http_response_code(200);
		exit;
	}
}

