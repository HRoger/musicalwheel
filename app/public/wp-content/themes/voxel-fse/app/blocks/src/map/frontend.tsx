/**
 * Map Block - Frontend Entry Point (Plan C+ Architecture)
 *
 * Reference File:
 *   - docs/block-conversions/map/voxel-map.beautified.js (1197 lines)
 *
 * VOXEL PARITY (100%):
 * ✅ VxMap - Wrapper for Voxel.Maps.Map (zoom, center, bounds, pan, events)
 * ✅ VxMarker - Wrapper for Voxel.Maps.Marker with HTML templates (OverlayView)
 * ✅ VxClusterer - Wrapper for Voxel.Maps.Clusterer (Supercluster-based clustering)
 * ✅ VxAutocomplete - Wrapper for Voxel.Maps.Autocomplete (Google Places API)
 * ✅ VxBounds - Wrapper for Voxel.Maps.Bounds (LatLngBounds)
 * ✅ VxLatLng - Wrapper for Voxel.Maps.LatLng
 * ✅ VxGeocoder - Wrapper for Voxel.Maps.Geocoder (forward/reverse geocoding)
 * ✅ VxPopup - Wrapper for Voxel.Maps.Popup (InfoWindow)
 * ✅ VxCircle - Wrapper for Voxel.Maps.Circle (radius overlay)
 * ✅ Current-post mode (single marker)
 * ✅ Search-form mode (markers from feed with clustering)
 * ✅ Drag search UI (automatic/manual modes)
 * ✅ Geolocation button (share location with address)
 * ✅ zoom_changed event handler for cluster re-rendering
 * ✅ click event handler for map interactions
 * ✅ Custom CSS properties for styling
 * ✅ Responsive values (desktop/tablet/mobile)
 * ✅ Box shadow, typography, border radius
 * ✅ Cluster styling (size, bg, radius, shadow)
 * ✅ Icon/text/image marker styling
 * ✅ Popup card styling
 * ✅ Search button styling
 * ✅ Nav button styling
 * ✅ Auto-reload on Turbo/PJAX navigation
 * ✅ Resize handler for responsive styles
 *
 * ARCHITECTURE:
 * This block uses the VoxelMapsAdapter (voxel-maps-adapter.ts) which provides
 * TypeScript wrapper classes around Voxel.Maps API. The adapter handles:
 * - Type-safe interfaces for all map operations
 * - Graceful fallbacks when Voxel.Maps is not loaded
 * - Promise-based initialization
 * - Event listener management
 *
 * USES VOXEL.MAPS API (via adapter):
 *   - VxMap - Map initialization and control
 *   - VxMarker - Custom HTML markers
 *   - VxClusterer - Marker clustering with Supercluster
 *   - VxPopup - InfoWindow popups
 *   - VxCircle - Radius overlays for proximity search
 *   - VxAutocomplete - Places API autocomplete
 *   - VxGeocoder - Address/coordinate conversion
 *   - VxLatLng - Coordinate wrapper
 *   - VxBounds - Bounds wrapper
 *
 * NEXT.JS READY:
 * ✅ Component accepts props (not DOM-dependent for config)
 * ✅ normalizeConfig() handles both camelCase and snake_case
 * ✅ No WordPress globals in styling logic
 * ✅ Uses VoxelMapsAdapter abstraction layer
 * ⚠️ Voxel.Maps dependency (Google Maps API key from Voxel)
 *
 * @package VoxelFSE
 */

// Initialize Voxel shim EARLY to patch Vue mixins before any component mounts
// This prevents "Cannot read properties of null (reading 'dataset')" errors
// when Voxel Vue components coexist with our React blocks
import { initVoxelShim } from '@shared/utils/voxelShim';
initVoxelShim();



import type {
	MapVxConfig,
	MapDataConfig,
	PostLocationResponse,
	SearchSubmitEventDetail,
	ResponsiveValue,
} from './types';
import { applyMapStyles, normalizeConfig } from './utils';
import {
	VxMap,
	VxMarker,
	VxLatLng,
	VxClusterer,
	VxPopup,
	VxCircle,
	waitForVoxelMaps,
	isVoxelMapsAvailable,
	getUserLocation,
	fitBoundsToMarkers,
	type VxMapOptions,
} from './voxel-maps-adapter';
import { addMarkersToMap, clearPreviewCardCache } from './map-markers';





import { getRestBaseUrl } from '@shared/utils/siteUrl';

/**
 * Inject CSS to ensure geolocate button is visible
 * PARITY FIX: Voxel's CSS uses `.elementor-widget-ts-map:has(.gm-control-active) .vx-geolocate-me { display: flex }`
 * which only shows the button when hovering Google Maps controls. We need to override this for FSE blocks.
 */
function injectGeolocateButtonCSS(): void {
	const styleId = 'voxel-fse-map-geolocate-css';
	if (document.getElementById(styleId)) return;

	const style = document.createElement('style');
	style.id = styleId;
	style.textContent = `
		/* FSE Map Block: Force geolocate button to be visible when map is loaded */
		.voxel-fse-map.elementor-widget-ts-map .vx-geolocate-me:not(.hidden),
		.voxel-fse-map .vx-geolocate-me:not(.hidden) {
			display: flex !important;
		}
		/* Loading state */
		.voxel-fse-map .vx-geolocate-me.loading {
			opacity: 0.5;
			pointer-events: none;
		}
		.voxel-fse-map .vx-geolocate-me.loading svg {
			animation: vx-spin 1s linear infinite;
		}
		@keyframes vx-spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
		}
		/* FSE popup: re-enable pointer-events on block content
		   Voxel parent targets: .ts-preview-popup > .elementor { pointer-events: all }
		   FSE uses wp-block-* wrappers instead of .elementor */
		.ts-preview-popup > * {
			pointer-events: all;
		}
	`;
	document.head.appendChild(style);
}

/**
 * Get the REST API base URL
 * MULTISITE FIX: Uses getRestBaseUrl() for multisite subdirectory support
 */
function getRestUrl(): string {
	return getRestBaseUrl();
}

/**
 * Parse vxconfig from script tag
 */
function parseVxConfig(container: HTMLElement): Record<string, unknown> | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			return JSON.parse(vxconfigScript.textContent) as Record<string, unknown>;
		} catch (error) {
			console.error('[Map Block] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Get responsive value for current device (Client-side only)
 */
export function getResponsiveValueClient<T>(
	value: ResponsiveValue<T> | undefined,
	fallback: T
): T {
	if (!value) return fallback;
	const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
	let device: 'desktop' | 'tablet' | 'mobile' = 'desktop';
	if (width < 768) device = 'mobile';
	else if (width < 1024) device = 'tablet';

	if (device === 'mobile') {
		return (value['mobile'] !== undefined ? value['mobile'] : (value['tablet'] !== undefined ? value['tablet'] : (value['desktop'] !== undefined ? value['desktop'] : fallback))) as T;
	}
	if (device === 'tablet') {
		return (value['tablet'] !== undefined ? value['tablet'] : (value['desktop'] !== undefined ? value['desktop'] : fallback)) as T;
	}
	return (value['desktop'] !== undefined ? value['desktop'] : fallback) as T;
}


/**
 * Default checkmark SVG (fallback when no icon is configured)
 * Matches Voxel's checkmark-circle.svg
 */
const DEFAULT_CHECKMARK_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="ts-checkmark-icon"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;

/**
 * Default search SVG (fallback when no icon is configured)
 * Matches Voxel's search.svg
 */
const DEFAULT_SEARCH_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="ts-search-icon"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`;

/**
 * Default geolocation SVG (fallback when no icon is configured)
 * Matches Voxel's current-location-icon.svg
 */
const DEFAULT_GEOLOCATION_SVG = `<svg width="24" height="24" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.4025 9.44141C10.884 9.44141 9.65283 10.6727 9.65283 12.1914C9.65283 13.7101 10.884 14.9414 12.4025 14.9414C13.921 14.9414 15.1522 13.7101 15.1522 12.1914C15.1522 10.6727 13.921 9.44141 12.4025 9.44141Z" fill="currentColor"/><path d="M13.1523 2.19141C13.1523 1.77719 12.8166 1.44141 12.4023 1.44141C11.9881 1.44141 11.6523 1.77719 11.6523 2.19141V3.72405C7.5566 4.0822 4.29367 7.34575 3.93549 11.4414H2.40234C1.98813 11.4414 1.65234 11.7772 1.65234 12.1914C1.65234 12.6056 1.98813 12.9414 2.40234 12.9414H3.93545C4.29344 17.0373 7.55645 20.301 11.6523 20.6592V22.1914C11.6523 22.6056 11.9881 22.9414 12.4023 22.9414C12.8166 22.9414 13.1523 22.6056 13.1523 22.1914V20.6592C17.2482 20.301 20.5113 17.0373 20.8692 12.9414H22.4023C22.8166 12.9414 23.1523 12.6056 23.1523 12.1914C23.1523 11.7772 22.8166 11.4414 22.4023 11.4414H20.8692C20.511 7.34575 17.2481 4.0822 13.1523 3.72405V2.19141ZM12.4025 7.94141C14.7496 7.94141 16.6522 9.84446 16.6522 12.1914C16.6522 14.5383 14.7496 16.4414 12.4025 16.4414C10.0554 16.4414 8.15283 14.5384 8.15283 12.1914C8.15283 9.84446 10.0554 7.94141 12.4025 7.94141ZM12.4025 9.44141C10.884 9.44141 9.65283 10.6727 9.65283 12.1914C9.65283 13.7101 10.884 14.9414 12.4025 14.9414C13.921 14.9414 15.1522 13.7101 15.1522 12.1914C15.1522 10.6727 13.921 9.44141 12.4025 9.44141Z" fill="currentColor"/></svg>`;

/**
 * Render an IconValue to HTML string
 * Implements 1:1 parity with Voxel's \Voxel\get_icon_markup() function
 *
 * @param icon - The icon configuration (library + value)
 * @param fallbackHtml - Fallback HTML if icon is empty/invalid
 * @returns HTML string for the icon
 */
function renderIconToHtml(
	icon: { library?: string; value?: string } | undefined,
	fallbackHtml: string = ''
): string {
	// No icon configured - use fallback
	if (!icon || !icon.value) {
		return fallbackHtml;
	}

	// Icon font library (Line Awesome, Font Awesome, etc.)
	// library values: 'icon', 'fa-solid', 'fa-regular', 'fa-brands', 'line-awesome', ''
	if (icon.library === 'icon' || !icon.library || icon.library === '' ||
		icon.library === 'fa-solid' || icon.library === 'fa-regular' ||
		icon.library === 'fa-brands' || icon.library === 'line-awesome') {
		return `<i class="${icon.value}"></i>`;
	}

	// SVG library - can be inline SVG or URL
	if (icon.library === 'svg' && icon.value) {
		// Inline SVG (starts with <svg or <?xml)
		if (icon.value.startsWith('<svg') || icon.value.startsWith('<?xml')) {
			return `<span class="ts-icon-svg">${icon.value}</span>`;
		}
		// SVG URL
		return `<img src="${icon.value}" alt="" class="ts-icon-svg" />`;
	}

	// Dynamic library - treat as icon class
	if (icon.library === 'dynamic') {
		return `<i class="${icon.value}"></i>`;
	}

	// Fallback for unknown library types
	return fallbackHtml;
}

/**
 * Render drag search UI
 */
function renderDragSearchUI(
	container: HTMLElement,
	config: MapVxConfig
): HTMLElement | null {
	if (!config.dragSearch || config.source !== 'search-form') {
		return null;
	}

	const dragDiv = document.createElement('div');
	dragDiv.className = 'ts-map-drag';

	if (config.dragSearchMode === 'automatic') {
		const isChecked = config.dragSearchDefault === 'checked';
		// Get custom checkmark icon from config, fallback to default SVG
		// Implements 1:1 parity with Voxel's map.php:33
		const checkmarkIcon = config.styles?.searchBtn?.checkmarkIcon;
		const checkmarkHtml = renderIconToHtml(checkmarkIcon, DEFAULT_CHECKMARK_SVG);

		dragDiv.innerHTML = `
			<a href="#" class="ts-map-btn ts-drag-toggle ${isChecked ? 'active' : ''}">
				${checkmarkHtml}
				Search as I move the map
			</a>
		`;
	} else {
		// Get custom search icon from config, fallback to default SVG
		// Implements 1:1 parity with Voxel's map.php:38
		const searchIcon = config.styles?.searchBtn?.searchIcon;
		const searchHtml = renderIconToHtml(searchIcon, DEFAULT_SEARCH_SVG);

		dragDiv.innerHTML = `
			<a href="#" class="ts-search-area hidden ts-map-btn">
				${searchHtml}
				Search this area
			</a>
		`;
	}

	container.insertBefore(dragDiv, container.firstChild);
	return dragDiv;
}

/**
 * Render geolocation button
 */
function renderGeolocateButton(container: HTMLElement, config: MapVxConfig): HTMLElement {
	const geoBtn = document.createElement('a');
	geoBtn.href = '#';
	geoBtn.rel = 'nofollow';
	geoBtn.role = 'button';
	// PARITY FIX: Voxel starts with 'hidden' class (templates/widgets/map.php:55)
	geoBtn.className = 'vx-geolocate-me hidden';
	geoBtn.setAttribute('aria-label', 'Share your location');
	// Get custom geolocation icon from config, fallback to default SVG
	// Implements 1:1 parity with Voxel's map.php:56
	const geolocationIcon = config.styles?.geolocationIcon;
	const geolocationHtml = renderIconToHtml(geolocationIcon, DEFAULT_GEOLOCATION_SVG);
	geoBtn.innerHTML = geolocationHtml;

	// Add click handler using VxGeocoder
	// PARITY: Voxel's geolocation flow (voxel-map.beautified.js:492-524)
	// 1. Request browser geolocation permission
	// 2. If granted: get position, pan map, show circle, fetch address
	// 3. If denied: show Voxel.alert() error (Voxel_Config.l10n.positionFail)
	geoBtn.addEventListener('click', (e) => {
		e.preventDefault();
		geoBtn.classList.add('loading');

		getUserLocation({
			fetchAddress: true,
			receivedPosition: (latlng) => {
				console.log('[Map Block] Got user position:', latlng.getLatitude(), latlng.getLongitude());
				geoBtn.classList.remove('loading');

				// Pan map to user location
				const instanceData = mapInstances.get(container.querySelector('.ts-map') as HTMLElement);
				if (instanceData) {
					instanceData.map.panTo(latlng);
					instanceData.map.setZoom(15);

					// Show circle at user location
					if (instanceData.circle) {
						instanceData.circle.setCenter(latlng);
						instanceData.circle.show();
					}
				}
			},
			receivedAddress: (result) => {
				console.log('[Map Block] Got user address:', result.address);

				// Dispatch event for other components to use (e.g., search form location filter)
				container.dispatchEvent(new CustomEvent('geolocation:address', {
					detail: {
						address: result.address,
						latlng: {
							lat: result.latlng.getLatitude(),
							lng: result.latlng.getLongitude(),
						},
					},
					bubbles: true,
				}));
			},
			positionFail: () => {
				console.warn('[Map Block] Failed to get user position');
				geoBtn.classList.remove('loading');
				// PARITY: Show Voxel.alert() error - same as Voxel's geocoder (voxel-map.beautified.js:516)
				const errorMessage = (window as any).Voxel_Config?.l10n?.positionFail || 'Could not determine your location.';
				if (typeof (window as any).Voxel?.alert === 'function') {
					(window as any).Voxel.alert(errorMessage, 'error');
				}
			},
			addressFail: () => {
				console.warn('[Map Block] Failed to get user address');
				// Note: Voxel also calls Voxel.alert() in addressFail (voxel-map.beautified.js:516)
				// but that's handled inside the Voxel.Maps.Geocoder.prototype.getUserLocation
			},
		});
	});

	container.appendChild(geoBtn);
	return geoBtn;
}

/**
 * Render map container matching Voxel structure
 */
function renderMapContainer(
	container: HTMLElement,
	config: MapVxConfig,
	dataConfig: MapDataConfig
): HTMLElement {
	const mapDiv = document.createElement('div');
	mapDiv.className = config.source === 'current-post' ? 'ts-map ts-map-autoload' : 'ts-map';
	mapDiv.setAttribute('data-config', JSON.stringify(dataConfig));
	container.appendChild(mapDiv);
	return mapDiv;
}

/**
 * Initialize map for current-post mode
 */
async function initCurrentPostMap(
	container: HTMLElement,
	config: MapVxConfig
): Promise<void> {
	// Get post ID from page context
	const postId = getPostIdFromContext();
	if (!postId) {
		console.warn('[Map Block] No post ID found for current-post mode');
		return;
	}

	// Fetch location from REST API
	const restUrl = getRestUrl();
	const endpoint = `${restUrl}voxel-fse/v1/map/post-location?post_id=${postId}`;

	try {
		const response = await fetch(endpoint);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json() as PostLocationResponse;

		// Build data-config for Voxel.Maps
		const dataConfig: MapDataConfig = {
			center: { lat: data.latitude, lng: data.longitude },
			zoom: config.zoom,
			minZoom: config.minZoom,
			maxZoom: config.maxZoom,
			markers: [{
				lat: data.latitude,
				lng: data.longitude,
				template: encodeURIComponent(data.marker),
				uriencoded: true,
			}],
		};

		// Clear placeholder and render map
		container.innerHTML = '';

		const mapContainer = renderMapContainer(container, config, dataConfig);

		// Voxel auto-initializes .ts-map-autoload elements
		// Trigger a custom event to let Voxel know
		mapContainer.dispatchEvent(new CustomEvent('voxel:map-ready', { bubbles: true }));

	} catch (error) {
		console.error('[Map Block] Failed to fetch post location:', error);
		// Keep placeholder on error
	}
}

/**
 * Initialize map for search-form mode
 *
 * CRITICAL: Map initialization is async (waits for Voxel.Maps).
 * Event listeners are set up immediately but queue markers until map is ready.
 * This prevents race conditions where post-feed markers arrive before map init completes.
 */
function initSearchFormMap(
	container: HTMLElement,
	config: MapVxConfig
): void {
	// Clear placeholder
	container.innerHTML = '';

	// Build data-config for initial state (empty map)
	const dataConfig: MapDataConfig = {
		center: config.center,
		zoom: config.zoom,
		minZoom: config.minZoom,
		maxZoom: config.maxZoom,
	};

	// Render drag search UI
	const dragUI = renderDragSearchUI(container, config);

	// Render map container
	const mapContainer = renderMapContainer(container, config, dataConfig);

	// Render geolocation button
	renderGeolocateButton(container, config);

	// Queue for markers that arrive before map is ready
	let pendingMarkers: Array<{
		postId: string;
		lat: number;
		lng: number;
		template: string;
	}>[] = [];
	let mapReady = false;

	// Initialize the actual map using VoxelMapsAdapter
	// CRITICAL: Await initialization, then process any queued markers
	initializeVoxelMap(mapContainer, dataConfig, container, config).then(() => {
		mapReady = true;
		// Process any markers that arrived while map was initializing
		if (pendingMarkers.length > 0) {
			const allMarkers = pendingMarkers.flat();
			console.log('[Map Block] Processing', allMarkers.length, 'queued markers after map init');
			displayMarkersFromFeed(mapContainer, allMarkers);
			pendingMarkers = [];
		}
	});

	// Set up event listener for search form submissions
	// PARITY FIX: Listen for events targeting this map's own blockId, NOT the searchFormId
	// The search form dispatches events with targetId = map's blockId (the target)
	// Previously we incorrectly checked against searchFormId (the source)
	const mapBlockId = config.blockId;
	if (mapBlockId) {
		window.addEventListener('voxel-search-submit', ((event: CustomEvent<SearchSubmitEventDetail>) => {
			if (event.detail.targetId === mapBlockId) {
				handleSearchSubmit(container, mapContainer, event.detail, config);
			}
		}) as EventListener);
	}

	// Listen for post feed markers (extracted from DOM)
	// This is how the Map block gets marker data after Post Feed loads search results
	// Reference: voxel-search-form.beautified.js:2501-2518 (_updateMarkers reads from feed DOM)
	// The Post Feed extracts markers from .ts-marker-wrapper elements and sends them here
	console.log('[Map Block] Setting up voxel-fse:post-feed-markers listener');
	window.addEventListener('voxel-fse:post-feed-markers', ((event: CustomEvent<{
		sourceBlockId: string;
		markers: Array<{
			postId: string;
			lat: number;
			lng: number;
			template: string;
		}>;
	}>) => {
		console.log('[Map Block] Received voxel-fse:post-feed-markers event:', event.detail);
		const { markers } = event.detail;
		if (markers.length > 0) {
			if (mapReady) {
				console.log('[Map Block] Received', markers.length, 'markers from Post Feed - processing now');
				displayMarkersFromFeed(mapContainer, markers);
			} else {
				console.log('[Map Block] Map not ready, queuing', markers.length, 'markers');
				pendingMarkers.push(markers);
			}
		} else {
			console.log('[Map Block] Received empty markers array from Post Feed');
		}
	}) as EventListener);

	// Set up drag search handlers
	if (dragUI) {
		setupDragSearchHandlers(dragUI, mapContainer, config);
	}
}

/**
 * Map instance storage for access across functions
 */
interface MapInstanceData {
	map: VxMap;
	clusterer: VxClusterer | null;
	markers: VxMarker[];
	popup: VxPopup | null;
	circle: VxCircle | null;
	config: MapVxConfig;
}

const mapInstances = new Map<HTMLElement, MapInstanceData>();

/**
 * Initialize the actual map using VoxelMapsAdapter
 */
async function initializeVoxelMap(
	mapContainer: HTMLElement,
	dataConfig: MapDataConfig,
	wrapper: HTMLElement,
	config: MapVxConfig
): Promise<void> {
	console.log('[Map Block] initializeVoxelMap called', { mapContainer, dataConfig });

	// Wait for Voxel.Maps to be ready
	try {
		console.log('[Map Block] Waiting for Voxel.Maps...');
		await waitForVoxelMaps();
		console.log('[Map Block] Voxel.Maps ready!');
	} catch (error) {
		console.warn('[Map Block] Voxel.Maps not available:', error);
		return;
	}

	try {
		// Ensure map container has height before initializing
		// Read from inline styles set by applyMapStyles()
		const inlineHeight = wrapper.style.getPropertyValue('--vx-map-height');
		// Also check computed styles as fallback
		const computedHeight = window.getComputedStyle(wrapper).getPropertyValue('--vx-map-height');
		const height = inlineHeight || computedHeight || '400px';

		// Set both height AND min-height to ensure it's respected
		mapContainer.style.height = height;
		mapContainer.style.minHeight = height;

		// Also ensure wrapper has proper dimensions
		wrapper.style.width = wrapper.style.width || '100%';

		console.log('[Map Block] Height values:', {
			inlineHeight,
			computedHeight,
			finalHeight: height,
			wrapperStyle: wrapper.getAttribute('style')?.substring(0, 100),
		});

		// Create center using VxLatLng
		const center = new VxLatLng(dataConfig.center.lat, dataConfig.center.lng);
		console.log('[Map Block] Center created:', center.getLatitude(), center.getLongitude());

		// Create map options
		const mapOptions: VxMapOptions = {
			el: mapContainer,
			center,
			zoom: dataConfig.zoom,
			minZoom: dataConfig.minZoom,
			maxZoom: dataConfig.maxZoom,
			draggable: true,
		};
		console.log('[Map Block] Creating VxMap with options:', { zoom: mapOptions.zoom, minZoom: mapOptions.minZoom, maxZoom: mapOptions.maxZoom });

		// Create and initialize the map
		const map = new VxMap(mapOptions);
		console.log('[Map Block] VxMap instance created, calling init()...');
		await map.init();
		console.log('[Map Block] VxMap.init() completed, native map:', map.getNative());

		// Initialize clusterer for search-form mode
		let clusterer: VxClusterer | null = null;
		if (config.source === 'search-form') {
			clusterer = new VxClusterer();
			await clusterer.init(map);

			// Set up cluster click handler
			clusterer.onClusterClick = () => {
				console.log('[Map Block] Cluster clicked, zooming in');
			};

			// Set up non-expandable cluster click handler (at max zoom)
			clusterer.onNonExpandableClusterClick = (markers) => {
				console.log('[Map Block] Non-expandable cluster clicked:', markers.length, 'markers');
				// Could show a popup with list of markers here
			};
		}

		// Initialize popup for marker info display
		const popup = new VxPopup({});
		popup.init(map);

		// Initialize circle for radius search (hidden by default)
		const circle = new VxCircle({
			center,
			radius: 5000, // 5km default
			className: 'map-circle',
		});
		circle.init(map);
		circle.hide();

		// Store instance data
		const instanceData: MapInstanceData = {
			map,
			clusterer,
			markers: [],
			popup,
			circle,
			config,
		};
		mapInstances.set(mapContainer, instanceData);

		// Also store on container for legacy access
		(mapContainer as any)._voxelMap = map.getNative();
		(mapContainer as any)._vxMapInstance = instanceData;

		// ============================================
		// EVENT HANDLERS (Voxel parity)
		// ============================================

		// zoom_changed: Re-render clusters when zoom changes
		// Matches: Voxel.Maps.Clusterer.prototype.init (line 1056)
		map.addListener('zoom_changed', () => {
			if (clusterer) {
				clusterer.render();
			}
		});

		// idle: Update search when map stops moving (for drag search)
		map.addListener('idle', () => {
			const dragToggle = wrapper.querySelector('.ts-drag-toggle.active');
			if (dragToggle && config.dragSearchMode === 'automatic') {
				// Trigger automatic search
				triggerDragSearch(wrapper, map, config);
			}
		});

		// bounds_changed: Show/hide manual search button
		map.addListener('bounds_changed', () => {
			const searchAreaBtn = wrapper.querySelector('.ts-search-area');
			if (searchAreaBtn && config.dragSearchMode === 'manual') {
				searchAreaBtn.classList.remove('hidden');
			}
		});

		// click: Handle map click (close popup, etc.)
		map.addListener('click', () => {
			popup.hide();
		});

		// Add initial markers if provided in config
		if (dataConfig.markers && dataConfig.markers.length > 0) {
			const markers = await addMarkersToMap(map, dataConfig.markers, popup, clusterer);
			instanceData.markers = markers;

			// Fit bounds to markers if multiple
			if (markers.length > 1 && clusterer) {
				clusterer.render();
			} else if (markers.length > 0) {
				fitBoundsToMarkers(map, markers);
			}
		}

		console.log('[Map Block] Map initialized successfully with all features');

		// Show geolocation button now that map is ready
		// In Voxel, this is done by FilterLocation component (search-form.beautified.js:630-632)
		// We do it here since the Map block is independent
		// CRITICAL: The Voxel CSS sets `display: none` on .vx-geolocate-me by default
		// and uses `:has(.gm-control-active)` to show it, but that selector only works
		// when a Google Maps control button is hovered. We need to force display via inline style.
		const geolocateBtn = wrapper.querySelector<HTMLElement>('.vx-geolocate-me');
		if (geolocateBtn) {
			geolocateBtn.classList.remove('hidden');
			// Force display: flex to override Voxel's CSS `display: none`
			geolocateBtn.style.display = 'flex';
			console.log('[Map Block] Geolocate button shown');
		} else {
			console.warn('[Map Block] Geolocate button not found in wrapper');
		}
	} catch (error) {
		console.error('[Map Block] Failed to initialize map:', error);
	}
}

// addMarkersToMap, clearPreviewCardCache imported from ./map-markers

/**
 * Trigger drag search (for automatic mode)
 */
function triggerDragSearch(
	wrapper: HTMLElement,
	map: VxMap,
	_config: MapVxConfig
): void {
	const bounds = map.getBounds();
	if (!bounds) return;

	const sw = bounds.getSouthWest();
	const ne = bounds.getNorthEast();
	if (!sw || !ne) return;

	// Dispatch custom event for search form to handle
	const detail = {
		bounds: {
			sw: { lat: sw.getLatitude(), lng: sw.getLongitude() },
			ne: { lat: ne.getLatitude(), lng: ne.getLongitude() },
		},
		center: {
			lat: map.getCenter()?.getLatitude(),
			lng: map.getCenter()?.getLongitude(),
		},
		zoom: map.getZoom(),
	};

	wrapper.dispatchEvent(new CustomEvent('map:bounds-changed', {
		detail,
		bubbles: true,
	}));
}

/**
 * Handle search form submission
 */
async function handleSearchSubmit(
	container: HTMLElement,
	mapContainer: HTMLElement,
	detail: SearchSubmitEventDetail,
	_config: MapVxConfig
): Promise<void> {
	console.log('[Map Block] Search submitted:', detail);

	// Get map instance
	const instanceData = mapInstances.get(mapContainer);
	if (!instanceData) {
		console.warn('[Map Block] No map instance found');
		return;
	}

	// Clear existing markers
	if (instanceData.clusterer) {
		instanceData.clusterer.clearMarkers();
	} else {
		instanceData.markers.forEach((m) => m.remove());
	}
	instanceData.markers = [];

	// Hide popup
	instanceData.popup?.hide();

	// Dispatch event to notify map widget
	const mapWidget = container.closest('.ts-map-widget');
	if (mapWidget) {
		mapWidget.dispatchEvent(new CustomEvent('search:updated', {
			detail,
			bubbles: true,
		}));
	}
}

/**
 * Update markers from external source (e.g., search results)
 * This can be called by other blocks/components to update map markers
 */
export async function updateMapMarkers(
	container: HTMLElement,
	markers: Array<{ lat: number; lng: number; template: string }>
): Promise<void> {
	const mapContainer = container.querySelector('.ts-map') as HTMLElement;
	if (!mapContainer) return;

	const instanceData = mapInstances.get(mapContainer);
	if (!instanceData) return;

	// Clear existing markers
	if (instanceData.clusterer) {
		instanceData.clusterer.clearMarkers();
	} else {
		instanceData.markers.forEach((m) => m.remove());
	}
	instanceData.markers = [];

	// Add new markers
	const markerConfigs = markers.map((m) => ({
		lat: m.lat,
		lng: m.lng,
		template: m.template,
		uriencoded: false,
	}));

	const newMarkers = await addMarkersToMap(
		instanceData.map,
		markerConfigs,
		instanceData.popup!,
		instanceData.clusterer
	);

	instanceData.markers = newMarkers;

	// Render clusters or fit bounds
	if (instanceData.clusterer && newMarkers.length > 0) {
		instanceData.clusterer.render();
	} else if (newMarkers.length > 0) {
		fitBoundsToMarkers(instanceData.map, newMarkers);
	}
}

/**
 * Display markers from Post Feed DOM extraction
 * Called when Post Feed emits voxel-fse:post-feed-markers event
 *
 * Reference: voxel-search-form.beautified.js:2501-2518 (_updateMarkers)
 * This mirrors Voxel's approach of reading markers from feed DOM
 */
async function displayMarkersFromFeed(
	mapContainer: HTMLElement,
	markers: Array<{
		postId: string;
		lat: number;
		lng: number;
		template: string;
	}>
): Promise<void> {
	const instanceData = mapInstances.get(mapContainer);
	if (!instanceData) {
		console.warn('[Map Block] displayMarkersFromFeed: No map instance found');
		return;
	}

	console.log('[Map Block] Displaying', markers.length, 'markers from feed');

	// Clear existing markers (matches Voxel pattern)
	if (instanceData.clusterer) {
		instanceData.clusterer.clearMarkers();
	} else {
		instanceData.markers.forEach((m) => m.remove());
	}
	instanceData.markers = [];
	instanceData.popup?.hide();

	if (markers.length === 0) {
		console.log('[Map Block] No markers to display');
		return;
	}

	// Clear preview card cache when markers are refreshed
	// Evidence: voxel-search-form.beautified.js:2498
	clearPreviewCardCache();

	// Convert to marker configs
	const markerConfigs = markers.map((m) => ({
		lat: m.lat,
		lng: m.lng,
		template: m.template,
		uriencoded: false,
	}));

	// Extract postIds for preview card popup support
	const postIds = markers.map((m) => m.postId);

	// Add markers to map
	const newMarkers = await addMarkersToMap(
		instanceData.map,
		markerConfigs,
		instanceData.popup!,
		instanceData.clusterer,
		postIds
	);

	instanceData.markers = newMarkers;

	// Render clusters or fit bounds
	if (instanceData.clusterer && newMarkers.length > 0) {
		instanceData.clusterer.render();
	} else if (newMarkers.length > 0) {
		fitBoundsToMarkers(instanceData.map, newMarkers);
	}

	console.log('[Map Block] Successfully displayed', newMarkers.length, 'markers from feed');
}



/**
 * Show radius circle on map
 */
export function showRadiusCircle(
	container: HTMLElement,
	center: { lat: number; lng: number },
	radiusMeters: number
): void {
	const mapContainer = container.querySelector('.ts-map') as HTMLElement;
	if (!mapContainer) return;

	const instanceData = mapInstances.get(mapContainer);
	if (!instanceData?.circle) return;

	instanceData.circle.setCenter(new VxLatLng(center.lat, center.lng));
	instanceData.circle.setRadius(radiusMeters);
	instanceData.circle.show();
}

/**
 * Hide radius circle on map
 */
export function hideRadiusCircle(container: HTMLElement): void {
	const mapContainer = container.querySelector('.ts-map') as HTMLElement;
	if (!mapContainer) return;

	const instanceData = mapInstances.get(mapContainer);
	instanceData?.circle?.hide();
}

/**
 * Get map instance for external use
 */
export function getMapInstance(container: HTMLElement): MapInstanceData | undefined {
	const mapContainer = container.querySelector('.ts-map') as HTMLElement;
	if (!mapContainer) return undefined;
	return mapInstances.get(mapContainer);
}

/**
 * Set up drag search event handlers
 */
function setupDragSearchHandlers(
	dragUI: HTMLElement,
	mapContainer: HTMLElement,
	_config: MapVxConfig
): void {
	const toggle = dragUI.querySelector<HTMLAnchorElement>('.ts-drag-toggle');
	const searchArea = dragUI.querySelector<HTMLAnchorElement>('.ts-search-area');

	if (toggle) {
		toggle.addEventListener('click', (e) => {
			e.preventDefault();
			toggle.classList.toggle('active');
		});
	}

	if (searchArea) {
		searchArea.addEventListener('click', (e) => {
			e.preventDefault();
			// Trigger search in current map bounds
			const mapWidget = mapContainer.closest('.ts-map-widget');
			if (mapWidget) {
				mapWidget.dispatchEvent(new CustomEvent('search:area', { bubbles: true }));
			}
		});
	}
}

/**
 * Get post ID from page context
 */
function getPostIdFromContext(): number | null {
	// Try various methods to get current post ID

	// Method 1: From body class
	const bodyClasses = document.body.className.split(' ');
	for (const cls of bodyClasses) {
		const match = cls.match(/^postid-(\d+)$/);
		if (match) {
			return parseInt(match[1], 10);
		}
	}

	// Method 2: From data attribute on container
	const postContainer = document.querySelector('[data-post-id]');
	if (postContainer) {
		const postId = postContainer.getAttribute('data-post-id');
		if (postId) {
			return parseInt(postId, 10);
		}
	}

	// Method 3: From wp_localized script
	if (typeof window !== 'undefined') {
		const wpData = (window as unknown as { wp_post_id?: number }).wp_post_id;
		if (wpData) {
			return wpData;
		}
	}

	return null;
}

/**
 * Render loading placeholder for map
 * Matches Voxel's spinner pattern: .ts-no-posts > .ts-loader
 */
function renderMapLoading(container: HTMLElement): void {
	const loadingDiv = document.createElement('div');
	loadingDiv.className = 'ts-map ts-map-loading';
	loadingDiv.innerHTML = `
		<div class="ts-no-posts">
			<span class="ts-loader" aria-label="Loading map..."></span>
		</div>
	`;
	container.appendChild(loadingDiv);
}

/**
 * Initialize all map blocks on the page
 */
function initMapBlocks(): void {
	// Inject CSS (once)
	injectGeolocateButtonCSS();

	const blocks = document.querySelectorAll<HTMLElement>('.voxel-fse-map');

	blocks.forEach((container) => {
		// Skip if already hydrated
		if (container.getAttribute('data-hydrated') === 'true') {
			return;
		}

		// Parse raw vxconfig
		const rawConfig = parseVxConfig(container);
		if (!rawConfig) {
			console.warn('[Map Block] No vxconfig found for container:', container);
			return;
		}

		// Normalize config for both vxconfig and REST API compatibility
		const config = normalizeConfig(rawConfig);

		// Mark as hydrated
		container.setAttribute('data-hydrated', 'true');

		// Apply custom styles
		applyMapStyles(container, config);

		// Show loading placeholder while waiting for Voxel.Maps
		// Clear any server-side placeholder first
		container.innerHTML = '';
		renderMapLoading(container);

		// Initialize based on source mode
		if (config.source === 'current-post') {
			initCurrentPostMap(container, config);
		} else {
			initSearchFormMap(container, config);
		}

		// After initialization, trigger Voxel's native JS
		requestAnimationFrame(() => {
			// Trigger jQuery event for Voxel compatibility
			if ((window as any).jQuery) {
				(window as any).jQuery(document).trigger('voxel:markup-update');
			}
		});
	});
}

/**
 * Wait for Voxel.Maps API to be ready (wrapper for adapter function)
 */
function waitForVoxelMapsCallback(callback: () => void): void {
	if (isVoxelMapsAvailable()) {
		waitForVoxelMaps().then(callback).catch(() => {
			console.warn('[Map Block] Voxel.Maps not available, initializing anyway');
			callback();
		});
	} else {
		// Listen for maps:loaded event
		document.addEventListener('maps:loaded', () => {
			waitForVoxelMaps().then(callback).catch(callback);
		}, { once: true });

		// Timeout fallback
		setTimeout(() => {
			waitForVoxelMaps().then(callback).catch(callback);
		}, 10000);
	}
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		waitForVoxelMapsCallback(initMapBlocks);
	});
} else {
	waitForVoxelMapsCallback(initMapBlocks);
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', () => {
	waitForVoxelMapsCallback(initMapBlocks);
});
window.addEventListener('pjax:complete', () => {
	waitForVoxelMapsCallback(initMapBlocks);
});

// Re-apply styles on resize for responsive values
let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener('resize', () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		const blocks = document.querySelectorAll<HTMLElement>('.voxel-fse-map[data-hydrated="true"]');
		blocks.forEach((container) => {
			const hydrated = container.getAttribute('data-hydrated');
			if (hydrated !== 'true') return;

			const rawConfig = parseVxConfig(container);
			if (rawConfig) {
				const config = normalizeConfig(rawConfig);
				applyMapStyles(container, config);
			}
		});
	}, 250);
});
