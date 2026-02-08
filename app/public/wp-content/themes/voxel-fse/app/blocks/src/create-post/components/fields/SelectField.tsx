/**
 * Select Field Component - ENHANCED to Level 2
 * Handles: select field type
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/select-field.php
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-27
 *
 * Features Added:
 * - Description tooltip (vx-dialog) - Voxel select-field.php lines 7-12 (inline), 45-50 (default)
 *
 * Supports two display modes:
 * - 'inline': Radio-style selection with icons
 * - 'default': Standard dropdown select
 *
 * ⚠️ NOTE: Advanced select features require popup-kit integration (Phase D)
 * - Large choice lists with search/filter functionality
 * - Dynamic option loading from taxonomies or post types
 * - Custom popup selector UI (like Voxel's native implementation)
 * Current implementation uses basic HTML select for 'default' mode
 */
import React from 'react';
import type { VoxelField, FieldIcons, FieldValue } from '../../types';

/**
 * Choice option structure for select fields
 */
interface SelectChoice {
	value: string;
	label: string;
}

interface SelectFieldProps {
	field: VoxelField;
	value: FieldValue;
	onChange: (value: FieldValue) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const SelectField: React.FC<SelectFieldProps> = ({ field, value, onChange, onBlur }) => {
	// Evidence: select-field.php:21 — Voxel defaults display_as to 'popup'
	const displayAs = field.props?.['display_as'] || 'popup';
	const choices = (field.props?.['choices'] || []) as SelectChoice[];

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// Inline display (radio-style with icons) - matches Voxel lines 2-38
	if (displayAs === 'inline') {
		// DEBUG: Log data structure for inline mode
		console.group('SelectField - Data Structure Debug (inline mode)');
		console.log('Field label:', field.label);
		console.log('Field props:', field.props);
		console.log('Choices array length:', choices.length);
		console.log('All choices:', choices);
		if (choices.length > 0) {
			console.log('First choice:', choices[0]);
			console.log('First choice.value:', choices[0].value);
			console.log('First choice.label:', choices[0].label);
			console.log('First choice.icon:', choices[0].icon);
			console.log('First choice.icon type:', typeof choices[0].icon);
			console.log('First choice keys:', Object.keys(choices[0]));
		}
		console.groupEnd();
		// DEBUG END

		return (
			<div className={`ts-form-group inline-terms-wrapper ts-inline-filter field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
				<label>
					{field.label}

					{/* Errors or Optional label - 1:1 match with Voxel template slot */}
					{hasError ? (
						<span className="is-required">{displayError}</span>
					) : (
						!field.required && <span className="is-required">Optional</span>
					)}

					{/* Description tooltip - 1:1 match with Voxel select-field.php lines 7-12 */}
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

				{/* Inline term list - matches Voxel CSS exactly */}
				<div className="ts-term-dropdown ts-md-group ts-multilevel-dropdown inline-multilevel min-scroll">
					<ul className="simplify-ul ts-term-dropdown-list">
						{choices.map((choice) => (
							<li
								key={choice.value}
								className={choice.value === value ? 'ts-selected' : ''}
							>
								<a
									href="#"
									className="flexify"
									onClick={(e) => {
										e.preventDefault();
										// Toggle behavior: click selected = deselect (set to null)
										onChange(choice.value === value ? null : choice.value);
									}}
								>
									<div className="ts-radio-container">
										<label className="container-radio">
											<input
												type="radio"
												value={choice.value}
												checked={value === choice.value}
												disabled
												hidden
											/>
											<span className="checkmark"></span>
										</label>
									</div>
									<span>{choice.label}</span>
									<div className="ts-term-icon">
										<span dangerouslySetInnerHTML={{ __html: choice.icon || '' }} />
									</div>
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		);
	}

	// Default display (standard dropdown) - matches Voxel lines 40-60
	return (
		<div className={`ts-form-group inline-terms-wrapper ts-inline-filter field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			<label>
				{field.label}

				{/* Errors or Optional label - 1:1 match with Voxel template slot */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					!field.required && <span className="is-required">Optional</span>
				)}

				{/* Description tooltip - 1:1 match with Voxel select-field.php lines 45-50 */}
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

			{/* Dropdown select - matches Voxel CSS */}
			<div className="ts-filter">
				<select
					value={value || ''}
					onChange={(e) => onChange(e.target.value || null)}
					onBlur={onBlur}
					required={field.required}
					title={field.label}
					aria-label={field.label}
				>
					{/* Empty option if not required */}
					{!field.required && (
						<option value="">
							{field.props?.['placeholder'] || field.label}
						</option>
					)}
					{/* Choices */}
					{choices.map((choice) => (
						<option key={choice.value} value={choice.value}>
							{choice.label}
						</option>
					))}
				</select>
				<div className="ts-down-icon"></div>
			</div>
		</div>
	);
};

