<?php
/**
 * Timeline Block Render Template
 *
 * @var array $attributes Block attributes
 * @var array $statuses Timeline statuses data
 */

$feed_type      = $attributes['feedType'] ?? 'user_feed';
$show_composer  = $attributes['showComposer'] ?? true;
$enable_search  = $attributes['enableSearch'] ?? false;

?>
<div <?php echo $this->get_wrapper_attributes(); ?>>
	<div class="mw-timeline" data-feed-type="<?php echo esc_attr( $feed_type ); ?>">
		
		<?php if ( $enable_search ) : ?>
			<div class="mw-timeline__search">
				<input 
					type="search" 
					class="mw-timeline__search-input" 
					placeholder="<?php esc_attr_e( 'Search statuses...', 'musicalwheel' ); ?>"
					aria-label="<?php esc_attr_e( 'Search timeline statuses', 'musicalwheel' ); ?>"
				/>
			</div>
		<?php endif; ?>

		<?php if ( $show_composer && is_user_logged_in() ) : ?>
			<div class="mw-timeline__composer">
				<div class="mw-timeline-composer">
					<div class="mw-timeline-composer__avatar">
						<?php echo get_avatar( get_current_user_id(), 48 ); ?>
					</div>
					<div class="mw-timeline-composer__form">
						<textarea 
							class="mw-timeline-composer__input" 
							placeholder="<?php esc_attr_e( "What's on your mind?", 'musicalwheel' ); ?>"
							rows="3"
						></textarea>
						<div class="mw-timeline-composer__actions">
							<button class="mw-timeline-composer__btn mw-timeline-composer__btn--emoji" type="button">
								😊 <?php esc_html_e( 'Emoji', 'musicalwheel' ); ?>
							</button>
							<button class="mw-timeline-composer__btn mw-timeline-composer__btn--image" type="button">
								📷 <?php esc_html_e( 'Image', 'musicalwheel' ); ?>
							</button>
							<button class="mw-timeline-composer__btn mw-timeline-composer__btn--submit" type="submit">
								<?php esc_html_e( 'Post', 'musicalwheel' ); ?>
							</button>
						</div>
					</div>
				</div>
			</div>
		<?php endif; ?>

		<div class="mw-timeline__feed" data-page="1">
			<?php if ( ! is_wp_error( $statuses ) && ! empty( $statuses['timelineStatuses'] ) ) : ?>
				<?php foreach ( $statuses['timelineStatuses'] as $status ) : ?>
					<article class="mw-timeline-status" data-status-id="<?php echo esc_attr( $status['id'] ); ?>">
						<div class="mw-timeline-status__avatar">
							<?php if ( ! empty( $status['author']['avatar']['url'] ) ) : ?>
								<img src="<?php echo esc_url( $status['author']['avatar']['url'] ); ?>" alt="" />
							<?php else : ?>
								<?php echo get_avatar( $status['author']['id'], 48 ); ?>
							<?php endif; ?>
						</div>
						
						<div class="mw-timeline-status__content">
							<div class="mw-timeline-status__header">
								<span class="mw-timeline-status__author">
									<?php echo esc_html( $status['author']['name'] ); ?>
								</span>
								<span class="mw-timeline-status__time">
									<?php echo esc_html( human_time_diff( strtotime( $status['createdAt'] ) ) ); ?> ago
								</span>
							</div>

							<div class="mw-timeline-status__text">
								<?php echo wp_kses_post( nl2br( $status['content'] ) ); ?>
							</div>

							<div class="mw-timeline-status__actions">
								<button 
									class="mw-timeline-status__action mw-timeline-status__action--like <?php echo $status['liked'] ? 'is-liked' : ''; ?>" 
									data-action="like"
								>
									<span class="mw-timeline-status__action-icon">❤️</span>
									<span class="mw-timeline-status__action-count"><?php echo esc_html( $status['likeCount'] ); ?></span>
								</button>

								<button 
									class="mw-timeline-status__action mw-timeline-status__action--reply" 
									data-action="reply"
								>
									<span class="mw-timeline-status__action-icon">💬</span>
									<span class="mw-timeline-status__action-count"><?php echo esc_html( $status['replyCount'] ); ?></span>
								</button>
							</div>

							<div class="mw-timeline-status__replies" data-status-id="<?php echo esc_attr( $status['id'] ); ?>">
								<!-- Replies loaded dynamically -->
							</div>
						</div>
					</article>
				<?php endforeach; ?>
			<?php else : ?>
				<div class="mw-timeline__empty">
					<p><?php esc_html_e( 'No timeline statuses found.', 'musicalwheel' ); ?></p>
				</div>
			<?php endif; ?>
		</div>

		<div class="mw-timeline__loading" style="display: none;">
			<div class="mw-timeline__spinner"></div>
		</div>

		<div class="mw-timeline__pagination">
			<button class="mw-timeline__load-more" data-action="load-more">
				<?php esc_html_e( 'Load More', 'musicalwheel' ); ?>
			</button>
		</div>
	</div>
</div>
