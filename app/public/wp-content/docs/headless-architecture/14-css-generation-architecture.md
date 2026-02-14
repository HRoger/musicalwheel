# CSS Generation Architecture: WordPress Preview to Next.js

**Date:** February 2026
**Status:** Active Implementation
**Related:** 01-accelerated-option-c-plus-strategy.md, 04-nextjs-wordpress-code-sharing.md

---

## Overview

This document explains the CSS generation architecture for block styling across the WordPress Preview (PHP) and future Next.js headless implementation.

---

## The Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: SOURCE OF TRUTH                                       │
│                                                                 │
│  styles.ts (TypeScript)                                         │
│  Location: app/blocks/src/{block}/styles.ts                     │
│  Purpose: All CSS generation logic lives here                   │
│  Used by: edit.tsx for Gutenberg editor preview                 │
│  Status: PERMANENT - survives transition to headless            │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  LAYER 2: PHP SHIM       │    │  LAYER 3: NEXT.JS        │
│  (Transitional Preview)  │    │  (Future Production)     │
├──────────────────────────┤    ├──────────────────────────┤
│  style-generator.php     │    │  generateBlockStyles.ts  │
│                          │    │                          │
│  Location:               │    │  Location:               │
│  app/blocks/shared/      │    │  apps/frontend/utils/    │
│  style-generator.php     │    │  styles/                 │
│                          │    │                          │
│  Purpose:                │    │  Purpose:                │
│  PHP Preview rendering   │    │  Final headless frontend │
│                          │    │                          │
│  Status:                 │    │  Status:                 │
│  TRANSITIONAL - will be  │    │  PERMANENT - direct port │
│  deprecated when Next.js │    │  of styles.ts logic      │
│  is ready                │    │                          │
└──────────────────────────┘    └──────────────────────────┘
```

---

## Why PHP CSS Generation Exists

### The Problem: Gutenberg Block Validation

Gutenberg blocks use a `save()` function that outputs static HTML. When CSS is embedded via `<style>` tags in `save.tsx`:

1. CSS contains dynamic content (blockId, attribute values)
2. Gutenberg validation compares saved HTML with expected output
3. Dynamic content causes validation mismatch
4. Gutenberg strips or ignores the CSS

**Result:** CSS rules exist in `styles.ts` but never reach the frontend.

### The Solution: PHP Injection via render_block Filter

Instead of embedding CSS in `save.tsx`, we:

1. Generate CSS server-side in PHP (`style-generator.php`)
2. Inject CSS via WordPress `render_block` filter
3. CSS is added at render time, bypassing Gutenberg validation

This aligns with the C+ Plan's "Transitional Shim" concept:

> "Next.js ignores `render.php` and `save.tsx`. They are 'Dev Tools' for you."
> — 01-accelerated-option-c-plus-strategy.md

---

## File Architecture

### Single Shared File (style-generator.php)

```
app/blocks/shared/style-generator.php
├── Shared Utilities
│   ├── generate_typography_css()
│   ├── generate_dimensions_css()
│   ├── generate_border_css()
│   └── generate_box_shadow_css()
├── Shared Generators (AdvancedTab/VoxelTab)
│   ├── generate_voxel_responsive_css()
│   └── generate_advanced_responsive_css()
└── Block-Specific Methods
    ├── generate_search_form_css()    ← Added as needed
    ├── generate_post_feed_css()      ← Future
    └── generate_map_css()            ← Future
```

**Why single file?**
1. Shared utilities are reused across blocks
2. Consistent patterns across all blocks
3. Easier to port to Next.js (one file to reference)

---

## Data Flow: WordPress Preview (Current)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    edit.tsx     │     │   Block_Loader  │     │  Frontend HTML  │
│   (Editor)      │     │   render_block  │     │   + <style>     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Uses styles.ts  │     │ Calls style-    │     │ CSS injected    │
│ for real-time   │     │ generator.php   │     │ at render time  │
│ editor preview  │     │ for PHP preview │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   Editor Preview          PHP Generation          Final Output
   (Gutenberg)             (server-side)           (frontend)
```

### Integration Point: Block_Loader.php

```php
// Block_Loader.php::apply_voxel_tab_features()

// Search Form block CSS injection
if ($block_name === 'search-form' && $block_id) {
    $block_content = self::apply_search_form_styles($block_content, $attributes, $block_id);
}

// Method implementation
private static function apply_search_form_styles($block_content, $attributes, $block_id) {
    $css = Style_Generator::generate_search_form_css($attributes, $block_id);

    if (!empty($css)) {
        // Inject <style> tag before closing </div>
        $style_tag = '<style>' . $css . '</style>';
        $block_content = preg_replace('/(<\/div>\s*)$/', $style_tag . '$1', $block_content, 1);
    }

    return $block_content;
}
```

---

## Data Flow: Next.js (Future)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GraphQL Query  │     │   Component     │     │  Rendered HTML  │
│  (attributes)   │     │   + Styles      │     │   + <style>     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ Fetches block   │     │ Imports         │     │ CSS generated   │
│ attributes from │────▶│ generateBlock   │────▶│ client-side     │
│ WordPress       │     │ Styles.ts       │     │ or SSR          │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Next.js Implementation Pattern

```typescript
// apps/frontend/utils/styles/generateBlockStyles.ts
// Direct port of styles.ts logic (NOT style-generator.php)

import { generateTypographyCSS } from './typography';
import { generateDimensionsCSS } from './dimensions';
import { generateBoxShadowCSS } from './boxShadow';

export function generateSearchFormCSS(
    attributes: SearchFormAttributes,
    blockId: string
): string {
    const cssRules: string[] = [];
    const selector = `.voxel-fse-search-form-${blockId}`;

    // Same logic as styles.ts
    if (attributes.commonHeight !== undefined) {
        cssRules.push(`${selector} .ts-form-group .ts-filter { min-height: ${attributes.commonHeight}px; }`);
    }

    if (attributes.commonBackgroundColor) {
        cssRules.push(`${selector} .ts-form-group .ts-filter { background-color: ${attributes.commonBackgroundColor}; }`);
    }

    // ... rest of the rules (port directly from styles.ts)

    return cssRules.join('\n');
}
```

### Next.js Component Usage

```tsx
// apps/frontend/components/blocks/SearchForm.tsx

import { generateSearchFormCSS } from '@/utils/styles/generateBlockStyles';

export function SearchFormBlock({ attributes }: { attributes: SearchFormAttributes }) {
    const css = generateSearchFormCSS(attributes, attributes.blockId);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div className={`voxel-fse-search-form-${attributes.blockId}`}>
                {/* Component content */}
            </div>
        </>
    );
}
```

---

## Portal Elements: Special Handling

Elements rendered via React `createPortal()` (popups, dropdowns, switcher) render at `document.body`, outside the block's DOM tree.

### The Problem

Block-scoped CSS selectors cannot reach portal content:

```css
/* This selector cannot reach portal content */
.voxel-fse-search-form-abc123 .ts-popup { ... }

/* Because portal renders here: */
<body>
  <div class="voxel-fse-search-form-abc123">...</div>  <!-- Block -->
  <div class="voxel-popup-abc123">                     <!-- Portal (sibling!) -->
    <div class="ts-popup">...</div>
  </div>
</body>
```

### The Solution

1. Add scoping class to portal wrapper
2. Generate CSS targeting portal class separately

**React Component:**
```tsx
<FieldPopup className={`voxel-popup-${blockId}`}>
    {content}
</FieldPopup>
```

**PHP Generation:**
```php
$portal_selector = '.voxel-popup-' . $block_id;
$css_rules[] = "{$portal_selector} .ts-popup { background: {$value}; }";
```

**Next.js Generation:**
```typescript
const portalSelector = `.voxel-popup-${blockId}`;
cssRules.push(`${portalSelector} .ts-popup { background: ${attributes.popupBackground}; }`);
```

---

## Migration Status

### PHP Migration Progress (style-generator.php)

| Block | Migrated Sections | Total Sections | Status |
|-------|------------------|----------------|--------|
| search-form | 24 (ALL) | 24 | ✅ 100% |
| post-feed | 0 | ~10 | 0% |
| map | 0 | ~8 | 0% |
| timeline | 0 | ~5 | 0% |
| gallery | 0 | ~6 | 0% |
| slider | 0 | ~5 | 0% |
| create-post | 0 | ~15 | 0% |
| product-form | 0 | ~12 | 0% |
| messages | 0 | ~8 | 0% |
| advanced-list | 0 | ~6 | 0% |

### search-form Migration Details (Completed Feb 2025)

All 24 CSS sections have been migrated to PHP:

**CONTENT TAB (3 sections):**
- Post type filter width
- Search button width
- Reset button width

**GENERAL TAB (5 sections):**
- General section (filter height, gap, alignment)
- Common Styles (background, border, typography, icons)
- Button section (normal, hover, filled states)
- Search Button (normal, hover states)
- Map/Feed Switcher (portal element - special selector handling)

**INLINE TAB (14 sections):**
- Terms: Inline (title, icon, chevron - normal/hover/selected)
- Terms: Buttons (gap, background, border, typography)
- Geolocation Icon (size, background, border, icon)
- Stepper (input value size)
- Stepper Buttons (size, icon, background, border)
- Range Slider (value, track, handle)
- Switcher on/off (inactive/active/handle backgrounds)
- Checkbox (size, radius, border, checked states)
- Radio (size, radius, border, checked states)
- Input (text color, placeholder, padding, focus states)
- Toggle Button (typography, size, padding, colors, border, states)
- Toggle: Active Count (text color, background, margin)
- Term Count (number color, border color)
- Other (max filter width, min input width)

**PORTAL/POPUP CSS (3 sections):**
- Popups: Custom Style (backdrop, shadow, margins, max height)
- Filter-Level Popup: Center Position
- Filter-Level Popup: Multi-Column Menu

### Priority Order

1. **HIGH:** search-form (most complex, most user-visible)
2. **HIGH:** post-feed (common block)
3. **MEDIUM:** create-post, product-form (forms)
4. **MEDIUM:** map, timeline, gallery, slider (media)
5. **LOW:** messages, advanced-list (specialized)

---

## Comparison: WordPress vs Next.js Implementation

| Aspect | WordPress Preview | Next.js Production |
|--------|-------------------|-------------------|
| **Source of Truth** | styles.ts | styles.ts (ported) |
| **CSS Generation** | style-generator.php | generateBlockStyles.ts |
| **Injection Method** | render_block filter | Component render |
| **Portal Handling** | PHP generates portal CSS | Same pattern in JS |
| **Responsive CSS** | Media queries in string | Same pattern |
| **Editor Preview** | styles.ts directly | N/A (no WP editor) |

---

## Key Principles

### 1. styles.ts is the Source of Truth

All CSS generation logic should first be implemented in `styles.ts`. The PHP version is a **manual port** for transitional preview.

### 2. PHP is Transitional

`style-generator.php` exists solely to enable PHP Preview during development. When Next.js is ready:
- PHP generation can be deprecated
- Next.js ports directly from `styles.ts`
- PHP files become dead code (can be removed)

### 3. Port from TypeScript, Not PHP

When building Next.js:
```
❌ style-generator.php → generateBlockStyles.ts  (Don't do this)
✅ styles.ts → generateBlockStyles.ts            (Do this)
```

The TypeScript version is cleaner, type-safe, and the actual source of truth.

### 4. Maintain Parity During Transition

During the transition period, CSS should look identical whether rendered by:
- PHP Preview (style-generator.php)
- Next.js Production (generateBlockStyles.ts)
- Gutenberg Editor (styles.ts)

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [01-accelerated-option-c-plus-strategy.md](01-accelerated-option-c-plus-strategy.md) | Overall C+ architecture |
| [04-nextjs-wordpress-code-sharing.md](04-nextjs-wordpress-code-sharing.md) | Code sharing patterns |
| [nextjs-utilities/README.md](nextjs-utilities/README.md) | Ported utilities reference |
| [/wire:audit command](../../.claude/commands/wire/audit.md) | CSS output path verification |

---

## Appendix: CSS Output Path Verification

When auditing blocks, verify CSS reaches the frontend:

```markdown
| Section | styles.ts | style-generator.php | Output Path | Status |
|---------|-----------|---------------------|-------------|--------|
| Switcher | ✅ L1431 | ✅ L986 | PHP render_block | ✅ WORKS |
| Common Styles | ✅ L355 | ❌ MISSING | save.tsx (stripped) | ❌ BROKEN |
| Search Button | ✅ L585 | ❌ MISSING | save.tsx (stripped) | ❌ BROKEN |
```

Use `/wire:audit {block} --check=css-output` to run this verification.
