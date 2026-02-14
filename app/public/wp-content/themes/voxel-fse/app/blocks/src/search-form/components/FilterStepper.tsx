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
 * Props from frontend_props() (stepper-filter.php:143-157):
 *   value, step_size, precision, range_start, range_end, placeholder, display_as
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

/**
 * Debounce utility matching Voxel.helpers.debounce
 * Evidence: search-form.js created() { this.debouncedSave = Voxel.helpers.debounce(() => this.saveValue(), 300) }
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

	// Evidence: stepper-filter.php:143-157 frontend_props() returns these exact keys
	const rangeStart = typeof props.range_start === 'number' ? props.range_start : 0;
	const rangeEnd = typeof props.range_end === 'number' ? props.range_end : 1000;
	const stepSize = typeof props.step_size === 'number' ? props.step_size : 1;
	// Evidence: stepper-filter.php:145 precision = decimal places in step_size
	// Used by Voxel JS: Number(e.toFixed(this.filter.props.precision))
	const precision = typeof props.precision === 'number' ? props.precision : 0;
	const placeholder = props.placeholder || filterData.label || 'Any';
	// Evidence: stepper-filter.php:155 default is 'popup'
	const displayAs = config.displayAs || props.display_as || 'popup';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	const triggerRef = useRef< HTMLDivElement >( null );
	const inputRef = useRef< HTMLInputElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );

	// Evidence: search-form.js data() { return { value: this.filter.props.value } }
	// Value is number | '' (empty string for unfilled state)
	const [ localValue, setLocalValue ] = useState< number | '' >(
		typeof value === 'number' ? value : ''
	);

	/**
	 * setValue - normalize and clamp value
	 * Evidence: search-form.js setValue(e) {
	 *   if (e === "" || typeof e !== "number") { this.value = ""; return }
	 *   e < range_start => range_start; e > range_end => range_end;
	 *   this.value = Number(e.toFixed(this.filter.props.precision))
	 * }
	 */
	const setValue = useCallback( ( val: number | '' ): number | '' => {
		if ( val === '' || typeof val !== 'number' || isNaN( val ) ) {
			return '';
		}
		let clamped = val;
		if ( clamped < rangeStart ) clamped = rangeStart;
		if ( clamped > rangeEnd ) clamped = rangeEnd;
		return Number( clamped.toFixed( precision ) );
	}, [ rangeStart, rangeEnd, precision ] );

	/**
	 * isFilled - matches Voxel's isFilled() { return typeof this.value === "number" }
	 */
	const isFilled = useCallback( ( val: number | '' ): boolean => {
		return typeof val === 'number';
	}, [] );

	/**
	 * saveValue - normalize then commit
	 * Evidence: search-form.js saveValue() {
	 *   this.setValue(this.value);
	 *   this.filter.value = this.isFilled() ? this.value : null
	 * }
	 */
	const commitValue = useCallback( ( val: number | '' ) => {
		const normalized = setValue( val );
		if ( isFilled( normalized ) ) {
			onChange( normalized );
		} else {
			onChange( '' );
		}
	}, [ setValue, isFilled, onChange ] );

	// Debounced save for inline mode (300ms delay)
	// Evidence: search-form.js created() { this.debouncedSave = Voxel.helpers.debounce(() => this.saveValue(), 300) }
	const debouncedCommit = useMemo(
		() => debounce( ( val: number | '' ) => commitValue( val ), 300 ),
		[ commitValue ]
	);

	// Sync localValue from external value changes
	useEffect( () => {
		setLocalValue( typeof value === 'number' ? value : '' );
	}, [ value ] );

	// Sync local value when popup opens
	useEffect( () => {
		if ( isOpen ) {
			setLocalValue( typeof value === 'number' ? value : '' );
		}
	}, [ isOpen, value ] );

	/**
	 * increment - matches Voxel JS:
	 *   if (typeof this.value !== "number") { this.value = range_start; return }
	 *   this.setValue(this.value + step_size)
	 */
	const handleIncrement = ( e: React.MouseEvent ) => {
		e.preventDefault();
		let newValue: number;
		if ( typeof localValue !== 'number' ) {
			newValue = rangeStart;
		} else {
			newValue = setValue( localValue + stepSize ) as number;
			if ( typeof newValue !== 'number' ) newValue = rangeStart;
		}
		setLocalValue( newValue );
		if ( displayAs === 'inline' ) {
			debouncedCommit( newValue );
		}
	};

	/**
	 * decrement - matches Voxel JS:
	 *   if (typeof this.value !== "number") { this.value = range_start; return }
	 *   this.setValue(this.value - step_size)
	 */
	const handleDecrement = ( e: React.MouseEvent ) => {
		e.preventDefault();
		let newValue: number;
		if ( typeof localValue !== 'number' ) {
			newValue = rangeStart;
		} else {
			newValue = setValue( localValue - stepSize ) as number;
			if ( typeof newValue !== 'number' ) newValue = rangeStart;
		}
		setLocalValue( newValue );
		if ( displayAs === 'inline' ) {
			debouncedCommit( newValue );
		}
	};

	/**
	 * Input change handler - uses parseFloat (not parseInt!) because stepper supports decimal steps
	 * Evidence: stepper-filter.php:144 $step = abs( (float) $this->props['step_size'] )
	 * Inline mode also saves on @change (template line 18: @change="saveValue")
	 */
	const handleInputChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		const raw = e.target.value;
		if ( raw === '' ) {
			setLocalValue( '' );
			if ( displayAs === 'inline' ) {
				debouncedCommit( '' );
			}
			return;
		}
		const parsed = parseFloat( raw );
		if ( ! isNaN( parsed ) ) {
			const clamped = setValue( parsed );
			setLocalValue( clamped );
			if ( displayAs === 'inline' ) {
				debouncedCommit( clamped );
			}
		}
	};

	/**
	 * Inline input @change handler — matches Voxel template line 18: @change="saveValue"
	 * This fires when the input loses focus after typing, ensuring the value is committed
	 */
	const handleInlineInputCommit = useCallback( () => {
		commitValue( localValue );
	}, [ localValue, commitValue ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	/**
	 * onSave - matches Voxel JS: onSave() { this.saveValue(); this.$refs.formGroup.blur() }
	 */
	const handleSave = useCallback( () => {
		commitValue( localValue );
		setIsOpen( false );
	}, [ localValue, commitValue ] );

	/**
	 * onClear - matches Voxel JS: onClear() { this.value = ""; this.$refs.input.focus() }
	 * Note: Voxel clears to "" (empty), NOT to a default value
	 */
	const handleClear = useCallback( () => {
		setLocalValue( '' );
		onChange( '' );
		inputRef.current?.focus();
	}, [ onChange ] );

	// Display value for the popup trigger text
	// Evidence: template line 32: {{ filter.value ? filter.value : filter.props.placeholder }}
	const displayValue = typeof value === 'number' ? value : null;

	// Render stepper input (used in both inline and popup modes)
	const renderStepperInput = ( isInline: boolean ) => (
		<div className="ts-stepper-input flexify">
			<button
				type="button"
				className={ `ts-stepper-left ts-icon-btn${ isInline ? ' inline-btn-ts' : '' }` }
				onClick={ handleDecrement }
			>
				<i className="las la-minus"></i>
			</button>
			<input
				ref={ inputRef }
				type="number"
				className="ts-input-box"
				min={ rangeStart }
				max={ rangeEnd }
				step={ stepSize }
				value={ localValue }
				onChange={ handleInputChange }
				onBlur={ isInline ? handleInlineInputCommit : undefined }
				placeholder={ placeholder }
			/>
			<button
				type="button"
				className={ `ts-stepper-right ts-icon-btn${ isInline ? ' inline-btn-ts' : '' }` }
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
				{ renderStepperInput( true ) }
			</div>
		);
	}

	// Popup mode - matches Voxel's stepper-filter.php line 26-64
	// Evidence: search-form.js isFilled() { return typeof this.value === "number" }
	const hasValue = typeof value === 'number';
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
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">
					{ displayValue !== null ? displayValue : placeholder }
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
					{ renderStepperInput( false ) }
				</div>
			</FieldPopup>
		</div>
	);
}
