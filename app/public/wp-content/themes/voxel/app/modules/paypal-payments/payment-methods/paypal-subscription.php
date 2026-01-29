<?php

namespace Voxel\Modules\PayPal_Payments\Payment_Methods;

use \Voxel\Modules\PayPal_Payments as Module;
use \Voxel\Product_Types\Cart_Items\Cart_Item;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Subscription extends \Voxel\Product_Types\Payment_Methods\Base_Payment_Method {

	public function get_type(): string {
		return 'paypal_subscription';
	}

	public function get_label(): string {
		return _x( 'PayPal subscription', 'payment methods', 'voxel' );
	}

	public function is_subscription(): bool {
		return true;
	}

	public function process_payment() {
		try {
			$customer = $this->order->get_customer();

			$product = $this->_create_or_get_product();
			$plan = $this->_create_or_get_plan( $product['id'] );

			// Create subscription
			$subscription_data = [
				'plan_id' => $plan['id'],
				'application_context' => [
					'return_url' => $this->get_success_url(),
					'cancel_url' => $this->get_cancel_url(),
					'brand_name' => get_bloginfo( 'name' ),
					'locale' => Module\format_locale( get_locale() ),
					'shipping_preference' => 'NO_SHIPPING',
				],
			];

			// Add payer if available
			if ( ! empty( $customer->get_email() ) ) {
				$subscription_data['subscriber'] = [
					'email_address' => $customer->get_email(),
					'name' => [
						'given_name' => $customer->get_display_name(),
					],
				];
			}

			$subscription_data = apply_filters(
				'voxel/paypal_subscriptions/process_payment/args',
				$subscription_data,
				$this,
				$this->order
			);

			$paypal_subscription = Module\PayPal_Client::create_subscription( $subscription_data );

			if ( empty( $paypal_subscription['id'] ) ) {
				throw new \Exception( _x( 'Failed to create PayPal subscription', 'paypal', 'voxel' ) );
			}

			// Find approval URL
			$approval_url = null;
			if ( ! empty( $paypal_subscription['links'] ) ) {
				foreach ( $paypal_subscription['links'] as $link ) {
					if ( isset( $link['rel'] ) && $link['rel'] === 'approve' ) {
						$approval_url = $link['href'];
						break;
					}
				}
			}

			if ( empty( $approval_url ) ) {
				throw new \Exception( _x( 'Failed to get PayPal approval URL', 'paypal', 'voxel' ) );
			}

			// Calculate total from line items
			$total_order_amount = 0;
			foreach ( $this->get_line_items() as $line_item ) {
				$total_order_amount += $line_item['amount'] * $line_item['quantity'];
			}

			$this->order->set_details( 'pricing.total', $total_order_amount );
			$this->order->set_details( 'checkout.subscription_id', $paypal_subscription['id'] );
			$this->order->set_transaction_id( $paypal_subscription['id'] );
			$this->order->save();

			return [
				'success' => true,
				'redirect_url' => $approval_url,
			];
		} catch ( \Exception $e ) {
			return [
				'success' => false,
				'message' => _x( 'Something went wrong', 'checkout', 'voxel' ),
				'debug' => [
					'type' => 'paypal_error',
					'code' => $e->getCode(),
					'message' => $e->getMessage(),
				],
			];
		}
	}

	protected function get_success_url() {
		return add_query_arg( [
			'vx' => 1,
			'action' => 'paypal_subscriptions.checkout.success',
			'order_id' => $this->order->get_id(),
		], home_url('/') );
	}

	protected function get_cancel_url() {
		$redirect_url = wp_get_referer() ?: home_url('/');
		$redirect_url = add_query_arg( 't', time(), $redirect_url );

		return add_query_arg( [
			'vx' => 1,
			'action' => 'paypal_subscriptions.checkout.cancel',
			'order_id' => $this->order->get_id(),
			'vxnonce' => wp_create_nonce( sprintf( 'paypal_cancel_%d', $this->order->get_id() ) ),
			'redirect_to' => rawurlencode( $redirect_url ),
		], home_url('/') );
	}

	protected function _create_or_get_product() {
		// Check if product already exists in order meta
		$product_id = $this->order->get_details( 'checkout.paypal_product_id' );
		if ( $product_id ) {
			try {
				// Verify product still exists
				$product = Module\PayPal_Client::make_request(
					'GET',
					sprintf( '/v1/catalogs/products/%s', $product_id )
				);

				if ( ! empty( $product['id'] ) ) {
					return $product;
				}
			} catch ( \Exception $e ) {
				// Product doesn't exist, create new one
			}
		}

		// Prepare product data
		$product_name = get_bloginfo( 'name' ) . ' Subscription';
		$line_items = $this->get_line_items();
		if ( ! empty( $line_items[0]['product']['label'] ) ) {
			$product_name = $line_items[0]['product']['label'];
		}

		$product_data = [
			'name' => $product_name,
			'type' => 'SERVICE',
		];

		// Check if product with same hash already exists
		$hash = Module\get_paypal_product_hash( $product_data );
		$testmode = $this->order->is_test_mode();
		$existing_product_id = Module\get_paypal_product_by_hash( $hash, $testmode );

		if ( $existing_product_id ) {
			try {
				// Verify product still exists in PayPal
				$product = Module\PayPal_Client::make_request(
					'GET',
					sprintf( '/v1/catalogs/products/%s', $existing_product_id )
				);

				if ( ! empty( $product['id'] ) ) {
					// Store in order meta for future reference
					$this->order->set_details( 'checkout.paypal_product_id', $product['id'] );
					$this->order->save();
					return $product;
				}
			} catch ( \Exception $e ) {
				// Product doesn't exist, create new one
			}
		}

		// Create new product
		$product = Module\PayPal_Client::create_product( $product_data );

		if ( ! empty( $product['id'] ) ) {
			// Store hash mapping
			Module\set_paypal_product_by_hash( $hash, $product['id'], $testmode );

			// Store in order meta
			$this->order->set_details( 'checkout.paypal_product_id', $product['id'] );
			$this->order->save();
		}

		return $product;
	}

	protected function _create_or_get_plan( $product_id ) {
		// Check if plan already exists in order meta
		$plan_id = $this->order->get_details( 'checkout.paypal_plan_id' );
		if ( $plan_id ) {
			try {
				// Verify plan still exists
				$plan = Module\PayPal_Client::get_plan( $plan_id );
				if ( ! empty( $plan['id'] ) ) {
					return $plan;
				}
			} catch ( \Exception $e ) {
				// Plan doesn't exist, create new one
			}
		}

		// Build plan data from order items
		$plan_data = $this->_build_plan_data( $product_id );

		// Check if plan has setup_fee (prorated plan from switch) - don't reuse these
		$has_setup_fee = ! empty( $plan_data['payment_preferences']['setup_fee'] );

		if ( ! $has_setup_fee ) {
			// Check if plan with same hash already exists
			$hash = Module\get_paypal_plan_hash( $plan_data );
			$testmode = $this->order->is_test_mode();
			$existing_plan_id = Module\get_paypal_plan_by_hash( $hash, $testmode );

			if ( $existing_plan_id ) {
				try {
					// Verify plan still exists in PayPal
					$plan = Module\PayPal_Client::get_plan( $existing_plan_id );
					if ( ! empty( $plan['id'] ) ) {
						// Verify plan pricing matches expected configuration
						if ( Module\verify_plan_matches_config( $plan_data, $plan ) ) {
							// Plan matches, reuse it
							$this->order->set_details( 'checkout.paypal_plan_id', $plan['id'] );
							$this->order->save();
							// \Voxel\log('plan reused '.$plan['id']);
							return $plan;
						} else {
							// Plan pricing doesn't match (was updated in PayPal dashboard)
							// Invalidate hash mapping and create new plan
							Module\set_paypal_plan_by_hash( $hash, '', $testmode ); // Clear mapping
							// \Voxel\log('recreated plan');
						}
					}
				} catch ( \Exception $e ) {
					// Plan doesn't exist, create new one
				}
			} else {
				// \Voxel\log('created plan');
			}
		}

		// Create new plan
		$plan = Module\PayPal_Client::create_plan( $plan_data );

		if ( ! empty( $plan['id'] ) ) {
			// Only store hash mapping for regular plans (not prorated)
			if ( ! $has_setup_fee ) {
				$hash = Module\get_paypal_plan_hash( $plan_data );
				$testmode = $this->order->is_test_mode();
				Module\set_paypal_plan_by_hash( $hash, $plan['id'], $testmode );
			}

			// Store in order meta
			$this->order->set_details( 'checkout.paypal_plan_id', $plan['id'] );
			$this->order->save();
		}

		return $plan;
	}

	protected function _build_plan_data( $product_id ) {
		$line_items = $this->get_line_items();
		$first_item = $line_items[0] ?? null;

		if ( ! $first_item ) {
			throw new \Exception( _x( 'No line items found', 'paypal', 'voxel' ) );
		}

		$order_item = $first_item['order_item'];
		$interval = $order_item->get_details('subscription.unit');
		$frequency = (int) $order_item->get_details('subscription.frequency');
		$amount = $first_item['amount'];
		$currency = strtoupper( $first_item['currency'] );

		// Map interval to PayPal format
		$paypal_interval = 'DAY';
		if ( $interval === 'week' ) {
			$paypal_interval = 'WEEK';
		} elseif ( $interval === 'month' ) {
			$paypal_interval = 'MONTH';
		} elseif ( $interval === 'year' ) {
			$paypal_interval = 'YEAR';
		}

		$plan_name = sprintf(
			'%s - %s %s',
			get_bloginfo( 'name' ),
			$frequency,
			ucfirst( $interval ) . ( $frequency > 1 ? 's' : '' )
		);

		if ( ! empty( $first_item['product']['label'] ) ) {
			$plan_name = $first_item['product']['label'];
		}

		$plan_data = [
			'product_id' => $product_id,
			'name' => $plan_name,
			'billing_cycles' => [
				[
					'frequency' => [
						'interval_unit' => $paypal_interval,
						'interval_count' => $frequency,
					],
					'tenure_type' => 'REGULAR',
					'sequence' => 1,
					'total_cycles' => 0, // 0 = infinite
					'pricing_scheme' => [
						'fixed_price' => [
							'value' => number_format( $amount, 2, '.', '' ),
							'currency_code' => $currency,
						],
					],
				],
			],
			'payment_preferences' => [
				'auto_bill_outstanding' => true,
				'setup_fee_failure_action' => 'CONTINUE',
				'payment_failure_threshold' => 3,
			],
		];

		// Add trial period if applicable
		$trial_days = null;
		if ( is_numeric( $order_item->get_details('subscription.trial_days') ) ) {
			$trial_days = (int) $order_item->get_details('subscription.trial_days');
		}

		if ( $trial_days > 0 ) {
			array_unshift( $plan_data['billing_cycles'], [
				'frequency' => [
					'interval_unit' => 'DAY',
					'interval_count' => $trial_days,
				],
				'tenure_type' => 'TRIAL',
				'sequence' => 1,
				'total_cycles' => 1,
				'pricing_scheme' => [
					'fixed_price' => [
						'value' => '0',
						'currency_code' => $currency,
					],
				],
			]);

			// Update regular cycle sequence
			$plan_data['billing_cycles'][1]['sequence'] = 2;
		}

		return $plan_data;
	}

	public function subscription_updated( $subscription_data ) {
		if ( ! is_array( $subscription_data ) ) {
			return;
		}

		$subscription_id = $subscription_data['id'] ?? null;
		$status = $subscription_data['status'] ?? null;

		// Process plan switch if needed (only when ACTIVE)
		if ( Module\process_subscription_plan_switch( $this, $subscription_data ) ) {
			return;
		}

		if ( $subscription_id ) {
			$this->order->set_transaction_id( $subscription_id );
		}

		// Map PayPal status to Voxel status
		$voxel_status = $this->_map_subscription_status( $status );
		if ( $voxel_status ) {
			$this->order->set_status( $voxel_status );
		}

		// Store subscription details
		$subscription_details = [
			'id' => $subscription_id,
			'status' => $status,
			'status_update_time' => $subscription_data['status_update_time'] ?? null,
			'create_time' => $subscription_data['create_time'] ?? null,
			'start_time' => $subscription_data['start_time'] ?? null,
		];

		// Extract billing cycle info
		if ( ! empty( $subscription_data['billing_info'] ) ) {
			$billing_info = $subscription_data['billing_info'];
			$next_billing_time = $billing_info['next_billing_time'] ?? null;
			$cycle_executions = $billing_info['cycle_executions'] ?? [];

			// Check if next billing is a trial cycle
			$is_trial_next = false;
			foreach ( $cycle_executions as $execution ) {
				if ( ( $execution['tenure_type'] ?? '' ) === 'TRIAL' ) {
					$cycles_remaining = (int) ( $execution['cycles_remaining'] ?? 0 );
					if ( $cycles_remaining > 0 ) {
						$is_trial_next = true;
						break;
					}
				}
			}

			// If next billing is trial, calculate first REGULAR cycle date
			if ( $is_trial_next && $next_billing_time ) {
				$plan_id = $subscription_data['plan_id'] ?? null;
				if ( $plan_id ) {
					try {
						$plan = Module\PayPal_Client::get_plan( $plan_id );
						$regular_cycle = null;

						// Find REGULAR billing cycle
						foreach ( $plan['billing_cycles'] ?? [] as $cycle ) {
							if ( ( $cycle['tenure_type'] ?? '' ) === 'REGULAR' ) {
								$regular_cycle = $cycle;
								break;
							}
						}

						if ( $regular_cycle ) {
							// Calculate first REGULAR billing date
							// Trial end = first regular billing start
							$trial_end = strtotime( $next_billing_time );
							$frequency = $regular_cycle['frequency'] ?? [];
							$interval_unit = strtolower( $frequency['interval_unit'] ?? 'month' );
							$interval_count = (int) ( $frequency['interval_count'] ?? 1 );

							// Map to strtotime format
							$voxel_interval = 'month';
							if ( $interval_unit === 'day' ) {
								$voxel_interval = 'day';
							} elseif ( $interval_unit === 'week' ) {
								$voxel_interval = 'week';
							} elseif ( $interval_unit === 'year' ) {
								$voxel_interval = 'year';
							}

							// First regular billing is at trial end (trial end = regular start)
							$next_regular_billing = $trial_end;

							$subscription_details['next_billing_time'] = date( 'Y-m-d H:i:s', $next_regular_billing );
						} else {
							// Fallback: use next_billing_time as-is
							$subscription_details['next_billing_time'] = $next_billing_time;
						}
					} catch ( \Exception $e ) {
						// Fallback: use next_billing_time as-is if plan fetch fails
						$subscription_details['next_billing_time'] = $next_billing_time;
					}
				} else {
					// No plan_id, use next_billing_time as-is
					$subscription_details['next_billing_time'] = $next_billing_time;
				}
			} else {
				// Next billing is already REGULAR, use as-is
				$subscription_details['next_billing_time'] = $next_billing_time;
			}

			$subscription_details['outstanding_balance'] = $billing_info['outstanding_balance'] ?? null;
			$subscription_details['cycle_executions'] = $cycle_executions;
		}

		// Extract plan info and pricing
		if ( ! empty( $subscription_data['plan_id'] ) ) {
			$subscription_details['plan_id'] = $subscription_data['plan_id'];

			$billing_info = null;
			$plan_overridden = $subscription_data['plan_overridden'] ?? false;

			// When plan_overridden is true, PayPal doesn't return the overridden pricing in API responses
			// Use last_payment.amount as an indicator of the current effective price
			if ( $plan_overridden && ! empty( $subscription_data['billing_info']['last_payment']['amount'] ) ) {
				$last_payment = $subscription_data['billing_info']['last_payment']['amount'];
				$billing_info = [
					'amount' => (float) ( $last_payment['value'] ?? 0 ),
					'currency' => strtoupper( $last_payment['currency_code'] ?? '' ),
				];
			}

			// Fall back to plan pricing if no override indicator available
			if ( ! $billing_info ) {
				$billing_info = Module\get_plan_regular_billing_amount( $subscription_data['plan_id'] );
			}

			// Update order pricing
			if ( $billing_info ) {
				$this->order->set_details( 'pricing.total', $billing_info['amount'] );
				$this->order->set_details( 'pricing.currency', $billing_info['currency'] );
			}
		}

		// Store payer information if available
		if ( ! empty( $subscription_data['subscriber'] ) ) {
			$this->order->set_details( 'checkout.payer_details', [
				'payer_id' => $subscription_data['subscriber']['payer_id'] ?? null,
				'email_address' => $subscription_data['subscriber']['email_address'] ?? null,
				'name' => isset( $subscription_data['subscriber']['name'] ) ? [
					'given_name' => $subscription_data['subscriber']['name']['given_name'] ?? null,
					'surname' => $subscription_data['subscriber']['name']['surname'] ?? null,
				] : null,
			] );
		}

		$this->order->set_details( 'subscription', $subscription_details );
		$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
		$this->order->save();
	}

	protected function _map_subscription_status( $paypal_status ): ?string {
		$status_map = [
			'APPROVAL_PENDING' => \Voxel\ORDER_PENDING_PAYMENT,
			'APPROVED' => \Voxel\ORDER_PENDING_PAYMENT,
			'ACTIVE' => 'sub_active',
			'SUSPENDED' => 'sub_paused',
			'CANCELLED' => 'sub_canceled',
			'EXPIRED' => 'sub_canceled',
		];

		return $status_map[ $paypal_status ] ?? null;
	}

	public function should_sync(): bool {
		return ! $this->order->get_details( 'checkout.last_synced_at' );
	}

	public function sync(): void {
		$subscription_id = $this->order->get_transaction_id();
		if ( empty( $subscription_id ) ) {
			return;
		}

		try {
			$subscription = Module\PayPal_Client::get_subscription( $subscription_id );
			$this->subscription_updated( $subscription );
		} catch ( \Exception $e ) {
			\Voxel\log( 'PayPal subscription sync failed: ' . $e->getMessage() );
		}
	}

	public function get_billing_interval(): ?array {
		$subscription = $this->order->get_details('subscription');
		if ( $subscription && ! empty( $subscription['plan_id'] ) ) {
			try {
				$plan = Module\PayPal_Client::get_plan( $subscription['plan_id'] );
				if ( ! empty( $plan['billing_cycles'] ) ) {
					foreach ( $plan['billing_cycles'] as $cycle ) {
						if ( ( $cycle['tenure_type'] ?? '' ) === 'REGULAR' ) {
							$frequency = $cycle['frequency'] ?? [];
							$interval_unit = strtolower( $frequency['interval_unit'] ?? 'month' );
							$interval_count = (int) ( $frequency['interval_count'] ?? 1 );

							// Map PayPal intervals to Voxel format
							$voxel_interval = 'month';
							if ( $interval_unit === 'day' ) {
								$voxel_interval = 'day';
							} elseif ( $interval_unit === 'week' ) {
								$voxel_interval = 'week';
							} elseif ( $interval_unit === 'year' ) {
								$voxel_interval = 'year';
							}

							return [
								'type' => 'recurring',
								'interval' => $voxel_interval,
								'interval_count' => $interval_count,
							];
						}
					}
				}
			} catch ( \Exception $e ) {
				// Fall through to order items
			}
		}

		// Fallback to order items
		foreach ( $this->order->get_items() as $item ) {
			$interval = $item->get_details( 'subscription.unit' );
			$interval_count = $item->get_details( 'subscription.frequency' );

			if ( $interval && $interval_count ) {
				return [
					'type' => 'recurring',
					'interval' => $interval,
					'interval_count' => $interval_count,
				];
			}
		}

		return null;
	}

	public function get_current_billing_period(): ?array {
		$subscription = $this->order->get_details('subscription');
		if ( ! $subscription ) {
			return null;
		}

		$next_billing_time = $subscription['next_billing_time'] ?? null;
		if ( ! $next_billing_time ) {
			return null;
		}

		$end = strtotime( $next_billing_time );
		$now = time();

		// If next_billing_time is in the past, the period has ended
		// Return null to indicate no active billing period
		if ( $end <= $now ) {
			return null;
		}

		$interval = $this->get_billing_interval();
		if ( ! $interval ) {
			return null;
		}

		$start = strtotime( sprintf(
			'-%d %s',
			$interval['interval_count'],
			$interval['interval']
		), $end );

		// Validate that we're actually in this period
		if ( $start < $now && $now < $end ) {
			return [
				'start' => date( 'Y-m-d H:i:s', $start ),
				'end' => date( 'Y-m-d H:i:s', $end ),
			];
		}

		return null;
	}

	/**
	 * Check if the current billing period is a free trial period.
	 *
	 * @return bool True if currently in a trial period, false otherwise
	 */
	public function is_current_period_trial(): bool {
		$subscription = $this->order->get_details('subscription');
		if ( ! $subscription ) {
			return false;
		}

		$cycle_executions = $subscription['cycle_executions'] ?? [];
		if ( empty( $cycle_executions ) ) {
			return false;
		}

		// Check if we're in an active trial (TRIAL cycles_remaining > 0)
		foreach ( $cycle_executions as $execution ) {
			if ( ( $execution['tenure_type'] ?? '' ) === 'TRIAL' ) {
				$cycles_remaining = (int) ( $execution['cycles_remaining'] ?? 0 );
				if ( $cycles_remaining > 0 ) {
					return true;
				}
			}
		}

		// Check if REGULAR billing cycles have started
		// If cycles_completed === 0 for REGULAR, we're still in trial period
		// (either active trial or between trial end and first regular billing)
		foreach ( $cycle_executions as $execution ) {
			if ( ( $execution['tenure_type'] ?? '' ) === 'REGULAR' ) {
				$cycles_completed = (int) ( $execution['cycles_completed'] ?? 0 );
				// If no regular cycles completed, we're still in trial period
				if ( $cycles_completed === 0 ) {
					return true;
				}
			}
		}

		return false;
	}

	public function get_state(): array {
		$subscription = $this->order->get_details('subscription');

		if ( $this->order->get_status() !== 'pending_payment' && $subscription ) {
			$status = $subscription['status'] ?? null;
			$next_billing_time = $subscription['next_billing_time'] ?? null;

			if ( $status === 'ACTIVE' ) {
				$message = '';
				if ( $next_billing_time ) {
					$message = sprintf(
						_x( 'Next renewal on %s', 'subscriptions', 'voxel' ),
						\Voxel\datetime_format( strtotime( $next_billing_time ) )
					);
				}

				return [
					'status' => 'active',
					'label' => _x( 'Active', 'order status', 'voxel' ),
					'long_label' => _x( 'Subscription is active', 'order status', 'voxel' ),
					'class' => 'vx-green',
					'message' => $message,
					'actions' => [
						// 'payments/paypal_subscription/customers/active.suspend',
						// 'payments/paypal_subscription/customers/active.cancel',
					],
				];
			} elseif ( $status === 'SUSPENDED' ) {
				return [
					'status' => 'paused',
					'label' => _x( 'Paused', 'order status', 'voxel' ),
					'long_label' => _x( 'Subscription is paused', 'order status', 'voxel' ),
					'class' => 'vx-orange',
					'message' => _x( 'Subscription is currently paused', 'subscriptions', 'voxel' ),
					'actions' => [
						'payments/paypal_subscription/customers/paused.resume',
						'payments/paypal_subscription/customers/paused.cancel',
					],
				];
			} elseif ( $status === 'CANCELLED' || $status === 'EXPIRED' ) {
				return [
					'status' => 'canceled',
					'label' => _x( 'Canceled', 'order status', 'voxel' ),
					'long_label' => _x( 'Subscription canceled', 'order status', 'voxel' ),
					'message' => $this->order->get_status_last_updated_for_display(),
					'class' => 'vx-red',
					'actions' => null,
				];
			} elseif ( $status === 'APPROVAL_PENDING' || $status === 'APPROVED' ) {
				return [
					'status' => 'incomplete',
					'label' => _x( 'Pending', 'order status', 'voxel' ),
					'long_label' => _x( 'Subscription pending approval', 'order status', 'voxel' ),
					'message' => _x( 'Waiting for approval', 'subscriptions', 'voxel' ),
					'class' => 'vx-orange',
					'actions' => [
						// 'payments/paypal_subscription/customers/incomplete.cancel',
					],
				];
			}
		}

		return [
			'status' => null,
		];
	}

	public function cancel_subscription_immediately() {
		$subscription_id = $this->order->get_transaction_id();
		if ( empty( $subscription_id ) ) {
			throw new \Exception( _x( 'Subscription ID not found', 'paypal', 'voxel' ) );
		}

		try {
			Module\PayPal_Client::cancel_subscription( $subscription_id, 'Canceled by customer' );
			$this->sync();
		} catch ( \Exception $e ) {
			throw new \Exception( _x( 'Failed to cancel subscription', 'paypal', 'voxel' ) );
		}
	}

	public function get_customer_actions(): array {
		$actions = [];
		$state = $this->get_state();
		$subscription_id = $this->order->get_transaction_id();

		if ( $state['status'] === 'paused' ) {
			$actions[] = [
				'action' => 'paused.resume',
				'label' => _x( 'Resume subscription', 'order customer actions', 'voxel' ),
				'confirm' => _x(
					'Your subscription will resume immediately. Do you want to proceed?',
					'order customer actions',
					'voxel'
				),
				'handler' => function() use ( $subscription_id ) {
					try {
						Module\PayPal_Client::activate_subscription( $subscription_id, 'Resumed by customer' );
						$this->sync();
						return wp_send_json( [ 'success' => true ] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];

			$actions[] = [
				'action' => 'paused.cancel',
				'label' => _x( 'Cancel subscription', 'order customer actions', 'voxel' ),
				'confirm' => _x(
					'Your subscription will be canceled immediately. Do you want to proceed?',
					'order customer actions',
					'voxel'
				),
				'handler' => function() use ( $subscription_id ) {
					try {
						$this->cancel_subscription_immediately();
						return wp_send_json( [ 'success' => true ] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];
		} elseif ( $state['status'] === 'active' ) {
			/*$actions[] = [
				'action' => 'active.suspend',
				'label' => _x( 'Pause subscription', 'order customer actions', 'voxel' ),
				'confirm' => _x(
					'Your subscription will be paused immediately. You can resume it later. Do you want to proceed?',
					'order customer actions',
					'voxel'
				),
				'handler' => function() use ( $subscription_id ) {
					try {
						Module\PayPal_Client::suspend_subscription( $subscription_id, 'Suspended by customer' );
						$this->sync();
						return wp_send_json( [ 'success' => true ] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];*/

			$actions[] = [
				'action' => 'active.cancel',
				'label' => _x( 'Cancel subscription', 'order customer actions', 'voxel' ),
				'confirm' => _x(
					'Your subscription will be canceled immediately. Do you want to proceed?',
					'order customer actions',
					'voxel'
				),
				'handler' => function() use ( $subscription_id ) {
					try {
						$this->cancel_subscription_immediately();
						return wp_send_json( [ 'success' => true ] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];

		} elseif ( $state['status'] === 'incomplete' ) {
			$actions[] = [
				'action' => 'incomplete.cancel',
				'label' => _x( 'Cancel subscription', 'order customer actions', 'voxel' ),
				'confirm' => _x(
					'Your subscription will be canceled immediately. Do you want to proceed?',
					'order customer actions',
					'voxel'
				),
				'handler' => function() use ( $subscription_id ) {
					try {
						Module\PayPal_Client::cancel_subscription( $subscription_id, 'Canceled before approval' );
						$this->sync();
						return wp_send_json( [ 'success' => true ] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];
		}

		$actions[] = [
			'action' => 'customer.view_in_paypal',
			'label' => _x( 'Customer portal', 'order customer actions', 'voxel' ),
			'handler' => function() use ( $subscription_id ) {
				if ( $subscription_id ) {
					$url = Module\PayPal_Client::dashboard_url( 'myaccount/autopay/connect/' . $subscription_id );
					return wp_send_json( [
						'success' => true,
						'redirect_to' => $url,
					] );
				}

				return wp_send_json( [
					'success' => false,
					'message' => _x( 'Subscription ID not found', 'paypal', 'voxel' ),
				] );
			},
		];

		return $actions;
	}

	public function is_subscription_recoverable(): bool {
		$subscription = $this->order->get_details('subscription');
		if ( $subscription ) {
			$status = $subscription['status'] ?? null;
			return in_array( $status, [ 'ACTIVE', 'SUSPENDED' ], true );
		}

		return false;
	}

	public function supports_subscription_price_update(): bool {
		return true;
	}

	public function preview_subscription_price_update( Cart_Item $cart_item ) {
		$new_amount = $cart_item->get_pricing_summary()['total_amount'];
		$new_currency = $cart_item->get_currency();

		$current_amount = $this->order->get_details( 'pricing.total' );
		$current_currency = $this->order->get_currency();

		// Calculate proration
		$billing_period = $this->get_current_billing_period();
		$amount_due = $new_amount;
		$total = $new_amount;

		// Skip proration if currently in a free trial period (no payment made yet)
		if ( $this->is_current_period_trial() ) {
			return [
				'amount_due' => $amount_due,
				'total' => $total,
				'currency' => $new_currency,
			];
		}

		// If billing period is missing or invalid, no proration
		if ( ! $billing_period || ! isset( $billing_period['start'] ) || ! isset( $billing_period['end'] ) ) {
			return [
				'amount_due' => $amount_due,
				'total' => $total,
				'currency' => $new_currency,
			];
		}

		// If currencies don't match, can't calculate proration
		if ( strtoupper( $current_currency ) !== strtoupper( $new_currency ) ) {
			return [
				'amount_due' => $amount_due,
				'total' => $total,
				'currency' => $new_currency,
			];
		}

		$period_start = strtotime( $billing_period['start'] );
		$period_end = strtotime( $billing_period['end'] );
		$now = time();

		// Validate time calculations
		if ( ! $period_start || ! $period_end || $period_start >= $period_end ) {
			return [
				'amount_due' => $amount_due,
				'total' => $total,
				'currency' => $new_currency,
			];
		}

		// If period_end is in the past, the billing period has ended - no proration
		if ( $period_end <= $now ) {
			return [
				'amount_due' => $amount_due,
				'total' => $total,
				'currency' => $new_currency,
			];
		}

		// Check if we're mid-cycle
		if ( $period_start < $now && $now < $period_end ) {
			$period_duration = $period_end - $period_start;
			$remaining = $period_end - $now;

			// Validate remaining time
			if ( $period_duration > 0 && $remaining > 0 && $remaining < $period_duration ) {
				// Calculate unused credit
				$unused_credit = ( $remaining / $period_duration ) * $current_amount;
				// Calculate amount due (new charge - unused credit)
				$amount_due = $new_amount - $unused_credit;

				// Only allow positive proration amounts
				$amount_due = max( 0, $amount_due );
				$total = $amount_due;
			}
		}

		return [
			'amount_due' => $amount_due,
			'total' => $total,
			'currency' => $new_currency,
		];
	}

	public function update_subscription_price( Cart_Item $cart_item ) {
		$pricing_summary = $cart_item->get_pricing_summary();
		$new_amount = $pricing_summary['total_amount'];
		$new_interval = $cart_item->get_product_field()->get_value()['subscription'];
		$new_currency = $cart_item->get_currency();

		$old_subscription_id = $this->order->get_transaction_id();
		if ( empty( $old_subscription_id ) ) {
			throw new \Exception( _x( 'Subscription ID not found', 'paypal', 'voxel' ) );
		}

		// Calculate proration
		$preview = $this->preview_subscription_price_update( $cart_item );
		$prorated_amount = null;
		$remaining_days = null;

		$billing_period = $this->get_current_billing_period();
		// Skip proration if currently in a free trial period (no payment made yet)
		if ( $this->is_current_period_trial() ) {
			// No proration needed, proceed with plan switch
		} elseif ( $billing_period && isset( $billing_period['start'] ) && isset( $billing_period['end'] ) ) {
			$period_start = strtotime( $billing_period['start'] );
			$period_end = strtotime( $billing_period['end'] );
			$now = time();

			// Validate time calculations
			if ( ! $period_start || ! $period_end || $period_start >= $period_end ) {
				// Invalid period, skip proration
			} elseif ( $period_end <= $now ) {
				// Period has ended, no proration
			} elseif ( $period_start < $now && $now < $period_end ) {
				// We're mid-cycle, calculate proration
				$period_duration = $period_end - $period_start;
				$remaining = $period_end - $now;

				if ( $period_duration > 0 && $remaining > 0 ) {
					$current_amount = $this->order->get_details( 'pricing.total' );
					$current_currency = $this->order->get_currency();

					// Only calculate proration if currencies match
					if ( strtoupper( $current_currency ) === strtoupper( $new_currency ) ) {
						$unused_credit = ( $remaining / $period_duration ) * $current_amount;
						$prorated_amount = $new_amount - $unused_credit;

						// Calculate remaining time in days (ceil to ensure >= 1 day minimum)
						$remaining_days = max( 1, (int) ceil( $remaining / DAY_IN_SECONDS ) );

						// Only use prorated amount if positive and >= 0.01 (for setup fee)
						if ( $prorated_amount < 0.01 ) {
							$prorated_amount = null;
						}
					}
				}
			}
		}

		// Get current subscription to find product_id
		$subscription = Module\PayPal_Client::get_subscription( $old_subscription_id );
		$current_plan_id = $subscription['plan_id'] ?? null;
		$current_product_id = null;

		if ( $current_plan_id ) {
			try {
				$current_plan = Module\PayPal_Client::get_plan( $current_plan_id );
				$current_product_id = $current_plan['product_id'] ?? null;
			} catch ( \Exception $e ) {
				// Plan might not exist, continue
			}
		}

		// Get or create product
		$product_id = $current_product_id;
		if ( ! $product_id ) {
			$product = $this->_create_or_get_product();
			$product_id = $product['id'];
		}

		// Build plan data with proration (setup_fee + trial + regular)
		$plan_data = $this->_build_plan_data_with_proration(
			$product_id,
			$new_amount,
			$new_interval,
			$new_currency,
			$prorated_amount,
			$remaining_days
		);

		// Create new plan
		$new_plan = Module\PayPal_Client::create_plan( $plan_data );

		if ( empty( $new_plan['id'] ) ) {
			throw new \Exception( _x( 'Failed to create new PayPal plan', 'paypal', 'voxel' ) );
		}

		// Create new subscription (requires buyer approval)
		$customer = $this->order->get_customer();
		$subscription_data = [
			'plan_id' => $new_plan['id'],
			'application_context' => [
				'return_url' => $this->get_success_url(),
				'cancel_url' => $this->get_cancel_url(),
				'brand_name' => get_bloginfo( 'name' ),
				'locale' => Module\format_locale( get_locale() ),
				'shipping_preference' => 'NO_SHIPPING',
			],
		];

		// Add payer if available
		if ( ! empty( $customer->get_email() ) ) {
			$subscription_data['subscriber'] = [
				'email_address' => $customer->get_email(),
				'name' => [
					'given_name' => $customer->get_display_name(),
				],
			];
		}

		$subscription_data = apply_filters(
			'voxel/paypal_subscriptions/update_subscription_price/args',
			$subscription_data,
			$this,
			$this->order,
			$cart_item
		);

		$new_subscription = Module\PayPal_Client::create_subscription( $subscription_data );

		if ( empty( $new_subscription['id'] ) ) {
			throw new \Exception( _x( 'Failed to create new PayPal subscription', 'paypal', 'voxel' ) );
		}

		// Find approval URL
		$approval_url = null;
		if ( ! empty( $new_subscription['links'] ) ) {
			foreach ( $new_subscription['links'] as $link ) {
				if ( isset( $link['rel'] ) && $link['rel'] === 'approve' ) {
					$approval_url = $link['href'];
					break;
				}
			}
		}

		if ( empty( $approval_url ) ) {
			throw new \Exception( _x( 'Failed to get PayPal approval URL', 'paypal', 'voxel' ) );
		}

		// Store switch state for success callback
		$this->order->set_details( 'checkout.plan_switch', [
			'old_subscription_id' => $old_subscription_id,
			'new_subscription_id' => $new_subscription['id'],
			'new_plan_id' => $new_plan['id'],
			'cart_item' => [
				$cart_item->get_key() => $cart_item->get_value_for_storage(),
			],
			'order_item' => [
				'post_id' => $cart_item->get_post()->get_id(),
				'product_type' => $cart_item->get_product_type()->get_key(),
				'field_key' => $cart_item->get_product_field()->get_key(),
				'order_item_config' => $cart_item->get_order_item_config(),
			],
			'pricing' => [
				'currency' => $new_currency,
				'subtotal' => $pricing_summary['total_amount'],
			],
		] );

		$this->order->save();

		// Return approval URL for redirect (similar to process_payment)
		return [
			'success' => true,
			'redirect_url' => $approval_url,
		];
	}

	protected function _build_plan_data_with_proration( $product_id, $new_amount, $new_interval, $currency, $prorated_amount = null, $remaining_days = null ) {
		// Map interval to PayPal format
		$paypal_interval = 'DAY';
		if ( $new_interval['unit'] === 'week' ) {
			$paypal_interval = 'WEEK';
		} elseif ( $new_interval['unit'] === 'month' ) {
			$paypal_interval = 'MONTH';
		} elseif ( $new_interval['unit'] === 'year' ) {
			$paypal_interval = 'YEAR';
		}

		$plan_name = sprintf(
			'%s - %s %s',
			get_bloginfo( 'name' ),
			$new_interval['frequency'],
			ucfirst( $new_interval['unit'] ) . ( (int) $new_interval['frequency'] > 1 ? 's' : '' )
		);

		$billing_cycles = [];
		$sequence = 1;

		// Add trial period for remaining time in current billing period
		if ( $remaining_days && $remaining_days >= 1 ) {
			$billing_cycles[] = [
				'frequency' => [
					'interval_unit' => 'DAY',
					'interval_count' => $remaining_days,
				],
				'tenure_type' => 'TRIAL',
				'sequence' => $sequence++,
				'total_cycles' => 1,
				'pricing_scheme' => [
					'fixed_price' => [
						'value' => '0',
						'currency_code' => strtoupper( $currency ),
					],
				],
			];
		}

		// Add regular billing cycle (always present)
		$billing_cycles[] = [
			'frequency' => [
				'interval_unit' => $paypal_interval,
				'interval_count' => (int) $new_interval['frequency'],
			],
			'tenure_type' => 'REGULAR',
			'sequence' => $sequence,
			'total_cycles' => 0, // Infinite
			'pricing_scheme' => [
				'fixed_price' => [
					'value' => number_format( $new_amount, 2, '.', '' ),
					'currency_code' => strtoupper( $currency ),
				],
			],
		];

		$payment_preferences = [
			'auto_bill_outstanding' => true,
			'setup_fee_failure_action' => 'CONTINUE',
			'payment_failure_threshold' => 3,
		];

		// Add setup fee if prorated amount is positive (for upgrades)
		if ( $prorated_amount && $prorated_amount >= 0.01 ) {
			$payment_preferences['setup_fee'] = [
				'value' => number_format( $prorated_amount, 2, '.', '' ),
				'currency_code' => strtoupper( $currency ),
			];
		}

		return [
			'product_id' => $product_id,
			'name' => $plan_name,
			'billing_cycles' => $billing_cycles,
			'payment_preferences' => $payment_preferences,
		];
	}
}

