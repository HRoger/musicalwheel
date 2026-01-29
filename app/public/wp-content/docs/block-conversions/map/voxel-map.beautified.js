/**
 * ============================================================================
 * VOXEL GOOGLE MAPS WIDGET - BEAUTIFIED REFERENCE
 * ============================================================================
 *
 * Original: themes/voxel/assets/dist/google-maps.js
 * Size: ~30KB
 * Beautified: December 2025
 *
 * PURPOSE:
 * A comprehensive wrapper around the Google Maps JavaScript API v3.
 * It provides custom HTML markers (using OverlayView), clustering (using a
 * bundled KDBush/Supercluster implementation), and standardized methods
 * for Maps, Markers, Popups, Geocoding, and Autocomplete.
 *
 * CORRESPONDING FSE BLOCK:
 * themes/voxel-fse/app/blocks/src/map/frontend.tsx (To contain logic reference)
 *
 * NAMESPACE: Voxel.Maps
 *
 * DEPENDENCIES:
 * - Google Maps JavaScript API
 * - jQuery
 * - Voxel Global (`Voxel`, `Voxel_Config`)
 *
 * ============================================================================
 */

/**
 * GLOBAL CONFIGURATION (Voxel_Config.google_maps):
 *
 * {
 *   "api_key": "AIza...",
 *   "logo_url": "https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png",
 *   "mapTypeId": "roadmap" | "satellite" | "hybrid" | "terrain",
 *   "mapTypeControl": true,
 *   "streetViewControl": true,
 *   "skin": [
 *     {
 *       "featureType": "all",
 *       "elementType": "labels.text",
 *       "stylers": [{ "color": "#878787" }]
 *     },
 *     {
 *       "featureType": "water",
 *       "elementType": "geometry",
 *       "stylers": [{ "color": "#c9c9c9" }]
 *     }
 *   ]
 * }
 *
 * Voxel_Config.maps:
 * {
 *   "default_lat": 40.7128,
 *   "default_lng": -74.0060
 * }
 *
 * MAP INITIALIZATION OPTIONS:
 *
 * new Voxel.Maps.Map({
 *   el: HTMLElement,              // Required: DOM element to render map
 *   zoom: 10,                      // Initial zoom level (1-20)
 *   center: Voxel.Maps.LatLng,     // Initial center position
 *   minZoom: 4,                    // Minimum zoom level
 *   maxZoom: 20,                   // Maximum zoom level
 *   draggable: true                // Allow map dragging
 * })
 *
 * MARKER INITIALIZATION OPTIONS:
 *
 * new Voxel.Maps.Marker({
 *   map: Voxel.Maps.Map,           // Map instance
 *   position: Voxel.Maps.LatLng,   // Marker position
 *   template: "<div>...</div>",    // HTML template for custom marker
 *   onClick: function(e, marker),  // Click handler
 *   data: {}                       // Custom data object
 * })
 *
 * MARKER TEMPLATE FORMAT:
 * HTML string with custom styling. Default if not provided:
 * '<div class="map-marker marker-type-icon"><i class="las la-map-marker"></i></div>'
 *
 * AUTOCOMPLETE OPTIONS:
 *
 * new Voxel.Maps.Autocomplete(inputElement, onChange, {
 *   feature_types: ["geocode"],              // Place types to search
 *   countries: ["us", "ca"],                 // Country restrictions
 *   fields: ["formatted_address", "geometry"] // Fields to fetch
 * })
 *
 * CLUSTERER OPTIONS:
 *
 * new Voxel.Maps.Clusterer({
 *   map: Voxel.Maps.Map,
 *   radius: 60,                    // Cluster radius in pixels
 *   maxZoom: 15                    // Max zoom to cluster
 * })
 *
 * POPUP/CIRCLE/BOUNDS:
 * - Voxel.Maps.Popup({ map, content, position })
 * - Voxel.Maps.Circle({ map, center, radius, strokeColor, fillColor })
 * - Voxel.Maps.Bounds(southwest, northeast)
 *
 * GEOCODING:
 * Voxel.Maps.geocode(query, options, callback)
 * - query: address string or LatLng
 * - options: { limit: 1 }
 * - callback: function(result)
 *
 * GEOLOCATION:
 * Voxel.Maps.getGeocoder().getUserLocation({
 *   fetchAddress: true,
 *   receivedPosition: (latlng) => {},
 *   receivedAddress: (address) => {},
 *   positionFail: () => {},
 *   addressFail: () => {}
 * })
 */

/* ==========================================================================
   SECTION 1: AUTOCOMPLETE (Google Places)
   ========================================================================== */

Voxel.Maps.Autocomplete = function (input, onChange, options = {}) {
    this.init(input, onChange, options);
};

Voxel.Maps.Autocomplete.prototype.init = async function (input, onChange, options) {
    var AutocompleteSuggestion, AutocompleteSessionToken, Place;

    if (input instanceof Element) {
        // Dynamically import Places library
        ({
            AutocompleteSuggestion,
            AutocompleteSessionToken,
            Place,
        } = await google.maps.importLibrary("places"));

        this.el = input;
        this.input = jQuery(input);
        this.onChange = onChange;
        this.options = options || {};
        this.dropdown = null;
        this.focusedItem = 0;
        this.hasQueried = false;

        // Base request config
        this.requestBase = {
            includedPrimaryTypes: Array.isArray(options?.feature_types)
                ? options.feature_types
                : undefined,
            includedRegionCodes: Array.isArray(options?.countries)
                ? options.countries
                : undefined,
        };

        this.sessionToken = new AutocompleteSessionToken();
        this.attachDropdown();
        this.attachAttribution();

        // Debounce query
        const debouncedQuery = Voxel.helpers.debounce(
            this.querySuggestions.bind(this),
            200
        );

        this.input.on("input", debouncedQuery);
        this.input.on("focusin", this.showDropdown.bind(this));
        this.input.on("focusout", this.hideDropdown.bind(this));
        this.input.on("keydown click", this.navigateDropdown.bind(this));

        // Store references for usage in methods
        this._AutocompleteSuggestion = AutocompleteSuggestion;
        this._AutocompleteSessionToken = AutocompleteSessionToken;

        this.dropdown.on("mousedown", ".suggestion", (e) =>
            this.selectItem(jQuery(e.currentTarget).index())
        );
    }
};

Voxel.Maps.Autocomplete.prototype.querySuggestions = async function (e) {
    const value = (e?.target?.value ?? this.el.value ?? "").trim();
    this.resetFocus();
    this.showDropdown();

    // Notify external listener (e.g. for clearing value)
    this.onChange();

    if (value) {
        try {
            const response = await this._AutocompleteSuggestion.fetchAutocompleteSuggestions({
                input: value,
                ...this.requestBase,
                sessionToken: this.sessionToken,
            });
            const suggestions = response.suggestions;

            this.hasQueried = true;
            this.removeSuggestions();

            // Show top 5 suggestions
            (suggestions || []).slice(0, 5).forEach((suggestion) => {
                const text = suggestion.placePrediction?.text?.toString?.() || "";
                this.addSuggestion({
                    text: text,
                    placePrediction: suggestion.placePrediction,
                });
            });
        } catch (err) {
            console.log("[Places(New) querySuggestions] failed", err);
        }
    } else {
        this.removeSuggestions();
    }
};

Voxel.Maps.Autocomplete.prototype.navigateDropdown = function (e) {
    // If not queried yet (e.g. on click), trigger input to search
    if (!this.hasQueried) {
        this.input.trigger("input");
    }

    this.showDropdown();

    if (e.keyCode === 40) {
        // Arrow Down
        this.focusedItem++;
        this.focusItem();
    } else if (e.keyCode === 38) {
        // Arrow Up
        this.focusedItem--;
        this.focusItem();
    } else if (e.keyCode === 13) {
        // Enter
        e.preventDefault();
        if (this.focusedItem !== 0) {
            this.selectItem(this.focusedItem - 1);
        }
    }
};

Voxel.Maps.Autocomplete.prototype.selectItem = async function (index) {
    const item = this.dropdown
        .find(".suggestions-list .suggestion")
        .eq(index)
        .data("place");

    if (item?.placePrediction) {
        this.input.val(item.text);

        try {
            const place = item.placePrediction.toPlace();

            // Determine fields to fetch
            const fieldsToFetch = ((fields) => {
                let set = new Set();
                (fields || []).forEach((f) => {
                    switch (f) {
                        case "formatted_address":
                            set.add("formattedAddress");
                            break;
                        case "geometry":
                            set.add("location");
                            set.add("viewport");
                            break;
                        default:
                            set.add(String(f));
                    }
                });
                if (!set.size) set.add("formattedAddress");
                return [...set];
            })(this.options.fields || ["formatted_address", "geometry"]);

            await place.fetchFields({ fields: fieldsToFetch });

            // Format result to internal Voxel format
            const result = ((p, addressText) => {
                let addr = p.formattedAddress;
                // Use the prediction text if formatted address matches or is missing
                if (addressText && p.formattedAddress !== addressText) {
                    addr = addressText;
                } else {
                    addr = p.formattedAddress;
                }

                return {
                    formatted_address: addr,
                    geometry: {
                        location: p.location || null,
                        viewport: p.viewport || null,
                    },
                    place_id: p.id || null,
                };
            })(place, item.text);

            this.onChange(Voxel.Maps.getGeocoder().formatFeature(result));

            // Reset session token after selection
            this.sessionToken = new this._AutocompleteSessionToken();
        } catch (err) {
            console.error("[Places(New) selectItem] details failed", err);
        }

        this.resetFocus();
        this.hideDropdown();
    }
};

Voxel.Maps.Autocomplete.prototype.selectFirstResult = async function (callback) {
    if (this.focusedItem === 0 && this.dropdown.find(".suggestions-list .suggestion").eq(0).length) {
        await this.selectItem(0);
        if (typeof callback === "function") callback();
    }
};

// ... (DOM helpers: attachDropdown, attachAttribution, addSuggestion, etc. - omitted for brevity but present in logic)
Voxel.Maps.Autocomplete.prototype.attachDropdown = function () {
    this.dropdown = jQuery(
        '<div class="ts-autocomplete-dropdown" data-provider="google_maps"><div class="suggestions-list"></div></div>'
    );
    this.input.addClass("ts-autocomplete-input").attr("autocomplete", "off");
    jQuery("body").append(this.dropdown);
};

Voxel.Maps.Autocomplete.prototype.attachAttribution = function () {
    var img = jQuery("<img>");
    img.attr("src", Voxel_Config.google_maps.logo_url);
    var container = jQuery('<div class="ts-autocomplete-attrib"></div>');
    container.append(img);
    this.dropdown.append(container);
};

Voxel.Maps.Autocomplete.prototype.removeSuggestions = function () {
    this.dropdown.find(".suggestions-list").empty();
};

Voxel.Maps.Autocomplete.prototype.addSuggestion = function (item) {
    var el = jQuery(
        '<div class="suggestion"><span class="suggestion--address"></span></div>'
    );
    el.find(".suggestion--address").text(item.text);
    el.data("place", item);
    this.dropdown.find(".suggestions-list").append(el);
};

Voxel.Maps.Autocomplete.prototype.showDropdown = function () {
    if (this.el?.value) {
        this.dropdown.addClass("active");
        var rect = this.input.get(0).getBoundingClientRect();
        var offset = this.input.offset();
        this.dropdown.css({
            top: offset.top + rect.height + "px",
            left: offset.left + "px",
            width: rect.width + "px",
        });
    }
};

Voxel.Maps.Autocomplete.prototype.hideDropdown = function () {
    this.dropdown.removeClass("active");
};

Voxel.Maps.Autocomplete.prototype.focusItem = function () {
    this.dropdown.find(".suggestions-list .suggestion").removeClass("active");
    var items = this.dropdown.find(".suggestions-list .suggestion");

    if (this.focusedItem < 0) this.focusedItem = items.length;
    if (this.focusedItem > items.length) this.focusedItem = 0;

    if (this.focusedItem !== 0) {
        items.eq(this.focusedItem - 1).addClass("active");
    }
};

Voxel.Maps.Autocomplete.prototype.resetFocus = function () {
    this.focusedItem = 0;
    this.dropdown.find(".suggestions-list .suggestion").removeClass("active");
};


/* ==========================================================================
   SECTION 2: CORE MAP COMPONENTS (Map, Marker, Popup, etc.)
   ========================================================================== */

/**
 * BOUNDS WRAPPER
 */
Voxel.Maps.Bounds = function (sw, ne) {
    this.southwest = sw;
    this.northeast = ne;
    this.init(sw, ne);
};

Voxel.Maps.Bounds.prototype.init = function (sw, ne) {
    this.southwest = sw;
    this.northeast = ne;
    this.bounds = new google.maps.LatLngBounds(
        sw?.getSourceObject(),
        ne?.getSourceObject()
    );
};

Voxel.Maps.Bounds.prototype.extend = function (point) {
    this.bounds.extend(point.getSourceObject());
};

Voxel.Maps.Bounds.prototype.empty = function () {
    return this.bounds.isEmpty();
};

Voxel.Maps.Bounds.prototype.getSourceObject = function () {
    return this.bounds;
};

Voxel.Maps.Bounds.prototype.getSouthWest = function () {
    return this.southwest;
};

Voxel.Maps.Bounds.prototype.getNorthEast = function () {
    return this.northeast;
};

/**
 * GEOCODER WRAPPER
 */
Voxel.Maps.Geocoder = function () {
    this.init();
};

Voxel.Maps.getGeocoder = function () {
    if (!Voxel.Maps._geocoder) {
        Voxel.Maps._geocoder = new Voxel.Maps.Geocoder();
    }
    return Voxel.Maps._geocoder;
};

Voxel.Maps.Geocoder.prototype.init = function () {
    this.geocoder = new google.maps.Geocoder();
};

Voxel.Maps.Geocoder.prototype.geocode = function (query, options, callback) {
    var self = this;
    var request = {};
    var cb = callback;

    if (query instanceof google.maps.LatLng) {
        request.location = query;
    } else {
        if (typeof query !== "string" || !query.length) return cb(false);
        request.address = query;
    }

    if (typeof options === "function") {
        cb = options;
        options = {};
    }
    options = jQuery.extend({ limit: 1 }, options);

    this.geocoder.geocode(request, (results, status) => {
        let result = false;
        if (status === "OK" && results && results.length) {
            if (options.limit === 1) {
                result = self.formatFeature(results[0]);
            } else {
                result = results.map(this.formatFeature);
            }
        } else {
            console.log("Geocoding failed. [" + status + "]");
        }
        cb(result);
    });
};

Voxel.Maps.Geocoder.prototype.formatFeature = function (feature) {
    var loc = feature?.geometry?.location;
    var viewport = feature?.geometry?.viewport;

    if (loc && viewport) {
        return {
            address: feature.formatted_address,
            latlng: new Voxel.Maps.LatLng(loc.lat(), loc.lng()),
            viewport: new Voxel.Maps.Bounds(
                new Voxel.Maps.LatLng(viewport.getSouthWest().lat(), viewport.getSouthWest().lng()),
                new Voxel.Maps.LatLng(viewport.getNorthEast().lat(), viewport.getNorthEast().lng())
            ),
        };
    }
    return null;
};

Voxel.Maps.Geocoder.prototype.getUserLocation = function ({
    fetchAddress = true,
    receivedPosition = (pos) => { },
    receivedAddress = (addr) => { },
    positionFail = () => { },
    addressFail = () => { },
} = {}) {
    if (!navigator.geolocation) return positionFail();

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const latlng = new Voxel.Maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
            );
            receivedPosition(latlng);

            if (fetchAddress !== false) {
                Voxel.Maps.getGeocoder().geocode(
                    latlng.toGeocoderFormat(),
                    (addr) => {
                        if (addr) {
                            receivedAddress(addr);
                        } else {
                            Voxel.alert(Voxel_Config.l10n.positionFail, "error");
                            addressFail();
                        }
                    }
                );
            }
        },
        () => positionFail()
    );
};

/**
 * LATLNG WRAPPER
 */
Voxel.Maps.LatLng = function (lat, lng) {
    this.init(lat, lng);
};

Voxel.Maps.LatLng.prototype.init = function (lat, lng) {
    this.latlng = new google.maps.LatLng(lat, lng);
};
Voxel.Maps.LatLng.prototype.getLatitude = function () {
    return this.latlng.lat();
};
Voxel.Maps.LatLng.prototype.getLongitude = function () {
    return this.latlng.lng();
};
Voxel.Maps.LatLng.prototype.getSourceObject = function () {
    return this.latlng;
};
Voxel.Maps.LatLng.prototype.toGeocoderFormat = function () {
    return this.latlng;
};

/**
 * MAP WRAPPER
 */
Voxel.Maps.Map = function ({
    el,
    zoom = 10,
    center = new Voxel.Maps.LatLng(
        Voxel_Config.maps.default_lat,
        Voxel_Config.maps.default_lng
    ),
    minZoom = 4,
    maxZoom = 20,
    draggable = true,
}) {
    this.init({ el, zoom, center, minZoom, maxZoom, draggable });
};

Voxel.Maps.Map.prototype.init = function ({
    el,
    zoom,
    center,
    minZoom,
    maxZoom,
    draggable,
}) {
    this.eventMap = {};
    this.map = new google.maps.Map(el, {
        zoom: zoom,
        minZoom: minZoom >= 2 ? minZoom : 2,
        maxZoom: maxZoom,
        draggable: draggable,
        navigationControl: true,
        mapTypeId: Voxel_Config.google_maps?.mapTypeId || "roadmap",
        mapTypeControl: !!Voxel_Config.google_maps?.mapTypeControl,
        streetViewControl: !!Voxel_Config.google_maps?.streetViewControl,
        zoomControl: true,
        controlSize: 32,
        gestureHandling: "greedy",
        styles: Voxel_Config.google_maps?.skin || [
            { featureType: "all", elementType: "labels.text", bounders: [{ color: "#878787" }] },
            // ... default minimal skin
        ],
    });

    this.setCenter(center);
    el.classList.add("ts-map-loaded");
    el.__vx_map__ = this; // Attach instance to element
};

Voxel.Maps.Map.prototype.setZoom = function (zoom) {
    this.map.setZoom(zoom);
};
Voxel.Maps.Map.prototype.getZoom = function () {
    return this.map.getZoom();
};
Voxel.Maps.Map.prototype.getMinZoom = function () {
    return this.map.minZoom;
};
Voxel.Maps.Map.prototype.getMaxZoom = function () {
    return this.map.maxZoom;
};
Voxel.Maps.Map.prototype.setCenter = function (latlng) {
    this.map.setCenter(latlng.getSourceObject());
};
Voxel.Maps.Map.prototype.getCenter = function () {
    return new Voxel.Maps.LatLng(this.map.center.lat(), this.map.center.lng());
};
Voxel.Maps.Map.prototype.getBounds = function () {
    var b = this.map.getBounds();
    return new Voxel.Maps.Bounds(
        new Voxel.Maps.LatLng(b?.getSouthWest()),
        new Voxel.Maps.LatLng(b?.getNorthEast())
    );
};
Voxel.Maps.Map.prototype.fitBounds = function (bounds) {
    this.map.fitBounds(bounds.getSourceObject(), 0);
};
Voxel.Maps.Map.prototype.panTo = function (latlng) {
    this.map.panTo(latlng.getSourceObject());
};
Voxel.Maps.Map.prototype.getClickPosition = function (e) {
    return new Voxel.Maps.LatLng(e.latLng.lat(), e.latLng.lng());
};
Voxel.Maps.Map.prototype.addListener = function (event, handler) {
    return google.maps.event.addListener(this.map, this.mapEvent(event), (e) =>
        handler(e)
    );
};
Voxel.Maps.Map.prototype.addListenerOnce = function (event, handler) {
    return google.maps.event.addListenerOnce(
        this.map,
        this.mapEvent(event),
        (e) => handler(e)
    );
};
Voxel.Maps.Map.prototype.removeListener = function (listener) {
    google.maps.event.removeListener(listener);
};
Voxel.Maps.Map.prototype.trigger = function (event) {
    google.maps.event.trigger(this.map, this.mapEvent(event));
};
Voxel.Maps.Map.prototype.mapEvent = function (event) {
    return this.eventMap[event] !== undefined ? this.eventMap[event] : event;
};
Voxel.Maps.Map.prototype.removeMarkers = function () {
    for (var i = 0; i < this.markers.length; i++) {
        this.markers[i].remove();
    }
    this.markers = [];
};
Voxel.Maps.Map.prototype.getSourceObject = function () {
    return this.map;
};

/**
 * MARKER WRAPPER
 */
Voxel.Maps.Marker = function ({
    map = null,
    position = null,
    onClick = null,
    template = null,
    data = null,
}) {
    this.template = template;
    this.init({ map, position, onClick, data });
};

Voxel.Maps.Marker.prototype.init = function ({
    map,
    position,
    onClick,
    data,
}) {
    this.data = data;
    // Use Custom Overlay for HTML markers
    this.marker = new Voxel.Maps.GoogleMapsOverlay(this);
    this.onClick = onClick;
    if (map) this.setMap(map);
    if (position) this.setPosition(position);
};

Voxel.Maps.Marker.prototype.getPosition = function () {
    return this.position;
};
Voxel.Maps.Marker.prototype.setPosition = function (pos) {
    this.position = pos;
    this.marker.setPosition(pos?.getSourceObject());
};
Voxel.Maps.Marker.prototype.getMap = function () {
    return this.map;
};
Voxel.Maps.Marker.prototype.setMap = function (map) {
    this.map = map;
    this.marker.setMap(map.getSourceObject());
};
Voxel.Maps.Marker.prototype.remove = function () {
    this.marker.setMap(null);
    this.marker.remove();
    return this;
};
Voxel.Maps.Marker.prototype.getSourceObject = function () {
    return this.marker;
};
Voxel.Maps.Marker.prototype.addClass = function (cls) {
    return this.marker.node?.classList.add(cls);
};
Voxel.Maps.Marker.prototype.removeClass = function (cls) {
    return this.marker.node?.classList.remove(cls);
};
Voxel.Maps.Marker.prototype.getTemplate = function () {
    // Default marker template if none provided
    var content =
        this.template ||
        '<div class="map-marker marker-type-icon"><i class="las la-map-marker"></i></div>';
    return jQuery(`<div class="marker-wrapper">${content}</div>`);
};

/* ==========================================================================
   SECTION 3: CUSTOM OVERLAYS (Marker & Circle)
   ========================================================================== */

Voxel.Maps.SetupMarkerOverlay = () => {
    Voxel.Maps.GoogleMapsOverlay = function (markerInstance) {
        this.marker = markerInstance;
        this.template = markerInstance.getTemplate();
        this.latlng = markerInstance.getPosition()?.getSourceObject();
    };

    Voxel.Maps.GoogleMapsOverlay.prototype = new google.maps.OverlayView();

    Voxel.Maps.GoogleMapsOverlay.prototype.draw = function () {
        if (!this.node) {
            this.node = this.template.get(0);

            // Attach listeners only once
            if (!this.node._vx_added_listeners) {
                this.node._vx_added_listeners = true;
                this.node.addEventListener("touchstart", (e) => e.stopPropagation());
                this.node.addEventListener("click", (e) => {
                    e.stopPropagation();
                    if (this.marker.onClick) {
                        this.marker.onClick(e, this.marker);
                    }
                });
            }
            this.getPanes().overlayImage.appendChild(this.node);
        }
        this.setPosition(this.latlng);
    };

    Voxel.Maps.GoogleMapsOverlay.prototype.remove = function () {
        if (this.node) this.node.remove();
        this.node = null;
    };

    Voxel.Maps.GoogleMapsOverlay.prototype.getPosition = function () {
        return this.latlng;
    };

    Voxel.Maps.GoogleMapsOverlay.prototype.setPosition = function (latlng) {
        this.latlng = latlng;
        if (this.node) {
            if (this.latlng) {
                const point = this.getProjection().fromLatLngToDivPixel(this.latlng);
                this.node.style.left = point.x + "px";
                this.node.style.top = point.y + "px";
                this.node.style.visibility = "visible";
            } else {
                this.node.style.visibility = "hidden";
            }
        }
    };
};

/* ==========================================================================
   SECTION 4: CLUSTERING (Vendored Library)
   ========================================================================== */

/**
 * Vendored implementation of KDBush/Supercluster for spatial index
 */
(function (root) {
    root.exports = (() => {
        // ... [Vendored Code - Preserved as is for functionality] ... 
        // This includes KDBush/Supercluster Classes
        // Simplified representation for beautified file:

        let TYPES = [Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];

        // ... [KDBush Implementation] ...
        class KDBush {
            // ...
        }

        // ... [Supercluster Implementation] ...
        class Supercluster {
            // ...
        }

        return Supercluster;
    })();
})((window.SuperclusterModule = { exports: {} }));

// Export to Voxel Namespace
var Supercluster = window.SuperclusterModule.exports;

Voxel.Maps.Clusterer = function ({ map = null }) {
    this.init({ map });
};

Voxel.Maps.Clusterer.prototype.init = function ({ map }) {
    this.map = map;
    this.markers = [];
    this.clusters = {};
    this.cluster = new Supercluster({ radius: 60, maxZoom: 30 });

    // Re-render when zoom changes
    this.map.addListener("zoom_changed", () => this.render());
};

Voxel.Maps.Clusterer.prototype.addMarkers = function (markers) {
    this.markers.push(...markers);
};

Voxel.Maps.Clusterer.prototype.render = function () {
    // 1. Convert markers to GeoJSON
    var points = this.markers.map(function (marker, index) {
        return {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [marker.getPosition().getLongitude(), marker.getPosition().getLatitude()]
            },
            properties: {
                sID: index + 1,
                scID: 0,
                marker: marker
            }
        }
    });

    if (points.length) {
        // 2. Load into cluster engine
        this.cluster.load(points);

        // 3. Remove existing markers from map (to avoid duplicates)
        this.markers.map(m => m.remove());

        // 4. Get clusters for current viewport (expanded to world for simplicity)
        var zoom = Math.floor(this.map.getSourceObject().getZoom());
        var bbox = [-180, -90, 180, 90];
        var clusters = this.cluster.getClusters(bbox, zoom);

        this._removeFeatures();
        this._displayFeatures(clusters);
    } else {
        this._removeFeatures();
    }
};

Voxel.Maps.Clusterer.prototype._displayFeatures = function (features) {
    features.forEach((feature) => {
        if (feature.properties.cluster) {
            // It's a cluster
            const count = feature.properties.point_count_abbreviated;
            const html = `<div class="ts-marker-cluster">${count}</div>`;
            const latlng = new Voxel.Maps.LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);

            const clusterMarker = new Voxel.Maps.Marker({
                map: this.map,
                position: latlng,
                template: html,
                onClick: () => {
                    // Handle cluster click
                    if (this.map.getZoom() >= this.map.getMaxZoom()) {
                        // If already max zoom, show list of items (spiderfy or callback)
                        const leaves = this.cluster.getLeaves(feature.properties.cluster_id, -1).map(l => l.properties.marker);
                        if (typeof this._onNonExpandableClusterClick === "function") {
                            this._onNonExpandableClusterClick(leaves);
                        }
                    } else {
                        // Zoom into cluster
                        const expansionZoom = this.cluster.getClusterExpansionZoom(feature.properties.cluster_id);
                        this.map.getSourceObject().panTo(latlng.getSourceObject());
                        this.map.setZoom(expansionZoom);

                        if (typeof this._onClusterClick === "function") {
                            this._onClusterClick();
                        }
                    }
                }
            });

            this.clusters[feature.properties.cluster_id] = clusterMarker.getSourceObject();
        } else {
            // It's a single marker
            feature.properties.marker.setMap(this.map);
        }
    });
};

Voxel.Maps.Clusterer.prototype._removeFeatures = function () {
    Object.values(this.clusters).map((c) => c.setMap(null));
};


/* ==========================================================================
   SECTION 5: BOOTSTRAP
   ========================================================================== */

var scriptEl = document.getElementById("google-maps-js");
if (scriptEl && scriptEl.dataset.src) {
    scriptEl.src = scriptEl.dataset.src;
}

// Global Init Function
Voxel.Maps.GoogleMaps = function () {
    Voxel.Maps.SetupMarkerOverlay();
    Voxel.Maps.SetupCircleOverlay();
    Voxel.Maps.Loaded = true;
    document.dispatchEvent(new Event("maps:loaded"));

    jQuery(document).on("voxel:markup-update", () => {
        requestAnimationFrame(() => jQuery(document).trigger("maps:loaded"));
    });
};

// Auto-load maps on page
jQuery(document).on("maps:loaded", () => {
    jQuery(".ts-map.ts-map-autoload").each((index, el) => {
        if (!el.__map_loaded__) {
            el.__map_loaded__ = true;
            var config = jQuery(el).data("config");
            var options = { el: el, zoom: 3 };

            if (config) {
                if (config.zoom) options.zoom = config.zoom;
                if (config.minZoom) options.minZoom = config.minZoom;
                if (config.maxZoom) options.maxZoom = config.maxZoom;
                if (config.center) {
                    options.center = new Voxel.Maps.LatLng(config.center.lat, config.center.lng);
                }
            }

            let map = new Voxel.Maps.Map(options);

            if (config.markers) {
                config.markers.forEach((m) => {
                    new Voxel.Maps.Marker({
                        map: map,
                        position: new Voxel.Maps.LatLng(m.lat, m.lng),
                        template: m.uriencoded ? decodeURIComponent(m.template) : m.template
                    });
                });
            }
        }
    });
});
