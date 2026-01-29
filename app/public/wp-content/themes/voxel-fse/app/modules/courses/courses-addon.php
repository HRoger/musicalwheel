<?php
declare(strict_types=1);

/**
 * Courses Addon Module
 *
 * Extends Voxel with a Courses addon without forking the theme.
 * This is a test to validate the child-theme + plugin strategy.
 *
 * @package MusicalWheel\Modules\Courses
 * @since 1.0.8
 */

namespace VoxelFSE\Modules\Courses;

use \Voxel\Utils\Config_Schema\Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Courses addon in Voxel's settings schema
 *
 * This filter is used by Voxel to build the settings schema.
 * The filter receives an array with Schema objects as values.
 */
add_filter( 'voxel/global-settings/register', function( $settings_array ) {
	// Add courses to the addons schema
	// The addons key contains a Data_Object instance
	if ( isset( $settings_array['addons'] ) && $settings_array['addons'] instanceof \Voxel\Utils\Config_Schema\Data_Object ) {
		$settings_array['addons']->set_prop( 'courses', Schema::Object( [
			'enabled' => Schema::Bool()->default( false ),
		] ) );
	}

	return $settings_array;
}, 10 );
