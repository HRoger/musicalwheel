# Print Template Widget to Gutenberg Block Conversion Prompt

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Purpose:** Specific conversion prompt for converting the Print Template Voxel Elementor widget to a headless-ready Gutenberg FSE block

---

## 🎯 Conversion Task

Convert the **print-template** Voxel Elementor widget to a Gutenberg FSE block using **Plan C+ architecture** (headless-ready, no PHP rendering).

**Widget Name:** `print-template`  
**Block Name:** `voxel-fse/print-template` (kebab-case)  
**Block Title:** `Print Template (VX)` (must end with `(VX)`)

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
find themes/voxel/templates/widgets -name "*print-template*" -o -name "*print_template*"

# Search for widget references
grep -r "print-template" themes/voxel/templates/widgets/
grep -r "Print Template" themes/voxel/templates/widgets/
```

**Deliverables:**
- [ ] Widget file path: `themes/voxel/templates/widgets/print-template.php`
- [ ] Widget class name: `\Voxel\Widgets\Print_Template`
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
cat themes/voxel/templates/widgets/print-template.php

# Find controls registration
grep -A 100 "_register_controls" themes/voxel/templates/widgets/print-template.php
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
grep -r "dynamic.*tag" themes/voxel/templates/widgets/print-template.php
grep -r "DYNAMIC" themes/voxel/templates/widgets/print-template.php
grep -r "@post\|@user\|@site" themes/voxel/templates/widgets/print-template.php

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
find themes/voxel/assets/src -name "*print-template*"
grep -r "print-template" themes/voxel/assets/src/

# Find JavaScript mixins
grep -r "mixins.*print-template" themes/voxel/assets/
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
find docs/voxel-documentation -name "*print-template*"
grep -r "print-template" docs/voxel-documentation/
```

**Deliverables:**
- [ ] Documentation file path: `docs/voxel-documentation/docs.getvoxel.io_articles_print-template_.md`
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
| SELECT2 | TagMultiSelect | Yes | From shared/controls |
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

**Reference:** Section 5 (Elementor to Gutenberg Control Mapping) in master guide

### Step 2.3: File Structure Plan

**Plan block directory structure:**

```
print-template/
├── block.json              # NO "render", NO "style"
├── index.tsx               # registerBlockType
├── edit.tsx                # InspectorControls + preview
├── save.tsx                # vxconfig JSON + placeholder
├── frontend.tsx            # parseVxConfig + createRoot
├── shared/                 # Shared React components
│   └── PrintTemplateComponent.tsx
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
3. Use shared controls from `src/shared/controls/` when available
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
   - `themes/voxel-fse/app/blocks/src/shared/popup-kit/` - Popup components

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

