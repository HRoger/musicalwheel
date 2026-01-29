<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Is_Not_Equal_To_Control extends Base_Control_Structure {

	public function get_key(): string {
		return 'is_not_equal_to';
	}

	public function get_label(): string {
		return 'Is not equal to';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Value',
		] );
	}

	public function passes( bool $last_condition, string $value ): bool {
		return $value !== $this->get_arg(0);
	}
}
