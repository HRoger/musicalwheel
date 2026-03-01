<?php
/**
 * Create Post Block Controller
 *
 * Handles REST API endpoints for the Create Post block.
 * Implements Plan C+ architecture with full 1:1 Voxel parity.
 *
 * Key Endpoints:
 * - /fields-config: Get field configuration for post type
 * - /post-context: Get permissions, state, and nonces for a post (NEW)
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Create_Post_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const REST_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_endpoints' );
	}

	/**
	 * Always authorize REST route registration
	 */
	protected function authorize(): bool {
		return true;
	}

	/**
	 * Register REST API endpoints
	 */
	protected function register_endpoints() {
		// Fields Config endpoint (existing)
		// Returns fields configuration for a specific post type
		register_rest_route( self::REST_NAMESPACE, '/create-post/fields-config', [
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

		// Post Context endpoint (NEW - Plan C+ parity)
		// Returns permissions, state, and nonces for create-post form
		// Evidence: themes/voxel/app/widgets/create-post.php:4955-5058
		register_rest_route( self::REST_NAMESPACE, '/create-post/post-context', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_context' ],
			'permission_callback' => '__return_true', // Publicly readable, logic handles visibility
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
		$is_admin_metabox = (bool) $request->get_param( 'is_admin_metabox' );

		$result = self::generate_fields_config( $post_type_key, $post_id ? (int) $post_id : null, $is_admin_metabox );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Generate fields config data (reusable from REST and render_block)
	 *
	 * @param string   $post_type_key Post type key.
	 * @param int|null $post_id       Post ID for edit mode.
	 * @param bool     $is_admin_metabox Whether in admin metabox context.
	 * @return array|\WP_Error FieldsConfigResponse data or error.
	 */
	public static function generate_fields_config( string $post_type_key, ?int $post_id = null, bool $is_admin_metabox = false ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return [];
		}

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

		return [
			'fieldsConfig' => $fields_config,
			'postId' => $post_id,
			'postStatus' => $post ? $post->get_status() : null,
		];
	}

	/**
	 * Get post context for create-post form
	 *
	 * Returns permissions, state, and nonces needed for the form.
	 * Implements 1:1 parity with Voxel's create-post widget render logic.
	 *
	 * Evidence:
	 * - themes/voxel/app/widgets/create-post.php:4955-5058 (render method)
	 * - themes/voxel/templates/widgets/create-post.php:11 (permission check)
	 * - themes/voxel/templates/widgets/create-post/no-permission.php (no-permission template)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_post_context( \WP_REST_Request $request ) {
		$post_type_key = $request->get_param( 'post_type' );
		$post_id = $request->get_param( 'post_id' );

		$data = self::generate_post_context( $post_type_key, $post_id ? (int) $post_id : null );

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		return new \WP_REST_Response( $data );
	}

	/**
	 * Generate post context data (reusable from REST and render_block)
	 *
	 * Returns permissions, state, and nonces needed for the form.
	 * Implements 1:1 parity with Voxel's create-post widget render logic.
	 *
	 * @param string   $post_type_key Post type key.
	 * @param int|null $post_id       Post ID for edit mode.
	 * @return array|\WP_Error PostContext data or error.
	 */
	public static function generate_post_context( string $post_type_key, ?int $post_id = null ) {
		if ( ! class_exists( '\Voxel\Post_Type' ) ) {
			return new \WP_Error( 'voxel_not_active', 'Voxel theme is not active', [ 'status' => 400 ] );
		}

		$post_type = \Voxel\Post_Type::get( $post_type_key );
		if ( ! $post_type ) {
			return new \WP_Error( 'invalid_post_type', 'Invalid post type', [ 'status' => 404 ] );
		}

		$is_logged_in = is_user_logged_in();
		$user = $is_logged_in ? \Voxel\get_current_user() : null;

		// Determine post context (create new vs edit existing)
		// Evidence: themes/voxel/app/widgets/create-post.php:4981-4991
		$post = null;

		// Handle profile post type specially
		// Evidence: themes/voxel/app/widgets/create-post.php:4981-4983
		if ( $post_type_key === 'profile' && $user ) {
			ob_start();
			$post = $user->get_or_create_profile();
			ob_end_clean();
		}

		// Check if user can edit specific post
		// Evidence: themes/voxel/app/widgets/create-post.php:4985-4987
		if ( $post_id ) {
			ob_start();
			if ( \Voxel\Post::current_user_can_edit( $post_id ) ) {
				$post = \Voxel\Post::get( $post_id );
			}
			ob_end_clean();

			// Verify post belongs to this post type
			if ( $post && $post->post_type->get_key() !== $post_type_key ) {
				$post = null;
			}
		}

		// Permission check - can user create posts of this type?
		// Evidence: themes/voxel/templates/widgets/create-post.php:11
		$can_create = false;
		$can_edit = false;

		if ( $user ) {
			ob_start();
			$can_create = $user->can_create_post( $post_type_key );
			ob_end_clean();
		}

		if ( $post ) {
			ob_start();
			$can_edit = $post->is_editable_by_current_user();
			ob_end_clean();
		}

		$has_permission = $post ? $can_edit : $can_create;

		// Post state context
		$post_status = $post ? $post->get_status() : null;
		$can_save_draft = $post ? ( $post_status === 'draft' ) : true;

		// Build edit link for existing posts
		$edit_link = null;
		if ( $post ) {
			ob_start();
			$edit_link = $post->get_edit_link();
			ob_end_clean();
		}

		// Build create link for new posts
		$create_link = null;
		if ( ! $post ) {
			$create_template = \Voxel\get( 'templates.create_post' );
			if ( $create_template ) {
				$create_link = add_query_arg( 'type', $post_type_key, get_permalink( $create_template ) );
			}
		}

		// Get UI steps for edit menu
		$steps = [];
		if ( $post || $can_create ) {
			foreach ( $post_type->get_fields() as $field ) {
				if ( $field->get_type() === 'ui-step' ) {
					try {
						$field->check_dependencies();
						if ( $field->passes_visibility_rules() ) {
							$steps[] = [
								'key' => $field->get_key(),
								'label' => $field->get_label(),
							];
						}
					} catch ( \Exception $e ) {
						continue;
					}
				}
			}
		}

		// Validation error messages (matching Voxel exactly)
		$validation_errors = [
			'required' => _x( 'Required', 'field validation', 'voxel' ),
			'text:minlength' => _x( 'Value cannot be shorter than @minlength characters', 'field validation', 'voxel' ),
			'text:maxlength' => _x( 'Value cannot be longer than @maxlength characters', 'field validation', 'voxel' ),
			'text:pattern' => _x( 'Please match the requested format', 'field validation', 'voxel' ),
			'email:invalid' => _x( 'You must provide a valid email address', 'field validation', 'voxel' ),
			'number:min' => _x( 'Value cannot be less than @min', 'field validation', 'voxel' ),
			'number:max' => _x( 'Value cannot be more than @max', 'field validation', 'voxel' ),
			'url:invalid' => _x( 'You must provide a valid URL', 'field validation', 'voxel' ),
			'form:has-errors' => _x( 'Please fill in all required fields', 'repeater row validation', 'voxel' ),
		];

		return [
			'isLoggedIn' => $is_logged_in,
			'userId' => $user ? $user->get_id() : null,
			'permissions' => [
				'create' => $can_create,
				'edit' => $can_edit,
			],
			'hasPermission' => $has_permission,
			'noPermission' => [
				'title' => _x( 'Your account doesn\'t support this feature yet.', 'create post', 'voxel' ),
			],
			'postId' => $post ? $post->get_id() : null,
			'postStatus' => $post_status,
			'postTitle' => $post ? $post->get_title() : null,
			'editLink' => $edit_link,
			'createLink' => $create_link,
			'canSaveDraft' => $can_save_draft,
			'steps' => $steps,
			'validationErrors' => $validation_errors,
			'nonces' => [
				'create_post' => wp_create_nonce( 'vx_create_post' ),
			],
			'postType' => [
				'key' => $post_type_key,
				'label' => $post_type->get_label(),
				'singularName' => $post_type->get_singular_name(),
			],
		];
	}
}
