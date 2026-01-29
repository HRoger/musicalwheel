<?php
declare(strict_types=1);

/**
 * FSE Templates Controller
 *
 * Provides FSE (Full Site Editing) template management for Voxel post types.
 * Allows creating and editing templates using WordPress Site Editor instead of Elementor.
 *
 * @package VoxelFSE\Controllers\FSE_Templates
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers\FSE_Templates;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}


/**
 * Module constants
 */
define( 'VOXEL_FSE_TEMPLATES_VERSION', '1.0.5' );
define( 'VOXEL_FSE_TEMPLATES_PATH', __DIR__ );

class Templates_Controller extends \VoxelFSE\Controllers\FSE_Base_Controller {

	/**
	 * Load controller dependencies
	 */
	protected function dependencies(): void {
		// ⭐ NEW (v1.1.0): FSE action handler - intercepts action=fse and redirects to Site Editor
		// This must be loaded FIRST so the replace_editor filter is registered early
		require_once VOXEL_FSE_TEMPLATES_PATH . '/fse-action-handler.php';
		
		// Vue integration - replaces action=elementor with action=fse via MutationObserver
		require_once VOXEL_FSE_TEMPLATES_PATH . '/vue-integration.php';
		require_once VOXEL_FSE_TEMPLATES_PATH . '/template-manager.php';
		require_once VOXEL_FSE_TEMPLATES_PATH . '/ajax-handlers.php';
		require_once VOXEL_FSE_TEMPLATES_PATH . '/custom-templates-handler.php';
		require_once VOXEL_FSE_TEMPLATES_PATH . '/design-menu-integration.php';
		require_once VOXEL_FSE_TEMPLATES_PATH . '/design-menu-ajax-handlers.php';
		require_once VOXEL_FSE_TEMPLATES_PATH . '/paid-listings-integration.php';
	}

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->filter( 'map_meta_cap', '@grant_template_permissions', 10, 4 );
		$this->filter( 'get_block_templates', '@register_block_templates', 10, 3 );
		$this->on( 'init', '@initialize_templates' );
	}

	/**
	 * Grant permissions to edit wp_template posts
	 *
	 * WordPress's wp_template post type requires 'edit_theme_options' capability by default.
	 * We need to allow users with 'manage_options' (administrators) to edit FSE templates.
	 *
	 * @param array $caps Capabilities.
	 * @param string $cap Capability name.
	 * @param int $user_id User ID.
	 * @param array $args Additional args.
	 * @return array
	 */
	protected function grant_template_permissions( array $caps, string $cap, int $user_id, array $args ): array {
		// Only handle wp_template post type editing
		if ( ! in_array( $cap, [ 'edit_post', 'delete_post', 'read_post' ], true ) ) {
			return $caps;
		}

		// Check if this is for a wp_template post
		if ( ! empty( $args[0] ) ) {
			$post = get_post( $args[0] );
			if ( $post && $post->post_type === 'wp_template' ) {
				// Grant permission to users who can manage_options
				if ( current_user_can( 'manage_options' ) ) {
					return [ 'manage_options' ];
				}
			}
		}

		return $caps;
	}

	/**
	 * Register custom wp_template posts with WordPress
	 *
	 * @param mixed $query_result Query result.
	 * @param array $query Query args.
	 * @param string $template_type Template type.
	 * @return mixed
	 */
	protected function register_block_templates( mixed $query_result, array $query, string $template_type ): mixed {
		// Only add our templates if querying wp_template
		if ( $template_type !== 'wp_template' ) {
			return $query_result;
		}

		// Get all Voxel post types
		if ( ! function_exists( '\Voxel\Post_Type::get_all' ) ) {
			return $query_result;
		}

		$post_types = \Voxel\Post_Type::get_all();

		foreach ( $post_types as $post_type ) {
			$fse_templates = $post_type->repository->config['fse_templates'] ?? array();

			foreach ( $fse_templates as $template_type => $template_slug ) {
				if ( ! $template_slug ) {
					continue;
				}

				// Check if template exists in database
				$template_id = Template_Manager::get_template_id_by_slug( $template_slug );
				if ( ! $template_id ) {
					continue;
				}

				// Get template post
				$template_post = get_post( $template_id );
				if ( ! $template_post ) {
					continue;
				}

				// Check if this template is already in the results
				$already_exists = false;
				foreach ( $query_result as $result_template ) {
					if ( isset( $result_template->slug ) && $result_template->slug === $template_slug ) {
						$already_exists = true;
						break;
					}
				}

				if ( $already_exists ) {
					continue;
				}

				// Create a block template object
				$block_template = new \WP_Block_Template();
				$block_template->slug = $template_slug;
				$block_template->id = 'voxel-fse//' . $template_slug;
				$block_template->theme = 'voxel-fse';
				$block_template->content = $template_post->post_content;
				$block_template->source = 'custom';
				$block_template->origin = 'custom';
				$block_template->type = 'wp_template';
				$block_template->description = $template_post->post_excerpt;
				$block_template->title = $template_post->post_title;
				$block_template->status = $template_post->post_status;
				$block_template->has_theme_file = false;
				$block_template->is_custom = true;
				$block_template->post_types = array( $post_type->get_key() );

				$query_result[] = $block_template;
			}
		}

		return $query_result;
	}

	/**
	 * Initialize FSE Templates
	 *
	 * @return void
	 */
	protected function initialize_templates(): void {
		// Module is loaded - components are auto-initialized via their own hooks
	}
}
