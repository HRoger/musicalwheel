# Userbar Widget vs Block - Parity Audit

**Date:** 2026-02-10
**Overall Parity:** ~80%
**Status:** 5 bugs identified — popups broken on frontend+editor, avatar broken in editor, label/component visibility CSS not working

## Reference Files

| Source | File | Key Lines |
|--------|------|-----------|
| Voxel Widget PHP | `themes/voxel/app/widgets/user-bar.php` | Full widget class |
| Voxel Template (main) | `themes/voxel/templates/widgets/user-bar.php` | Root container + items loop |
| Voxel Template (notifications) | `themes/voxel/templates/widgets/user-bar/notifications.php` | Notifications Vue component |
| Voxel Template (messages) | `themes/voxel/templates/widgets/user-bar/messages.php` | Messages Vue component |
| Voxel Template (cart) | `themes/voxel/templates/widgets/user-bar/cart.php` | Cart Vue component |
| Voxel Template (user_menu) | `themes/voxel/templates/widgets/user-bar/user-menu.php` | Avatar + dropdown menu |
| Voxel Template (select_wp_menu) | `themes/voxel/templates/widgets/user-bar/select-wp-menu.php` | WP menu dropdown |
| Voxel Template (link) | `themes/voxel/templates/widgets/user-bar/link.php` | Simple link |
| Voxel Beautified JS | `docs/block-conversions/userbar/voxel-user-bar.beautified.js` | 370 lines |
| FSE Block JSON | `blocks/src/userbar/block.json` | 345 lines, 32+ attributes |
| FSE Edit | `blocks/src/userbar/edit.tsx` | 170 lines |
| FSE Frontend | `blocks/src/userbar/frontend.tsx` | 275 lines |
| FSE Component | `blocks/src/userbar/shared/UserbarComponent.tsx` | 1780 lines |
| FSE Styles | `blocks/src/userbar/styles.ts` | 515 lines |
| FSE Types | `blocks/src/userbar/types/index.ts` | 543 lines |
| FSE Controller | `controllers/fse-userbar-api-controller.php` | 295 lines |
| FSE ContentTab | `blocks/src/userbar/inspector/ContentTab.tsx` | 399 lines |
| FSE StyleTab | `blocks/src/userbar/inspector/StyleTab.tsx` | — |

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| Rendering | Elementor widget → PHP template → Vue.js mount | Gutenberg block → React hydration (Plan C+) |
| State Management | Vue 3 `data()` / reactivity | React `useState` + `useCallback` hooks |
| Config Injection | `data-config` attributes on each Vue component element | `window.VoxelFSEUserbar` global via `wp_head` |
| AJAX | `?vx=1&action=...` with nonces from `data-config` | Same `?vx=1` + nonces from `window.VoxelFSEUserbar.nonces` |
| CSS Approach | Elementor controls → inline CSS via Elementor engine | Inspector controls → `styles.ts` → PHP `Style_Generator` |
| Popups | Voxel's `<teleport>` component | FormPopup React portal to `document.body` |
| Editor Preview | Elementor widget preview (full interactivity) | React component with `context="editor"` (limited) |

## HTML Structure Parity

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Root container | `.ts-user-area` | `.voxel-fse-userbar.ts-user-area` | ✅ |
| Menu list | `ul.flexify.simplify-ul.user-area-menu` | `ul.flexify.simplify-ul.user-area-menu` | ✅ |
| Repeater items | `.elementor-repeater-item-{_id}` | `.elementor-repeater-item-{_id}` | ✅ |
| Notifications wrapper | `.ts-notifications-wrapper` | `.ts-notifications-wrapper` | ✅ |
| Icon container | `.ts-comp-icon.flexify` | `.ts-comp-icon.flexify` | ✅ |
| Label | `.ts_comp_label` | `.ts_comp_label` | ✅ |
| Unread indicator | `.unread-indicator` | `.unread-indicator` | ✅ |
| Messages wrapper | `.ts-popup-messages` | `.ts-popup-messages` | ✅ |
| Cart wrapper | `.ts-popup-cart` | `.ts-popup-cart` | ✅ |
| User avatar area | `.ts-popup-component.ts-user-area-avatar` | `.ts-popup-component.ts-user-area-avatar` | ✅ |
| Down arrow | `.ts-down-icon` | `.ts-down-icon` | ✅ |
| Popup content | `<teleport>` to body | FormPopup portal to body | ✅ |

## JavaScript Behavior Parity

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|-----------|--------|-------|
| 1 | `render_notifications` (Vue mount) | NotificationsItem + FormPopup | ✅ | Full API parity |
| 2 | `getList()` | `getList()` | ✅ | Paginated notifications |
| 3 | `clearAll()` | `clearAll()` | ✅ | Clear all notifications |
| 4 | `open()` (notification detail) | `openItem()` | ✅ | |
| 5 | `get_actions()` | `getActions()` | ✅ | Notification actions |
| 6 | `run_action()` | `runAction()` | ✅ | Execute action |
| 7 | `render_popup_messages` (Vue mount) | MessagesItem + FormPopup | ✅ | Chat list with pagination |
| 8 | `getChats()` | `getChats()` | ✅ | |
| 9 | `render_voxel_cart` (Vue mount) | CartItemComponent + FormPopup | ✅ | Full cart API |
| 10 | `getCartItems()` | `loadCartItems()` | ✅ | |
| 11 | `removeItem()` | `removeItem()` | ✅ | |
| 12 | `emptyCart()` | `emptyCart()` | ✅ | |
| 13 | `updateQuantity()` | `updateQuantity()` | ✅ | |
| 14 | Guest cart (localStorage) | `storeGuestCart()` / `getGuestCart()` | ✅ | `voxel:guest_cart` key |
| 15 | `window.VX_Cart` global | `window.VX_Cart` assignment | ✅ | External script compat |
| 16 | `voxel:added_cart_item` event | Event listener | ✅ | Cart update events |

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| `inbox.list_chats` | ✅ data-config nonce | ✅ `getNonce('chat')` | ✅ |
| `inbox.load_chat` | ✅ | ✅ (redirect to /inbox) | ✅ |
| `notifications.get_list` | ✅ | ✅ | ✅ |
| `notifications.clear_all` | ✅ | ✅ | ✅ |
| `notifications.open` | ✅ | ✅ | ✅ |
| `notifications.get_actions` | ✅ | ✅ | ✅ |
| `notifications.run_action` | ✅ | ✅ | ✅ |
| `products.get_cart_items` | ✅ data-config nonce | ✅ `getNonce('cart')` | ✅ |
| `products.remove_cart_item` | ✅ | ✅ | ✅ |
| `products.empty_cart` | ✅ | ✅ | ✅ |
| `products.update_cart_item` | ✅ | ✅ | ✅ |

## Style Controls Parity

### Content Tab
| Control | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Items repeater | ✅ Elementor repeater | ✅ RepeaterControl | ✅ |
| Component type | ✅ Select | ✅ SelectControl | ✅ |
| Icon picker | ✅ Icons control | ✅ IconPickerControl | ✅ |
| Choose menu | ✅ Select | ✅ SelectControl | ✅ |
| Label text | ✅ Text | ✅ TextControl | ✅ |
| Link URL | ✅ URL | ✅ TextControl | ✅ |
| Auth links | ✅ Switcher | ✅ ToggleControl | ✅ |
| Label visibility | ✅ Responsive show/hide | ⚠️ **CSS generation broken** | **BUG #3** |
| Component visibility | ✅ Responsive show/hide | ⚠️ **CSS generation broken** | **BUG #4** |

### Style Tab
| Section | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Layout (align, orientation, gap) | ✅ | ✅ | ✅ |
| Item style (bg, border, padding) | ✅ | ✅ | ✅ |
| Icon style (size, color, container) | ✅ | ✅ | ✅ |
| Unread indicator | ✅ | ✅ | ✅ |
| Avatar (size, radius) | ✅ | ✅ | ✅ |
| Label typography | ✅ | ✅ | ✅ |
| Chevron | ✅ | ✅ | ✅ |
| Popup style | ✅ | ✅ | ✅ |

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Notifications popup | ✅ Vue mount + `<teleport>` | ⚠️ FormPopup exists but gated behind `context === 'frontend'` | **BUG #1** |
| 2 | Messages popup | ✅ Vue mount + `<teleport>` | ⚠️ FormPopup exists but gated behind `context === 'frontend'` | **BUG #1** |
| 3 | Cart popup | ✅ Vue mount + `<teleport>` | ⚠️ FormPopup exists but gated behind `context === 'frontend'` | **BUG #1** |
| 4 | User menu dropdown | ✅ Vue mount + `<teleport>` | ⚠️ FormPopup exists but gated behind `context === 'frontend'` | **BUG #1** |
| 5 | WP Menu dropdown | ✅ Vue mount + `<teleport>` | ⚠️ FormPopup exists but gated behind `context === 'frontend'` | **BUG #1** |
| 6 | Avatar display (frontend) | ✅ PHP `get_avatar_markup()` | ⚠️ Depends on `window.VoxelFSEUserbar` config | **BUG #2** |
| 7 | Avatar display (editor) | ✅ Elementor preview shows real data | ⚠️ Gray placeholder circle | **BUG #2** |
| 8 | Unread indicators | ✅ Server-rendered + Vue polling | ✅ React + server config | ✅ |
| 9 | Guest cart (localStorage) | ✅ | ✅ | ✅ |
| 10 | `window.VX_Cart` global | ✅ | ✅ | ✅ |
| 11 | Label visibility | ✅ Elementor responsive CSS | ⚠️ CSS lacks `!important`, may lose specificity | **BUG #3** |
| 12 | Component visibility | ✅ Elementor responsive CSS | ⚠️ CSS override logic may be flawed | **BUG #4** |
| 13 | Auth links (login/register) | ✅ | ✅ | ✅ |
| 14 | Deep linking (/inbox) | ✅ | ✅ | ✅ |
| 15 | l10n strings | ✅ | ✅ | ✅ |
| 16 | Nonces | ✅ `data-config` | ✅ `window.VoxelFSEUserbar.nonces` | ✅ |

## Identified Gaps

### Bug #1: All Popups Gated Behind `context === 'frontend'` (Severity: High)

**Voxel behavior:** Popups work in both the Elementor editor preview and the frontend. Clicking notification/messages/cart/user_menu icons opens their respective popups.

**FSE behavior:** Every `handleOpen()` callback has a guard:
```typescript
const handleOpen = useCallback(() => {
    if (context !== 'frontend') return;  // <-- blocks all editor popups
    ...
}, [context]);
```

Found at:
- `UserbarComponent.tsx:253` — NotificationsItem handleOpen
- `UserbarComponent.tsx:747` — MessagesItem handleOpen
- `UserbarComponent.tsx:1029` — CartItemComponent handleOpen
- `UserbarComponent.tsx:1421-1424` — UserMenuItem handleOpen
- `UserbarComponent.tsx:1531-1534` — WpMenuItem handleOpen

Additionally, FormPopup rendering is gated:
- `UserbarComponent.tsx:575` — `{context === 'frontend' && (<FormPopup ...>)}`
- `UserbarComponent.tsx:1485` — `{context === 'frontend' && (<FormPopup ...>)}`

**Impact:** Popups are completely non-functional in the Gutenberg editor. Users cannot preview popup behavior while editing. This is the most visible bug.

**Note:** The user also reports popups not working on the **frontend**. This may be a separate issue related to `window.VoxelFSEUserbar` not being present (Bug #2) or the `is_admin()` check blocking config injection.

**Fix:** Remove the `context !== 'frontend'` guards from all handleOpen methods. The FormPopup component should render in both contexts. Consider using the editor's `apiFetch` for config in editor context.

---

### Bug #2: Server Config Not Available in Editor + Potentially Missing on Frontend (Severity: High)

**Voxel behavior:** Each Vue component has its data injected via `data-config` attributes directly in the PHP template, making it available in all contexts.

**FSE behavior:** Config is injected via `fse-userbar-api-controller.php:263-293`:
```php
public function enqueue_userbar_config(): void {
    if ( is_admin() ) {     // <-- Line 265: blocks ALL admin pages
        return;
    }
    // ... builds and injects window.VoxelFSEUserbar
}
```

The `is_admin()` check prevents `window.VoxelFSEUserbar` from being injected in the block editor. This means:
- **Editor:** No server config → no nonces, no user data, no menus, no unread counts
- **Avatar:** Falls back to gray placeholder (line 1444-1457) because `context === 'editor'` branch renders placeholder
- **User data:** `serverConfig?.user ?? window.VoxelFSEUser` → both undefined in editor → defaults to "User" display name

**Frontend impact:** The controller hooks into `wp_enqueue_scripts` (line 36) which should fire on the frontend. The `is_admin()` check should return `false` on frontend pages. However, the user reports the frontend is also broken when logged in. Possible causes:
1. The `wp_enqueue_scripts` hook at priority 20 may fire AFTER the React script loads
2. The config script is added via `wp_head` (line 290-292) but the React hydration runs on `DOMContentLoaded` — timing should be fine
3. Need to verify `window.VoxelFSEUserbar` is actually present on the frontend page

**Fix:**
- **Editor:** Use the existing REST API endpoint (`/voxel-fse/v1/userbar/context`) via `apiFetch()` in `edit.tsx` to fetch config and pass it to UserbarComponent
- **Frontend:** Debug why config may not be loading. Check if the controller is being instantiated.

---

### Bug #3: Label Visibility CSS Missing `!important` (Severity: Medium)

**Voxel behavior:** Elementor generates responsive CSS with `!important` for visibility overrides:
```css
.elementor-repeater-item-abc123 .ts_comp_label { display: none !important; }
```

**FSE behavior:** In `styles.ts:350-369`, label visibility rules lack `!important`:
```typescript
if (item.labelVisibilityDesktop === 'none') {
    cssRules.push(`${itemSelector} .ts_comp_label { display: none; }`);  // no !important
}
```

While component visibility rules at lines 374-391 DO use `!important`, label visibility rules do not. This means Voxel's base CSS (which uses `display: flex` on `.ts_comp_label`) can override the generated hide rule.

**Impact:** Setting "Label Visibility → Desktop: Hidden" in the inspector has no visible effect because the base CSS `.ts_comp_label { display: flex; }` wins the specificity battle.

**Fix:** Add `!important` to all label visibility CSS rules in `styles.ts:350-369`.

---

### Bug #4: Component Visibility CSS Override Logic (Severity: Medium)

**Voxel behavior:** Elementor correctly handles the cascade:
- Desktop: `display: none !important` → hidden on desktop
- Tablet: `display: flex !important` → visible on tablet (overrides desktop)
- Mobile: inherits tablet unless explicitly set

**FSE behavior:** In `styles.ts:374-391`, the override logic uses conditional checks:
```typescript
} else if (item.userBarVisibilityTablet === 'flex' && item.userBarVisibilityDesktop === 'none') {
    tabletRules.push(`${itemSelector} { display: flex !important; }`);
}
```

This only generates the tablet override rule if the desktop is explicitly `none`. But Elementor's approach is simpler: it generates the CSS for whatever the value is, and the cascade handles the rest. The FSE approach may miss edge cases where:
- Desktop is `flex`, Tablet is `none`, Mobile is `flex` — the mobile override won't generate because it checks both desktop AND tablet.

**Impact:** Some responsive visibility combinations don't produce the correct CSS output.

**Fix:** Simplify the logic: always generate the CSS rule for each breakpoint when the value differs from the default (`flex`), rather than using conditional checks.

---

### Bug #5: Dead `nonce` Prop + Wrong `isCartEmpty` Key (Severity: Low)

**Voxel behavior:** Nonces are available via `data-config` on each component.

**FSE behavior:** In `UserbarComponent.tsx:1718-1727`:
```typescript
const windowConfig = (window as unknown as {
    VoxelFSEUserbar?: {
        nonce?: string;          // <-- reads "nonce" (singular, doesn't exist)
        is_cart_empty?: boolean;  // <-- reads "is_cart_empty" (doesn't exist, it's "isCartEmpty")
    };
}).VoxelFSEUserbar;

const nonce = windowConfig?.nonce;         // always undefined
const isCartEmpty = windowConfig?.is_cart_empty ?? true;  // always true (wrong key)
```

The controller stores nonces at `nonces.chat` and `nonces.cart`, not `nonce`. And the cart empty flag is `isCartEmpty` not `is_cart_empty`. These values are passed as props but always fall back to their correct paths in subcomponents:
- `chatNonce = nonce || getNonce('chat')` — falls back correctly
- `cartNonce = nonce || getNonce('cart')` — falls back correctly

**But** `isCartEmpty` at line 1727 defaults to `true` (cart appears empty) because it reads the wrong key. The cart popup may not load items correctly on initial render.

**Impact:** Cart may always appear empty on first render. Nonce props are dead code (no functional impact due to fallbacks).

**Fix:** Update the type assertion to match the actual server config shape:
```typescript
const serverConfig = getServerConfig();
const isCartEmpty = serverConfig?.isCartEmpty ?? true;
```

## Summary

### What Works Well (~80%)
- HTML structure matches 1:1 (all CSS classes, data attributes)
- All AJAX endpoints implemented correctly
- Notifications, messages, cart logic is comprehensive
- Guest cart with localStorage
- window.VX_Cart global compatibility
- l10n strings, nonce infrastructure (via getNonce)
- Auth links, deep linking
- Style controls (layout, icons, typography, popup)

### Gaps to Fix (~20%)

| # | Bug | Severity | Scope |
|---|-----|----------|-------|
| 1 | Popups gated behind `context === 'frontend'` | **High** | Editor + possibly frontend |
| 2 | Server config not available in editor (is_admin check) | **High** | Editor + verify frontend |
| 3 | Label visibility CSS missing `!important` | **Medium** | Editor + Frontend |
| 4 | Component visibility CSS override logic flawed | **Medium** | Editor + Frontend |
| 5 | Dead nonce/isCartEmpty prop path (wrong keys) | **Low** | Frontend cart empty state |

### Priority Fix Order

1. **Bug #2** — Fix server config availability (root cause for avatar + menus in editor)
2. **Bug #1** — Remove context guards on popups (enables full interactivity)
3. **Bug #3** — Add `!important` to label visibility CSS
4. **Bug #4** — Simplify component visibility CSS logic
5. **Bug #5** — Fix property key names for nonce/isCartEmpty

### Frontend Investigation Required

The user reports the frontend is also broken when logged in. Need to verify:
1. Is `window.VoxelFSEUserbar` present on the frontend page?
2. Is the FSE_Userbar_API_Controller being instantiated?
3. Is the `wp_head` script tag rendering before the React bundle?

This may be a controller registration issue rather than a code logic issue.
