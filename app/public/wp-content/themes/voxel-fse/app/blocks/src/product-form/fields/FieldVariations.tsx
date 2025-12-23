/**
 * FieldVariations Component
 *
 * Manages product variations (e.g., Size/Color combinations).
 * Handles complex logic for:
 * - Attribute selection with availability filtering
 * - Stock management per variation
 * - Automatic variation matching
 * - Quantity validation
 * - Image gallery synchronization
 *
 * Evidence: voxel-product-form.beautified.js lines 1260-1600
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import VariationAttribute from './VariationAttribute';
import type {
	VariationsFieldConfig,
	VariationsValue,
	Variation,
	VariationAttribute as VariationAttributeType,
	VariationPricingSummary,
} from '../types';

export interface FieldVariationsProps {
	field: VariationsFieldConfig;
	value: VariationsValue;
	onChange: ( value: VariationsValue ) => void;
}

/**
 * FieldVariations - Product variation selector
 *
 * Evidence: voxel-product-form.beautified.js lines 1260-1600
 */
export default function FieldVariations( {
	field,
	value,
	onChange,
}: FieldVariationsProps ) {
	// Local selections state (reactive copy of field.props.selections)
	const [ selections, setSelections ] = useState<Record<string, string>>(
		() => ( { ...field.props.selections } )
	);

	const attributes = useMemo(
		() => Object.values( field.props.attributes ),
		[ field.props.attributes ]
	);
	const variations = field.props.variations;
	const stockEnabled = field.props.stock?.enabled ?? false;

	/**
	 * Get current variation object
	 *
	 * Evidence: lines 1596-1598
	 */
	const currentVariation = useMemo( (): Variation | null => {
		if ( ! value.variation_id ) return null;
		return variations[ value.variation_id ] ?? null;
	}, [ value.variation_id, variations ] );

	/**
	 * Validate quantity for current variation
	 *
	 * Sets quantity to 1 if:
	 * - Stock is disabled
	 * - Variation stock is disabled
	 * - Variation is sold individually
	 *
	 * Otherwise validates quantity is within stock bounds.
	 *
	 * Evidence: lines 1507-1515
	 */
	const validateQuantity = useCallback( () => {
		if ( ! currentVariation ) return;

		if (
			stockEnabled &&
			currentVariation.config.stock.enabled &&
			! currentVariation.config.stock.sold_individually
		) {
			// Validate within bounds
			const maxQty = currentVariation.config.stock.quantity;
			if ( value.quantity > maxQty ) {
				onChange( { ...value, quantity: maxQty } );
			} else if ( value.quantity < 1 ) {
				onChange( { ...value, quantity: 1 } );
			}
		} else {
			// Force quantity to 1
			if ( value.quantity !== 1 ) {
				onChange( { ...value, quantity: 1 } );
			}
		}
	}, [ currentVariation, stockEnabled, value, onChange ] );

	/**
	 * Validate current attribute selections
	 *
	 * Ensures the selected combination of attributes matches an actual variation.
	 * If no exact match exists, falls back to the first active variation.
	 * Updates variation_id and quantity accordingly.
	 *
	 * Evidence: lines 1451-1495
	 */
	const validateSelection = useCallback( () => {
		let matchedVariation: Variation | null = null;
		const activeVariations = Object.values( variations ).filter(
			( v ) => v._status === 'active'
		);

		// Try to find exact match for current selections
		for ( const attributeKey of Object.keys( selections ) ) {
			const matchingVariations = activeVariations.filter( ( variation ) => {
				// Check if all selected attributes match this variation
				for ( const key of Object.keys( selections ) ) {
					if ( variation.attributes[ key ] !== selections[ key ] ) {
						return false;
					}
				}
				return true;
			} );

			if ( matchingVariations.length ) {
				matchedVariation = matchingVariations[ 0 ];
				break;
			}
		}

		// Fallback to first active variation if no match
		if ( ! matchedVariation && activeVariations.length ) {
			matchedVariation = activeVariations[ 0 ];

			// Update selections to match fallback variation
			const newSelections: Record<string, string> = {};
			Object.keys( selections ).forEach( ( key ) => {
				newSelections[ key ] = matchedVariation!.attributes[ key ];
			} );
			setSelections( newSelections );
		}

		if ( matchedVariation ) {
			// Update variation_id
			if ( value.variation_id !== matchedVariation.id ) {
				onChange( { ...value, variation_id: matchedVariation.id } );
			}

			// Scroll to variation image in gallery if it exists
			if ( matchedVariation.image ) {
				const imageElement = document.getElementById(
					'ts-media-' + matchedVariation.image.id
				);
				if ( imageElement?.parentElement ) {
					imageElement.parentElement.scrollLeft = imageElement.offsetLeft;
				}
			}
		}
	}, [ variations, selections, value, onChange ] );

	/**
	 * Set default variation selection
	 *
	 * Finds the first active (in-stock) variation and selects all its attributes.
	 *
	 * Evidence: lines 1415-1428
	 */
	const setDefaultSelection = useCallback( () => {
		// Find first active variation
		for ( const variation of Object.values( variations ) ) {
			if ( variation._status === 'active' ) {
				// Set all attribute selections to match this variation
				const newSelections: Record<string, string> = {};
				Object.keys( selections ).forEach( ( attributeKey ) => {
					newSelections[ attributeKey ] = variation.attributes[ attributeKey ];
				} );
				setSelections( newSelections );

				// Set variation_id
				onChange( { ...value, variation_id: variation.id } );
				break;
			}
		}
	}, [ variations, selections, value, onChange ] );

	/**
	 * Set attribute value and revalidate
	 *
	 * Called when user selects a different choice for an attribute.
	 *
	 * Evidence: lines 1439-1442
	 */
	const handleSetAttribute = useCallback(
		( attributeKey: string, attrValue: string ) => {
			setSelections( ( prev ) => ( {
				...prev,
				[ attributeKey ]: attrValue,
			} ) );
		},
		[]
	);

	// Validate selection when selections change
	useEffect( () => {
		validateSelection();
	}, [ selections ] );

	// Validate quantity when variation changes
	useEffect( () => {
		if ( currentVariation ) {
			validateQuantity();
		}
	}, [ currentVariation ] );

	// Set default selection on mount
	useEffect( () => {
		if ( ! value.variation_id ) {
			setDefaultSelection();
		}
	}, [] );

	/**
	 * Increment quantity
	 *
	 * Evidence: lines 1556-1563
	 */
	const incrementQuantity = useCallback( () => {
		if ( ! currentVariation ) return;

		const maxQty = currentVariation.config.stock.quantity;
		if ( typeof value.quantity !== 'number' ) {
			onChange( { ...value, quantity: 1 } );
		} else {
			const newVal = value.quantity + 1;
			onChange( {
				...value,
				quantity: newVal < 1 ? 1 : Math.min( newVal, maxQty ),
			} );
		}
	}, [ currentVariation, value, onChange ] );

	/**
	 * Decrement quantity
	 *
	 * Evidence: lines 1568-1574
	 */
	const decrementQuantity = useCallback( () => {
		if ( typeof value.quantity !== 'number' ) {
			onChange( { ...value, quantity: 1 } );
		} else {
			onChange( { ...value, quantity: Math.max( value.quantity - 1, 1 ) } );
		}
	}, [ value, onChange ] );

	/**
	 * Handle direct quantity input
	 */
	const handleQuantityChange = useCallback(
		( e: React.ChangeEvent<HTMLInputElement> ) => {
			const val = parseInt( e.target.value, 10 );
			if ( ! isNaN( val ) ) {
				onChange( { ...value, quantity: val } );
			}
		},
		[ value, onChange ]
	);

	/**
	 * Validate quantity on blur
	 *
	 * Evidence: lines 1579-1587
	 */
	const handleQuantityBlur = useCallback( () => {
		if ( ! currentVariation ) return;

		const maxQty = currentVariation.config.stock.quantity;
		if ( typeof value.quantity === 'number' ) {
			if ( value.quantity > maxQty ) {
				onChange( { ...value, quantity: maxQty } );
			} else if ( value.quantity < 1 ) {
				onChange( { ...value, quantity: 1 } );
			}
		}
	}, [ currentVariation, value, onChange ] );

	// Check if quantity selector should be shown
	const showQuantitySelector =
		currentVariation &&
		stockEnabled &&
		currentVariation.config.stock.enabled &&
		! currentVariation.config.stock.sold_individually;

	const maxQuantity = currentVariation?.config.stock.quantity ?? 1;

	if ( attributes.length === 0 ) {
		return null;
	}

	return (
		<div className="ts-field-variations">
			{/* Attribute selectors */}
			{ attributes.map( ( attribute ) => (
				<VariationAttribute
					key={ attribute.key }
					attribute={ attribute }
					allAttributes={ attributes }
					variations={ variations }
					selections={ selections }
					stockEnabled={ stockEnabled }
					onSelect={ handleSetAttribute }
				/>
			) ) }

			{/* Quantity selector for variable products */}
			{ showQuantitySelector && (
				<div className="ts-form-group ts-variation-quantity">
					<label>Quantity</label>
					<div className="ts-stepper-input">
						<button
							type="button"
							className="ts-stepper-btn ts-stepper-minus"
							onClick={ decrementQuantity }
							disabled={ value.quantity <= 1 }
						>
							<span className="ts-icon">-</span>
						</button>
						<input
							type="number"
							value={ value.quantity }
							onChange={ handleQuantityChange }
							onBlur={ handleQuantityBlur }
							min={ 1 }
							max={ maxQuantity }
							className="ts-stepper-value"
						/>
						<button
							type="button"
							className="ts-stepper-btn ts-stepper-plus"
							onClick={ incrementQuantity }
							disabled={ value.quantity >= maxQuantity }
						>
							<span className="ts-icon">+</span>
						</button>
					</div>
				</div>
			) }
		</div>
	);
}

/**
 * Get pricing summary for current variation
 *
 * Returns price and quantity information for display in pricing summary.
 *
 * Evidence: voxel-product-form.beautified.js lines 1524-1551
 */
FieldVariations.getPricingSummary = function (
	field: VariationsFieldConfig,
	value: VariationsValue
): VariationPricingSummary | null {
	if ( ! value.variation_id ) return null;

	const variation = field.props.variations[ value.variation_id ];
	if ( ! variation ) return null;

	const basePrice = variation.config.base_price;
	let amount =
		basePrice.discount_amount != null
			? basePrice.discount_amount
			: basePrice.amount;
	let quantity: number | null = null;

	// Include quantity if stock management is enabled
	const stockEnabled = field.props.stock?.enabled ?? false;
	if (
		stockEnabled &&
		variation.config.stock.enabled &&
		! variation.config.stock.sold_individually
	) {
		quantity = value.quantity;
		amount *= value.quantity;
	}

	// Build label from attribute choices
	const labels: string[] = [];
	Object.keys( variation.attributes ).forEach( ( attributeKey ) => {
		const choiceValue = variation.attributes[ attributeKey ];
		const attribute = field.props.attributes[ attributeKey ];
		if ( attribute ) {
			const choice = attribute.props.choices[ 'choice_' + choiceValue ];
			if ( choice ) {
				labels.push( choice.label );
			}
		}
	} );

	return {
		label: labels.join( ' / ' ),
		amount,
		quantity,
	};
};
