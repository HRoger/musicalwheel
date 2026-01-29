/**
 * Form Footer Component
 * Submit button with loading state and conditional icon
 * Extracted from CreatePostForm for reusability
 */
import type { SubmissionState } from '../types';

export interface FormFooterProps {
	submission: SubmissionState;
	isEditMode: boolean;
	submitButtonText: string;
	onSubmit: (e: React.MouseEvent) => void;
}

/**
 * FormFooter Component
 * Displays submit button with appropriate text and icon
 */
export const FormFooter = ({
	submission,
	isEditMode,
	submitButtonText,
	onSubmit,
}: FormFooterProps) => {
	return (
		<div className="ts-form-footer flexify">
			<a
				href="#"
				className={`ts-btn ts-btn-2 form-btn ts-btn-large ts-save-changes ${submission.processing ? 'vx-pending' : ''}`}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					if (!submission.processing) {
						onSubmit(e);
					}
					return false;
				}}
				onMouseDown={(e) => {
					if (submission.processing) {
						e.preventDefault();
					}
				}}
			>
				{submission.processing ? (
					<div className="ts-loader-wrapper">
						<span className="ts-loader"></span>
						Please wait...
					</div>
				) : isEditMode ? (
					/* Save Changes State (Editing): Icon FIRST, then Text */
					<>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H15.3809C15.977 3.25 16.5488 3.48658 16.9707 3.90779L20.0897 7.02197C20.5124 7.44403 20.7499 8.01685 20.7499 8.61418L20.7499 18.5C20.7499 19.7426 19.7425 20.75 18.4999 20.75H16.75V16.25C16.75 15.0074 15.7426 14 14.5 14L9.5 14C8.25736 14 7.25 15.0074 7.25 16.25L7.25001 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM8 6.25C7.58579 6.25 7.25 6.58579 7.25 7C7.25 7.41421 7.58579 7.75 8 7.75H12C12.4142 7.75 12.75 7.41421 12.75 7C12.75 6.58579 12.4142 6.25 12 6.25H8Z" fill="currentColor"/>
							<path d="M8.75001 20.75L15.25 20.75V16.25C15.25 15.8358 14.9142 15.5 14.5 15.5L9.5 15.5C9.08579 15.5 8.75 15.8358 8.75 16.25L8.75001 20.75Z" fill="currentColor"/>
						</svg>
						Save changes
					</>
				) : (
					/* Publish State (New Post): Text FIRST, then Icon */
					<>
						{submitButtonText || 'Publish'}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M14.5359 5.46986C14.3214 5.25526 13.9988 5.19101 13.7185 5.30707C13.4382 5.42312 13.2554 5.69663 13.2554 6.00002V11.2466L4 11.2466C3.58579 11.2466 3.25 11.5824 3.25 11.9966C3.25 12.4108 3.58579 12.7466 4 12.7466L13.2554 12.7466V18C13.2554 18.3034 13.4382 18.5769 13.7185 18.693C13.9988 18.809 14.3214 18.7448 14.5359 18.5302L20.5319 12.53C20.6786 12.3831 20.7518 12.1905 20.7514 11.9981L20.7514 11.9966C20.7514 11.7685 20.6495 11.5642 20.4888 11.4266L14.5359 5.46986Z" fill="currentColor"/>
						</svg>
					</>
				)}
			</a>
		</div>
	);
};
