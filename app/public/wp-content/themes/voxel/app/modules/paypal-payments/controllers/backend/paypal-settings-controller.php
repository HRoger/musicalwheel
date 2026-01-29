<?php

namespace Voxel\Modules\PayPal_Payments\Controllers\Backend;

use \Voxel\Modules\PayPal_Payments as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Settings_Controller extends \Voxel\Controllers\Base_Controller {

	protected function authorize() {
		return current_user_can( 'manage_options' );
	}

	protected function hooks() {
		$this->on( 'voxel_ajax_paypal.admin.setup_webhook', '@setup_webhook' );

		$this->on( 'voxel/backend/view_order/details/after', '@order_details' );
		$this->on( 'voxel/backend/view_order/customer_details/after', '@order_customer_details', 10, 2 );

		$this->on( 'voxel/backend/paid_members_table/price/after', '@paid_members_table_price_after', 10, 2 );
	}

	protected function setup_webhook() {
		try {
			if ( ( $_SERVER['REQUEST_METHOD'] ?? null ) !== 'POST' ) {
				throw new \Exception( __( 'Invalid request.', 'voxel' ) );
			}

			$mode = $_POST['mode'] ?? null;
			if ( ! in_array( $mode, [ 'live', 'sandbox' ], true ) ) {
				throw new \Exception( 'Invalid request' );
			}

			$client_id = $_REQUEST['client_id'] ?? null;
			$client_secret = $_REQUEST['client_secret'] ?? null;
			if ( empty( $client_id ) || ! is_string( $client_id ) || empty( $client_secret ) || ! is_string( $client_secret ) ) {
				throw new \Exception( 'Missing client credentials' );
			}

			// Create webhook using PayPal API
			$webhook_url = home_url( '/?vx=1&action=paypal.webhooks' );

			$webhook_data = [
				'url' => $webhook_url,
				'event_types' => array_map( function( $event ) {
					return [ 'name' => $event ];
				}, Module\PayPal_Client::get_webhook_events() ),
			];

			// Temporarily set credentials to create webhook
			$original_mode = \Voxel\get( 'payments.paypal.mode' );
			$original_client_id = \Voxel\get( sprintf( 'payments.paypal.%s.client_id', $mode ) );
			$original_client_secret = \Voxel\get( sprintf( 'payments.paypal.%s.client_secret', $mode ) );

			\Voxel\set( 'payments.paypal.mode', $mode );
			\Voxel\set( sprintf( 'payments.paypal.%s.client_id', $mode ), $client_id );
			\Voxel\set( sprintf( 'payments.paypal.%s.client_secret', $mode ), $client_secret );

			try {
				// Clear token cache to force new authentication
				delete_transient( sprintf( 'voxel_paypal_token_%s', $mode ) );

				// Ensure webhook URL is HTTPS
				$webhook_url = set_url_scheme( $webhook_url, 'https' );
				$webhook_data['url'] = $webhook_url;

				$webhook = Module\PayPal_Client::make_request( 'POST', '/v1/notifications/webhooks', $webhook_data );

				if ( empty( $webhook['id'] ) ) {
					throw new \Exception( 'Failed to create webhook: No webhook ID returned' );
				}

				\Voxel\set( sprintf( 'payments.paypal.%s.webhook', $mode ), [
					'id' => $webhook['id'],
				] );

				return wp_send_json( [
					'success' => true,
					'message' => __( 'Webhook created successfully.', 'voxel-backend' ),
					'id' => $webhook['id'],
				] );
			} catch ( \Exception $webhook_exception ) {
				// Log detailed error for debugging
				\Voxel\log( sprintf(
					'PayPal webhook creation failed: %s | URL: %s | Events: %s',
					$webhook_exception->getMessage(),
					$webhook_url,
					json_encode( $webhook_data['event_types'] )
				) );
				throw $webhook_exception;
			} finally {
				// Restore original settings
				if ( $original_mode !== false ) {
					\Voxel\set( 'payments.paypal.mode', $original_mode );
				}
				if ( $original_client_id !== false ) {
					\Voxel\set( sprintf( 'payments.paypal.%s.client_id', $mode ), $original_client_id );
				}
				if ( $original_client_secret !== false ) {
					\Voxel\set( sprintf( 'payments.paypal.%s.client_secret', $mode ), $original_client_secret );
				}
				// Clear token cache again after restore
				delete_transient( sprintf( 'voxel_paypal_token_%s', $mode ) );
			}
		} catch ( \Exception $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
			] );
		}
	}

	protected function order_details( \Voxel\Order $order ) {
		$payment_method = $order->get_payment_method();
		if ( ! $payment_method ) {
			return;
		}

		$paypal_dashboard_url = $order->is_test_mode()
			? 'https://www.sandbox.paypal.com/'
			: 'https://www.paypal.com/';

		if ( $payment_method->get_type() === 'paypal_payment' ): ?>
			<?php if ( $capture_id = $order->get_details( 'checkout.capture_id' ) ): ?>
				<tr>
					<th>Payment ID</th>
					<td>
						<?= sprintf(
							'<a href="%s" target="_blank">%s %s</a>',
							$paypal_dashboard_url . 'unifiedtransactions/details/payment/' . $capture_id,
							$capture_id,
							'<i class="las la-external-link-alt"></i>'
						) ?>
					</td>
				</tr>
			<?php elseif ( $authorization_id = $order->get_details( 'checkout.authorization_id' ) ): ?>
				<tr>
					<th>Authorization ID</th>
					<td>
						<?= sprintf(
							'<a href="%s" target="_blank">%s %s</a>',
							$paypal_dashboard_url . 'unifiedtransactions/details/payment/' . $authorization_id,
							$authorization_id,
							'<i class="las la-external-link-alt"></i>'
						) ?>
					</td>
				</tr>
			<?php endif ?>
			<?php if ( $transaction_id = $order->get_transaction_id() ): ?>
				<tr>
					<th>PayPal Order ID</th>
					<td><?= esc_html( $transaction_id ) ?></td>
				</tr>
			<?php endif ?>
		<?php elseif ( $payment_method->get_type() === 'paypal_subscription' ): ?>
			<?php if ( $billing_interval = $order->get_billing_interval() ): ?>
				<tr>
					<th>Billing interval</th>
					<td>
						<?= ucwords( \Voxel\interval_format(
							$billing_interval['interval'],
							$billing_interval['interval_count'],
						) ) ?>
					</td>
				</tr>
			<?php endif ?>

			<?php if ( $transaction_id = $order->get_transaction_id() ): ?>
				<tr>
					<th>Subscription ID</th>
					<td>
						<?= sprintf(
							'<a href="%s" target="_blank">%s %s</a>',
							$paypal_dashboard_url . 'billing/subscriptions/' . $transaction_id,
							$transaction_id,
							'<i class="las la-external-link-alt"></i>'
						) ?>
					</td>
				</tr>
			<?php endif ?>

			<?php if ( $state = $payment_method->get_state() ): ?>
				<?php if ( ! empty( $state['admin_message'] ) ): ?>
					<tr>
						<th></th>
						<td><?= esc_html( $state['admin_message'] ) ?></td>
					</tr>
				<?php elseif ( ! empty( $state['message'] ) ): ?>
					<tr>
						<th></th>
						<td><?= esc_html( $state['message'] ) ?></td>
					</tr>
				<?php endif ?>
			<?php endif ?>
		<?php endif;
	}

	protected function order_customer_details( \Voxel\Order $order, \Voxel\User $customer ) {
		$payment_method = $order->get_payment_method();
		if ( ! $payment_method ) {
			return;
		}

		if ( in_array( $payment_method->get_type(), [ 'paypal_payment', 'paypal_subscription' ], true ) ):
			$items = [];

			$payer_given_name = (string) $order->get_details('checkout.payer_details.name.given_name');
			$payer_surname = (string) $order->get_details('checkout.payer_details.name.surname');
			$payer_name = join( ' ', array_filter( [ $payer_given_name, $payer_surname ] ) );
			if ( ! empty( $payer_name ) ) {
				$items[] = [
					'label' => _x( 'Customer', 'paypal details', 'voxel' ),
					'content' => $payer_name,
				];
			}

			$payer_id = $order->get_details('checkout.payer_details.payer_id');
			if ( is_string( $payer_id ) && ! empty( $payer_id ) ) {
				$items[] = [
					'label' => _x( 'Customer ID', 'paypal details', 'voxel' ),
					'content' => $payer_id,
				];
			}

			$payer_email = $order->get_details('checkout.payer_details.email_address');
			if ( is_string( $payer_email ) && ! empty( $payer_email ) ) {
				$items[] = [
					'label' => _x( 'Customer email', 'paypal details', 'voxel' ),
					'content' => $payer_email,
				];
			}

			$merchant_name = $order->get_details('checkout.payee_details.display_data.brand_name');
			if ( is_string( $merchant_name ) && ! empty( $merchant_name ) ) {
				$items[] = [
					'label' => _x( 'Merchant', 'paypal details', 'voxel' ),
					'content' => $merchant_name,
				];
			}

			$merchant_id = $order->get_details('checkout.payee_details.merchant_id');
			if ( is_string( $merchant_id ) && ! empty( $merchant_id ) ) {
				$items[] = [
					'label' => _x( 'Merchant ID', 'paypal details', 'voxel' ),
					'content' => $merchant_id,
				];
			}

			$merchant_email = $order->get_details('checkout.payee_details.email_address');
			if ( is_string( $merchant_email ) && ! empty( $merchant_email ) ) {
				$items[] = [
					'label' => _x( 'Merchant email', 'paypal details', 'voxel' ),
					'content' => $merchant_email,
				];
			}

			if ( empty( $items ) ) {
				return;
			} ?>

			<tr>
				<th><b>PayPal</b></th>
				<td></td>
			</tr>

			<?php foreach ( $items as $item ): ?>
				<tr>
					<th><?= esc_html( $item['label'] ) ?></th>
					<td><?= esc_html( $item['content'] ) ?></td>
				</tr>
			<?php endforeach ?>
		<?php endif;
	}

	protected function paid_members_table_price_after( \Voxel\Order $order, $payment_method ) {
		if ( $payment_method->get_type() !== 'paypal_subscription' ) {
			return;
		}

		$state = $payment_method->get_state();
		if ( ! empty( $state['admin_message'] ) ) {
			echo '<br>' . esc_html( $state['admin_message'] );
		} elseif ( ! empty( $state['message'] ) ) {
			echo '<br>' . esc_html( $state['message'] );
		}
	}
}

