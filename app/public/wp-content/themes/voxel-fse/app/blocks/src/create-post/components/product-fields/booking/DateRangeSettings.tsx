/**
 * Date Range Settings Component
 *
 * Min/max length configuration for date range booking mode.
 * Only displayed when booking_mode === 'date_range' (not 'single_day').
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php:51-83
 */
import React from 'react';
import type { BookingFieldValue } from './types';

interface DateRangeSettingsProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
}

export const DateRangeSettings: React.FC<DateRangeSettingsProps> = ({
	value,
	onChange,
}) => {
	/**
	 * Toggle set_custom_limits
	 * Evidence: type-days.php lines 56-60
	 */
	const toggleCustomLimits = () => {
		onChange({
			...value,
			date_range: {
				...value.date_range!,
				set_custom_limits: !value.date_range?.set_custom_limits,
			},
		});
	};

	/**
	 * Update minimum length value
	 * Evidence: type-days.php line 71 (v-model="value.date_range.min_length")
	 */
	const handleMinLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10) || 0;
		onChange({
			...value,
			date_range: {
				...value.date_range!,
				min_length: Math.max(0, newValue),
			},
		});
	};

	/**
	 * Update maximum length value
	 * Evidence: type-days.php line 78 (v-model="value.date_range.max_length")
	 */
	const handleMaxLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10) || 0;
		onChange({
			...value,
			date_range: {
				...value.date_range!,
				max_length: Math.max(0, newValue),
			},
		});
	};

	// Get current values
	const setCustomLimits = value.date_range?.set_custom_limits ?? false;
	const minLength = value.date_range?.min_length ?? 1;
	const maxLength = value.date_range?.max_length ?? 365;

	// Evidence: Voxel Original has NO wrapper div - fields are direct children of parent form-field-grid
	return (
		<>
			{/* Set custom limits toggle */}
			{/* Evidence: type-days.php lines 52-65 */}
			<div className="ts-form-group switcher-label">
				<label onClick={toggleCustomLimits}>
					<div className="switch-slider">
						<div className="onoffswitch">
							{/* Evidence: type-days.php lines 56-60 */}
							<input
								type="checkbox"
								className="onoffswitch-checkbox"
								checked={setCustomLimits}
								onChange={toggleCustomLimits}
							/>
							<label
								className="onoffswitch-label"
								onClick={(e) => {
									e.preventDefault();
									toggleCustomLimits();
								}}
							></label>
						</div>
					</div>
					{/* Evidence: type-days.php line 63 */}
					Set minimum and maximum range length
				</label>
			</div>

			{/* Min/Max length fields (only when set_custom_limits is true) */}
			{/* Evidence: type-days.php lines 67-82 */}
			{setCustomLimits && (
				<>
					{/* Min length input */}
					{/* Evidence: type-days.php lines 68-74 */}
					<div className="ts-form-group vx-1-2">
						<label>Minimum range length</label>
						<div className="input-container">
							<input
								type="number"
								value={minLength}
								onChange={handleMinLengthChange}
								min={0}
								className="ts-filter"
							/>
							<span className="input-suffix">Days</span>
						</div>
					</div>

					{/* Max length input */}
					{/* Evidence: type-days.php lines 75-81 */}
					<div className="ts-form-group vx-1-2">
						<label>Maximum range length</label>
						<div className="input-container">
							<input
								type="number"
								value={maxLength}
								onChange={handleMaxLengthChange}
								min={0}
								className="ts-filter"
							/>
							<span className="input-suffix">Days</span>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default DateRangeSettings;
