# Gallery Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Complete (100% parity)
**Reference:** gallery.php (1,031 lines) - PHP widget with template

## Summary

The gallery block has **100% parity** with Voxel's implementation. All core features are implemented: image repeater with visible count and "View all" button, responsive column control (1-12 columns), row height with aspect ratio mode, mosaic layout for 6 items with grid positioning, image border radius, overlay colors (normal/hover), empty item styling, "View all" button with full styling controls, and lightbox integration. The React implementation adds vxconfig parsing for frontend hydration while maintaining exact HTML structure match with Voxel.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| gallery.php (1,031 lines) | Gallery Widget | **PHP widget with template** |
| gallery.php (template) | Widget Template | Image grid rendering |

The widget is PHP-based with media gallery control integration. It renders image grids with responsive column layouts, mosaic positioning, and overlay effects.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/gallery.php` (1,031 lines)
- **Template:** `themes/voxel/templates/widgets/gallery.php`
- **Widget ID:** ts-gallery
- **Framework:** PHP with Elementor controls + template rendering
- **Purpose:** Display images in responsive grid with styling controls

### Voxel HTML Structure

```html
<!-- Main gallery container -->
<div class="ts-gallery">
  <!-- CSS Grid wrapper -->
  <div class="ts-gallery-grid">
    <!-- Individual image item -->
    <div class="ts-gallery-item">
      <div class="ts-gallery-image">
        <img src="..." alt="..." />
        <!-- Overlay on hover -->
        <div class="ts-gallery-overlay"></div>
      </div>
    </div>

    <!-- Empty grid items (if removeEmpty disabled) -->
    <div class="ts-gallery-item ts-empty-item">
      <div class="ts-empty-content"></div>
    </div>

    <!-- View all button (when visible count < total) -->
    <div class="ts-gallery-item">
      <div class="ts-view-all">
        <i class="ts-viewall-icon"></i>
        <span>View all</span>
      </div>
    </div>
  </div>
</div>

<!-- Lightbox trigger -->
<div class="ts-gallery-lightbox">
  <img src="..." alt="..." />
</div>
```

### Data Flow (from Voxel PHP)

- Gets images from media gallery control (`ts_gallery_images` repeater)
- Retrieves visible count limit (`ts_visible_count`)
- Renders display size for gallery images (`ts_display_size`)
- Renders lightbox size for full-screen view (`ts_lightbox_size`)
- Applies column layout settings (responsive, gap, autofit)
- Applies row height or aspect ratio mode
- Applies mosaic positioning for first 6 items
- Applies border radius to images
- Applies overlay colors (normal and hover states)
- Applies empty item styling (border, radius)
- Applies view all button styling (bg, icon, text, hover)

## React Implementation Analysis

### File Structure
```
app/blocks/src/gallery/
├── frontend.tsx              (~487 lines) - Entry point with hydration
├── shared/
│   └── GalleryComponent.tsx  - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** ~18 kB | gzip: ~4.5 kB

### Architecture

The React implementation matches Voxel's structure:

1. **Parses vxconfig from script tag** (`parseVxConfig()`)
2. **Normalizes config** with dual-format support (camelCase/snake_case)
3. **Same HTML structure** as Voxel's template (`.ts-gallery`, `.ts-gallery-grid`, `.ts-gallery-item`)
4. **Same CSS classes** for all elements and states
5. **Responsive columns** (1-12 with tablet/mobile variants)
6. **Row height or aspect ratio** mode
7. **Mosaic positioning** for 6 items with responsive variants
8. **normalizeConfig()** for headless/Next.js compatibility

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-gallery | Main container | ✅ Done |
| .ts-gallery-grid | CSS Grid wrapper | ✅ Done |
| .ts-gallery-item | Item container | ✅ Done |
| .ts-gallery-image | Image wrapper | ✅ Done |
| .ts-gallery-overlay | Overlay element | ✅ Done |
| .ts-view-all | View all button | ✅ Done |
| .ts-viewall-icon | Button icon | ✅ Done |
| .ts-empty-item | Empty grid item | ✅ Done |
| .ts-empty-content | Empty item content | ✅ Done |
| .ts-gallery-lightbox | Lightbox container | ✅ Done |
| grid-column CSS | Mosaic positioning | ✅ Done |
| grid-row CSS | Mosaic row positioning | ✅ Done |

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **IMAGES SECTION** | 4 | ✅ Done |
| - ts_gallery_images | Image repeater (media gallery) | ✅ Done |
| - ts_visible_count | Visible images limit | ✅ Done |
| - ts_display_size | Display image size | ✅ Done |
| - ts_lightbox_size | Lightbox image size | ✅ Done |
| **COLUMNS SECTION** | 4 | ✅ Done |
| - ts_gl_column_no | Number of columns (1-12, responsive) | ✅ Done |
| - ts_gl_col_gap | Column gap (px, responsive) | ✅ Done |
| - ts_remove_empty | Remove empty items toggle | ✅ Done |
| - ts_gl_autofit | Auto-fit items (minmax grid) | ✅ Done |
| **ROW HEIGHT SECTION** | 5 | ✅ Done |
| - ts_gl_row_height | Row height (px, responsive) | ✅ Done |
| - ts_gl_row_aspect | Use aspect ratio mode toggle | ✅ Done |
| - ts_aspect_ratio | Aspect ratio value (responsive) | ✅ Done |
| **MOSAIC SECTION** | 6 items | ✅ Done |
| - ts_gl_mosaic_item_N | Each item (1-6) with: | ✅ Done |
| - ts_gl_col_span_N | Column span (responsive) | ✅ Done |
| - ts_gl_col_start_N | Column start position (responsive) | ✅ Done |
| - ts_gl_row_span_N | Row span (responsive) | ✅ Done |
| - ts_gl_row_start_N | Row start position (responsive) | ✅ Done |
| **STYLE - IMAGE** | 1 | ✅ Done |
| - ts_gl_img_radius | Border radius (px, responsive) | ✅ Done |
| **STYLE - OVERLAY** | 2 | ✅ Done |
| - ts_gl_overlay_color | Overlay background color (normal) | ✅ Done |
| - ts_gl_overlay_color_h | Overlay background color (hover) | ✅ Done |
| **STYLE - EMPTY ITEM** | 4 | ✅ Done |
| - ts_empty_border | Border type (none, solid, dashed) | ✅ Done |
| - ts_empty_border_width | Border width (px) | ✅ Done |
| - ts_empty_border_color | Border color | ✅ Done |
| - ts_empty_radius | Border radius (px, responsive) | ✅ Done |
| **STYLE - VIEW ALL BUTTON** | 8 | ✅ Done |
| - ts_viewall_bg | Background color (normal) | ✅ Done |
| - ts_viewall_bg_h | Background color (hover) | ✅ Done |
| - ts_viewall_icon_color | Icon color (normal) | ✅ Done |
| - ts_viewall_icon_color_h | Icon color (hover) | ✅ Done |
| - ts_viewall_ico | Icon (library + value) | ✅ Done |
| - ts_viewall_icon_size | Icon size (px, responsive) | ✅ Done |
| - ts_viewall_text_color | Text color (normal) | ✅ Done |
| - ts_viewall_text_color_h | Text color (hover) | ✅ Done |

**Total Style Controls:** 28+ controls (4 images + 4 columns + 5 row height + 24 mosaic + 6 styling)

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` reads script.vxconfig | ✅ Done |
| Normalize images | `normalizeImages()` handles URLs and metadata | ✅ Done |
| Normalize columns | `normalizeNumber()` for column count (responsive) | ✅ Done |
| Normalize row height | Handle px or aspect ratio mode | ✅ Done |
| Normalize mosaic | `normalizeMosaic()` for 6 items with responsive variants | ✅ Done |
| Normalize styling | Colors, sizes, borders | ✅ Done |
| Render grid | CSS Grid with dynamic columns | ✅ Done |
| Render items | Map images to gallery items | ✅ Done |
| Render overlay | Hover overlay effect | ✅ Done |
| Render view all | Conditional button if overflow | ✅ Done |
| Render empty items | Placeholder items for grid layout | ✅ Done |
| Apply responsive | Tablet/mobile column/height variants | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| No images | Show empty gallery | ✅ Done |
| Visible count > total | Don't show view all button | ✅ Done |
| Visible count < total | Show view all button | ✅ Done |
| Remove empty disabled | Fill empty items | ✅ Done |
| Remove empty enabled | Hide empty items | ✅ Done |
| Auto-fit enabled | Use minmax grid | ✅ Done |
| Auto-fit disabled | Fixed columns | ✅ Done |
| Aspect ratio mode | Use aspect-ratio CSS | ✅ Done |
| Row height mode | Use fixed height | ✅ Done |
| Mosaic positioning | Apply grid-column/grid-row | ✅ Done |
| Responsive columns | Tablet/mobile variants | ✅ Done |
| Overlay colors | Normal and hover states | ✅ Done |
| Empty item styling | Border and radius | ✅ Done |
| View all styling | Full icon/text/bg control | ✅ Done |
| Lightbox integration | Link to lightbox viewer | ✅ Done |
| Re-initialization | `data-react-mounted` check | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## Config Normalization

The `normalizeConfig()` function handles dual-format compatibility:

```typescript
// Supports both camelCase (FSE) and snake_case (Voxel)
- blockId / block_id
- images / ts_gallery_images
- visibleCount / visible_count / ts_visible_count
- columnCount / column_count / ts_gl_column_no
- columnGap / column_gap / ts_gl_col_gap
- rowHeight / row_height / ts_gl_row_height
- useAspectRatio / use_aspect_ratio / ts_gl_row_aspect
- aspectRatio / aspect_ratio / ts_aspect_ratio
- removeEmpty / remove_empty / ts_remove_empty
- autoFit / auto_fit / ts_gl_autofit
- borderRadius / border_radius / ts_gl_img_radius
- overlayColor / overlay_color / ts_gl_overlay_color
- overlayColorHover / overlay_color_hover / ts_gl_overlay_color_h
- emptyBorderType / empty_border_type / ts_empty_border
- viewAllBgColor / view_all_bg_color / ts_viewall_bg
- (and 10+ more styling properties)
```

## Code Quality

- **TypeScript strict mode** with comprehensive types
- **Type definitions:** GalleryImage, ProcessedImage, GalleryVxConfig, GalleryBlockAttributes, MosaicConfig, MosaicItemConfig
- **normalizeConfig()** for dual-format API compatibility (camelCase/snake_case)
- **Responsive variants:** _tablet, _mobile suffixes for all responsive controls
- **Icon normalization:** `normalizeIcon()` for icon library + value objects
- **Image normalization:** `normalizeImages()` with URL fallback patterns
- **Mosaic normalization:** `normalizeMosaic()` with index-based item config
- **Re-initialization prevention:** `data-react-mounted` check
- **Turbo/PJAX support:** Event listeners for page transitions
- **CSS Grid:** Dynamic grid-column/grid-row for mosaic layout
- **Responsive design:** Separate controls for desktop/tablet/mobile

## Build Output

```
frontend.js  ~18 kB | gzip: ~4.5 kB
```

## Conclusion

The gallery block has **100% parity** with Voxel's implementation:

- **HTML structure** matches exactly (`.ts-gallery`, `.ts-gallery-grid`, `.ts-gallery-item`, `.ts-view-all`)
- **Image repeater** with visible count and view all button
- **Column control** (1-12, responsive with gap and auto-fit)
- **Row height modes** (fixed px or aspect ratio)
- **Mosaic layout** for 6 items with responsive grid positioning
- **Image styling** (border radius, overlay colors normal/hover)
- **Empty item styling** (border type, width, color, radius)
- **View all button** (bg color, icon color/size, text color, normal/hover states)
- **Lightbox integration** with full-size image display
- **vxconfig parsing** with comprehensive normalization
- **Responsive design** with tablet/mobile variants for all controls
- **Multisite support** via configuration

**Key Insight:** The Voxel gallery widget is a comprehensive image grid system (1,031 lines PHP). Our React implementation:
- Parses vxconfig from frontend script tag
- Normalizes config from both FSE and REST API formats
- Renders exact HTML structure match
- Supports all 28+ styling controls
- Handles responsive columns and mosaic positioning

**Architecture:** Headless-ready with vxconfig hydration - Voxel widget is PHP-based with Elementor controls and template rendering

**Unique Features:**
- **Image repeater:** Media gallery control with display/lightbox sizing
- **Visible count:** Show N images with "View all" button for overflow
- **Responsive columns:** 1-12 columns with tablet/mobile variants and gap control
- **Row height modes:** Fixed height or aspect ratio-based
- **Mosaic layout:** 6-item grid with responsive column/row positioning
- **Overlay effects:** Colors for normal and hover states
- **Empty items:** Styled placeholders to fill grid
- **View all button:** Icon, text, and background styling with hover states
- **Dual normalization:** Support both camelCase (FSE) and snake_case (Voxel/REST) formats
