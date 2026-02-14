<?php
/**
 * Flex Container Block - Server-Side Render
 *
 * This block now relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * @package VoxelFSE
 */

// If HTML tag is 'a' and a link URL is set, replace outer <div> with <a>
if ( ! empty( $attributes['htmlTag'] ) && $attributes['htmlTag'] === 'a' && ! empty( $attributes['containerLink']['url'] ) ) {
	$url = esc_url( $attributes['containerLink']['url'] );
	// Replace the first <div with <a href="..." and the last </div> with </a>
	$content = preg_replace( '/^(<)div(\s)/', '$1a href="' . $url . '"$2', $content, 1 );
	$content = preg_replace( '/<\/div>$/', '</a>', $content, 1 );
}

return $content;
