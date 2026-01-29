<?php
/**
 * Copyright (C) 2014-2025 ServMask Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Attribution: This code is part of the All-in-One WP Migration plugin, developed by
 *
 * ███████╗███████╗██████╗ ██╗   ██╗███╗   ███╗ █████╗ ███████╗██╗  ██╗
 * ██╔════╝██╔════╝██╔══██╗██║   ██║████╗ ████║██╔══██╗██╔════╝██║ ██╔╝
 * ███████╗█████╗  ██████╔╝██║   ██║██╔████╔██║███████║███████╗█████╔╝
 * ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██║╚██╔╝██║██╔══██║╚════██║██╔═██╗
 * ███████║███████╗██║  ██║ ╚████╔╝ ██║ ╚═╝ ██║██║  ██║███████║██║  ██╗
 * ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
 */

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Kangaroos cannot jump here' );
}

// Include all the files that you want to load in here
if ( defined( 'WP_CLI' ) ) {
	require_once AI1WMME_VENDOR_PATH . '/servmask/command/ai1wm-wp-cli.php';
}

require_once AI1WMME_VENDOR_PATH . '/servmask/pro/ai1wmve.php';

require_once AI1WMME_CONTROLLER_PATH . '/class-ai1wmme-export-controller.php';
require_once AI1WMME_CONTROLLER_PATH . '/class-ai1wmme-import-controller.php';
require_once AI1WMME_CONTROLLER_PATH . '/class-ai1wmme-main-controller.php';
require_once AI1WMME_CONTROLLER_PATH . '/class-ai1wmme-settings-controller.php';

require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-config-file.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-config.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-database.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-enumerate-content.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-enumerate-media.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-enumerate-plugins.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-enumerate-tables.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-enumerate-themes.php';
require_once AI1WMME_MODEL_PATH . '/export/class-ai1wmme-export-retention.php';

require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-blogs.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-confirm.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-database.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-done.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-options.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-sitemeta.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-upload.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-usermeta.php';
require_once AI1WMME_MODEL_PATH . '/import/class-ai1wmme-import-users.php';

require_once AI1WMME_MODEL_PATH . '/class-ai1wmme-settings.php';
