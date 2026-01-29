# Gallery Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to gallery frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-102)

Added comprehensive documentation header:

**Images Section:**
- ts_gallery_images - Image repeater (media gallery control)
- ts_visible_count - Number of visible images
- ts_display_size - Display image size (thumbnail, medium, large, full)
- ts_lightbox_size - Lightbox image size

**Columns Section:**
- ts_gl_col_gap - Column gap (px)
- ts_gl_column_no - Number of columns (1-12, responsive)
- ts_remove_empty - Remove empty items from grid
- ts_gl_autofit - Auto-fit items (minmax grid)

**Row Height Section:**
- ts_gl_row_height - Row height (px, responsive)
- ts_gl_row_aspect - Use aspect ratio mode
- ts_aspect_ratio - Aspect ratio value (e.g., "16/9")

**Mosaic Section (6 items):**
- ts_gl_mosaic_item_N - Each item has:
  - col_span, col_start, row_span, row_start
  - All with responsive variants (_tablet, _mobile)

**Style - Image:**
- ts_gl_img_radius - Border radius (px, responsive)

**Style - Overlay:**
- ts_gl_overlay_color - Normal overlay color
- ts_gl_overlay_color_h - Hover overlay color

**Style - Empty Item:**
- ts_empty_border - Border type
- ts_empty_border_width - Border width
- ts_empty_border_color - Border color
- ts_empty_radius - Border radius (responsive)

**Style - View All Button:**
- ts_viewall_bg / ts_viewall_bg_h - Background color (normal/hover)
- ts_viewall_icon_color / ts_viewall_icon_color_h - Icon color
- ts_viewall_ico - Icon (library + value)
- ts_viewall_icon_size - Icon size (responsive)
- ts_viewall_text_color / ts_viewall_text_color_h - Text color

### 2. normalizeConfig() Function (lines 155-348)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): GalleryVxConfig {
  // Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
  // Images: ts_gallery_images, ts_visible_count
  // Columns: ts_gl_column_no, ts_gl_col_gap, ts_remove_empty, ts_gl_autofit
  // Row height: ts_gl_row_height, ts_gl_row_aspect, ts_aspect_ratio
  // Mosaic: normalizeMosaicItem() for 6 items
  // Style: overlayColor, emptyBorder*, viewAll*
}
```

**Features:**
- Boolean normalization (handles 'true', 'false', 1, 0, 'yes', 'no')
- String normalization with fallbacks
- Number normalization (string to float parsing)
- Optional number normalization (preserves undefined)
- Icon object normalization (library + value)
- Mosaic item normalization (6 items with responsive variants)
- Images array normalization with processed format
- Dual-format support (camelCase and snake_case)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 354-368)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  16.37 kB │ gzip: 4.00 kB
Built in 250ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/gallery.php` (1,031 lines)
- Template: `themes/voxel/templates/widgets/gallery.php`

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] GalleryComponent accepts props (context-aware)
- [x] No jQuery in component logic
- [x] TypeScript strict mode

## Files Modified

1. `app/blocks/src/gallery/frontend.tsx`
   - Added Voxel parity header (102 lines)
   - Added normalizeConfig() function (193 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Images section | 100% | Gallery images, visible count, sizes |
| Columns | 100% | Gap, count, remove empty, autofit |
| Row height | 100% | Height, aspect ratio mode |
| Mosaic (6 items) | 100% | Col/row span/start for each |
| Style - Image | 100% | Border radius responsive |
| Style - Overlay | 100% | Normal + Hover colors |
| Style - Empty Item | 100% | Border type, width, color, radius |
| Style - View All | 100% | Background, icon, text colors |
| HTML structure | 100% | All Voxel classes match |
| normalizeConfig() | NEW | API format compatibility |
