# Voxel Widget Conversion Master Guide

**Version:** 1.1.0
**Last Updated:** December 19, 2025
**Architecture:** Plan C+ (Headless-Ready)
**Purpose:** Complete reference and executable template for converting Voxel Elementor widgets to Gutenberg blocks

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Plan C+ Architecture (MANDATORY)](#2-plan-c-architecture-mandatory)
3. [Pre-Conversion Discovery Checklist](#3-pre-conversion-discovery-checklist)
4. [Step-by-Step Conversion Process](#4-step-by-step-conversion-process)
5. [Elementor to Gutenberg Control Mapping](#5-elementor-to-gutenberg-control-mapping)
6. [HTML Structure Preservation Requirements](#6-html-structure-preservation-requirements)
7. [Child Theme Styling Strategy](#7-child-theme-styling-strategy)
8. [Build System Configuration](#8-build-system-configuration)
9. [WordPress Import Map Limitations](#9-wordpress-import-map-limitations)
10. [Popup/Modal Implementation](#10-popupmodal-implementation)
11. [REST API Integration](#11-rest-api-integration)
12. [Decision Trees](#12-decision-trees)
13. [Validation Checklist](#13-validation-checklist)
14. [Common Issues & Solutions](#14-common-issues--solutions)
15. [Complete Code Templates](#15-complete-code-templates)
16. [Reference Files](#16-reference-files)

---

## 1. Executive Summary

### Purpose

This guide serves as both a **reference document** and an **executable template** for converting Voxel Elementor widgets to headless-ready Gutenberg blocks. It is designed to enable an AI model or developer to convert ANY Voxel widget from a single prompt input.

### Target Outcome

After following this guide, a converted block will:
- Maintain **1:1 HTML structure fidelity** with the original Voxel widget
- Be **headless-ready** (compatible with Next.js frontends)
- Use **Plan C+ architecture** (API-driven, no PHP rendering)
- Properly map all Elementor controls to Gutenberg Inspector Controls
- Inherit all styling from Voxel parent theme (zero CSS duplication)

### Architecture Decision

**ALL converted blocks MUST use Plan C+ architecture.**

This is non-negotiable because:
- Next.js cannot execute PHP (render.php is useless in headless)
- ServerSideRender creates WordPress dependency
- API-driven approach enables database portability (Supabase migration)
- Shared components ensure editor/frontend parity

---

## 2. Plan C+ Architecture (MANDATORY)

### What is Plan C+?

Plan C+ is our **headless-ready block architecture** that eliminates PHP rendering in favor of:

1. **Minimal database storage** - Only vxconfig JSON in a script tag
2. **REST API as single source of truth** - Field configuration fetched at runtime
3. **React hydration pattern** - Static HTML placeholder → React mount
4. **Shared component architecture** - Same React component in editor & frontend
5. **No PHP rendering** - NO render.php, NO render_callback, NO ServerSideRender

### Why NO PHP Rendering?

| Approach | WordPress | Next.js (Headless) | Verdict |
|----------|-----------|-------------------|---------|
| render.php | Works | Cannot execute PHP | REJECTED |
| ServerSideRender | Works | Cannot execute PHP | REJECTED |
| render_callback | Works | Cannot execute PHP | REJECTED |
| **Plan C+ (API + React)** | **Works** | **Works** | **REQUIRED** |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        GUTENBERG EDITOR                                  │
│                                                                          │
│  ┌─────────────────┐       ┌────────────────────────┐                   │
│  │    edit.tsx     │──────▶│   useBlockConfig()     │                   │
│  │                 │       │   (REST API fetch)     │                   │
│  └────────┬────────┘       └───────────┬────────────┘                   │
│           │                            │                                 │
│           │              /wp-json/voxel-fse/v1/{endpoint}               │
│           │                            │                                 │
│           ▼                            ▼                                 │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │              SharedBlockComponent (React)                     │       │
│  │  - Renders form/widget UI                                     │       │
│  │  - Handles state & validation                                 │       │
│  │  - Interactive editor preview                                 │       │
│  └──────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ save.tsx
                              │ (outputs vxconfig JSON + placeholder)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     DATABASE (post_content)                              │
│                                                                          │
│  <div class="voxel-fse-{block}-frontend" data-block-type="{type}">      │
│    <script type="text/json" class="vxconfig">                           │
│      {                                                                   │
│        "attribute1": "value1",                                          │
│        "attribute2": "value2",                                          │
│        "icons": { ... }                                                  │
│      }                                                                   │
│    </script>                                                            │
│    <div class="voxel-fse-block-placeholder">                            │
│      <span class="placeholder-icon">{emoji}</span>                      │
│      <span class="placeholder-text">{Block Name} (VX)</span>            │
│    </div>                                                                │
│  </div>                                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ frontend.tsx (viewScript)
                              │ (React hydration)
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      FRONTEND RENDERING                                  │
│                                                                          │
│  ┌─────────────────────┐    ┌─────────────────────────┐                 │
│  │   frontend.tsx      │───▶│   parseVxConfig()       │                 │
│  │   - Find containers │    │   (from script tag)     │                 │
│  │   - Parse vxconfig  │    └─────────────────────────┘                 │
│  │   - Fetch REST API  │                                                │
│  │   - Mount React     │    fetchBlockConfig()                          │
│  └──────────┬──────────┘    /wp-json/voxel-fse/v1/{endpoint}           │
│             │                                                            │
│             ▼                                                            │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │              SharedBlockComponent (React)                     │       │
│  │  - SAME component as editor!                                  │       │
│  │  - Full interactive functionality                             │       │
│  │  - Voxel AJAX submission (for forms)                         │       │
│  └──────────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ Future: Next.js Frontend
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS HEADLESS FRONTEND                             │
│                                                                          │
│  // Same REST API, same component logic                                  │
│  const config = await fetch('/wp-json/voxel-fse/v1/{endpoint}');        │
│  return <SharedBlockComponent config={config} />;                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### File Structure per Block (Plan C+)

```
my-block/
├── block.json              # Block metadata (NO "render" property!)
├── index.tsx               # Editor entry point (registerBlockType)
├── edit.tsx                # Editor component with InspectorControls
├── save.tsx                # Outputs vxconfig JSON + placeholder HTML
├── frontend.tsx            # React hydration entry point (viewScript)
├── shared/                 # Shared React components
│   ├── MyBlockComponent.tsx    # Main component (used by edit + frontend)
│   ├── SubComponent1.tsx       # Sub-components as needed
│   └── SubComponent2.tsx
├── hooks/
│   └── useBlockConfig.ts   # REST API fetching hook
├── types/
│   └── index.ts            # TypeScript interfaces
└── editor.css              # Editor-only styles (NO style.css!)
```

### Key Files Explained

| File | Purpose | When Executed |
|------|---------|---------------|
| `block.json` | Block metadata & attributes | WordPress registration |
| `index.tsx` | Registers block with WordPress | Editor load |
| `edit.tsx` | Editor preview + InspectorControls | Block editing |
| `save.tsx` | Outputs static HTML + vxconfig | Block save |
| `frontend.tsx` | Parses vxconfig, mounts React | Page load (frontend) |
| `shared/*.tsx` | React components | Editor + Frontend |
| `hooks/*.ts` | Data fetching hooks | Editor + Frontend |

---

## 3. Pre-Conversion Discovery Checklist

Before writing any code, complete this discovery phase:

### 3.1 Widget Identification

- [ ] **Widget Name:** ____________________
- [ ] **Widget File Location:** `themes/voxel/templates/widgets/{widget-name}.php`
- [ ] **Official Voxel Docs:** `docs/voxel-documentation/docs.getvoxel.io_articles_{widget-name}_.md`

### 3.2 HTML Structure Analysis

Inspect the Elementor widget's rendered HTML output:

```bash
# Method 1: Browser DevTools
# 1. Add widget to Elementor page
# 2. Preview page
# 3. Right-click → Inspect Element
# 4. Copy entire widget HTML structure

# Method 2: View Page Source
# Look for the widget's wrapper class
```

Document:
- [ ] **Outer wrapper class(es):** ____________________
- [ ] **Inner structure hierarchy:** ____________________
- [ ] **All CSS classes used:** ____________________
- [ ] **Data attributes:** ____________________
- [ ] **SVG icons (copy inline):** ____________________

### 3.3 Control Inventory

List ALL Elementor controls from the widget:

| Control Name | Elementor Type | Default Value | Section |
|--------------|---------------|---------------|---------|
| | | | |

Common Elementor control types:
- `TEXT`, `TEXTAREA`, `NUMBER`, `SELECT`, `SELECT2`
- `SWITCHER`, `SLIDER`, `CHOOSE`, `COLOR`
- `ICONS`, `TYPOGRAPHY`, `DIMENSIONS`
- `REPEATER`, `GALLERY`, `MEDIA`

### 3.4 Data Source Identification

- [ ] **Does widget need server-side data?** (field definitions, post types, etc.)
  - YES → Create REST API endpoint
  - NO → vxconfig only (static block)

- [ ] **Does widget use Voxel AJAX?** (form submission, data fetching)
  - YES → Document AJAX actions needed
  - NO → Skip AJAX integration

- [ ] **Does widget have popups/modals?**
  - YES → Use FieldPopup component with React Portal
  - NO → Standard rendering

### 3.5 JavaScript Behavior Analysis

- [ ] **Event handlers:** (click, submit, change, etc.)
- [ ] **State management:** (form values, UI state)
- [ ] **API interactions:** (AJAX calls, REST requests)
- [ ] **Third-party dependencies:** (TinyMCE, date pickers, etc.)

---

## 4. Step-by-Step Conversion Process

### Phase 1: Discovery (Research Only)

**Time:** 30-60 minutes

1. **Read Official Voxel Documentation**
   ```
   Location: docs/voxel-documentation/docs.getvoxel.io_articles_{widget-name}_.md
   ```
   - Understand widget purpose and features
   - Note all configurable options
   - Identify user-facing behaviors

2. **Inspect Widget HTML Output**
   - Add widget to Elementor page
   - Preview and inspect rendered HTML
   - Document ALL CSS classes (ts-*, vx-*, nvx-*)
   - Copy SVG icons exactly (inline, not references)

3. **Document Elementor Controls**
   - Open widget PHP file: `themes/voxel/templates/widgets/{widget}.php`
   - Find `_register_controls()` method
   - List every control with type and default value

4. **Identify JavaScript Dependencies**
   - Check for Vue.js components
   - Note any Voxel.mixins used (popup, blurable, etc.)
   - Document AJAX action names

5. **Determine Data Requirements**
   - Does it need post type definitions?
   - Does it need field configurations?
   - Does it need user data?
   - Plan REST API endpoint if needed

### Phase 2: Block Scaffolding

**Time:** 15-30 minutes

1. **Create Block Directory**
   ```bash
   mkdir -p themes/voxel-fse/app/blocks/src/{block-name}
   mkdir -p themes/voxel-fse/app/blocks/src/{block-name}/shared
   mkdir -p themes/voxel-fse/app/blocks/src/{block-name}/hooks
   mkdir -p themes/voxel-fse/app/blocks/src/{block-name}/types
   ```

2. **Create block.json**
   ```json
   {
     "apiVersion": 3,
     "name": "voxel-fse/{block-name}",
     "version": "1.0.0",
     "title": "{Block Title} (VX)",
     "category": "voxel-fse",
     "icon": "star-filled",
     "description": "Converted from Voxel {Widget Name} widget",
     "keywords": ["voxel", "{keyword1}", "{keyword2}"],
     "textdomain": "voxel-fse",
     "editorScript": "file:./index.js",
     "editorStyle": "file:./editor.css",
     "viewScript": "file:./frontend.js",
     "supports": {
       "html": false,
       "anchor": true,
       "className": true
     },
     "attributes": {
       // Define all attributes here
     }
   }
   ```

   **CRITICAL:**
   - NO `"render"` property (no PHP rendering!)
   - NO `"style"` property (inherit from parent theme!)
   - NO `"icon"` property (set in index.tsx using VoxelGridIcon!)
   - Title MUST end with `(VX)` for brand identification
   - Category MUST be `"voxel-fse"` (displays as "VOXEL FSE" in editor)

3. **Block Icon Standard**

   **ALWAYS use the shared VoxelGridIcon component:**

   ```typescript
   // index.tsx
   import { registerBlockType } from '@wordpress/blocks';
   import Edit from './edit';
   import save from './save';
   import metadata from './block.json';
   import VoxelGridIcon from '../shared/VoxelGridIcon';  // REQUIRED

   registerBlockType(metadata.name, {
     ...metadata,
     icon: VoxelGridIcon,  // Use shared 3x3 grid icon
     edit: Edit,
     save,
   });
   ```

   **Why VoxelGridIcon?**
   - Consistent branding across all Voxel FSE blocks
   - Single shared component (0.82 kB gzipped)
   - Matches original VX Grid Icon design (3x3 squares pattern)
   - Easy to update globally (one file change)

   **NEVER:**
   - ❌ Create custom inline SVG icons in block registration
   - ❌ Define `"icon"` field in block.json
   - ❌ Use different icons for different blocks
   - ❌ Use WordPress Dashicons for Voxel blocks

4. **Create TypeScript Interfaces**
   ```typescript
   // types/index.ts
   export interface BlockAttributes {
     // Map all block.json attributes here
   }

   export interface VxConfig {
     // Structure of vxconfig JSON
   }
   ```

5. **Create index.tsx Entry Point**
   ```typescript
   import { registerBlockType } from '@wordpress/blocks';
   import Edit from './edit';
   import save from './save';
   import metadata from './block.json';
   import VoxelGridIcon from '../shared/VoxelGridIcon';

   registerBlockType(metadata.name, {
     ...metadata,
     icon: VoxelGridIcon,  // REQUIRED: Use shared VoxelGridIcon
     edit: Edit,
     save,
   });
   ```

### Phase 3: Inspector Controls Implementation

**Time:** 1-2 hours

1. **Map Elementor Controls to Gutenberg**
   - Reference Section 5 (Control Mapping Table)
   - Use shared controls from `src/shared/controls/`
   - Create custom controls only when necessary

2. **Organize into PanelBody Sections**
   ```typescript
   <InspectorControls>
     <PanelBody title={__('Content', 'voxel-fse')} initialOpen={true}>
       {/* Content controls */}
     </PanelBody>
     <PanelBody title={__('Style', 'voxel-fse')} initialOpen={false}>
       {/* Style controls */}
     </PanelBody>
     <PanelBody title={__('Advanced', 'voxel-fse')} initialOpen={false}>
       {/* Advanced controls */}
     </PanelBody>
   </InspectorControls>
   ```

3. **Handle Responsive Controls**
   - Use `ResponsiveControl` wrapper for device-specific values
   - Follow naming pattern: `attribute`, `attribute_tablet`, `attribute_mobile`

### Phase 4: Editor Component (edit.tsx)

**Time:** 2-4 hours

1. **Implement REST API Hook**
   ```typescript
   // hooks/useBlockConfig.ts
   import { useState, useEffect } from 'react';
   import apiFetch from '@wordpress/api-fetch';

   export function useBlockConfig(configKey: string) {
     const [config, setConfig] = useState(null);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState(null);

     useEffect(() => {
       if (!configKey) {
         setIsLoading(false);
         return;
       }

       apiFetch({ path: `/voxel-fse/v1/{endpoint}?key=${configKey}` })
         .then((data) => {
           setConfig(data);
           setIsLoading(false);
         })
         .catch((err) => {
           setError(err.message);
           setIsLoading(false);
         });
     }, [configKey]);

     return { config, isLoading, error };
   }
   ```

2. **Create Edit Component**
   ```typescript
   // edit.tsx
   import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
   import { PanelBody, Spinner } from '@wordpress/components';
   import { __ } from '@wordpress/i18n';
   import { useBlockConfig } from './hooks/useBlockConfig';
   import SharedBlockComponent from './shared/SharedBlockComponent';

   export default function Edit({ attributes, setAttributes }) {
     const blockProps = useBlockProps();
     const { config, isLoading, error } = useBlockConfig(attributes.configKey);

     return (
       <>
         <InspectorControls>
           {/* All controls here */}
         </InspectorControls>

         <div {...blockProps}>
           {isLoading && <Spinner />}
           {error && <div className="error">{error}</div>}
           {!isLoading && !error && (
             <SharedBlockComponent
               attributes={attributes}
               config={config}
               context="editor"
             />
           )}
         </div>
       </>
     );
   }
   ```

### Phase 5: Save/Database Storage (save.tsx)

**Time:** 30 minutes

```typescript
// save.tsx
import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const blockProps = useBlockProps.save();

  // Build vxconfig object with ALL attributes needed by frontend
  const vxConfig = {
    attribute1: attributes.attribute1,
    attribute2: attributes.attribute2,
    // Group related attributes
    icons: {
      icon1: attributes.icon1,
      icon2: attributes.icon2,
    },
    // Include responsive values
    responsive: {
      width: attributes.width,
      width_tablet: attributes.width_tablet,
      width_mobile: attributes.width_mobile,
    },
  };

  return (
    <div
      {...blockProps}
      className="voxel-fse-{block-name}-frontend"
      data-block-type="{block-name}"
    >
      {/* vxconfig JSON - parsed by frontend.tsx */}
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
      />

      {/* Placeholder - replaced by React on mount */}
      <div className="voxel-fse-block-placeholder">
        <span className="placeholder-icon">{/* emoji */}</span>
        <span className="placeholder-text">{Block Name} (VX)</span>
      </div>
    </div>
  );
}
```

### Phase 6: Frontend Hydration (frontend.tsx)

**Time:** 1-2 hours

⚠️ **CRITICAL: Always import from `react-dom/client`, NEVER use `window.wp.element`**

`window.wp.element` only exists in the editor. Frontend pages only have `window.React` and `window.ReactDOM`.

```typescript
// frontend.tsx
import { createRoot } from 'react-dom/client';  // ✅ CORRECT
import { useState, useEffect } from 'react';     // ✅ CORRECT
import SharedBlockComponent from './shared/SharedBlockComponent';

// ❌ WRONG - will cause "React is not defined" errors:
// const { createRoot } = window.wp.element;

interface VxConfig {
  // Same interface as save.tsx vxConfig
}

/**
 * Parse vxconfig JSON from script tag
 */
function parseVxConfig(container: HTMLElement): VxConfig | null {
  const script = container.querySelector<HTMLScriptElement>('script.vxconfig');
  if (!script?.textContent) {
    console.error('[{block-name}] No vxconfig found');
    return null;
  }

  try {
    return JSON.parse(script.textContent);
  } catch (e) {
    console.error('[{block-name}] Failed to parse vxconfig:', e);
    return null;
  }
}

/**
 * Fetch additional config from REST API (if needed)
 */
async function fetchBlockConfig(configKey: string) {
  const restUrl = (window as any).wpApiSettings?.root || '/wp-json/';
  const endpoint = `${restUrl}voxel-fse/v1/{endpoint}?key=${configKey}`;

  // NOTE: Public endpoint - do NOT send nonce (causes "Cookie check failed")
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(vxConfig: VxConfig) {
  return {
    attribute1: vxConfig.attribute1,
    attribute2: vxConfig.attribute2,
    ...vxConfig.icons,
    ...vxConfig.responsive,
  };
}

/**
 * Initialize all block instances on page
 */
async function initBlocks() {
  const containers = document.querySelectorAll<HTMLElement>(
    '.voxel-fse-{block-name}-frontend:not([data-react-mounted])'
  );

  for (const container of containers) {
    // Mark as mounted to prevent double initialization
    container.setAttribute('data-react-mounted', 'true');

    const vxConfig = parseVxConfig(container);
    if (!vxConfig) continue;

    try {
      // Fetch additional config if needed
      const apiConfig = vxConfig.configKey
        ? await fetchBlockConfig(vxConfig.configKey)
        : null;

      const attributes = buildAttributes(vxConfig);

      // Mount React component
      const root = createRoot(container);
      root.render(
        <SharedBlockComponent
          attributes={attributes}
          config={apiConfig}
          context="frontend"
        />
      );
    } catch (error) {
      console.error('[{block-name}] Initialization failed:', error);
    }
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlocks);
} else {
  initBlocks();
}

// Support Turbo/PJAX navigation
window.addEventListener('turbo:load', initBlocks);
```

### Phase 7: Build Configuration

**Time:** 30 minutes

1. **Editor Build (ES Modules)** - Already configured in `vite.blocks.config.js`

2. **Frontend Build (IIFE)** - Create if block has frontend.tsx:
   ```javascript
   // vite.{block-name}-frontend.config.js
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import { resolve } from 'path';

   export default defineConfig({
     plugins: [react()],
     build: {
       emptyOutDir: false, // CRITICAL: Don't delete editor build!
       outDir: resolve(__dirname, './app/blocks/src/{block-name}'),
       lib: {
         entry: resolve(__dirname, './app/blocks/src/{block-name}/frontend.tsx'),
         name: 'VoxelFSE{BlockName}',
         formats: ['iife'],
         fileName: () => 'frontend.js',
       },
       rollupOptions: {
         external: ['react', 'react-dom', '@wordpress/element', '@wordpress/api-fetch'],
         output: {
           globals: {
             'react': 'React',
             'react-dom': 'ReactDOM',
             '@wordpress/element': 'wp.element',
             '@wordpress/api-fetch': 'wp.apiFetch',
           },
         },
       },
     },
   });
   ```

3. **Update package.json Scripts**
   ```json
   {
     "scripts": {
       "build": "vite build --config vite.blocks.config.js && npm run build:frontend",
       "build:frontend": "npm run build:frontend:{block-name}",
       "build:frontend:{block-name}": "vite build --config vite.{block-name}-frontend.config.js"
     }
   }
   ```

---

## 5. Elementor to Gutenberg Control Mapping

### Standard Controls

| Elementor Control | Gutenberg Equivalent | Import From | Notes |
|-------------------|---------------------|-------------|-------|
| `TEXT` | `TextControl` | `@wordpress/components` | Standard text input |
| `TEXTAREA` | `TextareaControl` | `@wordpress/components` | Multi-line text |
| `NUMBER` | `TextControl` or `RangeControl` | `@wordpress/components` | Use type="number" |
| `SELECT` | `SelectControl` | `@wordpress/components` | Dropdown select |
| `SWITCHER` | `ToggleControl` | `@wordpress/components` | Boolean toggle |
| `SLIDER` | `RangeControl` | `@wordpress/components` | Numeric slider |
| `COLOR` | `ColorPalette` | `@wordpress/components` | Color picker |
| `HIDDEN` | N/A | - | Store in attributes only |

### Custom Shared Controls

| Elementor Control | Shared Control | Location | Notes |
|-------------------|---------------|----------|-------|
| `SELECT2` | `TagMultiSelect` | `shared/controls/TagMultiSelect.tsx` | Multi-select with search |
| `SELECT2` (single) | `Select2Control` | `shared/controls/Select2Control.tsx` | Single-select dropdown with groups |
| `POST_SELECT` | `TemplateSelectControl` | `shared/controls/TemplateSelectControl.tsx` | FSE template selector |
| `CHOOSE` | `ChooseControl` | `shared/controls/ChooseControl.tsx` | Icon button group |
| `ICONS` | `IconPickerControl` | `shared/controls/IconPickerControl.tsx` | Voxel icon library |
| `TYPOGRAPHY` | `TypographyControl` | `shared/controls/TypographyControl.tsx` | Font settings |
| `DIMENSIONS` | `BoxControl` | `shared/controls/BoxControl.tsx` | 4-sided values |
| `SLIDER` (responsive) | `ResponsiveRangeControl` | `shared/controls/ResponsiveRangeControl.tsx` | Device-specific |
| Dynamic Text | `DynamicTagTextControl` | `shared/controls/DynamicTagTextControl.tsx` | VoxelScript tags |

### Generic + Specialized Control Pattern

The `Select2Control` demonstrates the **generic + specialized** pattern for creating reusable controls:

**Generic Control (`Select2Control`):**
- Accepts data via callbacks (`onFetch`, `onFetchSingle`)
- Source-agnostic (works with any data type)
- Provides UI logic (dropdown, search, selection, positioning)
- Type-safe via TypeScript interfaces (no `any` types)
- Supports lazy loading, dynamic tags, and grouped options
- Uses Voxel CSS classes (inherits from parent theme)

**Specialized Wrappers:**
- `TemplateSelectControl` - Fetches FSE templates/template-parts
- Future: `PostSelectControl`, `UserSelectControl`, `TaxonomySelectControl`, etc.

**Architecture Pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Select2Control (Generic)                  │
│  - UI rendering                                              │
│  - State management                                          │
│  - Positioning logic                                         │
│  - Filtering                                                 │
│  - Dynamic tag support                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ accepts onFetch callback
                           │
         ┌─────────────────┴──────────────────┐
         │                                    │
┌────────▼─────────────┐      ┌──────────────▼─────────────┐
│ TemplateSelectControl│      │  PostSelectControl (future)│
│                      │      │                            │
│ - fetchAllFSE...()   │      │  - fetchPosts()            │
│ - fetchTemplate()    │      │  - fetchPost()             │
└──────────────────────┘      └────────────────────────────┘
```

**Benefits:**
- Single source of truth for dropdown UI
- Consistent UX across all blocks
- Easy to create new specialized controls
- Type-safe with minimal code duplication
- Separation of concerns (UI logic vs data fetching)

**Example Usage - Specialized Wrapper:**
```typescript
// In your block's edit.tsx
import { TemplateSelectControl } from '../shared/controls';

<TemplateSelectControl
  label={__('Template', 'voxel-fse')}
  value={attributes.templateId}
  onChange={(value) => setAttributes({ templateId: value })}
  placeholder={__('Search templates', 'voxel-fse')}
  context="post"
/>
```

**Example Usage - Generic Control with Custom Data:**
```typescript
// Creating a custom post picker using generic Select2Control
import { Select2Control } from '../shared/controls';
import type { Select2Group } from '../shared/controls';
import { useCallback } from 'react';
import apiFetch from '@wordpress/api-fetch';

function PostPickerControl({ label, value, onChange }) {
  const fetchPosts = useCallback(async (): Promise<Select2Group[]> => {
    const posts = await apiFetch({ path: '/wp/v2/posts?per_page=100' });
    return [{
      label: 'Posts',
      type: 'post',
      items: posts.map(p => ({
        id: String(p.id),
        title: p.title.rendered,
        type: 'post',
      })),
    }];
  }, []);

  const fetchPost = useCallback(async (id: string) => {
    const post = await apiFetch({ path: `/wp/v2/posts/${id}` });
    return {
      id: String(post.id),
      title: post.title.rendered,
      type: 'post',
    };
  }, []);

  return (
    <Select2Control
      label={label}
      value={value}
      onChange={onChange}
      onFetch={fetchPosts}
      onFetchSingle={fetchPost}
      enableDynamicTags={false}
      emptyMessage={__('No posts found', 'voxel-fse')}
    />
  );
}
```

**Progressive Enhancement Pattern:**
```typescript
// Minimal usage - static groups
<Select2Control
  label="Select Item"
  value={value}
  onChange={onChange}
  groups={staticGroups}
/>

// Add lazy loading
<Select2Control
  label="Select Item"
  value={value}
  onChange={onChange}
  onFetch={fetchGroups}
/>

// Add dynamic tags
<Select2Control
  label="Select Item"
  value={value}
  onChange={onChange}
  onFetch={fetchGroups}
  enableDynamicTags={true}
  context="post"
/>
```

**Key Implementation Details:**
- **Lazy Loading:** Data fetches only when dropdown opens (performance optimization)
- **CSS Inheritance:** Uses Voxel's Select2 classes (`.vxfse-select2-wrap`, `.select2-container`, etc.) - zero custom CSS
- **TypeScript Strict Mode:** All props properly typed, no `any` types, proper optional/nullable handling
- **WordPress Import Map Compatible:** React hooks from `'react'`, standard WordPress components only
- **Callback-Based:** Control doesn't know data source - works with REST API, static data, or any async function

**Reference:** See `docs/conversions/print-template/select2-control-implementation-summary.md` for complete implementation guide.

### Responsive Control Pattern

For ANY control that needs device-specific values:

```typescript
import { ResponsiveControl } from '@shared/controls';

// Attributes in block.json
{
  "width": { "type": "number", "default": 100 },
  "width_tablet": { "type": "number" },
  "width_mobile": { "type": "number" }
}

// Usage in edit.tsx
<ResponsiveControl
  label={__('Width', 'voxel-fse')}
  value={attributes.width}
  valueTablet={attributes.width_tablet}
  valueMobile={attributes.width_mobile}
  onChange={(v) => setAttributes({ width: v })}
  onChangeTablet={(v) => setAttributes({ width_tablet: v })}
  onChangeMobile={(v) => setAttributes({ width_mobile: v })}
>
  {(device, value, onChange) => (
    <RangeControl
      value={value}
      onChange={onChange}
      min={0}
      max={100}
    />
  )}
</ResponsiveControl>
```

### Controls NOT Available in WordPress Import Maps

These components are NOT available via browser import maps. Create custom alternatives:

| Unavailable | Alternative | Notes |
|-------------|-------------|-------|
| `RadioControl` | `SelectControl` | Use dropdown instead |
| `__experimentalBoxControl` | Custom `BoxControl` | Use shared control at `@shared/controls/BoxControl` |
| `TabPanel` | Custom `StyleTabPanel` | Use shared control at `@shared/controls/StyleTabPanel` |
| `useMemo` from `@wordpress/element` | `useMemo` from `'react'` | Import from React directly |
| `useCallback` from `@wordpress/element` | `useCallback` from `'react'` | Import from React directly |
| `MenuItem`, `MenuGroup` | Custom implementation | Build from primitives |

### Control Development Best Practices

Based on the `Select2Control` implementation, follow these patterns when creating new shared controls:

**1. Generic First, Specialize Later**
- Start with a generic, reusable control
- Create specialized wrappers for specific use cases
- Example: `Select2Control` (generic) → `TemplateSelectControl` (specialized)

**2. Callback-Based Data Loading**
- Use `onFetch` callbacks instead of hard-coded data sources
- Makes control data-source agnostic
- Works with REST API, static data, or any async function

**3. Lazy Loading Pattern**
- Fetch data only when needed (e.g., when dropdown opens)
- Use `hasLoaded` flag to prevent duplicate fetches
- Improves performance and reduces initial load time

**4. TypeScript Strict Mode Compliance**
- Never use `any` types
- Define proper interfaces for all props
- Use optional (`?`) and nullable (`| null`) types correctly
- Use type guards for runtime validation

**5. CSS Inheritance Strategy**
- Use Voxel's existing CSS classes
- Never duplicate Voxel styles in custom CSS
- Match HTML structure 1:1 to inherit parent styles
- Zero custom CSS = smaller bundle + no conflicts

**6. WordPress Import Map Compatibility**
- Import React hooks from `'react'` (not `@wordpress/element`)
- Use only verified WordPress components
- Avoid experimental or deprecated APIs

**7. Progressive Enhancement**
- Support minimal usage (static data)
- Add features incrementally (lazy loading, dynamic tags)
- Keep API simple and extensible

**Reference Implementation:** See `Select2Control` (`app/blocks/src/shared/controls/Select2Control.tsx`) for a complete example of these patterns.

---

## 6. HTML Structure Preservation Requirements

### The Golden Rule

**Your block MUST output IDENTICAL HTML structure to the Voxel Elementor widget.**

This is critical because:
- Voxel parent theme CSS targets specific class names and DOM structure
- Child theme inherits these styles automatically
- Different structure = broken styling

### CSS Class Prefixes (USE VOXEL'S - DON'T CREATE NEW)

| Prefix | Purpose | Example |
|--------|---------|---------|
| `.ts-*` | Theme styles (forms, buttons, UI) | `.ts-form`, `.ts-btn`, `.ts-filter` |
| `.vx-*` | Voxel utilities | `.vx-hidden-desktop`, `.vx-1-2` |
| `.nvx-*` | New Voxel generation styles | `.nvx-card` |
| `.flexify` | Flexbox utility | `<div class="flexify">` |
| `.simplify-ul` | List reset | `<ul class="simplify-ul">` |
| `.vxfse-select2-wrap` | Select2 wrapper | Used by Select2Control |
| `.select2-container` | Select2 container | Voxel Select2 styles |
| `.select2-selection--single` | Single select | Select2 selection styles |
| `.select2-dropdown` | Dropdown menu | Select2 dropdown styles |

**Example: Select2Control CSS Inheritance**

The `Select2Control` component demonstrates perfect CSS inheritance - it uses Voxel's existing Select2 classes without any custom CSS:

```typescript
// Select2Control.tsx - Uses Voxel classes, inherits all styling
<div className="vxfse-select2-wrap select2-container select2-container--default">
  <span className="select2-selection select2-selection--single">
    <span className="select2-selection__rendered">
      {selectedOption.title}
    </span>
  </span>
</div>
```

**Result:** Zero custom CSS needed. Component inherits all styling from:
- `themes/voxel/assets/css/elementor-controls.css`
- Voxel parent theme styles automatically apply to child theme

### HTML Matching Checklist

- [ ] Outer wrapper uses exact Voxel class names
- [ ] DOM hierarchy matches exactly (same nesting levels)
- [ ] All CSS classes preserved in correct order
- [ ] Data attributes copied exactly
- [ ] SVG icons copied inline (not as references)
- [ ] Conditional classes applied correctly

### Example: Search Form Widget

**Voxel Widget HTML:**
```html
<div class="ts-form ts-search-widget elementor-element">
  <div class="ts-form-group">
    <div class="ts-filter ts-filter-keywords">
      <div class="ts-input-icon flexify">
        <svg><!-- search icon --></svg>
        <input type="text" class="ts-input-text" placeholder="Search...">
      </div>
    </div>
  </div>
  <div class="ts-form-group">
    <button class="ts-btn ts-btn-1">
      <svg><!-- button icon --></svg>
      <span>Search</span>
    </button>
  </div>
</div>
```

**Your Block Output (must match EXACTLY):**
```tsx
<div className="ts-form ts-search-widget">
  <div className="ts-form-group">
    <div className="ts-filter ts-filter-keywords">
      <div className="ts-input-icon flexify">
        <svg><!-- SAME search icon --></svg>
        <input type="text" className="ts-input-text" placeholder="Search..." />
      </div>
    </div>
  </div>
  <div className="ts-form-group">
    <button className="ts-btn ts-btn-1">
      <svg><!-- SAME button icon --></svg>
      <span>Search</span>
    </button>
  </div>
</div>
```

---

## 7. Child Theme Styling Strategy

### Critical Rule: NO CSS Duplication

**DO NOT create style.css to duplicate Voxel CSS classes!**

Since voxel-fse is a **child theme** of Voxel:
- Use EXACT same HTML structure as Voxel Elementor widgets
- Use EXACT same CSS class names
- Parent theme CSS automatically applies
- Zero custom frontend CSS = smaller bundle + no conflicts

### When to Use style.css (RARE)

Only create `style.css` for:
- Responsive design features that CANNOT be solved with React/inline styles
- Block-specific responsive breakpoints not covered by Voxel
- Edge cases where parent CSS doesn't apply

**WARNING:** style.css often conflicts with Gutenberg editor. Avoid if possible.

### editor.css Usage

Create `editor.css` for:
- Editor-only UI styling (Inspector panels, placeholders)
- Custom control styles (Select2, IconPicker dropdowns)
- Block placeholder/loading states in editor
- Scoped styles using `.voxel-fse-*` prefixes

**NEVER import style.css into editor.css:**
```css
/* editor.css - WRONG */
@import './style.css'; /* This causes conflicts! */

/* editor.css - CORRECT */
/* Editor-specific styles only */
.voxel-fse-block-placeholder {
  padding: 20px;
  background: #f0f0f0;
  text-align: center;
}
```

### block.json Configuration

```json
{
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "viewScript": "file:./frontend.js"
  // NO "style" property - inherit from parent!
  // NO "render" property - no PHP!
}
```

### FSE Editor CSS Loading Strategy

**Core Principle:** Use the right CSS loading method for the right purpose.

WordPress FSE (Full Site Editing) uses an iframe for the template editor, which requires special consideration for CSS loading. The voxel-fse child theme uses a three-method approach:

#### Method 1: `add_editor_style()` - Global Child Theme Styles ONLY

**Purpose:** Load truly global child theme styles (CSS variables, base theme styles)

**Usage:**
```php
// themes/voxel-fse/app/blocks/Block_Loader.php
add_action('after_setup_theme', function() {
    // ONLY load global child theme CSS
    add_editor_style('assets/css/voxel-fse-commons.css');
}, 20);
```

**When to use:**
- ✅ Child theme CSS variables
- ✅ Base typography for child theme
- ✅ Truly global child theme styles

**When NOT to use:**
- ❌ Block-specific styles (use editorStyle dependencies instead)
- ❌ Parent theme styles (loaded via block dependencies)
- ❌ Styles that should only load when a block is used

**How it works:**
- Inlines CSS in FSE iframe `<style>` tag
- Loads for ALL templates (not on-demand)
- WordPress checks child theme first, falls back to parent

**Example:**
```php
public static function add_editor_styles_for_fse() {
    // Only load child theme's global CSS variables
    // Parent theme styles are loaded via block dependencies when blocks are used
    add_editor_style('assets/css/voxel-fse-commons.css');
}
```

#### Method 2: Block `editorStyle` Dependencies - Block-Specific Parent Theme Styles

**Purpose:** Load parent theme styles ON DEMAND when specific blocks are inserted

**Usage:**
```php
// During block registration in Block_Loader.php
if ($block_name === 'timeline-kit') {
    self::ensure_voxel_styles_registered();

    // ONLY list final dep - WordPress resolves chain
    // vx:social-feed.css → vx:forms.css → vx:commons.css → vx:fse-commons.css
    $editor_style_deps = ['vx:social-feed.css'];
}

wp_register_style(
    $editor_style_handle,
    $editor_style_url,
    $editor_style_deps,  // Dependencies here
    $editor_style_version
);
```

**When to use:**
- ✅ Parent theme styles (commons, forms, social-feed, etc.)
- ✅ Block-specific styles that should only load when block is used
- ✅ On-demand loading for performance

**Benefits:**
- Styles only load when block is actually inserted
- WordPress handles dependency chain resolution
- No duplicate loading (avoids conflicts with `add_editor_style()`)
- Proper child theme inheritance pattern

**Transitive Dependencies Pattern:**

Instead of listing all dependencies directly:
```php
// ❌ Don't list all deps - order not guaranteed
$editor_style_deps = [
    'vx:commons.css',
    'vx:forms.css',
    'vx:social-feed.css'
];
```

List only the final dependency and let WordPress resolve the chain:
```php
// ✅ Only list final dep - WordPress resolves: fse-commons → commons → forms → social-feed
$editor_style_deps = ['vx:social-feed.css'];
```

**Why this works better:**
- WordPress resolves transitive dependencies automatically
- Guarantees load order through dependency graph
- Simpler configuration
- More reliable than listing all deps directly

#### Method 3: Specificity Overrides - CSS Conflict Resolution

**Purpose:** Override parent theme CSS when conflicts occur

**Usage:**
```css
/* themes/voxel-fse/app/blocks/src/timeline-kit/editor.css */

/* Higher specificity (0,0,1,1) beats parent (0,0,1,0) */
body .vxf-link {
    display: grid;
    grid-template-columns: 1fr 70%;
    --ts-icon-size: 18px;
    --ts-icon-color: var(--faded-text);
    flex-wrap: nowrap;
    align-items: center;
    border: 1px solid var(--main-border);
    overflow: hidden;
    border-radius: var(--md-radius);
}

body .flexify {
    display: flex;
    flex-wrap: nowrap;
}
```

**When to use:**
- ✅ Block-specific CSS conflicts with parent theme
- ✅ Need to override parent CSS reliably
- ✅ Specificity provides guaranteed override regardless of load order

**Why this is most reliable:**
- Doesn't depend on fragile CSS load order
- Works regardless of how WordPress resolves dependencies
- Explicit and self-documenting
- Scoped to block (using `body` prefix)

**Pattern:**
- Prefix with `body` for higher specificity: `body .vxf-link` (0,0,1,1)
- Beats parent selectors like `.flexify` (0,0,1,0)
- Scoped to block's editor.css
- Use sparingly - only for actual conflicts

#### CSS Loading Decision Tree

```
Q: What kind of CSS needs to load in FSE editor?
│
├── Global child theme styles (CSS variables, base theme)
│   └── Use: add_editor_style('assets/css/voxel-fse-commons.css')
│       - Loads once for all templates
│       - Inlines in <style> tag
│
├── Block-specific parent theme styles (commons, forms, social-feed)
│   └── Use: editorStyle dependencies in block registration
│       - Loads only when block is inserted
│       - Use transitive deps (list only final dep)
│       - WordPress resolves dependency chain
│
└── CSS conflicts with parent theme
    └── Use: Specificity overrides in block's editor.css
        - body .vxf-link beats .flexify
        - Most reliable - doesn't depend on load order
        - Scoped to block
```

#### Common Mistakes to Avoid

**❌ Don't:** Load block-specific styles via `add_editor_style()`
```php
// WRONG - loads globally for all templates (wasteful)
add_editor_style([
    'assets/dist/commons.css',
    'assets/dist/forms.css',
    'assets/dist/social-feed.css',
]);
```

**✅ Do:** Use block editorStyle dependencies
```php
// CORRECT - loads only when timeline-kit block is used
$editor_style_deps = ['vx:social-feed.css'];  // Transitive deps
```

**❌ Don't:** Rely on dependency array order
```php
// WRONG - WordPress doesn't guarantee order for direct deps at same level
$editor_style_deps = ['vx:commons.css', 'vx:forms.css', 'vx:social-feed.css'];
```

**✅ Do:** Use transitive dependencies
```php
// CORRECT - WordPress resolves chain: fse-commons → commons → forms → social-feed
$editor_style_deps = ['vx:social-feed.css'];
```

**❌ Don't:** Depend on CSS cascade order for critical overrides
```css
/* WRONG - fragile, depends on load order */
.vxf-link {
    display: grid;
}
```

**✅ Do:** Use specificity for reliable overrides
```css
/* CORRECT - higher specificity wins regardless of order */
body .vxf-link {
    display: grid;
}
```

#### Reference Implementation

**Block_Loader.php - Global child theme styles:**
```php
// Line 858-863
public static function add_editor_styles_for_fse() {
    // Only load child theme's global CSS variables
    // Parent theme styles are loaded via block dependencies when blocks are used
    add_editor_style('assets/css/voxel-fse-commons.css');
}
```

**Block_Loader.php - Timeline Kit block dependencies:**
```php
// Line 2338-2346
} elseif ($block_name === 'timeline-kit') {
    self::ensure_voxel_styles_registered();
    // ONLY list social-feed.css - it has transitive deps: forms → commons → fse-commons
    // WordPress resolves: fse-commons → commons → forms → social-feed → editor.css
    // This ensures social-feed.css loads LAST so .vxf-link overrides .flexify
    $editor_style_deps = [
        'vx:social-feed.css'  // Transitive: pulls in forms → commons → fse-commons
    ];
}
```

**timeline-kit/editor.css - Specificity overrides:**
```css
/* Fix commons.css overrides */
body .vxf-link {
    grid-template-columns: 1fr 70%;
    display: grid;
    /* ... more overrides ... */
}
```

#### Key Takeaways

1. **Global vs Block-Specific:** `add_editor_style()` for global child theme only, `editorStyle` deps for block-specific
2. **On-Demand Loading:** Block dependencies only load when block is inserted (performance optimization)
3. **Transitive Dependencies:** List only final dep, let WordPress resolve the chain
4. **Specificity > Cascade:** For critical overrides, use higher specificity instead of relying on load order
5. **Child Theme Pattern:** This is about inheritance, not recreation - use parent styles via dependencies

**Related Documentation:**
- [Timeline Kit Lessons Learned](timeline-kit-lessons-learned.md) - CSS scoping patterns
- `.mcp-memory/memory.json` - "FSE Child Theme CSS Loading Pattern" entity

---

## 8. Build System Configuration

### Dual Build Strategy

Plan C+ blocks require TWO builds:

1. **Editor Build (ES Modules)** - For Gutenberg editor
2. **Frontend Build (IIFE)** - For page frontend

### Editor Build Configuration

Already configured in `vite.blocks.config.js`:

```javascript
// vite.blocks.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        format: 'es', // ES modules for editor
      },
      external: [
        '@wordpress/blocks',
        '@wordpress/block-editor',
        '@wordpress/components',
        '@wordpress/element',
        '@wordpress/i18n',
        '@wordpress/data',
        '@wordpress/api-fetch',
        'react',
        'react-dom'
      ],
    },
  },
});
```

### Frontend Build Configuration

Create per-block frontend config:

```javascript
// vite.{block-name}-frontend.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false, // CRITICAL: Preserve editor build!
    outDir: resolve(__dirname, './app/blocks/src/{block-name}'),
    lib: {
      entry: resolve(__dirname, './app/blocks/src/{block-name}/frontend.tsx'),
      name: 'VoxelFSE{BlockName}',
      formats: ['iife'], // IIFE for WordPress enqueue
      fileName: () => 'frontend.js',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@wordpress/element',
        '@wordpress/api-fetch'
      ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/element': 'wp.element',
          '@wordpress/api-fetch': 'wp.apiFetch',
        },
      },
    },
  },
});
```

### Why IIFE for Frontend?

WordPress uses `wp_enqueue_script()` which expects:
- Global variables (not ES modules)
- Immediate execution
- Dependencies passed as globals

IIFE (Immediately Invoked Function Expression) output:
```javascript
(function(React, ReactDOM, wpElement) {
  // Your frontend code here
  // React, ReactDOM, wpElement are passed as parameters
})(window.React, window.ReactDOM, window.wp.element);
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite --config vite.blocks.config.js",
    "build": "npm run build:blocks && npm run build:frontends",
    "build:blocks": "vite build --config vite.blocks.config.js",
    "build:frontends": "npm run build:frontend:search-form && npm run build:frontend:create-post",
    "build:frontend:search-form": "vite build --config vite.search-form-frontend.config.js",
    "build:frontend:create-post": "vite build --config vite.create-post-frontend.config.js"
  }
}
```

---

## 9. WordPress Import Map Limitations

### Safe Imports (Always Available)

```typescript
// WordPress packages - via browser import maps
import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

// Standard components (subset available)
import {
  PanelBody,
  TextControl,
  TextareaControl,
  SelectControl,
  ToggleControl,
  RangeControl,
  ColorPalette,
  Button,
  Spinner,
  Placeholder,
  Notice,
} from '@wordpress/components';

// React hooks - MUST import from 'react' directly
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
```

### Problematic Imports (AVOID)

```typescript
// WRONG - Not available in import maps
import { RadioControl } from '@wordpress/components'; // Often missing
import { TabPanel } from '@wordpress/components'; // Not exported in ES modules
import { __experimentalBoxControl } from '@wordpress/components'; // Experimental
import { useMemo } from '@wordpress/element'; // Not re-exported

// WRONG - Will cause runtime errors
import { createPortal } from '@wordpress/element'; // Use react-dom instead
```

### Correct Alternatives

```typescript
// Instead of RadioControl
<SelectControl
  label="Choose option"
  value={selected}
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]}
  onChange={setSelected}
/>

// Instead of TabPanel - use custom StyleTabPanel
import StyleTabPanel from '../shared/controls/StyleTabPanel';

<StyleTabPanel
  tabs={[
    { name: 'normal', title: 'Normal' },
    { name: 'hover', title: 'Hover' },
  ]}
>
  {(tab) => (
    <div>{tab.name === 'normal' ? <NormalControls /> : <HoverControls />}</div>
  )}
</StyleTabPanel>

// Instead of __experimentalBoxControl - use custom BoxControl
import BoxControl from '../shared/controls/BoxControl';

<BoxControl
  label="Padding"
  values={{ top: '10px', right: '10px', bottom: '10px', left: '10px' }}
  onChange={(values) => setAttributes({ padding: values })}
/>

// Instead of @wordpress/element hooks
import { useMemo, useCallback } from 'react';

// Instead of @wordpress/element createPortal
import { createPortal } from 'react-dom';
```

**CRITICAL: React Import Pattern for Frontend**

⚠️ **NEVER use `window.wp.element` in frontend files** - it only exists in the editor!

```typescript
// ❌ WRONG - causes "React is not defined" errors on frontend
const { createRoot } = window.wp.element;
const { createPortal } = window.wp.element;

// ✅ CORRECT - works on both editor and frontend
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { useState, useEffect, useCallback } from 'react';
```

**Why this matters:**
- **Editor context**: WordPress provides `window.wp.element` global with React APIs
- **Frontend context**: `window.wp.element` doesn't exist, only `window.React` and `window.ReactDOM`
- **Vite IIFE builds**: Externalize `react`, `react-dom`, `react-dom/client` and map to globals
- **Import maps**: Only available in editor, not on frontend pages

**Files affected:**
- `frontend.tsx` - MUST use `import { createRoot } from 'react-dom/client'`
- Shared components used on frontend - MUST use `import { createPortal } from 'react-dom'`
- `edit.tsx` - CAN use `@wordpress/element` (editor-only)

**Evidence:** Advanced List, Create Post, and Stripe Account blocks had this issue (2025-12-14)

### Custom Control Implementation References

**StyleTabPanel** (`app/blocks/src/shared/controls/StyleTabPanel.tsx`):
- Replaces WordPress `TabPanel` which isn't available in ES module format
- Uses `useState`, `Button`, and `ButtonGroup` from available components
- Interface: `{ tabs: Tab[], children: (tab: Tab) => ReactNode, initialTabName?: string }`

**BoxControl** (`app/blocks/src/shared/controls/BoxControl.tsx`):
- Replaces WordPress `__experimentalBoxControl` which isn't exported
- 4-sided input control for margin/padding values
- Interface: `{ label: string, values: BoxValues, onChange: (values: BoxValues) => void }`

### TypeScript Strict Mode Requirements

**IMPORTANT:** All blocks must be compatible with TypeScript strict mode (`strict: true` in tsconfig.json).

#### Never Use `any`

```typescript
// WRONG - bypasses type safety
const [config, setConfig] = useState<any>(null);
function processData(data: any): any { ... }

// CORRECT - use proper types
interface MyConfig {
  items: ConfigItem[];
  settings: ConfigSettings;
}
const [config, setConfig] = useState<MyConfig | null>(null);
function processData(data: MyConfig): ProcessedData { ... }
```

#### Use Generics for Reusable Hooks

```typescript
// CORRECT - generic hook allows type-safe usage
function useBlockConfig<T>(configKey: string): UseBlockConfigResult<T> {
  const [config, setConfig] = useState<T | null>(null);
  // ...
  return { config, isLoading, error };
}

// Usage with type inference
const { config } = useBlockConfig<MyBlockConfig>(key);
// config is typed as MyBlockConfig | null
```

#### Handle Unknown Types Safely

```typescript
// When receiving data from external sources (API, localStorage, etc.)
// WRONG
const data = JSON.parse(localStorage.getItem('data')) as MyType;

// CORRECT - validate at runtime
function isMyType(data: unknown): data is MyType {
  return (
    typeof data === 'object' &&
    data !== null &&
    'requiredField' in data
  );
}

const rawData = JSON.parse(localStorage.getItem('data') ?? '{}');
if (isMyType(rawData)) {
  // Now TypeScript knows rawData is MyType
}
```

#### Define All Interface Properties

```typescript
// WRONG - missing properties will cause errors in strict mode
interface BlockAttributes {
  title: string;
  // icon could be undefined but not typed as optional
}

// CORRECT - explicitly mark optional properties
interface BlockAttributes {
  title: string;
  subtitle?: string;  // Optional - may be undefined
  icon: IconValue | null;  // Required but nullable
}
```

#### Real-World Example: Select2Control Type Safety

The `Select2Control` implementation demonstrates proper TypeScript strict mode practices:

```typescript
// ✅ GOOD - All types explicit, no any
export interface Select2Option {
  id: string;
  title: string;
  type?: string;  // Optional property
}

export interface Select2Group {
  label: string;
  type: string;
  items: Select2Option[];
}

export interface Select2ControlProps {
  label: string;                    // Required
  value: string;                    // Required
  onChange: (value: string) => void;  // Required function
  placeholder?: string;              // Optional
  groups?: Select2Group[];           // Optional array
  onFetch?: () => Promise<Select2Group[]>;  // Optional async function
  onFetchSingle?: (id: string) => Promise<Select2Option | null>;  // Optional, returns nullable
  enableDynamicTags?: boolean;       // Optional boolean
  context?: string;                   // Optional string
}

// ❌ BAD - Using any bypasses type safety
interface BadProps {
  label: string;
  value: any;  // Don't do this!
  onChange: (value: any) => void;  // Don't do this!
  config?: any;  // Don't do this!
}
```

**Key Lessons:**
- **Optional vs Nullable:** Use `?` for properties that may be undefined, use `| null` for properties that are always present but may be null
- **Function Types:** Always type function parameters and return values explicitly
- **Generic Types:** Use generics for reusable hooks/components to maintain type safety
- **Runtime Validation:** Use type guards when parsing external data (JSON, API responses)

---

## 10. Popup/Modal Implementation

### When to Use FieldPopup vs Select2Control

**Use `FieldPopup` for:**
- Date pickers
- Multi-select dropdowns (use `TagMultiSelect` instead)
- Taxonomy selectors
- Relation field pickers
- Complex forms that need modal overlay
- Any popup that needs React Portal rendering

**Use `Select2Control` for:**
- Single-select dropdowns with search
- Grouped options with visual separators
- Lazy-loaded data (fetches on dropdown open)
- Simple dropdowns that don't need modal behavior
- Dropdowns that can use CSS `position: fixed` (no Portal needed)

**Key Difference:**
- `FieldPopup` uses React Portal (renders to `document.body`) - needed for modals
- `Select2Control` uses CSS positioning (renders inline) - simpler, sufficient for dropdowns

### FieldPopup Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         document.body                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Your Component                                          │ │
│  │                                                         │ │
│  │  <button ref={triggerRef} onClick={openPopup}>         │ │
│  │    Open Popup                                           │ │
│  │  </button>                                              │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ FieldPopup (via React Portal)                          │ │
│  │                                                         │ │
│  │ <div class="elementor vx-popup">                       │ │
│  │   <div class="ts-popup-root elementor-element">        │ │
│  │     <div class="ts-form" style="position: absolute">   │ │
│  │       <div class="ts-field-popup-container">           │ │
│  │         <div class="ts-field-popup triggers-blur">     │ │
│  │           <!-- Popup content -->                        │ │
│  │         </div>                                          │ │
│  │       </div>                                            │ │
│  │     </div>                                              │ │
│  │   </div>                                                │ │
│  │ </div>                                                  │ │
│  │                                                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### FieldPopup Component Interface

```typescript
interface FieldPopupProps {
  isOpen: boolean;
  target: React.RefObject<HTMLElement>;  // Trigger element for positioning
  title?: string;
  icon?: string;                         // Inline SVG
  saveLabel?: string;
  clearLabel?: string;
  showClear?: boolean;
  showSave?: boolean;
  onSave: () => void;
  onClear?: () => void;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;                    // Additional classes (e.g., 'lg-width')
}
```

### Usage Example

```typescript
import { useState, useRef } from 'react';
import { FieldPopup } from '@shared/popup-kit/FieldPopup';

function DatePickerField() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="ts-form-group">
      {/* Trigger Element */}
      <div
        ref={triggerRef}
        className="ts-filter ts-popup-target"
        onClick={() => setIsOpen(true)}
      >
        <span>{selectedDate || 'Select date...'}</span>
      </div>

      {/* Popup (rendered via portal to document.body) */}
      <FieldPopup
        isOpen={isOpen}
        target={triggerRef}
        title="Select Date"
        showSave={true}
        showClear={true}
        onSave={() => setIsOpen(false)}
        onClear={() => {
          setSelectedDate(null);
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
        className="md-width md-height"
      >
        <div className="ts-popup-content-wrapper min-scroll">
          {/* Date picker content */}
        </div>
      </FieldPopup>
    </div>
  );
}
```

### Positioning Algorithm

The popup positioning follows Voxel's original logic:

```typescript
function calculatePosition(
  triggerElement: HTMLElement,
  popupElement: HTMLElement
) {
  // 1. Get trigger position (document-relative)
  const triggerRect = triggerElement.getBoundingClientRect();
  const triggerOffset = getDocumentOffset(triggerElement);

  // 2. Get popup dimensions
  const popupRect = popupElement.getBoundingClientRect();

  // 3. Calculate horizontal position
  const viewportCenterX = document.body.clientWidth / 2;
  const triggerCenterX = triggerOffset.left + triggerRect.width / 2;

  let left: number;
  if (triggerCenterX > viewportCenterX) {
    // Trigger is right of center - align popup to right edge
    left = triggerOffset.left - popupRect.width + triggerRect.width;
  } else {
    // Trigger is left of center - align popup to left edge
    left = triggerOffset.left;
  }

  // 4. Calculate vertical position
  let top = triggerOffset.top + triggerRect.height; // Default: below

  const viewportHeight = window.innerHeight;
  const isBottomTruncated = triggerRect.bottom + popupRect.height > viewportHeight;
  const isRoomAbove = triggerRect.top - popupRect.height >= 0;

  if (isBottomTruncated && isRoomAbove) {
    // Position above if doesn't fit below
    top = triggerOffset.top - popupRect.height;
  }

  return { top, left, width: popupRect.width };
}
```

---

## 11. REST API Integration

### When to Create REST Endpoints

Create REST endpoints when your block needs:
- Post type definitions
- Field configurations
- Dynamic data from Voxel
- Data that changes based on configuration

### REST Endpoint Pattern

```php
<?php
// themes/voxel-fse/app/controllers/{block}-api-controller.php

namespace VoxelFSE\Controllers;

class Block_API_Controller extends FSE_Base_Controller {
    protected function hooks() {
        $this->on('rest_api_init', '@register_endpoints');
    }

    protected function register_endpoints() {
        // Public endpoint (no authentication)
        register_rest_route('voxel-fse/v1', '/block-config', [
            'methods' => 'GET',
            'callback' => [$this, 'get_block_config'],
            'permission_callback' => '__return_true', // Public access
            'args' => [
                'config_key' => [
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                ],
            ],
        ]);
    }

    public function get_block_config($request) {
        $config_key = $request->get_param('config_key');

        // Fetch data from Voxel
        // Example: Get post type fields
        $post_type = \Voxel\Post_Type::get($config_key);
        if (!$post_type) {
            return new \WP_Error('not_found', 'Post type not found', ['status' => 404]);
        }

        $fields = [];
        foreach ($post_type->get_fields() as $field) {
            $fields[$field->get_key()] = $field->get_frontend_config();
        }

        return rest_ensure_response([
            'post_type' => $config_key,
            'fields' => $fields,
        ]);
    }
}
```

### Voxel AJAX System (NOT admin-ajax.php)

Voxel uses a custom AJAX handler, NOT WordPress's `admin-ajax.php`:

```typescript
// CORRECT - Voxel AJAX
const siteUrl = window.voxel_config?.home_url || window.location.origin;
const params = new URLSearchParams({
  action: 'create_post.submit',  // NO 'voxel_ajax_' prefix in param!
  field_key: 'title',
});
const url = `${siteUrl}/?vx=1&${params.toString()}`;

const response = await fetch(url, {
  method: 'POST',
  body: formData,
});

// WRONG - WordPress admin-ajax.php
const url = '/wp-admin/admin-ajax.php'; // Don't use this for Voxel!
```

### Public vs Authenticated Endpoints

```php
// Public endpoint (no nonce required)
register_rest_route('voxel-fse/v1', '/public-data', [
    'permission_callback' => '__return_true',
]);

// Authenticated endpoint (requires nonce)
register_rest_route('voxel-fse/v1', '/private-data', [
    'permission_callback' => function() {
        return current_user_can('edit_posts');
    },
]);
```

**IMPORTANT:** For public endpoints, do NOT send nonce in frontend fetch:

```typescript
// CORRECT - Public endpoint
const response = await fetch(endpoint); // No headers

// WRONG - Causes "Cookie check failed" error
const response = await fetch(endpoint, {
  headers: {
    'X-WP-Nonce': wpApiSettings.nonce, // Don't do this for public endpoints!
  },
});
```

---

## 12. Decision Trees

### Block Type Selection

```
START: Converting Voxel Widget to Gutenberg Block
│
├── Q: Does block need dynamic data from Voxel APIs?
│   │
│   ├── YES: Plan C+ with REST API
│   │   │
│   │   ├── 1. Create REST endpoint in PHP controller
│   │   ├── 2. Create useBlockConfig hook for data fetching
│   │   ├── 3. Fetch in both edit.tsx and frontend.tsx
│   │   └── 4. Share React component between editor and frontend
│   │
│   └── NO: Plan C+ with static vxconfig only
│       │
│       ├── 1. All config stored in vxconfig JSON
│       ├── 2. No REST API fetch needed
│       └── 3. Example: popup-kit (styling block)
│
└── NOTE: ALL blocks use Plan C+ pattern
    ├── save.tsx → vxconfig JSON + placeholder
    ├── frontend.tsx → parse vxconfig + mount React
    └── NO render.php, NO ServerSideRender
```

### Rendering Strategy Decision

```
Q: What type of widget is this?
│
├── Display Widget (shows data)
│   └── Use Plan C+ with REST API for data
│
├── Form Widget (collects input)
│   ├── Use Plan C+ with REST API for field config
│   └── Use Voxel AJAX for form submission
│
├── Interactive Widget (UI state only)
│   └── Use Plan C+ with static vxconfig
│
└── Styling Widget (modifies appearance)
    └── Use Plan C+ with static vxconfig
        (e.g., popup-kit)
```

### Control Implementation Decision

```
Q: What Elementor control type?
│
├── Basic Control (TEXT, SELECT, SWITCHER)
│   └── Use standard @wordpress/components
│
├── Complex Control (SELECT2, ICONS, TYPOGRAPHY)
│   └── Use shared controls from src/shared/controls/
│
├── Responsive Control (any with _tablet, _mobile variants)
│   └── Wrap with ResponsiveControl component
│
└── Dynamic Tag Control (VoxelScript support)
    └── Use DynamicTagTextControl
```

### Popup Decision

```
Q: Does widget have popups/modals?
│
├── YES: Use FieldPopup component
│   │
│   ├── 1. Import FieldPopup from shared/popup-kit
│   ├── 2. Create trigger ref with useRef
│   ├── 3. Manage isOpen state
│   └── 4. Popup renders via React Portal to document.body
│
└── NO: Standard inline rendering
```

---

## 13. Validation Checklist

### Pre-Deployment Verification

#### Headless Architecture Compliance

- [ ] **NO render.php file exists** in block directory
- [ ] **NO "render" property** in block.json
- [ ] **NO ServerSideRender** component imported or used
- [ ] save.tsx outputs vxconfig JSON in `<script class="vxconfig">` tag
- [ ] save.tsx outputs placeholder HTML for hydration
- [ ] frontend.tsx parses vxconfig from script tag
- [ ] frontend.tsx mounts React using createRoot
- [ ] Shared React component used by both edit.tsx and frontend.tsx
- [ ] **Shared component re-renders vxconfig** to keep it visible in DevTools
- [ ] REST API endpoint created (if dynamic data needed)
- [ ] REST API endpoint uses `permission_callback`

#### Child Theme Styling Compliance

- [ ] **NO style.css** duplicating Voxel CSS classes
- [ ] **NO custom CSS** for styles Voxel parent already provides
- [ ] **NO "style" property** in block.json (unless responsive edge case)
- [ ] HTML structure matches Voxel widget exactly (1:1)
- [ ] All CSS classes use Voxel's names (ts-*, vx-*, nvx-*)
- [ ] SVG icons copied inline (not as references)
- [ ] editor.css does NOT import style.css
- [ ] editor.css uses `.voxel-fse-*` prefixed classes

#### Block Configuration

- [ ] block.json apiVersion is 3
- [ ] block.json name follows `voxel-fse/{block-name}` pattern
- [ ] block.json title ends with `(VX)`
- [ ] block.json category is `voxel-fse` (displays as "VOXEL FSE" in editor)
- [ ] block.json does NOT have `"icon"` property (set in index.tsx)
- [ ] index.tsx imports VoxelGridIcon from `'../shared/VoxelGridIcon'`
- [ ] index.tsx sets `icon: VoxelGridIcon` in registerBlockType()
- [ ] All attributes defined with types and defaults
- [ ] editorScript points to `file:./index.js`
- [ ] editorStyle points to `file:./editor.css`
- [ ] viewScript points to `file:./frontend.js`

#### Inspector Controls

- [ ] All Elementor controls mapped to Gutenberg equivalents
- [ ] Responsive controls use `_tablet` and `_mobile` suffixes
- [ ] Controls organized into logical PanelBody sections
- [ ] Shared controls imported from `src/shared/controls/`
- [ ] No unavailable components imported (RadioControl, experimental)

#### TypeScript Compliance

- [ ] **No `any` types** used anywhere in codebase
- [ ] All interfaces defined in `types/index.ts` or `types.ts`
- [ ] Generic hooks used for type-safe API responses
- [ ] Props interfaces defined for all components
- [ ] Optional properties marked with `?` suffix
- [ ] Nullable values typed as `Type | null`
- [ ] React hooks imported from `'react'` (not `@wordpress/element`)
- [ ] Type guards used for runtime validation of external data
- [ ] Build passes with `strict: true` in tsconfig.json

#### Build System

- [ ] Editor build outputs ES modules
- [ ] Frontend build outputs IIFE format
- [ ] Frontend build has `emptyOutDir: false`
- [ ] External packages configured in Rollup
- [ ] Globals mapping correct for IIFE output
- [ ] Package.json scripts updated

#### Functionality Testing

- [ ] Block appears in Gutenberg inserter
- [ ] Block renders preview in editor
- [ ] Inspector controls update attributes
- [ ] Block saves without errors
- [ ] Frontend displays correct HTML structure
- [ ] Frontend React hydration works
- [ ] REST API returns expected data
- [ ] Popups position correctly
- [ ] Form submission works (if applicable)
- [ ] No console errors in editor
- [ ] No console errors on frontend

---

## 14. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **React hooks undefined** | Importing from `@wordpress/element` | Import from `'react'` directly |
| **Module not found in frontend** | ES modules in IIFE build | Configure external + globals in Vite |
| **Popup positioning wrong** | Popup nested inside component | Use FieldPopup with React Portal |
| **Styles missing on frontend** | No Voxel CSS dependencies | Add dependencies in Block_Loader.php |
| **"Cookie check failed" error** | Nonce sent to public endpoint | Remove nonce from public API calls |
| **Maps scripts enqueued but not loading** | Voxel soft-loading pattern (data-src) | Add script_loader_tag filter at priority 20 to restore src |
| **Editor styles broken** | style.css conflicts with Gutenberg | Remove style.css, use Voxel's classes |
| **Duplicate CSS bloat** | Created custom styles for Voxel classes | Use 1:1 HTML structure, inherit parent |
| **editor.css loads frontend styles** | `@import './style.css'` in editor.css | Never import style.css into editor.css |
| **Block not appearing** | block.json not found | Check file path and run build |
| **Attributes not saving** | Attribute not in block.json | Add attribute definition |
| **Frontend not hydrating** | Missing viewScript | Add `"viewScript": "file:./frontend.js"` |
| **IIFE not working** | Wrong globals mapping | Match WordPress global names exactly |
| **TypeScript errors** | Missing type definitions | Create interfaces in types/index.ts |
| **TypeScript strict mode errors** | Using `any` type | Define proper interfaces, use generics |
| **Implicit any errors** | Missing function parameter types | Add explicit types to all parameters |
| **Object is possibly undefined** | Not checking for null | Use optional chaining (`?.`) or type guards |
| **vxconfig not visible in DevTools** | Shared component doesn't re-render it | Add vxconfig script tag to component return |
| **AJAX URLs wrong on multisite** | Hardcoded `/?vx=1` resolves to domain root | Use `getSiteBaseUrl()` utility for all Voxel AJAX |
| **Edit links wrong on multisite** | Using `window.location.origin` | Use `getSitePath()` to get correct site path |
| **Errors not showing in Gutenberg** | `Voxel.alert()` only available on frontend | Use inline error notification with `ts-notice` pattern |
| **Interactive buttons work in editor** | No context awareness | Check `context === 'editor'` to disable actions |
| **Addons config `.map()` fails** | Voxel returns OBJECT not array | Use `normalizeAddonsConfig()` utility |

### vxconfig Lifecycle Explanation

**Question:** "Why can I see vxconfig with Ctrl+U (View Source) but not in DevTools Elements tab?"

**Answer:** This is the expected Plan C+ behavior:

1. **Server sends HTML** (visible in Ctrl+U - raw source):
   ```html
   <div class="voxel-fse-block-frontend">
     <script type="text/json" class="vxconfig">{"key":"value"}</script>
     <div class="placeholder">Loading...</div>
   </div>
   ```

2. **frontend.tsx parses vxconfig** (reads configuration):
   ```typescript
   const vxConfig = parseVxConfig(container); // Reads before mount
   ```

3. **createRoot clears container** (removes original HTML):
   ```typescript
   const root = createRoot(container); // Clears innerHTML
   ```

4. **Shared component re-renders vxconfig** (keeps it visible):
   ```typescript
   return (
     <div className="ts-form">
       <script type="text/json" className="vxconfig" ... />
       {/* Rest of component */}
     </div>
   );
   ```

**Result:** vxconfig is ALWAYS visible in DevTools if your shared component re-renders it (matching Voxel pattern).

### Debugging Tips

```typescript
// Debug vxconfig parsing
console.log('[block-name] vxconfig:', parseVxConfig(container));

// Debug REST API response
console.log('[block-name] API response:', await response.json());

// Debug React mount
console.log('[block-name] Mounting to:', container);

// Check if already mounted
if (container.hasAttribute('data-react-mounted')) {
  console.log('[block-name] Already mounted, skipping');
  return;
}
```

### Voxel Soft-Loading Pattern

**What is soft-loading?**

Voxel uses a "soft-loading" pattern for certain scripts (maps, heavy libraries) to improve page load performance. Instead of loading scripts immediately, Voxel:

1. Registers and enqueues scripts normally
2. Replaces `src=` with `data-src=` in the script tag
3. Expects JavaScript to manually convert `data-src` back to `src` when needed

**Evidence:**

```php
// themes/voxel/app/controllers/assets-controller.php:49-54
protected $soft_loaded_scripts = [
    'google-maps' => true,
    'vx:google-maps.js' => true,
    'mapbox-gl' => true,
    'vx:mapbox.js' => true,
];

// Line 367-372
if ( isset( $this->soft_loaded_scripts[ $handle ] ) ) {
    $tag = str_replace( ' src=', ' data-src=', $tag );
}
```

**When this causes problems:**

- **Admin contexts** (metabox, backend forms) where scripts are needed immediately
- No JavaScript trigger exists to convert `data-src` back to `src`
- Scripts appear enqueued but never actually load in browser

**How to bypass soft-loading:**

Add a `script_loader_tag` filter at **priority 20** (runs AFTER Voxel's filter at priority 10):

```php
// Example: admin-metabox-iframe.php:17-29
add_filter('script_loader_tag', function($tag, $handle) {
    // Only bypass soft-loading for maps-related scripts
    $maps_scripts = ['google-maps', 'vx:google-maps.js', 'mapbox-gl', 'vx:mapbox.js'];
    if (in_array($handle, $maps_scripts, true)) {
        // Convert data-src back to src to force immediate loading
        $tag = str_replace(' data-src=', ' src=', $tag);
    }
    return $tag;
}, 20, 2); // Priority 20 = run AFTER Voxel's filter (priority 10)
```

**Debugging soft-loaded scripts:**

```bash
# Check page source - look for data-src instead of src
<script data-src="https://maps.googleapis.com/..." id="google-maps-js"></script>  # Soft-loaded
<script src="https://maps.googleapis.com/..." id="google-maps-js"></script>        # Normal loading
```

**Reference:** See [google-maps-admin-metabox-fix.md](google-maps-admin-metabox-fix.md) for complete implementation example.

### Multisite Compatibility Pattern

**Problem:** On WordPress multisite subdirectory installations, relative URLs like `/?vx=1` resolve to the domain root instead of the subsite path.

```
Subsite: http://example.com/vx-stays/
Hardcoded: /?vx=1&action=create_post
Resolves to: http://example.com/?vx=1&action=create_post  ❌ WRONG (main site)
Should be: http://example.com/vx-stays/?vx=1&action=create_post  ✅ CORRECT
```

**Solution:** Use the `getSiteBaseUrl()` and `getSitePath()` utilities from `shared/utils/siteUrl.ts`.

**Utility Implementation:**

```typescript
// themes/voxel-fse/app/blocks/src/shared/utils/siteUrl.ts

/**
 * Get the site path for multisite subdirectory support
 * Returns path like "/vx-stays" or "" for root installations
 */
export function getSitePath(): string {
    // Try WordPress REST API settings (most reliable)
    if (window.wpApiSettings?.root) {
        const root = window.wpApiSettings.root;
        const url = new URL(root);
        return url.pathname.replace(/\/wp-json\/?$/, '');
    }

    // Fallback: Parse from REST API link in page head
    const apiLink = document.querySelector('link[rel="https://api.w.org/"]');
    if (apiLink) {
        const href = apiLink.getAttribute('href');
        if (href) {
            const url = new URL(href);
            return url.pathname.replace(/\/wp-json\/?$/, '');
        }
    }

    return ''; // Root installation
}

export function getSiteBaseUrl(): string {
    const sitePath = getSitePath();
    return window.location.origin + sitePath + '/?vx=1';
}
```

**Usage for Voxel AJAX:**

```typescript
import { getSiteBaseUrl, getSitePath } from '@shared/utils/siteUrl';

// For AJAX requests
const voxelAjaxUrl = getSiteBaseUrl() + '&action=create_post&post_type=' + postTypeKey;

// For edit links
const sitePath = getSitePath();
const editLink = `${window.location.origin}${sitePath}/create-${postTypeKey}/?post_id=${postId}`;

// For redirects
let redirectUrl = attributes.redirectAfterSubmit;
if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    const sitePath = getSitePath();
    redirectUrl = `${window.location.origin}${sitePath}${redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl}`;
}
```

**Smart AJAX URL Detection (with fallbacks):**

```typescript
function getVoxelAjaxUrl(): string {
    // 1. Try our block's localized data (wp_localize_script)
    if (window.voxelFseCreatePost?.ajaxUrl) {
        return window.voxelFseCreatePost.ajaxUrl;
    }

    // 2. Try Voxel's native config (available on frontend)
    if (window.Voxel_Config?.ajax_url) {
        return window.Voxel_Config.ajax_url;
    }

    // 3. Try extracting from WordPress REST API settings (Gutenberg editor)
    if (window.wpApiSettings?.root) {
        const siteUrl = window.wpApiSettings.root.replace(/\/wp-json\/?$/, '');
        return `${siteUrl}/?vx=1`;
    }

    // 4. Fallback to origin (may not work for subdirectory multisite)
    return `${window.location.origin}/?vx=1`;
}
```

**Reference:** See [multisite-compatibility-fixes.md](multisite-compatibility-fixes.md) for comprehensive documentation.

### Context-Aware Error Notification Pattern

**Problem:** `Voxel.alert()` is only available on the frontend where Voxel's JavaScript is loaded. In the Gutenberg editor, form submission errors aren't displayed to users.

**Solution:** Use an inline error notification that works in ALL contexts (editor and frontend).

**Pattern:**

```tsx
// In your shared component (e.g., CreatePostForm.tsx)

interface SubmissionState {
    processing: boolean;
    done: boolean;
    success: boolean;
    message: string;
    errors: string[];  // Array of error messages
}

// Inline error notification - matches Voxel's ts-notice pattern
{!submission.success && submission.errors && submission.errors.length > 0 && (
    <div
        className="ts-notice ts-notice-error flexify"
        style={{
            position: 'relative',
            transform: 'none',
            animation: 'none',
            marginBottom: '15px',
        }}
    >
        {/* Error icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
        </svg>
        <p dangerouslySetInnerHTML={{ __html: submission.errors.join('<br>') }} />
        <a href="#" onClick={(e) => { e.preventDefault(); setSubmission({ ...submission, errors: [] }); }}>Close</a>
    </div>
)}
```

**Scroll to Error:**

```typescript
// After setting error state, scroll to top so user sees the notification
setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}, 100);

// Also show Voxel.alert if available (for frontend consistency)
if (window.Voxel?.alert) {
    window.Voxel.alert(errorMessage, 'error');
}
```

**Evidence:** Pattern matches Voxel's `ts-notice ts-notice-error` from `themes/voxel/templates/components/alert.php`.

### Context-Based UI Pattern

**Problem:** Some UI elements (like "Back to Editing" buttons) shouldn't be interactive in the Gutenberg editor context.

**Solution:** Pass context to shared components and conditionally disable interactions.

**Pattern:**

```tsx
// Props interface
interface SharedComponentProps {
    context: 'editor' | 'frontend';
    // ... other props
}

// Context-aware button rendering
{submission.editLink && (
    <a
        href={context === 'editor' ? '#' : submission.editLink}
        className={`ts-btn ts-btn-1 ${context === 'editor' ? 'disabled' : ''}`}
        onClick={context === 'editor' ? (e) => e.preventDefault() : undefined}
        style={context === 'editor' ? { pointerEvents: 'none', opacity: 0.5 } : undefined}
    >
        Back to Editing
    </a>
)}
```

**When to Use:**

- Disable navigation links in editor (edit links, view links)
- Disable destructive actions in editor (delete, archive)
- Show preview-only states for interactive elements
- Prevent accidental redirects during block editing

### Voxel Addons Object Normalization Pattern

**Problem:** Voxel's backend sometimes returns addon/config data as an **OBJECT** (keyed by ID) instead of an array. Using `.map()` on an object fails silently.

**Evidence:**

```typescript
// What we expect:
addons: [{ key: 'extra_1', label: 'Extra 1' }, { key: 'extra_2', label: 'Extra 2' }]

// What Voxel sometimes returns:
addons: {
    extra_1: { key: 'extra_1', label: 'Extra 1' },
    extra_2: { key: 'extra_2', label: 'Extra 2' }
}
```

**Solution:** Always normalize before iterating.

```typescript
/**
 * Normalize addons config from Voxel - handles both array and object formats
 */
function normalizeAddonsConfig(addons: any): any[] {
    if (!addons) return [];
    if (Array.isArray(addons)) return addons;
    // Convert object to array, preserving the key
    return Object.entries(addons).map(([key, addon]: [string, any]) => ({
        ...addon,
        key: addon.key || key
    }));
}

// Usage
const normalizedAddons = normalizeAddonsConfig(config.addons);
normalizedAddons.map(addon => (
    <AddonRow key={addon.key} addon={addon} />
));
```

**When to Apply:**

- Any Voxel config that might be keyed by ID (addons, variations, custom prices)
- Before using `.map()`, `.filter()`, `.reduce()` on config data
- When TypeScript complains about object not being iterable

**Reference:** See [create-post-bug-fixes-and-multisite-summary.md](create-post/create-post-bug-fixes-and-multisite-summary.md) for implementation examples.

---

## 15. Complete Code Templates

### 15.1 block.json Template

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "voxel-fse/example-block",
  "version": "1.0.0",
  "title": "Example Block (VX)",
  "category": "voxel-fse",
  "description": "Converted from Voxel Example Widget",
  "keywords": ["voxel", "example"],
  "textdomain": "voxel-fse",
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "viewScript": "file:./frontend.js",
  "supports": {
    "html": false,
    "anchor": true,
    "className": true,
    "customClassName": true
  },
  "attributes": {
    "configKey": {
      "type": "string",
      "default": ""
    },
    "title": {
      "type": "string",
      "default": "Default Title"
    },
    "showIcon": {
      "type": "boolean",
      "default": true
    },
    "iconSize": {
      "type": "number",
      "default": 24
    },
    "iconSize_tablet": {
      "type": "number"
    },
    "iconSize_mobile": {
      "type": "number"
    },
    "buttonIcon": {
      "type": "object",
      "default": {
        "library": "",
        "value": ""
      }
    }
  }
}
```

### 15.2 index.tsx Template

```typescript
/**
 * Example Block - Editor Entry Point
 *
 * Registers the block with WordPress Gutenberg.
 * NO render.php - uses Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import save from './save';
import metadata from './block.json';
import VoxelGridIcon from '../shared/VoxelGridIcon';

// Register block type
registerBlockType(metadata.name, {
  ...metadata,
  icon: VoxelGridIcon,  // REQUIRED: Use shared VoxelGridIcon
  edit: Edit,
  save,
});
```

### 15.3 edit.tsx Template

```typescript
/**
 * Example Block - Editor Component
 *
 * Renders block preview and Inspector Controls in Gutenberg editor.
 * Uses shared component for editor/frontend parity.
 *
 * @package VoxelFSE
 */

import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
  PanelBody,
  TextControl,
  ToggleControl,
  SelectControl,
  Spinner,
  Placeholder,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useCallback } from 'react';

// Shared components and controls
import { useBlockConfig } from './hooks/useBlockConfig';
import ExampleBlockComponent from './shared/ExampleBlockComponent';
import { IconPickerControl } from '@shared/controls/IconPickerControl';
import { ResponsiveControl } from '@shared/controls/ResponsiveControl';

// Types
import type { BlockAttributes } from './types';

interface EditProps {
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
  clientId: string;
}

export default function Edit({ attributes, setAttributes, clientId }: EditProps) {
  const blockProps = useBlockProps({
    className: 'voxel-fse-example-block-editor',
  });

  // Fetch config from REST API
  const { config, isLoading, error } = useBlockConfig(attributes.configKey);

  // Handler for attribute updates
  const updateAttribute = useCallback(
    <K extends keyof BlockAttributes>(key: K, value: BlockAttributes[K]) => {
      setAttributes({ [key]: value } as Partial<BlockAttributes>);
    },
    [setAttributes]
  );

  return (
    <>
      {/* Inspector Controls (Sidebar) */}
      <InspectorControls>
        {/* Content Panel */}
        <PanelBody title={__('Content', 'voxel-fse')} initialOpen={true}>
          <SelectControl
            label={__('Config Key', 'voxel-fse')}
            value={attributes.configKey}
            options={[
              { label: __('Select...', 'voxel-fse'), value: '' },
              { label: 'Option 1', value: 'option1' },
              { label: 'Option 2', value: 'option2' },
            ]}
            onChange={(value) => updateAttribute('configKey', value)}
          />

          <TextControl
            label={__('Title', 'voxel-fse')}
            value={attributes.title}
            onChange={(value) => updateAttribute('title', value)}
          />

          <ToggleControl
            label={__('Show Icon', 'voxel-fse')}
            checked={attributes.showIcon}
            onChange={(value) => updateAttribute('showIcon', value)}
          />
        </PanelBody>

        {/* Style Panel */}
        <PanelBody title={__('Style', 'voxel-fse')} initialOpen={false}>
          <ResponsiveControl
            label={__('Icon Size', 'voxel-fse')}
            value={attributes.iconSize}
            valueTablet={attributes.iconSize_tablet}
            valueMobile={attributes.iconSize_mobile}
            onChange={(v) => updateAttribute('iconSize', v)}
            onChangeTablet={(v) => updateAttribute('iconSize_tablet', v)}
            onChangeMobile={(v) => updateAttribute('iconSize_mobile', v)}
          >
            {(device, value, onChange) => (
              <RangeControl
                value={value}
                onChange={onChange}
                min={12}
                max={64}
              />
            )}
          </ResponsiveControl>
        </PanelBody>

        {/* Icons Panel */}
        <PanelBody title={__('Icons', 'voxel-fse')} initialOpen={false}>
          <IconPickerControl
            label={__('Button Icon', 'voxel-fse')}
            value={attributes.buttonIcon}
            onChange={(value) => updateAttribute('buttonIcon', value)}
          />
        </PanelBody>
      </InspectorControls>

      {/* Block Preview */}
      <div {...blockProps}>
        {/* Loading State */}
        {isLoading && (
          <Placeholder label={__('Example Block (VX)', 'voxel-fse')}>
            <Spinner />
          </Placeholder>
        )}

        {/* Error State */}
        {error && (
          <Placeholder label={__('Example Block (VX)', 'voxel-fse')}>
            <p className="error">{error}</p>
          </Placeholder>
        )}

        {/* Empty State */}
        {!isLoading && !error && !attributes.configKey && (
          <Placeholder
            label={__('Example Block (VX)', 'voxel-fse')}
            instructions={__('Select a config key to display content.', 'voxel-fse')}
          />
        )}

        {/* Loaded State */}
        {!isLoading && !error && attributes.configKey && (
          <ExampleBlockComponent
            attributes={attributes}
            config={config}
            context="editor"
          />
        )}
      </div>
    </>
  );
}
```

### 15.4 save.tsx Template

```typescript
/**
 * Example Block - Save Function
 *
 * Outputs minimal static HTML with vxconfig JSON for frontend hydration.
 * NO server-side rendering - Plan C+ architecture.
 *
 * @package VoxelFSE
 */

import { useBlockProps } from '@wordpress/block-editor';
import type { BlockAttributes } from './types';

interface SaveProps {
  attributes: BlockAttributes;
}

export default function save({ attributes }: SaveProps) {
  const blockProps = useBlockProps.save({
    className: 'voxel-fse-example-block-frontend',
    'data-block-type': 'example-block',
  });

  // Build vxconfig object with ALL attributes needed by frontend
  const vxConfig = {
    configKey: attributes.configKey,
    title: attributes.title,
    showIcon: attributes.showIcon,
    // Group related attributes
    icons: {
      buttonIcon: attributes.buttonIcon,
    },
    // Include responsive values
    responsive: {
      iconSize: attributes.iconSize,
      iconSize_tablet: attributes.iconSize_tablet,
      iconSize_mobile: attributes.iconSize_mobile,
    },
  };

  return (
    <div {...blockProps}>
      {/* vxconfig JSON - parsed by frontend.tsx */}
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vxConfig),
        }}
      />

      {/* Placeholder - replaced by React on mount */}
      <div className="voxel-fse-block-placeholder">
        <span className="placeholder-icon">⚡</span>
        <span className="placeholder-text">Example Block (VX)</span>
      </div>
    </div>
  );
}
```

### 15.5 frontend.tsx Template

```typescript
/**
 * Example Block - Frontend Hydration
 *
 * Parses vxconfig, fetches REST API data, and mounts React component.
 * This is the viewScript loaded on frontend pages.
 *
 * @package VoxelFSE
 */

import { createRoot } from 'react-dom/client';
import ExampleBlockComponent from './shared/ExampleBlockComponent';
import type { VxConfig, BlockAttributes } from './types';

// ============================================================================
// CONFIGURATION PARSING
// ============================================================================

/**
 * Parse vxconfig JSON from script tag
 */
function parseVxConfig(container: HTMLElement): VxConfig | null {
  const script = container.querySelector<HTMLScriptElement>('script.vxconfig');
  if (!script?.textContent) {
    console.error('[example-block] No vxconfig found in container');
    return null;
  }

  try {
    return JSON.parse(script.textContent);
  } catch (e) {
    console.error('[example-block] Failed to parse vxconfig:', e);
    return null;
  }
}

/**
 * Build attributes from vxconfig
 */
function buildAttributes(vxConfig: VxConfig): BlockAttributes {
  return {
    configKey: vxConfig.configKey,
    title: vxConfig.title,
    showIcon: vxConfig.showIcon,
    // Spread grouped attributes
    ...vxConfig.icons,
    ...vxConfig.responsive,
  };
}

// ============================================================================
// REST API FETCHING
// ============================================================================

/**
 * Fetch block config from REST API
 */
async function fetchBlockConfig(configKey: string) {
  if (!configKey) return null;

  const restUrl = (window as any).wpApiSettings?.root || '/wp-json/';
  const endpoint = `${restUrl}voxel-fse/v1/example-config?key=${encodeURIComponent(configKey)}`;

  // NOTE: Public endpoint - do NOT send nonce (causes "Cookie check failed")
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// FRONTEND WRAPPER COMPONENT
// ============================================================================

interface FrontendWrapperProps {
  vxConfig: VxConfig;
}

function FrontendWrapper({ vxConfig }: FrontendWrapperProps) {
  const [config, setConfig] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!vxConfig.configKey) {
      setIsLoading(false);
      return;
    }

    fetchBlockConfig(vxConfig.configKey)
      .then((data) => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[example-block] API error:', err);
        setError(err.message);
        setIsLoading(false);
      });
  }, [vxConfig.configKey]);

  const attributes = buildAttributes(vxConfig);

  if (isLoading) {
    return (
      <div className="voxel-fse-loading">
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="voxel-fse-error">
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <ExampleBlockComponent
      attributes={attributes}
      config={config}
      context="frontend"
    />
  );
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize all block instances on page
 */
function initBlocks() {
  const containers = document.querySelectorAll<HTMLElement>(
    '.voxel-fse-example-block-frontend:not([data-react-mounted])'
  );

  containers.forEach((container) => {
    // Prevent double initialization
    container.setAttribute('data-react-mounted', 'true');

    // IMPORTANT: Parse vxconfig BEFORE clearing container
    // The original vxconfig from save.tsx will be removed when React mounts
    const vxConfig = parseVxConfig(container);
    if (!vxConfig) {
      console.error('[example-block] Skipping container - no vxconfig');
      return;
    }

    try {
      // NOTE: createRoot will clear container.innerHTML, removing original vxconfig
      // The SharedComponent will re-render vxconfig to keep it visible in DevTools
      const root = createRoot(container);
      root.render(<FrontendWrapper vxConfig={vxConfig} />);
    } catch (error) {
      console.error('[example-block] Mount failed:', error);
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlocks);
} else {
  initBlocks();
}

// Support Turbo/PJAX navigation
window.addEventListener('turbo:load', initBlocks);
```

### 15.6 Shared Component Template

```typescript
/**
 * Example Block - Shared Component (Generic)
 *
 * Main UI component used by BOTH editor and frontend.
 * Ensures editor/frontend parity.
 *
 * IMPORTANT: Use generics to type the config prop properly.
 * NEVER use 'any' - always define expected data shapes.
 *
 * CRITICAL: This component MUST re-render vxconfig to keep it visible in DOM.
 * This matches Voxel's pattern and makes debugging easier.
 *
 * @package VoxelFSE
 */

import { useMemo } from 'react';
import type { BlockAttributes, ExampleBlockConfig } from '../types';

/**
 * Component props with typed config
 * The config type should match your REST API response
 */
interface ExampleBlockComponentProps {
  attributes: BlockAttributes;
  config: ExampleBlockConfig | null; // Typed config, nullable until loaded
  context: 'editor' | 'frontend';
}

export default function ExampleBlockComponent({
  attributes,
  config,
  context,
}: ExampleBlockComponentProps) {
  // Compute derived values
  const iconSize = useMemo(() => {
    // Responsive handling would go here
    return attributes.iconSize || 24;
  }, [attributes.iconSize]);

  // Render button icon if set
  const renderButtonIcon = () => {
    if (!attributes.showIcon || !attributes.buttonIcon?.value) {
      return null;
    }

    return (
      <i className={attributes.buttonIcon.value} style={{ fontSize: iconSize }} />
    );
  };

  // Build vxconfig JSON matching save.tsx structure
  // CRITICAL: Re-render vxconfig to keep it visible in DOM after React hydration
  // This matches search-form and create-post patterns
  const vxConfig = {
    configKey: attributes.configKey,
    title: attributes.title,
    showIcon: attributes.showIcon,
    icons: {
      buttonIcon: attributes.buttonIcon,
    },
    responsive: {
      iconSize: attributes.iconSize,
      iconSize_tablet: attributes.iconSize_tablet,
      iconSize_mobile: attributes.iconSize_mobile,
    },
  };

  return (
    <div className="ts-form ts-example-widget">
      {/* Voxel vxconfig pattern - re-render configuration in JSON script */}
      {/* This keeps vxconfig visible in DevTools Elements tab after React mounts */}
      <script
        type="text/json"
        className="vxconfig"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(vxConfig) }}
      />

      <div className="ts-form-group">
        <div className="ts-filter flexify">
          {renderButtonIcon()}
          <span className="ts-filter-label">{attributes.title}</span>
        </div>
      </div>

      {/* Type-safe access to config properties */}
      {config && (
        <div className="ts-form-group">
          <div className="ts-example-content">
            {/* TypeScript knows config.items is Array<{ id, label, value }> */}
            {config.items.map((item) => (
              <div key={item.id} className="ts-example-item">
                <span className="item-label">{item.label}</span>
                <span className="item-value">{item.value}</span>
              </div>
            ))}

            {/* TypeScript knows config.settings.maxItems is number */}
            {config.settings.allowMultiple && (
              <small>Max items: {config.settings.maxItems}</small>
            )}
          </div>
        </div>
      )}

      {context === 'editor' && (
        <div className="ts-editor-only-notice">
          <small>Editor preview - frontend may differ slightly</small>
        </div>
      )}
    </div>
  );
}
```

### 15.7 useBlockConfig Hook Template

```typescript
/**
 * useBlockConfig Hook (Generic)
 *
 * Fetches block configuration from REST API with full type safety.
 * Uses generics to allow block-specific config types.
 *
 * IMPORTANT: Always specify the type parameter when using this hook.
 * Example: useBlockConfig<MyBlockConfig>(configKey)
 *
 * @package VoxelFSE
 */

import { useState, useEffect } from 'react';
import apiFetch from '@wordpress/api-fetch';

/**
 * Generic hook result - config is typed based on T
 */
interface UseBlockConfigResult<T> {
  config: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Generic hook for fetching block configuration
 * @template T - The expected config data type (define in types.ts)
 * @param configKey - Unique identifier for the config
 * @param endpoint - REST API endpoint path (default: example-config)
 */
export function useBlockConfig<T>(
  configKey: string,
  endpoint = 'example-config'
): UseBlockConfigResult<T> {
  const [config, setConfig] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state
    setIsLoading(true);
    setError(null);

    // Skip if no config key
    if (!configKey) {
      setIsLoading(false);
      return;
    }

    // Fetch from REST API with typed response
    apiFetch<T>({
      path: `/voxel-fse/v1/${endpoint}?key=${encodeURIComponent(configKey)}`,
    })
      .then((data) => {
        setConfig(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        console.error('[useBlockConfig] Error:', err);
        setError(err.message || 'Failed to load config');
        setIsLoading(false);
      });
  }, [configKey, endpoint]);

  return { config, isLoading, error };
}

/**
 * Usage example in edit.tsx:
 *
 * import { useBlockConfig } from './hooks/useBlockConfig';
 * import type { ExampleBlockConfig } from './types';
 *
 * function Edit({ attributes }) {
 *   // Type-safe config - IDE knows the shape of config
 *   const { config, isLoading, error } = useBlockConfig<ExampleBlockConfig>(
 *     attributes.configKey
 *   );
 *
 *   // config.items is typed as Array<{ id, label, value }>
 *   // config.settings.maxItems is typed as number
 * }
 */
```

### 15.8 Types Template

```typescript
/**
 * Example Block - TypeScript Types
 *
 * IMPORTANT: Avoid using 'any' types. Define proper interfaces for all data.
 * This ensures type safety and better IDE support.
 *
 * @package VoxelFSE
 */

/**
 * Icon value structure (from IconPickerControl)
 */
export interface IconValue {
  library: 'icon' | 'svg' | '';
  value: string;
}

/**
 * Block attributes (mirrors block.json)
 */
export interface BlockAttributes {
  configKey: string;
  title: string;
  showIcon: boolean;
  iconSize: number;
  iconSize_tablet?: number;
  iconSize_mobile?: number;
  buttonIcon: IconValue;
}

/**
 * vxconfig structure (stored in database)
 */
export interface VxConfig {
  configKey: string;
  title: string;
  showIcon: boolean;
  icons: {
    buttonIcon: IconValue;
  };
  responsive: {
    iconSize: number;
    iconSize_tablet?: number;
    iconSize_mobile?: number;
  };
}

/**
 * Block-specific API config data
 * Define this based on your REST API response structure.
 * NEVER use 'any' - always define the expected shape.
 */
export interface ExampleBlockConfig {
  items: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  settings: {
    maxItems: number;
    allowMultiple: boolean;
  };
  meta: {
    lastUpdated: string;
    version: string;
  };
}

/**
 * REST API response wrapper (generic)
 * Use this pattern for consistent API responses.
 */
export interface BlockConfigResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
```

### 15.9 REST API Controller Template

```php
<?php
/**
 * Example Block API Controller
 *
 * Provides REST API endpoint for block configuration.
 *
 * @package VoxelFSE
 */

namespace VoxelFSE\Controllers;

class Example_Block_API_Controller extends FSE_Base_Controller {
    /**
     * Register hooks
     */
    protected function hooks() {
        $this->on('rest_api_init', '@register_endpoints');
    }

    /**
     * Register REST API endpoints
     */
    protected function register_endpoints() {
        register_rest_route('voxel-fse/v1', '/example-config', [
            'methods'             => 'GET',
            'callback'            => [$this, 'get_config'],
            'permission_callback' => '__return_true', // Public endpoint
            'args'                => [
                'key' => [
                    'required'          => true,
                    'type'              => 'string',
                    'sanitize_callback' => 'sanitize_text_field',
                    'validate_callback' => function($param) {
                        return !empty($param);
                    },
                ],
            ],
        ]);
    }

    /**
     * Handle config request
     *
     * @param \WP_REST_Request $request
     * @return \WP_REST_Response|\WP_Error
     */
    public function get_config($request) {
        $config_key = $request->get_param('key');

        // Example: Fetch from Voxel
        // $post_type = \Voxel\Post_Type::get($config_key);
        // if (!$post_type) {
        //     return new \WP_Error('not_found', 'Config not found', ['status' => 404]);
        // }

        // Return config data
        return rest_ensure_response([
            'key'  => $config_key,
            'data' => [
                'example' => 'value',
                'fetched' => true,
            ],
        ]);
    }
}
```

### 15.10 editor.css Template

```css
/**
 * Example Block - Editor Styles
 *
 * Editor-only styling for Gutenberg.
 * NO frontend styles - inherit from Voxel parent theme.
 *
 * @package VoxelFSE
 */

/* Block wrapper in editor */
.voxel-fse-example-block-editor {
  min-height: 100px;
}

/* Placeholder styling */
.voxel-fse-block-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f0f0f0;
  border: 1px dashed #ccc;
  border-radius: 4px;
  text-align: center;
}

.voxel-fse-block-placeholder .placeholder-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.voxel-fse-block-placeholder .placeholder-text {
  font-size: 14px;
  color: #666;
}

/* Loading state */
.voxel-fse-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* Error state */
.voxel-fse-error {
  padding: 20px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
  color: #c00;
}

/* Editor-only notice */
.ts-editor-only-notice {
  padding: 10px;
  background: #fff3cd;
  border-radius: 4px;
  margin-top: 10px;
}

.ts-editor-only-notice small {
  color: #856404;
}
```

### 15.11 Vite Frontend Config Template

```javascript
/**
 * Vite Frontend Build Config - Example Block
 *
 * Builds frontend.tsx as IIFE for WordPress enqueue.
 *
 * @package VoxelFSE
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    // CRITICAL: Don't delete editor build files!
    emptyOutDir: false,

    // Output to block directory
    outDir: resolve(__dirname, './app/blocks/src/example-block'),

    lib: {
      entry: resolve(__dirname, './app/blocks/src/example-block/frontend.tsx'),
      name: 'VoxelFSEExampleBlock',
      formats: ['iife'],
      fileName: () => 'frontend.js',
    },

    rollupOptions: {
      // Externalize WordPress dependencies
      external: [
        'react',
        'react-dom',
        '@wordpress/element',
        '@wordpress/api-fetch',
      ],

      output: {
        // Map to WordPress globals
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/element': 'wp.element',
          '@wordpress/api-fetch': 'wp.apiFetch',
        },

        // Ensure single output file
        inlineDynamicImports: true,
      },
    },

    // Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.error for debugging
      },
    },
  },
});
```

---

## 16. Reference Files

### Source Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Conversion Rules | `docs/conversions/voxel-conversion-rules.md` | High-level conversion requirements |
| Plan C+ Implementation | `docs/conversions/create-post/create-post-plan-c-plus-implementation.md` | Detailed Plan C+ architecture |
| Search Form Summary | `docs/conversions/search-form/search-form-implementation-summary.md` | Reference implementation |
| Select2Control Implementation | `docs/conversions/print-template/select2-control-implementation-summary.md` | Generic dropdown control with specialized wrappers - demonstrates generic + specialized pattern, TypeScript strict mode, lazy loading, CSS inheritance |
| Block Registration | `docs/conversions/gutenberg-block-registration-guide.md` | Block creation patterns |
| Responsive Controls | `docs/conversions/responsive-controls-discovery.md` | Responsive control patterns |
| Popup Architecture | `docs/conversions/popup-positioning-architecture.md` | Popup implementation |
| Voxel AJAX | `docs/conversions/voxel-ajax-system.md` | AJAX integration patterns |
| Headless Strategy | `docs/headless-architecture/01-accelerated-option-c-plus-strategy.md` | Architecture overview |

### Code References

| Resource | Location | Purpose |
|----------|----------|---------|
| Shared Controls | `themes/voxel-fse/app/blocks/src/shared/controls/` | Reusable control components |
|  - Select2Control | `themes/voxel-fse/app/blocks/src/shared/controls/Select2Control.tsx` | Generic single-select dropdown with lazy loading |
|  - TemplateSelectControl | `themes/voxel-fse/app/blocks/src/shared/controls/TemplateSelectControl.tsx` | FSE template picker (wraps Select2Control) |
|  - DynamicTagTextControl | `themes/voxel-fse/app/blocks/src/shared/controls/DynamicTagTextControl.tsx` | Dynamic tag builder control |
|  - IconPickerControl | `themes/voxel-fse/app/blocks/src/shared/controls/IconPickerControl.tsx` | Icon selection control |
|  - TagMultiSelect | `themes/voxel-fse/app/blocks/src/shared/controls/TagMultiSelect.tsx` | Multi-select with tags |
| Popup Kit | `themes/voxel-fse/app/blocks/src/shared/popup-kit/` | Popup components |
| Search Form Block | `themes/voxel-fse/app/blocks/src/search-form/` | Reference implementation |
| Create Post Block | `themes/voxel-fse/app/blocks/src/create-post/` | Reference implementation |
| Print Template Block | `themes/voxel-fse/app/blocks/src/print-template/` | Uses TemplateSelectControl |
| Block Loader | `themes/voxel-fse/app/blocks/Block_Loader.php` | Block registration |
| Vite Config | `themes/voxel-fse/vite.blocks.config.js` | Editor build config |

### Voxel Source Files

| Resource | Location | Purpose |
|----------|----------|---------|
| Widget Files | `themes/voxel/templates/widgets/` | Original Elementor widgets |
| Commons JS | `themes/voxel/assets/dist/commons.js` | Voxel mixins (popup, blurable) |
| Frontend CSS | `themes/voxel/assets/css/frontend.min.css` | Theme styles to inherit |

---

## Appendix A: Quick Reference Card

### File Checklist for New Block

```
□ block.json         (NO "render", NO "style")
□ index.tsx          (registerBlockType)
□ edit.tsx           (InspectorControls + preview)
□ save.tsx           (vxconfig JSON + placeholder)
□ frontend.tsx       (parseVxConfig + createRoot)
□ shared/*.tsx       (shared components)
□ hooks/*.ts         (useBlockConfig)
□ types/index.ts     (TypeScript interfaces)
□ editor.css         (editor-only styles)
□ vite config        (IIFE frontend build)
```

### Attribute Naming Convention

```
attributeName           # Desktop value
attributeName_tablet    # Tablet override
attributeName_mobile    # Mobile override
```

### CSS Class Usage

```
DO:    Use Voxel's classes (ts-*, vx-*, nvx-*)
DON'T: Create custom classes for existing Voxel styles
DO:    Use voxel-fse-* prefix for editor-only classes
DON'T: Import style.css into editor.css
```

### REST API Pattern

```php
// Public endpoint
'permission_callback' => '__return_true'

// Authenticated endpoint
'permission_callback' => function() { return current_user_can('edit_posts'); }
```

### Build Commands

```bash
npm run build              # Build all
npm run build:blocks       # Editor builds only
npm run build:frontend:*   # Specific frontend build
```

### Voxel Parent Theme CSS Loading Pattern

**CRITICAL:** Voxel parent theme CSS files (commons.css, forms.css, social-feed.css) MUST be loaded via `add_editor_style()`, NOT `wp_enqueue_style()`.

**Why This Matters:**
- `add_editor_style()` inlines CSS in the FSE iframe in a specific, controlled order
- `wp_enqueue_style()` loads external sheets AFTER inline styles, breaking CSS cascade
- Using `wp_enqueue_style()` causes duplicate loading and incorrect specificity

**Evidence:**
```php
// Location: themes/voxel-fse/app/blocks/Block_Loader.php:780-783
// NOTE: DO NOT enqueue fse-commons, commons, forms, or social-feed here!
// These are loaded via add_editor_style() in add_editor_styles_for_fse()
// Loading them here via wp_enqueue_style() causes DUPLICATES and breaks CSS cascade order
```

**Correct Implementation:**
```php
// In Block_Loader::add_editor_styles_for_fse()
public static function add_editor_styles_for_fse()
{
    // Child theme CSS (relative path)
    add_editor_style('assets/css/voxel-fse-commons.css');
    
    // Parent theme CSS (absolute URL required)
    $voxel_forms_url = get_template_directory_uri() . '/assets/dist/forms.css';
    add_editor_style($voxel_forms_url);
}
```

**WRONG - Do NOT Do This:**
```php
// ❌ WRONG: Using wp_enqueue_style() for Voxel parent CSS
public static function enqueue_voxel_styles() {
    wp_enqueue_style(
        'vx:forms.css',
        get_template_directory_uri() . '/assets/dist/forms.css'
    );
    // This breaks CSS cascade order!
}
```

**When to Use Each:**
- `add_editor_style()`: For Voxel parent theme CSS (commons, forms, social-feed)
- `wp_enqueue_style()`: For block-specific CSS that's NOT part of Voxel core

**Hook Priority:**
```php
// add_editor_style() must be called in after_setup_theme hook
add_action('after_setup_theme', [__CLASS__, 'add_editor_styles_for_fse'], 20);
```

**Real-World Issue (December 2025):**
The popup-kit block initially failed to load forms.css because it used `wp_enqueue_style()` instead of `add_editor_style()`. This caused:
- forms.css not appearing in network console
- Incorrect popup positioning (calendar icon in wrong place)
- Missing form control styles

**Solution:** Added forms.css to `add_editor_styles_for_fse()` method, which fixed all layout issues immediately.

---

**Document Version:** 1.0.0
**Last Updated:** December 2025
**Maintainer:** VoxelFSE Development Team
