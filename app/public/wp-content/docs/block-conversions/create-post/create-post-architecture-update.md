# Create Post Block - Architecture Update

**Date:** November 2025
**Status:** ✅ Dual Build System Implemented | ⚠️ Styling Issues Remain
**Last Updated:** November 21, 2025

---

## IMPLEMENTED ARCHITECTURE

### React on BOTH Editor AND Frontend ✅

**Previous Incorrect Assumption:**
❌ "Reuse Voxel's Vue system on frontend" - This was WRONG

**Correct Architecture (NOW IMPLEMENTED):**
✅ **React on Editor** (edit.tsx) - Gutenberg configuration UI
✅ **React on Frontend** (frontend.tsx) - Public-facing interactive form
✅ **NO Vue.js on frontend** - Don't try to reuse Voxel's Vue components
✅ **NO Vanilla JS** - React for consistency and Phase 4 readiness
✅ **Dual Build System** - Separate builds for editor (ES modules) and frontend (IIFE)

---

## Why React on Frontend?

**From project requirements:**

1. **Consistency** - Same patterns across ALL blocks
2. **Maintainability** - One approach, easier to maintain
3. **Phase 4 Ready** - Easier to port to Next.js headless
4. **Better DX** - React is easier than vanilla JS
5. **Already in build** - React already available
6. **State management** - Even simple blocks benefit

**Key Insight:** "Vanilla JS = Technical debt that will hurt in Phase 4"

---

## File Structure (IMPLEMENTED)

```
app/blocks/src/create-post/
├── block.json              # Block metadata ✅
├── index.tsx               # Block registration ✅
├── edit.tsx                # Editor component (Gutenberg UI) ✅
├── frontend.tsx            # PUBLIC FRONTEND React component ✅
├── types.ts                # TypeScript interfaces ✅
├── render.php              # Enqueues frontend.tsx + outputs container ✅
├── style.css               # Block styles ✅
└── components/             # Shared components (Phase B)
    ├── FieldRenderer.tsx   # Reusable field components (TODO)
    ├── FileUpload.tsx      # File upload UI (TODO)
    ├── FormStep.tsx        # Multi-step navigation (TODO)
    └── ValidationErrors.tsx (TODO)
```

---

## Build Configuration (IMPLEMENTED ✅)

### Dual Build System (Critical Solution)

**Problem Solved:** WordPress doesn't support ES module imports in enqueued scripts. Bare imports like `import { createRoot } from '@wordpress/element'` fail with "Cannot resolve module specifier" errors.

**Solution:** Separate Vite configs for different build formats:

#### 1. Editor Build (ES Modules)
- **Config:** `vite.blocks.config.js`
- **Input:** `index.tsx`
- **Output:** `build/create-post/index.js` (ES module)
- **Format:** ES modules (WordPress editor supports this)
- **Command:** `npm run build:blocks`
- **Size:** 4.08 kB
- **Loaded:** WordPress editor only

#### 2. Frontend Build (IIFE)
- **Config:** `vite.frontend.config.js` ✅ NEW
- **Input:** `frontend.tsx`
- **Output:** `build/create-post-frontend.js` (IIFE)
- **Format:** IIFE (Immediately Invoked Function Expression)
- **Command:** `npm run build:frontend` ✅ NEW
- **Size:** 5.23 kB
- **Loaded:** Public pages via render.php
- **Uses Globals:** `window.wp.element`, `window.React`, `window.ReactDOM`

**Key Config Settings:**
```javascript
// vite.frontend.config.js
build: {
  outDir: 'build',
  emptyOutDir: false, // Don't overwrite editor build
  lib: {
    entry: resolve(__dirname, './app/blocks/src/create-post/frontend.tsx'),
    name: 'VoxelFSECreatePost',
    formats: ['iife'], // Critical: Not 'es'
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

**Build Order:** Must run both builds:
```bash
npm run build:blocks    # First: Editor blocks
npm run build:frontend  # Second: Frontend React (with emptyOutDir: false)
```

---

## CSS Architecture

**Editor UI:** WordPress components styling
**Frontend Form:** MUST use Voxel CSS classes (⚠️ ISSUE: Not loading yet)

### Current Status:
- ✅ React component uses correct Voxel CSS classes
- ⚠️ CSS files not loading on frontend (investigation needed)
- ⚠️ Form renders but completely unstyled

### Voxel CSS Classes Used (from frontend.tsx):
```typescript
// Container
<div className="ts-form ts-create-post create-post-form">

// Form groups
<div className="ts-form-group field-{type}">
  <label className="ts-form-label">
    {label}
    <span className="required">*</span>
  </label>
  <input className="ts-input-text" />
  <textarea className="ts-textarea" />
</div>

// Buttons
<button className="ts-btn ts-btn-2 ts-btn-large ts-save-changes">
  Submit
</button>

// Success state
<div className="ts-edit-success">
  <div className="success-icon">✓</div>
  <a className="ts-btn ts-btn-2 ts-btn-large">View Post</a>
</div>
```

### Attempted CSS Loading (render.php):
```php
// Enqueue Voxel's form styles (NOT WORKING YET)
if ( function_exists( 'voxel' ) ) {
    wp_enqueue_style( 'vx:commons.css' );
    wp_enqueue_style( 'vx:forms.css' );
    wp_enqueue_style( 'vx:create-post.css' );
}
```

**Next Session:** Debug why Voxel CSS isn't loading despite enqueue calls.

---

## Implementation Summary

| Component | Technology | File | Status | Purpose |
|-----------|-----------|------|--------|---------|
| Editor UI | React | edit.tsx | ✅ Working | Gutenberg settings |
| Frontend Form | React | frontend.tsx | ✅ Mounting | Public interactive form |
| Server Render | PHP | render.php | ⚠️ Partial | Enqueue frontend + container |
| Styling | Voxel CSS | - | ❌ Not loading | Match Voxel exactly |
| Editor Preview | ServerSideRender | render.php | ❌ Stuck | Show field list |

---

## Current Issues (Nov 21, 2025)

### ❌ Issue 1: Editor Preview Shows "Loading form..."
**Expected:** Field list preview in editor
**Actual:** Stuck on "Loading form..." placeholder
**File:** `edit.tsx` lines 162-165, `render.php` lines 179-216
**Blocker:** Prevents editor workflow

### ❌ Issue 2: Frontend Styling Missing
**Expected:** Voxel's professional form styling
**Actual:** Completely unstyled HTML form
**File:** `render.php` lines 158-163
**Blocker:** Prevents visual testing

**Next Steps:** See `docs/project-log/prompts/prompt-fix-create-post-editor-and-styling.md`

---

## Key Learnings

### ✅ What Worked:
1. **IIFE Build Format** - Solves ES module import issues
2. **Dual Build System** - Separate configs for editor/frontend
3. **React Component Mounting** - Successfully mounts on DOM
4. **Data Flow** - PHP to React via wp_localize_script works

### ⚠️ What Needs Work:
1. **ServerSideRender Context** - Editor preview not rendering
2. **Voxel CSS Integration** - Styles not loading despite enqueue
3. **HTML Structure** - May need to match Voxel widget exactly

### 🔑 Critical Insights:
- WordPress doesn't support ES module imports in enqueued scripts
- Must use IIFE format with global variables for frontend
- `is_admin()` doesn't work for ServerSideRender (uses REST API)
- Voxel CSS might require specific initialization or parent classes

---

**Status:** Dual build system complete ✅ | Styling and preview blocked ⚠️
**Next Phase:** Fix editor preview and CSS loading before Phase B field rendering
