<?php
declare(strict_types=1);

/**
 * MW_Post_Type Wrapper Class
 *
 * Replicates Voxel's Post_Type pattern with composition and GraphQL support.
 * Wraps WP_Post_Type with additional functionality for custom fields,
 * filters, and GraphQL exposure.
 *
 * Based on Voxel Discovery: app/post-type/post-type.php
 *
 * @package MusicalWheel_FSE
 * @since 1.0.0
 */

namespace VoxelFSE\Post_Types;

use WP_Post_Type;

/**
 * Class MW_Post_Type
 *
 * Wrapper for WordPress post types with enhanced functionality.
 */
class MW_Post_Type {
	/**
	 * WordPress post type object
	 *
	 * @var WP_Post_Type
	 */
	private $wp_post_type;

	/**
	 * Post type key (slug)
	 *
	 * @var string
	 */
	private $key;

	/**
	 * Repository for configuration storage
	 *
	 * @var MW_Post_Type_Repository
	 */
	private $repository;

	/**
	 * Field manager instance
	 *
	 * @var array
	 */
	private $fields = array();

	/**
	 * Search filters configuration
	 *
	 * @var array
	 */
	private $filters = array();

	/**
	 * Whether this post type is managed by VoxelFSE
	 *
	 * @var bool
	 */
	private $is_managed = false;

	/**
	 * Constructor
	 *
	 * @param string|WP_Post_Type $post_type Post type key or WP_Post_Type object.
	 * @param MW_Post_Type_Repository $repository Optional. Configuration repository.
	 */
	public function __construct( $post_type, $repository = null ) {
		if ( is_string( $post_type ) ) {
			$this->key = $post_type;
			$this->wp_post_type = get_post_type_object( $post_type );
		} elseif ( $post_type instanceof WP_Post_Type ) {
			$this->wp_post_type = $post_type;
			$this->key = $post_type->name;
		}

		if ( null === $this->wp_post_type ) {
			throw new \InvalidArgumentException(
				sprintf( 'Invalid post type: %s', is_string( $post_type ) ? $post_type : 'unknown' )
			);
		}

		// Initialize repository
		if ( null !== $repository ) {
			$this->repository = $repository;
		} else {
			$this->repository = new MW_Post_Type_Repository( $this->key );
		}

		// Check if managed by VoxelFSE
		$this->is_managed = $this->repository->is_managed();

		// Load configuration if managed
		if ( $this->is_managed ) {
			$this->load_configuration();
		}
	}

	/**
	 * Load configuration from repository
	 */
	private function load_configuration() {
		$settings = $this->repository->get_settings();

		if ( ! empty( $settings['fields'] ) ) {
			$this->fields = $settings['fields'];
		}

		if ( ! empty( $settings['filters'] ) ) {
			$this->filters = $settings['filters'];
		}
	}

	/**
	 * Get post type key
	 *
	 * @return string
	 */
	public function get_key() {
		return $this->key;
	}

	/**
	 * Get post type label
	 *
	 * @return string
	 */
	public function get_label() {
		return $this->wp_post_type->label ?? $this->key;
	}

	/**
	 * Get singular label
	 *
	 * @return string
	 */
	public function get_singular_label() {
		return $this->wp_post_type->labels->singular_name ?? $this->get_label();
	}

	/**
	 * Get plural label
	 *
	 * @return string
	 */
	public function get_plural_label() {
		return $this->wp_post_type->labels->name ?? $this->get_label();
	}

	/**
	 * Get wrapped WP_Post_Type object
	 *
	 * @return WP_Post_Type
	 */
	public function get_wp_post_type() {
		return $this->wp_post_type;
	}

	/**
	 * Get repository instance
	 *
	 * @return MW_Post_Type_Repository
	 */
	public function get_repository() {
		return $this->repository;
	}

	/**
	 * Check if post type is managed by VoxelFSE
	 *
	 * @return bool
	 */
	public function is_managed_by_mw() {
		return $this->is_managed;
	}

	/**
	 * Get all fields
	 *
	 * @return array
	 */
	public function get_fields() {
		return $this->fields;
	}

	/**
	 * Get specific field by key
	 *
	 * @param string $key Field key.
	 * @return array|null
	 */
	public function get_field( $key ) {
		return $this->fields[ $key ] ?? null;
	}

	/**
	 * Add field to post type
	 *
	 * @param string $key Field key.
	 * @param array  $field_data Field configuration.
	 * @return bool
	 */
	public function add_field( $key, $field_data ) {
		$this->fields[ $key ] = $field_data;

		// Save to repository if managed
		if ( $this->is_managed ) {
			return $this->repository->update_setting( 'fields', $this->fields );
		}

		return true;
	}

	/**
	 * Remove field from post type
	 *
	 * @param string $key Field key.
	 * @return bool
	 */
	public function remove_field( $key ) {
		if ( ! isset( $this->fields[ $key ] ) ) {
			return false;
		}

		unset( $this->fields[ $key ] );

		// Save to repository if managed
		if ( $this->is_managed ) {
			return $this->repository->update_setting( 'fields', $this->fields );
		}

		return true;
	}

	/**
	 * Get all filters
	 *
	 * @return array
	 */
	public function get_filters() {
		return $this->filters;
	}

	/**
	 * Get specific filter by key
	 *
	 * @param string $key Filter key.
	 * @return array|null
	 */
	public function get_filter( $key ) {
		return $this->filters[ $key ] ?? null;
	}

	/**
	 * Add filter to post type
	 *
	 * @param string $key Filter key.
	 * @param array  $filter_data Filter configuration.
	 * @return bool
	 */
	public function add_filter( $key, $filter_data ) {
		$this->filters[ $key ] = $filter_data;

		// Save to repository if managed
		if ( $this->is_managed ) {
			return $this->repository->update_setting( 'filters', $this->filters );
		}

		return true;
	}

	/**
	 * Check if post type is public
	 *
	 * @return bool
	 */
	public function is_public() {
		return (bool) $this->wp_post_type->public;
	}

	/**
	 * Check if post type supports feature
	 *
	 * @param string $feature Feature name.
	 * @return bool
	 */
	public function supports( $feature ) {
		return post_type_supports( $this->key, $feature );
	}

	/**
	 * Check if post type is hierarchical
	 *
	 * @return bool
	 */
	public function is_hierarchical() {
		return (bool) $this->wp_post_type->hierarchical;
	}

	/**
	 * Check if post type has archive
	 *
	 * @return bool
	 */
	public function has_archive() {
		return (bool) $this->wp_post_type->has_archive;
	}

	/**
	 * Get GraphQL single name
	 *
	 * @return string|null
	 */
	public function get_graphql_single_name() {
		return $this->wp_post_type->graphql_single_name ?? null;
	}

	/**
	 * Get GraphQL plural name
	 *
	 * @return string|null
	 */
	public function get_graphql_plural_name() {
		return $this->wp_post_type->graphql_plural_name ?? null;
	}

	/**
	 * Check if post type is exposed in GraphQL
	 *
	 * @return bool
	 */
	public function is_graphql_enabled() {
		return isset( $this->wp_post_type->show_in_graphql ) && true === $this->wp_post_type->show_in_graphql;
	}

	/**
	 * Get post type configuration as array
	 *
	 * @return array
	 */
	public function to_array() {
		return array(
			'key'               => $this->key,
			'label'             => $this->get_label(),
			'singular_label'    => $this->get_singular_label(),
			'plural_label'      => $this->get_plural_label(),
			'is_managed'        => $this->is_managed,
			'is_public'         => $this->is_public(),
			'is_hierarchical'   => $this->is_hierarchical(),
			'has_archive'       => $this->has_archive(),
			'graphql_enabled'   => $this->is_graphql_enabled(),
			'graphql_single'    => $this->get_graphql_single_name(),
			'graphql_plural'    => $this->get_graphql_plural_name(),
			'fields_count'      => count( $this->fields ),
			'filters_count'     => count( $this->filters ),
		);
	}

	/**
	 * Register post type with GraphQL support
	 *
	 * This method allows dynamic registration of new post types.
	 *
	 * @param array $args Post type registration arguments.
	 * @param bool  $enable_graphql Whether to enable GraphQL.
	 * @return bool|\WP_Error
	 */
	public static function register( $args, $enable_graphql = true ) {
		// Validate required fields
		if ( empty( $args['key'] ) ) {
			return new \WP_Error( 'missing_key', 'Post type key is required' );
		}

		$key = $args['key'];
		unset( $args['key'] );

		// Add mw_ prefix if not present
		if ( 0 !== strpos( $key, 'mw_' ) ) {
			$key = 'mw_' . $key;
		}

		// Default GraphQL configuration
		if ( $enable_graphql ) {
			$args['show_in_graphql'] = true;

			if ( empty( $args['graphql_single_name'] ) ) {
				$args['graphql_single_name'] = ucfirst( $key );
			}

			if ( empty( $args['graphql_plural_name'] ) ) {
				$args['graphql_plural_name'] = ucfirst( $key ) . 's';
			}
		}

		// Register with WordPress
		$result = register_post_type( $key, $args );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		// Mark as managed by VoxelFSE
		$repository = new MW_Post_Type_Repository( $key );
		$repository->mark_as_managed();

		// Save registration args to repository
		$repository->update_setting( 'registration_args', $args );

		return true;
	}

	/**
	 * Get all VoxelFSE-managed post types
	 *
	 * @return array Array of MW_Post_Type instances.
	 */
	public static function get_all_managed() {
		$managed = array();
		$post_types = get_post_types( array(), 'objects' );

		foreach ( $post_types as $post_type ) {
			$mw_post_type = new self( $post_type );

			if ( $mw_post_type->is_managed_by_mw() ) {
				$managed[] = $mw_post_type;
			}
		}

		return $managed;
	}
}
