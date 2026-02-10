<?php
/**
 * Navbar REST API Controller
 *
 * Provides REST API endpoints for the Navbar FSE block.
 * Used to fetch WordPress menus and menu items for headless rendering.
 *
 * Evidence:
 * - Voxel walker: themes/voxel/app/utils/nav-menu-walker.php
 * - Menu items include icons stored in _voxel_item_icon meta
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Navbar_API_Controller extends FSE_Base_Controller {

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
		$namespace = 'voxel-fse/v1';

		// Test endpoint for debugging
		register_rest_route( $namespace, '/navbar/test', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'test_endpoint' ],
			'permission_callback' => '__return_true',
		] );

		// Endpoint: /wp-json/voxel-fse/v1/navbar/locations
		// Public access: Menu locations are not sensitive data
		register_rest_route( $namespace, '/navbar/locations', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_menu_locations' ],
			'permission_callback' => '__return_true', // Public - needed for Plan C+ frontend
		] );

		// Endpoint: /wp-json/voxel-fse/v1/navbar/menu
		// Public access: Menu items are displayed on public pages
		register_rest_route( $namespace, '/navbar/menu', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_menu_items' ],
			'permission_callback' => '__return_true', // Public - needed for Plan C+ frontend
			'args'                => [
				'location' => [
					'required'          => false, // Changed to false to prevent 400 errors
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );
	}

	/**
	 * Test endpoint for debugging
	 *
	 * @return \WP_REST_Response
	 */
	public function test_endpoint(): \WP_REST_Response {
		return rest_ensure_response( [
			'success'   => true,
			'message'   => 'Navbar API is working',
			'locations' => array_keys( get_registered_nav_menus() ),
		] );
	}

	/**
	 * Get registered menu locations
	 *
	 * @return \WP_REST_Response
	 */
	public function get_menu_locations(): \WP_REST_Response {
		$nav_menus = get_registered_nav_menus();
		$locations = [];

		foreach ( $nav_menus as $slug => $name ) {
			$locations[] = [
				'slug'        => $slug,
				'name'        => $name,
				'description' => '',
			];
		}

		return rest_ensure_response( [
			'locations' => $locations,
		] );
	}

	/**
	 * Get menu items for a location
	 *
	 * @param \WP_REST_Request $request REST request object
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_menu_items( \WP_REST_Request $request ) {
		$location = $request->get_param( 'location' );
		return rest_ensure_response( self::generate_menu_items( $location ?? '' ) );
	}

	/**
	 * Generate menu items data (reusable from REST and render_block)
	 *
	 * @param string $location Menu location slug.
	 * @return array NavbarMenuApiResponse data.
	 */
	public static function generate_menu_items( string $location ): array {
		if ( empty( $location ) ) {
			return [
				'menuLocation' => '',
				'menuName'     => '',
				'items'        => [],
				'message'      => 'No menu location specified',
			];
		}

		$menu_locations = get_nav_menu_locations();

		if ( ! isset( $menu_locations[ $location ] ) ) {
			return [
				'menuLocation' => $location,
				'menuName'     => '',
				'items'        => [],
				'message'      => sprintf( 'Menu location "%s" not found or has no menu assigned.', $location ),
			];
		}

		$menu_id = $menu_locations[ $location ];
		$menu = wp_get_nav_menu_object( $menu_id );

		if ( ! $menu ) {
			return [
				'menuLocation' => $location,
				'menuName'     => '',
				'items'        => [],
				'message'      => 'Menu not found for this location.',
			];
		}

		$menu_items = wp_get_nav_menu_items( $menu->term_id, [
			'order'                  => 'ASC',
			'orderby'                => 'menu_order',
			'nopaging'               => true,
			'update_post_term_cache' => false,
		] );

		if ( ! $menu_items ) {
			return [
				'menuLocation' => $location,
				'menuName'     => $menu->name,
				'items'        => [],
			];
		}

		$items = self::build_menu_tree( $menu_items );

		return [
			'menuLocation' => $location,
			'menuName'     => $menu->name,
			'items'        => $items,
		];
	}

	/**
	 * Build hierarchical menu tree from flat menu items
	 *
	 * @param array $menu_items Flat array of menu items
	 * @return array Hierarchical menu structure
	 */
	private static function build_menu_tree( array $menu_items ): array {
		// First pass: create a map of all items by ID
		$items_by_id = [];
		$root_items = [];

		foreach ( $menu_items as $item ) {
			$item_data = self::format_menu_item( $item );
			$items_by_id[ $item->ID ] = $item_data;
		}

		// Second pass: build the tree structure
		foreach ( $menu_items as $item ) {
			$parent_id = (int) $item->menu_item_parent;

			if ( $parent_id === 0 ) {
				// This is a root item
				$root_items[] = &$items_by_id[ $item->ID ];
			} else {
				// This is a child item
				if ( isset( $items_by_id[ $parent_id ] ) ) {
					$items_by_id[ $parent_id ]['children'][] = &$items_by_id[ $item->ID ];
					$items_by_id[ $parent_id ]['hasChildren'] = true;
				}
			}
		}

		return $root_items;
	}

	/**
	 * Format a menu item for API response
	 *
	 * Evidence: Matches Voxel's nav-menu-walker.php structure
	 * - Line 116: $atts['title'] = ! empty( $item->attr_title ) ? $item->attr_title : '';
	 * - Lines 118-122: rel attribute logic for _blank targets
	 * - Line 124: $atts['aria-current'] = $item->current ? 'page' : '';
	 *
	 * @param \WP_Post $item Menu item post object
	 * @return array Formatted menu item
	 */
	private static function format_menu_item( \WP_Post $item ): array {
		// Get icon from meta (Voxel stores icons in _voxel_item_icon)
		$icon_string = get_post_meta( $item->ID, '_voxel_item_icon', true );
		$icon_markup = '';

		if ( ! empty( $icon_string ) ) {
			// Use Voxel's icon markup if available
			if ( function_exists( '\Voxel\get_icon_markup' ) ) {
				$icon_markup = \Voxel\get_icon_markup( $icon_string );
			} elseif ( class_exists( '\VoxelFSE\Utils\Icon_Processor' ) ) {
				// Fallback to FSE Icon Processor
				$icon_markup = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $icon_string );
			}
		}

		// Get CSS classes
		$classes = empty( $item->classes ) ? [] : array_filter( (array) $item->classes );

		// Check if current (matches Voxel walker line 124)
		$is_current = in_array( 'current-menu-item', $classes, true ) ||
		              in_array( 'current-menu-parent', $classes, true ) ||
		              in_array( 'current-menu-ancestor', $classes, true );

		// Build rel attribute (matches Voxel walker lines 118-122)
		// Security: External links opened in new tabs should have rel="noopener"
		$rel = '';
		if ( '_blank' === $item->target && empty( $item->xfn ) ) {
			$rel = 'noopener';
		} elseif ( ! empty( $item->xfn ) ) {
			$rel = $item->xfn;
		}

		return [
			'id'          => (int) $item->ID,
			'title'       => apply_filters( 'the_title', $item->title, $item->ID ),
			'attrTitle'   => ! empty( $item->attr_title ) ? $item->attr_title : '', // Voxel walker line 116
			'url'         => ! empty( $item->url ) ? esc_url( $item->url ) : '#',
			'target'      => ! empty( $item->target ) ? $item->target : '',
			'rel'         => $rel, // Voxel walker lines 118-122
			'icon'        => $icon_markup,
			'classes'     => $classes,
			'isCurrent'   => $is_current,
			'hasChildren' => false,
			'children'    => [],
		];
	}

}
