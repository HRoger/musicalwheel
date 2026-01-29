<?php
/**
 * PHPUnit Bootstrap File
 *
 * Sets up the testing environment for VoxelFSE theme.
 *
 * @package VoxelFSE\Tests
 */

// Define ABSPATH if not already defined
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __DIR__, 4 ) . '/' );
}

// Define theme directory
if ( ! defined( 'VOXEL_FSE_THEME_DIR' ) ) {
	define( 'VOXEL_FSE_THEME_DIR', dirname( __DIR__ ) . '/' );
}

// Load Composer autoloader
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// Initialize Brain Monkey for WordPress function mocking
\Brain\Monkey\setUp();

// Register autoloader for VoxelFSE namespace
spl_autoload_register( function( $class ) {
	// Only autoload VoxelFSE classes
	if ( strpos( $class, 'VoxelFSE\\' ) !== 0 ) {
		return;
	}

	// Convert namespace to file path
	$relative_class = substr( $class, strlen( 'VoxelFSE\\' ) );

	// Map namespace parts to directories
	$path_parts = explode( '\\', $relative_class );
	$file_name = array_pop( $path_parts );

	// Build directory path
	$dir_path = VOXEL_FSE_THEME_DIR . 'app/' . strtolower( implode( '/', $path_parts ) ) . '/';

	// Convert class name to file name variations
	// Icon_Processor -> icon-processor.php (most common in this project)
	$file_name_kebab = strtolower( str_replace( '_', '-', $file_name ) );
	$file_path = $dir_path . $file_name_kebab . '.php';
	if ( file_exists( $file_path ) ) {
		require_once $file_path;
		return;
	}

	// Try exact case (e.g., Icon_Processor.php)
	$file_path = $dir_path . $file_name . '.php';
	if ( file_exists( $file_path ) ) {
		require_once $file_path;
		return;
	}

	// Try lowercase with underscores (e.g., icon_processor.php)
	$file_name_lower = strtolower( $file_name );
	$file_path = $dir_path . $file_name_lower . '.php';
	if ( file_exists( $file_path ) ) {
		require_once $file_path;
		return;
	}
});

// Load test helper functions
require_once __DIR__ . '/helpers/wordpress-stubs.php';
