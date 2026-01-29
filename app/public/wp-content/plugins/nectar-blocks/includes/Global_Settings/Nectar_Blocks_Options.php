<?php

namespace Nectar\Global_Settings;

use Nectar\Global_Settings\Settings_Base;
use Nectar\Utilities\Log;

/**
 * Nectar Blocks Options.
 * @version 0.0.4
 * @since 0.0.4
 */
class Nectar_Blocks_Options extends Settings_Base {
  public static $OPTION_NAME = 'nectar_blocks_options';

  function __construct() {
    add_action( 'after_setup_theme', [ $this, 'initialize_defaults' ] );
  }

  public function initialize_defaults() {
    $nectar_options = get_option($this::$OPTION_NAME);

    if ($nectar_options !== false) {
      return;
    }

    update_option(
        $this::$OPTION_NAME,
        $this->defaults()
    );
    Log::debug('Default nectar_options initialized');
  }

  /**
   * Provides defaults for global options.
   */
  private function defaults() {
    return [
      // Licensing
      'licenseKey' => '',
      'isLicenseActive' => false,
      'token' => '',
      // Settings
      'autoUpdate' => false,
      'analytics' => false,
      'bugReports' => true
    ];
  }
}
