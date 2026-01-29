<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Time_Diff_Modifier extends Base_Modifier {

	public function get_label(): string {
		return 'Time diff';
	}

	public function get_key(): string {
		return 'time_diff';
	}

	public function expects(): array {
		return [ static::TYPE_DATE ];
	}

	protected function define_args(): void {
		$this->define_arg( [
			'type' => 'text',
			'label' => 'Timezone to compare against',
			'description' => 'Enter the timezone identifier e.g. "Europe/London", or an offset e.g. "+02:00". Leave empty to use the timezone set in site options.',
		] );
	}

	public function apply( string $value ): mixed {
		$timestamp = strtotime( $value );
		if ( ! $timestamp ) {
			return $value;
		}

		try {
			$timezone_arg = $this->get_arg(0);
			$timezone = ! empty( $timezone_arg ) ? new \DateTimeZone( $timezone_arg ) : wp_timezone();
		} catch ( \Exception $e ) {
			$timezone = wp_timezone();
		}

		// Get current UTC time
		$utc = new \DateTime( 'now', new \DateTimeZone( 'UTC' ) );

		return human_time_diff( $timestamp, time() + $timezone->getOffset( $utc ) );
	}
}
