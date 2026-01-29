<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Modifiers\Control_Structures;

if ( ! defined('ABSPATH') ) {
	exit;
}

abstract class Base_Control_Structure extends \VoxelFSE\Dynamic_Data\Modifiers\Base_Modifier {

	/**
	 * Get modifier type (control-structure).
	 *
	 * @return string
	 */
	public function get_type(): string {
		return 'control-structure';
	}

	/**
	 * Apply method for control structures.
	 * Control structures don't transform the value, they only affect flow.
	 *
	 * @param string $value
	 * @return mixed
	 */
	public function apply( string $value ): mixed {
		return $value;
	}

	/**
	 * Determine if the condition passes.
	 * This method controls the flow of modifier execution.
	 *
	 * @param bool $last_condition The result of the previous control structure
	 * @param string $value The current value being processed
	 * @return bool True if the condition passes, false otherwise
	 */
	public function passes( bool $last_condition, string $value ): bool {
		return true;
	}
}
