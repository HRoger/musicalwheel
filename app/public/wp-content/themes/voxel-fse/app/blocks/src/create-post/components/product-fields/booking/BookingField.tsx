/**
 * Booking Field Component
 *
 * Main component for booking field rendering.
 * Supports both 'timeslots' and 'days' booking types.
 *
 * EXACT Voxel HTML:
 * - timeslots: themes/voxel/templates/widgets/create-post/product-field/booking/type-timeslots.php
 * - days: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php
 */
import React, { useEffect, useRef } from 'react';
import type { BookingFieldProps, BookingFieldValue } from './types';
import { DEFAULT_BOOKING_VALUE, DEFAULT_WEEKDAYS, DEFAULT_WEEKDAYS_SHORT } from './types';

// Shared Components
import { ExcludedDatesToggle } from './ExcludedDatesToggle';
import { BookingCalendar } from './BookingCalendar';

// Timeslots Type Components
import { AvailabilityFields } from './AvailabilityFields';
import { TimeslotManagement } from './TimeslotManagement';

// Days Type Components
import { AvailabilityFieldsDays } from './AvailabilityFieldsDays';
import { BookingModeSwitcher } from './BookingModeSwitcher';
import { DateRangeSettings } from './DateRangeSettings';
import { WeekdayExclusions } from './WeekdayExclusions';

export const BookingField: React.FC<BookingFieldProps> = ({
	field,
	value,
	onChange,
}) => {
	// Track if we've initialized to prevent infinite loops
	const hasInitialized = useRef(false);

	// Ensure value has all required properties with defaults
	// Handle null/undefined value gracefully
	// Use explicit property assignment for date_range to satisfy TypeScript's strict type checking
	const safeValue: BookingFieldValue = {
		...DEFAULT_BOOKING_VALUE,
		...(value || {}),
		availability: {
			...DEFAULT_BOOKING_VALUE.availability,
			...(value?.availability || {}),
			buffer: {
				...DEFAULT_BOOKING_VALUE.availability.buffer,
				...(value?.availability?.buffer || {}),
			},
		},
		timeslots: {
			...DEFAULT_BOOKING_VALUE.timeslots,
			...(value?.timeslots || {}),
		},
		date_range: {
			set_custom_limits: value?.date_range?.set_custom_limits ?? DEFAULT_BOOKING_VALUE.date_range?.set_custom_limits ?? false,
			min_length: value?.date_range?.min_length ?? DEFAULT_BOOKING_VALUE.date_range?.min_length ?? 1,
			max_length: value?.date_range?.max_length ?? DEFAULT_BOOKING_VALUE.date_range?.max_length ?? 365,
		},
	};

	// CRITICAL FIX: Initialize value in parent state if not already set
	// This ensures the booking data structure is present for form submission
	// Without this, the booking key would be undefined/missing when submitted
	useEffect(() => {
		// Only initialize once and only if value is undefined/null or missing key properties
		if (!hasInitialized.current && (!value || !value.availability)) {
			hasInitialized.current = true;
			// Create initial value directly (not using safeValue from render to avoid stale closures)
			const initialValue: BookingFieldValue = {
				...DEFAULT_BOOKING_VALUE,
				...(value || {}),
				availability: {
					...DEFAULT_BOOKING_VALUE.availability,
					...(value?.availability || {}),
					buffer: {
						...DEFAULT_BOOKING_VALUE.availability.buffer,
						...(value?.availability?.buffer || {}),
					},
				},
				timeslots: {
					...DEFAULT_BOOKING_VALUE.timeslots,
					...(value?.timeslots || {}),
				},
				date_range: {
					set_custom_limits: value?.date_range?.set_custom_limits ?? DEFAULT_BOOKING_VALUE.date_range?.set_custom_limits ?? false,
					min_length: value?.date_range?.min_length ?? DEFAULT_BOOKING_VALUE.date_range?.min_length ?? 1,
					max_length: value?.date_range?.max_length ?? DEFAULT_BOOKING_VALUE.date_range?.max_length ?? 365,
				},
			};
			console.log('[BookingField] Initializing default booking value', initialValue);
			onChange(initialValue);
		}
	}, [value, onChange]); // Include deps but only run init once via ref

	// Get weekdays from field props or use defaults
	const weekdays = field.props.weekdays || DEFAULT_WEEKDAYS;
	const weekdaysShort = field.props.weekdays_short || DEFAULT_WEEKDAYS_SHORT;

	// Check if quantity per slot is enabled
	const quantityEnabled = field.props.quantity_per_slot?.enabled ?? false;

	// Get booking type
	const bookingType = field.props.booking_type;

	/**
	 * Render 'timeslots' booking type
	 * Evidence: type-timeslots.php
	 */
	const renderTimeslotsType = () => (
		<>
			{/* Availability Fields: max_days, buffer, quantity_per_slot */}
			{/* Evidence: type-timeslots.php lines 6-33 */}
			<AvailabilityFields
				value={safeValue}
				onChange={onChange}
				quantityEnabled={quantityEnabled}
			/>

			{/* Timeslot Management: schedule groups with day selector and slot editor */}
			{/* Evidence: type-timeslots.php lines 35-155 */}
			<TimeslotManagement
				value={safeValue}
				onChange={onChange}
				weekdays={weekdays}
				weekdaysShort={weekdaysShort}
			/>

			{/* Excluded Dates Toggle */}
			{/* Evidence: type-timeslots.php lines 45-53 */}
			<ExcludedDatesToggle
				value={safeValue}
				onChange={onChange}
			/>

			{/* Calendar (conditional on excluded_days_enabled) */}
			{/* Evidence: type-timeslots.php lines 51-71 */}
			{safeValue.excluded_days_enabled && (
				<BookingCalendar
					value={safeValue}
					onChange={onChange}
				/>
			)}
		</>
	);

	/**
	 * Render 'days' booking type
	 * Evidence: type-days.php
	 */
	const renderDaysType = () => (
		<>
			{/* Availability Fields for Days: max_days, buffer, quantity_per_day */}
			{/* Evidence: type-days.php lines 5-37 */}
			<AvailabilityFieldsDays
				value={safeValue}
				onChange={onChange}
				quantityEnabled={quantityEnabled}
			/>

			{/* Booking Mode Switcher: single_day / date_range toggle */}
			{/* Evidence: type-days.php lines 39-49 */}
			<BookingModeSwitcher
				value={safeValue}
				onChange={onChange}
			/>

			{/* Date Range Settings (only when booking_mode === 'date_range') */}
			{/* Evidence: type-days.php lines 51-83 */}
			{safeValue.booking_mode !== 'single_day' && (
				<DateRangeSettings
					value={safeValue}
					onChange={onChange}
				/>
			)}

			{/* Weekday Exclusions */}
			{/* Evidence: type-days.php lines 85-87 + weekday-exclusions.php */}
			<WeekdayExclusions
				value={safeValue}
				onChange={onChange}
				weekdays={weekdays}
			/>

			{/* Excluded Dates Toggle */}
			{/* Evidence: type-days.php lines 89-102 */}
			<ExcludedDatesToggle
				value={safeValue}
				onChange={onChange}
			/>

			{/* Calendar (conditional on excluded_days_enabled) */}
			{/* Evidence: type-days.php lines 104-115 */}
			{safeValue.excluded_days_enabled && (
				<BookingCalendar
					value={safeValue}
					onChange={onChange}
				/>
			)}
		</>
	);

	// Evidence: Voxel Original shows booking fields render as direct siblings
	// in the parent form-field-grid, NOT wrapped in another container.
	// The parent ProductField component handles the outer structure.
	return bookingType === 'days' ? renderDaysType() : renderTimeslotsType();
};

export default BookingField;
