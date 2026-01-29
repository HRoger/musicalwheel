# Gutenberg Block Registration Guide - Universal Patterns

**Created:** December 2025
**Purpose:** Universal guide for creating and registering Gutenberg blocks in voxel-fse theme
**Applies to:** ALL blocks (current and future)

---

## Table of Contents

1. [Quick Start - Creating a New Block](#quick-start---creating-a-new-block)
2. [Child Theme Styling Strategy - CRITICAL](#child-theme-styling-strategy---critical)
3. [Custom Controls Library](#custom-controls-library)
4. [Stackable Integration](#stackable-integration)
5. [Auto-Discovery System](#auto-discovery-system)
6. [WordPress Import Maps - CRITICAL](#wordpress-import-maps---critical)
7. [Common Import Errors & Solutions](#common-import-errors--solutions)
8. [Build System Patterns](#build-system-patterns)
9. [Best Practices Checklist](#best-practices-checklist)

---

# Quick Start - Creating a New Block

## Step 1: Create Block Directory

```bash
mkdir -p themes/voxel-fse/app/blocks/src/my-block
cd themes/voxel-fse/app/blocks/src/my-block
```

---

## Step 2: Create block.json

**File:** `block.json`

```json
{
  "apiVersion": 3,
  "name": "voxel-fse/my-block",
  "version": "1.0.0",
  "title": "My Block (VX)",
  "category": "voxel-fse",
  "icon": "star-filled",
  "description": "Description of my block",
  "keywords": ["keyword1", "keyword2"],
  "textdomain": "voxel-fse",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "render": "file:./render.php",
  "supports": {
    "html": false,
    "anchor": true
  },
  "attributes": {
    "myAttribute": {
      "type": "string",
      "default": ""
    }
  }
}
```

**⭐ That's it! Block_Loader will auto-discover and register this block.**

**🚨 CRITICAL - NO style.css:**
- ❌ **NO `"style": "file:./style.css"`** property in block.json
- ✅ Blocks inherit Voxel parent theme styles automatically (child theme principle)
- ✅ Only `editorStyle` for WordPress editor UI styling
- ✅ Block naming: Always add **(VX)** suffix to `title` for brand identification

**Why no style.css?**
- Voxel-fse is a **child theme** - inherits parent styles
- Blocks use EXACT same HTML as Voxel Elementor widgets
- Same CSS classes (`.ts-form`, `.ts-filter-wrapper`, etc.)
- Parent theme already has ALL widget styles
- Zero style duplication = smaller bundle size

---

## Step 3: Create index.tsx (Editor Entry)

**File:** `index.tsx`

```typescript
import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';

registerBlockType(metadata.name, {
  ...metadata,
  edit: Edit,
});
```

---

## Step 4: Create edit.tsx (Editor Component)

**File:** `edit.tsx`

```typescript
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface EditProps {
  attributes: {
    myAttribute: string;
  };
  setAttributes: (attrs: any) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__('Settings', 'voxel-fse')}>
          <TextControl
            label={__('My Attribute', 'voxel-fse')}
            value={attributes.myAttribute}
            onChange={(value) => setAttributes({ myAttribute: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        <p>My Block: {attributes.myAttribute}</p>
      </div>
    </>
  );
}
```

---

## Step 5: Create render.php (Frontend Bootstrap)

**File:** `render.php`

```php
<?php
/**
 * My Block - Frontend Rendering
 */

if (!defined('ABSPATH')) {
  exit;
}

$block_id = 'my-block-' . uniqid();
?>

<div class="voxel-fse-my-block" id="<?php echo esc_attr($block_id); ?>">
  <!-- Your frontend HTML -->
  <p><?php echo esc_html($attributes['myAttribute'] ?? ''); ?></p>
</div>
```

---

## Step 6: Build

```bash
npm run build
```

**✅ Your block is now registered and ready to use!**

---

# Child Theme Styling Strategy - CRITICAL

## The Golden Rule: NO style.css

> **Voxel-fse is a CHILD THEME. Blocks inherit ALL styles from Voxel parent theme automatically.**

### ⚠️ DO NOT CREATE style.css

**Why:**
- Voxel-fse extends Voxel parent theme
- Blocks use EXACT same HTML structure as Voxel Elementor widgets
- Same CSS classes automatically apply parent theme styles
- Creating style.css = duplicating styles = larger bundle + maintenance hell

### ✅ What to Create: editor.css ONLY

**File Structure:**
```
my-block/
├── block.json          # NO "style" property!
├── index.tsx
├── edit.tsx
├── editor.css          # ✅ Editor UI only
└── render.php
```

**File:** `editor.css` (WordPress editor UI styling ONLY)

```css
/**
 * My Block - Editor Styles
 *
 * IMPORTANT: NO frontend styles here!
 * Frontend inherits Voxel parent theme CSS automatically.
 *
 * @package VoxelFSE
 */

/* Editor wrapper - block preview in Gutenberg */
.voxel-fse-my-block-editor {
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;
}

/* Inspector panel styling */
.voxel-fse-inspector-tabs {
    margin: 0 -16px;
}

/* Custom control styles (e.g., Select2) */
.vxfse-select2-wrap.select2-container {
    display: block;
    margin-bottom: 16px;
}

/* Block placeholder/loading states */
.voxel-fse-my-block-loading {
    display: flex;
    align-items: center;
    gap: 10px;
}
```

**What goes in editor.css:**
- ✅ `.voxel-fse-*` editor-specific classes
- ✅ Inspector panel styling
- ✅ Custom control styles (Select2, IconPicker, etc.)
- ✅ Block placeholder/loading states in editor

**What DOESN'T go in editor.css:**
- ❌ `.ts-form` styles (Voxel parent has these)
- ❌ `.ts-filter-*` styles (Voxel parent has these)
- ❌ Frontend widget styles (inherited automatically)
- ❌ Responsive utilities (Voxel parent has `.vx-hidden-*`)

### HTML Structure Matching - CRITICAL

**Your block MUST output IDENTICAL HTML to Voxel widget for styles to apply.**

**Example - Voxel Widget HTML:**
```html
<div class="ts-form ts-search-widget">
  <div class="ts-filter-wrapper flexify">
    <div class="ts-form-group">
      <!-- Content -->
    </div>
  </div>
</div>
```

**Your Block Output (must match exactly):**
```tsx
// render.php or React component
<div className="ts-form ts-search-widget">
  <div className="ts-filter-wrapper flexify">
    <div className="ts-form-group">
      {/* Content */}
    </div>
  </div>
</div>
```

**Class name matching checklist:**
- [ ] Use Voxel's exact class names (`.ts-*`, `.vx-*`)
- [ ] Match HTML structure (same nesting/hierarchy)
- [ ] Use same wrapper classes (`.flexify`, etc.)
- [ ] Include same modifier classes

**How it works:**
1. Your block renders HTML with Voxel class names
2. Voxel parent theme CSS (`themes/voxel/assets/css/frontend.min.css`) automatically applies
3. Zero configuration needed - child theme inheritance "just works"

### Evidence

**Voxel parent theme contains:**
- `.ts-form` styles
- `.ts-filter-wrapper` styles
- `.ts-search-portal` styles
- All filter type styles (`.ts-filter-keywords`, `.ts-filter-range`, etc.)
- Responsive utilities (`.vx-hidden-desktop`, `.vx-hidden-tablet`, `.vx-hidden-mobile`)
- Button styles (`.ts-btn`, `.ts-btn-1`, `.ts-btn-2`)
- Form styles (`.ts-form-group`, `.ts-input-icon`)

**Your blocks inherit ALL of this automatically.**

---

# Custom Controls Library

## Reusable Inspector Controls

**Location:** `themes/voxel-fse/app/blocks/src/shared/controls/`

### Philosophy

> **Build once, use everywhere. Custom controls for Voxel-specific features that Stackable doesn't provide.**

### Existing Controls

**1. TagMultiSelect** (Elementor-style multi-select)

```typescript
import TagMultiSelect from '../shared/controls/TagMultiSelect';

<TagMultiSelect
  label={__('Post Types', 'voxel-fse')}
  value={attributes.postTypes || []}
  options={postTypeOptions}
  onChange={(value) => setAttributes({ postTypes: value })}
  placeholder={__('Select post types...', 'voxel-fse')}
/>
```

**Features:**
- Select2-style visual appearance
- Tag display with remove buttons
- Searchable dropdown
- Scoped styles (`.vxfse-select2-*`) to avoid WordPress admin conflicts

**Used in:** popup-kit, search-form

**2. IconPickerControl** (Voxel icon library)

```typescript
import IconPickerControl from '../shared/controls/IconPickerControl';

<IconPickerControl
  label={__('Button Icon', 'voxel-fse')}
  value={attributes.icon || {}}
  onChange={(value) => setAttributes({ icon: value })}
/>
```

**Features:**
- Line Awesome icon library
- Icon preview
- Search functionality
- Icon + label object structure

**Used in:** create-post, search-form

### Planned Controls

**3. DynamicTagControl** (Wrap any control with dynamic tag button)

```typescript
import { DynamicTagControl } from '../shared/controls';
import { AdvancedRangeControl } from '~stackable/components';

<DynamicTagControl
  label={__('Z-Index', 'voxel-fse')}
  attribute="zIndex"
  controlType="range"
  StackableControl={AdvancedRangeControl}
  stackableProps={{ min: 0, max: 999 }}
/>
```

**Purpose:** Add Voxel dynamic tag functionality to any control (Stackable or custom)

**4. PostTypePickerControl** (Voxel post type selector)

**5. FieldSelectorControl** (Voxel field selector)

**6. VoxelAccordionControl** (Accordion with dynamic tag support)

### Creating New Controls

**Before creating:**
1. ✅ Check if Stackable has it (spacing, colors, typography, etc.)
2. ✅ Search `shared/controls/` directory
3. ✅ Search other blocks for similar functionality
4. ✅ Ask if unsure - reusing is better than rebuilding

**When to create custom:**
- Voxel-specific features (dynamic tags, post types, fields)
- Elementor-style UX patterns
- Complex interactions not in Stackable
- Controls that wrap/extend Stackable functionality

**File structure:**
```
shared/controls/
├── MyControl.tsx           # Component
├── elementor-controls.css  # Shared styles
└── index.ts                # Export all controls
```

**Export pattern:**
```typescript
// shared/controls/index.ts
export { default as TagMultiSelect } from './TagMultiSelect';
export { default as IconPickerControl } from './IconPickerControl';
export { default as DynamicTagControl } from './DynamicTagControl';
// ... etc
```

**Usage:**
```typescript
// Import from centralized location
import { TagMultiSelect, IconPickerControl } from '../shared/controls';
```

---

# Stackable Integration

## Hybrid Controls Strategy

> **Use Stackable for standard features, custom controls for Voxel-specific features.**

### When to Use Stackable

✅ **Use Stackable controls for:**
- Spacing (margin, padding)
- Colors (background, text, borders)
- Typography (font family, size, weight)
- Visibility (responsive hide/show)
- Conditions (display logic)
- Responsive controls
- Layout/alignment

### When to Use Custom Controls

✅ **Use custom controls for:**
- Dynamic tags
- Voxel post type selectors
- Voxel field selectors
- Icon pickers (Voxel icon library)
- Multi-select with tags
- Voxel-specific features

### Integration Pattern: BlockDiv Wrapper

**Stackable's BlockDiv adds Advanced/Style tab features automatically:**

```typescript
import { BlockDiv } from '~stackable/components';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { TagMultiSelect } from '../shared/controls';

export default function Edit({ attributes, setAttributes, clientId, ...props }) {
  return (
    <>
      <InspectorControls>
        {/* Your custom tabs */}
        <PanelBody title={__('Content', 'voxel-fse')}>
          <TagMultiSelect
            label={__('Post Types', 'voxel-fse')}
            value={attributes.postTypes}
            onChange={(val) => setAttributes({ postTypes: val })}
          />
        </PanelBody>
      </InspectorControls>

      {/* Wrap output with BlockDiv for Stackable features */}
      <BlockDiv blockProps={props} attributes={attributes}>
        <div className="my-block-editor">
          {/* Your block preview */}
        </div>
      </BlockDiv>
    </>
  );
}
```

**What BlockDiv provides:**
- ✅ Advanced tab (spacing, visibility, conditions)
- ✅ Style tab (responsive controls)
- ✅ Block spacing controls in inspector
- ✅ Visibility/condition controls
- ✅ Custom CSS classes support
- ✅ Responsive styling

### Using Stackable Controls Directly

**Import individual controls:**

```typescript
import {
  AdvancedSpacingControl,
  AdvancedRangeControl,
  ColorPaletteControl,
  TypographyControl,
} from '~stackable/components';
import { PanelBody } from '@wordpress/components';

<PanelBody title={__('Spacing', 'voxel-fse')}>
  <AdvancedSpacingControl
    attribute="blockMargin"
    responsive="all"
    units={['px', 'em', '%']}
  />
  <AdvancedSpacingControl
    attribute="blockPadding"
    responsive="all"
    units={['px', 'em', '%']}
  />
</PanelBody>

<PanelBody title={__('Colors', 'voxel-fse')}>
  <ColorPaletteControl
    attribute="backgroundColor"
    label={__('Background', 'voxel-fse')}
  />
</PanelBody>
```

**Stackable handles:**
- Responsive UI automatically
- Attribute storage/retrieval
- CSS generation
- Breakpoint management

### Wrapping Stackable with Dynamic Tags

**Use DynamicTagControl to add Voxel dynamic tag buttons:**

```typescript
import { DynamicTagControl } from '../shared/controls';
import { AdvancedRangeControl } from '~stackable/components';

<PanelBody title={__('Position', 'voxel-fse')}>
  <DynamicTagControl
    label={__('Z-Index', 'voxel-fse')}
    attribute="zIndex"
    controlType="range"
    StackableControl={AdvancedRangeControl}
    stackableProps={{ min: 0, max: 999 }}
  />
</PanelBody>
```

**Result:**
- Stackable's range control UX
- Plus Voxel dynamic tag button
- Can insert `@user(username)`, `@post(title)`, etc.

### Tab Structure

**Keep custom tabs simple, let Stackable handle advanced features:**

```typescript
// Your custom tabs (3)
- Content    (post types, filters, Voxel-specific config)
- General    (submit behavior, button settings)
- Inline     (basic styling with Stackable controls)

// Stackable adds automatically (via BlockDiv)
- Advanced   (spacing, visibility, conditions)
- Style      (responsive controls)
```

**Don't rebuild what Stackable provides:**
- ❌ Don't create custom AdvancedTab
- ❌ Don't create custom VoxelTab
- ✅ Use BlockDiv wrapper instead
- ✅ Add custom controls only where needed

---

# Auto-Discovery System

## How It Works

**File:** `themes/voxel-fse/app/blocks/Block_Loader.php`

```php
class Block_Loader {
  public function register_blocks() {
    $blocks_dir = get_stylesheet_directory() . '/app/blocks/src';

    // ⭐ Automatically finds ALL block.json files
    foreach (glob($blocks_dir . '/*/block.json') as $block_json) {
      register_block_type(dirname($block_json));
    }
  }
}
```

### What This Means:

✅ **No manual registration needed**
✅ **Just create block.json** - Block_Loader finds it automatically
✅ **Standard WordPress API** - Uses core `register_block_type()`
✅ **ES Module support** - Import maps enabled for editor context

### What You DON'T Need to Do:

❌ Don't manually call `register_block_type()` in PHP
❌ Don't add your block to any registration list
❌ Don't create custom enqueueing logic

---

# WordPress Import Maps - CRITICAL

## The Golden Rule

> **WordPress import maps have LIMITED exports. Many components and hooks are NOT available.**

---

## ✅ What IS Available

### From `@wordpress/` Packages:

```typescript
// ✅ SAFE - Always use these
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

// ✅ Components - Standard only
import {
  PanelBody,
  ToggleControl,
  SelectControl,    // Use this, NOT RadioControl
  TextControl,
  RangeControl,
  ColorPalette,
  Button,
  Spinner,
  Placeholder,
} from '@wordpress/components';
```

### From `react`:

```typescript
// ✅ SAFE - Import ALL React hooks from 'react'
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useContext,
  useReducer,
} from 'react';
```

---

## ❌ What is NOT Available

### Experimental Components:

```typescript
// ❌ WILL FAIL - Not in import maps
import {
  __experimentalBoxControl,
  __experimentalBorderControl,
  __experimentalColorGradientControl,
  RadioControl,  // ❌ Often missing
} from '@wordpress/components';
```

### React Hooks from `@wordpress/element`:

```typescript
// ❌ WILL FAIL - WordPress doesn't re-export all hooks
import {
  useMemo,      // ❌ Not available
  useCallback,  // ❌ Not available
  useRef,       // ❌ Sometimes not available
} from '@wordpress/element';
```

---

# Common Import Errors & Solutions

## Error #1: React Hooks from `@wordpress/element`

### ❌ Error Message:
```
The requested module '@wordpress/element' does not provide an export named 'useMemo'
```

### ✅ Solution:
```typescript
// ❌ WRONG
import { useState, useMemo, useCallback } from '@wordpress/element';

// ✅ CORRECT - Import from 'react' instead
import { useState, useMemo, useCallback } from 'react';
```

**Files to check:** Any file using React hooks

---

## Error #2: `__experimentalBoxControl`

### ❌ Error Message:
```
The requested module '@wordpress/components' does not provide an export named '__experimentalBoxControl'
```

### ✅ Solution: Check for Existing Components First!

**⚠️ IMPORTANT:** Before creating custom components, **always check if one already exists** in the codebase.

#### Option 1: Use Existing DimensionsControl (Recommended)

The `popup-kit` block already has a sophisticated `DimensionsControl` component:

```typescript
// ✅ BEST - Use existing component from popup-kit
import DimensionsControl from '../../popup-kit/components/DimensionsControl';

// Usage:
<DimensionsControl
  label={__('Padding', 'voxel-fse')}
  values={attributes.padding || {}}
  onChange={(value) => setAttributes({ padding: value })}
/>
```

**Benefits:**
- Link/unlink functionality
- Unit dropdown (px, %, em, rem, vw, vh)
- Proper value parsing
- Better UX and code reuse

#### Option 2: Create Simple Custom Replacement (If No Existing Component)

Only if a suitable component doesn't exist in `popup-kit` or other blocks:

```typescript
// ✅ Fallback - Custom SimpleBoxControl using standard TextControl
interface BoxValues {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

function SimpleBoxControl({ label, values, onChange }) {
  const updateValue = (side: keyof BoxValues, value: string) => {
    onChange({ ...values, [side]: value });
  };

  return (
    <div className="voxel-fse-box-control">
      <label className="components-base-control__label">{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <TextControl label="Top" value={values?.top || ''} onChange={(v) => updateValue('top', v)} placeholder="0px" />
        <TextControl label="Right" value={values?.right || ''} onChange={(v) => updateValue('right', v)} placeholder="0px" />
        <TextControl label="Bottom" value={values?.bottom || ''} onChange={(v) => updateValue('bottom', v)} placeholder="0px" />
        <TextControl label="Left" value={values?.left || ''} onChange={(v) => updateValue('left', v)} placeholder="0px" />
      </div>
    </div>
  );
}
```

**Before Creating Custom Components:**
1. Check `popup-kit/components/` directory
2. Search other blocks for similar functionality
3. Use `Grep` to find existing components
4. Ask if unsure - reusing is better than rebuilding

---

## Error #3: `RadioControl`

### ❌ Error Message:
```
The requested module '@wordpress/components' does not provide an export named 'RadioControl'
```

### ✅ Solution: Use `SelectControl` Instead

```typescript
// ❌ WRONG
<RadioControl
  selected={value}
  options={[...]}
  onChange={setValue}
/>

// ✅ CORRECT - Use SelectControl
<SelectControl
  value={value}  // Note: 'value' not 'selected'
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]}
  onChange={setValue}
/>
```

---

# Build System Patterns

## Pattern 1: Editor-Only Block (No Frontend JS)

**Use when:** Block only needs to work in Gutenberg editor

**Config:** Default `vite.blocks.config.js` is enough

```javascript
// vite.blocks.config.js (already exists)
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es', // ✅ ES modules for editor
      }
    }
  }
});
```

**Build:** `npm run build`

**Output:** `build/my-block/index.js`

---

## Pattern 2: Block with Frontend React Component

**Use when:** Block needs interactive React component on frontend

**Requires:** Dual build system (ES modules + IIFE)

### Step 1: Create Frontend Config

**File:** `vite.my-block-frontend.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' })],

  build: {
    outDir: 'build',
    emptyOutDir: false, // ⚠️ CRITICAL: Don't delete editor build!

    lib: {
      entry: resolve(__dirname, './app/blocks/src/my-block/frontend.tsx'),
      name: 'VoxelFSEMyBlock',
      formats: ['iife'], // ⚠️ MUST be IIFE for WordPress
      fileName: () => 'my-block-frontend.js',
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
  },
});
```

### Step 2: Update package.json

```json
{
  "scripts": {
    "build": "vite build --config vite.blocks.config.js && npm run build:frontend",
    "build:frontend": "vite build --config vite.frontend.config.js && vite build --config vite.my-block-frontend.config.js"
  }
}
```

### Step 3: Create frontend.tsx

**File:** `frontend.tsx`

```typescript
import { createRoot } from '@wordpress/element';
import { useState } from 'react';

export const MyBlockFrontend = ({ attributes }) => {
  const [state, setState] = useState('');

  return (
    <div className="my-block-frontend">
      {/* Your React component */}
    </div>
  );
};

// Mount on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.voxel-fse-my-block');

  containers.forEach((container) => {
    const root = createRoot(container);
    const attrs = JSON.parse(container.dataset.attributes || '{}');

    root.render(<MyBlockFrontend attributes={attrs} />);
  });
});
```

### Step 4: Enqueue in render.php

**File:** `render.php`

```php
<?php
$block_id = 'my-block-' . uniqid();

// Enqueue frontend script
if (!is_admin()) {
  $frontend_script = get_stylesheet_directory() . '/build/my-block-frontend.js';

  if (file_exists($frontend_script)) {
    wp_enqueue_script(
      'voxel-fse-my-block-frontend',
      get_stylesheet_directory_uri() . '/build/my-block-frontend.js',
      [], // ⚠️ EMPTY - IIFE handles dependencies internally
      filemtime($frontend_script),
      true
    );
  }
}
?>

<div
  class="voxel-fse-my-block"
  id="<?php echo esc_attr($block_id); ?>"
  data-attributes="<?php echo esc_attr(wp_json_encode($attributes)); ?>"
>
  <!-- React will mount here -->
</div>
```

---

# Best Practices Checklist

## ✅ Imports

- [ ] Import React hooks from `'react'` NOT `'@wordpress/element'`
- [ ] Use standard components only (avoid experimental)
- [ ] Import `{ __ }` from `'@wordpress/i18n'` for translations
- [ ] Never import experimental components starting with `__experimental`

## ✅ Components

- [ ] **Check for existing components in `popup-kit/components/` FIRST**
- [ ] Use `SelectControl` instead of `RadioControl`
- [ ] Use `DimensionsControl` from popup-kit for padding/margin/borders
- [ ] Create custom replacements ONLY if no existing component available
- [ ] Use standard WordPress components (PanelBody, TextControl, etc.)
- [ ] Avoid components that might not be in import maps

## ✅ Code Reuse

- [ ] **Always search for existing components before creating new ones**
- [ ] Check `popup-kit/components/` directory first
- [ ] Search other blocks for similar functionality
- [ ] Use `Grep` to find existing component implementations
- [ ] Prefer reusing over rebuilding - smaller bundle, consistent UX

## ✅ Build System

- [ ] Editor build uses ES modules (`format: 'es'`)
- [ ] Frontend build uses IIFE (`format: 'iife'`)
- [ ] Frontend config has `emptyOutDir: false`
- [ ] Frontend config externalizes React/WordPress packages
- [ ] Frontend config maps externals to globals

## ✅ Block Registration

- [ ] Created `block.json` in block directory
- [ ] Block auto-discovered by Block_Loader (no manual registration)
- [ ] `apiVersion: 3` in block.json
- [ ] All required files: index.tsx, edit.tsx, render.php, block.json

## ✅ Frontend Rendering

- [ ] Use IIFE build for frontend React components
- [ ] Enqueue with empty dependencies array `[]`
- [ ] Pass data via `data-attributes` or `wp_localize_script`
- [ ] Mount on `DOMContentLoaded` event

## ✅ TypeScript

- [ ] Define proper interfaces for attributes
- [ ] Type component props correctly
- [ ] Use `Partial<>` for setAttributes parameter
- [ ] Add JSDoc comments to components

## ✅ Child Theme Styling (CRITICAL)

- [ ] **NO style.css property in block.json** - blocks inherit Voxel parent theme
- [ ] Only create `editor.css` for WordPress editor UI (inspector, controls, previews)
- [ ] Block HTML structure EXACTLY matches Voxel widget HTML (class-for-class)
- [ ] Use Voxel's CSS classes (`.ts-form`, `.ts-filter-wrapper`, `.ts-btn`, etc.)
- [ ] Test that parent theme styles apply automatically
- [ ] Never duplicate frontend styles - child theme principle
- [ ] Only add `.voxel-fse-*` classes for editor-specific styling

## ✅ Custom Controls Library

- [ ] Check `shared/controls/` for existing controls FIRST
- [ ] Existing controls: `TagMultiSelect`, `IconPickerControl`
- [ ] Create new controls in `shared/controls/` for Voxel-specific features
- [ ] Export all controls from `shared/controls/index.ts`
- [ ] Import via: `import { ControlName } from '../shared/controls'`
- [ ] Use Stackable controls for standard features (spacing, colors, typography)
- [ ] Use custom controls for Voxel-specific features (dynamic tags, post types, fields)

## ✅ Stackable Integration

- [ ] Wrap block output with `<BlockDiv>` for automatic Advanced/Style tabs
- [ ] Import Stackable controls: `import { ControlName } from '~stackable/components'`
- [ ] Use Stackable for: spacing, colors, typography, visibility, conditions, responsive
- [ ] Build custom for: Voxel-specific features (dynamic tags, post types, Voxel integrations)
- [ ] Can import Stackable controls INTO your custom tabs (hybrid approach)
- [ ] Don't rebuild what Stackable already provides
- [ ] Remember: Stackable controls = editor UI only, your render.php controls frontend

## ✅ Block Naming Convention

- [ ] All block titles MUST have `(VX)` suffix in block.json
- [ ] Example: `"title": "Search Form (VX)"`
- [ ] Displays as "Block Name (VX)" in block inserter
- [ ] Groups all Voxel blocks together visually
- [ ] Matches Voxel branding pattern

---

# Quick Reference

## Available Standard Components

✅ Always safe to use:
- `PanelBody`, `PanelRow`
- `TextControl`, `TextareaControl`
- `SelectControl`, `ToggleControl`, `RangeControl`
- `ColorPalette`, `ColorPicker`
- `Button`, `ButtonGroup`
- `Spinner`, `Placeholder`
- `Dropdown`, `DropdownMenu`
- `CheckboxControl`

## Components to AVOID

❌ Not in import maps:
- `RadioControl` → Use `SelectControl`
- `__experimentalBoxControl` → Create custom with `TextControl`
- `__experimentalBorderControl` → Create custom
- Any component starting with `__experimental`

## Import Pattern Reference

```typescript
// ✅ CORRECT
import { useState, useEffect, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';

// ❌ WRONG
import { useState, useMemo } from '@wordpress/element';
import { RadioControl, __experimentalBoxControl } from '@wordpress/components';
```

## Custom Controls Library Quick Reference

✅ **Existing Controls** (reuse these first):
- `TagMultiSelect` - Multi-select with tag display (Elementor Select2 style)
- `IconPickerControl` - Icon picker with search

✅ **Import Pattern**:
```typescript
import { TagMultiSelect, IconPickerControl } from '../shared/controls';
```

✅ **When to Create Custom Control**:
- Voxel-specific features (dynamic tags, post type pickers, field selectors)
- Complex UI patterns not in Stackable or WordPress
- Reusable across multiple blocks

✅ **When to Use Stackable Instead**:
- Standard controls (spacing, colors, typography, borders)
- Visibility/conditions
- Responsive controls

## Stackable Controls Quick Reference

✅ **Common Stackable Controls**:
```typescript
import {
  AdvancedSpacingControl,     // Padding/margin with responsive
  ColorPaletteControl,          // Color picker
  TypographyControl,            // Font settings
  AdvancedRangeControl,         // Number input with units
  BlockDiv                      // Wrapper for Advanced/Style tabs
} from '~stackable/components';
```

✅ **BlockDiv Wrapper** (adds Advanced/Style tabs automatically):
```typescript
<BlockDiv blockProps={props} attributes={attributes}>
  <div className="my-block-editor">
    {/* Block preview */}
  </div>
</BlockDiv>
```

✅ **Hybrid Approach**:
- Use Stackable controls IN your custom tabs
- Keep your tab structure (Content, General, Inline, etc.)
- Import individual Stackable controls where needed

## Child Theme Styling Quick Reference

❌ **NEVER create**:
```json
// block.json
{
  "style": "file:./style.css"  // ❌ DON'T DO THIS
}
```

✅ **ALWAYS use**:
```json
// block.json
{
  "editorStyle": "file:./editor.css",  // ✅ Editor UI only
  "viewScript": "file:./frontend.js"    // ✅ Frontend React
  // NO style.css property!
}
```

✅ **HTML Structure Matching**:
```tsx
// Your block MUST output Voxel's exact HTML structure
<div className="ts-form ts-search-widget">
  <div className="ts-filter-wrapper flexify">
    <div className="ts-form-group">
      {/* Content */}
    </div>
  </div>
</div>
```

✅ **CSS Class Checklist**:
- `.ts-*` classes = Voxel parent theme (inherit automatically)
- `.voxel-fse-*` classes = Editor-only styling (editor.css)
- `.vx-hidden-*` classes = Voxel responsive utilities (inherit)

---

# Case Studies

For detailed examples of solving specific import map errors:

- **Search Form Block:** `docs/conversions/search-form/search-form-critical-errors-solved.md`
  - React hooks import resolution
  - `__experimentalBoxControl` replacement
  - `RadioControl` replacement

- **Create Post Block:** `docs/conversions/create-post/create-post-critical-errors-solved.md`
  - Dual build system (IIFE + ES modules)
  - Frontend React component mounting
  - WordPress global compatibility

---

# Troubleshooting

## Block doesn't appear in editor?

1. Check browser console for import errors
2. Verify all imports use available components
3. Change React hooks imports to `'react'`
4. Check `block.json` is valid JSON
5. Run `npm run build` again

## Frontend React component not mounting?

1. Verify using IIFE build format
2. Check frontend script is enqueued
3. Verify dependencies array is empty `[]`
4. Check console for errors
5. Verify mount point exists in DOM

## Import errors after build?

1. Check if component is in import maps (see reference above)
2. Replace unavailable components with standard ones
3. Create custom replacements for experimental components
4. Import React hooks from `'react'` not `@wordpress/element`

## Block styling doesn't match Voxel widgets?

1. ✅ Verify NO `style.css` property in block.json
2. ✅ Check HTML structure matches Voxel widget EXACTLY
3. ✅ Verify using Voxel CSS classes (`.ts-*` not custom classes)
4. ✅ Check parent theme CSS is loading (inspect element in browser)
5. ✅ Only use `.voxel-fse-*` classes in editor.css for editor UI
6. ✅ Test on frontend to confirm parent theme inheritance

## Custom control not found?

1. ✅ Check `shared/controls/index.ts` exports the control
2. ✅ Verify control exists in `shared/controls/` directory
3. ✅ Import from correct path: `'../shared/controls'` or `'../../shared/controls'`
4. ✅ Check for typos in import statement
5. ✅ Run `npm run build` to ensure control is compiled

## Stackable controls not working?

1. ✅ Verify Stackable plugin is installed and active
2. ✅ Check import path: `'~stackable/components'` (tilde prefix)
3. ✅ Wrap block with `<BlockDiv>` for automatic Advanced/Style tabs
4. ✅ Remember: Stackable controls = editor UI only, render.php controls frontend
5. ✅ Check browser console for missing dependency errors

---

**Follow this guide for ALL blocks to avoid import map issues.**
**Patterns are tested and proven with Search Form and Create Post blocks.**
**Updated with child theme styling, custom controls library, and Stackable integration patterns.**
