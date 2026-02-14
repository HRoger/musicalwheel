# Visit Chart Widget vs Block — Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~95%
**Status:** Near-complete. All core features implemented. Week navigation buttons are the only missing feature (controls + CSS exist but UI not rendered).

---

## Reference Files

| Source | File | Purpose |
|--------|------|---------|
| **Voxel Widget** | `themes/voxel/app/widgets/visits-chart.php` (1104 lines) | Elementor registration, 60+ controls |
| **Voxel Template** | `themes/voxel/templates/widgets/visits-chart.php` (60 lines) | Vue.js HTML template |
| **Voxel Controller** | `themes/voxel/app/controllers/frontend/statistics/visits-chart-controller.php` (353 lines) | AJAX handler, DB queries, caching |
| **Voxel JS** | `themes/voxel/assets/dist/visits-chart.js` (~2KB minified) | Vue 3 component |
| **Voxel CSS** | `themes/voxel/assets/dist/bar-chart.css` (~1.5KB, shared with sales-chart) | Shared bar chart styles |
| **FSE block.json** | `themes/voxel-fse/app/blocks/src/visit-chart/block.json` | 115 attributes |
| **FSE Component** | `themes/voxel-fse/app/blocks/src/visit-chart/shared/VisitChartComponent.tsx` | React chart component |
| **FSE edit.tsx** | `themes/voxel-fse/app/blocks/src/visit-chart/edit.tsx` | Editor preview |
| **FSE frontend.tsx** | `themes/voxel-fse/app/blocks/src/visit-chart/frontend.tsx` | Hydration entry |
| **FSE styles.ts** | `themes/voxel-fse/app/blocks/src/visit-chart/styles.ts` | CSS generation (~96 rules) |
| **FSE ContentTab** | `themes/voxel-fse/app/blocks/src/visit-chart/inspector/ContentTab.tsx` | 6 controls |
| **FSE StyleTab** | `themes/voxel-fse/app/blocks/src/visit-chart/inspector/StyleTab.tsx` | 60+ controls |
| **Beautified JS** | `docs/block-conversions/visit-chart/voxel-visits-chart.beautified.js` (203 lines) | Reference |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Framework** | Vue.js 3 (`Vue.createApp`) | React 18 (Plan C+ hydration) |
| **Rendering** | Server-side PHP template + Vue mount | Static HTML + `<script class="vxconfig">` → React hydration |
| **State** | Vue `data()` reactive object | React `useState` hooks |
| **Lazy loading** | Vue computed property (`currentChart`) triggers `loadChart()` | `useEffect` watches `activeChart` + `loaded` flag |
| **Config** | `<script class="vxconfig">` inside `.elementor-element` | `<script class="vxconfig">` inside block root |
| **AJAX** | Single call: `jQuery.get(Voxel_Config.ajax_url + '&action=tracking.get_chart_data')` | Two-call: REST `/wp-json/voxel-fse/v1/visit-chart/context` (nonce) + Voxel AJAX (data) |
| **CSS** | Elementor inline styles from controls | `generateVisitChartResponsiveCSS()` in `<style>` tag |
| **Scroll** | `this.$refs.scrollArea` + mouse events | `useRef(scrollAreaRef)` + mouse events |
| **Popup** | `this.$refs.popup` + smart positioning | `useRef(popupRef)` + same algorithm |
| **Re-init** | `voxel:markup-update` event | `voxel:markup-update` + `turbo:load` + `pjax:complete` |
| **Double-mount** | `if (!t.__vue_app__)` | `data-reactMounted` attribute check |

---

## HTML Structure Parity

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `.ts-visits-chart[v-cloak]` | `.ts-visits-chart.voxel-fse-visit-chart-frontend.voxel-fse-visit-chart-{blockId}` | ✅ (extra classes for scoping) |
| Inline `<style>` | None (Elementor handles) | `<style>` with responsive CSS | ✅ Equivalent |
| Config JSON | `<script class="vxconfig">` | `<script class="vxconfig">` | ✅ |
| Tab list | `ul.ts-generic-tabs.simplify-ul.flexify.bar-chart-tabs` | `ul.ts-generic-tabs.simplify-ul.flexify.bar-chart-tabs` | ✅ |
| Tab items (×4) | `li` with `:class="{'ts-tab-active': active_chart === 'XXX'}"` | `li` with `className={activeChart === 'XXX' ? 'ts-tab-active' : ''}` | ✅ |
| Tab links | `<a href="#" @click.prevent>` | `<a href="#" onClick={e => { e.preventDefault(); ... }}>` | ✅ |
| Chart wrapper | `div.ts-chart` with `:class="[loading ? 'vx-pending' : '', 'chart-' + active_chart]"` | `div.ts-chart` with `className={loading ? 'vx-pending' : ''} chart-{activeChart}` | ✅ |
| Loading state | `div.chart-contain > div.ts-no-posts` (v-if loaded===false) | Same structure (conditional render) | ✅ |
| Y-axis overlay | `div.chart-content > div.bar-item-con.bar-values > span` (v-for steps) | Same structure (map over steps) | ✅ |
| Scrollable bars | `div.chart-content.min-scroll.min-scroll-h[ref="scrollArea"]` | `div.chart-content.min-scroll.min-scroll-h ref={scrollAreaRef}` | ✅ |
| Bar containers | `div.bar-item-con > div.bi-hold > div.bar-item.bar-animate` | Same structure | ✅ |
| Bar height | `:style="{height: item.percent + '%'}"` | `style={{ height: item.percent + '%' }}` | ✅ |
| X-axis labels | `<span>{{ item.label }}</span>` | `<span>{item.label}</span>` | ✅ |
| Popup | `ul.flexify.simplify-ul.bar-item-data[ref="popup"]` with `.active` class | Same structure with `ref={popupRef}` | ✅ |
| Popup items | `li > small + text` (Views, Unique views) | Same | ✅ |
| No activity | `div.ts-no-posts > icon + p` | Same | ✅ |
| Week nav | `div.ts-chart-nav` (commented out in template) | **NOT RENDERED** | ⚠️ Both absent from output |
| Grid overlay | Two `.chart-content` at same grid position | Same CSS Grid approach | ✅ |

---

## JavaScript Behavior Parity

| # | Voxel Method | FSE Equivalent | Parity | Notes |
|---|-------------|----------------|--------|-------|
| 1 | `loadChart(timeframe)` — jQuery.get AJAX | `loadChart(timeframe)` — fetch/voxelAjax | ✅ | Same endpoint, params, response handling |
| 2 | `showPopup(event, item)` — smart left/right positioning | `showPopup(event, item)` — same algorithm | ✅ | Same `window.innerWidth - rect.right >= popup.width + 10` check |
| 3 | `hidePopup()` — set `activeItem = null` | `hidePopup()` — `setActiveItem(null)` | ✅ |
| 4 | `dragScroll()` — mousedown/move/up/leave events | Drag scroll via `useEffect` + `useRef` | ✅ | Same event pattern, same delta calculation |
| 5 | `currentChart` computed — lazy load trigger | `useEffect` with `activeChart` dep — lazy load | ✅ | Different mechanism, same behavior |
| 6 | `watch: currentChart` — re-init drag scroll | `useEffect` re-runs — re-init drag scroll | ✅ |
| 7 | `mounted()` → `$nextTick()` → `dragScroll()` | `useEffect([], ...)` → setup drag scroll | ✅ |
| 8 | `requestAnimationFrame(() => scrollLeft = scrollWidth)` | Same auto-scroll pattern | ✅ |
| 9 | `window.render_visits_chart()` global | React hydration via `frontend.tsx` | ✅ Different approach, same result |
| 10 | `voxel:markup-update` listener | `voxel:markup-update` + `turbo:load` + `pjax:complete` | ✅ FSE has more |

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Config/nonce | Inline `<script class="vxconfig">` with nonce | REST `GET /wp-json/voxel-fse/v1/visit-chart/context` | ✅ Different delivery, same data |
| Chart data | `GET /?vx=1&action=tracking.get_chart_data` | Same Voxel AJAX endpoint | ✅ |
| Request params | `source, post_id, timeframe, view_type, _wpnonce` | Same params | ✅ |
| Success response | `{ success: true, data: { steps, items, meta, views } }` | Same format consumed | ✅ |
| Error response | `{ success: false, message, code }` + `Voxel.alert()` | Same + `Voxel.alert()` | ✅ |
| Permission: post | `is_editable_by_current_user()` | Same (via REST controller) | ✅ |
| Permission: user | Logged-in check + user-specific nonce | Same | ✅ |
| Permission: site | Nonce-only (no admin check) | `manage_options` capability check | ✅ FSE is stricter |

---

## Style Controls Parity

### Chart Section (Voxel: 12 controls → FSE: 12+ controls)

| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `ts_chart_height` (responsive slider) | `chartHeight` / `chartHeightTablet` / `chartHeightMobile` | ✅ |
| `axis_typo` (typography group) | `axisTypography` | ✅ |
| `ts_axis_typo_col` (color) | `axisTextColor` | ✅ |
| `vertical_axis_width` (responsive slider) | `verticalAxisWidth` + tablet/mobile | ✅ |
| `chart_line_border` (border group) | `chartLineBorderType` + width/color | ✅ |
| `chart_col_gap` (responsive slider) | `barGap` + tablet/mobile | ✅ |
| `bar_width` (responsive slider) | `barWidth` + tablet/mobile | ✅ |
| `bar_radius` (responsive slider) | `barRadius` + tablet/mobile | ✅ |
| `bar_bg` (background group: classic + gradient) | `barBackground` / `barBackgroundGradient` | ✅ |
| `bar_bg_hover` (color) | `barHoverBackground` | ✅ |
| `bar_sh_shadow` (box shadow group) | `barBoxShadow` | ✅ |

### Bar Popup (Voxel: 8 controls → FSE: 8+ controls)

| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `bar_pop_bg` (color) | `popupBackground` | ✅ |
| `bar_pop_border` (border group) | `popupBorderType` + width/color | ✅ |
| `bar_pop_radius` (responsive slider) | `popupBorderRadius` + tablet/mobile | ✅ |
| `bar_pop_shadow` (box shadow group) | `popupBoxShadow` | ✅ |
| `ts_primary_typo` (typography) | `popupValueTypography` | ✅ |
| `ts_primary_color` (color) | `popupValueColor` | ✅ |
| `ts_secondary_typo` (typography) | `popupLabelTypography` | ✅ |
| `ts_secondary_color` (color) | `popupLabelColor` | ✅ |

### Tabs Section (Voxel: 18 controls → FSE: 18+ controls)

| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `ts_tabs_justify` (select) | `tabsJustify` | ✅ |
| `ts_tabs_padding` (dimensions) | `tabsPadding` | ✅ |
| `ts_tabs_margin` (dimensions) | `tabsMargin` | ✅ |
| `ts_tabs_text` (typography) | `tabsTypography` | ✅ |
| `ts_tabs_text_active` (typography) | `tabsActiveTypography` | ✅ |
| `ts_tabs_text_color` (color) | `tabsTextColor` | ✅ |
| `ts_active_text_color` (color) | `tabsActiveTextColor` | ✅ |
| `ts_tabs_bg_color` (color) | `tabsBackgroundColor` | ✅ |
| `ts_tabs_bg_active_color` (color) | `tabsActiveBackgroundColor` | ✅ |
| `ts_tabs_border` (border group) | `tabsBorderType` + width/color | ✅ |
| `ts_tabs_border_active` (color) | `tabsActiveBorderColor` | ✅ |
| `ts_tabs_radius` (responsive slider) | `tabsBorderRadius` + tablet/mobile | ✅ |
| Hover: `ts_tabs_text_color_h` | `tabsTextColorHover` | ✅ |
| Hover: `ts_tabs_active_text_color_h` | `tabsActiveTextColorHover` | ✅ |
| Hover: `ts_tabs_border_color_h` | `tabsBorderColorHover` | ✅ |
| Hover: `ts_tabs_border_h_active` | `tabsActiveBorderColorHover` | ✅ |
| Hover: `ts_tabs_bg_color_h` | `tabsBackgroundColorHover` | ✅ |
| Hover: `ts_bg_active_color_h` | `tabsActiveBackgroundColorHover` | ✅ |

### Week Buttons (Voxel: 12 controls → FSE: 12+ controls)

| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `week_range_typo` (typography) | `weekRangeTypography` | ✅ |
| `week_range_col` (color) | `weekRangeColor` | ✅ |
| `ts_week_btn_color` (color) | `weekBtnIconColor` | ✅ |
| `ts_week_btn_icon_size` (responsive) | `weekBtnIconSize` + tablet/mobile | ✅ |
| `ts_week_btn_bg` (color) | `weekBtnBackground` | ✅ |
| `ts_week_btn_border` (border group) | `weekBtnBorderType` + width/color | ✅ |
| `ts_week_btn_radius` (responsive) | `weekBtnBorderRadius` + tablet/mobile | ✅ |
| `ts_week_btn_size` (responsive) | `weekBtnSize` + tablet/mobile | ✅ |
| Hover: `ts_week_btn_h` | `weekBtnIconColorHover` | ✅ |
| Hover: `ts_week_btn_bg_h` | `weekBtnBackgroundHover` | ✅ |
| Hover: `ts_week_border_c_h` | `weekBtnBorderColorHover` | ✅ |

### No Activity (Voxel: 5 controls → FSE: 5+ controls)

| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `ts_nopost_content_Gap` (responsive slider) | `noPostGap` + tablet/mobile | ✅ |
| `ts_nopost_ico_size` (responsive slider) | `noPostIconSize` + tablet/mobile | ✅ |
| `ts_nopost_ico_col` (color) | `noPostIconColor` | ✅ |
| `ts_nopost_typo` (typography) | `noPostTypography` | ✅ |
| `ts_nopost_typo_col` (color) | `noPostTextColor` | ✅ |

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | CSS-based bar chart (no Chart.js) | ✅ Flex/Grid + percentage heights | ✅ Same approach | ✅ |
| 2 | 4 timeframe tabs (24h/7d/30d/12m) | ✅ `.ts-generic-tabs` | ✅ Same classes | ✅ |
| 3 | Lazy load on tab select | ✅ Via computed property | ✅ Via useEffect | ✅ |
| 4 | View type (total/unique) | ✅ Elementor control only | ✅ Inspector control only | ✅ |
| 5 | Loading state ("Loading data") | ✅ `.ts-no-posts` + icon | ✅ Same | ✅ |
| 6 | Loading overlay (`.vx-pending`) | ✅ On `.ts-chart` | ✅ Same | ✅ |
| 7 | No activity state | ✅ `meta.has_activity` check | ✅ Same check | ✅ |
| 8 | Hover popup (Views + Unique views) | ✅ Fixed position + `.active` | ✅ Same | ✅ |
| 9 | Smart popup positioning (L/R) | ✅ `window.innerWidth - rect.right` | ✅ Same algorithm | ✅ |
| 10 | Drag-to-scroll | ✅ 4 mouse event listeners | ✅ Same events | ✅ |
| 11 | Auto-scroll to latest | ✅ `rAF(() => scrollLeft = scrollWidth)` | ✅ Same | ✅ |
| 12 | Bar animation (`.bar-animate`) | ✅ CSS keyframe | ✅ Same class | ✅ |
| 13 | Y-axis grid overlay | ✅ CSS Grid dual-layer | ✅ Same approach | ✅ |
| 14 | AJAX caching (server-side) | ✅ Controller cache | ✅ Same endpoint | ✅ |
| 15 | Permission checks (post/user/site) | ✅ Nonce + ownership | ✅ REST + nonce | ✅ |
| 16 | Week navigation buttons (prev/next) | ⚠️ Template commented out | ⚠️ Not rendered | ⚠️ Both absent |
| 17 | Voxel.alert() for errors | ✅ | ✅ | ✅ |
| 18 | Double-mount prevention | ✅ `__vue_app__` check | ✅ `data-reactMounted` check | ✅ |
| 19 | Turbo/PJAX support | ❌ Not supported | ✅ Added | ✅+ (FSE exceeds) |
| 20 | Editor live preview | ✅ `is_edit_mode()` script injection | ✅ React ServerSideRender | ✅ |

---

## Identified Gaps

### Gap #1: Week Navigation Buttons (Severity: Low)

**Voxel behavior:** Week navigation is **commented out in the Voxel template** (visits-chart.php template lines 54-56). The controls exist (widget.php:714-951) and CSS exists (`.ts-chart-nav`), but the UI is intentionally disabled.

**FSE behavior:** Week navigation is also **not rendered** in `VisitChartComponent.tsx`. Inspector controls exist, CSS rules are generated in `styles.ts`, but the HTML is not output.

**Impact:** None — both implementations are equivalent (feature disabled in both). The controls exist in both for future activation.

**Status:** ✅ Actually parity — both have the feature prepared but disabled.

### Gap #2: Site Stats Permission Model (Severity: Low — FSE is stricter)

**Voxel behavior:** Site source uses nonce-only verification (`'ts-visits-chart--site'`) with no explicit `manage_options` check (controller.php:95).

**FSE behavior:** REST endpoint checks `manage_options` capability before returning context.

**Impact:** FSE is actually **more secure** than Voxel. Not a parity gap — it's an improvement.

---

## Summary

### What Works Well (95%+)

- **HTML Structure:** 1:1 match with all Voxel CSS classes preserved
- **JavaScript Behavior:** All 4 Vue methods replicated in React (loadChart, showPopup, hidePopup, dragScroll)
- **AJAX Integration:** Same Voxel AJAX endpoint with same params/response handling
- **Style Controls:** All 60+ Elementor controls mapped to Gutenberg inspector controls
- **CSS Generation:** 96 rules covering all responsive breakpoints
- **Loading/Empty States:** Identical user experience
- **Popup Positioning:** Same smart left/right algorithm
- **Drag Scroll:** Same mouse event pattern with same calculations
- **Security:** Matching or stricter permission model

### Gaps to Fix (0%)

**No actionable gaps identified.** The only "gap" (week navigation) is equally absent from both Voxel and FSE — it's a prepared but disabled feature in both codebases.

### Revised Parity Assessment: ~98%

The 2% difference accounts for:
- Architectural differences (React vs Vue, REST API layer) — expected and intentional
- Additional FSE features (Turbo/PJAX, stricter site-stats auth) — improvements, not gaps

### Priority Fix Order

No fixes needed. The visit-chart block has excellent parity with the Voxel widget.
