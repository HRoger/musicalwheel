<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data\Data_Groups;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Base_Data_Group {

	/**
	 * Resolve a property path into a value.
	 *
	 * @since 1.0.0
	 * @param array $property_path Dot-separated path split into array segments.
	 * @param mixed $token         Optional reference to the current token.
	 * @return string|null Resolved property value or null.
	 */
	abstract public function resolve_property( array $property_path, mixed $token = null ): ?string;

	/**
	 * Get a modifier by key.
	 * Checks group-specific methods first, then falls back to common modifiers.
	 *
	 * @since 1.0.0
	 * @param string $modifier_key Modifier key identifier.
	 * @return \VoxelFSE\Dynamic_Data\Modifiers\Base_Modifier|null Modifier instance or null if not found.
	 */
	final public function get_modifier( string $modifier_key ): ?\VoxelFSE\Dynamic_Data\Modifiers\Base_Modifier {
		// 1. Check group-specific methods first
		$methods = $this->get_methods();
		if ( isset( $methods[ $modifier_key ] ) ) {
			return new $methods[ $modifier_key ];
		}

		// 2. Fall back to common modifiers
		$modifiers = static::get_common_modifiers();
		if ( isset( $modifiers[ $modifier_key ] ) ) {
			return new $modifiers[ $modifier_key ];
		}

		// 3. Not found
		return null;
	}

	/**
	 * Get common modifiers from Config.
	 *
	 * @return array
	 */
	protected static $common_modifiers;
	public static function get_common_modifiers(): array {
		if ( static::$common_modifiers === null ) {
			static::$common_modifiers = \VoxelFSE\Dynamic_Data\Config::get_modifiers();
		}

		return static::$common_modifiers;
	}

	/**
	 * Get group-specific methods (custom modifiers).
	 * Override this method to provide group-specific modifiers.
	 *
	 * @return array
	 */
	protected $methods_cache;
	public function get_methods(): array {
		if ( $this->methods_cache === null ) {
			$this->methods_cache = apply_filters(
				sprintf( 'voxel-fse/dynamic-data/groups/%s/methods', $this->get_type() ),
				$this->methods(),
				$this
			);
		}

		return $this->methods_cache;
	}

	/**
	 * Define group-specific methods.
	 * Override this method to provide custom modifiers for this data group.
	 *
	 * @return array
	 */
	protected function methods(): array {
		return [];
	}

	/**
	 * Get property aliases.
	 * Override this method to provide shortcuts for common properties.
	 *
	 * @return array<string, string> Map of alias => property_name
	 */
	protected function get_aliases(): array {
		return [];
	}

	/**
	 * Resolve alias to actual property name.
	 *
	 * @param string $property Property name (may be an alias).
	 * @return string Actual property name.
	 */
	public function resolve_alias( string $property ): string {
		$aliases = $this->get_aliases();
		return $aliases[ $property ] ?? $property;
	}

	/**
	 * Get data group type identifier.
	 * Must be implemented by child classes.
	 *
	 * @return string
	 */
	abstract public function get_type(): string;
}


