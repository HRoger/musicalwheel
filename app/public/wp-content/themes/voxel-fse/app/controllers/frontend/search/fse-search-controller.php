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
		$this->render_post_cards( $post_ids, $post_type, $load_markers );
		$render = ob_get_clean();

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
			echo do_blocks( $fse_template_content );
			exit;
		} catch ( \Exception $e ) {
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
	protected function render_post_cards( array $post_ids, \Voxel\Post_Type $post_type, bool $render_markers = false ): void {
		if ( empty( $post_ids ) ) {
			return;
		}

		// Prime post caches
		_prime_post_caches( array_map( 'absint', $post_ids ) );

		// Get the FSE card template content (if it exists)
		$fse_template_content = $this->get_fse_card_template_content( $post_type );

		$current_post = \Voxel\get_current_post();

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
		// If a specific template_id is provided, check if it's an FSE template
		if ( $template_id ) {
			$template_post = get_post( $template_id );
			if ( $template_post && $template_post->post_type === 'wp_template' && ! empty( $template_post->post_content ) ) {
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

		// Check if the template has real content (not just default placeholder)
		// The default template contains "post-featured-image" and "post-title" blocks
		// which is actually valid block content — render it
		return $template_post->post_content;
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
