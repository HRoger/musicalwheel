/**
 * Booking Field Components Index
 *
 * Exports all booking sub-components for both 'timeslots' and 'days' booking types.
 */

// Main Component
export { BookingField } from './BookingField';

// Shared Components
export { ExcludedDatesToggle } from './ExcludedDatesToggle';
export { BookingCalendar } from './BookingCalendar';

// Timeslots Type Components
export { AvailabilityFields } from './AvailabilityFields';
export { TimeslotManagement } from './TimeslotManagement';
export { DaySelector } from './DaySelector';
export { TimeslotEditor } from './TimeslotEditor';

// Days Type Components
export { AvailabilityFieldsDays } from './AvailabilityFieldsDays';
export { BookingModeSwitcher } from './BookingModeSwitcher';
export { DateRangeSettings } from './DateRangeSettings';
export { WeekdayExclusions } from './WeekdayExclusions';

// Types
export type {
	Timeslot,
	TimeslotGroup,
	TimeslotsConfig,
	BufferConfig,
	AvailabilityConfig,
	BookingModeType,
	DateRangeConfig,
	BookingFieldValue,
	BookingFieldProps,
	GeneratorConfig,
} from './types';

export {
	DEFAULT_BOOKING_VALUE,
	DEFAULT_WEEKDAYS,
	DEFAULT_WEEKDAYS_SHORT,
	WEEKDAY_KEYS,
	MAX_SLOTS_PER_GROUP,
} from './types';

// Utils
export {
	timeToMinutes,
	minutesToTime,
	getGroupLabelShort,
	getGroupLabelFull,
	getUnusedDays,
	isDayAvailable,
	isDayUsedElsewhere,
	isValidSlot,
	sortSlots,
	deduplicateSlots,
	normalizeSlots,
	generateTimeslots,
	formatSlot,
	getSlotCountLabel,
	createEmptyGroup,
	createDefaultSlot,
	formatDate,
	parseDate,
	isSameDay,
	DEFAULT_GENERATOR_CONFIG,
} from './utils';

// Icons
export {
	CLOCK_ICON,
	TRASH_CAN_ICON,
	CHEVRON_DOWN_ICON,
	PLUS_ICON,
	COG_ICON,
	SWITCH_ICON,
	CAL_ALT_ICON,
	CALENDAR_MINUS_ICON,
	INFO_ICON,
} from './icons';
