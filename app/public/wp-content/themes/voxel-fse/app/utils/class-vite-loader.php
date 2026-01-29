<?php
declare(strict_types=1);

/**
 * Vite Asset Loader for WordPress
 *
 * Loads Vite assets in WordPress with support for:
 * - Development mode with HMR (Hot Module Replacement)
 * - Production mode with manifest.json
 * - WordPress package externalization
 *
 * @package MusicalWheel_FSE
 * @since 1.0.0
 */

namespace VoxelFSE\Utils;

/**
 * Class Vite_Loader
 *
 * Handles loading of Vite-compiled assets in WordPress.
 */
class Vite_Loader {
	/**
	 * Vite dev server URL
	 *
	 * @var string
	 */
	private $dev_server_url = 'http://localhost:3000';

	/**
	 * Path to manifest file
	 *
	 * @var string
	 */
	private $manifest_path;

	/**
	 * Cached manifest data
	 *
	 * @var array|null
	 */
	private $manifest = null;

	/**
	 * Whether dev server is running
	 *
	 * @var bool|null
	 */
	private $is_dev = null;

	/**
	 * Constructor
	 *
	 * @param string $manifest_path Path to manifest.json file.
	 * @param string $dev_server_url Optional. Vite dev server URL.
	 */
	public function __construct( $manifest_path, $dev_server_url = '' ) {
		$this->manifest_path = $manifest_path;

		if ( ! empty( $dev_server_url ) ) {
			$this->dev_server_url = $dev_server_url;
		}
	}

	/**
	 * Check if Vite dev server is running
	 *
	 * @return bool
	 */
	public function is_dev_server_running() {
		// Cache result to avoid multiple HTTP requests
		if ( null !== $this->is_dev ) {
			return $this->is_dev;
		}

		// Check if WP_DEBUG is enabled (dev mode indicator)
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			$this->is_dev = false;
			return false;
		}

		// Use a short-lived transient to avoid repeated remote checks on every request.
		// This reduces noise in Query Monitor when the dev server is down.
		$transient_key = 'mw_vite_dev_server_status';
		$cached = get_transient( $transient_key );
		if ( false !== $cached ) {
			$this->is_dev = (bool) $cached;
			return $this->is_dev;
		}

		// Only attempt a dev-server check in specific contexts to avoid spamming
		// unrelated admin pages with socket/connect attempts. Limit to:
		// - Block editor pages (post-new.php/post.php)
		// - Site editor (site-editor.php)
		// - REST requests (for block data)
		if ( ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			$allowed_admin_pages = array( 'post.php', 'post-new.php', 'site-editor.php', 'site-editor', 'admin-ajax.php' );
			$do_check = false;

			if ( is_admin() ) {
				global $pagenow;
				if ( isset( $pagenow ) && in_array( $pagenow, $allowed_admin_pages, true ) ) {
					$do_check = true;
				} else {
					// Also allow the editor when accessed via query (e.g., page=site-editor)
					$req = $_SERVER['REQUEST_URI'] ?? '';
					if ( strpos( $req, 'site-editor.php' ) !== false || strpos( $req, 'post.php' ) !== false || strpos( $req, 'post-new.php' ) !== false ) {
						$do_check = true;
					}
				}
			}

			if ( ! $do_check ) {
				$this->is_dev = false;
				// Cache negative result briefly to avoid repeated early checks
				set_transient( $transient_key, false, 2 );
				return false;
			}
		}

		// Try to connect to Vite dev server
		// First, attempt a lightweight TCP connection to the dev server port to avoid making HTTP requests
		$parsed = wp_parse_url( $this->dev_server_url );
		$host   = $parsed['host'] ?? 'localhost';
		$port   = isset( $parsed['port'] ) ? (int) $parsed['port'] : 3000;

		// Short timeout socket connection (not logged by Query Monitor)
		$timeout_seconds = 0.25;
		$errno = 0;
		$errstr = '';
		$fp = @fsockopen( $host, $port, $errno, $errstr, $timeout_seconds );
		if ( $fp ) {
			fclose( $fp );
			$this->is_dev = true;
			return true;
		}

		// Connection failed silently - dev server not running
		// Don't log error, just mark as production mode
		$this->is_dev = false;

		// If socket failed, fall back to an HTTP check against the Vite client endpoint to be sure
		$health_url = rtrim( $this->dev_server_url, '/' ) . '/@vite/client';
		$response = wp_remote_get(
			$health_url,
			array(
				'timeout'     => 0.8,
				'sslverify'   => false,
				'redirection' => 0,
			)
		);

		// Treat non-200 responses as "not running"
		if ( is_wp_error( $response ) ) {
			$this->is_dev = false;
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				//error_log( sprintf( 'Vite Loader: dev server health check failed: %s', $response->get_error_message() ) );
			}
			// Cache negative result briefly to avoid repeated timeouts
			set_transient( $transient_key, false, 2 );
			return false;
		}

		$code = wp_remote_retrieve_response_code( $response );
		if ( $code >= 200 && $code < 300 ) {
			$this->is_dev = true;
			set_transient( $transient_key, true, 2 );
			return true;
		}

		$this->is_dev = false;
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			$body = wp_remote_retrieve_body( $response );
			//error_log( sprintf( 'Vite Loader: health endpoint returned HTTP %d for %s', $code, $health_url ) );
			//error_log( sprintf( 'Vite Loader: response body (trimmed): %s', substr( trim( preg_replace( '/\s+/', ' ', $body ) ), 0, 200 ) ) );
		}

		// Cache negative result briefly to avoid repeated timeouts
		set_transient( $transient_key, false, 2 );
		return false;
	}

	/**
	 * Get manifest data
	 *
	 * @return array|null
	 */
	private function get_manifest() {
		if ( null !== $this->manifest ) {
			return $this->manifest;
		}

		if ( ! file_exists( $this->manifest_path ) ) {
			return null;
		}

		$manifest_content = file_get_contents( $this->manifest_path );
		if ( false === $manifest_content ) {
			return null;
		}

		$this->manifest = json_decode( $manifest_content, true );
		return $this->manifest;
	}

	/**
	 * Get asset URL from manifest
	 *
	 * @param string $entry Entry point name (e.g., 'src/main.tsx').
	 * @return string|null
	 */
	private function get_manifest_asset( $entry ) {
		$manifest = $this->get_manifest();

		if ( null === $manifest || ! isset( $manifest[ $entry ] ) ) {
			return null;
		}

		return $manifest[ $entry ]['file'] ?? null;
	}

	/**
	 * Enqueue script with Vite
	 *
	 * @param string $handle Script handle.
	 * @param string $entry Entry point (e.g., 'src/main.tsx').
	 * @param array  $deps   Optional. Dependencies.
	 * @param bool   $in_footer Optional. Load in footer.
	 */
	public function enqueue_script( $handle, $entry, $deps = array(), $in_footer = true ) {
		// Development mode - load from Vite dev server
		if ( $this->is_dev_server_running() ) {
			// Enqueue Vite client for HMR
			if ( ! wp_script_is( 'vite-client', 'enqueued' ) ) {
				wp_enqueue_script(
					'vite-client',
					$this->dev_server_url . '/@vite/client',
					array(),
					null,
					false
				);
				$this->add_module_type_attribute( 'vite-client' );
			}

			// Enqueue entry point
			wp_enqueue_script(
				$handle,
				$this->dev_server_url . '/' . $entry,
				array_merge( array( 'vite-client' ), $deps ),
				null,
				$in_footer
			);
			$this->add_module_type_attribute( $handle );

			return;
		}

		// Production mode - load from manifest
		$asset_path = $this->get_manifest_asset( $entry );

		if ( null === $asset_path ) {
			// Fallback: log error in debug mode
			if ( WP_DEBUG ) {
				//error_log( sprintf( 'Vite Loader: Asset not found in manifest: %s', $entry ) );
			}
			return;
		}

		$asset_url = MWFSE_URL . '/assets/dist/' . $asset_path;

		wp_enqueue_script(
			$handle,
			$asset_url,
			$this->get_wordpress_dependencies( $deps ),
			MWFSE_VERSION,
			$in_footer
		);

		// Add module type for modern builds
		$this->add_module_type_attribute( $handle );

		// Load associated CSS if exists
		$this->enqueue_style_from_manifest( $handle, $entry );
	}

	/**
	 * Enqueue style from manifest
	 *
	 * @param string $handle Style handle.
	 * @param string $entry Entry point.
	 */
	private function enqueue_style_from_manifest( $handle, $entry ) {
		$manifest = $this->get_manifest();

		if ( null === $manifest || ! isset( $manifest[ $entry ] ) ) {
			return;
		}

		// Check if entry has CSS file
		$css_files = $manifest[ $entry ]['css'] ?? array();

		if ( empty( $css_files ) ) {
			return;
		}

		// Enqueue each CSS file
		foreach ( $css_files as $index => $css_file ) {
			$css_handle = $handle . '-css-' . $index;
			$css_url    = MWFSE_URL . '/assets/dist/' . $css_file;

			wp_enqueue_style(
				$css_handle,
				$css_url,
				array(),
				MWFSE_VERSION
			);
		}
	}

	/**
	 * Enqueue style with Vite
	 *
	 * @param string $handle Style handle.
	 * @param string $entry Entry point (e.g., 'src/styles/main.css').
	 * @param array  $deps  Optional. Dependencies.
	 */
	public function enqueue_style( $handle, $entry, $deps = array() ) {
		// Development mode - styles are injected by Vite HMR
		if ( $this->is_dev_server_running() ) {
			// No need to enqueue separately - handled by Vite
			return;
		}

		// Production mode - load from manifest
		$asset_path = $this->get_manifest_asset( $entry );

		if ( null === $asset_path ) {
			if ( WP_DEBUG ) {
				//error_log( sprintf( 'Vite Loader: CSS asset not found in manifest: %s', $entry ) );
			}
			return;
		}

		$asset_url = MWFSE_URL . '/assets/dist/' . $asset_path;

		wp_enqueue_style(
			$handle,
			$asset_url,
			$deps,
			MWFSE_VERSION
		);
	}

	/**
	 * Add type="module" attribute to script tag
	 *
	 * @param string $handle Script handle.
	 */
	private function add_module_type_attribute( $handle ) {
		add_filter(
			'script_loader_tag',
			function ( $tag, $script_handle, $src ) use ( $handle ) {
				if ( $script_handle === $handle ) {
					// Replace type='text/javascript' with type='module'
					$tag = str_replace( "type='text/javascript'", "type='module'", $tag );
					// Also handle double quotes
					$tag = str_replace( 'type="text/javascript"', 'type="module"', $tag );
					// If no type attribute, add it before src
					if ( strpos( $tag, "type='module'" ) === false && strpos( $tag, 'type="module"' ) === false ) {
						$tag = str_replace( '<script ', '<script type="module" ', $tag );
					}
				}
				return $tag;
			},
			10,
			3
		);
	}

	/**
	 * Get WordPress dependencies
	 *
	 * Converts WordPress package dependencies to their script handles.
	 *
	 * @param array $deps Custom dependencies.
	 * @return array
	 */
	private function get_wordpress_dependencies( $deps = array() ) {
		// WordPress core packages that should be externalized
		$wp_packages = array(
			'wp-element'       => 'wp-element',
			'wp-blocks'        => 'wp-blocks',
			'wp-block-editor'  => 'wp-block-editor',
			'wp-components'    => 'wp-components',
			'wp-data'          => 'wp-data',
			'wp-i18n'          => 'wp-i18n',
			'wp-api-fetch'     => 'wp-api-fetch',
			'wp-dom-ready'     => 'wp-dom-ready',
			'wp-hooks'         => 'wp-hooks',
		);

		// Add WordPress core dependencies to custom deps
		$all_deps = array_merge( array_values( $wp_packages ), $deps );

		return array_unique( $all_deps );
	}

	/**
	 * Preload module for better performance
	 *
	 * @param string $handle Script handle.
	 * @param string $entry Entry point.
	 */
	public function preload_module( $handle, $entry ) {
		if ( $this->is_dev_server_running() ) {
			return;
		}

		$asset_path = $this->get_manifest_asset( $entry );

		if ( null === $asset_path ) {
			return;
		}

		$asset_url = MWFSE_URL . 'dist/' . $asset_path;

		add_action(
			'wp_head',
			function () use ( $asset_url ) {
				printf(
					'<link rel="modulepreload" href="%s">',
					esc_url( $asset_url )
				);
			},
			1
		);
	}

	/**
	 * Get asset URL from manifest entry
	 *
	 * @param string $entry Entry point name (e.g., 'app/blocks/src/timeline/index.js').
	 * @return string|null Full URL to the built asset, or null if not found.
	 */
	public function get_asset_url( $entry ) {
		// In dev mode, return dev server URL
		if ( $this->is_dev_server_running() ) {
			return $this->dev_server_url . '/' . $entry;
		}

		// In production mode, get from manifest
		$asset_path = $this->get_manifest_asset( $entry );

		if ( null === $asset_path ) {
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
				//error_log( 'Vite Loader: Asset not found in manifest: ' . $entry );
				// Log available keys for debugging
				$manifest = $this->get_manifest();
				if ( $manifest ) {
					//error_log( 'Vite Loader: Available manifest keys: ' . implode( ', ', array_keys( $manifest ) ) );
				}
			}
			return null;
		}

		// Construct full URL
		if ( defined( 'MWFSE_URL' ) ) {
			return MWFSE_URL . '/assets/dist/' . $asset_path;
		}

		// Fallback to get_template_directory_uri()
		return get_template_directory_uri() . '/assets/dist/' . $asset_path;
	}

	/**
	 * Get dev server status for debugging
	 *
	 * @return array
	 */
	public function get_status() {
		return array(
			'dev_server_running' => $this->is_dev_server_running(),
			'dev_server_url'     => $this->dev_server_url,
			'manifest_path'      => $this->manifest_path,
			'manifest_exists'    => file_exists( $this->manifest_path ),
			'manifest_readable'  => is_readable( $this->manifest_path ),
		);
	}
}
