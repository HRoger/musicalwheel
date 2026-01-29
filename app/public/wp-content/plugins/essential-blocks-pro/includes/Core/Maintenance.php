<?php

namespace EssentialBlocks\Pro\Core;

use EssentialBlocks\Core\Blocks;
use EssentialBlocks\Pro\Utils\Installer;

class Maintenance
{
    /**
     * Holds the plugin instance.
     *
     * @since 1.0.0
     * @access private
     * @static
     *
     * @var static
     */
    protected static $instances = [  ];
    /**
     * Sets up a single instance of the plugin.
     *
     * @since 1.0.0
     * @access public
     * @var mixed $args
     *
     * @static
     *
     * @return static An instance of the class.
     */
    public static function get_instance( ...$args )
    {
        if ( ! isset( self::$instances[ static::class ] ) ) {
            self::$instances[ static::class ] = ! empty( $args ) ? new static( ...$args ) : new static;
        }

        return self::$instances[ static::class ];
    }

    public function __construct()
    {
        add_action( 'admin_init', [ $this, 'update_actions' ], 5 );
        $this->init( ESSENTIAL_BLOCKS_PRO_FILE );

        //Free required version compare
        $_required_version = ESSENTIAL_BLOCKS_REQUIRED_VERSION;
        $_free_version     = get_option( 'essential_blocks_version' );
        if ( version_compare( $_free_version, $_required_version, '<' ) ) {
            add_action( 'admin_notices', [ $this, 'admin_notices_for_required_version' ] );
        }
        //
    }

    public function update_actions()
    {
        if ( wp_doing_ajax() ) {
            return;
        }

        $_version        = get_option( 'essential_blocks_pro_version' );
        $_code_version   = ESSENTIAL_BLOCKS_PRO_VERSION;
        $requires_update = version_compare( $_version, $_code_version, '<' );

        if ( $requires_update ) {
            // Version Updated in DB.
            $this->update_version();

            //if version is updated, run actions
            update_option( 'essential_all_blocks', Blocks::defaults() );
            self::db_eb_create_tables();

            //Install Templately
            $status = get_option( 'essential_blocks_pro_templately_install' );
            if ( ! is_plugin_active( 'templately/templately.php' ) && ! $status ) {
                $installer = Installer::get_instance();
                $installer->install( [
                    'slug'        => 'templately',
                    'plugin_file' => 'templately/templately.php'
                 ] );
                update_option( 'essential_blocks_pro_templately_install', true );
            }
        }
    }

    /**
     * Update WC version to current.
     */
    private function update_version()
    {
        update_option( 'essential_blocks_pro_version', ESSENTIAL_BLOCKS_PRO_VERSION );
    }

    /**
     * Init Maintenance
     *
     * @since 0.0.1
     * @return void
     */
    public function init( $plguin_basename )
    {
        register_activation_hook( $plguin_basename, [ __CLASS__, 'activation' ] );
        register_uninstall_hook( $plguin_basename, [ __CLASS__, 'uninstall' ] );
    }

    /**
     * Runs on activation
     *
     * @since 2.0.1
     * @return void
     */
    public static function activation()
    {
        update_option( 'essential_all_blocks', Blocks::defaults() );
        self::db_eb_create_tables();
    }

    /**
     * Runs on uninstallation.
     *
     * @since 2.0.1
     * @return void
     */
    public static function uninstall()
    {
    }

    public function admin_notices_for_required_version()
    {

        $message = sprintf(
            '<strong>Essential Blocks Pro <code>v%1$s</code></strong> requires <strong>Essential Blocks <code>v%2$s</code></strong>. Please update <strong>Essential Blocks</strong> to use pro features.
            <div><a class="button button-primary" style="text-decoration: none;margin-top: 10px;" href="%3$s"><strong>Update Essential Blocks</strong></a></div>',
            ESSENTIAL_BLOCKS_PRO_VERSION,
            ESSENTIAL_BLOCKS_REQUIRED_VERSION,
            admin_url( 'plugins.php' ),
        );

        $notice = sprintf(
            '<div style="padding: 10px;" class="%1$s-notice wpdeveloper-licensing-notice notice notice-error">%2$s</div>',
            'essential-blocks-pro',
            $message
        );

        echo wp_kses_post( $notice );
    }

    private static function db_eb_create_tables()
    {

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        global $wpdb;
        $prefix          = $wpdb->prefix;
        $charset_collate = $wpdb->get_charset_collate();

        //Create Table "eb_search_keywords"
        $sql = 'CREATE TABLE ' . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . ' (
			    id BIGINT AUTO_INCREMENT,
			    keyword VARCHAR(255) NOT NULL,
			    count INT NOT NULL,
			    is_found TINYINT(1) DEFAULT 1,
			    PRIMARY KEY (id),
			    KEY keyword (keyword)
			) ' . $charset_collate;
        // dbDelta( $sql );
        $create = maybe_create_table( ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE, $sql );
        if ( ! $create ) {
            error_log( 'Table "' . ESSENTIAL_BLOCKS_SEARCH_KEYWORD_TABLE . '" couldn\'t be created for Essential Blocks Pro. Please contact with plugin author.' );
        }

        //Create Table for Entries
        $sql = 'CREATE TABLE ' . ESSENTIAL_BLOCKS_FORM_ENTRIES_TABLE . ' (
				id INT AUTO_INCREMENT,
				block_id VARCHAR(255) NOT NULL,
				response TEXT NOT NULL,
				email_status TINYINT(1) NOT NULL,
				created_at DATETIME NOT NULL,
			    PRIMARY KEY (id)
			) ' . $charset_collate;
        // dbDelta( $sql );
        $create = maybe_create_table( ESSENTIAL_BLOCKS_FORM_ENTRIES_TABLE, $sql );
        if ( ! $create ) {
            error_log( 'Table "' . ESSENTIAL_BLOCKS_FORM_ENTRIES_TABLE . '" couldn\'t be created for Essential Blocks Pro. Please contact with plugin author.' );
        }
    }
}
