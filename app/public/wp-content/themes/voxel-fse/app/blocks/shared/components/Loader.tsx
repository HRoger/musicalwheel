/**
 * Loader Component - Standardized Loading Indicators
 *
 * Provides consistent loading states matching Voxel's spinner patterns:
 * - `.ts-loader` - 28px spinner (0.75s rotation)
 * - `.ts-no-posts` - Centered container for spinner (most common Voxel pattern)
 * - `.vx-loading-screen` - Full-page overlay loader
 * - `.ts-loader-wrapper` - Button loader wrapper
 * - `.vx-disabled` / `.vx-pending` - Opacity-based loading (opacity: 0.6, pointer-events: none)
 * - `.vx-inert` - Pointer-events only loading (no opacity change)
 *
 * CSS classes are already defined in Voxel theme - no need to duplicate.
 *
 * Evidence:
 * - themes/voxel/assets/dist/common.css - .ts-loader, .vx-disabled, .vx-pending, .vx-inert definitions
 * - themes/voxel/templates/widgets/*.php - loading state patterns
 *
 * VOXEL LOADING PATTERNS:
 * Pattern 1: SPINNER-BASED (Full-page or initial loads)
 *   <div class="ts-no-posts"><span class="ts-loader"></span></div>
 *
 * Pattern 2: OPACITY-BASED (List operations, pagination, secondary actions)
 *   <div class="vx-order-list" :class="{'vx-disabled': loading}">
 *   CSS: opacity: 0.6; pointer-events: none;
 *
 * Pattern 3: BUTTON LOADING
 *   <button class="ts-btn ts-loading-btn">
 *     <div class="ts-loader-wrapper"><span class="ts-loader"></span></div>
 *   </button>
 *   CSS: Button text becomes color: transparent !important;
 *
 * Pattern 4: INERT (pointer-events only)
 *   <div class="vx-order-more" :class="{'vx-inert': loading}">
 *   CSS: pointer-events: none; (no opacity change)
 *
 * @package VoxelFSE
 */

import type { ForwardedRef } from 'react';

export interface LoaderProps {
	/**
	 * Loader variant:
	 * - inline: Simple spinner (default)
	 * - centered: Spinner in ts-no-posts container (most common Voxel pattern)
	 * - fullpage: Full-page overlay with centered spinner
	 * - button: Button loading state with wrapper
	 */
	variant?: 'inline' | 'centered' | 'fullpage' | 'button';

	/**
	 * Additional CSS classes
	 */
	className?: string;

	/**
	 * Accessible label for screen readers
	 */
	ariaLabel?: string;

	/**
	 * Optional text to display below the spinner (only for centered variant)
	 */
	text?: string;

	/**
	 * Forwarded ref to the root element
	 */
	ref?: ForwardedRef<HTMLSpanElement>;
}

/**
 * Loader Component
 *
 * Usage:
 * ```tsx
 * // Inline spinner
 * <Loader />
 *
 * // Centered in ts-no-posts container (MOST COMMON - matches Voxel exactly)
 * <Loader variant="centered" />
 *
 * // Full-page loading overlay
 * <Loader variant="fullpage" />
 *
 * // Button loading state
 * <button className="ts-btn ts-loading-btn">
 *   <Loader variant="button" />
 * </button>
 * ```
 */
export function Loader({ variant = 'inline', className = '', ariaLabel = 'Loading', text, ref }: LoaderProps) {
		// Inline spinner only
		if (variant === 'inline') {
			return (
				<span
					ref={ref}
					className={`ts-loader ${className}`}
					role="status"
					aria-label={ariaLabel}
				></span>
			);
		}

		// Centered in ts-no-posts container (most common Voxel pattern)
		if (variant === 'centered') {
			return (
				<div className={`ts-no-posts ${className}`}>
					<span ref={ref} className="ts-loader" role="status" aria-label={ariaLabel}></span>
					{text && <p>{text}</p>}
				</div>
			);
		}

		// Full-page overlay
		if (variant === 'fullpage') {
			return (
				<div className={`vx-loading-screen ${className}`}>
					<div className="ts-no-posts">
						<span ref={ref} className="ts-loader" role="status" aria-label={ariaLabel}></span>
					</div>
				</div>
			);
		}

		// Button loader (used inside buttons)
		if (variant === 'button') {
			return (
				<div className="ts-loader-wrapper">
					<span ref={ref} className="ts-loader" role="status" aria-label={ariaLabel}></span>
					{text && <span>{text}</span>}
				</div>
			);
		}

		// Default fallback to inline
		return (
			<span
				ref={ref}
				className={`ts-loader ${className}`}
				role="status"
				aria-label={ariaLabel}
			></span>
		);
}

/**
 * Utility function for opacity-based loading classes
 *
 * Voxel uses these CSS classes for opacity-based loading states:
 * - vx-disabled: opacity: 0.6; pointer-events: none; (most common)
 * - vx-pending: opacity: 0.6; pointer-events: none; (same as disabled)
 * - vx-inert: pointer-events: none; (no opacity change)
 *
 * Usage:
 * ```tsx
 * <div className={`vx-order-list ${getLoadingClass(isLoading)}`}>
 * <div className={`vx-order-more ${getLoadingClass(isLoading, 'inert')}`}>
 * ```
 *
 * @param isLoading - Whether the loading state is active
 * @param variant - Type of loading class ('disabled' | 'pending' | 'inert')
 * @returns CSS class string or empty string
 */
export function getLoadingClass(
	isLoading: boolean,
	variant: 'disabled' | 'pending' | 'inert' = 'disabled'
): string {
	if (!isLoading) return '';

	switch (variant) {
		case 'disabled':
			return 'vx-disabled';
		case 'pending':
			return 'vx-pending';
		case 'inert':
			return 'vx-inert';
		default:
			return 'vx-disabled';
	}
}

// Default export for backward compatibility
export default Loader;
