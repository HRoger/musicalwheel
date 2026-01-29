# Product Price Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to product-price frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-63)

Added comprehensive documentation header covering all Voxel product-price.php controls (173 lines, "Product price (VX)" widget):

**CHART SECTION (Content Tab):**
- price_typo - Typography (group control)
  - Selector: {{WRAPPER}} .vx-price

- ts_price_col - Color (responsive)
  - Selector: {{WRAPPER}} .vx-price
  - CSS: color

- ts_strike_col_text - Linethrough text color (responsive)
  - Selector: {{WRAPPER}} .vx-price s
  - CSS: color

- ts_strike_col - Linethrough line color (responsive)
  - Selector: {{WRAPPER}} .vx-price s
  - CSS: text-decoration-color

- ts_strike_width - Linethrough line width (responsive slider)
  - Selector: {{WRAPPER}} .vx-price s
  - CSS: text-decoration-thickness
  - Units: px, Range: 1-200

- ts_price_nostock - Out of stock color (responsive)
  - Selector: {{WRAPPER}} .vx-price.no-stock
  - CSS: color

**HTML STRUCTURE:**
- Available with discount:
  - `<span class="vx-price">{discount_price}{suffix}</span>`
  - `<span class="vx-price"><s>{regular_price}{suffix}</s></span>`
- Available without discount:
  - `<span class="vx-price">{regular_price}{suffix}</span>`
- Not available:
  - `<span class="vx-price no-stock">{error_message}</span>`

### 2. normalizeConfig() Function (lines 80-174)

Added normalization function with 3 specialized helper functions:

```typescript
function normalizeConfig(raw: Record<string, unknown>): ProductPriceVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {...};

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number): number => {...};

  // Helper for typography normalization
  const normalizeTypography = (val: unknown): TypographyConfig | undefined => {...};

  return {
    priceColor,
    strikethroughTextColor,
    strikethroughLineColor,
    strikethroughWidth,
    strikethroughWidthUnit,
    outOfStockColor,
    typography,
    postId,
    postType,
  };
}
```

**Features:**
- String/Number normalization with type coercion
- Typography object normalization (fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform)
- Responsive typography support (tablet/mobile)
- Dual-format support (camelCase, snake_case, ts_* prefixed)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 231-244)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  8.14 kB | gzip: 2.37 kB
Built in 82ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/product-price.php` (173 lines)
- Template: `themes/voxel/templates/widgets/product-price.php`
- Widget name: "Product price (VX)"
- Widget ID: ts-product-price

## Architecture Notes

The product-price block is unique because:
- **Simple widget**: Only 6 controls (typography + 5 colors/sizes)
- **Product field integration**: Reads from post's product field
- **Price calculation**: Uses `get_minimum_price_for_date()` with/without discounts
- **Booking suffixes**: Supports " / night", " / day" for booking products
- **Subscription intervals**: Supports " / {interval}" for subscription products
- **Stock awareness**: Shows "Out of stock" or "Unavailable" when not available
- **Currency formatting**: Uses Voxel's `currency_format()` function

## Next.js Readiness Checklist

- [x] normalizeConfig() handles vxconfig format
- [x] String normalization (6 properties)
- [x] Number normalization (strikethroughWidth)
- [x] Typography normalization (7 properties)
- [x] Responsive typography support (tablet/mobile)
- [x] Dual-format support (camelCase/snake_case/ts_*)
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] REST API data fetching
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/product-price/frontend.tsx`
   - Added Voxel parity header (63 lines)
   - Added normalizeConfig() function (95 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Typography | 100% | Group control with 7 properties |
| Price color | 100% | Responsive color |
| Strikethrough text color | 100% | Responsive color |
| Strikethrough line color | 100% | Responsive color |
| Strikethrough width | 100% | Responsive slider (1-200px) |
| Out of stock color | 100% | Responsive color |
| HTML structure | 100% | All Voxel classes (.vx-price, .no-stock) |
| Discount display | 100% | Shows both prices with strikethrough |
| Suffix support | 100% | Booking/subscription suffixes |
| Error states | 100% | Out of stock / Unavailable |
| REST API | 100% | Product price endpoint |
| Multisite support | 100% | getRestBaseUrl() |
| normalizeConfig() | NEW | API format compatibility |
