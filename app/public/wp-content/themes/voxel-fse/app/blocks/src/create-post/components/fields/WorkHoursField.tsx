/**
 * Work Hours Field Component - Full Implementation
 * Handles: work-hours field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/work-hours-field.php
 * Evidence: themes/voxel/app/post-types/fields/work-hours-field.php
 *
 * Icons: Exact Voxel SVG paths from themes/voxel/assets/images/svgs/
 * - clock.svg (line 26)
 * - trash-can.svg (lines 32, 84)
 * - chevron-down.svg (line 35)
 * - plus.svg (lines 93, 127)
 */
import React, { useState, useRef, useCallback, useMemo } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { FormPopup } from '@shared';
import { FieldLabel } from './FieldLabel';

// Generate unique ID (replacement for useId which isn't available in wp.element)
const generateUid = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ===== Type Definitions =====

interface TimeSlot {
	from: string;  // HH:MM format (24-hour)
	to: string;    // HH:MM format (24-hour)
}

interface ScheduleGroup {
	days: string[];
	status: 'hours' | 'open' | 'closed' | 'appointments_only';
	hours: TimeSlot[];
}

// Fallback weekdays (used when field.props.weekdays not available)
// Voxel source: work-hours-field.php:147 returns \Voxel\get_weekdays() (localized)
const DEFAULT_WEEKDAYS: Record<string, string> = {
	mon: 'Monday',
	tue: 'Tuesday',
	wed: 'Wednesday',
	thu: 'Thursday',
	fri: 'Friday',
	sat: 'Saturday',
	sun: 'Sunday',
};

// Fallback status labels (used when field.props.statuses not available)
// Voxel source: work-hours-field.php:148-153 returns localized _x() strings
const DEFAULT_STATUS_OPTIONS: Record<string, string> = {
	hours: 'Enter hours',
	open: 'Open all day',
	closed: 'Closed all day',
	appointments_only: 'Appointments only',
};

// ===== Component Props =====

interface WorkHoursFieldProps {
	field: VoxelField;
	value: ScheduleGroup[] | null;
	onChange: (value: ScheduleGroup[]) => void;
	onBlur?: () => void;  // Keep for FieldRenderer compatibility
	icons?: FieldIcons;   // Keep for FieldRenderer compatibility
}

// ===== Icons (Exact Voxel SVG paths) =====
// Evidence: themes/voxel/assets/images/svgs/

const ClockIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12.75 6.49996C12.75 6.08575 12.4141 5.74998 11.9999 5.75C11.5857 5.75002 11.25 6.08582 11.25 6.50004L11.2502 11.25H8.00024C7.58603 11.25 7.25024 11.5858 7.25024 12C7.25024 12.4142 7.58603 12.75 8.00024 12.75H12.0002C12.1992 12.75 12.3899 12.671 12.5306 12.5303C12.6712 12.3897 12.7503 12.1989 12.7502 12L12.75 6.49996Z" fill="currentColor" />
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

// ===== Sub-Components =====

interface TimeSlotRowProps {
	slot: TimeSlot;
	index: number;
	onUpdate: (index: number, field: 'from' | 'to', value: string) => void;
	onRemove: (index: number) => void;
}

const TimeSlotRow: React.FC<TimeSlotRowProps> = ({ slot, index, onUpdate, onRemove }) => {
	return (
		<>
			<div className="ts-form-group vx-1-3">
				<input
					type="time"
					className="ts-filter"
					value={slot.from || ''}
					onChange={(e) => onUpdate(index, 'from', e.target.value)}
					onFocus={(e) => {
						try {
							e.target.showPicker?.();
						} catch {
							// showPicker not supported in all browsers
						}
					}}
				/>
			</div>
			<div className="ts-form-group vx-1-3">
				<input
					type="time"
					className="ts-filter"
					value={slot.to || ''}
					onChange={(e) => onUpdate(index, 'to', e.target.value)}
					onFocus={(e) => {
						try {
							e.target.showPicker?.();
						} catch {
							// showPicker not supported
						}
					}}
				/>
			</div>
			<div className="ts-form-group vx-1-3 vx-center-right">
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						onRemove(index);
					}}
					className="ts-btn ts-btn-1 form-btn"
				>
					<TrashIcon /> Remove
				</a>
			</div>
		</>
	);
};

interface DaySelectorPopupProps {
	selectedDays: string[];
	availableDays: string[];
	onToggleDay: (day: string) => void;
	weekdays: Record<string, string>;
}

const DaySelectorPopup: React.FC<DaySelectorPopupProps> = ({
	selectedDays,
	availableDays,
	onToggleDay,
	weekdays,
}) => {
	return (
		<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
			<ul className="simplify-ul ts-term-dropdown-list min-scroll">
				{Object.entries(weekdays).map(([key, label]) => {
					const isAvailable = availableDays.includes(key);
					const isChecked = selectedDays.includes(key);

					if (!isAvailable) return null;

					return (
						<li key={key}>
							<a
								href="#"
								onClick={(e) => {
									e.preventDefault();
									onToggleDay(key);
								}}
								className="flexify"
							>
								<div className="ts-checkbox-container">
									<label className="container-checkbox">
										<input
											type="checkbox"
											checked={isChecked}
											disabled
											hidden
											readOnly
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{label}</span>
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

interface ScheduleGroupComponentProps {
	group: ScheduleGroup;
	index: number;
	allUsedDays: string[];
	onUpdate: (updates: Partial<ScheduleGroup>) => void;
	onRemove: () => void;
	weekdays: Record<string, string>;
	statusOptions: Record<string, string>;
}

const ScheduleGroupComponent: React.FC<ScheduleGroupComponentProps> = ({
	group,
	index,
	allUsedDays,
	onUpdate,
	onRemove,
	weekdays,
	statusOptions,
}) => {
	const [isRowExpanded, setIsRowExpanded] = useState(true);
	const [isDaySelectorOpen, setIsDaySelectorOpen] = useState(false);
	const daySelectorTriggerRef = useRef<HTMLDivElement>(null);
	const uniqueId = useMemo(() => generateUid(), []);
	const popupId = `work-hours-days-${uniqueId}-${index}`;

	const availableDays = Object.keys(weekdays).filter(
		(day) => !allUsedDays.includes(day) || group.days.includes(day)
	);

	const displayDays = (days: string[]): string => {
		if (days.length === 0) return 'Select day(s)';
		if (days.length === Object.keys(weekdays).length) return 'Every day';
		return days.map((d) => weekdays[d]).join(', ');
	};

	const handleToggleDay = useCallback((day: string) => {
		const newDays = group.days.includes(day)
			? group.days.filter((d) => d !== day)
			: [...group.days, day];
		onUpdate({ days: newDays });
	}, [group.days, onUpdate]);

	const handleUpdateTimeSlot = useCallback((slotIndex: number, field: 'from' | 'to', value: string) => {
		const newHours = [...group.hours];
		newHours[slotIndex] = { ...newHours[slotIndex], [field]: value };
		onUpdate({ hours: newHours });
	}, [group.hours, onUpdate]);

	const handleRemoveTimeSlot = useCallback((slotIndex: number) => {
		const newHours = group.hours.filter((_, i) => i !== slotIndex);
		onUpdate({ hours: newHours });
	}, [group.hours, onUpdate]);

	const handleAddTimeSlot = useCallback(() => {
		const newHours = [...group.hours, { from: '09:00', to: '17:00' }];
		onUpdate({ hours: newHours });
	}, [group.hours, onUpdate]);

	const handleToggleRow = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		setIsRowExpanded((prev) => !prev);
	}, []);

	return (
		<div className="work-hours-field ts-repeater-container">
			<div className="ts-field-repeater">
				{/* Schedule Header */}
				<div className="ts-repeater-head" onClick={handleToggleRow}>
					<ClockIcon />
					<label>Schedule</label>
					<div className="ts-repeater-controller">
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onRemove();
							}}
							className="ts-icon-btn ts-smaller"
						>
							<TrashIcon />
						</a>
						<a
							href="#"
							className="ts-icon-btn ts-smaller"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								handleToggleRow(e);
							}}
							style={{
								transform: isRowExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
								transition: 'transform 0.2s ease',
							}}
						>
							<ChevronDownIcon />
						</a>
					</div>
				</div>

				{/* Schedule Content (collapsible) */}
				{isRowExpanded && (
					<div className="elementor-row medium form-field-grid">
						{/* Day Selector */}
						<div className="ts-form-group">
							<label>Select days with this schedule</label>
							<div
								ref={daySelectorTriggerRef}
								className={`ts-filter ts-popup-target ts-datepicker-input ${group.days.length ? 'ts-filled' : ''}`}
								onClick={() => setIsDaySelectorOpen(true)}
							>
								<div className="ts-filter-text">{displayDays(group.days)}</div>
								<div className="ts-down-icon"></div>
							</div>
						</div>

						{/* Day Selector Popup */}
						<FormPopup
							isOpen={isDaySelectorOpen}
							popupId={popupId}
							target={daySelectorTriggerRef.current}
							title="Select days"
							showHeader={false}
							saveLabel="Save"
							clearLabel="Clear"
							clearButton={true}
							onSave={() => setIsDaySelectorOpen(false)}
							onClear={() => {
								onUpdate({ days: [] });
								setIsDaySelectorOpen(false);
							}}
							onClose={() => setIsDaySelectorOpen(false)}
						>
							<DaySelectorPopup
								selectedDays={group.days}
								availableDays={availableDays}
								onToggleDay={handleToggleDay}
								weekdays={weekdays}
							/>
						</FormPopup>

						{/* Availability Status (only shown when days are selected) */}
						{group.days.length > 0 && (
							<>
								<div className="ts-form-group">
									<label>Set availability</label>
									<div className="ts-filter">
										<select
											value={group.status}
											onChange={(e) =>
												onUpdate({
													status: e.target.value as ScheduleGroup['status'],
													hours: e.target.value === 'hours' && group.hours.length === 0
														? [{ from: '09:00', to: '17:00' }]
														: group.hours,
												})
											}
										>
											{Object.entries(statusOptions).map(([value, label]) => (
												<option key={value} value={value}>
													{label}
												</option>
											))}
										</select>
										<div className="ts-down-icon"></div>
									</div>
								</div>

								{/* Time Slots (only shown when status is 'hours') */}
								{group.status === 'hours' && (
									<div className="ts-form-group">
										<label>Add work hours</label>
										<div className="form-field-grid medium">
											{group.hours.length > 0 && (
												<div className="ts-form-group">
													<div className="form-field-grid medium">
														{group.hours.map((slot, slotIndex) => (
															<TimeSlotRow
																key={slotIndex}
																slot={slot}
																index={slotIndex}
																onUpdate={handleUpdateTimeSlot}
																onRemove={handleRemoveTimeSlot}
															/>
														))}
													</div>
												</div>
											)}
											<div className="ts-form-group">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														handleAddTimeSlot();
													}}
													className="ts-repeater-add add-hours form-btn ts-btn ts-btn-4"
												>
													<PlusIcon /> Add hours
												</a>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

// ===== Main Component =====

export const WorkHoursField: React.FC<WorkHoursFieldProps> = ({
	field,
	value,
	onChange,
}) => {
	// Resolve localized weekdays and statuses from field.props (Voxel work-hours-field.php:145-155)
	// Falls back to English defaults when props not provided
	const weekdays: Record<string, string> = field.props?.weekdays && typeof field.props.weekdays === 'object'
		? field.props.weekdays
		: DEFAULT_WEEKDAYS;
	const statusOptions: Record<string, string> = field.props?.statuses && typeof field.props.statuses === 'object'
		? field.props.statuses
		: DEFAULT_STATUS_OPTIONS;

	const schedules: ScheduleGroup[] = Array.isArray(value) ? value : [];

	const getAllUsedDays = useCallback((): string[] => {
		return schedules.flatMap((group) => group.days);
	}, [schedules]);

	const hasUnusedDays = useCallback((): boolean => {
		const usedDays = getAllUsedDays();
		return Object.keys(weekdays).some((day) => !usedDays.includes(day));
	}, [getAllUsedDays, weekdays]);

	const handleAddSchedule = useCallback(() => {
		const newSchedule: ScheduleGroup = {
			days: [],
			status: 'hours',
			hours: [],
		};
		onChange([...schedules, newSchedule]);
	}, [schedules, onChange]);

	const handleRemoveSchedule = useCallback((index: number) => {
		const newSchedules = schedules.filter((_, i) => i !== index);
		onChange(newSchedules);
	}, [schedules, onChange]);

	const handleUpdateSchedule = useCallback((index: number, updates: Partial<ScheduleGroup>) => {
		const newSchedules = [...schedules];
		newSchedules[index] = { ...newSchedules[index], ...updates };
		onChange(newSchedules);
	}, [schedules, onChange]);

	// Get validation error from field
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	return (
		<div className={`ts-work-hours-field ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<FieldLabel field={field} />

			{schedules.map((group, index) => (
				<ScheduleGroupComponent
					key={index}
					group={group}
					index={index}
					allUsedDays={getAllUsedDays().filter(
						(day) => !group.days.includes(day)
					)}
					onUpdate={(updates) => handleUpdateSchedule(index, updates)}
					onRemove={() => handleRemoveSchedule(index)}
					weekdays={weekdays}
					statusOptions={statusOptions}
				/>
			))}

			{hasUnusedDays() && (
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						handleAddSchedule();
					}}
					className="ts-repeater-add ts-btn form-btn ts-btn-4"
				>
					<PlusIcon /> Create schedule
				</a>
			)}

			{field.validation?.errors?.length > 0 && (
				<span className="is-required error">
					{field.validation.errors[0]}
				</span>
			)}
		</div>
	);
};
