<?php
declare(strict_types=1);

/**
 * Block Renderer for Dynamic Tags
 *
 * Processes dynamic tag expressions in block attributes during server-side rendering.
 *
 * @package MusicalWheel
 */

namespace VoxelFSE\Dynamic_Data;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Block_Renderer {

	/**
	 * Maximum nesting depth to prevent infinite loops
	 */
	private static $max_depth = 3;

	/**
	 * Current rendering depth
	 */
	private static $current_depth = 0;

	/**
	 * Process block attributes to render dynamic tags
	 *
	 * Recursively processes nested arrays to find and render all dynamic tags.
	 *
	 * @param array $attributes Block attributes.
	 * @param array $context Optional context override (post, user, term).
	 * @return array Processed attributes with rendered dynamic tags.
	 */
	public static function process_attributes( array $attributes, array $context = [] ): array {
		// Prevent infinite recursion
		if ( self::$current_depth >= self::$max_depth ) {
			return $attributes;
		}

		self::$current_depth++;
		$processed = [];

		foreach ( $attributes as $key => $value ) {
			if ( is_array( $value ) ) {
				// Recursively process nested arrays
				$processed[ $key ] = self::process_attributes( $value, $context );
			} elseif ( is_string( $value ) && strpos( $value, '@' ) !== false ) {
				// Process string values that contain @
				$processed[ $key ] = self::render_expression( $value, $context );
			} else {
				// Preserve other values as-is
				$processed[ $key ] = $value;
			}
		}

		self::$current_depth--;
		return $processed;
	}

	/**
	 * Render a single dynamic tag expression
	 *
	 * @param string $expression Expression containing @tags.
	 * @param array  $context Optional context override.
	 * @return string Rendered expression.
	 */
	public static function render_expression( string $expression, array $context = [] ): string {
		// If no @ symbol, return as-is
		if ( strpos( $expression, '@' ) === false ) {
			return $expression;
		}

		// Build context groups if not provided
		if ( empty( $context ) ) {
			$context = self::get_default_context();
		}

		// Render using mw_render() function
		return mw_render( $expression, $context );
	}

	/**
	 * Get default context based on current WordPress state
	 *
	 * @return array Data group instances.
	 */
	protected static function get_default_context(): array {
		$current_user_id = get_current_user_id();
		$queried_object  = get_queried_object();

		$context = [
			'post' => new \VoxelFSE\Dynamic_Data\Data_Groups\Post_Data_Group(),
			'site' => new \VoxelFSE\Dynamic_Data\Data_Groups\Site_Data_Group(),
			'user' => \VoxelFSE\Dynamic_Data\Data_Groups\User_Data_Group::get( $current_user_id ),
		];

		// Add term group if on term page
		if ( $queried_object instanceof \WP_Term ) {
			$context['term'] = \VoxelFSE\Dynamic_Data\Data_Groups\Term_Data_Group::get(
				$queried_object->term_id,
				$queried_object->taxonomy
			);
		}

		return $context;
	}

	/**
	 * Helper to render a single attribute
	 *
	 * Useful for individual attribute processing in render.php
	 *
	 * @param string $value Attribute value.
	 * @param array  $context Optional context.
	 * @return string Rendered value.
	 */
	public static function render_attribute( string $value, array $context = [] ): string {
		return self::render_expression( $value, $context );
	}

	/**
	 * Check if a value contains dynamic tags
	 *
	 * @param mixed $value Value to check.
	 * @return bool
	 */
	public static function has_dynamic_tags( $value ): bool {
		return is_string( $value ) && strpos( $value, '@' ) !== false;
	}
}
