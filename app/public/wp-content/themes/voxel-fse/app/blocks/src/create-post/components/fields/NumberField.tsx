/**
 * Number Field Component - ENHANCED to Level 2
 * Handles: number field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/number-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-27
 *
 * Features Added:
 * - Description tooltip (vx-dialog) - Voxel number-field.php lines 6-11, 35-40
 * - Stepper display mode - Voxel number-field.php lines 2-30
 * - Suffix support in default mode - Voxel number-field.php lines 51
 * - Fixed CSS class: ts-input-text → ts-filter (default) or ts-input-box (stepper)
 * - Increment/decrement buttons with min/max/step support
 */
import React from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_PLUS_ICON, VOXEL_MINUS_ICON } from '../../utils/voxelDefaultIcons';

interface NumberFieldProps {
	field: VoxelField;
	value: number | string;
	onChange: (value: number | string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const NumberField: React.FC<NumberFieldProps> = ({ field, value, onChange, onBlur, icons }) => {
	// Get number field props from Voxel config
	const min = field.props?.min;
	const max = field.props?.max;
	const step = field.props?.step || 1;
	// Evidence: number-field.php:192 — display is 'input' (default) or 'stepper'
	const displayMode = field.props?.display || 'input';
	const suffix = field.props?.suffix;
	// Evidence: number-field.php:185 — precision is calculated from step decimal places
	const precision = field.props?.precision as number | undefined;

	// EXACT Voxel: Get plus/minus icons from widget settings OR use Voxel defaults
	// Evidence: themes/voxel/templates/widgets/create-post/number-field.php:15,27
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg('icon.svg')
	const minusIconHtml = iconToHtml(icons?.tsMinusIcon, VOXEL_MINUS_ICON);
	const plusIconHtml = iconToHtml(icons?.tsPlusIcon, VOXEL_PLUS_ICON);

	// Round value to the correct precision (matches Voxel server-side validation)
	const roundToPrecision = (val: number): number => {
		if (precision !== undefined && precision > 0) {
			return parseFloat(val.toFixed(precision));
		}
		return val;
	};

	// Convert value to number for calculations
	const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;

	// Local validation state
	const [localError, setLocalError] = React.useState<string>('');

	// Validate number against min/max/required constraints
	const validateNumber = (inputValue: number | string | null | undefined): string => {
		// Check if required and empty
		if (field.required && (inputValue === '' || inputValue === null || inputValue === undefined)) {
			return 'Required';
		}

		// If not required and empty, no error
		if (inputValue === '' || inputValue === null || inputValue === undefined) {
			return '';
		}

		const num = typeof inputValue === 'string' ? parseFloat(inputValue) : inputValue;

		// Check if valid number
		if (isNaN(num)) {
			return 'Required';
		}

		// Check min constraint
		if (min !== undefined && num < min) {
			return `Value cannot be less than ${min}`;
		}

		// Check max constraint
		if (max !== undefined && num > max) {
			return `Value cannot be more than ${max}`;
		}

		return '';
	};

	// Increment/decrement handlers for stepper mode
	const handleIncrement = () => {
		let newValue = roundToPrecision(numValue + step);

		// If current value is below min, set to min
		if (min !== undefined && numValue < min) {
			newValue = min;
		}

		// Enforce max limit
		if (max !== undefined && newValue > max) {
			newValue = max;
		}

		onChange(newValue);
		// Clear local error after auto-correction
		setLocalError('');
	};

	const handleDecrement = () => {
		let newValue = roundToPrecision(numValue - step);

		// If current value is above max, set to max
		if (max !== undefined && numValue > max) {
			newValue = max;
		}

		// Enforce min limit
		if (min !== undefined && newValue < min) {
			newValue = min;
		}

		onChange(newValue);
		// Clear local error after auto-correction
		setLocalError('');
	};

	// Handle input change with validation
	const handleInputChange = (inputValue: string) => {
		// Update value first
		onChange(inputValue);

		// Validate and set error message
		const error = validateNumber(inputValue);
		setLocalError(error);
	};

	// Handle blur - auto-correct to min/max if out of bounds, apply precision
	const handleBlurWithCorrection = () => {
		const num = parseFloat(value as string);

		// If valid number, apply precision rounding and bounds correction
		if (!isNaN(num)) {
			const rounded = roundToPrecision(num);
			if (min !== undefined && rounded < min) {
				onChange(min);
				setLocalError('');
			} else if (max !== undefined && rounded > max) {
				onChange(max);
				setLocalError('');
			} else if (rounded !== num) {
				// Apply precision rounding on blur
				onChange(rounded);
				setLocalError('');
			}
		}

		// Call original onBlur if provided
		if (onBlur) {
			onBlur();
		}
	};

	// Use local error or server error
	const displayError = localError || (field.validation?.errors?.length > 0 ? field.validation.errors[0] : '');
	const hasError = displayError.length > 0;

	// Stepper mode - matches Voxel lines 2-30
	if (displayMode === 'stepper') {
		return (
			<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
				<label>
					{field.label}
					{/* Errors or Optional label */}
					{hasError ? (
						<span className="is-required">{displayError}</span>
					) : (
						!field.required && <span className="is-required">Optional</span>
					)}

					{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel number-field.php lines 6-11 */}
					{field.description && (
						<div className="vx-dialog">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor" />
							</svg>
							<div className="vx-dialog-content min-scroll">
								<p>{field.description}</p>
							</div>
						</div>
					)}
				</label>

				{/* Stepper input - matches Voxel lines 13-29 */}
				<div className="ts-stepper-input flexify">
					{/* Decrement button */}
					<button
						type="button"
						className="ts-stepper-left ts-icon-btn"
						onClick={handleDecrement}
						disabled={min !== undefined && numValue <= min}
					>
						<span dangerouslySetInnerHTML={{ __html: minusIconHtml }} />
					</button>

					{/* ENHANCEMENT: Uses ts-input-box class in stepper mode - Voxel line 20 */}
					<input
						type="number"
						className="ts-input-box"
						value={value || ''}
						onChange={(e) => handleInputChange(e.target.value)}
						onBlur={handleBlurWithCorrection}
						placeholder={field.props?.placeholder || field.placeholder}
						required={field.required}
						min={min}
						max={max}
						step={step}
					/>

					{/* Increment button */}
					<button
						type="button"
						className="ts-stepper-right ts-icon-btn"
						onClick={handleIncrement}
						disabled={max !== undefined && numValue >= max}
					>
						<span dangerouslySetInnerHTML={{ __html: plusIconHtml }} />
					</button>
				</div>
			</div>
		);
	}

	// Default mode - matches Voxel lines 31-54
	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<label>
				{field.label}
				{/* Errors or Optional label */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel number-field.php lines 35-40 */}
				{field.description && (
					<div className="vx-dialog">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor" />
						</svg>
						<div className="vx-dialog-content min-scroll">
							<p>{field.description}</p>
						</div>
					</div>
				)}
			</label>

			{/* ENHANCEMENT: Conditional wrapper for suffix support - Voxel line 42 */}
			{suffix ? (
				<div className="input-container">
					{/* ENHANCEMENT: Fixed CSS class ts-input-text → ts-filter - Voxel line 47 */}
					<input
						type="number"
						className="ts-filter"
						value={value || ''}
						onChange={(e) => handleInputChange(e.target.value)}
						onBlur={handleBlurWithCorrection}
						placeholder={field.props?.placeholder || field.placeholder}
						required={field.required}
						min={min}
						max={max}
						step={step}
						title={field.label}
					/>
					{/* ENHANCEMENT: Suffix support - Voxel line 51 */}
					<span className="input-suffix">{suffix}</span>
				</div>
			) : (
				/* Default input without suffix */
				<input
					type="number"
					className="ts-filter"
					value={value || ''}
					onChange={(e) => handleInputChange(e.target.value)}
					onBlur={handleBlurWithCorrection}
					placeholder={field.props?.placeholder || field.placeholder}
					required={field.required}
					min={min}
					max={max}
					step={step}
					title={field.label}
				/>
			)}
		</div>
	);
};

