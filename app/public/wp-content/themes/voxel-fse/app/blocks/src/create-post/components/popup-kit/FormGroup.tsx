/**
 * FormGroup Component
 *
 * EXACT 1:1 match with Voxel's form-group Vue component
 * Evidence: themes/voxel/templates/widgets/create-post/components/form-group.php
 *
 * Simplified for React:
 * - Manages popup open/close state
 * - Opens on focus, closes on blur
 * - Uses React Portal for teleport to body
 * - NO custom positioning (popup-kit.css handles it)
 */
import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface FormGroupProps {
	/** Unique ID for the popup */
	popupId: string;
	/** Child elements (trigger input) */
	children: React.ReactNode;
	/** Render function for popup content */
	renderPopup: (props: {
		isOpen: boolean;
		popupId: string;
		onClose: () => void;
	}) => React.ReactNode;
	/** Additional CSS class */
	className?: string;
}

/**
 * FormGroup Component
 * 
 * Wraps trigger element and manages popup state.
 * Popup is teleported to body using React Portal.
 */
export const FormGroup: React.FC<FormGroupProps> = ({
	popupId,
	children,
	renderPopup,
	className = '',
}) => {
	const [popupActive, setPopupActive] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Open popup
	const open = useCallback(() => {
		setPopupActive(true);
	}, []);

	// Close popup
	const close = useCallback(() => {
		setPopupActive(false);
	}, []);

	// EXACT Voxel: onFocus handler
	const handleFocus = useCallback((_e: React.FocusEvent) => {
		if (!popupActive) {
			open();
		}
	}, [popupActive, open]);

	// EXACT Voxel: onBlur handler
	const handleBlur = useCallback((e: React.FocusEvent) => {
		// Close popup when focus leaves wrapper
		if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
			close();
		}
	}, [close]);

	// EXACT Voxel HTML structure
	return (
		<div
			ref={wrapperRef}
			className={`form-group-wrapper ${className}`.trim()}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			{/* Trigger element */}
			{children}
			
			{/* Teleport popup to body (Vue's <teleport to="body">) */}
			{createPortal(
				renderPopup({
					isOpen: popupActive,
					popupId: `form-popup-${popupId}`,
					onClose: close,
				}),
				document.body
			)}
		</div>
	);
};

export default FormGroup;
