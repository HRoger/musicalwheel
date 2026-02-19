<?php
/**
 * Block - Server-Side Render (Frontend only)
 *
 * Renders the selected template on the frontend.
 * - Elementor templates: rendered via Voxel's print_template().
 * - WordPress/FSE content (pages, reusable blocks, template parts): rendered via do_blocks().
 *
 * The editor preview is handled by edit.tsx using BlockPreview + parse(),
 * which renders the template's blocks using their edit.tsx components.
 *
 * Reference: themes/voxel/app/widgets/print-template.php:42-46
 * Reference: themes/voxel/app/utils/template-utils.php:54-84
 *
 * This block relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * @package VoxelFSE
 */

$template_id = $attributes['templateId'] ?? '';
$template_content = '';

if ( is_numeric( $template_id ) && (int) $template_id > 0 ) {
	$template_id = (int) $template_id;
	$post = get_post( $template_id );

	if ( $post && in_array( $post->post_status, [ 'publish', 'draft', 'private' ], true ) ) {
		$is_elementor_template = ! empty( get_post_meta( $template_id, '_elementor_edit_mode', true ) );

		if ( $is_elementor_template ) {
			if ( function_exists( '\Voxel\is_elementor_active' ) && \Voxel\is_elementor_active() && function_exists( '\Voxel\print_template' ) ) {
				ob_start();
				\Voxel\print_template( $template_id );
				$template_content = ob_get_clean();
			}

			// Fallback placeholder for Elementor templates when Elementor is not active.
			if ( empty( $template_content ) ) {
				$title = $post->post_title;
				$template_content = '<div style="display:flex;align-items:center;justify-content:center;background:rgb(213 216 220 / 80%);height:45px;width:100%;color:#666;font-size:13px;gap:8px;">'
					. '<span style="font-family:eicons;font-size:24px;opacity:0.3;line-height:1;font-style:normal;">&#xe817;</span>'
					. '<span style="opacity:0.6;">#' . esc_html( $template_id ) . ': ' . esc_html( $title ) . '</span>'
					. '</div>';
			}
		} else {
			// WordPress/FSE content: render via do_blocks().
			$raw_content = $post->post_content;

			// For wp_template posts that reference a template-part, resolve the part content.
			if ( $post->post_type === 'wp_template' && preg_match( '/<!--\s*wp:template-part\s+(\{[^}]+\})\s*\/-->/', $raw_content, $m ) ) {
				$part_attrs = json_decode( $m[1], true );
				if ( ! empty( $part_attrs['slug'] ) ) {
					$theme = $part_attrs['theme'] ?? get_stylesheet();
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

			$template_content = do_blocks( $raw_content );
		}
	}
}

// Output rendered content.
if ( ! empty( $template_content ) ) {
	$closing_div_pos = strrpos( $content, '</div>' );
	if ( $closing_div_pos !== false ) {
		$content = substr( $content, 0, $closing_div_pos ) . $template_content . '</div>';
	} else {
		$content = $template_content;
	}
}

return $content;
