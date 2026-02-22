# Gallery Widget vs Block - Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~93%
**Status:** Production-ready with responsive CSS generation gap

---

## Reference Files

| Source | File | Lines |
|--------|------|-------|
| Voxel Widget PHP | `themes/voxel/app/widgets/gallery.php` | 1-1032 |
| Voxel Template | `themes/voxel/templates/widgets/gallery.php` | 1-57 |
| Voxel CSS | `themes/voxel/assets/dist/gallery.css` | 1 (minified) |
| FSE block.json | `themes/voxel-fse/app/blocks/src/gallery/block.json` | 1-1006 |
| FSE edit.tsx | `themes/voxel-fse/app/blocks/src/gallery/edit.tsx` | 1-115 |
| FSE save.tsx | `themes/voxel-fse/app/blocks/src/gallery/save.tsx` | 1-163 |
| FSE frontend.tsx | `themes/voxel-fse/app/blocks/src/gallery/frontend.tsx` | 1-487 |
| FSE GalleryComponent | `themes/voxel-fse/app/blocks/src/gallery/shared/GalleryComponent.tsx` | 1-522 |
| FSE ContentTab | `themes/voxel-fse/app/blocks/src/gallery/inspector/ContentTab.tsx` | 1-393 |
| FSE StyleTab | `themes/voxel-fse/app/blocks/src/gallery/inspector/StyleTab.tsx` | 1-257 |
| FSE types | `themes/voxel-fse/app/blocks/src/gallery/types/index.ts` | 1-251 |
| FSE render.php | `themes/voxel-fse/app/blocks/src/gallery/render.php` | 1-12 |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP template (`templates/widgets/gallery.php`) | React + vxconfig hydration (Plan C+) |
| **State management** | None (static PHP output) | React useMemo/useCallback hooks |
| **Controls** | Elementor Controls_Manager (~38 controls) | Shared inspector controls (~53 controls incl. Advanced tab) |
| **CSS approach** | External `gallery.css` + Elementor selectors | Inline styles + CSS custom properties on `.ts-gallery-grid` |
| **Lightbox** | Elementor native lightbox (`data-elementor-*` attrs) | YARL global API (`window.VoxelLightbox.open()`) |
| **JavaScript** | None (pure PHP/CSS widget) | React hydration (~16KB gzip) |
| **AJAX** | None | None |
| **API Controller** | N/A | None needed (static data) |
| **Responsive** | Elementor CSS selectors (external stylesheet) | Inspector stores responsive attrs; **gap: no @media generation for gallery-specific props** |
| **Dynamic tags** | None (Elementor gallery control) | 27 controls support dynamic tag substitution |

---

## HTML Structure Parity

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `<ul class="ts-gallery flexify simplify-ul">` | `<ul class="ts-gallery flexify simplify-ul voxel-fse-gallery">` | ✅ (extra class for hydration selector) |
| Grid wrapper | `<div class="ts-gallery-grid">` | `<div class="ts-gallery-grid">` | ✅ |
| Image item | `<li>` | `<li style="list-style:none">` | ✅ |
| Image link | `<a href="{lightbox_url}" data-elementor-open-lightbox="yes" data-elementor-lightbox-slideshow="{id}">` | `<a href="{lightbox_url}" data-elementor-open-lightbox="yes" data-elementor-lightbox-slideshow="{id}">` | ✅ |
| Overlay div | `<div class="ts-image-overlay"></div>` | `<div class="ts-image-overlay" style="..."></div>` | ✅ (inline styles vs external CSS) |
| Image element | `<img src="{display_url}" alt="{alt}">` | `<img src="{display_url}" alt="{alt}" loading="lazy">` | ✅ (adds lazy loading) |
| View-all item | `<li class="ts-gallery-last-item">` | `<li class="ts-gallery-last-item">` | ✅ |
| View-all overlay | `<div class="ts-image-overlay">` with icon + `<p>+N</p>` | `<div class="ts-image-overlay">` with icon + `<p>+N</p>` | ✅ |
| Hidden images | `<div class="hidden"><a href="..." data-elementor-*>` | `<div class="hidden" style="display:none"><a href="..." data-elementor-*>` | ✅ |
| Empty items | `<li class="ts-empty-item"><div></div></li>` | `<li class="ts-empty-item"><div style="..."></div></li>` | ✅ |
| Auto-fit class | CSS via Elementor selectors | `.ts-gallery-autofit` class on grid div | ✅ |
| Caption data attr | `data-elementor-lightbox-description="{caption}"` | `data-elementor-lightbox-description="{caption}"` | ✅ |

**HTML Parity: 100%** — All elements present with matching CSS class names and data attributes.

---

## JavaScript Behavior Parity

| # | Voxel Behavior | FSE Implementation | Parity | Notes |
|---|---------------|-------------------|--------|-------|
| 1 | No custom JS — relies on Elementor lightbox | React hydration with YARL lightbox via `window.VoxelLightbox.open()` | ✅ | Different lightbox engine but equivalent UX |
| 2 | Static PHP rendering (no client interactivity) | `GalleryComponent.tsx` renders identical structure via React | ✅ | Same visual output |
| 3 | Elementor lightbox slideshow grouping | `data-elementor-lightbox-slideshow` attrs + YARL slides array | ✅ | Slideshow grouping works in both |
| 4 | No re-initialization needed | `initGalleryBlocks()` with `data-reactMounted` flag, Turbo/PJAX listeners | ✅ | FSE adds SPA navigation support |

**JS Parity: 100%** — No Voxel JS to match. FSE adds React hydration for dynamic rendering.

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| None | Widget has no AJAX | Block has no AJAX | ✅ |

**AJAX Parity: 100%** — Neither implementation uses AJAX.

---

## Style Controls Parity

### Images Section

| # | Voxel Control | FSE Attribute | Match |
|---|--------------|---------------|-------|
| 1 | `ts_gallery_images` (GALLERY) | `images` (GalleryUploadControl) | ✅ |
| 2 | `ts_visible_count` (NUMBER) | `visibleCount` (ResponsiveRangeControl) | ✅ |
| 3 | `ts_display_size` (SELECT, responsive) | `displaySize` (ResponsiveSelectControl) | ✅ |
| 4 | `ts_lightbox_size` (SELECT, responsive) | `lightboxSize` (ResponsiveSelectControl) | ✅ |

### Columns Section

| # | Voxel Control | FSE Attribute | Match |
|---|--------------|---------------|-------|
| 5 | `ts_gl_col_gap` (SLIDER, responsive 0-100px) | `columnGap` (ResponsiveRangeControl) | ✅ |
| 6 | `ts_gl_column_no` (NUMBER, responsive 1-6) | `columnCount` (ResponsiveRangeControl) | ✅ |
| 7 | `ts_remove_empty` (SWITCHER) | `removeEmpty` (ToggleControl) | ✅ |
| 8 | `ts_gl_autofit` (SWITCHER, conditional) | `autoFit` (ToggleControl, conditional on removeEmpty) | ✅ |

### Row Height Section

| # | Voxel Control | FSE Attribute | Match |
|---|--------------|---------------|-------|
| 9 | `ts_gl_row_height` (SLIDER, responsive 50-500px) | `rowHeight` (ResponsiveRangeControl) | ✅ |
| 10 | `aspect-ratio-row` (SWITCHER, responsive) | `useAspectRatio` (ToggleControl) | ✅ |
| 11 | `vx_paragraph_gap` (TEXT, responsive, conditional) | `aspectRatio` (ResponsiveTextControl, conditional) | ✅ |

### Mosaic Section (6 items × 4 controls × 3 responsive = 72 values)

| # | Voxel Control Pattern | FSE Attribute Pattern | Match |
|---|----------------------|----------------------|-------|
| 12 | `ts_mosaic_{N}_col` (NUMBER, responsive 1-24) | `mosaic.itemN.colSpan` (ResponsiveRangeControl 0-24) | ✅ |
| 13 | `ts_mosaic_{N}_col_start` (NUMBER, responsive 1-24) | `mosaic.itemN.colStart` (ResponsiveRangeControl 0-24) | ✅ |
| 14 | `ts_mosaic_{N}_row` (NUMBER, responsive 1-24) | `mosaic.itemN.rowSpan` (ResponsiveRangeControl 0-24) | ✅ |
| 15 | `ts_mosaic_{N}_row_start` (NUMBER, responsive 1-24) | `mosaic.itemN.rowStart` (ResponsiveRangeControl 0-24) | ✅ |

### Style - General (Normal)

| # | Voxel Control | FSE Attribute | Match |
|---|--------------|---------------|-------|
| 16 | `ts_gl_general_image_radius` (SLIDER, responsive 0-100px) | `imageBorderRadius` (ResponsiveRangeControl) | ✅ |
| 17 | `ts_gl_overlay` (COLOR) | `overlayColor` (ColorControl) | ✅ |
| 18 | `ts_gl_empty_border` (GROUP_BORDER) | `emptyBorderType` + `emptyBorderWidth` + `emptyBorderColor` (Select + Range + Color) | ✅ |
| 19 | `ts_gl_empty_radius` (SLIDER, responsive px/%) | `emptyBorderRadius` (ResponsiveRangeControl) | ✅ |
| 20 | `ts_gl_general_view_bg` (COLOR) | `viewAllBgColor` (ColorControl) | ✅ |
| 21 | `ts_gl_general_view_color` (COLOR) | `viewAllIconColor` (ColorControl) | ✅ |
| 22 | `ts_gl_general_view_icon` (ICONS) | `viewAllIcon` (AdvancedIconControl) | ✅ |
| 23 | `ts_gl_general_view_icon_size` (SLIDER, responsive 0-70px) | `viewAllIconSize` (ResponsiveRangeControl) | ✅ |
| 24 | `ts_gl_view_text` (COLOR) | `viewAllTextColor` (ColorControl) | ✅ |
| 25 | `ts_gl_view_typo` (GROUP_TYPOGRAPHY) | — | ⚠️ Missing |

### Style - General (Hover)

| # | Voxel Control | FSE Attribute | Match |
|---|--------------|---------------|-------|
| 26 | `ts_gl_overlay_h` (COLOR) | `overlayColorHover` (ColorControl) | ✅ |
| 27 | `ts_gl_general_view_bg_h` (COLOR) | `viewAllBgColorHover` (ColorControl) | ✅ |
| 28 | `ts_gl_general_view_color_h` (COLOR) | `viewAllIconColorHover` (ColorControl) | ✅ |
| 29 | `ts_gl_view_text_h` (COLOR) | `viewAllTextColorHover` (ColorControl) | ✅ |

**Control Parity: 28/29 controls matched (97%)** — 1 missing: View All Typography.

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Image gallery upload | ✅ Elementor GALLERY control | ✅ GalleryUploadControl | ✅ |
| 2 | Visible count limit | ✅ NUMBER control | ✅ ResponsiveRangeControl | ✅ |
| 3 | Display/lightbox image sizes | ✅ SELECT (responsive) | ✅ ResponsiveSelectControl | ✅ |
| 4 | Responsive columns (1-6) | ✅ NUMBER + Elementor CSS | ✅ ResponsiveRangeControl + inline styles | ⚠️ See Gap #1 |
| 5 | Column gap | ✅ SLIDER (responsive) | ✅ ResponsiveRangeControl | ⚠️ See Gap #1 |
| 6 | Remove empty / Auto-fit | ✅ SWITCHER (conditional) | ✅ ToggleControl (conditional) | ✅ |
| 7 | Row height (fixed px) | ✅ SLIDER (responsive) | ✅ ResponsiveRangeControl | ⚠️ See Gap #1 |
| 8 | Row height (aspect ratio) | ✅ TEXT (responsive, conditional) | ✅ ResponsiveTextControl (conditional) | ✅ |
| 9 | Mosaic positioning (6 items) | ✅ 24 NUMBER controls (responsive) | ✅ 24 ResponsiveRangeControls (nested mosaic) | ⚠️ See Gap #1 |
| 10 | Image border radius | ✅ SLIDER (responsive) | ✅ ResponsiveRangeControl | ⚠️ See Gap #1 |
| 11 | Overlay colors (normal/hover) | ✅ COLOR | ✅ ColorControl + StateTabPanel | ✅ |
| 12 | Empty item border styling | ✅ GROUP_BORDER + SLIDER | ✅ Select + Range + Color + ResponsiveRange | ✅ |
| 13 | View All button (bg/icon/text) | ✅ Full styling controls | ✅ Full styling controls | ✅ |
| 14 | View All typography | ✅ GROUP_TYPOGRAPHY | ❌ Not implemented | ❌ See Gap #2 |
| 15 | View All hover states | ✅ COLOR (4 controls) | ✅ ColorControl (4 controls) | ✅ |
| 16 | Lightbox with slideshow | ✅ Elementor native lightbox | ✅ YARL global API | ✅ |
| 17 | Hidden images for slideshow | ✅ `.hidden` div with anchor tags | ✅ `.hidden` div with anchor tags | ✅ |
| 18 | Empty filler items | ✅ Conditional rendering | ✅ Conditional rendering | ✅ |
| 19 | Dynamic tag support | ❌ Not available | ✅ 27 controls with dynamic tags | ✅ (FSE enhancement) |
| 20 | Responsive CSS output | ✅ Elementor handles @media queries | ⚠️ Only Advanced tab responsive works | ⚠️ See Gap #1 |
| 21 | Mobile swipe/scroll | Commented out (lines 192-288 of widget) | Not implemented | ✅ (both disabled) |
| 22 | vxconfig/headless support | N/A | ✅ normalizeConfig() dual-format | ✅ (FSE enhancement) |

---

## Identified Gaps

### Gap #1: Gallery-Specific Responsive CSS Not Generated (Severity: **Medium**)

**Voxel behavior:** Elementor generates `@media` queries for responsive controls automatically. Tablet/mobile variants of columns, gap, row height, border radius, mosaic positioning, and icon size all produce CSS at the correct breakpoints.
- Evidence: `gallery.php:73-107` (responsive SLIDER/NUMBER controls), Elementor framework generates breakpoint CSS

**FSE behavior:** Inspector controls store responsive values (`columnCount_tablet`, `columnGap_mobile`, `imageBorderRadius_tablet`, etc.) in block attributes. However, `GalleryComponent.tsx` only reads desktop values for inline styles — no `@media` queries are generated for these gallery-specific properties.
- Evidence: `GalleryComponent.tsx:339-341` (hardcoded to desktop `columnCount`/`columnGap`/`rowHeight`), `GalleryComponent.tsx:369` (hardcoded `imageBorderRadius`)

**Affected attributes (12+):**
- `columnCount_tablet`, `columnCount_mobile`
- `columnGap_tablet`, `columnGap_mobile`
- `rowHeight_tablet`, `rowHeight_mobile`
- `imageBorderRadius_tablet`, `imageBorderRadius_mobile`
- `emptyBorderRadius_tablet`, `emptyBorderRadius_mobile`
- `viewAllIconSize_tablet`, `viewAllIconSize_mobile`
- All mosaic `_tablet`/`_mobile` variants (24 values)

**Impact:** On tablet/mobile viewports, gallery uses desktop column count, gaps, and heights instead of user-specified responsive values. Users can set responsive values in the inspector but they have no effect.

**Fix:** Generate `@media` query CSS in `save.tsx` and `GalleryComponent.tsx` (similar to how Advanced tab uses `getAdvancedVoxelTabProps()` for responsive CSS). Pattern: build a `<style>` block with `@media (max-width: 1024px)` and `@media (max-width: 767px)` selectors targeting `#blockId .ts-gallery-grid`.

---

### Gap #2: View All Button Typography Missing (Severity: **Low**)

**Voxel behavior:** `ts_gl_view_typo` (GROUP_TYPOGRAPHY, line 873-880 of gallery.php) allows customizing font family, size, weight, style, line height, letter spacing for the "+N" text on the View All button.

**FSE behavior:** No typography control for View All text. Only color is controllable.
- Evidence: `StyleTab.tsx:193-198` has `viewAllTextColor` but no typography group

**Impact:** Cannot change font size, weight, or family of the "+N" counter text. Minor because the default styling is acceptable for most use cases.

**Fix:** Add `TypographyControl` from shared controls library for `viewAllTypography` attribute, apply via inline styles on the `<p>` element in `GalleryComponent.tsx:453-458`.

---

## Summary

### What Works Well (93%)

- **Complete HTML structure match** — all Voxel CSS classes and data attributes present
- **All 28/29 Elementor controls** mapped to Gutenberg inspector controls
- **Lightbox integration** — YARL replaces Elementor lightbox with equivalent UX
- **Mosaic layout** — full 6-item grid positioning with responsive variants stored
- **vxconfig hydration** — Plan C+ architecture with dual-format normalization
- **Dynamic tag support** — 27 controls support post field substitution (FSE enhancement)
- **Headless/Next.js ready** — normalizeConfig() handles camelCase and snake_case
- **Advanced tab** — full 133+ attribute support inherited from CombinedStyleAttributes
- **No AJAX complexity** — static rendering, simple architecture
- **Code quality** — comprehensive TypeScript types (251 lines), memoized React hooks

### Gaps to Fix (7%)

| # | Gap | Severity | Impact |
|---|-----|----------|--------|
| 1 | Gallery-specific responsive CSS not generated | **Medium** | Responsive tablet/mobile values stored but not applied (12+ attributes + 24 mosaic variants) |
| 2 | View All button typography missing | **Low** | Cannot customize font for "+N" counter text |

### Priority Fix Order

1. **Gap #1 — Responsive CSS generation** (Medium) — Affects core responsive functionality. Users setting tablet/mobile values see no change. Fix by generating `@media` queries for gallery-specific CSS properties.
2. **Gap #2 — Typography control** (Low) — Minor UX enhancement. Default font is acceptable. Add `TypographyControl` when convenient.

---

## Parity Score Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| HTML Structure | 100% | All elements, classes, and data attributes match |
| JavaScript Behavior | 100% | No Voxel JS to match; FSE adds React hydration |
| AJAX Endpoints | 100% | Neither side uses AJAX |
| Style Controls | 97% | 28/29 controls (missing: View All typography) |
| Responsive Output | 70% | Advanced tab responsive works; gallery-specific responsive values stored but not applied to CSS |
| Feature Set | 95% | All features present except responsive CSS application and typography |
| **Overall** | **~93%** | Production-ready with medium responsive gap |
