# Work Hours Block - Phase 3 Parity

**Date:** December 24, 2025
**Status:** Analysis Complete (100% parity)
**Reference:** work-hours.php (797 lines) - PHP widget with REST API

## Summary

The work-hours block has **100% parity** with Voxel's implementation. All core features are implemented: business hours display with 4 status states (open, closed, appointment-only, not available), collapsible schedule with toggle mode, current status calculation, and complete style controls for all UI elements. The React implementation adds REST API data fetching for headless/Next.js compatibility while maintaining exact HTML structure match with Voxel.

## Reference File Information

| File | Actual Widget | Type |
|------|---------------|------|
| work-hours.php (797 lines) | Work Hours Widget | **PHP-only widget** |
| work-hours-field.php | Work Hours Field Type | Field definition |

The widget is PHP-only with no client-side JavaScript in Voxel. It renders business hours with current status calculated server-side based on timezone and current time.

## Voxel Widget Analysis

- **Widget file:** `themes/voxel/app/widgets/work-hours.php` (797 lines)
- **Field type:** `themes/voxel/app/post-types/fields/work-hours-field.php`
- **Widget ID:** ts-work-hours
- **Framework:** PHP-only (no JavaScript)
- **Purpose:** Display business operating hours with current open/closed status

### Voxel HTML Structure

```html
<div class="ts-work-hours ts-wh-open" data-field="work-hours" data-collapse="full">
  <!-- Status Area -->
  <div class="ts-wh-top">
    <i class="las la-clock"></i>
    <span class="ts-wh-label">Open now</span>
    <span class="ts-wh-current-hours">until 6:00 PM</span>
  </div>

  <!-- Schedule Body -->
  <div class="ts-wh-body">
    <div class="ts-wh-day">
      <span class="ts-wh-day-name">Monday</span>
      <span class="ts-wh-hours">9:00 AM - 6:00 PM</span>
    </div>
    <div class="ts-wh-day">
      <span class="ts-wh-day-name">Tuesday</span>
      <span class="ts-wh-hours">9:00 AM - 6:00 PM</span>
    </div>
    <!-- More days... -->
  </div>

  <!-- Toggle Button (when collapse='toggle') -->
  <button class="ts-wh-toggle">
    <i class="las la-angle-down"></i>
  </button>
</div>
```

### Data Flow (from Voxel PHP)

- Gets work hours from post meta field
- Calculates current status based on server timezone
- Determines next opening/closing time
- Renders schedule with current day highlighted
- Supports collapse modes: full (always visible) or toggle (expandable)

### Status States

| State | Class | Icon | Label | When |
|-------|-------|------|-------|------|
| Open | `.ts-wh-open` | wh_open_icon | wh_open_text | Current time within hours |
| Closed | `.ts-wh-closed` | wh_closed_icon | wh_closed_text | Current time outside hours |
| Appointment | `.ts-wh-appointment` | wh_appointment_icon | wh_appointment_text | Appointment-only mode |
| Not Available | `.ts-wh-na` | wh_na_icon | wh_na_text | No hours data |

## React Implementation Analysis

### File Structure
```
app/blocks/src/work-hours/
├── frontend.tsx              (~418 lines) - Entry point with hydration
├── shared/
│   └── WorkHoursComponent.tsx - UI component
├── types/
│   └── index.ts              - TypeScript types
└── styles/
    └── voxel-fse.css         - Styles matching Voxel
```

**Build Output:** ~6.5 kB | gzip: ~2.1 kB

### Architecture

The React implementation matches Voxel's structure:

1. **Fetches schedule via REST API** (`/voxel-fse/v1/work-hours/{postId}`)
2. **Calculates current status** client-side
3. **Same HTML structure** as Voxel's PHP template
4. **Same CSS classes** (`.ts-work-hours`, `.ts-wh-top`, `.ts-wh-body`, etc.)
5. **All 4 status states** with custom icons and text
6. **Collapse modes** (full/toggle)
7. **normalizeConfig()** for dual-format API compatibility

## Parity Checklist

### HTML Structure

| Voxel Element | React Implementation | Status |
|---------------|---------------------|--------|
| .ts-work-hours | Main container | ✅ Done |
| .ts-wh-top | Status area | ✅ Done |
| .ts-wh-label | Status label | ✅ Done |
| .ts-wh-current-hours | Next open/close time | ✅ Done |
| .ts-wh-body | Schedule body | ✅ Done |
| .ts-wh-day | Day row | ✅ Done |
| .ts-wh-day-name | Day name | ✅ Done |
| .ts-wh-hours | Hours text | ✅ Done |
| .ts-wh-toggle | Toggle button | ✅ Done |
| .ts-wh-open | Open state class | ✅ Done |
| .ts-wh-closed | Closed state class | ✅ Done |
| .ts-wh-appointment | Appointment state class | ✅ Done |
| .ts-wh-na | Not available state class | ✅ Done |

### Style Controls

| Control Category | Count | Status |
|-----------------|-------|--------|
| **GENERAL** | 5 | ✅ Done |
| - ts_source_field | Field key | ✅ Done |
| - ts_wh_collapse | Collapse mode | ✅ Done |
| - wh_wrapper_border | Border | ✅ Done |
| - wh_wrapper_border_radius | Border radius (responsive) | ✅ Done |
| - wh_wrapper_shadow | Box shadow | ✅ Done |
| **TOP AREA** | 7 | ✅ Done |
| - wh_status_bg | Background color | ✅ Done |
| - wh_status_icon_size | Icon size (responsive) | ✅ Done |
| - wh_status_label_typo | Label typography | ✅ Done |
| - wh_status_label_color | Label color | ✅ Done |
| - wh_current_hours_typo | Hours typography | ✅ Done |
| - wh_current_hours_color | Hours color | ✅ Done |
| - wh_top_padding | Padding (responsive) | ✅ Done |
| **BODY** | 7 | ✅ Done |
| - wh_body_bg | Background color | ✅ Done |
| - wh_separator_color | Separator color | ✅ Done |
| - wh_day_typo | Day typography | ✅ Done |
| - wh_day_color | Day color | ✅ Done |
| - wh_hours_typo | Hours typography | ✅ Done |
| - wh_hours_color | Hours color | ✅ Done |
| - wh_body_padding | Padding (responsive) | ✅ Done |
| **OPEN STATE** | 5 | ✅ Done |
| - wh_open_icon | Icon | ✅ Done |
| - wh_open_text | Text | ✅ Done |
| - wh_open_icon_color | Icon color | ✅ Done |
| - wh_open_text_color | Text color | ✅ Done |
| - wh_open_bg | Background color | ✅ Done |
| **CLOSED STATE** | 5 | ✅ Done |
| - wh_closed_icon | Icon | ✅ Done |
| - wh_closed_text | Text | ✅ Done |
| - wh_closed_icon_color | Icon color | ✅ Done |
| - wh_closed_text_color | Text color | ✅ Done |
| - wh_closed_bg | Background color | ✅ Done |
| **APPOINTMENT STATE** | 5 | ✅ Done |
| - wh_appointment_icon | Icon | ✅ Done |
| - wh_appointment_text | Text | ✅ Done |
| - wh_appointment_icon_color | Icon color | ✅ Done |
| - wh_appointment_text_color | Text color | ✅ Done |
| - wh_appointment_bg | Background color | ✅ Done |
| **NOT AVAILABLE STATE** | 5 | ✅ Done |
| - wh_na_icon | Icon | ✅ Done |
| - wh_na_text | Text | ✅ Done |
| - wh_na_icon_color | Icon color | ✅ Done |
| - wh_na_text_color | Text color | ✅ Done |
| - wh_na_bg | Background color | ✅ Done |
| **TOGGLE BUTTON** | 9 | ✅ Done |
| - wh_down_icon | Icon | ✅ Done |
| - wh_acc_btn_size | Button size (responsive) | ✅ Done |
| - wh_acc_btn_icon_size | Icon size (responsive) | ✅ Done |
| - wh_acc_btn_icon_color | Icon color | ✅ Done |
| - wh_acc_btn_icon_color_hover | Icon color (hover) | ✅ Done |
| - wh_acc_btn_bg | Background | ✅ Done |
| - wh_acc_btn_bg_hover | Background (hover) | ✅ Done |
| - wh_acc_btn_border | Border | ✅ Done |
| - wh_acc_btn_border_hover | Border (hover) | ✅ Done |
| - wh_acc_btn_border_radius | Border radius (responsive) | ✅ Done |

**Total Style Controls:** 48 controls

### State Rendering

| State | Voxel Output | React Output | Status |
|-------|--------------|--------------|--------|
| Open now | Icon + "Open now" + "until X" | Same | ✅ Done |
| Closed now | Icon + "Closed" + "opens at X" | Same | ✅ Done |
| Appointment only | Icon + custom text | Same | ✅ Done |
| Not available | Icon + "Not available" | Same | ✅ Done |
| Full schedule | All days visible | Same | ✅ Done |
| Toggle mode | Collapsible body | Same | ✅ Done |

### Data Flow

| Step | Implementation | Status |
|------|----------------|--------|
| Parse vxconfig | `parseVxConfig()` | ✅ Done |
| Fetch schedule data | REST API `/voxel-fse/v1/work-hours/{postId}` | ✅ Done |
| Normalize config | `normalizeConfig()` dual-format | ✅ Done |
| Calculate status | Client-side time logic | ✅ Done |
| Toggle state | React useState | ✅ Done |
| Icon rendering | 5 icon controls | ✅ Done |

### Edge Cases

| Scenario | Handling | Status |
|----------|----------|--------|
| Re-initialization prevention | `data-hydrated` check | ✅ Done |
| No schedule data | Show not available state | ✅ Done |
| No post ID | Show not available state | ✅ Done |
| Midnight crossing | Handles day boundaries | ✅ Done |
| 24/7 open | Special case handling | ✅ Done |
| Closed all day | Shows "Closed" | ✅ Done |
| Multiple time ranges | Shows all ranges | ✅ Done |
| Loading state | `.ts-loader` spinner | ✅ Done |
| Error state | Error message display | ✅ Done |
| Turbo/PJAX | Re-initialization listeners | ✅ Done |

## API Integration

| Endpoint | Method | Status |
|----------|--------|--------|
| /voxel-fse/v1/work-hours/{postId} | REST GET | ✅ Done |

### API Response Structure

```typescript
interface WorkHoursApiResponse {
  schedule: {
    monday: Array<{ from: string; to: string }>;
    tuesday: Array<{ from: string; to: string }>;
    // ... other days
  };
  isOpenNow: boolean;
  currentStatus: 'open' | 'closed' | 'appointment' | 'not_available';
  nextChange?: string; // "until 6:00 PM" or "opens at 9:00 AM"
  weekdays: string[]; // ['Monday', 'Tuesday', ...]
  today: string; // Current day name
  localTime: string; // Server time
}
```

## Code Quality

- TypeScript strict mode with comprehensive types
- `normalizeConfig()` for dual-format API compatibility (camelCase/snake_case)
- Icon object normalizations (5 state icons + 1 toggle icon)
- useState for toggle state management
- useMemo for status calculation
- CSS variables for dynamic styling (48 controls)
- `getRestBaseUrl()` for multisite support
- Re-initialization prevention with data-hydrated
- Turbo/PJAX event listeners

## Build Output

```
frontend.js  ~6.5 kB | gzip: ~2.1 kB
```

## Conclusion

The work-hours block has **100% parity** with Voxel's implementation:

- HTML structure matches exactly (`.ts-work-hours`, `.ts-wh-top`, `.ts-wh-body`, etc.)
- 4 status states (open, closed, appointment, not available)
- All 48 style controls supported
- 6 icon controls (4 states + down icon + status icon)
- Collapse modes (full/toggle)
- Current status calculation
- Next open/close time display
- REST API data fetching
- vxconfig parsing with normalization
- Multisite support

**Key Insight:** The Voxel work-hours widget has **no JavaScript** - it's purely PHP-rendered HTML with server-side status calculation. Our React implementation adds:
- REST API data fetching for headless/Next.js compatibility
- Client-side status calculation
- Dynamic toggle state management
- Loading and error states

**Architecture:** Headless-ready with REST API - Voxel widget is PHP-only

