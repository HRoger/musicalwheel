# Stripe Account Block - Parity Implementation Report

**Date:** 2026-02-01
**Status:** ✅ COMPLETE - Full Parity Achieved (including shipping screen features)

## Overview

The Stripe Account block allows users to manage their Stripe Connect vendor account, including:
- Account onboarding and setup
- Dashboard access
- Shipping zone/rate configuration (if vendor shipping is enabled)

## Source Analysis

### Voxel Widget Location
- **Widget:** `themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php` (2731 lines)
- **Template:** `themes/voxel/app/modules/stripe-connect/templates/frontend/stripe-account-widget.php`
- **Shipping Template:** `themes/voxel/app/modules/stripe-connect/templates/frontend/stripe-account-shipping.php`
- **AJAX Controller:** `themes/voxel/app/modules/stripe-connect/controllers/frontend/connect-frontend-controller.php`

### Key Logic Inventoried

#### 1. Authentication & Permissions (Lines 2605-2613)
```php
if ( ! is_user_logged_in() ) {
    printf( '<p class="ts-restricted">%s</p>', _x( 'You must be logged in...', 'voxel' ) );
    return;
}

if ( ! \Voxel\get( 'payments.stripe.stripe_connect.enabled' ) ) {
    printf( '<p class="ts-restricted">%s</p>', _x( 'This feature has not been enabled.', 'voxel' ) );
    return;
}
```

#### 2. Admin Onboarding Check (Lines 2616-2627)
```php
if ( $user->has_cap('administrator')
    && apply_filters( 'voxel/stripe_connect/enable_onboarding_for_admins', false ) !== true
) {
    // Admins don't need onboarding by default
}
```

#### 3. Account Status (Line 2643)
```php
$account = $user->get_stripe_vendor_details();
// Returns: exists, charges_enabled, details_submitted
```

#### 4. Nonce Generation (Line 2656)
```php
$config = [
    'nonce' => wp_create_nonce('vx_vendor_dashboard'),
    // ...
];
```

#### 5. Shipping Configuration (Lines 2660-2702)
When `payments.stripe.stripe_connect.shipping.responsibility === 'vendor'`:
- Countries with subdivisions
- Shipping classes
- User's shipping zones and rates

#### 6. AJAX Handler (connect-frontend-controller.php:49-138)
```php
protected function save_vendor_shipping() {
    \Voxel\verify_nonce( $_REQUEST['_wpnonce'] ?? '', 'vx_vendor_dashboard' );
    // Validates and saves shipping zones/rates
}
```

## Implementation

### Files Created/Modified

#### 1. NEW: FSE API Controller
**File:** `themes/voxel-fse/app/controllers/fse-stripe-account-api-controller.php`

Provides REST API endpoints:
- `GET /wp-json/voxel-fse/v1/stripe-account/config`

Returns:
```json
{
  "success": true,
  "data": {
    "nonce": "vx_vendor_dashboard_nonce",
    "is_preview": false,
    "onboard_link": "/?vx=1&action=stripe_connect.account.onboard",
    "dashboard_link": "/?vx=1&action=stripe_connect.account.login",
    "account": {
      "exists": true,
      "charges_enabled": true,
      "details_submitted": true
    },
    "is_admin": false,
    "admin_onboarding_enabled": false,
    "shipping_enabled": true,
    "shipping_countries": { ... },
    "shipping_countries_by_continent": { ... },
    "shipping_classes": { ... },
    "shipping_zones": [],
    "shipping_rates": [],
    "primary_currency": "USD",
    "l10n": { ... }
  }
}
```

#### 2. MODIFIED: Frontend.tsx
**File:** `themes/voxel-fse/app/blocks/src/stripe-account/frontend.tsx`

Changes:
- Fixed `saveShipping()` to accept nonce from config (not global window)
- Uses Voxel AJAX URL with proper multisite support via `getSiteBaseUrl()`
- Uses Voxel's notification system `Voxel.alert()` with browser fallback

#### 3. MODIFIED: functions.php
Added controller registration after existing API controllers.

## Parity Verification Checklist

### Section 1: HTML Structure Match
- [x] `.ts-panel` container class
- [x] `.ac-body` content area
- [x] `.ts-btn.ts-btn-1.ts-btn-large` button classes
- [x] `.simplify-ul.current-plan-btn` list structure
- [x] `.ts-field-repeater` for shipping zones/rates
- [x] `.ts-repeater-head` for expandable sections

### Section 2: JavaScript Logic & URL Parameters
- [x] Voxel AJAX endpoint: `/?vx=1&action=stripe_connect.account.save_shipping`
- [x] Nonce: `vx_vendor_dashboard` (from REST API config)
- [x] FormData format matches Voxel (action, _wpnonce, shipping_zones, shipping_rates)

### Section 3: Permissions/Visibility Logic
- [x] User must be logged in (REST API `permission_callback`)
- [x] Stripe Connect must be enabled
- [x] Admin onboarding filter respected
- [x] Account status drives button visibility

### Section 4: Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│ 1. CONFIG LOAD (on mount) - FSE REST Controller            │
│    GET /wp-json/voxel-fse/v1/stripe-account/config          │
│    Returns: nonces, account status, shipping config         │
│    Called: Once per page load                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. SAVE SHIPPING (on save) - Voxel AJAX Directly            │
│    POST /?vx=1&action=stripe_connect.account.save_shipping  │
│    Uses nonce from config                                   │
│    Called: On user save action                              │
└─────────────────────────────────────────────────────────────┘
```

### Section 5: Account Status Display

| Account State | Message | Action Button |
|--------------|---------|---------------|
| Admin (onboarding disabled) | "Stripe vendor onboarding is not necessary..." | None |
| No account | "Setup your Stripe vendor account..." | "Start setup" |
| Account exists, not submitted | "Your account is pending verification." | "Complete onboarding" |
| Account complete | "Your account is ready to accept payments." | "Stripe Express Dashboard", "Update information", "Configure shipping" |

### Section 6: Shipping Screen Features

| Feature | Voxel | FSE | Status |
|---------|-------|-----|--------|
| Shipping zones CRUD | ✅ | ✅ | Parity |
| Shipping rates CRUD | ✅ | ✅ | Parity |
| Country select by continent | ✅ | ✅ | Parity |
| State/subdivision select | ✅ | ✅ | Parity |
| Zone-to-rate assignment | ✅ | ✅ | Parity |
| Rate types (free/flat) | ✅ | ✅ | Parity |
| Delivery estimates | ✅ | ✅ | Parity |
| Shipping classes per rate | ✅ | ✅ | Parity |
| Save with AJAX | ✅ | ✅ | Parity |
| Drag-and-drop reordering | ✅ | ✅ | Parity |
| Continent filter tabs | ✅ | ✅ | Parity |
| "All in [Continent]" option | ✅ | ✅ | Parity |
| ZIP code filtering UI | ✅ | ✅ | Parity |
| State/subdivision expansion | ✅ | ✅ | Parity |

## Known Differences

1. **Preview Mode**: Voxel's `preview_as_user` control is for Elementor editor. FSE uses REST API which always returns current user's data.

2. **Drag Implementation**: Voxel uses `vue-draggable` library while FSE uses native HTML5 drag-and-drop API. Both achieve the same user functionality.

## Test Scenarios

1. **Guest User**: Should see login required message
2. **Admin User**: Should see "onboarding not necessary" message
3. **New Vendor**: Should see "Start setup" button
4. **Incomplete Vendor**: Should see "Complete onboarding" button
5. **Complete Vendor**: Should see dashboard and shipping options
6. **Shipping Save**: Should save and reload correctly

## References

- Voxel User Vendor Trait: `themes/voxel/app/users/vendor-trait.php`
- Countries Data: `themes/voxel/app/utils/data/countries-with-subdivisions.php`
- Shipping Classes: `themes/voxel/app/product-types/shipping/shipping-class.php`
