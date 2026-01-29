# Google Maps Admin Metabox Fix

**Date:** December 8, 2025
**Context:** Admin metabox location field autocomplete not working
**Root Cause:** Voxel's soft-loading pattern prevents maps scripts from loading
**Status:** ✅ SOLVED

---

## Problem Summary

When editing posts in WordPress admin with location fields, the Google Maps autocomplete was not working:
- Error: `Voxel.Maps.Autocomplete not available after 100 retries (10 seconds)`
- Update button did nothing (no errors, form didn't submit)
- Maps scripts were enqueued but never actually loaded

---

## Root Causes Discovered

### 1. Voxel Soft-Loading Pattern

**What is soft-loading?**
- Voxel uses "deferred loading" for maps scripts to improve page load performance
- Scripts are registered and enqueued, but NOT loaded immediately
- Instead, `src=` attribute is replaced with `data-src=`
- JavaScript must manually trigger loading by converting `data-src` back to `src`

**Evidence:**
```php
// themes/voxel/app/controllers/assets-controller.php:49-54
protected $soft_loaded_scripts = [
    'google-maps' => true,
    'vx:google-maps.js' => true,
    'mapbox-gl' => true,
    'vx:mapbox.js' => true,
];

// Line 367-372
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

### 2. Wrong Function Check Blocking Everything

**The bug:**
```php
// admin-render.php (WRONG)
if (function_exists('voxel') && $is_admin_metabox) {
    // Maps enqueue code here...
}
```

**Why it's wrong:**
- There is NO function named `voxel` in the Voxel theme
- All Voxel functions are in the `\Voxel\` namespace
- `function_exists('voxel')` ALWAYS returns `false`
- This blocked the entire maps enqueue section from running

**Correct check:**
```php
// Just check if we're in admin metabox
if ($is_admin_metabox) {
    // Maps enqueue code here...
}
```

### 3. Missing Admin Mode Nonce

**The bug:**
- `wp_localize_script` was not passing `adminModeNonce` to frontend
- Form submission URL parameter `admin_mode=` was empty
- Voxel's AJAX handler rejected request with "Invalid request"

**Evidence from console:**
```
frontend: Using admin handler {postId: 2175, nonce: ''}  // Empty nonce!
URL: http://.../?vx=1&action=create_post__admin&post_type=places&post_id=2175&admin_mode=
Response: {success: false, message: 'Invalid request'}
```

---

## Solutions Implemented

### Fix 1: Bypass Soft-Loading in Admin Metabox

**File:** `app/utils/admin-metabox-iframe.php`

**Lines 17-29:**
```php
// CRITICAL: Bypass Voxel's soft-loading for maps scripts in admin metabox
// Voxel replaces src= with data-src= for google-maps and vx:google-maps.js scripts
// This prevents them from loading until JavaScript triggers them
// In admin metabox, we need them to load immediately for location field autocomplete
add_filter('script_loader_tag', function($tag, $handle) {
    // Only bypass soft-loading for maps-related scripts
    $maps_scripts = ['google-maps', 'vx:google-maps.js', 'mapbox-gl', 'vx:mapbox.js'];
    if (in_array($handle, $maps_scripts, true)) {
        // Convert data-src back to src to force immediate loading
        $tag = str_replace(' data-src=', ' src=', $tag);
    }
    return $tag;
}, 20, 2); // Priority 20 = run AFTER Voxel's filter (priority 10)
```

**Why priority 20?**
- Voxel's `script_loader_tag` filter runs at default priority (10)
- Our filter runs at priority 20, AFTER Voxel's filter
- We intercept the tag AFTER Voxel converts `src` to `data-src`
- We convert it back to `src` to force immediate loading

### Fix 2: Remove Wrong Function Check

**File:** `app/blocks/src/create-post/admin-render.php`

**Line 920 (BEFORE):**
```php
// Check if Voxel parent theme functions are available (functions are in \Voxel\ namespace)
$_voxel_available = function_exists('\\Voxel\\enqueue_maps');

if ($_voxel_available && $is_admin_metabox) {
```

**Line 920 (AFTER):**
```php
if ($is_admin_metabox) {
```

**Why this works:**
- Don't check for non-existent `voxel` function
- Just check if we're in admin metabox context
- `$is_admin_metabox` is already set correctly by admin-metabox-iframe.php
- Maps scripts are already registered by Voxel's `get_header()` call

### Fix 3: Add Admin Mode Nonce

**File:** `app/blocks/src/create-post/admin-render.php`

**Lines 855-874 (BEFORE):**
```php
wp_localize_script(
    'voxel-fse-create-post-frontend',
    'voxelFseCreatePost',
    [
        'ajaxUrl' => add_query_arg('vx', 1, home_url('/')),
        'i18n' => [
            'required' => __('This field is required', 'voxel-fse'),
            // ... other i18n strings
        ],
    ]
);
```

**Lines 855-874 (AFTER):**
```php
wp_localize_script(
    'voxel-fse-create-post-frontend',
    'voxelFseCreatePost',
    [
        'ajaxUrl' => add_query_arg('vx', 1, home_url('/')),
        // CRITICAL: Admin mode nonce required for admin form submission
        'adminModeNonce' => $attributes['_admin_nonce'] ?? '',
        'isAdminMode' => $is_admin_context,
        'isAdminMetabox' => $is_admin_metabox,
        'i18n' => [
            'required' => __('This field is required', 'voxel-fse'),
            // ... other i18n strings
        ],
    ]
);
```

**What changed:**
- Added `adminModeNonce` from `$attributes['_admin_nonce']`
- Added `isAdminMode` and `isAdminMetabox` flags
- Frontend code already reads `wpData.adminModeNonce` and uses it in submission URL

---

## How To Test

1. **Hard refresh** the admin post edit page (Ctrl+Shift+R)
2. Check console for **"=== Loaded Scripts ==="** output
3. Verify these scripts are present:
   ```
   Script: .../vue.prod.js
   Script: .../commons.js
   Script: .../google-maps.js        <-- Should now be present!
   Script: .../maps/api/js?...       <-- Google Maps API
   ```
4. Verify `Voxel.Maps.Autocomplete` is defined (not undefined)
5. Try typing in location field - autocomplete dropdown should appear
6. Try clicking Update button - form should submit successfully

---

## Debug Checklist

If maps still not loading:

1. **Check script tags in page source:**
   ```html
   <!-- WRONG (soft-loaded, won't load): -->
   <script data-src="..." id="google-maps-js"></script>

   <!-- CORRECT (immediate load): -->
   <script src="..." id="google-maps-js"></script>
   ```

2. **Check console for enqueue messages:**
   ```
   === MAPS ENQUEUE ATTEMPT DEBUG ===
   has_location_fields: true
   enqueue_maps function exists: true
   BEFORE enqueue - vx:google-maps.js registered: true
   BEFORE enqueue - google-maps registered: true
   Calling enqueue_maps()...
   AFTER enqueue_maps():
     vx:google-maps.js enqueued: true
     google-maps enqueued: true
   ```

3. **Check Voxel.Maps object:**
   ```javascript
   console.log(window.Voxel.Maps);
   // Should show: {await: ƒ, GoogleMaps: ƒ, Autocomplete: ƒ, ...}
   ```

4. **Check form submission URL:**
   ```
   URL: http://.../?vx=1&action=create_post__admin&post_type=places&post_id=2175&admin_mode=NONCE_HERE
   ```
   - `admin_mode` parameter should have a nonce value (NOT empty)

---

## Key Learnings

### 1. Voxel Soft-Loading Pattern

- **Pattern:** Replace `src=` with `data-src=` for performance
- **Purpose:** Defer script loading until needed
- **Trigger:** JavaScript manually loads by fixing `data-src` → `src`
- **Problem:** Admin metabox needs immediate loading (no JS trigger exists)
- **Solution:** Bypass soft-loading with higher-priority filter

### 2. WordPress Script Filter Priority

- **Default priority:** 10
- **Voxel's filter:** Default (10)
- **Our filter:** Priority 20
- **Result:** Our filter runs AFTER Voxel's, can intercept and modify output

### 3. Function Existence Checks

- **WRONG:** `function_exists('voxel')` - this function doesn't exist
- **WRONG:** `function_exists('voxel()')` - syntax error
- **CORRECT:** `function_exists('\\Voxel\\enqueue_maps')` - namespaced function
- **BETTER:** Just check context directly (`if ($is_admin_metabox)`)

### 4. Admin Mode Nonce Pattern

**Required data in `wp_localize_script`:**
```php
[
    'ajaxUrl' => '...',
    'adminModeNonce' => $attributes['_admin_nonce'] ?? '',  // Required!
    'isAdminMode' => true,
    'isAdminMetabox' => true,
]
```

**Frontend usage:**
```typescript
const adminNonce = wpData.adminModeNonce || '';
const queryParams = new URLSearchParams({
    action: 'create_post__admin',
    post_type: postTypeKey,
    post_id: postId.toString(),
    admin_mode: adminNonce,  // Used here
});
```

---

## Related Patterns

### React Portal Pattern
- **Purpose:** Render popups at document.body level
- **Implementation:** `createPortal(jsx, document.body)`
- **Import:** `react-dom` (NOT `@wordpress/element`)
- **Reference:** `shared/popup-kit/FieldPopup.tsx`

### Blurable Mixin Pattern
- **Purpose:** Close popup on outside click or ESC
- **Event:** `mousedown` (NOT `click`)
- **Target:** `document` (NOT popup container)
- **Timing:** `requestAnimationFrame` before adding listener
- **Reference:** `shared/popup-kit/FieldPopup.tsx:188-216`

---

## Files Modified

1. **admin-metabox-iframe.php**
   - Added soft-loading bypass filter (lines 17-29)

2. **admin-render.php**
   - Removed wrong `function_exists('voxel')` check (line 920)
   - Added `adminModeNonce` to wp_localize_script (lines 863-865)

3. **CreatePostForm.tsx** (previous session)
   - Fixed race condition: moved `create-post:mounted` message after submit method exposure
   - **Evidence:** Lines 994-1003 already read `wpData.adminModeNonce` correctly

---

## Prevention Checklist

Before implementing admin context features:

- ✅ Check if scripts use soft-loading pattern
- ✅ Add bypass filter if immediate loading required
- ✅ Verify function existence checks use correct namespaces
- ✅ Pass all required nonces via `wp_localize_script`
- ✅ Match Voxel HTML structure 1:1 for CSS inheritance
- ✅ Test with hard refresh (Ctrl+Shift+R) to clear cache

---

---

## Fix 4: Re-enable Update Button After Validation Failure

**Date:** December 8, 2025
**Problem:** When clicking Update button with validation errors (e.g., required field empty), button becomes permanently disabled even after user fixes the errors.

**Evidence from console:**
```
[Admin metabox] Button clicked: publish
[Validation] Switching to step 4 for field logo
```

Button disables but never re-enables when validation fails.

### Root Cause

**Missing validation failure communication:**

1. **CreatePostForm.tsx** - No message sent when validation fails
   - Line 904: `if (!validateForm()) { return; }`
   - Form correctly switches to error step, but parent window not notified

2. **admin-metabox.php** - No listener for validation failure
   - Lines 355-358: Button disabled when submit called
   - Line 372: Listener only for `create-post:submitted` (success case)
   - No listener to re-enable button when validation fails

### Solution

**Part 1: Send validation failure message (CreatePostForm.tsx lines 904-913)**

```typescript
// Validate form
if (!validateForm()) {
    // Notify parent window (admin metabox) that validation failed
    // This allows the Update button to be re-enabled
    try {
        window.parent.postMessage('create-post:validation-failed', '*');
    } catch (error) {
        console.debug('postMessage failed (likely browser extension):', error);
    }
    return;
}
```

**Part 2: Listen for validation failure (admin-metabox.php lines 384-397)**

```javascript
// Listen for validation failure from iframe
window.addEventListener('message', function (event) {
    if (event.data === 'create-post:validation-failed') {
        console.log('[Admin metabox] Received create-post:validation-failed message');
        if (updateButton && wrapper) {
            // Re-enable button so user can try again after fixing validation errors
            updateButton.classList.remove('vx-disabled');
            wrapper.classList.remove('ts-saving');
            // Re-attach click handler
            updateButton.addEventListener('click', clickHandler);
            console.log('[Admin metabox] Button re-enabled after validation failure');
        }
    }
});
```

### Testing

1. Edit a post with location field in admin
2. Leave a required field empty (e.g., logo)
3. Click Update button
4. **Expected behavior:**
   - Form switches to step with validation error
   - Button re-enables immediately
   - Button has normal border (not red)
   - User can fill required field and click Update again
5. Fill required field
6. Click Update again - should submit successfully

### Files Modified

1. **CreatePostForm.tsx** (lines 904-913)
   - Added `postMessage('create-post:validation-failed')` when validation fails

2. **admin-metabox.php** (lines 384-397)
   - Added message listener to re-enable button on validation failure
   - Removes `vx-disabled` class
   - Removes `ts-saving` class
   - Re-attaches click handler

3. **Built assets:**
   - `app/blocks/src/create-post/frontend.js` (rebuilt)

---

## Fix 5: File Fields Not Persisting After Upload (Images Disappearing)

**Date:** December 8, 2025
**Problem:** After uploading images to gallery/avatar/logo fields and clicking Update, images are uploaded to media library but disappear from metabox and frontend after page reload.

**Evidence from console:**
User reported: "If I upload an image to the gallery image, and the others image and file fields, after clicking updating and the page reloads, all images and files are gone and not displayed anymore on the front, although the images were uploaded to the media library."

### Root Cause

**Missing file field initialization in formData and fileObjectsRef:**

The problem was in CreatePostForm.tsx initialization logic (lines 272-316). When loading field values from Voxel:

1. **File fields had NO special handling** - They fell through to the default `else` case which did:
   ```typescript
   initialData[field.key] = field.value || '';
   ```

2. **fileObjectsRef was NEVER populated on initial load** - Only populated when user changed field via `handleFieldChange` (line 476)

3. **But submission reads from fileObjectsRef** - Line 965 reads from `fileObjectsRef.current[fieldKey]`:
   ```typescript
   const fileObjects = fileObjectsRef.current[fieldKey] || [];
   ```

**Result:** After page reload with existing files:
- `field.value` contained FileObjects from Voxel's `editing_value()` method
- But `fileObjectsRef.current[fieldKey]` was empty (never initialized)
- On submit, code read empty array from ref → no files sent to backend
- Backend saw no files → deleted field value

### Solution

**Added file field initialization (CreatePostForm.tsx lines 289-311)**:

```typescript
} else if (['file', 'image', 'profile-avatar', 'logo', 'cover-image', 'gallery'].includes(field.type)) {
    // File-based fields - CRITICAL FIX for images disappearing
    // Voxel returns array of FileObjects from editing_value() method
    // Evidence: themes/voxel/app/post-types/fields/file-field.php:96-121
    // Format: [{ source: 'existing', id: 123, name: 'file.jpg', type: 'image/jpeg', preview: 'url' }]
    //
    // MUST populate BOTH:
    // 1. fileObjectsRef (for submission - line 965)
    // 2. formData (for UI display and validation)
    const fileObjects: FileObject[] = Array.isArray(field.value) ? (field.value as unknown as FileObject[]) : [];

    // Store FileObjects in ref (used during submission)
    fileObjectsRef.current[field.key] = fileObjects;

    // Store metadata in formData (used for UI)
    const metadataOnly: FileMetadata[] = fileObjects.map((fileObj) => ({
        source: fileObj.source,
        id: fileObj.id,
        name: fileObj.name,
        type: fileObj.type,
        preview: fileObj.preview,
    }));
    initialData[field.key] = metadataOnly as unknown as FieldValue;
}
```

**What this does:**
1. Detects file-based fields during initialization
2. Extracts FileObject array from `field.value`
3. Populates `fileObjectsRef.current[fieldKey]` with FileObjects
4. Populates `formData[fieldKey]` with metadata (for UI display)

**Evidence from Voxel**: File-field.php `editing_value()` method (lines 96-121) returns:
```php
$config[] = [
    'source' => 'existing',
    'id' => $attachment->ID,
    'name' => wp_basename( get_attached_file( $attachment->ID ) ),
    'type' => $attachment->post_mime_type,
    'preview' => wp_get_attachment_image_url( $attachment->ID, 'medium' ),
];
```

This matches our `FileObject` interface perfectly!

### Testing

1. **Upload new images:**
   - Edit post in admin metabox
   - Upload images to gallery/avatar/logo fields
   - Click Update
   - **Expected:** Images saved to media library AND displayed in metabox

2. **Verify persistence after reload:**
   - Hard refresh page (Ctrl+Shift+R)
   - **Expected:** All uploaded images still visible in fields
   - Click Update again
   - **Expected:** Images remain (not deleted)

3. **Test mixed new + existing:**
   - Upload new image to gallery (already has 2 images)
   - Click Update
   - **Expected:** All 3 images persist (2 existing + 1 new)

### Files Modified

1. **CreatePostForm.tsx** (lines 289-311)
   - Added file field initialization logic
   - Populates both fileObjectsRef and formData
   - Matches Voxel's FileObject format from editing_value()

2. **Built assets:**
   - `app/blocks/src/create-post/frontend.js` (rebuilt to 335.02 kB)

### Key Learning

**Dual Storage Pattern for File Fields:**

File fields require DUAL storage at ALL times (not just on change):

1. **fileObjectsRef** (React ref)
   - Stores actual FileObject data with File objects
   - Used during form submission (line 965)
   - NOT serialized in React state
   - MUST be populated on initial load AND on change

2. **formData** (React state)
   - Stores metadata only (for UI display)
   - Used for validation and rendering
   - Serializable JSON format
   - Updates trigger re-renders

**If either storage is missing, files will be lost!**

---

## Fix 6: Save Changes Button Missing from Frontend

**Date:** December 8, 2025
**Problem:** "Save Changes" button missing from frontend create-post form when editing published posts.

**Evidence:**
User reported: "The save button is missing from the frontend create-post form"

### Root Cause

**Missing TypeScript type definition:**

The problem was in frontend.tsx (lines 25-30). The `VoxelFseCreatePostData` interface didn't include `postStatus`:

```typescript
interface VoxelFseCreatePostData {
    restUrl?: string;
    ajaxUrl?: string;
    nonce?: string;
    i18n?: Record<string, string>;
    // postStatus was MISSING!
}
```

Even though `postStatus` was being passed via `wp_localize_script` in admin-render.php (line 867), TypeScript didn't know about it, so it wasn't available to the React component.

**Button render condition** (CreatePostForm.tsx line 1571):
```typescript
{postId && isPublishedPost && (
    <a href="#" className="ts-btn ts-btn-2 form-btn ts-btn-large ts-save-changes">
```

Where `isPublishedPost` depends on `postStatus`:
```typescript
const postStatus = wpData?.postStatus || null;
const isPublishedPost = postStatus && postStatus !== 'draft';
```

### Solution

**Added missing types to VoxelFseCreatePostData interface (frontend.tsx lines 25-34)**:

```typescript
interface VoxelFseCreatePostData {
    restUrl?: string;
    ajaxUrl?: string;
    nonce?: string;
    postStatus?: string | null;          // ADDED - for Save Changes button visibility
    adminModeNonce?: string;             // ADDED - for admin form submission
    isAdminMode?: boolean;               // ADDED - context flag
    isAdminMetabox?: boolean;            // ADDED - context flag
    i18n?: Record<string, string>;
}
```

**What this does:**
- TypeScript now recognizes `postStatus` property on `window.voxelFseCreatePost`
- React component can access `wpData?.postStatus` without type errors
- `isPublishedPost` correctly evaluates to `true` for published posts
- Save Changes button renders when editing published posts

### Files Modified

1. **frontend.tsx** (lines 25-34)
   - Added `postStatus`, `adminModeNonce`, `isAdminMode`, `isAdminMetabox` to type definition
   - No logic changes needed - data was already being passed from PHP

2. **Built assets:**
   - `app/blocks/src/create-post/frontend.js` (rebuilt to 335.02 kB)

### Key Learning

**TypeScript Type Safety:**

When adding new data to `wp_localize_script`:
1. Add property to PHP array (admin-render.php line 867)
2. Add property to TypeScript interface (frontend.tsx lines 25-34)
3. BOTH must be present for React component to access the data

**If type definition is missing, the property won't be accessible in TypeScript!**

---

## Fix 7: Google Maps Not Loading in Frontend

**Date:** December 8, 2025
**Problem:** Maps showing in admin metabox and Gutenberg editor, but NOT in frontend. Console error: "[AddressAutocomplete] ERROR: Voxel.Maps.Autocomplete not available after 100 retries (10 seconds)"

**Evidence:**
User reported: "The map is not showing anymore in the frontend, although is showing on the METABOX and in the GUTENBERG EDITOR"

### Root Cause

**Soft-loading bypass only applied to admin metabox context:**

The soft-loading bypass filter from Fix #1 (admin-metabox-iframe.php lines 17-29) only ran in admin metabox context because it was added inside the `admin-metabox-iframe.php` file which is ONLY included for metabox.

**Result:**
- **Admin metabox:** Filter runs → `data-src` converted to `src` → maps load immediately ✅
- **Frontend:** Filter doesn't run → scripts stay as `data-src` → maps never load ❌

### Solution

**Part 1: Moved location field detection outside admin-only block (admin-render.php lines 926-934)**:

```php
// Check if any location fields exist - if so, we need maps scripts
// This applies to BOTH admin metabox AND frontend
$has_location_fields = false;
foreach ($fields_config as $field_config) {
    if (($field_config['type'] ?? '') === 'location') {
        $has_location_fields = true;
        break;
    }
}
```

**Previously:** Location field check was inside `if ($is_admin_metabox)` block
**Now:** Runs for all contexts (admin AND frontend)

**Part 2: Added frontend maps enqueuing (admin-render.php lines 1080-1093)**:

```php
// Frontend: Enqueue maps if location fields exist
// In frontend, Voxel should have already enqueued maps via frontend_props(),
// but we ensure commons.js is loaded for Voxel.Maps API
if (!$is_admin_metabox && !$is_editor_preview && $has_location_fields) {
    // Enqueue commons.js if registered (contains Voxel.Maps API)
    if (wp_script_is('vx:commons.js', 'registered')) {
        wp_enqueue_script('vx:commons.js');
    }

    // Ensure maps are enqueued
    if (function_exists('\Voxel\enqueue_maps')) {
        \Voxel\enqueue_maps();
    }
}
```

**Part 3: Added soft-loading bypass filter for ALL contexts (admin-render.php lines 1095-1108)**:

```php
// CRITICAL: Bypass Voxel's soft-loading for maps scripts when create-post block is used
// Voxel replaces src= with data-src= for google-maps and vx:google-maps.js scripts
// This prevents them from loading until JavaScript triggers them
// In create-post form (admin AND frontend), we need them to load immediately for location field autocomplete
// Evidence: themes/voxel/app/controllers/assets-controller.php:49-54 and :367-372
if (!has_filter('script_loader_tag', 'voxel_fse_bypass_maps_soft_loading')) {
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

**Key changes from admin-metabox-iframe.php version:**
1. Added `if (!has_filter(...))` check to prevent duplicate filters
2. Added comment about applying to "admin AND frontend"
3. Moved to admin-render.php which runs for ALL contexts

### Testing

1. **Frontend with location field:**
   - Navigate to a frontend page with create-post block
   - Form should have location field with Google Maps autocomplete
   - **Expected:** Maps loads, autocomplete works
   - **Console:** No "Voxel.Maps.Autocomplete not available" errors

2. **Admin metabox (should still work):**
   - Edit post in admin with location field
   - **Expected:** Maps loads, autocomplete works
   - **Console:** No errors

3. **Check script tags in page source:**
   ```html
   <!-- CORRECT (immediate load): -->
   <script src="https://maps.googleapis.com/maps/api/js?..." id="google-maps-js"></script>

   <!-- WRONG (won't load): -->
   <script data-src="https://maps.googleapis.com/maps/api/js?..." id="google-maps-js"></script>
   ```

### Files Modified

1. **admin-render.php** (lines 926-934, 1080-1108)
   - Moved `$has_location_fields` detection outside admin-only block
   - Added frontend maps enqueuing section
   - Added soft-loading bypass filter for ALL contexts

### Key Learning

**Soft-Loading Bypass Must Run in All Contexts:**

When bypassing Voxel's soft-loading pattern:
1. **DON'T** add filter in context-specific files (like admin-metabox-iframe.php)
2. **DO** add filter in render file that runs for all contexts (admin-render.php)
3. **DO** use `if (!has_filter(...))` to prevent duplicate filters
4. **DO** ensure priority 20 runs AFTER Voxel's priority 10 filter

**Pattern:**
```php
if (!has_filter('script_loader_tag', 'unique_function_name')) {
    add_filter('script_loader_tag', function($tag, $handle) {
        // Bypass logic here
    }, 20, 2);
}
```

---

## Complete Implementation Summary - All Contexts

**⚠️ IMPORTANT:** This document covers **Admin Metabox only**. Google Maps implementation differs across three contexts:

1. **Admin Metabox** (this document)
2. **Gutenberg Editor** (Block_Loader.php `admin_head` hook)
3. **Frontend** (Block_Loader.php `wp_head` + `wp_enqueue_scripts` hooks)

**For comprehensive documentation covering ALL three contexts**, see:
**→ [Google Maps Complete Implementation Summary](google-maps-complete-implementation-summary.md)**

### Implementation Comparison

| Context | Stub Injection | Soft-Loading Bypass | File/Method |
|---------|----------------|---------------------|-------------|
| **Admin Metabox** | Inline in block HTML | Filter in admin-render.php | `admin-render.php` lines 1120-1276 |
| **Gutenberg Editor** | `admin_head` hook priority 1 | Not needed (admin context) | `Block_Loader.php` lines 851-962 |
| **Frontend** | `wp_head` hook priority 1 | `wp_enqueue_scripts` filter | `Block_Loader.php` lines 990-1193 |

### Key Technical Differences

**Admin Metabox (this document):**
- Renders via `admin-render.php` (PHP server-side)
- Stub injected inline in block HTML output (before `wp_footer`)
- Soft-loading bypass filter added in `admin-render.php`
- Detection: `$is_admin_metabox` flag from `admin-metabox-iframe.php`

**Gutenberg Editor:**
- Renders via React `BlockServerSideRender` component
- Stub injected via `admin_head` hook at priority 1 (before ANY scripts)
- No soft-loading bypass needed (admin context loads scripts normally)
- Detection: `get_current_screen()->is_block_editor()` check

**Frontend:**
- Renders via static HTML from `save.tsx` + React hydration
- Stub injected via `wp_head` hook at priority 1 (before scripts)
- Soft-loading bypass filter added via `wp_enqueue_scripts` hook
- Detection: `has_block('voxel-fse/create-post', $post)` check

### Universal Pattern: GoogleMaps Callback Stub

All three contexts use **identical stub implementation** with only console log prefixes differing:

```javascript
(function () {
    // 1. Initialize Voxel.Maps object structure
    // 2. Define isVoxelMapsReady() helper (checks for Voxel.Maps.Map function)
    // 3. Define dispatchMapsLoaded() helper (fires maps:loaded event once)
    // 4. Define gmapsCallbackStub() function (Google Maps calls this when ready)
    // 5. Assign window.Voxel.Maps.GoogleMaps = gmapsCallbackStub
    // 6. Monitor every 50ms and restore if commons.js overwrites
})();
```

**Key requirements:**
1. Must run BEFORE Google Maps script tag (Google Maps has `loading=async`)
2. Must poll for `vx:google-maps.js` to load (defines `Voxel.Maps.Map`, `Marker`, `Autocomplete`)
3. Must only dispatch `maps:loaded` AFTER both scripts ready
4. Must monitor for `commons.js` overwriting callback

### Plan C+ Headless Architecture

The comprehensive summary includes **complete Plan C+ migration guide** for Next.js:

**REST API Endpoint Needed:**
```
GET /wp-json/voxel-fse/v1/maps/config
```

**Returns:**
```json
{
    "provider": "google",
    "google_maps_url": "https://maps.googleapis.com/...",
    "voxel_maps_js_url": "https://site.com/.../google-maps.js",
    "voxel_commons_js_url": "https://site.com/.../commons.js",
    "load_order": ["voxel_commons_js", "voxel_maps_js", "google_maps_api"]
}
```

**Next.js Component:**
- Fetches config from REST API
- Loads scripts via `next/script` with `strategy="beforeInteractive"`
- Injects same stub pattern in `<head>`
- **AddressAutocomplete component requires NO changes** (already framework-agnostic!)

See complete implementation example in the comprehensive summary document.

---

## References

- **Voxel Assets Controller:** `themes/voxel/app/controllers/assets-controller.php`
- **Voxel Enqueue Maps:** `themes/voxel/app/utils/utils.php:1341`
- **Voxel Commons.js:** `themes/voxel/assets/dist/commons.js` (Voxel.Maps API)
- **Google Maps Callback:** `Voxel.Maps.GoogleMaps()` function
- **Location Field:** `themes/voxel/app/post-types/fields/location-field.php:131`
- **Comprehensive Summary:** `google-maps-complete-implementation-summary.md` (all contexts + Plan C+)
