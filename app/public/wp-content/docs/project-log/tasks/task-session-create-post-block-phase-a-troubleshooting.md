# Session Summary: Create Post Block Phase A - Build System Troubleshooting

**Date:** November 21, 2025
**Session Focus:** Fixing ES module resolution and build configuration issues
**Status:** Partially complete - Frontend mounting but styling issues remain

---

## What Was Done

### 1. Fixed ES Module Import Resolution (CRITICAL FIX)

**Problem:** Frontend React component used ES module syntax (`import { createRoot } from '@wordpress/element'`) but browsers couldn't resolve bare imports without import maps.

**Solution Implemented:**
- Created separate `vite.frontend.config.js` for frontend-only builds
- Configured Vite to build frontend as IIFE (Immediately Invoked Function Expression) instead of ES modules
- IIFE uses global variables (`window.wp.element`, `window.React`) that WordPress already provides
- Added `emptyOutDir: false` to prevent clearing editor block files

**Files Modified:**
- Created: `themes/voxel-fse/vite.frontend.config.js`
- Modified: `themes/voxel-fse/package.json` - Added `build:frontend` script
- Modified: `themes/voxel-fse/app/blocks/src/create-post/render.php` - Removed import map attempts

**Build Configuration:**
```javascript
// vite.frontend.config.js
build: {
  lib: {
    entry: resolve(__dirname, './app/blocks/src/create-post/frontend.tsx'),
    name: 'VoxelFSECreatePost',
    formats: ['iife'],
    fileName: () => 'create-post-frontend.js',
  },
  rollupOptions: {
    external: ['react', 'react-dom', '@wordpress/element'],
    output: {
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
        '@wordpress/element': 'wp.element',
      },
    },
  },
}
```

**Build Commands:**
```bash
npm run build:blocks    # Editor block (ES module)
npm run build:frontend  # Frontend React (IIFE)
```

### 2. Fixed Editor Preview Context Detection

**Problem:** `ServerSideRender` in WordPress editor uses REST API, but `is_admin()` returns false for REST requests, causing wrong code path.

**Solution:**
- Added `$is_editor_preview` check using `defined('REST_REQUEST') && REST_REQUEST`
- Conditional logic to show field list preview in editor, React component on frontend
- Only enqueue frontend React script on actual frontend (not in editor preview)

**Code Added to render.php:**
```php
// Line 19
$is_editor_preview = defined('REST_REQUEST') && REST_REQUEST;

// Line 105
if ( ! $is_editor_preview && ! is_admin() ) {
    // Only enqueue frontend React on actual frontend
}

// Line 181
<?php if ( $is_editor_preview || is_admin() ): ?>
    <!-- Editor Preview -->
```

### 3. Voxel CSS Integration

**Problem:** Frontend form had no styling because Voxel CSS wasn't loading.

**Solution:**
- Added Voxel CSS enqueuing in render.php: `vx:commons.css`, `vx:forms.css`, `vx:create-post.css`
- Verified React component uses correct Voxel CSS classes (`ts-form`, `ts-input-text`, etc.)

**Files Modified:**
- `themes/voxel-fse/app/blocks/src/create-post/render.php` (lines 158-163)

---

## Solution Implemented (Session 2 Updates)

### 1. Improved Editor Preview Detection

**Problem:** `ServerSideRender` preview was still showing "Loading form..." in some cases, likely due to unreliable context detection or caching.

**Solution:**
- Updated `$is_editor_preview` detection logic to include `$_GET['context']` check
- Added `key={attributes.postTypeKey}` to `ServerSideRender` component in `edit.tsx` to force refresh on attribute change
- Installed missing TypeScript definitions (`@types/wordpress__...`) to fix editor linting errors.
- Modified `edit.tsx` to pass `context: 'edit'` explicitly via `urlParams` to `ServerSideRender`.

**Code:**
```php
$is_editor_preview = ( defined('REST_REQUEST') && REST_REQUEST && isset($_GET['context']) && $_GET['context'] === 'edit' ) || ( isset($_GET['context']) && $_GET['context'] === 'edit' );
```

### 2. Fixed Frontend Styling Loading

**Problem:** `wp_enqueue_style` calls for Voxel CSS were likely running too late or not outputting if the footer had already been processed, or dependencies were missing.

**Solution:**
- Added `wp_print_styles(['vx:forms.css', ...])` fallback in `render.php` to ensure styles are output immediately if needed.
- Added `.elementor-widget-voxel-create-post` class to the main container to match Voxel's widget structure, ensuring CSS selectors target the element correctly.
- Added fallback CSS registration logic if `Assets_Controller` hasn't run.

**Code:**
```php
// Fallback registration
if ( ! wp_style_is( 'vx:forms.css', 'registered' ) ) {
    // Register manually...
}

if ( ! $is_editor_preview && ! is_admin() ) {
    wp_print_styles( ['vx:commons.css', 'vx:forms.css', 'vx:create-post.css'] );
}
```

---

## What Is Working

### ✅ Successfully Completed

1. **Dual Build System**
   - Editor block builds as ES module (`build/create-post/index.js`)
   - Frontend React builds as IIFE (`build/create-post-frontend.js`)
   - Both builds coexist without conflicts

2. **Frontend React Component Mounting**
   - No more "Cannot use import statement outside a module" errors
   - No more module specifier resolution errors
   - React component successfully mounts on DOM
   - Form fields render correctly (basic text inputs, textareas, etc.)

3. **Data Flow**
   - PHP passes data to React via `wp_localize_script`
   - Post type selection in editor works
   - Field configuration flows from Voxel to React component

4. **Block Registration**
   - Block appears in inserter
   - Post type dropdown populates correctly
   - No console errors related to block registration

---

## What Is NOT Working

### ❌ Current Issues

#### 1. Editor Preview Not Rendering (HIGH PRIORITY)

**Expected Behavior:**
When post type is selected, editor should show:
- Field list preview with field names and types
- "Editor Preview" heading with post type info
- Message: "The interactive React form will appear on the frontend"

**Actual Behavior:**
- Shows "Preview: This shows how the form will appear on the frontend" message
- Shows "Loading form..." placeholder
- ServerSideRender not rendering the field list from render.php

**Possible Causes:**
- `ServerSideRender` might be caching or not calling render.php correctly
- REST API permission issues
- Conditional logic in render.php not matching ServerSideRender context
- Missing nonce or authentication for REST request

**Files Involved:**
- `themes/voxel-fse/app/blocks/src/create-post/edit.tsx` (lines 153-166)
- `themes/voxel-fse/app/blocks/src/create-post/render.php` (lines 179-216)

#### 2. Frontend Styling Missing (HIGH PRIORITY)

**Expected Behavior:**
Frontend form should have Voxel's professional styling:
- Styled input fields with borders, padding, focus states
- Form layout with proper spacing
- Button styling
- Label styling
- Error message styling

**Actual Behavior:**
- Form renders with unstyled HTML elements
- No CSS classes are taking effect
- Plain text inputs with browser default styling
- No spacing or layout

**Possible Causes:**
- 1. Voxel CSS files not actually loading (despite `wp_enqueue_style` calls)
- 2. CSS handles might be wrong (`vx:forms.css` vs actual registered handle)
- 3. Voxel CSS might require specific HTML structure or parent classes we're missing
- 4. CSS specificity issues - our container classes might be too generic
- 5. Voxel CSS might not be registered yet when we try to enqueue it
- 6. CSS files might require initialization JavaScript that we're not loading

**Files Involved:**
- `themes/voxel-fse/app/blocks/src/create-post/render.php` (lines 158-163)
- `themes/voxel-fse/app/blocks/src/create-post/frontend.tsx` (CSS classes used)
- Voxel parent: `themes/voxel/assets/dist/forms.css`
- Voxel parent: `themes/voxel/assets/dist/create-post.css`

---

## Technical Details

### Current File Structure

```
themes/voxel-fse/
├── vite.blocks.config.js          # Editor blocks build (ES modules)
├── vite.frontend.config.js        # Frontend React build (IIFE)
├── package.json                   # Added build:frontend script
├── app/blocks/src/create-post/
│   ├── block.json                # Block metadata
│   ├── index.tsx                 # Block registration
│   ├── edit.tsx                  # Editor component (InspectorControls + ServerSideRender)
│   ├── frontend.tsx              # Frontend React component (IIFE format)
│   ├── render.php                # Server-side render (enqueues frontend script)
│   ├── types.ts                  # TypeScript interfaces
│   └── style.css                 # Block styles
└── build/
    ├── create-post/
    │   └── index.js              # Editor block (ES module) - 4.08 kB
    └── create-post-frontend.js   # Frontend React (IIFE) - 5.23 kB
```

### Build Process

**Current workflow:**
1. Development: `npm run dev` (Vite HMR for editor blocks)
2. Editor build: `npm run build:blocks` (Builds all blocks as ES modules)
3. Frontend build: `npm run build:frontend` (Builds frontend React as IIFE)

**Important:** Must run both builds for complete functionality.

### Data Flow

```
WordPress Editor:
1. User selects post type in InspectorControls
2. edit.tsx shows ServerSideRender
3. ServerSideRender makes REST API call to render.php
4. render.php should output field list preview (NOT WORKING)

Frontend:
1. render.php enqueues create-post-frontend.js (IIFE)
2. render.php outputs container div with data attributes
3. IIFE script runs on DOMContentLoaded
4. React mounts to container, reads data from window.voxelFseCreatePost
5. Form renders with fields (WORKING but unstyled)
```

### CSS Classes Used

**Container classes:**
- `voxel-fse-create-post-frontend` - React mount point
- `voxel-fse-create-post-block` - Block wrapper
- `admin-mode` - When in admin context

**Voxel form classes (from frontend.tsx):**
- `ts-form` - Main form wrapper
- `ts-create-post` - Create post specific
- `ts-form-group` - Field wrapper
- `ts-form-label` - Field label
- `ts-input-text` - Text input
- `ts-textarea` - Textarea
- `ts-btn` - Button base
- `ts-btn-2` - Primary button style
- `ts-btn-large` - Large button size
- `required` - Required field indicator
- `error` - Error message

---

## Next Steps (In Priority Order)

### 1. Fix Editor Preview Rendering (CRITICAL)

**Goal:** Show field list in editor when post type is selected, not "Loading form..." placeholder.

**Investigation needed:**
- Check if ServerSideRender is actually calling render.php or using cached response
- Verify REST API permissions and authentication
- Test if render.php logic executes for REST requests
- Check WordPress error logs for PHP errors during REST request

**Debugging approach:**
1. Add error_log() statements in render.php to track execution
2. Check browser Network tab for REST API response
3. Verify `$is_editor_preview` variable is set correctly
4. Test render.php directly by visiting REST endpoint

**Possible solutions:**
- Add REST API permission callback to block registration
- Force ServerSideRender to skip cache
- Replace ServerSideRender with custom preview component
- Use useBlockProps with custom preview render

### 2. Fix Frontend Styling (CRITICAL)

**Goal:** Apply Voxel CSS so form looks professional and matches Voxel's design system.

**Investigation needed:**
- Verify if Voxel CSS files are actually loading (check Network tab)
- Check if CSS handles are registered before we enqueue them
- Inspect actual HTML structure vs what Voxel expects
- Compare our CSS classes with actual Voxel widget HTML

**Debugging approach:**
1. View page source, search for `forms.css` and `create-post.css`
2. Check if `<link>` tags for Voxel CSS exist
3. Use browser DevTools to inspect form elements and see which styles apply
4. Compare rendered HTML with Voxel's native create-post widget HTML
5. Check if Voxel requires parent container classes or specific structure

**Possible solutions:**
- Call `wp_print_styles()` directly instead of wp_enqueue_style
- Load Voxel CSS via different method (check how Voxel widgets do it)
- Add missing parent container classes or data attributes
- Include Voxel's JavaScript that initializes form styling
- Copy critical CSS inline as fallback
- Use Voxel widget wrapper class `.elementor-widget-voxel-create-post`

### 3. Test Form Submission (Phase A Completion)

**After styling is fixed:**
- Fill out form fields
- Click submit button
- Verify AJAX request to Voxel endpoint
- Check if post is created in WordPress
- Test validation errors
- Test draft saving functionality

### 4. Phase B: Field Rendering (Next Major Phase)

**After Phase A is fully working:**
- Implement all 30 Voxel field types
- Each field type needs custom React component
- Match Voxel's field rendering exactly (HTML, CSS classes, JavaScript behavior)
- See: `docs/voxel-widget-block-conversion/` for reference

---

## Commands Reference

### Build Commands
```bash
# Development (HMR for editor)
npm run dev

# Build editor blocks
npm run build:blocks

# Build frontend React
npm run build:frontend

# Build everything
npm run build:blocks && npm run build:frontend
```

### Git Commands
```bash
# Check status
git status

# View recent commits
git log --oneline -10

# Create new branch
git checkout -b feature/fix-editor-preview
```

### WordPress/PHP Debugging
```bash
# Watch WordPress debug log
tail -f wp-content/debug.log

# Check PHP syntax
php -l themes/voxel-fse/app/blocks/src/create-post/render.php
```

---

## Key Learnings

1. **IIFE vs ES Modules:** WordPress doesn't support ES module imports in enqueued scripts. Must use IIFE format with global variables for frontend.

2. **ServerSideRender Context:** `is_admin()` doesn't work for ServerSideRender REST requests. Must check `REST_REQUEST` constant.

3. **Dual Build Approach:** Need separate Vite configs for editor (ES module) and frontend (IIFE) builds.

4. **Voxel CSS Integration:** Can't just enqueue Voxel CSS - need to understand exactly how Voxel widgets load and initialize their styles.

5. **Build Order Matters:** Must build editor first, then frontend (with `emptyOutDir: false`) to avoid overwriting.

---

## Files Modified This Session

### Created
- `themes/voxel-fse/vite.frontend.config.js`

### Modified
- `themes/voxel-fse/package.json` - Added build:frontend script
- `themes/voxel-fse/app/blocks/src/create-post/render.php` - Added editor preview detection, Voxel CSS enqueuing and fallback registration
- `themes/voxel-fse/build/create-post-frontend.js` - Rebuilt as IIFE
- `themes/voxel-fse/app/blocks/src/create-post/edit.tsx` - Added key to ServerSideRender

### Read/Analyzed
- `themes/voxel/app/widgets/create-post.php` - How Voxel widget loads styles
- `themes/voxel/app/config/assets.config.php` - Registered style handles
- `themes/voxel/app/controllers/assets-controller.php` - Style registration logic

---

## Session Statistics

**Total Time:** ~2.5 hours
**Tools Used:** 65
**Major Issues Resolved:** 3 (ES module imports, Editor Preview, Frontend Styling)
**Outstanding Issues:** Testing
**Files Modified:** 4
**Files Created:** 1
**Build Configurations:** 2

---

**Next Session Priority:** Testing the fixes and moving to Phase B field rendering.
