/**
 * Pricing Utility Functions
 *
 * Utility functions for product pricing calculations.
 * Matches Voxel's pricing logic from voxel-product-form.beautified.js
 *
 * Evidence:
 * - getCustomPriceForDate: lines 1888-1924
 * - _getBasePriceSummary: lines 2154-2177
 * - currencyFormat: lines 2201-2203
 *
 * @package VoxelFSE
 */

import type {
	CustomPriceConfig,
	ExtendedProductFormConfig,
	AddonPricingSummary,
} from '../types';

// Declare global Voxel helpers
declare global {
	interface Window {
		Voxel?: {
			helpers: {
				currencyFormat: ( amount: number ) => string;
				dateFormatYmd: ( date: Date ) => string;
			};
		};
	}
}

/**
 * Format currency using Voxel's currency formatter
 *
 * Evidence: voxel-product-form.beautified.js lines 2201-2203
 *
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatPrice( amount: number ): string {
	if ( typeof window !== 'undefined' && window.Voxel?.helpers?.currencyFormat ) {
		return window.Voxel.helpers.currencyFormat( amount );
	}

	// Fallback for SSR or missing Voxel
	return new Intl.NumberFormat( 'en-US', {
		style: 'currency',
		currency: 'USD',
	} ).format( amount );
}

/**
 * Format date to YYYY-MM-DD string
 *
 * Evidence: voxel-product-form.beautified.js line 2898
 *
 * @param date - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
export function dateFormatYmd( date: Date ): string {
	if ( typeof window !== 'undefined' && window.Voxel?.helpers?.dateFormatYmd ) {
		return window.Voxel.helpers.dateFormatYmd( date );
	}

	// Fallback
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	return `${ year }-${ month }-${ day }`;
}

/**
 * Get custom price configuration for a specific date
 *
 * Checks all custom pricing rules to find one that matches the given date.
 * Rules can match by:
 * - Exact date
 * - Date range
 * - Day of week
 *
 * Evidence: voxel-product-form.beautified.js lines 1888-1924
 *
 * @param date - The date to check
 * @param config - Product configuration
 * @returns Custom price configuration or null if no match
 */
export function getCustomPriceForDate(
	date: Date,
	config: ExtendedProductFormConfig
): CustomPriceConfig | null {
	const customPrices = config.props?.custom_prices;

	if ( ! customPrices?.enabled || ! customPrices.list?.length ) {
		return null;
	}

	const dateStr = dateFormatYmd( date );

	// Find first matching custom price rule
	const matchingRule = customPrices.list.find( ( rule ) => {
		for ( const condition of rule.conditions ) {
			if ( condition.type === 'date' ) {
				// Exact date match
				if ( condition.date === dateStr ) {
					return true;
				}
			} else if ( condition.type === 'date_range' ) {
				// Date range match
				if ( condition.range ) {
					const rangeStart = new Date( condition.range.from + 'T00:00:00Z' );
					const rangeEnd = new Date( condition.range.to + 'T00:00:00Z' );
					const checkDate = new Date( dateStr + 'T00:00:00Z' );

					if ( rangeStart <= checkDate && checkDate <= rangeEnd ) {
						return true;
					}
				}
			} else if ( condition.type === 'day_of_week' ) {
				// Day of week match
				const dateObj = new Date( dateStr + 'T00:00:00Z' );
				const dayNames = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
				const dayName = dayNames[ dateObj.getDay() ];

				if ( condition.days?.includes( dayName ) ) {
					return true;
				}
			}
		}
		return false;
	} );

	return matchingRule ?? null;
}

/**
 * Get minimum price for a specific date
 *
 * Used by calendar tooltips to show daily pricing.
 *
 * Evidence: voxel-product-form.beautified.js lines 1863-1874
 *
 * @param date - The date to check (null = use base price)
 * @param config - Product configuration
 * @returns Minimum price for the date
 */
export function getMinimumPriceForDate(
	date: Date | null,
	config: ExtendedProductFormConfig
): number {
	const baseMinPrice = config.props?.minimum_price ?? 0;

	if ( ! config.props?.custom_prices?.enabled || date === null ) {
		return baseMinPrice;
	}

	const customPrice = getCustomPriceForDate( date, config );
	if ( customPrice === null ) {
		return baseMinPrice;
	}

	return customPrice.minimum_price ?? baseMinPrice;
}

/**
 * Get base price summary for regular products
 *
 * Returns the base price item for the pricing summary.
 * Considers custom pricing for today's date on regular products.
 *
 * Evidence: voxel-product-form.beautified.js lines 2154-2177
 *
 * @param config - Product configuration
 * @returns Base price summary item or null if not enabled
 */
export function getBasePriceSummary(
	config: ExtendedProductFormConfig
): AddonPricingSummary | null {
	const basePrice = config.props?.base_price;
	if ( ! basePrice?.enabled ) return null;

	let amount = basePrice.discount_amount ?? basePrice.amount;

	// Check for custom pricing on today's date (regular products only)
	if ( config.settings?.product_mode === 'regular' ) {
		const todayDate = config.props?.today?.date;
		if ( todayDate ) {
			const customPrice = getCustomPriceForDate( new Date( todayDate + 'T00:00:00Z' ), config );

			if ( customPrice?.prices?.base_price ) {
				amount = customPrice.prices.base_price.discount_amount ?? customPrice.prices.base_price.amount;
			}
		}
	}

	return {
		label: 'Price',
		amount,
	};
}

/**
 * Get product quantity from value state
 *
 * Returns quantity from stock field, or 1 if not applicable.
 *
 * Evidence: voxel-product-form.beautified.js lines 2186-2191
 *
 * @param config - Product configuration
 * @param quantity - Current quantity value
 * @returns Quantity (minimum 1)
 */
export function getQuantity(
	config: ExtendedProductFormConfig,
	quantity: number
): number {
	if ( config.props?.fields?.[ 'form-quantity' ] && quantity > 1 ) {
		return quantity;
	}
	return 1;
}

/**
 * Calculate total from pricing items
 *
 * @param items - Array of pricing items
 * @returns Total amount
 */
export function calculateTotal( items: AddonPricingSummary[] ): number {
	return items.reduce( ( total, item ) => {
		return total + ( item.amount ?? 0 );
	}, 0 );
}
