<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Count_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Count items';
	}

	public function get_key(): string {
		return 'count';
	}

	public function expects(): array {
		return [ static::TYPE_ARRAY ];
	}

	public function apply( string $value ): mixed {
		// Simplified implementation: works with comma-separated values
		// TODO: Enhance to work with loopable properties when property system is complete
		if ( empty( $value ) ) {
			return '0';
		}

		$items = explode( ',', $value );
		$items = array_filter( array_map( 'trim', $items ) );
		return (string) count( $items );
	}
}
