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

		// Render cards using FSE-compatible template
		ob_start();
		$this->render_post_cards( $post_ids, $post_type );
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
	 * Render post cards without Elementor
	 *
	 * Uses Voxel's post data but renders with a simple PHP template
	 * that matches the expected HTML structure.
	 *
	 * @param array $post_ids Array of post IDs
	 * @param \Voxel\Post_Type $post_type The post type object
	 */
	protected function render_post_cards( array $post_ids, \Voxel\Post_Type $post_type ): void {
		if ( empty( $post_ids ) ) {
			return;
		}

		// Prime post caches
		_prime_post_caches( array_map( 'absint', $post_ids ) );

		$current_post = \Voxel\get_current_post();

		foreach ( $post_ids as $post_id ) {
			$post = \Voxel\Post::get( $post_id );
			if ( ! $post ) {
				continue;
			}

			\Voxel\set_current_post( $post );

			echo '<div class="ts-preview" data-post-id="' . esc_attr( $post_id ) . '">';
			$this->render_single_card( $post );
			echo '</div>';
		}

		// Restore original post context
		if ( $current_post ) {
			\Voxel\set_current_post( $current_post );
		}
	}

	/**
	 * Render a single post card
	 *
	 * This is a simple PHP template that matches Voxel's preview card structure.
	 * In production, this could be replaced with a Gutenberg block pattern.
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
