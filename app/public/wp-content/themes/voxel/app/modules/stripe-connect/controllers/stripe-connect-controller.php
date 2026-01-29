<?php

namespace Voxel\Modules\Stripe_Connect\Controllers;

use \Voxel\Modules\Stripe_Connect as Module;
use \Voxel\Modules\Stripe_Connect\Vendor_Stats as Vendor_Stats;
use \Voxel\Dynamic_Data\Tag as Tag;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Stripe_Connect_Controller extends \Voxel\Controllers\Base_Controller {

	protected function authorize() {
		return Module\is_marketplace_active();
	}

	protected function dependencies() {
		new Frontend\Connect_Frontend_Controller;
		new Frontend\Connect_Checkout_Controller;
		new Frontend\Connect_Transfer_Controller;
		new Frontend\Connect_Order_Controller;
	}

	protected function hooks() {
		$this->on( 'elementor/widgets/register', '@register_widgets', 1100 );
		$this->filter( 'voxel/product-types/payment-methods', '@register_payment_methods' );
		$this->filter( 'voxel/dynamic-data/groups/user/properties', '@register_vendor_dynamic_data', 10, 2 );
	}

	protected function register_widgets() {
		$manager = \Elementor\Plugin::instance()->widgets_manager;
		$manager->register( new Module\Widgets\Stripe_Account_Widget );
		$manager->register( new Module\Widgets\Sales_Chart_Widget );
	}

	protected function register_payment_methods( $payment_methods ) {
		$payment_methods['stripe_transfer'] = Module\Payment_Methods\Stripe_Transfer::class;
		$payment_methods['stripe_transfer_platform'] = Module\Payment_Methods\Stripe_Transfer_Platform::class;

		return $payment_methods;
	}

	protected function register_vendor_dynamic_data( $properties, $group ) {
		$properties['vendor'] = Tag::Object('Vendor stats')->properties( function() use ( $group ) {
			return [
				'earnings' => Tag::Number('Total earnings')->render( function() use ( $group ) {
					$amount = Vendor_Stats::get( $group->user )->get_total_earnings_in_cents();
					if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
						$amount = round( $amount / 100, 2 );
					}

					return $amount;
				} ),
				'fees' => Tag::Number('Total platform fees')->render( function() use ( $group ) {
					$amount = Vendor_Stats::get( $group->user )->get_total_fees_in_cents();
					if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
						$amount = round( $amount / 100, 2 );
					}

					return $amount;
				} ),
				'customers' => Tag::Number('Customer count')->render( function() use ( $group ) {
					return Vendor_Stats::get( $group->user )->get_total_customer_count();
				} ),
				'orders' => Tag::Object('Order count')->properties( function() use ( $group ) {
					return [
						'completed' => Tag::Number('Completed')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_total_order_count( \Voxel\ORDER_COMPLETED );
						} ),
						'pending_approval' => Tag::Number('Pending approval')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_total_order_count( \Voxel\ORDER_PENDING_APPROVAL );
						} ),
						'canceled' => Tag::Number('Canceled')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_total_order_count( \Voxel\ORDER_CANCELED );
						} ),
						'refunded' => Tag::Number('Refunded')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_total_order_count( \Voxel\ORDER_REFUNDED );
						} ),
					];
				} ),
				'this-year' => Tag::Object('This year')->properties( function() use ( $group ) {
					return [
						'earnings' => Tag::Number('Earnings')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_this_year_stats()['earnings_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
						'orders' => Tag::Number('Completed orders')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_this_year_stats()['orders'];
						} ),
						'fees' => Tag::Number('Platform fees')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_this_year_stats()['fees_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
					];
				} ),
				'this-month' => Tag::Object('This month')->properties( function() use ( $group ) {
					return [
						'earnings' => Tag::Number('Earnings')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_this_month_stats()['earnings_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
						'orders' => Tag::Number('Completed orders')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_this_month_stats()['orders'];
						} ),
						'fees' => Tag::Number('Platform fees')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_this_month_stats()['fees_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
					];
				} ),
				'this-week' => Tag::Object('This week')->properties( function() use ( $group ) {
					return [
						'earnings' => Tag::Number('Earnings')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_this_week_stats()['earnings_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
						'orders' => Tag::Number('Completed orders')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_this_week_stats()['orders'];
						} ),
						'fees' => Tag::Number('Platform fees')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_this_week_stats()['fees_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
					];
				} ),
				'today' => Tag::Object('Today')->properties( function() use ( $group ) {
					return [
						'earnings' => Tag::Number('Earnings')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_today_stats()['earnings_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
						'orders' => Tag::Number('Completed orders')->render( function() use ( $group ) {
							return Vendor_Stats::get( $group->user )->get_today_stats()['orders'];
						} ),
						'fees' => Tag::Number('Platform fees')->render( function() use ( $group ) {
							$amount = Vendor_Stats::get( $group->user )->get_today_stats()['fees_in_cents'];
							if ( ! \Voxel\Utils\Currency_List::is_zero_decimal( \Voxel\get_primary_currency() ) ) {
								$amount = round( $amount / 100, 2 );
							}

							return $amount;
						} ),
					];
				} ),
			];
		} );

		return $properties;
	}

}
