/**
 * Date Field Component - Phase D Implementation
 * Handles: date field type with optional timepicker
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/date-field.php
 *
 * Value structure:
 * - Without timepicker: string (YYYY-MM-DD)
 * - With timepicker: { date: string, time: string }
 *
 * Phase D Improvements:
 * ✅ Full-screen popup with proper popup-kit styling
 * ✅ React Portal rendering for correct z-index
 * ✅ Matches Voxel's exact HTML structure
 * ✅ ESC key and backdrop click to close
 * ✅ Body scroll lock when popup is open
 *
 * Uses:
 * - FieldPopup for full-screen popup modal (Phase D)
 * - DatePicker for interactive calendar (Pikaday)
 */
import React, { useState, useCallback, useMemo, useRef } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
// Import shared components (Voxel's commons.js pattern)
import { FieldPopup, DatePicker } from '@shared';
import { FieldLabel } from './FieldLabel';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_CALENDAR_ICON, VOXEL_CLOCK_ICON } from '../../utils/voxelDefaultIcons';

interface DateValue {
	date: string | null;
	time?: string | null;
}

interface DateFieldProps {
	field: VoxelField;
	value: DateValue | string;
	onChange: (value: DateValue | string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

// Helper function to format date for display
const formatDateForDisplay = (dateString: string | null): string => {
	if (!dateString) return '';
	try {
		const date = new Date(dateString + 'T00:00:00');
		if (!isFinite(date.getTime())) return '';
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch {
		return dateString;
	}
};

// Helper to convert string to Date
const stringToDate = (dateString: string | null): Date | null => {
	if (!dateString) return null;
	try {
		const date = new Date(dateString + 'T00:00:00');
		return isFinite(date.getTime()) ? date : null;
	} catch {
		return null;
	}
};

// Helper to convert Date to YYYY-MM-DD string
const dateToString = (date: Date | null): string | null => {
	if (!date) return null;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const DateField: React.FC<DateFieldProps> = ({ field, value, onChange, onBlur, icons }) => {
	const enableTimepicker = field.props?.['enable_timepicker'] === true;
	const inputRef = useRef<HTMLDivElement>(null);

	// Normalize value to object format
	const currentValue: DateValue = typeof value === 'string'
		? { date: value, time: null }
		: (value || { date: null, time: null });

	// Popup state
	const [isOpen, setIsOpen] = useState(false);

	// Internal date state for the picker
	const [pickerDate, setPickerDate] = useState<Date | null>(() => stringToDate(currentValue.date));

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Open popup
	const openPopup = useCallback(() => {
		setPickerDate(stringToDate(currentValue.date));
		setIsOpen(true);
	}, [currentValue.date]);

	// Close popup
	const closePopup = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Handle date change from picker
	const handleDateChange = useCallback((date: Date | null) => {
		setPickerDate(date);
	}, []);

	// Handle save - update the field value and close popup
	// EXACT Voxel: onSave() saves value AND closes popup immediately
	// Evidence: themes/voxel/assets/dist/auth.js (datePicker.onSelect calls parent.onSave which saves and blurs)
	//
	// CRITICAL: Accept optional date parameter to avoid React state timing issues
	// When called from Pikaday's onSelect, the date is passed directly (state hasn't updated yet)
	// When called from Save button, uses pickerDate from state
	const handleSave = useCallback((selectedDate?: Date | null) => {
		const dateToSave = selectedDate !== undefined ? selectedDate : pickerDate;
		const dateString = dateToString(dateToSave);
		if (enableTimepicker) {
			onChange({ date: dateString, time: currentValue.time });
		} else {
			onChange(dateString || '');
		}
		onBlur?.();

		// CRITICAL: Close popup immediately after save (Voxel's immediate behavior)
		closePopup();
	}, [pickerDate, enableTimepicker, currentValue.time, onChange, onBlur, closePopup]);

	// Handle clear
	const handleClear = useCallback(() => {
		setPickerDate(null);
		if (enableTimepicker) {
			onChange({ date: null, time: null });
		} else {
			onChange('');
		}
	}, [enableTimepicker, onChange]);

	// Handle time change
	const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = e.target.value;
		onChange({ date: currentValue.date, time: newTime });
	}, [currentValue.date, onChange]);

	// Display value for the trigger
	const displayValue = useMemo(() => {
		return formatDateForDisplay(currentValue.date) || field.props?.['placeholder'] || field.label;
	}, [currentValue.date, field.props, field.label]);

	// EXACT Voxel: Get calendar icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/date-field.php:26
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'calendar.svg' )
	const calendarIconHtml = iconToHtml(icons?.tsCalendarIcon, VOXEL_CALENDAR_ICON);

	// EXACT Voxel: Get clock icon from widget settings OR use Voxel default
	// Used in timepicker when enabled
	const clockIconHtml = iconToHtml(icons?.tsClockIcon, VOXEL_CLOCK_ICON);

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Field label */}
			<FieldLabel
				field={field}
				value={currentValue.date}
				className="ts-form-label"
			/>

			{/* Trigger button to open popup */}
			<div
				ref={inputRef}
				className={`ts-filter ts-popup-target ${currentValue.date ? 'ts-filled' : ''}`}
				role="button"
				tabIndex={0}
				onClick={openPopup}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						openPopup();
					}
				}}
				aria-label={`Select date: ${displayValue}`}
			>
				<span dangerouslySetInnerHTML={{ __html: calendarIconHtml }} />
				<div className="ts-filter-text">
					{displayValue}
				</div>
			</div>

			{/* Date picker popup */}
			<FieldPopup
				isOpen={isOpen}
				target={inputRef}
				title=""
				icon={calendarIconHtml}
				saveLabel="Save"
				clearLabel="Clear"
				showClear={true}
				onSave={handleSave}
				onClear={handleClear}
				onClose={closePopup}
			>
				<DatePicker
					value={pickerDate}
					onChange={handleDateChange}
					onSelect={handleSave}
				/>
			</FieldPopup>

			{/* Time picker (when enabled) */}
			{enableTimepicker && (
				<div className="ts-form-group" style={{ marginTop: '12px' }}>
					<FieldLabel
						field={{ ...field, label: 'Time', required: false }}
						value={currentValue.time}
					/>
					<div className="ts-input-icon flexify">
						<span dangerouslySetInnerHTML={{ __html: clockIconHtml }} />
						<input
							type="time"
							value={currentValue.time || ''}
							onChange={handleTimeChange}
							className="ts-filter"
							placeholder="HH:MM"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default DateField;
