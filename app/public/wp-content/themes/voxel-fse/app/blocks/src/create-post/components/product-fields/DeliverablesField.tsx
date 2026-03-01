/**
 * Deliverables Field Component
 *
 * EXACT Voxel: themes/voxel/templates/widgets/create-post/product-field/deliverables-field.php
 *
 * File upload field for digital product downloads:
 * - Upload files for customers to download after purchase
 * - Supports multiple file types (PDF, ZIP, etc.)
 * - Has max file count limit
 */
import React from 'react';
import { FileField } from '../fields/FileField';
import type { VoxelField } from '../../types';
import type { FileObject } from '../popup-kit';

interface DeliverablesFieldProps {
	field: VoxelField; // Sub-field configuration from product type
	value: FileObject[]; // Current file upload value
	onChange: (value: FileObject[]) => void;
}

/**
 * Deliverables Field
 *
 * Renders file upload for digital product deliverables.
 * This is essentially a wrapper around FileField with product-specific context.
 *
 * Value structure: Array of file objects or file IDs
 * (Handled by FileField component)
 */
export const DeliverablesField: React.FC<DeliverablesFieldProps> = ({
	field,
	value,
	onChange,
}) => {
	// Use FileField component directly
	// EXACT Voxel: deliverables-field.php line 21-26 uses <file-upload>
	// We use our existing FileField component which provides the same functionality

	// Override label if not provided
	// EXACT Voxel: line 11 default label is "Upload files"
	const fieldWithDefaults = {
		...field,
		label: field.label || 'Upload files',
	};

	return (
		<FileField
			field={fieldWithDefaults}
			value={value as any}
			onChange={onChange as any}
			onBlur={() => {}}
			icons={undefined}
		/>
	);
};
