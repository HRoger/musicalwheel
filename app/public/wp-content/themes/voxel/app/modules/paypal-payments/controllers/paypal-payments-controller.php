<?php

namespace Voxel\Modules\PayPal_Payments\Controllers;

use Voxel\Modules\PayPal_Payments as Module;

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Payments_Controller extends \Voxel\Controllers\Base_Controller {

	protected function dependencies() {
		new Backend\PayPal_Settings_Controller;
		new Frontend\PayPal_Frontend_Controller;
		new Frontend\PayPal_Webhooks_Controller;
		new Frontend\PayPal_Order_Controller;
	}

	protected function hooks() {
		$this->filter( 'voxel/product-types/payment-services', '@register_payment_service' );
		$this->filter( 'voxel/product-types/payment-methods', '@register_payment_methods' );
	}

	protected function register_payment_service( $payment_services ) {
		$payment_services['paypal'] = new Module\PayPal_Payment_Service;

		return $payment_services;
	}

	protected function register_payment_methods( $payment_methods ) {
		$payment_methods['paypal_payment'] = Module\Payment_Methods\PayPal_Payment::class;
		$payment_methods['paypal_subscription'] = Module\Payment_Methods\PayPal_Subscription::class;

		return $payment_methods;
	}

}

