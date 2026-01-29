<?php
declare(strict_types=1);

/**
 * MW_Post_Type_Repository Class
 *
 * Manages configuration storage and retrieval for custom post types.
 * Stores data in wp_options as JSON following Voxel's pattern.
 *
 * Based on Voxel Discovery: hybrid storage (native registration + wp_options config)
 *
 * @package MusicalWheel_FSE
 * @since 1.0.0
 */

namespace VoxelFSE\Post_Types;

/**
 * Class MW_Post_Type_Repository
 *
 * Handles configuration persistence for MW_Post_Type.
 */
class MW_Post_Type_Repository {
	/**
	 * Post type key
	 *
	 * @var string
	 */
	private $post_type_key;

	/**
	 * Option name for configuration storage
	 *
	 * @var string
	 */
	private $option_name;

	/**
	 * Cached settings
	 *
	 * @var array|null
	 */
	private $settings_cache = null;

	/**
	 * Constructor
	 *
	 * @param string $post_type_key Post type key.
	 */
	public function __construct( $post_type_key ) {
		$this->post_type_key = $post_type_key;
		$this->option_name = 'mw_post_type_' . $post_type_key;
	}

	/**
	 * Get all settings for this post type
	 *
	 * @param bool $force_refresh Force refresh from database.
	 * @return array
	 */
	public function get_settings( $force_refresh = false ) {
		// Return cached settings if available
		if ( null !== $this->settings_cache && ! $force_refresh ) {
			return $this->settings_cache;
		}

		// Fetch from database
		$settings = get_option( $this->option_name, array() );

		// Ensure array format
		if ( ! is_array( $settings ) ) {
			$settings = array();
		}

		// Cache the result
		$this->settings_cache = $settings;

		return $settings;
	}

	/**
	 * Get specific setting by key
	 *
	 * @param string $key Setting key.
	 * @param mixed  $default Default value if not found.
	 * @return mixed
	 */
	public function get_setting( $key, $default = null ) {
		$settings = $this->get_settings();
		return $settings[ $key ] ?? $default;
	}

	/**
	 * Update all settings
	 *
	 * @param array $settings Complete settings array.
	 * @return bool
	 */
	public function update_settings( $settings ) {
		// Validate settings
		if ( ! is_array( $settings ) ) {
			return false;
		}

		// Update database
		$result = update_option( $this->option_name, $settings, false );

		// Clear cache
		$this->settings_cache = null;

		return $result;
	}

	/**
	 * Update specific setting
	 *
	 * @param string $key Setting key.
	 * @param mixed  $value Setting value.
	 * @return bool
	 */
	public function update_setting( $key, $value ) {
		$settings = $this->get_settings();
		$settings[ $key ] = $value;

		return $this->update_settings( $settings );
	}

	/**
	 * Delete specific setting
	 *
	 * @param string $key Setting key.
	 * @return bool
	 */
	public function delete_setting( $key ) {
		$settings = $this->get_settings();

		if ( ! isset( $settings[ $key ] ) ) {
			return false;
		}

		unset( $settings[ $key ] );

		return $this->update_settings( $settings );
	}

	/**
	 * Delete all settings
	 *
	 * @return bool
	 */
	public function delete_all_settings() {
		$this->settings_cache = null;
		return delete_option( $this->option_name );
	}

	/**
	 * Get fields configuration
	 *
	 * @return array
	 */
	public function get_fields() {
		return $this->get_setting( 'fields', array() );
	}

	/**
	 * Update fields configuration
	 *
	 * @param array $fields Fields array.
	 * @return bool
	 */
	public function update_fields( $fields ) {
		if ( ! is_array( $fields ) ) {
			return false;
		}

		return $this->update_setting( 'fields', $fields );
	}

	/**
	 * Get filters configuration
	 *
	 * @return array
	 */
	public function get_filters() {
		return $this->get_setting( 'filters', array() );
	}

	/**
	 * Update filters configuration
	 *
	 * @param array $filters Filters array.
	 * @return bool
	 */
	public function update_filters( $filters ) {
		if ( ! is_array( $filters ) ) {
			return false;
		}

		return $this->update_setting( 'filters', $filters );
	}

	/**
	 * Get templates configuration
	 *
	 * @return array
	 */
	public function get_templates() {
		return $this->get_setting( 'templates', array() );
	}

	/**
	 * Update templates configuration
	 *
	 * @param array $templates Templates array.
	 * @return bool
	 */
	public function update_templates( $templates ) {
		if ( ! is_array( $templates ) ) {
			return false;
		}

		return $this->update_setting( 'templates', $templates );
	}

	/**
	 * Check if this post type is managed by VoxelFSE
	 *
	 * @return bool
	 */
	public function is_managed() {
		return (bool) $this->get_setting( 'is_managed', false );
	}

	/**
	 * Mark post type as managed by VoxelFSE
	 *
	 * @return bool
	 */
	public function mark_as_managed() {
		return $this->update_setting( 'is_managed', true );
	}

	/**
	 * Unmark post type as managed
	 *
	 * @return bool
	 */
	public function unmark_as_managed() {
		return $this->update_setting( 'is_managed', false );
	}

	/**
	 * Check if post type is enabled
	 *
	 * @return bool
	 */
	public function is_enabled() {
		return (bool) $this->get_setting( 'enabled', true );
	}

	/**
	 * Enable post type
	 *
	 * @return bool
	 */
	public function enable() {
		return $this->update_setting( 'enabled', true );
	}

	/**
	 * Disable post type
	 *
	 * @return bool
	 */
	public function disable() {
		return $this->update_setting( 'enabled', false );
	}

	/**
	 * Get registration arguments
	 *
	 * @return array
	 */
	public function get_registration_args() {
		return $this->get_setting( 'registration_args', array() );
	}

	/**
	 * Export settings as JSON
	 *
	 * @param bool $pretty_print Pretty print JSON.
	 * @return string|false
	 */
	public function export_json( $pretty_print = true ) {
		$settings = $this->get_settings();

		$flags = 0;
		if ( $pretty_print ) {
			$flags = JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE;
		}

		return wp_json_encode( $settings, $flags );
	}

	/**
	 * Import settings from JSON
	 *
	 * @param string $json JSON string.
	 * @return bool|\WP_Error
	 */
	public function import_json( $json ) {
		$settings = json_decode( $json, true );

		if ( null === $settings ) {
			return new \WP_Error( 'invalid_json', 'Invalid JSON format' );
		}

		if ( ! is_array( $settings ) ) {
			return new \WP_Error( 'invalid_format', 'Settings must be an array' );
		}

		return $this->update_settings( $settings );
	}

	/**
	 * Validate settings structure
	 *
	 * @param array $settings Settings to validate.
	 * @return bool|\WP_Error
	 */
	public function validate_settings( $settings ) {
		if ( ! is_array( $settings ) ) {
			return new \WP_Error( 'invalid_type', 'Settings must be an array' );
		}

		// Validate fields structure
		if ( isset( $settings['fields'] ) && ! is_array( $settings['fields'] ) ) {
			return new \WP_Error( 'invalid_fields', 'Fields must be an array' );
		}

		// Validate filters structure
		if ( isset( $settings['filters'] ) && ! is_array( $settings['filters'] ) ) {
			return new \WP_Error( 'invalid_filters', 'Filters must be an array' );
		}

		// Validate templates structure
		if ( isset( $settings['templates'] ) && ! is_array( $settings['templates'] ) ) {
			return new \WP_Error( 'invalid_templates', 'Templates must be an array' );
		}

		return true;
	}

	/**
	 * Get repository statistics
	 *
	 * @return array
	 */
	public function get_stats() {
		$settings = $this->get_settings();

		return array(
			'post_type_key'   => $this->post_type_key,
			'option_name'     => $this->option_name,
			'is_managed'      => $this->is_managed(),
			'is_enabled'      => $this->is_enabled(),
			'fields_count'    => count( $this->get_fields() ),
			'filters_count'   => count( $this->get_filters() ),
			'templates_count' => count( $this->get_templates() ),
			'total_keys'      => count( $settings ),
			'data_size'       => strlen( maybe_serialize( $settings ) ),
		);
	}

	/**
	 * Clone configuration to another post type
	 *
	 * @param string $target_post_type Target post type key.
	 * @return bool
	 */
	public function clone_to( $target_post_type ) {
		$settings = $this->get_settings();

		// Create new repository for target
		$target_repo = new self( $target_post_type );

		// Copy settings
		return $target_repo->update_settings( $settings );
	}

	/**
	 * Get all VoxelFSE post type repositories
	 *
	 * @return array Array of repository instances.
	 */
	public static function get_all_repositories() {
		global $wpdb;

		// Query all mw_post_type_* options
		$options = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
				'mw_post_type_%'
			)
		);

		$repositories = array();

		foreach ( $options as $option_name ) {
			// Extract post type key
			$post_type_key = str_replace( 'mw_post_type_', '', $option_name );
			$repositories[] = new self( $post_type_key );
		}

		return $repositories;
	}
}
