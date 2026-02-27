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

	const displayMode = addon.props.display_mode ?? 'cards';

	if ( ! shouldShowAddon() ) {
		return null;
	}

	/**
	 * Render quantity stepper for a selected choice
	 * Evidence: custom-select.php shared across radio/cards modes
	 */
	const renderQuantityStepper = ( choice: AddonChoice ) => {
		if ( ! choice.quantity?.enabled || value.selected.item !== choice.value ) return null;
		return (
			<div
				className="ts-stepper-input flexify custom-addon-stepper"
				onClick={ ( e ) => e.stopPropagation() }
			>
				<button
					type="button"
					className={ `ts-stepper-left ts-icon-btn ts-smaller${ ( choice.quantity?.min ?? 1 ) >= value.selected.quantity ? ' vx-disabled' : '' }` }
					onClick={ () => decrementQuantity( choice ) }
				>
					<i className="las la-minus" />
				</button>
				<input
					type="number"
					value={ value.selected.quantity }
					onChange={ ( e ) => {
						const val = parseInt( e.target.value, 10 );
						if ( ! isNaN( val ) ) {
							onChange( { selected: { item: value.selected.item, quantity: val } } );
						}
					} }
					onBlur={ () => validateQuantity( choice ) }
					className="ts-input-box ts-smaller"
				/>
				<button
					type="button"
					className={ `ts-stepper-right ts-icon-btn ts-smaller${ ( choice.quantity?.max ?? 999 ) <= value.selected.quantity ? ' vx-disabled' : '' }` }
					onClick={ () => incrementQuantity( choice ) }
				>
					<i className="las la-plus" />
				</button>
			</div>
		);
	};

	// Radio mode
	// Evidence: templates/widgets/product-form/form-addons/custom-select.php:6-37
	if ( displayMode === 'radio' ) {
		return (
			<div className="ts-form-group ts-custom-additions ts-addon-custom-select">
				<label>{ addon.label }</label>
				<ul className="simplify-ul ts-addition-list flexify">
					{ choiceValues.map( ( choice ) => {
						if ( ! shouldShowChoice( choice ) ) return null;
						const isSelected = value.selected.item === choice.value;
						const priceLabel = formatPrice( choice );

						return (
							<li
								key={ choice.value }
								className={ `flexify${ isSelected ? ' ts-checked' : '' }` }
							>
								<div
									className="addition-body"
									onClick={ () => toggleChoice( choice ) }
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
								{ renderQuantityStepper( choice ) }
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}

	// Buttons mode
	// Evidence: templates/widgets/product-form/form-addons/custom-select.php:38-49
	if ( displayMode === 'buttons' ) {
		return (
			<div className="ts-form-group ts-addon-custom-select">
				<label>{ addon.label }</label>
				<ul className="simplify-ul addon-buttons flexify">
					{ choiceValues.map( ( choice ) => {
						if ( ! shouldShowChoice( choice ) ) return null;
						return (
							<li
								key={ choice.value }
								className={ `flexify${ value.selected.item === choice.value ? ' adb-selected' : '' }` }
								onClick={ () => toggleChoice( choice ) }
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
	// Evidence: templates/widgets/product-form/form-addons/custom-select.php:84-98
	if ( displayMode === 'dropdown' ) {
		return (
			<div className="ts-form-group ts-addon-custom-select">
				<label>{ addon.label }</label>
				<div className="ts-filter">
					<select
						value={ value.selected.item ?? '' }
						onChange={ ( e ) => {
							const val = e.target.value;
							if ( val ) {
								const choice = choices[ val ];
								if ( choice ) {
									toggleChoice( choice );
								}
							} else if ( ! addon.required ) {
								onChange( { selected: { item: null, quantity: 1 } } );
							}
						} }
					>
						{ ! addon.required && (
							<option value="">Select choice</option>
						) }
						{ choiceValues.map( ( choice ) => {
							if ( ! shouldShowChoice( choice ) ) return null;
							return (
								<option key={ choice.value } value={ choice.value }>
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

	// Cards mode (default)
	// Evidence: templates/widgets/product-form/form-addons/custom-select.php:50-83
	return (
		<div className="ts-form-group ts-addon-custom-select">
			<label>{ addon.label }</label>
			<ul className="simplify-ul addon-cards flexify">
				{ choiceValues.map( ( choice ) => {
					if ( ! shouldShowChoice( choice ) ) return null;

					const isSelected = value.selected.item === choice.value;
					const priceLabel = formatPrice( choice );
					const imageData = choice.image as { url?: string; alt?: string } | string | null;

					return (
						<li
							key={ choice.value }
							className={ `flexify${ isSelected ? ' adc-selected' : '' }` }
							onClick={ () => toggleChoice( choice ) }
						>
							{ imageData && (
								typeof imageData === 'string'
									? <img src={ imageData } alt={ choice.label } />
									: imageData.url
										? <img src={ imageData.url } title={ imageData.alt } alt={ imageData.alt } />
										: null
							) }
							<div className="addon-details">
								<span className="adc-title">{ choice.label }</span>
								{ choice.subheading && (
									<span className="adc-subtitle">{ choice.subheading }</span>
								) }
								{ priceLabel && (
									<div className="vx-addon-price">{ priceLabel }</div>
								) }
							</div>
							{ renderQuantityStepper( choice ) }
						</li>
					);
				} ) }
			</ul>
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
