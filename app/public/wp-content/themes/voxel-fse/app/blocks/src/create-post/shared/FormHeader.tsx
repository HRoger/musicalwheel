/**
 * Form Header Component
 * Multi-step progress indicator with step navigation
 * Extracted from CreatePostForm for reusability
 */
import type { VoxelField, SubmissionState, IconValue } from '../types';
import { renderIcon, defaultIcons } from '../utils/iconRenderer';

export interface FormHeaderProps {
	steps: VoxelField[];
	currentStepIndex: number;
	currentStep: VoxelField | { label: string; key: string };
	showFormHead: boolean;
	enableDraftSaving: boolean;
	isAdminMode?: boolean;
	submission: SubmissionState;
	onSaveDraft: () => void;
	onPrevStep: () => void;
	onNextStep: () => void;
	// Icon attributes
	draftIcon?: IconValue;
	prevIcon?: IconValue;
	nextIcon?: IconValue;
}

/**
 * FormHeader Component
 * Displays multi-step progress bar and navigation controls
 */
export const FormHeader = ({
	steps,
	currentStepIndex,
	currentStep,
	showFormHead,
	enableDraftSaving,
	isAdminMode,
	submission,
	onSaveDraft,
	onPrevStep,
	onNextStep,
	draftIcon,
	prevIcon,
	nextIcon,
}: FormHeaderProps) => {
	// Default to true if not specified
	const shouldShowFormHead = showFormHead ?? true;
	const shouldEnableDraftSaving = enableDraftSaving ?? true;

	if (!shouldShowFormHead) {
		return null;
	}

	return (
		<div className="ts-form-progres">
			{/* Step progress bar - only show if multiple steps */}
			{steps.length > 1 && (
				<ul className="step-percentage simplify-ul flexify">
					{steps.map((_, index) => (
						<li key={index} className={currentStepIndex >= index ? 'step-done' : ''}></li>
					))}
				</ul>
			)}
			<div className="ts-active-step flexify">
				<div className="active-step-details">
					<p>{currentStep.label || 'Form'}</p>
				</div>
				<div className="step-nav flexify">
			{shouldEnableDraftSaving && !isAdminMode && (
			<a
						href="#"
						onClick={(e) => {
							e.preventDefault();
							onSaveDraft();
						}}
						className={`ts-icon-btn has-tooltip ts-save-draft ${submission.processing ? 'vx-pending' : ''}`}
						data-tooltip="Save as draft"
						aria-label="Save as draft"
					>
						{renderIcon(draftIcon, defaultIcons.draft)}
					</a>
				)}
					{/* Step navigation - only show if multiple steps */}
					{steps.length > 1 && (
						<>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								onPrevStep();
							}}
							className={`ts-icon-btn has-tooltip ${currentStepIndex === 0 ? 'disabled' : ''}`}
							data-tooltip="Previous step"
						>
							{renderIcon(prevIcon, defaultIcons.prev)}
						</a>
						<a
							href="#"
							onClick={(e) => {
								e.preventDefault();
								onNextStep();
							}}
							className={`ts-icon-btn has-tooltip ${currentStepIndex === steps.length - 1 ? 'disabled' : ''}`}
							data-tooltip="Next step"
						>
							{renderIcon(nextIcon, defaultIcons.next)}
						</a>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
