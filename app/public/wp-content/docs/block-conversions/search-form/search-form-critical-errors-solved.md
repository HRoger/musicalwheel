# Search Form Block - Block Registration & Import Map Issues Solved

**Created:** December 2025
**Purpose:** Document block registration process and WordPress import map compatibility issues

---

## Table of Contents

1. [Block Registration Overview](#block-registration-overview)
2. [Error #1: React Hooks Import Resolution](#error-1-react-hooks-import-resolution)
3. [Error #2: `__experimentalBoxControl` Not Available](#error-2-experimentalboxcontrol-not-available)
4. [Error #3: `RadioControl` Not Available](#error-3-radiocontrol-not-available)
5. [WordPress Import Maps Explained](#wordpress-import-maps-explained)
6. [Best Practices & Patterns](#best-practices--patterns)

---

# Block Registration Overview

## Auto-Discovery System

The voxel-fse theme uses an **automatic block discovery system** via `Block_Loader.php`.

### How It Works:

**File:** `themes/voxel-fse/app/blocks/Block_Loader.php`

```php
<?php
namespace VoxelFSE\Blocks;

class Block_Loader {
    public function __construct() {
        add_action( 'init', [ $this, 'register_blocks' ] );
    }

    public function register_blocks() {
        // Auto-discover all block.json files in src directory
        $blocks_dir = get_stylesheet_directory() . '/app/blocks/src';

        foreach ( glob( $blocks_dir . '/*/block.json' ) as $block_json ) {
            register_block_type( dirname( $block_json ) );
        }
    }
}

// Initialize
new Block_Loader();
```

### What This Means:

✅ **No manual registration needed** - Just create `block.json` in your block directory
✅ **Auto-discovery** - Block_Loader finds all blocks automatically
✅ **Standard WordPress API** - Uses `register_block_type()`
✅ **ES Module support** - Import maps enabled for editor context

---

## Search Form Block Structure

```
themes/voxel-fse/app/blocks/src/search-form/
├── block.json                          # ⭐ Auto-discovered by Block_Loader
├── index.tsx                           # Editor entry point
├── edit.tsx                            # Editor component
├── render.php                          # Frontend bootstrap
├── frontend.tsx                        # Frontend entry point
├── style.css                           # Shared styles
├── editor.css                          # Editor-only styles
├── shared/
│   └── SearchFormComponent.tsx         # Shared component (editor + frontend)
├── components/
│   ├── FilterKeywords.tsx
│   ├── FilterRange.tsx
│   ├── FilterTerms.tsx
│   └── ... (16 filter components)
├── inspector/
│   ├── ContentTab.tsx
│   ├── GeneralTab.tsx
│   └── InlineTab.tsx
├── hooks/
│   ├── useSearchForm.ts
│   ├── usePostTypes.ts
│   └── useFilters.ts
└── types.ts
```

---

## block.json Configuration

**File:** `themes/voxel-fse/app/blocks/src/search-form/block.json`

```json
{
  "apiVersion": 3,
  "name": "voxel-fse/search-form",
  "version": "1.0.0",
  "title": "Search Form",
  "category": "voxel-fse",
  "icon": "search",
  "description": "Advanced search form with filters for Voxel post types",
  "keywords": ["search", "filter", "voxel"],
  "textdomain": "voxel-fse",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "style": "file:./style.css",
  "render": "file:./render.php",
  "supports": {
    "html": false,
    "anchor": true
  },
  "attributes": {
    "postTypes": {
      "type": "array",
      "default": []
    },
    "onSubmit": {
      "type": "string",
      "default": "refresh"
    }
  }
}
```

**Key Points:**

- ✅ `editorScript: "file:./index.js"` - Vite builds this as ES module
- ✅ `render: "file:./render.php"` - Server-side rendering bootstrap
- ✅ `apiVersion: 3` - Modern block API with import map support

---

## Build System: Dual Configuration

The Search Form block uses **TWO separate Vite configurations**:

### 1. Editor Build (ES Modules)

**File:** `vite.blocks.config.js`

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es', // ✅ ES modules for editor
      },
      external: [
        '@wordpress/blocks',
        '@wordpress/block-editor',
        '@wordpress/components',
        '@wordpress/element',
        '@wordpress/i18n',
        '@wordpress/data',
        'react',
        'react-dom'
      ]
    }
  }
});
```

**Output:** `build/search-form/index.js` (57.99 kB)

---

### 2. Frontend Build (IIFE)

**File:** `vite.search-form-frontend.config.js`

```javascript
export default defineConfig({
  build: {
    emptyOutDir: false, // ⚠️ Don't delete editor build!

    lib: {
      entry: resolve(__dirname, './app/blocks/src/search-form/frontend.tsx'),
      name: 'VoxelFSESearchForm',
      formats: ['iife'], // ✅ IIFE for frontend
      fileName: () => 'search-form-frontend.js',
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
});
```

**Output:** `build/search-form-frontend.js` (50.19 kB)

---

## Build Commands

```json
{
  "scripts": {
    "build": "vite build --config vite.blocks.config.js && npm run build:frontend",
    "build:frontend": "vite build --config vite.frontend.config.js && vite build --config vite.search-form-frontend.config.js"
  }
}
```

**Run:** `npm run build` (builds both editor and frontend)

---

# Error #1: React Hooks Import Resolution

**Severity:** 🔴 **CRITICAL** - Block wouldn't appear in Gutenberg editor
**Impact:** Module resolution failure, block registration failed
**Complexity:** Medium - Required changing imports across 17 files

---

## 1.1 The Error

### Console Error Message:
```
Uncaught SyntaxError: The requested module '@wordpress/element' does not
provide an export named 'useMemo' (at index.js:1:327)
```

### When It Occurred:
- After building the block with Vite
- When opening Gutenberg editor
- Block appeared in block list but failed to render
- Other similar errors for `useState`, `useEffect`, `useCallback`

### The Problematic Code:

**File:** `hooks/useSearchForm.ts` (and 16 other files)

```typescript
// ❌ BROKEN - WordPress import maps don't export React hooks
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
```

---

## 1.2 Root Cause Analysis

### WordPress Import Maps Limitation

WordPress's import maps in the **editor context** DO provide `@wordpress/element`, but they **don't re-export all React hooks**.

**What WordPress provides:**
```html
<script type="importmap">
{
  "imports": {
    "@wordpress/element": "/wp-includes/js/dist/element.js",
    "react": "/wp-includes/js/dist/vendor/react.js"
  }
}
</script>
```

**What `@wordpress/element` exports:**
```javascript
// WordPress re-exports only SOME React exports
export {
  createElement,
  createRoot,
  Component,
  // ❌ NOT ALL HOOKS!
} from 'react';
```

**But React hooks like `useMemo`, `useCallback` are NOT re-exported by `@wordpress/element`.**

---

### Why This Happens

WordPress's `@wordpress/element` package is a **wrapper** around React, not a complete mirror:

```javascript
// @wordpress/element source (simplified)
export {
  createElement,
  createRoot,
  useState,    // ✅ Basic hooks included
  useEffect,   // ✅ Basic hooks included
  // ❌ useMemo NOT included
  // ❌ useCallback NOT included
  // ❌ useRef NOT included (sometimes)
  // ❌ Other hooks NOT included
} from 'react';
```

**The solution:** Import React hooks **directly from `react`** instead of `@wordpress/element`.

---

## 1.3 The Solution: Direct React Imports

### Changed Pattern:

```typescript
// ❌ BEFORE (BROKEN)
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';

// ✅ AFTER (WORKS)
import { useState, useEffect, useCallback, useMemo } from 'react';
```

### Why This Works:

1. **WordPress provides `react` in import maps** - Both editor and frontend contexts
2. **React package exports ALL hooks** - Complete API surface
3. **Vite externalizes `react`** - Not bundled, uses WordPress global
4. **Backward compatible** - Works with both ES modules and IIFE builds

---

## 1.4 Files Changed (17 Total)

### Hooks (4 files):
- ✅ `hooks/useSearchForm.ts` - Line 9
- ✅ `hooks/usePostTypes.ts` - Line 9
- ✅ `hooks/useFilters.ts` - Line 9
- ✅ `shared/SearchFormComponent.tsx` - Line 10

### Filter Components (12 files):
- ✅ `components/FilterUser.tsx` - Line 9
- ✅ `components/FilterTerms.tsx` - Line 9
- ✅ `components/FilterStepper.tsx` - Line 9
- ✅ `components/FilterOrderBy.tsx` - Line 9
- ✅ `components/FilterRecurringDate.tsx` - Line 9
- ✅ `components/FilterPostStatus.tsx` - Line 9
- ✅ `components/FilterPostTypes.tsx` - Line 9
- ✅ `components/FilterDate.tsx` - Line 9
- ✅ `components/FilterAvailability.tsx` - Line 9
- ✅ `components/FilterRelations.tsx` - Line 9
- ✅ `components/FilterLocation.tsx` - Line 9
- ✅ `components/FilterRange.tsx` - Line 9

### Inspector Components (1 file):
- ✅ `inspector/ContentTab.tsx` - Line 18

---

## 1.5 Example Fix

**File:** `hooks/useSearchForm.ts`

```typescript
/**
 * useSearchForm Hook
 *
 * Manages search form state and filter values.
 *
 * @package VoxelFSE
 */

// ✅ FIXED: Import React hooks from 'react' not '@wordpress/element'
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { SearchFormAttributes, FilterConfig } from '../types';

interface SearchFormState {
    currentPostType: string;
    filterValues: Record<string, any>;
    activeFilterCount: number;
    portalActive: boolean;
}

export function useSearchForm(
    attributes: SearchFormAttributes,
    postTypes: PostTypeConfig[]
) {
    const [state, setState] = useState<SearchFormState>({
        currentPostType: attributes.postTypes[0] || '',
        filterValues: {},
        activeFilterCount: 0,
        portalActive: false,
    });

    // ✅ useMemo works now
    const currentPostTypeConfig = useMemo(() => {
        return postTypes.find(pt => pt.key === state.currentPostType);
    }, [postTypes, state.currentPostType]);

    // ✅ useCallback works now
    const handleFilterChange = useCallback((filterKey: string, value: any) => {
        setState(prev => ({
            ...prev,
            filterValues: {
                ...prev.filterValues,
                [filterKey]: value,
            },
        }));
    }, []);

    return {
        state,
        setState,
        currentPostTypeConfig,
        handleFilterChange,
    };
}
```

---

# Error #2: `__experimentalBoxControl` Not Available

**Severity:** 🔴 **CRITICAL** - Block registration failed
**Impact:** Import map doesn't export experimental components
**Complexity:** Low - Created custom replacement component

---

## 2.1 The Error

### Console Error Message:
```
Uncaught SyntaxError: The requested module '@wordpress/components' does not
provide an export named '__experimentalBoxControl' (at index.js:1:273)
```

### When It Occurred:
- After fixing React hooks imports
- Block appeared in editor but crashed on render
- InlineTab component tried to use BoxControl

### The Problematic Code:

**File:** `inspector/InlineTab.tsx` (original)

```typescript
import {
    PanelBody,
    RangeControl,
    ColorPalette,
    __experimentalBoxControl as BoxControl, // ❌ Not in import maps!
} from '@wordpress/components';

// Later in code:
<BoxControl
    label={__('Padding', 'voxel-fse')}
    values={attributes.filterPadding}
    onChange={(value) => setAttributes({ filterPadding: value })}
/>
```

---

## 2.2 Root Cause

### Experimental Components Not Exported

WordPress's import maps **don't include experimental components** like `__experimentalBoxControl`.

**Why:**
1. **Experimental APIs are unstable** - May change between WordPress versions
2. **Not guaranteed in import maps** - Only stable components exported
3. **Bundle size concerns** - Experimental components increase payload

**Available via npm but NOT via import maps:**
```javascript
// Via npm package (works in build, not in browser):
import { __experimentalBoxControl } from '@wordpress/components';

// Via import maps (browser runtime):
// ❌ NOT AVAILABLE
```

---

## 2.3 The Solution: SimpleBoxControl (Import Map Constraints)

**⚠️ CRITICAL DISCOVERY: Popup-kit components don't work in ES module context!**

**Initial Attempt:** Tried to use `DimensionsControl` from popup-kit for code reuse.

**Problem Discovered:** `DimensionsControl` uses `MenuItem` and `MenuGroup` from `@wordpress/components`, which are **NOT available in WordPress import maps**. This causes runtime error:
```
Uncaught TypeError: E is not a function
```

**Why Popup-kit Components Don't Work:**
- Popup-kit likely uses IIFE build for editor (like create-post block)
- Search-form uses ES modules with import maps
- Import maps have limited component exports
- `MenuItem`, `MenuGroup`, and other components unavailable

**Final Solution:** Create `SimpleBoxControl` using only standard components.

**File:** `inspector/InlineTab.tsx` (final)

```typescript
import { __ } from '@wordpress/i18n';
import {
    PanelBody,
    RangeControl,
    TextControl, // ✅ Standard component, always available
    ColorPalette,
} from '@wordpress/components';
import type { SearchFormAttributes } from '../types';

// ✅ Custom replacement - uses only standard components
// Note: DimensionsControl from popup-kit uses MenuItem/MenuGroup which aren't available
interface BoxValues {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
}

interface SimpleBoxControlProps {
    label: string;
    values: BoxValues;
    onChange: (values: BoxValues) => void;
}

function SimpleBoxControl({ label, values, onChange }: SimpleBoxControlProps) {
    const updateValue = (side: keyof BoxValues, value: string) => {
        onChange({ ...values, [side]: value });
    };

    return (
        <div className="voxel-fse-box-control">
            <label className="components-base-control__label">{label}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                <TextControl label={__('Top', 'voxel-fse')} value={values?.top || ''} onChange={(value) => updateValue('top', value)} placeholder="0px" />
                <TextControl label={__('Right', 'voxel-fse')} value={values?.right || ''} onChange={(value) => updateValue('right', value)} placeholder="0px" />
                <TextControl label={__('Bottom', 'voxel-fse')} value={values?.bottom || ''} onChange={(value) => updateValue('bottom', value)} placeholder="0px" />
                <TextControl label={__('Left', 'voxel-fse')} value={values?.left || ''} onChange={(value) => updateValue('left', value)} placeholder="0px" />
            </div>
        </div>
    );
}

// ✅ Usage in component
export default function InlineTab({ attributes, setAttributes }) {
    return (
        <>
            <PanelBody title={__('Filter Styling', 'voxel-fse')} initialOpen={true}>
                {/* ... other controls ... */}

                <SimpleBoxControl
                    label={__('Padding', 'voxel-fse')}
                    values={attributes.filterPadding || {}}
                    onChange={(value) => setAttributes({ filterPadding: value })}
                />

                <SimpleBoxControl
                    label={__('Margin', 'voxel-fse')}
                    values={attributes.filterMargin || {}}
                    onChange={(value) => setAttributes({ filterMargin: value })}
                />
            </PanelBody>
        </>
    );
}
```

---

## 2.4 Key Lessons: Import Maps & Component Compatibility

### ⚠️ Lesson 1: Not All Components Are Shareable

**Problem:** Tried to reuse `DimensionsControl` from popup-kit → Runtime error

**Root Cause:** Different blocks use different build systems:
- **Popup-kit**: Likely uses IIFE build (bundles all dependencies)
- **Search-form**: Uses ES modules (relies on import maps)

**Impact:** Components that work in IIFE builds may fail in ES module builds if they use unavailable WordPress components.

### ✅ Lesson 2: Check Import Map Availability

Before using ANY component from `@wordpress/components`, verify it's available in import maps:

**Available:** ✅
- Basic components: Button, TextControl, SelectControl, ToggleControl
- Layout: PanelBody, PanelRow, Placeholder
- Feedback: Spinner, Notice
- Dropdown, DropdownMenu (BUT NOT MenuItem/MenuGroup!)

**Not Available:** ❌
- Experimental components: `__experimentalBoxControl`, etc.
- RadioControl
- MenuItem, MenuGroup (even though DropdownMenu is available!)
- Many advanced components

### ✅ Lesson 3: When Code Reuse Doesn't Work

If existing component uses unavailable WordPress components:
1. **Don't force it** - Create simplified version
2. **Use only standard components** - TextControl, Button, etc.
3. **Document why** - Help future developers avoid same mistake
4. **Consider creating shared utilities** - For blocks using same build system

### Benefits of SimpleBoxControl Approach

✅ **Guaranteed compatibility** - Uses only standard components
✅ **No runtime errors** - All dependencies available in import maps
✅ **Simple and maintainable** - Easy to understand 2x2 grid
✅ **Accepts any CSS value** - `10px`, `1rem`, `auto`, etc.
✅ **Future-proof** - Won't break if WordPress changes APIs

---

# Error #3: `RadioControl` Not Available

**Severity:** 🔴 **CRITICAL** - Block registration failed
**Impact:** Import map doesn't export `RadioControl`
**Complexity:** Trivial - Replaced with `SelectControl`

---

## 3.1 The Error

### Console Error Message:
```
Uncaught SyntaxError: The requested module '@wordpress/components' does not
provide an export named 'RadioControl' (at index.js:1:273)
```

### When It Occurred:
- After fixing `__experimentalBoxControl` error
- GeneralTab component tried to use RadioControl
- Similar pattern to experimental components issue

### The Problematic Code:

**File:** `inspector/GeneralTab.tsx` (original)

```typescript
import {
    PanelBody,
    ToggleControl,
    SelectControl,
    RadioControl, // ❌ Not in import maps!
} from '@wordpress/components';

// Later in code:
<RadioControl
    label={__('On Submit', 'voxel-fse')}
    selected={attributes.onSubmit || 'refresh'}
    options={[
        { label: 'Refresh page', value: 'refresh' },
        { label: 'Update Post Feed', value: 'feed' },
        { label: 'Update Map', value: 'map' },
    ]}
    onChange={(value) => setAttributes({ onSubmit: value })}
/>
```

---

## 3.2 The Solution: Use SelectControl

`RadioControl` and `SelectControl` serve similar purposes - both let users choose one option from multiple choices.

**The fix is simple:** Replace `RadioControl` with `SelectControl`.

**File:** `inspector/GeneralTab.tsx` (fixed)

```typescript
import {
    PanelBody,
    ToggleControl,
    SelectControl, // ✅ Available in import maps
    TextControl,
} from '@wordpress/components';

// ✅ Replace RadioControl with SelectControl
<SelectControl
    label={__('On Submit', 'voxel-fse')}
    value={attributes.onSubmit || 'refresh'} // Changed: 'selected' → 'value'
    options={[
        { label: 'Refresh page with filters', value: 'refresh' },
        { label: 'Update Post Feed block', value: 'feed' },
        { label: 'Update Map block', value: 'map' },
    ]}
    onChange={(value) => setAttributes({ onSubmit: value as 'refresh' | 'feed' | 'map' })}
/>
```

---

## 3.3 RadioControl vs SelectControl

| Feature | RadioControl | SelectControl |
|---------|-------------|---------------|
| **UI** | Radio buttons (vertical list) | Dropdown menu |
| **Import Map** | ❌ Not available | ✅ Available |
| **Prop for value** | `selected` | `value` |
| **Options format** | Same | Same |
| **Use case** | 2-4 options visible | Any number of options |

**Trade-off:** RadioControl shows all options at once, SelectControl requires clicking dropdown.
**Decision:** Use SelectControl for WordPress import map compatibility.

---

# WordPress Import Maps Explained

## What Are Import Maps?

Import maps tell browsers how to resolve **bare import specifiers**:

```javascript
// Bare specifier (no path):
import { useState } from 'react';

// Import map resolves it to actual URL:
{
  "imports": {
    "react": "https://cdn.com/react.js"
  }
}
```

---

## WordPress Import Maps in Editor Context

When you open Gutenberg editor, WordPress injects an import map:

```html
<script type="importmap">
{
  "imports": {
    "@wordpress/blocks": "/wp-includes/js/dist/blocks.js",
    "@wordpress/block-editor": "/wp-includes/js/dist/block-editor.js",
    "@wordpress/components": "/wp-includes/js/dist/components.js",
    "@wordpress/element": "/wp-includes/js/dist/element.js",
    "@wordpress/i18n": "/wp-includes/js/dist/i18n.js",
    "@wordpress/data": "/wp-includes/js/dist/data.js",
    "react": "/wp-includes/js/dist/vendor/react.js",
    "react-dom": "/wp-includes/js/dist/vendor/react-dom.js"
  }
}
</script>
```

**This is why ES modules work in the editor!**

---

## What's NOT in Import Maps

### ❌ Experimental Components:
- `__experimentalBoxControl`
- `__experimentalBorderControl`
- `__experimentalColorGradientControl`
- Any component starting with `__experimental`

### ❌ Some Standard Components:
- `RadioControl` (sometimes missing)
- Other less common components

### ❌ All React Hooks via `@wordpress/element`:
- `useMemo`
- `useCallback`
- `useRef` (sometimes)
- `useImperativeHandle`
- `useLayoutEffect`
- Other advanced hooks

### ✅ What IS Available:

**Standard WordPress packages:**
- `@wordpress/blocks`
- `@wordpress/block-editor`
- `@wordpress/components` (partial)
- `@wordpress/element` (partial)
- `@wordpress/i18n`
- `@wordpress/data`
- `@wordpress/api-fetch`

**React core:**
- `react` (full API)
- `react-dom` (full API)

**Standard components:**
- `PanelBody`
- `ToggleControl`
- `SelectControl`
- `TextControl`
- `RangeControl`
- `ColorPalette`
- `Button`
- `Spinner`
- `Placeholder`

---

## How Block_Loader Enables Import Maps

**File:** `themes/voxel-fse/app/blocks/Block_Loader.php:45-60`

```php
public function add_import_map() {
    if ( ! is_admin() && ! wp_is_block_theme() ) {
        return;
    }

    // Enable ES module import maps for Gutenberg blocks
    add_filter( 'script_loader_tag', function( $tag, $handle ) {
        // Add type="module" to our block scripts
        if ( strpos( $handle, 'voxel-fse-' ) === 0 ) {
            $tag = str_replace( '<script ', '<script type="module" ', $tag );
        }
        return $tag;
    }, 10, 2 );
}
```

**This adds `type="module"` to script tags so browsers recognize ES modules.**

---

# Best Practices & Patterns

## ✅ DO: Import React Hooks from 'react'

```typescript
// ✅ CORRECT
import { useState, useEffect, useMemo, useCallback } from 'react';

// ❌ WRONG
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
```

**Reason:** WordPress's `@wordpress/element` doesn't re-export all hooks.

---

## ✅ DO: Use Standard Components Only

```typescript
// ✅ CORRECT - Always available
import {
    PanelBody,
    ToggleControl,
    SelectControl,
    TextControl,
    RangeControl,
    ColorPalette,
    Button,
} from '@wordpress/components';

// ❌ WRONG - Not in import maps
import {
    RadioControl,
    __experimentalBoxControl,
    __experimentalBorderControl,
} from '@wordpress/components';
```

**Reason:** Experimental and some standard components aren't in import maps.

---

## ✅ DO: Create Custom Replacements

When a WordPress component isn't available, create a lightweight replacement:

```typescript
// ✅ CORRECT - Custom SimpleBoxControl
function SimpleBoxControl({ label, values, onChange }) {
    return (
        <div>
            <label>{label}</label>
            <TextControl label="Top" value={values.top} onChange={...} />
            <TextControl label="Right" value={values.right} onChange={...} />
            <TextControl label="Bottom" value={values.bottom} onChange={...} />
            <TextControl label="Left" value={values.left} onChange={...} />
        </div>
    );
}

// ❌ WRONG - Using unavailable component
import { __experimentalBoxControl as BoxControl } from '@wordpress/components';
```

---

## ✅ DO: Use SelectControl Instead of RadioControl

```typescript
// ✅ CORRECT
<SelectControl
    label="Choose option"
    value={selectedValue}
    options={[
        { label: 'Option 1', value: '1' },
        { label: 'Option 2', value: '2' },
    ]}
    onChange={setValue}
/>

// ❌ WRONG
<RadioControl
    selected={selectedValue}
    options={[...]}
    onChange={setValue}
/>
```

---

## ✅ DO: Use Dual Build System

**For blocks with frontend rendering:**

1. **Editor build** (ES modules) - `vite.blocks.config.js`
2. **Frontend build** (IIFE) - `vite.[block-name]-frontend.config.js`

```javascript
// Frontend config
export default defineConfig({
  build: {
    emptyOutDir: false, // ⚠️ Don't delete editor build!
    lib: {
      formats: ['iife'], // ✅ IIFE for WordPress enqueuing
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
});
```

---

## ✅ DO: Let Block_Loader Handle Registration

**Just create block.json - registration is automatic:**

```json
{
  "apiVersion": 3,
  "name": "voxel-fse/my-block",
  "editorScript": "file:./index.js",
  "render": "file:./render.php"
}
```

Block_Loader will find it and register it automatically.

---

## ❌ DON'T: Manual Block Registration

```php
// ❌ WRONG - Manual registration not needed
function my_custom_block_init() {
    register_block_type( __DIR__ . '/build/my-block' );
}
add_action( 'init', 'my_custom_block_init' );
```

**Let Block_Loader handle it automatically.**

---

## ❌ DON'T: Use ES Modules for Frontend

```javascript
// ❌ WRONG - ES modules don't work with wp_enqueue_script
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es', // ❌ Breaks WordPress enqueuing
      }
    }
  }
});
```

**Use IIFE format for frontend builds.**

---

# Summary

## Import Map Issues Fixed:

| Issue | Solution | Files Changed |
|-------|----------|---------------|
| React hooks from `@wordpress/element` | Import from `react` instead | 17 files |
| `__experimentalBoxControl` | Created `SimpleBoxControl` | 1 file |
| `RadioControl` | Replaced with `SelectControl` | 1 file |

---

## Build Results:

```
✓ search-form/index.js              57.99 kB │ gzip: 11.16 kB  (Editor)
✓ search-form-frontend.js           50.19 kB │ gzip: 12.16 kB  (Frontend)
```

---

## Key Takeaways:

1. ✅ **WordPress import maps are limited** - Not all components/hooks available
2. ✅ **Import React hooks from 'react'** - Not `@wordpress/element`
3. ✅ **Use standard components only** - Avoid experimental APIs
4. ✅ **Create custom replacements** - When WordPress components unavailable
5. ✅ **Dual build system** - ES modules for editor, IIFE for frontend
6. ✅ **Block_Loader auto-discovers** - Just create block.json

---

## Related Documentation:

- **Block_Loader:** `themes/voxel-fse/app/blocks/Block_Loader.php`
- **Create Post Errors:** `docs/conversions/create-post/create-post-critical-errors-solved.md`
- **Gutenberg Rendering:** `docs/conversions/gutenberg-editor-rendering-guide-v3.md`
- **Vite Config:** `themes/voxel-fse/vite.blocks.config.js`
- **Frontend Config:** `themes/voxel-fse/vite.search-form-frontend.config.js`

---

**All import map issues solved. Block now appears in Gutenberg editor and renders correctly.**
