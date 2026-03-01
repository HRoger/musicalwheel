# Product Price Widget vs Block - Parity Audit

**Date:** 2026-02-11
**Overall Parity:** ~100%
**Status:** Full parity achieved. Simplest Voxel widget (PHP-only, no JS). FSE block adds REST API + React hydration for Plan C+ architecture.

## Reference Files

### Voxel Parent Theme
| File | Path | Lines | Purpose |
|------|------|-------|---------|
| Widget Class | `themes/voxel/app/widgets/product-price.php` | 173 | Widget registration, controls, render logic |
| Template | `themes/voxel/templates/widgets/product-price.php` | 17 | HTML output template |
| Price Calculation | `themes/voxel/app/post-types/fields/product-field/methods/get-minimum-price.php` | 358 | Minimum price calculation (regular, variable, booking) |
| Constants | `themes/voxel/app/utils/constants.php` | 25 | Error code definitions (`PRODUCT_ERR_OUT_OF_STOCK = 10`) |
| JavaScript | NONE | 0 | Widget has NO JavaScript |
| CSS | NONE (Elementor inline) | 0 | All styling via Elementor's `{{WRAPPER}}` controls |

### FSE Child Theme
| File | Path | Lines | Purpose |
|------|------|-------|---------|
| block.json | `themes/voxel-fse/app/blocks/src/product-price/block.json` | 162 | Block registration, 30 attributes |
| render.php | `themes/voxel-fse/app/blocks/src/product-price/render.php` | 11 | Passthrough to Block_Loader.php |
| index.tsx | `themes/voxel-fse/app/blocks/src/product-price/index.tsx` | 32 | Block registration entry point |
| edit.tsx | `themes/voxel-fse/app/blocks/src/product-price/edit.tsx` | 193 | Editor component with REST API fetch |
| save.tsx | `themes/voxel-fse/app/blocks/src/product-price/save.tsx` | 169 | Save function (vxconfig + CSS) |
| frontend.tsx | `themes/voxel-fse/app/blocks/src/product-price/frontend.tsx` | 404 | Frontend hydration entry point |
| ProductPriceComponent.tsx | `themes/voxel-fse/app/blocks/src/product-price/shared/ProductPriceComponent.tsx` | 304 | Shared UI component |
| types.ts | `themes/voxel-fse/app/blocks/src/product-price/types.ts` | 193 | TypeScript interfaces |
| styles.ts | `themes/voxel-fse/app/blocks/src/product-price/styles.ts` | 128 | Responsive CSS generator |
| ContentTab.tsx | `themes/voxel-fse/app/blocks/src/product-price/inspector/ContentTab.tsx` | 75 | Content inspector controls |
| AdvancedTab.tsx | `themes/voxel-fse/app/blocks/src/product-price/inspector/AdvancedTab.tsx` | 13 | AdvancedTab wrapper |
| VoxelTab.tsx | `themes/voxel-fse/app/blocks/src/product-price/inspector/VoxelTab.tsx` | 12 | VoxelTab wrapper |
| REST API | `themes/voxel-fse/app/controllers/rest-api-controller.php` | Lines 47-62, 660-779 | Price data endpoint |

### Documentation
| File | Path | Purpose |
|------|------|---------|
| phase3-parity.md | `docs/block-conversions/product-price/phase3-parity.md` | Prior parity analysis (Dec 2025) |
| phase2-improvements.md | `docs/block-conversions/product-price/phase2-improvements.md` | normalizeConfig() addition |
| voxel-product-summary.beautified.js | `docs/block-conversions/product-price/` | **WRONG FILE** - belongs to cart-summary widget, NOT product-price |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP-only, server-rendered by Elementor | PHP passthrough + React hydration |
| **JavaScript** | None (0 lines) | ~1,523 lines TypeScript/TSX |
| **State Management** | N/A | React useState/useEffect (priceData, isLoading, error) |
| **Data Source** | Direct PHP method calls in `render()` | REST API `/voxel-fse/v1/product-price` |
| **AJAX** | None | REST GET on mount |
| **Styling** | Elementor inline `{{WRAPPER}}` selectors | CSS variables + responsive `<style>` tags |
| **Controls** | 6 Elementor controls (1 section, Content tab) | 6 matching controls in ContentTab + AdvancedTab + VoxelTab |
| **Build Output** | N/A | 8.14 kB / gzip: 2.37 kB |
| **Framework** | None (pure PHP/HTML) | React 18 with TypeScript |

---

## HTML Structure Parity

### State 1: Available with Discount

| Element | Voxel (template line 8-9) | FSE (ProductPriceComponent.tsx:258-282) | Match |
|---------|---------------------------|----------------------------------------|-------|
| Discount price | `<span class="vx-price">{formatted_discount}{suffix}</span>` | `<span className="vx-price">{formattedDiscountPrice}{suffix}</span>` | ✅ |
| Original price | `<span class="vx-price"><s>{formatted_regular}{suffix}</s></span>` | `<span className="vx-price"><s>{formattedRegularPrice}{suffix}</s></span>` | ✅ |

### State 2: Available without Discount

| Element | Voxel (template line 11) | FSE (ProductPriceComponent.tsx:286-301) | Match |
|---------|--------------------------|----------------------------------------|-------|
| Regular price | `<span class="vx-price">{formatted_regular}{suffix}</span>` | `<span className="vx-price">{formattedRegularPrice}{suffix}</span>` | ✅ |

### State 3: Out of Stock / Error

| Element | Voxel (template line 14) | FSE (ProductPriceComponent.tsx:240-254) | Match |
|---------|--------------------------|----------------------------------------|-------|
| Error message | `<span class="vx-price no-stock">{error_message}</span>` | `<span className="vx-price no-stock">{errorMessage}</span>` | ✅ |

### State 4: No Product Field

| Element | Voxel (widget line 115-118) | FSE (ProductPriceComponent.tsx:202-235) | Match |
|---------|----------------------------|----------------------------------------|-------|
| No render | Early return (nothing rendered) | Editor: EmptyPlaceholder; Frontend: empty | ✅ |

### Wrapper Difference (Expected)

| Aspect | Voxel | FSE | Notes |
|--------|-------|-----|-------|
| Root wrapper | Elementor's widget wrapper `<div class="elementor-widget-container">` | `<div class="vxfse-product-price vxfse-product-price-{blockId}">` | Expected difference - Gutenberg uses its own wrapper |
| vxconfig | N/A | `<script type="text/json" class="vxconfig">` embedded | FSE-only for hydration |
| Responsive CSS | Elementor `<style>` in `<head>` | Inline `<style>` inside block wrapper | Different approach, same result |

---

## JavaScript Behavior Parity

**Critical Finding:** Voxel product-price has **NO JavaScript**. It is 100% server-rendered PHP.

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|-----------|--------|-------|
| 1 | N/A (PHP `render()`) | `fetchProductPrice(postId)` | ✅ | FSE fetches via REST API what Voxel calculates in PHP |
| 2 | N/A (PHP `get_minimum_price_for_date()`) | REST API calls same PHP method | ✅ | Identical calculation path |
| 3 | N/A (PHP `currency_format()`) | REST API returns pre-formatted prices | ✅ | Same Voxel function used server-side |
| 4 | N/A (PHP suffix detection) | REST API returns suffix | ✅ | Same booking/subscription detection logic |
| 5 | N/A (no client-side updates) | `initProductPriceBlocks()` hydration | ✅ Enhanced | FSE adds client-side rendering for Plan C+ |

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Price data | Direct PHP method calls in `render()` | REST GET `/voxel-fse/v1/product-price?post_id={id}` | ✅ (different mechanism, identical data) |
| Voxel AJAX (`/?vx=1`) | Not used | Not used | ✅ N/A |

### REST API Response (FSE Only)

```json
{
    "isAvailable": true,
    "hasDiscount": false,
    "regularPrice": 9900,
    "discountPrice": 0,
    "formattedRegularPrice": "$99.00",
    "formattedDiscountPrice": "",
    "suffix": " / night",
    "errorMessage": null,
    "currency": "usd",
    "currencySymbol": "$",
    "currencyPosition": "before"
}
```

Uses same Voxel methods: `get_minimum_price_for_date()`, `currency_format()`, `get_primary_currency()`, `interval_format()`.

---

## Style Controls Parity

### Content Tab — "Chart" Section

| # | Voxel Control | Voxel ID | Voxel Selector | FSE Control | FSE Attribute | FSE CSS Variable | Match |
|---|--------------|----------|----------------|-------------|---------------|------------------|-------|
| 1 | Typography (group) | `price_typo` | `{{WRAPPER}} .vx-price` | `TypographyControl` | `typography` | `--vx-price-font-*` (6 vars) | ✅ |
| 2 | Color | `ts_price_col` | `{{WRAPPER}} .vx-price { color }` | `ResponsiveColorControl` | `priceColor` | `--vx-price-color` | ✅ |
| 3 | Linethrough text color | `ts_strike_col_text` | `{{WRAPPER}} .vx-price s { color }` | `ResponsiveColorControl` | `strikethroughTextColor` | `--vx-strike-text-color` | ✅ |
| 4 | Linethrough line color | `ts_strike_col` | `{{WRAPPER}} .vx-price s { text-decoration-color }` | `ResponsiveColorControl` | `strikethroughLineColor` | `--vx-strike-line-color` | ✅ |
| 5 | Linethrough line width | `ts_strike_width` | `{{WRAPPER}} .vx-price s { text-decoration-thickness }` | `ResponsiveRangeControl` | `strikethroughWidth` | `--vx-strike-width` | ✅ |
| 6 | Out of stock color | `ts_price_nostock` | `{{WRAPPER}} .vx-price.no-stock { color }` | `ResponsiveColorControl` | `outOfStockColor` | `--vx-nostock-color` | ✅ |

**Responsive support:** All 6 controls have desktop/tablet/mobile variants in both Voxel (`add_responsive_control`) and FSE (`_tablet`/`_mobile` attribute suffixes).

### Responsive Breakpoints

| Breakpoint | Voxel | FSE | Match |
|------------|-------|-----|-------|
| Desktop | Default | Default (inline CSS vars) | ✅ |
| Tablet | Elementor breakpoint | `@media (max-width: 1024px)` | ✅ |
| Mobile | Elementor breakpoint | `@media (max-width: 767px)` | ✅ |

---

## Feature Implementation Parity

### Core Features

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Price display | `currency_format()` in PHP template | REST API returns formatted price | ✅ |
| 2 | Currency formatting | `\Voxel\currency_format($price, $currency, false)` | Same function called in REST controller (line 774-775) | ✅ |
| 3 | Discount detection | `$discount_price < $regular_price` (template:7) | `hasDiscount: $discount_price < $regular_price` (controller:770) | ✅ |
| 4 | Discount display | Two `.vx-price` spans (discount + `<s>` strikethrough) | Identical structure | ✅ |
| 5 | Out of stock detection | `PRODUCT_ERR_OUT_OF_STOCK` exception code | Same exception handling (controller:712-713) | ✅ |
| 6 | "Out of stock" message | `_x('Out of stock', ...)` (widget:127) | Same string (controller:713) | ✅ |
| 7 | "Unavailable" message | `_x('Unavailable', ...)` (widget:129) | Same string (controller:715) | ✅ |
| 8 | No product field handling | Early return, no render (widget:115-118) | `errorMessage: 'No product configured'` + editor placeholder | ✅ |

### Suffix Features

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 9 | Booking "/ night" | `count_mode === 'nights'` (widget:150) | Same check (controller:752) | ✅ |
| 10 | Booking "/ day" | `count_mode !== 'nights'` (widget:152) | Same check (controller:754) | ✅ |
| 11 | Subscription interval | `interval_format($unit, $freq)` (widget:160) | Same function (controller:762) | ✅ |

### Price Calculation Features

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 12 | Reference date | `$GLOBALS['_availability_start_date'] ?? \Voxel\now()` | Same (controller:724) | ✅ |
| 13 | Addon filters | `$GLOBALS['_addon_filters']` | Same (controller:728, 733) | ✅ |
| 14 | Regular products | Base price + required addons | Via same method | ✅ |
| 15 | Variable products | Lowest enabled variation price | Via same method | ✅ |
| 16 | Booking products | Base price × range length + addons | Via same method | ✅ |
| 17 | Custom pricing | Date range/specific date/day of week | Via same method | ✅ |

### Style Features

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 18 | Typography (font family, size, weight, line-height, letter-spacing, transform) | Group control `price_typo` | `TypographyControl` with 6 CSS vars | ✅ |
| 19 | Price color (responsive) | `ts_price_col` | `priceColor` + `_tablet`/`_mobile` | ✅ |
| 20 | Strikethrough text color (responsive) | `ts_strike_col_text` | `strikethroughTextColor` + variants | ✅ |
| 21 | Strikethrough line color (responsive) | `ts_strike_col` | `strikethroughLineColor` + variants | ✅ |
| 22 | Strikethrough width (responsive, 1-200px) | `ts_strike_width` | `strikethroughWidth` + variants | ✅ |
| 23 | Out of stock color (responsive) | `ts_price_nostock` | `outOfStockColor` + variants | ✅ |

---

## Identified Gaps

### Gap #1: Documentation — Misleading Beautified JS File (Severity: Low)

**Voxel behavior:** Product-price widget has NO JavaScript. It's purely PHP server-rendered.
**FSE documentation:** `docs/block-conversions/product-price/voxel-product-summary.beautified.js` (1060 lines) is for the cart-summary/checkout widget, NOT product-price.
**Impact:** Could confuse future developers researching this block.
**Fix:** Add a `README.md` or rename the file to clarify it belongs to cart-summary. Already documented in `phase3-parity.md` lines 11-18.

### No Other Gaps Found

All 23 features verified with 1:1 parity. The FSE block correctly replicates every Voxel widget behavior.

---

## FSE Enhancements (Not in Voxel)

These are intentional additions for Plan C+ architecture, not parity gaps:

| Enhancement | Purpose | Evidence |
|-------------|---------|----------|
| REST API endpoint | Headless/Next.js data fetching | `rest-api-controller.php:47-62, 660-779` |
| React hydration | Client-side rendering for SPA | `frontend.tsx:349-392` |
| 5-method post ID detection | Robust context detection | `frontend.tsx:188-225` |
| `normalizeConfig()` | Dual-format API compatibility | `frontend.tsx:80-174` |
| Loading states | UX feedback during async fetch | `ProductPriceComponent.tsx:149-164` |
| Error boundaries | Graceful error handling | `ProductPriceComponent.tsx:167-181` |
| Editor placeholder | "No product" UX in editor | `ProductPriceComponent.tsx:202-235` |
| `data-hydrated` flag | Prevent re-initialization | `frontend.tsx:355` |
| Turbo/PJAX listeners | SPA navigation support | `frontend.tsx:396-403` |
| CSS variable cascade | Dynamic styling without inline styles | `ProductPriceComponent.tsx:41-93` |
| TypeScript types | Type safety (5 interfaces) | `types.ts:1-193` |
| Multisite support | `getRestBaseUrl()` for subdirectory installs | `frontend.tsx:180-182` |

---

## Summary

### What Works Well (100%)

- **HTML structure:** Identical `.vx-price`, `.vx-price.no-stock`, `<s>` elements across all 3 display states
- **Price calculation:** REST API calls the exact same Voxel PHP methods (`get_minimum_price_for_date`, `currency_format`)
- **Style controls:** All 6 Elementor controls mapped 1:1 with responsive support (desktop/tablet/mobile)
- **Error handling:** Same exception codes, same error messages ("Out of stock" / "Unavailable")
- **Suffix logic:** Booking (night/day) and subscription interval detection identical
- **Architecture:** Clean Plan C+ with REST API, React hydration, and headless readiness

### Gaps to Fix (0%)

No functional or visual gaps found. Only documentation housekeeping (misleading beautified JS filename).

### Priority Fix Order

1. **(Low)** Add clarification to `voxel-product-summary.beautified.js` or move it to cart-summary docs folder

### Key Insight

Product-price is the **simplest Voxel widget** (173 lines PHP, 17 lines template, 0 lines JS, 6 controls). It serves as an excellent **reference implementation** for how the FSE block conversion pattern works:
- Voxel widget: Pure PHP → FSE block: REST API + React hydration
- Same data, different delivery mechanism
- 100% visual parity with enhanced architecture
