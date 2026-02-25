/**
 * DropdownList Component
 *
 * Matches Voxel's dropdown-list Vue component EXACTLY for CSS compatibility.
 * Uses React Portal to render at document.body level (teleport behavior).
 *
 * Evidence:
 * - themes/voxel/templates/widgets/timeline/partials/_dropdown-list.php
 * - themes/voxel/templates/widgets/timeline/status-feed/status-feed.php:41-52
 *
 * Voxel HTML Structure:
 * <teleport to="body">
 *   <transition name="form-popup">
 *     <form-popup class="xs-width" :target="target" @blur="$emit('blur')">
 *       <div class="ts-term-dropdown ts-md-group">
 *         <ul class="simplify-ul ts-term-dropdown-list min-scroll">
 *           <li v-for="order in config.settings.ordering_options">
 *             <a href="#" class="flexify" @click.prevent="setActiveOrder(order)">
 *               <span>{{ order.label }}</span>
 *             </a>
 *           </li>
 *         </ul>
 *       </div>
 *     </form-popup>
 *   </transition>
 * </teleport>
 *
 * @package VoxelFSE
 */

import { useEffect, useLayoutEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Props
 */
interface DropdownListProps {
	/** Target element (trigger button) for positioning */
	target: HTMLElement | null;
	/** Called when dropdown should close (blur) */
	onBlur: () => void;
	/** Dropdown content (li items) */
	children: ReactNode;
	/** Additional class names */
	className?: string;
}

/**
 * DropdownList Component
 * Matches Voxel's vxfeed__dd-list template structure exactly
 */
export function DropdownList({
	target,
	onBlur,
	children,
	className = '',
}: DropdownListProps): JSX.Element | null {
	// Two refs like FieldPopup: one for .ts-form (positioning), one for .ts-field-popup (dimensions/click detection)
	const popupRef = useRef<HTMLDivElement>(null);
	const popupBoxRef = useRef<HTMLDivElement>(null);
	const [styles, setStyles] = useState<React.CSSProperties>({});
	// @ts-ignore -- unused but kept for future use

	/**
	 * Calculate position relative to target
	 * Matches Voxel's popup positioning algorithm exactly
	 * Evidence: themes/voxel/assets/dist/commons.js (Voxel.mixins.popup)
	 * See: docs/block-conversions/popup-positioning-architecture.md
	 */
	const reposition = useCallback(() => {
		if (!popupRef.current || !popupBoxRef.current || !target) {
			return;
		}

		const bodyWidth = document.body.clientWidth;
		const triggerRect = target.getBoundingClientRect();
		const popupBox = popupBoxRef.current;

		// n = jQuery(o).outerWidth() - use offsetWidth for outer width
		const triggerOuterWidth = target.offsetWidth;

		// s = jQuery(o).offset() - use getBoundingClientRect + scroll for document position
		// This is simpler and more reliable than walking offsetParent chain
		const triggerOffset = {
			left: triggerRect.left + window.scrollX,
			top: triggerRect.top + window.scrollY,
		};

		// Get popup box dimensions - use popupBox (.ts-field-popup) for actual content dimensions
		const popupBoxRect = popupBox.getBoundingClientRect();

		// For xs-width dropdowns, use 180px (matches Voxel's CSS for .xs-width .ts-field-popup)
		const computedStyle = window.getComputedStyle(popupBox);
		const minWidth = parseFloat(computedStyle.minWidth) || 180;
		const popupWidth = Math.max(triggerRect.width, minWidth);

		// a = s.left + n/2 > a/2 + 1 ? s.left - i + n : s.left
		// If trigger center is RIGHT of body center → align RIGHT edges
		// Otherwise → align LEFT edges
		const triggerCenterX = triggerOffset.left + triggerOuterWidth / 2;
		const viewportCenterX = bodyWidth / 2;

		let leftPosition: number;
		if (triggerCenterX > viewportCenterX + 1) {
			// Right-align: popup right edge aligns with trigger right edge
			leftPosition = triggerOffset.left - popupWidth + triggerOuterWidth;
		} else {
			// Left-align: popup left edge aligns with trigger left edge
			leftPosition = triggerOffset.left;
		}

		// Ensure popup doesn't go off-screen
		if (leftPosition < 10) {
			leftPosition = 10;
		}
		if (leftPosition + popupWidth > bodyWidth - 10) {
			leftPosition = bodyWidth - popupWidth - 10;
		}

		// Default top: below trigger
		let topPosition = triggerOffset.top + triggerRect.height;

		// Check if fits below, if not try above
		const viewportHeight = window.innerHeight;
		const popupHeight = popupBoxRect.height;
		const isBottomTruncated = triggerRect.bottom + popupHeight > viewportHeight;
		const isRoomAbove = triggerRect.top - popupHeight >= 0;

		if (isBottomTruncated && isRoomAbove) {
			topPosition = triggerOffset.top - popupHeight;
		}

		setStyles({
			position: 'absolute',
			top: `${topPosition}px`,
			left: `${leftPosition}px`,
			width: `${popupWidth}px`,
		});
	}, [target]);

	/**
	 * Handle clicks outside to close (blurable mixin pattern)
	 * Evidence: .mcp-memory/memory.json - "Blurable Mixin Pattern"
	 */
	useEffect(() => {
		const handleMouseDown = (e: MouseEvent) => {
			const clickTarget = e.target as HTMLElement;

			// Don't close if clicking inside the popup box (.triggers-blur)
			if (popupBoxRef.current?.contains(clickTarget)) {
				return;
			}

			// Don't close if clicking on the trigger
			if (target?.contains(clickTarget)) {
				return;
			}

			// Click outside, close dropdown
			onBlur();
		};

		// Use requestAnimationFrame to ensure DOM is ready
		const rafId = requestAnimationFrame(() => {
			document.addEventListener('mousedown', handleMouseDown);
		});

		return () => {
			cancelAnimationFrame(rafId);
			document.removeEventListener('mousedown', handleMouseDown);
		};
	}, [target, onBlur]);

	/**
	 * Handle ESC key to close
	 */
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onBlur();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onBlur]);

	/**
	 * Initial positioning - use useLayoutEffect for synchronous positioning
	 * before browser paints. This prevents the "flash" of wrong position.
	 */
	useLayoutEffect(() => {
		reposition();
	}, [reposition]);

	/**
	 * Setup scroll/resize listeners for repositioning
	 */
	useEffect(() => {
		// Reposition on scroll/resize
		const handleScroll = () => reposition();
		const handleResize = () => reposition();

		window.addEventListener('scroll', handleScroll, true);
		window.addEventListener('resize', handleResize, true);

		// Watch for popup content size changes
		let resizeObserver: ResizeObserver | null = null;
		if (popupBoxRef.current) {
			resizeObserver = new ResizeObserver(() => reposition());
			resizeObserver.observe(popupBoxRef.current);
		}

		return () => {
			window.removeEventListener('scroll', handleScroll, true);
			window.removeEventListener('resize', handleResize, true);
			resizeObserver?.disconnect();
		};
	}, [reposition]);

	// Don't render if no target
	if (!target) {
		return null;
	}

	// Render via React Portal to document.body (like Voxel's teleport)
	// Voxel structure: .elementor.vx-popup.xs-width > .ts-popup-root > .ts-form > .ts-field-popup-container > .ts-field-popup.triggers-blur
	return createPortal(
		<div className={`elementor vx-popup xs-width ${className}`}>
			<div className="ts-popup-root elementor-element">
				{/* ts-form receives positioning styles */}
				<div
					ref={popupRef}
					className="ts-form elementor-element"
					style={styles}
				>
					<div className="ts-field-popup-container">
						<div className="ts-field-popup triggers-blur" ref={popupBoxRef}>
							<div className="ts-popup-content-wrapper min-scroll">
								<div className="ts-term-dropdown ts-md-group">
									<ul className="simplify-ul ts-term-dropdown-list min-scroll">
										{children}
									</ul>
								</div>
							</div>
							{/* Mobile close button — matches Voxel popup.php showClose mode */}
							{/* Evidence: themes/voxel/templates/components/popup.php:42-50 */}
							<div className="ts-popup-controller hide-d">
								<ul className="flexify simplify-ul">
									<li className="flexify ts-popup-close">
										<a
											href="#"
											className="ts-icon-btn"
											role="button"
											onClick={(e) => {
												e.preventDefault();
												onBlur();
											}}
										>
											<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.9545 5.95548C6.39384 5.51614 7.10616 5.51614 7.5455 5.95548L11.999 10.409L16.4524 5.95561C16.8918 5.51627 17.6041 5.51627 18.0434 5.95561C18.4827 6.39495 18.4827 7.10726 18.0434 7.5466L13.59 12L18.0434 16.4534C18.4827 16.8927 18.4827 17.605 18.0434 18.0444C17.6041 18.4837 16.8918 18.4837 16.4524 18.0444L11.999 13.591L7.5455 18.0445C7.10616 18.4839 6.39384 18.4839 5.9545 18.0445C5.51517 17.6052 5.51516 16.8929 5.9545 16.4535L10.408 12L5.9545 7.54647C5.51516 7.10713 5.51517 6.39482 5.9545 5.95548Z" fill="#343C54"/></svg>
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
}

export default DropdownList;
