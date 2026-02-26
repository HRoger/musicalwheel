<?php

namespace Voxel\Controllers\Frontend\Products\Orders;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Single_Order_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel_ajax_products.single_order.get', '@get_order' );
		$this->on( 'voxel_ajax_products.single_order.run_action', '@run_order_action' );
	}

	protected function get_order() {
		try {
			$order_id = absint( $_GET['order_id'] ?? null );
			if ( ! $order_id ) {
				throw new \Exception( _x( 'Missing order id.', 'orders', 'voxel' ) );
			}

			$args = [
				'id' => $order_id,
			];

			if ( current_user_can( 'administrator' ) ) {
				//
			} else {
				$args['party_id'] = get_current_user_id();
			}

			$order = \Voxel\Product_Types\Orders\Order::find( $args );

			if ( ! $order ) {
				throw new \Exception( _x( 'Could not find order.', 'orders', 'voxel' ) );
			}

			$payment_method = $order->get_payment_method();
			if ( $payment_method && $payment_method->should_sync() ) {
				$payment_method->sync();
				$order = \Voxel\Product_Types\Orders\Order::force_get( $order->get_id() );
			}

			$customer = $order->get_customer();
			$vendor = $order->get_vendor();
			$actions = $order->get_actions( \Voxel\current_user() );
			$primary_actions = array_values( array_filter( $actions, function( $action ) {
				return ( $action['type'] ?? null ) === 'primary';
			} ) );

			$secondary_actions = array_values( array_filter( $actions, function( $action ) {
				return ( $action['type'] ?? null ) !== 'primary';
			} ) );

			$subscription_interval = null;
			if ( $interval_config = $order->get_billing_interval() ) {
				if ( $interval_config['type'] === 'recurring' ) {
					$formatted_interval = \Voxel\interval_format( $interval_config['interval'], $interval_config['interval_count'] );
					if ( $formatted_interval !== null ) {
						$subscription_interval = $formatted_interval;
					}
				}
			}

			$config = [
				'id' => $order->get_id(),
				'status' => [
					'key' => $order->get_status(),
					'updated_at' => $order->get_status_last_updated_for_display(),
					'long_label' => $order->get_status_long_label(),
				],
				'created_at' => $order->get_created_at_for_display(),
				'pricing' => [
					'payment_method' => $order->get_payment_method_key(),
					'currency' => $order->get_currency(),
					'subtotal' => $order->get_subtotal(),
					'tax_amount' => $order->get_tax_amount(),
					'discount_amount' => $order->get_discount_amount(),
					'shipping_amount' => $order->get_shipping_amount(),
					'total' => $order->get_total(),
					'subscription_interval' => $subscription_interval,
					'sections' => apply_filters( 'voxel/orders/view_order/pricing/sections', [], $order ),
				],
				'customer' => [
					'id' => $customer ? $customer->get_id() : null,
					'name' => $customer ? $customer->get_display_name() : _x( '(deleted account)', 'deleted user account', 'voxel' ),
					'avatar' => $customer ? $customer->get_avatar_markup() : null,
					'link' => $customer ? $customer->get_link() : null,
					'customer_details' => $order->get_customer_details(),
					'shipping_details' => apply_filters( 'voxel/order/shipping_details', [], $order ),
					'order_notes' => $order->get_order_notes(),
				],
				'vendor' => [
					'id' => $vendor ? $vendor->get_id() : null,
					'notes_to_customer' => $order->get_notes_to_customer(),
				],
				'current_user' => [
					'id' => get_current_user_id(),
					'is_customer' => $customer && $customer->get_id() === get_current_user_id(),
					'is_vendor' => $vendor && $vendor->get_id() === get_current_user_id(),
					'is_admin' => current_user_can( 'administrator' ),
				],
				'shipping' => [
					'enabled' => $order->should_handle_shipping(),
					'status' => [
						'key' => $order->get_shipping_status(),
						'label' => $order->get_shipping_status_label(),
						'class' => $order->get_shipping_status_class(),
					],
				],
				'actions' => [
					'primary' => array_map( function( $action ) {
						return [
							'action' => $action['action'] ?? null,
							'label' => $action['label'] ?? null,
							'confirm' => $action['confirm'] ?? null,
						];
					}, $primary_actions ),
					'secondary' => array_map( function( $action ) {
						return [
							'action' => $action['action'] ?? null,
							'label' => $action['label'] ?? null,
							'confirm' => $action['confirm'] ?? null,
						];
					}, $secondary_actions ),
					'dms' => [
						'enabled' => \Voxel\get( 'product_settings.orders.direct_messages.enabled', true ),
						'vendor_target' => $this->_get_dms_vendor_target( $order ),
					],
				],
				'items' => array_values( array_map( function( $item ) use ( $order ) {
					$description = [];
					$product_description = $item->get_product_description();
					if ( ! empty( $product_description ) ) {
						$description[] = $product_description;
					}

					if ( $item->get_quantity() ) {
						$description[] = sprintf( _x( 'Quantity: %d', 'single order', 'voxel' ), $item->get_quantity() );
					}

					$details = $item->get_order_page_details();

					$claim_listing_title = null;
					if ( $item->get_product_field_key() === 'voxel:claim_request' ) {
						$post_id = $item->get_details( 'voxel:claim_request.post_id' );
						if ( is_numeric( $post_id ) ) {
							$post = \Voxel\Post::get( (int) $post_id );
							if ( $post ) {
								$claim_listing_title = $post->get_display_name();
							}
						}
					}

					return [
						'id' => $item->get_id(),
						'type' => $item->get_type(),
						'product_type' => $item->get_product_type_key(),
						'booking_status' => $item->get_details( 'booking_status' ),
						'booking_type' => $item->get_details( 'booking.type' ),
						'claim_listing_title' => $claim_listing_title,
						'currency' => $item->get_currency(),
						'quantity' => $item->get_quantity(),
						'subtotal' => $item->get_subtotal(),
						'data_inputs_markup' => join( '', array_map( function( $data_input ) {
							return sprintf( '<span class="data-input-%s">%s: %s</span>', $data_input['type'], $data_input['label'], $data_input['content'] );
						}, $item->get_data_inputs_for_display() ) ),
						'product' => [
							'label' => $item->get_product_label(),
							'description' => join( ', ', $description ),
							'thumbnail_url' => $item->get_product_thumbnail_url(),
							'link' => $item->get_product_link(),
						],
						'details' => ! empty( $details ) ? $details : (object) [],
						'metadata' => apply_filters( 'voxel/orders/view_order/item/metadata', [], $item, $order ),
						'components' => apply_filters( 'voxel/orders/view_order/item/components', [], $item, $order ),
					];
				}, $order->get_items() ) ),
				'child_orders' => array_values( array_map( function( $child_order ) {
					$vendor = $child_order->get_vendor();

					if ( $child_order->has_vendor() ) {
						$vendor_name = $vendor ? $vendor->get_display_name() : _x( '(deleted account)', 'deleted user account', 'voxel' );
						$vendor_avatar = $vendor ? $vendor->get_avatar_markup() : null;
						$vendor_link = $vendor ? $vendor->get_link() : null;
					} else {
						// $vendor_name = get_bloginfo('name');
						$vendor_name = _x( 'platform', 'items sold by platform', 'voxel' );
						$vendor_avatar = null;
						$vendor_link = null;
					}

					return [
						'id' => $child_order->get_id(),
						'item_count' => $child_order->get_item_count(),
						'status' => $child_order->get_status(),
						'shipping_status' => $child_order->get_shipping_status(),
						'currency' => $child_order->get_currency(),
						'subtotal' => $child_order->get_subtotal(),
						'total' => $child_order->get_total(),
						'created_at' => $child_order->get_created_at_for_display(),
						'vendor' => [
							'exists' => $child_order->has_vendor(),
							'name' => $vendor_name,
							'avatar' => $vendor_avatar,
							'link' => $vendor_link,
						],
					];
				}, $order->get_child_orders() ) ),
				'metadata' => apply_filters( 'voxel/orders/view_order/metadata', [], $order ),
				'components' => apply_filters( 'voxel/orders/view_order/components', [], $order ),
			];

			return wp_send_json( [
				'success' => true,
				'order' => $config,
			] );
		} catch ( \Voxel\Vendor\Stripe\Exception\ApiErrorException | \Voxel\Vendor\Stripe\Exception\InvalidArgumentException $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => _x( 'Something went wrong', 'checkout', 'voxel' ),
				'debug' => [
					'type' => 'stripe_error',
					'code' => method_exists( $e, 'getStripeCode' ) ? $e->getStripeCode() : $e->getCode(),
					'message' => $e->getMessage(),
				],
			] );
		} catch ( \Exception $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
				'code' => $e->getCode(),
			] );
		}
	}

	protected function run_order_action() {
		try {
			if ( ( $_SERVER['REQUEST_METHOD'] ?? null ) !== 'POST' ) {
				throw new \Exception( __( 'Could not process request', 'voxel' ), 99 );
			}

			\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_orders' );

			$order_id = absint( $_REQUEST['order_id'] ?? null );
			if ( ! $order_id ) {
				throw new \Exception( _x( 'Missing order id.', 'orders', 'voxel' ) );
			}

			$args = [
				'id' => $order_id,
			];

			if ( current_user_can( 'administrator' ) ) {
				//
			} else {
				$args['party_id'] = get_current_user_id();
			}

			$order = \Voxel\Product_Types\Orders\Order::find( $args );

			if ( ! $order ) {
				throw new \Exception( _x( 'Could not find order.', 'orders', 'voxel' ) );
			}

			$actions = $order->get_actions( \Voxel\current_user() );
			$requested_action = $_REQUEST['order_action'];

			foreach ( $actions as $action ) {
				if ( $action['action'] === $requested_action ) {
					if ( is_callable( $action['handler'] ?? null ) ) {
						$action['handler']();
					}
				}
			}

			throw new \Exception( __( 'Could not process action', 'voxel' ), 99 );
		} catch ( \Voxel\Vendor\Stripe\Exception\ApiErrorException | \Voxel\Vendor\Stripe\Exception\InvalidArgumentException $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => _x( 'Something went wrong', 'checkout', 'voxel' ),
				'debug' => [
					'type' => 'stripe_error',
					'code' => method_exists( $e, 'getStripeCode' ) ? $e->getStripeCode() : $e->getCode(),
					'message' => $e->getMessage(),
				],
			] );
		} catch ( \Exception $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
				'code' => $e->getCode(),
			] );
		}
	}

	protected function _get_dms_vendor_target( $order ) {
		$vendor = $order->get_vendor();
		if ( ! $vendor ) {
			return null;
		}

		if ( count( $order->get_items() ) === 1 ) {
			foreach ( $order->get_items() as $order_item ) {
				if ( $order_item->get_type() === 'regular' && in_array( $order_item->get_product_field_key(), [ 'voxel:promotion' ], true ) ) {
					break;
				}

				$post = $order_item->get_post();
				if ( ! ( $post && $post->post_type ) ) {
					break;
				}

				if ( $post->post_type->config('settings.messages.enabled') ) {
					return sprintf( 'p%d', $post->get_id() );
				}
			}
		}

		return sprintf( 'u%d', $vendor->get_id() );
	}

}
