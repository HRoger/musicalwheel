# Admin Metabox Critical Analysis - MUST READ

**Date:** 2025-11-27
**Status:** 🔴 **CRITICAL ISSUES FOUND**
**Priority:** IMMEDIATE FIX REQUIRED

---

## Executive Summary

The admin metabox implementation is **fundamentally incorrect**. It's using the frontend AJAX handler instead of the admin handler, which causes posts to save in the wrong format.

**Impact:** Posts created via frontend form are missing Voxel metadata, causing red warning text and broken layout in admin.

---

## Root Cause Analysis

### Voxel's Architecture (Discovered)

Voxel has **TWO separate submission handlers**:

**File:** `themes/voxel/app/controllers/frontend/create-post/submission-controller.php`

1. **Frontend Handler** (lines 16-325)
   - Action: `voxel_ajax_create_post`
   - Creates/updates post with `wp_insert_post()` / `wp_update_post()`
   - Full validation
   - Handles all fields
   - Returns: `{success, edit_link, view_link, message, status}`

2. **Admin Handler** (lines 327-446)
   - Action: `voxel_ajax_create_post__admin`
   - **Does NOT create/update post** - relies on WordPress's save_post action
   - **Skips validation** (line 399 comment: "skip validation on wp-admin")
   - **Skips certain fields** WordPress handles natively (lines 421-429):
     - Title (if post_type supports 'title')
     - Description (if post_type supports 'editor')
     - Thumbnail (featured image `_thumbnail_id`)
     - Taxonomies with `backend_edit_mode === 'native_metabox'`
   - **Requires nonce**: `admin_mode` parameter (line 329)
   - Returns: `{success}` only

---

## Current Implementation Errors

### Error #1: Using Frontend Handler in Admin
**Location:** `app/blocks/src/create-post/shared/CreatePostForm.tsx:541-550`

```typescript
// Current (WRONG):
const queryParams = new URLSearchParams({
    action: 'create_post',  // ❌ Frontend action
    post_type: postTypeKey,
});
const voxelAjaxUrl = `${wpData.ajaxUrl}&${queryParams.toString()}`;
```

**Should be:**
```typescript
// Admin metabox (CORRECT):
const queryParams = new URLSearchParams({
    action: 'create_post__admin',  // ✅ Admin action
    post_type: postTypeKey,
    post_id: postId.toString(),
    admin_mode: adminModeNonce, // ✅ Required nonce
});
```

---

### Error #2: AJAX Submission in Admin
**Location:** `app/blocks/src/create-post/shared/CreatePostForm.tsx`

**Problem:** Admin metabox uses AJAX submission with its own "Save Changes" button.

**Voxel's Pattern:** Admin metabox integrates with WordPress's native "Update" button via `save_post` action.

**Evidence:**
- Admin handler only updates field values, doesn't save post
- WordPress handles title, content, status, author via native UI
- Voxel's metabox JavaScript calls admin handler on WordPress save

---

### Error #3: Rendering All Fields in Admin
**Location:** `app/blocks/src/create-post/components/FieldRenderer.tsx`

**Problem:** Admin metabox renders ALL fields, including title, description, thumbnail.

**Voxel's Pattern:** Admin metabox **excludes** fields WordPress handles:
```php
// Lines 421-429 in submission-controller.php
if (
    ( post_type_supports( $post_type->get_key(), 'title' ) && $field->get_type() === 'title' )
    || ( post_type_supports( $post_type->get_key(), 'editor' ) && $field->get_type() === 'description' )
    || ( $field->get_type() === 'image' && $field->get_key() === '_thumbnail_id' )
    || ( $field->get_type() === 'taxonomy' && $field->get_prop('backend_edit_mode') === 'native_metabox' )
) {
    continue; // Skip these fields in admin
}
```

---

### Error #4: Missing Admin Mode Nonce
**Location:** `app/utils/admin-metabox.php`

**Problem:** No nonce generated or passed to React component.

**Required:** Admin handler verifies nonce (line 329):
```php
if ( ! wp_verify_nonce( $_GET['admin_mode'], 'vx_create_post_admin_mode' ) ) {
    throw new \Exception( __( 'Invalid request', 'voxel' ) );
}
```

---

### Error #5: Wrong Response Handling
**Location:** `app/blocks/src/create-post/shared/CreatePostForm.tsx:588-663`

**Problem:** Expects `{edit_link, view_link, message, status}` from response.

**Admin handler returns:** `{success}` only (line 437-439)

---

## Why Frontend Posts Are Broken

When posts are created via **frontend form**:

1. ✅ Uses correct `create_post` action
2. ✅ Validates all fields
3. ✅ Creates post with `wp_insert_post()`
4. ✅ Updates all field values
5. ✅ Sets post status, author, etc.

**Should work correctly.**

**BUT** - if our frontend form is calling the wrong endpoint or missing parameters, it could fail.

Let me check our frontend implementation...

**File:** `app/blocks/src/create-post/shared/CreatePostForm.tsx:541-550`

```typescript
const queryParams = new URLSearchParams({
    action: 'create_post',  // ✅ Correct for frontend
    post_type: postTypeKey,
});
```

**Issue:** Missing `vx=1` parameter!

Voxel's AJAX URL format: `?vx=1&action=create_post&post_type=X`

Our format: `?action=create_post&post_type=X` (missing `vx=1`)

**Impact:** Request might not be routed to Voxel's handler correctly.

---

## How Voxel's Admin Metabox Works

Let me check Voxel's original metabox to understand the integration pattern...

**File:** `themes/voxel/templates/widgets/create-post.php` (line 98)

```php
if ( $is_admin_mode ) {
    if ( $field->get_type() === 'taxonomy' && $field->get_prop('backend_edit_mode') === 'native_metabox' ) {
        continue; // Skip taxonomy fields with native metabox mode
    }
}
```

This confirms: Voxel's template **conditionally skips fields** in admin mode.

**Vue.js config** (line 20):
```php
<script type="text/json" class="vxconfig"><?= wp_specialchars_decode( wp_json_encode( $config ) ) ?></script>
```

The `$config` array must include `is_admin_mode` flag.

Let me search for where Voxel sets this flag...

---

## Required Fixes

### Fix #1: Detect Admin Metabox Context
**File:** `app/blocks/src/create-post/shared/CreatePostForm.tsx`

Add admin metabox detection:
```typescript
const isAdminMetabox = context === 'admin' || attributes._admin_mode === true;
```

### Fix #2: Use Admin Handler in Metabox
**File:** `app/blocks/src/create-post/shared/CreatePostForm.tsx:541-550`

```typescript
if (isAdminMetabox) {
    // Admin mode: Use admin handler
    const queryParams = new URLSearchParams({
        action: 'create_post__admin',
        post_type: postTypeKey,
        post_id: postId.toString(),
        admin_mode: wpData.adminModeNonce, // Must be provided
    });
    const voxelAjaxUrl = `${wpData.ajaxUrl}?vx=1&${queryParams.toString()}`;
} else {
    // Frontend mode: Use frontend handler
    const queryParams = new URLSearchParams({
        action: 'create_post',
        post_type: postTypeKey,
    });
    if (postId && postId > 0) {
        queryParams.append('post_id', postId.toString());
    }
    const voxelAjaxUrl = `${wpData.ajaxUrl}?vx=1&${queryParams.toString()}`;
}
```

### Fix #3: Generate Admin Nonce
**File:** `app/utils/admin-metabox.php:voxel_fse_render_create_post_metabox()`

```php
// Generate nonce for admin mode
$admin_mode_nonce = wp_create_nonce( 'vx_create_post_admin_mode' );

// Pass to render.php
$attributes['_admin_nonce'] = $admin_mode_nonce;
```

**File:** `app/blocks/src/create-post/render.php`

```php
// Localize nonce for JavaScript
$wpData['adminModeNonce'] = $attributes['_admin_nonce'] ?? '';
```

### Fix #4: Filter Fields for Admin Metabox
**File:** `app/blocks/src/create-post/shared/CreatePostForm.tsx` or `FieldRenderer.tsx`

```typescript
const shouldRenderField = (field: FieldConfig): boolean => {
    if (!isAdminMetabox) {
        return true; // Frontend: render all fields
    }

    // Admin metabox: skip fields WordPress handles natively
    const fieldType = field.type;
    const fieldKey = field.key;

    // Skip title if post_type supports title
    if (fieldType === 'title' && postTypeSupports.title) {
        return false;
    }

    // Skip description if post_type supports editor
    if (fieldType === 'description' && postTypeSupports.editor) {
        return false;
    }

    // Skip featured image
    if (fieldType === 'image' && fieldKey === '_thumbnail_id') {
        return false;
    }

    // Skip taxonomies with native metabox mode
    if (fieldType === 'taxonomy' && field.backend_edit_mode === 'native_metabox') {
        return false;
    }

    return true;
};
```

### Fix #5: Remove Save Button in Admin Metabox
**File:** `app/blocks/src/create-post/shared/FormFooter.tsx`

```typescript
// Don't render submit button in admin metabox
if (isAdminMetabox) {
    return null; // WordPress's Update button handles save
}
```

### Fix #6: Integrate with WordPress Save Action
**File:** `app/utils/admin-metabox.php`

Add save handler:
```php
/**
 * Save metabox data via Voxel's admin handler
 *
 * Called on 'save_post' action
 */
function voxel_fse_save_create_post_metabox_data( $post_id, $post, $update ) {
    // Check if this is a Voxel post type
    $post_type = \Voxel\Post_Type::get( $post->post_type );
    if ( ! $post_type ) {
        return;
    }

    // Check permissions
    if ( ! \Voxel\Post::current_user_can_edit( $post_id ) ) {
        return;
    }

    // Check if our metabox data is present
    if ( empty( $_POST['voxel_fse_field_data'] ) ) {
        return;
    }

    // Call Voxel's admin handler internally
    // (or extract field data and call field->update() directly)
    $postdata = json_decode( stripslashes( $_POST['voxel_fse_field_data'] ), true );

    $fields = $post_type->get_fields();
    foreach ( $fields as $field ) {
        // Skip fields WordPress handles
        if ( should_skip_field_in_admin( $field, $post_type ) ) {
            continue;
        }

        if ( isset( $postdata[ $field->get_key() ] ) ) {
            $field->set_post( \Voxel\Post::get( $post_id ) );
            $value = $field->sanitize( $postdata[ $field->get_key() ] );
            $field->update( $value );
        }
    }
}
add_action( 'save_post', 'voxel_fse_save_create_post_metabox_data', 10, 3 );
```

### Fix #7: Add `vx=1` Parameter to Frontend AJAX
**File:** `app/blocks/src/create-post/shared/CreatePostForm.tsx:550`

```typescript
// OLD:
const voxelAjaxUrl = `${wpData.ajaxUrl}&${queryParams.toString()}`;

// NEW:
const voxelAjaxUrl = `${wpData.ajaxUrl}?vx=1&${queryParams.toString()}`;
```

---

## Fix Priority

**CRITICAL (Must Fix Immediately):**
1. ✅ Fix #7: Add `vx=1` to frontend AJAX URL - **This likely fixes frontend post creation**
2. ✅ Fix #1: Detect admin metabox context
3. ✅ Fix #3: Generate admin nonce

**HIGH (Fix Next):**
4. ✅ Fix #2: Use admin handler in metabox
5. ✅ Fix #4: Filter fields for admin metabox
6. ✅ Fix #5: Remove save button in admin metabox

**MEDIUM (Can Defer):**
7. ✅ Fix #6: Integrate with WordPress save action (alternative approach - keep AJAX but fix handler)

---

## Alternative Approach: Keep AJAX in Admin

Instead of integrating with WordPress's Update button, we could:

1. Keep the current AJAX approach
2. Fix the handler to use `create_post__admin`
3. Fix the nonce generation
4. Fix the field filtering
5. Have the AJAX call happen when user clicks our "Save Changes" button
6. Hide WordPress's "Update" button or make it call our save

**Pros:**
- Simpler implementation
- Matches frontend UX
- User sees immediate feedback

**Cons:**
- Non-standard WordPress UX
- Duplicates WordPress's save button
- Users might click wrong button

**Recommendation:** Use the AJAX approach for now (simpler), then migrate to WordPress integration later.

---

## Testing Plan

### Test #1: Frontend Post Creation
1. Navigate to `/create-places/`
2. Fill out all fields
3. Click "Publish"
4. **Expected:** Post created successfully with all Voxel metadata
5. **Expected:** Edit post in `/wp-admin/` shows no red warnings
6. **Expected:** Layout not broken

### Test #2: Frontend Post Editing
1. Navigate to `/create-places/?post_id=X`
2. Modify fields
3. Click "Save Changes"
4. **Expected:** Post updated successfully
5. **Expected:** Changes visible in admin

### Test #3: Admin Metabox Editing
1. Navigate to `/wp-admin/post.php?post=X&action=edit`
2. Modify fields in "Fields" metabox
3. Click "Save Changes" (metabox button, NOT WordPress Update)
4. **Expected:** Fields updated successfully
5. **Expected:** Page doesn't reload (AJAX)
6. **Expected:** Success message shown

### Test #4: Admin Metabox Field Filtering
1. Navigate to `/wp-admin/post.php?post=X&action=edit`
2. **Expected:** Title field NOT shown (handled by WordPress)
3. **Expected:** Description field NOT shown (handled by WordPress)
4. **Expected:** Featured Image field NOT shown (handled by WordPress)
5. **Expected:** Taxonomy fields NOT shown if `backend_edit_mode === 'native_metabox'`
6. **Expected:** Only custom Voxel fields shown

---

## Next Steps

1. **IMMEDIATE:** Apply Fix #7 to frontend AJAX URL
2. **TEST:** Verify frontend post creation works correctly
3. **THEN:** Apply admin metabox fixes (1-6)
4. **TEST:** Verify admin metabox works correctly

---

## Related Files

**Voxel Source:**
- `themes/voxel/app/controllers/frontend/create-post/submission-controller.php`
- `themes/voxel/templates/widgets/create-post.php`

**FSE Implementation:**
- `app/blocks/src/create-post/shared/CreatePostForm.tsx`
- `app/blocks/src/create-post/render.php`
- `app/utils/admin-metabox.php`
- `app/blocks/src/create-post/components/FieldRenderer.tsx`

---

**Status:** 🔴 **CRITICAL - Fix Required**
**Date:** 2025-11-27
**Session:** claude/widget-block-admin-edit-01QFNxVMQKA5kJcUbezzp8DP
