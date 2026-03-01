/**
 * Description Field Component - ENHANCED to Level 2
 * Handles: description field type (textarea with character counter)
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/texteditor-field.php (plain-text mode)
 *
 * Enhancement Level: Level 2 (Full Parity)
 * Enhancement Date: 2025-11-27
 *
 * Features Added:
 * - Character counter (current/max) - Voxel texteditor-field.php line 10
 * - Description tooltip (vx-dialog) - Voxel texteditor-field.php lines 12-17
 * - Auto-resizing textarea
 * - Shows "Optional" when not required and empty
 */
import React, { useRef, useEffect } from 'react';
import type { VoxelField, FieldIcons } from '../../types';

interface DescriptionFieldProps {
	field: VoxelField;
	value: string;
	onChange: (value: string) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({ field, value, onChange, onBlur }) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const hiddenTextareaRef = useRef<HTMLTextAreaElement>(null);

	// Character count
	const contentLength = value ? value.length : 0;
	const maxLength = field.props?.['maxlength'] !== undefined ? Number(field.props['maxlength']) : undefined;

	// Auto-resize textarea to fit content
	const resizeTextarea = () => {
		if (!textareaRef.current || !hiddenTextareaRef.current) return;

		const textarea = textareaRef.current;
		const hiddenTextarea = hiddenTextareaRef.current;

		// Copy value to hidden textarea
		hiddenTextarea.value = textarea.value;

		// Get computed height
		const newHeight = hiddenTextarea.scrollHeight;

		// Apply height to visible textarea
		textarea.style.height = `${newHeight}px`;
	};

	// Resize on mount and when value changes
	useEffect(() => {
		resizeTextarea();
	}, [value]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange(e.target.value);
		resizeTextarea();
	};

	// Determine if there are errors
	const hasError = field.validation?.errors?.length > 0;
	const displayError = hasError ? field.validation.errors[0] : '';

	return (
		<div className={`ts-form-group field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Label with character counter - matches Voxel lines 3-18 */}
			<label>
				{field.label}

				{/* Error message, Optional label, or Character counter - matches Voxel logic */}
				{hasError ? (
					<span className="is-required">{displayError}</span>
				) : (
					<>
						{!field.required && contentLength === 0 && (
							<span className="is-required">Optional</span>
						)}
						{/* Character counter - only show if maxlength is set AND content exists */}
						{maxLength && contentLength > 0 && (
							<span className={`is-required ts-char-counter ${contentLength > maxLength ? 'ts-exceeds-max' : ''}`}>
								{contentLength}/{maxLength}
							</span>
						)}
					</>
				)}

				{/* ENHANCEMENT: Description tooltip (vx-dialog) - Voxel texteditor-field.php lines 12-17 */}
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

			{/* Textarea - matches Voxel lines 19-25 - NO maxLength attribute to allow exceeding */}
			<textarea
				ref={textareaRef}
				value={value || ''}
				onChange={handleChange}
				onBlur={onBlur}
				placeholder={String(field.props?.['placeholder'] ?? field.placeholder ?? '')}
				className="ts-filter"
				required={field.required}
			/>

			{/* Hidden textarea for height calculation - matches Voxel line 26 */}
			<textarea
				ref={hiddenTextareaRef}
				className="ts-filter"
				disabled
				style={{
					height: '5px',
					position: 'fixed',
					top: '-9999px',
					left: '-9999px',
					visibility: 'hidden'
				}}
				aria-hidden="true"
				tabIndex={-1}
			/>
		</div>
	);
};
