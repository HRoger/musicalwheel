<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Round_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Round number';
	}

	public function get_key(): string {
		return 'round';
	}

	public function expects(): array {
		return [ static::TYPE_NUMBER ];
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Decimals',
			'description' => 'Specify the number of decimal places to round to. Negative values round to positions before the decimal point. Default: 0.',
		] );
	}

	public function apply( string $value ): mixed {
		if ( ! is_numeric( $value ) ) {
			return $value;
		}

		$decimals = $this->get_arg(0);
		if ( ! is_numeric( $decimals ) ) {
			$decimals = 0;
		}

		$decimals = (int) $decimals;

		return (string) round( $value, $decimals );
	}
}
