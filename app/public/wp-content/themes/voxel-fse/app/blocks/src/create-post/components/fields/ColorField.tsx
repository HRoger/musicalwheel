/**
 * Color Field Component - ENHANCED to Level 2
 * Handles: color field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/color-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-29 (Validation Update)
 *
 * Features Added:
 * - Validation error support from field.validation.errors
 * - Description tooltip (vx-dialog)
 * - Optional label display when not required
 * - ts-has-errors class for error styling
 */

import { useState, useEffect } from 'react';
import type { VoxelField, FieldIcons } from '../../types';

interface ColorFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

/**
 * Color Field Component
 *
 * Renders a color picker with both visual selector and text input
 * HTML structure matches Voxel exactly (1:1)
 */
export function ColorField({
	field,
	value: initialValue,
	onChange,
	onBlur,
}: ColorFieldProps) {
	const [value, setValue] = useState<string>(initialValue || '');

	// Get validation error from field (matches TextField/SelectField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Sync with parent value changes
	useEffect(() => {
		setValue(initialValue || '');
	}, [initialValue]);

	/**
	 * Sanitize hex color
	 * Matches Voxel's sanitize_hex_color() logic
	 * Evidence: themes/voxel/app/post-types/fields/color-field.php:39
	 */
	const sanitizeHexColor = (color: string): string => {
		if (!color) return '';

		// Remove whitespace
		color = color.trim().toLowerCase();

		// Add # if missing
		if (color[0] !== '#') {
			color = '#' + color;
		}

		// Validate hex format (3 or 6 digits)
		if (/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(color)) {
			return color;
		}

		return '';
	};

	const handleChange = (newValue: string) => {
		setValue(newValue);
		onChange(newValue);
	};

	const handleBlur = () => {
		// Sanitize on blur and always call onChange to sync
		const sanitized = sanitizeHexColor(value);
		setValue(sanitized);
		onChange(sanitized || value); // Use sanitized if valid, otherwise keep current value
		onBlur?.();
	};

	const placeholder = field.props?.['placeholder'] || field.label;

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<label>
				{field.label}

				{/* Errors or Optional label - 1:1 match with Voxel template slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* Description tooltip (vx-dialog) - matches TextField structure */}
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

			{/* 1:1 match with Voxel's color field structure */}
			{/* Evidence: themes/voxel/templates/widgets/create-post/color-field.php:14-17 */}
			<div className="ts-cp-con">
				<input
					type="color"
					className="ts-color-picker"
					value={value}
					onChange={(e) => handleChange(e.target.value)}
					onBlur={handleBlur}
				/>
				<input
					type="text"
					className="color-picker-input"
					value={value}
					placeholder={placeholder}
					onChange={(e) => handleChange(e.target.value)}
					onBlur={handleBlur}
				/>
			</div>
		</div>
	);
}
