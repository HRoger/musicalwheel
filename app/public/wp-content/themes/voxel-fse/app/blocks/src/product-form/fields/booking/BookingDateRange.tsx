/**
 * BookingDateRange Component
 *
 * Date range picker for check-in/check-out bookings (accommodations, rentals).
 * Uses Pikaday for date selection with availability filtering.
 *
 * Evidence: voxel-product-form.beautified.js lines 1119-1147
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { usePikaday, type PikadayDayData, type PikadayDayElement } from './usePikaday';
import {
	formatDate,
	parseDate,
	calculateRangeLength,
	validateRangeLength,
	formatRangeLength,
	getMinDate,
	getMaxDate,
	createDisableDayFn,
} from './bookingUtils';
import { getMinimumPriceForDate, formatPrice } from '../../pricing';
import type { BookingFieldConfig, BookingValue, SearchContext, ExtendedProductFormConfig } from '../../types';

/** Day in milliseconds - Evidence: voxel-product-form.beautified.js line 2027 */
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface BookingDateRangeProps {
	field: BookingFieldConfig;
	value: BookingValue;
	onChange: ( value: BookingValue ) => void;
	/** Initial availability from search context (referrer URL) */
	initialAvailability?: SearchContext['availability'];
	/** Product configuration for pricing tooltips */
	config?: ExtendedProductFormConfig | null;
}

/**
 * Create dayRenderHook for inline price tooltips
 *
 * This creates a callback that Pikaday calls for each day cell during rendering.
 * It adds a pika-tooltip div inside the TD cell with the price for that day.
 *
 * Evidence: voxel-product-form.beautified.js lines 1992-1999
 * - dayRenderHook: (dayData, dayEl) => {
 * -     let tooltip = `<div class="pika-tooltip">${price}</div>`;
 * -     dayEl.beforeCloseTd += tooltip;
 * - }
 */
function createDayRenderHook(
	config: ExtendedProductFormConfig | null
): ( ( dayData: PikadayDayData, dayEl: PikadayDayElement ) => void ) | undefined {
	if ( ! config ) return undefined;

	return ( dayData: PikadayDayData, dayEl: PikadayDayElement ) => {
		// Don't add tooltips to disabled days
		if ( dayData.isDisabled ) return;

		const date = new Date( dayData.year, dayData.month, dayData.day );
		const price = getMinimumPriceForDate( date, config );

		if ( price > 0 ) {
			// Add inline price tooltip matching Voxel's structure
			const tooltip = `<div class="pika-tooltip">${ formatPrice( price ) }</div>`;
			dayEl.beforeCloseTd += tooltip;
		}
	};
}

/**
 * BookingDateRange - Check-in/check-out date selection
 */
export default function BookingDateRange( {
	field,
	value,
	onChange,
	initialAvailability,
	config,
}: BookingDateRangeProps ) {
	const [ selecting, setSelecting ] = useState<'start' | 'end'>( 'start' );
	const [ error, setError ] = useState<string | null>( null );
	const [ initialized, setInitialized ] = useState( false );
	// Hover date for range preview - Evidence: voxel-product-form.beautified.js line 1688
	const [ hoverDate, setHoverDate ] = useState<Date | null>( null );
	const startContainerRef = useRef<HTMLDivElement>( null );
	const endContainerRef = useRef<HTMLDivElement>( null );

	const { count_mode = 'nights', l10n } = field.props;

	// Initialize from search context availability
	// Evidence: voxel-product-form.beautified.js lines 2089-2098
	useEffect( () => {
		if ( initialized ) return;
		if ( ! initialAvailability?.start ) return;
		if ( value.start_date || value.end_date ) return; // Already has values

		setInitialized( true );
		onChange( {
			...value,
			start_date: initialAvailability.start,
			end_date: initialAvailability.end || initialAvailability.start,
		} );
	}, [ initialAvailability, initialized, value, onChange ] );

	// Computed values
	const minDate = useMemo( () => getMinDate( field ), [ field ] );
	const maxDate = useMemo( () => getMaxDate( field ), [ field ] );
	const disableDayFn = useMemo( () => createDisableDayFn( field ), [ field ] );

	// Selection validation
	const rangeInfo = useMemo( () => {
		if ( ! value.start_date || ! value.end_date ) return null;
		return validateRangeLength( value.start_date, value.end_date, field );
	}, [ value.start_date, value.end_date, field ] );

	// Update error state
	useEffect( () => {
		if ( rangeInfo && ! rangeInfo.valid ) {
			setError( rangeInfo.error ?? null );
		} else {
			setError( null );
		}
	}, [ rangeInfo ] );

	// Handle start date selection
	const handleStartSelect = useCallback( ( date: Date ) => {
		const dateStr = formatDate( date );

		// If selecting start and it's after current end, clear end
		if ( value.end_date && dateStr >= value.end_date ) {
			onChange( {
				...value,
				start_date: dateStr,
				end_date: null,
			} );
		} else {
			onChange( {
				...value,
				start_date: dateStr,
			} );
		}
		setSelecting( 'end' );
	}, [ value, onChange ] );

	// Handle end date selection
	const handleEndSelect = useCallback( ( date: Date ) => {
		const dateStr = formatDate( date );

		// Ensure end is after start
		if ( value.start_date && dateStr <= value.start_date ) {
			// Swap dates
			onChange( {
				...value,
				start_date: dateStr,
				end_date: value.start_date,
			} );
		} else {
			onChange( {
				...value,
				end_date: dateStr,
			} );
		}
		setSelecting( 'start' );
	}, [ value, onChange ] );

	/**
	 * Handle mouseover on calendar for date range preview
	 *
	 * Shows visual feedback of range as user hovers over end date options.
	 * Adds is-inrange class to dates between start and hover, and is-endrange to hovered date.
	 *
	 * Evidence: voxel-product-form.beautified.js lines 2008-2048
	 */
	const handleCalendarMouseOver = useCallback( ( event: MouseEvent, pickerEl: HTMLElement | null ) => {
		// Only show preview when selecting end date and start is already set
		if ( ! value.start_date || value.end_date ) return;
		if ( ! pickerEl ) return;

		const target = event.target as HTMLElement;
		const td = target.tagName === 'TD' ? target : target.closest( 'td' );
		if ( ! td || td.classList.contains( 'is-empty' ) || td.classList.contains( 'is-disabled' ) ) return;

		const button = td.querySelector( '.pika-button' ) as HTMLButtonElement | null;
		if ( ! button || button.disabled ) return;

		// Mark this cell as end of range
		td.classList.add( 'is-endrange' );

		// Parse hover date from button data attributes
		const hoverYear = parseInt( button.getAttribute( 'data-pika-year' ) ?? '0', 10 );
		const hoverMonth = parseInt( button.getAttribute( 'data-pika-month' ) ?? '0', 10 );
		const hoverDay = parseInt( button.getAttribute( 'data-pika-day' ) ?? '0', 10 );
		const newHoverDate = new Date( hoverYear, hoverMonth, hoverDay );

		setHoverDate( new Date( newHoverDate.getTime() ) );

		// Add in-range class to dates between start and hover
		const startDate = parseDate( value.start_date );
		let checkDate = new Date( newHoverDate.getTime() - DAY_IN_MS );

		while ( checkDate > startDate ) {
			const selector = [
				`.pika-button[data-pika-year="${ checkDate.getFullYear() }"]`,
				`[data-pika-month="${ checkDate.getMonth() }"]`,
				`[data-pika-day="${ checkDate.getDate() }"]`,
			].join( '' );

			const dayButton = pickerEl.querySelector( selector );
			if ( dayButton?.parentElement ) {
				dayButton.parentElement.classList.add( 'is-inrange' );
			}
			checkDate.setTime( checkDate.getTime() - DAY_IN_MS );
		}

		// Clean up on mouseleave
		td.addEventListener( 'mouseleave', () => {
			Array.from( pickerEl.querySelectorAll( 'td.is-inrange:not(.is-disabled)' ) )
				.forEach( el => el.classList.remove( 'is-inrange' ) );
			td.classList.remove( 'is-endrange' );
			setHoverDate( null );
		}, { once: true } );
	}, [ value.start_date, value.end_date ] );

	// Day render hook for inline price tooltips
	const dayRenderHook = useMemo( () => createDayRenderHook( config ?? null ), [ config ] );

	// Handle calendar draw - attach mouseover listener for range preview
	const handleStartDraw = useCallback( ( picker: { el: HTMLElement } ) => {
		// Attach mouseover listener for hover preview
		picker.el.addEventListener( 'mouseover', ( e ) => handleCalendarMouseOver( e, picker.el ) );
	}, [ handleCalendarMouseOver ] );

	const handleEndDraw = useCallback( ( picker: { el: HTMLElement } ) => {
		picker.el.addEventListener( 'mouseover', ( e ) => handleCalendarMouseOver( e, picker.el ) );
	}, [ handleCalendarMouseOver ] );

	// Pikaday for start date
	const startPicker = usePikaday( {
		onSelect: handleStartSelect,
		onDraw: handleStartDraw,
		minDate,
		maxDate,
		defaultDate: value.start_date ? parseDate( value.start_date ) : undefined,
		disableDayFn,
		dayRenderHook,
		container: startContainerRef.current,
		bound: false,
		startRange: value.start_date ? parseDate( value.start_date ) : null,
		endRange: value.end_date ? parseDate( value.end_date ) : null,
	} );

	// Pikaday for end date (min date is start date + 1)
	const endMinDate = useMemo( () => {
		if ( ! value.start_date ) return minDate;
		const startPlus1 = parseDate( value.start_date );
		startPlus1.setDate( startPlus1.getDate() + 1 );
		return startPlus1 > minDate ? startPlus1 : minDate;
	}, [ value.start_date, minDate ] );

	const endPicker = usePikaday( {
		onSelect: handleEndSelect,
		onDraw: handleEndDraw,
		minDate: endMinDate,
		maxDate,
		defaultDate: value.end_date ? parseDate( value.end_date ) : undefined,
		disableDayFn,
		dayRenderHook,
		container: endContainerRef.current,
		bound: false,
		startRange: value.start_date ? parseDate( value.start_date ) : null,
		endRange: value.end_date ? parseDate( value.end_date ) : null,
	} );

	// Sync picker values and range highlighting with state
	// Evidence: voxel-product-form.beautified.js lines 2054-2067
	useEffect( () => {
		if ( value.start_date ) {
			const startDate = parseDate( value.start_date );
			startPicker.setDate( value.start_date );
			startPicker.setStartRange( startDate );
			endPicker.setStartRange( startDate );
		} else {
			startPicker.setStartRange( null );
			endPicker.setStartRange( null );
		}
	}, [ value.start_date ] );

	useEffect( () => {
		if ( value.end_date ) {
			const endDate = parseDate( value.end_date );
			endPicker.setDate( value.end_date );
			startPicker.setEndRange( endDate );
			endPicker.setEndRange( endDate );
		} else {
			startPicker.setEndRange( null );
			endPicker.setEndRange( null );
		}
	}, [ value.end_date ] );

	// Clear hover date when start date changes
	// Evidence: voxel-product-form.beautified.js line 2056
	useEffect( () => {
		setHoverDate( null );
	}, [ value.start_date ] );

	// Labels based on count mode
	const startLabel = l10n?.select_start_and_end_date ?? 'Select start date';
	const endLabel = l10n?.select_end_date ?? 'Select end date';
	const placeholderText = count_mode === 'nights'
		? ( l10n?.select_nights ?? 'Select nights' )
		: ( l10n?.select_days ?? 'Select days' );

	/**
	 * Display value with hover preview support
	 *
	 * Shows date range and length, updating dynamically during hover.
	 *
	 * Evidence: voxel-product-form.beautified.js lines 2140-2157
	 * - If start_date && hover_date, show preview range
	 * - popupTitle computed property uses hover_date for dynamic feedback
	 */
	const displayValue = useMemo( () => {
		if ( ! value.start_date ) return placeholderText;

		// Show confirmed selection
		if ( value.end_date ) {
			const length = calculateRangeLength( value.start_date, value.end_date, count_mode );
			const rangeLabel = formatRangeLength( length, count_mode, l10n );
			return `${ value.start_date } - ${ value.end_date } (${ rangeLabel })`;
		}

		// Show hover preview when user is hovering over potential end date
		// Evidence: voxel-product-form.beautified.js lines 2149-2153
		if ( hoverDate ) {
			const hoverDateStr = formatDate( hoverDate );
			const length = calculateRangeLength( value.start_date, hoverDateStr, count_mode );
			const rangeLabel = formatRangeLength( length, count_mode, l10n );
			return `${ value.start_date } - ${ hoverDateStr } (${ rangeLabel })`;
		}

		// Waiting for end date selection
		return `${ value.start_date } - ${ l10n?.select_end_date ?? '...' }`;
	}, [ value.start_date, value.end_date, hoverDate, count_mode, l10n, placeholderText ] );

	return (
		<div className="ts-form-group ts-booking-field ts-booking-date-range">
			<label>{ count_mode === 'nights' ? 'Dates' : 'Days' }</label>

			{/* Date range display */}
			<div className={ `ts-filter ts-popup-target${ value.start_date ? ' ts-filled' : '' }` }>
				<span className="ts-filter-text">{ displayValue }</span>
				<div className="ts-down-icon"></div>
			</div>

			{/* Calendar containers */}
			<div className="ts-booking-calendars">
				<div className="ts-booking-calendar ts-booking-start">
					<div className="ts-calendar-label">{ startLabel }</div>
					<div
						ref={ startContainerRef }
						className={ `ts-calendar-container${ selecting === 'start' ? ' ts-active' : '' }` }
					>
						<input
							ref={ startPicker.inputRef }
							type="hidden"
							readOnly
						/>
					</div>
				</div>

				<div className="ts-booking-calendar ts-booking-end">
					<div className="ts-calendar-label">{ endLabel }</div>
					<div
						ref={ endContainerRef }
						className={ `ts-calendar-container${ selecting === 'end' ? ' ts-active' : '' }` }
					>
						<input
							ref={ endPicker.inputRef }
							type="hidden"
							readOnly
						/>
					</div>
				</div>
			</div>

			{/* Error message */}
			{ error && (
				<div className="ts-field-error">
					<span>{ error }</span>
				</div>
			) }
		</div>
	);
}

/**
 * Get selected range length (for external use)
 */
BookingDateRange.getSelectedRangeLength = function(
	value: BookingValue,
	field: BookingFieldConfig
): number {
	if ( ! value.start_date || ! value.end_date ) return 0;
	return calculateRangeLength(
		value.start_date,
		value.end_date,
		field.props.count_mode ?? 'nights'
	);
};
