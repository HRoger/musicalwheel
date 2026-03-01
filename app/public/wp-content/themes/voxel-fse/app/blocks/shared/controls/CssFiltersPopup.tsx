/**
 * CSS Filters Popup Component
 *
 * Matches Elementor's CSS Filters control pattern - label with pencil icon that opens a popup
 * with filter controls (blur, brightness, contrast, saturation, hue).
 *
 * Features:
 * - Content-aware positioning: Opens to the LEFT of the sidebar to avoid covering controls
 * - Reset button to clear all filters
 * - Compact slider inputs matching Elementor's design
 *
 * Evidence:
 * - Elementor pattern: Container > Style > Background Overlay > CSS Filters
 * - Gutenberg Popover: @wordpress/components
 */

import { useState, useRef, useEffect } from 'react';
import { Button, RangeControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import UndoIcon from '../icons/UndoIcon';

// Edit icon using Elementor's eicon-edit class
const EditIcon = () => (
	<span className="eicon eicon-edit" style={{ fontSize: '14px' }} />
);

declare global {
	interface Window {
		__voxelDeviceChangeTimestamp?: number;
	}
}

export interface CssFiltersValue {
	blur?: number;
	brightness?: number;
	contrast?: number;
	saturation?: number;
	hue?: number;
}

interface CssFiltersPopupProps {
	label: string;
	value: CssFiltersValue;
	onChange: (value: CssFiltersValue) => void;
}

// Default filter values matching Elementor
const defaultFilters: CssFiltersValue = {
	blur: 0,
	brightness: 100,
	contrast: 100,
	saturation: 100,
	hue: 0,
};

export default function CssFiltersPopup({
	label,
	value,
	onChange,
}: CssFiltersPopupProps) {
	const [isOpen, setIsOpen] = useState(false);
	const popoverRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const filters = value || {};

	// Check if any keys exist (for determining whether to apply defaults on open)
	const hasValue = Object.keys(filters).length > 0;

	// Check if any filter value differs from default (show reset only when modified)
	const hasModifiedValue = Object.keys(filters).some((key) => {
		const filterKey = key as keyof CssFiltersValue;
		const currentValue = filters[filterKey];
		const defaultValue = defaultFilters[filterKey];
		return currentValue !== undefined && currentValue !== defaultValue;
	});

	const resetFilters = () => {
		onChange({});
	};

	// Apply default values when opening popup (Elementor behavior)
	const handleOpenPopup = () => {
		if (!isOpen && !hasValue) {
			// Apply defaults immediately when opening for the first time
			onChange({ ...defaultFilters });
		}
		setIsOpen(!isOpen);
	};

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

	const handleChange = (field: keyof CssFiltersValue, newValue: number | undefined) => {
		onChange({ ...filters, [field]: newValue });
	};

	return (
		<div className="elementor-control elementor-control-type-css-filters" style={{ position: 'relative' }}>
			<div className="elementor-control-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
				<span className="elementor-control-title" style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', color: 'rgb(30, 30, 30)', margin: 0 }}>{label}</span>
				<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
					{/* Reset button - only shows when values differ from defaults */}
					{hasModifiedValue && (
						<Button
							icon={<UndoIcon />}
							label={__('Reset', 'voxel-fse')}
							onClick={resetFilters}
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
							// Light blue background when value is modified (Elementor pattern)
							backgroundColor: hasModifiedValue
								? 'color-mix(in srgb, var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9)) 4%, #0000)'
								: undefined,
							borderRadius: hasModifiedValue ? '2px' : undefined,
						}}
					/>
				</div>
			</div>
			{isOpen && (
				<div
					ref={popoverRef}
					className="voxel-fse-css-filters-popup"
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
						{/* Blur */}
						<RangeControl
							label={__('Blur', 'voxel-fse')}
							value={filters.blur !== undefined ? filters.blur : defaultFilters.blur}
							onChange={(val: number | undefined) => handleChange('blur', val)}
							min={0}
							max={20}
							step={0.1}
						/>

						{/* Brightness */}
						<RangeControl
							label={__('Brightness', 'voxel-fse')}
							value={filters.brightness !== undefined ? filters.brightness : defaultFilters.brightness}
							onChange={(val: number | undefined) => handleChange('brightness', val)}
							min={0}
							max={200}
							step={1}
						/>

						{/* Contrast */}
						<RangeControl
							label={__('Contrast', 'voxel-fse')}
							value={filters.contrast !== undefined ? filters.contrast : defaultFilters.contrast}
							onChange={(val: number | undefined) => handleChange('contrast', val)}
							min={0}
							max={200}
							step={1}
						/>

						{/* Saturation */}
						<RangeControl
							label={__('Saturation', 'voxel-fse')}
							value={filters.saturation !== undefined ? filters.saturation : defaultFilters.saturation}
							onChange={(val: number | undefined) => handleChange('saturation', val)}
							min={0}
							max={200}
							step={1}
						/>

						{/* Hue */}
						<RangeControl
							label={__('Hue', 'voxel-fse')}
							value={filters.hue !== undefined ? filters.hue : defaultFilters.hue}
							onChange={(val: number | undefined) => handleChange('hue', val)}
							min={0}
							max={360}
							step={1}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
