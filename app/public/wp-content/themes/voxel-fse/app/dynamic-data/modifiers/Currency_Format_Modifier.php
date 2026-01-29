<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Currency_Format_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Currency format';
	}

	public function get_key(): string {
		return 'currency_format';
	}

	public function expects(): array {
		return [ static::TYPE_NUMBER ];
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Currency',
			'placeholder' => 'USD',
			'description' => 'Currency code (e.g., USD, EUR, GBP)',
		] );

		$this->define_arg( [
			'type' => 'select',
			'label' => 'Amount is in cents',
			'choices' => [ '' => 'No', '1' => 'Yes' ],
		] );
	}

	public function apply( string $value ): mixed {
		if ( ! is_numeric( $value ) ) {
			return $value;
		}

		$amount_is_in_cents = !! $this->get_arg(1);
		$currency = $this->get_arg(0);

		if ( empty( $currency ) ) {
			$currency = 'USD';
		}

		// Convert from cents to dollars if needed
		if ( $amount_is_in_cents ) {
			$value = $value / 100;
		}

		// Simple currency formatting
		// TODO: Enhance with proper currency support (symbols, positions, etc.)
		if ( function_exists( 'number_format_i18n' ) ) {
			$formatted = number_format_i18n( $value, 2 );
		} else {
			$formatted = number_format( (float) $value, 2 );
		}
		return $currency . ' ' . $formatted;
	}
}
