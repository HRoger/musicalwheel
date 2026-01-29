<?php
declare(strict_types=1);


namespace VoxelFSE\Dynamic_Data;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Config {

	/**
	 * Get all registered modifiers.
	 *
	 * @return array Associative array of modifier_key => class_name
	 */
	public static function get_modifiers(): array {
		static $list = null;

		if ( $list === null ) {
			$list = apply_filters( 'voxel-fse/dynamic-data/modifiers', [
				// Text Modifiers (11)
				'append' => \VoxelFSE\Dynamic_Data\Modifiers\Append_Modifier::class,
				'prepend' => \VoxelFSE\Dynamic_Data\Modifiers\Prepend_Modifier::class,
				'truncate' => \VoxelFSE\Dynamic_Data\Modifiers\Truncate_Modifier::class,
				'capitalize' => \VoxelFSE\Dynamic_Data\Modifiers\Capitalize_Modifier::class,
				'abbreviate' => \VoxelFSE\Dynamic_Data\Modifiers\Abbreviate_Modifier::class,
				'replace' => \VoxelFSE\Dynamic_Data\Modifiers\Replace_Modifier::class,
				'list' => \VoxelFSE\Dynamic_Data\Modifiers\List_Modifier::class,
				'first' => \VoxelFSE\Dynamic_Data\Modifiers\First_Modifier::class,
				'last' => \VoxelFSE\Dynamic_Data\Modifiers\Last_Modifier::class,
				'nth' => \VoxelFSE\Dynamic_Data\Modifiers\Nth_Modifier::class,
				'count' => \VoxelFSE\Dynamic_Data\Modifiers\Count_Modifier::class,

				// Number Modifiers (3)
				'number_format' => \VoxelFSE\Dynamic_Data\Modifiers\Number_Format_Modifier::class,
				'currency_format' => \VoxelFSE\Dynamic_Data\Modifiers\Currency_Format_Modifier::class,
				'round' => \VoxelFSE\Dynamic_Data\Modifiers\Round_Modifier::class,

				// Date Modifiers (3)
				'date_format' => \VoxelFSE\Dynamic_Data\Modifiers\Date_Format_Modifier::class,
				'time_diff' => \VoxelFSE\Dynamic_Data\Modifiers\Time_Diff_Modifier::class,
				'to_age' => \VoxelFSE\Dynamic_Data\Modifiers\To_Age_Modifier::class,

				// Other (1)
				'fallback' => \VoxelFSE\Dynamic_Data\Modifiers\Fallback_Modifier::class,

				// Control Structures (13)
				'is_empty' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Empty_Control::class,
				'is_not_empty' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Not_Empty_Control::class,
				'is_equal_to' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Equal_To_Control::class,
				'is_not_equal_to' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Not_Equal_To_Control::class,
				'is_greater_than' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Greater_Than_Control::class,
				'is_less_than' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Less_Than_Control::class,
				'is_between' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Between_Control::class,
				'is_checked' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Checked_Control::class,
				'is_unchecked' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Is_Unchecked_Control::class,
				'contains' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Contains_Control::class,
				'does_not_contain' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Does_Not_Contain_Control::class,
				'then' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Then_Control::class,
				'else' => \VoxelFSE\Dynamic_Data\Modifiers\Control_Structures\Else_Control::class,
			] );
		}

		return $list;
	}

	/**
	 * Get all registered data groups.
	 *
	 * @return array Associative array of group_key => class_name
	 */
	public static function get_data_groups(): array {
		static $list = null;

		if ( $list === null ) {
			$list = apply_filters( 'voxel-fse/dynamic-data/groups', [
				'post' => \VoxelFSE\Dynamic_Data\Data_Groups\Post_Data_Group::class,
				'site' => \VoxelFSE\Dynamic_Data\Data_Groups\Site_Data_Group::class,
				'user' => \VoxelFSE\Dynamic_Data\Data_Groups\User_Data_Group::class,
				'term' => \VoxelFSE\Dynamic_Data\Data_Groups\Term_Data_Group::class,
			] );
		}

		return $list;
	}
}
