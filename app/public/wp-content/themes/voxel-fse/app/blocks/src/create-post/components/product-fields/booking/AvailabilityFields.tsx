/**
 * Availability Fields Component
 *
 * Renders the availability configuration fields for booking:
 * - Max days (availability window)
 * - Buffer period with unit toggle (days/hours)
 * - Quantity per slot (if enabled)
 *
 * EXACT Voxel HTML: themes/voxel/templates/widgets/create-post/product-field/booking/type-timeslots.php:6-33
 */
import React from 'react';
import type { BookingFieldValue } from './types';
import { SWITCH_ICON } from './icons';

interface AvailabilityFieldsProps {
	value: BookingFieldValue;
	onChange: (value: BookingFieldValue) => void;
	quantityEnabled: boolean;
}

export const AvailabilityFields: React.FC<AvailabilityFieldsProps> = ({
	value,
	onChange,
	quantityEnabled,
}) => {
	/**
	 * Toggle buffer unit between 'days' and 'hours'
	 * Evidence: type-timeslots.php line 19 (toggleUnit logic)
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
	 * Update quantity per slot value
	 */
	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = parseInt(e.target.value, 10) || 1;
		onChange({
			...value,
			quantity_per_slot: Math.max(1, newValue),
		});
	};

	// Determine column width based on quantity enabled
	// Evidence: type-timeslots.php lines 6-7 (vx-1-2 or vx-1-3)
	const columnClass = quantityEnabled ? 'vx-1-3' : 'vx-1-2';

	// Evidence: Voxel Original has NO wrapper div - fields are direct children of parent form-field-grid
	return (
		<>
			{/* Max Days Field */}
			{/* Evidence: type-timeslots.php lines 6-14 */}
			<div className={`ts-form-group ${columnClass}`}>
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
			{/* Evidence: type-timeslots.php lines 15-29 */}
			<div className={`ts-form-group ${columnClass}`}>
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
						{value.availability.buffer.unit === 'days' ? 'Days' : 'Hours'}
					</span>
				</div>
			</div>

			{/* Quantity per Slot Field (conditional) */}
			{/* Evidence: type-timeslots.php lines 30-33 */}
			{quantityEnabled && (
				<div className="ts-form-group vx-1-3">
					<label>Quantity per slot</label>
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

export default AvailabilityFields;
