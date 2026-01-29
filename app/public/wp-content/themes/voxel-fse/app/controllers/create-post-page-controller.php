<?php
declare(strict_types=1);

namespace VoxelFSE\Controllers;

/**
 * Ensures create-{post-type} form pages exist with correct slug
 * 
 * Evidence:
 * - themes/voxel/app/post-types/post-type-templates.php:44-57
 * - Voxel creates pages with slug: create-{post_type_key}
 * - But page_exists() doesn't check slug, so wrong slugs aren't fixed
 * 
 * @package VoxelFSE\Controllers
 * @since 1.1.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Post_Page_Controller extends FSE_Base_Controller {

	protected function hooks(): void {
		// Ensure form pages exist with correct slug on post type edit screen
		$this->on( 'admin_init', '@ensure_form_pages_exist' );
		
		// Also check when accessing form pages (in case they're missing)
		$this->on( 'template_redirect', '@maybe_create_missing_form_page', 1 );
	}

	protected function ensure_form_pages_exist() {
		// Only on post type edit screens
		$screen = get_current_screen();
		if ( ! $screen || strpos( $screen->id, 'edit-post-type-' ) !== 0 ) {
			return;
		}

		$post_type_key = str_replace( 'edit-post-type-', '', $screen->id );
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return;
		}

		$this->fix_form_page_slug( $post_type );
	}

	protected function maybe_create_missing_form_page() {
		// Only on frontend, not admin
		if ( is_admin() ) {
			return;
		}

		// Check if URL matches create-{post_type} pattern
		$request_uri = $_SERVER['REQUEST_URI'] ?? '';
		if ( ! preg_match( '#/create-([^/]+)/?#', $request_uri, $matches ) ) {
			return;
		}

		$post_type_key = $matches[1];
		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return;
		}

		$form_page_id = $post_type->get_templates()['form'] ?? null;
		
		// If page doesn't exist or has wrong slug, fix it
		if ( ! $form_page_id || ! \Voxel\page_exists( $form_page_id ) ) {
			$this->create_form_page( $post_type );
		} else {
			$this->fix_form_page_slug( $post_type );
		}
	}

	protected function fix_form_page_slug( \Voxel\Post_Type $post_type ) {
		$form_page_id = $post_type->get_templates()['form'] ?? null;
		if ( ! $form_page_id || ! \Voxel\page_exists( $form_page_id ) ) {
			// Page doesn't exist - create it
			$this->create_form_page( $post_type );
			return;
		}

		$page = get_post( $form_page_id );
		if ( ! $page ) {
			return;
		}

		$expected_slug = sprintf( 'create-%s', $post_type->get_key() );
		
		// Check if slug is correct
		if ( $page->post_name !== $expected_slug ) {
			// Slug is wrong - fix it
			wp_update_post( [
				'ID' => $form_page_id,
				'post_name' => $expected_slug,
			] );
			
			// Clear permalink cache
			clean_post_cache( $form_page_id );
			
			error_log( sprintf(
				'[Create Post FSE] Fixed form page slug for post type "%s": %s -> %s',
				$post_type->get_key(),
				$page->post_name,
				$expected_slug
			) );
		}
	}

	protected function create_form_page( \Voxel\Post_Type $post_type ) {
		// Use Voxel's create_page function (same as Voxel does)
		// Evidence: themes/voxel/app/post-types/post-type-templates.php:50-52
		$title = sprintf( 'Create %s', $post_type->get_singular_name() );
		$new_template_id = \Voxel\create_page(
			$title,
			sprintf( 'create-%s', $post_type->get_key() )
		);

		if ( is_wp_error( $new_template_id ) ) {
			error_log( sprintf(
				'[Create Post FSE] Failed to create form page for post type "%s": %s',
				$post_type->get_key(),
				$new_template_id->get_error_message()
			) );
			return;
		}

		// Update post type config (same as Voxel does)
		// Evidence: themes/voxel/app/post-types/post-type-templates.php:55-57
		$templates = $post_type->get_templates();
		$templates['form'] = absint( $new_template_id );
		$post_type->repository->set_config( [
			'templates' => $templates,
		] );

		error_log( sprintf(
			'[Create Post FSE] Created form page for post type "%s" (ID: %d, slug: create-%s)',
			$post_type->get_key(),
			$new_template_id,
			$post_type->get_key()
		) );
	}
}

