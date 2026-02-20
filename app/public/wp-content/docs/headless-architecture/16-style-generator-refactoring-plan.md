# Style Generator Refactoring Plan (End of Phase 2)

**Date:** February 2026
**Status:** Planned (execute at end of Phase 2)
**Priority:** Required before Phase 3 (headless Next.js)
**Related:** 14-css-generation-architecture.md, 04-nextjs-wordpress-code-sharing.md

---

## Why This Refactoring Is Necessary

### The Problem

`app/blocks/shared/style-generator.php` is a monolithic file that contains CSS generation logic for **all blocks** in a single 2400+ line file. As more blocks complete Phase 2 conversion, this file will continue to grow.

### Why It Blocks the Headless Migration

1. **Next.js won't use PHP.** Styles need to be generated client-side (TS) or via SSR. A single monolithic PHP file is impossible to port incrementally — it forces an all-or-nothing rewrite.

2. **Per-block files enable incremental migration.** If each block has its own style generator, the headless migration becomes block-by-block: port `map/style-generator.php` to `map/styles.ts`, test it, move on. The monolith prevents this.

3. **Shared utilities get duplicated or entangled.** Functions like `generate_typography_css()` and `generate_dimensions_css()` are reusable across blocks, but they're buried in the same file as block-specific logic. When porting to Next.js, you'd need to untangle shared from block-specific.

4. **`styles.ts` is already per-block.** The TypeScript source of truth (`app/blocks/src/{block}/styles.ts`) is already organized per-block. The PHP counterpart should mirror this structure for 1:1 porting.

---

## Current Structure (Monolithic)

```
app/blocks/shared/
└── style-generator.php          # ~2400+ lines, ALL blocks
    ├── Shared utilities (typography, dimensions, border, box-shadow)
    ├── Shared generators (AdvancedTab, VoxelTab responsive CSS)
    ├── search-form CSS (~500 lines)
    ├── map CSS (~300 lines)
    ├── post-feed CSS (~200 lines)
    ├── gallery CSS (~150 lines)
    └── ... every other block
```

## Target Structure (Per-Block)

```
app/blocks/shared/
├── style-generator.php              # Thin orchestrator (~100 lines)
│   ├── Loads shared utilities
│   ├── Routes to per-block generators
│   └── Handles render_block filter
├── styles/
│   ├── shared-utilities.php         # generate_typography_css(), etc.
│   ├── advanced-tab-styles.php      # AdvancedTab responsive CSS
│   ├── voxel-tab-styles.php         # VoxelTab responsive CSS
│   └── blocks/
│       ├── search-form.php          # generate_search_form_css()
│       ├── map.php                  # generate_map_css()
│       ├── post-feed.php            # generate_post_feed_css()
│       ├── gallery.php              # generate_gallery_css()
│       ├── timeline.php             # generate_timeline_css()
│       ├── slider.php               # generate_slider_css()
│       ├── create-post.php          # generate_create_post_css()
│       ├── product-form.php         # generate_product_form_css()
│       └── ...per block
```

### Mirrors TypeScript Structure

| PHP (style generation) | TypeScript (source of truth) |
|------------------------|------------------------------|
| `styles/blocks/map.php` | `src/map/styles.ts` |
| `styles/blocks/search-form.php` | `src/search-form/styles.ts` |
| `styles/shared-utilities.php` | `shared/utils/styleUtils.ts` |
| `styles/advanced-tab-styles.php` | `shared/utils/generateAdvancedStyles.ts` |

---

## Refactoring Steps

### Step 1: Extract shared utilities (~30 min)

Move reusable functions to `styles/shared-utilities.php`:
- `generate_typography_css()`
- `generate_dimensions_css()`
- `generate_border_css()`
- `generate_box_shadow_css()`
- `generate_color_css()`
- Any other functions used by 2+ blocks

### Step 2: Extract AdvancedTab/VoxelTab generators (~20 min)

Move shared tab generators to dedicated files:
- `styles/advanced-tab-styles.php` — `generate_advanced_responsive_css()`
- `styles/voxel-tab-styles.php` — `generate_voxel_responsive_css()`

### Step 3: Extract per-block generators (~15 min each)

For each block, move its `generate_{block}_css()` method to `styles/blocks/{block}.php`. Each file:
- Includes `shared-utilities.php`
- Contains a single public function
- Mirrors the structure of the corresponding `styles.ts`

### Step 4: Convert monolith to orchestrator (~20 min)

Reduce `style-generator.php` to:
- `require_once` for shared utilities
- A routing method that loads the correct per-block file
- The `render_block` filter integration

### Step 5: Verify zero behavior change

- Build: `npm run build`
- Compare frontend CSS output before/after for each block
- Run existing type-check: `npm run type-check`

---

## Timing

**When:** After all Phase 2 block conversions are complete, before any Phase 3 headless work begins.

**Why end of Phase 2:**
- All blocks are converted and stable — no moving target
- Full scope of per-block CSS requirements is known
- Refactor is purely structural (split file, no behavior changes)
- Low risk: each extraction is mechanical, testable

**Estimated effort:** 1-2 sessions (2-4 hours)

**Why not now:**
- Blocks are still being actively converted
- The monolith is still growing (new blocks adding sections)
- Splitting now means maintaining the split structure while adding new blocks
- Better to split once when the full picture is complete

---

## Headless Migration Benefit

With per-block PHP files, the Next.js port becomes:

```
Phase 3 Block Migration (per block):

1. Read styles/blocks/map.php           # PHP reference
2. Read src/map/styles.ts               # TS source of truth
3. Port to apps/frontend/styles/map.ts  # Next.js version
4. Test: compare CSS output
5. Done — move to next block
```

Without this refactoring, the port would be:

```
1. Read ALL of style-generator.php (2400+ lines)
2. Mentally isolate map-specific sections
3. Cross-reference with src/map/styles.ts
4. Port while avoiding accidentally including other block logic
5. Repeat for every block, re-reading the same 2400-line file each time
```

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking existing CSS output | Git diff before/after, visual comparison |
| Missing a function dependency | PHP will error immediately on missing function |
| Autoloader conflicts with Voxel | All files use `VoxelFSE\` namespace, `fse-` prefix |
| Build process changes needed | No — PHP files are not part of Vite build |

---

## Related Documentation

| Document | Relevance |
|----------|-----------|
| [14-css-generation-architecture.md](14-css-generation-architecture.md) | Current architecture, three-layer model |
| [04-nextjs-wordpress-code-sharing.md](04-nextjs-wordpress-code-sharing.md) | Code sharing strategy between WP and Next.js |
| [01-accelerated-option-c-plus-strategy.md](01-accelerated-option-c-plus-strategy.md) | Overall C+ plan, transitional shim concept |
