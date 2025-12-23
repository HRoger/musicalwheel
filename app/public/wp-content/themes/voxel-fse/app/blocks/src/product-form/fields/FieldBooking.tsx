/**
 * FieldBooking Component
 *
 * Main booking field component that switches between booking modes:
 * - date_range: Check-in/check-out selection
 * - single_day: Single date selection
 * - timeslots: Date + time slot selection
 *
 * Evidence: voxel-product-form.beautified.js lines 163-212, 1735-1744
 *
 * @package VoxelFSE
 */

import { BookingDateRange, BookingSingleDay, BookingTimeslots } from './booking';
import { calculateRangeLength, formatRangeLength } from './booking/bookingUtils';
import type {
	BookingFieldConfig,
	BookingValue,
	BookingPricingSummary,
	ExtendedProductFormConfig,
	SearchContext,
} from '../types';

export interface FieldBookingProps {
	field: BookingFieldConfig;
	value: BookingValue;
	onChange: ( value: BookingValue ) => void;
	config?: ExtendedProductFormConfig;
	/** Initial availability from search context (referrer URL) */
	initialAvailability?: SearchContext['availability'];
}

/**
 * FieldBooking - Main booking field component
 *
 * Renders the appropriate booking UI based on the booking mode:
 * - date_range: Two calendars for start/end date selection
 * - single_day: Single calendar for date selection
 * - timeslots: Calendar + time slot picker
 */
export default function FieldBooking( {
	field,
	value,
	onChange,
	config,
	initialAvailability,
}: FieldBookingProps ) {
	const mode = field.props.mode;

	// Render based on mode
	switch ( mode ) {
		case 'date_range':
			return (
				<BookingDateRange
					field={ field }
					value={ value }
					onChange={ onChange }
					initialAvailability={ initialAvailability }
					config={ config }
				/>
			);

		case 'single_day':
			return (
				<BookingSingleDay
					field={ field }
					value={ value }
					onChange={ onChange }
					initialAvailability={ initialAvailability }
					config={ config }
				/>
			);

		case 'timeslots':
			return (
				<BookingTimeslots
					field={ field }
					value={ value }
					onChange={ onChange }
					initialAvailability={ initialAvailability }
					config={ config }
				/>
			);

		default:
			return null;
	}
}

/**
 * Get pricing summary for booking
 *
 * Calculates the booking price based on:
 * - Base price from config
 * - Date range length (for date_range mode)
 * - Custom pricing for specific dates
 *
 * Evidence: voxel-product-form.beautified.js lines 1738-1744
 */
FieldBooking.getPricingSummary = function(
	field: BookingFieldConfig,
	value: BookingValue,
	config?: ExtendedProductFormConfig
): BookingPricingSummary | null {
	const { mode, count_mode = 'nights', l10n } = field.props;

	// Get base price
	const basePrice = config?.props?.base_price;
	if ( ! basePrice?.enabled ) return null;

	const priceAmount = basePrice.discount_amount ?? basePrice.amount;
	let amount = priceAmount;
	let label = l10n?.booking_price ?? 'Booking';

	if ( mode === 'date_range' ) {
		// Validate we have both dates
		if ( ! value.start_date || ! value.end_date ) return null;

		// Calculate range length
		const length = calculateRangeLength( value.start_date, value.end_date, count_mode );
		if ( length < 1 ) return null;

		// Multiply by length
		amount = priceAmount * length;

		// Format label with length
		label = formatRangeLength( length, count_mode, l10n );

	} else if ( mode === 'single_day' ) {
		// Need selected date
		if ( ! value.date ) return null;

	} else if ( mode === 'timeslots' ) {
		// Need date and slot
		if ( ! value.date || ! value.slot ) return null;
	}

	return {
		label,
		amount,
		hidden: amount === 0,
	};
};

/**
 * Check if booking is complete (all required values selected)
 */
FieldBooking.isComplete = function(
	field: BookingFieldConfig,
	value: BookingValue
): boolean {
	const { mode } = field.props;

	switch ( mode ) {
		case 'date_range':
			return !! value.start_date && !! value.end_date;

		case 'single_day':
			return !! value.date;

		case 'timeslots':
			return !! value.date && !! value.slot;

		default:
			return false;
	}
};

/**
 * Get selected range length (for date_range mode)
 *
 * Used by addons with repeat configuration.
 * Evidence: voxel-product-form.beautified.js lines 1129-1130
 */
FieldBooking.getSelectedRangeLength = function(
	field: BookingFieldConfig,
	value: BookingValue
): number {
	if ( field.props.mode !== 'date_range' ) return 1;
	if ( ! value.start_date || ! value.end_date ) return 0;

	return calculateRangeLength(
		value.start_date,
		value.end_date,
		field.props.count_mode ?? 'nights'
	);
};
