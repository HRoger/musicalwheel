<?php
declare(strict_types=1);

/**
 * Term Data Group
 *
 * Provides taxonomy term data for dynamic tags.
 * Usage: @term(label), @term(slug), @term(description)
 *
 * @package MusicalWheel
 */

namespace VoxelFSE\Dynamic_Data\Data_Groups;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Term_Data_Group class
 *
 * Handles term-related dynamic data with singleton pattern per term ID.
 */
class Term_Data_Group extends Base_Data_Group {

	/**
	 * Singleton instances cache
	 *
	 * @var array<int, self>
	 */
	protected static $instances = array();

	/**
	 * WordPress term ID
	 *
	 * @var int
	 */
	protected $term_id;

	/**
	 * Taxonomy name
	 *
	 * @var string
	 */
	protected $taxonomy;

	/**
	 * Constructor
	 *
	 * @param int    $term_id  WordPress term ID.
	 * @param string $taxonomy Taxonomy name (optional, will be detected).
	 */
	protected function __construct( int $term_id, string $taxonomy = '' ) {
		$this->term_id = $term_id;

		// If taxonomy not provided, try to detect it
		if ( empty( $taxonomy ) && $term_id > 0 ) {
			$term = get_term( $term_id );
			if ( $term && ! is_wp_error( $term ) ) {
				$this->taxonomy = $term->taxonomy;
			}
		} else {
			$this->taxonomy = $taxonomy;
		}
	}

	/**
	 * Get singleton instance for term
	 *
	 * @param int    $term_id  Term ID.
	 * @param string $taxonomy Taxonomy name (optional).
	 * @return self
	 */
	public static function get( int $term_id, string $taxonomy = '' ): self {
		if ( ! array_key_exists( $term_id, static::$instances ) ) {
			static::$instances[ $term_id ] = new static( $term_id, $taxonomy );
		}

		return static::$instances[ $term_id ];
	}

	/**
	 * Unset instance from cache
	 *
	 * @param int $term_id Term ID to remove from cache.
	 */
	public static function unset( int $term_id ): void {
		unset( static::$instances[ $term_id ] );
	}

	/**
	 * Get term ID
	 *
	 * @return int
	 */
	public function get_term_id(): int {
		return $this->term_id;
	}

	/**
	 * Get taxonomy
	 *
	 * @return string
	 */
	public function get_taxonomy(): string {
		return $this->taxonomy;
	}

	/**
	 * Resolve property value
	 *
	 * @param array $property_path Property path (e.g., ['label'] or ['taxonomy', 'name']).
	 * @param mixed $token Token object (optional).
	 * @return string
	 */
	public function resolve_property( array $property_path, mixed $token = null ): ?string {
		if ( empty( $this->term_id ) ) {
			return '';
		}

		$term = get_term( $this->term_id, $this->taxonomy );
		if ( ! $term || is_wp_error( $term ) ) {
			return '';
		}

		// Ensure property_path is valid and get first element
		if ( empty( $property_path ) || ! is_array( $property_path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) ( $property_path[0] ?? '' ) ) );
		// Strip Voxel's native colon prefix for built-in fields (e.g. :label → label)
		$key = ltrim( $key, ':' );

		if ( empty( $key ) ) {
			return '';
		}

		// Handle nested properties
		if ( count( $property_path ) > 1 ) {
			switch ( $key ) {
				case 'area':
					return $this->resolve_area_property( array_slice( $property_path, 1 ) );

				case 'parent':
					return $this->resolve_parent_property( $term, array_slice( $property_path, 1 ) );

				case 'taxonomy':
					return $this->resolve_taxonomy_property( $term, array_slice( $property_path, 1 ) );
			}
		}

		switch ( $key ) {
			case 'id':
				return (string) absint( $this->term_id );

			case 'label':
			case 'name':
				return $term->name ?: '';

			case 'slug':
				return $term->slug ?: '';

			case 'description':
				$description = $term->description ?: '';
				// Process description through WordPress filters
				if ( ! empty( $description ) ) {
					$description = wpautop( $description );
					$description = links_add_target( make_clickable( $description ) );
				}
				return $description;

			case 'icon':
				// Get term icon (custom meta field)
				$icon = get_term_meta( $this->term_id, 'voxel_icon', true );
				return is_string( $icon ) ? $icon : '';

			case 'link':
			case 'url':
				return get_term_link( $term ) ?: '';

			case 'image':
				// Get term image attachment ID
				$image_id = get_term_meta( $this->term_id, 'voxel_image', true );
				return $image_id ? (string) absint( $image_id ) : '0';

			case 'color':
				// Get term color
				$color = get_term_meta( $this->term_id, 'voxel_color', true );
				return is_string( $color ) ? $color : '';

			case 'parent':
				// Parent term name (no sub-property)
				return $this->resolve_parent_property( $term, [] );

			case 'taxonomy':
				// Taxonomy key (no sub-property)
				return $term->taxonomy;

			default:
				return '';
		}
	}

	/**
	 * Resolve area property
	 *
	 * @param array $path Property path after 'area'.
	 * @return string
	 */
	protected function resolve_area_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		// Get area data from term meta
		$area_data = get_term_meta( $this->term_id, 'voxel_area', true );

		switch ( $key ) {
			case 'address':
				// Area address string
				// TODO: Implement when location backend exists
				return isset( $area_data['address'] ) ? (string) $area_data['address'] : '';

			case 'southwest':
				return $this->resolve_coordinates( $area_data, 'southwest', $path );

			case 'northeast':
				return $this->resolve_coordinates( $area_data, 'northeast', $path );

			default:
				return '';
		}
	}

	/**
	 * Resolve coordinates (southwest/northeast)
	 *
	 * @param mixed  $area_data Area data from meta.
	 * @param string $coord_type Coordinate type (southwest/northeast).
	 * @param array  $path Full property path.
	 * @return string
	 */
	protected function resolve_coordinates( $area_data, string $coord_type, array $path ): string {
		// Need at least 'area.southwest.lat' or 'area.southwest.lng'
		if ( count( $path ) < 2 ) {
			return '';
		}

		$property = strtolower( trim( (string) $path[1] ) );

		if ( ! in_array( $property, [ 'lat', 'lng' ], true ) ) {
			return '';
		}

		// Get coordinates from area data
		if ( isset( $area_data[ $coord_type ][ $property ] ) ) {
			return (string) $area_data[ $coord_type ][ $property ];
		}

		// TODO: Implement when location backend exists
		return '';
	}

	/**
	 * Resolve parent property (recursive)
	 *
	 * @param object $term Current term object.
	 * @param array  $path Property path after 'parent'.
	 * @return string
	 */
	protected function resolve_parent_property( $term, array $path ): string {
		if ( empty( $term->parent ) ) {
			return '';
		}

		// Get parent term
		$parent_term = get_term( $term->parent, $this->taxonomy );
		if ( ! $parent_term || is_wp_error( $parent_term ) ) {
			return '';
		}

		// If no further path, return parent term name
		if ( empty( $path ) ) {
			return $parent_term->name ?: '';
		}

		// Create parent term data group instance
		$parent_group = Term_Data_Group::get( $parent_term->term_id, $parent_term->taxonomy );

		// Recursively resolve property on parent
		return $parent_group->resolve_property( $path );
	}

	/**
	 * Resolve taxonomy property
	 *
	 * @param object $term Term object.
	 * @param array  $path Property path after 'taxonomy'.
	 * @return string
	 */
	protected function resolve_taxonomy_property( $term, array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		// Get taxonomy object
		$taxonomy_obj = get_taxonomy( $term->taxonomy );
		if ( ! $taxonomy_obj ) {
			return '';
		}

		switch ( $key ) {
			case 'key':
			case 'name':
				// Taxonomy key/slug
				return $term->taxonomy;

			case 'label':
			case 'singular_name':
			case 'singular-name':
				// Taxonomy singular label
				return $taxonomy_obj->labels->singular_name ?? '';

			case 'plural_name':
			case 'plural-name':
				// Taxonomy plural label
				return $taxonomy_obj->label ?? '';

			default:
				return '';
		}
	}

	/**
	 * Get the data group type/key
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'term';
	}

	/**
	 * Get property aliases
	 *
	 * Shortcuts for common properties.
	 *
	 * @return array<string, string>
	 */
	protected function get_aliases(): array {
		return array(
			':id'          => 'id',
			':label'       => 'label',
			':name'        => 'label',
			':slug'        => 'slug',
			':description' => 'description',
			':icon'        => 'icon',
			':url'         => 'link',
			':link'        => 'link',
			':image'       => 'image',
			':color'       => 'color',
		);
	}

	/**
	 * Get custom methods (group-specific modifiers)
	 *
	 * @return array<string, string>
	 */
	public function methods(): array {
		return array();
		// Future: 'meta' => Term_Meta_Method::class,
		// Future: 'post_count' => Term_Post_Count_Method::class
	}

	/**
	 * Create mock instance for testing
	 *
	 * @return self
	 */
	public static function mock(): self {
		return new static( 0 );
	}
}
