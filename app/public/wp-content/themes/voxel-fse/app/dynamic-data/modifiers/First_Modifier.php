<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class First_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'First item';
	}

	public function get_key(): string {
		return 'first';
	}

	public function expects(): array {
		return [ static::TYPE_ARRAY ];
	}

	public function apply( string $value ): mixed {
		// Simplified implementation: works with comma-separated values
		// TODO: Enhance to work with loopable properties when property system is complete
		if ( empty( $value ) ) {
			return '';
		}

		$items = explode( ',', $value );
		$first = array_shift( $items );
		return $first !== null ? trim( $first ) : '';
	}
}
