<?php
declare(strict_types=1);


// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Parser core
require_once MWFSE_PATH . '/app/dynamic-data/parser/Token_List.php';
require_once MWFSE_PATH . '/app/dynamic-data/parser/Tokenizer.php';
require_once MWFSE_PATH . '/app/dynamic-data/parser/Renderer.php';
require_once MWFSE_PATH . '/app/dynamic-data/parser/Tokens/Token.php';
require_once MWFSE_PATH . '/app/dynamic-data/parser/Tokens/Plain_Text.php';
require_once MWFSE_PATH . '/app/dynamic-data/parser/Tokens/Dynamic_Tag.php';

// Data groups
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/Base_Data_Group.php';
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/Post_Data_Group.php';
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/Site_Data_Group.php';

// User data group traits
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/user/Vendor_Data.php';
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/user/Membership_Data.php';
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/user/Visits_Data.php';

// User and Term data groups
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/User_Data_Group.php';
require_once MWFSE_PATH . '/app/dynamic-data/data-groups/Term_Data_Group.php';

// Config and helpers
require_once MWFSE_PATH . '/app/dynamic-data/MW_Config.php';
require_once MWFSE_PATH . '/app/dynamic-data/helpers.php';
require_once MWFSE_PATH . '/app/dynamic-data/rest-api.php';
require_once MWFSE_PATH . '/app/dynamic-data/block-renderer.php';

// Modifier base classes
require_once MWFSE_PATH . '/app/dynamic-data/modifiers/Base_Modifier.php';
require_once MWFSE_PATH . '/app/dynamic-data/modifiers/control-structures/Base_Control_Structure.php';

// Load all modifier files
$modifier_files = glob( MWFSE_PATH . '/app/dynamic-data/modifiers/*.php' );
foreach ( $modifier_files as $file ) {
	if ( basename( $file ) !== 'Base_Modifier.php' ) {
		require_once $file;
	}
}

// Load all control structure files
$control_structure_files = glob( MWFSE_PATH . '/app/dynamic-data/modifiers/control-structures/*.php' );
foreach ( $control_structure_files as $file ) {
	if ( basename( $file ) !== 'Base_Control_Structure.php' ) {
		require_once $file;
	}
}

/**
 * Render a dynamic tag expression string.
 *
 * @param string $expression
 * @param array|null $groups
 * @return string
 */
function mw_render( string $expression, ?array $groups = null ): string {
	if ( $groups === null ) {
		// Default groups - detect current context
		$current_user_id = get_current_user_id();
		$queried_object = get_queried_object();

		$groups = [
			'post' => new \VoxelFSE\Dynamic_Data\Data_Groups\Post_Data_Group(),
			'site' => new \VoxelFSE\Dynamic_Data\Data_Groups\Site_Data_Group(),
			'user' => \VoxelFSE\Dynamic_Data\Data_Groups\User_Data_Group::get( $current_user_id ),
		];

		// Add term group if we're on a term page
		if ( $queried_object instanceof \WP_Term ) {
			$groups['term'] = \VoxelFSE\Dynamic_Data\Data_Groups\Term_Data_Group::get(
				$queried_object->term_id,
				$queried_object->taxonomy
			);
		}
	}

	$renderer = new \VoxelFSE\Dynamic_Data\VoxelScript\Renderer( $groups );
	return $renderer->render( $expression );
}


