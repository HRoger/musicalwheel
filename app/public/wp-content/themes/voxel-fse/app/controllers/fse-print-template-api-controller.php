<?php
/**
 * FSE Print Template API Controller
 *
 * Provides a REST endpoint for rendering template content (JSON).
 * The editor fetches rendered HTML and injects it inline into the
 * editor DOM — matching Elementor's approach where print_template()
 * outputs content inline within the editor canvas.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/print-template.php
 * - Voxel helper: themes/voxel/app/utils/template-utils.php:54-84
 * - FSE render.php: themes/voxel-fse/app/blocks/src/print-template/render.php
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Print_Template_API_Controller extends FSE_Base_Controller {

	const API_NAMESPACE = 'voxel-fse/v1';

	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	protected function authorize(): bool {
		return true;
	}

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/print-template/render', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'render_template' ],
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                => [
				'template_id' => [
					'required'          => true,
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );
	}

	/**
	 * Render template content server-side (JSON response).
	 *
	 * Sets up proper global post context so NectarBlocks and other
	 * plugins can find their per-post CSS via get_the_ID().
	 * Resolves wp_template → template-part references.
	 */
	public function render_template( \WP_REST_Request $request ): \WP_REST_Response {
		$template_id = $request->get_param( 'template_id' );

		if ( ! is_numeric( $template_id ) || (int) $template_id <= 0 ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid template ID',
			], 400 );
		}

		$template_id = (int) $template_id;
		$post        = get_post( $template_id );

		if ( ! $post || ! in_array( $post->post_status, [ 'publish', 'draft', 'private' ], true ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Template not found',
			], 404 );
		}

		// Set up global post context so NectarBlocks (and other plugins) can
		// find their per-post CSS via get_the_ID() / get_post_meta().
		global $wp_query;
		$wp_query->post  = $post;
		$wp_query->posts = [ $post ];
		$GLOBALS['post'] = $post;
		setup_postdata( $post );

		// Resolve template content.
		$raw_content = $post->post_content;

		// For wp_template posts that reference a template-part, resolve the part content.
		if ( $post->post_type === 'wp_template' && preg_match( '/<!--\s*wp:template-part\s+(\{[^}]+\})\s*\/-->/', $raw_content, $m ) ) {
			$part_attrs = json_decode( $m[1], true );
			if ( ! empty( $part_attrs['slug'] ) ) {
				$theme      = $part_attrs['theme'] ?? get_stylesheet();
				$part_posts = get_posts( [
					'post_type'   => 'wp_template_part',
					'post_status' => [ 'publish', 'draft', 'private' ],
					'name'        => $part_attrs['slug'],
					'tax_query'   => [ [
						'taxonomy' => 'wp_theme',
						'field'    => 'name',
						'terms'    => $theme,
					] ],
					'numberposts' => 1,
				] );

				if ( ! empty( $part_posts ) ) {
					$raw_content = $part_posts[0]->post_content;

					// Update global post context to the resolved template-part
					// so NectarBlocks finds its per-post CSS.
					$wp_query->post  = $part_posts[0];
					$wp_query->posts = [ $part_posts[0] ];
					$GLOBALS['post'] = $part_posts[0];
					setup_postdata( $part_posts[0] );
				}
			}
		}

		// Render the blocks.
		$template_content = do_blocks( $raw_content );

		if ( empty( $template_content ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Template rendered as empty',
			], 404 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'content' => $template_content,
		], 200 );
	}
}
