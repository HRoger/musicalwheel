/**
 * VariationAttribute Component
 *
 * Renders a single attribute selector (e.g., Size or Color).
 * Filters available choices based on other attribute selections.
 * Supports multiple display types: dropdown, buttons, images, colors.
 *
 * Evidence: voxel-product-form.beautified.js lines 1274-1394
 *
 * @package VoxelFSE
 */

import { useCallback, useMemo, useState } from 'react';
import type {
	VariationAttribute as VariationAttributeType,
	Variation,
	VariationChoice,
	ChoiceStatus,
} from '../types';

export interface VariationAttributeProps {
	attribute: VariationAttributeType;
	allAttributes: VariationAttributeType[];
	variations: Record<string, Variation>;
	selections: Record<string, string>;
	stockEnabled: boolean;
	onSelect: ( attributeKey: string, value: string ) => void;
}

/**
 * VariationAttribute - Single attribute selector
 *
 * Evidence: voxel-product-form.beautified.js lines 1274-1394
 */
export default function VariationAttribute( {
	attribute,
	allAttributes,
	variations,
	selections,
	stockEnabled,
	onSelect,
}: VariationAttributeProps ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const choices = Object.values( attribute.props.choices );

	/**
	 * Get available variations for current selections
	 *
	 * Filters variations to only those matching OTHER attribute selections.
	 * This is used to determine which choices are available for THIS attribute.
	 *
	 * Evidence: lines 1314-1330
	 */
	const getAvailableVariations = useCallback( (): Variation[] => {
		return Object.values( variations ).filter( ( variation ) => {
			// Check if variation matches all OTHER attribute selections
			for ( const attr of allAttributes ) {
				// Skip this attribute (we're determining choices for it)
				if ( attr.key === attribute.key ) break;

				// If variation doesn't match the selected value for this other attribute, exclude it
				if ( selections[ attr.key ] !== variation.attributes[ attr.key ] ) {
					return false;
				}
			}
			return true;
		} );
	}, [ variations, allAttributes, attribute.key, selections ] );

	/**
	 * Get active (available) choices for this attribute
	 *
	 * Returns only choices that have at least one available variation.
	 *
	 * Evidence: lines 1339-1347
	 */
	const activeChoices = useMemo( (): VariationChoice[] => {
		const availableVariations = getAvailableVariations();

		return choices.filter( ( choice ) => {
			return availableVariations.find( ( variation ) => {
				return variation.attributes[ attribute.key ] === choice.value;
			} );
		} );
	}, [ choices, getAvailableVariations, attribute.key ] );

	/**
	 * Get status for a specific choice
	 *
	 * Returns:
	 * - "active": Choice is available and in stock
	 * - "out_of_stock": Choice exists but all variations are out of stock
	 * - "inactive": Choice doesn't exist in any available variation
	 *
	 * Evidence: lines 1360-1380
	 */
	const getChoiceStatus = useCallback( ( choice: VariationChoice ): ChoiceStatus => {
		const availableVariations = getAvailableVariations();

		// Filter to variations that have this choice
		const matchingVariations = availableVariations.filter( ( variation ) => {
			return variation.attributes[ attribute.key ] === choice.value;
		} );

		if ( ! matchingVariations.length ) {
			return 'inactive';
		}

		// Check stock if enabled
		if ( ! stockEnabled ) {
			return 'active';
		}

		// Check if any matching variation is in stock
		const inStock = matchingVariations.find( ( variation ) => variation._status === 'active' );
		return inStock ? 'active' : 'out_of_stock';
	}, [ getAvailableVariations, attribute.key, stockEnabled ] );

	/**
	 * Check if choice is currently selected
	 *
	 * Evidence: lines 1302-1304
	 */
	const isSelected = useCallback( ( choice: VariationChoice ): boolean => {
		return selections[ attribute.key ] === choice.value;
	}, [ selections, attribute.key ] );

	/**
	 * Select a choice for this attribute
	 *
	 * Evidence: lines 1292-1294
	 */
	const handleSelectChoice = useCallback( ( choice: VariationChoice ) => {
		const status = getChoiceStatus( choice );
		if ( status === 'inactive' ) return; // Can't select inactive choices

		onSelect( attribute.key, choice.value );
		setIsOpen( false );
	}, [ attribute.key, onSelect, getChoiceStatus ] );

	/**
	 * Get label for currently selected choice
	 *
	 * Evidence: lines 1389-1392
	 */
	const selectionLabel = useMemo( (): string => {
		const selectedValue = selections[ attribute.key ];
		const selectedChoice = choices.find( ( c ) => c.value === selectedValue );
		return selectedChoice?.label ?? 'Select';
	}, [ selections, attribute.key, choices ] );

	/**
	 * Render dropdown display type
	 */
	const renderDropdown = () => (
		<div className="ts-form-group ts-variation-attribute ts-variation-dropdown">
			<label>{ attribute.label }</label>
			<div
				className={ `ts-filter ts-popup-target${ selections[ attribute.key ] ? ' ts-filled' : '' }` }
				onClick={ () => setIsOpen( ! isOpen ) }
				role="button"
				tabIndex={ 0 }
				onKeyDown={ ( e ) => e.key === 'Enter' && setIsOpen( ! isOpen ) }
			>
				<span className="ts-filter-text">{ selectionLabel }</span>
				<div className="ts-down-icon"></div>
			</div>

			{ isOpen && (
				<div className="ts-popup-list">
					<ul className="simplify-ul ts-form-options">
						{ choices.map( ( choice ) => {
							const status = getChoiceStatus( choice );
							const selected = isSelected( choice );

							return (
								<li
									key={ choice.value }
									className={ `ts-option${ selected ? ' ts-selected' : '' }${ status === 'inactive' ? ' ts-inactive' : '' }${ status === 'out_of_stock' ? ' ts-out-of-stock' : '' }` }
									onClick={ () => handleSelectChoice( choice ) }
									role="option"
									aria-selected={ selected }
									aria-disabled={ status === 'inactive' }
								>
									<span className="option-label">{ choice.label }</span>
									{ status === 'out_of_stock' && (
										<span className="option-status">Out of stock</span>
									) }
								</li>
							);
						} ) }
					</ul>
				</div>
			) }
		</div>
	);

	/**
	 * Render buttons display type
	 */
	const renderButtons = () => (
		<div className="ts-form-group ts-variation-attribute ts-variation-buttons">
			<label>{ attribute.label }</label>
			<div className="ts-variation-options ts-buttons-list">
				{ choices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<button
							key={ choice.value }
							type="button"
							className={ `ts-btn ts-btn-4${ selected ? ' ts-selected' : '' }${ status === 'inactive' ? ' ts-inactive' : '' }${ status === 'out_of_stock' ? ' ts-out-of-stock' : '' }` }
							onClick={ () => handleSelectChoice( choice ) }
							disabled={ status === 'inactive' }
						>
							{ choice.label }
						</button>
					);
				} ) }
			</div>
		</div>
	);

	/**
	 * Render images display type
	 */
	const renderImages = () => (
		<div className="ts-form-group ts-variation-attribute ts-variation-images">
			<label>{ attribute.label }</label>
			<div className="ts-variation-options ts-images-list">
				{ choices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<div
							key={ choice.value }
							className={ `ts-variation-image${ selected ? ' ts-selected' : '' }${ status === 'inactive' ? ' ts-inactive' : '' }${ status === 'out_of_stock' ? ' ts-out-of-stock' : '' }` }
							onClick={ () => handleSelectChoice( choice ) }
							role="button"
							tabIndex={ status === 'inactive' ? -1 : 0 }
							title={ choice.label }
						>
							{ choice.image ? (
								<img src={ choice.image } alt={ choice.label } />
							) : (
								<span className="ts-image-placeholder">{ choice.label.charAt( 0 ) }</span>
							) }
						</div>
					);
				} ) }
			</div>
		</div>
	);

	/**
	 * Render colors display type
	 */
	const renderColors = () => (
		<div className="ts-form-group ts-variation-attribute ts-variation-colors">
			<label>{ attribute.label }</label>
			<div className="ts-variation-options ts-colors-list">
				{ choices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<div
							key={ choice.value }
							className={ `ts-variation-color${ selected ? ' ts-selected' : '' }${ status === 'inactive' ? ' ts-inactive' : '' }${ status === 'out_of_stock' ? ' ts-out-of-stock' : '' }` }
							onClick={ () => handleSelectChoice( choice ) }
							role="button"
							tabIndex={ status === 'inactive' ? -1 : 0 }
							title={ choice.label }
							style={ { backgroundColor: choice.color || '#ccc' } }
						>
							{ selected && <span className="ts-color-check">✓</span> }
						</div>
					);
				} ) }
			</div>
		</div>
	);

	// Render based on display type
	switch ( attribute.display_type ) {
		case 'buttons':
			return renderButtons();
		case 'images':
			return renderImages();
		case 'colors':
			return renderColors();
		case 'dropdown':
		default:
			return renderDropdown();
	}
}
