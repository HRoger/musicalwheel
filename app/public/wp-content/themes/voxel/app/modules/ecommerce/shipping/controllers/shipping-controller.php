<?php

namespace Voxel\Modules\Ecommerce\Shipping\Controllers;

use \Voxel\Modules\Ecommerce as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class Shipping_Controller extends \Voxel\Controllers\Base_Controller {

	protected function dependencies() {
		new Module\Shipping\Controllers\Frontend\Shipping_Checkout_Controller;
		new Module\Shipping\Controllers\Frontend\Shipping_Order_Controller;
		new Module\Shipping\Controllers\Frontend\Shipping_Actions_Controller;
		new Module\Shipping\Controllers\Backend\Shipping_Backend_Controller;
	}

	protected function hooks() {
		//
	}

}
