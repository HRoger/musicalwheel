<?php
/**
 * MusicalWheel FSE Theme - Main Functions
 *
 * @package MusicalWheel_FSE
 * @since 0.1.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define Constants
 */
define( 'MWFSE_VERSION', '0.1.0' );
define( 'MWFSE_PATH', get_template_directory() );
define( 'MWFSE_URL', get_template_directory_uri() );

/**
 * Theme Setup
 */
function mwfse_setup() {
	// Add default posts and comments RSS feed links to head.
	add_theme_support( 'automatic-feed-links' );

	// Let WordPress manage the document title.
	add_theme_support( 'title-tag' );

	// Enable support for Post Thumbnails.
	add_theme_support( 'post-thumbnails' );

	// Switch default core markup to output valid HTML5.
	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	// Add support for responsive embedded content.
	add_theme_support( 'responsive-embeds' );

	// Add support for experimental link color control.
	add_theme_support( 'experimental-link-color' );

	// Add support for editor styles.
	add_theme_support( 'editor-styles' );

	// Add support for wide and full alignments.
	add_theme_support( 'align-wide' );

	// Add support for block template parts.
	add_theme_support( 'block-template-parts' );
}
add_action( 'after_setup_theme', 'mwfse_setup' );

/**
 * Enqueue Assets
 * 
 * Loads frontend and editor assets using Vite_Loader.
 */
function mwfse_enqueue_assets() {
	static $vite_loader = null;

	// Initialize Vite Loader (singleton pattern)
	if ( null === $vite_loader ) {
		$manifest_path = MWFSE_PATH . '/assets/dist/.vite/manifest.json';
		$vite_loader = new \MusicalWheel\Utils\Vite_Loader( $manifest_path );
	}

	// Enqueue main frontend script
	if ( ! is_admin() ) {
		$vite_loader->enqueue_script(
			'mwfse-main',
			'src/main.tsx',
			array(),
			true
		);
	}

	// Enqueue editor script (block editor only)
	// TEMPORARY: Disabled to prevent conflicts with WordPress block editor
	// The Timeline block loads its own editor script
	/*
	if ( is_admin() || ( function_exists( 'get_current_screen' ) && get_current_screen() && get_current_screen()->is_block_editor() ) ) {
		$vite_loader->enqueue_script(
			'mwfse-editor',
			'src/editor.tsx',
			array(),
			true
		);
	}
	*/
}
add_action( 'wp_enqueue_scripts', 'mwfse_enqueue_assets' );
add_action( 'enqueue_block_editor_assets', 'mwfse_enqueue_assets' );

/**
 * Load Theme Components
 * 
 * Load core theme functionality and utilities.
 */

// Load utilities
require_once MWFSE_PATH . '/app/utils/class-vite-loader.php';

// Load Post Types system
require_once MWFSE_PATH . '/app/post-types/class-mw-post-type-repository.php';
require_once MWFSE_PATH . '/app/post-types/class-mw-post-type.php';

// Load Custom Fields system
// require_once MWFSE_PATH . '/app/custom-fields/class-field-base.php';

// Load Block Infrastructure
require_once MWFSE_PATH . '/app/blocks/Base_Block.php';
require_once MWFSE_PATH . '/app/blocks/Block_Loader.php';
require_once MWFSE_PATH . '/app/blocks/utils/GraphQL_Helper.php';

// Load GraphQL Types
require_once MWFSE_PATH . '/app/graphql/register-timeline-types.php';

// Load Timeline Block
require_once MWFSE_PATH . '/app/blocks/src/timeline/Timeline_Block.php';

// Load GraphQL resolvers
// require_once MWFSE_PATH . '/app/graphql/class-fse-resolvers.php';

/**
 * Initialize Blocks
 * 
 * Note: Block_Loader::init() is already called when the file is loaded,
 * so we just need to instantiate our Timeline block manually.
 */
add_action( 'init', function() {
	// Manually instantiate Timeline block
	new \MusicalWheel\Blocks\Src\Timeline_Block();
} );

// Temporary debug
require_once MWFSE_PATH . '/debug-blocks.php';

/**
 * Debug Information (Development Only)
 * Remove or comment out in production
 */
if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
	add_action( 'wp_footer', function() {
		if ( current_user_can( 'manage_options' ) ) {
			echo '<!-- MusicalWheel FSE Theme v' . esc_html( MWFSE_VERSION ) . ' -->';
			
			// Vite Loader Status
			$manifest_path = MWFSE_PATH . '/assets/dist/.vite/manifest.json';
			$vite_loader = new \MusicalWheel\Utils\Vite_Loader( $manifest_path );
			$status = $vite_loader->get_status();
			
			echo '<!-- Vite Loader Status: ';
			echo 'Dev Server: ' . ( $status['dev_server_running'] ? 'Running' : 'Stopped' ) . ', ';
			echo 'Manifest: ' . ( $status['manifest_exists'] ? 'Found' : 'Missing' );
			echo ' -->';
		}
	});
}
