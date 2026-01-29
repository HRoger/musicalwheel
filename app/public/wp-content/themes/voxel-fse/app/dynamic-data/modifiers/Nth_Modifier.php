<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Nth_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Nth item';
	}

	public function get_key(): string {
		return 'nth';
	}

	public function expects(): array {
		return [ static::TYPE_ARRAY ];
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Index (0-based)',
			'placeholder' => '0',
		] );
	}

	public function apply( string $value ): mixed {
		// Simplified implementation: works with comma-separated values
		// TODO: Enhance to work with loopable properties when property system is complete
		if ( empty( $value ) ) {
			return '';
		}

		$index = absint( $this->get_arg(0) );
		$items = explode( ',', $value );

		if ( ! isset( $items[ $index ] ) ) {
			return '';
		}

		return trim( $items[ $index ] );
	}
}
