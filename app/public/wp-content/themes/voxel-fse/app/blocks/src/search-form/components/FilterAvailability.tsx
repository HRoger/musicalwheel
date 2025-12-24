/**
 * FilterAvailability Component
 *
 * Availability filter for booking/scheduling matching Voxel's HTML structure exactly.
 *
 * REUSES: FieldPopup and DatePicker from create-post block
 * - Portal-based popup positioning
 * - Pikaday calendar (Voxel's custom fork)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, FieldPopup, DatePicker } from '@shared';

interface AvailabilityValue {
	date?: string; // Single mode: "YYYY-MM-DD", Range mode: "YYYY-MM-DD..YYYY-MM-DD"
	start?: string; // Range mode start date
	end?: string; // Range mode end date
	slots?: number;
}

/**
 * Parse Voxel availability value - can be string or object
 * Evidence: voxel-search-form.beautified.js line 985
 */
function parseAvailabilityValue( value: unknown ): { date: string; slots: number } {
	// Handle null/undefined
	if ( value === null || value === undefined || value === '' ) {
		return { date: '', slots: 1 };
	}

	// Handle string format (Voxel API format)
	if ( typeof value === 'string' ) {
		return { date: value, slots: 1 };
	}

	// Handle legacy object format
	if ( typeof value === 'object' ) {
		const obj = value as AvailabilityValue;
		return {
			date: obj.date || '',
			slots: obj.slots || 1,
		};
	}

	return { date: '', slots: 1 };
}

// Helper to convert string to Date
const stringToDate = ( dateString: string | null ): Date | null => {
	if ( ! dateString ) return null;
	try {
		const date = new Date( dateString + 'T00:00:00' );
		return isFinite( date.getTime() ) ? date : null;
	} catch {
		return null;
	}
};

// Helper to convert Date to YYYY-MM-DD string
const dateToString = ( date: Date | null ): string | null => {
	if ( ! date ) return null;
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	return `${ year }-${ month }-${ day }`;
};

// Helper to format date for display
const formatDateForDisplay = ( dateString: string | null ): string => {
	if ( ! dateString ) return '';
	try {
		const date = new Date( dateString + 'T00:00:00' );
		if ( ! isFinite( date.getTime() ) ) return '';
		return date.toLocaleDateString( undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		} );
	} catch {
		return dateString;
	}
};

export default function FilterAvailability( {
	config,
	filterData,
	value,
	onChange,
}: FilterComponentProps ) {
	const triggerRef = useRef< HTMLDivElement >( null );
	const pickerInstanceRef = useRef< any >( null ); // Store Pikaday instance for setStartRange/setEndRange
	const [ isOpen, setIsOpen ] = useState( false );

	const props = filterData.props || {};
	// Voxel uses 'inputMode' with values 'single-date' or 'date-range'
	// Evidence: themes/voxel/app/post-types/filters/availability-filter.php:269
	const inputMode = props.inputMode || 'date-range'; // Default to date-range for bookings
	const isRangeMode = inputMode === 'date-range';
	const l10n = props.l10n || {};
	const placeholder = l10n.pickDate || filterData.label || 'Select dates';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Parse incoming value using Voxel format
	const parsed = parseAvailabilityValue( value );

	// For range mode, parse the "start..end" format
	// Evidence: voxel-search-form.beautified.js line 985
	const currentDate = parsed.date;
	const currentSlots = parsed.slots;

	let startDate = '';
	let endDate = '';
	if ( isRangeMode && currentDate && currentDate.includes( '..' ) ) {
		[ startDate, endDate ] = currentDate.split( '..' );
	} else if ( ! isRangeMode && currentDate ) {
		startDate = currentDate;
	}

	// Internal state
	const [ pickerDate, setPickerDate ] = useState< Date | null >( () => stringToDate( startDate ) );
	const [ pickerEndDate, setPickerEndDate ] = useState< Date | null >( () => stringToDate( endDate ) );
	const [ activePicker, setActivePicker ] = useState< 'start' | 'end' >( 'start' ); // For range mode
	const [ localSlots, setLocalSlots ] = useState( currentSlots );

	// Sync when popup opens
	useEffect( () => {
		if ( isOpen ) {
			if ( isRangeMode && currentDate && currentDate.includes( '..' ) ) {
				const [ start, end ] = currentDate.split( '..' );
				setPickerDate( stringToDate( start ) );
				setPickerEndDate( stringToDate( end ) );
			} else if ( ! isRangeMode && currentDate ) {
				setPickerDate( stringToDate( currentDate ) );
			}
			setLocalSlots( currentSlots );
			setActivePicker( 'start' );
		}
	}, [ isOpen, isRangeMode, currentDate, currentSlots ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	// Range mode: Handle date selection with activePicker toggle
	// Evidence: voxel-search-form.beautified.js lines 954-965
	const handleDateChange = useCallback( ( date: Date | null ) => {
		if ( isRangeMode && date && pickerInstanceRef.current ) {
			if ( activePicker === 'start' ) {
				// Set start date, switch to end picker
				// Evidence: lines 956-959
				setPickerDate( date );
				setActivePicker( 'end' );
				pickerInstanceRef.current.setStartRange( date );
				pickerInstanceRef.current.setEndRange( null );
			} else {
				// Set end date, switch back to start, auto-save
				// Evidence: lines 961-965
				setPickerEndDate( date );
				setActivePicker( 'start' );
				pickerInstanceRef.current.setEndRange( date );
				// Auto-save range selection - serialize to Voxel format
				// Evidence: voxel-search-form.beautified.js line 985
				const startStr = dateToString( pickerDate );
				const endStr = dateToString( date );
				if ( startStr && endStr ) {
					onChange( `${ startStr }..${ endStr }` );
					setIsOpen( false );
				}
			}
		} else {
			// Single mode
			setPickerDate( date );
		}
	}, [ isRangeMode, activePicker, pickerDate, onChange ] );

	const handleSlotsChange = useCallback( ( e: React.ChangeEvent< HTMLInputElement > ) => {
		setLocalSlots( Number( e.target.value ) || 1 );
	}, [] );

	const handleSave = useCallback( ( selectedDate?: Date | null ) => {
		if ( isRangeMode ) {
			// Range mode: save "start..end" format
			// Evidence: voxel-search-form.beautified.js line 985
			const startStr = dateToString( pickerDate );
			const endStr = dateToString( pickerEndDate );
			if ( startStr && endStr ) {
				// Serialize to Voxel format - just the date string
				onChange( `${ startStr }..${ endStr }` );
			}
		} else {
			// Single mode - serialize to Voxel format
			const dateToSave = selectedDate !== undefined ? selectedDate : pickerDate;
			const dateString = dateToString( dateToSave );
			if ( dateString ) {
				onChange( dateString );
			}
		}
		setIsOpen( false );
	}, [ isRangeMode, pickerDate, pickerEndDate, onChange ] );

	const handleClear = useCallback( () => {
		setPickerDate( null );
		setPickerEndDate( null );
		setLocalSlots( 1 );
		onChange( null );
		if ( pickerInstanceRef.current ) {
			pickerInstanceRef.current.setStartRange( null );
			pickerInstanceRef.current.setEndRange( null );
		}
	}, [ onChange ] );

	// Range mode: both start and end must be set
	// Evidence: voxel-search-form.beautified.js lines 999-1003
	const hasValue = isRangeMode
		? !! ( startDate && endDate )
		: !! currentDate;

	// Display value for the trigger
	// Evidence: voxel-search-form.beautified.js lines 1015-1020
	const displayValue = useMemo( () => {
		if ( ! hasValue ) return placeholder;

		if ( isRangeMode ) {
			// Range mode: "start — end" format (em dash —)
			// Evidence: line 1016
			const startDisplay = formatDateForDisplay( startDate );
			const endDisplay = formatDateForDisplay( endDate );
			const dateRange = `${ startDisplay } — ${ endDisplay }`;
			return currentSlots > 1 ? `${ dateRange } (${ currentSlots })` : dateRange;
		} else {
			// Single mode
			const dateDisplay = formatDateForDisplay( currentDate );
			return currentSlots > 1 ? `${ dateDisplay } (${ currentSlots })` : dateDisplay;
		}
	}, [ isRangeMode, hasValue, startDate, endDate, currentDate, currentSlots, placeholder ] );

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );

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
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup from create-post */ }
			{ /* Range mode shows Check-in/Check-out toggle in header */ }
			{ /* Evidence: themes/voxel/templates/widgets/search-form/availability-filter.php:77-100 */ }
			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef }
				title={ isRangeMode
					? ( activePicker === 'start'
						? ( l10n.checkIn || 'Check-in' )
						: ( l10n.checkOut || 'Check-out' ) )
					: '' }
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ true }
				onSave={ handleSave }
				onClear={ handleClear }
				onClose={ () => setIsOpen( false ) }
			>
				{ /* Date picker with range mode support */ }
				{ /* Evidence: voxel-search-form.beautified.js lines 942-969 */ }
				{ /* CRITICAL: Don't override onSelect in pickerConfig - it breaks the date selection */ }
				<DatePicker
					value={ pickerDate }
					onChange={ handleDateChange }
					onSelect={ ! isRangeMode ? handleSave : undefined }
					pickerConfig={ isRangeMode ? {
						theme: 'pika-range', // Evidence: line 953
						// Note: Don't set onSelect here - it overrides the default handler
					} : undefined }
					onPickerReady={ ( picker ) => {
						pickerInstanceRef.current = picker;
						// Set initial range if values exist
						if ( isRangeMode && pickerDate ) {
							picker.setStartRange( pickerDate );
							if ( pickerEndDate ) {
								picker.setEndRange( pickerEndDate );
							}
						}
					} }
				/>

				{ /* Slots input */ }
				<div className="ts-form-group" style={ { marginTop: '12px' } }>
					<label>Number of slots</label>
					<input
						type="number"
						value={ localSlots }
						onChange={ handleSlotsChange }
						min="1"
						className="ts-filter"
					/>
				</div>
			</FieldPopup>
		</div>
	);
}
