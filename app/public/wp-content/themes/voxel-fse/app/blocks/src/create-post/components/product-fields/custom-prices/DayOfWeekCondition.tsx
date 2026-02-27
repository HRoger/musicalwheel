/**
 * Day of Week Condition Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/custom-prices/single-price.php (lines 29-62)
 *
 * Displays a popup with checkboxes for selecting weekdays.
 * Uses FieldPopup (React Portal) to match Voxel's popup structure with vx-popup wrapper.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FieldPopup } from '@shared';

interface DayOfWeekConditionProps {
	days: string[];
	onChange: (days: string[]) => void;
	weekdays: Record<string, string>;  // { '0': 'Sunday', '1': 'Monday', ... }
	popupKey: string;
}

export const DayOfWeekCondition: React.FC<DayOfWeekConditionProps> = ({
	days,
	onChange,
	weekdays,
	popupKey: _popupKey,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [tempDays, setTempDays] = useState<string[]>(days);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Sync tempDays when days prop changes
	useEffect(() => {
		setTempDays(days);
	}, [days]);

	// Toggle a specific day in temp state
	const toggleDay = useCallback((dayKey: string) => {
		setTempDays(prev => {
			if (prev.includes(dayKey)) {
				return prev.filter(d => d !== dayKey);
			} else {
				return [...prev, dayKey];
			}
		});
	}, []);

	// Handle save - commit temp changes
	const handleSave = useCallback(() => {
		onChange(tempDays);
	}, [tempDays, onChange]);

	// Handle clear - reset selection
	const handleClear = useCallback(() => {
		setTempDays([]);
		onChange([]);
	}, [onChange]);

	// Get display label for selected days
	const getDisplayLabel = (): string => {
		if (days.length === 0) return '';
		return days.map(day => weekdays[day]).filter(Boolean).join(', ');
	};

	const displayLabel = getDisplayLabel();
	const hasFilled = days.length > 0;

	// Default weekdays if not provided
	const defaultWeekdays: Record<string, string> = {
		'1': 'Monday',
		'2': 'Tuesday',
		'3': 'Wednesday',
		'4': 'Thursday',
		'5': 'Friday',
		'6': 'Saturday',
		'0': 'Sunday',
	};

	const weekdaysToUse = Object.keys(weekdays).length > 0 ? weekdays : defaultWeekdays;

	return (
		<div className="ts-form-group vx-1-3">
			{/* Trigger - ref used by FieldPopup for positioning */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target${hasFilled ? ' ts-filled' : ''}`}
				onClick={() => setIsOpen(!isOpen)}
			>
				<div className="ts-filter-text">
					{displayLabel || 'Select day(s)'}
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
			>
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown">
					<ul className="simplify-ul ts-term-dropdown-list min-scroll">
						{Object.entries(weekdaysToUse).map(([dayKey, dayLabel]) => (
							<li key={dayKey}>
								<a
									href="#"
									className="flexify"
									onClick={(e) => { e.preventDefault(); toggleDay(dayKey); }}
								>
									<div className="ts-checkbox-container">
										<label className="container-checkbox">
											<input
												type="checkbox"
												checked={tempDays.includes(dayKey)}
												disabled
												hidden
												readOnly
											/>
											<span className="checkmark"></span>
										</label>
									</div>
									<span>{dayLabel}</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			</FieldPopup>
		</div>
	);
};
