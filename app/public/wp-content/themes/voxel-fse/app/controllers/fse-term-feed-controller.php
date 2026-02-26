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
		// Only enqueue on frontend — in editor, voxel-editor-combined.css handles all Voxel CSS
		if (is_admin()) {
			return;
		}

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
	 * PARITY REFERENCE: themes/voxel/app/widgets/term-feed.php lines 609-712
	 *
	 * Key parity features:
	 * - parent_term_id filter: WHERE tt.parent = {parent_id} (line 664)
	 * - voxel_order sorting: ORDER BY t.voxel_order ASC, t.name ASC (line 685)
	 * - hide_empty with post_counts JOIN: INNER JOIN termmeta (lines 668-681)
	 * - Voxel template rendering: \Voxel\print_template($template_id) (line 20)
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_terms( \WP_REST_Request $request ) {
		try {
			global $wpdb;

			// Extract params - matches Voxel widget settings
			$source          = $request->get_param( 'source' );
			$term_ids_param  = $request->get_param( 'term_ids' );
			$taxonomy        = $request->get_param( 'taxonomy' );
			$parent_term_id  = $request->get_param( 'parent_term_id' );
			$order           = $request->get_param( 'order' );
			$per_page        = $request->get_param( 'per_page' );
			$hide_empty      = $request->get_param( 'hide_empty' );
			$hide_empty_pt   = $request->get_param( 'hide_empty_pt' );
			$card_template   = $request->get_param( 'card_template' );

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
			$voxel_terms = [];

			if ( $source === 'manual' ) {
				// PARITY: Manual mode - extract term IDs from repeater (line 616)
				$term_ids = array_filter( array_map( 'intval', explode( ',', $term_ids_param ) ) );

				if ( ! empty( $term_ids ) ) {
					// PARITY: Prime caches (line 621)
					_prime_term_caches( $term_ids );

					// PARITY: Get Voxel terms (line 622)
					// Wrap in try-catch since Voxel\Term::get may throw errors
					$voxel_terms = [];
					foreach ( $term_ids as $tid ) {
						try {
							$vt = \Voxel\Term::get( (int) $tid );
							if ( $vt ) {
								$voxel_terms[] = $vt;
							}
						} catch ( \Throwable $e ) {
							error_log( 'Term Feed Voxel\Term::get Error for term ' . $tid . ': ' . $e->getMessage() );
						}
					}

					// PARITY: Apply hide_empty filter for manual mode (lines 624-644)
					if ( $hide_empty && ! empty( $voxel_terms ) ) {
						$voxel_terms = array_filter( $voxel_terms, function( $term ) use ( $hide_empty_pt ) {
							return $this->term_has_posts( $term, $hide_empty_pt ?: ':all' );
						} );
					}

					// Get term IDs from filtered Voxel terms
					$term_ids = array_map( function( $term ) {
						return $term->get_id();
					}, $voxel_terms );
				}
			} else {
				// PARITY: Filters mode - build SQL query (lines 650-709)
				$query_taxonomy = esc_sql( $taxonomy );
				$query_limit = is_numeric( $per_page ) ? absint( $per_page ) : 10;

				// Use simple name ordering by default - voxel_order is optional
				// PARITY: ORDER BY - 'name' uses alphabetical (line 685)
				$query_order_by = 't.name ASC';

				// Build JOIN clauses
				$joins = [];
				$wheres = [];

				// PARITY: Parent term filter (line 664)
				if ( is_numeric( $parent_term_id ) && $parent_term_id > 0 ) {
					$wheres[] = $wpdb->prepare( 'tt.parent = %d', absint( $parent_term_id ) );
				}

				// Note: hide_empty with post_counts JOIN is complex and may not work on all setups
				// Simplified to avoid potential SQL errors

				// Build SQL query - simplified version (lines 689-697)
				$join_clauses = join( ' ', $joins );
				$where_clauses = ! empty( $wheres ) ? ' AND ' . join( ' AND ', $wheres ) : '';

				// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$sql = "SELECT t.term_id FROM {$wpdb->terms} AS t
					INNER JOIN {$wpdb->term_taxonomy} AS tt ON t.term_id = tt.term_id
					{$join_clauses}
					WHERE tt.taxonomy = '{$query_taxonomy}'
					{$where_clauses}
					ORDER BY {$query_order_by}
					LIMIT {$query_limit}";

				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
				$term_ids = $wpdb->get_col( $sql );

				// Log SQL errors for debugging
				if ( $wpdb->last_error ) {
					error_log( 'Term Feed SQL Error: ' . $wpdb->last_error . ' | Query: ' . $sql );
				}

				if ( ! empty( $term_ids ) ) {
					// PARITY: Prime caches (line 704)
					_prime_term_caches( $term_ids );

					// PARITY: Get Voxel terms (line 705)
					// Wrap in try-catch since Voxel\Term::get may throw errors
					$voxel_terms = [];
					foreach ( $term_ids as $tid ) {
						try {
							$vt = \Voxel\Term::get( (int) $tid );
							if ( $vt ) {
								$voxel_terms[] = $vt;
							}
						} catch ( \Throwable $e ) {
							error_log( 'Term Feed Voxel\Term::get Error for term ' . $tid . ': ' . $e->getMessage() );
						}
					}
				}
			}

			// Return early if no terms found
			if ( empty( $term_ids ) || empty( $voxel_terms ) ) {
				return rest_ensure_response( [
					'terms'    => [],
					'total'    => 0,
					'taxonomy' => $taxonomy,
					'message'  => 'No terms found',
				] );
			}

			// Resolve the card template ID and get its block content
			$numeric_template_id = $this->resolve_term_card_template_id( $card_template ?? 'main' );
			$template_content = $this->get_term_card_template_content( $numeric_template_id );

			// Build response with rendered card HTML
			$response_terms = [];

			foreach ( $voxel_terms as $voxel_term ) {
				$wp_term = get_term( $voxel_term->get_id() );

				if ( ! $wp_term || is_wp_error( $wp_term ) ) {
					continue;
				}

				// Build term data from Voxel term
				$term_data = [
					'id'          => $voxel_term->get_id(),
					'name'        => $wp_term->name,
					'slug'        => $wp_term->slug,
					'description' => $wp_term->description,
					'count'       => $wp_term->count,
					'parent'      => $wp_term->parent,
					'taxonomy'    => $wp_term->taxonomy,
					'link'        => $voxel_term->get_link(),
					'color'       => $voxel_term->get_color() ?? '',
					'icon'        => '',
					'cardHtml'    => '',
				];

				// Get icon markup
				$icon_value = $voxel_term->get_icon();
				if ( $icon_value && function_exists( '\Voxel\get_icon_markup' ) ) {
					$term_data['icon'] = \Voxel\get_icon_markup( $icon_value );
				}

				// Render card HTML using FSE template via do_blocks()
				if ( $template_content ) {
					$term_data['cardHtml'] = $this->render_term_card_html( $voxel_term, $template_content );
				}

				// Fallback to simple card if template rendering produced empty output
				if ( empty( trim( $term_data['cardHtml'] ) ) ) {
					$term_data['cardHtml'] = $this->render_simple_card_from_term( $voxel_term );
				}

				$response_terms[] = $term_data;
			}

			// Collect inline styles generated by block rendering
			$styles = $this->get_rendered_block_styles();

			// Include NectarBlocks CSS stored in template post meta
			// NB saves computed CSS (positions, sizes, flex layouts) to _nectar_blocks_css
			// when the template is saved in the editor. This CSS is needed for proper rendering
			// since NB blocks don't generate inline styles during do_blocks().
			$nb_css = $this->get_nectar_blocks_css( $numeric_template_id );
			if ( $nb_css ) {
				$styles .= '<style id="nb-term-card-css">' . $nb_css . '</style>';
			}

			return rest_ensure_response( [
				'terms'    => $response_terms,
				'total'    => count( $response_terms ),
				'taxonomy' => $taxonomy,
				'styles'   => $styles,
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
	 * Check if a column exists in a database table
	 *
	 * @param string $table Table name
	 * @param string $column Column name
	 * @return bool
	 */
	private function column_exists( string $table, string $column ): bool {
		global $wpdb;

		static $cache = [];
		$cache_key = $table . '.' . $column;

		if ( isset( $cache[ $cache_key ] ) ) {
			return $cache[ $cache_key ];
		}

		try {
			// Use SHOW COLUMNS to check if column exists
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$result = $wpdb->get_results( $wpdb->prepare(
				"SHOW COLUMNS FROM `{$table}` LIKE %s",
				$column
			) );

			$cache[ $cache_key ] = ! empty( $result );
		} catch ( \Throwable $e ) {
			error_log( 'Term Feed column_exists Error: ' . $e->getMessage() );
			$cache[ $cache_key ] = false;
		}

		return $cache[ $cache_key ];
	}

	/**
	 * Resolve numeric Elementor template ID from the card_template parameter.
	 *
	 * PARITY: themes/voxel/app/widgets/term-feed.php line 121-127
	 * - Options come from \Voxel\get_custom_templates()['term_card']
	 * - Default value is 'main' (sentinel, not a numeric ID)
	 * - Validation uses non-strict in_array (Voxel post-utils.php:102)
	 *
	 * @param string $template_id 'main' or numeric Elementor template post ID
	 * @return int|null Numeric template ID or null if none found
	 */
	private function resolve_term_card_template_id( string $template_id ): ?int {
		if ( ! function_exists( '\Voxel\get_custom_templates' ) ) {
			return null;
		}

		$custom_templates = \Voxel\get_custom_templates();
		$term_card_templates = $custom_templates['term_card'] ?? [];

		if ( empty( $term_card_templates ) ) {
			return null;
		}

		// If a numeric ID was provided, validate it exists
		// PARITY: Voxel uses non-strict in_array (post-utils.php:102, template-utils.php:258)
		if ( is_numeric( $template_id ) ) {
			$valid_ids = array_column( $term_card_templates, 'id' );
			if ( in_array( (int) $template_id, $valid_ids ) ) {
				return (int) $template_id;
			}
		}

		// For 'main' or invalid ID, use the first available template
		return absint( $term_card_templates[0]['id'] ?? 0 ) ?: null;
	}

	/**
	 * Get the block content for a term card template.
	 *
	 * Term card templates are stored as wp_template posts (FSE templates).
	 * This retrieves the raw block markup (post_content) for rendering via do_blocks().
	 *
	 * @param int|null $template_id Template post ID
	 * @return string|null Block content string, or null if not found
	 */
	private function get_term_card_template_content( ?int $template_id ): ?string {
		if ( ! $template_id ) {
			return null;
		}

		$template_post = get_post( $template_id );
		if ( ! $template_post || empty( $template_post->post_content ) ) {
			return null;
		}

		// Accept both wp_template and elementor_library post types
		$allowed_types = [ 'wp_template', 'elementor_library' ];
		if ( ! in_array( $template_post->post_type, $allowed_types, true ) ) {
			return null;
		}

		return $template_post->post_content;
	}

	/**
	 * Render term card HTML using do_blocks() with Voxel term context.
	 *
	 * PARITY: themes/voxel/templates/widgets/term-feed.php line 18-21
	 * Sets current term context so VoxelScript dynamic tags resolve correctly,
	 * then renders the FSE block template content via do_blocks().
	 *
	 * @param \Voxel\Term $term
	 * @param string $template_content Raw block markup from the template post
	 * @return string Rendered card HTML
	 */
	private function render_term_card_html( $term, string $template_content ): string {
		try {
			$original_term = \Voxel\get_current_term();
			\Voxel\set_current_term( $term );

			// Enable NB SSR for blocks without render callbacks (star-rating, icon)
			FSE_NB_SSR_Controller::set_feed_context( true );
			$html = do_blocks( $template_content );
			FSE_NB_SSR_Controller::set_feed_context( false );

			\Voxel\set_current_term( $original_term );

			return $html ?: '';
		} catch ( \Throwable $e ) {
			FSE_NB_SSR_Controller::set_feed_context( false );
			error_log( 'Term Feed render_term_card_html Error: ' . $e->getMessage() );
			return '';
		}
	}

	/**
	 * Collect inline styles generated during block rendering.
	 *
	 * When do_blocks() renders FSE block content, blocks may enqueue
	 * inline styles via wp_add_inline_style() or wp_enqueue_style().
	 * This captures those pending styles as HTML for injection into the editor.
	 *
	 * @return string Inline <style> and <link> tags
	 */
	private function get_rendered_block_styles(): string {
		ob_start();
		wp_print_styles();
		$output = ob_get_clean() ?: '';
		return $output;
	}

	/**
	 * Get NectarBlocks CSS stored in template post meta.
	 *
	 * NB saves computed CSS (positions, sizes, flex layouts, colors) to
	 * `_nectar_blocks_css` post meta when the template is saved in the editor.
	 * This CSS is needed because NB blocks don't generate inline styles
	 * during server-side do_blocks() rendering.
	 *
	 * Evidence: nectar-blocks/includes/API/CSS_API.php update_wp_template_part()
	 * Evidence: nectar-blocks/includes/Render/Render.php get_dynamic_block_css()
	 *
	 * @param int|null $template_wp_id The wp_id of the wp_template post
	 * @return string CSS content or empty string
	 */
	private function get_nectar_blocks_css( ?int $template_wp_id ): string {
		if ( ! $template_wp_id ) {
			return '';
		}

		$css = get_post_meta( $template_wp_id, '_nectar_blocks_css', true );
		if ( empty( $css ) || ! is_string( $css ) ) {
			return '';
		}

		return $css;
	}

	/**
	 * Build simple card from a Voxel Term object (fallback when template rendering fails)
	 *
	 * @param \Voxel\Term $term
	 * @return string
	 */
	private function render_simple_card_from_term( $term ): string {
		try {
			$term_name = method_exists( $term, 'get_label' ) ? $term->get_label() : '';
			if ( empty( $term_name ) ) {
				$wp_term = get_term( $term->get_id() );
				$term_name = $wp_term ? $wp_term->name : 'Term';
			}

			$term_count = 0;
			if ( method_exists( $term, 'get_post_count' ) ) {
				$term_count = $term->get_post_count() ?? 0;
			} else {
				$wp_term = $wp_term ?? get_term( $term->get_id() );
				$term_count = $wp_term ? $wp_term->count : 0;
			}

			$icon_markup = '';
			if ( method_exists( $term, 'get_icon' ) && function_exists( '\Voxel\get_icon_markup' ) ) {
				$icon_value = $term->get_icon();
				if ( $icon_value ) {
					$icon_markup = \Voxel\get_icon_markup( $icon_value );
				}
			}

			return $this->render_simple_card( [
				'link'  => method_exists( $term, 'get_link' ) ? $term->get_link() : '',
				'color' => method_exists( $term, 'get_color' ) ? ( $term->get_color() ?? '' ) : '',
				'icon'  => $icon_markup,
				'name'  => $term_name,
				'count' => $term_count,
			] );
		} catch ( \Throwable $e ) {
			return '<div class="ts-term-card"><div class="ts-term-name">Term</div></div>';
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
	 * PARITY: themes/voxel/app/widgets/term-feed.php lines 624-644
	 * Uses $term->post_counts->get_counts() to check post counts per type
	 *
	 * @param \Voxel\Term $term
	 * @param string $post_type
	 * @return bool
	 */
	private function term_has_posts( $term, string $post_type ): bool {
		try {
			// Voxel uses $term->post_counts as a property accessor
			if ( ! isset( $term->post_counts ) || ! is_object( $term->post_counts ) ) {
				return true; // Can't check, assume has posts
			}

			if ( ! method_exists( $term->post_counts, 'get_counts' ) ) {
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

		} catch ( \Throwable $e ) {
			error_log( 'Term Feed term_has_posts Error: ' . $e->getMessage() );
			return true; // On error, assume has posts
		}
	}
}
