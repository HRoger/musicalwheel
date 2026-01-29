<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

abstract class Base_Modifier {

	protected
		$args,
		$renderer,
		$tag,
		$defined_args;

	protected $current_value = '';

	// Type constants
	const TYPE_DATE = 'date';
	const TYPE_ARRAY = 'array';
	const TYPE_NUMBER = 'number';
	const TYPE_STRING = 'string';

	/**
	 * Get modifier type.
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'modifier';
	}

	/**
	 * Get expected input types.
	 *
	 * @return array
	 */
	public function expects(): array {
		return [ static::TYPE_STRING ];
	}

	/**
	 * Get modifier key (e.g., 'truncate').
	 *
	 * @return string
	 */
	abstract public function get_key(): string;

	/**
	 * Get modifier label (human-readable).
	 *
	 * @return string
	 */
	abstract public function get_label(): string;

	/**
	 * Get modifier description.
	 *
	 * @return string
	 */
	public function get_description(): string {
		return '';
	}

	/**
	 * Apply modifier transformation.
	 *
	 * @since 1.0.0
	 * @param string $value Input value to transform.
	 * @return mixed Transformed value.
	 */
	abstract public function apply( string $value ): mixed;

	/**
	 * Set modifier arguments.
	 *
	 * @since 1.0.0
	 * @param array $args Modifier arguments.
	 * @return void
	 */
	public function set_args( array $args ): void {
		$this->args = $args;
	}

	/**
	 * Get argument by index with dynamic argument support.
	 *
	 * @param int $index
	 * @return string
	 */
	public function get_arg( int $index ): string {
		$arg = $this->args[ $index ] ?? null;
		if ( $arg === null ) {
			return '';
		}

		$content = $arg['content'];

		// Handle dynamic arguments (nested tags)
		if ( $arg['dynamic'] ?? false ) {
			$content = $this->renderer->render( $content, [
				'parent' => $this,
			] );
		}

		return $content;
	}

	/**
	 * Set renderer instance.
	 *
	 * @since 1.0.0
	 * @param \VoxelFSE\Dynamic_Data\VoxelScript\Renderer $renderer Renderer instance.
	 * @return void
	 */
	public function set_renderer( \VoxelFSE\Dynamic_Data\VoxelScript\Renderer $renderer ): void {
		$this->renderer = $renderer;
	}

	/**
	 * Set tag instance.
	 *
	 * @since 1.0.0
	 * @param \VoxelFSE\Dynamic_Data\VoxelScript\Tokens\Dynamic_Tag $tag Tag instance.
	 * @return void
	 */
	public function set_tag( \VoxelFSE\Dynamic_Data\VoxelScript\Tokens\Dynamic_Tag $tag ): void {
		$this->tag = $tag;
	}

	/**
	 * Set current value being processed.
	 *
	 * @param string $current_value
	 */
	public function set_current_value( string $current_value ): void {
		$this->current_value = $current_value;
	}

	/**
	 * Get current value being processed.
	 *
	 * @return string
	 */
	public function get_current_value(): string {
		return $this->current_value;
	}

	/**
	 * Define modifier arguments.
	 * Override this method to define parameters.
	 */
	protected function define_args(): void {
		//
	}

	/**
	 * Define a single argument.
	 *
	 * @param array $data
	 */
	final protected function define_arg( array $data ): void {
		if ( $this->defined_args === null ) {
			$this->defined_args = [];
		}

		$this->defined_args[] = $data;
	}

	/**
	 * Get defined arguments.
	 *
	 * @return array
	 */
	final public function get_defined_args(): array {
		if ( $this->defined_args === null ) {
			$this->defined_args = [];
			$this->define_args();
		}

		return $this->defined_args;
	}

	/**
	 * Get editor configuration.
	 * Used for UI/editor integration.
	 *
	 * @return array
	 */
	public function get_editor_config(): array {
		return [
			'key' => $this->get_key(),
			'label' => $this->get_label(),
			'description' => $this->get_description(),
			'type' => $this->get_type(),
			'expects' => $this->expects(),
			'arguments' => array_map( function( $argument ) {
				$argument['value'] = '';
				return $argument;
			}, $this->get_defined_args() ),
		];
	}
}
