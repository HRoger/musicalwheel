/**
 * Subscription Interval Field Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/subscription-interval-field.php
 *
 * Simple field with:
 * - Number input for frequency (1 - maxFrequency)
 * - Select dropdown for unit (day, week, month, year)
 */
import React, { useCallback, useMemo } from 'react';
import type { VoxelField } from '../../types';
import { InfoIcon } from '../icons/InfoIcon';

/**
 * Subscription interval value structure
 */
interface SubscriptionIntervalValue {
	frequency: number;
	unit: 'day' | 'week' | 'month' | 'year';
}

interface SubscriptionIntervalFieldProps {
	field: VoxelField; // Sub-field configuration from product type
	value: SubscriptionIntervalValue | null; // Current subscription interval value
	onChange: (value: SubscriptionIntervalValue) => void;
}

/**
 * Subscription Interval Field
 *
 * Value structure:
 * {
 *   frequency: number,  // Number of units (e.g., 1, 2, 3...)
 *   unit: string        // Unit type: 'day', 'week', 'month', 'year'
 * }
 */
export const SubscriptionIntervalField: React.FC<SubscriptionIntervalFieldProps> = ({
	field,
	value,
	onChange,
}) => {
	// Normalize value to object with defaults
	// EXACT Voxel: subscription-interval-field.php lines 20, 24
	const intervalValue = useMemo(() => {
		if (typeof value === 'object' && value !== null) {
			return {
				frequency: value.frequency || 1,
				unit: (value.unit || 'month') as 'day' | 'week' | 'month' | 'year',
			};
		}
		return {
			frequency: 1,
			unit: 'month' as 'day' | 'week' | 'month' | 'year',
		};
	}, [value]);

	// Get max frequency from field props (Voxel: line 20 :max="maxFrequency")
	const maxFrequency = (field.props?.['max_frequency'] as number | undefined) ?? 999;

	// Handle frequency change
	const handleFrequencyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newFrequency = parseInt(e.target.value, 10) || 1;
		onChange({
			...intervalValue,
			frequency: Math.max(1, Math.min(newFrequency, maxFrequency)),
		});
	}, [intervalValue, onChange, maxFrequency]);

	// Handle unit change
	const handleUnitChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		onChange({
			...intervalValue,
			unit: e.target.value as 'day' | 'week' | 'month' | 'year',
		});
	}, [intervalValue, onChange]);

	return (
		<div className="ts-form-group">
			<label>
				{field.label || 'Subscription interval'}
				{field.description && (
					<div className="vx-dialog">
						<InfoIcon />
						<div className="vx-dialog-content min-scroll">
							<p dangerouslySetInnerHTML={{ __html: field.description }}></p>
						</div>
					</div>
				)}
			</label>
			{/* EXACT Voxel: subscription-interval-field.php lines 18-33 */}
			<div className="form-field-grid">
				{/* Frequency input - EXACT Voxel line 20 */}
				<div className="ts-form-group vx-1-2">
					<input
						type="number"
						className="ts-filter"
						value={intervalValue.frequency}
						onChange={handleFrequencyChange}
						min={1}
						max={maxFrequency}
					/>
				</div>

				{/* Unit selector - EXACT Voxel lines 22-32 */}
				<div className="ts-form-group vx-1-2">
					<div className="ts-filter">
						<select
							value={intervalValue.unit}
							onChange={handleUnitChange}
						>
							<option value="day">Day(s)</option>
							<option value="week">Week(s)</option>
							<option value="month">Month(s)</option>
							<option value="year">Year(s)</option>
						</select>
						<div className="ts-down-icon"></div>
					</div>
				</div>
			</div>
		</div>
	);
};
