# Current Plan Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** current-plan-widget.php (806 lines) - PHP-only widget

## Summary

The current-plan block has **100% parity** with Voxel's implementation. **Important Note:** The Voxel current-plan widget is PHP-only with no client-side JavaScript. It's part of the `paid-memberships` module and displays the current user's membership plan status with links to manage or switch plans. The React implementation correctly renders the same HTML structure as Voxel's PHP template while adding REST API data fetching for headless/Next.js compatibility.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| current-plan-widget.php (806 lines) | Current Plan Widget | **PHP-only (membership module)** |
| current-plan-widget.php (template) | HTML Template | PHP template |

There is **no JavaScript file** for this widget - it's purely server-rendered with Voxel's membership system handling the data.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php` (806 lines)
- **Template:** `themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php`
- **Widget ID:** ts-current-plan
- **Framework:** PHP-only (no JavaScript)
- **Purpose:** Display current membership plan with pricing and management links
- **Module:** Part of paid-memberships module (not standalone widget)

### Voxel HTML Structure

```html
<div class="ts-panel active-plan plan-panel">
  <div class="ac-head">
    <svg><!-- plan icon --></svg>
    <b>Current plan</b>
  </div>

  <!-- With pricing (subscription active) -->
  <div class="ac-body">
    <div class="ac-plan-pricing">
      <span class="ac-plan-price">$10.00</span>
      <div class="ac-price-period">/ month</div>
    </div>
    <p><!-- status message --></p>
    <p>Your current plan is Basic</p>
    <div class="ac-bottom">
      <ul class="simplify-ul current-plan-btn">
        <li>
          <a href="..." class="ts-btn ts-btn-1">
            <svg><!-- configure icon --></svg>
            Manage subscription
          </a>
        </li>
        <li>
          <a href="..." class="ts-btn ts-btn-1">
            <svg><!-- switch icon --></svg>
            Switch plan
          </a>
        </li>
      </ul>
    </div>
  </div>

  <!-- Without pricing (free plan / no subscription) -->
  <div class="ac-body">
    <p>Your current plan is Free</p>
    <div class="ac-bottom">
      <ul class="simplify-ul current-plan-btn">
        <li>
          <a href="..." class="ts-btn ts-btn-1">
            <svg><!-- switch icon --></svg>
            Switch plan
          </a>
        </li>
      </ul>
    </div>
  </div>
</div>
```

### Data Flow (from Voxel PHP)

- Uses `$current_user->get_membership()` to get membership data
- Checks if membership type is 'order' (subscription)
- Gets payment method and checks if subscription is canceled
- Shows pricing only for active subscriptions
- Provides links to manage subscription or switch plans

## React Implementation Analysis

### File Structure
```
app/blocks/src/current-plan/
├── frontend.tsx              (~328 lines) - Entry point with hydration
├── shared/
│   └── CurrentPlanComponent.tsx - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** 16.64 kB | gzip: 5.43 kB

### Architecture

Since the Voxel widget is PHP-only, our React implementation:

1. **Fetches plan data via REST API** (`/voxel-fse/v1/current-plan`)
2. **Renders same HTML structure** as Voxel's PHP template
3. **Uses same CSS classes** (`.ts-panel`, `.ac-head`, `.ac-body`, `.ac-plan-pricing`, etc.)
4. **Supports same style controls** (panel style, icons, buttons, typography)
5. **Conditional rendering** based on subscription status

This is intentionally headless-ready for Next.js migration.

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-panel.active-plan.plan-panel | Main panel container | ✅ Done |
| .ac-head | Header with icon and label | ✅ Done |
| .ac-head svg/i | Header icon | ✅ Done |
| .ac-head b | "Current plan" text | ✅ Done |
| .ac-body | Body content area | ✅ Done |
| .ac-plan-pricing | Pricing section (conditional) | ✅ Done |
| .ac-plan-price | Price amount | ✅ Done |
| .ac-price-period | Billing period | ✅ Done |
| .ac-body p | Status message | ✅ Done |
| .ac-body p | Plan label text | ✅ Done |
| .ac-bottom | Footer section | ✅ Done |
| .simplify-ul.current-plan-btn | Button list | ✅ Done |
| .ts-btn.ts-btn-1 | Button links | ✅ Done |

### Style Controls (All from Voxel widget)

| Control | Implementation | Status |
|---------|---------------|--------|
| **ICONS** | | |
| ts_plan_ico | Plan icon | ✅ Done |
| ts_viewplan_ico | View plans icon | ✅ Done |
| ts_configure_ico | Configure/manage icon | ✅ Done |
| ts_switch_ico | Switch plan icon | ✅ Done |
| ts_cancel_ico | Cancel icon | ✅ Done |
| ts_stripe_ico | Stripe portal icon | ✅ Done |
| **PANEL** | | |
| panels_spacing | Gap between panels | ✅ Done |
| panel_border | Border | ✅ Done |
| panel_radius | Border radius | ✅ Done |
| panel_bg | Background color | ✅ Done |
| panel_shadow | Box shadow | ✅ Done |
| **PANEL HEAD** | | |
| head_padding | Padding | ✅ Done |
| head_ico_size | Icon size | ✅ Done |
| head_ico_margin | Icon margin | ✅ Done |
| head_ico_col | Icon color | ✅ Done |
| head_typo | Typography | ✅ Done |
| head_typo_col | Text color | ✅ Done |
| **PANEL PRICING** | | |
| price_align | Alignment | ✅ Done |
| price_typo | Price typography | ✅ Done |
| price_col | Price color | ✅ Done |
| period_typo | Period typography | ✅ Done |
| period_col | Period color | ✅ Done |
| **PANEL BODY** | | |
| panel_spacing | Body padding | ✅ Done |
| panel_gap | Content gap | ✅ Done |
| text_align | Text alignment | ✅ Done |
| body_typo | Typography | ✅ Done |
| body_typo_col | Text color | ✅ Done |
| body_typo_link | Link typography | ✅ Done |
| body_col_link | Link color | ✅ Done |
| **BUTTONS** | | |
| panel_btn_gap | Button gap | ✅ Done |
| scnd_btn_typo | Typography | ✅ Done |
| scnd_btn_radius | Border radius | ✅ Done |
| scnd_btn_c | Text color | ✅ Done |
| scnd_btn_padding | Padding | ✅ Done |
| scnd_btn_height | Min height | ✅ Done |
| scnd_btn_bg | Background | ✅ Done |
| scnd_btn_border | Border | ✅ Done |
| scnd_btn_icon_size | Icon size | ✅ Done |
| scnd_btn_icon_pad | Icon padding | ✅ Done |
| scnd_btn_icon_color | Icon color | ✅ Done |
| scnd_btn_c_h | Text color (hover) | ✅ Done |
| scnd_btn_bg_h | Background (hover) | ✅ Done |
| scnd_btn_border_h | Border (hover) | ✅ Done |
| scnd_btn_icon_color_h | Icon color (hover) | ✅ Done |

### State Rendering

| State | Voxel Output | React Output | Status |
|-------|--------------|--------------|--------|
| Not logged in | "Please login" message | Same | ✅ Done |
| Logged in + subscription | Pricing + manage + switch links | Same | ✅ Done |
| Logged in + free plan | Plan label + switch link | Same | ✅ Done |
| Subscription canceled | Status message displayed | Same | ✅ Done |
| No switch URL | Only manage link shown | Same | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch plan data | REST API `/voxel-fse/v1/current-plan` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Conditional rendering | Based on membershipType, pricing, etc. | ✅ Done |
| Icon rendering | Support for 6 icon controls | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-hydrated` check | ✅ Done |
| Not logged in | Show login message | ✅ Done |
| No membership | Show default state | ✅ Done |
| Subscription active | Show pricing + manage link | ✅ Done |
| Free plan | Hide pricing, show switch link | ✅ Done |
| No switch URL | Hide switch button | ✅ Done |
| Status message | Conditional rendering | ✅ Done |
| Loading state | `.ts-loader` spinner | ✅ Done |
| Error state | Error message display | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/current-plan | REST GET | ✅ Done |

### API Response Structure

```typescript
interface CurrentPlanApiResponse {
  isLoggedIn: boolean;
  membershipType: string;          // 'order', 'default', etc.
  pricing: {
    amount: string;                // Formatted price
    currency: string;
    period: string;                // "/ month", "/ year"
  } | null;
  planLabel: string;               // "Basic Plan", "Free", etc.
  statusMessage?: string;          // "Expires on...", etc.
  manageUrl?: string;              // Link to manage subscription
  switchUrl?: string;              // Link to switch plans
  isSubscriptionCanceled: boolean;
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- Multiple icon object normalizations (6 icons)
- Conditional rendering for subscription vs free plans
- useMemo for style computation
- CSS variables for dynamic styling
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners

## Build Output

```
frontend.js  16.64 kB | gzip: 5.43 kB
Built in 113ms
```

## Conclusion

The current-plan block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.ts-panel`, `.ac-head`, `.ac-body`, `.ac-plan-pricing`, etc.)
- Pricing display with conditional rendering
- All 6 icon controls supported
- All 40+ style controls supported via CSS variables
- Button states with hover effects
- Status message handling
- Subscription vs free plan logic
- REST API data fetching
- vxconfig parsing with normalization
- Multisite support

**Key Insight:** The Voxel current-plan widget has **no JavaScript** - it's purely PHP-rendered HTML from the paid-memberships module. Our React implementation adds:
- REST API data fetching for headless/Next.js compatibility
- Client-side hydration
- Loading and error states
- Conditional rendering based on membership status

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-only

## Differences from Other Tier 4 Blocks

| Block | Type | JavaScript | Module |
|-------|------|------------|--------|
| current-plan | Membership status | **No JS** | paid-memberships |
| current-role | Role management | **No JS** | Core widgets |
| listing-plans | Plan selection | listing-plans-widget.js | Core widgets |
| membership-plans | Plan selection | pricing-plans.js | Core widgets |
| product-price | Price display | **No JS** | Core widgets |
| stripe-account | Stripe Connect | **No JS** (form only) | stripe-connect |

The current-plan, current-role, product-price, and stripe-account widgets are all **PHP-only** with no client-side JavaScript in Voxel. They rely entirely on server-side rendering and Voxel's native systems (membership, roles, products, Stripe Connect) for functionality.
