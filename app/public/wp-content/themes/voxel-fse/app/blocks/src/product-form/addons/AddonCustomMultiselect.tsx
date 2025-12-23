/**
 * AddonCustomMultiselect Component
 *
 * Button-based multi-selection with optional quantity per choice.
 * Similar to CustomSelect but allows multiple selections.
 *
 * Evidence: voxel-product-form.beautified.js lines 883-1014
 *
 * @package VoxelFSE
 */

import { useCallback } from 'react';
import type {
	AddonConfig,
	AddonCustomMultiselectValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
	AddonChoice,
} from '../types';

export interface AddonCustomMultiselectProps {
	addon: AddonConfig;
	value: AddonCustomMultiselectValue;
	onChange: ( value: AddonCustomMultiselectValue ) => void;
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null;
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null;
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null;
}

/**
 * AddonCustomMultiselect - Card-style multi-select with quantity
 *
 * Evidence: voxel-product-form.beautified.js lines 883-1014
 */
export default function AddonCustomMultiselect( {
	addon,
	value,
	onChange,
}: AddonCustomMultiselectProps ) {
	const choices = addon.props.choices ?? {};
	const choiceValues = Object.values( choices );
	const selections = value.selected ?? [];

	/**
	 * Check if addon should be visible
	 * Evidence: lines 898-899
	 */
	const shouldShowAddon = (): boolean => {
		return ! addon._has_external_handler || selections.length > 0;
	};

	/**
	 * Check if specific choice should be visible
	 * Evidence: lines 902-904
	 */
	const shouldShowChoice = ( choice: AddonChoice ): boolean => {
		return ! addon._has_external_handler || isChecked( choice );
	};

	/**
	 * Get selection index for a choice
	 * Evidence: lines 906-908
	 */
	const getSelectionIndex = ( choice: AddonChoice ): number => {
		return selections.findIndex( ( sel ) => sel.item === choice.value );
	};

	/**
	 * Check if choice is selected
	 * Evidence: lines 910-912
	 */
	const isChecked = ( choice: AddonChoice ): boolean => {
		return getSelectionIndex( choice ) !== -1;
	};

	/**
	 * Toggle choice selection
	 * Evidence: lines 914-924
	 */
	const toggleChoice = useCallback( ( choice: AddonChoice ) => {
		const idx = getSelectionIndex( choice );
		const newSelections = [ ...selections ];

		if ( idx !== -1 ) {
			newSelections.splice( idx, 1 );
		} else {
			newSelections.push( {
				item: choice.value,
				quantity: choice.quantity?.min ?? 1,
			} );
		}

		onChange( { selected: newSelections } );
	}, [ selections, onChange ] );

	/**
	 * Validate quantity within choice bounds
	 * Evidence: lines 926-935
	 */
	const validateQuantity = useCallback( ( choice: AddonChoice ) => {
		const idx = getSelectionIndex( choice );
		if ( idx === -1 || ! choice.quantity?.enabled ) return;

		const qty = selections[ idx ].quantity;
		if ( typeof qty === 'number' ) {
			const newSelections = [ ...selections ];
			if ( qty > choice.quantity.max ) {
				newSelections[ idx ] = { ...newSelections[ idx ], quantity: choice.quantity.max };
				onChange( { selected: newSelections } );
			} else if ( qty < choice.quantity.min ) {
				newSelections[ idx ] = { ...newSelections[ idx ], quantity: choice.quantity.min };
				onChange( { selected: newSelections } );
			}
		}
	}, [ selections, onChange ] );

	/**
	 * Increment quantity for a choice
	 * Evidence: lines 937-948
	 */
	const incrementQuantity = useCallback( ( choice: AddonChoice ) => {
		const idx = getSelectionIndex( choice );
		if ( idx === -1 || ! choice.quantity?.enabled ) return;

		const newSelections = [ ...selections ];
		const currentQty = newSelections[ idx ].quantity;

		if ( typeof currentQty !== 'number' ) {
			newSelections[ idx ] = { ...newSelections[ idx ], quantity: choice.quantity.min };
		} else {
			const newVal = currentQty + 1;
			if ( newVal < choice.quantity.min ) {
				newSelections[ idx ] = { ...newSelections[ idx ], quantity: choice.quantity.min };
			} else {
				newSelections[ idx ] = {
					...newSelections[ idx ],
					quantity: Math.min( newVal, choice.quantity.max ),
				};
			}
		}

		onChange( { selected: newSelections } );
	}, [ selections, onChange ] );

	/**
	 * Decrement quantity for a choice
	 * Evidence: lines 950-958
	 */
	const decrementQuantity = useCallback( ( choice: AddonChoice ) => {
		const idx = getSelectionIndex( choice );
		if ( idx === -1 || ! choice.quantity?.enabled ) return;

		const newSelections = [ ...selections ];
		const currentQty = newSelections[ idx ].quantity;

		if ( typeof currentQty !== 'number' ) {
			newSelections[ idx ] = { ...newSelections[ idx ], quantity: choice.quantity.min };
		} else {
			newSelections[ idx ] = {
				...newSelections[ idx ],
				quantity: Math.max( currentQty - 1, choice.quantity.min ),
			};
		}

		onChange( { selected: newSelections } );
	}, [ selections, onChange ] );

	// Format price for a choice
	const formatPrice = ( choice: AddonChoice ): string => {
		if ( choice.price != null && choice.price > 0 ) {
			return `+${ choice.price.toLocaleString() }`;
		}
		return '';
	};

	if ( ! shouldShowAddon() ) {
		return null;
	}

	return (
		<div className="ts-form-group ts-addon-custom-multiselect">
			<label>{ addon.label }</label>
			<div className="ts-custom-select-cards ts-multi">
				{ choiceValues.map( ( choice ) => {
					if ( ! shouldShowChoice( choice ) ) return null;

					const idx = getSelectionIndex( choice );
					const isSelected = idx !== -1;
					const priceLabel = formatPrice( choice );
					const hasQuantity = choice.quantity?.enabled && isSelected;
					const currentQty = isSelected ? selections[ idx ].quantity : 1;

					return (
						<div
							key={ choice.value }
							className={ `ts-card-choice${ isSelected ? ' ts-selected' : '' }` }
							onClick={ () => toggleChoice( choice ) }
							role="option"
							aria-selected={ isSelected }
						>
							<div className="ts-checkbox-container">
								<label className="container-checkbox">
									<input
										type="checkbox"
										checked={ isSelected }
										onChange={ () => {} }
										tabIndex={ -1 }
									/>
									<span className="checkmark"></span>
								</label>
							</div>
							{ choice.image && (
								<div className="ts-card-image">
									<img src={ choice.image } alt={ choice.label } />
								</div>
							) }
							<div className="ts-card-content">
								<span className="ts-card-label">{ choice.label }</span>
								{ priceLabel && (
									<span className="ts-card-price">{ priceLabel }</span>
								) }
							</div>
							{ hasQuantity && (
								<div
									className="ts-stepper-input"
									onClick={ ( e ) => e.stopPropagation() }
								>
									<button
										type="button"
										className="ts-stepper-btn ts-stepper-minus"
										onClick={ () => decrementQuantity( choice ) }
										disabled={ currentQty <= ( choice.quantity?.min ?? 1 ) }
									>
										<span className="ts-icon">-</span>
									</button>
									<span className="ts-stepper-value">
										{ currentQty }
									</span>
									<button
										type="button"
										className="ts-stepper-btn ts-stepper-plus"
										onClick={ () => incrementQuantity( choice ) }
										disabled={ currentQty >= ( choice.quantity?.max ?? 999 ) }
									>
										<span className="ts-icon">+</span>
									</button>
								</div>
							) }
						</div>
					);
				} ) }
			</div>
		</div>
	);
}

/**
 * Calculate pricing summary for all selected choices
 * Evidence: voxel-product-form.beautified.js lines 960-1012
 */
AddonCustomMultiselect.getPricingSummary = function(
	addon: AddonConfig,
	value: AddonCustomMultiselectValue,
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null,
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null,
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null
): AddonPricingSummary[] {
	const summaries: AddonPricingSummary[] = [];
	const repeatConfig = getRepeatConfig( addon );
	const customPrice = getCustomPrice( addon );
	const choices = addon.props.choices ?? {};
	const selections = value.selected ?? [];

	selections.forEach( ( selection ) => {
		const { item, quantity } = selection;
		if ( item === null ) return;

		const choice = choices[ item ];
		if ( ! choice ) return;

		let label = choice.label;
		if ( choice.quantity?.enabled && quantity >= 1 ) {
			label += ` × ${ quantity }`;
		}

		let amount = 0;

		// Calculate price for date range bookings
		// Evidence: lines 979-996
		if ( repeatConfig !== null ) {
			let amountPerDay = 0;
			const start = new Date( repeatConfig.start + 'T00:00:00Z' );
			const end = new Date( repeatConfig.end + 'T00:00:00Z' );

			while ( repeatConfig.count_mode === 'nights' ? start < end : start <= end ) {
				const priceDate = getCustomPriceForDate( start );

				if ( priceDate !== null ) {
					const addonPrices = priceDate.prices.addons?.[ addon.key ];
					const choicePrices = addonPrices && typeof addonPrices === 'object' && ! ( 'price' in addonPrices )
						? ( addonPrices as Record<string, { price: number }> )[ item ]
						: null;
					const cp = choicePrices?.price ?? null;
					amountPerDay += cp != null ? cp : choice.price;
				} else {
					amountPerDay += choice.price;
				}

				start.setDate( start.getDate() + 1 );
			}

			if ( choice.quantity?.enabled ) amountPerDay *= quantity;
			amount = amountPerDay;
			label += repeatConfig.label;
		} else {
			// Single day or regular product pricing
			let finalPrice = choice.price;
			if ( customPrice !== null ) {
				const addonPrices = customPrice.prices.addons?.[ addon.key ];
				const choicePrices = addonPrices && typeof addonPrices === 'object' && ! ( 'price' in addonPrices )
					? ( addonPrices as Record<string, { price: number }> )[ item ]
					: null;
				const cp = choicePrices?.price ?? null;
				if ( cp != null ) {
					finalPrice = cp;
				}
			}
			amount = finalPrice;

			if ( choice.quantity?.enabled ) amount *= quantity;
		}

		summaries.push( { label, amount } );
	} );

	return summaries;
};
