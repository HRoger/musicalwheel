/**
 * BookingTimeslots Component
 *
 * Date + time slot picker for appointment bookings.
 * Shows available time slots for selected date with capacity info.
 *
 * Evidence: voxel-product-form.beautified.js lines 178-192
 *
 * @package VoxelFSE
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { usePikaday } from './usePikaday';
import {
	formatDate,
	parseDate,
	getMinDate,
	getMaxDate,
	createDisableDayFn,
	getTimeSlotsForDate,
} from './bookingUtils';
import { getMinimumPriceForDate, formatPrice } from '../../pricing';
import type { BookingFieldConfig, BookingValue, ComputedTimeSlot, SearchContext, ExtendedProductFormConfig } from '../../types';

export interface BookingTimeslotsProps {
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
 * BookingTimeslots - Date + time slot selection
 */
export default function BookingTimeslots( {
	field,
	value,
	onChange,
	initialAvailability,
	config,
}: BookingTimeslotsProps ) {
	const containerRef = useRef<HTMLDivElement>( null );
	const [ showSlots, setShowSlots ] = useState( false );
	const [ initialized, setInitialized ] = useState( false );
	const { l10n, quantity_per_slot = 1 } = field.props;

	// Initialize from search context availability
	// For timeslots, use start date only (time slot must be selected manually)
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

	// Available slots for selected date
	const availableSlots = useMemo( (): ComputedTimeSlot[] => {
		if ( ! value.date ) return [];
		const date = parseDate( value.date );
		return getTimeSlotsForDate( date, field );
	}, [ value.date, field ] );

	// Handle date selection
	const handleDateSelect = useCallback( ( date: Date ) => {
		const dateStr = formatDate( date );
		onChange( {
			...value,
			date: dateStr,
			slot: null, // Clear slot when date changes
		} );
		setShowSlots( true );
	}, [ value, onChange ] );

	// Handle slot selection
	const handleSlotSelect = useCallback( ( slot: ComputedTimeSlot ) => {
		if ( ! slot.isAvailable ) return;

		onChange( {
			...value,
			slot: slot.key,
		} );
		setShowSlots( false );
	}, [ value, onChange ] );

	// Handle calendar draw - add price tooltips
	const handleDraw = useCallback( () => {
		addPriceTooltips( containerRef.current, config ?? null );
	}, [ config ] );

	// Pikaday instance
	const picker = usePikaday( {
		onSelect: handleDateSelect,
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

	// Display values
	const datePlaceholder = l10n?.select_date ?? 'Select date';
	const slotPlaceholder = l10n?.select_timeslot ?? 'Select time';
	const noSlotsMessage = l10n?.no_slots_available ?? 'No time slots available';
	const availableTemplate = l10n?.amount_available ?? '@count available';

	const dateDisplay = value.date ?? datePlaceholder;
	const slotDisplay = useMemo( () => {
		if ( ! value.slot ) return slotPlaceholder;
		const selectedSlot = availableSlots.find( s => s.key === value.slot );
		return selectedSlot?.label ?? value.slot;
	}, [ value.slot, availableSlots, slotPlaceholder ] );

	return (
		<div className="ts-form-group ts-booking-field ts-booking-timeslots">
			{/* Date selection */}
			<div className="ts-booking-date-section">
				<label>Date</label>
				<div className={ `ts-filter ts-popup-target${ value.date ? ' ts-filled' : '' }` }>
					<span className="ts-filter-text">{ dateDisplay }</span>
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

			{/* Time slot selection */}
			{ value.date && (
				<div className="ts-booking-slots-section">
					<label>Time</label>

					{/* Slot display/trigger */}
					<div
						className={ `ts-filter ts-popup-target${ value.slot ? ' ts-filled' : '' }` }
						onClick={ () => setShowSlots( ! showSlots ) }
						role="button"
						tabIndex={ 0 }
						onKeyDown={ ( e ) => e.key === 'Enter' && setShowSlots( ! showSlots ) }
					>
						<span className="ts-filter-text">{ slotDisplay }</span>
						<div className="ts-down-icon"></div>
					</div>

					{/* Slot list */}
					{ showSlots && (
						<div className="ts-popup-list ts-timeslot-list">
							{ availableSlots.length === 0 ? (
								<div className="ts-no-slots">
									<span>{ noSlotsMessage }</span>
								</div>
							) : (
								<ul className="simplify-ul ts-form-options">
									{ availableSlots.map( ( slot ) => (
										<li
											key={ slot.key }
											className={ `ts-option${ value.slot === slot.key ? ' ts-selected' : '' }${ ! slot.isAvailable ? ' ts-unavailable' : '' }` }
											onClick={ () => handleSlotSelect( slot ) }
											role="option"
											aria-selected={ value.slot === slot.key }
											aria-disabled={ ! slot.isAvailable }
										>
											<span className="ts-slot-time">{ slot.label }</span>
											{ quantity_per_slot > 1 && (
												<span className="ts-slot-availability">
													{ slot.isAvailable
														? availableTemplate.replace( '@count', String( slot.available ) )
														: 'Fully booked'
													}
												</span>
											) }
										</li>
									) ) }
								</ul>
							) }
						</div>
					) }
				</div>
			) }
		</div>
	);
}
