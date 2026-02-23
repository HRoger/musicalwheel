<?php
/**
 * FSE Loop API Controller
 *
 * Provides REST endpoint for expanding per-item loop configurations.
 * Used by the Gutenberg editor to preview expanded loop items in real-time.
 *
 * Mirrors Voxel's Repeater_Control::get_value() (repeater-control.php:22-40)
 * which expands items with _voxel_loop server-side before template rendering.
 *
 * @package VoxelFSE\Controllers
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Loop_API_Controller extends FSE_Base_Controller {

	const REST_NAMESPACE = 'voxel-fse/v1';

	protected function hooks(): void {
		$this->on( 'rest_api_init', '@register_routes' );
	}

	protected function register_routes(): void {
		register_rest_route( self::REST_NAMESPACE, '/loop/expand-items', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'expand_items' ],
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		] );
	}

	/**
	 * Expand items with loop configuration.
	 *
	 * Accepts an array of repeater items, runs Looper::run() on items
	 * with loop config, and returns the expanded items array.
	 */
	public function expand_items( \WP_REST_Request $request ): \WP_REST_Response {
		$items   = $request->get_param( 'items' ) ?? [];
		$post_id = $request->get_param( 'postId' );

		if ( ! is_array( $items ) || empty( $items ) ) {
			return new \WP_REST_Response( [ 'items' => [] ], 200 );
		}

		// Guard: Voxel Looper must be available
		if ( ! class_exists( '\Voxel\Dynamic_Data\Looper' ) ) {
			return new \WP_REST_Response( [ 'items' => $items ], 200 );
		}

		// Set up Voxel post context so @post(), @author(), @term() tags resolve.
		// In REST context (editor preview), there's no implicit post like on frontend.
		// Without this, parse_loopable() returns null for author/post/term groups.
		$this->setup_post_context( $post_id );

		require_once dirname( __DIR__ ) . '/blocks/Block_Loader.php';

		$groups   = \Voxel\_get_default_render_groups();
		$expanded = [];

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				$expanded[] = $item;
				continue;
			}

			$loop_config = \VoxelFSE\Blocks\Block_Loader::get_item_loop_config( $item );

			if ( $loop_config === null ) {
				$expanded[] = $item;
				continue;
			}

			// Validate the loop tag against available render groups
			$parsed = \Voxel\Dynamic_Data\Looper::parse_loopable(
				$loop_config['tag'],
				$groups
			);

			if ( $parsed === null ) {
				$expanded[] = $item;
				continue;
			}

			// Run the loop — each iteration pushes a clone of the item
			\Voxel\Dynamic_Data\Looper::run( $loop_config['tag'], [
				'limit'    => $loop_config['limit'],
				'offset'   => $loop_config['offset'],
				'callback' => function ( $index ) use ( $item, &$expanded ) {
					$cloned = $item;
					unset(
						$cloned['loopSource'], $cloned['loopProperty'],
						$cloned['loopLimit'], $cloned['loopOffset']
					);
					unset( $cloned['loop'] );
					unset( $cloned['loopConfig'] );

					// Re-evaluate dynamic data in string fields
					foreach ( $cloned as $key => $value ) {
						if ( is_string( $value ) && strpos( $value, '@' ) !== false ) {
							$cloned[ $key ] = \Voxel\render( $value );
						}
					}

					$expanded[] = $cloned;
				},
			] );
		}

		return new \WP_REST_Response( [ 'items' => $expanded ], 200 );
	}

	/**
	 * Set up Voxel post context for loop tag resolution.
	 *
	 * REST requests don't have an implicit post context like frontend page renders.
	 * Tags like @author(role) need a current post to derive the author from.
	 * If no postId is provided, find a sample post to provide context.
	 */
	private function setup_post_context( $post_id ): void {
		if ( ! function_exists( '\Voxel\set_current_post' ) ) {
			return;
		}

		// Try explicit postId first
		if ( $post_id ) {
			$wp_post = get_post( (int) $post_id );
			if ( $wp_post instanceof \WP_Post ) {
				$post = \Voxel\Post::get( $wp_post );
				if ( $post ) {
					\Voxel\set_current_post( $post );
					return;
				}
			}
		}

		// Fallback: find ANY published post to provide a post context for editor preview.
		// This ensures @author(), @post() tags can resolve in the editor.
		// Try Voxel post types first, then standard posts.
		$voxel_types = [];
		if ( method_exists( '\Voxel\Post_Type', 'get_voxel_types' ) ) {
			$voxel_types = array_keys( \Voxel\Post_Type::get_voxel_types() );
		}

		$post_types = ! empty( $voxel_types ) ? $voxel_types : [ 'post', 'page' ];

		$current_user_id = get_current_user_id();
		$args = [
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'post_type'      => $post_types,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'no_found_rows'  => true,
		];

		// Try current user's posts first
		if ( $current_user_id ) {
			$args['author'] = $current_user_id;
		}

		$sample_posts = get_posts( $args );

		// If no posts by current user, try any post
		if ( empty( $sample_posts ) && $current_user_id ) {
			unset( $args['author'] );
			$sample_posts = get_posts( $args );
		}

		if ( ! empty( $sample_posts ) ) {
			$post = \Voxel\Post::get( $sample_posts[0] );
			if ( $post ) {
				\Voxel\set_current_post( $post );
			}
		}
	}
}
