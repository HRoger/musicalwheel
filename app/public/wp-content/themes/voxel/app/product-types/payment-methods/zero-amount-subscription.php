<?php

namespace Voxel\Product_Types\Payment_Methods;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Zero_Amount_Subscription extends Base_Payment_Method {

	public function get_type(): string {
		return 'zero_amount_subscription';
	}

	public function get_label(): string {
		return _x( 'None', 'payment methods', 'voxel' );
	}

	public function process_payment() {
		try {
			$order_amount = $this->order->get_details( 'pricing.subtotal' );
			if ( floatval( $order_amount ) !== 0.0 ) {
				throw new \Exception( 'Total order amount must be 0' );
			}

			if ( $this->order->get_details('source.capture_method') === 'manual' ) {
				$this->order->set_status( \Voxel\ORDER_PENDING_APPROVAL );
			} else {
				$this->order->set_status( 'sub_active' );
			}

			$this->order->set_details( 'pricing.total', $order_amount );
			$this->order->set_transaction_id( sprintf( 'zero_%d', $this->order->get_id() ) );
			$this->order->save();

			return [
				'success' => true,
				'redirect_url' => $this->order->get_success_redirect(),
			];
		} catch ( \Exception $e ) {
			return [
				'success' => false,
				'message' => _x( 'Something went wrong', 'checkout', 'voxel' ),
				'debug' => [
					'type' => 'zero_amount_payment_error',
					'code' => $e->getCode(),
					'message' => $e->getMessage(),
				],
			];
		}
	}

	public function is_subscription(): bool {
		return true;
	}

	public function is_subscription_recoverable(): bool {
		return $this->order->get_status() === 'sub_active';
	}

	public function supports_subscription_price_update(): bool {
		return false;
	}

	public function get_billing_interval(): ?array {
		$frequency = $this->order->get_details( 'source.billing_cycle.frequency' );
		$unit = $this->order->get_details( 'source.billing_cycle.unit' );

		if ( $frequency && $unit ) {
			return [
				'type' => 'recurring',
				'interval' => $unit,
				'interval_count' => $frequency,
			];
		}

		return null;
	}

	public function cancel_subscription_immediately() {
		$this->order->set_status( \Voxel\ORDER_CANCELED );
		$this->order->save();
	}

	public function get_vendor_actions(): array {
		$actions = [];
		if ( $this->order->get_status() === \Voxel\ORDER_PENDING_APPROVAL ) {
			$actions[] = [
				'action' => 'vendor.approve',
				'label' => _x( 'Approve', 'order actions', 'voxel' ),
				'type' => 'primary',
				'handler' => function() {
					$this->order->set_status( 'sub_active' );
					$this->order->save();

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
					$this->cancel_subscription_immediately();

					( new \Voxel\Events\Products\Orders\Vendor_Declined_Order_Event )->dispatch( $this->order->get_id() );

					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		if ( $this->order->get_status() === 'sub_active' ) {
			$actions[] = [
				'action' => 'vendor.cancel_subscription',
				'label' => _x( 'Cancel order', 'order actions', 'voxel' ),
				'confirm' => _x(
					'Order will be canceled immediately. Do you want to proceed?',
					'order vendor actions',
					'voxel'
				),
				'handler' => function() {
					$this->cancel_subscription_immediately();

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
		if ( in_array( $this->order->get_status(), [ 'pending_approval', 'sub_active' ], true ) ) {
			$actions[] = [
				'action' => 'customer.cancel',
				'label' => _x( 'Cancel order', 'order customer actions', 'voxel' ),
				'confirm' => _x(
					'Order will be canceled immediately. Do you want to proceed?',
					'order customer actions',
					'voxel'
				),
				'handler' => function() {
					$this->cancel_subscription_immediately();

					( new \Voxel\Events\Products\Orders\Customer_Canceled_Order_Event )->dispatch( $this->order->get_id() );

					return wp_send_json( [
						'success' => true,
					] );
				},
			];
		}

		return $actions;
	}
}
