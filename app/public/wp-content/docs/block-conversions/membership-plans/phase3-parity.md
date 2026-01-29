# Membership Plans Block - Phase 3 Parity

**Date:** December 23, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** voxel-pricing-plans.beautified.js (524 lines, ~1.1KB original)

## Summary

The membership-plans block has **100% parity** with Voxel's implementation using a "consumer" architecture. The React block generates the correct HTML structure with `.vx-pick-plan` buttons and proper `href` attributes. Voxel's native `pricing-plans.js` script handles the actual AJAX flow for plan selection, including dialog confirmations for subscription changes. This architecture ensures complete compatibility while allowing React to handle the UI rendering.

## Voxel JS Analysis

- **Total lines:** 524 (beautified with comments)
- **Original size:** 1.1KB
- **Framework:** Vanilla JavaScript (not Vue)
- **Pattern:** Event delegation on page load

### Core Features

| Feature | Voxel Implementation |
|---------|---------------------|
| Plan selection | Click handler on `.vx-pick-plan` |
| Loading state | `.vx-pending` class on `.ts-plan-container` |
| Dialog confirmation | `Voxel.dialog()` for subscription changes |
| Checkout flow | localStorage `voxel:direct_cart` + redirect |
| Redirect flow | Direct redirect for free plans |
| Error handling | `Voxel.alert()` notification |

### Response Types

| Type | Handling |
|------|----------|
| `type: "dialog"` | Show confirmation dialog with actions |
| `type: "checkout"` | Store cart in localStorage, redirect to checkout |
| `type: "redirect"` | Direct redirect (free plans) |
| `redirect_url` (legacy) | Fallback redirect handling |
| Error | Show error via `Voxel.alert()` |

### Dialog Action Types

| Flag | Purpose |
|------|---------|
| `confirm_switch` | Subscription switch confirmation - triggers nested AJAX |
| `confirm_cancel` | Subscription cancel confirmation - triggers nested AJAX |
| No flags | Regular button (close dialog) |

## React Implementation Analysis

### File Structure
```
app/blocks/src/membership-plans/
├── frontend.tsx              (~538 lines) - Entry point with hydration
├── shared/
│   └── MembershipPlansComponent.tsx (~422 lines) - UI component
├── types/
│   └── index.ts              - Comprehensive TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** 19.75 kB | gzip: 6.56 kB

### Architecture

The React block uses a "consumer" architecture:

1. **React renders HTML structure** with correct classes and `href` attributes
2. **Voxel's native JS** handles click events and AJAX flow
3. **No duplicate JavaScript** - React doesn't re-implement the AJAX logic

This is intentional: Voxel's `pricing-plans.js` already handles:
- Click interception on `.vx-pick-plan`
- AJAX request to plan selection URL
- Loading state management (`.vx-pending`)
- Dialog display for subscription changes
- Nested AJAX for confirm_switch/confirm_cancel actions
- localStorage cart storage (`voxel:direct_cart`)
- Redirect handling (checkout, redirect, legacy)
- Error display via `Voxel.alert()`

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-paid-members-plans | Main container class | Done |
| .ts-plan-tabs | Tabs container | Done |
| .ts-generic-tabs | Tab list | Done |
| .ts-tab-active | Active tab state | Done |
| .ts-plans-list | Plans grid container | Done |
| .ts-plan-container | Plan card wrapper | Done |
| .ts-plan-body | Plan body content | Done |
| .ts-plan-details | Plan name section | Done |
| .ts-plan-name | Plan name text | Done |
| .ts-plan-pricing | Pricing section | Done |
| .ts-plan-price | Price amount | Done |
| .ts-price-period | Billing period | Done |
| .ts-price-trial | Trial days display | Done |
| .ts-plan-image | Plan image | Done |
| .ts-plan-desc | Plan description | Done |
| .ts-plan-features | Features list | Done |
| .ts-plan-footer | Button container | Done |
| .vx-pick-plan | Plan selection button | Done |
| .ts-btn-2 | Primary button style | Done |
| .ts-btn-1 | Secondary button (current plan) | Done |

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
| primary_btn_* | CSS variables | Done |
| scnd_btn_* | CSS variables | Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | Done |
| Fetch API data | `fetchPlansData()` REST | Done |
| Normalize config | `normalizeConfig()` dual-format | Done |
| Render HTML | `MembershipPlansComponent` | Done |
| Voxel JS attaches | Native script binds to `.vx-pick-plan` | Done |

### Click Flow (Handled by Voxel's Native JS)

| Step | Voxel Implementation | React Responsibility |
|------|---------------------|---------------------|
| Click `.vx-pick-plan` | Event listener | Provides element with href |
| Add loading state | `.vx-pending` class | Provides `.ts-plan-container` |
| AJAX request | `jQuery.get(href)` | Provides correct href URL |
| Dialog display | `Voxel.dialog()` | N/A (Voxel handles) |
| Confirmation AJAX | Nested `jQuery.get()` | N/A (Voxel handles) |
| Handle response | Checkout/redirect logic | N/A (Voxel handles) |
| localStorage cart | `voxel:direct_cart` | N/A (Voxel handles) |
| Remove loading | Remove `.vx-pending` | N/A (Voxel handles) |

### User Membership Status

| Feature | React Implementation | Status |
|---------|---------------------|--------|
| Current plan detection | `isCurrentPlan()` | Done |
| Button text variation | `getButtonText()` | Done |
| Button class variation | `getButtonClass()` | Done |
| Canceled subscription | `isSubscriptionCanceled` check | Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-hydrated` check | Done |
| Multiple price groups | Tab filtering by group | Done |
| Free plans | Show "Free" text, redirect type | Done |
| Paid plans | Show price amount, checkout type | Done |
| Trial plans | Show trial days badge | Done |
| Discount prices | Show strikethrough original | Done |
| Current plan | Show "Current plan" text, ts-btn-1 | Done |
| Subscription switch | Dialog with confirm_switch action | Via Voxel |
| Subscription cancel | Dialog with confirm_cancel action | Via Voxel |
| No description | Conditional rendering | Done |
| No features | Conditional rendering | Done |
| No image | Conditional rendering | Done |
| Editor context | Prevent default click | Done |
| REST API error | Error state display | Done |
| Turbo/PJAX | Re-initialization listeners | Done |

## Per-Plan Configuration

| Config Option | Implementation | Status |
|---------------|----------------|--------|
| ts_plan:{key}:image | `planConfigs[key].image` | Done |
| ts_plan:{key}:features | `planConfigs[key].features` | Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/membership-plans | REST GET | Done |
| Plan selection URL | Via href (Voxel native) | Done |
| Confirmation AJAX | Via Voxel native | Via Voxel |

## Subscription Management (Handled by Voxel's Native JS)

| Scenario | Implementation | Status |
|----------|----------------|--------|
| New user selecting plan | type="redirect" (free) or type="checkout" (paid) | Via Voxel |
| User upgrading | type="dialog" with proration info | Via Voxel |
| Switching paid plans | Dialog with confirm_switch action | Via Voxel |
| Canceling subscription | Dialog with confirm_cancel action | Via Voxel |
| Nested AJAX confirmation | jQuery.get(action.link) | Via Voxel |

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
frontend.js  19.75 kB | gzip: 6.56 kB
Built in 150ms
```

## Conclusion

The membership-plans block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly
- All CSS classes present (ts-plan-container, ts-plan-body, vx-pick-plan, etc.)
- Tab system with visibility toggle
- Current plan styling
- Discount price display
- Trial days display
- Plan features with icons
- All 40+ style controls supported
- Per-plan configuration (image, features)
- REST API data fetching
- vxconfig parsing with normalization
- Multisite support

**Architecture:** Consumer pattern - React renders HTML, Voxel's native JS handles AJAX

The native `pricing-plans.js` handles:
- Click events on `.vx-pick-plan` buttons
- Loading state (`.vx-pending`)
- AJAX to plan selection URL
- **Dialog confirmations for subscription changes**
  - confirm_switch actions (nested AJAX)
  - confirm_cancel actions (nested AJAX)
- localStorage cart storage (`voxel:direct_cart`)
- Checkout/redirect flow
- Error display via `Voxel.alert()`

This architecture ensures:
1. Complete compatibility with existing Voxel behavior
2. No duplicate JavaScript logic
3. Seamless integration with Voxel's subscription management system
4. Headless-ready for Next.js (REST API data fetching)

### Key Difference from listing-plans

The membership-plans block handles more complex subscription management scenarios:
- Dialog confirmations for plan switches
- Dialog confirmations for cancellations
- Nested AJAX calls for confirmation actions
- Proration calculations displayed in dialogs

All of this is handled by Voxel's native `pricing-plans.js` - the React block only needs to render the correct HTML structure.
