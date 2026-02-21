<?php
/**
 * Block - Server-Side Render
 *
 * This block relies on the global abstraction in Block_Loader.php
 * for Visibility and Loop features.
 *
 * Stripe account requires authentication - don't render for logged-out users
 * to prevent frontend JS from making 401 API calls.
 *
 * @package VoxelFSE
 */

if ( ! is_user_logged_in() ) {
	return '';
}

return $content;
