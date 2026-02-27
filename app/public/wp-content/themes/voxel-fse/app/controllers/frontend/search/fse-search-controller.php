<?php

namespace VoxelFSE\Controllers\Frontend\Search;

if ( ! defined('ABSPATH') ) {
	exit;
}

/**
 * FSE Search Controller
 *
 * Provides search functionality without Elementor dependencies.
 * Uses Voxel's query system but renders cards with FSE-compatible templates.
 *
 * @since 1.0.0
 */
class FSE_Search_Controller extends \VoxelFSE\Controllers\FSE_Base_Controller {

	/**
	 * Tracks the wp_id of the last resolved FSE card template.
	 * Set by get_fse_card_template_content(), used to fetch NB CSS meta.
	 */
	protected ?int $fse_template_wp_id = null;

	protected function hooks(): void {
		// Override parent search_posts action with higher priority
		$this->on( 'voxel_ajax_search_posts', '@search_posts', 5 );
		$this->on( 'voxel_ajax_nopriv_search_posts', '@search_posts', 5 );

		// Override parent get_preview_card (used by map marker popup)
		// Evidence: themes/voxel/app/controllers/frontend/search/search-controller.php:15-16
		$this->on( 'voxel_ajax_get_preview_card', '@get_preview_card', 5 );
		$this->on( 'voxel_ajax_nopriv_get_preview_card', '@get_preview_card', 5 );
	}

	/**
	 * Handle search posts AJAX request
	 *
	 * FSE VERSION: Uses Voxel's query system directly without Elementor dependencies.
	 * Renders cards using PHP templates instead of Elementor.
	 *
	 * @since 1.0.0
	 */
	protected function search_posts() {
		$post_type_key = sanitize_text_field( $_GET['type'] ?? '' );
		$post_type = \Voxel\Post_Type::get( $post_type_key );

		if ( ! $post_type ) {
			wp_send_json_error( [ 'message' => 'Invalid post type' ], 400 );
		}

		// Read __template_id parameter for card template selection
		// Evidence: voxel/app/controllers/frontend/search/search-controller.php:34
		$template_id = is_numeric( $_GET['__template_id'] ?? null ) ? (int) $_GET['__template_id'] : null;

		// Determine which template to use for card rendering.
		// Priority: __template_id (if it's an FSE template) > FSE default > Voxel/Elementor fallback
		$fse_template_content = null;

		if ( $template_id ) {
			// Check if the requested template is an FSE (wp_template) post
			$fse_template_content = $this->get_fse_card_template_content( $post_type, $template_id );

			if ( ! $fse_template_content ) {
				// Not an FSE template — delegate to Voxel's Elementor rendering
				$this->search_posts_via_voxel( $post_type, $template_id );
				return;
			}
		} else {
			// No specific template requested — use the default FSE card template
			$fse_template_content = $this->get_fse_card_template_content( $post_type );

			if ( empty( $fse_template_content ) ) {
				// No FSE template exists — delegate to Voxel
				$this->search_posts_via_voxel( $post_type, null );
				return;
			}
		}

		// FSE template path: render using do_blocks()
		$limit = absint( $_GET['limit'] ?? 10 );
		$page = absint( $_GET['pg'] ?? 1 );
		$offset = absint( $_GET['__offset'] ?? 0 );
		$get_total_count = ! empty( $_GET['__get_total_count'] );
		$load_markers = ( ( $_GET['__load_markers'] ?? null ) === 'yes' );
		$exclude = array_filter( array_map( 'absint', explode( ',', (string) ( $_GET['__exclude'] ?? '' ) ) ) );

		// Build query args from filters
		$args = [];
		foreach ( $post_type->get_filters() as $filter ) {
			$filter_key = $filter->get_key();
			if ( isset( $_GET[ $filter_key ] ) ) {
				$args[ $filter_key ] = wp_unslash( $_GET[ $filter_key ] );
			}
		}

		// Add pagination
		$args['limit'] = $limit + 1; // +1 to check if there are more results
		if ( $page > 1 ) {
			$args['offset'] = ( $limit * ( $page - 1 ) );
		}
		if ( $offset >= 1 ) {
			$args['offset'] = ( $args['offset'] ?? 0 ) + $offset;
		}

		// Build exclusion callback
		$cb = function( $query ) use ( $exclude ) {
			if ( ! empty( $exclude ) ) {
				$exclude_ids = array_values( array_filter( $exclude ) );
				if ( ! empty( $exclude_ids ) ) {
					$query->where( sprintf(
						'`%s`.post_id NOT IN (%s)',
						$query->table->get_escaped_name(),
						join( ',', $exclude_ids )
					) );
				}
			}
		};

		// Query posts using Voxel's index system (no Elementor dependency)
		$post_ids = $post_type->query( $args, $cb );

		// Check if there are more results
		$has_next = count( $post_ids ) > $limit;
		if ( $has_next ) {
			array_pop( $post_ids ); // Remove the extra post
		}

		// Get total count if requested
		$total_count = 0;
		if ( $get_total_count ) {
			$count_args = $args;
			unset( $count_args['limit'], $count_args['offset'] );
			$total_count = $post_type->get_index_query()->get_post_count( $count_args, $cb );
		}

		// Render cards using FSE-compatible template (with marker support)
		ob_start();
		$this->render_post_cards( $post_ids, $post_type, $load_markers, $fse_template_content );
		$render = ob_get_clean();

		// Output NectarBlocks CSS stored in template post meta.
		// NB saves computed CSS (positions, sizes, flex layouts) to _nectar_blocks_css
		// when the template is saved in the editor. This CSS is needed because NB blocks
		// don't generate inline styles during server-side do_blocks() rendering.
		if ( $this->fse_template_wp_id ) {
			$nb_css = $this->get_nectar_blocks_css( $this->fse_template_wp_id );
			if ( $nb_css ) {
				echo '<style id="nb-post-card-css">' . $nb_css . '</style>';
			}
		}

		// Output rendered HTML
		echo $render;

		// Output metadata script
		printf(
			'<script
				class="info"
				data-has-prev="%s"
				data-has-next="%s"
				data-has-results="%s"
				data-total-count="%d"
				data-display-count="%s"
				data-display-count-alt="%s"
			></script>',
			$page > 1 ? 'true' : 'false',
			$has_next ? 'true' : 'false',
			! empty( $post_ids ) ? 'true' : 'false',
			$total_count,
			\Voxel\count_format( count( $post_ids ), $total_count ),
			\Voxel\count_format( ( ( $page - 1 ) * $limit ) + count( $post_ids ), $total_count )
		);

		die();
	}

	/**
	 * Delegate search to Voxel's native get_search_results()
	 *
	 * Used when:
	 * 1. A specific Elementor __template_id is requested (custom card template)
	 * 2. No FSE card template exists (fallback to Elementor rendering)
	 *
	 * This mirrors Voxel's search-controller.php exactly, including styles/scripts output.
	 * Evidence: themes/voxel/app/controllers/frontend/search/search-controller.php:25-80
	 *
	 * @param \Voxel\Post_Type $post_type
	 * @param int|null $template_id Elementor template ID or null for default
	 */
	protected function search_posts_via_voxel( \Voxel\Post_Type $post_type, ?int $template_id ): void {
		$limit = absint( $_GET['limit'] ?? 10 );
		$page = absint( $_GET['pg'] ?? 1 );
		$offset = absint( $_GET['__offset'] ?? 0 );
		$load_markers = ( ( $_GET['__load_markers'] ?? null ) === 'yes' );
		$load_additional_markers = absint( $_GET['__load_additional_markers'] ?? 0 );
		$exclude = array_filter( array_map( 'absint', explode( ',', (string) ( $_GET['__exclude'] ?? '' ) ) ) );

		$results = \Voxel\get_search_results( wp_unslash( $_GET ), [
			'limit' => $limit,
			'offset' => $offset,
			'template_id' => $template_id,
			'get_total_count' => ! empty( $_GET['__get_total_count'] ),
			'exclude' => array_slice( $exclude, 0, 25 ),
			'preload_additional_ids' => ( $load_markers && $load_additional_markers && $page === 1 ) ? $load_additional_markers : 1,
			'render_cards_with_markers' => $load_markers,
			'apply_conditional_logic' => true,
		] );

		if ( $load_markers && $load_additional_markers && $page === 1 && ! empty( $results['additional_ids'] ) ) {
			$additional_markers = \Voxel\get_search_results( wp_unslash( $_GET ), [
				'ids' => $results['additional_ids'],
				'render' => 'markers',
				'pg' => 1,
				'template_id' => null,
				'get_total_count' => false,
				'exclude' => array_slice( $exclude, 0, 25 ),
				'apply_conditional_logic' => true,
			] );
			echo '<div class="ts-additional-markers hidden">';
			echo $additional_markers['render'];
			echo '</div>';
		}

		echo $results['styles'];
		echo $results['render'];
		echo $results['scripts'];

		$total_count = $results['total_count'] ?? 0;

		printf(
			'<script
				class="info"
				data-has-prev="%s"
				data-has-next="%s"
				data-has-results="%s"
				data-total-count="%d"
				data-display-count="%s"
				data-display-count-alt="%s"
			></script>',
			$results['has_prev'] ? 'true' : 'false',
			$results['has_next'] ? 'true' : 'false',
			! empty( $results['ids'] ) ? 'true' : 'false',
			$total_count,
			\Voxel\count_format( count( $results['ids'] ), $total_count ),
			\Voxel\count_format( ( ( $page - 1 ) * $limit ) + count( $results['ids'] ), $total_count )
		);

		die();
	}

	/**
	 * Get preview card for map marker popup
	 *
	 * FSE VERSION: Renders the FSE card template for a specific post.
	 * Mirrors Voxel parent's approach: set_current_post → render template → output HTML.
	 *
	 * If a template_id is passed, validates it against the post type's custom card templates.
	 * Otherwise, falls back to the main card template.
	 * If no FSE card template exists, returns empty (popup shows only nav arrows).
	 *
	 * Evidence: themes/voxel/app/controllers/frontend/search/search-controller.php:82-131
	 *
	 * @since 1.0.0
	 */
	protected function get_preview_card() {
		try {
			$post = \Voxel\Post::get( $_GET['post_id'] ?? null );
			if ( ! ( $post && $post->post_type && $post->post_type->is_managed_by_voxel() && $post->is_viewable_by_current_user() ) ) {
				throw new \Exception( 'Invalid request.', 101 );
			}

			// Determine which FSE template to render
			// Evidence: Voxel parent validates template_id against card templates
			$template_id = isset( $_GET['template_id'] ) ? absint( $_GET['template_id'] ) : null;
			$fse_template_content = $this->get_fse_card_template_content( $post->post_type, $template_id );

			if ( empty( $fse_template_content ) ) {
				// No FSE template — return empty (popup shows only nav arrows)
				echo '';
				exit;
			}

			// Set post context so VoxelScript tags (@post.title, etc.) resolve correctly
			// Evidence: themes/voxel/app/controllers/frontend/search/search-controller.php:96
			\Voxel\set_current_post( $post );

			// Render the FSE block template with post context
			// This is the FSE equivalent of \Voxel\print_template($template_id)
			// Enable NB SSR for blocks without render callbacks (star-rating, icon)
			\VoxelFSE\Controllers\FSE_NB_SSR_Controller::set_feed_context( true );
			echo do_blocks( $fse_template_content );
			\VoxelFSE\Controllers\FSE_NB_SSR_Controller::set_feed_context( false );
			exit;
		} catch ( \Exception $e ) {
			\VoxelFSE\Controllers\FSE_NB_SSR_Controller::set_feed_context( false );
			return wp_send_json( [
				'success' => false,
				'message' => $e->getMessage(),
				'code'    => $e->getCode(),
			] );
		}
	}

	/**
	 * Render post cards using FSE block template
	 *
	 * Mirrors Voxel parent's rendering loop (post-utils.php:311-338):
	 * For each post: set_current_post → render template → output marker wrapper.
	 *
	 * Uses the FSE card template if available, falls back to render_single_card().
	 *
	 * @param array $post_ids Array of post IDs
	 * @param \Voxel\Post_Type $post_type The post type object
	 * @param bool $render_markers Whether to include map marker data
	 */
	protected function render_post_cards( array $post_ids, \Voxel\Post_Type $post_type, bool $render_markers = false, ?string $fse_template_content = null ): void {
		if ( empty( $post_ids ) ) {
			return;
		}

		// Prime post caches
		_prime_post_caches( array_map( 'absint', $post_ids ) );

		// If no template content was passed, try to get the default FSE card template
		if ( $fse_template_content === null ) {
			$fse_template_content = $this->get_fse_card_template_content( $post_type );
		}

		$current_post = \Voxel\get_current_post();

		// Enable NB SSR for blocks without render callbacks (star-rating, icon)
		\VoxelFSE\Controllers\FSE_NB_SSR_Controller::set_feed_context( true );

		foreach ( $post_ids as $post_id ) {
			$post = \Voxel\Post::get( $post_id );
			if ( ! $post ) {
				continue;
			}

			\Voxel\set_current_post( $post );

			echo '<div class="ts-preview" data-post-id="' . esc_attr( $post_id ) . '">';

			// Render card: FSE template if available, fallback to hardcoded card
			if ( ! empty( $fse_template_content ) ) {
				echo do_blocks( $fse_template_content );
			} else {
				$this->render_single_card( $post );
			}

			// Render marker wrapper for map integration
			// Evidence: themes/voxel/app/utils/post-utils.php:327-332
			if ( $render_markers ) {
				$marker_html = \Voxel\_post_get_marker( $post );
				if ( ! empty( $marker_html ) ) {
					echo '<div class="ts-marker-wrapper hidden">';
					echo $marker_html;
					echo '</div>';
				}
			}

			echo '</div>';
		}

		\VoxelFSE\Controllers\FSE_NB_SSR_Controller::set_feed_context( false );

		// Restore original post context
		if ( $current_post ) {
			\Voxel\set_current_post( $current_post );
		}
	}

	/**
	 * Get the FSE card template content for a post type
	 *
	 * Looks up the FSE card template from the post type's fse_templates config.
	 * If a specific template_id is provided (e.g., for map popup), validates it
	 * against the post type's custom card templates.
	 *
	 * Evidence: Voxel parent uses $post_type->get_templates()['card'] for the main
	 * card template, and custom_templates['card'] for named variants like "Map card".
	 * FSE stores template slugs in $post_type->repository->config['fse_templates']['card'].
	 *
	 * @param \Voxel\Post_Type $post_type The post type object
	 * @param int|null $template_id Optional specific template ID to use
	 * @return string|null Template block content, or null if not found
	 */
	protected function get_fse_card_template_content( \Voxel\Post_Type $post_type, ?int $template_id = null ): ?string {
		// Reset tracked wp_id
		$this->fse_template_wp_id = null;

		// If a specific template_id is provided, check if it's an FSE template
		if ( $template_id ) {
			$template_post = get_post( $template_id );
			if ( $template_post && $template_post->post_type === 'wp_template' && ! empty( $template_post->post_content ) ) {
				$this->fse_template_wp_id = $template_post->ID;
				return $template_post->post_content;
			}
		}

		// Fall back to the main FSE card template from post type config
		$fse_templates = $post_type->repository->config['fse_templates'] ?? [];
		$card_slug = $fse_templates['card'] ?? null;

		if ( ! $card_slug ) {
			// Try the default slug convention: voxel-{post_type_key}-card
			$card_slug = sprintf( 'voxel-%s-card', $post_type->get_key() );
		}

		// Look up the template by slug
		$template_id = \VoxelFSE\Controllers\Templates\Template_Manager::get_template_id_by_slug( $card_slug );
		if ( ! $template_id ) {
			return null;
		}

		$template_post = get_post( $template_id );
		if ( ! $template_post || empty( $template_post->post_content ) ) {
			return null;
		}

		$this->fse_template_wp_id = $template_post->ID;
		return $template_post->post_content;
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
	protected function get_nectar_blocks_css( ?int $template_wp_id ): string {
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
	 * Render a single post card (fallback)
	 *
	 * Simple PHP template used when no FSE card template exists.
	 * Will be replaced by FSE block template rendering once templates are built.
	 *
	 * @param \Voxel\Post $post The Voxel post object
	 */
	protected function render_single_card( \Voxel\Post $post ): void {
		$wp_post = $post->get_wp_post_object();
		$title = get_the_title( $wp_post );
		$permalink = get_permalink( $wp_post );
		$thumbnail = get_the_post_thumbnail_url( $wp_post, 'medium_large' );

		// Get logo/featured image
		$logo_field = $post->get_field( 'logo' );
		$logo_url = $logo_field ? $logo_field->get_value() : null;
		if ( is_array( $logo_url ) && ! empty( $logo_url[0] ) ) {
			$logo_url = wp_get_attachment_image_url( $logo_url[0], 'thumbnail' );
		} else {
			$logo_url = null;
		}

		// Get location if available
		$location_field = $post->get_field( 'location' );
		$location = '';
		if ( $location_field ) {
			$location_value = $location_field->get_value();
			if ( is_array( $location_value ) && ! empty( $location_value['address'] ) ) {
				$location = $location_value['address'];
			}
		}

		// Get rating if available
		$rating = $post->repository->get_review_stats();
		$average_rating = $rating['average'] ?? 0;
		$review_count = $rating['total'] ?? 0;
		?>
		<a href="<?php echo esc_url( $permalink ); ?>" class="ts-preview-card">
			<div class="ts-card-media">
				<?php if ( $thumbnail ) : ?>
					<img src="<?php echo esc_url( $thumbnail ); ?>" alt="<?php echo esc_attr( $title ); ?>" loading="lazy">
				<?php else : ?>
					<div class="ts-no-image"></div>
				<?php endif; ?>
			</div>
			<div class="ts-card-body">
				<?php if ( $logo_url ) : ?>
					<div class="ts-card-logo">
						<img src="<?php echo esc_url( $logo_url ); ?>" alt="">
					</div>
				<?php endif; ?>
				<h3 class="ts-card-title"><?php echo esc_html( $title ); ?></h3>
				<?php if ( $location ) : ?>
					<div class="ts-card-location">
						<i class="las la-map-marker"></i>
						<span><?php echo esc_html( $location ); ?></span>
					</div>
				<?php endif; ?>
				<?php if ( $average_rating > 0 ) : ?>
					<div class="ts-card-rating">
						<i class="las la-star"></i>
						<span><?php echo esc_html( number_format( $average_rating, 1 ) ); ?></span>
						<span class="ts-review-count">(<?php echo esc_html( $review_count ); ?>)</span>
					</div>
				<?php endif; ?>
			</div>
		</a>
		<?php
	}
}
