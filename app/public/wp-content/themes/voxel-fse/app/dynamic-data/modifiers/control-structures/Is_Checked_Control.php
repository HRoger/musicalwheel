<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Is_Checked_Control extends Base_Control_Structure {

	public function get_key(): string {
		return 'is_checked';
	}

	public function get_label(): string {
		return 'Is checked';
	}

	public function passes( bool $last_condition, string $value ): bool {
		return $value !== '';
	}
}
