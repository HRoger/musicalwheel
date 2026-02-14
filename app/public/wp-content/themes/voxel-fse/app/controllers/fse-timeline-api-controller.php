<?php
/**
 * FSE Timeline API Controller
 *
 * REST API endpoints for the Timeline block.
 * Proxies requests to Voxel's internal timeline handlers.
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Timeline_API_Controller extends FSE_Base_Controller {

	/**
	 * REST API namespace
	 */
	const REST_NAMESPACE = 'voxel-fse/v1';

	/**
	 * Register hooks
	 */
	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	/**
	 * Always authorize REST route registration
	 */
	protected function authorize(): bool {
		return true;
	}

	/**
	 * Check if Voxel is available
	 */
	protected function is_voxel_available() {
		return function_exists( '\Voxel\get' );
	}

	/**
	 * Register REST API routes
	 */
	protected function register_routes() {
		// Timeline configuration
		register_rest_route( self::REST_NAMESPACE, '/timeline/config', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_config' ],
			'permission_callback' => '__return_true',
		] );

		// Post context - visibility checks, composer config, review config
		// This is CRITICAL for 1:1 Voxel parity
		register_rest_route( self::REST_NAMESPACE, '/timeline/post-context', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_context' ],
			'permission_callback' => '__return_true',
		] );

		// Status feed
		register_rest_route( self::REST_NAMESPACE, '/timeline/feed', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_feed' ],
			'permission_callback' => '__return_true',
		] );

		// Publish status
		register_rest_route( self::REST_NAMESPACE, '/timeline/status', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'publish_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Edit status
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'edit_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Delete status
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)', [
			'methods'             => 'DELETE',
			'callback'            => [ $this, 'delete_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Like status
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/like', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'like_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Repost status
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/repost', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'repost_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Quote status
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/quote', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'quote_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Remove link preview
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/remove-link-preview', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'remove_link_preview' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Approve status (moderation)
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/approve', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'approve_status' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Mark status pending (moderation)
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/pending', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'mark_status_pending' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Comments feed
		register_rest_route( self::REST_NAMESPACE, '/timeline/comments', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_comments' ],
			'permission_callback' => '__return_true',
		] );

		// Publish comment
		register_rest_route( self::REST_NAMESPACE, '/timeline/status/(?P<status_id>\d+)/comment', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'publish_comment' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Edit comment
		register_rest_route( self::REST_NAMESPACE, '/timeline/comment/(?P<comment_id>\d+)', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'edit_comment' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Delete comment
		register_rest_route( self::REST_NAMESPACE, '/timeline/comment/(?P<comment_id>\d+)', [
			'methods'             => 'DELETE',
			'callback'            => [ $this, 'delete_comment' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Like comment
		register_rest_route( self::REST_NAMESPACE, '/timeline/comment/(?P<comment_id>\d+)/like', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'like_comment' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Approve comment (moderation)
		register_rest_route( self::REST_NAMESPACE, '/timeline/comment/(?P<comment_id>\d+)/approve', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'approve_comment' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Mark comment pending (moderation)
		register_rest_route( self::REST_NAMESPACE, '/timeline/comment/(?P<comment_id>\d+)/pending', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'mark_comment_pending' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// Mentions search
		register_rest_route( self::REST_NAMESPACE, '/timeline/mentions', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'search_mentions' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );

		// File upload
		register_rest_route( self::REST_NAMESPACE, '/timeline/upload', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'upload_file' ],
			'permission_callback' => [ $this, 'check_logged_in' ],
		] );
	}

	/**
	 * Permission callback: Check if user is logged in
	 */
	public function check_logged_in() {
		return is_user_logged_in();
	}

	/**
	 * Get post context for timeline
	 *
	 * CRITICAL FOR 1:1 VOXEL PARITY
	 * This method replicates the visibility logic from Voxel's timeline.php render() method.
	 * Evidence: themes/voxel/app/widgets/timeline.php lines 316-384, 555-626
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public function get_post_context( $request ) {
		if ( ! $this->is_voxel_available() ) {
			return $this->get_fallback_post_context( $request );
		}

		$mode    = $request->get_param( 'mode' ) ?? 'user_feed';
		$post_id = $request->get_param( 'post_id' );

		$current_user   = \Voxel\get_current_user();
		$current_post   = null;
		$current_author = null;

		// Get current post if post_id provided
		if ( $post_id ) {
			$current_post = \Voxel\Post::get( (int) $post_id );
		}

		// Get author from post
		if ( $current_post ) {
			$current_author = $current_post->get_author();
		}

		// =====================================================
		// VISIBILITY CHECKS - Matches Voxel timeline.php:316-384
		// =====================================================
		$visibility_result = $this->check_visibility( $mode, $current_user, $current_post, $current_author );

		if ( ! $visibility_result['allowed'] ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data'    => [
					'visible'     => false,
					'reason'      => $visibility_result['reason'],
					'composer'    => null,
					'reviews'     => null,
					'current_post' => null,
					'current_author' => null,
				],
			] );
		}

		// =====================================================
		// COMPOSER CONFIG - Matches Voxel timeline.php:555-626
		// =====================================================
		$composer = $this->get_composer_config( $mode, $current_user, $current_post );

		// =====================================================
		// REVIEW CONFIG - Matches Voxel timeline.php:555-566
		// =====================================================
		$reviews = [];
		if ( $mode === 'post_reviews' && $current_post && $current_post->post_type && $current_post->post_type->reviews ) {
			ob_start();
			$review_config = $current_post->post_type->reviews->get_timeline_config();
			ob_end_clean();
			$reviews[ $current_post->post_type->get_key() ] = $review_config;
		}

		// Build current_post data
		$current_post_data = null;
		if ( $current_post ) {
			$current_post_data = [
				'exists'       => true,
				'id'           => $current_post->get_id(),
				'display_name' => $current_post->get_display_name(),
				'avatar_url'   => $current_post->get_avatar_url(),
				'link'         => $current_post->get_link(),
				'author_id'    => $current_post->get_author_id(),
				'post_type'    => $current_post->post_type ? $current_post->post_type->get_key() : null,
			];
		}

		// Build current_author data
		$current_author_data = null;
		if ( $current_author ) {
			$current_author_data = [
				'exists'       => true,
				'id'           => $current_author->get_id(),
				'display_name' => $current_author->get_display_name(),
				'avatar_url'   => $current_author->get_avatar_url(),
				'link'         => $current_author->get_link(),
			];
		}

		// Build filtering options - matches Voxel timeline.php:529-535
		$filtering_options = [
			'all' => _x( 'All', 'timeline filters', 'voxel' ),
		];
		if ( $current_user ) {
			$filtering_options['liked'] = _x( 'Liked', 'timeline filters', 'voxel' );
		}
		if ( $current_user && $current_user->can_moderate_timeline_feed( (string) $mode, [ 'post' => $current_post ] ) ) {
			$filtering_options['pending'] = _x( 'Pending', 'timeline filters', 'voxel' );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'visible'           => true,
				'reason'            => null,
				'composer'          => $composer,
				'reviews'           => $reviews,
				'current_post'      => $current_post_data,
				'current_author'    => $current_author_data,
				'filtering_options' => $filtering_options,
				'show_usernames'    => \Voxel\get( 'settings.timeline.author.show_username', true ),
			],
		] );
	}

	/**
	 * Check visibility for timeline based on mode
	 *
	 * CRITICAL: Replicates Voxel timeline.php:316-384 EXACTLY
	 *
	 * @param string $mode
	 * @param \Voxel\User|null $current_user
	 * @param \Voxel\Post|null $current_post
	 * @param \Voxel\User|null $current_author
	 * @return array ['allowed' => bool, 'reason' => string|null]
	 */
	protected function check_visibility( $mode, $current_user, $current_post, $current_author ) {
		// Post-related modes: post_reviews, post_wall, post_timeline
		// Evidence: timeline.php:316-331
		if ( in_array( $mode, [ 'post_reviews', 'post_wall', 'post_timeline' ], true ) ) {
			if ( ! ( $current_post && $current_post->post_type ) ) {
				return [ 'allowed' => false, 'reason' => 'no_post_context' ];
			}

			$visibility_key = ( $mode === 'post_wall' ? 'wall_visibility' : ( $mode === 'post_reviews' ? 'review_visibility' : 'visibility' ) );
			$visibility     = $current_post->post_type->get_setting( 'timeline.' . $visibility_key );

			if ( $visibility === 'logged_in' && ! is_user_logged_in() ) {
				return [ 'allowed' => false, 'reason' => 'login_required' ];
			}

			if ( $visibility === 'followers_only' ) {
				if ( ! is_user_logged_in() ) {
					return [ 'allowed' => false, 'reason' => 'followers_only' ];
				}
				if ( ! ( \Voxel\current_user()->follows_post( $current_post->get_id() ) || $current_post->get_author_id() === get_current_user_id() ) ) {
					return [ 'allowed' => false, 'reason' => 'followers_only' ];
				}
			}

			if ( $visibility === 'customers_only' ) {
				if ( ! is_user_logged_in() ) {
					return [ 'allowed' => false, 'reason' => 'customers_only' ];
				}
				if ( ! ( \Voxel\current_user()->has_bought_product( $current_post->get_id() ) || $current_post->get_author_id() === get_current_user_id() ) ) {
					return [ 'allowed' => false, 'reason' => 'customers_only' ];
				}
			}

			if ( $visibility === 'private' && ! $current_post->is_editable_by_current_user() ) {
				return [ 'allowed' => false, 'reason' => 'private' ];
			}
		}

		// Author timeline mode
		// Evidence: timeline.php:332-373
		if ( $mode === 'author_timeline' ) {
			if ( ! $current_author ) {
				return [ 'allowed' => false, 'reason' => 'no_author_context' ];
			}

			$visibility = \Voxel\get( 'settings.timeline.user_timeline.visibility', 'public' );

			if ( $visibility === 'logged_in' && ! is_user_logged_in() ) {
				return [ 'allowed' => false, 'reason' => 'login_required' ];
			}

			if ( $visibility === 'followers_only' ) {
				if ( ! is_user_logged_in() ) {
					return [ 'allowed' => false, 'reason' => 'followers_only' ];
				}
				if ( ! ( $current_user->get_id() === $current_author->get_id() || $current_user->follows_user( $current_author->get_id() ) ) ) {
					return [ 'allowed' => false, 'reason' => 'followers_only' ];
				}
			}

			if ( $visibility === 'customers_only' ) {
				if ( ! is_user_logged_in() ) {
					return [ 'allowed' => false, 'reason' => 'customers_only' ];
				}

				$is_allowed = $current_user->get_id() === $current_author->get_id()
					|| (
						$current_author->has_cap( 'administrator' )
						&& apply_filters( 'voxel/stripe_connect/enable_onboarding_for_admins', false ) !== true
						&& $current_user->has_bought_product_from_platform()
					) || (
						$current_user->has_bought_product_from_vendor( $current_author->get_id() )
					);

				if ( ! $is_allowed ) {
					return [ 'allowed' => false, 'reason' => 'customers_only' ];
				}
			}

			if ( $visibility === 'private' ) {
				if ( ! ( is_user_logged_in() && $current_user->get_id() === $current_author->get_id() ) ) {
					return [ 'allowed' => false, 'reason' => 'private' ];
				}
			}
		}

		// User feed mode
		// Evidence: timeline.php:374-377
		if ( $mode === 'user_feed' && ! is_user_logged_in() ) {
			return [ 'allowed' => false, 'reason' => 'login_required' ];
		}

		// Global feed - always allowed
		// Evidence: timeline.php:378-379

		return [ 'allowed' => true, 'reason' => null ];
	}

	/**
	 * Get composer configuration based on mode
	 *
	 * CRITICAL: Replicates Voxel timeline.php:555-626 EXACTLY
	 *
	 * @param string $mode
	 * @param \Voxel\User|null $current_user
	 * @param \Voxel\Post|null $current_post
	 * @return array|null
	 */
	protected function get_composer_config( $mode, $current_user, $current_post ) {
		$composer = [
			'feed'     => 'user_timeline', // default
			'can_post' => false,
		];

		if ( $mode === 'post_reviews' ) {
			$composer['feed'] = 'post_reviews';

			if ( $current_user && $current_post && $current_user->can_review_post( $current_post->get_id() ) ) {
				$composer['can_post']          = true;
				$composer['post_as']           = 'current_user';
				$composer['placeholder']       = sprintf( _x( 'Write a review for %s', 'timeline', 'voxel' ), $current_post->get_display_name() );
				$composer['reviews_post_type'] = $current_post->post_type->get_key();
			}
		} elseif ( $mode === 'post_wall' ) {
			$composer['feed'] = 'post_wall';

			if ( $current_user && $current_post && $current_user->can_post_to_wall( $current_post->get_id() ) ) {
				$composer['can_post']    = true;
				$composer['post_as']     = 'current_user';
				$composer['placeholder'] = sprintf( _x( 'What\'s on your mind, %s?', 'timeline', 'voxel' ), $current_user->get_display_name() );
			}
		} elseif ( $mode === 'post_timeline' ) {
			$composer['feed'] = 'post_timeline';

			if ( $current_user && $current_post && $current_post->is_editable_by_user( $current_user ) ) {
				$composer['can_post']    = true;
				$composer['post_as']     = 'current_post';
				$composer['placeholder'] = _x( 'What\'s on your mind?', 'timeline', 'voxel' );
			}
		} elseif ( $mode === 'author_timeline' ) {
			$composer['feed'] = 'user_timeline';

			if ( $current_user && $current_post && $current_post->get_author_id() === $current_user->get_id() ) {
				$composer['can_post']    = true;
				$composer['post_as']     = 'current_user';
				$composer['placeholder'] = sprintf( _x( 'What\'s on your mind, %s?', 'timeline', 'voxel' ), $current_user->get_display_name() );
			}
		} elseif ( $mode === 'user_feed' || $mode === 'global_feed' ) {
			$composer['feed'] = 'user_timeline';

			if ( $current_user ) {
				$composer['can_post']    = true;
				$composer['post_as']     = 'current_user';
				$composer['placeholder'] = sprintf( _x( 'What\'s on your mind, %s?', 'timeline', 'voxel' ), $current_user->get_display_name() );
			}
		}

		return $composer;
	}

	/**
	 * Fallback post context when Voxel is unavailable
	 */
	protected function get_fallback_post_context( $request ) {
		$mode    = $request->get_param( 'mode' ) ?? 'user_feed';
		$post_id = $request->get_param( 'post_id' );

		// For non-user modes, require login
		if ( $mode === 'user_feed' && ! is_user_logged_in() ) {
			return new \WP_REST_Response( [
				'success' => true,
				'data'    => [
					'visible'  => false,
					'reason'   => 'login_required',
					'composer' => null,
					'reviews'  => null,
				],
			] );
		}

		$composer = [
			'feed'     => 'user_timeline',
			'can_post' => is_user_logged_in(),
		];

		if ( is_user_logged_in() ) {
			$wp_user                  = wp_get_current_user();
			$composer['post_as']      = 'current_user';
			$composer['placeholder']  = sprintf( "What's on your mind, %s?", $wp_user->display_name );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'visible'           => true,
				'reason'            => null,
				'composer'          => $composer,
				'reviews'           => [],
				'filtering_options' => [
					'all' => 'All',
				],
				'show_usernames'    => true,
			],
		] );
	}

	/**
	 * Get timeline configuration
	 */
	public function get_config( $request ) {
		// Check if Voxel is available
		if ( ! $this->is_voxel_available() ) {
			return $this->get_fallback_config();
		}

		$current_user = function_exists( '\Voxel\get_current_user' ) ? \Voxel\get_current_user() : null;

		$config = [
			'ajax_url'         => admin_url( 'admin-ajax.php' ),
			'rest_url'         => rest_url( self::REST_NAMESPACE . '/timeline/' ),
			'nonces'           => [
				'status_publish'  => wp_create_nonce( 'vx_timeline' ),
				'status_edit'     => wp_create_nonce( 'vx_timeline' ),
				'status_delete'   => wp_create_nonce( 'vx_timeline' ),
				'status_like'     => wp_create_nonce( 'vx_timeline' ),
				'status_repost'   => wp_create_nonce( 'vx_timeline' ),
				'comment_publish' => wp_create_nonce( 'vx_timeline' ),
				'comment_edit'    => wp_create_nonce( 'vx_timeline' ),
				'comment_delete'  => wp_create_nonce( 'vx_timeline' ),
				'comment_like'    => wp_create_nonce( 'vx_timeline' ),
				'mentions_search' => wp_create_nonce( 'vx_timeline' ),
				'file_upload'     => wp_create_nonce( 'vx_timeline' ),
			],
			'current_user'     => null,
			'permissions'      => [
				'can_post'     => false,
				'can_upload'   => false,
				'can_moderate' => false,
				'is_logged_in' => is_user_logged_in(),
			],
			'character_limits' => [
				'status_min'  => 0,
				'status_max'  => absint( \Voxel\get( 'settings.timeline.posts.maxlength', 5000 ) ),
				'comment_min' => 0,
				'comment_max' => absint( \Voxel\get( 'settings.timeline.replies.maxlength', 2000 ) ),
			],
			'upload_config'    => [
				'max_file_size'       => absint( \Voxel\get( 'settings.timeline.posts.images.max_size', 2000 ) ) * 1024, // Convert KB to bytes
				'max_files'           => absint( \Voxel\get( 'settings.timeline.posts.images.max_count', 5 ) ),
				'allowed_types'       => (array) \Voxel\get( 'settings.timeline.posts.images.allowed_formats', [
					'image/jpeg',
					'image/gif',
					'image/png',
					'image/webp',
				] ),
				'allowed_extensions'  => [ 'jpg', 'jpeg', 'png', 'gif', 'webp' ],
			],
			// Reply-specific upload config - Evidence: timeline.php L447-459
			// Voxel has separate settings for replies (different max_count, enabled, formats)
			'reply_upload_config' => [
				'max_file_size'       => absint( \Voxel\get( 'settings.timeline.posts.images.max_size', 2000 ) ) * 1024,
				'max_files'           => absint( \Voxel\get( 'settings.timeline.replies.images.max_count', 1 ) ),
				'enabled'             => (bool) \Voxel\get( 'settings.timeline.replies.images.enabled', true ),
				'allowed_types'       => (array) \Voxel\get( 'settings.timeline.replies.images.allowed_formats', [
					'image/jpeg',
					'image/gif',
					'image/png',
					'image/webp',
				] ),
			],
			'features'         => [
				'mentions'         => true,
				'hashtags'         => true,
				'emojis'           => true,
				'file_upload'      => (bool) \Voxel\get( 'settings.timeline.posts.images.enabled', true ),
				'link_preview'     => true,
				'reviews'          => true,
				'reposts'          => (bool) \Voxel\get( 'settings.timeline.reposts.enabled', true ),
				'quotes'           => (bool) \Voxel\get( 'settings.timeline.reposts.enabled', true ),
				'nested_comments'  => true,
				'comment_depth'    => absint( \Voxel\get( 'settings.timeline.replies.max_nest_level', 2 ) ),
				'posts_editable'   => (bool) \Voxel\get( 'settings.timeline.posts.editable', true ),
				'replies_editable' => (bool) \Voxel\get( 'settings.timeline.replies.editable', true ),
			],
			// Truncation settings - Evidence: timeline.php L437, L450
			'truncate_at'       => [
				'posts'   => (int) \Voxel\get( 'settings.timeline.posts.truncate_at', 280 ),
				'replies' => (int) \Voxel\get( 'settings.timeline.replies.truncate_at', 280 ),
			],
			// Quotes config - Evidence: timeline.php L464-467
			'quotes'            => [
				'truncate_at' => (int) \Voxel\get( 'settings.timeline.posts.quotes.truncate_at', 160 ),
				'placeholder' => _x( 'What\'s on your mind?', 'timeline', 'voxel' ),
			],
			// Asset URLs - Evidence: timeline.php L468-479
			'asset_urls'        => [
				'emojis'                => trailingslashit( get_template_directory_uri() ) . 'assets/vendor/emoji-list/emoji-list.json?v=' . \Voxel\get_assets_version(),
				'link_preview_default'  => \Voxel\get_image( 'link-preview.webp' ),
				'mentions'              => home_url( '/?vx=1&action=user.profile' ),
				'hashtags'              => get_permalink( \Voxel\get( 'templates.timeline' ) ),
			],
			// Search config - Evidence: timeline.php L480-484
			'search'            => [
				'maxlength'     => (int) apply_filters( 'voxel/keyword-search/max-query-length', 128 ),
			],
			'statuses_per_page' => absint( \Voxel\get( 'settings.timeline.posts.per_page', 10 ) ),
			'comments_per_page' => absint( \Voxel\get( 'settings.timeline.replies.per_page', 5 ) ),
			'show_usernames'    => (bool) \Voxel\get( 'settings.timeline.author.show_username', true ),
			'strings'           => $this->get_i18n_strings(),
			'icons'             => $this->get_icons(),
		];

		if ( $current_user ) {
			$config['current_user'] = [
				'id'           => $current_user->get_id(),
				'display_name' => $current_user->get_display_name(),
				'avatar_url'   => $current_user->get_avatar_url(),
				'profile_url'  => $current_user->get_link(),
				'is_verified'  => $current_user->is_verified(),
			];

			$config['permissions']['can_post']     = true;
			$config['permissions']['can_upload']   = (bool) \Voxel\get( 'settings.timeline.posts.images.enabled', true );
			$config['permissions']['can_moderate'] = $current_user->has_cap( 'administrator' );
		}

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $config,
		] );
	}

	/**
	 * Get icon SVGs for timeline UI
	 */
	protected function get_icons(): array {
		return [
			'verified' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/></svg>',

			'repost' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 7H17V10L21 6L17 2V5H5V11H7V7ZM17 17H7V14L3 18L7 22V19H19V13H17V17Z" fill="currentColor"/></svg>',

			'more' => '<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)"><path d="M3.75781 12.0002C3.75781 13.2419 4.76439 14.2485 6.00607 14.2485C7.24774 14.2485 8.25432 13.2419 8.25432 12.0002C8.25432 10.7585 7.24774 9.75195 6.00607 9.75195C4.76439 9.75195 3.75781 10.7585 3.75781 12.0002Z" fill="#343C54"></path><path d="M9.75439 12.0002C9.75439 13.2419 10.761 14.2485 12.0026 14.2485C13.2443 14.2485 14.2509 13.2419 14.2509 12.0002C14.2509 10.7585 13.2443 9.75195 12.0026 9.75195C10.761 9.75195 9.75439 10.7585 9.75439 12.0002Z" fill="#343C54"></path><path d="M15.751 12.0002C15.751 13.2419 16.7576 14.2485 17.9992 14.2485C19.2409 14.2485 20.2475 13.2419 20.2475 12.0002C20.2475 10.7585 19.2409 9.75195 17.9992 9.75195C16.7576 9.75195 15.751 10.7585 15.751 12.0002Z" fill="#343C54"></path></svg>',

			'liked' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/></svg>',

			'like' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 3C14.76 3 13.09 3.81 12 5.09C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.42 2 8.5C2 12.28 5.4 15.36 10.55 20.04L12 21.35L13.45 20.04C18.6 15.36 22 12.28 22 8.5C22 5.42 19.58 3 16.5 3ZM12.1 18.55L12 18.65L11.9 18.55C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.54 5.99 11.07 7.36H12.94C13.46 5.99 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.39 16.86 14.24 12.1 18.55Z" fill="currentColor"/></svg>',

			'comment' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/></svg>',

			'reply' => '<svg width="80" height="80" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)"><path d="M21.375 8.62636C21.3753 8.81862 21.3021 9.01096 21.1555 9.15769L17.1555 13.1605C16.8627 13.4535 16.3878 13.4536 16.0949 13.1609C15.8019 12.8681 15.8017 12.3932 16.0945 12.1002L18.8177 9.37503H8.75C6.19568 9.37503 4.125 11.4457 4.125 14C4.125 16.5543 6.19568 18.625 8.75 18.625H16.6571C17.0713 18.625 17.4071 18.9608 17.4071 19.375C17.4071 19.7892 17.0713 20.125 16.6571 20.125H8.75C5.36726 20.125 2.625 17.3828 2.625 14C2.625 10.6173 5.36726 7.87503 8.75 7.87503H18.8126L16.0945 5.15516C15.8017 4.86217 15.8019 4.3873 16.0948 4.0945C16.3878 3.8017 16.8627 3.80185 17.1555 4.09484L21.1176 8.05948C21.2753 8.19698 21.375 8.39936 21.375 8.62503L21.375 8.62636Z" fill="#343C54"/></svg>',

			'gallery' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/></svg>',

			'upload' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 16H15V10H19L12 3L5 10H9V16ZM5 18H19V20H5V18Z" fill="currentColor"/></svg>',

			'emoji' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM15.5 11C16.33 11 17 10.33 17 9.5C17 8.67 16.33 8 15.5 8C14.67 8 14 8.67 14 9.5C14 10.33 14.67 11 15.5 11ZM8.5 11C9.33 11 10 10.33 10 9.5C10 8.67 9.33 8 8.5 8C7.67 8 7 8.67 7 9.5C7 10.33 7.67 11 8.5 11ZM12 17.5C14.33 17.5 16.31 16.04 17.11 14H6.89C7.69 16.04 9.67 17.5 12 17.5Z" fill="currentColor"/></svg>',

			'search' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/></svg>',

			'trash' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/></svg>',

			'external-link' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 19H5V5H12V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V12H19V19ZM14 3V5H17.59L7.76 14.83L9.17 16.24L19 6.41V10H21V3H14Z" fill="currentColor"/></svg>',

			'loading' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" opacity="0.3"/><path d="M12 2C17.52 2 22 6.48 22 12H20C20 7.59 16.41 4 12 4V2Z" fill="currentColor"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>',

			'no-post' => '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V17H7V10ZM11 7H13V17H11V7ZM15 13H17V17H15V13Z" fill="currentColor"/></svg>',
		];
	}

	/**
	 * Get i18n strings for timeline UI
	 */
	protected function get_i18n_strings(): array {
		return [
			'compose_placeholder'      => _x( "What's on your mind?", 'timeline', 'voxel-fse' ),
			'compose_submit'           => _x( 'Post', 'timeline', 'voxel-fse' ),
			'compose_submitting'       => _x( 'Posting...', 'timeline', 'voxel-fse' ),
			'like'                     => _x( 'Like', 'timeline', 'voxel-fse' ),
			'unlike'                   => _x( 'Unlike', 'timeline', 'voxel-fse' ),
			'comment'                  => _x( 'Comment', 'timeline', 'voxel-fse' ),
			'comments'                 => _x( 'Comments', 'timeline', 'voxel-fse' ),
			'reply'                    => _x( 'Reply', 'timeline', 'voxel-fse' ),
			'replies'                  => _x( 'Replies', 'timeline', 'voxel-fse' ),
			'repost'                   => _x( 'Repost', 'timeline', 'voxel-fse' ),
			'unrepost'                 => _x( 'Unrepost', 'timeline', 'voxel-fse' ),
			'quote'                    => _x( 'Quote', 'timeline', 'voxel-fse' ),
			'edit'                     => _x( 'Edit', 'timeline', 'voxel-fse' ),
			'delete'                   => _x( 'Delete', 'timeline', 'voxel-fse' ),
			'share'                    => _x( 'Share', 'timeline', 'voxel-fse' ),
			'loading'                  => _x( 'Loading...', 'timeline', 'voxel-fse' ),
			'load_more'                => _x( 'Load more', 'timeline', 'voxel-fse' ),
			'no_posts'                 => _x( 'No posts available', 'timeline', 'voxel-fse' ),
			'no_comments'              => _x( 'No comments yet', 'timeline', 'voxel-fse' ),
			'error_generic'            => _x( 'Something went wrong', 'timeline', 'voxel-fse' ),
			'error_network'            => _x( 'Network error. Please try again.', 'timeline', 'voxel-fse' ),
			'just_now'                 => _x( 'Just now', 'timeline', 'voxel-fse' ),
			'minutes_ago'              => _x( '%d minutes ago', 'timeline', 'voxel-fse' ),
			'hours_ago'                => _x( '%d hours ago', 'timeline', 'voxel-fse' ),
			'days_ago'                 => _x( '%d days ago', 'timeline', 'voxel-fse' ),
			'edited'                   => _x( 'Edited', 'timeline', 'voxel-fse' ),
			'pending_approval'         => _x( 'Pending approval', 'timeline', 'voxel-fse' ),
			'approve'                  => _x( 'Approve', 'timeline', 'voxel-fse' ),
			'mark_pending'             => _x( 'Mark as pending', 'timeline', 'voxel-fse' ),
			'delete_confirm'           => _x( 'Are you sure you want to delete this post?', 'timeline', 'voxel-fse' ),
			'delete_comment_confirm'   => _x( 'Are you sure you want to delete this comment?', 'timeline', 'voxel-fse' ),
			'content_too_short'        => _x( 'Content is too short', 'timeline', 'voxel-fse' ),
			'content_too_long'         => _x( 'Content is too long', 'timeline', 'voxel-fse' ),
			'file_too_large'           => _x( 'File is too large', 'timeline', 'voxel-fse' ),
			'file_type_not_allowed'    => _x( 'File type not allowed', 'timeline', 'voxel-fse' ),
			'search_placeholder'       => _x( 'Search posts...', 'timeline', 'voxel-fse' ),
			'search_no_results'        => _x( 'No results found', 'timeline', 'voxel-fse' ),
			// Voxel-exact l10n strings - Evidence: timeline.php L491-507
			'no_activity'              => _x( 'No activity yet', 'timeline', 'voxel-fse' ),
			'editedOn'                 => _x( 'Edited on @date', 'timeline', 'voxel' ),
			'oneLike'                  => _x( '1 like', 'timeline', 'voxel' ),
			'countLikes'               => _x( '@count likes', 'timeline', 'voxel' ),
			'oneReply'                 => _x( '1 reply', 'timeline', 'voxel' ),
			'countReplies'             => _x( '@count replies', 'timeline', 'voxel' ),
			'cancelEdit'               => _x( 'Your changes will be lost. Do you wish to proceed?', 'timeline', 'voxel' ),
			// Emoji group translations - Evidence: timeline.php L492-500
			'emoji_groups'             => [
				'Smileys & Emotion' => _x( 'Smileys & Emotion', 'emoji popup', 'voxel' ),
				'People & Body'     => _x( 'People & Body', 'emoji popup', 'voxel' ),
				'Animals & Nature'  => _x( 'Animals & Nature', 'emoji popup', 'voxel' ),
				'Food & Drink'      => _x( 'Food & Drink', 'emoji popup', 'voxel' ),
				'Travel & Places'   => _x( 'Travel & Places', 'emoji popup', 'voxel' ),
				'Activities'        => _x( 'Activities', 'emoji popup', 'voxel' ),
				'Objects'           => _x( 'Objects', 'emoji popup', 'voxel' ),
			],
			// Additional action strings
			'copied'                   => _x( 'Copied!', 'timeline', 'voxel-fse' ),
			'copy_link'                => _x( 'Copy link', 'timeline', 'voxel-fse' ),
			'share_via'                => _x( 'Share via', 'timeline', 'voxel-fse' ),
			'remove_link_preview'      => _x( 'Remove link preview', 'timeline', 'voxel-fse' ),
			'restricted_visibility'    => _x( 'Restricted visibility', 'timeline', 'voxel-fse' ),
			'yes'                      => _x( 'Yes', 'timeline', 'voxel-fse' ),
			'no'                       => _x( 'No', 'timeline', 'voxel-fse' ),
			'reposted'                 => _x( 'Reposted', 'timeline', 'voxel-fse' ),
			'cancel'                   => _x( 'Cancel', 'timeline', 'voxel-fse' ),
			'update'                   => _x( 'Update', 'timeline', 'voxel-fse' ),
			'is_deleting'              => _x( 'Deleting...', 'timeline', 'voxel-fse' ),
		];
	}

	/**
	 * Get fallback config when Voxel is not available
	 */
	protected function get_fallback_config() {
		$wp_user = wp_get_current_user();
		$is_logged_in = is_user_logged_in();

		// Get current post context (needed for post_timeline, post_wall, post_reviews modes)
		$current_post = null;
		if ( is_singular() && get_queried_object() instanceof \WP_Post ) {
			$post = get_queried_object();
			$current_post = [
				'id'           => $post->ID,
				'title'        => get_the_title( $post ),
				'link'         => get_permalink( $post ),
				'author_id'    => (int) $post->post_author,
				'post_type'    => $post->post_type,
			];
		}

		$config = [
			'ajax_url'         => admin_url( 'admin-ajax.php' ),
			'rest_url'         => rest_url( self::REST_NAMESPACE . '/timeline/' ),
			'nonces'           => [
				'status_publish'  => wp_create_nonce( 'vx_timeline' ),
				'status_edit'     => wp_create_nonce( 'vx_timeline' ),
				'status_delete'   => wp_create_nonce( 'vx_timeline' ),
				'status_like'     => wp_create_nonce( 'vx_timeline' ),
				'status_repost'   => wp_create_nonce( 'vx_timeline' ),
				'comment_publish' => wp_create_nonce( 'vx_timeline' ),
				'comment_edit'    => wp_create_nonce( 'vx_timeline' ),
				'comment_delete'  => wp_create_nonce( 'vx_timeline' ),
				'comment_like'    => wp_create_nonce( 'vx_timeline' ),
				'mentions_search' => wp_create_nonce( 'vx_timeline' ),
				'file_upload'     => wp_create_nonce( 'vx_timeline' ),
			],
			'current_user'     => $is_logged_in ? [
				'id'           => $wp_user->ID,
				'display_name' => $wp_user->display_name,
				'avatar_url'   => get_avatar_url( $wp_user->ID ),
				'profile_url'  => get_author_posts_url( $wp_user->ID ),
				'is_verified'  => false,
			] : null,
			'current_post'     => $current_post,
			'permissions'      => [
				'can_post'     => $is_logged_in,
				'can_upload'   => $is_logged_in,
				'can_moderate' => current_user_can( 'administrator' ),
				'is_logged_in' => $is_logged_in,
			],
			'character_limits' => [
				'status_min'  => 0,
				'status_max'  => 5000,
				'comment_min' => 0,
				'comment_max' => 2000,
			],
			'upload_config'    => [
				'max_file_size'       => 2048000, // 2MB
				'max_files'           => 5,
				'allowed_types'       => [ 'image/jpeg', 'image/png', 'image/gif', 'image/webp' ],
				'allowed_extensions'  => [ 'jpg', 'jpeg', 'png', 'gif', 'webp' ],
			],
			'reply_upload_config' => [
				'max_file_size'       => 2048000,
				'max_files'           => 1,
				'enabled'             => true,
				'allowed_types'       => [ 'image/jpeg', 'image/png', 'image/gif', 'image/webp' ],
			],
			'features'         => [
				'mentions'         => true,
				'hashtags'         => true,
				'emojis'           => true,
				'file_upload'      => true,
				'link_preview'     => true,
				'reviews'          => false,
				'reposts'          => true,
				'quotes'           => true,
				'nested_comments'  => true,
				'comment_depth'    => 2,
				'posts_editable'   => true,
				'replies_editable' => true,
			],
			'truncate_at'       => [
				'posts'   => 280,
				'replies' => 280,
			],
			'quotes'            => [
				'truncate_at' => 160,
				'placeholder' => "What's on your mind?",
			],
			'asset_urls'        => [
				'emojis'                => '',
				'link_preview_default'  => '',
				'mentions'              => home_url( '/?vx=1&action=user.profile' ),
				'hashtags'              => '',
			],
			'search'            => [
				'maxlength'     => 128,
			],
			'statuses_per_page' => 10,
			'comments_per_page' => 5,
			'show_usernames'    => true,
			'strings'           => $this->get_i18n_strings(),
			'icons'             => $this->get_icons(),
		];

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => $config,
		] );
	}

	/**
	 * Get status feed
	 *
	 * Note: voxelFetch unwraps { success, data } responses and returns data.
	 * So we nest { data, has_more, meta } inside 'data' to preserve those fields.
	 */
	public function get_feed( $request ) {
		// Set up $_REQUEST for Voxel's handler
		$_REQUEST['mode']             = $request->get_param( 'mode' ) ?? 'user_feed';
		$_REQUEST['page']             = $request->get_param( 'page' ) ?? 1;
		$_REQUEST['order_type']       = $request->get_param( 'order' ) ?? 'latest';
		$_REQUEST['order_time']       = $request->get_param( 'time' ) ?? 'all_time';
		$_REQUEST['order_time_custom']= $request->get_param( 'time_custom' );
		$_REQUEST['search']           = $request->get_param( 'search' );
		$_REQUEST['filter_by']        = $request->get_param( 'filter' );
		$_REQUEST['post_id']          = $request->get_param( 'post_id' );
		$_REQUEST['user_id']          = $request->get_param( 'author_id' );
		$_REQUEST['status_id']        = $request->get_param( 'status_id' );

		// Capture Voxel's output
		ob_start();
		do_action( 'voxel_ajax_timeline/v2/get_feed' );
		$output = ob_get_clean();

		// Handle empty output (Voxel action not registered or returned nothing)
		if ( empty( $output ) ) {
			// voxelFetch extracts 'data', so we nest the feed response inside 'data'
			return new \WP_REST_Response( [
				'success' => true,
				'data'    => [
					'data'     => [],
					'has_more' => false,
					'meta'     => [],
				],
			] );
		}

		$voxel_response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		// Voxel returns { success, data, has_more, meta }
		// voxelFetch extracts 'data' field, so we need:
		// { success: true, data: { data: [...], has_more, meta } }
		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'data'     => $voxel_response['data'] ?? [],
				'has_more' => $voxel_response['has_more'] ?? false,
				'meta'     => $voxel_response['meta'] ?? [],
			],
		] );
	}

	/**
	 * Publish status
	 */
	public function publish_status( $request ) {
		return $this->proxy_voxel_action( 'timeline/v2/status.publish', $request );
	}

	/**
	 * Edit status
	 */
	public function edit_status( $request ) {
		$data = $request->get_json_params();
		$data['status_id'] = (int) $request->get_param( 'status_id' );
		$request->set_body( wp_json_encode( $data ) );

		return $this->proxy_voxel_action( 'timeline/v2/status.edit', $request );
	}

	/**
	 * Delete status
	 */
	public function delete_status( $request ) {
		$_REQUEST['status_id'] = (int) $request->get_param( 'status_id' );
		$_REQUEST['_wpnonce']  = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.delete' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Like/unlike status
	 */
	public function like_status( $request ) {
		$_REQUEST['status_id'] = (int) $request->get_param( 'status_id' );
		$_REQUEST['_wpnonce']  = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.like' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Repost/unrepost status
	 */
	public function repost_status( $request ) {
		$_REQUEST['status_id'] = (int) $request->get_param( 'status_id' );
		$_REQUEST['_wpnonce']  = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.repost' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Quote status
	 */
	public function quote_status( $request ) {
		$data = $request->get_json_params();
		$data['status_id'] = (int) $request->get_param( 'status_id' );

		$_REQUEST['data']     = wp_json_encode( $data );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.quote' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Remove link preview from status
	 */
	public function remove_link_preview( $request ) {
		$_REQUEST['status_id'] = (int) $request->get_param( 'status_id' );
		$_REQUEST['_wpnonce']  = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.remove_link_preview' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Approve status (moderation)
	 */
	public function approve_status( $request ) {
		$_REQUEST['status_id'] = (int) $request->get_param( 'status_id' );
		$_REQUEST['_wpnonce']  = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.mark_approved' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Mark status pending (moderation)
	 */
	public function mark_status_pending( $request ) {
		$_REQUEST['status_id'] = (int) $request->get_param( 'status_id' );
		$_REQUEST['_wpnonce']  = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/status.mark_pending' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Get comments for a status
	 */
	public function get_comments( $request ) {
		$_REQUEST['status_id'] = $request->get_param( 'status_id' );
		$_REQUEST['mode']      = $request->get_param( 'mode' ) ?? 'default';
		$_REQUEST['parent_id'] = $request->get_param( 'parent_id' );
		$_REQUEST['reply_id']  = $request->get_param( 'reply_id' );
		$_REQUEST['page']      = $request->get_param( 'page' ) ?? 1;

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comments/get_feed' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Publish comment
	 */
	public function publish_comment( $request ) {
		$data = $request->get_json_params();
		$data['status_id'] = (int) $request->get_param( 'status_id' );

		$_REQUEST['data']     = wp_json_encode( $data );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comment.publish' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Edit comment
	 */
	public function edit_comment( $request ) {
		$data = $request->get_json_params();
		$data['reply_id'] = (int) $request->get_param( 'comment_id' );

		$_REQUEST['data']     = wp_json_encode( $data );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comment.edit' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Delete comment
	 */
	public function delete_comment( $request ) {
		$_REQUEST['reply_id'] = (int) $request->get_param( 'comment_id' );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comment.delete' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Like/unlike comment
	 */
	public function like_comment( $request ) {
		$_REQUEST['reply_id'] = (int) $request->get_param( 'comment_id' );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comment.like' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Approve comment (moderation)
	 */
	public function approve_comment( $request ) {
		$_REQUEST['reply_id'] = (int) $request->get_param( 'comment_id' );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comment.mark_approved' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Mark comment pending (moderation)
	 */
	public function mark_comment_pending( $request ) {
		$_REQUEST['reply_id'] = (int) $request->get_param( 'comment_id' );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/comment.mark_pending' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Search mentions
	 */
	public function search_mentions( $request ) {
		$_REQUEST['search']   = $request->get_param( 'query' );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );

		ob_start();
		do_action( 'voxel_ajax_timeline/v2/mentions.search' );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}

	/**
	 * Upload file
	 */
	public function upload_file( $request ) {
		$files = $request->get_file_params();

		if ( empty( $files['file'] ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'No file provided',
			], 400 );
		}

		// Use WordPress media upload
		require_once ABSPATH . 'wp-admin/includes/image.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';

		$attachment_id = media_handle_upload( 'file', 0 );

		if ( is_wp_error( $attachment_id ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => $attachment_id->get_error_message(),
			], 400 );
		}

		$attachment = get_post( $attachment_id );

		return new \WP_REST_Response( [
			'success' => true,
			'data'    => [
				'id'        => $attachment_id,
				'url'       => wp_get_attachment_url( $attachment_id ),
				'name'      => $attachment->post_title,
				'mime_type' => $attachment->post_mime_type,
				'size'      => filesize( get_attached_file( $attachment_id ) ),
			],
		] );
	}

	/**
	 * Proxy a request to Voxel's AJAX handler
	 */
	protected function proxy_voxel_action( $action, $request ) {
		$data = $request->get_json_params();

		$_REQUEST['data']     = wp_json_encode( $data );
		$_REQUEST['_wpnonce'] = wp_create_nonce( 'vx_timeline' );
		$_SERVER['REQUEST_METHOD'] = 'POST';

		ob_start();
		do_action( 'voxel_ajax_' . $action );
		$output = ob_get_clean();

		$response = json_decode( $output, true );
		if ( json_last_error() !== JSON_ERROR_NONE ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Invalid response from timeline API',
			], 500 );
		}

		return new \WP_REST_Response( $response );
	}
}
