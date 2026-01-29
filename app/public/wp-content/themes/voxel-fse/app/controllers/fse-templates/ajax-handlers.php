<?php
declare(strict_types=1);

/**
 * AJAX Handlers for FSE Templates
 *
 * Handles AJAX requests for creating, editing, and deleting FSE templates.
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// error_log( '=== FSE AJAX HANDLERS FILE LOADED ===' );

/**
 * Intercept Post Types base template creation
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 * This completely replaces Voxel's Elementor template creation with FSE templates.
 */
add_action( 'voxel_ajax_pte.create_base_template', function() {
	// error_log( '=== FSE AJAX Handler: pte.create_base_template fired ===' );

	// Verify nonce
	if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'vx_admin_edit_templates' ) ) {
		// error_log( 'FSE AJAX: Nonce verification failed' );
		return; // Let Voxel handle invalid nonce
	}
	// error_log( 'FSE AJAX: Nonce OK' );

	// Verify user capabilities
	if ( ! current_user_can( 'manage_options' ) ) {
		// error_log( 'FSE AJAX: User lacks manage_options capability' );
		return;
	}
	// error_log( 'FSE AJAX: User capability OK' );

	// Get parameters
	$template_key = sanitize_text_field( $_GET['template_key'] ?? '' );
	$post_type_key = sanitize_text_field( $_GET['post_type'] ?? '' );

	// error_log( "FSE AJAX: template_key='{$template_key}', post_type_key='{$post_type_key}'" );

	if ( empty( $template_key ) || empty( $post_type_key ) ) {
		// error_log( 'FSE AJAX: Missing required parameters' );
		return; // Let Voxel handle validation
	}

	// ⭐ CRITICAL FIX: Form templates are PAGES, not FSE templates!
	// Evidence: themes/voxel/app/controllers/templates/post-types/post-type-base-templates-controller.php:30-35
	// Voxel uses \Voxel\create_page() for form templates, not create_template()
	// We should NOT intercept form template creation - let Voxel handle it
	if ( $template_key === 'form' ) {
		// Return early - let Voxel's handler (priority 10) create the page
		// error_log( 'FSE AJAX: Skipping form template - letting Voxel create page' );
		return;
	}

	// Only handle actual templates: single, card, archive
	$template_type = $template_key;

	// Get post type object
	$post_type = \Voxel\Post_Type::get( $post_type_key );
	if ( ! $post_type ) {
		// error_log( "FSE AJAX: Post type '{$post_type_key}' not found" );
		wp_send_json( [
			'success' => false,
			'message' => 'Post type not found',
		] );
		return;
	}

	// Create FSE template
	$fse_template_id = Template_Manager::create_fse_template( $post_type_key, $template_type );

	if ( ! $fse_template_id ) {
		// error_log( 'FSE AJAX: Failed to create FSE template' );
		wp_send_json( [
			'success' => false,
			'message' => 'Failed to create FSE template',
		] );
		return;
	}

	// error_log( "FSE AJAX: Created FSE template ID={$fse_template_id}" );

	// Update Voxel's templates config
	$voxel_templates = $post_type->get_templates();
	$voxel_templates[ $template_type ] = $fse_template_id;
	$post_type->repository->set_config( [
		'templates' => $voxel_templates,
	] );
	// error_log( "FSE AJAX: Updated Voxel config templates[{$template_type}] = {$fse_template_id}" );

	// Store FSE template mapping for JavaScript
	$mapping = get_option( 'mw_fse_custom_template_mapping', [] );
	$fse_edit_url = Template_Manager::get_site_editor_url( $fse_template_id );
	$mapping[ $fse_template_id ] = $fse_edit_url;
	update_option( 'mw_fse_custom_template_mapping', $mapping, false );
	// error_log( "FSE AJAX: Stored mapping {$fse_template_id} => {$fse_edit_url}" );

	// Return success with FSE info
	$response = [
		'success'         => true,
		'template_id'     => $fse_template_id,
		'fse_template_id' => $fse_template_id,
		'fse_edit_url'    => $fse_edit_url,
	];
	// error_log( 'FSE AJAX: Sending response: ' . wp_json_encode( $response ) );
	wp_send_json( $response );
}, 9 );

/**
 * Intercept Post Types custom template creation
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 * This completely replaces Voxel's Elementor template creation with FSE templates.
 */
add_action( 'voxel_ajax_pte.create_custom_template', function() {
	// error_log( '=== FSE AJAX Handler: pte.create_custom_template fired ===' );

	// Verify nonce
	if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'vx_admin_edit_templates' ) ) {
		// error_log( 'FSE AJAX: Nonce verification failed' );
		return; // Let Voxel handle invalid nonce
	}
	// error_log( 'FSE AJAX: Nonce OK' );

	// Verify user capabilities
	if ( ! current_user_can( 'manage_options' ) ) {
		// error_log( 'FSE AJAX: User lacks manage_options capability' );
		return;
	}
	// error_log( 'FSE AJAX: User capability OK' );

	// Get parameters
	$label = sanitize_text_field( $_GET['label'] ?? '' );
	$group_key = sanitize_text_field( $_GET['group'] ?? '' );
	$post_type_key = sanitize_text_field( $_GET['post_type'] ?? '' );

	// error_log( "FSE AJAX: label='{$label}', group='{$group_key}', post_type_key='{$post_type_key}'" );

	if ( empty( $label ) || empty( $group_key ) || empty( $post_type_key ) ) {
		// error_log( 'FSE AJAX: Missing required parameters' );
		return; // Let Voxel handle validation
	}

	// Get post type object
	$post_type = \Voxel\Post_Type::get( $post_type_key );
	if ( ! $post_type ) {
		// error_log( "FSE AJAX: Post type '{$post_type_key}' not found" );
		wp_send_json( [
			'success' => false,
			'message' => 'Post type not found',
		] );
		return;
	}

	// Map group_key to template_type
	$group_to_type_map = [
		'single_post'  => 'single',
		'preview_card' => 'card',
		'other'        => 'archive',
	];
	$template_type = $group_to_type_map[ $group_key ] ?? $group_key;
	// error_log( "FSE AJAX: Mapped group '{$group_key}' to template type '{$template_type}'" );

	// Generate unique key (like Voxel does)
	$unique_key = strtolower( \Voxel\random_string( 8 ) );

	// Build template config (Voxel format)
	$template_config = [
		'label'      => $label,
		'id'         => 0, // Will be updated after creation
		'unique_key' => $unique_key,
	];

	// Add visibility_rules for certain groups (like Voxel does)
	if ( in_array( $group_key, [ 'single_post' ], true ) ) {
		$template_config['visibility_rules'] = [];
	}

	// Get existing custom templates from post type
	$custom_templates = $post_type->templates->get_custom_templates();
	if ( ! isset( $custom_templates[ $group_key ] ) || ! is_array( $custom_templates[ $group_key ] ) ) {
		$custom_templates[ $group_key ] = [];
	}

	// Create UNIQUE FSE template slug using unique_key
	$fse_slug = "voxel-{$post_type_key}-{$template_type}-{$unique_key}";
	$fse_template_id = Template_Manager::create_fse_template_with_slug( $post_type_key, $template_type, $fse_slug );

	if ( ! $fse_template_id ) {
		// error_log( 'FSE AJAX: Failed to create FSE template' );
		wp_send_json( [
			'success' => false,
			'message' => 'Failed to create FSE template',
		] );
		return;
	}

	// error_log( "FSE AJAX: Created FSE template ID={$fse_template_id} with slug={$fse_slug}" );

	// Update template config with FSE template ID
	$template_config['id'] = $fse_template_id;

	// Add new template to the group
	$custom_templates[ $group_key ][] = $template_config;

	// Make sure templates are stored as indexed arrays (like Voxel does)
	$custom_templates = array_map( 'array_values', $custom_templates );

	// Save to Voxel config
	$post_type->repository->set_config( [
		'custom_templates' => $custom_templates,
	] );
	// error_log( "FSE AJAX: Updated post type custom templates config" );

	// Store FSE template mapping for JavaScript
	$mapping = get_option( 'mw_fse_custom_template_mapping', [] );
	$fse_edit_url = Template_Manager::get_site_editor_url( $fse_template_id );
	$mapping[ $fse_template_id ] = $fse_edit_url;
	update_option( 'mw_fse_custom_template_mapping', $mapping, false );
	// error_log( "FSE AJAX: Stored mapping {$fse_template_id} => {$fse_edit_url}" );

	// Return success with FSE info
	$response = [
		'success'         => true,
		'templates'       => $custom_templates,
		'fse_template_id' => $fse_template_id,
		'fse_edit_url'    => $fse_edit_url,
	];
	// error_log( 'FSE AJAX: Sending response: ' . wp_json_encode( $response ) );
	wp_send_json( $response );
}, 9 );

/**
 * Clean up FSE config after Voxel deletes base template
 *
 * Note: Voxel already deletes the FSE template from wp_posts because we store
 * the FSE template ID in Voxel's templates config. This handler just cleans up
 * our FSE-specific configuration.
 */
add_filter( 'voxel_ajax_pte.delete_base_template:output', function( $output ) {
	// error_log( '=== FSE AJAX: delete_base_template cleanup FIRED ===' );
	// error_log( 'FSE AJAX: $_GET parameters: ' . wp_json_encode( $_GET ) );
	// error_log( 'FSE AJAX: Voxel output: ' . wp_json_encode( $output ) );

	if ( ! empty( $output['success'] ) ) {
		// error_log( 'FSE AJAX: Voxel deletion was successful, cleaning up FSE config' );

		// Extract post type and template type from request
		$template_key = $_GET['template_key'] ?? '';
		$post_type_key = $_GET['post_type'] ?? '';

		if ( empty( $template_key ) || empty( $post_type_key ) ) {
			// error_log( 'FSE AJAX: Missing template_key or post_type' );
			return $output;
		}

		// template_key IS the template type (e.g., 'form', 'single', 'card', 'archive')
		$template_type = $template_key;

		// error_log( "FSE AJAX: Cleaning up FSE config for Post type={$post_type_key}, Template type={$template_type}" );

		// Get the post type object
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( $post_type ) {
			// Clean up FSE-specific config
			Template_Manager::remove_template_from_config( $post_type, $template_type );
			// error_log( "FSE AJAX: Removed {$template_type} from FSE config" );
		} else {
			// error_log( "FSE AJAX: Could not get post type: {$post_type_key}" );
		}
	}

	// error_log( 'FSE AJAX: Delete cleanup complete' );
	return $output;
}, 11 );

/**
 * Intercept Post Type base template ID update (switch/rename)
 *
 * Voxel's handler uses \Voxel\template_exists() which only works for 'elementor_library' post type.
 * Our FSE templates are 'wp_template' post type, so we need to handle them separately.
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 */
add_action( 'voxel_ajax_pte.update_base_template_id', function() {
	try {
		// Verify nonce (same as Voxel)
		\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_admin_edit_templates' );
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ) );
		}

		$post_type = \Voxel\Post_Type::get( $_GET['post_type'] ?? null );
		if ( ! $post_type ) {
			return; // Let Voxel handle
		}

		$template_key = $_GET['template_key'] ?? null;
		$new_template_id = $_GET['new_template_id'] ?? null;

		// Form templates are PAGES, let Voxel handle them
		if ( $template_key === 'form' ) {
			return; // Voxel uses page_exists() for forms
		}

		// Only handle actual templates: single, card, archive
		if ( ! in_array( $template_key, [ 'single', 'card', 'archive' ], true ) ) {
			return; // Let Voxel handle
		}

		if ( ! is_numeric( $new_template_id ) ) {
			return; // Let Voxel handle validation
		}

		$new_template_id = absint( $new_template_id );
		$post = get_post( $new_template_id );

		// If it's an Elementor template, let Voxel handle it
		if ( $post && $post->post_type === 'elementor_library' ) {
			return; // Voxel's handler will work for this
		}

		// If it's an FSE template (wp_template), we handle it
		if ( ! $post || $post->post_type !== 'wp_template' ) {
			// Not an FSE template and not Elementor - check if it exists at all
			if ( ! $post || $post->post_status === 'trash' ) {
				throw new \Exception( __( 'Provided template does not exist.', 'voxel-backend' ), 105 );
			}
		}

		// Update the post type templates config
		$post_type_templates = $post_type->get_templates();
		$post_type_templates[ $template_key ] = $new_template_id;

		$post_type->repository->set_config( [
			'templates' => $post_type_templates,
		] );

		wp_send_json( [
			'success' => true,
		] );

	} catch ( \Exception $e ) {
		wp_send_json( [
			'success' => false,
			'message' => $e->getMessage(),
			'code'    => $e->getCode(),
		] );
	}
}, 9 );

/**
 * Intercept Post Type custom template details update (rename)
 *
 * Voxel's handler uses \Voxel\template_exists() which only works for 'elementor_library' post type.
 * Our FSE templates are 'wp_template' post type, so we need to handle them separately.
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 */
add_action( 'voxel_ajax_pte.update_custom_template_details', function() {
	try {
		// Verify nonce (same as Voxel)
		\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_admin_edit_templates' );
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 100 );
		}

		$post_type = \Voxel\Post_Type::get( $_GET['post_type'] ?? null );
		if ( ! $post_type ) {
			return; // Let Voxel handle
		}

		$unique_key = $_GET['unique_key'] ?? null;
		$group_key = $_GET['group'] ?? null;
		$new_template_id = $_GET['new_template_id'] ?? null;
		$new_template_label = sanitize_text_field( $_GET['new_template_label'] ?? '' );

		if ( empty( $unique_key ) || empty( $group_key ) ) {
			return; // Let Voxel handle validation
		}

		if ( ! is_numeric( $new_template_id ) ) {
			return; // Let Voxel handle validation
		}

		$new_template_id = absint( $new_template_id );
		$post = get_post( $new_template_id );

		// If it's an Elementor template, let Voxel handle it
		if ( $post && $post->post_type === 'elementor_library' ) {
			return; // Voxel's handler will work for this
		}

		// If it's an FSE template (wp_template), we handle it
		if ( ! $post || ( $post->post_type !== 'wp_template' && $post->post_type !== 'elementor_library' ) ) {
			if ( ! $post || $post->post_status === 'trash' ) {
				throw new \Exception( __( 'Provided template does not exist', 'voxel-backend' ), 103 );
			}
		}

		if ( empty( $new_template_label ) ) {
			throw new \Exception( __( 'Template label cannot be empty', 'voxel-backend' ), 104 );
		}

		// Get templates and update
		$templates = $post_type->templates->get_custom_templates();
		if ( ! isset( $templates[ $group_key ] ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 102 );
		}

		$found = false;
		foreach ( $templates[ $group_key ] as $i => $template ) {
			if ( isset( $template['unique_key'] ) && $template['unique_key'] === $unique_key ) {
				$templates[ $group_key ][ $i ]['id'] = $new_template_id;
				$templates[ $group_key ][ $i ]['label'] = $new_template_label;
				$found = true;
				break;
			}
		}

		if ( ! $found ) {
			throw new \Exception( __( 'Could not update template.', 'voxel-backend' ), 105 );
		}

		// Make sure templates are stored as indexed arrays
		$templates = array_map( 'array_values', $templates );
		$post_type->repository->set_config( [
			'custom_templates' => $templates,
		] );

		// Also update the FSE template title if it's an FSE template
		if ( $post->post_type === 'wp_template' ) {
			$new_title = sprintf( '%s: %s (%s)', $post_type->get_label(), ucfirst( str_replace( '_', ' ', $group_key ) ), $new_template_label );
			wp_update_post( [
				'ID'         => $new_template_id,
				'post_title' => $new_title,
			] );
		}

		wp_send_json( [
			'success' => true,
		] );

	} catch ( \Exception $e ) {
		wp_send_json( [
			'success' => false,
			'message' => $e->getMessage(),
			'code'    => $e->getCode(),
		] );
	}
}, 9 );

