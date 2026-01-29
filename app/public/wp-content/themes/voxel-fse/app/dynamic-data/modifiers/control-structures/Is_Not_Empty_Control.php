<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Is_Not_Empty_Control extends Base_Control_Structure {

	public function get_key(): string {
		return 'is_not_empty';
	}

	public function get_label(): string {
		return 'Is not empty';
	}

	public function passes( bool $last_condition, string $value ): bool {
		return $value !== '';
	}
}
