/**
 * FilterDate Component
 *
 * Date filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/recurring-date-filter.php
 *
 * REUSES: FieldPopup and DatePicker from create-post block
 * - Portal-based popup positioning
 * - Pikaday calendar (Voxel's custom fork)
 *
 * Voxel frontend_props() returns (date-filter-helpers.php:52-68):
 *   inputMode: 'date-range' | 'single-date'
 *   value: { start: string|null, end: string|null }
 *   displayValue: { start: string|null, end: string|null }
 *   presets: Array<{ key: string, label: string }>
 *   l10n: { from: string, to: string, pickDate: string }
 *
 * Range mode: Single popup with dual-calendar Pikaday (numberOfMonths:2, theme:'pika-range')
 * and From/To header tabs with activePicker toggling — EXACT Voxel 1:1 parity.
 * Evidence: voxel-search-form.beautified.js rangePicker component (lines ~1386-1466)
 * Evidence: recurring-date-filter.php:68-93 (recurring-date-range-picker template)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup, DatePicker } from '@shared';

/**
 * Voxel date filter props shape from frontend_props()
 * Evidence: themes/voxel/app/post-types/filters/traits/date-filter-helpers.php:52-68
 */
interface DateFilterProps {
	inputMode?: string; // 'date-range' | 'single-date' (default: 'date-range', from date-filter.php:11)
	value?: { start?: string | null; end?: string | null };
	displayValue?: { start?: string | null; end?: string | null };
	presets?: Array<{ key: string; label: string }>;
	l10n?: { from?: string; to?: string; pickDate?: string };
}

// Pikaday instance interface (matches DatePicker.tsx)
interface PikadayInstance {
	setDate( date: Date, preventOnSelect?: boolean ): void;
	setStartRange( date: Date | null ): void;
	setEndRange( date: Date | null ): void;
	draw( force?: boolean ): void;
	destroy(): void;
}

/**
 * Parse Voxel date value - can be "from..to" string, preset key, or null
 * Evidence: Voxel uses ".." separator for date ranges, preset keys are plain strings
 * Evidence: date-filter-helpers.php:11-42 (parse_value)
 */
function parseDateValue( value: unknown, isRange: boolean ): { from: string; to: string } {
	if ( value === null || value === undefined || value === '' ) {
		return { from: '', to: '' };
	}

	// Handle string format
	if ( typeof value === 'string' ) {
		if ( isRange && value.includes( '..' ) ) {
			const parts = value.split( '..' );
			return { from: parts[ 0 ] || '', to: parts[ 1 ] || '' };
		}
		return { from: value, to: '' };
	}

	return { from: '', to: '' };
}

/**
 * Serialize date value to Voxel format
 * Evidence: Voxel saveValue() in search-form.js:
 *   single-date: "YYYY-MM-DD"
 *   date-range: "YYYY-MM-DD..YYYY-MM-DD"
 */
function serializeDateValue( from: string, to: string, isRange: boolean ): string | null {
	if ( ! from && ! to ) return null;

	if ( isRange ) {
		if ( from && to ) {
			return `${ from }..${ to }`;
		}
		// Partial range
		if ( from ) return `${ from }..`;
		if ( to ) return `..${ to }`;
		return null;
	}

	return from || null;
}

// Helper to convert "YYYY-MM-DD" string to Date
const stringToDate = ( dateString: string | null | undefined ): Date | null => {
	if ( ! dateString ) return null;
	try {
		// Append T00:00:00 to avoid timezone offset issues
		// Evidence: Voxel Vue created() does: new Date(value.start + "T00:00:00")
		const date = new Date( dateString + 'T00:00:00' );
		return isFinite( date.getTime() ) ? date : null;
	} catch {
		return null;
	}
};

// Helper to convert Date to YYYY-MM-DD string
const dateToString = ( date: Date | null ): string | null => {
	if ( ! date ) return null;
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	const day = String( date.getDate() ).padStart( 2, '0' );
	return `${ year }-${ month }-${ day }`;
};

/**
 * Format date for display - uses browser locale
 * Note: Voxel uses Voxel.helpers.dateFormat() client-side after interaction.
 * For initial display, Voxel provides pre-formatted displayValue from PHP.
 * We use this only after user picks a new date.
 */
const formatDateForDisplay = ( dateString: string | null ): string => {
	if ( ! dateString ) return '';
	try {
		const date = new Date( dateString + 'T00:00:00' );
		if ( ! isFinite( date.getTime() ) ) return '';
		return date.toLocaleDateString( undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		} );
	} catch {
		return dateString;
	}
};

/**
 * Format Date object for display (used by range picker header labels)
 * Evidence: Voxel uses Voxel.helpers.dateFormat(date) for header labels
 */
const formatDateObjForDisplay = ( date: Date | null ): string => {
	if ( ! date ) return '';
	return date.toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );
};

/**
 * Check if value represents a custom date range (contains "..")
 * Evidence: Voxel isUsingCustomRange(): filter.value !== null && filter.value.includes('..')
 */
function isCustomRange( value: unknown ): boolean {
	return typeof value === 'string' && value.includes( '..' );
}

export default function FilterDate( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';
	const triggerRef = useRef< HTMLDivElement >( null );

	// Read props from Voxel's frontend_props() output
	// Evidence: themes/voxel/app/post-types/filters/traits/date-filter-helpers.php:52-68
	const props = ( filterData.props || {} ) as DateFilterProps;

	// inputMode: 'date-range' (default) or 'single-date'
	// Evidence: date-filter.php:11 default is 'date-range'
	const isRange = props.inputMode === 'date-range' || props.inputMode === undefined;

	// l10n labels from admin config
	// Evidence: date-filter-helpers.php:63-66
	const l10n = props.l10n || {};
	const labelFrom = l10n.from || 'From';
	const labelTo = l10n.to || 'To';
	const labelPickDate = l10n.pickDate || 'Choose date';

	// Presets (only for date-range mode)
	// Evidence: date-filter-helpers.php:62, recurring-date-filter.php:2-13
	const presets = isRange ? ( props.presets || [] ) : [];

	// Initial display values from PHP (WordPress date format)
	// Evidence: date-filter-helpers.php:58-60
	const serverDisplayValue = props.displayValue || { start: null, end: null };

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Parse incoming value using Voxel format
	const parsed = parseDateValue( value, isRange );
	const currentFrom = parsed.from;
	const currentTo = parsed.to;

	// Track whether user has interacted (to switch from server displayValue to local formatting)
	const [ userHasInteracted, setUserHasInteracted ] = useState( false );

	// Popup open state (single popup for both modes)
	const [ isPopupOpen, setIsPopupOpen ] = useState( false );

	// ============================================================
	// SINGLE-DATE MODE state
	// ============================================================
	const [ pickerDate, setPickerDate ] = useState< Date | null >( () => stringToDate( currentFrom ) );

	// ============================================================
	// RANGE MODE state — 1:1 Voxel rangePicker pattern
	// Evidence: voxel-search-form.beautified.js rangePicker component
	// ============================================================
	// activePicker: which date is being picked — 'start' or 'end'
	// Evidence: rangePicker data() { activePicker: "start" }
	const [ activePicker, setActivePicker ] = useState< 'start' | 'end' >( 'start' );
	// Internal start/end Date objects for the range picker
	// Evidence: rangePicker data() { value: this.filter.props.value }
	const [ rangeStart, setRangeStart ] = useState< Date | null >( () => stringToDate( currentFrom ) );
	const [ rangeEnd, setRangeEnd ] = useState< Date | null >( () => stringToDate( currentTo ) );
	// Pikaday instance ref for setStartRange/setEndRange
	const pickerInstanceRef = useRef< PikadayInstance | null >( null );

	// ============================================================
	// Open popup handlers
	// ============================================================

	// Single-date: open popup
	const openSinglePopup = useCallback( () => {
		setPickerDate( stringToDate( currentFrom ) );
		setIsPopupOpen( true );
	}, [ currentFrom ] );

	// Range: open popup with activePicker set
	// Evidence: Voxel openRangePicker(which) { activePopup = filter.id; nextTick(() => picker.activePicker = which) }
	const openRangePopup = useCallback( ( which: 'start' | 'end' = 'start' ) => {
		// Evidence: if (which === "end" && !this.value.end) which = "start"
		const startDate = stringToDate( currentFrom );
		const endDate = stringToDate( currentTo );
		setRangeStart( startDate );
		setRangeEnd( endDate );
		const effectiveWhich = which === 'end' && ! endDate ? 'start' : which;
		setActivePicker( effectiveWhich );
		setIsPopupOpen( true );
	}, [ currentFrom, currentTo ] );

	// ============================================================
	// SINGLE-DATE handlers
	// ============================================================

	const handleSingleDateChange = useCallback( ( date: Date | null ) => {
		setPickerDate( date );
	}, [] );

	const handleSingleDateSave = useCallback( ( selectedDate?: Date | null ) => {
		setUserHasInteracted( true );
		const dateToSave = selectedDate !== undefined ? selectedDate : pickerDate;
		const dateString = dateToString( dateToSave ) || '';
		onChange( serializeDateValue( dateString, '', false ) );
		setIsPopupOpen( false );
	}, [ pickerDate, onChange ] );

	const handleSingleDateClear = useCallback( () => {
		setUserHasInteracted( true );
		setPickerDate( null );
		onChange( null );
	}, [ onChange ] );

	// ============================================================
	// RANGE MODE handlers — 1:1 Voxel rangePicker logic
	// Evidence: rangePicker.methods (setStartDate, setEndDate, onSelect, reset)
	// ============================================================

	// Refs to always have latest state in Pikaday callbacks (avoids stale closures)
	const activePickerRef = useRef( activePicker );
	activePickerRef.current = activePicker;
	const rangeStartRef = useRef( rangeStart );
	rangeStartRef.current = rangeStart;
	const rangeEndRef = useRef( rangeEnd );
	rangeEndRef.current = rangeEnd;

	// setStartDate: Evidence: rangePicker.methods.setStartDate
	const setStartDate = useCallback( ( date: Date | null ) => {
		setRangeStart( date );
		rangeStartRef.current = date;
		if ( pickerInstanceRef.current ) {
			pickerInstanceRef.current.setStartRange( date );
			// Evidence: if (this.value.end && this.value.start > this.value.end) { this.setEndDate(null); }
			if ( rangeEndRef.current && date && date > rangeEndRef.current ) {
				setRangeEnd( null );
				rangeEndRef.current = null;
				pickerInstanceRef.current.setEndRange( null );
			}
		}
	}, [] );

	// setEndDate: Evidence: rangePicker.methods.setEndDate
	const setEndDate = useCallback( ( date: Date | null ) => {
		setRangeEnd( date );
		rangeEndRef.current = date;
		if ( pickerInstanceRef.current ) {
			pickerInstanceRef.current.setEndRange( date );
		}
	}, [] );

	// Range save: serialize and commit
	// Evidence: parent.saveValue() — if (!this.value.end) this.value.end = this.value.start
	const handleRangeSave = useCallback( () => {
		setUserHasInteracted( true );
		let startStr = dateToString( rangeStartRef.current ) || '';
		let endStr = dateToString( rangeEndRef.current ) || '';
		// Evidence: Voxel saveValue(): if (!this.value.end) this.value.end = this.value.start
		if ( startStr && ! endStr ) endStr = startStr;
		onChange( serializeDateValue( startStr, endStr, true ) );
		setIsPopupOpen( false );
	}, [ onChange ] );

	// Range clear: Evidence: parent.onClear() { $refs.picker.reset() }
	// Evidence: rangePicker.methods.reset()
	const handleRangeClear = useCallback( () => {
		setUserHasInteracted( true );
		setStartDate( null );
		setEndDate( null );
		setActivePicker( 'start' );
		if ( pickerInstanceRef.current ) {
			pickerInstanceRef.current.draw( true );
		}
		onChange( null );
	}, [ onChange, setStartDate, setEndDate ] );

	// Pikaday onSelect callback for range mode
	// Evidence: rangePicker mounted() onSelect callback
	const handleRangeSelect = useCallback( ( date: Date ) => {
		if ( activePickerRef.current === 'start' ) {
			// Evidence: this.setStartDate(date); this.activePicker = "end";
			setStartDate( date );
			setActivePicker( 'end' );
		} else {
			// Evidence: this.setEndDate(date); this.activePicker = "start"; this.parent.onSave();
			setEndDate( date );
			setActivePicker( 'start' );
			// Auto-save after end date selected (EXACT Voxel behavior)
			// Use setTimeout to let state settle before serializing
			setTimeout( () => {
				setUserHasInteracted( true );
				const startStr = dateToString( rangeStartRef.current ) || '';
				let endStr = dateToString( date ) || '';
				if ( startStr && ! endStr ) endStr = startStr;
				onChange( serializeDateValue( startStr, endStr, true ) );
				setIsPopupOpen( false );
			}, 0 );
		}
		// Evidence: rangePicker watch: activePicker() { this.refresh(); }
		if ( pickerInstanceRef.current ) {
			pickerInstanceRef.current.draw( true );
		}
	}, [ setStartDate, setEndDate, onChange ] );

	// Pikaday onPickerReady — set initial ranges
	// Evidence: rangePicker mounted() { this.setStartDate(this.value.start); this.setEndDate(this.value.end); this.refresh(); }
	const handleRangePickerReady = useCallback( ( picker: PikadayInstance ) => {
		pickerInstanceRef.current = picker;
		// Set initial range highlighting
		const startDate = stringToDate( currentFrom );
		const endDate = stringToDate( currentTo );
		if ( startDate ) picker.setStartRange( startDate );
		if ( endDate ) picker.setEndRange( endDate );
		picker.draw( true );
	}, [ currentFrom, currentTo ] );

	// ============================================================
	// Range picker Pikaday config
	// Evidence: rangePicker mounted() Pikaday config
	// ============================================================
	const rangePickerConfig = useMemo( () => ( {
		numberOfMonths: 2,
		theme: 'pika-range',
		// Evidence: disableDayFn: (date) => { if (this.activePicker === "end" && this.value.start && date < this.value.start) return true; }
		disableDayFn: ( date: Date ) => {
			if ( activePickerRef.current === 'end' && rangeStartRef.current && date < rangeStartRef.current ) {
				return true;
			}
			return false;
		},
		// Evidence: selectDayFn highlights start and end dates
		selectDayFn: ( date: Date ) => {
			return (
				( rangeStartRef.current && date.toDateString() === rangeStartRef.current.toDateString() ) ||
				( rangeEndRef.current && date.toDateString() === rangeEndRef.current.toDateString() ) ||
				undefined
			);
		},
	} ), [] );

	// Handle preset selection
	// Evidence: Voxel selectPreset(key) sets filter.value = key directly
	const handlePresetClick = useCallback( ( presetKey: string ) => {
		setUserHasInteracted( true );
		onChange( value === presetKey ? null : presetKey );
	}, [ value, onChange ] );

	// Determine filled state
	// Evidence: single-date: filter.value !== null
	// Evidence: date-range: isUsingCustomRange() checks filter.value.includes('..')
	const hasValue = isRange ? isCustomRange( value ) : value !== null && value !== undefined && value !== '';

	// Display value for the trigger
	// Evidence: recurring-date-filter.php:34 (single): filter.value ? displayValue.start : l10n.pickDate
	// Evidence: recurring-date-filter.php:45 (range): isUsingCustomRange() ? displayValue.start+' - '+displayValue.end : l10n.pickDate
	const displayText = useMemo( () => {
		if ( ! hasValue ) return labelPickDate;

		if ( isRange ) {
			// Use server-provided displayValue initially, then local formatting after interaction
			const startText = userHasInteracted
				? formatDateForDisplay( currentFrom )
				: ( serverDisplayValue.start || formatDateForDisplay( currentFrom ) );
			const endText = userHasInteracted
				? formatDateForDisplay( currentTo )
				: ( serverDisplayValue.end || formatDateForDisplay( currentTo ) );
			if ( startText && endText ) return `${ startText } - ${ endText }`;
			if ( startText ) return startText;
			return labelPickDate;
		}

		// Single date mode
		const text = userHasInteracted
			? formatDateForDisplay( currentFrom )
			: ( serverDisplayValue.start || formatDateForDisplay( currentFrom ) );
		return text || labelPickDate;
	}, [ hasValue, isRange, currentFrom, currentTo, labelPickDate, userHasInteracted, serverDisplayValue ] );

	// Range header labels (computed, like Voxel's startLabel/endLabel)
	// Evidence: rangePicker.computed.startLabel: value.start ? dateFormat(value.start) : l10n.from
	// Evidence: rangePicker.computed.endLabel: value.end ? dateFormat(value.end) : l10n.to
	const rangeStartLabel = rangeStart ? formatDateObjForDisplay( rangeStart ) : labelFrom;
	const rangeEndLabel = rangeEnd ? formatDateObjForDisplay( rangeEnd ) : labelTo;

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<>
			{ /* Presets - render before main trigger (only in date-range mode) */ }
			{ /* Evidence: recurring-date-filter.php:2-13 */ }
			{ presets.map( ( preset ) => (
				<div key={ preset.key } className={ className } style={ style }>
					{ ! config.hideLabel && <label>{ filterData.label }</label> }
					<div
						className={ `ts-filter${ value === preset.key ? ' ts-filled' : '' }` }
						onClick={ () => handlePresetClick( preset.key ) }
						role="button"
						tabIndex={ 0 }
					>
						<div className="ts-filter-text">
							<span>{ preset.label }</span>
						</div>
					</div>
				</div>
			) ) }

			{ /* Main date filter trigger and popup */ }
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }

				{ /* Trigger button */ }
				{ /* Evidence: recurring-date-filter.php:27-47 */ }
				<div
					ref={ triggerRef }
					className={ `ts-filter ts-popup-target${ hasValue ? ' ts-filled' : '' }` }
					onClick={ isRange ? () => openRangePopup( 'start' ) : openSinglePopup }
					onMouseDown={ ( e ) => e.preventDefault() }
					role="button"
					tabIndex={ 0 }
				>
					{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
					{ filterIcon && (
						<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
					) }
					<div className="ts-filter-text">{ displayText }</div>
					<div className="ts-down-icon"></div>
				</div>

				{ /* Single-date popup */ }
				{ ! isRange && (
					<FieldPopup
						isOpen={ isPopupOpen }
						target={ triggerRef }
						saveLabel="Save"
						clearLabel="Clear"
						showClear={ true }
						onSave={ handleSingleDateSave }
						onClear={ handleSingleDateClear }
						onClose={ () => setIsPopupOpen( false ) }
						className={ `${ popupClassName } md-width xl-height${ config.popupCenterPosition ? ' ts-popup-centered' : '' }` }
						popupStyle={ popupStyles.style }
					>
						<DatePicker
							value={ pickerDate }
							onChange={ handleSingleDateChange }
							onSelect={ handleSingleDateSave }
						/>
					</FieldPopup>
				) }

				{ /* Range date popup — SINGLE popup with dual-calendar Pikaday */ }
				{ /* Evidence: recurring-date-filter.php wrapper-class="ts-availability-wrapper xl-width xl-height" */ }
				{ /* Evidence: recurring-date-range-picker template (lines 68-93) */ }
				{ isRange && (
					<FieldPopup
						isOpen={ isPopupOpen }
						target={ triggerRef }
						saveLabel="Save"
						clearLabel="Clear"
						showClear={ true }
						onSave={ handleRangeSave }
						onClear={ handleRangeClear }
						onClose={ () => setIsPopupOpen( false ) }
						className={ `${ popupClassName } ts-availability-wrapper xl-width xl-height${ config.popupCenterPosition ? ' ts-popup-centered' : '' }` }
						popupStyle={ popupStyles.style }
					>
						{ /* Range picker header with From/To tabs */ }
						{ /* Evidence: recurring-date-range-picker template */ }
						{ /* EXACT Voxel HTML: ts-popup-head > ts-popup-name > icon + clickable From/To spans */ }
						<div className="ts-popup-head flexify">
							<div className="ts-popup-name flexify">
								{ filterIcon && (
									<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
								) }
								<span>
									<span
										className={ activePicker === 'start' ? 'chosen' : '' }
										onClick={ () => setActivePicker( 'start' ) }
										style={ { cursor: 'pointer' } }
									>
										{ rangeStartLabel }
									</span>
									{ rangeStart && (
										<>
											<span> &mdash; </span>
											<span
												className={ activePicker === 'end' ? 'chosen' : '' }
												onClick={ () => setActivePicker( 'end' ) }
												style={ { cursor: 'pointer' } }
											>
												{ rangeEndLabel }
											</span>
										</>
									) }
								</span>
							</div>
						</div>

						{ /* Single DatePicker with numberOfMonths:2, theme:'pika-range' */ }
						{ /* Evidence: rangePicker mounted() Pikaday config */ }
						<DatePicker
							value={ null }
							onChange={ () => {} }
							onSelect={ handleRangeSelect }
							pickerConfig={ rangePickerConfig }
							onPickerReady={ handleRangePickerReady }
						/>
					</FieldPopup>
				) }
			</div>
		</>
	);
}
