# Create Post Block - Critical Errors Solved

**Created:** November 2025
**Purpose:** Document the two major technical challenges and their solutions

---

## Table of Contents

1. [Error #1: `@wordpress/element` Module Resolution Failure](#error-1-wordpresselement-module-resolution-failure)
2. [Error #2: `_location` Field Database Error](#error-2-_location-field-database-error)

---

# Error #1: `@wordpress/element` Module Resolution Failure

**Severity:** 🔴 **CRITICAL** - Blocked all frontend functionality
**Impact:** React component couldn't mount, form wouldn't render
**Complexity:** High - Required complete build system redesign

---

## 1.1 The Error

### Console Error Messages:
```
Failed to resolve module specifier '@wordpress/element'
Uncaught SyntaxError: Cannot use import statement outside a module
Uncaught TypeError: Failed to resolve bare module specifier '@wordpress/element'
```

### The Problematic Code:
```typescript
// frontend.tsx
import { createRoot } from '@wordpress/element';  // ❌ FAILED
import { useState, useEffect } from 'react';

const root = createRoot(container);  // ❌ Never reached
root.render(<CreatePostForm />);
```

### When It Occurred:
- On **public-facing pages** when form should render
- After successful build completion
- Script was enqueued but threw errors in browser console
- React component never mounted

---

## 1.2 Root Cause Analysis

### The Problem Chain:

**Problem 1: WordPress Global Variables vs ES Modules**

WordPress loads packages as **global variables**, not ES modules:

```javascript
// What WordPress actually loads:
window.wp = {
  element: { createElement, createRoot, useState, ... },
  blocks: { registerBlockType, ... },
  blockEditor: { useBlockProps, InspectorControls, ... }
};

window.React = { createElement, Component, useState, ... };
window.ReactDOM = { render, createRoot, ... };
```

But your code tried to import them as ES modules:
```typescript
import { createRoot } from '@wordpress/element';  // ❌ This package doesn't exist as an ES module!
```

---

**Problem 2: Bare Import Specifiers**

"Bare imports" don't have file paths:
```typescript
import { createRoot } from '@wordpress/element';  // ❌ Bare specifier
import { useState } from 'react';                 // ❌ Bare specifier

// vs relative/absolute paths (these work):
import { foo } from './foo.js';                   // ✅ Relative path
import { bar } from 'https://cdn.com/bar.js';    // ✅ Absolute URL
```

Browsers need **import maps** to resolve bare specifiers:
```html
<script type="importmap">
{
  "imports": {
    "@wordpress/element": "https://cdn.wordpress.com/element.js",
    "react": "https://cdn.com/react.js"
  }
}
</script>
```

**But:** WordPress doesn't provide import maps for frontend scripts.

---

**Problem 3: Vite's Default ES Module Build**

Original build configuration:
```javascript
// vite.blocks.config.js (original)
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es',  // ❌ ES module format for EVERYTHING
      }
    }
  }
});
```

This created **ES module output** for frontend:
```javascript
// build/create-post-frontend.js (ES module - BROKEN)
import { createRoot } from '@wordpress/element';  // ❌ Can't resolve!
import { useState } from 'react';                 // ❌ Can't resolve!

const App = () => { /* ... */ };
const root = createRoot(container);
root.render(<App />);
```

When WordPress enqueued this without `type="module"`:
```php
wp_enqueue_script('frontend', 'frontend.js');  // ❌ Missing type="module"
```

Browser output:
```html
<script src="frontend.js"></script>  <!-- ❌ Not marked as module! -->
```

Result: **Syntax error** because `import` statements require `type="module"`.

---

**Problem 4: WordPress Script Enqueuing Limitations**

WordPress's `wp_enqueue_script()` **doesn't add `type="module"` to script tags**.

Standard enqueue:
```php
wp_enqueue_script('my-script', 'script.js');
```

HTML output:
```html
<script src="script.js"></script>  <!-- NOT <script type="module"> -->
```

To use ES modules, you'd need:
```html
<script type="module" src="script.js"></script>
```

**But WordPress doesn't support this natively.**

---

## 1.3 The Solution: Dual Build System (IIFE + ES Modules)

### Architecture Overview:

```
┌───────────────────────────────────────────────┐
│  EDITOR BUILD (ES Modules) ✅                 │
│  File: vite.blocks.config.js                  │
├───────────────────────────────────────────────┤
│  Input:  app/blocks/src/create-post/index.tsx│
│  Output: build/create-post/index.js           │
│  Format: ES modules                           │
│  Size:   4.08 kB                              │
│  Loaded: WordPress editor ONLY                │
│                                               │
│  Why ES modules work in editor:               │
│  - Gutenberg provides import maps            │
│  - Block_Loader.php adds import map          │
│  - Editor context supports ES modules        │
│                                               │
│  External packages (not bundled):             │
│  - @wordpress/blocks                          │
│  - @wordpress/block-editor                    │
│  - @wordpress/components                      │
│  - @wordpress/server-side-render              │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│  FRONTEND BUILD (IIFE) ✅ NEW SOLUTION        │
│  File: vite.frontend.config.js ⭐ NEW         │
├───────────────────────────────────────────────┤
│  Input:  app/blocks/src/create-post/          │
│          frontend.tsx                         │
│  Output: build/create-post-frontend.js        │
│  Format: IIFE (Immediately Invoked Function)  │
│  Size:   5.23 kB                              │
│  Loaded: Public pages via render.php          │
│                                               │
│  CRITICAL DIFFERENCE:                         │
│  formats: ['iife']  ← NOT 'es'!              │
│                                               │
│  External deps mapped to globals:             │
│  '@wordpress/element' → window.wp.element     │
│  'react'              → window.React          │
│  'react-dom'          → window.ReactDOM       │
│                                               │
│  emptyOutDir: false  ← Keep editor build!     │
└───────────────────────────────────────────────┘
```

---

### Implementation: vite.frontend.config.js

**File:** `/home/user/musicalwheel/themes/voxel-fse/vite.frontend.config.js` ⭐ **NEW**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],

  build: {
    outDir: 'build',
    emptyOutDir: false,  // ⭐ CRITICAL: Don't delete editor build!

    lib: {
      entry: resolve(__dirname, './app/blocks/src/create-post/frontend.tsx'),
      name: 'VoxelFSECreatePost',  // Global namespace
      formats: ['iife'],           // ⭐ IIFE, NOT 'es'
      fileName: () => 'create-post-frontend.js',
    },

    rollupOptions: {
      // ✅ Don't bundle these - they exist as WordPress globals
      external: ['react', 'react-dom', '@wordpress/element'],

      output: {
        globals: {
          // ⭐ Map imports to global variables
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/element': 'wp.element',
        },
      },
    },
  },
});
```

---

### What IIFE Format Does (The Magic)

**Before (ES Module - BROKEN):**
```javascript
// build/create-post-frontend.js (ES module output)
import { createRoot } from '@wordpress/element';  // ❌ Can't resolve!
import { useState } from 'react';

const App = () => { return <div>Form</div>; };
const root = createRoot(document.getElementById('app'));
root.render(<App />);
```

**After (IIFE - WORKS!):**
```javascript
// build/create-post-frontend.js (IIFE output)
(function(React, ReactDOM, wpElement) {
  'use strict';

  // ✅ Extract from globals passed as parameters
  const { createRoot } = wpElement;
  const { useState } = React;

  const App = () => { return React.createElement('div', null, 'Form'); };

  // ✅ createRoot now works because wpElement = window.wp.element
  const root = createRoot(document.getElementById('app'));
  root.render(React.createElement(App, null));

})(
  window.React,      // ✅ Passed as React parameter
  window.ReactDOM,   // ✅ Passed as ReactDOM parameter
  window.wp.element  // ✅ Passed as wpElement parameter
);
```

**Key Differences:**

1. **Self-Executing Function:** Wraps all code in `(function() { ... })()`
2. **No Import Statements:** No `import`/`export` syntax
3. **Globals as Parameters:** WordPress globals passed as function parameters
4. **No Module Resolution:** Everything is plain JavaScript

---

### Build Commands (package.json)

```json
{
  "scripts": {
    "build:blocks": "vite build --config vite.blocks.config.js",
    "build:frontend": "vite build --config vite.frontend.config.js",
    "build": "npm run build:blocks && npm run build:frontend"
  }
}
```

**MUST RUN BOTH:**
```bash
npm run build:blocks    # Step 1: Build editor (ES modules)
npm run build:frontend  # Step 2: Build frontend (IIFE)
# OR
npm run build           # Runs both sequentially
```

---

### How render.php Enqueues the IIFE Script

**File:** `themes/voxel-fse/app/blocks/src/create-post/render.php:102-140`

```php
// Only enqueue frontend React on actual frontend (not in editor preview)
if ( ! $is_editor_preview && ! is_admin() ) {
    $frontend_script_path = get_stylesheet_directory() . '/build/create-post-frontend.js';
    $frontend_script_url = get_stylesheet_directory_uri() . '/build/create-post-frontend.js';

    if ( file_exists( $frontend_script_path ) ) {
        // Register script as IIFE (not ES module)
        wp_register_script(
            'voxel-fse-create-post-frontend',
            $frontend_script_url,
            [], // ⭐ EMPTY! IIFE uses globals, no dependencies needed
            filemtime( $frontend_script_path ),
            true // Load in footer
        );

        wp_enqueue_script( 'voxel-fse-create-post-frontend' );

        // Pass data to React component via wp_localize_script
        wp_localize_script(
            'voxel-fse-create-post-frontend',
            'voxelFseCreatePost',  // ⭐ window.voxelFseCreatePost
            [
                'restUrl' => rest_url( 'voxel-fse/v1/' ),
                'nonce' => wp_create_nonce( 'wp_rest' ),
                'postTypeKey' => $post_type_key,
                'fieldsConfig' => $fields_config,
                'postId' => $post_id,
            ]
        );
    }
}
```

**Critical:** `[]` for dependencies because IIFE handles everything internally.

---

### Frontend Component Using createRoot (Now Works!)

**File:** `themes/voxel-fse/app/blocks/src/create-post/frontend.tsx`

```typescript
/**
 * Frontend Create Post Form Component
 * Compiled to IIFE format by vite.frontend.config.js
 */
import { createRoot } from '@wordpress/element';  // ✅ Works with IIFE!
import { useState, useEffect } from 'react';

export const CreatePostForm = ({ attributes, postId }: FrontendProps) => {
    const [formData, setFormData] = useState<FormData>({});
    const [submitting, setSubmitting] = useState(false);

    // Get data from PHP
    const wpData = (window as any).voxelFseCreatePost || {};

    // ... component logic

    return (
        <form className="vx-create-post-form">
            {/* Form fields */}
        </form>
    );
};

// Mount React component when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.voxel-fse-create-post-frontend');

    containers.forEach((container) => {
        if (container instanceof HTMLElement) {
            const root = createRoot(container);  // ✅ createRoot works!

            const attributes = JSON.parse(container.dataset.attributes || '{}');
            const postId = container.dataset.postId ? parseInt(container.dataset.postId) : null;

            root.render(
                <CreatePostForm
                    attributes={attributes}
                    postId={postId}
                />
            );
        }
    });
});
```

**After IIFE build, this becomes:**
```javascript
(function(wpElement, React) {
  const { createRoot } = wpElement;  // ✅ From window.wp.element
  const { useState } = React;         // ✅ From window.React

  // ... all your component code

  const root = createRoot(container);  // ✅ WORKS!
})(window.wp.element, window.React);
```

---

## 1.4 Why This Solution Works

### ✅ IIFE Benefits:

1. **No Import Resolution Needed**
    - No `import`/`export` statements in output
    - All dependencies passed as function parameters
    - Browsers execute plain JavaScript

2. **WordPress Global Compatibility**
    - Uses existing `window.wp.*` globals
    - No need for import maps
    - Works with standard WordPress enqueuing

3. **Self-Contained Bundle**
    - All code wrapped in single function scope
    - No naming collisions
    - No module system required

4. **Compatible with WordPress Enqueuing**
    - `wp_enqueue_script()` works normally
    - No need for `type="module"`
    - Loads in footer with other scripts

### ⚠️ Why ES Modules Failed:

1. **Requires Import Maps** (WordPress doesn't provide for frontend)
2. **Needs `type="module"`** (WordPress enqueuing doesn't support)
3. **Bare Specifiers Don't Resolve** (no file path/URL)
4. **WordPress Packages Are Globals** (not ES modules)

---

## 1.5 Documentation & References

### Documentation Files:
- `docs/conversions/create-post-architecture-update.md` (223 lines)
    - Lines 60-116: Detailed IIFE configuration
    - Build system architecture diagrams
    - Critical config settings

- `docs/conversions/create-post-phase-a-complete.md` (418 lines)
    - Lines 11-27: Dual build success story
    - Lines 165-180: Build configuration status
    - Lines 380-384: Key learnings

### Git Commits:
- **a97211df** - "Dual build system now implemented (IIFE + ES modules)"
- **9aac6484** - Block registration failures and import map fixes

### Build Artifacts:
- `build/create-post/index.js` - 4.08 kB (editor ES modules)
- `build/create-post-frontend.js` - 5.23 kB (frontend IIFE)
- Total: 9.31 kB

---

## 1.6 Key Learnings

### Critical Insights:

> **"WordPress doesn't support ES module imports in enqueued scripts"**

**This means:**
- ✅ Editor: Can use ES modules (Gutenberg provides import maps)
- ❌ Frontend: MUST use IIFE (standard WordPress enqueuing)

### Build Format Decision Matrix:

| Context | Format | Why |
|---------|--------|-----|
| WordPress Editor | ES Modules | Gutenberg supports with import maps |
| Public Frontend | IIFE | WordPress enqueuing requires traditional scripts |
| Admin Pages | IIFE | Same as frontend, no ES module support |
| Headless (Phase 4) | ES Modules | Next.js supports modern imports |

### Common Pitfalls Avoided:

❌ **Pitfall 1:** Using `format: 'es'` for frontend builds
- **Error:** `Failed to resolve module specifier`
- **Fix:** Use `format: 'iife'`

❌ **Pitfall 2:** Setting `emptyOutDir: true` in both configs
- **Error:** Second build deletes first build
- **Fix:** Use `emptyOutDir: false` in frontend config

❌ **Pitfall 3:** Adding WordPress packages to script dependencies
- **Error:** Circular dependencies, loading order issues
- **Fix:** Use `[]` for dependencies; IIFE handles internally

❌ **Pitfall 4:** Trying to use `type="module"` with WordPress
- **Error:** WordPress doesn't support native ES modules
- **Fix:** Stick with IIFE for all WordPress-enqueued scripts

---

# Error #2: `_location` Field Database Error

**Severity:** 🟡 **MEDIUM** - Non-blocking, posts still created
**Impact:** Database warning logged, location searches don't work
**Complexity:** Low - Workaround available, full fix requires Maps API

---

## 2.1 The Error

### Error Message:
```
WordPress database error: Field '_location' doesn't have a default value
for query INSERT INTO `wp_voxel_index_places` (`post_id`, `post_status`, `priority`)
VALUES (570, 'publish', 0)
```

### When It Occurred:
- Testing with Voxel's **"Places" post type**
- **After** successful post creation (in shutdown hook)
- During Voxel's custom indexing process

### Impact:
- ✅ Post IS created successfully
- ✅ Post data saved correctly
- ✅ Post can be viewed/edited
- ❌ Database error logged
- ❌ Post won't appear in location-based searches
- ❌ Post not indexed in `wp_voxel_index_places` table

---

## 2.2 Root Cause

### The Problem:

1. **"Places" Post Type Has Location Filter**
    - Configured in **Post Types → Places → Filters**
    - Requires `_location POINT NOT NULL` column in index table
    - Expects to read location data from a **location field**

2. **Create Post Block MVP Doesn't Support Location Fields**
    - Location fields require Google Maps/Mapbox integration
    - Need geocoding API, map UI component, lat/lng storage
    - MVP only supports basic fields (text, number, email, etc.)

3. **Indexing Fails**
    - Voxel's shutdown hook runs custom indexing
    - Location filter should return `POINT(0,0)` when field missing
    - But INSERT statement doesn't include the `_location` column
    - MySQL constraint violation: `NOT NULL` column without default

---

## 2.3 Voxel Source Code Evidence

**File:** `themes/voxel/app/post-types/filters/location-filter.php:80-103`

```php
public function index( \Voxel\Post $post ): array {
    $field = $post->get_field( $this->props['source'] );

    if ( ! ( $field && $field->get_type() === 'location' ) ) {
        // When location field doesn't exist, return POINT(0,0)
        $lat = 0;
        $lng = 0;
    } else {
        $value = $field->get_value();
        $lat = $value['latitude'] ?? 0;
        $lng = $value['longitude'] ?? 0;
    }

    return [
        $this->db_key() => sprintf(
            'ST_PointFromText( \'POINT(%s %s)\', 4326 )',
            $lng,
            $lat
        ),
    ];
}
```

**The filter SHOULD return `POINT(0,0)` when the location field doesn't exist, but something in Voxel's indexing prevents this default from being included in the INSERT.**

---

## 2.4 Solutions & Workarounds

### Option A: Use Different Post Type (Current Workaround)

**Recommended for MVP:**
```
✅ Use post types WITHOUT location filters:
- Default "Post" type
- Custom post types without location requirements
- Any post type not configured with location filter
```

**How to check:**
1. Go to **Post Types → [Your Type] → Filters**
2. If you see a "Location" filter, this post type will cause the error
3. Use a different post type or proceed to Option B

---

### Option B: Remove Location Filter from Post Type

**Steps:**
1. Go to **Post Types → Places → Filters**
2. Find the **Location filter**
3. Delete or disable it
4. Go to **Post Types → Places → Settings → Indexing**
5. Click **"Re-build index table"**

**Impact:**
- ✅ Removes database error
- ❌ Removes location-based search capability for this post type

---

### Option C: Implement Location Field Support (Full Solution)

**Required implementation:**
- Google Maps/Mapbox API integration
- Geocoding API for address → coordinates
- Map UI component (React)
- Address autocomplete
- Latitude/Longitude field storage
- Location field rendering in create-post block

**Complexity:** High (3-5 days)
**Priority:** Phase B or later

---

## 2.5 Unsupported Field Types (MVP)

### Supported ✅:
- Title, Text, Text Editor (textarea)
- Email, URL, Phone
- Number (with min/max/step)
- File upload (basic)

### Not Supported ❌:
- **Location fields** → Causes database error
- Taxonomy fields (categories, tags)
- Relation fields (connect posts)
- Repeater fields (nested data)
- Work hours fields
- Product fields
- Date/Datetime fields

---

## Summary Comparison

| Error | Severity | Impact | Solution Complexity |
|-------|----------|--------|---------------------|
| **`@wordpress/element`** | 🔴 Critical | React can't mount, no frontend form | High - Required dual build system |
| **`_location` field** | 🟡 Medium | Database warning, search limitation | Low - Use different post type |

### Timeline:
1. **`@wordpress/element` error** - Solved with IIFE build system (a97211df)
2. **`_location` error** - Documented with workaround (ebc245ba)

### Documentation:
- Architecture update: `docs/conversions/create-post-architecture-update.md`
- Phase A status: `docs/conversions/create-post-phase-a-complete.md`
- This summary: `docs/conversions/create-post-critical-errors-solved.md`

---

**Both errors thoroughly documented and solved.**
**Frontend form now working, dual build system in place.**
**Location field support deferred to Phase B.**