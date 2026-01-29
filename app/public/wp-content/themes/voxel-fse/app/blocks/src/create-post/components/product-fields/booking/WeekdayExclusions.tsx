/**
 * Weekday Exclusions Component
 *
 * Allows excluding specific weekdays from booking availability.
 * Uses FieldPopup with checkbox list for weekday selection.
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/weekday-exclusions.php
 */
import React, { useState, useRef } from 'react';
import type { BookingFieldValue } from './types';
import { CALENDAR_MINUS_ICON } from './icons';
import { FieldPopup } from '@shared';

interface WeekdayExclusionsProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
	weekdays: Record<string, string>; // { monday: 'Monday', ... }
}

export const WeekdayExclusions: React.FC<WeekdayExclusionsProps> = ({
	value,
	onChange,
	weekdays,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const triggerRef = useRef<HTMLDivElement>(null);

	/**
	 * Toggle weekday exclusion
	 * Evidence: weekday-exclusions.php line 31 (@toggleSelect)
	 */
	const toggleWeekday = (day: string) => {
		const currentExcluded = value.excluded_weekdays || [];
		const newExcluded = currentExcluded.includes(day)
			? currentExcluded.filter(d => d !== day)
			: [...currentExcluded, day];

		onChange({
			...value,
			excluded_weekdays: newExcluded,
		});
	};

	/**
	 * Get label for excluded weekdays
	 * Evidence: weekday-exclusions.php lines 9-11
	 */
	const getExcludedLabel = (): string => {
		const excluded = value.excluded_weekdays || [];
		if (excluded.length === 0) {
			return 'Click to exclude weekdays';
		}
		return excluded.map(day => weekdays[day]).join(', ');
	};

	/**
	 * Clear all excluded weekdays
	 */
	const handleClear = () => {
		onChange({
			...value,
			excluded_weekdays: [],
		});
	};

	// Check if any weekdays are excluded
	const hasExcluded = (value.excluded_weekdays || []).length > 0;

	return (
		<div className="ts-form-group">
			{/* Label */}
			{/* Evidence: weekday-exclusions.php line 3 */}
			<label>Exclude days of week</label>

			{/* Popup Trigger - rendered separately from FieldPopup */}
			{/* Evidence: weekday-exclusions.php lines 6-29 (slot trigger) */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target ${hasExcluded ? 'ts-filled' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				{/* Icon */}
				<span
					className="ts-filter-icon ts-smaller"
					dangerouslySetInnerHTML={{ __html: CALENDAR_MINUS_ICON }}
				/>
				{/* Label */}
				<div className="ts-filter-text">{getExcludedLabel()}</div>
				{/* Dropdown arrow */}
				<div className="ts-down-icon"></div>
			</div>

			{/* Popup Content */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef}
				onSave={() => setIsOpen(false)}
				onClear={handleClear}
				onClose={() => setIsOpen(false)}
				saveLabel="Save"
				showClear={true}
			>
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
					<ul className="simplify-ul ts-term-dropdown-list min-scroll">
						{/* Weekday checkboxes */}
						{/* Evidence: weekday-exclusions.php lines 30-48 (slot popup) */}
						{Object.entries(weekdays).map(([key, label]) => {
							const isExcluded = (value.excluded_weekdays || []).includes(key);

							return (
								<li key={key}>
									{/* Evidence: weekday-exclusions.php line 31-46 */}
									<a
										href="#"
										className="flexify"
										onClick={(e) => {
											e.preventDefault();
											toggleWeekday(key);
										}}
									>
										<div className="ts-checkbox-container">
											<label className="container-checkbox">
												{/* Evidence: Voxel uses disabled/hidden checkbox, visual state via CSS */}
												<input
													type="checkbox"
													checked={isExcluded}
													disabled
													hidden
													readOnly
												/>
												<span className="checkmark"></span>
											</label>
										</div>
										<span>{label}</span>
										{/* Evidence: weekday-exclusions.php shows calendar icon per item */}
										<div className="ts-term-icon">
											<span
												dangerouslySetInnerHTML={{ __html: CALENDAR_MINUS_ICON }}
											/>
										</div>
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

export default WeekdayExclusions;
