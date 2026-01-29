/**
 * useStepNavigation Hook
 * Manages multi-step form navigation
 *
 * Phase 3: Custom hook for step navigation
 *
 * Handles:
 * - Current step tracking
 * - Next/Previous step navigation
 * - Step field grouping
 * - Smooth scroll on step change
 */
import { useState, useMemo } from 'react';
import type { VoxelField } from '../types';

/**
 * Hook return type
 */
export interface UseStepNavigationReturn {
	currentStepIndex: number;
	currentStep: VoxelField | { label: string; key: string };
	steps: VoxelField[];
	currentStepFields: VoxelField[];
	nextStep: () => void;
	prevStep: () => void;
	setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * useStepNavigation Hook
 *
 * @param fieldsConfig - All field configurations (including ui-step fields)
 * @param regularFields - Non-step fields
 * @returns Step navigation state and functions
 */
export function useStepNavigation(
	fieldsConfig: VoxelField[],
	regularFields: VoxelField[]
): UseStepNavigationReturn {
	const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

	// Extract UI Step fields
	const steps = useMemo(() => {
		return fieldsConfig.filter((f: VoxelField) => f.type === 'ui-step');
	}, [fieldsConfig]);

	// Get current step
	const currentStep = steps[currentStepIndex] || { label: 'Form', key: 'default' };

	/**
	 * Get fields for current step
	 * Fields belong to a step based on their position in the fieldsConfig array
	 */
	const currentStepFields = useMemo(() => {
		if (steps.length === 0) {
			// No steps defined - show all fields
			return regularFields;
		}

		// Find indices of step fields
		const stepIndices = steps.map(step =>
			fieldsConfig.findIndex((f: VoxelField) => f.key === step.key)
		);

		// Add end index (total length)
		stepIndices.push(fieldsConfig.length);

		// Get start and end indices for current step
		const startIdx = stepIndices[currentStepIndex];
		const endIdx = stepIndices[currentStepIndex + 1];

		// Get fields between current step and next step (excluding the step fields themselves)
		const stepFields = fieldsConfig
			.slice(startIdx + 1, endIdx)
			.filter((f: VoxelField) => f.type !== 'ui-step');

		console.log(`useStepNavigation: Step ${currentStepIndex + 1}/${steps.length} - Fields: ${stepFields.length}`);

		return stepFields;
	}, [fieldsConfig, steps, regularFields, currentStepIndex]);

	/**
	 * Navigate to next step
	 */
	const nextStep = () => {
		if (currentStepIndex < steps.length - 1) {
			setCurrentStepIndex(currentStepIndex + 1);
			// Scroll to top of form
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	/**
	 * Navigate to previous step
	 */
	const prevStep = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1);
			// Scroll to top of form
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	return {
		currentStepIndex,
		currentStep,
		steps,
		currentStepFields,
		nextStep,
		prevStep,
		setCurrentStepIndex,
	};
}
