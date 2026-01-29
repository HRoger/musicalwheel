<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Does_Not_Contain_Control extends Base_Control_Structure {

	public function get_key(): string {
		return 'does_not_contain';
	}

	public function get_label(): string {
		return 'Does not contain';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Value',
		] );
	}

	public function passes( bool $last_condition, string $value ): bool {
		return mb_stripos( $value, $this->get_arg(0) ) === false;
	}
}
