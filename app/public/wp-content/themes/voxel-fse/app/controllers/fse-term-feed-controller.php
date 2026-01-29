<?php
/**
 * Term Feed REST API Controller
 *
 * Provides REST API endpoints for the Term Feed block.
 * Fetches terms data based on configuration from vxconfig.
 *
 * Endpoints:
 * - GET /voxel-fse/v1/term-feed/taxonomies - Get available Voxel taxonomies
 * - GET /voxel-fse/v1/term-feed/post-types - Get available Voxel post types
 * - GET /voxel-fse/v1/term-feed/card-templates - Get available term card templates
 * - GET /voxel-fse/v1/term-feed/terms - Get terms with rendered card HTML
 *
 * Evidence:
 * - Voxel widget: themes/voxel/app/widgets/term-feed.php
 * - Template: themes/voxel/templates/widgets/term-feed.php
 *
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Term_Feed_Controller extends FSE_Base_Controller {

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
		$this->on( 'enqueue_block_assets', '@enqueue_block_styles' );
	}

	/**
	 * Enqueue Voxel's CSS when the block is present
	 */
	protected function enqueue_block_styles(): void {
		$version = wp_get_theme()->parent()->get( 'Version' );

		// Enqueue Voxel's commons CSS (contains .flexify, .simplify-ul, .ts-icon-btn, .min-scroll)
		wp_enqueue_style(
			'voxel-commons',
			get_template_directory_uri() . '/assets/dist/commons.css',
			[],
			$version
		);

		// Enqueue Voxel's post-feed CSS which contains grid and carousel styles
		wp_enqueue_style(
			'voxel-post-feed',
			get_template_directory_uri() . '/assets/dist/post-feed.css',
			[ 'voxel-commons' ],
			$version
		);
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes(): void {
		$namespace = 'voxel-fse/v1';

		// GET /term-feed/test - Simple test endpoint
		register_rest_route( $namespace, '/term-feed/test', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'test_endpoint' ],
			'permission_callback' => '__return_true',
		] );

		// GET /term-feed/taxonomies - Get available Voxel taxonomies
		register_rest_route( $namespace, '/term-feed/taxonomies', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_taxonomies' ],
			'permission_callback' => '__return_true', // Public - needed for editor
		] );

		// GET /term-feed/post-types - Get available Voxel post types
		register_rest_route( $namespace, '/term-feed/post-types', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_post_types' ],
			'permission_callback' => '__return_true', // Public - needed for editor
		] );

		// GET /term-feed/card-templates - Get available term card templates
		register_rest_route( $namespace, '/term-feed/card-templates', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_card_templates' ],
			'permission_callback' => '__return_true', // Public - needed for editor
		] );

		// GET /term-feed/terms - Get terms with rendered card HTML
		register_rest_route( $namespace, '/term-feed/terms', [
			'methods'             => \WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_terms' ],
			'permission_callback' => '__return_true', // Public - needed for frontend hydration
			'args'                => [
				'source' => [
					'type'              => 'string',
					'default'           => 'filters',
					'enum'              => [ 'filters', 'manual' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'term_ids' => [
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'taxonomy' => [
					'type'              => 'string',
					'default'           => '',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'parent_term_id' => [
					'type'              => 'integer',
					'default'           => 0,
					'sanitize_callback' => 'absint',
				],
				'order' => [
					'type'              => 'string',
					'default'           => 'default',
					'enum'              => [ 'default', 'name' ],
					'sanitize_callback' => 'sanitize_text_field',
				],
				'per_page' => [
					'type'              => 'integer',
					'default'           => 10,
					'sanitize_callback' => 'absint',
				],
				'hide_empty' => [
					'type'              => 'boolean',
					'default'           => false,
				],
				'hide_empty_pt' => [
					'type'              => 'string',
					'default'           => ':all',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'card_template' => [
					'type'              => 'string',
					'default'           => 'main',
					'sanitize_callback' => 'sanitize_text_field',
				],
			],
		] );
	}

	/**
	 * Simple test endpoint
	 *
	 * @return \WP_REST_Response
	 */
	public function test_endpoint(): \WP_REST_Response {
		return rest_ensure_response( [
			'success' => true,
			'message' => 'Term Feed API is working',
			'voxel_term_exists' => class_exists( '\\Voxel\\Term' ),
			'voxel_taxonomy_exists' => class_exists( '\\Voxel\\Taxonomy' ),
		] );
	}

	/**
	 * Get available Voxel taxonomies
	 *
	 * @return \WP_REST_Response
	 */
	public function get_taxonomies(): \WP_REST_Response {
		$taxonomies = [];

		// Check if Voxel Taxonomy class exists
		if ( class_exists( '\Voxel\Taxonomy' ) ) {
			foreach ( \Voxel\Taxonomy::get_voxel_taxonomies() as $taxonomy ) {
				$taxonomies[] = [
					'key'   => $taxonomy->get_key(),
					'label' => sprintf( '%s (%s)', $taxonomy->get_label(), $taxonomy->get_key() ),
				];
			}
		}

		return rest_ensure_response( [
			'taxonomies' => $taxonomies,
		] );
	}

	/**
	 * Get available Voxel post types
	 *
	 * @return \WP_REST_Response
	 */
	public function get_post_types(): \WP_REST_Response {
		$post_types = [];

		// Check if Voxel Post_Type class exists
		if ( class_exists( '\Voxel\Post_Type' ) ) {
			foreach ( \Voxel\Post_Type::get_voxel_types() as $post_type ) {
				$post_types[] = [
					'key'   => $post_type->get_key(),
					'label' => $post_type->get_label(),
				];
			}
		}

		return rest_ensure_response( [
			'postTypes' => $post_types,
		] );
	}

	/**
	 * Get available term card templates
	 *
	 * @return \WP_REST_Response
	 */
	public function get_card_templates(): \WP_REST_Response {
		$templates = [];

		// Get custom templates from Voxel
		if ( function_exists( '\Voxel\get_custom_templates' ) ) {
			$custom_templates = \Voxel\get_custom_templates();
			if ( isset( $custom_templates['term_card'] ) && is_array( $custom_templates['term_card'] ) ) {
				foreach ( $custom_templates['term_card'] as $template ) {
					$templates[] = [
						'id'    => $template['id'] ?? '',
						'label' => $template['label'] ?? '',
					];
				}
			}
		}

		// Add default 'main' template if not present
		if ( empty( $templates ) ) {
			$templates[] = [
				'id'    => 'main',
				'label' => __( 'Default', 'voxel-fse' ),
			];
		}

		return rest_ensure_response( [
			'templates' => $templates,
		] );
	}

	/**
	 * Get terms with rendered card HTML
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_terms( \WP_REST_Request $request ) {
		try {
			global $wpdb;

			// Extract params
			$source         = $request->get_param( 'source' );
			$term_ids_param = $request->get_param( 'term_ids' );
			$taxonomy       = $request->get_param( 'taxonomy' );
			$per_page       = $request->get_param( 'per_page' );

			// Check Voxel Term class
			if ( ! class_exists( '\Voxel\Term' ) ) {
				return new \WP_Error(
					'voxel_not_available',
					'Voxel theme is required for term feed.',
					[ 'status' => 500 ]
				);
			}

			// Handle empty taxonomy for filters mode
			if ( $source !== 'manual' && empty( $taxonomy ) ) {
				return rest_ensure_response( [
					'terms'   => [],
					'total'   => 0,
					'message' => 'No taxonomy specified',
				] );
			}

			// Handle manual mode with no term IDs
			if ( $source === 'manual' && empty( $term_ids_param ) ) {
				return rest_ensure_response( [
					'terms'   => [],
					'total'   => 0,
					'message' => 'No term IDs specified for manual mode',
				] );
			}

			// Query term IDs
			$term_ids = [];

			if ( $source === 'manual' ) {
				$term_ids = array_filter( array_map( 'intval', explode( ',', $term_ids_param ) ) );
			} else {
				$query_limit = is_numeric( $per_page ) ? absint( $per_page ) : 10;

				$sql = $wpdb->prepare(
					"SELECT t.term_id FROM {$wpdb->terms} AS t
					INNER JOIN {$wpdb->term_taxonomy} AS tt ON t.term_id = tt.term_id
					WHERE tt.taxonomy = %s
					ORDER BY t.name ASC
					LIMIT %d",
					$taxonomy,
					$query_limit
				);

				$term_ids = $wpdb->get_col( $sql );
			}

			// Return early if no term IDs found
			if ( empty( $term_ids ) ) {
				return rest_ensure_response( [
					'terms'    => [],
					'total'    => 0,
					'taxonomy' => $taxonomy,
					'message'  => 'No terms found',
				] );
			}

			// Prime caches
			_prime_term_caches( $term_ids );

			// Build response using WordPress native get_term
			$response_terms = [];

			foreach ( $term_ids as $term_id ) {
				$wp_term = get_term( (int) $term_id );

				if ( ! $wp_term || is_wp_error( $wp_term ) ) {
					continue;
				}

				// Build basic term data from WP_Term
				$term_data = [
					'id'          => $wp_term->term_id,
					'name'        => $wp_term->name,
					'slug'        => $wp_term->slug,
					'description' => $wp_term->description,
					'count'       => $wp_term->count,
					'parent'      => $wp_term->parent,
					'taxonomy'    => $wp_term->taxonomy,
					'link'        => get_term_link( $wp_term ),
					'color'       => '',
					'icon'        => '',
					'cardHtml'    => '',
				];

				// Try to get Voxel-specific data
				$voxel_term = \Voxel\Term::get( (int) $term_id );
				if ( $voxel_term ) {
					$term_data['color'] = $voxel_term->get_color() ?? '';
					$term_data['link']  = $voxel_term->get_link();

					$icon_value = $voxel_term->get_icon();
					if ( $icon_value && function_exists( '\Voxel\get_icon_markup' ) ) {
						$term_data['icon'] = \Voxel\get_icon_markup( $icon_value );
					}
				}

				// Generate simple card HTML
				$term_data['cardHtml'] = $this->render_simple_card( $term_data );

				$response_terms[] = $term_data;
			}

			return rest_ensure_response( [
				'terms'    => $response_terms,
				'total'    => count( $response_terms ),
				'taxonomy' => $taxonomy,
			] );

		} catch ( \Throwable $e ) {
			error_log( 'Term Feed get_terms Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine() );
			return new \WP_Error(
				'term_feed_error',
				$e->getMessage(),
				[ 'status' => 500 ]
			);
		}
	}

	/**
	 * Render simple card HTML from term data array
	 *
	 * @param array $term_data
	 * @return string
	 */
	private function render_simple_card( array $term_data ): string {
		$link  = $term_data['link'] ?? '';
		$color = $term_data['color'] ?? '';
		$icon  = $term_data['icon'] ?? '';
		$name  = $term_data['name'] ?? '';
		$count = $term_data['count'] ?? 0;

		$style = ! empty( $color ) ? sprintf( 'style="--ts-accent-color: %s;"', esc_attr( $color ) ) : '';

		ob_start();
		?>
		<div class="ts-term-card" <?php echo $style; ?>>
			<?php if ( ! empty( $link ) ): ?>
				<a href="<?php echo esc_url( $link ); ?>" class="ts-term-link">
			<?php endif; ?>
				<?php if ( ! empty( $icon ) ): ?>
					<div class="ts-term-icon"><?php echo $icon; ?></div>
				<?php endif; ?>
				<div class="ts-term-name"><?php echo esc_html( $name ); ?></div>
				<div class="ts-term-count"><?php echo esc_html( $count ); ?> <?php esc_html_e( 'posts', 'voxel-fse' ); ?></div>
			<?php if ( ! empty( $link ) ): ?>
				</a>
			<?php endif; ?>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Check if a term has posts (for hide_empty filter)
	 *
	 * @param \Voxel\Term $term
	 * @param string $post_type
	 * @return bool
	 */
	private function term_has_posts( $term, string $post_type ): bool {
		if ( ! method_exists( $term, 'post_counts' ) ) {
			return true; // Can't check, assume has posts
		}

		$counts = $term->post_counts->get_counts();

		if ( empty( $counts ) ) {
			return false;
		}

		if ( $post_type === ':all' ) {
			// Check if any post type has posts
			foreach ( $counts as $count ) {
				if ( is_numeric( $count ) && $count > 0 ) {
					return true;
				}
			}
			return false;
		}

		// Check specific post type
		if ( ! isset( $counts[ $post_type ] ) || ! is_numeric( $counts[ $post_type ] ) ) {
			return false;
		}

		return $counts[ $post_type ] > 0;
	}
}
