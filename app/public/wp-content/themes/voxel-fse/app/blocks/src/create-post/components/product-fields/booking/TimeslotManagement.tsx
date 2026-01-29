/**
 * Timeslot Management Component
 *
 * Container for managing schedule groups with collapsible sections.
 * Each group has days and time slots.
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/timeslots.php:1-157
 */
import React, { useState } from 'react';
import type { TimeslotGroup, BookingFieldValue } from './types';
import { WEEKDAY_KEYS, DEFAULT_WEEKDAYS, DEFAULT_WEEKDAYS_SHORT } from './types';
import { getGroupLabelShort, getSlotCountLabel, getUnusedDays, createEmptyGroup } from './utils';
import { DaySelector } from './DaySelector';
import { TimeslotEditor } from './TimeslotEditor';
import { TRASH_CAN_ICON, CHEVRON_DOWN_ICON } from './icons';

interface TimeslotManagementProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
	weekdays: Record<string, string>;
	weekdaysShort: Record<string, string>;
}

export const TimeslotManagement: React.FC<TimeslotManagementProps> = ({
	value,
	onChange,
	weekdays,
	weekdaysShort,
}) => {
	// Track which group is currently expanded
	const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

	const groups = value.timeslots.groups;

	/**
	 * Add a new empty schedule group
	 */
	const handleAddGroup = () => {
		const newGroup = createEmptyGroup();
		const newGroups = [...groups, newGroup];
		onChange({
			...value,
			timeslots: {
				...value.timeslots,
				groups: newGroups,
			},
		});
		// Expand the new group
		setActiveGroupIndex(newGroups.length - 1);
	};

	/**
	 * Remove a group by index
	 */
	const handleRemoveGroup = (index: number, e: React.MouseEvent) => {
		e.stopPropagation();
		const newGroups = groups.filter((_, i) => i !== index);
		onChange({
			...value,
			timeslots: {
				...value.timeslots,
				groups: newGroups,
			},
		});
		// Collapse if removing active group
		if (activeGroupIndex === index) {
			setActiveGroupIndex(null);
		} else if (activeGroupIndex !== null && activeGroupIndex > index) {
			// Adjust active index if removing a group before it
			setActiveGroupIndex(activeGroupIndex - 1);
		}
	};

	/**
	 * Toggle group expand/collapse
	 */
	const handleToggleGroup = (index: number, e: React.MouseEvent) => {
		e.stopPropagation();
		setActiveGroupIndex(activeGroupIndex === index ? null : index);
	};

	/**
	 * Update days for a specific group
	 */
	const handleDaysChange = (groupIndex: number, days: string[]) => {
		const newGroups = [...groups];
		newGroups[groupIndex] = { ...newGroups[groupIndex], days };
		onChange({
			...value,
			timeslots: {
				...value.timeslots,
				groups: newGroups,
			},
		});
	};

	/**
	 * Update slots for a specific group
	 */
	const handleSlotsChange = (groupIndex: number, slots: typeof groups[0]['slots']) => {
		const newGroups = [...groups];
		newGroups[groupIndex] = { ...newGroups[groupIndex], slots };
		onChange({
			...value,
			timeslots: {
				...value.timeslots,
				groups: newGroups,
			},
		});
	};

	// Get unused days for "Add schedule" button visibility
	const unusedDays = getUnusedDays(groups, WEEKDAY_KEYS);

	return (
		<div className="ts-form-group">
			{/* Label - Evidence: Voxel Original has <label class>Timeslots</label> before ts-repeater-container */}
			<label>Timeslots</label>

			{/* Schedule Groups Container */}
			{/* Evidence: timeslots.php line 1 */}
			<div className="ts-repeater-container">
				{groups.map((group, index) => {
					const isActive = activeGroupIndex === index;
					const labelShort = getGroupLabelShort(group, weekdaysShort) || 'Schedule';
					const slotCountLabel = getSlotCountLabel(group.slots.length);

					return (
						<div
							key={index}
							className={`ts-field-repeater${isActive ? '' : ' collapsed'}`}
						>
							{/* Group Header */}
							{/* Evidence: timeslots.php lines 2-28 */}
							<div
								className="ts-repeater-head"
								onClick={(e) => handleToggleGroup(index, e)}
							>
								{/* Clock icon - direct child of ts-repeater-head (inline SVG for clean DOM) */}
								<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
									<path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12.75 6.49996C12.75 6.08575 12.4141 5.74998 11.9999 5.75C11.5857 5.75002 11.25 6.08582 11.25 6.50004L11.2502 11.25H8.00024C7.58603 11.25 7.25024 11.5858 7.25024 12C7.25024 12.4142 7.58603 12.75 8.00024 12.75H12.0002C12.1992 12.75 12.3899 12.671 12.5306 12.5303C12.6712 12.3897 12.7503 12.1989 12.7502 12L12.75 6.49996Z" fill="#343C54" />
								</svg>

								<label>{labelShort}</label>
								<em>{slotCountLabel}</em>

								{/* Controller buttons */}
								<div className="ts-repeater-controller">
									{/* Delete button */}
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											handleRemoveGroup(index, e);
										}}
										className="ts-icon-btn ts-smaller"
										dangerouslySetInnerHTML={{ __html: TRASH_CAN_ICON }}
									/>

									{/* Collapse/Expand button */}
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											handleToggleGroup(index, e);
										}}
										className="ts-icon-btn ts-smaller"
										dangerouslySetInnerHTML={{ __html: CHEVRON_DOWN_ICON }}
									/>
								</div>
							</div>

							{/* Group Content (only visible when expanded) */}
							{/* Evidence: timeslots.php lines 29-147 */}
							{isActive && (
								<div className="elementor-row medium form-field-grid">
									{/* Day Selector */}
									<DaySelector
										group={group}
										allGroups={groups}
										weekdays={weekdays}
										weekdaysShort={weekdaysShort}
										onDaysChange={(days) => handleDaysChange(index, days)}
									/>

									{/* Timeslot Editor - wrapped in ts-form-group */}
									<div className="ts-form-group">
										<TimeslotEditor
											slots={group.slots}
											onSlotsChange={(slots) => handleSlotsChange(index, slots)}
										/>
									</div>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Add Schedule Button */}
			{/* Evidence: timeslots.php lines 148-156 */}
			{unusedDays.length > 0 && (
				<a
					href="#"
					onClick={(e) => {
						e.preventDefault();
						handleAddGroup();
					}}
					className="ts-repeater-add ts-btn ts-btn-4 form-btn"
				>
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="rotate(0 0 0)">
						<path d="M12.0002 4.875C12.6216 4.875 13.1252 5.37868 13.1252 6V10.8752H18.0007C18.622 10.8752 19.1257 11.3789 19.1257 12.0002C19.1257 12.6216 18.622 13.1252 18.0007 13.1252H13.1252V18.0007C13.1252 18.622 12.6216 19.1257 12.0002 19.1257C11.3789 19.1257 10.8752 18.622 10.8752 18.0007V13.1252H6C5.37868 13.1252 4.875 12.6216 4.875 12.0002C4.875 11.3789 5.37868 10.8752 6 10.8752H10.8752V6C10.8752 5.37868 11.3789 4.875 12.0002 4.875Z" fill="#343C54" />
					</svg>
					Add schedule
				</a>
			)}
		</div>
	);
};

export default TimeslotManagement;
