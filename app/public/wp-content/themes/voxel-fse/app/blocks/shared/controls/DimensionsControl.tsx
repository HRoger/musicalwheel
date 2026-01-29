/**
 * Dimensions Control Component
 * 
 * Elementor-style dimensions control with link/constrain functionality.
 * Displays 4 input fields (Top, Right, Bottom, Left) with unit dropdown and link button.
 * 
 * Evidence:
 * - Elementor pattern: app/public/wp-content/plugins/elementor/includes/controls/dimensions.php
 * - GenerateBlocks reference: app/public/wp-content/plugins/generateblocks/src/components/dimensions/index.js
 */

import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
// Button, TextControl removed as they were unused imports
import UnitDropdownButton, { type UnitType } from './UnitDropdownButton';

// No icon components needed - using CSS :before with dashicons

interface DimensionsControlProps {
	label?: string;
	values: {
		top?: string | number;
		right?: string | number;
		bottom?: string | number;
		left?: string | number;
	};
	onChange: (values: { top?: string; right?: string; bottom?: string; left?: string }) => void;
	isLinked?: boolean;
	onLinkedChange?: (linked: boolean) => void;
	availableUnits?: UnitType[];
	controls?: React.ReactNode;
}

// Helper to convert values to strings (empty if not set)
// Only normalizes undefined/null/empty - preserves explicit "0" values
function normalizeValues(values: DimensionsControlProps['values']): { top: string; right: string; bottom: string; left: string } {
	const normalize = (val: string | number | undefined): string => {
		// Only normalize undefined/null/empty - preserve all other values including "0"
		if (val === undefined || val === null || val === '') {
			return '';
		}
		return String(val).trim();
	};

	return {
		top: normalize(values.top),
		right: normalize(values.right),
		bottom: normalize(values.bottom),
		left: normalize(values.left),
	};
}

/**
 * Parse value to extract number and unit
 * Returns null if value is empty/undefined (not set)
 */
function parseValue(value: string | number | undefined): { num: number | null; unit: UnitType } | null {
	if (!value || value === '' || value === null || value === undefined) {
		return null; // Empty value - not set
	}

	const str = String(value);
	const match = str.match(/^([\d.]+)(px|%|em|rem|vw|vh)?$/);

	if (match) {
		const num = parseFloat(match[1]);
		if (isNaN(num)) return null;
		return {
			num: num,
			unit: (match[2] as UnitType) || 'px'
		};
	}

	// If it's just a number, assume px
	const num = parseFloat(str);
	if (isNaN(num)) return null;
	return { num: num, unit: 'px' };
}

/**
 * Format number and unit to string
 * Returns '0' if num is 0 (explicit zero value)
 */
function formatValue(num: number, unit: UnitType): string {
	return `${num}${unit}`;
}

export default function DimensionsControl({
	label = __('Padding', 'voxel-fse'),
	values: rawValues,
	onChange,
	isLinked: externalIsLinked,
	onLinkedChange,
	availableUnits = ['px', '%', 'em'],
	controls,
}: DimensionsControlProps) {
	// Normalize values to strings
	const values = normalizeValues(rawValues);

	// Parse all values
	const topParsed = parseValue(values.top);
	const rightParsed = parseValue(values.right);
	const bottomParsed = parseValue(values.bottom);
	const leftParsed = parseValue(values.left);


	// Unused variables removed


	// Internal state for linked (use external if provided, otherwise default to true)
	const [internalLinked, setInternalLinked] = useState(true);
	const isLinked = externalIsLinked !== undefined ? externalIsLinked : internalLinked;

	// Current unit (use first non-empty value's unit, or default to px)
	const currentUnit = topParsed?.unit || rightParsed?.unit || bottomParsed?.unit || leftParsed?.unit || 'px';
	const [unit, setUnit] = useState<UnitType>(currentUnit);

	// Update unit state when values change
	useEffect(() => {
		const firstUnit = topParsed?.unit || rightParsed?.unit || bottomParsed?.unit || leftParsed?.unit;
		if (firstUnit) setUnit(firstUnit);
	}, [values.top, values.right, values.bottom, values.left]);

	// Track last focused input
	const [lastFocused, setLastFocused] = useState<'top' | 'right' | 'bottom' | 'left'>('top');

	/**
	 * Handle input change
	 */
	const handleInputChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
		// If empty, set to empty string (not 0)
		if (value === '' || value === null || value === undefined) {
			if (isLinked) {
				// Clear all when linked
				onChange({
					top: '',
					right: '',
					bottom: '',
					left: '',
				});
			} else {
				// Clear only the changed side
				const newValues: { top?: string; right?: string; bottom?: string; left?: string } = { ...values };
				newValues[side] = '';
				onChange(newValues);
			}
			return;
		}

		const num = parseFloat(value);
		if (isNaN(num)) return; // Invalid number

		if (isLinked) {
			// Update all sides with same value
			onChange({
				top: formatValue(num, unit),
				right: formatValue(num, unit),
				bottom: formatValue(num, unit),
				left: formatValue(num, unit),
			});
		} else {
			// Update only the changed side
			const newValues: { top?: string; right?: string; bottom?: string; left?: string } = { ...values };
			newValues[side] = formatValue(num, unit);
			onChange(newValues);
		}
	};

	/**
	 * Handle unit change
	 */
	const handleUnitChange = (newUnit: UnitType) => {
		setUnit(newUnit);

		// Convert all values to new unit (preserve numbers, change unit)
		// Only convert values that are actually set (not empty)
		const newValues: { top?: string; right?: string; bottom?: string; left?: string } = {};

		const sides: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
		sides.forEach((side) => {
			const parsed = parseValue(values[side]);
			// Only set value if it was actually set (not null/empty) and num is not null
			if (parsed !== null && parsed.num !== null) {
				newValues[side] = formatValue(parsed.num, newUnit);
			}
			// If parsed is null, leave that side empty (don't set it)
		});

		onChange(newValues);
	};

	/**
	 * Toggle link state
	 */
	const toggleLink = () => {
		const newLinked = !isLinked;

		if (onLinkedChange) {
			onLinkedChange(newLinked);
		} else {
			setInternalLinked(newLinked);
		}

		if (newLinked) {
			// When linking, find the first non-empty value to sync from
			// Check all sides, not just last focused (in case last focused is empty)
			const sides: Array<'top' | 'right' | 'bottom' | 'left'> = ['top', 'right', 'bottom', 'left'];
			let syncValue: { num: number; unit: UnitType } | null = null;

			// First try last focused, then check all others
			const lastValue = parseValue(values[lastFocused]);
			if (lastValue !== null && lastValue.num !== null) {
				syncValue = { num: lastValue.num, unit: lastValue.unit };
			} else {
				// Find first non-empty value
				for (const side of sides) {
					const parsed = parseValue(values[side]);
					if (parsed !== null && parsed.num !== null) {
						syncValue = { num: parsed.num, unit: parsed.unit };
						break;
					}
				}
			}

			// If no values are set, don't change anything - just toggle the link state
			if (syncValue === null) {
				return; // Don't modify values, just toggle link state
			}

			// Only sync if there's an actual value
			onChange({
				top: formatValue(syncValue.num, syncValue.unit),
				right: formatValue(syncValue.num, syncValue.unit),
				bottom: formatValue(syncValue.num, syncValue.unit),
				left: formatValue(syncValue.num, syncValue.unit),
			});
			setUnit(syncValue.unit);
		}
		// When unlinking, don't change any values - just toggle the link state
	};

	return (
		<div className="voxel-fse-dimensions-control" style={{ marginBottom: '16px' }}>
			{/* Title Row: Label (left) + Unit Dropdown (right corner) */}
			<div style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				marginBottom: '8px'
			}}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					{/* Label */}
					{label && (
						<label style={{
							fontSize: '13px',
							fontWeight: 500,
							color: '#1e1e1e',
							marginRight: '8px',
						}}>
							{label}
						</label>
					)}
					{controls}
				</div>

				{/* Unit Dropdown (right corner) - only show if availableUnits is not empty */}
				{availableUnits && availableUnits.length > 0 && (
					<UnitDropdownButton
						currentUnit={unit as any}
						onUnitChange={handleUnitChange as any}
						availableUnits={availableUnits}
					/>
				)}
			</div>

			{/* Input Fields Row with Link button on right */}
			<div
				style={{
					display: 'flex',
					gap: '4px',
					alignItems: 'flex-start',
				}}
			>
				{/* Input Fields Grid */}
				<div
					className="voxel-fse-dimensions-control__inputs"
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(4, 1fr)',
						gap: '0',
						flex: 1,
					}}
				>
					{/* Top */}
					<div>
						<input
							type="number"
							value={isLinked ? (topParsed !== null && topParsed.num !== null ? String(topParsed.num) : '') : (topParsed !== null && topParsed.num !== null ? String(topParsed.num) : '')}
							onChange={(e) => handleInputChange('top', e.target.value)}
							onFocus={() => setLastFocused('top')}
							placeholder=""
							className="voxel-fse-dimension-input"
						/>
						<div style={{ fontSize: '11px', color: '#757575', textAlign: 'center', marginTop: '4px' }}>
							{__('Top', 'voxel-fse')}
						</div>
					</div>

					{/* Right */}
					<div>
						<input
							type="number"
							value={isLinked ? (topParsed !== null && topParsed.num !== null ? String(topParsed.num) : '') : (rightParsed !== null && rightParsed.num !== null ? String(rightParsed.num) : '')}
							onChange={(e) => handleInputChange('right', e.target.value)}
							onFocus={() => setLastFocused('right')}
							placeholder=""
							className="voxel-fse-dimension-input"
						/>
						<div style={{ fontSize: '11px', color: '#757575', textAlign: 'center', marginTop: '4px' }}>
							{__('Right', 'voxel-fse')}
						</div>
					</div>

					{/* Bottom */}
					<div>
						<input
							type="number"
							value={isLinked ? (topParsed !== null && topParsed.num !== null ? String(topParsed.num) : '') : (bottomParsed !== null && bottomParsed.num !== null ? String(bottomParsed.num) : '')}
							onChange={(e) => handleInputChange('bottom', e.target.value)}
							onFocus={() => setLastFocused('bottom')}
							placeholder=""
							className="voxel-fse-dimension-input"
						/>
						<div style={{ fontSize: '11px', color: '#757575', textAlign: 'center', marginTop: '4px' }}>
							{__('Bottom', 'voxel-fse')}
						</div>
					</div>

					{/* Left */}
					<div>
						<input
							type="number"
							value={isLinked ? (topParsed !== null && topParsed.num !== null ? String(topParsed.num) : '') : (leftParsed !== null && leftParsed.num !== null ? String(leftParsed.num) : '')}
							onChange={(e) => handleInputChange('left', e.target.value)}
							onFocus={() => setLastFocused('left')}
							placeholder=""
							className="voxel-fse-dimension-input"
						/>
						<div style={{ fontSize: '11px', color: '#757575', textAlign: 'center', marginTop: '4px' }}>
							{__('Left', 'voxel-fse')}
						</div>
					</div>
				</div>

				{/* Controls on the right: Link button only */}
				<div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '1px' }}>
					{/* Link/Constrain Button */}
					<button
						type="button"
						onClick={toggleLink}
						className={`voxel-fse-dimensions-control__link ${isLinked ? 'is-linked' : 'is-unlinked'}`}
						title={isLinked ? __('Unlink values', 'voxel-fse') : __('Link values together', 'voxel-fse')}
						style={{
							minWidth: 'auto',
							padding: '0',
							width: '24px',
							height: '25px',
							border: 'none',
							background: 'color-mix(in srgb, var(--wp-components-color-accent, var(--wp-admin-theme-color, #3858e9)) 4%, transparent)',
							borderRadius: '2px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<span className={isLinked ? 'la-link' : 'la-unlink'}></span>
					</button>
				</div>
			</div>

			{/* CSS for Line Awesome icons link/unlink and input styling */}
			<style>{`
				.voxel-fse-dimensions-control__link .la-link::before,
				.voxel-fse-dimensions-control__link .la-unlink::before {
					font-family: 'Line Awesome Free';
					font-weight: 900;
					font-size: 14px;
					color: #005a87;
				}
				.voxel-fse-dimensions-control__link .la-link::before {
					content: "\\f0c1";
				}
				.voxel-fse-dimensions-control__link .la-unlink::before {
					content: "\\f127";
				}
				.voxel-fse-dimension-input {
					width: 100%;
					height: 25px;
					padding: 0 6px;
					border: 1px solid #949494;
					border-radius: 2px;
					font-size: 13px;
					text-align: center;
					line-height: 23px;
					outline: none;
					box-sizing: border-box;
				}
				.voxel-fse-dimensions-control__inputs > div:not(:last-child) .voxel-fse-dimension-input {
					border-right-width: 0;
					border-top-right-radius: 0 !important;
					border-bottom-right-radius: 0 !important;
				}
				.voxel-fse-dimensions-control__inputs > div:not(:first-child) .voxel-fse-dimension-input {
					border-top-left-radius: 0 !important;
					border-bottom-left-radius: 0 !important;
				}
				.voxel-fse-dimension-input:focus {
					border-color: #007cba !important;
					border-right: 1px solid #007cba !important;
					box-shadow: none !important;
					outline: none !important;
					z-index: 1;
					position: relative;
				}
			`}</style>
		</div>
	);
}

