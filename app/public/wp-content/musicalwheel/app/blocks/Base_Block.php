<?php
/**
 * Base Block Class
 *
 * Abstract base class for all MusicalWheel Gutenberg blocks.
 * Provides common functionality for block registration, attribute handling, and rendering.
 *
 * @package MusicalWheel
 * @since 1.0.0
 */

namespace MusicalWheel\Blocks;

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
		error_log( 'Base_Block::__construct() called for: ' . $this->get_block_name() );
		$this->block_dir = $this->get_block_directory();
		error_log( 'Block dir set to: ' . $this->block_dir );
		$this->init();
	}

	/**
	 * Initialize the block
	 */
	public function init() {
		error_log( 'Base_Block::init() called for: ' . $this->get_block_name() );
		
		// Check if we're already past the 'init' hook
		if ( did_action( 'init' ) ) {
			error_log( 'init already fired, registering block immediately' );
			$this->register_block();
		} else {
			error_log( 'init not yet fired, adding action hook' );
			add_action( 'init', [ $this, 'register_block' ] );
		}
	}

	/**
	 * Get block name
	 *
	 * @return string
	 */
	abstract protected function get_block_name();

	/**
	 * Get block directory
	 *
	 * @return string
	 */
	protected function get_block_directory() {
		return get_template_directory() . '/src/blocks/' . $this->get_block_name();
	}

	/**
	 * Register the block
	 */
	public function register_block() {
		error_log( 'Attempting to register block: ' . $this->get_block_name() );
		error_log( 'Block directory: ' . $this->block_dir );
		
		if ( ! file_exists( $this->block_dir . '/block.json' ) ) {
			error_log( 'ERROR: block.json not found at: ' . $this->block_dir . '/block.json' );
			return;
		}
		
		error_log( 'block.json found, calling register_block_type()' );

		$result = register_block_type(
			$this->block_dir,
			[
				'render_callback' => [ $this, 'render_callback' ],
			]
		);
		
		if ( $result === false || is_wp_error( $result ) ) {
			error_log( 'ERROR: register_block_type failed!' );
			if ( is_wp_error( $result ) ) {
				error_log( 'WP_Error: ' . $result->get_error_message() );
			}
		} else {
			error_log( 'SUCCESS: Block registered - ' . $result->name );
		}
	}

	/**
	 * Render callback for the block
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param object $block Block object.
	 * @return string
	 */
	public function render_callback( $attributes, $content, $block ) {
		$this->attributes = $attributes;

		// Check if custom render file exists
		$render_file = $this->block_dir . '/render.php';
		if ( file_exists( $render_file ) ) {
			ob_start();
			include $render_file;
			return ob_get_clean();
		}

		// Fallback to render() method
		return $this->render( $attributes, $content, $block );
	}

	/**
	 * Render method (can be overridden by child classes)
	 *
	 * @param array  $attributes Block attributes.
	 * @param string $content Block content.
	 * @param object $block Block object.
	 * @return string
	 */
	protected function render( $attributes, $content, $block ) {
		return '';
	}

	/**
	 * Get attribute value with default fallback
	 *
	 * @param string $key Attribute key.
	 * @param mixed  $default Default value.
	 * @return mixed
	 */
	protected function get_attribute( $key, $default = null ) {
		return $this->attributes[ $key ] ?? $default;
	}

	/**
	 * Sanitize attribute value
	 *
	 * @param string $key Attribute key.
	 * @param string $type Sanitization type (text, html, url, int, bool).
	 * @return mixed
	 */
	protected function sanitize_attribute( $key, $type = 'text' ) {
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
	 * @param array $extra_classes Additional CSS classes.
	 * @return string
	 */
	protected function get_wrapper_attributes( $extra_classes = [] ) {
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
	 * @param string $handle Asset handle.
	 * @param string $file Asset file path (relative to block directory).
	 * @param array  $dependencies Asset dependencies.
	 * @param string $type Asset type (script or style).
	 */
	protected function enqueue_asset( $handle, $file, $dependencies = [], $type = 'script' ) {
		$file_path = $this->block_dir . '/' . $file;
		$file_url  = get_template_directory_uri() . '/build/' . $this->get_block_name() . '/' . $file;

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
	 * @param string $query GraphQL query.
	 * @param array  $variables Query variables.
	 * @return array|WP_Error
	 */
	protected function get_graphql_data( $query, $variables = [] ) {
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
	 * @param string $handle Script handle.
	 * @param string $object_name Object name.
	 * @param array  $data Data to localize.
	 */
	protected function localize_script( $handle, $object_name, $data ) {
		wp_localize_script( $handle, $object_name, $data );
	}
}
