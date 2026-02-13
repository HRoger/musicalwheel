<?php
/**
 * Block - Server-Side Render
 *
 * Handles server-side caption resolution for "attachment" caption source.
 * Elementor calls wp_get_attachment_caption() at render time (image.php:715).
 * We replicate this behavior here since save.tsx can't call PHP functions.
 *
 * This block also relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * @package VoxelFSE
 */

// Resolve attachment caption server-side
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
