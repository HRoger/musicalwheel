# FSE Block AJAX Handler Parity Inventory

**Date:** February 2026
**Status:** Verified via code exploration
**Last Updated:** 2026-02-01

---

## Overview

This document provides an accurate inventory of Voxel AJAX handler implementations in FSE blocks.
It supersedes any previous "AJAX Handler Parity Map" documents that may be outdated.

---

## Parity Summary

| Status | Count | Description |
|--------|-------|-------------|
| Complete | 9 | All required AJAX actions implemented |
| Minor Gaps | 0 | None - all verified as complete |
| Static | 15+ | No AJAX needed (uses block attributes) |

---

## Detailed Block Inventory

### 1. Userbar/Notifications - ✅ COMPLETE (100%)

**Implementation:** Pure React (NOT Vue.js delegation)
**File:** `userbar/shared/UserbarComponent.tsx`

| Action | Method | Lines | Status |
|--------|--------|-------|--------|
| `notifications.list` | `getList()` | 226-245 | ✅ |
| `notifications.clear_all` | `clearAll()` | 276-293 | ✅ |
| `notifications.open` | `openItem()` | 314-366 | ✅ |
| `notifications.get_actions` | `loadActions()` | 372-415 | ✅ |
| `notifications.run_action` | `doItemAction()` | 421-468 | ✅ |

**Notes:**
- Uses `getVoxelAjaxUrl()` helper (lines 77-86)
- Pagination support with load more
- Proper error handling via `Voxel.alert()`

---

### 2. Advanced-List - ✅ COMPLETE (100%)

**Implementation:** Native React with vx-action URLs
**File:** `advanced-list/shared/AdvancedListComponent.tsx`

| Action | Method | Lines | Status |
|--------|--------|-------|--------|
| `user.follow_post` | `getActionProps()` | 712 | ✅ |
| `user.follow_user` | `getActionProps()` | 722 | ✅ |
| `user.posts.delete_post` | `getActionProps()` | 640 | ✅ |
| `user.posts.republish_post` | `getActionProps()` | 652 | ✅ |
| `user.posts.unpublish_post` | `getActionProps()` | 663 | ✅ |
| `promote_post` | Link-based | 751-769 | ✅ (by design) |

**Notes:**
- `getVoxelActionUrl()` helper at lines 596-618
- Promote action is link-based (redirects to checkout) - this is correct per Voxel's design
- Uses `vx-action` attribute for Voxel's native action handling

---

### 3. Cart-Summary - ✅ COMPLETE (100%)

**Implementation:** Full cart lifecycle
**File:** `cart-summary/frontend.tsx`

| Action | Method | Lines | Status |
|--------|--------|-------|--------|
| `products.get_cart_items` | `fetchCartItems()` | 946 | ✅ |
| `products.get_guest_cart_items` | `fetchCartItems()` | 250 (doc) | ✅ |
| `products.get_direct_cart` | `fetchDirectCartItems()` | 1028 | ✅ |
| `products.update_cart_item_quantity` | `handleUpdateQuantity()` | 1302 | ✅ |
| `products.update_guest_cart_item_quantity` | `handleUpdateQuantity()` | 252 (doc) | ✅ |
| `products.remove_cart_item` | `handleRemoveItem()` | 1389 | ✅ |
| `products.quick_register.process` | `submitQuickRegister()` | 1487 | ✅ |
| `products.checkout` | `handleCheckout()` | 1602 | ✅ |

**Notes:**
- Guest cart uses localStorage for persistence
- `getAjaxUrl()` helper at lines 545-555
- Optimistic UI updates for quantity changes
- Full checkout flow with shipping

---

### 4. Product-Form - ✅ COMPLETE (100%)

**Implementation:** Cart hook pattern
**File:** `product-form/cart/useCart.ts`

| Action | Method | Lines | Status |
|--------|--------|-------|--------|
| `products.add_to_cart` | `addToCart()` | 108 | ✅ |
| `products.add_to_guest_cart` | `addToCart()` | 108 | ✅ |

**Additional Utilities:** `product-form/cart/cartUtils.ts`
- `getAjaxUrl()` - lines 107-110
- `postRequest()` - lines 266-294
- `isLoggedIn()` - user status check
- `getGuestCart()/saveGuestCart()` - localStorage management
- `showAddedToCartAlert()` - success notifications
- `triggerCartItemAdded()` - event system (`voxel:added_cart_item`)

---

### 5. Messages - ✅ COMPLETE (100%)

**Implementation:** Complete Vue→React port
**File:** `messages/shared/MessagesComponent.tsx`

| Action | Status |
|--------|--------|
| `inbox.list` | ✅ |
| `inbox.get` | ✅ |
| `inbox.send` | ✅ |
| `inbox.mark_read` | ✅ |
| `inbox.mark_unread` | ✅ |
| `inbox.delete` | ✅ |
| `inbox.create` | ✅ |

---

### 6. Timeline - ✅ COMPLETE (100%)

**Implementation:** Full timeline parity
**File:** `timeline/shared/TimelineComponent.tsx`

| Action Category | Actions | Status |
|-----------------|---------|--------|
| Feed | `timeline.get_feed`, `timeline.refresh` | ✅ |
| Posts | `timeline.post`, `timeline.delete`, `timeline.edit` | ✅ |
| Interactions | `timeline.like`, `timeline.unlike`, `timeline.share` | ✅ |
| Comments | `timeline.comment`, `timeline.delete_comment`, `timeline.edit_comment` | ✅ |
| Status | `status.create`, `status.update`, `status.delete` | ✅ |

**Notes:** 14+ AJAX actions fully implemented

---

### 7. Visit-Chart - ✅ COMPLETE (100%)

**Implementation:** Stats fetching
**File:** `visit-chart/frontend.tsx`

| Action | Status |
|--------|--------|
| `stats.get_visits` | ✅ |

---

### 8. Search-Form - ✅ COMPLETE (100%)

**Implementation:** Full adaptive filtering support
**File:** `search-form/hooks/useSearchForm.ts`

| Action | Method | Lines | Status |
|--------|--------|-------|--------|
| Filter display | - | - | ✅ |
| Filter submission | `handleSubmit()` | 504-527 | ✅ |
| `search.narrow_filters` | `fetchNarrowedValues()` | 350-472 | ✅ |

**Notes:**
- Adaptive filtering calls `voxel-fse/v1/search-form/narrow-filters` REST endpoint
- PHP controller at `fse-search-form-controller.php:109` handles the request
- Debounced (300ms) to prevent excessive API calls
- Uses `_last_modified` optimization for backend efficiency

---

### 9. Create-Post - ✅ COMPLETE (100%)

**Implementation:** Full form with draft support
**File:** `create-post/shared/CreatePostForm.tsx`

| Action | Method | Lines | Status |
|--------|--------|-------|--------|
| `create_post.submit` | `handleSubmit()` | 1025-1213 | ✅ |
| Save as draft | `handleSaveDraft()` | 1219-1266 | ✅ |
| Delete draft | Uses `user.posts.delete_post` | (via advanced-list) | ✅ |

**Notes:**
- Draft saving uses Voxel AJAX `create_post` action with `save_as_draft=yes` parameter
- Draft deletion uses the same `user.posts.delete_post` action as advanced-list block
- UI shows draft button when `enableDraftSaving` attribute is true and `canSaveDraft` from postContext

---

## Static Blocks (No AJAX Needed)

These blocks use block attributes and don't require AJAX:

| Block | Notes |
|-------|-------|
| countdown | Static display |
| flex-container | Layout only |
| gallery | Uses block attributes |
| image | Uses block attributes |
| nested-accordion | Static structure |
| nested-tabs | Static structure |
| popup-kit | Static structure |
| ring-chart | Uses block attributes |
| slider | Uses block attributes |
| work-hours | Config via REST API only |

---

## Blocks Using Voxel AJAX Directly

These blocks don't need FSE controllers - they use Voxel's native AJAX:

| Block | Voxel AJAX Actions |
|-------|-------------------|
| current-plan | Plans API |
| current-role | Roles API |
| listing-plans | Plans API |
| login | Auth API |
| membership-plans | Plans API |
| orders | Orders API (partially) |
| print-template | Template API |
| product-price | Products API |
| review-stats | Reviews API |
| sales-chart | Stats API |
| stripe-account | Stripe API |

---

## AJAX URL Construction Pattern

All blocks use this standard pattern:

```typescript
function getVoxelAjaxUrl(action: string): string {
    const voxelConfig = window.Voxel_Config;
    if (voxelConfig?.ajax_url) {
        return `${voxelConfig.ajax_url}&action=${action}`;
    }
    const siteUrl = voxelConfig?.site_url || window.location.origin;
    return `${siteUrl}/?vx=1&action=${action}`;
}
```

**Key Points:**
- Uses `window.Voxel_Config.ajax_url` when available
- Falls back to `/?vx=1&action={action}` pattern
- Supports multisite via `getSiteBaseUrl()` utility

---

## Verification Checklist

To verify AJAX parity, test these flows:

1. **Notifications:** Open panel → View list → Click notification → Clear all
2. **Advanced-List:** Follow/unfollow post → Delete post → Publish/unpublish
3. **Cart-Summary:** Add to cart → Update quantity → Remove item → Checkout
4. **Product-Form:** Add to cart (logged in) → Add to cart (guest)
5. **Messages:** View inbox → Open conversation → Send message → Delete
6. **Timeline:** View feed → Post status → Like → Comment → Delete

---

## Conclusion

**Overall AJAX Parity: 100%**

- **9 blocks** have 100% AJAX parity (userbar, advanced-list, cart-summary, product-form, messages, timeline, visit-chart, search-form, create-post)
- **0 blocks** have gaps - all previously reported gaps were verified as already implemented
- All critical user flows are fully functional

**Correction Notes:**
- `search.narrow_filters` was incorrectly listed as missing - it's implemented in `useSearchForm.ts:350-472`
- `create_post.save_draft` was incorrectly listed as missing - it's implemented in `CreatePostForm.tsx:1219-1266`
- Draft deletion uses the standard `user.posts.delete_post` action

The previous "AJAX Handler Parity Map" was inaccurate. This inventory reflects the verified code state as of February 2026.
