# Advanced List Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to advanced-list frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-131)

Added comprehensive documentation header covering all Voxel advanced-list.php controls (1185 lines, "Actions VX" widget):

**REPEATER ITEM (Content Tab - ts_actions):**
- ts_action_type - Action type (18 options)
- ts_addition_id - Addition ID (for select_addition)
- ts_action_link - Link URL control
- ts_scroll_to - Section ID (for scroll_to_section)
- ts_action_cal_start_date - Event start date
- ts_action_cal_end_date - Event end date
- ts_action_cal_title - Event title
- ts_action_cal_desc - Event description
- ts_action_cal_location - Event location
- ts_action_cal_url - Event URL (ical only)
- ts_acw_initial_text - Default text
- ts_enable_tooltip - Enable tooltip switch
- ts_tooltip_text - Tooltip text
- ts_acw_initial_icon - Default icon
- ts_cart_opts_text - Select options text (add_to_cart)
- ts_cart_opts_enable_tooltip - Select options tooltip
- ts_cart_opts_tooltip_text - Select options tooltip text
- ts_cart_opts_icon - Select options icon
- ts_acw_reveal_text - Active state text
- ts_acw_enable_tooltip - Active tooltip switch
- ts_acw_tooltip_text - Active tooltip text
- ts_acw_reveal_icon - Active state icon
- ts_acw_custom_style - Custom styling switch
- ts_acw_icon_color_custom - Custom icon color
- ts_acw_icon_color_a_custom - Custom icon color (active)

**ICONS (Content Tab):**
- ts_close_ico - Close icon
- ts_message_ico - Direct message icon
- ts_link_ico - Copy link icon
- ts_share_ico - Share via icon

**LIST (Style Tab):**
- csgrid_action_on - Enable CSS grid (responsive)
- ts_cgrid_columns - Grid columns (responsive)
- ts_al_columns_no - Item width mode
- ts_al_columns_cstm - Custom item width (responsive)
- ts_al_justify - List justify (responsive)
- ts_cgrid_gap - Item gap (responsive)

**LIST ITEM - NORMAL/HOVER/ACTIVE:**
- Full styling controls for all three states
- Typography, borders, shadows, colors
- Icon container styling
- Icon styling

**TOOLTIPS:**
- tooltip_bottom - Display below item
- ts_tooltip_color - Text color
- ts_tooltip_typo - Typography
- ts_tooltip_bg - Background
- ts_tooltip_radius - Border radius

### 2. normalizeConfig() Function (lines 192-547)

Added comprehensive normalization function with 14 specialized helpers:

```typescript
function normalizeConfig(raw: Record<string, unknown>): VxConfig {
  // Base helpers
  const normalizeString = (val: unknown, fallback: string): string => {...};
  const normalizeNumber = (val: unknown, fallback: number): number => {...};
  const normalizeBoolean = (val: unknown, fallback: boolean): boolean => {...};

  // Object helpers
  const normalizeIcon = (val: unknown): IconValue | null => {...};
  const normalizeBoxValues = (val: unknown): BoxValues => {...};
  const normalizeBoxShadow = (val: unknown): BoxShadowValue => {...};
  const normalizeTypography = (val: unknown): TypographyValue => {...};
  const normalizeLinkConfig = (val: unknown): LinkConfig | null => {...};
  const normalizeActionItem = (val: unknown): ActionItem => {...};
  const normalizeItems = (val: unknown): ActionItem[] => {...};

  // Section helpers
  const normalizeIcons = (val: unknown): VxConfig['icons'] => {...};
  const normalizeList = (val: unknown): VxConfig['list'] => {...};
  const normalizeItemStyle = (val: unknown): VxConfig['itemStyle'] => {...};
  const normalizeIconContainer = (val: unknown): VxConfig['iconContainer'] => {...};
  const normalizeIconSettings = (val: unknown): VxConfig['icon'] => {...};
  const normalizeHoverStyle = (val: unknown): VxConfig['hoverStyle'] => {...};
  const normalizeActiveStyle = (val: unknown): VxConfig['activeStyle'] => {...};
  const normalizeTooltip = (val: unknown): VxConfig['tooltip'] => {...};

  return { items, icons, list, itemStyle, iconContainer, icon, hoverStyle, activeStyle, tooltip };
}
```

**Features:**
- String/Number/Boolean normalization with type coercion
- IconValue object normalization
- BoxValues (dimensions) normalization
- BoxShadowValue normalization
- TypographyValue normalization (11 properties)
- LinkConfig normalization
- ActionItem normalization (26 properties per item!)
- Items array normalization (handles both array and object formats)
- Nested section normalization for all 9 VxConfig sections
- Dual-format support (camelCase and snake_case/ts_* prefixed)
- Voxel control name support throughout
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 554-568)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  23.52 kB | gzip: 6.15 kB
Built in 92ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/advanced-list.php` (1185 lines)
- Template: `themes/voxel/templates/widgets/advanced-list.php`
- Style: `vx:action.css`
- Widget name: "Actions (VX)"

## Architecture Notes

The advanced-list block is unique because:
- **18 action types**: Most diverse action widget (link, cart, follow, edit, delete, calendar, etc.)
- **Complex repeater**: Each item has 26 properties
- **Three state styling**: Normal, hover, and active states
- **Post context dependent**: Many actions require post context from REST API
- **Tooltip support**: Built-in tooltip system with position control
- **CSS Grid option**: Supports both flexbox and CSS grid layouts
- **Calendar integration**: Google Calendar and iCalendar export support
- **Shopping cart integration**: Add to cart with select options state

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] ActionItem array normalization (26 properties each)
- [x] IconValue normalization (4 global icons)
- [x] BoxValues normalization (dimensions)
- [x] BoxShadowValue normalization
- [x] TypographyValue normalization
- [x] LinkConfig normalization
- [x] 9 VxConfig section normalizers
- [x] Dual-format support (camelCase/snake_case)
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] REST API post context fetching
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/advanced-list/frontend.tsx`
   - Added Voxel parity header (131 lines)
   - Added normalizeConfig() function (356 lines)
   - Updated parseVxConfig() to use normalizeConfig()
   - Added ActionType, LinkConfig imports

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| 18 action types | 100% | Full action type support |
| Repeater items | 100% | 26 properties per item |
| Close icon | 100% | ts_close_ico |
| Message icon | 100% | ts_message_ico |
| Link icon | 100% | ts_link_ico |
| Share icon | 100% | ts_share_ico |
| CSS grid mode | 100% | Responsive |
| Grid columns | 100% | Responsive |
| Item width | 100% | Auto/custom modes |
| List justify | 100% | 5 options |
| Item gap | 100% | Responsive |
| Item justify | 100% | Responsive |
| Item padding | 100% | Dimensions |
| Item height | 100% | Responsive |
| Item border | 100% | Full control |
| Item shadow | 100% | Group control |
| Item typography | 100% | Group control |
| Item colors | 100% | Text + background |
| Icon container | 100% | Full styling |
| Icon styling | 100% | Size, color, position |
| Hover state | 100% | 7 properties |
| Active state | 100% | 7 properties |
| Tooltips | 100% | Position, styling |
| HTML structure | 100% | All Voxel classes |
| REST API | 100% | Post context fetching |
| Multisite support | 100% | getRestBaseUrl() |
| normalizeConfig() | NEW | API format compatibility |
