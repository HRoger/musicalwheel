<?php
/**
 * FSE Messages API Controller
 *
 * Provides REST API endpoints for the Messages block.
 * Handles configuration data that the frontend needs for hydration.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/modules/direct-messages/widgets/messages-widget.php
 * - Config structure from render() method
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Messages_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const API_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
		$this->on( 'wp_enqueue_scripts', '@enqueue_config' );
	}

	/**
	 * Register REST API routes
	 */
	public function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/messages/config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_config' ],
			'permission_callback' => [ $this, 'check_permission' ],
		] );
	}

	/**
	 * Check permission - must be logged in
	 */
	public function check_permission(): bool {
		return is_user_logged_in();
	}

	/**
	 * Get messages configuration
	 *
	 * Returns the same config structure as Voxel's messages widget
	 */
	public function get_config(): \WP_REST_Response {
		$config = $this->build_config();
		return new \WP_REST_Response( $config, 200 );
	}

	/**
	 * Build messages configuration
	 *
	 * Matches Voxel's messages-widget.php render() method config
	 */
	private function build_config(): array {
		$config = [
			'user' => [
				'id' => get_current_user_id(),
			],
			'polling' => [
				'enabled'   => $this->get_voxel_setting( 'settings.messages.enable_real_time', true ),
				'url'       => trailingslashit( get_template_directory_uri() ) . 'app/modules/direct-messages/check-activity.php',
				'frequency' => 1000, // ms
			],
			'seen_badge' => [
				'enabled' => $this->get_voxel_setting( 'settings.messages.enable_seen', true ),
			],
			'emojis' => [
				'url' => trailingslashit( get_template_directory_uri() ) . 'assets/vendor/emoji-list/emoji-list.json?v=' . $this->get_assets_version(),
			],
			'nonce' => wp_create_nonce( 'vx_chat' ),
			'files' => [
				'enabled'            => $this->get_voxel_setting( 'settings.messages.files.enabled', true ),
				'allowed_file_types' => $this->get_voxel_setting( 'settings.messages.files.allowed_file_types' ),
				'max_size'           => $this->get_voxel_setting( 'settings.messages.files.max_size' ),
				'max_count'          => $this->get_voxel_setting( 'settings.messages.files.max_count' ),
			],
			'l10n' => [
				'emoji_groups' => [
					'Smileys & Emotion' => _x( 'Smileys & Emotion', 'emoji popup', 'voxel' ),
					'People & Body'     => _x( 'People & Body', 'emoji popup', 'voxel' ),
					'Animals & Nature'  => _x( 'Animals & Nature', 'emoji popup', 'voxel' ),
					'Food & Drink'      => _x( 'Food & Drink', 'emoji popup', 'voxel' ),
					'Travel & Places'   => _x( 'Travel & Places', 'emoji popup', 'voxel' ),
					'Activities'        => _x( 'Activities', 'emoji popup', 'voxel' ),
					'Objects'           => _x( 'Objects', 'emoji popup', 'voxel' ),
				],
			],
			'blur_on_send' => apply_filters( 'voxel/direct-messages/blur-on-send', false ),
		];

		return $config;
	}

	/**
	 * Get Voxel setting
	 *
	 * @param string $key Setting key in dot notation
	 * @param mixed $default Default value
	 * @return mixed
	 */
	private function get_voxel_setting( string $key, $default = null ) {
		// Try Voxel's get() function if available
		if ( function_exists( '\\Voxel\\get' ) ) {
			return \Voxel\get( $key, $default );
		}

		// Fallback to default
		return $default;
	}

	/**
	 * Get assets version
	 *
	 * @return string
	 */
	private function get_assets_version(): string {
		if ( function_exists( '\\Voxel\\get_assets_version' ) ) {
			return \Voxel\get_assets_version();
		}
		return '1.0.0';
	}

	/**
	 * Enqueue messages config as inline script
	 *
	 * This makes the config available to the frontend without an API call
	 */
	public function enqueue_config() {
		// Only on frontend, for logged-in users
		if ( is_admin() || ! is_user_logged_in() ) {
			return;
		}

		// Check if messages block is on the page
		// We'll add the config globally for simplicity
		$config = $this->build_config();

		wp_add_inline_script(
			'voxel-fse-messages-frontend',
			'window.voxelMessagesConfig = ' . wp_json_encode( $config ) . ';',
			'before'
		);
	}
}
