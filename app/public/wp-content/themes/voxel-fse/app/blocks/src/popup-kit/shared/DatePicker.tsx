import React, { useRef, useState, useEffect } from 'react';
import Pikaday from 'pikaday';
import 'pikaday/css/pikaday.css';

export interface DatePickerProps {
	value: Date | null;
	onChange: (date: Date | null) => void;
	onSave?: () => void;
	minDate?: Date;
	maxDate?: Date;
	disabledDates?: Date[];
	format?: string;
	firstDay?: number;
	showMonthAfterYear?: boolean;
	yearRange?: number | [number, number];
	numberOfMonths?: number;
	mainCalendar?: 'left' | 'right';
}

/**
 * DatePicker Component
 * 
 * React wrapper for Pikaday date picker matching Voxel's behavior.
 * 
 * CRITICAL BEHAVIOR (matches Voxel):
 * - `onSelect` calls `onSave()` immediately after date selection
 * - No need for explicit save button click
 * - Inline rendering (bound: false)
 * - Month/year selectors enabled
 * 
 * Can be used:
 * - Standalone (without popup)
 * - Inside FormPopup component
 * 
 * @param props - DatePickerProps
 * @returns JSX.Element
 */
export const DatePicker: React.FC<DatePickerProps> = ({
	value,
	onChange,
	onSave,
	minDate,
	maxDate,
	disabledDates,
	format = 'YYYY-MM-DD',
	firstDay = 1, // Monday
	showMonthAfterYear = false,
	yearRange = 10,
	numberOfMonths = 1,
	mainCalendar = 'left',
}) => {
	const calendarRef = useRef<HTMLDivElement>(null);
	const pikadayRef = useRef<Pikaday | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(value);

	useEffect(() => {
		if (!calendarRef.current) return;

		// Initialize Pikaday
		pikadayRef.current = new Pikaday({
			// CRITICAL: bound: false for inline rendering
			bound: false,
			container: calendarRef.current,

			// Date configuration
			defaultDate: value || undefined,
			setDefaultDate: value !== null,
			minDate: minDate,
			maxDate: maxDate,
			disableDayFn: disabledDates
				? (date) => disabledDates.some((d) => d.toDateString() === date.toDateString())
				: undefined,

			// Display configuration
			format: format,
			firstDay: firstDay,
			showMonthAfterYear: showMonthAfterYear,
			yearRange: yearRange,
			numberOfMonths: numberOfMonths,
			mainCalendar: mainCalendar,

			// Keyboard input disabled (Voxel behavior)
			keyboardInput: false,

			// CRITICAL: onSelect calls onSave immediately (Voxel behavior)
			onSelect: (date: Date) => {
				setSelectedDate(date);
				onChange(date);

				// CRITICAL: Auto-save on selection (matches Voxel)
				if (onSave) {
					// Small delay to ensure state updates
					setTimeout(() => {
						onSave();
					}, 10);
				}
			},
		});

		// Cleanup
		return () => {
			if (pikadayRef.current) {
				pikadayRef.current.destroy();
				pikadayRef.current = null;
			}
		};
	}, []); // Empty deps - only initialize once

	// Update picker when value changes externally
	useEffect(() => {
		if (pikadayRef.current && value !== selectedDate) {
			setSelectedDate(value);
			if (value) {
				pikadayRef.current.setDate(value, false); // false = don't trigger onSelect
			} else {
				pikadayRef.current.setDate(null as any, false);
			}
		}
	}, [value]);

	// Update picker config when min/max dates change
	useEffect(() => {
		if (pikadayRef.current) {
			if (minDate) pikadayRef.current.setMinDate(minDate);
			if (maxDate) pikadayRef.current.setMaxDate(maxDate);
		}
	}, [minDate, maxDate]);

	return (
		<div className="ts-booking-date ts-form-group">
			<div ref={calendarRef} className="pikaday-container" />
		</div>
	);
};

/**
 * Hook to use DatePicker with state management
 * 
 * Usage:
 * ```tsx
 * const { date, setDate, datePickerElement, clearDate } = useDatePicker({
 *   onSave: (date) => console.log('Selected:', date),
 * });
 * ```
 */
export interface UseDatePickerOptions extends Omit<DatePickerProps, 'value' | 'onChange'> {
	initialValue?: Date | null;
}

export function useDatePicker(options: UseDatePickerOptions = {}) {
	const [date, setDate] = useState<Date | null>(options.initialValue || null);

	const handleChange = (newDate: Date | null) => {
		setDate(newDate);
	};

	const clearDate = () => {
		setDate(null);
	};

	const datePickerElement = (
		<DatePicker
			{...options}
			value={date}
			onChange={handleChange}
		/>
	);

	return {
		date,
		setDate,
		datePickerElement,
		clearDate,
	};
}
