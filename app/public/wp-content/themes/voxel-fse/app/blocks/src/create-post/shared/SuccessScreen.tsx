/**
 * Success Screen Component
 * Displays success message after form submission
 * Extracted from CreatePostForm for reusability
 */
import type { SubmissionState } from '../types';

export interface SuccessScreenProps {
	submission: SubmissionState;
}

/**
 * SuccessScreen Component
 * Shows success message with optional View and Back to Editing buttons
 */
export const SuccessScreen = ({ submission }: SuccessScreenProps) => {
	return (
		<div className="ts-edit-success flexify">
			{/* Success icon - matches Voxel checkmark-circle.svg */}
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
			</svg>
			<h4>{submission.message}</h4>
			<div className="es-buttons flexify">
				{/* View button - only if status is publish */}
				{submission.status === 'publish' && submission.viewLink && (
					<a
						href={submission.viewLink}
						className="ts-btn ts-btn-2 ts-btn-large form-btn"
						target="_blank"
						rel="noopener noreferrer"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
						</svg>
						View
					</a>
				)}
				{/* Back to editing button */}
				{submission.editLink && (
					<a
						href={submission.editLink}
						className="ts-btn ts-btn-1 ts-btn-large form-btn"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
						</svg>
						Back to Editing
					</a>
				)}
			</div>
		</div>
	);
};
