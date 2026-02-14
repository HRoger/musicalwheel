<?php
/**
 * Popup Kit Block - Server-Side Render
 *
 * This block relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * @package VoxelFSE
 */

// Fix legacy hardcoded image URLs from original Voxel demo site.
// The save.tsx preview content may contain URLs from the environment where the
// template was first created (e.g. http://voxel.local/stays/). Replace with
// the current parent theme URI so placeholder images resolve correctly.
if ( strpos( $content, 'voxel.local' ) !== false ) {
    $content = str_replace(
        'http://voxel.local/stays/wp-content/themes/voxel/',
        trailingslashit( get_template_directory_uri() ),
        $content
    );
}

return $content;
