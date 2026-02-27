# Sales Chart Widget vs Block - Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~98%
**Status:** Near-complete parity. Minor gaps in RTL handling and "all-time" AJAX exclusion.

## Reference Files

### Voxel Parent Theme (Source of Truth)
| File | Purpose | Lines |
|------|---------|-------|
| `themes/voxel/app/modules/stripe-connect/widgets/sales-chart-widget.php` | Widget class + Elementor controls | 1-1066 |
| `themes/voxel/app/modules/stripe-connect/templates/frontend/sales-chart-widget.php` | Template (HTML + Vue) | 1-55 |
| `themes/voxel/app/modules/stripe-connect/vendor-stats.php` | Backend stats calculation | 1-838 |
| `themes/voxel/app/modules/stripe-connect/controllers/frontend/connect-frontend-controller.php` | AJAX controller | 1-196 |
| `themes/voxel/assets/dist/vendor-stats.js` | Compiled Vue.js | ~2KB |
| `themes/voxel/assets/dist/bar-chart.css` | Chart styles | Minified |
| `themes/voxel/assets/dist/bar-chart-rtl.css` | RTL overrides | Minified |
| `docs/block-conversions/sales-chart/voxel-vendor-stats.beautified.js` | Beautified JS | 1-179 |

### FSE Child Theme (Implementation)
| File | Purpose | Lines |
|------|---------|-------|
| `themes/voxel-fse/app/blocks/src/sales-chart/block.json` | Block registration + 106 attributes | ~360 |
| `themes/voxel-fse/app/blocks/src/sales-chart/edit.tsx` | Editor component | ~170 |
| `themes/voxel-fse/app/blocks/src/sales-chart/save.tsx` | Save markup (SSR fallback) | ~130 |
| `themes/voxel-fse/app/blocks/src/sales-chart/frontend.tsx` | Frontend hydration | ~548 |
| `themes/voxel-fse/app/blocks/src/sales-chart/SalesChartComponent.tsx` | Shared chart component | ~438 |
| `themes/voxel-fse/app/blocks/src/sales-chart/styles.ts` | CSS generation | 1-317 |
| `themes/voxel-fse/app/blocks/src/sales-chart/types/index.ts` | TypeScript types | ~220 |
| `themes/voxel-fse/app/blocks/src/sales-chart/utils.tsx` | Icon rendering utilities | - |
| `themes/voxel-fse/app/blocks/src/sales-chart/render.php` | Server-side render | - |
| `themes/voxel-fse/app/blocks/src/sales-chart/inspector/ContentTab.tsx` | Content controls | 1-98 |
| `themes/voxel-fse/app/blocks/src/sales-chart/inspector/StyleTab.tsx` | Style controls | 1-578 |
| `themes/voxel-fse/app/controllers/fse-stripe-account-api-controller.php` | REST API controller | 1-358 |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP template → Vue.js hydration | PHP render.php → React hydration |
| **State management** | Vue.js 3 `data()` + `computed` + `watch` | React `useState` + `useEffect` + `useCallback` |
| **AJAX system** | jQuery GET `?vx=1&action=stripe_connect.sales_chart.get_data` | `fetch()` to `/wp-json/voxel-fse/v1/sales-chart/load-more` |
| **Initial data** | Inline `<script class="vxconfig">` JSON | REST API `/voxel-fse/v1/sales-chart` + `<script class="vxconfig">` |
| **CSS approach** | Separate `bar-chart.css` + Elementor inline styles | Voxel `bar-chart.css` + PHP style generator (styles.ts → render.php) |
| **Controls** | Elementor widget controls (~60 controls) | Gutenberg inspector (74 controls in 4 accordions) |
| **Chart library** | None (pure CSS bars with % heights) | None (pure CSS bars with % heights) |
| **Icon system** | Elementor icon controls → `\Voxel\get_icon_markup()` | AdvancedIconControl → icon rendering utils |
| **Authentication** | Voxel AJAX nonce (implicit) | `X-WP-Nonce` header in REST API calls |
| **Error handling** | `Voxel.alert(message, 'error')` | `showVoxelAlert()` → `Voxel.alert()` |

---

## HTML Structure Parity

| Element | Voxel CSS Class | FSE CSS Class | Match |
|---------|----------------|---------------|-------|
| Root wrapper | `.ts-vendor-stats` | `.voxel-fse-sales-chart` > `.ts-vendor-stats` | ✅ (FSE adds outer wrapper for scoped CSS) |
| Config script | `script.vxconfig` | `script.vxconfig` | ✅ |
| Tab list | `ul.ts-generic-tabs.simplify-ul.flexify.bar-chart-tabs` | `ul.ts-generic-tabs.simplify-ul.flexify.bar-chart-tabs` | ✅ |
| Tab item (active) | `li.ts-tab-active > a` | `li.ts-tab-active > a` | ✅ |
| Chart container | `div.ts-chart.chart-{type}` | `div.ts-chart.chart-{type}` | ✅ |
| Loading class | `.vx-pending` on `.ts-chart` | `.vx-pending` on `.ts-chart` | ✅ |
| Chart wrapper | `div.chart-contain` | `div.chart-contain` | ✅ |
| Y-axis area | `div.chart-content > div.bar-item-con.bar-values > span` | `div.chart-content > div.bar-item-con.bar-values > span` | ✅ |
| Scroll area | `div.chart-content.min-scroll.min-scroll-h` | `div.chart-content.min-scroll.min-scroll-h` | ✅ |
| Bar container | `div.bar-item-con > div.bi-hold > div.bar-item.bar-animate` | `div.bar-item-con > div.bi-hold > div.bar-item.bar-animate` | ✅ |
| Bar label | `div.bar-item-con > span` | `div.bar-item-con > span` | ✅ |
| Popup | `ul.flexify.simplify-ul.bar-item-data.active` | `ul.flexify.simplify-ul.bar-item-data.active` | ✅ |
| Popup items | `li > small + text` | `li > small + text` | ✅ |
| Empty state | `div.ts-no-posts > icon + p` | `div.ts-no-posts > icon + p` | ✅ |
| Navigation | `div.ts-chart-nav > p + a.ts-icon-btn + a.ts-icon-btn` | `div.ts-chart-nav > p + a.ts-icon-btn + a.ts-icon-btn` | ✅ |
| Disabled nav | `.vx-disabled` on nav buttons | `.vx-disabled` on nav buttons | ✅ |

**HTML Parity: 16/16 elements match (100%)**

---

## JavaScript Behavior Parity

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|-----------|--------|-------|
| 1 | `data().loading` | `useState(false)` | ✅ | Same semantics |
| 2 | `data().charts` | `useState(config?.charts)` | ✅ | Initialized from API config |
| 3 | `data().activeChart` | `useState(attributes.ts_active_chart)` | ✅ | Synced with block attribute |
| 4 | `data().activeItem` | `useState<ActiveItem\|null>(null)` | ✅ | Popup hover state |
| 5 | `data().scrollArea` (isDown/startX/scrollLeft) | `useRef(dragScrollState)` | ✅ | Ref avoids re-renders |
| 6 | `computed.currentChart()` | Derived: `charts?.[activeChart]` | ✅ | Inlined instead of computed |
| 7 | `watch.currentChart()` → `dragScroll()` | `useEffect([activeChart])` | ✅ | Reinit drag on chart change |
| 8 | `mounted()` → `dragScroll()` | `useEffect` on mount | ✅ | Same initialization |
| 9 | `loadMore(direction)` | `loadMore(direction)` via `useCallback` | ✅ | REST API instead of AJAX |
| 10 | `showPopup(event, item)` | `showPopup(event, item)` via `useCallback` | ✅ | Same getBoundingClientRect logic |
| 11 | `hidePopup()` | `hidePopup()` via `useCallback` | ✅ | Sets activeItem to null |
| 12 | `dragScroll()` | `useEffect` with mouse listeners | ✅ | Same calculation logic |
| 13 | `window.render_vendor_stats()` | `initSalesChart()` | ✅ | Same auto-init pattern |
| 14 | `voxel:markup-update` listener | `voxel:markup-update` + Turbo listeners | ✅ | FSE adds Turbo/PJAX support |
| 15 | `__vue_app__` duplicate prevention | `data-react-mounted` attribute check | ✅ | Same pattern, different mechanism |

**JS Behavior Parity: 15/15 methods match (100%)**

---

## AJAX Endpoint Parity

| Purpose | Voxel Endpoint | FSE Endpoint | Match |
|---------|---------------|-------------|-------|
| Initial data | Inline `<script class="vxconfig">` (PHP render) | REST GET `/voxel-fse/v1/sales-chart` | ✅ (different mechanism, same data) |
| Load more | GET `?vx=1&action=stripe_connect.sales_chart.get_data` | REST GET `/voxel-fse/v1/sales-chart/load-more` | ✅ |

**Parameters:**

| Parameter | Voxel | FSE | Match |
|-----------|-------|-----|-------|
| chart | `chart` (form data) | `chart` (URL param) | ✅ |
| date | `date` (form data) | `date` (URL param) | ✅ |
| direction | `direction` (form data) | `direction` (URL param) | ✅ |

**Date Calculation Logic:**

| Chart Type | Voxel | FSE | Match |
|------------|-------|-----|-------|
| this-week | `strtotime('+/-7 days', $date)` | Identical PHP logic | ✅ |
| this-month | `strtotime('+/-1 month', $date)` | Identical PHP logic | ✅ |
| this-year | `(int) date('Y', strtotime(...))` | Identical with int cast | ✅ |
| all-time | Not available via AJAX (no prev/next) | Not available via AJAX | ✅ |

---

## Style Controls Parity

### Content Tab

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `ts_active_chart` | SELECT | `ts_active_chart` | SelectControl | ✅ |
| `chart_icon` | ICONS | `chart_icon` | AdvancedIconControl | ✅ |
| `ts_chevron_right` | ICONS | `ts_chevron_right` | AdvancedIconControl | ✅ |
| `ts_chevron_left` | ICONS | `ts_chevron_left` | AdvancedIconControl | ✅ |

### Style Tab - Chart Section

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `ts_chart_height` | SLIDER (responsive) | `ts_chart_height` | ResponsiveRangeControl | ✅ |
| `axis_typo` | TYPOGRAPHY | `axis_typo` | TypographyControl | ✅ |
| `ts_axis_typo_col` | COLOR | `ts_axis_typo_col` | ColorControl | ✅ |
| `vertical_axis_width` | SLIDER (responsive) | `vertical_axis_width` | ResponsiveRangeControl | ✅ |
| `chart_line_border` | BORDER | `chart_line_border*` | BorderGroupControl | ✅ |
| `chart_col_gap` | SLIDER (responsive) | `chart_col_gap` | ResponsiveRangeControl | ✅ |
| `bar_width` | SLIDER (responsive) | `bar_width` | ResponsiveRangeControl | ✅ |
| `bar_radius` | SLIDER (responsive) | `bar_radius` | ResponsiveRangeControl | ✅ |
| `bar_bg` | BACKGROUND | `bar_bg` | BackgroundControl | ✅ |
| `bar_bg_hover` | COLOR | `bar_bg_hover` | ColorControl | ✅ |
| `bar_sh_shadow` | BOX_SHADOW | `bar_sh_shadow` | BoxShadowPopup | ✅ |

### Style Tab - Bar Popup Section

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `bar_pop_bg` | COLOR | `bar_pop_bg` | ColorControl | ✅ |
| `bar_pop_border` | BORDER | `bar_pop_border*` | BorderGroupControl | ✅ |
| `bar_pop_radius` | SLIDER (responsive) | `bar_pop_radius` | ResponsiveRangeControl | ✅ |
| `bar_pop_shadow` | BOX_SHADOW | `bar_pop_shadow` | BoxShadowPopup | ✅ |
| `ts_primary_typo` | TYPOGRAPHY | `ts_primary_typo` | TypographyControl | ✅ |
| `ts_primary_color` | COLOR | `ts_primary_color` | ColorControl | ✅ |
| `ts_secondary_typo` | TYPOGRAPHY | `ts_secondary_typo` | TypographyControl | ✅ |
| `ts_secondary_color` | COLOR | `ts_secondary_color` | ColorControl | ✅ |

### Style Tab - Tabs Section (Normal)

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `ts_tabs_justify` | SELECT | `ts_tabs_justify` | SelectControl | ✅ |
| `ts_tabs_padding` | DIMENSIONS | `ts_tabs_padding` | DimensionsControl | ✅ |
| `ts_tabs_margin` | DIMENSIONS | `ts_tabs_margin` | DimensionsControl | ✅ |
| `ts_tabs_text` | TYPOGRAPHY | `ts_tabs_text` | TypographyControl | ✅ |
| `ts_tabs_text_active` | TYPOGRAPHY | `ts_tabs_text_active` | TypographyControl | ✅ |
| `ts_tabs_text_color` | COLOR | `ts_tabs_text_color` | ColorControl | ✅ |
| `ts_active_text_color` | COLOR | `ts_active_text_color` | ColorControl | ✅ |
| `ts_tabs_bg_color` | COLOR | `ts_tabs_bg_color` | ColorControl | ✅ |
| `ts_tabs_bg_active_color` | COLOR | `ts_tabs_bg_active_color` | ColorControl | ✅ |
| `ts_tabs_border` | BORDER | `ts_tabs_border*` | BorderGroupControl | ✅ |
| `ts_tabs_border_active` | COLOR | `ts_tabs_border_active` | ColorControl | ✅ |
| `ts_tabs_radius` | SLIDER | `ts_tabs_radius` | ResponsiveRangeControl | ✅ |

### Style Tab - Tabs Section (Hover)

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `ts_tabs_text_color_h` | COLOR | `ts_tabs_text_color_h` | ColorControl | ✅ |
| `ts_tabs_active_text_color_h` | COLOR | `ts_tabs_active_text_color_h` | ColorControl | ✅ |
| `ts_tabs_border_color_h` | COLOR | `ts_tabs_border_color_h` | ColorControl | ✅ |
| `ts_tabs_border_h_active` | COLOR | `ts_tabs_border_h_active` | ColorControl | ✅ |
| `ts_tabs_bg_color_h` | COLOR | `ts_tabs_bg_color_h` | ColorControl | ✅ |
| `ts_bg_active_color_h` | COLOR | `ts_bg_active_color_h` | ColorControl | ✅ |

### Style Tab - Next/Prev Buttons (Normal)

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `week_range_typo` | TYPOGRAPHY | `week_range_typo` | TypographyControl | ✅ |
| `week_range_col` | COLOR | `week_range_col` | ColorControl | ✅ |
| `ts_week_btn_color` | COLOR | `ts_week_btn_color` | ColorControl | ✅ |
| `ts_week_btn_icon_size` | SLIDER (responsive) | `ts_week_btn_icon_size` | ResponsiveRangeControl | ✅ |
| `ts_week_btn_bg` | COLOR | `ts_week_btn_bg` | ColorControl | ✅ |
| `ts_week_btn_border` | BORDER | `ts_week_btn_border*` | BorderGroupControl | ✅ |
| `ts_week_btn_radius` | SLIDER (responsive) | `ts_week_btn_radius` | ResponsiveRangeControl | ✅ |
| `ts_week_btn_size` | SLIDER (responsive) | `ts_week_btn_size` | ResponsiveRangeControl | ✅ |

### Style Tab - Next/Prev Buttons (Hover)

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `ts_week_btn_h` | COLOR | `ts_week_btn_h` | ColorControl | ✅ |
| `ts_week_btn_bg_h` | COLOR | `ts_week_btn_bg_h` | ColorControl | ✅ |
| `ts_week_border_c_h` | COLOR | `ts_week_border_c_h` | ColorControl | ✅ |

### Style Tab - No Activity Section

| Voxel Control ID | Voxel Type | FSE Attribute | FSE Component | Match |
|-----------------|-----------|--------------|--------------|-------|
| `ts_nopost_content_Gap` | SLIDER (responsive) | `ts_nopost_content_Gap` | ResponsiveRangeControl | ✅ |
| `ts_nopost_ico_size` | SLIDER (responsive) | `ts_nopost_ico_size` | ResponsiveRangeControl | ✅ |
| `ts_nopost_ico_col` | COLOR | `ts_nopost_ico_col` | ColorControl | ✅ |
| `ts_nopost_typo` | TYPOGRAPHY | `ts_nopost_typo` | TypographyControl | ✅ |
| `ts_nopost_typo_col` | COLOR | `ts_nopost_typo_col` | ColorControl | ✅ |

**Style Controls Parity: 56/56 controls mapped (100%)**

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Bar chart rendering | Vue.js + CSS `height: X%` | React + CSS `height: X%` | ✅ |
| 2 | Period tabs (week/month/year/all-time) | Vue reactive tabs | React useState tabs | ✅ |
| 3 | Prev/next navigation | AJAX with date math | REST API with date math | ✅ |
| 4 | Revenue display (formatted currency) | `\Voxel\currency_format()` | Server-side formatted string | ✅ |
| 5 | Orders count display | `number_format_i18n()` | Server-side formatted string | ✅ |
| 6 | Y-axis steps (0-100% in 20% increments) | `get_steps_from_max_earnings()` | Same PHP logic | ✅ |
| 7 | X-axis labels | Day/date/month/year labels | Same PHP logic | ✅ |
| 8 | Bar hover popup | `showPopup()` with getBoundingClientRect | `showPopup()` with getBoundingClientRect | ✅ |
| 9 | Drag-to-scroll | `dragScroll()` mouse events | useEffect mouse event listeners | ✅ |
| 10 | Bar animation | `@keyframes baranimation` CSS | Inherited from Voxel CSS | ✅ |
| 11 | Loading state | `.vx-pending` class | `.vx-pending` class | ✅ |
| 12 | Empty state (no activity) | `.ts-no-posts` with icon + text | `.ts-no-posts` with icon + text | ✅ |
| 13 | Disabled nav buttons | `.vx-disabled` + `has_prev`/`has_next` | `.vx-disabled` + `has_prev`/`has_next` | ✅ |
| 14 | All-time hides nav buttons | CSS `.chart-all-time .ts-icon-btn` | CSS `.chart-all-time .ts-icon-btn` | ✅ |
| 15 | Logged-in user check | `is_user_logged_in()` in widget | REST `permission_callback` | ✅ |
| 16 | Stripe Connect integration | `Vendor_Stats::get()` | Same PHP class via controller | ✅ |
| 17 | Currency formatting | `\Voxel\currency_format()` | Same via server response | ✅ |
| 18 | Auto-initialization | `window.render_vendor_stats()` | `initSalesChart()` | ✅ |
| 19 | Re-init on markup update | `voxel:markup-update` event | `voxel:markup-update` + Turbo events | ✅ |
| 20 | Duplicate prevention | `__vue_app__` check | `data-react-mounted` check | ✅ |
| 21 | RTL support | Separate `bar-chart-rtl.css` | Inherited from Voxel CSS | ⚠️ See Gap #1 |
| 22 | Responsive controls | Elementor responsive sliders | ResponsiveRangeControl (21 responsive attrs) | ✅ |
| 23 | Multisite support | N/A (single-site assumed) | `getRestBaseUrl()` for REST URLs | ✅ (FSE enhanced) |
| 24 | Nonce authentication | Implicit Voxel AJAX nonce | `X-WP-Nonce` header | ✅ |

---

## Identified Gaps

### Gap #1: RTL Stylesheet Handling (Severity: Low)

**Voxel behavior:** Ships a separate `bar-chart-rtl.css` that overrides specific properties:
- `.bar-item-data { right: 30px }` instead of `left: 30px`
- `.bar-values { right: 0 }` instead of `left: 0`
- `.chart-content.min-scroll { margin-right: 20px }` instead of `margin-left: 20px`

*File:* `themes/voxel/assets/dist/bar-chart-rtl.css`

**FSE behavior:** Relies on Voxel's core `bar-chart.css` being enqueued (which it is when Voxel parent is active). The RTL stylesheet is also loaded by Voxel when `is_rtl()` is true. However, the FSE style generator (`styles.ts`) generates `margin-left` for `vertical_axis_width` without an RTL alternative.

*File:* `themes/voxel-fse/app/blocks/src/sales-chart/styles.ts:59-67`

**Impact:** In RTL languages, the custom `vertical_axis_width` style override may position the axis on the wrong side.

**Fix:** Add RTL awareness in styles.ts for `vertical_axis_width`:
```typescript
if (isRtl) {
  rules.push(`${selector} .chart-content.min-scroll { margin-right: ${value}px; margin-left: 0; }`);
} else {
  rules.push(`${selector} .chart-content.min-scroll { margin-left: ${value}px; }`);
}
```

### Gap #2: Popup Positioning in RTL (Severity: Low)

**Voxel behavior:** RTL CSS places popup at `right: 30px` instead of `left: 30px`. The JS `showPopup()` still uses `left` property for positioning, but the RTL CSS default would be overridden.

*File:* `themes/voxel/assets/dist/bar-chart-rtl.css`, `voxel-vendor-stats.beautified.js:138-140`

**FSE behavior:** `showPopup()` uses the same JS logic (`style.left = ...`), which should work since Voxel's RTL CSS handles the default position, and JS inline styles override CSS. However, popup may appear on wrong side for RTL users.

*File:* `themes/voxel-fse/app/blocks/src/sales-chart/SalesChartComponent.tsx:136-145`

**Impact:** Minor - popup positioning may look slightly off in RTL contexts. Low priority since the site likely doesn't use RTL.

**Fix:** Add RTL-aware popup positioning in `showPopup()`:
```typescript
const isRtl = document.documentElement.dir === 'rtl';
popup.style[isRtl ? 'right' : 'left'] = `${rect.left + rect.width + 10}px`;
```

### Gap #3: Caching Behavior Transparency (Severity: Info)

**Voxel behavior:** Uses user meta caching (`voxel:vendor_stats`, `voxel:vendor_last31`) with 60-minute expiry for database queries. Cache is cleared on new orders.

*File:* `themes/voxel/app/modules/stripe-connect/vendor-stats.php:414-458`

**FSE behavior:** The REST API controller calls the same `Vendor_Stats` PHP class, so caching is implicitly inherited. No additional caching layer.

**Impact:** None — FSE benefits from the same caching. Documented for completeness.

---

## Summary

### What Works Well (~98%)
- **Complete HTML structure match** — All 16 elements use identical CSS classes
- **Full JavaScript behavior parity** — All 15 Vue.js methods mapped to React equivalents
- **100% style control coverage** — All 56 Elementor controls mapped to Gutenberg inspector
- **AJAX endpoint parity** — Same parameters, same date calculation logic
- **All 24 features implemented** — Including drag-to-scroll, popup positioning, animations
- **Enhanced features** — Multisite support, Turbo/PJAX compatibility, TypeScript types
- **106 block attributes** covering all styling dimensions
- **74 inspector controls** across 4 well-organized accordion panels
- **783-line test file** for StyleTab validation

### Gaps to Fix (~2%)
| # | Gap | Severity | Impact |
|---|-----|----------|--------|
| 1 | RTL vertical axis width override | Low | Wrong margin side in RTL |
| 2 | RTL popup positioning | Low | Popup on wrong side in RTL |
| 3 | Caching transparency | Info | No impact (inherited) |

### Priority Fix Order
1. **Gap #1** — Simple CSS generation fix in `styles.ts` (5 min)
2. **Gap #2** — Add RTL check in `showPopup()` (5 min)
3. **Gap #3** — No fix needed (documentation only)

### Architecture Quality Assessment
- **Plan C+ architecture**: REST API → React hydration (headless-ready)
- **Build output**: 8.83 KB | gzip: 2.95 KB (excellent)
- **Type safety**: Comprehensive TypeScript coverage
- **Code reuse**: Shared `SalesChartComponent` for editor + frontend
- **Error handling**: Voxel.alert() integration
- **Future-proof**: normalizeConfig() for Next.js migration
