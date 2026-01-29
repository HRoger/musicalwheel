<?php
declare(strict_types=1);

/**
 * Vendor Data Trait
 *
 * Provides vendor/marketplace statistics for user data group.
 * Returns placeholder data until marketplace backend is implemented.
 *
 * @package MusicalWheel
 */

namespace VoxelFSE\Dynamic_Data\Data_Groups\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Vendor_Data trait
 *
 * Adds vendor-related properties to User data group.
 */
trait Vendor_Data {

	/**
	 * Resolve vendor property
	 *
	 * @param array $path Property path after 'vendor'.
	 * @return string
	 */
	protected function resolve_vendor_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		// Time-based stats (today, this-week, this-month, this-year)
		if ( in_array( $key, [ 'today', 'this-week', 'this-month', 'this-year' ], true ) ) {
			return $this->resolve_vendor_time_period( $key, $path );
		}

		switch ( $key ) {
			case 'earnings':
				// Total earnings
				// TODO: Implement when marketplace backend exists
				return '0';

			case 'fees':
				// Platform fees
				// TODO: Implement when marketplace backend exists
				return '0';

			case 'customers':
				// Total unique customers
				// TODO: Implement when marketplace backend exists
				return '0';

			case 'orders':
				return $this->resolve_vendor_orders( $path );

			default:
				return '';
		}
	}

	/**
	 * Resolve vendor time period stats
	 *
	 * @param string $period Period key (today, this-week, etc.).
	 * @param array  $path Full property path.
	 * @return string
	 */
	protected function resolve_vendor_time_period( string $period, array $path ): string {
		// If no sub-property, return empty
		if ( ! isset( $path[1] ) ) {
			return '';
		}

		$stat = strtolower( trim( (string) $path[1] ) );

		switch ( $stat ) {
			case 'earnings':
			case 'fees':
			case 'customers':
			case 'orders':
				// TODO: Implement time-based filtering when marketplace backend exists
				return '0';

			default:
				return '';
		}
	}

	/**
	 * Resolve vendor orders stats
	 *
	 * @param array $path Property path starting with 'orders'.
	 * @return string
	 */
	protected function resolve_vendor_orders( array $path ): string {
		// If just 'orders', return total count
		if ( count( $path ) === 1 ) {
			// TODO: Implement when marketplace backend exists
			return '0';
		}

		// Order status filter
		$status = strtolower( trim( (string) $path[1] ) );

		switch ( $status ) {
			case 'pending':
			case 'completed':
			case 'cancelled':
			case 'refunded':
			case 'failed':
				// TODO: Implement order status filtering when marketplace backend exists
				return '0';

			default:
				return '0';
		}
	}
}
