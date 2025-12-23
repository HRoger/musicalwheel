/**
 * FieldQuantity Component
 *
 * Simple quantity selector for regular products.
 * Allows users to select the number of items to add to cart.
 *
 * Evidence: voxel-product-form.beautified.js lines 1203-1244
 *
 * @package VoxelFSE
 */

import { useCallback } from 'react';

export interface FieldQuantityProps {
	maxQuantity: number;
	value: number;
	onChange: ( quantity: number ) => void;
	label?: string;
}

/**
 * FieldQuantity - Quantity stepper for regular products
 *
 * Evidence: voxel-product-form.beautified.js lines 1203-1244
 */
export default function FieldQuantity( {
	maxQuantity,
	value,
	onChange,
	label = 'Quantity',
}: FieldQuantityProps ) {
	/**
	 * Increment quantity by 1
	 * Evidence: lines 1217-1223
	 */
	const increment = useCallback( () => {
		if ( typeof value !== 'number' ) {
			onChange( 1 );
		} else {
			const newVal = value + 1;
			onChange( newVal < 1 ? 1 : Math.min( newVal, maxQuantity ) );
		}
	}, [ value, maxQuantity, onChange ] );

	/**
	 * Decrement quantity by 1
	 * Evidence: lines 1225-1231
	 */
	const decrement = useCallback( () => {
		if ( typeof value !== 'number' ) {
			onChange( 1 );
		} else {
			onChange( Math.max( value - 1, 1 ) );
		}
	}, [ value, onChange ] );

	/**
	 * Validate quantity is within bounds
	 * Evidence: lines 1234-1242
	 */
	const validateValueInBounds = useCallback( () => {
		if ( typeof value === 'number' ) {
			if ( value > maxQuantity ) {
				onChange( maxQuantity );
			} else if ( value < 1 ) {
				onChange( 1 );
			}
		}
	}, [ value, maxQuantity, onChange ] );

	/**
	 * Handle direct input change
	 */
	const handleInputChange = useCallback( ( e: React.ChangeEvent<HTMLInputElement> ) => {
		const val = parseInt( e.target.value, 10 );
		if ( ! isNaN( val ) ) {
			onChange( val );
		}
	}, [ onChange ] );

	const currentQty = value ?? 1;

	return (
		<div className="ts-form-group ts-field-quantity">
			<label>{ label }</label>
			<div className="ts-stepper-input">
				<button
					type="button"
					className="ts-stepper-btn ts-stepper-minus"
					onClick={ decrement }
					disabled={ currentQty <= 1 }
				>
					<span className="ts-icon">-</span>
				</button>
				<input
					type="number"
					value={ currentQty }
					onChange={ handleInputChange }
					onBlur={ validateValueInBounds }
					min={ 1 }
					max={ maxQuantity }
					className="ts-stepper-value"
				/>
				<button
					type="button"
					className="ts-stepper-btn ts-stepper-plus"
					onClick={ increment }
					disabled={ currentQty >= maxQuantity }
				>
					<span className="ts-icon">+</span>
				</button>
			</div>
		</div>
	);
}
