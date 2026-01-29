/**
 * Barrel Export for Custom Hooks
 * Phase 3: Custom Hooks Architecture
 *
 * This allows clean imports:
 * import { useFieldsConfig, useFormState } from './hooks';
 */

export { useFieldsConfig } from './useFieldsConfig';
export type { UseFieldsConfigReturn } from './useFieldsConfig';

export { useFormState } from './useFormState';
export type { UseFormStateReturn } from './useFormState';

export { useStepNavigation } from './useStepNavigation';
export type { UseStepNavigationReturn } from './useStepNavigation';

export { useFormSubmission } from './useFormSubmission';
export type { UseFormSubmissionReturn, UseFormSubmissionOptions } from './useFormSubmission';

export { useConditions } from './useConditions';
