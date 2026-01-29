<?php
/**
 * Create Post Block Controller
 *
 * Handles REST API endpoints for the Create Post block.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Create_Post_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_endpoints' );
	}

	/**
	 * Register REST API endpoints
	 */
	protected function register_endpoints() {
		// Public endpoint for frontend: /wp-json/voxel-fse/v1/create-post/fields-config
		// Returns fields configuration for a specific post type
		register_rest_route( 'voxel-fse/v1', '/create-post/fields-config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_fields_config' ],
			'permission_callback' => '__return_true', // Public for frontend hydration
			'args'                => [
				'post_type' => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'post_id' => [
					'required'          => false,
					'type'              => 'integer',
					'sanitize_callback' => 'absint',
				],
				'is_admin_metabox' => [
					'required'          => false,
					'type'              => 'boolean',
					'sanitize_callback' => 'rest_sanitize_boolean',
				],
			],
		] );
	}

	/**
	 * Get fields configuration for frontend hydration (public endpoint)
	 *
	 * Returns fields config matching Voxel's field->get_frontend_config() output
	 * with FSE icon processing for Elementor-independent rendering.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_fields_config( \WP_REST_Request $request ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return new \WP_Error(
				'voxel_not_active',
				__( 'Voxel theme is not active', 'voxel-fse' ),
				[ 'status' => 400 ]
			);
		}

		$post_type_key = $request->get_param( 'post_type' );
		$post_id = $request->get_param( 'post_id' );
		$is_admin_metabox = $request->get_param( 'is_admin_metabox' );

		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'Invalid post type', 'voxel-fse' ),
				[ 'status' => 404 ]
			);
		}

		// Check if editing existing post
		$post = null;
		if ( $post_id ) {
			$post = \Voxel\Post::get( $post_id );
			// Verify post belongs to this post type
			if ( $post && $post->post_type->get_key() !== $post_type_key ) {
				$post = null;
			}
		}

		// Get fields from post type
		$fields_config = [];

		foreach ( $post_type->get_fields() as $field ) {
			// Set post context if editing
			if ( $post ) {
				$field->set_post( $post );
			}

			// Check dependencies
			try {
				$field->check_dependencies();
			} catch ( \Exception $e ) {
				continue;
			}

			// Check visibility rules
			if ( ! $field->passes_visibility_rules() ) {
				continue;
			}

			// In admin metabox, skip taxonomy fields using native metabox (1:1 match with Voxel)
			// Evidence: themes/voxel/templates/widgets/create-post.php:99-103
			if ( $is_admin_metabox ) {
				if ( $field->get_type() === 'taxonomy' && $field->get_prop( 'backend_edit_mode' ) === 'native_metabox' ) {
					continue;
				}
			}

			// Get field configuration for frontend
			$config = $field->get_frontend_config();

			// CRITICAL FIX: Process choice icons for select/multiselect fields
			// Voxel's get_icon_markup() returns empty string when Elementor is not active
			// Use FSE's Elementor-independent icon processor instead
			if ( ( $field->get_type() === 'multiselect' || $field->get_type() === 'select' ) && isset( $config['props']['choices'] ) ) {
				// Get raw choices with original icon strings (svg:1705, la-regular:lar la-bell, etc.)
				$raw_choices = $field->get_prop( 'choices' );

				// Reprocess icons using FSE's Icon_Processor (Elementor-independent)
				if ( ! empty( $raw_choices ) && is_array( $config['props']['choices'] ) ) {
					foreach ( $config['props']['choices'] as $index => &$choice ) {
						// Get original icon string from raw choices
						$original_icon = $raw_choices[ $index ]['icon'] ?? '';

						// Process icon using FSE's Elementor-independent processor
						if ( ! empty( $original_icon ) ) {
							$choice['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $original_icon );
						}
					}
					unset( $choice ); // Break reference
				}
			}

			// CRITICAL FIX: Process taxonomy field term icons
			// Voxel's get_icon_markup() returns empty string when Elementor is not active
			// Fetch raw icon from term meta and process using FSE's Icon_Processor
			// Evidence: themes/voxel/app/post-types/fields/taxonomy-field.php:219
			// Evidence: themes/voxel/app/utils/term-utils.php:88
			if ( $field->get_type() === 'taxonomy' ) {
				// Helper function to recursively reprocess term icons
				$reprocess_term_icons = function ( &$terms ) use ( &$reprocess_term_icons ) {
					foreach ( $terms as &$term ) {
						if ( ! empty( $term['id'] ) ) {
							// Fetch raw icon from term meta (stored as 'voxel_icon')
							$raw_icon = get_term_meta( $term['id'], 'voxel_icon', true );
							if ( $raw_icon ) {
								$term['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $raw_icon );
							}
						}

						// Recursively process children terms
						if ( ! empty( $term['children'] ) && is_array( $term['children'] ) ) {
							$reprocess_term_icons( $term['children'] );
						}
					}
					unset( $term ); // Break reference
				};

				// Reprocess all terms in the hierarchical tree
				if ( isset( $config['props']['terms'] ) && is_array( $config['props']['terms'] ) ) {
					$reprocess_term_icons( $config['props']['terms'] );
				}

				// Reprocess selected terms
				if ( isset( $config['props']['selected'] ) && is_array( $config['props']['selected'] ) ) {
					foreach ( $config['props']['selected'] as $slug => &$selected_term ) {
						if ( ! empty( $selected_term['id'] ) ) {
							$raw_icon = get_term_meta( $selected_term['id'], 'voxel_icon', true );
							if ( $raw_icon ) {
								$selected_term['icon'] = \VoxelFSE\Utils\Icon_Processor::get_icon_markup( $raw_icon );
							}
						}
					}
					unset( $selected_term ); // Break reference
				}
			}

			$fields_config[] = $config;
		}

		return rest_ensure_response( [
			'fieldsConfig' => $fields_config,
			'postId' => $post_id,
			'postStatus' => $post ? $post->get_status() : null,
		] );
	}
}
