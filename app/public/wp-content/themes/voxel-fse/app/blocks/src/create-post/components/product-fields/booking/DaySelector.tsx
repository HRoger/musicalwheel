/**
 * Day Selector Component
 *
 * Popup dropdown for selecting weekdays for a timeslot group.
 * Uses FieldPopup component with checkbox list.
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/timeslots.php:30-69
 */
import React, { useState, useRef } from 'react';
import { FieldPopup } from '@shared';
import type { TimeslotGroup } from './types';
import { WEEKDAY_KEYS, DEFAULT_WEEKDAYS } from './types';
import { getGroupLabelShort, isDayAvailable } from './utils';

interface DaySelectorProps {
	group: TimeslotGroup;
	allGroups: TimeslotGroup[];
	weekdays: Record<string, string>;
	weekdaysShort: Record<string, string>;
	onDaysChange: (days: string[]) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
	group,
	allGroups,
	weekdays,
	weekdaysShort,
	onDaysChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [tempDays, setTempDays] = useState<string[]>([]);
	const triggerRef = useRef<HTMLDivElement>(null);

	/**
	 * Open popup and initialize temp days
	 */
	const handleOpen = () => {
		setTempDays([...group.days]);
		setIsOpen(true);
	};

	/**
	 * Toggle day selection in temp state
	 */
	const toggleDay = (day: string) => {
		setTempDays(prev => {
			if (prev.includes(day)) {
				return prev.filter(d => d !== day);
			} else {
				return [...prev, day];
			}
		});
	};

	/**
	 * Save changes and close popup
	 */
	const handleSave = () => {
		onDaysChange(tempDays);
		setIsOpen(false);
	};

	/**
	 * Clear all days
	 */
	const handleClear = () => {
		setTempDays([]);
	};

	/**
	 * Close without saving
	 */
	const handleClose = () => {
		setIsOpen(false);
	};

	// Get display label
	const displayLabel = getGroupLabelShort(group, weekdaysShort) || 'Choose day(s)';
	const isFilled = group.days.length > 0;

	return (
		<div className="ts-form-group">
			<label>Select days with this schedule</label>

			{/* Trigger button */}
			{/* Evidence: timeslots.php lines 32-39 */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target${isFilled ? ' ts-filled' : ''}`}
				onClick={handleOpen}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleOpen();
					}
				}}
			>
				<div className="ts-filter-text">{displayLabel}</div>
				<div className="ts-down-icon"></div>
			</div>

			{/* Day selection popup */}
			{/* Evidence: timeslots.php lines 41-68 */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef}
				onSave={handleSave}
				onClear={handleClear}
				onClose={handleClose}
				showClear={true}
				className="md-width md-height"
			>
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
					<ul className="simplify-ul ts-term-dropdown-list min-scroll">
						{WEEKDAY_KEYS.map((dayKey) => {
							const dayLabel = weekdays[dayKey] || DEFAULT_WEEKDAYS[dayKey];
							const isSelected = tempDays.includes(dayKey);
							const isAvailable = isDayAvailable(dayKey, group, allGroups);
							const isDisabled = !isSelected && !isAvailable;

							return (
								<li key={dayKey}>
									<a
										href="#"
										onClick={(e) => {
											e.preventDefault();
											if (!isDisabled) {
												toggleDay(dayKey);
											}
										}}
										className={`flexify${isDisabled ? ' vx-disabled' : ''}`}
									>
										<div className="ts-checkbox-container">
											<label className="container-checkbox">
												<input
													type="checkbox"
													checked={isSelected}
													onChange={() => {
														if (!isDisabled) {
															toggleDay(dayKey);
														}
													}}
													disabled={isDisabled}
												/>
												<span className="checkmark"></span>
											</label>
										</div>
										<span>{dayLabel}</span>
										<div className="ts-term-icon"></div>
									</a>
								</li>
							);
						})}
					</ul>
				</div>
			</FieldPopup>
		</div>
	);
};

export default DaySelector;
