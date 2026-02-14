<?php
/**
 * Current Role Block - Server-Side Render
 *
 * This block relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * Evidence: Voxel's current-role widget renders nothing for logged-out users.
 * @see themes/voxel/app/widgets/current-role.php:576-577
 *
 * @package VoxelFSE
 */

if ( ! is_user_logged_in() ) {
	return '';
}

return $content;
