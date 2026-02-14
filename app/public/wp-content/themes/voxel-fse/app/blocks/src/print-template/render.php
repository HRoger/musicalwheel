<?php
/**
 * Block - Server-Side Render
 *
 * Renders the selected template server-side, matching Voxel's print_template() exactly.
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

	// Try Voxel's print_template() first (handles Elementor templates with CSS enqueuing).
	if ( function_exists( '\Voxel\is_elementor_active' ) && \Voxel\is_elementor_active() && function_exists( '\Voxel\print_template' ) ) {
		ob_start();
		\Voxel\print_template( $template_id );
		$template_content = ob_get_clean();
	}

	// Fallback: render as WordPress content (pages, reusable blocks, posts).
	// This handles the FSE case where Elementor is not active.
	if ( empty( $template_content ) ) {
		$post = get_post( $template_id );
		if ( $post && $post->post_status === 'publish' ) {
			// Apply block parsing and shortcodes, matching WordPress core rendering.
			$template_content = apply_filters( 'the_content', $post->post_content );
		}
	}
}

// Output rendered content.
if ( ! empty( $template_content ) ) {
	// When called from ServerSideRender (editor), $content is empty — output directly.
	$closing_div_pos = strrpos( $content, '</div>' );
	if ( $closing_div_pos !== false ) {
		$content = substr( $content, 0, $closing_div_pos ) . $template_content . '</div>';
	} else {
		$content = $template_content;
	}
}

return $content;
