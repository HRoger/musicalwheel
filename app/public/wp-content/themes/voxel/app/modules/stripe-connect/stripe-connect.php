<?php

namespace Voxel\Modules\Stripe_Connect;

if ( ! defined('ABSPATH') ) {
	exit;
}

new Controllers\Stripe_Connect_Controller;

function is_marketplace_active(): bool {
	return (
		\Voxel\get('payments.provider') === 'stripe'
		&& \Voxel\get('payments.stripe.stripe_connect.enabled')
	);
}

function get_vendor_fee_amount_in_cents(
	\Voxel\User $vendor,
	int $subtotal_in_main_unit,
	string $currency
): int {
	$subtotal_in_cents = $subtotal_in_main_unit;
	if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $currency ) ) {
		$subtotal_in_cents *= 100;
	}

	$application_fee_amount = 0;
	foreach ( $vendor->get_vendor_fees() as $fee ) {
		if ( $fee['type'] === 'fixed' ) {
			$fee_amount_in_cents = $fee['fixed_amount'];
			if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $currency ) ) {
				$fee_amount_in_cents *= 100;
			}

			$application_fee_amount += $fee_amount_in_cents;
		} elseif ( $fee['type'] === 'percentage' ) {
			$pct = $fee['percentage_amount'];
			$application_fee_amount += ( $subtotal_in_cents * ( $pct / 100 ) );
		}
	}

	return (int) round( $application_fee_amount );
}

function get_vendor_fee_percent( \Voxel\Order $order ) {
	$vendor = $order->get_vendor();
	$currency = $order->get_currency();
	$subtotal_in_cents = $order->get_subtotal();
	if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $currency ) ) {
		$subtotal_in_cents *= 100;
	}

	$application_fee_amount = 0;
	foreach ( $vendor->get_vendor_fees() as $fee ) {
		if ( $fee['type'] === 'fixed' ) {
			$fee_amount_in_cents = $fee['fixed_amount'];
			if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( $currency ) ) {
				$fee_amount_in_cents *= 100;
			}

			$application_fee_amount += $fee_amount_in_cents;
		} elseif ( $fee['type'] === 'percentage' ) {
			$pct = $fee['percentage_amount'];
			$application_fee_amount += ( $subtotal_in_cents * ( $pct / 100 ) );
		}
	}

	if ( $subtotal_in_cents <= 0 || $subtotal_in_cents < $application_fee_amount ) {
		return 0;
	}

	$percentage = abs( ( $application_fee_amount / $subtotal_in_cents ) * 100 );

	return round( $percentage, 2 );
}
