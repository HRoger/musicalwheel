/**
 * Voxel Maps Adapter - Complete API Wrapper
 *
 * This module provides TypeScript wrappers around Voxel.Maps API classes,
 * ensuring 100% parity with the beautified reference:
 *   docs/block-conversions/map/voxel-map.beautified.js
 *
 * ARCHITECTURE:
 * - These classes wrap Voxel.Maps API when available
 * - Fall back gracefully when Voxel.Maps is not loaded
 * - Provide type-safe interfaces for React components
 *
 * CLASSES IMPLEMENTED:
 * - VxLatLng: Wrapper for Voxel.Maps.LatLng
 * - VxBounds: Wrapper for Voxel.Maps.Bounds
 * - VxMap: Wrapper for Voxel.Maps.Map
 * - VxMarker: Wrapper for Voxel.Maps.Marker
 * - VxClusterer: Wrapper for Voxel.Maps.Clusterer (with Supercluster)
 * - VxPopup: Wrapper for Voxel.Maps.Popup (InfoWindow)
 * - VxCircle: Wrapper for Voxel.Maps.Circle (radius overlay)
 * - VxAutocomplete: Wrapper for Voxel.Maps.Autocomplete (Places API)
 * - VxGeocoder: Wrapper for Voxel.Maps.Geocoder
 *
 * @package VoxelFSE
 */

/// <reference types="@types/google.maps" />

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Voxel.Maps namespace type (from parent theme)
 */
interface VoxelMapsNamespace {
    LatLng: new (lat: number, lng: number) => VoxelLatLng;
    Bounds: new (sw?: VoxelLatLng, ne?: VoxelLatLng) => VoxelBounds;
    Map: new (options: VoxelMapOptions) => VoxelMap;
    Marker: new (options: VoxelMarkerOptions) => VoxelMarker;
    Clusterer: new (options: VoxelClustererOptions) => VoxelClusterer;
    Popup: new (options: VoxelPopupOptions) => VoxelPopup;
    Circle: new (options: VoxelCircleOptions) => VoxelCircle;
    Autocomplete: new (
        input: HTMLInputElement,
        onChange: (result?: VoxelGeocodeResult) => void,
        options?: VoxelAutocompleteOptions
    ) => VoxelAutocomplete;
    Geocoder: new () => VoxelGeocoder;
    getGeocoder: () => VoxelGeocoder;
    await: (callback: () => void) => void;
    Loaded?: boolean;
    SetupMarkerOverlay?: () => void;
    SetupCircleOverlay?: () => void;
    GoogleMapsOverlay?: any;
    CircleOverlay?: any;
    _geocoder?: VoxelGeocoder;
}

interface VoxelLatLng {
    getLatitude(): number;
    getLongitude(): number;
    getSourceObject(): google.maps.LatLng;
    toGeocoderFormat(): google.maps.LatLng;
}

interface VoxelBounds {
    extend(point: VoxelLatLng): void;
    empty(): boolean;
    getSourceObject(): google.maps.LatLngBounds;
    getSouthWest(): VoxelLatLng;
    getNorthEast(): VoxelLatLng;
}

interface VoxelMapOptions {
    el: HTMLElement;
    zoom?: number;
    center?: VoxelLatLng;
    minZoom?: number;
    maxZoom?: number;
    draggable?: boolean;
}

interface VoxelMap {
    setZoom(zoom: number): void;
    getZoom(): number;
    getMinZoom(): number;
    getMaxZoom(): number;
    setCenter(latlng: VoxelLatLng): void;
    getCenter(): VoxelLatLng;
    getBounds(): VoxelBounds;
    fitBounds(bounds: VoxelBounds): void;
    panTo(latlng: VoxelLatLng): void;
    getClickPosition(e: google.maps.MapMouseEvent): VoxelLatLng;
    addListener(event: string, handler: (e?: any) => void): google.maps.MapsEventListener;
    addListenerOnce(event: string, handler: (e?: any) => void): google.maps.MapsEventListener;
    removeListener(listener: google.maps.MapsEventListener): void;
    trigger(event: string): void;
    getSourceObject(): google.maps.Map;
}

interface VoxelMarkerOptions {
    map?: VoxelMap;
    position?: VoxelLatLng;
    onClick?: (e: Event, marker: VoxelMarker) => void;
    template?: string;
    data?: Record<string, unknown>;
}

interface VoxelMarker {
    getPosition(): VoxelLatLng;
    setPosition(pos: VoxelLatLng): void;
    getMap(): VoxelMap;
    setMap(map: VoxelMap): void;
    remove(): VoxelMarker;
    getSourceObject(): any;
    addClass(cls: string): void;
    removeClass(cls: string): void;
    getTemplate(): any; // JQuery<HTMLElement>
    data?: Record<string, unknown>;
    onClick?: (e: Event, marker: VoxelMarker) => void;
}

interface VoxelClustererOptions {
    map: VoxelMap;
    radius?: number;
    maxZoom?: number;
}

interface VoxelClusterer {
    addMarkers(markers: VoxelMarker[]): void;
    render(): void;
    markers: VoxelMarker[];
    clusters: Record<string, any>;
    _onClusterClick?: () => void;
    _onNonExpandableClusterClick?: (markers: VoxelMarker[]) => void;
}

interface VoxelPopupOptions {
    map?: VoxelMap;
    position?: VoxelLatLng;
    content?: string | HTMLElement;
}

interface VoxelPopup {
    setContent(content: string | HTMLElement): void;
    setPosition(position: VoxelLatLng): void;
    setMap(map: VoxelMap): void;
    show(): void;
    hide(): void;
}

interface VoxelCircleOptions {
    map?: VoxelMap;
    center?: VoxelLatLng;
    radius?: number;
    visible?: boolean;
    className?: string;
}

interface VoxelCircle {
    hide(): void;
    show(): void;
    setCenter(center: VoxelLatLng): void;
    setRadius(radius: number): void;
    getBounds(): VoxelBounds;
}

interface VoxelAutocompleteOptions {
    feature_types?: string[];
    countries?: string[];
    fields?: string[];
}

interface VoxelAutocomplete {
    querySuggestions(e?: Event): Promise<void>;
    selectFirstResult(callback?: () => void): Promise<void>;
}

interface VoxelGeocodeResult {
    address: string;
    latlng: VoxelLatLng;
    viewport: VoxelBounds;
}

interface VoxelGeocoderOptions {
    limit?: number;
}

interface VoxelUserLocationOptions {
    fetchAddress?: boolean;
    receivedPosition?: (latlng: VoxelLatLng) => void;
    receivedAddress?: (result: VoxelGeocodeResult) => void;
    positionFail?: () => void;
    addressFail?: () => void;
}

interface VoxelGeocoder {
    geocode(
        query: string | VoxelLatLng,
        options?: VoxelGeocoderOptions | ((result: VoxelGeocodeResult | false) => void),
        callback?: (result: VoxelGeocodeResult | VoxelGeocodeResult[] | false) => void
    ): void;
    formatFeature(feature: google.maps.GeocoderResult | any): VoxelGeocodeResult | null;
    getUserLocation(options: VoxelUserLocationOptions): void;
}

// Note: Window augmentation for Voxel is handled by @shared/types/voxel.d.ts
// We use type assertions when accessing getVoxelWindow().Voxel to avoid conflicts

interface VoxelWindow {
    Voxel?: {
        Maps?: VoxelMapsNamespace;
        alert?: (message: string, type?: string) => void;
        helpers?: {
            debounce: <T extends (...args: any[]) => any>(fn: T, delay: number) => T;
        };
    };
    Voxel_Config?: {
        google_maps?: {
            api_key?: string;
            logo_url?: string;
            mapTypeId?: string;
            mapTypeControl?: boolean;
            streetViewControl?: boolean;
            skin?: google.maps.MapTypeStyle[];
        };
        maps?: {
            default_lat?: number;
            default_lng?: number;
        };
        l10n?: {
            positionFail?: string;
        };
    };
    jQuery?: any;
    SuperclusterModule?: { exports: any };
}

// Type-safe window access
const getVoxelWindow = (): VoxelWindow => window as unknown as VoxelWindow;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if Voxel.Maps is available
 */
export function isVoxelMapsAvailable(): boolean {
    return !!(getVoxelWindow().Voxel?.Maps);
}

/**
 * Wait for Voxel.Maps to be ready
 */
export function waitForVoxelMaps(): Promise<VoxelMapsNamespace> {
    return new Promise((resolve, reject) => {
        const Maps = getVoxelWindow().Voxel?.Maps;
        if (Maps) {
            Maps.await(() => resolve(Maps));
            return;
        }

        // Listen for maps:loaded event
        const handler = () => {
            const Maps = getVoxelWindow().Voxel?.Maps;
            if (Maps) {
                Maps.await(() => resolve(Maps));
            }
        };
        document.addEventListener('maps:loaded', handler, { once: true });

        // Timeout after 15 seconds
        setTimeout(() => {
            document.removeEventListener('maps:loaded', handler);
            const Maps = getVoxelWindow().Voxel?.Maps;
            if (Maps) {
                Maps.await(() => resolve(Maps));
            } else {
                reject(new Error('Voxel.Maps not available after timeout'));
            }
        }, 15000);
    });
}

/**
 * Get default map configuration
 */
export function getDefaultMapConfig(): { lat: number; lng: number } {
    return {
        lat: getVoxelWindow().Voxel_Config?.maps?.default_lat ?? 40.7128,
        lng: getVoxelWindow().Voxel_Config?.maps?.default_lng ?? -74.006,
    };
}

// ============================================================================
// WRAPPER CLASSES
// ============================================================================

/**
 * LatLng wrapper class
 * Matches: Voxel.Maps.LatLng (lines 530-548 of beautified reference)
 */
export class VxLatLng {
    private _native: VoxelLatLng | null = null;
    private _lat: number;
    private _lng: number;

    constructor(lat: number, lng: number) {
        this._lat = lat;
        this._lng = lng;

        const Maps = getVoxelWindow().Voxel?.Maps;
        if (Maps) {
            this._native = new Maps.LatLng(lat, lng);
        }
    }

    getLatitude(): number {
        return this._native?.getLatitude() ?? this._lat;
    }

    getLongitude(): number {
        return this._native?.getLongitude() ?? this._lng;
    }

    getSourceObject(): google.maps.LatLng | null {
        return this._native?.getSourceObject() ?? null;
    }

    toGeocoderFormat(): google.maps.LatLng | null {
        return this._native?.toGeocoderFormat() ?? null;
    }

    getNative(): VoxelLatLng | null {
        return this._native;
    }

    /**
     * Create from Voxel native object
     */
    static fromNative(native: VoxelLatLng): VxLatLng {
        const instance = new VxLatLng(native.getLatitude(), native.getLongitude());
        instance._native = native;
        return instance;
    }
}

/**
 * Bounds wrapper class
 * Matches: Voxel.Maps.Bounds (lines 389-420 of beautified reference)
 */
export class VxBounds {
    private _native: VoxelBounds | null = null;
    private _sw: VxLatLng | null;
    private _ne: VxLatLng | null;

    constructor(sw?: VxLatLng, ne?: VxLatLng) {
        this._sw = sw ?? null;
        this._ne = ne ?? null;

        const Maps = getVoxelWindow().Voxel?.Maps;
        if (Maps) {
            this._native = new Maps.Bounds(
                sw?.getNative() ?? undefined,
                ne?.getNative() ?? undefined
            );
        }
    }

    extend(point: VxLatLng): void {
        if (this._native && point.getNative()) {
            this._native.extend(point.getNative()!);
        }
    }

    empty(): boolean {
        return this._native?.empty() ?? true;
    }

    getSourceObject(): google.maps.LatLngBounds | null {
        return this._native?.getSourceObject() ?? null;
    }

    getSouthWest(): VxLatLng | null {
        if (this._native) {
            return VxLatLng.fromNative(this._native.getSouthWest());
        }
        return this._sw;
    }

    getNorthEast(): VxLatLng | null {
        if (this._native) {
            return VxLatLng.fromNative(this._native.getNorthEast());
        }
        return this._ne;
    }

    getNative(): VoxelBounds | null {
        return this._native;
    }

    static fromNative(native: VoxelBounds): VxBounds {
        const sw = VxLatLng.fromNative(native.getSouthWest());
        const ne = VxLatLng.fromNative(native.getNorthEast());
        const instance = new VxBounds(sw, ne);
        instance._native = native;
        return instance;
    }
}

/**
 * Map wrapper class
 * Matches: Voxel.Maps.Map (lines 553-662 of beautified reference)
 */
export class VxMap {
    private _native: VoxelMap | null = null;
    private _el: HTMLElement;
    private _options: VxMapOptions;
    private _listeners: Map<string, google.maps.MapsEventListener[]> = new Map();

    constructor(options: VxMapOptions) {
        this._el = options.el;
        this._options = options;
    }

    /**
     * Initialize the map (must be called after Voxel.Maps is ready)
     */
    async init(): Promise<void> {
        console.log('[VxMap] init() called');
        const Maps = await waitForVoxelMaps();
        console.log('[VxMap] Got Voxel.Maps:', Maps);
        console.log('[VxMap] Maps.Map constructor:', Maps.Map);

        // CRITICAL: Ensure container has dimensions BEFORE creating map
        // Google Maps v3.62+ uses lazy rendering and won't render tiles
        // if the container has 0 dimensions at creation time
        const computedStyle = window.getComputedStyle(this._el);
        const containerRect = this._el.getBoundingClientRect();
        console.log('[VxMap] Container dimensions BEFORE map creation:', {
            width: containerRect.width,
            height: containerRect.height,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            offsetParent: this._el.offsetParent ? 'exists' : 'null',
            styleHeight: this._el.style.height,
        });

        // If container has no height, set a minimum height
        if (containerRect.height === 0) {
            console.log('[VxMap] WARNING: Container has 0 height! Setting fallback height of 400px');
            this._el.style.height = '400px';
        }

        const centerLatLng = this._options.center
            ? new Maps.LatLng(
                  this._options.center.getLatitude(),
                  this._options.center.getLongitude()
              )
            : new Maps.LatLng(
                  getDefaultMapConfig().lat,
                  getDefaultMapConfig().lng
              );
        console.log('[VxMap] centerLatLng created:', centerLatLng);

        const mapOptions = {
            el: this._el,
            zoom: this._options.zoom ?? 10,
            center: centerLatLng,
            minZoom: this._options.minZoom ?? 2,
            maxZoom: this._options.maxZoom ?? 20,
            draggable: this._options.draggable ?? true,
        };
        console.log('[VxMap] About to call new Maps.Map() with:', mapOptions);

        try {
            this._native = new Maps.Map(mapOptions);
            console.log('[VxMap] Maps.Map created successfully:', this._native);
            console.log('[VxMap] Native map object:', this._native?.map);
            console.log('[VxMap] Container after init:', this._el.innerHTML.substring(0, 200));

            // Add ts-map-loaded class to container (matches Voxel behavior)
            this._el.classList.add('ts-map-loaded');
            // Also attach instance to element (matches Voxel behavior: el.__vx_map__ = this)
            (this._el as any).__vx_map__ = this._native;

            // CRITICAL: Trigger resize event to force Google Maps to render tiles
            // Google Maps v3.62+ uses lazy rendering and may not render tiles until
            // the map is visible and has proper dimensions
            const googleMap = this._native?.map;
            if (googleMap && typeof google !== 'undefined' && google.maps?.event) {
                console.log('[VxMap] Triggering resize event sequence...');

                // First, force a layout recalculation
                void this._el.offsetHeight;

                // Then trigger resize immediately
                google.maps.event.trigger(googleMap, 'resize');

                // Use requestAnimationFrame to ensure DOM is painted
                requestAnimationFrame(() => {
                    // Trigger resize again after paint
                    google.maps.event.trigger(googleMap, 'resize');

                    // Force center to be re-set (this can trigger tile loading)
                    const center = googleMap.getCenter();
                    if (center) {
                        googleMap.setCenter(center);
                    }

                    // Trigger bounds_changed and idle events
                    setTimeout(() => {
                        google.maps.event.trigger(googleMap, 'bounds_changed');
                        google.maps.event.trigger(googleMap, 'idle');
                        console.log('[VxMap] Resize sequence completed');

                        // Log final container state
                        const finalRect = this._el.getBoundingClientRect();
                        console.log('[VxMap] Container dimensions AFTER resize:', {
                            width: finalRect.width,
                            height: finalRect.height,
                        });
                    }, 100);
                });
            }
        } catch (err) {
            console.error('[VxMap] Error creating Maps.Map:', err);
            throw err;
        }
    }

    setZoom(zoom: number): void {
        this._native?.setZoom(zoom);
    }

    getZoom(): number {
        return this._native?.getZoom() ?? this._options.zoom ?? 10;
    }

    getMinZoom(): number {
        return this._native?.getMinZoom() ?? this._options.minZoom ?? 2;
    }

    getMaxZoom(): number {
        return this._native?.getMaxZoom() ?? this._options.maxZoom ?? 20;
    }

    setCenter(latlng: VxLatLng): void {
        if (this._native && latlng.getNative()) {
            this._native.setCenter(latlng.getNative()!);
        }
    }

    getCenter(): VxLatLng | null {
        if (this._native) {
            return VxLatLng.fromNative(this._native.getCenter());
        }
        return this._options.center ?? null;
    }

    getBounds(): VxBounds | null {
        if (this._native) {
            return VxBounds.fromNative(this._native.getBounds());
        }
        return null;
    }

    fitBounds(bounds: VxBounds): void {
        if (this._native && bounds.getNative()) {
            this._native.fitBounds(bounds.getNative()!);
        }
    }

    panTo(latlng: VxLatLng): void {
        if (this._native && latlng.getNative()) {
            this._native.panTo(latlng.getNative()!);
        }
    }

    getClickPosition(e: google.maps.MapMouseEvent): VxLatLng | null {
        if (this._native) {
            return VxLatLng.fromNative(this._native.getClickPosition(e));
        }
        return null;
    }

    /**
     * Add event listener
     * Matches: Voxel.Maps.Map.prototype.addListener (line 633)
     */
    addListener(event: string, handler: (e?: any) => void): void {
        if (this._native) {
            const listener = this._native.addListener(event, handler);
            if (!this._listeners.has(event)) {
                this._listeners.set(event, []);
            }
            this._listeners.get(event)!.push(listener);
        }
    }

    /**
     * Add one-time event listener
     * Matches: Voxel.Maps.Map.prototype.addListenerOnce (line 638)
     */
    addListenerOnce(event: string, handler: (e?: any) => void): void {
        if (this._native) {
            this._native.addListenerOnce(event, handler);
        }
    }

    /**
     * Remove all listeners for an event
     */
    removeListeners(event: string): void {
        const listeners = this._listeners.get(event);
        if (listeners && this._native) {
            listeners.forEach((l) => this._native!.removeListener(l));
            this._listeners.delete(event);
        }
    }

    /**
     * Trigger an event
     * Matches: Voxel.Maps.Map.prototype.trigger (line 648)
     */
    trigger(event: string): void {
        this._native?.trigger(event);
    }

    getSourceObject(): google.maps.Map | null {
        return this._native?.getSourceObject() ?? null;
    }

    getNative(): VoxelMap | null {
        return this._native;
    }

    getElement(): HTMLElement {
        return this._el;
    }
}

export interface VxMapOptions {
    el: HTMLElement;
    zoom?: number;
    center?: VxLatLng;
    minZoom?: number;
    maxZoom?: number;
    draggable?: boolean;
}

/**
 * Marker wrapper class
 * Matches: Voxel.Maps.Marker (lines 667-726 of beautified reference)
 */
export class VxMarker {
    private _native: VoxelMarker | null = null;
    private _options: VxMarkerOptions;
    private _map: VxMap | null = null;

    constructor(options: VxMarkerOptions) {
        this._options = options;
    }

    /**
     * Initialize the marker
     */
    init(map: VxMap): void {
        const Maps = getVoxelWindow().Voxel?.Maps;
        if (!Maps || !map.getNative()) return;

        this._map = map;

        const position = this._options.position
            ? new Maps.LatLng(
                  this._options.position.getLatitude(),
                  this._options.position.getLongitude()
              )
            : undefined;

        this._native = new Maps.Marker({
            map: map.getNative()!,
            position,
            template: this._options.template,
            onClick: this._options.onClick
                ? (e, _m) => this._options.onClick!(e, this)
                : undefined,
            data: this._options.data,
        });
    }

    getPosition(): VxLatLng | null {
        if (this._native) {
            return VxLatLng.fromNative(this._native.getPosition());
        }
        return this._options.position ?? null;
    }

    setPosition(pos: VxLatLng): void {
        if (this._native && pos.getNative()) {
            this._native.setPosition(pos.getNative()!);
        }
    }

    getMap(): VxMap | null {
        return this._map;
    }

    setMap(map: VxMap): void {
        if (this._native && map.getNative()) {
            this._native.setMap(map.getNative()!);
            this._map = map;
        }
    }

    remove(): this {
        this._native?.remove();
        this._map = null;
        return this;
    }

    addClass(cls: string): void {
        this._native?.addClass(cls);
    }

    removeClass(cls: string): void {
        this._native?.removeClass(cls);
    }

    getData(): Record<string, unknown> | undefined {
        return this._options.data;
    }

    getNative(): VoxelMarker | null {
        return this._native;
    }
}

export interface VxMarkerOptions {
    position?: VxLatLng;
    template?: string;
    onClick?: (e: Event, marker: VxMarker) => void;
    data?: Record<string, unknown>;
}

/**
 * Popup wrapper class (InfoWindow)
 * Matches: Voxel.Maps.Popup (lines 805-850 of beautified reference)
 *
 * USAGE:
 * const popup = new VxPopup({
 *   position: new VxLatLng(40.7128, -74.0060),
 *   content: '<div>Hello World</div>'
 * });
 * popup.init(map);
 * popup.show();
 */
export class VxPopup {
    private _native: VoxelPopup | null = null;
    private _options: VxPopupOptions;
    private _map: VxMap | null = null;

    constructor(options: VxPopupOptions) {
        this._options = options;
    }

    /**
     * Initialize the popup
     */
    init(map: VxMap): void {
        const Maps = getVoxelWindow().Voxel?.Maps;
        if (!Maps || !map.getNative()) return;

        this._map = map;

        const position = this._options.position
            ? new Maps.LatLng(
                  this._options.position.getLatitude(),
                  this._options.position.getLongitude()
              )
            : undefined;

        this._native = new Maps.Popup({
            map: map.getNative()!,
            position,
            content: this._options.content,
        });
    }

    setContent(content: string | HTMLElement): void {
        this._native?.setContent(content);
    }

    setPosition(position: VxLatLng): void {
        if (this._native && position.getNative()) {
            this._native.setPosition(position.getNative()!);
        }
    }

    show(): void {
        this._native?.show();
    }

    hide(): void {
        this._native?.hide();
    }

    getMap(): VxMap | null {
        return this._map;
    }

    getNative(): VoxelPopup | null {
        return this._native;
    }
}

export interface VxPopupOptions {
    position?: VxLatLng;
    content?: string | HTMLElement;
}

/**
 * Circle wrapper class (radius overlay)
 * Matches: Voxel.Maps.Circle (lines 874-927 of beautified reference)
 *
 * USAGE:
 * const circle = new VxCircle({
 *   center: new VxLatLng(40.7128, -74.0060),
 *   radius: 5000, // 5km in meters
 *   className: 'map-circle'
 * });
 * circle.init(map);
 * circle.show();
 */
export class VxCircle {
    private _native: VoxelCircle | null = null;
    private _options: VxCircleOptions;
    private _map: VxMap | null = null;

    constructor(options: VxCircleOptions) {
        this._options = options;
    }

    /**
     * Initialize the circle
     */
    init(map: VxMap): void {
        const Maps = getVoxelWindow().Voxel?.Maps;
        if (!Maps || !map.getNative()) return;

        this._map = map;

        const center = this._options.center
            ? new Maps.LatLng(
                  this._options.center.getLatitude(),
                  this._options.center.getLongitude()
              )
            : undefined;

        this._native = new Maps.Circle({
            map: map.getNative()!,
            center,
            radius: this._options.radius,
            visible: this._options.visible,
            className: this._options.className ?? 'map-circle',
        });
    }

    hide(): void {
        this._native?.hide();
    }

    show(): void {
        this._native?.show();
    }

    setCenter(center: VxLatLng): void {
        if (this._native && center.getNative()) {
            this._native.setCenter(center.getNative()!);
        }
    }

    setRadius(radius: number): void {
        this._native?.setRadius(radius);
    }

    getBounds(): VxBounds | null {
        if (this._native) {
            return VxBounds.fromNative(this._native.getBounds());
        }
        return null;
    }

    getMap(): VxMap | null {
        return this._map;
    }

    getNative(): VoxelCircle | null {
        return this._native;
    }
}

export interface VxCircleOptions {
    center?: VxLatLng;
    radius?: number;
    visible?: boolean;
    className?: string;
}

/**
 * Autocomplete wrapper class (Google Places)
 * Matches: Voxel.Maps.Autocomplete (lines 124-379 of beautified reference)
 *
 * USAGE:
 * const autocomplete = new VxAutocomplete(inputElement, (result) => {
 *   if (result) {
 *     console.log('Selected:', result.address, result.latlng);
 *   }
 * }, {
 *   feature_types: ['geocode'],
 *   countries: ['us', 'ca'],
 *   fields: ['formatted_address', 'geometry']
 * });
 */
export class VxAutocomplete {
    private _native: VoxelAutocomplete | null = null;
    private _input: HTMLInputElement;
    private _onChange: (result?: VxGeocodeResult) => void;
    private _options: VxAutocompleteOptions;

    constructor(
        input: HTMLInputElement,
        onChange: (result?: VxGeocodeResult) => void,
        options?: VxAutocompleteOptions
    ) {
        this._input = input;
        this._onChange = onChange;
        this._options = options ?? {};

        this._init();
    }

    private _init(): void {
        const Maps = getVoxelWindow().Voxel?.Maps;
        if (!Maps) {
            console.warn('[VxAutocomplete] Voxel.Maps not available');
            return;
        }

        // Wrap onChange to convert to VxGeocodeResult
        const wrappedOnChange = (result?: VoxelGeocodeResult) => {
            if (result) {
                this._onChange({
                    address: result.address,
                    latlng: VxLatLng.fromNative(result.latlng),
                    viewport: VxBounds.fromNative(result.viewport),
                });
            } else {
                this._onChange(undefined);
            }
        };

        this._native = new Maps.Autocomplete(
            this._input,
            wrappedOnChange,
            {
                feature_types: this._options.featureTypes,
                countries: this._options.countries,
                fields: this._options.fields,
            }
        );
    }

    /**
     * Programmatically trigger suggestions query
     */
    async querySuggestions(): Promise<void> {
        await this._native?.querySuggestions();
    }

    /**
     * Select the first result from suggestions
     */
    async selectFirstResult(callback?: () => void): Promise<void> {
        await this._native?.selectFirstResult(callback);
    }

    getNative(): VoxelAutocomplete | null {
        return this._native;
    }
}

export interface VxAutocompleteOptions {
    featureTypes?: string[];
    countries?: string[];
    fields?: string[];
}

export interface VxGeocodeResult {
    address: string;
    latlng: VxLatLng;
    viewport: VxBounds;
}

/**
 * Geocoder wrapper class
 * Matches: Voxel.Maps.Geocoder (lines 427-525 of beautified reference)
 *
 * USAGE:
 * const geocoder = VxGeocoder.getInstance();
 *
 * // Forward geocoding (address to coordinates)
 * geocoder.geocode('New York, NY', (result) => {
 *   if (result) {
 *     console.log('Found:', result.latlng);
 *   }
 * });
 *
 * // Reverse geocoding (coordinates to address)
 * geocoder.geocode(new VxLatLng(40.7128, -74.0060), (result) => {
 *   if (result) {
 *     console.log('Address:', result.address);
 *   }
 * });
 *
 * // Get user location
 * geocoder.getUserLocation({
 *   fetchAddress: true,
 *   receivedPosition: (latlng) => console.log('Position:', latlng),
 *   receivedAddress: (result) => console.log('Address:', result.address),
 *   positionFail: () => console.log('Failed to get position'),
 *   addressFail: () => console.log('Failed to get address')
 * });
 */
export class VxGeocoder {
    private static _instance: VxGeocoder | null = null;
    private _native: VoxelGeocoder | null = null;

    private constructor() {
        const Maps = getVoxelWindow().Voxel?.Maps;
        if (Maps) {
            this._native = Maps.getGeocoder();
        }
    }

    /**
     * Get singleton instance
     */
    static getInstance(): VxGeocoder {
        if (!VxGeocoder._instance) {
            VxGeocoder._instance = new VxGeocoder();
        }
        return VxGeocoder._instance;
    }

    /**
     * Geocode an address or coordinates
     */
    geocode(
        query: string | VxLatLng,
        optionsOrCallback?: VxGeocoderOptions | ((result: VxGeocodeResult | false) => void),
        callback?: (result: VxGeocodeResult | VxGeocodeResult[] | false) => void
    ): void {
        if (!this._native) {
            const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
            if (cb) cb(false);
            return;
        }

        let nativeQuery: string | google.maps.LatLng;
        if (query instanceof VxLatLng) {
            const sourceObj = query.getSourceObject();
            if (!sourceObj) {
                const cb = typeof optionsOrCallback === 'function' ? optionsOrCallback : callback;
                if (cb) cb(false);
                return;
            }
            nativeQuery = sourceObj;
        } else {
            nativeQuery = query;
        }

        // Wrap callback to convert result
        const wrapCallback = (
            cb: (result: VxGeocodeResult | VxGeocodeResult[] | false) => void
        ) => {
            return (result: VoxelGeocodeResult | VoxelGeocodeResult[] | false) => {
                if (result === false) {
                    cb(false);
                } else if (Array.isArray(result)) {
                    cb(
                        result.map((r) => ({
                            address: r.address,
                            latlng: VxLatLng.fromNative(r.latlng),
                            viewport: VxBounds.fromNative(r.viewport),
                        }))
                    );
                } else {
                    cb({
                        address: result.address,
                        latlng: VxLatLng.fromNative(result.latlng),
                        viewport: VxBounds.fromNative(result.viewport),
                    });
                }
            };
        };

        if (typeof optionsOrCallback === 'function') {
            // Cast to compatible callback type
            const typedCallback = optionsOrCallback as (result: VxGeocodeResult | VxGeocodeResult[] | false) => void;
            this._native.geocode(nativeQuery as any, wrapCallback(typedCallback));
        } else if (callback) {
            this._native.geocode(
                nativeQuery as any,
                optionsOrCallback as VoxelGeocoderOptions,
                wrapCallback(callback)
            );
        }
    }

    /**
     * Get user's current location
     * Matches: Voxel.Maps.Geocoder.prototype.getUserLocation (lines 492-524)
     */
    getUserLocation(options: VxUserLocationOptions): void {
        if (!this._native) {
            options.positionFail?.();
            return;
        }

        this._native.getUserLocation({
            fetchAddress: options.fetchAddress,
            receivedPosition: options.receivedPosition
                ? (latlng) => options.receivedPosition!(VxLatLng.fromNative(latlng))
                : undefined,
            receivedAddress: options.receivedAddress
                ? (result) =>
                      options.receivedAddress!({
                          address: result.address,
                          latlng: VxLatLng.fromNative(result.latlng),
                          viewport: VxBounds.fromNative(result.viewport),
                      })
                : undefined,
            positionFail: options.positionFail,
            addressFail: options.addressFail,
        });
    }

    getNative(): VoxelGeocoder | null {
        return this._native;
    }
}

export interface VxGeocoderOptions {
    limit?: number;
}

export interface VxUserLocationOptions {
    fetchAddress?: boolean;
    receivedPosition?: (latlng: VxLatLng) => void;
    receivedAddress?: (result: VxGeocodeResult) => void;
    positionFail?: () => void;
    addressFail?: () => void;
}

/**
 * Clusterer wrapper class (Supercluster-based)
 * Matches: Voxel.Maps.Clusterer (lines 1045-1142 of beautified reference)
 *
 * FEATURES:
 * - Supercluster spatial indexing for efficient clustering
 * - Automatic re-rendering on zoom_changed
 * - Cluster click to zoom
 * - Non-expandable cluster callback (at max zoom)
 *
 * USAGE:
 * const clusterer = new VxClusterer();
 * await clusterer.init(map);
 * clusterer.addMarkers(markers);
 * clusterer.render();
 *
 * // Handle cluster click at max zoom (shows list of markers)
 * clusterer.onNonExpandableClusterClick = (markers) => {
 *   console.log('Markers in cluster:', markers);
 * };
 */
export class VxClusterer {
    private _native: VoxelClusterer | null = null;
    private _map: VxMap | null = null;
    private _markers: VxMarker[] = [];
    private _onClusterClick?: () => void;
    private _onNonExpandableClusterClick?: (markers: VxMarker[]) => void;

    /**
     * Initialize the clusterer
     */
    async init(map: VxMap): Promise<void> {
        const Maps = await waitForVoxelMaps();
        if (!map.getNative()) return;

        this._map = map;
        this._native = new Maps.Clusterer({
            map: map.getNative()!,
        });

        // Set up callbacks
        if (this._native) {
            this._native._onClusterClick = () => {
                this._onClusterClick?.();
            };
            this._native._onNonExpandableClusterClick = (nativeMarkers) => {
                if (this._onNonExpandableClusterClick) {
                    // Convert native markers to VxMarker instances
                    // Note: This requires markers to have matching data
                    const vxMarkers = this._markers.filter((m) =>
                        nativeMarkers.some((nm) => nm === m.getNative())
                    );
                    this._onNonExpandableClusterClick(vxMarkers);
                }
            };
        }
    }

    /**
     * Add markers to the clusterer
     */
    addMarkers(markers: VxMarker[]): void {
        this._markers.push(...markers);

        if (this._native) {
            const nativeMarkers = markers
                .map((m) => m.getNative())
                .filter((m): m is VoxelMarker => m !== null);
            this._native.addMarkers(nativeMarkers);
        }
    }

    /**
     * Clear all markers
     */
    clearMarkers(): void {
        this._markers.forEach((m) => m.remove());
        this._markers = [];
        if (this._native) {
            this._native.markers = [];
        }
    }

    /**
     * Render clusters for current zoom level
     * Matches: Voxel.Maps.Clusterer.prototype.render (lines 1063-1097)
     */
    render(): void {
        this._native?.render();
    }

    /**
     * Set cluster click callback
     */
    set onClusterClick(callback: () => void) {
        this._onClusterClick = callback;
        if (this._native) {
            this._native._onClusterClick = callback;
        }
    }

    /**
     * Set non-expandable cluster click callback (at max zoom)
     */
    set onNonExpandableClusterClick(callback: (markers: VxMarker[]) => void) {
        this._onNonExpandableClusterClick = callback;
    }

    getMarkers(): VxMarker[] {
        return this._markers;
    }

    getMap(): VxMap | null {
        return this._map;
    }

    getNative(): VoxelClusterer | null {
        return this._native;
    }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Shorthand for geocoding
 */
export function geocode(
    query: string | VxLatLng,
    callback: (result: VxGeocodeResult | false) => void
): void {
    VxGeocoder.getInstance().geocode(query, callback);
}

/**
 * Get user's current location
 */
export function getUserLocation(options: VxUserLocationOptions): void {
    VxGeocoder.getInstance().getUserLocation(options);
}

/**
 * Create a simple marker on a map
 */
export function createMarker(
    map: VxMap,
    lat: number,
    lng: number,
    template?: string,
    onClick?: (e: Event, marker: VxMarker) => void
): VxMarker {
    const marker = new VxMarker({
        position: new VxLatLng(lat, lng),
        template,
        onClick,
    });
    marker.init(map);
    return marker;
}

/**
 * Fit map bounds to include all markers
 */
export function fitBoundsToMarkers(map: VxMap, markers: VxMarker[]): void {
    if (markers.length === 0) return;

    if (markers.length === 1) {
        const pos = markers[0].getPosition();
        if (pos) {
            map.panTo(pos);
            map.setZoom(15);
        }
        return;
    }

    const bounds = new VxBounds();
    markers.forEach((marker) => {
        const pos = marker.getPosition();
        if (pos) {
            bounds.extend(pos);
        }
    });

    if (!bounds.empty()) {
        map.fitBounds(bounds);
    }
}
