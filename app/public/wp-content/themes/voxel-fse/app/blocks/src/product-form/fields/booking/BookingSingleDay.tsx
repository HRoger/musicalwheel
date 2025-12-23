/**
 * BookingSingleDay Component
 *
 * Single date picker for event bookings and appointments.
 * Uses Pikaday for date selection with availability filtering.
 *
 * Evidence: voxel-product-form.beautified.js lines 1100-1105
 *
 * @package VoxelFSE
 */

import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { usePikaday } from './usePikaday';
import {
	formatDate,
	parseDate,
	getMinDate,
	getMaxDate,
	createDisableDayFn,
} from './bookingUtils';
import { getMinimumPriceForDate, formatPrice } from '../../pricing';
import type { BookingFieldConfig, BookingValue, SearchContext, ExtendedProductFormConfig } from '../../types';

export interface BookingSingleDayProps {
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
 * BookingSingleDay - Single date selection
 */
export default function BookingSingleDay( {
	field,
	value,
	onChange,
	initialAvailability,
	config,
}: BookingSingleDayProps ) {
	const containerRef = useRef<HTMLDivElement>( null );
	const [ initialized, setInitialized ] = useState( false );
	const { l10n } = field.props;

	// Initialize from search context availability
	// For single_day, use start date only
	useEffect( () => {
		if ( initialized ) return;
		if ( ! initialAvailability?.start ) return;
		if ( value.date ) return; // Already has value

		setInitialized( true );
		onChange( {
			...value,
			date: initialAvailability.start,
		} );
	}, [ initialAvailability, initialized, value, onChange ] );

	// Computed values
	const minDate = useMemo( () => getMinDate( field ), [ field ] );
	const maxDate = useMemo( () => getMaxDate( field ), [ field ] );
	const disableDayFn = useMemo( () => createDisableDayFn( field ), [ field ] );

	// Handle date selection
	const handleSelect = useCallback( ( date: Date ) => {
		onChange( {
			...value,
			date: formatDate( date ),
		} );
	}, [ value, onChange ] );

	// Handle calendar draw - add price tooltips
	const handleDraw = useCallback( () => {
		addPriceTooltips( containerRef.current, config ?? null );
	}, [ config ] );

	// Pikaday instance
	const picker = usePikaday( {
		onSelect: handleSelect,
		onDraw: handleDraw,
		minDate,
		maxDate,
		defaultDate: value.date ? parseDate( value.date ) : undefined,
		disableDayFn,
		container: containerRef.current,
		bound: false,
	} );

	// Sync picker value with state
	useEffect( () => {
		if ( value.date ) {
			picker.setDate( value.date );
		}
	}, [ value.date ] );

	// Display value
	const placeholderText = l10n?.select_date ?? 'Select date';
	const displayValue = value.date ?? placeholderText;

	return (
		<div className="ts-form-group ts-booking-field ts-booking-single-day">
			<label>Date</label>

			{/* Date display */}
			<div className={ `ts-filter ts-popup-target${ value.date ? ' ts-filled' : '' }` }>
				<span className="ts-filter-text">{ displayValue }</span>
				<div className="ts-down-icon"></div>
			</div>

			{/* Calendar container */}
			<div className="ts-booking-calendars">
				<div className="ts-booking-calendar">
					<div
						ref={ containerRef }
						className="ts-calendar-container ts-active"
					>
						<input
							ref={ picker.inputRef }
							type="hidden"
							readOnly
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
