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
				return '';
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


