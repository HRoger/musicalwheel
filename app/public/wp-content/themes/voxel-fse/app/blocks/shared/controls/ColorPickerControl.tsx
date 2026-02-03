/**
 * Color Picker Control Component
 *
 * Two-column inline layout: label on left, color picker button with reset on right.
 * Uses WordPress's native ColorIndicator for the color button and ColorPalette for the picker.
 *
 * Pattern: Matches WordPress's block-editor-panel-color-gradient-settings styling.
 *
 * @package VoxelFSE
 */

import { useState, useRef, useEffect } from 'react';
import { ColorPalette } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface ColorPickerControlProps {
	label: string;
	value?: string;
	/** Called with color string when selected, empty string when reset/cleared */
	onChange: (value: string) => void;
	colors?: Array<{ name: string; color: string }>;
	/** Whether to show the full color picker with custom colors (default: true) */
	enableCustomColors?: boolean;
}

// WordPress default theme colors
const DEFAULT_COLORS = [
	{ name: __('Blue', 'voxel-fse'), color: '#2271b1' },
	{ name: __('Purple', 'voxel-fse'), color: '#7c3aed' },
	{ name: __('Orange', 'voxel-fse'), color: '#f59e0b' },
	{ name: __('White', 'voxel-fse'), color: '#ffffff' },
	{ name: __('Black', 'voxel-fse'), color: '#000000' },
	{ name: __('Light Gray', 'voxel-fse'), color: '#d1d5db' },
	{ name: __('Gray', 'voxel-fse'), color: '#6b7280' },
	{ name: __('Dark Gray', 'voxel-fse'), color: '#374151' },
	{ name: __('Navy', 'voxel-fse'), color: '#1e3a8a' },
	{ name: __('Dark Blue', 'voxel-fse'), color: '#1e40af' },
	{ name: __('Dark Purple', 'voxel-fse'), color: '#6d28d9' },
	{ name: __('Cyan', 'voxel-fse'), color: '#06b6d4' },
	{ name: __('Teal', 'voxel-fse'), color: '#14b8a6' },
	{ name: __('Green', 'voxel-fse'), color: '#22c55e' },
	{ name: __('Red', 'voxel-fse'), color: '#ef4444' },
];

/**
 * ColorPickerControl - Inline color picker with two-column layout
 *
 * Uses WordPress's native ColorIndicator component for the color swatch button.
 * Shows a ColorPalette popup when clicked.
 *
 * @example
 * <ColorPickerControl
 *   label="Background Color"
 *   value={attributes.backgroundColor}
 *   onChange={(color) => setAttributes({ backgroundColor: color })}
 * />
 */
export default function ColorPickerControl({
	label,
	value,
	onChange,
	colors = DEFAULT_COLORS,
	enableCustomColors = true,
}: ColorPickerControlProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);

	// Position popup to the LEFT of the sidebar (content-aware positioning, matching BoxShadowPopup)
	useEffect(() => {
		if (!isOpen || !popupRef.current || !buttonRef.current) {
			return;
		}

		const updatePosition = () => {
			if (!popupRef.current || !buttonRef.current) {
				return;
			}
			const popup = popupRef.current;
			const popupWidth = popup.offsetWidth;
			const popupHeight = popup.offsetHeight;
			const viewportHeight = window.innerHeight;

			// Find the inspector sidebar container
			const sidebar = buttonRef.current.closest('.interface-interface-skeleton__sidebar');
			const sidebarRect = sidebar?.getBoundingClientRect();

			// If we found the sidebar, position to the LEFT of it
			// Otherwise fall back to positioning relative to the button
			let left: number;
			let top: number;

			if (sidebarRect) {
				// Position to the left of the sidebar with a small gap
				left = sidebarRect.left - popupWidth - 12;

				// Vertically center relative to the button
				const buttonRect = buttonRef.current.getBoundingClientRect();
				top = buttonRect.top - (popupHeight / 2) + (buttonRect.height / 2);
			} else {
				// Fallback: position to the left of the button
				const buttonRect = buttonRef.current.getBoundingClientRect();
				left = buttonRect.left - popupWidth - 8;
				top = buttonRect.top;
			}

			// Ensure popup stays within viewport bounds
			if (left < 8) {
				left = 8;
			}

			// Adjust vertically if off-screen bottom
			if (top + popupHeight > viewportHeight - 8) {
				top = viewportHeight - popupHeight - 8;
			}

			// Ensure not above viewport
			if (top < 8) {
				top = 8;
			}

			popup.style.top = `${top}px`;
			popup.style.left = `${left}px`;
		};

		// Initial position after ColorPalette has rendered
		// Double requestAnimationFrame ensures child components are painted
		requestAnimationFrame(() => {
			requestAnimationFrame(updatePosition);
		});

		const handleClickOutside = (event: MouseEvent) => {
			if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
				if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
					setIsOpen(false);
				}
			}
		};

		window.addEventListener('resize', updatePosition);
		window.addEventListener('scroll', updatePosition, true);
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			window.removeEventListener('resize', updatePosition);
			window.removeEventListener('scroll', updatePosition, true);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className="voxel-fse-color-picker-control" style={{ position: 'relative' }}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr auto',
					alignItems: 'center',
					gap: '8px',
					marginBottom: '12px',
				}}
			>
				{/* Label on left */}
				<label
					style={{
						fontSize: '13px',
						fontWeight: 500,
						textTransform: 'capitalize',
						color: 'rgb(30, 30, 30)',
						margin: 0,
					}}
				>
					{label}
				</label>

				{/* Color indicator button and reset on right */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
					{/* Color indicator button - uses WordPress component-color-indicator class */}
					<button
						ref={buttonRef}
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						aria-expanded={isOpen}
						aria-label={__('Choose color', 'voxel-fse')}
						className="component-color-indicator"
						style={{
							background: value
								? value
								: '#fff linear-gradient(-45deg, transparent 48%, #ddd 48%, #ddd 52%, transparent 52%)',
							borderRadius: '50%',
							boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.2)',
							display: 'inline-block',
							height: '22px',
							width: '22px',
							padding: 0,
							border: 'none',
							cursor: 'pointer',
						}}
					/>

					{/* Reset button - uses dashicons-image-rotate with WordPress blue */}
					{value && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								// Use empty string to reset - Gutenberg properly serializes this
								// and hasValue('') returns false in generateCSS
								// NOTE: undefined is ignored by Gutenberg's setAttributes merge
								onChange('');
							}}
							onMouseDown={(e) => {
								// Prevent mousedown from triggering parent popup close handlers
								e.stopPropagation();
							}}
							aria-label={__('Reset', 'voxel-fse')}
							className="components-button is-small has-icon"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								minWidth: '24px',
								width: '24px',
								height: '24px',
								padding: 0,
								border: 'none',
								background: 'transparent',
								cursor: 'pointer',
								color: '#007cba',
							}}
						>
							<span
								className="dashicons dashicons-image-rotate"
								style={{
									fontSize: '16px',
									width: '16px',
									height: '16px',
								}}
							/>
						</button>
					)}
				</div>
			</div>

			{/* Popup with ColorPalette - at root level like BoxShadowPopup */}
			{isOpen && (
				<div
					ref={popupRef}
					className="voxel-fse-color-picker-popup"
					style={{
						position: 'fixed',
						top: '-9999px', // Start off-screen, updatePosition will move it
						left: '-9999px',
						zIndex: 1000000,
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
						boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
						padding: '16px',
						minWidth: '280px',
						maxWidth: '320px',
					}}
				>
					{/* Arrow pointing right (towards the sidebar) */}
					<div
						style={{
							position: 'absolute',
							right: '-8px',
							top: '50%',
							transform: 'translateY(-50%)',
							width: 0,
							height: 0,
							borderTop: '8px solid transparent',
							borderBottom: '8px solid transparent',
							borderLeft: '8px solid #fff',
							filter: 'drop-shadow(2px 0 1px rgba(0,0,0,0.1))',
						}}
					/>
					<ColorPalette
						colors={colors}
						value={value}
						onChange={(newColor) => {
							// When color is cleared (undefined from ColorPalette), use empty string
							// Gutenberg properly serializes empty strings, hasValue('') returns false
							onChange(newColor ?? '');
						}}
						clearable
						disableCustomColors={!enableCustomColors}
					/>
				</div>
			)}
		</div>
	);
}
