# DateField Popup Fixes - Phase D Complete

**Date:** 2025-11-30
**Status:** ✅ Complete
**Files Modified:** 3 files (DateField.tsx, FieldPopup.tsx, DatePicker.tsx)
**Bundle Size:** 93.70 kB (gzip: 21.46 kB)

---

## Executive Summary

Fixed three critical issues with the DateField popup to achieve 1:1 Voxel behavior matching:
1. ✅ **Backdrop click-to-close** - Clicking outside popup now closes it
2. ✅ **Immediate save on date click** - Selecting a date saves and closes popup instantly
3. ✅ **Body scrolling preserved** - Removed unnecessary scroll lock

All fixes implemented using **discovery-first methodology** by analyzing Voxel's exact implementation patterns.

---

## Issues Identified

### Issue #1: Backdrop Click Not Closing Popup
**Problem:** Clicking outside the date picker modal didn't close it (unlike Voxel)

**Root Cause:** Original implementation had incorrect click handler on popup div itself instead of document-level listener.

**User Report:**
> "clicking outside the modal, it doesn't close it like in voxel"

### Issue #2: Calendar Dates Require Save Button Click
**Problem:** Clicking a calendar date required clicking "Save" button to persist the value. Date wouldn't save automatically.

**Root Cause:** React state timing issue - when Pikaday's `onSelect` fired:
1. DatePicker called `onChange(date)` → `setPickerDate(date)` (async state update)
2. Immediately called `onSelect()` → `handleSave()`
3. But `handleSave` read the OLD `pickerDate` from state (state hadn't updated yet!)

**User Report:**
> "the dates are actually clickable, for instance i click 30 and click save button than the date appears in the input field. But if I click in a date and don't click save nothing happens. is empty."

### Issue #3: Body Scrolling Removed
**Problem:** Page body couldn't scroll when popup was open.

**Root Cause:** Unnecessary `overflow: hidden` on body that I incorrectly added. Voxel doesn't lock body scroll for field popups.

**User Report:**
> "it is removing the page body y-scrolling"

---

## Voxel Discovery & Evidence

### Discovery #1: Blurable Mixin (Backdrop Click)

**Evidence Location:** `themes/voxel/assets/dist/commons.js`

**Discovered Pattern:**
```javascript
window.Voxel.mixins.blurable={
  props:{preventBlur:{type:String,default:""}},
  mounted(){
    requestAnimationFrame(()=>{
      document.addEventListener("mousedown",this._click_outside_handler)
    })
  },
  unmounted(){
    document.removeEventListener("mousedown",this._click_outside_handler)
  },
  methods:{
    _click_outside_handler(e){
      var t=".triggers-blur";
      this.preventBlur.length&&(t+=","+this.preventBlur),
      e.target.closest(t)||this.$emit("blur"),
      this.$el?.contains?.(e.target)||
      this.preventBlur.length&&e.target.closest(this.preventBlur)||
      this.$emit("blur")
    }
  }
}
```

**Key Insights:**
- Uses **document-level `mousedown` listener** (not click handler on popup itself)
- Checks if click is inside `.triggers-blur` element using `contains()`
- Uses `requestAnimationFrame` to ensure popup is rendered before attaching listener
- Emits `blur` event to close popup if clicked outside

### Discovery #2: Immediate Save Pattern

**Evidence Location:** `themes/voxel/assets/dist/auth.js`

**Discovered Pattern (minified):**
```javascript
datePicker:{
  template:'<div class="ts-form-group" ref="calendar"><input type="hidden" ref="input"></div>',
  props:{field:Object,parent:Object},
  data(){return{picker:null}},
  mounted(){
    this.picker=new Pikaday({
      field:this.$refs.input,
      container:this.$refs.calendar,
      bound:!1,
      firstDay:1,
      keyboardInput:!1,
      defaultDate:this.parent.date,
      onSelect:e=>{
        this.parent.date=e,
        this.parent.onSave()  // ← CRITICAL: Immediately calls onSave
      },
      selectDayFn:e=>this.parent.date&&this.parent.date.toDateString()===e.toDateString()
    })
  },
  unmounted(){setTimeout(()=>this.picker.destroy(),200)},
  methods:{reset(){this.parent.date=null,this.picker.draw()}}
}
```

**Parent's onSave method:**
```javascript
onSave(){
  this.saveValue(),
  this.$refs.formGroup.blur()  // ← Closes popup
}
```

**Key Insights:**
- Pikaday's `onSelect` callback **immediately calls `parent.onSave()`**
- `onSave()` both saves the value AND closes the popup
- No Save button needed - selecting a date is the save action
- The close happens via `formGroup.blur()` which triggers Voxel's blurable mixin

### Discovery #3: No Body Scroll Lock

**Evidence:** Reviewed Voxel's popup templates and JavaScript - no body scroll lock for field popups.

---

## Implementation

### Fix #1: Backdrop Click-to-Close

**File:** [FieldPopup.tsx:170-198](app/blocks/src/create-post/components/FieldPopup.tsx#L170-L198)

**Implementation:**
```typescript
// EXACT Voxel: Handle backdrop clicks to close popup (blurable mixin)
// Evidence: themes/voxel/assets/dist/commons.js (Voxel.mixins.blurable)
// Logic: Click anywhere outside .triggers-blur closes the popup
useEffect(() => {
  if (!isOpen) return;

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // Check if click is inside the popup box (.triggers-blur)
    if (popupBoxRef.current?.contains(target)) {
      return; // Click inside popup, don't close
    }

    // Click outside popup, close it
    onClose();
  };

  // Use mousedown event (same as Voxel) instead of click
  // requestAnimationFrame ensures popup is fully rendered before adding listener
  const rafId = requestAnimationFrame(() => {
    document.addEventListener('mousedown', handleClickOutside);
  });

  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, onClose]);
```

**Key Changes:**
- ✅ Document-level `mousedown` listener (matches Voxel exactly)
- ✅ Uses `popupBoxRef.current?.contains(target)` to check if click is inside
- ✅ Uses `requestAnimationFrame` for timing (matches Voxel)
- ✅ Removed incorrect onClick handler from popup div

### Fix #2: Immediate Save on Date Click

**Problem:** React state timing issue causing old value to be saved

**Solution:** Pass date directly to `handleSave` instead of reading from state

#### Step 1: Update handleSave to Accept Date Parameter

**File:** [DateField.tsx:114-126](app/blocks/src/create-post/components/fields/DateField.tsx#L114-L126)

```typescript
// Handle save - update the field value and close popup
// EXACT Voxel: onSave() saves value AND closes popup immediately
// Evidence: themes/voxel/assets/dist/auth.js (datePicker.onSelect calls parent.onSave which saves and blurs)
//
// CRITICAL: Accept optional date parameter to avoid React state timing issues
// When called from Pikaday's onSelect, the date is passed directly (state hasn't updated yet)
// When called from Save button, uses pickerDate from state
const handleSave = useCallback((selectedDate?: Date | null) => {
  const dateToSave = selectedDate !== undefined ? selectedDate : pickerDate;
  const dateString = dateToString(dateToSave);
  if (enableTimepicker) {
    onChange({ date: dateString, time: currentValue.time });
  } else {
    onChange(dateString || '');
  }
  onBlur?.();

  // CRITICAL: Close popup immediately after save (Voxel's immediate behavior)
  closePopup();
}, [pickerDate, enableTimepicker, currentValue.time, onChange, onBlur, closePopup]);
```

**Key Changes:**
- ✅ Added optional `selectedDate?: Date | null` parameter
- ✅ Uses parameter if provided, otherwise falls back to state
- ✅ Closes popup immediately after saving (matches Voxel)

#### Step 2: Update DatePicker Interface

**File:** [DatePicker.tsx:62](app/blocks/src/create-post/components/popup-kit/DatePicker.tsx#L62)

```typescript
interface DatePickerProps {
  /** Currently selected date */
  value: Date | null;
  /** Called when a date is selected */
  onChange: (date: Date | null) => void;
  /** Called immediately after date selection (Voxel's immediate save behavior) */
  onSelect?: (date: Date) => void;  // ← Now accepts date parameter
}
```

#### Step 3: Pass Date to onSelect

**File:** [DatePicker.tsx:108-117](app/blocks/src/create-post/components/popup-kit/DatePicker.tsx#L108-L117)

```typescript
onSelect: (date: Date) => {
  // EXACT Voxel: immediate callback
  onChange(date);

  // EXACT Voxel: call onSelect immediately (triggers save & close)
  // CRITICAL: Pass date directly to avoid React state timing issues
  if (onSelect) {
    onSelect(date);  // ← Pass date directly
  }
},
```

**Key Changes:**
- ✅ Pass `date` to `onSelect(date)` instead of calling without parameter
- ✅ Avoids React state timing issue by using fresh date from Pikaday

### Fix #3: Remove Body Scroll Lock

**File:** [FieldPopup.tsx:214-222](app/blocks/src/create-post/components/FieldPopup.tsx#L214-L222)

**Implementation:**
```typescript
// Removed this entire useEffect:
// useEffect(() => {
//   if (!isOpen) return;
//   document.body.style.overflow = 'hidden';
//   return () => {
//     document.body.style.overflow = '';
//   };
// }, [isOpen]);
```

**Key Change:**
- ✅ Removed unnecessary body scroll lock
- ✅ Matches Voxel behavior (no scroll lock for field popups)

---

## Technical Details

### React State Timing Issue Explanation

**The Problem:**
```typescript
// Step 1: User clicks date "30"
Pikaday.onSelect(new Date('2025-11-30'))
  ↓
// Step 2: Update state (async)
onChange(date) → setPickerDate(date)  // Queues state update
  ↓
// Step 3: Call onSelect immediately (before state updates!)
onSelect() → handleSave()
  ↓
// Step 4: handleSave reads OLD pickerDate from state
const dateString = dateToString(pickerDate);  // ← Still has old value!
```

**The Solution:**
```typescript
// Step 1: User clicks date "30"
Pikaday.onSelect(new Date('2025-11-30'))
  ↓
// Step 2: Update state (async) AND pass date directly
onChange(date) → setPickerDate(date)
onSelect(date) → handleSave(date)  // ← Pass fresh date
  ↓
// Step 3: handleSave uses passed date (not state)
const dateToSave = selectedDate !== undefined ? selectedDate : pickerDate;
const dateString = dateToString(dateToSave);  // ← Uses fresh value!
```

### Files Modified

1. **DateField.tsx** - [Modified handleSave](app/blocks/src/create-post/components/fields/DateField.tsx#L114-L126)
   - Added optional `selectedDate` parameter to avoid state timing issue
   - Keeps `closePopup()` call for immediate close behavior

2. **FieldPopup.tsx** - [Added backdrop click handler](app/blocks/src/create-post/components/FieldPopup.tsx#L170-L198)
   - Implemented document-level mousedown listener
   - Removed unnecessary body scroll lock
   - Uses `requestAnimationFrame` for timing

3. **DatePicker.tsx** - [Updated onSelect callback](app/blocks/src/create-post/components/popup-kit/DatePicker.tsx#L108-L117)
   - Changed interface to accept date parameter: `onSelect?: (date: Date) => void`
   - Pass date directly to `onSelect(date)` callback

---

## Testing & Validation

### Test Results

**✅ Backdrop Click**
- Click outside popup → Closes immediately
- Click inside popup → Stays open
- Matches Voxel behavior exactly

**✅ Immediate Save**
- Click any calendar date → Saves value AND closes popup
- No Save button click needed
- Date persists correctly in field
- Matches Voxel behavior exactly

**✅ Body Scrolling**
- Page remains scrollable when popup is open
- No scroll lock applied
- Matches Voxel behavior exactly

**✅ Popup Positioning**
- Popup appears next to trigger element
- Dynamically positions above/below based on viewport space
- Already working from previous fix (recursive offset calculation)

### Build Output

```bash
vite v7.2.2 building client environment for production...
✓ 36 modules transformed.
assets/dist/create-post-frontend.js  93.70 kB │ gzip: 21.46 kB
built in 242ms.
```

---

## Evidence-Based Implementation Summary

| Issue | Voxel Evidence | Our Implementation | Status |
|-------|----------------|-------------------|--------|
| Backdrop click | `Voxel.mixins.blurable` in commons.js | Document-level mousedown with `contains()` | ✅ |
| Immediate save | `onSelect: e => { this.parent.onSave() }` in auth.js | Pass date to handleSave, close immediately | ✅ |
| Body scroll lock | No scroll lock in Voxel popups | Removed body overflow: hidden | ✅ |

---

## Commits

1. **Fix immediate save state timing** - Pass date directly to handleSave
2. **Remove body scroll lock** - Remove unnecessary overflow hidden
3. **Add backdrop click handler** - Implement blurable mixin pattern

---

## Related Documentation

- **Voxel Discovery:** `themes/voxel/assets/dist/commons.js` (blurable mixin)
- **Voxel Discovery:** `themes/voxel/assets/dist/auth.js` (datePicker component)
- **Implementation:** [DateField.tsx](app/blocks/src/create-post/components/fields/DateField.tsx)
- **Implementation:** [FieldPopup.tsx](app/blocks/src/create-post/components/FieldPopup.tsx)
- **Implementation:** [DatePicker.tsx](app/blocks/src/create-post/components/popup-kit/DatePicker.tsx)

---

## Lessons Learned

### 1. React State Timing Matters
**Issue:** Async state updates can cause stale reads when callbacks fire immediately.

**Solution:** Pass data directly to callbacks instead of relying on state when timing is critical.

**Pattern:**
```typescript
// ❌ Bad: Read from state after async update
onChange(data);  // Queues state update
callback();      // Reads stale state

// ✅ Good: Pass data directly
onChange(data);  // Queues state update
callback(data);  // Uses fresh data
```

### 2. Document-Level Event Listeners for Backdrop Clicks
**Issue:** Click handlers on popup divs don't handle clicks outside properly.

**Solution:** Use document-level listeners with `contains()` check.

**Pattern:**
```typescript
// ❌ Bad: Click handler on popup
<div onClick={(e) => { if (e.target === e.currentTarget) close() }}>

// ✅ Good: Document-level mousedown listener
useEffect(() => {
  const handleClick = (e) => {
    if (!popupRef.current?.contains(e.target)) close();
  };
  const rafId = requestAnimationFrame(() => {
    document.addEventListener('mousedown', handleClick);
  });
  return () => {
    cancelAnimationFrame(rafId);
    document.removeEventListener('mousedown', handleClick);
  };
}, [isOpen]);
```

### 3. Don't Add Features Voxel Doesn't Have
**Issue:** I added body scroll lock thinking it was "good UX" but Voxel doesn't use it.

**Solution:** Always verify Voxel's exact behavior before adding "improvements."

**Rule:** If Voxel doesn't have it, we don't add it. 1:1 matching only.

### 4. Discovery-First Methodology Works
**Success:** All three issues were solved by discovering Voxel's exact patterns first.

**Process:**
1. User reports issue
2. Search Voxel source code for evidence
3. Document discovered pattern
4. Implement 1:1 match
5. Test against Voxel behavior

**Result:** Perfect behavior matching without guesswork.

---

## Next Steps

DateField popup is now complete with 1:1 Voxel behavior matching. Ready to move on to next field type.

**Suggested Next Field:** Multi-select field (checkboxes popup with same FieldPopup component)
