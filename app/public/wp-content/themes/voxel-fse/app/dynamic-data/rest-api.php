<?php
declare(strict_types=1);

/**
 * REST API Endpoints for Dynamic Data
 *
 * Provides endpoints for fetching data groups and modifiers for the React editor UI.
 *
 * Dual-Namespace Strategy:
 * - Generic internal API: /voxel-fse/v1/ (always available)
 * - Project-branded API: /PROJECT_NAMESPACE/v1/ (if defined in wp-config.php)
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Dynamic_Data;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class REST_API {

	/**
	 * Initialize REST API routes
	 */
	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_routes' ] );
	}

	/**
	 * Register REST API routes
	 *
	 * Registers routes on both generic (voxel-fse/v1) and project-specific namespaces
	 */
	public static function register_routes() {
		// Define namespaces to register
		$namespaces = [ 'voxel-fse/v1' ]; // Generic internal API

		// Add project-branded namespace if defined
		if ( defined( 'PROJECT_NAMESPACE' ) ) {
			$namespaces[] = PROJECT_NAMESPACE . '/v1';
		}

		// Register each endpoint on all namespaces
		foreach ( $namespaces as $namespace ) {
			// Get data groups endpoint
			register_rest_route(
				$namespace,
				'/dynamic-data/groups',
				[
					'methods'             => 'GET',
					'callback'            => [ __CLASS__, 'get_data_groups' ],
					'permission_callback' => [ __CLASS__, 'check_permission' ],
				]
			);

			// Get modifiers endpoint
			register_rest_route(
				$namespace,
				'/dynamic-data/modifiers',
				[
					'methods'             => 'GET',
					'callback'            => [ __CLASS__, 'get_modifiers' ],
					'permission_callback' => [ __CLASS__, 'check_permission' ],
				]
			);

			// Get flat tags for autocomplete
			register_rest_route(
				$namespace,
				'/dynamic-data/tags-flat',
				[
					'methods'             => 'GET',
					'callback'            => [ __CLASS__, 'get_flat_tags' ],
					'permission_callback' => [ __CLASS__, 'check_permission' ],
				]
			);

			// Render dynamic tag expression
			register_rest_route(
				$namespace,
				'/dynamic-data/render',
				[
					'methods'             => 'POST',
					'callback'            => [ __CLASS__, 'render_expression' ],
					'permission_callback' => [ __CLASS__, 'check_permission' ],
					'args'                => [
						'expression' => [
							'required'          => true,
							'type'              => 'string',
							'sanitize_callback' => 'sanitize_text_field',
							'description'       => 'Dynamic tag expression to render',
						],
						'context'    => [
							'required'          => false,
							'type'              => 'array',
							'default'           => [],
							'description'       => 'Optional context override',
						],
					],
				]
			);
		}
	}

	/**
	 * Check if user has permission to access endpoints
	 *
	 * @return bool
	 */
	public static function check_permission() {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * Get data groups
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public static function get_data_groups( $request ) {
		$context = $request->get_param( 'context' ) ?: 'post';
		$group   = $request->get_param( 'group' );
		$parent  = $request->get_param( 'parent' );

		// If requesting children of a specific group
		if ( $group ) {
			$children = self::get_group_children( $group, $parent );
			return new \WP_REST_Response( $children, 200 );
		}

		// Return only top-level groups for initial load
		$groups = self::get_top_level_groups( $context );

		return new \WP_REST_Response( $groups, 200 );
	}

	/**
	 * Get top-level data groups (NO children pre-loaded - fast)
	 *
	 * @param string $context Context (post, user, term, etc.).
	 * @return array
	 */
	private static function get_top_level_groups( $context ) {
		return [
			[
				'type'        => 'post',
				'label'       => 'Post',
				'exports'     => [],
				'hasChildren' => true,
			],
			[
				'type'        => 'author',
				'label'       => 'Author',
				'exports'     => [],
				'hasChildren' => true,
			],
			[
				'type'        => 'user',
				'label'       => 'User',
				'exports'     => [],
				'hasChildren' => true,
			],
			[
				'type'        => 'site',
				'label'       => 'Site',
				'exports'     => [],
				'hasChildren' => true,
			],
		];
	}

	/**
	 * Get children for a specific group (lazy loaded)
	 *
	 * @param string $group Group type.
	 * @param string $parent Parent path (e.g., 'post.author', 'author.profile').
	 * @return array
	 */
	private static function get_group_children( $group, $parent = null ) {
		// If parent is provided, parse the path to determine what children to return
		if ( $parent ) {
			$parts = explode( '.', $parent );
			$last  = end( $parts );

			// Handle nested paths like "author.profile"
			if ( $last === 'profile' ) {
				return self::get_profile_exports();
			}

			// Handle nested paths like "author.role" or "post.author.role"
			if ( $last === 'role' ) {
				return [
					[ 'key' => 'key', 'label' => 'Key', 'type' => 'string' ],
					[ 'key' => 'label', 'label' => 'Label', 'type' => 'string' ],
				];
			}

			// Handle post type and status
			if ( $last === 'post_type' ) {
				return [
					[ 'key' => 'key', 'label' => 'Key', 'type' => 'string' ],
					[ 'key' => 'singular_name', 'label' => 'Singular name', 'type' => 'string' ],
					[ 'key' => 'plural_name', 'label' => 'Plural name', 'type' => 'string' ],
				];
			}

			if ( $last === 'status' ) {
				return [
					[ 'key' => 'key', 'label' => 'Key', 'type' => 'string' ],
					[ 'key' => 'label', 'label' => 'Label', 'type' => 'string' ],
				];
			}

			// Handle Reviews nested structure
			if ( $last === 'reviews' ) {
				return [
					[ 'key' => 'total', 'label' => 'Total count', 'type' => 'number' ],
					[ 'key' => 'average', 'label' => 'Average rating', 'type' => 'number' ],
					[ 'key' => 'percentage', 'label' => 'Percentage', 'type' => 'number' ],
					[
						'key'         => 'latest',
						'label'       => 'Latest review',
						'type'        => 'object',
						'hasChildren' => true,
					],
					[
						'key'         => 'replies',
						'label'       => 'Replies',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle Latest review
			if ( $last === 'latest' && strpos( $parent, 'reviews' ) !== false ) {
				return [
					[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
					[ 'key' => 'created_at', 'label' => 'Date created', 'type' => 'date' ],
					[
						'key'         => 'author',
						'label'       => 'Author',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle Timeline nested structure
			if ( $last === 'timeline' ) {
				return [
					[ 'key' => 'total', 'label' => 'Total count', 'type' => 'number' ],
					[
						'key'         => 'latest',
						'label'       => 'Latest post',
						'type'        => 'object',
						'hasChildren' => true,
					],
					[
						'key'         => 'replies',
						'label'       => 'Replies',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle Wall nested structure
			if ( $last === 'wall' ) {
				return [
					[ 'key' => 'total', 'label' => 'Total count', 'type' => 'number' ],
					[ 'key' => 'total_with_replies', 'label' => 'Total count (including replies)', 'type' => 'number' ],
					[
						'key'         => 'latest',
						'label'       => 'Latest post',
						'type'        => 'object',
						'hasChildren' => true,
					],
					[
						'key'         => 'replies',
						'label'       => 'Replies',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle Followers
			if ( $last === 'followers' ) {
				return [
					[ 'key' => 'accepted', 'label' => 'Follow count', 'type' => 'number' ],
					[ 'key' => 'blocked', 'label' => 'Block count', 'type' => 'number' ],
				];
			}

			// Handle Latest post (timeline or wall)
			if ( $last === 'latest' && ( strpos( $parent, 'timeline' ) !== false || strpos( $parent, 'wall' ) !== false ) ) {
				// Timeline.latest has NO author, Wall.latest HAS author
				if ( strpos( $parent, 'timeline' ) !== false ) {
					return [
						[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
						[ 'key' => 'created_at', 'label' => 'Date created', 'type' => 'date' ],
					];
				} else {
					// Wall.latest has author
					return [
						[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
						[ 'key' => 'created_at', 'label' => 'Date created', 'type' => 'date' ],
						[
							'key'         => 'author',
							'label'       => 'Author',
							'type'        => 'object',
							'hasChildren' => true,
						],
					];
				}
			}

			// Handle Replies structure
			if ( $last === 'replies' ) {
				return [
					[ 'key' => 'total', 'label' => 'Total count', 'type' => 'number' ],
					[
						'key'         => 'latest',
						'label'       => 'Latest reply',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle Latest reply (from replies context)
			if ( $last === 'latest' && strpos( $parent, 'replies' ) !== false ) {
				return [
					[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
					[ 'key' => 'created_at', 'label' => 'Date created', 'type' => 'date' ],
					[
						'key'         => 'author',
						'label'       => 'Author',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle deeply nested author (in reviews/replies context)
			if ( $last === 'author' && count( $parts ) > 2 ) {
				// This is a nested author within reviews/replies, return simplified author info
				return [
					[ 'key' => 'name', 'label' => 'Name', 'type' => 'string' ],
					[ 'key' => 'link', 'label' => 'Link', 'type' => 'url' ],
					[ 'key' => 'avatar', 'label' => 'Avatar', 'type' => 'url' ],
				];
			}

			// Handle site.post_types - return list of post type groups
			if ( $last === 'post_types' ) {
				// Return generic post types - these could be dynamically generated
				return [
					[
						'key'         => 'pages',
						'label'       => 'Pages',
						'type'        => 'object',
						'hasChildren' => true,
					],
					[
						'key'         => 'profiles',
						'label'       => 'Profiles',
						'type'        => 'object',
						'hasChildren' => true,
					],
					[
						'key'         => 'spaces',
						'label'       => 'Spaces',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle individual post types (pages, profiles, spaces)
			if ( in_array( $last, [ 'pages', 'profiles', 'spaces' ], true ) ) {
				return [
					[ 'key' => 'singular', 'label' => 'Singular name', 'type' => 'string' ],
					[ 'key' => 'plural', 'label' => 'Plural name', 'type' => 'string' ],
					[ 'key' => 'icon', 'label' => 'Icon', 'type' => 'string' ],
					[ 'key' => 'archive', 'label' => 'Archive link', 'type' => 'url' ],
					[ 'key' => 'create', 'label' => 'Create post link', 'type' => 'url' ],
					[
						'key'         => 'templates',
						'label'       => 'Templates',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle templates structure
			if ( $last === 'templates' ) {
				return [
					[ 'key' => 'single', 'label' => 'Single page', 'type' => 'number' ],
					[ 'key' => 'card', 'label' => 'Preview card', 'type' => 'number' ],
					[ 'key' => 'archive', 'label' => 'Archive', 'type' => 'number' ],
					[ 'key' => 'form', 'label' => 'Create post', 'type' => 'number' ],
				];
			}

			// Handle Location structure
			if ( $last === 'location' ) {
				return [
					[ 'key' => 'full_address', 'label' => 'Full address', 'type' => 'string' ],
					[ 'key' => 'latitude', 'label' => 'Latitude', 'type' => 'number' ],
					[ 'key' => 'longitude', 'label' => 'Longitude', 'type' => 'number' ],
					[ 'key' => 'short_address', 'label' => 'Short address', 'type' => 'string' ],
					[ 'key' => 'medium_address', 'label' => 'Medium address', 'type' => 'string' ],
					[ 'key' => 'long_address', 'label' => 'Long address', 'type' => 'string' ],
					[
						'key'         => 'distance',
						'label'       => 'Distance',
						'type'        => 'object',
						'hasChildren' => true,
					],
				];
			}

			// Handle Distance structure
			if ( $last === 'distance' ) {
				return [
					[ 'key' => 'meters', 'label' => 'Meters', 'type' => 'number' ],
					[ 'key' => 'kilometers', 'label' => 'Kilometers', 'type' => 'number' ],
					[ 'key' => 'miles', 'label' => 'Miles', 'type' => 'number' ],
				];
			}

			// Handle Profile picture and Featured image structures
			if ( $last === 'profile_picture' || $last === 'featured_image' ) {
				return [
					[ 'key' => 'file_id', 'label' => 'File ID', 'type' => 'number' ],
					[ 'key' => 'file_url', 'label' => 'File URL', 'type' => 'url' ],
					[ 'key' => 'file_name', 'label' => 'File name', 'type' => 'string' ],
				];
			}
		}

		// Top-level group requests (no parent)
		switch ( $group ) {
			case 'post':
				return self::get_post_exports();

			case 'author':
				return self::get_author_exports( null );

			case 'user':
				return self::get_user_exports( null );

			case 'site':
				return self::get_site_exports( null );

			default:
				return [];
		}
	}

	/**
	 * Get Post data exports (matching Voxel structure exactly)
	 *
	 * @return array
	 */
	private static function get_post_exports() {
		return [
			// Basic post fields
			[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
			[ 'key' => 'title', 'label' => 'Title', 'type' => 'string' ],
			[ 'key' => 'content', 'label' => 'Content', 'type' => 'string' ],
			[ 'key' => 'slug', 'label' => 'Slug', 'type' => 'string' ],
			[ 'key' => 'permalink', 'label' => 'Permalink', 'type' => 'url' ],
			[ 'key' => 'edit_link', 'label' => 'Edit link', 'type' => 'url' ],

			// Post type with nested children
			[
				'key'         => 'post_type',
				'label'       => 'Post type',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// Status with nested children
			[
				'key'         => 'status',
				'label'       => 'Status',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// Date fields
			[ 'key' => 'date_created', 'label' => 'Date created', 'type' => 'date' ],
			[ 'key' => 'date_modified', 'label' => 'Last modified date', 'type' => 'date' ],
			[ 'key' => 'expiration_date', 'label' => 'Expiration date', 'type' => 'date' ],
			[ 'key' => 'priority', 'label' => 'Priority', 'type' => 'number' ],
			[ 'key' => 'excerpt', 'label' => 'Excerpt', 'type' => 'string' ],

			// Reviews (nested structure)
			[
				'key'         => 'reviews',
				'label'       => 'Reviews',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// Timeline posts (key: timeline, label: Timeline posts)
			[
				'key'         => 'timeline',
				'label'       => 'Timeline posts',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// Wall posts (key: wall, label: Wall posts)
			[
				'key'         => 'wall',
				'label'       => 'Wall posts',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// Followers
			[
				'key'         => 'followers',
				'label'       => 'Followers',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// Simple boolean field
			[ 'key' => 'is_verified', 'label' => 'Is verified?', 'type' => 'boolean' ],

			// Post meta METHOD (Evidence: post-data-group.php:248)
			// Voxel: 'meta' => \Voxel\Dynamic_Data\Modifiers\Group_Methods\Post_Meta_Method::class
			[ 'key' => 'meta', 'label' => 'Post meta', 'type' => 'method' ],
		];
	}

	/**
	 * Get Author data exports (matching Voxel structure)
	 *
	 * @param string|null $parent Parent path (not used, kept for backward compatibility).
	 * @return array
	 */
	private static function get_author_exports( $parent = null ) {
		return [
			[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
			[ 'key' => 'username', 'label' => 'Username', 'type' => 'string' ],
			[ 'key' => 'display_name', 'label' => 'Display name', 'type' => 'string' ],
			[ 'key' => 'email', 'label' => 'Email', 'type' => 'email' ],
			[ 'key' => 'avatar', 'label' => 'Avatar', 'type' => 'url' ],
			[ 'key' => 'first_name', 'label' => 'First name', 'type' => 'string' ],
			[ 'key' => 'last_name', 'label' => 'Last name', 'type' => 'string' ],
			[ 'key' => 'profile_id', 'label' => 'Profile ID', 'type' => 'number' ],
			[ 'key' => 'profile_url', 'label' => 'Profile URL', 'type' => 'url' ],
			[ 'key' => 'is_verified', 'label' => 'Is verified?', 'type' => 'boolean' ],
			[
				'key'         => 'profile',
				'label'       => 'Profile',
				'type'        => 'object',
				'hasChildren' => true,
			],
			[
				'key'         => 'role',
				'label'       => 'Role',
				'type'        => 'object',
				'hasChildren' => true,
			],

			// User meta METHOD (Evidence: user-data-group.php:235)
			// Voxel: 'meta' => \Voxel\Dynamic_Data\Modifiers\Group_Methods\User_Meta_Method::class
			[ 'key' => 'meta', 'label' => 'User meta', 'type' => 'method' ],
		];
	}

	/**
	 * Get User data exports (current user - matching Voxel structure)
	 *
	 * @param string|null $parent Parent path (not used, kept for backward compatibility).
	 * @return array
	 */
	private static function get_user_exports( $parent = null ) {
		// User has same structure as Author
		return self::get_author_exports( null );
	}

	/**
	 * Get Profile data exports
	 *
	 * @return array
	 */
	private static function get_profile_exports() {
		return [
			[ 'key' => 'id', 'label' => 'ID', 'type' => 'number' ],
			[ 'key' => 'title', 'label' => 'Title', 'type' => 'string' ],
			[ 'key' => 'content', 'label' => 'Content', 'type' => 'string' ],
			[ 'key' => 'slug', 'label' => 'Slug', 'type' => 'string' ],
			[ 'key' => 'permalink', 'label' => 'Permalink', 'type' => 'url' ],
			[ 'key' => 'edit_link', 'label' => 'Edit link', 'type' => 'url' ],
			[ 'key' => 'is_verified', 'label' => 'Is verified?', 'type' => 'boolean' ],
			[ 'key' => 'profile_name', 'label' => 'Profile name', 'type' => 'string' ],
			[
				'key'         => 'location',
				'label'       => 'Location',
				'type'        => 'object',
				'hasChildren' => true,
			],
			[ 'key' => 'website', 'label' => 'Website', 'type' => 'url' ],
			[
				'key'         => 'profile_picture',
				'label'       => 'Profile picture',
				'type'        => 'object',
				'hasChildren' => true,
			],
			[
				'key'         => 'featured_image',
				'label'       => 'Featured image',
				'type'        => 'object',
				'hasChildren' => true,
			],
			[ 'key' => 'bio', 'label' => 'Bio', 'type' => 'string' ],
		];
	}

	/**
	 * Get Site data exports (matching Voxel structure)
	 *
	 * @param string $parent Parent path.
	 * @return array
	 */
	private static function get_site_exports( $parent = null ) {
		return [
			[ 'key' => 'title', 'label' => 'Title', 'type' => 'string' ],
			[ 'key' => 'logo', 'label' => 'Logo', 'type' => 'url' ],
			[ 'key' => 'tagline', 'label' => 'Tagline', 'type' => 'string' ],
			[ 'key' => 'url', 'label' => 'URL', 'type' => 'url' ],
			[ 'key' => 'admin_url', 'label' => 'WP Admin URL', 'type' => 'url' ],
			[ 'key' => 'login_url', 'label' => 'Login URL', 'type' => 'url' ],
			[ 'key' => 'register_url', 'label' => 'Register URL', 'type' => 'url' ],
			[ 'key' => 'logout_url', 'label' => 'Logout URL', 'type' => 'url' ],
			[ 'key' => 'current_plan_url', 'label' => 'Current plan URL', 'type' => 'url' ],
			[ 'key' => 'language', 'label' => 'Language', 'type' => 'string' ],
			[ 'key' => 'date', 'label' => 'Date', 'type' => 'date' ],
			[
				'key'         => 'post_types',
				'label'       => 'Post types',
				'type'        => 'object',
				'hasChildren' => true,
			],
			// Methods (callable like @site().method_name())
			[ 'key' => 'query_var', 'label' => 'Query variable', 'type' => 'method' ],
			[ 'key' => 'math', 'label' => 'Math expression', 'type' => 'method' ],
		];
	}

	/**
	 * Get modifiers
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public static function get_modifiers( $request ) {
		$modifiers = [
			// Text modifiers (6 total - Evidence: Voxel UI shows only 6, not 11)
			[
				'key'      => 'append',
				'label'    => 'Append text',
				'category' => 'text',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Text to append',
						'description' => 'Text to append',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'capitalize',
				'label'    => 'Capitalize',
				'category' => 'text',
				'args'     => [],
			],
			[
				'key'      => 'fallback',
				'label'    => 'Fallback',
				'category' => 'text',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Fallback text',
						'description' => 'Value to use if empty',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'prepend',
				'label'    => 'Prepend text',
				'category' => 'text',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Text to prepend',
						'description' => 'Text to prepend',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'truncate',
				'label'    => 'Truncate text',
				'category' => 'text',
				'args'     => [
					[
						'type'        => 'number',
						'label'       => 'Max length',
						'description' => 'Maximum length',
						'default'     => 50,
					],
				],
			],
			[
				'key'      => 'replace',
				'label'    => 'Replace text',
				'category' => 'text',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Search',
						'description' => 'Text to search for',
						'default'     => '',
					],
					[
						'type'        => 'text',
						'label'       => 'Replace with',
						'description' => 'Replacement text',
						'default'     => '',
					],
				],
			],

			// Number modifiers (4 total)
			[
				'key'      => 'currency_format',
				'label'    => 'Currency format',
				'category' => 'number',
				'args'     => [
					[
						'type'        => 'select',
						'label'       => 'Currency',
						'description' => 'Currency code',
						'default'     => 'USD',
						'options'     => [
							[ 'label' => 'Default platform currency', 'value' => 'default' ],
							[ 'label' => 'US Dollar (USD)', 'value' => 'USD' ],
							[ 'label' => 'Euro (EUR)', 'value' => 'EUR' ],
							[ 'label' => 'British Pound (GBP)', 'value' => 'GBP' ],
							[ 'label' => 'Japanese Yen (JPY)', 'value' => 'JPY' ],
							[ 'label' => 'Canadian Dollar (CAD)', 'value' => 'CAD' ],
							[ 'label' => 'Australian Dollar (AUD)', 'value' => 'AUD' ],
							[ 'label' => 'Swiss Franc (CHF)', 'value' => 'CHF' ],
							[ 'label' => 'Chinese Yuan (CNY)', 'value' => 'CNY' ],
							[ 'label' => 'Indian Rupee (INR)', 'value' => 'INR' ],
						],
					],
					[
						'type'        => 'select',
						'label'       => 'Amount is in cents',
						'description' => 'Is the amount in cents?',
						'default'     => '',
						'options'     => [
							[ 'label' => 'No', 'value' => '' ],
							[ 'label' => 'Yes', 'value' => '1' ],
						],
					],
				],
			],
			[
				'key'      => 'number_format',
				'label'    => 'Number format',
				'category' => 'number',
				'args'     => [
					[
						'type'        => 'number',
						'label'       => 'Decimals',
						'description' => 'Specify the number of decimal places to round to. Negative values round to positions before the decimal point. Default: 0.',
						'default'     => 0,
					],
				],
			],
			[
				'key'      => 'round',
				'label'    => 'Round number',
				'category' => 'number',
				'args'     => [
					[
						'type'        => 'number',
						'label'       => 'Decimals',
						'description' => 'Specify the number of decimal places to round to. Negative values round to positions before the decimal point. Default: 0.',
						'default'     => 0,
					],
				],
			],
			[
				'key'      => 'abbreviate',
				'label'    => 'Abbreviate number',
				'category' => 'number',
				'args'     => [],
			],

			// Date modifiers (3 total)
			[
				'key'      => 'date_format',
				'label'    => 'Date format',
				'category' => 'date',
				'args'     => [
					[
						'type'        => 'select',
						'label'       => 'Date format',
						'description' => 'Leave empty to use the format set in site options',
						'default'     => 'Y-m-d',
						'options'     => [
							[ 'label' => 'Y-m-d (2025-11-14)', 'value' => 'Y-m-d' ],
							[ 'label' => 'F j, Y (November 14, 2025)', 'value' => 'F j, Y' ],
							[ 'label' => 'M j, Y (Nov 14, 2025)', 'value' => 'M j, Y' ],
							[ 'label' => 'd/m/Y (14/11/2025)', 'value' => 'd/m/Y' ],
							[ 'label' => 'm/d/Y (11/14/2025)', 'value' => 'm/d/Y' ],
							[ 'label' => 'l, F j, Y (Thursday, November 14, 2025)', 'value' => 'l, F j, Y' ],
							[ 'label' => 'relative (2 hours ago)', 'value' => 'relative' ],
							[ 'label' => 'H:i:s (14:30:00)', 'value' => 'H:i:s' ],
							[ 'label' => 'Y-m-d H:i:s (2025-11-14 14:30:00)', 'value' => 'Y-m-d H:i:s' ],
						],
					],
				],
			],
			[
				'key'      => 'time_diff',
				'label'    => 'Time diff',
				'category' => 'date',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Timezone to compare against',
						'description' => 'Enter the timezone identifier e.g. "Europe/London", or an offset e.g. "+02:00". Leave empty to use the timezone set in site options.',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'to_age',
				'label'    => 'Get age',
				'category' => 'date',
				'args'     => [],
			],

			// Conditional modifiers (13 total - Evidence: themes/voxel/app/dynamic-data/config.php:62-74)
			[
				'key'      => 'is_empty',
				'label'    => 'Is empty',
				'category' => 'control',
				'args'     => [],
			],
			[
				'key'      => 'is_not_empty',
				'label'    => 'Is not empty',
				'category' => 'control',
				'args'     => [],
			],
			[
				'key'      => 'is_equal_to',
				'label'    => 'Is equal to',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Value',
						'description' => 'Value to compare',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'is_not_equal_to',
				'label'    => 'Is not equal to',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Value',
						'description' => 'Value to compare',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'is_greater_than',
				'label'    => 'Is greater than',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Value',
						'description' => 'Value to compare',
						'default'     => '',
					],
					[
						'type'        => 'select',
						'label'       => 'Mode',
						'description' => 'Comparison mode',
						'default'     => '',
						'options'     => [
							[ 'label' => 'Greater than (>)', 'value' => '' ],
							[ 'label' => 'Greater than or equal to (>=)', 'value' => '>=' ],
						],
					],
				],
			],
			[
				'key'      => 'is_less_than',
				'label'    => 'Is less than',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Value',
						'description' => 'Value to compare',
						'default'     => '',
					],
					[
						'type'        => 'select',
						'label'       => 'Mode',
						'description' => 'Comparison mode',
						'default'     => '',
						'options'     => [
							[ 'label' => 'Less than (<)', 'value' => '' ],
							[ 'label' => 'Less than or equal to (<=)', 'value' => '<=' ],
						],
					],
				],
			],
			[
				'key'      => 'is_between',
				'label'    => 'Is between',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Start',
						'description' => 'Start value',
						'default'     => '',
					],
					[
						'type'        => 'text',
						'label'       => 'End',
						'description' => 'End value',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'is_checked',
				'label'    => 'Is checked',
				'category' => 'control',
				'args'     => [],
			],
			[
				'key'      => 'is_unchecked',
				'label'    => 'Is unchecked',
				'category' => 'control',
				'args'     => [],
			],
			[
				'key'      => 'contains',
				'label'    => 'Contains',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Value',
						'description' => 'Value to search for',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'does_not_contain',
				'label'    => 'Does not contain',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Value',
						'description' => 'Value to search for',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'then',
				'label'    => 'Then',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Content',
						'description' => 'Content to display if condition passes',
						'default'     => '',
					],
				],
			],
			[
				'key'      => 'else',
				'label'    => 'Else',
				'category' => 'control',
				'args'     => [
					[
						'type'        => 'text',
						'label'       => 'Content',
						'description' => 'Content to display if condition fails',
						'default'     => '',
					],
				],
			],
		];

		return new \WP_REST_Response( $modifiers, 200 );
	}

	/**
	 * Get flat list of all tags for autocomplete (matching Voxel's structure)
	 *
	 * Returns a flattened list of all tags with breadcrumb for easy searching
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public static function get_flat_tags( $request ) {
		$context = $request->get_param( 'context' ) ?: 'post';
		$flat_tags = [];

		// Recursive helper function to add tags with proper path building
		$add_tags_recursive = function( $group, $exports, $parent_key = '', $parent_breadcrumb = '' ) use ( &$flat_tags, &$add_tags_recursive ) {
			foreach ( $exports as $export ) {
				// Skip if not a selectable property (hasChildren but no type)
				if ( isset( $export['hasChildren'] ) && $export['hasChildren'] && ( ! isset( $export['type'] ) || $export['type'] === 'object' ) ) {
					// This is a parent node - recursively fetch and add its children
					$current_key = $parent_key ? "{$parent_key}.{$export['key']}" : $export['key'];
					$current_breadcrumb = $parent_breadcrumb ? "{$parent_breadcrumb} / {$export['label']}" : $export['label'];

					// Fetch children for this node
					$children = self::get_group_children( $group, "{$group}.{$current_key}" );

					// Recursively add children
					$add_tags_recursive( $group, $children, $current_key, $current_breadcrumb );
				} else {
					// This is a leaf node - add it to flat tags
					$current_key = $parent_key ? "{$parent_key}.{$export['key']}" : $export['key'];

					// Generate fullPath based on type: methods vs properties have different syntax
					// Evidence: themes/voxel/app/dynamic-data/exporter.php:90-96 (separate exports/methods)
					if ( isset( $export['type'] ) && $export['type'] === 'method' ) {
						// Methods use: @group().method() syntax
						$full_path = "@{$group}().{$export['key']}()";
					} else {
						// Properties use: @group(property.path) syntax
						$full_path = "@{$group}({$current_key})";
					}

					// Breadcrumb should be parent path only (NOT including the label)
					// Match Voxel's structure: parentLabels.join(' / ') vs property.label
					$flat_tags[] = [
						'group'      => $group,
						'key'        => $current_key,
						'label'      => $export['label'],
						'type'       => $export['type'] ?? 'property', // Track type for frontend
						'fullPath'   => $full_path,
						'breadcrumb' => $parent_breadcrumb ?: ucfirst( $group ), // Parent path only
					];
				}
			}
		};

		// Add Post tags
		$post_exports = self::get_post_exports();
		$add_tags_recursive( 'post', $post_exports, '', 'Post' );

		// Add Author tags
		$author_exports = self::get_author_exports( null );
		$add_tags_recursive( 'author', $author_exports, '', 'Author' );

		// Add User tags
		$user_exports = self::get_user_exports( null );
		$add_tags_recursive( 'user', $user_exports, '', 'User' );

		// Add Site tags
		$site_exports = self::get_site_exports( null );
		$add_tags_recursive( 'site', $site_exports, '', 'Site' );

		return new \WP_REST_Response( $flat_tags, 200 );
	}

	/**
	 * Render a dynamic tag expression
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public static function render_expression( $request ) {
		$expression = $request->get_param( 'expression' );
		$context    = $request->get_param( 'context' );

		// Use Block_Renderer to render the expression
		$rendered = \VoxelFSE\Dynamic_Data\Block_Renderer::render_expression( $expression, $context );

		return new \WP_REST_Response(
			[
				'expression' => $expression,
				'rendered'   => $rendered,
			],
			200
		);
	}
}

// Initialize REST API
REST_API::init();
