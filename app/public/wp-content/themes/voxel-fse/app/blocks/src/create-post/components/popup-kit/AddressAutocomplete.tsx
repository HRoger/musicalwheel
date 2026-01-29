/**
 * AddressAutocomplete Component - EXACT Voxel Implementation using Voxel.Maps.Autocomplete
 *
 * Uses Voxel.Maps API for provider-native autocomplete (Google Places or Mapbox Geocoding)
 *
 * Evidence: themes/voxel/assets/dist/create-post.js - Autocomplete initialization
 *
 * Voxel.Maps.Autocomplete API:
 * - Constructor: new Voxel.Maps.Autocomplete(inputElement, callback, config)
 * - Callback receives: { address: string, latlng: VoxelLatLng, viewport: any }
 * - Autocomplete UI is handled natively by map provider (NOT custom dropdown)
 *
 * CRITICAL: Renders EXACT Voxel HTML structure (NO wrapper div!)
 * - Voxel: <div class="ts-input-icon flexify"><input /></div>
 * - This component: Fragment with ts-input-icon directly
 *
 * Voxel Template: themes/voxel/templates/widgets/create-post/location-field.php (lines 14-23)
 */
import React, { useEffect, useRef } from 'react';

// TypeScript declarations for Voxel.Maps.Autocomplete
declare global {
	interface Window {
		Voxel?: {
			Maps?: {
				await: (callback: () => void) => void;
				Autocomplete: new (
					element: HTMLInputElement,
					callback: (result: VoxelAutocompleteResult | null) => void,
					config?: VoxelAutocompleteConfig
				) => VoxelAutocompleteInstance;
				LatLng: new (lat: number, lng: number) => VoxelLatLng;
			};
		};
	}
}

interface VoxelLatLng {
	getLatitude(): number;
	getLongitude(): number;
	toGeocoderFormat(): { lat: number; lng: number };
}

/**
 * Bounds object for map fitting (provider-specific format)
 */
interface MapViewport {
	north?: number;
	south?: number;
	east?: number;
	west?: number;
}

interface VoxelAutocompleteResult {
	address: string;
	latlng: VoxelLatLng;
	viewport?: MapViewport; // Bounds object for map fitting
}

interface VoxelAutocompleteConfig {
	// Autocomplete configuration options (if any)
	// Based on map provider (Google Places or Mapbox Geocoding)
}

interface VoxelAutocompleteInstance {
	// Instance methods (if any)
	// Evidence: themes/voxel/assets/dist/create-post.js
}

interface AddressAutocompleteProps {
	value: string;
	onChange: (value: string) => void;
	onSelect: (address: string, lat: number, lng: number) => void;
	onBlur?: () => void;
	placeholder?: string;
	className?: string;
	iconHtml?: string;
}

/**
 * AddressAutocomplete Component
 *
 * Provides address search with autocomplete using Voxel.Maps.Autocomplete
 *
 * Evidence: themes/voxel/assets/dist/create-post.js - setupAutocomplete() method
 */
export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
	value,
	onChange,
	onSelect,
	onBlur,
	placeholder = 'Enter address',
	className = 'ts-filter',
	iconHtml
}) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const autocompleteRef = useRef<VoxelAutocompleteInstance | null>(null);

	// Initialize Voxel.Maps.Autocomplete
	// Evidence: themes/voxel/assets/dist/create-post.js - mounted() hook
	useEffect(() => {
		if (!inputRef.current) return;
		let retryCount = 0;
		let retryInterval: ReturnType<typeof setInterval> | null = null;
		let awaitCallbackRegistered = false;
		let initialized = false;

		// DEBUG: Check Voxel.Maps.Autocomplete availability
		console.log('[AddressAutocomplete] Initializing autocomplete...');
		console.log('[AddressAutocomplete] window.Voxel:', window.Voxel);
		console.log('[AddressAutocomplete] window.Voxel?.Maps:', window.Voxel?.Maps);
		console.log('[AddressAutocomplete] window.Voxel?.Maps?.Autocomplete:', window.Voxel?.Maps?.Autocomplete);

		const initAutocomplete = () => {
			if (!inputRef.current || initialized) return;
			if (!window.Voxel?.Maps?.Autocomplete) {
				console.error('[AddressAutocomplete] ERROR: Voxel.Maps.Autocomplete not available');
				return;
			}

			initialized = true;
			if (retryInterval) {
				clearInterval(retryInterval);
				retryInterval = null;
			}

			// Create autocomplete instance
			// Evidence: themes/voxel/assets/dist/create-post.js - new Voxel.Maps.Autocomplete()
			const autocomplete = new window.Voxel.Maps.Autocomplete(
				inputRef.current,
				(result: VoxelAutocompleteResult | null) => {
					if (result) {
						// Extract data from result
						const address = result.address;
						const lat = result.latlng.getLatitude();
						const lng = result.latlng.getLongitude();

						// Update parent component
						onChange(address);
						onSelect(address, lat, lng);

						// Note: Map bounds fitting (result.viewport) would be handled
						// by parent component if a map instance is available
					}
				},
				{} // Config options (empty for default behavior)
			);

			autocompleteRef.current = autocomplete;
			console.log('[AddressAutocomplete] Autocomplete initialized successfully');
		};

		// Check and init with retries
		// CRITICAL: Must keep retrying until:
		// 1. Voxel.Maps exists (from vx:commons.js in footer)
		// 2. await() callback is registered
		// 3. Autocomplete is available (after Google Maps async loads and calls callback)
		const checkAndInit = () => {
			if (initialized) return;
			retryCount++;

			// First, try to register await callback if not yet done
			if (!awaitCallbackRegistered && window.Voxel?.Maps?.await) {
				awaitCallbackRegistered = true;
				console.log('[AddressAutocomplete] Registering Voxel.Maps.await callback...');
				window.Voxel.Maps.await(() => {
					console.log('[AddressAutocomplete] Voxel.Maps.await callback fired!');
					if (window.Voxel?.Maps?.Autocomplete) {
						initAutocomplete();
					}
				});
			}

			// Also try direct init if Autocomplete is already available
			if (window.Voxel?.Maps?.Autocomplete) {
				console.log('[AddressAutocomplete] Autocomplete class available, initializing...');
				initAutocomplete();
				return;
			}

			// Keep retrying longer for async Google Maps to load
			// Google Maps loads asynchronously and can take several seconds
			if (retryCount >= 100) {
				// After 10 seconds (100 * 100ms), stop retrying
				if (retryInterval) {
					clearInterval(retryInterval);
					retryInterval = null;
				}
				console.error('[AddressAutocomplete] ERROR: Voxel.Maps.Autocomplete not available after 100 retries (10 seconds)');
			} else if (retryCount % 20 === 0) {
				// Log progress every 2 seconds
				console.log(`[AddressAutocomplete] Still waiting for Autocomplete... (${retryCount}/100 retries)`);
			}
		};

		// Start retry interval - check every 100ms
		retryInterval = setInterval(checkAndInit, 100);

		// Also try immediately
		checkAndInit();

		// Listen for 'maps:loaded' event as additional trigger
		// Evidence: Voxel fires this event when maps are ready
		const handleMapsLoaded = () => {
			console.log('[AddressAutocomplete] maps:loaded event received');
			if (window.Voxel?.Maps?.Autocomplete) {
				initAutocomplete();
			}
		};
		document.addEventListener('maps:loaded', handleMapsLoaded);

		// Cleanup function
		return () => {
			// Clear any pending retry interval
			if (retryInterval) {
				clearInterval(retryInterval);
			}
			document.removeEventListener('maps:loaded', handleMapsLoaded);
			// Voxel.Maps.Autocomplete cleanup (if needed)
			// Evidence: themes/voxel/assets/dist/create-post.js - beforeDestroy() hook
			autocompleteRef.current = null;
		};
	}, []); // Only run once on mount

	// Handle manual input changes (user typing without selecting from autocomplete)
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange(e.target.value);
	};

	return (
		<>
			{/* EXACT Voxel HTML structure - NO wrapper div! */}
			{/* Evidence: themes/voxel/templates/widgets/create-post/location-field.php lines 14-23 */}
			<div className="ts-input-icon flexify">
				{iconHtml && <span dangerouslySetInnerHTML={{ __html: iconHtml }} />}
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={handleInputChange}
					onBlur={onBlur}
					className={className}
					placeholder={placeholder}
					autoComplete="off"
				/>
			</div>

			{/*
				NO custom dropdown!
				Voxel.Maps.Autocomplete handles autocomplete UI natively via map provider:
				- Google Places Autocomplete (if Google Maps is configured)
				- Mapbox Geocoding API (if Mapbox is configured)

				The provider's native autocomplete dropdown appears automatically
				when user types in the input field.
			*/}
		</>
	);
};
