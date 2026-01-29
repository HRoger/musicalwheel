# Listing Plans Block - Phase 3 Parity

**Date:** December 23, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** voxel-listing-plans-widget.beautified.js (362 lines, ~710B original)

## Summary

The listing-plans block has **100% parity** with Voxel's implementation using a "consumer" architecture. The React block generates the correct HTML structure with `.vx-pick-plan` buttons and proper `href` attributes. Voxel's native `listing-plans-widget.js` script handles the actual AJAX flow for plan selection. This architecture ensures complete compatibility while allowing React to handle the UI rendering.

## Voxel JS Analysis

- **Total lines:** 362 (beautified with comments)
- **Original size:** 710B
- **Framework:** Vanilla JavaScript (not Vue)
- **Pattern:** Event delegation on page load

### Core Features

| Feature | Voxel Implementation |
|---------|---------------------|
| Plan selection | Click handler on `.vx-pick-plan` |
| Loading state | `.vx-pending` class on `.ts-plan-container` |
| Checkout flow | localStorage `voxel:direct_cart` + redirect |
| Redirect flow | Direct redirect for free plans |
| Error handling | `Voxel.alert()` notification |

### Response Types

| Type | Handling |
|------|----------|
| `type: "checkout"` | Store cart in localStorage, redirect to checkout |
| `type: "redirect"` | Direct redirect (free plans) |
| `redirect_url` (legacy) | Fallback redirect handling |
| Error | Show error via `Voxel.alert()` |

## React Implementation Analysis

### File Structure
```
app/blocks/src/listing-plans/
├── frontend.tsx              (~576 lines) - Entry point with hydration
├── shared/
│   └── ListingPlansComponent.tsx (~453 lines) - UI component
├── types/
│   └── index.ts              - Comprehensive TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** 19.49 kB | gzip: 6.45 kB

### Architecture

The React block uses a "consumer" architecture:

1. **React renders HTML structure** with correct classes and `href` attributes
2. **Voxel's native JS** handles click events and AJAX flow
3. **No duplicate JavaScript** - React doesn't re-implement the AJAX logic

This is intentional: Voxel's `listing-plans-widget.js` already handles:
- Click interception on `.vx-pick-plan`
- AJAX request to plan selection URL
- Loading state management
- localStorage cart storage
- Redirect handling
- Error display

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-paid-listings-plans | Main container | Done |
| .ts-plan-container | Plan card wrapper | Done |
| .ts-plan-body | Plan body content | Done |
| .ts-plan-details | Plan name section | Done |
| .ts-plan-name | Plan name text | Done |
| .ts-plan-pricing | Pricing section | Done |
| .ts-plan-price | Price amount | Done |
| .ts-price-period | Billing period | Done |
| .ts-plan-image | Plan image | Done |
| .ts-plan-desc | Plan description | Done |
| .ts-plan-features | Features list | Done |
| .ts-plan-footer | Button container | Done |
| .vx-pick-plan | Plan selection button | Done |
| .ts-btn-2 | Primary button style | Done |
| .plan-featured | Featured plan modifier | Done |
| .ts-plan-featured-text | Featured badge | Done |

### Tab System

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-plan-tabs | Tabs container | Done |
| .ts-generic-tabs | Tab list | Done |
| .ts-tab | Tab item | Done |
| .ts-tab-active | Active tab state | Done |
| Tab click handling | `handleTabClick()` | Done |
| Tab visibility toggle | `hidden` class | Done |

### Style Controls (All from Voxel widget)

| Control | React Attribute | Status |
|---------|-----------------|--------|
| plans_columns | plansColumns + responsive | Done |
| pplans_gap | plansGap | Done |
| pplans_border | CSS variables | Done |
| pplans_radius | plansBorderRadius | Done |
| pplans_bg | CSS variables | Done |
| pricing_align | pricingAlign | Done |
| content_align | contentAlign | Done |
| desc_align | descAlign | Done |
| list_align | listAlign | Done |
| list_gap | listGap | Done |
| list_ico_size | listIconSize | Done |
| pltabs_disable | tabsDisabled | Done |
| pltabs_justify | tabsJustify | Done |
| featured_* | CSS classes | Done |
| primary_btn_* | CSS variables | Done |
| scnd_btn_* | CSS variables | Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | Done |
| Fetch API data | `fetchPlansData()` REST | Done |
| Normalize config | `normalizeConfig()` dual-format | Done |
| Render HTML | `ListingPlansComponent` | Done |
| Voxel JS attaches | Native script binds to `.vx-pick-plan` | Done |

### Click Flow (Handled by Voxel's Native JS)

| Step | Voxel Implementation | React Responsibility |
|------|---------------------|---------------------|
| Click `.vx-pick-plan` | Event listener | Provides element with href |
| Add loading state | `.vx-pending` class | Provides `.ts-plan-container` |
| AJAX request | `jQuery.get(href)` | Provides correct href URL |
| Handle response | Checkout/redirect logic | N/A (Voxel handles) |
| localStorage cart | `voxel:direct_cart` | N/A (Voxel handles) |
| Remove loading | Remove `.vx-pending` | N/A (Voxel handles) |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-hydrated` check | Done |
| Multiple price groups | Tab filtering by group | Done |
| Free plans | Show "Pick plan" text | Done |
| Paid plans | Show "Buy plan" text | Done |
| Featured plans | `.plan-featured` class | Done |
| Discount prices | Strikethrough original | Done |
| No description | Conditional rendering | Done |
| No features | Conditional rendering | Done |
| No image | Conditional rendering | Done |
| Editor context | Prevent default click | Done |
| REST API error | Error state display | Done |
| Turbo/PJAX | Re-initialization listeners | Done |

## Per-Plan Configuration

| Config Option | Implementation | Status |
|---------------|----------------|--------|
| ts_plan__{key}__image | `planConfigs[key].image` | Done |
| ts_plan__{key}__features | `planConfigs[key].features` | Done |
| ts_plan__{key}__featured | `price.isFeatured` | Done |
| ts_plan__{key}__featured_text | `price.featuredText` | Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/listing-plans | REST GET | Done |
| Plan selection URL | Via href (Voxel native) | Done |

## Redirect Options

| Option | Implementation | Status |
|--------|----------------|--------|
| ts_direct_purchase_flow | API response includes redirect | Done |
| order | Redirect to orders page | Via Voxel |
| new_post | Redirect to create post | Via Voxel |
| custom | Custom URL redirect | Via Voxel |

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- useState for tab management
- useEffect for initial tab selection
- useCallback for memoized handlers
- Conditional rendering for optional elements
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners

## Build Output

```
frontend.js  19.49 kB | gzip: 6.45 kB
Built in 159ms
```

## Conclusion

The listing-plans block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly
- All CSS classes present (ts-plan-container, ts-plan-body, vx-pick-plan, etc.)
- Tab system with visibility toggle
- Featured plan styling
- Discount price display
- Plan features with icons
- All 40+ style controls supported
- Per-plan configuration (image, features, featured badge)
- REST API data fetching
- vxconfig parsing with normalization
- Multisite support

**Architecture:** Consumer pattern - React renders HTML, Voxel's native JS handles AJAX

The native `listing-plans-widget.js` handles:
- Click events on `.vx-pick-plan` buttons
- Loading state (`.vx-pending`)
- AJAX to plan selection URL
- localStorage cart storage (`voxel:direct_cart`)
- Checkout/redirect flow
- Error display via `Voxel.alert()`

This architecture ensures:
1. Complete compatibility with existing Voxel behavior
2. No duplicate JavaScript logic
3. Seamless integration with Voxel's cart and checkout systems
4. Headless-ready for Next.js (REST API data fetching)
