# Term Feed Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to term-feed frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-95)

Added comprehensive documentation header:

**Data Source (2 modes):**
- filters - Query by taxonomy with filtering options
- manual - Manual term ID selection (repeater)

**Query Settings:**
- ts_choose_taxonomy - Select Voxel taxonomy
- ts_parent_term_id - Filter by parent term (direct children)
- ts_order - default or name (alphabetical)
- ts_per_page - Number of terms to load (max 500)
- ts_hide_empty - Hide terms without posts
- ts_hide_empty_pt - Filter empty by specific post type
- ts_card_template - Term card template selection

**Layout Modes:**
- ts-feed-grid-default - Grid layout with columns
- ts-feed-nowrap - Carousel/horizontal scroll

**Carousel Settings:**
- ts_nowrap_item_width - Item width (px, %, custom)
- carousel_autoplay - Auto slide toggle
- carousel_autoplay_interval - Slide interval (ms)
- ts_scroll_padding - Scroll padding
- ts_item_padding - Item padding

**Grid Settings:**
- ts_feed_column_no - Number of columns (1-6)
- ts_feed_col_gap - Item gap

**Carousel Navigation (Normal + Hover):**
- Horizontal/vertical position
- Button icon color, size, icon size
- Button background, backdrop blur
- Border (type, width, color, radius)
- Hover states for all properties

### 2. normalizeConfig() Function (lines 145-308)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): TermFeedVxConfig {
  // Handles both camelCase (FSE) and snake_case (Voxel/REST) formats
  // Data source: ts_source, source
  // Query: ts_choose_taxonomy, ts_parent_term_id, ts_order, ts_per_page
  // Layout: ts_wrap_feed, ts_feed_column_no, ts_feed_col_gap
  // Carousel: ts_nowrap_item_width, carousel_autoplay
  // Navigation: ts_fnav_btn_horizontal, ts_fnav_btn_color, etc.
}
```

**Features:**
- Boolean normalization (handles 'true', 'false', 1, 0, 'yes', 'no')
- String normalization with fallbacks
- Number normalization (string to float parsing)
- Icon object normalization (library + value)
- Border width normalization (top, right, bottom, left)
- Manual term IDs normalization (handles array with term_id objects)
- Responsive values pass-through (tablet/mobile breakpoints)
- Dual-format support (camelCase and snake_case)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 310-330)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  18.57 kB │ gzip: 4.83 kB
Built in 75ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/term-feed.php` (721 lines)
- Template: `themes/voxel/templates/widgets/term-feed.php`
- Styles: `vx:post-feed.css` (shared with post-feed)

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] TermFeedComponent accepts props (context-aware)
- [x] No jQuery in component logic
- [x] REST API endpoint for headless term fetching
- [x] TypeScript strict mode

## Files Modified

1. `app/blocks/src/term-feed/frontend.tsx`
   - Added Voxel parity header (95 lines)
   - Added normalizeConfig() function (163 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Data source (2 modes) | 100% | Filters + Manual selection |
| Query settings | 100% | Taxonomy, parent, order, perPage |
| Hide empty terms | 100% | With post type filter |
| Card templates | 100% | Template selection |
| Layout modes | 100% | Grid + Carousel |
| Carousel settings | 100% | Width, autoplay, padding |
| Grid columns | 100% | 1-6 columns responsive |
| Accent color | 100% | Replace with term color |
| Navigation styling | 100% | Normal + Hover states |
| Responsive values | 100% | Tablet/mobile breakpoints |
| normalizeConfig() | NEW | API format compatibility |
