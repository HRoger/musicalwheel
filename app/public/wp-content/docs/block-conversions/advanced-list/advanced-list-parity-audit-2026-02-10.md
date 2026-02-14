# Advanced List (Actions VX) - Parity Audit

**Date:** February 10, 2026
**Overall Parity:** ~92%
**Status:** High parity with 5 minor gaps

## Reference Files

| Source | File | Lines |
|--------|------|-------|
| **Voxel Widget** | `themes/voxel/app/widgets/advanced-list.php` | 1,185 |
| **Voxel Template** | `themes/voxel/templates/widgets/advanced-list.php` | 83 |
| **Voxel Sub-Templates** | `templates/widgets/advanced-list/*.php` | 14 files |
| **FSE Component** | `blocks/src/advanced-list/shared/AdvancedListComponent.tsx` | 1,316 |
| **FSE Frontend** | `blocks/src/advanced-list/frontend.tsx` | 836 |
| **FSE API Controller** | `controllers/fse-advanced-list-api-controller.php` | 300 |

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| Rendering | Server-side PHP templates | React client-side with REST API hydration |
| State | Voxel Vue.js/jQuery (`vx-action`, `@click.prevent`) | React `useState` + `useEffect` |
| Popups | Vue.js `<popup>` + `<teleport>` components | React popup components with outside-click |
| AJAX | `/?vx=1&action=...` with `vx-action` attribute | Same `/?vx=1&action=...` URLs, `vx-action` attribute |
| Permissions | PHP `is_deletable_by_current_user()` at render time | REST API `PostContext` with permission flags |
| Follow status | PHP `get_follow_status()` at render time | REST API `isFollowed`/`isFollowRequested` |
| CSS | `vx:action.css` (parent theme) | Same CSS loaded via `edit.tsx` + scoped CSS from `styles.ts` |

## HTML Structure Parity

| Element | Voxel | FSE | Match |
|---------|-------|-----|-------|
| Container | `<ul class="flexify simplify-ul ts-advanced-list">` | `<ul class="flexify simplify-ul ts-advanced-list">` | ✅ 100% |
| Item wrapper | `<li class="elementor-repeater-item-{id} flexify ts-action">` | `<li class="vxfse-repeater-item-{id} flexify ts-action">` | ✅ ~99% (class prefix differs) |
| Action link | `<a class="ts-action-con">` or `<div class="ts-action-con">` | Same | ✅ 100% |
| Icon container | `<div class="ts-action-icon">` | `<div class="ts-action-icon">` | ✅ 100% |
| Active state | `.active` class on `.ts-action-con` | `.active` class on `.ts-action-con` | ✅ 100% |
| Intermediate | `.intermediate` class | `.intermediate` class | ✅ 100% |
| Follow class | `.ts-action-follow` | `.ts-action-follow` | ✅ 100% |
| Initial span | `<span class="ts-initial">` | `<span class="ts-initial">` | ✅ 100% |
| Reveal span | `<span class="ts-reveal">` | `<span class="ts-reveal">` | ✅ 100% |
| Popup wrapper | `.ts-action-wrap .ts-popup-component` | `.ts-action-wrap .ts-popup-component` | ✅ 100% |
| Share wrapper | `.ts-action-wrap .ts-share-post` | `.ts-action-wrap .ts-share-post` | ✅ 100% |
| Popup head | `.ts-popup-head .ts-sticky-top .flexify .hide-d` | `.ts-popup-head .ts-sticky-top .flexify .hide-d` | ✅ 100% |
| Popup name | `.ts-popup-name .flexify` | `.ts-popup-name .flexify` | ✅ 100% |
| Popup close | `.ts-popup-close .ts-icon-btn` | `.ts-popup-close .ts-icon-btn` | ✅ 100% |
| Dropdown | `.ts-term-dropdown .ts-md-group` | `.ts-term-dropdown .ts-md-group` | ✅ 100% |
| Dropdown list | `.simplify-ul .ts-term-dropdown-list .min-scroll` | `.simplify-ul .ts-term-dropdown-list .min-scroll` | ✅ 100% |
| Social share | `.ts-social-share` | `.ts-social-share` | ✅ 100% |
| Per-network | `.ts-share-facebook`, `.ts-share-twitter`, etc. | `.ts-share-facebook`, `.ts-share-twitter`, etc. | ✅ 100% |
| Tooltip | `data-tooltip="text"` | `data-tooltip="text"` | ✅ 100% |
| Follow tooltip | `tooltip-inactive`, `tooltip-active` | `tooltip-inactive`, `tooltip-active` | ✅ 100% |
| Select tooltip | `data-tooltip-default`, `data-tooltip-active` | `data-tooltip-default`, `data-tooltip-active` | ✅ 100% |

## Action Type Parity (18 Types)

| # | Action | Voxel Template | FSE Handler | Parity | Notes |
|---|--------|---------------|-------------|--------|-------|
| 1 | `none` | Inline `<div>` | `tag: 'div'` | ✅ 100% | Static display |
| 2 | `action_link` | Inline `<a>` with Elementor link attrs | `tag: 'a'` with link config | ✅ 100% | |
| 3 | `back_to_top` | `window.scrollTo({top:0})` | `window.scrollTo({top:0, behavior:'smooth'})` | ✅ 100% | |
| 4 | `go_back` | `javascript:history.back();` | `javascript:history.back();` | ✅ 100% | |
| 5 | `scroll_to_section` | `Voxel.scrollTo(element)` | `element.scrollIntoView({behavior:'smooth'})` | ✅ ~95% | Different scroll API but same result |
| 6 | `delete_post` | `delete-post-action.php` | `getVoxelActionUrl()` + `vx-action` + `data-confirm` | ✅ 100% | |
| 7 | `publish_post` | `publish-post-action.php` | `getVoxelActionUrl()` + `vx-action` | ✅ 100% | |
| 8 | `unpublish_post` | `unpublish-post-action.php` | `getVoxelActionUrl()` + `vx-action` | ✅ 100% | |
| 9 | `edit_post` | `edit-post-action.php` (multi-step popup) | `EditStepsPopup` component | ✅ ~95% | See Gap #2 |
| 10 | `view_post_stats` | `view-post-stats-action.php` | Direct link from `postContext` | ✅ 100% | |
| 11 | `share_post` | `share-post-action.php` (Vue.js popup) | `SharePopup` component | ✅ ~90% | See Gap #3 |
| 12 | `action_follow` | `follow-user-action.php` | `getVoxelActionUrl()` + follow classes | ⚠️ ~85% | See Gap #1 |
| 13 | `action_follow_post` | `follow-post-action.php` | `getVoxelActionUrl()` + follow classes | ⚠️ ~85% | See Gap #1 |
| 14 | `add_to_cart` | `add-to-cart-action.php` | `Voxel.addToCartAction()` or post link | ⚠️ ~80% | See Gap #4 |
| 15 | `select_addition` | `select-addon.php` | `ts-use-addition` class + `data-id` | ⚠️ ~85% | See Gap #1 |
| 16 | `show_post_on_map` | `show-post-on-map.php` | Link from `postContext.location.mapLink` | ✅ 100% | |
| 17 | `promote_post` | `promote-post-action.php` | Order/checkout links from `postContext.promote` | ✅ 100% | |
| 18 | `action_gcal` | `add-to-gcal-action.php` | `getGoogleCalendarUrl()` | ✅ 100% | |
| 19 | `action_ical` | `add-to-ical-action.php` | `getICalendarDataUrl()` | ✅ 100% | |

## Identified Gaps

### Gap #1: Active State Rendering Pattern (Severity: Medium)

**Voxel behavior:**
Follow, select_addition, and promote actions ALWAYS render both `.ts-initial` and `.ts-reveal` spans. The CSS hides/shows them based on `.active` class. The Voxel `vx-action` AJAX handler toggles the `.active` class on the parent, and CSS swaps visibility instantly.

```html
<!-- Voxel: ALWAYS renders both spans -->
<a class="ts-action-con ts-action-follow">
  <span class="ts-initial">Follow</span>
  <span class="ts-reveal">Following</span>
</a>
<!-- After click: vx-action adds .active class → CSS swaps spans -->
```

**FSE behavior:**
`AdvancedListComponent.tsx:1013-1043` — `renderContent()` only renders dual-span when `isActive === true`. When not active, it renders single-span (icon + text).

```tsx
// FSE: Conditional rendering
if (hasActiveState && isActive && item.activeText) {
  // Both spans rendered
} else {
  // Single span rendered (no .ts-reveal)
}
```

**Impact:**
- After a Voxel `vx-action` AJAX call toggles `.active` class on the DOM, the FSE React component doesn't re-render — it still shows the normal state HTML (no `.ts-reveal` span exists to become visible).
- The AJAX toggle works in Voxel because both spans are always in the DOM and CSS handles visibility.
- In FSE, the component would need to listen for the `vx-action` response and re-fetch `PostContext` to update React state.

**Fix:** Always render both `.ts-initial` and `.ts-reveal` spans for active-state actions (follow, select_addition, promote). Let CSS handle visibility toggling so it's compatible with Voxel's `vx-action` DOM manipulation.

**Files:** `AdvancedListComponent.tsx:1012-1043`

### Gap #2: Edit Post Popup — Vue.js vs React Popup (Severity: Low)

**Voxel behavior:**
`edit-post-action.php:22-49` — Uses Vue.js `<popup v-cloak>` component which is part of Voxel's popup system. It uses `@mousedown="active = true"` on trigger and `@click.prevent="$root.active = false"` on close. The popup uses Voxel's positioning system via `<popup>` component.

**FSE behavior:**
`AdvancedListComponent.tsx:209-269` — Uses custom React `EditStepsPopup` component with `useRef` + `useEffect` for outside-click closing. Renders inline within the action item's `.ts-action-wrap` container.

**Impact:**
- Functionally equivalent (both show edit steps, close on outside click)
- Visual positioning may differ slightly since Voxel's `<popup>` has built-in positioning logic
- The FSE popup uses `ts-popup ts-popup--edit-steps` class which may not match Voxel's popup positioning CSS exactly

**Fix:** Minor — ensure the popup positioning CSS matches Voxel's popup system. Consider using the shared `FormPopup` component if available.

### Gap #3: Share Popup — Dynamic Share List (Severity: Low)

**Voxel behavior:**
`share-post-action.php:39-57` — The share list is rendered by Vue.js from a `list` data property. It supports `ui-heading` items (section dividers) and a `shouldShow(item)` method for conditional rendering. The share list can be customized via Voxel's share.js configuration.

**FSE behavior:**
`AdvancedListComponent.tsx:42-50` — Uses a hardcoded `DEFAULT_SHARE_LIST` array (Facebook, Twitter, LinkedIn, Pinterest, WhatsApp, Email, Copy link). No support for `ui-heading` dividers or dynamic `shouldShow()` filtering.

**Impact:**
- Default share options match Voxel's defaults
- If Voxel's share.js has been customized with additional share options or headings, FSE won't reflect those
- Missing `ui-heading` support for section dividers in the share popup

**Fix:** Minor — read Voxel's share configuration from the REST API if customized. Add `ui-heading` support.

### Gap #4: Add-to-Cart "Select Options" Variant (Severity: Medium)

**Voxel behavior:**
`add-to-cart-action.php:33-43` — When `supports_one_click_add_to_cart()` is false, Voxel renders a completely different `<li>` using `ts_cart_opts_icon`, `ts_cart_opts_text`, and `ts_cart_opts_tooltip_text` (the "Select options" state). The icon and text are different from the normal state.

```html
<!-- Voxel: Select options variant -->
<li class="... ts-action" data-tooltip="Select options tooltip">
  <a href="{post_link}" class="ts-action-con">
    <div class="ts-action-icon">{cart_opts_icon}</div>
    Select options
  </a>
</li>
```

**FSE behavior:**
`AdvancedListComponent.tsx:785-808` — When `oneClick` is false, links to the post but uses the NORMAL state icon and text (not `cartOptsIcon`/`cartOptsText`).

```tsx
// FSE: Uses normal icon/text, not cart opts
return {
  tag: 'a',
  href: postContext.postLink,  // Correct URL
  // But renders with item.icon and item.text, not item.cartOptsIcon and item.cartOptsText
};
```

**Impact:**
- URL is correct (links to post page)
- Icon and text show the normal "Add to cart" instead of "Select options"
- Tooltip shows normal tooltip instead of `cartOptsTooltipText`

**Fix:** In `renderContent()`, check if `add_to_cart` action with `oneClick === false` and render `cartOptsIcon`/`cartOptsText` instead.

**Files:** `AdvancedListComponent.tsx:785-808` and `renderContent()` at line 1012

### Gap #5: Timeline Check Missing (Severity: Low)

**Voxel behavior:**
`follow-post-action.php:6-8` and `follow-user-action.php:6-8` — Both check `\Voxel\get('settings.timeline.enabled', true)` and return early if timeline is disabled.

**FSE behavior:**
No equivalent check in the REST API controller or the React component. Follow actions will render even if the timeline feature is disabled in Voxel settings.

**Impact:** Follow buttons may appear when they shouldn't if timeline is disabled.

**Fix:** Add `settings.timeline.enabled` check in `fse-advanced-list-api-controller.php` when resolving follow status.

## Style Controls Parity

| Section | Voxel Controls | FSE Controls | Match |
|---------|---------------|-------------|-------|
| **List: CSS Grid** | `csgrid_action_on`, `ts_cgrid_columns` | `enableCssGrid`, `gridColumns` | ✅ |
| **List: Item Width** | `ts_al_columns_no`, `ts_al_columns_cstm` | `itemWidth`, `customItemWidth` | ✅ |
| **List: Justify** | `ts_al_justify` | `listJustify` | ✅ |
| **List: Gap** | `ts_cgrid_gap` | `itemGap` | ✅ |
| **Item: Padding** | `ts_action_padding` (responsive) | `itemPadding` (responsive) | ✅ |
| **Item: Height** | `ts_acw_height` (responsive) | `itemHeight` (responsive) | ✅ |
| **Item: Border** | `ts_acw_border` (type/width/color) | `itemBorderType`, `itemBorderWidth`, `itemBorderColor` | ✅ |
| **Item: Radius** | `ts_acw_border` → radius (responsive) | `itemBorderRadius` (responsive) | ✅ |
| **Item: Shadow** | `ts_acw_border_shadow` | `itemBoxShadow` | ✅ |
| **Item: Typography** | `ts_acw_typography` | `itemTypography` | ✅ |
| **Item: Text Color** | `ts_acw_initial_color` | `itemTextColor` | ✅ |
| **Item: Background** | `ts_acw_initial_bg` | `itemBackgroundColor` | ✅ |
| **Icon Container: BG** | `ts_acw_icon_con_bg` | `iconContainerBackground` | ✅ |
| **Icon Container: Size** | `ts_acw_icon_con_size` (responsive) | `iconContainerSize` (responsive) | ✅ |
| **Icon Container: Border** | `ts_acw_icon_con_border` | `iconContainerBorder*` | ✅ |
| **Icon Container: Radius** | `ts_acw_icon_con_radius` (responsive) | `iconContainerBorderRadius` (responsive) | ✅ |
| **Icon Container: Shadow** | `ts_acw_con_shadow` | `iconContainerBoxShadow` | ✅ |
| **Icon Container: Spacing** | `ts_acw_icon_margin` (responsive) | `iconTextSpacing` (responsive) | ✅ |
| **Icon: On Top** | `ts_acw_icon_orient` | `iconOnTop` | ✅ |
| **Icon: Size** | `ts_acw_icon_size` (responsive) | `iconSize` (responsive) | ✅ |
| **Icon: Color** | `ts_acw_icon_color` | `iconColor` | ✅ |
| **Hover: All** | 7 hover controls | 7 hover attributes | ✅ |
| **Active: All** | 7 active controls | 7 active attributes | ✅ |
| **Tooltip: Position** | `tooltip_bottom` | `tooltipBottom` | ✅ |
| **Tooltip: Text Color** | `ts_tooltip_color` | `tooltipTextColor` | ✅ |
| **Tooltip: Typography** | `ts_tooltip_typo` | `tooltipTypography` | ✅ |
| **Tooltip: BG** | `ts_tooltip_bg` | `tooltipBackgroundColor` | ✅ |
| **Tooltip: Radius** | `ts_tooltip_radius` (responsive) | `tooltipBorderRadius` (responsive) | ✅ |

**Style Controls: 100% parity** — All 40+ controls mapped and implemented.

## REST API Parity

| Data | Voxel (PHP) | FSE API | Match |
|------|-------------|---------|-------|
| Post ID/title/link | Direct from `$post` | `postId`, `postTitle`, `postLink` | ✅ |
| Edit link | `$post->get_edit_link()` | `editLink` | ✅ |
| Editable check | `is_editable_by_current_user()` | `isEditable` | ✅ |
| Edit steps | `get_fields()` → `ui-step` filter | `editSteps[]` | ✅ |
| Follow post | `get_follow_status('post', $id)` | `isFollowed`, `isFollowRequested` | ✅ |
| Follow user | `get_follow_status('user', $id)` | `isAuthorFollowed`, `isAuthorFollowRequested` | ✅ |
| Delete permission | `is_deletable_by_current_user()` | `permissions.delete` | ✅ |
| Publish permission | `is_editable_by_current_user()` | `permissions.publish` | ✅ |
| Post status | Direct from `$post` | `status` | ✅ |
| Product field | `get_field('product')` | `product.isEnabled`, `oneClick`, `productId` | ✅ |
| Location | `get_field('location')->get_value()` | `location.latitude`, `longitude`, `mapLink` | ✅ |
| Stats link | `get_link()` → stats template | `postStatsLink` | ✅ |
| Promote data | `promotions->is_promotable_by_user()` | `promote.isPromotable`, `isActive`, links | ✅ |
| Nonces | `wp_create_nonce()` inline | `nonces.follow`, `delete_post`, `modify_post` | ✅ |
| Confirm messages | Hardcoded i18n | `confirmMessages.delete` | ✅ |

**REST API: 100% parity** — All post context data resolved correctly.

## Summary

### What Works Well (92%)
- HTML structure matches exactly (all CSS classes, element hierarchy)
- All 18+ action types implemented
- REST API provides complete post context data
- Tooltip patterns match for all action types (regular, follow, select_addition)
- Edit popup with multi-step support
- Share popup with social links + copy
- Calendar URL generation (Google Calendar + iCalendar)
- Permission checks mirror Voxel PHP checks
- Follow/intermediate state detection
- All 40+ style controls with responsive support
- Scoped CSS generation

### Gaps to Fix (8%)
1. **Gap #1** (Medium): Always render `.ts-initial`/`.ts-reveal` for active-state actions
2. **Gap #2** (Low): Edit popup positioning may differ from Voxel's `<popup>` system
3. **Gap #3** (Low): Share popup hardcoded list, no `ui-heading` support
4. **Gap #4** (Medium): Add-to-cart "Select options" uses wrong icon/text
5. **Gap #5** (Low): Missing `settings.timeline.enabled` check for follow actions

### Priority Fix Order
1. **Gap #1** — Active state dual-span rendering (affects follow, select_addition, promote)
2. **Gap #4** — Cart select options text/icon variant
3. **Gap #5** — Timeline enabled check
4. **Gap #3** — Share popup dynamic list
5. **Gap #2** — Popup positioning (cosmetic)
