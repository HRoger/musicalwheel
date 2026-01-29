# Border Control Audit - SelectControl to BorderGroupControl Migration

**Date:** 2026-01-24
**Issue:** Blocks using simple SelectControl for border type instead of BorderGroupControl
**Impact:** Missing Elementor parity - no border width/color controls

## Problem

Many blocks are using a simple `SelectControl` for "Border Type" instead of the shared `BorderGroupControl`. This results in:

1. ❌ **Missing border width controls** (TOP/RIGHT/BOTTOM/LEFT sliders)
2. ❌ **Missing border color picker**
3. ❌ **Inconsistent UI** with Elementor's Group_Control_Border
4. ❌ **Manual attribute management** instead of grouped control

## Correct Pattern (From term-feed)

```tsx
import { BorderGroupControl } from '@shared/controls';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';

// In component:
<BorderGroupControl
    label={__('Border', 'voxel-fse')}
    value={{
        borderType: attributes.navBorderType || '',
        borderWidth: attributes.navBorderWidth || {},
        borderColor: attributes.navBorderColor || '',
    }}
    onChange={(value) => {
        const updates: Partial<Attributes> = {};
        if (value.borderType !== undefined) {
            updates.navBorderType = value.borderType;
        }
        if (value.borderWidth !== undefined) {
            updates.navBorderWidth = value.borderWidth as any;
        }
        if (value.borderColor !== undefined) {
            updates.navBorderColor = value.borderColor;
        }
        setAttributes(updates);
    }}
    hideRadius={true} // If radius is handled separately
/>
```

## Affected Blocks (Confirmed)

Based on grep search results, the following blocks have border SelectControl issues:

### High Priority (Multiple border controls)

1. **cart-summary** - 7 instances
   - Primary button border
   - Secondary button border
   - Icon button border
   - Dropdown border
   - Input border
   - Cards border
   - File select border

2. **login** - Multiple instances
   - StyleTab.tsx
   - FieldStyleTab.tsx

3. **search-form** - Multiple instances
   - InlineTab.tsx
   - GeneralTab.tsx

### Medium Priority (Inspector tabs confirmed)

4. **post-feed** - StyleTab.tsx
5. **stripe-account** - StyleTab.tsx
6. **slider** - StyleTab.tsx
7. **quick-search** - StyleTab.tsx
8. **popup-kit** - StyleTab.tsx
9. **orders** - StyleTab.tsx
10. **navbar** - StyleTab.tsx
11. **listing-plans** - StyleTab.tsx
12. **gallery** - StyleTab.tsx
13. **map** - StyleTab.tsx
14. **advanced-list** - StyleTab.tsx
15. **flex-container** - StyleTab.tsx

### Additional Files

16. **create-post** - FieldStyleTab.tsx
17. **product-form** - StyleTab.tsx
18. **image** - StyleTab.tsx
19. **timeline-kit** - edit.tsx

## Migration Steps Per Block

For each affected block:

### 1. Update Imports
```tsx
// Remove from @wordpress/components if only used for border
import { SelectControl } from '@wordpress/components';

// Add to @shared/controls imports
import { BorderGroupControl } from '@shared/controls';
import type { BorderGroupValue } from '@shared/controls/BorderGroupControl';
```

### 2. Replace SelectControl Pattern

**Before:**
```tsx
<SelectControl
    label={__('Border Type', 'voxel-fse')}
    value={attributes.someBorderType}
    options={borderTypeOptions}
    onChange={(value) => setAttributes({ someBorderType: value })}
/>
{attributes.someBorderType !== 'none' && (
    <>
        <FourRangeControl label="Border Width" ... />
        <ColorControl label="Border Color" ... />
    </>
)}
```

**After:**
```tsx
<BorderGroupControl
    label={__('Border', 'voxel-fse')}
    value={{
        borderType: attributes.someBorderType || '',
        borderWidth: attributes.someBorderWidth || {},
        borderColor: attributes.someBorderColor || '',
    }}
    onChange={(value) => {
        const updates: Partial<Attributes> = {};
        if (value.borderType !== undefined) {
            updates.someBorderType = value.borderType;
        }
        if (value.borderWidth !== undefined) {
            updates.someBorderWidth = value.borderWidth as any;
        }
        if (value.borderColor !== undefined) {
            updates.someBorderColor = value.borderColor;
        }
        setAttributes(updates);
    }}
    hideRadius={true} // Set to false if border radius should be included
/>
```

### 3. Verify Attributes Exist

Ensure block.json has the required attributes with **EMPTY defaults**:

⚠️ **CRITICAL:** Defaults must be empty to allow "Default" selection!

```json
"someBorderType": {
    "type": "string",
    "default": ""  // ← EMPTY, not "solid"!
},
"someBorderWidth": {
    "type": "object",
    "default": {}  // ← EMPTY, not { top: 1, ... }!
},
"someBorderColor": {
    "type": "string",
    "default": ""
}
```

**Why empty defaults?**
- `"default": "solid"` → User cannot select "Default" (reverts to solid)
- `"default": ""` → User can select "Default" (inherits from theme)

### 4. Remove Orphaned Controls

Delete any standalone:
- FourRangeControl for border width
- ColorControl for border color
- Conditional rendering based on borderType !== 'none'

## Estimated Impact

- **~18 blocks** require updates
- **~30+ individual border controls** to migrate
- Each migration takes ~5-10 minutes
- Total estimated time: **3-4 hours**

## Benefits

1. ✅ **Full Elementor parity** - Matches Group_Control_Border exactly
2. ✅ **Consistent UX** - Same border interface across all blocks
3. ✅ **Reduced code** - One control instead of 3+ separate ones
4. ✅ **Better maintenance** - Centralized in shared library
5. ✅ **Type safety** - BorderGroupValue interface

## Next Steps

1. Start with **cart-summary** (highest impact - 7 instances)
2. Create template script/pattern for automated migration
3. Update blocks in order of priority
4. Test each block after migration
5. Update documentation with new pattern

## Notes

- BorderGroupControl supports optional radius control (`hideRadius` prop)
- Control automatically shows/hides width and color based on border type
- Matches Elementor's visual appearance exactly
- Already proven working in **term-feed** block
