<?php
/**
 * Author template override for FSE child theme.
 *
 * Resolves the Voxel profile template via PHP, then hands off to
 * WordPress's block template rendering pipeline (template-canvas.php).
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// NectarBlocks null workaround is handled globally in functions.php (is_author() covered).

$theme     = get_stylesheet();
$post_type = \Voxel\Post_Type::get( 'profile' );
if ( ! ( $post_type && $post_type->is_managed_by_voxel() ) ) {
	// Not managed by Voxel — fall back to default archive template.
	include get_theme_file_path( 'templates/archive.html' ) ?: ABSPATH . WPINC . '/template-canvas.php';
	return;
}

$header = '<!-- wp:template-part {"slug":"header","tagName":"header","theme":"' . $theme . '"} /-->';
$footer = '<!-- wp:template-part {"slug":"footer","tagName":"footer","theme":"' . $theme . '"} /-->';

$user = \Voxel\User::get( get_the_author_meta( 'ID' ) );
if ( ! $user ) {
	global $_wp_current_template_content, $_wp_current_template_id;
	$_wp_current_template_id      = $theme . '//index';
	$_wp_current_template_content = $header
		. '<!-- wp:paragraph --><p>' . esc_html__( 'User not found.', 'voxel-fse' ) . '</p><!-- /wp:paragraph -->'
		. $footer;
	include ABSPATH . WPINC . '/template-canvas.php';
	return;
}

// Set the current post context so Voxel blocks can access profile data.
\Voxel\set_current_post( $user->get_or_create_profile() );

$template_id = \Voxel\get_single_post_template_id( $post_type );

if ( ! $template_id || post_password_required( $template_id ) ) {
	global $_wp_current_template_content, $_wp_current_template_id;
	$_wp_current_template_id      = $theme . '//index';
	$_wp_current_template_content = $header
		. '<!-- wp:paragraph --><p>' . esc_html__( 'Profile not available.', 'voxel-fse' ) . '</p><!-- /wp:paragraph -->'
		. $footer;
	include ABSPATH . WPINC . '/template-canvas.php';
	return;
}

$template_post = get_post( $template_id );
if ( ! $template_post ) {
	global $_wp_current_template_content, $_wp_current_template_id;
	$_wp_current_template_id      = $theme . '//index';
	$_wp_current_template_content = $header
		. '<!-- wp:paragraph --><p>' . esc_html__( 'Profile template not found.', 'voxel-fse' ) . '</p><!-- /wp:paragraph -->'
		. $footer;
	include ABSPATH . WPINC . '/template-canvas.php';
	return;
}

// Set the globals that template-canvas.php / get_the_block_template_html() expect.
global $_wp_current_template_content, $_wp_current_template_id;

$_wp_current_template_id      = $theme . '//index';
$_wp_current_template_content = $header . $template_post->post_content . $footer;

include ABSPATH . WPINC . '/template-canvas.php';
