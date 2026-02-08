/**
 * FilterAvailability Component
 *
 * Availability filter for booking/scheduling matching Voxel's HTML structure exactly.
 *
 * REUSES: FieldPopup and DatePicker from create-post block
 * - Portal-based popup positioning
 * - Pikaday calendar (Voxel's custom fork)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup, DatePicker } from '@shared';

interface AvailabilityValue {
	date?: string; // Single mode: "YYYY-MM-DD", Range mode: "YYYY-MM-DD..YYYY-MM-DD"
	start?: string; // Range mode start date
	end?: string; // Range mode end date
	slots?: number;
}

/**
 * Parse Voxel availability value - can be string or object
 * Evidence: voxel-search-form.beautified.js line 985
 */
function parseAvailabilityValue(value: unknown): { date: string; slots: number } {
	// Handle null/undefined
	if (value === null || value === undefined || value === '') {
		return { date: '', slots: 1 };
	}

	// Handle string format (Voxel API format)
	if (typeof value === 'string') {
		return { date: value, slots: 1 };
	}

	// Handle legacy object format
	if (typeof value === 'object') {
		const obj = value as AvailabilityValue;
		return {
			date: obj.date || '',
			slots: obj.slots || 1,
		};
	}

	return { date: '', slots: 1 };
}

// Helper to convert string to Date
const stringToDate = (dateString: string | null): Date | null => {
	if (!dateString) return null;
	try {
		const date = new Date(dateString + 'T00:00:00');
		return isFinite(date.getTime()) ? date : null;
	} catch {
		return null;
	}
};

// Helper to convert Date to YYYY-MM-DD string
const dateToString = (date: Date | null): string | null => {
	if (!date) return null;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

// Helper to format date for display (abbreviated format matching Voxel)
// Voxel uses Voxel.helpers.dateFormat() which abbreviates month names
// Example: "28 Dec 2025" instead of "28 December 2025"
const formatDateForDisplay = (dateString: string | null): string => {
	if (!dateString) return '';
	try {
		const date = new Date(dateString + 'T00:00:00');
		if (!isFinite(date.getTime())) return '';
		// Use abbreviated month format to match Voxel
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short', // Changed from 'long' to 'short' for abbreviation
			day: 'numeric',
		});
	} catch {
		return dateString;
	}
};

export default function FilterAvailability({
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps) {
	// Generate popup className for styling portal elements (renders at document.body)
	// Includes repeater item ID for scoped custom styling
	const popupClassName = [
		blockId ? `voxel-popup-${blockId}` : '',
		config.id ? `elementor-repeater-item-${config.id}` : ''
	].filter(Boolean).join(' ');
	const triggerRef = useRef<HTMLDivElement>(null);
	const pickerInstanceRef = useRef<any>(null); // Store Pikaday instance for setStartRange/setEndRange
	const [isOpen, setIsOpen] = useState(false);

	const props = filterData.props || {};
	// Voxel uses 'inputMode' with values 'single-date' or 'date-range'
	// Evidence: themes/voxel/app/post-types/filters/availability-filter.php:269
	const inputMode = props.inputMode || 'date-range'; // Default to date-range for bookings
	const isRangeMode = inputMode === 'date-range';
	const l10n = props.l10n || {};
	// Evidence: availability-filter.php:19 — PHP default is 'Choose date'
	const placeholder = l10n.pickDate || filterData.label || 'Choose date';

	// Evidence: availability-filter.php:278 — presets array from get_chosen_presets()
	// Each preset: { key: string, label: string }
	// Presets render as separate quick-select buttons (range mode only)
	// Evidence: availability-filter.php template lines 2-12
	const presets: Array<{ key: string; label: string }> = props.presets || [];

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Parse incoming value using Voxel format
	const parsed = parseAvailabilityValue(value);

	// For range mode, parse the "start..end" format
	// Evidence: voxel-search-form.beautified.js line 985
	const currentDate = parsed.date;
	const currentSlots = parsed.slots;

	let startDate = '';
	let endDate = '';
	if (isRangeMode && currentDate && currentDate.includes('..')) {
		[startDate, endDate] = currentDate.split('..');
	} else if (!isRangeMode && currentDate) {
		startDate = currentDate;
	}

	// Internal state
	const [pickerDate, setPickerDate] = useState<Date | null>(() => stringToDate(startDate));
	const [pickerEndDate, setPickerEndDate] = useState<Date | null>(() => stringToDate(endDate));
	const [activePicker, setActivePicker] = useState<'start' | 'end'>('start'); // For range mode
	const [localSlots, setLocalSlots] = useState(currentSlots);

	// Sync when popup opens
	useEffect(() => {
		if (isOpen) {
			if (isRangeMode && currentDate && currentDate.includes('..')) {
				const [start, end] = currentDate.split('..');
				setPickerDate(stringToDate(start));
				setPickerEndDate(stringToDate(end));
			} else if (!isRangeMode && currentDate) {
				setPickerDate(stringToDate(currentDate));
			}
			setLocalSlots(currentSlots);
			setActivePicker('start');
		}
	}, [isOpen, isRangeMode, currentDate, currentSlots]);

	const openPopup = useCallback(() => {
		setIsOpen(true);
	}, []);

	// Range mode: Handle date selection with activePicker toggle
	// Evidence: voxel-search-form.beautified.js lines 954-965
	// FIX: If user selects a date before check-in while in 'end' mode, reset to new check-in
	const handleDateChange = useCallback((date: Date | null) => {
		if (isRangeMode && date && pickerInstanceRef.current) {
			if (activePicker === 'start') {
				// Set start date, switch to end picker
				// Evidence: lines 956-959
				setPickerDate(date);
				setActivePicker('end');
				pickerInstanceRef.current.setStartRange(date);
				pickerInstanceRef.current.setEndRange(null);
				// CRITICAL: Call draw() to update is-inrange visual highlighting
				pickerInstanceRef.current.draw();
			} else {
				// In 'end' mode - check if selected date is before start date
				// If so, treat it as a new start date (reset behavior)
				if (pickerDate && date < pickerDate) {
					// Selected date is before check-in - make it the new check-in
					setPickerDate(date);
					setPickerEndDate(null);
					// Stay in 'end' mode to select checkout next
					pickerInstanceRef.current.setStartRange(date);
					pickerInstanceRef.current.setEndRange(null);
					pickerInstanceRef.current.draw();
				} else {
					// Set end date, switch back to start, auto-save
					// Evidence: lines 961-965
					setPickerEndDate(date);
					setActivePicker('start');
					pickerInstanceRef.current.setEndRange(date);
					// CRITICAL: Call draw() to update is-inrange visual highlighting
					pickerInstanceRef.current.draw();
					// Auto-save range selection - serialize to Voxel format
					// Evidence: voxel-search-form.beautified.js line 985
					const startStr = dateToString(pickerDate);
					const endStr = dateToString(date);
					if (startStr && endStr) {
						onChange(`${startStr}..${endStr}`);
						setIsOpen(false);
					}
				}
			}
		} else {
			// Single mode
			setPickerDate(date);
		}
	}, [isRangeMode, activePicker, pickerDate, onChange]);

	const handleSlotsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setLocalSlots(Number(e.target.value) || 1);
	}, []);

	const handleSave = useCallback((selectedDate?: Date | null) => {
		if (isRangeMode) {
			// Range mode: save "start..end" format
			// Evidence: voxel-search-form.beautified.js line 985
			const startStr = dateToString(pickerDate);
			const endStr = dateToString(pickerEndDate);
			if (startStr && endStr) {
				// Serialize to Voxel format - just the date string
				onChange(`${startStr}..${endStr}`);
			}
		} else {
			// Single mode - serialize to Voxel format
			const dateToSave = selectedDate !== undefined ? selectedDate : pickerDate;
			const dateString = dateToString(dateToSave);
			if (dateString) {
				onChange(dateString);
			}
		}
		setIsOpen(false);
	}, [isRangeMode, pickerDate, pickerEndDate, onChange]);

	const handleClear = useCallback(() => {
		setPickerDate(null);
		setPickerEndDate(null);
		setLocalSlots(1);
		onChange(null);
		if (pickerInstanceRef.current) {
			pickerInstanceRef.current.setStartRange(null);
			pickerInstanceRef.current.setEndRange(null);
		}
	}, [onChange]);

	// Evidence: voxel-search-form.beautified.js:1486-1487 — selectPreset sets filter value to preset key
	// Preset keys (e.g., "all", "upcoming", "this_weekend") are resolved server-side
	const selectPreset = useCallback((presetKey: string) => {
		onChange(presetKey);
	}, [onChange]);

	// Evidence: voxel-search-form.beautified.js:1489-1490 — custom range check
	// A custom range value contains ".." (e.g., "2026-01-01..2026-01-07")
	// A preset value is a simple string key (e.g., "this_weekend")
	const isUsingCustomRange = useCallback((): boolean => {
		return typeof value === 'string' && value.includes('..');
	}, [value]);

	// Evidence: voxel-search-form.beautified.js lines 999-1003
	// Range mode: both start and end must be set for custom range
	// Single mode: any date set
	const hasCustomDateValue = isRangeMode
		? !!(startDate && endDate)
		: !!currentDate;

	// The trigger's filled state depends on context:
	// Evidence: template line 29 (single-date): filter.value !== null
	// Evidence: template line 40 (range+presets): isUsingCustomRange()
	// Evidence: template line 50 (range, no presets): isUsingCustomRange()
	const triggerIsFilled = isRangeMode ? isUsingCustomRange() : !!value;

	// Check if current value is a preset key (not null, not a date/range)
	const isPresetActive = useCallback((presetKey: string): boolean => {
		return value === presetKey;
	}, [value]);

	// Display value for the trigger
	// Evidence: voxel-search-form.beautified.js lines 1015-1020
	// Evidence: availability-filter.php template lines 37-44 — when presets exist,
	// show custom range display only when isUsingCustomRange(), else show placeholder
	const triggerDisplayValue = useMemo(() => {
		if (isRangeMode && presets.length > 0) {
			// When presets exist: show custom range if selected, else placeholder
			// Evidence: template line 43 — isUsingCustomRange() ? displayValue.start+' - '+displayValue.end : filter.props.l10n.pickDate
			if (isUsingCustomRange()) {
				const startDisplay = formatDateForDisplay(startDate);
				const endDisplay = formatDateForDisplay(endDate);
				return `${startDisplay} - ${endDisplay}`;
			}
			return placeholder;
		}

		if (!hasCustomDateValue) return placeholder;

		if (isRangeMode) {
			// Range mode: "start — end" format (em dash —)
			// Evidence: line 1016
			const startDisplay = formatDateForDisplay(startDate);
			const endDisplay = formatDateForDisplay(endDate);
			const dateRange = `${startDisplay} — ${endDisplay}`;
			return currentSlots > 1 ? `${dateRange} (${currentSlots})` : dateRange;
		} else {
			// Single mode
			// Evidence: template line 32 — filter.value ? displayValue.start : filter.props.l10n.pickDate
			const dateDisplay = formatDateForDisplay(currentDate);
			return currentSlots > 1 ? `${dateDisplay} (${currentSlots})` : dateDisplay;
		}
	}, [isRangeMode, presets.length, isUsingCustomRange, hasCustomDateValue, startDate, endDate, currentDate, currentSlots, placeholder]);

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles(config, 'ts-form-group');
	const popupStyles = getPopupStyles(config);

	return (
		<>
			{/* Evidence: availability-filter.php template lines 2-12 — presets render as separate
			    ts-form-group siblings BEFORE the main date picker trigger (range mode only) */}
			{isRangeMode && presets.map((preset) => (
				<div key={preset.key} className={className} style={style}>
					{!config.hideLabel && <label>{filterData.label}</label>}
					<div
						className={`ts-filter ${isPresetActive(preset.key) ? 'ts-filled' : ''}`}
						onClick={() => selectPreset(preset.key)}
						role="button"
						tabIndex={0}
					>
						<div className="ts-filter-text">
							<span>{preset.label}</span>
						</div>
					</div>
				</div>
			))}

			<div className={className} style={style}>
				{!config.hideLabel && <label>{filterData.label}</label>}

				{ /* Trigger button */}
				<div
					ref={triggerRef}
					className={`ts-filter ts-popup-target ${triggerIsFilled ? 'ts-filled' : ''}`}
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
					<div className="ts-filter-text">{triggerDisplayValue}</div>
					<div className="ts-down-icon"></div>
				</div>

			{ /* Portal-based popup using FieldPopup from create-post */}
			{ /* Range mode shows Check-in/Check-out toggle in header */}
			{ /* Evidence: themes/voxel/templates/widgets/search-form/availability-filter.php:77-100 */}
			<FieldPopup
				isOpen={isOpen}
				target={triggerRef}
				title=""
				icon={filterIcon}
				saveLabel={l10n.save || 'Save'}
				clearLabel={l10n.clear || 'Clear'}
				showSave={isRangeMode}
				onSave={handleSave}
				onClear={handleClear}
				onClose={() => setIsOpen(false)}
				className={`${popupClassName}${isRangeMode ? ' ts-availability-wrapper xl-height xl-width' : ' md-width xl-height'}${config.popupCenterPosition ? ' ts-popup-centered' : ''}`}
				popupStyle={popupStyles.style}
			>
				{/* Custom header for range mode - matches Voxel's actual behavior */}
				{/* Evidence: Screenshots show Voxel displays selected date in header: "1 Feb 2026 — Check-out" */}
				{/* When start date is selected, show the date; otherwise show the label */}
				{/* When end date is selected, show the date; otherwise show "Check-out" label */}
				{isRangeMode && (
					<div className="ts-popup-head flexify">
						<div className="ts-popup-name flexify">
							{filterIcon && <span dangerouslySetInnerHTML={{ __html: filterIcon }} />}
							<span>
								<span
									className={activePicker === 'start' ? 'chosen' : ''}
									onClick={() => setActivePicker('start')}
									style={{ cursor: 'pointer' }}
								>
									{pickerDate ? formatDateForDisplay(dateToString(pickerDate)) : (l10n.checkIn || 'Check-in')}
								</span>
								<span> — </span>
								<span
									className={activePicker === 'end' ? 'chosen' : ''}
									onClick={() => setActivePicker('end')}
									style={{ cursor: 'pointer' }}
								>
									{pickerEndDate ? formatDateForDisplay(dateToString(pickerEndDate)) : (l10n.checkOut || 'Check-out')}
								</span>
							</span>
						</div>
					</div>
				)}

				{ /* Date picker with range mode support */}
				{ /* Evidence: voxel-search-form.beautified.js lines 942-969 */}
				{ /* CRITICAL: In range mode, do NOT pass onSelect - it causes premature popup close */}
				{ /* The two-step selection (check-in → check-out) is handled by handleDateChange */}
				<DatePicker
					value={pickerDate}
					onChange={handleDateChange}
					{...(!isRangeMode && { onSelect: handleSave })}
					pickerConfig={{
						minDate: new Date(), // CRITICAL: Disable past dates
						...(isRangeMode ? { numberOfMonths: 2, theme: 'pika-range' } : {}),
						// Evidence: voxel-search-form.beautified.js - rangePicker uses numberOfMonths:2, theme:'pika-range'
					}}
					onPickerReady={(picker) => {
						pickerInstanceRef.current = picker;
						// Set initial range if values exist
						if (isRangeMode && pickerDate) {
							picker.setStartRange(pickerDate);
							if (pickerEndDate) {
								picker.setEndRange(pickerEndDate);
							}
						}
					}}
				/>

				{ /* NOTE: Voxel's search-form availability filter does NOT have a "Number of slots" field */}
				{ /* Evidence: themes/voxel/templates/widgets/search-form/availability-filter.php:77-103 */}
				{ /* The slots field exists in booking forms (booking-field.php), not search filters */}
			</FieldPopup>
		</div>
		</>
	);
}
