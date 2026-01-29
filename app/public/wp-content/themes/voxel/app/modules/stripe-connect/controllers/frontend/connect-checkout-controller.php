<?php

namespace Voxel\Modules\Stripe_Connect\Controllers\Frontend;

use Voxel\Modules\Stripe_Connect as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Connect_Checkout_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->filter(
			'voxel/stripe_payments/process_payment/args',
			'@stripe_payment_destination_charges',
			100,
			3
		);

		$this->filter(
			'voxel/stripe_payments/process_payment/args',
			'@stripe_payment_separate_charges_and_transfers',
			100,
			3
		);

		$this->filter(
			'voxel/stripe_subscriptions/process_payment/args',
			'@stripe_subscription_destination_charges',
			100,
			3
		);

		$this->on( 'voxel/product-types/orders/order:updated', '@refresh_stats_cache' );
	}

	protected function stripe_payment_destination_charges(
		array $args,
		$payment_method,
		$order
	): array {
		$charge_type = \Voxel\get('payments.stripe.stripe_connect.charge_type');
		if ( $charge_type !== 'destination_charges' ) {
			return $args;
		}

		$vendor = $order->get_vendor();
		if ( ! ( $vendor && $vendor->is_active_vendor() ) ) {
			return $args;
		}

		/**
		 * Shipping fees:
		 * - Vendor rates: Shipping is handled by the vendor, apply vendor fees on shipping costs
		 * - Platform rates: Shipping is handled by the platform, add full shipping costs as vendor fees
		 */
		if ( $order->has_shippable_products() ) {
			if ( $order->get_details('shipping.method') === 'vendor_rates' ) {
				$shipping_rate = $order->get_shipping_rate_for_vendor( $vendor->get_id() );
				$shipping_costs = $shipping_rate->calculate_shipping( $order, $order->get_items() );

				$application_fee_amount = Module\get_vendor_fee_amount_in_cents(
					$vendor,
					$order->get_subtotal() + $shipping_costs['amount'],
					$order->get_currency()
				);
			} else {
				$shipping_rate = $order->get_shipping_rate();
				$shipping_costs = $shipping_rate->calculate_shipping( $order, $order->get_items() );

				$application_fee_amount = Module\get_vendor_fee_amount_in_cents(
					$vendor,
					$order->get_subtotal(),
					$order->get_currency()
				) + $shipping_costs['amount_in_cents'];

				$order->set_details( 'multivendor.shipping_fee_in_cents', $shipping_costs['amount_in_cents'] );
			}
		} else {
			$application_fee_amount = Module\get_vendor_fee_amount_in_cents(
				$vendor,
				$order->get_subtotal(),
				$order->get_currency()
			);
		}

		$args['allow_promotion_codes'] = false;
		$args['payment_intent_data']['application_fee_amount'] = $application_fee_amount;
		$args['payment_intent_data']['transfer_data'] = [
			'destination' => $vendor->get_stripe_vendor_id(),
		];

		/**
		 * In most scenarios, destination charges are only supported if both the platform
		 * and the connected account are in the same region (for example, both in the US).
		 *
		 * For cross-region support, we can specify the settlement merchant as the connected
		 * account using the `on_behalf_of` attribute on the charge.
		 *
		 * @link https://docs.stripe.com/connect/charges#destination
		 */
		if ( \Voxel\get('payments.stripe.stripe_connect.settlement_merchant') === 'vendor' ) {
			$args['payment_intent_data']['on_behalf_of'] = $vendor->get_stripe_vendor_id();

			if ( $payment_method->get_tax_collection_method() === 'stripe_tax' ) {
				$args['automatic_tax'] = [
					'enabled' => true,
					'liability' => [
						'type' => 'self',
					],
				];
			}
		}

		$order->set_details( 'multivendor.mode', 'destination_charges' );
		$order->set_details( 'multivendor.vendor_fees', $vendor->get_vendor_fees() );

		return $args;
	}

	protected function stripe_payment_separate_charges_and_transfers(
		array $args,
		$payment_method,
		$order
	): array {
		$charge_type = \Voxel\get('payments.stripe.stripe_connect.charge_type');
		if ( $charge_type !== 'separate_charges_and_transfers' ) {
			return $args;
		}

		/**
		 * Group order items by vendor
		 */
		$items_by_vendor = [];
		foreach ( $order->get_items() as $item ) {
			$vendor = $item->get_vendor();
			if ( ! ( $vendor && $vendor->is_active_vendor() ) ) {
				continue;
			}

			if ( ! isset( $items_by_vendor[ $vendor->get_id() ] ) ) {
				$items_by_vendor[ $vendor->get_id() ] = [
					'vendor' => $vendor,
					'items' => [],
					'subtotal' => 0,
				];
			}

			$items_by_vendor[ $vendor->get_id() ]['items'][] = $item;

			if ( $item->get_subtotal() !== null ) {
				$items_by_vendor[ $vendor->get_id() ]['subtotal'] += $item->get_subtotal();
			}
		}

		if ( empty( $items_by_vendor ) ) {
			return $args;
		}

		$transfer_data = [];
		foreach ( $items_by_vendor as $item_group ) {
			$vendor = $item_group['vendor'];
			$order_items = $item_group['items'];
			$subtotal = $item_group['subtotal'];
			$subtotal_in_cents = $subtotal;
			$shipping_in_cents = null;
			if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $order->get_currency() ) ) {
				$subtotal_in_cents *= 100;
			}

			if ( $order->has_shippable_products_from_vendor( $vendor->get_id() ) ) {
				if ( $order->get_details('shipping.method') === 'vendor_rates' ) {
					// shipping is handled by the vendor, apply vendor fees on shipping costs
					$shipping_rate = $order->get_shipping_rate_for_vendor( $vendor->get_id() );
					$shipping_costs = $shipping_rate->calculate_shipping( $order, $item_group['items'] );

					$fee_in_cents = Module\get_vendor_fee_amount_in_cents(
						$vendor,
						$subtotal + $shipping_costs['amount'],
						$order->get_currency()
					);

					$total_in_cents = $subtotal_in_cents + $shipping_costs['amount_in_cents'];
					$shipping_in_cents = $shipping_costs['amount_in_cents'];
				} else {
					// shipping is handled by the platform
					$fee_in_cents = Module\get_vendor_fee_amount_in_cents(
						$vendor,
						$subtotal,
						$order->get_currency()
					);

					$total_in_cents = $subtotal_in_cents;
				}
			} else {
				$fee_in_cents = Module\get_vendor_fee_amount_in_cents(
					$vendor,
					$subtotal,
					$order->get_currency()
				);

				$total_in_cents = $subtotal_in_cents;
			}

			$transfer_data[ $vendor->get_id() ] = [
				'vendor_id' => $vendor->get_id(),
				'vendor_fees' => $vendor->get_vendor_fees(),
				'subtotal_in_cents' => round( $subtotal_in_cents ),
				'total_in_cents' => round( $total_in_cents ),
				'fee_in_cents' => round( $fee_in_cents ),
				'shipping_in_cents' => $shipping_in_cents,
			];
		}

		$args['allow_promotion_codes'] = false;

		$args['payment_intent_data']['transfer_group'] = sprintf( 'ORDER_%d', $order->get_id() );
		$order->set_details( 'multivendor.mode', 'separate_charges_and_transfers' );
		$order->set_details( 'multivendor.transfer_data', $transfer_data );

		return $args;
	}

	protected function stripe_subscription_destination_charges(
		array $args,
		$payment_method,
		$order
	): array {
		$vendor = $order->get_vendor();
		if ( ! ( $vendor && $vendor->is_active_vendor() ) ) {
			return $args;
		}

		$charge_type = \Voxel\get('payments.stripe.stripe_connect.subscriptions.charge_type');
		if ( $charge_type !== 'destination_charges' ) {
			return $args;
		}

		$tax_collection_method = null;
		if ( \Voxel\get( 'payments.stripe.tax_collection.enabled' ) ) {
			$tax_collection_method = \Voxel\get( 'payments.stripe.tax_collection.collection_method', 'stripe_tax' );
		}

		$args['allow_promotion_codes'] = false;
		$args['subscription_data']['application_fee_percent'] = Module\get_vendor_fee_percent( $order );
		$args['subscription_data']['transfer_data'] = [
			'destination' => $vendor->get_stripe_vendor_id(),
		];

		$settlement_merchant = \Voxel\get('payments.stripe.stripe_connect.subscriptions.settlement_merchant');
		if ( $settlement_merchant === 'vendor' ) {
			$args['subscription_data']['on_behalf_of'] = $vendor->get_stripe_vendor_id();

			if ( $tax_collection_method === 'stripe_tax' ) {
				$args['automatic_tax'] = [
					'enabled' => true,
					'liability' => [
						'type' => 'self',
					],
				];

				$args['subscription_data']['invoice_settings'] = [
					'issuer' => [
						'type' => 'self',
					],
				];
			}
		}

		$order->set_details( 'multivendor.mode', 'destination_charges' );
		$order->set_details( 'multivendor.vendor_fees', $vendor->get_vendor_fees() );

		return $args;
	}

	protected function refresh_stats_cache( $order ) {
		// refresh vendor stats cache
		if ( $order->get_previous_status() !== $order->get_status() ) {
			$vendors = [];
			if ( $vendor = $order->get_vendor() ) {
				$vendors[ $vendor->get_id() ] = $vendor;
			}

			foreach ( $order->get_items() as $order_item ) {
				if ( $vendor = $order_item->get_vendor() ) {
					$vendors[ $vendor->get_id() ] = $vendor;
				}
			}

			foreach ( $vendors as $vendor ) {
				Module\Vendor_Stats::purge_cache( $vendor );
			}
		}
	}
}
