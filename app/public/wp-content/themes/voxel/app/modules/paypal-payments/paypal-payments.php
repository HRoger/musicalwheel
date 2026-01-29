<?php

namespace Voxel\Modules\PayPal_Payments;

use \Voxel\Modules\PayPal_Payments as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

new Controllers\PayPal_Payments_Controller;

/**
 * Convert WordPress locale format (en_US) to PayPal format (en-US)
 * If locale is not in PayPal's supported list, PayPal will use a default
 *
 * @link https://developer.paypal.com/api/rest/reference/locale-codes/
 */
function format_locale( $locale ) {
	$locale = str_replace( '_', '-', $locale );

	return $locale;
}

function get_customer_portal_link( $order ) {
	// PayPal doesn't support deep linking to specific transactions for customers
	// The customer-facing transaction ID is not available in the API
	// Link to general activities page where customers can search for their transaction
	$base_url = Module\PayPal_Client::is_test_mode()
		? 'https://www.sandbox.paypal.com'
		: 'https://www.paypal.com';

	$url = $base_url . '/myaccount/activity';

	return $url;
}

/**
 * Approve a `paypal_payment` order in pending_approval state.
 */
function approve_order( \Voxel\Order $order ) {
	$payment_method = $order->get_payment_method();
	if ( ! ( $payment_method && $payment_method->get_type() === 'paypal_payment' ) ) {
		return;
	}

	$authorization_id = $order->get_details( 'checkout.authorization_id' );
	$order_id = $order->get_details( 'checkout.order_id' );

	if ( $authorization_id ) {
		// Manual capture: capture from authorization
		try {
			$capture_result = Module\PayPal_Client::capture_authorization( $authorization_id );

			// Update order with capture details
			if ( ! empty( $capture_result['id'] ) ) {
				$order->set_details( 'checkout.capture_id', $capture_result['id'] );
			}

			if ( ! empty( $capture_result['status'] ) && $capture_result['status'] === 'COMPLETED' ) {
				$order->set_status( \Voxel\ORDER_COMPLETED );
			}

			if ( ! empty( $capture_result['amount'] ) ) {
				$order->set_details( 'pricing.total', (float) $capture_result['amount']['value'] );
				$order->set_details(
					'pricing.currency',
					strtoupper( $capture_result['amount']['currency_code'] ?? $order->get_currency() )
				);
			}

			$order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
			$order->save();
		} catch ( \Exception $e ) {
			$error_message = $e->getMessage();

			// Handle COMPLIANCE_VIOLATION errors gracefully
			if ( Module\PayPal_Client::is_compliance_violation( $e ) ) {
				// \Voxel\log( sprintf(
				// 	'PayPal COMPLIANCE_VIOLATION for authorization %s during vendor approval, attempting to sync',
				// 	$authorization_id
				// ) );

				try {
					// Fetch current authorization status
					$authorization = Module\PayPal_Client::get_authorization( $authorization_id );
					if ( ! empty( $authorization['status'] ) && $authorization['status'] === 'CAPTURED' ) {
						// Already captured, sync order
						if ( $order_id ) {
							$paypal_order = Module\PayPal_Client::get_order( $order_id );
							$payment_method->order_updated( $paypal_order );
						}
					}
				} catch ( \Exception $sync_ex ) {
					throw new \Exception( _x( 'Failed to sync authorization status', 'paypal', 'voxel' ) );
				}
			} elseif ( Module\PayPal_Client::is_authorization_already_captured( $e ) ) {
				// Handle AUTHORIZATION_ALREADY_CAPTURED: authorization was captured externally (e.g., via PayPal dashboard)
				// \Voxel\log( sprintf(
				// 	'PayPal AUTHORIZATION_ALREADY_CAPTURED for authorization %s during vendor approval, syncing order to auto-approve',
				// 	$authorization_id
				// ) );

				try {
					// Sync order to get latest status (should be COMPLETED if capture was successful)
					if ( $order_id ) {
						$paypal_order = Module\PayPal_Client::get_order( $order_id );
						$payment_method->order_updated( $paypal_order );
					}
				} catch ( \Exception $sync_ex ) {
					throw new \Exception( _x( 'Failed to sync order status', 'paypal', 'voxel' ) );
				}
			} elseif ( Module\PayPal_Client::is_authorization_voided( $e ) ) {
				// Handle AUTHORIZATION_VOIDED: authorization was voided externally (e.g., via PayPal dashboard)
				// Sync order to get latest status (will be set to CANCELED since authorization is voided)
				try {
					if ( $order_id ) {
						$paypal_order = Module\PayPal_Client::get_order( $order_id );
						$payment_method->order_updated( $paypal_order );
					}
				} catch ( \Exception $sync_ex ) {
					throw new \Exception( _x( 'Failed to sync order status', 'paypal', 'voxel' ) );
				}
			} else {
				throw new \Exception( $error_message );
			}
		}
	} elseif ( $order_id ) {
		// Automatic capture: use existing capture logic
		try {
			// Check order status before attempting capture
			$paypal_order = Module\PayPal_Client::get_order( $order_id );
			$order_status = $paypal_order['status'] ?? null;

			if ( $order_status === 'APPROVED' ) {
				// Order is approved, proceed with capture
				$capture_result = Module\PayPal_Client::capture_order( $order_id );
				$payment_method->order_updated( $capture_result );
			} elseif ( $order_status === 'COMPLETED' ) {
				// Order is already captured, sync it instead
				// \Voxel\log( sprintf(
				// 	'PayPal order %s already completed during vendor approval, syncing status',
				// 	$order_id
				// ) );

				$payment_method->order_updated( $paypal_order );
			} else {
				// Order in unexpected state, sync to update local status
				// \Voxel\log( sprintf(
				// 	'PayPal order %s in state %s during vendor approval, syncing status',
				// 	$order_id,
				// 	$order_status
				// ) );

				$payment_method->order_updated( $paypal_order );
			}
		} catch ( \Exception $e ) {
			$error_message = $e->getMessage();

			// Handle COMPLIANCE_VIOLATION errors gracefully
			if ( Module\PayPal_Client::is_compliance_violation( $e ) ) {
				// \Voxel\log( sprintf(
				// 	'PayPal COMPLIANCE_VIOLATION for order %s during vendor approval, attempting to sync order status',
				// 	$order_id
				// ) );

				try {
					// Fetch current order status and sync
					$paypal_order = Module\PayPal_Client::get_order( $order_id );
					$payment_method->order_updated( $paypal_order );
				} catch ( \Exception $sync_ex ) {
					throw new \Exception( _x( 'Failed to sync order status', 'paypal', 'voxel' ) );
				}
			} else {
				throw new \Exception( $error_message );
			}
		}
	}
}

/**
 * Decline a `paypal_payment` order in pending_approval state.
 */
function decline_order( \Voxel\Order $order ) {
	$payment_method = $order->get_payment_method();
	if ( ! ( $payment_method && $payment_method->get_type() === 'paypal_payment' ) ) {
		return;
	}

	$authorization_id = $order->get_details( 'checkout.authorization_id' );

	if ( $authorization_id ) {
		// Void the authorization if it exists
		try {
			Module\PayPal_Client::void_authorization( $authorization_id );
		} catch ( \Exception $e ) {
			\Voxel\log( sprintf(
				'PayPal authorization void failed during vendor decline: %s',
				$e->getMessage()
			) );
			// Continue with order cancellation even if void fails
		}
	}

	$order->set_status( \Voxel\ORDER_CANCELED );
	$order->save();
}

/**
 * Process plan switch for PayPal subscription.
 * Cancels old subscription and updates order when new subscription is active.
 *
 * @param \Voxel\Product_Types\Payment_Methods\PayPal_Subscription $payment_method
 * @param array $subscription_data PayPal subscription data
 * @return bool True if plan switch was processed, false otherwise
 */
function process_subscription_plan_switch( $payment_method, $subscription_data ) {
	$order = $payment_method->get_order();
	$subscription_id = $subscription_data['id'] ?? null;
	$status = $subscription_data['status'] ?? null;

	// Check if this is a plan switch that needs to be completed
	$plan_switch = $order->get_details( 'checkout.plan_switch' );
	if ( ! $plan_switch || ! isset( $plan_switch['old_subscription_id'] ) || ! isset( $plan_switch['new_subscription_id'] ) ) {
		return false;
	}

	// Verify the subscription_id matches the new subscription
	if ( $subscription_id !== $plan_switch['new_subscription_id'] ) {
		return false;
	}

	// Only process if new subscription is ACTIVE
	if ( $status !== 'ACTIVE' ) {
		// If cancelled/expired, clear plan_switch state (switch failed)
		if ( in_array( $status, [ 'CANCELLED', 'EXPIRED' ], true ) ) {
			$order->set_details( 'checkout.plan_switch', null );
			$order->save();
			\Voxel\log( sprintf(
				'PayPal plan switch failed: new subscription %s is %s',
				$subscription_id,
				$status
			) );
		}
		return false;
	}

	// Cancel old subscription
	$old_subscription_id = $plan_switch['old_subscription_id'];
	try {
		PayPal_Client::cancel_subscription( $old_subscription_id, 'Replaced by new subscription plan' );
	} catch ( \Exception $e ) {
		\Voxel\log( 'Failed to cancel old PayPal subscription during plan switch: ' . $e->getMessage() );
	}

	// Update order transaction_id to new subscription
	$order->set_transaction_id( $plan_switch['new_subscription_id'] );

	// Update order items and pricing
	if ( isset( $plan_switch['cart_item'] ) ) {
		$order->set_details( 'cart.items', [
			key( $plan_switch['cart_item'] ) => reset( $plan_switch['cart_item'] ),
		] );
	}

	if ( isset( $plan_switch['pricing'] ) ) {
		$order->set_details( 'pricing.currency', $plan_switch['pricing']['currency'] );
		$order->set_details( 'pricing.subtotal', $plan_switch['pricing']['subtotal'] );
		$order->set_details( 'pricing.total', $plan_switch['pricing']['subtotal'] );
	}

	// Delete old order items
	foreach ( $order->get_items() as $order_item ) {
		$order_item->delete();
	}

	// Add new order item
	if ( isset( $plan_switch['order_item'] ) ) {
		$order_item_data = $plan_switch['order_item'];
		global $wpdb;

		$wpdb->insert( $wpdb->prefix.'vx_order_items', [
			'order_id' => $order->get_id(),
			'post_id' => $order_item_data['post_id'] ?? 0,
			'product_type' => $order_item_data['product_type'] ?? '',
			'field_key' => $order_item_data['field_key'] ?? '',
			'details' => wp_json_encode( \Voxel\Utils\Config_Schema\Schema::optimize_for_storage( $order_item_data['order_item_config'] ?? [] ) ),
		] );
	}

	// Clear plan switch state
	$order->set_details( 'checkout.plan_switch', null );
	$order->save();

	// Clear order item cache and reload order
	$order = \Voxel\Order::force_get( $order->get_id() );

	// Update subscription details
	$order->get_payment_method()->subscription_updated( $subscription_data );

	// Save order again to trigger order:updated hook with correct order items
	$order->save();

	return true;
}

/**
 * Get regular billing amount from PayPal plan.
 *
 * @param string $plan_id PayPal plan ID
 * @return array|null Array with 'amount' and 'currency', or null if not found
 */
function get_plan_regular_billing_amount( $plan_id ) {
	if ( empty( $plan_id ) ) {
		return null;
	}

	try {
		$plan = PayPal_Client::get_plan( $plan_id );
		if ( ! empty( $plan['billing_cycles'] ) ) {
			foreach ( $plan['billing_cycles'] as $cycle ) {
				if ( ( $cycle['tenure_type'] ?? '' ) === 'REGULAR' ) {
					$pricing = $cycle['pricing_scheme']['fixed_price'] ?? null;
					if ( $pricing ) {
						return [
							'amount' => (float) ( $pricing['value'] ?? 0 ),
							'currency' => strtoupper( $pricing['currency_code'] ?? '' ),
						];
					}
				}
			}
		}
	} catch ( \Exception $e ) {
		\Voxel\log( 'Failed to get plan regular billing amount: ' . $e->getMessage() );
	}

	return null;
}

/**
 * Generate hash from product configuration.
 * Hash is based on product name and type.
 *
 * @param array $product_data Product data array with 'name' and 'type'
 * @return string Hash string
 */
function get_paypal_product_hash( $product_data ) {
	$normalized = [
		'name' => $product_data['name'] ?? '',
		'type' => $product_data['type'] ?? 'SERVICE',
	];

	ksort( $normalized );
	return md5( wp_json_encode( $normalized ) );
}

/**
 * Generate hash from plan configuration.
 * Hash is based on product_id, billing_cycles, and payment_preferences.
 *
 * @param array $plan_data Plan data array
 * @return string Hash string
 */
function get_paypal_plan_hash( $plan_data ) {
	$normalized = [
		'product_id' => $plan_data['product_id'] ?? '',
		'billing_cycles' => $plan_data['billing_cycles'] ?? [],
		'payment_preferences' => $plan_data['payment_preferences'] ?? [],
	];

	// Sort billing cycles by sequence for consistency
	if ( ! empty( $normalized['billing_cycles'] ) ) {
		usort( $normalized['billing_cycles'], function( $a, $b ) {
			return ( $a['sequence'] ?? 0 ) <=> ( $b['sequence'] ?? 0 );
		} );
	}

	// Sort payment preferences for consistency
	if ( ! empty( $normalized['payment_preferences'] ) ) {
		ksort( $normalized['payment_preferences'] );
	}

	return md5( wp_json_encode( $normalized ) );
}

/**
 * Verify that a plan from PayPal matches the expected configuration.
 * Compares billing_cycles pricing and payment_preferences setup_fee.
 *
 * @param array $expected_plan_data Expected plan configuration
 * @param array $actual_plan Actual plan data from PayPal API
 * @return bool True if plan matches, false otherwise
 */
function verify_plan_matches_config( $expected_plan_data, $actual_plan ) {
	// Compare product_id
	if ( ( $expected_plan_data['product_id'] ?? '' ) !== ( $actual_plan['product_id'] ?? '' ) ) {
		return false;
	}

	// Compare billing cycles pricing
	$expected_regular_cycle = null;
	foreach ( $expected_plan_data['billing_cycles'] ?? [] as $cycle ) {
		if ( ( $cycle['tenure_type'] ?? '' ) === 'REGULAR' ) {
			$expected_regular_cycle = $cycle;
			continue;
		}
	}

	$actual_regular_cycle = null;
	foreach ( $actual_plan['billing_cycles'] ?? [] as $cycle ) {
		if ( ( $cycle['tenure_type'] ?? '' ) === 'REGULAR' ) {
			$actual_regular_cycle = $cycle;
			continue;
		}

		if ( ( $cycle['tenure_type'] ?? '' ) === 'TRIAL' ) {
			$trial_price = $cycle['pricing_scheme']['fixed_price']['value'] ?? null;
			if ( is_numeric( $trial_price ) && floatval( $trial_price ) > 0 ) {
				return false;
			}
		}
	}

	if ( $expected_regular_cycle && $actual_regular_cycle ) {
		$expected_price = $expected_regular_cycle['pricing_scheme']['fixed_price'] ?? null;
		$actual_price = $actual_regular_cycle['pricing_scheme']['fixed_price'] ?? null;

		if ( ! $expected_price || ! $actual_price ) {
			return false;
		}

		// Compare price value and currency
		if ( floatval( $expected_price['value'] ?? '' ) !== floatval( $actual_price['value'] ?? '' ) ) {
			return false;
		}

		if ( strtoupper( $expected_price['currency_code'] ?? '' ) !== strtoupper( $actual_price['currency_code'] ?? '' ) ) {
			return false;
		}
	} elseif ( $expected_regular_cycle || $actual_regular_cycle ) {
		// One has regular cycle but other doesn't
		return false;
	}

	// Compare setup_fee
	// $expected_setup_fee = $expected_plan_data['payment_preferences']['setup_fee'] ?? null;
	$actual_setup_fee = $actual_plan['payment_preferences']['setup_fee'] ?? null;

	if ( $actual_setup_fee ) {
		if ( floatval( $actual_setup_fee['value'] ?? '' ) > 0 ) {
			return false;
		}
	}

	return true;
}

/**
 * Get PayPal product ID by hash.
 *
 * @param string $hash Product configuration hash
 * @param bool $testmode Whether in test mode
 * @return string|null PayPal product ID or null if not found
 */
function get_paypal_product_by_hash( $hash, $testmode ) {
	$mode = $testmode ? 'sandbox' : 'live';
	return \Voxel\get( sprintf( 'paypal_product_mappings_%s.%s', $mode, $hash ) );
}

/**
 * Store PayPal product ID by hash.
 *
 * @param string $hash Product configuration hash
 * @param string $product_id PayPal product ID
 * @param bool $testmode Whether in test mode
 */
function set_paypal_product_by_hash( $hash, $product_id, $testmode ) {
	$mode = $testmode ? 'sandbox' : 'live';
	\Voxel\set( sprintf( 'paypal_product_mappings_%s.%s', $mode, $hash ), $product_id );
}

/**
 * Get PayPal plan ID by hash.
 *
 * @param string $hash Plan configuration hash
 * @param bool $testmode Whether in test mode
 * @return string|null PayPal plan ID or null if not found
 */
function get_paypal_plan_by_hash( $hash, $testmode ) {
	$mode = $testmode ? 'sandbox' : 'live';
	return \Voxel\get( sprintf( 'paypal_plan_mappings_%s.%s', $mode, $hash ) );
}

/**
 * Store PayPal plan ID by hash.
 *
 * @param string $hash Plan configuration hash
 * @param string $plan_id PayPal plan ID
 * @param bool $testmode Whether in test mode
 */
function set_paypal_plan_by_hash( $hash, $plan_id, $testmode ) {
	$mode = $testmode ? 'sandbox' : 'live';
	\Voxel\set( sprintf( 'paypal_plan_mappings_%s.%s', $mode, $hash ), $plan_id );
}
