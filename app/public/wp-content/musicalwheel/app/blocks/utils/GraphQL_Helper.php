<?php
/**
 * GraphQL Helper
 *
 * Utility functions for GraphQL operations in blocks.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace MusicalWheel\Blocks\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class GraphQL_Helper {

	/**
	 * Execute GraphQL query
	 *
	 * @param string $query GraphQL query string.
	 * @param array  $variables Query variables.
	 * @param array  $operation_name Operation name (optional).
	 * @return array|WP_Error Query result or error.
	 */
	public static function query( $query, $variables = [], $operation_name = null ) {
		if ( ! function_exists( 'graphql' ) ) {
			return new \WP_Error(
				'graphql_not_available',
				__( 'WPGraphQL plugin is not active.', 'musicalwheel' )
			);
		}

		$args = [
			'query'     => $query,
			'variables' => $variables,
		];

		if ( $operation_name ) {
			$args['operationName'] = $operation_name;
		}

		$result = graphql( $args );

		if ( ! empty( $result['errors'] ) ) {
			return new \WP_Error(
				'graphql_query_error',
				$result['errors'][0]['message'] ?? __( 'GraphQL query failed.', 'musicalwheel' ),
				$result['errors']
			);
		}

		return $result['data'] ?? [];
	}

	/**
	 * Execute GraphQL mutation
	 *
	 * @param string $mutation GraphQL mutation string.
	 * @param array  $variables Mutation variables.
	 * @return array|WP_Error Mutation result or error.
	 */
	public static function mutate( $mutation, $variables = [] ) {
		return self::query( $mutation, $variables );
	}

	/**
	 * Build GraphQL fragment
	 *
	 * @param string $type Type name.
	 * @param array  $fields Fields to include.
	 * @return string GraphQL fragment.
	 */
	public static function build_fragment( $type, $fields ) {
		$fragment_name = $type . 'Fragment';
		$fields_str = implode( "\n    ", $fields );

		return "fragment {$fragment_name} on {$type} {\n    {$fields_str}\n}";
	}

	/**
	 * Sanitize GraphQL variables
	 *
	 * @param array $variables Variables to sanitize.
	 * @return array Sanitized variables.
	 */
	public static function sanitize_variables( $variables ) {
		$sanitized = [];

		foreach ( $variables as $key => $value ) {
			if ( is_array( $value ) ) {
				$sanitized[ $key ] = self::sanitize_variables( $value );
			} elseif ( is_string( $value ) ) {
				$sanitized[ $key ] = sanitize_text_field( $value );
			} elseif ( is_int( $value ) ) {
				$sanitized[ $key ] = absint( $value );
			} elseif ( is_bool( $value ) ) {
				$sanitized[ $key ] = (bool) $value;
			} else {
				$sanitized[ $key ] = $value;
			}
		}

		return $sanitized;
	}

	/**
	 * Cache GraphQL query result
	 *
	 * @param string $cache_key Cache key.
	 * @param string $query GraphQL query.
	 * @param array  $variables Query variables.
	 * @param int    $expiration Cache expiration in seconds.
	 * @return array|WP_Error Query result or error.
	 */
	public static function query_cached( $cache_key, $query, $variables = [], $expiration = HOUR_IN_SECONDS ) {
		$cached = get_transient( $cache_key );

		if ( false !== $cached ) {
			return $cached;
		}

		$result = self::query( $query, $variables );

		if ( ! is_wp_error( $result ) ) {
			set_transient( $cache_key, $result, $expiration );
		}

		return $result;
	}

	/**
	 * Clear cached GraphQL query
	 *
	 * @param string $cache_key Cache key.
	 * @return bool True if deleted, false otherwise.
	 */
	public static function clear_cache( $cache_key ) {
		return delete_transient( $cache_key );
	}
}
