<?php
declare(strict_types=1);

/**
 * Custom Templates Handler
 *
 * Intercepts Voxel's custom template creation to create FSE templates instead.
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.5
 */

namespace VoxelFSE\Controllers\Templates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Intercept custom template creation AJAX
 *
 * Hook at priority 9 to run BEFORE Voxel's handler (priority 10)
 */
add_action( 'voxel_ajax_pte.create_custom_template', function() {
	try {
		\Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_admin_edit_templates' );
		if ( ! current_user_can('manage_options') ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 100 );
		}

		$post_type = \Voxel\Post_Type::get( $_GET['post_type'] ?? null );
		if ( ! $post_type ) {
			throw new \Exception( __( 'Could not create template', 'voxel-backend' ), 101 );
		}

		$templates = $post_type->templates->get_custom_templates();
		$group_key = $_GET['group'] ?? null;

		if ( ! isset( $templates[ $group_key ] ) ) {
			throw new \Exception( __( 'Invalid request.', 'voxel-backend' ), 102 );
		}

		$label = sanitize_text_field( $_GET['label'] ?? '' );
		if ( empty( $label ) ) {
			throw new \Exception( __( 'Template label is required.', 'voxel-backend' ), 103 );
		}

		// Determine template type based on group
		$template_type_map = [
			'single_post' => 'single',
			'card' => 'card',
			'single' => 'single',
		];

		$template_type = $template_type_map[ $group_key ] ?? 'single';

		// Create FSE template instead of Elementor template
		$fse_template_id = Template_Manager::create_fse_template( $post_type->get_key(), $template_type );

		if ( ! $fse_template_id ) {
			throw new \Exception( __( 'Could not create FSE template', 'voxel-backend' ), 104 );
		}

		// Update template title to include label
		wp_update_post( [
			'ID' => $fse_template_id,
			'post_title' => sprintf( '%s: %s - %s', $post_type->get_label(), ucfirst( $template_type ), $label ),
		] );

		$template_config = [
			'label' => $label,
			'id' => absint( $fse_template_id ),
			'unique_key' => strtolower( \Voxel\random_string(8) ),
		];

		if ( in_array( $group_key, [ 'single_post' ], true ) ) {
			$template_config['visibility_rules'] = [];
		}

		$templates[ $group_key ][] = $template_config;

		$templates = array_map( 'array_values', $templates );
		$post_type->repository->set_config( [
			'custom_templates' => $templates,
		] );

		// Store FSE template mapping for click interceptor
		$fse_custom_mapping = get_option( 'mw_fse_custom_template_mapping', [] );
		$fse_edit_url = Template_Manager::get_site_editor_url( $fse_template_id );
		$fse_custom_mapping[ $fse_template_id ] = $fse_edit_url;
		update_option( 'mw_fse_custom_template_mapping', $fse_custom_mapping, false );

		wp_send_json( [
			'success' => true,
			'templates' => $templates,
			'fse_template_id' => $fse_template_id,
			'fse_edit_url' => $fse_edit_url,
		] );

	} catch ( \Exception $e ) {
		wp_send_json( [
			'success' => false,
			'message' => $e->getMessage(),
		] );
	}
}, 9 ); // Priority 9 - runs BEFORE Voxel's handler at priority 10

/**
 * Intercept custom template deletion to remove FSE templates
 */
add_action( 'voxel_ajax_pte.delete_custom_template', function() {
	// Get the template ID before Voxel deletes it
	$post_type = \Voxel\Post_Type::get( $_REQUEST['post_type'] ?? null );
	if ( ! $post_type ) {
		return;
	}

	$templates = $post_type->templates->get_custom_templates();
	$unique_key = $_REQUEST['unique_key'] ?? null;
	$group_key = $_REQUEST['group'] ?? null;

	if ( ! isset( $templates[ $group_key ] ) ) {
		return;
	}

	foreach ( $templates[ $group_key ] as $template ) {
		if ( $template['unique_key'] === $unique_key && isset( $template['id'] ) ) {
			$template_id = $template['id'];

			// Check if this is an FSE template (wp_template post type)
			$post = get_post( $template_id );
			if ( $post && $post->post_type === 'wp_template' ) {
				// Remove from mapping
				$fse_custom_mapping = get_option( 'mw_fse_custom_template_mapping', [] );
				unset( $fse_custom_mapping[ $template_id ] );
				update_option( 'mw_fse_custom_template_mapping', $fse_custom_mapping, false );
			}
			break;
		}
	}
}, 9 ); // Priority 9 - runs BEFORE Voxel's handler
