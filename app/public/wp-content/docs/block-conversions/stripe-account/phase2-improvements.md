# Stripe Account Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to stripe-account frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-195)

Added comprehensive documentation header covering all Voxel stripe-account-widget.php controls (2731 lines - largest widget):

**ICONS (Content Tab):**
- ts_setup_ico - Setup account icon
- ts_submit_ico - Submit details icon
- ts_update_ico - Update details icon
- ts_stripe_ico - Stripe dashboard icon
- ts_shipping_ico - Shipping icon
- ts_chevron_left - Back chevron icon
- save_icon - Save icon
- handle_icon - Drag handle icon
- ts_zone_ico - Shipping zone icon
- trash_icon - Delete/trash icon
- down_icon - Dropdown arrow icon
- ts_search_icon - Search icon
- ts_add_icon - Add new icon

**PANEL (Style Tab):**
- panel_border - Panel border (group control)
- panel_radius - Border radius (responsive box)
- panel_bg - Background color
- panel_shadow - Box shadow (group control)

**PANEL HEAD:**
- head_padding - Head padding (responsive dimensions)
- head_ico_size - Icon size (responsive slider)
- head_ico_margin - Icon right margin (responsive slider)
- head_ico_col - Icon color
- head_typo - Typography (group control)
- head_typo_col - Text color

**PANEL BODY:**
- panel_spacing - Body padding (responsive dimensions)
- panel_gap - Body content gap (responsive slider)
- text_align - Align text (left, center, right)
- body_typo - Typography (group control)
- body_typo_col - Text color

**FORM LABELS:**
- form_label_typo - Label typography
- form_label_col - Label color

**FORM INPUTS:**
- form_input_margin - Input margin top
- form_input_radius - Input border radius
- form_input_typo - Input typography
- form_input_padding - Input padding
- form_input_bg - Input background
- form_input_bg_focus - Input background focus
- form_input_border - Input border
- form_input_border_focus - Input border focus
- form_input_col - Input text color
- form_input_col_focus - Input text focus color

**FORM TEXTAREAS:**
- form_textarea_min_height - Min height

**SUFFIXES:**
- suffix_col - Suffix text color
- suffix_bg - Suffix background
- suffix_typo - Suffix typography

**SWITCHERS:**
- switcher_bg - Background (off)
- switcher_bg_checked - Background (on)
- switcher_slider - Slider color

**FORM SELECTS:**
- select_ico_size - Icon size
- select_ico_col - Icon color

**TABS:**
- tabs_gap - Tab gap
- tab_padding - Tab padding
- tab_radius - Tab border radius
- tab_typo - Tab typography
- tab_bg - Tab background
- tab_col - Tab text color
- tab_bg_a - Tab active background
- tab_col_a - Tab active text color

**HEADINGS:**
- heading_typo - Typography
- heading_col - Text color
- heading_margin - Margin bottom

**REPEATERS:**
- repeater_bg - Background
- repeater_radius - Border radius
- repeater_padding - Padding
- repeater_gap - Gap

**PILLS:**
- pill_padding - Padding
- pill_radius - Border radius
- pill_typo - Typography
- pill_bg - Background
- pill_col - Text color
- pill_gap - Gap

**PRIMARY BUTTON (ts-btn-2):**
- prm_btn_typo, prm_btn_radius, prm_btn_c, prm_btn_padding
- prm_btn_height, prm_btn_bg, prm_btn_border
- prm_btn_icon_size, prm_btn_icon_pad, prm_btn_icon_color
- prm_btn_c_h, prm_btn_bg_h, prm_btn_border_h, prm_btn_icon_color_h

**SECONDARY BUTTON (ts-btn-1):**
- scnd_btn_typo, scnd_btn_radius, scnd_btn_c, scnd_btn_padding
- scnd_btn_height, scnd_btn_bg, scnd_btn_border
- scnd_btn_icon_size, scnd_btn_icon_pad, scnd_btn_icon_color
- scnd_btn_c_h, scnd_btn_bg_h, scnd_btn_border_h, scnd_btn_icon_color_h

**TERTIARY BUTTON (ts-btn-4):**
- third_btn_typo, third_btn_radius, third_btn_c, third_btn_padding
- third_btn_height, third_btn_bg, third_btn_border
- third_btn_icon_size, third_btn_icon_pad, third_btn_icon_color
- third_btn_c_h, third_btn_bg_h, third_btn_border_h, third_btn_icon_color_h

### 2. normalizeConfig() Function (lines 302-366)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): VxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return fallback;
  };

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number): number => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return fallback;
  };

  // Normalize genImage object
  const normalizeGenImage = (val: unknown): { id: number; url: string } => {...};

  // Normalize icons object - supports both camelCase and snake_case
  const normalizeIcons = (val: unknown): VxConfig['icons'] => {...};

  return {
    genImage: normalizeGenImage(raw.genImage ?? raw.gen_image),
    icons: normalizeIcons(raw.icons),
  };
}
```

**Features:**
- String normalization (handles numeric values as strings)
- Number normalization (string to int parsing)
- genImage object normalization (id + url)
- Icons object normalization (13 icon strings)
- Dual-format support (camelCase and snake_case)
- Voxel control name support (ts_* prefixed controls)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 369-386)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  20.98 kB | gzip: 5.09 kB
Built in 260ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/modules/stripe-connect/widgets/stripe-account-widget.php` (2731 lines)
- Template: `themes/voxel/templates/backend/stripe/account-details.php`
- REST endpoint: `voxel-fse/v1/stripe-account/config`
- AJAX action: `stripe_connect.account.save_shipping`

## Architecture Notes

The stripe-account block is unique because:
- **Stripe Connect module**: Part of Voxel's stripe-connect module, not widgets directory
- **Largest widget**: 2731 lines, most complex widget in Voxel
- **REST + AJAX**: Uses REST API for config and AJAX for saving shipping
- **Vendor shipping**: Supports complex shipping zone/rate configuration
- **13 icons**: Most icons of any widget (setup, submit, update, stripe, shipping, etc.)
- **3 button types**: Primary (ts-btn-2), Secondary (ts-btn-1), Tertiary (ts-btn-4)
- **Form-heavy**: Labels, inputs, textareas, selects, switchers, tabs, pills

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] genImage object normalization
- [x] Icons object normalization (13 icons)
- [x] Async data fetching with proper error handling
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] Multisite support via getRestBaseUrl() and getSiteBaseUrl()

## Files Modified

1. `app/blocks/src/stripe-account/frontend.tsx`
   - Added Voxel parity header (195 lines)
   - Added normalizeConfig() function (65 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Setup icon | 100% | ts_setup_ico |
| Submit icon | 100% | ts_submit_ico |
| Update icon | 100% | ts_update_ico |
| Stripe icon | 100% | ts_stripe_ico |
| Shipping icon | 100% | ts_shipping_ico |
| Chevron icon | 100% | ts_chevron_left |
| Save icon | 100% | save_icon |
| Handle icon | 100% | handle_icon |
| Zone icon | 100% | ts_zone_ico |
| Trash icon | 100% | trash_icon |
| Down icon | 100% | down_icon |
| Search icon | 100% | ts_search_icon |
| Add icon | 100% | ts_add_icon |
| Panel style | 100% | Border, radius, bg, shadow |
| Panel head | 100% | Padding, icon, typography |
| Panel body | 100% | Spacing, gap, alignment, typography |
| Form labels | 100% | Typography, color |
| Form inputs | 100% | Full input styling |
| Form textareas | 100% | Min height |
| Suffixes | 100% | Color, bg, typography |
| Switchers | 100% | Off/on/slider colors |
| Form selects | 100% | Icon size, color |
| Tabs | 100% | Full tab styling |
| Headings | 100% | Typography, color, margin |
| Repeaters | 100% | Bg, radius, padding, gap |
| Pills | 100% | Full pill styling |
| Primary button | 100% | Normal + hover states |
| Secondary button | 100% | Normal + hover states |
| Tertiary button | 100% | Normal + hover states |
| HTML structure | 100% | All Voxel classes match |
| REST API | 100% | Config endpoint |
| AJAX | 100% | Save shipping action |
| Multisite support | 100% | getRestBaseUrl() + getSiteBaseUrl() |
| normalizeConfig() | NEW | API format compatibility |
