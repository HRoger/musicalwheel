# Headless Plugin Compatibility Analysis

**Date:** December 2025  
**Purpose:** Evaluate Gutenberg block plugins for headless WordPress compatibility  
**Reference:** `voxel-widget-conversion-master-guide.md` - Plan C+ Architecture Requirements

---

## Executive Summary

Based on the Plan C+ architecture requirements from the conversion master guide, **NONE of the evaluated plugins are fully headless-compatible** as they all use PHP rendering methods (`render_callback` or `render.php`) that cannot execute in Next.js headless frontends.

However, some plugins have **partial compatibility** with frontend JavaScript hydration, which could be enhanced to full headless support.

---

## Compatibility Criteria (from Master Guide)

### ❌ NOT Headless Compatible

According to the master guide, the following patterns **CANNOT work in headless Next.js**:

| Pattern | WordPress | Next.js (Headless) | Verdict |
|---------|-----------|-------------------|---------|
| `render.php` | ✅ Works | ❌ Cannot execute PHP | **REJECTED** |
| `render_callback` | ✅ Works | ❌ Cannot execute PHP | **REJECTED** |
| `ServerSideRender` | ✅ Works | ❌ Cannot execute PHP | **REJECTED** |

### ✅ Headless Compatible (Plan C+)

| Pattern | WordPress | Next.js (Headless) | Verdict |
|---------|-----------|-------------------|---------|
| **Plan C+ (API + React)** | ✅ Works | ✅ Works | **REQUIRED** |

**Plan C+ Requirements:**
1. ✅ NO `render.php` file
2. ✅ NO `render_callback` in block registration
3. ✅ NO `"render"` property in `block.json`
4. ✅ `save.tsx` outputs `vxconfig` JSON + placeholder HTML
5. ✅ `frontend.tsx` parses `vxconfig` and mounts React
6. ✅ Shared React component used by editor + frontend
7. ✅ REST API as single source of truth (if dynamic data needed)

---

## Plugin Analysis

### 1. Kadence Blocks (`kadence-blocks`)

**Status:** ❌ **NOT Headless Compatible**

**Evidence:**
- Uses `render_callback` for multiple blocks:
  - `class-kadence-blocks-off-canvas-trigger-block.php` (line 66)
  - `class-kadence-blocks-off-canvas-block.php` (line 66)
  - `class-kadence-blocks-header-section-block.php` (line 66)
  - `class-kadence-blocks-abstract-block.php` (line 130)
  - Form blocks use `render_callback` for CSS rendering

**Block Registration Pattern:**
```php
register_block_type(
    'kadence/block-name',
    [
        'render_callback' => array( $this, 'render_css' ),
    ]
);
```

**Headless Compatibility:** ❌ **NO** - PHP rendering cannot execute in Next.js

**Conversion Effort:** 🔴 **High** - Would require converting all blocks to Plan C+ architecture

---

### 2. GenerateBlocks (`generateblocks`)

**Status:** ❌ **NOT Headless Compatible**

**Evidence:**
- Uses `render_callback` for ALL dynamic blocks:
  - Container, Grid, Query Loop, Button Container, Headline, Button, Image
  - Text, Element, Media, Shape, Query, Looper, Query No Results, Query Page Numbers, Loop Item
- All blocks registered via `register_block_type()` with `render_callback` in `class-render-blocks.php`

**Block Registration Pattern:**
```php
register_block_type(
    'generateblocks/container',
    [
        'title' => esc_html__( 'Container', 'generateblocks' ),
        'render_callback' => [ 'GenerateBlocks_Block_Container', 'render_block' ],
    ]
);
```

**Block.json Pattern:**
- Blocks use `block.json` for metadata
- NO `"render"` property in `block.json` (good!)
- BUT blocks registered with PHP `render_callback` (bad for headless)

**Headless Compatibility:** ❌ **NO** - PHP rendering cannot execute in Next.js

**Conversion Effort:** 🔴 **Very High** - Core architecture relies on PHP rendering

---

### 3. Ultimate Addons for Gutenberg (`ultimate-addons-for-gutenberg`)

**Status:** ❌ **NOT Headless Compatible**

**Evidence:**
- Uses `render_callback` extensively:
  - Taxonomy List (`class-uagb-taxonomy-list.php` line 518)
  - Table of Contents (`class-uagb-table-of-content.php` line 1049)
  - Post Timeline (`class-uagb-post-timeline.php` line 825)
  - Post Grid/Carousel/Masonry (`class-uagb-post.php` lines 269, 369, 486)
  - Lottie (`class-uagb-lottie.php` line 139)
  - Image Gallery (`class-spectra-image-gallery.php` line 885)
  - Icon (`class-spectra-icon.php` line 387)
  - Google Map (`class-uagb-google-map.php` line 98)
  - Gravity Forms Styler (`class-uagb-gf-styler.php` line 989)
  - Contact Form 7 Styler (`class-uagb-cf7-styler.php` line 877)
  - FAQ (`class-uagb-faq.php` lines 1132, 1136)
  - Buttons Child (`class-uagb-buttons-child.php` line 62)

**Block Registration Pattern:**
```php
register_block_type(
    'uagb/block-name',
    [
        'render_callback' => array( $this, 'render_html' ),
    ]
);
```

**Headless Compatibility:** ❌ **NO** - PHP rendering cannot execute in Next.js

**Conversion Effort:** 🔴 **Very High** - Many blocks with complex PHP rendering logic

---

### 4. Ultimate Post (`ultimate-post`)

**Status:** ❌ **NOT Headless Compatible**

**Evidence:**
- Uses `render_callback` for ALL blocks:
  - Post Grid (1-7), Post List (1-4), Post Module (1-2), Post Slider (1-2)
  - Advanced Search, Advanced Filter, Advanced List
  - YouTube Gallery, News Ticker, Image, Heading, Button, Dark Light, Taxonomy
  - Builder blocks: Next/Previous, Author Box, Archive Title, Post Meta, Post Content, etc.

**Block Registration Pattern:**
```php
register_block_type(
    'ultimate-post/block-name',
    [
        'render_callback' => array( $this, 'content' ),
    ]
);
```

**Headless Compatibility:** ❌ **NO** - PHP rendering cannot execute in Next.js

**Conversion Effort:** 🔴 **Very High** - Entire plugin architecture is PHP-based

---

### 5. GutenKit Blocks Addon (`gutenkit-blocks-addon`)

**Status:** ⚠️ **PARTIAL Compatibility** (Hybrid Approach)

**Evidence:**
- Uses `render.php` for dynamic blocks:
  - `post-tab/block.json` line 253: `"render": "file:./render.php"`
  - `blog-posts/render.php` exists (referenced in translations)
- BUT also uses `viewScript` for frontend JavaScript:
  - `post-tab/block.json` line 254: `"viewScript": "file:./frontend.js"`
  - `team/block.json` line 450: `"viewScript": ["file:./frontend.js", "gutenkit-lightbox"]`
  - `nav-menu/block.json` line 541: `"viewScript": "file:./frontend.js"`
  - `fun-fact/block.json` line 296: `"viewScript": "file:./frontend.js"`
  - `container/block.json` line 212: `"viewScript": "file:./frontend.js"`
  - `back-to-top/block.json` line 193: `"viewScript": "file:./frontend.js"`

**Block Registration Pattern:**
```json
{
  "render": "file:./render.php",  // ❌ PHP rendering
  "viewScript": "file:./frontend.js"  // ✅ Frontend JS
}
```

**Analysis:**
- This is a **hybrid approach** - uses PHP for initial rendering but has frontend JavaScript
- The `viewScript` suggests some blocks may have React hydration
- However, the `render.php` dependency makes it **NOT fully headless compatible**

**Headless Compatibility:** ⚠️ **PARTIAL** - Has frontend JS but relies on PHP rendering

**Frontend.js Analysis:**
- `post-tab/frontend.js`: Vanilla JS for tab switching (event listeners)
- `container/frontend.js`: Animation helpers (scroll animations)
- `nav-menu/frontend.js`: Menu toggle functionality (hamburger, submenu)
- `team/frontend.js`: Likely popup/lightbox interactions

**Architecture Pattern:**
```
render.php → Renders HTML with PHP (WP_Query, get_categories, etc.)
frontend.js → Adds interactivity to rendered HTML (vanilla JS)
```

**Why Easier to Convert:**
1. ✅ Already has frontend JavaScript infrastructure (`viewScript`)
2. ✅ Blocks structured to separate rendering from interactivity
3. ✅ Modern build system (likely Webpack/Vite based on structure)
4. ✅ React components already exist (`edit.js` files)
5. ✅ Less to build from scratch compared to other plugins

**Conversion Effort:** 🟡 **Medium** - Would require:
1. Moving PHP rendering logic (`render.php`) to REST API endpoints
2. Creating `save.tsx` to output `vxconfig` JSON + placeholder HTML
3. Converting `frontend.js` from vanilla JS to React hydration pattern
4. Building shared React components (reuse from `edit.js` where possible)
5. Creating REST API controller for dynamic data (categories, posts, etc.)

**Estimated Conversion Steps:**
- Step 1: Create REST API endpoints (replace `render.php` logic)
- Step 2: Convert `save.js` from `return null` to output `vxconfig` JSON
- Step 3: Enhance `frontend.js` to parse `vxconfig` and mount React
- Step 4: Build shared React component (reuse/edit from `edit.js`)
- Step 5: Test in Next.js headless frontend

**Advantage Over Other Plugins:**
- Other plugins: Pure PHP rendering, no frontend JS infrastructure
- GutenKit: Already has frontend JS, just needs to be converted to React hydration

---

### 6. Spectra Pro (`spectra-pro`)

**Status:** ❌ **NOT Headless Compatible**

**Evidence:**
- Uses `render_callback` for multiple blocks:
  - Query Loop extensions (`query-loop.php` lines 100, 108, 122, 136, 150, 164, 177)
  - Register block (`blocks-config/register/block.php` line 71)
  - Login block (`blocks-config/login/block.php` line 62)
  - Instagram Feed (`blocks-config/instagram-feed/block.php` line 711)

**Block Registration Pattern:**
```php
register_block_type(
    'spectra-pro/block-name',
    [
        'render_callback' => array( $this, 'render_callback' ),
    ]
);
```

**Headless Compatibility:** ❌ **NO** - PHP rendering cannot execute in Next.js

**Conversion Effort:** 🔴 **High** - Multiple blocks with PHP rendering

---

## Summary Table

| Plugin | Headless Compatible? | Primary Issue | Conversion Effort |
|--------|---------------------|---------------|-------------------|
| **Kadence Blocks** | ❌ NO | Uses `render_callback` | 🔴 High |
| **GenerateBlocks** | ❌ NO | Uses `render_callback` for all blocks | 🔴 Very High |
| **Ultimate Addons** | ❌ NO | Uses `render_callback` extensively | 🔴 Very High |
| **Ultimate Post** | ❌ NO | Uses `render_callback` for all blocks | 🔴 Very High |
| **GutenKit Blocks** | ⚠️ PARTIAL | Uses `render.php` + `viewScript` (hybrid) | 🟡 Medium |
| **Spectra Pro** | ❌ NO | Uses `render_callback` | 🔴 High |

---

## Recommendations

### For Headless WordPress Sites

**Option 1: Use None of These Plugins**
- All evaluated plugins use PHP rendering incompatible with Next.js
- Build custom blocks using Plan C+ architecture from the master guide
- Use REST API + React hydration pattern

**Option 2: Convert GutenKit Blocks (Partial Compatibility)**
- GutenKit has the best foundation with `viewScript` support
- Could be enhanced to full Plan C+ compatibility:
  1. Remove `render.php` dependencies
  2. Implement `save.tsx` with `vxconfig` JSON output
  3. Enhance `frontend.js` to parse `vxconfig` and mount React
  4. Create REST API endpoints for dynamic data

**Option 3: Fork and Convert**
- Fork any plugin and convert blocks to Plan C+ architecture
- Follow the master guide's step-by-step conversion process
- High effort but maintains plugin functionality

### For Traditional WordPress Sites

All plugins work fine in traditional WordPress installations where PHP rendering is available.

---

## Plan C+ Conversion Checklist (from Master Guide)

If converting any plugin to headless compatibility:

- [ ] Remove all `render.php` files
- [ ] Remove all `render_callback` from block registration
- [ ] Remove `"render"` property from `block.json`
- [ ] Create `save.tsx` that outputs `vxconfig` JSON + placeholder
- [ ] Create `frontend.tsx` that parses `vxconfig` and mounts React
- [ ] Create shared React component for editor + frontend
- [ ] Create REST API endpoints (if dynamic data needed)
- [ ] Use `viewScript` in `block.json` for frontend hydration
- [ ] Test in Next.js headless frontend

---

## Conclusion

**None of the evaluated plugins are fully headless-compatible** according to Plan C+ architecture requirements. All use PHP rendering methods (`render_callback` or `render.php`) that cannot execute in Next.js headless frontends.

**GutenKit Blocks Addon** shows the most promise with its hybrid approach using both PHP rendering and frontend JavaScript, but would still require conversion to remove PHP dependencies.

For headless WordPress sites, **custom blocks built with Plan C+ architecture** are recommended, following the patterns outlined in the `voxel-widget-conversion-master-guide.md`.

---

**Document Version:** 1.0.0  
**Last Updated:** December 2025  
**Reference:** `app/public/wp-content/docs/block-conversions/voxel-widget-conversion-master-guide.md`

