# Popup Kit Block - Viewport Re-rendering Issue Resolution

**Date:** November 26, 2025  
**Status:** ✅ RESOLVED  
**Issue:** Block preview not updating when switching viewports in Gutenberg editor

---

## Problem Summary

The Popup Kit block was not visually updating when switching between Desktop, Tablet, and Mobile viewports in the Gutenberg editor. Despite:
- ✅ Viewport detection working correctly
- ✅ Custom events being dispatched
- ✅ ServerSideRender remounting with new keys
- ✅ REST API requests being made with correct viewport parameters
- ✅ `render.php` generating correct HTML with viewport-specific classes
- ✅ `data-viewport` attribute updating correctly in DOM

The visual preview remained static and did not reflect viewport changes.

---

## Root Cause

**Voxel's default popup-kit widget includes CSS that hides the popup on screens smaller than 1024px in preview mode:**

```html
<!-- The markup on this page is entirely static for preview purposes -->
<style>
    @media (max-width:1024px) {
        .popup-kit-holder { display: none !important; }
    }
</style>
```

This is intentional Voxel behavior for the Elementor widget preview. The popup is designed to be hidden on smaller screens during preview to prevent layout issues.

---

## Solution

**No code changes required.** This is expected Voxel behavior. The block correctly:
1. Detects viewport changes
2. Passes viewport parameters to `render.php`
3. Generates viewport-specific CSS
4. Updates the DOM

The visual "non-update" is actually Voxel's CSS hiding the popup on tablet/mobile viewports, which is the intended design.

---

## Technical Implementation Details

### Viewport Detection System

1. **Central Subscriber** (`Block_Loader.php`):
   - `wp.data.subscribe()` listener watches for viewport changes
   - Dispatches `voxel-fse:editorPreviewChanged` custom event

2. **Block Event Listener** (`edit.tsx`):
   - Listens for `voxel-fse:editorPreviewChanged` event
   - Updates `forceUpdate` state to trigger re-render

3. **ServerSideRender Key**:
   - Includes `viewportParam`, `cacheBust`, and `forceUpdate`
   - Forces remount on any change

4. **Attribute Passing**:
   - `_viewport` and `_cacheBust` added as transient attributes in `block.json`
   - Passed directly to `render.php` via attributes

5. **CSS Generation** (`render.php`):
   - Generates viewport-specific CSS classes
   - Outputs `data-viewport` and `data-cache-bust` attributes

### Files Modified

- `app/blocks/src/popup/block.json` - Added `_viewport` and `_cacheBust` attributes
- `app/blocks/src/popup/edit.tsx` - Viewport detection, event listener, forceUpdate state
- `app/blocks/src/popup/render.php` - Viewport-specific CSS generation
- `app/blocks/Block_Loader.php` - Central viewport subscriber, removed debug logs

---

## Lessons Learned

1. **Voxel CSS Behavior**: Always check Voxel's default CSS when implementing features. The parent theme may have intentional preview behaviors.

2. **Viewport Detection Works**: The entire viewport detection infrastructure is working correctly. The issue was a CSS override, not a detection problem.

3. **Debug Logging**: Removed excessive debug logging that was cluttering error logs.

---

## Next Steps

Continue with remaining InspectorControls implementation:
- Popup: Buttons section (Normal/Hover tabs)
- Popup: Label and description section
- Popup: Menu styling section (Normal/Hover/Selected/Parent tabs)
- Popup: Cart section

See `popup-kit-inspector-controls-prompt.md` for detailed implementation instructions.

