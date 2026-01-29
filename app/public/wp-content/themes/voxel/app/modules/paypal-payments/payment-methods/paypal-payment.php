<?php

namespace Voxel\Modules\PayPal_Payments\Payment_Methods;

use \Voxel\Modules\PayPal_Payments as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Payment extends \Voxel\Product_Types\Payment_Methods\Base_Payment_Method {

	public function get_type(): string {
		return 'paypal_payment';
	}

	public function get_label(): string {
		return _x( 'PayPal payment', 'payment methods', 'voxel' );
	}

	public function process_payment() {
		try {
			$customer = $this->order->get_customer();
			$purchase_units = $this->build_purchase_units();
			$capture_method = $this->get_capture_method();
			$intent = in_array( $capture_method, [ 'manual', 'deferred' ], true ) ? 'AUTHORIZE' : 'CAPTURE';

			$order_data = [
				'intent' => $intent,
				'purchase_units' => $purchase_units,
				'application_context' => [
					'return_url' => $this->get_success_url(),
					'cancel_url' => $this->get_cancel_url(),
					'brand_name' => get_bloginfo( 'name' ),
					'landing_page' => 'NO_PREFERENCE',
					'user_action' => 'PAY_NOW',
					'locale' => Module\format_locale( get_locale() ),
					'shipping_preference' => 'NO_SHIPPING',
				],
			];

			$order_data = apply_filters(
				'voxel/paypal_payments/process_payment/args',
				$order_data,
				$this,
				$this->order
			);

			// Calculate total from purchase units
			$total_order_amount = 0;
			$currency = $this->order->get_currency();
			if ( ! empty( $purchase_units[0]['amount']['value'] ) ) {
				$total_order_amount = (float) $purchase_units[0]['amount']['value'];
				$currency = $purchase_units[0]['amount']['currency_code'] ?? $currency;
			}

			$this->order->set_details( 'pricing.total', $total_order_amount );

			$paypal_order = Module\PayPal_Client::create_order( $order_data );
			if ( empty( $paypal_order['id'] ) ) {
				throw new \Exception( _x( 'Failed to create PayPal order', 'paypal', 'voxel' ) );
			}

			// Find approval URL
			$approval_url = null;
			if ( ! empty( $paypal_order['links'] ) ) {
				foreach ( $paypal_order['links'] as $link ) {
					if ( isset( $link['rel'] ) && $link['rel'] === 'approve' ) {
						$approval_url = $link['href'];
						break;
					}
				}
			}

			if ( empty( $approval_url ) ) {
				throw new \Exception( _x( 'Failed to get PayPal approval URL', 'paypal', 'voxel' ) );
			}

			$this->order->set_details( 'checkout.order_id', $paypal_order['id'] );
			$this->order->set_details( 'checkout.capture_method', $this->get_capture_method() );
			$this->order->set_transaction_id( $paypal_order['id'] );
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
			'action' => 'paypal.checkout.success',
			'order_id' => $this->order->get_id(),
		], home_url('/') );
	}

	protected function get_cancel_url() {
		$redirect_url = wp_get_referer() ?: home_url('/');
		$redirect_url = add_query_arg( 't', time(), $redirect_url );

		return add_query_arg( [
			'vx' => 1,
			'action' => 'paypal.checkout.cancel',
			'order_id' => $this->order->get_id(),
			'vxnonce' => wp_create_nonce( sprintf( 'paypal_cancel_%d', $this->order->get_id() ) ),
			'redirect_to' => rawurlencode( $redirect_url ),
		], home_url('/') );
	}

	public function get_capture_method(): string {
		if ( count( $this->order->get_items() ) === 1 ) {
			foreach ( $this->order->get_items() as $item ) {
				if ( $item->get_product_field_key() === 'voxel:promotion' ) {
					$approval = \Voxel\get( 'paid_listings.settings.promotions.order_approval', 'automatic' );
					return $approval === 'manual' ? 'manual' : 'automatic';
				} elseif ( $item->get_product_field_key() === 'voxel:listing_plan' ) {
					return 'automatic';
				}
			}
		}

		// Check PayPal order approval setting
		$approval = \Voxel\get( 'payments.paypal.payments.order_approval', 'automatic' );
		if ( $approval === 'manual' ) {
			return 'manual';
		} elseif ( $approval === 'deferred' ) {
			return 'deferred';
		} else {
			return 'automatic';
		}
	}

	protected function build_purchase_units(): array {
		$items = [];
		$currency = $this->order->get_currency();
		$subtotal = 0;
		$shipping_total = 0;

		// Build line items
		foreach ( $this->get_line_items() as $line_item ) {
			$item_amount = $line_item['amount'];
			$subtotal += $item_amount * $line_item['quantity'];

			$items[] = [
				'name' => $line_item['product']['label'],
				'description' => $line_item['product']['description'] ?? '',
				'quantity' => (string) $line_item['quantity'],
				'unit_amount' => [
					'currency_code' => strtoupper( $line_item['currency'] ),
					'value' => number_format( $line_item['amount'], 2, '.', '' ),
				],
			];

			// Note: PayPal Orders API v2 does not support image_url in items
		}

		// Add shipping if applicable
		if ( $this->order->has_shippable_products() ) {
			$shipping_line_items = $this->get_shipping_line_items();
			foreach ( $shipping_line_items as $line_item ) {
				$shipping_total += $line_item['amount'];
			}
		}

		$total = $subtotal + $shipping_total;

		$purchase_unit = [
			'reference_id' => sprintf( 'order:%d', $this->order->get_id() ),
			'description' => sprintf( 'Order #%d', $this->order->get_id() ),
			'items' => $items,
			'amount' => [
				'currency_code' => strtoupper( $currency ),
				'value' => number_format( $total, 2, '.', '' ),
				'breakdown' => [
					'item_total' => [
						'currency_code' => strtoupper( $currency ),
						'value' => number_format( $subtotal, 2, '.', '' ),
					],
				],
			],
		];

		if ( $shipping_total > 0 ) {
			$purchase_unit['amount']['breakdown']['shipping'] = [
				'currency_code' => strtoupper( $currency ),
				'value' => number_format( $shipping_total, 2, '.', '' ),
			];

			$this->order->set_details( 'pricing.shipping', $shipping_total );
		}

		return [ $purchase_unit ];
	}

	public function order_updated( $order_data ) {
		if ( ! is_array( $order_data ) ) {
			return;
		}

		$status = $order_data['status'] ?? null;

		// Handle different order statuses
		if ( $status === 'APPROVED' ) {
			// Order is approved, but not yet captured/authorized
			// Capture or authorization will happen in payment_captured/payment_authorized method
		} elseif ( $status === 'AUTHORIZED' ) {
			// Order is authorized (for manual or deferred capture)
			// Authorization details will be processed in payment_authorized method
		} elseif ( $status === 'COMPLETED' ) {
			// Order is completed (captured)
			$this->order->set_status( \Voxel\ORDER_COMPLETED );
		} elseif ( $status === 'CANCELED' || $status === 'VOIDED' ) {
			$this->order->set_status( \Voxel\ORDER_CANCELED );
		}

		// Store authorization details (for manual capture)
		if ( ! empty( $order_data['purchase_units'][0]['payments']['authorizations'][0] ) ) {
			$authorization = $order_data['purchase_units'][0]['payments']['authorizations'][0];
			$this->payment_authorized( $authorization, $order_data );
		}

		// Store capture details (for automatic capture)
		if ( ! empty( $order_data['purchase_units'][0]['payments']['captures'][0] ) ) {
			$capture = $order_data['purchase_units'][0]['payments']['captures'][0];
			$this->payment_captured( $capture, $order_data );
		}

		$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
		$this->order->save();
	}

	public function payment_authorized( $authorization_data, $order_data = null ) {
		if ( ! is_array( $authorization_data ) ) {
			return;
		}

		$authorization_id = $authorization_data['id'] ?? null;
		$status = $authorization_data['status'] ?? null;
		$amount = $authorization_data['amount'] ?? null;

		if ( $authorization_id ) {
			$this->order->set_details( 'checkout.authorization_id', $authorization_id );
		}

		if ( $amount ) {
			$total = (float) ( $amount['value'] ?? 0 );
			$this->order->set_details( 'pricing.total', $total );
			$this->order->set_details(
				'pricing.currency',
				strtoupper( $amount['currency_code'] ?? $this->order->get_currency() )
			);
		}

		$capture_method = $this->order->get_details( 'checkout.capture_method' );

		if ( $status === 'CREATED' ) {
			if ( $capture_method === 'deferred' ) {
				// Deferred capture: validate cart and auto-capture or auto-void
				$cart_is_valid = false;
				try {
					$cart = $this->order->get_cart();
					$cart_is_valid = true;
				} catch ( \Exception $e ) {
					\Voxel\log( sprintf(
						'PayPal deferred capture: cart validation failed for order %s: %s',
						$this->order->get_id(),
						$e->getMessage()
					) );
				}

				if ( $cart_is_valid ) {
					// Cart is valid: automatically capture from authorization
					try {
						$capture_result = Module\PayPal_Client::capture_authorization( $authorization_id );
						// Update order with capture result
						if ( ! empty( $capture_result['id'] ) ) {
							$this->order->set_details( 'checkout.capture_id', $capture_result['id'] );
						}
						if ( ! empty( $capture_result['status'] ) && $capture_result['status'] === 'COMPLETED' ) {
							$this->order->set_status( \Voxel\ORDER_COMPLETED );
						}
						if ( ! empty( $capture_result['amount'] ) ) {
							$this->order->set_details(
								'pricing.total',
								(float) $capture_result['amount']['value']
							);

							$this->order->set_details(
								'pricing.currency',
								strtoupper( $capture_result['amount']['currency_code'] ?? $this->order->get_currency() )
							);
						}
					} catch ( \Exception $e ) {
						\Voxel\log( sprintf(
							'PayPal deferred capture failed for authorization %s: %s',
							$authorization_id,
							$e->getMessage()
						) );

						// If capture fails, set to pending approval as fallback
						$this->order->set_status( \Voxel\ORDER_PENDING_APPROVAL );
					}
				} else {
					// Cart is invalid: void the authorization and cancel order
					try {
						Module\PayPal_Client::void_authorization( $authorization_id );
						$this->order->set_status( \Voxel\ORDER_CANCELED );
					} catch ( \Exception $e ) {
						\Voxel\log( sprintf(
							'PayPal deferred capture: void authorization failed for %s: %s',
							$authorization_id,
							$e->getMessage()
						) );

						$this->order->set_status( \Voxel\ORDER_CANCELED );
					}
				}
			} else {
				// Manual capture: set to pending approval for manual review
				$this->order->set_status( \Voxel\ORDER_PENDING_APPROVAL );
			}
		} elseif ( $status === 'CAPTURED' ) {
			// Authorization was captured (for deferred or manual)
			$this->order->set_status( \Voxel\ORDER_COMPLETED );
		} elseif ( $status === 'DENIED' || $status === 'VOIDED' || $status === 'EXPIRED' ) {
			$this->order->set_status( \Voxel\ORDER_CANCELED );
		}

		// Store payer information if available
		if ( $order_data && ! empty( $order_data['payer'] ) ) {
			$this->order->set_details( 'checkout.payer_details', [
				'payer_id' => $order_data['payer']['payer_id'] ?? null,
				'email_address' => $order_data['payer']['email_address'] ?? null,
				'name' => isset( $order_data['payer']['name'] ) ? [
					'given_name' => $order_data['payer']['name']['given_name'] ?? null,
					'surname' => $order_data['payer']['name']['surname'] ?? null,
				] : null,
			] );
		}

		// Store payee information
		if ( $order_data && ! empty( $order_data['purchase_units'][0]['payee'] ) ) {
			$this->order->set_details( 'checkout.payee_details', [
				'email_address' => $order_data['purchase_units'][0]['payee']['email_address'] ?? null,
				'merchant_id' => $order_data['purchase_units'][0]['payee']['merchant_id'] ?? null,
				'display_data' => isset( $order_data['purchase_units'][0]['payee']['display_data'] ) ? [
					'brand_name' => $order_data['purchase_units'][0]['payee']['display_data']['brand_name'] ?? null,
				] : null,
			] );
		}

		$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
		$this->order->save();
	}

	public function payment_captured( $capture_data, $order_data = null ) {
		if ( ! is_array( $capture_data ) ) {
			return;
		}

		$capture_id = $capture_data['id'] ?? null;
		$status = $capture_data['status'] ?? null;
		$amount = $capture_data['amount'] ?? null;

		if ( $capture_id ) {
			$this->order->set_details( 'checkout.capture_id', $capture_id );
		}

		if ( $amount ) {
			$total = (float) ( $amount['value'] ?? 0 );
			$this->order->set_details( 'pricing.total', $total );
			$this->order->set_details(
				'pricing.currency',
				strtoupper( $amount['currency_code'] ?? $this->order->get_currency() )
			);
		}

		if ( $status === 'COMPLETED' ) {
			$this->order->set_status( \Voxel\ORDER_COMPLETED );
		} elseif ( $status === 'DECLINED' || $status === 'FAILED' ) {
			$this->order->set_status( \Voxel\ORDER_CANCELED );
		} elseif ( $status === 'REFUNDED' ) {
			$this->order->set_status( \Voxel\ORDER_REFUNDED );
		} elseif ( $status === 'PARTIALLY_REFUNDED' ) {
			$this->order->set_status( \Voxel\ORDER_REFUNDED );
		}

		// Store payer information if available
		if ( $order_data && ! empty( $order_data['payer'] ) ) {
			$this->order->set_details( 'checkout.payer_details', [
				'payer_id' => $order_data['payer']['payer_id'] ?? null,
				'email_address' => $order_data['payer']['email_address'] ?? null,
				'name' => isset( $order_data['payer']['name'] ) ? [
					'given_name' => $order_data['payer']['name']['given_name'] ?? null,
					'surname' => $order_data['payer']['name']['surname'] ?? null,
				] : null,
			] );
		}

		// Store payee information
		if ( $order_data && ! empty( $order_data['purchase_units'][0]['payee'] ) ) {
			$this->order->set_details( 'checkout.payee_details', [
				'email_address' => $order_data['purchase_units'][0]['payee']['email_address'] ?? null,
				'merchant_id' => $order_data['purchase_units'][0]['payee']['merchant_id'] ?? null,
				'display_data' => isset( $order_data['purchase_units'][0]['payee']['display_data'] ) ? [
					'brand_name' => $order_data['purchase_units'][0]['payee']['display_data']['brand_name'] ?? null,
				] : null,
			] );
		}

		$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
		$this->order->save();
	}

	public function should_sync(): bool {
		return ! $this->order->get_details( 'checkout.last_synced_at' );
	}

	public function sync(): void {
		$order_id = $this->order->get_details( 'checkout.order_id' );
		if ( empty( $order_id ) ) {
			return;
		}

		try {
			$paypal_order = Module\PayPal_Client::get_order( $order_id );
			$this->order_updated( $paypal_order );
		} catch ( \Exception $e ) {
			\Voxel\log( 'PayPal sync failed: ' . $e->getMessage() );
		}
	}

	public function get_vendor_actions(): array {
		$actions = [];
		if ( $this->order->get_status() === \Voxel\ORDER_PENDING_APPROVAL ) {
			$actions[] = [
				'action' => 'vendor.approve',
				'label' => _x( 'Approve', 'order actions', 'voxel' ),
				'type' => 'primary',
				'handler' => function() {
					try {
						Module\approve_order( $this->order );

						$event = new \Voxel\Events\Products\Orders\Vendor_Approved_Order_Event;
						$event->dispatch( $this->order->get_id() );

						return wp_send_json( [
							'success' => true,
						] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];

			$actions[] = [
				'action' => 'vendor.decline',
				'label' => _x( 'Decline', 'order actions', 'voxel' ),
				'handler' => function() {
					try {
						Module\decline_order( $this->order );

						$event = new \Voxel\Events\Products\Orders\Vendor_Declined_Order_Event;
						$event->dispatch( $this->order->get_id() );

						return wp_send_json( [
							'success' => true,
						] );
					} catch ( \Exception $e ) {
						return wp_send_json( [
							'success' => false,
							'message' => $e->getMessage(),
						] );
					}
				},
			];
		}

		return $actions;
	}

	public function get_customer_actions(): array {
		$actions = [];
		if ( $this->order->get_status() === \Voxel\ORDER_PENDING_APPROVAL ) {
			$actions[] = [
				'action' => 'customer.cancel',
				'label' => _x( 'Cancel order', 'order customer actions', 'voxel' ),
				'handler' => function() {
					$authorization_id = $this->order->get_details( 'checkout.authorization_id' );
					if ( $authorization_id ) {
						// Void the authorization if it exists
						try {
							Module\PayPal_Client::void_authorization( $authorization_id );
						} catch ( \Exception $e ) {
							\Voxel\log( sprintf(
								'PayPal authorization void failed during customer cancel: %s',
								$e->getMessage()
							) );
							// Continue with order cancellation even if void fails
						}
					}

					$this->order->set_status( \Voxel\ORDER_CANCELED );
					$this->order->save();

					$event = new \Voxel\Events\Products\Orders\Customer_Canceled_Order_Event;
					$event->dispatch( $this->order->get_id() );

					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		$actions[] = [
			'action' => 'customer.view_in_paypal',
			'label' => _x( 'Customer portal', 'order customer actions', 'voxel' ),
			'handler' => function() {
				return wp_send_json( [
					'success' => true,
					'redirect_to' => Module\get_customer_portal_link( $this->order ),
				] );
			},
		];

		return $actions;
	}
}

