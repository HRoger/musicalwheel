/**
 * FormPopup Component - with Absolute Positioning via React Portal
 *
 * CRITICAL: Uses React Portal to render at document.body level (like FieldPopup.tsx)
 * This ensures proper positioning regardless of parent container CSS.
 *
 * Matches Voxel's positioning algorithm from:
 * - themes/voxel/assets/dist/commons.js (Voxel.mixins.popup)
 * - themes/voxel/templates/components/popup.php
 *
 * Positioning Logic:
 * 1. Get trigger element position (viewport-relative and document-relative)
 * 2. Calculate popup width (max of trigger width and popup min-width)
 * 3. Calculate left: align to left or right edge based on screen position
 * 4. Calculate top: below trigger, or above if not enough space below
 *
 * @package VoxelFSE
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface FormPopupProps {
	/** Whether popup is open */
	isOpen: boolean;
	/** Popup ID (for multiple popups) */
	popupId: string;
	/** Target element (trigger button) */
	target?: HTMLElement | null;
	/** Popup title */
	title?: string;
	/** Icon HTML */
	icon?: string;
	/** Save button label */
	saveLabel?: string;
	/** Clear button label */
	clearLabel?: string;
	/** Show clear button */
	clearButton?: boolean;
	/** Show header (title, icon, close button) */
	showHeader?: boolean;
	/** Show footer (save/clear buttons) - matches Voxel's #controller slot override */
	showFooter?: boolean;
	/** Called when save button clicked */
	onSave?: () => void;
	/** Called when clear button clicked */
	onClear?: () => void;
	/** Called when close button clicked */
	onClose: () => void;
	/** Popup content */
	children: React.ReactNode;
	/** Additional classes for ts-field-popup */
	popupClass?: string;
	/** Minimum width for popup (overrides CSS min-width) */
	minWidth?: number;
}

export const FormPopup: React.FC<FormPopupProps> = ({
	isOpen,
	popupId,
	target,
	title = '',
	icon = '',
	saveLabel = 'Save',
	clearLabel = 'Clear',
	clearButton = true,
	showHeader = true,
	showFooter = true,
	onSave,
	onClear,
	onClose,
	children,
	popupClass = '',
	minWidth: propMinWidth,
}) => {
	const popupRef = useRef<HTMLDivElement>(null); // .ts-form element (receives positioning styles)
	const popupBoxRef = useRef<HTMLDivElement>(null); // .ts-field-popup element
	const [styles, setStyles] = useState<React.CSSProperties>({});
	// Track previous styles to prevent infinite loop from ResizeObserver feedback
	const lastStylesRef = useRef<string>('');

	// =====================================================
	// POSITIONING LOGIC - 1:1 match with Voxel.mixins.popup
	// Evidence: themes/voxel/assets/dist/commons.js
	//
	// Voxel's exact algorithm:
	// var a = jQuery("body").innerWidth(),
	//     l = o.getBoundingClientRect(),
	//     n = jQuery(o).outerWidth(),
	//     s = jQuery(o).offset(),
	//     i = Math.max(l.width, parseFloat(window.getComputedStyle(i).minWidth)),
	//     a = s.left + n/2 > a/2 + 1 ? s.left - i + n : s.left;
	// =====================================================
	const reposition = useCallback(() => {
		if (!popupBoxRef.current || !target || !popupRef.current) {
			return;
		}

		const targetElement = target;
		const popupElement = popupRef.current;
		const popupBox = popupBoxRef.current;

		// a = jQuery("body").innerWidth()
		const bodyWidth = document.body.clientWidth;

		// l = o.getBoundingClientRect() (viewport-relative)
		const triggerRect = targetElement.getBoundingClientRect();

		// n = jQuery(o).outerWidth()
		const triggerOuterWidth = targetElement.offsetWidth;

		// s = jQuery(o).offset() - document-relative position
		// jQuery.offset() = getBoundingClientRect() + scroll position
		const triggerOffset = {
			left: triggerRect.left + window.pageXOffset,
			top: triggerRect.top + window.pageYOffset,
		};

		// d = this.$refs.popup.getBoundingClientRect()
		const popupRect = popupElement.getBoundingClientRect();

		// i = Math.max(l.width, parseFloat(window.getComputedStyle(i).minWidth))
		const computedStyle = window.getComputedStyle(popupBox);
		const cssMinWidth = parseFloat(computedStyle.minWidth) || 0;
		// Use prop minWidth if provided, otherwise fall back to CSS min-width or default
		const minWidth = propMinWidth || cssMinWidth;
		// Fallback to reasonable width if minWidth is 0
		const defaultWidth = Math.min(1140, bodyWidth - 40);
		const popupWidth = Math.max(triggerRect.width, minWidth || defaultWidth);

		// a = s.left + n/2 > a/2 + 1 ? s.left - i + n : s.left
		// If trigger center is RIGHT of body center → align RIGHT edges
		// Otherwise → align LEFT edges
		const isRightSide = triggerOffset.left + triggerOuterWidth / 2 > bodyWidth / 2 + 1;
		let leftPosition: number;

		if (isRightSide) {
			// Right-align: triggerOffset.left - popupWidth + triggerOuterWidth
			leftPosition = triggerOffset.left - popupWidth + triggerOuterWidth;
		} else {
			// Left-align: triggerOffset.left
			leftPosition = triggerOffset.left;
		}

		// Ensure popup doesn't go off-screen
		if (leftPosition < 0) {
			leftPosition = 10;
		}
		if (leftPosition + popupWidth > bodyWidth) {
			leftPosition = bodyWidth - popupWidth - 10;
		}

		// Default top: below trigger
		// let e = `top: ${s.top + l.height}px;`
		let topPosition = triggerOffset.top + triggerRect.height;

		// n = window.innerHeight
		const viewportHeight = window.innerHeight;

		// e = l.bottom + d.height > n && 0 <= l.top - d.height ? `top: ${s.top - d.height}px;` : e
		// If doesn't fit below AND fits above → position above
		if (triggerRect.bottom + popupRect.height > viewportHeight && triggerRect.top - popupRect.height >= 0) {
			topPosition = triggerOffset.top - popupRect.height;
		}

		// Apply styles only if they actually changed
		// FIX: Compare serialized styles to prevent ResizeObserver feedback loop
		const newStyles: React.CSSProperties = {
			top: `${topPosition}px`,
			left: `${leftPosition}px`,
			width: `${popupWidth}px`,
			position: 'absolute',
		};

		const serializedStyles = JSON.stringify(newStyles);
		if (serializedStyles === lastStylesRef.current) {
			return; // Styles unchanged, skip update to prevent infinite loop
		}
		lastStylesRef.current = serializedStyles;

		setStyles(newStyles);
	}, [target, propMinWidth]);

	// Handle ESC key to close
	useEffect(() => {
		if (!isOpen) return;

		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEsc);
		return () => document.removeEventListener('keydown', handleEsc);
	}, [isOpen, onClose]);

	// Handle clicks outside popup to close (blurable mixin)
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;

			// Check if click is inside the popup box (.triggers-blur)
			if (popupBoxRef.current?.contains(clickTarget)) {
				return; // Click inside popup, don't close
			}

			// Click outside popup, close it
			onClose();
		};

		// Use requestAnimationFrame to ensure popup is fully rendered before adding listener
		const rafId = requestAnimationFrame(() => {
			document.addEventListener('mousedown', handleClickOutside);
		});

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Setup positioning and event listeners
	useEffect(() => {
		if (!isOpen) return;

		// Initial repositioning with double RAF to ensure DOM is painted
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				reposition();
			});
		});

		// Listen for scroll events (capture phase)
		const handleScroll = () => reposition();
		window.addEventListener('scroll', handleScroll, true);

		// Listen for window resize
		const handleResize = () => reposition();
		window.addEventListener('resize', handleResize, true);

		// Watch for popup content size changes
		let resizeObserver: ResizeObserver | null = null;
		if (popupBoxRef.current) {
			resizeObserver = new ResizeObserver(() => {
				requestAnimationFrame(() => reposition());
			});
			resizeObserver.observe(popupBoxRef.current);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleResize, true);
			resizeObserver?.disconnect();
		};
	}, [isOpen, reposition]);

	// Don't render if not open
	if (!isOpen) return null;

	// Close icon SVG (from Voxel)
	const CloseIcon = () => (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor" />
		</svg>
	);

	// Render popup via React Portal to document.body
	// CRITICAL: This ensures popup is positioned relative to viewport, not parent container
	// Matches Voxel's Vue component behavior where popup is teleported to body
	return createPortal(
		<div className={`elementor vx-popup ${popupClass}`.trim()}>
			<div className="ts-popup-root elementor-element">
				{/* ts-form receives positioning styles (like Vue's :style="styles") */}
				<div
					ref={popupRef}
					className="ts-form elementor-element"
					style={styles}
				>
					<div className="ts-field-popup-container">
						{/* Actual popup box - backdrop clicks handled by document-level listener */}
						<div
							id={popupId}
							ref={popupBoxRef}
							className="ts-field-popup triggers-blur"
						>
							{/* Header - only shown when showHeader is true */}
							{showHeader && (
								<div className="ts-popup-head flexify ts-sticky-top">
									<div className="ts-popup-name flexify">
										{icon && <span dangerouslySetInnerHTML={{ __html: icon }} />}
										<span>{title}</span>
									</div>
									<ul className="flexify simplify-ul">
										<li className="flexify ts-popup-close">
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													onClose();
												}}
												className="ts-icon-btn"
												aria-label="Close"
											>
												<CloseIcon />
											</a>
										</li>
									</ul>
								</div>
							)}

							{/* Content Area */}
							<div className="ts-popup-content-wrapper min-scroll">
								{children}
							</div>

							{/* Footer with Buttons - conditionally shown (Voxel's #controller slot) */}
							{showFooter && (
								<div className="ts-popup-controller">
									<ul className="flexify simplify-ul">
										{/* Close button (mobile) */}
										<li className="flexify ts-popup-close">
											<a
												href="#"
												onClick={(e) => {
													e.preventDefault();
													onClose();
												}}
												className="ts-icon-btn"
												aria-label="Close"
											>
												<CloseIcon />
											</a>
										</li>

										{clearButton && onClear && (
											<li className="flexify">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														onClear();
													}}
													className="ts-btn ts-btn-1"
												>
													{clearLabel}
												</a>
											</li>
										)}
										{onSave && (
											<li className="flexify">
												<a
													href="#"
													onClick={(e) => {
														e.preventDefault();
														onSave();
													}}
													className="ts-btn ts-btn-2"
												>
													{saveLabel}
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
		</div>,
		document.body
	);
};

export default FormPopup;
