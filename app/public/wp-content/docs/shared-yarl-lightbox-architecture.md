# Shared YARL Lightbox Architecture

**Date:** February 2026
**Status:** Implemented
**Blocks Using It:** timeline, gallery, slider, image

> **Note:** post-feed was removed from lightbox blocks because it uses a native CSS scroll-snap carousel, not YARL lightbox. YARL has a carousel mode (https://yet-another-react-lightbox.com/examples/carousel) that could be integrated later if needed.

---

## Overview

YARL (Yet Another React Lightbox) is loaded as a **shared global dependency** following Voxel's Swiper pattern. Instead of each block bundling its own copy of YARL (~43KB), a single IIFE bundle is registered with WordPress and enqueued once per page. All blocks use a shared imperative API on `window.VoxelLightbox`.

### Why This Pattern

Voxel treats Swiper as a shared global:

```
Elementor registers:  wp_register_script('swiper', ...)     <- loaded ONCE
Each widget declares:  get_script_depends() => ['swiper']    <- dependency only
```

We do the same with YARL:

```
Block_Loader registers:  wp_register_script('mw-yarl-lightbox', ...)  <- loaded ONCE
Each block enqueues:     wp_enqueue_script('mw-yarl-lightbox')        <- on demand
Block frontends call:    window.VoxelLightbox.open(slides, index)     <- global API
```

---

## Architecture Diagram

```
+-----------------------------------------------------+
| assets/dist/yarl-lightbox.js  (IIFE, ~44KB)         |
|  - YARL core + Zoom + Fullscreen plugins             |
|  - React LightboxRoot component (portal)             |
|  - window.VoxelLightbox = { open(), close() }        |
|  - Depends on: react, react-dom (WordPress globals)  |
|  - Loaded ONCE via WordPress dependency system        |
+-----------------------------------------------------+
| assets/dist/yarl-lightbox.css  (~8KB)                |
|  - YARL styles + VoxelLightbox overrides             |
|  - Depends on: vx:commons.css (cascade order)        |
|  - Loaded ONCE via WordPress dependency system        |
+-----------------------------------------------------+
         ^                    ^
         | script dep         | style dep
    +----+----+          +----+----+
    |timeline |          |gallery  |  (+ image, slider)
    |frontend |          |frontend |
    |  .js    |          |  .js    |
    +---------+          +---------+
    Calls: window.VoxelLightbox.open(slides, idx)
    Does NOT import YARL -- zero duplication
```

---

## File Inventory

| File | Purpose |
|------|---------|
| `app/blocks/shared/components/Lightbox/lightbox-frontend.tsx` | Standalone IIFE entry point, mounts React portal, exposes `window.VoxelLightbox` |
| `app/blocks/shared/components/Lightbox/VoxelLightbox.tsx` | Controlled React component for editor ESM context |
| `app/blocks/shared/components/Lightbox/VoxelLightbox.css` | CSS overrides for dark overlay, z-index, SVG path fix |
| `app/blocks/shared/components/Lightbox/types.ts` | Shared TypeScript interfaces (`LightboxSlide`, `VoxelLightboxProps`) |
| `app/blocks/shared/components/Lightbox/index.ts` | Barrel exports |
| `vite.yarl.config.js` | Vite config for IIFE build |
| `scripts/build-yarl-css.js` | Node script that concatenates YARL core CSS + overrides |
| `app/blocks/Block_Loader.php` | WordPress registration and enqueue logic |

---

## Build Pipeline

### Build Commands (package.json)

```json
"build": "vite build --config vite.blocks.config.js && npm run build:yarl && npm run build:frontend",
"build:yarl": "npm run build:yarl-js && npm run build:yarl-css",
"build:yarl-js": "vite build --config vite.yarl.config.js",
"build:yarl-css": "node scripts/build-yarl-css.js"
```

**Execution order matters:**
1. `vite.blocks.config.js` - Editor builds (wipes `assets/dist/`)
2. `build:yarl` - YARL JS + CSS (writes into `assets/dist/`)
3. `build:frontend` - Per-block frontend IIFEs (writes into `app/blocks/src/{block}/`)

### JS Build (vite.yarl.config.js)

- **Entry:** `app/blocks/shared/components/Lightbox/lightbox-frontend.tsx`
- **Output:** `assets/dist/yarl-lightbox.js` (IIFE format)
- **Externals:** `react` -> `window.React`, `react-dom` -> `window.ReactDOM`, `react-dom/client` -> `window.ReactDOM`
- **Includes:** YARL core + Zoom plugin + Fullscreen plugin
- **Size:** ~44KB (~16KB gzipped)

### CSS Build (scripts/build-yarl-css.js)

Concatenates two files:
1. `node_modules/yet-another-react-lightbox/dist/styles.css` (YARL core)
2. `app/blocks/shared/components/Lightbox/VoxelLightbox.css` (overrides)

**Output:** `assets/dist/yarl-lightbox.css` (~8KB)

---

## WordPress Registration (Block_Loader.php)

### Script Registration (~line 469)

```php
if (!wp_script_is('mw-yarl-lightbox', 'registered')) {
    $yarl_js_path = get_stylesheet_directory() . '/assets/dist/yarl-lightbox.js';
    if (file_exists($yarl_js_path)) {
        wp_register_script('mw-yarl-lightbox',
            get_stylesheet_directory_uri() . '/assets/dist/yarl-lightbox.js',
            ['react', 'react-dom'], filemtime($yarl_js_path), true);
    }
}
```

### Style Registration (~line 453)

```php
if (!wp_style_is('mw-yarl-lightbox', 'registered')) {
    $yarl_css_path = get_stylesheet_directory() . '/assets/dist/yarl-lightbox.css';
    if (file_exists($yarl_css_path)) {
        wp_register_style('mw-yarl-lightbox',
            get_stylesheet_directory_uri() . '/assets/dist/yarl-lightbox.css',
            ['vx:commons.css'], filemtime($yarl_css_path));
    }
}
```

**CSS depends on `vx:commons.css`** so it loads AFTER in the cascade, naturally overriding Voxel's `:where(path) { fill: inherit }` rule that breaks YARL's SVG navigation icons.

### Frontend Enqueue (~line 3720)

```php
$lightbox_blocks = ['timeline', 'gallery', 'slider', 'image', 'post-feed'];
if (in_array($block_name, $lightbox_blocks, true)) {
    add_action('wp_enqueue_scripts', function () {
        self::ensure_voxel_styles_registered();
        if (wp_script_is('mw-yarl-lightbox', 'registered')) {
            wp_enqueue_script('mw-yarl-lightbox');
        }
        if (wp_style_is('mw-yarl-lightbox', 'registered')) {
            wp_enqueue_style('mw-yarl-lightbox');
        }
    });
}
```

Enqueued via `wp_enqueue_scripts` hook (not as `viewScript` dependency) because the script handle may not be resolved at block registration time.

### Editor Enqueue (~line 3733)

```php
add_action('enqueue_block_editor_assets', function () {
    if (wp_script_is('mw-yarl-lightbox', 'registered') && !wp_script_is('mw-yarl-lightbox', 'enqueued')) {
        wp_enqueue_script('mw-yarl-lightbox');
    }
    if (wp_style_is('mw-yarl-lightbox', 'registered') && !wp_style_is('mw-yarl-lightbox', 'enqueued')) {
        wp_enqueue_style('mw-yarl-lightbox');
    }
}, 25);
```

This provides `window.VoxelLightbox` in the Gutenberg editor context too, so the same global API works in both frontend and editor. Priority 25 ensures it loads after editor styles (priority 20).

---

## Global API (window.VoxelLightbox)

### Interface

```typescript
interface LightboxSlide {
    src: string;
    alt?: string;
    title?: string;
    description?: string;
}

interface VoxelLightboxAPI {
    open(slides: LightboxSlide[], index?: number): void;
    close(): void;
}
```

### How It Works (lightbox-frontend.tsx)

1. On first `open()` call, a `<div id="voxel-lightbox-root">` is appended to `document.body`
2. A React root is created and renders `<LightboxRoot />` into it (deferred mounting)
3. Module-scoped setter functions (`_setOpen`, `_setSlides`, `_setIndex`) bridge the imperative API to React state
4. Subsequent `open()` calls just update state without re-mounting

### Usage in Block Frontends

```typescript
const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    const lightbox = (window as any).VoxelLightbox;
    if (lightbox) {
        lightbox.open(slides, index);
    }
};
```

Block frontends do NOT import YARL. They only call the global API. This means zero YARL code in per-block bundles.

---

## CSS Overrides (VoxelLightbox.css)

Key overrides needed because Voxel's global CSS interferes with YARL:

| Override | Reason |
|----------|--------|
| `--yarl__color_backdrop: rgba(0,0,0,0.9)` | Dark overlay matching Voxel's lightbox style |
| `z-index: 100000` | Above Voxel popups (99999) |
| `path[fill="none"] { fill: none !important }` | Voxel's `:where(path) { fill: inherit }` makes all SVG paths visible, breaking YARL navigation icons |
| `path:not([fill="none"]) { fill: currentColor }` | Restore visible icon paths |

---

## Adding Lightbox to a New Block

To add lightbox support to a new block:

1. **Block_Loader.php:** Add block name to `$lightbox_blocks` array in both the frontend enqueue section (~line 3675) and editor enqueue section (~line 4150)

2. **Frontend code:** Call the global API:
   ```typescript
   const slides = images.map(img => ({ src: img.url, alt: img.alt }));

   const handleClick = (e: React.MouseEvent, index: number) => {
       e.preventDefault();
       const lightbox = (window as any).VoxelLightbox;
       if (lightbox) {
           lightbox.open(slides, index);
       }
   };
   ```

3. **No imports needed.** No YARL dependency in the block's frontend build.

---

## Troubleshooting

### "Missing Dependencies mw-yarl-lightbox"

Do NOT add `mw-yarl-lightbox` as a `viewScript` dependency or CSS `$style_deps`. The handle may not be registered yet when WordPress resolves block dependencies. Instead, use the `wp_enqueue_scripts` hook pattern shown above.

### SVG Navigation Icons Not Visible

Check that `yarl-lightbox.css` loads AFTER `vx:commons.css`. The CSS registration depends on `vx:commons.css` for cascade order. If Voxel's `:where(path) { fill: inherit }` rule loads later, navigation arrows become invisible.

### Lightbox Not Opening in Editor

Ensure `mw-yarl-lightbox` is enqueued in the `enqueue_block_editor_assets` action for your block. The editor uses the same `window.VoxelLightbox` global as the frontend.

### Orphaned Reposts Causing 500 Errors

Voxel parent theme (`status.php:841`) has a bug where `get_repost_of()` returns null for deleted statuses but calls `->get_frontend_config()` on it without a null check. This causes HTTP 500 on Load More pagination when orphaned reposts exist. To find and clean them:

```sql
-- Find orphaned reposts (replace wp_9_ with your subsite prefix)
SELECT t1.id, t1.repost_of
FROM wp_9_voxel_timeline t1
LEFT JOIN wp_9_voxel_timeline t2 ON t1.repost_of = t2.id
WHERE t1.repost_of IS NOT NULL AND t2.id IS NULL;

-- Delete orphaned reposts
DELETE t1 FROM wp_9_voxel_timeline t1
LEFT JOIN wp_9_voxel_timeline t2 ON t1.repost_of = t2.id
WHERE t1.repost_of IS NOT NULL AND t2.id IS NULL;
```
