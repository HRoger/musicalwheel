<?php
declare(strict_types=1);

/**
 * Vite Asset Loader
 *
 * Loads assets built by Vite using the manifest.json file.
 * Handles both development (HMR) and production modes.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace VoxelFSE\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Vite_Asset_Loader {

	/**
	 * Manifest cache
	 *
	 * @var array|null
	 */
	private static $manifest = null;

	/**
	 * Get the Vite manifest
	 *
	 * @return array
	 */
	private static function get_manifest() {
		if ( null !== self::$manifest ) {
			return self::$manifest;
		}

		$manifest_path = get_template_directory() . '/assets/dist/.vite/manifest.json';

		if ( ! file_exists( $manifest_path ) ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				//error_log( 'Vite manifest not found. Run: npm run build' );
			}
			self::$manifest = [];
			return self::$manifest;
		}

		$manifest_content = file_get_contents( $manifest_path );
		self::$manifest   = json_decode( $manifest_content, true );

		if ( ! is_array( self::$manifest ) ) {
			self::$manifest = [];
		}

		return self::$manifest;
	}

	/**
	 * Get asset URL from manifest
	 *
	 * @param string $entry Entry point (e.g., 'src/blocks/timeline/index.tsx').
	 * @return string|false Asset URL or false if not found.
	 */
	public static function get_asset_url( $entry ) {
		$manifest = self::get_manifest();

		if ( ! isset( $manifest[ $entry ] ) ) {
			//error_log( "Vite asset not found in manifest: {$entry}" );
			//error_log( "Available entries: " . implode( ', ', array_keys( $manifest ) ) );
			return false;
		}

		$asset = $manifest[ $entry ];
		$url = get_template_directory_uri() . '/assets/dist/' . $asset['file'];
		//error_log( "Vite asset URL for {$entry}: {$url}" );
		return $url;
	}

	/**
	 * Get CSS dependencies for an entry
	 *
	 * @param string $entry Entry point.
	 * @return array Array of CSS URLs.
	 */
	public static function get_css_dependencies( $entry ) {
		$manifest = self::get_manifest();

		if ( ! isset( $manifest[ $entry ]['css'] ) ) {
			return [];
		}

		$css_urls = [];
		foreach ( $manifest[ $entry ]['css'] as $css_file ) {
			$css_urls[] = get_template_directory_uri() . '/assets/dist/' . $css_file;
		}

		return $css_urls;
	}

	/**
	 * Register (not enqueue) a Vite-built script
	 *
	 * @param string $handle Script handle.
	 * @param string $entry Entry point (e.g., 'src/blocks/timeline/index.tsx').
	 * @param array  $dependencies Script dependencies.
	 * @param bool   $in_footer Load in footer.
	 * @return bool True if registered, false otherwise.
	 */
	public static function register_script( $handle, $entry, $dependencies = [], $in_footer = true ) {
		$asset_url = self::get_asset_url( $entry );

		if ( ! $asset_url ) {
			return false;
		}

		// Get file path for version
		$manifest  = self::get_manifest();
		$file_path = get_template_directory() . '/assets/dist/' . $manifest[ $entry ]['file'];
		$version   = file_exists( $file_path ) ? filemtime( $file_path ) : '1.0.0';

		// Register script as ES module
		wp_register_script(
			$handle,
			$asset_url,
			$dependencies,
			$version,
			$in_footer
		);

		// Add type="module" attribute
		add_filter(
			'script_loader_tag',
			function( $tag, $script_handle ) use ( $handle ) {
				if ( $handle === $script_handle ) {
					$tag = str_replace( ' src=', ' type="module" src=', $tag );
				}
				return $tag;
			},
			10,
			2
		);

		// Register CSS dependencies
		$css_deps = self::get_css_dependencies( $entry );
		foreach ( $css_deps as $index => $css_url ) {
			wp_register_style(
				"{$handle}-css-{$index}",
				$css_url,
				[],
				$version
			);
		}

		return true;
	}

	/**
	 * Enqueue a Vite-built script
	 *
	 * @param string $handle Script handle.
	 * @param string $entry Entry point (e.g., 'src/blocks/timeline/index.tsx').
	 * @param array  $dependencies Script dependencies.
	 * @param bool   $in_footer Load in footer.
	 * @return bool True if enqueued, false otherwise.
	 */
	public static function enqueue_script( $handle, $entry, $dependencies = [], $in_footer = true ) {
		// Register first
		$registered = self::register_script( $handle, $entry, $dependencies, $in_footer );
		
		if ( ! $registered ) {
			return false;
		}

		// Then enqueue
		wp_enqueue_script( $handle );
		
		// Enqueue CSS dependencies
		$css_deps = self::get_css_dependencies( $entry );
		foreach ( $css_deps as $index => $css_url ) {
			wp_enqueue_style( "{$handle}-css-{$index}" );
		}

		return true;
	}

	/**
	 * Check if Vite dev server is running
	 *
	 * @return bool
	 */
	public static function is_dev_server_running() {
		// Check if we're in development mode
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return false;
		}

		// Try to connect to Vite dev server
		$dev_server_url = 'http://localhost:3000';
		$response       = wp_remote_get( $dev_server_url, [ 'timeout' => 1 ] );

		return ! is_wp_error( $response );
	}
}
