<?php
/**
 * FSE Admin Icon Picker Controller
 *
 * Loads Voxel's icon picker on WordPress admin pages that need it:
 * - Taxonomy screens (edit-tags.php, term.php)
 * - Nav Menus screen (nav-menus.php)
 *
 * @package VoxelFSE
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * FSE Admin Icon Picker Controller
 *
 * Handles loading Voxel's icon picker on admin screens that need it.
 * Covers taxonomy pages (edit-tags, term) and nav menus (nav-menus).
 */
class FSE_Taxonomy_Icon_Picker_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks for icon picker functionality
	 */
	protected function hooks(): void {
		$this->on( 'admin_footer', '@load_icon_picker_on_admin_pages', 50 );
	}

	/**
	 * Load icon picker on admin pages that need it
	 *
	 * Screens: edit-tags, term (taxonomy pages), nav-menus (menu editor)
	 */
	public function load_icon_picker_on_admin_pages() {
		$screen = get_current_screen();
		if ( ! $screen ) {
			return;
		}

		// Allow taxonomy screens and nav-menus screen
		$is_taxonomy_screen = in_array( $screen->base, [ 'term', 'edit-tags' ], true ) && taxonomy_exists( $screen->taxonomy );
		$is_nav_menus_screen = $screen->base === 'nav-menus';

		if ( ! $is_taxonomy_screen && ! $is_nav_menus_screen ) {
			return;
		}

		// Check if icon picker was already loaded (avoid duplicates)
		static $icon_picker_loaded = false;
		if ( $icon_picker_loaded ) {
			return;
		}

		// Check if icon picker config already exists (loaded by Elementor controller)
		// Elementor's hook runs at priority 100, so if it already ran, skip
		if ( ! isset( $GLOBALS['voxel_icon_picker_loaded'] ) ) {
			// Get icon config - try Elementor first, fallback to Line Awesome config
			$config = [];
			if ( class_exists( '\Elementor\Plugin' ) ) {
				$config = \Elementor\Icons_Manager::get_icon_manager_tabs();
			} else {
				// Fallback: Build config with Line Awesome if enabled
				// Evidence: themes/voxel/app/modules/elementor/controllers/elementor-controller.php:237-280
				if ( \Voxel\get('settings.icons.line_awesome.enabled') ) {
					$base_url = trailingslashit( get_template_directory_uri() ) . 'assets/icons/line-awesome/';
					
					$config['la-regular'] = [
						'name' => 'la-regular',
						'label' => __( 'Line Awesome - Regular', 'voxel-backend' ),
						'url' => $base_url . 'line-awesome.css',
						'enqueue' => [ $base_url . 'line-awesome.css' ],
						'prefix' => 'la-',
						'displayPrefix' => 'lar',
						'labelIcon' => 'fab fa-font-awesome-alt',
						'ver' => '1.3.0',
						'fetchJson' => $base_url . 'line-awesome-regular.js',
						'native' => false,
					];
					
					$config['la-solid'] = [
						'name' => 'la-solid',
						'label' => __( 'Line Awesome - Solid', 'voxel-backend' ),
						'url' => $base_url . 'line-awesome.css',
						'enqueue' => [ $base_url . 'line-awesome.css' ],
						'prefix' => 'la-',
						'displayPrefix' => 'las',
						'labelIcon' => 'fab fa-font-awesome-alt',
						'ver' => '1.3.0',
						'fetchJson' => $base_url . 'line-awesome-solid.js',
						'native' => false,
					];
					
					$config['la-brands'] = [
						'name' => 'la-brands',
						'label' => __( 'Line Awesome - Brands', 'voxel-backend' ),
						'url' => $base_url . 'line-awesome.css',
						'enqueue' => [ $base_url . 'line-awesome.css' ],
						'prefix' => 'la-',
						'displayPrefix' => 'lab',
						'labelIcon' => 'fab fa-font-awesome-alt',
						'ver' => '1.3.0',
						'fetchJson' => $base_url . 'line-awesome-brands.js',
						'native' => false,
					];
				}
			}
			
			// Load icon picker template from parent theme (requires $config variable)
			// This is the Vue.js icon picker component, NOT our React version
			$template_path = locate_template( 'templates/backend/icon-picker.php' );
			if ( $template_path ) {
				require $template_path;
				$GLOBALS['voxel_icon_picker_loaded'] = true;
				$icon_picker_loaded = true;
			}
		}
	}
}
