<?php
/**
 * Visit Chart Block - Server-Side Render
 *
 * Injects nonce and postId into vxconfig server-side, matching Voxel's
 * visits-chart.php widget behavior (lines 1069-1081).
 *
 * Voxel generates nonces during PHP render and embeds them in vxconfig JSON.
 * This eliminates the need for a client-side REST API call to get the nonce.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/visits-chart.php:1069-1081
 * - Voxel controller: themes/voxel/app/controllers/frontend/statistics/visits-chart-controller.php
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$source = $attributes['source'] ?? 'post';

// Validate source
if ( ! in_array( $source, [ 'post', 'user', 'site' ], true ) ) {
	return $content;
}

$nonce   = '';
$post_id = null;

// Generate nonce based on source (matching Voxel's widget logic)
// Evidence: visits-chart.php:1069-1081
switch ( $source ) {
	case 'site':
		$nonce = wp_create_nonce( 'ts-visits-chart--site' );
		break;

	case 'user':
		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			// Voxel parity: widget doesn't render for logged-out users on user source
			return '';
		}
		$nonce = wp_create_nonce( 'ts-visits-chart--u' . $user_id );
		break;

	case 'post':
		// Get current post context (matching Voxel's \Voxel\get_current_post())
		if ( class_exists( '\Voxel\Post' ) ) {
			$post = \Voxel\get_current_post();
		} else {
			$post = null;
		}

		if ( ! $post ) {
			// Try WordPress global post as fallback
			$wp_post = get_post();
			if ( $wp_post ) {
				$post_id = $wp_post->ID;
				$nonce   = wp_create_nonce( 'ts-visits-chart--p' . $post_id );
			} else {
				// Voxel parity: widget returns early if no post context
				return '';
			}
		} else {
			$post_id = $post->get_id();
			$nonce   = wp_create_nonce( 'ts-visits-chart--p' . $post_id );
		}
		break;
}

// Inject nonce and postId into the existing vxconfig JSON
// The save.tsx outputs: {"source":"post","activeChart":"7d","viewType":"views","nonce":"","postId":null,...}
// We replace the empty nonce and null postId with real values
$content = preg_replace(
	'/"nonce"\s*:\s*""/',
	'"nonce":"' . esc_attr( $nonce ) . '"',
	$content,
	1
);

if ( $post_id !== null ) {
	$content = preg_replace(
		'/"postId"\s*:\s*null/',
		'"postId":' . (int) $post_id,
		$content,
		1
	);
}

return $content;
