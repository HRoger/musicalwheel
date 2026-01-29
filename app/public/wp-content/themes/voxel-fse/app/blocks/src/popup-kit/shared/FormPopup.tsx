import React, { useRef, useEffect } from 'react';

export interface FormPopupProps {
	isOpen: boolean;
	popupId: string;
	title?: string;
	icon?: string;
	saveLabel?: string;
	clearLabel?: string;
	showSave?: boolean;
	showClear?: boolean;
	showClearMobile?: boolean;
	showClose?: boolean;
	onSave: () => void;
	onClear?: () => void;
	onClose: () => void;
	children: React.ReactNode;
	wrapperClass?: string;
	controllerClass?: string;
}

/**
 * FormPopup Component
 * 
 * Renders the 4-layer popup structure matching Voxel's popup-kit.css:
 * 1. ts-popup-root - Fullscreen overlay (z-index: 500000)
 * 2. div wrapper - Backdrop with :after overlay
 * 3. ts-field-popup-container - Positioning
 * 4. ts-field-popup - Popup box
 * 
 * @param props - FormPopupProps
 * @returns JSX.Element
 */
export const FormPopup: React.FC<FormPopupProps> = ({
	isOpen,
	popupId,
	title,
	icon,
	saveLabel = 'Save',
	clearLabel = 'Clear',
	showSave = true,
	showClear = true,
	showClearMobile = false,
	showClose = true,
	onSave,
	onClear,
	onClose,
	children,
	wrapperClass = '',
	controllerClass = '',
}) => {
	const popupBoxRef = useRef<HTMLDivElement>(null);

	// Handle ESC key
	useEffect(() => {
		if (!isOpen) return;

		const handleEsc = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEsc);

		return () => {
			document.removeEventListener('keydown', handleEsc);
		};
	}, [isOpen, onClose]);

	// Handle backdrop click
	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		// Only close if clicking the backdrop, not the popup itself
		if (event.target === event.currentTarget) {
			onClose();
		}
	};

	// Stop propagation on popup box click
	const handlePopupBoxClick = (event: React.MouseEvent<HTMLDivElement>) => {
		event.stopPropagation();
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="elementor vx-popup">
			<div className="ts-popup-root elementor-element" data-popup-id={popupId}>
				{/* Layer 2: Backdrop wrapper (has :after overlay in CSS) */}
				<div onClick={handleBackdropClick}>
					{/* Layer 3: Popup container */}
					<div className={`ts-field-popup-container ${wrapperClass}`}>
						{/* Layer 4: Popup box */}
						<div
							ref={popupBoxRef}
							className="ts-field-popup triggers-blur"
							onClick={handlePopupBoxClick}
						>
							{/* Popup Head (if title provided) */}
							{title && (
								<div className="ts-popup-head flexify ts-sticky-top">
									<div className="ts-popup-name flexify">
										{icon && (
											<span dangerouslySetInnerHTML={{ __html: icon }} />
										)}
										<span>{title}</span>
									</div>
									<ul className="flexify simplify-ul">
										{showClose && (
											<li className="flexify ts-popup-close">
												<a
													href="#"
													className="ts-icon-btn"
													role="button"
													aria-label="Close popup"
													onClick={(e) => {
														e.preventDefault();
														onClose();
													}}
													onMouseDown={(e) => {
														e.preventDefault();
														onClose();
													}}
												>
													<svg
														fill="currentColor"
														width="52"
														height="52"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path d="M1.46967 1.46967C1.76256 1.17678 2.23744 1.17678 2.53033 1.46967L12 10.9393L21.4697 1.46967C21.7626 1.17678 22.2374 1.17678 22.5303 1.46967C22.8232 1.76256 22.8232 2.23744 22.5303 2.53033L13.0607 12L22.5303 21.4697C22.8232 21.7626 22.8232 22.2374 22.5303 22.5303C22.2374 22.8232 21.7626 22.8232 21.4697 22.5303L12 13.0607L2.53033 22.5303C2.23744 22.8232 1.76256 22.8232 1.46967 22.5303C1.17678 22.2374 1.17678 21.7626 1.46967 21.4697L10.9393 12L1.46967 2.53033C1.17678 2.23744 1.17678 1.76256 1.46967 1.46967Z" />
													</svg>
												</a>
											</li>
										)}
									</ul>
								</div>
							)}

							{/* Content Wrapper */}
							<div className="ts-popup-content-wrapper min-scroll">{children}</div>

							{/* Controller Buttons */}
							{(showSave || showClear) && (
								<div className={`ts-popup-controller ${controllerClass}`}>
									<ul className="flexify simplify-ul">
										{/* Close button (mobile only) */}
										<li className="flexify ts-popup-close">
											<a
												href="#"
												className="ts-icon-btn"
												role="button"
												onClick={(e) => {
													e.preventDefault();
													onClose();
												}}
												onMouseDown={(e) => {
													e.preventDefault();
													onClose();
												}}
											>
												<svg
													fill="currentColor"
													width="52"
													height="52"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path d="M1.46967 1.46967C1.76256 1.17678 2.23744 1.17678 2.53033 1.46967L12 10.9393L21.4697 1.46967C21.7626 1.17678 22.2374 1.17678 22.5303 1.46967C22.8232 1.76256 22.8232 2.23744 22.5303 2.53033L13.0607 12L22.5303 21.4697C22.8232 21.7626 22.8232 22.2374 22.5303 22.5303C22.2374 22.8232 21.7626 22.8232 21.4697 22.5303L12 13.0607L2.53033 22.5303C2.23744 22.8232 1.76256 22.8232 1.46967 22.5303C1.17678 22.2374 1.17678 21.7626 1.46967 21.4697L10.9393 12L1.46967 2.53033C1.17678 2.23744 1.17678 1.76256 1.46967 1.46967Z" />
												</svg>
											</a>
										</li>

										{/* Clear button (icon for mobile) */}
										{showClear && onClear && (
											<li className="flexify hide-d" onClick={onClear}>
												{showClearMobile && (
													<a href="#" className="ts-icon-btn" aria-label="Clear">
														<svg
															fill="currentColor"
															width="52"
															height="52"
															viewBox="0 0 24 24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM8.25 10.5C7.83579 10.5 7.5 10.8358 7.5 11.25C7.5 11.6642 7.83579 12 8.25 12H15.75C16.1642 12 16.5 11.6642 16.5 11.25C16.5 10.8358 16.1642 10.5 15.75 10.5H8.25Z" />
														</svg>
													</a>
												)}
											</li>
										)}

										{/* Clear button (desktop) */}
										{showClear && onClear && (
											<li className="flexify hide-m" onClick={onClear}>
												<a href="#" className="ts-btn ts-btn-1">
													{clearLabel}
												</a>
											</li>
										)}

										{/* Save button */}
										{showSave && (
											<li className="flexify">
												<a
													href="#"
													className="ts-btn ts-btn-2"
													onClick={(e) => {
														e.preventDefault();
														onSave();
													}}
												>
													{saveLabel}
													<div className="ts-loader-wrapper">
														<span className="ts-loader"></span>
													</div>
												</a>
											</li>
										)}
									</ul>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
