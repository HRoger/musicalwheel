# Create-Post Block - Current State Summary

**Date:** November 24, 2025  
**Status:** ⏸️ PAUSED - Awaiting Popup Block  
**Purpose:** Resume work after popup block is complete  
**Next Session:** Integrate popup block and complete Phase C

---

## 📊 Current Implementation Status

### ✅ Phase A: Foundation (COMPLETE)
- Block registration and structure
- AJAX form submission
- Success/error handling
- Field data structure
- TypeScript types

### ✅ Phase B: Field Rendering (COMPLETE)
**All 30+ field types implemented:**
- ✅ Text, Email, URL, Phone, Number
- ✅ Textarea, Text Editor
- ✅ Select, Multiselect, Switcher
- ✅ Taxonomy
- ✅ Date, Time, Timezone
- ✅ Location
- ✅ File, Image, Profile Avatar
- ✅ Repeater
- ✅ Product
- ✅ Post Relation
- ✅ UI Fields (Heading, HTML, Image, Step)
- ✅ Recurring Date (simplified)
- ✅ Work Hours (simplified)

### ⚠️ Phase C: Advanced Features (PARTIAL - BLOCKED)

**Status:** Partially implemented but **BLOCKED** by popup system issues

**What's Done:**
- ✅ FormGroup component (popup state management)
- ✅ FormPopup component (4-layer structure)
- ✅ DatePicker component (Pikaday integration)
- ✅ Backdrop click closes popup
- ✅ ESC key closes popup
- ✅ FieldLabel component (Optional labels)

**What's Broken:**
- ❌ **Popup layout incorrect** - Not fullscreen, wrong CSS
- ❌ **Save button not showing** in date picker popup
- ❌ **Date selection doesn't update input** - Pikaday onSelect not connected
- ❌ **Popup CSS not loading correctly** - popup-kit.css integration incomplete
- ❌ **Optional labels missing** for most fields (only Date/Timezone have them)

**What's Missing:**
- ❌ Event Date field (full recurring date features)
- ❌ Work Hours field (full schedule management)
- ❌ File upload proper UI (Media library integration)
- ❌ Map integration (full Google Maps/Mapbox)
- ❌ Media library popup (AJAX, search, pagination)

---

## 📁 Current File Structure

```
app/blocks/src/create-post/
├── block.json                    # Block registration
├── index.tsx                     # Block edit component
├── save.tsx                      # Block save (null - dynamic)
├── style.css                     # Block styles
├── types.ts                      # TypeScript types
├── components/
│   ├── FieldRenderer.tsx        # Routes fields to components
│   ├── fields/                   # All field components
│   │   ├── DateField.tsx        # ⚠️ Uses inline popup (needs update)
│   │   ├── TimezoneField.tsx    # ⚠️ Uses inline popup (needs update)
│   │   ├── SelectField.tsx      # ⚠️ Needs popup integration
│   │   ├── MultiselectField.tsx # ⚠️ Needs popup integration
│   │   ├── TaxonomyField.tsx    # ⚠️ Needs popup integration
│   │   ├── FieldLabel.tsx       # ✅ Optional label component
│   │   └── ... (20+ other fields)
│   └── popup/                    # ⚠️ INLINE - Should use block instead
│       ├── FormGroup.tsx        # Popup state management
│       ├── FormPopup.tsx        # 4-layer popup structure
│       ├── DatePicker.tsx       # Pikaday integration
│       ├── MapPicker.tsx        # Map integration (partial)
│       └── MediaLibrary.tsx     # Media library (partial)
```

---

## 🔧 Current Popup Implementation (INLINE - TO BE REPLACED)

### FormGroup.tsx
**Location:** `components/popup/FormGroup.tsx`
**Status:** ✅ Working but should use popup block
**Features:**
- Manages popup open/close state
- Handles focus/blur events
- Uses React Portal for teleport

**Issues:**
- Inline implementation (should be in popup block)
- Not reusable across blocks

### FormPopup.tsx
**Location:** `components/popup/FormPopup.tsx`
**Status:** ⚠️ Structure correct but CSS issues
**Features:**
- 4-layer structure (ts-popup-root → div → ts-field-popup-container → ts-field-popup)
- Backdrop click closes popup
- ESC key closes popup
- Clear/Save buttons

**Issues:**
- ❌ CSS layout incorrect (not fullscreen)
- ❌ Save button not showing in date picker
- ❌ popup-kit.css not fully integrated
- ❌ Animations may not work correctly

### DatePicker.tsx
**Location:** `components/popup/DatePicker.tsx`
**Status:** ⚠️ Pikaday works but not connected properly
**Features:**
- Pikaday.js integration
- Month/year navigation
- Date selection

**Issues:**
- ❌ onSelect doesn't call onSave immediately (Voxel behavior)
- ❌ Selected date doesn't update input field
- ❌ Date highlighting may not work

---

## 🎯 What Needs to Happen After Popup Block is Ready

### Step 1: Remove Inline Popup Components
**Files to Delete:**
- `components/popup/FormGroup.tsx` (move to popup block)
- `components/popup/FormPopup.tsx` (move to popup block)
- `components/popup/DatePicker.tsx` (move to date-picker block)

**Action:**
```bash
# After popup block is ready
rm -rf app/blocks/src/create-post/components/popup/
```

### Step 2: Import Popup Block Components
**Update:** `components/fields/DateField.tsx`
```tsx
// OLD:
import { FormGroup } from '../popup/FormGroup';
import { FormPopup } from '../popup/FormPopup';
import { DatePicker } from '../popup/DatePicker';

// NEW:
import { FormGroup, FormPopup } from '@voxel-fse/popup';
import { DatePicker } from '@voxel-fse/date-picker';
```

### Step 3: Fix DateField Integration
**Update:** `components/fields/DateField.tsx`
```tsx
<DatePicker
  value={pickerDate}
  onChange={handleDateChange}
  onSave={handleSave}  // CRITICAL: Must call immediately on date select
/>
```

### Step 4: Update All Popup Fields
**Fields to Update:**
- ✅ DateField
- ✅ TimezoneField
- ⚠️ SelectField (needs popup)
- ⚠️ MultiselectField (needs popup)
- ⚠️ TaxonomyField (needs popup)

### Step 5: Apply FieldLabel to All Fields
**Current Status:**
- ✅ DateField (date label)
- ✅ DateField (time label)
- ✅ TimezoneField
- ❌ All other fields (need FieldLabel)

**Action:**
Replace all label implementations with:
```tsx
<FieldLabel 
  field={field} 
  value={currentValue}
/>
```

### Step 6: Complete Phase C Features
**After popup block integration:**
1. Event Date field (recurring date)
2. Work Hours field (schedule management)
3. File upload proper UI (Media library)
4. Map integration (full Google Maps/Mapbox)

---

## 🐛 Known Issues (To Fix After Popup Block)

### Issue 1: Popup Layout Incorrect
**Symptom:** Popup is small box, not fullscreen
**Cause:** popup-kit.css not fully integrated
**Fix:** Use popup block (handles CSS correctly)

### Issue 2: Save Button Not Showing
**Symptom:** Date picker popup only shows "Clear" button
**Cause:** FormPopup buttons not rendering correctly
**Fix:** Use popup block (buttons structure correct)

### Issue 3: Date Selection Doesn't Update Input
**Symptom:** Clicking date in calendar doesn't update input field
**Cause:** Pikaday onSelect not connected to save handler
**Fix:** Use date-picker block (onSelect calls onSave immediately)

### Issue 4: Optional Labels Missing
**Symptom:** Most fields don't show "Optional" label
**Cause:** FieldLabel not applied to all fields
**Fix:** Apply FieldLabel component to all fields (30 min)

### Issue 5: Popup CSS Not Loading
**Symptom:** Popups look broken, wrong styling
**Cause:** popup-kit.css not enqueued or integrated
**Fix:** Popup block handles CSS integration

---

## 📝 Integration Checklist (After Popup Block Ready)

### Immediate (30 minutes):
- [ ] Delete inline popup components
- [ ] Import popup block components
- [ ] Update DateField to use popup block
- [ ] Update TimezoneField to use popup block
- [ ] Test date picker works correctly

### Short-term (2 hours):
- [ ] Update SelectField to use popup block
- [ ] Update MultiselectField to use popup block
- [ ] Update TaxonomyField to use popup block
- [ ] Apply FieldLabel to ALL fields
- [ ] Test all popups work correctly

### Medium-term (4 hours):
- [ ] Implement Event Date field (recurring date)
- [ ] Implement Work Hours field (schedule)
- [ ] Fix file upload UI (Media library)
- [ ] Complete map integration

---

## 🔍 Key Files to Review After Popup Block

### Primary Integration Points:
1. **DateField.tsx** - First field to migrate
2. **TimezoneField.tsx** - Second field to migrate
3. **FieldRenderer.tsx** - Routes all fields
4. **types.ts** - Field type definitions

### Components to Update:
- All fields in `components/fields/` that use popups
- FieldRenderer to ensure proper routing

### Testing:
- Test each field after migration
- Verify popup opens/closes correctly
- Verify date selection updates input
- Verify Optional labels show/hide correctly

---

## 📚 Reference Documentation

### Current State Docs:
- `popup-kit-vx/discovery.md` - Popup discovery findings
- `popup-kit-vx/fixes-backdrop-optional.md` - Latest fixes
- `popup-kit-vx/rewrite-complete.md` - Popup rewrite
- `phase-c-discovery-summary.md` - Phase C discovery

### Voxel Reference:
- `themes/voxel/templates/widgets/create-post/date-field.php` - Date field template
- `themes/voxel/assets/dist/popup-kit.css` - Popup styles
- `themes/voxel/assets/dist/auth.js` - Compiled Vue components

---

## 🎯 Success Criteria (After Popup Block Integration)

### Popups Working When:
- [ ] Date picker popup is fullscreen on desktop
- [ ] Date picker popup slides up on mobile
- [ ] Save button appears in popup footer
- [ ] Clicking date updates input field immediately
- [ ] Backdrop click closes popup
- [ ] ESC key closes popup
- [ ] Animations work correctly

### Fields Working When:
- [ ] All popup fields use popup block
- [ ] Optional labels show/hide correctly
- [ ] Date selection works end-to-end
- [ ] Timezone selection works
- [ ] Select/Multiselect popups work
- [ ] No console errors

### Phase C Complete When:
- [ ] Event Date field implemented
- [ ] Work Hours field implemented
- [ ] File upload has proper UI
- [ ] Map integration complete
- [ ] All features match Voxel exactly

---

## 💡 Key Learnings

### What We Discovered:
1. Voxel's popup system is a complete Elementor widget
2. Popup structure requires 4 layers exactly
3. Pikaday onSelect must call onSave immediately
4. Optional labels use `.is-required` class (confusing name!)
5. popup-kit.css must be integrated correctly

### What We Fixed:
1. ✅ Popup structure (4 layers)
2. ✅ Backdrop click handler
3. ✅ FieldLabel component
4. ✅ ESC key handler

### What Still Needs Work:
1. ❌ Popup CSS integration
2. ❌ Date picker onSelect connection
3. ❌ Save button rendering
4. ❌ Optional labels for all fields
5. ❌ Complete Phase C features

---

## 🚀 Next Steps

### After Popup Block is Ready:

1. **Review popup block documentation**
   - Read `docs/conversions/popup-kit/`
   - Understand component API
   - Review usage examples

2. **Test popup block in isolation**
   - Verify it works standalone
   - Test all features
   - Check CSS integration

3. **Migrate DateField first**
   - Delete inline popup components
   - Import popup block
   - Update DateField
   - Test thoroughly

4. **Migrate other fields**
   - TimezoneField
   - SelectField
   - MultiselectField
   - TaxonomyField

5. **Complete Phase C**
   - Event Date
   - Work Hours
   - File upload
   - Map integration

---

**Status:** ⏸️ PAUSED - Awaiting Popup Block  
**Last Updated:** November 24, 2025  
**Next Session:** Resume after popup block is complete  
**Estimated Time to Complete:** 4-6 hours after popup block ready

---

## 📞 Quick Reference

### Current Block Location:
```
app/blocks/src/create-post/
```

### Popup Block Location (After Creation):
```
app/blocks/src/popup/
```

### Date Picker Block Location (After Creation):
```
app/blocks/src/date-picker/
```

### Documentation Location:
```
docs/conversions/create-post/
docs/conversions/popup-kit/ (popup-related docs)
```

---

**Ready for:** Popup block integration  
**Blocked by:** Popup block not yet created  
**Can Resume:** After popup block is complete and tested

