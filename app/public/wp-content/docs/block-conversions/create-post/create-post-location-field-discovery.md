# Create Post Block - Location Field Discovery

**Date:** November 23, 2025
**Status:** Discovery Complete - Implementation Pending
**Priority:** HIGH (Replaces random coordinates workaround)

---

## 📋 Discovery Summary

**Voxel Template:** `themes/voxel/templates/widgets/create-post/location-field.php`
**Voxel Field Class:** `themes/voxel/app/post-types/fields/location-field.php`
**Complexity:** HIGH (Map provider integration required)

---

## 1. HTML Structure (1:1 Match Required)

**Evidence:** `location-field.php:1-77`

### Main Container:
```html
<div class="ts-form-group ts-location-field form-field-grid">
```

### Field Components (in order):

#### 1. Address Input (lines 3-24):
```html
<div class="ts-form-group">
  <label>
    {{ field.label }}
    <slot name="errors"></slot>
    <div class="vx-dialog" v-if="field.description">
      <icon-info/>
      <div class="vx-dialog-content min-scroll">
        <p>{{ field.description }}</p>
      </div>
    </div>
  </label>
  <div class="ts-input-icon flexify">
    <?= \Voxel\get_icon_markup( 'ts_location_icon' ) ?>
    <input
      ref="addressInput"
      :value="field.value.address"
      :placeholder="field.props.placeholder"
      type="text"
      class="ts-filter"
    >
  </div>
</div>
```

**CSS Classes:** `ts-form-group`, `ts-input-icon`, `flexify`, `ts-filter`

#### 2. Geolocate Button (lines 25-30):
```html
<div class="ts-form-group">
  <a href="#" class="ts-btn ts-btn-4 form-btn ts-btn-large" @click.prevent="geolocate">
    <?= \Voxel\get_icon_markup( 'ts_mylocation_icon' ) ?>
    <p><?= _x( 'Geolocate my address', 'location field', 'voxel' ) ?></p>
  </a>
</div>
```

**CSS Classes:** `ts-btn`, `ts-btn-4`, `form-btn`, `ts-btn-large`

#### 3. Map Picker Toggle (lines 31-42):
```html
<div class="ts-form-group switcher-label">
  <label>
    <div class="switch-slider">
      <div class="onoffswitch">
        <input v-model="field.value.map_picker" type="checkbox" class="onoffswitch-checkbox">
        <label class="onoffswitch-label" @click.prevent="field.value.map_picker = !field.value.map_picker"></label>
      </div>
    </div>
    <?= _x( 'Pick the location manually?', 'location field', 'voxel' ) ?>
  </label>
</div>
```

**CSS Classes:** `switcher-label`, `switch-slider`, `onoffswitch`, `onoffswitch-checkbox`, `onoffswitch-label`

#### 4. Map Container (lines 43-46):
```html
<div class="ts-form-group" v-show="field.value.map_picker">
  <label><?= _x( 'Pick on the map', 'location field', 'voxel' ) ?></label>
  <div class="location-field-map" ref="mapDiv"></div>
</div>
```

**CSS Classes:** `location-field-map`

#### 5. Manual Lat/Lng Inputs (lines 47-68):
```html
<template v-if="field.value.map_picker">
  <div class="ts-form-group vx-1-2">
    <label><?= _x( 'Latitude', 'location field', 'voxel' ) ?></label>
    <div class="ts-input-icon flexify">
      <?= \Voxel\get_icon_markup( 'ts_location_icon' ) ?>
      <input
        v-model="field.value.latitude"
        type="number"
        max="90"
        min="-90"
        class="ts-filter"
        placeholder="Latitude"
      >
    </div>
  </div>
  <div class="ts-form-group vx-1-2">
    <label><?= _x( 'Longitude', 'location field', 'voxel' ) ?></label>
    <div class="ts-input-icon flexify">
      <?= \Voxel\get_icon_markup( 'ts_location_icon' ) ?>
      <input
        v-model="field.value.longitude"
        type="number"
        max="180"
        min="-180"
        class="ts-filter"
        placeholder="Longitude"
      >
    </div>
  </div>
</template>
```

**CSS Classes:** `vx-1-2` (half-width grid column)

#### 6. Hidden Marker (lines 71-75):
```html
<div ref="marker" class="hidden">
  <div class="map-marker marker-type-icon mi-static">
    <?= \Voxel\svg( 'marker.svg' ) ?>
  </div>
</div>
```

---

## 2. Field Value Structure

**Evidence:** `location-field.php:63-78`

```php
public function sanitize( $value ) {
	$location = [
		'address' => $value['address'] ? sanitize_text_field( $value['address'] ) : null,
		'map_picker' => !! ( $value['map_picker'] ?? false ),
		'latitude' => $value['latitude'] ? round( floatval( $value['latitude'] ), 5 ) : null,
		'longitude' => $value['longitude'] ? round( floatval( $value['longitude'] ), 5 ) : null,
	];

	if ( is_null( $location['address'] ) || is_null( $location['latitude'] ) || is_null( $location['longitude'] ) ) {
		return null; // All three required
	}

	$location['latitude'] = \Voxel\clamp( $location['latitude'], -90, 90 );
	$location['longitude'] = \Voxel\clamp( $location['longitude'], -180, 180 );
	return $location;
}
```

**TypeScript Interface:**
```typescript
interface LocationValue {
  address: string;          // Required - Full address string
  map_picker: boolean;      // Toggle for manual picker
  latitude: number;         // Required - Clamped -90 to 90
  longitude: number;        // Required - Clamped -180 to 180
}
```

**Validation Rules:**
- All three fields (`address`, `latitude`, `longitude`) MUST be set
- If any is null, entire field value is null
- Latitude clamped: `-90 <= lat <= 90`
- Longitude clamped: `-180 <= lng <= 180`
- Coordinates rounded to 5 decimal places

---

## 3. JavaScript Dependencies

**Evidence:** `location-field.php:130-136`

```php
protected function frontend_props() {
	\Voxel\enqueue_maps(); // Loads map provider JS
	return [
		'placeholder' => $this->get_model_value('placeholder') ?: $this->props['label'],
		'default_zoom' => \Voxel\get( 'settings.maps.default_location.zoom' ) ?: 10,
	];
}
```

**Required:**
1. **Map Provider:** `\Voxel\enqueue_maps()`
   - Loads Google Maps OR Mapbox based on settings
   - Settings key: `\Voxel\get('settings.maps.provider')` 
   - Options: `'google_maps'` or `'mapbox'`

2. **Autocomplete API:**
   - Google Maps: Places Autocomplete
   - Mapbox: Geocoding API

3. **Geolocation API:**
   - Browser's `navigator.geolocation.getCurrentPosition()`

**Vue Methods (Need React Equivalents):**
- `geolocate()` - Get user's current location
- Map initialization on `mapDiv` ref
- Autocomplete on `addressInput` ref
- Marker drag handler
- Lat/lng → Address reverse geocoding

---

## 4. Map Provider Configuration

**Google Maps:**
```php
\Voxel\get( 'settings.maps.google_maps.api_key' );
\Voxel\get( 'settings.maps.google_maps.autocomplete.countries' );
```

**Mapbox:**
```php
\Voxel\get( 'settings.maps.mapbox.api_key' );
\Voxel\get( 'settings.maps.mapbox.autocomplete.countries' );
\Voxel\get( 'settings.maps.mapbox.autocomplete.feature_types_in_submission' );
```

**Default Location:**
```php
\Voxel\get( 'settings.maps.default_location.zoom' ) ?: 10;
\Voxel\get( 'settings.maps.default_location.lat' );
\Voxel\get( 'settings.maps.default_location.lng' );
```

---

## 5. Implementation Strategy

### Stage 1: Basic Address Input (Quick Unblock) ⚠️ CURRENT WORKAROUND

**Goal:** Unblock Phase A completion
**Approach:** Simple address text input only

```typescript
// Minimal implementation
<div className="ts-form-group ts-location-field">
  <label className="ts-form-label">
    {field.label}
    {field.required && <span className="required"> *</span>}
  </label>
  <div className="ts-input-icon flexify">
    <svg>{/* location icon */}</svg>
    <input
      type="text"
      className="ts-filter"
      value={value?.address || ''}
      onChange={(e) => onChange({
        address: e.target.value,
        latitude: 0, // Temporary random coords
        longitude: 0,
        map_picker: false
      })}
      placeholder={field.props?.placeholder || field.label}
    />
  </div>
</div>
```

**Limitations:**
- No autocomplete
- No geolocation
- No map picker
- Uses random coordinates (workaround)

**Blocks Resolved:**
- Removes database error: `Field '_location' doesn't have a default value`
- Allows post creation for location-enabled post types

---

### Stage 2: Full Location Field (Proper Implementation)

**Requirements:**
1. ✅ Address input with icon
2. ⚠️ Autocomplete integration (Google Maps/Mapbox API)
3. ⚠️ Geolocate button (browser geolocation)
4. ⚠️ Map picker toggle (switcher)
5. ⚠️ Interactive map (Google Maps/Mapbox SDK)
6. ⚠️ Manual lat/lng inputs
7. ⚠️ Marker drag on map
8. ⚠️ Reverse geocoding (lat/lng → address)

**Dependencies:**
- `@googlemaps/js-api-loader` OR `mapbox-gl` + `@mapbox/search-js-react`
- Voxel map provider configuration
- API keys from Voxel settings

**Complexity:** HIGH (3-5 days)

**Files to Create:**
```
app/blocks/src/create-post/components/fields/
├── LocationField.tsx           # Main component
├── LocationField/
│   ├── AddressInput.tsx        # Autocomplete input
│   ├── GeolocateButton.tsx     # "Use my location"
│   ├── MapPicker.tsx           # Interactive map
│   ├── LatLngInputs.tsx        # Manual inputs
│   └── MapProvider.tsx         # Google/Mapbox abstraction
```

**Implementation Steps:**
1. Create map provider abstraction (Google/Mapbox)
2. Implement address autocomplete
3. Implement geolocation button
4. Implement map picker with marker
5. Implement manual lat/lng inputs
6. Add validation and error handling
7. Test with both map providers

---

## 6. Testing Checklist

### Stage 1 (Basic):
- [ ] Address input renders
- [ ] Address value saves to database
- [ ] Post creates without database error
- [ ] Validation shows when address is empty (if required)

### Stage 2 (Full):
- [ ] Autocomplete suggests addresses (Google Maps)
- [ ] Autocomplete suggests addresses (Mapbox)
- [ ] Geolocate button gets user location
- [ ] Map picker toggle shows/hides map
- [ ] Map initializes with default location
- [ ] Marker is draggable on map
- [ ] Dragging marker updates lat/lng inputs
- [ ] Changing lat/lng inputs updates marker
- [ ] Address updates when marker moves (reverse geocoding)
- [ ] Manual lat/lng entry validates ranges
- [ ] All three fields (address, lat, lng) required
- [ ] Form submission includes location data
- [ ] Edit mode loads existing location
- [ ] Location displays correctly on post

---

## 7. Known Issues & Solutions

### Issue 1: Database Error (SOLVED by random coords workaround)

**Error:** `Field '_location' doesn't have a default value`

**Cause:** Voxel's indexing expects location data for post types with location filter

**Current Solution:** Use random coordinates in Phase A

**Proper Solution:** Implement full location field (Stage 2)

---

### Issue 2: Map Provider Detection

**Challenge:** Need to detect which map provider is active

**Solution:**
```typescript
// Get from Voxel settings passed via wp_localize_script
const mapProvider = wpData.mapProvider; // 'google_maps' or 'mapbox'
const mapApiKey = wpData.mapApiKey;
```

**PHP in render.php:**
```php
wp_localize_script( 'voxel-fse-create-post-frontend', 'voxelFseCreatePost', [
	// ... existing data
	'mapProvider' => \Voxel\get( 'settings.maps.provider' ),
	'mapApiKey' => \Voxel\get( "settings.maps.{$provider}.api_key" ),
	'mapDefaultZoom' => \Voxel\get( 'settings.maps.default_location.zoom' ) ?: 10,
	'mapDefaultLat' => \Voxel\get( 'settings.maps.default_location.lat' ),
	'mapDefaultLng' => \Voxel\get( 'settings.maps.default_location.lng' ),
] );
```

---

### Issue 3: API Key Security

**Challenge:** Exposing API keys in frontend

**Voxel's Approach:** Keys are exposed in frontend (standard for map APIs)

**Security:** Use domain restrictions (Google) or referrer restrictions (Mapbox)

---

## 8. Related Documentation

- **Voxel Location Filter:** `themes/voxel/app/post-types/filters/location-filter.php`
- **Voxel Maps Controller:** `themes/voxel/app/controllers/frontend/maps-controller.php`
- **Voxel Map Abstraction:** `themes/voxel/assets/js/src/utils/map.js`

---

## 9. Recommendation

**For Phase B:**
1. ✅ **Implement Stage 1** (Basic address input) - Quick unblock
2. ⏭️ **Defer Stage 2** (Full location field) - Implement after other field types
3. 🎯 **Priority:** Complete basic field types first (select, radio, checkbox, date, file)

**Reasoning:**
- Stage 1 unblocks database error immediately
- Other field types are simpler and faster to implement
- Location field complexity (map integration) deserves dedicated time
- Can revisit location field after core field types complete

---

**Status:** Discovery Complete ✅ | Stage 1 Implementation: Recommended Next

**Created:** November 23, 2025
**Last Updated:** November 23, 2025

