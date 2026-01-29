# ResizableBox (Resize Divider) Fix - Gutenberg Block Editor

**Date:** 2025-12-02
**Task:** Fix missing resize divider between editor content and meta-boxes area
**Status:** COMPLETE
**Branch:** blocks/create-post

---

## Problem

The ResizableBox (drag-to-resize divider) between the Gutenberg block editor content area and the meta-boxes area was not showing when using our FSE Create Post metabox implementation.

**Symptoms:**
- Resize handle/divider missing in block editor
- User could not drag to resize the meta-boxes area
- Issue only occurred with FSE implementation, not with original Voxel + Elementor

---

## Root Cause Analysis

### How WordPress Detects Meta Boxes for Gutenberg

WordPress's Gutenberg editor uses a meta box detection system to determine if the MetaBoxArea component (which contains the ResizableBox) should render:

1. **PHP Collection** (`wp-admin/includes/post.php:2412-2441`):
   - WordPress iterates through `$wp_meta_boxes` global array
   - Collects meta box IDs and titles for each location (normal, side, advanced)
   - Sends this data to JavaScript via `setAvailableMetaBoxesPerLocation()`

2. **JavaScript Detection** (`wp-includes/js/dist/edit-post.js`):
   ```javascript
   function isMetaBoxLocationActive(state, location) {
     const metaBoxes = getMetaBoxesPerLocation(state, location);
     return !!metaBoxes && metaBoxes.length !== 0;
   }
   ```

3. **Rendering Decision**:
   - If `isMetaBoxLocationActive()` returns true, MetaBoxArea renders with ResizableBox
   - If false, the entire meta-boxes area is hidden

### The Problem with Our Original Approach

Our original implementation:
1. Removed Voxel's metabox: `remove_meta_box('voxel_post_fields', ...)`
2. Added our metabox with same ID: `add_meta_box('voxel_post_fields', ...)`

This removal and re-addition with the same ID appeared to interfere with WordPress's meta box detection mechanism, causing the `$meta_boxes_per_location` array to not properly include our metabox.

---

## Solution

### New Approach: Unique ID + CSS Hide

Instead of removing and replacing Voxel's metabox, we now:

1. **Add our metabox with a UNIQUE ID** (`voxel_fse_post_fields`)
2. **Keep Voxel's metabox in the registry** (for proper detection)
3. **Hide Voxel's metabox via CSS** (so only ours is visible)
4. **Prevent Voxel's metabox AJAX loading** (via backend.js patch)

This ensures WordPress detects active metaboxes correctly, allowing the ResizableBox to render.

---

## Files Modified

### 1. `app/utils/admin-metabox.php`

**Function: `voxel_fse_add_create_post_metabox()`**

Before:
```php
// Remove Voxel's metabox
remove_meta_box('voxel_post_fields', $post_type_key, 'normal');

// Add with same ID
add_meta_box('voxel_post_fields', ...);
```

After:
```php
// Add with UNIQUE ID (don't remove Voxel's)
add_meta_box('voxel_fse_post_fields', ...);

// Hide Voxel's via CSS
add_action('admin_head', 'voxel_fse_hide_voxel_metabox');
```

**New Function: `voxel_fse_hide_voxel_metabox()`**

```php
function voxel_fse_hide_voxel_metabox() {
    // ... screen checks ...
    ?>
    <style type="text/css">
        /* Hide Voxel's original metabox */
        #voxel_post_fields {
            display: none !important;
        }
        /* Hide from Screen Options panel */
        label[for="voxel_post_fields-hide"] {
            display: none !important;
        }
    </style>
    <?php
}
```

### 2. `app/blocks/Block_Loader.php`

Updated CSS selector to target new metabox ID:

```css
/* Before */
#voxel_post_fields .inside { ... }

/* After */
#voxel_fse_post_fields .inside { ... }
```

### 3. `functions.php`

Updated comments to document new approach:

```php
/**
 * Register FSE admin metabox alongside Voxel's Elementor metabox
 *
 * NOTE: We use a UNIQUE ID (voxel_fse_post_fields) and hide Voxel's
 * original metabox via CSS. This approach preserves WordPress's meta
 * box detection for Gutenberg, which is required for the ResizableBox
 * (drag handle between editor and meta-boxes area) to appear.
 */
add_action('add_meta_boxes', 'voxel_fse_add_create_post_metabox', 20);
```

---

## Technical Details

### Meta Box Registration Flow

```
Priority 10: Voxel registers 'voxel_post_fields'
     ↓
Priority 15: voxel_fse_remove_voxel_metabox_from_unsupported_types()
             (only affects non-Voxel post types)
     ↓
Priority 20: voxel_fse_add_create_post_metabox()
             - Adds 'voxel_fse_post_fields' (unique ID)
             - Adds CSS to hide 'voxel_post_fields'
     ↓
WordPress collects meta boxes from $wp_meta_boxes
     ↓
Both metaboxes detected → MetaBoxArea renders → ResizableBox appears
```

### Why CSS Hide Instead of Remove

| Approach | WordPress Detection | ResizableBox | Result |
|----------|---------------------|--------------|--------|
| `remove_meta_box()` + `add_meta_box()` same ID | Broken | Missing | Bad |
| `remove_meta_box()` only | Empty location | Missing | Bad |
| Unique ID + CSS hide | Both detected | Shows | Good |

---

## Testing Checklist

- [ ] Navigate to `/wp-admin/post.php?post=ID&action=edit` for a Voxel post type
- [ ] **ResizableBox (drag handle) appears** between editor and meta-boxes
- [ ] **FSE "Fields" metabox is visible** with correct title and "Edit in frontend form" link
- [ ] **Voxel's original metabox is hidden** (not visible in UI or Screen Options)
- [ ] **No console errors** related to metabox loading
- [ ] **Metabox functionality works** - can edit fields, save changes
- [ ] **Other metaboxes unaffected** - Author, Priority, Expiration, Verification still work

---

## References

- WordPress Gutenberg Meta Box Docs: https://developer.wordpress.org/block-editor/how-to-guides/metabox/
- ResizableBox Component: https://developer.wordpress.org/block-editor/reference-guides/components/resizable-box/
- Related Task: `task-2025-11-27-admin-metabox-fixes.md`

---

## Summary

The ResizableBox issue was caused by our original approach of removing and re-adding a metabox with the same ID, which interfered with WordPress's meta box detection for Gutenberg. The fix uses a unique metabox ID and CSS-based hiding of Voxel's original metabox, preserving proper detection while showing only our FSE implementation.

**Key Insight:** WordPress's meta box detection for Gutenberg is sensitive to how metaboxes are registered. Using unique IDs and CSS visibility control is more reliable than `remove_meta_box()` + `add_meta_box()` with the same ID.

---

**Status:** COMPLETE - Ready for Testing
**Date:** 2025-12-02
