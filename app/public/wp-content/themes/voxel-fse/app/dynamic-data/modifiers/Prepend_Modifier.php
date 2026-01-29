<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Prepend_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Prepend text';
	}

	public function get_key(): string {
		return 'prepend';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Text to prepend',
		] );
	}

	public function apply( string $value ): mixed {
		return $this->get_arg(0) . $value;
	}
}
