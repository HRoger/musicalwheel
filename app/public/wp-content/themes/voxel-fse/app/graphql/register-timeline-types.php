<?php
declare(strict_types=1);

/**
 * Register Timeline GraphQL Types
 *
 * Extends WPGraphQL schema with Timeline addon types.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace VoxelFSE\GraphQL;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Register_Timeline_Types {

	/**
	 * Initialize timeline types registration
	 */
	public static function init() {
		add_action( 'graphql_register_types', [ __CLASS__, 'register_types' ] );
	}

	/**
	 * Register timeline-related GraphQL types
	 */
	public static function register_types() {
		// Author Info Type (simple)
		register_graphql_object_type( 'AuthorInfo', [
			'description' => __( 'Author information', 'voxel-fse' ),
			'fields'      => [
				'name'   => [
					'type'        => 'String',
					'description' => __( 'Author name', 'voxel-fse' ),
				],
				'avatar' => [
					'type'        => 'Avatar',
					'description' => __( 'Author avatar', 'voxel-fse' ),
				],
			],
		] );

		// Avatar Type
		register_graphql_object_type( 'Avatar', [
			'description' => __( 'Avatar data', 'voxel-fse' ),
			'fields'      => [
				'url' => [
					'type'        => 'String',
					'description' => __( 'Avatar URL', 'voxel-fse' ),
				],
			],
		] );

		// Timeline Status Type
		register_graphql_object_type( 'TimelineStatus', [
			'description' => __( 'A status post in the timeline', 'voxel-fse' ),
			'fields'      => [
				'id'          => [
					'type'        => 'ID',
					'description' => __( 'The status ID', 'voxel-fse' ),
				],
				'content'     => [
					'type'        => 'String',
					'description' => __( 'The status content', 'voxel-fse' ),
				],
				'author'      => [
					'type'        => 'AuthorInfo',
					'description' => __( 'The author of the status', 'voxel-fse' ),
				],
				'post'        => [
					'type'        => 'Post',
					'description' => __( 'Associated post (if any)', 'voxel-fse' ),
				],
				'likeCount'   => [
					'type'        => 'Int',
					'description' => __( 'Number of likes', 'voxel-fse' ),
				],
				'replyCount'  => [
					'type'        => 'Int',
					'description' => __( 'Number of replies', 'voxel-fse' ),
				],
				'liked'       => [
					'type'        => 'Boolean',
					'description' => __( 'Whether current user has liked this status', 'voxel-fse' ),
				],
				'files'       => [
					'type'        => [ 'list_of' => 'MediaItem' ],
					'description' => __( 'Attached files/images', 'voxel-fse' ),
				],
				'linkPreview' => [
					'type'        => 'LinkPreview',
					'description' => __( 'Link preview data', 'voxel-fse' ),
				],
				'createdAt'   => [
					'type'        => 'String',
					'description' => __( 'Creation timestamp', 'voxel-fse' ),
				],
				'editedAt'    => [
					'type'        => 'String',
					'description' => __( 'Last edit timestamp', 'voxel-fse' ),
				],
			],
		] );

		// Link Preview Type
		register_graphql_object_type( 'LinkPreview', [
			'description' => __( 'Link preview metadata', 'voxel-fse' ),
			'fields'      => [
				'url'         => [
					'type'        => 'String',
					'description' => __( 'The URL', 'voxel-fse' ),
				],
				'title'       => [
					'type'        => 'String',
					'description' => __( 'Page title', 'voxel-fse' ),
				],
				'description' => [
					'type'        => 'String',
					'description' => __( 'Page description', 'voxel-fse' ),
				],
				'image'       => [
					'type'        => 'String',
					'description' => __( 'Preview image URL', 'voxel-fse' ),
				],
			],
		] );

		// Timeline Feed Type Enum
		register_graphql_enum_type( 'TimelineFeedType', [
			'description' => __( 'Timeline feed types', 'voxel-fse' ),
			'values'      => [
				'USER_FEED'       => [
					'value'       => 'user_feed',
					'description' => __( 'Logged-in user newsfeed', 'voxel-fse' ),
				],
				'GLOBAL_FEED'     => [
					'value'       => 'global_feed',
					'description' => __( 'Sitewide activity', 'voxel-fse' ),
				],
				'POST_TIMELINE'   => [
					'value'       => 'post_timeline',
					'description' => __( 'Post timeline', 'voxel-fse' ),
				],
				'POST_WALL'       => [
					'value'       => 'post_wall',
					'description' => __( 'Post wall', 'voxel-fse' ),
				],
				'POST_REVIEWS'    => [
					'value'       => 'post_reviews',
					'description' => __( 'Post reviews', 'voxel-fse' ),
				],
				'AUTHOR_TIMELINE' => [
					'value'       => 'author_timeline',
					'description' => __( 'Author timeline', 'voxel-fse' ),
				],
			],
		] );

		// Timeline Order By Enum
		register_graphql_enum_type( 'TimelineOrderBy', [
			'description' => __( 'Timeline ordering options', 'voxel-fse' ),
			'values'      => [
				'LATEST'         => [
					'value'       => 'latest',
					'description' => __( 'Most recent first', 'voxel-fse' ),
				],
				'EARLIEST'       => [
					'value'       => 'earliest',
					'description' => __( 'Oldest first', 'voxel-fse' ),
				],
				'MOST_LIKED'     => [
					'value'       => 'most_liked',
					'description' => __( 'Most liked', 'voxel-fse' ),
				],
				'MOST_DISCUSSED' => [
					'value'       => 'most_discussed',
					'description' => __( 'Most discussed', 'voxel-fse' ),
				],
			],
		] );

		// Timeline Statuses Query
		register_graphql_field( 'RootQuery', 'timelineStatuses', [
			'type'        => [ 'list_of' => 'TimelineStatus' ],
			'description' => __( 'Get timeline statuses', 'voxel-fse' ),
			'args'        => [
				'feed'    => [
					'type'        => 'TimelineFeedType',
					'description' => __( 'Feed type', 'voxel-fse' ),
				],
				'first'   => [
					'type'        => 'Int',
					'description' => __( 'Number of statuses to fetch', 'voxel-fse' ),
				],
				'after'   => [
					'type'        => 'String',
					'description' => __( 'Cursor for pagination', 'voxel-fse' ),
				],
				'orderBy' => [
					'type'        => 'TimelineOrderBy',
					'description' => __( 'Order by', 'voxel-fse' ),
				],
			],
			'resolve'     => function( $root, $args ) {
				// Mock data resolver for development
				// TODO: Replace with actual Timeline CPT query when data source is ready
				
				$feed_type = $args['feed'] ?? 'user_feed';
				$first = $args['first'] ?? 10;
				$order_by = $args['orderBy'] ?? 'latest';
				
				// Generate mock timeline statuses
				$mock_statuses = [];
				
				// Get a few users for mock data
				$users = get_users( array( 'number' => 3 ) );
				if ( empty( $users ) ) {
					// Fallback to current user
					$users = array( wp_get_current_user() );
				}
				
				$mock_contents = array(
					"Just finished an amazing guitar session! 🎸 The new riff is coming together nicely.",
					"Looking for a bass player for our upcoming gig next month. DM if interested!",
					"Check out this vintage Gibson I found at the local music shop. What a beauty! 😍",
					"Recording session today went great! Can't wait to share the final track with you all.",
					"Anyone know a good luthier in the area? Need some work done on my acoustic.",
					"Just posted a new cover on my profile. Let me know what you think!",
					"Practice makes perfect. 30 minutes of scales every morning pays off!",
					"Our band is looking for a new practice space. Any recommendations?",
				);
				
				// Generate requested number of statuses
				for ( $i = 0; $i < min( $first, 8 ); $i++ ) {
					$user = $users[ $i % count( $users ) ];
					$hours_ago = $i * 6 + rand( 1, 5 ); // Spread over time
					
					$mock_statuses[] = array(
						'id'          => 'status_' . ( $i + 1 ),
						'content'     => $mock_contents[ $i % count( $mock_contents ) ],
						'author'      => array(
							'name'   => $user->display_name,
							'avatar' => array(
								'url' => get_avatar_url( $user->ID, array( 'size' => 96 ) ),
							),
						),
						'likeCount'   => rand( 0, 25 ),
						'replyCount'  => rand( 0, 12 ),
						'liked'       => ( $i % 3 === 0 ), // Every 3rd status is liked
						'createdAt'   => date( 'Y-m-d H:i:s', strtotime( "-{$hours_ago} hours" ) ),
						'editedAt'    => null,
						'files'       => array(),
						'linkPreview' => null,
						'post'        => null,
					);
				}
				
				// Apply ordering
				if ( $order_by === 'most_liked' ) {
					usort( $mock_statuses, function( $a, $b ) {
						return $b['likeCount'] - $a['likeCount'];
					} );
				} elseif ( $order_by === 'most_discussed' ) {
					usort( $mock_statuses, function( $a, $b ) {
						return $b['replyCount'] - $a['replyCount'];
					} );
				} elseif ( $order_by === 'earliest' ) {
					$mock_statuses = array_reverse( $mock_statuses );
				}
				// 'latest' is default order (already chronological)
				
				return $mock_statuses;
			},
		] );

		// Create Status Mutation
		register_graphql_mutation( 'createTimelineStatus', [
			'inputFields'         => [
				'content' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Status content', 'voxel-fse' ),
				],
				'postId'  => [
					'type'        => 'ID',
					'description' => __( 'Associated post ID', 'voxel-fse' ),
				],
				'files'   => [
					'type'        => [ 'list_of' => 'ID' ],
					'description' => __( 'Attached file IDs', 'voxel-fse' ),
				],
			],
			'outputFields'        => [
				'status' => [
					'type'        => 'TimelineStatus',
					'description' => __( 'The created status', 'voxel-fse' ),
				],
				'errors' => [
					'type'        => [ 'list_of' => 'String' ],
					'description' => __( 'Error messages', 'voxel-fse' ),
				],
			],
			'mutateAndGetPayload' => function( $input ) {
				// Placeholder for actual mutation logic
				return [
					'status' => null,
					'errors' => [ 'Not implemented yet' ],
				];
			},
		] );

		// Like Status Mutation
		register_graphql_mutation( 'likeTimelineStatus', [
			'inputFields'         => [
				'statusId' => [
					'type'        => [ 'non_null' => 'ID' ],
					'description' => __( 'Status ID to like', 'voxel-fse' ),
				],
			],
			'outputFields'        => [
				'status' => [
					'type'        => 'TimelineStatus',
					'description' => __( 'The updated status', 'voxel-fse' ),
				],
				'success' => [
					'type'        => 'Boolean',
					'description' => __( 'Whether the operation succeeded', 'voxel-fse' ),
				],
			],
			'mutateAndGetPayload' => function( $input ) {
				// Placeholder for actual mutation logic
				return [
					'status'  => null,
					'success' => false,
				];
			},
		] );
	}
}

// Initialize
Register_Timeline_Types::init();
