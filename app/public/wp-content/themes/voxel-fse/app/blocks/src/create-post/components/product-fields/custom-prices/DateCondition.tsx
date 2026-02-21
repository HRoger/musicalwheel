/**
 * Date Condition Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/custom-prices/single-price.php (lines 64-90)
 *
 * Displays a popup with a single date picker.
 * Uses FieldPopup (React Portal) to match Voxel's popup structure with vx-popup wrapper.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FieldPopup } from '@shared';

interface DateConditionProps {
	date: string | null;
	onChange: (date: string | null) => void;
	popupKey: string;
}

// Arrow icons matching Voxel's exact SVGs from pika-prev/pika-next buttons
const PrevArrowIcon = () => (
	<svg fill="#1C2033" width="52" height="52" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{ enableBackground: 'new 0 0 64 64' } as React.CSSProperties}>
		<path d="M56,29.8H13.3l17-17.3c0.9-0.9,0.9-2.3,0-3.2c-0.9-0.9-2.3-0.9-3.2,0l-20.7,21c-0.9,0.9-0.9,2.3,0,3.2l20.7,21c0.4,0.4,1,0.7,1.6,0.7c0.6,0,1.1-0.2,1.6-0.6c0.9-0.9,0.9-2.3,0-3.2L13.4,34.3H56c1.2,0,2.2-1,2.2-2.2C58.2,30.8,57.2,29.8,56,29.8z" />
	</svg>
);

const NextArrowIcon = () => (
	<svg fill="#1C2033" width="52" height="52" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style={{ enableBackground: 'new 0 0 64 64' } as React.CSSProperties}>
		<path d="M57.6,30.4l-20.7-21c-0.9-0.9-2.3-0.9-3.2,0c-0.9,0.9-0.9,2.3,0,3.2l16.8,17.1H8c-1.2,0-2.2,1-2.2,2.2s1,2.3,2.2,2.3h42.7l-17,17.3c-0.9,0.9-0.9,2.3,0,3.2c0.4,0.4,1,0.6,1.6,0.6c0.6,0,1.2-0.2,1.6-0.7l20.7-21C58.5,32.7,58.5,31.3,57.6,30.4z" />
	</svg>
);

// Day of week full names for abbr title
const dayFullNames: Record<string, string> = {
	'Mon': 'Monday',
	'Tue': 'Tuesday',
	'Wed': 'Wednesday',
	'Thu': 'Thursday',
	'Fri': 'Friday',
	'Sat': 'Saturday',
	'Sun': 'Sunday',
};

// Simple date picker component matching Voxel's EXACT HTML structure
const SimpleDatePicker: React.FC<{
	selectedDate: string | null;
	onChange: (date: string) => void;
	minDate?: Date;
}> = ({ selectedDate, onChange, minDate }) => {
	const today = new Date();
	const [viewMonth, setViewMonth] = useState(selectedDate ? new Date(selectedDate + 'T00:00:00').getMonth() : today.getMonth());
	const [viewYear, setViewYear] = useState(selectedDate ? new Date(selectedDate + 'T00:00:00').getFullYear() : today.getFullYear());

	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	// Generate years for dropdown (50 years back to 10 years forward, matching Voxel)
	const years = useMemo(() => {
		const result = [];
		for (let y = today.getFullYear() - 50; y <= today.getFullYear() + 10; y++) {
			result.push(y);
		}
		return result;
	}, []);

	// Get days in month
	const getDaysInMonth = (month: number, year: number) => {
		return new Date(year, month + 1, 0).getDate();
	};

	// Get first day of month (0 = Sunday, adjust for Monday start)
	const getFirstDayOfMonth = (month: number, year: number) => {
		const day = new Date(year, month, 1).getDay();
		return day === 0 ? 6 : day - 1; // Convert to Monday = 0
	};

	// Generate calendar days
	const calendarDays = useMemo(() => {
		const daysInMonth = getDaysInMonth(viewMonth, viewYear);
		const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
		const days: (number | null)[] = [];

		// Add empty cells for days before first of month
		for (let i = 0; i < firstDay; i++) {
			days.push(null);
		}

		// Add days of month
		for (let d = 1; d <= daysInMonth; d++) {
			days.push(d);
		}

		return days;
	}, [viewMonth, viewYear]);

	// Check if date is disabled (before minDate)
	const isDateDisabled = (day: number) => {
		if (!minDate) return false;
		const date = new Date(viewYear, viewMonth, day);
		return date < minDate;
	};

	// Check if date is selected
	const isDateSelected = (day: number) => {
		if (!selectedDate) return false;
		const selected = new Date(selectedDate + 'T00:00:00');
		return selected.getDate() === day && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
	};

	// Check if date is today
	const isToday = (day: number) => {
		return today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
	};

	// Handle date click
	const handleDateClick = (day: number) => {
		if (isDateDisabled(day)) return;
		const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
		onChange(formatted);
	};

	// Navigate months
	const prevMonth = () => {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear(viewYear - 1);
		} else {
			setViewMonth(viewMonth - 1);
		}
	};

	const nextMonth = () => {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear(viewYear + 1);
		} else {
			setViewMonth(viewMonth + 1);
		}
	};

	// Build td class string (classes go on td, not button)
	const getTdClassName = (day: number | null) => {
		if (day === null) return 'is-empty';
		const classes: string[] = [];
		if (isDateDisabled(day)) classes.push('is-disabled');
		if (isToday(day)) classes.push('is-today');
		if (isDateSelected(day)) classes.push('is-selected');
		return classes.join(' ');
	};

	// EXACT Voxel HTML structure from themes/voxel/templates/widgets/create-post/product-field/custom-prices/single-price.php
	return (
		<div>
			<input type="hidden" />
			<div className="pika-single">
				<div className="pika-lendar">
					{/* Header with navigation - Voxel structure: two pika-labels, then prev/next buttons */}
					<div className="pika-title" role="heading" aria-live="assertive">
						{/* Month label with visible text */}
						<div className="pika-label">
							{months[viewMonth]}
							<select
								value={viewMonth}
								onChange={(e) => setViewMonth(parseInt(e.target.value))}
								className="pika-select pika-select-month"
								tabIndex={-1}
							>
								{months.map((m, i) => (
									<option key={i} value={i}>{m}</option>
								))}
							</select>
						</div>
						{/* Year label with visible text */}
						<div className="pika-label">
							{viewYear}
							<select
								value={viewYear}
								onChange={(e) => setViewYear(parseInt(e.target.value))}
								className="pika-select pika-select-year"
								tabIndex={-1}
							>
								{years.map(y => (
									<option key={y} value={y}>{y}</option>
								))}
							</select>
						</div>
						{/* Prev button */}
						<button
							type="button"
							className="pika-prev ts-icon-btn"
							onClick={prevMonth}
						>
							<PrevArrowIcon />
						</button>
						{/* Next button */}
						<button
							type="button"
							className="pika-next ts-icon-btn"
							onClick={nextMonth}
						>
							<NextArrowIcon />
						</button>
					</div>

					{/* Calendar grid - Voxel structure with role="grid" */}
					<table cellPadding={0} cellSpacing={0} className="pika-table" role="grid">
						<thead>
							<tr>
								{daysOfWeek.map(day => (
									<th key={day} scope="col">
										<abbr title={dayFullNames[day]}>{day}</abbr>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
								<tr key={weekIndex} className="pika-row">
									{calendarDays.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => (
										<td
											key={dayIndex}
											data-day={day || undefined}
											className={getTdClassName(day)}
											aria-selected={day !== null && isDateSelected(day)}
										>
											{day !== null && (
												<button
													type="button"
													className="pika-button pika-day"
													onClick={() => handleDateClick(day)}
													data-pika-year={viewYear}
													data-pika-month={viewMonth}
													data-pika-day={day}
												>
													{day}
												</button>
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export const DateCondition: React.FC<DateConditionProps> = ({
	date,
	onChange,
	popupKey: _popupKey,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [tempDate, setTempDate] = useState<string | null>(date);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Sync tempDate when date prop changes
	useEffect(() => {
		setTempDate(date);
	}, [date]);

	// Handle save
	const handleSave = useCallback(() => {
		onChange(tempDate);
	}, [tempDate, onChange]);

	// Handle clear
	const handleClear = useCallback(() => {
		setTempDate(null);
		onChange(null);
	}, [onChange]);

	// Format display date
	const getDisplayLabel = (): string => {
		if (!date) return '';
		return date;
	};

	const displayLabel = getDisplayLabel();
	const hasFilled = !!date;

	// Min date is yesterday
	const minDate = new Date();
	minDate.setDate(minDate.getDate() - 1);

	return (
		<div className="ts-form-group vx-1-3">
			{/* Trigger - ref used by FieldPopup for positioning */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target${hasFilled ? ' ts-filled' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="ts-filter-text">
					{displayLabel || 'Select date'}
				</div>
				<div className="ts-down-icon"></div>
			</div>

			{/* Popup - portaled to document.body with vx-popup wrapper */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef}
				onSave={handleSave}
				onClear={handleClear}
				onClose={() => setIsOpen(false)}
				showClear={true}
				className="lg-width md-height"
			>
				<div className="ts-form-group">
					<SimpleDatePicker
						selectedDate={tempDate}
						onChange={setTempDate}
						minDate={minDate}
					/>
				</div>
			</FieldPopup>
		</div>
	);
};
