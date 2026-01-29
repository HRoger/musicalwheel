/**
 * Booking Calendar Component
 *
 * Multi-select calendar for excluding specific dates.
 * Uses Pikaday with custom selection management.
 *
 * EXACT Voxel HTML:
 * - timeslots: themes/voxel/templates/widgets/create-post/product-field/booking/type-timeslots.php:51-71
 * - days: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php:104-115
 */
import React, { useRef, useEffect, useCallback } from 'react';
import type { BookingFieldValue } from './types';
import { formatDate, parseDate, isSameDay } from './utils';

// Declare Pikaday global (loaded by Voxel)
declare global {
	interface Window {
		Pikaday: any;
	}
}

interface BookingCalendarProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
	value,
	onChange,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const pickerRef = useRef<any>(null);

	// Get excluded dates as Date objects for comparison
	const excludedDates = value.excluded_days.map(parseDate);

	/**
	 * Check if a date is in the excluded list
	 */
	const isDateExcluded = useCallback((date: Date): boolean => {
		return excludedDates.some(d => isSameDay(d, date));
	}, [excludedDates]);

	/**
	 * Toggle date exclusion
	 */
	const toggleDateExclusion = useCallback((date: Date) => {
		const dateStr = formatDate(date);
		const isCurrentlyExcluded = value.excluded_days.includes(dateStr);

		const newExcludedDays = isCurrentlyExcluded
			? value.excluded_days.filter(d => d !== dateStr)
			: [...value.excluded_days, dateStr].sort();

		onChange({
			...value,
			excluded_days: newExcludedDays,
		});
	}, [value, onChange]);

	/**
	 * Update visual selection on calendar cells
	 */
	const updateCalendarSelection = useCallback(() => {
		if (!containerRef.current) return;

		// Find all day buttons in the calendar
		const dayButtons = containerRef.current.querySelectorAll('.pika-button');

		dayButtons.forEach((button) => {
			const dayCell = button.closest('td');
			if (!dayCell) return;

			// Get date from data attributes
			const year = parseInt(button.getAttribute('data-pika-year') || '', 10);
			const month = parseInt(button.getAttribute('data-pika-month') || '', 10);
			const day = parseInt(button.getAttribute('data-pika-day') || '', 10);

			if (isNaN(year) || isNaN(month) || isNaN(day)) return;

			const cellDate = new Date(year, month, day);
			const isExcluded = isDateExcluded(cellDate);

			// Toggle selected class based on exclusion status
			if (isExcluded) {
				dayCell.classList.add('is-selected');
			} else {
				dayCell.classList.remove('is-selected');
			}
		});
	}, [isDateExcluded]);

	/**
	 * Initialize Pikaday instance
	 */
	useEffect(() => {
		if (!containerRef.current || !inputRef.current || !window.Pikaday) {
			return;
		}

		// Create Pikaday instance
		pickerRef.current = new window.Pikaday({
			field: inputRef.current,
			container: containerRef.current,
			bound: false, // Inline mode - always visible
			format: 'YYYY-MM-DD',
			firstDay: 1, // Start week on Monday
			showDaysInNextAndPreviousMonths: true,
			enableSelectionDaysInNextAndPreviousMonths: true,
			// Custom onSelect handler for multi-select behavior
			onSelect: function(date: Date) {
				toggleDateExclusion(date);
				// Update visual selection after React state updates
				setTimeout(updateCalendarSelection, 0);
			},
			// Update selection styling after month/year change
			onDraw: function() {
				setTimeout(updateCalendarSelection, 0);
			},
		});

		// Initial selection update
		updateCalendarSelection();

		return () => {
			if (pickerRef.current) {
				pickerRef.current.destroy();
				pickerRef.current = null;
			}
		};
	}, [toggleDateExclusion, updateCalendarSelection]);

	/**
	 * Update calendar selection when excluded_days changes externally
	 */
	useEffect(() => {
		updateCalendarSelection();
	}, [value.excluded_days, updateCalendarSelection]);

	return (
		<div className="ts-form-group">
			{/* Calendar header with info tooltip */}
			{/* Evidence: type-days.php lines 106-112 */}
			<label>
				Calendar{' '}
				<div className="vx-dialog">
					<svg width="80" height="80" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
						<path d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM11.9993 9.96045C12.4964 9.96045 12.9001 9.5575 12.9001 9.06045C12.9001 8.56339 12.4971 8.16045 12.0001 8.16045C11.503 8.16045 11.0993 8.56339 11.0993 9.06045C11.0993 9.5575 11.5023 9.96045 11.9993 9.96045ZM11.2501 15.8298C11.2501 16.244 11.5859 16.5798 12.0001 16.5798C12.4143 16.5798 12.7501 16.244 12.7501 15.8298V11.6054C12.7501 11.1912 12.4143 10.8554 12.0001 10.8554C11.5858 10.8554 11.2501 11.1912 11.2501 11.6054V15.8298Z" fill="#343C54"></path>
					</svg>
					<div className="vx-dialog-content min-scroll">
						<p>Availability visualization based on your settings. Click to exclude specific days</p>
					</div>
				</div>
			</label>

			{/* Pikaday container */}
			{/* Evidence: type-timeslots.php lines 51-71 */}
			<div
				className="ts-calendar-wrapper ts-availability-calendar"
				ref={containerRef}
			>
				<input type="hidden" ref={inputRef} />
			</div>
		</div>
	);
};

export default BookingCalendar;
