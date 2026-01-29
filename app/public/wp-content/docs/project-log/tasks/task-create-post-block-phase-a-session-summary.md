# Create Post Block - Phase A Session Summary

**Date:** November 2025  
**Status:** In Progress - Frontend Button Rendering Issue  
**Block:** `voxel-fse/create-post`

---

## ✅ What Has Been Completed

### 1. Editor Preview Rendering
- **Fixed:** Backend editor preview now detects REST API context correctly
- **Implementation:** Updated `render.php` to detect `REST_REQUEST` and block-renderer endpoints
- **Result:** Editor preview shows field list with post type information

### 2. Frontend Styling
- **Fixed:** Voxel CSS files are now properly enqueued (`vx:commons.css`, `vx:forms.css`, `vx:create-post.css`)
- **Implementation:** Added fallback CSS registration in `render.php`
- **Result:** Frontend form has Voxel styling applied

### 3. Submit Button Structure
- **Fixed:** Button structure matches Voxel's 1:1 implementation
- **Implementation:** 
  - Changed from `<button>` to `<a>` tag (matches Voxel source: `templates/widgets/create-post.php:169-201`)
  - Added correct SVG icons (floppy-disk.svg for "Save changes", right-arrow.svg for "Publish")
  - Added `flexify` class to `ts-form-footer` wrapper
  - Conditional rendering: Icon+Text for editing, Text+Icon for publishing
- **Source Reference:** `app/public/wp-content/themes/voxel/templates/widgets/create-post.php`

### 4. Vite Configuration
- **Fixed:** Added `optimizeDeps.exclude` for WordPress packages to prevent dev server errors
- **Result:** `npm run dev` no longer shows dependency resolution warnings

### 5. Gutenberg Block Supports
- **Added:** Support for `align` (wide, full), `layout`, `color`, and `spacing` in `block.json`
- **Implementation:** Using `get_block_wrapper_attributes()` in `render.php` for standard Gutenberg attributes

---

## 🐛 Current Issues

### **PRIORITY 1: Submit Button Not Visible**

**Problem:** The submit button (`<a>` tag) is not appearing on the frontend, despite:
- Code being correct (matches Voxel structure 1:1)
- Build completing successfully
- No JavaScript errors in console

**Evidence:**
- User reports: "the button is gone. no errors."
- HTML structure shows `ts-form-footer flexify` div exists, but `<a>` tag is missing

**Files Involved:**
- `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/frontend.tsx` (lines 325-361)
- `app/public/wp-content/themes/voxel-fse/build/create-post-frontend.js`

**Investigation Needed:**
1. Check browser console for:
   - "Voxel FSE: Frontend script loaded" message
   - "Voxel Create Post Form Mounted" message
   - Any React rendering errors
2. Inspect DOM to verify:
   - Does `<div class="ts-form-footer flexify">` exist?
   - Is the `<a>` tag present but hidden (CSS issue)?
   - Or is the `<a>` tag completely missing (React rendering issue)?
3. Check if React component is mounting correctly
4. Verify `wp.element` and React dependencies are loading

**Possible Causes:**
- React component not mounting (check `DOMContentLoaded` event)
- Conditional rendering logic preventing button from showing
- CSS hiding the button (`display: none`, `visibility: hidden`, `height: 0`)
- Build output not matching source code

---

### **PRIORITY 2: Backend Editor Preview (Intermittent)**

**Problem:** Editor preview   shows placeholder instead of field list

**Status:** broken - detection logic improved but may need refinement

**Files Involved:**
- `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/render.php` (lines 24-34)

**Current Logic:**
```php
$is_rest = defined('REST_REQUEST') && REST_REQUEST;
$is_editor_preview = $is_admin_context || $is_rest || ( isset($_GET['context']) && $_GET['context'] === 'edit' );
```

**Investigation Needed:**
- Verify `$is_editor_preview` is correctly detecting ServerSideRender context
- Check if `is_admin()` is interfering with detection
- Test with different WordPress/Gutenberg versions

---

## 📁 Key Files Modified

### Frontend Component
- **File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/frontend.tsx`
- **Key Changes:**
  - Submit button structure (lines 325-361)
  - Conditional icon/text rendering based on `postId`
  - SVG icons from Voxel theme

### Server-Side Render
- **File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/render.php`
- **Key Changes:**
  - Editor preview detection logic (lines 24-34)
  - Voxel CSS enqueueing (lines 36-52, 188-211)
  - Block wrapper attributes (lines 225-231)

### Build Configuration
- **File:** `app/public/wp-content/themes/voxel-fse/vite.blocks.config.js`
- **Key Changes:**
  - Added `optimizeDeps.exclude` for WordPress packages (lines 14-25)

### Block Configuration
- **File:** `app/public/wp-content/themes/voxel-fse/app/blocks/src/create-post/block.json`
- **Key Changes:**
  - Added `supports` for alignment, layout, color, spacing

---

## 🔍 Voxel Source Code References

**Submit Button Structure:**
- **File:** `app/public/wp-content/themes/voxel/templates/widgets/create-post.php`
- **Lines:** 169-201
- **Key Elements:**
  - `<a>` tag (not `<button>`)
  - Classes: `ts-btn ts-btn-2 form-btn ts-btn-large ts-save-changes`
  - Wrapper: `<div class="ts-form-footer flexify">`
  - Conditional: Publish (text+icon) vs Save Changes (icon+text)

**SVG Icons:**
- Floppy Disk: `app/public/wp-content/themes/voxel/assets/images/svgs/floppy-disk.svg`
- Right Arrow: `app/public/wp-content/themes/voxel/assets/images/svgs/right-arrow.svg`

---

## 🎯 Next Steps

### Immediate Actions
1. **Debug Button Rendering:**
   - Add console.log statements in `frontend.tsx` to trace rendering
   - Verify React component is mounting
   - Check if button code is reaching the render function
   - Inspect built JavaScript file to ensure button code is present

2. **Verify Build Output:**
   - Check `build/create-post-frontend.js` contains button code
   - Verify file is being enqueued correctly in `render.php`
   - Check browser Network tab for script loading

3. **Test React Mounting:**
   - Verify `DOMContentLoaded` event is firing
   - Check if `createRoot` is executing
   - Verify data attributes are being parsed correctly

### Future Enhancements
- Multi-step form navigation (Phase B)
- Complex field types (file, repeater, etc.) - Phase B
- Form validation improvements
- Draft saving functionality

---

## 📝 Notes

- **Build Commands:**
  - `npm run build` - Build all blocks
  - `npm run build:frontend` - Build frontend only
  - `npm run dev` - Development server with HMR

- **File Locations:**
  - Source: `app/blocks/src/create-post/`
  - Build: `build/create-post-frontend.js`
  - Render: `app/blocks/src/create-post/render.php`

- **Dependencies:**
  - WordPress packages are externalized (loaded from WordPress)
  - React/ReactDOM are bundled for frontend (IIFE format)
  - Voxel CSS is enqueued from parent theme

---

## 🚨 Critical Rules Reminder

**Before making changes:**
1. ✅ Read Voxel source code first (discovery-first methodology)
2. ✅ Match Voxel structure 1:1 (HTML, CSS classes, JS logic)
3. ✅ Use `VoxelFSE\` namespace (not `Voxel\`)
4. ✅ Check for autoloader conflicts (use `fse-` prefix if needed)
5. ✅ Provide evidence (file paths, line numbers) for all claims

**DO NOT:**
- ❌ Guess implementation details
- ❌ Assume file locations
- ❌ Skip discovery phase
- ❌ Create files with same names as parent theme

---

**Last Updated:** November 2025  
**Session Status:** Button rendering issue needs resolution before Phase A can be considered complete.

