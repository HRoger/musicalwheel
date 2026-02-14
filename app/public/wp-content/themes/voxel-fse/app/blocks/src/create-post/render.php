<?php
/**
 * Create Post Block - Server-Side Render
 *
 * This block now relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * Evidence: Voxel's create-post widget renders nothing for logged-out users.
 * @see themes/voxel/app/widgets/create-post.php:4955-4957
 *
 * @package VoxelFSE
 */

if ( ! is_user_logged_in() ) {
	return '';
}

return $content;
