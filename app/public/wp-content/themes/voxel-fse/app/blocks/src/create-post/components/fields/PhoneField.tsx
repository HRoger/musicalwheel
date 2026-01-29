/**
 * Phone Field Component - ENHANCED to Level 2
 * Handles: phone field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/phone-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-29 (Validation Update)
 *
 * Features Added:
 * - Validation error support from field.validation.errors
 * - Description tooltip (vx-dialog) - Voxel phone-field.php lines 6-11
 * - Optional label display when not required
 * - ts-has-errors class for error styling
 */
import React from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_PHONE_ICON } from '../../utils/voxelDefaultIcons';

interface PhoneFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({ field, value, onChange, onBlur, icons }) => {
	// Get validation error from field (matches TextField/SelectField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// EXACT Voxel: Get phone icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/phone-field.php:14
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'phone.svg' )
	const phoneIconHtml = iconToHtml(icons?.tsPhoneIcon, VOXEL_PHONE_ICON);

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Label - matches Voxel structure */}
			<label>
				{field.label}
				{/* Errors or Optional label - 1:1 match with Voxel template slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel phone-field.php lines 6-11 */}
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

			{/* Input with icon - matches Voxel structure (line 13-20) */}
			<div className="ts-input-icon flexify">
				<span dangerouslySetInnerHTML={{ __html: phoneIconHtml }} />
				{/* Phone input - matches Voxel line 15-20 */}
				<input
					type="tel"
					className="ts-filter"
					value={value || ''}
					onChange={(e) => onChange(e.target.value)}
					onBlur={onBlur}
					placeholder={field.placeholder || field.label}
					required={field.required}
					title={field.label}
				/>
			</div>
		</div>
	);
};

