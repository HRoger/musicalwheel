/**
 * Booking Utility Functions
 *
 * Helper functions for date calculations, availability checks,
 * and time slot management.
 *
 * Evidence: voxel-product-form.beautified.js booking logic
 *
 * @package VoxelFSE
 */

import type {
	BookingFieldConfig,
	BookingValue,
	TimeSlotGroup,
	ComputedTimeSlot,
	BookingTodayConfig,
} from '../../types';

/**
 * Weekday abbreviation to day number mapping
 */
const WEEKDAY_MAP: Record<string, number> = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
};

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate( date: Date ): string {
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	return `${ year }-${ month }-${ day }`;
}

/**
 * Parse YYYY-MM-DD string to Date
 */
export function parseDate( dateStr: string ): Date {
	return new Date( dateStr + 'T00:00:00' );
}

/**
 * Get weekday abbreviation from date
 */
export function getWeekdayAbbr( date: Date ): string {
	const weekdays = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
	return weekdays[ date.getDay() ];
}

/**
 * Check if a date is excluded by specific dates list
 */
export function isExcludedDate( date: Date, excludedDays: string[] ): boolean {
	const dateStr = formatDate( date );
	return excludedDays.includes( dateStr );
}

/**
 * Check if a date is excluded by weekday
 */
export function isExcludedWeekday( date: Date, excludedWeekdays: string[] ): boolean {
	const weekday = getWeekdayAbbr( date );
	return excludedWeekdays.includes( weekday );
}

/**
 * Check if a date is in the past
 */
export function isDateInPast( date: Date, today: BookingTodayConfig ): boolean {
	const todayDate = parseDate( today.date );
	return date < todayDate;
}

/**
 * Check if a date is within buffer period
 */
export function isWithinBuffer(
	date: Date,
	today: BookingTodayConfig,
	buffer?: { amount: number; unit: 'days' | 'hours' }
): boolean {
	if ( ! buffer || buffer.amount <= 0 ) return false;

	const now = parseDate( today.date );
	if ( buffer.unit === 'hours' ) {
		const [ hours, minutes ] = today.time.split( ':' ).map( Number );
		now.setHours( hours, minutes, 0, 0 );
		const bufferMs = buffer.amount * 60 * 60 * 1000;
		return date.getTime() - now.getTime() < bufferMs;
	} else {
		// Days
		const bufferEnd = new Date( now );
		bufferEnd.setDate( bufferEnd.getDate() + buffer.amount );
		return date < bufferEnd;
	}
}

/**
 * Check if a date is beyond max days
 */
export function isBeyondMaxDays( date: Date, today: BookingTodayConfig, maxDays: number ): boolean {
	const todayDate = parseDate( today.date );
	const maxDate = new Date( todayDate );
	maxDate.setDate( maxDate.getDate() + maxDays );
	return date > maxDate;
}

/**
 * Check if a date is available for booking
 */
export function isDateAvailable( date: Date, field: BookingFieldConfig ): boolean {
	const { excluded_days = [], excluded_weekdays = [], availability, today } = field.props;

	// Check excluded specific dates
	if ( isExcludedDate( date, excluded_days ) ) return false;

	// Check excluded weekdays
	if ( isExcludedWeekday( date, excluded_weekdays ) ) return false;

	if ( today ) {
		// Check if in past
		if ( isDateInPast( date, today ) ) return false;

		// Check buffer
		if ( isWithinBuffer( date, today, availability?.buffer ) ) return false;

		// Check max days
		if ( availability?.max_days && isBeyondMaxDays( date, today, availability.max_days ) ) {
			return false;
		}
	}

	return true;
}

/**
 * Get time slots for a specific date
 */
export function getTimeSlotsForDate(
	date: Date,
	field: BookingFieldConfig
): ComputedTimeSlot[] {
	const { timeslots, quantity_per_slot = 1, booked_slot_counts = {} } = field.props;
	if ( ! timeslots?.groups ) return [];

	const weekday = getWeekdayAbbr( date );
	const dateStr = formatDate( date );
	const slots: ComputedTimeSlot[] = [];

	// Find groups that apply to this weekday
	for ( const group of timeslots.groups ) {
		if ( ! group.days.includes( weekday ) ) continue;

		for ( const slot of group.slots ) {
			const key = `${ slot.from }-${ slot.to }`;
			const bookedKey = `${ dateStr } ${ key }`;
			const booked = booked_slot_counts[ bookedKey ] || 0;
			const available = Math.max( 0, quantity_per_slot - booked );

			slots.push( {
				...slot,
				key,
				label: `${ slot.from } - ${ slot.to }`,
				available,
				booked,
				isAvailable: available > 0,
			} );
		}
	}

	return slots;
}

/**
 * Calculate number of days/nights in a date range
 */
export function calculateRangeLength(
	startDate: string,
	endDate: string,
	countMode: 'nights' | 'days'
): number {
	const start = parseDate( startDate );
	const end = parseDate( endDate );
	const diffTime = end.getTime() - start.getTime();
	const diffDays = Math.ceil( diffTime / ( 1000 * 60 * 60 * 24 ) );

	// For nights mode, count the number of nights (end - start)
	// For days mode, count inclusive days (end - start + 1)
	return countMode === 'nights' ? diffDays : diffDays + 1;
}

/**
 * Validate date range length
 */
export function validateRangeLength(
	startDate: string,
	endDate: string,
	field: BookingFieldConfig
): { valid: boolean; length: number; error?: string } {
	const { count_mode = 'nights', date_range, l10n } = field.props;
	const length = calculateRangeLength( startDate, endDate, count_mode );

	if ( ! date_range ) {
		return { valid: true, length };
	}

	const { min_length = 1, max_length = 365 } = date_range;

	if ( length < min_length || length > max_length ) {
		const errorTemplate = count_mode === 'nights'
			? ( l10n?.nights_range_error ?? 'Min @minlength, max @maxlength nights' )
			: ( l10n?.days_range_error ?? 'Min @minlength, max @maxlength days' );

		return {
			valid: false,
			length,
			error: errorTemplate
				.replace( '@minlength', String( min_length ) )
				.replace( '@maxlength', String( max_length ) ),
		};
	}

	return { valid: true, length };
}

/**
 * Format range length for display
 */
export function formatRangeLength(
	length: number,
	countMode: 'nights' | 'days',
	l10n?: BookingFieldConfig['props']['l10n']
): string {
	if ( countMode === 'nights' ) {
		if ( length === 1 ) {
			return l10n?.one_night ?? '1 night';
		}
		return ( l10n?.multiple_nights ?? '@count nights' ).replace( '@count', String( length ) );
	} else {
		if ( length === 1 ) {
			return l10n?.one_day ?? '1 day';
		}
		return ( l10n?.multiple_days ?? '@count days' ).replace( '@count', String( length ) );
	}
}

/**
 * Get minimum selectable date
 */
export function getMinDate( field: BookingFieldConfig ): Date {
	const { today, availability } = field.props;
	if ( ! today ) return new Date();

	const minDate = parseDate( today.date );

	// Apply buffer
	if ( availability?.buffer ) {
		if ( availability.buffer.unit === 'days' ) {
			minDate.setDate( minDate.getDate() + availability.buffer.amount );
		} else {
			// For hours, add to tomorrow if past buffer time
			const [ hours ] = today.time.split( ':' ).map( Number );
			if ( hours + availability.buffer.amount >= 24 ) {
				minDate.setDate( minDate.getDate() + 1 );
			}
		}
	}

	return minDate;
}

/**
 * Get maximum selectable date
 */
export function getMaxDate( field: BookingFieldConfig ): Date {
	const { today, availability } = field.props;
	if ( ! today ) {
		const maxDate = new Date();
		maxDate.setFullYear( maxDate.getFullYear() + 1 );
		return maxDate;
	}

	const maxDate = parseDate( today.date );
	maxDate.setDate( maxDate.getDate() + ( availability?.max_days ?? 365 ) );
	return maxDate;
}

/**
 * Create disable day function for Pikaday
 */
export function createDisableDayFn( field: BookingFieldConfig ): ( date: Date ) => boolean {
	return ( date: Date ) => ! isDateAvailable( date, field );
}

export default {
	formatDate,
	parseDate,
	getWeekdayAbbr,
	isDateAvailable,
	getTimeSlotsForDate,
	calculateRangeLength,
	validateRangeLength,
	formatRangeLength,
	getMinDate,
	getMaxDate,
	createDisableDayFn,
};
