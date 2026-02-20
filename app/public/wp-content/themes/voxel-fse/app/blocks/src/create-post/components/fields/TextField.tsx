/**
 * Text Field Component - ENHANCED to Level 2
 * Handles: text, title field types
 *
 * Voxel Templates:
 * - text: themes/voxel/templates/widgets/create-post/text-field.php
 * - title: themes/voxel/templates/widgets/create-post/title-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-27
 *
 * Features Added:
 * - Description tooltip (vx-dialog) - Voxel title-field.php lines 7-12
 * - Suffix support for text fields - Voxel text-field.php lines 13-16
 * - Fixed CSS class: ts-input-text → ts-filter - Voxel title-field.php line 14
 * - input-container wrapper for suffix - Voxel text-field.php line 13
 */
import React from 'react';
import type { VoxelField, FieldIcons } from '../../types';

interface TextFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const TextField: React.FC<TextFieldProps> = ({ field, value, onChange, onBlur }) => {
	const [localError, setLocalError] = React.useState<string>('');

	// Check if this text field has suffix support
	// Profile-name extends Text_Field, so it can have suffix too
	const hasSuffix = field.props?.['suffix'] !== undefined ? String(field.props['suffix']) : undefined;

	// Regex pattern validation from admin config
	// Evidence: text-field.php:98 — returns regex pattern string for client-side validation
	const pattern = field.props?.['pattern'] as string | null;

	// Real-time validation while typing
	const handleChange = (newValue: string) => {
		onChange(newValue);

		// Validate minlength/maxlength/pattern if there's a value
		if (newValue && newValue.length > 0) {
			const minlength = Number(field.props?.['minlength'] ?? 0);
			const maxlength = Number(field.props?.['maxlength'] ?? 0);

			if (minlength && newValue.length < minlength) {
				setLocalError(`Value cannot be shorter than ${minlength} characters`);
			} else if (maxlength && newValue.length > maxlength) {
				setLocalError(`Value cannot be longer than ${maxlength} characters`);
			} else if (pattern) {
				// Validate regex pattern — matches Voxel's server-side validation in text-field.php
				try {
					const regex = new RegExp(pattern);
					if (!regex.test(newValue)) {
						setLocalError('Please enter a value in the correct format');
					} else {
						setLocalError('');
					}
				} catch {
					// Invalid regex from admin — skip validation
					setLocalError('');
				}
			} else {
				setLocalError('');
			}
		} else {
			setLocalError('');
		}
	};

	// Use server error or local error
	const displayError = field.validation?.errors?.[0] || localError;
	const hasError = displayError.length > 0;

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Label - matches Voxel structure */}
			<label>
				{field.label}

				{/* Errors or Optional label - matches Voxel template exactly */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel title-field.php lines 7-12 */}
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

			{/* Input container - always present (1:1 match with Voxel text-field.php line 13) */}
			<div className="input-container">
				<input
					type="text"
					className="ts-filter"
					value={value || ''}
					onChange={(e) => handleChange(e.target.value)}
					onBlur={onBlur}
					placeholder={String(field.props?.['placeholder'] ?? field.placeholder ?? field.label ?? '')}
					required={field.required}
					title={field.label}
				/>
				{/* Suffix support - Voxel text-field.php line 15 */}
				{hasSuffix && <span className="input-suffix">{String(hasSuffix)}</span>}
			</div>
		</div>
	);
};

