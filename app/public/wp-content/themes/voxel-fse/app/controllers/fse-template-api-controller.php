<?php
/**
 * FSE Template API Controller
 *
 * TEMPLATE FILE - Copy this when creating a new FSE block controller.
 *
 * ============================================================================
 * WHEN TO CREATE AN FSE CONTROLLER:
 * ============================================================================
 *
 * Create an FSE controller when your block needs:
 * 1. Server-side config gathering (settings, permissions, user context)
 * 2. Nonce generation for Voxel AJAX calls
 * 3. Data transformation for React (normalize arrays/objects)
 * 4. User-specific data that varies per request
 *
 * DO NOT create an FSE controller for:
 * - Complex data operations (use Voxel AJAX directly)
 * - Real-time data like messages, notifications (use Voxel AJAX)
 * - Heavy queries like timeline feeds, post feeds (use Voxel AJAX)
 *
 * ============================================================================
 * THE TWO-CALL PATTERN:
 * ============================================================================
 *
 * 1. CONFIG LOAD (on mount) - This FSE REST Controller
 *    GET /wp-json/voxel-fse/v1/{block}/config
 *    Returns: nonces, settings, user-specific data
 *    Called: Once per page load
 *
 * 2. DATA LOAD (on demand) - Voxel AJAX Directly
 *    POST /?vx=1&action={voxel_action}
 *    Returns: Messages, posts, search results
 *    Called: On user interaction, pagination
 *
 * ============================================================================
 * USAGE:
 * ============================================================================
 *
 * 1. Copy this file to: fse-{your-block}-api-controller.php
 * 2. Rename class to: FSE_{YourBlock}_API_Controller
 * 3. Update const BLOCK_SLUG to your block slug
 * 4. Update API_VERSION if needed
 * 5. Implement build_config() with your block's config
 * 6. Add to functions.php initialization
 *
 * ============================================================================
 * EVIDENCE (Update these for your block):
 * ============================================================================
 *
 * - Voxel widget: themes/voxel/app/widgets/{widget-name}.php
 * - Voxel controller: themes/voxel/app/controllers/frontend/{controller}.php
 * - Config structure: from widget render() method or controller
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Template API Controller for FSE Blocks
 *
 * Provides REST API endpoints for block configuration.
 * Handles server-side data gathering that React blocks need.
 */
class FSE_Template_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 * All FSE controllers use this namespace
	 */
	const API_NAMESPACE = 'voxel-fse/v1';

	/**
	 * API version for cache busting
	 */
	const API_VERSION = '1.0.0';

	/**
	 * Block slug - used in route and script handle
	 * CHANGE THIS for your block
	 */
	const BLOCK_SLUG = 'template';

	/**
	 * Register hooks
	 *
	 * Uses parent's on() helper for protected method callbacks.
	 * The '@' prefix allows calling protected methods as callbacks.
	 */
	protected function hooks(): void {
		// Register REST API routes
		$this->on( 'rest_api_init', '@register_routes' );

		// Optionally enqueue config as inline script (for eager loading)
		// Uncomment if you want config available without API call:
		// $this->on( 'wp_enqueue_scripts', '@enqueue_config' );
	}

	/**
	 * Authorization check
	 *
	 * Override to restrict when this controller loads.
	 * Return false to disable controller entirely.
	 *
	 * @return bool
	 */
	protected function authorize(): bool {
		// Load only if Voxel parent theme is active
		return function_exists( '\\Voxel\\get' );
	}

	/**
	 * Register REST API routes
	 *
	 * Standard routes:
	 * - GET /config - Block configuration and settings
	 * - GET /context - Optional: Post/user specific context
	 */
	public function register_routes(): void {
		// Main config endpoint
		register_rest_route( self::API_NAMESPACE, '/' . self::BLOCK_SLUG . '/config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_config' ],
			'permission_callback' => [ $this, 'permission_public' ],
		] );

		// Optional: Post-context endpoint (for blocks that need post-specific data)
		// Uncomment if needed:
		// register_rest_route( self::API_NAMESPACE, '/' . self::BLOCK_SLUG . '/context', [
		// 	'methods'             => 'GET',
		// 	'callback'            => [ $this, 'get_context' ],
		// 	'permission_callback' => [ $this, 'permission_public' ],
		// 	'args'                => [
		// 		'post_id' => [
		// 			'required'          => true,
		// 			'type'              => 'integer',
		// 			'sanitize_callback' => 'absint',
		// 		],
		// 	],
		// ] );
	}

	// =========================================================================
	// PERMISSION CALLBACKS
	// =========================================================================

	/**
	 * Public permission - anyone can access
	 *
	 * @return bool
	 */
	public function permission_public(): bool {
		return true;
	}

	/**
	 * Logged-in user permission
	 *
	 * @return bool
	 */
	public function permission_logged_in(): bool {
		return is_user_logged_in();
	}

	/**
	 * Admin permission
	 *
	 * @return bool
	 */
	public function permission_admin(): bool {
		return current_user_can( 'manage_options' );
	}

	// =========================================================================
	// ENDPOINT HANDLERS
	// =========================================================================

	/**
	 * Get block configuration
	 *
	 * This is the main endpoint that blocks call on mount.
	 * Returns all config needed for the React component.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function get_config( \WP_REST_Request $request ): \WP_REST_Response {
		// Prevent Voxel output from corrupting JSON
		ob_start();

		try {
			$config = $this->build_config();

			// Clean any output that might have been generated
			ob_end_clean();

			return new \WP_REST_Response( [
				'success' => true,
				'data'    => $config,
				'version' => self::API_VERSION,
			], 200 );

		} catch ( \Exception $e ) {
			ob_end_clean();

			return new \WP_REST_Response( [
				'success' => false,
				'message' => $e->getMessage(),
				'code'    => $e->getCode(),
			], 400 );
		}
	}

	/**
	 * Get post-specific context
	 *
	 * Optional endpoint for blocks that need data specific to a post.
	 * Uncomment the route registration above to enable.
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return \WP_REST_Response
	 */
	public function get_context( \WP_REST_Request $request ): \WP_REST_Response {
		ob_start();

		try {
			$post_id = $request->get_param( 'post_id' );
			$post = get_post( $post_id );

			if ( ! $post ) {
				throw new \Exception( 'Post not found', 404 );
			}

			$context = $this->build_context( $post );
			ob_end_clean();

			return new \WP_REST_Response( [
				'success' => true,
				'data'    => $context,
			], 200 );

		} catch ( \Exception $e ) {
			ob_end_clean();

			return new \WP_REST_Response( [
				'success' => false,
				'message' => $e->getMessage(),
				'code'    => $e->getCode(),
			], $e->getCode() ?: 400 );
		}
	}

	// =========================================================================
	// CONFIG BUILDERS
	// =========================================================================

	/**
	 * Build block configuration
	 *
	 * CUSTOMIZE THIS METHOD for your block.
	 *
	 * Standard config structure:
	 * - nonces: For Voxel AJAX calls
	 * - settings: From Voxel settings
	 * - user: Current user context (if logged in)
	 * - l10n: Translatable strings
	 * - urls: API endpoints, asset URLs
	 *
	 * @return array
	 */
	private function build_config(): array {
		$config = [
			// Nonces for Voxel AJAX calls
			// Find the correct nonce action in Voxel's controller
			'nonces' => [
				'vx_nonce' => wp_create_nonce( 'vx_nonce' ),
				// Add more nonces as needed:
				// 'vx_action' => wp_create_nonce( 'vx_action_name' ),
			],

			// Settings from Voxel
			'settings' => [
				'feature_enabled' => $this->get_voxel_setting( 'settings.feature.enabled', true ),
				// Add more settings as needed
			],

			// Current user context (if logged in)
			'user' => $this->get_user_context(),

			// Translatable strings
			'l10n' => [
				'loading'      => __( 'Loading...', 'voxel' ),
				'error'        => __( 'An error occurred', 'voxel' ),
				'empty_state'  => __( 'No items found', 'voxel' ),
				// Add more strings as needed
			],

			// URLs and endpoints
			'urls' => [
				'ajax' => home_url( '/?vx=1' ), // Voxel AJAX base URL
				'rest' => rest_url( self::API_NAMESPACE . '/' . self::BLOCK_SLUG ),
			],
		];

		// Allow filtering the config
		return apply_filters( 'voxel_fse_' . self::BLOCK_SLUG . '_config', $config );
	}

	/**
	 * Build post-specific context
	 *
	 * CUSTOMIZE THIS METHOD if you enabled the context endpoint.
	 *
	 * @param \WP_Post $post The post object.
	 * @return array
	 */
	private function build_context( \WP_Post $post ): array {
		// Get Voxel post if available
		$voxel_post = null;
		if ( class_exists( '\\Voxel\\Post' ) ) {
			$voxel_post = \Voxel\Post::get( $post );
		}

		return [
			'post_id'    => $post->ID,
			'post_type'  => $post->post_type,
			'post_title' => $post->post_title,

			// Add permissions if needed
			'permissions' => [
				'can_edit' => current_user_can( 'edit_post', $post->ID ),
				// Add more permissions
			],

			// Add actions/links if needed
			'actions' => [
				'edit_url' => current_user_can( 'edit_post', $post->ID )
					? get_edit_post_link( $post->ID, 'raw' )
					: null,
			],
		];
	}

	/**
	 * Get current user context
	 *
	 * @return array|null
	 */
	private function get_user_context(): ?array {
		if ( ! is_user_logged_in() ) {
			return null;
		}

		$user_id = get_current_user_id();

		return [
			'id'           => $user_id,
			'display_name' => wp_get_current_user()->display_name,
			'is_admin'     => current_user_can( 'manage_options' ),
		];
	}

	// =========================================================================
	// HELPER METHODS
	// =========================================================================

	/**
	 * Get Voxel setting
	 *
	 * Safely retrieves a setting from Voxel's settings system.
	 *
	 * @param string $key Setting key in dot notation (e.g., 'settings.feature.enabled').
	 * @param mixed $default Default value if setting not found.
	 * @return mixed
	 */
	private function get_voxel_setting( string $key, $default = null ) {
		if ( function_exists( '\\Voxel\\get' ) ) {
			return \Voxel\get( $key, $default );
		}
		return $default;
	}

	/**
	 * Get Voxel assets version
	 *
	 * @return string
	 */
	private function get_assets_version(): string {
		if ( function_exists( '\\Voxel\\get_assets_version' ) ) {
			return \Voxel\get_assets_version();
		}
		return self::API_VERSION;
	}

	/**
	 * Normalize addons config
	 *
	 * Voxel sometimes returns addons/config as an OBJECT (keyed by ID),
	 * not an array. This normalizes it for React.
	 *
	 * @param mixed $addons The addons config.
	 * @return array
	 */
	private function normalize_addons( $addons ): array {
		if ( empty( $addons ) ) {
			return [];
		}

		if ( is_array( $addons ) && array_is_list( $addons ) ) {
			return $addons;
		}

		// Convert object/associative array to indexed array
		$normalized = [];
		foreach ( (array) $addons as $key => $addon ) {
			$addon['key'] = $addon['key'] ?? $key;
			$normalized[] = $addon;
		}

		return $normalized;
	}

	// =========================================================================
	// EAGER LOADING (OPTIONAL)
	// =========================================================================

	/**
	 * Enqueue config as inline script
	 *
	 * This makes the config available immediately without an API call.
	 * Enable by uncommenting the hook in hooks() method.
	 *
	 * Pros: Faster initial render (no API call needed)
	 * Cons: Increases page size, config might be stale
	 */
	public function enqueue_config(): void {
		// Only on frontend
		if ( is_admin() ) {
			return;
		}

		// Check if block is on the page (optional optimization)
		// if ( ! has_block( 'voxel-fse/' . self::BLOCK_SLUG ) ) {
		// 	return;
		// }

		$config = $this->build_config();

		// Add config to window object
		$script_handle = 'voxel-fse-' . self::BLOCK_SLUG . '-frontend';
		wp_add_inline_script(
			$script_handle,
			'window.voxelFse' . ucfirst( self::BLOCK_SLUG ) . 'Config = ' . wp_json_encode( $config ) . ';',
			'before'
		);
	}
}
