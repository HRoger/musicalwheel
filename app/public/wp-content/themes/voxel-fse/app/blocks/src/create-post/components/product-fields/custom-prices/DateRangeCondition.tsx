/**
 * Date Range Condition Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/custom-prices/single-price.php (lines 92-120)
 *
 * Displays a popup with a date range picker (two calendars side by side).
 * Uses FieldPopup (React Portal) to match Voxel's popup structure with vx-popup wrapper.
 */
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FieldPopup } from '@shared';

interface DateRangeConditionProps {
	from: string | null;
	to: string | null;
	onChange: (from: string | null, to: string | null) => void;
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

// Calendar component for range selection
const RangeDatePicker: React.FC<{
	startDate: string | null;
	endDate: string | null;
	onStartChange: (date: string) => void;
	onEndChange: (date: string) => void;
	minDate?: Date;
}> = ({ startDate, endDate, onStartChange, onEndChange, minDate }) => {
	const today = new Date();

	// Left calendar shows current/start month, right shows next month
	const [leftMonth, setLeftMonth] = useState(startDate ? new Date(startDate + 'T00:00:00').getMonth() : today.getMonth());
	const [leftYear, setLeftYear] = useState(startDate ? new Date(startDate + 'T00:00:00').getFullYear() : today.getFullYear());

	// Compute right calendar month/year (next month from left)
	const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
	const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

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
		return day === 0 ? 6 : day - 1;
	};

	// Generate calendar days for a specific month/year
	const getCalendarDays = (month: number, year: number): (number | null)[] => {
		const daysInMonth = getDaysInMonth(month, year);
		const firstDay = getFirstDayOfMonth(month, year);
		const days: (number | null)[] = [];

		for (let i = 0; i < firstDay; i++) {
			days.push(null);
		}

		for (let d = 1; d <= daysInMonth; d++) {
			days.push(d);
		}

		return days;
	};

	const leftDays = useMemo(() => getCalendarDays(leftMonth, leftYear), [leftMonth, leftYear]);
	const rightDays = useMemo(() => getCalendarDays(rightMonth, rightYear), [rightMonth, rightYear]);

	// Check if date is disabled
	const isDateDisabled = (day: number, month: number, year: number) => {
		if (!minDate) return false;
		const date = new Date(year, month, day);
		return date < minDate;
	};

	// Check if date is in selected range
	const isInRange = (day: number, month: number, year: number) => {
		if (!startDate || !endDate) return false;
		const date = new Date(year, month, day);
		const start = new Date(startDate + 'T00:00:00');
		const end = new Date(endDate + 'T00:00:00');
		return date >= start && date <= end;
	};

	// Check if date is start or end
	const isStartDate = (day: number, month: number, year: number) => {
		if (!startDate) return false;
		const date = new Date(startDate + 'T00:00:00');
		return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
	};

	const isEndDate = (day: number, month: number, year: number) => {
		if (!endDate) return false;
		const date = new Date(endDate + 'T00:00:00');
		return date.getDate() === day && date.getMonth() === month && date.getFullYear() === year;
	};

	// Check if date is today
	const isToday = (day: number, month: number, year: number) => {
		return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
	};

	// Handle date click
	const handleDateClick = (day: number, month: number, year: number) => {
		if (isDateDisabled(day, month, year)) return;
		const formatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

		// If no start date or clicking before start date, set as start
		if (!startDate || (startDate && new Date(formatted + 'T00:00:00') < new Date(startDate + 'T00:00:00'))) {
			onStartChange(formatted);
			// Clear end date if new start is after current end
			if (endDate && new Date(formatted + 'T00:00:00') > new Date(endDate + 'T00:00:00')) {
				onEndChange('');
			}
		} else {
			// Set as end date
			onEndChange(formatted);
		}
	};

	// Navigate months (move both calendars)
	const prevMonth = () => {
		if (leftMonth === 0) {
			setLeftMonth(11);
			setLeftYear(leftYear - 1);
		} else {
			setLeftMonth(leftMonth - 1);
		}
	};

	const nextMonth = () => {
		if (leftMonth === 11) {
			setLeftMonth(0);
			setLeftYear(leftYear + 1);
		} else {
			setLeftMonth(leftMonth + 1);
		}
	};

	// Build td class string for range picker (classes go on td, not button)
	const getTdClassName = (day: number | null, month: number, year: number) => {
		if (day === null) return 'is-empty';
		const classes: string[] = [];
		if (isDateDisabled(day, month, year)) classes.push('is-disabled');
		if (isToday(day, month, year)) classes.push('is-today');
		if (isStartDate(day, month, year) || isEndDate(day, month, year)) classes.push('is-selected');
		if (isInRange(day, month, year) && !isStartDate(day, month, year) && !isEndDate(day, month, year)) classes.push('is-inrange');
		return classes.join(' ');
	};

	// Render a single calendar - EXACT Voxel HTML structure
	const renderCalendar = (month: number, year: number, days: (number | null)[], showNav: 'left' | 'right' | 'none') => (
		<div className="pika-lendar">
			{/* Header with navigation - Voxel structure: two pika-labels, then prev/next buttons */}
			<div className="pika-title" role="heading" aria-live="assertive">
				{/* Month label with visible text */}
				<div className="pika-label">
					{months[month]}
					<select
						value={month}
						onChange={(e) => {
							const newMonth = parseInt(e.target.value);
							if (showNav === 'left' || showNav === 'none') {
								setLeftMonth(newMonth);
							}
						}}
						className="pika-select pika-select-month"
						tabIndex={-1}
						disabled={showNav === 'right'}
					>
						{months.map((m, i) => (
							<option key={i} value={i}>{m}</option>
						))}
					</select>
				</div>
				{/* Year label with visible text */}
				<div className="pika-label">
					{year}
					<select
						value={year}
						onChange={(e) => {
							const newYear = parseInt(e.target.value);
							if (showNav === 'left' || showNav === 'none') {
								setLeftYear(newYear);
							}
						}}
						className="pika-select pika-select-year"
						tabIndex={-1}
						disabled={showNav === 'right'}
					>
						{years.map(y => (
							<option key={y} value={y}>{y}</option>
						))}
					</select>
				</div>
				{/* Prev button (only on left calendar) */}
				{showNav === 'left' && (
					<button
						type="button"
						className="pika-prev ts-icon-btn"
						onClick={prevMonth}
					>
						<PrevArrowIcon />
					</button>
				)}
				{/* Next button (only on right calendar) */}
				{showNav === 'right' && (
					<button
						type="button"
						className="pika-next ts-icon-btn"
						onClick={nextMonth}
					>
						<NextArrowIcon />
					</button>
				)}
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
					{Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
						<tr key={weekIndex} className="pika-row">
							{days.slice(weekIndex * 7, weekIndex * 7 + 7).map((day, dayIndex) => (
								<td
									key={dayIndex}
									data-day={day || undefined}
									className={getTdClassName(day, month, year)}
									aria-selected={day !== null && (isStartDate(day, month, year) || isEndDate(day, month, year))}
								>
									{day !== null && (
										<button
											type="button"
											className="pika-button pika-day"
											onClick={() => handleDateClick(day, month, year)}
											data-pika-year={year}
											data-pika-month={month}
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
	);

	// EXACT Voxel HTML structure - two calendars side by side for range selection
	// The ts-booking-date ts-booking-date-range wrapper provides the flex layout
	return (
		<div className="ts-booking-date ts-booking-date-range">
			<input type="hidden" />
			<div className="pika-single pika-range">
				{renderCalendar(leftMonth, leftYear, leftDays, 'left')}
				{renderCalendar(rightMonth, rightYear, rightDays, 'right')}
			</div>
		</div>
	);
};

export const DateRangeCondition: React.FC<DateRangeConditionProps> = ({
	from,
	to,
	onChange,
	popupKey,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [tempFrom, setTempFrom] = useState<string | null>(from);
	const [tempTo, setTempTo] = useState<string | null>(to);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Sync temp values when props change
	useEffect(() => {
		setTempFrom(from);
		setTempTo(to);
	}, [from, to]);

	// Handle save
	const handleSave = useCallback(() => {
		onChange(tempFrom, tempTo);
	}, [tempFrom, tempTo, onChange]);

	// Handle clear
	const handleClear = useCallback(() => {
		setTempFrom(null);
		setTempTo(null);
		onChange(null, null);
	}, [onChange]);

	// Format display label
	const getDisplayLabel = (): string => {
		if (!from || !to) return '';
		return `${from} to ${to}`;
	};

	const displayLabel = getDisplayLabel();
	const hasFilled = !!from && !!to;

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
					{displayLabel || 'Select dates'}
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
				className="xl-width xl-height"
			>
				<div className="ts-form-group">
					<RangeDatePicker
						startDate={tempFrom}
						endDate={tempTo}
						onStartChange={setTempFrom}
						onEndChange={setTempTo}
						minDate={minDate}
					/>
				</div>
			</FieldPopup>
		</div>
	);
};
