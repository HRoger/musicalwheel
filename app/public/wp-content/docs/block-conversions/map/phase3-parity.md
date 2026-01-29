# Map Block - Phase 3 Parity

**Date:** December 23, 2025 (Updated: Dec 24, 2025 - verified consumer architecture)
**Status:** Complete (100% parity for map block scope)
**Reference:** voxel-map.beautified.js (969 lines, ~32KB)

## Summary

The map block has **100% parity** for its scope through a **consumer architecture** - it uses Voxel.Maps API directly rather than re-implementing Google Maps logic. This is the optimal approach since Voxel's Google Maps wrapper is already loaded and battle-tested.

**Key Insight (Dec 24, 2025):** The "gaps" previously documented (Circle, Popup, Spiderfy) are NOT map block features - they belong to Voxel's search-form Vue app (voxel-search-form.beautified.js lines 1333-1342). Our map block correctly consumes Voxel.Maps API without re-implementing features that other components manage.

The React implementation adds FSE-specific features: responsive styling via CSS custom properties, vxconfig normalization for Next.js compatibility, and voxelShim for Vue/React coexistence.

## Voxel JS Analysis

- **Total lines:** 969
- **Components:** 9 (Map, Marker, Clusterer, Autocomplete, LatLng, Bounds, Geocoder, Circle, Popup)
- **Marker implementation:** Custom OverlayView for HTML markers
- **Clustering:** Vendored Supercluster library
- **Dependencies:** Google Maps JS API, jQuery

### Component Breakdown

| Component | Lines | Purpose |
|-----------|-------|---------|
| Autocomplete | 124-379 | Google Places autocomplete with debounced query |
| Bounds | 388-422 | LatLngBounds wrapper |
| Geocoder | 427-525 | Geocoding + getUserLocation |
| LatLng | 530-548 | LatLng wrapper |
| Map | 553-662 | google.maps.Map wrapper |
| Marker | 667-726 | Custom HTML markers via OverlayView |
| GoogleMapsOverlay | 732-783 | OverlayView implementation |
| Clusterer | 817-914 | Supercluster-based clustering |
| Bootstrap | 921-968 | Auto-initialization on maps:loaded |

## React Implementation Analysis

- **Entry point:** frontend.tsx (~929 lines)
- **Architecture:** Consumer of Voxel.Maps API
- **Pattern:** SSR save.tsx + hydration frontend.tsx (Plan C+)

### Key React Features

1. **voxelShim integration** - Patches Vue mixins for coexistence
2. **TypeScript interfaces** - Full typing for Voxel.Maps API
3. **Config normalization** - Handles camelCase/snake_case for Next.js
4. **Responsive styling** - CSS custom properties + resize handler
5. **Dual modes** - current-post (single marker) and search-form (feed markers)
6. **Event integration** - voxel-search-submit, maps:loaded, voxel:markup-update

## Parity Checklist

### Voxel.Maps API Consumption

| Voxel Component | React Usage | Status |
|-----------------|-------------|--------|
| Voxel.Maps.await() | Used to wait for API ready | ✅ Done |
| Voxel.Maps.Map | new Voxel.Maps.Map({ el, zoom, center }) | ✅ Done |
| Voxel.Maps.LatLng | new Voxel.Maps.LatLng(lat, lng) | ✅ Done |
| Voxel.Maps.Marker | new Voxel.Maps.Marker({ map, position, template }) | ✅ Done |
| Voxel.Maps.Clusterer | new Voxel.Maps.Clusterer({ map }) | ✅ Done |
| Voxel.Maps.Bounds | new Voxel.Maps.Bounds(sw, ne) | ✅ Done |
| Voxel.Maps.Autocomplete | Referenced in types | ✅ Done |
| Voxel.Maps.getGeocoder() | Used for location | ✅ Done |
| Voxel.Maps.Circle | Not implemented | ⚠️ Minor gap |
| Voxel.Maps.Popup | Uses native infowindow | ⚠️ Minor gap |

### Event Handlers

| Voxel Event | React Implementation | Status |
|-------------|---------------------|--------|
| maps:loaded | waitForVoxelMaps() listener | ✅ Done |
| voxel:markup-update | jQuery(document).trigger() | ✅ Done |
| zoom_changed | Map listener via Voxel API | ✅ Done |
| dragend | Handled by map API | ✅ Done |
| voxel-search-submit | window.addEventListener | ✅ Done |
| turbo:load | window.addEventListener | ✅ Done |
| pjax:complete | window.addEventListener | ✅ Done |
| resize | Debounced resize handler | ✅ Done |

### State Management

| Voxel Pattern | React Implementation | Status |
|---------------|---------------------|--------|
| data-config attribute | parseVxConfig() | ✅ Done |
| map instance storage | mapContainer._voxelMap | ✅ Done |
| hydration prevention | data-hydrated attribute | ✅ Done |
| marker templates | template encoding | ✅ Done |

### API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| voxel-fse/v1/map/post-location | fetch() | ✅ Done |
| ?vx=1&action=search_posts | Via search-form | ✅ Done |

### CSS Classes

| Voxel Class | React Usage | Status |
|-------------|-------------|--------|
| .ts-map | mapContainer className | ✅ Done |
| .ts-map-autoload | current-post mode | ✅ Done |
| .ts-map-loaded | Added after init | ✅ Done |
| .ts-map-drag | renderDragSearchUI() | ✅ Done |
| .ts-drag-toggle | Automatic mode toggle | ✅ Done |
| .ts-search-area | Manual mode button | ✅ Done |
| .vx-geolocate-me | renderGeolocateButton() | ✅ Done |
| .marker-wrapper | Via Voxel.Maps.Marker | ✅ Done |
| .ts-marker-cluster | Via Voxel.Maps.Clusterer | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | data-hydrated check | ✅ Done |
| Voxel.Maps not available | console.warn + return | ✅ Done |
| API not ready | waitForVoxelMaps polling | ✅ Done |
| Missing post ID | console.warn + return | ✅ Done |
| REST API error | try/catch + console.error | ✅ Done |
| Resize responsiveness | Debounced style reapply | ✅ Done |

## FSE-Specific Enhancements (Beyond Voxel)

### 1. CSS Custom Properties for Styling

```typescript
// 50+ CSS custom properties for fine-grained control
wrapper.style.setProperty('--vx-map-height', height);
wrapper.style.setProperty('--vx-cluster-size', clusterSize);
wrapper.style.setProperty('--vx-icon-marker-size', iconSize);
// ... etc
```

### 2. Responsive Value System

```typescript
function getResponsiveValue<T>(value: ResponsiveValue<T>, fallback: T): T {
  const device = getCurrentDevice(); // mobile/tablet/desktop
  if (device === 'mobile') return value.mobile ?? value.tablet ?? value.desktop ?? fallback;
  // ...
}
```

### 3. Config Normalization for Next.js

```typescript
function normalizeConfig(raw: Record<string, unknown>): MapVxConfig {
  // Handles both camelCase (REST API) and snake_case (vxconfig)
  return {
    dragSearch: (raw.dragSearch ?? raw.drag_search ?? true) as boolean,
    // ...
  };
}
```

### 4. voxelShim Integration

```typescript
import { initVoxelShim } from '@shared/utils/voxelShim';
initVoxelShim(); // Patches Voxel.mixins.base for Vue/React coexistence
```

### 5. Dual Source Modes

- **current-post:** Single marker for current post's location
- **search-form:** Dynamic markers from search results

## Clarification: "Gaps" Are Not Map Block Features

### Analysis of Voxel Source (Dec 24, 2025)

Investigation of voxel-search-form.beautified.js reveals that Circle and Popup are created and managed by the **search-form Vue app**, not the map block:

```javascript
// voxel-search-form.beautified.js lines 1333-1342
this.popup = new Voxel.Maps.Popup({ map: this.map });
this.mapCircle = new Voxel.Maps.Circle({
    map: this.map,
    strokeColor: '#5b2942',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#5b2942',
    fillOpacity: 0.15
});
this.mapCircle.hide();
```

### 1. Voxel.Maps.Circle - NOT a Map Block Feature

**Owner:** search-form Vue app (FilterLocation component)
**Purpose:** Proximity radius visualization when `value.method === "radius"`
**Methods used:** `setCenter()`, `setRadius()`, `getBounds()`, `show()`, `hide()`

**Why not needed in map block:** Circle is a search-form feature for visualizing the proximity search radius. When using FSE search-form block, location filtering works via events without circle visualization. The circle is purely visual enhancement.

### 2. Voxel.Maps.Popup - NOT a Map Block Feature

**Owner:** search-form Vue app
**Purpose:** Custom styled marker card previews (lines 1373-1375)

**Why not needed in map block:** Popup content is set and controlled by search-form when user hovers/clicks markers. The map block only provides the map container - popup management is search-form's responsibility.

### 3. Spiderfy - Handled by Voxel.Maps.Clusterer

**Location:** voxel-map.beautified.js lines 886-889
**Implementation:** `_onNonExpandableClusterClick` callback shows list of overlapping markers at max zoom

**Why not needed in map block:** This is handled internally by Voxel.Maps.Clusterer which we consume. We don't re-implement clustering internals.

## Architecture Rationale

The consumer architecture is **intentionally correct** because:

1. **No duplication** - Voxel's Google Maps wrapper (google-maps.js) is already loaded
2. **Battle-tested** - Voxel's API handles edge cases and browser quirks
3. **Consistency** - Same marker styling, clustering behavior as Elementor widgets
4. **Updates** - Voxel updates to Maps API automatically apply
5. **Bundle size** - No need to bundle Google Maps logic in FSE block

The React implementation adds **FSE-specific value**:
- CSS custom properties for Gutenberg styling
- Config normalization for headless/Next.js
- TypeScript typing for development safety
- voxelShim for Vue/React DOM coexistence

## Code Quality

- ✅ TypeScript strict mode with full Voxel.Maps typing
- ✅ JSDoc comments with file references
- ✅ Error handling with try/catch
- ✅ Re-initialization prevention
- ✅ Responsive value system
- ✅ vxconfig output for DevTools visibility

## Build Output

Build verified December 23, 2025:
```
frontend.js  15.64 kB | gzip: 4.72 kB
```

## Conclusion

The map block has **100% parity** for its scope through correct consumer architecture:

### ✅ Verified Features (Map Block Scope)

- ✅ Uses Voxel.Maps.Map, Marker, Clusterer, LatLng, Bounds, Geocoder
- ✅ Waits for maps:loaded event properly
- ✅ Triggers voxel:markup-update for compatibility
- ✅ Supports current-post and search-form modes
- ✅ Drag search UI (automatic/manual modes)
- ✅ Geolocation button
- ✅ Responsive CSS custom properties
- ✅ Re-initialization prevention
- ✅ Turbo/PJAX navigation support
- ✅ TypeScript interfaces for Voxel.Maps API
- ✅ voxelShim for Vue/React coexistence

### ✅ Not Gaps (Features Owned by Other Components)

- ✅ Circle - Owned by search-form Vue app (FilterLocation)
- ✅ Popup - Owned by search-form Vue app (marker previews)
- ✅ Spiderfy - Handled internally by Voxel.Maps.Clusterer

The consumer architecture is the **correct approach** for this block. We consume Voxel.Maps API without re-implementing features that belong to other components (search-form) or are handled internally (clustering).
