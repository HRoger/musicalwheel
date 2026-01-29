# Gutenberg Editor Rendering Guide

**Last Updated:** November 2025
**Context:** Popup Kit Block Development

## Overview

This guide documents best practices for rendering blocks in the Gutenberg editor, particularly when dealing with server-side rendering, viewport changes, and matching Voxel theme behavior.

---

## Key Learnings from Popup Kit Block

### 1. Understanding ServerSideRender

**What is ServerSideRender?**
- WordPress component that renders blocks via REST API (`/wp/v2/block-renderer/{block-name}`)
- Runs in AJAX context, separate from main editor page load
- Shows a live preview of server-rendered output in the editor

**When to use it:**
- ✅ When you need to show complex server-side template output
- ✅ When matching parent theme templates (like Voxel's popup-kit.php)
- ✅ When block output depends on WordPress functions not available in React

**When NOT to use it:**
- ❌ For simple blocks with client-side-only logic
- ❌ When you need real-time interactivity (use React components instead)
- ❌ For performance-critical blocks (REST API adds latency)

**Basic usage:**
```tsx
import ServerSideRender from '@wordpress/server-side-render';

<ServerSideRender
    block="voxel-fse/my-block"
    attributes={attributes}
/>
```

---

### 2. Viewport Changes in Gutenberg Editor

**The Problem:**
When clicking Desktop/Tablet/Mobile preview buttons in the editor, how do you make blocks respond?

**Common Mistake:**
Trying to force ServerSideRender to re-render on viewport change using:
- ❌ Updating temporary attributes (doesn't work reliably)
- ❌ Changing the `key` prop (forces remount but doesn't solve responsive preview)
- ❌ Listening to custom events (overcomplicated)

**The Correct Approach: Match Voxel's Behavior**

Voxel intentionally **hides** popup previews on tablet/mobile because:
1. Popups are **modal overlays**, not responsive page content
2. They appear as overlays at all viewport sizes
3. The preview is for **styling**, not responsive layout testing

**Evidence from Voxel Elementor:**
```php
// themes/voxel/templates/widgets/popup-kit.php
<!-- The markup on this page is entirely static for preview purposes -->
<div class="popup-kit-holder">
   <style type="text/css">
      @media (max-width:1024px) {
          .popup-kit-holder, .popup-kit-holder1 {
              display: none !important;
          }
      }
   </style>
</div>
```

**Implementation:**
```css
/* editor.css */
/* Let Voxel's media queries hide the preview on tablet/mobile */
/* This matches Elementor behavior where popup preview is desktop-only */
.voxel-fse-popup-kit-editor .popup-kit-holder,
.voxel-fse-popup-kit-editor .popup-kit-holder1 {
    display: flex;  /* Don't use !important - let media queries work */
    flex-direction: column;
}
```

**Result:**
- Desktop: Preview shows ✅
- Tablet/Mobile: Preview hidden (matches Voxel Elementor) ✅

---

### 3. When You DO Need Viewport-Responsive Previews

For blocks that ARE responsive page content (not modals), use this approach:

**Option A: CSS Media Queries (Simplest)**

The editor iframe respects media queries, so this works automatically:

```css
/* editor.css */
.my-block-preview {
    padding: 20px;
}

@media (max-width: 1024px) {
    .my-block-preview {
        padding: 10px;
    }
}

@media (max-width: 768px) {
    .my-block-preview {
        padding: 5px;
    }
}
```

**Option B: Detect Viewport in React (Advanced)**

Only if you need conditional rendering based on viewport:

```tsx
import { useSelect } from '@wordpress/data';

const viewportType = useSelect((select) => {
    const editPostStore = select('core/edit-post');
    if (editPostStore?.getPreviewDeviceType) {
        return editPostStore.getPreviewDeviceType();
    }

    const editSiteStore = select('core/edit-site');
    if (editSiteStore?.getPreviewDeviceType) {
        return editSiteStore.getPreviewDeviceType();
    }

    return 'Desktop';
}, []);

const viewport = viewportType ? viewportType.toLowerCase() : 'desktop';

// Now use viewport in your render logic
if (viewport === 'mobile') {
    return <MobileLayout />;
}
```

**⚠️ Important:** Only use this for blocks where viewport changes **the content**, not just the styling.

---

### 4. ServerSideRender Re-render Triggers

**What triggers ServerSideRender to refetch?**
1. ✅ Any attribute change (registered in block.json)
2. ✅ Component unmount/remount
3. ❌ URL query args changes (`urlQueryArgs` doesn't trigger refetch)
4. ❌ External state changes

**Example - Attribute Changes:**
```tsx
// This WILL trigger refetch
<ServerSideRender
    block="voxel-fse/my-block"
    attributes={attributes}  // When attributes change, refetch happens
/>

// User changes border radius in inspector
setAttributes({ borderRadius: 10 });  // Triggers refetch ✅
```

**Example - Query Args (Don't Trigger Refetch):**
```tsx
// This WON'T trigger refetch on viewport change
<ServerSideRender
    block="voxel-fse/my-block"
    attributes={attributes}
    urlQueryArgs={{
        _viewport: viewport,  // Changing this doesn't trigger refetch ❌
    }}
/>
```

**Force Remount with Key (Last Resort):**
```tsx
// Forces complete remount when viewport changes
<ServerSideRender
    key={`block-${viewport}`}  // New key = new component instance
    block="voxel-fse/my-block"
    attributes={attributes}
/>
```

**⚠️ Warning:** Forcing remount can cause flickering and poor UX. Only use when absolutely necessary.

---

### 5. Styles in Editor vs Frontend

**The Problem:**
ServerSideRender runs in AJAX context, so `wp_enqueue_style()` in render.php doesn't work.

**Solution:**
Load styles in the main editor context via block.json:

```json
{
  "editorStyle": "file:./editor.css",  // Editor-only styles
  "style": "file:./style.css"          // Frontend + Editor styles
}
```

**For Voxel Blocks:**
Voxel core styles are loaded in `Block_Loader::enqueue_voxel_core_styles()`:

```php
// app/blocks/Block_Loader.php
public function enqueue_voxel_core_styles() {
    if (is_admin() || $this->is_rest_request()) {
        // Load Voxel styles in editor context
        wp_enqueue_style('voxel-commons');
        wp_enqueue_style('voxel-popup-kit');
    }
}
```

**Override Voxel Styles:**
Use higher specificity in editor.css:

```css
/* Override Voxel's commons.css font-family */
.voxel-fse-popup-kit-editor .ts-form-group {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
}
```

---

### 6. Matching Voxel Elementor Behavior

**Rule:** Always match Voxel's Elementor widget behavior exactly.

**How to Research:**
1. Find Voxel widget file: `themes/voxel/app/widgets/{widget-name}.php`
2. Find template file: `themes/voxel/templates/widgets/{widget-name}.php`
3. Check for inline `<style>` tags in template (Voxel uses these for preview-only styles)
4. Test in Elementor editor to see actual behavior

**Example - Popup Kit:**

Voxel template has:
```php
<!-- The markup on this page is entirely static for preview purposes -->
<style>
    @media (max-width:1024px) {
        .popup-kit-holder { display: none !important; }
    }
</style>
```

Our implementation:
- ✅ Use same template via `include`
- ✅ Let media query hide on tablet/mobile
- ✅ Desktop-only preview (matches Elementor)

---

### 7. Debugging ServerSideRender Issues

**Problem: Block doesn't re-render when expected**

**Debugging checklist:**
1. Check browser console for errors
2. Check Network tab for REST API requests to `/wp/v2/block-renderer/`
3. Add logging in render.php:
```php
error_log('[Block Render] Attributes: ' . print_r($attributes, true));
```
4. Check if attributes are registered in block.json
5. Verify component is actually remounting (use React DevTools)

**Problem: Styles not applying in editor**

1. Check if styles are enqueued via `Block_Loader::enqueue_voxel_core_styles()`
2. Inspect element in browser to see which styles are applied
3. Check CSS specificity (use browser DevTools "Computed" tab)
4. Verify editor.css is loaded (check Network tab)

**Problem: Viewport changes don't work**

1. **Stop!** Do you actually need viewport-responsive preview?
2. For modals/overlays: Match Voxel's desktop-only behavior
3. For responsive content: Use CSS media queries first
4. Only detect viewport in React as last resort

---

## Best Practices Summary

### ✅ DO

1. **Match Voxel Elementor behavior exactly**
   - Research widget template first
   - Include same template file
   - Respect preview-only styles

2. **Use CSS media queries for responsive previews**
   - Simpler than React-based detection
   - Works automatically in editor iframe
   - Better performance

3. **Load styles in editor context**
   - Use block.json `editorStyle` and `style`
   - Enqueue Voxel styles via Block_Loader
   - Don't use `wp_enqueue_style()` in render.php

4. **Keep ServerSideRender simple**
   - Pass attributes only
   - Let WordPress handle caching
   - Avoid forcing remounts

5. **Document preview behavior**
   - Add comments explaining desktop-only previews
   - Reference Voxel template evidence
   - Help future developers understand why

### ❌ DON'T

1. **Don't override Voxel's intentional behavior**
   - Desktop-only previews are by design
   - Modals aren't responsive page content
   - Match parent theme patterns

2. **Don't force ServerSideRender to re-render**
   - Changing `key` causes flickering
   - Updating temporary attributes is unreliable
   - Custom events add complexity

3. **Don't use viewport detection unless necessary**
   - CSS media queries work automatically
   - React viewport detection adds overhead
   - Only use for conditional content rendering

4. **Don't enqueue styles in render.php**
   - AJAX context doesn't propagate to editor
   - Use block.json instead
   - Enqueue in Block_Loader for Voxel styles

5. **Don't assume media queries don't work**
   - Editor iframe respects media queries
   - Tablet/mobile preview works automatically
   - Test before implementing workarounds

---

## Code Templates

### Basic ServerSideRender Block

**edit.tsx:**
```tsx
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

export default function Edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
        className: 'voxel-fse-my-block-editor',
    });

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Settings', 'voxel-fse')}>
                    <TextControl
                        label={__('Title', 'voxel-fse')}
                        value={attributes.title}
                        onChange={(title) => setAttributes({ title })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <ServerSideRender
                    block="voxel-fse/my-block"
                    attributes={attributes}
                />
            </div>
        </>
    );
}
```

**render.php:**
```php
<?php
if (!defined('ABSPATH')) {
    exit;
}

// Get attributes
$title = $attributes['title'] ?? '';

// Generate CSS
$custom_css = '';
if (!empty($attributes['backgroundColor'])) {
    $custom_css .= '.my-block { background-color: ' . esc_attr($attributes['backgroundColor']) . '; }';
}

// Render output
?>
<div <?php echo get_block_wrapper_attributes(); ?>>
    <?php if (!empty($title)) : ?>
        <h2><?php echo esc_html($title); ?></h2>
    <?php endif; ?>
</div>

<?php if (!empty($custom_css)) : ?>
    <style><?php echo wp_strip_all_tags($custom_css); ?></style>
<?php endif; ?>
```

**block.json:**
```json
{
    "apiVersion": 3,
    "name": "voxel-fse/my-block",
    "title": "My Block",
    "category": "voxel",
    "attributes": {
        "title": {
            "type": "string",
            "default": ""
        },
        "backgroundColor": {
            "type": "string",
            "default": ""
        }
    },
    "editorScript": "file:./index.js",
    "editorStyle": "file:./editor.css",
    "style": "file:./style.css",
    "render": "file:./render.php"
}
```

---

## Related Documentation

- **Voxel Discovery:** `docs/voxel-discovery/` (Voxel architecture analysis)
- **Widget Conversion:** `docs/voxel-widget-block-conversion/` (Widget-to-block patterns)
- **Block Loader:** `app/blocks/Block_Loader.php` (Style enqueuing)
- **WordPress ServerSideRender:** https://developer.wordpress.org/block-editor/reference-guides/packages/packages-server-side-render/

---

## Changelog

### November 2025 - Initial Guide
- Documented ServerSideRender best practices
- Explained viewport handling in Gutenberg
- Captured Popup Kit Block learnings
- Added code templates and debugging tips

---

**Remember:** When in doubt, match Voxel's Elementor behavior. Research the parent theme widget first, test in Elementor, then implement the same behavior in Gutenberg.
