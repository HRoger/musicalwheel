<?php

namespace Voxel\Controllers\Frontend\Products\Orders;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Orders_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'voxel_ajax_products.orders.list', '@list' );
		$this->on( 'voxel/product-types/orders/order:updated', '@order_updated' );
	}

	protected function list() {
		try {
			$page = absint( $_GET['pg'] ?? 1 );
			$per_page = 10;
			$status = sanitize_text_field( $_GET['status'] ?? 'all' );
			$shipping_status = sanitize_text_field( $_GET['shipping_status'] ?? 'all' );
			$product_type = sanitize_text_field( $_GET['product_type'] ?? 'all' );
			$search = trim( sanitize_text_field( $_GET['search'] ?? '' ) );

			$args = [
				'limit' => $per_page + 1,
				'offset' => $page <= 1 ? null : ( ( $page - 1 ) * $per_page ),
				'with_items' => false,
				'parent_id' => 0,
			];

			if ( current_user_can( 'administrator' ) ) {
				//
			} else {
				$args['party_id'] = get_current_user_id();
				$args['parent_id'] = null;
			}

			if ( empty( $status ) || $status === 'all' ) {
				$args['status_not_in'] = [ 'pending_payment' ];
			} else {
				$args['status'] = $status;
			}

			if ( ! empty( $shipping_status ) && $shipping_status !== 'all' ) {
				$args['shipping_status'] = $shipping_status;
			}

			if ( ! empty( $product_type ) && $product_type !== 'all' ) {
				$args['product_type'] = $product_type;
			}

			if ( ! empty( $search ) ) {
				$args['search'] = $search;
			}

			$orders = \Voxel\Order::query( $args );
			$has_more = count( $orders ) > $per_page;
			if ( $has_more ) {
				array_pop( $orders );
			}

			$order_ids = array_map( function ( $o ) { return $o->get_id(); }, $orders );
			$first_item_summaries = static::get_orders_first_item_summary( $order_ids );

			$items = [];
			foreach ( $orders as $order ) {
				$customer = $order->get_customer();
				$order_id = $order->get_id();
				$summary = $first_item_summaries[ $order_id ] ?? null;

				// resolve claimed listing title for claim_request orders
				$first_item_claim_title = null;
				if ( isset( $summary['product_type'], $summary['claim_post_id'] ) && $summary['product_type'] === 'voxel:claim_request' && $summary['claim_post_id'] ) {
					$post = \Voxel\Post::get( $summary['claim_post_id'] );
					if ( $post ) {
						$first_item_claim_title = $post->get_display_name();
					}
				}

				$items[] = [
					'id' => $order_id,
					'item_count' => $order->get_item_count(),
					'status' => $order->get_status(),
					'shipping_status' => $order->get_shipping_status(),
					'payment_method' => $order->get_payment_method_key(),
					'currency' => $order->get_currency(),
					'subtotal' => $order->get_subtotal(),
					'total' => $order->get_total(),
					'created_at' => $order->get_created_at_for_display(),
					'customer' => [
						'name' => $customer ? $customer->get_display_name() : _x( '(deleted account)', 'deleted user account', 'voxel' ),
						'avatar' => $customer ? $customer->get_avatar_markup() : null,
						'link' => $customer ? $customer->get_link() : null,
					],
					'product_type' => $summary['product_type'] ?? null,
					'first_item_label' => $summary['product_label'] ?? null,
					'first_item_type' => $summary['item_type'] ?? null,
					'first_item_booking_status' => $summary['booking_status'] ?? null,
					'first_item_booking_type' => $summary['booking_type'] ?? null,
					'first_item_claim_title' => $first_item_claim_title,
				];
			}

			return wp_send_json( [
				'success' => true,
				'items' => $items,
				'has_more' => $has_more,
			] );
		} catch ( \Exception $e ) {
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
				'code' => $e->getCode(),
			] );
		}
	}

	protected function order_updated( $order ) {
		if ( $order->get_previous_status() === \Voxel\ORDER_PENDING_PAYMENT ) {
			if ( in_array( $order->get_status(), [ 'completed', 'pending_approval', 'sub_active' ], true ) ) {
				( new \Voxel\Events\Products\Orders\Customer_Placed_Order_Event )->dispatch( $order->get_id() );
			}
		}
	}

	/**
	 * Get first item's product_type, type, booking type, claim post id, and product label per order (for list display).
	 *
	 * @param int[] $order_ids
	 * @return array<int, array{product_type: string, item_type: string|null, booking_type: string|null, claim_post_id: int|null, product_label: string|null}>
	 */
	protected static function get_orders_first_item_summary( array $order_ids ): array {
		global $wpdb;
		if ( empty( $order_ids ) ) {
			return [];
		}
		$order_ids = array_map( 'absint', $order_ids );
		$ids_list = implode( ',', $order_ids );
		$table = $wpdb->prefix . 'vx_order_items';
		$results = $wpdb->get_results( <<<SQL
			SELECT i.order_id, i.product_type,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.type' ) ) AS item_type,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.booking_status' ) ) AS booking_status,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.booking.type' ) ) AS booking_type,
				CAST( JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.\"voxel:claim_request\".post_id' ) ) AS UNSIGNED ) AS claim_post_id,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.product.label' ) ) AS product_label
			FROM {$table} i
			INNER JOIN (
				SELECT order_id, MIN(id) AS min_id
				FROM {$table}
				WHERE order_id IN ({$ids_list})
				GROUP BY order_id
			) first ON i.order_id = first.order_id AND i.id = first.min_id
		SQL, ARRAY_A );
		$out = [];
		foreach ( (array) $results as $row ) {
			$out[ (int) $row['order_id'] ] = [
				'product_type' => (string) $row['product_type'],
				'item_type' => isset( $row['item_type'] ) && $row['item_type'] !== '' ? (string) $row['item_type'] : null,
				'booking_status' => isset( $row['booking_status'] ) && $row['booking_status'] !== '' ? (string) $row['booking_status'] : null,
				'booking_type' => isset( $row['booking_type'] ) && $row['booking_type'] !== '' ? (string) $row['booking_type'] : null,
				'claim_post_id' => isset( $row['claim_post_id'] ) && $row['claim_post_id'] ? (int) $row['claim_post_id'] : null,
				'product_label' => isset( $row['product_label'] ) && $row['product_label'] !== '' ? (string) $row['product_label'] : null,
			];
		}
		return $out;
	}
}