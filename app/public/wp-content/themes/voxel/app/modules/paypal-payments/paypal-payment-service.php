<?php

namespace Voxel\Modules\PayPal_Payments;

use \Voxel\Modules\PayPal_Payments as Module;
use \Voxel\Utils\Config_Schema\{Schema, Data_Object};

if ( ! defined('ABSPATH') ) {
	exit;
}

class PayPal_Payment_Service extends \Voxel\Product_Types\Payment_Services\Base_Payment_Service {

	public function get_key(): string {
		return 'paypal';
	}

	public function get_label(): string {
		return 'PayPal';
	}

	public function get_description(): ?string {
		return 'Sell digital, physical and subscription products with PayPal';
	}

	public function is_test_mode(): bool {
		return Module\PayPal_Client::is_test_mode();
	}

	public function get_settings_schema(): Data_Object {
		return Schema::Object( [
			'mode' => Schema::Enum( [ 'live', 'sandbox' ] )->default('sandbox'),
			'currency' => Schema::String()->default('USD'),
			'live' => Schema::Object( [
				'client_id' => Schema::String(),
				'client_secret' => Schema::String(),
				'webhook' => Schema::Object( [
					'id' => Schema::String(),
				] ),
			] ),
			'sandbox' => Schema::Object( [
				'client_id' => Schema::String(),
				'client_secret' => Schema::String(),
				'webhook' => Schema::Object( [
					'id' => Schema::String(),
				] ),
			] ),
			'payments' => Schema::Object( [
				'order_approval' => Schema::enum( [ 'automatic', 'deferred', 'manual' ] )->default('automatic'),
			] ),
		] );
	}

	public function get_settings_component(): ?array {
		ob_start();
		require locate_template( 'app/modules/paypal-payments/templates/backend/paypal-settings.php' );
		$template = ob_get_clean();

		$src = trailingslashit( get_template_directory_uri() ).'app/modules/paypal-payments/assets/scripts/paypal-settings.esm.js';
		return [
			'src' => add_query_arg( 'v', \Voxel\get_assets_version(), $src ),
			'template' => $template,
			'data' => [],
		];
	}

	public function get_payment_handler(): ?string {
		return 'paypal_payment';
	}

	public function get_subscription_handler(): ?string {
		return 'paypal_subscription';
	}

	public function get_primary_currency(): ?string {
		$currency = \Voxel\get('payments.paypal.currency', 'USD');
		if ( ! is_string( $currency ) || empty( $currency ) ) {
			return 'USD';
		}

		return $currency;
	}

	// @link https://developer.paypal.com/docs/api/reference/currency-codes/
	public function get_supported_currencies(): array {
		return [
			'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'HKD', 'SGD', 'NZD',
			'CHF', 'SEK', 'DKK', 'NOK', 'PLN', 'CZK', 'HUF', 'ILS', 'MXN', 'BRL',
			'PHP', 'TWD', 'THB', 'MYR', 'INR', 'KRW', 'RUB', 'ZAR', 'TRY', 'AED',
		];
	}
}

