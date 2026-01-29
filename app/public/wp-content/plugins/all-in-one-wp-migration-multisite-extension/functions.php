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

/**
 * Get WP networks
 *
 * @return array
 */
function ai1wmme_get_networks() {
	global $wpdb;
	static $data;

	// Get networks
	if ( is_null( $data ) ) {
		$data = array();

		// Loop over networks
		$networks = $wpdb->get_results( sprintf( 'SELECT `id`, `domain`, `path` FROM `%s` ORDER BY `id` ASC', $wpdb->site ), ARRAY_A );
		foreach ( $networks as $network ) {
			$data[] = array(
				'SiteID' => (int) $network['id'],
				'Domain' => $network['domain'],
				'Path'   => $network['path'],
			);
		}
	}

	return $data;
}

/**
 * Get WP subsites
 *
 * @param  array $params Request parameters
 * @return array
 */
function ai1wmme_get_sites( $params = array() ) {
	global $wpdb;
	static $data;

	// Get sites
	if ( is_null( $data ) ) {
		$data = array();

		// Set where query
		$where_query = array();
		if ( isset( $params['options']['sites'] ) ) {
			$where_query[] = sprintf( "`blog_id` IN ('%s')", implode( "', '", $params['options']['sites'] ) );
		} else {
			$where_query[] = 1;
		}

		// Loop over sites
		$sites = $wpdb->get_results( sprintf( 'SELECT `blog_id`, `site_id`, `lang_id`, `domain`, `path` FROM `%s` WHERE %s ORDER BY `blog_id` ASC', $wpdb->blogs, implode( ' AND ', $where_query ) ), ARRAY_A );
		foreach ( $sites as $site ) {
			$data[] = array(
				'BlogID' => (int) $site['blog_id'],
				'SiteID' => (int) $site['site_id'],
				'LangID' => (int) $site['lang_id'],
				'Domain' => $site['domain'],
				'Path'   => $site['path'],
			);
		}
	}

	return $data;
}

/**
 * Paginate WP subsites
 *
 * @param  integer $offset    Sites offset
 * @param  integer $row_count Sites row count
 * @return array
 */
function ai1wmme_paginate_sites( $offset = 0, $row_count = 10 ) {
	global $wpdb;
	static $data;

	// Get sites
	if ( is_null( $data ) ) {
		$data = array();

		// Loop over sites
		$sites = $wpdb->get_results( sprintf( 'SELECT `blog_id`, `domain`, `path` FROM `%s` ORDER BY `blog_id` ASC LIMIT %d, %d', $wpdb->blogs, $offset, $row_count ), ARRAY_A );
		foreach ( $sites as $site ) {
			$data[ $site['blog_id'] ] = $site['domain'] . untrailingslashit( $site['path'] );
		}
	}

	return $data;
}

/**
 * Count WP subsites
 *
 * @return integer
 */
function ai1wmme_count_sites() {
	global $wpdb;
	static $count;

	// Count sites
	if ( is_null( $count ) ) {
		$count = $wpdb->get_var( sprintf( 'SELECT COUNT(*) FROM `%s`', $wpdb->blogs ) );
	}

	return intval( $count );
}

/**
 * Check whether mainsite is selected
 *
 * @return boolean
 */
function ai1wmme_has_mainsite( $params = array() ) {
	foreach ( ai1wmme_get_sites( $params ) as $site ) {
		if ( ai1wm_is_mainsite( $site['BlogID'] ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Check whether export/import is running
 *
 * @return boolean
 */
function ai1wmme_is_running() {
	if ( isset( $_GET['file'] ) || isset( $_POST['file'] ) ) {
		return true;
	}

	return false;
}

/**
 * Check if the base plugin is installed
 *
 * @return boolean
 */
function ai1wmme_is_base_plugin_installed() {
	return file_exists( WP_PLUGIN_DIR . '/all-in-one-wp-migration/all-in-one-wp-migration.php' );
}

/**
 * Check if the base plugin is activated
 *
 * @return boolean
 */
function ai1wmme_is_base_plugin_active() {
	return is_plugin_active( 'all-in-one-wp-migration/all-in-one-wp-migration.php' );
}

/**
 * Install the base plugin from WordPress repository
 *
 * @return boolean|WP_Error
 */
function ai1wmme_install_base_plugin() {
	if ( ! function_exists( 'plugins_api' ) ) {
		require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
	}

	if ( ! class_exists( 'WP_Upgrader', false ) ) {
		require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
	}

	$api = plugins_api(
		'plugin_information',
		array(
			'slug'   => 'all-in-one-wp-migration',
			'fields' => array(
				'short_description' => false,
				'sections'          => false,
				'requires'          => false,
				'rating'            => false,
				'ratings'           => false,
				'downloaded'        => false,
				'last_updated'      => false,
				'added'             => false,
				'tags'              => false,
				'compatibility'     => false,
				'homepage'          => false,
				'donate_link'       => false,
			),
		)
	);

	if ( is_wp_error( $api ) ) {
		return $api;
	}

	$upgrader = new Plugin_Upgrader( new WP_Ajax_Upgrader_Skin() );
	$result   = $upgrader->install( $api->download_link );

	return $result;
}
