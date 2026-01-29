<?php
/**
 * Register Timeline GraphQL Types
 *
 * Extends WPGraphQL schema with Timeline addon types.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace MusicalWheel\GraphQL;

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
		// Timeline Status Type
		register_graphql_object_type( 'TimelineStatus', [
			'description' => __( 'A status post in the timeline', 'musicalwheel' ),
			'fields'      => [
				'id'          => [
					'type'        => 'ID',
					'description' => __( 'The status ID', 'musicalwheel' ),
				],
				'content'     => [
					'type'        => 'String',
					'description' => __( 'The status content', 'musicalwheel' ),
				],
				'author'      => [
					'type'        => 'User',
					'description' => __( 'The author of the status', 'musicalwheel' ),
				],
				'post'        => [
					'type'        => 'Post',
					'description' => __( 'Associated post (if any)', 'musicalwheel' ),
				],
				'likeCount'   => [
					'type'        => 'Int',
					'description' => __( 'Number of likes', 'musicalwheel' ),
				],
				'replyCount'  => [
					'type'        => 'Int',
					'description' => __( 'Number of replies', 'musicalwheel' ),
				],
				'liked'       => [
					'type'        => 'Boolean',
					'description' => __( 'Whether current user has liked this status', 'musicalwheel' ),
				],
				'files'       => [
					'type'        => [ 'list_of' => 'MediaItem' ],
					'description' => __( 'Attached files/images', 'musicalwheel' ),
				],
				'linkPreview' => [
					'type'        => 'LinkPreview',
					'description' => __( 'Link preview data', 'musicalwheel' ),
				],
				'createdAt'   => [
					'type'        => 'String',
					'description' => __( 'Creation timestamp', 'musicalwheel' ),
				],
				'editedAt'    => [
					'type'        => 'String',
					'description' => __( 'Last edit timestamp', 'musicalwheel' ),
				],
			],
		] );

		// Link Preview Type
		register_graphql_object_type( 'LinkPreview', [
			'description' => __( 'Link preview metadata', 'musicalwheel' ),
			'fields'      => [
				'url'         => [
					'type'        => 'String',
					'description' => __( 'The URL', 'musicalwheel' ),
				],
				'title'       => [
					'type'        => 'String',
					'description' => __( 'Page title', 'musicalwheel' ),
				],
				'description' => [
					'type'        => 'String',
					'description' => __( 'Page description', 'musicalwheel' ),
				],
				'image'       => [
					'type'        => 'String',
					'description' => __( 'Preview image URL', 'musicalwheel' ),
				],
			],
		] );

		// Timeline Feed Type Enum
		register_graphql_enum_type( 'TimelineFeedType', [
			'description' => __( 'Timeline feed types', 'musicalwheel' ),
			'values'      => [
				'USER_FEED'       => [
					'value'       => 'user_feed',
					'description' => __( 'Logged-in user newsfeed', 'musicalwheel' ),
				],
				'GLOBAL_FEED'     => [
					'value'       => 'global_feed',
					'description' => __( 'Sitewide activity', 'musicalwheel' ),
				],
				'POST_TIMELINE'   => [
					'value'       => 'post_timeline',
					'description' => __( 'Post timeline', 'musicalwheel' ),
				],
				'POST_WALL'       => [
					'value'       => 'post_wall',
					'description' => __( 'Post wall', 'musicalwheel' ),
				],
				'POST_REVIEWS'    => [
					'value'       => 'post_reviews',
					'description' => __( 'Post reviews', 'musicalwheel' ),
				],
				'AUTHOR_TIMELINE' => [
					'value'       => 'author_timeline',
					'description' => __( 'Author timeline', 'musicalwheel' ),
				],
			],
		] );

		// Timeline Order By Enum
		register_graphql_enum_type( 'TimelineOrderBy', [
			'description' => __( 'Timeline ordering options', 'musicalwheel' ),
			'values'      => [
				'LATEST'         => [
					'value'       => 'latest',
					'description' => __( 'Most recent first', 'musicalwheel' ),
				],
				'EARLIEST'       => [
					'value'       => 'earliest',
					'description' => __( 'Oldest first', 'musicalwheel' ),
				],
				'MOST_LIKED'     => [
					'value'       => 'most_liked',
					'description' => __( 'Most liked', 'musicalwheel' ),
				],
				'MOST_DISCUSSED' => [
					'value'       => 'most_discussed',
					'description' => __( 'Most discussed', 'musicalwheel' ),
				],
			],
		] );

		// Timeline Statuses Query
		register_graphql_field( 'RootQuery', 'timelineStatuses', [
			'type'        => [ 'list_of' => 'TimelineStatus' ],
			'description' => __( 'Get timeline statuses', 'musicalwheel' ),
			'args'        => [
				'feed'    => [
					'type'        => 'TimelineFeedType',
					'description' => __( 'Feed type', 'musicalwheel' ),
				],
				'first'   => [
					'type'        => 'Int',
					'description' => __( 'Number of statuses to fetch', 'musicalwheel' ),
				],
				'after'   => [
					'type'        => 'String',
					'description' => __( 'Cursor for pagination', 'musicalwheel' ),
				],
				'orderBy' => [
					'type'        => 'TimelineOrderBy',
					'description' => __( 'Order by', 'musicalwheel' ),
				],
			],
			'resolve'     => function( $root, $args ) {
				// This would connect to the actual Timeline addon data
				// For now, returning empty array as placeholder
				return [];
			},
		] );

		// Create Status Mutation
		register_graphql_mutation( 'createTimelineStatus', [
			'inputFields'         => [
				'content' => [
					'type'        => [ 'non_null' => 'String' ],
					'description' => __( 'Status content', 'musicalwheel' ),
				],
				'postId'  => [
					'type'        => 'ID',
					'description' => __( 'Associated post ID', 'musicalwheel' ),
				],
				'files'   => [
					'type'        => [ 'list_of' => 'ID' ],
					'description' => __( 'Attached file IDs', 'musicalwheel' ),
				],
			],
			'outputFields'        => [
				'status' => [
					'type'        => 'TimelineStatus',
					'description' => __( 'The created status', 'musicalwheel' ),
				],
				'errors' => [
					'type'        => [ 'list_of' => 'String' ],
					'description' => __( 'Error messages', 'musicalwheel' ),
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
					'description' => __( 'Status ID to like', 'musicalwheel' ),
				],
			],
			'outputFields'        => [
				'status' => [
					'type'        => 'TimelineStatus',
					'description' => __( 'The updated status', 'musicalwheel' ),
				],
				'success' => [
					'type'        => 'Boolean',
					'description' => __( 'Whether the operation succeeded', 'musicalwheel' ),
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
