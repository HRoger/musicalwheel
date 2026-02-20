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
				$url = get_permalink( $this->post_id );
				if ( ! is_string( $url ) ) {
					$url = '';
				}
				return $url;
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
	 * Get the data group type/key.
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'post';
	}
}


