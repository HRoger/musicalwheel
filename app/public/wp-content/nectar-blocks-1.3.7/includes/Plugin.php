<?php

namespace Nectar;

use Nectar\Global_Settings\Global_Settings_Register;
use Nectar\Editor\Blocks;
use Nectar\Editor\Post_Meta;
use Nectar\API\Router;
use Nectar\Admin_Panel\Panel;
use Nectar\Render\Render;
use Nectar\Update\NectarBlocksUpdater;
use Nectar\Global_Sections\Global_Sections_Register;
use Nectar\Menu_Options\Menu_Options_Register;
use Nectar\Notifications\Notifications_Register;

class Plugin {
  function __construct() {}

  public function init() {
    $welcome = new Welcome();
    $global_settings = new Global_Settings_Register();
    $render = new Render();
    $blocks = new Blocks();
    $router = new Router();
    $post_meta = new Post_Meta();
    $global_sections = new Global_Sections_Register();
    $menu_options = new Menu_Options_Register();
    $notifications = new Notifications_Register();

    $adminPanel = new Panel();
    $updater = new NectarBlocksUpdater();
  }
}
