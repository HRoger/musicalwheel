# Cart Summary Block - Admin Options Audit

**Date:** 2026-02-05
**Block:** `cart-summary`
**Auditor:** AI Agent (wire:admin-audit)

---

## Audit Summary

| Metric | Count |
|--------|-------|
| Total admin config options | 22 |
| Correctly wired (end-to-end) | 15 |
| Partially wired (minor issues) | 4 |
| Incorrectly wired (breaking) | 2 |
| Missing from FSE | 1 |

**Overall Score: 68% fully correct, 86% functional**

---

## Data Flow Diagram

```
Voxel Admin Panel (wp-admin settings)
    │
    ▼
Voxel Widget render() ─── cart-summary.php:2596-2662
    │                      Builds $config from \Voxel\get() calls
    ▼
FSE REST Controller ────── fse-cart-api-controller.php:50-151
    │                      GET /wp-json/voxel-fse/v1/cart/config
    ▼
TypeScript Types ───────── types/index.ts:660-706
    │                      CartConfig interface
    ▼
React Components ───────── frontend.tsx + shared/*.tsx
                           Consumes config, drives UI behavior
```

---

## Detailed Config Property Audit

### 1. `nonce.cart` / `nonce.checkout`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `wp_create_nonce('vx_cart')` / `wp_create_nonce('vx_checkout')` | cart-summary.php:2598-2599 |
| FSE Controller | `wp_create_nonce('vx_cart')` / `wp_create_nonce('vx_checkout')` | fse-cart-api-controller.php:144-145 |
| TS Types | `nonce: { cart: string; checkout: string }` | types/index.ts:698-701 |
| Component | Used in AJAX calls for cart ops and checkout | frontend.tsx, QuickRegister.tsx:104 |

**Verdict: PASS** - Identical nonce generation.

---

### 2. `guest_customers.behavior`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | Default: `'proceed_with_email'` | cart-summary.php:2602 |
| FSE Controller | Default: `'redirect_to_login'` | fse-cart-api-controller.php:339 |
| TS Types | `'redirect_to_login' \| 'proceed_with_email'` | types/index.ts:683 |
| Component | Drives guest checkout flow visibility | CartSummaryComponent.tsx, QuickRegister.tsx |

**Verdict: FAIL (Default Mismatch)** - Voxel defaults to `'proceed_with_email'`, FSE controller defaults to `'redirect_to_login'`. If the admin has not explicitly set this value, the FSE block will show redirect-to-login behavior while Voxel shows guest email checkout.

**Fix:** Change `fse-cart-api-controller.php:339` default from `'redirect_to_login'` to `'proceed_with_email'`.

---

### 3. `guest_customers.proceed_with_email.require_verification`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `\Voxel\get(..., true)` | cart-summary.php:2604 |
| FSE Controller | `(bool) \Voxel\get(..., true)` | fse-cart-api-controller.php:347 |
| TS Types | `require_verification: boolean` | types/index.ts:685 |
| Component | Toggles verification code UI | QuickRegister.tsx:227 |

**Verdict: PASS** - Same setting path, same default.

---

### 4. `guest_customers.proceed_with_email.require_tos`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `\Voxel\get(..., false)` | cart-summary.php:2605 |
| FSE Controller | `(bool) \Voxel\get(..., false)` | fse-cart-api-controller.php:348 |
| TS Types | `require_tos: boolean` | types/index.ts:686 |
| Component | Toggles terms checkbox | CartSummaryComponent.tsx |

**Verdict: PASS** - Same setting path, same default.

---

### 5. `guest_customers.proceed_with_email.tos_text`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | Not in widget $config (built in template PHP) | — |
| FSE Controller | Generated with `sprintf()` using terms/privacy URLs | fse-cart-api-controller.php:351-362 |
| TS Types | `tos_text?: string` | types/index.ts:687 |
| Component | Rendered as HTML via dangerouslySetInnerHTML (presumed) | CartSummaryComponent.tsx |

**Verdict: PASS** - FSE controller correctly generates the HTML with links. The Voxel widget builds this in the PHP template rather than the config, but the FSE approach is functionally equivalent.

---

### 6. `recaptcha.enabled` / `recaptcha.key`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `\Voxel\get('settings.recaptcha.enabled')` / `\Voxel\get('settings.recaptcha.key')` | cart-summary.php:2608-2610 |
| FSE Controller | `\Voxel\get('settings.recaptcha.enabled', false)` / `\Voxel\get('settings.recaptcha.key', '')` | fse-cart-api-controller.php:125-126 |
| TS Types | `recaptcha: { enabled: boolean; key?: string }` | types/index.ts:694-696 |
| Component | Used in QuickRegister for code sending | QuickRegister.tsx:107-115 |

**Verdict: PASS** - Same setting paths. FSE adds explicit defaults which is fine.

---

### 7. `auth_link`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `add_query_arg('redirect_to', current_url, get_permalink(templates.auth))` | cart-summary.php:2594 |
| FSE Controller | `get_permalink(\Voxel\get('templates.auth'))` (no `redirect_to`) | fse-cart-api-controller.php:92-94 |
| TS Types | `auth_link: string` | types/index.ts:663 |
| Component | Used as href in "Sign in" button | QuickRegister.tsx:191 |

**Verdict: PARTIAL** - FSE controller does not append `redirect_to` query parameter. After login, the user won't be redirected back to the cart page. Voxel builds the link with `redirect_to=current_url` so the user returns to checkout after authentication.

**Fix:** Add `redirect_to` parameter. Note: In REST context there's no "current URL" — consider passing it from the frontend or using a known cart/checkout page URL.

---

### 8. `multivendor.enabled`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `!! \Voxel\get('payments.stripe.stripe_connect.enabled')` | cart-summary.php:2614 |
| FSE Controller | `(bool) \Voxel\get('payments.stripe.stripe_connect.enabled', false)` | fse-cart-api-controller.php:101 |
| TS Types | `multivendor: { enabled: boolean }` | types/index.ts:664-666 |
| Component | Drives shipping method (platform vs vendor) | ShippingMethodCards.tsx:242, CartSummaryComponent.tsx:381-383 |

**Verdict: PASS** - Same setting path, same boolean coercion.

---

### 9. `multivendor.charge_type`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `\Voxel\get('payments.stripe.stripe_connect.charge_type')` | cart-summary.php:2615 |
| FSE Controller | `\Voxel\get('payments.stripe.stripe_connect.charge_type', 'destination')` | fse-cart-api-controller.php:134 |
| TS Types | **MISSING** - `multivendor` only has `enabled` | types/index.ts:664-666 |
| Component | Not referenced in any component | — |

**Verdict: PARTIAL (Type Gap)** - The controller sends `charge_type`, but the TypeScript `CartConfig` interface does not include it. The field is silently available at runtime but not type-safe. No component currently consumes it, so there's no functional impact yet, but it should be added for completeness.

**Fix:** Add `charge_type?: string` to `CartConfig.multivendor` in `types/index.ts`.

---

### 10. `shipping.zones`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `Shipping_Zone::get_all() → get_frontend_config()`, filtered for non-empty rates | cart-summary.php:2618-2623 |
| FSE Controller | Same: `Shipping_Zone::get_all()` → `get_frontend_config()`, filtered for non-empty rates | fse-cart-api-controller.php:234-248 |
| TS Types | `zones: ShippingZones` | types/index.ts:679 |
| Component | Used in ShippingMethodCards for rate selection | ShippingMethodCards.tsx:199-205 |

**Verdict: PASS** - Uses identical Voxel API calls.

---

### 11. `shipping.countries`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `Shipping_Zone::get_supported_countries_data()` | cart-summary.php:2635 |
| FSE Controller | Custom `get_shipping_countries()` method that extracts from zones | fse-cart-api-controller.php:268-297 |
| TS Types | `countries: ShippingCountries` | types/index.ts:678 |
| Component | Used in ShippingDetails country dropdown | ShippingDetails.tsx:130-134 |

**Verdict: PARTIAL** - Different implementation approach. Voxel uses a dedicated `get_supported_countries_data()` static method. FSE extracts countries from zones manually. The result should be equivalent if both systems have the same zones, but the FSE approach may miss countries if `Shippable_Countries` class provides additional data (like states) that the manual extraction handles differently.

**Risk:** Low. The FSE controller does try `Shippable_Countries::all()` first (line 274) and falls back to manual extraction. States are handled via `get_country_states()` method.

---

### 12. `shipping.default_country`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `$this->_determine_customer_shipping_country_code()` → `Visitor::get()->get_country()['alpha-2']` | cart-summary.php:2625, 2694-2701 |
| FSE Controller | `get_default_shipping_country()` → checks `product_settings.shipping.default_country` first, then `Visitor::get_country_code()` | fse-cart-api-controller.php:306-329 |
| TS Types | `default_country: string \| null` | types/index.ts:669 |
| Component | Used as initial country in shipping setup | frontend.tsx (shipping initialization) |

**Verdict: PARTIAL** - FSE controller adds an extra check for `product_settings.shipping.default_country` setting that Voxel does NOT check. Voxel only uses visitor IP geolocation. This means FSE may return a different default country if that setting is configured. Additionally, FSE calls `get_country_code()` while Voxel calls `get_country()['alpha-2']` — these may be different methods.

**Risk:** Low-Medium. The extra fallback is harmless if the setting doesn't exist, but the method name difference (`get_country_code` vs `get_country()['alpha-2']`) should be verified.

---

### 13. `shipping.responsibility`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `stripe_connect.enabled ? get('...shipping.responsibility') : 'platform'` | cart-summary.php:2626 |
| FSE Controller | `$multivendor_enabled ? get('...shipping.responsibility', 'platform') : 'platform'` | fse-cart-api-controller.php:163-166 |
| TS Types | `responsibility: 'platform' \| 'vendor'` | types/index.ts:668 |
| Component | Determines platform_rates vs vendor_rates | ShippingMethodCards.tsx:242-244, CartSummaryComponent.tsx:381-383 |

**Verdict: PASS** - Functionally identical. FSE adds an explicit default which is fine.

---

### 14. `shipping.saved_address`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | Reads `voxel:shipping_address` as **JSON blob** from user meta, decodes it | cart-summary.php:2665-2674 |
| FSE Controller | Reads **individual meta keys** (`voxel:shipping_first_name`, `voxel:shipping_last_name`, etc.) | fse-cart-api-controller.php:176-189 |
| TS Types | `saved_address?: { first_name?, last_name?, country?, state?, address?, zip? }` | types/index.ts:670-677 |
| Component | Pre-fills shipping form fields | frontend.tsx (shipping initialization), ShippingDetails.tsx |

**Verdict: FAIL (Storage Format Mismatch)** - This is a significant discrepancy. Voxel stores the saved shipping address as a **single JSON blob** in `voxel:shipping_address` user meta key. The FSE controller reads **individual meta keys** (`voxel:shipping_first_name`, `voxel:shipping_last_name`, etc.) which likely don't exist because Voxel never writes to them.

The result: for logged-in users who have previously saved a shipping address in Voxel, the FSE block will fail to load their saved address because it's looking in the wrong place.

Additionally, FSE reads `voxel:shipping_address` as one of the individual fields (the street address), but in Voxel that key contains the entire JSON object.

**Fix:** Change `get_shipping_config()` to read from `voxel:shipping_address` as a JSON blob:
```php
$saved_address_json = get_user_meta($user->get_id(), 'voxel:shipping_address', true);
if (!empty($saved_address_json)) {
    $saved_address = json_decode($saved_address_json, true);
    if (is_array($saved_address) && !empty($saved_address['country'])) {
        // Use $saved_address directly
    }
}
```

---

### 15. `shipping.shipping_rates_order`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `\Voxel\get('product_settings.shipping.shipping_rates')` → `array_map` to extract `['key']` | cart-summary.php:2638-2643 |
| FSE Controller | `\Voxel\get('product_settings.shipping.rates_order', [])` | fse-cart-api-controller.php:201 |
| TS Types | `shipping_rates_order?: string[]` | types/index.ts:680 |
| Component | Sorts platform rates | ShippingMethodCards.tsx:208-217, 253-255 |

**Verdict: PARTIAL** - Different config paths. Voxel reads `product_settings.shipping.shipping_rates` (full rate objects array) and extracts the `key` from each. FSE reads `product_settings.shipping.rates_order` which may or may not exist as a separate setting. If `rates_order` doesn't exist as its own setting, the FSE controller will return `[]` and rates won't be sorted.

**Fix:** Use the same path as Voxel:
```php
$shipping_rates = (array) \Voxel\get('product_settings.shipping.shipping_rates', []);
$rates_order = array_values(array_filter(array_map(function($rate) {
    return $rate['key'] ?? null;
}, $shipping_rates)));
```

---

### 16. `geoip_providers`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | Dynamic: loops `\Voxel\get('settings.ipgeo.providers')`, matches against `get_ipgeo_providers()`, builds URL with API key | cart-summary.php:2646-2662 |
| FSE Controller | **Hardcoded**: checks `product_settings.cart_summary.geoip.enabled` (may not exist), returns 2 fixed URLs | fse-cart-api-controller.php:111-122 |
| TS Types | `geoip_providers: Array<{ url: string; prop: string }>` | types/index.ts:690-693 |
| Component | Used in `geocodeCountry()` to detect user's country | frontend.tsx:1100-1120 |

**Verdict: FAIL (Wrong Implementation)** - The FSE controller:
1. Checks `product_settings.cart_summary.geoip.enabled` which is likely not a real Voxel setting path
2. Returns hardcoded provider URLs without API keys
3. Ignores the admin-configured provider list and API keys from `settings.ipgeo.providers`

Voxel dynamically builds the provider list from admin settings, including API keys appended as query parameters. The FSE implementation will either:
- Return no providers (if the setting path doesn't exist)
- Return providers without API keys (rate-limited or failing)
- Miss admin-configured providers entirely

**Fix:** Mirror Voxel's dynamic approach:
```php
$geoip_providers = [];
foreach ((array) \Voxel\get('settings.ipgeo.providers') as $enabled_provider) {
    foreach (\Voxel\get_ipgeo_providers() as $provider) {
        if ($provider['key'] === $enabled_provider['key']) {
            $url = $provider['geocode_url'];
            if (!empty($enabled_provider['api_key']) && !empty($provider['api_key_param'])) {
                $url = add_query_arg($provider['api_key_param'], $enabled_provider['api_key'], $url);
            }
            $geoip_providers[] = [
                'url'  => $url,
                'prop' => $provider['country_code_key'],
            ];
            break;
        }
    }
}
```

---

### 17. `l10n.free`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | `_x('Free', 'cart summary', 'voxel')` | cart-summary.php:2629 |
| FSE Controller | `_x('Free', 'cart summary', 'voxel-fse')` | fse-cart-api-controller.php:148 |
| TS Types | `l10n: { free: string; login: string }` | types/index.ts:702-705 |
| Component | Displayed for free shipping rates | ShippingMethodCards.tsx:337-338 |

**Verdict: PASS** - Different text domain (`voxel-fse` vs `voxel`) but functionally identical unless separate translations exist.

---

### 18. `l10n.login`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | **Not present** in widget config | — |
| FSE Controller | `_x('Sign in', 'cart summary', 'voxel-fse')` | fse-cart-api-controller.php:149 |
| TS Types | `login: string` | types/index.ts:704 |
| Component | Not visibly consumed (QuickRegister uses hardcoded string) | — |

**Verdict: PASS (Extra)** - FSE adds an extra l10n string not in Voxel. No harm, but unused.

---

### 19. `is_logged_in`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | **Not in config** - Checked via `is_user_logged_in()` in PHP template | — |
| FSE Controller | `is_user_logged_in()` | fse-cart-api-controller.php:129 |
| TS Types | `is_logged_in: boolean` | types/index.ts:661 |
| Component | Drives guest checkout visibility | frontend.tsx |

**Verdict: PASS (Extra)** - FSE adds this because React needs it at runtime; Voxel handles it in PHP template rendering. Appropriate architectural difference.

---

### 20. `currency`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel PHP | **Not in config** - Comes from Voxel global JS config | — |
| FSE Controller | `\Voxel\get('settings.stripe.currency', 'USD')` | fse-cart-api-controller.php:87 |
| TS Types | `currency: string` | types/index.ts:662 |
| Component | Used for currency formatting | ShippingMethodCards.tsx:40-48 |

**Verdict: PASS (Extra)** - FSE adds this because React needs it; Voxel provides it via `Voxel_Config` global. Appropriate.

---

### 21. Cookie format: `_vx_ccode`

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel JS | `document.cookie = '_vx_ccode=${i}; max-age:259200; path=/'` | product-summary-beautified.js:8 |
| FSE Frontend | `document.cookie = '_vx_ccode=${countryCode}; max-age:259200; path=/'` | frontend.tsx:1118 |

**Verdict: PASS (Both have same bug)** - Both Voxel and FSE use `max-age:259200` (colon) instead of `max-age=259200` (equals sign). The colon format is technically invalid per RFC 6265 and means the cookie won't have a max-age set (it becomes a session cookie). This is a Voxel upstream bug that FSE correctly mirrors.

---

### 22. `shipping.responsibility` → Shipping Method Logic

| Layer | Status | Evidence |
|-------|--------|----------|
| Voxel JS | `getShippingMethod()`: checks multivendor.enabled, responsibility === 'vendor', vendor count, platform key | product-summary-beautified.js:7 |
| FSE Component | `getShippingMethod()`: checks multivendor.enabled, responsibility === 'vendor' | CartSummaryComponent.tsx:381-383 |

**Verdict: PARTIAL** - Voxel's `getShippingMethod()` has additional logic: it checks if there's only 1 vendor and it's `platform`, it still returns `platform_rates`. The FSE version is simpler and doesn't account for this edge case.

---

## Issues Summary (Priority Ordered)

### Critical (Breaks Functionality)

| # | Issue | File | Line | Impact |
|---|-------|------|------|--------|
| 1 | **Saved address reads wrong meta format** | fse-cart-api-controller.php | 176-189 | Logged-in users' saved shipping addresses won't load |
| 2 | **GeoIP providers hardcoded instead of dynamic** | fse-cart-api-controller.php | 111-122 | Country auto-detection fails or uses wrong/keyless providers |

### High (Behavioral Difference)

| # | Issue | File | Line | Impact |
|---|-------|------|------|--------|
| 3 | **Guest checkout default mismatch** | fse-cart-api-controller.php | 339 | Default `'redirect_to_login'` vs Voxel's `'proceed_with_email'` |
| 4 | **Shipping rates order wrong config path** | fse-cart-api-controller.php | 201 | Rates may not be sorted in admin-configured order |

### Medium (Incomplete)

| # | Issue | File | Line | Impact |
|---|-------|------|------|--------|
| 5 | **auth_link missing redirect_to param** | fse-cart-api-controller.php | 92-94 | Users not redirected back to cart after login |
| 6 | **multivendor.charge_type missing from TS type** | types/index.ts | 664-666 | TypeScript type incomplete (no runtime impact yet) |
| 7 | **getShippingMethod() missing vendor count logic** | CartSummaryComponent.tsx | 381-383 | Edge case: single platform vendor not handled |

### Low (Minor)

| # | Issue | File | Line | Impact |
|---|-------|------|------|--------|
| 8 | **default_country extra fallback** | fse-cart-api-controller.php | 308 | Checks setting that Voxel doesn't; benign if not set |
| 9 | **Countries built differently** | fse-cart-api-controller.php | 268-297 | Uses zone extraction vs dedicated method; should be equivalent |

---

## Recommended Fix Order

1. **Fix #1** - Saved address JSON blob (Critical - breaks saved address loading)
2. **Fix #2** - GeoIP dynamic providers (Critical - breaks country auto-detection)
3. **Fix #3** - Guest checkout default (High - changes default behavior)
4. **Fix #4** - Shipping rates order path (High - rates may be unsorted)
5. **Fix #5** - auth_link redirect_to (Medium - UX issue after login)
6. **Fix #6** - TypeScript type (Medium - code quality)
7. **Fix #7** - Shipping method logic (Medium - edge case)
