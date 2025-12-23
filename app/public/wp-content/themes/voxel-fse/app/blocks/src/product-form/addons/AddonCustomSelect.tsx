/**
 * AddonCustomSelect Component
 *
 * Button-based selection with optional quantity per choice.
 * Used for visual selection interfaces (e.g., room types, meal plans).
 * Supports external handlers for integration with pricing cards.
 *
 * Evidence: voxel-product-form.beautified.js lines 734-873
 *
 * @package VoxelFSE
 */

import { useEffect, useCallback } from 'react';
import type {
	AddonConfig,
	AddonCustomSelectValue,
	AddonPricingSummary,
	RepeatConfig,
	CustomPriceConfig,
	AddonChoice,
} from '../types';

export interface AddonCustomSelectProps {
	addon: AddonConfig;
	value: AddonCustomSelectValue;
	onChange: ( value: AddonCustomSelectValue ) => void;
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null;
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null;
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null;
}

/**
 * AddonCustomSelect - Card-style single select with quantity
 *
 * Evidence: voxel-product-form.beautified.js lines 734-873
 */
export default function AddonCustomSelect( {
	addon,
	value,
	onChange,
}: AddonCustomSelectProps ) {
	const choices = addon.props.choices ?? {};
	const choiceValues = Object.values( choices );

	// Auto-select first choice if required
	// Evidence: lines 748-753
	useEffect( () => {
		if ( addon.required && value.selected.item === null && choiceValues.length > 0 ) {
			const firstChoice = choiceValues[ 0 ];
			onChange( {
				selected: {
					item: firstChoice.value,
					quantity: firstChoice.quantity?.enabled ? firstChoice.quantity.min : 1,
				},
			} );
		}
	}, [ addon.required, value.selected.item, choiceValues, onChange ] );

	/**
	 * Check if addon should be visible
	 * Hidden when external handler is active and no selection made
	 * Evidence: lines 761-763
	 */
	const shouldShowAddon = (): boolean => {
		return ! addon._has_external_handler || value.selected.item !== null;
	};

	/**
	 * Check if specific choice should be visible
	 * Evidence: lines 768-770
	 */
	const shouldShowChoice = ( choice: AddonChoice ): boolean => {
		return ! addon._has_external_handler || value.selected.item === choice.value;
	};

	/**
	 * Toggle choice selection
	 * Evidence: lines 775-781
	 */
	const toggleChoice = useCallback( ( choice: AddonChoice ) => {
		if ( choice && value.selected.item !== choice.value ) {
			onChange( {
				selected: {
					item: choice.value,
					quantity: choice.quantity?.enabled ? choice.quantity.min : 1,
				},
			} );
		} else if ( ! addon.required ) {
			onChange( {
				selected: {
					item: null,
					quantity: 1,
				},
			} );
		}
	}, [ addon.required, value.selected.item, onChange ] );

	/**
	 * Validate quantity within choice bounds
	 * Evidence: lines 787-795
	 */
	const validateQuantity = useCallback( ( choice: AddonChoice ) => {
		const qty = value.selected.quantity;
		if ( typeof qty === 'number' && choice.quantity?.enabled ) {
			if ( qty > choice.quantity.max ) {
				onChange( {
					selected: { item: value.selected.item, quantity: choice.quantity.max },
				} );
			} else if ( qty < choice.quantity.min ) {
				onChange( {
					selected: { item: value.selected.item, quantity: choice.quantity.min },
				} );
			}
		}
	}, [ value.selected, onChange ] );

	/**
	 * Increment quantity for selected choice
	 * Evidence: lines 800-810
	 */
	const incrementQuantity = useCallback( ( choice: AddonChoice ) => {
		if ( ! choice.quantity?.enabled ) return;

		const currentQty = value.selected.quantity;
		if ( typeof currentQty !== 'number' ) {
			onChange( { selected: { item: value.selected.item, quantity: choice.quantity.min } } );
		} else {
			const newVal = currentQty + 1;
			if ( newVal < choice.quantity.min ) {
				onChange( { selected: { item: value.selected.item, quantity: choice.quantity.min } } );
			} else {
				onChange( {
					selected: {
						item: value.selected.item,
						quantity: Math.min( newVal, choice.quantity.max ),
					},
				} );
			}
		}
	}, [ value.selected, onChange ] );

	/**
	 * Decrement quantity for selected choice
	 * Evidence: lines 816-821
	 */
	const decrementQuantity = useCallback( ( choice: AddonChoice ) => {
		if ( ! choice.quantity?.enabled ) return;

		const currentQty = value.selected.quantity;
		if ( typeof currentQty !== 'number' ) {
			onChange( { selected: { item: value.selected.item, quantity: choice.quantity.min } } );
		} else {
			onChange( {
				selected: {
					item: value.selected.item,
					quantity: Math.max( currentQty - 1, choice.quantity.min ),
				},
			} );
		}
	}, [ value.selected, onChange ] );

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
		<div className="ts-form-group ts-addon-custom-select">
			<label>{ addon.label }</label>
			<div className="ts-custom-select-cards">
				{ choiceValues.map( ( choice ) => {
					if ( ! shouldShowChoice( choice ) ) return null;

					const isSelected = value.selected.item === choice.value;
					const priceLabel = formatPrice( choice );
					const hasQuantity = choice.quantity?.enabled && isSelected;

					return (
						<div
							key={ choice.value }
							className={ `ts-card-choice${ isSelected ? ' ts-selected' : '' }` }
							onClick={ () => toggleChoice( choice ) }
							role="option"
							aria-selected={ isSelected }
						>
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
										disabled={ value.selected.quantity <= ( choice.quantity?.min ?? 1 ) }
									>
										<span className="ts-icon">-</span>
									</button>
									<span className="ts-stepper-value">
										{ value.selected.quantity }
									</span>
									<button
										type="button"
										className="ts-stepper-btn ts-stepper-plus"
										onClick={ () => incrementQuantity( choice ) }
										disabled={ value.selected.quantity >= ( choice.quantity?.max ?? 999 ) }
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
 * Calculate pricing summary
 * Evidence: voxel-product-form.beautified.js lines 827-871
 */
AddonCustomSelect.getPricingSummary = function(
	addon: AddonConfig,
	value: AddonCustomSelectValue,
	getRepeatConfig: ( addon: AddonConfig ) => RepeatConfig | null,
	getCustomPrice: ( addon: AddonConfig ) => CustomPriceConfig | null,
	getCustomPriceForDate: ( date: Date ) => CustomPriceConfig | null
): AddonPricingSummary | null {
	const { item, quantity } = value.selected;
	if ( item === null ) return null;

	const choices = addon.props.choices ?? {};
	const choice = choices[ item ];
	if ( ! choice ) return null;

	let label = choice.label;
	if ( choice.quantity?.enabled && quantity >= 1 ) {
		label += ` × ${ quantity }`;
	}

	const repeatConfig = getRepeatConfig( addon );
	const customPrice = getCustomPrice( addon );
	let amount = 0;

	// Calculate price for date range bookings
	// Evidence: lines 843-861
	if ( repeatConfig !== null ) {
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
				amount += cp != null ? cp : choice.price;
			} else {
				amount += choice.price;
			}

			start.setDate( start.getDate() + 1 );
		}

		if ( choice.quantity?.enabled ) amount *= quantity;
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

	return { label, amount };
};
