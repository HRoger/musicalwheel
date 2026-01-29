import React, { useState, useRef, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FormPopup, FormPopupProps } from './FormPopup';

export interface FormGroupProps {
	popupId: string;
	children: ReactNode;
	renderTrigger: () => ReactNode;
	renderPopup: (popupProps: {
		isOpen: boolean;
		popupId: string;
		onClose: () => void;
	}) => ReactNode;
	wrapperClass?: string;
	controllerClass?: string;
	className?: string;
	defaultClass?: boolean;
	onSave?: () => void;
	onClear?: () => void;
	onBlur?: () => void;
}

/**
 * FormGroup Component
 * 
 * Manages popup open/close state and renders popup to document body using React Portal.
 * Matches Voxel's form-group Vue component behavior.
 * 
 * Features:
 * - Opens popup on trigger interaction
 * - Closes on backdrop click, ESC key, blur
 * - Uses React Portal to teleport popup to body
 * - Handles focus management
 * 
 * @param props - FormGroupProps
 * @returns JSX.Element
 */
export const FormGroup: React.FC<FormGroupProps> = ({
	popupId,
	children,
	renderTrigger,
	renderPopup,
	className = '',
	defaultClass = true,
	onBlur,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLElement | null>(null);

	// Open popup
	const openPopup = () => {
		setIsOpen(true);
	};

	// Close popup
	const closePopup = () => {
		setIsOpen(false);

		// Call onBlur when closing
		if (onBlur) {
			onBlur();
		}

		// Restore focus to trigger
		if (triggerRef.current) {
			triggerRef.current.focus();
		}
	};


	// Handle focus/blur events
	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		// Handle focus on wrapper
		const handleFocus = (event: FocusEvent) => {
			// Store trigger element for focus restoration
			if (event.target instanceof HTMLElement) {
				triggerRef.current = event.target;
			}
		};

		// Handle blur on wrapper
		const handleBlur = (event: FocusEvent) => {
			// Check if focus is leaving the wrapper entirely
			const relatedTarget = event.relatedTarget as Node | null;

			if (!relatedTarget || !wrapper.contains(relatedTarget)) {
				// Focus left wrapper - close popup
				if (isOpen) {
					closePopup();
				}
			}
		};

		wrapper.addEventListener('focus', handleFocus, true);
		wrapper.addEventListener('blur', handleBlur, true);

		return () => {
			wrapper.removeEventListener('focus', handleFocus, true);
			wrapper.removeEventListener('blur', handleBlur, true);
		};
	}, [isOpen]);

	// Render popup to body using Portal
	const popupPortal = isOpen
		? createPortal(
			renderPopup({
				isOpen,
				popupId,
				onClose: closePopup,
			}),
			document.body
		)
		: null;

	return (
		<>
			{/* Trigger and content */}
			<div
				ref={wrapperRef}
				className={`${defaultClass ? 'ts-form-group' : ''} ${className}`}
			>
				<div onMouseDown={openPopup} style={{ cursor: 'pointer' }}>
					{renderTrigger()}
				</div>
				{children}
			</div>

			{/* Popup rendered to body */}
			{popupPortal}
		</>
	);
};

/**
 * Hook to create a simple popup with FormGroup and FormPopup
 * 
 * Usage:
 * ```tsx
 * const { openPopup, closePopup, popupElement } = useFormPopup({
 *   popupId: 'my-popup',
 *   title: 'My Popup',
 *   renderContent: () => <div>Popup content</div>,
 *   onSave: () => console.log('Saved'),
 * });
 * 
 * return (
 *   <>
 *     <button onClick={openPopup}>Open Popup</button>
 *     {popupElement}
 *   </>
 * );
 * ```
 */
export interface UseFormPopupOptions extends Omit<FormPopupProps, 'isOpen' | 'children' | 'onClose'> {
	renderContent: () => ReactNode;
}

export function useFormPopup(options: UseFormPopupOptions) {
	const [isOpen, setIsOpen] = useState(false);

	const openPopup = () => setIsOpen(true);
	const closePopup = () => setIsOpen(false);

	const handleSave = () => {
		options.onSave();
		closePopup();
	};

	const handleClear = () => {
		if (options.onClear) {
			options.onClear();
		}
	};

	const popupElement = isOpen
		? createPortal(
			<FormPopup
				{...options}
				isOpen={isOpen}
				onClose={closePopup}
				onSave={handleSave}
				onClear={handleClear}
			>
				{options.renderContent()}
			</FormPopup>,
			document.body
		)
		: null;

	return {
		isOpen,
		openPopup,
		closePopup,
		popupElement,
	};
}
