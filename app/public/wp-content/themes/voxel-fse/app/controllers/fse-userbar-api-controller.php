<?php
/**
 * FSE Userbar API Controller
 *
 * Provides REST API endpoints and server-side config injection for the Userbar block.
 * Implements 1:1 parity with Voxel's user-bar.php widget data injection.
 *
 * PARITY EVIDENCE:
 * - Voxel templates: themes/voxel/templates/widgets/user-bar/*.php
 * - notifications.php:3-7: l10n config
 * - messages.php:1-3: nonce for vx_chat
 * - cart.php:3-6: nonce for vx_cart, is_cart_empty flag
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Userbar_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const REST_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
		$this->on( 'wp_enqueue_scripts', '@enqueue_userbar_config', 20 );
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes(): void {
		// User bar context - provides all config needed for hydration
		register_rest_route( self::REST_NAMESPACE, '/userbar/context', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_userbar_context' ],
			'permission_callback' => '__return_true', // Public endpoint, data visibility handled internally
		] );

		// User data endpoint
		register_rest_route( self::REST_NAMESPACE, '/userbar/user', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_user_data' ],
			'permission_callback' => '__return_true',
		] );
	}

	/**
	 * Get complete userbar context
	 *
	 * Returns all data needed for React hydration:
	 * - Nonces for AJAX actions
	 * - Initial unread states
	 * - User data (if logged in)
	 * - l10n strings
	 *
	 * PARITY with Voxel data-config attributes:
	 * - notifications.php:3-7
	 * - messages.php:1-3
	 * - cart.php:3-6
	 */
	public function get_userbar_context(): \WP_REST_Response {
		$data = $this->build_userbar_context();
		return new \WP_REST_Response( $data, 200 );
	}

	/**
	 * Get user data
	 *
	 * Returns current user info for avatar/menu display
	 *
	 * PARITY with:
	 * - user-bar.php:19: $user = \Voxel\current_user()
	 * - user-bar.php:24: $user->get_avatar_markup()
	 * - user-bar.php:26: $user->get_display_name()
	 */
	public function get_user_data(): \WP_REST_Response {
		if ( ! is_user_logged_in() ) {
			return new \WP_REST_Response( [
				'success' => true,
				'isLoggedIn' => false,
				'user' => null,
			], 200 );
		}

		$user = \Voxel\current_user();
		if ( ! $user ) {
			return new \WP_REST_Response( [
				'success' => true,
				'isLoggedIn' => true,
				'user' => null,
			], 200 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'isLoggedIn' => true,
			'user' => [
				'id' => $user->get_id(),
				'displayName' => $user->get_display_name(),
				'avatarUrl' => $user->get_avatar_url(),
				'avatarMarkup' => $user->get_avatar_markup(),
			],
		], 200 );
	}

	/**
	 * Build complete userbar context array
	 *
	 * Consolidates all server-side data needed by React components
	 *
	 * @return array
	 */
	private function build_userbar_context(): array {
		$is_logged_in = is_user_logged_in();
		$current_user_id = get_current_user_id();

		// Build context matching Voxel's data-config patterns
		$context = [
			'isLoggedIn' => $is_logged_in,

			// Nonces - CRITICAL for AJAX actions
			// Reference: messages.php:2, cart.php:4
			'nonces' => [
				'chat' => wp_create_nonce( 'vx_chat' ),
				'cart' => wp_create_nonce( 'vx_cart' ),
			],

			// Cart state - Reference: cart.php:5
			// is_cart_empty is true if user not logged in OR no cart metadata
			'isCartEmpty' => ! $is_logged_in || ! metadata_exists( 'user', $current_user_id, 'voxel:cart' ),

			// Unread indicators - MUST match Voxel's server-side checks
			'unread' => [
				'notifications' => 0,
				'messages' => false,
			],

			// User data for avatar display
			'user' => null,

			// l10n strings - Reference: notifications.php:4-6
			'l10n' => [
				'confirmClear' => _x( 'Clear all notifications?', 'notifications', 'voxel' ),
				'noNotifications' => _x( 'No notifications received', 'notifications', 'voxel' ),
				'noChats' => _x( 'No chats available', 'messages', 'voxel' ),
				'noCartItems' => _x( 'No items added to cart', 'cart', 'voxel' ),
				'loadMore' => __( 'Load more', 'voxel' ),
				'subtotal' => _x( 'Subtotal', 'cart summary', 'voxel' ),
				'free' => _x( 'Free', 'cart summary', 'voxel' ),
				'continue' => __( 'Continue', 'voxel' ),
			],

			// Template links
			'templates' => [
				'inbox' => get_permalink( \Voxel\get( 'templates.inbox' ) ) ?: home_url( '/' ),
			],
		];

		// Add logged-in user specific data
		if ( $is_logged_in ) {
			$voxel_user = \Voxel\current_user();

			if ( $voxel_user ) {
				// Notification count - Reference: notifications.php:12
				// \Voxel\current_user()->get_notification_count()['unread']
				ob_start();
				$notification_count = $voxel_user->get_notification_count();
				ob_end_clean();
				$context['unread']['notifications'] = $notification_count['unread'] ?? 0;

				// Inbox unread - Reference: messages.php:7
				// \Voxel\current_user()->get_inbox_meta()['unread']
				ob_start();
				$inbox_meta = $voxel_user->get_inbox_meta();
				ob_end_clean();
				$context['unread']['messages'] = ! empty( $inbox_meta['unread'] );

				// User data for user_menu component
				// Reference: user-bar.php:19-26
				$context['user'] = [
					'id' => $voxel_user->get_id(),
					'displayName' => $voxel_user->get_display_name(),
					'avatarUrl' => $voxel_user->get_avatar_url(),
					'avatarMarkup' => $voxel_user->get_avatar_markup(),
				];
			}
		}

		return $context;
	}

	/**
	 * Enqueue userbar configuration as inline script
	 *
	 * This injects the server-side context into the page so React
	 * can hydrate without making additional API calls.
	 *
	 * PARITY: This replaces Voxel's data-config attributes on each
	 * component element with a single global config object.
	 */
	public function enqueue_userbar_config(): void {
		// Only on frontend
		if ( is_admin() ) {
			return;
		}

		// Build and output the config
		$config = $this->build_userbar_context();

		// Inject as global variable before the frontend script
		// This will be available as window.VoxelFSEUserbar
		$script = 'window.VoxelFSEUserbar = ' . wp_json_encode( $config ) . ';';

		// Also inject user data as window.VoxelFSEUser for compatibility
		if ( $config['user'] ) {
			$script .= "\n" . 'window.VoxelFSEUser = ' . wp_json_encode( [
				'isLoggedIn' => true,
				'id' => $config['user']['id'],
				'displayName' => $config['user']['displayName'],
				'avatarUrl' => $config['user']['avatarUrl'],
				'avatarMarkup' => $config['user']['avatarMarkup'],
			] ) . ';';
		} else {
			$script .= "\n" . 'window.VoxelFSEUser = { isLoggedIn: false };';
		}

		// Output in wp_head with high priority to ensure it loads before React
		add_action( 'wp_head', function() use ( $script ) {
			echo '<script id="voxel-fse-userbar-config">' . $script . '</script>';
		}, 1 );
	}
}
