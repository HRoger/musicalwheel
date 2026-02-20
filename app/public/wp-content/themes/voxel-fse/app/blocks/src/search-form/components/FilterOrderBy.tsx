/**
 * FilterOrderBy Component
 *
 * Order by/sorting filter matching Voxel's HTML structure and behavior exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php
 * Evidence: voxel-search-form.beautified.js:1155-1335
 *
 * CRITICAL: Supports 4 display modes based on display_as:
 * 1. Popup mode (template line 64-97): Dropdown with radio list (default)
 * 2. Buttons mode (template line 2-16): Horizontal button list (addon-buttons)
 * 3. Alt-btn mode (template line 18-27): Individual filter buttons
 * 4. Post-feed mode (template line 29-62): Teleported to post feed header
 *
 * Proximity sorting: When a choice has requires_location=true, selecting it
 * fetches user location from location filter or browser geolocation, then
 * appends (lat,lng) to the value string.
 * Evidence: voxel-search-form.beautified.js:1214-1312
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { FilterComponentProps, FilterData } from '../types';
import { getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface OrderByOption {
	key: string;
	label: string;
	placeholder?: string;
	// Icon HTML markup from Voxel's get_icon_markup()
	// Evidence: themes/voxel/app/post-types/filters/order-by-filter.php:89
	icon?: string;
	// Whether this choice requires user location (proximity sorting)
	// Evidence: order-by-filter.php:90
	requires_location?: boolean;
	// Dynamically set when value already contains coordinates
	// Evidence: order-by-filter.php:67-69
	has_location?: boolean;
}

/**
 * Extract sort key from value string, stripping location args.
 * "nearby(40.7,-74.0)" => "nearby"
 * "latest" => "latest"
 * Evidence: voxel-search-form.beautified.js:1245-1248
 */
function sortKey( val: unknown ): string | null {
	if ( typeof val !== 'string' || ! val ) return null;
	return val.split( '(' )[ 0 ];
}

/**
 * Shorten a coordinate to 5 decimal places (matches Voxel's _shortenPoint)
 * Evidence: voxel-search-form.beautified.js:1302-1303
 */
function shortenPoint( coord: number ): number {
	return Math.round( coord * 100000 ) / 100000;
}

export default function FilterOrderBy( {
	config,
	filterData,
	value,
	onChange,
	blockId,
	allFilterValues,
	allFiltersData,
	postFeedId,
}: FilterComponentProps ) {
	const popupClassName = blockId ? `voxel-popup-${ blockId }` : '';
	const triggerRef = useRef< HTMLDivElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	// Loading state: set to the choice key being geolocated
	// Evidence: voxel-search-form.beautified.js:1161-1162
	const [ loading, setLoading ] = useState< string | false >( false );

	const props = filterData.props || {};
	const displayAs = config.displayAs || filterData.props?.['display_as'] || 'popup';
	const placeholder = String(props['placeholder'] || filterData.label || 'Order By');

	// Parse choices from props (comes from Voxel PHP)
	// Evidence: order-by-filter.php:63-76 returns choices as object with key, label, placeholder, icon, requires_location
	const options: OrderByOption[] = useMemo( () => {
		const choices = props['choices'] || {};
		if ( Array.isArray( choices ) ) {
			return choices;
		}
		return Object.entries( choices ).map( ( [ key, choice ]: [ string, any ] ) => ( {
			key,
			label: choice.label || choice,
			placeholder: choice.placeholder || choice.label || choice,
			icon: choice.icon || '',
			requires_location: choice.requires_location || false,
			has_location: choice.has_location || false,
		} ) );
	}, [ props['choices'] ] );

	// Get filter icon
	const filterIcon = filterData.icon || '';

	// Find location filter from sibling filters
	// Evidence: voxel-search-form.beautified.js:1177 — this.$root.getLocationFilter()
	const locationFilterData = useMemo( () => {
		if ( ! allFiltersData ) return null;
		return allFiltersData.find( ( f: FilterData ) => f.type === 'location' ) || null;
	}, [ allFiltersData ] );

	const locationFilterValue = useMemo( () => {
		if ( ! locationFilterData || ! allFilterValues ) return null;
		const val = allFilterValues[ locationFilterData.key ];
		if ( ! val || typeof val !== 'object' ) return null;
		return val as Record< string, any >;
	}, [ locationFilterData, allFilterValues ] );

	// Get nearby location for proximity sorting
	// Evidence: voxel-search-form.beautified.js:1253-1312
	const getNearbyLocation = useCallback( ( callback: ( lat: number, lng: number ) => void ) => {
		// First try location filter value
		if ( locationFilterValue ) {
			const { lat, lng, method, address } = locationFilterValue;

			if ( lat && lng ) {
				if ( method === 'radius' ) {
					callback( lat, lng );
					setLoading( false );
					return;
				}
				// Has coords but not radius mode — switch to radius and use
				callback( lat, lng );
				setLoading( false );
				return;
			}

			// Has address but no coords — try geocoding via Voxel.Maps
			if ( address && ( window as any ).Voxel?.Maps?.getGeocoder ) {
				( window as any ).Voxel.Maps.getGeocoder().geocode( address, ( place: any ) => {
					if ( place ) {
						callback(
							place.latlng?.getLatitude?.() || place.lat,
							place.latlng?.getLongitude?.() || place.lng
						);
					} else {
						// Fallback to browser geolocation
						browserGeolocate( callback );
					}
					setLoading( false );
				} );
				return;
			}
		}

		// Fallback: browser geolocation
		// Evidence: voxel-search-form.beautified.js:1299-1311
		browserGeolocate( callback );
	}, [ locationFilterValue ] );

	const browserGeolocate = useCallback( ( callback: ( lat: number, lng: number ) => void ) => {
		if ( ! navigator.geolocation ) {
			setLoading( false );
			return;
		}
		navigator.geolocation.getCurrentPosition(
			( pos ) => {
				const lat = shortenPoint( pos.coords.latitude );
				const lng = shortenPoint( pos.coords.longitude );
				callback( lat, lng );
				setLoading( false );
			},
			() => {
				// Geolocation failed — show Voxel alert if available
				const voxelConfig = ( window as any ).Voxel_Config;
				if ( ( window as any ).Voxel?.alert && voxelConfig?.l10n?.positionFail ) {
					( window as any ).Voxel.alert( voxelConfig.l10n.positionFail, 'error' );
				}
				setLoading( false );
			}
		);
	}, [] );

	// Watch location filter changes and update proximity sort value
	// Evidence: voxel-search-form.beautified.js:1177-1193
	const currentSortKey = sortKey( value );
	const selectedRequiresLocation = options.find( ( o ) => o.key === currentSortKey )?.requires_location;

	useEffect( () => {
		if ( ! selectedRequiresLocation || ! locationFilterValue ) return;
		const { lat, lng, method } = locationFilterValue;
		if ( method === 'radius' && lat && lng && currentSortKey ) {
			onChange( `${ currentSortKey }(${ lat },${ lng })` );
		}
	}, [ locationFilterValue?.['lat'], locationFilterValue?.['lng'] ] ); // eslint-disable-line react-hooks/exhaustive-deps

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	// Select from dropdown popup (popup/post-feed modes)
	// Evidence: voxel-search-form.beautified.js:1214-1226
	const selectDropdownChoice = useCallback( ( option: OrderByOption ) => {
		if ( option.requires_location ) {
			setLoading( option.key );
			getNearbyLocation( ( lat, lng ) => {
				onChange( option.key + `(${ lat },${ lng })` );
				setIsOpen( false );
			} );
		} else {
			onChange( option.key );
			setIsOpen( false );
		}
	}, [ onChange, getNearbyLocation ] );

	// Select from button list (buttons/alt-btn modes)
	// Evidence: voxel-search-form.beautified.js:1231-1240
	const selectChoice = useCallback( ( option: OrderByOption ) => {
		if ( option.requires_location ) {
			setLoading( option.key );
			getNearbyLocation( ( lat, lng ) => {
				onChange( option.key + `(${ lat },${ lng })` );
			} );
		} else {
			onChange( option.key );
		}
	}, [ onChange, getNearbyLocation ] );

	const handleClear = useCallback( () => {
		onChange( null );
	}, [ onChange ] );

	const stringValue = typeof value === 'string' ? value : '';
	const hasValue = !! stringValue;
	// Use sortKey to match value against option keys
	// "nearby(40.7,-74.0)" matches option with key "nearby"
	const currentKey = sortKey( stringValue );
	const selectedOption = options.find( ( opt ) => opt.key === currentKey );
	// Evidence: voxel-search-form.beautified.js:1328-1329
	// displayValue() { return this.selected?.label; }
	const displayValue = selectedOption?.label || placeholder;

	// On mount: if selected requires_location but doesn't have it, trigger geolocation
	// Evidence: voxel-search-form.beautified.js:1166-1174
	useEffect( () => {
		if ( selectedOption?.requires_location && ! selectedOption?.has_location && currentKey ) {
			if ( displayAs === 'buttons' ) {
				selectDropdownChoice( selectedOption );
			} else {
				selectChoice( selectedOption );
			}
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Render radio list (used in popup and post-feed modes)
	// Evidence: order-by-filter.php template line 78-93
	const renderRadioList = ( onSelect: ( option: OrderByOption ) => void ) => (
		<div className="ts-term-dropdown ts-md-group">
			<ul className="simplify-ul ts-term-dropdown-list min-scroll">
				{ options.map( ( option ) => {
					const isSelected = currentKey === option.key;
					const isPending = loading === option.key;
					return (
						<li key={ option.key } className={ isSelected ? 'ts-selected' : '' }>
							<a
								href="#"
								className={ `flexify${ isPending ? ' vx-pending' : '' }` }
								onClick={ ( e ) => {
									e.preventDefault();
									onSelect( option );
								} }
							>
								<div className="ts-radio-container">
									<label className="container-radio">
										<input
											type="radio"
											value={ option.key }
											checked={ isSelected }
											readOnly
											disabled
											hidden
										/>
										<span className="checkmark"></span>
									</label>
								</div>
								<span>{ option.label }</span>
								{ option.icon && (
									<div className="ts-term-icon">
										<span dangerouslySetInnerHTML={ { __html: option.icon } } />
									</div>
								) }
							</a>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	// MODE 1: Buttons mode - Horizontal button list
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 2-16
	if ( displayAs === 'buttons' ) {
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
		return (
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }
				<ul className="simplify-ul addon-buttons flexify">
					{ options.map( ( option ) => {
						const isSelected = currentKey === option.key;
						const isPending = loading === option.key;
						return (
							<li
								key={ option.key }
								className={ `flexify${ isSelected ? ' adb-selected' : '' }${ isPending ? ' vx-pending' : '' }` }
								onClick={ () => selectChoice( option ) }
							>
								{ option.placeholder || option.label }
							</li>
						);
					} ) }
				</ul>
			</div>
		);
	}

	// MODE 2: Alt-btn mode - Individual filter buttons for each choice
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 18-27
	if ( displayAs === 'alt-btn' ) {
		return (
			<>
				{ options.map( ( option ) => {
					const isSelected = currentKey === option.key;
					const isPending = loading === option.key;
					const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
					return (
						<div key={ option.key } className={ className } style={ style }>
							{ ! config.hideLabel && <label>{ option.label }</label> }
							<div
								className={ `ts-filter${ isSelected ? ' ts-filled' : '' }${ isPending ? ' vx-pending' : '' }` }
								onClick={ () => selectChoice( option ) }
							>
								{ option.icon && (
									<span dangerouslySetInnerHTML={ { __html: option.icon } } />
								) }
								<div className="ts-filter-text">
									<span>{ option.placeholder || option.label }</span>
								</div>
							</div>
						</div>
					);
				} ) }
			</>
		);
	}

	// MODE 3: Post-feed mode - Teleported to post feed header
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 29-62
	// Uses <teleport> in Vue, React Portal here
	if ( displayAs === 'post-feed' && postFeedId ) {
		const targetSelector = `[data-block-id="${ postFeedId }"] .post-feed-header, .elementor-element-${ postFeedId } .post-feed-header`;
		const targetEl = document.querySelector( targetSelector );

		if ( targetEl && ! targetEl.querySelector( '.vxf-sort' ) ) {
			return createPortal(
				<PostFeedOrderBy
					filterData={ filterData }
					filterIcon={ filterIcon }
					placeholder={ placeholder }
					options={ options }
					currentKey={ currentKey }
					hasValue={ hasValue }
					displayValue={ displayValue }
					loading={ loading }
					selectDropdownChoice={ selectDropdownChoice }
					handleClear={ handleClear }
					renderRadioList={ renderRadioList }
					popupClassName={ popupClassName }
					config={ config }
				/>,
				targetEl
			);
		}
		// If target element not found, fall through to popup mode
	}

	// MODE 4: Popup mode (default) - Dropdown with radio list
	// Evidence: themes/voxel/templates/widgets/search-form/order-by-filter.php line 64-97
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<div className={ className } style={ style }>
			{ ! config.hideLabel && <label>{ filterData.label }</label> }

			<div
				ref={ triggerRef }
				className={ `ts-filter ts-popup-target${ hasValue ? ' ts-filled' : '' }` }
				onClick={ openPopup }
				onMouseDown={ ( e ) => e.preventDefault() }
				role="button"
				tabIndex={ 0 }
			>
				{ filterIcon && (
					<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
				) }
				<div className="ts-filter-text">{ displayValue }</div>
				<div className="ts-down-icon"></div>
			</div>

			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef as any }
				title=""
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ hasValue }
				showSave={ false }
				onSave={ () => setIsOpen( false ) }
				onClear={ handleClear }
				onClose={ () => setIsOpen( false ) }
				className={ `hide-head ${ popupClassName }${ config.popupCenterPosition ? ' ts-popup-centered' : '' }`.trim() }
				popupStyle={ popupStyles.style }
			>
				{ renderRadioList( selectDropdownChoice ) }
			</FieldPopup>
		</div>
	);
}

/**
 * Post-feed mode sub-component (teleported into post feed header)
 * Evidence: order-by-filter.php template line 29-62
 */
function PostFeedOrderBy( {
	filterData: _filterData,
	filterIcon,
	placeholder,
	options: _options,
	currentKey: _currentKey,
	hasValue,
	displayValue,
	loading: _loading,
	selectDropdownChoice,
	handleClear,
	renderRadioList,
	popupClassName,
	config,
}: {
	filterData: FilterComponentProps['filterData'];
	filterIcon: string;
	placeholder: string;
	options: OrderByOption[];
	currentKey: string | null;
	hasValue: boolean;
	displayValue: string;
	loading: string | false;
	selectDropdownChoice: ( option: OrderByOption ) => void;
	handleClear: () => void;
	renderRadioList: ( onSelect: ( option: OrderByOption ) => void ) => JSX.Element;
	popupClassName: string;
	config: FilterComponentProps['config'];
} ) {
	const triggerRef = useRef< HTMLDivElement >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const popupStyles = getPopupStyles( config );

	return (
		<div className={ `vxf-sort ts-popup-target${ hasValue ? ' ts-filled' : '' }` } ref={ triggerRef }>
			<a
				href="#"
				onClick={ ( e ) => {
					e.preventDefault();
					setIsOpen( ! isOpen );
				} }
			>
				{ hasValue ? displayValue : placeholder }
				<div className="ts-down-icon"></div>
			</a>

			<FieldPopup
				isOpen={ isOpen }
				target={ triggerRef as any }
				title=""
				icon={ filterIcon }
				saveLabel="Save"
				clearLabel="Clear"
				showClear={ hasValue }
				showSave={ false }
				onSave={ () => setIsOpen( false ) }
				onClear={ () => { handleClear(); setIsOpen( false ); } }
				onClose={ () => setIsOpen( false ) }
				className={ `hide-d ${ popupClassName }${ config.popupCenterPosition ? ' ts-popup-centered' : '' }`.trim() }
				popupStyle={ popupStyles.style }
			>
				{ renderRadioList( ( option ) => {
					selectDropdownChoice( option );
					setIsOpen( false );
				} ) }
			</FieldPopup>
		</div>
	);
}
