/**
 * FilterStepper Component
 *
 * Stepper/counter filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/stepper-filter.php
 *
 * CRITICAL: Supports BOTH inline and popup modes based on config.displayAs
 * - Inline mode (line 2-25): Stepper rendered directly in form
 * - Popup mode (line 26-64): Stepper inside FieldPopup with trigger button
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

/**
 * Debounce utility matching Voxel.helpers.debounce
 * Evidence: voxel-search-form.beautified.js line 298
 */
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	return function(this: any, ...args: Parameters<T>) {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(this, args), delay);
	};
}

export default function FilterStepper( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';

	const props = filterData.props || {};
	const min = props.min ?? 0;
	const max = props.max ?? 99;
	const step = props.step ?? 1;
	const defaultValue = props.default ?? min;
	const placeholder = props.placeholder || filterData.label || 'Any';
	const displayAs = config.displayAs || filterData.props?.display_as || 'popup';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	const triggerRef = useRef< HTMLDivElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	const numValue = typeof value === 'number' ? value : defaultValue;
	const [ localValue, setLocalValue ] = useState( numValue );

	// Debounced onChange for inline mode (300ms delay)
	// Evidence: voxel-search-form.beautified.js line 298
	const debouncedOnChange = useMemo(
		() => debounce((newValue: number) => onChange(newValue), 300),
		[onChange]
	);

	useEffect( () => {
		setLocalValue( typeof value === 'number' ? value : defaultValue );
	}, [ value, defaultValue ] );

	// Sync local value when popup opens
	useEffect( () => {
		if ( isOpen ) {
			setLocalValue( numValue );
		}
	}, [ isOpen, numValue ] );

	const handleDecrement = ( e: React.MouseEvent ) => {
		e.preventDefault();
		const newValue = Math.max( min, localValue - step );
		setLocalValue( newValue );
		// In inline mode, save with 300ms debounce. In popup mode, save on popup close
		if ( displayAs === 'inline' ) {
			debouncedOnChange( newValue );
		}
	};

	const handleIncrement = ( e: React.MouseEvent ) => {
		e.preventDefault();
		const newValue = Math.min( max, localValue + step );
		setLocalValue( newValue );
		// In inline mode, save with 300ms debounce. In popup mode, save on popup close
		if ( displayAs === 'inline' ) {
			debouncedOnChange( newValue );
		}
	};

	const handleInputChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const newValue = parseInt( e.target.value, 10 );
		if ( ! isNaN( newValue ) ) {
			const clampedValue = Math.min( max, Math.max( min, newValue ) );
			setLocalValue( clampedValue );
			// In inline mode, save with 300ms debounce. In popup mode, save on popup close
			if ( displayAs === 'inline' ) {
				debouncedOnChange( clampedValue );
			}
		}
	};

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	const handleSave = useCallback( () => {
		onChange( localValue );
		setIsOpen( false );
	}, [ localValue, onChange ] );

	const handleClear = useCallback( () => {
		setLocalValue( defaultValue );
		onChange( defaultValue );
	}, [ defaultValue, onChange ] );

	// Render stepper input (used in both inline and popup modes)
	const renderStepperInput = () => (
		<div className="ts-stepper-input flexify">
			<button
				type="button"
				className="ts-stepper-left ts-icon-btn inline-btn-ts"
				onClick={ handleDecrement }
			>
				<i className="las la-minus"></i>
			</button>
			<input
				type="number"
				className="ts-input-box"
				min={ min }
				max={ max }
				step={ step }
				value={ localValue }
				onChange={ handleInputChange }
				placeholder={ placeholder }
			/>
			<button
				type="button"
				className="ts-stepper-right ts-icon-btn inline-btn-ts"
				onClick={ handleIncrement }
			>
				<i className="las la-plus"></i>
			</button>
		</div>
	);

	// Inline mode - matches Voxel's stepper-filter.php line 2-25
	if ( displayAs === 'inline' ) {
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group ts-inline-filter' );
		return (
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }
				{ renderStepperInput() }
			</div>
		);
	}

	// Popup mode - matches Voxel's stepper-filter.php line 26-64
	const hasValue = numValue !== defaultValue;
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<div className={ className } style={ style }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }

			{ /* Trigger button */ }
			<div
				ref={ triggerRef }
				className={ `ts-filter ts-popup-target ${ hasValue ? 'ts-filled' : '' }` }
				onClick={ openPopup }
				onMouseDown={ ( e ) => e.preventDefault() }
				role="button"
				tabIndex={ 0 }
			>
				{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
				{ /* If no icon configured, show NO icon (not a default fallback) */ }
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">
					{ hasValue ? localValue : placeholder }
				</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef }
				title=""
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ true }
				onSave={ handleSave }
				onClear={ handleClear }
				onClose={ () => setIsOpen( false ) }
				className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
				popupStyle={ popupStyles.style }
			>
				{ /* Popup content - matches Voxel's stepper-filter.php popup structure */ }
				<div className="ts-form-group">
					<label>
						{ filterData.label }
						{ filterData.description && <small>{ filterData.description }</small> }
					</label>
					{ renderStepperInput() }
				</div>
			</FieldPopup>
		</div>
	);
}
