<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Replace_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Replace text';
	}

	public function get_key(): string {
		return 'replace';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Search',
		] );

		$this->define_arg( [
			'type' => 'text',
			'label' => 'Replace with',
		] );
	}

	public function apply( string $value ): mixed {
		return str_ireplace( $this->get_arg(0), $this->get_arg(1), $value );
	}
}
