<?php
declare(strict_types=1);

/**
 * FSE Base Controller
 *
 * Abstract base class for FSE controllers in the Voxel FSE theme.
 * Uses a different filename to avoid conflicts with parent theme's autoloader.
 *
 * @package VoxelFSE\Controllers
 * @since 1.0.0
 */

namespace VoxelFSE\Controllers;

if ( ! defined('ABSPATH') ) {
	exit;
}

abstract class FSE_Base_Controller {

	public function __construct() {
		if ( $this->authorize() ) {
			$this->dependencies();
			$this->hooks();
		}
	}

	/**
	 * Add controller hooks (actions, filters, etc.)
	 *
	 * @since 1.0.0
	 * @return void
	 */
	abstract protected function hooks(): void;

	/**
	 * Load controller dependencies (classes, files, etc.)
	 *
	 * @since 1.0.0
	 * @return void
	 */
	protected function dependencies(): void {
		//
	}

	/**
	 * Determine whether the controller should be loaded.
	 *
	 * @since 1.0.0
	 * @return bool True if controller should load, false otherwise.
	 */
	protected function authorize(): bool {
		return true;
	}

	/**
	 * Wrapper for `add_filter` which allows using protected
	 * methods as filter callbacks.
	 *
	 * @since 1.0.0
	 * @param string $tag Filter tag name.
	 * @param string|callable $function_to_add Callback function name (use '@method_name' for protected methods).
	 * @param int $priority Hook priority (default: 10).
	 * @param int $accepted_args Number of arguments accepted by callback (default: 1).
	 * @param bool $run_once Whether hook should only run once (default: false).
	 * @return void
	 */
	protected function filter( string $tag, string|callable $function_to_add, int $priority = 10, int $accepted_args = 1, bool $run_once = false ): void {
		if ( is_string( $function_to_add ) && substr( $function_to_add, 0, 1 ) === '@' ) {
			$method_name = substr( $function_to_add, 1 );
			add_filter( $tag, function() use ( $method_name, $run_once ) {
				static $ran;
				if ( $run_once && $ran === true ) {
					return;
				}

				$ran = true;
				return $this->{$method_name}( ...func_get_args() );
			}, $priority, $accepted_args );
		} else {
			add_filter( $tag, $function_to_add, $priority, $accepted_args );
		}
	}

	/**
	 * Wrapper for `add_action` which allows using protected
	 * methods as action callbacks.
	 *
	 * @since 1.0.0
	 * @param string $tag Action tag name.
	 * @param string|callable $function_to_add Callback function name (use '@method_name' for protected methods).
	 * @param int $priority Hook priority (default: 10).
	 * @param int $accepted_args Number of arguments accepted by callback (default: 1).
	 * @return void
	 */
	protected function on( string $tag, string|callable $function_to_add, int $priority = 10, int $accepted_args = 1 ): void {
		$this->filter( $tag, $function_to_add, $priority, $accepted_args );
	}

	/**
	 * Allows for adding an action hook that only runs once.
	 *
	 * @since 1.0.0
	 * @param string $tag Action tag name.
	 * @param string|callable $function_to_add Callback function name (use '@method_name' for protected methods).
	 * @param int $priority Hook priority (default: 10).
	 * @param int $accepted_args Number of arguments accepted by callback (default: 1).
	 * @return void
	 */
	protected function once( string $tag, string|callable $function_to_add, int $priority = 10, int $accepted_args = 1 ): void {
		$this->filter( $tag, $function_to_add, $priority, $accepted_args, true );
	}
}
