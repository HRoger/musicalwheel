# Sales Chart Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() functions to sales-chart frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-118)

Added comprehensive documentation header covering all Voxel sales-chart-widget.php controls (1066 lines, "Sales chart VX" widget - Stripe Connect module):

**CHART SETTINGS (Content Tab):**
- ts_active_chart - Default view (this-week/this-month/this-year/all-time)

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

**TABS - NORMAL:**
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

**NEXT/PREV WEEK - NORMAL:**
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

**NO ACTIVITY:**
- ts_nopost_content_Gap - Content gap (responsive slider)
- ts_nopost_ico_size - Icon size (responsive slider)
- ts_nopost_ico_col - Icon color
- ts_nopost_typo - Typography (group control)
- ts_nopost_typo_col - Text color

### 2. normalizeConfig() Function (lines 136-197)

Added normalization function for vxconfig attributes with 3 helper functions:

```typescript
function normalizeConfig(
  raw: Record<string, unknown>
): Omit<SalesChartVxConfig, 'charts'> {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {...};

  // Helper for ChartRange normalization
  const normalizeChartRange = (val: unknown): ChartRange => {...};

  // Helper for IconValue normalization
  const normalizeIcon = (val: unknown): IconValue => {...};

  return { activeChart, chartIcon, chevronRight, chevronLeft };
}
```

### 3. normalizeChartsData() Function (lines 199-342)

Added separate normalization function for chart data from REST API with 6 helper functions:

```typescript
function normalizeChartsData(
  raw: Record<string, unknown>
): ChartsCollection | null {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {...};

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number): number => {...};

  // Helper for boolean normalization
  const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {...};

  // Helper for ChartItem normalization
  const normalizeChartItem = (val: unknown): ChartItem => {...};

  // Helper for ChartMetaState normalization
  const normalizeMetaState = (val: unknown): ChartMetaState => {...};

  // Helper for ChartMeta normalization
  const normalizeChartMeta = (val: unknown): ChartMeta => {...};

  // Helper for ChartData normalization
  const normalizeChartData = (val: unknown): ChartData => {...};

  return { 'this-week', 'this-month', 'this-year', 'all-time' };
}
```

**Features:**
- String/Number/Boolean normalization with type coercion
- ChartRange enum normalization (4 valid values)
- IconValue object normalization
- ChartItem normalization (label, percent, earnings, orders)
- ChartMetaState normalization (date, has_next, has_prev, has_activity)
- ChartMeta normalization (label, state)
- ChartData normalization (steps, items, meta)
- ChartsCollection normalization for all 4 ranges
- Default chart data for missing ranges
- Dual-format support (camelCase, snake_case, ts_* prefixed)
- Next.js/headless architecture ready

### 4. Updated parseVxConfig() (lines 356-362)

Modified to use normalizeConfig() for consistent format handling.

### 5. Added Type Imports

Added ChartItem, ChartMeta, ChartMetaState, ChartData, ChartsCollection, and IconValue to imports.

## Build Output

```
frontend.js  8.83 kB | gzip: 2.95 kB
Built in 72ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php` (1066 lines)
- Template: `themes/voxel/app/modules/stripe-connect/templates/frontend/sales-chart-widget.php`
- Vendor Stats: `themes/voxel/app/modules/stripe-connect/vendor-stats.php`
- Script: `vx:vendor-stats.js`
- Style: `vx:bar-chart.css`
- Widget name: "Sales chart (VX)"

## Architecture Notes

The sales-chart block is unique because:
- **Stripe Connect module**: Part of Voxel's vendor marketplace system
- **Authenticated endpoint**: Requires user login to access sales data
- **Four time ranges**: Week, month, year, and all-time charts
- **Navigation support**: Prev/next navigation with date awareness
- **Earnings display**: Shows formatted currency amounts
- **Order counts**: Tracks number of orders per period
- **Similar to visit-chart**: Shares styling controls with visits-chart widget

## Next.js Readiness Checklist

- [x] normalizeConfig() handles vxconfig format
- [x] normalizeChartsData() handles REST API format
- [x] ChartRange normalization (4 valid values)
- [x] IconValue normalization (3 icons)
- [x] ChartItem normalization (4 properties)
- [x] ChartMetaState normalization (4 properties)
- [x] ChartMeta normalization
- [x] ChartData normalization
- [x] ChartsCollection normalization (4 ranges)
- [x] Dual-format support (camelCase/snake_case/ts_*)
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] REST API data fetching with nonce
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/sales-chart/frontend.tsx`
   - Added Voxel parity header (118 lines)
   - Added normalizeConfig() function (62 lines)
   - Added normalizeChartsData() function (144 lines)
   - Updated parseVxConfig() to use normalizeConfig()
   - Added ChartItem, ChartMeta, ChartMetaState, ChartData, ChartsCollection, IconValue imports

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Active chart | 100% | this-week/this-month/this-year/all-time |
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
| REST API | 100% | Authenticated endpoint |
| Multisite support | 100% | getRestBaseUrl() |
| normalizeConfig() | NEW | vxconfig format compatibility |
| normalizeChartsData() | NEW | API format compatibility |
