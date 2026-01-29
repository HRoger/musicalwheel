<?php

namespace Voxel\Modules\Ecommerce\Shipping\Controllers\Backend;

use Voxel\Utils\Config_Schema\{Schema, Data_Object};

if ( ! defined('ABSPATH') ) {
	exit;
}

class Shipping_Backend_Controller extends \Voxel\Controllers\Base_Controller {

	protected function hooks() {
		$this->on( 'admin_menu', '@add_menu_page', 25 );
		$this->on( 'admin_post_voxel_save_shipping_settings', '@save_shipping_settings' );
		$this->filter( 'admin_body_class', '@admin_body_class' );
	}

	protected function add_menu_page() {
		add_submenu_page(
			'voxel-orders',
			__( 'Shipping', 'voxel-backend' ),
			__( 'Shipping', 'voxel-backend' ),
			'manage_options',
			'voxel-shipping',
			function() {
				$props = [
					'tab' => $_GET['tab'] ?? 'shipping_classes',
				];

				// Get countries with subdivisions and group by continent
				$countries_data = \Voxel\Utils\Data\Countries_With_Subdivisions::all();
				$countries_by_continent = [];
				$countries_flat = [];

				foreach ( $countries_data as $code => $country ) {
					$continent = $country['continent'] ?? 'Other';
					if ( ! isset( $countries_by_continent[ $continent ] ) ) {
						$countries_by_continent[ $continent ] = [];
					}
					$countries_by_continent[ $continent ][ $code ] = $country['name'];
					$countries_flat[ $code ] = [
						'name' => $country['name'],
						'continent' => $continent,
						'states' => $country['states'] ?? [],
					];
				}

				// Sort continents and countries within each continent
				ksort( $countries_by_continent );
				foreach ( $countries_by_continent as $continent => &$countries ) {
					asort( $countries );
				}

				$props['shipping_countries'] = $countries_flat;
				$props['shipping_countries_by_continent'] = $countries_by_continent;

				// Get shipping settings from product_settings
				$schema = \Voxel\Product_Types\Settings_Schema::get();
				$product_settings = (array) \Voxel\get( 'product_settings', [] );
				
				// Extract shipping settings if they exist
				if ( isset( $product_settings['shipping'] ) && $prop = $schema->get_prop( 'shipping' ) ) {
					$prop->set_value( $product_settings['shipping'] );
					$config = $schema->export();
					$config = $config['shipping'] ?? [];
				} else {
					$config = [
						'shipping_classes' => [],
						'shipping_zones' => [],
						'shipping_rates' => [],
					];
				}

				require locate_template( 'templates/backend/product-types/shipping-screen.php' );
			}
		);
	}

	protected function save_shipping_settings() {
		check_admin_referer( 'voxel_save_shipping_settings' );
		if ( ! current_user_can( 'manage_options' ) ) {
			die;
		}

		if ( empty( $_POST['config'] ) ) {
			die;
		}

		$submitted_config = json_decode( stripslashes( $_POST['config'] ), true );

		// Get existing product settings
		$previous_config = \Voxel\get( 'product_settings', [] );
		
		// Update shipping settings within product_settings
		$schema = \Voxel\Product_Types\Settings_Schema::get();
		$schema->set_value( $previous_config );
		
		if ( $prop = $schema->get_prop( 'shipping' ) ) {
			$prop->set_value( $submitted_config );
		}

		$full_config = $schema->export();
		\Voxel\set( 'product_settings', Schema::optimize_for_storage( $full_config ) );

		$tab = $_REQUEST['tab'] ?? 'shipping_classes';
		wp_safe_redirect( add_query_arg( 'tab', $tab, admin_url( 'admin.php?page=voxel-shipping' ) ) );
		die;
	}

	protected function admin_body_class( $classes ) {
		if ( ( $_GET['page'] ?? '' ) === 'voxel-shipping' ) {
			$classes .= ' vx-dark-mode ';
		}

		return $classes;
	}

}

