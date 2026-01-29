# Product Price Block - Phase 3 Parity

**Date:** December 23, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** Voxel product-price.php (173 lines) - PHP-only widget

## Summary

The product-price block has **100% parity** with Voxel's implementation. **Important Note:** The Voxel product-price widget is PHP-only with no client-side JavaScript. The `voxel-product-summary.beautified.js` file in the docs folder is for a different widget (checkout/cart summary). The React implementation correctly renders the same HTML structure as Voxel's PHP template while adding REST API data fetching for headless/Next.js compatibility.

## Reference File Clarification

| File | Actual Widget | Used For |
|------|---------------|----------|
| voxel-product-summary.beautified.js | Checkout/Cart Summary | **NOT product-price** |
| product-price.php (173 lines) | Product Price | **This block** |

The PHASE3-PLAN.md mapping was incorrect - product-price doesn't have a corresponding JavaScript file because the Voxel widget is purely server-rendered.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/product-price.php` (173 lines)
- **Template:** `themes/voxel/templates/widgets/product-price.php`
- **Widget ID:** ts-product-price
- **Framework:** PHP-only (no JavaScript)
- **Purpose:** Display product price with optional discount styling

### Voxel HTML Structure

```html
<!-- Available with discount -->
<span class="vx-price">$99.00 / night</span>
<span class="vx-price"><s>$199.00 / night</s></span>

<!-- Available without discount -->
<span class="vx-price">$99.00 / night</span>

<!-- Not available / out of stock -->
<span class="vx-price no-stock">Out of stock</span>
```

### Price Calculation (from Voxel PHP)

- Uses `$field->get_minimum_price_for_date()` with/without discounts
- Supports booking suffixes: " / night", " / day"
- Supports subscription intervals: " / {interval}"
- Error codes: `PRODUCT_ERR_OUT_OF_STOCK` → "Out of stock"
- Default error: "Unavailable"

## React Implementation Analysis

### File Structure
```
app/blocks/src/product-price/
├── frontend.tsx              (~395 lines) - Entry point with hydration
├── shared/
│   └── ProductPriceComponent.tsx (~270 lines) - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** 8.14 kB | gzip: 2.37 kB

### Architecture

Since the Voxel widget is PHP-only, our React implementation:

1. **Fetches price data via REST API** (`/voxel-fse/v1/product-price?post_id={id}`)
2. **Renders same HTML structure** as Voxel's PHP template
3. **Uses same CSS classes** (`.vx-price`, `.vx-price.no-stock`)
4. **Supports same style controls** (typography, colors, strikethrough)

This is intentionally headless-ready for Next.js migration.

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .vx-price | span className="vx-price" | Done |
| .vx-price.no-stock | span className="vx-price no-stock" | Done |
| .vx-price s | s element inside .vx-price | Done |
| Price + suffix format | {formattedPrice}{suffix} | Done |
| Discount display | Two .vx-price spans (discount + strikethrough) | Done |

### Style Controls (All from Voxel widget)

| Control | CSS Variable | Status |
|---------|--------------|--------|
| price_typo | --vx-price-font-* | Done |
| ts_price_col | --vx-price-color | Done |
| ts_strike_col_text | --vx-strike-text-color | Done |
| ts_strike_col | --vx-strike-line-color | Done |
| ts_strike_width | --vx-strike-width | Done |
| ts_price_nostock | --vx-nostock-color | Done |

### State Rendering

| State | Voxel Output | React Output | Status |
|-------|--------------|--------------|--------|
| Available (no discount) | `.vx-price` | Same | Done |
| Available (with discount) | Two `.vx-price` + `s` | Same | Done |
| Out of stock | `.vx-price.no-stock` | Same | Done |
| Error/unavailable | `.vx-price.no-stock` | Same | Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | Done |
| Get post ID | `getPostIdFromContext()` multiple fallbacks | Done |
| Fetch price data | REST API `/voxel-fse/v1/product-price` | Done |
| Render HTML | `ProductPriceComponent` | Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-hydrated` check | Done |
| Post ID from vxconfig | `vxconfig.postId` | Done |
| Post ID from body class | `postid-{id}` class parsing | Done |
| Post ID from wp.data | `select('core/editor').getCurrentPostId()` | Done |
| Post ID from article | `article#post-{id}` parsing | Done |
| Loading state | `.ts-loader` spinner | Done |
| Error state | Error message display | Done |
| No data (editor) | Placeholder "$0.00" | Done |
| No data (frontend) | "Unavailable" text | Done |
| Turbo/PJAX | Re-initialization listeners | Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/product-price | REST GET with post_id | Done |

### API Response Structure

```typescript
interface ProductPriceData {
  isAvailable: boolean;
  hasDiscount: boolean;
  regularPrice: number;
  discountPrice?: number;
  formattedRegularPrice: string;
  formattedDiscountPrice?: string;
  suffix?: string;          // " / night", " / day", " / month"
  errorMessage?: string;    // "Out of stock", "Unavailable"
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility
- Multiple post ID detection fallbacks
- useMemo for style and vxconfig computation
- CSS variables for dynamic styling
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners

## Build Output

```
frontend.js  8.14 kB | gzip: 2.37 kB
Built in 74ms
```

## Conclusion

The product-price block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.vx-price`, `.vx-price.no-stock`)
- Discount display with strikethrough
- All style controls supported via CSS variables
- Multiple states: available, discount, out of stock, error
- Price suffix support (/ night, / day, etc.)

**Key Insight:** The Voxel product-price widget has **no JavaScript** - it's purely PHP-rendered HTML. Our React implementation adds:
- REST API data fetching for headless/Next.js compatibility
- Client-side hydration
- Multiple post ID detection methods
- Loading and error states

The `voxel-product-summary.beautified.js` file is for the checkout/cart summary widget (a different, much more complex widget) and is not applicable to this block.

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-only
