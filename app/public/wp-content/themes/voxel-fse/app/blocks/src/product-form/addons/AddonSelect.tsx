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

import { useEffect, useCallback } from 'react';
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
	// @ts-ignore -- unused but kept for future use
	const _handleSelect = useCallback( ( choiceKey: string ) => {
		onChange( { selected: choiceKey } );
	}, [ onChange ] );

	/**
	 * Clear selection
	 */
	// @ts-ignore -- unused but kept for future use
	const _handleClear = useCallback( () => {
		if ( ! addon.required ) {
			onChange( { selected: null } );
		}
	}, [ addon.required, onChange ] );

// @ts-ignore -- unused but kept for future use

	// Get selected choice for display
	const _selectedChoice: AddonChoice | null = value.selected ? choices[ value.selected ] ?? null : null;
	const displayMode = addon.props.display_mode ?? 'radio';

	// Format price for a choice
	const formatPrice = ( choice: AddonChoice ): string => {
		if ( choice.price != null && choice.price > 0 ) {
			return `+${ choice.price.toLocaleString() }`;
		}
		return '';
	};

	/**
	 * Toggle selection (for buttons/radio modes)
	 */
	const handleToggle = ( choiceKey: string ) => {
		if ( value.selected === choiceKey && ! addon.required ) {
			onChange( { selected: null } );
		} else {
			onChange( { selected: choiceKey } );
		}
	};

	// Buttons mode
	// Evidence: templates/widgets/product-form/form-addons/select.php:6-15
	if ( displayMode === 'buttons' ) {
		return (
			<div className="ts-form-group ts-addon-select">
				<label>{ addon.label }</label>
				<ul className="simplify-ul addon-buttons flexify">
					{ choiceKeys.map( ( choiceKey ) => {
						const choice = choices[ choiceKey ];
						return (
							<li
								key={ choiceKey }
								className={ `flexify${ value.selected === choiceKey ? ' adb-selected' : '' }` }
								onClick={ () => handleToggle( choiceKey ) }
							>
								{ choice.label }
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}

	// Dropdown mode
	// Evidence: templates/widgets/product-form/form-addons/select.php:16-27
	if ( displayMode === 'dropdown' ) {
		return (
			<div className="ts-form-group ts-addon-select">
				<label>{ addon.label }</label>
				<div className="ts-filter">
					<select
						value={ value.selected ?? '' }
						onChange={ ( e ) => {
							const val = e.target.value;
							onChange( { selected: val || null } );
						} }
					>
						{ ! addon.required && (
							<option value="">Select choice</option>
						) }
						{ choiceKeys.map( ( choiceKey ) => {
							const choice = choices[ choiceKey ];
							return (
								<option key={ choiceKey } value={ choiceKey }>
									{ choice.label }
								</option>
							);
						} ) }
					</select>
					<div className="ts-down-icon"></div>
				</div>
			</div>
		);
	}

	// Radio mode (default)
	// Evidence: templates/widgets/product-form/form-addons/select.php:28-46
	return (
		<div className="ts-form-group inline-terms-wrapper ts-inline-filter ts-addon-select">
			<label>{ addon.label }</label>
			<ul className="simplify-ul ts-addition-list flexify">
				{ choiceKeys.map( ( choiceKey ) => {
					const choice = choices[ choiceKey ];
					const isSelected = value.selected === choiceKey;
					const priceLabel = formatPrice( choice );

					return (
						<li
							key={ choiceKey }
							className={ `flexify${ isSelected ? ' ts-checked' : '' }` }
						>
							<div
								className="addition-body"
								onClick={ () => handleToggle( choiceKey ) }
							>
								<label className="container-radio">
									<input
										type="radio"
										checked={ isSelected }
										onChange={ () => {} }
										disabled
										hidden
									/>
									<span className="checkmark"></span>
								</label>
								<span>{ choice.label }</span>
								{ priceLabel && (
									<div className="vx-addon-price">{ priceLabel }</div>
								) }
							</div>
						</li>
					);
				} ) }
			</ul>
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
