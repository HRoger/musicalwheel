/**
 * Responsive Color Control Component
 *
 * A color picker with responsive viewport dropdown (Desktop/Tablet/Mobile)
 * Uses inline ColorPickerControl layout with label on left, color swatch on right.
 * Matches Elementor's responsive color control pattern.
 */
import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { ColorPalette } from '@wordpress/components';
import ResponsiveDropdownButton from './ResponsiveDropdownButton';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface ResponsiveColorControlProps {
	label: string;
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	attributeBaseName: string;
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

export default function ResponsiveColorControl({
	label,
	attributes,
	setAttributes,
	attributeBaseName,
}: ResponsiveColorControlProps) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);

	// Get WordPress's current device type from the store
	const wpDeviceType = useSelect((select) => {
		const editPostStore = select('core/edit-post');
		if (editPostStore && typeof editPostStore.getPreviewDeviceType === 'function') {
			return editPostStore.getPreviewDeviceType();
		}

		if (editPostStore && typeof editPostStore.__experimentalGetPreviewDeviceType === 'function') {
			return editPostStore.__experimentalGetPreviewDeviceType();
		}

		const editorStore = select('core/editor');
		if (editorStore && typeof editorStore.getDeviceType === 'function') {
			return editorStore.getDeviceType();
		}

		return 'Desktop';
	}, []);

	const wpDevice = wpDeviceType ? wpDeviceType.toLowerCase() as DeviceType : 'desktop';
	const [currentDevice, setCurrentDevice] = useState<DeviceType>(wpDevice);

	useEffect(() => {
		if (wpDeviceType) {
			setCurrentDevice(wpDevice);
		}
	}, [wpDeviceType, wpDevice]);

	// Get attribute name for current device
	const getAttributeName = () => {
		if (currentDevice === 'desktop') return attributeBaseName;
		return `${attributeBaseName}_${currentDevice}`;
	};

	// Get current value with inheritance
	const getValue = () => {
		const attrName = getAttributeName();
		const value = attributes[attrName];

		// If value exists for current device, return it
		if (value !== undefined && value !== null && value !== '') {
			return value;
		}

		// Inherit from larger viewport
		if (currentDevice === 'mobile') {
			const tabletValue = attributes[`${attributeBaseName}_tablet`];
			if (tabletValue !== undefined && tabletValue !== null && tabletValue !== '') {
				return tabletValue;
			}
		}

		if (currentDevice === 'mobile' || currentDevice === 'tablet') {
			const desktopValue = attributes[attributeBaseName];
			if (desktopValue !== undefined && desktopValue !== null && desktopValue !== '') {
				return desktopValue;
			}
		}

		return '';
	};

	// Set value for current device
	const setValue = (value: string | undefined) => {
		const attrName = getAttributeName();
		setAttributes({ [attrName]: value });
	};

	// Check if current value is inherited
	const isInherited = () => {
		const attrName = getAttributeName();
		const value = attributes[attrName];
		return value === undefined || value === null || value === '';
	};

	const currentValue = getValue();

	// Position popup to the LEFT of the sidebar
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
		<div className="voxel-fse-responsive-color-control" style={{ position: 'relative' }}>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr auto',
					alignItems: 'center',
					gap: '8px',
					marginBottom: '12px',
				}}
			>
				{/* Label with responsive dropdown on left */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
					<ResponsiveDropdownButton onDeviceChange={setCurrentDevice} />
				</div>

				{/* Color indicator button and reset on right */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
					{/* Color indicator button */}
					<button
						ref={buttonRef}
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						aria-expanded={isOpen}
						aria-label={__('Choose color', 'voxel-fse')}
						className="component-color-indicator"
						style={{
							background: currentValue
								? currentValue
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

					{/* Reset button */}
					{currentValue && !isInherited() && (
						<button
							type="button"
							onClick={() => setValue(undefined)}
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

			{/* Inheritance Indicator */}
			{isInherited() && currentDevice !== 'desktop' && currentValue && (
				<div style={{
					fontSize: '11px',
					color: '#757575',
					marginTop: '-8px',
					marginBottom: '12px',
					fontStyle: 'italic'
				}}>
					{currentDevice === 'mobile'
						? __('Inherited from tablet or desktop', 'voxel-fse')
						: __('Inherited from desktop', 'voxel-fse')
					}
				</div>
			)}

			{/* Popup with ColorPalette */}
			{isOpen && (
				<div
					ref={popupRef}
					className="voxel-fse-color-picker-popup"
					style={{
						position: 'fixed',
						top: '-9999px',
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
						colors={DEFAULT_COLORS}
						value={currentValue}
						onChange={(newColor) => {
							setValue(newColor);
						}}
						clearable
					/>
				</div>
			)}
		</div>
	);
}

