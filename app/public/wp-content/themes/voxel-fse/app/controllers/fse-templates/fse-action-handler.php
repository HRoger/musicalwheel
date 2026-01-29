<?php
declare(strict_types=1);

/**
 * FSE Action Handler - Replaces Elementor action with FSE
 * 
 * Uses WordPress replace_editor filter to intercept action=fse
 * and redirect to Site Editor with correct template slug.
 * 
 * Benefits:
 * - Self-correcting: Uses post_id to get actual slug from database
 * - Solves wrong slug issue automatically
 * - Simpler than MutationObserver + URL mapping
 * - Consistent with Elementor's action=elementor pattern
 * 
 * @package VoxelFSE\Controllers\Templates
 * @since 1.1.0
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// DEBUG: Confirm file is loaded
// error_log( 'FSE Action Handler: File loaded - interceptors will be registered' );



/**
 * Intercept action=fse and redirect to Site Editor
 * 
 * This replaces the MutationObserver approach with a simpler
 * WordPress-native filter that uses post_id to get actual slug.
 * 
 * Evidence:
 * - WordPress post.php:182 - replace_editor filter
 * - Elementor uses same pattern with action=elementor
 */
add_filter( 'replace_editor', function( $replace, $post ) {
	// DEBUG: Log every time filter is called
	$action = isset( $_GET['action'] ) ? $_GET['action'] : 'none';
	// error_log( "FSE Interceptor: replace_editor filter called, action={$action}, post_id={$post->ID}" );
	
	// Only handle action=fse
	if ( $action !== 'fse' ) {
		return $replace;
	}
	
	// error_log( "FSE Interceptor: action=fse received, post ID: {$post->ID}, post_type: {$post->post_type}, post_name: {$post->post_name}" );
	
	// ⭐ FIX: Handle wp_template posts (FSE templates)
	if ( $post->post_type === 'wp_template' ) {
		// Check permissions for templates
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			wp_die( __( 'Sorry, you are not allowed to edit templates.' ) );
		}
		
		// Redirect to Site Editor
		$site_editor_url = add_query_arg( [
			'postType' => 'wp_template',
			'postId'   => 'voxel-fse//' . $post->post_name, // Actual slug from database
			'canvas'   => 'edit',
		], admin_url( 'site-editor.php' ) );
		
		wp_safe_redirect( $site_editor_url );
		exit;
	}
	
	// ⭐ NEW: Handle Elementor templates mapped to FSE templates
	// This fixes locked/default templates where ID replacement in config might fail
	//error_log( "FSE Interceptor (action=fse): Looking for FSE template with meta _voxel_source_elementor_id = {$post->ID}" );
	
	$fse_template = get_posts([
		'post_type' => 'wp_template',
		'meta_query' => [
			[
				'key' => '_voxel_source_elementor_id',
				'value' => (string) $post->ID, // Convert to string for reliable comparison
				'compare' => '='
			]
		],
		'posts_per_page' => 1,
		'fields' => 'ids'
	]);
	
	//error_log( "FSE Interceptor (action=fse): Found " . count($fse_template) . " matching templates" );
	
	// ⭐ FIX: For Default Header/Footer, redirect to stable slug instead of creating new templates
	// Voxel regenerates Elementor IDs, so we redirect based on template type + active status
	if ( empty( $fse_template ) && $post->post_type === 'elementor_library' ) {
		$template_type = get_post_meta( $post->ID, '_elementor_template_type', true );
		//error_log( "FSE Interceptor (action=fse): No meta match for Elementor ID {$post->ID}, template_type: {$template_type}" );
		
		// Check if this is the active default header/footer
		// Don't rely on _elementor_template_type meta as it may be incorrect
		$templates_config = \Voxel\get( 'templates' );
		$active_header_id = isset($templates_config['header']) ? $templates_config['header'] : null;
		$active_footer_id = isset($templates_config['footer']) ? $templates_config['footer'] : null;
		
		$stable_slug = null;
		if ( $post->ID == $active_header_id ) {
			$stable_slug = 'voxel-header-default';
		} elseif ( $post->ID == $active_footer_id ) {
			$stable_slug = 'voxel-footer-default';
		}
		
		if ( $stable_slug ) {
			// Redirect directly to the stable slug (template should already exist from page load)
			//error_log( "FSE Interceptor (action=fse): Redirecting to stable default template: {$stable_slug}" );
			
			$site_editor_url = add_query_arg( [
				'postType' => 'wp_template',
				'postId'   => 'voxel-fse//' . $stable_slug,
				'canvas'   => 'edit',
			], admin_url( 'site-editor.php' ) );
			
			wp_safe_redirect( $site_editor_url );
			exit;
		}
	}
	
	if ( ! empty( $fse_template ) ) {
		$fse_id = $fse_template[0];
		$fse_post = get_post($fse_id);
		
		if ( ! $fse_post ) {
			//error_log( "FSE Interceptor (action=fse): ERROR - FSE template ID {$fse_id} not found!" );
			return $replace; // FSE template not found, let WordPress handle it
		}
		
		//error_log( "FSE Interceptor (action=fse): Redirecting to FSE template: {$fse_post->post_name}" );
		
		// Redirect to Site Editor
		$site_editor_url = add_query_arg( [
			'postType' => 'wp_template',
			'postId'   => 'voxel-fse//' . $fse_post->post_name,
			'canvas'   => 'edit',
		], admin_url( 'site-editor.php' ) );
		
		wp_safe_redirect( $site_editor_url );
		exit;
	}
	
	//error_log( "FSE Interceptor (action=fse): No FSE template mapping found for Elementor ID {$post->ID}, post_type: {$post->post_type}" );

	// ⭐ FIX: Handle regular pages (form templates, auth, timeline, inbox, etc.)
	if ( $post->post_type === 'page' ) {
		// Check permissions for pages (different from templates!)
		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			wp_die( __( 'Sorry, you are not allowed to edit this page.' ) );
		}
		
		// Redirect to page editor with action=edit
		// This opens the WordPress Block Editor for pages
		$edit_url = add_query_arg( [
			'post'   => $post->ID,
			'action' => 'edit',
		], admin_url( 'post.php' ) );
		
		wp_safe_redirect( $edit_url );
		exit;
	}
	
	return $replace;
}, 10, 2 );

/**
 * Intercept preview links with canvas=view parameter
 * 
 * When preview links have canvas=view, check if it's an FSE template
 * and redirect to Site Editor preview, otherwise let WordPress handle it normally.
 * 
 * Uses the same pattern as action=fse - simple and self-correcting!
 */
add_action( 'template_redirect', function() {
	// Only handle if canvas=view is present
	if ( ! isset( $_GET['canvas'] ) || $_GET['canvas'] !== 'view' ) {
		return;
	}
	
	// Get post ID from p parameter
	$post_id = isset( $_GET['p'] ) ? absint( $_GET['p'] ) : 0;
	if ( ! $post_id ) {
		return; // No post ID, let WordPress handle it
	}
	
	// Get the post
	$post = get_post( $post_id );
	if ( ! $post ) {
		return; // Post doesn't exist, let WordPress handle it
	}
	
	// Check permissions
	if ( ! current_user_can( 'edit_theme_options' ) ) {
		return; // No permission, let WordPress handle it
	}
	
	// Handle wp_template posts (FSE templates)
	if ( $post->post_type === 'wp_template' ) {
		// Redirect to Site Editor preview
		$site_editor_url = add_query_arg( [
			'postType' => 'wp_template',
			'postId'   => 'voxel-fse//' . $post->post_name, // Actual slug from database
			'canvas'   => 'view',
		], admin_url( 'site-editor.php' ) );
		
		wp_safe_redirect( $site_editor_url );
		exit;
	}

	// ⭐ NEW: Handle Elementor templates mapped to FSE templates
	// This fixes locked/default templates where ID replacement in config might fail
	//error_log( "FSE Interceptor (canvas=view): Looking for FSE template with meta _voxel_source_elementor_id = {$post_id}" );
	
	$fse_template = get_posts([
		'post_type' => 'wp_template',
		'meta_query' => [
			[
				'key' => '_voxel_source_elementor_id',
				'value' => (string) $post_id, // Convert to string for reliable comparison
				'compare' => '='
			]
		],
		'posts_per_page' => 1,
		'fields' => 'ids'
	]);
	
	//error_log( "FSE Interceptor (canvas=view): Found " . count($fse_template) . " matching templates" );
	
	// ⭐ FIX: For Default Header/Footer, redirect to stable slug instead of creating new templates
	// Voxel regenerates Elementor IDs, so we redirect based on template type + active status
	if ( empty( $fse_template ) && $post->post_type === 'elementor_library' ) {
		$template_type = get_post_meta( $post_id, '_elementor_template_type', true );
		//error_log( "FSE Interceptor (canvas=view): No meta match for Elementor ID {$post_id}, template_type: {$template_type}" );
		
		// Check if this is the active default header/footer
		// Don't rely on _elementor_template_type meta as it may be incorrect
		$templates_config = \Voxel\get( 'templates' );
		$active_header_id = isset($templates_config['header']) ? $templates_config['header'] : null;
		$active_footer_id = isset($templates_config['footer']) ? $templates_config['footer'] : null;
		
		$stable_slug = null;
		if ( $post_id == $active_header_id ) {
			$stable_slug = 'voxel-header-default';
		} elseif ( $post_id == $active_footer_id ) {
			$stable_slug = 'voxel-footer-default';
		}
		
		if ( $stable_slug ) {
			// Redirect directly to the stable slug (template should already exist from page load)
//			error_log( "FSE Interceptor (canvas=view): Redirecting to stable default template preview: {$stable_slug}" );
			
			$site_editor_url = add_query_arg( [
				'postType' => 'wp_template',
				'postId'   => 'voxel-fse//' . $stable_slug,
				'canvas'   => 'view',
			], admin_url( 'site-editor.php' ) );
			
			wp_safe_redirect( $site_editor_url );
			exit;
		}
	}
	
	if ( ! empty( $fse_template ) ) {
		$fse_id = $fse_template[0];
		$fse_post = get_post($fse_id);
		
		if ( ! $fse_post ) {
//			error_log( "FSE Interceptor (canvas=view): ERROR - FSE template ID {$fse_id} not found!" );
			return; // FSE template not found, let WordPress handle it
		}
		
//		error_log( "FSE Interceptor (canvas=view): Redirecting to FSE template: {$fse_post->post_name}" );
		
		// Redirect to Site Editor preview
		$site_editor_url = add_query_arg( [
			'postType' => 'wp_template',
			'postId'   => 'voxel-fse//' . $fse_post->post_name, // Actual slug from database
			'canvas'   => 'view',
		], admin_url( 'site-editor.php' ) );
		
		wp_safe_redirect( $site_editor_url );
		exit;
	}
	
	// error_log( "FSE Interceptor (canvas=view): No FSE template mapping found for post ID {$post_id}, post_type: {$post->post_type}" );
	
	// For pages or other post types, remove canvas=view and let WordPress handle normally
	// This ensures pages still work with normal preview
	$clean_url = remove_query_arg( 'canvas', $_SERVER['REQUEST_URI'] );
	wp_safe_redirect( $clean_url );
	exit;
}, 1 ); // Early priority to catch before WordPress processes the preview

