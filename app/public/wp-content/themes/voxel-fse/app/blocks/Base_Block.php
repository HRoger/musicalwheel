<?php
declare(strict_types=1);

/**
 * Base Block Class
 *
 * Abstract base class for all VoxelFSE Gutenberg blocks.
 * Provides common functionality for block registration, attribute handling, and rendering.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace VoxelFSE\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Base_Block {

	/**
	 * Block name (without namespace)
	 *
	 * @var string
	 */
	protected $name;

	/**
	 * Block directory path
	 *
	 * @var string
	 */
	protected $block_dir;

	/**
	 * Block attributes
	 *
	 * @var array
	 */
	protected $attributes = [];

	/**
	 * Constructor
	 */
	public function __construct() {
		$this->block_dir = $this->get_block_directory();
		$this->init();
	}

	/**
	 * Initialize the block
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function init(): void {
		// Always hook to 'init' with a priority that ensures everything is ready
		if ( ! has_action( 'init', [ $this, 'register_block' ] ) ) {
			add_action( 'init', [ $this, 'register_block' ], 20 );
		}
	}

	/**
	 * Get block name
	 *
	 * @since 1.0.0
	 * @return string Block name without namespace.
	 */
	abstract protected function get_block_name(): string;

	/**
	 * Get block directory
	 *
	 * @since 1.0.0
	 * @return string Full path to block directory.
	 */
	protected function get_block_directory(): string {
		return get_template_directory() . '/app/blocks/src/' . $this->get_block_name();
	}

	/**
	 * Register the block
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_block(): void {
		if ( ! file_exists( $this->block_dir . '/block.json' ) ) {
			return;
		}

		register_block_type(
			$this->block_dir,
			[
				'render_callback' => [ $this, 'render_callback' ],
			]
		);
	}

	/**
	 * Render callback for the block
	 *
	 * @since 1.0.0
	 * @param array  $attributes Block attributes.
	 * @param string $content    Block content.
	 * @return string Rendered block HTML.
	 */
	abstract public function render_callback( array $attributes = [], string $content = '' ): string;

	/**
	 * Render method (can be overridden by child classes)
	 *
	 * @since 1.0.0
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param object $block Block object.
	 * @return string Rendered HTML.
	 */
	protected function render( array $attributes, string $content, object $block ): string {
		return '';
	}

	/**
	 * Get attribute value with default fallback
	 *
	 * @since 1.0.0
	 * @param string $key Attribute key.
	 * @param mixed  $default Default value.
	 * @return mixed Attribute value or default.
	 */
	protected function get_attribute( string $key, mixed $default = null ): mixed {
		return $this->attributes[ $key ] ?? $default;
	}

	/**
	 * Sanitize attribute value
	 *
	 * @since 1.0.0
	 * @param string $key Attribute key.
	 * @param string $type Sanitization type (text, html, url, int, bool).
	 * @return mixed Sanitized value.
	 */
	protected function sanitize_attribute( string $key, string $type = 'text' ): mixed {
		$value = $this->get_attribute( $key );

		if ( is_null( $value ) ) {
			return null;
		}

		switch ( $type ) {
			case 'html':
				return wp_kses_post( $value );
			case 'url':
				return esc_url( $value );
			case 'int':
				return absint( $value );
			case 'bool':
				return (bool) $value;
			case 'text':
			default:
				return sanitize_text_field( $value );
		}
	}

	/**
	 * Get block wrapper attributes
	 *
	 * @since 1.0.0
	 * @param array $extra_classes Additional CSS classes.
	 * @return string Block wrapper attributes string.
	 */
	protected function get_wrapper_attributes( array $extra_classes = [] ): string {
		$classes = array_merge(
			[ 'mw-block', 'mw-block--' . $this->get_block_name() ],
			$extra_classes
		);

		$attributes = [
			'class' => implode( ' ', array_filter( $classes ) ),
		];

		if ( ! empty( $this->attributes['anchor'] ) ) {
			$attributes['id'] = sanitize_title( $this->attributes['anchor'] );
		}

		return get_block_wrapper_attributes( $attributes );
	}

	/**
	 * Enqueue block assets
	 *
	 * @since 1.0.0
	 * @param string $handle Asset handle.
	 * @param string $file Asset file path (relative to block directory).
	 * @param array  $dependencies Asset dependencies.
	 * @param string $type Asset type (script or style).
	 * @return void
	 */
	protected function enqueue_asset( string $handle, string $file, array $dependencies = [], string $type = 'script' ): void {
		$file_path = $this->block_dir . '/' . $file;
		$file_url  = get_template_directory_uri() . '/assets/dist/' . $this->get_block_name() . '/' . $file;

		if ( ! file_exists( $file_path ) ) {
			return;
		}

		if ( 'script' === $type ) {
			wp_enqueue_script(
				$handle,
				$file_url,
				$dependencies,
				filemtime( $file_path ),
				true
			);
		} else {
			wp_enqueue_style(
				$handle,
				$file_url,
				$dependencies,
				filemtime( $file_path )
			);
		}
	}

	/**
	 * Get GraphQL data
	 *
	 * @since 1.0.0
	 * @param string $query GraphQL query.
	 * @param array  $variables Query variables.
	 * @return array|\WP_Error GraphQL data array or WP_Error on failure.
	 */
	protected function get_graphql_data( string $query, array $variables = [] ): array|\WP_Error {
		if ( ! function_exists( 'graphql' ) ) {
			return new \WP_Error( 'graphql_not_available', 'WPGraphQL plugin is not active.' );
		}

		$result = graphql([
			'query'     => $query,
			'variables' => $variables,
		]);

		if ( ! empty( $result['errors'] ) ) {
			return new \WP_Error( 'graphql_error', $result['errors'][0]['message'] );
		}

		return $result['data'] ?? [];
	}

	/**
	 * Localize script data for frontend
	 *
	 * @since 1.0.0
	 * @param string $handle Script handle.
	 * @param string $object_name Object name.
	 * @param array  $data Data to localize.
	 * @return void
	 */
	protected function localize_script( string $handle, string $object_name, array $data ): void {
		wp_localize_script( $handle, $object_name, $data );
	}
}
