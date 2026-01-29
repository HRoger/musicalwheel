<?php

namespace Voxel\Modules\Ecommerce\Controllers;

use \Voxel\Modules\Ecommerce as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Ecommerce_Controller extends \Voxel\Controllers\Base_Controller {

	protected function dependencies() {
		require_once locate_template('app/modules/ecommerce/shipping/shipping.php');
	}

	protected function hooks() {
		//
	}

}
