/**
 * FilterRange Component
 *
 * Range slider filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/range-filter.php
 *
 * CRITICAL: Supports 3 display modes based on config.displayAs:
 * 1. Minmax mode (line 2-26): Two number input boxes inline (display_as === 'minmax')
 * 2. Inline mode (line 27-34): Range slider rendered inline (display_as === 'inline')
 * 3. Popup mode (line 35-58): Range slider inside FieldPopup (default)
 *
 * Uses noUiSlider library (same as Voxel)
 * Evidence: themes/voxel/app/controllers/assets-controller.php:141
 *
 * ADAPTIVE FILTERING (Voxel Parity):
 * When narrowedValues is provided, the slider range is updated dynamically
 * based on the current search results.
 * Reference: voxel-search-form.beautified.js lines 480-550 (applyAdaptiveValues)
 *
 * @package VoxelFSE
 */

import { useState, useEffect, useRef, useCallback } from 'react';
// noUiSlider is loaded as external from Voxel parent theme
// Evidence: themes/voxel/app/controllers/assets-controller.php:134,141
// Import map in Block_Loader.php maps 'nouislider' to window.noUiSlider
import noUiSlider from 'nouislider';
import type { FilterComponentProps } from '../types';

// Type definition for noUiSlider API (since we're using external, not npm types)
interface NoUiSliderAPI {
	destroy: () => void;
	set: (values: (number | string)[], fireSetEvent?: boolean) => void;
	get: () => (number | string)[];
	on: (event: string, callback: (values: (string | number)[], handle: number) => void) => void;
	off: (event: string) => void;
	updateOptions: (options: Record<string, unknown>, fireSetEvent?: boolean) => void;
}
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface RangeValue {
	min?: number;
	max?: number;
}

/**
 * Parse Voxel range string format "min..max" to object
 * Evidence: voxel-search-form.beautified.js line 437
 */
function parseRangeValue(value: unknown, rangeStart: number, rangeEnd: number): { min: number; max: number } {
	// Handle null/undefined
	if (value === null || value === undefined || value === '') {
		return { min: rangeStart, max: rangeEnd };
	}

	// Handle string format "min..max" (Voxel API format)
	if (typeof value === 'string' && value.includes('..')) {
		const parts = value.split('..');
		const min = parts[0] !== '' ? Number(parts[0]) : rangeStart;
		const max = parts[1] !== '' ? Number(parts[1]) : rangeEnd;
		return {
			min: isNaN(min) ? rangeStart : min,
			max: isNaN(max) ? rangeEnd : max,
		};
	}

	// Handle legacy object format (backward compatibility)
	if (typeof value === 'object') {
		const obj = value as RangeValue;
		return {
			min: obj.min ?? rangeStart,
			max: obj.max ?? rangeEnd,
		};
	}

	// Handle single number
	if (typeof value === 'number') {
		return { min: value, max: rangeEnd };
	}

	return { min: rangeStart, max: rangeEnd };
}

export default function FilterRange({
	config,
	filterData,
	value,
	onChange,
	blockId,
	narrowedValues,
	isNarrowing,
}: FilterComponentProps) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${blockId}` : '';

	const triggerRef = useRef<HTMLDivElement>(null);
	const sliderRef = useRef<HTMLDivElement>(null);
	const sliderInstanceRef = useRef<NoUiSliderAPI | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const props = filterData.props || {};
	const originalRangeStart = props.min ?? 0;
	const originalRangeEnd = props.max ?? 100;
	const step = props.step ?? 1;
	const placeholder = props.placeholder || filterData.label || 'Range';
	const displayAs = config.displayAs || filterData.props?.display_as || 'popup';
	const handles = props.handles || 'double'; // 'single' or 'double'
	const compare = props.compare || 'in_range'; // 'in_range' | 'greater_than' | 'less_than'

	// Adaptive filtering: Use narrowed range if available
	// Reference: voxel-search-form.beautified.js lines 480-500
	const filterKey = config.filterKey;
	const narrowedRange = narrowedValues?.ranges?.[filterKey];
	const rangeStart = narrowedRange?.min ?? originalRangeStart;
	const rangeEnd = narrowedRange?.max ?? originalRangeEnd;

	// Format configuration from Voxel
	const format = props.format || 'number';
	const prefix = props.prefix || '';
	const suffix = props.suffix || '';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Parse value using Voxel string format "min..max"
	const rangeValue = parseRangeValue(value, rangeStart, rangeEnd);
	const [localMin, setLocalMin] = useState<number>(rangeValue.min);
	const [localMax, setLocalMax] = useState<number>(rangeValue.max);

	// Format display value
	const formatValue = useCallback((val: number): string => {
		if (format === 'price') {
			return `${prefix}${val.toLocaleString()}${suffix}`;
		}
		return `${prefix}${val}${suffix}`;
	}, [format, prefix, suffix]);

	// Display value for trigger button
	// Check if value is set (not null/empty and different from defaults)
	const hasValue = value !== null && value !== undefined && value !== '' &&
		(rangeValue.min !== rangeStart || rangeValue.max !== rangeEnd);
	const displayValue = hasValue
		? `${formatValue(rangeValue.min)} — ${formatValue(rangeValue.max)}`
		: placeholder;

	// Popup display value (always shows current slider state)
	const popupDisplayValue = `${formatValue(localMin)} — ${formatValue(localMax)}`;

	// Initialize noUiSlider
	// CRITICAL: Uses refs to capture current values at call time, avoiding stale closure issues
	const initSlider = useCallback(() => {
		if (!sliderRef.current || sliderInstanceRef.current) return;

		// Read current values from state at call time
		// Using rangeStart/rangeEnd from closure is safe since they rarely change
		const currentMin = localMin;
		const currentMax = localMax;

		// Determine start values and connect based on handles and compare mode
		// Evidence: voxel-search-form.beautified.js lines 399-408
		let startValues: number[];
		let connectValue: boolean | boolean[];

		if (handles === 'double') {
			startValues = [currentMin, currentMax];
			connectValue = true; // Fill between handles
		} else {
			// Single handle mode - depends on compare mode
			if (compare === 'in_range') {
				startValues = [currentMax]; // Start at max
				connectValue = [false, true]; // Fill from handle to right
			} else {
				// 'greater_than' or 'less_than'
				startValues = [currentMin]; // Start at min
				connectValue = [true, false]; // Fill from left to handle
			}
		}

		noUiSlider.create(sliderRef.current, {
			start: startValues,
			connect: connectValue,
			range: {
				min: rangeStart,
				max: rangeEnd,
			},
			step: step,
			// Match Voxel's slider behavior
			behaviour: 'tap-drag',
		});

		sliderInstanceRef.current = sliderRef.current.noUiSlider as NoUiSliderAPI;

		// Handle slider updates
		sliderInstanceRef.current.on('update', (values: (string | number)[]) => {
			if (handles === 'double') {
				setLocalMin(Math.round(Number(values[0])));
				setLocalMax(Math.round(Number(values[1])));
			} else if (compare === 'in_range') {
				// Single handle in_range mode updates max
				setLocalMax(Math.round(Number(values[0])));
			} else {
				// Single handle greater_than/less_than mode updates min
				setLocalMin(Math.round(Number(values[0])));
			}
		});

		// CRITICAL FIX: Force slider position update after initialization
		// In Gutenberg editor, the DOM might not be fully laid out when slider is created
		// This ensures handles are correctly positioned after the slider renders
		requestAnimationFrame(() => {
			if (sliderInstanceRef.current) {
				if (handles === 'double') {
					sliderInstanceRef.current.set([currentMin, currentMax], false);
				} else {
					sliderInstanceRef.current.set([currentMin], false);
				}
			}
		});
	}, [handles, compare, localMin, localMax, rangeStart, rangeEnd, step]);

	// Destroy slider on unmount
	const destroySlider = useCallback(() => {
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.destroy();
			sliderInstanceRef.current = null;
		}
	}, []);

	// Sync local state when value changes externally
	useEffect(() => {
		// Parse value using Voxel string format "min..max"
		const rv = parseRangeValue(value, rangeStart, rangeEnd);
		setLocalMin(rv.min);
		setLocalMax(rv.max);

		// Update slider if it exists
		if (sliderInstanceRef.current) {
			const newValues = handles === 'double' ? [rv.min, rv.max] : [rv.min];
			sliderInstanceRef.current.set(newValues, false); // false = don't fire events

			// Force visual update on next frame to ensure slider reflects the change
			// This is especially important for reset operations
			requestAnimationFrame(() => {
				if (sliderInstanceRef.current) {
					sliderInstanceRef.current.set(newValues, false);
				}
			});
		}
	}, [value, rangeStart, rangeEnd, handles]);

	// Initialize slider when popup opens (for popup mode)
	useEffect(() => {
		if (isOpen && displayAs === 'popup') {
			// Longer delay for Gutenberg editor - DOM needs more time to layout in portal
			// Evidence: Editor uses portals for popups which have delayed rendering
			const timer = setTimeout(() => {
				initSlider();
			}, 100);
			return () => clearTimeout(timer);
		}
		return () => {
			if (displayAs === 'popup') {
				destroySlider();
			}
		};
	}, [isOpen, displayAs, initSlider, destroySlider]);

	// Initialize slider for inline mode on mount
	useEffect(() => {
		if (displayAs === 'inline') {
			initSlider();
			return () => destroySlider();
		}
	}, [displayAs, initSlider, destroySlider]);

	// Apply adaptive filtering: Update slider range when narrowedValues change
	// Reference: voxel-search-form.beautified.js lines 500-550 (applyAdaptiveValues)
	useEffect(() => {
		if (!sliderInstanceRef.current || !narrowedRange) {
			return;
		}

		// Update slider range to narrowed bounds
		sliderInstanceRef.current.updateOptions({
			range: {
				min: rangeStart,
				max: rangeEnd,
			},
		}, true); // true = don't fire slide event

		// Clamp current values to new range
		// Reference: voxel-search-form.beautified.js lines 520-530
		let newMin = localMin;
		let newMax = localMax;

		if (newMin < rangeStart) newMin = rangeStart;
		if (newMin > rangeEnd) newMin = rangeEnd;
		if (handles === 'double') {
			if (newMax < rangeStart) newMax = rangeStart;
			if (newMax > rangeEnd) newMax = rangeEnd;
			if (newMin > newMax) newMin = newMax;
		}

		// Update slider handles
		if (handles === 'double') {
			sliderInstanceRef.current.set([newMin, newMax]);
		} else {
			sliderInstanceRef.current.set([newMin]);
		}

		setLocalMin(newMin);
		setLocalMax(newMax);
	}, [narrowedRange, rangeStart, rangeEnd, handles]);

	const openPopup = useCallback(() => {
		setIsOpen(true);
	}, []);

	/**
	 * Serialize range value to Voxel API format: "min..max"
	 * Evidence: voxel-search-form.beautified.js line 437
	 * this.filter.value = this.value.join("..");
	 */
	const serializeRangeValue = useCallback((min: number, max: number): string | null => {
		// If both values are at defaults, return null to clear filter
		if (min === rangeStart && max === rangeEnd) {
			return null;
		}
		// Voxel format: "min..max" for double handles
		// For single handle with compare modes, still use ".." format
		if (handles === 'double') {
			return `${min}..${max}`;
		}
		// Single handle: min only (greater_than) or max only (less_than)
		if (compare === 'greater_than' || compare === 'in_range') {
			return `${min}..`;
		}
		return `..${max}`;
	}, [handles, compare, rangeStart, rangeEnd]);

	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMin = e.target.value === '' ? rangeStart : Number(e.target.value);
		setLocalMin(newMin);
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set(handles === 'double' ? [newMin, localMax] : [newMin]);
		}
		// In minmax mode, save immediately with Voxel-format string
		if (displayAs === 'minmax') {
			onChange(serializeRangeValue(newMin, localMax));
		}
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMax = e.target.value === '' ? rangeEnd : Number(e.target.value);
		setLocalMax(newMax);
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set([localMin, newMax]);
		}
		// In minmax mode, save immediately with Voxel-format string
		if (displayAs === 'minmax') {
			onChange(serializeRangeValue(localMin, newMax));
		}
	};

	const handleSave = useCallback(() => {
		// Serialize to Voxel API format: "min..max"
		// Evidence: voxel-search-form.beautified.js line 437
		onChange(serializeRangeValue(localMin, localMax));
		setIsOpen(false);
	}, [localMin, localMax, serializeRangeValue, onChange]);

	const handleClear = useCallback(() => {
		setLocalMin(rangeStart);
		setLocalMax(rangeEnd);
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set(handles === 'double' ? [rangeStart, rangeEnd] : [rangeStart]);
		}
		onChange(null);
	}, [rangeStart, rangeEnd, handles, onChange]);

	// Render min/max input boxes (used in minmax mode only)
	const renderMinMaxInputs = () => (
		<div className="ts-minmax">
			<input
				type="number"
				className="inline-input input-no-icon"
				placeholder={String(rangeStart)}
				value={localMin}
				onChange={handleMinChange}
				min={rangeStart}
				max={localMax}
				step={step}
			/>
			{handles === 'double' && (
				<input
					type="number"
					className="inline-input input-no-icon"
					placeholder={String(rangeEnd)}
					value={localMax}
					onChange={handleMaxChange}
					min={localMin}
					max={rangeEnd}
					step={step}
				/>
			)}
		</div>
	);

	// Render noUiSlider
	// Evidence: themes/voxel/templates/widgets/search-form/range-filter.php:51-55
	const renderSlider = () => (
		<div className={`range-slider-wrapper${isNarrowing ? ' ts-loading' : ''}`}>
			<div className="range-value">{popupDisplayValue}</div>
			<div ref={sliderRef} className="range-slider"></div>
			{ /* Show narrowed range indicator if different from original */}
			{narrowedRange && (narrowedRange.min !== originalRangeStart || narrowedRange.max !== originalRangeEnd) && (
				<div className="range-narrowed-indicator">
					<small>Showing {formatValue(rangeStart)} — {formatValue(rangeEnd)} based on current results</small>
				</div>
			)}
		</div>
	);

	// MODE 1: Minmax mode - Two input boxes rendered inline
	// Evidence: themes/voxel/templates/widgets/search-form/range-filter.php line 2-26
	if (displayAs === 'minmax' && handles === 'double') {
		const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');
		return (
			<div className={className} style={style}>
				{!config.hideLabel && <label>{filterData.label}</label>}
				{renderMinMaxInputs()}
			</div>
		);
	}

	// MODE 2: Inline mode - Range slider rendered inline
	// Evidence: themes/voxel/templates/widgets/search-form/range-filter.php line 27-34
	if (displayAs === 'inline') {
		const { style, className } = getFilterWrapperStyles(config, 'ts-form-group ts-inline-filter');
		return (
			<div className={className} style={style}>
				{!config.hideLabel && <label>{filterData.label}</label>}
				{renderSlider()}
			</div>
		);
	}

	// MODE 3: Popup mode (default) - Range slider inside FieldPopup
	// Evidence: themes/voxel/templates/widgets/search-form/range-filter.php line 35-58
	const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');
	const popupStyles = getPopupStyles(config);

	return (
		<div className={className} style={style}>
			{!config.hideLabel && <label>{filterData.label}</label>}

			{ /* Trigger button */}
			<div
				ref={triggerRef}
				className={`ts-filter ts-popup-target ${hasValue ? 'ts-filled' : ''}`}
				onClick={openPopup}
				onMouseDown={(e) => e.preventDefault()}
				role="button"
				tabIndex={0}
			>
				{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */}
				{ /* If no icon configured, show NO icon (not a default fallback) */}
				{filterIcon && (
					<span dangerouslySetInnerHTML={{ __html: filterIcon }} />
				)}
				<div className="ts-filter-text">{displayValue}</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* Portal-based popup using FieldPopup from create-post */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef}
				title=""
				icon={filterIcon}
				saveLabel="Save"
				clearLabel="Clear"
				showClear={true}
				onSave={handleSave}
				onClear={handleClear}
				onClose={() => setIsOpen(false)}
				className={`${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}`}
				popupStyle={popupStyles.style}
			>
				{ /* Popup content - noUiSlider matching Voxel structure */}
				{ /* Evidence: themes/voxel/templates/widgets/search-form/range-filter.php:51-56 */}
				<div className="ts-form-group">
					<label>
						{filterData.label}
						{filterData.description && <small>{filterData.description}</small>}
					</label>
					{renderSlider()}
				</div>
			</FieldPopup>
		</div>
	);
}
