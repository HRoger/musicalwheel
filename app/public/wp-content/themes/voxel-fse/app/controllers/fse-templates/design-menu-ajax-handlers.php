<?php
declare(strict_types=1);

/**
 * AJAX Handlers for Design Menu Custom Templates
 *
 * Intercepts Voxel's AJAX handlers for creating/managing Design menu templates
 * to create FSE templates instead of Elementor templates.
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.5
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Debug logging removed - uncomment below lines for troubleshooting
// $ajax_action = $_GET['action'] ?? $_POST['action'] ?? 'NO_ACTION';
// $vx_param = isset($_GET['vx']) ? 'vx=1' : 'no_vx';
// error_log( "=== FSE DESIGN-MENU-AJAX-HANDLERS.PHP FILE LOADED (action={$ajax_action}, {$vx_param}) ===" );

// Debug: Log ALL voxel_ajax actions (uncomment for troubleshooting)
// add_action( 'all', function( $tag ) {
//     if ( strpos( $tag, 'voxel_ajax_' ) === 0 ) {
//         error_log( "=== VOXEL AJAX ACTION CALLED: {$tag} ===" );
//     }
// }, 1 );


/**
 * Intercept custom template creation for Header & Footer and Taxonomies
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 * Uses Voxel's custom AJAX hook system (voxel_ajax_*)
 */
add_action( 'voxel_ajax_backend.create_custom_template', function() {
	// error_log( '=== FSE AJAX Handler: backend.create_custom_template fired ===' );

	// Verify nonce
	if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'vx_admin_edit_templates' ) ) {
		// error_log( 'FSE AJAX: Nonce verification failed - exiting' );
		return; // Let Voxel handle invalid nonce
	}
	// error_log( 'FSE AJAX: Nonce OK' );

	// Verify user capabilities
	if ( ! current_user_can( 'manage_options' ) ) {
		// error_log( 'FSE AJAX: User lacks manage_options capability - exiting' );
		return;
	}
	// error_log( 'FSE AJAX: User capability OK' );

	// Get parameters
	$label = sanitize_text_field( $_GET['label'] ?? '' );
	$group = sanitize_text_field( $_GET['group'] ?? '' );
	// error_log( "FSE AJAX: Label='{$label}', Group='{$group}'" );

	if ( empty( $label ) || empty( $group ) ) {
		// error_log( 'FSE AJAX: Empty label or group - exiting' );
		return; // Let Voxel handle validation
	}
	// error_log( 'FSE AJAX: Label and group OK' );

	// Only handle groups we support
	$supported_groups = [ 'header', 'footer', 'term_single', 'term_card' ];
	if ( ! in_array( $group, $supported_groups, true ) ) {
		// error_log( "FSE AJAX: Unsupported group '{$group}' - exiting" );
		return; // Let Voxel handle other groups
	}
	// error_log( "FSE AJAX: Group '{$group}' is supported" );

	// Generate unique key FIRST (same as Voxel does)
	$unique_key = strtolower( \Voxel\random_string( 8 ) );
	// error_log( "FSE AJAX: Generated unique_key='{$unique_key}'" );

	// Create FSE template with UNIQUE slug
	$template_label = sprintf( '%s: %s', ucfirst( str_replace( '_', ' ', $group ) ), $label );
	
	// ⭐ FIX: Pass just the type part - create_fse_template_for_design_menu() prepends 'voxel-' internally
	// Wrong: "voxel-header-abc123" would become "voxel-voxel-header-abc123"
	// Correct: "header-abc123" becomes "voxel-header-abc123"
	$fse_template_type = "{$group}-{$unique_key}";
	// error_log( "FSE AJAX: Creating template with type='{$fse_template_type}', label='{$template_label}'" );

	$fse_template_id = Template_Manager::create_fse_template_for_design_menu( $fse_template_type, $template_label );


	if ( ! $fse_template_id ) {
		// error_log( 'FSE AJAX: Failed to create FSE template - sending error response' );
		wp_send_json( [
			'success' => false,
			'message' => 'Failed to create FSE template',
		] );
		return;
	}

	// Build custom template config (Voxel format)
	$template_config = [
		'label'       => $label,
		'id'          => absint( $fse_template_id ),
		'unique_key'  => $unique_key, // Use the same unique_key we used in the slug
	];

	// Add visibility_rules for certain groups
	if ( in_array( $group, [ 'header', 'footer', 'term_single' ], true ) ) {
		$template_config['visibility_rules'] = [];
	}

	// Get existing custom templates
	$custom_templates = \Voxel\get( 'custom_templates' ) ?? [];
	if ( ! isset( $custom_templates[ $group ] ) || ! is_array( $custom_templates[ $group ] ) ) {
		$custom_templates[ $group ] = [];
	}

	// Add new template
	$custom_templates[ $group ][] = $template_config;

	// ⭐ DON'T save to Voxel config - it should only contain Elementor template info
	// \Voxel\set( 'custom_templates', $custom_templates );
	// Voxel will create its own Elementor template via its AJAX handler
    \Voxel\set( 'custom_templates', $custom_templates );
	// Store FSE template mapping for JavaScript
	$fse_custom_mapping = get_option( 'mw_fse_design_custom_template_mapping', [] );
	$fse_edit_url = Template_Manager::get_site_editor_url( $fse_template_id );
	$fse_custom_mapping[ $fse_template_id ] = $fse_edit_url;
	update_option( 'mw_fse_design_custom_template_mapping', $fse_custom_mapping, false );
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
 * Intercept base template creation for Design menu
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 * Uses Voxel's custom AJAX hook system (voxel_ajax_*)
 */
add_action( 'voxel_ajax_backend.create_base_template', function() {
	// error_log( '=== FSE AJAX Handler: backend.create_base_template fired ===' );
	// Verify nonce
	if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'vx_admin_edit_templates' ) ) {
		return; // Let Voxel handle invalid nonce
	}

	// Verify user capabilities
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	// Get template key
	$template_key = sanitize_text_field( $_GET['template_key'] ?? '' );

	if ( empty( $template_key ) ) {
		return; // Let Voxel handle validation
	}

	// ⭐ CRITICAL FIX: These templates are PAGES, not FSE templates!
	// Evidence: themes/voxel/app/utils/template-utils.php:360-342
	// All these templates have 'type' => 'page' in their configuration
	// Voxel uses \Voxel\create_page() for these, not create_template()
	// We should NOT intercept page template creation - let Voxel handle it
	$page_template_keys = [
		'templates.auth',           // Login & Registration
		'templates.current_plan',   // Current plan
		'templates.orders',         // Orders page
		'templates.checkout',       // Cart summary
		'templates.stripe_account', // Stripe Connect account
		'templates.timeline',       // Newsfeed
		'templates.inbox',          // Inbox
		'templates.post_stats',     // Post statistics
		'templates.privacy_policy', // Privacy Policy
		'templates.terms',          // Terms & Conditions
	];

	if ( in_array( $template_key, $page_template_keys, true ) ) {
		// Return early - let Voxel's handler (priority 10) create the page
		// error_log( "FSE AJAX: Skipping page template '{$template_key}' - letting Voxel create page" );
		return;
	}

	// Extract template type from key (e.g., 'templates.header' => 'header')
	$template_key_parts = explode( '.', $template_key );
	$template_type = end( $template_key_parts );

	// Get template label from base templates
	$base_templates = \Voxel\get_base_templates();
	$template_label = 'Template';
	foreach ( $base_templates as $template ) {
		if ( $template['key'] === $template_key ) {
			$template_label = $template['label'];
			break;
		}
	}

	// Create FSE template (only for actual templates, not pages)
	$fse_template_id = Template_Manager::create_fse_template_for_design_menu( $template_type, $template_label );

	if ( ! $fse_template_id ) {
		wp_send_json( [
			'success' => false,
			'message' => 'Failed to create FSE template',
		] );
		return;
	}

	// ⭐ DON'T store FSE template ID in Voxel's config - it should only contain Elementor IDs
	// $templates = \Voxel\get( 'templates' ) ?? [];
	// $templates[ $template_type ] = $fse_template_id;
	// \Voxel\set( 'templates', $templates );
	// Voxel will create its own Elementor template via its AJAX handler

	// Store FSE template mapping for JavaScript
	$fse_mapping = get_option( 'mw_fse_design_template_mapping', [] );
	$fse_edit_url = Template_Manager::get_site_editor_url( $fse_template_id );
	$fse_mapping[ $fse_template_id ] = $fse_edit_url;
	update_option( 'mw_fse_design_template_mapping', $fse_mapping, false );

	// Return success with FSE info
	wp_send_json( [
		'success'         => true,
		'template_id'     => $fse_template_id,
		'fse_template_id' => $fse_template_id,
		'fse_edit_url'    => $fse_edit_url,
	] );
}, 9 );

/**
 * Intercept custom template update (rename) for FSE templates
 *
 * Voxel's handler uses \Voxel\template_exists() which only works for 'elementor_library' post type.
 * Our FSE templates are 'wp_template' post type, so we need to handle them separately.
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 */
add_action( 'voxel_ajax_backend.update_custom_template_details', function() {
	try {
		// Verify nonce (same as Voxel)
		\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_admin_edit_templates' );
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 100 );
		}

		$unique_key = $_GET['unique_key'] ?? null;
		$group_key = $_GET['group'] ?? null;
		$new_template_id = $_GET['new_template_id'] ?? null;
		$new_template_label = sanitize_text_field( $_GET['new_template_label'] ?? '' );

		if ( empty( $unique_key ) || empty( $group_key ) ) {
			return; // Let Voxel handle validation
		}

		// Only intercept if the template ID is a wp_template (FSE) post
		if ( ! is_numeric( $new_template_id ) ) {
			return; // Let Voxel handle validation
		}

		$new_template_id = absint( $new_template_id );
		$post = get_post( $new_template_id );

		// If it's NOT an FSE template, let Voxel handle it
		if ( ! $post || $post->post_type !== 'wp_template' ) {
			// Also check if it's an Elementor template - if so, let Voxel handle it
			if ( $post && $post->post_type === 'elementor_library' ) {
				return; // Voxel's handler will work for this
			}
			// If post doesn't exist at all, we still need to handle the error
			// because Voxel's template_exists() would fail for wp_template too
		}

		// Validate the template exists (for FSE templates)
		if ( ! $post || $post->post_status === 'trash' ) {
			throw new \Exception( __( 'Provided template does not exist', 'voxel-backend' ), 103 );
		}

		if ( empty( $new_template_label ) ) {
			throw new \Exception( __( 'Template label cannot be empty', 'voxel-backend' ), 104 );
		}

		// Get templates and update
		$templates = \Voxel\get_custom_templates();
		if ( ! isset( $templates[ $group_key ] ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 101 );
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
		\Voxel\set( 'custom_templates', $templates );

		// Also update the FSE template title if it's an FSE template
		if ( $post->post_type === 'wp_template' ) {
			$new_title = sprintf( '%s: %s', ucfirst( str_replace( '_', ' ', $group_key ) ), $new_template_label );
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

/**
 * Intercept custom template deletion for FSE templates
 *
 * Voxel's handler uses wp_delete_post() which works with any post type,
 * but we need to also clean up our FSE mapping.
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 */
add_action( 'voxel_ajax_backend.delete_custom_template', function() {
	try {
		\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_admin_edit_templates' );
		if ( ! current_user_can( 'manage_options' ) ) {
			return; // Let Voxel handle
		}

		$unique_key = $_GET['unique_key'] ?? null;
		$group_key = $_GET['group'] ?? null;

		if ( empty( $unique_key ) || empty( $group_key ) ) {
			return; // Let Voxel handle
		}

		// Get the template to find its ID
		$templates = \Voxel\get_custom_templates();
		if ( ! isset( $templates[ $group_key ] ) ) {
			return; // Let Voxel handle
		}

		$template_id = null;
		foreach ( $templates[ $group_key ] as $template ) {
			if ( isset( $template['unique_key'] ) && $template['unique_key'] === $unique_key ) {
				$template_id = $template['id'] ?? null;
				break;
			}
		}

		if ( ! $template_id ) {
			return; // Template not found, let Voxel handle
		}

		// Check if this is an FSE template
		$post = get_post( $template_id );
		if ( ! $post || $post->post_type !== 'wp_template' ) {
			return; // Not an FSE template, let Voxel handle
		}

		// Clean up FSE mapping
		$fse_custom_mapping = get_option( 'mw_fse_design_custom_template_mapping', [] );
		if ( isset( $fse_custom_mapping[ $template_id ] ) ) {
			unset( $fse_custom_mapping[ $template_id ] );
			update_option( 'mw_fse_design_custom_template_mapping', $fse_custom_mapping, false );
		}

		// Let Voxel handle the actual deletion - it uses wp_delete_post() which works for any post type

	} catch ( \Exception $e ) {
		// Silently continue - let Voxel handle errors
	}
}, 8 ); // Priority 8 - run BEFORE our other handlers to clean up mapping

/**
 * Intercept base template ID update (switch) on Design menu
 *
 * This handles switching between templates for Header, Footer, and other base templates
 * in the Design > Header & Footer page.
 *
 * Voxel's handler uses \Voxel\template_exists() which only works for 'elementor_library' post type.
 * Our FSE templates are 'wp_template' post type, so we need to handle them separately.
 *
 * Hook at priority 9 - BEFORE Voxel's handler at priority 10
 */
add_action( 'voxel_ajax_backend.update_base_template_id', function() {
	// Debug logging (uncomment for troubleshooting)
	// error_log( "=== FSE AJAX: update_base_template_id HANDLER FIRED ===" );
	// error_log( "FSE AJAX: template_key = " . ($_GET['template_key'] ?? 'NOT SET') );
	// error_log( "FSE AJAX: new_template_id = " . ($_GET['new_template_id'] ?? 'NOT SET') );
	
	try {
		// Verify nonce (same as Voxel)
		\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_admin_edit_templates' );
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 100 );
		}

		$template_key = $_GET['template_key'] ?? null;
		$new_template_id = $_GET['new_template_id'] ?? null;

		if ( empty( $template_key ) ) {
			// error_log( "FSE AJAX: Empty template_key - returning to let Voxel handle" );
			return; // Let Voxel handle validation
		}


		// Get base templates to find the template type
		$templates = \Voxel\get_base_templates();
		$template = null;
		foreach ( $templates as $tpl ) {
			if ( $tpl['key'] === $template_key ) {
				$template = $tpl;
				break;
			}
		}

		if ( $template === null ) {
			return; // Let Voxel handle - invalid template_key
		}

		// If template type is 'page', let Voxel handle it (uses page_exists())
		if ( $template['type'] === 'page' ) {
			return; // Voxel handles page templates correctly
		}

		// For 'template' type, check if the new ID is an FSE template
		if ( ! is_numeric( $new_template_id ) ) {
			return; // Let Voxel handle validation
		}

		$new_template_id = absint( $new_template_id );
		$post = get_post( $new_template_id );

		// If it's an Elementor template, let Voxel handle it
		if ( $post && $post->post_type === 'elementor_library' ) {
			return; // Voxel's template_exists() will work for this
		}

		// Validate the post exists and is not trashed
		if ( ! $post || $post->post_status === 'trash' ) {
			throw new \Exception( __( 'Provided template does not exist.', 'voxel-backend' ), 105 );
		}

		// Allow FSE templates (wp_template), FSE template parts (wp_template_part), 
		// and any other post types (for backward compatibility)
		// Only reject if it's a known incompatible type
		$allowed_types = [ 'wp_template', 'wp_template_part', 'elementor_library' ];
		if ( ! in_array( $post->post_type, $allowed_types, true ) ) {
			// For any other post type, still allow it (backward compatibility)
			// This handles edge cases where templates might be stored differently
		}


		// Save the new template ID to Voxel's config
		// error_log( "FSE AJAX: Saving template - key={$template['key']}, new_id=$new_template_id" );
		\Voxel\set( $template['key'], $new_template_id );
		
		// ⭐ CRITICAL: Also store FSE template IDs in separate option for protection
		// This allows our page load hook to restore them after Voxel overwrites
		$template_type = null;
		if ( strpos( $template['key'], 'header' ) !== false ) {
			$template_type = 'header';
		} elseif ( strpos( $template['key'], 'footer' ) !== false ) {
			$template_type = 'footer';
		}
		
		if ( $template_type && in_array( $post->post_type, [ 'wp_template', 'wp_template_part' ], true ) ) {
			$fse_base_ids = get_option( 'mw_fse_base_template_ids', [] );
			$fse_base_ids[ $template_type ] = $new_template_id;
			update_option( 'mw_fse_base_template_ids', $fse_base_ids );
			// error_log( "FSE AJAX: Stored FSE {$template_type} ID {$new_template_id} in separate option" );
		}
		
		// Verify it was saved (debug)
		// $saved_value = \Voxel\get( $template['key'] );
		// error_log( "FSE AJAX: After save check - key={$template['key']}, saved_value=$saved_value" );

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
