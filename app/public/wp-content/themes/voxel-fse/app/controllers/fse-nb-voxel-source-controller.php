<?php
declare(strict_types=1);

/**
 * FSE NectarBlocks Voxel Source Controller
 *
 * Registers Voxel post type fields as a native data source inside
 * NectarBlocks' Dynamic Data system. Fields appear in the "database icon"
 * dropdown alongside "Post" and "ACF" groups.
 *
 * This is a simple fallback for quick field binding. For advanced use cases
 * with modifiers and conditional rendering, use the @tags() system instead
 * (fse-nb-dynamic-tags-controller.php).
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_NB_Voxel_Source_Controller extends FSE_Base_Controller {

	/**
	 * Maps Voxel field types to render method names.
	 * Mirrors the ACF.php $render_methods pattern.
	 */
	private array $render_methods = [
		'text'       => 'render_text',
		'textarea'   => 'render_text',
		'texteditor' => 'render_texteditor',
		'email'      => 'render_text',
		'phone'      => 'render_text',
		'url'        => 'render_text',
		'number'     => 'render_text',
		'date'       => 'render_text',
		'time'       => 'render_text',
		'color'      => 'render_text',
		'select'     => 'render_text',
		'switcher'   => 'render_switcher',
		'image'      => 'render_image',
		'file'       => 'render_file',
		'taxonomy'   => 'render_taxonomy',
		'location'   => 'render_location',
	];

	/**
	 * Voxel field types to skip — too complex for this simple bridge.
	 */
	private const SKIP_TYPES = [
		'ui-step', 'ui-heading', 'ui-html', 'ui-image',
		'repeater', 'work-hours', 'recurring-date',
		'post-relation', 'product', 'title',
	];

	protected function authorize(): bool {
		return defined( 'NECTAR_BLOCKS_VERSION' )
			|| class_exists( '\\Nectar\\Dynamic_Data\\Frontend_Render' );
	}

	protected function hooks(): void {
		// Populate dropdown with Voxel fields (priority 3, after ACF at 2)
		$this->filter( 'nectar_blocks_dynamic_data/currentPost/fields', '@init_voxel_fields', 3, 3 );
		$this->filter( 'nectar_blocks_dynamic_data/otherPosts/fields', '@init_voxel_fields', 3, 3 );

		// Render Voxel field values (priority 21, after ACF at 20)
		$this->filter( 'nectar_blocks_dynamic_data/currentPost/content', '@get_content', 21, 3 );
		$this->filter( 'nectar_blocks_dynamic_data/otherPosts/content', '@get_content', 21, 3 );

		// Append Voxel fields to NB's REST API response for the editor dropdown.
		// NB's editor fetches /nectar-blocks/v1/post-data/dynamic-fields to populate
		// the Field select — that endpoint has no filter, so we intercept the response.
		$this->filter( 'rest_post_dispatch', '@append_voxel_fields_to_rest', 10, 3 );
	}

	// -------------------------------------------------------------------------
	// REST API interceptor — appends Voxel fields to editor dropdown
	// -------------------------------------------------------------------------

	/**
	 * Intercept NB's /post-data/dynamic-fields REST response and append Voxel fields.
	 *
	 * NB's editor JS fetches this endpoint to populate the Field dropdown.
	 * The endpoint itself has no filter hook, so we augment the response here.
	 *
	 * @param \WP_REST_Response $response
	 * @param \WP_REST_Server   $server
	 * @param \WP_REST_Request  $request
	 */
	protected function append_voxel_fields_to_rest( $response, $server, $request ) {
		if ( ! $response instanceof \WP_REST_Response ) {
			return $response;
		}

		// Only intercept the NB dynamic-fields endpoint.
		$route = $request->get_route();
		if ( $route !== '/nectar/v1/post-data/dynamic-fields' ) {
			return $response;
		}

		if ( ! class_exists( '\\Voxel\\Post_Type' ) ) {
			return $response;
		}

		// Only augment successful responses (skip 401, 404, etc.).
		$status = $response->get_status();
		if ( $status < 200 || $status >= 300 ) {
			return $response;
		}

		$post_id = $request->get_param( 'postId' );
		$voxel_post_types = $this->resolve_all_voxel_post_types( $post_id );

		if ( empty( $voxel_post_types ) ) {
			return $response;
		}

		$data = $response->get_data();
		if ( ! is_array( $data ) ) {
			$data = [];
		}

		foreach ( $voxel_post_types as $voxel_pt ) {
			$group_label = sprintf( 'Voxel: %s', $voxel_pt->get_label() );
			$options     = [];

			foreach ( $voxel_pt->get_fields() as $field_key => $field ) {
				$field_type = $field->get_type();

				if ( in_array( $field_type, self::SKIP_TYPES, true ) ) {
					continue;
				}
				if ( ! isset( $this->render_methods[ $field_type ] ) ) {
					continue;
				}

				$options[] = [
					'value' => $field_key,
					'label' => $field->get_label(),
					'type'  => $field_type,
					'group' => 'voxel',
				];
			}

			if ( ! empty( $options ) ) {
				$data[] = [
					'label'   => $group_label,
					'options' => $options,
				];
			}
		}

		$response->set_data( $data );
		return $response;
	}

	/**
	 * Resolve which Voxel post types to show fields for.
	 *
	 * In template context (post_id = 0 or wp_template), we show fields
	 * for ALL Voxel-managed post types since we can't know which one
	 * the template will be used with.
	 *
	 * @return \Voxel\Post_Type[]
	 */
	private function resolve_all_voxel_post_types( $post_id ): array {
		$post_id   = (int) $post_id;
		$post_type = $post_id ? get_post_type( $post_id ) : '';

		// If we have a concrete Voxel post, show just that type.
		if ( $post_type && ! in_array( $post_type, [ 'wp_template', 'wp_template_part', 'page' ], true ) ) {
			try {
				$voxel_pt = \Voxel\Post_Type::get( $post_type );
				if ( $voxel_pt ) {
					return [ $voxel_pt ];
				}
			} catch ( \Exception $e ) {
				// Not a Voxel post type — fall through.
			}
		}

		// Template context or no post context — return all Voxel post types.
		$all = [];
		foreach ( \Voxel\Post_Type::get_voxel_types() as $voxel_pt ) {
			$all[] = $voxel_pt;
		}
		return $all;
	}

	// -------------------------------------------------------------------------
	// Fields filter — populates the NectarBlocks dropdown (frontend rendering)
	// -------------------------------------------------------------------------

	protected function init_voxel_fields( array $output, $post_id, bool $is_editor ): array {
		if ( ! class_exists( '\\Voxel\\Post_Type' ) ) {
			return $output;
		}

		$post_type_slug = $this->resolve_post_type( $post_id, $is_editor );
		if ( ! $post_type_slug ) {
			return $output;
		}

		try {
			$voxel_pt = \Voxel\Post_Type::get( $post_type_slug );
		} catch ( \Exception $e ) {
			return $output;
		}

		if ( ! $voxel_pt ) {
			return $output;
		}

		$group_label = sprintf( 'Voxel: %s', $voxel_pt->get_label() );

		foreach ( $voxel_pt->get_fields() as $field_key => $field ) {
			$field_type = $field->get_type();

			if ( in_array( $field_type, self::SKIP_TYPES, true ) ) {
				continue;
			}

			if ( ! isset( $this->render_methods[ $field_type ] ) ) {
				continue;
			}

			$output[ $field_key ] = [
				'title'      => $field->get_label(),
				'group'      => $group_label,
				'field_data' => [
					'type'       => $field_type,
					'field_name' => $field_key,
					'field_type' => 'voxel',
					// Taxonomy slug stored here so content filter can use it.
					'taxonomy'   => ( $field_type === 'taxonomy' )
						? ( $field->get_prop( 'taxonomy' ) ?? '' )
						: '',
				],
			];
		}

		return $output;
	}

	/**
	 * Resolve a WordPress post type slug from the post_id parameter NB passes.
	 *
	 * - Numeric post ID → get_post_type()
	 * - "0" in editor → try current screen
	 * - "post-type-slug-123" (otherPosts format) → extract slug
	 */
	private function resolve_post_type( $post_id, bool $is_editor ): ?string {
		$post_id = (string) $post_id;

		if ( empty( $post_id ) || $post_id === '0' ) {
			if ( $is_editor && function_exists( 'get_current_screen' ) ) {
				$screen = get_current_screen();
				if ( $screen && ! empty( $screen->post_type ) ) {
					return $screen->post_type;
				}
			}
			return null;
		}

		if ( is_numeric( $post_id ) ) {
			$type = get_post_type( (int) $post_id );
			return $type ?: null;
		}

		// otherPosts format: "post-type-slug-123" (last segment is numeric ID)
		$parts = explode( '-', $post_id );
		if ( count( $parts ) > 1 ) {
			$slug = implode( '-', array_slice( $parts, 0, -1 ) );
			if ( post_type_exists( $slug ) ) {
				return $slug;
			}
		}

		return null;
	}

	// -------------------------------------------------------------------------
	// Content filter — renders the field value
	// -------------------------------------------------------------------------

	protected function get_content( $output, array $args, bool $is_editor ) {
		if ( ! $this->is_voxel_field( $args ) ) {
			return $output;
		}

		$field_type = $args['field_data']['type'] ?? '';

		// Image in full-replacement context → return <img> tag
		if ( $args['replacement_type'] === 'image' && $field_type === 'image' ) {
			return $this->render_image_in_content( $args, $is_editor );
		}

		if ( isset( $this->render_methods[ $field_type ] ) ) {
			return call_user_func( [ $this, $this->render_methods[ $field_type ] ], $args, $is_editor );
		}

		return '';
	}

	private function is_voxel_field( array $args ): bool {
		return isset( $args['field_data']['field_type'] )
			&& $args['field_data']['field_type'] === 'voxel';
	}

	// -------------------------------------------------------------------------
	// Render methods
	// -------------------------------------------------------------------------

	private function render_text( array $args, bool $is_editor ): string {
		$value = get_post_meta( $args['post_id'], $args['field_data']['field_name'], true );

		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return '';
		}

		return wp_kses_post( (string) $value );
	}

	private function render_texteditor( array $args, bool $is_editor ): string {
		if ( $is_editor ) {
			return esc_html__( 'Rich text field — renders on the frontend.', 'voxel-fse' );
		}

		$value = get_post_meta( $args['post_id'], $args['field_data']['field_name'], true );
		return is_string( $value ) ? wp_kses_post( $value ) : '';
	}

	private function render_switcher( array $args, bool $is_editor ): string {
		$value      = get_post_meta( $args['post_id'], $args['field_data']['field_name'], true );
		$true_text  = $args['attributes']['isTrueText'] ?? __( 'Yes', 'voxel-fse' );
		$false_text = $args['attributes']['isFalseText'] ?? __( 'No', 'voxel-fse' );

		return (bool) $value ? wp_kses_post( $true_text ) : wp_kses_post( $false_text );
	}

	/**
	 * Image — attribute context (returns URL for use in href, src attr, etc.)
	 */
	private function render_image( array $args, bool $is_editor ): string {
		$ids = $this->get_attachment_ids( $args );
		if ( empty( $ids ) ) {
			return '';
		}

		$image_size = $args['attributes']['size'] ?? 'full';
		return wp_get_attachment_image_url( $ids[0], $image_size ) ?: '';
	}

	/**
	 * Image — full replacement context (returns <img> tag)
	 */
	private function render_image_in_content( array $args, bool $is_editor ): string {
		$ids = $this->get_attachment_ids( $args );
		if ( empty( $ids ) ) {
			return '';
		}

		$image_size  = $args['attributes']['size'] ?? 'full';
		$img_attrs   = [ 'loading' => 'lazy', 'decoding' => 'async' ];

		if ( ! empty( $args['class'] ) ) {
			$img_attrs['class'] = $args['class'];
		}

		return wp_get_attachment_image( $ids[0], $image_size, false, $img_attrs );
	}

	private function render_file( array $args, bool $is_editor ): string {
		$ids = $this->get_attachment_ids( $args );
		if ( empty( $ids ) ) {
			return '';
		}

		return wp_get_attachment_url( $ids[0] ) ?: '';
	}

	private function render_taxonomy( array $args, bool $is_editor ): string {
		$taxonomy = $args['field_data']['taxonomy'] ?? '';
		if ( empty( $taxonomy ) ) {
			return '';
		}

		$terms = get_the_terms( $args['post_id'], $taxonomy );
		if ( empty( $terms ) || is_wp_error( $terms ) ) {
			return '';
		}

		return implode( ', ', array_map( fn( $t ) => esc_html( $t->name ), $terms ) );
	}

	private function render_location( array $args, bool $is_editor ): string {
		$meta = get_post_meta( $args['post_id'], $args['field_data']['field_name'], true );

		if ( is_array( $meta ) ) {
			$value = $meta;
		} elseif ( is_string( $meta ) && $meta !== '' ) {
			$value = (array) json_decode( $meta, true );
		} else {
			return '';
		}

		return esc_html( $value['address'] ?? '' );
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	/**
	 * Voxel stores image/file fields as comma-separated attachment IDs in post_meta.
	 *
	 * @return int[]
	 */
	private function get_attachment_ids( array $args ): array {
		$meta = get_post_meta( $args['post_id'], $args['field_data']['field_name'], true );
		return array_filter( array_map( 'absint', explode( ',', (string) $meta ) ) );
	}
}
