<?php

namespace EssentialBlocks\Pro\Core;

use EssentialBlocks\Pro\Utils\Installer;

class ConditionalMaintainance {
    /**
     * Holds the plugin instance.
     *
     * @since 1.0.0
     * @access private
     * @static
     *
     * @var static
     */
    protected static $instances = [];
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
    public static function get_instance( ...$args ) {
        if ( ! isset( self::$instances[static::class] ) ) {
            self::$instances[static::class] = ! empty( $args ) ? new static( ...$args ) : new static;
        }

        return self::$instances[static::class];
    }

    public function __construct() {
        $this->init( ESSENTIAL_BLOCKS_PRO_FILE );
        add_action( 'admin_notices', [$this, 'admin_notices'] );
    }

    /**
     * Init Maintenance
     *
     * @since 0.0.1
     * @return void
     */
    public function init( $plguin_basename ) {
        register_activation_hook( $plguin_basename, [__CLASS__, 'activation'] );
        register_uninstall_hook( $plguin_basename, [__CLASS__, 'uninstall'] );
    }

    /**
     * Runs on activation
     *
     * @since 2.0.1
     * @return void
     */
    public static function activation() {
        $installer = Installer::get_instance();
        $installer->install( [
            'slug'        => 'essential-blocks',
            'plugin_file' => 'essential-blocks/essential-blocks.php'
        ] );
    }

    /**
     * Runs on uninstallation.
     *
     * @since 2.0.1
     * @return void
     */
    public static function uninstall() {
    }

    public function admin_notices() {

        if ( file_exists( WP_PLUGIN_DIR . '/essential-blocks/essential-blocks.php' ) ) {
            $path       = 'essential-blocks/essential-blocks.php';
            $activeUrl  = wp_nonce_url( admin_url( 'plugins.php?action=activate&plugin=' . $path ), 'activate-plugin_' . $path );
            $buttonText = "Activate Essential Blocks";
        } else {
            $activeUrl  = wp_nonce_url( self_admin_url( 'update.php?action=install-plugin&plugin=essential-blocks' ), 'install-plugin_essential-blocks' );
            $buttonText = "Install Essential Blocks";
        }

        $message = sprintf(
            '<strong>Essential Blocks Pro</strong> requires <strong>Essential Blocks</strong> plugin to be active. Please activate <strong>Essential Blocks</strong> to continue.
            <div><a class="button button-primary" style="text-decoration: none;margin-top: 10px;" href="%1$s"><strong>%2$s</strong></a></div>',
            $activeUrl,
            $buttonText
        );

        $notice = sprintf(
            '<div style="padding: 10px;" class="%1$s-notice wpdeveloper-licensing-notice notice notice-error">%2$s</div>',
            'essential-blocks-pro',
            $message
        );

        echo wp_kses_post( $notice );
    }
}
