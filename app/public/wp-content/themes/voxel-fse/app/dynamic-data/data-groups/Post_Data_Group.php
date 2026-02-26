<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Data_Groups;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Data_Group extends Base_Data_Group {

	protected $post_id;

	public function __construct( ?int $post_id = null ) {
		$this->post_id = $post_id ?: get_the_ID();
	}

	public function resolve_property( array $property_path, mixed $token = null ): ?string {
		if ( empty( $this->post_id ) ) {
			return '';
		}

		$post = get_post( $this->post_id );
		if ( ! $post ) {
			return '';
		}

		// Ensure property_path is valid and get first element
		if ( empty( $property_path ) || ! is_array( $property_path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) ( $property_path[0] ?? '' ) ) );
		// Strip Voxel's native colon prefix for built-in fields (e.g. :title → title)
		$key = ltrim( $key, ':' );

		if ( empty( $key ) ) {
			return '';
		}

		switch ( $key ) {
			case 'id':
				return (string) absint( $this->post_id );
			case 'title':
				// Use post object property directly to avoid filter issues
				$title = isset( $post->post_title ) ? $post->post_title : '';
				// Apply the_title filter manually for consistency with WordPress
				if ( ! empty( $title ) ) {
					$title = apply_filters( 'the_title', $title, $this->post_id );
				}
				// Ensure it's a string
				if ( ! is_string( $title ) ) {
					if ( is_array( $title ) ) {
						// If somehow an array, join it
						$title = implode( '', $title );
					} else {
						$title = (string) $title;
					}
				}
				return $title;
			case 'content':
				// Use post object property directly
				$content = isset( $post->post_content ) ? $post->post_content : '';
				// Apply the_content filter, but temporarily remove block rendering to prevent recursion
				if ( ! empty( $content ) ) {
					// Remove do_blocks from the_content filter to prevent infinite loops
					$priority = has_filter( 'the_content', 'do_blocks' );
					if ( false !== $priority ) {
						remove_filter( 'the_content', 'do_blocks', $priority );
					}

					$content = apply_filters( 'the_content', $content );

					// Re-add do_blocks filter
					if ( false !== $priority ) {
						add_filter( 'the_content', 'do_blocks', $priority );
					}
				}
				// Ensure it's a string
				if ( ! is_string( $content ) ) {
					if ( is_array( $content ) ) {
						$content = implode( '', $content );
					} else {
						$content = (string) $content;
					}
				}
				return $content;
			case 'permalink':
			case 'url':
				$url = get_permalink( $this->post_id );
				if ( ! is_string( $url ) ) {
					$url = '';
				}
				return $url;
			case 'date':
				$date = isset( $post->post_date ) ? $post->post_date : '';
				return is_string( $date ) ? $date : '';
			case 'modified_date':
				$date = isset( $post->post_modified ) ? $post->post_modified : '';
				return is_string( $date ) ? $date : '';
			case 'status':
				$status = isset( $post->post_status ) ? $post->post_status : '';
				$sub_key = ! empty( $property_path[1] ) ? strtolower( trim( ltrim( (string) $property_path[1], ':' ) ) ) : '';
				if ( $sub_key === 'label' ) {
					// Return human-readable status label (e.g. "Published", "Draft")
					$status_obj = get_post_status_object( $status );
					return $status_obj ? $status_obj->label : ucfirst( $status );
				}
				return $status;
			case 'excerpt':
				$excerpt = isset( $post->post_excerpt ) ? $post->post_excerpt : '';
				if ( empty( $excerpt ) && ! empty( $post->post_content ) ) {
					$excerpt = wp_trim_words( $post->post_content, 55, '...' );
				}
				return is_string( $excerpt ) ? $excerpt : '';
			case 'author':
				$author_id = isset( $post->post_author ) ? (int) $post->post_author : 0;
				if ( ! $author_id ) {
					return '';
				}
				$author = get_userdata( $author_id );
				return $author ? $author->display_name : '';
			case 'slug':
				return isset( $post->post_name ) ? $post->post_name : '';
			default:
				// Voxel custom post fields — stored as post meta.
				// Supports sub-properties like @post(gallery.ids), @post(gallery.url), @post(gallery.id)
				//
				// How Voxel stores file/image/gallery fields:
				//   update_post_meta($post_id, $field_key, join(',', $file_ids))
				//   e.g. get_post_meta($id, 'gallery', true) → "96,97,98"
				//
				// Evidence: themes/voxel/app/post-types/fields/file-field.php:77 (update)
				// Evidence: themes/voxel/app/post-types/fields/file-field.php:89-93 (get_value_from_post)
				// Evidence: themes/voxel/app/post-types/fields/file-field.php:139-184 (dynamic_data exports)
				return $this->resolve_voxel_field( $key, array_slice( $property_path, 1 ) );
		}
	}

	/**
	 * Resolve a Voxel custom post field with optional sub-property.
	 *
	 * Matches Voxel's dynamic_data() exports for File_Field (file/image/gallery):
	 *   - ids  → comma-separated attachment IDs (e.g. "96,97,98")
	 *   - id   → first attachment ID
	 *   - url  → URL of first attachment
	 *   - name → filename of first attachment
	 *   - (no sub-property) → raw meta value
	 *
	 * Also handles any other post meta field as a simple string fallback.
	 *
	 * @param string $field_key  The field key (e.g. "gallery", "logo", "cover_image").
	 * @param array  $sub_path   Remaining property path after the field key (e.g. ["ids"]).
	 * @return string Resolved value.
	 */
	protected function resolve_voxel_field( string $field_key, array $sub_path ): string {
		// Try resolving through Voxel's field API for complex fields.

		// 1. Product field addons: @post(product.addon_key.price)
		// Evidence: themes/voxel/app/post-types/fields/product-field/exports.php:109-168
		if ( count( $sub_path ) >= 2 && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_product_field_addon( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		// 2. Taxonomy field sub-properties: @post(amenities.icon), @post(amenities.label)
		// In Voxel parent, taxonomy fields export as Object_List of Term objects.
		// Each term exposes properties (icon, label, slug, color, etc.) via Term_Data_Group.
		// Evidence: themes/voxel/app/post-types/fields/taxonomy-field/exports.php:14-24
		// Evidence: themes/voxel/app/post-types/fields/taxonomy-field.php:239-251 (get_value_from_post)
		if ( ! empty( $sub_path ) && class_exists( '\\Voxel\\Post' ) ) {
			$result = $this->resolve_taxonomy_field( $field_key, $sub_path );
			if ( $result !== null ) {
				return $result;
			}
		}

		$meta_value = get_post_meta( $this->post_id, $field_key, true );

		if ( $meta_value === '' || $meta_value === false ) {
			return '';
		}

		$sub_key = ! empty( $sub_path ) ? strtolower( trim( (string) $sub_path[0] ) ) : '';

		switch ( $sub_key ) {
			case 'ids':
				// Return all attachment IDs as comma-separated string
				// Evidence: file-field.php:156-163
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				return ! empty( $ids ) ? implode( ',', $ids ) : '';

			case 'id':
				// Return first attachment ID
				// Evidence: file-field.php:146-148 (loopable), 169-171 (single)
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				return ! empty( $ids ) ? (string) $ids[0] : '';

			case 'url':
				// Return URL of first attachment
				// Evidence: file-field.php:149-151 (loopable), 173-175 (single)
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				if ( empty( $ids ) ) {
					return '';
				}
				$url = wp_get_attachment_url( $ids[0] );
				return $url ? $url : '';

			case 'name':
				// Return filename of first attachment
				// Evidence: file-field.php:152-155 (loopable), 177-180 (single)
				$ids = array_filter( array_map( 'absint', explode( ',', (string) $meta_value ) ) );
				if ( empty( $ids ) ) {
					return '';
				}
				$attachment = get_post( $ids[0] );
				if ( ! $attachment ) {
					return '';
				}
				$file = get_attached_file( $attachment->ID );
				return $file ? wp_basename( $file ) : '';

			default:
				// No sub-property — return raw meta value as string
				return (string) $meta_value;
		}
	}

	/**
	 * Resolve product field addon properties via Voxel's API.
	 *
	 * Handles paths like: @post(product_field.addon_key.property)
	 * where property is one of: label, price, min, max
	 *
	 * Evidence: themes/voxel/app/post-types/fields/product-field/exports.php:109-168
	 *
	 * @param string $field_key The product field key.
	 * @param array  $sub_path  Remaining path: ['addon_key', 'property'].
	 * @return string|null Resolved value, or null if not a product field addon.
	 */
	protected function resolve_product_field_addon( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Product_Field ) ) {
				return null;
			}

			$addon_key = $sub_path[0];
			$property  = strtolower( trim( (string) ( $sub_path[1] ?? '' ) ) );

			$addons_field = $field->get_product_field( 'addons' );
			if ( ! $addons_field ) {
				return '';
			}

			$addon = $addons_field->get_addon( $addon_key );
			if ( ! $addon || $addon->get_type() !== 'numeric' || ! $addon->is_active() ) {
				return '';
			}

			if ( $property === 'label' ) {
				return (string) $addon->get_label();
			}

			$value = $addon->get_value();
			if ( ! is_array( $value ) ) {
				return '';
			}

			switch ( $property ) {
				case 'price':
					return (string) ( $value['price'] ?? '' );
				case 'min':
					return (string) ( $value['min'] ?? '' );
				case 'max':
					return (string) ( $value['max'] ?? '' );
				default:
					return '';
			}
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Resolve taxonomy field sub-properties via Voxel's field API.
	 *
	 * Handles paths like: @post(amenities.icon), @post(categories.label)
	 * Taxonomy fields in Voxel store terms via WordPress taxonomy API (get_the_terms).
	 * Each term has properties (icon, label, slug, color, etc.) exposed via Term_Data_Group.
	 *
	 * Returns the first term's sub-property value (matching Voxel's non-loop behavior).
	 * In a loop context, the loop system iterates over all terms.
	 *
	 * Evidence: themes/voxel/app/post-types/fields/taxonomy-field/exports.php:14-24
	 * Evidence: themes/voxel/app/post-types/fields/taxonomy-field.php:239-251
	 *
	 * @param string $field_key The taxonomy field key (e.g. "amenities").
	 * @param array  $sub_path  Remaining path after the field key (e.g. ["icon"]).
	 * @return string|null Resolved value, or null if not a taxonomy field.
	 */
	protected function resolve_taxonomy_field( string $field_key, array $sub_path ): ?string {
		try {
			$post = \Voxel\Post::get( $this->post_id );
			if ( ! $post ) {
				return null;
			}

			$field = $post->get_field( $field_key );
			if ( ! ( $field instanceof \Voxel\Post_Types\Fields\Taxonomy_Field ) ) {
				return null;
			}

			// Get terms assigned to this post for this taxonomy field
			$taxonomy_key = $field->get_prop( 'taxonomy' );
			if ( empty( $taxonomy_key ) ) {
				return null;
			}

			$terms = get_the_terms( $this->post_id, $taxonomy_key );
			if ( empty( $terms ) || is_wp_error( $terms ) ) {
				return '';
			}

			// Use first term's sub-property (non-loop context)
			$first_term = $terms[0];
			$term_group = Term_Data_Group::get( $first_term->term_id, $first_term->taxonomy );
			$result = $term_group->resolve_property( $sub_path );
			return $result;
		} catch ( \Throwable $e ) {
			return null;
		}
	}

	/**
	 * Get the data group type/key.
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'post';
	}
}


