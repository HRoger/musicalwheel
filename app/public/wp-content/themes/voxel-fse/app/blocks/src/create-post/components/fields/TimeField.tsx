/**
 * Time Field Component - ENHANCED to Level 2
 * Handles: time field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/time-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-30
 *
 * Features Added:
 * - Validation error support from field.validation.errors (inline with label)
 * - Description tooltip (vx-dialog) - Voxel time-field.php lines 6-11
 * - Optional label display when not required
 * - ts-has-errors class for error styling
 *
 * Value structure: string (HH:MM format, e.g. "14:30")
 */
import React from 'react';
import type { VoxelField, FieldIcons } from '../../types';

interface TimeFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const TimeField: React.FC<TimeFieldProps> = ({ field, value, onChange, onBlur }) => {
	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	return (
		<div className={`ts-form-group vx-text-field field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<label>
				{field.label}

				{/* Errors or Optional label - 1:1 match with Voxel template slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* Description tooltip - 1:1 match with Voxel time-field.php lines 6-11 */}
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

			<div className="input-container">
				<input
					placeholder={field.props?.['placeholder'] || 'Time'}
					type="time"
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					onFocus={(e) => {
						// Show native time picker on focus (matches Voxel's onfocus="this.showPicker()")
						try {
							e.target.showPicker?.();
						} catch {
							// Silently fail if showPicker() is not supported
						}
					}}
					className="ts-filter"
					required={field.required}
					title={field.label}
				/>
			</div>
		</div>
	);
};

