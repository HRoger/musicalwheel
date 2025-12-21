/**
 * Map (VX) Block - Frontend Entry Point (Plan C+ Architecture)
 *
 * Hydrates React by reading vxconfig JSON from save.tsx output.
 * Integrates with Voxel.Maps API (Google Maps/Mapbox abstraction).
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';

import type {
	MapVxConfig,
	MapDataConfig,
	PostLocationResponse,
	SearchSubmitEventDetail,
	BoxShadowValue,
	TypographyValue,
	ResponsiveValue,
} from './types';

/**
 * Global Voxel Maps API type declarations
 */
declare global {
	interface Window {
		Voxel?: {
			Maps?: VoxelMapsAPI;
		};
		wpApiSettings?: {
			root?: string;
		};
	}
}

interface VoxelMapsAPI {
	await: (callback: () => void) => void;
	LatLng: new (lat: number, lng: number) => VoxelLatLng;
	Bounds: new (sw: VoxelLatLng, ne: VoxelLatLng) => VoxelBounds;
	Map: new (container: HTMLElement, options: MapOptions) => VoxelMap;
	Marker: new (options: MarkerOptions) => VoxelMarker;
	Clusterer: new (map: VoxelMap, markers: VoxelMarker[]) => VoxelClusterer;
}

interface VoxelLatLng {
	getLatitude: () => number;
	getLongitude: () => number;
}

interface VoxelBounds {
	getSouthWest: () => VoxelLatLng;
	getNorthEast: () => VoxelLatLng;
}

interface MapOptions {
	center: { lat: number; lng: number };
	zoom: number;
	minZoom?: number;
	maxZoom?: number;
}

interface VoxelMap {
	setCenter: (latLng: VoxelLatLng) => void;
	setZoom: (zoom: number) => void;
	getCenter: () => VoxelLatLng;
	getBounds: () => VoxelBounds;
	fitBounds: (bounds: VoxelBounds) => void;
	addListener: (event: string, callback: () => void) => void;
	addListenerOnce: (event: string, callback: () => void) => unknown;
	removeListener: (listener: unknown) => void;
}

interface MarkerOptions {
	position: VoxelLatLng;
	map: VoxelMap;
	template?: string;
}

interface VoxelMarker {
	setPosition: (latLng: VoxelLatLng) => void;
	setMap: (map: VoxelMap | null) => void;
	getElement: () => HTMLElement;
}

interface VoxelClusterer {
	clearMarkers: () => void;
	addMarkers: (markers: VoxelMarker[]) => void;
}

import { getRestBaseUrl } from '@shared/utils/siteUrl';

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
function parseVxConfig(container: HTMLElement): MapVxConfig | null {
	const vxconfigScript = container.querySelector<HTMLScriptElement>('script.vxconfig');

	if (vxconfigScript && vxconfigScript.textContent) {
		try {
			return JSON.parse(vxconfigScript.textContent) as MapVxConfig;
		} catch (error) {
			console.error('[Map Block] Failed to parse vxconfig:', error);
		}
	}

	return null;
}

/**
 * Get current device type based on viewport
 */
function getCurrentDevice(): 'desktop' | 'tablet' | 'mobile' {
	const width = window.innerWidth;
	if (width < 768) return 'mobile';
	if (width < 1024) return 'tablet';
	return 'desktop';
}

/**
 * Get responsive value for current device
 */
function getResponsiveValue<T>(
	value: ResponsiveValue<T> | undefined,
	fallback: T
): T {
	if (!value) return fallback;
	const device = getCurrentDevice();

	// Try current device, then fallback to larger devices
	if (device === 'mobile') {
		return value.mobile ?? value.tablet ?? value.desktop ?? fallback;
	}
	if (device === 'tablet') {
		return value.tablet ?? value.desktop ?? fallback;
	}
	return value.desktop ?? fallback;
}

/**
 * Convert box shadow value to CSS
 */
function boxShadowToCSS(shadow: BoxShadowValue | undefined): string {
	if (!shadow?.enable) return 'none';
	const { horizontal = 0, vertical = 0, blur = 0, spread = 0, color = 'rgba(0,0,0,0.1)', position } = shadow;
	const inset = position === 'inset' ? 'inset ' : '';
	return `${inset}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
}

/**
 * Convert typography value to CSS properties
 */
function typographyToCSS(typography: TypographyValue | undefined): Record<string, string> {
	if (!typography) return {};
	const css: Record<string, string> = {};

	if (typography.fontFamily) css['font-family'] = typography.fontFamily;
	if (typography.fontSize) {
		css['font-size'] = `${typography.fontSize}${typography.fontSizeUnit || 'px'}`;
	}
	if (typography.fontWeight) css['font-weight'] = typography.fontWeight;
	if (typography.fontStyle) css['font-style'] = typography.fontStyle;
	if (typography.textTransform) css['text-transform'] = typography.textTransform;
	if (typography.textDecoration) css['text-decoration'] = typography.textDecoration;
	if (typography.lineHeight) {
		css['line-height'] = `${typography.lineHeight}${typography.lineHeightUnit || ''}`;
	}
	if (typography.letterSpacing) {
		css['letter-spacing'] = `${typography.letterSpacing}${typography.letterSpacingUnit || 'px'}`;
	}

	return css;
}

/**
 * Apply custom styles via CSS custom properties
 */
function applyMapStyles(wrapper: HTMLElement, config: MapVxConfig): void {
	// Ensure wrapper has width (required for map to display)
	wrapper.style.width = '100%';

	const styles = config.styles;
	if (!styles) return;

	// Height
	const height = getResponsiveValue(styles.height, 400);
	const heightUnit = styles.heightUnit || 'px';
	const enableCalcHeight = getResponsiveValue(styles.enableCalcHeight, false);
	const calcHeight = getResponsiveValue(styles.calcHeight, '');

	if (enableCalcHeight && calcHeight) {
		wrapper.style.setProperty('--vx-map-height', calcHeight);
	} else {
		wrapper.style.setProperty('--vx-map-height', `${height}${heightUnit}`);
	}

	// Border radius
	const borderRadius = getResponsiveValue(styles.borderRadius, 0);
	wrapper.style.setProperty('--vx-map-radius', `${borderRadius}px`);

	// Cluster styles
	if (styles.cluster) {
		const clusterSize = getResponsiveValue(styles.cluster.size, 40);
		wrapper.style.setProperty('--vx-cluster-size', `${clusterSize}px`);

		const clusterBg = getResponsiveValue(styles.cluster.bgColor, '');
		if (clusterBg) wrapper.style.setProperty('--vx-cluster-bg', clusterBg);

		const clusterRadius = getResponsiveValue(styles.cluster.radius, 50);
		wrapper.style.setProperty('--vx-cluster-radius', `${clusterRadius}%`);

		const clusterTextColor = getResponsiveValue(styles.cluster.textColor, '');
		if (clusterTextColor) wrapper.style.setProperty('--vx-cluster-text-color', clusterTextColor);

		wrapper.style.setProperty('--vx-cluster-shadow', boxShadowToCSS(styles.cluster.shadow));
	}

	// Icon marker styles
	if (styles.iconMarker) {
		const iconSize = getResponsiveValue(styles.iconMarker.size, 42);
		wrapper.style.setProperty('--vx-icon-marker-size', `${iconSize}px`);

		const iconIconSize = getResponsiveValue(styles.iconMarker.iconSize, 24);
		wrapper.style.setProperty('--vx-icon-marker-icon-size', `${iconIconSize}px`);

		const iconRadius = getResponsiveValue(styles.iconMarker.radius, 50);
		wrapper.style.setProperty('--vx-icon-marker-radius', `${iconRadius}%`);

		wrapper.style.setProperty('--vx-icon-marker-shadow', boxShadowToCSS(styles.iconMarker.shadow));

		const staticBg = getResponsiveValue(styles.iconMarker.staticBg, '');
		if (staticBg) wrapper.style.setProperty('--vx-icon-marker-bg', staticBg);

		const staticBgActive = getResponsiveValue(styles.iconMarker.staticBgActive, '');
		if (staticBgActive) wrapper.style.setProperty('--vx-icon-marker-bg-active', staticBgActive);

		const staticIconColor = getResponsiveValue(styles.iconMarker.staticIconColor, '');
		if (staticIconColor) wrapper.style.setProperty('--vx-icon-marker-icon-color', staticIconColor);

		const staticIconColorActive = getResponsiveValue(styles.iconMarker.staticIconColorActive, '');
		if (staticIconColorActive) wrapper.style.setProperty('--vx-icon-marker-icon-color-active', staticIconColorActive);
	}

	// Text marker styles
	if (styles.textMarker) {
		const textBg = getResponsiveValue(styles.textMarker.bgColor, '');
		if (textBg) wrapper.style.setProperty('--vx-text-marker-bg', textBg);

		const textBgActive = getResponsiveValue(styles.textMarker.bgColorActive, '');
		if (textBgActive) wrapper.style.setProperty('--vx-text-marker-bg-active', textBgActive);

		const textColor = getResponsiveValue(styles.textMarker.textColor, '');
		if (textColor) wrapper.style.setProperty('--vx-text-marker-text-color', textColor);

		const textColorActive = getResponsiveValue(styles.textMarker.textColorActive, '');
		if (textColorActive) wrapper.style.setProperty('--vx-text-marker-text-color-active', textColorActive);

		const textRadius = getResponsiveValue(styles.textMarker.radius, 4);
		wrapper.style.setProperty('--vx-text-marker-radius', `${textRadius}px`);

		wrapper.style.setProperty('--vx-text-marker-shadow', boxShadowToCSS(styles.textMarker.shadow));
	}

	// Image marker styles
	if (styles.imageMarker) {
		const imgSize = getResponsiveValue(styles.imageMarker.size, 42);
		wrapper.style.setProperty('--vx-image-marker-size', `${imgSize}px`);

		const imgRadius = getResponsiveValue(styles.imageMarker.radius, 50);
		wrapper.style.setProperty('--vx-image-marker-radius', `${imgRadius}%`);

		wrapper.style.setProperty('--vx-image-marker-shadow', boxShadowToCSS(styles.imageMarker.shadow));
	}

	// Popup styles
	if (styles.popup) {
		const cardWidth = getResponsiveValue(styles.popup.cardWidth, 320);
		wrapper.style.setProperty('--vx-popup-card-width', `${cardWidth}px`);

		if (styles.popup.loaderColor1) {
			wrapper.style.setProperty('--vx-popup-loader-color1', styles.popup.loaderColor1);
		}
		if (styles.popup.loaderColor2) {
			wrapper.style.setProperty('--vx-popup-loader-color2', styles.popup.loaderColor2);
		}
	}

	// Search button styles
	if (styles.searchBtn) {
		const btnTextColor = getResponsiveValue(styles.searchBtn.textColor, '');
		if (btnTextColor) wrapper.style.setProperty('--vx-search-btn-text-color', btnTextColor);

		const btnBgColor = getResponsiveValue(styles.searchBtn.bgColor, '');
		if (btnBgColor) wrapper.style.setProperty('--vx-search-btn-bg', btnBgColor);

		const btnIconColor = getResponsiveValue(styles.searchBtn.iconColor, '');
		if (btnIconColor) wrapper.style.setProperty('--vx-search-btn-icon-color', btnIconColor);

		const btnIconColorActive = getResponsiveValue(styles.searchBtn.iconColorActive, '');
		if (btnIconColorActive) wrapper.style.setProperty('--vx-search-btn-icon-color-active', btnIconColorActive);

		const btnRadius = getResponsiveValue(styles.searchBtn.radius, 4);
		wrapper.style.setProperty('--vx-search-btn-radius', `${btnRadius}px`);
	}

	// Nav button styles
	if (styles.navBtn) {
		if (styles.navBtn.iconColor) {
			wrapper.style.setProperty('--vx-nav-btn-icon-color', styles.navBtn.iconColor);
		}
		if (styles.navBtn.iconColorHover) {
			wrapper.style.setProperty('--vx-nav-btn-icon-color-hover', styles.navBtn.iconColorHover);
		}

		const navIconSize = getResponsiveValue(styles.navBtn.iconSize, 20);
		wrapper.style.setProperty('--vx-nav-btn-icon-size', `${navIconSize}px`);

		if (styles.navBtn.bgColor) {
			wrapper.style.setProperty('--vx-nav-btn-bg', styles.navBtn.bgColor);
		}
		if (styles.navBtn.bgColorHover) {
			wrapper.style.setProperty('--vx-nav-btn-bg-hover', styles.navBtn.bgColorHover);
		}

		const navRadius = getResponsiveValue(styles.navBtn.radius, 4);
		wrapper.style.setProperty('--vx-nav-btn-radius', `${navRadius}px`);

		const navSize = getResponsiveValue(styles.navBtn.size, 36);
		wrapper.style.setProperty('--vx-nav-btn-size', `${navSize}px`);

		wrapper.style.setProperty('--vx-nav-btn-shadow', boxShadowToCSS(styles.navBtn.shadow));
	}
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
		dragDiv.innerHTML = `
			<a href="#" class="ts-map-btn ts-drag-toggle ${isChecked ? 'active' : ''}">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="ts-checkmark-icon">
					<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
				</svg>
				Search as I move the map
			</a>
		`;
	} else {
		dragDiv.innerHTML = `
			<a href="#" class="ts-search-area hidden ts-map-btn">
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="ts-search-icon">
					<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
				</svg>
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
function renderGeolocateButton(container: HTMLElement): HTMLElement {
	const geoBtn = document.createElement('a');
	geoBtn.href = '#';
	geoBtn.rel = 'nofollow';
	geoBtn.role = 'button';
	geoBtn.className = 'vx-geolocate-me hidden';
	geoBtn.setAttribute('aria-label', 'Share your location');
	geoBtn.innerHTML = `
		<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
			<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
		</svg>
	`;
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
	renderGeolocateButton(container);

	// Initialize the actual map using Voxel.Maps API
	initializeVoxelMap(mapContainer, dataConfig, container);

	// Set up event listener for search form submissions
	const searchFormId = config.searchFormId;
	if (searchFormId) {
		window.addEventListener('voxel-search-submit', ((event: CustomEvent<SearchSubmitEventDetail>) => {
			if (event.detail.targetId === searchFormId) {
				handleSearchSubmit(container, mapContainer, event.detail, config);
			}
		}) as EventListener);
	}

	// Set up drag search handlers
	if (dragUI) {
		setupDragSearchHandlers(dragUI, mapContainer, config);
	}
}

/**
 * Initialize the actual map using Voxel.Maps API
 */
function initializeVoxelMap(
	mapContainer: HTMLElement,
	dataConfig: MapDataConfig,
	wrapper: HTMLElement
): void {
	// Wait for Voxel.Maps to be ready
	if (!window.Voxel?.Maps) {
		console.warn('[Map Block] Voxel.Maps not available');
		return;
	}

	window.Voxel.Maps.await(() => {
		try {
			// Ensure map container has height before initializing
			const styles = wrapper.style;
			const height = styles.getPropertyValue('--vx-map-height') || '400px';
			mapContainer.style.height = height;

			// Create center LatLng using Voxel's API
			const centerLatLng = new window.Voxel.Maps.LatLng(
				dataConfig.center.lat,
				dataConfig.center.lng
			);

			// Create the map instance using Voxel's Map class
			// Voxel expects an object with 'el' property, not positional arguments
			const map = new window.Voxel.Maps.Map({
				el: mapContainer,
				center: centerLatLng,
				zoom: dataConfig.zoom,
				minZoom: dataConfig.minZoom,
				maxZoom: dataConfig.maxZoom,
			});

			// Store map instance on container for later access
			(mapContainer as any)._voxelMap = map;

			console.log('[Map Block] Map initialized successfully');
		} catch (error) {
			console.error('[Map Block] Failed to initialize map:', error);
		}
	});
}

/**
 * Handle search form submission
 */
function handleSearchSubmit(
	container: HTMLElement,
	mapContainer: HTMLElement,
	detail: SearchSubmitEventDetail,
	config: MapVxConfig
): void {
	// The markers will be updated by Voxel's search-form.js
	// which reads marker templates from the post feed response
	console.log('[Map Block] Search submitted:', detail);

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
 * Set up drag search event handlers
 */
function setupDragSearchHandlers(
	dragUI: HTMLElement,
	mapContainer: HTMLElement,
	config: MapVxConfig
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
 * Initialize all map blocks on the page
 */
function initMapBlocks(): void {
	const blocks = document.querySelectorAll<HTMLElement>('.voxel-fse-map');

	blocks.forEach((container) => {
		// Skip if already hydrated
		if (container.dataset.hydrated === 'true') {
			return;
		}

		// Parse vxconfig
		const config = parseVxConfig(container);
		if (!config) {
			console.warn('[Map Block] No vxconfig found for container:', container);
			return;
		}

		// Mark as hydrated
		container.dataset.hydrated = 'true';

		// Apply custom styles
		applyMapStyles(container, config);

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
 * Wait for Voxel.Maps API to be ready
 */
function waitForVoxelMaps(callback: () => void): void {
	if (window.Voxel?.Maps) {
		window.Voxel.Maps.await(callback);
	} else {
		// Listen for maps:loaded event
		document.addEventListener('maps:loaded', callback, { once: true });

		// Also try polling as fallback
		const checkInterval = setInterval(() => {
			if (window.Voxel?.Maps) {
				clearInterval(checkInterval);
				window.Voxel.Maps.await(callback);
			}
		}, 100);

		// Give up after 10 seconds
		setTimeout(() => {
			clearInterval(checkInterval);
			// Initialize anyway - map might work without full API
			callback();
		}, 10000);
	}
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => {
		waitForVoxelMaps(initMapBlocks);
	});
} else {
	waitForVoxelMaps(initMapBlocks);
}

// Also initialize on Turbo/PJAX page loads
window.addEventListener('turbo:load', () => {
	waitForVoxelMaps(initMapBlocks);
});
window.addEventListener('pjax:complete', () => {
	waitForVoxelMaps(initMapBlocks);
});

// Re-apply styles on resize for responsive values
let resizeTimeout: ReturnType<typeof setTimeout>;
window.addEventListener('resize', () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		const blocks = document.querySelectorAll<HTMLElement>('.voxel-fse-map[data-hydrated="true"]');
		blocks.forEach((container) => {
			const config = parseVxConfig(container);
			if (config) {
				applyMapStyles(container, config);
			}
		});
	}, 250);
});
