# Universal Widget Conversion Prompt - Quick Reference

**Use this prompt template to convert any Voxel Elementor widget to a Gutenberg FSE block.**

The master guide clearly states React hooks should be imported from 'react' directly, not @wordpress/element.

---

## 🔧 Variable Substitution

**⚠️ IMPORTANT: Before proceeding, replace ALL variables in this prompt with the actual values provided below.**
**⚠️ IMPORTANT: The master guide clearly states React hooks should be imported from 'react' directly, not @wordpress/element.**

### Variable Assignment

```
WIDGET_NAME = term_feed
block-name = term-feed
Block Title = Term Feed
Widget Name = Term Feed
Widget_Class = Term_Feed
BlockName = Term_Feed
widget_name = term_feed
```

### Variable Mapping

| Variable | Replace With | Example |
|----------|--------------|---------|
| `{WIDGET_NAME}` | Widget name (kebab-case) | WIDGET_NAME |
| `{block-name}` | Block name (kebab-case) | block-name |
| `{Block Title}` | Block title (Title Case) | Block Title |
| `{Widget Name}` | Widget name (Title Case) | Widget Name |
| `{Widget_Class}` | Widget class (Pascal_Case) | Widget_Class |
| `{BlockName}` | Component name (PascalCase) | BlockName |
| `{widget_name}` | Widget name (snake_case) | widget_name |

**Instructions:**
- Replace ALL instances of `{variable}` throughout this document with the corresponding value from Variable Assignment above
- Maintain format consistency (kebab-case, PascalCase, etc.)
- Do NOT replace generic placeholders like `{exact-class-names}`, `{control1}`, `{potential-filename}` - these are filled during discovery phase

**After variable substitution, proceed with the conversion following all phases below.**
---

## 🎯 Quick Start

```
Convert the {WIDGET_NAME} Voxel Elementor widget to a Gutenberg FSE block.

Widget: {WIDGET_NAME}
Block: voxel-fse/app/blocks/src/{block-name}
Title: {Block Title} (VX)

REQUIREMENTS:
1. Read docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md FIRST
2. Read docs/conversions/voxel-widget-conversion-master-guide.md
3. Check .mcp-memory/memory.json for existing patterns
4. Follow Plan C+ architecture (NO PHP rendering)
5. Match Voxel HTML structure 1:1
6. Use TypeScript strict mode (NO `any` types)

DISCOVERY PHASE (MANDATORY - NO CODE YET):
1. Find widget: themes/voxel/templates/widgets/{widget-name}.php
2. Inspect rendered HTML (browser DevTools)
3. Document all Elementor controls
4. ⚠️ SPECIAL: Check for Dynamic Tags (VoxelScript) - Look for:
   - Gradient circle icon (blue→pink) with white 3D cube
   - "EDIT TAGS" and "DISABLE TAGS" buttons
   - Fields showing @post(id), @user(name), etc.
5. Identify data requirements (REST API needed?)
6. Check for popups/modals
7. Analyze JavaScript behavior
8. Read Voxel documentation
9. Check autoloader conflicts

IMPLEMENTATION:
- Use templates from master guide Section 15
- Follow step-by-step process (Section 4)
- Match HTML structure exactly (Section 6)
- Use shared controls (Section 5)
- Create REST API if needed (Section 11)

VALIDATION:
- No render.php, no ServerSideRender
- vxconfig JSON in script tag
- Shared component re-renders vxconfig
- TypeScript strict mode compliant
- HTML matches Voxel 1:1
- No console errors

See full prompt: BELOW AT # Universal Voxel Widget to Gutenberg Block Conversion Prompt
```

---

## 📋 Discovery Checklist (Copy & Fill)

```
Widget Name: ____________________
Block Name: voxel-fse/____________________

DISCOVERY:
[ ] Widget file found: themes/voxel/templates/widgets/____________________
[ ] HTML structure documented
[ ] All CSS classes listed (ts-*, vx-*, nvx-*)
[ ] Elementor controls inventoried
[ ] ⚠️ Dynamic Tags identified (if applicable):
    [ ] Gradient icon with 3D cube found
    [ ] "EDIT TAGS" / "DISABLE TAGS" buttons found
    [ ] @post/@user/@site syntax found
    [ ] DynamicTagTextControl location found
[ ] Data requirements identified
[ ] Popup requirements identified
[ ] JavaScript behavior analyzed
[ ] Voxel documentation read
[ ] Autoloader conflicts checked

IMPLEMENTATION:
[ ] block.json created (NO render, NO style)
[ ] TypeScript interfaces defined
[ ] Inspector controls mapped
[ ] ⚠️ DynamicTagTextControl implemented (if applicable):
    [ ] Control imported from shared/controls
    [ ] Trigger button icon matches (gradient + 3D cube)
    [ ] "EDIT TAGS" / "DISABLE TAGS" buttons work
    [ ] Attributes store tag syntax + dynamic flag
    [ ] VoxelScript parser integrated in shared component
[ ] edit.tsx implemented
[ ] save.tsx outputs vxconfig
[ ] frontend.tsx hydrates React
[ ] Shared component created
[ ] REST API created (if needed)
[ ] Build config updated

VALIDATION:
[ ] No PHP rendering
[ ] vxconfig visible in DevTools
[ ] HTML matches Voxel 1:1
[ ] TypeScript strict mode passes
[ ] ⚠️ Dynamic Tags tested (if applicable):
    [ ] Trigger button icon matches (gradient + 3D cube)
    [ ] "EDIT TAGS" opens tag builder
    [ ] "DISABLE TAGS" converts to static text
    [ ] Dynamic tags render in editor
    [ ] Dynamic tags render on frontend
    [ ] VoxelScript parser works correctly
[ ] No console errors
[ ] Editor preview works
[ ] Frontend hydration works
```

---

## 🔑 Key Rules (Always Remember)

1. **Discovery First** - Never code before discovering Voxel's implementation
2. **Plan C+ Only** - NO render.php, NO ServerSideRender, NO render_callback
3. **1:1 Matching** - HTML structure must match Voxel exactly
4. **No CSS Duplication** - Inherit from Voxel parent, don't create style.css
5. **TypeScript Strict** - No `any` types, proper interfaces required
6. **Check Memory** - Use existing patterns from .mcp-memory/memory.json
7. **Evidence-Based** - Every decision backed by Voxel code reference
8. **⚠️ Dynamic Tags** - Use DynamicTagTextControl with gradient icon (blue→pink + 3D cube)

---

## 📚 Essential References

- **Full Prompt:** `docs/conversions/universal-widget-conversion-prompt.md`
- **Master Guide:** `docs/conversions/voxel-widget-conversion-master-guide.md`
- **Critical Instructions:** `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`
- **Project Memory:** `.mcp-memory/memory.json`
- **Reference Blocks:** `themes/voxel-fse/app/blocks/src/search-form/`, `create-post/`, `print-template/`
- **⚠️ Dynamic Tags:**
    - **Control:** `themes/voxel-fse/app/blocks/src/shared/controls/DynamicTagTextControl.tsx`
    - **Parser:** `themes/voxel-fse/app/dynamic-data/parser/`
    - **Docs:** `docs/voxel-dynamic-tag-builder/`
- **⚠️ Select2 Controls:**
    - **Generic Control:** `themes/voxel-fse/app/blocks/src/shared/controls/Select2Control.tsx`
    - **Template Picker:** `themes/voxel-fse/app/blocks/src/shared/controls/TemplateSelectControl.tsx`
    - **Implementation Summary:** `docs/conversions/print-template/select2-control-implementation-summary.md`



---
 


# Universal Voxel Widget to Gutenberg Block Conversion Prompt

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Purpose:** Reusable prompt template for converting ANY Voxel Elementor widget to a headless-ready Gutenberg FSE block

---

## 🎯 Conversion Task

Convert the **{WIDGET_NAME}** Voxel Elementor widget to a Gutenberg FSE block using **Plan C+ architecture** (headless-ready, no PHP rendering).

**Widget Name:** `{WIDGET_NAME}`  
**Block Name:** `voxel-fse/app/blocks/src/{block-name}` (kebab-case)  
**Block Title:** `{Block Title} (VX)` (must end with `(VX)`)
---

## ⚠️ CRITICAL REQUIREMENTS - READ FIRST

### Mandatory Documents (READ BEFORE STARTING)

1. **`docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`** - Discovery-first methodology, 1:1 matching, autoloader conflict prevention
2. **`docs/conversions/voxel-widget-conversion-master-guide.md`** - Complete conversion process, Plan C+ architecture, code templates
3. **`.mcp-memory/memory.json`** - Check for existing patterns (React Portal, Blurable Mixin, etc.)

### Absolute Rules

- ❌ **NEVER** write code before completing discovery phase
- ❌ **NEVER** guess implementation details - always find Voxel's actual code
- ❌ **NEVER** use PHP rendering (NO render.php, NO render_callback, NO ServerSideRender)
- ❌ **NEVER** create files with same names/paths as Voxel parent theme
- ❌ **NEVER** use `any` types in TypeScript (strict mode required)
- ✅ **ALWAYS** use Plan C+ architecture (API-driven, React hydration)
- ✅ **ALWAYS** match Voxel's HTML structure 1:1 (same CSS classes, DOM hierarchy)
- ✅ **ALWAYS** provide evidence (file paths, line numbers, code snippets)
- ✅ **ALWAYS** check project memory for existing patterns

---

## 📋 Phase 1: Discovery & Analysis (MANDATORY - NO CODE YET)

### Step 1.1: Check Project Memory

```bash
# Read project memory for existing patterns
Read .mcp-memory/memory.json

# Search for relevant patterns:
# - Popup/Modal implementations
# - Form submission patterns
# - AJAX handling
# - React Portal usage
# - Any widget-specific solutions
```

**Action:** Document any relevant patterns found in memory.

### Step 1.2: Locate Voxel Widget Source

```bash
# Find widget PHP file
find themes/voxel/templates/widgets -name "*{widget-name}*" -o -name "*{widget_name}*"

# Search for widget references
grep -r "{widget-name}" themes/voxel/templates/widgets/
grep -r "{Widget Name}" themes/voxel/templates/widgets/
```

**Deliverables:**
- [ ] Widget file path: `themes/voxel/templates/widgets/{widget-name}.php`
- [ ] Widget class name: `\Voxel\Widgets\{Widget_Class}`
- [ ] Line numbers of key methods

### Step 1.3: Analyze Screenshots (If Provided)

**If screenshots are provided, analyze them to understand:**

- [ ] **Visual Structure:** Layout, spacing, visual hierarchy
- [ ] **UI Components:** Buttons, inputs, dropdowns, icons
- [ ] **Interactive Elements:** Popups, modals, tooltips
- [ ] **Styling Details:** Colors, fonts, borders, shadows
- [ ] **Responsive Behavior:** How it adapts to different screen sizes

**Document findings:**
- Visual structure map
- Component inventory
- Interactive behavior notes
- Styling observations

### Step 1.4: Inspect Rendered HTML Output

**Method 1: Browser DevTools**
1. Add widget to Elementor page
2. Preview page
3. Right-click widget → Inspect Element
4. Copy entire widget HTML structure

**Method 2: View Page Source**
- Look for widget's wrapper class
- Document full DOM hierarchy

**Deliverables:**
- [ ] **Outer wrapper class(es):** `{exact-class-names}`
- [ ] **Inner structure hierarchy:** Document full DOM tree
- [ ] **All CSS classes used:** List all classes (ts-*, vx-*, nvx-*)
- [ ] **Data attributes:** `data-*` attributes and values
- [ ] **SVG icons:** Copy inline SVG markup exactly
- [ ] **HTML structure diagram:** Visual representation

### Step 1.5: Document Elementor Controls

**Read widget PHP file and find `_register_controls()` method:**

```bash
# Read widget file
cat themes/voxel/templates/widgets/{widget-name}.php

# Find controls registration
grep -A 100 "_register_controls" themes/voxel/templates/widgets/{widget-name}.php
```

**Create control inventory table:**

| Control Name | Elementor Type | Default Value | Section | Description |
|--------------|---------------|---------------|---------|-------------|
| {control1} | TEXT | "" | Content | ... |
| {control2} | SELECT | "option1" | Style | ... |
| {control3} | SWITCHER | true | Advanced | ... |

**Common Elementor control types:**
- `TEXT`, `TEXTAREA`, `NUMBER`, `SELECT`, `SELECT2`
- `SWITCHER`, `SLIDER`, `CHOOSE`, `COLOR`
- `ICONS`, `TYPOGRAPHY`, `DIMENSIONS`
- `REPEATER`, `GALLERY`, `MEDIA`

**Deliverables:**
- [ ] Complete control inventory table
- [ ] Control sections identified (Content, Style, Advanced)
- [ ] Default values documented
- [ ] Responsive controls identified (with _tablet, _mobile variants)

### Step 1.6: Identify Data Requirements

**Questions to answer:**

- [ ] **Does widget need server-side data?** (field definitions, post types, user data)
  - YES → Plan REST API endpoint
  - NO → Static vxconfig only

- [ ] **Does widget use Voxel AJAX?** (form submission, data fetching)
  - YES → Document AJAX action names
  - NO → Skip AJAX integration

- [ ] **Does widget have popups/modals?**
  - YES → Use FieldPopup component with React Portal
  - NO → Standard rendering

- [ ] **Does widget use dynamic tags (VoxelScript)?**
  - YES → Use DynamicTagTextControl
  - NO → Standard text controls

**Deliverables:**
- [ ] Data requirements documented
- [ ] REST API endpoint planned (if needed)
- [ ] AJAX actions listed (if applicable)
- [ ] Popup requirements identified

### Step 1.6.5: Analyze Voxel Dynamic Tags / VoxelScript (CRITICAL)

**⚠️ SPECIAL ATTENTION REQUIRED:** Many Voxel widgets use Dynamic Tags (VoxelScript) for dynamic content. This requires special handling.

#### Visual Identification in Screenshots

**Look for these visual indicators:**
- [ ] **Dynamic Tag Button Icon:** Circular gradient icon (blue-to-pink gradient) with white 3D cube/voxel shape in center
- [ ] **"EDIT TAGS" Button:** White text button next to dynamic tag fields
- [ ] **"DISABLE TAGS" Button:** White text button to disable dynamic functionality
- [ ] **Dynamic Tag Syntax:** Text fields showing `@post(id)`, `@user(name)`, `@site(title)`, etc.
- [ ] **Tag Display:** Fields showing dynamic tag syntax instead of static text

**From Screenshots (Images 1 & 2):**
- Template field shows: `@post(id)` - this is a dynamic tag
- "EDIT TAGS" and "DISABLE TAGS" buttons visible
- Icon appears as gradient circle with 3D cube (Image 3)

#### Code Discovery

**Search for dynamic tag usage in widget:**

```bash
# Find dynamic tag controls in widget
grep -r "dynamic.*tag" themes/voxel/templates/widgets/{widget-name}.php
grep -r "DYNAMIC" themes/voxel/templates/widgets/{widget-name}.php
grep -r "@post\|@user\|@site" themes/voxel/templates/widgets/{widget-name}.php

# Find dynamic tag control class
grep -r "class.*Dynamic.*Tag" themes/voxel/app/widgets/
find themes/voxel/app/widgets -name "*dynamic*tag*"
```

**Search for DynamicTagTextControl implementation:**

```bash
# Find shared control
find themes/voxel-fse/app/blocks/src/shared/controls -name "*DynamicTag*"
grep -r "DynamicTagTextControl" themes/voxel-fse/app/blocks/

# Check if control exists
ls themes/voxel-fse/app/blocks/src/shared/controls/DynamicTagTextControl.tsx
```

#### Dynamic Tag Builder UI Components

**Visual Elements to Match:**

1. **Trigger Button Icon:**
   - Circular gradient background (light blue at top → vibrant pink/magenta at bottom)
   - White 3D cube/voxel shape centered
   - Modern, geometric appearance
   - Clickable to open dynamic tag builder

2. **Field Display:**
   - Shows dynamic tag syntax: `@post(id)`, `@user(name)`, etc.
   - Can display static text when tags disabled
   - "EDIT TAGS" button to open builder
   - "DISABLE TAGS" button to convert to static text

3. **Tag Builder Popup:**
   - Opens when trigger button or "EDIT TAGS" clicked
   - Allows selection of data groups (Post, User, Site, Term)
   - Allows selection of fields within groups
   - Supports modifiers (truncate, append, etc.)
   - Generates VoxelScript syntax

#### Implementation Requirements

**If widget uses dynamic tags, you MUST:**

- [ ] **Use DynamicTagTextControl** from `shared/controls/DynamicTagTextControl.tsx`
- [ ] **Match the trigger button icon** exactly (gradient circle with 3D cube)
- [ ] **Implement "EDIT TAGS" functionality** to open tag builder
- [ ] **Implement "DISABLE TAGS" functionality** to convert to static text
- [ ] **Store tag syntax** in attributes (e.g., `@post(id)`)
- [ ] **Render tags dynamically** in frontend using VoxelScript parser
- [ ] **Handle tag parsing** in shared component

#### Attribute Structure

**Dynamic tag attributes should store:**

```typescript
interface BlockAttributes {
  // Dynamic tag field
  template: string;  // Stores: "@post(id)" or static text
  templateIsDynamic: boolean;  // true if using tags, false if static
  // ... other attributes
}
```

#### Deliverables

- [ ] **Dynamic tag usage identified:** List all fields using dynamic tags
- [ ] **Tag syntax documented:** Document all `@group(field)` patterns found
- [ ] **Control locations found:** File paths for DynamicTagTextControl
- [ ] **Icon design documented:** Gradient colors and 3D cube shape details
- [ ] **Button functionality understood:** EDIT TAGS / DISABLE TAGS behavior
- [ ] **VoxelScript parser integration:** How tags are parsed and rendered

**Reference:**
- Dynamic Tag Builder: `docs/voxel-dynamic-tag-builder/`
- VoxelScript Parser: `themes/voxel-fse/app/dynamic-data/parser/`
- Shared Control: `themes/voxel-fse/app/blocks/src/shared/controls/DynamicTagTextControl.tsx`

### Step 1.7: Analyze JavaScript Behavior

**Search for JavaScript/Vue components:**

```bash
# Find Vue components
find themes/voxel/assets/src -name "*{widget-name}*"
grep -r "{widget-name}" themes/voxel/assets/src/

# Find JavaScript mixins
grep -r "mixins.*{widget-name}" themes/voxel/assets/
grep -r "Voxel.mixins" themes/voxel/assets/
```

**Document:**
- [ ] **Event handlers:** (click, submit, change, etc.)
- [ ] **State management:** (form values, UI state)
- [ ] **API interactions:** (AJAX calls, REST requests)
- [ ] **Third-party dependencies:** (TinyMCE, date pickers, maps, etc.)
- [ ] **Vue mixins used:** (popup, blurable, etc.)

### Step 1.8: Read Official Voxel Documentation

```bash
# Find widget documentation
find docs/voxel-documentation -name "*{widget-name}*"
grep -r "{widget-name}" docs/voxel-documentation/
```

**Deliverables:**
- [ ] Documentation file path: `docs/voxel-documentation/docs.getvoxel.io_articles_{widget-name}_.md`
- [ ] Feature specifications documented
- [ ] User-facing behaviors understood
- [ ] Configuration options noted

### Step 1.9: Check for Autoloader Conflicts

**Before creating any files, verify no conflicts:**

```bash
# Check for filename conflicts
ls themes/voxel/app/controllers/{potential-filename}.php
ls themes/voxel/app/{potential-path}/

# Check for path conflicts
find themes/voxel -type d -name "{potential-directory}"
```

**Deliverables:**
- [ ] No filename conflicts with parent theme
- [ ] No path conflicts with parent theme
- [ ] Namespace will be `VoxelFSE\` (not `Voxel\`)
- [ ] Safe file naming strategy confirmed

### Step 1.10: Check Multisite Compatibility Requirements

**CRITICAL:** WordPress multisite installations (especially subdirectory setups) require special URL handling to ensure AJAX requests, redirects, and links work correctly across all sites.

#### Identify URL Construction Patterns

**Search for URL construction in widget:**

```bash
# Find Voxel AJAX endpoints in widget
grep -r "/?vx=1" themes/voxel/templates/widgets/{widget-name}.php
grep -r "voxel.*ajax" themes/voxel/templates/widgets/{widget-name}.php

# Find redirect/link generation
grep -r "window.location" themes/voxel/assets/src/
grep -r "home_url\|get_site_url" themes/voxel/templates/widgets/{widget-name}.php
```

**Identify these patterns:**
- [ ] **Voxel AJAX calls** - Using `/?vx=1&action=...` endpoints
- [ ] **Form submissions** - POSTing to AJAX endpoints
- [ ] **Redirects** - Relative URLs like `/thank-you/` or `/edit-post/`
- [ ] **Edit links** - URLs to edit content (`?vx=1&action=posts.get_edit_post_config`)
- [ ] **PHP URL generation** - `home_url()` vs `get_site_url()`

#### Common Multisite Issues

**Problem 1: Hardcoded AJAX URLs**
```typescript
// BROKEN on multisite subdirectory (e.g., /vx-fse-stays/)
const url = `/?vx=1&action=my_action`;
// Goes to: http://example.com/?vx=1 (main site!)

// CORRECT - Uses getSiteBaseUrl()
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
const url = `${siteBase}/?vx=1&action=my_action`;
// Goes to: http://example.com/vx-fse-stays/?vx=1 (correct subsite!)
```

**Problem 2: Relative URL Redirects**
```typescript
// BROKEN on multisite subdirectory
window.location.href = '/thank-you/';
// Goes to: http://example.com/thank-you/ (main site!)

// CORRECT - Prepends site base
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
window.location.href = siteBase + '/thank-you/';
// Goes to: http://example.com/vx-fse-stays/thank-you/ (correct!)
```

**Problem 3: PHP Edit Links**
```php
// BROKEN on multisite
$edit_link = home_url('?vx=1&action=posts.get_edit_post_config&post_id=' . $post_id);
// Returns main site URL only

// CORRECT - Uses get_site_url()
$site_url = function_exists('get_current_blog_id')
    ? get_site_url(get_current_blog_id())
    : home_url();
$edit_link = $site_url . '?vx=1&action=posts.get_edit_post_config&post_id=' . $post_id;
// Returns correct site URL
```

#### Required Patterns for Multisite

**TypeScript/JavaScript Pattern:**
```typescript
// Import utility
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';

// Build multisite-aware AJAX URL
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
const ajaxUrl = `${siteBase}/?vx=1&action=${action}&param=value`;

// Build multisite-aware redirect URL
let redirectUrl = attributes.redirectAfterSubmit;
if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    // Relative URL - make it multisite-aware
    redirectUrl = siteBase + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);
}
window.location.href = redirectUrl;
```

**PHP Pattern:**
```php
// Multisite-safe URL generation
$site_url = function_exists('get_current_blog_id')
    ? get_site_url(get_current_blog_id())
    : home_url();

$edit_link = $site_url . '?vx=1&action=posts.get_edit_post_config&post_id=' . $post_id;
```

**Why getSiteBaseUrl() Works:**
- Detects site path from WordPress REST API meta tag: `<link rel="https://api.w.org/" href="{site_url}/wp-json/" />`
- Works on single-site, multisite subdomain, and multisite subdirectory
- Handles edge cases like missing trailing slashes
- Location: `themes/voxel-fse/app/blocks/src/shared/utils/siteUrl.ts`

#### Deliverables

- [ ] **AJAX patterns identified:** List all `/?vx=1&action=...` endpoints used
- [ ] **Redirect patterns identified:** List all `window.location` assignments
- [ ] **PHP URL patterns identified:** List all `home_url()` or `get_site_url()` calls
- [ ] **Multisite fixes planned:** Document which patterns need getSiteBaseUrl()
- [ ] **Testing strategy:** Plan to test on multisite subdirectory setup

**Reference:**
- Multisite Guide: `docs/block-conversions/multisite-compatibility-fixes.md`
- Site URL Utility: `themes/voxel-fse/app/blocks/src/shared/utils/siteUrl.ts`
- Timeline Fix Example: Lines 302-306, 396-399 in `timeline/api/voxel-fetch.ts`
- Create Post Fix Example: Lines 383-388, 406-418 in `create-post/hooks/useFormSubmission.ts`

---

## 📋 Phase 2: Implementation Planning

### Step 2.1: Architecture Decision

**Based on discovery, determine:**

- [ ] **Block Type:** Display widget / Form widget / Interactive widget / Styling widget
- [ ] **Data Strategy:** REST API required / Static vxconfig only
- [ ] **Rendering Strategy:** Plan C+ with API / Plan C+ static
- [ ] **Popup Requirements:** FieldPopup needed / Standard rendering

**Reference:** Section 12 (Decision Trees) in master guide

### Step 2.2: Control Mapping Plan

**Map each Elementor control to Gutenberg equivalent:**

| Elementor Control | Gutenberg Control | Shared Control? | Notes |
|-------------------|-------------------|-----------------|-------|
| TEXT | TextControl | No | Standard |
| DYNAMIC | DynamicTagTextControl | Yes | **CRITICAL:** For VoxelScript tags (@post, @user, etc.) |
| SELECT2 | Select2Control or TagMultiSelect | Yes | **Select2Control** for single-select dropdowns with lazy loading, **TagMultiSelect** for multi-select |
| SELECT2 (single) | Select2Control | Yes | Generic dropdown with grouped options, lazy loading, dynamic tags support |
| ICONS | IconPickerControl | Yes | From shared/controls |
| ... | ... | ... | ... |

**⚠️ SPECIAL: Dynamic Tags (DYNAMIC Control Type)**
- **Elementor Control:** `DYNAMIC` or `DYNAMIC_TEXT`
- **Gutenberg Control:** `DynamicTagTextControl` from `shared/controls/DynamicTagTextControl.tsx`
- **Visual Requirements:**
  - Trigger button: Gradient circle (blue→pink) with white 3D cube icon
  - Field display: Shows `@post(id)` syntax or static text
  - Buttons: "EDIT TAGS" and "DISABLE TAGS"
- **Attribute Storage:** Store tag syntax string (e.g., `"@post(id)"`) and boolean flag for dynamic state
- **Frontend Rendering:** Use VoxelScript parser to render dynamic content

**⚠️ SPECIAL: Select2 Control (SELECT2 Control Type for Single-Select)**
- **Elementor Control:** `SELECT2` (single-select dropdown)
- **Gutenberg Control:** `Select2Control` from `shared/controls/Select2Control.tsx`
- **Features:**
  - Generic reusable dropdown with Select2-style UI
  - Grouped options with visual separators
  - Lazy loading via `onFetch` callback prop
  - Single option loading via `onFetchSingle` callback prop
  - Searchable/filterable dropdown
  - Optional dynamic tag support (VoxelScript integration)
  - Uses Voxel CSS classes (inherits from parent theme)
- **Specialized Wrappers:**
  - `TemplateSelectControl` - For FSE template selection (fetches `/wp/v2/templates` and `/wp/v2/template-parts`)
  - Can create `PostSelectControl`, `UserSelectControl`, etc. following same pattern
- **Usage Pattern:**
  ```typescript
  import { Select2Control, TemplateSelectControl } from '../shared/controls';
  
  // For templates (specialized wrapper)
  <TemplateSelectControl
    label={__('Template', 'voxel-fse')}
    value={attributes.templateId}
    onChange={(value) => setAttributes({ templateId: value })}
  />
  
  // For custom data (generic control with callbacks)
  <Select2Control
    label={__('Select Item', 'voxel-fse')}
    value={value}
    onChange={onChange}
    onFetch={async () => fetchGroups()}
    onFetchSingle={async (id) => fetchSingle(id)}
    enableDynamicTags={true}
  />
  ```
- **Reference:** `docs/conversions/print-template/select2-control-implementation-summary.md`

**Reference:** Section 5 (Elementor to Gutenberg Control Mapping) in master guide

### Step 2.3: File Structure Plan

**Plan block directory structure:**

```
{block-name}/
├── block.json              # NO "render", NO "style"
├── index.tsx               # registerBlockType
├── edit.tsx                # InspectorControls + preview
├── save.tsx                # vxconfig JSON + placeholder
├── frontend.tsx            # parseVxConfig + createRoot
├── shared/                 # Shared React components
│   └── {BlockName}Component.tsx
├── hooks/
│   └── useBlockConfig.ts   # REST API hook (if needed)
├── types/
│   └── index.ts            # TypeScript interfaces
└── editor.css              # Editor-only styles
```

**Deliverables:**
- [ ] File structure diagram
- [ ] Component breakdown
- [ ] Hook requirements identified
- [ ] Type definitions planned

---

## 📋 Phase 3: Implementation (Follow Master Guide Templates)

### Step 3.1: Create Block Scaffolding

**Reference:** Section 4 (Phase 2: Block Scaffolding) in master guide

**Actions:**
1. Create block directory structure
2. Create `block.json` (use template from Section 15.1)
3. Create TypeScript interfaces (use template from Section 15.8)
4. Create `index.tsx` entry point (use template from Section 15.2)

**Validation:**
- [ ] `block.json` has NO `"render"` property
- [ ] `block.json` has NO `"style"` property (unless responsive edge case)
- [ ] Block title ends with `(VX)`
- [ ] All attributes defined with types and defaults

### Step 3.2: Implement Inspector Controls

**Reference:** Section 4 (Phase 3: Inspector Controls Implementation) in master guide

**Actions:**
1. Map all Elementor controls to Gutenberg (Section 5)
2. Organize into PanelBody sections
3. Use shared controls from `src/shared/controls/` when available:
   - `DynamicTagTextControl` - For dynamic VoxelScript tags
   - `Select2Control` or `TemplateSelectControl` - For single-select dropdowns
   - `TagMultiSelect` - For multi-select with tags
   - `IconPickerControl` - For icon selection
4. Handle responsive controls with `ResponsiveControl` wrapper

**Validation:**
- [ ] All controls mapped correctly
- [ ] Responsive controls use `_tablet` and `_mobile` suffixes
- [ ] Controls organized into logical sections
- [ ] No unavailable components imported

#### Step 3.2.1: Implement DynamicTagTextControl (If Applicable)

**⚠️ CRITICAL:** If widget uses dynamic tags, implement DynamicTagTextControl with exact visual matching.

**Actions:**
1. **Import DynamicTagTextControl:**
   ```typescript
   import { DynamicTagTextControl } from '@shared/controls/DynamicTagTextControl';
   ```

2. **Add to InspectorControls:**
   ```typescript
   <DynamicTagTextControl
     label={__('Template', 'voxel-fse')}
     value={attributes.template}
     isDynamic={attributes.templateIsDynamic}
     onChange={(value) => setAttributes({ template: value })}
     onDynamicChange={(isDynamic) => setAttributes({ templateIsDynamic: isDynamic })}
   />
   ```

3. **Verify Visual Elements Match:**
   - [ ] **Trigger Button Icon:** Gradient circle (blue→pink) with white 3D cube/voxel shape
   - [ ] **Field Display:** Shows `@post(id)` syntax when dynamic, static text when disabled
   - [ ] **"EDIT TAGS" Button:** Opens dynamic tag builder popup
   - [ ] **"DISABLE TAGS" Button:** Converts dynamic tag to static text
   - [ ] **Icon Design:** Matches Image 3 (gradient circle with 3D cube)

4. **Attribute Structure:**
   ```typescript
   // In block.json attributes
   "template": {
     "type": "string",
     "default": ""
   },
   "templateIsDynamic": {
     "type": "boolean",
     "default": false
   }
   ```

5. **Frontend Rendering:**
   - In shared component, check `templateIsDynamic` flag
   - If dynamic: Use VoxelScript parser to render `@post(id)` → actual value
   - If static: Display `template` value as-is
   - Reference: `themes/voxel-fse/app/dynamic-data/parser/`

**Validation:**
- [ ] DynamicTagTextControl imported correctly
- [ ] Trigger button icon matches gradient design (blue→pink with 3D cube)
- [ ] "EDIT TAGS" button opens tag builder
- [ ] "DISABLE TAGS" button converts to static text
- [ ] Attributes store both tag syntax and dynamic flag
- [ ] Frontend renders tags using VoxelScript parser

**Reference:**
- Dynamic Tag Builder: `docs/voxel-dynamic-tag-builder/`
- VoxelScript Parser: `themes/voxel-fse/app/dynamic-data/parser/`
- Shared Control: `themes/voxel-fse/app/blocks/src/shared/controls/DynamicTagTextControl.tsx`

### Step 3.3: Create Editor Component (edit.tsx)

**Reference:** Section 4 (Phase 4: Editor Component) and Section 15.3 in master guide

**Actions:**
1. Implement REST API hook (if needed) - use template from Section 15.7
2. Create Edit component with InspectorControls
3. Use shared component for preview
4. Handle loading/error/empty states

**Validation:**
- [ ] REST API hook implemented (if needed)
- [ ] Shared component used for preview
- [ ] Loading/error states handled
- [ ] InspectorControls properly organized

### Step 3.4: Implement Save Function (save.tsx)

**Reference:** Section 4 (Phase 5: Save/Database Storage) and Section 15.4 in master guide

**Actions:**
1. Build vxconfig object with ALL attributes
2. Output vxconfig JSON in `<script class="vxconfig">` tag
3. Output placeholder HTML for hydration
4. Use correct wrapper classes

**Validation:**
- [ ] vxconfig includes all frontend-required attributes
- [ ] vxconfig JSON properly formatted
- [ ] Placeholder HTML matches pattern
- [ ] Wrapper classes use Voxel naming (ts-*, vx-*, nvx-*)

### Step 3.5: Create Frontend Hydration (frontend.tsx)

**Reference:** Section 4 (Phase 6: Frontend Hydration) and Section 15.5 in master guide

**Actions:**
1. Implement `parseVxConfig()` function
2. Implement `fetchBlockConfig()` function (if needed)
3. Implement `buildAttributes()` function
4. Implement `initBlocks()` function with createRoot
5. Support Turbo/PJAX navigation

**Validation:**
- [ ] vxconfig parsing works correctly
- [ ] REST API fetching works (if needed)
- [ ] React mounting uses createRoot
- [ ] Double-initialization prevented (data-react-mounted)
- [ ] Turbo/PJAX support added

### Step 3.6: Create Shared Component

**Reference:** Section 15.6 in master guide

**Actions:**
1. Create main shared component
2. Match Voxel HTML structure 1:1
3. Use Voxel CSS classes exactly
4. Re-render vxconfig script tag (CRITICAL for DevTools visibility)
5. Handle editor vs frontend context

**Validation:**
- [ ] HTML structure matches Voxel widget exactly
- [ ] CSS classes use Voxel prefixes (ts-*, vx-*, nvx-*)
- [ ] SVG icons copied inline exactly
- [ ] vxconfig re-rendered in component return
- [ ] TypeScript types properly defined (no `any`)

#### Step 3.6.1: Render Dynamic Tags in Shared Component (If Applicable)

**⚠️ CRITICAL:** If widget uses dynamic tags, you MUST render them using VoxelScript parser.

**Actions:**
1. **Import VoxelScript Parser:**
   ```typescript
   import { renderVoxelScript } from '@dynamic-data/parser';
   // OR use the parser utility from your dynamic-data system
   ```

2. **Check Dynamic Flag:**
   ```typescript
   const renderTemplate = () => {
     if (attributes.templateIsDynamic && attributes.template) {
       // Parse and render dynamic tag (e.g., "@post(id)" → actual post ID)
       return renderVoxelScript(attributes.template, {
         post: currentPost,  // Context data
         user: currentUser,
         site: siteData,
       });
     }
     // Return static text
     return attributes.template;
   };
   ```

3. **Use in Component:**
   ```typescript
   <div className="ts-template-field">
     <span>{renderTemplate()}</span>
   </div>
   ```

4. **Handle Context Data:**
   - Editor: May need mock data or current post context
   - Frontend: Use actual post/user/site data from page context
   - Pass context to parser function

**Validation:**
- [ ] Dynamic tags parsed using VoxelScript parser
- [ ] Static text displayed when `templateIsDynamic === false`
- [ ] Dynamic content rendered when `templateIsDynamic === true`
- [ ] Context data (post, user, site) passed to parser
- [ ] Error handling for invalid tag syntax

**Reference:**
- VoxelScript Parser: `themes/voxel-fse/app/dynamic-data/parser/`
- Data Groups: `themes/voxel-fse/app/dynamic-data/data-groups/`
- Modifiers: `themes/voxel-fse/app/dynamic-data/modifiers/`

### Step 3.7: Create REST API Endpoint (If Needed)

**Reference:** Section 11 (REST API Integration) and Section 15.9 in master guide

**Actions:**
1. Create API controller extending `FSE_Base_Controller`
2. Register REST endpoint with proper permission_callback
3. Fetch data from Voxel APIs
4. Return properly formatted response

**Validation:**
- [ ] Endpoint registered correctly
- [ ] Permission callback set (public vs authenticated)
- [ ] No nonce sent to public endpoints
- [ ] Error handling implemented

### Step 3.8: Configure Build System

**Reference:** Section 8 (Build System Configuration) and Section 15.11 in master guide

**Actions:**
1. Editor build already configured in `vite.blocks.config.js`
2. Create frontend build config (IIFE format)
3. Update package.json scripts
4. Configure externals and globals correctly

**Validation:**
- [ ] Frontend build outputs IIFE format
- [ ] `emptyOutDir: false` set (preserves editor build)
- [ ] External packages configured
- [ ] Globals mapping correct
- [ ] Package.json scripts updated

### Step 3.9: Create Editor Styles (editor.css)

**Reference:** Section 7 (Child Theme Styling Strategy) and Section 15.10 in master guide

**Actions:**
1. Create editor-only styles
2. Style placeholder/loading states
3. Use `.voxel-fse-*` prefixed classes
4. **NEVER** import style.css into editor.css

**Validation:**
- [ ] NO style.css created (unless responsive edge case)
- [ ] editor.css does NOT import style.css
- [ ] Editor styles use scoped prefixes
- [ ] Placeholder styles match pattern

---

## 📋 Phase 4: Validation & Testing

### Step 4.1: Headless Architecture Compliance

**Reference:** Section 13 (Validation Checklist) in master guide

**Check:**
- [ ] NO render.php file exists
- [ ] NO "render" property in block.json
- [ ] NO ServerSideRender component used
- [ ] save.tsx outputs vxconfig JSON correctly
- [ ] save.tsx outputs placeholder HTML
- [ ] frontend.tsx parses vxconfig correctly
- [ ] frontend.tsx mounts React with createRoot
- [ ] Shared component used by both edit.tsx and frontend.tsx
- [ ] Shared component re-renders vxconfig (visible in DevTools)
- [ ] REST API endpoint created (if needed)
- [ ] REST API uses permission_callback

### Step 4.2: Child Theme Styling Compliance

**Check:**
- [ ] NO style.css duplicating Voxel CSS
- [ ] NO custom CSS for Voxel-provided styles
- [ ] NO "style" property in block.json (unless edge case)
- [ ] HTML structure matches Voxel widget 1:1
- [ ] All CSS classes use Voxel names (ts-*, vx-*, nvx-*)
- [ ] SVG icons copied inline exactly
- [ ] editor.css does NOT import style.css

### Step 4.3: TypeScript Strict Mode Compliance

**Check:**
- [ ] NO `any` types used anywhere
- [ ] All interfaces defined properly
- [ ] Generic hooks used for type safety
- [ ] Props interfaces defined for all components
- [ ] Optional properties marked with `?`
- [ ] Nullable values typed as `Type | null`
- [ ] React hooks imported from `'react'` (not `@wordpress/element`)
- [ ] Type guards used for runtime validation
- [ ] Build passes with `strict: true`

### Step 4.4: Functionality Testing

**Test:**
- [ ] Block appears in Gutenberg inserter
- [ ] Block renders preview in editor
- [ ] Inspector controls update attributes
- [ ] Block saves without errors
- [ ] Frontend displays correct HTML structure
- [ ] Frontend React hydration works
- [ ] REST API returns expected data (if applicable)
- [ ] Popups position correctly (if applicable)
- [ ] Form submission works (if applicable)
- [ ] No console errors in editor
- [ ] No console errors on frontend
- [ ] vxconfig visible in DevTools Elements tab

### Step 4.4.1: Dynamic Tags Testing (If Applicable)

**⚠️ CRITICAL:** If widget uses dynamic tags, test thoroughly:

**Test Dynamic Tag Functionality:**
- [ ] DynamicTagTextControl appears in InspectorControls
- [ ] Trigger button icon displays correctly (gradient circle with 3D cube)
- [ ] "EDIT TAGS" button opens dynamic tag builder popup
- [ ] Tag builder allows selection of data groups (Post, User, Site, Term)
- [ ] Tag builder allows selection of fields within groups
- [ ] Tag builder supports modifiers (truncate, append, etc.)
- [ ] "DISABLE TAGS" button converts dynamic tag to static text
- [ ] Field displays `@post(id)` syntax when dynamic
- [ ] Field displays static text when disabled
- [ ] Dynamic tags render correctly in editor preview
- [ ] Dynamic tags render correctly on frontend
- [ ] VoxelScript parser handles tag syntax correctly
- [ ] Context data (post, user, site) passed to parser
- [ ] Error handling for invalid tag syntax works
- [ ] Static text displays when `templateIsDynamic === false`
- [ ] Dynamic content renders when `templateIsDynamic === true`

**Visual Verification:**
- [ ] Trigger button matches Image 3 (gradient blue→pink with white 3D cube)
- [ ] "EDIT TAGS" and "DISABLE TAGS" buttons match screenshots
- [ ] Field display matches Voxel widget appearance
- [ ] Tag builder popup matches Voxel design

**Reference:**
- Screenshots: Images 1, 2, 3 (dynamic tag builder UI)
- Dynamic Tag Builder: `docs/voxel-dynamic-tag-builder/`
- VoxelScript Parser: `themes/voxel-fse/app/dynamic-data/parser/`

### Step 4.5: 1:1 Voxel Matching Verification

**Compare with original widget:**
- [ ] HTML structure matches exactly
- [ ] CSS classes match exactly (including order)
- [ ] DOM hierarchy matches exactly
- [ ] Data attributes match exactly
- [ ] SVG icons match exactly
- [ ] JavaScript behavior matches (if applicable)

### Step 4.6: Multisite Compatibility Testing

**CRITICAL:** Test block on multisite subdirectory setup to ensure AJAX requests, redirects, and links work correctly across all sites.

#### Test Environment Setup

**Multisite Subdirectory (Most Common):**
- Main site: `http://example.com/`
- Subsite: `http://example.com/vx-fse-stays/`
- Test from subsite to verify correct paths

**Multisite Subdomain (Alternative):**
- Main site: `http://example.com/`
- Subsite: `http://stays.example.com/`
- Test from subsite to verify correct domain

#### Critical Tests

**1. AJAX Requests**
- [ ] All AJAX URLs include site path (check Network tab in DevTools)
- [ ] AJAX requests go to correct site (not main site)
- [ ] No 404 errors on AJAX endpoints
- [ ] Response data is correct

**Test Example:**
```
Expected on subsite /vx-fse-stays/:
 http://example.com/vx-fse-stays/?vx=1&action=my_action
 http://example.com/?vx=1&action=my_action (goes to main site!)
```

**2. Redirects**
- [ ] Post-submission redirects go to correct site
- [ ] Relative URLs prepend site path correctly
- [ ] Absolute URLs pass through unchanged
- [ ] User stays within current site after redirect

**3. Edit Links**
- [ ] Edit links stay within current site
- [ ] No cross-site redirects (Site A to Site B)
- [ ] Success messages show correct site-specific URLs
- [ ] View links point to correct site

**4. Form Submissions**
- [ ] Draft save works correctly on subsite
- [ ] Regular submission works correctly on subsite
- [ ] Form POST URLs include site path
- [ ] Response URLs are site-specific

**5. getSiteBaseUrl() Verification**
- [ ] Open browser console on subsite
- [ ] Run: `window.wpApiSettings?.root` or check REST API link in page source
- [ ] Verify site path is detected correctly

**Example verification:**
```html
<!-- Page source should contain: -->
<link rel="https://api.w.org/" href="http://example.com/vx-fse-stays/wp-json/" />
```

#### Browser Console Checks

**Look for these errors (indicates multisite issues):**
- [ ] 404 errors on AJAX requests
- [ ] Requests hitting wrong site (main instead of sub)
- [ ] CORS errors (subdomain misconfiguration)
- [ ] Failed redirects or navigation errors

**Verify these work correctly:**
- [ ] All AJAX requests succeed (200 status)
- [ ] Requests hit correct site/subdomain
- [ ] No console errors
- [ ] getSiteBaseUrl() returns correct path

#### Multisite-Specific Patterns Used

**Verify these patterns are implemented correctly:**

**Pattern 1: AJAX URLs**
```typescript
// MUST use getSiteBaseUrl()
import { getSiteBaseUrl } from '../../shared/utils/siteUrl';
const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
const url = `${siteBase}/?vx=1&action=${action}`;
```

**Pattern 2: Redirects**
```typescript
// MUST prepend site base for relative URLs
let redirectUrl = attributes.redirectAfterSubmit;
if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
    const siteBase = getSiteBaseUrl().replace('?vx=1', '').replace(/\/$/, '');
    redirectUrl = siteBase + (redirectUrl.startsWith('/') ? redirectUrl : '/' + redirectUrl);
}
window.location.href = redirectUrl;
```

**Pattern 3: PHP URLs**
```php
// MUST use get_site_url(get_current_blog_id())
$site_url = function_exists('get_current_blog_id')
    ? get_site_url(get_current_blog_id())
    : home_url();
$edit_link = $site_url . '?vx=1&action=...';
```

#### Deliverables

- [ ] **All AJAX operations work on multisite**
- [ ] **Redirects go to correct site**
- [ ] **Edit links stay within current site**
- [ ] **No 404 errors in Network tab**
- [ ] **No console errors**
- [ ] **getSiteBaseUrl() returns correct path**
- [ ] **Tested on both main site and subsite**
- [ ] **Tested subdirectory setup** (most common)
- [ ] **Tested subdomain setup** (if applicable)

**Reference:**
- Multisite Guide: `docs/block-conversions/multisite-compatibility-fixes.md`
- Timeline Fix: `timeline/api/voxel-fetch.ts` (lines 302-306, 396-399)
- Create Post Fix: `create-post/hooks/useFormSubmission.ts` (lines 383-388, 406-418)

**If multisite tests fail:**
1. Check if getSiteBaseUrl() is imported and used
2. Verify site base is prepended to all AJAX URLs
3. Check relative URLs are converted to absolute
4. Verify PHP uses get_site_url(get_current_blog_id())
5. Test on actual multisite subdirectory setup (not single-site)

---

## 📋 Phase 5: Documentation & Cleanup

### Step 5.1: Update Project Memory

**If new patterns discovered, add to memory:**
- [ ] React Portal usage pattern
- [ ] Popup positioning logic
- [ ] AJAX integration pattern
- [ ] Any widget-specific solutions

### Step 5.2: Document Conversion

**Create conversion documentation:**
- [ ] Widget source location
- [ ] Control mappings
- [ ] HTML structure comparison
- [ ] REST API endpoints (if created)
- [ ] Known issues or limitations

---

## 🎯 Final Checklist

Before marking conversion complete, verify:

### Architecture
- [x] Plan C+ architecture used (NO PHP rendering)
- [x] vxconfig JSON in script tag
- [x] React hydration pattern
- [x] Shared component architecture

### Code Quality
- [x] TypeScript strict mode compliant
- [x] No `any` types
- [x] Proper interfaces defined
- [x] No autoloader conflicts

### Voxel Matching
- [x] HTML structure matches 1:1
- [x] CSS classes match exactly
- [x] JavaScript behavior matches
- [x] SVG icons match exactly

### Functionality
- [x] Editor preview works
- [x] Frontend hydration works
- [x] REST API works (if applicable)
- [x] No console errors
- [x] vxconfig visible in DevTools

### Documentation
- [x] Code comments added
- [x] Type definitions complete
- [x] Conversion documented
- [x] Memory updated (if new patterns)

---

## 📚 Reference Documents

**Always consult these during conversion:**

1. **Master Guide:** `docs/conversions/voxel-widget-conversion-master-guide.md`
   - Complete conversion process
   - Code templates (Section 15)
   - Control mapping (Section 5)
   - Validation checklist (Section 13)

2. **Critical Instructions:** `docs/AI-AGENT-CRITICAL-INSTRUCTIONS.md`
   - Discovery-first methodology
   - 1:1 Voxel matching requirements
   - Autoloader conflict prevention
   - TypeScript strict mode rules

3. **Project Memory:** `.mcp-memory/memory.json`
   - Existing patterns and solutions
   - React Portal implementation
   - Blurable Mixin pattern
   - CSS inheritance rules

4. **Reference Blocks:**
   - `themes/voxel-fse/app/blocks/src/search-form/` - Reference implementation
   - `themes/voxel-fse/app/blocks/src/create-post/` - Reference implementation

5. **Shared Resources:**
   - `themes/voxel-fse/app/blocks/src/shared/controls/` - Reusable controls
     - `DynamicTagTextControl.tsx` - Dynamic tag builder control
     - `Select2Control.tsx` - Generic Select2-style dropdown (single-select)
     - `TemplateSelectControl.tsx` - FSE template picker (wraps Select2Control)
     - `IconPickerControl.tsx` - Icon selection control
     - `TagMultiSelect.tsx` - Multi-select with tags/chips
   - `themes/voxel-fse/app/blocks/src/shared/popup-kit/` - Popup components
   - **Select2Control Reference:** `docs/conversions/print-template/select2-control-implementation-summary.md`

---

## 🚨 Common Pitfalls to Avoid

1. **Skipping Discovery Phase** - Always discover before implementing
2. **Using PHP Rendering** - Plan C+ requires NO PHP rendering
3. **Creating style.css** - Inherit from Voxel parent, don't duplicate
4. **Using `any` Types** - TypeScript strict mode requires proper types
5. **Autoloader Conflicts** - Always check for parent theme conflicts
6. **Not Re-rendering vxconfig** - Shared component must re-render vxconfig
7. **Sending Nonce to Public Endpoints** - Causes "Cookie check failed" error
8. **Importing style.css into editor.css** - Causes conflicts
9. **Not Matching HTML Structure** - Must match Voxel 1:1 for CSS inheritance
10. **Guessing Implementation** - Always find Voxel's actual code first

---

## 💡 Success Criteria

Your conversion is successful when:

✅ **Architecture:** Plan C+ implemented correctly (no PHP rendering)  
✅ **Matching:** HTML structure matches Voxel widget 1:1  
✅ **Functionality:** All features work in editor and frontend  
✅ **Quality:** TypeScript strict mode compliant, no errors  
✅ **Headless:** Compatible with Next.js frontend (no PHP dependencies)  
✅ **Styling:** Inherits from Voxel parent (no CSS duplication)  
✅ **Evidence:** All decisions backed by Voxel code references  

---

**Remember:** The Voxel theme IS the specification. When in doubt, read the Voxel code.

**Last Updated:** December 2025

