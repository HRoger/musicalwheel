<?php
declare(strict_types=1);

/**
 * Membership Data Trait
 *
 * Provides membership/subscription data for user data group.
 * Returns placeholder data until membership backend is implemented.
 *
 * @package MusicalWheel
 */

namespace VoxelFSE\Dynamic_Data\Data_Groups\User;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Membership_Data trait
 *
 * Adds membership-related properties to User data group.
 */
trait Membership_Data {

	/**
	 * Resolve membership property
	 *
	 * @param array $path Property path after 'membership'.
	 * @return string
	 */
	protected function resolve_membership_property( array $path ): string {
		if ( empty( $path ) ) {
			return '';
		}

		$key = strtolower( trim( (string) $path[0] ) );

		switch ( $key ) {
			case 'plan':
				return $this->resolve_membership_plan( $path );

			case 'status':
				// Membership status: active, expired, cancelled, pending
				// TODO: Implement when membership backend exists
				return '';

			case 'start_date':
				// Membership start date
				// TODO: Implement when membership backend exists
				return '';

			case 'end_date':
				// Membership end date
				// TODO: Implement when membership backend exists
				return '';

			default:
				return '';
		}
	}

	/**
	 * Resolve membership plan properties
	 *
	 * @param array $path Property path starting with 'plan'.
	 * @return string
	 */
	protected function resolve_membership_plan( array $path ): string {
		// If just 'plan', return plan key
		if ( count( $path ) === 1 ) {
			// TODO: Implement when membership backend exists
			return '';
		}

		$property = strtolower( trim( (string) $path[1] ) );

		switch ( $property ) {
			case 'key':
				// Plan unique key/slug
				// TODO: Implement when membership backend exists
				return '';

			case 'label':
			case 'name':
				// Plan display name
				// TODO: Implement when membership backend exists
				return '';

			case 'description':
				// Plan description
				// TODO: Implement when membership backend exists
				return '';

			case 'pricing':
				return $this->resolve_membership_pricing( $path );

			default:
				return '';
		}
	}

	/**
	 * Resolve membership pricing properties
	 *
	 * @param array $path Property path starting with 'pricing'.
	 * @return string
	 */
	protected function resolve_membership_pricing( array $path ): string {
		// Need at least 'plan.pricing.amount'
		if ( count( $path ) < 3 ) {
			return '';
		}

		$property = strtolower( trim( (string) $path[2] ) );

		switch ( $property ) {
			case 'amount':
				// Price amount (e.g., 9.99)
				// TODO: Implement when membership backend exists
				return '0';

			case 'currency':
				// Currency code (e.g., USD)
				// TODO: Implement when membership backend exists
				return 'USD';

			case 'period':
				// Billing period: day, week, month, year
				// TODO: Implement when membership backend exists
				return '';

			case 'interval':
				// Interval count (e.g., 1 for monthly, 3 for quarterly)
				// TODO: Implement when membership backend exists
				return '1';

			default:
				return '';
		}
	}
}
