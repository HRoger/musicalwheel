/**
 * AddonSelect Component
 *
 * Dropdown selection for a single choice from a list.
 * Auto-selects first choice if addon is required.
 *
 * Evidence: voxel-product-form.beautified.js lines 670-723
 *
 * @package VoxelFSE
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import type {
	AddonConfig,
	AddonSelectValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
	AddonChoice,
} from '../types';

export interface AddonSelectProps {
	addon: AddonConfig;
	value: AddonSelectValue;
	onChange: ( value: AddonSelectValue ) => void;
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null;
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null;
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null;
}

/**
 * AddonSelect - Single selection dropdown
 *
 * Auto-selects first choice if addon is required.
 * Evidence: voxel-product-form.beautified.js lines 678-681
 */
export default function AddonSelect( {
	addon,
	value,
	onChange,
}: AddonSelectProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef<HTMLDivElement>( null );
	const choices = addon.props.choices ?? {};
	const choiceKeys = Object.keys( choices );

	// Auto-select first choice if required
	// Evidence: lines 678-681
	useEffect( () => {
		if ( addon.required && value.selected === null && choiceKeys.length > 0 ) {
			onChange( { selected: choiceKeys[ 0 ] } );
		}
	}, [ addon.required, value.selected, choiceKeys, onChange ] );

	/**
	 * Handle choice selection
	 */
	const handleSelect = useCallback( ( choiceKey: string ) => {
		onChange( { selected: choiceKey } );
		setIsOpen( false );
	}, [ onChange ] );

	/**
	 * Clear selection
	 */
	const handleClear = useCallback( () => {
		if ( ! addon.required ) {
			onChange( { selected: null } );
		}
	}, [ addon.required, onChange ] );

	// Get selected choice for display
	const selectedChoice: AddonChoice | null = value.selected ? choices[ value.selected ] ?? null : null;

	// Format price for a choice
	const formatPrice = ( choice: AddonChoice ): string => {
		if ( choice.price != null && choice.price > 0 ) {
			return `+${ choice.price.toLocaleString() }`;
		}
		return '';
	};

	return (
		<div className="ts-form-group ts-addon-select">
			<label>{ addon.label }</label>
			<div
				ref={ triggerRef }
				className={ `ts-filter ts-popup-target${ selectedChoice ? ' ts-filled' : '' }` }
				onClick={ () => setIsOpen( ! isOpen ) }
				role="button"
				tabIndex={ 0 }
				onKeyDown={ ( e ) => e.key === 'Enter' && setIsOpen( ! isOpen ) }
			>
				<span className="ts-filter-text">
					{ selectedChoice ? selectedChoice.label : 'Select...' }
				</span>
				<div className="ts-down-icon"></div>
			</div>

			{ isOpen && (
				<div className="ts-popup-list">
					<ul className="simplify-ul ts-form-options">
						{ ! addon.required && value.selected && (
							<li
								className="ts-option ts-option-clear"
								onClick={ handleClear }
								role="option"
							>
								<span>Clear selection</span>
							</li>
						) }
						{ choiceKeys.map( ( choiceKey ) => {
							const choice = choices[ choiceKey ];
							const isSelected = value.selected === choiceKey;
							const priceLabel = formatPrice( choice );

							return (
								<li
									key={ choiceKey }
									className={ `ts-option${ isSelected ? ' ts-selected' : '' }` }
									onClick={ () => handleSelect( choiceKey ) }
									role="option"
									aria-selected={ isSelected }
								>
									<span className="option-label">{ choice.label }</span>
									{ priceLabel && (
										<span className="option-price">{ priceLabel }</span>
									) }
								</li>
							);
						} ) }
					</ul>
				</div>
			) }
		</div>
	);
}

/**
 * Calculate pricing summary for this addon
 *
 * Evidence: voxel-product-form.beautified.js lines 684-721
 */
AddonSelect.getPricingSummary = function(
	addon: AddonConfig,
	value: AddonSelectValue,
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null,
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null,
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null
): AddonPricingSummary | null {
	const selected = value.selected;
	if ( selected === null ) return null;

	const choices = addon.props.choices ?? {};
	const choice = choices[ selected ];
	if ( ! choice ) return null;

	let label = choice.label;
	const repeatConfig = getRepeatConfig( addon );
	const customPrice = getCustomPrice( addon );
	let amount = 0;

	// Calculate price for date range bookings
	// Evidence: lines 695-712
	if ( repeatConfig !== null ) {
		amount = 0;
		const start = new Date( repeatConfig.start + 'T00:00:00Z' );
		const end = new Date( repeatConfig.end + 'T00:00:00Z' );

		while ( repeatConfig.count_mode === 'nights' ? start < end : start <= end ) {
			const priceDate = getCustomPriceForDate( start );

			if ( priceDate !== null ) {
				const addonPrices = priceDate.prices.addons?.[ addon.key ];
				// For select addons, the price is nested by choice key
				const choicePrices = addonPrices && typeof addonPrices === 'object' && ! ( 'price' in addonPrices )
					? ( addonPrices as Record<string, { price: number }> )[ selected ]
					: null;
				const cp = choicePrices?.price ?? null;
				amount += cp != null ? cp : choice.price;
			} else {
				amount += choice.price;
			}

			start.setDate( start.getDate() + 1 );
		}

		label += repeatConfig.label;
	} else {
		// Single day or regular product pricing
		let finalPrice = choice.price;
		if ( customPrice !== null ) {
			const addonPrices = customPrice.prices.addons?.[ addon.key ];
			const choicePrices = addonPrices && typeof addonPrices === 'object' && ! ( 'price' in addonPrices )
				? ( addonPrices as Record<string, { price: number }> )[ selected ]
				: null;
			const cp = choicePrices?.price ?? null;
			if ( cp != null ) {
				finalPrice = cp;
			}
		}
		amount = finalPrice;
	}

	return { label, amount };
};
