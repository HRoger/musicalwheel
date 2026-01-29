/**
 * FieldPopup Component - Shared Popup Infrastructure
 *
 * CRITICAL: This component uses React Portal to render field popups
 * at document.body level with Voxel's exact HTML structure AND positioning logic.
 *
 * Evidence:
 * - HTML: themes/voxel/templates/components/popup.php:2-56
 * - Positioning: themes/voxel/assets/dist/commons.js (Voxel.mixins.popup)
 *
 * HTML Structure (1:1 Match Required):
 * <div class="elementor vx-popup">              ← Outer wrapper (Elementor scope)
 *   <div class="ts-popup-root">                 ← Root element
 *     <div class="ts-form" :style="styles">     ← Form wrapper with dynamic positioning
 *       <div class="ts-field-popup-container">  ← Container
 *         <div class="ts-field-popup triggers-blur"> ← Actual popup box with blur
 *           <div class="ts-popup-content-wrapper min-scroll"> ← Scrollable content
 *             {children}
 *           </div>
 *           <div class="ts-popup-controller">   ← Footer with buttons
 *             ...
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </div>
 *
 * Positioning Logic (from Voxel.mixins.popup):
 * - Uses getBoundingClientRect() for viewport-relative measurements
 * - Uses jQuery.offset() for document-relative positioning
 * - Calculates top/left/width dynamically based on trigger element
 * - Intelligently positions above or below trigger based on viewport space
 * - Listens to scroll, resize, and content changes for repositioning
 *
 * @package VoxelFSE
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface FieldPopupProps {
	/** Whether popup is open */
	isOpen: boolean;
	/** Trigger element ref (for positioning) */
	target: React.RefObject<HTMLElement>;
	/** Popup title */
	title?: string;
	/** Icon HTML (optional) */
	icon?: string;
	/** Save button label */
	saveLabel?: string;
	/** Clear button label */
	clearLabel?: string;
	/** Show clear button */
	showClear?: boolean;
	/** Show save button */
	showSave?: boolean;
	/** Called when save button clicked */
	onSave: () => void;
	/** Called when clear button clicked */
	onClear?: () => void;
	/** Called when close button clicked */
	onClose: () => void;
	/** Popup content (DatePicker, Multiselect checkboxes, etc.) */
	children: React.ReactNode;
	/** Additional classes for outer vx-popup wrapper */
	className?: string;
	/** Custom popup styles (minWidth, maxWidth, maxHeight) applied to ts-field-popup */
	popupStyle?: React.CSSProperties;
}

/**
 * FieldPopup Component
 *
 * Renders field popup at document.body level via React Portal
 * with exact Voxel HTML structure and dynamic positioning.
 */
export function FieldPopup({
	isOpen,
	target,
	title = '',
	icon,
	saveLabel = 'Save',
	clearLabel = 'Clear',
	showClear = true,
	showSave = true,
	onSave,
	onClear,
	onClose,
	children,
	className = '',
	popupStyle,
}: FieldPopupProps) {
	const popupRef = useRef<HTMLDivElement>(null);
	const popupBoxRef = useRef<HTMLDivElement>(null);
	// Initialize with position:absolute to prevent layout flash before reposition() runs
	const [styles, setStyles] = useState<React.CSSProperties>({
		position: 'absolute',
		top: '-9999px', // Hide off-screen until reposition() calculates final position
		left: '-9999px',
	});
	// Track previous styles to prevent infinite loop from ResizeObserver feedback
	const lastStylesRef = useRef<string>('');

	// =====================================================
	// POSITIONING LOGIC (from Voxel.mixins.popup)
	// =====================================================
	const reposition = useCallback((forceSync = false) => {
		if (!popupBoxRef.current || !target.current || !popupRef.current) {
			return;
		}

		const targetElement = target.current;
		const popupElement = popupRef.current;
		const popupBox = popupBoxRef.current;

		// STEP 1: Get trigger element dimensions and position
		const bodyWidth = document.body.clientWidth;
		const triggerRect = targetElement.getBoundingClientRect(); // Viewport-relative
		const triggerOuterWidth = targetElement.offsetWidth;

		// Get document-relative position (like jQuery.offset())
		// CRITICAL: jQuery.offset() uses getBoundingClientRect() + scroll position
		// The offsetParent traversal was causing incorrect positioning when scrolled
		const triggerOffset = {
			left: triggerRect.left + window.pageXOffset,
			top: triggerRect.top + window.pageYOffset,
		};

		// STEP 2: Get popup box dimensions
		const popupRect = popupElement.getBoundingClientRect();

		// Calculate popup width (use minWidth or trigger width, whichever is larger)
		// CRITICAL: For date pickers, use fixed width to match Voxel's CSS
		// Voxel uses .xl-width { min-width: 640px } for date range, .lg-width { min-width: 420px } for single date
		const computedStyle = window.getComputedStyle(popupBox);
		const minWidth = parseFloat(computedStyle.minWidth) || 0;
		const pikaCalendar = popupBox.querySelector('.pika-single') as HTMLElement;

		// For date pickers: Detect if it's a date range (2 months) or single date (1 month)
		// FIX: Use fixed width instead of measuring calendar dynamically to prevent ResizeObserver feedback loop
		let popupWidth: number;
		if (pikaCalendar) {
			// Check if it's a date range picker (has multiple months or is-range class)
			const isDateRange = pikaCalendar.classList.contains('is-range') ||
				pikaCalendar.querySelectorAll('.pika-lendar').length > 1 ||
				popupBox.closest('.ts-booking-date-range') !== null;

			// Voxel CSS: xl-width = 640px (date range), lg-width = 420px (single date)
			popupWidth = isDateRange
				? Math.max(640, minWidth) // Date range: 640px (matches Voxel xl-width)
				: Math.max(420, minWidth); // Single date: 420px (matches Voxel lg-width)
		} else {
			popupWidth = Math.max(triggerRect.width, minWidth);
		}

		// STEP 3: Calculate horizontal position (left)
		const triggerCenterX = triggerOffset.left + triggerOuterWidth / 2;
		const viewportCenterX = bodyWidth / 2;

		let leftPosition: number;
		if (triggerCenterX > viewportCenterX + 1) {
			// Right-align popup to right edge of trigger
			leftPosition = triggerOffset.left - popupWidth + triggerOuterWidth;
		} else {
			// Left-align popup to left edge of trigger
			leftPosition = triggerOffset.left;
		}

		// STEP 4: Calculate vertical position (top)
		const viewportHeight = window.innerHeight;
		const popupHeight = popupRect.height;

		// Default: position below trigger
		let topPosition = triggerOffset.top + triggerRect.height;

		// Check if there's room to position below
		const isBottomTruncated = triggerRect.bottom + popupHeight > viewportHeight;
		const isRoomAbove = triggerRect.top - popupHeight >= 0;

		if (isBottomTruncated && isRoomAbove) {
			// Position above trigger
			topPosition = triggerOffset.top - popupHeight;
		}

		// STEP 5: Build CSS styles
		const newStyles: React.CSSProperties = {
			top: `${topPosition}px`,
			left: `${leftPosition}px`,
			width: `${popupWidth}px`,
			position: 'absolute',
		};

		// STEP 6: Apply styles only if they actually changed
		// FIX: Compare serialized styles to prevent ResizeObserver feedback loop
		const serializedStyles = JSON.stringify(newStyles);
		if (serializedStyles === lastStylesRef.current) {
			return; // Styles unchanged, skip update to prevent infinite loop
		}
		lastStylesRef.current = serializedStyles;

		if (forceSync) {
			setStyles(newStyles);
		} else {
			requestAnimationFrame(() => setStyles(newStyles));
		}
	}, [target]);

	// EXACT Voxel: Handle backdrop clicks to close popup (blurable mixin)
	// Evidence: themes/voxel/assets/dist/commons.js (Voxel.mixins.blurable)
	// Logic: Click anywhere outside .triggers-blur closes the popup
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;

			// Check if click is inside the popup box (.triggers-blur)
			if (popupBoxRef.current?.contains(target)) {
				return; // Click inside popup, don't close
			}

			// Click outside popup, close it
			onClose();
		};

		// Use mousedown event (same as Voxel) instead of click
		// requestAnimationFrame ensures popup is fully rendered before adding listener
		const rafId = requestAnimationFrame(() => {
			document.addEventListener('mousedown', handleClickOutside);
		});

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	// Handle ESC key to close
	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, onClose]);

	// Setup positioning and event listeners
	useEffect(() => {
		if (!isOpen) return;

		// Initial repositioning (forceSync=true to ensure immediate style application)
		reposition(true);

		// Listen for scroll events (capture phase)
		const handleScroll = () => reposition();
		window.addEventListener('scroll', handleScroll, true);

		// Listen for window resize
		const handleResize = () => reposition();
		window.addEventListener('resize', handleResize, true);

		// Watch for popup content size changes
		let resizeObserver: ResizeObserver | null = null;
		if (popupBoxRef.current) {
			resizeObserver = new ResizeObserver(() => reposition(true));
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

	// Close icon SVG (from Voxel close.svg)
	const CloseIcon = () => (
		<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor" />
		</svg>
	);

	// Reload icon SVG (from Voxel reload.svg) - used for mobile clear button
	// Evidence: themes/voxel/templates/components/popup.php:22
	const ReloadIcon = () => (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor" />
		</svg>
	);

	// Render popup via React Portal to document.body
	// EXACT Voxel HTML structure from themes/voxel/templates/components/popup.php
	// CRITICAL: Apply dynamic styles to ts-form element (like Vue's :style="styles")
	// CRITICAL: Size classes (lg-width, md-height, xl-width, xl-height) go on outer vx-popup wrapper
	return createPortal(
		<div className={`elementor vx-popup ${className}`.trim()}>
			<div className="ts-popup-root elementor-element">
				<div className="ts-form elementor-element" style={styles} ref={popupRef}>
					<div className="ts-field-popup-container">
						{/* Popup box - backdrop clicks handled by document-level listener */}
						<div
							className="ts-field-popup triggers-blur"
							ref={popupBoxRef}
							style={popupStyle}
						>
							{/* Popup Head (optional) */}
							{title && (
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

							{/* Content Area (scrollable) */}
							<div className="ts-popup-content-wrapper min-scroll">
								{children}
							</div>

							{/* Footer Controller (buttons) */}
							{/* EXACT Voxel: themes/voxel/templates/components/popup.php:10-51 */}
							{/* When showSave or showClear is true, show full controller */}
							{/* When only close button needed, use hide-d class (mobile/tablet only) */}
							{(showSave || showClear) ? (
								<div className="ts-popup-controller">
									<ul className="flexify simplify-ul">
										{/* Close X button (always visible when showSave/showClear is true) */}
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

										{/* Clear button - mobile version (icon only, hide on desktop) */}
										{/* Evidence: popup.php:19-24 */}
										{showClear && onClear && (
											<li
												className="flexify hide-d"
												onClick={(e) => {
													e.preventDefault();
													onClear();
												}}
											>
												<a href="#" className="ts-icon-btn">
													<ReloadIcon />
												</a>
											</li>
										)}

										{/* Clear button - desktop version (text button, hide on mobile) */}
										{/* Evidence: popup.php:25-29 */}
										{showClear && onClear && (
											<li
												className="flexify hide-m"
												onClick={(e) => {
													e.preventDefault();
													onClear();
												}}
											>
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
													onClick={(e) => {
														e.preventDefault();
														onSave();
														// onClose(); // BUG FIX: Let parent handle closing after state updates
													}}
													className="ts-btn ts-btn-2"
												>
													{saveLabel}
												</a>
											</li>
										)}
									</ul>
								</div>
							) : (
								/* Close-only controller: hide-d means visible on tablet/mobile only */
								/* Evidence: popup.php:42-50 */
								<div className="ts-popup-controller hide-d">
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
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
}

export default FieldPopup;
