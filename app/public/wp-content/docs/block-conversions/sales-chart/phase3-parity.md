# Sales Chart Block - Phase 3 Parity

**Date:** December 23, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** voxel-vendor-stats.beautified.js (179 lines, ~1.8KB original)

## Summary

The sales-chart block has **100% parity** with Voxel's Vue.js implementation. All core features are implemented: tab navigation for time periods (week/month/year/all-time), prev/next navigation with AJAX data loading, interactive bar chart with hover popups, and drag-to-scroll functionality. The React implementation uses REST API for data fetching, matching Voxel's AJAX patterns.

## Voxel JS Analysis

- **Total lines:** 179 (beautified with comments)
- **Original size:** 1.8KB
- **Framework:** Vue.js 3 (Vue.createApp)
- **Mixins:** Voxel.mixins.base

### Core Features

| Feature | Voxel Implementation |
|---------|---------------------|
| Tab navigation | Click handler switching activeChart |
| Prev/Next navigation | loadMore() with AJAX request |
| Bar chart | Items with percent-based height |
| Hover popup | showPopup()/hidePopup() with positioning |
| Drag scrolling | dragScroll() with mouse events |
| Auto-refresh | voxel:markup-update listener |

### Vue data() Properties

| Property | Purpose |
|----------|---------|
| loading | AJAX loading state |
| charts | Chart data collection |
| activeChart | Current tab ('this-week', etc.) |
| activeItem | Currently hovered bar item |
| scrollArea | Drag scroll state (isDown, scrollLeft, startX) |

### API Endpoint

| Endpoint | Method |
|----------|--------|
| `ajax_url&action=stripe_connect.sales_chart.get_data` | jQuery GET |

Request Parameters:
- `chart`: Chart key (e.g., "this-week")
- `date`: Current date for navigation
- `direction`: "prev" or "next"

## React Implementation Analysis

### File Structure
```
app/blocks/src/sales-chart/
├── frontend.tsx              (~514 lines) - Entry point with hydration
├── SalesChartComponent.tsx   (~448 lines) - UI component
├── types/
│   └── index.ts              - Comprehensive TypeScript types
├── utils/
│   └── index.ts              - Icon rendering utilities
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** 8.83 kB | gzip: 2.95 kB

### Architecture

The React block provides a complete standalone implementation:

1. **REST API data fetching** (`/voxel-fse/v1/sales-chart`)
2. **Same HTML structure** as Voxel's Vue template
3. **Same CSS classes** (`.ts-vendor-stats`, `.ts-chart`, `.bar-item`, etc.)
4. **Same interactive behaviors** (tabs, navigation, popup, drag scroll)

## Parity Checklist

### State Management

| Vue data() Property | React Implementation | Status |
|---------------------|---------------------|--------|
| loading | useState(false) | Done |
| charts | useState(config?.charts) | Done |
| activeChart | useState(attributes.ts_active_chart) | Done |
| activeItem | useState<ActiveItem \| null>(null) | Done |
| scrollArea.isDown | useRef (dragScrollState) | Done |
| scrollArea.startX | useRef (dragScrollState) | Done |
| scrollArea.scrollLeft | useRef (dragScrollState) | Done |

### Event Handlers

| Voxel Event | React Implementation | Status |
|-------------|---------------------|--------|
| Tab click | onClick setActiveChart | Done |
| Prev button click | onClick loadMore('prev') | Done |
| Next button click | onClick loadMore('next') | Done |
| Bar hover | onMouseOver showPopup | Done |
| Bar leave | onMouseLeave hidePopup | Done |
| Drag mousedown | addEventListener via useEffect | Done |
| Drag mouseup | addEventListener via useEffect | Done |
| Drag mousemove | addEventListener via useEffect | Done |
| Drag mouseleave | addEventListener via useEffect | Done |
| voxel:markup-update | document.addEventListener | Done |

### API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| Initial data | REST GET /voxel-fse/v1/sales-chart | Done |
| Load more | REST GET /voxel-fse/v1/sales-chart/load-more | Done |

### CSS Classes

| Voxel Class | React Usage | Status |
|-------------|-------------|--------|
| .ts-vendor-stats | Main container | Done |
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
| .ts-chart-nav | Navigation container | Done |
| .ts-icon-btn | Navigation buttons | Done |
| .vx-disabled | Disabled button state | Done |
| .vx-pending | Loading state | Done |
| .ts-no-posts | No activity state | Done |
| .min-scroll | Scroll container | Done |
| .min-scroll-h | Horizontal scroll | Done |
| .flexify | Flexbox helper | Done |
| .simplify-ul | List reset | Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | data-react-mounted check | Done |
| Loading state | isLoading prop with placeholder | Done |
| Error state | error prop with message | Done |
| No activity | has_activity check | Done |
| No chart data | currentChart null check | Done |
| Has prev/next | has_prev/has_next checks | Done |
| Turbo/PJAX navigation | turbo:load, turbo:render listeners | Done |
| Voxel markup update | voxel:markup-update listener | Done |
| Multisite support | getRestBaseUrl() | Done |
| Nonce authentication | X-WP-Nonce header | Done |

### Style Controls

| Control | React Attribute | Status |
|---------|-----------------|--------|
| ts_active_chart | ts_active_chart | Done |
| chart_icon | chart_icon | Done |
| ts_chevron_right | ts_chevron_right | Done |
| ts_chevron_left | ts_chevron_left | Done |
| All typography controls | CSS variables | Done |
| All color controls | CSS variables | Done |
| All border controls | CSS variables | Done |
| All shadow controls | CSS variables | Done |

### Interactive Features

| Feature | Voxel | React | Status |
|---------|-------|-------|--------|
| Tab switching | @click setActiveChart | onClick setActiveChart | Done |
| Prev navigation | @click loadMore('prev') | onClick loadMore('prev') | Done |
| Next navigation | @click loadMore('next') | onClick loadMore('next') | Done |
| Popup positioning | getBoundingClientRect | getBoundingClientRect | Done |
| Drag scroll | mousedown/up/move/leave | useEffect + addEventListener | Done |
| Loading overlay | loading state | loading state | Done |

## Code Quality

- TypeScript strict mode with comprehensive types
- normalizeConfig() for dual-format API compatibility (camelCase/snake_case/ts_*)
- normalizeChartsData() for chart data normalization
- useState for all reactive state
- useRef for popup and scroll area references
- useCallback for memoized event handlers
- useEffect for drag scroll setup and cleanup
- getRestBaseUrl() for multisite support
- X-WP-Nonce header for authenticated requests
- Re-initialization prevention with data-react-mounted
- Turbo/PJAX event listeners
- voxel:markup-update event listener

## Build Output

```
frontend.js  8.83 kB | gzip: 2.95 kB
Built in 91ms
```

## Conclusion

The sales-chart block has **100% parity** with Voxel's Vue.js implementation:

- Tab navigation (week/month/year/all-time)
- Prev/next time period navigation with AJAX
- Interactive bar chart with hover popups
- Popup positioning using getBoundingClientRect
- Drag-to-scroll functionality
- Loading state during AJAX requests
- No activity state display
- Same CSS classes throughout
- Same HTML structure for Voxel CSS compatibility
- Re-initialization prevention
- Turbo/PJAX and voxel:markup-update support

**Architecture:** Full React implementation with REST API - replaces Vue.js component

The React implementation provides equivalent functionality to Voxel's Vue.js component while being headless-ready for Next.js migration.
