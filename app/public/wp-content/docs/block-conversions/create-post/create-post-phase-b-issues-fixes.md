# Create Post Block - Phase B Issues & Fixes

**Date:** November 24, 2025
**Status:** In Progress
**Priority:** HIGH - User-reported issues from testing

---

## Issues Reported

### ✅ FIXED (Build 1)

1. **Submit button text** - Now shows "Save changes" in edit mode ✅
2. **Form validation** - Email and URL validation now working ✅
3. **Required field validation** - Now displays properly ✅

### 🔧 IN PROGRESS

4. **Optional labels not showing**
5. **Location coordinates not working**
6. **File upload validation** - Using browser alert instead of AJAX error
7. **Switch button opacity/color issues**
8. **Select/Taxonomy/Multiselect** - Missing "Clear" button
9. **Date calendar popup not showing**
10. **UI fields not rendering on frontend**
11. **Dynamic tag builder CSS conflict** - Text not visible in admin

---

## Detailed Analysis & Fixes

### Issue 1: Submit Button Text ✅ FIXED

**Problem:** Button always showed "Publish" even in edit mode

**Root Cause:** Used `postId` prop which wasn't being passed correctly

**Fix Applied:**
- Added `isEditMode` derived from `editingPostId` from wpData
- Changed button text logic to use `isEditMode` instead of `postId`
- Hardcoded "Save changes" text (not using `attributes.submitButtonText`)

**Code:**
```typescript
const { postId: editingPostId } = wpData;
const isEditMode = !!editingPostId && editingPostId > 0;

// In button render:
{isEditMode ? (
  <>
    <svg>...</svg>
    Save changes
  </>
) : (
  <>
    {attributes.submitButtonText || 'Publish'}
    <svg>...</svg>
  </>
)}
```

---

### Issue 2 & 3: Form Validation ✅ FIXED

**Problem:** 
- Required fields not validating
- Email/URL validation not working

**Root Cause:** `validateForm()` only checked for empty values, didn't validate format

**Fix Applied:**
- Enhanced `validateForm()` with email regex and URL validation
- Added proper error messages matching Voxel's text
- Clear validation errors when form is valid

**Code:**
```typescript
// Email validation
if (field.type === 'email' && value && typeof value === 'string') {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    errors[field.key] = 'You must provide a valid email address';
  }
}

// URL validation
if (field.type === 'url' && value && typeof value === 'string') {
  try {
    new URL(value);
  } catch {
    errors[field.key] = 'You must provide a valid URL';
  }
}
```

---

### Issue 4: Optional Labels Not Showing 🔧 TODO

**Problem:** Fields without `required: true` should show "Optional" label

**Root Cause:** Not implemented in field components

**Fix Needed:**
- Add "Optional" label to all field components when `!field.required`
- Match Voxel's styling (light gray, right-aligned)

**Implementation:**
```tsx
// In each field component:
<label className="ts-form-label">
  {field.label}
  {field.required && <span className="required"> *</span>}
  {!field.required && <span className="optional">Optional</span>}
</label>
```

**CSS Needed:**
```css
.optional {
  color: #999;
  font-weight: normal;
  font-size: 13px;
  float: right;
}
```

---

### Issue 5: Location Coordinates Not Working 🔧 TODO

**Problem:** Location field not capturing/saving coordinates

**Root Cause:** Stage 1 implementation uses default coordinates (0, 0)

**Fix Needed:**
- Implement browser geolocation API
- Add "Use my location" button
- Update coordinates when address changes (requires geocoding API)

**Priority:** MEDIUM - Stage 1 works for basic use, Stage 2 needed for full functionality

---

### Issue 6: File Upload Validation 🔧 TODO

**Problem:** Using browser `alert()` instead of inline error message

**Root Cause:** `FileField.tsx` uses `alert()` for file size validation

**Fix Needed:**
- Remove `alert()` calls
- Add inline error messages matching Voxel's style
- Show errors below file input

**Implementation:**
```tsx
const [fileErrors, setFileErrors] = useState<string[]>([]);

// In validation:
if (file.size > maxSize) {
  setFileErrors([`${file.name} is over the ${(maxSize / 1024 / 1024).toFixed(1)} MB limit`]);
  continue;
}

// In render:
{fileErrors.length > 0 && (
  <div className="ts-file-errors">
    {fileErrors.map((error, i) => (
      <span key={i} className="is-required error">{error}</span>
    ))}
  </div>
)}
```

---

### Issue 7: Switch Button Opacity/Color 🔧 TODO

**Problem:** Switch button has wrong opacity, disappears with dynamic data

**Root Cause:** CSS conflict or missing Voxel styles

**Fix Needed:**
- Check if Voxel's switcher CSS is loading
- Verify `--ts-accent-1` variable is applied
- Test dynamic data integration

**Investigation Required:**
- Check browser dev tools for applied styles
- Compare with Voxel original switcher
- Check if `.onoffswitch` classes are correct

---

### Issue 8: Select/Taxonomy/Multiselect - Missing Clear Button 🔧 TODO

**Problem:** Only showing "Save" button, missing "Clear" button

**Root Cause:** Simplified popup implementation didn't include Clear button

**Fix Needed:**
- Add "Clear" button to popup footer
- Implement clear functionality
- Match Voxel's 2-button layout

**Implementation:**
```tsx
// In popup footer:
<div className="ts-popup-footer">
  <button
    type="button"
    className="ts-btn ts-btn-1"
    onClick={() => {
      onChange(field.type === 'select' ? null : {});
      setIsOpen(false);
    }}
  >
    Clear
  </button>
  <button
    type="button"
    className="ts-btn ts-btn-2"
    onClick={() => {
      setIsOpen(false);
      if (onBlur) onBlur();
    }}
  >
    Save
  </button>
</div>
```

---

### Issue 9: Date Calendar Popup Not Showing 🔧 TODO

**Problem:** HTML5 date input instead of Voxel's calendar popup

**Root Cause:** Phase B used simplified HTML5 input

**Fix Needed:**
- Implement Voxel's date picker component
- Use flatpickr or similar calendar library
- Match Voxel's calendar styling

**Priority:** MEDIUM - HTML5 date input works but UX is different

**Full Implementation (Phase C):**
- Port Voxel's Vue date-picker component to React
- Integrate with Voxel's calendar styles
- Add date range support
- Add time picker integration

---

### Issue 10: UI Fields Not Rendering on Frontend 🔧 TODO

**Problem:** ui-heading, ui-html, ui-image, ui-step not showing

**Root Cause:** `UIField` component not being rendered or CSS hiding them

**Fix Needed:**
- Check if `FieldRenderer` is calling `UIField` correctly
- Verify UI fields are in `fieldsConfig` from PHP
- Check CSS for `display: none` rules

**Investigation:**
```typescript
// In FieldRenderer.tsx - verify these cases exist:
case 'ui-heading':
case 'ui-html':
case 'ui-image':
case 'ui-step':
  return <UIField field={field} />;
```

---

### Issue 11: Dynamic Tag Builder CSS Conflict 🔧 TODO

**Problem:** Text not visible in admin dynamic tag builder

**Location:** `wp-admin/edit.php?post_type=places&page=edit-post-type-places&tab=fields`

**Root Cause:** CSS conflict - text color same as background or transparent

**Fix Needed:**
- Add CSS override for dynamic tag builder
- Target specific admin page
- Ensure text contrast

**Investigation Required:**
- Inspect element in browser dev tools
- Check computed styles on `<span>` elements
- Find conflicting CSS rule
- Add override in admin CSS

**Potential Fix:**
```css
/* In admin CSS file */
.voxel-admin-page .dynamic-tag-builder li span {
  color: #000 !important;
  opacity: 1 !important;
}
```

---

## Priority Order

### HIGH (Critical for usability)
1. ✅ Submit button text - FIXED
2. ✅ Form validation - FIXED
3. 🔧 Optional labels
4. 🔧 File upload validation (remove alerts)
5. 🔧 UI fields not rendering

### MEDIUM (UX improvements)
6. 🔧 Select/Multiselect Clear button
7. 🔧 Location coordinates
8. 🔧 Switch button opacity
9. 🔧 Date calendar popup

### LOW (Admin-only, cosmetic)
10. 🔧 Dynamic tag builder CSS

---

## Next Steps

1. Add "Optional" labels to all field components
2. Fix file upload validation (inline errors)
3. Debug UI fields rendering
4. Add Clear button to selection fields
5. Investigate switch button styling
6. Test all fixes comprehensively

---

**Status:** 3/11 issues fixed in Build 1
**Remaining:** 8 issues to address
**Estimated Time:** 2-3 hours for remaining fixes

