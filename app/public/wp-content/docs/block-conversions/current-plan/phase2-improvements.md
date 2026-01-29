# Current Plan Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to current-plan frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-103)

Added comprehensive documentation header covering all Voxel current-plan-widget.php controls:

**ICONS (Content Tab):**
- ts_plan_ico - Plan icon
- ts_viewplan_ico - View plans icon
- ts_configure_ico - Configure icon
- ts_switch_ico - Switch plan icon
- ts_cancel_ico - Cancel icon
- ts_stripe_ico - Stripe portal icon

**PANEL STYLE (Style Tab):**
- panels_spacing - Gap between panels
- panel_border - Panel border
- panel_radius - Panel border radius (responsive box)
- panel_bg - Panel background color
- panel_shadow - Panel box shadow

**PANEL HEAD:**
- head_padding - Head padding (responsive box)
- head_ico_size - Icon size (responsive slider)
- head_ico_margin - Icon margin (responsive slider)
- head_ico_col - Icon color
- head_typo - Label typography (group control)
- head_typo_col - Label text color

**PANEL PRICING:**
- price_align - Price alignment (flex-start, center, flex-end)
- price_typo - Price typography (group control)
- price_col - Price text color
- period_typo - Period typography (group control)
- period_col - Period text color

**PANEL BODY:**
- panel_spacing - Body padding (responsive box)
- panel_gap - Gap between elements (responsive slider)
- text_align - Text alignment
- body_typo - Body typography (group control)
- body_typo_col - Body text color
- body_typo_link - Link typography (group control)
- body_col_link - Link color

**PANEL BUTTONS:**
- panel_btn_gap - Gap between buttons (responsive slider)

**SECONDARY BUTTON (Normal):**
- scnd_btn_typo - Typography (group control)
- scnd_btn_radius - Border radius (responsive box)
- scnd_btn_c - Text color
- scnd_btn_padding - Padding (responsive box)
- scnd_btn_height - Min height (responsive slider)
- scnd_btn_bg - Background color
- scnd_btn_border - Border
- scnd_btn_icon_size - Icon size (responsive slider)
- scnd_btn_icon_pad - Icon padding (responsive slider)
- scnd_btn_icon_color - Icon color

**SECONDARY BUTTON (Hover):**
- scnd_btn_c_h - Text color (hover)
- scnd_btn_bg_h - Background (hover)
- scnd_btn_border_h - Border (hover)
- scnd_btn_icon_color_h - Icon color (hover)

**HTML STRUCTURE:**
- .ts-panel - Panel container
- .ts-panel-head - Header with icon and label
- .ts-panel-body - Content area
- .ts-pricing - Price display section
- .ts-pricing-amount - Price amount
- .ts-pricing-period - Billing period
- .ts-status-message - Status text
- .ts-panel-footer - Footer with action buttons

### 2. normalizeConfig() Function (lines 123-172)

Added normalization function for API format compatibility:

```typescript
function normalizeConfig(raw: Record<string, unknown>): CurrentPlanVxConfig {
  // Helper for string normalization
  const normalizeString = (val: unknown, fallback: string): string => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return fallback;
  };

  // Helper for icon normalization
  const normalizeIcon = (val: unknown, fallback: IconValue): IconValue => {
    if (val && typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      return {
        library: normalizeString(obj.library, fallback.library),
        value: normalizeString(obj.value, fallback.value),
      };
    }
    return fallback;
  };

  return {
    planIcon, viewPlansIcon, configureIcon,
    switchIcon, cancelIcon, portalIcon
  };
}
```

**Features:**
- String normalization (handles numeric values as strings)
- Icon object normalization (library + value structure)
- Dual-format support (camelCase and snake_case)
- Voxel control name support (ts_* prefixed controls)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 187-201)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  16.64 kB | gzip: 5.43 kB
Built in 113ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/modules/paid-memberships/widgets/current-plan-widget.php` (806 lines)
- Template: `themes/voxel/app/modules/paid-memberships/templates/frontend/current-plan-widget.php`
- REST endpoint: `voxel-fse/v1/current-plan`

## Architecture Notes

The current-plan block is unique because:
- **Membership module**: Part of Voxel's paid-memberships module, not widgets directory
- **REST API integration**: Fetches dynamic membership data from server
- **Auth-dependent**: Shows different content for logged-in vs logged-out users
- **Icon-heavy**: 6 different icon controls for various states
- **Complex styling**: Panel style with head, body, pricing, and button sections
- **Stripe integration**: Links to Stripe portal for subscription management

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] Icon object normalization
- [x] Async data fetching with proper error handling
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/current-plan/frontend.tsx`
   - Added Voxel parity header (103 lines)
   - Added normalizeConfig() function (50 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Plan icon | 100% | Icon control |
| View plans icon | 100% | Icon control |
| Configure icon | 100% | Icon control |
| Switch icon | 100% | Icon control |
| Cancel icon | 100% | Icon control |
| Portal icon | 100% | Icon control |
| Panel style | 100% | Gap, border, radius, bg, shadow |
| Panel head | 100% | Padding, icon, typography |
| Panel pricing | 100% | Alignment, price/period typography |
| Panel body | 100% | Spacing, gap, typography |
| Panel buttons | 100% | Gap between buttons |
| Secondary button | 100% | Normal + hover states |
| HTML structure | 100% | All Voxel classes match |
| REST API | 100% | Dynamic plan data |
| Multisite support | 100% | getRestBaseUrl() helper |
| normalizeConfig() | NEW | API format compatibility |
