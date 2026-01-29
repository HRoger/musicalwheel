# Create Post Block - Style Loading in Gutenberg Editor

**Created:** November 2025
**Purpose:** Explain how CSS styles are enqueued and loaded in both Gutenberg editor and frontend for the create-post block

---

## Table of Contents

1. [Overview](#overview)
2. [The Two Contexts](#the-two-contexts)
3. [Style Loading via block.json](#style-loading-via-blockjson)
4. [Complete Style Loading Flow](#complete-style-loading-flow)
5. [Why We Enqueue Voxel's Styles](#why-we-enqueue-voxels-styles)
6. [Style Loading Timeline](#style-loading-timeline)
7. [The Style Files](#the-style-files)
8. [How ServerSideRender Gets Styles](#how-serversiderender-gets-styles)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Best Practices](#best-practices)

---

## Overview

The create-post block uses a **dual style system**:
1. **Block-specific styles** (editor.css, style.css)
2. **Voxel parent theme styles** (forms.css, create-post.css)

This ensures perfect visual parity between the editor preview and frontend display.

---

## The Two Contexts

### Context 1: Editor (WordPress Admin)
- Block editor / Gutenberg
- `ServerSideRender` preview
- InspectorControls settings

### Context 2: Frontend (Public Site)
- User-facing website
- React component (frontend.tsx)
- Actual form functionality

**Gutenberg has different mechanisms for each context.**

---

## Style Loading via block.json

**File:** `themes/voxel-fse/app/blocks/src/create-post/block.json:54-58`

```json
{
  "editorScript": "file:./index.js",
  "editorStyle": "file:./editor.css",
  "viewScript": "file:./view.js",
  "style": "file:./style.css",
  "render": "file:./render.php"
}
```

### Property Reference Table

| Property | Where It Loads | Purpose | Example Use |
|----------|---------------|---------|-------------|
| `editorScript` | Editor ONLY | Block registration + editor component | Block controls, InspectorControls |
| `editorStyle` | Editor ONLY | Editor-specific styles | Settings panel, block wrapper in editor |
| `viewScript` | Editor + Frontend | Interactive functionality | ⚠️ Deprecated for dynamic blocks with render.php |
| `style` | Editor + Frontend | Styles for block appearance | Block container, shared styles |
| `render` | Server-side | Dynamic rendering (PHP) | Form output, data fetching |

### Automatic WordPress Behavior

When `register_block_type()` reads `block.json`:

```php
// themes/voxel-fse/app/blocks/Block_Loader.php:140-180
register_block_type(
    dirname( $block_file ), // Points to block.json directory
    $block_json
);
```

**WordPress automatically:**

1. **Reads `"style": "file:./style.css"`**
   - Creates handle: `voxel-fse-create-post-style-css`
   - Enqueues in **both editor and frontend**

2. **Reads `"editorStyle": "file:./editor.css"`**
   - Creates handle: `voxel-fse-create-post-editor-style-css`
   - Enqueues in **editor only**

---

## Complete Style Loading Flow

### Part 1: Automatic Registration (block.json)

```
WordPress loads block
        ↓
Reads block.json
        ↓
Finds "style": "file:./style.css"
        ↓
Auto-enqueues in editor + frontend
        ↓
Finds "editorStyle": "file:./editor.css"
        ↓
Auto-enqueues in editor only
```

**Result:** Basic block styling loads automatically.

---

### Part 2: Additional Styles via render.php

**Why we need this:**

The `ServerSideRender` component shows a preview of the frontend in the editor. **But it doesn't automatically get the frontend styles from Voxel.**

**File:** `themes/voxel-fse/app/blocks/src/create-post/render.php:142-160`

```php
// Enqueue our block's custom styles
$style_path = get_stylesheet_directory() . '/app/blocks/src/create-post/style.css';
$style_url = get_stylesheet_directory_uri() . '/app/blocks/src/create-post/style.css';

if ( file_exists( $style_path ) ) {
    wp_enqueue_style(
        'voxel-fse-create-post-style',
        $style_url,
        [],
        filemtime( $style_path )  // ⭐ Cache busting with file modification time
    );
}

// ⭐ CRITICAL: Enqueue Voxel's form styles
// Without these, the form preview looks broken in the editor
if ( function_exists( 'voxel' ) ) {
    wp_enqueue_style( 'vx:commons.css' );      // Voxel base styles
    wp_enqueue_style( 'vx:forms.css' );        // Voxel form styles
    wp_enqueue_style( 'vx:create-post.css' );  // Voxel create-post widget styles
}
```

**Key Points:**
- `filemtime()` ensures browser cache updates when CSS changes
- Voxel styles loaded via Voxel's registered handles
- `function_exists('voxel')` checks if parent theme is active

---

## Why We Enqueue Voxel's Styles

### The Problem

Our block uses **Voxel's CSS classes**:

```html
<form class="ts-form ts-create-post">
  <div class="ts-form-group">
    <label class="ts-form-label">Field Label</label>
    <input class="ts-input-text" />
  </div>
  <button class="ts-btn ts-btn-2">Submit</button>
</form>
```

**Without Voxel's CSS:**
- `ts-form` → No styles, broken layout
- `ts-btn` → Looks like plain button, no Voxel styling
- Preview in editor looks nothing like frontend

**With Voxel's CSS:**
- ✅ Perfect visual parity
- ✅ Editor preview matches frontend exactly
- ✅ No duplicate CSS needed
- ✅ Automatic updates when Voxel theme updates

---

## Style Loading Timeline

### In the Editor:

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: Block Registration                        │
│  WordPress reads block.json                         │
├─────────────────────────────────────────────────────┤
│  Automatic enqueues from block.json:                │
│  ✅ style.css (both contexts)                       │
│  ✅ editor.css (editor only)                        │
│                                                     │
│  Result: Basic block styling loads                  │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  STEP 2: Editor Loads Block                         │
│  edit.tsx renders with ServerSideRender             │
├─────────────────────────────────────────────────────┤
│  <ServerSideRender                                  │
│    block="voxel-fse/create-post"                    │
│    attributes={attributes}                          │
│  />                                                 │
│                                                     │
│  Makes AJAX request to WordPress REST API           │
│  URL: /wp-json/wp/v2/block-renderer/               │
│       voxel-fse/create-post                         │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  STEP 3: render.php Executes (REST API Context)     │
│  File: themes/voxel-fse/.../render.php              │
├─────────────────────────────────────────────────────┤
│  PHP code runs on server                            │
│                                                     │
│  Enqueues additional styles:                        │
│  ✅ voxel-fse-create-post-style                     │
│  ✅ vx:commons.css (Voxel base)                     │
│  ✅ vx:forms.css (Voxel forms)                      │
│  ✅ vx:create-post.css (Voxel widget styles)        │
│                                                     │
│  Returns HTML with Voxel CSS classes                │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  STEP 4: ServerSideRender Displays HTML             │
│  With all necessary styles loaded                   │
├─────────────────────────────────────────────────────┤
│  REST API response includes:                        │
│  - <link> tags for all enqueued styles             │
│  - HTML output from render.php                      │
│                                                     │
│  Result in editor:                                  │
│  <div class="wp-block-voxel-fse-create-post">      │
│    <!-- Styles loaded -->                          │
│    <link rel="stylesheet" href=".../vx:forms.css" />│
│    <link rel="stylesheet" href=".../style.css" />   │
│                                                     │
│    <!-- Content rendered -->                        │
│    <form class="ts-form ts-create-post">           │
│      <!-- Styled with Voxel CSS ✅ -->            │
│    </form>                                          │
│  </div>                                             │
└─────────────────────────────────────────────────────┘
```

---

### On the Frontend:

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: Page Loads                                 │
│  WordPress renders post content                     │
├─────────────────────────────────────────────────────┤
│  Automatic enqueues from block.json:                │
│  ✅ style.css (loaded for all blocks on page)       │
│                                                     │
│  Note: editor.css NOT loaded (editor only)          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  STEP 2: Block Renders                              │
│  WordPress calls render.php                         │
├─────────────────────────────────────────────────────┤
│  render.php checks context:                         │
│  if ( ! $is_editor_preview && ! is_admin() ) {     │
│    // We're on frontend                            │
│  }                                                  │
│                                                     │
│  Enqueues frontend styles:                          │
│  ✅ voxel-fse-create-post-style                     │
│  ✅ vx:commons.css (Voxel)                          │
│  ✅ vx:forms.css (Voxel)                            │
│  ✅ vx:create-post.css (Voxel)                      │
│                                                     │
│  Enqueues frontend script (IIFE):                   │
│  ✅ create-post-frontend.js (React component)       │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  STEP 3: HTML Output                                │
│  Container div for React to mount                   │
├─────────────────────────────────────────────────────┤
│  <div                                               │
│    class="voxel-fse-create-post-frontend"          │
│    data-attributes="{...}"                          │
│    data-post-id="123"                               │
│  >                                                  │
│    <div class="loading-placeholder">               │
│      Loading form...                                │
│    </div>                                           │
│  </div>                                             │
│                                                     │
│  Styles already in <head>:                         │
│  <link rel="stylesheet" href=".../vx:forms.css" />  │
│  <link rel="stylesheet" href=".../style.css" />     │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  STEP 4: React Mounts (frontend.tsx)                │
│  JavaScript runs after DOMContentLoaded             │
├─────────────────────────────────────────────────────┤
│  // frontend.tsx (compiled to IIFE)                 │
│  const container = document.querySelector(          │
│    '.voxel-fse-create-post-frontend'               │
│  );                                                 │
│                                                     │
│  const root = createRoot(container);                │
│  root.render(<CreatePostForm {...props} />);       │
│                                                     │
│  Renders form with Voxel CSS classes:               │
│  <form class="ts-form ts-create-post">             │
│    <div class="ts-form-group">                     │
│      <input class="ts-input-text" />               │
│    </div>                                           │
│    <button class="ts-btn ts-btn-2">Submit</button> │
│  </form>                                            │
│                                                     │
│  Voxel styles already loaded ✅                     │
│  Form displays perfectly styled ✅                  │
└─────────────────────────────────────────────────────┘
```

---

## The Style Files

### 1. editor.css (Editor-only styles)

**Location:** `themes/voxel-fse/app/blocks/src/create-post/editor.css`

**Purpose:** Style the **block controls and settings** in the editor (NOT the preview)

**Loads:** Editor ONLY

**Example:**
```css
/* Style the block wrapper in editor */
.voxel-fse-create-post-editor {
    border: 1px solid #ddd;
    padding: 20px;
    background: #fafafa;
}

/* Style InspectorControls panels */
.voxel-fse-create-post-editor .components-panel__body {
    margin-bottom: 16px;
}

/* Style the placeholder when no post type selected */
.voxel-fse-create-post-editor .components-placeholder {
    min-height: 200px;
}
```

**NOT for:** Styling the form preview (that uses style.css + Voxel CSS)

---

### 2. style.css (Editor + Frontend)

**Location:** `themes/voxel-fse/app/blocks/src/create-post/style.css`

**Purpose:** Styles that apply to **both editor and frontend**

**Loads:** Both contexts

**Example:**
```css
/* Container styles (shared) */
.voxel-fse-create-post-block {
    max-width: 800px;
    margin: 0 auto;
}

/* Custom additions not in Voxel */
.voxel-fse-create-post-block .custom-success-message {
    padding: 20px;
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    margin-top: 20px;
}

/* Loading state */
.voxel-fse-create-post-block .loading-placeholder {
    text-align: center;
    padding: 40px;
    color: #666;
}
```

**Note:** Most form styles come from Voxel, so this file is minimal.

---

### 3. Voxel Styles (Enqueued from parent theme)

**Voxel provides these registered style handles:**

#### vx:commons.css
**Purpose:** Base layout, typography, utilities

**Contains:**
- Grid system
- Typography (headings, paragraphs)
- Utility classes (flexify, ts-sticky-top)
- Base component styles

**Example classes:**
```css
.flexify { display: flex; align-items: center; }
.ts-sticky-top { position: sticky; top: 0; }
```

---

#### vx:forms.css
**Purpose:** Form elements (inputs, labels, buttons)

**Contains:**
- Form containers (.ts-form)
- Form groups (.ts-form-group)
- Input fields (.ts-input-text, .ts-textarea)
- Buttons (.ts-btn, .ts-btn-2)
- Labels (.ts-form-label)

**Example from Voxel:**
```css
.ts-form {
    width: 100%;
}

.ts-form-group {
    margin-bottom: 20px;
}

.ts-input-text {
    width: 100%;
    border: 1px solid #ddd;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 15px;
}

.ts-btn {
    display: inline-flex;
    align-items: center;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

.ts-btn-2 {
    background: #2271b1;
    color: white;
}

.ts-btn-2:hover {
    background: #135e96;
}
```

---

#### vx:create-post.css
**Purpose:** Create-post widget specific styles

**Contains:**
- Multi-step form progress
- File upload styling
- Success/error messages
- Advanced field types

**Example from Voxel:**
```css
.ts-create-post {
    /* Widget-specific styles */
}

.ts-form-progres {
    /* Progress bar */
    margin-bottom: 30px;
}

.ts-file-upload {
    /* File upload area */
}

.ts-edit-success {
    /* Success message container */
    text-align: center;
    padding: 40px;
}
```

---

## How ServerSideRender Gets Styles

### The Challenge

`ServerSideRender` makes an **AJAX request** to render the block preview. This request goes to a REST API endpoint, NOT the regular admin page.

**REST API Endpoint:**
```
POST /wp-json/wp/v2/block-renderer/voxel-fse/create-post
```

**Request Body:**
```json
{
  "attributes": {
    "postTypeKey": "places",
    "showFormHead": true
  }
}
```

---

### Without Proper Setup

**Problem:** Voxel styles not loaded in REST API context

```html
<!-- What ServerSideRender would display without style enqueuing: -->
<form class="ts-form ts-create-post">
  <!-- No styles loaded! -->
  <!-- Broken layout! -->
  <!-- Plain unstyled HTML! -->
</form>
```

**Result:** Editor preview looks completely different from frontend.

---

### With render.php Enqueuing Styles

**Solution:** Enqueue styles in render.php callback

```php
// render.php
wp_enqueue_style( 'vx:forms.css' );
wp_enqueue_style( 'vx:create-post.css' );

// Output HTML
?>
<form class="ts-form ts-create-post">
  <!-- Voxel styles loaded! -->
</form>
```

**REST API response includes:**
```html
<link rel='stylesheet' id='vx:forms.css' href='.../forms.css' />
<link rel='stylesheet' id='vx:create-post.css' href='.../create-post.css' />

<form class="ts-form ts-create-post">
  <!-- Perfect layout! -->
  <!-- Voxel styling applied! -->
</form>
```

**Result:** Editor preview matches frontend perfectly.

---

### Why This Works

**WordPress allows style enqueuing in render callbacks:**

```php
// In render.php (dynamic block callback)
function my_render_callback( $attributes ) {
    // Enqueue styles
    wp_enqueue_style( 'my-style', ... );

    // WordPress collects ALL enqueued styles
    // Includes them in REST API response

    // Return HTML
    return '<div>My block</div>';
}
```

**The Process:**

1. `ServerSideRender` makes REST API request
2. WordPress executes `render.php`
3. `render.php` calls `wp_enqueue_style()`
4. WordPress buffers output
5. Collects all enqueued styles
6. Returns JSON response with HTML + style `<link>` tags
7. Browser loads styles + displays HTML
8. ✅ Perfect rendering!

---

## Common Issues & Solutions

### Issue 1: Styles Not Appearing in Editor

**Symptom:** Preview looks broken, no Voxel styling

**Cause:** Voxel styles not enqueued in render.php

**Debug:**
```php
// Add to render.php temporarily
error_log('Voxel function exists: ' . (function_exists('voxel') ? 'YES' : 'NO'));
```

**Fix:**
```php
// Ensure this is in render.php
if ( function_exists( 'voxel' ) ) {
    wp_enqueue_style( 'vx:commons.css' );
    wp_enqueue_style( 'vx:forms.css' );
    wp_enqueue_style( 'vx:create-post.css' );
} else {
    error_log('Warning: Voxel theme not active!');
}
```

---

### Issue 2: Editor Styles Bleeding into Frontend

**Symptom:** Editor-specific styles appear on public site

**Cause:** Used `style.css` instead of `editor.css`

**Wrong:**
```css
/* style.css (loads everywhere!) */
.voxel-fse-create-post-editor .edit-controls {
    display: flex;
    padding: 10px;
    background: #f0f0f0;
}
```

**Right:**
```css
/* editor.css (loads in editor only) */
.voxel-fse-create-post-editor .edit-controls {
    display: flex;
    padding: 10px;
    background: #f0f0f0;
}
```

**Rule of thumb:**
- Editor UI → `editor.css`
- Block appearance → `style.css`

---

### Issue 3: Styles Load but Wrong Order

**Symptom:** Some Voxel styles overridden by your styles

**Cause:** Load order matters (CSS specificity and cascade)

**Problem:**
```php
// Your styles load BEFORE Voxel
wp_enqueue_style( 'voxel-fse-create-post-style', ... );

// Later, Voxel styles load
wp_enqueue_style( 'vx:forms.css', ... );

// Result: Voxel overrides your custom styles!
```

**Fix:** Specify dependencies
```php
wp_enqueue_style(
    'voxel-fse-create-post-style',
    $style_url,
    [ 'vx:commons.css', 'vx:forms.css' ],  // ⭐ Load after Voxel
    filemtime( $style_path )
);
```

**Now loads in order:**
1. `vx:commons.css` (Voxel base)
2. `vx:forms.css` (Voxel forms)
3. `voxel-fse-create-post-style` (your custom styles)

**Your styles can now override Voxel when needed.**

---

### Issue 4: Cache Not Updating

**Symptom:** CSS changes don't appear after editing

**Cause:** Browser cache or missing file version

**Fix:** Use `filemtime()` for automatic cache busting
```php
wp_enqueue_style(
    'voxel-fse-create-post-style',
    $style_url,
    [],
    filemtime( $style_path )  // ⭐ Auto-updates on file change
);
```

**How it works:**
```html
<!-- Before file edit: -->
<link href="style.css?ver=1700000000" />

<!-- After file edit: -->
<link href="style.css?ver=1700000100" />
<!-- New version = browser fetches new file -->
```

---

## Best Practices

### 1. Use Voxel CSS Classes

**✅ DO:**
```html
<form class="ts-form ts-create-post">
  <div class="ts-form-group">
    <label class="ts-form-label">Name</label>
    <input class="ts-input-text" />
  </div>
  <button class="ts-btn ts-btn-2">Submit</button>
</form>
```

**Benefits:**
- ✅ Automatic styling from Voxel
- ✅ Perfect visual match
- ✅ No duplicate CSS
- ✅ Updates when Voxel updates

**❌ DON'T:**
```html
<form class="custom-form">
  <div class="field-wrapper">
    <label class="field-label">Name</label>
    <input class="text-input" />
  </div>
  <button class="submit-button">Submit</button>
</form>
```

**Problems:**
- ❌ Must write ALL styles yourself
- ❌ Won't match Voxel's design
- ❌ More maintenance burden
- ❌ Duplicates Voxel's CSS

---

### 2. Minimal Custom CSS

**Only add custom CSS for:**
- Features that don't exist in Voxel
- Minor spacing adjustments
- Block-specific layout needs
- Custom success/error messages

**Good example:**
```css
/* style.css - minimal custom styles */

/* Block container positioning */
.voxel-fse-create-post-block {
    max-width: 800px;
    margin: 0 auto;
}

/* Custom success message (doesn't exist in Voxel) */
.voxel-fse-create-post-block .custom-success {
    padding: 20px;
    background: #d4edda;
    border-left: 4px solid #28a745;
}

/* Everything else uses Voxel CSS classes! */
```

**Bad example:**
```css
/* style.css - DON'T DO THIS */

/* Redefining Voxel styles (duplicates parent theme) */
.ts-form {
    /* ... 50 lines of CSS ... */
}

.ts-input-text {
    /* ... 30 lines of CSS ... */
}

/* Now you have 500+ lines of duplicate CSS! */
```

---

### 3. Always Enqueue Voxel Styles in render.php

**Template for all blocks using Voxel classes:**

```php
// At the end of render.php, before HTML output

// Enqueue block-specific styles
$style_path = get_stylesheet_directory() . '/app/blocks/src/block-name/style.css';
$style_url = get_stylesheet_directory_uri() . '/app/blocks/src/block-name/style.css';

if ( file_exists( $style_path ) ) {
    wp_enqueue_style(
        'voxel-fse-block-name-style',
        $style_url,
        [ 'vx:commons.css' ],  // Load after Voxel base
        filemtime( $style_path )
    );
}

// ⭐ ALWAYS include Voxel styles for blocks using Voxel classes
if ( function_exists( 'voxel' ) ) {
    wp_enqueue_style( 'vx:commons.css' );
    wp_enqueue_style( 'vx:forms.css' );
    // Add other Voxel styles as needed:
    // wp_enqueue_style( 'vx:create-post.css' );
    // wp_enqueue_style( 'vx:search-forms.css' );
}
```

---

### 4. Organize Styles by Context

**Structure:**

```
app/blocks/src/create-post/
├── editor.css          # Editor ONLY styles
│   ├── Block wrapper in editor
│   ├── InspectorControls panels
│   └── Placeholder states
│
├── style.css           # Both editor + frontend
│   ├── Block container
│   ├── Custom additions
│   └── Layout tweaks
│
└── render.php          # Enqueues Voxel styles
    └── wp_enqueue_style('vx:forms.css')
```

**Decision tree:**

```
Is this style for...

Editor UI controls?
  → editor.css

Block appearance (both contexts)?
  → style.css

Form elements that exist in Voxel?
  → Use Voxel classes, no custom CSS!

Custom feature not in Voxel?
  → style.css with minimal rules
```

---

### 5. Test in Both Contexts

**Always verify:**

**✅ Editor:**
1. Open block editor
2. Add create-post block
3. Select post type
4. Check ServerSideRender preview
5. Verify Voxel styling applied

**✅ Frontend:**
1. Add block to page
2. Publish page
3. View on frontend
4. Verify form displays correctly
5. Check React component mounts

**✅ Both should look identical!**

---

## Summary

### Style Loading Hierarchy

```
Automatic (block.json)
├── editorStyle → editor.css (editor only)
│   └── InspectorControls, block wrapper, placeholders
│
└── style → style.css (editor + frontend)
    └── Block container, shared styles

Manual (render.php)
├── voxel-fse-create-post-style (custom styles)
│   └── Custom features, layout tweaks
│
└── Voxel parent theme styles
    ├── vx:commons.css (base, typography, utilities)
    ├── vx:forms.css (form elements, buttons, inputs)
    └── vx:create-post.css (widget-specific styles)
```

---

### Loading Sequence in Editor

```
1. WordPress loads block
   ├── Automatic: editor.css, style.css
   └── Basic block styling available

2. ServerSideRender makes AJAX request
   └── Calls render.php via REST API

3. render.php executes
   ├── Enqueues: voxel-fse-create-post-style
   ├── Enqueues: vx:commons.css
   ├── Enqueues: vx:forms.css
   ├── Enqueues: vx:create-post.css
   └── Returns HTML with <link> tags

4. Browser displays preview
   └── All styles loaded, perfect rendering ✅
```

---

### Loading Sequence on Frontend

```
1. Page loads
   └── Automatic: style.css from block.json

2. Block renders
   └── WordPress calls render.php

3. render.php enqueues styles
   ├── voxel-fse-create-post-style
   └── Voxel styles (vx:commons, vx:forms, vx:create-post)

4. HTML output with container
   └── React mount point rendered

5. React mounts (DOMContentLoaded)
   └── frontend.tsx creates form with Voxel classes

6. Form displays
   └── All styles already loaded ✅
```

---

### Key Takeaways

1. **Use Voxel CSS classes** instead of writing custom styles
2. **Enqueue Voxel styles in render.php** for ServerSideRender
3. **Editor.css for editor UI**, style.css for block appearance
4. **Cache busting with filemtime()** for development
5. **Test in both contexts** to ensure visual parity

---

**The golden rule: Leverage Voxel's existing styles to ensure perfect visual parity between FSE blocks and Voxel's Elementor widgets, with minimal custom CSS.**

---

## File References

**Block Configuration:**
- `themes/voxel-fse/app/blocks/src/create-post/block.json`

**Styles:**
- `themes/voxel-fse/app/blocks/src/create-post/editor.css`
- `themes/voxel-fse/app/blocks/src/create-post/style.css`

**PHP Rendering:**
- `themes/voxel-fse/app/blocks/src/create-post/render.php`

**Block Registration:**
- `themes/voxel-fse/app/blocks/Block_Loader.php`

**Voxel Styles (Parent Theme):**
- `themes/voxel/assets/css/commons.css`
- `themes/voxel/assets/css/forms.css`
- `themes/voxel/assets/css/create-post.css`

---

**Created:** November 2025
**Last Updated:** November 2025
**Author:** Claude (AI Assistant)
