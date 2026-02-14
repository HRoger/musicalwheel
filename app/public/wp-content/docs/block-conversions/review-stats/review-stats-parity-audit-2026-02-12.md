# Review Stats Widget vs Block - Parity Audit

**Date:** 2026-02-12
**Overall Parity:** ~98%
**Status:** Excellent parity with minor HTML class discrepancies

## Reference Files

| Source | File | Lines |
|--------|------|-------|
| Voxel Widget | `themes/voxel/app/widgets/review-stats.php` | 1-285 |
| Voxel Template | `themes/voxel/templates/widgets/review-stats.php` | 1-57 |
| Voxel CSS | `themes/voxel/assets/dist/review-stats.css` | All |
| Voxel Utils | `themes/voxel/app/utils/post-utils.php` | 711-793 |
| Voxel Reviews | `themes/voxel/app/post-types/post-type-reviews.php` | 65-114 |
| FSE block.json | `themes/voxel-fse/app/blocks/src/review-stats/block.json` | 1-166 |
| FSE edit.tsx | `themes/voxel-fse/app/blocks/src/review-stats/edit.tsx` | 1-207 |
| FSE save.tsx | `themes/voxel-fse/app/blocks/src/review-stats/save.tsx` | 1-225 |
| FSE frontend.tsx | `themes/voxel-fse/app/blocks/src/review-stats/frontend.tsx` | 1-462 |
| FSE Component | `themes/voxel-fse/app/blocks/src/review-stats/shared/ReviewStatsComponent.tsx` | 1-247 |
| FSE styles.ts | `themes/voxel-fse/app/blocks/src/review-stats/styles.ts` | 1-250 |
| FSE types.ts | `themes/voxel-fse/app/blocks/src/review-stats/types.ts` | 1-212 |
| FSE ContentTab | `themes/voxel-fse/app/blocks/src/review-stats/inspector/ContentTab.tsx` | 1-30 |
| FSE StyleTab | `themes/voxel-fse/app/blocks/src/review-stats/inspector/StyleTab.tsx` | 1-129 |
| FSE InspectorControls | `themes/voxel-fse/app/blocks/src/review-stats/inspector/InspectorControls.tsx` | 1-60 |
| HTML: Voxel | `docs/block-conversions/review-stats/voxel.html` | 1-50 |
| HTML: FSE | `docs/block-conversions/review-stats/voxel-fse.html` | 1-41 |

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP server-side template | Plan C+ (static save + REST hydration) |
| **State Management** | None (static PHP) | React useState (statsData, isLoading, error) |
| **Data Source** | `$post->repository->get_review_stats()` post meta | REST API `/voxel-fse/v1/review-stats` |
| **AJAX** | None | REST GET only |
| **CSS Approach** | Voxel compiled CSS + Elementor selectors | Voxel CSS injected + scoped style generator |
| **JavaScript** | None (pure PHP/HTML) | React hydration (~16.65kB / ~5.37kB gzip) |
| **Display Modes** | 2 (overall, by_category) | 2 (overall, by_category) |
| **Rating System** | -2 to +2 scale, 5 levels | Same -2 to +2 scale, DEFAULT_RATING_LEVELS |

## HTML Structure Parity

### Overall Mode (Rating Distribution)

| Element | Voxel Class | FSE Class | Match |
|---------|-------------|-----------|-------|
| Grid container | `.ts-review-bars` | `.ts-review-bars` | ✅ |
| Rating bar wrapper | `.ts-percentage-bar.{level}` | `.ts-percentage-bar.{level}` | ✅ |
| Data row | `.ts-bar-data` | `.ts-bar-data` | ✅ |
| Label text | `.ts-bar-data p` | `.ts-bar-data p` | ✅ |
| Score value | `.ts-bar-data p span` | `.ts-bar-data p span` | ✅ |
| Chart container | `.ts-bar-chart` | `.ts-bar-chart` | ✅ |
| Chart fill | `.ts-bar-chart > div` (inline width) | `.ts-bar-chart > div` (inline width) | ✅ |
| Level color | `style="--ts-accent-1: {color}"` | Uses level-specific CSS variable | ⚠️ Minor |
| Root wrapper | `.elementor-widget-container` | `.vxfse-review-stats` | ✅ Expected |

### By Category Mode

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Grid container | `.ts-review-bars` | `.ts-review-bars` | ✅ |
| Category bar | `.ts-percentage-bar` (no level class) | `.ts-percentage-bar` | ✅ |
| Category icon | `<i>` or `<svg>` (from `get_icon_markup()`) | `<span class="ts-category-icon">` wrapper | ⚠️ Minor |
| Score format | `{score} / 5` (e.g. "4.2 / 5") | Same format | ✅ |
| Color variable | `style="--ts-accent-1: {color}"` | Same CSS custom property | ✅ |

### Verified from HTML Captures

**Voxel** (`voxel.html`):
```html
<div class="ts-review-bars">
  <div class="ts-percentage-bar excellent" style="">
    <div class="ts-bar-data">
      <p>Excellent<span>0%</span></p>
    </div>
    <div class="ts-bar-chart">
      <div style="width: 0%;"></div>
    </div>
  </div>
  <!-- ...repeated for very_good, good, fair, poor -->
</div>
```

**FSE** (`voxel-fse.html`):
```html
<div class="ts-review-bars" style="--rs-grid-columns: repeat(1, 1fr);">
  <div class="ts-percentage-bar excellent">
    <div class="ts-bar-data"><p>Excellent<span>0%</span></p></div>
    <div class="ts-bar-chart">
      <div style="width: 0%;"></div>
    </div>
  </div>
  <!-- ...repeated for very_good, good, fair, poor -->
</div>
```

**Match:** Near-identical. FSE uses CSS custom property on grid container instead of inline `grid-template-columns`.

## JavaScript Behavior Parity

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 1 | N/A (pure PHP) | `fetchReviewStats()` | ✅ | FSE fetches data via REST instead of PHP |
| 2 | PHP `render()` | `ReviewStatsComponent()` | ✅ | Same output structure |
| 3 | PHP percentage calc | Client-side percentage calc | ✅ | Same formula: `(count/total)*100` |
| 4 | PHP `array_reverse()` | JS iteration order (excellent→poor) | ✅ | Same display order |
| 5 | PHP `number_format_i18n()` | JS number formatting | ✅ | Scores displayed with 1 decimal |
| 6 | N/A | `normalizeConfig()` | ✅ FSE-only | Dual-format for Next.js readiness |
| 7 | N/A | `getPostIdFromContext()` | ✅ FSE-only | Client-side post ID detection |
| 8 | N/A | `initReviewStatsBlocks()` | ✅ FSE-only | Hydration with re-init prevention |

**Note:** Voxel's review-stats widget has NO JavaScript — it's purely PHP/template-based. FSE adds React for headless compatibility.

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Data retrieval | `$post->repository->get_review_stats()` (PHP) | `GET /voxel-fse/v1/review-stats?post_id=X` | ✅ |
| Cache regen | `cache_post_review_stats()` (PHP) | Server-side (same function called by REST) | ✅ |

**Note:** Voxel makes zero AJAX calls for this widget. FSE uses REST API for headless compatibility.

## Style Controls Parity

### Content Tab

| # | Voxel Control | FSE Control | Match |
|---|--------------|-------------|-------|
| 1 | `stat_mode` (SELECT: overall/by_category) | `statMode` (SelectControl) | ✅ |

### Style Tab — Reviews Grid

| # | Voxel Control | FSE Control | Match |
|---|--------------|-------------|-------|
| 2 | `ts_rs_column_no` (NUMBER, responsive, 1-6) | `columns` (ResponsiveRangeControl, 1-6) | ✅ |
| 3 | `ts_rs_col_gap` (SLIDER, responsive, 0-100px) | `itemGap` (ResponsiveRangeControl, 0-100px) | ✅ |

### Style Tab — Review Stats

| # | Voxel Control | FSE Control | Match |
|---|--------------|-------------|-------|
| 4 | `ts_review_icon_size` (SLIDER, responsive, 16-80px) | `iconSize` (ResponsiveRangeControl, 16-80px) | ✅ |
| 5 | `ts_review_icon_spacing` (SLIDER, 0-100px) | `iconSpacing` (SliderControl, 0-100px) | ✅ |
| 6 | `ts_review_typo` (GROUP_TYPOGRAPHY) | `labelTypography` (TypographyControl) | ✅ |
| 7 | `ts_review_typo_color` (COLOR) | `labelColor` (ColorControl) | ✅ |
| 8 | `ts_review_score` (GROUP_TYPOGRAPHY) | `scoreTypography` (TypographyControl) | ✅ |
| 9 | `ts_review_score_color` (COLOR) | `scoreColor` (ColorControl) | ✅ |
| 10 | `ts_review_chart_bg` (COLOR) | `chartBgColor` (ColorControl) | ✅ |
| 11 | `ts_chart_height` (SLIDER, responsive) | `chartHeight` (ResponsiveRangeControl, 0-50px) | ✅ |
| 12 | `ts_chart_rad` (SLIDER, responsive) | `chartRadius` (ResponsiveRangeControl, 0-50px) | ✅ |

**Total: 12/12 Voxel controls mapped** (100%)

### FSE-Only Controls

| Control | Component | Purpose |
|---------|-----------|---------|
| hideDesktop/Tablet/Mobile | AdvancedTab | Responsive visibility |
| customClasses | AdvancedTab | Custom CSS classes |
| visibilityBehavior/Rules | VoxelTab | Conditional visibility |
| loopEnabled/Source/etc. | VoxelTab | Loop/repeater |

## CSS Selectors Parity

| # | Voxel Selector | FSE Selector | Match |
|---|---------------|--------------|-------|
| 1 | `{{WRAPPER}} .ts-review-bars` | `.vxfse-review-stats-{id} .ts-review-bars` | ✅ |
| 2 | `{{WRAPPER}} .ts-bar-data i` | `.vxfse-review-stats-{id} .ts-bar-data i` | ✅ |
| 3 | `{{WRAPPER}} .ts-bar-data svg` | `.vxfse-review-stats-{id} .ts-bar-data svg` | ✅ |
| 4 | `{{WRAPPER}} .ts-bar-data p` | `.vxfse-review-stats-{id} .ts-bar-data p` | ✅ |
| 5 | `{{WRAPPER}} .ts-bar-data p span` | `.vxfse-review-stats-{id} .ts-bar-data p span` | ✅ |
| 6 | `{{WRAPPER}} .ts-bar-chart` | `.vxfse-review-stats-{id} .ts-bar-chart` | ✅ |

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Overall rating distribution | 5 levels (excellent→poor) | Same 5 levels | ✅ |
| 2 | Per-category scores | Dynamic from post type config | REST API response | ✅ |
| 3 | Responsive grid columns | 1-6, responsive | 1-6, responsive | ✅ |
| 4 | Custom gap | 0-100px, responsive | 0-100px, responsive | ✅ |
| 5 | Progress bars | Width = percentage | Width = percentage | ✅ |
| 6 | Chart height | Responsive slider | Responsive slider | ✅ |
| 7 | Chart radius | Responsive slider | Responsive slider | ✅ |
| 8 | Chart background color | Color control | Color control | ✅ |
| 9 | Category icons | `get_icon_markup()` (i/svg) | Icon rendering (i/svg) | ✅ |
| 10 | Icon size | 16-80px, responsive | 16-80px, responsive | ✅ |
| 11 | Icon spacing | 0-100px | 0-100px | ✅ |
| 12 | Label typography | GROUP_TYPOGRAPHY | TypographyControl | ✅ |
| 13 | Label color | COLOR | ColorControl | ✅ |
| 14 | Score typography | GROUP_TYPOGRAPHY | TypographyControl | ✅ |
| 15 | Score color | COLOR | ColorControl | ✅ |
| 16 | Level color coding | `--ts-accent-1` CSS var | `--ts-accent-1` CSS var | ✅ |
| 17 | Score format (overall) | `{percentage}%` | `{percentage}%` | ✅ |
| 18 | Score format (category) | `{score} / 5` | `{score} / 5` | ✅ |
| 19 | Level reversal | `array_reverse()` (best first) | Same order (excellent→poor) | ✅ |
| 20 | Empty state handling | Skip if no data | Show 0% bars | ⚠️ Minor |
| 21 | Post context check | Returns early if no post | Error state display | ✅ |
| 22 | Stats caching | `voxel:review_stats` post meta | Same (via REST backend) | ✅ |
| 23 | Loading state | N/A (server-rendered) | `.ts-loader` spinner | ✅ FSE-only |
| 24 | Error state | N/A (server-rendered) | `.vxfse-error` display | ✅ FSE-only |
| 25 | Hydration | N/A | `data-hydrated` check | ✅ FSE-only |

## Identified Gaps

### Gap #1: Category Icon Wrapper (Severity: Low)

**Voxel behavior:** In by_category mode, icon markup (`<i>` or `<svg>`) is rendered directly inside `.ts-bar-data` as a sibling to `<p>`.
- File: `themes/voxel/templates/widgets/review-stats.php:27`

**FSE behavior:** Icon is wrapped in `<span class="ts-category-icon">` before being placed in `.ts-bar-data`.
- File: `themes/voxel-fse/app/blocks/src/review-stats/shared/ReviewStatsComponent.tsx`

**Impact:** Minimal — the extra wrapper doesn't affect visual layout since `.ts-bar-data` uses flexbox. CSS selectors for `.ts-bar-data i` and `.ts-bar-data svg` still work due to descendant selectors.

**Fix:** Remove the `<span class="ts-category-icon">` wrapper and render icon markup directly. Low priority since it has no visual impact.

### Gap #2: Grid CSS Application Method (Severity: Low)

**Voxel behavior:** Grid columns applied via Elementor's inline style injection (`grid-template-columns: repeat(X, 1fr)`).
- File: `themes/voxel/app/widgets/review-stats.php:68-70`

**FSE behavior:** Grid columns applied via CSS custom property `--rs-grid-columns` on `.ts-review-bars` and a scoped `<style>` tag.
- File: `themes/voxel-fse/app/blocks/src/review-stats/styles.ts`

**Impact:** None — both produce identical visual results. FSE approach is actually better for responsive breakpoints.

**Fix:** No fix needed. FSE approach is equivalent and better for SSR.

### Gap #3: Empty State Display Difference (Severity: Low)

**Voxel behavior:** When no reviews exist, widget still renders rating levels with 0% (server-side calculation produces 0 for all levels).
- File: `themes/voxel/templates/widgets/review-stats.php:38-56`

**FSE behavior:** Also shows 0% bars when no reviews, but through client-side defaults (DEFAULT_RATING_LEVELS constant).
- File: `themes/voxel-fse/app/blocks/src/review-stats/shared/ReviewStatsComponent.tsx:132-158`

**Impact:** Identical visual result — both show 5 bars with 0% text.

**Fix:** No fix needed. Visual output is identical.

## Summary

### What Works Well (98%)

- **HTML Structure:** Near-perfect match with identical CSS classes (`.ts-review-bars`, `.ts-percentage-bar`, `.ts-bar-data`, `.ts-bar-chart`)
- **Both Display Modes:** Overall rating distribution and per-category scores fully implemented
- **All 12 Voxel Controls:** 100% mapped to FSE equivalents with identical selectors
- **Rating System:** 5-level system (excellent→poor) with -2 to +2 internal scale
- **Responsive Design:** All responsive controls (columns, gap, icon size, chart height, chart radius) properly implemented
- **Typography:** Label and score typography groups fully mapped
- **Color Controls:** Label, score, and chart background colors all implemented
- **Progress Bars:** Percentage-based width with customizable height, radius, and background
- **CSS Custom Properties:** `--ts-accent-1` used for dynamic level/category coloring

### Gaps to Fix (2%)

| # | Gap | Severity | Impact |
|---|-----|----------|--------|
| 1 | Category icon wrapper `<span>` | Low | No visual impact |
| 2 | Grid CSS method (inline vs custom prop) | Low | No visual impact |
| 3 | Empty state mechanism | Low | Same visual result |

### Priority Fix Order

All gaps are **Low severity** with no visual impact. No fixes are required for production readiness.

1. **Optional:** Remove `ts-category-icon` wrapper span for stricter HTML parity
2. **No action needed:** Grid CSS method works identically
3. **No action needed:** Empty state looks the same

### Architecture Notes

- **No dedicated API controller** — the block fetches via a shared REST endpoint at `/voxel-fse/v1/review-stats`
- **No JavaScript in Voxel** — the widget is pure PHP/HTML. FSE adds React for headless/Next.js compatibility
- **Build size:** ~16.65 kB (gzip: ~5.37 kB) — very lightweight
- **Data source:** Both use `voxel:review_stats` post meta (cached review statistics)

### Rating Level Reference

| Key | Label | Internal Score | Display Score |
|-----|-------|---------------|---------------|
| excellent | Excellent | +2 | 5 |
| very_good | Very good | +1 | 4 |
| good | Good | 0 | 3 |
| fair | Fair | -1 | 2 |
| poor | Poor | -2 | 1 |
