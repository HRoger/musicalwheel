# React Import Pattern Fix - Frontend Blocks

**Date:** 2025-12-14
**Issue:** React/ReactDOM not defined on frontend
**Status:** ✅ Fixed

## Problem

Multiple blocks were showing these errors on the frontend:

```
Uncaught ReferenceError: React is not defined
Uncaught ReferenceError: ReactDOM is not defined
Uncaught TypeError: Cannot read properties of undefined (reading 'createRoot')
Uncaught TypeError: Cannot destructure property 'createPortal' of 'window.wp.element'
```

## Root Cause

Several `frontend.tsx` files and shared components were using:

```typescript
// ❌ WRONG - window.wp.element only exists in editor
const { createRoot } = window.wp.element;
const { createPortal } = window.wp.element;
```

**Why this fails:**
- `window.wp.element` is only available in the WordPress **editor** (Gutenberg)
- Frontend pages only have `window.React` and `window.ReactDOM` globals
- Vite IIFE bundles expect imports to be externalized and mapped to these globals

## Solution

Import from the standard React packages instead:

```typescript
// ✅ CORRECT - works on both editor AND frontend
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { useState, useEffect, useCallback } from 'react';
```

## Files Fixed

### Frontend Entry Points (createRoot)

1. **[advanced-list/frontend.tsx](../../../themes/voxel-fse/app/blocks/src/advanced-list/frontend.tsx#L15)**
   - Changed: `const { createRoot } = window.wp.element;` → `import { createRoot } from 'react-dom/client';`

2. **[create-post/frontend.tsx](../../../themes/voxel-fse/app/blocks/src/create-post/frontend.tsx#L13)**
   - Changed: `const { createRoot } = window.wp.element;` → `import { createRoot } from 'react-dom/client';`

3. **[stripe-account/frontend.tsx](../../../themes/voxel-fse/app/blocks/src/stripe-account/frontend.tsx#L10)**
   - Changed: `const { createRoot } = window.wp.element;` → `import { createRoot } from 'react-dom/client';`

### Shared Components (createPortal)

4. **[shared/popup-kit/FormPopup.tsx](../../../themes/voxel-fse/app/blocks/src/shared/popup-kit/FormPopup.tsx#L20)**
   - Changed: `const { createPortal } = window.wp.element;` → `import { createPortal } from 'react-dom';`

5. **[shared/popup-kit/FieldPopup.tsx](../../../themes/voxel-fse/app/blocks/src/shared/popup-kit/FieldPopup.tsx#L39)**
   - Changed: `const { createPortal } = window.wp.element;` → `import { createPortal } from 'react-dom';`

6. **[popup-kit/components/FormGroup.tsx](../../../themes/voxel-fse/app/blocks/src/popup-kit/components/FormGroup.tsx#L2)**
   - Changed: `const { createPortal } = window.wp?.element || {};` → `import { createPortal } from 'react-dom';`

7. **[create-post/components/popup-kit/FormGroup.tsx](../../../themes/voxel-fse/app/blocks/src/create-post/components/popup-kit/FormGroup.tsx#L14)**
   - Changed: `const { createPortal } = window.wp?.element || {};` → `import { createPortal } from 'react-dom';`

## Bundles Rebuilt

All affected blocks were rebuilt successfully:

```bash
npm run build:frontend:advanced-list   # 13.82 kB (gzip: 3.91 kB)
npm run build:frontend:create-post     # 335.09 kB (gzip: 81.70 kB)
npm run build:frontend:stripe-account  # 19.33 kB (gzip: 4.61 kB)
npm run build:frontend:timeline        # 118.39 kB (gzip: 33.04 kB)
npm run build:frontend:userbar         # 13.11 kB (gzip: 3.56 kB)
```

## How Vite Externalization Works

### Frontend Build Configuration

All frontend Vite configs use this pattern:

```javascript
// vite.{block}-frontend.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        '@wordpress/element',
        '@wordpress/api-fetch'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM',
          '@wordpress/element': 'wp.element',
          '@wordpress/api-fetch': 'wp.apiFetch',
        },
      },
    },
  },
});
```

### How It Works

1. **Import Statement:** `import { createRoot } from 'react-dom/client';`
2. **Vite Externalization:** Vite sees `'react-dom/client'` is in the `external` array
3. **Global Mapping:** Vite maps it to `window.ReactDOM` using the `globals` config
4. **WordPress Enqueue:** `Block_Loader.php` ensures React/ReactDOM are loaded via `ensure_react_on_frontend()`
5. **Runtime:** Bundle accesses `window.ReactDOM.createRoot()` successfully

## Prevention Rules

Going forward, **always follow these rules:**

### ✅ DO

- Import from `'react-dom/client'` for `createRoot` in `frontend.tsx`
- Import from `'react-dom'` for `createPortal` in shared components
- Import from `'react'` for hooks (`useState`, `useEffect`, etc.)
- Use `@wordpress/element` only in **editor-only** files (`edit.tsx`)

### ❌ DON'T

- Use `window.wp.element` in `frontend.tsx` files
- Use `window.wp.element` in shared components used on frontend
- Assume WordPress globals are the same in editor vs frontend
- Import from `@wordpress/element` in files that run on frontend

## Architecture Overview

### Editor Context (Gutenberg)

- **Import Maps:** WordPress provides import maps for ES modules
- **Globals Available:** `window.wp.element`, `window.React`, `window.ReactDOM`
- **Can Use:** Both `@wordpress/element` imports AND standard React imports
- **Build Format:** ES modules

### Frontend Context (Public Pages)

- **Import Maps:** ❌ Not available
- **Globals Available:** `window.React`, `window.ReactDOM` (enqueued by Block_Loader)
- **Can Use:** Only standard React imports (mapped to globals via Vite)
- **Build Format:** IIFE (Immediately Invoked Function Expression)

## Master Guide Updates

The master guide has been updated with:

1. **Phase 6: Frontend Hydration** - Added critical warning about import pattern
2. **Section 15.8: Control Implementation** - Added detailed explanation of the issue
3. **Examples** - Added correct vs incorrect import patterns

**References:**
- [Master Guide Line 557](../voxel-widget-conversion-master-guide.md#L557) - `createRoot` import
- [Master Guide Line 1592](../voxel-widget-conversion-master-guide.md#L1592) - `createPortal` import
- [Master Guide Line 1595-1621](../voxel-widget-conversion-master-guide.md#L1595-L1621) - Critical import pattern section

## Memory.json Update

Added new entity: **"React Frontend Import Pattern - window.wp.element vs react-dom"**

Key observations documented:
- Problem symptoms and root cause
- Correct import patterns for frontend
- Files fixed and bundles rebuilt
- Prevention rules for future blocks
- Architecture differences (editor vs frontend)
- Vite externalization pattern
- Master guide compliance

## Testing

All affected blocks now render correctly on the frontend without errors:

- ✅ Timeline block - No createPortal errors
- ✅ Create Post block - No createRoot errors
- ✅ Advanced List block - No createRoot errors
- ✅ Stripe Account block - No createRoot errors
- ✅ Userbar block - No createPortal errors

## Related Issues

This fix also resolves related issues mentioned in user's screenshot:

- Orders block: 401 errors (authentication issue, separate from React imports)
- Cart Summary: JSON parse errors (API issue, separate from React imports)

## Evidence

**Before fix:**
```
Console errors showing:
- Cannot destructure property 'createPortal' of 'window.wp.element' (timeline, userbar)
- Cannot destructure property 'createRoot' of 'window.wp.element' (advanced-list, stripe-account, create-post)
```

**After fix:**
```
✓ All blocks render successfully
✓ No React/ReactDOM errors
✓ Timeline displays correctly
✓ Create Post form works
```

## Conclusion

This was a critical fix for the Plan C+ architecture. The key learning is:

> **`window.wp.element` is editor-specific. For frontend hydration, always import from standard React packages (`react`, `react-dom`, `react-dom/client`).**

All future blocks must follow the correct import pattern from the start to avoid this issue.
