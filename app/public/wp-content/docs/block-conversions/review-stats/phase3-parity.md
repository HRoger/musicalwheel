# Review Stats Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** review-stats.php (285 lines) - PHP widget with REST API

## Summary

The review-stats block has **100% parity** with Voxel's implementation. All core features are implemented: two display modes (overall rating distribution and per-category scores), responsive grid layout with 1-6 columns, rating level system (excellent to poor), dynamic REST API data fetching, and complete style controls for icons, labels, scores, and progress bar charts. The React implementation adds REST API integration for headless/Next.js compatibility while maintaining exact HTML structure match with Voxel.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| review-stats.php (285 lines) | Review Stats Widget | **PHP widget with template** |
| review-stats.php (template) | Widget Template | HTML rendering |

The widget is PHP-based with a dedicated template file. It renders review statistics with two modes: overall rating distribution or per-category scores.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/review-stats.php` (285 lines)
- **Template:** `themes/voxel/templates/widgets/review-stats.php`
- **Widget ID:** ts-review-stats
- **Framework:** PHP with template rendering
- **Purpose:** Display review statistics with bar charts

### Voxel HTML Structure

```html
<!-- Overall Mode: Rating Distribution -->
<div class="ts-review-bars" style="grid-template-columns: repeat(X, 1fr); gap: Ypx;">
  <div class="ts-bar">
    <div class="ts-bar-data">
      <i class="las la-star"></i>
      <p>
        Excellent
        <span>4.5</span>
      </p>
    </div>
    <div class="ts-bar-chart" style="height: Zpx; border-radius: Apx;">
      <div class="ts-bar-value" style="width: B%; background-color: #color;"></div>
    </div>
  </div>

  <div class="ts-bar">
    <div class="ts-bar-data">
      <i class="las la-star"></i>
      <p>
        Very good
        <span>3.5</span>
      </p>
    </div>
    <div class="ts-bar-chart">
      <div class="ts-bar-value" style="width: C%;"></div>
    </div>
  </div>
  <!-- More rating levels (good, fair, poor) -->
</div>

<!-- By Category Mode: Category Scores -->
<div class="ts-review-bars" style="grid-template-columns: repeat(X, 1fr);">
  <div class="ts-bar">
    <div class="ts-bar-data">
      <i class="las la-utensils"></i>
      <p>
        Food
        <span>4.2</span>
      </p>
    </div>
    <div class="ts-bar-chart">
      <div class="ts-bar-value" style="width: 84%;"></div>
    </div>
  </div>
  <!-- More categories (service, atmosphere, etc.) -->
</div>
```

### Data Flow (from Voxel PHP)

- Gets review statistics from post meta or database
- Calculates rating distribution (overall mode)
- Or retrieves category scores (by_category mode)
- Calculates percentages for progress bars
- Renders grid with responsive columns
- Applies custom styling from widget controls

### Display Modes

| Mode | Description | Data Shown |
|------|-------------|------------|
| Overall | Rating distribution | 5 rating levels (excellent, very_good, good, fair, poor) |
| By Category | Per-category scores | Individual review categories with icons |

### Rating Levels

| Level | Value | Label |
|-------|-------|-------|
| Excellent | 2 | "Excellent" |
| Very Good | 1 | "Very good" |
| Good | 0 | "Good" |
| Fair | -1 | "Fair" |
| Poor | -2 | "Poor" |

## React Implementation Analysis

### File Structure
```
app/blocks/src/review-stats/
├── frontend.tsx              (~400 lines) - Entry point with hydration
├── shared/
│   └── ReviewStatsComponent.tsx - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** ~16.65 kB | gzip: ~5.37 kB

### Architecture

The React implementation matches Voxel's structure:

1. **Fetches review stats via REST API** (`/voxel-fse/v1/review-stats`)
2. **Two display modes** (overall, by_category)
3. **Same HTML structure** as Voxel's template (`.ts-review-bars`, `.ts-bar`, `.ts-bar-data`, etc.)
4. **Same CSS classes** for all elements
5. **Rating level system** (excellent to poor)
6. **Responsive grid** (1-6 columns)
7. **normalizeConfig()** for dual-format API compatibility

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-review-bars | Grid container | ✅ Done |
| .ts-bar | Individual stat row | ✅ Done |
| .ts-bar-data | Data row (icon + label + score) | ✅ Done |
| .ts-bar-data i/svg | Category icon | ✅ Done |
| .ts-bar-data p | Label text | ✅ Done |
| .ts-bar-data p span | Score value | ✅ Done |
| .ts-bar-chart | Progress bar container | ✅ Done |
| .ts-bar-value | Progress bar fill | ✅ Done |

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **SETTINGS (Content)** | 1 | ✅ Done |
| - stat_mode | Display mode | ✅ Done |
| **REVIEWS GRID (Style)** | 2 | ✅ Done |
| - ts_rs_column_no | Number of columns (responsive, 1-6) | ✅ Done |
| - ts_rs_col_gap | Item gap (responsive, px) | ✅ Done |
| **REVIEW STATS (Style)** | 9 | ✅ Done |
| - ts_review_icon_size | Icon size (responsive, 16-80px) | ✅ Done |
| - ts_review_icon_spacing | Icon right spacing (px) | ✅ Done |
| - ts_review_typo | Label typography (group) | ✅ Done |
| - ts_review_typo_color | Label color | ✅ Done |
| - ts_review_score | Score typography (group) | ✅ Done |
| - ts_review_score_color | Score color | ✅ Done |
| - ts_review_chart_bg | Chart background color | ✅ Done |
| - ts_chart_height | Chart height (responsive, px) | ✅ Done |
| - ts_chart_rad | Chart border radius (responsive, px) | ✅ Done |
| **VISIBILITY (FSE)** | 3 | ✅ Done |
| - hideDesktop | Hide on desktop | ✅ Done |
| - hideTablet | Hide on tablet | ✅ Done |
| - hideMobile | Hide on mobile | ✅ Done |
| **STYLING (FSE)** | 1 | ✅ Done |
| - customClasses | Additional CSS classes | ✅ Done |

**Total Style Controls:** 16 controls (12 Voxel + 4 FSE)

### Display Modes

| Mode | Voxel Output | React Output | Status |
|------|--------------|--------------|--------|
| Overall | 5 rating levels with distribution | Same | ✅ Done |
| By Category | Category scores with icons | Same | ✅ Done |
| Grid layout | Responsive columns (1-6) | Same | ✅ Done |
| Progress bars | Width based on percentage | Same | ✅ Done |
| Icons | Category/level icons | Same | ✅ Done |
| Scores | Average score per level/category | Same | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch review stats | REST API `/voxel-fse/v1/review-stats` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Calculate percentages | Client-side percentage math | ✅ Done |
| Render grid | Responsive grid-template-columns | ✅ Done |
| Render bars | Progress bar width styling | ✅ Done |
| Icon rendering | Support for both icon types (i/svg) | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| No review data | Show empty state | ✅ Done |
| No post ID | Show not available message | ✅ Done |
| Zero reviews | Show "No reviews yet" | ✅ Done |
| Missing categories | Skip empty categories | ✅ Done |
| Invalid percentages | Clamp to 0-100% | ✅ Done |
| Loading state | `.ts-loader` spinner | ✅ Done |
| Error state | Error message display | ✅ Done |
| Re-initialization | `data-hydrated` check | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/review-stats | REST GET | ✅ Done |

### API Response Structure

```typescript
interface ReviewStatsApiResponse {
  mode: 'overall' | 'by_category';

  // Overall mode
  overall?: {
    excellent: { count: number; percentage: number; average: number };
    very_good: { count: number; percentage: number; average: number };
    good: { count: number; percentage: number; average: number };
    fair: { count: number; percentage: number; average: number };
    poor: { count: number; percentage: number; average: number };
  };

  // By category mode
  byCategory?: Array<{
    key: string;
    label: string;
    icon: string | object;
    average: number;
    percentage: number; // (average / 5) * 100
  }>;

  totalReviews: number;
  ratingLevels: {
    excellent: number;  // 2
    very_good: number;  // 1
    good: number;       // 0
    fair: number;       // -1
    poor: number;       // -2
  };
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- Responsive value helpers (normalizeResponsiveNumber, normalizeResponsiveString)
- Typography group pass-through
- useState for data management
- useEffect for REST API fetching
- CSS variables for dynamic styling (16 controls)
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners
- Loading and error states

## Build Output

```
frontend.js  ~16.65 kB | gzip: ~5.37 kB
```

## Conclusion

The review-stats block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.ts-review-bars`, `.ts-bar-data`, `.ts-bar-chart`, etc.)
- Two display modes (overall rating distribution, per-category scores)
- All 12 Voxel style controls supported
- 4 FSE visibility/styling controls
- 5 rating levels (excellent, very_good, good, fair, poor)
- Responsive grid layout (1-6 columns)
- Progress bar charts with percentage-based widths
- Icon support for categories and levels
- REST API data fetching
- vxconfig parsing with normalization
- Multisite support

**Key Insight:** The Voxel review-stats widget is a **PHP widget with template rendering**. Our React implementation adds:
- REST API data fetching for headless/Next.js compatibility
- Client-side percentage calculations
- Dynamic grid rendering
- Loading and error states

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-based with template

**Unique Features:**
- **Dual display modes**: Overall (rating distribution) vs By Category (category scores)
- **Rating level system**: Maps to Voxel's 5-level scoring (excellent=2 to poor=-2)
- **Responsive grid**: 1-6 columns with custom gap
- **Typography groups**: Separate controls for label and score typography
- **Progress bars**: Visual representation of percentages with custom styling
