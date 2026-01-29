/**
 * Box Shadow Popup Component
 *
 * Matches Elementor's box shadow control pattern - label with pencil icon that opens a popup
 * with box shadow controls (color, horizontal, vertical, blur, spread, position).
 *
 * Features:
 * - Content-aware positioning: Opens to the LEFT of the sidebar to avoid covering controls
 * - Uses reusable ColorPickerControl for color selection
 *
 * Evidence:
 * - Elementor pattern: themes/voxel/app/widgets/option-groups/popup-general.php:65-72
 * - Gutenberg Popover: @wordpress/components
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UndoIcon from '../icons/UndoIcon';
import ColorPickerControl from './ColorPickerControl';

// Edit icon using Elementor's eicon-edit class
const EditIcon = () => (
	<span className="eicon eicon-edit" style={{ fontSize: '14px' }} />
);

interface BoxShadowPopupProps {
	label: string;
	attributes: Record<string, any>;
	setAttributes: (attrs: Record<string, any>) => void;
	shadowAttributeName: string;
}

// Global state for device changes
declare global {
	interface Window {
		__voxelDeviceChangeTimestamp?: number;
	}
}

export default function BoxShadowPopup({
	label,
	attributes,
	setAttributes,
	shadowAttributeName,
}: BoxShadowPopupProps) {
	const [isOpen, setIsOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	// Default shadow values matching Elementor
	const defaultShadow = {
		horizontal: 0,
		vertical: 0,
		blur: 10,
		spread: 0,
		color: 'rgba(0, 0, 0, 0.5)',
		position: 'outline',
	};

	const shadow = attributes[shadowAttributeName] || {};

	// Check if shadow has any custom values (not empty)
	const hasValue = Object.keys(shadow).length > 0;

	const resetShadow = () => {
		setAttributes({
			[shadowAttributeName]: {},
		});
	};

	// Apply default values when opening popup (Elementor behavior)
	const handleOpenPopup = () => {
		if (!isOpen && !hasValue) {
			// Apply defaults immediately when opening for the first time
			setAttributes({
				[shadowAttributeName]: { ...defaultShadow },
			});
		}
		setIsOpen(!isOpen);
	};

	const buttonRef = useRef<HTMLButtonElement>(null);

	// Position popover to the LEFT of the sidebar (content-aware positioning)
	useEffect(() => {
		if (!isOpen || !popoverRef.current || !buttonRef.current) return;

		const updatePosition = () => {
			if (!popoverRef.current || !buttonRef.current) return;
			const popover = popoverRef.current;
			const popoverWidth = popover.offsetWidth;
			const popoverHeight = popover.offsetHeight;
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
				left = sidebarRect.left - popoverWidth - 12;

				// Vertically center relative to the button
				const buttonRect = buttonRef.current.getBoundingClientRect();
				top = buttonRect.top - (popoverHeight / 2) + (buttonRect.height / 2);
			} else {
				// Fallback: position to the left of the button
				const buttonRect = buttonRef.current.getBoundingClientRect();
				left = buttonRect.left - popoverWidth - 8;
				top = buttonRect.top;
			}

			// Ensure popup stays within viewport bounds
			if (left < 8) {
				left = 8;
			}

			// Adjust vertically if off-screen bottom
			if (top + popoverHeight > viewportHeight - 8) {
				top = viewportHeight - popoverHeight - 8;
			}

			// Ensure not above viewport
			if (top < 8) {
				top = 8;
			}

			popover.style.top = `${top}px`;
			popover.style.left = `${left}px`;
		};

		// Initial position after a small delay to allow for rendering
		requestAnimationFrame(updatePosition);

		// Handle clicking outside to close popup
		const handleClickOutside = (event: MouseEvent) => {
			// Don't close if a device change happened recently (within 1000ms)
			// This prevents the popup from closing during WordPress viewport transitions
			// Uses window global to survive component remounts
			const timestamp = window.__voxelDeviceChangeTimestamp || 0;
			if (Date.now() - timestamp < 1000) {
				return;
			}

			if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

const handleChange = (field: string, value: any) => {
	setAttributes({
		[shadowAttributeName]: { ...shadow, [field]: value }
	});
};

return (
	<div className="elementor-control elementor-control-type-box-shadow" style={{ position: 'relative' }}>
		<div className="elementor-control-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
			<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>{label}</span>
			<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
				{/* Reset button - only shows when values are set */}
				{hasValue && (
					<Button
						icon={<UndoIcon />}
						label={__('Reset', 'voxel-fse')}
						onClick={resetShadow}
						variant="tertiary"
						size="small"
						style={{ minWidth: 'auto', padding: '4px', width: '24px', height: '24px' }}
					/>
				)}
				{/* Edit icon button - opens popup */}
				<Button
					ref={buttonRef}
					icon={<EditIcon />}
					size="small"
					variant="tertiary"
					onClick={handleOpenPopup}
					style={{
						minWidth: 'auto',
						padding: '4px',
						width: '24px',
						height: '24px',
						// Light blue background when value is set (Elementor pattern)
						backgroundColor: hasValue
							? 'color-mix(in srgb, var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9)) 4%, #0000)'
							: undefined,
						borderRadius: hasValue ? '2px' : undefined,
					}}
				/>
			</div>
		</div>
		{isOpen && (
			<div
				ref={popoverRef}
				className="voxel-fse-box-shadow-popup"
				style={{
					position: 'fixed',
					zIndex: 999999,
					backgroundColor: '#fff',
					border: '1px solid #ddd',
					borderRadius: '4px',
					boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
					minWidth: '280px',
					maxWidth: '320px',
					maxHeight: '80vh',
					overflowY: 'auto',
					overflowX: 'hidden',
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
				<div style={{ padding: '16px' }}>
					{/* Color - using reusable ColorPickerControl */}
					<ColorPickerControl
						label={__('Color', 'voxel-fse')}
						value={shadow.color !== undefined ? shadow.color : defaultShadow.color}
						onChange={(value) => handleChange('color', value)}
					/>

					{/* Horizontal Offset - with RangeControl like Elementor */}
					<RangeControl
						label={__('Horizontal', 'voxel-fse')}
						value={shadow.horizontal !== undefined ? shadow.horizontal : defaultShadow.horizontal}
						onChange={(value: number | undefined) => handleChange('horizontal', value)}
						min={-100}
						max={100}
						step={1}
					/>

					{/* Vertical Offset - with RangeControl like Elementor */}
					<RangeControl
						label={__('Vertical', 'voxel-fse')}
						value={shadow.vertical !== undefined ? shadow.vertical : defaultShadow.vertical}
						onChange={(value: number | undefined) => handleChange('vertical', value)}
						min={-100}
						max={100}
						step={1}
					/>

					{/* Blur - with RangeControl like Elementor */}
					<RangeControl
						label={__('Blur', 'voxel-fse')}
						value={shadow.blur !== undefined ? shadow.blur : defaultShadow.blur}
						onChange={(value: number | undefined) => handleChange('blur', value)}
						min={0}
						max={100}
						step={1}
					/>

					{/* Spread - with RangeControl like Elementor */}
					<RangeControl
						label={__('Spread', 'voxel-fse')}
						value={shadow.spread !== undefined ? shadow.spread : defaultShadow.spread}
						onChange={(value: number | undefined) => handleChange('spread', value)}
						min={-100}
						max={100}
						step={1}
					/>

					{/* Position (Outline/Inset) - Elementor style inline layout */}
					<div style={{ marginBottom: '12px', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', alignItems: 'center' }}>
						<label style={{ fontWeight: 500, fontSize: '12px', margin: 0 }}>
							{__('Position', 'voxel-fse')}
						</label>
						<select
							value={shadow.position !== undefined ? shadow.position : defaultShadow.position}
							onChange={(e) => handleChange('position', e.target.value)}
							style={{
								width: '100%',
								padding: '6px 8px',
								border: '1px solid #d5dadf',
								borderRadius: '2px',
								fontSize: '13px',
								backgroundColor: '#fff',
								cursor: 'pointer',
							}}
						>
							<option value="outline">{__('Outline', 'voxel-fse')}</option>
							<option value="inset">{__('Inset', 'voxel-fse')}</option>
						</select>
					</div>
				</div>
			</div>
		)}
	</div>
);
}

