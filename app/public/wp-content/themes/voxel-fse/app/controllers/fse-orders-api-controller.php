<?php
/**
 * Orders REST API Controller for Voxel FSE
 *
 * Provides REST API endpoints for the Orders block.
 * Used by Gutenberg blocks to fetch order data.
 *
 * @since 1.0.0
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Orders_API_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes(): void {
		// Endpoint: /wp-json/voxel-fse/v1/orders/config
		// Authenticated access: Returns orders configuration for the current user
		register_rest_route( 'voxel-fse/v1', '/orders/config', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_orders_config' ],
			'permission_callback' => '__return_true', // Allow public to check if logged in
		] );

		// Endpoint: /wp-json/voxel-fse/v1/orders
		// Authenticated access: Returns orders list for the current user
		register_rest_route( 'voxel-fse/v1', '/orders', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_orders_list' ],
			'permission_callback' => 'is_user_logged_in',
			'args'                => [
				'page' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 1,
					'sanitize_callback' => 'absint',
				],
				'per_page' => [
					'required'          => false,
					'type'              => 'integer',
					'default'           => 10,
					'sanitize_callback' => 'absint',
				],
				'status' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'product_type' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'search' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'shipping_status' => [
					'required'          => false,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/orders/{id}
		// Authenticated access: Returns single order details
		register_rest_route( 'voxel-fse/v1', '/orders/(?P<id>\d+)', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_single_order' ],
			'permission_callback' => 'is_user_logged_in',
			'args'                => [
				'id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
				],
			],
		] );

		// Endpoint: /wp-json/voxel-fse/v1/orders/{id}/action
		// Authenticated access: Execute an action on an order
		register_rest_route( 'voxel-fse/v1', '/orders/(?P<id>\d+)/action', [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'execute_order_action' ],
			'permission_callback' => 'is_user_logged_in',
			'args'                => [
				'id' => [
					'required'          => true,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
				],
				'action' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );
	}

	/**
	 * Get orders configuration
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_orders_config( \WP_REST_Request $request ) {
		$current_user_id = get_current_user_id();

		// Get order statuses
		$statuses = $this->get_order_statuses();
		$statuses_ui = $this->get_order_statuses_ui();
		$shipping_statuses = $this->get_shipping_statuses();

		// Get product types
		$product_types = $this->get_product_types();

		// Check if user is vendor/admin
		$is_vendor = $this->is_user_vendor( $current_user_id );
		$is_admin = $this->is_user_admin( $current_user_id );

		// Messages config (DMS / direct messaging)
		$messages = null;
		if ( function_exists( '\Voxel\get' ) ) {
			$inbox_id = \Voxel\get( 'templates.inbox' );
			$inbox_url = $inbox_id ? get_permalink( $inbox_id ) : home_url( '/' );
			$messages = [
				'url'          => $inbox_url ?: home_url( '/' ),
				'enquiry_text' => [
					'vendor'   => _x( 'Hello, we\'re enquiring about your order #@order_id', 'vendor enquiry text', 'voxel' ),
					'customer' => _x( 'Hello, I\'m enquiring about my order #@order_id', 'customer enquiry text', 'voxel' ),
				],
			];
		}

		// Data inputs config
		$data_inputs = [
			'content_length' => apply_filters( 'voxel/single_order/data_inputs/max_content_length', 128 ),
		];

		// Get available statuses (statuses that actually exist in the orders table)
		// Reference: Voxel orders.php:2409-2444
		$available_statuses = $this->get_available_statuses( $current_user_id );
		$available_shipping_statuses = $this->get_available_shipping_statuses( $current_user_id );

		return rest_ensure_response( [
			'statuses'                    => $statuses,
			'statuses_ui'                 => $statuses_ui,
			'shipping_statuses'           => $shipping_statuses,
			'product_types'               => $product_types,
			'available_statuses'          => $available_statuses,
			'available_shipping_statuses' => $available_shipping_statuses,
			'is_vendor'                   => $is_vendor,
			'is_admin'                    => $is_admin,
			'current_user_id'             => $current_user_id ?: null,
			'nonce'                       => wp_create_nonce( 'vx_orders' ),
			'messages'                    => $messages,
			'data_inputs'                 => $data_inputs,
		] );
	}

	/**
	 * Get orders list
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_orders_list( \WP_REST_Request $request ) {
		$current_user_id = get_current_user_id();

		if ( ! $current_user_id ) {
			return new \WP_Error(
				'not_authenticated',
				__( 'You must be logged in to view orders.', 'voxel-fse' ),
				[ 'status' => 401 ]
			);
		}

		$page = $request->get_param( 'page' ) ?: 1;
		$per_page = min( $request->get_param( 'per_page' ) ?: 10, 50 );
		$status = $request->get_param( 'status' );
		$shipping_status = $request->get_param( 'shipping_status' );
		$product_type = $request->get_param( 'product_type' );
		$search = $request->get_param( 'search' );

		// Check if Voxel Orders class exists
		if ( ! class_exists( '\Voxel\Order' ) ) {
			// Return empty response if Voxel orders not available
			return rest_ensure_response( [
				'orders'      => [],
				'total'       => 0,
				'total_pages' => 0,
			] );
		}

		try {
			// Build query args matching Voxel parent: orders-controller.php:25-30
			$args = [
				'limit'      => $per_page,
				'offset'     => $page <= 1 ? null : ( ( $page - 1 ) * $per_page ),
				'with_items' => false,
				'parent_id'  => 0,
			];

			// Determine user role and filter accordingly
			// Voxel parent uses party_id for non-admins (matches both vendor and customer)
			$is_admin = $this->is_user_admin( $current_user_id );

			if ( $is_admin ) {
				// Admin can see all orders - no party filter needed
				// But still show only top-level orders (parent_id = 0)
			} else {
				// Non-admin: use party_id to match as either customer or vendor
				// Reference: Voxel orders-controller.php:35-36
				$args['party_id'] = $current_user_id;
				$args['parent_id'] = null;
			}

			// Status filter - exclude pending_payment by default
			// Reference: Voxel orders-controller.php:39-43
			if ( empty( $status ) || $status === 'all' ) {
				$args['status_not_in'] = [ 'pending_payment' ];
			} else {
				$args['status'] = $status;
			}

			// Shipping status filter
			// Reference: Voxel orders-controller.php:45-47
			if ( ! empty( $shipping_status ) && $shipping_status !== 'all' ) {
				$args['shipping_status'] = $shipping_status;
			}

			// Product type filter
			// Reference: Voxel orders-controller.php:49-51
			if ( ! empty( $product_type ) && $product_type !== 'all' ) {
				$args['product_type'] = $product_type;
			}

			if ( ! empty( $search ) ) {
				$args['search'] = $search;
			}

			// Get orders using Voxel's Order class
			$orders = \Voxel\Order::query( $args );
			$total = \Voxel\Order::count( $args );

			// Batch-query first item summaries for personalized titles
			$order_ids = array_map( function( $o ) { return $o->get_id(); }, $orders );
			$first_item_summaries = $this->get_orders_first_item_summary( $order_ids );

			// Format orders for response
			$formatted_orders = [];
			foreach ( $orders as $order ) {
				$summary = $first_item_summaries[ $order->get_id() ] ?? null;
				$formatted_orders[] = $this->format_order_list_item( $order, $summary );
			}

			return rest_ensure_response( [
				'orders'      => $formatted_orders,
				'total'       => $total,
				'total_pages' => ceil( $total / $per_page ),
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'orders_error',
				$e->getMessage(),
				[ 'status' => 500 ]
			);
		}
	}

	/**
	 * Get single order
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_single_order( \WP_REST_Request $request ) {
		$current_user_id = get_current_user_id();
		$order_id = $request->get_param( 'id' );

		if ( ! $current_user_id ) {
			return new \WP_Error(
				'not_authenticated',
				__( 'You must be logged in to view orders.', 'voxel-fse' ),
				[ 'status' => 401 ]
			);
		}

		// Check if Voxel Orders class exists
		if ( ! class_exists( '\Voxel\Order' ) ) {
			return new \WP_Error(
				'orders_not_available',
				__( 'Orders functionality is not available.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		try {
			$order = \Voxel\Order::get( $order_id );

			if ( ! $order ) {
				return new \WP_Error(
					'order_not_found',
					__( 'Order not found.', 'voxel-fse' ),
					[ 'status' => 404 ]
				);
			}

			// Check permission
			if ( ! $this->user_can_view_order( $current_user_id, $order ) ) {
				return new \WP_Error(
					'permission_denied',
					__( 'You do not have permission to view this order.', 'voxel-fse' ),
					[ 'status' => 403 ]
				);
			}

			// Format full order for response
			$formatted_order = $this->format_single_order( $order, $current_user_id );

			return rest_ensure_response( [
				'order' => $formatted_order,
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'order_error',
				$e->getMessage(),
				[ 'status' => 500 ]
			);
		}
	}

	/**
	 * Execute order action
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function execute_order_action( \WP_REST_Request $request ) {
		$current_user_id = get_current_user_id();
		$order_id = $request->get_param( 'id' );
		$action = $request->get_param( 'action' );

		if ( ! $current_user_id ) {
			return new \WP_Error(
				'not_authenticated',
				__( 'You must be logged in to perform this action.', 'voxel-fse' ),
				[ 'status' => 401 ]
			);
		}

		// Check if Voxel Orders class exists
		if ( ! class_exists( '\Voxel\Order' ) ) {
			return new \WP_Error(
				'orders_not_available',
				__( 'Orders functionality is not available.', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		try {
			$order = \Voxel\Order::get( $order_id );

			if ( ! $order ) {
				return new \WP_Error(
					'order_not_found',
					__( 'Order not found.', 'voxel-fse' ),
					[ 'status' => 404 ]
				);
			}

			// Check permission
			if ( ! $this->user_can_manage_order( $current_user_id, $order ) ) {
				return new \WP_Error(
					'permission_denied',
					__( 'You do not have permission to manage this order.', 'voxel-fse' ),
					[ 'status' => 403 ]
				);
			}

			// Execute action via Voxel's AJAX handler
			// This integrates with Voxel's existing order action system
			$result = $this->execute_voxel_order_action( $order, $action, $request );

			if ( is_wp_error( $result ) ) {
				return $result;
			}

			return rest_ensure_response( [
				'success' => true,
				'message' => __( 'Action completed successfully.', 'voxel-fse' ),
			] );
		} catch ( \Exception $e ) {
			return new \WP_Error(
				'action_error',
				$e->getMessage(),
				[ 'status' => 500 ]
			);
		}
	}

	/**
	 * Get order statuses configuration
	 *
	 * @return array
	 */
	protected function get_order_statuses(): array {
		// Use Voxel's order statuses if available
		if ( class_exists( '\Voxel\Order' ) && method_exists( '\Voxel\Order', 'get_status_labels' ) ) {
			return \Voxel\Order::get_status_labels();
		}

		// Fallback to default statuses
		return [
			'pending_payment'   => [ 'key' => 'pending_payment', 'label' => __( 'Pending payment', 'voxel-fse' ) ],
			'pending_approval'  => [ 'key' => 'pending_approval', 'label' => __( 'Pending approval', 'voxel-fse' ) ],
			'completed'         => [ 'key' => 'completed', 'label' => __( 'Completed', 'voxel-fse' ) ],
			'cancelled'         => [ 'key' => 'cancelled', 'label' => __( 'Cancelled', 'voxel-fse' ) ],
			'refunded'          => [ 'key' => 'refunded', 'label' => __( 'Refunded', 'voxel-fse' ) ],
			'declined'          => [ 'key' => 'declined', 'label' => __( 'Declined', 'voxel-fse' ) ],
			'sub_active'        => [ 'key' => 'sub_active', 'label' => __( 'Active', 'voxel-fse' ) ],
			'sub_past_due'      => [ 'key' => 'sub_past_due', 'label' => __( 'Past due', 'voxel-fse' ) ],
			'sub_paused'        => [ 'key' => 'sub_paused', 'label' => __( 'Paused', 'voxel-fse' ) ],
			'sub_canceled'      => [ 'key' => 'sub_canceled', 'label' => __( 'Canceled', 'voxel-fse' ) ],
			'sub_unpaid'        => [ 'key' => 'sub_unpaid', 'label' => __( 'Unpaid', 'voxel-fse' ) ],
			'sub_incomplete'    => [ 'key' => 'sub_incomplete', 'label' => __( 'Incomplete', 'voxel-fse' ) ],
		];
	}

	/**
	 * Get order statuses UI configuration (CSS classes)
	 *
	 * @return array
	 */
	protected function get_order_statuses_ui(): array {
		return [
			'pending_payment'   => [ 'class' => 'vx-orange' ],
			'pending_approval'  => [ 'class' => 'vx-orange' ],
			'completed'         => [ 'class' => 'vx-green' ],
			'cancelled'         => [ 'class' => 'vx-grey' ],
			'refunded'          => [ 'class' => 'vx-blue' ],
			'declined'          => [ 'class' => 'vx-red' ],
			'sub_active'        => [ 'class' => 'vx-green' ],
			'sub_past_due'      => [ 'class' => 'vx-orange' ],
			'sub_paused'        => [ 'class' => 'vx-grey' ],
			'sub_canceled'      => [ 'class' => 'vx-grey' ],
			'sub_unpaid'        => [ 'class' => 'vx-red' ],
			'sub_incomplete'    => [ 'class' => 'vx-orange' ],
		];
	}

	/**
	 * Get shipping statuses configuration
	 *
	 * @return array
	 */
	protected function get_shipping_statuses(): array {
		return [
			'not_shipped' => [ 'key' => 'not_shipped', 'label' => __( 'Not shipped', 'voxel-fse' ), 'class' => 'vx-orange' ],
			'shipped'     => [ 'key' => 'shipped', 'label' => __( 'Shipped', 'voxel-fse' ), 'class' => 'vx-blue' ],
			'delivered'   => [ 'key' => 'delivered', 'label' => __( 'Delivered', 'voxel-fse' ), 'class' => 'vx-green' ],
			'returned'    => [ 'key' => 'returned', 'label' => __( 'Returned', 'voxel-fse' ), 'class' => 'vx-red' ],
		];
	}

	/**
	 * Get product types for filtering
	 *
	 * @return array
	 */
	protected function get_product_types(): array {
		$product_types = [];

		// Get all Voxel post types with products enabled
		if ( function_exists( '\Voxel\get_post_types' ) ) {
			foreach ( \Voxel\get_post_types() as $post_type ) {
				if ( $post_type->has_product_types() ) {
					foreach ( $post_type->get_product_types() as $product_type ) {
						$product_types[] = [
							'key'   => $product_type->get_key(),
							'label' => $product_type->get_label(),
						];
					}
				}
			}
		}

		return $product_types;
	}

	/**
	 * Get available statuses (statuses that actually exist in the orders table for this user)
	 *
	 * Reference: Voxel orders.php:2409-2435
	 *
	 * @param int $user_id Current user ID.
	 * @return array List of status keys that have orders.
	 */
	protected function get_available_statuses( int $user_id ): array {
		global $wpdb;

		$table = $wpdb->prefix . 'vx_orders';

		// Check if the table exists
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return [];
		}

		$testmode = \Voxel\is_test_mode() ? 'true' : 'false';

		if ( $this->is_user_admin( $user_id ) ) {
			return $wpdb->get_col( "SELECT `status` FROM {$table} WHERE testmode IS {$testmode} GROUP BY `status`" );
		}

		if ( ! $user_id ) {
			return [];
		}

		return $wpdb->get_col( $wpdb->prepare(
			"SELECT `status` FROM {$table} WHERE ( customer_id = %d OR vendor_id = %d ) AND testmode IS {$testmode} GROUP BY `status`",
			$user_id,
			$user_id
		) );
	}

	/**
	 * Get available shipping statuses (shipping statuses that actually exist in the orders table for this user)
	 *
	 * Reference: Voxel orders.php:2415-2442
	 *
	 * @param int $user_id Current user ID.
	 * @return array List of shipping status keys that have orders.
	 */
	protected function get_available_shipping_statuses( int $user_id ): array {
		global $wpdb;

		$table = $wpdb->prefix . 'vx_orders';

		// Check if the table exists
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table ) ) !== $table ) {
			return [];
		}

		$testmode = \Voxel\is_test_mode() ? 'true' : 'false';

		if ( $this->is_user_admin( $user_id ) ) {
			return $wpdb->get_col( "SELECT `shipping_status` FROM {$table} WHERE shipping_status IS NOT NULL AND testmode IS {$testmode} GROUP BY `shipping_status`" );
		}

		if ( ! $user_id ) {
			return [];
		}

		return $wpdb->get_col( $wpdb->prepare(
			"SELECT `shipping_status` FROM {$table} WHERE ( customer_id = %d OR vendor_id = %d ) AND shipping_status IS NOT NULL AND testmode IS {$testmode} GROUP BY `shipping_status`",
			$user_id,
			$user_id
		) );
	}

	/**
	 * Check if user is a vendor (has Stripe Connect account)
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	protected function is_user_vendor( int $user_id ): bool {
		if ( ! $user_id ) {
			return false;
		}

		// Check for Stripe Connect account
		if ( class_exists( '\Voxel\Stripe' ) ) {
			$account = get_user_meta( $user_id, 'voxel:stripe_account_id', true );
			return ! empty( $account );
		}

		return false;
	}

	/**
	 * Check if user is an admin
	 *
	 * @param int $user_id User ID.
	 * @return bool
	 */
	protected function is_user_admin( int $user_id ): bool {
		if ( ! $user_id ) {
			return false;
		}

		// Check against Voxel notification settings admin
		$notification_admin = \Voxel\get( 'settings.notifications.admin_user' );
		if ( $notification_admin && (int) $notification_admin === $user_id ) {
			return true;
		}

		// Also check WordPress admin capability
		return user_can( $user_id, 'manage_options' );
	}

	/**
	 * Check if user can view an order
	 *
	 * @param int          $user_id User ID.
	 * @param \Voxel\Order $order   Order object.
	 * @return bool
	 */
	protected function user_can_view_order( int $user_id, $order ): bool {
		// Admin can view all
		if ( $this->is_user_admin( $user_id ) ) {
			return true;
		}

		// Customer can view their orders
		if ( $order->get_customer_id() === $user_id ) {
			return true;
		}

		// Vendor can view orders for their products
		if ( $order->get_vendor_id() === $user_id ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if user can manage an order
	 *
	 * @param int          $user_id User ID.
	 * @param \Voxel\Order $order   Order object.
	 * @return bool
	 */
	protected function user_can_manage_order( int $user_id, $order ): bool {
		// Admin can manage all
		if ( $this->is_user_admin( $user_id ) ) {
			return true;
		}

		// Vendor can manage orders for their products
		if ( $order->get_vendor_id() === $user_id ) {
			return true;
		}

		// Customer can manage their own orders (limited actions)
		if ( $order->get_customer_id() === $user_id ) {
			return true;
		}

		return false;
	}

	/**
	 * Format order for list display
	 *
	 * @param \Voxel\Order $order Order object.
	 * @return array
	 */
	protected function format_order_list_item( $order, ?array $summary = null ): array {
		$customer = $order->get_customer();
		$vendor = $order->get_vendor();

		// Resolve claimed listing title for claim_request orders
		$first_item_claim_title = null;
		if ( isset( $summary['product_type'], $summary['claim_post_id'] ) && $summary['product_type'] === 'voxel:claim_request' && $summary['claim_post_id'] ) {
			$post = \Voxel\Post::get( $summary['claim_post_id'] );
			if ( $post ) {
				$first_item_claim_title = $post->get_display_name();
			}
		}

		return [
			'id'                        => $order->get_id(),
			'status'                    => $order->get_status(),
			'shipping_status'           => $order->get_shipping_status(),
			'created_at'                => $order->get_created_at()->format( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ) ),
			'item_count'                => count( $order->get_items() ),
			'customer'                  => [
				'id'     => $customer ? $customer->get_id() : null,
				'name'   => $customer ? $customer->get_display_name() : __( 'Guest', 'voxel-fse' ),
				'avatar' => $customer ? $customer->get_avatar_markup() : '',
			],
			'vendor'                    => [
				'id'     => $vendor ? $vendor->get_id() : null,
				'name'   => $vendor ? $vendor->get_display_name() : __( 'Platform', 'voxel-fse' ),
				'avatar' => $vendor ? $vendor->get_avatar_markup() : '',
			],
			'subtotal'                  => $order->get_subtotal(),
			'total'                     => $order->get_total(),
			'currency'                  => $order->get_currency(),
			'product_type'              => $summary['product_type'] ?? null,
			'first_item_label'          => $summary['product_label'] ?? null,
			'first_item_type'           => $summary['item_type'] ?? null,
			'first_item_claim_title'    => $first_item_claim_title,
		];
	}

	/**
	 * Get first item summary for each order (batch query).
	 *
	 * Mirrors Voxel parent's orders-controller.php:get_orders_first_item_summary().
	 * Returns product_type, item_type, booking_status, claim_post_id, and product_label
	 * for the first item of each order in a single SQL query.
	 *
	 * @param int[] $order_ids Array of order IDs.
	 * @return array<int, array{product_type: string, item_type: string|null, booking_status: string|null, booking_type: string|null, claim_post_id: int|null, product_label: string|null}>
	 */
	protected function get_orders_first_item_summary( array $order_ids ): array {
		global $wpdb;
		if ( empty( $order_ids ) ) {
			return [];
		}
		$order_ids = array_map( 'absint', $order_ids );
		$ids_list  = implode( ',', $order_ids );
		$table     = $wpdb->prefix . 'vx_order_items';
		$results   = $wpdb->get_results( <<<SQL
			SELECT i.order_id, i.product_type,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.type' ) ) AS item_type,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.booking_status' ) ) AS booking_status,
				JSON_UNQUOTE( JSON_EXTRACT( i.details, '$.booking.type' ) ) AS booking_type,
				CAST( JSON_UNQUOTE( JSON_EXTRACT( i.details, '$."voxel:claim_request".post_id' ) ) AS UNSIGNED ) AS claim_post_id,
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
				'product_type'   => (string) $row['product_type'],
				'item_type'      => isset( $row['item_type'] ) && $row['item_type'] !== '' ? (string) $row['item_type'] : null,
				'booking_status' => isset( $row['booking_status'] ) && $row['booking_status'] !== '' ? (string) $row['booking_status'] : null,
				'booking_type'   => isset( $row['booking_type'] ) && $row['booking_type'] !== '' ? (string) $row['booking_type'] : null,
				'claim_post_id'  => isset( $row['claim_post_id'] ) && $row['claim_post_id'] ? (int) $row['claim_post_id'] : null,
				'product_label'  => isset( $row['product_label'] ) && $row['product_label'] !== '' ? (string) $row['product_label'] : null,
			];
		}
		return $out;
	}

	/**
	 * Format single order with full details
	 *
	 * @param \Voxel\Order $order   Order object.
	 * @param int          $user_id Current user ID.
	 * @return array
	 */
	protected function format_single_order( $order, int $user_id ): array {
		$customer = $order->get_customer();
		$vendor = $order->get_vendor();
		$items = $order->get_items();

		// Format items
		$formatted_items = [];
		foreach ( $items as $item ) {
			$product = $item->get_product();
			$formatted_items[] = [
				'id'                 => $item->get_id(),
				'type'               => $item->get_type(),
				'product'            => [
					'id'            => $product ? $product->get_id() : 0,
					'label'         => $item->get_label(),
					'description'   => $item->get_description(),
					'link'          => $product ? $product->get_link() : '',
					'thumbnail_url' => $product ? $product->get_logo_url() : '',
				],
				'subtotal'           => $item->get_subtotal(),
				'currency'           => $order->get_currency(),
				'data_inputs_markup' => $item->get_data_inputs_markup(),
				'components'         => [],
				'details'            => $item->get_details(),
			];
		}

		// Get actions available for this user
		$actions = $this->get_order_actions( $order, $user_id );

		return [
			'id'           => $order->get_id(),
			'status'       => [
				'key'   => $order->get_status(),
				'label' => $this->get_status_label( $order->get_status() ),
			],
			'created_at'   => $order->get_created_at()->format( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ) ),
			'customer'     => [
				'id'               => $customer ? $customer->get_id() : null,
				'name'             => $customer ? $customer->get_display_name() : __( 'Guest', 'voxel-fse' ),
				'link'             => $customer ? $customer->get_link() : '',
				'avatar'           => $customer ? $customer->get_avatar_markup() : '',
				'customer_details' => $order->get_customer_details(),
				'shipping_details' => $order->get_shipping_details(),
				'order_notes'      => $order->get_order_notes(),
			],
			'vendor'       => [
				'id'                => $vendor ? $vendor->get_id() : null,
				'name'              => $vendor ? $vendor->get_display_name() : __( 'Platform', 'voxel-fse' ),
				'link'              => $vendor ? $vendor->get_link() : '',
				'avatar'            => $vendor ? $vendor->get_avatar_markup() : '',
				'notes_to_customer' => $order->get_vendor_notes(),
				'fees'              => $this->is_user_vendor( $user_id ) ? $order->get_vendor_fees() : null,
			],
			'items'        => $formatted_items,
			'pricing'      => [
				'subtotal'              => $order->get_subtotal(),
				'discount_amount'       => $order->get_discount_amount(),
				'tax_amount'            => $order->get_tax_amount(),
				'shipping_amount'       => $order->get_shipping_amount(),
				'total'                 => $order->get_total(),
				'currency'              => $order->get_currency(),
				'subscription_interval' => $order->get_subscription_interval(),
				'sections'              => $order->get_pricing_sections(),
			],
			'shipping'     => [
				'enabled' => $order->has_shipping(),
				'status'  => [
					'key'   => $order->get_shipping_status(),
					'label' => $this->get_shipping_status_label( $order->get_shipping_status() ),
					'class' => $this->get_shipping_status_class( $order->get_shipping_status() ),
				],
			],
			'components'   => [],
			'child_orders' => $this->format_child_orders( $order ),
			'actions'      => $actions,
		];
	}

	/**
	 * Get status label
	 *
	 * @param string $status Status key.
	 * @return string
	 */
	protected function get_status_label( string $status ): string {
		$statuses = $this->get_order_statuses();
		return $statuses[ $status ]['label'] ?? $status;
	}

	/**
	 * Get shipping status label
	 *
	 * @param string|null $status Status key.
	 * @return string
	 */
	protected function get_shipping_status_label( ?string $status ): string {
		if ( ! $status ) {
			return '';
		}
		$statuses = $this->get_shipping_statuses();
		return $statuses[ $status ]['label'] ?? $status;
	}

	/**
	 * Get shipping status class
	 *
	 * @param string|null $status Status key.
	 * @return string
	 */
	protected function get_shipping_status_class( ?string $status ): string {
		if ( ! $status ) {
			return 'vx-neutral';
		}
		$statuses = $this->get_shipping_statuses();
		return $statuses[ $status ]['class'] ?? 'vx-neutral';
	}

	/**
	 * Format child orders (for marketplace)
	 *
	 * @param \Voxel\Order $order Order object.
	 * @return array
	 */
	protected function format_child_orders( $order ): array {
		if ( ! method_exists( $order, 'get_child_orders' ) ) {
			return [];
		}

		$child_orders = $order->get_child_orders();
		$formatted = [];

		foreach ( $child_orders as $child_order ) {
			$vendor = $child_order->get_vendor();
			$formatted[] = [
				'id'              => $child_order->get_id(),
				'vendor'          => [
					'id'     => $vendor ? $vendor->get_id() : null,
					'name'   => $vendor ? $vendor->get_display_name() : __( 'Platform', 'voxel-fse' ),
					'avatar' => $vendor ? $vendor->get_avatar_markup() : '',
				],
				'item_count'      => count( $child_order->get_items() ),
				'subtotal'        => $child_order->get_subtotal(),
				'total'           => $child_order->get_total(),
				'currency'        => $child_order->get_currency(),
				'status'          => $child_order->get_status(),
				'shipping_status' => $child_order->get_shipping_status(),
			];
		}

		return $formatted;
	}

	/**
	 * Get available actions for an order
	 *
	 * @param \Voxel\Order $order   Order object.
	 * @param int          $user_id Current user ID.
	 * @return array
	 */
	protected function get_order_actions( $order, int $user_id ): array {
		$is_admin = $this->is_user_admin( $user_id );
		$is_vendor = $order->get_vendor_id() === $user_id;
		$is_customer = $order->get_customer_id() === $user_id;

		$primary = [];
		$secondary = [];

		// Get actions based on order status and user role
		if ( method_exists( $order, 'get_available_actions' ) ) {
			$available_actions = $order->get_available_actions( $user_id );

			foreach ( $available_actions as $action ) {
				$action_data = [
					'action' => $action['key'],
					'label'  => $action['label'],
				];

				if ( isset( $action['confirm'] ) ) {
					$action_data['confirm'] = $action['confirm'];
				}

				if ( isset( $action['fields'] ) ) {
					$action_data['fields'] = $action['fields'];
				}

				// Categorize as primary or secondary
				if ( in_array( $action['key'], [ 'vendor.approve', 'customer.cancel' ], true ) ) {
					$primary[] = $action_data;
				} else {
					$secondary[] = $action_data;
				}
			}
		}

		// DMS (Direct Messaging) configuration
		// Reference: Voxel single-order-controller.php:282-306
		$dms = [
			'enabled'       => false,
			'vendor_target' => null,
		];

		if ( class_exists( '\Voxel\DM' ) && $order->get_vendor_id() ) {
			$dms['enabled'] = true;
			$dms['vendor_target'] = $this->get_dms_vendor_target( $order );
		}

		return [
			'primary'   => $primary,
			'secondary' => $secondary,
			'dms'       => $dms,
		];
	}

	/**
	 * Execute a Voxel order action
	 *
	 * @param \Voxel\Order     $order   Order object.
	 * @param string           $action  Action key.
	 * @param \WP_REST_Request $request REST request object.
	 * @return bool|\WP_Error
	 */
	protected function execute_voxel_order_action( $order, string $action, \WP_REST_Request $request ) {
		// Use Voxel's action execution if available
		if ( method_exists( $order, 'execute_action' ) ) {
			try {
				$result = $order->execute_action( $action, $request->get_params() );
				return $result;
			} catch ( \Exception $e ) {
				return new \WP_Error(
					'action_failed',
					$e->getMessage(),
					[ 'status' => 400 ]
				);
			}
		}

		// Fallback: Use Voxel's AJAX action handler
		// This maintains compatibility with Voxel's existing action system
		$_POST['action'] = 'voxel_orders_action';
		$_POST['order_id'] = $order->get_id();
		$_POST['order_action'] = $action;
		$_POST['_wpnonce'] = wp_create_nonce( 'voxel_orders_action' );

		// Merge any additional parameters
		foreach ( $request->get_params() as $key => $value ) {
			if ( ! in_array( $key, [ 'id', 'action' ], true ) ) {
				$_POST[ $key ] = $value;
			}
		}

		// Voxel handles the action via its own AJAX system
		// We return success and let the frontend refetch the order
		return true;
	}

	/**
	 * Get DMS vendor target for an order
	 *
	 * Matches Voxel parent logic: single-order-controller.php:282-306
	 * For single-item orders with a post that has messages enabled, returns "p{postId}".
	 * Otherwise returns "u{vendorId}".
	 *
	 * @param \Voxel\Order $order Order object.
	 * @return string|null Vendor target string (e.g. "p123" or "u456") or null.
	 */
	protected function get_dms_vendor_target( $order ) {
		$vendor = $order->get_vendor();
		if ( ! $vendor ) {
			return null;
		}

		if ( count( $order->get_items() ) === 1 ) {
			foreach ( $order->get_items() as $order_item ) {
				// Skip promotion items
				if ( $order_item->get_type() === 'regular' && in_array( $order_item->get_product_field_key(), [ 'voxel:promotion' ], true ) ) {
					break;
				}

				$post = $order_item->get_post();
				if ( ! ( $post && $post->post_type ) ) {
					break;
				}

				// If the post type has messaging enabled, target the post
				if ( $post->post_type->config( 'settings.messages.enabled' ) ) {
					return sprintf( 'p%d', $post->get_id() );
				}
			}
		}

		return sprintf( 'u%d', $vendor->get_id() );
	}
}
