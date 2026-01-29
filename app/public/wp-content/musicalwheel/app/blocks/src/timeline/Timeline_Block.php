<?php
/**
 * Timeline Block
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace MusicalWheel\Blocks\Src;

use MusicalWheel\Blocks\Base_Block;
use MusicalWheel\Blocks\Utils\GraphQL_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Timeline_Block extends Base_Block {

	/**
	 * Constructor
	 */
	public function __construct() {
		error_log( 'Timeline_Block::__construct() called' );
		parent::__construct();
		
		// Enqueue editor assets
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_assets' ] );
		
		error_log( 'Timeline_Block::__construct() completed' );
	}
	
	/**
	 * Enqueue editor assets
	 */
	public function enqueue_editor_assets() {
		error_log( 'Timeline enqueue_editor_assets() called' );
		$asset_file = get_template_directory() . '/assets/dist/js/blocks/timeline/index-DED6DiUU.js';
		error_log( 'Asset file path: ' . $asset_file );
		error_log( 'Asset file exists: ' . ( file_exists( $asset_file ) ? 'YES' : 'NO' ) );
		
		if ( file_exists( $asset_file ) ) {
			wp_enqueue_script(
				'mw-timeline-editor',
				get_template_directory_uri() . '/assets/dist/js/blocks/timeline/index-DED6DiUU.js',
				[ 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n' ],
				'1.0.0',
				true
			);
			error_log( 'Timeline editor script enqueued' );
		} else {
			error_log( 'ERROR: Asset file not found!' );
		}
	}

	/**
	 * Get block name
	 *
	 * @return string
	 */
	protected function get_block_name() {
		return 'timeline';
	}

	/**
	 * Render the timeline block
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param object $block Block object.
	 * @return string
	 */
	protected function render( $attributes, $content, $block ) {
		$feed_type      = $this->get_attribute( 'feedType', 'user_feed' );
		$order_by       = $this->get_attribute( 'orderBy', 'latest' );
		$posts_per_page = $this->get_attribute( 'postsPerPage', 10 );
		$show_composer  = $this->get_attribute( 'showComposer', true );
		$enable_search  = $this->get_attribute( 'enableSearch', false );

		// Check if user is logged in for user_feed
		if ( 'user_feed' === $feed_type && ! is_user_logged_in() ) {
			return $this->render_login_required();
		}

		// Fetch timeline data via GraphQL
		$statuses = $this->fetch_timeline_statuses( $feed_type, $order_by, $posts_per_page );

		// Enqueue frontend script
		wp_enqueue_script(
			'mw-timeline-frontend',
			get_template_directory_uri() . '/assets/dist/timeline-frontend.js',
			[ 'wp-element', 'wp-api-fetch' ],
			'1.0.0',
			true
		);

		// Localize script with data
		wp_localize_script( 'mw-timeline-frontend', 'mwTimelineData', [
			'feedType'      => $feed_type,
			'orderBy'       => $order_by,
			'showComposer'  => $show_composer,
			'enableSearch'  => $enable_search,
			'ajaxUrl'       => admin_url( 'admin-ajax.php' ),
			'nonce'         => wp_create_nonce( 'mw_timeline' ),
			'currentUserId' => get_current_user_id(),
		] );

		ob_start();
		include get_template_directory() . '/src/blocks/timeline/render.php';
		return ob_get_clean();
	}

	/**
	 * Fetch timeline statuses
	 *
	 * @param string $feed_type Feed type.
	 * @param string $order_by Order by.
	 * @param int    $limit Number of statuses.
	 * @return array|WP_Error
	 */
	private function fetch_timeline_statuses( $feed_type, $order_by, $limit ) {
		$query = '
			query GetTimelineStatuses($feed: TimelineFeedType!, $orderBy: TimelineOrderBy!, $first: Int!) {
				timelineStatuses(feed: $feed, orderBy: $orderBy, first: $first) {
					id
					content
					author {
						id
						name
						avatar {
							url
						}
					}
					likeCount
					replyCount
					liked
					createdAt
				}
			}
		';

		return GraphQL_Helper::query_cached(
			'timeline_' . $feed_type . '_' . $order_by,
			$query,
			[
				'feed'    => strtoupper( $feed_type ),
				'orderBy' => strtoupper( $order_by ),
				'first'   => $limit,
			],
			5 * MINUTE_IN_SECONDS
		);
	}

	/**
	 * Render login required message
	 *
	 * @return string
	 */
	private function render_login_required() {
		return sprintf(
			'<div %s><p>%s</p></div>',
			$this->get_wrapper_attributes( [ 'mw-timeline--login-required' ] ),
			esc_html__( 'Please log in to view your timeline feed.', 'musicalwheel' )
		);
	}
}
