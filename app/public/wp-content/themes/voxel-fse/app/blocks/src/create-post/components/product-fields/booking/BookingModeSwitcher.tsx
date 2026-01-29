/**
 * Booking Mode Switcher Component
 *
 * Toggle switch between "Single day" and "Date range" booking modes.
 * Only displayed for 'days' booking type.
 * Uses shared ToggleSwitch component.
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php:39-49
 */
import React from 'react';
import type { BookingFieldValue, BookingModeType } from './types';
import { ToggleSwitch } from '../../fields/ToggleSwitch';

interface BookingModeSwitcherProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
}

export const BookingModeSwitcher: React.FC<BookingModeSwitcherProps> = ({
	value,
	onChange,
}) => {
	/**
	 * Toggle between single_day and date_range modes
	 * Evidence: type-days.php line 40
	 * When checked (single_day), unchecked means date_range
	 */
	const handleToggle = (checked: boolean) => {
		const newMode: BookingModeType = checked ? 'single_day' : 'date_range';
		onChange({
			...value,
			booking_mode: newMode,
		});
	};

	// Evidence: type-days.php line 43 (:checked="value.booking_mode === 'single_day'")
	const isSingleDay = value.booking_mode === 'single_day';

	return (
		<ToggleSwitch
			checked={isSingleDay}
			onChange={handleToggle}
			label="Dates are booked individually"
		/>
	);
};

export default BookingModeSwitcher;
