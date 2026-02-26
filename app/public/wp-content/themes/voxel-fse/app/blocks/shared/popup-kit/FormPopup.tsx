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
import { useDeviceType } from '@shared/utils/deviceType';

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
	/** Custom header action buttons (rendered as <li> items before close button) */
	headerActions?: React.ReactNode;
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
	headerActions,
}) => {
	// Detect Gutenberg device preview (desktop/tablet/mobile)
	// Returns 'desktop' on frontend where wp.data is unavailable
	const deviceType = useDeviceType();
	const isMobilePreview = deviceType === 'mobile' || deviceType === 'tablet';

	const popupRef = useRef<HTMLDivElement>(null); // .ts-form element (receives positioning styles)
	const popupBoxRef = useRef<HTMLDivElement>(null); // .ts-field-popup element
	const [styles, setStyles] = useState<React.CSSProperties>({
		position: 'absolute',
		left: '-9999px',
	});
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
		// Skip positioning in mobile/tablet preview — CSS handles fixed bottom-sheet layout
		if (isMobilePreview) return;

		if (!popupBoxRef.current || !target || !popupRef.current) {
			return;
		}

		const targetElement = target;
		const popupElement = popupRef.current;
		const popupBox = popupBoxRef.current;

		// Detect FSE editor: In the block editor, React runs in the parent frame
		// but trigger elements live inside the editor iframe. The portal renders
		// to the parent frame's body, so we need to offset iframe-relative coords.
		const editorIframe = document.querySelector<HTMLIFrameElement>('iframe[name="editor-canvas"]');
		const isEditor = !!editorIframe;

		// Get iframe offset in parent viewport (editor toolbar height)
		let iframeOffsetTop = 0;
		let iframeOffsetLeft = 0;
		if (isEditor && editorIframe) {
			const iframeRect = editorIframe.getBoundingClientRect();
			iframeOffsetTop = iframeRect.top;
			iframeOffsetLeft = iframeRect.left;
		}

		// a = jQuery("body").innerWidth()
		const bodyWidth = isEditor
			? (editorIframe?.contentDocument?.documentElement.clientWidth ?? document.body.clientWidth)
			: document.body.clientWidth;

		// l = o.getBoundingClientRect() (viewport-relative, within iframe context)
		const triggerRect = targetElement.getBoundingClientRect();

		// n = jQuery(o).outerWidth()
		const triggerOuterWidth = targetElement.offsetWidth;

		// s = jQuery(o).offset() - document-relative position
		// In editor: trigger coords are iframe-relative; add iframe offset for parent-frame positioning
		const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
		const scrollY = window.pageYOffset || document.documentElement.scrollTop;
		const triggerOffset = {
			left: triggerRect.left + scrollX + iframeOffsetLeft,
			top: triggerRect.top + scrollY + iframeOffsetTop,
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
		const isRightSide = triggerOffset.left + triggerOuterWidth / 2 > (bodyWidth + iframeOffsetLeft) / 2 + 1;
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
		if (leftPosition + popupWidth > bodyWidth + iframeOffsetLeft) {
			leftPosition = bodyWidth + iframeOffsetLeft - popupWidth - 10;
		}

		// Default top: below trigger
		let topPosition = triggerOffset.top + triggerRect.height;

		// n = window.innerHeight
		const viewportHeight = window.innerHeight;

		// If doesn't fit below AND fits above → position above
		// Use parent-frame-adjusted coords for viewport check
		const triggerBottomInParent = triggerRect.bottom + iframeOffsetTop;
		const triggerTopInParent = triggerRect.top + iframeOffsetTop;
		if (triggerBottomInParent + popupRect.height > viewportHeight && triggerTopInParent - popupRect.height >= 0) {
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
	}, [target, propMinWidth, isMobilePreview]);

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
	// Evidence: themes/voxel/assets/dist/commons.js (Voxel.mixins.blurable)
	//
	// Editor vs Frontend strategy:
	// The popup portal lives in the parent frame's document.body. Voxel's CSS creates
	// a full-screen ::after backdrop on .ts-popup-root > div with pointer-events:all,
	// which intercepts all clicks in the parent frame. In the editor we inject a <style>
	// that disables pointer-events on the ::after, so clicks pass through to the actual
	// sidebar elements. The Gutenberg selector checks then correctly identify sidebar
	// clicks and keep the popup open.
	const isEditor = !!document.querySelector('iframe[name="editor-canvas"]');

	useEffect(() => {
		if (!isOpen) return;

		const editorIframe = document.querySelector<HTMLIFrameElement>('iframe[name="editor-canvas"]');
		const iframeDoc = editorIframe?.contentDocument;

		const handleClickOutside = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;

			// Click inside the popup box — don't close
			if (popupBoxRef.current?.contains(clickTarget)) {
				return;
			}

			// Click on the trigger element — don't close
			if (target && target.contains(clickTarget)) {
				return;
			}

			// In editor: don't close when clicking sidebar/toolbar
			if (editorIframe) {
				const gutenbergSelectors = [
					'.interface-interface-skeleton__sidebar',
					'.block-editor-block-inspector',
					'.components-popover',
					'.components-modal__screen-overlay',
					'.edit-post-sidebar',
					'.interface-interface-skeleton__header',
					'.interface-interface-skeleton__secondary-sidebar',
				];
				for (const selector of gutenbergSelectors) {
					if (clickTarget.closest(selector)) {
						return;
					}
				}
			}

			onClose();
		};

		// Editor: also close when clicking the editor canvas (iframe body)
		const handleIframeClick = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;

			if (target && target.contains(clickTarget)) {
				return;
			}

			onClose();
		};

		const rafId = requestAnimationFrame(() => {
			document.addEventListener('mousedown', handleClickOutside);
			if (editorIframe) {
				iframeDoc?.addEventListener('mousedown', handleIframeClick);
			}
		});

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener('mousedown', handleClickOutside);
			iframeDoc?.removeEventListener('mousedown', handleIframeClick);
		};
	}, [isOpen, onClose, target]);

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

	// Portal target selection:
	// - Desktop editor: parent frame body (popup needs iframe offset calculation)
	// - Mobile/tablet preview: editor iframe body (popup contained within narrow viewport,
	//   Voxel's native @media (max-width:1024px) CSS applies naturally for bottom-sheet layout)
	// - Frontend: document.body (standard Voxel behavior)
	const editorIframeForPortal = document.querySelector<HTMLIFrameElement>('iframe[name="editor-canvas"]');
	const portalTarget = (isMobilePreview && editorIframeForPortal?.contentDocument?.body)
		? editorIframeForPortal.contentDocument.body
		: document.body;

	// In mobile/tablet preview, skip inline positioning — CSS handles fixed bottom-sheet layout
	const effectiveStyles: React.CSSProperties = isMobilePreview ? {} : styles;

	// Render popup via React Portal
	return createPortal(
		<div className={`elementor vx-popup ${popupClass}`.trim()}>
			{/* Editor desktop: disable the full-screen ::after backdrop so clicks reach sidebar elements */}
			{/* Mobile/tablet preview: allow backdrop for authentic bottom-sheet look */}
			{isEditor && !isMobilePreview && (
				<style>{`.vx-popup .ts-popup-root > div::after { pointer-events: none !important; }`}</style>
			)}
			<div className="ts-popup-root elementor-element">
				{/* ts-form receives positioning styles (like Vue's :style="styles") */}
				<div
					ref={popupRef}
					className="ts-form elementor-element"
					style={effectiveStyles}
				>
					<div className="ts-field-popup-container">
						{/* Actual popup box - backdrop clicks handled by event listeners */}
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
										{headerActions}
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
		portalTarget
	);
};

export default FormPopup;
