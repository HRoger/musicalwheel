<?php
/**
 * FSE Advanced List API Controller
 *
 * REST API endpoints for the Advanced List block.
 * Provides post context and action data for React frontend.
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Advanced_List_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const REST_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	/**
	 * Always authorize REST route registration
	 */
	protected function authorize(): bool {
		return true;
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes() {
		// Post Context
		register_rest_route( self::REST_NAMESPACE, '/advanced-list/post-context', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_context' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'post_id' => [
					'validate_callback' => function($param) {
						return is_numeric($param);
					}
				],
			],
		] );
	}

	/**
	 * Get post context for Advanced List actions
	 * Returns dynamic data like follow status, edit links, etc.
	 *
	 * Implements 1:1 parity with Voxel PHP templates:
	 * - delete-post-action.php
	 * - follow-post-action.php
	 * - follow-user-action.php
	 * - add-to-cart-action.php
	 * - edit-post-action.php
	 * - share-post-action.php
	 * - promote-post-action.php
	 * - view-post-stats-action.php
	 * - show-post-on-map.php
	 */
	public function get_post_context( $request ) {
		$post_id = $request->get_param( 'post_id' );

		if ( ! $post_id ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post ID is required',
			], 400 );
		}

		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post not found',
			], 404 );
		}

		$current_user = \Voxel\current_user();
		$is_logged_in = is_user_logged_in();

		// Timeline enabled check (follow-post-action.php:6-8, follow-user-action.php:6-8)
		// When timeline is disabled, follow actions should not render
		$timeline_enabled = (bool) \Voxel\get( 'settings.timeline.enabled', true );

		// Calculate follow status (follow-post-action.php:13-22)
		$is_followed = false;
		$is_follow_requested = false;
		if ( $timeline_enabled && $is_logged_in && $current_user ) {
			$status = $current_user->get_follow_status( 'post', $post->get_id() );
			$is_followed = $status === \Voxel\FOLLOW_ACCEPTED;
			$is_follow_requested = $status === \Voxel\FOLLOW_REQUESTED;
		}

		// Calculate author follow status (follow-user-action.php:10-14)
		$is_author_followed = false;
		$is_author_follow_requested = false;
		$author = $post->get_author();
		$author_id = $author ? $author->get_id() : null;
		if ( $timeline_enabled && $is_logged_in && $current_user && $author_id ) {
			$status = $current_user->get_follow_status( 'user', $author_id );
			$is_author_followed = $status === \Voxel\FOLLOW_ACCEPTED;
			$is_author_follow_requested = $status === \Voxel\FOLLOW_REQUESTED;
		}

		// Calculate edit link and steps (edit-post-action.php:11-13)
		$edit_link = null;
		$is_editable = false;
		$edit_steps = [];

		if ( $post->is_editable_by_current_user() ) {
			$is_editable = true;
			$edit_link = $post->get_edit_link();

			// Get ui-step fields for multi-step edit menu (edit-post-action.php:11-13)
			$step_fields = array_filter( $post->get_fields(), function( $field ) {
				return $field->get_type() === 'ui-step' && $field->passes_visibility_rules();
			} );

			if ( count( $step_fields ) > 1 ) {
				foreach ( $step_fields as $field ) {
					$edit_steps[] = [
						'key' => $field->get_key(),
						'label' => $field->get_label(),
						'link' => add_query_arg( 'step', $field->get_key(), $edit_link ),
					];
				}
			} else {
				// Single step - just use the edit link
				$edit_steps = [
					[ 'key' => 'general', 'label' => 'Edit post', 'link' => $edit_link ]
				];
			}
		}

		// Calculate delete permission (delete-post-action.php:3)
		$can_delete = $post->is_deletable_by_current_user();

		// Calculate publish/unpublish permission & status
		$can_publish = $post->is_editable_by_current_user();
		$post_status = $post->get_status();

		// Product data for add_to_cart action (add-to-cart-action.php:6-20)
		$product_data = null;
		$product_field = $post->get_field( 'product' );
		if ( $product_field && $product_field->get_type() === 'product' ) {
			try {
				// Check validity (e.g. is purchasable)
				// Wrap in OB to prevent any accidental output from Voxel corrupting JSON
				ob_start();
				$product_field->check_product_form_validity();
				ob_end_clean();

				$product_data = [
					'isEnabled' => true,
					'oneClick' => $product_field->supports_one_click_add_to_cart(),
					'productId' => $post->get_id(),
				];
			} catch ( \Exception $e ) {
				$product_data = [ 'isEnabled' => false, 'error' => $e->getMessage() ];
			}
		}

		// Location data for show_post_on_map action (show-post-on-map.php:7-21)
		$location_data = null;
		$location_field = $post->get_field( 'location' );
		if ( $location_field ) {
			$location = $location_field->get_value();
			if ( is_numeric( $location['latitude'] ?? null ) && is_numeric( $location['longitude'] ?? null ) ) {
				// Build the map link with location filter (show-post-on-map.php:14-21)
				$map_link = null;
				$post_type = $post->get_post_type();
				if ( $post_type ) {
					foreach ( $post_type->get_filters() as $filter ) {
						if ( $filter->get_type() === 'location' ) {
							$map_link = add_query_arg( [
								'type' => $post_type->get_key(),
								$filter->get_key() => sprintf(
									'%s;%s,%s,%s',
									$location['address'] ?? '',
									$location['latitude'],
									$location['longitude'],
									12
								),
							], $post_type->get_archive_link() );
							break;
						}
					}
				}

				$location_data = [
					'latitude' => $location['latitude'],
					'longitude' => $location['longitude'],
					'address' => $location['address'] ?? '',
					'mapLink' => $map_link,
				];
			}
		}

		// View post stats link (view-post-stats-action.php:3-8)
		$post_stats_link = null;
		$post_type = $post->get_post_type();
		if ( $is_editable && $post_type && $post_type->is_tracking_enabled() ) {
			$stats_template = \Voxel\get( 'templates.post_stats' );
			if ( $stats_template ) {
				$post_stats_link = add_query_arg( 'post_id', $post->get_id(), get_permalink( $stats_template ) );
			}
		}

		// Promote post data (promote-post-action.php:6-33)
		$promote_data = null;
		if ( $is_logged_in && $post ) {
			ob_start();
			$is_promotable = $post->promotions->is_promotable_by_user( \Voxel\get_current_user() );
			ob_end_clean();

			if ( $is_promotable ) {
				$active_package = $post->promotions->get_active_package();

				if ( $active_package && is_numeric( $active_package['order_id'] ?? null ) ) {
					// Active promotion - link to order
					$orders_template = \Voxel\get( 'templates.orders' );
					$promote_data = [
						'isPromotable' => true,
						'isActive' => true,
						'orderLink' => add_query_arg(
							'order_id',
							$active_package['order_id'],
							get_permalink( $orders_template ) ?: home_url('/')
						),
					];
				} else {
					// Can promote - link to checkout
					$checkout_template = \Voxel\get( 'templates.checkout' );
					$promote_data = [
						'isPromotable' => true,
						'isActive' => false,
						'promoteLink' => add_query_arg( [
							'screen' => 'promote',
							'post_id' => $post->get_id(),
						], get_permalink( $checkout_template ) ?: home_url('/') ),
					];
				}
			} else {
				$promote_data = [ 'isPromotable' => false ];
			}
		}

		$data = [
			'postId' => $post->get_id(),
			'postTitle' => $post->get_title(),
			'postLink' => $post->get_link(),
			'editLink' => $edit_link,
			'isEditable' => $is_editable,
			'timelineEnabled' => $timeline_enabled,
			'isFollowed' => $is_followed,
			'isFollowRequested' => $is_follow_requested,
			'isAuthorFollowed' => $is_author_followed,
			'isAuthorFollowRequested' => $is_author_follow_requested,
			'authorId' => $author_id,
			'editSteps' => $edit_steps,

			// Permissions
			'permissions' => [
				'delete' => $can_delete,
				'publish' => $can_publish,
			],
			'status' => $post_status,

			// Action-specific data
			'product' => $product_data,
			'location' => $location_data,
			'postStatsLink' => $post_stats_link,
			'promote' => $promote_data,

			// Nonces for AJAX actions
			'nonces' => [
				'follow' => wp_create_nonce( 'vx_user_follow' ),
				'delete_post' => wp_create_nonce( 'vx_delete_post' ),
				'modify_post' => wp_create_nonce( 'vx_modify_post' ),
			],

			// Confirmation messages (for data-confirm attribute parity)
			'confirmMessages' => [
				'delete' => _x( 'Are you sure?', 'delete post action', 'voxel' ),
			],
		];

		return new \WP_REST_Response( $data );
	}

}
