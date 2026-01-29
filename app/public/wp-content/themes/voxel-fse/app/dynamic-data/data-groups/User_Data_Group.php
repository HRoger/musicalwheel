<?php
declare(strict_types=1);

/**
 * User Data Group
 *
 * Provides user data for dynamic tags.
 * Usage: @user(username), @user(email), @user(display_name)
 *
 * @package MusicalWheel
 */

namespace VoxelFSE\Dynamic_Data\Data_Groups;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * User_Data_Group class
 *
 * Handles user-related dynamic data with singleton pattern per user ID.
 */
class User_Data_Group extends Base_Data_Group {

	use User\Vendor_Data;
	use User\Membership_Data;
	use User\Visits_Data;

	/**
	 * Singleton instances cache
	 *
	 * @var array<int, self>
	 */
	protected static $instances = array();

	/**
	 * WordPress user ID
	 *
	 * @var int
	 */
	protected $user_id;

	/**
	 * Constructor
	 *
	 * @param int|null $user_id WordPress user ID (null = current user).
	 */
	protected function __construct( ?int $user_id = null ) {
		$this->user_id = $user_id ?: get_current_user_id();
	}

	/**
	 * Get singleton instance for user
	 *
	 * @param int|null $user_id User ID (null = current user).
	 * @return self
	 */
	public static function get( ?int $user_id = null ): self {
		$user_id = $user_id ?: get_current_user_id();

		if ( ! array_key_exists( $user_id, static::$instances ) ) {
			static::$instances[ $user_id ] = new static( $user_id );
		}

		return static::$instances[ $user_id ];
	}

	/**
	 * Unset instance from cache
	 *
	 * @param int $user_id User ID to remove from cache.
	 */
	public static function unset( int $user_id ): void {
		unset( static::$instances[ $user_id ] );
	}

	/**
	 * Get user ID
	 *
	 * @return int
	 */
	public function get_user_id(): int {
		return $this->user_id;
	}

	/**
	 * Resolve property value
	 *
	 * @param array $property_path Property path (e.g., ['username'] or ['role', 'label']).
	 * @param mixed $token Token object (optional).
	 * @return string
	 */
	public function resolve_property( array $property_path, mixed $token = null ): ?string {
		if ( empty( $this->user_id ) ) {
			return '';
		}

		$user = get_userdata( $this->user_id );
		if ( ! $user ) {
			return '';
		}

		// Ensure property_path is valid and get first element
		if ( empty( $property_path ) || ! is_array( $property_path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) ( $property_path[0] ?? '' ) ) );

		if ( empty( $key ) ) {
			return '';
		}

		// Handle nested properties
		if ( count( $property_path ) > 1 ) {
			switch ( $key ) {
				case 'role':
					return $this->resolve_role_property( $user, $property_path[1] );

				case 'vendor':
					return $this->resolve_vendor_property( array_slice( $property_path, 1 ) );

				case 'membership':
					return $this->resolve_membership_property( array_slice( $property_path, 1 ) );

				case 'visits':
					return $this->resolve_visits_property( array_slice( $property_path, 1 ) );

				case 'followers':
					return $this->resolve_followers_property( array_slice( $property_path, 1 ) );

				case 'following':
					return $this->resolve_following_property( array_slice( $property_path, 1 ) );

				case 'timeline':
					return $this->resolve_timeline_property( array_slice( $property_path, 1 ) );

				case 'post_types':
				case 'post-types':
					return $this->resolve_post_types_property( array_slice( $property_path, 1 ) );
			}
		}

		switch ( $key ) {
			case 'id':
				return (string) absint( $this->user_id );

			case 'username':
				return $user->user_login ?: '';

			case 'display_name':
				return $user->display_name ?: '';

			case 'email':
				return $user->user_email ?: '';

			case 'avatar':
				// Return avatar attachment ID (0 if none)
				$avatar_id = get_user_meta( $this->user_id, 'wp_user_avatar', true );
				return $avatar_id ? (string) absint( $avatar_id ) : '0';

			case 'first_name':
				$first_name = get_user_meta( $this->user_id, 'first_name', true );
				return is_string( $first_name ) ? $first_name : '';

			case 'last_name':
				$last_name = get_user_meta( $this->user_id, 'last_name', true );
				return is_string( $last_name ) ? $last_name : '';

			case 'profile_id':
				// Profile post ID (if profile CPT exists)
				$profile_id = get_user_meta( $this->user_id, 'voxel_profile_id', true );
				return $profile_id ? (string) absint( $profile_id ) : '0';

			case 'profile_url':
				return get_author_posts_url( $this->user_id ) ?: '';

			case 'is_verified':
				// Check if user is verified
				$verified = get_user_meta( $this->user_id, 'voxel_verified', true );
				return $verified ? '1' : '';

			case 'role':
				// Return primary role label
				return $this->get_primary_role_label( $user );

			default:
				return '';
		}
	}

	/**
	 * Resolve role nested property
	 *
	 * @param object $user User object.
	 * @param string $property Property name (label or key).
	 * @return string
	 */
	protected function resolve_role_property( $user, string $property ): string {
		$property = strtolower( trim( $property ) );

		if ( empty( $user->roles ) ) {
			return '';
		}

		$primary_role = $user->roles[0];

		switch ( $property ) {
			case 'label':
				return $this->get_role_label( $primary_role );

			case 'key':
				return $primary_role;

			default:
				return '';
		}
	}

	/**
	 * Get primary role label
	 *
	 * @param object $user User object.
	 * @return string
	 */
	protected function get_primary_role_label( $user ): string {
		if ( empty( $user->roles ) ) {
			return '';
		}

		$primary_role = $user->roles[0];
		return $this->get_role_label( $primary_role );
	}

	/**
	 * Get role label from role key
	 *
	 * @param string $role_key Role key (e.g., 'administrator').
	 * @return string
	 */
	protected function get_role_label( string $role_key ): string {
		global $wp_roles;

		if ( ! isset( $wp_roles ) ) {
			$wp_roles = new \WP_Roles();
		}

		$role_names = $wp_roles->get_names();
		return $role_names[ $role_key ] ?? ucfirst( $role_key );
	}

	/**
	 * Resolve followers property
	 *
	 * @param array $path Property path after 'followers'.
	 * @return string
	 */
	protected function resolve_followers_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		switch ( $key ) {
			case 'accepted':
				// Total accepted followers
				// TODO: Implement when follow system backend exists
				return '0';

			case 'blocked':
				// Total blocked followers
				// TODO: Implement when follow system backend exists
				return '0';

			default:
				return '';
		}
	}

	/**
	 * Resolve following property
	 *
	 * @param array $path Property path after 'following'.
	 * @return string
	 */
	protected function resolve_following_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		switch ( $key ) {
			case 'accepted':
				// Total accepted following
				// TODO: Implement when follow system backend exists
				return '0';

			case 'requested':
				// Total pending follow requests
				// TODO: Implement when follow system backend exists
				return '0';

			case 'blocked':
				// Total blocked users
				// TODO: Implement when follow system backend exists
				return '0';

			case 'by_post_type':
			case 'by-post-type':
				// Following counts by post type
				// TODO: Implement when follow system backend exists
				return '0';

			default:
				return '';
		}
	}

	/**
	 * Resolve timeline property
	 *
	 * @param array $path Property path after 'timeline'.
	 * @return string
	 */
	protected function resolve_timeline_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		switch ( $key ) {
			case 'total':
				// Total timeline posts
				// TODO: Implement when timeline backend exists
				return '0';

			case 'reposted':
				// Total reposts
				// TODO: Implement when timeline backend exists
				return '0';

			case 'quoted':
				// Total quoted posts
				// TODO: Implement when timeline backend exists
				return '0';

			default:
				return '';
		}
	}

	/**
	 * Resolve post_types property
	 *
	 * @param array $path Property path after 'post_types'.
	 * @return string
	 */
	protected function resolve_post_types_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		// First element is post type key (e.g., 'venue', 'artist')
		$post_type = $path[0];

		// If no sub-property, return total published count
		if ( count( $path ) === 1 ) {
			// TODO: Implement post count by post type
			return '0';
		}

		// Second element is status (published, pending, etc.)
		$status = strtolower( trim( (string) $path[1] ) );

		switch ( $status ) {
			case 'published':
			case 'pending':
			case 'unpublished':
			case 'expired':
			case 'rejected':
			case 'draft':
				// TODO: Implement post count by post type and status
				return '0';

			case 'archive':
			case 'archive_link':
			case 'archive-link':
				// Archive URL for user's posts of this type
				// TODO: Implement archive link generation
				return '';

			default:
				return '';
		}
	}

	/**
	 * Get the data group type/key
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'user';
	}

	/**
	 * Get property aliases
	 *
	 * Shortcuts for common properties.
	 *
	 * @return array<string, string>
	 */
	protected function get_aliases(): array {
		return array(
			':id'           => 'id',
			':username'     => 'username',
			':display_name' => 'display_name',
			':email'        => 'email',
			':avatar'       => 'avatar',
			':profile_url'  => 'profile_url',
			':profile_id'   => 'profile_id',
			':first_name'   => 'first_name',
			':last_name'    => 'last_name',
		);
	}

	/**
	 * Get custom methods (group-specific modifiers)
	 *
	 * @return array<string, string>
	 */
	public function methods(): array {
		return array();
		// Future: 'meta' => User_Meta_Method::class
	}

	/**
	 * Create mock instance for testing
	 *
	 * @return self
	 */
	public static function mock(): self {
		return new static( 0 );
	}
}
