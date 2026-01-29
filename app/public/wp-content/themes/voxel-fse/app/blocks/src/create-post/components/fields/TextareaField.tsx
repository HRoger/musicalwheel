/**
 * Textarea Field Component - ENHANCED to Level 2
 * Handles: texteditor, description field types
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/description-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-29
 *
 * Features Added:
 * - Validation error support from field.validation.errors
 * - Description tooltip (vx-dialog)
 * - Optional label display when not required
 * - ts-has-errors class for error styling
 */
import React from 'react';
import type { VoxelField } from '../../types';

interface TextareaFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({ field, value, onChange, onBlur }) => {
	// Get validation error from field (matches TextField/SelectField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	return (
		<div className={`ts-form-group field-${field.type} ${hasError ? 'ts-has-errors' : ''}`}>
			{/* Label */}
			<label className="ts-form-label">
				{field.label}
				{/* Errors or Optional label - 1:1 match with Voxel template slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) */}
				{field.description && (
					<div className="vx-dialog">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor"/>
						</svg>
						<div className="vx-dialog-content min-scroll">
							<p>{field.description}</p>
						</div>
					</div>
				)}
			</label>

			{/* Textarea - matches Voxel CSS classes */}
			<textarea
				className="ts-textarea"
				value={value || ''}
				onChange={(e) => onChange(e.target.value)}
				onBlur={onBlur}
				placeholder={field.placeholder || field.label}
				required={field.required}
				rows={5}
				title={field.label}
			/>
		</div>
	);
};

