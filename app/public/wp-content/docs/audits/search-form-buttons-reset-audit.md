# Search Form Block Audit: Buttons Accordion - Reset Functionality

**Date:** 2026-01-18  
**Block:** `search-form`  
**Tab:** Content  
**Accordion:** Buttons  
**Issue:** Reset button not working for range filters

---

## 🔍 Audit Summary

**Status:** ⚠️ **ISSUE IDENTIFIED**

The reset button is properly wired in the inspector controls and the click handler is correctly implemented. However, there appears to be an issue with how range filters respond to the reset action.

---

## 📋 Inspector Controls Audit

### Location
`themes/voxel-fse/app/blocks/src/search-form/inspector/ContentTab.tsx`

### Controls Found

#### 1. **Show Reset Button** (Lines 440-444)
```typescript
<ToggleControl
    label={ __( 'Show Reset button', 'voxel-fse' ) }
    checked={ attributes.showResetButton ?? false }
    onChange={ ( value: boolean ) => setAttributes( { showResetButton: value } ) }
/>
```
✅ **Status:** Correctly implemented  
✅ **Data Flow:** `attributes.showResetButton` → `setAttributes`  
✅ **Default Value:** `false`

#### 2. **Reset Button Text** (Lines 448-456)
```typescript
<DynamicTagTextControl
    label={ __( 'Button text', 'voxel-fse' ) }
    value={ attributes.resetButtonText || '' }
    onChange={ ( value: string ) =>
        setAttributes( { resetButtonText: value } )
    }
    placeholder={ __( 'Reset', 'voxel-fse' ) }
    context="post"
/>
```
✅ **Status:** Correctly implemented  
✅ **Data Flow:** `attributes.resetButtonText` → `setAttributes`  
✅ **Dynamic Tags:** Supported via `DynamicTagTextControl`  
✅ **Placeholder:** "Reset"

#### 3. **Reset Button Width** (Lines 458-468)
```typescript
<ResponsiveRangeControlWithDropdown
    label={ __( 'Button width', 'voxel-fse' ) }
    attributes={ attributes }
    setAttributes={ setAttributes }
    attributeBaseName="resetButtonWidth"
    min={ 0 }
    max={ 100 }
    step={ 1 }
    availableUnits={ [ '%', 'px' ] }
    unitAttributeName="resetButtonWidthUnit"
/>
```
✅ **Status:** Correctly implemented  
✅ **Responsive:** Desktop, Tablet, Mobile variants  
✅ **Units:** `%` and `px` supported  
✅ **Data Flow:** Managed by `ResponsiveRangeControlWithDropdown`

---

## 🎨 CSS Generation Audit

### Location
`themes/voxel-fse/app/blocks/src/search-form/styles.ts`

### Reset Button Width Styles

**Function:** `getButtonWidth()` in `SearchFormComponent.tsx` (Lines 440-477)

```typescript
const getButtonWidth = (type: 'search' | 'reset'): React.CSSProperties => {
    const unit = type === 'search'
        ? (attributes.searchButtonWidthUnit || '%')
        : (attributes.resetButtonWidthUnit || '%');

    let width: number | undefined;

    if (type === 'search') {
        // Search button logic...
    } else {
        // Reset button
        if (deviceType === 'mobile') {
            width = attributes.resetButtonWidth_mobile ?? attributes.resetButtonWidth_tablet ?? attributes.resetButtonWidth;
        } else if (deviceType === 'tablet') {
            width = attributes.resetButtonWidth_tablet ?? attributes.resetButtonWidth;
        } else {
            width = attributes.resetButtonWidth;
        }
    }

    if (width !== undefined) {
        return {
            width: `${width}${unit}`,
            flexGrow: 0,
            flexShrink: 0,
        };
    }

    return {};
};
```

✅ **Status:** Correctly implemented  
✅ **Responsive:** Properly cascades mobile → tablet → desktop  
✅ **Inline Styles:** Applied directly to DOM element

---

## ⚙️ Functional Behavior Audit

### Reset Button Click Handler

**Location:** `SearchFormComponent.tsx` (Lines 363-386)

```typescript
{/* Reset button - INSIDE filter wrapper per Voxel structure */}
{includeSubmit && attributes.showResetButton && (
    <div
        className="ts-form-group flexify ts-form-reset"
        style={getButtonWidth('reset')}
    >
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                handleClearAll(false);
            }}
            className="ts-filter"
            role="button"
        >
            {renderIcon(attributes.resetButtonIcon, VoxelIcons.reload)}
            {renderedResetButtonText && (
                <div className="ts-filter-text">
                    {renderedResetButtonText}
                </div>
            )}
        </a>
    </div>
)}
```

✅ **Status:** Correctly implemented  
✅ **Event Handler:** Calls `handleClearAll(false)`  
✅ **Prevents Default:** `e.preventDefault()` present  
✅ **Icon:** Uses `VoxelIcons.reload` as fallback  
✅ **Text Rendering:** Supports dynamic tags

### `handleClearAll` Function

**Location:** `SearchFormComponent.tsx` (Lines 249-252)

```typescript
const handleClearAll = (closePortal = false) => {
    clearAll(closePortal);
};
```

✅ **Status:** Simple wrapper, delegates to `clearAll` from hook

### `clearAll` Hook Function

**Location:** `useSearchForm.ts` (Lines 184-219)

```typescript
const clearAll = useCallback((closePortal = false) => {
    setState((prev) => ({
        ...prev,
        filterValues: {},
        activeFilterCount: 0,
        resetting: true,
        portalActive: closePortal ? false : prev.portalActive,
    }));

    // Reset the resetting flag after a short delay
    setTimeout(() => {
        setState((prev) => ({ ...prev, resetting: false }));
    }, 100);

    // In editor context: notify parent to sync empty filter values
    if (context === 'editor' && onFilterChange) {
        onFilterChange({});
    }

    // Clear URL parameters and emit clear event (frontend context only)
    if (context === 'frontend') {
        // Clear all filter params from URL, keeping only the post type
        if (attributes.updateUrl !== false) {
            clearUrlParams(state.currentPostType);
        }

        // Emit clear event for Post Feed/Map integration
        const event = new CustomEvent('voxel-search-clear', {
            detail: {
                postType: state.currentPostType,
            },
        });
        window.dispatchEvent(event);
    }
}, [context, state.currentPostType, onFilterChange, attributes.updateUrl]);
```

✅ **Status:** Correctly implemented  
✅ **Clears Filter Values:** Sets `filterValues: {}`  
✅ **Resets Active Count:** Sets `activeFilterCount: 0`  
✅ **Loading State:** Sets `resetting: true` temporarily  
✅ **URL Handling:** Clears URL params (frontend only)  
✅ **Event Dispatch:** Emits `voxel-search-clear` event

---

## 🐛 Issue Identified: Range Filter Reset

### Problem

The `clearAll` function sets `filterValues: {}`, which should clear all filters. However, range filters may not be properly responding to this change.

### Root Cause Analysis

**Location:** `FilterRange.tsx` (Lines 232-246)

```typescript
// Sync local state when value changes externally
useEffect(() => {
    // Parse value using Voxel string format "min..max"
    const rv = parseRangeValue(value, rangeStart, rangeEnd);
    setLocalMin(rv.min);
    setLocalMax(rv.max);

    // Update slider if it exists
    if (sliderInstanceRef.current) {
        if (handles === 'double') {
            sliderInstanceRef.current.set([rv.min, rv.max]);
        } else {
            sliderInstanceRef.current.set([rv.min]);
        }
    }
}, [value, rangeStart, rangeEnd, handles]);
```

**Analysis:**

1. ✅ The `useEffect` correctly watches the `value` prop
2. ✅ It parses the value using `parseRangeValue()`
3. ✅ It updates local state (`setLocalMin`, `setLocalMax`)
4. ✅ It updates the noUiSlider instance

**Potential Issue:**

The `parseRangeValue` function (Lines 51-83) handles `null`, `undefined`, and empty string:

```typescript
function parseRangeValue(value: unknown, rangeStart: number, rangeEnd: number): { min: number; max: number } {
    // Handle null/undefined
    if (value === null || value === undefined || value === '') {
        return { min: rangeStart, max: rangeEnd };
    }
    // ... rest of parsing logic
}
```

✅ **This should work correctly!** When `clearAll` sets `filterValues: {}`, the range filter's `value` prop becomes `undefined`, which should trigger the `useEffect` and reset the slider to `rangeStart` and `rangeEnd`.

---

## 🔬 Testing Required

### Test Case 1: Basic Reset
1. Open search form in editor or frontend
2. Adjust a range filter (e.g., price range)
3. Click the Reset button
4. **Expected:** Range filter should reset to default min/max values
5. **Verify:** Slider handles return to default positions

### Test Case 2: Multiple Filters Reset
1. Set multiple filters (keywords, range, terms)
2. Click Reset button
3. **Expected:** All filters should clear
4. **Verify:** Range filters reset, other filters clear

### Test Case 3: Range Filter Modes
Test reset for all three display modes:
- **Popup mode:** Default behavior
- **Inline mode:** Slider visible inline
- **Minmax mode:** Two input boxes

### Test Case 4: Single vs Double Handles
- **Double handles:** Min and max should both reset
- **Single handle:** Should reset to appropriate default based on `compare` mode

---

## 🔧 Recommended Fixes

### Fix 1: Add Debug Logging (Temporary)

Add console logs to verify the reset flow:

```typescript
// In FilterRange.tsx, line 232
useEffect(() => {
    console.log('[FilterRange] Value changed:', value, 'rangeStart:', rangeStart, 'rangeEnd:', rangeEnd);
    const rv = parseRangeValue(value, rangeStart, rangeEnd);
    console.log('[FilterRange] Parsed value:', rv);
    setLocalMin(rv.min);
    setLocalMax(rv.max);
    // ... rest of code
}, [value, rangeStart, rangeEnd, handles]);
```

### Fix 2: Force Slider Update (If Needed)

If the slider doesn't update visually, add a forced update:

```typescript
// In FilterRange.tsx, after line 245
if (sliderInstanceRef.current) {
    if (handles === 'double') {
        sliderInstanceRef.current.set([rv.min, rv.max], false); // false = don't fire events
    } else {
        sliderInstanceRef.current.set([rv.min], false);
    }
    
    // Force visual update
    requestAnimationFrame(() => {
        if (sliderInstanceRef.current) {
            sliderInstanceRef.current.set(
                handles === 'double' ? [rv.min, rv.max] : [rv.min],
                false
            );
        }
    });
}
```

### Fix 3: Verify `narrowedValues` Doesn't Interfere

The adaptive filtering feature might be interfering. Check if `narrowedValues` is being set when it shouldn't be:

```typescript
// In useSearchForm.ts, clearAll function
const clearAll = useCallback((closePortal = false) => {
    setState((prev) => ({
        ...prev,
        filterValues: {},
        activeFilterCount: 0,
        resetting: true,
        portalActive: closePortal ? false : prev.portalActive,
        narrowedValues: null, // ← Add this line to clear narrowed values
    }));
    // ... rest of code
}, [context, state.currentPostType, onFilterChange, attributes.updateUrl]);
```

---

## 📊 Parity Check: Voxel vs FSE

### Voxel Implementation

**Evidence:** `voxel-search-form.beautified.js`

```javascript
// Voxel's clearAll method (approximate)
clearAll: function() {
    this.filters.forEach(function(filter) {
        filter.clear();
    });
    this.submit();
}
```

### FSE Implementation

```typescript
const clearAll = useCallback((closePortal = false) => {
    setState((prev) => ({
        ...prev,
        filterValues: {},
        activeFilterCount: 0,
        resetting: true,
        portalActive: closePortal ? false : prev.portalActive,
    }));
    // ... URL clearing and event dispatch
}, [context, state.currentPostType, onFilterChange, attributes.updateUrl]);
```

✅ **Parity:** Both implementations clear all filter values  
⚠️ **Difference:** Voxel calls `filter.clear()` on each filter individually, FSE clears the entire `filterValues` object

---

## ✅ Action Items

1. **Test the reset button** with range filters in both editor and frontend
2. **Add debug logging** to verify the value flow
3. **Check browser console** for any errors during reset
4. **Verify narrowedValues** is being cleared on reset
5. **Test all three display modes** (popup, inline, minmax)
6. **Test single and double handle** configurations

---

## 📝 Notes

- The reset button implementation appears **structurally correct**
- The issue is likely a **timing or state synchronization** problem
- Range filters use **noUiSlider** which requires explicit updates
- The `useEffect` dependency array includes `value`, so it **should** trigger on reset
- Consider adding a **`key` prop** to FilterRange based on `value` to force re-mount on reset

---

## 🎯 Conclusion

**Inspector Controls:** ✅ All correctly implemented  
**CSS Generation:** ✅ Working as expected  
**Click Handler:** ✅ Properly wired  
**clearAll Logic:** ✅ Correctly clears filter values  
**Range Filter Sync:** ⚠️ **Needs testing and potential fix**

**Recommended Next Step:** Run the test cases above and add debug logging to identify where the reset flow breaks down for range filters.
