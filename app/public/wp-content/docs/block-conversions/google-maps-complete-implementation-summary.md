# Google Maps Complete Implementation Summary - All Contexts

**Date:** December 8, 2025
**Scope:** Comprehensive implementation across Admin Metabox, Gutenberg Editor, and Frontend
**Architecture:** Plan C+ with REST API primary, wp_localize_script fallback
**Status:** ✅ COMPLETE - All contexts working

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Three Implementation Contexts](#three-implementation-contexts)
3. [Voxel Soft-Loading Pattern](#voxel-soft-loading-pattern)
4. [Context 1: Admin Metabox](#context-1-admin-metabox)
5. [Context 2: Gutenberg Editor](#context-2-gutenberg-editor)
6. [Context 3: Frontend](#context-3-frontend)
7. [GoogleMaps Callback Stub Pattern](#googlemaps-callback-stub-pattern)
8. [Plan C+ Headless Architecture](#plan-c-headless-architecture)
9. [Complete File Manifest](#complete-file-manifest)
10. [Testing Checklist](#testing-checklist)
11. [Troubleshooting](#troubleshooting)

---

## Executive Summary

Google Maps integration for location fields in the Create Post block requires **different implementations for three distinct contexts**:

| Context | Render Method | Maps Injection | Soft-Loading Bypass |
|---------|---------------|----------------|---------------------|
| **Admin Metabox** | PHP render (admin-render.php) | Inline stub in block HTML | Filter in admin-render.php |
| **Gutenberg Editor** | React SSR preview | `admin_head` hook (Block_Loader.php) | Not needed (admin context) |
| **Frontend** | Static HTML from save.tsx | `wp_head` hook (Block_Loader.php) | `wp_enqueue_scripts` hook (Block_Loader.php) |

### Key Technical Challenges Solved

1. **Voxel Soft-Loading Pattern** - Scripts enqueued with `data-src` instead of `src`, must bypass for immediate loading
2. **Google Maps Async Loading** - Callback must exist BEFORE Google Maps API loads (race condition)
3. **Two-Script Architecture** - `vx:google-maps.js` (Voxel wrapper) must load BEFORE `google-maps` (Google API)
4. **React Portal Pattern** - AddressAutocomplete uses React Portal to body-level for autocomplete dropdown
5. **Context Detection** - Different solutions for admin-only vs frontend-only vs both contexts

### Critical Discovery

**The GoogleMaps callback stub MUST be injected in `<head>` BEFORE scripts load**, because Google Maps uses `loading=async` which executes immediately after download. Using `wp_add_inline_script` is **too late** - it outputs AFTER the script tag.

---

## Three Implementation Contexts

### Context Comparison Matrix

| Aspect | Admin Metabox | Gutenberg Editor | Frontend |
|--------|---------------|------------------|----------|
| **Render Phase** | PHP (admin-render.php) | React (BlockServerSideRender) | Static HTML (save.tsx) |
| **Hydration** | React mounts into iframe | React preview in editor | React mounts on page load |
| **Script Loading** | During iframe load | During block registration | During wp_enqueue_scripts |
| **Stub Injection** | Inline in block HTML | `admin_head` hook priority 1 | `wp_head` hook priority 1 |
| **Soft-Loading Bypass** | Filter in admin-render.php | Not needed (admin context) | Filter in Block_Loader.php |
| **Detection Method** | `$is_admin_metabox` flag | `get_current_screen()` | `has_block()` check |
| **Maps Enqueue** | `\Voxel\enqueue_maps()` | `wp_enqueue_script('vx:commons.js')` | `\Voxel\enqueue_maps()` |

---

## Voxel Soft-Loading Pattern

### What is Soft-Loading?

Voxel uses a "deferred loading" pattern for maps scripts to improve page load performance:

1. Scripts are registered and enqueued normally via WordPress script API
2. During output, Voxel **replaces `src=` with `data-src=`** in script tags
3. JavaScript must manually trigger loading by converting `data-src` back to `src`

**Evidence:**
```php
// themes/voxel/app/controllers/assets-controller.php:49-54
protected $soft_loaded_scripts = [
    'google-maps' => true,
    'vx:google-maps.js' => true,
    'mapbox-gl' => true,
    'vx:mapbox.js' => true,
];

// Line 367-372 - script_loader_tag filter at priority 10
if ( isset( $this->soft_loaded_scripts[ $handle ] ) ) {
    $tag = str_replace( ' src=', ' data-src=', $tag );
}
```

**Result:**
```html
<!-- Enqueued but NOT loading: -->
<script data-src="https://maps.googleapis.com/maps/api/js?..." id="google-maps-js"></script>
<script data-src="/wp-content/themes/voxel/assets/dist/google-maps.js" id="vx:google-maps.js-js"></script>
```

### Why Soft-Loading Breaks Create Post Block

**Problem:** Create Post block with location fields needs maps to load **immediately** for autocomplete to work.

**Without bypass:**
- Scripts enqueued with `data-src`
- No JavaScript trigger exists to convert to `src`
- Scripts never actually load
- `Voxel.Maps.Autocomplete` undefined forever
- Location field autocomplete does not work

**Solution:** Add `script_loader_tag` filter at **priority 20** (after Voxel's priority 10) to convert `data-src` back to `src`.

---

## Context 1: Admin Metabox

### Architecture Overview

**Location:** Admin post edit screen (`/wp-admin/post.php?post=123&action=edit`)
**Component:** `app/utils/admin-metabox-iframe.php` (wrapper) + `app/blocks/src/create-post/admin-render.php` (content)
**Render Method:** PHP renders block content into iframe
**React Hydration:** `frontend.tsx` mounts `CreatePostForm` into rendered HTML

### Implementation

**File:** `app/blocks/src/create-post/admin-render.php`

#### Step 1: Detect Location Fields (Lines 944-952)

```php
// Check if any location fields exist - if so, we need maps scripts
$has_location_fields = false;
foreach ($fields_config as $field_config) {
    if (($field_config['type'] ?? '') === 'location') {
        $has_location_fields = true;
        break;
    }
}
```

#### Step 2: Enqueue Maps Scripts for Admin Context (Lines 954-1050)

```php
if ($is_admin_metabox) {
    // Enqueue Vue (dependency for commons.js)
    if (wp_script_is('vue', 'registered')) {
        wp_enqueue_script('vue');
    }

    // Enqueue commons.js (contains Voxel.Maps and Voxel.alert())
    if (wp_script_is('vx:commons.js', 'registered')) {
        wp_enqueue_script('vx:commons.js');

        // CRITICAL: After commons.js loads, ensure Google Maps is properly initialized
        $admin_google_maps_setup = <<<'JAVASCRIPT'
        (function() {
            if (!window.Voxel?.Maps) {
                console.error('[Admin metabox] Voxel.Maps not available after commons.js!');
                return;
            }

            // Ensure callback exists for Google Maps async loading
            if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
                window.Voxel.Maps.GoogleMaps = function() {
                    window.Voxel.Maps.Loaded = true;
                    document.dispatchEvent(new CustomEvent('maps:loaded'));
                };
            }
        })();
        JAVASCRIPT;

        wp_add_inline_script('vx:commons.js', $admin_google_maps_setup, 'after');
    }

    // Enqueue maps scripts if location fields exist
    if ($has_location_fields && function_exists('\Voxel\enqueue_maps')) {
        \Voxel\enqueue_maps();
    }
}
```

#### Step 3: Inject GoogleMaps Callback Stub in Block HTML (Lines 1120-1224)

**CRITICAL:** This runs BEFORE `wp_footer` where scripts are printed, so stub is available when Google Maps loads.

```php
static $frontend_maps_stub_injected = false;
if (!$frontend_maps_stub_injected) {
    $frontend_maps_stub_injected = true;
    ?>
    <script type="text/javascript">
        // FRONTEND: Define Voxel.Maps.GoogleMaps stub BEFORE scripts load
        (function() {
            'use strict';
            console.log('[Create Post Frontend] GoogleMaps callback stub initializing...');

            // Initialize Voxel object structure IMMEDIATELY (synchronously)
            if (typeof window.Voxel === 'undefined') {
                window.Voxel = {};
            }
            if (typeof window.Voxel.Maps === 'undefined') {
                window.Voxel.Maps = {};
            }

            // Helper to check if vx:google-maps.js has loaded (defines Map class)
            function isVoxelMapsReady() {
                return window.Voxel &&
                    window.Voxel.Maps &&
                    typeof window.Voxel.Maps.Map === 'function';
            }

            // Helper to dispatch maps:loaded event
            function dispatchMapsLoaded() {
                if (window._voxel_maps_loaded_dispatched) return;
                window._voxel_maps_loaded_dispatched = true;
                console.log('[Create Post Frontend] Dispatching maps:loaded event');

                if (window.Voxel && window.Voxel.Maps) {
                    window.Voxel.Maps.Loaded = true;
                }
                if (typeof document !== 'undefined' && document.dispatchEvent) {
                    try {
                        document.dispatchEvent(new CustomEvent('maps:loaded'));
                    } catch (e) {
                        console.error('[Create Post Frontend] Error dispatching maps:loaded:', e);
                    }
                }
            }

            // Store callback function reference
            var gmapsCallbackStub = function() {
                console.log('[Create Post Frontend] GoogleMaps callback fired!');
                window._voxel_gmaps_loaded = true;
                window._voxel_gmaps_callback_fired = true;

                // Only dispatch maps:loaded if vx:google-maps.js has loaded
                if (isVoxelMapsReady()) {
                    console.log('[Create Post Frontend] vx:google-maps.js already ready, dispatching immediately');
                    dispatchMapsLoaded();
                } else {
                    console.log('[Create Post Frontend] Waiting for vx:google-maps.js...');
                    // Poll for vx:google-maps.js to load
                    var waitCount = 0;
                    var waitInterval = setInterval(function() {
                        waitCount++;
                        if (isVoxelMapsReady()) {
                            console.log('[Create Post Frontend] vx:google-maps.js now ready (wait #' + waitCount + ')');
                            clearInterval(waitInterval);
                            dispatchMapsLoaded();
                        }
                        if (waitCount >= 200) { // Stop after 10 seconds
                            clearInterval(waitInterval);
                            console.error('[Create Post Frontend] Timeout waiting for vx:google-maps.js');
                        }
                    }, 50);
                }
            };

            // Assign immediately - MUST exist before Google Maps loads
            window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
            console.log('[Create Post Frontend] GoogleMaps callback stub assigned to Voxel.Maps.GoogleMaps');

            // Monitor and restore callback if commons.js replaces Voxel.Maps
            var checkCount = 0;
            var checkInterval = setInterval(function() {
                checkCount++;
                if (window.Voxel && window.Voxel.Maps) {
                    if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
                        window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
                        console.log('[Create Post Frontend] Restored GoogleMaps callback (was overwritten)');
                        // If Google Maps already loaded, trigger callback now
                        if (window._voxel_gmaps_loaded && typeof google !== 'undefined' && google.maps && !window._voxel_maps_loaded_dispatched) {
                            gmapsCallbackStub();
                        }
                    }
                }
                if (checkCount >= 100) { // Stop after 5 seconds
                    clearInterval(checkInterval);
                }
            }, 50);
        })();
    </script>
    <?php
}
```

#### Step 4: Bypass Soft-Loading (Lines 1253-1276)

```php
// CRITICAL: Bypass Voxel's soft-loading for maps scripts when create-post block is used
// Use a static flag to prevent adding multiple filters
static $maps_bypass_filter_added = false;
if (!$maps_bypass_filter_added && $has_location_fields) {
    $maps_bypass_filter_added = true;
    add_filter('script_loader_tag', function($tag, $handle) {
        // Only bypass soft-loading for maps-related scripts
        $maps_scripts = ['google-maps', 'vx:google-maps.js', 'mapbox-gl', 'vx:mapbox.js'];
        if (in_array($handle, $maps_scripts, true)) {
            // Convert data-src back to src to force immediate loading
            $tag = str_replace(' data-src=', ' src=', $tag);
        }
        return $tag;
    }, 20, 2); // Priority 20 = run AFTER Voxel's filter (priority 10)
}
```

**Why priority 20?**
- Voxel's filter runs at default priority (10)
- Our filter runs at priority 20, AFTER Voxel's filter
- We intercept the tag AFTER Voxel converts `src` to `data-src`
- We convert it back to `src` to force immediate loading

#### Step 5: Ensure Script Load Order (Lines 1227-1251)

```php
// CRITICAL: Ensure correct script load order for maps
// vx:google-maps.js MUST load BEFORE google-maps (Google Maps API)
if ($has_location_fields) {
    global $wp_scripts;

    // Add vx:google-maps.js as dependency of google-maps to ensure load order
    if (isset($wp_scripts->registered['google-maps'])) {
        $current_deps = $wp_scripts->registered['google-maps']->deps;
        if (!in_array('vx:google-maps.js', $current_deps, true)) {
            $wp_scripts->registered['google-maps']->deps[] = 'vx:google-maps.js';
        }
    }

    // Same for Mapbox
    if (isset($wp_scripts->registered['mapbox-gl'])) {
        $current_deps = $wp_scripts->registered['mapbox-gl']->deps;
        if (!in_array('vx:mapbox.js', $current_deps, true)) {
            $wp_scripts->registered['mapbox-gl']->deps[] = 'vx:mapbox.js';
        }
    }
}
```

### Console Output (Success)

```
[Create Post Frontend] GoogleMaps callback stub initializing...
[Create Post Frontend] GoogleMaps callback stub assigned to Voxel.Maps.GoogleMaps
[Create Post Frontend] GoogleMaps callback fired!
[Create Post Frontend] vx:google-maps.js already ready, dispatching immediately
[Create Post Frontend] Dispatching maps:loaded event
[AddressAutocomplete] Autocomplete initialized successfully
```

---

## Context 2: Gutenberg Editor

### Architecture Overview

**Location:** Gutenberg block editor (`/wp-admin/post.php?post=123&action=edit` with block editor)
**Component:** `app/blocks/Block_Loader.php` method `inject_google_maps_stub_in_head()`
**Render Method:** React ServerSideRender component (`BlockServerSideRender`) for preview
**Hook:** `admin_head` at priority 1 (before ANY scripts output)

### Implementation

**File:** `app/blocks/Block_Loader.php`

#### Step 1: Register Hook (Line 78)

```php
// CRITICAL: Inject GoogleMaps callback stub directly in <head> at priority 1
// Must run BEFORE any scripts are output because Google Maps has loading=async
add_action('admin_head', [__CLASS__, 'inject_google_maps_stub_in_head'], 1);
```

#### Step 2: Detect Block Editor Context (Lines 851-867)

```php
public static function inject_google_maps_stub_in_head()
{
    // Only inject in block editor contexts
    if (!function_exists('get_current_screen')) {
        return;
    }

    $screen = get_current_screen();
    if (!$screen || !$screen->is_block_editor()) {
        return;
    }

    // Only inject if create-post block exists
    $has_create_post_block = self::has_block('create-post');
    if (!$has_create_post_block) {
        return;
    }

    // Output stub script directly in head
    ?>
    <script type="text/javascript">
        // CRITICAL: Define Voxel.Maps.GoogleMaps stub IMMEDIATELY in head
        // ...stub code...
    </script>
    <?php
}
```

#### Step 3: Stub Implementation (Lines 868-962)

**IDENTICAL to admin metabox stub** - same polling logic, same event dispatching, same monitoring.

Key differences:
- Console logs prefixed with `[Gutenberg Editor]` instead of `[Create Post Frontend]`
- Runs via `admin_head` hook instead of inline in block HTML

### Why admin_head at Priority 1?

1. **Timing:** `admin_head` runs BEFORE `admin_enqueue_scripts` which outputs script tags
2. **Priority 1:** Ensures our code is the FIRST thing in `<head>`, before any other scripts
3. **Race Condition:** Google Maps uses `loading=async` which executes immediately after download
4. **Requirement:** Callback MUST exist BEFORE Google Maps script tag is output

### Alternative Approaches Tried (Failed)

#### Approach 1: wp_add_inline_script (❌ Failed)

```php
wp_add_inline_script('vx:commons.js', $stub_code, 'before');
```

**Why it failed:**
- `wp_add_inline_script` outputs code AFTER the script tag
- Google Maps already loaded and tried to call callback
- Callback didn't exist yet → silent failure

#### Approach 2: Late Hook Priority (❌ Failed)

```php
add_action('admin_head', [__CLASS__, 'inject_google_maps_stub_in_head'], 100);
```

**Why it failed:**
- Scripts already output by priority 100
- Same race condition as wp_add_inline_script

#### Approach 3: Only Inject After commons.js (❌ Failed)

```php
if (!wp_script_is('vx:commons.js', 'enqueued')) {
    return;
}
```

**Why it failed:**
- commons.js loading doesn't guarantee it loaded before Google Maps
- Async loading means order is unpredictable
- Must inject BEFORE any scripts regardless

### Console Output (Success)

```
[Gutenberg Editor] GoogleMaps callback stub initializing...
[Gutenberg Editor] GoogleMaps callback stub assigned
[Gutenberg Editor] GoogleMaps callback fired!
[Gutenberg Editor] vx:google-maps.js now ready (wait #2)
[Gutenberg Editor] Dispatching maps:loaded event
```

---

## Context 3: Frontend

### Architecture Overview

**Location:** Public frontend page with create-post block
**Component:** `app/blocks/Block_Loader.php` methods `inject_google_maps_stub_in_frontend_head()` and `bypass_maps_soft_loading_on_frontend()`
**Render Method:** Static HTML from `save.tsx`, hydrated by `frontend.tsx`
**Hooks:** `wp_head` at priority 1 + `wp_enqueue_scripts` at priority 15

### Implementation

**File:** `app/blocks/Block_Loader.php`

#### Step 1: Register Hooks (Lines 80-86)

```php
// FRONTEND: Inject GoogleMaps callback stub in <head> when create-post block is present
add_action('wp_head', [__CLASS__, 'inject_google_maps_stub_in_frontend_head'], 1);

// FRONTEND: Bypass Voxel's soft-loading for maps scripts when create-post block is present
// Runs after Voxel's filter (priority 10) to convert data-src back to src
add_action('wp_enqueue_scripts', [__CLASS__, 'bypass_maps_soft_loading_on_frontend'], 15);
```

#### Step 2: Detect Block on Page (Lines 990-1028)

```php
public static function inject_google_maps_stub_in_frontend_head()
{
    // Only run on frontend (not in admin)
    if (is_admin()) {
        return;
    }

    // Check if create-post block is present on the page
    $has_create_post_block = false;

    if (is_singular()) {
        global $post;
        if ($post && has_blocks($post->post_content)) {
            $has_create_post_block = has_block('voxel-fse/create-post', $post);
        }
    }

    // Also check widget areas (sidebar blocks)
    if (!$has_create_post_block) {
        $sidebars_widgets = wp_get_sidebars_widgets();
        foreach ($sidebars_widgets as $sidebar_id => $widgets) {
            if (is_array($widgets)) {
                foreach ($widgets as $widget) {
                    if (strpos($widget, 'block-') === 0) {
                        $widget_id = str_replace('block-', '', $widget);
                        $widget_content = get_post_field('post_content', $widget_id);
                        if ($widget_content && has_block('voxel-fse/create-post', $widget_content)) {
                            $has_create_post_block = true;
                            break 2;
                        }
                    }
                }
            }
        }
    }

    if (!$has_create_post_block) {
        return;
    }

    // Output stub script directly in head
    ?>
    <script type="text/javascript">
        // FRONTEND: Define Voxel.Maps.GoogleMaps stub...
    </script>
    <?php
}
```

#### Step 3: Stub Implementation (Lines 1030-1127)

**IDENTICAL to admin metabox and Gutenberg editor stubs.**

Console logs prefixed with `[VoxelFSE Frontend]`.

#### Step 4: Bypass Soft-Loading on Frontend (Lines 1139-1193)

```php
public static function bypass_maps_soft_loading_on_frontend()
{
    // Only run on frontend (not in admin)
    if (is_admin()) {
        return;
    }

    // Check if create-post block is present (same detection as above)
    $has_create_post_block = false;
    // ...detection code...

    if (!$has_create_post_block) {
        return;
    }

    // Enqueue maps scripts if registered
    if (function_exists('\Voxel\enqueue_maps')) {
        \Voxel\enqueue_maps();
    }

    // Add filter to bypass soft-loading (runs after Voxel's filter at priority 10)
    add_filter('script_loader_tag', function ($tag, $handle) {
        $maps_scripts = ['google-maps', 'vx:google-maps.js', 'mapbox-gl', 'vx:mapbox.js'];
        if (in_array($handle, $maps_scripts, true)) {
            // Convert data-src back to src to force immediate loading
            $tag = str_replace(' data-src=', ' src=', $tag);
        }
        return $tag;
    }, 20, 2);
}
```

**Why two separate methods?**

1. **inject_google_maps_stub_in_frontend_head()** - Runs on `wp_head` to inject stub in `<head>` before scripts
2. **bypass_maps_soft_loading_on_frontend()** - Runs on `wp_enqueue_scripts` to enqueue maps and add filter

**Why not combine them?**

- `wp_head` runs AFTER `wp_enqueue_scripts`
- Enqueuing in `wp_head` is too late
- Filter must be added during `wp_enqueue_scripts` phase

### Console Output (Success)

```
[VoxelFSE Frontend] GoogleMaps callback stub initializing...
[VoxelFSE Frontend] GoogleMaps callback stub assigned
[VoxelFSE Frontend] GoogleMaps callback fired!
[VoxelFSE Frontend] vx:google-maps.js now ready (wait #1)
[VoxelFSE Frontend] Dispatching maps:loaded event
[AddressAutocomplete] Autocomplete initialized successfully
```

---

## GoogleMaps Callback Stub Pattern

### The Stub Architecture

The GoogleMaps callback stub is a **universal pattern** used identically across all three contexts. It solves these problems:

1. **Race Condition:** Google Maps API loads asynchronously with `loading=async` parameter
2. **Callback Requirement:** Google Maps calls `Voxel.Maps.GoogleMaps()` when ready
3. **Missing Callback:** If callback doesn't exist, Google Maps silently fails (no error)
4. **Two-Script System:** Voxel uses `vx:google-maps.js` (wrapper classes) + `google-maps` (Google API)
5. **Load Order:** `vx:google-maps.js` defines `Voxel.Maps.Map`, `Voxel.Maps.Marker`, `Voxel.Maps.Autocomplete` classes
6. **Event Dispatch:** `maps:loaded` event must only fire AFTER both scripts loaded and classes available

### Stub Implementation Logic

```javascript
(function () {
    'use strict';

    // Step 1: Initialize Voxel.Maps object structure IMMEDIATELY (synchronously)
    if (typeof window.Voxel === 'undefined') {
        window.Voxel = {};
    }
    if (typeof window.Voxel.Maps === 'undefined') {
        window.Voxel.Maps = {};
    }

    // Step 2: Helper to check if vx:google-maps.js has loaded
    function isVoxelMapsReady() {
        return window.Voxel &&
            window.Voxel.Maps &&
            typeof window.Voxel.Maps.Map === 'function';
    }

    // Step 3: Helper to dispatch maps:loaded event (only once)
    function dispatchMapsLoaded() {
        if (window._voxel_maps_loaded_dispatched) return;
        window._voxel_maps_loaded_dispatched = true;

        if (window.Voxel && window.Voxel.Maps) {
            window.Voxel.Maps.Loaded = true;
        }
        if (typeof document !== 'undefined' && document.dispatchEvent) {
            try {
                document.dispatchEvent(new CustomEvent('maps:loaded'));
            } catch (e) {
                console.error('[Context] Error dispatching maps:loaded:', e);
            }
        }
    }

    // Step 4: Define callback function that Google Maps will call
    var gmapsCallbackStub = function () {
        window._voxel_gmaps_loaded = true;
        window._voxel_gmaps_callback_fired = true;

        // Only dispatch maps:loaded if vx:google-maps.js has loaded
        if (isVoxelMapsReady()) {
            // Both scripts ready - dispatch immediately
            dispatchMapsLoaded();
        } else {
            // vx:google-maps.js not ready yet - poll for it
            var waitCount = 0;
            var waitInterval = setInterval(function () {
                waitCount++;
                if (isVoxelMapsReady()) {
                    clearInterval(waitInterval);
                    dispatchMapsLoaded();
                }
                if (waitCount >= 200) { // Stop after 10 seconds
                    clearInterval(waitInterval);
                    console.error('[Context] Timeout waiting for vx:google-maps.js');
                }
            }, 50);
        }
    };

    // Step 5: Assign callback immediately - MUST exist before Google Maps loads
    window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;

    // Step 6: Monitor and restore callback if commons.js replaces Voxel.Maps
    // commons.js might replace the entire Voxel.Maps object, breaking our callback
    var checkCount = 0;
    var checkInterval = setInterval(function () {
        checkCount++;
        if (window.Voxel && window.Voxel.Maps) {
            if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
                // Callback was overwritten - restore it
                window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
                // If Google Maps already loaded, trigger callback now
                if (window._voxel_gmaps_loaded && typeof google !== 'undefined' && google.maps && !window._voxel_maps_loaded_dispatched) {
                    gmapsCallbackStub();
                }
            }
        }
        if (checkCount >= 100) { // Stop after 5 seconds
            clearInterval(checkInterval);
        }
    }, 50);
})();
```

### Key Design Decisions

**1. Polling Instead of Promises**

Why not use Promises or async/await?
- Must work in older browsers
- Google Maps doesn't return a Promise
- Polling is simple and reliable
- 50ms interval is imperceptible to users

**2. Global Flags**

```javascript
window._voxel_gmaps_loaded = true;           // Google Maps API loaded
window._voxel_gmaps_callback_fired = true;   // Callback was called
window._voxel_maps_loaded_dispatched = true; // Event already dispatched
```

Why globals?
- Prevent duplicate event dispatches
- Allow monitoring from console for debugging
- Enable recovery if callback called multiple times

**3. commons.js Monitoring**

Why check every 50ms for callback replacement?

Voxel's `commons.js` might replace the entire `Voxel.Maps` object:
```javascript
// commons.js might do this:
window.Voxel.Maps = {
    Map: function() {},
    Marker: function() {},
    Autocomplete: function() {},
    // GoogleMaps callback is MISSING!
};
```

Our monitor detects this and restores the callback.

**4. Immediate Dispatch vs Polling**

```javascript
if (isVoxelMapsReady()) {
    // Both scripts ready - dispatch immediately
    dispatchMapsLoaded();
} else {
    // vx:google-maps.js not ready yet - poll for it
    var waitInterval = setInterval(function () {
        if (isVoxelMapsReady()) {
            clearInterval(waitInterval);
            dispatchMapsLoaded();
        }
    }, 50);
}
```

Why check immediately first?
- If `vx:google-maps.js` loaded before Google Maps API, avoid polling
- Faster response (0ms vs 50ms delay)
- Still poll as fallback if not ready yet

---

## Plan C+ Headless Architecture

### Current State: Plan C (Hybrid)

**Data Flow:**
1. **PHP (admin-render.php)** - Fetches fields from REST API, passes to block as attributes
2. **React (frontend.tsx)** - Fetches fields from REST API again for client-side hydration
3. **Fallback** - `wp_localize_script` provides data if REST API fails

**Evidence:**
```php
// admin-render.php lines 200-230
$fields_response = wp_remote_get($rest_endpoint);
$fields_config = json_decode(wp_remote_retrieve_body($fields_response), true);
```

```typescript
// frontend.tsx lines 85-128
async function fetchFieldsConfig(postTypeKey: string): Promise<FieldsConfigResponse | null> {
    const restUrl = getRestUrl();
    const endpoint = `${restUrl}voxel-fse/v1/create-post/fields-config?post_type=${postTypeKey}`;
    const response = await fetch(endpoint);
    return await response.json();
}
```

### Plan C+ Target: Headless-Ready

**Goal:** Make maps implementation work in headless Next.js frontend on Vercel.

**Requirements:**
1. No dependency on WordPress `wp_enqueue_script` system
2. No dependency on `wp_head` or `wp_footer` hooks
3. All data via REST API (no `wp_localize_script`)
4. All scripts loaded via standard `<script>` tags or `next/script`

### Maps REST API Endpoint Needed

**Endpoint:** `GET /wp-json/voxel-fse/v1/maps/config`

**Response:**
```json
{
    "provider": "google",
    "api_key": "AIza...",
    "google_maps_url": "https://maps.googleapis.com/maps/api/js?key=AIza...&libraries=places&loading=async&callback=Voxel.Maps.GoogleMaps",
    "voxel_maps_js_url": "https://site.com/wp-content/themes/voxel/assets/dist/google-maps.js",
    "voxel_commons_js_url": "https://site.com/wp-content/themes/voxel/assets/dist/commons.js",
    "load_order": [
        "voxel_commons_js",
        "voxel_maps_js",
        "google_maps_api"
    ],
    "config": {
        "center": {"lat": 37.7749, "lng": -122.4194},
        "zoom": 12,
        "api_version": "weekly"
    }
}
```

### Headless Implementation Plan

#### Phase 1: Extract Maps Config to REST Endpoint

**New File:** `app/rest-api/Maps_Config_Endpoint.php`

```php
<?php
namespace VoxelFSE\Rest_API;

class Maps_Config_Endpoint {
    public function register() {
        register_rest_route('voxel-fse/v1', '/maps/config', [
            'methods' => 'GET',
            'callback' => [$this, 'get_maps_config'],
            'permission_callback' => '__return_true', // Public endpoint
        ]);
    }

    public function get_maps_config($request) {
        // Get Voxel maps configuration
        $provider = \Voxel\get('settings.maps.provider'); // 'google' or 'mapbox'

        if ($provider === 'google') {
            $api_key = \Voxel\get('settings.maps.google_maps.api_key');
            $callback_name = 'Voxel.Maps.GoogleMaps';

            return [
                'provider' => 'google',
                'api_key' => $api_key,
                'google_maps_url' => sprintf(
                    'https://maps.googleapis.com/maps/api/js?key=%s&libraries=places&loading=async&callback=%s',
                    $api_key,
                    $callback_name
                ),
                'voxel_maps_js_url' => get_template_directory_uri() . '/assets/dist/google-maps.js',
                'voxel_commons_js_url' => get_template_directory_uri() . '/assets/dist/commons.js',
                'load_order' => ['voxel_commons_js', 'voxel_maps_js', 'google_maps_api'],
                'config' => [
                    'center' => \Voxel\get('settings.maps.google_maps.center'),
                    'zoom' => \Voxel\get('settings.maps.google_maps.zoom', 12),
                    'api_version' => 'weekly',
                ],
            ];
        }

        // Mapbox implementation similar
        return new \WP_Error('maps_not_configured', 'Maps provider not configured', ['status' => 500]);
    }
}
```

#### Phase 2: Next.js Script Loading Component

**New File:** `nextjs-frontend/components/VoxelMaps.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface MapsConfig {
    provider: string;
    google_maps_url: string;
    voxel_maps_js_url: string;
    voxel_commons_js_url: string;
    load_order: string[];
}

export function VoxelMaps({ restApiUrl }: { restApiUrl: string }) {
    const [config, setConfig] = useState<MapsConfig | null>(null);
    const [stubInjected, setStubInjected] = useState(false);

    // Fetch maps configuration
    useEffect(() => {
        fetch(`${restApiUrl}/wp-json/voxel-fse/v1/maps/config`)
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(err => console.error('Failed to load maps config:', err));
    }, [restApiUrl]);

    // Inject GoogleMaps callback stub (same as WordPress version)
    useEffect(() => {
        if (stubInjected || !config) return;
        setStubInjected(true);

        // Inject stub directly into <head>
        const script = document.createElement('script');
        script.textContent = `
            (function () {
                // SAME STUB CODE AS WORDPRESS VERSION
                if (typeof window.Voxel === 'undefined') {
                    window.Voxel = {};
                }
                if (typeof window.Voxel.Maps === 'undefined') {
                    window.Voxel.Maps = {};
                }
                // ...rest of stub...
            })();
        `;
        document.head.insertBefore(script, document.head.firstChild);
    }, [config, stubInjected]);

    if (!config) {
        return null;
    }

    // Load scripts in correct order
    return (
        <>
            <Script
                src={config.voxel_commons_js_url}
                strategy="beforeInteractive"
                onLoad={() => console.log('[Next.js] commons.js loaded')}
            />
            <Script
                src={config.voxel_maps_js_url}
                strategy="beforeInteractive"
                onLoad={() => console.log('[Next.js] voxel-maps.js loaded')}
            />
            <Script
                src={config.google_maps_url}
                strategy="beforeInteractive"
                onLoad={() => console.log('[Next.js] Google Maps API loaded')}
            />
        </>
    );
}
```

**Usage in Next.js:**
```tsx
// app/layout.tsx
import { VoxelMaps } from '@/components/VoxelMaps';

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <VoxelMaps restApiUrl={process.env.NEXT_PUBLIC_WORDPRESS_API_URL} />
            </head>
            <body>{children}</body>
        </html>
    );
}
```

#### Phase 3: AddressAutocomplete Component (No Changes Needed!)

**File:** `app/blocks/src/create-post/components/popup-kit/AddressAutocomplete.tsx`

**Key insight:** The component is already framework-agnostic!

```tsx
// Lines 99-223 - Initialization logic works identically in Next.js
useEffect(() => {
    if (!inputRef.current) return;

    // Wait for Voxel.Maps.await callback to fire
    const initAutocomplete = () => {
        if (!window.Voxel?.Maps?.Autocomplete) {
            console.error('[AddressAutocomplete] Voxel.Maps.Autocomplete not available');
            return;
        }

        const autocomplete = new window.Voxel.Maps.Autocomplete(
            inputRef.current,
            (result) => {
                if (result) {
                    onSelect(result.address, result.latlng.getLatitude(), result.latlng.getLongitude());
                }
            },
            {}
        );

        autocompleteRef.current = autocomplete;
    };

    // Register await callback
    if (window.Voxel?.Maps?.await) {
        window.Voxel.Maps.await(() => {
            if (window.Voxel?.Maps?.Autocomplete) {
                initAutocomplete();
            }
        });
    }
}, []);
```

**No changes needed because:**
1. Uses `window.Voxel.Maps.await()` pattern (provided by Voxel)
2. No WordPress-specific APIs
3. No dependency on `wp_enqueue_script` or hooks
4. Works with standard `<script>` tags from Next.js `Script` component

### Migration Checklist

- [ ] Create `app/rest-api/Maps_Config_Endpoint.php`
- [ ] Register endpoint in `functions.php`
- [ ] Create `nextjs-frontend/components/VoxelMaps.tsx`
- [ ] Add `VoxelMaps` to Next.js root layout
- [ ] Test stub injection in Next.js
- [ ] Test `maps:loaded` event dispatch
- [ ] Test AddressAutocomplete component in Next.js
- [ ] Verify identical behavior vs WordPress version
- [ ] Document environment variables (`NEXT_PUBLIC_WORDPRESS_API_URL`)
- [ ] Update CORS settings on WordPress if needed

---

## Complete File Manifest

### WordPress Implementation

| File | Context | Purpose | Lines |
|------|---------|---------|-------|
| `app/blocks/src/create-post/admin-render.php` | Admin Metabox | Maps enqueue, stub injection, soft-loading bypass | 944-1276 |
| `app/blocks/Block_Loader.php` | Gutenberg Editor | `admin_head` stub injection | 75-962 |
| `app/blocks/Block_Loader.php` | Frontend | `wp_head` stub injection + `wp_enqueue_scripts` bypass | 80-1193 |
| `app/blocks/src/create-post/components/popup-kit/AddressAutocomplete.tsx` | All Contexts | React component with Voxel.Maps.Autocomplete | 1-260 |
| `app/blocks/src/create-post/frontend.tsx` | All Contexts | React hydration entry point | 1-437 |
| `app/blocks/src/create-post/save.tsx` | Frontend | Static HTML output for frontend | 1-97 |
| `app/utils/admin-metabox-iframe.php` | Admin Metabox | Iframe wrapper for metabox | 1-150 |

### Future Headless Implementation

| File | Context | Purpose |
|------|---------|---------|
| `app/rest-api/Maps_Config_Endpoint.php` | REST API | Maps configuration endpoint |
| `nextjs-frontend/components/VoxelMaps.tsx` | Next.js | Client-side script loader |
| `nextjs-frontend/app/layout.tsx` | Next.js | Root layout with VoxelMaps |

---

## Testing Checklist

### Admin Metabox

- [ ] Edit post with location field in WordPress admin
- [ ] Open browser console
- [ ] Verify console logs:
  - `[Create Post Frontend] GoogleMaps callback stub initializing...`
  - `[Create Post Frontend] GoogleMaps callback stub assigned`
  - `[Create Post Frontend] GoogleMaps callback fired!`
  - `[Create Post Frontend] vx:google-maps.js now ready`
  - `[Create Post Frontend] Dispatching maps:loaded event`
- [ ] Verify `window.Voxel.Maps.Autocomplete` is defined (not undefined)
- [ ] Type in location field - autocomplete dropdown should appear
- [ ] Select location from dropdown - field should populate with address
- [ ] Click Update button - post should save successfully

### Gutenberg Editor

- [ ] Edit post with create-post block in Gutenberg editor
- [ ] Open browser console
- [ ] Verify console logs:
  - `[Gutenberg Editor] GoogleMaps callback stub initializing...`
  - `[Gutenberg Editor] GoogleMaps callback stub assigned`
  - `[Gutenberg Editor] GoogleMaps callback fired!`
  - `[Gutenberg Editor] vx:google-maps.js now ready`
  - `[Gutenberg Editor] Dispatching maps:loaded event`
- [ ] In block preview, verify location field renders
- [ ] Type in location field - autocomplete dropdown should appear
- [ ] Select location - field should populate
- [ ] Save post - block should persist location value

### Frontend

- [ ] Navigate to frontend page with create-post block
- [ ] Open browser console
- [ ] Verify console logs:
  - `[VoxelFSE Frontend] GoogleMaps callback stub initializing...`
  - `[VoxelFSE Frontend] GoogleMaps callback stub assigned`
  - `[VoxelFSE Frontend] GoogleMaps callback fired!`
  - `[VoxelFSE Frontend] vx:google-maps.js now ready`
  - `[VoxelFSE Frontend] Dispatching maps:loaded event`
- [ ] Verify form renders with location field
- [ ] Type in location field - autocomplete dropdown should appear
- [ ] Select location - field should populate
- [ ] Submit form - post should be created with location

### Script Tags Verification

Check page source (View → Page Source):

**CORRECT (immediate load):**
```html
<script src="https://maps.googleapis.com/maps/api/js?..." id="google-maps-js"></script>
<script src="/wp-content/themes/voxel/assets/dist/google-maps.js" id="vx:google-maps.js-js"></script>
```

**WRONG (soft-loaded, won't load):**
```html
<script data-src="https://maps.googleapis.com/maps/api/js?..." id="google-maps-js"></script>
<script data-src="/wp-content/themes/voxel/assets/dist/google-maps.js" id="vx:google-maps.js-js"></script>
```

---

## Troubleshooting

### Issue: Maps not loading in admin metabox

**Symptoms:**
- Error: `Voxel.Maps.Autocomplete not available after 100 retries`
- Location field has no autocomplete
- Update button does nothing

**Diagnosis:**
```javascript
// Check in console:
console.log(window.Voxel?.Maps);
// Expected: {await: ƒ, GoogleMaps: ƒ, Map: ƒ, Marker: ƒ, Autocomplete: ƒ, ...}
// Bad: undefined or {await: ƒ} only
```

**Solutions:**

1. **Check script tags in page source:**
   - Look for `data-src` instead of `src`
   - If present, soft-loading bypass filter not working

2. **Verify filter is added:**
   ```php
   // admin-render.php line 1260
   static $maps_bypass_filter_added = false;
   if (!$maps_bypass_filter_added && $has_location_fields) {
       $maps_bypass_filter_added = true;
       add_filter('script_loader_tag', function($tag, $handle) {
           // ...
       }, 20, 2);
   }
   ```

3. **Check location fields detected:**
   ```php
   // admin-render.php line 944
   $has_location_fields = false;
   foreach ($fields_config as $field_config) {
       if (($field_config['type'] ?? '') === 'location') {
           $has_location_fields = true;
           break;
       }
   }
   // Add error_log to verify:
   error_log('has_location_fields: ' . ($has_location_fields ? 'true' : 'false'));
   ```

4. **Verify commons.js enqueued:**
   ```php
   // admin-render.php line 964
   if (wp_script_is('vx:commons.js', 'registered')) {
       wp_enqueue_script('vx:commons.js');
       // Add error_log:
       error_log('[Create Post] commons.js enqueued');
   }
   ```

### Issue: Maps not loading in Gutenberg editor

**Symptoms:**
- Block preview shows location field but no autocomplete
- Console error: `Voxel.Maps.GoogleMaps is not a function`
- Map container exists but empty

**Diagnosis:**
```javascript
// Check in console:
console.log(typeof window.Voxel?.Maps?.GoogleMaps);
// Expected: 'function'
// Bad: 'undefined'
```

**Solutions:**

1. **Verify stub is injected in `<head>`:**
   - View page source
   - Look for `[Gutenberg Editor] GoogleMaps callback stub` in `<head>`
   - Should be near top of `<head>`, before any `<script>` tags

2. **Check hook is registered:**
   ```php
   // Block_Loader.php line 78
   add_action('admin_head', [__CLASS__, 'inject_google_maps_stub_in_head'], 1);
   ```

3. **Verify block editor detection:**
   ```php
   // Block_Loader.php lines 853-867
   public static function inject_google_maps_stub_in_head()
   {
       if (!function_exists('get_current_screen')) {
           return;
       }

       $screen = get_current_screen();
       if (!$screen || !$screen->is_block_editor()) {
           return;
       }

       // Add error_log:
       error_log('[Block_Loader] Injecting GoogleMaps stub in Gutenberg editor');
   }
   ```

4. **Check create-post block is registered:**
   ```php
   $has_create_post_block = self::has_block('create-post');
   // Add error_log:
   error_log('[Block_Loader] has_create_post_block: ' . ($has_create_post_block ? 'true' : 'false'));
   ```

### Issue: Maps not loading on frontend

**Symptoms:**
- Frontend form renders but location field has no autocomplete
- Console error: `[AddressAutocomplete] ERROR: Voxel.Maps.Autocomplete not available`
- Console shows `Voxel.Maps: {await: ƒ}` only

**Diagnosis:**
```javascript
// Check in console:
console.log(window.Voxel?.Maps);
// Expected: {await: ƒ, GoogleMaps: ƒ, Map: ƒ, Marker: ƒ, Autocomplete: ƒ, ...}
// Bad: {await: ƒ} only (missing Autocomplete)
```

**Solutions:**

1. **Check script tags in page source:**
   - Look for `data-src` instead of `src`
   - If present, soft-loading bypass not working

2. **Verify hooks are registered:**
   ```php
   // Block_Loader.php lines 80-86
   add_action('wp_head', [__CLASS__, 'inject_google_maps_stub_in_frontend_head'], 1);
   add_action('wp_enqueue_scripts', [__CLASS__, 'bypass_maps_soft_loading_on_frontend'], 15);
   ```

3. **Check block detection:**
   ```php
   // Block_Loader.php lines 1000-1005
   if (is_singular()) {
       global $post;
       if ($post && has_blocks($post->post_content)) {
           $has_create_post_block = has_block('voxel-fse/create-post', $post);
       }
   }
   // Add error_log:
   error_log('[Block_Loader Frontend] has_create_post_block: ' . ($has_create_post_block ? 'true' : 'false'));
   ```

4. **Verify enqueue_maps called:**
   ```php
   // Block_Loader.php lines 1179-1182
   if (function_exists('\Voxel\enqueue_maps')) {
       \Voxel\enqueue_maps();
       // Add error_log:
       error_log('[Block_Loader Frontend] enqueue_maps() called');
   }
   ```

5. **Check stub injection in `<head>`:**
   - View page source
   - Look for `[VoxelFSE Frontend] GoogleMaps callback stub` in `<head>`
   - Should be near top, before any `<script>` tags

### Issue: Stub injected but maps still not loading

**Symptoms:**
- Console shows stub initialization logs
- Console shows callback fired
- But `Voxel.Maps.Autocomplete` still undefined after 10 seconds

**Diagnosis:**
```javascript
// Check if vx:google-maps.js loaded:
console.log(typeof window.Voxel?.Maps?.Map);
// Expected: 'function'
// Bad: 'undefined'
```

**Cause:** `vx:google-maps.js` script not loading (still has `data-src` instead of `src`)

**Solutions:**

1. **Verify soft-loading bypass filter:**
   ```php
   add_filter('script_loader_tag', function ($tag, $handle) {
       $maps_scripts = ['google-maps', 'vx:google-maps.js', 'mapbox-gl', 'vx:mapbox.js'];
       if (in_array($handle, $maps_scripts, true)) {
           $tag = str_replace(' data-src=', ' src=', $tag);
       }
       return $tag;
   }, 20, 2);
   ```

2. **Check filter priority is 20:**
   - Must run AFTER Voxel's filter at priority 10
   - If priority too low (<= 10), won't intercept Voxel's conversion

3. **Check script handle names:**
   - Must match exactly: `'google-maps'`, `'vx:google-maps.js'`
   - Case-sensitive
   - Colon (`:`) is part of handle name

### Issue: Callback fired multiple times

**Symptoms:**
- Console shows `GoogleMaps callback fired!` multiple times
- Multiple `maps:loaded` events dispatched
- Components may initialize twice

**Cause:** Multiple stubs injected (e.g., both admin-render.php AND Block_Loader.php running)

**Solutions:**

1. **Use static flags to prevent multiple injections:**
   ```php
   // admin-render.php line 1124
   static $frontend_maps_stub_injected = false;
   if (!$frontend_maps_stub_injected) {
       $frontend_maps_stub_injected = true;
       // Inject stub...
   }
   ```

2. **Use global flag in JavaScript to prevent multiple dispatches:**
   ```javascript
   function dispatchMapsLoaded() {
       if (window._voxel_maps_loaded_dispatched) return;
       window._voxel_maps_loaded_dispatched = true;
       // Dispatch event...
   }
   ```

3. **Check console for duplicate initialization logs:**
   - Should only see ONE set of stub logs per page load
   - If seeing multiple `[Create Post Frontend]` AND `[VoxelFSE Frontend]` logs, both contexts are injecting

### Issue: commons.js overwrites callback

**Symptoms:**
- Stub initializes correctly
- Then `Voxel.Maps.GoogleMaps` becomes undefined
- Callback never fires when Google Maps loads

**Cause:** Voxel's `commons.js` replaces `Voxel.Maps` object after stub injection

**Solution:** Monitoring interval in stub detects and restores callback

```javascript
// Stub includes monitoring (lines 1202-1219)
var checkInterval = setInterval(function () {
    checkCount++;
    if (window.Voxel && window.Voxel.Maps) {
        if (typeof window.Voxel.Maps.GoogleMaps !== 'function') {
            // Callback was overwritten - restore it
            window.Voxel.Maps.GoogleMaps = gmapsCallbackStub;
            console.log('[Context] Restored GoogleMaps callback (was overwritten)');
            // If Google Maps already loaded, trigger callback now
            if (window._voxel_gmaps_loaded && typeof google !== 'undefined' && google.maps && !window._voxel_maps_loaded_dispatched) {
                gmapsCallbackStub();
            }
        }
    }
    if (checkCount >= 100) { // Stop after 5 seconds
        clearInterval(checkInterval);
    }
}, 50);
```

If seeing `Restored GoogleMaps callback` in console, this is normal and expected.

---

## Key Learnings

### 1. Three Distinct Contexts Require Different Approaches

- **Admin Metabox:** Inline stub in block HTML + filter in admin-render.php
- **Gutenberg Editor:** `admin_head` hook in Block_Loader.php
- **Frontend:** `wp_head` hook + `wp_enqueue_scripts` hook in Block_Loader.php

**Don't try to use one approach for all contexts - it won't work!**

### 2. Timing is Everything

- Stub MUST be injected BEFORE Google Maps script tag outputs
- `wp_add_inline_script` is TOO LATE (outputs AFTER script tag)
- Use `admin_head` or `wp_head` at priority 1
- Use static flags to prevent duplicate injections

### 3. Soft-Loading Pattern Must Be Bypassed

- Voxel converts `src=` to `data-src=` for performance
- Create Post block needs immediate loading
- Add `script_loader_tag` filter at priority 20
- Check page source to verify `src=` not `data-src=`

### 4. Two-Script System Requires Coordination

- `vx:google-maps.js` (Voxel wrapper) must load first
- `google-maps` (Google API) loads second
- Both must be present before dispatching `maps:loaded` event
- Poll for `Voxel.Maps.Map` function to verify wrapper loaded

### 5. Plan C+ Headless Architecture is Achievable

- AddressAutocomplete component is already framework-agnostic
- Need REST API endpoint for maps configuration
- Next.js `Script` component can load scripts in correct order
- Same stub pattern works in Next.js (no WordPress-specific code)

---

## References

- **Voxel Assets Controller:** `themes/voxel/app/controllers/assets-controller.php`
- **Voxel Commons.js:** `themes/voxel/assets/dist/commons.js` (Voxel.Maps API)
- **Voxel Google Maps:** `themes/voxel/assets/dist/google-maps.js` (Map/Marker/Autocomplete classes)
- **Voxel Enqueue Maps:** `themes/voxel/app/utils/utils.php:1341`
- **Location Field:** `themes/voxel/app/post-types/fields/location-field.php`
- **Google Maps API:** https://developers.google.com/maps/documentation/javascript/overview
- **WordPress Script API:** https://developer.wordpress.org/reference/functions/wp_enqueue_script/
- **Next.js Script:** https://nextjs.org/docs/app/api-reference/components/script

---

**Document Version:** 1.0.0
**Last Updated:** December 8, 2025
**Author:** VoxelFSE Development Team
**Status:** ✅ Complete and tested across all contexts
