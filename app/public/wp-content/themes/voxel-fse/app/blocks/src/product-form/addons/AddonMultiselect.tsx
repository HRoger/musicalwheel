/**
 * AddonMultiselect Component
 *
 * Allows selection of multiple choices from a list. Each selected choice
 * adds its price to the total. Supports custom pricing and date ranges.
 *
 * Evidence: voxel-product-form.beautified.js lines 565-660
 *
 * @package VoxelFSE
 */

import { useCallback } from 'react';
import type {
	AddonConfig,
	AddonMultiselectValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
	AddonChoice,
} from '../types';

export interface AddonMultiselectProps {
	addon: AddonConfig;
	value: AddonMultiselectValue;
	onChange: ( value: AddonMultiselectValue ) => void;
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null;
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null;
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null;
}

/**
 * AddonMultiselect - Multiple selection from a list
 *
 * Evidence: voxel-product-form.beautified.js lines 565-660
 */
export default function AddonMultiselect( {
	addon,
	value,
	onChange,
}: AddonMultiselectProps ) {
	const choices = addon.props.choices ?? {};
	const choiceKeys = Object.keys( choices );
	const selectedItems = value.selected ?? [];

	/**
	 * Toggle a choice selection
	 *
	 * If already selected, removes it from the array.
	 * If not selected, adds it to the array.
	 *
	 * Evidence: lines 593-598
	 */
	const toggle = useCallback( ( choiceKey: string ) => {
		const newSelected = [ ...selectedItems ];
		const idx = newSelected.indexOf( choiceKey );

		if ( idx !== -1 ) {
			newSelected.splice( idx, 1 );
		} else {
			newSelected.push( choiceKey );
		}

		onChange( { selected: newSelected } );
	}, [ selectedItems, onChange ] );

	/**
	 * Clear all selections
	 */
	const handleClear = useCallback( () => {
		onChange( { selected: [] } );
	}, [ onChange ] );

	// Check if a choice is selected
	const isSelected = ( choiceKey: string ): boolean => {
		return selectedItems.includes( choiceKey );
	};

	const displayMode = addon.props.display_mode ?? 'checkboxes';

	// Format price for a choice
	const formatPrice = ( choice: AddonChoice ): string => {
		if ( choice.price != null && choice.price > 0 ) {
			return `+${ choice.price.toLocaleString() }`;
		}
		return '';
	};

	// Buttons mode
	// Evidence: templates/widgets/product-form/form-addons/multiselect.php:6-15
	if ( displayMode === 'buttons' ) {
		return (
			<div className="ts-form-group ts-addon-multiselect">
				<label>{ addon.label }</label>
				<ul className="simplify-ul addon-buttons flexify">
					{ choiceKeys.map( ( choiceKey ) => {
						const choice = choices[ choiceKey ];
						return (
							<li
								key={ choiceKey }
								className={ `flexify${ isSelected( choiceKey ) ? ' adb-selected' : '' }` }
								onClick={ () => toggle( choiceKey ) }
							>
								{ choice.label }
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}

	// Checkboxes mode (default)
	// Evidence: templates/widgets/product-form/form-addons/multiselect.php:16-35
	return (
		<div className="ts-form-group inline-terms-wrapper ts-inline-filter ts-addon-multiselect">
			<label>{ addon.label }</label>
			<ul className="simplify-ul ts-addition-list flexify">
				{ choiceKeys.map( ( choiceKey ) => {
					const choice = choices[ choiceKey ];
					const checked = isSelected( choiceKey );
					const priceLabel = formatPrice( choice );

					return (
						<li
							key={ choiceKey }
							className={ `flexify${ checked ? ' ts-checked' : '' }` }
						>
							<div
								className="addition-body"
								onClick={ () => toggle( choiceKey ) }
							>
								<label className="container-checkbox">
									<input
										type="checkbox"
										checked={ checked }
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
 * Calculate pricing summary for all selected choices
 *
 * Returns an array of pricing summaries, one for each selected choice.
 *
 * Evidence: voxel-product-form.beautified.js lines 612-658
 */
AddonMultiselect.getPricingSummary = function(
	addon: AddonConfig,
	value: AddonMultiselectValue,
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null,
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null,
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null
): AddonPricingSummary[] {
	const summaries: AddonPricingSummary[] = [];
	const repeatConfig = getRepeatConfig( addon );
	const customPrice = getCustomPrice( addon );
	const choices = addon.props.choices ?? {};
	const selectedItems = value.selected ?? [];

	selectedItems.forEach( ( selectedValue ) => {
		const choiceKey = selectedValue;
		if ( choiceKey === null ) return;

		const choice = choices[ choiceKey ];
		if ( ! choice ) return;

		let label = choice.label;
		let amount = 0;

		// Calculate price for date range bookings
		// Evidence: lines 628-646
		if ( repeatConfig !== null ) {
			amount = 0;
			const start = new Date( repeatConfig.start + 'T00:00:00Z' );
			const end = new Date( repeatConfig.end + 'T00:00:00Z' );

			while ( repeatConfig.count_mode === 'nights' ? start < end : start <= end ) {
				const priceDate = getCustomPriceForDate( start );

				if ( priceDate !== null ) {
					const addonPrices = priceDate.prices.addons?.[ addon.key ];
					const choicePrices = addonPrices && typeof addonPrices === 'object' && ! ( 'price' in addonPrices )
						? ( addonPrices as Record<string, { price: number }> )[ choiceKey ]
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
					? ( addonPrices as Record<string, { price: number }> )[ choiceKey ]
					: null;
				const cp = choicePrices?.price ?? null;
				if ( cp != null ) {
					finalPrice = cp;
				}
			}
			amount = finalPrice;
		}

		summaries.push( { label, amount } );
	} );

	return summaries;
};
