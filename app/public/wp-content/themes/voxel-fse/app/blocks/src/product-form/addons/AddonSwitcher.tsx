/**
 * AddonSwitcher Component
 *
 * Simple on/off toggle for an addon. When enabled, adds the addon's price
 * to the total. Supports custom pricing based on date ranges and repeat
 * configurations for booking products.
 *
 * Evidence: voxel-product-form.beautified.js lines 298-394
 *
 * @package VoxelFSE
 */

import { useEffect, useCallback } from 'react';
import type {
	AddonConfig,
	AddonSwitcherValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
} from '../types';

export interface AddonSwitcherProps {
	addon: AddonConfig;
	value: AddonSwitcherValue;
	onChange: ( value: AddonSwitcherValue ) => void;
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null;
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null;
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null;
	searchContext?: {
		switcher_addons?: Record<string, boolean>;
	};
}

/**
 * AddonSwitcher - Simple on/off toggle addon
 *
 * Auto-enables if:
 * 1. Addon is marked as required
 * 2. Addon is enabled in search context (from URL parameters)
 *
 * Evidence: voxel-product-form.beautified.js lines 325-335
 */
export default function AddonSwitcher( {
	addon,
	value,
	onChange,
	getRepeatConfig,
	getCustomPrice,
	getCustomPriceForDate,
	searchContext,
}: AddonSwitcherProps ) {
	// Auto-enable if required or in search context
	// Evidence: lines 325-335
	useEffect( () => {
		if ( addon.required && ! value.enabled ) {
			onChange( { enabled: true } );
		}

		// Auto-enable if specified in search context
		if ( searchContext?.switcher_addons?.[ addon.key ] === true && ! value.enabled ) {
			onChange( { enabled: true } );
		}
	}, [ addon.key, addon.required, searchContext, value.enabled, onChange ] );

	/**
	 * Toggle addon enabled state
	 */
	const handleToggle = useCallback( () => {
		// Don't allow disabling required addons
		if ( addon.required && value.enabled ) {
			return;
		}
		onChange( { enabled: ! value.enabled } );
	}, [ addon.required, value.enabled, onChange ] );

	/**
	 * Calculate pricing summary for this addon
	 *
	 * Returns null if addon is not enabled. Otherwise calculates the
	 * price based on repeat config (date range bookings) or custom pricing.
	 *
	 * Evidence: voxel-product-form.beautified.js lines 352-392
	 */
	// @ts-ignore -- unused but kept for future use
	const _getPricingSummary = useCallback( (): AddonPricingSummary | null => {
		if ( ! value.enabled ) return null;

		let label = addon.label;
		const repeatConfig = getRepeatConfig( addon );
		const customPrice = getCustomPrice( addon );
		let amount = 0;

		// Calculate price for date range bookings
		// Evidence: lines 362-383
		if ( repeatConfig !== null ) {
			amount = 0;
			const start = new Date( repeatConfig.start + 'T00:00:00Z' );
			const end = new Date( repeatConfig.end + 'T00:00:00Z' );

			// Loop through each day in the range
			while ( repeatConfig.count_mode === 'nights' ? start < end : start <= end ) {
				const priceDate = getCustomPriceForDate( start );

				if ( priceDate !== null ) {
					// Use custom price for this date if available
					const addonPrices = priceDate.prices.addons?.[ addon.key ];
					const cp = addonPrices && 'price' in addonPrices ? ( addonPrices.price as number ) : null;
					amount += cp != null ? cp : ( addon.props.price ?? 0 );
				} else {
					// Use base addon price
					amount += addon.props.price ?? 0;
				}

				start.setDate( start.getDate() + 1 );
			}

			label += repeatConfig.label;
		} else {
			// Single day or regular product pricing
			// Evidence: lines 384-389
			let finalPrice = addon.props.price ?? 0;
			if ( customPrice !== null ) {
				const addonPrices = customPrice.prices.addons?.[ addon.key ];
				const cp = addonPrices && 'price' in addonPrices ? ( addonPrices.price as number ) : null;
				if ( cp != null ) {
					finalPrice = cp;
				}
			}
			amount = finalPrice;
		}

		return { label, amount };
	}, [ addon, value.enabled, getRepeatConfig, getCustomPrice, getCustomPriceForDate ] );

	// Format price for display
	const formattedPrice = addon.props.price != null
		? `+${ addon.props.price.toLocaleString() }`
		: '';

	return (
		<div className="ts-form-group ts-addon-switcher">
			<div className="switch-slider">
				<label className="container-switch">
					<input
						type="checkbox"
						checked={ value.enabled }
						onChange={ handleToggle }
						disabled={ addon.required && value.enabled }
					/>
					<span className="switch"></span>
				</label>
				<span className="switch-label">
					{ addon.label }
					{ formattedPrice && (
						<span className="addon-price"> ({ formattedPrice })</span>
					) }
				</span>
			</div>
		</div>
	);
}

// Export getPricingSummary for use by parent component
AddonSwitcher.getPricingSummary = function(
	addon: AddonConfig,
	value: AddonSwitcherValue,
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null,
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null,
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null
): AddonPricingSummary | null {
	if ( ! value.enabled ) return null;

	let label = addon.label;
	const repeatConfig = getRepeatConfig( addon );
	const customPrice = getCustomPrice( addon );
	let amount = 0;

	if ( repeatConfig !== null ) {
		amount = 0;
		const start = new Date( repeatConfig.start + 'T00:00:00Z' );
		const end = new Date( repeatConfig.end + 'T00:00:00Z' );

		while ( repeatConfig.count_mode === 'nights' ? start < end : start <= end ) {
			const priceDate = getCustomPriceForDate( start );

			if ( priceDate !== null ) {
				const addonPrices = priceDate.prices.addons?.[ addon.key ];
				const cp = addonPrices && 'price' in addonPrices ? ( addonPrices.price as number ) : null;
				amount += cp != null ? cp : ( addon.props.price ?? 0 );
			} else {
				amount += addon.props.price ?? 0;
			}

			start.setDate( start.getDate() + 1 );
		}

		label += repeatConfig.label;
	} else {
		let finalPrice = addon.props.price ?? 0;
		if ( customPrice !== null ) {
			const addonPrices = customPrice.prices.addons?.[ addon.key ];
			const cp = addonPrices && 'price' in addonPrices ? ( addonPrices.price as number ) : null;
			if ( cp != null ) {
				finalPrice = cp;
			}
		}
		amount = finalPrice;
	}

	return { label, amount };
};
