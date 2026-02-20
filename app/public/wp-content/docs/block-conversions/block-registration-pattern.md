# Block Registration Pattern (NectarBlocks Pattern)

**Last Updated:** 2026-02-13
**Status:** Mandatory for all voxel-fse blocks

---

## Problem: Viewport Flicker

When switching between Desktop/Tablet/Mobile in the Gutenberg editor, blocks that are incorrectly registered cause a visible white flash (flicker). This happens because WordPress creates/destroys an iframe for tablet/mobile previews, and mismatched block definitions between PHP and JS trigger re-renders.

## Root Causes (Fixed)

| Cause | Effect | Fix |
|---|---|---|
| Missing `...metadata` spread in `registerBlockType` | JS registration is incomplete, mismatches PHP-bootstrapped definition | Always spread `...metadata` |
| Missing `advancedTabAttributes` + `voxelTabAttributes` merge | JS has fewer attributes than PHP (which merges them via `merge_advanced_tab_attributes()`) | Always merge shared attributes |
| `apiVersion: 2` in block.json | WordPress treats the block differently in the iframed editor, causing remounts | Always use `apiVersion: 3` |

## Architecture: Single Editor Bundle

Instead of 36 separate editor scripts (one per block), all blocks are registered from a **single `editor.js` bundle**. This follows the NectarBlocks pattern.

### Why

WordPress unconditionally loads ALL registered block editor scripts via `wp_enqueue_registered_block_scripts_and_styles()`. With 36 separate ES modules, the editor does heavy work on viewport switch. A single bundle eliminates this.

### File: `app/blocks/src/editor.ts`

```typescript
// Single editor entry point — registers all voxel-fse blocks.
import './category-icon';
import './advanced-list/index';
import './cart-summary/index';
import './countdown/index';
// ... all 36 blocks
```

Every block's `index.tsx` is imported here. No block has `"editorScript"` in its `block.json`.

---

## Correct Block Registration Pattern

### `index.tsx` (MANDATORY pattern)

```typescript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';

registerBlockType(metadata.name, {
    ...metadata,                    // <-- REQUIRED: spread all block.json fields
    attributes: {
        ...metadata.attributes,     // <-- block-specific attributes
        ...advancedTabAttributes,   // <-- shared AdvancedTab attributes (~120 attrs)
        ...voxelTabAttributes,      // <-- shared VoxelTab attributes (~25 attrs)
    },
    icon: VoxelGridIcon,
    edit: Edit,
    save,
} as any);
```

### With deprecated entries

```typescript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save, { saveWithPlaceholder } from './save';
import metadata from './block.json';
import VoxelGridIcon from '@shared/VoxelGridIcon';
import { voxelTabAttributes, advancedTabAttributes } from '../../shared/controls';

const deprecated = [
    {
        attributes: metadata.attributes,
        save: saveWithPlaceholder,
    },
];

registerBlockType(metadata.name, {
    ...metadata,
    attributes: {
        ...metadata.attributes,
        ...advancedTabAttributes,
        ...voxelTabAttributes,
    },
    icon: VoxelGridIcon,
    edit: Edit,
    save,
    deprecated,
} as any);
```

---

## What Each Part Does

### `...metadata`

Spreads all fields from `block.json` into the registration: `title`, `description`, `category`, `keywords`, `supports`, `attributes`, `apiVersion`, etc. Without this, the JS-side registration is incomplete and mismatches the PHP-bootstrapped definition.

### `advancedTabAttributes` + `voxelTabAttributes`

PHP's `Block_Loader::merge_advanced_tab_attributes()` adds ~145 shared attributes (margin, padding, position, background, border, transform, visibility, sticky, loop, etc.) to every block during PHP registration. The JS side must include these same attributes to match.

- **PHP side:** `app/blocks/shared/advanced-tab-attributes.php` + `app/blocks/shared/voxel-tab-attributes.php`
- **JS side:** `app/blocks/shared/controls/AdvancedTab.tsx` + `app/blocks/shared/controls/VoxelTab.tsx`

### `as any`

TypeScript cast needed because `registerBlockType` expects specific types but our metadata object has additional fields.

---

## `block.json` Requirements

### MUST have

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "voxel-fse/block-name",
    "version": "1.0.0",
    "title": "Block Name (VX)",
    "category": "voxel-fse",
    "textdomain": "voxel-fse",
    "supports": {
        "html": false,
        "align": ["wide", "full"],
        "anchor": true,
        "className": true,
        "customClassName": true
    },
    "render": "file:./render.php",
    "viewScript": "file:./frontend.js",
    "attributes": { ... }
}
```

### MUST NOT have

- `"editorScript"` — editor scripts are loaded via the single `editor.js` bundle
- `"editorStyle"` — editor styles are loaded via `voxel-editor-combined.css`
- `"apiVersion": 2` — always use `3` for iframe compatibility

---

## CSS Loading Strategy

### Editor CSS (NectarBlocks Pattern)

All Voxel CSS for the editor is consolidated into a single `voxel-editor-combined.css` file:

- **In iframe context** (Tablet/Mobile): Inlined via `wp_add_inline_style('wp-edit-blocks', $css)` for instant rendering (zero HTTP requests)
- **On main admin page** (Desktop): Loaded via `<link>` tag for cacheability
- **Individual handles marked as "done"**: Prevents WordPress from double-loading individual CSS files

This is handled by `Block_Loader::enqueue_voxel_styles_for_iframe()` on the `enqueue_block_assets` hook.

### Editor JS

Single `editor.js` IIFE bundle loaded via `Block_Loader::enqueue_global_editor_script()` on `enqueue_block_editor_assets`.

### Frontend CSS/JS

Per-block `style.css` and `frontend.js` files remain separate (loaded only when the block is used on a page).

---

## Common Mistakes That Cause Flicker

### 1. Missing `...metadata` spread

```typescript
// BAD - causes flicker
registerBlockType(metadata.name, {
    icon: VoxelGridIcon,
    edit: Edit,
    save,
});

// GOOD - no flicker
registerBlockType(metadata.name, {
    ...metadata,
    // ...
});
```

### 2. Missing shared attributes merge

```typescript
// BAD - JS has fewer attributes than PHP
registerBlockType(metadata.name, {
    ...metadata,
    icon: VoxelGridIcon,
    edit: Edit,
    save,
});

// GOOD - JS matches PHP attribute set
registerBlockType(metadata.name, {
    ...metadata,
    attributes: {
        ...metadata.attributes,
        ...advancedTabAttributes,
        ...voxelTabAttributes,
    },
    icon: VoxelGridIcon,
    edit: Edit,
    save,
});
```

### 3. Hardcoded registration instead of using block.json

```typescript
// BAD - bypasses block.json, easy to get out of sync
registerBlockType('voxel-fse/my-block', {
    title: 'My Block',
    category: 'voxel-fse',
    edit: Edit,
    save,
});

// GOOD - uses block.json as source of truth
registerBlockType(metadata.name, {
    ...metadata,
    attributes: {
        ...metadata.attributes,
        ...advancedTabAttributes,
        ...voxelTabAttributes,
    },
    icon: VoxelGridIcon,
    edit: Edit,
    save,
});
```

### 4. Using apiVersion 2

```json
// BAD - causes flicker on viewport switch
{ "apiVersion": 2 }

// GOOD - iframe-aware, no flicker
{ "apiVersion": 3 }
```

---

## How to Add a New Block

1. Create `app/blocks/src/my-block/block.json` with `apiVersion: 3`
2. Create `app/blocks/src/my-block/index.tsx` following the exact pattern above
3. Add `import './my-block/index';` to `app/blocks/src/editor.ts`
4. Run `npm run build:editor` from the theme directory

---

## Build Commands

```bash
# From themes/voxel-fse/
npm run build:editor    # Build editor.js + editor.css only
npm run build           # Full production build (editor + frontend + all assets)
```

## References

- NectarBlocks pattern: `includes/Editor/Blocks.php` (single editor bundle)
- Block_Loader: `app/blocks/Block_Loader.php` (PHP registration + CSS loading)
- Shared attributes (PHP): `app/blocks/shared/advanced-tab-attributes.php`, `app/blocks/shared/voxel-tab-attributes.php`
- Shared attributes (JS): `app/blocks/shared/controls/AdvancedTab.tsx`, `app/blocks/shared/controls/VoxelTab.tsx`
