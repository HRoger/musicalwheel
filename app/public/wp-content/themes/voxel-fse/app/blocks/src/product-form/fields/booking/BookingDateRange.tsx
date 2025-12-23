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
import { usePikaday } from './usePikaday';
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
 * Add price tooltips to Pikaday calendar days
 *
 * Evidence: voxel-product-form.beautified.js lines 1863-1874
 */
function addPriceTooltips(
	container: HTMLElement | null,
	config: ExtendedProductFormConfig | null
): void {
	if ( ! container || ! config ) return;

	// Find all day cells in the calendar
	const dayCells = container.querySelectorAll( '.pika-button' );

	dayCells.forEach( ( cell ) => {
		const button = cell as HTMLElement;
		const dataset = button.dataset as DOMStringMap;
		const year = parseInt( dataset[ 'pikaYear' ] ?? '0', 10 );
		const month = parseInt( dataset[ 'pikaMonth' ] ?? '0', 10 );
		const day = parseInt( dataset[ 'pikaDay' ] ?? '0', 10 );

		if ( year && day ) {
			const date = new Date( year, month, day );
			const price = getMinimumPriceForDate( date, config );

			if ( price > 0 ) {
				button.setAttribute( 'title', formatPrice( price ) );
			}
		}
	} );
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

	// Handle calendar draw - add price tooltips
	const handleStartDraw = useCallback( () => {
		addPriceTooltips( startContainerRef.current, config ?? null );
	}, [ config ] );

	const handleEndDraw = useCallback( () => {
		addPriceTooltips( endContainerRef.current, config ?? null );
	}, [ config ] );

	// Pikaday for start date
	const startPicker = usePikaday( {
		onSelect: handleStartSelect,
		onDraw: handleStartDraw,
		minDate,
		maxDate,
		defaultDate: value.start_date ? parseDate( value.start_date ) : undefined,
		disableDayFn,
		container: startContainerRef.current,
		bound: false,
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
		container: endContainerRef.current,
		bound: false,
	} );

	// Sync picker values with state
	useEffect( () => {
		if ( value.start_date ) {
			startPicker.setDate( value.start_date );
		}
	}, [ value.start_date ] );

	useEffect( () => {
		if ( value.end_date ) {
			endPicker.setDate( value.end_date );
		}
	}, [ value.end_date ] );

	// Labels based on count mode
	const startLabel = l10n?.select_start_and_end_date ?? 'Select start date';
	const endLabel = l10n?.select_end_date ?? 'Select end date';
	const placeholderText = count_mode === 'nights'
		? ( l10n?.select_nights ?? 'Select nights' )
		: ( l10n?.select_days ?? 'Select days' );

	// Display value
	const displayValue = useMemo( () => {
		if ( ! value.start_date ) return placeholderText;
		if ( ! value.end_date ) return `${ value.start_date } - ...`;

		const length = calculateRangeLength( value.start_date, value.end_date, count_mode );
		const rangeLabel = formatRangeLength( length, count_mode, l10n );
		return `${ value.start_date } - ${ value.end_date } (${ rangeLabel })`;
	}, [ value.start_date, value.end_date, count_mode, l10n, placeholderText ] );

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
