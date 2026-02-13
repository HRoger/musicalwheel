# Stripe Account Widget vs Block - Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~98%
**Status:** Excellent — most complex block in project, nearly complete parity

---

## Reference Files

### Voxel Parent Theme (Widget)

| Source | File | Lines |
|--------|------|-------|
| Widget PHP class | `themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php` | 2731 |
| Shipping template | `themes/voxel/app/modules/stripe-connect/templates/frontend/stripe-account-widget.php` | ~500 |
| Frontend controller | `themes/voxel/app/modules/stripe-connect/controllers/frontend/connect-frontend-controller.php` | ~200 |
| Stripe Connect controller | `themes/voxel/app/modules/stripe-connect/controllers/stripe-connect-controller.php` | — |
| Compiled JS | `themes/voxel/assets/dist/stripe-connect-dashboard.js` | 1 (minified) |
| Compiled CSS | `themes/voxel/assets/dist/commons.css` | — |
| Vendor trait | `themes/voxel/app/users/vendor-trait.php` | — |

### FSE Child Theme (Block)

| Source | File | Lines |
|--------|------|-------|
| block.json | `themes/voxel-fse/app/blocks/src/stripe-account/block.json` | ~120 |
| edit.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/edit.tsx` | 114 |
| frontend.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/frontend.tsx` | 632 |
| save.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/save.tsx` | 145 |
| render.php | `themes/voxel-fse/app/blocks/src/stripe-account/render.php` | 19 |
| types.ts | `themes/voxel-fse/app/blocks/src/stripe-account/types.ts` | 483 |
| styles.ts | `themes/voxel-fse/app/blocks/src/stripe-account/styles.ts` | 435 |
| StripeAccountComponent.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/shared/StripeAccountComponent.tsx` | 249 |
| ShippingScreen.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/shared/ShippingScreen.tsx` | 1327 |
| useStripeAccountConfig.ts | `themes/voxel-fse/app/blocks/src/stripe-account/hooks/useStripeAccountConfig.ts` | 135 |
| ContentTab.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/inspector/ContentTab.tsx` | 298 |
| StyleTab.tsx | `themes/voxel-fse/app/blocks/src/stripe-account/inspector/StyleTab.tsx` | 1347 |
| API Controller | `themes/voxel-fse/app/controllers/fse-stripe-account-api-controller.php` | 358 |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP template + Vue.js hydration | PHP render.php + React hydration |
| **State Management** | Vue 3 `data()` + `methods` | React `useState` + `useCallback` (31 callbacks) |
| **Config Delivery** | Inline `<script class="vxconfig">` in widget render | REST API `/voxel-fse/v1/stripe-account/config` + inline vxconfig fallback |
| **AJAX System** | jQuery.post to `/?vx=1&action=...` | FormData POST to `/?vx=1&action=...` (same Voxel endpoint) |
| **Style System** | Elementor controls → inline CSS | React attributes → `styles.ts` generator → inline `<style>` |
| **Drag & Drop** | vue-draggable component | Native HTML drag events (handleDragStart/Over/End) |
| **Nonce** | `vx_vendor_dashboard` via inline config | Same nonce via REST API response |
| **CSS Framework** | Voxel commons.css classes | Same Voxel CSS classes reused |
| **Icon System** | Elementor icon controls + `\Voxel\get_icon_markup()` | `IconPickerControl` + shared icon rendering |
| **Responsive** | Elementor responsive controls | Responsive attributes (desktop/tablet/mobile) |

---

## HTML Structure Parity

### Main Screen

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `.ts-vendor-settings` | `.ts-vendor-settings.voxel-fse-stripe-account-frontend` | ✅ (extra class ok) |
| Config script | `<script class="vxconfig">` | `<script type="text/json" class="vxconfig">` | ✅ |
| Panel wrapper | `.ts-panel` | `.ts-panel` | ✅ |
| Header image | `<img>` from `gen_image` control | `<img>` from `genImage` attribute | ✅ |
| Body area | `.ac-body` | `.ac-body` | ✅ |
| Status message | `<p>` with conditional text | `<p>` with `getStatusMessage()` | ✅ |
| Actions area | `.ac-bottom` | `.ac-bottom` | ✅ |
| Button list | `.simplify-ul.current-plan-btn` | `.simplify-ul.current-plan-btn` | ✅ |
| Action buttons | `<a class="ts-btn ts-btn-1 ts-btn-large">` | `<a class="ts-btn ts-btn-1 ts-btn-large">` | ✅ |
| Button icons | `\Voxel\get_icon_markup()` / `\Voxel\svg()` | `renderIcon()` helper | ✅ |

### Shipping Screen

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Container | `.ts-vendor-shipping-zones` | `.ts-vendor-shipping-zones` | ✅ |
| Form wrapper | `.ac-body > .ts-form > .create-form-step.form-field-grid` | Same structure | ✅ |
| Heading | `.ts-form-group.ui-heading-field` | `.ts-form-group.ui-heading-field` | ✅ |
| Zone repeater | `.ts-repeater-container > .ts-field-repeater[.collapsed]` | Same structure | ✅ |
| Repeater head | `.ts-repeater-head.ts-repeater-head--zone` | `.ts-repeater-head.ts-repeater-head--zone` | ✅ |
| Repeater controller | `.ts-repeater-controller` | `.ts-repeater-controller` | ✅ |
| Country dropdown | `<select class="ts-filter">` | `<select class="ts-filter">` | ✅ |
| Continent tabs | `.ts-region-categories > .simplify-ul.addon-buttons.flexify` | Same structure | ✅ |
| Active tab | `li.adb-selected` | `li.adb-selected` | ✅ |
| Region repeater | Nested `.ts-field-repeater` | Nested `.ts-field-repeater` | ✅ |
| State pills | `.flexify.simplify-ul.attribute-select` | `.flexify.simplify-ul.attribute-select` | ✅ |
| ZIP toggle | `.onoffswitch > .onoffswitch-checkbox + .onoffswitch-label` | Same structure | ✅ |
| Rate repeater | Same as zone with `.ts-repeater-head--rate` | Same structure | ✅ |
| Add buttons | `.ts-repeater-add.ts-btn.ts-btn-4.form-btn` | `.ts-repeater-add.ts-btn.ts-btn-4.form-btn` | ✅ |
| Save button | `.ts-btn.ts-btn-2.ts-btn-large[.vx-disabled]` | `.ts-btn.ts-btn-2.ts-btn-large[.vx-disabled]` | ✅ |
| Back button | `.ts-btn.ts-btn-1.ts-btn-large` | `.ts-btn.ts-btn-1.ts-btn-large` | ✅ |

**HTML Structure Parity: 100%**

---

## JavaScript Behavior Parity

### Vue Methods vs React Callbacks

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|-----------|--------|-------|
| 1 | `shouldShowContinentOption(continent)` | `shouldShowContinentOption` | ✅ | Same logic |
| 2 | `handleCountrySelect(zone, value, event)` | `handleCountrySelect` | ✅ | Handles continent: prefix |
| 3 | `selectAllCountries(zone)` | `selectAllCountries` | ✅ | Toggle behavior |
| 4 | `unselectAllCountries(zone)` | `unselectAllCountries` | ✅ | Clear regions |
| 5 | `getCountryName(code)` | `getCountryName` | ✅ | Lookup from config |
| 6 | `getAvailableStates(countryCode)` | `getAvailableStates` | ✅ | State subdivision data |
| 7 | `getStateName(countryCode, stateCode)` | `getStateName` | ✅ | State name lookup |
| 8 | `handleStateSelect(region, value, event)` | `handleStateSelect` | ✅ | Add state to region |
| 9 | `selectAllStates(region, country)` | `selectAllStates` | ✅ | Toggle all states |
| 10 | `getRegionsGroupedByContinent(zone)` | `getRegionsGroupedByContinent` (implicit) | ✅ | Continent grouping |
| 11 | `getContinentsWithCounts(zone)` | `getContinentsWithCounts` | ✅ | Continent tab data |
| 12 | `getActiveContinent(zone)` | `getActiveContinent` (via activeContinentFilters) | ✅ | Filter state |
| 13 | `setActiveContinent(zone, continent)` | `setActiveContinent` | ✅ | Filter state update |
| 14 | `getFilteredRegionsByContinent(zone)` | `getFilteredRegionsByContinent` | ✅ | Filtered regions |
| 15 | `addShippingRate()` | `addShippingRate` | ✅ | With default structure |
| 16 | `removeShippingRate(rate)` | `removeShippingRate` | ✅ | Removes from zones too |
| 17 | `getRateZones(rate)` | `getRateZones` | ✅ | Zone-rate mapping |
| 18 | `isRateInZone(rate, zoneKey)` | `isRateInZone` | ✅ | Membership check |
| 19 | `handleZoneSelectForRate(rate, zoneKey, event)` | `handleZoneSelectForRate` | ✅ | Assign zone to rate |
| 20 | `removeRateFromZone(rate, zoneKey)` | `removeRateFromZone` | ✅ | Unassign zone |
| 21 | `selectAllZonesForRate(rate)` | `selectAllZonesForRate` | ✅ | Bulk assign |
| 22 | `unselectAllZonesForRate(rate)` | `unselectAllZonesForRate` | ✅ | Bulk unassign |
| 23 | `addShippingZone()` | `addShippingZone` | ✅ | With default structure |
| 24 | `saveShipping()` | `handleSaveShipping` | ✅ | Same AJAX endpoint + nonce |

**JS Behavior Parity: 100%** — All 24 Voxel methods mapped to React equivalents.

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Stripe onboarding | `/?vx=1&action=stripe_connect.account.onboard` (redirect) | Link to same URL from controller config | ✅ |
| Stripe dashboard | `/?vx=1&action=stripe_connect.account.login` (redirect) | Link to same URL from controller config | ✅ |
| Save shipping | POST `/?vx=1&action=stripe_connect.account.save_shipping` | POST to same endpoint with FormData | ✅ |
| Nonce name | `vx_vendor_dashboard` | `vx_vendor_dashboard` (controller:161) | ✅ |

**AJAX Parity: 100%**

---

## Style Controls Parity

### Panel Section

| # | Voxel Control | FSE Control | Match |
|---|--------------|------------|-------|
| 1 | `panel_border` (Group) | `panelBorderType/Width/Color` (BorderGroupControl) | ✅ |
| 2 | `panel_radius` (Slider, responsive) | `panelBorderRadius` (ResponsiveRangeControl) | ✅ |
| 3 | `panel_bg` (Color) | `panelBackground` (ColorControl) | ✅ |
| 4 | `panel_shadow` (Box Shadow) | `panelBoxShadow` (BoxShadowPopup) | ✅ |
| 5 | `panel_spacing` (Slider, responsive) | `panelBodySpacing` (ResponsiveRangeControl) | ✅ |
| 6 | `panel_gap` (Slider, responsive) | `panelBodyContentGap` (ResponsiveRangeControl) | ✅ |
| 7 | `body_typo` (Typography) | `panelTypography` (TypographyControl) | ✅ |
| 8 | `body_typo_col` (Color) | `panelTextColor` (ColorControl) | ✅ |

### Form Controls Sections

| Section | Voxel Controls | FSE Controls | Match |
|---------|---------------|-------------|-------|
| Field Labels | 3 controls | 3 attributes | ✅ |
| Input & Textarea (normal) | ~17 controls | ~17 attributes | ✅ |
| Input & Textarea (hover) | 5 controls | 5 attributes | ✅ |
| Input & Textarea (active) | 4 controls | 4 attributes | ✅ |
| Input Suffix | 9 controls | 9 attributes | ✅ |
| Switcher | 3 controls | 3 attributes | ✅ |
| Select (normal) | ~8 controls | ~8 attributes | ✅ |
| Select (hover) | ~4 controls | ~4 attributes | ✅ |
| Tabs (normal) | ~6 controls | ~6 attributes | ✅ |
| Tabs (selected) | ~6 controls | ~6 attributes | ✅ |
| Heading | 2 controls | 2 attributes | ✅ |
| Repeater | 4 controls | 4 attributes | ✅ |
| Repeater Head | 6 controls | 6 attributes | ✅ |
| Repeater Icon Button (normal) | ~5 controls | ~5 attributes | ✅ |
| Repeater Icon Button (hover) | ~4 controls | ~4 attributes | ✅ |
| Pills (normal) | ~4 controls | ~4 attributes | ✅ |
| Pills (hover) | ~3 controls | ~3 attributes | ✅ |

### Button Sections

| Section | Voxel Controls | FSE Controls | Match |
|---------|---------------|-------------|-------|
| Primary (ts-btn-2, normal) | ~12 controls | ~12 attributes | ✅ |
| Primary (ts-btn-2, hover) | ~7 controls | ~7 attributes | ✅ |
| Secondary (ts-btn-1, normal) | ~10 controls | ~10 attributes | ✅ |
| Secondary (ts-btn-1, hover) | ~7 controls | ~7 attributes | ✅ |
| Tertiary (ts-btn-4, normal) | ~9 controls | ~9 attributes | ✅ |
| Tertiary (ts-btn-4, hover) | ~6 controls | ~6 attributes | ✅ |

**Style Controls Parity: ~98%** — 205 FSE attributes mapping to ~115 Voxel controls. FSE has additional responsive breakpoints that Voxel handles via Elementor's built-in responsive system.

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Authentication check | `is_user_logged_in()` widget:2605 | render.php:14 + controller:57 | ✅ |
| 2 | Stripe Connect enabled check | `\Voxel\get('payments.stripe...')` widget:2610 | controller:74 | ✅ |
| 3 | Admin onboarding bypass | Filter `voxel/stripe_connect/enable_onboarding_for_admins` | controller:167 | ✅ |
| 4 | Account status display | Template conditional rendering | `getStatusMessage()` in StripeAccountComponent | ✅ |
| 5 | Start setup button | ts_setup_ico, links to onboard_link | Same icon + link | ✅ |
| 6 | Complete onboarding button | ts_submit_ico | Same icon + link | ✅ |
| 7 | Stripe Dashboard link | ts_stripe_ico, new tab | Same icon + link, target=_blank | ✅ |
| 8 | Update information button | ts_update_ico | Same | ✅ |
| 9 | Configure shipping button | ts_shipping_ico, screen='shipping' | Same, `setScreen('shipping')` | ✅ |
| 10 | General image display | `gen_image` control | `genImage` attribute | ✅ |
| 11 | Shipping zones CRUD | Vue data + methods | useState + useCallback | ✅ |
| 12 | Shipping rates CRUD | Vue data + methods | useState + useCallback | ✅ |
| 13 | Country selection (continent grouping) | handleCountrySelect, `continent:` prefix | Same logic | ✅ |
| 14 | State/subdivision selection | handleStateSelect | Same logic | ✅ |
| 15 | ZIP code filtering | Toggle switch + textarea | Same UI | ✅ |
| 16 | Continent filter tabs | addon-buttons with activeContinent state | Same structure + state | ✅ |
| 17 | Zone-to-rate assignment | Many-to-many via zone.rates array | Same data model | ✅ |
| 18 | Free shipping type | requirements + delivery estimate | Same | ✅ |
| 19 | Fixed rate type | 3 calculation methods + shipping classes | Same | ✅ |
| 20 | Delivery estimates | min/max with unit selection | Same | ✅ |
| 21 | Shipping classes per rate | addClass/removeClass | addShippingClassToRate/remove | ✅ |
| 22 | Drag-and-drop reordering | vue-draggable component | Native HTML drag events | ⚠️ Different impl |
| 23 | Select all/unselect all | selectAllCountries, selectAllStates, etc. | Same methods | ✅ |
| 24 | Save shipping (AJAX) | jQuery.post | FormData POST (same endpoint) | ✅ |
| 25 | Loading state (save) | savingShipping + vx-disabled | Same state + class | ✅ |
| 26 | Success/error notifications | Voxel.alert() | Voxel.alert() | ✅ |
| 27 | Repeater collapse/expand | activeZone/activeRate | Same state management | ✅ |
| 28 | Nested repeaters | Regions within zones | Same nesting | ✅ |
| 29 | Empty state messages | Conditional text | Same | ✅ |
| 30 | Data migration (old format) | mounted() countries→regions | normalizeConfig() | ✅ |
| 31 | Validation (server-side) | PHP controller | Same Voxel endpoint handles it | ✅ |
| 32 | Nonce security | vx_vendor_dashboard | Same nonce name | ✅ |
| 33 | Preview mode | preview_as_user Elementor control | previewAsUser + DynamicTag | ✅ |
| 34 | Onboarding key tracking | User meta check on return | Controller handles same flow | ✅ |
| 35 | Global reference | window.VX_Stripe_Account | N/A (React, not needed) | ⚠️ Not needed |
| 36 | Turbo/PJAX re-render | jQuery `voxel:markup-update` event | React hydration with `data-react-mounted` | ✅ Equivalent |
| 37 | RTL support | `!is_rtl()` template check | CSS logical properties / styles.ts | ⚠️ Needs verification |
| 38 | 13 icon controls | Elementor icon controls | IconPickerControl × 13 | ✅ |
| 39 | ~115 style controls | Elementor style controls | 205 block attributes | ✅ |
| 40 | Multisite support | N/A (Elementor handles) | getRestBaseUrl() + getSiteBaseUrl() | ✅ Enhanced |

---

## Identified Gaps

### Gap #1: Drag-and-Drop Implementation (Severity: Low)

**Voxel behavior:** Uses `vue-draggable` component (from vuedraggable library) wrapping repeater items. Provides smooth drag animation, ghost element, and handle-based drag initiation.
- File: `stripe-connect-dashboard.js` — `app.component('draggable', vuedraggable)`

**FSE behavior:** Uses native HTML5 drag events (`onDragStart`, `onDragOver`, `onDragEnd`) with manual index tracking.
- File: `ShippingScreen.tsx:488-533` — `handleZoneDragStart/Over/End`

**Impact:** Functionally equivalent — items can be reordered. Visual polish may differ slightly (no ghost element animation).

**Fix:** Optional. Native drag works. Could add CSS `opacity` transition during drag for polish.

### Gap #2: RTL Support Verification (Severity: Low)

**Voxel behavior:** Template has explicit `!is_rtl()` check at `widget:928` for input suffix margin direction.

**FSE behavior:** styles.ts generates CSS but RTL-specific logic is not explicitly documented. The style generator may use logical CSS properties or may need explicit RTL handling.
- File: `styles.ts:165-179` — input suffix styling

**Impact:** Input suffix may have incorrect margin direction in RTL languages.

**Fix:** Verify in RTL mode. If needed, add `margin-inline-start` / `margin-inline-end` instead of `margin-left` / `margin-right` in styles.ts.

### Gap #3: Global Vue Reference Missing (Severity: Very Low)

**Voxel behavior:** Sets `window.VX_Stripe_Account = this` in mounted hook for external access/debugging.

**FSE behavior:** No global reference. React components don't expose state externally.

**Impact:** No user-facing impact. Only affects debugging. Third-party code that relies on `window.VX_Stripe_Account` would break.

**Fix:** Not recommended. React pattern doesn't support this. If needed, could expose via `window.__FSE_StripeAccount` ref but this is an anti-pattern.

---

## Summary

### What Works Well (~98%)

- **Complete HTML structure match** — All CSS classes, element hierarchy, and data attributes preserved
- **Full JavaScript behavior parity** — All 24 Voxel Vue methods reimplemented as React callbacks
- **All AJAX endpoints preserved** — Same Voxel actions, nonces, and response handling
- **All 13 icon controls** — Fully mapped to IconPickerControl
- **All ~115 style controls** — Expanded to 205 responsive attributes across 15 StyleTab accordions
- **Complex shipping configuration** — Zones, rates, regions, states, ZIP codes, delivery estimates, shipping classes
- **Dual-screen UI** — Main + Shipping screens with back navigation
- **Nested repeater functionality** — Zones → Regions → States hierarchy
- **Plan C+ architecture** — REST API controller + Voxel AJAX direct calls
- **Multisite support** — Enhanced with getRestBaseUrl() utility

### Gaps to Fix (~2%)

| Gap | Severity | Effort |
|-----|----------|--------|
| Drag-and-drop visual polish | Low | 1-2 hours |
| RTL verification | Low | 30 min |
| Global reference | Very Low | Not recommended |

### Priority Fix Order

1. **RTL verification** — Quick to test, important for i18n
2. **Drag-and-drop polish** — Optional, current implementation is functional

### Block Complexity Stats

| Metric | Value |
|--------|-------|
| Total FSE files | 13 |
| Total FSE lines | ~5,345 |
| Block attributes | 205 (most of any block) |
| Icon controls | 13 (most of any block) |
| Style accordions | 15 (most of any block) |
| React callbacks | 31 (ShippingScreen alone) |
| State tabs | 8 (normal/hover/active/selected) |
| API controller methods | 10 |
| Voxel widget lines | 2,731 (largest widget) |

This is the **most complex block in the voxel-fse project**, achieving near-complete parity with Voxel's largest widget.
