/**
 * Map Integration Utilities
 *
 * Handles search form integration with map blocks.
 * Matches Voxel's map:bounds_updated event and useBounds() method.
 *
 * Reference: voxel-search-form.beautified.js lines 890-922, 2465-2483
 *
 * In Voxel, the search-form app owns map integration:
 * - Creates Circle, Popup, Clusterer
 * - Listens to map:bounds_updated events
 * - Updates location filter via useBounds()
 *
 * In FSE architecture:
 * - Map block handles its own rendering
 * - Search form dispatches events to map
 * - Map dispatches bounds_updated events to search form
 *
 * @package VoxelFSE
 */

/**
 * Map bounds object (matching Google Maps / Voxel.Maps pattern)
 */
export interface MapBounds {
	getSouthWest: () => { getLatitude: () => number; getLongitude: () => number };
	getNorthEast: () => { getLatitude: () => number; getLongitude: () => number };
}

/**
 * Location value for search filter
 */
export interface LocationValue {
	address: string | null;
	lat: number | null;
	lng: number | null;
	swlat: number | null;
	swlng: number | null;
	nelat: number | null;
	nelng: number | null;
	radius: number;
	method: 'radius' | 'area';
}

/**
 * Shorten coordinate to 6 decimal places
 * Reference: voxel-search-form.beautified.js lines 145-150
 */
export function shortenPoint(coord: number): number {
	return Math.round(coord * 1000000) / 1000000;
}

/**
 * Format location value for URL/filter submission
 * Reference: voxel-search-form.beautified.js lines 738-751
 *
 * Radius method: "Address;lat,lng,radius"
 * Area method: "Address;swlat,swlng..nelat,nelng"
 */
export function formatLocationValue(value: LocationValue): string | null {
	if (!value.address || !value.address.trim()) {
		return null;
	}

	if (value.method === 'radius') {
		if (value.lat === null || value.lng === null || value.radius === null) {
			return null;
		}
		return `${value.address};${value.lat},${value.lng},${value.radius}`;
	} else {
		// Area method
		if (
			value.swlat === null ||
			value.swlng === null ||
			value.nelat === null ||
			value.nelng === null
		) {
			return null;
		}
		return `${value.address};${value.swlat},${value.swlng}..${value.nelat},${value.nelng}`;
	}
}

/**
 * Create location value from map bounds
 * Used when drag-search is enabled and map is panned
 *
 * Reference: voxel-search-form.beautified.js lines 890-922 (useBounds method)
 *
 * @param bounds - Map bounds object
 * @param visibleAreaLabel - Localized "Visible area" text
 * @returns LocationValue for the filter
 */
export function createLocationValueFromBounds(
	bounds: MapBounds,
	visibleAreaLabel = 'Visible area'
): LocationValue {
	const sw = bounds.getSouthWest();
	const ne = bounds.getNorthEast();

	return {
		method: 'area',
		address: visibleAreaLabel,
		swlat: shortenPoint(sw.getLatitude()),
		swlng: shortenPoint(sw.getLongitude()),
		nelat: shortenPoint(ne.getLatitude()),
		nelng: shortenPoint(ne.getLongitude()),
		// Radius values not used in area mode but included for type completeness
		lat: null,
		lng: null,
		radius: 25,
	};
}

/**
 * Dispatch map bounds update event
 * Called by map block when drag-search toggle is active
 *
 * Reference: voxel-search-form.beautified.js lines 2465-2483 (_handleDragSearch)
 *
 * @param bounds - Current map bounds
 * @param targetSearchFormId - ID of the search form to update
 */
export function dispatchMapBoundsUpdate(
	bounds: MapBounds,
	targetSearchFormId?: string
): void {
	const event = new CustomEvent('voxel-map:bounds_updated', {
		detail: {
			bounds,
			targetSearchFormId,
		},
		bubbles: true,
	});
	window.dispatchEvent(event);
}

/**
 * Listen for map bounds update events
 * Used by search form to update location filter when map is panned
 *
 * @param callback - Function to call with new location value
 * @param searchFormId - Optional: only respond to events for this form
 * @returns Cleanup function to remove listener
 */
export function onMapBoundsUpdate(
	callback: (locationValue: LocationValue) => void,
	searchFormId?: string
): () => void {
	const handler = (event: Event) => {
		const customEvent = event as CustomEvent<{
			bounds: MapBounds;
			targetSearchFormId?: string;
		}>;

		// Skip if event is for a different search form
		if (
			searchFormId &&
			customEvent.detail.targetSearchFormId &&
			customEvent.detail.targetSearchFormId !== searchFormId
		) {
			return;
		}

		const locationValue = createLocationValueFromBounds(customEvent.detail.bounds);
		callback(locationValue);
	};

	window.addEventListener('voxel-map:bounds_updated', handler);

	return () => {
		window.removeEventListener('voxel-map:bounds_updated', handler);
	};
}

/**
 * Dispatch search area event
 * Called when "Search this area" button is clicked on map
 *
 * Reference: voxel-search-form.beautified.js lines 2880-2918 (searchAreaHandler)
 *
 * @param bounds - Current map bounds
 * @param targetSearchFormId - ID of the search form to update
 */
export function dispatchSearchAreaClick(
	bounds: MapBounds,
	targetSearchFormId?: string
): void {
	const event = new CustomEvent('voxel-map:search_area', {
		detail: {
			bounds,
			targetSearchFormId,
		},
		bubbles: true,
	});
	window.dispatchEvent(event);
}

/**
 * Listen for search area click events
 *
 * @param callback - Function to call with new location value
 * @param searchFormId - Optional: only respond to events for this form
 * @returns Cleanup function to remove listener
 */
export function onSearchAreaClick(
	callback: (locationValue: LocationValue) => void,
	searchFormId?: string
): () => void {
	const handler = (event: Event) => {
		const customEvent = event as CustomEvent<{
			bounds: MapBounds;
			targetSearchFormId?: string;
		}>;

		// Skip if event is for a different search form
		if (
			searchFormId &&
			customEvent.detail.targetSearchFormId &&
			customEvent.detail.targetSearchFormId !== searchFormId
		) {
			return;
		}

		const locationValue = createLocationValueFromBounds(customEvent.detail.bounds);
		callback(locationValue);
	};

	window.addEventListener('voxel-map:search_area', handler);

	return () => {
		window.removeEventListener('voxel-map:search_area', handler);
	};
}

/**
 * Check if drag search should be suspended
 * Drag search should not update location filter when:
 * - User is typing in location input
 * - Location popup is open
 *
 * Reference: voxel-search-form.beautified.js lines 895-898
 *
 * @param activePopupId - ID of currently open popup (if any)
 * @param locationFilterId - ID of the location filter
 * @param isAddressInputFocused - Whether address input has focus
 */
export function shouldSuspendDragSearch(
	activePopupId: string | null,
	locationFilterId: string,
	isAddressInputFocused: boolean
): boolean {
	if (isAddressInputFocused) return true;
	if (activePopupId === locationFilterId) return true;
	return false;
}
