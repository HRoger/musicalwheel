/**
 * Location Field Component - ENHANCED to Level 2 with FULL AUTOCOMPLETE
 * Handles: location field type with address autocomplete and map picker
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/location-field.php
 *
 * Enhancement Level: Level 2 (Full Parity + Voxel.Maps Autocomplete)
 * Enhancement Date: 2025-12-01 (Updated 2026-02-09)
 *
 * Features:
 * - Address autocomplete via Voxel.Maps.Autocomplete (Google Places / Mapbox)
 * - Interactive map via Voxel.Maps.Map with draggable marker
 * - Reverse geocoding (coordinates → address) (NEW!)
 * - Browser geolocation support
 * - Manual lat/lng inputs
 * - Validation error support from field.validation.errors
 * - Description tooltip (vx-dialog)
 * - Switcher toggle for map picker mode (EXACT Voxel HTML)
 *
 * CRITICAL: HTML Structure matches Voxel 1:1
 * - Outer container: <div class="ts-form-group ts-location-field form-field-grid">
 * - Address input wrapper: <div style="position: relative"> (for dropdown positioning)
 * - Geolocation button: SEPARATE ts-form-group (NOT inside map picker)
 * - Switcher HTML: EXACT match with Voxel (lines 31-42 of location-field.php)
 * - NO custom CSS classes or wrappers that don't exist in Voxel
 *
 * Value structure: { address: string, latitude: number|null, longitude: number|null, map_picker: boolean }
 */
import React, { useState, useCallback } from 'react';
import type { VoxelField, FieldIcons } from '../../types';
import { iconToHtml } from '../../utils/iconToHtml';
import { VOXEL_MARKER_ICON, VOXEL_CURRENT_LOCATION_ICON } from '../../utils/voxelDefaultIcons';
import { AddressAutocomplete } from '../popup-kit/AddressAutocomplete';
import { MapPicker } from '../popup-kit/MapPicker';

interface LocationValue {
	address: string;
	latitude: number | null;
	longitude: number | null;
	map_picker: boolean;
}

interface LocationFieldProps {
	field: VoxelField;
	value: LocationValue;
	onChange: (value: LocationValue) => void;
	onBlur?: () => void;
	icons?: FieldIcons;
}

export const LocationField: React.FC<LocationFieldProps> = ({ field, value, onChange, onBlur, icons }) => {
	const [address, setAddress] = useState(value?.address || '');
	const [latitude, setLatitude] = useState(value?.latitude || null);
	const [longitude, setLongitude] = useState(value?.longitude || null);
	const [mapPicker, setMapPicker] = useState(value?.map_picker || false);
	const [isGeolocating, setIsGeolocating] = useState(false);

	// Get validation error from field (matches TextField pattern)
	const displayError = field.validation?.errors?.[0] || '';
	const hasError = displayError.length > 0;

	// EXACT Voxel: Get location icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/location-field.php:15,52,62
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'marker.svg' )
	const markerIconHtml = iconToHtml(icons?.tsLocationIcon, VOXEL_MARKER_ICON);

	// EXACT Voxel: Get my location icon from widget settings OR use Voxel default
	// Evidence: themes/voxel/templates/widgets/create-post/location-field.php:27
	// Pattern: \Voxel\get_icon_markup(...) ?: \Voxel\svg( 'current-location-icon.svg' )
	const currentLocationIconHtml = iconToHtml(icons?.tsMylocationIcon, VOXEL_CURRENT_LOCATION_ICON);

	// Update parent on any change
	const updateValue = useCallback((updates: Partial<LocationValue>) => {
		onChange({
			address,
			latitude,
			longitude,
			map_picker: mapPicker,
			...updates,
		});
	}, [address, latitude, longitude, mapPicker, onChange]);

	// Handle address change (from text input)
	const handleAddressChange = (newAddress: string) => {
		setAddress(newAddress);
		updateValue({ address: newAddress });
	};

	// Handle address selection (from autocomplete)
	const handleAddressSelect = (selectedAddress: string, lat: number, lng: number) => {
		setAddress(selectedAddress);
		setLatitude(lat);
		setLongitude(lng);
		updateValue({ address: selectedAddress, latitude: lat, longitude: lng });
	};

	// Handle switcher toggle
	const handleMapPickerToggle = () => {
		const newValue = !mapPicker;
		setMapPicker(newValue);
		updateValue({ map_picker: newValue });
	};

	// Handle latitude change (manual input)
	const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newLat = parseFloat(e.target.value) || null;
		setLatitude(newLat);
		updateValue({ latitude: newLat });
	};

	// Handle longitude change (manual input)
	const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newLng = parseFloat(e.target.value) || null;
		setLongitude(newLng);
		updateValue({ longitude: newLng });
	};

	// Handle location change from map (drag marker or click map)
	const handleMapLocationChange = (lat: number, lng: number, addressFromMap?: string) => {
		setLatitude(lat);
		setLongitude(lng);
		if (addressFromMap) {
			setAddress(addressFromMap);
			updateValue({ latitude: lat, longitude: lng, address: addressFromMap });
		} else {
			updateValue({ latitude: lat, longitude: lng });
		}
	};

	// Handle geolocation button click - EXACT Voxel behavior using Voxel.Maps.getGeocoder()
	// Evidence: themes/voxel/templates/widgets/create-post/location-field.php lines 26-29
	// Evidence: themes/voxel/assets/dist/create-post.js - getUserLocation() method
	const handleGeolocate = async () => {
		if (!('geolocation' in navigator)) {
			// EXACT Voxel: Use Voxel.alert() for errors
			// Evidence: themes/voxel/app/controllers/assets-controller.php:244
			window.Voxel?.alert?.('Could not determine your location.', 'error');
			return;
		}

		setIsGeolocating(true);

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const lat = position.coords.latitude;
				const lng = position.coords.longitude;

				// Reverse geocode using Voxel.Maps.getGeocoder() - EXACT Voxel pattern
				// Evidence: themes/voxel/assets/dist/create-post.js - geocode() method
				if (window.Voxel?.Maps) {
					const geocoder = (window.Voxel?.Maps as any)?.getGeocoder?.();
					geocoder.geocode(
						{ lat, lng },
						(result: any) => {
							// Success callback
							const addressFromGeo = result.address || '';
							setAddress(addressFromGeo);
							setLatitude(lat);
							setLongitude(lng);
							updateValue({ address: addressFromGeo, latitude: lat, longitude: lng });
							setIsGeolocating(false);
						},
						() => {
							// Error callback
							// EXACT Voxel: Use addressFail message for geocoding errors
							// Evidence: themes/voxel/app/controllers/assets-controller.php:245
							window.Voxel?.alert?.('Could not determine your address.', 'error');
							// Still update coordinates even if reverse geocoding fails
							setLatitude(lat);
							setLongitude(lng);
							updateValue({ latitude: lat, longitude: lng });
							setIsGeolocating(false);
						}
					);
				} else {
					// Fallback if Voxel.Maps not available
					window.Voxel?.alert?.('Could not determine your address.', 'error');
					setLatitude(lat);
					setLongitude(lng);
					updateValue({ latitude: lat, longitude: lng });
					setIsGeolocating(false);
				}
			},
			(_error) => {
				setIsGeolocating(false);
				// EXACT Voxel: Use positionFail message for all geolocation errors
				// Evidence: themes/voxel/app/controllers/assets-controller.php:244
				// Note: Voxel uses a single error message for all geolocation failures
				window.Voxel?.alert?.('Could not determine your location.', 'error');
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000
			}
		);
	};

	return (
		<div className={`ts-form-group ts-location-field form-field-grid field-key-${field.key} ${hasError ? 'ts-has-errors' : ''} ${field.css_class || ''} ${field.hidden ? 'hidden' : ''}`}>
			{/* Address Input Group - EXACT Voxel lines 3-24 */}
			<div className="ts-form-group">
				<label>
					{field.label}

					{/* Errors or Optional label - 1:1 match with Voxel template slot */}
					{hasError ? (
						<span className="is-required">{displayError}</span>
					) : (
						!field.required && <span className="is-required">Optional</span>
					)}

					{/* Description tooltip - 1:1 match with Voxel location-field.php lines 7-12 */}
					{field.description && (
						<div className="vx-dialog">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM8 12C7.4 12 7 11.6 7 11C7 10.4 7.4 10 8 10C8.6 10 9 10.4 9 11C9 11.6 8.6 12 8 12ZM9 9H7V4H9V9Z" fill="currentColor" />
							</svg>
							<div className="vx-dialog-content min-scroll">
								<p>{field.description}</p>
							</div>
						</div>
					)}
				</label>

				{/* Address Input - EXACT Voxel lines 14-23
				    Wrapper needed for positioning dropdown absolutely */}
				<div style={{ position: 'relative' }}>
					<AddressAutocomplete
						value={address}
						onChange={handleAddressChange}
						onSelect={handleAddressSelect}
						onBlur={onBlur}
						placeholder={String(field.props?.['placeholder'] ?? 'Enter address')}
						iconHtml={markerIconHtml}
					/>
				</div>
			</div>

			{/* Geolocate Button - EXACT Voxel lines 25-30 */}
			<div className="ts-form-group">
				<a
					href="#"
					className="ts-btn ts-btn-4 form-btn ts-btn-large"
					onClick={(e) => {
						e.preventDefault();
						handleGeolocate();
					}}
				>
					<span dangerouslySetInnerHTML={{ __html: currentLocationIconHtml }} />
					<p>{isGeolocating ? 'Locating...' : 'Geolocate my address'}</p>
				</a>
			</div>

			{/* EXACT Voxel Switcher HTML - DO NOT MODIFY! */}
			{/* Source: themes/voxel/templates/widgets/create-post/location-field.php lines 31-42 */}
			<div className="ts-form-group switcher-label">
				<label>
					<div className="switch-slider">
						<div className="onoffswitch">
							<input
								type="checkbox"
								checked={mapPicker}
								onChange={handleMapPickerToggle}
								className="onoffswitch-checkbox"
							/>
							<label
								className="onoffswitch-label"
								onClick={(e) => {
									e.preventDefault();
									handleMapPickerToggle();
								}}
							></label>
						</div>
					</div>
					Pick the location manually?
				</label>
			</div>

			{/* Map Picker - Voxel.Maps interactive map (shown when map_picker is true) */}
			{mapPicker && (
				<>
					<div className="ts-form-group">
						<label>Pick on the map</label>
						<MapPicker
							latitude={latitude || 40.7128}
							longitude={longitude || -74.0060}
							onLocationChange={handleMapLocationChange}
							zoom={Number(field.props?.['default_zoom'] ?? 13)}
						/>
					</div>

					{/* Latitude Input */}
					<div className="ts-form-group vx-1-2">
						<label>Latitude</label>
						<div className="ts-input-icon flexify">
							<span dangerouslySetInnerHTML={{ __html: markerIconHtml }} />
							<input
								type="number"
								value={latitude || ''}
								onChange={handleLatitudeChange}
								onBlur={onBlur}
								max={90}
								min={-90}
								className="ts-filter"
								placeholder="Latitude"
								step="any"
							/>
						</div>
					</div>

					{/* Longitude Input */}
					<div className="ts-form-group vx-1-2">
						<label>Longitude</label>
						<div className="ts-input-icon flexify">
							<span dangerouslySetInnerHTML={{ __html: markerIconHtml }} />
							<input
								type="number"
								value={longitude || ''}
								onChange={handleLongitudeChange}
								onBlur={onBlur}
								max={180}
								min={-180}
								className="ts-filter"
								placeholder="Longitude"
								step="any"
							/>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default LocationField;
