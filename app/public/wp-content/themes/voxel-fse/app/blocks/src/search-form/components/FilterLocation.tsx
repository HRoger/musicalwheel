/**
 * FilterLocation Component
 *
 * Location/proximity filter matching Voxel's HTML structure exactly.
 * Evidence: themes/voxel/templates/widgets/search-form/location-filter.php
 *
 * CRITICAL: Supports 2 display modes based on config.displayAs:
 * 1. Inline mode (line 2-12): Input field rendered inline with "use my location" button
 * 2. Popup mode (line 14-38): Location input inside FieldPopup (default)
 *
 * REUSES: FieldPopup from create-post block
 * - Portal-based popup positioning
 * - Click-outside-to-close (blurable mixin)
 *
 * @package VoxelFSE
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import type { FilterComponentProps } from '../types';

// noUiSlider is loaded from Voxel parent theme's vendor folder via wp_enqueue_script
// Accessed via window.noUiSlider at runtime (NOT as IIFE parameter)
// Evidence: themes/voxel/app/controllers/assets-controller.php:141
const getNoUiSlider = () => (window as any).noUiSlider;

// Type definition for noUiSlider API (window global, not npm types)
interface NoUiSliderAPI {
	destroy: () => void;
	set: ( values: ( number | string )[], fireSetEvent?: boolean ) => void;
	get: () => ( number | string )[];
	on: ( event: string, callback: ( values: ( string | number )[], handle: number ) => void ) => void;
	off: ( event: string ) => void;
	updateOptions: ( options: Record<string, unknown>, fireSetEvent?: boolean ) => void;
}
// Import shared components (Voxel's commons.js pattern)
// VoxelIcons.crosshairs is still used for geolocation button (internal UI)
import { VoxelIcons, getFilterWrapperStyles, getPopupStyles, FieldPopup } from '@shared';

interface LocationValue {
	address?: string;
	lat?: number;
	lng?: number;
	swlat?: number; // Viewport bounds (southwest latitude)
	swlng?: number; // Viewport bounds (southwest longitude)
	nelat?: number; // Viewport bounds (northeast latitude)
	nelng?: number; // Viewport bounds (northeast longitude)
	radius?: number;
	method?: 'radius' | 'area'; // Search method
}

/**
 * Serialize location value to Voxel API format
 * Evidence: voxel-search-form.beautified.js lines 721, 724
 * Radius: `${address};${lat},${lng},${radius}`
 * Area: `${address};${swlat},${swlng}..${nelat},${nelng}`
 */
function serializeLocationValue( loc: LocationValue | null ): string | null {
	if ( ! loc || ! loc.address ) return null;

	// Evidence: voxel-search-form.beautified.js lines 738-756 (saveValue)
	// Voxel serializes based on the explicit `method` field, not by checking which coords exist.
	// When method is 'radius', use lat,lng,radius format even if bounds exist.
	if ( loc.method === 'radius' && loc.lat !== undefined && loc.lng !== undefined ) {
		return `${ loc.address };${ loc.lat },${ loc.lng },${ loc.radius || 10 }`;
	}

	// Area method: use viewport bounds format
	if ( loc.swlat !== undefined && loc.swlng !== undefined &&
		 loc.nelat !== undefined && loc.nelng !== undefined ) {
		return `${ loc.address };${ loc.swlat },${ loc.swlng }..${ loc.nelat },${ loc.nelng }`;
	}

	// Fallback to radius format if we have lat/lng
	if ( loc.lat !== undefined && loc.lng !== undefined ) {
		return `${ loc.address };${ loc.lat },${ loc.lng },${ loc.radius || 10 }`;
	}

	// Just address without coordinates (shouldn't happen in normal flow)
	return loc.address;
}

/**
 * Parse Voxel location string format to object
 * Evidence: voxel-search-form.beautified.js lines 721, 724
 */
function parseLocationValue( value: unknown, defaultRadius: number ): LocationValue | null {
	if ( value === null || value === undefined || value === '' ) {
		return null;
	}

	// Handle string format
	if ( typeof value === 'string' ) {
		// Format: "address;lat,lng,radius" or "address;swlat,swlng..nelat,nelng"
		const semicolonIndex = value.indexOf( ';' );
		if ( semicolonIndex === -1 ) {
			// Just an address
			return { address: value };
		}

		const address = value.substring( 0, semicolonIndex );
		const coords = value.substring( semicolonIndex + 1 );

		// Check for area format (contains "..")
		if ( coords.includes( '..' ) ) {
			const parts = coords.split( '..' );
			const sw = parts[ 0 ].split( ',' );
			const ne = parts[ 1 ].split( ',' );
			return {
				address,
				method: 'area',
				swlat: Number( sw[ 0 ] ),
				swlng: Number( sw[ 1 ] ),
				nelat: Number( ne[ 0 ] ),
				nelng: Number( ne[ 1 ] ),
			};
		}

		// Radius format: lat,lng,radius
		const parts = coords.split( ',' );
		return {
			address,
			method: 'radius',
			lat: Number( parts[ 0 ] ),
			lng: Number( parts[ 1 ] ),
			radius: parts[ 2 ] ? Number( parts[ 2 ] ) : defaultRadius,
		};
	}

	// Handle legacy object format (backward compatibility)
	if ( typeof value === 'object' ) {
		return value as LocationValue;
	}

	return null;
}

export default function FilterLocation( {
	config,
	filterData,
	value,
	onChange,
	blockId,
}: FilterComponentProps ) {
	// Generate popup className for styling portal elements (renders at document.body)
	const popupClassName = blockId ? `voxel-popup-${blockId}` : '';
	const triggerRef = useRef< HTMLDivElement >( null );
	const inputRef = useRef< HTMLInputElement >( null );
	const autocompleteRef = useRef< any >( null ); // Voxel.Maps.Autocomplete instance
	const sliderRef = useRef< HTMLDivElement >( null );
	const sliderInstanceRef = useRef< NoUiSliderAPI | null >( null );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ proximityOpen, setProximityOpen ] = useState( false );
	const proximityTriggerRef = useRef< HTMLDivElement >( null );

	const props = filterData.props || {};
	// Radius configuration from Voxel
	// Evidence: location-filter.php:422-428 (frontend_props returns radius object)
	// Evidence: location-filter.php:16-20 (class $props defaults)
	const radiusConfig = props.radius || {};
	const defaultRadius = radiusConfig.default ?? 10;
	const radiusMin = radiusConfig.min ?? 0;
	const radiusMax = radiusConfig.max ?? 100;
	const radiusStep = radiusConfig.step ?? 1;
	// Evidence: location-filter.php:426 — units is nested inside radius object, not top-level
	const units = radiusConfig.units || 'km';
	const displayProximityAs = props.display_proximity_as || 'popup';
	const placeholder = props.placeholder || filterData.label || 'Location';
	// Evidence: location-filter.php:432 — default search method (radius or area)
	const defaultSearchMethod = props.default_search_method || 'area';
	// Evidence: location-filter.php:433-435 — localization strings
	const l10n = props.l10n || {};
	const visibleAreaLabel = l10n.visibleArea || 'Visible map area';
	const displayAs = config.displayAs || filterData.props?.display_as || 'popup';

	// Get filter icon - from API data (HTML markup) or fallback
	// Evidence: themes/voxel/app/post-types/filters/base-filter.php:100
	const filterIcon = filterData.icon || '';

	// Parse value using Voxel string format
	const locationValue = parseLocationValue( value, defaultRadius ) || {};
	const [ localAddress, setLocalAddress ] = useState( locationValue.address || '' );
	const [ localRadius, setLocalRadius ] = useState( locationValue.radius || defaultRadius );

	// Helper to shorten coordinates to 6 decimal places (matches Voxel's _shortenPoint)
	// Evidence: voxel-search-form.beautified.js line 659-664
	const shortenPoint = useCallback( ( num: number ): number => {
		return Math.round( num * 1e6 ) / 1e6;
	}, [] );

	// Format display distance (e.g., "25km" or "10mi")
	// Evidence: voxel-search-form.beautified.js line 722, 796
	const formatDistance = useCallback( ( radius: number ): string => {
		return `${ radius }${ units === 'mi' ? 'mi' : 'km' }`;
	}, [ units ] );

	// Setup proximity slider using noUiSlider
	// Evidence: voxel-search-form.beautified.js lines 667-683 (setupSlider)
	const initSlider = useCallback( () => {
		if ( ! sliderRef.current || sliderInstanceRef.current ) return;

		const noUiSlider = getNoUiSlider();
		if ( ! noUiSlider ) {
			console.error( 'noUiSlider not loaded - window.noUiSlider is undefined' );
			return;
		}
		noUiSlider.create( sliderRef.current, {
			start: localRadius,
			connect: [ true, false ], // Fill from left to handle
			step: radiusStep,
			range: {
				min: radiusMin,
				max: radiusMax,
			},
			behaviour: 'tap-drag',
		} );

		sliderInstanceRef.current = sliderRef.current.noUiSlider as NoUiSliderAPI;

		// Update local radius on slide
		// Evidence: voxel-search-form.beautified.js line 682
		sliderInstanceRef.current.on( 'update', ( vals: ( string | number )[] ) => {
			setLocalRadius( Math.round( Number( vals[ 0 ] ) ) );
		} );

		// Save value on change (for inline mode)
		// Evidence: voxel-search-form.beautified.js lines 795-798
		sliderInstanceRef.current.on( 'change', ( vals: ( string | number )[] ) => {
			const newRadius = Math.round( Number( vals[ 0 ] ) );
			if ( displayProximityAs === 'inline' && locationValue.lat ) {
				// Serialize to Voxel format
				onChange( serializeLocationValue( {
					...locationValue,
					radius: newRadius,
				} ) );
			}
		} );
	}, [ localRadius, radiusStep, radiusMin, radiusMax, displayProximityAs, locationValue, onChange ] );

	// Destroy slider on unmount
	const destroySlider = useCallback( () => {
		if ( sliderInstanceRef.current ) {
			sliderInstanceRef.current.destroy();
			sliderInstanceRef.current = null;
		}
	}, [] );

	// Initialize slider for inline proximity mode
	// Evidence: voxel-search-form.beautified.js lines 791-800 (setupInlineProximity)
	useEffect( () => {
		if ( displayProximityAs === 'inline' && locationValue.lat ) {
			// Delay to ensure DOM is ready
			const timer = setTimeout( () => initSlider(), 50 );
			return () => {
				clearTimeout( timer );
				destroySlider();
			};
		}
		return undefined;
	}, [ displayProximityAs, locationValue.lat, initSlider, destroySlider ] );

	// Initialize slider when proximity popup opens
	useEffect( () => {
		if ( proximityOpen ) {
			const timer = setTimeout( () => initSlider(), 50 );
			return () => clearTimeout( timer );
		}
		return () => destroySlider();
	}, [ proximityOpen, initSlider, destroySlider ] );

	// Sync local radius with external value
	useEffect( () => {
		const newRadius = locationValue.radius || defaultRadius;
		setLocalRadius( newRadius );
		if ( sliderInstanceRef.current ) {
			sliderInstanceRef.current.set( [ newRadius ] );
		}
	}, [ locationValue.radius, defaultRadius ] );

	// Setup Google Maps Autocomplete on input focus (once)
	// Evidence: voxel-search-form.beautified.js lines 629-644 (popup) and 760-780 (inline)
	const setupAutocomplete = useCallback( () => {
		if ( autocompleteRef.current || ! inputRef.current ) return;
		if ( typeof window === 'undefined' ) return;

		const VoxelMaps = ( window as any ).Voxel?.Maps;
		if ( ! VoxelMaps ) {
			console.warn( 'Voxel.Maps not available for autocomplete' );
			return;
		}

		VoxelMaps.await( () => {
			if ( autocompleteRef.current ) return; // Already initialized

			// Get autocomplete config from search form config
			// Evidence: voxel-search-form.beautified.js line 40-43 and 641
			const autocompleteConfig = config.autocomplete || {};

			autocompleteRef.current = new VoxelMaps.Autocomplete(
				inputRef.current,
				( result: any ) => {
					if ( result ) {
						// Extract viewport bounds and center point from place result
						// Evidence: voxel-search-form.beautified.js lines 655-665
						const sw = result.viewport.getSouthWest();
						const ne = result.viewport.getNorthEast();

						// Evidence: voxel-search-form.beautified.js lines 676-686 (usePlaceData)
						// Voxel stores ALL coordinates (bounds + center) and uses `method` to decide format
						const newValue: LocationValue = {
							address: result.address,
							method: defaultSearchMethod as 'radius' | 'area',
							swlat: shortenPoint( sw.getLatitude() ),
							swlng: shortenPoint( sw.getLongitude() ),
							nelat: shortenPoint( ne.getLatitude() ),
							nelng: shortenPoint( ne.getLongitude() ),
							lat: shortenPoint( result.latlng.getLatitude() ),
							lng: shortenPoint( result.latlng.getLongitude() ),
							radius: locationValue.radius || defaultRadius,
						};

						setLocalAddress( result.address );
						// Serialize to Voxel format
						onChange( serializeLocationValue( newValue ) );

						// Close popup after selection (if in popup mode)
						if ( displayAs === 'popup' ) {
							setIsOpen( false );
						}
					} else {
						// Clear on empty result
						setLocalAddress( '' );
						onChange( null );
					}
				},
				autocompleteConfig
			);
		} );
	}, [ config.autocomplete, onChange, displayAs, defaultRadius, defaultSearchMethod, locationValue.radius, shortenPoint ] );

	// Sync local state when popup opens OR when in inline mode
	useEffect( () => {
		if ( isOpen || displayAs === 'inline' ) {
			setLocalAddress( locationValue.address || '' );
			if ( isOpen ) {
				setTimeout( () => inputRef.current?.focus(), 50 );
			}
		}
	}, [ isOpen, displayAs, locationValue.address ] );

	const openPopup = useCallback( () => {
		setIsOpen( true );
	}, [] );

	// Handle input focus - setup autocomplete (once)
	// Evidence: voxel-search-form.beautified.js lines 629 and 760 (addEventListener focus, { once: true })
	const handleInputFocus = useCallback( () => {
		setupAutocomplete();
	}, [ setupAutocomplete ] );

	const handleAddressChange = ( e: React.ChangeEvent< HTMLInputElement > ) => {
		setLocalAddress( e.target.value );
		// In inline mode, save immediately when user types
		// Autocomplete will override with full coordinates when a place is selected
		// Note: We removed the `! autocompleteRef.current` check because it was blocking
		// saves after autocomplete was initialized on first focus
		if ( displayAs === 'inline' ) {
			if ( e.target.value ) {
				// Serialize to Voxel format (address only, no coordinates)
				// When user selects from autocomplete, the callback will add coordinates
				onChange( serializeLocationValue( {
					...locationValue,
					address: e.target.value,
				} ) );
			} else {
				onChange( null );
			}
		}
	};

	const handleUseMyLocation = ( e: React.MouseEvent ) => {
		e.preventDefault();
		e.stopPropagation();
		if ( 'geolocation' in navigator ) {
			navigator.geolocation.getCurrentPosition(
				( position ) => {
					// Geolocation provides center point only, so always use radius method
					const newValue: LocationValue = {
						address: 'Current Location',
						method: 'radius',
						lat: position.coords.latitude,
						lng: position.coords.longitude,
						radius: defaultRadius,
					};
					setLocalAddress( 'Current Location' );
					// Serialize to Voxel format
					onChange( serializeLocationValue( newValue ) );
					// Only close popup if in popup mode
					if ( displayAs === 'popup' ) {
						setIsOpen( false );
					}
				},
				( error ) => {
					console.error( 'Geolocation error:', error );
				}
			);
		}
	};

	const handleSave = useCallback( () => {
		if ( localAddress ) {
			// Serialize to Voxel format
			onChange( serializeLocationValue( {
				...locationValue,
				address: localAddress,
			} ) );
		} else {
			onChange( null );
		}
		setIsOpen( false );
	}, [ localAddress, locationValue, onChange ] );

	const handleClear = useCallback( () => {
		setLocalAddress( '' );
		onChange( null );
	}, [ onChange ] );

	const handleKeyDown = useCallback( ( e: React.KeyboardEvent< HTMLInputElement > ) => {
		if ( e.key === 'Enter' ) {
			e.preventDefault();
			handleSave();
		}
	}, [ handleSave ] );

	// Handle proximity popup save
	// Evidence: voxel-search-form.beautified.js lines 736-740
	const handleProximitySave = useCallback( () => {
		if ( locationValue.lat ) {
			// Serialize to Voxel format
			onChange( serializeLocationValue( {
				...locationValue,
				radius: localRadius,
			} ) );
		}
		setProximityOpen( false );
	}, [ locationValue, localRadius, onChange ] );

	// Handle proximity popup clear (reset to default)
	const handleProximityClear = useCallback( () => {
		setLocalRadius( defaultRadius );
		if ( sliderInstanceRef.current ) {
			sliderInstanceRef.current.set( [ defaultRadius ] );
		}
		if ( locationValue.lat ) {
			// Serialize to Voxel format
			onChange( serializeLocationValue( {
				...locationValue,
				radius: defaultRadius,
			} ) );
		}
	}, [ defaultRadius, locationValue, onChange ] );

	const hasValue = !! locationValue.address || !! locationValue.lat;
	const displayValue = hasValue ? locationValue.address || 'Location set' : placeholder;

	// Render location input (used in both inline and popup modes)
	const renderLocationInput = () => (
		<div className="ts-input-icon flexify" style={ { position: 'relative' } }>
			{ /* Icon from API (HTML markup) - matches Voxel v-html="filter.icon" pattern */ }
			{ /* If no icon configured, show NO icon (not a default fallback) */ }
			{ filterIcon && (
				<span dangerouslySetInnerHTML={ { __html: filterIcon } } />
			) }
			<input
				ref={ inputRef }
				type="text"
				className="inline-input"
				placeholder={ placeholder }
				value={ localAddress }
				onChange={ handleAddressChange }
				onKeyDown={ handleKeyDown }
				onFocus={ handleInputFocus }
			/>
			<a
				href="#"
				className="inline-user-location ts-icon-btn"
				onClick={ handleUseMyLocation }
				title="Use my location"
				aria-label="Use my location"
			>
				{ VoxelIcons.crosshairs }
			</a>
		</div>
	);

	// Render proximity slider
	// Evidence: voxel-search-form.beautified.js lines 667-683 (setupSlider)
	const renderProximitySlider = () => (
		<div className="range-slider-wrapper">
			<div className="range-value">{ formatDistance( localRadius ) }</div>
			<div ref={ sliderRef } className="range-slider"></div>
		</div>
	);

	// Render proximity trigger (for popup mode)
	// Evidence: voxel-search-form.beautified.js line 606 (display_proximity_as check)
	const renderProximityTrigger = () => {
		if ( ! locationValue.lat ) return null; // Only show when location is set
		if ( displayProximityAs === 'inline' ) return null; // Inline mode renders directly

		return (
			<div className="ts-form-group ts-proximity-filter">
				<label>{ props.proximity_label || 'Radius' }</label>
				<div
					ref={ proximityTriggerRef }
					className={ `ts-filter ts-popup-target ${ locationValue.radius ? 'ts-filled' : '' }` }
					onClick={ () => setProximityOpen( true ) }
					onMouseDown={ ( e ) => e.preventDefault() }
					role="button"
					tabIndex={ 0 }
				>
					<div className="ts-filter-text">{ formatDistance( locationValue.radius || defaultRadius ) }</div>
					<div className="ts-down-icon"></div>
				</div>

				{ /* Proximity popup */ }
				<FieldPopup
					isOpen={ proximityOpen }
					target={ proximityTriggerRef }
					title=""
					saveLabel="Save"
					clearLabel="Reset"
					showClear={ true }
					onSave={ handleProximitySave }
					onClear={ handleProximityClear }
					onClose={ () => setProximityOpen( false ) }
					className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
					popupStyle={ popupStyles.style }
				>
					<div className="ts-form-group">
						<label>{ props.proximity_label || 'Search radius' }</label>
						{ renderProximitySlider() }
					</div>
				</FieldPopup>
			</div>
		);
	};

	// Render inline proximity slider (shown below location input when method is radius)
	// Evidence: voxel-search-form.beautified.js lines 791-800 (setupInlineProximity)
	const renderInlineProximity = () => {
		if ( displayProximityAs !== 'inline' ) return null;
		if ( ! locationValue.lat ) return null; // Only show when location is set

		return (
			<div className="ts-form-group ts-inline-proximity">
				<label>{ props.proximity_label || 'Radius' }: { formatDistance( localRadius ) }</label>
				<div ref={ sliderRef } className="range-slider"></div>
			</div>
		);
	};

	// MODE 1: Inline mode - Location input rendered inline
	// Evidence: themes/voxel/templates/widgets/search-form/location-filter.php line 2-12
	if ( displayAs === 'inline' ) {
		const { style, className } = getFilterWrapperStyles( config, 'ts-form-group ts-inline-filter' );
		return (
			<>
				<div className={ className } style={ style }>
					{ ! config.hideLabel && <label>{ filterData.label }</label> }
					{ renderLocationInput() }
				</div>
				{ /* Inline proximity slider (when location is set and displayProximityAs === 'inline') */ }
				{ renderInlineProximity() }
				{ /* Proximity popup trigger (when location is set and displayProximityAs === 'popup') */ }
				{ renderProximityTrigger() }
			</>
		);
	}

	// MODE 2: Popup mode (default) - Location input inside FieldPopup
	// Evidence: themes/voxel/templates/widgets/search-form/location-filter.php line 14-38
	const { style, className } = getFilterWrapperStyles( config, 'ts-form-group' );
	const popupStyles = getPopupStyles( config );

	return (
		<>
			<div className={ className } style={ style }>
				{ ! config.hideLabel && <label>{ filterData.label }</label> }

				{ /* Trigger button */ }
				<div
					ref={ triggerRef }
					className={ `ts-filter ts-popup-target ${ hasValue ? 'ts-filled' : '' }` }
					onClick={ openPopup }
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

				{ /* Portal-based popup using FieldPopup from create-post */ }
				<FieldPopup
					isOpen={ isOpen }
					target={ triggerRef }
					title=""
					icon={ filterIcon }
					saveLabel="Save"
					clearLabel="Clear"
					showClear={ true }
					onSave={ handleSave }
					onClear={ handleClear }
					onClose={ () => setIsOpen( false ) }
					className={ `${popupClassName}${config.popupCenterPosition ? ' ts-popup-centered' : ''}` }
					popupStyle={ popupStyles.style }
				>
					{ /* Popup content - location input with geolocation button */ }
					<div className="ts-form-group">
						{ renderLocationInput() }
					</div>
				</FieldPopup>
			</div>
			{ /* Proximity slider (inline or popup) */ }
			{ renderInlineProximity() }
			{ renderProximityTrigger() }
		</>
	);
}
