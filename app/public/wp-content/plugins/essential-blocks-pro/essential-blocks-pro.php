<?php
/**
 * Plugin Name:     Essential Blocks Pro
 * Plugin URI:      https://essential-blocks.com
 * Description:     The ultimate library for free & premium Gutenberg blocks to supercharge your WordPress website. Find exclusive PRO blocks & features such as Woo Product Carousel, Advanced Search, and many more.
 * Author:          WPDeveloper
 * Author URI:      https://wpdeveloper.com
 * Text Domain:     essential-blocks-pro
 * Domain Path:     /languages
 * Version:         2.6.1
 *
 * @package         EssentialBlocks\Pro\Plugin
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

update_option( 'essential_blocks_pro_software__license', 'c76a5e84-e4bd-ee52-7e27-4ea30c680d79' );
update_option( 'essential_blocks_pro_software__license_status', 'valid' );

// Define things
define( 'ESSENTIAL_BLOCKS_PRO_FILE', __FILE__ );
define( 'ESSENTIAL_BLOCKS_PRO_VERSION', '2.6.1' );
define( 'ESSENTIAL_BLOCKS_REQUIRED_VERSION', '5.6.1' );

//Table Name constants
global $wpdb;
define( 'ESSENTIAL_BLOCKS_FORM_ENTRIES_TABLE', $wpdb->prefix . 'eb_form_entries' );
define( 'ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE', $wpdb->prefix . 'eb_search_keywords' );

require_once __DIR__ . '/vendor/autoload.php';
include_once ABSPATH . 'wp-admin/includes/plugin.php';

use EssentialBlocks\Pro\Core\Maintenance;
use EssentialBlocks\Pro\Core\ConditionalMaintainance;

//If Essential Blocks Free plugin is active, Run Pro Maintainance Function while Activate Pro
if ( function_exists( 'is_plugin_active' ) && is_plugin_active( 'essential-blocks/essential-blocks.php' ) ) {
    Maintenance::get_instance();
} else {
    ConditionalMaintainance::get_instance();
}

//If Essential Blocks Free plugin is loaded, Run Pro
function wpdev_essential_blocks_pro()
{
    if ( ! did_action( 'essential_blocks::init' ) ) {
        return;
    }

    return EssentialBlocks\Pro\Plugin::get_instance();
}

add_action( 'plugins_loaded', 'wpdev_essential_blocks_pro' );
