<?php
/**
 * Block Registration System
 *
 * Automatically registers all blocks in the app/blocks/ directory.
 * Supports both static (block.json) and dynamic (render.php) blocks.
 *
 * @package MusicalWheel_FSE
 * @since 0.1.0
 */

namespace MusicalWheel\Blocks;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Loader Class
 * 
 * Handles automatic registration of all FSE blocks in the theme.
 */
class Block_Loader {

	/**
	 * Blocks directory path
	 *
	 * @var string
	 */
	private static $blocks_dir;

	/**
	 * Initialize block loader
	 */
	public static function init() {
		self::$blocks_dir = MWFSE_PATH . '/app/blocks';
		
		// Register block scripts first
		add_action( 'init', [ __CLASS__, 'register_block_scripts' ], 5 );
		
		// Register blocks on init
		add_action( 'init', [ __CLASS__, 'register_blocks' ] );
		
		// Register block categories
		add_filter( 'block_categories_all', [ __CLASS__, 'register_block_categories' ], 10, 2 );
		
		// Add module type to block scripts
		add_filter( 'script_loader_tag', [ __CLASS__, 'add_module_type' ], 10, 3 );
	}

	/**
	 * Register block editor scripts
	 */
	public static function register_block_scripts() {
		// Load manifest
		$manifest_path = MWFSE_PATH . '/assets/dist/.vite/manifest.json';
		
		if ( ! file_exists( $manifest_path ) ) {
			return;
		}
		
		$manifest = json_decode( file_get_contents( $manifest_path ), true );
		
		if ( empty( $manifest ) ) {
			return;
		}
		
		// Register timeline block editor script
		$entry = 'src/blocks/timeline/index.tsx';
		
		if ( isset( $manifest[ $entry ] ) ) {
			$asset_file = $manifest[ $entry ]['file'];
			$asset_url = MWFSE_URL . '/assets/dist/' . $asset_file;
			
			wp_register_script(
				'musicalwheel-timeline-editor',
				$asset_url,
				[
					'wp-blocks',
					'wp-element',
					'wp-block-editor',
					'wp-components',
					'wp-i18n',
				],
				MWFSE_VERSION,
				true
			);
			
			// Add type="module" attribute
			add_filter(
				'script_loader_tag',
				function ( $tag, $handle, $src ) {
					if ( 'musicalwheel-timeline-editor' === $handle ) {
						$tag = str_replace( '<script ', '<script type="module" ', $tag );
					}
					return $tag;
				},
				10,
				3
			);
			
			wp_set_script_translations( 'musicalwheel-timeline-editor', 'musicalwheel-fse' );
		}
	}
	
	/**
	 * Register all blocks in the blocks directory
	 */
	public static function register_blocks() {
		// Check if blocks directory exists
		if ( ! is_dir( self::$blocks_dir ) ) {
			return;
		}

		// Get all block directories
		$block_dirs = glob( self::$blocks_dir . '/*', GLOB_ONLYDIR );

		if ( empty( $block_dirs ) ) {
			return;
		}

		// Register each block
		foreach ( $block_dirs as $block_dir ) {
			$block_json_path = $block_dir . '/block.json';

			// Check if block.json exists
			if ( ! file_exists( $block_json_path ) ) {
				continue;
			}

			// Register block type
			$registered = register_block_type( $block_dir );

			// Log registration for debugging (only in WP_DEBUG mode)
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG && $registered ) {
				$block_name = basename( $block_dir );
				error_log( sprintf( '[MusicalWheel FSE] Block registered: musicalwheel/%s', $block_name ) );
			}
		}
	}

	/**
	 * Register custom block categories
	 *
	 * @param array  $categories Array of block categories.
	 * @param object $post Post being loaded.
	 * @return array Modified categories.
	 */
	public static function register_block_categories( $categories, $post ) {
		// Add MusicalWheel category at the beginning
		return array_merge(
			[
				[
					'slug'  => 'musicalwheel',
					'title' => __( 'MusicalWheel', 'musicalwheel-fse' ),
					'icon'  => 'music',
				],
				[
					'slug'  => 'musicalwheel-social',
					'title' => __( 'MusicalWheel Social', 'musicalwheel-fse' ),
					'icon'  => 'groups',
				],
				[
					'slug'  => 'musicalwheel-marketplace',
					'title' => __( 'MusicalWheel Marketplace', 'musicalwheel-fse' ),
					'icon'  => 'cart',
				],
			],
			$categories
		);
	}

	/**
	 * Get registered block count
	 *
	 * @return int Number of registered blocks
	 */
	public static function get_block_count() {
		$registry = \WP_Block_Type_Registry::get_instance();
		$all_blocks = $registry->get_all_registered();
		
		// Count only MusicalWheel blocks
		$count = 0;
		foreach ( $all_blocks as $block_name => $block_type ) {
			if ( str_starts_with( $block_name, 'musicalwheel/' ) ) {
				$count++;
			}
		}
		
		return $count;
	}
	
	/**
	 * Add type="module" to block scripts
	 *
	 * @param string $tag    Script tag.
	 * @param string $handle Script handle.
	 * @param string $src    Script source.
	 * @return string Modified script tag.
	 */
	public static function add_module_type( $tag, $handle, $src ) {
		// Add module type for block scripts
		if ( strpos( $src, '/assets/dist/js/blocks/' ) !== false ) {
			$tag = str_replace( '<script ', '<script type="module" ', $tag );
		}
		
		return $tag;
	}
}

// Initialize block loader
Block_Loader::init();
