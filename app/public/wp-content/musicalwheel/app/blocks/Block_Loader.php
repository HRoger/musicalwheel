<?php
/**
 * Block Loader
 *
 * Auto-loads and registers all MusicalWheel blocks.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace MusicalWheel\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Block_Loader {

	/**
	 * Registered blocks
	 *
	 * @var array
	 */
	private static $blocks = [];

	/**
	 * Initialize the block loader
	 */
	public static function init() {
		add_action( 'init', [ __CLASS__, 'register_block_categories' ] );
		add_action( 'init', [ __CLASS__, 'load_blocks' ] );
		add_filter( 'block_categories_all', [ __CLASS__, 'add_block_categories' ] );
	}

	/**
	 * Register block categories
	 */
	public static function register_block_categories() {
		// Block categories are registered via filter
	}

	/**
	 * Add custom block categories
	 *
	 * @param array $categories Existing block categories.
	 * @return array Modified block categories.
	 */
	public static function add_block_categories( $categories ) {
		$custom_categories = [
			[
				'slug'  => 'musicalwheel-forms',
				'title' => __( 'MusicalWheel Forms', 'musicalwheel' ),
				'icon'  => 'forms',
			],
			[
				'slug'  => 'musicalwheel-social',
				'title' => __( 'MusicalWheel Social', 'musicalwheel' ),
				'icon'  => 'groups',
			],
			[
				'slug'  => 'musicalwheel-commerce',
				'title' => __( 'MusicalWheel Commerce', 'musicalwheel' ),
				'icon'  => 'cart',
			],
			[
				'slug'  => 'musicalwheel-users',
				'title' => __( 'MusicalWheel Users', 'musicalwheel' ),
				'icon'  => 'admin-users',
			],
			[
				'slug'  => 'musicalwheel-content',
				'title' => __( 'MusicalWheel Content', 'musicalwheel' ),
				'icon'  => 'layout',
			],
			[
				'slug'  => 'musicalwheel-location',
				'title' => __( 'MusicalWheel Location', 'musicalwheel' ),
				'icon'  => 'location',
			],
			[
				'slug'  => 'musicalwheel-analytics',
				'title' => __( 'MusicalWheel Analytics', 'musicalwheel' ),
				'icon'  => 'chart-bar',
			],
		];

		return array_merge( $custom_categories, $categories );
	}

	/**
	 * Load all blocks from the blocks directory
	 */
	public static function load_blocks() {
		$blocks_dir = get_template_directory() . '/app/blocks/src';

		if ( ! is_dir( $blocks_dir ) ) {
			return;
		}

		$block_dirs = glob( $blocks_dir . '/*', GLOB_ONLYDIR );

		foreach ( $block_dirs as $block_dir ) {
			$block_name = basename( $block_dir );
			$class_file = $block_dir . '/' . ucfirst( str_replace( '-', '_', $block_name ) ) . '_Block.php';

			if ( file_exists( $class_file ) ) {
				require_once $class_file;
				
				$class_name = '\\MusicalWheel\\Blocks\\Src\\' . ucfirst( str_replace( '-', '_', $block_name ) ) . '_Block';
				
				if ( class_exists( $class_name ) ) {
					$block = new $class_name();
					self::$blocks[ $block_name ] = $block;
				}
			}
		}
	}

	/**
	 * Get registered block instance
	 *
	 * @param string $block_name Block name.
	 * @return object|null Block instance or null if not found.
	 */
	public static function get_block( $block_name ) {
		return self::$blocks[ $block_name ] ?? null;
	}

	/**
	 * Get all registered blocks
	 *
	 * @return array
	 */
	public static function get_all_blocks() {
		return self::$blocks;
	}

	/**
	 * Check if block is registered
	 *
	 * @param string $block_name Block name.
	 * @return bool
	 */
	public static function has_block( $block_name ) {
		return isset( self::$blocks[ $block_name ] );
	}
}

// Initialize the block loader
Block_Loader::init();
