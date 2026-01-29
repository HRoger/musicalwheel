<?php
/**
 * Timeline Block - Server-side render
 *
 * @package MusicalWheel_FSE
 * @since 0.1.0
 * 
 * @var array    $attributes Block attributes
 * @var string   $content    Block content
 * @var WP_Block $block      Block instance
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Extract attributes with defaults
$post_types          = $attributes['postTypes'] ?? [ 'post' ];
$limit               = $attributes['limit'] ?? 10;
$show_avatars        = $attributes['showAvatars'] ?? true;
$show_timestamp      = $attributes['showTimestamp'] ?? true;
$enable_infinite     = $attributes['enableInfiniteScroll'] ?? false;

// Query posts for timeline
$timeline_args = [
	'post_type'      => $post_types,
	'posts_per_page' => $limit,
	'post_status'    => 'publish',
	'orderby'        => 'date',
	'order'          => 'DESC',
];

$timeline_query = new WP_Query( $timeline_args );

// Build wrapper classes
$wrapper_classes = [ 'wp-block-musicalwheel-timeline' ];
if ( $enable_infinite ) {
	$wrapper_classes[] = 'has-infinite-scroll';
}

// Get block wrapper attributes (handles align, spacing, colors, etc.)
$wrapper_attributes = get_block_wrapper_attributes([
	'class' => implode( ' ', $wrapper_classes ),
]);

?>

<div <?php echo $wrapper_attributes; ?> data-limit="<?php echo esc_attr( $limit ); ?>">
	
	<?php if ( $timeline_query->have_posts() ) : ?>
		
		<div class="timeline-feed">
			
			<?php while ( $timeline_query->have_posts() ) : $timeline_query->the_post(); ?>
				
				<article id="timeline-item-<?php the_ID(); ?>" class="timeline-item" data-post-id="<?php the_ID(); ?>">
					
					<div class="timeline-item__header">
						
						<?php if ( $show_avatars ) : ?>
							<div class="timeline-item__avatar">
								<?php echo get_avatar( get_the_author_meta( 'ID' ), 48 ); ?>
							</div>
						<?php endif; ?>
						
						<div class="timeline-item__meta">
							<span class="timeline-item__author">
								<?php the_author(); ?>
							</span>
							
							<?php if ( $show_timestamp ) : ?>
								<time class="timeline-item__time" datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>">
									<?php echo human_time_diff( get_the_time( 'U' ), current_time( 'U' ) ); ?> ago
								</time>
							<?php endif; ?>
						</div>
						
					</div>
					
					<div class="timeline-item__content">
						<h3 class="timeline-item__title">
							<a href="<?php the_permalink(); ?>">
								<?php the_title(); ?>
							</a>
						</h3>
						
						<div class="timeline-item__excerpt">
							<?php the_excerpt(); ?>
						</div>
					</div>
					
					<div class="timeline-item__footer">
						<a href="<?php the_permalink(); ?>" class="timeline-item__link">
							<?php esc_html_e( 'View Post', 'musicalwheel-fse' ); ?>
						</a>
					</div>
					
				</article>
				
			<?php endwhile; ?>
			
		</div>
		
		<?php if ( $enable_infinite ) : ?>
			<div class="timeline-load-more">
				<button type="button" class="timeline-load-more__button" data-page="2">
					<?php esc_html_e( 'Load More', 'musicalwheel-fse' ); ?>
				</button>
			</div>
		<?php endif; ?>
		
	<?php else : ?>
		
		<div class="timeline-empty">
			<p><?php esc_html_e( 'No timeline items found.', 'musicalwheel-fse' ); ?></p>
		</div>
		
	<?php endif; ?>
	
	<?php wp_reset_postdata(); ?>
	
</div>
