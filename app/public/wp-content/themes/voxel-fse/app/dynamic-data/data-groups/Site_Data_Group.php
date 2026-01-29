<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Data_Groups;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Site Data Group
 * 
 * Provides access to site-level data (title, URL, tagline, etc.)
 * 
 * @package MusicalWheel\Dynamic_Data\Data_Groups
 */
class Site_Data_Group extends Base_Data_Group {

	/**
	 * Resolve a property from the site data group
	 * 
	 * @param array $property_path Property path (e.g., ['title'], ['url'])
	 * @param mixed $token Optional token context
	 * @return string
	 */
	public function resolve_property( array $property_path, mixed $token = null ): ?string {
		if ( empty( $property_path ) || ! is_array( $property_path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) ( $property_path[0] ?? '' ) ) );

		if ( empty( $key ) ) {
			return '';
		}

		switch ( $key ) {
			case 'title':
				// Site title (blog name)
				$title = get_bloginfo( 'name' );
				return is_string( $title ) ? $title : '';
			
			case 'tagline':
			case 'description':
				// Site tagline/description
				$tagline = get_bloginfo( 'description' );
				return is_string( $tagline ) ? $tagline : '';
			
			case 'url':
			case 'home_url':
				// Site URL (home URL)
				$url = get_bloginfo( 'url' );
				// Fallback to home_url() if get_bloginfo('url') is empty
				if ( empty( $url ) ) {
					$url = home_url( '/' );
				}
				return is_string( $url ) ? $url : '';
			
			case 'admin_url':
				// WordPress admin URL
				$admin_url = admin_url();
				return is_string( $admin_url ) ? $admin_url : '';
			
			case 'language':
				// Site language
				$language = get_bloginfo( 'language' );
				return is_string( $language ) ? $language : '';
			
			case 'date':
			case 'current_date':
				// Current date/time
				return current_time( 'Y-m-d H:i:s' );
			
			case 'wp_url':
			case 'wp_content_url':
				// WordPress content URL
				$wp_content_url = content_url();
				return is_string( $wp_content_url ) ? $wp_content_url : '';
			
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
		return 'site';
	}
}

