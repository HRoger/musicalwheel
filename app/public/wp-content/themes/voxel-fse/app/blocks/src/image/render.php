<?php
/**
 * Block - Server-Side Render
 *
 * Handles:
 * 1. Dynamic image tag resolution (imageDynamicTag → actual image URL)
 * 2. Attachment caption resolution (captionSource=attachment)
 *
 * This block also relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * @package VoxelFSE
 */

// 1. Resolve dynamic image tag server-side
// When imageDynamicTag is set (e.g., @tags()@term(image)@endtags()), save.tsx outputs
// <img src="" data-dynamic-image="..."> which we replace with the resolved image URL.
if ( ! empty( $attributes['imageDynamicTag'] ) && strpos( $content, 'data-dynamic-image=' ) !== false ) {
	$dynamic_tag = $attributes['imageDynamicTag'];

	// Resolve the dynamic tag expression to get attachment ID
	$resolved = '';
	if ( class_exists( '\VoxelFSE\Dynamic_Data\Block_Renderer' ) ) {
		$resolved = \VoxelFSE\Dynamic_Data\Block_Renderer::render_expression( $dynamic_tag );
	}

	// Strip @tags()...@endtags() wrapper if present
	if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $resolved, $tag_match ) ) {
		$resolved = $tag_match[1];
	}

	if ( ! empty( $resolved ) && is_numeric( $resolved ) ) {
		$image_id   = (int) $resolved;
		$image_size = ! empty( $attributes['imageSize'] ) ? $attributes['imageSize'] : 'large';
		$image_url  = wp_get_attachment_image_url( $image_id, $image_size );
		$image_alt  = get_post_meta( $image_id, '_wp_attachment_image_alt', true );

		if ( $image_url ) {
			// Replace the placeholder <img> with a real one
			$content = preg_replace(
				'#<img\s+src=""\s+alt=""\s+loading="lazy"\s+data-dynamic-image="[^"]*"([^>]*)/?>#',
				'<img src="' . esc_url( $image_url ) . '" alt="' . esc_attr( $image_alt ?: '' ) . '" loading="lazy"$1/>',
				$content,
				1
			);
		} else {
			// Dynamic tag resolved to an invalid attachment — hide the block
			return '';
		}
	} elseif ( empty( $resolved ) || '0' === $resolved ) {
		// Dynamic tag resolved to empty/0 (no image set on this term) — hide the block
		return '';
	}
}

// 2. Resolve attachment caption server-side
// Evidence: Elementor image.php:710-722 uses wp_get_attachment_caption()
if (
	! empty( $attributes['captionSource'] )
	&& 'attachment' === $attributes['captionSource']
	&& ! empty( $attributes['image']['id'] )
) {
	$attachment_caption = wp_get_attachment_caption( (int) $attributes['image']['id'] );

	if ( $attachment_caption ) {
		// The save.tsx renders an empty <figcaption> placeholder for attachment captions.
		// Replace its contents with the real WordPress attachment caption.
		$content = preg_replace(
			'#(<figcaption\s+class="widget-image-caption wp-caption-text"[^>]*>)(.*?)(</figcaption>)#s',
			'$1' . esc_html( $attachment_caption ) . '$3',
			$content,
			1
		);
	}
}

return $content;
