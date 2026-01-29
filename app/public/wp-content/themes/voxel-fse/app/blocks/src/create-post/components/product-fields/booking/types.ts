/**
 * Booking Field Types
 *
 * TypeScript interfaces matching Voxel's booking field data structure.
 *
 * Evidence:
 * - Backend: themes/voxel/app/product-types/product-fields/booking-field.php
 * - Template: themes/voxel/templates/widgets/create-post/product-field/booking/type-timeslots.php
 * - Template: themes/voxel/templates/widgets/create-post/product-field/booking/timeslots.php
 * - Template: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php
 * - Template: themes/voxel/templates/widgets/create-post/product-field/booking/weekday-exclusions.php
 */

/**
 * Individual timeslot (e.g., "09:00" - "10:00")
 */
export interface Timeslot {
	from: string; // 'HH:MM' format (e.g., '09:00')
	to: string;   // 'HH:MM' format (e.g., '10:00')
}

/**
 * Group of timeslots assigned to specific days
 * Evidence: timeslots.php lines 1-5 (v-for="group in groups")
 */
export interface TimeslotGroup {
	days: string[];      // Weekday keys: ['monday', 'tuesday', ...]
	slots: Timeslot[];   // Array of time slots for these days
}

/**
 * Timeslots container structure
 */
export interface TimeslotsConfig {
	groups: TimeslotGroup[];
}

/**
 * Buffer period configuration
 */
export interface BufferConfig {
	amount: number;
	unit: 'days' | 'hours';
}

/**
 * Availability configuration
 */
export interface AvailabilityConfig {
	max_days: number;
	buffer: BufferConfig;
}

/**
 * Booking mode type (for 'days' type)
 * Evidence: type-days.php line 40 (value.booking_mode === 'date_range')
 * Evidence: type-days.php line 43 (:checked="value.booking_mode === 'single_day'")
 */
export type BookingModeType = 'single_day' | 'date_range';

/**
 * Date range configuration (for 'days' type with date range mode)
 * Evidence: type-days.php lines 51-83
 */
export interface DateRangeConfig {
	set_custom_limits: boolean; // Evidence: type-days.php line 56 (v-model="value.date_range.set_custom_limits")
	min_length: number; // Minimum length in days (only used when set_custom_limits is true)
	max_length: number; // Maximum length in days (only used when set_custom_limits is true)
}

/**
 * Complete booking field value structure
 * Evidence:
 * - type-timeslots.php lines 6-14 (v-model bindings for 'timeslots' type)
 * - type-days.php lines 6-115 (v-model bindings for 'days' type)
 */
export interface BookingFieldValue {
	availability: AvailabilityConfig;
	quantity_per_slot?: number; // Used by 'timeslots' type
	timeslots: TimeslotsConfig; // Used by 'timeslots' type
	excluded_days_enabled: boolean;
	excluded_days: string[]; // Array of 'YYYY-MM-DD' strings

	// FIELDS FOR 'DAYS' TYPE:
	// Evidence: type-days.php line 40-43
	booking_mode?: BookingModeType; // 'single_day' or 'date_range' - STRING, not object!
	date_range?: DateRangeConfig; // Range limits (only for date_range mode)
	excluded_weekdays?: string[]; // Weekday keys to exclude: ['monday', 'tuesday', ...]
}

/**
 * Booking field props passed from parent
 */
export interface BookingFieldProps {
	field: {
		key: string;
		label: string;
		required: boolean;
		props: {
			booking_type: 'days' | 'timeslots';
			quantity_per_slot: {
				enabled: boolean;
			};
			weekdays: Record<string, string>;      // { monday: 'Monday', ... }
			weekdays_short: Record<string, string>; // { monday: 'Mon', ... }
		};
	};
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
}

/**
 * Timeslot generator configuration
 * Evidence: timeslots.php lines 92-123 (generator form fields)
 */
export interface GeneratorConfig {
	from: string;   // Start time 'HH:MM'
	to: string;     // End time 'HH:MM'
	length: number; // Slot length in minutes
	gap: number;    // Gap between slots in minutes
}

/**
 * Default values for new booking field
 */
export const DEFAULT_BOOKING_VALUE: BookingFieldValue = {
	availability: {
		max_days: 365,
		buffer: {
			amount: 0,
			unit: 'days',
		},
	},
	quantity_per_slot: 1,
	timeslots: {
		groups: [],
	},
	excluded_days_enabled: false,
	excluded_days: [],
	// Defaults for 'days' type:
	booking_mode: 'date_range', // STRING: 'single_day' or 'date_range'
	date_range: {
		set_custom_limits: false, // Toggle for showing min/max fields
		min_length: 1,
		max_length: 365,
	},
	excluded_weekdays: [],
};

/**
 * Default weekdays (English)
 * Used as fallback if not provided by field.props
 */
export const DEFAULT_WEEKDAYS: Record<string, string> = {
	monday: 'Monday',
	tuesday: 'Tuesday',
	wednesday: 'Wednesday',
	thursday: 'Thursday',
	friday: 'Friday',
	saturday: 'Saturday',
	sunday: 'Sunday',
};

/**
 * Default weekdays short (English)
 * Used as fallback if not provided by field.props
 */
export const DEFAULT_WEEKDAYS_SHORT: Record<string, string> = {
	monday: 'Mon',
	tuesday: 'Tue',
	wednesday: 'Wed',
	thursday: 'Thu',
	friday: 'Fri',
	saturday: 'Sat',
	sunday: 'Sun',
};

/**
 * All weekday keys in order
 */
export const WEEKDAY_KEYS = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const;

/**
 * Maximum slots per group (Voxel validation limit)
 */
export const MAX_SLOTS_PER_GROUP = 50;
