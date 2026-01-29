<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Number_Format_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Number format';
	}

	public function get_key(): string {
		return 'number_format';
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

		if ( $decimals < 0 ) {
			$exp = abs( (int) $decimals );
			$rounded = round( $value / pow( 10, $exp ) ) * pow( 10, $exp );

			// Use number_format_i18n if available (WordPress), otherwise use number_format
			if ( function_exists( 'number_format_i18n' ) ) {
				$formatted = number_format_i18n( $rounded, 0 );
				if ( ! is_null( $formatted ) ) {
					$value = $formatted;
				}
			} else {
				$value = number_format( $rounded, 0 );
			}

			return $value;
		} else {
			// Use number_format_i18n if available (WordPress), otherwise use number_format
			if ( function_exists( 'number_format_i18n' ) ) {
				$formatted = number_format_i18n( $value, $decimals );
				if ( ! is_null( $formatted ) ) {
					$value = $formatted;
				}
			} else {
				$value = number_format( (float) $value, (int) $decimals );
			}

			return $value;
		}
	}
}
