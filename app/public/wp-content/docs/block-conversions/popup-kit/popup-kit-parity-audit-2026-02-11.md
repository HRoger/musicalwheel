# Popup Kit Widget vs Block - Parity Audit (CSS Loading Focus)

**Date:** 2026-02-11
**Overall Parity:** ~85%
**Status:** Broken vendor CSS loading on frontend (pikaday.css, nouislider.css)

## Critical Issue: Vendor CSS Not Loading on Frontend

### Problem Summary

When viewing pages with popup-kit styled components (date pickers, range sliders) in the FSE child theme, `pikaday.css` and `nouislider.css` fail to load on the **frontend**. This causes:
- Date pickers showing unstyled native `<select>` dropdowns instead of Pikaday calendar grid
- Range sliders rendering as raw `<input>` elements without noUiSlider styling
- Calendar layouts breaking (no grid, scattered day numbers)

**Editor works fine** - the issue is frontend-only.

## Reference Files

| Source | File | Purpose |
|--------|------|---------|
| Voxel Widget | `themes/voxel/app/widgets/popup-kit.php` | Widget class |
| Voxel Template | `themes/voxel/templates/widgets/popup-kit.php` | Render template |
| Voxel Assets | `themes/voxel/app/controllers/assets-controller.php:134-142` | CSS/JS registration |
| FSE Block | `themes/voxel-fse/app/blocks/src/popup-kit/` | Block files |
| Block Loader | `themes/voxel-fse/app/blocks/Block_Loader.php` | Enqueue logic |
| Vendor CSS | `themes/voxel/assets/vendor/pikaday/pikaday.prod.css` | Pikaday styles |
| Vendor CSS | `themes/voxel/assets/vendor/nouislider/nouislider.prod.css` | noUiSlider styles |

## Root Cause Analysis

### How Voxel Parent Loads Pikaday/noUiSlider

In Voxel parent, these vendor assets are loaded by the **individual filters that use them**, NOT by the popup-kit widget:

| Filter | Enqueues | File:Line |
|--------|----------|-----------|
| `availability-filter.php` | `pikaday` CSS/JS | `filters/availability-filter.php:257,262` |
| `date-filter.php` | `pikaday` JS | `filters/date-filter.php:148` |
| `recurring-date-filter.php` | `pikaday` JS | `filters/recurring-date-filter.php:141` |
| `date-filter-helpers.php` | `pikaday` CSS | `filters/traits/date-filter-helpers.php:46` |
| `range-filter.php` | `nouislider` CSS/JS | `filters/range-filter.php:209,218` |
| `location-filter.php` | `nouislider` CSS/JS | `filters/location-filter.php:398,404` |
| `booking-calendar.php` | `pikaday` CSS/JS | `widgets/booking-calendar.php:1617-1618` |
| `orders.php` | `pikaday` CSS/JS | `widgets/orders.php:2547,2551` |

The popup-kit widget's `get_style_depends()` only returns `['vx:forms.css', 'vx:popup-kit.css']` (line 1630-1632) — no pikaday or nouislider.

### How FSE Block Loader Tries to Load Them

`Block_Loader::enqueue_frontend_vendor_styles()` (line 2630) checks for blocks needing vendor assets:

1. Checks **singular post content** (`has_block('voxel-fse/popup-kit', $post)`) — line 2645
2. Checks **block widgets** (sidebars) — line 2660
3. Checks **FSE templates** via `check_fse_templates_for_block()` — line 2678

### The Gap (Root Cause)

`check_fse_templates_for_block()` (line 2917-2959) only looks at:
- The **current page template** (single, archive, home, index)
- **Template parts** directly referenced by that template (e.g., header, footer)

**It does NOT check the `kit_popups` template** (`voxel-kit_popups`), which is a special Voxel "kit" template loaded globally on all pages.

The popup-kit block lives in `kit_popups`, not in any regular page template. So `check_fse_templates_for_block()` returns `false`, and pikaday/nouislider CSS never gets enqueued on the frontend.

Meanwhile, `enqueue_popup_kit_global_styles()` (line 5638) **does** know about `kit_popups` and extracts inline CSS from it. But it only handles the generated inline CSS (CSS variables), not the vendor dependencies.

### Verification Path

```
enqueue_frontend_vendor_styles() at priority 10 on wp_enqueue_scripts
  → $has_popup_block = false (post content doesn't contain popup-kit)
  → $has_popup_block = false (no block widgets with popup-kit)
  → check_fse_templates_for_block('voxel-fse/popup-kit')
    → Checks current page template (e.g., 'single') — NOT kit_popups
    → Returns false
  → $needs_vendor_assets = false
  → pikaday/nouislider NEVER enqueued ❌
```

## Fix: Add kit_popups Check to enqueue_frontend_vendor_styles()

### Option A: Simple Fix (Recommended)

In `enqueue_frontend_vendor_styles()`, after the existing FSE template check (line 2678), add a check for the `kit_popups` template:

```php
// Check kit_popups template (popup-kit block is stored here, not in page templates)
if (!$has_popup_block) {
    $has_popup_block = self::check_kit_template_for_block('voxel-fse/popup-kit', 'kit_popups');
}
```

And add a helper method:

```php
private static function check_kit_template_for_block($block_name, $kit_type)
{
    $possible_slugs = ['voxel-' . $kit_type, get_stylesheet() . '//' . 'voxel-' . $kit_type];

    $query = new \WP_Query([
        'post_type' => 'wp_template',
        'post_status' => 'any',
        'post_name__in' => $possible_slugs,
        'posts_per_page' => 1,
        'no_found_rows' => true,
        'ignore_sticky_posts' => true,
    ]);

    if (!empty($query->posts)) {
        return has_block($block_name, $query->posts[0]->post_content);
    }

    return false;
}
```

### Option B: Simpler - Always Load in enqueue_popup_kit_global_styles()

In `enqueue_popup_kit_global_styles()` (line 5638), after enqueuing the popup-kit CSS, also enqueue vendor CSS:

```php
// Also enqueue vendor CSS that popup components depend on
self::ensure_voxel_styles_registered();
if (wp_style_is('pikaday', 'registered')) {
    wp_enqueue_style('pikaday');
}
if (wp_style_is('nouislider', 'registered')) {
    wp_enqueue_style('nouislider');
}
if (wp_script_is('pikaday', 'registered')) {
    wp_enqueue_script('pikaday');
}
if (wp_script_is('nouislider', 'registered')) {
    wp_enqueue_script('nouislider');
}
```

This is simpler because `enqueue_popup_kit_global_styles()` already queries for `kit_popups` and knows when popup-kit content exists.

## Architecture Comparison

| Aspect | Voxel Widget | FSE Block |
|--------|-------------|-----------|
| Rendering | Vue.js (client-side) | React hydration (Plan C+) |
| CSS Variables | Elementor CSS output via widget controls | `generateCSS.ts` → inline `<style>` tags |
| Vendor CSS Load | Filter-level `frontend_props()` at render time | `Block_Loader::enqueue_frontend_vendor_styles()` |
| Kit Template | Elementor template, loaded via `enqueue_template_css()` | FSE template, loaded via `enqueue_popup_kit_global_styles()` |
| Pikaday | `window.Pikaday` (global) | `window.Pikaday` (global) via import map proxy |
| noUiSlider | `window.noUiSlider` (global) | `window.noUiSlider` (global) via import map proxy |

## Editor CSS Status

Editor CSS loading is **working correctly** via multiple mechanisms:
1. `add_editor_style()` in `add_editor_styles_for_fse()` — injects pikaday/nouislider CSS into FSE iframe (line 1341-1345)
2. `enqueue_pikaday_styles()` — enqueues at priority 30 via `enqueue_block_editor_assets` (line 950)
3. `enqueue_nouislider_assets()` — enqueues at priority 30 via `enqueue_block_editor_assets` (line 1032)
4. `editorStyle` dependencies include `pikaday` and `nouislider` for popup-kit block (line 3711-3712)

## Summary

### What Works Well (~85%)
- Popup-kit CSS variables and inline styles load correctly globally
- Editor preview renders correctly with all vendor CSS
- `vx:popup-kit.css`, `vx:forms.css`, `vx:commons.css` load on frontend
- Import map proxies for pikaday/nouislider JS work correctly

### Gaps to Fix (~15%)
1. **Gap #1: Pikaday CSS not loaded on frontend** (Severity: High)
   - Impact: Date pickers in popups render as unstyled native controls
   - Fix: Add kit_popups check to `enqueue_frontend_vendor_styles()` OR enqueue in `enqueue_popup_kit_global_styles()`

2. **Gap #2: noUiSlider CSS not loaded on frontend** (Severity: High)
   - Impact: Range sliders in popups render as unstyled inputs
   - Fix: Same as Gap #1

### Priority Fix Order
1. Fix vendor CSS loading in `enqueue_popup_kit_global_styles()` (Option B — simplest, least risky)
