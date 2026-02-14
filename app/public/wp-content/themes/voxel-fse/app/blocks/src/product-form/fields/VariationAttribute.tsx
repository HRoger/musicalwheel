/**
 * VariationAttribute Component
 *
 * Renders a single attribute selector (e.g., Size or Color).
 * Filters available choices based on other attribute selections.
 * Supports all 6 display types: buttons, radio, dropdown, cards, colors, images.
 *
 * Evidence: voxel-product-form.beautified.js lines 1274-1394
 * Evidence: themes/voxel/templates/widgets/product-form/form-variations.php lines 32-123
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
	 * Render buttons display type
	 *
	 * Evidence: form-variations.php:33-48
	 * Voxel classes: .addon-buttons, .adb-selected, .vx-disabled
	 */
	const renderButtons = () => (
		<div className="ts-form-group">
			<label>{ attribute.label }: { selectionLabel }</label>
			<ul className="simplify-ul addon-buttons flexify">
				{ activeChoices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<li
							key={ choice.value }
							className={ `flexify${ selected ? ' adb-selected' : '' }${ status !== 'active' ? ' vx-disabled' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								handleSelectChoice( choice );
							} }
						>
							{ choice.label }
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	/**
	 * Render radio display type
	 *
	 * Evidence: form-variations.php:49-64
	 * Voxel classes: .ts-custom-additions, .ts-addition-list, .ts-checked,
	 *   .addition-body, .container-radio, .checkmark, .vx-disabled
	 */
	const renderRadio = () => (
		<div className="ts-form-group ts-custom-additions">
			<label>{ attribute.label }: { selectionLabel }</label>
			<ul className="simplify-ul ts-addition-list flexify">
				{ activeChoices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<li
							key={ choice.value }
							className={ `flexify${ selected ? ' ts-checked' : '' }${ status !== 'active' ? ' vx-disabled' : '' }` }
						>
							<div
								className="addition-body"
								onClick={ ( e ) => {
									e.preventDefault();
									handleSelectChoice( choice );
								} }
							>
								<label className="container-radio">
									<input
										type="radio"
										checked={ selected }
										className="onoffswitch-checkbox"
										disabled
										hidden
										readOnly
									/>
									<span className="checkmark" />
								</label>
								<span>{ choice.label }</span>
							</div>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	/**
	 * Render dropdown display type
	 *
	 * Evidence: form-variations.php:65-77
	 * Voxel classes: .ts-filter, .ts-down-icon
	 */
	const renderDropdown = () => (
		<div className="ts-form-group">
			<label>{ attribute.label }: { selectionLabel }</label>
			<div className="ts-filter">
				<select
					value={ `choice_${ selections[ attribute.key ] }` }
					onChange={ ( e ) => {
						const choiceKey = e.target.value;
						const choice = attribute.props.choices[ choiceKey ];
						if ( choice ) {
							handleSelectChoice( choice );
						}
					} }
				>
					{ activeChoices.map( ( choice ) => {
						const status = getChoiceStatus( choice );

						return (
							<option
								key={ choice.value }
								value={ `choice_${ choice.value }` }
								disabled={ status !== 'active' }
							>
								{ choice.label }
							</option>
						);
					} ) }
				</select>
				<div className="ts-down-icon" />
			</div>
		</div>
	);

	/**
	 * Render cards display type
	 *
	 * Evidence: form-variations.php:78-98
	 * Voxel classes: .addon-cards, .adc-selected, .adc-title, .adc-subtitle,
	 *   .addon-details, .vx-disabled
	 */
	const renderCards = () => (
		<div className="ts-form-group">
			<label>{ attribute.label }: { selectionLabel }</label>
			<ul className="simplify-ul addon-cards flexify">
				{ activeChoices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<li
							key={ choice.value }
							className={ `flexify${ selected ? ' adc-selected' : '' }${ status !== 'active' ? ' vx-disabled' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								handleSelectChoice( choice );
							} }
						>
							{ choice.image && (
								<img
									src={ typeof choice.image === 'string' ? choice.image : choice.image.url }
									alt={ typeof choice.image === 'string' ? choice.label : ( choice.image.alt || choice.label ) }
									title={ typeof choice.image === 'string' ? choice.label : ( choice.image.alt || choice.label ) }
								/>
							) }
							<div className="addon-details">
								<span className="adc-title">{ choice.label }</span>
								{ choice.subheading && (
									<span className="adc-subtitle">{ choice.subheading }</span>
								) }
							</div>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	/**
	 * Render colors display type
	 *
	 * Evidence: form-variations.php:99-109
	 * Voxel classes: .addon-colors, color-selected, .vx-disabled
	 * Voxel uses --vx-var-color CSS variable for the color swatch
	 */
	const renderColors = () => (
		<div className="ts-form-group">
			<label>{ attribute.label }: { selectionLabel }</label>
			<ul className="simplify-ul addon-colors flexify">
				{ activeChoices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<li
							key={ choice.value }
							className={ `flexify${ selected ? ' color-selected' : '' }${ status !== 'active' ? ' vx-disabled' : '' }` }
							style={ { '--vx-var-color': choice.color || '#ccc' } as React.CSSProperties }
							onClick={ ( e ) => {
								e.preventDefault();
								handleSelectChoice( choice );
							} }
							title={ choice.label }
						/>
					);
				} ) }
			</ul>
		</div>
	);

	/**
	 * Render images display type
	 *
	 * Evidence: form-variations.php:110-122
	 * Voxel classes: .addon-images, .adm-selected, .vx-disabled
	 */
	const renderImages = () => (
		<div className="ts-form-group">
			<label>{ attribute.label }: { selectionLabel }</label>
			<ul className="simplify-ul addon-images flexify">
				{ activeChoices.map( ( choice ) => {
					const status = getChoiceStatus( choice );
					const selected = isSelected( choice );

					return (
						<li
							key={ choice.value }
							className={ `flexify${ selected ? ' adm-selected' : '' }${ status !== 'active' ? ' vx-disabled' : '' }` }
							onClick={ ( e ) => {
								e.preventDefault();
								handleSelectChoice( choice );
							} }
						>
							{ choice.image && (
								<img
									src={ typeof choice.image === 'string' ? choice.image : choice.image.url }
									alt={ typeof choice.image === 'string' ? choice.label : ( choice.image.alt || choice.label ) }
									title={ typeof choice.image === 'string' ? choice.label : ( choice.image.alt || choice.label ) }
								/>
							) }
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	// Render based on display type
	// Evidence: form-variations.php:33-122 — 6 display modes
	switch ( attribute.props?.display_mode || attribute.display_type ) {
		case 'buttons':
			return renderButtons();
		case 'radio':
			return renderRadio();
		case 'cards':
			return renderCards();
		case 'colors':
			return renderColors();
		case 'images':
			return renderImages();
		case 'dropdown':
		default:
			return renderDropdown();
	}
}
