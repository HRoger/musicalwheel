<?php

namespace Voxel\Modules\Stripe_Payments\Payment_Methods;

use \Voxel\Modules\Stripe_Payments as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Stripe_Payment extends \Voxel\Product_Types\Payment_Methods\Base_Payment_Method {

	public function get_type(): string {
		return 'stripe_payment';
	}

	public function get_label(): string {
		return _x( 'Stripe payment', 'payment methods', 'voxel' );
	}

	public function process_payment() {
		try {
			$customer = $this->order->get_customer();
			$stripe_customer = $customer->get_or_create_stripe_customer();
			$billing_address_collection = \Voxel\get( 'payments.stripe.payments.billing_address_collection', 'auto' );

			$args = [
				'client_reference_id' => sprintf( 'order:%d', $this->order->get_id() ),
				'customer' => $stripe_customer->id,
				'mode' => 'payment',
				'currency' => $this->order->get_currency(),
				'customer_update' => [
					'address' => 'auto',
					'name' => 'auto',
				],
				'locale' => 'auto',
				'line_items' => array_map( function( $line_item ) {
					$order_item = $line_item['order_item'];
					$data = [
						'quantity' => $line_item['quantity'],
						'price_data' => [
							'currency' => $line_item['currency'],
							'unit_amount_decimal' => $line_item['amount_in_cents'],
							'product_data' => [
								'name' => $line_item['product']['label'],
							],
						],
					];

					if ( ! empty( $line_item['product']['description'] ) ) {
						$data['price_data']['product_data']['description'] = $line_item['product']['description'];
					}

					if ( ! empty( $line_item['product']['thumbnail_url'] ) ) {
						$data['price_data']['product_data']['images'] = [ $line_item['product']['thumbnail_url'] ];
					}

					if ( $this->get_tax_collection_method() === 'stripe_tax' ) {
						$tax_behavior = \Voxel\get( sprintf(
							'payments.stripe.tax_collection.stripe_tax.product_types.%s.tax_behavior',
							$order_item->get_product_type_key()
						), 'default' );

						if ( in_array( $tax_behavior, [ 'inclusive', 'exclusive' ], true ) ) {
							$data['price_data']['tax_behavior'] = $tax_behavior;
						}

						$tax_code = \Voxel\get( sprintf(
							'payments.stripe.tax_collection.stripe_tax.product_types.%s.tax_code',
							$order_item->get_product_type_key()
						) );

						if ( ! empty( $tax_code ) ) {
							$data['price_data']['product_data']['tax_code'] = $tax_code;
						}
					} elseif ( $this->get_tax_collection_method() === 'tax_rates' ) {
						$tax_calculation_method = \Voxel\get( sprintf(
							'payments.stripe.tax_collection.tax_rates.product_types.%s.calculation_method',
							$order_item->get_product_type_key()
						), 'fixed' );

						if ( $tax_calculation_method === 'fixed' ) {
							$tax_rates = \Voxel\get( sprintf(
								'payments.stripe.tax_collection.tax_rates.product_types.%s.fixed_rates.%s',
								$order_item->get_product_type_key(),
								Module\Stripe_Client::is_test_mode() ? 'test_mode' : 'live_mode'
							), [] );

							if ( ! empty( $tax_rates ) ) {
								$data['tax_rates'] = $tax_rates;
							}
						} elseif ( $tax_calculation_method === 'dynamic' ) {
							$dynamic_tax_rates = \Voxel\get( sprintf(
								'payments.stripe.tax_collection.tax_rates.product_types.%s.dynamic_rates.%s',
								$order_item->get_product_type_key(),
								Module\Stripe_Client::is_test_mode() ? 'test_mode' : 'live_mode'
							), [] );

							if ( ! empty( $dynamic_tax_rates ) ) {
								$data['dynamic_tax_rates'] = $dynamic_tax_rates;
							}
						}
					}

					return $data;
				}, $this->get_line_items() ),
				'payment_intent_data' => [
					'capture_method' => $this->get_capture_method() === 'automatic' ? 'automatic_async' : 'manual',
					'metadata' => [
						'voxel:payment_for' => 'order',
						'voxel:order_id' => $this->order->get_id(),
					],
				],
				'success_url' => $this->get_success_url(),
				'cancel_url' => $this->get_cancel_url(),
				'submit_type' => $this->get_submit_type(),
				'metadata' => [
					'voxel:payment_for' => 'order',
					'voxel:order_id' => $this->order->get_id(),
				],
				'billing_address_collection' => $billing_address_collection === 'required' ? 'required' : 'auto',
				'tax_id_collection' => [
					'enabled' => !! \Voxel\get( 'payments.stripe.payments.tax_id_collection.enabled', true ),
				],
				'allow_promotion_codes' => !! \Voxel\get( 'payments.stripe.payments.promotion_codes.enabled', false ),
			];

			if ( $this->get_tax_collection_method() === 'stripe_tax' ) {
				$args['automatic_tax'] = [
					'enabled' => true,
				];
			}

			if ( \Voxel\get( 'payments.stripe.payments.phone_number_collection.enabled' ) ) {
				$args['phone_number_collection'] = [
					'enabled' => true,
				];
			}

			if ( $this->order->has_shippable_products() ) {
				$shipping_total = 0;
				$shipping_line_items = $this->get_shipping_line_items();
				foreach ( $shipping_line_items as $line_item ) {
					$shipping_total += $line_item['amount'];
					$args['line_items'][] = [
						'quantity' => $line_item['quantity'],
						'price_data' => [
							'currency' => $this->order->get_currency(),
							'unit_amount' => $line_item['amount_in_cents'],
							'tax_behavior' => $line_item['tax_behavior'],
							'product_data' => [
								'name' => $line_item['product']['label'],
								'description' => $line_item['product']['description'],
								// 'tax_code' => $line_item['tax_code'] === 'shipping' ? 'txcd_92010001' : 'txcd_00000000',
							],
						],
					];
				}

				$this->order->set_details( 'pricing.shipping', $shipping_total );

				$amounts_by_vendor = array_column( $shipping_line_items, 'amount_in_cents', 'vendor' );
				$this->order->set_details( 'shipping.amounts_by_vendor', $amounts_by_vendor );
			}

			$args = apply_filters( 'voxel/stripe_payments/process_payment/args', $args, $this, $this->order );

			$session = \Voxel\Vendor\Stripe\Checkout\Session::create( $args );

			$total_order_amount = $session->amount_total;
			if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $session->currency ) ) {
				$total_order_amount /= 100;
			}

			if ( $total_order_amount === 0 ) {
				$this->order->set_details( 'checkout.is_zero_amount', true );

				if ( apply_filters( 'voxel/stripe_payments/zero_amount/skip_checkout', false ) === true ) {
					$this->order->set_details( 'checkout.zero_amount.skip_checkout', true );
				}
			}

			$this->order->set_details( 'pricing.total', $total_order_amount );
			$this->order->set_details( 'checkout.session_id', $session->id );
			$this->order->set_details( 'checkout.capture_method', $this->get_capture_method() );

			$this->order->save();

			if ( $total_order_amount === 0 && $this->order->get_details( 'checkout.zero_amount.skip_checkout' ) === true ) {
				if ( $this->order->get_details( 'cart.type' ) === 'customer_cart' ) {
					$customer_cart = $customer->get_cart();
					$customer_cart->empty();
					$customer_cart->update();
				}

				$this->zero_amount_checkout_session_updated( $session );

				return [
					'success' => true,
					'redirect_url' => $this->order->get_link(),
				];
			}

			return [
				'success' => true,
				'redirect_url' => $session->url,
			];
		} catch ( \Voxel\Vendor\Stripe\Exception\ApiErrorException | \Voxel\Vendor\Stripe\Exception\InvalidArgumentException $e ) {
			return [
				'success' => false,
				'message' => _x( 'Something went wrong', 'checkout', 'voxel' ),
				'debug' => [
					'type' => 'stripe_error',
					'code' => method_exists( $e, 'getStripeCode' ) ? $e->getStripeCode() : $e->getCode(),
					'message' => $e->getMessage(),
				],
			];
		}
	}

	protected function get_success_url() {
		return add_query_arg( [
			'vx' => 1,
			'action' => 'stripe_payments.checkout.success',
			'session_id' => '{CHECKOUT_SESSION_ID}',
			'order_id' => $this->order->get_id(),
		], home_url('/') );
	}

	protected function get_cancel_url() {
		$redirect_url = wp_get_referer() ?: home_url('/');
		$redirect_url = add_query_arg( 't', time(), $redirect_url );

		return add_query_arg( [
			'vx' => 1,
			'action' => 'stripe_payments.checkout.cancel',
			'session_id' => '{CHECKOUT_SESSION_ID}',
			'order_id' => $this->order->get_id(),
			'redirect_to' => rawurlencode( $redirect_url ),
		], home_url('/') );
	}

	protected function get_submit_type(): string {
		foreach ( $this->order->get_items() as $item ) {
			if ( $item->get_type() === 'booking' ) {
				return 'book';
			}
		}

		return 'auto';
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

		$approval = \Voxel\get( 'payments.stripe.payments.order_approval' );
		if ( $approval === 'manual' ) {
			return 'manual';
		} elseif ( $approval === 'deferred' ) {
			return 'deferred';
		} else {
			return 'automatic';
		}
	}

	public function get_tax_collection_method() {
		if ( \Voxel\get( 'payments.stripe.tax_collection.enabled' ) ) {
			return \Voxel\get( 'payments.stripe.tax_collection.collection_method', 'stripe_tax' );
		}

		return null;
	}

	public function is_zero_amount(): bool {
		return !! $this->order->get_details( 'checkout.is_zero_amount' );
	}

	public function payment_intent_updated(
		\Voxel\Vendor\Stripe\PaymentIntent $payment_intent,
		?\Voxel\Vendor\Stripe\Checkout\Session $session = null
	) {
		if ( $this->order->get_details( 'checkout.capture_method' ) === 'deferred' ) {
			if ( $payment_intent->status === 'requires_capture' ) {
				$cart_is_valid = false;
				try {
					$cart = $this->order->get_cart();
					$cart_is_valid = true;
				} catch ( \Exception $e ) {
					\Voxel\log($e->getMessage(), $e->getCode());
				}

				if ( $cart_is_valid ) {
					$payment_intent = $payment_intent->capture();
				} else {
					$payment_intent = $payment_intent->cancel();
				}
			}
		}

		$order_status = $this->determine_order_status_from_payment_intent( $payment_intent );
		if ( $order_status !== null ) {
			$this->order->set_status( $order_status );
		}

		$this->order->set_details( 'payment_intent', [
			'id' => $payment_intent->id,
			'amount' => $payment_intent->amount,
			'currency' => $payment_intent->currency,
			'customer' => $payment_intent->customer,
			'status' => $payment_intent->status,
			'canceled_at' => $payment_intent->canceled_at,
			'cancellation_reason' => $payment_intent->cancellation_reason,
			'created' => $payment_intent->created,
			'livemode' => $payment_intent->livemode,
			'latest_charge' => is_object( $payment_intent->latest_charge ) ? $payment_intent->latest_charge->id : $payment_intent->latest_charge,
			'capture_method' => $payment_intent->capture_method,
			'application_fee_amount' => $payment_intent->application_fee_amount,
			'transfer_data' => [
				'destination' => $payment_intent->transfer_data->destination ?? null,
			],
			'transfer_group' => $payment_intent->transfer_group,
		] );

		$total_order_amount = $payment_intent->amount;
		if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $payment_intent->currency ) ) {
			$total_order_amount /= 100;
		}

		$this->order->set_details( 'pricing.total', $total_order_amount );
		$this->order->set_transaction_id( $payment_intent->id );
		$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );

		if ( $session ) {
			$this->order->set_details( 'checkout.session_details', $this->_get_checkout_session_details_for_storage( $session ) );

			$tax_amount = $this->_get_tax_amount_from_checkout_session( $session );
			$discount_amount = $this->_get_discount_amount_from_checkout_session( $session );

			if ( $tax_amount !== null ) {
				$this->order->set_details( 'pricing.tax', $tax_amount );
			}

			if ( $discount_amount !== null ) {
				$this->order->set_details( 'pricing.discount', $discount_amount );
			}
		}

		$this->order->save();
	}

	protected function _get_checkout_session_details_for_storage( \Voxel\Vendor\Stripe\Checkout\Session $session ) {
		return [
			'customer_details' => [
				'address' => [
					'city' => $session->customer_details->address->city ?? null,
					'country' => $session->customer_details->address->country ?? null,
					'line1' => $session->customer_details->address->line1 ?? null,
					'line2' => $session->customer_details->address->line2 ?? null,
					'postal_code' => $session->customer_details->address->postal_code ?? null,
					'state' => $session->customer_details->address->state ?? null,
				],
				'email' => $session->customer_details->email ?? null,
				'name' => $session->customer_details->name ?? null,
				'phone' => $session->customer_details->phone ?? null,
			],
		];
	}

	protected function _get_tax_amount_from_checkout_session( \Voxel\Vendor\Stripe\Checkout\Session $session ) {
		$tax_amount = $session->total_details->amount_tax;
		if ( ! is_numeric( $tax_amount ) ) {
			return null;
		}

		if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $session->currency ) ) {
			$tax_amount /= 100;
		}

		if ( $tax_amount === 0 ) {
			return null;
		}

		return $tax_amount;
	}

	protected function _get_discount_amount_from_checkout_session( \Voxel\Vendor\Stripe\Checkout\Session $session ) {
		$discount_amount = $session->total_details->amount_discount;
		if ( ! is_numeric( $discount_amount ) ) {
			return null;
		}

		if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $session->currency ) ) {
			$discount_amount /= 100;
		}

		if ( $discount_amount === 0 ) {
			return null;
		}

		return $discount_amount;
	}

	protected function determine_order_status_from_payment_intent( \Voxel\Vendor\Stripe\PaymentIntent $payment_intent ): ?string {
		if ( in_array( $payment_intent->status, [ 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing' ], true ) ) {
			return \Voxel\ORDER_PENDING_PAYMENT;
		} elseif ( $payment_intent->status === 'canceled' ) {
			return \Voxel\ORDER_CANCELED;
		} elseif ( $payment_intent->status === 'requires_capture' ) {
			return \Voxel\ORDER_PENDING_APPROVAL;
		} elseif ( $payment_intent->status === 'succeeded' ) {
			$stripe = Module\Stripe_Client::getClient();
			$latest_charge = $stripe->charges->retrieve( $payment_intent->latest_charge, [] );

			// handle refunds
			if ( $latest_charge ) {
				if ( $latest_charge->refunded ) {
					// full refund
					return \Voxel\ORDER_REFUNDED;
				} elseif ( $latest_charge->amount_refunded > 0 ) {
					// partial refund
					return \Voxel\ORDER_REFUNDED;
				}
			}

			return \Voxel\ORDER_COMPLETED;
		} else {
			return null;
		}
	}

	public function zero_amount_checkout_session_updated( \Voxel\Vendor\Stripe\Checkout\Session $session ) {
		$this->order->set_details( 'checkout.session_details', $this->_get_checkout_session_details_for_storage( $session ) );
		$this->order->set_details( 'checkout.is_zero_amount', true );
		$this->order->set_details( 'pricing.total', 0 );

		$tax_amount = $this->_get_tax_amount_from_checkout_session( $session );
		$discount_amount = $this->_get_discount_amount_from_checkout_session( $session );

		if ( $tax_amount !== null ) {
			$this->order->set_details( 'pricing.tax', $tax_amount );
		}

		if ( $discount_amount !== null ) {
			$this->order->set_details( 'pricing.discount', $discount_amount );
		}

		if ( $session->payment_status === 'paid' || $this->order->get_details( 'checkout.zero_amount.skip_checkout' ) === true ) {
			$capture_method = $this->order->get_details( 'checkout.capture_method' );
			if ( $capture_method === 'deferred' ) {
				$cart_is_valid = false;
				try {
					$cart = $this->order->get_cart();
					$cart_is_valid = true;
				} catch ( \Exception $e ) {}

				if ( $cart_is_valid ) {
					$status = \Voxel\ORDER_COMPLETED;
				} else {
					$status = \Voxel\ORDER_CANCELED;
				}
			} elseif ( $capture_method === 'manual' ) {
				$status = \Voxel\ORDER_PENDING_APPROVAL;
			} else {
				$status = \Voxel\ORDER_COMPLETED;
			}

			$this->order->set_status( $status );
			$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
			$this->order->save();
		} else {
			$this->order->set_status( \Voxel\ORDER_CANCELED );
			$this->order->set_details( 'checkout.last_synced_at', \Voxel\utc()->format( 'Y-m-d H:i:s' ) );
			$this->order->save();
		}
	}

	public function should_sync(): bool {
		return ! $this->order->get_details( 'checkout.last_synced_at' );
	}

	public function sync(): void {
		$stripe = Module\Stripe_Client::getClient();
		if ( $this->is_zero_amount() ) {
			$session = $stripe->checkout->sessions->retrieve( $this->order->get_details( 'checkout.session_id' ) );
			$this->zero_amount_checkout_session_updated( $session );
		} else {
			if ( $transaction_id = $this->order->get_transaction_id() ) {
				$payment_intent = $stripe->paymentIntents->retrieve( $transaction_id );
				$this->payment_intent_updated( $payment_intent );
			} elseif ( $checkout_session_id = $this->order->get_details( 'checkout.session_id' ) ) {
				$session = $stripe->checkout->sessions->retrieve( $checkout_session_id, [
					'expand' => [ 'payment_intent' ],
				] );

				$payment_intent = $session->payment_intent;
				if ( $payment_intent !== null ) {
					$this->payment_intent_updated( $payment_intent, $session );
				} else {
					// edge case: session exists but no payment intent, the customer likely used
					// a discount code to bring the order totals from a non-zero value to exactly 0
					$total_order_amount = $session->amount_total;
					if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $session->currency ) ) {
						$total_order_amount /= 100;
					}

					if ( $total_order_amount === 0 ) {
						$this->zero_amount_checkout_session_updated( $session );
					}
				}
			} else {
				//
			}
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
					if ( $this->is_zero_amount() ) {
						$this->order->set_status( \Voxel\ORDER_COMPLETED );
						$this->order->save();
					} else {
						$stripe = Module\Stripe_Client::getClient();
						$payment_intent = $stripe->paymentIntents->retrieve( $this->order->get_transaction_id() );
						$payment_intent = $payment_intent->capture();

						$this->payment_intent_updated( $payment_intent );
					}

					( new \Voxel\Events\Products\Orders\Vendor_Approved_Order_Event )->dispatch( $this->order->get_id() );

					return wp_send_json( [
						'success' => true,
					] );
				},
			];

			$actions[] = [
				'action' => 'vendor.decline',
				'label' => _x( 'Decline', 'order actions', 'voxel' ),
				'handler' => function() {
					if ( $this->is_zero_amount() ) {
						$this->order->set_status( \Voxel\ORDER_CANCELED );
						$this->order->save();
					} else {
						$stripe = Module\Stripe_Client::getClient();
						$payment_intent = $stripe->paymentIntents->cancel( $this->order->get_transaction_id() );

						$this->payment_intent_updated( $payment_intent );
					}

					( new \Voxel\Events\Products\Orders\Vendor_Declined_Order_Event )->dispatch( $this->order->get_id() );

					return wp_send_json( [
						'success' => true,
					] );
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
					if ( $this->is_zero_amount() ) {
						$this->order->set_status( \Voxel\ORDER_CANCELED );
						$this->order->save();
					} else {
						$stripe = Module\Stripe_Client::getClient();
						$payment_intent = $stripe->paymentIntents->cancel( $this->order->get_transaction_id(), [
							'cancellation_reason' => 'requested_by_customer',
						] );

						$this->payment_intent_updated( $payment_intent );
					}

					( new \Voxel\Events\Products\Orders\Customer_Canceled_Order_Event )->dispatch( $this->order->get_id() );

					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		$actions[] = [
			'action' => 'customer.access_portal',
			'label' => _x( 'Customer portal', 'order customer actions', 'voxel' ),
			'handler' => function() {
				$stripe = Module\Stripe_Client::getClient();
				$session = $stripe->billingPortal->sessions->create( [
					'customer' => \Voxel\current_user()->get_stripe_customer_id(),
					'configuration' => Module\Stripe_Client::get_portal_configuration_id(),
					'return_url' => $this->order->get_link(),
				] );

				return wp_send_json( [
					'success' => true,
					'redirect_to' => $session->url,
				] );
			},
		];

		return $actions;
	}
}
