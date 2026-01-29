<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Fallback_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Fallback';
	}

	public function get_key(): string {
		return 'fallback';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Fallback text',
		] );
	}

	public function apply( string $value ): mixed {
		if ( $value !== '' ) {
			return $value;
		}

		return $this->get_arg(0);
	}
}
