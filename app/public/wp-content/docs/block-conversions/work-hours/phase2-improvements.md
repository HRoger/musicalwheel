# Work Hours Block - Phase 2 Improvements

**Date:** December 23, 2025
**Status:** Complete (100%)

## Summary

Added comprehensive Voxel parity header and normalizeConfig() function to work-hours frontend.tsx for Next.js/headless readiness.

## Changes Made

### 1. Voxel Parity Header (frontend.tsx lines 1-114)

Added comprehensive documentation header covering all Voxel work-hours.php controls:

**GENERAL:**
- ts_source_field - Work hours field key (voxel-post-field control)
- ts_wh_collapse - Collapse mode (full, toggle)
- wh_wrapper_border - Wrapper border
- wh_wrapper_border_radius - Border radius (responsive box)
- wh_wrapper_shadow - Box shadow

**TOP AREA:**
- wh_status_bg - Status background color
- wh_status_icon_size - Status icon size (responsive)
- wh_status_label_typo - Label typography
- wh_status_label_color - Label text color
- wh_current_hours_typo - Current hours typography
- wh_current_hours_color - Current hours text color
- wh_top_padding - Top area padding (responsive box)

**BODY:**
- wh_body_bg - Body background color
- wh_separator_color - Day separator color
- wh_day_typo - Day name typography
- wh_day_color - Day name text color
- wh_hours_typo - Hours typography
- wh_hours_color - Hours text color
- wh_body_padding - Body padding (responsive box)

**OPEN STATE:**
- wh_open_icon - Open state icon
- wh_open_text - Open state text (default: "Open now")
- wh_open_icon_color - Icon color
- wh_open_text_color - Text color
- wh_open_bg - Background color

**CLOSED STATE:**
- wh_closed_icon - Closed state icon
- wh_closed_text - Closed state text (default: "Closed now")
- wh_closed_icon_color - Icon color
- wh_closed_text_color - Text color
- wh_closed_bg - Background color

**APPOINTMENT ONLY STATE:**
- wh_appointment_icon - Appointment only icon
- wh_appointment_text - Appointment text (default: "By appointment only")
- wh_appointment_icon_color - Icon color
- wh_appointment_text_color - Text color
- wh_appointment_bg - Background color

**NOT AVAILABLE STATE:**
- wh_na_icon - Not available icon
- wh_na_text - Not available text
- wh_na_icon_color - Icon color
- wh_na_text_color - Text color
- wh_na_bg - Background color

**ICONS:**
- wh_down_icon - Dropdown/toggle icon

**ACCORDION BUTTON:**
- wh_acc_btn_size - Button size (responsive)
- wh_acc_btn_icon_size - Button icon size (responsive)
- wh_acc_btn_icon_color - Icon color (normal)
- wh_acc_btn_icon_color_hover - Icon color (hover)
- wh_acc_btn_bg - Background color (normal)
- wh_acc_btn_bg_hover - Background color (hover)
- wh_acc_btn_border - Border (normal)
- wh_acc_btn_border_hover - Border (hover)
- wh_acc_btn_border_radius - Border radius (responsive box)

**HTML STRUCTURE:**
- .ts-work-hours - Main container
- .ts-wh-top - Status area (icon + label + current hours)
- .ts-wh-body - Schedule body (day rows)
- .ts-wh-day - Day row container
- .ts-wh-day-name - Day name text
- .ts-wh-hours - Hours text
- .ts-wh-toggle - Toggle button (when collapse='toggle')
- .ts-wh-open / .ts-wh-closed - State classes

### 2. normalizeConfig() Function (lines 133-224)

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

  // Helper for boolean normalization
  const normalizeBool = (val: unknown, fallback: boolean): boolean => {
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1' || val === 1 || val === 'yes') return true;
    if (val === 'false' || val === '0' || val === 0 || val === 'no' || val === '') return false;
    return fallback;
  };

  // Normalize attributes object with all styling properties...
  return { attributes, postId, fieldKey };
}
```

**Features:**
- String normalization (handles numeric IDs as strings)
- Number normalization (string to int parsing)
- Boolean normalization (handles various truthy/falsy values)
- Comprehensive attribute normalization (40+ properties)
- Dual-format support (camelCase and snake_case)
- Voxel control name support (wh_* prefixed controls)
- Next.js/headless architecture ready

### 3. Updated parseVxConfig() (lines 226-242)

Modified to use normalizeConfig() for consistent format handling.

## Build Output

```
frontend.js  11.07 kB │ gzip: 3.68 kB
Built in 111ms
```

## Voxel Reference

- Reference file: `themes/voxel/app/widgets/work-hours.php` (797 lines)
- Field type: `themes/voxel/app/post-types/fields/work-hours-field.php`
- REST endpoint: `voxel-fse/v1/work-hours/{postId}`

## Architecture Notes

The work-hours block is unique because:
- **Comprehensive widget**: 797 lines with 40+ Elementor controls
- **Four status states**: Open, Closed, Appointment only, Not available
- **Two collapse modes**: Full (always expanded) and Toggle (accordion)
- **REST API integration**: Fetches dynamic schedule data from server
- **Real-time status**: Calculates isOpenNow based on current time

## Next.js Readiness Checklist

- [x] normalizeConfig() handles both vxconfig and REST API formats
- [x] Async data fetching with proper error handling
- [x] TypeScript strict mode
- [x] React hydration pattern
- [x] Multisite support via getRestBaseUrl()

## Files Modified

1. `app/blocks/src/work-hours/frontend.tsx`
   - Added Voxel parity header (114 lines)
   - Added normalizeConfig() function (92 lines)
   - Updated parseVxConfig() to use normalizeConfig()

## Parity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Source field | 100% | voxel-post-field control |
| Collapse mode | 100% | full/toggle options |
| Wrapper styling | 100% | Border, radius, shadow |
| Top area | 100% | Background, icon, label, hours, padding |
| Body | 100% | Background, separator, typography, padding |
| Open state | 100% | Icon, text, colors |
| Closed state | 100% | Icon, text, colors |
| Appointment state | 100% | Icon, text, colors |
| Not available state | 100% | Icon, text, colors |
| Accordion button | 100% | Size, icon, colors, border, hover |
| HTML structure | 100% | All Voxel classes match |
| REST API | 100% | Dynamic schedule data |
| Multisite support | 100% | getRestBaseUrl() helper |
| normalizeConfig() | NEW | API format compatibility |
