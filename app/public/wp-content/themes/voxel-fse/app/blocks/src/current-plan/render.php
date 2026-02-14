<?php
/**
 * Current Plan Block - Server-Side Render
 *
 * This block now relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * Evidence: Voxel's current-plan widget renders nothing for logged-out users.
 * @see themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php:779-780
 *
 * @package VoxelFSE
 */

if ( ! is_user_logged_in() ) {
	return '';
}

return $content;
