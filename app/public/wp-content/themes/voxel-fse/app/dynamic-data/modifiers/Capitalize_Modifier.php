<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Capitalize_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Capitalize';
	}

	public function get_key(): string {
		return 'capitalize';
	}

	public function apply( string $value ): mixed {
		return ucwords( $value );
	}
}
