<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Is_Less_Than_Control extends Base_Control_Structure {

	public function get_key(): string {
		return 'is_less_than';
	}

	public function get_label(): string {
		return 'Is less than';
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Value',
		] );

		$this->define_arg( [
			'type' => 'select',
			'label' => 'Mode',
			'choices' => [ '' => 'Less than (<)', '<=' => 'Less than or equal to (<=)' ],
		] );
	}

	public function passes( bool $last_condition, string $value ): bool {
		$compare = $this->get_arg(0);
		$mode = $this->get_arg(1) === '<=' ? '<=' : '<';

		if ( ! ( is_numeric( $value ) && is_numeric( $compare ) ) ) {
			$value = strtotime( $value );
			$compare = strtotime( $compare );

			if ( ! ( is_numeric( $value ) && is_numeric( $compare ) ) ) {
				return false;
			}
		}

		if ( $mode === '<=' ) {
			return floatval( $value ) <= floatval( $compare );
		} else {
			return floatval( $value ) < floatval( $compare );
		}
	}
}
