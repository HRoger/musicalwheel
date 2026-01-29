<?php

namespace Voxel\Modules\PayPal_Payments\Controllers\Frontend;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Frontend_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel_ajax_paypal.checkout.success', '@checkout_success_endpoint' );
		$this->on( 'voxel_ajax_paypal.checkout.cancel', '@checkout_cancel_endpoint' );
		$this->on( 'voxel_ajax_paypal_subscriptions.checkout.success', '@subscription_checkout_success_endpoint' );
		$this->on( 'voxel_ajax_paypal_subscriptions.checkout.cancel', '@subscription_checkout_cancel_endpoint' );

		$this->filter( 'voxel/orders/view_order/components', '@register_order_components', 10, 2 );
		$this->filter( 'voxel/paid_members/subscriptions/status_message', '@set_customer_status_message', 10, 2 );
	}

	protected function checkout_success_endpoint() {
		$order_id = $_REQUEST['order_id'] ?? null;
		$token = $_REQUEST['token'] ?? null; // PayPal adds this token parameter automatically

		if ( ! is_numeric( $order_id ) ) {
			wp_safe_redirect( home_url( '/' ) );
			exit;
		}

		$order = \Voxel\Product_Types\Orders\Order::find( [
			'id' => $order_id,
			'customer_id' => get_current_user_id(),
		] );

		if ( ! $order ) {
			wp_safe_redirect( home_url( '/' ) );
			exit;
		}

		// If token is provided by PayPal, verify it matches the stored order ID
		// If no token, we can still proceed if order_id is valid (for edge cases)
		if ( $token && is_string( $token ) && ! empty( $token ) ) {
			$stored_order_id = $order->get_details( 'checkout.order_id' );
			if ( $stored_order_id && $stored_order_id !== $token ) {
				wp_safe_redirect( home_url( '/' ) );
				exit;
			}

			// Use token as PayPal order ID for capture
			$paypal_order_id = $token;
		} else {
			// Fallback to stored order ID
			$paypal_order_id = $order->get_details( 'checkout.order_id' );
			if ( ! $paypal_order_id ) {
				wp_safe_redirect( home_url( '/' ) );
				exit;
			}
		}

		// Capture or authorize the order (with status check to prevent COMPLIANCE_VIOLATION)
		try {
			$payment_method = $order->get_payment_method();
			if ( $payment_method && $payment_method->get_type() === 'paypal_payment' ) {
				// Check order status before attempting capture/authorization
				$paypal_order = \Voxel\Modules\PayPal_Payments\PayPal_Client::get_order( $paypal_order_id );
				$order_status = $paypal_order['status'] ?? null;
				$capture_method = $order->get_details( 'checkout.capture_method' );

				if ( $order_status === 'APPROVED' ) {
					if ( $capture_method === 'manual' ) {
						// Manual capture: authorize the order instead of capturing
						$authorize_result = \Voxel\Modules\PayPal_Payments\PayPal_Client::authorize_order( $paypal_order_id );
						$payment_method->order_updated( $authorize_result );
					} elseif ( $capture_method === 'deferred' ) {
						// Deferred capture: authorize, validate cart, then auto-capture or auto-void
						$authorize_result = \Voxel\Modules\PayPal_Payments\PayPal_Client::authorize_order( $paypal_order_id );
						$payment_method->order_updated( $authorize_result );

						// After authorization, validate cart and auto-capture or auto-void
						$authorization_id = $order->get_details( 'checkout.authorization_id' );
						if ( $authorization_id ) {
							$cart_is_valid = false;
							try {
								$cart = $order->get_cart();
								$cart_is_valid = true;
							} catch ( \Exception $e ) {
								// \Voxel\log( sprintf( 'PayPal deferred capture: cart validation failed for order %s: %s', $order->get_id(), $e->getMessage() ) );
							}

							if ( $cart_is_valid ) {
								// Cart is valid: automatically capture from authorization
								try {
									$capture_result = \Voxel\Modules\PayPal_Payments\PayPal_Client::capture_authorization( $authorization_id );
									// Fetch updated order to get latest status
									$updated_order = \Voxel\Modules\PayPal_Payments\PayPal_Client::get_order( $paypal_order_id );
									$payment_method->order_updated( $updated_order );
								} catch ( \Exception $e ) {
									// \Voxel\log( sprintf( 'PayPal deferred capture failed for authorization %s: %s', $authorization_id, $e->getMessage() ) );
								}
							} else {
								// Cart is invalid: void the authorization and cancel order
								try {
									\Voxel\Modules\PayPal_Payments\PayPal_Client::void_authorization( $authorization_id );
									$order->set_status( \Voxel\ORDER_CANCELED );
									$order->save();
								} catch ( \Exception $e ) {
									// \Voxel\log( sprintf( 'PayPal deferred capture: void authorization failed for %s: %s', $authorization_id, $e->getMessage() ) );
								}
							}
						}
					} else {
						// Automatic capture: proceed with capture
						$capture_result = \Voxel\Modules\PayPal_Payments\PayPal_Client::capture_order( $paypal_order_id );
						$payment_method->order_updated( $capture_result );
					}
				} elseif ( $order_status === 'AUTHORIZED' ) {
					// Order is already authorized (manual or deferred capture), sync it
					// \Voxel\log( sprintf( 'PayPal order %s already authorized, syncing status', $paypal_order_id ) );
					$payment_method->order_updated( $paypal_order );
				} elseif ( $order_status === 'COMPLETED' ) {
					// Order is already captured, sync it instead
					// \Voxel\log( sprintf( 'PayPal order %s already completed, syncing status', $paypal_order_id ) );
					$payment_method->order_updated( $paypal_order );
				} else {
					// Order in unexpected state, sync to update local status
					// \Voxel\log( sprintf( 'PayPal order %s in state %s, syncing status', $paypal_order_id, $order_status ) );
					$payment_method->order_updated( $paypal_order );
				}
			}
		} catch ( \Exception $e ) {
			$error_message = $e->getMessage();

			// Handle COMPLIANCE_VIOLATION errors gracefully
			if ( \Voxel\Modules\PayPal_Payments\PayPal_Client::is_compliance_violation( $e ) ) {
				// \Voxel\log( sprintf( 'PayPal COMPLIANCE_VIOLATION for order %s, attempting to sync order status', $paypal_order_id ) );

				try {
					// Fetch current order status and sync
					$paypal_order = \Voxel\Modules\PayPal_Payments\PayPal_Client::get_order( $paypal_order_id );
					$payment_method = $order->get_payment_method();
					if ( $payment_method && $payment_method->get_type() === 'paypal_payment' ) {
						$payment_method->order_updated( $paypal_order );
					}
				} catch ( \Exception $sync_ex ) {
					// \Voxel\log( 'PayPal sync after COMPLIANCE_VIOLATION failed: ' . $sync_ex->getMessage() );
				}
			} else {
				// \Voxel\log( 'PayPal capture failed: ' . $error_message );
			}
		}

		// Clear customer cart on successful checkout
		if ( $order->get_details( 'cart.type' ) === 'customer_cart' ) {
			$cart = \Voxel\current_user()->get_cart();
			$cart->empty();
			$cart->update();
		}

		$order->sync();

		wp_safe_redirect( $order->get_success_redirect() );
		exit;
	}

	protected function checkout_cancel_endpoint() {
		$order_id = $_REQUEST['order_id'] ?? null;
		$token = $_REQUEST['token'] ?? null; // PayPal may add this token parameter
		$nonce = $_REQUEST['vxnonce'] ?? null;

		if ( ! is_numeric( $order_id ) ) {
			wp_safe_redirect( \Voxel\get_redirect_url() );
			exit;
		}

		$order = \Voxel\Product_Types\Orders\Order::find( [
			'id' => $order_id,
			'customer_id' => get_current_user_id(),
			'status' => 'pending_payment',
		] );

		// If token is provided, verify it matches before deleting.
		// If token is not present (or PayPal didn't include it), require a valid nonce to prevent CSRF-like deletion.
		if ( $order ) {
			$nonce_is_valid = is_string( $nonce ) && wp_verify_nonce( $nonce, sprintf( 'paypal_cancel_%d', $order->get_id() ) );
			if ( $token && is_string( $token ) && ! empty( $token ) ) {
				$stored_order_id = $order->get_details( 'checkout.order_id' );
				if ( $stored_order_id === $token ) {
					$order->delete();
				}
			} elseif ( $nonce_is_valid ) {
				$order->delete();
			}
		}

		wp_safe_redirect( \Voxel\get_redirect_url() );
		exit;
	}

	protected function subscription_checkout_success_endpoint() {
		$order_id = $_REQUEST['order_id'] ?? null;
		$subscription_id = $_REQUEST['subscription_id'] ?? null;
		if ( ! is_numeric( $order_id ) || ! is_string( $subscription_id ) || empty( $subscription_id ) ) {
			exit;
		}

		$order = \Voxel\Product_Types\Orders\Order::find( [
			'id' => $order_id,
			'customer_id' => get_current_user_id(),
		] );

		if ( ! $order ) {
			wp_safe_redirect( home_url( '/' ) );
			exit;
		}

		$payment_method = $order->get_payment_method();
		if ( ! $payment_method || $payment_method->get_type() !== 'paypal_subscription' ) {
			wp_safe_redirect( home_url( '/' ) );
			exit;
		}

		// Sync subscription status (this will handle plan switch if needed)
		try {
			$subscription = \Voxel\Modules\PayPal_Payments\PayPal_Client::get_subscription( $subscription_id );
			$payment_method->subscription_updated( $subscription );

			// Reload order after subscription_updated() in case plan switch was processed
			// This ensures sync() uses fresh order data with correct item IDs
			$order = \Voxel\Product_Types\Orders\Order::force_get( $order->get_id() );
			$payment_method = $order->get_payment_method();
		} catch ( \Exception $e ) {
			// \Voxel\log( 'PayPal subscription sync failed: ' . $e->getMessage() );
		}

		$order->sync();

		wp_safe_redirect( $order->get_success_redirect() );
		exit;
	}

	protected function subscription_checkout_cancel_endpoint() {
		$order_id = $_REQUEST['order_id'] ?? null;
		$subscription_id = $_REQUEST['subscription_id'] ?? null;
		$nonce = $_REQUEST['vxnonce'] ?? null;
		if ( ! is_numeric( $order_id ) ) {
			exit;
		}

		$order = \Voxel\Product_Types\Orders\Order::find( [
			'id' => $order_id,
			'customer_id' => get_current_user_id(),
		] );

		if ( $order ) {
			// Check if this is a plan switch cancellation
			$plan_switch = $order->get_details( 'checkout.plan_switch' );
			if ( $plan_switch && isset( $plan_switch['new_subscription_id'] ) ) {
				// Verify this is the new subscription being cancelled
				if ( is_string( $subscription_id ) && ! empty( $subscription_id ) && $subscription_id === $plan_switch['new_subscription_id'] ) {
					// Clear plan switch state - old subscription remains active
					$order->set_details( 'checkout.plan_switch', null );
					$order->save();

					// Redirect to order page (old subscription still active)
					wp_safe_redirect( $order->get_link() );
					exit;
				}
			}

			// Handle regular cancellation (pending payment orders)
			if ( $order->get_status() === 'pending_payment' ) {
				$nonce_is_valid = is_string( $nonce ) && wp_verify_nonce( $nonce, sprintf( 'paypal_cancel_%d', $order->get_id() ) );
				if (
					( is_string( $subscription_id ) && ! empty( $subscription_id ) && $order->get_transaction_id() === $subscription_id )
					|| $nonce_is_valid
				) {
					$order->delete();
				}
			}
		}

		wp_safe_redirect( \Voxel\get_redirect_url() );
		exit;
	}

	protected function register_order_components( $components, $order ): array {
		if (
			$order->get_payment_method_key() === 'paypal_subscription'
			&& ( $payment_method = $order->get_payment_method() )
		) {
			$state = $payment_method->get_state();

			if ( $state['status'] !== null ) {
				$components[] = [
					'type' => 'paypal-subscription-details',
					'src' => \Voxel\get_esm_src('order-paypal-subscription-details.js'),
					'data' => $state,
				];
			}
		}

		return $components;
	}

	protected function set_customer_status_message( $message, $membership ) {
		$payment_method = $membership->get_payment_method();
		if ( ! ( $payment_method && $payment_method->get_type() === 'paypal_subscription' ) ) {
			return $message;
		}

		$state = $payment_method->get_state();
		if ( empty( $state['message'] ) ) {
			return $message;
		}

		return $state['message'];
	}

}

