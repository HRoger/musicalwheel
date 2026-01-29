<?php

namespace Voxel\Modules\Stripe_Connect\Controllers\Frontend;

use Voxel\Modules\Stripe_Connect as Module;
use Voxel\Utils\Config_Schema\Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Connect_Transfer_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel/product-types/orders/order:updated', '@process_separate_charges_and_transfers' );
	}

	protected function process_separate_charges_and_transfers( \Voxel\Order $order ) {
		global $wpdb;

		if ( $order->get_status() !== \Voxel\ORDER_COMPLETED ) {
			return;
		}

		$payment_method = $order->get_payment_method();
		if ( ! ( $payment_method !== null && $payment_method->get_type() === 'stripe_payment' ) ) {
			return;
		}

		if ( $order->get_details('payment_intent.status') !== 'succeeded' ) {
			return;
		}

		if ( ! $order->get_details('payment_intent.latest_charge') ) {
			return;
		}

		if ( $order->get_details('multivendor.mode') !== 'separate_charges_and_transfers' ) {
			return;
		}

		if ( $order->get_details('multivendor.processed_transfers') ) {
			return;
		}

		$order->set_details( 'multivendor.processed_transfers', true );
		$order->save();

		$items_by_vendor = [];
		$generate_sub_orders = false;
		foreach ( $order->get_items() as $order_item ) {
			$vendor = $order_item->get_vendor();

			if ( $vendor !== null ) {
				if ( ! isset( $items_by_vendor[ $vendor->get_id() ] ) ) {
					$items_by_vendor[ $vendor->get_id() ] = [
						'vendor_type' => 'user',
						'vendor' => $vendor,
						'items' => [],
					];
				}

				$items_by_vendor[ $vendor->get_id() ]['items'][] = $order_item;
				$generate_sub_orders = true;
			} else {
				if ( ! isset( $items_by_vendor['platform'] ) ) {
					$items_by_vendor['platform'] = [
						'vendor_type' => 'platform',
						'items' => [],
					];
				}

				$items_by_vendor['platform']['items'][] = $order_item;
			}
		}

		if ( ! $generate_sub_orders ) {
			return;
		}

		foreach ( $items_by_vendor as $item_group ) {
			if ( $item_group['vendor_type'] === 'user' ) {
				$sub_order_subtotal = 0;
				foreach ( $item_group['items'] as $order_item ) {
					$sub_order_subtotal += $order_item->get_subtotal();
				}

				$vendor = $item_group['vendor'];
				$result = $wpdb->insert( $wpdb->prefix.'vx_orders', [
					'customer_id' => $order->get_customer_id(),
					'vendor_id' => $vendor->get_id(),
					'status' => 'pending_payment',
					'payment_method' => 'stripe_transfer',
					'transaction_id' => null,
					'details' => wp_json_encode( Schema::optimize_for_storage( [
						'pricing' => [
							'currency' => $order->get_currency(),
							'subtotal' => $sub_order_subtotal,
							'total' => $sub_order_subtotal,
						],
					] ) ),
					'parent_id' => $order->get_id(),
					'testmode' => $order->is_test_mode() ? 1 : 0,
					'created_at' => \Voxel\utc()->format( 'Y-m-d H:i:s' ),
				] );

				if ( $result === false ) {
					// throw new \Exception( _x( 'Could not create order.', 'checkout', 'voxel' ) );
					continue;
				}

				$sub_order_id = (int) $wpdb->insert_id;

				foreach ( $item_group['items'] as $order_item ) {
					$order_item->set_order_id( $sub_order_id );
					$order_item->save();
				}
			} elseif ( $item_group['vendor_type'] === 'platform' ) {
				$sub_order_subtotal = 0;
				foreach ( $item_group['items'] as $order_item ) {
					$sub_order_subtotal += $order_item->get_subtotal();
				}

				$sub_order_total = $sub_order_subtotal;
				$sub_order_shipping = null;
				if ( is_numeric( $order->get_details('shipping.amounts_by_vendor.platform') ) ) {
					$sub_order_shipping = (int) $order->get_details('shipping.amounts_by_vendor.platform');
					if ( $sub_order_shipping > 0 && ! \Voxel\is_zero_decimal_currency( $order->get_currency() ) ) {
						$sub_order_shipping /= 100;
					}

					$sub_order_total += $sub_order_shipping;
				}

				$result = $wpdb->insert( $wpdb->prefix.'vx_orders', [
					'customer_id' => $order->get_customer_id(),
					'vendor_id' => null,
					'status' => \Voxel\ORDER_COMPLETED,
					'payment_method' => 'stripe_transfer_platform',
					'transaction_id' => null,
					'details' => wp_json_encode( Schema::optimize_for_storage( [
						'pricing' => [
							'currency' => $order->get_currency(),
							'subtotal' => $sub_order_subtotal,
							'shipping' => $sub_order_shipping,
							'total' => $sub_order_total,
						],
					] ) ),
					'parent_id' => $order->get_id(),
					'testmode' => $order->is_test_mode() ? 1 : 0,
					'created_at' => \Voxel\utc()->format( 'Y-m-d H:i:s' ),
				] );

				if ( $result === false ) {
					continue;
				}

				$sub_order_id = (int) $wpdb->insert_id;

				foreach ( $item_group['items'] as $order_item ) {
					$order_item->set_order_id( $sub_order_id );
					$order_item->save();
				}
			}
		}

		$transfer_data = $order->get_details('multivendor.transfer_data');
		if ( ! is_array( $transfer_data ) || empty( $transfer_data ) ) {
			return;
		}

		$stripe = \Voxel\Modules\Stripe_Payments\Stripe_Client::getClient();

		$schema = Schema::Keyed_Object_List( [
			'vendor_id' => Schema::Int()->min(0),
			'subtotal_in_cents' => Schema::Int()->min(0),
			'total_in_cents' => Schema::Int()->min(0)->default(0),
			'fee_in_cents' => Schema::Int()->min(0),
			'shipping_in_cents' => Schema::Int()->min(0),
		] )->default([]);

		$schema->set_value( $transfer_data );
		$transfer_data = $schema->export();

		$payment_intent = $stripe->paymentIntents->retrieve( $order->get_details('payment_intent.id') );
		$latest_charge = $stripe->charges->retrieve( $order->get_details('payment_intent.latest_charge'), [
			'expand' => [ 'balance_transaction' ],
		] );

		if ( ! $latest_charge->balance_transaction ) {
			return;
		}

		foreach ( $transfer_data as $vendor_id => $vendor_data ) {
			if (
				$vendor_data['vendor_id'] === null
				|| $vendor_data['total_in_cents'] === null
				|| $vendor_data['fee_in_cents'] === null
			) {
				continue;
			}

			$vendor = \Voxel\User::get( $vendor_data['vendor_id'] );
			if ( $vendor === null || ! $vendor->is_active_vendor() ) {
				continue;
			}

			if ( $vendor_data['total_in_cents'] <= $vendor_data['fee_in_cents'] ) {
				continue;
			}

			$sub_order = \Voxel\Product_Types\Orders\Order::find( [
				'vendor_id' => $vendor->get_id(),
				'parent_id' => $order->get_id(),
			] );

			if ( ! $sub_order ) {
				continue;
			}

			if ( $sub_order->get_details('transfer.id') || $sub_order->get_status() === \Voxel\ORDER_COMPLETED ) {
				continue;
			}

			try {
				/**
				 * Balance transaction currency and transfer currency must match. If they're different,
				 * transfer amount and currency must be converted to the balance currency using the
				 * balance transaction's exchange rate property.
				 *
				 * @link https://docs.stripe.com/api/balance_transactions/object
				 */
				$currency = $latest_charge->balance_transaction->currency;
				$amount_to_transfer = $vendor_data['total_in_cents'] - $vendor_data['fee_in_cents'];
				if ( $payment_intent->currency !== $latest_charge->balance_transaction->currency ) {
					$amount_to_transfer *= $latest_charge->balance_transaction->exchange_rate;
				}

				$amount_to_transfer = (int) round( $amount_to_transfer );

				$transfer = $stripe->transfers->create( [
					'amount' => $amount_to_transfer,
					'currency' => $currency,
					'destination' => $vendor->get_stripe_vendor_id(),
					'transfer_group' => sprintf( 'ORDER_%d', $order->get_id() ),
					'source_transaction' => $order->get_details('payment_intent.latest_charge'),
				], [
					'idempotency_key' => sprintf( 'TRANSFER_ORDER_%d_VENDOR_%d', $order->get_id(), $vendor->get_id() ),
				] );

				$sub_order->set_transaction_id( $transfer->id );
				$sub_order->set_status( \Voxel\ORDER_COMPLETED );
				$sub_order->set_details( 'transfer', [
					'id' => $transfer->id,
					'amount' => $transfer->amount,
					'currency' => $transfer->currency,
					'destination' => $transfer->destination,
					'amount_reversed' => $transfer->amount_reversed,
					'created' => $transfer->created,
					'destination_payment' => $transfer->destination_payment,
					'livemode' => $transfer->livemode,
					'reversed' => $transfer->reversed,
					'source_transaction' => $transfer->source_transaction,
					'source_type' => $transfer->source_type,
					'transfer_group' => $transfer->transfer_group,
				] );

				$subtotal_in_cents = $vendor_data['subtotal_in_cents'];
				if ( $subtotal_in_cents > 0 && ! \Voxel\is_zero_decimal_currency( $order->get_currency() ) ) {
					$subtotal_in_cents /= 100;
				}

				$sub_order->set_details( 'pricing.subtotal', $subtotal_in_cents );

				$total_in_cents = $vendor_data['total_in_cents'];
				if ( $total_in_cents > 0 && ! \Voxel\is_zero_decimal_currency( $order->get_currency() ) ) {
					$total_in_cents /= 100;
				}

				$sub_order->set_details( 'pricing.total', $total_in_cents );

				$shipping_in_cents = $vendor_data['shipping_in_cents'];
				if ( $shipping_in_cents > 0 && ! \Voxel\is_zero_decimal_currency( $order->get_currency() ) ) {
					$shipping_in_cents /= 100;
				}

				$sub_order->set_details( 'pricing.shipping', $shipping_in_cents );

				$sub_order->save();
			} catch ( \Exception $e ) {
				\Voxel\log( 'Stripe transfer failed: '.$e->getMessage());
			}
		}
	}

}
