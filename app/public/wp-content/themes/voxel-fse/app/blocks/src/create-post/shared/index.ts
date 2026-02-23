/**
 * Barrel Export for Shared Components
 * Phase 2: Shared Component Architecture
 *
 * This allows clean imports:
 * import { CreatePostForm, FormHeader } from './shared';
 */

export { CreatePostForm } from './CreatePostForm';
export type { CreatePostFormProps } from './CreatePostForm';
export type { SubmissionResult } from '../types';

export { FormHeader } from './FormHeader';
export type { FormHeaderProps } from './FormHeader';

export { FormFooter } from './FormFooter';
export type { FormFooterProps } from './FormFooter';

export { SuccessScreen } from './SuccessScreen';
export type { SuccessScreenProps } from './SuccessScreen';
