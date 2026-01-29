<?php
/**
 * FSE Compatibility Controller
 *
 * Enqueues compatibility shims for Voxel parent theme integration.
 * CRITICAL: This script must load BEFORE Voxel's commons.js to patch Vue mixins.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

use VoxelFSE\Controllers\FSE_Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Compatibility_Controller extends FSE_Base_Controller {

	protected function hooks() {
		// Enqueue compat script with HIGHEST priority to load before Voxel scripts
		$this->on( 'wp_enqueue_scripts', '@enqueue_compat_script', 1 );
	}

	/**
	 * Enqueue compatibility shim script
	 *
	 * CRITICAL: Uses priority 1 to load before Voxel's scripts (priority 10)
	 * The shim patches Voxel.mixins.base before Vue components are created.
	 */
	public function enqueue_compat_script() {
		$script_path = get_stylesheet_directory() . '/assets/js/voxel-fse-compat.js';
		$script_url = get_stylesheet_directory_uri() . '/assets/js/voxel-fse-compat.js';
		
		// Use filemtime for cache busting, fallback to theme version
		$version = file_exists( $script_path ) ? filemtime( $script_path ) : VOXEL_FSE_VERSION;
		
		wp_enqueue_script(
			'voxel-fse-compat',
			$script_url,
			array(), // NO dependencies - must load before Voxel scripts
			$version,
			false // Load in <head> to ensure it runs before body scripts
		);
	}
}
