<?php
/**
 * FSE Compatibility Controller
 *
 * Enqueues compatibility shims for Voxel parent theme integration.
 *
 * The shim suppresses the "Cannot read properties of null (reading 'dataset')" error
 * that occurs when Voxel's Vue-based render_static_popups() tries to access
 * .elementor-element which doesn't exist in Gutenberg/FSE context.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

use VoxelFSE\Controllers\FSE_Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Compatibility_Controller extends FSE_Base_Controller {

	protected function hooks(): void {
		// Inject into HEAD on frontend (priority 1 = very early)
		$this->on( 'wp_head', '@inject_compat_script_direct', 1 );

		// Inject into admin HEAD for block editor (priority 1 = very early)
		$this->on( 'admin_head', '@inject_compat_script_admin', 1 );

		// Also inject into footer as fallback
		$this->on( 'wp_print_footer_scripts', '@inject_compat_script_direct', 0 );
		$this->on( 'admin_print_footer_scripts', '@inject_compat_script_admin', 0 );
	}

	/**
	 * Inject compatibility script directly into frontend head/footer
	 */
	public function inject_compat_script_direct() {
		// Only inject on frontend
		if ( is_admin() ) {
			return;
		}

		$this->inject_script();
	}

	/**
	 * Inject compatibility script in admin (for block editor)
	 */
	public function inject_compat_script_admin() {
		// Only inject in block editor context
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( ! $screen ) {
			return;
		}

		// Only inject in block editor (post editor or site editor)
		$is_block_editor = $screen->is_block_editor() || $screen->id === 'site-editor';
		if ( ! $is_block_editor ) {
			return;
		}

		$this->inject_script();
	}

	/**
	 * Actually inject the script content
	 */
	private function inject_script() {
		// Prevent double-injection
		static $injected = false;
		if ( $injected ) {
			return;
		}
		$injected = true;

		$script_path = get_stylesheet_directory() . '/assets/js/voxel-fse-compat.js';

		if ( ! file_exists( $script_path ) ) {
			return;
		}

		$script_content = file_get_contents( $script_path );

		// Wrap in script tag and output directly
		echo '<script type="text/javascript" id="voxel-fse-compat-shim">' . "\n";
		echo $script_content . "\n";
		echo '</script>' . "\n";
	}
}
