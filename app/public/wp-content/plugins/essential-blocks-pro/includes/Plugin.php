<?php

namespace EssentialBlocks\Pro;

use EssentialBlocks\Core\Blocks;
use EssentialBlocks\Pro\Utils\PostGrid;
use EssentialBlocks\Pro\Utils\WooProductGrid;
use EssentialBlocks\Utils\Enqueue;
use EssentialBlocks\Utils\Settings;
use EssentialBlocks\Pro\Admin\Admin;
use EssentialBlocks\Pro\Core\Scripts;
// use EssentialBlocks\Pro\Admin\FormResponseTable;
use EssentialBlocks\Pro\Core\PostMeta;
use EssentialBlocks\Traits\HasSingletone;
use EssentialBlocks\Pro\Core\FrontendStyles;
use EssentialBlocks\Pro\Integrations\FormPro;
use EssentialBlocks\Pro\Integrations\AdvSearch;
use EssentialBlocks\Pro\Integrations\DataTable;
use EssentialBlocks\Pro\Integrations\FancyChart;
use EssentialBlocks\Pro\Utils\FormBlockHandler;
use EssentialBlocks\Pro\Integrations\DynamicFields;
use EssentialBlocks\Pro\Integrations\PostGridSearch;
use EssentialBlocks\Pro\Core\DynamicTags\Acf\AcfData;
use EssentialBlocks\Pro\Core\DynamicTags\Post\PostFields;
use EssentialBlocks\Pro\Core\DynamicTags\Site\SiteFields;
use EssentialBlocks\Pro\Core\DynamicTags\HandleTagsResult;
use EssentialBlocks\Pro\Utils\ConditionalDisplay;
use EssentialBlocks\Pro\Utils\LiquidGlassRendererPro;

final class Plugin {
    use HasSingletone;

    public $admin;
    /**
     * Enqueue class responsible for assets
     * @var Enqueue
     */
    public $assets;

    /**
     * Settings
     * @var null|Settings
     */
    public static $settings = null;
    /**
     * Blocks
     * @var Blocks
     */
    public static $blocks;

    /**
     * Plugin constructor.
     * Initializing Templately plugin.
     *
     * @access private
     */
    public function __construct() {
        $this->define_constants();
        $this->set_locale();

        $this->load_admin_dependencies();

        $this->assets = new Enqueue( ESSENTIAL_BLOCKS_PRO_URL, ESSENTIAL_BLOCKS_PRO_DIR_PATH, ESSENTIAL_BLOCKS_PRO_VERSION );

        $this->admin = Admin::get_instance();
        // FormResponseTable::get_instance();

        Scripts::get_instance();

        // post grid
        PostGrid::get_instance();
        PostGridSearch::get_instance();

        //AdvSearch Ajax
        AdvSearch::get_instance();

        //ACF
        AcfData::get_instance();
        PostFields::get_instance();
        SiteFields::get_instance();

        //Handle Dynamic Tag results
        HandleTagsResult::get_instance();

        //DynamicFields Ajax
        DynamicFields::get_instance();
        // Data Table Ajax
        DataTable::get_instance();

        //Blocks Frontend Scripts & Styles
        FrontendStyles::get_instance();

        //Form AJAX & Validation rules for pro
        FormBlockHandler::get_instance();
        FormPro::get_instance();

        // Woo Product Grid
        WooProductGrid::get_instance();

        // Fancy Chart Ajax
        FancyChart::get_instance();

        // Conditional Display
        ConditionalDisplay::get_instance();

        // Liquid Glass Effect Pro Extension
        LiquidGlassRendererPro::get_instance();

        // Fetch Enabled Blocks if not than Default Block List
        $this->define_blocks();

        add_action( 'plugins_loaded', [$this, 'plugins_loaded'] );
        add_action( 'init', function () {
            /**
             * Register a meta `_eb_attr`
             */
            PostMeta::get_instance()->register_meta();
        } );
        /**
         * Initialize.
         */
        do_action( 'essential_blocks_pro::init' );
    }

    /**
     * Cloning is forbidden.
     *
     * @since 1.0
     */
    public function __clone() {
        _doing_it_wrong( __FUNCTION__, __( 'Cloning is forbidden.', 'essential-blocks-pro' ), '2.0' );
    }

    /**
     * Unserializing instances of this class is forbidden.
     *
     * @since 1.0
     */
    public function __wakeup() {
        _doing_it_wrong( __FUNCTION__, __( 'Unserializing instances of this class is forbidden.', 'essential-blocks-pro' ), '2.0' );
    }

    public function define_blocks() {
        add_filter( 'essential_blocks_block_path', function ( $path, $is_pro, $name, $wp_version_check ) {
            if ( $is_pro ) {
                $name      = str_replace( 'pro-', '', $name );
                $_pro_path = ESSENTIAL_BLOCKS_PRO_BLOCK_DIR . $name;
                if ( $wp_version_check && ESSENTIAL_BLOCKS_WP_VERSION < 5.8 ) {
                    $_pro_path = 'essential-blocks/' . $name;
                }

                return $_pro_path;
            }

            return $path;
        }, 10, 4 );

        add_filter( 'essential_blocks_block_lists', function ( $blocks ) {
            $default_blocks = $blocks;
            $_pro_blocks    = require ESSENTIAL_BLOCKS_PRO_DIR_PATH . 'includes/blocks.php';
            return array_merge( $default_blocks, array_replace_recursive( $blocks, $_pro_blocks ) );
        }, 11, 1 );
    }

    /**
     * Initializing Things on Plugins Loaded
     * @return void
     */
    public function plugins_loaded() {
    }

    /**
     * Define CONSTANTS
     *
     * @since 1.0.0
     * @return void
     */
    public function define_constants() {
        $this->define( 'ESSENTIAL_BLOCKS_PRO_NAME', 'essential-blocks-pro' );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_DIR_PATH', plugin_dir_path( ESSENTIAL_BLOCKS_PRO_FILE ) );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_BLOCK_DIR', ESSENTIAL_BLOCKS_PRO_DIR_PATH . '/assets/blocks/' );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_URL', plugin_dir_url( ESSENTIAL_BLOCKS_PRO_FILE ) );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_ADMIN_URL', plugin_dir_url( ESSENTIAL_BLOCKS_PRO_FILE ) );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_PLUGIN_BASENAME', plugin_basename( ESSENTIAL_BLOCKS_PRO_FILE ) );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_SITE_URL', 'https://essential-blocks.com/' );
        $this->define( 'ESSENTIAL_BLOCKS_DYNAMIC_TAGS', 'eb-dynamic-tags' );

        $this->define( 'ESSENTIAL_BLOCKS_PRO_SL_ITEM_ID', 1677666 );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_SL_ITEM_NAME', 'Essential Blocks Pro' );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_SL_ITEM_SLUG', 'essential-blocks-pro' );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_STORE_URL', 'https://api.wpdeveloper.com/' );
        $this->define( 'ESSENTIAL_BLOCKS_PRO_SL_DB_PREFIX', 'essential_blocks_pro_software_' );
    }

    /**
     * Define constant if not already set.
     *
     * @param string      $name  Constant name.
     * @param mixed $value Constant value.
     *
     * @return void
     */
    private function define( $name, $value ) {
        if ( ! defined( $name ) ) {
            define( $name, $value );
        }
    }

    /**
     * Setting the locale for translation availability
     * @since 1.0.0
     * @return void
     */
    public function set_locale() {
        add_action( 'init', [$this, 'load_textdomain'] );
    }

    /**
     * Loading Text Domain on init HOOK
     * @since 1.0.0
     *
     * @return void
     */
    public function load_textdomain() {
        load_plugin_textdomain( 'essential-blocks-pro', false, dirname( ESSENTIAL_BLOCKS_PRO_PLUGIN_BASENAME ) . '/languages' );
    }

    private function load_admin_dependencies() {
        //Load Form Block response table
        require_once ESSENTIAL_BLOCKS_PRO_DIR_PATH . 'includes/Admin/FormResponseTable.php';
    }
}
