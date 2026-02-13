# Current Plan Widget vs Block - Parity Audit

**Date:** 2026-02-10
**Overall Parity:** ~100%
**Status:** Complete — Full parity with architectural enhancements for headless/Next.js

## Reference Files

| Source | File | Lines |
|--------|------|-------|
| Voxel Widget | `themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php` | 806 |
| Voxel Template | `themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php` | 77 |
| Voxel CSS | `themes/voxel/assets/dist/pricing-plan.css` | — |
| FSE block.json | `themes/voxel-fse/app/blocks/src/current-plan/block.json` | — |
| FSE edit.tsx | `themes/voxel-fse/app/blocks/src/current-plan/edit.tsx` | — |
| FSE frontend.tsx | `themes/voxel-fse/app/blocks/src/current-plan/frontend.tsx` | ~337 |
| FSE render.php | `themes/voxel-fse/app/blocks/src/current-plan/render.php` | — |
| FSE save.tsx | `themes/voxel-fse/app/blocks/src/current-plan/save.tsx` | — |
| FSE CurrentPlanComponent | `themes/voxel-fse/app/blocks/src/current-plan/shared/CurrentPlanComponent.tsx` | ~329 |
| FSE ContentTab | `themes/voxel-fse/app/blocks/src/current-plan/inspector/ContentTab.tsx` | 91 |
| FSE StyleTab | `themes/voxel-fse/app/blocks/src/current-plan/inspector/StyleTab.tsx` | 437 |
| FSE styles.ts | `themes/voxel-fse/app/blocks/src/current-plan/styles.ts` | 478 |
| FSE types | `themes/voxel-fse/app/blocks/src/current-plan/types/index.ts` | — |
| FSE REST Controller | `themes/voxel-fse/app/controllers/rest-api-controller.php` | L2125-2241 |

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Technology** | PHP-only (no JS) | React + REST API (Plan C+) |
| **Rendering** | Server-side only | Hybrid (SSR + client hydration) |
| **Data Fetching** | Direct PHP (`$user->get_membership()`) | REST API `/voxel-fse/v1/current-plan` |
| **JavaScript** | None | ~337 lines (frontend.tsx) |
| **State Management** | N/A | React hooks (useState, useEffect, useMemo) |
| **Style System** | Elementor inline CSS | CSS generation via styles.ts |
| **Type Safety** | None | TypeScript strict mode |
| **Module** | `paid-memberships` module | Standalone Gutenberg block |
| **Widget ID** | `ts-current-plan` | `voxel-fse/current-plan` |
| **Style Dependency** | `vx:pricing-plan.css` (L798) | Inlined responsive CSS |

## HTML Structure Parity

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `.ts-panel.active-plan.plan-panel` | `.ts-panel.active-plan.plan-panel` (+ wrapper `.voxel-fse-current-plan-{blockId}`) | ✅ |
| Header | `.ac-head` | `.ac-head` | ✅ |
| Header icon | `<svg>` / `<i>` via `get_icon_markup()` | `renderIcon()` (SVG/icon font) | ✅ |
| Header label | `<b>Current plan</b>` | `<b>Current plan</b>` | ✅ |
| Body | `.ac-body` | `.ac-body` | ✅ |
| Pricing wrapper | `.ac-plan-pricing` | `.ac-plan-pricing` | ✅ |
| Price amount | `<span class="ac-plan-price">` | `<span class="ac-plan-price">` | ✅ |
| Billing period | `<div class="ac-price-period">` | `<div class="ac-price-period">` | ✅ |
| Status message | `<p>` (conditional) | `<p>` (conditional) | ✅ |
| Plan label | `<p>Your current plan is {label}</p>` | `<p>Your current plan is {label}</p>` | ✅ |
| Footer | `.ac-bottom` | `.ac-bottom` | ✅ |
| Button list | `ul.simplify-ul.current-plan-btn` | `ul.simplify-ul.current-plan-btn` | ✅ |
| Manage button | `<a class="ts-btn ts-btn-1">` | `<a class="ts-btn ts-btn-1">` | ✅ |
| Switch button | `<a class="ts-btn ts-btn-1">` (conditional) | `<a class="ts-btn ts-btn-1">` (conditional) | ✅ |
| vxconfig script | N/A (PHP-only) | `<script type="text/json" class="vxconfig">` | ✅ Enhancement |

**Note:** FSE adds a wrapper div `.voxel-fse-current-plan-{blockId}` for CSS scoping and a `<script class="vxconfig">` for Plan C+ hydration. All Voxel CSS classes are preserved exactly.

## JavaScript Behavior Parity

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 1 | N/A (PHP-only) | `fetchPlanData()` (frontend.tsx L207-226) | ✅ Enhancement | REST API fetch for headless |
| 2 | N/A | `parseVxConfig()` (frontend.tsx) | ✅ Enhancement | Config parsing from vxconfig JSON |
| 3 | N/A | `normalizeConfig()` (frontend.tsx L123-173) | ✅ Enhancement | Dual-format normalization |
| 4 | N/A | `initCurrentPlanBlocks()` (frontend.tsx L298-325) | ✅ Enhancement | React hydration |
| 5 | N/A | `renderIcon()` (Component L26-42) | ✅ Enhancement | Icon rendering helper |

**Key Insight:** Voxel's current-plan widget is entirely PHP-rendered with zero client-side JavaScript. The FSE block adds React hydration and REST API data fetching as architectural enhancements for headless/Next.js compatibility. There are no Voxel JS methods to replicate.

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Plan data fetch | Direct PHP calls in template | REST GET `/voxel-fse/v1/current-plan` | ✅ |
| Manage subscription | `<a href>` to `$order->get_link()` | `<a href>` to `orderLink` from REST | ✅ |
| Switch plan | `<a href>` to pricing page permalink | `<a href>` to `switchPlanUrl` from REST | ✅ |

**No Voxel AJAX calls.** Both implementations use standard `<a>` links for navigation. The FSE block fetches plan data via REST API on mount.

### REST API Response Structure (rest-api-controller.php L2127-2136)

```json
{
  "isLoggedIn": true,
  "membershipType": "order",
  "pricing": {
    "amount": "10.00",
    "currency": "USD",
    "formattedPrice": "$10.00",
    "interval": "month",
    "frequency": 1,
    "formattedPeriod": "/ month"
  },
  "planLabel": "Basic Plan",
  "statusMessage": null,
  "orderLink": "https://site.com/orders/123/",
  "switchPlanUrl": "https://site.com/pricing/",
  "isSubscriptionCanceled": false
}
```

## Style Controls Parity

### Icons (Content Tab) — 6 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `ts_plan_ico` | `planIcon` | IconPickerControl | ✅ |
| 2 | `ts_viewplan_ico` | `viewPlansIcon` | IconPickerControl | ✅ |
| 3 | `ts_configure_ico` | `configureIcon` | IconPickerControl | ✅ |
| 4 | `ts_switch_ico` | `switchIcon` | IconPickerControl | ✅ |
| 5 | `ts_cancel_ico` | `cancelIcon` | IconPickerControl | ✅ |
| 6 | `ts_stripe_ico` | `portalIcon` | IconPickerControl | ✅ |

### Panel Style (Style Tab) — 5 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `panels_spacing` | `panelsSpacing` | ResponsiveRangeControl | ✅ |
| 2 | `panel_border` | `panelBorder` | BorderGroupControl | ✅ |
| 3 | `panel_radius` | `panelRadius` | ResponsiveRangeControl | ✅ |
| 4 | `panel_bg` | `panelBg` | ColorControl | ✅ |
| 5 | `panel_shadow` | `panelShadow` | BoxShadowPopup | ✅ |

### Panel Head (Style Tab) — 7 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `head_padding` | `headPadding` | DimensionsControl | ✅ |
| 2 | `head_ico_size` | `headIcoSize` | ResponsiveRangeControl | ✅ |
| 3 | `head_ico_margin` | `headIcoMargin` | ResponsiveRangeControl | ✅ |
| 4 | `head_ico_col` | `headIcoCol` | ColorControl | ✅ |
| 5 | `head_typo` | `headTypo` | TypographyControl | ✅ |
| 6 | `head_typo_col` | `headTypoCol` | ColorControl | ✅ |
| 7 | `head_border_col` | `headBorderCol` | ColorControl | ✅ |

### Panel Pricing (Style Tab) — 5 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `price_align` | `priceAlign` | SelectControl | ✅ |
| 2 | `price_typo` | `priceTypo` | TypographyControl | ✅ |
| 3 | `price_col` | `priceCol` | ColorControl | ✅ |
| 4 | `period_typo` | `periodTypo` | TypographyControl | ✅ |
| 5 | `period_col` | `periodCol` | ColorControl | ✅ |

### Panel Body (Style Tab) — 7 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `panel_spacing` | `panelSpacing` | ResponsiveRangeControl | ✅ |
| 2 | `panel_gap` | `panelGap` | ResponsiveRangeControl | ✅ |
| 3 | `text_align` | `textAlign` | SelectControl | ✅ |
| 4 | `body_typo` | `bodyTypo` | TypographyControl | ✅ |
| 5 | `body_typo_col` | `bodyTypoCol` | ColorControl | ✅ |
| 6 | `body_typo_link` | `bodyTypoLink` | TypographyControl | ✅ |
| 7 | `body_col_link` | `bodyColLink` | ColorControl | ✅ |

### Panel Buttons (Style Tab) — 1 control

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `panel_buttons_gap` | `panelButtonsGap` | ResponsiveRangeControl | ✅ |

### Secondary Button Normal (Style Tab) — 10 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `scnd_btn_typo` | `scndBtnTypo` | TypographyControl | ✅ |
| 2 | `scnd_btn_radius` | `scndBtnRadius` | ResponsiveRangeControl | ✅ |
| 3 | `scnd_btn_c` | `scndBtnC` | ColorControl | ✅ |
| 4 | `scnd_btn_padding` | `scndBtnPadding` | DimensionsControl | ✅ |
| 5 | `scnd_btn_height` | `scndBtnHeight` | ResponsiveRangeControl | ✅ |
| 6 | `scnd_btn_bg` | `scndBtnBg` | ColorControl | ✅ |
| 7 | `scnd_btn_border` | `scndBtnBorder` | BorderGroupControl | ✅ |
| 8 | `scnd_btn_icon_size` | `scndBtnIconSize` | ResponsiveRangeControl | ✅ |
| 9 | `scnd_btn_icon_pad` | `scndBtnIconPad` | ResponsiveRangeControl | ✅ |
| 10 | `scnd_btn_icon_color` | `scndBtnIconColor` | ColorControl | ✅ |

### Secondary Button Hover (Style Tab) — 4 controls

| # | Voxel Control ID | FSE Attribute | Component | Match |
|---|-----------------|---------------|-----------|-------|
| 1 | `scnd_btn_c_h` | `scndBtnCH` | ColorControl | ✅ |
| 2 | `scnd_btn_bg_h` | `scndBtnBgH` | ColorControl | ✅ |
| 3 | `scnd_btn_border_h` | `scndBtnBorderH` | ColorControl | ✅ |
| 4 | `scnd_btn_icon_color_h` | `scndBtnIconColorH` | ColorControl | ✅ |

**Total: 45 controls (6 icons + 39 style) — All matched ✅**

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Display current plan label | `$membership->get_active_plan()->get_label()` | REST API → Component | ✅ |
| 2 | Show subscription pricing | `currency_format()` + `interval_format()` | REST API → Component | ✅ |
| 3 | Display status message | `get_status_message_for_customer()` (hook) | REST API → Component | ✅ |
| 4 | Manage subscription button | `$order->get_link()` | REST `orderLink` → `<a>` | ✅ |
| 5 | Switch plan button | `$switch_plan_url` (conditional) | REST `switchPlanUrl` → `<a>` (conditional) | ✅ |
| 6 | Logged-out handling | Early return in render() L778-781 | render.php L14-16 + REST default response | ✅ |
| 7 | Free plan display | Template L56-73 | Component (conditional rendering) | ✅ |
| 8 | Subscription canceled check | `$payment_method->is_subscription_canceled()` | REST L2192 → `isSubscriptionCanceled` | ✅ |
| 9 | Order-based membership | `$membership->get_type() === 'order'` | REST L2186 → `membershipType` | ✅ |
| 10 | Role-based plan switching | `$role->get_pricing_page_id()` + `has_plans_enabled()` | REST L2175-2183 | ✅ |
| 11 | 6 icon controls | Widget L27-103 | ContentTab L47-86 | ✅ |
| 12 | 39 style controls | Widget L105-774 | StyleTab + styles.ts | ✅ |
| 13 | Responsive breakpoints | Elementor responsive controls | styles.ts L470-475 (1024px / 767px) | ✅ |
| 14 | Loading state | N/A (PHP renders instantly) | Component L125-144 | ✅ Enhancement |
| 15 | Error state | N/A | Component L148-166 | ✅ Enhancement |
| 16 | Re-hydration prevention | N/A | `data-hydrated` flag (frontend.tsx L306) | ✅ Enhancement |
| 17 | Turbo/PJAX support | N/A | Event listeners (frontend.tsx L335-336) | ✅ Enhancement |
| 18 | Multisite support | Native WP | `getRestBaseUrl()` | ✅ Enhancement |

## Identified Gaps

**No gaps identified.** All 18 Voxel features are fully replicated. The FSE block adds 5 architectural enhancements (loading state, error state, re-hydration prevention, Turbo/PJAX support, multisite support) that improve upon the original PHP-only implementation.

### Minor Structural Differences (Not Gaps)

| # | Difference | Impact | Justification |
|---|-----------|--------|---------------|
| 1 | FSE adds wrapper div `.voxel-fse-current-plan-{blockId}` | None | Required for CSS scoping in Gutenberg |
| 2 | FSE adds `<script class="vxconfig">` | None | Plan C+ architecture for hydration |
| 3 | FSE uses REST API instead of direct PHP | None | Required for headless/Next.js compatibility |
| 4 | FSE has default SVG icon fallbacks | Improvement | Better UX when no icon is configured |

## Summary

### What Works Well (100%)
- All 6 icon controls mapped and functional
- All 39 style controls with CSS generation and responsive breakpoints
- HTML structure uses exact Voxel CSS classes
- REST API correctly replicates Voxel's PHP data pipeline
- Conditional rendering matches all 3 Voxel states (active subscription, free plan, no switch URL)
- Price and period formatting via Voxel's `currency_format()` and `interval_format()`
- Shared component (DRY) between editor and frontend
- TypeScript strict mode with 13 interfaces

### Gaps to Fix (0%)
None identified.

### Priority Fix Order
No fixes required.

### Recommended Next Steps
1. Add automated unit tests (CurrentPlanComponent, styles.ts, REST endpoint)
2. Integration test with live Voxel membership system
3. Monitor Voxel parent theme updates for breaking changes to membership API

### Build Output
```
frontend.js  16.64 kB | gzip: 5.43 kB
Built in 113ms
```
