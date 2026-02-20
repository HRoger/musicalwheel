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

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { FilterComponentProps } from '../types';

// noUiSlider is loaded from Voxel parent theme's vendor folder via wp_enqueue_script
// Accessed via window.noUiSlider at runtime (NOT as IIFE parameter)
// This avoids ReferenceError if the script loads after our IIFE
// Evidence: themes/voxel/app/controllers/assets-controller.php:141
const getNoUiSlider = () => (window as any).noUiSlider;

// Type definition for noUiSlider API (since we're using window global, not npm types)
interface NoUiSliderAPI {
	destroy: () => void;
	set: (values: (number | string)[], fireSetEvent?: boolean) => void;
	get: () => (number | string)[];
	on: (event: string, callback: (values: (string | number)[], handle: number) => void) => void;
	off: (event: string) => void;
	updateOptions: (options: Record<string, unknown>, fireSetEvent?: boolean) => void;
}

// Extend HTMLElement to support noUiSlider
interface NoUiSliderElement extends HTMLElement {
	noUiSlider?: NoUiSliderAPI;
}

// Format config from Voxel range-filter.php
interface RangeFormat {
	numeric?: boolean;
	prefix?: string;
	suffix?: string;
}
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

/**
 * Parse Voxel range value to an array of numbers.
 *
 * Voxel's frontend_props() returns value as:
 * - [] (empty array) when no value is set
 * - [number] for single handle
 * - [number, number] for double handle
 * Evidence: voxel/app/post-types/filters/range-filter.php:233
 *
 * URL query strings are serialized as:
 * - "50" (plain number) for single handle
 * - "10..90" (min..max) for double handle
 * Evidence: voxel-search-form.beautified.js line 458
 */
function parseRangeValue(value: unknown): number[] {
	// Handle null/undefined/empty
	if (value === null || value === undefined || value === '') {
		return [];
	}

	// Handle array from Voxel's frontend_props() - [number] or [number, number]
	if (Array.isArray(value)) {
		const nums = value.map(Number).filter(v => !isNaN(v));
		return nums;
	}

	// Handle string format "min..max" (double handle URL query format)
	if (typeof value === 'string' && value.includes('..')) {
		const parts = value.split('..');
		const nums: number[] = [];
		if (parts[0] !== '') {
			const n = Number(parts[0]);
			if (!isNaN(n)) nums.push(n);
		}
		if (parts[1] !== '') {
			const n = Number(parts[1]);
			if (!isNaN(n)) nums.push(n);
		}
		return nums;
	}

	// Handle single numeric value (single handle URL query format: plain number)
	const num = Number(value);
	if (!isNaN(num)) {
		return [num];
	}

	return [];
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
	// Includes repeater item ID for scoped custom styling
	const popupClassName = [
		blockId ? `voxel-popup-${blockId}` : '',
		config.id ? `elementor-repeater-item-${config.id}` : ''
	].filter(Boolean).join(' ');

	const triggerRef = useRef<HTMLElement | null>(null);
	const sliderRef = useRef<NoUiSliderElement | null>(null);
	const sliderInstanceRef = useRef<NoUiSliderAPI | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	const props = filterData.props || {};
	// Voxel's frontend_props() returns range_start/range_end/step_size
	// FSE controller's get_filter_props() returns min/max/step
	// Support both key formats for compatibility
	const originalRangeStart = Number(props['range_start'] ?? props['min'] ?? 0);
	const originalRangeEnd = Number(props['range_end'] ?? props['max'] ?? 100);
	const step = Number(props['step_size'] ?? props['step'] ?? 1);
	const placeholder = String(props['placeholder'] || filterData.label || 'Range');
	const displayAs = config.displayAs || filterData.props?.['display_as'] || 'popup';
	// Voxel default is 'single' - Evidence: range-filter.php:16
	const handles = props['handles'] || 'single';
	const compare = props['compare'] || 'in_range'; // 'in_range' | 'outside_range'

	// Adaptive filtering: Use narrowed range if available
	// Reference: voxel-search-form.beautified.js lines 480-500
	const filterKey = config.filterKey;
	const narrowedRange = narrowedValues?.ranges?.[filterKey];
	const rangeStart = narrowedRange?.min ?? originalRangeStart;
	const rangeEnd = narrowedRange?.max ?? originalRangeEnd;

	// Format configuration from Voxel
	// Voxel passes format as object { numeric: bool, prefix: string, suffix: string }
	// Evidence: range-filter.php:236-240
	const format: RangeFormat = (typeof props['format'] === 'object' && props['format'] !== null) ? (props['format'] as RangeFormat) : { numeric: false, prefix: '', suffix: '' };
	const prefix = format.prefix || '';
	const suffix = format.suffix || '';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Compute default slider values based on handles and compare mode
	// Evidence: voxel-search-form.beautified.js lines 420-428
	const defaultValues: number[] = (handles === 'single'
		? [compare === 'in_range' ? rangeEnd : rangeStart]
		: compare === 'in_range'
			? [rangeStart, rangeEnd]
			: [rangeStart, rangeStart]) as number[];

	// Parse the current filter value into an array of numbers
	const parsedValue = parseRangeValue(value);
	// Use parsed value if it has values, otherwise use defaults
	const initialValue = parsedValue.length > 0 ? parsedValue : defaultValues;

	const [sliderValue, setSliderValue] = useState<number[]>(initialValue);

	// Format a number for display
	// Evidence: voxel-search-form.beautified.js lines 480-485
	// Voxel: if (fmt.numeric) v = v.toLocaleString(); return fmt.prefix + v + fmt.suffix;
	const formatValue = useCallback((val: number): string => {
		const formatted = format.numeric ? val.toLocaleString() : String(val);
		return `${ prefix }${ formatted }${ suffix }`;
	}, [format.numeric, prefix, suffix]);

	// Format an array of values for display (matching Voxel's formatForDisplay)
	// Evidence: voxel-search-form.beautified.js line 482-485
	// val.map(v => { ... }).join(" — ")
	const formatForDisplay = useCallback((vals: number[]): string => {
		return vals.map(v => formatValue(v)).join(' — ');
	}, [formatValue]);

	// Check if filter has a value (not at defaults)
	// Evidence: voxel-search-form.beautified.js lines 468-478
	const isFilled = value !== null && value !== undefined && value !== '';
	const displayValue = isFilled
		? formatForDisplay(parsedValue.length > 0 ? parsedValue : sliderValue)
		: placeholder;

	// Popup display value (always shows current slider state)
	const popupDisplayValue = formatForDisplay(sliderValue);

	// Initialize noUiSlider
	// CRITICAL: Uses refs to capture current values at call time, avoiding stale closure issues
	const initSlider = useCallback(() => {
		if (!sliderRef.current || sliderInstanceRef.current) return;

		// Determine start values and connect based on handles and compare mode
		// Evidence: voxel-search-form.beautified.js lines 420-428
		let startValues: number[];
		let connectValue: number[];

		if (handles === 'single') {
			// Single handle connect: in_range = [1,0], outside_range = [0,1]
			// Evidence: voxel-search-form.beautified.js line 421
			connectValue = compare === 'in_range' ? [1, 0] : [0, 1];
			startValues = [...sliderValue];
		} else {
			// Double handle connect: in_range = [0,1,0], outside_range = [1,0,1]
			// Evidence: voxel-search-form.beautified.js line 426
			connectValue = compare === 'in_range' ? [0, 1, 0] : [1, 0, 1];
			startValues = [...sliderValue];
		}

		const noUiSlider = getNoUiSlider();
		if (!noUiSlider) {
			console.error('noUiSlider not loaded - window.noUiSlider is undefined');
			return;
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

		sliderInstanceRef.current = (sliderRef.current as NoUiSliderElement).noUiSlider as NoUiSliderAPI;

		// Handle slider updates — Voxel stores all handle values as number array
		// Evidence: voxel-search-form.beautified.js line 444-446
		// this.value = values.map((v) => Number(v));
		sliderInstanceRef.current.on('update', (values: (string | number)[]) => {
			setSliderValue(values.map(v => Number(v)));
		});

		// CRITICAL FIX: Force slider position update after initialization
		// In Gutenberg editor, the DOM might not be fully laid out when slider is created
		requestAnimationFrame(() => {
			if (sliderInstanceRef.current) {
				sliderInstanceRef.current.set(startValues, false);
			}
		});
	}, [handles, compare, sliderValue, rangeStart, rangeEnd, step]);

	// Destroy slider on unmount
	const destroySlider = useCallback(() => {
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.destroy();
			sliderInstanceRef.current = null;
		}
	}, []);

	// Sync local state when value changes externally
	useEffect(() => {
		const parsed = parseRangeValue(value);
		const newValues = parsed.length > 0 ? parsed : defaultValues;
		setSliderValue(newValues);

		// Update slider if it exists
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set(newValues, false); // false = don't fire events

			// Force visual update on next frame to ensure slider reflects the change
			// This is especially important for reset operations
			requestAnimationFrame(() => {
				if (sliderInstanceRef.current) {
					sliderInstanceRef.current.set(newValues, false);
				}
			});
		}
	}, [value, rangeStart, rangeEnd, handles, compare]);

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
		return undefined;
	}, [displayAs, initSlider, destroySlider]);

	// Apply adaptive filtering: Update slider range when narrowedValues change
	// Reference: voxel-search-form.beautified.js lines 500-550 (applyAdaptiveValues)
	useEffect(() => {
		if (!sliderInstanceRef.current || !narrowedRange) {
			return;
		}

		// Clamp current values to new range
		const clamped = sliderValue.map(v => {
			if (v < rangeStart) return rangeStart;
			if (v > rangeEnd) return rangeEnd;
			return v;
		});

		// Update slider range and start positions
		sliderInstanceRef.current.updateOptions({
			range: {
				min: rangeStart,
				max: rangeEnd,
			},
			start: clamped,
		});

		setSliderValue(clamped);
	}, [narrowedRange, rangeStart, rangeEnd, handles]);

	const openPopup = useCallback(() => {
		setIsOpen(true);
	}, []);

	/**
	 * Check if the slider value is different from defaults (i.e. filter is "filled")
	 * Evidence: voxel-search-form.beautified.js lines 468-478
	 */
	const checkIsFilled = useCallback((vals: number[]): boolean => {
		if (!vals.length || vals.some(v => typeof v !== 'number')) return false;
		return vals.join('..') !== defaultValues.join('..');
	}, [defaultValues]);

	/**
	 * Serialize range value to Voxel API format
	 * Evidence: voxel-search-form.beautified.js line 458
	 * this.filter.value = this.isFilled() ? this.value.join("..") : null;
	 *
	 * For single handle [50] → "50" (plain number — matches PHP parse_value for single)
	 * For double handle [10, 90] → "10..90"
	 */
	const serializeRangeValue = useCallback((vals: number[]): string | null => {
		if (!checkIsFilled(vals)) {
			return null;
		}
		return vals.join('..');
	}, [checkIsFilled]);

	const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMin = e.target.value === '' ? rangeStart : Number(e.target.value);
		const newValues = [newMin, sliderValue[1] ?? rangeEnd];
		setSliderValue(newValues);
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set(newValues);
		}
		// In minmax mode, save immediately (Voxel uses debounced saveInputs)
		if (displayAs === 'minmax') {
			onChange(serializeRangeValue(newValues));
		}
	};

	const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newMax = e.target.value === '' ? rangeEnd : Number(e.target.value);
		const newValues = [sliderValue[0] ?? rangeStart, newMax];
		setSliderValue(newValues);
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set(newValues);
		}
		// In minmax mode, save immediately
		if (displayAs === 'minmax') {
			onChange(serializeRangeValue(newValues));
		}
	};

	const handleSave = useCallback(() => {
		// Serialize to Voxel API format
		// Evidence: voxel-search-form.beautified.js line 458
		onChange(serializeRangeValue(sliderValue));
		setIsOpen(false);
	}, [sliderValue, serializeRangeValue, onChange]);

	const handleClear = useCallback(() => {
		// Reset to defaults — Evidence: voxel-search-form.beautified.js line 466
		// this.slider.set(this.default)
		setSliderValue(defaultValues);
		if (sliderInstanceRef.current) {
			sliderInstanceRef.current.set(defaultValues);
		}
		onChange(null);
	}, [defaultValues, onChange]);

	// Render min/max input boxes (used in minmax mode only, double handle only)
	// Evidence: range-filter.php:223 - minmax forces popup if not double handle
	const renderMinMaxInputs = () => (
		<div className="ts-minmax">
			<input
				type="number"
				className="inline-input input-no-icon"
				placeholder={String(rangeStart)}
				value={sliderValue[0] ?? rangeStart}
				onChange={handleMinChange}
				min={rangeStart}
				max={typeof sliderValue[1] === 'number' ? sliderValue[1] : rangeEnd}
				step={step}
			/>
			<input
				type="number"
				className="inline-input input-no-icon"
				placeholder={String(rangeEnd)}
				value={sliderValue[1] ?? rangeEnd}
				onChange={handleMaxChange}
				min={typeof sliderValue[0] === 'number' ? sliderValue[0] : rangeStart}
				max={rangeEnd}
				step={step}
			/>
		</div>
	);

	// Render noUiSlider
	// Evidence: themes/voxel/templates/widgets/search-form/range-filter.php:51-55
	const renderSlider = () => (
		<div className={`range-slider-wrapper${isNarrowing ? ' ts-loading' : ''}`}>
			<div className="range-value">{popupDisplayValue}</div>
			<div ref={sliderRef as React.Ref<HTMLDivElement>} className="range-slider"></div>
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
				ref={triggerRef as React.Ref<HTMLDivElement>}
				className={`ts-filter ts-popup-target ${isFilled ? 'ts-filled' : ''}`}
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
				target={triggerRef as React.RefObject<HTMLElement>}
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
						{(filterData as any).description && <small>{(filterData as any).description}</small>}
					</label>
					{renderSlider()}
				</div>
			</FieldPopup>
		</div>
	);
}
