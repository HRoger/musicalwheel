<?php
/**
 * Debug script to check block registration
 * 
 * Add this temporarily to functions.php to debug:
 * require_once MWFSE_PATH . '/debug-blocks.php';
 */

add_action( 'init', function() {
	error_log( '=== TIMELINE BLOCK DEBUG ===' );
	
	// Check if block directory exists
	$block_dir = get_template_directory() . '/src/blocks/timeline';
	error_log( 'Block directory: ' . $block_dir );
	error_log( 'Block directory exists: ' . ( file_exists( $block_dir ) ? 'YES' : 'NO' ) );
	
	// Check if block.json exists
	$block_json = $block_dir . '/block.json';
	error_log( 'block.json exists: ' . ( file_exists( $block_json ) ? 'YES' : 'NO' ) );
	
	// Check if Timeline_Block class exists
	error_log( 'Timeline_Block class exists: ' . ( class_exists( '\\MusicalWheel\\Blocks\\Src\\Timeline_Block' ) ? 'YES' : 'NO' ) );
	
	// List all registered blocks
	$registered_blocks = \WP_Block_Type_Registry::get_instance()->get_all_registered();
	$mw_blocks = array_filter( array_keys( $registered_blocks ), function( $name ) {
		return strpos( $name, 'musicalwheel/' ) === 0;
	});
	
	error_log( 'Registered MusicalWheel blocks: ' . print_r( $mw_blocks, true ) );
	
	// Check if timeline block is registered
	error_log( 'Timeline block registered: ' . ( isset( $registered_blocks['musicalwheel/timeline'] ) ? 'YES' : 'NO' ) );
	
	error_log( '=== END DEBUG ===' );
}, 99 );
