/**
 * useFormState Hook
 * Manages form data state and field change handling
 *
 * Phase 3: Custom hook for form state management
 *
 * Handles:
 * - Form data state (field values)
 * - Field change events
 * - Initial data from field configuration
 */
import { useState, useEffect } from 'react';
import type { FormData, VoxelField, FieldValue } from '../types';

/**
 * Hook return type
 */
export interface UseFormStateReturn {
	formData: FormData;
	handleFieldChange: (fieldKey: string, value: FieldValue) => void;
	setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

/**
 * useFormState Hook
 *
 * @param fields - Array of VoxelField configurations
 * @returns Form data state and change handler
 */
export function useFormState(fields: VoxelField[]): UseFormStateReturn {
	const [formData, setFormData] = useState<FormData>({});

	// Initialize form data from field values when fields change
	useEffect(() => {
		if (fields && fields.length > 0) {
			const initialData: FormData = {};
			fields.forEach((field: VoxelField) => {
				initialData[field.key] = field.value || '';
			});
			setFormData(initialData);
			console.log(`useFormState: Initialized with ${fields.length} fields`);
		}
	}, [fields]);

	/**
	 * Handle field value change
	 */
	const handleFieldChange = (fieldKey: string, value: FieldValue) => {
		setFormData((prev) => ({
			...prev,
			[fieldKey]: value,
		}));
	};

	return {
		formData,
		handleFieldChange,
		setFormData,
	};
}
