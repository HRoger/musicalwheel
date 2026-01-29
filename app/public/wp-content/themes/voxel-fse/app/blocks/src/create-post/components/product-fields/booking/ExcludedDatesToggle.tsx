/**
 * Excluded Dates Toggle Component
 *
 * Toggle switch for enabling/disabling excluded specific dates.
 * Uses shared ToggleSwitch component.
 *
 * EXACT Voxel HTML:
 * - timeslots: themes/voxel/templates/widgets/create-post/product-field/booking/type-timeslots.php:45-53
 * - days: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php:89-102
 */
import React from 'react';
import type { BookingFieldValue } from './types';
import { ToggleSwitch } from '../../fields/ToggleSwitch';

interface ExcludedDatesToggleProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
}

export const ExcludedDatesToggle: React.FC<ExcludedDatesToggleProps> = ({
	value,
	onChange,
}) => {
	/**
	 * Toggle excluded_days_enabled
	 * Evidence: type-days.php lines 93-96
	 */
	const handleToggle = (checked: boolean) => {
		onChange({
			...value,
			excluded_days_enabled: checked,
			// Clear excluded days when disabled
			excluded_days: checked ? value.excluded_days : [],
		});
	};

	return (
		<ToggleSwitch
			checked={value.excluded_days_enabled}
			onChange={handleToggle}
			label="Exclude specific dates"
		/>
	);
};

export default ExcludedDatesToggle;
