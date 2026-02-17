# Quick Search Widget vs Block - Parity Audit

**Date:** 2026-02-10
**Overall Parity:** ~100%
**Status:** Full parity achieved. All features, CSS classes, AJAX behavior, and inspector controls match 1:1.

---

## Reference Files

### Voxel Parent Theme (Widget)

| File | Purpose | Lines |
|------|---------|-------|
| `themes/voxel/app/widgets/quick-search.php` | Widget class (controls + template registration) | ~1630 |
| `themes/voxel/templates/widgets/quick-search.php` | Template (HTML + Vue directives) | ~192 |
| `themes/voxel/assets/dist/quick-search.js` | Compiled JS (minified) | 1 |
| `themes/voxel/assets/dist/forms.css` | Quick search CSS classes | - |
| `themes/voxel/assets/dist/popup-kit.css` | Popup styling | - |
| `docs/block-conversions/quick-search/voxel-quick-search.beautified.js` | Beautified JS reference | 588 |

### FSE Child Theme (Block)

| File | Purpose | Lines |
|------|---------|-------|
| `themes/voxel-fse/app/blocks/src/quick-search/block.json` | Block registration | - |
| `themes/voxel-fse/app/blocks/src/quick-search/edit.tsx` | Editor component | - |
| `themes/voxel-fse/app/blocks/src/quick-search/frontend.tsx` | Frontend hydration | ~360+ |
| `themes/voxel-fse/app/blocks/src/quick-search/shared/QuickSearchComponent.tsx` | Main React component | ~816 |
| `themes/voxel-fse/app/blocks/src/quick-search/types/index.ts` | TypeScript types | ~230 |
| `themes/voxel-fse/app/blocks/src/quick-search/inspector/ContentTab.tsx` | Content inspector | ~150+ |
| `themes/voxel-fse/app/blocks/src/quick-search/inspector/StyleTab.tsx` | Style inspector | ~150+ |
| `themes/voxel-fse/app/blocks/src/quick-search/inspector/InspectorControls.tsx` | Inspector wrapper | ~65 |
| `themes/voxel-fse/app/blocks/src/quick-search/styles.ts` | CSS generator | ~599 |
| `themes/voxel-fse/app/blocks/src/quick-search/render.php` | Server-side render | - |
| `themes/voxel-fse/app/blocks/src/quick-search/save.tsx` | Save output | - |
| REST controller: `rest-api-controller.php` | Post types endpoint | Lines 275-288, 1791-1841 |

---

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| **Rendering** | PHP template + Vue.js 3 hydration | PHP render.php + React hydration |
| **State Management** | Vue `data()` + `methods` + `watch` | React `useState` + `useEffect` + `useRef` |
| **AJAX** | jQuery.get() to `?vx=1&action=quick_search` | fetch() to `?vx=1&action=quick_search` |
| **Config Source** | `.vxconfig` JSON in closest `.elementor-element` | `.vxconfig` JSON in block wrapper |
| **Popup System** | Voxel `form-group` component (Vue) | React portal to `document.body` (frontend) / inline (editor) |
| **CSS** | Voxel theme enqueue (forms.css, popup-kit.css) | Dynamic `<style>` tag (JS+PHP hybrid) + Voxel CSS link injection |
| **Inspector** | Elementor controls (42 content + 50 style = 92 total) | Gutenberg InspectorControls (Content + Style + Advanced + Voxel tabs) |
| **API Layer** | None (direct Voxel AJAX) | REST endpoint for post types config (`/voxel-fse/v1/quick-search/post-types`) |

---

## HTML Structure Parity

| Element | Voxel CSS Class(es) | FSE CSS Class(es) | Match |
|---------|---------------------|-------------------|-------|
| Root container | `.ts-form.quick-search` | `.ts-form.quick-search` | ✅ |
| Config script | `script.vxconfig` | `script.vxconfig` | ✅ |
| Form group | `.ts-form-group.quick-search-keyword` | `.ts-form-group.quick-search-keyword` | ✅ |
| Trigger button | `.ts-filter.ts-popup-target` | `.ts-filter.ts-popup-target` | ✅ |
| Button text | `.ts-filter-text` | `.ts-filter-text` | ✅ |
| Shortcut badge | `.ts-shortcut` | `.ts-shortcut` | ✅ |
| Popup wrapper | `.ts-quicksearch-popup.lg-width.lg-height` | `.ts-quicksearch-popup.lg-width.lg-height` | ✅ |
| Popup overlay | `.ts-popup-overlay` | `.ts-popup-overlay` | ✅ |
| Popup backdrop | `.ts-popup-backdrop` | `.ts-popup-backdrop` | ✅ |
| Sticky header | `.ts-sticky-top.qs-top.uib.b-bottom` | `.ts-sticky-top.qs-top.uib.b-bottom` | ✅ |
| Close button (mobile) | `.ts-icon-btn.hide-d` | `.ts-icon-btn.hide-d` | ✅ |
| Input wrapper | `.ts-input-icon.flexify` | `.ts-input-icon.flexify` | ✅ |
| Input field | `input.autofocus[maxlength=100]` | `input.autofocus[maxLength=100]` | ✅ |
| Post type tabs wrapper | `.ts-form-group.cpt-tabs` | `.ts-form-group.cpt-tabs` | ✅ |
| Tabs list | `.ts-generic-tabs.flexify.simplify-ul.quick-cpt-select` | `.ts-generic-tabs.flexify.simplify-ul.quick-cpt-select` | ✅ |
| Active tab | `li.ts-tab-active` | `li.ts-tab-active` | ✅ |
| Results dropdown | `.ts-term-dropdown.ts-md-group.ts-multilevel-dropdown` | `.ts-term-dropdown.ts-md-group.ts-multilevel-dropdown` | ✅ |
| Loading state | `.vx-pending` dynamic class | `.vx-pending` dynamic class | ✅ |
| Empty state | `.ts-empty-user-tab` | `.ts-empty-user-tab` | ✅ |
| Results list | `.simplify-ul.ts-term-dropdown-list.quick-search-list` | `.simplify-ul.ts-term-dropdown-list.quick-search-list` | ✅ |
| Result item (logo) | `.ts-term-image > span[v-html]` | `.ts-term-image > span[dangerouslySetInnerHTML]` | ✅ |
| Result item (icon) | `.ts-term-icon > span[v-html]` | `.ts-term-icon > span[dangerouslySetInnerHTML]` | ✅ |
| "View all" link | `li.view-all` | `li.view-all` | ✅ |
| Filled state | `.ts-filled` on button | `.ts-filled` on button | ✅ |

**HTML Parity: 100%** — All elements, CSS classes, and data attributes match exactly.

---

## JavaScript Behavior Parity

| # | Voxel Method | FSE Method | Parity | Notes |
|---|-------------|-----------|--------|-------|
| 1 | `created()` keyboard shortcuts | `useEffect([])` keyboard shortcuts | ✅ | Ctrl+K (keyCode 75), Escape (keyCode 27) |
| 2 | `getResults()` | `performSearch()` | ✅ | Same dispatch logic for single vs tabbed |
| 3 | `queryResults()` | `performSearch()` (inline) | ✅ | Min length check, duplicate skip, AJAX call |
| 4 | `debouncedResults` (250ms) | `debouncedSearch` (250ms) | ✅ | Same debounce timing |
| 5 | `viewArchive()` | `viewArchive()` | ✅ | URL build + navigation for both modes |
| 6 | `saveSearchItem(item)` | `saveSearchItem(item)` | ✅ | Max 8, duplicate filter, localStorage |
| 7 | `saveCurrentTerm()` | `saveCurrentTerm()` | ✅ | "keywords" type entry with archive link |
| 8 | `clearRecents()` | `clearRecents()` | ✅ | localStorage clear |
| 9 | `clickedRecent(item)` | `handleRecentClick(item)` | ✅ | Move to top of recent list |
| 10 | `getRecent()` | `useEffect` on mount | ✅ | Parse from localStorage with error handling |
| 11 | `search` watcher → debounce | `useEffect([search])` → debounce | ✅ | Framework equivalent |

**JS Parity: 100%** — All methods have direct equivalents with identical behavior.

---

## AJAX Endpoint Parity

| Endpoint | Voxel | FSE | Match |
|----------|-------|-----|-------|
| Search | `?vx=1&action=quick_search` (jQuery.get) | `?vx=1&action=quick_search` (fetch) | ✅ |
| Request params | `search` + `post_types` (JSON string) | `search` + `post_types` (JSON string) | ✅ |
| Response handling | `data.success` → `data.data` items | `data.success` → `data.data` items | ✅ |
| Error handling | `Voxel.alert()` notification | `Voxel.alert()` notification | ✅ |
| Post types config | N/A (from `.vxconfig`) | REST: `/voxel-fse/v1/quick-search/post-types` | ✅ (FSE adds REST layer) |

**AJAX Parity: 100%** — Uses correct `?vx=1` system (NOT admin-ajax.php). FSE adds a REST endpoint for post types config (Gutenberg/Next.js compatibility).

---

## Style Controls Parity

### Search Button (Normal / Hover / Filled)

| Control | Voxel Control ID | FSE Attribute | Match |
|---------|-----------------|---------------|-------|
| Typography | `ts_sf_search_btn_typo` | `buttonTypography` | ✅ |
| Padding | `ts_sf_search_btn_padding` | `buttonPadding` | ✅ |
| Height | `ts_sf_search_btn_height` | `buttonHeight` | ✅ |
| Box Shadow | `ts_sf_search_btn_shadow` | `buttonBoxShadow` | ✅ |
| Background | `ts_sf_search_btn_bg_c` | `buttonBackground` | ✅ |
| Text Color | `ts_sf_search_btn_color_c` | `buttonTextColor` | ✅ |
| Border | `ts_sf_search_btn_border` | `buttonBorderType/Width/Color` | ✅ |
| Border Radius | `ts_sf_search_btn_radius` | `buttonBorderRadius` | ✅ |
| Icon Color | `ts_sf_icon_color_c` | `buttonIconColor` | ✅ |
| Icon Size | `ts_sf_icon_size` | `buttonIconSize` | ✅ |
| Icon Spacing | `ts_icon_spacing` | `buttonIconSpacing` | ✅ |
| Hover states | `*_h` suffix controls | `*Hover` suffix attributes | ✅ |
| Filled states | `*_filled` suffix controls | `*Filled` suffix attributes | ✅ |

### Button Suffix (Keyboard Shortcut Badge)

| Control | Voxel Control ID | FSE Attribute | Match |
|---------|-----------------|---------------|-------|
| Hide | `ts_suffix_hide` | `suffixHide` | ✅ |
| Padding | `ts_suffix_padding` | `suffixPadding` | ✅ |
| Typography | `ts_suffix_typo` | `suffixTypography` | ✅ |
| Text Color | `ts_suffix_color` | `suffixTextColor` | ✅ |
| Background | `ts_suffix_bg` | `suffixBackground` | ✅ |
| Border Radius | `ts_suffix_radius` | `suffixBorderRadius` | ✅ |
| Box Shadow | `ts_suffix_shadow` | `suffixBoxShadow` | ✅ |
| Margin | `ts_suffix_margin` | `suffixMargin` | ✅ |

### Popup Tabs (Normal / Hover)

| Control | Voxel Control ID | FSE Attribute | Match |
|---------|-----------------|---------------|-------|
| Justify | `ts_tabs_justify` | `tabsJustify` | ✅ |
| Padding | `ts_tabs_padding` | `tabsPadding` | ✅ |
| Margin | `ts_tabs_margin` | `tabsMargin` | ✅ |
| Text Color | `ts_tabs_text_color` | `tabsTextColor` | ✅ |
| Active Text Color | `ts_tabs_active_text_color` | `tabsActiveTextColor` | ✅ |
| Border Color | `ts_tabs_border_color` | `tabsBorderColor` | ✅ |
| Active Border | `ts_tabs_border_h_active` | `tabsActiveBorderColor` | ✅ |
| Background | `ts_tabs_bg_color` | `tabsBackground` | ✅ |
| Active Background | `ts_bg_active_color` | `tabsActiveBackground` | ✅ |
| Border Radius | - | `tabsBorderRadius` | ✅ |
| Hover states | `*_h` suffix | `*Hover` suffix | ✅ |

### Custom Popup

| Control | Voxel Control ID | FSE Attribute | Match |
|---------|-----------------|---------------|-------|
| Enable | `custom_popup_enable` | `popupCustomEnable` | ✅ |
| Backdrop BG | `custm_pg_backdrop` | `popupBackdropBackground` | ✅ |
| Pointer Events | `popup_pointer_events` | `popupPointerEvents` | ✅ |
| Center Position | `popups_center_position` | `popupCenterPosition` | ✅ |
| Box Shadow | `pg_shadow` | `popupBoxShadow` | ✅ |
| Border | `pg_border` | `popupBorder` | ✅ |
| Top/Bottom Margin | `custom_pg_top_margin` | `popupTopBottomMargin` | ✅ |
| Min Width | `custom_pg_width` | `popupMinWidth` | ✅ |
| Max Width | `custom_max_width` | `popupMaxWidth` | ✅ |
| Max Height | `custom_max_height` | `popupMaxHeight` | ✅ |

### Custom Popup Menu

| Control | Voxel Control ID | FSE Attribute | Match |
|---------|-----------------|---------------|-------|
| Item padding | `ts_popup_term_padding` | via CustomPopupMenuControl | ✅ |
| Height | `ts_term_max_height` | via CustomPopupMenuControl | ✅ |
| Border radius | `ts_single_term_radius` | via CustomPopupMenuControl | ✅ |
| Title color | `ts_popup_term_title` | via CustomPopupMenuControl | ✅ |
| Title typography | `ts_popup_term_title_typo` | via CustomPopupMenuControl | ✅ |
| Logo width | `ts_logo_size` | via CustomPopupMenuControl | ✅ |
| Icon color/size | `ts_popup_term_icon*` | via CustomPopupMenuControl | ✅ |
| Hover states | `*_h` suffix | via CustomPopupMenuControl | ✅ |

**Style Controls Parity: 100%** — All 92 Elementor controls are mapped to FSE attributes with CSS generation.

---

## Feature Implementation Parity

| # | Feature | Voxel | FSE | Match |
|---|---------|-------|-----|-------|
| 1 | Keyboard shortcuts (Ctrl+K, Escape) | ✅ `document.onkeydown` | ✅ `useEffect` + `addEventListener` | ✅ |
| 2 | Tabbed display mode | ✅ Post type tabs | ✅ Post type tabs | ✅ |
| 3 | Single display mode | ✅ All results combined | ✅ All results combined | ✅ |
| 4 | Hide CPT tabs option | ✅ Elementor switcher | ✅ ToggleControl | ✅ |
| 5 | Search debounce (250ms) | ✅ `Voxel.helpers.debounce` | ✅ Custom debounce utility | ✅ |
| 6 | Min keyword length (2) | ✅ `config.keywords.minlength` | ✅ `config.keywords.minlength` | ✅ |
| 7 | Recent searches (localStorage) | ✅ Key: `voxel:recent_searches` | ✅ Key: `voxel:recent_searches` | ✅ |
| 8 | Max 8 recent items | ✅ `.slice(0, 8)` | ✅ `.slice(0, 8)` | ✅ |
| 9 | Save result on click | ✅ `saveSearchItem()` | ✅ `saveSearchItem()` | ✅ |
| 10 | Save search term | ✅ `saveCurrentTerm()` | ✅ `saveCurrentTerm()` | ✅ |
| 11 | Clear recent searches | ✅ `clearRecents()` | ✅ `clearRecents()` | ✅ |
| 12 | Recent click reorder | ✅ `clickedRecent()` | ✅ `handleRecentClick()` | ✅ |
| 13 | Duplicate query prevention | ✅ Last query check | ✅ `lastQueryRef` check | ✅ |
| 14 | AJAX via `?vx=1` | ✅ jQuery.get | ✅ fetch() | ✅ |
| 15 | Error via `Voxel.alert()` | ✅ No modals | ✅ No modals | ✅ |
| 16 | Logo → icon → default fallback | ✅ Template conditionals | ✅ Conditional rendering | ✅ |
| 17 | "Search for" link | ✅ Bottom of results | ✅ Bottom of results | ✅ |
| 18 | Archive navigation | ✅ `viewArchive()` | ✅ `viewArchive()` | ✅ |
| 19 | Loading state (`.vx-pending`) | ✅ Dynamic class | ✅ Dynamic class | ✅ |
| 20 | Empty states (no recent/no results) | ✅ Template conditionals | ✅ Conditional rendering | ✅ |
| 21 | Auto-focus input | ✅ `.autofocus` class | ✅ `inputRef` + focus on open | ✅ |
| 22 | Mobile close button | ✅ `.hide-d` | ✅ `.hide-d` | ✅ |
| 23 | Submit on Enter | ✅ `@keydown.enter` | ✅ `onKeyDown` handler | ✅ |
| 24 | Re-init prevention | ✅ `__vue_app__` check | ✅ `data-hydrated` check | ✅ |
| 25 | Dynamic content support | ✅ `voxel:markup-update` | ✅ `voxel:markup-update` | ✅ |
| 26 | Keyboard shortcut badge | ✅ `⌘+K` / `CTRL+K` | ✅ `⌘+K` / `CTRL+K` | ✅ |
| 27 | OS detection for shortcut | ✅ Platform check | ✅ `getVisitorOS()` | ✅ |
| 28 | Portal/teleport rendering | ✅ Vue form-group | ✅ React portal to body | ✅ |
| 29 | Responsive controls (18+) | ✅ Elementor responsive | ✅ ResponsiveRangeControl etc. | ✅ |
| 30 | State panels (Normal/Hover/Filled) | ✅ Elementor tabs | ✅ StateTabPanel | ✅ |
| 31 | 4 customizable icons | ✅ Icon picker controls | ✅ IconPickerControl | ✅ |
| 32 | Custom popup styling | ✅ 16 popup controls | ✅ PopupCustomStyleControl | ✅ |
| 33 | Custom popup menu styling | ✅ 17 menu controls | ✅ CustomPopupMenuControl | ✅ |
| 34 | Turbo/PJAX support | ✅ Event listeners | ✅ `turbo:load`, `pjax:complete` | ✅ |

**Feature Parity: 34/34 (100%)**

---

## Identified Gaps

**No gaps identified.** The FSE block achieves complete 1:1 parity with the Voxel widget.

### Minor Architectural Differences (Intentional, Not Gaps)

| # | Difference | Reason |
|---|-----------|--------|
| 1 | Vue.js 3 → React hooks | Required for Gutenberg block editor |
| 2 | jQuery.get → fetch() | Modern API, no jQuery dependency |
| 3 | Elementor controls → Gutenberg InspectorControls | Required for block editor |
| 4 | Added REST endpoint for post types | Enables Next.js/headless architecture |
| 5 | `document.onkeydown` → `addEventListener` | Better practice (no overwrite) |

---

## Summary

### What Works Well (100%)

- Complete HTML structure parity — every CSS class matches exactly
- All 92 Elementor controls mapped to FSE inspector controls
- Full AJAX integration using correct `?vx=1` system
- localStorage recent searches with identical key, format, and limits
- Keyboard shortcuts (Ctrl+K, Escape) working identically
- Responsive CSS with 3 breakpoints (desktop/tablet/mobile)
- State panels (Normal/Hover/Filled) fully implemented
- Portal rendering for popup (React equivalent of Vue form-group)
- Re-initialization prevention and dynamic content support

### Gaps to Fix (0%)

None. This block is at full parity.

### Priority Fix Order

No fixes needed.

---

**Audit methodology:** Parallel subagent research (Voxel widget agent + FSE block agent) with file-level evidence.
**Voxel version:** Latest (as of December 2025)
**Previous audit:** `phase3-parity.md` (confirmed 100% parity)
