# Google Maps in Gutenberg Block Editor - Fix Implementation

**Date:** December 2, 2025
**Status:** Complete
**Issue:** Google Maps not rendering in Create Post block within Gutenberg editor
**Location:** `themes/voxel-fse/app/blocks/Block_Loader.php`

---

## Problem Description

The Google Map was not rendering in the Location field of the Create Post block when editing in the Gutenberg block editor. The map container existed (`.location-field-map` div) but:
- No `ts-map-loaded` class was being added
- No Google Maps content was being appended
- Console showed: `Voxel.Maps.GoogleMaps is not a function`

**Key observation:** The map worked correctly on the frontend - only the Gutenberg backend editor was affected.

---

## Root Cause Analysis

### The Race Condition

The issue was a complex **race condition** between multiple scripts:

1. **Google Maps API** (`google-maps`) - Loads with `loading=async` and calls `Voxel.Maps.GoogleMaps` callback when ready
2. **Voxel Commons** (`vx:commons.js`) - Defines the `Voxel.Maps` object structure and `await()` method
3. **Voxel Google Maps Wrapper** (`vx:google-maps.js`) - Defines `Voxel.Maps.Map`, `Voxel.Maps.Marker`, `Voxel.Maps.Autocomplete` classes

### What Was Happening

1. Google Maps API script loaded asynchronously
2. Google Maps called `Voxel.Maps.GoogleMaps()` callback
3. But the callback wasn't defined yet (or was a stub that didn't work properly)
4. Error: `Voxel.Maps.GoogleMaps is not a function`

### Additional Issues Discovered

1. **Stub callback removed:** The early stub registration was commented out with note "Early stub registration removed - commons.js replaces window.Voxel.Maps anyway"
2. **wp_add_inline_script timing:** Even when the stub existed, it was output via `wp_add_inline_script` which runs AFTER the script tag, but Google Maps `loading=async` can execute before
3. **Missing vx:google-maps.js:** Only `google-maps` (the API) was being enqueued, not `vx:google-maps.js` (Voxel's wrapper with Map/Marker/Autocomplete classes)
4. **Premature maps:loaded event:** The stub dispatched `maps:loaded` before `vx:google-maps.js` loaded, so listeners couldn't use the classes

---

## Solution Implemented

### 1. Inject Stub Directly in `<head>` via `admin_head`

**File:** `Block_Loader.php` line 78

```php
add_action('admin_head', [__CLASS__, 'inject_google_maps_stub_in_head'], 1);
```

Using `admin_head` at priority 1 ensures the stub is defined **before any scripts are output**.

### 2. Create Comprehensive Stub Callback

**File:** `Block_Loader.php` method `inject_google_maps_stub_in_head()` (lines 767-886)

The stub now:
- Initializes `window.Voxel` and `window.Voxel.Maps` immediately
- Records when callback is fired (`_voxel_gmaps_callback_fired = true`)
- **Waits for `vx:google-maps.js`** to load before dispatching `maps:loaded`
- Polls every 50ms for `Voxel.Maps.Map` to be defined (max 10 seconds)
- Monitors and restores the callback if `commons.js` replaces `Voxel.Maps`

```javascript
// Key check - wait for vx:google-maps.js classes
function isVoxelMapsReady() {
    return window.Voxel &&
           window.Voxel.Maps &&
           typeof window.Voxel.Maps.Map === 'function';
}
```

### 3. Enqueue Both Google Maps Scripts

**File:** `Block_Loader.php` lines 1018-1032

```php
// First, enqueue Voxel's Google Maps wrapper (defines Map, Marker, Autocomplete)
$vx_google_maps_registered = wp_script_is('vx:google-maps.js', 'registered');
if ($vx_google_maps_registered) {
    wp_enqueue_script('vx:google-maps.js');
}

// Then, enqueue the actual Google Maps API
$google_maps_registered = wp_script_is('google-maps', 'registered');
if ($google_maps_registered) {
    wp_enqueue_script('google-maps');
}
```

### 4. Preserve Voxel_Config Handle

Removed the incorrect fix that changed `Voxel_Config.google_maps.handle` from `vx:google-maps.js-js` to `google-maps-js`. The original handle is needed for `Voxel.Maps.await()` to work correctly.

---

## Script Loading Order (After Fix)

1. **admin_head priority 1:** Stub script output directly in `<head>`
   - Defines `window.Voxel.Maps.GoogleMaps` callback stub
   - Sets up monitoring interval

2. **Script queue:** WordPress outputs enqueued scripts
   - `vx:commons.js` - Defines Voxel.Maps base object
   - `vx:google-maps.js` - Defines Map, Marker, Autocomplete classes
   - `google-maps` - Google Maps API with callback

3. **Google Maps loads:** Calls `Voxel.Maps.GoogleMaps()` callback
   - Stub receives the call
   - Checks if `Voxel.Maps.Map` exists
   - If not, polls every 50ms until ready
   - When ready, dispatches `maps:loaded` event

4. **MapPicker component:** Listens for `maps:loaded` via `Voxel.Maps.await()`
   - Creates map instance using `Voxel.Maps.Map`
   - Adds `ts-map-loaded` class
   - Map renders correctly

---

## Console Output (Success)

```
[Voxel FSE] GoogleMaps callback stub defined in admin_head
[Voxel FSE] GoogleMaps callback stub called
[Voxel FSE] Waiting for vx:google-maps.js to load...
[Voxel FSE] vx:google-maps.js now ready (wait #5), dispatching maps:loaded
[Voxel FSE] maps:loaded event dispatched
[MapPicker] Voxel.Maps.await callback fired!
```

---

## Files Changed

### Block_Loader.php

| Lines | Change |
|-------|--------|
| 75-78 | Added `admin_head` hook for stub injection |
| 767-886 | New method `inject_google_maps_stub_in_head()` |
| 888-901 | Deprecated `register_early_google_maps_stub()` |
| 957-959 | Removed Voxel_Config handle modification |
| 1011-1032 | Added `vx:google-maps.js` enqueue |

---

## Key Learnings

### 1. Google Maps `loading=async` Behavior

Google Maps with `loading=async` can execute its callback **immediately** after download, regardless of script queue order. The callback must be defined **synchronously in the `<head>`** before any scripts load.

### 2. Voxel's Two-Script Architecture

Voxel separates Google Maps into two scripts:
- `google-maps` - The actual Google Maps API
- `vx:google-maps.js` - Voxel's wrapper classes (Map, Marker, Autocomplete)

Both must be loaded for maps to work. The wrapper classes must be available before `maps:loaded` is dispatched.

### 3. admin_head vs wp_add_inline_script

`wp_add_inline_script` outputs inline script when WordPress prints the script queue, which may be **after** async scripts have already executed. For callbacks that must exist before async scripts, use `admin_head` or `wp_head` at low priority.

### 4. Voxel.Maps.await() Mechanism

`Voxel.Maps.await()` is Voxel's mechanism for waiting until maps are ready. It:
- Checks `Voxel_Config.google_maps.handle` script element exists
- Checks `Voxel.Maps.Loaded === true`
- Listens for `maps:loaded` custom event

---

## Related Files

- `app/blocks/src/create-post/components/popup-kit/MapPicker.tsx` - React component using maps
- `app/blocks/src/create-post/components/fields/LocationField.tsx` - Location field with map toggle
- `themes/voxel/app/modules/google-maps/google-maps.php` - Voxel's maps module
- `themes/voxel/app/controllers/assets-controller.php` - Script registration (lines 139-147)
- `themes/voxel/app/config/assets.config.php` - Script dependencies (line 71-72)

---

## Testing Checklist

- [x] Google Map renders in Gutenberg block editor
- [x] `ts-map-loaded` class added to map container
- [x] No console errors about `GoogleMaps is not a function`
- [x] `Voxel.Maps.Autocomplete` available for address autocomplete
- [x] Works on page refresh (not cached state)
- [ ] Google Maps billing enabled (separate configuration)

---

## Note: Billing Error

After fix, you may see `BillingNotEnabledMapError`. This is **not a code issue** - it means:
1. The map IS initializing correctly (code working)
2. Google Cloud billing needs to be enabled for the API key
3. Fix in Google Cloud Console, not in code

---

**Last Updated:** December 2, 2025
**Author:** Claude Code
**Status:** Complete
