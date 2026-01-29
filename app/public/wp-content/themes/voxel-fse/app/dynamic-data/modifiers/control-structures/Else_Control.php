<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Else_Control extends Base_Control_Structure {

	public function get_key(): string {
		return 'else';
	}

	public function get_label(): string {
		return 'Else';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Content',
		] );
	}

	public function passes( bool $last_condition, string $value ): bool {
		return ! $last_condition;
	}

	public function apply( string $value ): mixed {
		return $this->get_arg(0);
	}
}
