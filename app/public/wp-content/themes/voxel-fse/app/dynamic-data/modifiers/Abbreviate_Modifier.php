<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Abbreviate_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Abbreviate number';
	}

	public function get_key(): string {
		return 'abbreviate';
	}

	public function expects(): array {
		return [ static::TYPE_NUMBER ];
	}

	public function get_description(): string {
		return 'Simplifies large numbers e.g. 1k for 1000, 12.5k for 12500, and so on.';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Precision',
			'placeholder' => '1',
		] );
	}

	public function apply( string $value ): mixed {
		if ( ! is_numeric( $value ) ) {
			return $value;
		}

		$precision = $this->get_arg(0);
		if ( ! is_numeric( $precision ) ) {
			$precision = 1;
		}

		$result = \VoxelFSE\Dynamic_Data\abbreviate_number( $value, $precision );
		return $result !== null ? (string) $result : $value;
	}
}
