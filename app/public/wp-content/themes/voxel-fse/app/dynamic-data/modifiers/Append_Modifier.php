<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Append_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Append text';
	}

	public function get_key(): string {
		return 'append';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Text to append',
		] );
	}

	public function apply( string $value ): mixed {
		return $value . $this->get_arg(0);
	}
}
