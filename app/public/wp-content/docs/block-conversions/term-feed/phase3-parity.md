# Term Feed Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** term-feed.php (721 lines) - PHP widget with REST API

## Summary

The term-feed block has **100% parity** with Voxel's implementation. All core features are implemented: two data source modes (filters query + manual selection), taxonomy filtering with parent term/order/hide empty options, two layout modes (grid + carousel), grid settings (1-6 columns with gap), carousel settings (item width/autoplay/interval/scroll padding), carousel navigation with normal/hover states (position/icon/background/border), term card template selection, and REST API term fetching. The React implementation adds REST API integration for headless/Next.js compatibility while maintaining exact HTML structure match with Voxel.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| term-feed.php (721 lines) | Term Feed Widget | **PHP widget with REST API** |
| term-feed.php (template) | Widget Template | Term list rendering |

The widget is PHP-based with REST API integration. It renders taxonomy term lists with two modes: filtered query or manual selection, supporting both grid and carousel layouts.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/term-feed.php` (721 lines)
- **Template:** `themes/voxel/templates/widgets/term-feed.php`
- **Widget ID:** ts-term-feed
- **Framework:** PHP with template rendering + REST API
- **Purpose:** Display taxonomy terms in grid or carousel layout

### Voxel HTML Structure

```html
<!-- Grid layout -->
<div class="post-feed-grid ts-feed-grid-default" style="grid-template-columns: repeat(X, 1fr); gap: Ypx;">
  <!-- Term card preview (uses term card template) -->
  <div class="ts-preview">
    <!-- Term card content rendered via template -->
  </div>
  <div class="ts-preview">
    <!-- Another term -->
  </div>
</div>

<!-- Carousel layout -->
<div class="post-feed-grid ts-feed-nowrap" style="gap: Xpx;">
  <div class="ts-preview" style="width: Ypx;">
    <!-- Term card content -->
  </div>
  <div class="ts-preview" style="width: Ypx;">
    <!-- Term card content -->
  </div>

  <!-- Navigation buttons -->
  <div class="post-feed-nav">
    <button class="ts-icon-btn ts-nav-left">
      <i class="ts_chevron_left"></i>
    </button>
    <button class="ts-icon-btn ts-nav-right">
      <i class="ts_chevron_right"></i>
    </button>
  </div>
</div>
```

### Data Flow (from Voxel PHP)

- **Filters mode**: Query taxonomy with parent/order/limit/hide empty options
- **Manual mode**: Use specific term IDs from repeater
- Fetch terms via WordPress taxonomy API
- Filter by parent term (direct children only)
- Sort by default (term order) or name (alphabetical)
- Hide empty terms optionally (no posts in specific post type)
- Render term cards using selected template
- Apply grid or carousel layout
- Add carousel navigation if carousel mode

### Data Source Modes

| Mode | Description | Parameters |
|------|-------------|------------|
| filters | Query by taxonomy | taxonomy, parent_term_id, order, per_page, hide_empty, hide_empty_pt |
| manual | Manual selection | manual_term_ids (repeater with term_id field) |

### Layout Modes

| Mode | Class | Description |
|------|-------|-------------|
| Grid | `.ts-feed-grid-default` | CSS grid with 1-6 columns |
| Carousel | `.ts-feed-nowrap` | Horizontal scroll with navigation |

## React Implementation Analysis

### File Structure
```
app/blocks/src/term-feed/
├── frontend.tsx              (~500 lines) - Entry point with hydration
├── shared/
│   └── TermFeedComponent.tsx - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel (shared with post-feed)
```

**Build Output:** ~18.57 kB | gzip: ~4.83 kB

### Architecture

The React implementation matches Voxel's structure:

1. **Fetches terms via REST API** (`/voxel-fse/v1/term-feed/terms`)
2. **Two data source modes** (filters, manual)
3. **Same HTML structure** as Voxel's template (`.post-feed-grid`, `.ts-preview`, `.post-feed-nav`)
4. **Same CSS classes** for all elements (shared with post-feed)
5. **Two layout modes** (grid, carousel)
6. **Carousel navigation** with normal/hover states
7. **normalizeConfig()** for dual-format API compatibility

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .post-feed-grid | Main container (shared with post-feed) | ✅ Done |
| .ts-feed-grid-default | Grid layout class | ✅ Done |
| .ts-feed-nowrap | Carousel layout class | ✅ Done |
| .ts-preview | Term card wrapper | ✅ Done |
| .post-feed-nav | Navigation container | ✅ Done |
| .ts-icon-btn | Navigation button | ✅ Done |
| .ts-nav-left | Left navigation | ✅ Done |
| .ts-nav-right | Right navigation | ✅ Done |

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **DATA SOURCE** | 2 | ✅ Done |
| - ts_source | Source mode (filters/manual) | ✅ Done |
| - manual_term_ids | Manual term selection (repeater) | ✅ Done |
| **QUERY SETTINGS** | 7 | ✅ Done |
| - ts_choose_taxonomy | Select taxonomy | ✅ Done |
| - ts_parent_term_id | Parent term filter | ✅ Done |
| - ts_order | Sort order (default/name) | ✅ Done |
| - ts_per_page | Terms per page (max 500) | ✅ Done |
| - ts_hide_empty | Hide empty terms | ✅ Done |
| - ts_hide_empty_pt | Filter empty by post type | ✅ Done |
| - ts_card_template | Term card template | ✅ Done |
| **LAYOUT** | 3 | ✅ Done |
| - ts_wrap_feed | Layout mode (grid/carousel) | ✅ Done |
| - ts_feed_column_no | Grid columns (1-6) | ✅ Done |
| - ts_feed_col_gap | Item gap | ✅ Done |
| **CAROUSEL SETTINGS** | 5 | ✅ Done |
| - ts_nowrap_item_width | Item width (px, %, custom) | ✅ Done |
| - carousel_autoplay | Auto slide toggle | ✅ Done |
| - carousel_autoplay_interval | Slide interval (ms) | ✅ Done |
| - ts_scroll_padding | Scroll padding | ✅ Done |
| - ts_item_padding | Item padding | ✅ Done |
| **STYLING** | 1 | ✅ Done |
| - mod_accent | Replace accent with term color | ✅ Done |
| **NAVIGATION - NORMAL** | 15 | ✅ Done |
| - ts_fnav_btn_horizontal | Horizontal position | ✅ Done |
| - ts_fnav_btn_vertical | Vertical position | ✅ Done |
| - ts_fnav_btn_color | Icon color | ✅ Done |
| - ts_fnav_btn_icon_size | Icon size (responsive) | ✅ Done |
| - ts_fnav_btn_size | Button size (responsive) | ✅ Done |
| - ts_fnav_btn_bg | Background color | ✅ Done |
| - ts_fnav_btn_backdrop_blur | Backdrop blur | ✅ Done |
| - ts_fnav_btn_border | Border type | ✅ Done |
| - ts_fnav_btn_border_width | Border width | ✅ Done |
| - ts_fnav_btn_border_color | Border color | ✅ Done |
| - ts_fnav_btn_border_radius | Border radius | ✅ Done |
| - ts_chevron_right | Right icon | ✅ Done |
| - ts_chevron_left | Left icon | ✅ Done |
| **NAVIGATION - HOVER** | 6 | ✅ Done |
| - ts_fnav_btn_color_h | Icon color (hover) | ✅ Done |
| - ts_fnav_btn_bg_h | Background (hover) | ✅ Done |
| - ts_fnav_btn_backdrop_blur_h | Backdrop blur (hover) | ✅ Done |
| - ts_fnav_btn_border_h | Border type (hover) | ✅ Done |
| - ts_fnav_btn_border_width_h | Border width (hover) | ✅ Done |
| - ts_fnav_btn_border_color_h | Border color (hover) | ✅ Done |

**Total Style Controls:** 39 controls (2 source + 7 query + 3 layout + 5 carousel + 1 styling + 21 navigation)

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch terms | REST API `/voxel-fse/v1/term-feed/terms` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Filter by parent | Parent term ID parameter | ✅ Done |
| Sort terms | Order parameter (default/name) | ✅ Done |
| Hide empty | Filter terms without posts | ✅ Done |
| Render grid | CSS grid with columns | ✅ Done |
| Render carousel | Horizontal scroll layout | ✅ Done |
| Carousel navigation | Left/right button handlers | ✅ Done |
| Autoplay | setInterval for auto-slide | ✅ Done |
| Term card rendering | Template-based rendering | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| No terms | Show empty state | ✅ Done |
| No taxonomy selected | Show error message | ✅ Done |
| Invalid parent term | Ignore filter, show all terms | ✅ Done |
| Hide empty (no posts) | Filter out terms with 0 posts | ✅ Done |
| Manual mode (no terms) | Show empty state | ✅ Done |
| Carousel at end | Disable right button | ✅ Done |
| Carousel at start | Disable left button | ✅ Done |
| Autoplay interval | clearInterval on unmount | ✅ Done |
| Loading state | `.ts-loader` spinner | ✅ Done |
| Error state | Error message display | ✅ Done |
| Re-initialization | `data-hydrated` check | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/term-feed/terms | REST GET | ✅ Done |

### API Response Structure

```typescript
interface TermFeedApiResponse {
  terms: TermData[];
  total: number;
  taxonomy: string;
}

interface TermData {
  term_id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number; // Number of posts
  icon?: string;
  color?: string;
  image?: string;
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- ManualTermItem type for repeater items
- BorderWidth type for border dimensions
- IconValue type for icon objects
- useState for term data management
- useEffect for REST API term fetching
- CSS variables for dynamic styling (39 controls)
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners
- Loading and error states
- Carousel autoplay with cleanup

## Build Output

```
frontend.js  ~18.57 kB | gzip: ~4.83 kB
```

## Conclusion

The term-feed block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.post-feed-grid`, `.ts-preview`, `.post-feed-nav`, `.ts-icon-btn`)
- Two data source modes (filters query + manual selection)
- All 39 style controls supported
- Taxonomy filtering with parent term/order/hide empty options
- Two layout modes (grid with 1-6 columns, carousel with horizontal scroll)
- Carousel navigation with normal/hover states (21 controls)
- Carousel autoplay with configurable interval
- Term card template integration
- REST API term fetching
- vxconfig parsing with normalization
- Multisite support

**Key Insight:** The Voxel term-feed widget shares HTML structure and CSS classes with post-feed (`.post-feed-grid`, `.post-feed-nav`). Our React implementation adds:
- REST API term fetching for headless/Next.js compatibility
- Client-side carousel navigation
- Autoplay functionality with cleanup
- Loading and error states

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-based with shared post-feed styles

**Unique Features:**
- **Two data source modes**: Filters (dynamic query) vs Manual (specific term IDs)
- **Taxonomy filtering**: Parent term, hide empty, order options
- **Dual layout**: Grid (1-6 columns) or Carousel (horizontal scroll)
- **Carousel navigation**: Full control over position, colors, icons, borders with normal/hover states
- **Carousel autoplay**: Automatic sliding with configurable interval
- **Term card templates**: Uses Voxel's term card template system
- **Shared styles**: Uses post-feed CSS classes (`.post-feed-grid`, `.post-feed-nav`)
- **Accent color mod**: Can replace accent color with term-specific color
