<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class To_Age_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Get age';
	}

	public function get_key(): string {
		return 'to_age';
	}

	public function expects(): array {
		return [ static::TYPE_DATE ];
	}

	public function apply( string $value ): mixed {
		$timestamp = strtotime( $value );
		if ( ! $timestamp ) {
			return '';
		}

		$now = time();
		if ( $now < $timestamp ) {
			return '';
		}

		return (string) floor( ( $now - $timestamp ) / ( 365.25 * DAY_IN_SECONDS ) );
	}
}
