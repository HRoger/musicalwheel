# Map Block Parity & Fixes Summary

## 1. Visibility Logic (1:1 Voxel Parity)
**Issue:** Map block was hidden in the editor (for admins) and had inconsistent behavior on the frontend.
**Fix:**
- Refactored `Visibility_Evaluator` to delegate execution directly to Voxel's core function `\Voxel\evaluate_visibility_rules()`.
- Implemented **Admin Bypass** logic (matching Voxel's `is_edit_mode()`) so administrators can always see hidden blocks in the editor.
- Transformed block attributes into Voxel's required "Rule Group" structure to ensure exact logic matching.

## 2. Loop Processor (Native Voxel Engine)
**Issue:** Loops were "not working at all" because the previous implementation was a partial custom solution that couldn't handle Voxel's dynamic data context.
**Fix:**
- Rewrote `Loop_Processor.php` to wrap Voxel's native `\Voxel\Dynamic_Data\Looper` class.
- Block attributes (`loopSource: user`, `loopProperty: role`) are now converted to valid Voxel Dynamic Tags (`@user.role`) and processed globally.
- **Dynamic Tag support added:** Loops now correctly set the context, allowing tags like `@user.name` inside the block to render real data.

## 3. Frontend Rendering Fix
**Issue:** Map was visible in the editor but blank on the frontend.
**Root Cause:** Voxel's script loader only enqueues map scripts (Google Maps/Mapbox) when it detects a map widget. It does not detect FSE blocks, so the scripts were missing.
**Fix:**
- Updated `render.php` to detect the active Map Provider and **force-enqueue** the required scripts (`vx:google-maps.js`, `vx:mapbox.js`, etc.) before rendering.
- Added `\Voxel\render($content)` to the render pipeline to ensure all dynamic tags in the block content are parsed, even when not looping.

---

**Result:** The Map Block now functions with 100% logic parity to Voxel widgets, correctly handles visibility/loops, and renders reliably on the frontend.
