# Phase C Advanced Features - Discovery Summary

**Date:** November 24, 2025  
**Status:** ✅ Discovery Complete | ✅ Switcher Fixed | ⏳ Implementation Pending

---

## Executive Summary

**What Was Done:**
1. ✅ **Full Discovery Completed** - Evidence-based analysis of all Phase C features
2. ✅ **Critical Issue Fixed** - Removed broken custom switcher CSS
3. ✅ **Comprehensive Documentation** - Created detailed implementation guide
4. ⏳ **Ready for Implementation** - Awaiting approval to proceed with 1:1 Voxel matching

---

## Discovery Findings

### Feature 1: Date Picker (Pikaday)

**Evidence Source:** `app/public/wp-content/themes/voxel/assets/dist/auth.js:1`

**Key Findings:**
- Voxel uses **Pikaday 1.8.15** library
- **Inline rendering** with `bound: false` (NOT popup)
- Immediate `onSelect` callback (no separate save button for calendar)
- `selectDayFn` for highlighting selected date
- Cleanup with 200ms delay on unmount

**Implementation Requirements:**
```typescript
new Pikaday({
  field: inputRef,
  container: calendarRef,
  bound: false,              // ← CRITICAL: Inline rendering
  firstDay: 1,               // ← Monday as first day
  keyboardInput: false,      // ← No manual typing
  defaultDate: selectedDate,
  onSelect: (date) => onChange(date),
  selectDayFn: (date) => isSelected(date)
})
```

---

### Feature 2: Form Popup System

**Evidence Sources:**
- `app/public/wp-content/themes/voxel/templates/widgets/create-post/components/form-group.php`
- `app/public/wp-content/themes/voxel/templates/widgets/create-post/components/form-popup.php`

**Key Findings:**
- **Two-component system**: `<form-group>` (state manager) + `<form-popup>` (UI)
- Uses `<teleport to="body">` (React equivalent: `createPortal`)
- **Auto-positioning**: Below target by default, flips above if insufficient space
- **Event handling**: `@mousedown` stops propagation to prevent blur
- **Scroll/Resize listening**: Repositions on window scroll/resize
- Save/Clear buttons in popup footer

**React Implementation Pattern:**
```tsx
<FormGroup popupId="unique-id">
  <input onFocus={() => openPopup()} />
  
  {createPortal(
    <FormPopup
      target={inputRef}
      onSave={handleSave}
      onClear={handleClear}
    >
      {/* Popup content */}
    </FormPopup>,
    document.body
  )}
</FormGroup>
```

---

### Feature 3: Map Integration

**Evidence Sources:**
- `app/public/wp-content/themes/voxel/templates/widgets/create-post/location-field.php`
- `app/public/wp-content/themes/voxel/assets/dist/google-maps.js`
- `app/public/wp-content/themes/voxel/assets/dist/mapbox.js`

**Key Findings:**
- Voxel abstracts maps behind `Voxel.Maps.*` API
- **Both Google Maps AND Mapbox** provide same interface
- Switcher toggle for "map picker" mode
- Map container class: `location-field-map`
- Lat/Lng inputs (shown when map picker active)
- Hidden marker template with `map-marker` class

**CRITICAL: Switcher HTML (DO NOT ADD CUSTOM CSS)**
```html
<div class="switch-slider">
  <div class="onoffswitch">
    <input type="checkbox" class="onoffswitch-checkbox">
    <label class="onoffswitch-label"></label>
  </div>
</div>
```

**Why no custom CSS?**
- Voxel relies on browser defaults OR dynamically-generated Elementor styles
- NO explicit switcher CSS in create-post context
- Adding custom CSS breaks the layout

**Recommended Implementation:**
- Use **Leaflet + OpenStreetMap** (no API keys required)
- Match Voxel's HTML structure exactly
- NO custom switcher styles

---

### Feature 4: Media Library

**Evidence Sources:**
- `app/public/wp-content/themes/voxel/templates/widgets/create-post/file-field.php`
- `app/public/wp-content/themes/voxel/templates/widgets/create-post/_media-popup.php`
- `app/public/wp-content/themes/voxel/app/controllers/frontend/media-library-controller.php`

**CRITICAL Finding: Custom Media Library (NOT wp.media!)**

Voxel uses a **custom AJAX-based media library**, NOT WordPress's `wp.media` API.

**AJAX Endpoint:**
```
Action: voxel_ajax_list_media
Method: GET
Parameters:
  - offset (int): Pagination offset
  - search (string): Search term (optional)
  
Response:
{
  "success": true,
  "data": [
    {
      "source": "existing",
      "id": 123,
      "name": "filename.jpg",
      "type": "image/jpeg",
      "preview": "https://...",
      "is_private": false
    }
  ],
  "has_more": true
}
```

**Per Page:** 9 items  
**Search:** Full-text on post_title + MIME type filtering

**Key Features:**
- Drag-and-drop upload
- Sortable file list (using `draggable` component)
- File preview with `background-image`
- Session files + library files
- Multiple selection
- Load more pagination

**Implementation Pattern:**
```tsx
const fetchMedia = async (offset: number, search: string) => {
  const params = new URLSearchParams({
    action: 'voxel_ajax_list_media',
    offset: offset.toString(),
    ...(search && { search })
  });
  
  const response = await fetch(`/wp-admin/admin-ajax.php?${params}`, {
    credentials: 'include'
  });
  
  return response.json();
};
```

---

### Feature 5: Timezone Popup

**Evidence Source:** `app/public/wp-content/themes/voxel/templates/widgets/create-post/timezone-field.php`

**Key Findings:**
- Uses `<form-group>` and `<form-popup>` system (same as Feature 2)
- Readonly input that opens popup on click
- Search functionality with real-time filtering
- **Grouped timezones** by region (e.g., "America", "Europe", "Asia")
- Save/Clear buttons from popup

**Implementation:**
- Reuse `FormGroup` and `FormPopup` components from Feature 2
- Filter timezone list based on search term
- Group by region with headers

---

## Critical Issue Fixed

### Problem: Broken Switcher Layout

**Cause:**
- Custom CSS added for `.onoffswitch`, `.switch-slider`, `.onoffswitch-label`
- Conflicted with Voxel's implicit styling (browser defaults or Elementor dynamic styles)
- Broke the switcher toggle layout in LocationField

**Solution:**
- ✅ **Removed all custom switcher CSS** from `create-post/style.css`
- Uses Voxel's existing styling approach
- Matches Voxel's exact HTML structure

**Lesson Learned:**
- **NEVER add custom CSS without verifying Voxel doesn't handle it implicitly**
- Some components rely on browser defaults or dynamic styles
- Discovery MUST include checking for CSS conflicts

---

## Documentation Created

### 1. Comprehensive Discovery Document

**File:** `app/public/wp-content/docs/conversions/create-post/discovery-phase-c-advanced-features.md`

**Contents:**
- Evidence from Voxel theme code (file paths + line numbers)
- Exact HTML structures
- JavaScript implementation details
- Pikaday configuration
- Form popup system (form-group + form-popup)
- Voxel.Maps abstraction
- Custom media library AJAX API
- Timezone popup structure
- React implementation plans for each feature

**Key Sections:**
- Feature 1: Interactive Date Picker Calendar
- Feature 2: Form Popup System (Select, Taxonomy, Timezone)
- Feature 3: Full Map Integration (Location Field)
- Feature 4: WordPress Media Library Integration
- Feature 5: Timezone Popup with Search

Each section includes:
- Voxel evidence (file paths, code snippets)
- HTML structure
- JavaScript/Vue implementation
- CSS classes
- React implementation plan
- Critical notes and warnings

---

## Next Steps

### Option A: Proceed with Full Re-Implementation (Recommended)

**Tasks:**
1. Rollback all Phase C implementations
2. Re-implement each feature following discovery documentation
3. Ensure 1:1 Voxel matching (HTML, CSS, JS behavior)
4. Test each feature individually
5. Build and verify compilation

**Timeline:** ~3-4 hours of focused work

### Option B: Incremental Fixes

**Tasks:**
1. Fix DatePicker to match Voxel (bound: false, exact config)
2. Verify FormPopup positioning logic matches Voxel
3. Update MapPicker to use correct HTML structure
4. Update MediaLibrary to use voxel_ajax_list_media endpoint
5. Verify TimezoneField follows form-group pattern

**Timeline:** ~2-3 hours

### Option C: Pause and Review

**Tasks:**
1. User reviews discovery documentation
2. Approve implementation approach
3. Schedule re-implementation session

---

## Key Learnings

### What Went Wrong Initially

1. ❌ **No Discovery** - Started implementing without studying Voxel's actual code
2. ❌ **Assumptions** - Assumed Pikaday would be a popup (it's inline)
3. ❌ **Generic CSS** - Added custom switcher CSS without checking Voxel
4. ❌ **Wrong API** - Almost used `wp.media` instead of Voxel's custom system

### What's Different Now

1. ✅ **Evidence-Based** - Every claim backed by Voxel code
2. ✅ **Exact Structures** - HTML/CSS/JS patterns documented
3. ✅ **API Verification** - Confirmed custom media library endpoint
4. ✅ **Conflict Prevention** - Identified switcher CSS issue
5. ✅ **Implementation Plans** - React patterns ready for each feature

---

## Success Criteria for Re-Implementation

### Feature Checklist

**Date Picker:**
- [ ] Uses Pikaday 1.8.15
- [ ] Inline rendering (`bound: false`)
- [ ] Exact Voxel configuration
- [ ] Immediate onSelect callback
- [ ] No custom Pikaday CSS

**Form Popup System:**
- [ ] FormGroup manages state
- [ ] FormPopup uses React Portal
- [ ] Auto-positioning matches Voxel
- [ ] Scroll/resize repositioning
- [ ] Save/Clear buttons in footer

**Map Integration:**
- [ ] Uses Voxel's HTML structure
- [ ] Switcher with NO custom CSS
- [ ] Map container class: `location-field-map`
- [ ] Lat/Lng inputs
- [ ] Draggable marker

**Media Library:**
- [ ] Uses `voxel_ajax_list_media` endpoint
- [ ] Pagination (9 per page)
- [ ] Search functionality
- [ ] File selection
- [ ] Load more button
- [ ] NOT using wp.media

**Timezone Popup:**
- [ ] Uses FormGroup/FormPopup
- [ ] Grouped by region
- [ ] Search filtering
- [ ] Save/Clear buttons

---

## Files Changed

### Documentation
- ✅ Created: `discovery-phase-c-advanced-features.md` (comprehensive evidence)
- ✅ Created: `phase-c-discovery-summary.md` (this file)

### Code
- ✅ Fixed: `app/blocks/src/create-post/style.css` (removed custom switcher CSS)

### Implementation Files (Pending Rollback/Redo)
- ⏳ DateField.tsx
- ⏳ LocationField.tsx
- ⏳ FileField.tsx
- ⏳ TimezoneField.tsx
- ⏳ popup/DatePicker.tsx
- ⏳ popup/FormGroup.tsx
- ⏳ popup/FormPopup.tsx
- ⏳ popup/MapPicker.tsx
- ⏳ popup/MediaLibrary.tsx

---

## Recommendation

**Proceed with Option A: Full Re-Implementation**

**Rationale:**
- Discovery is complete and comprehensive
- Clear implementation patterns identified
- Broken CSS issue resolved
- All evidence documented with file paths
- React implementation plans ready

**Confidence Level:** High - All necessary information gathered from Voxel source code

**User Approval Required:** Yes - confirm approach before proceeding

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Ready for Implementation  
**Awaiting:** User approval to proceed

