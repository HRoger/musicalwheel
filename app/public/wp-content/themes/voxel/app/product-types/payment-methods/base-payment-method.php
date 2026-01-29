<?php

namespace Voxel\Product_Types\Payment_Methods;

use \Voxel\Product_Types\Cart_Items\Cart_Item;

if ( ! defined('ABSPATH') ) {
	exit;
}

abstract class Base_Payment_Method {

	protected $order;

	abstract public function get_type(): string;

	abstract public function get_label(): string;

	abstract public function process_payment();

	public function get_order() {
		return $this->order;
	}

	public function get_vendor_actions(): array {
		return [];
	}

	public function get_customer_actions(): array {
		return [];
	}

	public function get_customer_details(): array {
		return [];
	}

	public function should_sync(): bool {
		return false;
	}

	public function sync(): void {
		//
	}

	public function __construct( \Voxel\Product_Types\Orders\Order $order ) {
		$this->order = $order;
	}

	public static function get_all(): array {
		return apply_filters( 'voxel/product-types/payment-methods', [
			'offline_payment' => Offline_Payment::class,
			'zero_amount_payment' => Zero_Amount_Payment::class,
			'zero_amount_subscription' => Zero_Amount_Subscription::class,
		] );
	}

	public function get_line_items(): array {
		$line_items = [];

		// remove any non-ASCII characters from URLs
		$clean_url = function( $url ) {
			return is_string( $url ) ? preg_replace( '/[^\x20-\x7E]/', '', $url ) : null;
		};

		foreach ( $this->order->get_items() as $item ) {
			$currency = $item->get_currency();
			if ( $item->get_quantity() === null ) {
				$quantity = 1;
				$amount = $item->get_subtotal();
			} else {
				$quantity = $item->get_quantity();
				$amount = $item->get_subtotal_per_unit();
			}

			if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $currency ) ) {
				$amount_in_cents = $amount * 100;
			} else {
				$amount_in_cents = $amount;
			}

			$line_items[] = [
				'order_item' => $item,
				'id' => $item->get_id(),
				'quantity' => $quantity,
				'currency' => $currency,
				'amount' => $amount,
				'amount_in_cents' => $amount_in_cents,
				'product' => [
					'label' => $item->get_product_label(),
					'description' => $item->get_product_description(),
					'thumbnail_url' => $clean_url( $item->get_product_thumbnail_url() ),
				],
			];
		}

		return $line_items;
	}

	final public function get_calculated_total() {
		$total = 0;
		foreach ( $this->get_line_items() as $line_item ) {
			$total += $line_item['amount_in_cents'];
		}

		foreach ( $this->get_shipping_line_items() as $shipping_line_item ) {
			$total += $shipping_line_item['amount_in_cents'];
		}

		return $total;
	}

	public function get_shipping_line_items(): array {
		$line_items = [];
		if ( ! $this->order->has_shippable_products() ) {
			return $line_items;
		}

		if ( $this->order->get_details('shipping.method') === 'vendor_rates' ) {
			$rates_by_vendor = (array) $this->order->get_details( 'shipping.rates_by_vendor', [] );
			foreach ( $rates_by_vendor as $vendor_key => $vendor_rate ) {
				if ( $vendor_key === 'platform' ) {
					if ( ! ( $shipping_rate = $this->order->get_shipping_rate_for_platform() ) ) {
						continue;
					}

					$order_items = array_filter( $this->order->get_items(), function( $item ) {
						return $item->get_vendor_id() === null;
					} );

					$details = $shipping_rate->calculate_shipping( $this->order, $order_items );

					$line_items[] = [
						'vendor' => $vendor_key,
						'quantity' => 1,
						'currency' => $this->order->get_currency(),
						'amount' => $details['amount'],
						'amount_in_cents' => $details['amount_in_cents'],
						'tax_code' => $details['tax_code'],
						'tax_behavior' => $details['tax_behavior'],
						'product' => [
							'label' => _x( 'Platform shipping costs', 'cart summary', 'voxel' ),
							'description' => join( ' - ', array_filter( [
								$details['label'],
								$details['delivery_estimate_message']
							] ) ),
							'thumbnail_url' => null,
						],
					];
				} else {
					if ( ! ( $vendor = \Voxel\User::get( str_replace( 'vendor_', '', $vendor_key ) ) ) ) {
						continue;
					}

					if ( ! ( $shipping_rate = $this->order->get_shipping_rate_for_vendor( $vendor->get_id() ) ) ) {
						continue;
					}

					$order_items = array_filter( $this->order->get_items(), function( $item ) use ( $vendor ) {
						return $item->get_vendor_id() === $vendor->get_id();
					} );

					$details = $shipping_rate->calculate_shipping( $this->order, $order_items );

					$line_items[] = [
						'vendor' => $vendor_key,
						'quantity' => 1,
						'currency' => $this->order->get_currency(),
						'amount' => $details['amount'],
						'amount_in_cents' => $details['amount_in_cents'],
						'tax_code' => $details['tax_code'],
						'tax_behavior' => $details['tax_behavior'],
						'product' => [
							'label' => \Voxel\replace_vars(
								_x( 'Shipping costs for vendor @vendor_name', 'cart summary', 'voxel' ),
								[ '@vendor_name' => $vendor->get_display_name() ]
							),
							'description' => join( ' - ', array_filter( [
								$details['label'],
								$details['delivery_estimate_message']
							] ) ),
							'thumbnail_url' => null,
						],
					];
				}
			}
		} else {
			$shipping_rate = $this->order->get_shipping_rate();
			$details = $shipping_rate->calculate_shipping( $this->order, $this->order->get_items() );

			$line_items[] = [
				'vendor' => 'platform',
				'quantity' => 1,
				'currency' => $this->order->get_currency(),
				'amount' => $details['amount'],
				'amount_in_cents' => $details['amount_in_cents'],
				'tax_code' => $details['tax_code'],
				'tax_behavior' => $details['tax_behavior'],
				'product' => [
					'label' => _x( 'Shipping', 'cart summary', 'voxel' ),
					'description' => join( ' - ', array_filter( [
						$details['label'],
						$details['delivery_estimate_message']
					] ) ),
					'thumbnail_url' => null,
				],
			];
		}

		return $line_items;
	}

	public function get_admin_actions(): array {
		$actions = [];

		if ( in_array( $this->get_type(), [ 'stripe_payment', 'stripe_subscription' ], true ) ) {
			$actions[] = [
				'action' => 'admin.sync_with_stripe',
				'label' => _x( 'Sync with Stripe', 'order actions', 'voxel' ),
				'handler' => function() {
					$this->sync();
					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		if ( in_array( $this->get_type(), [ 'paddle_payment', 'paddle_subscription' ], true ) ) {
			$actions[] = [
				'action' => 'admin.sync_with_paddle',
				'label' => _x( 'Sync with Paddle', 'order actions', 'voxel' ),
				'handler' => function() {
					$this->sync();
					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		if ( in_array( $this->get_type(), [ 'paypal_payment', 'paypal_subscription' ], true ) ) {
			$actions[] = [
				'action' => 'admin.sync_with_paypal',
				'label' => _x( 'Sync with PayPal', 'order actions', 'voxel' ),
				'handler' => function() {
					$this->sync();
					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		$actions[] = [
			'action' => 'admin.view_in_backend',
			'label' => _x( 'Open order in backend', 'order actions', 'voxel' ),
			'handler' => function() {
				return wp_send_json( [
					'success' => true,
					'redirect_to' => $this->order->get_backend_link(),
				] );
			},
		];

		return $actions;
	}

	public function is_subscription(): bool {
		return false;
	}

	final public function get_initial_subscription_billing_cycle(): ?array {
		if ( ! $this->is_subscription() ) {
			return null;
		}

		foreach ( $this->order->get_items() as $order_item ) {
			$frequency = $order_item->get_details('subscription.frequency');
			$unit = $order_item->get_details('subscription.unit');
			if ( $frequency && $unit ) {
				return [
					'frequency' => $frequency,
					'unit' => $unit,
				];
			}
		}

		return null;
	}

	public function is_subscription_active(): bool {
		return in_array( $this->order->get_status(), [
			'sub_active',
			'sub_trialing',
		], true );
	}

	public function is_subscription_recoverable(): bool {
		return false;
	}

	public function is_subscription_canceled(): bool {
		return ! ( $this->is_subscription_active() || $this->is_subscription_recoverable() );
	}

	public function get_billing_interval(): ?array {
		return null;
	}

	public function get_current_billing_period(): ?array {
		return null;
	}

	public function supports_subscription_price_update(): bool {
		return false;
	}

	public function update_subscription_price( Cart_Item $cart_item ) {
		throw new \Exception( _x( 'Subscription update failed. Please try later.', 'order actions', 'voxel' ) );
	}

	public function preview_subscription_price_update( Cart_Item $cart_item ) {
		throw new \Exception( _x( 'Subscription update failed. Please try later.', 'order actions', 'voxel' ) );
	}

	public function cancel_subscription_immediately() {
		throw new \Exception( _x( 'Subscription update failed. Please try later.', 'order actions', 'voxel' ) );
	}

	public function get_capture_method(): string {
		return 'automatic';
	}
}
