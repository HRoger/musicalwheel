/**
 * Recurring Date Field Component - Full Implementation
 * Handles: recurring-date field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/recurring-date-field.php
 * Evidence: themes/voxel/app/post-types/fields/recurring-date-field.php
 *
 * Icons: Exact Voxel SVG paths from themes/voxel/assets/images/svgs/
 * - calendar.svg (lines 52, 85, 189)
 * - trash-can.svg (line 21)
 * - chevron-down.svg (line 24)
 * - plus.svg (line 216)
 */
import React, { useState, useRef, useMemo, useCallback } from 'react';
import type { VoxelField, FieldIcons, RecurringDateValue, RecurringDateFieldPropsConfig } from '../../types';
import { FormPopup } from '@shared';
import { FieldLabel } from './FieldLabel';
import { ToggleSwitch } from './ToggleSwitch';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';

// Generate unique ID
const generateUid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ===== Default Values =====

const DEFAULT_DATE_VALUE: RecurringDateValue = {
	multiday: false,
	startDate: null,
	startTime: '09:00',
	endDate: null,
	endTime: '10:00',
	allday: false,
	repeat: false,
	frequency: 1,
	unit: 'week',
	until: null,
};

// Default units from Voxel
const DEFAULT_UNITS: Record<string, string> = {
	day: 'Day(s)',
	week: 'Week(s)',
	month: 'Month(s)',
	year: 'Year(s)',
};

// ===== Icons (Exact Voxel SVG paths) =====
// Evidence: themes/voxel/assets/images/svgs/

// Exact Voxel calendar.svg icon
const CalendarIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M8.75 2.75C8.75 2.33579 8.41421 2 8 2C7.58579 2 7.25 2.33579 7.25 2.75V3.75H5.5C4.25736 3.75 3.25 4.75736 3.25 6V8.25H20.75V6C20.75 4.75736 19.7426 3.75 18.5 3.75H16.75V2.75C16.75 2.33579 16.4142 2 16 2C15.5858 2 15.25 2.33579 15.25 2.75V3.75H8.75V2.75Z" fill="currentColor" />
		<path d="M3.25 19V9.75H20.75V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19ZM7.98438 11.95C7.54255 11.95 7.18438 12.3082 7.18438 12.75C7.18438 13.1918 7.54255 13.55 7.98438 13.55H7.99438C8.4362 13.55 8.79437 13.1918 8.79437 12.75C8.79437 12.3082 8.4362 11.95 7.99438 11.95H7.98438ZM11.9941 11.95C11.5523 11.95 11.1941 12.3082 11.1941 12.75C11.1941 13.1918 11.5523 13.55 11.9941 13.55H12.0041C12.446 13.55 12.8041 13.1918 12.8041 12.75C12.8041 12.3082 12.446 11.95 12.0041 11.95H11.9941ZM16.0039 11.95C15.5621 11.95 15.2039 16.3082 15.2039 12.75C15.2039 13.1918 15.5621 13.55 16.0039 13.55H16.0139C16.4557 13.55 16.8139 13.1918 16.8139 12.75C16.8139 12.3082 16.4557 11.95 16.0139 11.95H16.0039ZM7.98438 15.95C7.54255 15.95 7.18438 16.3082 7.18438 16.75C7.18438 17.1918 7.54255 17.55 7.98438 17.55H7.99438C8.4362 17.55 8.79437 17.1918 8.79437 16.75C8.79437 16.3082 8.4362 15.95 7.99438 15.95H7.98438ZM11.9941 15.95C11.5523 15.95 11.1941 16.3082 11.1941 16.75C11.1941 17.1918 11.5523 17.55 11.9941 17.55H12.0041C12.446 17.55 12.8041 17.1918 12.8041 16.75C12.8041 16.3082 12.446 15.95 12.0041 15.95H11.9941ZM16.0039 15.95C15.5621 15.95 15.2039 16.3082 15.2039 16.75C15.2039 17.1918 15.5621 17.55 16.0039 17.55H16.0139C16.4557 17.55 16.8139 17.1918 16.8139 16.75C16.8139 16.3082 16.4557 15.95 16.0139 15.95H16.0039Z" fill="currentColor" />
	</svg>
);

const TrashIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M9.5 2C9.08579 2 8.75 2.33579 8.75 2.75C8.75 3.16421 9.08579 3.5 9.5 3.5H14.5C14.9142 3.5 15.25 3.16421 15.25 2.75C15.25 2.33579 14.9142 2 14.5 2H9.5Z" fill="currentColor" />
		<path d="M4 5C3.74924 5 3.51506 5.12533 3.37597 5.33397C3.23687 5.54262 3.21125 5.80699 3.3077 6.03846L4.44231 8.76154C4.4804 8.85294 4.5 8.95098 4.5 9.05V19.75C4.5 20.9926 5.50736 22 6.75 22H17.25C18.4926 22 19.5 20.9926 19.5 19.75V9.04978C19.5 8.95083 19.5196 8.85286 19.5576 8.76151L20.6914 6.03827C20.7878 5.8068 20.7621 5.54249 20.623 5.33389C20.4839 5.12529 20.2498 5 19.999 5H4ZM10.75 10.5V16.5C10.75 16.9142 10.4142 17.25 10 17.25C9.58579 17.25 9.25 16.9142 9.25 16.5V10.5C9.25 10.0858 9.58579 9.75 10 9.75C10.4142 9.75 10.75 10.0858 10.75 10.5ZM14.75 10.5V16.5C14.75 16.9142 14.4142 17.25 14 17.25C13.5858 17.25 13.25 16.9142 13.25 16.5V10.5C13.25 10.0858 13.5858 9.75 14 9.75C14.4142 9.75 14.75 10.0858 14.75 10.5Z" fill="currentColor" />
	</svg>
);

const ChevronDownIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M12.7461 3.99951C12.7461 3.5853 12.4103 3.24951 11.9961 3.24951C11.5819 3.24951 11.2461 3.5853 11.2461 3.99951L11.2461 13.2548H6.00002C5.69663 13.2548 5.42312 13.4376 5.30707 13.7179C5.19101 13.9982 5.25526 14.3208 5.46986 14.5353L11.4228 20.4844C11.5604 20.6474 11.7662 20.7509 11.9961 20.7509C12.0038 20.7509 12.0114 20.7508 12.019 20.7505C12.2045 20.7458 12.3884 20.6727 12.53 20.5313L18.5302 14.5353C18.7448 14.3208 18.809 13.9982 18.693 13.7179C18.5769 13.4376 18.3034 13.2548 18 13.2548H12.7461L12.7461 3.99951Z" fill="currentColor" />
	</svg>
);

const PlusIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="currentColor" />
	</svg>
);

// ===== Component Props =====

interface RecurringDateFieldProps {
	field: VoxelField;
	value: RecurringDateValue[] | null;
	onChange: (value: RecurringDateValue[]) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

// ===== Date Item Component =====

interface DateItemProps {
	date: RecurringDateValue;
	index: number;
	field: VoxelField;
	onUpdate: (index: number, updates: Partial<RecurringDateValue>) => void;
	onRemove: (index: number) => void;
	props: RecurringDateFieldPropsConfig;
}

const DateItem: React.FC<DateItemProps> = ({
	date,
	index,
	field: _field,
	onUpdate,
	onRemove,
	props,
}) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
	const [isPeriodOpen, setIsPeriodOpen] = useState(false);
	const [isUntilOpen, setIsUntilOpen] = useState(false);

	const datePickerTriggerRef = useRef<HTMLDivElement>(null);
	const periodTriggerRef = useRef<HTMLDivElement>(null);
	const untilTriggerRef = useRef<HTMLDivElement>(null);

	const uniqueId = useMemo(() => generateUid(), []);
	const datePickerPopupId = `recurring-date-picker-${uniqueId}-${index}`;
	const periodPopupId = `recurring-period-${uniqueId}-${index}`;
	const untilPopupId = `recurring-until-${uniqueId}-${index}`;

	// Format date for display
	const formatDate = useCallback((dateStr: string | null): string => {
		if (!dateStr) return '';
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}, []);

	// Get date display text (single or range)
	const getDateDisplayText = () => {
		if (date.multiday) {
			if (!date.startDate && !date.endDate) {
				return 'Select dates';
			}
			const start = date.startDate ? formatDate(date.startDate) : props.l10n?.from || 'From';
			const end = date.endDate ? formatDate(date.endDate) : props.l10n?.to || 'To';
			return `${start} — ${end}`;
		} else {
			if (!date.startDate) {
				return 'Select date';
			}
			return formatDate(date.startDate);
		}
	};

	// Handle date clear
	const handleClearDate = () => {
		onUpdate(index, { startDate: null, endDate: null });
	};

	// Handle single date selection
	const handleSingleDateSelect = (selectedDate: string | null) => {
		onUpdate(index, { startDate: selectedDate, endDate: selectedDate });
		setIsDatePickerOpen(false);
	};

	// Handle range date selection
	const handleRangeDateSelect = (start: string | null, end: string | null) => {
		onUpdate(index, { startDate: start, endDate: end });
	};

	// Handle unit clear
	const handleClearUntil = () => {
		onUpdate(index, { until: null });
	};

	return (
		<div className="ts-repeater-container">
			<div className="ts-field-repeater">
				{/* Header */}
				<div
					className="ts-repeater-head"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					<label>Date</label>
					<div className="ts-repeater-controller">
						<a
							href="#"
							onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(index); }}
							className="ts-icon-btn ts-smaller"
						>
							<TrashIcon />
						</a>
						<a
							href="#"
							className="ts-icon-btn ts-smaller"
							onClick={(e) => e.preventDefault()}
						>
							<ChevronDownIcon />
						</a>
					</div>
				</div>

				{/* Content (collapsible) */}
				{isExpanded && (
					<div className="medium form-field-grid">
						{/* Multi-day Toggle */}
						<ToggleSwitch
							checked={date.multiday}
							onChange={(checked) => onUpdate(index, {
								multiday: checked,
								endDate: checked ? date.endDate : date.startDate
							})}
							label="Multi-day?"
							className="vx-1-3"
						/>

						{/* Date Picker - Single or Range */}
						<div className="ts-form-group vx-1-1">
							<div
								ref={datePickerTriggerRef}
								className={`ts-filter ts-popup-target ${date.startDate ? 'ts-filled' : ''}`}
								onClick={() => setIsDatePickerOpen(true)}
							>
								<CalendarIcon />
								<div className="ts-filter-text">{getDateDisplayText()}</div>
							</div>
						</div>

						{/* Date Picker Popup */}
						<FormPopup
							isOpen={isDatePickerOpen}
							popupId={datePickerPopupId}
							target={datePickerTriggerRef.current}
							title="Select date"
							showHeader={false}
							onSave={() => setIsDatePickerOpen(false)}
							onClear={handleClearDate}
							onClose={() => setIsDatePickerOpen(false)}
							popupClass={date.multiday ? 'ts-availability-wrapper xl-width xl-height' : 'md-width xl-height'}
						>
							{date.multiday ? (
								<DateRangePicker
									startDate={date.startDate}
									endDate={date.endDate}
									onChange={handleRangeDateSelect}
									onSave={() => setIsDatePickerOpen(false)}
									l10n={props.l10n}
								/>
							) : (
								<DatePicker
									value={date.startDate}
									onChange={handleSingleDateSelect}
									onSelect={() => setIsDatePickerOpen(false)}
								/>
							)}
						</FormPopup>

						{/* All-day Event Toggle (if timepicker enabled) */}
						{props.enable_timepicker && (
							<ToggleSwitch
								checked={date.allday}
								onChange={(checked) => onUpdate(index, { allday: checked })}
								label="All-day event"
							/>
						)}

						{/* Time Inputs (if not all-day and timepicker enabled) */}
						{props.enable_timepicker && !date.allday && (
							<>
								<div className="ts-form-group vx-1-2">
									<label>Start time</label>
									<input
										type="time"
										value={date.startTime}
										onChange={(e) => onUpdate(index, { startTime: e.target.value })}
										className="ts-filter"
										onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
									/>
								</div>
								<div className="ts-form-group vx-1-2">
									<label>End time</label>
									<input
										type="time"
										value={date.endTime}
										onChange={(e) => onUpdate(index, { endTime: e.target.value })}
										className="ts-filter"
										onFocus={(e) => (e.target as HTMLInputElement).showPicker?.()}
									/>
								</div>
							</>
						)}

						{/* Recurring Event Toggle (if recurrence allowed) */}
						{props.allow_recurrence && (
							<ToggleSwitch
								checked={date.repeat}
								onChange={(checked) => onUpdate(index, { repeat: checked })}
								label="Recurring event?"
							/>
						)}

						{/* Recurring Options (if repeat enabled) */}
						{props.allow_recurrence && date.repeat && (
							<>
								{/* Frequency Input */}
								<div className="ts-form-group vx-1-3">
									<label>Repeats every</label>
									<input
										type="number"
										value={date.frequency}
										min={1}
										onChange={(e) => onUpdate(index, { frequency: parseInt(e.target.value) || 1 })}
										className="ts-filter"
									/>
								</div>

								{/* Period Dropdown */}
								<div className="ts-form-group vx-1-3">
									<label>Period</label>
									<div
										ref={periodTriggerRef}
										className="ts-filter ts-filled"
										onClick={() => setIsPeriodOpen(true)}
									>
										<div className="ts-filter-text">
											{props.units?.[date.unit] || DEFAULT_UNITS[date.unit]}
										</div>
									</div>
								</div>

								{/* Period Popup */}
								<FormPopup
									isOpen={isPeriodOpen}
									popupId={periodPopupId}
									target={periodTriggerRef.current}
									showHeader={false}
									clearButton={false}
									onSave={() => setIsPeriodOpen(false)}
									onClose={() => setIsPeriodOpen(false)}
								>
									<div className="ts-term-dropdown ts-md-group">
										<ul className="simplify-ul ts-term-dropdown-list min-scroll">
											{Object.entries(props.units || DEFAULT_UNITS).map(([unitKey, unitLabel]) => (
												<li key={unitKey}>
													<a
														href="#"
														className="flexify"
														onClick={(e) => {
															e.preventDefault();
															onUpdate(index, { unit: unitKey as 'day' | 'week' | 'month' | 'year' });
															setIsPeriodOpen(false);
														}}
													>
														<div className="ts-checkbox-container">
															<label className="container-radio">
																<input
																	type="radio"
																	checked={date.unit === unitKey}
																	disabled
																	hidden
																	readOnly
																/>
																<span className="checkmark"></span>
															</label>
														</div>
														<span>{unitLabel}</span>
													</a>
												</li>
											))}
										</ul>
									</div>
								</FormPopup>

								{/* Until Date Picker */}
								<div className="ts-form-group vx-1-3">
									<label>Until</label>
									<div
										ref={untilTriggerRef}
										className={`ts-filter ts-popup-target ${date.until ? 'ts-filled' : ''}`}
										onClick={() => setIsUntilOpen(true)}
									>
										<CalendarIcon />
										<div className="ts-filter-text">
											{date.until ? formatDate(date.until) : 'Date'}
										</div>
									</div>
								</div>

								{/* Until Popup */}
								<FormPopup
									isOpen={isUntilOpen}
									popupId={untilPopupId}
									target={untilTriggerRef.current}
									showHeader={false}
									onSave={() => setIsUntilOpen(false)}
									onClear={handleClearUntil}
									onClose={() => setIsUntilOpen(false)}
									popupClass="xl-height md-width"
								>
									<DatePicker
										value={date.until}
										onChange={(selectedDate) => {
											onUpdate(index, { until: selectedDate });
											setIsUntilOpen(false);
										}}
										onSelect={() => setIsUntilOpen(false)}
										minDate={date.startDate ? new Date(date.startDate) : undefined}
									/>
								</FormPopup>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

// ===== Main Component =====

export const RecurringDateField: React.FC<RecurringDateFieldProps> = ({
	field,
	value,
	onChange,
	onBlur: _onBlur,
	icons: _icons,
}) => {
	// Get field props with defaults
	const props: RecurringDateFieldPropsConfig = {
		max_date_count: field.props?.max_date_count ?? 1,
		allow_recurrence: field.props?.allow_recurrence ?? true,
		enable_timepicker: field.props?.enable_timepicker ?? true,
		units: (field.props?.['units'] ?? DEFAULT_UNITS) as Record<string, string>,
		l10n: (field.props?.['l10n'] ?? { from: 'From', to: 'To' }) as { from: string; to: string },
	};

	// Initialize dates from value or empty array
	const dates = value || [];

	// Add new date
	const handleAddDate = useCallback(() => {
		if (dates.length < props.max_date_count) {
			onChange([...dates, { ...DEFAULT_DATE_VALUE }]);
		}
	}, [dates, props.max_date_count, onChange]);

	// Update a date
	const handleUpdateDate = useCallback((index: number, updates: Partial<RecurringDateValue>) => {
		const newDates = [...dates];
		newDates[index] = { ...newDates[index], ...updates };
		onChange(newDates);
	}, [dates, onChange]);

	// Remove a date
	const handleRemoveDate = useCallback((index: number) => {
		const newDates = dates.filter((_, i) => i !== index);
		onChange(newDates);
	}, [dates, onChange]);

	// Get validation error from field
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<FieldLabel field={field} />

			{/* Date Items */}
			{dates.map((date, index) => (
				<DateItem
					key={index}
					date={date}
					index={index}
					field={field}
					onUpdate={handleUpdateDate}
					onRemove={handleRemoveDate}
					props={props}
				/>
			))}

			{/* Add Date Button */}
			{dates.length < props.max_date_count && (
				<a
					href="#"
					onClick={(e) => { e.preventDefault(); handleAddDate(); }}
					className="ts-repeater-add ts-btn ts-btn-4 form-btn"
				>
					<PlusIcon />
					Add date
				</a>
			)}
		</div>
	);
};

export default RecurringDateField;
