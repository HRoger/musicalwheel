# Template ID Regeneration Fix - Technical Summary

**Date:** November 29, 2025  
**Issue:** Voxel Elementor template IDs regenerating on every page load  
**Status:** ✅ RESOLVED

---

## Problem Statement

When loading the Design menu pages (Header & Footer, General Templates, Taxonomies), Voxel's Elementor template IDs were being regenerated on every page reload:

```
Page Load 1: Active header ID: 1488
Page Load 2: Active header ID: 1492  (different!)
Page Load 3: Active header ID: 1496  (different again!)
```

This caused:
- ❌ FSE templates to be created with stale Elementor ID mappings
- ❌ Interceptor redirects to fail (looking for non-existent Elementor IDs)
- ❌ Database bloat (orphaned Elementor library posts)
- ❌ Infinite loop of template creation/deletion

---

## Root Cause Analysis

### The Infinite Loop

**What was happening:**

1. **Voxel's `create_required_templates()`** runs on page load:
   ```php
   // themes/voxel/app/controllers/templates/templates-controller.php:102-120
   if ( ! \Voxel\template_exists( $templates['header'] ?? '' ) ) {
       $template_id = \Voxel\create_template( 'site template: header' );
       \Voxel\set( 'templates.header', $template_id );
   }
   ```

2. **Our code** was overwriting Voxel's config:
   ```php
   // ❌ WRONG - This was the problem!
   $templates_config['header'] = $fse_template_id;  // FSE ID: 1490
   \Voxel\set( 'templates', $templates_config );
   ```

3. **Voxel checks if template exists:**
   ```php
   // themes/voxel/app/utils/template-utils.php:34-36
   function template_exists( $template_id ) {
       return is_int( $template_id ) 
           && get_post_type( $template_id ) === 'elementor_library'  // ❌ Fails!
           && get_post_status( $template_id ) !== 'trash';
   }
   ```

4. **The check fails** because:
   - We stored FSE template ID (1490) in Voxel's config
   - FSE templates have post type `wp_template`, not `elementor_library`
   - `template_exists(1490)` returns `FALSE`

5. **Voxel creates a NEW Elementor template:**
   - Gets new ID (1492)
   - Saves to config
   - Loop repeats on next page load

### Why This Happened

**Separation of Concerns Violation:**

- **Voxel's `templates` config** is meant to track **Elementor library posts** (`elementor_library` post type)
- **Our FSE templates** are **WordPress templates** (`wp_template` post type)
- **We were mixing them** by storing FSE IDs in Voxel's Elementor config

**Evidence from Voxel's code:**

```php
// themes/voxel/app/utils/template-utils.php:34
function template_exists( $template_id ) {
    return is_int( $template_id ) 
        && get_post_type( $template_id ) === 'elementor_library'  // Only checks Elementor!
        && get_post_status( $template_id ) !== 'trash';
}
```

Voxel's `template_exists()` **only validates Elementor library posts**, not FSE templates.

---

## Solution

### Principle: Separation of Concerns

**Two separate systems, two separate configs:**

1. **Voxel's System:**
   - Tracks Elementor templates (`elementor_library` posts)
   - Stores IDs in `\Voxel\get('templates')`
   - Uses `template_exists()` to validate

2. **Our FSE System:**
   - Tracks FSE templates (`wp_template` posts)
   - Stores mappings in our own options
   - Uses slug-based lookups

### Implementation

#### 1. Removed Voxel Config Modifications

**File: `design-menu-integration.php`**

**Before (❌ WRONG):**
```php
// Base templates loop
if ( isset( $templates_confi[deployment](../deployment)g[ $template_type ] ) ) {
    $templates_config[ $template_type ] = $fse_template_id;  // ❌ Replaces Elementor ID
}
\Voxel\set( 'templates', $templates_config );  // ❌ Overwrites Voxel's config

// Custom templates loop
$template['id'] = $fse_template_id;  // ❌ Replaces Elementor ID
\Voxel\set( 'custom_templates', $custom_templates );  // ❌ Overwrites Voxel's config
```

**After (✅ CORRECT):**
```php
// Base templates loop
// ⭐ DON'T update Voxel's config - it tracks Elementor IDs, not FSE IDs
// We store our own mapping separately to avoid breaking Voxel's template_exists() checks
update_option( 'mw_fse_design_base_template_mapping', $fse_template_urls );

// Custom templates loop
// ⭐ DON'T call \Voxel\set('custom_templates', ...) - it would replace Elementor IDs
// Voxel's custom_templates config should only contain Elementor template info
```

#### 2. Removed AJAX Handler Config Modifications

**File: `design-menu-ajax-handlers.php`**

**Before (❌ WRONG):**
```php
// Create custom template
\Voxel\set( 'custom_templates', $custom_templates );  // ❌

// Create base template
$templates[ $template_type ] = $fse_template_id;
\Voxel\set( 'templates', $templates );  // ❌
```

**After (✅ CORRECT):**
```php
// ⭐ DON'T save to Voxel config - it should only contain Elementor template info
// Voxel will create its own Elementor template via its AJAX handler
```

#### 3. Maintained Our Own Mapping

**We store FSE template mappings separately:**

```php
// Store in our own option, not Voxel's config
update_option( 'mw_fse_design_base_template_mapping', $fse_template_urls );
```

**Mapping structure:**
```php
[
    '1488' => 'http://site.com/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-header-default&canvas=edit',
    '1489' => 'http://site.com/wp-admin/site-editor.php?postType=wp_template&postId=voxel-fse//voxel-footer-default&canvas=edit',
    // ... etc
]
```

**Key:** Elementor ID → FSE Site Editor URL

---

## Why It Works

### 1. Voxel's Template Persistence

**Before:**
```
Page Load 1: Voxel creates Elementor header (1488) → We replace with FSE ID (1490) → Voxel checks 1490 → FAILS → Creates new (1492)
Page Load 2: Voxel checks 1492 → FAILS (we replaced it again) → Creates new (1496)
```

**After:**
```
Page Load 1: Voxel creates Elementor header (1488) → We leave it alone → Voxel checks 1488 → PASSES ✅
Page Load 2: Voxel checks 1488 → PASSES ✅ → No regeneration
```

### 2. Our FSE Template Reuse

**Before:**
```
Page Load 1: Create FSE template (1490) with meta for Elementor ID 1488
Page Load 2: Elementor ID changed to 1492 → Create NEW FSE template (1491) with meta for 1492
Page Load 3: Elementor ID changed to 1496 → Create NEW FSE template (1492) with meta for 1496
```

**After:**
```
Page Load 1: Create FSE template (1490) with meta for Elementor ID 1488
Page Load 2: Elementor ID still 1488 → Reuse FSE template (1490) → Update meta if needed
Page Load 3: Elementor ID still 1488 → Reuse FSE template (1490) → Meta already correct
```

### 3. Interceptor Reliability

**Before:**
```
User clicks "Edit template" → Link has Elementor ID 1492
Interceptor looks for FSE template with meta _voxel_source_elementor_id = 1492
Not found (we created it for 1488) → Redirect fails
```

**After:**
```
User clicks "Edit template" → Link has Elementor ID 1488 (stable!)
Interceptor looks for FSE template with meta _voxel_source_elementor_id = 1488
Found! → Redirects to FSE template 1490
```

**Fallback for Default Header/Footer:**
```php
// If meta lookup fails, check if it's the active default
if ( $template_type === 'header' && $post->ID == $active_header_id ) {
    $stable_slug = 'voxel-header-default';
    // Redirect to stable slug directly
}
```

---

## Technical Details

### Template Existence Check

**Voxel's validation:**
```php
function template_exists( $template_id ) {
    return is_int( $template_id ) 
        && get_post_type( $template_id ) === 'elementor_library'  // Must be Elementor!
        && get_post_status( $template_id ) !== 'trash';
}
```

**Why our FSE IDs failed:**
- FSE templates have post type `wp_template`
- Voxel expects `elementor_library`
- `template_exists(1490)` → `FALSE` → Triggers recreation

### Config Separation

**Voxel's config structure:**
```php
\Voxel\get('templates') = [
    'header' => 1488,      // Elementor library post ID
    'footer' => 1489,      // Elementor library post ID
    '404' => 825,          // Elementor library post ID
    // ...
]
```

**Our mapping structure:**
```php
get_option('mw_fse_design_base_template_mapping') = [
    '1488' => 'site-editor.php?postId=voxel-fse//voxel-header-default',
    '1489' => 'site-editor.php?postId=voxel-fse//voxel-footer-default',
    // ...
]
```

**Key difference:**
- Voxel: Template type → Elementor ID
- Ours: Elementor ID → FSE URL

### Meta-Based Lookup

**We store the Elementor ID on the FSE template:**
```php
update_post_meta( $fse_template_id, '_voxel_source_elementor_id', $elementor_id );
```

**Interceptor uses it for reverse lookup:**
```php
$fse_template = get_posts([
    'post_type' => 'wp_template',
    'meta_query' => [[
        'key' => '_voxel_source_elementor_id',
        'value' => (string) $elementor_id,
        'compare' => '='
    ]]
]);
```

**Why this works:**
- Elementor ID is stable (no longer regenerating)
- Meta lookup is reliable
- Fallback to stable slug for default header/footer

---

## Files Modified

### 1. `design-menu-integration.php`

**Changes:**
- ❌ Removed: `$templates_config[ $template_type ] = $fse_template_id;`
- ❌ Removed: `\Voxel\set( 'templates', $templates_config );`
- ❌ Removed: `$template['id'] = $fse_template_id;`
- ❌ Removed: `\Voxel\set( 'custom_templates', $custom_templates );`
- ✅ Added: `update_option( 'mw_fse_design_base_template_mapping', $fse_template_urls );`
- ✅ Added: Comments explaining separation of concerns

**Impact:**
- Base templates (header, footer, 404, restricted, popup styles, timeline styles)
- Custom templates (term_single, term_card)

### 2. `design-menu-ajax-handlers.php`

**Changes:**
- ❌ Removed: `\Voxel\set( 'custom_templates', $custom_templates );` (create custom template)
- ❌ Removed: `\Voxel\set( 'templates', $templates );` (create base template)
- ✅ Added: Comments explaining Voxel handles its own templates

**Impact:**
- AJAX handlers for creating templates via admin UI

### 3. Files NOT Modified (Still Work Correctly)

**Post Type Templates:**
- ✅ `vue-integration.php` - Still updates `$post_type->repository->set_config()`
- ✅ `ajax-handlers.php` - Still updates post type config
- ✅ `custom-templates-handler.php` - Still updates post type config

**Why these are OK:**
- Post types use **separate config space** (`$post_type->repository->config`)
- Not the global `\Voxel\get('templates')` config
- Post types are meant to fully replace Elementor with FSE

---

## Testing & Verification

### Before Fix

**Logs showed:**
```
[20:03:58] FSE: Active header ID: 1488
[20:03:58] FSE: Created FSE template for Default Header - Elementor ID: 1488, FSE ID: 1490

[20:04:25] FSE: Active header ID: 1492  ← Changed!
[20:04:25] FSE: Created FSE template for Default Header - Elementor ID: 1492, FSE ID: 1490

[20:05:18] FSE: Active header ID: 1496  ← Changed again!
```

**Interceptor logs:**
```
[20:04:08] FSE Interceptor: Looking for FSE template with meta _voxel_source_elementor_id = 1492
[20:04:08] FSE Interceptor: Found 0 matching templates  ← Not found!
```

### After Fix

**Expected logs:**
```
[20:10:00] FSE: Active header ID: 1488
[20:10:00] FSE: CREATED FSE template for Default Header - Elementor ID: 1488, FSE ID: 1490

[20:10:30] FSE: Active header ID: 1488  ← Same!
[20:10:30] FSE: REUSED FSE template for Default Header - Elementor ID: 1488, FSE ID: 1490
[20:10:30] FSE: FSE template 1490 already has correct meta: _voxel_source_elementor_id = 1488
```

**Interceptor logs:**
```
[20:10:35] FSE Interceptor: Looking for FSE template with meta _voxel_source_elementor_id = 1488
[20:10:35] FSE Interceptor: Found 1 matching templates  ← Found!
[20:10:35] FSE Interceptor: Redirecting to FSE template: voxel-header-default
```

---

## Key Takeaways

### 1. Respect Voxel's Config Boundaries

**Never modify:**
- `\Voxel\get('templates')` - Voxel's Elementor template tracking
- `\Voxel\get('custom_templates')` - Voxel's custom template tracking

**Safe to modify:**
- `$post_type->repository->config['templates']` - Post type specific config
- `$post_type->repository->config['fse_templates']` - Our own FSE tracking

### 2. Use Separate Storage for FSE Mappings

**Store FSE mappings in:**
- `update_option( 'mw_fse_design_base_template_mapping', ... )`
- `update_option( 'mw_fse_design_custom_template_mapping', ... )`

**Not in:**
- Voxel's global config
- Voxel's custom templates config

### 3. Meta-Based Lookup is Reliable

**Store Elementor ID on FSE template:**
```php
update_post_meta( $fse_template_id, '_voxel_source_elementor_id', $elementor_id );
```

**Use for reverse lookup:**
```php
$fse_template = get_posts([
    'post_type' => 'wp_template',
    'meta_query' => [[
        'key' => '_voxel_source_elementor_id',
        'value' => (string) $elementor_id,
    ]]
]);
```

### 4. Stable Slugs for Default Templates

**For default header/footer:**
- Use stable slug: `voxel-header-default`, `voxel-footer-default`
- Fallback in interceptor if meta lookup fails
- Ensures redirect works even if meta is missing

---

## Related Documentation

- [FSE Templates Link Intercept Explained](fse-templates-link-intercept-explained.md) - How the interceptor works
- [Changing Slug Potential Issues](changing-slug-potential-issues.md) - Slug stability considerations

---

## Conclusion

The fix was simple but critical: **stop overwriting Voxel's config with FSE template IDs**. By maintaining separation between Voxel's Elementor template tracking and our FSE template system, we:

1. ✅ Prevented infinite template regeneration
2. ✅ Stabilized Elementor template IDs
3. ✅ Made interceptor redirects reliable
4. ✅ Reduced database bloat
5. ✅ Maintained compatibility with Voxel's template system

**The key insight:** Voxel's `template_exists()` only validates Elementor library posts. By storing FSE IDs in Voxel's config, we broke that validation, causing Voxel to think templates didn't exist and recreate them endlessly.

