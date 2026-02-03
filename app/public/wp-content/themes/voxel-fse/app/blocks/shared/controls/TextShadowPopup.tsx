/**
 * Text Shadow Popup Component
 *
 * Matches Elementor's text shadow control pattern - label with pencil icon that opens a popup
 * with text shadow controls (color, horizontal, vertical, blur).
 *
 * Similar to BoxShadowPopup but simplified for text shadows (no spread or position).
 *
 * Features:
 * - Content-aware positioning: Opens to the LEFT of the sidebar to avoid covering controls
 * - Uses reusable ColorPickerControl for color selection
 * - Device-change aware: Persists across device changes using window global
 *
 * Evidence:
 * - Elementor pattern: Group_Control_Text_Shadow
 * - Based on: BoxShadowPopup.tsx
 */

import { useState, useRef, useEffect } from 'react';
import { Button, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UndoIcon from '../icons/UndoIcon';
import ColorPickerControl from './ColorPickerControl';

// Edit icon using Elementor's eicon-edit class
const EditIcon = () => (
	<span className="eicon eicon-edit" style={{ fontSize: '14px' }} />
);

interface TextShadowPopupProps {
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

export default function TextShadowPopup({
	label,
	attributes,
	setAttributes,
	shadowAttributeName,
}: TextShadowPopupProps) {
	const [isOpen, setIsOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);

	// Default text shadow values matching Elementor
	const defaultShadow = {
		horizontal: 0,
		vertical: 0,
		blur: 10,
		color: 'rgba(0, 0, 0, 0.5)',
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
				// Close popup when clicking outside
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div className="elementor-control elementor-control-type-text-shadow" style={{ position: 'relative' }}>
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

			{/* Popup */}
			{isOpen && (
				<div
					ref={popoverRef}
					style={{
						position: 'fixed',
						zIndex: 1000000,
						backgroundColor: '#fff',
						border: '1px solid #ddd',
						borderRadius: '4px',
						padding: '16px',
						boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
						width: '280px',
					}}
				>
					<h3 style={{ margin: '0 0 16px', fontSize: '13px', fontWeight: 600 }}>
						{label}
					</h3>

					{/* Color */}
					<ColorPickerControl
						label={__('Color', 'voxel-fse')}
						value={shadow.color || defaultShadow.color}
						onChange={(color) => {
							setAttributes({
								[shadowAttributeName]: {
									...shadow,
									color,
								},
							});
						}}
					/>

					{/* Horizontal */}
					<RangeControl
						label={__('Horizontal', 'voxel-fse')}
						value={shadow.horizontal ?? defaultShadow.horizontal}
						onChange={(value: number | undefined) => {
							setAttributes({
								[shadowAttributeName]: {
									...shadow,
									horizontal: value ?? 0,
								},
							});
						}}
						min={-100}
						max={100}
						step={1}
					/>

					{/* Vertical */}
					<RangeControl
						label={__('Vertical', 'voxel-fse')}
						value={shadow.vertical ?? defaultShadow.vertical}
						onChange={(value: number | undefined) => {
							setAttributes({
								[shadowAttributeName]: {
									...shadow,
									vertical: value ?? 0,
								},
							});
						}}
						min={-100}
						max={100}
						step={1}
					/>

					{/* Blur */}
					<RangeControl
						label={__('Blur', 'voxel-fse')}
						value={shadow.blur ?? defaultShadow.blur}
						onChange={(value: number | undefined) => {
							setAttributes({
								[shadowAttributeName]: {
									...shadow,
									blur: value ?? 0,
								},
							});
						}}
						min={0}
						max={100}
						step={1}
					/>

					{/* Reset styling button */}
					<div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
						<Button
							variant="link"
							isDestructive
							onClick={resetShadow}
							style={{ textDecoration: 'none', fontSize: '12px' }}
						>
							{__('Reset Text Shadow', 'voxel-fse')}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
