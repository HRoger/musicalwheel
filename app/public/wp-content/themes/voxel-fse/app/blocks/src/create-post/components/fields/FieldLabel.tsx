/**
 * FieldLabel Component
 * 
 * EXACT 1:1 match with Voxel's label structure
 * Evidence: themes/voxel/templates/widgets/create-post/texteditor-field.php:3-13
 * 
 * Shows:
 * - Field label
 * - Validation errors (if any)
 * - "Optional" text (if not required AND empty)
 * - Character counter (if maxlength AND has content)
 * - Description tooltip
 */
import React from 'react';
import type { VoxelField, FieldValue } from '../../types';
import { InfoIcon } from '../icons/InfoIcon';

interface FieldLabelProps {
	/** Field configuration */
	field: VoxelField;
	/** Current field value (to check if empty) */
	value?: FieldValue;
	/** Validation errors */
	errors?: string[];
	/** Content length (for character counter) */
	contentLength?: number;
	/** Custom class name */
	className?: string;
}

/**
 * Check if value is empty
 */
function isEmpty(value: FieldValue): boolean {
	if (value === null || value === undefined) return true;
	if (typeof value === 'string') return value.trim() === '';
	if (Array.isArray(value)) return value.length === 0;
	if (typeof value === 'object') return Object.keys(value).length === 0;
	return false;
}

/**
 * FieldLabel Component
 * 
 * Renders field label with optional/error indicators
 * EXACT match with Voxel's label structure
 */
export const FieldLabel: React.FC<FieldLabelProps> = ({
	field,
	value,
	errors = [],
	contentLength,
	className = '',
}) => {
	const valueIsEmpty = isEmpty(value);
	const hasMaxLength = field.props?.maxlength;

	return (
		<label className={className}>
			{field.label}

			{/* Validation Errors */}
			{errors.length > 0 ? (
				<span className="is-required">{errors[0]}</span>
			) : (
				<>
					{/* Optional Label (only when not required AND empty) */}
					{!field.required && valueIsEmpty && (
						<span className="is-required">Optional</span>
					)}

					{/* Character Counter (only when has maxlength AND has content) */}
					{hasMaxLength && !valueIsEmpty && contentLength !== undefined && (
						<span className="is-required ts-char-counter">
							{contentLength}/{field.props.maxlength}
						</span>
					)}
				</>
			)}

			{/* Description Tooltip */}
			{field.description && (
				<div className="vx-dialog">
					<InfoIcon />
					<div className="vx-dialog-content min-scroll">
						<p>{field.description}</p>
					</div>
				</div>
			)}
		</label>
	);
};

export default FieldLabel;

