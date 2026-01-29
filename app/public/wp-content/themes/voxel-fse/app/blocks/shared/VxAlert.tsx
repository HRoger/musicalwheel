/**
 * VxAlert Component
 *
 * Reusable alert component matching Voxel's #vx-alert system exactly.
 * Used for confirmations, success messages, errors, warnings, and info.
 *
 * NOTE: Voxel has an existing #vx-alert container and CSS styles.
 * This component renders into that container and uses Voxel's styles.
 *
 * @package VoxelFSE
 */

import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface VxAlertAction {
	label: string;
	onClick: () => void;
	primary?: boolean;
	className?: string;
}

export interface VxAlertProps {
	message: string;
	type: AlertType;
	actions?: VxAlertAction[];
	onClose: () => void;
	hideClose?: boolean;
	closeLabel?: string;
	/** Auto-dismiss after this many milliseconds. Set to 0 to disable. Default: 0 (no auto-dismiss for confirmations) */
	autoDismiss?: number;
}

/**
 * SVG Icons matching Voxel's alert-ic structure EXACTLY
 * Source: themes/voxel/assets/images/svgs/
 * - checkmark-circle.svg (success)
 * - cross-circle.svg (error)
 * - notification.svg (warning)
 * - info.svg (info)
 */
const AlertIcons = () => (
	<div className="alert-ic">
		{/* checkmark-circle.svg - for success */}
		<svg
			width="80"
			height="80"
			viewBox="0 0 24 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			transform="rotate(0 0 0)"
		>
			<path
				d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM15.5071 9.85447C15.2142 9.56158 14.7393 9.56158 14.4464 9.85447L10.9649 13.336L9.55359 11.9247C9.2607 11.6318 8.78582 11.6318 8.49293 11.9247C8.20004 12.2176 8.20004 12.6925 8.49294 12.9854L10.4346 14.927C10.7275 15.2199 11.2023 15.2199 11.4952 14.927L15.5071 10.9151C15.8 10.6222 15.8 10.1474 15.5071 9.85447Z"
				fill="#343C54"
			/>
		</svg>

		{/* cross-circle.svg - for error */}
		<svg
			width="80"
			height="80"
			viewBox="0 0 24 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			transform="rotate(0 0 0)"
		>
			<path
				d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM8.78362 10.2354L10.9388 12.3906L8.78362 14.5458C8.49073 14.8387 8.49073 15.3136 8.78362 15.6065C9.07652 15.8994 9.55139 15.8994 9.84428 15.6065L11.9995 13.4513L14.1546 15.6064C14.4475 15.8993 14.9224 15.8993 15.2153 15.6064C15.5082 15.3135 15.5082 14.8387 15.2153 14.5458L13.0602 12.3906L15.2153 10.2355C15.5082 9.94258 15.5082 9.46771 15.2153 9.17482C14.9224 8.88192 14.4475 8.88192 14.1546 9.17482L11.9995 11.33L9.84428 9.17475C9.55139 8.88186 9.07652 8.88186 8.78362 9.17475C8.49073 9.46764 8.49073 9.94251 8.78362 10.2354Z"
				fill="#343C54"
			/>
		</svg>

		{/* notification.svg - for warning */}
		<svg
			width="80"
			height="80"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			transform="rotate(0 0 0)"
		>
			<path
				d="M14.6191 6.31451C14.6191 4.62179 15.9914 3.24951 17.6841 3.24951C19.3769 3.24951 20.7491 4.62179 20.7491 6.31451C20.7491 8.00724 19.3769 9.37951 17.6841 9.37951C15.9914 9.37951 14.6191 8.00724 14.6191 6.31451Z"
				fill="#343C54"
			/>
			<path
				d="M13.1191 6.31451C13.1191 5.53442 13.3148 4.80001 13.6598 4.15771H5.5918C4.34916 4.15771 3.3418 5.16507 3.3418 6.40772V18.4077C3.3418 19.6504 4.34916 20.6577 5.5918 20.6577H17.5916C18.8342 20.6577 19.8416 19.6504 19.8416 18.4077V10.3385C19.1992 10.6837 18.4645 10.8795 17.6841 10.8795C15.1629 10.8795 13.1191 8.83564 13.1191 6.31451ZM7.09375 13.1582C7.09375 12.744 7.42954 12.4082 7.84375 12.4082H11.5938C12.008 12.4082 12.3438 12.744 12.3438 13.1582C12.3438 13.5724 12.008 13.9082 11.5938 13.9082H7.84375C7.42954 13.9082 7.09375 13.5724 7.09375 13.1582ZM7.84375 15.4082H15.3438C15.758 15.4082 16.0938 15.744 16.0938 16.1582C16.0938 16.5724 15.758 16.9082 15.3438 16.9082H7.84375C7.42954 16.9082 7.09375 16.5724 7.09375 16.1582C7.09375 15.744 7.42954 15.4082 7.84375 15.4082Z"
				fill="#343C54"
			/>
		</svg>

		{/* info.svg - for info */}
		<svg
			width="80"
			height="80"
			viewBox="0 0 24 25"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			transform="rotate(0 0 0)"
		>
			<path
				d="M2 12.3906C2 6.86778 6.47715 2.39062 12 2.39062C17.5228 2.39062 22 6.86778 22 12.3906C22 17.9135 17.5228 22.3906 12 22.3906C6.47715 22.3906 2 17.9135 2 12.3906ZM11.9993 9.96045C12.4964 9.96045 12.9001 9.5575 12.9001 9.06045C12.9001 8.56339 12.4971 8.16045 12.0001 8.16045C11.503 8.16045 11.0993 8.56339 11.0993 9.06045C11.0993 9.5575 11.5023 9.96045 11.9993 9.96045ZM11.2501 15.8298C11.2501 16.244 11.5859 16.5798 12.0001 16.5798C12.4143 16.5798 12.7501 16.244 12.7501 15.8298V11.6054C12.7501 11.1912 12.4143 10.8554 12.0001 10.8554C11.5858 10.8554 11.2501 11.1912 11.2501 11.6054V15.8298Z"
				fill="#343C54"
			/>
		</svg>
	</div>
);

/**
 * VxAlert Component
 *
 * Renders into the existing #vx-alert container (created by Voxel).
 * Uses Voxel's existing CSS styles - no inline styles needed.
 */
export const VxAlert: React.FC<VxAlertProps> = ({
	message,
	type,
	actions = [],
	onClose,
	hideClose = false,
	closeLabel = 'Close',
	autoDismiss = 0,
}) => {
	const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Auto-dismiss timer
	useEffect(() => {
		if (autoDismiss > 0) {
			dismissTimerRef.current = setTimeout(() => {
				onClose();
			}, autoDismiss);
		}

		return () => {
			if (dismissTimerRef.current) {
				clearTimeout(dismissTimerRef.current);
			}
		};
	}, [autoDismiss, onClose]);

	// Find the existing #vx-alert container (created by Voxel)
	const container = document.getElementById('vx-alert');
	if (!container) {
		console.warn('[VxAlert] No #vx-alert container found. Alert will not render.');
		return null;
	}

	// Build the alert content matching Voxel's exact structure
	const alertContent = (
		<div className={`ts-notice ts-notice-${type}`}>
			<div className="alert-msg">
				<AlertIcons />
				{message}
			</div>

			<div className="a-btn alert-actions">
				{actions.map((action, index) => (
					<a
						key={index}
						href="javascript:void(0);"
						className={`ts-btn ${action.primary ? 'ts-btn-1' : 'ts-btn-4'} ${action.className || ''}`}
						onClick={(e) => {
							e.preventDefault();
							action.onClick();
						}}
					>
						{action.label}
					</a>
				))}
				{!hideClose && (
					<a
						href="javascript:void(0);"
						className="ts-btn ts-btn-4 close-alert"
						onClick={(e) => {
							e.preventDefault();
							onClose();
						}}
					>
						{closeLabel}
					</a>
				)}
			</div>
		</div>
	);

	return createPortal(alertContent, container);
};

export default VxAlert;
