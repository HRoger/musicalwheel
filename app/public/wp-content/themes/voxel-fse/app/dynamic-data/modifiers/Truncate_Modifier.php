<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Truncate_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Truncate text';
	}

	public function get_key(): string {
		return 'truncate';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Max length',
			'placeholder' => '130',
		] );
	}

	public function apply( string $value ): mixed {
		$max_length = $this->get_arg(0);
		$length = absint( is_numeric( $max_length ) ? $max_length : 130 );
		return \VoxelFSE\Dynamic_Data\truncate_text( $value, $length );
	}
}
