<?php

namespace Voxel\Modules\Stripe_Connect\Controllers\Frontend;

use Voxel\Modules\Stripe_Connect as Module;
use Voxel\Utils\Config_Schema\Schema;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Connect_Order_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->filter( 'voxel/orders/view_order/pricing/sections', '@add_vendor_fees_section', 10, 2 );
	}

	protected function add_vendor_fees_section( $sections, \Voxel\Order $order ) {
		$vendor = $order->get_vendor();
		if ( ! $vendor ) {
			return $sections;
		}

		if ( ! ( $vendor->get_id() === get_current_user_id() || current_user_can('administrator') ) ) {
			return $sections;
		}

		$payment_method = $order->get_payment_method();
		$currency = $order->get_currency();

		if ( $payment_method === null ) {
			return $sections;
		}

		if ( $payment_method->get_type() === 'stripe_transfer' ) {
			$parent_order = $order->get_parent_order();
			if ( ! $parent_order ) {
				return $sections;
			}

			$vendor_fees = (array) $parent_order->get_details( sprintf(
				'multivendor.transfer_data.%d.vendor_fees',
				$order->get_vendor_id()
			), [] );

			$fee_in_cents = $parent_order->get_details( sprintf(
				'multivendor.transfer_data.%d.fee_in_cents',
				$order->get_vendor_id()
			) );

			if ( ! is_numeric( $fee_in_cents ) ) {
				return $sections;
			}

			$items = [];
			foreach ( (array) $vendor_fees as $fee ) {
				if ( ( $fee['type'] ?? null ) === 'fixed' ) {
					if ( ! is_numeric( $fee['fixed_amount'] ?? null ) || ( $fee['fixed_amount'] ?? 0 ) <= 0 ) {
						continue;
					}

					$items[] = [
						'label' => $fee['label'] ?? _x( 'Platform fee', 'vendor fees', 'voxel' ),
						'content' => \Voxel\currency_format( $fee['fixed_amount'], $currency, false ),
					];
				} elseif ( ( $fee['type'] ?? null ) === 'percentage' ) {
					if (
						! is_numeric( $fee['percentage_amount'] ?? null )
						|| ( $fee['percentage_amount'] ?? 0 ) <= 0
						|| ( $fee['percentage_amount'] ?? 0 ) > 100
					) {
						continue;
					}

					$items[] = [
						'label' => $fee['label'] ?? _x( 'Platform fee', 'vendor fees', 'voxel' ),
						'content' => round( $fee['percentage_amount'], 2 ).'%',
					];
				}
			}

			$items[] = [
				'label' => _x( 'Total', 'vendor fees', 'voxel' ),
				'content' => \Voxel\currency_format( $fee_in_cents, $currency ),
				'bold' => true,
			];

			$sections[] = [
				'label' => _x( 'Vendor fees', 'vendor fees', 'voxel' ),
				'type' => 'list',
				'items' => $items,
			];
		} elseif ( $payment_method->get_type() === 'stripe_payment' ) {
			if ( $order->get_details('multivendor.mode') === 'destination_charges' ) {
				$fee_in_cents = $order->get_details('payment_intent.application_fee_amount');
				if ( ! is_numeric( $fee_in_cents ) ) {
					return $sections;
				}

				$items = [];
				foreach ( (array) $order->get_details('multivendor.vendor_fees', []) as $fee ) {
					if ( ( $fee['type'] ?? null ) === 'fixed' ) {
						if ( ! is_numeric( $fee['fixed_amount'] ?? null ) || ( $fee['fixed_amount'] ?? 0 ) <= 0 ) {
							continue;
						}

						$items[] = [
							'label' => $fee['label'] ?? _x( 'Platform fee', 'vendor fees', 'voxel' ),
							'content' => \Voxel\currency_format( $fee['fixed_amount'], $currency, false ),
						];
					} elseif ( ( $fee['type'] ?? null ) === 'percentage' ) {
						if (
							! is_numeric( $fee['percentage_amount'] ?? null )
							|| ( $fee['percentage_amount'] ?? 0 ) <= 0
							|| ( $fee['percentage_amount'] ?? 0 ) > 100
						) {
							continue;
						}

						$items[] = [
							'label' => $fee['label'] ?? _x( 'Platform fee', 'vendor fees', 'voxel' ),
							'content' => round( $fee['percentage_amount'], 2 ).'%',
						];
					}
				}

				$shipping_fee_in_cents = $order->get_details( 'multivendor.shipping_fee_in_cents' );
				if ( is_numeric( $shipping_fee_in_cents ) ) {
					$items[] = [
						'label' => _x( 'Shipping fee', 'vendor fees', 'voxel' ),
						'content' => \Voxel\currency_format( $shipping_fee_in_cents, $currency ),
					];
				}

				$items[] = [
					'label' => _x( 'Total', 'vendor fees', 'voxel' ),
					'content' => \Voxel\currency_format( $fee_in_cents, $currency ),
					'bold' => true,
				];

				$sections[] = [
					'label' => _x( 'Vendor fees', 'vendor fees', 'voxel' ),
					'type' => 'list',
					'items' => $items,
				];
			}
		} elseif ( $payment_method->get_type() === 'stripe_subscription' ) {
			if ( $order->get_details('multivendor.mode') === 'destination_charges' ) {
				$application_fee_percent = $order->get_details( 'subscription.application_fee_percent' );
				$latest_invoice_total_in_cents = $order->get_details('subscription.latest_invoice.total');
				if ( ! (
					is_numeric( $application_fee_percent )
					&& is_numeric( $latest_invoice_total_in_cents )
					&& $application_fee_percent > 0
					&& $latest_invoice_total_in_cents > 0
				) ) {
					return $sections;
				}

				$items = [];
				foreach ( (array) $order->get_details('multivendor.vendor_fees', []) as $fee ) {
					if ( ( $fee['type'] ?? null ) === 'fixed' ) {
						if ( ! is_numeric( $fee['fixed_amount'] ?? null ) || ( $fee['fixed_amount'] ?? 0 ) <= 0 ) {
							continue;
						}

						$items[] = [
							'label' => $fee['label'] ?? _x( 'Platform fee', 'vendor fees', 'voxel' ),
							'content' => \Voxel\currency_format( $fee['fixed_amount'], $currency, false ),
						];
					} elseif ( ( $fee['type'] ?? null ) === 'percentage' ) {
						if (
							! is_numeric( $fee['percentage_amount'] ?? null )
							|| ( $fee['percentage_amount'] ?? 0 ) <= 0
							|| ( $fee['percentage_amount'] ?? 0 ) > 100
						) {
							continue;
						}

						$items[] = [
							'label' => $fee['label'] ?? _x( 'Platform fee', 'vendor fees', 'voxel' ),
							'content' => round( $fee['percentage_amount'], 2 ).'%',
						];
					}
				}

				$fee_in_cents = $latest_invoice_total_in_cents * ( $application_fee_percent / 100 );

				$items[] = [
					'label' => _x( 'Total', 'vendor fees', 'voxel' ),
					'content' => \Voxel\currency_format( $fee_in_cents, $currency ),
					'bold' => true,
				];

				$sections[] = [
					'label' => _x( 'Vendor fees', 'vendor fees', 'voxel' ),
					'type' => 'list',
					'items' => $items,
				];
			}
		}

		return $sections;
	}

}
