# Prompt: Create Post Block - Phase C Advanced Features

**Date:** December 2025  
**Session Type:** Implementation  
**Phase:** Phase C - Advanced Features & Enhanced Implementations  
**Prerequisites:** Phase B 100% Complete ✅

---

## ⚠️ MANDATORY READING - READ THESE FIRST

Before starting ANY work, you MUST read these documents in order:

### 1. **CRITICAL - Phase B Complete Summary** ⭐ MOST IMPORTANT
**File:** `docs/conversions/create-post/create-post-phase-b-final-complete.md`

**Why Critical:**
- Complete overview of all 30+ field types implemented
- Documents all issues resolved in Phase B
- Lists what's simplified and needs Phase C enhancement
- Technical architecture and implementation details
- **This is the foundation for understanding what needs to be enhanced**

**Key Sections to Focus On:**
- Section "✅ All Field Types Implemented (30+)" - What's working
- Section "🚀 What's Working" - Fully functional vs simplified
- Section "📋 Phase C - Next Steps" - Detailed Phase C requirements
- Section "📝 Notes for Phase C" - Technical recommendations

### 2. **Phase B Issues & Fixes**
**File:** `docs/conversions/create-post/create-post-phase-b-issues-fixes.md`

**Why Important:**
- Documents all issues encountered and resolved
- Shows validation fixes
- CSS conflict resolutions
- Form width fixes
- Multi-step form implementation

### 3. **Voxel Discovery Documentation**
**Directory:** `docs/voxel-discovery/`

**Why Important:**
- Understanding Voxel's implementation patterns
- Discovery-first methodology examples
- 1:1 matching requirements
- Architecture decisions

---

## 🎯 Phase C Objectives

**Goal:** Enhance simplified field implementations to full feature parity with Voxel.

**Scope:**
- Interactive date picker calendar
- Select field popups with Clear/Save buttons
- Full map integration (Google Maps/Mapbox)
- WordPress media library integration
- Timezone popup with search
- Full repeater functionality
- Enhanced work hours field
- Product field full implementation

---

## 📋 Phase C Tasks - High Priority

### 1. Interactive Date Picker Calendar ⭐ HIGHEST PRIORITY

**Current State:**
- Basic HTML5 date input works
- No calendar popup
- No date range selection
- Time picker integration incomplete

**Requirements:**
- Implement calendar popup (flatpickr.js recommended)
- Date range selection support
- Time picker integration
- Match Voxel's date picker UI exactly

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/DateField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/date-field.php`
- Check Voxel's date picker implementation

**Discovery Required:**
```bash
# Find Voxel's date picker implementation
grep -r "date.*picker\|flatpickr\|calendar" themes/voxel/
find themes/voxel -name "*date*" -type f
```

---

### 2. Select Field Popups with Clear/Save Buttons ⭐ HIGH PRIORITY

**Current State:**
- Basic selection works (inline/dropdown)
- No popup system
- No Clear/Save buttons
- Simplified dropdown for 15+ items

**Requirements:**
- Implement Voxel's `form-group` and `form-popup` Vue components in React
- Add Clear button (clears selection)
- Add Save button (saves selection)
- Popup state management
- Teleport to body (React Portal)
- Match Voxel's popup animations and styling

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/SelectField.tsx`
- `app/blocks/src/create-post/components/fields/MultiselectField.tsx`
- `app/blocks/src/create-post/components/fields/TaxonomyField.tsx`
- `app/blocks/src/create-post/components/fields/TimezoneField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/components/form-group.php`
- `themes/voxel/templates/components/popup.php`
- `themes/voxel/templates/widgets/create-post/select-field.php`
- `themes/voxel/templates/widgets/create-post/taxonomy-field.php`
- `themes/voxel/templates/widgets/create-post/timezone-field.php`

**Discovery Required:**
```bash
# Find Voxel's popup system
grep -r "form-popup\|form-group" themes/voxel/
find themes/voxel/templates/components -name "*popup*" -o -name "*form-group*"
```

**Key Features:**
- Popup opens on field click
- Search functionality inside popup
- Clear button (mobile: icon, desktop: text)
- Save button (pink, prominent)
- Close button (X icon)
- Blur to close (click outside)
- Smooth animations

---

### 3. Full Map Integration ⭐ HIGH PRIORITY

**Current State:**
- Basic address input works
- "Geolocate my address" button (placeholder)
- "Pick on the map" placeholder (400px area)
- Manual coordinates (lat/lng) inputs work
- Map picker toggle works

**Requirements:**
- Google Maps or Mapbox integration
- Geocoding API (address → coordinates)
- Reverse geocoding (coordinates → address)
- Address autocomplete
- Interactive map with draggable marker
- "Use my location" button (browser geolocation API)
- Map picker with click-to-set-location

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/LocationField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/location-field.php`
- Check Voxel's map integration (likely uses Google Maps API)

**Discovery Required:**
```bash
# Find Voxel's map implementation
grep -r "google.*map\|mapbox\|geocod\|autocomplete" themes/voxel/
find themes/voxel/assets -name "*map*" -o -name "*location*"
```

**Key Features:**
- Google Maps API key configuration
- Address autocomplete dropdown
- Interactive map with marker
- Drag marker to set location
- Click map to set location
- Browser geolocation API integration
- Coordinate validation (lat: -90 to 90, lng: -180 to 180)

---

### 4. WordPress Media Library Integration ⭐ HIGH PRIORITY

**Current State:**
- HTML5 file input works
- File size validation works
- File type validation works
- Image preview works
- No WordPress media library
- No drag & drop
- No file reordering

**Requirements:**
- WordPress media library popup integration
- File preview with thumbnails
- Drag & drop file upload
- Sortable file list (drag to reorder)
- Upload progress indicators
- Multiple file support
- Remove file functionality

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/FileField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/file-field.php`
- `themes/voxel/templates/widgets/create-post/image-field.php`
- Check Voxel's media library component

**Discovery Required:**
```bash
# Find Voxel's media library implementation
grep -r "media.*library\|wp\.media\|media.*popup" themes/voxel/
find themes/voxel/assets/src/components -name "*media*"
```

**Key Features:**
- WordPress `wp.media` API integration
- Media library popup (WordPress core)
- File upload via AJAX
- Progress indicators
- Drag & drop zone
- File preview thumbnails
- Remove file button
- Sortable list (drag to reorder)

---

### 5. Timezone Popup with Search ⭐ MEDIUM PRIORITY

**Current State:**
- Basic select dropdown works
- Search functionality works
- No popup system
- No Clear/Save buttons

**Requirements:**
- Implement popup system (same as Select/Taxonomy fields)
- Searchable timezone list
- Clear button
- Save button
- Match Voxel's timezone field exactly

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/TimezoneField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/timezone-field.php`

**Key Features:**
- Popup with search
- Full timezone list (Africa/*, America/*, Asia/*, etc.)
- Radio button selection
- Clear/Save buttons
- Current selection display

---

## 📋 Phase C Tasks - Medium Priority

### 6. Full Repeater Functionality

**Current State:**
- Basic structure placeholder
- No add/remove functionality
- No nested fields

**Requirements:**
- Add/remove field groups
- Nested fields within each group
- Drag to reorder groups
- Collapsible groups
- Field validation per group
- Custom field layouts

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/RepeaterField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/repeater-field.php`

---

### 7. Enhanced Work Hours Field

**Current State:**
- Text input (simplified)
- No day/time selection
- No time slots

**Requirements:**
- Day selection (Mon-Sun)
- Time range selection (start/end)
- Multiple time slots per day
- Status management (open/closed/hours)
- Timezone handling

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/WorkHoursField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/work-hours-field.php`

---

### 8. Product Field Full Implementation

**Current State:**
- Basic structure placeholder
- No product configuration

**Requirements:**
- Product type selection
- Calendar/booking integration
- Pricing management
- Product variations
- Availability/schedule settings
- Booking configuration

**Files to Modify:**
- `app/blocks/src/create-post/components/fields/ProductField.tsx`

**Voxel Reference:**
- `themes/voxel/templates/widgets/create-post/product-field.php`

---

## 🔍 Discovery Requirements

**Before implementing ANY feature, you MUST:**

1. **Search Voxel Theme:**
   ```bash
   # Find Voxel's implementation
   grep -r "feature_name" themes/voxel/
   find themes/voxel -name "*feature*"
   ```

2. **Read Voxel Templates:**
   - Find PHP template files
   - Read Vue component files
   - Document HTML structure
   - Document CSS classes
   - Document JavaScript logic

3. **Document Findings:**
   - File paths and line numbers
   - Code snippets as evidence
   - Implementation approach
   - Dependencies identified

4. **Check for Conflicts:**
   - Verify no filename conflicts with parent
   - Verify no path conflicts with parent
   - Use `VoxelFSE\` namespace (not `Voxel\`)

---

## 🎯 Success Criteria

Each Phase C feature is complete when:

✅ **1:1 Voxel Matching:**
- HTML structure matches Voxel exactly
- CSS classes use same prefixes (`ts-`, `nvx-`, `vx-`)
- JavaScript behavior matches Voxel
- Component API matches Voxel

✅ **Functional:**
- Feature works as in Voxel
- No errors or warnings
- Performance comparable
- User experience matches Voxel

✅ **Evidence-Based:**
- Every decision backed by Voxel code reference
- File paths and line numbers provided
- Code snippets shown as proof

---

## 📚 Key Resources

### Documentation:
- **Phase B Complete:** `docs/conversions/create-post/create-post-phase-b-final-complete.md`
- **Voxel Discovery:** `docs/voxel-discovery/`
- **Voxel Documentation:** `docs/voxel-documentation/`
- **Critical Instructions:** `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`

### Code References:
- **Voxel Templates:** `themes/voxel/templates/widgets/create-post/`
- **Voxel Components:** `themes/voxel/templates/components/`
- **Current Implementation:** `themes/voxel-fse/app/blocks/src/create-post/`

### Libraries to Consider:
- **Date Picker:** flatpickr.js (lightweight, accessible)
- **Map:** Google Maps API or Mapbox
- **Media Library:** WordPress `wp.media` API (core)
- **Popups:** React Portal + custom popup component

---

## 🚨 Important Notes

### 1. Discovery-First Methodology
- **NEVER** guess implementation details
- **ALWAYS** search Voxel theme first
- **ALWAYS** read actual Voxel code
- **ALWAYS** provide evidence (file paths, code snippets)

### 2. 1:1 Voxel Matching
- Match HTML structure exactly
- Match CSS classes exactly (including prefixes)
- Match JavaScript behavior exactly
- Match component API exactly

### 3. Autoloader Conflict Prevention
- Use `VoxelFSE\` namespace (not `Voxel\`)
- Use `fse-` prefix for files/directories
- Check for conflicts before creating files

### 4. Simplified vs Full Implementation
- Phase B: Simplified versions work but lack polish
- Phase C: Enhance to full feature parity
- Don't break existing functionality
- Maintain backward compatibility

---

## 📝 Implementation Order (Recommended)

**Suggested Priority Order:**

1. **Date Picker** (Easiest, high impact)
   - Library integration (flatpickr)
   - Calendar popup
   - Time picker integration

2. **Timezone Popup** (Reuses popup system)
   - Implement popup system first
   - Apply to timezone field
   - Test popup system

3. **Select Field Popups** (Core popup system)
   - Implement `form-popup` React component
   - Implement `form-group` wrapper
   - Apply to Select, Multiselect, Taxonomy
   - Clear/Save buttons

4. **Media Library** (WordPress API)
   - WordPress `wp.media` integration
   - File upload via AJAX
   - Preview and management

5. **Map Integration** (External API)
   - Google Maps API setup
   - Geocoding integration
   - Interactive map

6. **Complex Fields** (Most complex)
   - Repeater field
   - Work hours field
   - Product field

---

## ✅ Phase C Completion Checklist

- [ ] Interactive date picker calendar implemented
- [ ] Select field popups with Clear/Save buttons
- [ ] Full map integration (geocoding, autocomplete, interactive map)
- [ ] WordPress media library integration
- [ ] Timezone popup with search and Clear/Save
- [ ] Full repeater functionality
- [ ] Enhanced work hours field
- [ ] Product field full implementation
- [ ] All features tested and working
- [ ] Documentation updated
- [ ] No regressions in Phase B functionality

---

## 🎉 Expected Outcome

**After Phase C:**
- All field types at full feature parity with Voxel
- Interactive date picker with calendar
- Full popup system for select fields
- Complete map integration
- WordPress media library fully integrated
- All simplified implementations enhanced
- Production-ready, polished form experience

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Ready for Phase C Implementation

**Related Documentation:**
- Phase B Complete: `docs/conversions/create-post/create-post-phase-b-final-complete.md`
- Critical Instructions: `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`

