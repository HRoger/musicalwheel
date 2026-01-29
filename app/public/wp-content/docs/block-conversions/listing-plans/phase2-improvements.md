# Listing Plans Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to listing-plans frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-187)

Added comprehensive documentation header covering all Voxel listing-plans-widget.php controls (1856 lines, "Listing plans VX" widget):

**PRICE GROUPS (Content Tab):**
- ts_price_groups - Price groups repeater
  - group_label - Group label text
  - prices - Multi-select for plans

**GENERAL (Style Tab):**
- plans_columns - Number of columns (responsive)
- pplans_gap - Item gap (responsive slider)
- pplans_border - Border (group control)
- pplans_radius - Border radius (responsive slider)
- pplans_bg - Background color
- pplans_shadow - Box shadow (group control)

**PLAN BODY:**
- pplans_spacing - Body padding (responsive slider)
- panel_gap - Body content gap (responsive slider)

**PLAN IMAGE:**
- plan_img_pad - Image padding (dimensions)
- plan_img_max - Image height (responsive slider)

**PLAN PRICING:**
- pricing_align - Align (left/center/right)
- price_typo - Price typography (group control)
- price_col - Price text color
- period_typo - Period typography (group control)
- period_col - Period text color

**PLAN NAME:**
- content_align - Align content
- name_typo - Name typography (group control)
- name_col - Name text color

**PLAN DESCRIPTION:**
- desc_align - Text align
- desc_typo - Typography (group control)
- desc_col - Color

**PLAN FEATURES:**
- list_align - Align content
- list_gap - Item gap (responsive slider)
- list_typo - Typography (group control)
- list_col - Color
- list_ico_col - Icon color
- list_ico_size - Icon size (responsive slider)
- list_ico_right_pad - Icon right padding (responsive slider)

**FEATURED PLAN:**
- featured_border - Border (group control)
- featured_shadow - Box shadow (group control)
- featured_badge_color - Badge color
- badge_text - Badge typography (group control)

**TABS - NORMAL:**
- pltabs_disable - Disable tabs (switcher)
- pltabs_justify - Justify (5 options)
- pltabs_padding - Padding (dimensions)
- pltabs_margin - Margin (dimensions)
- pltabs_text - Tab typography (group control)
- pltabs_active - Active tab typography (group control)
- pltabs_text_color - Text color
- pltabs_active_text_color - Active text color
- pltabs_bg_color - Background
- pltabs_bg_active_color - Active background
- pltabs_border - Border (group control)
- pltabs_border_active - Active border color
- pltabs_radius - Border radius

**TABS - HOVER:**
- pltabs_text_color_h - Text color hover
- pltabs_active_text_color_h - Active text color hover
- pltabs_border_color_h - Border color hover
- pltabs_border_h_active - Active border color hover
- pltabs_bg_color_h - Background hover
- pltabs_active_color_h - Active background hover

**PRIMARY BUTTON - NORMAL:**
- primary_btn_typo - Typography (group control)
- primary_btn_radius - Border radius (responsive slider)
- primary_btn_c - Text color
- primary_btn_padding - Padding (dimensions)
- primary_btn_height - Height (responsive slider)
- primary_btn_bg - Background color
- primary_btn_border - Border (group control)
- primary_btn_icon_size - Icon size (responsive slider)
- primary_btn_icon_pad - Text/Icon spacing (responsive slider)
- primary_btn_icon_color - Icon color

**PRIMARY BUTTON - HOVER:**
- primary_btn_c_h - Text color hover
- primary_btn_bg_h - Background color hover
- primary_btn_border_h - Border color hover
- primary_btn_icon_color_h - Icon color hover

**SECONDARY BUTTON - NORMAL:**
- scnd_btn_typo - Typography (group control)
- scnd_btn_radius - Border radius (responsive slider)
- scnd_btn_c - Text color
- scnd_btn_padding - Padding (dimensions)
- scnd_btn_height - Height (responsive slider)
- scnd_btn_bg - Background color
- scnd_btn_border - Border (group control)
- scnd_btn_icon_size - Icon size (responsive slider)
- scnd_btn_icon_pad - Text/Icon spacing (responsive slider)
- scnd_btn_icon_color - Icon color

**SECONDARY BUTTON - HOVER:**
- scnd_btn_c_h - Text color hover
- scnd_btn_bg_h - Background color hover
- scnd_btn_border_h - Border color hover
- scnd_btn_icon_color_h - Icon color hover

**DIALOG:**
- ts_dialog_color - Text color
- ts_dialog_typo - Typography (group control)
- ts_dialog_bg - Background color
- ts_dialog_radius - Border radius (responsive slider)
- ts_dialog_shadow - Box shadow (group control)
- ts_dialog_border - Border (group control)

**ICONS:**
- ts_arrow_right - Right arrow icon

**PER-PLAN CONFIGURATION:**
- ts_plan__{key}__image - Plan image
- ts_plan__{key}__features - Plan features repeater
  - text - Feature text
  - feature_ico - Feature icon
- ts_plan__{key}__featured - Mark as featured (switcher)
- ts_plan__{key}__featured_text - Featured badge text

**REDIRECT OPTIONS:**
- ts_direct_purchase_flow - Direct purchase redirect (order/new_post/custom)
- ts_direct_purchase_flow_post_type - Post type for new_post flow
- ts_direct_purchase_flow_custom_redirect - Custom redirect URL

### 2. normalizeConfig() Function (lines 215-382)

Added normalization function with 8 specialized helper functions:

```typescript
function normalizeConfig(raw: Record<string, unknown>): ListingPlansVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {...};

  // Helper for number normalization
  const normalizeNumber = (val: unknown, fallback: number): number => {...};

  // Helper for boolean normalization
  const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {...};

  // Helper for IconValue normalization
  const normalizeIcon = (val: unknown): IconValue => {...};

  // Helper for PlanFeature normalization
  const normalizeFeature = (val: unknown): PlanFeature => {...};

  // Helper for PlanConfig normalization
  const normalizePlanConfig = (val: unknown): PlanConfig => {...};

  // Helper for PriceGroup normalization
  const normalizePriceGroup = (val: unknown): PriceGroup => {...};

  // Helper for style object normalization
  const normalizeStyle = (val: unknown): ListingPlansVxConfig['style'] => {...};

  return { priceGroups, planConfigs, arrowIcon, style };
}
```

**Features:**
- String/Number/Boolean normalization with type coercion
- IconValue normalization (library, value)
- PlanFeature normalization (text, icon)
- PlanConfig normalization (image, features array)
- PriceGroup normalization (id, label, prices array)
- Style object normalization (10 properties)
- Responsive column properties (tablet/mobile)
- Dual-format support (camelCase, snake_case, ts_* prefixed)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 392-410)

Modified to use normalizeConfig() for consistent format handling.

### 4. Added Type Imports

Added IconValue, PriceGroup, PlanConfig, PlanFeature to imports for normalizeConfig().

## Build Output

```
frontend.js  19.49 kB | gzip: 6.45 kB
Built in 146ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/modules/paid-listings/widgets/listing-plans-widget.php` (1856 lines)
- Template: `themes/voxel/app/modules/paid-listings/templates/frontend/listing-plans-widget.php`
- Script: `vx:listing-plans-widget.js`
- Style: `vx:pricing-plan.css`
- Widget name: "Listing plans (VX)"

## Architecture Notes

The listing-plans block is unique because:
- **Paid listings module**: Part of Voxel's paid listing package system
- **Price groups**: Supports tabs for grouping prices/plans
- **Per-plan configuration**: Each plan has custom image, features, and featured badge
- **Featured plans**: Can mark plans as "featured" with badge styling
- **Redirect options**: Configurable redirect after purchase (order page, new post, custom URL)
- **Multiple purchase flows**: Supports new, relist, switch, and claim processes
- **Package tracking**: Tracks available packages and used submissions
- **Repeat purchase control**: Can disable repeat purchases per plan

## Next.js Readiness Checklist

- [x] normalizeConfig() handles vxconfig format
- [x] PriceGroup normalization (id, label, prices)
- [x] PlanConfig normalization (image, features)
- [x] PlanFeature normalization (text, icon)
- [x] IconValue normalization (library, value)
- [x] Style object normalization (10 properties)
- [x] Responsive properties support (tablet/mobile)
- [x] Dual-format support (camelCase/snake_case/ts_*)
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] REST API data fetching with auth
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/listing-plans/frontend.tsx`
   - Added Voxel parity header (187 lines)
   - Added normalizeConfig() function (168 lines)
   - Updated parseVxConfig() to use normalizeConfig()
   - Added IconValue, PriceGroup, PlanConfig, PlanFeature imports

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Price groups | 100% | Repeater with label and prices |
| Plans columns | 100% | Responsive slider |
| Item gap | 100% | Responsive slider |
| Border styling | 100% | Group control |
| Border radius | 100% | Responsive slider |
| Background color | 100% | Color picker |
| Box shadow | 100% | Group control |
| Body padding | 100% | Responsive slider |
| Body content gap | 100% | Responsive slider |
| Image padding | 100% | Dimensions |
| Image height | 100% | Responsive slider |
| Pricing align | 100% | 3 options |
| Price typography | 100% | Group control |
| Price color | 100% | Color picker |
| Period typography | 100% | Group control |
| Period color | 100% | Color picker |
| Name align | 100% | 3 options |
| Name typography | 100% | Group control |
| Name color | 100% | Color picker |
| Description align | 100% | 3 options |
| Description typography | 100% | Group control |
| Description color | 100% | Color picker |
| List align | 100% | 3 options |
| List gap | 100% | Responsive slider |
| List typography | 100% | Group control |
| List color | 100% | Color picker |
| List icon color | 100% | Color picker |
| List icon size | 100% | Responsive slider |
| List icon padding | 100% | Responsive slider |
| Featured border | 100% | Group control |
| Featured shadow | 100% | Group control |
| Featured badge color | 100% | Color picker |
| Badge typography | 100% | Group control |
| Tabs disabled | 100% | Switcher |
| Tabs justify | 100% | 5 options |
| Tabs padding | 100% | Dimensions |
| Tabs margin | 100% | Dimensions |
| Tabs typography | 100% | Normal + active |
| Tabs colors | 100% | Text + background |
| Tabs border | 100% | Group control |
| Tabs radius | 100% | Slider |
| Tabs hover states | 100% | 6 properties |
| Primary button | 100% | Full styling |
| Primary button hover | 100% | 4 properties |
| Secondary button | 100% | Full styling |
| Secondary button hover | 100% | 4 properties |
| Dialog styling | 100% | 6 properties |
| Arrow icon | 100% | Icon selector |
| Per-plan image | 100% | Media control |
| Per-plan features | 100% | Repeater |
| Featured badge | 100% | Switcher + text |
| Redirect options | 100% | 3 flow types |
| HTML structure | 100% | All Voxel classes |
| REST API | 100% | Authenticated endpoint |
| Multisite support | 100% | getRestBaseUrl() |
| normalizeConfig() | NEW | API format compatibility |
