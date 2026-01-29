/**
 * Switcher Field Component
 *
 * 1:1 React implementation matching Voxel's Vue switcher field
 * Evidence: themes/voxel/templates/widgets/create-post/switcher-field.php:1-22
 *
 * @package VoxelFSE
 * @since 1.0.0
 */

import { useState, useEffect } from 'react';
import type { VoxelField, FieldIcons } from '../../types';

interface SwitcherFieldProps {
	field: VoxelField;
	value: boolean;
	onChange: (value: boolean) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

/**
 * Switcher Field Component
 *
 * Renders a toggle switch with label
 * HTML structure matches Voxel exactly (1:1)
 */
export function SwitcherField({
	field,
	value: initialValue,
	onChange,
	onBlur,
}: SwitcherFieldProps) {
	const [value, setValue] = useState<boolean>(!!initialValue);

	// Generate unique ID for checkbox/label association
	const switcherId = `switcher-${field.key}`;

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Sync with parent value changes
	useEffect(() => {
		setValue(!!initialValue);
	}, [initialValue]);

	const handleChange = (newValue: boolean) => {
		setValue(newValue);
		onChange(newValue);
	};

	return (
		<div className={`ts-form-group switcher-label field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<label onClick={(e) => {
				// Only allow clicks inside switch-slider to toggle the checkbox
				// Prevent clicks on text/blank space from activating the checkbox
				const switchSlider = e.currentTarget.querySelector('.switch-slider');
				if (switchSlider && !switchSlider.contains(e.target as Node)) {
					e.preventDefault();
				}
			}}>
				<div className="switch-slider">
					<div className="onoffswitch">
						<input
							id={switcherId}
							type="checkbox"
							className="onoffswitch-checkbox"
							checked={value}
							onChange={(e) => handleChange(e.target.checked)}
							onBlur={onBlur}
						/>
						<label className="onoffswitch-label" htmlFor={switcherId}></label>
					</div>
				</div>
				{' '}{field.label}{' '}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}
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
		</div>
	);
}
