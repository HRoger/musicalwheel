# Visit Chart Block - Phase 3 Parity

**Date:** February 1, 2026
**Status:** ✅ Full Parity Complete (100%)
**Reference:** voxel-visits-chart.beautified.js (203 lines, ~2KB original)

## Summary

The visit-chart block has **100% parity** with Voxel's Vue.js implementation. All core features are implemented: lazy-loading chart data on tab selection, time period tabs (24h/7d/30d/12m), interactive bar chart with hover popups, drag-to-scroll functionality, and auto-scroll to latest data. The React implementation uses the same AJAX endpoint as Voxel for data fetching.

## Security Parity (February 2026 Update)

**CRITICAL FIX:** Added permission checks matching `visits-chart-controller.php:22-31`

### Permission Model (1:1 Match)

| Source | Voxel Check | FSE Check | Evidence |
|--------|-------------|-----------|----------|
| **post** | `$post->is_editable_by_current_user()` | ✅ Same check | Line 24 |
| **user** | Nonce tied to `get_current_user_id()` | ✅ Must be logged in | Lines 61-64 |
| **site** | Admin-only implied | ✅ `manage_options` capability | Backend-only access |

### Error Handling (1:1 Match)

| HTTP Status | Voxel Behavior | FSE Behavior |
|-------------|----------------|--------------|
| 401 | Widget doesn't render | Block hidden (returns null) |
| 403 | Widget doesn't render | Block hidden (returns null) |
| 500 | Shows error notification | Shows error + Voxel.alert() |

### Files Modified

1. **`rest-api-controller.php`** (lines 1050-1175)
   - `check_visit_chart_permission()`: Added user/site source auth checks
   - `get_visit_chart_context()`: Added `is_editable_by_current_user()` for post source

2. **`frontend.tsx`** (lines 400-600)
   - New `ChartContextError` and `ChartContextResult` types
   - `fetchChartContext()`: Returns structured error info
   - `VisitChartWrapper`: Hides block on 401/403 (Voxel parity)

## Voxel JS Analysis

- **Total lines:** 203 (beautified with comments)
- **Original size:** 2KB
- **Framework:** Vue.js 3 (Vue.createApp)
- **Mixins:** Voxel.mixins.base

### Core Features

| Feature | Voxel Implementation |
|---------|---------------------|
| Lazy loading | Load chart on tab select if not loaded |
| Tab navigation | Click handler switching active_chart |
| Interactive chart | Bars with hover popup |
| Drag scrolling | dragScroll() with mouse events |
| Auto-scroll | requestAnimationFrame scroll to right |
| Error handling | charts[timeframe].error flag |
| voxel:markup-update | Event listener for re-initialization |

### Vue data() Properties

| Property | Purpose |
|----------|---------|
| loading | AJAX loading state |
| charts | Chart data collection keyed by timeframe |
| view_type | Display type (views/unique_views) |
| active_chart | Current tab ('7d', etc.) |
| activeItem | Currently hovered bar item |
| scrollArea | Drag scroll state (isDown, scrollLeft, startX) |

### API Endpoint

| Endpoint | Method |
|----------|--------|
| `ajax_url&action=tracking.get_chart_data` | jQuery GET |

Request Parameters:
- `source`: "post", "user", or "site"
- `post_id`: Post ID for post source
- `timeframe`: "24h", "7d", "30d", "12m"
- `view_type`: "views" or "unique_views"
- `_wpnonce`: Security nonce

### Key Behavior: Lazy Loading

```javascript
// Voxel computed property triggers load on access
computed: {
    currentChart() {
        return (
            !1 === this.charts[this.active_chart].loaded && this.loadChart(this.active_chart),
            this.charts[this.active_chart]
        );
    }
}
```

## React Implementation Analysis

### File Structure
```
app/blocks/src/visit-chart/
├── frontend.tsx                    (~580 lines) - Entry point with hydration
├── shared/
│   └── VisitChartComponent.tsx     (~453 lines) - UI component
├── types/
│   └── index.ts                    - Comprehensive TypeScript types
└── styles/
    └── voxel-fse.css               - Styles matching Voxel
```

**Build Output:** 11.33 kB | gzip: 3.65 kB

### Architecture

The React block provides a complete standalone implementation:

1. **Context fetching** for nonce and post ID
2. **Lazy loading** chart data on tab selection
3. **Same AJAX endpoint** (`action=tracking.get_chart_data`)
4. **Same HTML structure** as Voxel's Vue template
5. **Same interactive behaviors** (tabs, popup, drag scroll, auto-scroll)

## Parity Checklist

### State Management

| Vue data() Property | React Implementation | Status |
|---------------------|---------------------|--------|
| loading | useState(false) | Done |
| charts | useState<Record<ChartTimeframe, ChartState>> | Done |
| view_type | vxconfig.viewType | Done |
| active_chart | useState(activeChart) | Done |
| activeItem | useState<ChartItem \| null>(null) | Done |
| scrollArea.isDown | useRef (scrollState) | Done |
| scrollArea.startX | useRef (scrollState) | Done |
| scrollArea.scrollLeft | useRef (scrollState) | Done |

### Event Handlers

| Voxel Event | React Implementation | Status |
|-------------|---------------------|--------|
| Tab click | onClick setActiveChart | Done |
| Bar hover | onMouseOver showPopup | Done |
| Bar leave | onMouseLeave hidePopup | Done |
| Drag mousedown | addEventListener via useEffect | Done |
| Drag mouseup | addEventListener via useEffect | Done |
| Drag mousemove | addEventListener via useEffect | Done |
| Drag mouseleave | addEventListener via useEffect | Done |
| voxel:markup-update | jQuery.on listener | Done |

### API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| Context fetching | REST GET /voxel-fse/v1/visit-chart/context | Done |
| Chart data | Voxel AJAX &action=tracking.get_chart_data | Done |

### CSS Classes

| Voxel Class | React Usage | Status |
|-------------|-------------|--------|
| .ts-visits-chart | Main container | Done |
| .ts-generic-tabs | Tab list | Done |
| .bar-chart-tabs | Tab modifier | Done |
| .ts-tab-active | Active tab state | Done |
| .ts-chart | Chart container | Done |
| .chart-contain | Chart wrapper | Done |
| .chart-content | Content area | Done |
| .bar-item-con | Bar item container | Done |
| .bar-values | Y-axis values | Done |
| .bi-hold | Bar holder | Done |
| .bar-item | Bar element | Done |
| .bar-animate | Bar animation | Done |
| .bar-item-data | Popup element | Done |
| .ts-no-posts | No activity state | Done |
| .min-scroll | Scroll container | Done |
| .min-scroll-h | Horizontal scroll | Done |
| .flexify | Flexbox helper | Done |
| .simplify-ul | List reset | Done |
| .vx-pending | Loading state | Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | data-reactMounted check | Done |
| Lazy load on tab select | useEffect triggers loadChart | Done |
| Loading state | loading state with .vx-pending | Done |
| Error state | charts[timeframe].error flag | Done |
| No activity | has_activity check | Done |
| Auto-scroll to right | requestAnimationFrame | Done |
| Popup positioning | Left/right based on available space | Done |
| Turbo/PJAX navigation | turbo:load, pjax:complete listeners | Done |
| Voxel markup update | jQuery voxel:markup-update listener | Done |
| Multisite support | getRestBaseUrl() | Done |
| Post ID detection | Multiple fallbacks (data attr, body class) | Done |

### Style Controls

| Control | React Attribute | Status |
|---------|-----------------|--------|
| ts_source | source | Done |
| ts_active_chart | activeChart | Done |
| ts_view_type | viewType | Done |
| chart_icon | chartIcon | Done |
| ts_chevron_right | chevronRight | Done |
| ts_chevron_left | chevronLeft | Done |
| All typography controls | CSS variables | Done |
| All color controls | CSS variables | Done |
| All border controls | CSS variables | Done |

### Interactive Features

| Feature | Voxel | React | Status |
|---------|-------|-------|--------|
| Tab switching | @click setActiveChart | onClick setActiveChart | Done |
| Lazy load | Computed property triggers | useEffect triggers | Done |
| Popup positioning | getBoundingClientRect | getBoundingClientRect | Done |
| Smart popup side | Check innerWidth vs rect.right | Same logic | Done |
| Drag scroll | mousedown/up/move/leave | useEffect + addEventListener | Done |
| Auto-scroll right | requestAnimationFrame | requestAnimationFrame | Done |
| Loading overlay | loading state | loading state | Done |

## Code Quality

- TypeScript strict mode with comprehensive types
- normalizeConfig() for dual-format API compatibility (camelCase/snake_case/ts_*)
- normalizeChartsData() for chart state normalization
- useState for all reactive state
- useRef for popup, scroll area, and drag state
- useCallback for memoized event handlers
- useEffect for lazy loading and drag scroll setup
- getRestBaseUrl() for multisite support
- Multiple post ID detection methods
- Re-initialization prevention with data-reactMounted
- Turbo/PJAX event listeners
- voxel:markup-update event listener via jQuery

## Build Output

```
visit-chart/index.js   39.76 kB | gzip: 8.17 kB  (editor bundle)
visit-chart/frontend.js  20.71 kB | gzip: 6.81 kB  (frontend bundle)
Built in 125ms
```

## Conclusion

The visit-chart block has **100% parity** with Voxel's Vue.js implementation:

### Functional Parity
- ✅ Tab navigation (24h/7d/30d/12m)
- ✅ Lazy loading chart data on tab selection
- ✅ Interactive bar chart with hover popups
- ✅ Smart popup positioning (left/right based on space)
- ✅ Drag-to-scroll functionality
- ✅ Auto-scroll to latest data on load
- ✅ Same AJAX endpoint for data fetching
- ✅ Error state handling
- ✅ No activity state display
- ✅ Same CSS classes throughout
- ✅ Same HTML structure for Voxel CSS compatibility
- ✅ Re-initialization prevention
- ✅ Turbo/PJAX and voxel:markup-update support

### Security Parity (NEW - February 2026)
- ✅ **Post source**: Requires `is_editable_by_current_user()` - only post owner can view stats
- ✅ **User source**: Requires logged-in user - nonce tied to `get_current_user_id()`
- ✅ **Site source**: Requires `manage_options` capability (admin-only)
- ✅ **Error handling**: 401/403 hides block (matches Voxel's early return behavior)
- ✅ **Generic error messages**: Uses "Invalid request." to match Voxel
- No activity state display
- Same CSS classes throughout
- Same HTML structure for Voxel CSS compatibility
- Re-initialization prevention
- Turbo/PJAX and voxel:markup-update support

**Architecture:** Full React implementation with Voxel AJAX endpoint - replaces Vue.js component

The React implementation provides equivalent functionality to Voxel's Vue.js component while being headless-ready for Next.js migration. The key difference from sales-chart is that visit-chart uses Voxel's tracking AJAX endpoint directly rather than a custom REST API.
