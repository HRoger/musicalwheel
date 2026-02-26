<?php
/**
 * Work Hours Block - Server-Side Render
 *
 * PARITY FIX: Replicates Voxel's work-hours widget rendering guard logic.
 * The original Voxel widget (themes/voxel/app/widgets/work-hours.php:767-777)
 * checks for a valid post context + work-hours field before rendering.
 * On grid/archive pages, there is no single-post context, so the widget
 * renders nothing. This render.php replicates that behavior.
 *
 * Additionally, injects the correct postId into vxconfig at render time
 * (similar to visit-chart/render.php), so the frontend.tsx fetches data
 * for the correct post rather than a stale editor-time postId.
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/work-hours.php:767-777
 * - Voxel utility: themes/voxel/app/utils/post-utils.php:9-21
 * - Pattern: themes/voxel-fse/app/blocks/src/visit-chart/render.php
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// --- Guard: Replicate Voxel's work-hours widget render guard ---
// Reference: themes/voxel/app/widgets/work-hours.php:767-777
//
// The original widget does:
//   $post = \Voxel\get_current_post();
//   $field = $post ? $post->get_field( $field_key ) : null;
//   if ( ! ( $post && $field && $field->get_type() === 'work-hours' ) ) { return; }
//   $schedule = $field->get_schedule();
//   if ( ! $schedule ) { return; }
//
// On grid/archive pages, get_current_post() returns the page post (e.g. "Grid with map 2"),
// which does NOT have a work-hours field, so $field is null → widget renders nothing.

$field_key = $attributes['sourceField'] ?? 'work-hours';

// Get the current Voxel post context
$post = null;
if ( class_exists( '\Voxel\Post' ) ) {
	$post = \Voxel\get_current_post();
}

if ( ! $post ) {
	// No post context at all → render nothing (parity with original widget)
	return '';
}

// Check that this post has a work-hours field
$field = $post->get_field( $field_key );
if ( ! ( $field && $field->get_type() === 'work-hours' ) ) {
	// Post doesn't have the specified work-hours field → render nothing
	// This is the key check that prevents rendering on grid/archive pages
	// where the "current post" is the page itself, not a listing
	return '';
}

// Check that the field has schedule data
$schedule = $field->get_schedule();
if ( ! $schedule ) {
	// No schedule data configured → render nothing
	return '';
}

// --- Inject correct postId into vxconfig ---
// The save.tsx bakes in (window as any).__post_id at editor save time,
// but this may be wrong at render time (e.g., inside a loop).
// Replace whatever postId was baked in with the actual current post ID.
$real_post_id = $post->get_id();

$content = preg_replace(
	'/"postId"\s*:\s*(?:null|\d+|"[^"]*")/',
	'"postId":' . (int) $real_post_id,
	$content,
	1
);

return $content;
