<?php
/**
 * FSE Print Template API Controller
 *
 * Provides a REST endpoint that renders template content server-side,
 * matching the exact logic of render.php. This ensures the editor preview
 * gets fully-rendered HTML with proper Voxel/WordPress styling.
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
	 * Render template content server-side.
	 *
	 * Uses the same logic as render.php:
	 * 1. Try Voxel's print_template() (Elementor templates with CSS)
	 * 2. Fallback to apply_filters('the_content', ...) for WordPress content
	 */
	public function render_template( \WP_REST_Request $request ): \WP_REST_Response {
		$template_id = $request->get_param( 'template_id' );

		if ( ! is_numeric( $template_id ) || (int) $template_id <= 0 ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid template ID',
			], 400 );
		}

		$template_id      = (int) $template_id;
		$template_content = '';

		// Try Voxel's print_template() first (handles Elementor templates with CSS enqueuing).
		if ( function_exists( '\Voxel\is_elementor_active' ) && \Voxel\is_elementor_active() && function_exists( '\Voxel\print_template' ) ) {
			ob_start();
			\Voxel\print_template( $template_id );
			$template_content = ob_get_clean();
		}

		// Fallback: render as WordPress content (pages, reusable blocks, posts).
		if ( empty( $template_content ) ) {
			$post = get_post( $template_id );
			if ( $post && $post->post_status === 'publish' ) {
				$template_content = apply_filters( 'the_content', $post->post_content );
			}
		}

		if ( empty( $template_content ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Template not found or empty',
			], 404 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'content' => $template_content,
		], 200 );
	}
}
