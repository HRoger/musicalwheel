<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Date_Format_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Date format';
	}

	public function get_key(): string {
		return 'date_format';
	}

	public function expects(): array {
		return [ static::TYPE_DATE ];
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Date format',
			'description' => 'Leave empty to use the format set in site options',
			'placeholder' => 'Y-m-d',
		] );
	}

	public function apply( string $value ): mixed {
		$timestamp = strtotime( $value );
		if ( $timestamp === false ) {
			return $value;
		}

		$format = $this->get_arg(0);
		if ( $format === '' ) {
			$format = function_exists( 'get_option' ) ? get_option( 'date_format' ) : 'Y-m-d';
		}

		// Use date_i18n if available (WordPress), otherwise use date
		if ( function_exists( 'date_i18n' ) ) {
			return date_i18n( $format, $timestamp );
		}
		return date( $format, $timestamp );
	}
}
