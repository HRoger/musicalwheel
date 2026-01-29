# Review Stats Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to review-stats frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-76)

Added comprehensive documentation header covering all Voxel review-stats.php controls:

**SETTINGS (Content Tab):**
- stat_mode - Show stats for (overall, by_category)
  - overall: Shows rating distribution (excellent, very_good, good, fair, poor)
  - by_category: Shows scores per review category

**REVIEWS GRID (Style Tab):**
- ts_rs_column_no - Number of columns (responsive, 1-6)
- ts_rs_col_gap - Item gap (responsive slider, px)

**REVIEW STATS (Style Tab):**
- ts_review_icon_size - Icon size (responsive slider, 16-80px)
- ts_review_icon_spacing - Icon right spacing (slider, px)
- ts_review_typo - Label typography (group control)
- ts_review_typo_color - Label color
- ts_review_score - Score typography (group control)
- ts_review_score_color - Score color
- ts_review_chart_bg - Chart background color
- ts_chart_height - Chart height (responsive slider, px)
- ts_chart_rad - Chart border radius (responsive slider, px)

**VISIBILITY (FSE Extensions):**
- hideDesktop - Hide on desktop devices
- hideTablet - Hide on tablet devices
- hideMobile - Hide on mobile devices

**STYLING (FSE Extensions):**
- customClasses - Additional CSS classes

**DATA STRUCTURE:**
- Rating levels - excellent(2), very_good(1), good(0), fair(-1), poor(-2)
- Percentage calculation - (count / total) * 100
- Category stats - Per-category scores with icons

**HTML STRUCTURE:**
- .ts-review-bars - Grid container for review bars
- .ts-bar-data - Data row (icon + label + score)
- .ts-bar-data i/svg - Category icon
- .ts-bar-data p - Label text
- .ts-bar-data p span - Score value
- .ts-bar-chart - Progress bar container
- .ts-bar-value - Progress bar fill (width = percentage)

### 2. normalizeConfig() Function (lines 96-199)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): ReviewStatsVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return fallback;
  };

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) return parsed;
    }
    return fallback;
  };

  // Helper for responsive number value normalization
  const normalizeResponsiveNumber = (val: unknown, fallback: number) => {...};

  // Helper for responsive string value normalization
  const normalizeResponsiveString = (val: unknown, fallback: string) => {...};

  return {
    statMode, columns, itemGap, iconSize, iconSpacing,
    labelTypography, labelColor, scoreTypography, scoreColor,
    chartBgColor, chartHeight, chartRadius
  };
}
```

**Features:**
- String normalization (handles numeric values as strings)
- Number normalization (string to float parsing)
- Responsive value normalization (desktop/tablet/mobile)
- Typography group pass-through
- Dual-format support (camelCase and snake_case)
- Voxel control name support (ts_* prefixed controls)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 257-270)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  16.65 kB │ gzip: 5.37 kB
Built in 116ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/review-stats.php` (285 lines)
- Template: `themes/voxel/templates/widgets/review-stats.php`
- REST endpoint: `voxel-fse/v1/review-stats`

## Architecture Notes

The review-stats block is unique because:
- **Two display modes**: Overall score distribution vs per-category scores
- **Rating levels**: Maps to Voxel's 5-level system (excellent to poor)
- **REST API integration**: Fetches dynamic review data from server
- **Responsive controls**: Columns, gap, icon size, chart dimensions
- **Typography groups**: Label and score have separate typography controls

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] Responsive value normalization for device-specific settings
- [x] Async data fetching with proper error handling
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/review-stats/frontend.tsx`
   - Added Voxel parity header (76 lines)
   - Added normalizeConfig() function (104 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| stat_mode | 100% | overall/by_category display modes |
| Grid columns | 100% | Responsive 1-6 columns |
| Grid gap | 100% | Responsive item spacing |
| Icon size | 100% | Responsive icon dimensions |
| Icon spacing | 100% | Right margin for icons |
| Label typography | 100% | Typography group control |
| Label color | 100% | Text color |
| Score typography | 100% | Typography group control |
| Score color | 100% | Score text color |
| Chart background | 100% | Progress bar background |
| Chart height | 100% | Responsive bar height |
| Chart radius | 100% | Responsive border radius |
| HTML structure | 100% | All Voxel classes match |
| REST API | 100% | Dynamic review data |
| Multisite support | 100% | getRestBaseUrl() helper |
| normalizeConfig() | NEW | API format compatibility |
