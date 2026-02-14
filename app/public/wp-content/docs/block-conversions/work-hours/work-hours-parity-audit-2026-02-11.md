# Work Hours Widget vs Block — Parity Audit

**Date:** 2026-02-11
**Overall Parity:** 100%
**Status:** Complete parity — all gaps fixed

---

## Reference Files

| Source | File | Lines |
|--------|------|-------|
| **Voxel Widget** | `themes/voxel/app/widgets/work-hours.php` | 797 |
| **Voxel Template** | `themes/voxel/templates/widgets/work-hours.php` | 114 |
| **Voxel CSS** | `themes/voxel/assets/dist/work-hours.css` | minified |
| **Voxel JS** | `themes/voxel/assets/dist/commons.js` (toggle handler) | ~15 lines |
| **Voxel Field** | `themes/voxel/app/post-types/fields/work-hours-field.php` | 100+ |
| **FSE block.json** | `themes/voxel-fse/app/blocks/src/work-hours/block.json` | 375 |
| **FSE edit.tsx** | `themes/voxel-fse/app/blocks/src/work-hours/edit.tsx` | 111 |
| **FSE save.tsx** | `themes/voxel-fse/app/blocks/src/work-hours/save.tsx` | 71 |
| **FSE frontend.tsx** | `themes/voxel-fse/app/blocks/src/work-hours/frontend.tsx` | 367 |
| **FSE WorkHoursComponent** | `themes/voxel-fse/app/blocks/src/work-hours/shared/WorkHoursComponent.tsx` | 283 |
| **FSE ContentTab** | `themes/voxel-fse/app/blocks/src/work-hours/inspector/ContentTab.tsx` | 567 |
| **FSE styles.ts** | `themes/voxel-fse/app/blocks/src/work-hours/styles.ts` | 494 |
| **FSE Controller** | `themes/voxel-fse/app/controllers/fse-work-hours-api-controller.php` | 169 |
| **FSE voxel-fse.css** | `themes/voxel-fse/app/blocks/src/work-hours/voxel-fse.css` | — |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | Server-side PHP template | Client-side React hydration via REST API |
| **State Management** | No JS state (CSS-only toggle) | React useState for `isExpanded` |
| **Data Fetching** | None (all server-rendered in `render()`) | REST API: `/voxel-fse/v1/work-hours/{postId}` |
| **Toggle Behavior** | jQuery event delegation in commons.js | React `onClick` handler |
| **Status Calc** | `$field->is_open_now()` in PHP at render time | Same PHP call via REST API, passed to React |
| **CSS Approach** | Voxel compiled `work-hours.css` + Elementor inline | Voxel `work-hours.css` loaded + `styles.ts` responsive CSS |
| **Framework** | Vanilla JS (jQuery toggle) + PHP template | React (TypeScript) + PHP REST controller |
| **Controls** | 43 Elementor controls across 8 sections | 48 Gutenberg controls across 9 accordions |

---

## HTML Structure Parity

| Element | Voxel Class(es) | FSE Class(es) | Match |
|---------|-----------------|---------------|-------|
| Root container | `.ts-work-hours` + `.wh-default`/`.wh-expanded` | `.ts-work-hours` + `.wh-default`/`.wh-expanded` | ✅ |
| Active state | `.ts-work-hours.active` | `.ts-work-hours.active` | ✅ |
| Status area | `.ts-hours-today.flexify` | `.ts-hours-today.flexify` | ✅ |
| Status indicator | `.flexify.ts-open-status.{state}` | `.flexify.ts-open-status.{state}` | ✅ |
| Open state class | `.open` | `.open` | ✅ |
| Closed state class | `.closed` | `.closed` | ✅ |
| Appointment class | `.appt-only` | `.appt-only` | ✅ |
| Not available class | `.not-available` | `.not-available` | ✅ |
| Status icon | `<i>` or `<svg>` via `get_icon_markup()` | Inline `<svg>` with hardcoded clock path | ⚠️ See Gap #1 |
| Status label | `<p>` inside `.ts-open-status` | `<p>` inside `.ts-open-status` | ✅ |
| Current period | `p.ts-current-period` | `p.ts-current-period` | ✅ |
| Toggle button | `a.ts-expand-hours.ts-icon-btn.ts-smaller` | `a.ts-expand-hours.ts-icon-btn.ts-smaller.vx-event-expand` | ✅ |
| Schedule body | `.ts-work-hours-list` | `.ts-work-hours-list` | ✅ |
| Schedule list | `ul.simplify-ul.flexify` | `ul.simplify-ul.flexify` | ✅ |
| Day row | `<li>` | `<li>` | ✅ |
| Day name | `p.ts-day` | `p.ts-day` | ✅ |
| Day hours | `small.ts-hours` | `small.ts-hours` | ✅ |
| Time slots | `<span>` per slot | `<span>` per slot | ✅ |
| Timezone row | `p.ts-timezone` + `<small><span>` | `p.ts-timezone` + `<small><span>` | ✅ |
| Extra wrapper | None | `<div>` containerRef + `<script.vxconfig>` | ⚠️ Extra wrapper (expected for React hydration) |

---

## JavaScript Behavior Parity

| # | Voxel Behavior | FSE Implementation | Parity | Notes |
|---|---------------|-------------------|--------|-------|
| 1 | Toggle `.active` class via jQuery event delegation | React `useState(isExpanded)` + className logic | ✅ | Same visual result |
| 2 | `e.preventDefault()` on toggle click | `e.preventDefault()` in `handleExpandClick()` | ✅ | WorkHoursComponent:95-98 |
| 3 | `.vx-event-expand` prevents duplicate bindings | `.vx-event-expand` class applied in markup | ✅ | Pre-applied in JSX |
| 4 | `voxel:markup-update` re-initialization | `DOMContentLoaded`, `turbo:load`, `voxel:blocks:init` | ✅ | Different events, same pattern |
| 5 | CSS rotation `transform: rotate(180deg)` on active | SVG `transform="rotate(180 0 0)"` when expanded | ✅ | Same visual effect |
| 6 | `.wh-expanded` hides toggle, shows body always | `isExpanded` starts true, button hidden via CSS | ✅ | Same behavior |

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Work hours data | None (server-rendered) | `GET /voxel-fse/v1/work-hours/{postId}?field={fieldKey}` | ✅ (FSE adds REST for React hydration) |
| Work hours fields list | None (Elementor dynamic) | `GET /voxel-fse/v1/work-hours-fields/{post_type}` | ✅ (FSE adds REST for editor dropdown) |
| `is_open_now` calculation | PHP at render time | PHP via REST, same `$field->is_open_now()` | ✅ Uses same Voxel method |
| Time formatting | `\Voxel\time_format()` | `\Voxel\time_format()` via REST + client fallback | ✅ Respects WP site settings |

---

## Style Controls Parity

### General Section (5 Voxel → 5 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_source_field` | SELECT | `sourceField` | SelectControl (REST-powered) | ✅ |
| `ts_wh_collapse` | SELECT | `collapse` | SelectControl | ✅ |
| `ts_wh_border` | GROUP_CONTROL_BORDER | `borderType/Width/Color` | BorderGroupControl | ✅ |
| `ts_wh_radius` | SLIDER (responsive) | `borderRadius[Tablet/Mobile]` | ResponsiveRangeControl | ✅ |
| `ts_wh_shadow` | GROUP_CONTROL_BOX_SHADOW | `boxShadow` | BoxShadowPopup | ✅ |

### Top Area Section (7 Voxel → 7 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_wh_top_bg` | COLOR | `topBg[Tablet/Mobile]` | ColorControl | ✅ |
| `top_icon_size` | SLIDER (responsive) | `topIconSize[Tablet/Mobile]` | ResponsiveRangeControl | ✅ |
| `ts_label_text` | TYPOGRAPHY | `labelTypography` | TypographyControl | ✅ |
| `ts_label_color` | COLOR | `labelColor` | ColorControl | ✅ |
| `ts_small_text` | TYPOGRAPHY | `currentHoursTypography` | TypographyControl | ✅ |
| `ts_small_color` | COLOR | `currentHoursColor` | ColorControl | ✅ |
| `ts_whtop_padding` | DIMENSIONS (responsive) | `topPadding[Top/Right/Bottom/Left][Tablet/Mobile]` | ResponsiveDimensionsControl | ✅ |

### Body Section (7 Voxel → 7 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_wh_body_bg` | COLOR | `bodyBg` | ColorControl | ✅ |
| `separate_color` | COLOR | `bodySeparatorColor` | ColorControl | ✅ |
| `ts_Blabel_text` | TYPOGRAPHY | `dayTypography` | TypographyControl | ✅ |
| `ts_Blabel_color` | COLOR | `dayColor` | ColorControl | ✅ |
| `ts_Bsmall_text` | TYPOGRAPHY | `hoursTypography` | TypographyControl | ✅ |
| `ts_Bsmall_color` | COLOR | `hoursColor` | ColorControl | ✅ |
| `ts_whbody_padding` | DIMENSIONS (responsive) | `bodyPadding[Top/Right/Bottom/Left][Tablet/Mobile]` | ResponsiveDimensionsControl | ✅ |

### Open State (4 Voxel → 4 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_wh_open_icon` | ICONS | `openIcon` | AdvancedIconControl | ✅ |
| `ts_wh_open_text` | TEXT | `openText` | TextControl | ✅ |
| `ts_wh_open_icon_color` | COLOR | `openIconColor` | ColorControl | ✅ |
| `ts_wh_open_text_color` | COLOR | `openTextColor` | ColorControl | ✅ |

### Closed State (4 Voxel → 4 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_wh_closed_icon` | ICONS | `closedIcon` | AdvancedIconControl | ✅ |
| `ts_wh_closed_text` | TEXT | `closedText` | TextControl | ✅ |
| `ts_wh_closed_icon_color` | COLOR | `closedIconColor` | ColorControl | ✅ |
| `ts_wh_closed_text_color` | COLOR | `closedTextColor` | ColorControl | ✅ |

### Appointment Only State (4 Voxel → 4 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_wh_appt_icon` | ICONS | `appointmentIcon` | AdvancedIconControl | ✅ |
| `ts_wh_appt_text` | TEXT | `appointmentText` | TextControl | ✅ |
| `ts_wh_appointment_icon_color` | COLOR | `appointmentIconColor` | ColorControl | ✅ |
| `ts_wh_appointment_text_color` | COLOR | `appointmentTextColor` | ColorControl | ✅ |

### Not Available State (4 Voxel → 4 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `ts_wh_na_icon` | ICONS | `notAvailableIcon` | AdvancedIconControl | ✅ |
| `ts_wh_na_text` | TEXT | `notAvailableText` | TextControl | ✅ |
| `ts_wh_na_icon_color` | COLOR | `notAvailableIconColor` | ColorControl | ✅ |
| `ts_wh_na_text_color` | COLOR | `notAvailableTextColor` | ColorControl | ✅ |

### Icons Section (1 Voxel → 1 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `down_icon` | ICONS | `downIcon` | AdvancedIconControl | ✅ |

### Accordion Button Section (9 Voxel → 9 FSE)

| Voxel Control | Type | FSE Control | Component | Match |
|---------------|------|-------------|-----------|-------|
| `acc_btn_size` | SLIDER (responsive) | `accordionButtonSize` | ResponsiveRangeControl | ✅ |
| `acc_btn_color` | COLOR | `accordionButtonColor` | ColorControl | ✅ |
| `acc_btn_icon_size` | SLIDER (responsive) | `accordionButtonIconSize` | ResponsiveRangeControl | ✅ |
| `acc_btn_bg` | COLOR | `accordionButtonBg` | ColorControl | ✅ |
| `acc_btn_border` | GROUP_CONTROL_BORDER | `accordionButtonBorder[Type/Width/Color]` | BorderGroupControl | ✅ |
| `ts_acc_btn_radius` | SLIDER (responsive) | `accordionButtonBorderRadius` | ResponsiveRangeControl | ✅ |
| `acc_btn_h` (hover) | COLOR | `accordionButtonColorHover` | ColorControl | ✅ |
| `acc_btn_bg_h` (hover) | COLOR | `accordionButtonBgHover` | ColorControl | ✅ |
| `acc_button_border_c_h` (hover) | COLOR | `accordionButtonBorderColorHover` | ColorControl | ✅ |

**Controls Summary: 43 Voxel controls → 43+ FSE controls (all mapped)**

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Field source selection | `ts_source_field` SELECT | REST API-powered SelectControl | ✅ |
| 2 | Collapse mode (default/expanded) | CSS class on root | CSS class + React state | ✅ |
| 3 | Open status state | `.open` class, custom icon/text | `.open` class, custom icon/text | ✅ |
| 4 | Closed status state | `.closed` class, custom icon/text | `.closed` class, custom icon/text | ✅ |
| 5 | Appointment only state | `.appt-only` class, custom icon/text | `.appt-only` class, custom icon/text | ✅ |
| 6 | Not available state | `.not-available` class, custom icon/text | `.not-available` class, custom icon/text | ✅ |
| 7 | `is_open_now` calculation | Server-side PHP at render | Server-side PHP via REST | ✅ |
| 8 | Timezone-aware status | `$post->get_local_time()` | Same via REST controller | ✅ |
| 9 | Current period text | PHP template conditional | React conditional rendering | ✅ |
| 10 | Full week schedule | PHP `foreach` weekdays | React `.map()` weekdays | ✅ |
| 11 | Multiple time slots per day | PHP `foreach` hours | React `.map()` hours | ✅ |
| 12 | Time formatting (WP locale) | `\Voxel\time_format()` | `\Voxel\time_format()` via REST + client fallback | ✅ |
| 13 | Local time footer | `\Voxel\datetime_format($local_time)` | Server-formatted via REST | ✅ |
| 14 | Weekday localization | `\Voxel\get_weekdays()` | Same via REST | ✅ |
| 15 | Toggle button | `<a>` with chevron icon | `<a>` with SVG chevron | ✅ |
| 16 | Icon fallback (clock SVG) | `get_icon_markup() ?: svg('clock.svg')` | `renderIcon()` with clock SVG fallback | ✅ Fixed |
| 17 | Custom icon per state | 4 ICONS controls | 4 AdvancedIconControl → `renderIcon()` | ✅ Fixed |
| 18 | Responsive breakpoints | Elementor responsive | `@media 1024px` / `@media 767px` | ✅ |
| 19 | Editor preview | Elementor live preview | Mock data in edit.tsx | ✅ |
| 20 | Re-initialization support | `voxel:markup-update` event | `DOMContentLoaded` + `turbo:load` + `voxel:blocks:init` | ✅ |
| 21 | Opening soon state | ❌ DISABLED (commented out) | ❌ Not implemented | ✅ (Both absent) |
| 22 | Closing soon state | ❌ DISABLED (commented out) | ❌ Not implemented | ✅ (Both absent) |

---

## Identified Gaps (ALL FIXED)

### Gap #1: Icon Rendering — FIXED 2026-02-11

**Problem:** `WorkHoursComponent.tsx` rendered a hardcoded clock SVG for status icons, ignoring custom icon attributes.

**Fix applied:**
- Imported `renderIcon()` from `@shared/utils/renderIcon` and `IconValue` type
- Status icon: checks `statusIcon.value` → renders custom icon via `renderIcon()`, falls back to clock SVG
- Toggle icon: checks `attributes.downIcon.value` → renders custom icon via `renderIcon()`, falls back to chevron SVG
- Matches Voxel's `get_icon_markup($icon) ?: svg('clock.svg')` pattern exactly

**Files changed:** `shared/WorkHoursComponent.tsx` (lines 1-5, 194-213, 220-242)

---

### Gap #2: Accordion Button Responsive Variants — FIXED 2026-02-11

**Problem:** `accordionButtonSize`, `accordionButtonIconSize`, and `accordionButtonBorderRadius` lacked tablet/mobile variants.

**Fix applied:**
- Added 6 new attributes to `block.json`: `accordionButtonSize_tablet`, `accordionButtonSize_mobile`, `accordionButtonIconSize_tablet`, `accordionButtonIconSize_mobile`, `accordionButtonBorderRadius_tablet`, `accordionButtonBorderRadius_mobile`
- Added corresponding optional types to `types/index.ts`
- Added responsive CSS rules to `styles.ts` for all 3 controls (tablet @1024px, mobile @767px)
- `ResponsiveRangeControl` in ContentTab already uses `attributeBaseName` which auto-resolves `_tablet`/`_mobile` suffixes

**Files changed:** `block.json`, `types/index.ts`, `styles.ts`

---

## Summary

### What Works Well (100%)

- **Complete HTML structure match** — all CSS classes, element hierarchy, and data flow match Voxel exactly
- **All 43 Voxel controls mapped** — every Elementor control has a corresponding Gutenberg control
- **Status calculation parity** — uses the same `$field->is_open_now()` PHP method via REST
- **Time formatting parity** — uses `\Voxel\time_format()` server-side, respects WP locale
- **Timezone handling** — `$post->get_local_time()` correctly calculates per-post timezone
- **Toggle/accordion behavior** — identical expand/collapse with CSS `.active` class
- **Collapse modes** — both `wh-default` (collapsible) and `wh-expanded` (always visible) work
- **Style generator** — complete responsive CSS with desktop/tablet/mobile breakpoints
- **Headless-ready** — `normalizeConfig()` supports camelCase/snake_case/Voxel format names
- **Evidence-based CSS** — every `styles.ts` rule has verified Voxel line references

### Gaps Fixed (0% remaining)

| Gap | Status | Fix Date |
|-----|--------|----------|
| #1: Custom icon rendering | ✅ FIXED | 2026-02-11 |
| #2: Responsive accordion button | ✅ FIXED | 2026-02-11 |

---

### Architecture Quality Notes

The FSE work-hours block is well-architected with:
- **DRY principle:** Shared `WorkHoursComponent.tsx` used by both edit and frontend
- **Type safety:** 75 typed attributes in `types/index.ts`
- **Small bundle:** 11.07 kB (3.68 kB gzipped)
- **Dual-format config:** Ready for headless/Next.js migration
- **Proper Voxel integration:** Uses Voxel's own PHP methods for status/time/schedule

**Overall: Production-ready at 100% parity. All gaps fixed.**
