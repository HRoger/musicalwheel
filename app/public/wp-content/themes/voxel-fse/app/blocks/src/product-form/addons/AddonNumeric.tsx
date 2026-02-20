/**
 * AddonNumeric Component
 *
 * Quantity selector for an addon. Allows users to select a number of units
 * within min/max bounds. Supports "charge after" functionality where the
 * first N units are free.
 *
 * Evidence: voxel-product-form.beautified.js lines 405-555
 *
 * @package VoxelFSE
 */

import { useEffect, useCallback } from 'react';
import type {
	AddonConfig,
	AddonNumericValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
} from '../types';

export interface AddonNumericProps {
	addon: AddonConfig;
	value: AddonNumericValue;
	onChange: ( value: AddonNumericValue ) => void;
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null;
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null;
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null;
	searchContext?: {
		numeric_addons?: Record<string, number>;
	};
}

/**
 * AddonNumeric - Quantity selector with +/- buttons
 *
 * Sets initial quantity based on:
 * 1. Required status (min_units if required, 0 if optional)
 * 2. Search context value (from URL parameters)
 *
 * Evidence: voxel-product-form.beautified.js lines 431-444
 */
export default function AddonNumeric( {
	addon,
	value,
	onChange,
	getRepeatConfig: _getRepeatConfig,
	getCustomPrice: _getCustomPrice,
	getCustomPriceForDate: _getCustomPriceForDate,
	searchContext,
}: AddonNumericProps ) {
	const minUnits = addon.props.min_units ?? 1;
	const maxUnits = addon.props.max_units ?? 999;

	// Set initial quantity on mount
	// Evidence: lines 431-444
	useEffect( () => {
		if ( value.quantity === null ) {
			const defaultQty = addon.required ? minUnits : 0;
			onChange( { quantity: defaultQty } );
		}

		// Override with search context value if valid
		const contextVal = searchContext?.numeric_addons?.[ addon.key ];
		if ( contextVal !== undefined ) {
			const val = parseInt( String( contextVal ), 10 );
			if ( typeof val === 'number' && val >= minUnits && val <= maxUnits ) {
				onChange( { quantity: val } );
			}
		}
	}, [ addon.key, addon.required, minUnits, maxUnits, searchContext ] );

	/**
	 * Increment quantity by 1
	 *
	 * Ensures quantity stays within min/max bounds.
	 * Evidence: lines 454-459
	 */
	const increment = useCallback( () => {
		const currentQty = value.quantity ?? 0;
		if ( typeof currentQty !== 'number' || currentQty + 1 < minUnits ) {
			onChange( { quantity: minUnits } );
		} else {
			onChange( { quantity: Math.min( currentQty + 1, maxUnits ) } );
		}
	}, [ value.quantity, minUnits, maxUnits, onChange ] );

	/**
	 * Decrement quantity by 1
	 *
	 * For optional addons, allows decrementing to 0.
	 * For required addons, stops at min_units.
	 * Evidence: lines 468-478
	 */
	const decrement = useCallback( () => {
		const currentQty = value.quantity ?? 0;
		if ( typeof currentQty !== 'number' ) {
			onChange( { quantity: minUnits } );
		} else {
			const newVal = currentQty - 1;
			if ( ! addon.required && newVal < minUnits ) {
				onChange( { quantity: 0 } );
			} else {
				onChange( { quantity: Math.max( newVal, minUnits ) } );
			}
		}
	}, [ addon.required, value.quantity, minUnits, onChange ] );

	/**
	 * Validate quantity is within bounds
	 *
	 * Called on blur or when quantity is manually entered.
	 * Evidence: lines 487-498
	 */
	const validateValueInBounds = useCallback( () => {
		const qty = value.quantity;
		if ( typeof qty === 'number' ) {
			if ( qty > maxUnits ) {
				onChange( { quantity: maxUnits } );
			} else if ( qty < minUnits ) {
				// Allow 0 for optional addons
				if ( ! ( ! addon.required && qty === 0 ) ) {
					onChange( { quantity: minUnits } );
				}
			}
		}
	}, [ addon.required, value.quantity, minUnits, maxUnits, onChange ] );

	/**
	 * Handle direct input change
	 */
	const handleInputChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		const val = parseInt( e.target.value, 10 );
		if ( ! isNaN( val ) ) {
			onChange( { quantity: val } );
		}
	}, [ onChange ] );

	// Format price for display
	const formattedPrice = addon.props.price != null
		? `+${ addon.props.price.toLocaleString() }`
		: '';

	const currentQty = value.quantity ?? 0;
	const displayMode = addon.props.display_mode ?? 'stepper';

	// Input mode: simple number input without stepper buttons
	// Evidence: templates/widgets/product-form/form-addons/numeric.php:6-11
	if ( displayMode === 'input' ) {
		return (
			<div className="ts-form-group ts-addon-numeric">
				<label>{ addon.label }</label>
				<div className="input-container">
					<input
						type="number"
						value={ currentQty }
						onChange={ handleInputChange }
						onBlur={ validateValueInBounds }
						min={ addon.required ? minUnits : 0 }
						max={ maxUnits }
						className="ts-filter"
					/>
				</div>
			</div>
		);
	}

	// Stepper mode (default): +/- buttons with number input
	// Evidence: templates/widgets/product-form/form-addons/numeric.php:12-25
	return (
		<div className="ts-form-group ts-addon-numeric">
			<label>
				{ addon.label }
				{ formattedPrice && (
					<span className="addon-price"> ({ formattedPrice } each)</span>
				) }
			</label>
			<div className="ts-stepper-input flexify">
				<button
					type="button"
					className={ `ts-stepper-left ts-icon-btn${ addon.required && currentQty <= minUnits ? ' vx-disabled' : '' }` }
					onClick={ decrement }
				>
					<i className="las la-minus" />
				</button>
				<input
					type="number"
					value={ currentQty }
					onChange={ handleInputChange }
					onBlur={ validateValueInBounds }
					className="ts-input-box"
				/>
				<button
					type="button"
					className={ `ts-stepper-right ts-icon-btn${ currentQty >= maxUnits ? ' vx-disabled' : '' }` }
					onClick={ increment }
				>
					<i className="las la-plus" />
				</button>
			</div>
			{ addon.props.charge_after?.enabled && addon.props.charge_after.quantity > 0 && (
				<small className="charge-after-note">
					First { addon.props.charge_after.quantity } free
				</small>
			) }
		</div>
	);
}

/**
 * Calculate pricing summary for this addon
 *
 * Handles "charge after" functionality where first N units are free.
 * Evidence: voxel-product-form.beautified.js lines 508-553
 */
AddonNumeric.getPricingSummary = function(
	addon: AddonConfig,
	value: AddonNumericValue,
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null,
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null,
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null
): AddonPricingSummary | null {
	const qty = value.quantity ?? 0;
	if ( qty < 1 ) return null;

	let label = addon.label;
	if ( qty >= 1 ) label += ` × ${ qty }`;

	// Calculate billable quantity (after free units)
	// Evidence: lines 515-518
	let billableQty = qty;
	if ( addon.props.charge_after?.enabled && addon.props.charge_after?.quantity > 0 ) {
		billableQty = Math.max( 0, qty - addon.props.charge_after.quantity );
	}

	const repeatConfig = getRepeatConfig( addon );
	const customPrice = getCustomPrice( addon );
	let amount = 0;

	// Calculate price for date range bookings
	// Evidence: lines 525-544
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

		amount *= billableQty;
		label += repeatConfig.label;
	} else {
		// Single day or regular product pricing
		let finalPrice = addon.props.price ?? 0;
		if ( customPrice !== null ) {
			const addonPrices = customPrice.prices.addons?.[ addon.key ];
			const cp = addonPrices && 'price' in addonPrices ? ( addonPrices.price as number ) : null;
			if ( cp != null ) {
				finalPrice = cp;
			}
		}
		amount = finalPrice * billableQty;
	}

	return { label, amount };
};
