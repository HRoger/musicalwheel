/**
 * usePricingSummary Hook
 *
 * React hook for calculating product pricing summary.
 * Handles all three product modes: regular, variable, booking.
 *
 * Evidence: voxel-product-form.beautified.js lines 1688-1758
 *
 * @package VoxelFSE
 */

import { useMemo, useCallback } from 'react';
import {
	formatPrice,
	getBasePriceSummary,
	getQuantity,
	calculateTotal,
} from './pricingUtils';
import type {
	ExtendedProductFormConfig,
	AddonValue,
	AddonPricingSummary,
	VariationsValue,
	BookingValue,
	BookingFieldConfig,
	PricingSummary,
	PricingSummaryItem,
} from '../types';
import { FieldBooking } from '../fields';

/**
 * Pricing summary item with hidden flag
 */
interface PricingItem extends AddonPricingSummary {
	key: string;
	hidden?: boolean;
	value?: number; // For quantity display
}

/**
 * Hook options
 */
export interface UsePricingSummaryOptions {
	config: ExtendedProductFormConfig | null;
	quantity: number;
	addonValues: Record<string, AddonValue>;
	variationsValue: VariationsValue;
	bookingValue: BookingValue;
	getAddonsPricingSummary?: () => AddonPricingSummary[] | null;
	getVariationsPricingSummary?: () => { label: string; amount: number; quantity: number | null } | null;
}

/**
 * Hook return value
 */
export interface UsePricingSummaryReturn {
	summary: PricingSummary;
	formatPrice: ( amount: number ) => string;
}

/**
 * usePricingSummary hook
 *
 * Calculates pricing summary based on product mode:
 * - regular: base price + addons * quantity
 * - variable: variation price * quantity
 * - booking: booking price + addons
 */
export function usePricingSummary( options: UsePricingSummaryOptions ): UsePricingSummaryReturn {
	const {
		config,
		quantity,
		addonValues,
		variationsValue,
		bookingValue,
		getAddonsPricingSummary,
		getVariationsPricingSummary,
	} = options;

	/**
	 * Calculate pricing for regular products
	 *
	 * Evidence: lines 1692-1711
	 */
	const calculateRegularPricing = useCallback( (): PricingSummary => {
		if ( ! config ) {
			return { visible_items: [], total: 0, formatted_total: formatPrice( 0 ) };
		}

		const items: PricingItem[] = [];

		// Get base price
		const base = getBasePriceSummary( config );

		// Get addons pricing
		const addons = getAddonsPricingSummary?.() ?? null;

		// Get quantity multiplier
		const qty = getQuantity( config, quantity );

		// Add base price (hidden if no addons selected)
		if ( base !== null ) {
			items.push( {
				key: 'base_price',
				...base,
				hidden: addons === null || addons.length === 0,
			} );
		}

		// Add addon prices
		if ( addons !== null ) {
			addons.forEach( ( addon, index ) => {
				items.push( {
					key: `addon_${ index }`,
					...addon,
				} );
			} );
		}

		// Add quantity display if > 1
		if ( qty > 1 ) {
			items.push( {
				key: 'quantity',
				label: config.l10n?.quantity ?? 'Quantity',
				amount: 0,
				value: qty,
			} );
		}

		// Calculate total
		let total = calculateTotal( items );
		total *= qty;

		// Add total line
		const totalItem: PricingSummaryItem = {
			key: 'total',
			label: 'Total',
			price: total,
			formatted_price: formatPrice( total ),
		};

		// Build visible items
		const visibleItems: PricingSummaryItem[] = items
			.filter( ( item ) => ! item.hidden )
			.map( ( item ) => ( {
				key: item.key,
				label: item.label,
				price: item.amount,
				formatted_price: item.value !== undefined
					? `× ${ item.value }`
					: formatPrice( item.amount ),
			} ) );

		visibleItems.push( totalItem );

		return {
			visible_items: visibleItems,
			total,
			formatted_total: formatPrice( total ),
		};
	}, [ config, quantity, getAddonsPricingSummary ] );

	/**
	 * Calculate pricing for variable products
	 *
	 * Evidence: lines 1712-1734
	 */
	const calculateVariablePricing = useCallback( (): PricingSummary => {
		if ( ! config ) {
			return { visible_items: [], total: 0, formatted_total: formatPrice( 0 ) };
		}

		const items: PricingItem[] = [];

		// Get variation pricing
		const variationSummary = getVariationsPricingSummary?.() ?? null;

		if ( variationSummary !== null ) {
			items.push( {
				key: 'variation',
				label: variationSummary.label,
				amount: variationSummary.amount,
			} );

			// Add quantity line if > 1
			if ( variationSummary.quantity && variationSummary.quantity > 1 ) {
				items.push( {
					key: 'quantity',
					label: config.l10n?.quantity ?? 'Quantity',
					amount: 0,
					value: variationSummary.quantity,
				} );
			}
		}

		// Calculate total
		const total = calculateTotal( items );

		// Add total line
		const totalItem: PricingSummaryItem = {
			key: 'total',
			label: 'Total',
			price: total,
			formatted_price: formatPrice( total ),
		};

		// Build visible items
		const visibleItems: PricingSummaryItem[] = items
			.filter( ( item ) => ! item.hidden )
			.map( ( item ) => ( {
				key: item.key,
				label: item.label,
				price: item.amount,
				formatted_price: item.value !== undefined
					? `× ${ item.value }`
					: formatPrice( item.amount ),
			} ) );

		visibleItems.push( totalItem );

		return {
			visible_items: visibleItems,
			total,
			formatted_total: formatPrice( total ),
		};
	}, [ config, getVariationsPricingSummary ] );

	/**
	 * Calculate pricing for booking products
	 *
	 * Evidence: lines 1735-1757
	 */
	const calculateBookingPricing = useCallback( (): PricingSummary => {
		if ( ! config ) {
			return { visible_items: [], total: 0, formatted_total: formatPrice( 0 ) };
		}

		const items: PricingItem[] = [];

		// Get booking field config
		const bookingField = config.props?.fields?.[ 'form-booking' ];

		// Get booking pricing summary
		const bookingSummary = bookingField
			? FieldBooking.getPricingSummary( bookingField as BookingFieldConfig, bookingValue, config )
			: null;

		// Get addons pricing
		const addonsSummary = getAddonsPricingSummary?.() ?? null;

		if ( bookingSummary !== null ) {
			// Hide booking price if zero (addons-only booking)
			items.push( {
				key: 'booking',
				label: bookingSummary.label,
				amount: bookingSummary.amount,
				hidden: bookingSummary.amount === 0,
			} );

			// Add addons
			if ( addonsSummary !== null ) {
				addonsSummary.forEach( ( addon, index ) => {
					items.push( {
						key: `addon_${ index }`,
						...addon,
					} );
				} );
			}
		}

		// Calculate total
		const total = calculateTotal( items );

		// Add total line
		const totalItem: PricingSummaryItem = {
			key: 'total',
			label: 'Total',
			price: total,
			formatted_price: formatPrice( total ),
		};

		// Build visible items
		const visibleItems: PricingSummaryItem[] = items
			.filter( ( item ) => ! item.hidden )
			.map( ( item ) => ( {
				key: item.key,
				label: item.label,
				price: item.amount,
				formatted_price: formatPrice( item.amount ),
			} ) );

		if ( total > 0 || visibleItems.length > 0 ) {
			visibleItems.push( totalItem );
		}

		return {
			visible_items: visibleItems,
			total,
			formatted_total: formatPrice( total ),
		};
	}, [ config, bookingValue, getAddonsPricingSummary ] );

	/**
	 * Calculate summary based on product mode
	 */
	const summary = useMemo( (): PricingSummary => {
		if ( ! config ) {
			return { visible_items: [], total: 0, formatted_total: formatPrice( 0 ) };
		}

		const mode = config.settings?.product_mode ?? 'regular';

		switch ( mode ) {
			case 'regular':
				return calculateRegularPricing();

			case 'variable':
				return calculateVariablePricing();

			case 'booking':
				return calculateBookingPricing();

			default:
				return { visible_items: [], total: 0, formatted_total: formatPrice( 0 ) };
		}
	}, [ config, calculateRegularPricing, calculateVariablePricing, calculateBookingPricing ] );

	return {
		summary,
		formatPrice,
	};
}

export default usePricingSummary;
