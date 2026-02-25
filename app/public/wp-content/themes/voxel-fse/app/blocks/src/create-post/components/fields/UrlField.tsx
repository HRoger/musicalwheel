/**
 * URL Field Component - ENHANCED to Level 2
 * Handles: url field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/url-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-27
 *
 * Features Added:
 * - Description tooltip (vx-dialog) - Voxel url-field.php lines 6-11
 */
import React from 'react';
import type { VoxelField, FieldIcons } from '../../types';

interface UrlFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const UrlField: React.FC<UrlFieldProps> = ({ field, value, onChange, onBlur }) => {
	const [localError, setLocalError] = React.useState<string>('');

	// Real-time URL validation while typing
	const handleChange = (newValue: string) => {
		onChange(newValue);

		// Validate URL format if there's a value
		if (newValue && newValue.length > 0) {
			try {
				new URL(newValue);
				setLocalError('');
			} catch {
				setLocalError('You must provide a valid URL');
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
			{/* Label */}
			<label>
				{field.label}
				{/* Errors or Optional label - matches Voxel template exactly */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel url-field.php lines 6-11 */}
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

			{/* URL input with icon - matches Voxel structure (line 13-16) */}
			<div className="ts-input-icon flexify">
				{/* URL/Link icon - matches Voxel line 14: link-alt.svg */}
				<svg width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M16.3378 6.36719C19.7411 6.36719 22.5 9.12608 22.5 12.5294C22.5 15.9326 19.7411 18.6915 16.3378 18.6915H13.5338V16.4415H16.3378C18.4985 16.4415 20.25 14.69 20.25 12.5294C20.25 10.3687 18.4985 8.61719 16.3378 8.61719H13.5338V6.36719L16.3378 6.36719ZM16.5034 12.5294C16.5034 13.1507 15.9997 13.6544 15.3784 13.6544L9.62162 13.6543C9.0003 13.6543 8.49662 13.1507 8.49662 12.5293C8.49662 11.908 9.0003 11.4043 9.62162 11.4043L15.3784 11.4044C15.9997 11.4044 16.5034 11.908 16.5034 12.5294ZM11.47 8.61719L8.66216 8.61719C6.50153 8.61719 4.75 10.3687 4.75 12.5293C4.75 14.69 6.50153 16.4415 8.66216 16.4415H11.47V18.6915H8.66216C5.25889 18.6915 2.5 15.9326 2.5 12.5293C2.5 9.12608 5.25889 6.36719 8.66216 6.36719L11.47 6.36719V8.61719Z" fill="currentColor" />
				</svg>
				<input
					type="url"
					className="ts-filter"
					value={value || ''}
					onChange={(e) => handleChange(e.target.value)}
					onBlur={onBlur}
					placeholder={String(field.props?.['placeholder'] ?? field.label ?? '')}
					required={field.required}
					title={field.label}
				/>
			</div>
		</div>
	);
};

