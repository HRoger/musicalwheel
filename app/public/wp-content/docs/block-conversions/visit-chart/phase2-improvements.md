# Visit Chart Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to visit-chart frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-119)

Added comprehensive documentation header covering all Voxel visits-chart.php controls (1104 lines, "Visits chart VX" widget):

**CHART SETTINGS (Content Tab):**
- ts_source - Show stats for (post/user/site)
- ts_active_chart - Default view (24h/7d/30d/12m)
- ts_view_type - Display data (views/unique_views)

**ICONS (Content Tab):**
- chart_icon - Chart icon
- ts_chevron_right - Right chevron icon
- ts_chevron_left - Left chevron icon

**CHART (Style Tab):**
- ts_chart_height - Content height (responsive slider)
- axis_typo - Axis typography (group control)
- ts_axis_typo_col - Axis text color
- vertical_axis_width - Vertical axis width (responsive slider)
- chart_line_border - Chart lines border (group control)
- chart_col_gap - Bar gap (responsive slider)
- bar_width - Bar width (responsive slider)
- bar_radius - Bar radius (responsive slider)
- bar_bg - Bar background (group control, supports gradient)
- bar_bg_hover - Bar background hover color
- bar_sh_shadow - Bar box shadow (group control)

**BAR POPUP:**
- bar_pop_bg - Popup background color
- bar_pop_border - Popup border (group control)
- bar_pop_radius - Popup border radius
- bar_pop_shadow - Popup box shadow (group control)
- ts_primary_typo - Popup value typography (group control)
- ts_primary_color - Popup value text color
- ts_secondary_typo - Popup label typography (group control)
- ts_secondary_color - Popup label text color

**TABS - NORMAL (Style Tab):**
- ts_tabs_justify - Tab justify (select)
- ts_tabs_padding - Tab padding (dimensions)
- ts_tabs_margin - Tab margin (dimensions)
- ts_tabs_text - Tab typography (group control)
- ts_tabs_text_active - Active tab typography (group control)
- ts_tabs_text_color - Tab text color
- ts_active_text_color - Active tab text color
- ts_tabs_bg_color - Tab background color
- ts_tabs_bg_active_color - Active tab background
- ts_tabs_border - Tab border (group control)
- ts_tabs_border_active - Active tab border color
- ts_tabs_radius - Tab border radius

**TABS - HOVER:**
- ts_tabs_text_color_h - Text color hover
- ts_tabs_active_text_color_h - Active text color hover
- ts_tabs_border_color_h - Border color hover
- ts_tabs_border_h_active - Active border color hover
- ts_tabs_bg_color_h - Background color hover
- ts_bg_active_color_h - Active background hover

**NEXT/PREV WEEK - NORMAL (Style Tab):**
- week_range_typo - Range typography (group control)
- week_range_col - Range text color
- ts_week_btn_color - Button icon color
- ts_week_btn_icon_size - Button icon size (responsive)
- ts_week_btn_bg - Button background
- ts_week_btn_border - Button border (group control)
- ts_week_btn_radius - Button border radius (responsive)
- ts_week_btn_size - Button size (responsive)

**NEXT/PREV WEEK - HOVER:**
- ts_week_btn_h - Button icon color hover
- ts_week_btn_bg_h - Button background hover
- ts_week_border_c_h - Button border color hover

**NO ACTIVITY (Style Tab):**
- ts_nopost_content_Gap - Content gap (responsive slider)
- ts_nopost_ico_size - Icon size (responsive slider)
- ts_nopost_ico_col - Icon color
- ts_nopost_typo - Typography (group control)
- ts_nopost_typo_col - Text color

### 2. normalizeConfig() Function (lines 136-305)

Added normalization function for API format compatibility with 8 specialized helper functions:

```typescript
function normalizeConfig(raw: Record<string, unknown>): VisitChartVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {...};

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number | undefined): number | undefined => {...};

  // Helper for boolean normalization
  const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {...};

  // Helper for StatsSource normalization
  const normalizeSource = (val: unknown): StatsSource => {...};

  // Helper for ChartTimeframe normalization
  const normalizeTimeframe = (val: unknown): ChartTimeframe => {...};

  // Helper for ViewType normalization
  const normalizeViewType = (val: unknown): ViewType => {...};

  // Helper for ChartItem normalization
  const normalizeChartItem = (val: unknown): ChartItem => {...};

  // Helper for ChartMeta normalization
  const normalizeChartMeta = (val: unknown): ChartMeta => {...};

  // Helper for ChartState normalization
  const normalizeChartState = (val: unknown): ChartState => {...};

  // Helper for charts Record normalization
  const normalizeCharts = (val: unknown): Record<ChartTimeframe, ChartState> => {...};

  return { source, activeChart, viewType, nonce, postId, charts };
}
```

**Features:**
- String normalization (handles numeric values as strings)
- Number normalization (string to float parsing)
- Boolean normalization (handles various truthy/falsy values)
- StatsSource enum normalization (post/user/site)
- ChartTimeframe enum normalization (24h/7d/30d/12m)
- ViewType enum normalization (views/unique_views)
- ChartItem object normalization (4 properties)
- ChartMeta object normalization
- ChartState object normalization (loaded, error, steps, items, meta)
- Charts Record normalization for all 4 timeframes
- Dual-format support (camelCase, snake_case, ts_* prefixed)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 310-330)

Modified to use normalizeConfig() for consistent format handling.

### 4. Added Type Imports

Added ChartItem, ChartMeta, ChartState to the type imports for normalizeConfig().

## Build Output

```
frontend.js  11.33 kB | gzip: 3.65 kB
Built in 75ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/visits-chart.php` (1104 lines)
- Template: `themes/voxel/templates/widgets/visits-chart.php`
- Script: `vx:visits-chart.js`
- Style: `vx:bar-chart.css`
- Widget name: "Visits chart (VX)"

## Architecture Notes

The visit-chart block is unique because:
- **Three stats sources**: Post, user, or site-wide stats
- **Four timeframes**: 24 hours, 7 days, 30 days, 12 months
- **Dual view types**: Total views or unique views
- **REST API dependent**: Fetches chart data via REST with nonce
- **Post context aware**: Determines current post for "post" source
- **Multisite support**: Uses getRestBaseUrl() for subdirectory installs
- **Navigation controls**: Week/month navigation with prev/next buttons
- **Dynamic chart loading**: Loads data on demand per timeframe

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] StatsSource normalization (3 valid values)
- [x] ChartTimeframe normalization (4 valid values)
- [x] ViewType normalization (2 valid values)
- [x] ChartItem array normalization
- [x] ChartMeta object normalization
- [x] ChartState normalization (5 properties)
- [x] Charts Record normalization (4 timeframes)
- [x] Dual-format support (camelCase/snake_case/ts_*)
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] REST API context fetching with nonce
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/visit-chart/frontend.tsx`
   - Added Voxel parity header (119 lines)
   - Added normalizeConfig() function (170 lines)
   - Updated parseVxConfig() to use normalizeConfig()
   - Added ChartItem, ChartMeta, ChartState imports

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Stats source | 100% | post/user/site |
| Active chart | 100% | 24h/7d/30d/12m |
| View type | 100% | views/unique_views |
| Chart icon | 100% | chart_icon |
| Chevron icons | 100% | Left/right navigation |
| Chart height | 100% | Responsive slider |
| Axis typography | 100% | Group control |
| Axis text color | 100% | Color picker |
| Vertical axis width | 100% | Responsive slider |
| Chart line border | 100% | Group control |
| Bar gap | 100% | Responsive slider |
| Bar width | 100% | Responsive slider |
| Bar radius | 100% | Responsive slider |
| Bar background | 100% | Gradient support |
| Bar hover color | 100% | Color picker |
| Bar box shadow | 100% | Group control |
| Popup background | 100% | Color picker |
| Popup border | 100% | Group control |
| Popup radius | 100% | Slider |
| Popup shadow | 100% | Group control |
| Popup typography | 100% | Value + label |
| Popup colors | 100% | Value + label |
| Tab justify | 100% | 5 options |
| Tab padding | 100% | Dimensions |
| Tab margin | 100% | Dimensions |
| Tab typography | 100% | Normal + active |
| Tab colors | 100% | Text + background |
| Tab border | 100% | Group control |
| Tab radius | 100% | Slider |
| Tab hover states | 100% | 6 properties |
| Week range typo | 100% | Group control |
| Week button styling | 100% | Icon, size, bg, border |
| Week button hover | 100% | 3 properties |
| No activity styling | 100% | Gap, icon, text |
| HTML structure | 100% | All Voxel classes |
| REST API | 100% | Context fetching |
| Multisite support | 100% | getRestBaseUrl() |
| normalizeConfig() | NEW | API format compatibility |
