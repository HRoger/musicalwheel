<?php
/**
 * Author template override for FSE child theme.
 *
 * The parent theme's author.php calls \Elementor\Plugin directly without
 * checking if Elementor is active, causing a fatal error on FSE sites.
 * This override adds the missing guard and falls back to block template rendering.
 *
 * @package VoxelFSE
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// If Elementor is active, delegate to parent theme's author.php logic
if ( \Voxel\is_elementor_active() ) {
	$post_type = \Voxel\Post_Type::get( 'profile' );
	if ( ! ( $post_type && $post_type->is_managed_by_voxel() ) ) {
		require_once locate_template( 'templates/defaults/author.php' );
		return;
	}

	$user = \Voxel\User::get( get_the_author_meta( 'ID' ) );
	if ( ! $user ) {
		require_once locate_template( 'templates/defaults/author.php' );
		return;
	}

	\Voxel\set_current_post( $user->get_or_create_profile() );

	$template_id = \Voxel\get_single_post_template_id( $post_type );

	if ( post_password_required( $template_id ) ) {
		require_once locate_template( 'templates/defaults/author.php' );
		return;
	}

	$document = \Elementor\Plugin::$instance->documents->get( $template_id );
	if ( ! ( $document && $document->is_built_with_elementor() ) ) {
		require_once locate_template( 'templates/defaults/author.php' );
		return;
	}

	$frontend = \Elementor\Plugin::$instance->frontend;
	add_action( 'wp_enqueue_scripts', function() use ( $frontend, $template_id ) {
		$frontend->enqueue_styles();
		\Voxel\enqueue_template_css( $template_id );
	} );

	get_header();
	\Voxel\set_current_post( $user->get_or_create_profile() );

	if ( \Voxel\get_page_setting( 'voxel_hide_header', $template_id ) !== 'yes' ) {
		\Voxel\print_header();
	}

	echo $frontend->get_builder_content_for_display( $template_id );

	if ( \Voxel\get_page_setting( 'voxel_hide_footer', $template_id ) !== 'yes' ) {
		\Voxel\print_footer();
	}

	get_footer();
	return;
}

// FSE mode: Render profile using block templates
$post_type = \Voxel\Post_Type::get( 'profile' );
if ( ! ( $post_type && $post_type->is_managed_by_voxel() ) ) {
	get_header();
	echo '<p>' . esc_html__( 'Profile not found.', 'voxel-fse' ) . '</p>';
	get_footer();
	return;
}

$user = \Voxel\User::get( get_the_author_meta( 'ID' ) );
if ( ! $user ) {
	get_header();
	echo '<p>' . esc_html__( 'User not found.', 'voxel-fse' ) . '</p>';
	get_footer();
	return;
}

// Set the current post context so Voxel blocks can access profile data
\Voxel\set_current_post( $user->get_or_create_profile() );

$template_id = \Voxel\get_single_post_template_id( $post_type );

if ( ! $template_id || post_password_required( $template_id ) ) {
	get_header();
	echo '<p>' . esc_html__( 'Profile not available.', 'voxel-fse' ) . '</p>';
	get_footer();
	return;
}

// Render using block template content
get_header();

if ( \Voxel\get_page_setting( 'voxel_hide_header', $template_id ) !== 'yes' ) {
	\Voxel\print_header();
}

// Get the template post and render its block content
$template_post = get_post( $template_id );
if ( $template_post ) {
	// Apply block rendering to the template content
	echo apply_filters( 'the_content', $template_post->post_content );
} else {
	echo '<p>' . esc_html__( 'Profile template not found.', 'voxel-fse' ) . '</p>';
}

if ( \Voxel\get_page_setting( 'voxel_hide_footer', $template_id ) !== 'yes' ) {
	\Voxel\print_footer();
}

get_footer();
