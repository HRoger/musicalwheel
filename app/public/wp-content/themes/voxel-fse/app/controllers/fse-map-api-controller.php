<?php
/**
 * FSE Map API Controller
 *
 * REST API endpoints for the Map block.
 * Provides post location data and marker templates for React frontend.
 *
 * Implements 1:1 parity with Voxel PHP templates:
 * - themes/voxel/templates/widgets/map.php
 * - themes/voxel/app/utils/post-utils.php::_post_get_marker()
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class FSE_Map_API_Controller extends FSE_Base_Controller {

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
	 * Register REST API routes
	 */
	protected function register_routes(): void {
		// Get post location for current-post mode
		register_rest_route( self::REST_NAMESPACE, '/map/post-location', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_post_location' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'post_id' => [
					'required'          => true,
					'validate_callback' => function( $param ) {
						return is_numeric( $param );
					},
				],
			],
		] );

		// Get marker template for a post
		register_rest_route( self::REST_NAMESPACE, '/map/marker', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_marker' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'post_id' => [
					'required'          => true,
					'validate_callback' => function( $param ) {
						return is_numeric( $param );
					},
				],
			],
		] );

		// Get markers for multiple posts (bulk)
		register_rest_route( self::REST_NAMESPACE, '/map/markers', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'get_markers_bulk' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'post_ids' => [
					'required'          => true,
					'validate_callback' => function( $param ) {
						return is_array( $param );
					},
				],
			],
		] );
	}

	/**
	 * Get post location data for current-post mode
	 *
	 * Implements 1:1 parity with:
	 * - themes/voxel/templates/widgets/map.php (lines 9-21)
	 * - themes/voxel/app/widgets/map.php::render() (lines 1240-1255)
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function get_post_location( \WP_REST_Request $request ): \WP_REST_Response {
		$post_id = (int) $request->get_param( 'post_id' );

		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post not found',
			], 404 );
		}

		// Get location field (map.php:1246-1252)
		$location_field = $post->get_field( 'location' );
		if ( ! $location_field ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post has no location field',
			], 400 );
		}

		$location = $location_field->get_value();
		if ( ! ( is_numeric( $location['latitude'] ?? null ) && is_numeric( $location['longitude'] ?? null ) ) ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post has no valid location',
			], 400 );
		}

		// Generate marker template using Voxel's function
		// (map.php:18, post-utils.php:572-651)
		// Use output buffering to catch any accidental output from Voxel methods
		ob_start();
		$marker = \Voxel\_post_get_marker( $post );
		ob_end_clean();

		return new \WP_REST_Response( [
			'success'   => true,
			'latitude'  => (float) $location['latitude'],
			'longitude' => (float) $location['longitude'],
			'address'   => $location['address'] ?? '',
			'marker'    => $marker ?? '',
		] );
	}

	/**
	 * Get marker template for a single post
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function get_marker( \WP_REST_Request $request ): \WP_REST_Response {
		$post_id = (int) $request->get_param( 'post_id' );

		$post = \Voxel\Post::get( $post_id );
		if ( ! $post ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post not found',
			], 404 );
		}

		// Generate marker template
		ob_start();
		$marker = \Voxel\_post_get_marker( $post );
		ob_end_clean();

		if ( ! $marker ) {
			return new \WP_REST_Response( [
				'success' => false,
				'message' => 'Post has no valid location for marker',
			], 400 );
		}

		// Get location for position data
		$location_field = $post->get_field( 'location' );
		$location       = $location_field ? $location_field->get_value() : [];

		return new \WP_REST_Response( [
			'success'   => true,
			'postId'    => $post->get_id(),
			'marker'    => $marker,
			'latitude'  => (float) ( $location['latitude'] ?? 0 ),
			'longitude' => (float) ( $location['longitude'] ?? 0 ),
		] );
	}

	/**
	 * Get markers for multiple posts (bulk operation)
	 *
	 * Used by search-form mode when receiving search results
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response Response object.
	 */
	public function get_markers_bulk( \WP_REST_Request $request ): \WP_REST_Response {
		$post_ids = $request->get_param( 'post_ids' );

		if ( empty( $post_ids ) ) {
			return new \WP_REST_Response( [
				'success' => true,
				'markers' => [],
			] );
		}

		$markers = [];

		foreach ( $post_ids as $post_id ) {
			$post_id = (int) $post_id;
			$post    = \Voxel\Post::get( $post_id );

			if ( ! $post ) {
				continue;
			}

			// Get location
			$location_field = $post->get_field( 'location' );
			if ( ! $location_field ) {
				continue;
			}

			$location = $location_field->get_value();
			if ( ! ( is_numeric( $location['latitude'] ?? null ) && is_numeric( $location['longitude'] ?? null ) ) ) {
				continue;
			}

			// Generate marker template
			ob_start();
			$marker = \Voxel\_post_get_marker( $post );
			ob_end_clean();

			if ( ! $marker ) {
				continue;
			}

			$markers[] = [
				'postId'    => $post->get_id(),
				'lat'       => (float) $location['latitude'],
				'lng'       => (float) $location['longitude'],
				'template'  => $marker,
				'uriencoded' => false,
			];
		}

		return new \WP_REST_Response( [
			'success' => true,
			'markers' => $markers,
		] );
	}
}
