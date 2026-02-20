<?php
/**
 * Slider Block - Server-Side Render
 *
 * Resolves dynamic image tags (imagesDynamicTag) by injecting
 * resolved attachment data into the vxconfig JSON at runtime.
 * React hydration (frontend.tsx) then reads the updated vxconfig.
 *
 * See: docs/block-conversions/dynamic-data/image-dynamic-tag-resolution.md
 *
 * @package VoxelFSE
 */

// Resolve dynamic images tag if set
if (
	! empty( $attributes['imagesDynamicTag'] )
	&& strpos( $attributes['imagesDynamicTag'], '@' ) !== false
	&& strpos( $content, 'class="vxconfig"' ) !== false
) {
	$dynamic_tag   = $attributes['imagesDynamicTag'];
	$display_size  = ! empty( $attributes['displaySize'] ) ? $attributes['displaySize'] : 'medium';
	$lightbox_size = ! empty( $attributes['lightboxSize'] ) ? $attributes['lightboxSize'] : 'large';

	// Step 1: Resolve the expression
	$resolved = '';
	if ( class_exists( '\VoxelFSE\Dynamic_Data\Block_Renderer' ) ) {
		$resolved = \VoxelFSE\Dynamic_Data\Block_Renderer::render_expression( $dynamic_tag );
	}

	// Step 2: Strip @tags()...@endtags() wrapper
	if ( preg_match( '/@tags\(\)(.*?)@endtags\(\)/s', $resolved, $tag_match ) ) {
		$resolved = $tag_match[1];
	}

	// Step 3: Build ProcessedImage array from resolved attachment IDs
	// Supports comma-separated list of IDs (e.g. "96,97,98") or single ID
	$dynamic_images = [];
	if ( ! empty( $resolved ) && $resolved !== '0' ) {
		$ids = array_filter( array_map( 'absint', explode( ',', $resolved ) ) );

		foreach ( $ids as $attachment_id ) {
			$display_url    = wp_get_attachment_image_url( $attachment_id, $display_size );
			$lightbox_url   = wp_get_attachment_image_url( $attachment_id, $lightbox_size );
			$thumbnail_url  = wp_get_attachment_image_url( $attachment_id, 'thumbnail' );

			if ( ! $display_url ) {
				continue;
			}

			$dynamic_images[] = [
				'id'           => $attachment_id,
				'src'          => $display_url,
				'srcLightbox'  => $lightbox_url ?: $display_url,
				'srcThumbnail' => $thumbnail_url ?: $display_url,
				'alt'          => get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ) ?: '',
				'caption'      => wp_get_attachment_caption( $attachment_id ) ?: '',
				'description'  => get_post_field( 'post_content', $attachment_id ) ?: '',
				'title'        => get_the_title( $attachment_id ) ?: '',
			];
		}
	}

	// Step 4: Inject resolved images into vxconfig JSON
	if ( ! empty( $dynamic_images ) ) {
		$content = preg_replace_callback(
			'#(<script[^>]+class="vxconfig"[^>]*>)(.*?)(</script>)#s',
			function( $matches ) use ( $dynamic_images ) {
				$config = json_decode( $matches[2], true );
				if ( is_array( $config ) ) {
					$config['images'] = $dynamic_images;
					return $matches[1] . wp_json_encode( $config ) . $matches[3];
				}
				return $matches[0];
			},
			$content,
			1
		);
	}
}

return $content;
