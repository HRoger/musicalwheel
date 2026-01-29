/**
 * Availability Fields for Days Type Component
 *
 * Renders the availability configuration fields for 'days' booking type:
 * - Max days (availability window)
 * - Buffer period with unit toggle (days/hours)
 * - Quantity per day (if enabled)
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/type-days.php:5-37
 */
import React from 'react';
import type { BookingFieldValue } from './types';
import { SWITCH_ICON } from './icons';

interface AvailabilityFieldsDaysProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
	quantityEnabled: boolean;
}

export const AvailabilityFieldsDays: React.FC<AvailabilityFieldsDaysProps> = ({
	value,
	onChange,
	quantityEnabled,
}) => {
	/**
	 * Toggle buffer unit between 'days' and 'hours'
	 * Evidence: type-days.php line 19
	 */
	const toggleBufferUnit = () => {
		const newUnit = value.availability.buffer.unit === 'days' ? 'hours' : 'days';
		onChange({
			...value,
			availability: {
				...value.availability,
				buffer: {
					...value.availability.buffer,
					unit: newUnit,
				},
			},
		});
	};

	/**
	 * Update max days value
	 */
	const handleMaxDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10) || 0;
		onChange({
			...value,
			availability: {
				...value.availability,
				max_days: Math.max(0, newValue),
			},
		});
	};

	/**
	 * Update buffer amount value
	 */
	const handleBufferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10) || 0;
		onChange({
			...value,
			availability: {
				...value.availability,
				buffer: {
					...value.availability.buffer,
					amount: Math.max(0, newValue),
				},
			},
		});
	};

	/**
	 * Update quantity per day value
	 * Evidence: type-days.php line 35 (v-model="value.quantity_per_slot")
	 * Note: Uses same field as timeslots but labeled "Quantity per day"
	 */
	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10) || 1;
		onChange({
			...value,
			quantity_per_slot: Math.max(1, newValue),
		});
	};

	// Evidence: type-days.php line 5
	// Availability gets vx-1-2 when quantity NOT enabled (no class when enabled)
	// :class="{'vx-1-2': !field.props.quantity_per_slot.enabled}"
	const availabilityClass = quantityEnabled ? 'ts-form-group' : 'ts-form-group vx-1-2';

	// Evidence: Voxel Original has NO wrapper div - fields are direct children of parent form-field-grid
	return (
		<>
			{/* Max Days Field */}
			{/* Evidence: type-days.php lines 5-11 */}
			<div className={availabilityClass}>
				<label>Availability</label>
				<div className="input-container">
					<input
						type="number"
						value={value.availability.max_days}
						onChange={handleMaxDaysChange}
						min={0}
						className="ts-filter"
					/>
					<span className="input-suffix">Days</span>
				</div>
			</div>

			{/* Buffer Period Field */}
			{/* Evidence: type-days.php lines 13-30 */}
			<div className="ts-form-group vx-1-2">
				<label>Buffer period</label>
				<div className="input-container">
					<input
						type="number"
						value={value.availability.buffer.amount}
						onChange={handleBufferAmountChange}
						min={0}
						className="ts-filter"
					/>
					<span
						className="input-suffix suffix-action"
						onClick={toggleBufferUnit}
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								toggleBufferUnit();
							}
						}}
					>
						{/* Switch icon - matches Voxel switch.svg */}
						<span
							dangerouslySetInnerHTML={{ __html: SWITCH_ICON }}
						/>
						{value.availability.buffer.unit === 'hours' ? 'Hours' : 'Days'}
					</span>
				</div>
			</div>

			{/* Quantity per Day Field (conditional) */}
			{/* Evidence: type-days.php lines 32-37 */}
			{/* Note: Uses vx-1-2 (not vx-1-3 like timeslots) and labeled "Quantity per day" */}
			{quantityEnabled && (
				<div className="ts-form-group vx-1-2">
					<label>Quantity per day</label>
					<input
						type="number"
						value={value.quantity_per_slot || 1}
						onChange={handleQuantityChange}
						min={1}
						className="ts-filter"
					/>
				</div>
			)}
		</>
	);
};

export default AvailabilityFieldsDays;
