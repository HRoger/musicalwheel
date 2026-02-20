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

		// Returns raw block markup (post_content) for client-side parsing
		// via parse() + BlockPreview in the editor.
		register_rest_route( self::API_NAMESPACE, '/print-template/content', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_template_content' ],
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
	 * Return raw block markup (post_content) for client-side parsing.
	 *
	 * The editor uses parse() to convert this to block objects, then
	 * BlockPreview renders them using each block's edit.tsx component.
	 * This ensures Plan C+ blocks (navbar, userbar, etc.) render their
	 * full interactive content.
	 */
	public function get_template_content( \WP_REST_Request $request ): \WP_REST_Response {
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
				}
			}
		}

		if ( empty( $raw_content ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Template content is empty',
			], 404 );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'content' => $raw_content,
		], 200 );
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

		// Render the blocks. Use output buffering to catch any stray output
		// and error handling since do_blocks() can trigger fatal errors
		// in REST context (e.g. blocks that assume frontend globals).
		try {
			ob_start();
			$template_content = do_blocks( $raw_content );
			$extra_output     = ob_get_clean();

			// Append any extra output (e.g. inline styles from blocks).
			if ( ! empty( $extra_output ) ) {
				$template_content = $extra_output . $template_content;
			}
		} catch ( \Throwable $e ) {
			ob_end_clean();
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Render error: ' . $e->getMessage(),
			], 500 );
		}

		if ( empty( $template_content ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Template rendered as empty',
			], 404 );
		}

		// Collect inline styles enqueued during do_blocks() (e.g. NectarBlocks
		// column CSS, FSE template CSS). These would normally be printed by
		// wp_head() but in REST context we need to include them explicitly.
		$inline_css = $this->collect_enqueued_inline_styles();
		if ( ! empty( $inline_css ) ) {
			$template_content = '<style>' . $inline_css . '</style>' . $template_content;
		}

		return new \WP_REST_Response( [
			'success' => true,
			'content' => $template_content,
		], 200 );
	}

	/**
	 * Collect inline CSS that was enqueued via wp_add_inline_style()
	 * during do_blocks(). Specifically captures NectarBlocks per-post
	 * CSS and FSE template CSS that would normally be printed by wp_head().
	 */
	private function collect_enqueued_inline_styles(): string {
		$css = '';

		// Collect NectarBlocks per-post dynamic CSS directly from post meta.
		$post_id = get_the_ID();
		if ( $post_id ) {
			$nectar_css = get_post_meta( $post_id, '_nectar_blocks_css', true );
			if ( ! empty( $nectar_css ) ) {
				$css .= $nectar_css;
			}
		}

		// Collect NectarBlocks FSE template CSS from option.
		$fse_css = get_option( 'nectar_blocks_fs_templates_css' );
		if ( is_array( $fse_css ) ) {
			foreach ( $fse_css as $styles ) {
				$css .= $styles;
			}
		}

		// Collect any inline styles WordPress enqueued on known handles.
		$wp_styles = wp_styles();
		$handles   = [ 'nectar-frontend-global', 'nectar-blocks-inline' ];
		foreach ( $handles as $handle ) {
			if ( isset( $wp_styles->registered[ $handle ] ) ) {
				$data = $wp_styles->get_data( $handle, 'after' );
				if ( is_array( $data ) ) {
					$css .= implode( "\n", $data );
				}
			}
		}

		return $css;
	}
}
