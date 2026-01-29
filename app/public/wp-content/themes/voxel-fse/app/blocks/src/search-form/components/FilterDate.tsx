/**
 * FilterDate Component
 *
 * Date filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/date-filter.php
 *
 * REUSES: FieldPopup and DatePicker from create-post block
 * - Portal-based popup positioning
 * - Pikaday calendar (Voxel's custom fork)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import type { FilterComponentProps } from '../types';
// Import shared components (Voxel's commons.js pattern)
import { getFilterWrapperStyles, getPopupStyles, FieldPopup, DatePicker } from '@shared';

interface DateValue {
	from?: string;
	to?: string;
}

/**
 * Parse Voxel date value - can be "from..to" string or object
 * Evidence: Voxel uses ".." separator for date ranges
 */
function parseDateValue( value: unknown, enableRange: boolean ): { from: string; to: string } {
	if ( value === null || value === undefined || value === '' ) {
		return { from: '', to: '' };
	}

	// Handle string format
	if ( typeof value === 'string' ) {
		if ( enableRange && value.includes( '..' ) ) {
			const parts = value.split( '..' );
			return { from: parts[ 0 ] || '', to: parts[ 1 ] || '' };
		}
		return { from: value, to: '' };
	}

	// Handle legacy object format
	if ( typeof value === 'object' ) {
		const obj = value as DateValue;
		return { from: obj.from || '', to: obj.to || '' };
	}

	return { from: '', to: '' };
}

/**
 * Serialize date value to Voxel format
 * Range: "from..to", Single: "YYYY-MM-DD"
 */
function serializeDateValue( from: string, to: string, enableRange: boolean ): string | null {
	if ( ! from && ! to ) return null;

	if ( enableRange ) {
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

// Helper to convert string to Date
const stringToDate = ( dateString: string | null ): Date | null => {
	if ( ! dateString ) return null;
	try {
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

// Helper to format date for display
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

export default function FilterDate( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${blockId}` : '';
	const triggerRef = useRef< HTMLDivElement >( null );

	const props = filterData.props || {};
	const enableRange = props.enable_range ?? false;
	const placeholder = props.placeholder || filterData.label || 'Select date';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Parse incoming value using Voxel format
	const parsed = parseDateValue( value, enableRange );
	const currentFrom = parsed.from;
	const currentTo = parsed.to;

	// Popup states - separate for From and To pickers in range mode
	const [ isFromOpen, setIsFromOpen ] = useState( false );
	const [ isToOpen, setIsToOpen ] = useState( false );

	// Internal picker dates
	const [ pickerFromDate, setPickerFromDate ] = useState< Date | null >( () => stringToDate( currentFrom ) );
	const [ pickerToDate, setPickerToDate ] = useState< Date | null >( () => stringToDate( currentTo ) );

	// Open From popup
	const openFromPopup = useCallback( () => {
		setPickerFromDate( stringToDate( currentFrom ) );
		setIsFromOpen( true );
	}, [ currentFrom ] );

	// Open To popup (for range mode)
	const openToPopup = useCallback( () => {
		setPickerToDate( stringToDate( currentTo ) );
		setIsToOpen( true );
	}, [ currentTo ] );

	// Handle From date change
	const handleFromDateChange = useCallback( ( date: Date | null ) => {
		setPickerFromDate( date );
	}, [] );

	// Handle To date change
	const handleToDateChange = useCallback( ( date: Date | null ) => {
		setPickerToDate( date );
	}, [] );

	// Handle From save
	const handleFromSave = useCallback( ( selectedDate?: Date | null ) => {
		const dateToSave = selectedDate !== undefined ? selectedDate : pickerFromDate;
		const dateString = dateToString( dateToSave ) || '';
		// Serialize to Voxel format
		onChange( serializeDateValue( dateString, currentTo, enableRange ) );
		setIsFromOpen( false );
	}, [ pickerFromDate, enableRange, currentTo, onChange ] );

	// Handle To save
	const handleToSave = useCallback( ( selectedDate?: Date | null ) => {
		const dateToSave = selectedDate !== undefined ? selectedDate : pickerToDate;
		const dateString = dateToString( dateToSave ) || '';
		// Serialize to Voxel format
		onChange( serializeDateValue( currentFrom, dateString, enableRange ) );
		setIsToOpen( false );
	}, [ pickerToDate, currentFrom, enableRange, onChange ] );

	// Handle From clear
	const handleFromClear = useCallback( () => {
		setPickerFromDate( null );
		// Serialize to Voxel format
		onChange( serializeDateValue( '', currentTo, enableRange ) );
	}, [ enableRange, currentTo, onChange ] );

	// Handle To clear
	const handleToClear = useCallback( () => {
		setPickerToDate( null );
		// Serialize to Voxel format
		onChange( serializeDateValue( currentFrom, '', enableRange ) );
	}, [ currentFrom, enableRange, onChange ] );

	const hasValue = enableRange ? !! currentFrom || !! currentTo : !! currentFrom;

	// Display value for the trigger
	const displayValue = useMemo( () => {
		if ( ! hasValue ) return placeholder;
		if ( enableRange ) {
			const parts = [];
			if ( currentFrom ) parts.push( formatDateForDisplay( currentFrom ) );
			if ( currentTo ) parts.push( formatDateForDisplay( currentTo ) );
			return parts.join( ' - ' ) || placeholder;
		}
		return formatDateForDisplay( currentFrom ) || placeholder;
	}, [ hasValue, enableRange, currentFrom, currentTo, placeholder ] );

	// Voxel structure: ts-form-group > label + div.ts-filter.ts-popup-target
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<div className={ className } style={ style }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }

			{ /* Main trigger button */ }
			<div
				ref={ triggerRef }
				className={ `ts-filter ts-popup-target ${ hasValue ? 'ts-filled' : '' }` }
				onClick={ openFromPopup }
				onMouseDown={ ( e ) => e.preventDefault() }
				role="button"
				tabIndex={ 0 }
			>
				{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
				{ /* If no icon configured, show NO icon (not a default fallback) */ }
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			{ /* From Date Popup - uses portal-based FieldPopup from create-post */ }
			<FieldPopup
				isOpen={ isFromOpen }
				target={ triggerRef }
				title={ enableRange ? 'From' : '' }
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ true }
				onSave={ handleFromSave }
				onClear={ handleFromClear }
				onClose={ () => setIsFromOpen( false ) }
				className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
				popupStyle={ popupStyles.style }
			>
				<DatePicker
					value={ pickerFromDate }
					onChange={ handleFromDateChange }
					onSelect={ handleFromSave }
				/>

				{ /* Show To picker button in range mode */ }
				{ enableRange && (
					<div className="ts-form-group" style={ { marginTop: '12px', borderTop: '1px solid var(--ts-shade-5)', paddingTop: '12px' } }>
						<label>To</label>
						<div
							className={ `ts-filter ts-popup-target ${ currentTo ? 'ts-filled' : '' }` }
							onClick={ ( e ) => {
								e.stopPropagation();
								setIsFromOpen( false );
								setTimeout( () => openToPopup(), 100 );
							} }
							role="button"
							tabIndex={ 0 }
						>
							{ /* Icon from API (HTML markup) */ }
							{ /* If no icon configured, show NO icon (not a default fallback) */ }
							{ filterIcon && (
								<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
							) }
							<div className="ts-filter-text">
								{ currentTo ? formatDateForDisplay( currentTo ) : 'Select end date' }
							</div>
						</div>
					</div>
				) }
			</FieldPopup>

			{ /* To Date Popup (for range mode) */ }
			{ enableRange && (
				<FieldPopup
					isOpen={ isToOpen }
					target={ triggerRef }
					title="To"
					icon={ filterIcon }
					saveLabel="Save"
					clearLabel="Clear"
					showClear={ true }
					onSave={ handleToSave }
					onClear={ handleToClear }
					onClose={ () => setIsToOpen( false ) }
					className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
				popupStyle={ popupStyles.style }
				>
					<DatePicker
						value={ pickerToDate }
						onChange={ handleToDateChange }
						onSelect={ handleToSave }
					/>
				</FieldPopup>
			) }
		</div>
	);
}
