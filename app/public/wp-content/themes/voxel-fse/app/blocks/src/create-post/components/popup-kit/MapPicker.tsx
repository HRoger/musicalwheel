/**
 * MapPicker Component - Interactive Map for Location Selection
 *
 * EXACT Voxel Implementation: Uses Voxel.Maps API (Google Maps/Mapbox abstraction)
 *
 * Evidence: themes/voxel/assets/dist/create-post.js - Location field component
 *
 * Voxel.Maps API Methods Used:
 * - Voxel.Maps.await() - Wait for maps library to load
 * - Voxel.Maps.Map - Map instance (provider-agnostic)
 * - Voxel.Maps.Marker - Marker with custom HTML template
 * - Voxel.Maps.LatLng - Coordinate wrapper
 * - Voxel.Maps.getGeocoder() - Reverse geocoding service
 *
 * File: themes/voxel/templates/widgets/create-post/location-field.php (lines 43-46)
 */
import React, { useEffect, useRef, useCallback } from 'react';

// Map click event interface
interface MapClickEvent {
	latLng?: unknown;
	latlng?: unknown;
}

// TypeScript declarations for Voxel.Maps global API
declare global {
	interface Window {
		Voxel?: {
			Maps?: {
				await: (callback: () => void) => void;
				Map: new (config: {
					el: HTMLElement;
					zoom: number;
					center?: VoxelLatLng;
				}) => VoxelMap;
				Marker: new (config: {
					template: string;
					map?: VoxelMap;
					position?: VoxelLatLng;
				}) => VoxelMarker;
				LatLng: new (lat: number, lng: number) => VoxelLatLng;
				getGeocoder: () => VoxelGeocoder;
			};
			alert?: (message: string) => void;
		};
	}
}

interface VoxelLatLng {
	getLatitude(): number;
	getLongitude(): number;
	toGeocoderFormat(): { lat: number; lng: number };
}

interface MapEventListener {
	remove(): void;
}

interface VoxelMap {
	setCenter(latlng: VoxelLatLng): void;
	getCenter(): VoxelLatLng;
	setZoom(zoom: number): void;
	getZoom(): number;
	addListener(event: string, callback: (event: MapClickEvent) => void): MapEventListener;
	getClickPosition(event: MapClickEvent): VoxelLatLng;
}

interface VoxelMarker {
	setPosition(latlng: VoxelLatLng): void;
	getPosition(): VoxelLatLng | null;
	setMap(map: VoxelMap | null): void;
	remove(): void;
}

interface VoxelGeocoder {
	geocode(
		position: { lat: number; lng: number },
		successCallback: (result: { address: string }) => void,
		errorCallback?: () => void
	): void;
}

interface MapPickerProps {
	latitude: number;
	longitude: number;
	onLocationChange: (lat: number, lng: number, address?: string) => void;
	zoom?: number;
}

export const MapPicker: React.FC<MapPickerProps> = ({
	latitude,
	longitude,
	onLocationChange,
	zoom = 13
}) => {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<VoxelMap | null>(null);
	const markerRef = useRef<VoxelMarker | null>(null);
	const markerTemplateRef = useRef<HTMLDivElement>(null);

	// Reverse geocode using Voxel.Maps.getGeocoder()
	// Evidence: themes/voxel/assets/dist/create-post.js - geocode() method
	const reverseGeocode = useCallback((lat: number, lng: number): Promise<string | undefined> => {
		return new Promise((resolve) => {
			if (!window.Voxel?.Maps) {
				resolve(undefined);
				return;
			}

			const geocoder = window.Voxel.Maps.getGeocoder();
			geocoder.geocode(
				{ lat, lng },
				(result) => {
					resolve(result.address);
				},
				() => {
					resolve(undefined);
				}
			);
		});
	}, []);

	// Get marker position as VoxelLatLng
	const getMarkerPosition = useCallback((): VoxelLatLng | null => {
		if (!window.Voxel?.Maps) return null;
		if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;

		return new window.Voxel.Maps.LatLng(latitude, longitude);
	}, [latitude, longitude]);

	// Initialize map
	// EXACT Voxel: themes/voxel/assets/dist/create-post.js - setupMap() method
	useEffect(() => {
		if (!mapContainerRef.current) return;

		// DEBUG: Check Voxel.Maps availability
		console.log('[MapPicker] Initializing map...');
		console.log('[MapPicker] window.Voxel:', window.Voxel);
		console.log('[MapPicker] window.Voxel?.Maps:', window.Voxel?.Maps);
		console.log('[MapPicker] window.Voxel?.Maps?.await:', window.Voxel?.Maps?.await);
		console.log('[MapPicker] window.Voxel?.alert:', window.Voxel?.alert);

		// Wait for Voxel.Maps to be available
		// Evidence: themes/voxel/assets/dist/commons.js - Voxel.Maps.await()
		window.Voxel?.Maps?.await?.(() => {
			console.log('[MapPicker] Voxel.Maps.await callback fired!');
			if (!mapContainerRef.current || mapRef.current) return;
			if (!window.Voxel?.Maps) {
				console.error('[MapPicker] ERROR: Voxel.Maps not available even after await()');
				return;
			}

			// Create map instance
			// Evidence: themes/voxel/assets/dist/create-post.js - new Voxel.Maps.Map()
			const map = new window.Voxel.Maps.Map({
				el: mapContainerRef.current,
				zoom: zoom
			});

			// Create marker with custom HTML template
			// Evidence: themes/voxel/templates/widgets/create-post/location-field.php:71-75
			const markerTemplate = markerTemplateRef.current?.innerHTML || `
				<div class="map-marker marker-type-icon mi-static">
					<svg width="80" height="80" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.4889 2.92383C8.95113 2.92383 6.08319 5.79177 6.08319 9.32956C6.08319 11.6495 6.94359 13.7621 7.97903 15.4696C9.01631 17.18 10.2563 18.5287 11.0825 19.3353C11.8807 20.1145 13.1282 20.1132 13.9244 19.3314C14.7468 18.5241 15.9797 17.1754 17.0107 15.4655C18.04 13.7585 18.8947 11.6473 18.8947 9.32956C18.8947 5.79177 16.0267 2.92383 12.4889 2.92383ZM9.48926 9.32812C9.48926 7.67127 10.8324 6.32812 12.4893 6.32812C14.1461 6.32812 15.4893 7.67127 15.4893 9.32812C15.4893 10.985 14.1461 12.3281 12.4893 12.3281C10.8324 12.3281 9.48926 10.985 9.48926 9.32812Z" fill="#343C54"/>
					</svg>
				</div>
			`;

			const marker = new window.Voxel.Maps.Marker({
				template: markerTemplate
			});

			// Set initial position if available
			const position = getMarkerPosition();
			if (position) {
				map.setCenter(position);
				marker.setPosition(position);
				marker.setMap(map);
			}

			// Handle map clicks
			// Evidence: themes/voxel/assets/dist/create-post.js - map.addListener('click')
			map.addListener('click', async (event: MapClickEvent) => {
				const clickPosition = map.getClickPosition(event);

				// Create marker on first click
				if (!marker.getPosition()) {
					marker.setPosition(clickPosition);
					marker.setMap(map);
				} else {
					// Update marker position
					marker.setPosition(clickPosition);
				}

				// Update coordinates
				const lat = clickPosition.getLatitude();
				const lng = clickPosition.getLongitude();

				// Reverse geocode to get address
				const address = await reverseGeocode(lat, lng);
				onLocationChange(lat, lng, address);
			});

			mapRef.current = map;
			markerRef.current = marker;
		});

		// Cleanup function
		return () => {
			// Voxel.Maps doesn't require explicit cleanup
			// Maps are managed by the global Voxel.Maps system
			mapRef.current = null;
			markerRef.current = null;
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Update marker position when lat/lng props change externally
	// Evidence: themes/voxel/assets/dist/create-post.js - watch: { 'field.value.latitude', 'field.value.longitude' }
	useEffect(() => {
		if (!mapRef.current || !markerRef.current) return;
		if (!window.Voxel?.Maps) return;

		const position = getMarkerPosition();
		if (position) {
			markerRef.current.setPosition(position);
			mapRef.current.setCenter(position);
		}
	}, [latitude, longitude, getMarkerPosition]);

	return (
		<>
			{/* EXACT Voxel: location-field.php line 45 - JUST the map div */}
			{/* Voxel CSS (.location-field-map) already sets height: 170px, width: 100%, etc. */}
			<div
				ref={mapContainerRef}
				className="location-field-map"
			/>

			{/* Hidden marker template - EXACT Voxel: location-field.php lines 71-75 */}
			<div ref={markerTemplateRef} className="hidden" style={{ display: 'none' }}>
				<div className="map-marker marker-type-icon mi-static">
					<svg width="80" height="80" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12.4889 2.92383C8.95113 2.92383 6.08319 5.79177 6.08319 9.32956C6.08319 11.6495 6.94359 13.7621 7.97903 15.4696C9.01631 17.18 10.2563 18.5287 11.0825 19.3353C11.8807 20.1145 13.1282 20.1132 13.9244 19.3314C14.7468 18.5241 15.9797 17.1754 17.0107 15.4655C18.04 13.7585 18.8947 11.6473 18.8947 9.32956C18.8947 5.79177 16.0267 2.92383 12.4889 2.92383ZM9.48926 9.32812C9.48926 7.67127 10.8324 6.32812 12.4893 6.32812C14.1461 6.32812 15.4893 7.67127 15.4893 9.32812C15.4893 10.985 14.1461 12.3281 12.4893 12.3281C10.8324 12.3281 9.48926 10.985 9.48926 9.32812Z" fill="#343C54"/>
					</svg>
				</div>
			</div>
		</>
	);
};
