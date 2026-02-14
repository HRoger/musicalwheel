# Cart Summary Widget vs Block - Parity Audit

**Date:** 2026-02-10
**Overall Parity:** ~95%
**Status:** Excellent parity with minor gaps in promote screen mode and a few edge cases

---

## Reference Files

### Voxel Parent Theme (Widget)
| File | Purpose |
|------|---------|
| `themes/voxel/app/widgets/cart-summary.php` (2719 lines) | Widget class, controls, config, render |
| `themes/voxel/templates/widgets/cart-summary.php` | Main template with Vue directives |
| `themes/voxel/templates/widgets/cart-summary/cart-item.php` | Cart item sub-template |
| `themes/voxel/templates/widgets/cart-summary/quick-register.php` | Guest checkout sub-template |
| `themes/voxel/templates/widgets/cart-summary/shipping-details.php` | Shipping address + rate cards |
| `themes/voxel/templates/widgets/cart-summary/file-upload.php` | File upload field sub-template |
| `themes/voxel/templates/widgets/cart-summary/promote-screen.php` | Post promotion checkout mode |
| `themes/voxel/app/controllers/frontend/products/cart-controller.php` | Cart AJAX controller (13 actions) |
| `themes/voxel/app/controllers/frontend/products/direct-cart-controller.php` | Direct cart AJAX controller |
| `themes/voxel/app/controllers/ecommerce/ecommerce-controller.php` | Checkout AJAX |
| `themes/voxel/assets/dist/product-summary.css` | Compiled widget CSS |
| `docs/block-conversions/cart-summary/product-summary-beautified.js` | Beautified Vue component JS |

### FSE Child Theme (Block)
| File | Purpose |
|------|---------|
| `themes/voxel-fse/app/blocks/src/cart-summary/block.json` | Block registration (398 attributes) |
| `themes/voxel-fse/app/blocks/src/cart-summary/edit.tsx` | Editor component |
| `themes/voxel-fse/app/blocks/src/cart-summary/frontend.tsx` (~1727 lines) | Frontend hydration + wrapper logic |
| `themes/voxel-fse/app/blocks/src/cart-summary/frontend.js` | Entry point |
| `themes/voxel-fse/app/blocks/src/cart-summary/render.php` | Plan C+ static placeholder |
| `themes/voxel-fse/app/blocks/src/cart-summary/index.tsx` | Block registration |
| `themes/voxel-fse/app/blocks/src/cart-summary/save.tsx` | Save component |
| `themes/voxel-fse/app/blocks/src/cart-summary/styles.ts` | CSS generator (300+ lines) |
| `themes/voxel-fse/app/blocks/src/cart-summary/types/index.ts` | TypeScript types (398 attributes) |
| `themes/voxel-fse/app/blocks/src/cart-summary/shared/CartSummaryComponent.tsx` (700+ lines) | Shared UI component |
| `themes/voxel-fse/app/blocks/src/cart-summary/shared/QuickRegister.tsx` | Guest checkout component |
| `themes/voxel-fse/app/blocks/src/cart-summary/shared/ShippingDetails.tsx` | Shipping address form |
| `themes/voxel-fse/app/blocks/src/cart-summary/shared/ShippingMethodCards.tsx` | Platform shipping rates |
| `themes/voxel-fse/app/blocks/src/cart-summary/shared/VendorShippingCards.tsx` | Vendor shipping rates |
| `themes/voxel-fse/app/blocks/src/cart-summary/shared/FileUploadField.tsx` | File upload component |
| `themes/voxel-fse/app/blocks/src/cart-summary/inspector/ContentTab.tsx` | Content inspector controls |
| `themes/voxel-fse/app/blocks/src/cart-summary/inspector/StyleTab.tsx` | Style inspector controls |
| `themes/voxel-fse/app/blocks/src/cart-summary/hooks/useCartConfig.ts` | REST API config hook |
| `themes/voxel-fse/app/controllers/fse-cart-api-controller.php` (391 lines) | REST API controller |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP templates + Vue 3 hydration | Plan C+ (static placeholder + React hydration) |
| **State Management** | Vue 3 reactive data + watchers | React useState/useEffect hooks |
| **Config Delivery** | Inline `<script>` JSON via widget render() | REST API `/wp-json/voxel-fse/v1/cart/config` |
| **AJAX** | Voxel custom `/?vx=1&action=...` | Same Voxel AJAX (Two-Call Pattern) |
| **CSS** | Elementor dynamic CSS + Voxel compiled CSS | JS-generated CSS via styles.ts + Voxel compiled CSS injection |
| **Component Architecture** | Vue 3 with sub-components (cart-item, file-upload) | React with shared components (6 TSX files) |
| **Icons** | Elementor icon controls + `\Voxel\get_icon_markup()` | IconPickerControl (shared library) |
| **Inspector Controls** | Elementor widget controls (~100+) | Gutenberg InspectorControls (398 attributes) |

---

## HTML Structure Parity

| Element | Voxel Class | FSE Class | Match |
|---------|-------------|-----------|-------|
| Root container | `.ts-form.ts-checkout.ts-checkout-regular` | `.ts-form.ts-checkout.ts-checkout-regular` | ✅ |
| Loading screen | `.vx-loading-screen.ts-checkout-loading` | `.vx-loading-screen.ts-checkout-loading` | ✅ |
| Loader spinner | `.ts-no-posts > .ts-loader` | `.sk-2` (different spinner) | ⚠️ Minor |
| Empty cart | `.ts-form-group.ts-no-posts` | `.ts-no-posts` | ✅ |
| Cart header | `.ts-cart-head > h1` | `.ts-cart-head > h1` | ✅ |
| Section dividers | `.or-group > .or-line + .or-text + .or-line` | `.or-group > .or-line + .or-text + .or-line` | ✅ |
| Cart items list | `ul.ts-cart-list.simplify-ul` | `ul.ts-cart-list.simplify-ul` | ✅ |
| Cart item | `li > .cart-image + .cart-item-details + .cart-stepper` | Same structure | ✅ |
| Quantity stepper | `.cart-stepper > a.ts-icon-btn.ts-smaller` | Same structure | ✅ |
| Disabled items | `.vx-disabled` class | Same class | ✅ |
| Guest login button | `a.ts-btn.ts-btn-1.form-btn` | Same structure | ✅ |
| Quick register section | `.checkout-section.form-field-grid` | `.checkout-section.form-field-grid` | ✅ |
| Email input | `.ts-input-icon.flexify > icon + input.ts-filter` | Same structure | ✅ |
| Verification code | `input.ts-filter[maxlength=6]` | Same | ✅ |
| Shipping form | `.ts-form-group.vx-1-2` grid layout | Same grid layout | ✅ |
| Country dropdown | `.ts-filter > select + .ts-down-icon` | Same structure | ✅ |
| Platform shipping cards | `ul.simplify-ul.addon-cards.flexify > li` | Same structure | ✅ |
| Selected card | `.adc-selected` class | Same class | ✅ |
| Card icon | `.card-icn` | Same class | ✅ |
| Card details | `.addon-details > .adc-title + .adc-subtitle + .vx-addon-price` | Same structure | ✅ |
| Vendor shipping | Vendor grouping with `.or-group` per vendor | Same structure | ✅ |
| Order notes checkbox | `.tos-checkbox.ts-form-group.vx-1-1.switcher-label` | Same structure | ✅ |
| Checkbox mark | `.ts-checkbox-container > .container-checkbox > input + .checkmark` | Same structure | ✅ |
| Terms checkbox | Same checkbox structure with `.field-info` | Same structure | ✅ |
| Cost calculator | `ul.ts-cost-calculator.simplify-ul.flexify` | Same structure | ✅ |
| Cost rows | `li > .ts-item-name + .ts-item-price` | Same structure | ✅ |
| Total row | `li.ts-total` | Same class | ✅ |
| Checkout button | `a.ts-btn.ts-btn-2.form-btn` | `button.ts-btn.ts-btn-2.form-btn` | ⚠️ Minor (a vs button) |
| Processing state | `.ts-loading-btn` + `.ts-loader-wrapper > .ts-loader` | Same structure | ✅ |
| File upload | `.ts-file-upload` component | FileUploadField.tsx | ✅ |

**HTML Parity: ~97%** — Nearly identical structure with only minor differences in spinner variant and button element type.

---

## JavaScript Behavior Parity

### Cart Operations
| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 1 | `getSummary()` | `useEffect` in wrapper (line 1156) | ✅ | Routes to cart/direct cart |
| 2 | `_getCartSummary()` | `fetchCartItems(config, true)` | ✅ | Logged-in user cart |
| 3 | `_getGuestCartSummary()` | `fetchCartItems(config, false)` | ✅ | Guest cart from localStorage |
| 4 | `_getDirectCartSummary()` | `fetchDirectCartItems()` | ✅ | Single item checkout |
| 5 | `storeGuestCart()` | `storeGuestCart()` | ✅ | localStorage persistence |
| 6 | `hasItems()` | `items && Object.keys(items).length > 0` | ✅ | Inline check |
| 7 | `getItemQuantity(item)` | `getItemQuantity(item)` | ✅ | Quantity helper |
| 8 | `registerItemComponents()` | Dynamic component rendering | ✅ | Async component loading |

### Quantity / Removal
| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 9 | `plusOne()` / `minusOne()` | `handleUpdateQuantity()` | ✅ | Optimistic UI updates in FSE |
| 10 | `removeItem()` | `handleRemoveItem()` | ✅ | With optimistic removal |
| 11 | `hasStockLeft()` | `hasStockLeft()` | ✅ | Stock validation |
| 12 | `setQuantity()` | Covered by handleUpdateQuantity | ✅ | Unified handler |

### Guest Checkout
| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 13 | `sendEmailVerificationCode()` | `sendEmailVerificationCode()` | ✅ | reCAPTCHA integrated |
| 14 | `submitQuickRegister()` | `submitQuickRegister()` | ✅ | Cart merge + nonce refresh |
| 15 | `recaptcha(action, callback)` | `window.grecaptcha.execute()` | ✅ | Same API usage |

### Shipping
| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 16 | `setupShipping()` | `useEffect` shipping init (line 1190) | ✅ | Saved address + GeoIP |
| 17 | `geocodeCountry()` | `geocodeCountry()` | ✅ | GeoIP fallback chain |
| 18 | `getShippingMethod()` | `getShippingMethod()` | ✅ | Platform vs vendor |
| 19 | `setShippingCountry(code)` | State update in handler | ✅ | Country change |
| 20 | `reEvaluateShippingSelection()` | Derived from state changes | ✅ | React re-renders handle this |
| 21 | `shouldListShippingRate(rate, zone)` | `shouldListShippingRate()` | ✅ | Location matching |
| 22 | `matchesZipCode(zip, patterns)` | `matchesZipCode()` | ✅ | Wildcards + ranges |
| 23 | `rateMeetsCriteria(rate, zone)` | `rateMeetsCriteria()` | ✅ | Free shipping threshold |
| 24 | `shouldListVendorShippingRate()` | Same in VendorShippingCards | ✅ | Vendor location match |
| 25 | `vendorRateMeetsCriteria()` | Same | ✅ | Vendor threshold |
| 26 | `getShippingTotalForRate(rate)` | Same | ✅ | Per-item/order/class calc |
| 27 | `getVendorShippingTotalForRate()` | Same | ✅ | Vendor rate cost |
| 28 | `getAllSortedPlatformRates()` | Same | ✅ | Admin sort order |
| 29 | `getAllSortedVendorRates()` | Same | ✅ | Vendor rate sorting |
| 30 | `getCountryStates()` | Same | ✅ | US/CA state lists |

### Checkout
| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 31 | `submit()` | `handleCheckout()` | ✅ | Routes checkout vs quick register |
| 32 | `checkout()` | Inside `handleCheckout()` | ✅ | Payment submission |
| 33 | `canProceedWithPayment()` | Same validation logic | ✅ | All conditions checked |
| 34 | `resizeComposer()` | `resizeComposer()` via ref | ✅ | Textarea auto-resize |
| 35 | `toggleComposer()` | State toggle + useEffect | ✅ | Order notes toggle |

### Utilities
| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|------------|--------|-------|
| 36 | `currencyFormat()` | `currencyFormat()` | ✅ | Intl.NumberFormat in FSE |
| 37 | `getSubtotal()` | `useMemo` subtotal | ✅ | Cart total calculation |
| 38 | `getShippingTotal()` | `getShippingTotal()` | ✅ | Platform + vendor total |
| 39 | `isShippingSelected()` | Same check | ✅ | Rate selection validation |
| 40 | `hasShippableProducts()` | Same check | ✅ | Shippable items check |
| 41 | `shouldGroupItemsByVendor()` | `shouldGroupByVendor` | ✅ | Multivendor grouping |
| 42 | `isOfflinePayment()` | `isOfflinePayment()` | ✅ | Payment method check |

### Computed Properties
| # | Voxel Computed | FSE Equivalent | Parity | Notes |
|---|---------------|----------------|--------|-------|
| 43 | `vendors` | `useMemo` vendors grouping | ✅ | Items grouped by vendor |
| 44 | `vendorsWithShippableProducts` | Same filtered memo | ✅ | Vendors with shippable items |
| 45 | `shippingCountries` | Merged countries from config | ✅ | Platform + vendor countries |

### Watchers
| # | Voxel Watcher | FSE Equivalent | Parity | Notes |
|---|--------------|----------------|--------|-------|
| 46 | `watch: shipping.state` | React re-render on state change | ✅ | Automatic in React |
| 47 | `watch: shipping.zip` | Same | ✅ | ZIP change triggers re-evaluation |

**JS Behavior Parity: ~98%** — All 47 behaviors mapped and matching.

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| `products.get_cart_items` | ✅ POST | ✅ POST | ✅ |
| `products.get_guest_cart_items` | ✅ POST | ✅ POST | ✅ |
| `products.get_direct_cart` | ✅ GET | ✅ GET | ✅ |
| `products.add_to_cart` | ✅ POST | ✅ POST | ✅ |
| `products.remove_cart_item` | ✅ POST | ✅ POST | ✅ |
| `products.update_cart_item_quantity` | ✅ POST | ✅ POST | ✅ |
| `products.update_guest_cart_item_quantity` | ✅ POST | ✅ POST | ✅ |
| `products.quick_register.send_confirmation_code` | ✅ POST | ✅ POST | ✅ |
| `products.quick_register.process` | ✅ POST | ✅ POST | ✅ |
| `products.checkout` | ✅ POST | ✅ POST | ✅ |
| `/wp-json/voxel-fse/v1/cart/config` | N/A (inline) | ✅ GET | ✅ (FSE-specific) |

**AJAX Parity: 100%** — All 10 Voxel AJAX endpoints used identically. FSE adds 1 REST endpoint for config.

---

## Style Controls Parity

### Content Tab - Icons (11 controls)
| Voxel Control | FSE Attribute | Component | Match |
|---------------|---------------|-----------|-------|
| `ts_delete_icon` | `deleteIcon` | IconPickerControl | ✅ |
| `nostock_ico` | `noProductsIcon` | IconPickerControl | ✅ |
| `ts_enter` | `loginIcon` | IconPickerControl | ✅ |
| `auth_email_ico` | `emailIcon` | IconPickerControl | ✅ |
| `auth_user_ico` | `userIcon` | IconPickerControl | ✅ |
| `ts_upload_ico` | `uploadIcon` | IconPickerControl | ✅ |
| `ts_shipping_ico` | `shippingIcon` | IconPickerControl | ✅ |
| `ts_minus_icon` | `minusIcon` | IconPickerControl | ✅ |
| `ts_plus_icon` | `plusIcon` | IconPickerControl | ✅ |
| `ts_checkout_icon` | `checkoutIcon` | IconPickerControl | ✅ |
| `ts_continue_icon` | `continueIcon` | IconPickerControl | ✅ |

### Style Tab — General
| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `field_spacing_value` | `sectionSpacing` | ✅ |
| `wt_typo` | `titleTypography` | ✅ |
| `wt_color` | `titleColor` | ✅ |
| `ts_nopost_content_Gap` | `emptyCartGap` | ✅ |
| `ts_nopost_ico_size` | `emptyCartIconSize` | ✅ |
| `ts_nopost_ico_col` | `emptyCartIconColor` | ✅ |
| `ts_nopost_typo` | `emptyCartTypography` | ✅ |
| `ts_nopost_typo_col` | `emptyCartTextColor` | ✅ |

### Style Tab — Primary Button (14 Voxel controls)
| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `ts_submit_btn_typo` | `primaryBtnTypography` | ✅ |
| `ts_sf_form_btn_border` | `primaryBtnBorder*` | ✅ |
| `ts_sf_form_btn_radius` | `primaryBtnRadius` | ✅ |
| `ts_sf_form_btn_shadow` | `primaryBtnBoxShadow` | ✅ |
| `ts_sf_form_btn_c` | `primaryBtnTextColor` | ✅ |
| `ts_sf_form_btn_bg` | `primaryBtnBgColor` | ✅ |
| `ts_sf_form_btn_icon_size` | `primaryBtnIconSize` | ✅ |
| `ts_sf_form_btn_icon_color` | `primaryBtnIconColor` | ✅ |
| `ts_sf_form_btn_icon_margin` | `primaryBtnIconMargin` | ✅ |
| `ts_sf_form_btn_t_hover` | `primaryBtnHoverTextColor` | ✅ |
| `ts_sf_form_btn_bg_hover` | `primaryBtnHoverBgColor` | ✅ |
| `ts_sf_form_btn_bo_hover` | `primaryBtnHoverBorderColor` | ✅ |
| `ts_sf_form_btn_shadow_h` | `primaryBtnHoverBoxShadow` | ✅ |
| `ts_sf_form_btn_icon_color_h` | `primaryBtnHoverIconColor` | ✅ |

### Style Tab — Secondary Button (13 Voxel controls)
| Voxel Control | FSE Attribute | Match |
|---------------|---------------|-------|
| `scnd_btn_typo` | `secondaryBtnTypography` | ✅ |
| `scnd_btn_radius` | `secondaryBtnRadius` | ✅ |
| `scnd_btn_c` | `secondaryBtnTextColor` | ✅ |
| `scnd_btn_padding` | `secondaryBtnPadding` | ✅ |
| `scnd_btn_bg` | `secondaryBtnBgColor` | ✅ |
| `scnd_btn_border` | `secondaryBtnBorder*` | ✅ |
| `scnd_btn_icon_size` | `secondaryBtnIconSize` | ✅ |
| `scnd_btn_icon_pad` | `secondaryBtnIconMargin` | ✅ |
| `scnd_btn_icon_color` | `secondaryBtnIconColor` | ✅ |
| `scnd_btn_c_h` | `secondaryBtnHoverTextColor` | ✅ |
| `scnd_btn_bg_h` | `secondaryBtnHoverBgColor` | ✅ |
| `scnd_btn_border_h` | `secondaryBtnHoverBorderColor` | ✅ |
| `scnd_btn_icon_color_h` | `secondaryBtnHoverIconColor` | ✅ |

### Style Tab — All Other Sections
| Section | Voxel Controls | FSE Attributes | Match |
|---------|---------------|----------------|-------|
| Loading | 2 (tm_color1, tm_color2) | 2 (loaderColor1, loaderColor2) | ✅ |
| Checkboxes | 3 | 3 | ✅ |
| Cart Styling | 8 (responsive) | 8+ (responsive) | ✅ |
| Icon Button | 9+ (normal/hover) | 12 (normal/hover) | ✅ |
| Dropdown Button | 24 (3 states) | 27 (3 states) | ✅ |
| Ship To | 3 | 3 | ✅ |
| Section Divider | 4 | 4 | ✅ |
| Subtotal | 2 | 2 | ✅ |
| Field Labels | 3 | 3 | ✅ |
| Inputs & Textarea | 20+ (3 states) | 33 (3 states) | ✅ |
| Cards | 10+ (normal/selected) | 32 (normal/selected) | ✅ |
| File Upload | (Option_Groups) | 35 (normal/hover) | ✅ |

**Style Controls Parity: ~100%** — FSE has MORE attributes than Voxel in some sections (deeper granularity), covering all Voxel controls.

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Cart item display | Vue component + template | React CartSummaryComponent | ✅ |
| 2 | Empty cart state | Icon + message | Same | ✅ |
| 3 | Quantity stepper (+/-) | plusOne/minusOne | handleUpdateQuantity (optimistic) | ✅ |
| 4 | Item removal | removeItem | handleRemoveItem (optimistic) | ✅ |
| 5 | Stock validation | hasStockLeft() | hasStockLeft() | ✅ |
| 6 | Guest checkout (email) | QuickRegister Vue | QuickRegister.tsx | ✅ |
| 7 | Email verification (6-digit) | send_confirmation_code | Same AJAX | ✅ |
| 8 | reCAPTCHA v3 | window.grecaptcha | Same | ✅ |
| 9 | Terms & conditions checkbox | Conditional render | Same | ✅ |
| 10 | Quick register + cart merge | submitQuickRegister | submitQuickRegister | ✅ |
| 11 | Nonce refresh on register | Updates Vue data | Updates React state | ✅ |
| 12 | Shipping address form | 6 fields in grid | ShippingDetails.tsx | ✅ |
| 13 | Country dropdown | Dynamic from config | Same | ✅ |
| 14 | State dropdown (US/CA) | Conditional | Same | ✅ |
| 15 | Saved address prefill | From config | Same | ✅ |
| 16 | GeoIP country detection | geocodeCountry() | geocodeCountry() | ✅ |
| 17 | Platform shipping zones | Zone matching | ShippingMethodCards.tsx | ✅ |
| 18 | Platform rate selection | Click handler | handleRateSelect | ✅ |
| 19 | Free shipping threshold | rateMeetsCriteria | Same | ✅ |
| 20 | ZIP code patterns | matchesZipCode | Same (wildcards + ranges) | ✅ |
| 21 | Vendor shipping | Per-vendor rate cards | VendorShippingCards.tsx | ✅ |
| 22 | Multivendor grouping | shouldGroupItemsByVendor | shouldGroupByVendor | ✅ |
| 23 | Rate cost calculation | per-item/per-order/per-class | Same | ✅ |
| 24 | Order notes toggle | Checkbox + textarea | OrderNotes component | ✅ |
| 25 | Textarea auto-resize | resizeComposer | resizeComposer via refs | ✅ |
| 26 | File upload field | Vue file-upload component | FileUploadField.tsx | ✅ |
| 27 | File drag-and-drop | File input + drag events | Same | ✅ |
| 28 | File upload cache | window._vx_file_upload_cache | Same global | ✅ |
| 29 | Direct cart mode | URL param checkout_item | getSearchParam('checkout_item') | ✅ |
| 30 | Direct cart localStorage | voxel:direct_cart | Same | ✅ |
| 31 | Cost calculator (subtotal) | Sum of item totals | useMemo subtotal | ✅ |
| 32 | Shipping cost display | Separate line item | Same | ✅ |
| 33 | Grand total | Subtotal + shipping | Same | ✅ |
| 34 | Currency formatting | currencyFormat() | currencyFormat() (Intl) | ✅ |
| 35 | Checkout submission | checkout() AJAX | handleCheckout() | ✅ |
| 36 | Processing state | loading spinner on button | Same (isProcessing) | ✅ |
| 37 | Payment redirect | window.location.href | Same | ✅ |
| 38 | Offline payment handling | isOfflinePayment() | isOfflinePayment() | ✅ |
| 39 | Disabled item state | vx-disabled class | Same class | ✅ |
| 40 | Loading screen | vx-loading-screen | Same | ✅ |
| 41 | **Promote screen** | promote-screen.php | **NOT IMPLEMENTED** | ❌ |
| 42 | Dynamic cart-item components | Async Vue import | Component rendering | ⚠️ Partial |

---

## Identified Gaps

### Gap #1: Promote Screen Mode (Severity: Low)
**Voxel behavior:** The widget has a `promote-screen.php` template (line 2584 of cart-summary.php) that handles post promotion checkout — a special mode where users pay to promote/boost their posts. It shows a different UI with promotion-specific fields.
**FSE behavior:** Not implemented. The FSE block does not have a promote screen component.
**Impact:** Users cannot use the Gutenberg block for post promotion checkout flows. This is a niche feature used only when Voxel's "Promote Posts" functionality is enabled.
**Fix:** Create a `PromoteScreen.tsx` shared component. Check `config.mode === 'promotion'` to conditionally render. Low priority — this feature is rarely used.

### Gap #2: Loading Spinner Variant (Severity: Low)
**Voxel behavior:** Uses `.ts-loader` (Voxel's standard CSS spinner).
**FSE behavior:** Uses `.sk-2` (a different spinner class) for the initial loading state.
**Impact:** Visually minor — the spinner looks slightly different during the initial load. Once Voxel CSS is injected, the `.ts-loader` class works correctly in other contexts.
**Fix:** Replace `.sk-2` with `.ts-no-posts > .ts-loader` in the loading screen render path of CartSummaryComponent.tsx.

### Gap #3: Checkout Button Element Type (Severity: Low)
**Voxel behavior:** Uses `<a href="#" class="ts-btn ts-btn-2 form-btn">` (anchor element).
**FSE behavior:** Uses `<button class="ts-btn ts-btn-2 form-btn">` (button element).
**Impact:** Minor CSS difference — both are styled identically via Voxel CSS. The button element is arguably more semantically correct for a form action.
**Fix:** Could change to `<a>` for exact parity, but `<button>` is the better choice for accessibility. Leave as-is unless visual differences appear.

### Gap #4: Dynamic Cart Item Components (Severity: Medium)
**Voxel behavior:** Uses Vue's `defineAsyncComponent()` to dynamically load custom cart item components based on `component.type` (e.g., `cart-item:file-upload`). The component source URL comes from the Voxel AJAX response.
**FSE behavior:** FileUploadField is implemented directly. Other dynamic component types may not be handled if new cart item component types are added by Voxel in the future.
**Impact:** If Voxel adds new cart item component types beyond file-upload, they won't render in the FSE block.
**Fix:** Implement a dynamic component registry pattern similar to Voxel's `registerItemComponents()`. Currently only `file-upload` type exists, so this is future-proofing.

### Gap #5: Event Bus Pattern (Severity: Low)
**Voxel behavior:** Sets `window.VX_Cart_Summary = this` in created() lifecycle, exposing the Vue component globally for cross-widget communication.
**FSE behavior:** No global event bus exposed.
**Impact:** Other blocks/widgets that attempt to communicate with the cart summary via `window.VX_Cart_Summary` won't work.
**Fix:** If cross-block communication is needed, expose a similar API. Currently no other FSE blocks reference this global.

---

## Summary

### What Works Well (~95%)
- **Complete cart operations** — Add, remove, update quantity with optimistic UI updates
- **Guest checkout** — Full email verification flow with reCAPTCHA, terms acceptance, cart merge
- **Shipping system** — Platform and vendor rates, zone matching, ZIP patterns, free shipping thresholds
- **All 10 AJAX endpoints** — Identical usage of Voxel's AJAX system
- **HTML structure** — 97%+ match with Voxel's CSS classes and element hierarchy
- **Inspector controls** — 398 attributes covering ALL Voxel style controls and more
- **Responsive CSS generation** — Desktop/tablet/mobile breakpoints via styles.ts
- **File upload** — Complete implementation including drag-drop and file cache
- **Direct cart mode** — URL parameter checkout with localStorage persistence
- **Cost calculator** — Subtotal, shipping, and grand total with currency formatting
- **Multivendor support** — Vendor grouping, per-vendor shipping rates

### Gaps to Fix (~5%)
| Gap | Severity | Effort |
|-----|----------|--------|
| Promote screen mode | Low | Medium (new component) |
| Loading spinner variant | Low | Trivial (class change) |
| Checkout button element | Low | Trivial (optional) |
| Dynamic cart item registry | Medium | Small (future-proofing) |
| Event bus pattern | Low | Trivial (optional) |

### Priority Fix Order
1. **Loading spinner** (trivial, improves visual consistency)
2. **Dynamic cart item registry** (future-proofing for Voxel updates)
3. **Promote screen** (only if promotion feature is in use)
4. **Event bus** (only if cross-block communication is needed)
5. **Button element** (optional, FSE choice is semantically better)

---

**Conclusion:** The cart-summary block is one of the most complete FSE block implementations in the project. At ~95% parity with 398 attributes, 6 shared components, and complete coverage of all major cart operations, shipping systems, and guest checkout flows, it closely mirrors Voxel's most complex widget (2719 lines). The remaining gaps are either low-impact (loading spinner, button type) or niche features (promote screen).
